import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const editorialDirectory = path.join(projectRoot, 'data', 'editorial');
const reportPath = path.join(editorialDirectory, 'catalog-validation-report.json');

const reviewedFiles = [
  'data/editorial/quotes.intermediate.json',
  'data/editorial/authors.draft.json',
  'data/editorial/works.draft.json',
  'data/editorial/quotes.normalized.draft.json',
  'data/editorial/migration-report.json',
  'data/editorial/normalization-report.json',
  'data/editorial/editorial-decisions.json',
  'data/editorial/sources.draft.json',
];
const blockingErrors = [];
const editorialWarnings = [];
const pendingIssues = [];
const integratedChecks = {};

function runExistingValidator(name, relativePath) {
  const result = spawnSync(process.execPath, [path.join(projectRoot, relativePath)], {
    cwd: projectRoot,
    encoding: 'utf8',
  });
  integratedChecks[name] = {
    valid: result.status === 0,
    message: (result.status === 0 ? result.stdout : result.stderr || result.stdout).trim(),
  };
  if (result.status !== 0) {
    blockingErrors.push(`${relativePath}: falló la validación integrada (${integratedChecks[name].message})`);
  }
}

async function loadJson(relativePath, fallback) {
  try {
    return JSON.parse(await readFile(path.join(projectRoot, relativePath), 'utf8'));
  } catch (error) {
    blockingErrors.push(`${relativePath}: no se pudo leer o interpretar (${error.message})`);
    return fallback;
  }
}

function duplicateGroups(records, keyName) {
  const groups = new Map();
  for (const record of records) {
    const key = record?.[keyName];
    if (key === undefined || key === null) continue;
    const indexes = groups.get(key) ?? [];
    indexes.push(record.legacy_index);
    groups.set(key, indexes);
  }
  return [...groups.entries()]
    .filter(([, indexes]) => indexes.length > 1)
    .map(([value, legacy_indexes]) => ({ [keyName]: value, legacy_indexes }));
}

function requireNonEmptyId(record, field, label) {
  if (!record || typeof record !== 'object' || typeof record[field] !== 'string' || !record[field].trim()) {
    blockingErrors.push(`${label}: ${field} está ausente o vacío`);
    return false;
  }
  return true;
}

const [intermediateQuotes, authors, works, normalizedQuotes, migrationReport,
  normalizationReport, decisionsDocument, sources] = await Promise.all([
  loadJson(reviewedFiles[0], []),
  loadJson(reviewedFiles[1], []),
  loadJson(reviewedFiles[2], []),
  loadJson(reviewedFiles[3], []),
  loadJson(reviewedFiles[4], {}),
  loadJson(reviewedFiles[5], {}),
  loadJson(reviewedFiles[6], { decisions: [] }),
  loadJson(reviewedFiles[7], []),
]);

runExistingValidator('editorial_decisions', 'scripts/validate-editorial-decisions.mjs');
runExistingValidator('editorial_sources', 'scripts/validate-editorial-sources.mjs');

for (const [name, value] of [
  ['quotes.intermediate.json', intermediateQuotes],
  ['authors.draft.json', authors],
  ['works.draft.json', works],
  ['quotes.normalized.draft.json', normalizedQuotes],
  ['sources.draft.json', sources],
]) {
  if (!Array.isArray(value)) blockingErrors.push(`${name} debe contener un array`);
}

const safeIntermediate = Array.isArray(intermediateQuotes) ? intermediateQuotes : [];
const safeAuthors = Array.isArray(authors) ? authors : [];
const safeWorks = Array.isArray(works) ? works : [];
const safeNormalized = Array.isArray(normalizedQuotes) ? normalizedQuotes : [];
const safeSources = Array.isArray(sources) ? sources : [];
const decisions = Array.isArray(decisionsDocument?.decisions) ? decisionsDocument.decisions : [];
if (!Array.isArray(decisionsDocument?.decisions)) {
  blockingErrors.push('editorial-decisions.json: decisions debe contener un array');
}

if (safeIntermediate.length !== 366) {
  blockingErrors.push(`quotes.intermediate.json: se esperaban 366 frases y hay ${safeIntermediate.length}`);
}
if (safeNormalized.length !== 366) {
  blockingErrors.push(`quotes.normalized.draft.json: se esperaban 366 frases y hay ${safeNormalized.length}`);
}
if (migrationReport?.total_quotes !== 366) {
  blockingErrors.push(`migration-report.json: total_quotes debe ser 366 y es ${migrationReport?.total_quotes}`);
}
if (normalizationReport?.total_quotes_processed !== 366) {
  blockingErrors.push(
    `normalization-report.json: total_quotes_processed debe ser 366 y es ${normalizationReport?.total_quotes_processed}`,
  );
}

const duplicateLegacyIndexes = duplicateGroups(safeNormalized, 'legacy_index');
if (duplicateLegacyIndexes.length) {
  blockingErrors.push(`legacy_index duplicados: ${JSON.stringify(duplicateLegacyIndexes)}`);
}
const intermediateDuplicateIndexes = duplicateGroups(safeIntermediate, 'legacy_index');
if (intermediateDuplicateIndexes.length) {
  blockingErrors.push(`legacy_index duplicados en extracción: ${JSON.stringify(intermediateDuplicateIndexes)}`);
}

