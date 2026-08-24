import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ensureCandidateOutputPath,
  parseArguments,
  selectPublicationRecords,
  summarizeIssues,
} from '../scripts/prepare-directus-quotes-publication.mjs';

function fixtures() {
  return {
    quotes: [{
      id: 'quote-1',
      workflow_status: 'approved',
      visibility: 'public',
      verification_status: 'verified',
      publication_excluded: false,
      reviewer_id: 'user-1',
      reviewed_at: '2026-08-24T00:00:00Z',
      publish_at: null,
    }],
    originals: [{
      id: 'original-1',
      import_key: 'original-quote-1',
      quote_id: 'quote-1',
      is_primary: true,
      workflow_status: 'approved',
      visibility: 'public',
      verification_status: 'verified',
      reviewer_id: 'user-1',
      reviewed_at: '2026-08-24T00:00:00Z',
    }],
  };
}

test('selecciona únicamente registros completamente publicables', () => {
  const data = fixtures();
  data.quotes.push({
    ...data.quotes[0],
    id: 'quote-draft',
    workflow_status: 'draft',
  });
  const selection = selectPublicationRecords(data);

  assert.deepEqual(selection.quotes.map((quote) => quote.id), ['quote-1']);
  assert.deepEqual(selection.originals.map((original) => original.id), ['original-1']);
  assert.deepEqual(selection.issues, []);
});

test('bloquea un original todavía no aprobado', () => {
  const data = fixtures();
  data.originals[0].workflow_status = 'in_review';
  const selection = selectPublicationRecords(data);

  assert.equal(summarizeIssues(selection.issues).counts.original_not_publishable, 1);
});

test('excluye temporalmente una frase programada para el futuro', () => {
  const data = fixtures();
  data.quotes[0].publish_at = '2026-08-25T00:00:00Z';
  const selection = selectPublicationRecords(data, new Date('2026-08-24T00:00:00Z'));

  assert.equal(selection.quotes.length, 0);
  assert.equal(selection.warnings[0].code, 'future_publish_at_excluded');
  assert.equal(summarizeIssues(selection.issues).counts.empty_candidate, 1);
});

test('la simulación es el modo predeterminado y la salida queda en /tmp', () => {
  assert.deepEqual(parseArguments([]), {
    allowContentChanges: false,
    help: false,
    outputPath: '/tmp/paramo-directus-quotes-publication-candidate.json',
    record: false,
  });
  assert.equal(
    ensureCandidateOutputPath('/tmp/candidato.json'),
    '/tmp/candidato.json',
  );
  assert.throws(
    () => ensureCandidateOutputPath('/srv/paramoliterario/source/public/data/quotes.json'),
    /solo puede escribirse directamente en \/tmp/u,
  );
});
