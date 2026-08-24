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
    'quote-2', 'quote-3',
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
    'quote-66', 'quote-67', 'quote-68', 'quote-69', 'quote-70',
    'quote-71', 'quote-72', 'quote-73', 'quote-74', 'quote-75',
    'quote-76', 'quote-77', 'quote-78',
    'quote-79', 'quote-80', 'quote-81', 'quote-82', 'quote-83',
    'quote-84', 'quote-85', 'quote-86', 'quote-87', 'quote-88',
    'quote-89', 'quote-90', 'quote-91', 'quote-92', 'quote-93',
    'quote-94',
    'quote-95', 'quote-96', 'quote-97', 'quote-98', 'quote-99',
    'quote-100', 'quote-101', 'quote-102', 'quote-103', 'quote-104',
    'quote-105', 'quote-106', 'quote-107', 'quote-108', 'quote-109',
    'quote-110', 'quote-111', 'quote-112', 'quote-113', 'quote-114',
    'quote-115', 'quote-116', 'quote-117',
    'quote-118', 'quote-119', 'quote-120', 'quote-121', 'quote-122',
    'quote-123', 'quote-124', 'quote-125', 'quote-126', 'quote-127',
    'quote-128', 'quote-129', 'quote-130', 'quote-131', 'quote-132',
    'quote-133', 'quote-134', 'quote-135', 'quote-136', 'quote-137',
    'quote-138', 'quote-139', 'quote-140', 'quote-141', 'quote-142',
    'quote-143', 'quote-144', 'quote-145',
    'quote-146', 'quote-147', 'quote-148', 'quote-149', 'quote-150',
    'quote-151', 'quote-152', 'quote-153', 'quote-154', 'quote-155',
    'quote-156', 'quote-157', 'quote-158', 'quote-159', 'quote-160',
    'quote-161', 'quote-162', 'quote-163', 'quote-164', 'quote-165',
    'quote-166', 'quote-167', 'quote-168', 'quote-169', 'quote-170',
    'quote-171', 'quote-172', 'quote-173', 'quote-174', 'quote-175',
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
    'quote-234', 'quote-235', 'quote-236', 'quote-237', 'quote-238',
    'quote-239', 'quote-240', 'quote-241', 'quote-242', 'quote-243',
    'quote-244', 'quote-245', 'quote-246',
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
    'quote-350', 'quote-351', 'quote-352', 'quote-353', 'quote-354',
    'quote-355', 'quote-356', 'quote-357', 'quote-358', 'quote-359',
    'quote-360', 'quote-361', 'quote-362', 'quote-363', 'quote-364',
    'quote-365', 'quote-366', 'quote-367', 'quote-368', 'quote-369',
    'quote-370', 'quote-371', 'quote-372',
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
    'quote-562', 'quote-563', 'quote-564', 'quote-565', 'quote-566',
    'quote-567', 'quote-568', 'quote-569', 'quote-570', 'quote-571',
    'quote-572', 'quote-573', 'quote-574', 'quote-575', 'quote-576',
    'quote-577', 'quote-578', 'quote-579', 'quote-580', 'quote-581',
    'quote-582', 'quote-583', 'quote-584', 'quote-585', 'quote-586',
    'quote-587', 'quote-588', 'quote-589',
    'quote-590', 'quote-591', 'quote-592', 'quote-593', 'quote-594',
    'quote-595', 'quote-596', 'quote-597', 'quote-598', 'quote-599',
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

