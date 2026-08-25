#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePublicDocument } from './export-directus-quotes-preview.mjs';
import { atomicReplaceArtifact, sha256 } from './lib/atomic-json-artifact.mjs';

const BACKUP_DIRECTORY = '/var/lib/paramo-directus/publication-backups';
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const targetPath = path.join(projectRoot, 'public', 'data', 'quotes.json');

function ensureBackupPath(rawPath) {
  const resolved = path.resolve(rawPath);
  if (!resolved.startsWith(`${BACKUP_DIRECTORY}/`)) {
    throw new Error(`La copia debe estar dentro de ${BACKUP_DIRECTORY}`);
  }
  return resolved;
}

function parseArguments(argv) {
  const result = {
    backupPath: null,
    confirmAction: null,
    confirmBackupSha: null,
    confirmCurrentPublicSha: null,
    help: false,
    restore: false,
  };
  for (const argument of argv) {
    if (argument === '--help') result.help = true;
    else if (argument === '--restore') result.restore = true;
    else if (argument.startsWith('--backup=')) result.backupPath = argument.slice('--backup='.length);
    else if (argument.startsWith('--confirm-action=')) {
      result.confirmAction = argument.slice('--confirm-action='.length);
    } else if (argument.startsWith('--confirm-backup-sha=')) {
      result.confirmBackupSha = argument.slice('--confirm-backup-sha='.length).toLowerCase();
    } else if (argument.startsWith('--confirm-current-public-sha=')) {
      result.confirmCurrentPublicSha = argument.slice('--confirm-current-public-sha='.length).toLowerCase();
    } else throw new Error(`Argumento no reconocido: ${argument}`);
  }
  if (!result.help) result.backupPath = ensureBackupPath(result.backupPath || '');
  return result;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    process.stdout.write('Uso: node scripts/restore-directus-quotes-backup.mjs --backup=<ruta> [--restore y confirmaciones]\n');
    process.stdout.write('Restaura el repositorio; el despliegue web sigue siendo una acción separada.\n');
    return;
  }
  const [backupText, currentText] = await Promise.all([
    readFile(options.backupPath, 'utf8'),
    readFile(targetPath, 'utf8'),
  ]);
  validatePublicDocument(JSON.parse(backupText));
  validatePublicDocument(JSON.parse(currentText));
  const backupSha = sha256(backupText);
  const currentSha = sha256(currentText);
  if (!options.restore) {
    process.stdout.write(`${JSON.stringify({
      mode: 'dry-run',
      backup: options.backupPath,
      target: targetPath,
      backup_sha256: backupSha,
      current_public_sha256: currentSha,
      would_change: backupSha !== currentSha,
      writes_public_files: false,
      deploys_web: false,
    }, null, 2)}\n`);
    return;
  }
  const errors = [];
  if (options.confirmAction !== 'RESTORE_QUOTES') errors.push('falta --confirm-action=RESTORE_QUOTES');
  if (options.confirmBackupSha !== backupSha) errors.push('--confirm-backup-sha no coincide');
  if (options.confirmCurrentPublicSha !== currentSha) {
    errors.push('--confirm-current-public-sha no coincide');
  }
  if (errors.length) throw new Error(errors.join('; '));
  if (backupSha === currentSha) throw new Error('La copia y el JSON vigente son idénticos');

  const replacement = await atomicReplaceArtifact({
    backupDirectory: BACKUP_DIRECTORY,
    candidatePath: options.backupPath,
    expectedCandidateSha: backupSha,
    expectedCurrentSha: currentSha,
    operationId: `restore-${Date.now()}`,
    targetPath,
  });
  process.stdout.write(`${JSON.stringify({
    mode: 'restore',
    target: targetPath,
    deploys_web: false,
    replacement,
  }, null, 2)}\n`);
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main().catch((error) => {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exitCode = 1;
  });
}

export { ensureBackupPath, parseArguments };
