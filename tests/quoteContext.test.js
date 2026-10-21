import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createQuoteContextController,
  normalizeQuoteContextNotes,
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

test('el contexto solo aparece cuando existe y se cierra al cambiar de fragmento', () => {
  const container = createElementStub();
  const button = createElementStub();
  const panel = createElementStub();
  const list = createElementStub();
  list.ownerDocument = {
    createElement() { return createElementStub(); },
  };
  const controller = createQuoteContextController({ container, button, panel, list });

  controller.render({
    context_notes: [{ term: 'Iago e Imogen', explanation: 'Dos figuras opuestas.' }],
  });
  assert.equal(container.hidden, false);
  assert.equal(panel.hidden, true);
  assert.equal(list.children.length, 1);

  controller.toggle();
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(panel.hidden, false);

  controller.render({});
  assert.equal(container.hidden, true);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(panel.hidden, true);
});
