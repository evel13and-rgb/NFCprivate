import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const backupScriptPath = new URL('../ops/directus/backup-database.sh', import.meta.url);
const restoreScriptPath = new URL('../ops/directus/test-database-restore.sh', import.meta.url);
const backupTimerPath = new URL(
  '../ops/directus/systemd/paramo-directus-backup.timer',
  import.meta.url,
);
const restoreTimerPath = new URL(
  '../ops/directus/systemd/paramo-directus-restore-test.timer',
  import.meta.url,
);

test('la retención solo alcanza copias automáticas y conserva catorce', async () => {
  const script = await readFile(backupScriptPath, 'utf8');
  assert.match(script, /readonly RETENTION_COUNT=14/u);
  assert.match(script, /\^daily-paramo-editorial-/u);
  assert.doesNotMatch(script, /\.sql\.gz/u);
  assert.match(script, /manual_backups_affected: false/u);
});

test('la restauración usa una base temporal sin red y compara recuentos', async () => {
  const script = await readFile(restoreScriptPath, 'utf8');
  assert.match(script, /--network none/u);
  assert.match(script, /--tmpfs \/var\/lib\/postgresql\/data/u);
  assert.match(script, /\$expected == \$actual/u);
  assert.match(script, /source_database_untouched: true/u);
});

test('las copias son diarias y la restauración se prueba semanalmente', async () => {
  const [backupTimer, restoreTimer] = await Promise.all([
    readFile(backupTimerPath, 'utf8'),
    readFile(restoreTimerPath, 'utf8'),
  ]);
  assert.match(backupTimer, /OnCalendar=\*-\*-\* 03:35:00 UTC/u);
  assert.match(backupTimer, /Persistent=true/u);
  assert.match(restoreTimer, /OnCalendar=Sun \*-\*-\* 04:30:00 UTC/u);
  assert.match(restoreTimer, /Persistent=true/u);
});
