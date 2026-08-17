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
  assert.match(source, /const emphasisPattern = \/_\(\[\^_\\n\]\+\)_\(\[,\.;:!\?…\]\*\)\/g/);
});
