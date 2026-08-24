import assert from 'node:assert/strict';
import test from 'node:test';
import { buildScenarioReport } from '../scripts/simulate-directus-publication-changes.mjs';

function publicDocument() {
  return {
    schema_version: 1,
    generated_at: '2026-08-24T00:00:00.000Z',
    quote_count: 2,
    quotes: [{
      id: 'quote-1',
      legacy_index: 1,
      t: 'Traducción de ejemplo',
      a: 'Autora',
      obra: 'Obra, Autora',
      highlight: null,
      lang: 'es',
      type: 'prose',
      authorId: 'author-1',
      workId: 'work-1',
      original: {
        text: 'Example original',
        lang: 'en',
        label: 'Original inglés',
      },
    }, {
      id: 'quote-2',
      legacy_index: 2,
      t: 'Segunda traducción',
      a: 'Autora',
      obra: 'Obra, Autora',
      highlight: null,
      lang: 'es',
      type: 'prose',
      authorId: 'author-1',
      workId: 'work-1',
    }],
  };
}

test('detecta y bloquea todos los escenarios de cambio real', () => {
  const report = buildScenarioReport(publicDocument());
  const scenarios = new Map(report.scenarios.map((scenario) => [scenario.name, scenario]));

  assert.equal(scenarios.get('baseline_sin_cambios').comparison.exact, true);
  assert.equal(scenarios.get('alta_en_borrador').comparison.exact, true);
  for (const name of [
    'alta_aprobada',
    'modificacion_traduccion',
    'modificacion_original',
    'exclusion_editorial',
    'baja_archivada',
  ]) {
    assert.equal(scenarios.get(name).comparison.exact, false);
    assert.equal(scenarios.get(name).without_explicit_authorization.allowed, false);
    assert.equal(scenarios.get(name).with_explicit_authorization.allowed, true);
  }
});
