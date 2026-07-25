import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOpenMeteoUrl,
  deriveTimeOfDay,
  getWeatherFromProvider,
  hasRainbowEvidence,
  mapOpenMeteoResponse,
  mapWeatherCondition,
} from '../server/weatherProvider.js';

function openMeteoPayload({
  time = '2026-07-25T12:00',
  weatherCode = 0,
  cloudCover = 10,
  precipitation = 0,
  probability = 0,
  sunrise = '2026-07-25T06:30',
  sunset = '2026-07-25T20:30',
} = {}) {
  return {
    timezone: 'Europe/Madrid',
    current: {
      time,
      weather_code: weatherCode,
      precipitation,
      rain: precipitation,
      showers: 0,
      cloud_cover: cloudCover,
      relative_humidity_2m: 60,
      is_day: 1,
    },
    hourly: {
      time: ['2026-07-25T09:00', '2026-07-25T12:00', '2026-07-25T15:00'],
      precipitation_probability: [probability, probability, probability],
      precipitation: [0, precipitation, 0],
      rain: [0, precipitation, 0],
      showers: [0, 0, 0],
    },
    daily: {
      time: ['2026-07-25', '2026-07-26'],
      sunrise: [sunrise, '2026-07-26T06:31'],
      sunset: [sunset, '2026-07-26T20:29'],
      weather_code: [weatherCode, weatherCode],
      precipitation_sum: [precipitation, 0],
    },
  };
}

test('construye la consulta Open-Meteo requerida', () => {
  const url = buildOpenMeteoUrl({
    latitude: 40.4,
    longitude: -3.7,
    timezone: 'auto',
  });
  assert.equal(url.hostname, 'api.open-meteo.com');
  assert.equal(url.searchParams.get('forecast_days'), '2');
  assert.equal(url.searchParams.get('timezone'), 'auto');
  assert.match(url.searchParams.get('current'), /weather_code/);
  assert.match(url.searchParams.get('hourly'), /precipitation_probability/);
  assert.match(url.searchParams.get('daily'), /sunrise,sunset/);
});

test('mapea sol, nubes, cubierto, niebla y lluvia', () => {
  assert.deepEqual(mapWeatherCondition({ weather_code: 0, cloud_cover: 10 }, 'day'), {
    weather: 'sunny',
    intensity: 'strong',
  });
  assert.equal(mapWeatherCondition({ weather_code: 2, cloud_cover: 60 }).weather, 'cloudy');
  assert.equal(mapWeatherCondition({ weather_code: 3, cloud_cover: 95 }).weather, 'overcast');
  assert.equal(mapWeatherCondition({ weather_code: 45 }).weather, 'mist');
  assert.equal(mapWeatherCondition({ weather_code: 61, precipitation: 0.4 }).weather, 'light-rain');
  assert.equal(mapWeatherCondition({
    weather_code: 61,
    precipitation: 0.2,
    precipitation_probability: 70,
  }).intensity, 'medium');
  assert.deepEqual(mapWeatherCondition({ weather_code: 65, precipitation: 5 }), {
    weather: 'heavy-rain',
    intensity: 'strong',
  });
});

test('usa sunrise y sunset para dawn, day, sunset y night', () => {
  const solar = {
    sunrise: '2026-07-25T06:30',
    sunset: '2026-07-25T20:30',
  };
  assert.equal(deriveTimeOfDay({ ...solar, currentTime: '2026-07-25T06:30' }), 'dawn');
  assert.equal(deriveTimeOfDay({ ...solar, currentTime: '2026-07-25T08:00' }), 'dawn');
  assert.equal(deriveTimeOfDay({ ...solar, currentTime: '2026-07-25T08:01' }), 'day');
  assert.equal(deriveTimeOfDay({ ...solar, currentTime: '2026-07-25T19:00' }), 'sunset');
  assert.equal(deriveTimeOfDay({ ...solar, currentTime: '2026-07-25T21:01' }), 'night');
});

test('activa rainbow solo con claridad y evidencia cercana de precipitación', () => {
  const payload = openMeteoPayload({ probability: 70 });
  const state = mapOpenMeteoResponse(payload);
  assert.equal(state.weather, 'rainbow');
  assert.equal(state.visualScene, 'rainbow-after-rain');
  assert.equal(state.diagnostics.rainbowEvidence, true);
});

test('no activa rainbow de noche', () => {
  const payload = openMeteoPayload({
    time: '2026-07-25T23:00',
    probability: 80,
  });
  payload.hourly.time = ['2026-07-25T20:00', '2026-07-25T23:00', '2026-07-26T02:00'];
  assert.equal(mapOpenMeteoResponse(payload).weather, 'clear');
  assert.equal(hasRainbowEvidence({
    current: payload.current,
    hourly: payload.hourly,
    currentTime: payload.current.time,
    timeOfDay: 'night',
    baseWeather: 'clear',
  }), false);
});

test('usa fallback estable si faltan coordenadas', async () => {
  const warnings = [];
  const state = await getWeatherFromProvider({
    env: { PARAMO_WEATHER_PROVIDER: 'open-meteo' },
    logger: { warn: (message) => warnings.push(message) },
  });
  assert.equal(state.weather, 'cloudy');
  assert.equal(state.intensity, 'soft');
  assert.equal(state.source, 'fallback');
  assert.equal(state.diagnostics.reason, 'missing-coordinates');
  assert.match(warnings[0], /LATITUDE/);
});

test('usa fallback estable si Open-Meteo falla', async () => {
  const state = await getWeatherFromProvider({
    env: {
      PARAMO_WEATHER_PROVIDER: 'open-meteo',
      PARAMO_WEATHER_LATITUDE: '40.4',
      PARAMO_WEATHER_LONGITUDE: '-3.7',
    },
    fetchImpl: async () => {
      throw new Error('network down');
    },
    logger: { warn() {} },
  });
  assert.equal(state.source, 'fallback');
  assert.equal(state.diagnostics.reason, 'provider-error');
});

test('aplica el TTL solicitado al estado de Open-Meteo', () => {
  const now = new Date('2026-07-25T10:00:00Z');
  const state = mapOpenMeteoResponse(openMeteoPayload(), { now, ttlMs: 30 * 60 * 1000 });
  assert.equal(Date.parse(state.expiresAt) - Date.parse(state.updatedAt), 30 * 60 * 1000);
});
