import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
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
  }));
  assert.equal(result.source, 'public-json');
  assert.equal(result.error, null);
  assert.deepEqual(result.quotes, sampleQuotes);
});

test('usa las frases embebidas si falla el fetch o la validación', async () => {
  const networkFailure = await loadPublicQuotes('/public/data/quotes.json', sampleQuotes, async () => {
    throw new Error('sin red');
  });
  assert.equal(networkFailure.source, 'embedded-fallback');
  assert.strictEqual(networkFailure.quotes, sampleQuotes);

  const invalidDocument = await loadPublicQuotes('/public/data/quotes.json', sampleQuotes, async () => ({
    ok: true,
    json: async () => ({ schema_version: 1, quote_count: 0, quotes: [] }),
  }));
  assert.equal(invalidDocument.source, 'embedded-fallback');
  assert.strictEqual(invalidDocument.quotes, sampleQuotes);
});

test('resuelve primero id estable y conserva compatibilidad con legacy_index e índice antiguo', () => {
  assert.equal(findStoredQuoteIndex(sampleQuotes, { stableQuoteId: 'quote-12', lastQuoteId: 7 }), 1);
  assert.equal(findStoredQuoteIndex(sampleQuotes, { lastQuoteId: 12 }), 1);
  assert.equal(findStoredQuoteIndex(sampleQuotes, { lastQuoteId: 0 }), 0);
  assert.equal(findStoredQuoteIndex(sampleQuotes, { stableQuoteId: 'quote-missing', lastQuoteId: 99 }), -1);
});

test('public/data/quotes.json cumple el contrato público y contiene 590 frases', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = validatePublicQuotesDocument(document, 590);
  assert.equal(quotes.length, 590);
  assert.equal(new Set(quotes.map(quote => quote.id)).size, 590);
  assert.equal(new Set(quotes.map(quote => quote.legacy_index)).size, 590);
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
  const checked = validatePublicQuotesDocument(generated, 590);
  assert.equal(checked[0].id, `quote-${checked[0].legacy_index}`);
});
