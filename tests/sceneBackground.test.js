import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSceneBackground } from '../sceneBackground.js';

[
  ['dawn', 'dawn', 'paramoamanecer.webp'],
  ['sunny-day', 'day', 'paramosol.webp'],
  ['rainbow-after-rain', 'day', 'paramoarcoiris.webp'],
  ['sunset-rain', 'sunset', 'paramoatardecer.webp'],
  ['night-mist', 'night', 'paramonoche.webp'],
  ['day-rain', 'day', 'paramodia.webp'],
].forEach(([visualScene, timeOfDay, expectedFile]) => {
  test(`${visualScene} selecciona ${expectedFile}`, () => {
    const scene = resolveSceneBackground({ visualScene, timeOfDay });
    assert.ok(scene.webp.endsWith(expectedFile));
  });
});

test('usa la hora local si la escena visual no tiene un fondo especial', () => {
  assert.equal(resolveSceneBackground({ visualScene: 'unknown', timeOfDay: 'sunset' }).id, 'sunset');
});

test('conserva un fallback PNG por cada fondo WebP', () => {
  const scene = resolveSceneBackground({ visualScene: 'night-clear', timeOfDay: 'night' });
  assert.equal(scene.id, 'night');
  assert.ok(scene.webp.endsWith('.webp'));
  assert.ok(scene.fallback.endsWith('.png'));
});
