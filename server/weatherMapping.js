export const ALLOWED_WEATHER_STATES = Object.freeze([
  'sunny',
  'cloudy',
  'overcast',
  'light-rain',
  'heavy-rain',
  'mist',
  'night-clear',
  'night-rain',
]);

const ALLOWED_INTENSITIES = Object.freeze(['soft', 'medium', 'strong']);
const ALLOWED_TIMES_OF_DAY = Object.freeze(['day', 'night']);

export const DEFAULT_WEATHER_STATE = Object.freeze({
  weather: 'cloudy',
  intensity: 'soft',
  timeOfDay: 'day',
  source: 'server',
});

export function isAllowedWeather(weather) {
  return ALLOWED_WEATHER_STATES.includes(weather);
}

export function normalizeWeatherFields(input = {}) {
  const weather = isAllowedWeather(input.weather) ? input.weather : DEFAULT_WEATHER_STATE.weather;
  const intensity = ALLOWED_INTENSITIES.includes(input.intensity)
    ? input.intensity
    : DEFAULT_WEATHER_STATE.intensity;
  const timeOfDay = ALLOWED_TIMES_OF_DAY.includes(input.timeOfDay)
    ? input.timeOfDay
    : weather.startsWith('night-')
      ? 'night'
      : DEFAULT_WEATHER_STATE.timeOfDay;

  return {
    weather,
    intensity,
    timeOfDay,
    source: 'server',
  };
}

export function buildWeatherState(input = {}, now = new Date(), ttlMs = 60 * 60 * 1000) {
  const fields = normalizeWeatherFields(input);
  const updatedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + ttlMs).toISOString();

  return {
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
    && input.source === 'server'
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
