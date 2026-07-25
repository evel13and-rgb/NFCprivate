import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOverride,
  getHelpText,
  parseArguments,
} from '../scripts/set-weather-override.mjs';

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
  assert.throws(
    () => buildOverride('storm'),
    (error) => {
      assert.match(error.message, /Preset desconocido: storm/);
      assert.match(error.message, /Presets válidos:/);
      assert.match(error.message, /Usa --help/);
      return true;
    },
  );
});

for (const helpFlag of ['--help', '-h']) {
  test(`${helpFlag} muestra ayuda y termina correctamente`, () => {
    assert.deepEqual(parseArguments([helpFlag]), { help: true });
    const helpText = getHelpText();
    assert.match(helpText, /Presets disponibles:/);
    for (const preset of [
      'sunny',
      'rainbow',
      'mist',
      'clear',
      'cloudy',
      'light-rain',
      'heavy-rain',
      'off',
    ]) {
      assert.match(helpText, new RegExp(`  ${preset}(?:\\s|$)`));
    }
    assert.match(helpText, /Prueba local o temporal:/);
    assert.match(helpText, /Preparar producción:/);
    assert.match(helpText, /weather-override\.json/);
    assert.match(helpText, /ADVERTENCIA:/);
  });
}
