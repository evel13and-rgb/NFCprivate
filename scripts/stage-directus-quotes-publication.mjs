#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { validatePublicDocument } from './export-directus-quotes-preview.mjs';
import {
  contentChangeDecision,
  ensureCandidateOutputPath,
} from './prepare-directus-quotes-publication.mjs';
import { atomicReplaceArtifact, sha256 } from './lib/atomic-json-artifact.mjs';

const execFileAsync = promisify(execFile);
const DEFAULT_DIRECTUS_URL = 'http://127.0.0.1:8055';
const DEFAULT_ADMIN_EMAIL = 'paramorliterario@gmail.com';
const DEFAULT_PASSWORD_FILE = '/etc/paramoliterario/directus/admin_initial_password';
const DEFAULT_CANDIDATE_PATH = '/tmp/paramo-directus-quotes-publication-candidate.json';
const BACKUP_DIRECTORY = '/var/lib/paramo-directus/publication-backups';
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const targetPath = path.join(projectRoot, 'public', 'data', 'quotes.json');

function ensureLocalUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (!new Set(['127.0.0.1', 'localhost', '[::1]']).has(url.hostname)) {
    throw new Error(`Se rechaza DIRECTUS_URL no local: ${url.hostname}`);
  }
  return url.toString().replace(/\/$/u, '');
}

function parseArguments(argv) {
  const result = {
    allowContentChanges: false,
    candidatePath: DEFAULT_CANDIDATE_PATH,
    confirmAction: null,
    confirmCandidateSha: null,
    confirmCurrentPublicSha: null,
    confirmRun: null,
    help: false,
    runId: null,
    stage: false,
  };
  for (const argument of argv) {
    if (argument === '--allow-content-changes') result.allowContentChanges = true;
    else if (argument === '--help') result.help = true;
    else if (argument === '--stage') result.stage = true;
    else if (argument.startsWith('--candidate=')) {
      result.candidatePath = argument.slice('--candidate='.length);
    } else if (argument.startsWith('--confirm-action=')) {
      result.confirmAction = argument.slice('--confirm-action='.length);
    } else if (argument.startsWith('--confirm-candidate-sha=')) {
      result.confirmCandidateSha = argument.slice('--confirm-candidate-sha='.length).toLowerCase();
    } else if (argument.startsWith('--confirm-current-public-sha=')) {
      result.confirmCurrentPublicSha = argument.slice('--confirm-current-public-sha='.length).toLowerCase();
    } else if (argument.startsWith('--confirm-run=')) {
      result.confirmRun = argument.slice('--confirm-run='.length);
    } else if (argument.startsWith('--run=')) {
      result.runId = argument.slice('--run='.length);
    } else {
      throw new Error(`Argumento no reconocido: ${argument}`);
    }
  }
  result.candidatePath = ensureCandidateOutputPath(result.candidatePath);
  if (!result.help && !/^[a-f0-9-]{36}$/u.test(result.runId || '')) {
    throw new Error('--run debe contener el UUID de un publication_run validado');
  }
  for (const [name, value] of [
    ['--confirm-candidate-sha', result.confirmCandidateSha],
    ['--confirm-current-public-sha', result.confirmCurrentPublicSha],
  ]) {
    if (value && !/^[a-f0-9]{64}$/u.test(value)) {
      throw new Error(`${name} debe contener un SHA-256 hexadecimal`);
    }
  }
  return result;
}

function validateSourceRun(run, candidateDocument, candidateSha, currentPublicSha) {
  const errors = [];
  if (run.environment !== 'preview') errors.push('environment debe ser preview');
  if (run.status !== 'validated') errors.push('status debe ser validated');
  if (run.schema_version !== 1) errors.push('schema_version debe ser 1');
  if (run.artifact_hashes?.quotes_candidate_sha256 !== candidateSha) {
    errors.push('el hash del candidato no coincide con publication_runs');
  }
  if (run.artifact_hashes?.current_public_sha256 !== currentPublicSha) {
    errors.push('el JSON vigente no coincide con la base validada por publication_runs');
  }
  if (run.entity_counts?.quotes !== candidateDocument.quotes.length) {
    errors.push('el recuento de frases no coincide con publication_runs');
  }
  const originalCount = candidateDocument.quotes.filter((quote) => quote.original).length;
  if (run.entity_counts?.quote_originals !== originalCount) {
    errors.push('el recuento de originales no coincide con publication_runs');
  }
  if (Array.isArray(run.errors) && run.errors.length) errors.push('publication_runs contiene errores');
  return errors;
}

