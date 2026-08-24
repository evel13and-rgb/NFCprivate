#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const editorialDirectory = path.join(projectRoot, 'data', 'editorial');

const inputFiles = [
  'authors.draft.json',
  'works.draft.json',
  'sources.draft.json',
  'quotes.normalized.draft.json',
  'originals.manual.json',
  'editorial-decisions.json',
];

const allowedArguments = new Set(['--dry-run', '--json', '--sql', '--help']);
const allowedQuoteTypes = new Set(['prose', 'poem']);
const allowedAttributionTypes = new Set(['author', 'ambiguous']);
const allowedDecisionStatuses = new Set(['proposed', 'accepted', 'rejected', 'needs_review']);

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function md5(value) {
  return createHash('md5').update(value).digest('hex');
}

function hashRecords(records) {
  return sha256(`${JSON.stringify(records)}\n`);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nullable(value) {
  return value === undefined ? null : value;
}

function byField(field) {
  return (left, right) => left[field].localeCompare(right[field], 'en');
}

function uniqueIndex(records, field, label, blockingErrors) {
  const index = new Map();

  for (const [position, record] of records.entries()) {
    if (!isObject(record)) {
      blockingErrors.push(`${label}[${position}] debe ser un objeto`);
      continue;
    }

    const value = record[field];
    if ((typeof value !== 'string' && typeof value !== 'number') || value === '') {
      blockingErrors.push(`${label}[${position}].${field} debe contener un identificador`);
      continue;
    }

    if (index.has(value)) blockingErrors.push(`${label}: ${field} duplicado (${value})`);
    index.set(value, record);
  }

  return index;
}

function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '');
}

function verificationFromSource(source) {
  const mappings = {
    pending: 'pending',
    in_review: 'partially_verified',
    partially_verified: 'partially_verified',
    verified: 'verified',
    rejected: 'rejected',
  };
  return mappings[source?.verification_status] || null;
}

function sqlValue(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(`No se puede serializar el número ${value}`);
    return String(value);
  }
  if (typeof value === 'object') return `${sqlValue(JSON.stringify(value))}::jsonb`;
  return `'${String(value).replaceAll("'", "''")}'`;
}

function insertStatement(table, columns, records, overrides = {}) {
  if (records.length === 0) return '';
  const values = records.map((record) => {
    const cells = columns.map((column) => {
      if (overrides[column]) return overrides[column](record);
      return sqlValue(record[column]);
    });
    return `  (${cells.join(', ')})`;
  }).join(',\n');
  return `INSERT INTO ${table} (${columns.join(', ')}) VALUES\n${values};`;
}

function indentSql(value, spaces) {
  const indentation = ' '.repeat(spaces);
  return value.split('\n').map((line) => `${indentation}${line}`).join('\n');
}

function jsonbSetAssertion(label, expectedRecords, actualSql) {
  const values = expectedRecords.map((record) => `(${sqlValue(record)})`).join(',\n');
  return `${[
    '  IF EXISTS (',
    '    WITH expected(value) AS (VALUES',
    indentSql(values, 6),
    '    ),',
    '    actual(value) AS (',
    indentSql(actualSql, 6),
    '    )',
    '    (SELECT value FROM expected EXCEPT SELECT value FROM actual)',
    '    UNION ALL',
    '    (SELECT value FROM actual EXCEPT SELECT value FROM expected)',
    '  )',
    '  THEN',
    `    RAISE EXCEPTION 'La verificación posterior no coincide en ${label}';`,
    '  END IF;',
  ].join('\n')}`;
}

