#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { validatePublicDocument } from './export-directus-quotes-preview.mjs';
import { sha256, verifyDeployedJson } from './lib/verify-deployed-json.mjs';

const execFileAsync = promisify(execFile);
const DEFAULT_DIRECTUS_URL = 'http://127.0.0.1:8055';
const DEFAULT_ADMIN_EMAIL = 'paramorliterario@gmail.com';
const DEFAULT_PASSWORD_FILE = '/etc/paramoliterario/directus/admin_initial_password';
const SERVED_QUOTES_URL = 'https://paramoliterario.com/public/data/quotes.json';
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const sourcePath = path.join(projectRoot, 'public', 'data', 'quotes.json');
const deployedPath = '/var/www/paramo-literario/public/data/quotes.json';

function ensureLocalUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (!new Set(['127.0.0.1', 'localhost', '[::1]']).has(url.hostname)) {
    throw new Error(`Se rechaza DIRECTUS_URL no local: ${url.hostname}`);
  }
  return url.toString().replace(/\/$/u, '');
}

function parseArguments(argv) {
  const result = {
    confirmAction: null,
    confirmDeployedSha: null,
    confirmRun: null,
    finalize: false,
    help: false,
    runId: null,
  };
  for (const argument of argv) {
    if (argument === '--finalize') result.finalize = true;
    else if (argument === '--help') result.help = true;
    else if (argument.startsWith('--confirm-action=')) {
      result.confirmAction = argument.slice('--confirm-action='.length);
    } else if (argument.startsWith('--confirm-deployed-sha=')) {
      result.confirmDeployedSha = argument.slice('--confirm-deployed-sha='.length).toLowerCase();
    } else if (argument.startsWith('--confirm-run=')) {
      result.confirmRun = argument.slice('--confirm-run='.length);
    } else if (argument.startsWith('--run=')) {
      result.runId = argument.slice('--run='.length);
    } else throw new Error(`Argumento no reconocido: ${argument}`);
  }
  if (!result.help && !/^[a-f0-9-]{36}$/u.test(result.runId || '')) {
    throw new Error('--run debe contener el UUID de un publication_run de producción');
  }
  if (result.confirmDeployedSha && !/^[a-f0-9]{64}$/u.test(result.confirmDeployedSha)) {
    throw new Error('--confirm-deployed-sha debe contener un SHA-256 hexadecimal');
  }
  return result;
}

function validateProductionRun(run) {
  const errors = [];
  if (run.environment !== 'production') errors.push('environment debe ser production');
  if (!new Set(['validated', 'published']).has(run.status)) {
    errors.push('status debe ser validated o published');
  }
  if (run.schema_version !== 1) errors.push('schema_version debe ser 1');
  if (!/^[a-f0-9]{64}$/u.test(run.artifact_hashes?.staged_quotes_sha256 || '')) {
    errors.push('falta staged_quotes_sha256');
  }
  if (!Number.isInteger(run.entity_counts?.quotes) || run.entity_counts.quotes < 1) {
    errors.push('entity_counts.quotes no es válido');
  }
  if (Array.isArray(run.errors) && run.errors.length) {
    errors.push('publication_runs contiene errores');
  }
  return errors;
}

function validateFinalizeConfirmations(options, expectedSha) {
  const errors = [];
  if (options.confirmAction !== 'FINALIZE_QUOTES') {
    errors.push('falta --confirm-action=FINALIZE_QUOTES');
  }
  if (options.confirmRun !== options.runId) errors.push('--confirm-run no coincide con --run');
  if (options.confirmDeployedSha !== expectedSha) {
    errors.push('--confirm-deployed-sha no coincide con el artefacto desplegado');
  }
  return errors;
}

