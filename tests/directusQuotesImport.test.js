import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  buildImportPlan,
  createSql,
} from '../scripts/prepare-directus-quotes-import.mjs';

const testsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testsDirectory, '..');
const editorialDirectory = path.join(projectRoot, 'data', 'editorial');

function readEditorial(filename) {
  return JSON.parse(readFileSync(path.join(editorialDirectory, filename), 'utf8'));
}

test('la simulación de frases refleja el catálogo sin escribir ni publicar contenido', async () => {
  const plan = await buildImportPlan();
  const quotes = readEditorial('quotes.normalized.draft.json');
  const originals = readEditorial('originals.manual.json').items;

  assert.equal(plan.mode, 'dry_run');
  assert.equal(plan.writes_database, false);
  assert.deepEqual(plan.blocking_errors, []);
  assert.equal(plan.counts.quotes, quotes.length);
  assert.equal(plan.counts.quote_originals, originals.length);
  assert.equal(plan.counts.quote_sources, quotes.length);
  assert.equal(plan.counts.quote_original_sources, originals.length);
  assert.equal(plan.counts.editorial_decisions, 0);

  assert.ok(plan.records.quotes.every((quote) => (
    quote.visibility === 'hidden' && quote.workflow_status === 'draft'
  )));
  assert.ok(plan.records.quote_originals.every((original) => (
    original.visibility === 'hidden' && original.workflow_status === 'in_review'
  )));
});

test('la simulación conserva hablantes y relaciones editoriales completas', async () => {
  const plan = await buildImportPlan();
  const quoteIds = new Set(plan.records.quotes.map((quote) => quote.id));
  const sourceIds = new Set(readEditorial('sources.draft.json').map((source) => source.id));

  assert.equal(plan.counts.speakers, 14);
  assert.equal(plan.records.quote_sources.length, quoteIds.size);
  assert.ok(plan.records.quote_sources.every((relation) => (
    quoteIds.has(relation.quote_id) && sourceIds.has(relation.source_id)
  )));
  assert.ok(plan.records.quote_original_sources.every((relation) => (
    sourceIds.has(relation.source_id)
  )));
  assert.ok(plan.records.speakers.every((speaker) => speaker.verification_status === 'pending'));
});

test('el SQL de frases es transaccional y exige una base piloto intacta', async () => {
  const plan = await buildImportPlan();
  const sql = createSql(plan);

  assert.match(sql, /BEGIN;/u);
  assert.match(sql, /La importación de frases exige tablas de destino vacías/u);
  assert.match(sql, /La base editorial no coincide con las entidades padre esperadas/u);
  assert.match(sql, /Las fuentes deben sincronizarse y quedar verificadas/u);
  assert.match(sql, /INSERT INTO speakers/u);
  assert.match(sql, /INSERT INTO quotes/u);
  assert.match(sql, /INSERT INTO quote_originals/u);
  assert.match(sql, /INSERT INTO quote_sources/u);
  assert.match(sql, /INSERT INTO quote_original_sources/u);
  assert.doesNotMatch(sql, /INSERT INTO editorial_decisions/u);
  assert.match(sql, /Los recuentos posteriores no coinciden/u);
  assert.match(sql, /La verificación posterior no coincide en quotes/u);
  assert.match(sql, /La verificación posterior no coincide en quote_originals/u);
  assert.match(sql, /COMMIT;\s*$/u);
});
