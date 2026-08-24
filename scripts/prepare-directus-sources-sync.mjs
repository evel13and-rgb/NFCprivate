#!/usr/bin/env node

import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildImportPlan as buildBaseImportPlan } from './prepare-directus-base-import.mjs';

const allowedArguments = new Set([
  '--dry-run',
  '--json',
  '--sql',
  '--check-sql',
  '--help',
]);

const sourceColumns = [
  'id',
  'source_type',
  'citation_label',
  'creator',
  'institution',
  'title',
  'edition',
  'publisher',
  'publication_year',
  'pages',
  'translator_name',
  'source_url',
  'bibliographic_identifiers',
  'accessed_at',
  'language',
  'rights_status',
  'rights_notes',
  'verification_status',
  'notes',
];

const mutableSourceColumns = sourceColumns.filter((column) => column !== 'id');

const expectedDatabaseBefore = {
  authors: 27,
  works: 29,
  work_contributors: 29,
  sources: 29,
  work_sources: 29,
  verified_sources: 20,
  pending_sources: 9,
  cleared_sources: 20,
  unchecked_sources: 9,
  changed_sources_since_initial_import: 20,
};

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
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

function sourceSqlValue(column, value) {
  if (column === 'accessed_at') return `${sqlValue(value)}::date`;
  if (column === 'publication_year') return `${sqlValue(value)}::smallint`;
  return sqlValue(value);
}

function incomingCte(records) {
  const values = records
    .map((record) => `  (${sourceColumns.map((column) => (
      sourceSqlValue(column, record[column])
    )).join(', ')})`)
    .join(',\n');
  return `WITH incoming (${sourceColumns.join(', ')}) AS (VALUES\n${values}\n)`;
}

function expectedIdsCte(records) {
  const values = records.map((record) => `(${sqlValue(record.id)})`).join(', ');
  return `WITH expected(id) AS (VALUES ${values})`;
}

function sourceRowsDiffer(leftAlias, rightAlias) {
  const left = mutableSourceColumns.map((column) => `${leftAlias}.${column}`).join(', ');
  const right = mutableSourceColumns.map((column) => `${rightAlias}.${column}`).join(', ');
  return `ROW(${left}) IS DISTINCT FROM ROW(${right})`;
}

function createPreflightSql(plan) {
  const { database_preflight: expected, records } = plan;
  return `${[
    'DO $preflight$',
    'BEGIN',
    `  IF (SELECT count(*) FROM authors) <> ${expected.authors}`,
    `    OR (SELECT count(*) FROM works) <> ${expected.works}`,
    `    OR (SELECT count(*) FROM work_contributors) <> ${expected.work_contributors}`,
    `    OR (SELECT count(*) FROM sources) <> ${expected.sources}`,
    `    OR (SELECT count(*) FROM work_sources) <> ${expected.work_sources}`,
    '  THEN',
    "    RAISE EXCEPTION 'La base editorial no coincide con la carga inicial esperada';",
    '  END IF;',
    `  IF (SELECT count(*) FROM sources WHERE verification_status = 'verified') <> ${expected.verified_sources}`,
    `    OR (SELECT count(*) FROM sources WHERE verification_status = 'pending') <> ${expected.pending_sources}`,
    `    OR (SELECT count(*) FROM sources WHERE rights_status = 'cleared') <> ${expected.cleared_sources}`,
    `    OR (SELECT count(*) FROM sources WHERE rights_status = 'unchecked') <> ${expected.unchecked_sources}`,
    '  THEN',
    "    RAISE EXCEPTION 'Los estados de las fuentes no coinciden con la fotografía previa';",
    '  END IF;',
    '  IF EXISTS (SELECT 1 FROM speakers)',
    '    OR EXISTS (SELECT 1 FROM quotes)',
    '    OR EXISTS (SELECT 1 FROM quote_originals)',
    '    OR EXISTS (SELECT 1 FROM quote_sources)',
    '    OR EXISTS (SELECT 1 FROM quote_original_sources)',
    '    OR EXISTS (SELECT 1 FROM editorial_decisions)',
    '  THEN',
    "    RAISE EXCEPTION 'La sincronización de fuentes exige que la segunda importación no haya comenzado';",
    '  END IF;',
    '  IF EXISTS (',
    `    ${expectedIdsCte(records.sources)}`,
    '    (SELECT id FROM sources EXCEPT SELECT id FROM expected)',
    '    UNION ALL',
    '    (SELECT id FROM expected EXCEPT SELECT id FROM sources)',
    '  )',
    '  THEN',
    "    RAISE EXCEPTION 'Los identificadores de fuentes no coinciden con el catálogo definitivo';",
    '  END IF;',
    'END',
    '$preflight$;',
  ].join('\n')}`;
}

function createUpdateSql(plan, explain = false) {
  const assignments = mutableSourceColumns
    .map((column) => `    ${column} = incoming.${column}`)
    .join(',\n');
  return `${explain ? 'EXPLAIN ' : ''}${incomingCte(plan.records.sources)},
updated AS (
  UPDATE sources AS target
  SET
${assignments},
    date_updated = now()
  FROM incoming
  WHERE target.id = incoming.id
    AND ${sourceRowsDiffer('target', 'incoming')}
  RETURNING target.id
)
SELECT count(*) AS synchronized_sources FROM updated;`;
}

function createPostflightSql(plan) {
  return `${[
    'DO $postflight$',
    'BEGIN',
    '  IF EXISTS (',
    `    ${incomingCte(plan.records.sources)}`,
    '    SELECT 1',
    '    FROM incoming',
    '    LEFT JOIN sources AS target USING (id)',
    `    WHERE target.id IS NULL OR ${sourceRowsDiffer('target', 'incoming')}`,
    '  )',
    '  THEN',
    "    RAISE EXCEPTION 'La comprobación posterior detectó fuentes diferentes del catálogo';",
    '  END IF;',
    'END',
    '$postflight$;',
  ].join('\n')}`;
}

