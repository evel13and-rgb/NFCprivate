#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_DIRECTUS_URL = 'http://127.0.0.1:8055';
const DEFAULT_ADMIN_EMAIL = 'paramorliterario@gmail.com';
const DEFAULT_PASSWORD_FILE = '/etc/paramoliterario/directus/admin_initial_password';

const editorialCollections = new Set([
  'authors',
  'works',
  'quotes',
  'quote_originals',
  'sources',
  'editorial_decisions',
  'themes',
  'speakers',
  'voices',
  'quote_audio',
  'publication_runs',
  'work_contributors',
  'author_themes',
  'work_themes',
  'author_sources',
  'work_sources',
  'quote_sources',
  'quote_original_sources',
]);

const collectionLayouts = {
  authors: {
    fields: [
      'display_name', 'workflow_status', 'verification_status', 'visibility',
      'short_biography', 'portrait_path', 'date_updated',
    ],
    sort: ['sort', 'display_name'],
  },
  works: {
    fields: [
      'display_title', 'primary_author_id', 'workflow_status', 'verification_status',
      'visibility', 'short_summary', 'date_updated',
    ],
    sort: ['sort', 'display_title'],
  },
  quotes: {
    fields: [
      'id', 'legacy_index', 'text', 'work_id', 'speaker_display_name',
      'workflow_status', 'verification_status', 'visibility', 'publication_excluded',
    ],
    sort: ['legacy_index'],
  },
  quote_originals: {
    fields: [
      'quote_id', 'language', 'label', 'original_text', 'workflow_status',
      'verification_status', 'visibility', 'reviewed_at',
    ],
    sort: ['quote_id'],
  },
  sources: {
    fields: [
      'id', 'citation_label', 'source_type', 'language', 'rights_status',
      'verification_status', 'accessed_at',
    ],
    sort: ['id'],
  },
  speakers: {
    fields: ['work_id', 'display_name', 'slug', 'verification_status', 'date_updated'],
    sort: ['work_id', 'display_name'],
  },
  quote_audio: {
    fields: [
      'quote_id', 'variant', 'language', 'voice_id', 'generation_status',
      'visibility', 'duration_ms', 'generated_at',
    ],
    sort: ['quote_id', 'variant'],
  },
};

function preset(collection, bookmark, options = {}) {
  const layout = collectionLayouts[collection];
  return {
    bookmark,
    collection,
    search: null,
    layout: 'tabular',
    layout_query: {
      tabular: {
        fields: layout.fields,
        sort: layout.sort,
        page: 1,
        limit: 25,
      },
    },
    layout_options: null,
    refresh_interval: null,
    filter: options.filter || null,
    icon: options.icon || (bookmark ? 'bookmark' : 'view_list'),
    color: options.color || null,
  };
}

const workspacePresetDefinitions = [
  ...Object.keys(collectionLayouts).map((collection) => preset(collection, null)),
  preset('authors', 'Autores · Públicos', {
    icon: 'person',
    color: '#047857',
    filter: { visibility: { _eq: 'public' } },
  }),
  preset('works', 'Obras · Públicas', {
    icon: 'menu_book',
    color: '#047857',
    filter: { visibility: { _eq: 'public' } },
  }),
  preset('quotes', 'Frases · Borradores', {
    icon: 'edit_note',
    color: '#6B7280',
    filter: { workflow_status: { _eq: 'draft' } },
  }),
  preset('quotes', 'Frases · En revisión', {
    icon: 'rate_review',
    color: '#D97706',
    filter: { workflow_status: { _eq: 'in_review' } },
  }),
  preset('quotes', 'Frases · Aprobadas ocultas', {
    icon: 'verified',
    color: '#2563EB',
    filter: {
      _and: [
        { workflow_status: { _eq: 'approved' } },
        { visibility: { _eq: 'hidden' } },
      ],
    },
  }),
  preset('quotes', 'Frases · Preparadas para exportar', {
    icon: 'publish',
    color: '#047857',
    filter: {
      _and: [
        { workflow_status: { _eq: 'approved' } },
        { verification_status: { _eq: 'verified' } },
        { visibility: { _eq: 'public' } },
        { publication_excluded: { _eq: false } },
      ],
    },
  }),
  preset('quote_originals', 'Originales · En revisión', {
    icon: 'translate',
    color: '#D97706',
    filter: { workflow_status: { _eq: 'in_review' } },
  }),
  preset('quote_originals', 'Originales · Aprobados', {
    icon: 'verified',
    color: '#047857',
    filter: { workflow_status: { _eq: 'approved' } },
  }),
  preset('sources', 'Fuentes · Pendientes', {
    icon: 'warning',
    color: '#DC2626',
    filter: {
      _or: [
        { verification_status: { _neq: 'verified' } },
        { rights_status: { _neq: 'cleared' } },
      ],
    },
  }),
  preset('speakers', 'Hablantes · Pendientes', {
    icon: 'record_voice_over',
    color: '#D97706',
    filter: { verification_status: { _neq: 'verified' } },
  }),
  preset('quote_audio', 'Audio · Requiere atención', {
    icon: 'error',
    color: '#DC2626',
    filter: { generation_status: { _in: ['failed', 'stale'] } },
  }),
];

