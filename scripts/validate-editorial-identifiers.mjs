import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const editorialDirectory = path.join(projectRoot, 'data', 'editorial');

function fail(message) {
  throw new Error(`Identificadores editoriales inválidos: ${message}`);
}

async function load(filename) {
  return JSON.parse(await readFile(path.join(editorialDirectory, filename), 'utf8'));
}

const [registry, authors, works] = await Promise.all([
  load('stable-identifiers.json'),
  load('authors.draft.json'),
  load('works.draft.json'),
]);

if (registry?.schema_version !== 1
  || !registry.authors || Array.isArray(registry.authors)
  || !registry.works || Array.isArray(registry.works)) {
  fail('stable-identifiers.json no cumple schema_version 1');
}

for (const [collection, records, identityField, prefix] of [
  ['authors', authors, 'canonical_name', 'author-'],
  ['works', works, 'legacy_work', 'work-'],
]) {
  if (!Array.isArray(records)) fail(`${collection} no es un array`);
  const entries = Object.entries(registry[collection]);
  const ids = entries.map(([, id]) => id);
  if (new Set(ids).size !== ids.length) fail(`${collection} contiene IDs repetidos en el registro`);
  if (ids.some(id => typeof id !== 'string' || !id.startsWith(prefix))) {
    fail(`${collection} contiene un ID sin el prefijo ${prefix}`);
  }
  const identities = new Set(records.map(record => record?.[identityField]));
  for (const record of records) {
    const identity = record?.[identityField];
    if (registry[collection][identity] !== record?.id) {
      fail(`${collection}: ${identity} no conserva el ID ${record?.id}`);
    }
  }
  const stale = entries.map(([identity]) => identity).filter(identity => !identities.has(identity));
  if (stale.length) fail(`${collection} conserva identidades inexistentes: ${stale.join(', ')}`);
}

console.log(`Identificadores estables v1: ${authors.length} autor(es), ${works.length} obra(s).`);
