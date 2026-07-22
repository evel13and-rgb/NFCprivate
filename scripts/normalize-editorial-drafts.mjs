import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const editorialDirectory = path.join(projectRoot, 'data', 'editorial');
const inputPath = path.join(editorialDirectory, 'quotes.intermediate.json');
const outputPaths = {
  authors: path.join(editorialDirectory, 'authors.draft.json'),
  works: path.join(editorialDirectory, 'works.draft.json'),
  quotes: path.join(editorialDirectory, 'quotes.normalized.draft.json'),
  report: path.join(editorialDirectory, 'normalization-report.json'),
};

function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/\p{Mark}/gu, '')
    .toLocaleLowerCase('es')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

function parseLegacyWork(legacyWork) {
  if (typeof legacyWork !== 'string' || !legacyWork.trim()) {
    return {
      title: null,
      authorName: null,
      isAmbiguous: true,
      reason: 'legacy_work ausente o vacío',
    };
  }

  const value = legacyWork.trim();
  const separator = value.lastIndexOf(',');
  if (separator < 0) {
    return {
      title: value,
      authorName: null,
      isAmbiguous: true,
      reason: 'legacy_work sin coma final clara para separar autor',
    };
  }

  const title = value.slice(0, separator).trim();
  const authorName = value.slice(separator + 1).trim();
  if (!title || !authorName) {
    return {
      title: title || null,
      authorName: authorName || null,
      isAmbiguous: true,
      reason: 'título o autor vacío después de separar por la última coma',
    };
  }

  return { title, authorName, isAmbiguous: false, reason: null };
}

function classifyAttribution(legacyAttribution, authorName) {
  const attribution = typeof legacyAttribution === 'string' ? legacyAttribution.trim() : '';
  if (!attribution) return { type: 'ambiguous', speakerName: null };
  if (authorName && attribution === authorName) return { type: 'author', speakerName: null };
  if (/^(voces|susurros)\b/iu.test(attribution)) {
    return { type: 'collective_voice', speakerName: attribution };
  }

  // Una diferencia con el autor indica una voz atribuida, pero no basta para
  // decidir automáticamente si se trata de personaje o narrador.
  return { type: 'ambiguous', speakerName: attribution };
}

function assertIntermediateQuote(quote, position) {
  const requiredKeys = [
    'legacy_index',
    'source_collection',
    'text',
    'legacy_attribution',
    'legacy_work',
    'language',
    'highlight',
    'type',
    'has_line_breaks',
    'text_hash',
  ];
  for (const key of requiredKeys) {
    if (!Object.hasOwn(quote, key)) throw new Error(`La frase ${position} no contiene ${key}`);
  }
  if (quote.legacy_index !== position) {
    throw new Error(`Orden inesperado: posición ${position}, legacy_index ${quote.legacy_index}`);
  }
  const computedHash = createHash('sha256').update(quote.text, 'utf8').digest('hex');
  if (computedHash !== quote.text_hash) throw new Error(`text_hash inválido en legacy_index ${position}`);
  if (quote.has_line_breaks !== quote.text.includes('\n')) {
    throw new Error(`has_line_breaks incoherente en legacy_index ${position}`);
  }
}

const intermediateQuotes = JSON.parse(await readFile(inputPath, 'utf8'));
if (!Array.isArray(intermediateQuotes)) throw new Error('quotes.intermediate.json debe contener un array');
intermediateQuotes.forEach(assertIntermediateQuote);

const parsedByLegacyWork = new Map();
for (const quote of intermediateQuotes) {
  if (!parsedByLegacyWork.has(quote.legacy_work)) {
    parsedByLegacyWork.set(quote.legacy_work, parseLegacyWork(quote.legacy_work));
  }
}

const authorNames = [...new Set(
  [...parsedByLegacyWork.values()].map(parsed => parsed.authorName).filter(Boolean),
)];
const authors = authorNames.map(canonicalName => {
  const slug = slugify(canonicalName);
  const inferredFrom = [...parsedByLegacyWork.entries()]
    .filter(([, parsed]) => parsed.authorName === canonicalName)
    .map(([legacyWork]) => legacyWork);
  return {
    id: `author-${slug}`,
    canonical_name: canonicalName,
    slug,
    sort_name: canonicalName,
    inferred_from: inferredFrom,
    status: 'draft',
    notes: 'Nombre inferido desde legacy_work; sort_name pendiente de revisión editorial.',
  };
});
const authorByName = new Map(authors.map(author => [author.canonical_name, author]));

const works = [...parsedByLegacyWork.entries()].map(([legacyWork, parsed]) => {
  const title = parsed.title ?? 'Obra sin identificar';
  const slug = slugify(title);
  return {
    id: `work-${slug}`,
    title,
    slug,
    author_id: parsed.authorName ? authorByName.get(parsed.authorName)?.id ?? null : null,
    legacy_work: legacyWork,
    status: 'draft',
    notes: parsed.isAmbiguous
      ? `Revisión pendiente: ${parsed.reason}.`
      : 'Título y autor inferidos separando legacy_work por la última coma.',
  };
});

