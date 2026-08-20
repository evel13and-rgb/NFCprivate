#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const editorialDirectory = path.join(projectRoot, 'data', 'editorial');

const inputFiles = [
  'stable-identifiers.json',
  'authors.draft.json',
  'works.draft.json',
  'sources.draft.json',
  'author-profiles.manual.json',
  'work-profiles.manual.json',
];

const allowedArguments = new Set(['--dry-run', '--json', '--sql', '--help']);
const allowedVerificationStatuses = new Set([
  'pending',
  'partially_verified',
  'verified',
  'rejected',
]);
const allowedSourceTypes = new Set(['unknown', 'print', 'ebook', 'website', 'manuscript', 'other']);
const allowedRightsStatuses = new Set([
  'unchecked',
  'review_in_progress',
  'permission_required',
  'cleared',
  'restricted',
]);

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function hashRecords(records) {
  return sha256(`${JSON.stringify(records)}\n`);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function byId(left, right) {
  return left.id.localeCompare(right.id, 'en');
}

function uniqueIndex(records, field, label, blockingErrors) {
  const index = new Map();

  for (const [position, record] of records.entries()) {
    if (!isObject(record)) {
      blockingErrors.push(`${label}[${position}] debe ser un objeto`);
      continue;
    }

    const value = record[field];
    if (typeof value !== 'string' || !value.trim()) {
      blockingErrors.push(`${label}[${position}].${field} debe ser un texto no vacío`);
      continue;
    }

    if (index.has(value)) blockingErrors.push(`${label}: ${field} duplicado (${value})`);
    index.set(value, record);
  }

  return index;
}

function assertPattern(value, pattern, label, blockingErrors) {
  if (typeof value !== 'string' || !pattern.test(value)) {
    blockingErrors.push(`${label} no cumple el formato esperado (${value})`);
  }
}

function nullable(value) {
  return value === undefined ? null : value;
}

function profileWorkflowStatus(profile) {
  if (!profile || profile.profile_status === 'empty' || profile.profile_status === 'hidden') {
    return 'draft';
  }
  if (profile.profile_status === 'reviewed') return 'in_review';
  if (profile.profile_status === 'ready') return 'approved';
  return 'draft';
}

function sqlValue(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(`No se puede serializar el número ${value}`);
    return String(value);
  }
  if (typeof value === 'object') {
    return `${sqlValue(JSON.stringify(value))}::jsonb`;
  }
  return `'${String(value).replaceAll("'", "''")}'`;
}

function insertStatement(table, columns, records) {
  if (records.length === 0) return '';
  const values = records
    .map((record) => `  (${columns.map((column) => sqlValue(record[column])).join(', ')})`)
    .join(',\n');
  return `INSERT INTO ${table} (${columns.join(', ')}) VALUES\n${values};`;
}

