import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import {
  buildPublicDocument,
  comparisonReport,
  ensurePreviewOutputPath,
  validateEditorialRelations,
} from '../scripts/export-directus-quotes-preview.mjs';

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function fixtures() {
  const quote = {
    id: 'quote-2',
    legacy_index: 2,
    text: 'Texto público',
    highlight: 'Texto',
    language: 'es',
    quote_type: 'prose',
    author_id: 'author-ejemplo',
    work_id: 'work-ejemplo',
    speaker_display_name: null,
    legacy_attribution: 'Autora',
    legacy_work: 'Obra, Autora',
    text_hash: sha256('Texto público'),
    publication_excluded: false,
    workflow_status: 'draft',
    visibility: 'hidden',
    verification_status: 'verified',
  };
  const original = {
    id: 'original-uuid',
    import_key: 'original-quote-2',
    quote_id: 'quote-2',
    original_text: '  Original text  ',
    language: 'en',
    label: 'Original inglés',
    is_primary: true,
    workflow_status: 'in_review',
    visibility: 'hidden',
    verification_status: 'verified',
  };
  const source = {
    id: 'source-ejemplo',
    verification_status: 'verified',
    rights_status: 'cleared',
  };
  return {
    quotes: [quote],
    originals: [original],
    sources: [source],
    quoteSources: [{
      quote_id: quote.id,
      source_id: source.id,
      relation_role: 'textual_source',
    }],
    originalSources: [{
      quote_original_id: original.id,
      source_id: source.id,
      relation_role: 'original_source',
    }],
  };
}

test('construye exactamente el contrato público sin filtrar campos privados', () => {
  const data = fixtures();
  const document = buildPublicDocument({
    quotes: data.quotes,
    originals: data.originals,
    generatedAt: '2026-08-24T00:00:00.000Z',
  });

  assert.deepEqual(document, {
    schema_version: 1,
    generated_at: '2026-08-24T00:00:00.000Z',
    quote_count: 1,
    quotes: [{
      id: 'quote-2',
      legacy_index: 2,
      t: 'Texto público',
      a: 'Autora',
      obra: 'Obra, Autora',
      highlight: 'Texto',
      lang: 'es',
      type: 'prose',
      authorId: 'author-ejemplo',
      workId: 'work-ejemplo',
      original: {
        text: 'Original text',
        lang: 'en',
        label: 'Original inglés',
      },
    }],
  });
});

test('comprueba fuentes y derechos para frases y originales', () => {
  const data = fixtures();
  assert.doesNotThrow(() => validateEditorialRelations(data));

  data.sources[0].rights_status = 'unchecked';
  assert.throws(() => validateEditorialRelations(data), /no está verificada y despejada/u);
});

test('detecta diferencias por ID o contenido', () => {
  const data = fixtures();
  const document = buildPublicDocument({
    quotes: data.quotes,
    originals: data.originals,
    generatedAt: '2026-08-24T00:00:00.000Z',
  });

  assert.equal(comparisonReport(document, structuredClone(document)).exact, true);
  const changed = structuredClone(document);
  changed.quotes[0].t = 'Texto diferente';
  assert.deepEqual(comparisonReport(document, changed).changed, ['quote-2']);
});

test('impide que la vista previa escriba fuera de /tmp', () => {
  assert.equal(
    ensurePreviewOutputPath('/tmp/paramo-preview.json'),
    '/tmp/paramo-preview.json',
  );
  assert.throws(
    () => ensurePreviewOutputPath('/srv/paramoliterario/source/public/data/quotes.json'),
    /solo puede escribirse dentro de \/tmp/u,
  );
});