const managedPresetFields = [
  'bookmark',
  'collection',
  'search',
  'layout',
  'layout_query',
  'layout_options',
  'refresh_interval',
  'filter',
  'icon',
  'color',
];

function ensureLocalUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (!new Set(['127.0.0.1', 'localhost', '[::1]']).has(url.hostname)) {
    throw new Error(`Se rechaza DIRECTUS_URL no local: ${url.hostname}`);
  }
  return url.toString().replace(/\/$/u, '');
}

function presetKey(value) {
  return `${value.collection}\0${value.bookmark || ''}`;
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

function managedPreset(value) {
  return Object.fromEntries(managedPresetFields.map((field) => [field, value[field] ?? null]));
}

function presetsEqual(left, right) {
  return JSON.stringify(canonicalize(managedPreset(left)))
    === JSON.stringify(canonicalize(managedPreset(right)));
}

function validatePresetDefinitions(definitions, availableFields = null) {
  const errors = [];
  const keys = new Set();

  for (const definition of definitions) {
    const key = presetKey(definition);
    if (keys.has(key)) errors.push(`Vista duplicada: ${key}`);
    keys.add(key);
    if (!collectionLayouts[definition.collection]) {
      errors.push(`Colección sin disposición: ${definition.collection}`);
    }
    if (definition.bookmark === '') errors.push(`${definition.collection}: bookmark vacío`);

    if (availableFields) {
      const collectionFields = availableFields.get(definition.collection) || new Set();
      const referencedFields = definition.layout_query?.tabular?.fields || [];
      for (const field of referencedFields) {
        if (!collectionFields.has(field)) {
          errors.push(`${definition.collection}: campo inexistente en la vista (${field})`);
        }
      }
    }
  }

  return errors;
}

async function main() {
  const dryRun = process.argv.slice(2).includes('--dry-run');
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

  const [user, fields, existingPresets, permissions] = await Promise.all([
    request('/users/me?fields=id,email,status,role'),
    request('/fields'),
    request('/presets?limit=-1&fields=*'),
    request('/permissions?limit=-1&fields=id,collection,action,policy'),
  ]);

  if (user.status !== 'active') throw new Error('La cuenta administradora no está activa');
  const publicEditorialPermissions = permissions.filter((permission) => (
    permission.policy == null && editorialCollections.has(permission.collection)
  ));
  if (publicEditorialPermissions.length) {
    throw new Error('Existen permisos públicos sobre colecciones editoriales; se cancela');
  }

  const availableFields = new Map();
  for (const field of fields) {
    const collectionFields = availableFields.get(field.collection) || new Set();
    collectionFields.add(field.field);
    availableFields.set(field.collection, collectionFields);
  }
  const definitionErrors = validatePresetDefinitions(
    workspacePresetDefinitions,
    availableFields,
  );
  if (definitionErrors.length) throw new Error(definitionErrors.join('; '));

  const personalPresets = existingPresets.filter((existing) => existing.user === user.id);
  const existingByKey = new Map();
  for (const existing of personalPresets) {
    const key = presetKey(existing);
    if (existingByKey.has(key)) throw new Error(`Hay vistas personales duplicadas: ${key}`);
    existingByKey.set(key, existing);
  }

  const actions = [];
  for (const definition of workspacePresetDefinitions) {
    const existing = existingByKey.get(presetKey(definition));
    const payload = { ...definition, user: user.id, role: null };
    if (!existing) {
      actions.push({ action: 'create', definition, payload });
    } else if (!presetsEqual(existing, definition)) {
      actions.push({ action: 'update', definition, payload, id: existing.id });
    } else {
      actions.push({ action: 'unchanged', definition, id: existing.id });
    }
  }

  for (const action of actions) {
    const label = action.definition.bookmark || `${action.definition.collection} · vista principal`;
    process.stdout.write(`${dryRun ? '[simulación] ' : ''}${action.action}: ${label}\n`);
    if (dryRun || action.action === 'unchanged') continue;
    if (action.action === 'create') {
      await request('/presets', { method: 'POST', body: JSON.stringify(action.payload) });
    } else {
      await request(`/presets/${action.id}`, {
        method: 'PATCH',
        body: JSON.stringify(action.payload),
      });
    }
  }

  if (!dryRun) {
    const finalPresets = await request('/presets?limit=-1&fields=*');
    const finalByKey = new Map(finalPresets.filter((item) => item.user === user.id).map((item) => (
      [presetKey(item), item]
    )));
    for (const definition of workspacePresetDefinitions) {
      const actual = finalByKey.get(presetKey(definition));
      if (!actual || !presetsEqual(actual, definition)) {
        throw new Error(`La comprobación posterior falló: ${presetKey(definition)}`);
      }
    }
  }

  await request('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: login.refresh_token }),
  });
  accessToken = undefined;

  const counts = actions.reduce((result, action) => {
    result[action.action] += 1;
    return result;
  }, { create: 0, update: 0, unchanged: 0 });
  process.stdout.write(
    `Vistas gestionadas: ${actions.length}; crear: ${counts.create}; actualizar: ${counts.update}; sin cambios: ${counts.unchanged}\n`,
  );
  process.stdout.write('Permisos públicos editoriales: 0\n');
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
  collectionLayouts,
  presetsEqual,
  validatePresetDefinitions,
  workspacePresetDefinitions,
};