function createPostflightSql(plan) {
  const { counts, records } = plan;
  const expectedQuotes = records.quotes.map((quote) => ({
    id: quote.id,
    legacy_index: quote.legacy_index,
    text_hash: quote.text_hash,
    highlight: quote.highlight,
    language: quote.language,
    quote_type: quote.quote_type,
    author_id: quote.author_id,
    work_id: quote.work_id,
    speaker_work_id: quote.speaker_work_id,
    speaker_slug: quote.speaker_slug,
    speaker_display_name: quote.speaker_display_name,
    attribution_type: quote.attribution_type,
    legacy_attribution: quote.legacy_attribution,
    legacy_work: quote.legacy_work,
    source_collection: quote.source_collection,
    has_line_breaks: quote.has_line_breaks,
    publication_excluded: quote.publication_excluded,
    workflow_status: quote.workflow_status,
    visibility: quote.visibility,
    verification_status: quote.verification_status,
    reviewer_id: quote.reviewer_id,
    reviewed_at: quote.reviewed_at,
    publish_at: quote.publish_at,
    sort: quote.sort,
  }));
  const expectedOriginals = records.quote_originals.map((original) => ({
    import_key: original.import_key,
    quote_id: original.quote_id,
    original_text_hash: md5(original.original_text),
    language: original.language,
    label: original.label,
    source_note: original.source_note,
    is_primary: original.is_primary,
    workflow_status: original.workflow_status,
    visibility: original.visibility,
    verification_status: original.verification_status,
    reviewer_id: original.reviewer_id,
    reviewed_at: original.reviewed_at,
  }));

  return `${[
    'DO $postflight$',
    'BEGIN',
    `  IF (SELECT count(*) FROM speakers) <> ${counts.speakers}`,
    `    OR (SELECT count(*) FROM quotes) <> ${counts.quotes}`,
    `    OR (SELECT count(*) FROM quote_originals) <> ${counts.quote_originals}`,
    `    OR (SELECT count(*) FROM quote_sources) <> ${counts.quote_sources}`,
    `    OR (SELECT count(*) FROM quote_original_sources) <> ${counts.quote_original_sources}`,
    `    OR (SELECT count(*) FROM editorial_decisions) <> ${counts.editorial_decisions}`,
    '  THEN',
    "    RAISE EXCEPTION 'Los recuentos posteriores no coinciden con el plan de importación';",
    '  END IF;',
    jsonbSetAssertion('speakers', records.speakers, `SELECT jsonb_build_object(
  'work_id', speaker.work_id,
  'display_name', speaker.display_name,
  'slug', speaker.slug,
  'description', speaker.description,
  'verification_status', speaker.verification_status
)
FROM speakers AS speaker`),
    jsonbSetAssertion('quotes', expectedQuotes, `SELECT jsonb_build_object(
  'id', quote.id,
  'legacy_index', quote.legacy_index,
  'text_hash', quote.text_hash,
  'highlight', quote.highlight,
  'language', quote.language,
  'quote_type', quote.quote_type,
  'author_id', quote.author_id,
  'work_id', quote.work_id,
  'speaker_work_id', speaker.work_id,
  'speaker_slug', speaker.slug,
  'speaker_display_name', quote.speaker_display_name,
  'attribution_type', quote.attribution_type,
  'legacy_attribution', quote.legacy_attribution,
  'legacy_work', quote.legacy_work,
  'source_collection', quote.source_collection,
  'has_line_breaks', quote.has_line_breaks,
  'publication_excluded', quote.publication_excluded,
  'workflow_status', quote.workflow_status,
  'visibility', quote.visibility,
  'verification_status', quote.verification_status,
  'reviewer_id', quote.reviewer_id,
  'reviewed_at', quote.reviewed_at,
  'publish_at', quote.publish_at,
  'sort', quote.sort
)
FROM quotes AS quote
LEFT JOIN speakers AS speaker ON speaker.id = quote.speaker_id`),
    jsonbSetAssertion('quote_originals', expectedOriginals, `SELECT jsonb_build_object(
  'import_key', original.import_key,
  'quote_id', original.quote_id,
  'original_text_hash', md5(original.original_text),
  'language', original.language,
  'label', original.label,
  'source_note', original.source_note,
  'is_primary', original.is_primary,
  'workflow_status', original.workflow_status,
  'visibility', original.visibility,
  'verification_status', original.verification_status,
  'reviewer_id', original.reviewer_id,
  'reviewed_at', original.reviewed_at
)
FROM quote_originals AS original`),
    jsonbSetAssertion('quote_sources', records.quote_sources, `SELECT jsonb_build_object(
  'quote_id', relation.quote_id,
  'source_id', relation.source_id,
  'relation_role', relation.relation_role,
  'notes', relation.notes,
  'sort', relation.sort
)
FROM quote_sources AS relation`),
    jsonbSetAssertion('quote_original_sources', records.quote_original_sources, `SELECT jsonb_build_object(
  'quote_original_import_key', original.import_key,
  'source_id', relation.source_id,
  'relation_role', relation.relation_role,
  'notes', relation.notes,
  'sort', relation.sort
)
FROM quote_original_sources AS relation
JOIN quote_originals AS original ON original.id = relation.quote_original_id`),
    'END',
    '$postflight$;',
  ].join('\n')}`;
}