test('Cumbres borrascosas publica la primera edición y marca sus recortes internos', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const profiles = JSON.parse(await readFile(new URL('../public/data/literary-profiles.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const bronteQuotes = document.quotes.filter(quote => quote.workId === 'work-cumbres-borrascosas');
  const workProfile = profiles.works.find(profile => profile.work_id === 'work-cumbres-borrascosas');

  assert.equal(bronteQuotes.length, 2);
  assert.ok(bronteQuotes.every(quote => quote.original?.lang === 'en'));
  assert.ok(bronteQuotes.every(quote => quote.original?.label === 'Original inglés'));
  assert.match(quotes.get('quote-2').original.text, /^I've dreamt in my life dreams/);
  assert.equal(quotes.get('quote-2').original.text.match(/\[…\]/g)?.length, 2);
  assert.equal(quotes.get('quote-2').t.match(/\[…\]/g)?.length, 2);
  assert.match(quotes.get('quote-2').original.text, /Linton's is as different as a moonbeam from lightning/);
  assert.match(quotes.get('quote-2').t, /la de Linton es tan diferente/);
  assert.match(quotes.get('quote-2').t, /como tampoco yo soy siempre un placer para mí misma/);
  assert.doesNotMatch(quotes.get('quote-2').t, /Si me caso con Linton|cómo puedo vivir sin mi alma/);
  assert.match(quotes.get('quote-3').original.text, /Universe would turn to a mighty stranger/);
  assert.match(quotes.get('quote-3').t, /Universo se convertiría en un inmenso desconocido/);
  assert.match(quotes.get('quote-3').t, /no parecería formar parte de él/);
  assert.doesNotMatch(quotes.get('quote-3').t, /extraño y terrible/);
  assert.equal(workProfile?.original_title, 'Wuthering Heights');
  for (const quote of bronteQuotes) {
    assert.deepEqual(Object.keys(quote.original).sort(), ['label', 'lang', 'text']);
  }
});

test('Gargantúa conserva la voz de los lectores, el antecedente del honor y la tipografía del facsímil', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const profiles = JSON.parse(await readFile(new URL('../public/data/literary-profiles.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const rabelaisQuotes = document.quotes.filter(quote => quote.workId === 'work-gargantua');
  const workProfile = profiles.works.find(profile => profile.work_id === 'work-gargantua');

  assert.equal(rabelaisQuotes.length, 7);
  assert.ok(rabelaisQuotes.every(quote => quote.original?.lang === 'fr'));
  assert.ok(rabelaisQuotes.every(quote => quote.original?.label === 'Original francés'));
  assert.match(quotes.get('quote-4').original.text, /^Amis lecteurs qui ce liure liſez/);
  assert.doesNotMatch(quotes.get('quote-5').t, /\n/);
  assert.doesNotMatch(quotes.get('quote-5').original.text, /\n/);
  assert.match(quotes.get('quote-6').original.text, /Crochetaſtes vous oncques bouteilles \? Caiſgne\./);
  assert.match(quotes.get('quote-7').t, /y ser ligeros en la persecución y audaces en el encuentro/);
  assert.match(quotes.get('quote-7').t, /os conviene romper el hueso y chupar la sustantífica médula/);
  assert.doesNotMatch(quotes.get('quote-7').t, /romped el hueso|chupad la/);
  assert.match(quotes.get('quote-8').t, /Haz lo que quieras\.$/);
  assert.doesNotMatch(quotes.get('quote-8').t, /HAZ LO QUE QUIERAS/);
  assert.match(quotes.get('quote-8').original.text, /Fay ce que vouldras\.$/);
  assert.match(quotes.get('quote-9').t, /llamaban honor a ese instinto y aguijón/);
  assert.match(quotes.get('quote-10').t, /codiciamos lo que se nos niega\.$/);
  assert.equal(workProfile?.original_title, 'Gargantua');
  for (const quote of rabelaisQuotes) {
    assert.deepEqual(Object.keys(quote.original).sort(), ['label', 'lang', 'text']);
  }
});

test('Frankenstein restaura la continuidad de 1818 y la voz de la criatura', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const profiles = JSON.parse(await readFile(new URL('../public/data/literary-profiles.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const shelleyQuotes = document.quotes.filter(quote => quote.workId === 'work-frankenstein-o-el-moderno-prometeo');
  const workProfile = profiles.works.find(profile => profile.work_id === 'work-frankenstein-o-el-moderno-prometeo');

  assert.equal(shelleyQuotes.length, 26);
  assert.ok(shelleyQuotes.every(quote => quote.original?.lang === 'en'));
  assert.ok(shelleyQuotes.every(quote => quote.original?.label === 'Original inglés'));
  assert.ok(shelleyQuotes.every(quote => !quote.t.includes('\n')));
  assert.ok(shelleyQuotes.every(quote => !quote.original.text.includes('\n')));
  assert.match(quotes.get('quote-18').t, /Justine murió; descansaba; y yo seguía vivo/);
  assert.doesNotMatch(quotes.get('quote-18').t, /Justine había muerto/);
  assert.match(quotes.get('quote-23').t, /cómo había sido creado y quién era mi creador/);
  assert.match(quotes.get('quote-23').t, /monstruo —una mancha sobre la tierra— del que todos los hombres huían y al que todos repudiaban/);
  assert.match(quotes.get('quote-26').t, /mi figura reflejada en el agua/);
  assert.match(quotes.get('quote-30').t, /me convertiré en algo cuya existencia/);
  assert.match(quotes.get('quote-31').t, /¡Hombre, puedes odiar, pero ten cuidado!/);
  assert.doesNotMatch(quotes.get('quote-31').t, /puedes odiarme/);
  assert.match(quotes.get('quote-32').t, /para picarte con su veneno/);
  assert.match(quotes.get('quote-33').t, /¡Obedece!$/);
  assert.match(quotes.get('quote-36').t, /lecciones que Felix daba a la árabe/);
  assert.doesNotMatch(quotes.get('quote-36').t, /joven árabe/);
  assert.equal(workProfile?.original_title, 'Frankenstein; or, The Modern Prometheus');
  for (const quote of shelleyQuotes) {
    assert.deepEqual(Object.keys(quote.original).sort(), ['label', 'lang', 'text']);
  }
});

test('La vida es sueño distingue el impreso de 1636 de la actualización y elimina dos apócrifos', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const calderonQuotes = document.quotes.filter(quote => quote.workId === 'work-la-vida-es-sueno');

  assert.equal(calderonQuotes.length, 13);
  assert.ok(calderonQuotes.every(quote => quote.original?.lang === 'es'));
  assert.ok(calderonQuotes.every(quote => quote.original?.label === 'Original español'));
  assert.match(quotes.get('quote-66').original.text, /freneſi/);
  assert.match(quotes.get('quote-66').t, /una sombra, una ficción,\ny el mayor bien/);
  assert.match(quotes.get('quote-67').t, /de estas prisiones cargado/);
  assert.match(quotes.get('quote-68').t, /la muerte \(¡desdicha fuerte!\);\n¡que hay quien intente reinar/);
  assert.match(quotes.get('quote-71').original.text, /ramillete con ſalas,\nquando las etereas alas/);
  assert.match(quotes.get('quote-71').t, /ramillete con alas\ncuando las etéreas salas/);
  assert.match(quotes.get('quote-72').t, /con mejor distinto/);
  assert.doesNotMatch(quotes.get('quote-72').t, /con mejor instinto/);
  assert.match(quotes.get('quote-73').t, /^Mas, sea verdad o sueño/);
  assert.match(quotes.get('quote-74').original.text, /^Que eſtoy ſoñado/);
  assert.match(quotes.get('quote-74').t, /^Que estoy soñando/);
  assert.match(quotes.get('quote-76').t, /y apenas llega, cuando llega a penas[.]\nBien mi suerte lo dice/);
  assert.doesNotMatch(quotes.get('quote-77').t, /Venció el amor/);
  assert.match(quotes.get('quote-77').t, /^Rosaura está sin honor/);
  assert.doesNotMatch(quotes.get('quote-78').t, /el valor se humilla/);
  assert.match(quotes.get('quote-78').t, /^La fortuna no se vence/);
  for (const quote of calderonQuotes) {
    assert.deepEqual(Object.keys(quote.original).sort(), ['label', 'lang', 'text']);
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

test('Ana de las Tejas Verdes conserva voz, límites y recortes tras la segunda auditoría', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const anneQuotes = document.quotes.filter(quote => quote.workId === 'work-ana-de-las-tejas-verdes');

  assert.equal(anneQuotes.length, 29);
  assert.match(quotes.get('quote-37').t, /respondió aquel diligente funcionario/);
  assert.match(quotes.get('quote-37').original.text, /she said\.$/);
  assert.match(quotes.get('quote-40').t, /un dolor raro y curioso, y sin embargo era un dolor agradable/);
  assert.match(quotes.get('quote-42').t, /No-o-o, no es exactamente mi nombre/);
  assert.match(quotes.get('quote-42').t, /balbuceó de mala gana la dueña de aquel nombre/);
  assert.match(quotes.get('quote-47').t, /se encaminó hacia la ventana abierta\.$/);
  assert.match(quotes.get('quote-49').t, /dijo Marilla con un suspiro/);
  assert.match(quotes.get('quote-52').t, /sin arredrarse/);
  assert.match(quotes.get('quote-57').t, /mi muchacha, mi muchacha, de quien estoy orgulloso/);
  assert.match(quotes.get('quote-58').t, /^Porque pagamos un precio/);
  assert.match(quotes.get('quote-60').t, /Quiero decírtelo ahora que puedo/);
  assert.match(quotes.get('quote-61').t, /jardín de la rectoría/);
  assert.match(quotes.get('quote-61').t, /cerrar nuestros corazones/);
  assert.equal(quotes.get('quote-62').t.match(/\[…\]/g)?.length, 1);
  assert.equal(quotes.get('quote-62').original.text.match(/\[…\]/g)?.length, 1);
  assert.doesNotMatch(quotes.get('quote-62').t, /\n/);
  assert.match(quotes.get('quote-63').t, /Marilla estaba fuera ordeñando/);
  assert.match(quotes.get('quote-64').t, /^Él se alejó/);
  assert.match(quotes.get('quote-64').t, /arrastrando los pies/);
});

test('Bartleby conserva intensidad, repeticiones e idiolectos tras la segunda auditoría', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const bartlebyQuotes = document.quotes.filter(quote => quote.workId === 'work-bartleby-el-escribiente');

  assert.equal(bartlebyQuotes.length, 16);
  assert.match(quotes.get('quote-79').original.text, /^In this very attitude/);
  assert.match(quotes.get('quote-80').t, /se la tendí bruscamente/);
  assert.match(quotes.get('quote-81').t, /habría estallado de inmediato en una cólera terrible/);
  assert.match(quotes.get('quote-83').t, /^También me esforcé/);
  assert.match(quotes.get('quote-84').t, /¡Pero bueno! ¿Qué es esto\? ¿Y ahora qué\?/);
  assert.match(quotes.get('quote-85').t, /mientras él estaba tras su biombo/);
  assert.match(quotes.get('quote-85').t, /Le tengo simpatía/);
  assert.match(quotes.get('quote-86').t, /echarlo a empellones.*echar a empellones/);
  assert.match(quotes.get('quote-86').t, /Los sobornos los deja/);
  assert.match(quotes.get('quote-87').t, /apretujándose respetuosamente/);
  assert.equal(quotes.get('quote-88').t.match(/qué le parecería/gi)?.length, 2);
  assert.match(quotes.get('quote-90').t, /los ojos de asesinos y ladrones/);
  assert.match(quotes.get('quote-90').t, /no le acarrea reproche alguno/);
  assert.match(quotes.get('quote-90').t, /no quiso decir nada más/);
  assert.match(quotes.get('quote-91').t, /^—Su servior, señor, su servior/);
  assert.match(quotes.get('quote-92').t, /Le toqué la mano/);
  assert.match(quotes.get('quote-92').t, /se asomó entonces para mirarme/);
  assert.match(quotes.get('quote-93').t, /puede alguna ocupación parecer más propicia para acrecentarla/);
  assert.match(quotes.get('quote-94').t, /quizá se pudre en la tumba/);
  assert.match(quotes.get('quote-94').original.text, /Ah Bartleby! Ah humanity!$/);
});

test('El jardín secreto conserva lógica, voz y repeticiones tras la segunda auditoría', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const gardenQuotes = document.quotes.filter(quote => quote.workId === 'work-el-jardin-secreto');

  assert.equal(gardenQuotes.length, 23);
  assert.match(quotes.get('quote-96').t, /Me encanta\. No tiene nada de pelado/);
  assert.match(quotes.get('quote-97').t, /la señorita Mary Siempre al Contrario/);
  assert.match(quotes.get('quote-99').t, /A mi aya no le caía bien/);
  assert.match(quotes.get('quote-100').t, /^Mary se acercó/);
  assert.match(quotes.get('quote-100').t, /Si no había nadie más vivo/);
  assert.equal(quotes.get('quote-102').t.match(/completamente/g)?.length, 2);
  assert.doesNotMatch(quotes.get('quote-103').t, /siempre le había parecido/);
  assert.match(quotes.get('quote-104').t, /disfrutaría para siempre\.$/);
  assert.match(quotes.get('quote-108').t, /jamás en toda su vida/);
  assert.doesNotMatch(quotes.get('quote-109').t, /preguntó él/);
  assert.match(quotes.get('quote-109').t, /—Como si de pronto lo hubiera asaltado una idea—/);
  assert.match(quotes.get('quote-109').t, /voz temblorosa/);
  assert.match(quotes.get('quote-109').t, /¡Tierra!/);
  assert.match(quotes.get('quote-110').t, /dijo él/);
  assert.match(quotes.get('quote-110').t, /Cuando veas/);
  assert.match(quotes.get('quote-112').t, /dice que cree/);
  assert.match(quotes.get('quote-112').t, /a un tipo que estuviera/);
  assert.match(quotes.get('quote-113').t, /traerlo aquí fuera/);
  assert.match(quotes.get('quote-113').t, /mire y escuche y aspire el aire, y que quede/);
  assert.match(quotes.get('quote-115').t, /se llevaran un Huevo o lo dañaran/);
  assert.match(quotes.get('quote-116').t, /nada más que meros pensamientos/);
  assert.equal(quotes.get('quote-116').highlight, 'meros pensamientos');
  assert.match(quotes.get('quote-117').t, /como una riada/);
  assert.match(quotes.get('quote-109').original.text, /^Is there anything/);
  assert.doesNotMatch(quotes.get('quote-109').original.text, /^"/);
});

test('Las cerezas del cementerio publica el original cotejado y su actualización lingüística', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const cerezasQuotes = document.quotes.filter(quote => quote.workId === 'work-las-cerezas-del-cementerio');

  assert.equal(cerezasQuotes.length, 28);
  assert.ok(cerezasQuotes.every(quote => quote.original?.lang === 'es'));
  assert.ok(cerezasQuotes.every(quote => quote.original?.label === 'Original español'));
  assert.doesNotMatch(quotes.get('quote-118').t, /\n/);
  assert.match(quotes.get('quote-119').t, /^\.\.\.Ya tarde/);
  assert.match(quotes.get('quote-119').original.text, /hicieron los tres un apartado grupo/);
  assert.match(quotes.get('quote-119').t, /los tres formaron un grupo aparte/);
  assert.match(quotes.get('quote-119').t, /reciente\.\.\.$/);
  assert.match(quotes.get('quote-123').original.text, /Me parecía nave sagrada/);
  assert.match(quotes.get('quote-123').t, /Me parecía una nave sagrada/);
  assert.match(quotes.get('quote-123').t, /nave sagrada \[…] Pues ahora/);
  assert.match(quotes.get('quote-123').t, /de las aguas\.\.\.$/);
  assert.match(quotes.get('quote-128').t, /fragante de primavera, \[…\]/);
  assert.match(quotes.get('quote-128').original.text, /delantal de randas/);
  assert.match(quotes.get('quote-128').t, /delantal de encajes/);
  assert.match(quotes.get('quote-130').t, /su quimera\.\.\.$/);
  assert.match(quotes.get('quote-131').t, /de los árboles\.\.\.$/);
  assert.match(quotes.get('quote-132').original.text, /mujeres placenteras/);
  assert.match(quotes.get('quote-132').t, /mujeres risueñas/);
  assert.match(quotes.get('quote-132').t, /sobre el vientre!$/);
  assert.match(quotes.get('quote-135').t, /espejo de agua de la cisterna\.$/);
  assert.match(quotes.get('quote-136').t, /\n\n—¡Qué altos/);
  assert.match(quotes.get('quote-137').t, /blancura nupcial\.\n\nEntonces/);
  assert.match(quotes.get('quote-139').t, /^\.\.\.Después/);
  assert.match(quotes.get('quote-139').t, /entre nieblas y luna\.\.\.$/);
  assert.match(quotes.get('quote-141').t, /apetito satisfecho\. \[…] Pesadez/);
  assert.match(quotes.get('quote-144').original.text, /Es mi compaña/);
  assert.match(quotes.get('quote-144').t, /Es mi compañera/);
  assert.match(quotes.get('quote-143').t, /pensaba y prometía curtirle a él!$/);
  assert.equal(quotes.get('quote-145').t.match(/\n\n/g)?.length, 1);
  assert.equal(cerezasQuotes.reduce((count, quote) => count + (quote.t.match(/\[…\]/g)?.length || 0), 0), 3);
  assert.equal(cerezasQuotes.reduce((count, quote) => count + (quote.original.text.match(/\[…\]/g)?.length || 0), 0), 3);
  for (const quote of cerezasQuotes) {
    assert.equal(
      quote.t.match(/\[…\]/g)?.length || 0,
      quote.original.text.match(/\[…\]/g)?.length || 0,
      `${quote.id} debe conservar los recortes simétricos`,
    );
  }
});

test('Niebla conserva la primera edición y publica una actualización lingüística mínima', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const nieblaQuotes = document.quotes.filter(quote => quote.workId === 'work-niebla');

  assert.equal(nieblaQuotes.length, 20);
  assert.ok(nieblaQuotes.every(quote => quote.original?.lang === 'es'));
  assert.ok(nieblaQuotes.every(quote => quote.original?.label === 'Original español'));
  assert.match(quotes.get('quote-146').original.text, /quedóse.*lento orvallo.*sobrecejo/);
  assert.match(quotes.get('quote-146').t, /se quedó.*lenta lluvia menuda.*entrecejo/);
  assert.doesNotMatch(quotes.get('quote-147').original.text, /»$/);
  assert.match(quotes.get('quote-148').original.text, /Esperaré á/);
  assert.match(quotes.get('quote-148').original.text, /se fué/);
  assert.match(quotes.get('quote-148').t, /una joven gallarda/);
  assert.match(quotes.get('quote-151').original.text, /^Se levantó de la mecedora, fué al gabinete/);
  assert.match(quotes.get('quote-153').original.text, /éste mata a aquél/);
  assert.match(quotes.get('quote-153').t, /este mata a aquel/);
  assert.match(quotes.get('quote-157').original.text, /^»¿De dónde/);
  assert.match(quotes.get('quote-158').original.text, /antojándoseme/);
  assert.match(quotes.get('quote-158').t, /se me antojaba/);
  assert.match(quotes.get('quote-160').t, /¡Amo, ergo sum!$/);
  assert.match(quotes.get('quote-162').t, /se rozan y se frotan/);
  assert.match(quotes.get('quote-165').t, /Solo se aprende.*de nuevo\.\.\.$/);
  assert.equal(nieblaQuotes.reduce((count, quote) => count + (quote.t.match(/\[…\]/g)?.length || 0), 0), 4);
  assert.equal(nieblaQuotes.reduce((count, quote) => count + (quote.original.text.match(/\[…\]/g)?.length || 0), 0), 4);
  for (const quote of nieblaQuotes) {
    assert.equal(
      quote.t.match(/\[…\]/g)?.length || 0,
      quote.original.text.match(/\[…\]/g)?.length || 0,
      `${quote.id} debe conservar los recortes simétricos`,
    );
  }
});

test('Cañas y barro conserva la primera edición y publica una actualización lingüística mínima', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const canasQuotes = document.quotes.filter(quote => quote.workId === 'work-canas-y-barro');

  assert.equal(canasQuotes.length, 10);
  assert.ok(canasQuotes.every(quote => quote.original?.lang === 'es'));
  assert.ok(canasQuotes.every(quote => quote.original?.label === 'Original español'));
  assert.match(quotes.get('quote-166').original.text, /semejante á.*\n\nEn el agua muerta/);
  assert.match(quotes.get('quote-166').original.text, /barca-correo; un gran ataúd/);
  assert.match(quotes.get('quote-166').t, /semejante a.*\n\nEn el agua muerta/);
  assert.match(quotes.get('quote-170').original.text, /vedijas de blanca lana/);
  assert.match(quotes.get('quote-170').t, /mechones de lana blanca/);
  assert.doesNotMatch(quotes.get('quote-170').original.text, /\n\n/);
  assert.match(quotes.get('quote-171').original.text, /^La barca deslizábase á/);
  assert.match(quotes.get('quote-171').t, /^La barca se deslizaba a/);
  assert.match(quotes.get('quote-173').original.text, /casa de expósitos/);
  assert.match(quotes.get('quote-173').t, /hospicio de niños abandonados/);
  assert.match(quotes.get('quote-174').original.text, /no la atendía gran cosa/);
  assert.match(quotes.get('quote-174').t, /no le hacía mucho caso/);
  assert.equal(quotes.get('quote-175').original.text.match(/\[…\]/g)?.length, 1);
  assert.equal(quotes.get('quote-175').t.match(/\[…\]/g)?.length, 1);
  for (const quote of canasQuotes) {
    assert.equal(
      quote.t.match(/\[…\]/g)?.length || 0,
      quote.original.text.match(/\[…\]/g)?.length || 0,
      `${quote.id} debe conservar los recortes simétricos`,
    );
  }
});

test('Orlando conserva límites, imágenes y repeticiones tras la segunda auditoría', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const orlandoQuotes = document.quotes.filter(quote => quote.workId === 'work-orlando');

  assert.equal(orlandoQuotes.length, 25);
  assert.ok(orlandoQuotes.every(quote => quote.original?.lang === 'en'));
  assert.ok(orlandoQuotes.every(quote => quote.original?.label === 'Original inglés'));
  assert.match(quotes.get('quote-177').t, /sentir bajo él la espina dorsal de la tierra/);
  assert.match(quotes.get('quote-180').t, /se zambulliría en busca de la gema/);
  assert.match(quotes.get('quote-183').t, /incendiar la casa con yesca/);
  assert.match(quotes.get('quote-186').t, /hacer ciertas afirmaciones\.$/);
  assert.doesNotMatch(quotes.get('quote-186').t, /Orlando se había convertido en mujer/);
  assert.match(quotes.get('quote-187').t, /^Orlando se había convertido en mujer/);
  assert.match(quotes.get('quote-190').original.text, /she flattered the good man's humours/);
  assert.match(quotes.get('quote-190').t, /la ropa la que nos lleva a nosotros, y no nosotros a ella/);
  assert.match(quotes.get('quote-191').t, /caso particular de la propia Orlando/);
  assert.match(quotes.get('quote-193').t, /Los pensamientos son divinos\.$/);
  assert.doesNotMatch(quotes.get('quote-193').t, /etcétera/);
  assert.equal(quotes.get('quote-194').t.match(/el cambio/gi)?.length, 2);
  assert.equal(quotes.get('quote-195').t.match(/la sociedad/gi)?.length, 4);
  assert.match(quotes.get('quote-197').original.text, /Dictionary of National Biography/);
  assert.match(quotes.get('quote-197').t, /En efecto, es difícil este asunto/);
  assert.match(quotes.get('quote-198').t, /que una persona diga, en cuanto se queda sola/);
  for (const quote of orlandoQuotes) {
    assert.deepEqual(Object.keys(quote.original).sort(), ['label', 'lang', 'text']);
  }
});

test('Una habitación propia conserva límites, referentes y recortes tras la segunda auditoría', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const roomQuotes = document.quotes.filter(quote => quote.workId === 'work-una-habitacion-propia');

  assert.equal(roomQuotes.length, 33);
  assert.ok(roomQuotes.every(quote => quote.original?.lang === 'en'));
  assert.ok(roomQuotes.every(quote => quote.original?.label === 'Original inglés'));
  assert.match(quotes.get('quote-202').t, /limitaciones, los prejuicios y las idiosincrasias/);
  assert.match(quotes.get('quote-208').t, /si una silbaba, uno de ellos acudía corriendo/);
  assert.equal(quotes.get('quote-215').original.text.match(/\[…\]/g)?.length, 1);
  assert.equal(quotes.get('quote-215').t.match(/\[…\]/g)?.length, 1);
  assert.equal(quotes.get('quote-218').original.text.match(/\[…\]/g)?.length, 1);
  assert.equal(quotes.get('quote-218').t.match(/\[…\]/g)?.length, 1);
  assert.match(quotes.get('quote-219').t, /usted, bedel como es, me eche del césped/);
  assert.ok(quotes.get('quote-220').t.indexOf('nuestras madres') < quotes.get('quote-220').t.indexOf('grandes escritores'));
  assert.match(quotes.get('quote-222').t, /no conocemos a Jane Austen ni conocemos a Shakespeare/);
  assert.match(quotes.get('quote-227').t, /señor B/);
  assert.match(quotes.get('quote-227').t, /Coleridge/);
  assert.match(quotes.get('quote-229').t, /Ilumina a un grupo en una habitación/);
  assert.match(quotes.get('quote-233').t, /no solo con el mundo de los hombres y las mujeres/);
  for (const quote of roomQuotes) {
    assert.deepEqual(Object.keys(quote.original).sort(), ['label', 'lang', 'text']);
    assert.equal(
      quote.t.match(/\[…\]/g)?.length || 0,
      quote.original.text.match(/\[…\]/g)?.length || 0,
      `${quote.id} debe conservar los recortes simétricos`,
    );
  }
});

test('El rayo que no cesa distingue el impreso de 1936 de la actualización mínima', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const hernandezQuotes = document.quotes.filter(quote => quote.workId === 'work-el-rayo-que-no-cesa');

  assert.equal(hernandezQuotes.length, 13);
  assert.ok(hernandezQuotes.every(quote => quote.original?.lang === 'es'));
  assert.ok(hernandezQuotes.every(quote => quote.original?.label === 'Original español'));
  assert.match(quotes.get('quote-234').original.text, /rayos destructores[.]$/);
  assert.match(quotes.get('quote-234').t, /rayos destructores[.]$/);
  assert.match(quotes.get('quote-235').original.text, /Sal de mi corazón del que/);
  assert.match(quotes.get('quote-235').t, /Sal de mi corazón, del que/);
  assert.match(quotes.get('quote-236').original.text, /tan[.]pura/);
  assert.match(quotes.get('quote-236').t, /tan pura/);
  assert.match(quotes.get('quote-239').t, /^Una querencia tengo por tu acento,/);
  assert.match(quotes.get('quote-240').original.text, /ver y oir[\s\S]+has dé oirme/);
  assert.match(quotes.get('quote-240').t, /ver y oír[\s\S]+has de oírme/);
  assert.match(quotes.get('quote-241').original.text, /Besarte fué besar/);
  assert.match(quotes.get('quote-241').t, /Besarte fue besar/);
  assert.doesNotMatch(quotes.get('quote-241').t, /fue'/);
  assert.match(quotes.get('quote-242').original.text, /lacteada-y breve vía/);
  assert.match(quotes.get('quote-242').t, /lacteada y breve vía/);
  assert.match(quotes.get('quote-245').original.text, /sedienta de catástrofes y hambrienta[.]$/);
  assert.match(quotes.get('quote-245').t, /sedienta de catástrofes y hambrienta[.]$/);
  assert.match(quotes.get('quote-244').t, /^Yo quiero ser llorando el hortelano/);
  assert.match(quotes.get('quote-244').t, /siento más tu muerte que mi vida[.]$/);
  assert.match(quotes.get('quote-245').t, /^Ando sobre rastrojos de difuntos/);
  assert.match(quotes.get('quote-246').t, /^Quiero escarbar la tierra con los dientes/);
  assert.match(quotes.get('quote-246').original.text, /y tu sangre se irán a cada lado\ndisputando tu novia y las abejas[.]$/);
  assert.match(quotes.get('quote-246').t, /y tu sangre se irán a cada lado\ndisputando tu novia y las abejas[.]$/);
  for (const quote of hernandezQuotes) {
    assert.deepEqual(Object.keys(quote.original).sort(), ['label', 'lang', 'text']);
    assert.equal(
      quote.t.split('\n').length,
      quote.original.text.split('\n').length,
      `${quote.id} debe conservar la disposición estrófica`,
    );
  }
});

test('El retrato de Dorian Gray recupera la edición de 1891 y marca todos sus recortes', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const wildeQuotes = document.quotes.filter(quote => quote.workId === 'work-el-retrato-de-dorian-gray');

  assert.equal(wildeQuotes.length, 21);
  assert.ok(wildeQuotes.every(quote => quote.original?.lang === 'en'));
  assert.ok(wildeQuotes.every(quote => quote.original?.label === 'Original inglés'));
  assert.match(quotes.get('quote-259').original.text, /^“Harry,”/);
  assert.match(quotes.get('quote-259').t, /sobre el lienzo coloreado/);
  assert.equal(quotes.get('quote-261').t.match(/allí estaba/gi)?.length, 2);
  assert.match(quotes.get('quote-262').original.text, /evil and aging face/);
  assert.doesNotMatch(quotes.get('quote-262').t, /\n/);
  assert.match(quotes.get('quote-264').t, /^—No sigas, Harry/);
  assert.doesNotMatch(quotes.get('quote-265').t, /\n/);
  assert.match(quotes.get('quote-266').original.text, /some one else's music/);
  assert.match(quotes.get('quote-266').original.text, /To realize one's nature/);
  assert.match(quotes.get('quote-266').t, /pensamientos naturales ni arde con sus pasiones naturales/);
  assert.match(quotes.get('quote-266').t, /Sus virtudes no son reales para él/);
  assert.match(quotes.get('quote-267').t, /^—Sí —continuó lord Henry—/);
  assert.equal(quotes.get('quote-268').t.match(/¡Qué triste es!/g)?.length, 2);
  assert.match(quotes.get('quote-268').t, /¡A cambio de eso —de eso— lo daría todo!/);
  assert.match(quotes.get('quote-268').original.text, /day of June[.] [.] [.] [.] If/);
  assert.equal(quotes.get('quote-269').t.match(/\[…\]/g)?.length, 2);
  assert.match(quotes.get('quote-269').t, /La gente corriente que actuaba conmigo me parecía divina/);
  assert.doesNotMatch(quotes.get('quote-269').t, /\n/);
  assert.match(quotes.get('quote-271').t, /^Pero la posición y la riqueza/);
  assert.match(quotes.get('quote-271').t, /no creo en absoluto esos rumores/);
  assert.match(quotes.get('quote-273').t, /\[…\] Reza, Dorian, reza —murmuró—/);
  assert.match(quotes.get('quote-274').original.text, /could realize his conception/);
  assert.match(quotes.get('quote-277').t, /un Dios justísimo/);
  assert.match(quotes.get('quote-278').t, /estados de ánimo superficiales/);
  assert.match(quotes.get('quote-278').t, /pensamientos enfermizos[.] \[…\] La juventud/);
  assert.match(quotes.get('quote-279').t, /no podía perdonárselo[.] \[…\] El asesinato/);
  assert.match(quotes.get('quote-275').original.text, /same[.]”$/);
  assert.match(quotes.get('quote-276').original.text, /sonnets[.]”$/);
  for (const quote of wildeQuotes) {
    assert.deepEqual(Object.keys(quote.original).sort(), ['label', 'lang', 'text']);
    assert.equal(
      quote.t.match(/\[…\]/g)?.length || 0,
      quote.original.text.match(/\[…\]/g)?.length || 0,
      `${quote.id} debe conservar los recortes simétricos`,
    );
  }
});

test('La muerte de Iván Ilich recupera el tomo 26 y alinea sus recortes y voces', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const tolstoiQuotes = document.quotes.filter(quote => quote.workId === 'work-la-muerte-de-ivan-ilich');

  assert.equal(tolstoiQuotes.length, 18);
  assert.ok(tolstoiQuotes.every(quote => quote.original?.lang === 'ru'));
  assert.ok(tolstoiQuotes.every(quote => quote.original?.label === 'Original ruso'));
  assert.match(quotes.get('quote-280').original.text, /была о том/);
  assert.match(quotes.get('quote-280').t, /cada uno de los señores reunidos en el despacho/);
  assert.equal(quotes.get('quote-281').t.match(/\[…\]/g)?.length, 2);
  assert.match(quotes.get('quote-281').t, /Era el término medio entre ellos/);
  assert.equal(quotes.get('quote-282').original.text.match(/итти/g)?.length, 2);
  assert.match(quotes.get('quote-282').t, /importancia, incluso exterior/);
  assert.match(quotes.get('quote-282').t, /las comidas y el whist/);
  assert.match(quotes.get('quote-283').t, /un catarro crónico/);
  assert.match(quotes.get('quote-284').t, /¿Para qué engañarme\?/);
  assert.match(quotes.get('quote-285').t, /para mí, Vania, Iván Ilich, con todos mis sentimientos y pensamientos/);
  assert.doesNotMatch(quotes.get('quote-285').t, /pero él, Vania/);
  assert.match(quotes.get('quote-286').original.text, /^Как это сделалось на 3-м месяце/);
  assert.match(quotes.get('quote-286').t, /^No podía decirse cómo había sucedido aquello/);
  assert.match(quotes.get('quote-287').t, /era el único que comprendía/);
  assert.match(quotes.get('quote-288').t, /solo tenía que mantenerse tranquilo y tratarse/);
  assert.match(quotes.get('quote-288').t, /así que dejad, al menos, de mentir/);
  assert.match(quotes.get('quote-289').t, /era un miembro importante/);
  assert.match(quotes.get('quote-290').t, /se llevaba a cabo con sufrimiento/);
  assert.match(quotes.get('quote-291').original.text, /то мертвее/);
  assert.match(quotes.get('quote-291').t, /y así un año, y dos, y diez, y veinte/);
  assert.match(quotes.get('quote-293').original.text, /^Доктор говорил/);
  assert.doesNotMatch(quotes.get('quote-293').original.text, /оговорил/);
  assert.match(quotes.get('quote-293').t, /rostro soñoliento, bondadoso y de pómulos salientes de Guerásim/);
  assert.match(quotes.get('quote-295').t, /Es posible, es posible hacer lo correcto/);
  assert.match(quotes.get('quote-295').t, /El moribundo seguía gritando desesperadamente y agitando los brazos/);
  assert.match(quotes.get('quote-295').t, /Sintió compasión por ella[.]$/);
  assert.match(quotes.get('quote-296').t, /¿Dónde ponerlo\?/);
  assert.match(quotes.get('quote-297').t, /La muerte ha terminado[.] Ya no existe/);
  for (const quote of tolstoiQuotes) {
    assert.deepEqual(Object.keys(quote.original).sort(), ['label', 'lang', 'text']);
    assert.equal(
      quote.t.split('\n\n').length,
      quote.original.text.split('\n\n').length,
      `${quote.id} debe conservar la estructura de párrafos`,
    );
    assert.equal(
      quote.t.match(/\[…\]/g)?.length || 0,
      quote.original.text.match(/\[…\]/g)?.length || 0,
      `${quote.id} debe conservar los recortes simétricos`,
    );
  }
});

test('Memorias del subsuelo conserva la voz, completa sus límites y señala todos los recortes', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const undergroundQuotes = document.quotes.filter(quote => quote.workId === 'work-memorias-del-subsuelo');

  assert.equal(undergroundQuotes.length, 25);
  assert.ok(undergroundQuotes.every(quote => quote.original?.lang === 'ru'));
  assert.ok(undergroundQuotes.every(quote => quote.original?.label === 'Original ruso'));
  assert.match(quotes.get('quote-298').t, /Por lo demás, no entiendo ni pizca/);
  assert.match(quotes.get('quote-299').original.text, /но даже и ничем/);
  assert.doesNotMatch(quotes.get('quote-299').original.text, /но далее и ничем/);
  assert.match(quotes.get('quote-299').t, /hacerme malo, sino que ni siquiera supe hacerme nada: ni malo ni bueno/);
  assert.match(quotes.get('quote-300').original.text, /самом отвлеченном и умышленном городе/);
  assert.match(quotes.get('quote-300').t, /nuestro desgraciado siglo XIX/);
  assert.match(quotes.get('quote-300').t, /la ciudad más abstracta y premeditada/);
  assert.match(quotes.get('quote-301').t, /como se decía antaño entre nosotros/);
  assert.match(quotes.get('quote-301').t, /bueno, sí, en una palabra/);
  assert.match(quotes.get('quote-302').t, /cobrar viva conciencia/);
  assert.match(quotes.get('quote-302').t, /un placer indudable, serio/);
  assert.match(quotes.get('quote-303').original.text, /свой пагубный фантастический элемент[.]$/);
  assert.match(quotes.get('quote-303').t, /su pernicioso elemento fantástico[.]$/);
  assert.match(quotes.get('quote-305').t, /yo aún le tengo miedo[.]$/);
  assert.match(quotes.get('quote-310').original.text, /приписывал мой взгляд каждому[.]$/);
  assert.doesNotMatch(quotes.get('quote-310').original.text, /подлое выражение/);
  assert.match(quotes.get('quote-311').original.text, /Но всё было напрасно[.] Они-то и не обращали внимания[.]/);
  assert.match(quotes.get('quote-311').t, /Pero todo era inútil[.] Ellos ni siquiera prestaban atención[.]/);
  assert.equal(quotes.get('quote-311').t.match(/\[…\]/g)?.length, 1);
  assert.equal(quotes.get('quote-311').original.text.match(/\[…\]/g)?.length, 1);
  assert.match(quotes.get('quote-313').t, /Y no desde fuera:/);
  assert.match(quotes.get('quote-315').t, /se alzaba en mí tal rabia/);
  assert.equal(quotes.get('quote-315').t.match(/\[…\]/g)?.length, 3);
  assert.equal(quotes.get('quote-315').original.text.match(/\[…\]/g)?.length, 3);
  assert.match(quotes.get('quote-316').t, /\[…\]»$/);
  assert.match(quotes.get('quote-316').original.text, /\[…\]»$/);
  assert.equal(quotes.get('quote-317').t.split('\n\n').length, 2);
  assert.equal(quotes.get('quote-318').t.split('\n\n').length, 3);
  assert.match(quotes.get('quote-322').t, /a qué unirnos, a qué atenernos/);
  assert.match(quotes.get('quote-322').t, /^Déjennos solos, sin un libro/);
  assert.match(quotes.get('quote-322').t, /hombres universales nunca vistos/);
  for (const quote of undergroundQuotes) {
    assert.deepEqual(Object.keys(quote.original).sort(), ['label', 'lang', 'text']);
    assert.equal(
      quote.t.split('\n\n').length,
      quote.original.text.split('\n\n').length,
      `${quote.id} debe conservar la estructura de párrafos`,
    );
    assert.equal(
      quote.t.match(/\[…\]/g)?.length || 0,
      quote.original.text.match(/\[…\]/g)?.length || 0,
      `${quote.id} debe conservar los recortes simétricos`,
    );
  }
});

test('El Horla conserva los párrafos del impreso, su respiración febril y todos los recortes', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const horlaQuotes = document.quotes.filter(quote => quote.workId === 'work-el-horla');
  const expectedParagraphs = new Map([
    [323, 1], [324, 1], [325, 2], [326, 1], [327, 2], [328, 2], [329, 2],
    [330, 1], [331, 1], [332, 2], [333, 2], [334, 1], [335, 1], [336, 1],
    [337, 1], [338, 1], [339, 1], [340, 1], [341, 1], [342, 2], [343, 3],
    [344, 5], [345, 1], [346, 2], [347, 1], [348, 3], [349, 1],
  ]);

  assert.equal(horlaQuotes.length, 27);
  assert.ok(horlaQuotes.every(quote => quote.original?.lang === 'fr'));
  assert.ok(horlaQuotes.every(quote => quote.original?.label === 'Original francés'));
  assert.equal(quotes.get('quote-325').t.match(/\[…\]/g)?.length, 1);
  assert.equal(quotes.get('quote-325').original.text.match(/\[…\]/g)?.length, 1);
  assert.match(quotes.get('quote-329').t, /^Repliqué: «/);
  assert.match(quotes.get('quote-329').t, /\n\nÉl respondió: «/);
  assert.match(quotes.get('quote-337').t, /^Sin duda, me creería loco/);
  assert.match(quotes.get('quote-344').t, /Así pues, después de leer hasta la una/);
  assert.match(quotes.get('quote-345').t, /una página .* acababa de pasar por sí sola/);
  assert.match(quotes.get('quote-346').t, /^¡De un salto furioso/);
  assert.match(quotes.get('quote-346').t, /para matarlo!… Pero mi sillón/);
  assert.match(quotes.get('quote-347').t, /¡Estaba vacío, claro, profundo, lleno de luz!/);
  for (const quote of horlaQuotes) {
    assert.deepEqual(Object.keys(quote.original).sort(), ['label', 'lang', 'text']);
    const expected = expectedParagraphs.get(quote.legacy_index);
    assert.equal(quote.t.split('\n\n').length, expected, `${quote.id} conserva los párrafos franceses`);
    assert.equal(quote.original.text.split('\n\n').length, expected, `${quote.id} conserva los párrafos del impreso`);
    assert.equal(
      quote.t.match(/\[…\]/g)?.length || 0,
      quote.original.text.match(/\[…\]/g)?.length || 0,
      `${quote.id} debe conservar los recortes simétricos`,
    );
  }
});

test('La sala número seis conserva el texto académico, los párrafos y la voz polémica', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const wardQuotes = document.quotes.filter(quote => quote.workId === 'work-la-sala-numero-seis');
  const expectedParagraphs = new Map([
    [350, 1], [351, 1], [352, 1], [353, 1], [354, 1], [355, 1], [356, 2],
    [357, 1], [358, 1], [359, 1], [360, 1], [361, 2], [362, 2], [363, 3],
    [364, 1], [365, 1], [366, 1], [367, 1], [368, 1], [369, 3], [370, 1],
    [371, 1], [372, 1],
  ]);

  assert.equal(wardQuotes.length, 23);
  assert.ok(wardQuotes.every(quote => quote.original?.lang === 'ru'));
  assert.ok(wardQuotes.every(quote => quote.original?.label === 'Original ruso'));
  assert.match(quotes.get('quote-351').original.text, /что _их_ надо бить/);
  assert.match(quotes.get('quote-351').t, /que _a ellos_ hay que pegarles/);
  assert.match(quotes.get('quote-354').t, /todos sus derechos civiles/);
  assert.match(quotes.get('quote-355').t, /no bastaba con su sola voluntad/);
  assert.equal(quotes.get('quote-356').original.text.match(/\[…\]/g)?.length, 1);
  assert.equal(quotes.get('quote-356').t.match(/\[…\]/g)?.length, 1);
  assert.match(quotes.get('quote-361').t, /son moralmente inconmensurablemente inferiores/);
  assert.match(quotes.get('quote-361').t, /toda su chusma hospitalaria/);
  assert.match(quotes.get('quote-363').t, /se enfadó de pronto/);
  assert.match(quotes.get('quote-363').t, /—preguntó Iván Dmítrich—/);
  assert.match(quotes.get('quote-363').t, /Dígame, vamos,/);
  assert.match(quotes.get('quote-366').t, /aquella copa se apartara de él/);
  assert.match(quotes.get('quote-368').t, /volvió a enfadarse/);
  assert.match(quotes.get('quote-369').t, /fábrica de calcinación de huesos/);
  assert.match(quotes.get('quote-370').t, /nobles impulsos/);
  assert.match(quotes.get('quote-371').t, /la hubiera hecho girar/);
  for (const quote of wardQuotes) {
    assert.deepEqual(Object.keys(quote.original).sort(), ['label', 'lang', 'text']);
    const expected = expectedParagraphs.get(quote.legacy_index);
    assert.equal(quote.t.split('\n\n').length, expected, `${quote.id} conserva los párrafos rusos`);
    assert.equal(quote.original.text.split('\n\n').length, expected, `${quote.id} conserva los párrafos del impreso`);
    assert.equal(
      quote.t.match(/\[…\]/g)?.length || 0,
      quote.original.text.match(/\[…\]/g)?.length || 0,
      `${quote.id} debe conservar los recortes simétricos`,
    );
  }
});

test('La metamorfosis conserva omisiones, repeticiones y límites tras la segunda auditoría', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const kafkaQuotes = document.quotes.filter(quote => quote.workId === 'work-la-metamorfosis');

  assert.equal(kafkaQuotes.length, 32);
  assert.ok(kafkaQuotes.every(quote => quote.original?.lang === 'de'));
  assert.ok(kafkaQuotes.every(quote => quote.original?.label === 'Original alemán'));
  assert.match(quotes.get('quote-499').t, /llamó una voz; era su madre/);
  assert.match(quotes.get('quote-503').t, /¿Queréis, queréis dejarme marchar\?/);
  assert.match(quotes.get('quote-504').t, /velar por mis padres y mi hermana/);
  assert.match(quotes.get('quote-506').t, /cerrada de un golpe con el bastón/);
  assert.match(quotes.get('quote-508').t, /al parecer, las otras habían sido abiertas/);
  assert.match(quotes.get('quote-515').t, /cuya posición exacta desconocía/);
  assert.match(quotes.get('quote-518').t, /por debajo de las axilas/);
  assert.match(quotes.get('quote-519').t, /los tres tenían barbas pobladas/);
  assert.equal(quotes.get('quote-520').original.text.match(/\[…\]/g)?.length, 1);
  assert.equal(quotes.get('quote-520').t.match(/\[…\]/g)?.length, 1);
  assert.match(quotes.get('quote-520').t, /el padre y la madre, cada uno desde su lado/);
  assert.match(quotes.get('quote-522').t, /honrar su recuerdo/);
  for (const quote of kafkaQuotes) {
    assert.deepEqual(Object.keys(quote.original).sort(), ['label', 'lang', 'text']);
    assert.equal(
      quote.t.match(/\[…\]/g)?.length || 0,
      quote.original.text.match(/\[…\]/g)?.length || 0,
      `${quote.id} debe conservar los recortes simétricos`,
    );
  }
});

