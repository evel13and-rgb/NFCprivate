import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildWeatherState,
  hasSameWeatherFields,
  isValidWeatherState,
  normalizeWeatherFields,
} from './weatherMapping.js';
import { getWeatherFromProvider } from './weatherProvider.js';

const DEFAULT_TTL_MS = Number.parseInt(process.env.PARAMO_WEATHER_TTL_MS || '', 10) || 60 * 60 * 1000;
const SERVER_DIR = dirname(fileURLToPath(import.meta.url));

const WEATHER_STATE_FILE = process.env.PARAMO_WEATHER_STATE_FILE
  ? resolve(process.env.PARAMO_WEATHER_STATE_FILE)
  : resolve(SERVER_DIR, 'weather-state.json');

const WEATHER_OVERRIDE_FILE = process.env.PARAMO_WEATHER_OVERRIDE_FILE
  ? resolve(process.env.PARAMO_WEATHER_OVERRIDE_FILE)
  : resolve(SERVER_DIR, 'weather-override.json');

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

function isExpired(state, now) {
  return Date.parse(state.expiresAt) <= now.getTime();
}

async function readPersistedWeatherState() {
  const state = await readJsonFile(WEATHER_STATE_FILE);
  return isValidWeatherState(state) ? state : null;
}

async function readManualOverride(now) {
  const override = await readJsonFile(WEATHER_OVERRIDE_FILE);
  if (!override?.manualOverride) {
    return null;
  }

  const overrideUpdatedAt = await getFileUpdatedAt(WEATHER_OVERRIDE_FILE, now);
  return buildWeatherState(normalizeWeatherFields(override), overrideUpdatedAt, DEFAULT_TTL_MS);
}

export async function getGlobalWeatherState({ now = new Date() } = {}) {
  const [persistedState, manualOverrideState] = await Promise.all([
    readPersistedWeatherState(),
    readManualOverride(now),
  ]);

  if (manualOverrideState) {
    if (
      persistedState
      && hasSameWeatherFields(persistedState, manualOverrideState)
      && !isExpired(persistedState, now)
    ) {
      return persistedState;
    }

    const nextState = buildWeatherState(manualOverrideState, now, DEFAULT_TTL_MS);
    await writeJsonFile(WEATHER_STATE_FILE, nextState);
    return nextState;
  }

  if (persistedState && !isExpired(persistedState, now)) {
    return persistedState;
  }

  const providerState = await getWeatherFromProvider({ now, ttlMs: DEFAULT_TTL_MS });
  await writeJsonFile(WEATHER_STATE_FILE, providerState);
  return providerState;
}

export const weatherStatePaths = Object.freeze({
  state: WEATHER_STATE_FILE,
  override: WEATHER_OVERRIDE_FILE,
});
