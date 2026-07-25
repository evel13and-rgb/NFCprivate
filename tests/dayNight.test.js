import test from 'node:test';
import assert from 'node:assert/strict';
import { getTimeOfDay } from '../dayNight.js';

function localTime(hours, minutes) {
  return new Date(2026, 0, 1, hours, minutes);
}

[
  [5, 59, 'night'],
  [6, 0, 'dawn'],
  [7, 29, 'dawn'],
  [7, 30, 'day'],
  [17, 59, 'day'],
  [18, 0, 'sunset'],
  [19, 59, 'sunset'],
  [20, 0, 'night'],
].forEach(([hours, minutes, expected]) => {
  test(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} es ${expected}`, () => {
    assert.equal(getTimeOfDay(localTime(hours, minutes)), expected);
  });
});
