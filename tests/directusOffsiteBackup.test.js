import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const scriptPath = new URL('../ops/directus/offsite-backup.sh', import.meta.url);
const examplePath = new URL('../ops/directus/restic.env.example', import.meta.url);
const backupServicePath = new URL(
  '../ops/directus/systemd/paramo-directus-offsite-backup.service',
  import.meta.url,
);
const backupTimerPath = new URL(
  '../ops/directus/systemd/paramo-directus-offsite-backup.timer',
  import.meta.url,
);
const restoreServicePath = new URL(
  '../ops/directus/systemd/paramo-directus-offsite-restore-test.service',
  import.meta.url,
);
const restoreTimerPath = new URL(
  '../ops/directus/systemd/paramo-directus-offsite-restore-test.timer',
  import.meta.url,
);

test('restic cifra el directorio de copias y rechaza una copia local antigua', async () => {
  const script = await readFile(scriptPath, 'utf8');
  assert.match(script, /restic_command backup "\$BACKUP_DIRECTORY"/u);
  assert.match(script, /encrypted_before_upload: true/u);
  assert.match(script, /MAX_BACKUP_AGE_SECONDS=129600/u);
  assert.match(script, /validate_backup_triplet/u);
  assert.match(script, /sha256sum --check --status/u);
});

test('la retención externa conserva treinta diarias, doce semanales y doce mensuales', async () => {
  const script = await readFile(scriptPath, 'utf8');
  assert.match(script, /readonly KEEP_DAILY=30/u);
  assert.match(script, /readonly KEEP_WEEKLY=12/u);
  assert.match(script, /readonly KEEP_MONTHLY=12/u);
  assert.match(script, /restic_command forget/u);
  assert.match(script, /--prune/u);
});

test('la prueba externa comprueba el repositorio, restaura y valida el hash', async () => {
  const script = await readFile(scriptPath, 'utf8');
  assert.match(script, /restic_command check/u);
  assert.match(script, /restic_command restore latest/u);
  assert.match(script, /checksum_verified: true/u);
  assert.match(script, /temporary_files_removed: true/u);
});

test('el ejemplo no contiene credenciales y limita su configuración a archivos privados', async () => {
  const [script, example] = await Promise.all([
    readFile(scriptPath, 'utf8'),
    readFile(examplePath, 'utf8'),
  ]);
  assert.match(example, /REEMPLAZAR_BUCKET_PRIVADO/u);
  assert.match(example, /REEMPLAZAR_CON_KEY_ID_LIMITADA_AL_BUCKET/u);
  assert.match(example, /REEMPLAZAR_CON_APPLICATION_KEY_LIMITADA_AL_BUCKET/u);
  assert.doesNotMatch(example, /[A-Za-z0-9]{40}/u);
  assert.match(script, /pertenecer a root y tener modo 0600/u);
  assert.doesNotMatch(script, /AWS_SECRET_ACCESS_KEY[^\n]*printf/u);
});

test('systemd programa envío diario y restauración semanal con límites de recursos', async () => {
  const [backupService, backupTimer, restoreService, restoreTimer] = await Promise.all([
    readFile(backupServicePath, 'utf8'),
    readFile(backupTimerPath, 'utf8'),
    readFile(restoreServicePath, 'utf8'),
    readFile(restoreTimerPath, 'utf8'),
  ]);
  assert.match(backupTimer, /OnCalendar=\*-\*-\* 04:10:00 UTC/u);
  assert.match(restoreTimer, /OnCalendar=Sun \*-\*-\* 05:30:00 UTC/u);
  assert.match(backupService, /MemoryMax=512M/u);
  assert.match(restoreService, /MemoryMax=512M/u);
  assert.match(backupService, /ConditionPathExists=\/etc\/paramoliterario\/directus\/restic\.env/u);
  assert.match(restoreService, /CacheDirectory=paramo-restic/u);
});
