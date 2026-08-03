import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXPECTED_QUOTE_COUNT = 590;
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const editorialDirectory = path.join(projectRoot, 'data', 'editorial');
const outputPath = path.join(projectRoot, 'public', 'data', 'quotes.json');

async function loadArray(filename) {
  const value = JSON.parse(await readFile(path.join(editorialDirectory, filename), 'utf8'));
  if (!Array.isArray(value)) throw new Error(`${filename} debe contener un array`);
  return value;
}

function fail(message) {
  throw new Error(`No se pudo generar public/data/quotes.json: ${message}`);
}

function validateSourceRecord(record, position) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    fail(`quotes.intermediate.json[${position}] no es un objeto`);
  }
  if (!Number.isInteger(record.legacy_index) || record.legacy_index < 0) {
    fail(`quotes.intermediate.json[${position}].legacy_index no es válido`);
  }
  for (const field of ['text', 'legacy_attribution', 'legacy_work', 'language', 'type']) {
    if (typeof record[field] !== 'string' || !record[field].length) {
      fail(`quotes.intermediate.json[${position}].${field} está ausente o vacío`);
    }
  }
  if (!(record.highlight === null || (typeof record.highlight === 'string' && record.highlight.length))) {
    fail(`quotes.intermediate.json[${position}].highlight debe ser una cadena no vacía o null`);
  }
}

function validatePublicDocument(document, sourceCount) {
  if (document.schema_version !== 1 || !Array.isArray(document.quotes)) {
    fail('el documento público no cumple la estructura de schema_version 1');
  }
  if (document.quote_count !== EXPECTED_QUOTE_COUNT || document.quotes.length !== EXPECTED_QUOTE_COUNT) {
    fail(`se esperaban ${EXPECTED_QUOTE_COUNT} frases y se generaron ${document.quotes.length}`);
  }
  if (document.quote_count !== sourceCount) {
    fail(`quote_count (${document.quote_count}) no coincide con el catálogo editorial (${sourceCount})`);
  }

  const ids = new Set();
  const legacyIndexes = new Set();
  const allowedFields = new Set([
    'id', 'legacy_index', 't', 'a', 'obra', 'highlight', 'lang', 'type', 'authorId', 'workId',
  ]);
  for (const [position, quote] of document.quotes.entries()) {
    const unexpected = Object.keys(quote).filter(field => !allowedFields.has(field));
    if (unexpected.length) fail(`quotes[${position}] contiene campos no públicos: ${unexpected.join(', ')}`);
    for (const field of ['id', 't', 'a', 'obra', 'lang', 'type']) {
      if (typeof quote[field] !== 'string' || !quote[field].length) {
        fail(`quotes[${position}].${field} está ausente o vacío`);
      }
    }
    if (!(quote.highlight === null || (typeof quote.highlight === 'string' && quote.highlight.length))) {
      fail(`quotes[${position}].highlight debe ser una cadena no vacía o null`);
    }
    if (ids.has(quote.id)) fail(`id duplicado: ${quote.id}`);
    if (legacyIndexes.has(quote.legacy_index)) fail(`legacy_index duplicado: ${quote.legacy_index}`);
    ids.add(quote.id);
    legacyIndexes.add(quote.legacy_index);
  }
}

const [intermediateQuotes, normalizedQuotes] = await Promise.all([
  loadArray('quotes.intermediate.json'),
  loadArray('quotes.normalized.draft.json'),
]);

if (intermediateQuotes.length !== EXPECTED_QUOTE_COUNT) {
  fail(`quotes.intermediate.json contiene ${intermediateQuotes.length} frases; se esperaban ${EXPECTED_QUOTE_COUNT}`);
}
if (normalizedQuotes.length !== intermediateQuotes.length) {
  fail(`el catálogo normalizado contiene ${normalizedQuotes.length} frases y la extracción ${intermediateQuotes.length}`);
}

const normalizedByLegacyIndex = new Map();
for (const [position, quote] of normalizedQuotes.entries()) {
  if (!Number.isInteger(quote?.legacy_index)) fail(`quotes.normalized.draft.json[${position}] no tiene legacy_index válido`);
  if (normalizedByLegacyIndex.has(quote.legacy_index)) fail(`legacy_index normalizado duplicado: ${quote.legacy_index}`);
  normalizedByLegacyIndex.set(quote.legacy_index, quote);
}

const quotes = intermediateQuotes.map((source, position) => {
  validateSourceRecord(source, position);
  const normalized = normalizedByLegacyIndex.get(source.legacy_index);
  if (!normalized) fail(`legacy_index ${source.legacy_index} no existe en quotes.normalized.draft.json`);
  for (const field of ['text', 'highlight', 'language', 'type']) {
    if (normalized[field] !== source[field]) fail(`legacy_index ${source.legacy_index}: ${field} difiere entre extracción y normalización`);
  }
  return {
    id: `quote-${source.legacy_index}`,
    legacy_index: source.legacy_index,
    t: source.text,
    a: source.legacy_attribution,
    obra: source.legacy_work,
    highlight: source.highlight,
    lang: source.language,
    type: source.type,
    authorId: normalized.author_id ?? null,
    workId: normalized.work_id ?? null,
  };
});

const document = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  quote_count: quotes.length,
  quotes,
};

validatePublicDocument(document, intermediateQuotes.length);
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
console.log(`Runtime público de frases generado: ${quotes.length} frases.`);
console.log(path.relative(projectRoot, outputPath));
