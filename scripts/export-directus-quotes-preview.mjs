#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_DIRECTUS_URL = 'http://127.0.0.1:8055';
const DEFAULT_ADMIN_EMAIL = 'paramorliterario@gmail.com';
const DEFAULT_PASSWORD_FILE = '/etc/paramoliterario/directus/admin_initial_password';
const DEFAULT_OUTPUT_PATH = '/tmp/paramo-directus-quotes-preview.json';
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const publicQuotesPath = path.join(projectRoot, 'public', 'data', 'quotes.json');

const publicQuoteFields = new Set([
  'id', 'legacy_index', 't', 'a', 'obra', 'highlight', 'lang', 'type',
  'authorId', 'workId', 'original',
]);

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

function ensurePreviewOutputPath(rawPath) {
  const resolved = path.resolve(rawPath);
  if (resolved === '/tmp' || !resolved.startsWith('/tmp/')) {
    throw new Error(`La vista previa solo puede escribirse dentro de /tmp: ${resolved}`);
  }
  return resolved;
}

function parseArguments(argv) {
  const allowedArguments = new Set(['--help']);
  let outputPath = DEFAULT_OUTPUT_PATH;

  for (const argument of argv) {
    if (argument.startsWith('--output=')) {
      outputPath = argument.slice('--output='.length);
    } else if (!allowedArguments.has(argument)) {
      throw new Error(`Argumento no reconocido: ${argument}`);
    }
  }

  return { help: argv.includes('--help'), outputPath: ensurePreviewOutputPath(outputPath) };
}

function countBy(records, field) {
  return Object.fromEntries(
    [...new Set(records.map((record) => record[field]))]
      .sort((left, right) => String(left).localeCompare(String(right), 'en'))
      .map((value) => [value, records.filter((record) => record[field] === value).length]),
  );
}

function uniqueIndex(records, field, label) {
  const index = new Map();
  for (const [position, record] of records.entries()) {
    const value = record?.[field];
    if (value === null || value === undefined || value === '') {
      throw new Error(`${label}[${position}].${field} está vacío`);
    }
    if (index.has(value)) throw new Error(`${label}: ${field} duplicado (${value})`);
    index.set(value, record);
  }
  return index;
}

function validatePublicDocument(document) {
  if (document?.schema_version !== 1 || !Array.isArray(document?.quotes)) {
    throw new Error('La vista previa no cumple el contrato público de schema_version 1');
  }
  if (document.quote_count !== document.quotes.length) {
    throw new Error('quote_count no coincide con quotes.length');
  }

  const ids = new Set();
  const indexes = new Set();
  for (const [position, quote] of document.quotes.entries()) {
    const unexpected = Object.keys(quote).filter((field) => !publicQuoteFields.has(field));
    if (unexpected.length) {
      throw new Error(`quotes[${position}] contiene campos privados: ${unexpected.join(', ')}`);
    }
    for (const field of ['id', 't', 'a', 'obra', 'lang', 'type', 'authorId', 'workId']) {
      if (typeof quote[field] !== 'string' || !quote[field].length) {
        throw new Error(`quotes[${position}].${field} está vacío`);
      }
    }
    if (!Number.isInteger(quote.legacy_index) || quote.legacy_index < 0) {
      throw new Error(`quotes[${position}].legacy_index no es válido`);
    }
    if (!(quote.highlight === null || (
      typeof quote.highlight === 'string' && quote.highlight.length
    ))) {
      throw new Error(`quotes[${position}].highlight no es válido`);
    }
    if (quote.original !== undefined) {
      const originalFields = Object.keys(quote.original);
      if (originalFields.length !== 3
        || !['text', 'lang', 'label'].every((field) => originalFields.includes(field))) {
        throw new Error(`quotes[${position}].original contiene campos privados`);
      }
      for (const field of ['text', 'lang', 'label']) {
        if (typeof quote.original[field] !== 'string' || !quote.original[field].trim()) {
          throw new Error(`quotes[${position}].original.${field} está vacío`);
        }
      }
    }
    if (ids.has(quote.id)) throw new Error(`ID público duplicado: ${quote.id}`);
    if (indexes.has(quote.legacy_index)) {
      throw new Error(`legacy_index público duplicado: ${quote.legacy_index}`);
    }
    ids.add(quote.id);
    indexes.add(quote.legacy_index);
  }
}

