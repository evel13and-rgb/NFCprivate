import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const editorialDirectory = path.join(projectRoot, 'data', 'editorial');
const outputPath = path.join(projectRoot, 'public', 'data', 'literary-profiles.json');

const authorFields = [
  'author_id',
  'display_name',
  'birth_year',
  'death_year',
  'country',
  'language',
  'period',
  'movement',
  'bio_short',
  'bio_long',
  'themes',
  'tone_notes',
  'why_in_paramo',
  'information_sources',
  'portrait',
];
const workFields = [
  'work_id',
  'title',
  'display_title',
  'original_title',
  'author_id',
  'publication_year',
  'genre',
  'language',
  'summary_short',
  'summary_long',
  'context_notes',
  'themes',
  'tone_notes',
  'fragment_notes',
  'why_in_paramo',
  'information_sources',
  'fragment_count',
];
const forbiddenFields = new Set([
  'source_notes',
  'sources',
  'profile_status',
  'rights_notes',
  'verification_status',
  'updated_at',
  'notes',
  'editorial_notes',
]);

async function loadArray(filename) {
  const filePath = path.join(editorialDirectory, filename);
  const value = JSON.parse(await readFile(filePath, 'utf8'));
  if (!Array.isArray(value)) {
    throw new Error(`${filename} debe contener un array`);
  }
  return value;
}

function nullable(value) {
  return value === undefined ? null : value;
}

function publicInformationSources(profile) {
  const value = profile.information_sources ?? profile.sources ?? profile.source_notes;
  const items = Array.isArray(value) ? value : [value];
  const sources = items
    .filter(item => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean);
  return sources.length ? sources : null;
}

function countFragmentsByWork(quotes) {
  const counts = new Map();
  for (const quote of quotes) {
    if (typeof quote?.work_id !== 'string' || !quote.work_id.trim()) continue;
    counts.set(quote.work_id, (counts.get(quote.work_id) ?? 0) + 1);
  }
  return counts;
}

function assertPublicDocument(document) {
  if (!document || !Array.isArray(document.authors) || !Array.isArray(document.works)) {
    throw new Error('El documento público debe contener los arrays authors y works');
  }

  for (const [collection, records, fields, idField, idPrefix] of [
    ['authors', document.authors, authorFields, 'author_id', 'author-'],
    ['works', document.works, workFields, 'work_id', 'work-'],
  ]) {
    const ids = new Set();
    for (const [position, record] of records.entries()) {
      const label = `${collection}[${position}]`;
      const keys = Object.keys(record);
      const unexpected = keys.filter(key => !fields.includes(key));
      const missing = fields.filter(key => !keys.includes(key));
      if (unexpected.length) throw new Error(`${label}: campos no públicos (${unexpected.join(', ')})`);
      if (missing.length) throw new Error(`${label}: faltan campos (${missing.join(', ')})`);
    if (typeof record[idField] !== 'string' || !record[idField].startsWith(idPrefix)) {
        throw new Error(`${label}.${idField} debe comenzar por ${idPrefix}`);
      }
      if (ids.has(record[idField])) throw new Error(`${label}: id duplicado (${record[idField]})`);
      ids.add(record[idField]);
      if (!Array.isArray(record.themes)) throw new Error(`${label}.themes debe ser un array`);
      if (collection === 'authors' && record.portrait !== null) {
        const portrait = record.portrait;
        const portraitFields = [
          'path', 'alt', 'caption', 'credit', 'source_url', 'rights', 'object_position',
        ];
        if (!portrait || typeof portrait !== 'object' || Array.isArray(portrait)) {
          throw new Error(`${label}.portrait debe ser un objeto o null`);
        }
        const portraitKeys = Object.keys(portrait);
        const missingPortraitFields = portraitFields.filter(key => !portraitKeys.includes(key));
        const unexpectedPortraitFields = portraitKeys.filter(key => !portraitFields.includes(key));
        if (missingPortraitFields.length || unexpectedPortraitFields.length) {
          throw new Error(`${label}.portrait tiene una estructura pública inválida`);
        }
      }
      if (collection === 'works'
        && (!Number.isInteger(record.fragment_count) || record.fragment_count < 0)) {
        throw new Error(`${label}.fragment_count debe ser un entero no negativo`);
      }
      for (const key of keys) {
        if (forbiddenFields.has(key)) throw new Error(`${label}: contiene el campo privado ${key}`);
      }
    }
  }
}

const [manualAuthors, manualWorks, normalizedQuotes] = await Promise.all([
  loadArray('author-profiles.manual.json'),
  loadArray('work-profiles.manual.json'),
  loadArray('quotes.normalized.draft.json'),
]);
const fragmentCounts = countFragmentsByWork(normalizedQuotes);

const publicDocument = {
  authors: manualAuthors.map(profile => ({
    author_id: profile.author_id,
    display_name: nullable(profile.display_name ?? profile.name),
    birth_year: nullable(profile.birth_year),
    death_year: nullable(profile.death_year),
    country: nullable(profile.country),
    language: nullable(profile.language),
    period: nullable(profile.period),
    movement: nullable(profile.movement),
    bio_short: nullable(profile.bio_short ?? profile.short_biography),
    bio_long: nullable(profile.bio_long),
    themes: Array.isArray(profile.themes) ? profile.themes : [],
    tone_notes: nullable(profile.tone_notes),
    why_in_paramo: nullable(profile.why_in_paramo),
    information_sources: publicInformationSources(profile),
    portrait: nullable(profile.portrait),
  })),
  works: manualWorks.map(profile => ({
    work_id: profile.work_id,
    title: nullable(profile.title),
    display_title: nullable(profile.display_title ?? profile.title),
    original_title: nullable(profile.original_title),
    author_id: nullable(profile.author_id),
    publication_year: nullable(profile.publication_year),
    genre: nullable(profile.genre),
    language: nullable(profile.language),
    summary_short: nullable(profile.summary_short ?? profile.short_summary),
    summary_long: nullable(profile.summary_long),
    context_notes: nullable(profile.context_notes ?? profile.context),
    themes: Array.isArray(profile.themes) ? profile.themes : [],
    tone_notes: nullable(profile.tone_notes ?? profile.tone),
    fragment_notes: nullable(profile.fragment_notes),
    why_in_paramo: nullable(profile.why_in_paramo),
    information_sources: publicInformationSources(profile),
    fragment_count: fragmentCounts.get(profile.work_id) ?? 0,
  })),
};

assertPublicDocument(publicDocument);
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(publicDocument, null, 2)}\n`, 'utf8');

console.log(
  `Perfiles literarios públicos generados: ${publicDocument.authors.length} autor(es), `
  + `${publicDocument.works.length} obra(s).`,
);
console.log(path.relative(projectRoot, outputPath));
