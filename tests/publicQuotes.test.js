import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createMemoryStorage, createQuoteManager } from '../quoteLogic.js';
import {
  EMERGENCY_QUOTES,
  findStoredQuoteIndex,
  loadPublicQuotes,
  validatePublicQuotesDocument,
} from '../publicQuotes.js';

const sampleQuotes = [
  {
    id: 'quote-7', legacy_index: 7, t: 'Texto', a: 'Autor', obra: 'Obra, Autor',
    highlight: null, lang: 'es', type: 'prose', authorId: 'author-autor', workId: 'work-obra',
  },
  {
    id: 'quote-12', legacy_index: 12, t: 'Otro texto', a: 'Autora', obra: 'Otra obra, Autora',
    highlight: 'Otro', lang: 'es', type: 'prose', authorId: 'author-autora', workId: 'work-otra',
  },
];

function documentFor(quotes = sampleQuotes) {
  return { schema_version: 1, generated_at: new Date().toISOString(), quote_count: quotes.length, quotes };
}

test('valida y carga quotes.json correctamente', async () => {
  const result = await loadPublicQuotes('/public/data/quotes.json', sampleQuotes, async () => ({
    ok: true,
    json: async () => documentFor(),
  }), sampleQuotes.length);
  assert.equal(result.source, 'public-json');
  assert.equal(result.error, null);
  assert.deepEqual(result.quotes, sampleQuotes);
});

test('original es opcional y solo admite sus tres campos públicos', () => {
  assert.doesNotThrow(() => validatePublicQuotesDocument(documentFor(), sampleQuotes.length));
  const withOriginal = structuredClone(sampleQuotes);
  withOriginal[0].original = { text: 'Test fixture text', lang: 'en', label: 'Original inglés' };
  assert.doesNotThrow(() => validatePublicQuotesDocument(documentFor(withOriginal), withOriginal.length));
  withOriginal[0].original.status = 'reviewed';
  assert.throws(
    () => validatePublicQuotesDocument(documentFor(withOriginal), withOriginal.length),
    /campos no públicos/,
  );
});

test('usa el fallback indicado si falla el fetch o la validación', async () => {
  const networkFailure = await loadPublicQuotes('/public/data/quotes.json', sampleQuotes, async () => {
    throw new Error('sin red');
  });
  assert.equal(networkFailure.source, 'emergency-fallback');
  assert.strictEqual(networkFailure.quotes, sampleQuotes);

  const invalidDocument = await loadPublicQuotes('/public/data/quotes.json', sampleQuotes, async () => ({
    ok: true,
    json: async () => ({ schema_version: 1, quote_count: 0, quotes: [] }),
  }), sampleQuotes.length);
  assert.equal(invalidDocument.source, 'emergency-fallback');
  assert.strictEqual(invalidDocument.quotes, sampleQuotes);
});

test('el fallback de emergencia es mínimo, válido y conserva IDs estables', () => {
  assert.equal(EMERGENCY_QUOTES.length, 3);
  const fallbackDocument = documentFor(EMERGENCY_QUOTES);
  assert.doesNotThrow(() => validatePublicQuotesDocument(fallbackDocument, 3));
  assert.equal(new Set(EMERGENCY_QUOTES.map(quote => quote.id)).size, 3);
});

test('createQuoteManager recibe y devuelve el dataset público validado', async () => {
  const result = await loadPublicQuotes('/public/data/quotes.json', sampleQuotes, async () => ({
    ok: true,
    json: async () => documentFor(),
  }), sampleQuotes.length);
  const manager = createQuoteManager(result.quotes, createMemoryStorage(), () => 0);
  const selected = manager.next();
  assert.equal(selected.id, sampleQuotes[0].id);
  assert.equal(selected.legacy_index, sampleQuotes[0].legacy_index);
});

test('resuelve primero id estable y conserva compatibilidad con legacy_index e índice antiguo', () => {
  assert.equal(findStoredQuoteIndex(sampleQuotes, { stableQuoteId: 'quote-12', lastQuoteId: 7 }), 1);
  assert.equal(findStoredQuoteIndex(sampleQuotes, { lastQuoteId: 12 }), 1);
  assert.equal(findStoredQuoteIndex(sampleQuotes, { lastQuoteId: 0 }), 0);
  assert.equal(findStoredQuoteIndex(sampleQuotes, { stableQuoteId: 'quote-missing', lastQuoteId: 99 }), -1);
});