function createSql(plan) {
  const { counts, records, source_files: sourceFiles } = plan;
  const sourceHashes = Object.entries(sourceFiles)
    .map(([filename, details]) => `-- ${filename}: ${details.sha256}`)
    .join('\n');

  return `${[
    '-- Importación de frases y originales para el piloto editorial de Páramo Literario.',
    '-- No ejecutar sin revisar primero el informe de simulación.',
    sourceHashes,
    '',
    'BEGIN;',
    '',
    'LOCK TABLE authors, works, sources IN SHARE MODE;',
    'LOCK TABLE speakers, quotes, quote_originals, quote_sources, quote_original_sources, editorial_decisions IN SHARE ROW EXCLUSIVE MODE;',
    '',
    'DO $preflight$',
    'BEGIN',
    '  IF EXISTS (SELECT 1 FROM speakers)',
    '    OR EXISTS (SELECT 1 FROM quotes)',
    '    OR EXISTS (SELECT 1 FROM quote_originals)',
    '    OR EXISTS (SELECT 1 FROM quote_sources)',
    '    OR EXISTS (SELECT 1 FROM quote_original_sources)',
    '    OR EXISTS (SELECT 1 FROM editorial_decisions)',
    '  THEN',
    "    RAISE EXCEPTION 'La importación de frases exige tablas de destino vacías';",
    '  END IF;',
    `  IF (SELECT count(*) FROM authors) <> ${counts.expected_authors}`,
    `    OR (SELECT count(*) FROM works) <> ${counts.expected_works}`,
    `    OR (SELECT count(*) FROM sources) <> ${counts.expected_sources}`,
    '  THEN',
    "    RAISE EXCEPTION 'La base editorial no coincide con las entidades padre esperadas';",
    '  END IF;',
    `  IF (SELECT count(*) FROM sources WHERE verification_status = 'verified' AND rights_status = 'cleared') <> ${counts.expected_sources}`,
    '  THEN',
    "    RAISE EXCEPTION 'Las fuentes deben sincronizarse y quedar verificadas antes de importar frases';",
    '  END IF;',
    'END',
    '$preflight$;',
    '',
    insertStatement('speakers', [
      'work_id', 'display_name', 'slug', 'description', 'verification_status',
    ], records.speakers),
    '',
    insertStatement('quotes', [
      'id', 'legacy_index', 'text', 'highlight', 'language', 'quote_type', 'author_id',
      'work_id', 'speaker_id', 'speaker_display_name', 'attribution_type',
      'legacy_attribution', 'legacy_work', 'source_collection', 'has_line_breaks',
      'text_hash', 'publication_excluded', 'workflow_status', 'visibility',
      'verification_status', 'reviewer_id', 'reviewed_at', 'publish_at', 'sort',
    ], records.quotes, {
      speaker_id: (record) => record.speaker_slug
        ? `(SELECT id FROM speakers WHERE work_id = ${sqlValue(record.speaker_work_id)} AND slug = ${sqlValue(record.speaker_slug)})`
        : 'NULL',
    }),
    '',
    insertStatement('quote_originals', [
      'import_key', 'quote_id', 'original_text', 'language', 'label', 'source_note',
      'is_primary', 'workflow_status', 'visibility', 'verification_status',
      'reviewer_id', 'reviewed_at',
    ], records.quote_originals),
    '',
    insertStatement('quote_sources', [
      'quote_id', 'source_id', 'relation_role', 'notes', 'sort',
    ], records.quote_sources),
    '',
    insertStatement('quote_original_sources', [
      'quote_original_id', 'source_id', 'relation_role', 'notes', 'sort',
    ], records.quote_original_sources, {
      quote_original_id: (record) => `(SELECT id FROM quote_originals WHERE import_key = ${sqlValue(record.quote_original_import_key)})`,
    }),
    '',
    insertStatement('editorial_decisions', [
      'quote_id', 'decision_type', 'field_name', 'old_value', 'new_value', 'reason',
      'reviewer_id', 'reviewed_at', 'status',
    ], records.editorial_decisions),
    '',
    createPostflightSql(plan),
    '',
    'COMMIT;',
    '',
  ].join('\n')}\n`;
}

