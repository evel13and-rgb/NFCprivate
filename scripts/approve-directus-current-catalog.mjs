#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildPublicDocument,
  comparisonReport,
  validateEditorialRelations,
  validatePublicDocument,
} from './export-directus-quotes-preview.mjs';

const DEFAULT_DIRECTUS_URL = 'http://127.0.0.1:8055';
const DEFAULT_ADMIN_EMAIL = 'paramorliterario@gmail.com';
const DEFAULT_PASSWORD_FILE = '/etc/paramoliterario/directus/admin_initial_password';
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

function parseArguments(argv) {
  const result = {
    apply: false,
    confirmPublicSha: null,
    help: false,
  };

  for (const argument of argv) {
    if (argument === '--apply') result.apply = true;
    else if (argument === '--help') result.help = true;
    else if (argument.startsWith('--confirm-public-sha=')) {
      result.confirmPublicSha = argument.slice('--confirm-public-sha='.length).toLowerCase();
    } else {
      throw new Error(`Argumento no reconocido: ${argument}`);
    }
  }

  if (result.confirmPublicSha && !/^[a-f0-9]{64}$/u.test(result.confirmPublicSha)) {
    throw new Error('--confirm-public-sha debe contener un SHA-256 hexadecimal');
  }
  if (result.apply && !result.confirmPublicSha) {
    throw new Error('--apply exige --confirm-public-sha=<sha256>');
  }
  return result;
}

function publicationCandidates({ quotes, originals }) {
  return {
    quotes: quotes.filter((quote) => (
      quote.workflow_status !== 'archived' && !quote.publication_excluded
    )),
    originals: originals.filter((original) => (
      original.is_primary && original.workflow_status !== 'archived'
    )),
  };
}

function readinessIssues({ quotes, originals }, now = new Date()) {
  const candidates = publicationCandidates({ quotes, originals });
  const issues = [];

  function add(collection, id, field, actual, expected) {
    issues.push({ collection, id, field, actual, expected });
  }

  for (const quote of candidates.quotes) {
    if (quote.workflow_status !== 'approved') {
      add('quotes', quote.id, 'workflow_status', quote.workflow_status, 'approved');
    }
    if (quote.visibility !== 'public') {
      add('quotes', quote.id, 'visibility', quote.visibility, 'public');
    }
    if (quote.verification_status !== 'verified') {
      add('quotes', quote.id, 'verification_status', quote.verification_status, 'verified');
    }
    if (!quote.reviewer_id) add('quotes', quote.id, 'reviewer_id', null, 'directus_user');
    if (!quote.reviewed_at) add('quotes', quote.id, 'reviewed_at', null, 'timestamp');
    if (quote.publish_at && new Date(quote.publish_at) > now) {
      add('quotes', quote.id, 'publish_at', quote.publish_at, `<=${now.toISOString()}`);
    }
  }

  for (const original of candidates.originals) {
    const id = original.import_key || original.id;
    if (original.workflow_status !== 'approved') {
      add('quote_originals', id, 'workflow_status', original.workflow_status, 'approved');
    }
    if (original.visibility !== 'public') {
      add('quote_originals', id, 'visibility', original.visibility, 'public');
    }
    if (original.verification_status !== 'verified') {
      add('quote_originals', id, 'verification_status', original.verification_status, 'verified');
    }
    if (!original.reviewer_id) {
      add('quote_originals', id, 'reviewer_id', null, 'directus_user');
    }
    if (!original.reviewed_at) {
      add('quote_originals', id, 'reviewed_at', null, 'timestamp');
    }
  }
  return issues;
}

function summarizeReadiness(data, now = new Date()) {
  const candidates = publicationCandidates(data);
  const issues = readinessIssues(data, now);
  const issueCounts = {};
  for (const issue of issues) {
    const key = `${issue.collection}.${issue.field}`;
    issueCounts[key] = (issueCounts[key] || 0) + 1;
  }
  return {
    ready: issues.length === 0,
    candidate_quotes: candidates.quotes.length,
    candidate_originals: candidates.originals.length,
    issue_count: issues.length,
    issue_counts: issueCounts,
    issue_sample: issues.slice(0, 12),
  };
}