test('Orgullo y prejuicio conserva énfasis, lógica y límites tras la segunda auditoría', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const austenQuotes = document.quotes.filter(quote => quote.workId === 'work-orgullo-y-prejuicio');

  assert.equal(austenQuotes.length, 36);
  assert.ok(austenQuotes.every(quote => quote.original?.lang === 'en'));
  assert.ok(austenQuotes.every(quote => quote.original?.label === 'Original inglés'));
  assert.match(quotes.get('quote-528').original.text, /tempt _me_/);
  assert.match(quotes.get('quote-528').t, /tentarme _a mí_/);
  assert.match(quotes.get('quote-532').t, /ambos conozcan de antemano sus respectivos caracteres/);
  assert.match(quotes.get('quote-538').t, /señor Collins/);
  assert.doesNotMatch(quotes.get('quote-538').t, /…/);
  assert.match(quotes.get('quote-544').t, /¿No era eso cierta excusa para mi descortesía/);
  assert.doesNotMatch(quotes.get('quote-549').t, /las personas airadas no siempre son prudentes/);
  assert.equal(quotes.get('quote-549').highlight, 'una de las mujeres más hermosas de cuantas conozco');
  assert.doesNotMatch(quotes.get('quote-550').t, /\n/);
  assert.match(quotes.get('quote-553').t, /sin tener en cuenta a _usted_/);
  assert.match(quotes.get('quote-556').t, /Acudí a usted sin dudar/);
  assert.match(quotes.get('quote-557').t, /solo en la medida en que recordarlo le proporcione placer/);
  assert.match(quotes.get('quote-559').t, /en casos como estos/);
  for (const quote of austenQuotes) {
    assert.deepEqual(Object.keys(quote.original).sort(), ['label', 'lang', 'text']);
    assert.equal(
      quote.t.match(/_[^_]+_/g)?.length || 0,
      quote.original.text.match(/_[^_]+_/g)?.length || 0,
      `${quote.id} debe conservar sus énfasis tipográficos`,
    );
  }
});