test('public/data/quotes.json cumple el contrato público y contiene 640 frases', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = validatePublicQuotesDocument(document, 640);
  assert.equal(quotes.length, 640);
  assert.equal(new Set(quotes.map(quote => quote.id)).size, 640);
  assert.equal(new Set(quotes.map(quote => quote.legacy_index)).size, 640);
  assert.equal(quotes.filter(quote => quote.original !== undefined).length, 0);
  for (const fallbackQuote of EMERGENCY_QUOTES) {
    assert.deepEqual(fallbackQuote, quotes.find(quote => quote.id === fallbackQuote.id));
  }
});

test('build-public-quotes cruza originales revisados sin publicar campos editoriales', async () => {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'paramo-public-original-test-'));
  await mkdir(path.join(temporaryRoot, 'scripts'), { recursive: true });
  await cp(new URL('../scripts/build-public-quotes.mjs', import.meta.url), path.join(temporaryRoot, 'scripts/build-public-quotes.mjs'));
  await cp(new URL('../data/editorial', import.meta.url), path.join(temporaryRoot, 'data/editorial'), { recursive: true });
  await writeFile(
    path.join(temporaryRoot, 'data/editorial/originals.manual.json'),
    `${JSON.stringify({
      schema_version: 1,
      items: [{
        quote_id: 'quote-2',
        original_text: 'Test fixture original.',
        original_lang: 'en',
        status: 'reviewed',
      }],
    })}\n`,
  );
  const result = spawnSync(process.execPath, ['scripts/build-public-quotes.mjs'], {
    cwd: temporaryRoot,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  const generated = JSON.parse(await readFile(path.join(temporaryRoot, 'public/data/quotes.json'), 'utf8'));
  assert.deepEqual(generated.quotes.find(quote => quote.id === 'quote-2').original, {
    text: 'Test fixture original.',
    lang: 'en',
    label: 'Original inglés',
  });
  assert.doesNotMatch(JSON.stringify(generated), /original_text|original_lang|reviewed/);
});

test('build-public-quotes rechaza un quote_id original inexistente', async () => {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'paramo-invalid-original-test-'));
  await mkdir(path.join(temporaryRoot, 'scripts'), { recursive: true });
  await cp(new URL('../scripts/build-public-quotes.mjs', import.meta.url), path.join(temporaryRoot, 'scripts/build-public-quotes.mjs'));
  await cp(new URL('../data/editorial', import.meta.url), path.join(temporaryRoot, 'data/editorial'), { recursive: true });
  await writeFile(
    path.join(temporaryRoot, 'data/editorial/originals.manual.json'),
    `${JSON.stringify({
      schema_version: 1,
      items: [{
        quote_id: 'quote-999999',
        original_text: 'Test fixture original.',
        original_lang: 'en',
        status: 'reviewed',
      }],
    })}\n`,
  );
  const result = spawnSync(process.execPath, ['scripts/build-public-quotes.mjs'], {
    cwd: temporaryRoot,
    encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /quote_id no existe en el catálogo/);
});

test('build-public-quotes genera un runtime equivalente desde la capa editorial', async () => {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'paramo-public-quotes-test-'));
  await mkdir(path.join(temporaryRoot, 'scripts'), { recursive: true });
  await cp(new URL('../scripts/build-public-quotes.mjs', import.meta.url), path.join(temporaryRoot, 'scripts/build-public-quotes.mjs'));
  await cp(new URL('../data/editorial', import.meta.url), path.join(temporaryRoot, 'data/editorial'), { recursive: true });
  const result = spawnSync(process.execPath, ['scripts/build-public-quotes.mjs'], {
    cwd: temporaryRoot,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  const generated = JSON.parse(await readFile(path.join(temporaryRoot, 'public/data/quotes.json'), 'utf8'));
  const checked = validatePublicQuotesDocument(generated, 640);
  assert.equal(checked[0].id, `quote-${checked[0].legacy_index}`);
});

test('script.js ya no contiene el catálogo completo ni colecciones literarias', async () => {
  const source = await readFile(new URL('../script.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /const\s+[A-Z0-9_]+_QUOTES\s*=\s*\[/);
  assert.doesNotMatch(source, /const\s+QUOTES\s*=\s*\[/);
  assert.match(source, /loadPublicQuotes\('\.\/public\/data\/quotes\.json\?v=5'\)/);
});