async function gitState() {
  const [{ stdout: commitOutput }, { stdout: statusOutput }, { stdout: trackedText }] = await Promise.all([
    execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: projectRoot }),
    execFileAsync('git', ['status', '--porcelain'], { cwd: projectRoot }),
    execFileAsync('git', ['show', 'HEAD:public/data/quotes.json'], {
      cwd: projectRoot,
      maxBuffer: 20 * 1024 * 1024,
    }),
  ]);
  return {
    commit: commitOutput.trim(),
    dirty: Boolean(statusOutput.trim()),
    tracked_quotes_sha256: sha256(trackedText),
  };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    process.stdout.write('Uso: node scripts/finalize-directus-quotes-deployment.mjs --run=<uuid-producción> [--finalize y confirmaciones]\n');
    process.stdout.write('Verifica Git, /var/www y HTTPS antes de marcar published.\n');
    return;
  }

  const repository = await gitState();
  if (options.finalize && repository.dirty) {
    throw new Error('--finalize exige un árbol de trabajo Git limpio');
  }
  const baseUrl = ensureLocalUrl(process.env.DIRECTUS_URL || DEFAULT_DIRECTUS_URL);
  const email = process.env.DIRECTUS_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const passwordFile = process.env.DIRECTUS_ADMIN_PASSWORD_FILE || DEFAULT_PASSWORD_FILE;
  const password = (await readFile(passwordFile, 'utf8')).trim();
  let accessToken;
  let refreshToken;

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

  try {
    const login = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, mode: 'json' }),
    });
    accessToken = login.access_token;
    refreshToken = login.refresh_token;
    const [run, publicRunsResponse] = await Promise.all([
      request(`/items/publication_runs/${options.runId}?fields=id,environment,status,schema_version,entity_counts,artifact_hashes,warnings,errors,git_commit,notes,finished_at`),
      fetch(`${baseUrl}/items/publication_runs?limit=1`),
    ]);
    if (publicRunsResponse.status !== 403) {
      throw new Error(`publication_runs debería responder 403 sin autenticar, no ${publicRunsResponse.status}`);
    }
    const runErrors = validateProductionRun(run);
    if (runErrors.length) throw new Error(runErrors.join('; '));
    const expectedSha = run.artifact_hashes.staged_quotes_sha256;
    if (repository.tracked_quotes_sha256 !== expectedSha) {
      throw new Error('El JSON versionado en HEAD no coincide con el production_run');
    }
    const servedUrl = `${SERVED_QUOTES_URL}?publication_run=${encodeURIComponent(run.id)}&t=${Date.now()}`;
    const verification = await verifyDeployedJson({
      deployedPath,
      expectedQuoteCount: run.entity_counts.quotes,
      expectedSha,
      servedUrl,
      sourcePath,
      validateDocument: validatePublicDocument,
    });
    const report = {
      mode: options.finalize ? 'finalize' : 'dry-run',
      publication_run_id: run.id,
      status_before: run.status,
      status_after: options.finalize ? 'published' : run.status,
      git_commit: repository.commit,
      git_dirty: repository.dirty,
      tracked_quotes_sha256: repository.tracked_quotes_sha256,
      deployed_path: deployedPath,
      served_url: SERVED_QUOTES_URL,
      public_runs_api_http: publicRunsResponse.status,
      verification,
      writes_directus: options.finalize && run.status !== 'published',
      writes_public_files: false,
      deploys_web: false,
    };

    if (!options.finalize) {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
      return;
    }
    const confirmationErrors = validateFinalizeConfirmations(options, expectedSha);
    if (confirmationErrors.length) throw new Error(confirmationErrors.join('; '));
    if (run.status !== 'published') {
      await request(`/items/publication_runs/${run.id}?fields=id,status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'published',
          artifact_hashes: {
            ...run.artifact_hashes,
            deployed_file_sha256: verification.deployed_sha256,
            served_https_sha256: verification.served_sha256,
          },
          git_commit: repository.commit,
          finished_at: new Date().toISOString(),
          notes: `${run.notes || ''}\nDespliegue verificado en disco y por HTTPS; estado published confirmado.`.trim(),
        }),
      });
    }
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
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
  validateFinalizeConfirmations,
  validateProductionRun,
};
