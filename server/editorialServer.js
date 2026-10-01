import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(moduleDirectory, '..');
const editorialRoot = path.join(projectRoot, 'editorial');

const WORKFLOW_STATUSES = new Set(['draft', 'in_review', 'approved', 'archived']);
const VERIFICATION_STATUSES = new Set(['pending', 'partially_verified', 'verified', 'rejected']);
const VISIBILITIES = new Set(['hidden', 'public', 'scheduled']);
const RIGHTS_STATUSES = new Set(['pending', 'cleared', 'restricted', 'unknown']);

export const collectionDefinitions = Object.freeze({
  quotes: {
    label: 'Fragmentos',
    fields: [
      'id', 'legacy_index', 'text', 'highlight', 'language', 'quote_type', 'author_id',
      'work_id', 'speaker_display_name', 'attribution_type', 'publication_excluded',
      'workflow_status', 'visibility', 'verification_status', 'reviewed_at', 'date_updated',
    ],
    patchFields: new Set([
      'text', 'highlight', 'language', 'quote_type', 'author_id', 'work_id',
      'speaker_display_name', 'attribution_type', 'publication_excluded',
      'workflow_status', 'visibility', 'verification_status', 'publish_at',
    ]),
    sort: 'legacy_index',
    filters: new Set(['workflow_status', 'verification_status', 'visibility']),
  },
  quote_originals: {
    label: 'Originales',
    fields: [
      'id', 'quote_id', 'original_text', 'language', 'label', 'source_note', 'is_primary',
      'workflow_status', 'visibility', 'verification_status', 'reviewed_at', 'date_updated',
    ],
    patchFields: new Set([
      'original_text', 'language', 'label', 'source_note', 'is_primary',
      'workflow_status', 'visibility', 'verification_status',
    ]),
    sort: 'quote_id',
    filters: new Set(['workflow_status', 'verification_status', 'visibility', 'quote_id']),
  },
  authors: {
    label: 'Autores',
    fields: [
      'id', 'display_name', 'canonical_name', 'birth_year', 'death_year', 'country',
      'language', 'period', 'movement', 'short_biography', 'public_biography_long',
      'public_tone_notes', 'public_why_in_paramo', 'public_information_sources',
      'portrait_path', 'portrait_alt', 'portrait_caption', 'portrait_credit',
      'portrait_source_url', 'portrait_rights', 'portrait_object_position',
      'workflow_status', 'visibility', 'verification_status', 'publish_at', 'date_updated',
    ],
    patchFields: new Set([
      'display_name', 'canonical_name', 'birth_year', 'death_year', 'country', 'language',
      'period', 'movement', 'short_biography', 'public_biography_long', 'public_tone_notes',
      'public_why_in_paramo', 'public_information_sources', 'portrait_path', 'portrait_alt',
      'portrait_caption', 'portrait_credit', 'portrait_source_url', 'portrait_rights',
      'portrait_object_position', 'workflow_status', 'visibility', 'verification_status',
      'publish_at',
    ]),
    sort: 'display_name',
    filters: new Set(['workflow_status', 'verification_status', 'visibility']),
  },
  works: {
    label: 'Obras',
    fields: [
      'id', 'display_title', 'public_title', 'original_title', 'primary_author_id',
      'publication_year', 'genre', 'public_language', 'short_summary', 'public_summary_long',
      'context', 'tone', 'public_fragment_notes', 'public_why_in_paramo',
      'public_information_sources', 'workflow_status', 'visibility', 'verification_status',
      'publish_at', 'date_updated',
    ],
    patchFields: new Set([
      'display_title', 'public_title', 'original_title', 'primary_author_id',
      'publication_year', 'genre', 'public_language', 'short_summary', 'public_summary_long',
      'context', 'tone', 'public_fragment_notes', 'public_why_in_paramo',
      'public_information_sources', 'workflow_status', 'visibility',
      'verification_status', 'publish_at',
    ]),
    sort: 'display_title',
    filters: new Set(['workflow_status', 'verification_status', 'visibility']),
  },
  sources: {
    label: 'Fuentes',
    fields: [
      'id', 'source_type', 'citation_label', 'creator', 'institution', 'title', 'edition',
      'publisher', 'publication_year', 'pages', 'translator_name', 'source_url',
      'bibliographic_identifiers', 'accessed_at', 'language', 'rights_status',
      'rights_notes', 'verification_status', 'notes', 'date_updated',
    ],
    patchFields: new Set([
      'source_type', 'citation_label', 'creator', 'institution', 'title', 'edition',
      'publisher', 'publication_year', 'pages', 'translator_name', 'source_url',
      'bibliographic_identifiers', 'accessed_at', 'language', 'rights_status',
      'rights_notes', 'verification_status', 'notes',
    ]),
    sort: 'citation_label',
    filters: new Set(['verification_status', 'rights_status']),
  },
  publication_runs: {
    label: 'Publicaciones',
    fields: [
      'id', 'environment', 'status', 'schema_version', 'entity_counts', 'artifact_hashes',
      'warnings', 'errors', 'git_commit', 'notes', 'started_at', 'finished_at',
    ],
    patchFields: new Set(),
    sort: '-started_at',
    filters: new Set(['environment', 'status']),
  },
});

