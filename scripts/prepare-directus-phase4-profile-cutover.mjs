#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isPublishableProfile } from './editorial-profile-policy.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const editorialDirectory = path.join(projectRoot, 'data', 'editorial');
const allowedArguments = new Set(['--dry-run', '--json', '--sql', '--help']);

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function canonicalHash(records) {
  return sha256(`${JSON.stringify(records)}\n`);
}

function sqlValue(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  return `'${String(value).replaceAll("'", "''")}'`;
}

function jsonbValue(value) {
  return `${sqlValue(JSON.stringify(value))}::jsonb`;
}

function nullable(value) {
  return value === undefined ? null : value;
}

function publicInformationSources(profile) {
  const value = profile.information_sources ?? profile.sources ?? profile.source_notes;
  const items = Array.isArray(value) ? value : [value];
  return items
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

function themeSlug(label) {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '');
}

async function loadArray(filename, blockingErrors, sourceFiles) {
  try {
    const text = await readFile(path.join(editorialDirectory, filename), 'utf8');
    sourceFiles[filename] = { sha256: sha256(text), bytes: Buffer.byteLength(text) };
    const value = JSON.parse(text);
    if (!Array.isArray(value)) {
      blockingErrors.push(`${filename} debe contener un array`);
      return [];
    }
    return value;
  } catch (error) {
    blockingErrors.push(`${filename}: no se pudo leer o interpretar (${error.message})`);
    return [];
  }
}

function indexIds(records, field, label, blockingErrors) {
  const ids = new Set();
  for (const [position, record] of records.entries()) {
    const id = record?.[field];
    if (typeof id !== 'string' || !id) {
      blockingErrors.push(`${label}[${position}].${field} debe ser un texto no vacío`);
    } else if (ids.has(id)) {
      blockingErrors.push(`${label}: ${field} duplicado (${id})`);
    } else {
      ids.add(id);
    }
  }
  return ids;
}

