import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createQuoteContextController,
  normalizeQuoteContextNotes,
  normalizeQuoteLetterContext,
} from '../quoteContext.js';

function createElementStub() {
  return {
    attributes: new Map(),
    children: [],
    hidden: false,
    listeners: new Map(),
    append(...children) { this.children.push(...children); },
    addEventListener(type, listener) { this.listeners.set(type, listener); },
    getAttribute(name) { return this.attributes.get(name) ?? null; },
    replaceChildren(...children) { this.children = children; },
    setAttribute(name, value) { this.attributes.set(name, String(value)); },
  };
}

test('normaliza únicamente notas contextuales completas', () => {
  assert.deepEqual(normalizeQuoteContextNotes([
    { term: ' Iago ', explanation: ' Personaje de Shakespeare. ' },
    { term: '', explanation: 'Incompleta' },
    null,
  ]), [{ term: 'Iago', explanation: 'Personaje de Shakespeare.' }]);
});

test('normaliza el contexto epistolar y descarta objetos incompletos', () => {
  assert.deepEqual(normalizeQuoteLetterContext({
    recipient: ' Richard Woodhouse ',
    date: ' 27 de octubre de 1818 ',
    place: ' Londres ',
  }), {
    recipient: 'Richard Woodhouse',
    date: '27 de octubre de 1818',
    place: 'Londres',
  });
  assert.equal(normalizeQuoteLetterContext({ recipient: 'Fanny Brawne' }), null);
});

test('el contexto solo aparece cuando existe y se cierra al cambiar de fragmento', () => {
  const container = createElementStub();
  const button = createElementStub();
  const closeButton = createElementStub();
  const count = createElementStub();
  const panel = createElementStub();
  const list = createElementStub();
  list.ownerDocument = {
    createElement() { return createElementStub(); },
  };
  const controller = createQuoteContextController({
    container,
    button,
    closeButton,
    count,
    panel,
    list,
  });

  controller.render({
    letter_context: { recipient: 'Richard Woodhouse', date: '27 de octubre de 1818' },
    context_notes: [{ term: 'Iago e Imogen', explanation: 'Dos figuras opuestas.' }],
  });
  assert.equal(container.hidden, false);
  assert.equal(panel.hidden, true);
  assert.equal(count.textContent, '2');
  assert.equal(button.getAttribute('aria-label'), 'Abrir 2 elementos de contexto');
  assert.equal(list.children.length, 2);

  controller.toggle();
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(panel.hidden, false);

  closeButton.listeners.get('click')();
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(panel.hidden, true);

  controller.render({});
  assert.equal(container.hidden, true);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(panel.hidden, true);
});