function buildApprovalPlan(data) {
  const candidates = publicationCandidates(data);
  const quoteIds = candidates.quotes
    .filter((quote) => (
      quote.workflow_status !== 'approved'
      || quote.visibility !== 'public'
      || !quote.reviewer_id
      || !quote.reviewed_at
    ))
    .map((quote) => quote.id);
  const originalIds = candidates.originals
    .filter((original) => (
      original.workflow_status !== 'approved'
      || original.visibility !== 'public'
      || !original.reviewer_id
      || !original.reviewed_at
    ))
    .map((original) => original.id);
  return {
    quote_ids: quoteIds,
    original_ids: originalIds,
    quote_count: quoteIds.length,
    original_count: originalIds.length,
  };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    process.stdout.write('Uso: node scripts/approve-directus-current-catalog.mjs [--apply --confirm-public-sha=<sha256>]\n');
    process.stdout.write('Sin --apply solo muestra el plan. Nunca modifica el JSON público.\n');
    return;
  }

  const baseUrl = ensureLocalUrl(process.env.DIRECTUS_URL || DEFAULT_DIRECTUS_URL);
  const email = process.env.DIRECTUS_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const passwordFile = process.env.DIRECTUS_ADMIN_PASSWORD_FILE || DEFAULT_PASSWORD_FILE;
  const password = (await readFile(passwordFile, 'utf8')).trim();
  const currentPublicText = await readFile(publicQuotesPath, 'utf8');
  const currentPublicDocument = JSON.parse(currentPublicText);
  const currentPublicSha = sha256(currentPublicText);
  validatePublicDocument(currentPublicDocument);

  if (options.apply && options.confirmPublicSha !== currentPublicSha) {
    throw new Error(`El hash confirmado no coincide con el JSON público (${currentPublicSha})`);
  }

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

  async function readEditorialData() {
    const [quotes, originals, sources, quoteSources, originalSources] = await Promise.all([
      request('/items/quotes?limit=-1&sort=legacy_index&fields=id,legacy_index,text,highlight,language,quote_type,author_id,work_id,speaker_display_name,legacy_attribution,legacy_work,text_hash,publication_excluded,workflow_status,visibility,verification_status,reviewer_id,reviewed_at,publish_at'),
      request('/items/quote_originals?limit=-1&fields=id,import_key,quote_id,original_text,language,label,is_primary,workflow_status,visibility,verification_status,reviewer_id,reviewed_at'),
      request('/items/sources?limit=-1&fields=id,rights_status,verification_status'),
      request('/items/quote_sources?limit=-1&fields=quote_id,source_id,relation_role'),
      request('/items/quote_original_sources?limit=-1&fields=quote_original_id,source_id,relation_role'),
    ]);
    return { quotes, originals, sources, quoteSources, originalSources };
  }

  function validateExactSnapshot(data) {
    validateEditorialRelations(data);
    const generated = buildPublicDocument({
      quotes: data.quotes,
      originals: data.originals,
      generatedAt: currentPublicDocument.generated_at,
    });
    const comparison = comparisonReport(generated, currentPublicDocument);
    const generatedText = `${JSON.stringify(generated, null, 2)}\n`;
    if (!comparison.exact || generatedText !== currentPublicText) {
      throw new Error('Directus ya no coincide byte por byte con el JSON público; se cancela la aprobación');
    }
  }

  try {
    const login = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, mode: 'json' }),
    });
    accessToken = login.access_token;
    refreshToken = login.refresh_token;
    const [currentUser, publicResponse, beforeData] = await Promise.all([
      request('/users/me?fields=id,email'),
      fetch(`${baseUrl}/items/quotes?limit=1`),
      readEditorialData(),
    ]);

    if (publicResponse.status !== 403) {
      throw new Error(`La API pública de frases debería responder 403, no ${publicResponse.status}`);
    }
    validateExactSnapshot(beforeData);
    const before = summarizeReadiness(beforeData);
    const plan = buildApprovalPlan(beforeData);
    let after = before;

    if (options.apply) {
      const reviewedAt = new Date().toISOString();
      if (plan.quote_ids.length) {
        await request('/items/quotes?fields=id', {
          method: 'PATCH',
          body: JSON.stringify({
            keys: plan.quote_ids,
            data: {
              workflow_status: 'approved',
              visibility: 'public',
              reviewer_id: currentUser.id,
              reviewed_at: reviewedAt,
            },
          }),
        });
      }
      if (plan.original_ids.length) {
        await request('/items/quote_originals?fields=id', {
          method: 'PATCH',
          body: JSON.stringify({
            keys: plan.original_ids,
            data: {
              workflow_status: 'approved',
              visibility: 'public',
              reviewer_id: currentUser.id,
              reviewed_at: reviewedAt,
            },
          }),
        });
      }

      const afterData = await readEditorialData();
      validateExactSnapshot(afterData);
      after = summarizeReadiness(afterData);
      if (!after.ready) {
        throw new Error(`La aprobación terminó con ${after.issue_count} bloqueos pendientes`);
      }
    }

    process.stdout.write(`${JSON.stringify({
      mode: options.apply ? 'apply' : 'dry-run',
      writes_public_files: false,
      public_api_http: publicResponse.status,
      public_sha256: currentPublicSha,
      reviewer: currentUser.email,
      exact_public_snapshot: true,
      sources_and_rights_validated: true,
      before,
      plan: {
        quotes_to_approve: plan.quote_count,
        originals_to_approve: plan.original_count,
      },
      after,
    }, null, 2)}\n`);
  } finally {
    if (accessToken && refreshToken) {
      try {
        await request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch {
        // El token expira aunque el cierre de sesión falle; no se oculta el error principal.
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
  buildApprovalPlan,
  parseArguments,
  publicationCandidates,
  readinessIssues,
  summarizeReadiness,
};