test('La edad de la inocencia conserva referentes, intervenciones y énfasis tras la segunda auditoría', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const whartonQuotes = document.quotes.filter(quote => quote.workId === 'work-la-edad-de-la-inocencia');

  assert.equal(whartonQuotes.length, 28);
  assert.ok(whartonQuotes.every(quote => quote.original?.lang === 'en'));
  assert.ok(whartonQuotes.every(quote => quote.original?.label === 'Original inglés'));
  assert.match(quotes.get('quote-571').original.text, /Aunt Welland put it in those very words/);
  assert.match(quotes.get('quote-571').t, /La tía Welland lo expresó con esas mismas palabras/);
  assert.match(quotes.get('quote-571').t, /condición de que no tengan que oír nada desagradable/);
  assert.match(quotes.get('quote-573').t, /por la dureza de sus propios pensamientos/);
  assert.match(quotes.get('quote-575').t, /¡Santo cielo! ¿Una mala señal\?/);
  assert.match(quotes.get('quote-575').t, /renuncies a ella por la otra mujer/);
  assert.doesNotMatch(quotes.get('quote-575').t, /renuncies a la otra mujer/);
  assert.match(quotes.get('quote-576').t, /aquella gente nunca había sido tentada/);
  assert.match(quotes.get('quote-580').t, /^—Al menos —continuó ella—/);
  assert.match(quotes.get('quote-580').t, /Frunció el ceño, preocupada/);
  assert.doesNotMatch(quotes.get('quote-580').t, /parecen baratas/);
  assert.match(quotes.get('quote-581').t, /^—¿De qué sirve\?/);
  assert.match(quotes.get('quote-581').t, /eso es todo/);
  assert.match(quotes.get('quote-583').t, /_Cada vez vuelves a sucederme por completo\._/);
  assert.match(quotes.get('quote-583').t, /¿Te sucede\.\.\. te sucedo yo también: a ti\? —insistió/);
  assert.match(quotes.get('quote-584').t, /^—Quiero\.\.\. quiero escapar de algún modo/);
  assert.match(quotes.get('quote-584').t, /como él permaneció hosco y mudo/);
  assert.match(quotes.get('quote-585').t, /yo estoy más allá de eso —gimió/);
  assert.doesNotMatch(quotes.get('quote-585').t, /ya he estado más allá/);
  assert.match(quotes.get('quote-586').original.text, /library curtains should draw backward and forward/);
  assert.match(quotes.get('quote-586').t, /cortinas de la biblioteca corrieran de un lado a otro/);
  assert.doesNotMatch(quotes.get('quote-586').t, /preguntó May/);
  assert.match(quotes.get('quote-586').t, /la muerte ya me ha alcanzado\. _Estoy_ muerto/);
  assert.match(quotes.get('quote-589').t, /Sus ojos permanecieron fijos, sin ver/);
  assert.match(quotes.get('quote-589').t, /sentaros a observaros y adivinar lo que ocurría bajo la superficie/);
  for (const quote of whartonQuotes) {
    assert.deepEqual(Object.keys(quote.original).sort(), ['label', 'lang', 'text']);
    assert.equal(
      quote.t.match(/_[^_]+_/g)?.length || 0,
      quote.original.text.match(/_[^_]+_/g)?.length || 0,
      'Cada fragmento debe conservar sus énfasis tipográficos',
    );
  }
});

