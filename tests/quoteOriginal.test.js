import test from 'node:test';
import assert from 'node:assert/strict';
import { createQuoteOriginalController, normalizeQuoteOriginal } from '../quoteOriginal.js';

function createElement() {
  const attributes = new Map();
  let clickHandler = null;
  return {
    hidden: false,
    textContent: '',
    setAttribute(name, value) { attributes.set(name, String(value)); },
    getAttribute(name) { return attributes.get(name) ?? null; },
    removeAttribute(name) { attributes.delete(name); },
    addEventListener(type, handler) { if (type === 'click') clickHandler = handler; },
    click() { clickHandler?.(); },
  };
}

function createController() {
  const elements = {
    button: createElement(),
    panel: createElement(),
    label: createElement(),
    text: createElement(),
  };
  return { elements, controller: createQuoteOriginalController(elements) };
}

const original = { text: 'Test fixture original.', lang: 'en', label: 'Original inglés' };

test('una frase sin original oculta botón y bloque', () => {
  const { elements, controller } = createController();
  controller.render({ id: 'quote-test' });
  assert.equal(elements.button.hidden, true);
  assert.equal(elements.panel.hidden, true);
  assert.equal(elements.button.getAttribute('aria-expanded'), 'false');
});

test('una frase con original muestra el botón y alterna aria-expanded', () => {
  const { elements, controller } = createController();
  controller.render({ id: 'quote-test', original });
  assert.equal(elements.button.hidden, false);
  assert.equal(elements.panel.hidden, true);
  elements.button.click();
  assert.equal(elements.button.getAttribute('aria-expanded'), 'true');
  assert.equal(elements.panel.hidden, false);
  assert.equal(elements.text.textContent, original.text);
  assert.equal(elements.text.getAttribute('lang'), 'en');
  elements.button.click();
  assert.equal(elements.button.getAttribute('aria-expanded'), 'false');
  assert.equal(elements.panel.hidden, true);
});

test('cambiar de frase cierra y limpia el original anterior', () => {
  const { elements, controller } = createController();
  controller.render({ id: 'quote-one', original });
  controller.toggle();
  controller.render({ id: 'quote-two' });
  assert.equal(elements.button.getAttribute('aria-expanded'), 'false');
  assert.equal(elements.button.hidden, true);
  assert.equal(elements.panel.hidden, true);
  assert.equal(elements.text.textContent, '');
  assert.equal(elements.text.getAttribute('lang'), null);
});

test('rechaza originales vacíos o incompletos', () => {
  assert.equal(normalizeQuoteOriginal({ text: '', lang: 'en', label: 'Original inglés' }), null);
  assert.equal(normalizeQuoteOriginal({ text: 'Text', lang: '', label: 'Original' }), null);
  assert.equal(normalizeQuoteOriginal(null), null);
});
