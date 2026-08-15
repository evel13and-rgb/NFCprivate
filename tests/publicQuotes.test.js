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
  const quotesWithOriginal = quotes.filter(quote => quote.original !== undefined);
  assert.deepEqual(quotesWithOriginal.map(quote => quote.id), [
    'quote-4', 'quote-5', 'quote-6', 'quote-7', 'quote-8',
    'quote-9', 'quote-10',
    'quote-11', 'quote-12', 'quote-13', 'quote-14', 'quote-15',
    'quote-16', 'quote-17', 'quote-18', 'quote-19', 'quote-20',
    'quote-21', 'quote-22', 'quote-23', 'quote-24', 'quote-25',
    'quote-26', 'quote-27', 'quote-28', 'quote-29', 'quote-30',
    'quote-31', 'quote-32', 'quote-33', 'quote-34', 'quote-35',
    'quote-36',
    'quote-37', 'quote-38', 'quote-39', 'quote-40', 'quote-41',
    'quote-42', 'quote-43', 'quote-44', 'quote-45', 'quote-46',
    'quote-47', 'quote-48', 'quote-49', 'quote-50', 'quote-51',
    'quote-52', 'quote-53', 'quote-54', 'quote-55', 'quote-56',
    'quote-57', 'quote-58', 'quote-59', 'quote-60', 'quote-61',
    'quote-62', 'quote-63', 'quote-64', 'quote-65',
    'quote-79', 'quote-80', 'quote-81', 'quote-82', 'quote-83',
    'quote-84', 'quote-85', 'quote-86', 'quote-87', 'quote-88',
    'quote-89', 'quote-90', 'quote-91', 'quote-92', 'quote-93',
    'quote-94',
    'quote-95', 'quote-96', 'quote-97', 'quote-98', 'quote-99',
    'quote-100', 'quote-101', 'quote-102', 'quote-103', 'quote-104',
    'quote-105', 'quote-106', 'quote-107', 'quote-108', 'quote-109',
    'quote-110', 'quote-111', 'quote-112', 'quote-113', 'quote-114',
    'quote-115', 'quote-116', 'quote-117',
    'quote-176', 'quote-177', 'quote-178', 'quote-179', 'quote-180',
    'quote-181', 'quote-182', 'quote-183', 'quote-184', 'quote-185',
    'quote-186', 'quote-187', 'quote-188', 'quote-189', 'quote-190',
    'quote-191', 'quote-192', 'quote-193', 'quote-194', 'quote-195',
    'quote-196', 'quote-197', 'quote-198', 'quote-199', 'quote-200',
    'quote-201', 'quote-202', 'quote-203', 'quote-204', 'quote-205',
    'quote-206', 'quote-207', 'quote-208', 'quote-209', 'quote-210',
    'quote-211', 'quote-212', 'quote-213', 'quote-214', 'quote-215',
    'quote-216', 'quote-217', 'quote-218', 'quote-219', 'quote-220',
    'quote-221', 'quote-222', 'quote-223', 'quote-224', 'quote-225',
    'quote-226', 'quote-227', 'quote-228', 'quote-229', 'quote-230',
    'quote-231', 'quote-232', 'quote-233',
    'quote-247', 'quote-248', 'quote-249', 'quote-250', 'quote-251',
    'quote-252', 'quote-253', 'quote-254', 'quote-255', 'quote-256',
    'quote-257', 'quote-258',
    'quote-259', 'quote-260', 'quote-261', 'quote-262', 'quote-263',
    'quote-264', 'quote-265', 'quote-266', 'quote-267', 'quote-268',
    'quote-269', 'quote-270', 'quote-271', 'quote-272', 'quote-273',
    'quote-274', 'quote-275', 'quote-276', 'quote-277', 'quote-278',
    'quote-279',
    'quote-280', 'quote-281', 'quote-282', 'quote-283', 'quote-284',
    'quote-285', 'quote-286', 'quote-287', 'quote-288', 'quote-289',
    'quote-290', 'quote-291', 'quote-292', 'quote-293', 'quote-294',
    'quote-295', 'quote-296', 'quote-297',
    'quote-298', 'quote-299', 'quote-300', 'quote-301', 'quote-302',
    'quote-303', 'quote-304', 'quote-305', 'quote-306', 'quote-307',
    'quote-308', 'quote-309', 'quote-310', 'quote-311', 'quote-312',
    'quote-313', 'quote-314', 'quote-315', 'quote-316', 'quote-317',
    'quote-318', 'quote-319', 'quote-320', 'quote-321', 'quote-322',
    'quote-323', 'quote-324', 'quote-325', 'quote-326', 'quote-327',
    'quote-328', 'quote-329', 'quote-330', 'quote-331', 'quote-332',
    'quote-333', 'quote-334', 'quote-335', 'quote-336', 'quote-337',
    'quote-338', 'quote-339', 'quote-340', 'quote-341', 'quote-342',
    'quote-343', 'quote-344', 'quote-345', 'quote-346', 'quote-347',
    'quote-348', 'quote-349',
    'quote-494', 'quote-495', 'quote-496', 'quote-497', 'quote-498',
    'quote-499', 'quote-500', 'quote-501', 'quote-502', 'quote-503',
    'quote-504', 'quote-505', 'quote-506', 'quote-507', 'quote-508',
    'quote-509', 'quote-510', 'quote-511', 'quote-512', 'quote-513',
    'quote-514', 'quote-515', 'quote-516', 'quote-517', 'quote-518',
    'quote-519', 'quote-520', 'quote-521', 'quote-522', 'quote-523',
    'quote-524', 'quote-525',
    'quote-526', 'quote-527', 'quote-528', 'quote-529', 'quote-530',
    'quote-531', 'quote-532', 'quote-533', 'quote-534', 'quote-535',
    'quote-536', 'quote-537', 'quote-538', 'quote-539', 'quote-540',
    'quote-541', 'quote-542', 'quote-543', 'quote-544', 'quote-545',
    'quote-546', 'quote-547', 'quote-548', 'quote-549', 'quote-550',
    'quote-551', 'quote-552', 'quote-553', 'quote-554', 'quote-555',
    'quote-556', 'quote-557', 'quote-558', 'quote-559', 'quote-560',
    'quote-561',
    'quote-600', 'quote-601', 'quote-602', 'quote-603', 'quote-604',
    'quote-605', 'quote-606', 'quote-607', 'quote-608', 'quote-609',
    'quote-610', 'quote-611', 'quote-612', 'quote-613', 'quote-614',
    'quote-615',
    'quote-616', 'quote-617', 'quote-618', 'quote-619', 'quote-620',
    'quote-621', 'quote-622', 'quote-623', 'quote-624', 'quote-625',
    'quote-626', 'quote-627', 'quote-628', 'quote-629', 'quote-630',
    'quote-631', 'quote-632', 'quote-633', 'quote-634', 'quote-635',
    'quote-636', 'quote-637', 'quote-638', 'quote-639', 'quote-640',
    'quote-641',
  ]);
  assert.equal(quotesWithOriginal.every(quote => (
    quote.original.text.trim() && quote.original.lang.trim() && quote.original.label.trim()
  )), true);
  assert.doesNotMatch(JSON.stringify(quotesWithOriginal), /source_note|original_text|original_lang|reviewed/);
  for (const fallbackQuote of EMERGENCY_QUOTES) {
    const { original, ...publicQuoteWithoutOriginal } = quotes.find(quote => quote.id === fallbackQuote.id);
    assert.deepEqual(fallbackQuote, publicQuoteWithoutOriginal);
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

test('El idiota conserva los límites y omisiones restaurados por la segunda auditoría', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));

  assert.match(quotes.get('quote-621').t, /más querido aún, tanto que empecé a notarlo/);
  assert.match(quotes.get('quote-621').original.text, /^потом /);
  assert.match(quotes.get('quote-626').t, /la llevaron hasta ella, se la dieron y vinieron/);
  assert.match(quotes.get('quote-627').t, /y que siempre lo harían\.$/);
  assert.match(quotes.get('quote-627').original.text, /и всегда так будут\.$/);
  assert.match(quotes.get('quote-630').t, /mueca maliciosa\)\. ¡Je, je!/);
  assert.match(quotes.get('quote-631').t, /^Pensó, entre otras cosas, que/);
  assert.match(quotes.get('quote-636').original.text, /^всё это было натурально/);
  assert.match(quotes.get('quote-637').t, /—empecé yo—/);
  assert.match(quotes.get('quote-640').t, /lo vieron todos sus discípulos.*lo vieron las mujeres/);
  assert.match(quotes.get('quote-640').original.text, /когда не победил/);
  assert.match(quotes.get('quote-640').original.text, /которой воскликнул/);
  assert.doesNotMatch(quotes.get('quote-640').original.text, /�/);
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
  const shareSnapshotSource = source.slice(
    source.indexOf('function getQuoteCardSnapshot()'),
    source.indexOf('function getSnapshotShareText'),
  );
  const voiceSource = source.slice(
    source.indexOf('function getQuoteVoiceText()'),
    source.indexOf('function updateListenVoiceButton'),
  );
  assert.match(shareSnapshotSource, /currentQuote\?\.t/);
  assert.doesNotMatch(shareSnapshotSource, /original/);
  assert.match(voiceSource, /currentQuote\?\.t/);
  assert.doesNotMatch(voiceSource, /original/);
});