function validateStageConfirmations(options, { candidateSha, currentPublicSha }) {
  const errors = [];
  if (options.confirmAction !== 'STAGE_QUOTES') errors.push('falta --confirm-action=STAGE_QUOTES');
  if (options.confirmRun !== options.runId) errors.push('--confirm-run no coincide con --run');
  if (options.confirmCandidateSha !== candidateSha) {
    errors.push('--confirm-candidate-sha no coincide con el candidato');
  }
  if (options.confirmCurrentPublicSha !== currentPublicSha) {
    errors.push('--confirm-current-public-sha no coincide con el JSON vigente');
  }
  return errors;
}

async function gitState() {
  const [{ stdout: commitOutput }, { stdout: statusOutput }] = await Promise.all([
    execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: projectRoot }),
    execFileAsync('git', ['status', '--porcelain'], { cwd: projectRoot }),
  ]);
  return { commit: commitOutput.trim(), dirty: Boolean(statusOutput.trim()) };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    process.stdout.write('Uso: node scripts/stage-directus-quotes-publication.mjs --run=<uuid> [--stage y confirmaciones]\n');
    process.stdout.write('Prepara el JSON en el repositorio; nunca despliega /var/www.\n');
    return;
  }

  const repository = await gitState();
  if (options.stage && repository.dirty) {
    throw new Error('--stage exige un árbol de trabajo Git limpio');
  }
  const [candidateText, currentPublicText] = await Promise.all([
    readFile(options.candidatePath, 'utf8'),
    readFile(targetPath, 'utf8'),
  ]);
  const candidateDocument = JSON.parse(candidateText);
  const currentPublicDocument = JSON.parse(currentPublicText);
  validatePublicDocument(candidateDocument);
  validatePublicDocument(currentPublicDocument);
  const candidateSha = sha256(candidateText);
  const currentPublicSha = sha256(currentPublicText);
  const comparison = {
    exact: candidateText === currentPublicText,
    quote_count_before: currentPublicDocument.quotes.length,
    quote_count_after: candidateDocument.quotes.length,
  };
  const contentChange = contentChangeDecision(comparison, options.allowContentChanges);

  const baseUrl = ensureLocalUrl(process.env.DIRECTUS_URL || DEFAULT_DIRECTUS_URL);
  const email = process.env.DIRECTUS_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const passwordFile = process.env.DIRECTUS_ADMIN_PASSWORD_FILE || DEFAULT_PASSWORD_FILE;
  const password = (await readFile(passwordFile, 'utf8')).trim();
  let accessToken;
  let refreshToken;
  let productionRunId = null;
  let replacementResult = null;
  let productionRunFinalized = false;

  async function request(apiPath, requestOptions = {}) {
    const response = await fetch(`${baseUrl}${apiPath}`, {
      ...requestOptions,
      headers: {
        'content-type': 'application/json',
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        ...requestOptions.headers,
      },
    });
    const raw = response.status === 204 ? '' : await response.text();
    const payload = raw ? JSON.parse(raw) : null;
    if (!response.ok) {
      const reason = payload?.errors?.map((error) => error.message).join('; ')
        || response.statusText;
      throw new Error(`${requestOptions.method || 'GET'} ${apiPath}: ${response.status} ${reason}`);
    }
    return payload?.data ?? payload;
  }

  async function updateProductionRun(data) {
    if (!productionRunId) return;
    await request(`/items/publication_runs/${productionRunId}?fields=id,status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  try {
    const login = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, mode: 'json' }),
    });
    accessToken = login.access_token;
    refreshToken = login.refresh_token;
    const [sourceRun, currentUser, publicRunsResponse] = await Promise.all([
      request(`/items/publication_runs/${options.runId}?fields=id,environment,status,schema_version,entity_counts,artifact_hashes,warnings,errors,git_commit,finished_at`),
      request('/users/me?fields=id,email'),
      fetch(`${baseUrl}/items/publication_runs?limit=1`),
    ]);
    if (publicRunsResponse.status !== 403) {
      throw new Error(`publication_runs debería responder 403 sin autenticar, no ${publicRunsResponse.status}`);
    }
    const sourceRunErrors = validateSourceRun(
      sourceRun,
      candidateDocument,
      candidateSha,
      currentPublicSha,
    );
    if (sourceRunErrors.length) throw new Error(sourceRunErrors.join('; '));

    if (!options.stage) {
      process.stdout.write(`${JSON.stringify({
        mode: 'dry-run',
        source_publication_run_id: sourceRun.id,
        source_publication_run_status: sourceRun.status,
        candidate: options.candidatePath,
        target: targetPath,
        backup_directory: BACKUP_DIRECTORY,
        writes_public_files: false,
        writes_directus: false,
        deploys_web: false,
        public_runs_api_http: publicRunsResponse.status,
        comparison,
        content_change: contentChange,
        candidate_sha256: candidateSha,
        current_public_sha256: currentPublicSha,
        git_commit: repository.commit,
        git_dirty: repository.dirty,
      }, null, 2)}\n`);
      return;
    }

    if (!contentChange.allowed) {
      throw new Error('El candidato contiene cambios; falta --allow-content-changes');
    }
    if (candidateSha === currentPublicSha) {
      throw new Error('El candidato y el JSON vigente son idénticos; no hay nada que preparar');
    }
    const confirmationErrors = validateStageConfirmations(options, {
      candidateSha,
      currentPublicSha,
    });
    if (confirmationErrors.length) throw new Error(confirmationErrors.join('; '));

    const productionRun = await request('/items/publication_runs?fields=id,status', {
      method: 'POST',
      body: JSON.stringify({
        initiated_by: currentUser.id,
        environment: 'production',
        status: 'started',
        schema_version: 1,
        entity_counts: sourceRun.entity_counts,
        artifact_hashes: {},
        warnings: sourceRun.warnings || [],
        errors: [],
        git_commit: repository.commit,
        notes: `Artefacto preparado desde la vista previa ${sourceRun.id}; despliegue web pendiente.`,
      }),
    });
    productionRunId = productionRun.id;

    replacementResult = await atomicReplaceArtifact({
      backupDirectory: BACKUP_DIRECTORY,
      candidatePath: options.candidatePath,
      expectedCandidateSha: candidateSha,
      expectedCurrentSha: currentPublicSha,
      operationId: productionRunId,
      targetPath,
    });
    await updateProductionRun({
      status: 'validated',
      artifact_hashes: {
        previous_public_sha256: currentPublicSha,
        staged_quotes_sha256: candidateSha,
        backup_sha256: replacementResult.backup_sha256,
      },
      finished_at: new Date().toISOString(),
      notes: `Artefacto preparado desde ${sourceRun.id}. Copia reversible: ${replacementResult.backup_path}. Despliegue web pendiente.`,
    });
    productionRunFinalized = true;
    process.stdout.write(`${JSON.stringify({
      mode: 'stage',
      source_publication_run_id: sourceRun.id,
      production_publication_run_id: productionRunId,
      production_publication_run_status: 'validated',
      target: targetPath,
      deploys_web: false,
      replacement: replacementResult,
    }, null, 2)}\n`);
  } catch (error) {
    if (replacementResult?.changed && !productionRunFinalized) {
      try {
        const rollback = await atomicReplaceArtifact({
          backupDirectory: BACKUP_DIRECTORY,
          candidatePath: replacementResult.backup_path,
          expectedCandidateSha: currentPublicSha,
          expectedCurrentSha: candidateSha,
          operationId: `audit-rollback-${productionRunId}`,
          targetPath,
        });
        error.rolledBackAutomatically = rollback.changed;
      } catch (rollbackError) {
        error.message = `${error.message}; además falló la reversión: ${rollbackError.message}`;
      }
    }
    if (productionRunId) {
      try {
        await updateProductionRun({
          status: 'failed',
          errors: [{
            message: error.message,
            rolled_back_automatically: Boolean(error.rolledBackAutomatically),
          }],
          finished_at: new Date().toISOString(),
        });
      } catch {
        // No se oculta el error original si falla el registro de auditoría.
      }
    }
    throw error;
  } finally {
    if (accessToken && refreshToken) {
      try {
        await request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch {
        // El token expira aunque falle el cierre de sesión.
      }
    }
  }
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main().catch((error) => {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exitCode = 1;
  });
}

export {
  parseArguments,
  validateSourceRun,
  validateStageConfirmations,
};