test('El despertar conserva la primera edición, las interrupciones y la paradoja final', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const chopinQuotes = document.quotes.filter(quote => quote.workId === 'work-el-despertar');

  assert.equal(chopinQuotes.length, 10);
  assert.ok(chopinQuotes.every(quote => quote.original?.lang === 'en'));
  assert.ok(chopinQuotes.every(quote => quote.original?.label === 'Original inglés'));
  assert.match(quotes.get('quote-590').original.text, /drawing up her lawn sleeves/);
  assert.doesNotMatch(quotes.get('quote-590').original.text, /fawn sleeves/);
  assert.match(quotes.get('quote-590').t, /mangas de batista/);
  assert.equal(quotes.get('quote-590').t.split('\n\n').length, 2);
  assert.match(quotes.get('quote-592').t, /abismos de soledad; a perderse/);
  assert.match(quotes.get('quote-593').t, /la existencia exterior que se conforma, la vida interior que cuestiona/);
  assert.match(quotes.get('quote-594').t, /que bien podríamos llamar amor/);
  assert.match(quotes.get('quote-595').t, /es solo algo que empiezo a comprender, que se me está revelando/);
  assert.match(quotes.get('quote-596').original.text, /_ma foi!_/);
  assert.match(quotes.get('quote-596').t, /_ma foi!_/);
  assert.match(quotes.get('quote-597').original.text, /^"Yes," she said\./);
  assert.match(quotes.get('quote-597').t, /^—Sí —dijo ella—\./);
  assert.match(quotes.get('quote-597').t, /¡Oh! ¡En fin! Quizá/);
  assert.match(quotes.get('quote-598').original.text, /Good-by—because I love you/);
  assert.match(quotes.get('quote-598').t, /Adiós… porque te amo/);
  assert.match(quotes.get('quote-599').t, /resultaba estar de pie, desnuda bajo el cielo/);
  assert.match(quotes.get('quote-599').t, /un mundo familiar que nunca había conocido/);
  for (const quote of chopinQuotes) {
    assert.deepEqual(Object.keys(quote.original).sort(), ['label', 'lang', 'text']);
    assert.equal(
      quote.t.match(/_[^_]+_/g)?.length || 0,
      quote.original.text.match(/_[^_]+_/g)?.length || 0,
      'Cada fragmento debe conservar sus énfasis tipográficos',
    );
  }
});

