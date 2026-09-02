#!/usr/bin/env node

import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_DIRECTUS_URL = 'http://127.0.0.1:8055';
const DEFAULT_ADMIN_EMAIL = 'paramorliterario@gmail.com';
const DEFAULT_PASSWORD_FILE = '/etc/paramoliterario/directus/admin_initial_password';
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const publicProfilesPath = path.join(projectRoot, 'public', 'data', 'literary-profiles.json');
const defaultOutputPath = '/tmp/paramo-directus-literary-profiles-preview.json';

const authorFields = [
  'author_id', 'display_name', 'birth_year', 'death_year', 'country', 'language',
  'period', 'movement', 'bio_short', 'bio_long', 'themes', 'tone_notes',
  'why_in_paramo', 'information_sources', 'portrait',
];
const workFields = [
  'work_id', 'title', 'display_title', 'original_title', 'author_id',
  'publication_year', 'genre', 'language', 'summary_short', 'summary_long',
  'context_notes', 'themes', 'tone_notes', 'fragment_notes', 'why_in_paramo',
  'information_sources', 'fragment_count',
];

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function nullable(value) {
  return value === undefined ? null : value;
}

function publicSources(value) {
  return Array.isArray(value) && value.length ? value : null;
}

function isPublicProfile(record) {
  return record.workflow_status === 'approved'
    && record.visibility === 'public'
    && record.verification_status !== 'rejected';
}

function isPublicQuote(record) {
  return record.workflow_status === 'approved'
    && record.visibility === 'public'
    && record.verification_status === 'verified'
    && record.publication_excluded === false;
}

function themeLabelsByOwner(relations, ownerField, themes) {
  const labelById = new Map(themes.map((theme) => [theme.id, theme.label]));
  const grouped = new Map();
  for (const relation of [...relations].sort((left, right) => (
    (left.sort ?? Number.MAX_SAFE_INTEGER) - (right.sort ?? Number.MAX_SAFE_INTEGER)
  ))) {
    const label = labelById.get(relation.theme_id);
    if (!label) throw new Error(`Relación con tema inexistente: ${relation.theme_id}`);
    const labels = grouped.get(relation[ownerField]) || [];
    labels.push(label);
    grouped.set(relation[ownerField], labels);
  }
  return grouped;
}

export function buildPublicProfilesDocument({
  authors,
  works,
  themes,
  authorThemes,
  workThemes,
  quotes,
}) {
  const authorThemeLabels = themeLabelsByOwner(authorThemes, 'author_id', themes);
  const workThemeLabels = themeLabelsByOwner(workThemes, 'work_id', themes);
  const fragmentCounts = new Map();
  for (const quote of quotes.filter(isPublicQuote)) {
    fragmentCounts.set(quote.work_id, (fragmentCounts.get(quote.work_id) || 0) + 1);
  }
  const bySort = (left, right) => (
    (left.sort ?? Number.MAX_SAFE_INTEGER) - (right.sort ?? Number.MAX_SAFE_INTEGER)
      || left.id.localeCompare(right.id, 'en')
  );

  return {
    authors: authors.filter(isPublicProfile).sort(bySort).map((author) => ({
      author_id: author.id,
      display_name: nullable(author.display_name),
      birth_year: nullable(author.birth_year),
      death_year: nullable(author.death_year),
      country: nullable(author.country),
      language: nullable(author.language),
      period: nullable(author.period),
      movement: nullable(author.movement),
      bio_short: nullable(author.short_biography),
      bio_long: nullable(author.public_biography_long),
      themes: authorThemeLabels.get(author.id) || [],
      tone_notes: nullable(author.public_tone_notes),
      why_in_paramo: nullable(author.public_why_in_paramo),
      information_sources: publicSources(author.public_information_sources),
      portrait: author.portrait_path ? {
        path: author.portrait_path,
        alt: nullable(author.portrait_alt),
        caption: nullable(author.portrait_caption),
        credit: nullable(author.portrait_credit),
        source_url: nullable(author.portrait_source_url),
        rights: nullable(author.portrait_rights),
        object_position: nullable(author.portrait_object_position),
      } : null,
    })),
    works: works.filter(isPublicProfile).sort(bySort).map((work) => ({
      work_id: work.id,
      title: nullable(work.public_title ?? work.display_title),
      display_title: nullable(work.display_title),
      original_title: nullable(work.original_title),
      author_id: nullable(work.primary_author_id),
      publication_year: nullable(work.publication_year),
      genre: nullable(work.genre),
      language: nullable(work.public_language),
      summary_short: nullable(work.short_summary),
      summary_long: nullable(work.public_summary_long),
      context_notes: nullable(work.context),
      themes: workThemeLabels.get(work.id) || [],
      tone_notes: nullable(work.tone),
      fragment_notes: nullable(work.public_fragment_notes),
      why_in_paramo: nullable(work.public_why_in_paramo),
      information_sources: publicSources(work.public_information_sources),
      fragment_count: fragmentCounts.get(work.id) || 0,
    })),
  };
}

