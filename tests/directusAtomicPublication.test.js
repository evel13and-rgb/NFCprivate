import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { atomicReplaceArtifact, sha256 } from '../scripts/lib/atomic-json-artifact.mjs';
import {
  validateSourceRun,
  validateStageConfirmations,
} from '../scripts/stage-directus-quotes-publication.mjs';

test('sustituye y permite revertir un artefacto en un entorno aislado', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'paramo-atomic-publication-'));
  const backupDirectory = path.join(directory, 'backups');
  const targetPath = path.join(directory, 'quotes.json');
  const candidatePath = path.join(directory, 'candidate.json');
  const previous = '{"version":"anterior"}\n';
  const candidate = '{"version":"candidata"}\n';
  await writeFile(targetPath, previous, 'utf8');
  await writeFile(candidatePath, candidate, 'utf8');

  const publication = await atomicReplaceArtifact({
    backupDirectory,
    candidatePath,
    expectedCandidateSha: sha256(candidate),
    expectedCurrentSha: sha256(previous),
    operationId: 'test-publication',
    targetPath,
  });
  assert.equal(await readFile(targetPath, 'utf8'), candidate);
  assert.equal(await readFile(publication.backup_path, 'utf8'), previous);

  const rollback = await atomicReplaceArtifact({
    backupDirectory,
    candidatePath: publication.backup_path,
    expectedCandidateSha: sha256(previous),
    expectedCurrentSha: sha256(candidate),
    operationId: 'test-rollback',
    targetPath,
  });
  assert.equal(rollback.changed, true);
  assert.equal(await readFile(targetPath, 'utf8'), previous);
});

test('rechaza carreras si el hash vigente no es el esperado', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'paramo-atomic-race-'));
  const targetPath = path.join(directory, 'quotes.json');
  const candidatePath = path.join(directory, 'candidate.json');
  await writeFile(targetPath, 'actual', 'utf8');
  await writeFile(candidatePath, 'nuevo', 'utf8');

  await assert.rejects(
    atomicReplaceArtifact({
      backupDirectory: path.join(directory, 'backups'),
      candidatePath,
      expectedCandidateSha: sha256('nuevo'),
      expectedCurrentSha: sha256('distinto'),
      operationId: 'test-race',
      targetPath,
    }),
    /artefacto vigente cambió/u,
  );
  assert.equal(await readFile(targetPath, 'utf8'), 'actual');
});

test('valida el run de origen, los hashes y los recuentos', () => {
  const candidate = {
    quotes: [{ original: { text: 'Original' } }],
  };
  const run = {
    environment: 'preview',
    status: 'validated',
    schema_version: 1,
    artifact_hashes: {
      quotes_candidate_sha256: 'a'.repeat(64),
      current_public_sha256: 'b'.repeat(64),
    },
    entity_counts: { quotes: 1, quote_originals: 1 },
    errors: [],
  };
  assert.deepEqual(validateSourceRun(run, candidate, 'a'.repeat(64), 'b'.repeat(64)), []);
  run.status = 'failed';
  assert.match(validateSourceRun(run, candidate, 'a'.repeat(64), 'b'.repeat(64))[0], /validated/u);
});

test('exige cuatro confirmaciones independientes para preparar cambios', () => {
  const options = {
    confirmAction: 'STAGE_QUOTES',
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
  })[0], /STAGE_QUOTES/u);
});