function validateEditorialRelations({
  quotes,
  originals,
  sources,
  quoteSources,
  originalSources,
}) {
  const quoteIds = new Set(quotes.map((quote) => quote.id));
  const originalIds = new Set(originals.map((original) => original.id));
  const sourcesById = uniqueIndex(sources, 'id', 'sources');
  const quoteRelations = new Map();
  const originalRelations = new Map();

  for (const relation of quoteSources) {
    if (relation.relation_role !== 'textual_source') continue;
    const relations = quoteRelations.get(relation.quote_id) || [];
    relations.push(relation);
    quoteRelations.set(relation.quote_id, relations);
  }
  for (const relation of originalSources) {
    if (relation.relation_role !== 'original_source') continue;
    const relations = originalRelations.get(relation.quote_original_id) || [];
    relations.push(relation);
    originalRelations.set(relation.quote_original_id, relations);
  }

  for (const quoteId of quoteIds) {
    const relations = quoteRelations.get(quoteId) || [];
    if (relations.length !== 1) {
      throw new Error(`${quoteId}: se esperaba una fuente textual y hay ${relations.length}`);
    }
    const source = sourcesById.get(relations[0].source_id);
    if (!source || source.verification_status !== 'verified' || source.rights_status !== 'cleared') {
      throw new Error(`${quoteId}: la fuente no está verificada y despejada`);
    }
  }
  for (const originalId of originalIds) {
    const relations = originalRelations.get(originalId) || [];
    if (relations.length !== 1) {
      throw new Error(`${originalId}: se esperaba una fuente original y hay ${relations.length}`);
    }
    const source = sourcesById.get(relations[0].source_id);
    if (!source || source.verification_status !== 'verified' || source.rights_status !== 'cleared') {
      throw new Error(`${originalId}: la fuente no está verificada y despejada`);
    }
  }
}

function buildPublicDocument({ quotes, originals, generatedAt }) {
  const originalsByQuote = new Map();
  for (const original of originals) {
    if (!original.is_primary || original.workflow_status === 'archived') continue;
    if (originalsByQuote.has(original.quote_id)) {
      throw new Error(`Hay más de un original primario para ${original.quote_id}`);
    }
    if (original.verification_status !== 'verified') {
      throw new Error(`${original.import_key}: el original no está verificado`);
    }
    originalsByQuote.set(original.quote_id, {
      text: original.original_text.trim(),
      lang: original.language.trim(),
      label: original.label.trim(),
    });
  }

  const publicQuotes = quotes
    .filter((quote) => quote.workflow_status !== 'archived' && !quote.publication_excluded)
    .sort((left, right) => left.legacy_index - right.legacy_index)
    .map((quote) => {
      if (sha256(quote.text) !== quote.text_hash) {
        throw new Error(`${quote.id}: text_hash no coincide con el texto`);
      }
      if (quote.verification_status !== 'verified') {
        throw new Error(`${quote.id}: la frase no está verificada`);
      }
      const result = {
        id: quote.id,
        legacy_index: quote.legacy_index,
        t: quote.text,
        a: quote.speaker_display_name || quote.legacy_attribution,
        obra: quote.legacy_work,
        highlight: quote.highlight,
        lang: quote.language,
        type: quote.quote_type,
        authorId: quote.author_id,
        workId: quote.work_id,
      };
      const original = originalsByQuote.get(quote.id);
      if (original) result.original = original;
      return result;
    });

  const document = {
    schema_version: 1,
    generated_at: generatedAt,
    quote_count: publicQuotes.length,
    quotes: publicQuotes,
  };
  validatePublicDocument(document);
  return document;
}

function comparisonReport(previewDocument, publicDocument) {
  const previewById = new Map(previewDocument.quotes.map((quote) => [quote.id, quote]));
  const publicById = new Map(publicDocument.quotes.map((quote) => [quote.id, quote]));
  const missingFromPreview = [...publicById.keys()].filter((id) => !previewById.has(id));
  const newInPreview = [...previewById.keys()].filter((id) => !publicById.has(id));
  const changed = [...previewById.keys()].filter((id) => (
    publicById.has(id)
    && JSON.stringify(previewById.get(id)) !== JSON.stringify(publicById.get(id))
  ));
  return {
    exact: missingFromPreview.length === 0 && newInPreview.length === 0 && changed.length === 0,
    missing_from_preview: missingFromPreview,
    new_in_preview: newInPreview,
    changed,
  };
}

