export const STORAGE_VERSION = 'v3';
export const STORAGE_KEY = `paramo-literario-${STORAGE_VERSION}-vistos`;
const LEGACY_KEYS = ['paramo-literario-vistos', 'paramo-literario-v2-vistos'];

function sanitizeRandom(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return Math.random();
  }
  if (value < 0) return 0;
  if (value >= 1) return 0.999999999999;
  return value;
}

function readSeenIndexes(storage) {
  try {
    const raw = storage.getItem?.(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSeenIndexes(storage, seen) {
  storage.setItem?.(STORAGE_KEY, JSON.stringify(seen));
}

function sanitizeSeenIndexes(seen, total) {
  if (!Array.isArray(seen) || total <= 0) {
    return [];
  }
  const filtered = [];
  for (const value of seen) {
    if (
      Number.isInteger(value) &&
      value >= 0 &&
      value < total &&
      !filtered.includes(value)
    ) {
      filtered.push(value);
    }
  }
  return filtered;
}

function purgeLegacyKeys(storage) {
  if (!storage) return;
  for (const key of LEGACY_KEYS) {
    if (key === STORAGE_KEY) continue;
    storage.removeItem?.(key);
  }
}

export function createMemoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = String(value);
    },
    removeItem(key) {
      delete data[key];
    }
  };
}

export function createQuoteManager(quotes, storage, rng = Math.random) {
  if (!Array.isArray(quotes) || quotes.length === 0) {
    throw new Error('quotes must be a non-empty array');
  }
  const store = storage ?? createMemoryStorage();
  purgeLegacyKeys(store);

  function next() {
    let seen = sanitizeSeenIndexes(readSeenIndexes(store), quotes.length);
    if (seen.length >= quotes.length) {
      seen = [];
    }
    const available = [];
    for (let i = 0; i < quotes.length; i += 1) {
      if (!seen.includes(i)) {
        available.push(i);
      }
    }
    const randomValue = sanitizeRandom(rng());
    const choice = available[Math.floor(randomValue * available.length)];
    const updated = [...seen, choice];
    writeSeenIndexes(store, updated);
    return { ...quotes[choice], idx: choice };
  }

  function reset() {
    if (typeof store.removeItem === 'function') {
      store.removeItem(STORAGE_KEY);
    } else {
      writeSeenIndexes(store, []);
    }
  }

  function getSeenIndexes() {
    return sanitizeSeenIndexes(readSeenIndexes(store), quotes.length);
  }

  return { next, reset, getSeenIndexes };
}
