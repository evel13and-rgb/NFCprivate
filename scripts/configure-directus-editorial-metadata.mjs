#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const DEFAULT_DIRECTUS_URL = 'http://127.0.0.1:8055';
const DEFAULT_ADMIN_EMAIL = 'paramorliterario@gmail.com';
const DEFAULT_PASSWORD_FILE = '/etc/paramoliterario/directus/admin_initial_password';

const collectionDefinitions = [
  ['authors', 'person', 'Autores y fichas biográficas del catálogo.', '{{display_name}}', false],
  ['works', 'menu_book', 'Obras y fichas literarias.', '{{display_title}}', false],
  ['quotes', 'format_quote', 'Fragmentos que alimentarán el JSON público.', '{{id}} — {{text}}', false],
  ['quote_originals', 'translate', 'Originales y versiones cotejadas de los fragmentos.', '{{label}}', false],
  ['sources', 'library_books', 'Fuentes, verificaciones y situación de derechos.', '{{citation_label}}', false],
  ['editorial_decisions', 'fact_check', 'Historial razonado de decisiones editoriales.', '{{decision_type}} — {{field_name}}', false],
  ['themes', 'sell', 'Temas normalizados del catálogo.', '{{label}}', false],
  ['speakers', 'record_voice_over', 'Personajes o voces que pronuncian un fragmento.', '{{display_name}}', false],
  ['voices', 'graphic_eq', 'Voces sintéticas, parámetros, licencias y derechos.', '{{display_name}}', false],
  ['quote_audio', 'headphones', 'Metadatos de audio; el binario permanece fuera de PostgreSQL.', '{{variant}} — {{language}}', false],
  ['publication_runs', 'publish', 'Auditoría de vistas previas y publicaciones estáticas.', '{{environment}} — {{status}}', false],
  ['work_contributors', 'group', 'Relación entre obras, autores y funciones.', null, true],
  ['author_themes', 'link', 'Relación interna entre autores y temas.', null, true],
  ['work_themes', 'link', 'Relación interna entre obras y temas.', null, true],
  ['author_sources', 'link', 'Fuentes asociadas a autores.', null, true],
  ['work_sources', 'link', 'Fuentes asociadas a obras.', null, true],
  ['quote_sources', 'link', 'Fuentes asociadas a fragmentos.', null, true],
  ['quote_original_sources', 'link', 'Fuentes asociadas a originales.', null, true],
].map(([collection, icon, note, displayTemplate, hidden], index) => ({
  collection,
  meta: {
    icon,
    note,
    display_template: displayTemplate,
    hidden,
    singleton: false,
    accountability: 'all',
    sort: index + 1,
    collapse: 'open',
  },
}));

const collectionNames = new Set(collectionDefinitions.map(({ collection }) => collection));

const choiceSets = {
  workflow_status: ['draft', 'in_review', 'approved', 'archived'],
  visibility: ['hidden', 'public', 'scheduled'],
  verification_status: ['pending', 'partially_verified', 'verified', 'rejected'],
  generation_status: ['pending', 'generating', 'ready', 'failed', 'stale'],
  environment: ['preview', 'production'],
  variant: ['translation', 'original', 'linguistic_update'],
};

const contextualChoiceSets = {
  'editorial_decisions.status': ['proposed', 'accepted', 'rejected', 'needs_review'],
  'publication_runs.status': ['started', 'validated', 'published', 'failed'],
};

const choiceLabels = {
  draft: 'Borrador',
  in_review: 'En revisión',
  approved: 'Aprobado',
  archived: 'Archivado',
  hidden: 'Oculto',
  public: 'Público',
  scheduled: 'Programado',
  pending: 'Pendiente',
  partially_verified: 'Verificado parcialmente',
  verified: 'Verificado',
  rejected: 'Rechazado',
  generating: 'Generando',
  ready: 'Listo',
  failed: 'Fallido',
  stale: 'Obsoleto',
  preview: 'Vista previa',
  production: 'Producción',
  translation: 'Traducción',
  original: 'Original',
  linguistic_update: 'Actualización lingüística',
  proposed: 'Propuesto',
  accepted: 'Aceptado',
  needs_review: 'Necesita revisión',
  started: 'Iniciado',
  validated: 'Validado',
  published: 'Publicado',
};

