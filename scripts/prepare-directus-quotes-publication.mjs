#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import {
  buildPublicDocument,
  comparisonReport,
  validateEditorialRelations,
  validatePublicDocument,
} from './export-directus-quotes-preview.mjs';

const execFileAsync = promisify(execFile);
const DEFAULT_DIRECTUS_URL = 'http://127.0.0.1:8055';
const DEFAULT_ADMIN_EMAIL = 'paramorliterario@gmail.com';
const DEFAULT_PASSWORD_FILE = '/etc/paramoliterario/directus/admin_initial_password';
const DEFAULT_OUTPUT_PATH = '/tmp/paramo-directus-quotes-publication-candidate.json';
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const publicQuotesPath = path.join(projectRoot, 'public', 'data', 'quotes.json');

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function ensureLocalUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (!new Set(['127.0.0.1', 'localhost', '[::1]']).has(url.hostname)) {
    throw new Error(`Se rechaza DIRECTUS_URL no local: ${url.hostname}`);
  }
  return url.toString().replace(/\/$/u, '');
}

function ensureCandidateOutputPath(rawPath) {
  const resolved = path.resolve(rawPath);
  if (path.dirname(resolved) !== '/tmp') {
    throw new Error(`El candidato solo puede escribirse directamente en /tmp: ${resolved}`);
  }
  return resolved;
}

function parseArguments(argv) {
  const result = {
    allowContentChanges: false,
    help: false,
    outputPath: DEFAULT_OUTPUT_PATH,
    record: false,
  };
  for (const argument of argv) {
    if (argument === '--allow-content-changes') result.allowContentChanges = true;
    else if (argument === '--help') result.help = true;
    else if (argument === '--record') result.record = true;
    else if (argument.startsWith('--output=')) {
      result.outputPath = argument.slice('--output='.length);
    } else {
      throw new Error(`Argumento no reconocido: ${argument}`);
    }
  }
  result.outputPath = ensureCandidateOutputPath(result.outputPath);
  return result;
}

function selectPublicationRecords({ quotes, originals }, now = new Date()) {
  const issues = [];
  const warnings = [];
  const selectedQuotes = quotes.filter((quote) => (
    quote.workflow_status === 'approved'
    && quote.visibility === 'public'
    && !quote.publication_excluded
    && (!quote.publish_at || new Date(quote.publish_at) <= now)
  ));
  const scheduledPublic = quotes.filter((quote) => (
    quote.workflow_status === 'approved'
    && quote.visibility === 'public'
    && !quote.publication_excluded
    && quote.publish_at
    && new Date(quote.publish_at) > now
  ));
  if (scheduledPublic.length) {
    warnings.push({
      code: 'future_publish_at_excluded',
      count: scheduledPublic.length,
      ids: scheduledPublic.slice(0, 12).map((quote) => quote.id),
    });
  }
  if (!selectedQuotes.length) {
    issues.push({ code: 'empty_candidate', message: 'No hay frases preparadas para publicar' });
  }

  const primaryOriginalsByQuote = new Map();
  for (const original of originals) {
    if (!original.is_primary || original.workflow_status === 'archived') continue;
    const values = primaryOriginalsByQuote.get(original.quote_id) || [];
    values.push(original);
    primaryOriginalsByQuote.set(original.quote_id, values);
  }

  const selectedOriginals = [];
  for (const quote of selectedQuotes) {
    if (quote.verification_status !== 'verified') {
      issues.push({ code: 'quote_not_verified', id: quote.id });
    }
    if (!quote.reviewer_id || !quote.reviewed_at) {
      issues.push({ code: 'quote_review_missing', id: quote.id });
    }
    const primaryOriginals = primaryOriginalsByQuote.get(quote.id) || [];
    if (primaryOriginals.length > 1) {
      issues.push({ code: 'multiple_primary_originals', id: quote.id });
      continue;
    }
    if (primaryOriginals.length === 1) {
      const [original] = primaryOriginals;
      if (original.workflow_status !== 'approved' || original.visibility !== 'public') {
        issues.push({ code: 'original_not_publishable', id: original.import_key || original.id });
      }
      if (original.verification_status !== 'verified') {
        issues.push({ code: 'original_not_verified', id: original.import_key || original.id });
      }
      if (!original.reviewer_id || !original.reviewed_at) {
        issues.push({ code: 'original_review_missing', id: original.import_key || original.id });
      }
      selectedOriginals.push(original);
    }
  }
  return {
    issues,
    originals: selectedOriginals,
    quotes: selectedQuotes,
    warnings,
  };
}

