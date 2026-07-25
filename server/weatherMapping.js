export const ALLOWED_WEATHER_STATES = Object.freeze([
  'sunny',
  'clear',
  'cloudy',
  'overcast',
  'light-rain',
  'heavy-rain',
  'mist',
  'rainbow',
  'night-clear',
  'night-rain',
]);

const ALLOWED_INTENSITIES = Object.freeze(['soft', 'medium', 'strong']);
const ALLOWED_TIMES_OF_DAY = Object.freeze(['dawn', 'day', 'sunset', 'night']);
const ALLOWED_SOURCES = Object.freeze(['open-meteo', 'fallback', 'manual-override']);
const STATE_SCHEMA_VERSION = 2;

export const DEFAULT_WEATHER_STATE = Object.freeze({
  weather: 'cloudy',
  intensity: 'soft',
  timeOfDay: 'day',
  source: 'fallback',
  provider: 'none',
});

export function isAllowedWeather(weather) {
  return ALLOWED_WEATHER_STATES.includes(weather);
}

export function normalizeWeatherFields(input = {}) {
  const weather = isAllowedWeather(input.weather) ? input.weather : DEFAULT_WEATHER_STATE.weather;
  const intensity = ALLOWED_INTENSITIES.includes(input.intensity)
    ? input.intensity
    : DEFAULT_WEATHER_STATE.intensity;
  const timeOfDay = weather.startsWith('night-')
    ? 'night'
    : ALLOWED_TIMES_OF_DAY.includes(input.timeOfDay)
      ? input.timeOfDay
      : DEFAULT_WEATHER_STATE.timeOfDay;

  const source = ALLOWED_SOURCES.includes(input.source) ? input.source : DEFAULT_WEATHER_STATE.source;
  return {
    weather,
    intensity,
    timeOfDay,
    source,
    provider: typeof input.provider === 'string' ? input.provider : DEFAULT_WEATHER_STATE.provider,
    visualScene: typeof input.visualScene === 'string' ? input.visualScene : null,
    diagnostics: input.diagnostics && typeof input.diagnostics === 'object'
      ? input.diagnostics
      : {},
  };
}

export function buildWeatherState(input = {}, now = new Date(), ttlMs = 60 * 60 * 1000) {
  const fields = normalizeWeatherFields(input);
  const updatedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + ttlMs).toISOString();

  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    ...fields,
    updatedAt,
    expiresAt,
  };
}

export function isValidWeatherState(input) {
  if (!input || typeof input !== 'object') {
    return false;
  }

  return (
    isAllowedWeather(input.weather)
    && ALLOWED_INTENSITIES.includes(input.intensity)
    && ALLOWED_TIMES_OF_DAY.includes(input.timeOfDay)
    && input.schemaVersion === STATE_SCHEMA_VERSION
    && ALLOWED_SOURCES.includes(input.source)
    && typeof input.provider === 'string'
    && (input.visualScene === null || typeof input.visualScene === 'string')
    && typeof input.updatedAt === 'string'
    && typeof input.expiresAt === 'string'
    && !Number.isNaN(Date.parse(input.updatedAt))
    && !Number.isNaN(Date.parse(input.expiresAt))
  );
}

export function hasSameWeatherFields(left, right) {
  if (!left || !right) {
    return false;
  }

  return (
    left.weather === right.weather
    && left.intensity === right.intensity
    && left.timeOfDay === right.timeOfDay
  );
}
