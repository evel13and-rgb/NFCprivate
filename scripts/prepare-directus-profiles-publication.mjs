#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import {
  buildPublicProfilesDocument,
  comparisonReport,
  validatePublicProfilesDocument,
} from './export-directus-profiles-preview.mjs';

const execFileAsync = promisify(execFile);
const DEFAULT_DIRECTUS_URL = 'http://127.0.0.1:8055';
const DEFAULT_ADMIN_EMAIL = 'paramorliterario@gmail.com';
const DEFAULT_PASSWORD_FILE = '/etc/paramoliterario/directus/admin_initial_password';
const DEFAULT_OUTPUT_PATH = '/tmp/paramo-directus-profiles-publication-candidate.json';
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const publicProfilesPath = path.join(projectRoot, 'public', 'data', 'literary-profiles.json');

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
  if (resolved === '/tmp' || !resolved.startsWith('/tmp/')) {
    throw new Error(`El candidato solo puede escribirse dentro de /tmp: ${resolved}`);
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

function isDue(record, now) {
  return !record.publish_at || new Date(record.publish_at) <= now;
}

function isProfileCandidate(record, now) {
  return record.workflow_status === 'approved'
    && record.visibility === 'public'
    && record.verification_status !== 'rejected'
    && isDue(record, now);
}

function isQuoteCandidate(record, now) {
  return record.workflow_status === 'approved'
    && record.visibility === 'public'
    && record.publication_excluded === false
    && isDue(record, now);
}

function selectPublicationProfiles({ authors, works, quotes }, now = new Date()) {
  const issues = [];
  const warnings = [];
  const selectedAuthors = authors.filter((record) => isProfileCandidate(record, now));
  const selectedWorks = works.filter((record) => isProfileCandidate(record, now));
  const selectedQuotes = quotes.filter((record) => isQuoteCandidate(record, now));

  for (const [kind, records] of [
    ['authors', authors],
    ['works', works],
    ['quotes', quotes],
  ]) {
    const scheduled = records.filter((record) => (
      record.workflow_status === 'approved'
      && record.visibility === 'public'
      && !record.publication_excluded
      && record.publish_at
      && new Date(record.publish_at) > now
    ));
    if (scheduled.length) {
      warnings.push({
        code: `future_${kind}_excluded`,
        count: scheduled.length,
        ids: scheduled.slice(0, 12).map((record) => record.id),
      });
    }
  }

  if (!selectedAuthors.length) {
    issues.push({ code: 'empty_authors_candidate', message: 'No hay autores preparados' });
  }
  if (!selectedWorks.length) {
    issues.push({ code: 'empty_works_candidate', message: 'No hay obras preparadas' });
  }

  const authorIds = new Set(selectedAuthors.map((author) => author.id));
  const workIds = new Set(selectedWorks.map((work) => work.id));
  for (const author of selectedAuthors) {
    if (typeof author.display_name !== 'string' || !author.display_name.trim()) {
      issues.push({ code: 'author_display_name_missing', id: author.id });
    }
  }
  for (const work of selectedWorks) {
    if (typeof (work.public_title || work.display_title) !== 'string'
      || !(work.public_title || work.display_title).trim()) {
      issues.push({ code: 'work_title_missing', id: work.id });
    }
    if (!work.primary_author_id || !authorIds.has(work.primary_author_id)) {
      warnings.push({
        code: 'work_public_author_missing',
        id: work.id,
        author_id: work.primary_author_id,
      });
    }
  }
  for (const quote of selectedQuotes) {
    if (quote.verification_status !== 'verified') {
      issues.push({ code: 'quote_not_verified', id: quote.id });
    }
    if (!quote.reviewer_id || !quote.reviewed_at) {
      issues.push({ code: 'quote_review_missing', id: quote.id });
    }
    if (!workIds.has(quote.work_id)) {
      warnings.push({ code: 'quote_public_work_missing', id: quote.id, work_id: quote.work_id });
    }
  }

  return {
    authors: selectedAuthors,
    issues,
    quotes: selectedQuotes,
    warnings,
    works: selectedWorks,
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

function contentChangeDecision(comparison, allowContentChanges = false) {
  const hasChanges = !comparison.exact;
  return {
    has_changes: hasChanges,
    requires_explicit_authorization: hasChanges,
    explicit_authorization: allowContentChanges,
    allowed: !hasChanges || allowContentChanges,
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
  await mkdir(path.dirname(outputPath), { recursive: true, mode: 0o700 });
  const temporaryPath = `${outputPath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporaryPath, value, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
  await rename(temporaryPath, outputPath);
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    process.stdout.write('Uso: node scripts/prepare-directus-profiles-publication.mjs [--record] [--output=/tmp/archivo.json] [--allow-content-changes]\n');
    process.stdout.write('Nunca sustituye literary-profiles.json ni despliega la web.\n');
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
  const currentPublicText = await readFile(publicProfilesPath, 'utf8');
  const currentPublicDocument = JSON.parse(currentPublicText);
  const currentPublicSha = sha256(currentPublicText);
  validatePublicProfilesDocument(currentPublicDocument);

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
    const raw = response.status === 204 ? '' : await response.text();
    let payload = null;
    if (raw) {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = { raw: raw.slice(0, 300) };
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
      fetch(`${baseUrl}/items/authors?limit=1`),
    ]);
    if (publicResponse.status !== 403) {
      throw new Error(`La API pública de autores debería responder 403, no ${publicResponse.status}`);
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
          artifact_hashes: { artifact_kind: 'literary_profiles' },
          warnings: [],
          errors: [],
          git_commit: repository.commit,
          notes: 'Candidato de fichas validado; no implica publicación en producción.',
        }),
      });
      publicationRunId = run.id;
    }

    const [authors, works, themes, authorThemes, workThemes, quotes] = await Promise.all([
      request('/items/authors?limit=-1&fields=id,display_name,birth_year,death_year,country,language,period,movement,short_biography,public_biography_long,public_tone_notes,public_why_in_paramo,public_information_sources,portrait_path,portrait_alt,portrait_caption,portrait_credit,portrait_source_url,portrait_rights,portrait_object_position,workflow_status,visibility,verification_status,publish_at,sort'),
      request('/items/works?limit=-1&fields=id,public_title,display_title,original_title,primary_author_id,publication_year,genre,public_language,short_summary,public_summary_long,context,tone,public_fragment_notes,public_why_in_paramo,public_information_sources,workflow_status,visibility,verification_status,publish_at,sort'),
      request('/items/themes?limit=-1&fields=id,label,verification_status'),
      request('/items/author_themes?limit=-1&fields=author_id,theme_id,sort'),
      request('/items/work_themes?limit=-1&fields=work_id,theme_id,sort'),
      request('/items/quotes?limit=-1&fields=id,work_id,workflow_status,visibility,verification_status,publication_excluded,reviewer_id,reviewed_at,publish_at'),
    ]);
    const selection = selectPublicationProfiles({ authors, works, quotes });
    if (selection.issues.length) {
      const summary = summarizeIssues(selection.issues);
      throw new Error(`El candidato tiene ${summary.count} bloqueos: ${JSON.stringify(summary.counts)}`);
    }

    const candidateDocument = buildPublicProfilesDocument({
      authors: selection.authors,
      works: selection.works,
      themes,
      authorThemes,
      workThemes,
      quotes: selection.quotes,
    });
    validatePublicProfilesDocument(candidateDocument);
    const candidateText = `${JSON.stringify(candidateDocument, null, 2)}\n`;
    const candidateSha = sha256(candidateText);
    const byteExact = candidateText === currentPublicText;
    const contentComparison = comparisonReport(candidateDocument, currentPublicDocument);
    const comparison = { ...contentComparison, byte_exact: byteExact };
    const contentChange = contentChangeDecision({
      ...comparison,
      exact: comparison.exact && byteExact,
    }, options.allowContentChanges);
    if (!contentChange.allowed) {
      throw new Error('El candidato difiere del JSON vigente; use --allow-content-changes tras revisar las diferencias');
    }
    await writeCandidateAtomically(options.outputPath, candidateText);

    const authorIds = new Set(selection.authors.map((author) => author.id));
    const workIds = new Set(selection.works.map((work) => work.id));
    const usedAuthorThemes = authorThemes.filter((relation) => authorIds.has(relation.author_id));
    const usedWorkThemes = workThemes.filter((relation) => workIds.has(relation.work_id));
    const usedThemeIds = new Set([
      ...usedAuthorThemes.map((relation) => relation.theme_id),
      ...usedWorkThemes.map((relation) => relation.theme_id),
    ]);
    const entityCounts = {
      authors: candidateDocument.authors.length,
      works: candidateDocument.works.length,
      themes: usedThemeIds.size,
      author_themes: usedAuthorThemes.length,
      work_themes: usedWorkThemes.length,
      quotes: selection.quotes.length,
      profile_fragments: candidateDocument.works.reduce((total, work) => (
        total + work.fragment_count
      ), 0),
    };
    const artifactHashes = {
      artifact_kind: 'literary_profiles',
      profiles_candidate_sha256: candidateSha,
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
      content_change: contentChange,
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
        // El intento iniciado permanece visible aunque no pueda completarse su auditoría.
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
        // El token expirará aunque falle el cierre explícito.
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
  contentChangeDecision,
  ensureCandidateOutputPath,
  parseArguments,
  selectPublicationProfiles,
  summarizeIssues,
};