const enumFields = new Map([
  ['workflow_status', WORKFLOW_STATUSES],
  ['verification_status', VERIFICATION_STATUSES],
  ['visibility', VISIBILITIES],
  ['rights_status', RIGHTS_STATUSES],
]);

const integerFields = new Set(['birth_year', 'death_year', 'publication_year']);
const booleanFields = new Set(['publication_excluded', 'is_primary']);
const jsonFields = new Set([
  'public_information_sources', 'bibliographic_identifiers', 'entity_counts',
  'artifact_hashes', 'warnings', 'errors',
]);
const nullableFields = new Set([
  'highlight', 'author_id', 'speaker_display_name', 'publish_at', 'birth_year', 'death_year',
  'publication_year', 'public_title', 'original_title', 'primary_author_id', 'source_note',
  'creator', 'institution', 'title', 'edition', 'publisher', 'pages', 'translator_name',
  'source_url', 'accessed_at', 'language', 'rights_notes', 'notes',
]);

const materialFieldsByCollection = Object.freeze({
  quotes: new Set([
    'text', 'highlight', 'language', 'quote_type', 'author_id', 'work_id',
    'speaker_display_name', 'attribution_type',
  ]),
  quote_originals: new Set(['original_text', 'language', 'label', 'is_primary']),
  authors: new Set([
    'display_name', 'canonical_name', 'birth_year', 'death_year', 'country', 'language',
    'period', 'movement', 'short_biography', 'public_biography_long', 'public_tone_notes',
    'public_why_in_paramo', 'public_information_sources', 'portrait_path', 'portrait_alt',
    'portrait_caption', 'portrait_credit', 'portrait_source_url', 'portrait_rights',
    'portrait_object_position',
  ]),
  works: new Set([
    'display_title', 'public_title', 'original_title', 'primary_author_id',
    'publication_year', 'genre', 'public_language', 'short_summary', 'public_summary_long',
    'context', 'tone', 'public_fragment_notes', 'public_why_in_paramo',
    'public_information_sources',
  ]),
  sources: new Set([
    'source_type', 'citation_label', 'creator', 'institution', 'title', 'edition',
    'publisher', 'publication_year', 'pages', 'translator_name', 'source_url',
    'bibliographic_identifiers', 'accessed_at', 'language', 'rights_notes', 'notes',
  ]),
});

function json(response, statusCode, payload, extraHeaders = {}) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders,
  });
  response.end(`${JSON.stringify(payload)}\n`);
}

function apiError(response, statusCode, code, message) {
  json(response, statusCode, { error: code, message });
}

export function ensureLoopbackDirectusUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (!new Set(['127.0.0.1', 'localhost', '[::1]']).has(url.hostname)) {
    throw new Error(`Se rechaza DIRECTUS_URL no local: ${url.hostname}`);
  }
  return url.toString().replace(/\/$/u, '');
}

