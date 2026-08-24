import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildSyncPlan,
  createReadOnlyCheckSql,
  createSql,
} from '../scripts/prepare-directus-sources-sync.mjs';

test('la sincronización de fuentes exige un catálogo completamente verificado', async () => {
  const plan = await buildSyncPlan();

  assert.equal(plan.mode, 'dry_run');
  assert.equal(plan.writes_database, false);
  assert.deepEqual(plan.blocking_errors, []);
  assert.equal(plan.counts.sources_to_compare, 29);
  assert.equal(plan.counts.sources_changed_since_initial_import, 20);
  assert.equal(plan.counts.verified_sources_after, 29);
  assert.equal(plan.counts.cleared_sources_after, 29);
  assert.ok(plan.records.sources.every((source) => (
    source.verification_status === 'verified' && source.rights_status === 'cleared'
  )));
});

test('el SQL sincroniza solo cambios y protege la fotografía inicial', async () => {
  const plan = await buildSyncPlan();
  const sql = createSql(plan);

  assert.match(sql, /BEGIN;/u);
  assert.match(sql, /Los estados de las fuentes no coinciden con la fotografía previa/u);
  assert.match(sql, /segunda importación no haya comenzado/u);
  assert.match(sql, /UPDATE sources AS target/u);
  assert.match(sql, /IS DISTINCT FROM/u);
  assert.match(sql, /date_updated = now\(\)/u);
  assert.match(sql, /comprobación posterior detectó fuentes diferentes/u);
  assert.doesNotMatch(sql, /INSERT INTO sources/u);
  assert.doesNotMatch(sql, /DELETE FROM/u);
  assert.match(sql, /COMMIT;\s*$/u);
});

test('la comprobación SQL no puede escribir en PostgreSQL', async () => {
  const plan = await buildSyncPlan();
  const sql = createReadOnlyCheckSql(plan);

  assert.match(sql, /SET TRANSACTION READ ONLY;/u);
  assert.match(sql, /EXPLAIN WITH incoming/u);
  assert.match(sql, /ROLLBACK;\s*$/u);
  assert.doesNotMatch(sql, /COMMIT;/u);
});