export function validatePublicProfilesDocument(document) {
  if (!document || !Array.isArray(document.authors) || !Array.isArray(document.works)) {
    throw new Error('El documento público debe contener authors y works');
  }
  for (const [collection, records, fields, idField, prefix] of [
    ['authors', document.authors, authorFields, 'author_id', 'author-'],
    ['works', document.works, workFields, 'work_id', 'work-'],
  ]) {
    const ids = new Set();
    for (const [position, record] of records.entries()) {
      const label = `${collection}[${position}]`;
      const keys = Object.keys(record);
      const missing = fields.filter((field) => !keys.includes(field));
      const unexpected = keys.filter((field) => !fields.includes(field));
      if (missing.length || unexpected.length) {
        throw new Error(`${label}: contrato inválido; faltan ${missing.join(', ')}, sobran ${unexpected.join(', ')}`);
      }
      if (typeof record[idField] !== 'string' || !record[idField].startsWith(prefix)) {
        throw new Error(`${label}.${idField} no es válido`);
      }
      if (ids.has(record[idField])) throw new Error(`${label}: ID duplicado`);
      ids.add(record[idField]);
      if (!Array.isArray(record.themes)) throw new Error(`${label}.themes debe ser un array`);
      if (collection === 'works' && (!Number.isInteger(record.fragment_count) || record.fragment_count < 0)) {
        throw new Error(`${label}.fragment_count no es válido`);
      }
    }
  }
}

export function comparisonReport(candidate, current) {
  const compareCollection = (name, idField) => {
    const before = new Map((current[name] || []).map((record) => [record[idField], record]));
    const after = new Map((candidate[name] || []).map((record) => [record[idField], record]));
    return {
      missing: [...before.keys()].filter((id) => !after.has(id)).sort(),
      added: [...after.keys()].filter((id) => !before.has(id)).sort(),
      changed: [...after.keys()].filter((id) => (
        before.has(id) && JSON.stringify(after.get(id)) !== JSON.stringify(before.get(id))
      )).sort(),
    };
  };
  const authors = compareCollection('authors', 'author_id');
  const works = compareCollection('works', 'work_id');
  return {
    exact: [...Object.values(authors), ...Object.values(works)].every((items) => items.length === 0),
    authors,
    works,
  };
}

export function ensurePreviewOutputPath(rawPath) {
  const resolved = path.resolve(rawPath);
  const temporaryRoot = path.resolve(os.tmpdir());
  if (resolved !== temporaryRoot && !resolved.startsWith(`${temporaryRoot}${path.sep}`)) {
    throw new Error(`La vista previa solo puede escribirse dentro de ${temporaryRoot}`);
  }
  return resolved;
}

