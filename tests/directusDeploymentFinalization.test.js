import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { validatePublicDocument } from '../scripts/export-directus-quotes-preview.mjs';
import {
  validateFinalizeConfirmations,
  validateProductionRun,
} from '../scripts/finalize-directus-quotes-deployment.mjs';
import { sha256, verifyDeployedJson } from '../scripts/lib/verify-deployed-json.mjs';

function publicText() {
  return `${JSON.stringify({
    schema_version: 1,
    generated_at: '2026-08-25T00:00:00.000Z',
    quote_count: 1,
    quotes: [{
      id: 'quote-1',
      legacy_index: 1,
      t: 'Texto',
      a: 'Autora',
      obra: 'Obra, Autora',
      highlight: null,
      lang: 'es',
      type: 'prose',
      authorId: 'author-1',
      workId: 'work-1',
    }],
  }, null, 2)}\n`;
}

test('verifica la copia versionada, desplegada y servida', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'paramo-finalize-'));
  const sourcePath = path.join(directory, 'source.json');
  const deployedPath = path.join(directory, 'deployed.json');
  const text = publicText();
  await writeFile(sourcePath, text, 'utf8');
  await writeFile(deployedPath, text, 'utf8');

  const verification = await verifyDeployedJson({
    deployedPath,
    expectedQuoteCount: 1,
    expectedSha: sha256(text),
    fetchImpl: async () => new Response(text, {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
    servedUrl: 'https://example.invalid/quotes.json',
    sourcePath,
    validateDocument: validatePublicDocument,
  });
  assert.equal(verification.source_sha256, sha256(text));
  assert.equal(verification.deployed_sha256, sha256(text));
  assert.equal(verification.served_sha256, sha256(text));
});

test('bloquea la finalización si la respuesta HTTPS es distinta', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'paramo-finalize-fail-'));
  const sourcePath = path.join(directory, 'source.json');
  const deployedPath = path.join(directory, 'deployed.json');
  const text = publicText();
  const different = text.replace('Texto', 'Texto cambiado');
  await writeFile(sourcePath, text, 'utf8');
  await writeFile(deployedPath, text, 'utf8');

  await assert.rejects(verifyDeployedJson({
    deployedPath,
    expectedQuoteCount: 1,
    expectedSha: sha256(text),
    fetchImpl: async () => new Response(different, { status: 200 }),
    servedUrl: 'https://example.invalid/quotes.json',
    sourcePath,
    validateDocument: validatePublicDocument,
  }), /served: hash inesperado/u);
});

test('solo acepta ejecuciones de producción preparadas o publicadas', () => {
  const run = {
    environment: 'production',
    status: 'validated',
    schema_version: 1,
    artifact_hashes: { staged_quotes_sha256: 'a'.repeat(64) },
    entity_counts: { quotes: 640 },
    errors: [],
  };
  assert.deepEqual(validateProductionRun(run), []);
  run.environment = 'preview';
  assert.match(validateProductionRun(run)[0], /production/u);
});

test('exige confirmación del run, acción y hash desplegado', () => {
  const options = {
    runId: 'run-1',
    confirmRun: 'run-1',
    confirmAction: 'FINALIZE_QUOTES',
    confirmDeployedSha: 'a'.repeat(64),
  };
  assert.deepEqual(validateFinalizeConfirmations(options, 'a'.repeat(64)), []);
  options.confirmRun = 'run-2';
  assert.match(validateFinalizeConfirmations(options, 'a'.repeat(64))[0], /confirm-run/u);
});
