import { DEFAULT_WEATHER_STATE, buildWeatherState } from './weatherMapping.js';

const DEFAULT_TTL_MS = 60 * 60 * 1000;

export async function getWeatherFromProvider({ now = new Date(), ttlMs = DEFAULT_TTL_MS } = {}) {
  // Future integration point: call Open-Meteo here, then map its codes in weatherMapping.js.
  return buildWeatherState(DEFAULT_WEATHER_STATE, now, ttlMs);
}

export function getSafeFallbackWeatherState(now = new Date(), ttlMs = DEFAULT_TTL_MS) {
  return buildWeatherState(DEFAULT_WEATHER_STATE, now, ttlMs);
}