test('Las tiendas de color canela conserva la primera edición y el hambre de autoconocimiento', async () => {
  const document = JSON.parse(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'));
  const quotes = new Map(document.quotes.map(quote => [quote.id, quote]));
  const schulzQuotes = document.quotes.filter(quote => quote.workId === 'work-las-tiendas-de-color-canela');

  assert.equal(schulzQuotes.length, 16);
  assert.ok(schulzQuotes.every(quote => quote.original?.lang === 'pl'));
  assert.ok(schulzQuotes.every(quote => quote.original?.label === 'Original polaco'));
  assert.match(quotes.get('quote-600').original.text, /chory na elefantiasis/);
  assert.match(quotes.get('quote-600').original.text, /tragedji słonecznika/);
  assert.match(quotes.get('quote-600').t, /sin comprender la gran tragedia del girasol/);
  assert.doesNotMatch(quotes.get('quote-600').t, /incapaces de comprender/);
  assert.match(quotes.get('quote-601').original.text, /manjacki monolog/);
  assert.match(quotes.get('quote-601').original.text, /jaskrawem.*warjatów/);
  assert.doesNotMatch(quotes.get('quote-603').original.text, /\n/);
  assert.doesNotMatch(quotes.get('quote-603').t, /\n/);
  assert.match(quotes.get('quote-605').t, /con que él solo declaró la guerra/);
  assert.doesNotMatch(quotes.get('quote-605').t, /aquel hombre declaró, él solo/);
  assert.match(quotes.get('quote-607').original.text, /^Gdybym/);
  assert.match(quotes.get('quote-607').original.text, /Ach, jakby ulżył/);
  assert.match(quotes.get('quote-607').t, /^Si, dejando de lado el respeto al Creador/);
  assert.match(quotes.get('quote-607').t, /¡Más modestia.*más contención.*—señores demiurgos—/);
  assert.match(quotes.get('quote-608').original.text, /materji.*morfologji.*materja.*wogóle/);
  assert.match(quotes.get('quote-608').t, /^En realidad eran seres amorfos/);
  assert.doesNotMatch(quotes.get('quote-608').t, /\n/);
  assert.match(quotes.get('quote-610').original.text, /głodem samopoznania/);
  assert.doesNotMatch(quotes.get('quote-610').original.text, /głosem samopoznania/);
  assert.match(quotes.get('quote-610').t, /mil posibilidades caleidoscópicas/);
  assert.match(quotes.get('quote-610').t, /un hambre de autoconocimiento disfrazada/);
  assert.equal(quotes.get('quote-610').highlight, 'un hambre de autoconocimiento disfrazada');
  assert.doesNotMatch(quotes.get('quote-612').original.text, /\n/);
  assert.doesNotMatch(quotes.get('quote-612').t, /\n/);
  assert.match(quotes.get('quote-613').original.text, /fjołkami.*w którem.*w tem/);
  assert.doesNotMatch(quotes.get('quote-613').t, /\n/);
  assert.match(quotes.get('quote-614').original.text, /cynamonowemi.*boazeryj.*materjałów/s);
  assert.match(quotes.get('quote-615').original.text, /którym, jak szósty mały palec u ręki,/);
  for (const quote of schulzQuotes) {
    assert.deepEqual(Object.keys(quote.original).sort(), ['label', 'lang', 'text']);
  }
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

test('build-public-quotes aplica correcciones y exclusiones editoriales aceptadas', async () => {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'paramo-public-decisions-test-'));
  await mkdir(path.join(temporaryRoot, 'scripts'), { recursive: true });
  await cp(new URL('../scripts/build-public-quotes.mjs', import.meta.url), path.join(temporaryRoot, 'scripts/build-public-quotes.mjs'));
  await cp(new URL('../data/editorial', import.meta.url), path.join(temporaryRoot, 'data/editorial'), { recursive: true });
  const decisionBase = {
    old_value: null,
    reason: 'Decisión de prueba aceptada.',
    reviewer: 'test',
    reviewed_at: '2026-08-20T00:00:00Z',
    status: 'accepted',
  };
  await writeFile(
    path.join(temporaryRoot, 'data/editorial/editorial-decisions.json'),
    `${JSON.stringify({ decisions: [
      {
        ...decisionBase,
        legacy_index: 2,
        decision_type: 'exclude_quote',
        field: 'excluded',
        new_value: true,
      },
      {
        ...decisionBase,
        legacy_index: 3,
        decision_type: 'highlight_correction',
        field: 'highlight',
        new_value: 'destacado revisado',
      },
    ] })}\n`,
  );
  const result = spawnSync(process.execPath, ['scripts/build-public-quotes.mjs'], {
    cwd: temporaryRoot,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  const generated = JSON.parse(await readFile(path.join(temporaryRoot, 'public/data/quotes.json'), 'utf8'));
  assert.equal(generated.quote_count, 639);
  assert.equal(generated.quotes.some(quote => quote.id === 'quote-2'), false);
  assert.equal(generated.quotes.find(quote => quote.id === 'quote-3').highlight, 'destacado revisado');
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
  assert.match(source, /const emphasisPattern = \/_\(\[\^_\\n\]\+\)_\(\[,\.;:!\?…\]\*\)\/g/);
});
