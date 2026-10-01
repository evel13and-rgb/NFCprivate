import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import {
  collectionDefinitions,
  ensureLoopbackDirectusUrl,
  normalizePatch,
  parseCookies,
  prepareEditorialUpdate,
} from '../server/editorialServer.js';

test('el panel solo acepta un Directus local', () => {
  assert.equal(ensureLoopbackDirectusUrl('http://127.0.0.1:8055/'), 'http://127.0.0.1:8055');
  assert.equal(ensureLoopbackDirectusUrl('http://localhost:8055'), 'http://localhost:8055');
  assert.throws(
    () => ensureLoopbackDirectusUrl('https://cms.example.com'),
    /no local/u,
  );
});

test('las cookies se separan sin confundir valores codificados', () => {
  assert.deepEqual(parseCookies('uno=1; sesion=abc%2F123; vacia='), {
    uno: '1',
    sesion: 'abc/123',
    vacia: '',
  });
  assert.deepEqual(parseCookies('rota=%E0%A4%A'), { rota: '%E0%A4%A' });
});

test('editar un fragmento recalcula su huella y la presencia de saltos', () => {
  const text = 'Primera línea\nSegunda línea';
  const result = normalizePatch('quotes', { text }, 'user-1');
  assert.equal(result.text_hash, createHash('sha256').update(text).digest('hex'));
  assert.equal(result.has_line_breaks, true);
});

test('aprobar o verificar deja constancia de la persona revisora', () => {
  const result = normalizePatch('quotes', {
    workflow_status: 'approved',
    verification_status: 'verified',
  }, 'user-1');
  assert.equal(result.reviewer_id, 'user-1');
  assert.match(result.reviewed_at, /^\d{4}-\d{2}-\d{2}T/u);
});

test('el servidor rechaza campos y estados fuera del contrato del panel', () => {
  assert.throws(
    () => normalizePatch('quotes', { legacy_index: 999 }),
    /no puede editarse/u,
  );
  assert.throws(
    () => normalizePatch('quotes', { workflow_status: 'published' }),
    /Valor no válido/u,
  );
  assert.throws(
    () => normalizePatch('quote_originals', { original_text: '   ' }),
    /no puede quedar vacío/u,
  );
});

test('el historial de publicaciones se mantiene de solo lectura', () => {
  assert.equal(collectionDefinitions.publication_runs.patchFields.size, 0);
});

test('una modificación textual aprobada vuelve a revisión y pierde la verificación', () => {
  const current = {
    text: 'Texto anterior',
    workflow_status: 'approved',
    verification_status: 'verified',
  };
  const result = prepareEditorialUpdate('quotes', current, { text: 'Texto corregido' }, 'user-1');
  assert.equal(result.reviewReset, true);
  assert.equal(result.changes.workflow_status, 'in_review');
  assert.equal(result.changes.verification_status, 'pending');
  assert.match(result.changes.text_hash, /^[a-f0-9]{64}$/u);
});

test('una aprobación explícita puede acompañar la corrección editorial', () => {
  const current = {
    text: 'Texto anterior',
    workflow_status: 'in_review',
    verification_status: 'pending',
  };
  const result = prepareEditorialUpdate('quotes', current, {
    text: 'Texto corregido',
    workflow_status: 'approved',
    verification_status: 'verified',
  }, 'user-1');
  assert.equal(result.reviewReset, false);
  assert.equal(result.changes.workflow_status, 'approved');
  assert.equal(result.changes.verification_status, 'verified');
  assert.equal(result.changes.reviewer_id, 'user-1');
});

test('un formulario sin cambios no provoca una escritura', () => {
  assert.throws(
    () => prepareEditorialUpdate('authors', {
      display_name: 'Mary Shelley',
    }, {
      display_name: 'Mary Shelley',
    }),
    /No hay cambios/u,
  );
});
