export const STORAGE_KEY = 'paramo-literario-vistos';

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

  function next() {
    let seen = readSeenIndexes(store);
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
    return [...readSeenIndexes(store)];
  }

  return { next, reset, getSeenIndexes };
}
