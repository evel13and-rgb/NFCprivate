export const PUBLIC_QUOTES_SCHEMA_VERSION = 1;

export function validatePublicQuotesDocument(document, expectedCount) {
  if (!document || typeof document !== 'object' || Array.isArray(document)) {
    throw new Error('quotes.json debe contener un objeto');
  }
  if (document.schema_version !== PUBLIC_QUOTES_SCHEMA_VERSION || !Array.isArray(document.quotes)) {
    throw new Error('quotes.json no cumple el esquema público esperado');
  }
  if (document.quote_count !== document.quotes.length) {
    throw new Error('quotes.json tiene un quote_count inconsistente');
  }
  if (Number.isInteger(expectedCount) && document.quotes.length !== expectedCount) {
    throw new Error(`quotes.json contiene ${document.quotes.length} frases; se esperaban ${expectedCount}`);
  }
  const ids = new Set();
  const legacyIndexes = new Set();
  for (const [position, quote] of document.quotes.entries()) {
    for (const field of ['id', 't', 'a', 'obra', 'lang', 'type']) {
      if (typeof quote?.[field] !== 'string' || !quote[field].length) {
        throw new Error(`quotes.json: quotes[${position}].${field} es inválido`);
      }
    }
    if (!(quote.highlight === null || typeof quote.highlight === 'string')) {
      throw new Error(`quotes.json: quotes[${position}].highlight es inválido`);
    }
    if (!Number.isInteger(quote.legacy_index) || quote.legacy_index < 0) {
      throw new Error(`quotes.json: quotes[${position}].legacy_index es inválido`);
    }
    if (ids.has(quote.id) || legacyIndexes.has(quote.legacy_index)) {
      throw new Error(`quotes.json contiene un id o legacy_index duplicado en quotes[${position}]`);
    }
    ids.add(quote.id);
    legacyIndexes.add(quote.legacy_index);
  }
  return document.quotes;
}

export async function loadPublicQuotes(relativePath, embeddedQuotes, fetchImpl = globalThis.fetch) {
  try {
    if (typeof fetchImpl !== 'function') throw new Error('fetch no está disponible');
    const response = await fetchImpl(relativePath);
    if (!response?.ok) throw new Error(`HTTP ${response?.status ?? 'desconocido'}`);
    const document = await response.json();
    return {
      quotes: validatePublicQuotesDocument(document, embeddedQuotes.length),
      source: 'public-json',
      error: null,
    };
  } catch (error) {
    return { quotes: embeddedQuotes, source: 'embedded-fallback', error };
  }
}

export function findStoredQuoteIndex(quotes, state) {
  if (!Array.isArray(quotes) || !state || typeof state !== 'object') return -1;
  if (typeof state.stableQuoteId === 'string') {
    const stableIndex = quotes.findIndex(quote => quote?.id === state.stableQuoteId);
    if (stableIndex >= 0) return stableIndex;
  }
  if (Number.isInteger(state.lastQuoteId)) {
    const legacyIndex = quotes.findIndex(quote => quote?.legacy_index === state.lastQuoteId);
    if (legacyIndex >= 0) return legacyIndex;
    if (state.lastQuoteId >= 0 && state.lastQuoteId < quotes.length) return state.lastQuoteId;
  }
  return -1;
}
