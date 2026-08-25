import { createHash } from 'node:crypto';
import {
  mkdir,
  open,
  readFile,
  rename,
  stat,
  unlink,
} from 'node:fs/promises';
import path from 'node:path';

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function writeDurableExclusive(filePath, value, mode) {
  const handle = await open(filePath, 'wx', mode);
  try {
    await handle.writeFile(value, 'utf8');
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function syncDirectory(directory) {
  let handle;
  try {
    handle = await open(directory, 'r');
    await handle.sync();
  } catch {
    // Algunos sistemas de archivos no permiten fsync sobre directorios.
  } finally {
    if (handle) await handle.close();
  }
}

function safeOperationId(value) {
  const normalized = String(value).replace(/[^a-zA-Z0-9_-]+/gu, '-');
  if (!normalized || normalized.length > 96) {
    throw new Error('Identificador de operación no válido');
  }
  return normalized;
}

function backupFileName(targetPath, currentSha, operationId, now) {
  const timestamp = now.toISOString().replace(/[:.]/gu, '-');
  return `${path.basename(targetPath)}.${timestamp}.${currentSha.slice(0, 12)}.${safeOperationId(operationId)}.bak`;
}

async function atomicReplaceArtifact({
  backupDirectory,
  candidatePath,
  expectedCandidateSha,
  expectedCurrentSha,
  now = new Date(),
  operationId,
  targetPath,
}) {
  const [currentText, candidateText, targetStat] = await Promise.all([
    readFile(targetPath, 'utf8'),
    readFile(candidatePath, 'utf8'),
    stat(targetPath),
  ]);
  const currentSha = sha256(currentText);
  const candidateSha = sha256(candidateText);
  if (currentSha !== expectedCurrentSha) {
    throw new Error(`El artefacto vigente cambió: ${currentSha}`);
  }
  if (candidateSha !== expectedCandidateSha) {
    throw new Error(`El candidato cambió: ${candidateSha}`);
  }
  if (currentSha === candidateSha) {
    return {
      backup_path: null,
      backup_sha256: null,
      changed: false,
      current_sha256: currentSha,
      published_sha256: candidateSha,
      rolled_back_automatically: false,
    };
  }

  await mkdir(backupDirectory, { recursive: true, mode: 0o700 });
  const backupPath = path.join(
    backupDirectory,
    backupFileName(targetPath, currentSha, operationId, now),
  );
  await writeDurableExclusive(backupPath, currentText, 0o600);

  const temporaryPath = path.join(
    path.dirname(targetPath),
    `.${path.basename(targetPath)}.${safeOperationId(operationId)}.${process.pid}.tmp`,
  );
  let replaced = false;
  try {
    const currentImmediatelyBeforeWrite = sha256(await readFile(targetPath, 'utf8'));
    if (currentImmediatelyBeforeWrite !== expectedCurrentSha) {
      throw new Error(`El artefacto vigente cambió durante la operación: ${currentImmediatelyBeforeWrite}`);
    }
    await writeDurableExclusive(temporaryPath, candidateText, targetStat.mode & 0o777);
    await rename(temporaryPath, targetPath);
    replaced = true;
    await syncDirectory(path.dirname(targetPath));

    const publishedSha = sha256(await readFile(targetPath, 'utf8'));
    if (publishedSha !== candidateSha) {
      throw new Error(`La verificación posterior devolvió un hash inesperado: ${publishedSha}`);
    }
    return {
      backup_path: backupPath,
      backup_sha256: currentSha,
      changed: true,
      current_sha256: currentSha,
      published_sha256: publishedSha,
      rolled_back_automatically: false,
    };
  } catch (error) {
    try {
      await unlink(temporaryPath);
    } catch {
      // El temporal puede no existir si rename ya se completó.
    }
    if (replaced) {
      const rollbackTemporaryPath = `${temporaryPath}.rollback`;
      await writeDurableExclusive(rollbackTemporaryPath, currentText, targetStat.mode & 0o777);
      await rename(rollbackTemporaryPath, targetPath);
      await syncDirectory(path.dirname(targetPath));
      error.rolledBackAutomatically = true;
    }
    throw error;
  }
}

export {
  atomicReplaceArtifact,
  backupFileName,
  safeOperationId,
  sha256,
};