export function parseCookies(rawCookie = '') {
  return Object.fromEntries(rawCookie.split(';').flatMap((part) => {
    const separator = part.indexOf('=');
    if (separator < 0) return [];
    const name = part.slice(0, separator).trim();
    if (!name) return [];
    const rawValue = part.slice(separator + 1).trim();
    try {
      return [[name, decodeURIComponent(rawValue)]];
    } catch {
      return [[name, rawValue]];
    }
  }));
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function normalizePatch(collection, changes, currentUserId = null) {
  const definition = collectionDefinitions[collection];
  if (!definition || !changes || Array.isArray(changes) || typeof changes !== 'object') {
    throw new TypeError('Cambios editoriales no válidos');
  }

  const normalized = {};
  for (const [field, rawValue] of Object.entries(changes)) {
    if (!definition.patchFields.has(field)) {
      throw new TypeError(`El campo ${field} no puede editarse desde este panel`);
    }

    if (rawValue === null) {
      if (!nullableFields.has(field)) throw new TypeError(`${field} no admite un valor vacío`);
      normalized[field] = null;
      continue;
    }

    if (enumFields.has(field)) {
      if (!enumFields.get(field).has(rawValue)) throw new TypeError(`Valor no válido para ${field}`);
      normalized[field] = rawValue;
      continue;
    }

    if (integerFields.has(field)) {
      if (!Number.isInteger(rawValue) || rawValue < -4000 || rawValue > 3000) {
        throw new TypeError(`Valor no válido para ${field}`);
      }
      normalized[field] = rawValue;
      continue;
    }

    if (booleanFields.has(field)) {
      if (typeof rawValue !== 'boolean') throw new TypeError(`Valor no válido para ${field}`);
      normalized[field] = rawValue;
      continue;
    }

    if (jsonFields.has(field)) {
      if (field === 'public_information_sources' && !Array.isArray(rawValue)) {
        throw new TypeError(`${field} debe ser una lista`);
      }
      if (typeof rawValue !== 'object') throw new TypeError(`Valor no válido para ${field}`);
      normalized[field] = rawValue;
      continue;
    }

    if (typeof rawValue !== 'string' || rawValue.length > 150_000) {
      throw new TypeError(`Valor no válido para ${field}`);
    }
    normalized[field] = rawValue;
  }

  if ('text' in normalized) {
    if (!normalized.text.trim()) throw new TypeError('El fragmento no puede quedar vacío');
    normalized.text_hash = createHash('sha256').update(normalized.text).digest('hex');
    normalized.has_line_breaks = normalized.text.includes('\n');
  }
  if ('original_text' in normalized && !normalized.original_text.trim()) {
    throw new TypeError('El original no puede quedar vacío');
  }

  if (
    currentUserId
    && (normalized.workflow_status === 'approved' || normalized.verification_status === 'verified')
    && new Set(['quotes', 'quote_originals']).has(collection)
  ) {
    normalized.reviewer_id = currentUserId;
    normalized.reviewed_at = new Date().toISOString();
  }

  if (!Object.keys(normalized).length) throw new TypeError('No hay cambios que guardar');
  return normalized;
}

function canonicalJson(value) {
  if (Array.isArray(value)) return value.map(canonicalJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, canonicalJson(value[key])]),
    );
  }
  return value;
}

function valuesEqual(left, right) {
  if (left === right) return true;
  if (
    (Array.isArray(left) || (left && typeof left === 'object'))
    && (Array.isArray(right) || (right && typeof right === 'object'))
  ) {
    return JSON.stringify(canonicalJson(left)) === JSON.stringify(canonicalJson(right));
  }
  return false;
}

export function prepareEditorialUpdate(collection, current, requestedChanges, currentUserId = null) {
  const normalized = normalizePatch(collection, requestedChanges, currentUserId);
  const explicitFields = new Set(Object.keys(requestedChanges));
  const changes = Object.fromEntries(
    Object.entries(normalized).filter(([field, value]) => !valuesEqual(current[field], value)),
  );
  const materialFields = materialFieldsByCollection[collection] || new Set();
  const materialChanged = [...explicitFields].some((field) => (
    materialFields.has(field) && !valuesEqual(current[field], requestedChanges[field])
  ));
  let reviewReset = false;

  if (materialChanged) {
    if (
      collectionDefinitions[collection].patchFields.has('workflow_status')
      && !explicitFields.has('workflow_status')
      && current.workflow_status !== 'in_review'
    ) {
      changes.workflow_status = 'in_review';
      reviewReset = true;
    }
    if (
      collectionDefinitions[collection].patchFields.has('verification_status')
      && !explicitFields.has('verification_status')
      && current.verification_status !== 'pending'
    ) {
      changes.verification_status = 'pending';
      reviewReset = true;
    }
  }

  if (!Object.keys(changes).length) throw new TypeError('No hay cambios que guardar');
  return { changes, reviewReset };
}

