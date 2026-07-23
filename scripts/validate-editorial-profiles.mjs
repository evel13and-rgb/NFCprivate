import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const editorialDirectory = path.resolve(scriptDirectory, '..', 'data', 'editorial');
const blockingErrors = [];
const warnings = [];
const allowedVerificationStatuses = new Set([
  'pending',
  'partially_verified',
  'verified',
  'rejected',
]);
const allowedProfileStatuses = new Set([
  'empty',
  'draft',
  'reviewed',
  'ready',
  'hidden',
]);

async function loadJson(filename, fallback) {
  try {
    return JSON.parse(await readFile(path.join(editorialDirectory, filename), 'utf8'));
  } catch (error) {
    blockingErrors.push(`${filename}: no se pudo leer o interpretar (${error.message})`);
    return fallback;
  }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function collectReferenceIds(records, filename) {
  const ids = new Set();
  for (const [position, record] of records.entries()) {
    if (!isObject(record) || typeof record.id !== 'string' || !record.id.trim()) {
      blockingErrors.push(`${filename}[${position}].id debe ser un texto no vacío`);
      continue;
    }
    if (ids.has(record.id)) {
      blockingErrors.push(`${filename}: id duplicado (${record.id})`);
    }
    ids.add(record.id);
  }
  return ids;
}

function validateCommonFields(profile, label) {
  if (!allowedVerificationStatuses.has(profile.verification_status)) {
    blockingErrors.push(
      `${label}.verification_status no está permitido (${profile.verification_status})`,
    );
  }
  if (!allowedProfileStatuses.has(profile.profile_status)) {
    blockingErrors.push(`${label}.profile_status no está permitido (${profile.profile_status})`);
  }
  if (Object.hasOwn(profile, 'themes') && !Array.isArray(profile.themes)) {
    blockingErrors.push(`${label}.themes debe ser un array si está informado`);
  }
}

const [authors, works, authorProfiles, workProfiles] = await Promise.all([
  loadJson('authors.draft.json', []),
  loadJson('works.draft.json', []),
  loadJson('author-profiles.manual.json', []),
  loadJson('work-profiles.manual.json', []),
]);

for (const [filename, value] of [
  ['authors.draft.json', authors],
  ['works.draft.json', works],
  ['author-profiles.manual.json', authorProfiles],
  ['work-profiles.manual.json', workProfiles],
]) {
  if (!Array.isArray(value)) {
    blockingErrors.push(`${filename} debe contener un array`);
  }
}

const safeAuthors = Array.isArray(authors) ? authors : [];
const safeWorks = Array.isArray(works) ? works : [];
const safeAuthorProfiles = Array.isArray(authorProfiles) ? authorProfiles : [];
const safeWorkProfiles = Array.isArray(workProfiles) ? workProfiles : [];
const authorIds = collectReferenceIds(safeAuthors, 'authors.draft.json');
const workIds = collectReferenceIds(safeWorks, 'works.draft.json');
const profiledAuthorIds = new Set();
const profiledWorkIds = new Set();

for (const [position, profile] of safeAuthorProfiles.entries()) {
  const label = `author-profiles.manual.json[${position}]`;
  if (!isObject(profile)) {
    blockingErrors.push(`${label} debe ser un objeto`);
    continue;
  }
  if (typeof profile.author_id !== 'string' || !profile.author_id.trim()) {
    blockingErrors.push(`${label}.author_id debe ser un texto no vacío`);
  } else {
    if (!authorIds.has(profile.author_id)) {
      blockingErrors.push(`${label}.author_id no existe en authors.draft.json (${profile.author_id})`);
    }
    if (profiledAuthorIds.has(profile.author_id)) {
      blockingErrors.push(`author_id duplicado en fichas manuales (${profile.author_id})`);
    }
    profiledAuthorIds.add(profile.author_id);
  }
  if (Object.hasOwn(profile, 'display_name')
    && (typeof profile.display_name !== 'string' || !profile.display_name.trim())) {
    blockingErrors.push(`${label}.display_name debe ser un texto no vacío si está informado`);
  }
  validateCommonFields(profile, label);
}

for (const [position, profile] of safeWorkProfiles.entries()) {
  const label = `work-profiles.manual.json[${position}]`;
  if (!isObject(profile)) {
    blockingErrors.push(`${label} debe ser un objeto`);
    continue;
  }
  if (typeof profile.work_id !== 'string' || !profile.work_id.trim()) {
    blockingErrors.push(`${label}.work_id debe ser un texto no vacío`);
  } else {
    if (!workIds.has(profile.work_id)) {
      blockingErrors.push(`${label}.work_id no existe en works.draft.json (${profile.work_id})`);
    }
    if (profiledWorkIds.has(profile.work_id)) {
      blockingErrors.push(`work_id duplicado en fichas manuales (${profile.work_id})`);
    }
    profiledWorkIds.add(profile.work_id);
  }
  if (profile.author_id !== undefined && profile.author_id !== null) {
    if (typeof profile.author_id !== 'string' || !profile.author_id.trim()) {
      blockingErrors.push(`${label}.author_id debe ser null o un texto no vacío`);
    } else if (!authorIds.has(profile.author_id)) {
      blockingErrors.push(`${label}.author_id no existe en authors.draft.json (${profile.author_id})`);
    }
  }
  if (Object.hasOwn(profile, 'display_title')
    && (typeof profile.display_title !== 'string' || !profile.display_title.trim())) {
    blockingErrors.push(`${label}.display_title debe ser un texto no vacío si está informado`);
  }
  validateCommonFields(profile, label);
}

const missingAuthorProfiles = [...authorIds].filter(id => !profiledAuthorIds.has(id));
const missingWorkProfiles = [...workIds].filter(id => !profiledWorkIds.has(id));
if (missingAuthorProfiles.length) {
  warnings.push(
    `${missingAuthorProfiles.length} autor(es) todavía no tienen ficha manual; se admite durante la fase piloto`,
  );
}
if (missingWorkProfiles.length) {
  warnings.push(
    `${missingWorkProfiles.length} obra(s) todavía no tienen ficha manual; se admite durante la fase piloto`,
  );
}

function coverage(profileCount, totalCount) {
  const percentage = totalCount === 0 ? 100 : (profileCount / totalCount) * 100;
  return `${profileCount}/${totalCount} (${percentage.toFixed(1)} %)`;
}

console.log('Validación de fichas literarias manuales');
console.log(`Fichas de autor existentes: ${safeAuthorProfiles.length}`);
console.log(`Fichas de obra existentes: ${safeWorkProfiles.length}`);
console.log(`Cobertura de autores: ${coverage(profiledAuthorIds.size, authorIds.size)}`);
console.log(`Cobertura de obras: ${coverage(profiledWorkIds.size, workIds.size)}`);
console.log(`Errores bloqueantes: ${blockingErrors.length}`);
for (const error of blockingErrors) console.log(`  ERROR: ${error}`);
console.log(`Advertencias no bloqueantes: ${warnings.length}`);
for (const warning of warnings) console.log(`  AVISO: ${warning}`);

if (blockingErrors.length) process.exitCode = 1;