function createSql(plan) {
  const sourceDetails = plan.source_files['sources.draft.json'];
  return `${[
    '-- Sincronización de fuentes tras completar la auditoría literaria.',
    '-- No crea ni elimina fuentes; actualiza únicamente campos que hayan cambiado.',
    `-- sources.draft.json: ${sourceDetails.sha256}`,
    '',
    'BEGIN;',
    '',
    'LOCK TABLE authors, works, work_contributors, sources, work_sources IN SHARE ROW EXCLUSIVE MODE;',
    'LOCK TABLE speakers, quotes, quote_originals, quote_sources, quote_original_sources, editorial_decisions IN SHARE MODE;',
    '',
    createPreflightSql(plan),
    '',
    createUpdateSql(plan),
    '',
    createPostflightSql(plan),
    '',
    'COMMIT;',
    '',
  ].join('\n')}\n`;
}

function createReadOnlyCheckSql(plan) {
  return `${[
    '-- Validación de solo lectura de la sincronización de fuentes.',
    'BEGIN;',
    'SET TRANSACTION READ ONLY;',
    '',
    createPreflightSql(plan),
    '',
    createUpdateSql(plan, true),
    '',
    'ROLLBACK;',
    '',
  ].join('\n')}\n`;
}

async function buildSyncPlan() {
  const basePlan = await buildBaseImportPlan();
  const sources = basePlan.records.sources;
  const verifiedSources = sources.filter(
    (source) => source.verification_status === 'verified',
  ).length;
  const clearedSources = sources.filter((source) => source.rights_status === 'cleared').length;
  const blockingErrors = [...basePlan.blocking_errors];

  if (sources.length !== expectedDatabaseBefore.sources) {
    blockingErrors.push(
      `Se esperaban ${expectedDatabaseBefore.sources} fuentes y el catálogo contiene ${sources.length}`,
    );
  }
  if (verifiedSources !== sources.length || clearedSources !== sources.length) {
    blockingErrors.push('Todas las fuentes deben estar verificadas y con derechos despejados');
  }

  return {
    mode: 'dry_run',
    writes_database: false,
    source_files: {
      'sources.draft.json': basePlan.source_files['sources.draft.json'],
    },
    database_preflight: expectedDatabaseBefore,
    counts: {
      sources_to_compare: sources.length,
      sources_changed_since_initial_import:
        expectedDatabaseBefore.changed_sources_since_initial_import,
      verified_sources_after: verifiedSources,
      cleared_sources_after: clearedSources,
    },
    target_hash: sha256(`${JSON.stringify(sources)}\n`),
    blocking_errors: blockingErrors,
    warnings: [{
      code: 'direct_sql_without_directus_activity',
      message: 'La sincronización SQL no generará entradas individuales en el historial de Directus',
    }],
    records: { sources },
  };
}

function printHelp() {
  process.stdout.write('Uso:\n');
  process.stdout.write('  node scripts/prepare-directus-sources-sync.mjs [--dry-run]\n');
  process.stdout.write('  node scripts/prepare-directus-sources-sync.mjs --json\n');
  process.stdout.write('  node scripts/prepare-directus-sources-sync.mjs --sql\n');
  process.stdout.write('  node scripts/prepare-directus-sources-sync.mjs --check-sql\n\n');
  process.stdout.write('El script no conecta con PostgreSQL. --check-sql emite una validación de solo lectura.\n');
}

function printSummary(plan) {
  process.stdout.write('Simulación de sincronización de fuentes Directus/PostgreSQL\n');
  process.stdout.write('Escrituras en la base de datos: NO\n');
  for (const [name, count] of Object.entries(plan.counts)) {
    process.stdout.write(`  ${name}: ${count}\n`);
  }
  process.stdout.write(`Errores bloqueantes: ${plan.blocking_errors.length}\n`);
  for (const error of plan.blocking_errors) process.stdout.write(`  ERROR: ${error}\n`);
  process.stdout.write(`Advertencias: ${plan.warnings.length}\n`);
  for (const warning of plan.warnings) {
    process.stdout.write(`  AVISO [${warning.code}]: ${warning.message}\n`);
  }
  process.stdout.write(`Huella de destino: ${plan.target_hash}\n`);
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

  const outputModes = ['--json', '--sql', '--check-sql'].filter((mode) => (
    argumentsList.includes(mode)
  ));
  if (outputModes.length > 1) {
    process.stderr.write('--json, --sql y --check-sql no pueden combinarse\n');
    process.exitCode = 2;
    return;
  }

  const plan = await buildSyncPlan();
  if (argumentsList.includes('--json')) {
    process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
  } else if (argumentsList.includes('--sql')) {
    if (plan.blocking_errors.length) {
      process.stderr.write('No se genera SQL porque hay errores bloqueantes\n');
      process.exitCode = 1;
      return;
    }
    process.stdout.write(createSql(plan));
  } else if (argumentsList.includes('--check-sql')) {
    if (plan.blocking_errors.length) {
      process.stderr.write('No se genera SQL porque hay errores bloqueantes\n');
      process.exitCode = 1;
      return;
    }
    process.stdout.write(createReadOnlyCheckSql(plan));
  } else {
    printSummary(plan);
  }

  if (plan.blocking_errors.length) process.exitCode = 1;
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) await main();

export {
  buildSyncPlan,
  createReadOnlyCheckSql,
  createSql,
};