const duplicateTextHashes = duplicateGroups(safeNormalized, 'text_hash');
if (duplicateTextHashes.length) {
  editorialWarnings.push({
    code: 'duplicate_text_hashes',
    message: 'Hay textos exactamente duplicados que requieren revisión editorial.',
    duplicates: duplicateTextHashes,
  });
}

const intermediateByIndex = new Map(safeIntermediate.map(quote => [quote?.legacy_index, quote]));
for (const [position, quote] of safeIntermediate.entries()) {
  const label = `quotes.intermediate.json[${position}]`;
  if (!quote || typeof quote !== 'object') {
    blockingErrors.push(`${label}: la frase no es un objeto`);
    continue;
  }
  if (!Number.isInteger(quote.legacy_index)) blockingErrors.push(`${label}: legacy_index no es entero`);
  if (typeof quote.text !== 'string' || !quote.text.trim()) blockingErrors.push(`${label}: texto vacío`);
  if (typeof quote.text === 'string') {
    const hash = createHash('sha256').update(quote.text, 'utf8').digest('hex');
    if (quote.text_hash !== hash) blockingErrors.push(`${label}: text_hash no corresponde al texto`);
    if (quote.has_line_breaks !== quote.text.includes('\n')) {
      blockingErrors.push(`${label}: has_line_breaks no corresponde al texto`);
    }
  }
}

const authorIds = new Set();
for (const [position, author] of safeAuthors.entries()) {
  const label = `authors.draft.json[${position}]`;
  if (requireNonEmptyId(author, 'id', label)) {
    if (authorIds.has(author.id)) blockingErrors.push(`${label}: id de autor duplicado ${author.id}`);
    authorIds.add(author.id);
  }
  if (typeof author?.canonical_name !== 'string' || !author.canonical_name.trim()) {
    blockingErrors.push(`${label}: autor vacío`);
  }
}

const documentedAmbiguousWorks = new Set(
  Array.isArray(normalizationReport?.ambiguous_works)
    ? normalizationReport.ambiguous_works.map(item => item?.legacy_work).filter(Boolean)
    : [],
);
const workIds = new Set();
const workById = new Map();
for (const [position, work] of safeWorks.entries()) {
  const label = `works.draft.json[${position}]`;
  if (requireNonEmptyId(work, 'id', label)) {
    if (workIds.has(work.id)) blockingErrors.push(`${label}: id de obra duplicado ${work.id}`);
    workIds.add(work.id);
    workById.set(work.id, work);
  }
  if (typeof work?.title !== 'string' || !work.title.trim()) blockingErrors.push(`${label}: obra vacía`);
  if (work?.author_id === null) {
    if (documentedAmbiguousWorks.has(work.legacy_work)) {
      pendingIssues.push({
        code: 'documented_work_without_author',
        work_id: work.id,
        legacy_work: work.legacy_work,
        message: 'La obra no tiene autor inferido y figura como ambigua en normalization-report.json.',
      });
    } else {
      blockingErrors.push(`${label}: la obra no tiene autor y la incidencia no está documentada`);
    }
  } else if (typeof work?.author_id !== 'string' || !authorIds.has(work.author_id)) {
    blockingErrors.push(`${label}: author_id no existe en authors.draft.json (${work?.author_id})`);
  }
}

for (const [position, quote] of safeNormalized.entries()) {
  const label = `quotes.normalized.draft.json[${position}]`;
  if (!quote || typeof quote !== 'object') {
    blockingErrors.push(`${label}: la frase no es un objeto`);
    continue;
  }
  if (!Number.isInteger(quote.legacy_index)) blockingErrors.push(`${label}: legacy_index no es entero`);
  if (typeof quote.text !== 'string' || !quote.text.trim()) blockingErrors.push(`${label}: texto vacío`);
  if (typeof quote.work_id !== 'string' || !workIds.has(quote.work_id)) {
    blockingErrors.push(`${label}: work_id no existe (${quote.work_id})`);
  }
  const work = workById.get(quote.work_id);
  const documentedAmbiguity = work && documentedAmbiguousWorks.has(work.legacy_work);
  if (quote.author_id === null) {
    if (!documentedAmbiguity) blockingErrors.push(`${label}: author_id ausente sin ambigüedad documentada`);
  } else if (typeof quote.author_id !== 'string' || !authorIds.has(quote.author_id)) {
    blockingErrors.push(`${label}: author_id no existe (${quote.author_id})`);
  }

  const extracted = intermediateByIndex.get(quote.legacy_index);
  if (!extracted) {
    blockingErrors.push(`${label}: no existe la frase correspondiente en la extracción`);
  } else {
    if (quote.text !== extracted.text) blockingErrors.push(`${label}: el texto cambió durante la normalización`);
    if (quote.text_hash !== extracted.text_hash) blockingErrors.push(`${label}: text_hash cambió durante la normalización`);
    if (quote.type !== extracted.type) blockingErrors.push(`${label}: el tipo cambió durante la normalización`);
    if (quote.has_line_breaks !== extracted.has_line_breaks) {
      blockingErrors.push(`${label}: se perdió la información de saltos de línea`);
    }
    if (quote.type === 'poem' && quote.text !== extracted.text) {
      blockingErrors.push(`${label}: el poema perdió texto o saltos de línea`);
    }
  }
}