async function main() {
  const { help, outputPath } = parseArguments(process.argv.slice(2));
  if (help) {
    process.stdout.write('Uso: node scripts/export-directus-quotes-preview.mjs [--output=/tmp/archivo.json]\n');
    process.stdout.write('Solo escribe dentro de /tmp y nunca modifica public/data/quotes.json.\n');
    return;
  }

  const baseUrl = ensureLocalUrl(process.env.DIRECTUS_URL || DEFAULT_DIRECTUS_URL);
  const email = process.env.DIRECTUS_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const passwordFile = process.env.DIRECTUS_ADMIN_PASSWORD_FILE || DEFAULT_PASSWORD_FILE;
  const password = (await readFile(passwordFile, 'utf8')).trim();
  let accessToken;

  async function request(apiPath, options = {}) {
    const response = await fetch(`${baseUrl}${apiPath}`, {
      ...options,
      headers: {
        'content-type': 'application/json',
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
    });
    const payload = response.status === 204 ? null : await response.json();
    if (!response.ok) {
      const reason = payload?.errors?.map((error) => error.message).join('; ')
        || response.statusText;
      throw new Error(`${options.method || 'GET'} ${apiPath}: ${response.status} ${reason}`);
    }
    return payload?.data ?? payload;
  }

  const login = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, mode: 'json' }),
  });
  accessToken = login.access_token;

  const [quotes, originals, sources, quoteSources, originalSources, publicResponse] = await Promise.all([
    request('/items/quotes?limit=-1&sort=legacy_index&fields=id,legacy_index,text,highlight,language,quote_type,author_id,work_id,speaker_display_name,legacy_attribution,legacy_work,text_hash,publication_excluded,workflow_status,visibility,verification_status'),
    request('/items/quote_originals?limit=-1&fields=id,import_key,quote_id,original_text,language,label,is_primary,workflow_status,visibility,verification_status'),
    request('/items/sources?limit=-1&fields=id,rights_status,verification_status'),
    request('/items/quote_sources?limit=-1&fields=quote_id,source_id,relation_role'),
    request('/items/quote_original_sources?limit=-1&fields=quote_original_id,source_id,relation_role'),
    fetch(`${baseUrl}/items/quotes?limit=1`),
  ]);

  if (publicResponse.status !== 403) {
    throw new Error(`La API pública de frases debería responder 403, no ${publicResponse.status}`);
  }
  validateEditorialRelations({ quotes, originals, sources, quoteSources, originalSources });

  const currentPublicText = await readFile(publicQuotesPath, 'utf8');
  const currentPublicDocument = JSON.parse(currentPublicText);
  validatePublicDocument(currentPublicDocument);
  const provisional = buildPublicDocument({
    quotes,
    originals,
    generatedAt: currentPublicDocument.generated_at,
  });
  const comparison = comparisonReport(provisional, currentPublicDocument);
  const generatedAt = comparison.exact
    ? currentPublicDocument.generated_at
    : new Date().toISOString();
  const previewDocument = buildPublicDocument({ quotes, originals, generatedAt });
  const previewText = `${JSON.stringify(previewDocument, null, 2)}\n`;

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, previewText, 'utf8');

  await request('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: login.refresh_token }),
  });
  accessToken = undefined;

  const finalComparison = comparisonReport(previewDocument, currentPublicDocument);
  const byteExact = previewText === currentPublicText;
  const report = {
    output: outputPath,
    writes_public_files: false,
    public_api_http: publicResponse.status,
    quotes_read: quotes.length,
    originals_read: originals.length,
    sources_read: sources.length,
    quote_sources_read: quoteSources.length,
    original_sources_read: originalSources.length,
    quote_workflow: countBy(quotes, 'workflow_status'),
    quote_visibility: countBy(quotes, 'visibility'),
    original_workflow: countBy(originals, 'workflow_status'),
    comparison: finalComparison,
    byte_exact: byteExact,
    preview_sha256: sha256(previewText),
    public_sha256: sha256(currentPublicText),
  };
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

  if (!finalComparison.exact || !byteExact) {
    throw new Error('La vista previa generada desde Directus difiere del JSON público actual');
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
  buildPublicDocument,
  comparisonReport,
  ensurePreviewOutputPath,
  validateEditorialRelations,
  validatePublicDocument,
};
