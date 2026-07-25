import { getTimeOfDay } from '../dayNight.js';
import { deriveVisualScene } from '../weatherVisual.js';
import { buildWeatherState } from './weatherMapping.js';

const OPEN_METEO_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
const DEFAULT_TTL_MINUTES = 30;
const DEFAULT_TIMEOUT_MS = 8_000;
const CURRENT_VARIABLES = [
  'weather_code',
  'precipitation',
  'rain',
  'showers',
  'cloud_cover',
  'relative_humidity_2m',
  'is_day',
];
const HOURLY_VARIABLES = [
  'weather_code',
  'precipitation_probability',
  'precipitation',
  'rain',
  'showers',
  'cloud_cover',
  'relative_humidity_2m',
  'visibility',
];
const DAILY_VARIABLES = ['sunrise', 'sunset', 'weather_code', 'precipitation_sum'];

function finiteNumber(value) {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function configuredCoordinate(value, min, max) {
  const parsed = finiteNumber(value);
  return parsed !== null && parsed >= min && parsed <= max ? parsed : null;
}

export function getWeatherProviderConfig(env = process.env) {
  const ttlCandidate = Number.parseInt(env.PARAMO_WEATHER_TTL_MINUTES || '', 10);
  return {
    provider: env.PARAMO_WEATHER_PROVIDER || 'open-meteo',
    latitude: configuredCoordinate(env.PARAMO_WEATHER_LATITUDE, -90, 90),
    longitude: configuredCoordinate(env.PARAMO_WEATHER_LONGITUDE, -180, 180),
    timezone: env.PARAMO_WEATHER_TIMEZONE || 'auto',
    ttlMinutes: Number.isInteger(ttlCandidate) && ttlCandidate >= 5 && ttlCandidate <= 180
      ? ttlCandidate
      : DEFAULT_TTL_MINUTES,
  };
}

export function buildOpenMeteoUrl(config) {
  const url = new URL(OPEN_METEO_ENDPOINT);
  url.searchParams.set('latitude', String(config.latitude));
  url.searchParams.set('longitude', String(config.longitude));
  url.searchParams.set('current', CURRENT_VARIABLES.join(','));
  url.searchParams.set('hourly', HOURLY_VARIABLES.join(','));
  url.searchParams.set('daily', DAILY_VARIABLES.join(','));
  url.searchParams.set('forecast_days', '2');
  url.searchParams.set('past_hours', '3');
  url.searchParams.set('timezone', config.timezone || 'auto');
  return url;
}

function wallClockMs(value) {
  if (typeof value !== 'string') return Number.NaN;
  const normalized = /(?:Z|[+-]\d\d:\d\d)$/.test(value)
    ? value
    : `${value}${value.length === 16 ? ':00' : ''}Z`;
  return Date.parse(normalized);
}

export function deriveTimeOfDay({
  currentTime,
  sunrise,
  sunset,
  fallbackDate = new Date(),
} = {}) {
  const nowMs = wallClockMs(currentTime);
  const sunriseMs = wallClockMs(sunrise);
  const sunsetMs = wallClockMs(sunset);

  if (![nowMs, sunriseMs, sunsetMs].every(Number.isFinite) || sunriseMs >= sunsetMs) {
    return getTimeOfDay(fallbackDate);
  }
  if (nowMs < sunriseMs || nowMs > sunsetMs + 30 * 60 * 1000) return 'night';
  if (nowMs <= sunriseMs + 90 * 60 * 1000) return 'dawn';
  if (nowMs >= sunsetMs - 90 * 60 * 1000) return 'sunset';
  return 'day';
}

const LIGHT_RAIN_CODES = new Set([51, 53, 56, 61, 63, 66, 80, 81]);
const HEAVY_RAIN_CODES = new Set([55, 57, 65, 67, 82, 95, 96, 99]);
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);

