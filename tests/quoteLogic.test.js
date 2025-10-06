import test from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryStorage, createQuoteManager, STORAGE_KEY } from '../quoteLogic.js';

const SAMPLE_QUOTES = [
  { t: 'Primera frase', a: 'Autora 1' },
  { t: 'Segunda frase', a: 'Autora 2' },
  { t: 'Tercera frase', a: 'Autora 3' }
];

test('devuelve cada cita una sola vez antes de repetir', () => {
  const rngValues = [0, 0, 0];
  const manager = createQuoteManager(SAMPLE_QUOTES, createMemoryStorage(), () => {
    return rngValues.shift() ?? 0;
  });

  const seen = new Set();
  for (let i = 0; i < SAMPLE_QUOTES.length; i += 1) {
    const quote = manager.next();
    assert.equal(typeof quote.t, 'string');
    assert.equal(typeof quote.a, 'string');
    assert.equal(seen.has(quote.idx), false);
    seen.add(quote.idx);
  }
  assert.equal(seen.size, SAMPLE_QUOTES.length);
});

test('reinicia el ciclo tras mostrar todas las citas', () => {
  const rngValues = [0, 0, 0];
  const manager = createQuoteManager(SAMPLE_QUOTES.slice(0, 2), createMemoryStorage(), () => {
    return rngValues.shift() ?? 0;
  });

  const first = manager.next();
  const second = manager.next();
  assert.notEqual(first.idx, second.idx);

  const third = manager.next();
  assert.ok(third.idx === first.idx || third.idx === second.idx);
  assert.deepEqual(manager.getSeenIndexes(), [third.idx]);
});

test('ignora datos corruptos en el almacenamiento', () => {
  const storage = createMemoryStorage({ [STORAGE_KEY]: '{invalid json' });
  const manager = createQuoteManager(SAMPLE_QUOTES, storage, () => 0);
  assert.doesNotThrow(() => {
    const quote = manager.next();
    assert.equal(typeof quote.idx, 'number');
  });
  assert.equal(manager.getSeenIndexes().length, 1);
});
