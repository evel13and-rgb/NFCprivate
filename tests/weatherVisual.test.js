import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveVisualScene, normalizeVisualWeatherState } from '../weatherVisual.js';

for (const weather of ['sunny', 'clear', 'cloudy', 'mist', 'light-rain', 'heavy-rain', 'rainbow']) {
  test(`normaliza weather ${weather}`, () => {
    assert.equal(normalizeVisualWeatherState({ weather }).weather, weather);
  });
}

test('mantiene fallback cloudy + soft', () => {
  assert.deepEqual(
    normalizeVisualWeatherState({ weather: 'desconocido', intensity: 'extrema' }),
    { weather: 'cloudy', intensity: 'soft', timeOfDay: null, legacyVisualScene: null },
  );
});

test('normaliza estados nocturnos heredados', () => {
  assert.equal(normalizeVisualWeatherState({ weather: 'night-clear' }).weather, 'clear');
  assert.equal(normalizeVisualWeatherState({ weather: 'night-rain' }).weather, 'light-rain');
});

[
  ['cloudy', 'dawn', 'dawn'],
  ['sunny', 'day', 'sunny-day'],
  ['clear', 'day', 'sunny-day'],
  ['rainbow', 'day', 'rainbow-after-rain'],
  ['cloudy', 'sunset', 'sunset'],
  ['cloudy', 'night', 'night'],
].forEach(([weather, timeOfDay, expected]) => {
  test(`${weather} + ${timeOfDay} deriva ${expected}`, () => {
    assert.equal(deriveVisualScene(weather, timeOfDay), expected);
  });
});
