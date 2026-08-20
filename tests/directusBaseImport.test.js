import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  buildImportPlan,
  createSql,
} from '../scripts/prepare-directus-base-import.mjs';

const testsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testsDirectory, '..');
const editorialDirectory = path.join(projectRoot, 'data', 'editorial');

function readEditorial(filename) {
  return JSON.parse(readFileSync(path.join(editorialDirectory, filename), 'utf8'));
}

test('la simulación base refleja las fuentes actuales sin escribir ni hacer público contenido', async () => {
  const plan = await buildImportPlan();
  const authors = readEditorial('authors.draft.json');
  const works = readEditorial('works.draft.json');
  const sources = readEditorial('sources.draft.json');

  assert.equal(plan.mode, 'dry_run');
  assert.equal(plan.writes_database, false);
  assert.deepEqual(plan.blocking_errors, []);
  assert.equal(plan.counts.authors, authors.length);
  assert.equal(plan.counts.works, works.length);
  assert.equal(plan.counts.work_contributors, works.length);
  assert.equal(plan.counts.sources, sources.length);
  assert.equal(plan.counts.work_sources, sources.length);

  assert.ok(plan.records.authors.every((author) => author.visibility === 'hidden'));
  assert.ok(plan.records.works.every((work) => work.visibility === 'hidden'));
  assert.equal(
    plan.records.sources.filter((source) => source.citation_label.startsWith('Fuente pendiente'))
      .length,
    sources.filter((source) => source.citation_label === null).length,
  );
});

test('el SQL generado es transaccional y rechaza destinos que ya tengan datos', async () => {
  const plan = await buildImportPlan();
  const sql = createSql(plan);

  assert.match(sql, /BEGIN;/u);
  assert.match(sql, /La importación base exige tablas de destino vacías/u);
  assert.match(sql, /INSERT INTO authors/u);
  assert.match(sql, /INSERT INTO works/u);
  assert.match(sql, /INSERT INTO sources/u);
  assert.match(sql, /COMMIT;\s*$/u);
});