function createSql(plan) {
  const { records, source_files: sourceFiles } = plan;
  const sourceHashes = Object.entries(sourceFiles)
    .map(([filename, details]) => `-- ${filename}: ${details.sha256}`)
    .join('\n');

  return `${[
    '-- Importación base generada para el piloto editorial de Páramo Literario.',
    '-- No ejecutar sin revisar primero el informe de simulación.',
    sourceHashes,
    '',
    'BEGIN;',
    '',
    'LOCK TABLE authors, works, work_contributors, sources, work_sources IN SHARE ROW EXCLUSIVE MODE;',
    '',
    'DO $empty_check$',
    'BEGIN',
    '  IF EXISTS (SELECT 1 FROM authors)',
    '    OR EXISTS (SELECT 1 FROM works)',
    '    OR EXISTS (SELECT 1 FROM work_contributors)',
    '    OR EXISTS (SELECT 1 FROM sources)',
    '    OR EXISTS (SELECT 1 FROM work_sources)',
    '  THEN',
    "    RAISE EXCEPTION 'La importación base exige tablas de destino vacías';",
    '  END IF;',
    'END',
    '$empty_check$;',
    '',
    insertStatement('authors', [
      'id', 'canonical_name', 'display_name', 'slug', 'sort_name', 'birth_year',
      'death_year', 'country', 'language', 'period', 'movement', 'short_biography',
      'portrait_file', 'portrait_alt', 'portrait_caption', 'portrait_credit',
      'portrait_source_url', 'portrait_rights', 'portrait_object_position',
      'workflow_status', 'visibility', 'verification_status', 'publish_at', 'sort',
    ], records.authors),
    '',
    insertStatement('works', [
      'id', 'display_title', 'original_title', 'slug', 'primary_author_id', 'legacy_work',
      'publication_year', 'genre', 'short_summary', 'context', 'tone', 'workflow_status',
      'visibility', 'verification_status', 'publish_at', 'sort',
    ], records.works),
    '',
    insertStatement('work_contributors', [
      'work_id', 'author_id', 'role', 'sort',
    ], records.work_contributors),
    '',
    insertStatement('sources', [
      'id', 'source_type', 'citation_label', 'creator', 'institution', 'title',
      'edition', 'publisher', 'publication_year', 'pages', 'translator_name',
      'source_url', 'bibliographic_identifiers', 'accessed_at', 'language',
      'rights_status', 'rights_notes', 'verification_status', 'notes',
    ], records.sources),
    '',
    insertStatement('work_sources', [
      'work_id', 'source_id', 'relation_role', 'notes', 'sort',
    ], records.work_sources),
    '',
    'COMMIT;',
    '',
  ].join('\n')}\n`;
}

async function loadInputs(blockingErrors) {
  const values = {};
  const sourceFiles = {};

  for (const filename of inputFiles) {
    const filePath = path.join(editorialDirectory, filename);
    try {
      const text = await readFile(filePath, 'utf8');
      values[filename] = JSON.parse(text);
      sourceFiles[filename] = { sha256: sha256(text), bytes: Buffer.byteLength(text) };
    } catch (error) {
      blockingErrors.push(`${filename}: no se pudo leer o interpretar (${error.message})`);
    }
  }

  return { values, sourceFiles };
}

