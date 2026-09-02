import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import {
  buildCutoverPlan,
  createCutoverSql,
} from '../scripts/prepare-directus-phase4-profile-cutover.mjs';
import {
  buildPublicProfilesDocument,
  comparisonReport,
  ensurePreviewOutputPath,
  validatePublicProfilesDocument,
} from '../scripts/export-directus-profiles-preview.mjs';

test('prepara el corte de perfiles sin escribir y con todos los datos públicos', async () => {
  const plan = await buildCutoverPlan();

  assert.equal(plan.writes_database, false);
  assert.deepEqual(plan.blocking_errors, []);
  assert.equal(plan.counts.author_updates, 23);
  assert.equal(plan.counts.work_updates, 28);
  assert.equal(plan.counts.author_themes, 371);
  assert.equal(plan.counts.work_themes, 327);
  assert.ok(plan.counts.themes > 0);
  assert.ok(plan.records.author_updates.every((record) => (
    record.workflow_status === 'approved' && record.visibility === 'public'
  )));
  assert.ok(plan.records.work_updates.every((record) => (
    record.workflow_status === 'approved' && record.visibility === 'public'
  )));
});

test('el SQL de corte es transaccional y exige el estado previo conocido', async () => {
  const sql = createCutoverSql(await buildCutoverPlan());

  assert.match(sql, /^BEGIN;/u);
  assert.match(sql, /Fase 4: estado inesperado de themes/u);
  assert.match(sql, /UPDATE authors/u);
  assert.match(sql, /UPDATE works/u);
  assert.match(sql, /INSERT INTO themes/u);
  assert.match(sql, /INSERT INTO author_themes/u);
  assert.match(sql, /INSERT INTO work_themes/u);
  assert.match(sql, /ON CONFLICT \(author_id, theme_id\) DO UPDATE/u);
  assert.match(sql, /COMMIT;\s*$/u);
});

test('construye las fichas públicas desde las colecciones privadas', () => {
  const data = {
    authors: [{
      id: 'author-ejemplo',
      display_name: 'Autora Ejemplo',
      birth_year: 1900,
      death_year: null,
      country: 'País',
      language: 'Idioma',
      period: 'Periodo',
      movement: 'Movimiento',
      short_biography: 'Biografía',
      public_biography_long: null,
      public_tone_notes: null,
      public_why_in_paramo: null,
      public_information_sources: ['Fuente pública'],
      portrait_path: 'public/images/authors/ejemplo.webp',
      portrait_alt: 'Retrato',
      portrait_caption: null,
      portrait_credit: 'Crédito',
      portrait_source_url: 'https://example.invalid/retrato',
      portrait_rights: 'Dominio público',
      portrait_object_position: '50% 50%',
      workflow_status: 'approved',
      visibility: 'public',
      verification_status: 'partially_verified',
      sort: 1,
    }],
    works: [{
      id: 'work-ejemplo',
      public_title: 'Obra Ejemplo',
      display_title: 'Obra Ejemplo',
      original_title: null,
      primary_author_id: 'author-ejemplo',
      publication_year: 1920,
      genre: 'Novela',
      public_language: null,
      short_summary: 'Resumen',
      public_summary_long: null,
      context: 'Contexto',
      tone: 'Tono',
      public_fragment_notes: null,
      public_why_in_paramo: null,
      public_information_sources: ['Fuente de obra'],
      workflow_status: 'approved',
      visibility: 'public',
      verification_status: 'pending',
      sort: 1,
    }],
    themes: [{ id: 'theme-vida', label: 'La vida' }],
    authorThemes: [{ author_id: 'author-ejemplo', theme_id: 'theme-vida', sort: 1 }],
    workThemes: [{ work_id: 'work-ejemplo', theme_id: 'theme-vida', sort: 1 }],
    quotes: [{
      work_id: 'work-ejemplo',
      workflow_status: 'approved',
      visibility: 'public',
      verification_status: 'verified',
      publication_excluded: false,
    }],
  };
  const document = buildPublicProfilesDocument(data);

  assert.doesNotThrow(() => validatePublicProfilesDocument(document));
  assert.equal(document.authors[0].author_id, 'author-ejemplo');
  assert.deepEqual(document.authors[0].themes, ['La vida']);
  assert.deepEqual(document.authors[0].information_sources, ['Fuente pública']);
  assert.equal(document.works[0].fragment_count, 1);
  assert.equal(comparisonReport(document, structuredClone(document)).exact, true);
});

test('la vista previa de perfiles solo puede escribirse bajo tmp', () => {
  assert.equal(
    ensurePreviewOutputPath('/tmp/paramo-profiles-preview.json'),
    '/tmp/paramo-profiles-preview.json',
  );
  assert.throws(
    () => ensurePreviewOutputPath('/srv/paramoliterario/source/public/data/literary-profiles.json'),
    /solo puede escribirse dentro de \/tmp/u,
  );
});

test('los generadores históricos no pueden sobrescribir los artefactos públicos', async () => {
  const beforeQuotes = await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8');
  const beforeProfiles = await readFile(
    new URL('../public/data/literary-profiles.json', import.meta.url),
    'utf8',
  );
  const quotesResult = spawnSync(process.execPath, ['scripts/build-public-quotes.mjs'], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
  });
  const profilesResult = spawnSync(process.execPath, ['scripts/build-public-literary-profiles.mjs'], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
  });

  assert.notEqual(quotesResult.status, 0);
  assert.match(quotesResult.stderr, /Fase 4 activa/u);
  assert.notEqual(profilesResult.status, 0);
  assert.match(profilesResult.stderr, /Fase 4 activa/u);
  assert.equal(await readFile(new URL('../public/data/quotes.json', import.meta.url), 'utf8'), beforeQuotes);
  assert.equal(
    await readFile(new URL('../public/data/literary-profiles.json', import.meta.url), 'utf8'),
    beforeProfiles,
  );
});

test('la migración añade únicamente los campos públicos que faltaban', async () => {
  const migration = await readFile(
    new URL('../ops/directus/migrations/002_phase4_profile_authority.sql', import.meta.url),
    'utf8',
  );
  assert.match(migration, /ALTER TABLE authors/u);
  assert.match(migration, /public_information_sources jsonb/u);
  assert.match(migration, /portrait_path text/u);
  assert.match(migration, /ALTER TABLE works/u);
  assert.match(migration, /COMMIT;\s*$/u);
});