export function mapWeatherCondition(current = {}, timeOfDay = 'day') {
  const code = finiteNumber(current.weather_code) ?? -1;
  const precipitation = finiteNumber(current.precipitation) ?? 0;
  const rain = finiteNumber(current.rain) ?? 0;
  const showers = finiteNumber(current.showers) ?? 0;
  const cloudCover = finiteNumber(current.cloud_cover) ?? 50;
  const precipitationProbability = finiteNumber(current.precipitation_probability) ?? 0;
  const precipitationRate = Math.max(precipitation, rain, showers);
  const heavyByRate = precipitationRate >= 4;

  if (
    HEAVY_RAIN_CODES.has(code)
    || heavyByRate
    || (precipitationProbability >= 85 && precipitationRate >= 1.5)
  ) {
    return { weather: 'heavy-rain', intensity: 'strong' };
  }
  if (LIGHT_RAIN_CODES.has(code) || precipitationRate >= 0.1) {
    return {
      weather: precipitationRate >= 1.5 ? 'heavy-rain' : 'light-rain',
      intensity: precipitationRate >= 0.7 || precipitationProbability >= 60 ? 'medium' : 'soft',
    };
  }
  if (SNOW_CODES.has(code)) {
    return code >= 75 || code >= 85
      ? { weather: 'heavy-rain', intensity: 'strong' }
      : { weather: 'overcast', intensity: 'medium' };
  }
  if (code === 45 || code === 48) return { weather: 'mist', intensity: 'soft' };
  if (code === 3 || cloudCover >= 88) return { weather: 'overcast', intensity: 'medium' };
  if (code === 1 || code === 2 || cloudCover >= 35) {
    return { weather: 'cloudy', intensity: cloudCover >= 70 ? 'medium' : 'soft' };
  }
  if (code === 0 || cloudCover < 35) {
    return {
      weather: timeOfDay === 'night' ? 'clear' : 'sunny',
      intensity: timeOfDay === 'night' ? 'medium' : 'strong',
    };
  }
  return { weather: 'cloudy', intensity: 'soft' };
}

function hourlyRows(hourly = {}) {
  const times = Array.isArray(hourly.time) ? hourly.time : [];
  return times.map((time, index) => ({
    time,
    timeMs: wallClockMs(time),
    precipitationProbability: finiteNumber(hourly.precipitation_probability?.[index]) ?? 0,
    precipitation: finiteNumber(hourly.precipitation?.[index]) ?? 0,
    rain: finiteNumber(hourly.rain?.[index]) ?? 0,
    showers: finiteNumber(hourly.showers?.[index]) ?? 0,
  }));
}

function nearbyHourlyRows(hourly, currentTime) {
  const currentMs = wallClockMs(currentTime);
  if (!Number.isFinite(currentMs)) return [];
  return hourlyRows(hourly)
    .filter(({ timeMs }) => Number.isFinite(timeMs) && Math.abs(timeMs - currentMs) <= 3 * 60 * 60 * 1000);
}

export function hasRainbowEvidence({
  current = {},
  hourly = {},
  currentTime,
  timeOfDay,
  baseWeather,
} = {}) {
  if (timeOfDay === 'night' || !['sunny', 'clear', 'cloudy'].includes(baseWeather)) return false;
  const code = finiteNumber(current.weather_code) ?? 99;
  const cloudCover = finiteNumber(current.cloud_cover) ?? 100;
  const currentPrecipitation = Math.max(
    finiteNumber(current.precipitation) ?? 0,
    finiteNumber(current.rain) ?? 0,
    finiteNumber(current.showers) ?? 0,
  );
  if (code > 2 || cloudCover >= 75 || currentPrecipitation >= 0.1) return false;

  return nearbyHourlyRows(hourly, currentTime).some((row) => (
      Math.max(row.precipitation, row.rain, row.showers) >= 0.1
      || row.precipitationProbability >= 60
    ));
}

function dailySolarTimes(payload, currentTime) {
  const dates = Array.isArray(payload.daily?.time) ? payload.daily.time : [];
  const date = typeof currentTime === 'string' ? currentTime.slice(0, 10) : '';
  const index = Math.max(0, dates.indexOf(date));
  return {
    sunrise: payload.daily?.sunrise?.[index],
    sunset: payload.daily?.sunset?.[index],
  };
}