function summarizeIssues(issues) {
  const counts = {};
  for (const issue of issues) counts[issue.code] = (counts[issue.code] || 0) + 1;
  return {
    count: issues.length,
    counts,
    sample: issues.slice(0, 12),
  };
}

async function gitState() {
  const [{ stdout: commitOutput }, { stdout: statusOutput }] = await Promise.all([
    execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: projectRoot }),
    execFileAsync('git', ['status', '--porcelain'], { cwd: projectRoot }),
  ]);
  return {
    commit: commitOutput.trim(),
    dirty: Boolean(statusOutput.trim()),
  };
}

async function writeCandidateAtomically(outputPath, value) {
  const temporaryPath = `${outputPath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporaryPath, value, { encoding: 'utf8', flag: 'wx' });
  await rename(temporaryPath, outputPath);
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    process.stdout.write('Uso: node scripts/prepare-directus-quotes-publication.mjs [--record] [--output=/tmp/archivo.json] [--allow-content-changes]\n');
    process.stdout.write('Nunca sustituye public/data/quotes.json ni despliega la web.\n');
    return;
  }

  const repository = await gitState();
  if (options.record && repository.dirty) {
    throw new Error('--record exige un árbol de trabajo Git limpio');
  }

  const baseUrl = ensureLocalUrl(process.env.DIRECTUS_URL || DEFAULT_DIRECTUS_URL);
  const email = process.env.DIRECTUS_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const passwordFile = process.env.DIRECTUS_ADMIN_PASSWORD_FILE || DEFAULT_PASSWORD_FILE;
  const password = (await readFile(passwordFile, 'utf8')).trim();
  const currentPublicText = await readFile(publicQuotesPath, 'utf8');
  const currentPublicDocument = JSON.parse(currentPublicText);
  const currentPublicSha = sha256(currentPublicText);
  validatePublicDocument(currentPublicDocument);

  let accessToken;
  let refreshToken;
  let publicationRunId = null;

  async function request(apiPath, requestOptions = {}) {
    const response = await fetch(`${baseUrl}${apiPath}`, {
      ...requestOptions,
      headers: {
        'content-type': 'application/json',
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        ...requestOptions.headers,
      },
    });
    const rawPayload = response.status === 204 ? '' : await response.text();
    let payload = null;
    if (rawPayload) {
      try {
        payload = JSON.parse(rawPayload);
      } catch {
        payload = { raw: rawPayload.slice(0, 300) };
      }
    }
    if (!response.ok) {
      const reason = payload?.errors?.map((error) => error.message).join('; ')
        || payload?.raw
        || response.statusText;
      throw new Error(`${requestOptions.method || 'GET'} ${apiPath}: ${response.status} ${reason}`);
    }
    return payload?.data ?? payload;
  }

  async function updateRun(data) {
    if (!publicationRunId) return;
    await request(`/items/publication_runs/${publicationRunId}?fields=id,status`, {
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

    const [currentUser, publicResponse] = await Promise.all([
      request('/users/me?fields=id,email'),
      fetch(`${baseUrl}/items/quotes?limit=1`),
    ]);
    if (publicResponse.status !== 403) {
      throw new Error(`La API pública de frases debería responder 403, no ${publicResponse.status}`);
    }

    if (options.record) {
      const run = await request('/items/publication_runs?fields=id,status', {
        method: 'POST',
        body: JSON.stringify({
          initiated_by: currentUser.id,
          environment: 'preview',
          status: 'started',
          schema_version: 1,
          entity_counts: {},
          artifact_hashes: {},
          warnings: [],
          errors: [],
          git_commit: repository.commit,
          notes: 'Candidato estático validado; no implica publicación en producción.',
        }),
      });
      publicationRunId = run.id;
    }

    const [quotes, originals, sources, quoteSources, originalSources] = await Promise.all([
      request('/items/quotes?limit=-1&sort=legacy_index&fields=id,legacy_index,text,highlight,language,quote_type,author_id,work_id,speaker_display_name,legacy_attribution,legacy_work,text_hash,publication_excluded,workflow_status,visibility,verification_status,reviewer_id,reviewed_at,publish_at'),
      request('/items/quote_originals?limit=-1&fields=id,import_key,quote_id,original_text,language,label,is_primary,workflow_status,visibility,verification_status,reviewer_id,reviewed_at'),
      request('/items/sources?limit=-1&fields=id,rights_status,verification_status'),
      request('/items/quote_sources?limit=-1&fields=quote_id,source_id,relation_role'),
      request('/items/quote_original_sources?limit=-1&fields=quote_original_id,source_id,relation_role'),
    ]);
    const selection = selectPublicationRecords({ quotes, originals });
    if (selection.issues.length) {
      const summary = summarizeIssues(selection.issues);
      throw new Error(`El candidato tiene ${summary.count} bloqueos: ${JSON.stringify(summary.counts)}`);
    }

    validateEditorialRelations({
      quotes: selection.quotes,
      originals: selection.originals,
      sources,
      quoteSources,
      originalSources,
    });

    const provisionalDocument = buildPublicDocument({
      quotes: selection.quotes,
      originals: selection.originals,
      generatedAt: currentPublicDocument.generated_at,
    });
    const comparison = comparisonReport(provisionalDocument, currentPublicDocument);
    if (!comparison.exact && !options.allowContentChanges) {
      throw new Error('El candidato difiere del JSON vigente; use --allow-content-changes tras revisar las diferencias');
    }
    const generatedAt = comparison.exact
      ? currentPublicDocument.generated_at
      : new Date().toISOString();
    const candidateDocument = buildPublicDocument({
      quotes: selection.quotes,
      originals: selection.originals,
      generatedAt,
    });
    validatePublicDocument(candidateDocument);
    const candidateText = `${JSON.stringify(candidateDocument, null, 2)}\n`;
    const candidateSha = sha256(candidateText);
    const byteExact = candidateText === currentPublicText;
    await writeCandidateAtomically(options.outputPath, candidateText);

    const entityCounts = {
      quotes: selection.quotes.length,
      quote_originals: selection.originals.length,
      sources: new Set([
        ...quoteSources
          .filter((relation) => selection.quotes.some((quote) => quote.id === relation.quote_id))
          .map((relation) => relation.source_id),
        ...originalSources
          .filter((relation) => selection.originals.some((original) => (
            original.id === relation.quote_original_id
          )))
          .map((relation) => relation.source_id),
      ]).size,
    };
    const artifactHashes = {
      quotes_candidate_sha256: candidateSha,
      current_public_sha256: currentPublicSha,
    };
    await updateRun({
      status: 'validated',
      entity_counts: entityCounts,
      artifact_hashes: artifactHashes,
      warnings: selection.warnings,
      errors: [],
      finished_at: new Date().toISOString(),
    });

    process.stdout.write(`${JSON.stringify({
      mode: options.record ? 'record' : 'dry-run',
      output: options.outputPath,
      writes_public_files: false,
      deploys_web: false,
      public_api_http: publicResponse.status,
      publication_run_id: publicationRunId,
      publication_run_status: options.record ? 'validated' : null,
      git_commit: repository.commit,
      git_dirty: repository.dirty,
      entity_counts: entityCounts,
      comparison,
      byte_exact: byteExact,
      candidate_sha256: candidateSha,
      public_sha256: currentPublicSha,
      warnings: selection.warnings,
    }, null, 2)}\n`);
  } catch (error) {
    if (publicationRunId) {
      try {
        await updateRun({
          status: 'failed',
          errors: [{ message: error.message }],
          finished_at: new Date().toISOString(),
        });
      } catch {
        // Se conserva el error original; una ejecución iniciada queda visible para auditoría.
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
        // El token expira aunque falle el cierre; no se oculta el resultado principal.
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
  ensureCandidateOutputPath,
  parseArguments,
  selectPublicationRecords,
  summarizeIssues,
};