async function loadInputs(blockingErrors) {
  const values = {};
  const sourceFiles = {};

  for (const filename of inputFiles) {
    try {
      const text = await readFile(path.join(editorialDirectory, filename), 'utf8');
      values[filename] = JSON.parse(text);
      sourceFiles[filename] = { sha256: sha256(text), bytes: Buffer.byteLength(text) };
    } catch (error) {
      blockingErrors.push(`${filename}: no se pudo leer o interpretar (${error.message})`);
    }
  }

  return { values, sourceFiles };
}

async function buildImportPlan() {
  const blockingErrors = [];
  const warnings = [];
  const { values, sourceFiles } = await loadInputs(blockingErrors);
  const authors = values['authors.draft.json'] || [];
  const works = values['works.draft.json'] || [];
  const sources = values['sources.draft.json'] || [];
  const quotes = values['quotes.normalized.draft.json'] || [];
  const originalsDocument = values['originals.manual.json'] || {};
  const decisionsDocument = values['editorial-decisions.json'] || {};
  const originals = originalsDocument.items || [];
  const decisions = decisionsDocument.decisions || [];

  for (const [label, value] of [
    ['authors.draft.json', authors],
    ['works.draft.json', works],
    ['sources.draft.json', sources],
    ['quotes.normalized.draft.json', quotes],
    ['originals.manual.json.items', originals],
    ['editorial-decisions.json.decisions', decisions],
  ]) {
    if (!Array.isArray(value)) blockingErrors.push(`${label} debe contener un array`);
  }

  const safeAuthors = Array.isArray(authors) ? authors : [];
  const safeWorks = Array.isArray(works) ? works : [];
  const safeSources = Array.isArray(sources) ? sources : [];
  const safeQuotes = Array.isArray(quotes) ? quotes : [];
  const safeOriginals = Array.isArray(originals) ? originals : [];
  const safeDecisions = Array.isArray(decisions) ? decisions : [];
  const authorsById = uniqueIndex(safeAuthors, 'id', 'authors.draft.json', blockingErrors);
  const worksById = uniqueIndex(safeWorks, 'id', 'works.draft.json', blockingErrors);
  const sourcesById = uniqueIndex(safeSources, 'id', 'sources.draft.json', blockingErrors);
  const quotesByLegacyIndex = uniqueIndex(
    safeQuotes,
    'legacy_index',
    'quotes.normalized.draft.json',
    blockingErrors,
  );
  const sourcesByWork = new Map();

  for (const source of safeSources) {
    if (!worksById.has(source.work_id)) {
      blockingErrors.push(`${source.id}: work_id inexistente (${source.work_id})`);
    }
    if (sourcesByWork.has(source.work_id)) {
      blockingErrors.push(`Hay más de una fuente base para ${source.work_id}`);
    }
    sourcesByWork.set(source.work_id, source);
  }

  const speakersByKey = new Map();
  const plannedQuotes = safeQuotes.map((quote) => {
    const quoteId = `quote-${quote.legacy_index}`;
    const work = worksById.get(quote.work_id);
    const source = sourcesByWork.get(quote.work_id);
    const author = authorsById.get(quote.author_id);

    if (!Number.isInteger(quote.legacy_index) || quote.legacy_index < 0) {
      blockingErrors.push(`${quoteId}: legacy_index debe ser un entero no negativo`);
    }
    if (typeof quote.text !== 'string' || !quote.text.length) {
      blockingErrors.push(`${quoteId}: el texto está vacío`);
    } else if (sha256(quote.text) !== quote.text_hash) {
      blockingErrors.push(`${quoteId}: text_hash no coincide con el texto`);
    }
    if (Boolean(quote.text?.includes('\n')) !== quote.has_line_breaks) {
      blockingErrors.push(`${quoteId}: has_line_breaks no coincide con el texto`);
    }
    if (!work) blockingErrors.push(`${quoteId}: work_id inexistente (${quote.work_id})`);
    if (!author) blockingErrors.push(`${quoteId}: author_id inexistente (${quote.author_id})`);
    if (work && work.author_id !== quote.author_id) {
      blockingErrors.push(`${quoteId}: author_id no coincide con la obra ${quote.work_id}`);
    }
    if (!source) blockingErrors.push(`${quoteId}: la obra no tiene una fuente base`);
    if (!allowedQuoteTypes.has(quote.type)) {
      blockingErrors.push(`${quoteId}: tipo no permitido (${quote.type})`);
    }
    if (!allowedAttributionTypes.has(quote.attribution_type)) {
      blockingErrors.push(`${quoteId}: attribution_type no permitido (${quote.attribution_type})`);
    }
    if (quote.attribution_type === 'ambiguous' && !quote.speaker_name) {
      blockingErrors.push(`${quoteId}: una atribución ambigua requiere speaker_name`);
    }
    if (quote.attribution_type === 'author' && quote.speaker_name) {
      blockingErrors.push(`${quoteId}: una atribución de autor no debe crear hablante`);
    }

    let speakerSlug = null;
    if (quote.speaker_name) {
      speakerSlug = slugify(quote.speaker_name);
      const speakerKey = `${quote.work_id}\0${speakerSlug}`;
      const existing = speakersByKey.get(speakerKey);
      if (existing && existing.display_name !== quote.speaker_name) {
        blockingErrors.push(
          `${quoteId}: el slug ${speakerSlug} colisiona con otro hablante de ${quote.work_id}`,
        );
      } else if (!existing) {
        speakersByKey.set(speakerKey, {
          work_id: quote.work_id,
          display_name: quote.speaker_name,
          slug: speakerSlug,
          description: null,
          verification_status: 'pending',
        });
      }
    }

    const verificationStatus = verificationFromSource(source);
    if (!verificationStatus) {
      blockingErrors.push(`${quoteId}: estado de verificación de fuente no compatible`);
    }

    return {
      id: quoteId,
      legacy_index: quote.legacy_index,
      text: quote.text,
      highlight: nullable(quote.highlight),
      language: quote.language,
      quote_type: quote.type,
      author_id: quote.author_id,
      work_id: quote.work_id,
      speaker_work_id: quote.speaker_name ? quote.work_id : null,
      speaker_slug: speakerSlug,
      speaker_display_name: nullable(quote.speaker_name),
      attribution_type: quote.attribution_type,
      legacy_attribution: nullable(quote.legacy_attribution),
      legacy_work: nullable(quote.legacy_work),
      source_collection: nullable(quote.source_collection),
      has_line_breaks: quote.has_line_breaks,
      text_hash: quote.text_hash,
      publication_excluded: false,
      workflow_status: 'draft',
      visibility: 'hidden',
      verification_status: verificationStatus || 'pending',
      reviewer_id: null,
      reviewed_at: null,
      publish_at: null,
      sort: quote.legacy_index,
      source_id: source?.id || null,
    };
  }).sort(byField('id'));

  const plannedQuotesById = new Map(plannedQuotes.map((quote) => [quote.id, quote]));
  const originalIds = new Set();
  const plannedOriginals = safeOriginals.map((original) => {
    const quote = plannedQuotesById.get(original.quote_id);
    if (!/^quote-[0-9]+$/u.test(original.quote_id)) {
      blockingErrors.push(`Original con quote_id inválido (${original.quote_id})`);
    }
    if (originalIds.has(original.quote_id)) {
      blockingErrors.push(`Hay más de un original primario para ${original.quote_id}`);
    }
    originalIds.add(original.quote_id);
    if (!quote) blockingErrors.push(`Original huérfano (${original.quote_id})`);
    if (typeof original.original_text !== 'string' || !original.original_text.length) {
      blockingErrors.push(`${original.quote_id}: original_text está vacío`);
    }
    if (!/^[a-z]{2,3}(?:-[A-Za-z0-9]+)*$/u.test(original.original_lang)) {
      blockingErrors.push(`${original.quote_id}: original_lang no es válido`);
    }
    if (typeof original.label !== 'string' || !original.label.length) {
      blockingErrors.push(`${original.quote_id}: falta label`);
    }
    if (original.status !== 'reviewed') {
      blockingErrors.push(`${original.quote_id}: status no permitido (${original.status})`);
    }
    if (typeof original.source_note !== 'string' || !original.source_note.length) {
      blockingErrors.push(`${original.quote_id}: falta source_note`);
    }

    return {
      import_key: `original-${original.quote_id}`,
      quote_id: original.quote_id,
      original_text: original.original_text,
      language: original.original_lang,
      label: original.label,
      source_note: original.source_note,
      is_primary: true,
      workflow_status: 'in_review',
      visibility: 'hidden',
      verification_status: quote?.verification_status || 'pending',
      reviewer_id: null,
      reviewed_at: null,
      source_id: quote?.source_id || null,
    };
  }).sort(byField('import_key'));

  const plannedDecisions = safeDecisions.map((decision, index) => {
    const quoteId = decision.legacy_index === null ? null : `quote-${decision.legacy_index}`;
    if (quoteId && !plannedQuotesById.has(quoteId)) {
      blockingErrors.push(`Decisión ${index}: legacy_index inexistente (${decision.legacy_index})`);
    }
    if (!allowedDecisionStatuses.has(decision.status)) {
      blockingErrors.push(`Decisión ${index}: status no permitido (${decision.status})`);
    }
    if (decision.reviewer) {
      blockingErrors.push(
        `Decisión ${index}: reviewer no puede perderse sin resolver un usuario de Directus`,
      );
    }
    return {
      quote_id: quoteId,
      decision_type: decision.decision_type,
      field_name: decision.field,
      old_value: decision.old_value,
      new_value: decision.new_value,
      reason: decision.reason,
      reviewer_id: null,
      reviewed_at: nullable(decision.reviewed_at),
      status: decision.status,
    };
  });

  const plannedSpeakers = [...speakersByKey.values()].sort((left, right) => {
    const byWork = left.work_id.localeCompare(right.work_id, 'en');
    return byWork || left.slug.localeCompare(right.slug, 'en');
  });
  const plannedQuoteSources = plannedQuotes.map((quote) => ({
    quote_id: quote.id,
    source_id: quote.source_id,
    relation_role: 'textual_source',
    notes: null,
    sort: 1,
  }));
  const plannedOriginalSources = plannedOriginals.map((original) => ({
    quote_original_import_key: original.import_key,
    source_id: original.source_id,
    relation_role: 'original_source',
    notes: null,
    sort: 1,
  }));

  for (const quote of plannedQuotes) delete quote.source_id;
  for (const original of plannedOriginals) delete original.source_id;

  const pendingQuotes = plannedQuotes.filter(
    (quote) => quote.verification_status !== 'verified',
  ).map((quote) => quote.id);
  const quotesWithoutOriginal = plannedQuotes.filter(
    (quote) => !originalIds.has(quote.id),
  ).map((quote) => quote.id);
  const pendingOriginals = plannedOriginals.filter(
    (original) => original.verification_status !== 'verified',
  ).map((original) => original.quote_id);

  if (pendingQuotes.length) warnings.push({
    code: 'quotes_with_pending_sources',
    message: `${pendingQuotes.length} frases dependen de fuentes todavía pendientes`,
    ids: pendingQuotes,
  });
  if (quotesWithoutOriginal.length) warnings.push({
    code: 'quotes_without_original',
    message: `${quotesWithoutOriginal.length} frases todavía no tienen original`,
    ids: quotesWithoutOriginal,
  });
  if (pendingOriginals.length) warnings.push({
    code: 'originals_with_pending_sources',
    message: `${pendingOriginals.length} originales dependen de fuentes todavía pendientes`,
    ids: pendingOriginals,
  });
  if (plannedSpeakers.length) warnings.push({
    code: 'speakers_pending_review',
    message: `${plannedSpeakers.length} hablantes se crearían con verificación pendiente`,
    ids: plannedSpeakers.map((speaker) => `${speaker.work_id}/${speaker.slug}`),
  });
  if (plannedOriginals.length) warnings.push({
    code: 'original_review_audit_missing',
    message: `${plannedOriginals.length} originales heredados pasarían a in_review porque no incluyen revisor ni fecha`,
  });

  const records = {
    speakers: plannedSpeakers,
    quotes: plannedQuotes,
    quote_originals: plannedOriginals,
    quote_sources: plannedQuoteSources,
    quote_original_sources: plannedOriginalSources,
    editorial_decisions: plannedDecisions,
  };

  return {
    mode: 'dry_run',
    writes_database: false,
    source_files: sourceFiles,
    counts: {
      expected_authors: authorsById.size,
      expected_works: worksById.size,
      expected_sources: sourcesById.size,
      ...Object.fromEntries(
        Object.entries(records).map(([collection, rows]) => [collection, rows.length]),
      ),
    },
    target_hashes: Object.fromEntries(
      Object.entries(records).map(([collection, rows]) => [collection, hashRecords(rows)]),
    ),
    blocking_errors: blockingErrors,
    warnings,
    records,
  };
}