const multilineFields = new Set([
  'short_biography',
  'short_summary',
  'context',
  'text',
  'highlight',
  'description',
  'source_note',
  'rights_notes',
  'notes',
  'reason',
  'error_message',
  'portrait_caption',
  'portrait_credit',
  'public_biography_long',
  'public_tone_notes',
  'public_why_in_paramo',
  'public_summary_long',
  'public_fragment_notes',
]);

const jsonFields = new Set([
  'bibliographic_identifiers',
  'old_value',
  'new_value',
  'generation_parameters',
  'entity_counts',
  'artifact_hashes',
  'warnings',
  'errors',
  'public_information_sources',
]);

const readonlyFields = new Set([
  'text_hash',
  'source_text_hash',
  'date_created',
  'date_updated',
  'started_at',
  'finished_at',
  'generated_at',
  'reviewed_at',
]);

function parseArguments(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
    skipRelations: argv.includes('--skip-relations'),
    onlyRelations: argv.includes('--only-relations'),
  };
}

function ensureLocalUrl(rawUrl) {
  const url = new URL(rawUrl);
  const localHosts = new Set(['127.0.0.1', 'localhost', '[::1]']);

  if (!localHosts.has(url.hostname)) {
    throw new Error(`Se rechaza DIRECTUS_URL no local: ${url.hostname}`);
  }

  return url.toString().replace(/\/$/, '');
}