export async function buildCutoverPlan() {
  const blockingErrors = [];
  const sourceFiles = {};
  const [authors, works, authorProfiles, workProfiles] = await Promise.all([
    loadArray('authors.draft.json', blockingErrors, sourceFiles),
    loadArray('works.draft.json', blockingErrors, sourceFiles),
    loadArray('author-profiles.manual.json', blockingErrors, sourceFiles),
    loadArray('work-profiles.manual.json', blockingErrors, sourceFiles),
  ]);
  const authorIds = indexIds(authors, 'id', 'authors.draft.json', blockingErrors);
  const workIds = indexIds(works, 'id', 'works.draft.json', blockingErrors);
  indexIds(authorProfiles, 'author_id', 'author-profiles.manual.json', blockingErrors);
  indexIds(workProfiles, 'work_id', 'work-profiles.manual.json', blockingErrors);

  const publicAuthors = authorProfiles.filter((profile) => isPublishableProfile(profile));
  const publicWorks = workProfiles.filter((profile) => isPublishableProfile(profile));
  for (const profile of publicAuthors) {
    if (!authorIds.has(profile.author_id)) {
      blockingErrors.push(`Ficha pública sin autor base (${profile.author_id})`);
    }
  }
  for (const profile of publicWorks) {
    if (!workIds.has(profile.work_id)) {
      blockingErrors.push(`Ficha pública sin obra base (${profile.work_id})`);
    }
    if (!authorIds.has(profile.author_id)) {
      blockingErrors.push(`${profile.work_id}: author_id inexistente (${profile.author_id})`);
    }
  }

  const themeById = new Map();
  const themeLabelById = new Map();
  const registerTheme = (rawLabel) => {
    if (typeof rawLabel !== 'string' || !rawLabel.trim()) {
      blockingErrors.push('Todos los temas públicos deben ser textos no vacíos');
      return null;
    }
    const label = rawLabel.trim();
    const slug = themeSlug(label);
    if (!slug) {
      blockingErrors.push(`No se pudo generar slug para el tema: ${label}`);
      return null;
    }
    const id = `theme-${slug}`;
    const previousLabel = themeLabelById.get(id);
    if (previousLabel && previousLabel !== label) {
      blockingErrors.push(`Colisión de temas ${id}: «${previousLabel}» y «${label}»`);
      return null;
    }
    themeLabelById.set(id, label);
    themeById.set(id, { id, label, slug, description: null, verification_status: 'pending' });
    return id;
  };

  const authorUpdates = publicAuthors.map((profile, index) => ({
    id: profile.author_id,
    display_name: profile.display_name ?? profile.name,
    birth_year: nullable(profile.birth_year),
    death_year: nullable(profile.death_year),
    country: nullable(profile.country),
    language: nullable(profile.language),
    period: nullable(profile.period),
    movement: nullable(profile.movement),
    short_biography: nullable(profile.bio_short ?? profile.short_biography),
    public_biography_long: nullable(profile.bio_long),
    public_tone_notes: nullable(profile.tone_notes),
    public_why_in_paramo: nullable(profile.why_in_paramo),
    public_information_sources: publicInformationSources(profile),
    portrait_path: nullable(profile.portrait?.path),
    portrait_alt: nullable(profile.portrait?.alt),
    portrait_caption: nullable(profile.portrait?.caption),
    portrait_credit: nullable(profile.portrait?.credit),
    portrait_source_url: nullable(profile.portrait?.source_url),
    portrait_rights: nullable(profile.portrait?.rights),
    portrait_object_position: nullable(profile.portrait?.object_position),
    workflow_status: 'approved',
    visibility: 'public',
    sort: index + 1,
  }));
  const workUpdates = publicWorks.map((profile, index) => ({
    id: profile.work_id,
    public_title: nullable(profile.title),
    display_title: profile.display_title ?? profile.title,
    original_title: nullable(profile.original_title),
    primary_author_id: profile.author_id,
    publication_year: nullable(profile.publication_year),
    genre: nullable(profile.genre),
    public_language: nullable(profile.language),
    short_summary: nullable(profile.summary_short ?? profile.short_summary),
    public_summary_long: nullable(profile.summary_long),
    context: nullable(profile.context_notes ?? profile.context),
    tone: nullable(profile.tone_notes ?? profile.tone),
    public_fragment_notes: nullable(profile.fragment_notes),
    public_why_in_paramo: nullable(profile.why_in_paramo),
    public_information_sources: publicInformationSources(profile),
    workflow_status: 'approved',
    visibility: 'public',
    sort: index + 1,
  }));
  const authorThemes = publicAuthors.flatMap((profile) => (
    (profile.themes || []).map((label, index) => ({
      author_id: profile.author_id,
      theme_id: registerTheme(label),
      sort: index + 1,
    }))
  )).filter(({ theme_id: themeId }) => themeId);
  const workThemes = publicWorks.flatMap((profile) => (
    (profile.themes || []).map((label, index) => ({
      work_id: profile.work_id,
      theme_id: registerTheme(label),
      sort: index + 1,
    }))
  )).filter(({ theme_id: themeId }) => themeId);
  const themes = [...themeById.values()].sort((left, right) => left.id.localeCompare(right.id, 'en'));
  const records = {
    author_updates: authorUpdates,
    work_updates: workUpdates,
    themes,
    author_themes: authorThemes,
    work_themes: workThemes,
  };

  return {
    mode: 'dry_run',
    writes_database: false,
    expected_database_before: {
      authors: authors.length,
      works: works.length,
      themes: 0,
      author_themes: 0,
      work_themes: 0,
    },
    source_files: sourceFiles,
    counts: Object.fromEntries(Object.entries(records).map(([key, rows]) => [key, rows.length])),
    target_hashes: Object.fromEntries(
      Object.entries(records).map(([key, rows]) => [key, canonicalHash(rows)]),
    ),
    blocking_errors: blockingErrors,
    records,
  };
}

function updateStatement(table, columns, records) {
  const values = records.map((record) => {
    const serialized = columns.map((column) => (
      column === 'public_information_sources'
        ? jsonbValue(record[column])
        : sqlValue(record[column])
    ));
    return `  (${serialized.join(', ')})`;
  }).join(',\n');
  const assignments = columns
    .filter((column) => column !== 'id')
    .map((column) => `${column} = incoming.${column}`)
    .join(',\n    ');
  return `UPDATE ${table}\nSET ${assignments}\nFROM (VALUES\n${values}\n) AS incoming (${columns.join(', ')})\nWHERE ${table}.id = incoming.id;`;
}

function insertStatement(table, columns, records, conflictClause = '') {
  if (!records.length) return '';
  const values = records.map((record) => (
    `  (${columns.map((column) => sqlValue(record[column])).join(', ')})`
  )).join(',\n');
  return `INSERT INTO ${table} (${columns.join(', ')}) VALUES\n${values}${conflictClause ? `\n${conflictClause}` : ''};`;
}

