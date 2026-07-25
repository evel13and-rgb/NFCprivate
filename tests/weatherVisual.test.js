import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveVisualScene,
  normalizeVisualWeatherState,
  resolveVisualWeatherState,
} from '../weatherVisual.js';

for (const weather of ['sunny', 'clear', 'cloudy', 'mist', 'light-rain', 'heavy-rain', 'rainbow']) {
  test(`normaliza weather ${weather}`, () => {
    assert.equal(normalizeVisualWeatherState({ weather }).weather, weather);
  });
}

test('mantiene fallback cloudy + soft', () => {
  assert.deepEqual(
    normalizeVisualWeatherState({ weather: 'desconocido', intensity: 'extrema' }),
    {
      weather: 'cloudy',
      intensity: 'soft',
      timeOfDay: null,
      visualScene: null,
      source: null,
      provider: null,
      expiresAt: null,
      legacyVisualScene: null,
    },
  );
});

test('el cliente respeta timeOfDay y visualScene de Open-Meteo', () => {
  const state = resolveVisualWeatherState({
    weather: 'rainbow',
    intensity: 'soft',
    timeOfDay: 'sunset',
    visualScene: 'rainbow-after-rain',
    source: 'open-meteo',
    provider: 'open-meteo',
  }, 'night');
  assert.equal(state.timeOfDay, 'sunset');
  assert.equal(state.visualScene, 'rainbow-after-rain');
});

test('el cliente usa la hora local como fallback no autoritativo', () => {
  const state = resolveVisualWeatherState({
    weather: 'cloudy',
    timeOfDay: 'night',
    visualScene: 'night',
    source: 'fallback',
  }, 'day');
  assert.equal(state.timeOfDay, 'day');
  assert.equal(state.visualScene, 'day-cloudy');
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