function titleFromValue(value) {
  if (choiceLabels[value]) return choiceLabels[value];

  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function fieldMeta(collection, field, relationKeys) {
  const { field: name, schema = {}, type } = field;
  const choices = contextualChoiceSets[`${collection}.${name}`] || choiceSets[name];
  const meta = {
    hidden: false,
    readonly: readonlyFields.has(name),
    required: schema.is_nullable === false && schema.default_value == null && !schema.is_primary_key,
  };

  if (name === 'id') {
    meta.interface = 'input';
    meta.readonly = type === 'uuid';
    meta.hidden = type === 'uuid';
    meta.required = type !== 'uuid';
  }

  if (name === 'user_created' || name === 'user_updated') {
    meta.interface = 'select-dropdown-m2o';
    meta.special = [name === 'user_created' ? 'user-created' : 'user-updated', 'm2o'];
    meta.readonly = true;
    meta.hidden = true;
  } else if (name === 'date_created' || name === 'date_updated') {
    meta.interface = 'datetime';
    meta.special = [name === 'date_created' ? 'date-created' : 'date-updated'];
    meta.readonly = true;
    meta.hidden = true;
  } else if (relationKeys.has(name)) {
    meta.interface = 'select-dropdown-m2o';
    meta.special = ['m2o'];
  } else if (choices) {
    meta.interface = 'select-dropdown';
    meta.options = {
      choices: choices.map((value) => ({ text: titleFromValue(value), value })),
    };
  } else if (type === 'boolean') {
    meta.interface = 'boolean';
  } else if (jsonFields.has(name) || type === 'json') {
    meta.interface = 'input-code';
    meta.options = { language: 'json' };
  } else if (multilineFields.has(name) || name === 'original_text') {
    meta.interface = 'input-multiline';
  } else if (type === 'date' || type === 'dateTime' || type === 'timestamp') {
    meta.interface = 'datetime';
  } else if (!meta.interface) {
    meta.interface = 'input';
  }

  if (name === 'workflow_status') {
    meta.note = 'Borrador → en revisión → aprobado; archivar no publica.';
  } else if (name === 'visibility') {
    meta.note = 'La visibilidad por sí sola no publica: también se valida al exportar.';
  } else if (name === 'verification_status') {
    meta.note = 'Estado de comprobación humana de la información.';
  } else if (name === 'rights_status' || name === 'rights_notes') {
    meta.note = 'Registrar aquí la situación de derechos antes de publicar.';
  } else if (name === 'text_hash' || name === 'source_text_hash') {
    meta.note = 'Huella calculada para detectar cambios y audio obsoleto.';
  } else if (name === 'id' && type !== 'uuid') {
    meta.note = 'Identificador estable; no debe reutilizarse ni cambiar después de publicar.';
  } else if (name === 'file_id') {
    meta.note = 'Archivo administrado por Directus; PostgreSQL conserva solo la referencia.';
  }

  return meta;
}

async function main() {
  const { dryRun, skipRelations, onlyRelations } = parseArguments(process.argv.slice(2));

  if (skipRelations && onlyRelations) {
    throw new Error('--skip-relations y --only-relations no pueden usarse juntos');
  }

  const baseUrl = ensureLocalUrl(process.env.DIRECTUS_URL || DEFAULT_DIRECTUS_URL);
  const email = process.env.DIRECTUS_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const passwordFile = process.env.DIRECTUS_ADMIN_PASSWORD_FILE || DEFAULT_PASSWORD_FILE;
  const password = (await readFile(passwordFile, 'utf8')).trim();

  if (!password) throw new Error(`El archivo de contraseña está vacío: ${passwordFile}`);

  let accessToken;

  async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'content-type': 'application/json',
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
    });
    const payload = response.status === 204 ? null : await response.json();

    if (!response.ok) {
      const reason = payload?.errors?.map((error) => error.message).join('; ') || response.statusText;
      throw new Error(`${options.method || 'GET'} ${path}: ${response.status} ${reason}`);
    }

    return payload?.data ?? payload;
  }

  const login = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, mode: 'json' }),
  });
  accessToken = login.access_token;

  const [allFields, allRelations] = await Promise.all([request('/fields'), request('/relations')]);
  const editorialRelations = allRelations.filter((relation) => collectionNames.has(relation.collection));
  const relationsByCollection = new Map();

  for (const relation of editorialRelations) {
    const relations = relationsByCollection.get(relation.collection) || [];
    relations.push(relation);
    relationsByCollection.set(relation.collection, relations);
  }

  let configuredCollections = 0;
  let configuredFields = 0;
  let configuredRelations = 0;
  let existingRelationMetadata = 0;

  const collectionUpdates = [];
  const fieldUpdates = [];

  for (const definition of collectionDefinitions) {
    const fields = allFields.filter((field) => field.collection === definition.collection);
    const fieldNames = new Set(fields.map(({ field }) => field));
    const collectionMeta = { ...definition.meta };

    if (fieldNames.has('workflow_status')) {
      Object.assign(collectionMeta, {
        archive_field: 'workflow_status',
        archive_value: 'archived',
        unarchive_value: 'draft',
        archive_app_filter: true,
      });
    }

    if (fieldNames.has('sort')) collectionMeta.sort_field = 'sort';

    collectionUpdates.push({ collection: definition.collection, meta: collectionMeta });
    configuredCollections += 1;

    const relationKeys = new Set(
      (relationsByCollection.get(definition.collection) || []).map(({ field }) => field),
    );

    fieldUpdates.push({
      collection: definition.collection,
      fields: fields.map((field) => ({
        field: field.field,
        meta: fieldMeta(definition.collection, field, relationKeys),
      })),
    });
    configuredFields += fields.length;

    process.stdout.write(
      `${dryRun ? '[simulación] ' : ''}${definition.collection}: ${fields.length} campos\n`,
    );
  }

  if (!dryRun && !onlyRelations) {
    await request('/collections', {
      method: 'PATCH',
      body: JSON.stringify(collectionUpdates),
    });

    for (const update of fieldUpdates) {
      await request(`/fields/${encodeURIComponent(update.collection)}`, {
        method: 'PATCH',
        body: JSON.stringify(update.fields),
      });
    }
  }

  if (!skipRelations) {
    for (const relation of editorialRelations) {
      if (relation.meta) {
        existingRelationMetadata += 1;
        continue;
      }

      const relationSchema = {
        on_delete: relation.schema?.on_delete || 'NO ACTION',
        on_update: relation.schema?.on_update || 'NO ACTION',
      };
      const relationMeta = {
        one_field: null,
        one_collection_field: null,
        one_allowed_collections: null,
        junction_field: null,
        sort_field: null,
        one_deselect_action: 'nullify',
      };

      if (!dryRun) {
        await request(
          `/relations/${encodeURIComponent(relation.collection)}/${encodeURIComponent(relation.field)}`,
          {
            method: 'PATCH',
            body: JSON.stringify({
              collection: relation.collection,
              field: relation.field,
              related_collection: relation.related_collection,
              schema: relationSchema,
              meta: relationMeta,
            }),
          },
        );
      }
      configuredRelations += 1;
    }
  }

  await request('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: login.refresh_token }),
  });
  accessToken = undefined;
  process.stdout.write(
    [
      `Colecciones configuradas: ${configuredCollections}`,
      `Campos configurados: ${configuredFields}`,
      skipRelations
        ? 'Relaciones omitidas por --skip-relations'
        : `Relaciones configuradas: ${configuredRelations}; ya existentes: ${existingRelationMetadata}`,
    ].join('\n') + '\n',
  );
}

main().catch((error) => {
  process.stderr.write(`Error: ${error.message}\n`);
  process.exitCode = 1;
});
