export const ALLOWED_WEATHER_STATES = Object.freeze([
  'clear',
  'sunny',
  'cloudy',
  'overcast',
  'light-rain',
  'heavy-rain',
  'mist',
  'rainbow',
]);

export const ALLOWED_TIMES_OF_DAY = Object.freeze(['dawn', 'day', 'sunset', 'night']);

const WEATHER_STATES = new Set(ALLOWED_WEATHER_STATES);
const TIMES_OF_DAY = new Set(ALLOWED_TIMES_OF_DAY);
const INTENSITIES = new Set(['soft', 'medium', 'strong']);
const LEGACY_WEATHER_STATE_MAP = Object.freeze({
  'night-clear': 'clear',
  'night-rain': 'light-rain',
});
const CLEAR_WEATHER_STATES = new Set(['clear', 'sunny']);
const RAIN_WEATHER_STATES = new Set(['light-rain', 'heavy-rain']);

export const FALLBACK_WEATHER_STATE = Object.freeze({
  weather: 'cloudy',
  intensity: 'soft',
});

export function normalizeVisualWeatherState(input = {}) {
  const legacyVisualScene = Object.prototype.hasOwnProperty.call(LEGACY_WEATHER_STATE_MAP, input.weather)
    ? input.weather
    : null;
  const legacyWeather = LEGACY_WEATHER_STATE_MAP[input.weather] || input.weather;

  return {
    weather: WEATHER_STATES.has(legacyWeather) ? legacyWeather : FALLBACK_WEATHER_STATE.weather,
    intensity: INTENSITIES.has(input.intensity) ? input.intensity : FALLBACK_WEATHER_STATE.intensity,
    timeOfDay: TIMES_OF_DAY.has(input.timeOfDay) ? input.timeOfDay : null,
    legacyVisualScene,
  };
}

export function deriveVisualScene(weather, timeOfDay) {
  if (weather === 'rainbow') {
    return 'rainbow-after-rain';
  }
  if (timeOfDay === 'dawn') {
    return 'dawn';
  }
  if (timeOfDay === 'day' && CLEAR_WEATHER_STATES.has(weather)) {
    return 'sunny-day';
  }
  if (timeOfDay === 'sunset') {
    return RAIN_WEATHER_STATES.has(weather) ? 'sunset-rain' : 'sunset';
  }
  if (timeOfDay === 'night') {
    if (RAIN_WEATHER_STATES.has(weather)) return 'night-rain';
    if (CLEAR_WEATHER_STATES.has(weather)) return 'night-clear';
    return 'night';
  }
  if (RAIN_WEATHER_STATES.has(weather)) {
    return 'day-rain';
  }
  return `day-${weather}`;
}

export function supportsDaylightMotes({ weather, timeOfDay, visualScene }) {
  return (
    visualScene !== 'rainbow-after-rain'
    && timeOfDay !== 'night'
    && (CLEAR_WEATHER_STATES.has(weather) || weather === 'cloudy')
  );
}