async function buildImportPlan() {
  const blockingErrors = [];
  const warnings = [];
  const { values, sourceFiles } = await loadInputs(blockingErrors);
  const stableIdentifiers = values['stable-identifiers.json'] || {};
  const authors = values['authors.draft.json'] || [];
  const works = values['works.draft.json'] || [];
  const sources = values['sources.draft.json'] || [];
  const authorProfiles = values['author-profiles.manual.json'] || [];
  const workProfiles = values['work-profiles.manual.json'] || [];

  for (const [filename, value] of [
    ['authors.draft.json', authors],
    ['works.draft.json', works],
    ['sources.draft.json', sources],
    ['author-profiles.manual.json', authorProfiles],
    ['work-profiles.manual.json', workProfiles],
  ]) {
    if (!Array.isArray(value)) blockingErrors.push(`${filename} debe contener un array`);
  }

  const safeAuthors = Array.isArray(authors) ? authors : [];
  const safeWorks = Array.isArray(works) ? works : [];
  const safeSources = Array.isArray(sources) ? sources : [];
  const safeAuthorProfiles = Array.isArray(authorProfiles) ? authorProfiles : [];
  const safeWorkProfiles = Array.isArray(workProfiles) ? workProfiles : [];
  const authorsById = uniqueIndex(safeAuthors, 'id', 'authors.draft.json', blockingErrors);
  const worksById = uniqueIndex(safeWorks, 'id', 'works.draft.json', blockingErrors);
  uniqueIndex(safeSources, 'id', 'sources.draft.json', blockingErrors);
  const authorProfilesById = uniqueIndex(
    safeAuthorProfiles.map((profile) => ({ ...profile, id: profile.author_id })),
    'id',
    'author-profiles.manual.json',
    blockingErrors,
  );
  const workProfilesById = uniqueIndex(
    safeWorkProfiles.map((profile) => ({ ...profile, id: profile.work_id })),
    'id',
    'work-profiles.manual.json',
    blockingErrors,
  );

  const stableAuthorIds = new Set(Object.values(stableIdentifiers.authors || {}));
  const stableWorkIds = new Set(Object.values(stableIdentifiers.works || {}));

  for (const author of safeAuthors) {
    assertPattern(author.id, /^author-[a-z0-9-]+$/u, `authors.${author.id}.id`, blockingErrors);
    if (!stableAuthorIds.has(author.id)) {
      blockingErrors.push(`El autor ${author.id} no figura en stable-identifiers.json`);
    }
  }

  for (const work of safeWorks) {
    assertPattern(work.id, /^work-[a-z0-9-]+$/u, `works.${work.id}.id`, blockingErrors);
    if (!stableWorkIds.has(work.id)) {
      blockingErrors.push(`La obra ${work.id} no figura en stable-identifiers.json`);
    }
    if (!authorsById.has(work.author_id)) {
      blockingErrors.push(`${work.id}: author_id inexistente (${work.author_id})`);
    }
    const profile = workProfilesById.get(work.id);
    if (profile?.author_id && profile.author_id !== work.author_id) {
      blockingErrors.push(
        `${work.id}: author_id difiere entre borrador (${work.author_id}) y ficha (${profile.author_id})`,
      );
    }
  }

  for (const profileId of authorProfilesById.keys()) {
    if (!authorsById.has(profileId)) {
      blockingErrors.push(`Ficha de autor sin autor base (${profileId})`);
    }
  }

  for (const profileId of workProfilesById.keys()) {
    if (!worksById.has(profileId)) blockingErrors.push(`Ficha de obra sin obra base (${profileId})`);
  }

  const plannedAuthors = safeAuthors.map((author, index) => {
    const profile = authorProfilesById.get(author.id);
    const portrait = profile?.portrait;
    const verificationStatus = profile?.verification_status || 'pending';

    if (!allowedVerificationStatuses.has(verificationStatus)) {
      blockingErrors.push(`${author.id}: verification_status no permitido (${verificationStatus})`);
    }

    return {
      id: author.id,
      canonical_name: author.canonical_name,
      display_name: profile?.display_name ?? profile?.name ?? author.canonical_name,
      slug: author.slug,
      sort_name: author.sort_name,
      birth_year: nullable(profile?.birth_year),
      death_year: nullable(profile?.death_year),
      country: nullable(profile?.country),
      language: nullable(profile?.language),
      period: nullable(profile?.period),
      movement: nullable(profile?.movement),
      short_biography: nullable(profile?.short_biography),
      portrait_file: null,
      portrait_alt: nullable(portrait?.alt),
      portrait_caption: nullable(portrait?.caption),
      portrait_credit: nullable(portrait?.credit),
      portrait_source_url: nullable(portrait?.source_url),
      portrait_rights: nullable(portrait?.rights),
      portrait_object_position: nullable(portrait?.object_position),
      workflow_status: profileWorkflowStatus(profile),
      visibility: 'hidden',
      verification_status: verificationStatus,
      publish_at: null,
      sort: index + 1,
    };
  }).sort(byId);

  const plannedWorks = safeWorks.map((work, index) => {
    const profile = workProfilesById.get(work.id);
    const verificationStatus = profile?.verification_status || 'pending';

    if (!allowedVerificationStatuses.has(verificationStatus)) {
      blockingErrors.push(`${work.id}: verification_status no permitido (${verificationStatus})`);
    }

    return {
      id: work.id,
      display_title: profile?.display_title ?? profile?.title ?? work.title,
      original_title: nullable(profile?.original_title),
      slug: work.slug,
      primary_author_id: work.author_id,
      legacy_work: work.legacy_work,
      publication_year: nullable(profile?.publication_year),
      genre: nullable(profile?.genre),
      short_summary: nullable(profile?.short_summary),
      context: nullable(profile?.context),
      tone: nullable(profile?.tone),
      workflow_status: profileWorkflowStatus(profile),
      visibility: 'hidden',
      verification_status: verificationStatus,
      publish_at: null,
      sort: index + 1,
    };
  }).sort(byId);

  const plannedWorksById = new Map(plannedWorks.map((work) => [work.id, work]));
  const placeholderSourceIds = [];
  const plannedSources = safeSources.map((source) => {
    assertPattern(source.id, /^source-[a-z0-9-]+$/u, `sources.${source.id}.id`, blockingErrors);
    const work = plannedWorksById.get(source.work_id);
    if (!work) blockingErrors.push(`${source.id}: work_id inexistente (${source.work_id})`);
    if (!allowedSourceTypes.has(source.source_type)) {
      blockingErrors.push(`${source.id}: source_type no permitido (${source.source_type})`);
    }
    if (!allowedRightsStatuses.has(source.rights_status)) {
      blockingErrors.push(`${source.id}: rights_status no permitido (${source.rights_status})`);
    }
    if (!allowedVerificationStatuses.has(source.verification_status)) {
      blockingErrors.push(
        `${source.id}: verification_status no permitido (${source.verification_status})`,
      );
    }

    let citationLabel = source.citation_label;
    if (!citationLabel) {
      placeholderSourceIds.push(source.id);
      citationLabel = `Fuente pendiente de documentar: ${work?.display_title || source.work_id}`;
    }

    return {
      id: source.id,
      source_type: source.source_type,
      citation_label: citationLabel,
      creator: null,
      institution: null,
      title: null,
      edition: nullable(source.edition),
      publisher: nullable(source.publisher),
      publication_year: nullable(source.publication_year),
      pages: null,
      translator_name: nullable(source.translator_name),
      source_url: nullable(source.source_url),
      bibliographic_identifiers: {},
      accessed_at: source.accessed_at ? source.accessed_at.slice(0, 10) : null,
      language: nullable(source.language),
      rights_status: source.rights_status,
      rights_notes: nullable(source.rights_notes),
      verification_status: source.verification_status,
      notes: nullable(source.notes),
      work_id: source.work_id,
    };
  }).sort(byId);

  const plannedContributors = safeWorks.map((work) => ({
    work_id: work.id,
    author_id: work.author_id,
    role: 'author',
    sort: 1,
  })).sort((left, right) => left.work_id.localeCompare(right.work_id, 'en'));

  const plannedWorkSources = plannedSources.map((source) => ({
    work_id: source.work_id,
    source_id: source.id,
    relation_role: 'textual_source',
    notes: null,
    sort: 1,
  })).sort((left, right) => left.work_id.localeCompare(right.work_id, 'en'));

  for (const source of plannedSources) delete source.work_id;

  const duplicateSlugs = (records, label) => {
    const seen = new Set();
    for (const record of records) {
      if (seen.has(record.slug)) blockingErrors.push(`${label}: slug duplicado (${record.slug})`);
      seen.add(record.slug);
    }
  };
  duplicateSlugs(plannedAuthors, 'authors');
  duplicateSlugs(plannedWorks, 'works');

  const missingAuthorProfiles = safeAuthors
    .map(({ id }) => id)
    .filter((id) => !authorProfilesById.has(id));
  const missingWorkProfiles = safeWorks
    .map(({ id }) => id)
    .filter((id) => !workProfilesById.has(id));
  const portraitPaths = safeAuthorProfiles
    .map((profile) => profile.portrait?.path)
    .filter(Boolean);
  const missingPortraitFiles = [];

  for (const portraitPath of portraitPaths) {
    try {
      await access(path.join(projectRoot, portraitPath));
    } catch {
      missingPortraitFiles.push(portraitPath);
    }
  }

  if (missingPortraitFiles.length) {
    blockingErrors.push(
      `${missingPortraitFiles.length} retrato(s) referenciado(s) no existen en el repositorio`,
    );
  }

  if (placeholderSourceIds.length) {
    warnings.push({
      code: 'provisional_source_labels',
      message: `${placeholderSourceIds.length} fuentes recibirían una etiqueta provisional no pública`,
      ids: placeholderSourceIds,
    });
  }
  if (missingAuthorProfiles.length) {
    warnings.push({
      code: 'authors_without_profiles',
      message: `${missingAuthorProfiles.length} autores se importarían sin ficha literaria`,
      ids: missingAuthorProfiles,
    });
  }
  if (missingWorkProfiles.length) {
    warnings.push({
      code: 'works_without_profiles',
      message: `${missingWorkProfiles.length} obras se importarían sin ficha literaria`,
      ids: missingWorkProfiles,
    });
  }
  if (portraitPaths.length) {
    warnings.push({
      code: 'portrait_uploads_deferred',
      message: `${portraitPaths.length} retratos conservan sus metadatos, pero el archivo todavía no se subiría a Directus`,
      ids: portraitPaths,
    });
  }

  const authorThemeReferences = safeAuthorProfiles.reduce(
    (count, profile) => count + (profile.themes?.length || 0),
    0,
  );
  const workThemeReferences = safeWorkProfiles.reduce(
    (count, profile) => count + (profile.themes?.length || 0),
    0,
  );
  const profileSourceReferences = [...safeAuthorProfiles, ...safeWorkProfiles].reduce(
    (count, profile) => count + (profile.sources?.length || 0),
    0,
  );

  warnings.push({
    code: 'later_phase_relations',
    message: 'Temas y referencias bibliográficas libres se normalizarán en una fase posterior',
    details: {
      author_theme_references: authorThemeReferences,
      work_theme_references: workThemeReferences,
      profile_source_references: profileSourceReferences,
    },
  });

  const records = {
    authors: plannedAuthors,
    works: plannedWorks,
    work_contributors: plannedContributors,
    sources: plannedSources,
    work_sources: plannedWorkSources,
  };
  const targetHashes = Object.fromEntries(
    Object.entries(records).map(([collection, rows]) => [collection, hashRecords(rows)]),
  );

  return {
    mode: 'dry_run',
    writes_database: false,
    source_files: sourceFiles,
    counts: Object.fromEntries(
      Object.entries(records).map(([collection, rows]) => [collection, rows.length]),
    ),
    target_hashes: targetHashes,
    blocking_errors: blockingErrors,
    warnings,
    records,
  };
}

