import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const editorialDirectory = path.join(projectRoot, 'data', 'editorial');
const decisionsPath = path.join(editorialDirectory, 'editorial-decisions.json');
const quotesPath = path.join(editorialDirectory, 'quotes.normalized.draft.json');

const allowedDecisionTypes = new Set([
  'attribution_type',
  'speaker_name',
  'author_correction',
  'work_correction',
  'highlight_correction',
  'source_note',
  'rights_note',
  'exclude_quote',
  'other',
]);
const allowedStatuses = new Set(['proposed', 'accepted', 'rejected', 'needs_review']);
const requiredFields = [
  'legacy_index',
  'decision_type',
  'field',
  'old_value',
  'new_value',
  'reason',
  'reviewer',
  'reviewed_at',
  'status',
];

function fail(message) {
  throw new Error(`Decisiones editoriales inválidas: ${message}`);
}

function isIsoDateTime(value) {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && !Number.isNaN(Date.parse(value));
}

const decisionsDocument = JSON.parse(await readFile(decisionsPath, 'utf8'));
const normalizedQuotes = JSON.parse(await readFile(quotesPath, 'utf8'));

if (!decisionsDocument || typeof decisionsDocument !== 'object' || Array.isArray(decisionsDocument)) {
  fail('editorial-decisions.json debe contener un objeto');
}
if (!Array.isArray(decisionsDocument.decisions)) {
  fail('decisions debe ser un array');
}
if (!Array.isArray(normalizedQuotes)) {
  fail('quotes.normalized.draft.json debe contener un array');
}

const quoteIndexes = new Set();
for (const [position, quote] of normalizedQuotes.entries()) {
  if (!quote || typeof quote !== 'object' || !Number.isInteger(quote.legacy_index)) {
    fail(`la cita normalizada en la posición ${position} no tiene un legacy_index entero`);
  }
  if (quoteIndexes.has(quote.legacy_index)) {
    fail(`quotes.normalized.draft.json repite legacy_index ${quote.legacy_index}`);
  }
  quoteIndexes.add(quote.legacy_index);
}

for (const [position, decision] of decisionsDocument.decisions.entries()) {
  const label = `decisions[${position}]`;
  if (!decision || typeof decision !== 'object' || Array.isArray(decision)) {
    fail(`${label} debe ser un objeto`);
  }
  for (const field of requiredFields) {
    if (!Object.hasOwn(decision, field)) fail(`${label} no contiene ${field}`);
  }
  if (decision.legacy_index !== null && !Number.isInteger(decision.legacy_index)) {
    fail(`${label}.legacy_index debe ser un entero o null`);
  }
  if (Number.isInteger(decision.legacy_index) && !quoteIndexes.has(decision.legacy_index)) {
    fail(`${label}.legacy_index (${decision.legacy_index}) no existe en quotes.normalized.draft.json`);
  }
  if (!allowedDecisionTypes.has(decision.decision_type)) {
    fail(`${label}.decision_type no está permitido: ${decision.decision_type}`);
  }
  if (!allowedStatuses.has(decision.status)) {
    fail(`${label}.status no está permitido: ${decision.status}`);
  }
  if (typeof decision.field !== 'string' || !decision.field.trim()) {
    fail(`${label}.field debe ser un texto no vacío`);
  }
  if (typeof decision.reason !== 'string' || !decision.reason.trim()) {
    fail(`${label}.reason debe ser un texto no vacío`);
  }
  if (decision.reviewer !== null
    && (typeof decision.reviewer !== 'string' || !decision.reviewer.trim())) {
    fail(`${label}.reviewer debe ser un texto no vacío o null`);
  }
  if (decision.reviewed_at !== null && !isIsoDateTime(decision.reviewed_at)) {
    fail(`${label}.reviewed_at debe ser una fecha y hora ISO 8601 o null`);
  }
}

console.log(
  `Decisiones editoriales válidas: ${decisionsDocument.decisions.length} decisión(es), `
  + `${normalizedQuotes.length} cita(s) de referencia.`,
);
