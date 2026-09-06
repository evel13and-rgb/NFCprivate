import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { validatePublicProfilesDocument } from '../scripts/export-directus-profiles-preview.mjs';
import {
  contentChangeDecision,
  ensureCandidateOutputPath,
  parseArguments as parsePrepareArguments,
  selectPublicationProfiles,
  summarizeIssues,
} from '../scripts/prepare-directus-profiles-publication.mjs';
import {
  validateSourceRun,
  validateStageConfirmations,
} from '../scripts/stage-directus-profiles-publication.mjs';
import { ensureBackupPath } from '../scripts/restore-directus-profiles-backup.mjs';
import {
  validateFinalizeConfirmations,
  validateProductionRun,
} from '../scripts/finalize-directus-profiles-deployment.mjs';
import { sha256, verifyDeployedJson } from '../scripts/lib/verify-deployed-json.mjs';

function databaseFixtures() {
  return {
    authors: [{
      id: 'author-ejemplo',
      display_name: 'Autora Ejemplo',
      workflow_status: 'approved',
      visibility: 'public',
      verification_status: 'partially_verified',
      publish_at: null,
    }],
    works: [{
      id: 'work-ejemplo',
      public_title: 'Obra Ejemplo',
      display_title: 'Obra Ejemplo',
      primary_author_id: 'author-ejemplo',
      workflow_status: 'approved',
      visibility: 'public',
      verification_status: 'pending',
      publish_at: null,
    }],
    quotes: [{
      id: 'quote-1',
      work_id: 'work-ejemplo',
      workflow_status: 'approved',
      visibility: 'public',
      verification_status: 'verified',
      publication_excluded: false,
      reviewer_id: 'reviewer-1',
      reviewed_at: '2026-09-01T00:00:00Z',
      publish_at: null,
    }],
  };
}

function profilesDocument() {
  return {
    authors: [{
      author_id: 'author-ejemplo',
      display_name: 'Autora Ejemplo',
      birth_year: 1900,
      death_year: null,
      country: null,
      language: null,
      period: null,
      movement: null,
      bio_short: null,
      bio_long: null,
      themes: [],
      tone_notes: null,
      why_in_paramo: null,
      information_sources: null,
      portrait: null,
    }],
    works: [{
      work_id: 'work-ejemplo',
      title: 'Obra Ejemplo',
      display_title: 'Obra Ejemplo',
      original_title: null,
      author_id: 'author-ejemplo',
      publication_year: 1920,
      genre: null,
      language: null,
      summary_short: null,
      summary_long: null,
      context_notes: null,
      themes: [],
      tone_notes: null,
      fragment_notes: null,
      why_in_paramo: null,
      information_sources: null,
      fragment_count: 1,
    }],
  };
}

test('selecciona únicamente perfiles y fragmentos preparados', () => {
  const data = databaseFixtures();
  data.authors.push({
    ...data.authors[0],
    id: 'author-borrador',
    workflow_status: 'draft',
    visibility: 'hidden',
  });
  data.works.push({
    ...data.works[0],
    id: 'work-futura',
    publish_at: '2026-09-08T00:00:00Z',
  });
  const selection = selectPublicationProfiles(data, new Date('2026-09-06T00:00:00Z'));

  assert.deepEqual(selection.authors.map((author) => author.id), ['author-ejemplo']);
  assert.deepEqual(selection.works.map((work) => work.id), ['work-ejemplo']);
  assert.deepEqual(selection.quotes.map((quote) => quote.id), ['quote-1']);
  assert.deepEqual(selection.issues, []);
  assert.equal(selection.warnings[0].code, 'future_works_excluded');
});

test('avisa sobre referencias sin ficha y bloquea fragmentos sin revisión', () => {
  const data = databaseFixtures();
  data.works[0].primary_author_id = 'author-no-publico';
  data.quotes[0].work_id = 'work-no-publica';
  data.quotes[0].verification_status = 'pending';
  data.quotes[0].reviewer_id = null;
  const selection = selectPublicationProfiles(data);
  const summary = summarizeIssues(selection.issues);

  assert.ok(selection.warnings.some((warning) => warning.code === 'work_public_author_missing'));
  assert.equal(summary.counts.quote_not_verified, 1);
  assert.equal(summary.counts.quote_review_missing, 1);
  assert.ok(selection.warnings.some((warning) => warning.code === 'quote_public_work_missing'));
});