async function writeAtomically(outputPath, text) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  const temporaryPath = `${outputPath}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, text, { encoding: 'utf8', mode: 0o600 });
  await rename(temporaryPath, outputPath);
}

function ensureLocalUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (!new Set(['127.0.0.1', 'localhost', '[::1]']).has(url.hostname)) {
    throw new Error(`Se rechaza DIRECTUS_URL no local: ${url.hostname}`);
  }
  return url.toString().replace(/\/$/u, '');
}

function parseArguments(argv) {
  let outputPath = defaultOutputPath;
  for (const argument of argv) {
    if (argument === '--help') return { help: true, outputPath };
    if (argument.startsWith('--output=')) outputPath = argument.slice('--output='.length);
    else throw new Error(`Argumento no reconocido: ${argument}`);
  }
  return { help: false, outputPath: ensurePreviewOutputPath(outputPath) };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    process.stdout.write('Uso: node scripts/export-directus-profiles-preview.mjs [--output=/tmp/archivo.json]\n');
    return;
  }
  const baseUrl = ensureLocalUrl(process.env.DIRECTUS_URL || DEFAULT_DIRECTUS_URL);
  const password = (await readFile(
    process.env.DIRECTUS_ADMIN_PASSWORD_FILE || DEFAULT_PASSWORD_FILE,
    'utf8',
  )).trim();
  const email = process.env.DIRECTUS_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  let accessToken;
  let refreshToken;
  async function request(apiPath, options = {}) {
    const response = await fetch(`${baseUrl}${apiPath}`, {
      ...options,
      headers: {
        'content-type': 'application/json',
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
    });
    const raw = response.status === 204 ? '' : await response.text();
    const payload = raw ? JSON.parse(raw) : null;
    if (!response.ok) {
      const reason = payload?.errors?.map((error) => error.message).join('; ') || response.statusText;
      throw new Error(`${options.method || 'GET'} ${apiPath}: ${response.status} ${reason}`);
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
    const [authors, works, themes, authorThemes, workThemes, quotes, publicResponse] = await Promise.all([
      request('/items/authors?limit=-1&fields=id,display_name,birth_year,death_year,country,language,period,movement,short_biography,public_biography_long,public_tone_notes,public_why_in_paramo,public_information_sources,portrait_path,portrait_alt,portrait_caption,portrait_credit,portrait_source_url,portrait_rights,portrait_object_position,workflow_status,visibility,verification_status,sort'),
      request('/items/works?limit=-1&fields=id,public_title,display_title,original_title,primary_author_id,publication_year,genre,public_language,short_summary,public_summary_long,context,tone,public_fragment_notes,public_why_in_paramo,public_information_sources,workflow_status,visibility,verification_status,sort'),
      request('/items/themes?limit=-1&fields=id,label'),
      request('/items/author_themes?limit=-1&fields=author_id,theme_id,sort'),
      request('/items/work_themes?limit=-1&fields=work_id,theme_id,sort'),
      request('/items/quotes?limit=-1&fields=work_id,workflow_status,visibility,verification_status,publication_excluded'),
      fetch(`${baseUrl}/items/authors?limit=1`),
    ]);
    if (publicResponse.status !== 403) {
      throw new Error(`La API pública de autores debería responder 403, no ${publicResponse.status}`);
    }
    const currentText = await readFile(publicProfilesPath, 'utf8');
    const currentDocument = JSON.parse(currentText);
    const previewDocument = buildPublicProfilesDocument({
      authors, works, themes, authorThemes, workThemes, quotes,
    });
    validatePublicProfilesDocument(previewDocument);
    const previewText = `${JSON.stringify(previewDocument, null, 2)}\n`;
    const comparison = comparisonReport(previewDocument, currentDocument);
    await writeAtomically(options.outputPath, previewText);
    process.stdout.write(`${JSON.stringify({
      output: options.outputPath,
      writes_public_files: false,
      public_api_http: publicResponse.status,
      authors_read: authors.length,
      works_read: works.length,
      themes_read: themes.length,
      author_themes_read: authorThemes.length,
      work_themes_read: workThemes.length,
      public_authors: previewDocument.authors.length,
      public_works: previewDocument.works.length,
      comparison,
      byte_exact: previewText === currentText,
      preview_sha256: sha256(previewText),
      public_sha256: sha256(currentText),
    }, null, 2)}\n`);
    if (!comparison.exact || previewText !== currentText) process.exitCode = 1;
  } finally {
    if (refreshToken) {
      try {
        await request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch {
        // La validación ya terminó; el token expira aunque falle el cierre explícito.
      }
    }
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exitCode = 1;
  });
}