export function mapOpenMeteoResponse(payload, {
  now = new Date(),
  ttlMs = DEFAULT_TTL_MINUTES * 60 * 1000,
} = {}) {
  if (!payload?.current || typeof payload.current !== 'object') {
    throw new Error('Open-Meteo no devolvió el bloque current esperado');
  }

  const currentTime = payload.current.time;
  const solarTimes = dailySolarTimes(payload, currentTime);
  const timeOfDay = deriveTimeOfDay({
    currentTime,
    ...solarTimes,
    fallbackDate: now,
  });
  const nearbyRows = nearbyHourlyRows(payload.hourly, currentTime);
  const currentMs = wallClockMs(currentTime);
  const closestHour = nearbyRows.reduce((closest, row) => (
    !closest || Math.abs(row.timeMs - currentMs) < Math.abs(closest.timeMs - currentMs)
      ? row
      : closest
  ), null);
  const condition = mapWeatherCondition({
    ...payload.current,
    precipitation_probability: closestHour?.precipitationProbability,
  }, timeOfDay);
  const rainbow = hasRainbowEvidence({
    current: payload.current,
    hourly: payload.hourly,
    currentTime,
    timeOfDay,
    baseWeather: condition.weather,
  });
  const weather = rainbow ? 'rainbow' : condition.weather;
  const visualScene = deriveVisualScene(weather, timeOfDay);

  return buildWeatherState({
    weather,
    intensity: rainbow ? 'soft' : condition.intensity,
    timeOfDay,
    visualScene,
    source: 'open-meteo',
    provider: 'open-meteo',
    diagnostics: {
      weatherCode: finiteNumber(payload.current.weather_code),
      cloudCover: finiteNumber(payload.current.cloud_cover),
      precipitation: finiteNumber(payload.current.precipitation),
      precipitationProbabilityNearby: Math.max(
        0,
        ...nearbyRows.map(({ precipitationProbability }) => precipitationProbability),
      ),
      timezone: payload.timezone || null,
      rainbowEvidence: rainbow,
      solarTimesAvailable: Boolean(solarTimes.sunrise && solarTimes.sunset),
    },
  }, now, ttlMs);
}

export function getSafeFallbackWeatherState(
  now = new Date(),
  ttlMs = DEFAULT_TTL_MINUTES * 60 * 1000,
  reason = 'fallback',
) {
  const timeOfDay = getTimeOfDay(now);
  const weather = 'cloudy';
  return buildWeatherState({
    weather,
    intensity: 'soft',
    timeOfDay,
    visualScene: deriveVisualScene(weather, timeOfDay),
    source: 'fallback',
    provider: 'none',
    diagnostics: { reason },
  }, now, ttlMs);
}

export async function getWeatherFromProvider({
  now = new Date(),
  ttlMs,
  env = process.env,
  fetchImpl = globalThis.fetch,
  logger = console,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  const config = getWeatherProviderConfig(env);
  const effectiveTtlMs = ttlMs ?? config.ttlMinutes * 60 * 1000;

  if (config.provider !== 'open-meteo') {
    logger.warn(`Proveedor meteorológico no compatible: ${config.provider}; usando fallback cloudy.`);
    return getSafeFallbackWeatherState(now, effectiveTtlMs, 'unsupported-provider');
  }
  if (config.latitude === null || config.longitude === null) {
    logger.warn(
      'Faltan PARAMO_WEATHER_LATITUDE/PARAMO_WEATHER_LONGITUDE válidas; usando fallback cloudy.',
    );
    return getSafeFallbackWeatherState(now, effectiveTtlMs, 'missing-coordinates');
  }
  if (typeof fetchImpl !== 'function') {
    logger.warn('fetch nativo no está disponible; usando fallback cloudy.');
    return getSafeFallbackWeatherState(now, effectiveTtlMs, 'fetch-unavailable');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(buildOpenMeteoUrl(config), {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Open-Meteo respondió HTTP ${response.status}`);
    return mapOpenMeteoResponse(await response.json(), { now, ttlMs: effectiveTtlMs });
  } catch (error) {
    logger.warn(`Open-Meteo no disponible (${error.message}); usando fallback cloudy.`);
    return getSafeFallbackWeatherState(now, effectiveTtlMs, 'provider-error');
  } finally {
    clearTimeout(timeout);
  }
}