test('el candidato solo se escribe bajo tmp y todo cambio exige autorización', () => {
  assert.deepEqual(parsePrepareArguments([]), {
    allowContentChanges: false,
    help: false,
    outputPath: '/tmp/paramo-directus-profiles-publication-candidate.json',
    record: false,
  });
  assert.equal(ensureCandidateOutputPath('/tmp/candidatos/perfiles.json'), '/tmp/candidatos/perfiles.json');
  assert.throws(
    () => ensureCandidateOutputPath('/srv/paramoliterario/source/public/data/literary-profiles.json'),
    /solo puede escribirse dentro de \/tmp/u,
  );
  assert.equal(contentChangeDecision({ exact: false }, false).allowed, false);
  assert.equal(contentChangeDecision({ exact: false }, true).allowed, true);
});

test('valida el run de perfiles, el commit, los hashes y los recuentos', () => {
  const document = profilesDocument();
  const run = {
    environment: 'preview',
    status: 'validated',
    schema_version: 1,
    artifact_hashes: {
      artifact_kind: 'literary_profiles',
      profiles_candidate_sha256: 'a'.repeat(64),
      current_public_sha256: 'b'.repeat(64),
    },
    entity_counts: { authors: 1, works: 1, quotes: 1, profile_fragments: 1 },
    errors: [],
    git_commit: 'commit-1',
  };
  assert.deepEqual(
    validateSourceRun(run, document, 'a'.repeat(64), 'b'.repeat(64), 'commit-1'),
    [],
  );
  run.git_commit = 'commit-2';
  assert.match(
    validateSourceRun(run, document, 'a'.repeat(64), 'b'.repeat(64), 'commit-1').at(-1),
    /commit actual/u,
  );
});

test('exige cuatro confirmaciones para preparar las fichas', () => {
  const options = {
    confirmAction: 'STAGE_PROFILES',
    confirmRun: 'run-1',
    runId: 'run-1',
    confirmCandidateSha: 'a'.repeat(64),
    confirmCurrentPublicSha: 'b'.repeat(64),
  };
  assert.deepEqual(validateStageConfirmations(options, {
    candidateSha: 'a'.repeat(64),
    currentPublicSha: 'b'.repeat(64),
  }), []);
  options.confirmAction = 'incorrecto';
  assert.match(validateStageConfirmations(options, {
    candidateSha: 'a'.repeat(64),
    currentPublicSha: 'b'.repeat(64),
  })[0], /STAGE_PROFILES/u);
});

test('la reversión solo admite copias del directorio privado', () => {
  assert.equal(
    ensureBackupPath('/var/lib/paramo-directus/publication-backups/literary-profiles.json.bak'),
    '/var/lib/paramo-directus/publication-backups/literary-profiles.json.bak',
  );
  assert.throws(() => ensureBackupPath('/tmp/literary-profiles.json.bak'), /debe estar dentro/u);
});

test('verifica autores y obras en fuente, despliegue y HTTPS', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'paramo-profiles-finalize-'));
  const sourcePath = path.join(directory, 'source.json');
  const deployedPath = path.join(directory, 'deployed.json');
  const text = `${JSON.stringify(profilesDocument(), null, 2)}\n`;
  await writeFile(sourcePath, text, 'utf8');
  await writeFile(deployedPath, text, 'utf8');

  const verification = await verifyDeployedJson({
    countDocument: (document) => ({
      authors: document.authors.length,
      works: document.works.length,
    }),
    deployedPath,
    expectedEntityCounts: { authors: 1, works: 1 },
    expectedSha: sha256(text),
    fetchImpl: async () => new Response(text, {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
    servedUrl: 'https://example.invalid/literary-profiles.json',
    sourcePath,
    validateDocument: validatePublicProfilesDocument,
  });
  assert.deepEqual(verification.entity_counts.source, { authors: 1, works: 1 });
  assert.equal(verification.served_sha256, sha256(text));
});

test('solo finaliza un run de producción de fichas con confirmaciones completas', () => {
  const run = {
    environment: 'production',
    status: 'validated',
    schema_version: 1,
    artifact_hashes: {
      artifact_kind: 'literary_profiles',
      staged_profiles_sha256: 'a'.repeat(64),
    },
    entity_counts: { authors: 23, works: 28 },
    errors: [],
  };
  assert.deepEqual(validateProductionRun(run), []);
  assert.deepEqual(validateFinalizeConfirmations({
    runId: 'run-1',
    confirmRun: 'run-1',
    confirmAction: 'FINALIZE_PROFILES',
    confirmDeployedSha: 'a'.repeat(64),
  }, 'a'.repeat(64)), []);
  run.artifact_hashes.artifact_kind = 'quotes';
  assert.match(validateProductionRun(run)[0], /literary_profiles/u);
});
