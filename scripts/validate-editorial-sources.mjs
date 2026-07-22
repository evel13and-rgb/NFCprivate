import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const editorialDirectory = path.resolve(scriptDirectory, '..', 'data', 'editorial');
const sourcesPath = path.join(editorialDirectory, 'sources.draft.json');
const worksPath = path.join(editorialDirectory, 'works.draft.json');

const requiredFields = [
  'id', 'work_id', 'source_type', 'citation_label', 'edition', 'publisher',
  'publication_year', 'translator_name', 'source_url', 'accessed_at', 'language',
  'rights_status', 'rights_notes', 'verification_status', 'notes',
];
const nullableFields = new Set([
  'citation_label', 'edition', 'publisher', 'publication_year', 'translator_name',
  'source_url', 'accessed_at', 'language', 'rights_notes', 'notes',
]);
const allowedSourceTypes = new Set(['unknown', 'print', 'ebook', 'website', 'manuscript', 'other']);
const allowedRightsStatuses = new Set([
  'unchecked', 'review_in_progress', 'permission_required', 'cleared', 'restricted',
]);
const allowedVerificationStatuses = new Set(['pending', 'in_review', 'verified', 'rejected']);

function fail(message) {
  throw new Error(`Fuentes editoriales inválidas: ${message}`);
}

const sources = JSON.parse(await readFile(sourcesPath, 'utf8'));
const works = JSON.parse(await readFile(worksPath, 'utf8'));

if (!Array.isArray(sources)) fail('sources.draft.json debe contener un array');
if (!Array.isArray(works)) fail('works.draft.json debe contener un array');

const workIds = new Set();
for (const [position, work] of works.entries()) {
  if (!work || typeof work !== 'object' || typeof work.id !== 'string' || !work.id.trim()) {
    fail(`la obra en la posición ${position} no tiene un id válido`);
  }
  if (workIds.has(work.id)) fail(`works.draft.json repite el id ${work.id}`);
  workIds.add(work.id);
}

const sourceIds = new Set();
const sourcedWorkIds = new Set();
for (const [position, source] of sources.entries()) {
  const label = `sources[${position}]`;
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    fail(`${label} debe ser un objeto`);
  }
  for (const field of requiredFields) {
    if (!Object.hasOwn(source, field)) fail(`${label} no contiene ${field}`);
    if (source[field] === null && !nullableFields.has(field)) {
      fail(`${label}.${field} no puede ser null`);
    }
    if (typeof source[field] === 'string' && !source[field].trim()) {
      fail(`${label}.${field} no puede estar vacío`);
    }
  }
  if (typeof source.id !== 'string') fail(`${label}.id debe ser texto`);
  if (sourceIds.has(source.id)) fail(`id de fuente repetido: ${source.id}`);
  sourceIds.add(source.id);

  if (typeof source.work_id !== 'string' || !workIds.has(source.work_id)) {
    fail(`${label}.work_id no existe en works.draft.json: ${source.work_id}`);
  }
  sourcedWorkIds.add(source.work_id);

  if (!allowedSourceTypes.has(source.source_type)) {
    fail(`${label}.source_type no está permitido: ${source.source_type}`);
  }
  if (!allowedRightsStatuses.has(source.rights_status)) {
    fail(`${label}.rights_status no está permitido: ${source.rights_status}`);
  }
  if (!allowedVerificationStatuses.has(source.verification_status)) {
    fail(`${label}.verification_status no está permitido: ${source.verification_status}`);
  }
  if (source.publication_year !== null
    && (!Number.isInteger(source.publication_year) || source.publication_year < 1)) {
    fail(`${label}.publication_year debe ser un entero positivo o null`);
  }
}

const worksWithoutSource = [...workIds].filter(workId => !sourcedWorkIds.has(workId));
if (worksWithoutSource.length) {
  fail(`obras sin fuente provisional: ${worksWithoutSource.join(', ')}`);
}

console.log(`Fuentes editoriales válidas: ${sources.length} fuente(s) para ${works.length} obra(s).`);
