export const PUBLIC_QUOTES_SCHEMA_VERSION = 1;

// Último recurso para que un fallo de red o de validación nunca deje la portada sin frase.
// El catálogo runtime completo vive exclusivamente en public/data/quotes.json.
export const EMERGENCY_QUOTES = Object.freeze([
  Object.freeze({
    id: 'quote-77',
    legacy_index: 77,
    t: 'Rosaura está sin honor;\nmás a un príncipe le toca\nel dar honor que quitarle.',
    a: 'Segismundo — Jornada Tercera',
    obra: 'La vida es sueño, Pedro Calderón de la Barca',
    highlight: null,
    lang: 'es',
    type: 'poem',
    authorId: 'author-pedro-calderon-de-la-barca',
    workId: 'work-la-vida-es-sueno',
  }),
  Object.freeze({
    id: 'quote-78',
    legacy_index: 78,
    t: 'La fortuna no se vence\ncon injusticia y venganza,\nporque antes se incita más.\nY así, quien vencer aguarda\na su fortuna ha de ser\ncon prudencia y con templanza.',
    a: 'Segismundo — Jornada Tercera',
    obra: 'La vida es sueño, Pedro Calderón de la Barca',
    highlight: null,
    lang: 'es',
    type: 'poem',
    authorId: 'author-pedro-calderon-de-la-barca',
    workId: 'work-la-vida-es-sueno',
  }),
  Object.freeze({
    id: 'quote-540',
    legacy_index: 540,
    t: 'Hay pocas personas a quienes ame de verdad y todavía menos de quienes piense bien.',
    a: 'Jane Austen',
    obra: 'Orgullo y prejuicio, Jane Austen',
    highlight: 'todavía menos de quienes piense bien',
    lang: 'es',
    type: 'prose',
    authorId: 'author-jane-austen',
    workId: 'work-orgullo-y-prejuicio',
  }),
]);

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
    if (quote.original !== undefined) {
      const original = quote.original;
      const allowedOriginalFields = new Set(['text', 'lang', 'label']);
      if (!original || typeof original !== 'object' || Array.isArray(original)) {
        throw new Error(`quotes.json: quotes[${position}].original es inválido`);
      }
      const unexpectedFields = Object.keys(original).filter(field => !allowedOriginalFields.has(field));
      if (unexpectedFields.length) {
        throw new Error(`quotes.json: quotes[${position}].original contiene campos no públicos`);
      }
      for (const field of allowedOriginalFields) {
        if (typeof original[field] !== 'string' || !original[field].trim()) {
          throw new Error(`quotes.json: quotes[${position}].original.${field} es inválido`);
        }
      }
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

export async function loadPublicQuotes(
  relativePath,
  fallbackQuotes = EMERGENCY_QUOTES,
  fetchImpl = globalThis.fetch,
  expectedCount,
) {
  try {
    if (typeof fetchImpl !== 'function') throw new Error('fetch no está disponible');
    const response = await fetchImpl(relativePath);
    if (!response?.ok) throw new Error(`HTTP ${response?.status ?? 'desconocido'}`);
    const document = await response.json();
    return {
      quotes: validatePublicQuotesDocument(document, expectedCount),
      source: 'public-json',
      error: null,
    };
  } catch (error) {
    return { quotes: fallbackQuotes, source: 'emergency-fallback', error };
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
