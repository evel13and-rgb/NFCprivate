import test from 'node:test';
import assert from 'node:assert/strict';
import { formatQuotedText, getQuoteBoundaryDecoration } from '../quoteText.js';

test('añade comillas decorativas a un fragmento sin comillas exteriores', () => {
  assert.equal(formatQuotedText('Texto traducido.'), '“Texto traducido.”');
  assert.deepEqual(getQuoteBoundaryDecoration('Texto traducido.'), {
    addOpening: true,
    addClosing: true,
  });
});

test('no duplica las comillas tipográficas que ya delimitan un original', () => {
  const original = '“If I can’t stay here, there is no use in my loving Green Gables.”';
  assert.equal(formatQuotedText(original), original);
  assert.deepEqual(getQuoteBoundaryDecoration(original), {
    addOpening: false,
    addClosing: false,
  });
});

test('completa solo el extremo que no está delimitado', () => {
  assert.equal(formatQuotedText('“Un diálogo sin cierre'), '“Un diálogo sin cierre”');
  assert.equal(formatQuotedText('Un diálogo con cierre”'), '“Un diálogo con cierre”');
});
