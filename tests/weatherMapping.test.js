import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWeatherState,
  isAllowedWeather,
  isValidWeatherState,
  normalizeWeatherFields,
} from '../server/weatherMapping.js';
import {
  canReusePersistedWeatherState,
  isWeatherStateExpired,
} from '../server/weatherStateStore.js';

for (const weather of ['sunny', 'clear', 'cloudy', 'mist', 'light-rain', 'heavy-rain', 'rainbow']) {
  test(`el servidor admite ${weather}`, () => {
    assert.equal(isAllowedWeather(weather), true);
    assert.equal(normalizeWeatherFields({ weather }).weather, weather);
  });
}

test('el servidor admite dawn', () => {
  assert.equal(normalizeWeatherFields({ timeOfDay: 'dawn' }).timeOfDay, 'dawn');
});

test('no reutiliza caché manual ni fallback de coordenadas tras configurar proveedor', () => {
  const now = new Date('2026-07-25T10:00:00Z');
  const manual = buildWeatherState({ source: 'manual-override', provider: 'manual' }, now, 60_000);
  assert.equal(canReusePersistedWeatherState(manual, now), false);

  const missingCoordinates = buildWeatherState({
    source: 'fallback',
    diagnostics: { reason: 'missing-coordinates' },
  }, now, 60_000);
  assert.equal(canReusePersistedWeatherState(missingCoordinates, now, {
    provider: 'open-meteo',
    latitude: 40,
    longitude: -3,
  }), false);
});

test('el servidor conserva fallback cloudy + soft', () => {
  const state = normalizeWeatherFields({ weather: 'unknown', intensity: 'extreme' });
  assert.equal(state.weather, 'cloudy');
  assert.equal(state.intensity, 'soft');
});

test('invalida cachés antiguas y respeta expiración', () => {
  const now = new Date('2026-07-25T10:00:00Z');
  const state = buildWeatherState({}, now, 30 * 60 * 1000);
  assert.equal(isValidWeatherState(state), true);
  assert.equal(isValidWeatherState({ ...state, schemaVersion: undefined }), false);
  assert.equal(isWeatherStateExpired(state, new Date('2026-07-25T10:29:59Z')), false);
  assert.equal(isWeatherStateExpired(state, new Date('2026-07-25T10:30:00Z')), true);
});
