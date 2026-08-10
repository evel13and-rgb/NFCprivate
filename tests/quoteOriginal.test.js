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
  const views = [];
  const elements = {
    button: createElement(),
    label: createElement(),
    onViewChange(view) { views.push(view); },
  };
  return { elements, views, controller: createQuoteOriginalController(elements) };
}

const original = { text: 'Test fixture original.', lang: 'en', label: 'Original inglés' };
const translation = { id: 'quote-test', t: 'Texto traducido.', lang: 'es', original };

test('una frase sin original oculta el botón y muestra solo la traducción', () => {
  const { elements, views, controller } = createController();
  controller.render({ id: 'quote-test', t: 'Solo traducción.', lang: 'es' });
  assert.equal(elements.button.hidden, true);
  assert.equal(elements.button.textContent, 'Original');
  assert.equal(elements.button.getAttribute('aria-pressed'), 'false');
  assert.deepEqual(views.at(-1), { text: 'Solo traducción.', lang: 'es', view: 'translation' });
});

test('una frase con original conmuta el único texto entre original y traducción', () => {
  const { elements, views, controller } = createController();
  controller.render(translation);
  assert.equal(elements.button.hidden, false);
  assert.equal(elements.button.textContent, 'Original');
  assert.equal(elements.button.getAttribute('aria-label'), 'Ver texto original');
  assert.deepEqual(views.at(-1), { text: translation.t, lang: 'es', view: 'translation' });
  elements.button.click();
  assert.equal(elements.button.getAttribute('aria-pressed'), 'true');
  assert.equal(elements.button.textContent, 'Traducción');
  assert.equal(elements.button.getAttribute('aria-label'), 'Ver traducción');
  assert.equal(elements.label.hidden, false);
  assert.equal(elements.label.textContent, 'Original inglés');
  assert.deepEqual(views.at(-1), { text: original.text, lang: 'en', view: 'original' });
  elements.button.click();
  assert.equal(elements.button.getAttribute('aria-pressed'), 'false');
  assert.equal(elements.button.textContent, 'Original');
  assert.equal(elements.label.hidden, true);
  assert.deepEqual(views.at(-1), { text: translation.t, lang: 'es', view: 'translation' });
  assert.equal(views.every(view => typeof view.text === 'string'), true);
});

test('cambiar de frase restablece siempre la traducción', () => {
  const { elements, views, controller } = createController();
  controller.render({ ...translation, id: 'quote-one' });
  controller.toggle();
  controller.render({ id: 'quote-two', t: 'Nueva traducción.', lang: 'es' });
  assert.equal(elements.button.getAttribute('aria-pressed'), 'false');
  assert.equal(elements.button.hidden, true);
  assert.equal(elements.button.textContent, 'Original');
  assert.equal(elements.label.hidden, true);
  assert.deepEqual(views.at(-1), { text: 'Nueva traducción.', lang: 'es', view: 'translation' });
});

test('rechaza originales vacíos o incompletos', () => {
  assert.equal(normalizeQuoteOriginal({ text: '', lang: 'en', label: 'Original inglés' }), null);
  assert.equal(normalizeQuoteOriginal({ text: 'Text', lang: '', label: 'Original' }), null);
  assert.equal(normalizeQuoteOriginal(null), null);
});
