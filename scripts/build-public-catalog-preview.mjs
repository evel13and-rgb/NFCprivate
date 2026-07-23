import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const editorialDirectory = path.join(projectRoot, 'data', 'editorial');
const previewPath = path.join(editorialDirectory, 'public-catalog.preview.json');
const reportPath = path.join(editorialDirectory, 'public-catalog-report.json');
const warning = 'VISTA PREVIA INTERNA: los derechos y las fuentes aún requieren verificación. No consumir en producción ni conectar al frontend.';

const privateFields = ['rights_notes', 'notes', 'editorial_notes'];
const quoteFields = [
  'id',
  'text',
  'highlight',
  'language',
  'type',
  'author',
  'author_id',
  'work',
  'work_id',
  'speaker_name',
  'attribution_type',
  'source_collection',
  'legacy_index',
  'text_hash',
];
const errors = [];

async function loadJson(filename, fallback) {
  try {
    return JSON.parse(await readFile(path.join(editorialDirectory, filename), 'utf8'));
  } catch (error) {
    errors.push(`${filename}: no se pudo leer o interpretar (${error.message})`);
    return fallback;
  }
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function duplicateValues(records, field) {
  const values = new Map();
  for (const record of records) {
    const value = record[field];
    values.set(value, (values.get(value) ?? 0) + 1);
  }
  return [...values.entries()].filter(([, count]) => count > 1).map(([value]) => value);
}

function findPrivateFields(value, location = '$', found = []) {
  if (!value || typeof value !== 'object') return found;
  for (const [key, child] of Object.entries(value)) {
    const childLocation = `${location}.${key}`;
    if (privateFields.includes(key)) found.push(childLocation);
    findPrivateFields(child, childLocation, found);
  }
  return found;
}

function validatePreview(catalog, documentedMissingAuthorIndexes) {
  if (!catalog || typeof catalog !== 'object' || Array.isArray(catalog)) {
    errors.push('La vista previa debe ser un objeto.');
    return;
  }
  const metadata = catalog.metadata;
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    errors.push('metadata debe ser un objeto.');
  } else {
    if (!nonEmptyString(metadata.generated_at) || Number.isNaN(Date.parse(metadata.generated_at))) {
      errors.push('metadata.generated_at debe ser una fecha ISO 8601.');
    }
    if (metadata.source !== 'editorial_draft') errors.push('metadata.source no es editorial_draft.');
    if (metadata.preview !== true) errors.push('metadata.preview debe ser true.');
    if (metadata.publication_status !== 'internal_preview') {
      errors.push('metadata.publication_status debe ser internal_preview.');
    }
    if (!nonEmptyString(metadata.warning)) errors.push('metadata.warning está vacío.');
  }

  if (!Array.isArray(catalog.quotes)) {
    errors.push('quotes debe ser un array.');
    return;
  }

  for (const [position, quote] of catalog.quotes.entries()) {
    const label = `quotes[${position}]`;
    if (!quote || typeof quote !== 'object' || Array.isArray(quote)) {
      errors.push(`${label} debe ser un objeto.`);
      continue;
    }
    const actualFields = Object.keys(quote);
    const missingFields = quoteFields.filter(field => !actualFields.includes(field));
    const unexpectedFields = actualFields.filter(field => !quoteFields.includes(field));
    if (missingFields.length) errors.push(`${label}: faltan campos (${missingFields.join(', ')}).`);
    if (unexpectedFields.length) errors.push(`${label}: campos no permitidos (${unexpectedFields.join(', ')}).`);
    for (const field of ['id', 'text', 'language', 'type', 'work', 'work_id', 'attribution_type', 'source_collection', 'text_hash']) {
      if (!nonEmptyString(quote[field])) errors.push(`${label}.${field} está vacío.`);
    }
    if (!Number.isInteger(quote.legacy_index) || quote.legacy_index < 0) {
      errors.push(`${label}.legacy_index debe ser un entero no negativo.`);
    }
    if (quote.author === null || quote.author_id === null) {
      if (!(quote.author === null && quote.author_id === null)) {
        errors.push(`${label}: author y author_id deben ser ambos null o ambos cadenas.`);
      } else if (!documentedMissingAuthorIndexes.has(quote.legacy_index)) {
        errors.push(`${label}: autor ausente sin incidencia documentada.`);
      }
    } else if (!nonEmptyString(quote.author) || !nonEmptyString(quote.author_id)) {
      errors.push(`${label}: autor vacío.`);
    }
    if (!(quote.highlight === null || nonEmptyString(quote.highlight))) {
      errors.push(`${label}.highlight debe ser null o una cadena no vacía.`);
    }
    if (!(quote.speaker_name === null || nonEmptyString(quote.speaker_name))) {
      errors.push(`${label}.speaker_name debe ser null o una cadena no vacía.`);
    }
  }

  for (const field of ['id', 'text_hash', 'legacy_index']) {
    const duplicates = duplicateValues(catalog.quotes, field);
    if (duplicates.length) errors.push(`${field} duplicado(s): ${duplicates.join(', ')}.`);
  }
  if (metadata?.total_quotes !== catalog.quotes.length) {
    errors.push('metadata.total_quotes no coincide con quotes.length.');
  }
  const leakedFields = findPrivateFields(catalog);
  if (leakedFields.length) errors.push(`Campos privados presentes: ${leakedFields.join(', ')}.`);
}

const [authors, works, normalizedQuotes, sources, normalizationReport, decisionsDocument] = await Promise.all([
  loadJson('authors.draft.json', []),
  loadJson('works.draft.json', []),
  loadJson('quotes.normalized.draft.json', []),
  loadJson('sources.draft.json', []),
  loadJson('normalization-report.json', {}),
  loadJson('editorial-decisions.json', { decisions: [] }),
]);