function printHelp() {
  process.stdout.write(`Uso:\n  node scripts/prepare-directus-base-import.mjs [--dry-run]\n  node scripts/prepare-directus-base-import.mjs --json\n  node scripts/prepare-directus-base-import.mjs --sql\n\nEl script nunca conecta con PostgreSQL. --sql emite una transacción revisable por stdout.\n`);
}

function printSummary(plan) {
  process.stdout.write('Simulación de importación base Directus/PostgreSQL\n');
  process.stdout.write('Escrituras en la base de datos: NO\n');
  for (const [collection, count] of Object.entries(plan.counts)) {
    process.stdout.write(`  ${collection}: ${count}\n`);
  }
  process.stdout.write(`Errores bloqueantes: ${plan.blocking_errors.length}\n`);
  for (const error of plan.blocking_errors) process.stdout.write(`  ERROR: ${error}\n`);
  process.stdout.write(`Advertencias: ${plan.warnings.length}\n`);
  for (const warning of plan.warnings) process.stdout.write(`  AVISO [${warning.code}]: ${warning.message}\n`);
  process.stdout.write('Huellas de destino:\n');
  for (const [collection, hash] of Object.entries(plan.target_hashes)) {
    process.stdout.write(`  ${collection}: ${hash}\n`);
  }
}

async function main(argumentsList = process.argv.slice(2)) {
  for (const argument of argumentsList) {
    if (!allowedArguments.has(argument)) {
      process.stderr.write(`Argumento no reconocido: ${argument}\n`);
      process.exitCode = 2;
      return;
    }
  }

  if (argumentsList.includes('--help')) {
    printHelp();
    return;
  }

  if (argumentsList.includes('--json') && argumentsList.includes('--sql')) {
    process.stderr.write('--json y --sql no pueden usarse juntos\n');
    process.exitCode = 2;
    return;
  }

  const plan = await buildImportPlan();

  if (argumentsList.includes('--json')) {
    process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
  } else if (argumentsList.includes('--sql')) {
    if (plan.blocking_errors.length) {
      process.stderr.write('No se genera SQL porque la simulación contiene errores bloqueantes\n');
      process.exitCode = 1;
      return;
    }
    process.stdout.write(createSql(plan));
  } else {
    printSummary(plan);
  }

  if (plan.blocking_errors.length) process.exitCode = 1;
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) await main();

export { buildImportPlan, createSql };
