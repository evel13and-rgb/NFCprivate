import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildApprovalPlan,
  parseArguments,
  summarizeReadiness,
} from '../scripts/approve-directus-current-catalog.mjs';

function fixtures() {
  return {
    quotes: [{
      id: 'quote-1',
      publication_excluded: false,
      workflow_status: 'draft',
      visibility: 'hidden',
      verification_status: 'verified',
      reviewer_id: null,
      reviewed_at: null,
      publish_at: null,
    }],
    originals: [{
      id: 'original-1',
      import_key: 'original-quote-1',
      is_primary: true,
      workflow_status: 'in_review',
      visibility: 'hidden',
      verification_status: 'verified',
      reviewer_id: null,
      reviewed_at: null,
    }],
  };
}

test('por defecto solo prepara un plan sin aplicar cambios', () => {
  assert.deepEqual(parseArguments([]), {
    apply: false,
    confirmPublicSha: null,
    help: false,
  });
  assert.throws(
    () => parseArguments(['--apply']),
    /exige --confirm-public-sha/u,
  );
});

test('identifica el catálogo verificado que todavía no está aprobado', () => {
  const data = fixtures();
  const readiness = summarizeReadiness(data, new Date('2026-08-24T00:00:00Z'));
  const plan = buildApprovalPlan(data);

  assert.equal(readiness.ready, false);
  assert.equal(readiness.issue_counts['quotes.workflow_status'], 1);
  assert.equal(readiness.issue_counts['quote_originals.visibility'], 1);
  assert.deepEqual(plan.quote_ids, ['quote-1']);
  assert.deepEqual(plan.original_ids, ['original-1']);
});

test('reconoce el lote aprobado, público y con revisor', () => {
  const data = fixtures();
  for (const record of [...data.quotes, ...data.originals]) {
    record.workflow_status = 'approved';
    record.visibility = 'public';
    record.reviewer_id = 'user-1';
    record.reviewed_at = '2026-08-24T00:00:00Z';
  }

  assert.equal(summarizeReadiness(data).ready, true);
  assert.equal(buildApprovalPlan(data).quote_count, 0);
  assert.equal(buildApprovalPlan(data).original_count, 0);
});

test('la verificación sigue siendo un requisito independiente', () => {
  const data = fixtures();
  data.quotes[0].workflow_status = 'approved';
  data.quotes[0].visibility = 'public';
  data.quotes[0].reviewer_id = 'user-1';
  data.quotes[0].reviewed_at = '2026-08-24T00:00:00Z';
  data.quotes[0].verification_status = 'partially_verified';

  const readiness = summarizeReadiness(data);
  assert.equal(readiness.ready, false);
  assert.equal(readiness.issue_counts['quotes.verification_status'], 1);
});