const sourceIds = new Set();
const sourcedWorkIds = new Set();
const allowedRightsStatuses = new Set([
  'unchecked', 'review_in_progress', 'permission_required', 'cleared', 'restricted',
]);
const allowedVerificationStatuses = new Set(['pending', 'in_review', 'verified', 'rejected']);
for (const [position, source] of safeSources.entries()) {
  const label = `sources.draft.json[${position}]`;
  if (requireNonEmptyId(source, 'id', label)) {
    if (sourceIds.has(source.id)) blockingErrors.push(`${label}: id de fuente duplicado ${source.id}`);
    sourceIds.add(source.id);
  }
  if (typeof source?.work_id !== 'string' || !workIds.has(source.work_id)) {
    blockingErrors.push(`${label}: work_id no existe (${source?.work_id})`);
  } else {
    sourcedWorkIds.add(source.work_id);
  }
  if (!allowedRightsStatuses.has(source?.rights_status)) {
    blockingErrors.push(`${label}: rights_status no permitido (${source?.rights_status})`);
  }
  if (!allowedVerificationStatuses.has(source?.verification_status)) {
    blockingErrors.push(`${label}: verification_status no permitido (${source?.verification_status})`);
  }
}
for (const workId of workIds) {
  if (!sourcedWorkIds.has(workId)) blockingErrors.push(`obra sin fuente provisional: ${workId}`);
}

const allowedDecisionTypes = new Set([
  'attribution_type', 'speaker_name', 'author_correction', 'work_correction',
  'highlight_correction', 'source_note', 'rights_note', 'exclude_quote', 'other',
]);
const allowedDecisionStatuses = new Set(['proposed', 'accepted', 'rejected', 'needs_review']);
const normalizedIndexes = new Set(safeNormalized.map(quote => quote?.legacy_index));
for (const [position, decision] of decisions.entries()) {
  const label = `editorial-decisions.json decisions[${position}]`;
  if (!allowedDecisionTypes.has(decision?.decision_type)) {
    blockingErrors.push(`${label}: decision_type no permitido (${decision?.decision_type})`);
  }
  if (!allowedDecisionStatuses.has(decision?.status)) {
    blockingErrors.push(`${label}: status no permitido (${decision?.status})`);
  }
  if (decision?.legacy_index !== null && !normalizedIndexes.has(decision?.legacy_index)) {
    blockingErrors.push(`${label}: legacy_index no existe (${decision?.legacy_index})`);
  }
  if (['proposed', 'needs_review'].includes(decision?.status)) {
    pendingIssues.push({ code: 'pending_editorial_decision', position, status: decision.status });
  }
}

const uncheckedSources = safeSources.filter(source => source?.rights_status === 'unchecked');
const pendingSources = safeSources.filter(source => source?.verification_status === 'pending');
if (uncheckedSources.length) {
  editorialWarnings.push({
    code: 'unchecked_rights',
    message: `${uncheckedSources.length} fuente(s) conservan derechos sin revisar.`,
    source_ids: uncheckedSources.map(source => source.id),
  });
  pendingIssues.push({ code: 'rights_review_pending', count: uncheckedSources.length });
}
if (pendingSources.length) {
  editorialWarnings.push({
    code: 'source_verification_pending',
    message: `${pendingSources.length} fuente(s) esperan verificación bibliográfica.`,
    source_ids: pendingSources.map(source => source.id),
  });
  pendingIssues.push({ code: 'source_verification_pending', count: pendingSources.length });
}

const report = {
  valid: blockingErrors.length === 0,
  validated_at: new Date().toISOString(),
  summary: {
    expected_quotes: 366,
    intermediate_quotes: safeIntermediate.length,
    normalized_quotes: safeNormalized.length,
    authors: safeAuthors.length,
    works: safeWorks.length,
    sources: safeSources.length,
    editorial_decisions: decisions.length,
    poems: safeNormalized.filter(quote => quote?.type === 'poem').length,
    quotes_with_line_breaks: safeNormalized.filter(quote => quote?.has_line_breaks === true).length,
    duplicate_text_hash_groups: duplicateTextHashes.length,
  },
  integrated_checks: integratedChecks,
  blocking_errors: blockingErrors,
  editorial_warnings: editorialWarnings,
  pending_issues: pendingIssues,
  reviewed_files: reviewedFiles,
};

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(
  `Catálogo editorial ${report.valid ? 'válido' : 'inválido'}: `
  + `${blockingErrors.length} error(es) bloqueante(s), `
  + `${editorialWarnings.length} advertencia(s), ${pendingIssues.length} incidencia(s) pendiente(s).`,
);
console.log(path.relative(projectRoot, reportPath));
if (!report.valid) process.exitCode = 1;