export function createCutoverSql(plan) {
  if (plan.blocking_errors.length) {
    throw new Error('No se genera SQL con errores bloqueantes');
  }
  const { records, expected_database_before: expected } = plan;
  const authorColumns = Object.keys(records.author_updates[0]);
  const workColumns = Object.keys(records.work_updates[0]);
  return [
    'BEGIN;',
    '',
    'DO $phase4_preflight$',
    'BEGIN',
    `  IF (SELECT count(*) FROM authors) <> ${expected.authors} THEN RAISE EXCEPTION 'Fase 4: recuento inesperado de authors'; END IF;`,
    `  IF (SELECT count(*) FROM works) <> ${expected.works} THEN RAISE EXCEPTION 'Fase 4: recuento inesperado de works'; END IF;`,
    `  IF (SELECT count(*) FROM themes) NOT IN (${expected.themes}, ${records.themes.length}) THEN RAISE EXCEPTION 'Fase 4: estado inesperado de themes'; END IF;`,
    `  IF (SELECT count(*) FROM author_themes) NOT IN (${expected.author_themes}, ${records.author_themes.length}) THEN RAISE EXCEPTION 'Fase 4: estado inesperado de author_themes'; END IF;`,
    `  IF (SELECT count(*) FROM work_themes) NOT IN (${expected.work_themes}, ${records.work_themes.length}) THEN RAISE EXCEPTION 'Fase 4: estado inesperado de work_themes'; END IF;`,
    'END',
    '$phase4_preflight$;',
    '',
    updateStatement('authors', authorColumns, records.author_updates),
    '',
    updateStatement('works', workColumns, records.work_updates),
    '',
    insertStatement(
      'themes',
      ['id', 'label', 'slug', 'description', 'verification_status'],
      records.themes,
      'ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, slug = EXCLUDED.slug',
    ),
    '',
    insertStatement(
      'author_themes',
      ['author_id', 'theme_id', 'sort'],
      records.author_themes,
      'ON CONFLICT (author_id, theme_id) DO UPDATE SET sort = EXCLUDED.sort',
    ),
    '',
    insertStatement(
      'work_themes',
      ['work_id', 'theme_id', 'sort'],
      records.work_themes,
      'ON CONFLICT (work_id, theme_id) DO UPDATE SET sort = EXCLUDED.sort',
    ),
    '',
    'DO $phase4_postflight$',
    'BEGIN',
    `  IF (SELECT count(*) FROM authors WHERE visibility = 'public') <> ${records.author_updates.length} THEN RAISE EXCEPTION 'Fase 4: autores públicos incompletos'; END IF;`,
    `  IF (SELECT count(*) FROM works WHERE visibility = 'public') <> ${records.work_updates.length} THEN RAISE EXCEPTION 'Fase 4: obras públicas incompletas'; END IF;`,
    `  IF (SELECT count(*) FROM themes) <> ${records.themes.length} THEN RAISE EXCEPTION 'Fase 4: temas incompletos'; END IF;`,
    `  IF (SELECT count(*) FROM author_themes) <> ${records.author_themes.length} THEN RAISE EXCEPTION 'Fase 4: relaciones de autores incompletas'; END IF;`,
    `  IF (SELECT count(*) FROM work_themes) <> ${records.work_themes.length} THEN RAISE EXCEPTION 'Fase 4: relaciones de obras incompletas'; END IF;`,
    'END',
    '$phase4_postflight$;',
    '',
    'COMMIT;',
    '',
  ].join('\n');
}

function printSummary(plan) {
  process.stdout.write('Simulación del corte de perfiles de la fase 4\n');
  process.stdout.write('Escrituras en PostgreSQL: NO\n');
  for (const [collection, count] of Object.entries(plan.counts)) {
    process.stdout.write(`  ${collection}: ${count}\n`);
  }
  process.stdout.write(`Errores bloqueantes: ${plan.blocking_errors.length}\n`);
  for (const error of plan.blocking_errors) process.stdout.write(`  ERROR: ${error}\n`);
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
    process.stdout.write('Uso: node scripts/prepare-directus-phase4-profile-cutover.mjs [--dry-run|--json|--sql]\n');
    process.stdout.write('Nunca conecta con PostgreSQL; --sql emite una transacción revisable.\n');
    return;
  }
  if (argumentsList.includes('--json') && argumentsList.includes('--sql')) {
    process.stderr.write('--json y --sql no pueden usarse juntos\n');
    process.exitCode = 2;
    return;
  }
  const plan = await buildCutoverPlan();
  if (argumentsList.includes('--json')) {
    process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
  } else if (argumentsList.includes('--sql')) {
    if (plan.blocking_errors.length) {
      process.stderr.write('No se genera SQL porque existen errores bloqueantes\n');
      process.exitCode = 1;
      return;
    }
    process.stdout.write(createCutoverSql(plan));
  } else {
    printSummary(plan);
  }
  if (plan.blocking_errors.length) process.exitCode = 1;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) await main();
