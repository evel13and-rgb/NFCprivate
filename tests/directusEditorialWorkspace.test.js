import assert from 'node:assert/strict';
import test from 'node:test';
import {
  collectionLayouts,
  presetsEqual,
  validatePresetDefinitions,
  workspacePresetDefinitions,
} from '../scripts/configure-directus-editorial-workspace.mjs';

test('el espacio editorial define vistas principales y marcadores únicos', () => {
  assert.equal(workspacePresetDefinitions.length, 18);
  assert.deepEqual(validatePresetDefinitions(workspacePresetDefinitions), []);

  const defaults = workspacePresetDefinitions.filter((preset) => preset.bookmark === null);
  assert.deepEqual(
    defaults.map((preset) => preset.collection).sort(),
    Object.keys(collectionLayouts).sort(),
  );
  assert.equal(new Set(workspacePresetDefinitions.map((preset) => (
    `${preset.collection}\0${preset.bookmark || ''}`
  ))).size, workspacePresetDefinitions.length);
});

test('la vista publicable exige aprobación, verificación, visibilidad y no exclusión', () => {
  const publishable = workspacePresetDefinitions.find((preset) => (
    preset.bookmark === 'Frases · Preparadas para exportar'
  ));

  assert.deepEqual(publishable.filter, {
    _and: [
      { workflow_status: { _eq: 'approved' } },
      { verification_status: { _eq: 'verified' } },
      { visibility: { _eq: 'public' } },
      { publication_excluded: { _eq: false } },
    ],
  });
});

test('la comparación de vistas ignora el orden JSON pero detecta cambios gestionados', () => {
  const definition = workspacePresetDefinitions[0];
  const reordered = {
    ...definition,
    layout_query: {
      tabular: {
        limit: 25,
        page: 1,
        sort: definition.layout_query.tabular.sort,
        fields: definition.layout_query.tabular.fields,
      },
    },
  };

  assert.equal(presetsEqual(definition, reordered), true);
  assert.equal(presetsEqual(definition, { ...reordered, icon: 'warning' }), false);
});