async function readJsonBody(request, maximumBytes = 160_000) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maximumBytes) throw new RangeError('La solicitud es demasiado grande');
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    throw new SyntaxError('El cuerpo JSON no es válido');
  }
}

function contentTypeFor(filePath) {
  const extension = path.extname(filePath);
  return ({
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
  })[extension] || 'application/octet-stream';
}

async function serveFile(response, filePath) {
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error('not_file');
    response.writeHead(200, {
      'Content-Type': contentTypeFor(filePath),
      'Content-Length': fileStat.size,
      'Cache-Control': filePath.endsWith('.html') ? 'no-store' : 'public, max-age=300',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    });
    createReadStream(filePath).pipe(response);
  } catch {
    apiError(response, 404, 'not_found', 'Recurso no encontrado');
  }
}

function filterValue(value, maximumLength = 80) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= maximumLength ? trimmed : null;
}

function summarizeOverview({ quotes, authors, works, sources, runs }) {
  const readyQuotes = quotes.filter((quote) => (
    quote.workflow_status === 'approved'
    && quote.verification_status === 'verified'
    && quote.visibility === 'public'
    && quote.publication_excluded === false
  )).length;
  const pendingSources = sources.filter((source) => (
    source.verification_status !== 'verified' || source.rights_status !== 'cleared'
  )).length;

  return {
    metrics: {
      quotes: quotes.length,
      in_review: quotes.filter((quote) => quote.workflow_status === 'in_review').length,
      ready_quotes: readyQuotes,
      public_authors: authors.filter((author) => author.visibility === 'public').length,
      public_works: works.filter((work) => work.visibility === 'public').length,
      pending_sources: pendingSources,
    },
    workflow: Object.fromEntries([...WORKFLOW_STATUSES].map((status) => [
      status,
      quotes.filter((quote) => quote.workflow_status === status).length,
    ])),
    recent_runs: runs,
  };
}

