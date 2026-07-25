import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isAllowedWeather,
  normalizeWeatherFields,
} from '../server/weatherMapping.js';

for (const weather of ['sunny', 'clear', 'cloudy', 'mist', 'light-rain', 'heavy-rain', 'rainbow']) {
  test(`el servidor admite ${weather}`, () => {
    assert.equal(isAllowedWeather(weather), true);
    assert.equal(normalizeWeatherFields({ weather }).weather, weather);
  });
}

test('el servidor admite dawn', () => {
  assert.equal(normalizeWeatherFields({ timeOfDay: 'dawn' }).timeOfDay, 'dawn');
});

test('el servidor conserva fallback cloudy + soft', () => {
  const state = normalizeWeatherFields({ weather: 'unknown', intensity: 'extreme' });
  assert.equal(state.weather, 'cloudy');
  assert.equal(state.intensity, 'soft');
});
