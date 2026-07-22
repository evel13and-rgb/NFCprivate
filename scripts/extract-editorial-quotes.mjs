import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const sourcePath = path.join(projectRoot, 'script.js');
const outputDirectory = path.join(projectRoot, 'data', 'editorial');
const quotesPath = path.join(outputDirectory, 'quotes.intermediate.json');
const reportPath = path.join(outputDirectory, 'migration-report.json');

const source = await readFile(sourcePath, 'utf8');

function extractQuoteOrder(code) {
  const match = code.match(/const QUOTES = \[([\s\S]*?)\n\];/);
  if (!match) throw new Error('No se encontró la declaración de QUOTES');

  const names = [...match[1].matchAll(/\.\.\.([A-Z0-9_]+_QUOTES)/g)].map(result => result[1]);
  if (names.length === 0) throw new Error('QUOTES no contiene colecciones reconocibles');
  return names;
}

function extractCollection(code, name) {
  const declaration = `const ${name} =`;
  const start = code.indexOf(declaration);
  if (start < 0) throw new Error(`No se encontró ${name}`);

  const valueStart = start + declaration.length;
  const nextDeclaration = code.indexOf('\nconst ', valueStart);
  if (nextDeclaration < 0) throw new Error(`No se encontró el final de ${name}`);

  let expression = code.slice(valueStart, nextDeclaration).trim();
  if (!expression.endsWith(';')) throw new Error(`${name} no termina en punto y coma`);
  expression = expression.slice(0, -1).trim();

  let type = 'prose';
  const poemSuffix = '.map(quote => ({ ...quote, type: "poem" }))';
  if (expression.endsWith(poemSuffix)) {
    type = 'poem';
    expression = expression.slice(0, -poemSuffix.length).trim();
  }

  // Las interpolaciones podrían ejecutar expresiones; las colecciones editoriales
  // solo deben contener arrays de objetos y cadenas literales.
  if (!expression.startsWith('[') || !expression.endsWith(']') || expression.includes('${')) {
    throw new Error(`${name} no es un array literal editorial seguro`);
  }

  const values = new vm.Script(`(${expression})`, { filename: 'script.js' }).runInNewContext(
    Object.create(null),
    { timeout: 1_000, contextCodeGeneration: { strings: false, wasm: false } },
  );
  if (!Array.isArray(values)) throw new Error(`${name} no produjo un array`);

  return values.map(value => ({ ...value, type: value.type ?? type }));
}

function inferWorkAndAuthor(legacyWork) {
  if (typeof legacyWork !== 'string' || !legacyWork.trim()) {
    return { work: null, author: null, ambiguous: true };
  }

  const separator = legacyWork.lastIndexOf(',');
  if (separator < 0) {
    return { work: legacyWork.trim(), author: null, ambiguous: true };
  }

  const work = legacyWork.slice(0, separator).trim();
  const author = legacyWork.slice(separator + 1).trim();
  return { work, author, ambiguous: !work || !author };
}

function normalizeForComparison(text) {
  return text
    .normalize('NFKD')
    .replace(/\p{Mark}/gu, '')
    .toLocaleLowerCase('es')
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim();
}

function groupedDuplicates(records, keyFor, includeSingletons = false) {
  const groups = new Map();
  for (const record of records) {
    const key = keyFor(record);
    const indexes = groups.get(key) ?? [];
    indexes.push(record.legacy_index);
    groups.set(key, indexes);
  }

  return [...groups.entries()]
    .filter(([, indexes]) => includeSingletons || indexes.length > 1)
    .map(([key, legacy_indexes]) => ({ key, legacy_indexes }));
}

const quoteOrder = extractQuoteOrder(source);
const records = quoteOrder.flatMap(sourceCollection =>
  extractCollection(source, sourceCollection).map(quote => ({ sourceCollection, quote })),
).map(({ sourceCollection, quote }, legacyIndex) => {
  if (typeof quote.t !== 'string') throw new Error(`${sourceCollection}[${legacyIndex}] no tiene texto`);

  return {
    legacy_index: legacyIndex,
    source_collection: sourceCollection,
    text: quote.t,
    legacy_attribution: typeof quote.a === 'string' ? quote.a : null,
    legacy_work: typeof quote.obra === 'string' ? quote.obra : null,
    language: typeof quote.lang === 'string' ? quote.lang : null,
    highlight: typeof quote.highlight === 'string' ? quote.highlight : null,
    type: quote.type === 'poem' ? 'poem' : 'prose',
    has_line_breaks: quote.t.includes('\n'),
    text_hash: createHash('sha256').update(quote.t, 'utf8').digest('hex'),
  };
});

const inferred = records.map(record => ({ record, ...inferWorkAndAuthor(record.legacy_work) }));
const exactDuplicates = groupedDuplicates(records, record => record.text);
const normalizedDuplicates = groupedDuplicates(records, record => normalizeForComparison(record.text))
  .filter(group => {
    const texts = new Set(group.legacy_indexes.map(index => records[index].text));
    return texts.size > 1;
  });
const highlightsPresent = records.filter(record => record.highlight !== null && record.highlight.trim() !== '');

const report = {
  total_quotes: records.length,
  detected_works: new Set(inferred.map(item => item.work).filter(Boolean)).size,
  inferred_authors: new Set(inferred.map(item => item.author).filter(Boolean)).size,
  poems: records.filter(record => record.type === 'poem').length,
  prose: records.filter(record => record.type === 'prose').length,
  quotes_with_line_breaks: records.filter(record => record.has_line_breaks).length,
  highlights_present: highlightsPresent.length,
  highlights_absent: records.length - highlightsPresent.length,
  highlights_not_literal: highlightsPresent
    .filter(record => !record.text.includes(record.highlight))
    .map(record => ({ legacy_index: record.legacy_index, highlight: record.highlight })),
  exact_duplicates: exactDuplicates,
  possible_normalized_duplicates: normalizedDuplicates,
  ambiguous_works: inferred
    .filter(item => item.ambiguous)
    .map(item => ({ legacy_index: item.record.legacy_index, legacy_work: item.record.legacy_work })),
  ambiguous_attributions: inferred
    .filter(item => !item.record.legacy_attribution || !item.author)
    .map(item => ({
      legacy_index: item.record.legacy_index,
      legacy_attribution: item.record.legacy_attribution,
      inferred_author: item.author,
    })),
  attribution_looks_like_character_or_narrator: inferred
    .filter(item => item.author && item.record.legacy_attribution !== item.author)
    .map(item => ({
      legacy_index: item.record.legacy_index,
      legacy_attribution: item.record.legacy_attribution,
      inferred_author: item.author,
      legacy_work: item.record.legacy_work,
    })),
};

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(quotesPath, `${JSON.stringify(records, null, 2)}\n`, 'utf8'),
  writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8'),
]);

console.log(`Extraídas ${records.length} frases de ${quoteOrder.length} colecciones.`);
console.log(path.relative(projectRoot, quotesPath));
console.log(path.relative(projectRoot, reportPath));
