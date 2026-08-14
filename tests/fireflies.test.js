import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getFireflyCountBounds,
  resolveFireflyRuntimeMode,
  shouldShowFirefliesForState,
} from '../fireflies.js';

test('mantiene las luciérnagas visibles en toda noche, incluida la lluvia', () => {
  for (const weather of ['clear', 'sunny', 'cloudy', 'mist', 'light-rain', 'heavy-rain']) {
    assert.equal(shouldShowFirefliesForState({
      timeOfDay: 'night',
      weather,
      visualScene: weather.includes('rain') ? 'night-rain' : weather === 'clear' ? 'night-clear' : 'night',
    }), true);
  }
});

test('oculta las luciérnagas fuera de la noche o cuando la página queda en segundo plano', () => {
  assert.equal(shouldShowFirefliesForState({
    timeOfDay: 'day',
    weather: 'clear',
    visualScene: 'sunny-day',
  }), false);
  assert.equal(shouldShowFirefliesForState({
    documentHidden: true,
    timeOfDay: 'night',
    weather: 'clear',
    visualScene: 'night-clear',
  }), false);
});

test('el modo ligero conserva movimiento limitado en móvil y una imagen estática con movimiento reducido', () => {
  const desktop = resolveFireflyRuntimeMode();
  const mobile = resolveFireflyRuntimeMode({ constrained: true });
  const rainy = resolveFireflyRuntimeMode({ rainy: true });
  const rainyMobile = resolveFireflyRuntimeMode({ constrained: true, rainy: true });
  const reduced = resolveFireflyRuntimeMode({ constrained: true, reduceMotion: true });

  assert.deepEqual(desktop, {
    constrained: false,
    reduceMotion: false,
    animate: true,
    frameIntervalMs: 0,
  });
  assert.equal(mobile.animate, true);
  assert.ok(mobile.frameIntervalMs >= 1000 / 24);
  assert.equal(rainy.constrained, true);
  assert.equal(rainy.animate, false);
  assert.equal(rainy.frameIntervalMs, mobile.frameIntervalMs);
  assert.equal(rainyMobile.animate, true);
  assert.equal(reduced.animate, false);
  assert.equal(reduced.frameIntervalMs, mobile.frameIntervalMs);
});

test('la densidad móvil conserva el protagonismo nocturno sin igualar el coste de escritorio', () => {
  assert.deepEqual(getFireflyCountBounds({ constrained: true }), { min: 19, max: 28 });
  assert.deepEqual(getFireflyCountBounds({ constrained: true, reduceMotion: true }), { min: 12, max: 18 });
  assert.deepEqual(getFireflyCountBounds({ rainy: true }), { min: 19, max: 28 });
  assert.deepEqual(getFireflyCountBounds(), { min: 54, max: 83 });
});
