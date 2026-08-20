import assert from 'node:assert/strict';
import test from 'node:test';

import { isPublishableProfile } from '../scripts/editorial-profile-policy.mjs';

test('publica fichas con contenido editorial visible durante el piloto', () => {
  for (const profile_status of ['draft', 'reviewed', 'ready']) {
    assert.equal(isPublishableProfile({ profile_status }), true);
  }
});

test('excluye fichas vacías u ocultas', () => {
  for (const profile_status of ['empty', 'hidden']) {
    assert.equal(isPublishableProfile({ profile_status }), false);
  }
});

test('rechaza estados desconocidos para evitar publicaciones silenciosas', () => {
  assert.throws(
    () => isPublishableProfile({ profile_status: 'published' }),
    /Estado de ficha desconocido/,
  );
});