function printHelp() {
  process.stdout.write(`Uso:\n  node scripts/prepare-directus-quotes-import.mjs [--dry-run]\n  node scripts/prepare-directus-quotes-import.mjs --json\n  node scripts/prepare-directus-quotes-import.mjs --sql\n\nEl script nunca conecta con PostgreSQL. --sql emite una transacción revisable por stdout.\n`);
}

function printSummary(plan) {
  process.stdout.write('Simulación de frases y originales Directus/PostgreSQL\n');
  process.stdout.write('Escrituras en la base de datos: NO\n');
  for (const [collection, count] of Object.entries(plan.counts)) {
    if (!collection.startsWith('expected_')) process.stdout.write(`  ${collection}: ${count}\n`);
  }
  process.stdout.write(`Errores bloqueantes: ${plan.blocking_errors.length}\n`);
  for (const error of plan.blocking_errors) process.stdout.write(`  ERROR: ${error}\n`);
  process.stdout.write(`Advertencias: ${plan.warnings.length}\n`);
  for (const warning of plan.warnings) {
    process.stdout.write(`  AVISO [${warning.code}]: ${warning.message}\n`);
  }
  process.stdout.write('Huellas de destino:\n');
  for (const [collection, hash] of Object.entries(plan.target_hashes)) {
    process.stdout.write(`  ${collection}: ${hash}\n`);
  }
}

async function main(argumentsList = process.argv.slice(2)) {
  for (const argument of argumentsList) {
    if (!allowedArguments.has(argument)) {
      process.stderr.write(`Argumento no reconocido: ${argument}\n`);
      process.exitCode = 2;
      return;
    }
  }

  if (argumentsList.includes('--help')) {
    printHelp();
    return;
  }
  if (argumentsList.includes('--json') && argumentsList.includes('--sql')) {
    process.stderr.write('--json y --sql no pueden usarse juntos\n');
    process.exitCode = 2;
    return;
  }

  const plan = await buildImportPlan();
  if (argumentsList.includes('--json')) {
    process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
  } else if (argumentsList.includes('--sql')) {
    if (plan.blocking_errors.length) {
      process.stderr.write('No se genera SQL porque la simulación contiene errores bloqueantes\n');
      process.exitCode = 1;
      return;
    }
    process.stdout.write(createSql(plan));
  } else {
    printSummary(plan);
  }

  if (plan.blocking_errors.length) process.exitCode = 1;
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) await main();

export { buildImportPlan, createSql };