export function createEditorialApp(options = {}) {
  const directusUrl = ensureLoopbackDirectusUrl(
    options.directusUrl || process.env.DIRECTUS_URL || 'http://127.0.0.1:8055',
  );
  const cookieName = options.cookieName || 'paramo_editorial_session';
  const secureCookie = options.secureCookie ?? process.env.PARAMO_EDITORIAL_SECURE_COOKIE === 'true';
  const sessions = new Map();
  const loginAttempts = new Map();
  const sessionMaxAgeSeconds = 12 * 60 * 60;

  function setSessionCookie(response, sessionId, maxAge = sessionMaxAgeSeconds) {
    response.setHeader('Set-Cookie', [
      `${cookieName}=${encodeURIComponent(sessionId)}; Path=/editorial; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secureCookie ? '; Secure' : ''}`,
    ]);
  }

  function requestSession(request) {
    const sessionId = parseCookies(request.headers.cookie)[cookieName];
    const session = sessionId ? sessions.get(sessionId) : null;
    if (!session) return null;
    if (session.absoluteExpiresAt <= Date.now()) {
      sessions.delete(sessionId);
      return null;
    }
    session.lastSeenAt = Date.now();
    return session;
  }

  function validateMutationRequest(request) {
    if (!safeEqual(request.headers['x-paramo-editorial-request'] || '', '1')) return false;
    const origin = request.headers.origin;
    if (!origin) return true;
    const protocol = String(request.headers['x-forwarded-proto'] || 'http').split(',')[0].trim();
    return safeEqual(origin, `${protocol}://${request.headers.host}`);
  }

  async function rawDirectus(apiPath, options = {}) {
    const response = await fetch(`${directusUrl}${apiPath}`, {
      ...options,
      headers: {
        accept: 'application/json',
        ...(options.body ? { 'content-type': 'application/json' } : {}),
        ...options.headers,
      },
    });
    const payload = response.status === 204 ? null : await response.json().catch(() => null);
    return { response, payload };
  }

  async function refreshSession(session) {
    const { response, payload } = await rawDirectus('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: session.refreshToken, mode: 'json' }),
    });
    if (!response.ok || !payload?.data?.access_token) {
      session.absoluteExpiresAt = 0;
      throw new Error('session_expired');
    }
    session.accessToken = payload.data.access_token;
    session.refreshToken = payload.data.refresh_token || session.refreshToken;
    session.accessExpiresAt = Date.now() + Number(payload.data.expires || 900_000);
  }

  async function directus(session, apiPath, options = {}, allowRetry = true) {
    if (session.accessExpiresAt <= Date.now() + 10_000) await refreshSession(session);
    const result = await rawDirectus(apiPath, {
      ...options,
      headers: {
        authorization: `Bearer ${session.accessToken}`,
        ...options.headers,
      },
    });
    if (result.response.status === 401 && allowRetry) {
      await refreshSession(session);
      return directus(session, apiPath, options, false);
    }
    if (!result.response.ok) {
      const reason = result.payload?.errors?.map((error) => error.message).join('; ')
        || result.response.statusText;
      const error = new Error(reason || 'Error de Directus');
      error.status = result.response.status;
      throw error;
    }
    return result.payload?.data ?? result.payload;
  }

  async function handleLogin(request, response) {
    const remoteAddress = request.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const attempts = (loginAttempts.get(remoteAddress) || []).filter((time) => now - time < 600_000);
    if (attempts.length >= 8) {
      apiError(response, 429, 'too_many_attempts', 'Demasiados intentos. Espera unos minutos.');
      return;
    }

    const body = await readJsonBody(request);
    if (typeof body.email !== 'string' || typeof body.password !== 'string') {
      apiError(response, 400, 'invalid_credentials', 'Escribe el correo y la contraseña.');
      return;
    }
    attempts.push(now);
    loginAttempts.set(remoteAddress, attempts);

    const { response: loginResponse, payload } = await rawDirectus('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: body.email.trim(),
        password: body.password,
        ...(body.otp ? { otp: String(body.otp).trim() } : {}),
        mode: 'json',
      }),
    });
    if (!loginResponse.ok || !payload?.data?.access_token) {
      apiError(response, 401, 'invalid_credentials', 'No se pudo iniciar sesión.');
      return;
    }

    const provisional = {
      accessToken: payload.data.access_token,
      refreshToken: payload.data.refresh_token,
      accessExpiresAt: Date.now() + Number(payload.data.expires || 900_000),
      absoluteExpiresAt: Date.now() + sessionMaxAgeSeconds * 1000,
    };
    let user;
    try {
      user = await directus(provisional, '/users/me?fields=id,email,first_name,last_name,status,role');
    } catch {
      apiError(response, 403, 'forbidden', 'La cuenta no tiene acceso al espacio editorial.');
      return;
    }
    if (user.status !== 'active') {
      apiError(response, 403, 'inactive_user', 'La cuenta editorial no está activa.');
      return;
    }

    loginAttempts.delete(remoteAddress);
    for (const [existingId, existing] of sessions) {
      if (existing.absoluteExpiresAt <= Date.now()) sessions.delete(existingId);
    }
    const sessionId = randomBytes(32).toString('base64url');
    sessions.set(sessionId, {
      id: sessionId,
      ...provisional,
      user,
      lastSeenAt: Date.now(),
    });
    setSessionCookie(response, sessionId);
    json(response, 200, { user });
  }

  async function handleLogout(response, session) {
    sessions.delete(session.id);
    setSessionCookie(response, '', 0);
    try {
      await rawDirectus('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: session.refreshToken, mode: 'json' }),
      });
    } catch {
      // La sesión local queda cerrada aunque Directus no responda.
    }
    json(response, 200, { ok: true });
  }

  async function handleOverview(response, session) {
    const fields = 'workflow_status,verification_status,visibility,publication_excluded';
    const [quotes, authors, works, sources, runs] = await Promise.all([
      directus(session, `/items/quotes?limit=-1&fields=${fields}`),
      directus(session, '/items/authors?limit=-1&fields=workflow_status,verification_status,visibility'),
      directus(session, '/items/works?limit=-1&fields=workflow_status,verification_status,visibility'),
      directus(session, '/items/sources?limit=-1&fields=verification_status,rights_status'),
      directus(session, '/items/publication_runs?limit=6&sort=-started_at&fields=id,environment,status,entity_counts,warnings,errors,git_commit,started_at,finished_at'),
    ]);
    json(response, 200, summarizeOverview({ quotes, authors, works, sources, runs }));
  }

  async function handleReferences(response, session) {
    const [authors, works] = await Promise.all([
      directus(session, '/items/authors?limit=-1&sort=display_name&fields=id,display_name'),
      directus(session, '/items/works?limit=-1&sort=display_title&fields=id,display_title'),
    ]);
    json(response, 200, { authors, works });
  }

  function listQuery(url, collection) {
    const definition = collectionDefinitions[collection];
    const page = Math.max(1, Math.min(10_000, Number.parseInt(url.searchParams.get('page') || '1', 10) || 1));
    const limit = Math.max(10, Math.min(100, Number.parseInt(url.searchParams.get('limit') || '30', 10) || 30));
    const query = new URLSearchParams({
      fields: definition.fields.join(','),
      sort: definition.sort,
      page: String(page),
      limit: String(limit),
      meta: 'filter_count',
    });
    const search = filterValue(url.searchParams.get('search'), 160);
    if (search) query.set('search', search);

    const filter = {};
    for (const filterName of definition.filters) {
      const value = filterValue(url.searchParams.get(filterName));
      if (!value) continue;
      if (enumFields.has(filterName) && !enumFields.get(filterName).has(value)) continue;
      filter[filterName] = { _eq: value };
    }
    if (Object.keys(filter).length) query.set('filter', JSON.stringify(filter));
    return { query, page, limit };
  }

  async function handleList(response, session, url, collection) {
    const { query, page, limit } = listQuery(url, collection);
    const result = await directus(session, `/items/${collection}?${query}`);
    // Directus entrega meta fuera de data; pedimos un agregado separado para no depender de meta obsoleta.
    const countQuery = new URLSearchParams();
    const filter = query.get('filter');
    const search = query.get('search');
    if (filter) countQuery.set('filter', filter);
    if (search) countQuery.set('search', search);
    countQuery.set('aggregate[count]', '*');
    const countResult = await directus(session, `/items/${collection}?${countQuery}`);
    const total = Number(countResult?.[0]?.count || countResult?.[0]?.countAll || result.length);
    json(response, 200, { records: result, page, limit, total });
  }

  async function handleDetail(response, session, collection, itemId) {
    const definition = collectionDefinitions[collection];
    const encodedId = encodeURIComponent(itemId);
    const record = await directus(session, `/items/${collection}/${encodedId}?fields=${definition.fields.join(',')}`);
    const payload = { record };
    if (collection === 'quotes') {
      const filter = encodeURIComponent(JSON.stringify({ quote_id: { _eq: itemId } }));
      payload.originals = await directus(
        session,
        `/items/quote_originals?limit=-1&sort=-is_primary&filter=${filter}&fields=${collectionDefinitions.quote_originals.fields.join(',')}`,
      );
    }
    json(response, 200, payload);
  }

  async function handlePatch(request, response, session, collection, itemId) {
    const body = await readJsonBody(request);
    const definition = collectionDefinitions[collection];
    const comparisonFields = [...new Set([
      ...definition.fields,
      ...definition.patchFields,
      'text_hash',
      'has_line_breaks',
    ])].join(',');
    const current = await directus(
      session,
      `/items/${collection}/${encodeURIComponent(itemId)}?fields=${comparisonFields}`,
    );
    let prepared;
    try {
      prepared = prepareEditorialUpdate(collection, current, body.changes, session.user.id);
    } catch (error) {
      apiError(response, 400, 'invalid_changes', error.message);
      return;
    }
    const fields = collectionDefinitions[collection].fields.join(',');
    const updated = await directus(session, `/items/${collection}/${encodeURIComponent(itemId)}?fields=${fields}`, {
      method: 'PATCH',
      body: JSON.stringify(prepared.changes),
    });
    json(response, 200, { record: updated, review_reset: prepared.reviewReset });
  }

  async function apiHandler(request, response, url) {
    const pathParts = url.pathname.replace(/^\/editorial\/api\/?/u, '').split('/').filter(Boolean);
    const route = pathParts[0] || '';

    if (request.method === 'GET' && route === 'health') {
      try {
        const ping = await fetch(`${directusUrl}/server/ping`, {
          headers: { accept: 'text/plain' },
          signal: AbortSignal.timeout(3_000),
        });
        if (!ping.ok) throw new Error('directus_unavailable');
        json(response, 200, { ok: true, directus: 'available' });
      } catch {
        json(response, 503, { ok: false, directus: 'unavailable' });
      }
      return;
    }

    if (request.method === 'POST' && route === 'login') {
      if (!validateMutationRequest(request)) {
        apiError(response, 403, 'csrf_rejected', 'La solicitud no procede del panel editorial.');
        return;
      }
      await handleLogin(request, response);
      return;
    }

    const session = requestSession(request);
    if (!session) {
      setSessionCookie(response, '', 0);
      apiError(response, 401, 'authentication_required', 'Inicia sesión para continuar.');
      return;
    }

    if (request.method === 'GET' && route === 'session') {
      json(response, 200, { user: session.user });
      return;
    }
    if (request.method === 'POST' && route === 'logout') {
      if (!validateMutationRequest(request)) {
        apiError(response, 403, 'csrf_rejected', 'La solicitud no procede del panel editorial.');
        return;
      }
      await handleLogout(response, session);
      return;
    }
    if (request.method === 'GET' && route === 'overview') {
      await handleOverview(response, session);
      return;
    }
    if (request.method === 'GET' && route === 'references') {
      await handleReferences(response, session);
      return;
    }
    if (
      route === 'records'
      && Object.prototype.hasOwnProperty.call(collectionDefinitions, pathParts[1])
    ) {
      const collection = pathParts[1];
      const itemId = pathParts.slice(2).join('/');
      if (request.method === 'GET' && !itemId) {
        await handleList(response, session, url, collection);
        return;
      }
      if (request.method === 'GET' && itemId) {
        await handleDetail(response, session, collection, itemId);
        return;
      }
      if (request.method === 'PATCH' && itemId) {
        if (!validateMutationRequest(request)) {
          apiError(response, 403, 'csrf_rejected', 'La solicitud no procede del panel editorial.');
          return;
        }
        if (!collectionDefinitions[collection].patchFields.size) {
          apiError(response, 405, 'read_only', 'Esta sección es de solo lectura.');
          return;
        }
        await handlePatch(request, response, session, collection, itemId);
        return;
      }
    }

    apiError(response, 404, 'not_found', 'Ruta editorial no encontrada.');
  }

  return async function editorialHandler(request, response) {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    try {
      if (url.pathname.startsWith('/editorial/api/')) {
        await apiHandler(request, response, url);
        return;
      }
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        apiError(response, 405, 'method_not_allowed', 'Método no permitido.');
        return;
      }
      if (url.pathname === '/editorial' || url.pathname === '/editorial/' || url.pathname === '/editorial/index.html') {
        await serveFile(response, path.join(editorialRoot, 'index.html'));
        return;
      }
      if (url.pathname === '/editorial/panel.css') {
        await serveFile(response, path.join(editorialRoot, 'panel.css'));
        return;
      }
      if (url.pathname === '/editorial/panel.js') {
        await serveFile(response, path.join(editorialRoot, 'panel.js'));
        return;
      }
      if (url.pathname === '/editorial/logo.svg') {
        await serveFile(response, path.join(projectRoot, 'logo.svg'));
        return;
      }
      apiError(response, 404, 'not_found', 'Recurso no encontrado.');
    } catch (error) {
      if (error.message === 'session_expired' || error.status === 401) {
        apiError(response, 401, 'session_expired', 'La sesión ha caducado. Vuelve a entrar.');
        return;
      }
      if (error instanceof RangeError || error instanceof SyntaxError) {
        apiError(response, 400, 'invalid_request', error.message);
        return;
      }
      console.error('editorial-panel:', error);
      apiError(
        response,
        error.status && error.status < 500 ? error.status : 502,
        'editorial_backend_error',
        error.status === 403 ? 'La cuenta no tiene permiso para realizar esta acción.' : 'El servicio editorial no está disponible.',
      );
    }
  };
}

export function startEditorialServer(options = {}) {
  const host = options.host || process.env.PARAMO_EDITORIAL_HOST || '127.0.0.1';
  const port = Number.parseInt(options.port || process.env.PARAMO_EDITORIAL_PORT || '3040', 10);
  const server = http.createServer(createEditorialApp(options));
  server.listen(port, host, () => {
    console.log(`Páramo editorial listening on http://${host}:${port}/editorial/`);
  });
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startEditorialServer();
}