for (const [filename, value] of [
  ['authors.draft.json', authors],
  ['works.draft.json', works],
  ['quotes.normalized.draft.json', normalizedQuotes],
  ['sources.draft.json', sources],
]) {
  if (!Array.isArray(value)) errors.push(`${filename} debe contener un array.`);
}

const safeAuthors = Array.isArray(authors) ? authors : [];
const safeWorks = Array.isArray(works) ? works : [];
const safeQuotes = Array.isArray(normalizedQuotes) ? normalizedQuotes : [];
const safeSources = Array.isArray(sources) ? sources : [];
const safeDecisions = Array.isArray(decisionsDocument?.decisions) ? decisionsDocument.decisions : [];
const authorById = new Map(safeAuthors.map(author => [author.id, author]));
const workById = new Map(safeWorks.map(work => [work.id, work]));
const sourcesByWorkId = new Map();
for (const source of safeSources) {
  const workSources = sourcesByWorkId.get(source.work_id) ?? [];
  workSources.push(source);
  sourcesByWorkId.set(source.work_id, workSources);
}

const documentedAmbiguousWorks = new Set(
  Array.isArray(normalizationReport?.ambiguous_works)
    ? normalizationReport.ambiguous_works.map(item => item?.legacy_work).filter(Boolean)
    : [],
);
const acceptedDecisionsByIndex = new Map();
for (const decision of safeDecisions.filter(item => item?.status === 'accepted' && Number.isInteger(item?.legacy_index))) {
  const decisions = acceptedDecisionsByIndex.get(decision.legacy_index) ?? [];
  decisions.push(decision);
  acceptedDecisionsByIndex.set(decision.legacy_index, decisions);
}

const omittedQuotes = [];
const exportedQuotes = [];
for (const quote of safeQuotes) {
  const decisions = acceptedDecisionsByIndex.get(quote.legacy_index) ?? [];
  if (decisions.some(decision => decision.decision_type === 'exclude_quote' && decision.new_value === true)) {
    omittedQuotes.push({ legacy_index: quote.legacy_index, reason: 'accepted_exclude_quote_decision' });
    continue;
  }

  const resolved = { ...quote };
  for (const decision of decisions) {
    if (['highlight', 'speaker_name', 'attribution_type', 'author_id', 'work_id'].includes(decision.field)) {
      resolved[decision.field] = decision.new_value;
    }
  }
  const work = workById.get(resolved.work_id);
  const author = authorById.get(resolved.author_id);
  exportedQuotes.push({
    id: `quote-${resolved.legacy_index}`,
    text: resolved.text,
    highlight: resolved.highlight ?? null,
    language: resolved.language,
    type: resolved.type,
    author: author?.canonical_name ?? null,
    author_id: resolved.author_id ?? null,
    work: work?.title ?? null,
    work_id: resolved.work_id ?? null,
    speaker_name: resolved.speaker_name ?? null,
    attribution_type: resolved.attribution_type,
    source_collection: resolved.source_collection,
    legacy_index: resolved.legacy_index,
    text_hash: resolved.text_hash,
  });
}

const missingAuthorIndexes = new Set(
  exportedQuotes
    .filter(quote => {
      const work = workById.get(quote.work_id);
      return quote.author_id === null && work && documentedAmbiguousWorks.has(work.legacy_work);
    })
    .map(quote => quote.legacy_index),
);
const worksWithoutVerifiedSource = safeWorks
  .filter(work => !(sourcesByWorkId.get(work.id) ?? []).some(source => source.verification_status === 'verified'))
  .map(work => work.id);
const unverifiedRights = safeSources
  .filter(source => source.rights_status !== 'cleared')
  .map(source => ({ source_id: source.id, work_id: source.work_id, rights_status: source.rights_status }));

const generatedAt = new Date().toISOString();
const catalog = {
  metadata: {
    generated_at: generatedAt,
    total_quotes: exportedQuotes.length,
    total_authors: safeAuthors.length,
    total_works: safeWorks.length,
    source: 'editorial_draft',
    preview: true,
    publication_status: 'internal_preview',
    warning,
  },
  quotes: exportedQuotes,
};

validatePreview(catalog, missingAuthorIndexes);

const report = {
  generated_at: generatedAt,
  preview: true,
  publication_status: 'internal_preview',
  total_quotes_exported: exportedQuotes.length,
  omitted_quotes: omittedQuotes,
  private_fields_excluded: privateFields,
  quotes_missing_author_id: exportedQuotes
    .filter(quote => quote.author_id === null)
    .map(quote => quote.id),
  quotes_missing_work_id: exportedQuotes
    .filter(quote => quote.work_id === null)
    .map(quote => quote.id),
  ambiguous_attributions: exportedQuotes
    .filter(quote => quote.attribution_type === 'ambiguous')
    .map(quote => quote.id),
  works_without_verified_source: worksWithoutVerifiedSource,
  unverified_rights: unverifiedRights,
  production_ready: false,
  production_blockers: [
    ...(worksWithoutVerifiedSource.length ? ['unverified_sources'] : []),
    ...(unverifiedRights.length ? ['unverified_rights'] : []),
    ...(errors.length ? ['catalog_validation_errors'] : []),
  ],
  validation: {
    valid: errors.length === 0,
    errors,
  },
};

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (errors.length) {
  console.error(`Vista previa inválida: ${errors.length} error(es).`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  await writeFile(previewPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  console.log(`Vista previa interna creada: ${exportedQuotes.length} frases, ${omittedQuotes.length} omitida(s).`);
  console.log(path.relative(projectRoot, previewPath));
  console.log(path.relative(projectRoot, reportPath));
}
