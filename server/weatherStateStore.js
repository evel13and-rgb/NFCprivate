import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deriveVisualScene } from '../weatherVisual.js';
import {
  buildWeatherState,
  hasSameWeatherFields,
  isValidWeatherState,
  normalizeWeatherFields,
} from './weatherMapping.js';
import { getWeatherFromProvider, getWeatherProviderConfig } from './weatherProvider.js';

const DEFAULT_TTL_MS = getWeatherProviderConfig().ttlMinutes * 60 * 1000;
const SERVER_DIR = dirname(fileURLToPath(import.meta.url));

const WEATHER_STATE_FILE = process.env.PARAMO_WEATHER_STATE_FILE
  ? resolve(process.env.PARAMO_WEATHER_STATE_FILE)
  : resolve(SERVER_DIR, 'weather-state.json');

const WEATHER_OVERRIDE_FILE = process.env.PARAMO_WEATHER_OVERRIDE_FILE
  ? resolve(process.env.PARAMO_WEATHER_OVERRIDE_FILE)
  : resolve(SERVER_DIR, 'weather-override.json');
let activeWeatherRequest = null;

async function readJsonFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function writeJsonFile(filePath, data) {
  await mkdir(dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, filePath);
}

async function getFileUpdatedAt(filePath, fallbackDate) {
  try {
    const fileStats = await stat(filePath);
    return fileStats.mtime;
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return fallbackDate;
    }
    throw error;
  }
}

export function isWeatherStateExpired(state, now) {
  return Date.parse(state.expiresAt) <= now.getTime();
}

export function canReusePersistedWeatherState(state, now, config = getWeatherProviderConfig()) {
  if (!state || isWeatherStateExpired(state, now) || state.source === 'manual-override') {
    return false;
  }
  if (
    state.source === 'fallback'
    && state.diagnostics?.reason === 'missing-coordinates'
    && config.provider === 'open-meteo'
    && config.latitude !== null
    && config.longitude !== null
  ) {
    return false;
  }
  return true;
}

async function readPersistedWeatherState() {
  const state = await readJsonFile(WEATHER_STATE_FILE);
  return isValidWeatherState(state) ? state : null;
}

async function readManualOverride(now) {
  let override;
  try {
    override = await readJsonFile(WEATHER_OVERRIDE_FILE);
  } catch (error) {
    if (['EACCES', 'EPERM'].includes(error?.code)) {
      console.warn(`Override no legible en ${WEATHER_OVERRIDE_FILE}; se usará el proveedor.`);
      return null;
    }
    throw error;
  }
  if (!override?.manualOverride) {
    return null;
  }

  const overrideUpdatedAt = await getFileUpdatedAt(WEATHER_OVERRIDE_FILE, now);
  const normalizedOverride = normalizeWeatherFields(override);
  return buildWeatherState({
    ...normalizedOverride,
    visualScene: deriveVisualScene(normalizedOverride.weather, normalizedOverride.timeOfDay),
    source: 'manual-override',
    provider: 'manual',
  }, overrideUpdatedAt, DEFAULT_TTL_MS);
}

async function resolveGlobalWeatherState(now) {
  const [persistedState, manualOverrideState] = await Promise.all([
    readPersistedWeatherState(),
    readManualOverride(now),
  ]);

  if (manualOverrideState) {
    if (
      persistedState
      && hasSameWeatherFields(persistedState, manualOverrideState)
      && !isWeatherStateExpired(persistedState, now)
    ) {
      return persistedState;
    }

    const nextState = buildWeatherState(manualOverrideState, now, DEFAULT_TTL_MS);
    await writeJsonFile(WEATHER_STATE_FILE, nextState);
    return nextState;
  }

  if (canReusePersistedWeatherState(persistedState, now)) {
    return persistedState;
  }

  const providerState = await getWeatherFromProvider({ now, ttlMs: DEFAULT_TTL_MS });
  await writeJsonFile(WEATHER_STATE_FILE, providerState);
  return providerState;
}

export function getGlobalWeatherState({ now = new Date() } = {}) {
  if (activeWeatherRequest) return activeWeatherRequest;
  activeWeatherRequest = resolveGlobalWeatherState(now)
    .finally(() => {
      activeWeatherRequest = null;
    });
  return activeWeatherRequest;
}

export const weatherStatePaths = Object.freeze({
  state: WEATHER_STATE_FILE,
  override: WEATHER_OVERRIDE_FILE,
});
