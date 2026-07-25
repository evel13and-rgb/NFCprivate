import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOverride } from '../scripts/set-weather-override.mjs';

test('crea los presets visuales principales', () => {
  assert.deepEqual(buildOverride('sunny'), {
    manualOverride: true,
    weather: 'sunny',
    intensity: 'strong',
    timeOfDay: 'day',
  });
  assert.equal(buildOverride('rainbow').weather, 'rainbow');
  assert.equal(buildOverride('dawn').timeOfDay, 'dawn');
});

test('off conserva campos válidos y desactiva el override', () => {
  assert.deepEqual(
    buildOverride('off', { weather: 'mist', intensity: 'soft', timeOfDay: 'day' }),
    { manualOverride: false, weather: 'mist', intensity: 'soft', timeOfDay: 'day' },
  );
});

test('rechaza presets desconocidos', () => {
  assert.throws(() => buildOverride('storm'), /Preset desconocido/);
});