const duplicateAuthorIds = authors.filter((author, index) =>
  authors.findIndex(candidate => candidate.id === author.id) !== index,
);
const duplicateWorkIds = works.filter((work, index) =>
  works.findIndex(candidate => candidate.id === work.id) !== index,
);
if (duplicateAuthorIds.length || duplicateWorkIds.length) {
  throw new Error('La generación de slugs produjo identificadores duplicados; se requiere revisión editorial');
}

const workByLegacyValue = new Map(works.map(work => [work.legacy_work, work]));
const normalizedQuotes = intermediateQuotes.map(quote => {
  const parsed = parsedByLegacyWork.get(quote.legacy_work);
  const authorId = parsed.authorName ? authorByName.get(parsed.authorName)?.id ?? null : null;
  const workId = workByLegacyValue.get(quote.legacy_work)?.id ?? null;
  const attribution = classifyAttribution(quote.legacy_attribution, parsed.authorName);

  return {
    legacy_index: quote.legacy_index,
    source_collection: quote.source_collection,
    text: quote.text,
    highlight: quote.highlight,
    language: quote.language,
    type: quote.type,
    has_line_breaks: quote.has_line_breaks,
    text_hash: quote.text_hash,
    legacy_attribution: quote.legacy_attribution,
    legacy_work: quote.legacy_work,
    work_id: workId,
    author_id: authorId,
    speaker_name: attribution.speakerName,
    attribution_type: attribution.type,
  };
});

const attributionCounts = Object.fromEntries(
  ['author', 'character', 'narrator', 'collective_voice', 'ambiguous'].map(type => [
    type,
    normalizedQuotes.filter(quote => quote.attribution_type === type).length,
  ]),
);
const worksWithoutClearComma = [...parsedByLegacyWork.entries()]
  .filter(([, parsed]) => parsed.isAmbiguous)
  .map(([legacyWork, parsed]) => ({
    legacy_work: legacyWork,
    reason: parsed.reason,
    legacy_indexes: intermediateQuotes
      .filter(quote => quote.legacy_work === legacyWork)
      .map(quote => quote.legacy_index),
  }));
const authorMatches = normalizedQuotes
  .filter(quote => quote.attribution_type === 'author')
  .map(quote => quote.legacy_index);
const possibleSpeakerCases = normalizedQuotes
  .filter(quote => ['ambiguous', 'collective_voice'].includes(quote.attribution_type) && quote.speaker_name)
  .map(quote => ({
    legacy_index: quote.legacy_index,
    legacy_attribution: quote.legacy_attribution,
    author_id: quote.author_id,
    provisional_type: quote.attribution_type,
  }));

const report = {
  total_quotes_processed: normalizedQuotes.length,
  total_authors_generated: authors.length,
  total_works_generated: works.length,
  quotes_without_author_id: normalizedQuotes
    .filter(quote => !quote.author_id)
    .map(quote => quote.legacy_index),
  quotes_without_work_id: normalizedQuotes
    .filter(quote => !quote.work_id)
    .map(quote => quote.legacy_index),
  attributions_by_type: attributionCounts,
  ambiguous_works: worksWithoutClearComma,
  ambiguous_authors: worksWithoutClearComma.map(item => ({
    legacy_work: item.legacy_work,
    legacy_attributions: [...new Set(intermediateQuotes
      .filter(quote => quote.legacy_work === item.legacy_work)
      .map(quote => quote.legacy_attribution))],
    reason: 'No se puede inferir el autor de legacy_work con seguridad.',
  })),
  legacy_work_without_clear_final_comma: worksWithoutClearComma,
  legacy_attribution_matches_author: {
    count: authorMatches.length,
    legacy_indexes: authorMatches,
  },
  legacy_attribution_looks_like_character_or_narrator: {
    count: possibleSpeakerCases.length,
    cases: possibleSpeakerCases,
  },
  pending_editorial_issues: [
    ...worksWithoutClearComma.map(item => ({
      scope: 'work_author',
      legacy_work: item.legacy_work,
      legacy_indexes: item.legacy_indexes,
      issue: item.reason,
    })),
    ...possibleSpeakerCases
      .filter(item => item.provisional_type === 'ambiguous')
      .map(item => ({
        scope: 'attribution',
        legacy_index: item.legacy_index,
        legacy_attribution: item.legacy_attribution,
        issue: 'Decidir editorialmente si la atribución corresponde a personaje o narrador.',
      })),
  ],
};

await Promise.all([
  writeFile(outputPaths.authors, `${JSON.stringify(authors, null, 2)}\n`, 'utf8'),
  writeFile(outputPaths.works, `${JSON.stringify(works, null, 2)}\n`, 'utf8'),
  writeFile(outputPaths.quotes, `${JSON.stringify(normalizedQuotes, null, 2)}\n`, 'utf8'),
  writeFile(outputPaths.report, `${JSON.stringify(report, null, 2)}\n`, 'utf8'),
]);

console.log(`Normalizadas ${normalizedQuotes.length} frases.`);
console.log(`Generados ${authors.length} autores y ${works.length} obras en estado draft.`);
for (const outputPath of Object.values(outputPaths)) {
  console.log(path.relative(projectRoot, outputPath));
}
