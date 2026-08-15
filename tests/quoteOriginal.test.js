import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createQuoteOriginalController,
  formatQuotedText,
  getQuoteBoundaryDecoration,
  normalizeQuoteOriginal,
} from '../quoteOriginal.js';

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

test('una obra española identifica la versión de regreso como actualización', () => {
  const { elements, views, controller } = createController();
  const historicalOriginal = {
    text: 'Sentose Félix.',
    lang: 'es',
    label: 'Original español',
  };
  controller.render({
    id: 'quote-spanish',
    t: 'Félix se sentó.',
    lang: 'es',
    original: historicalOriginal,
  });
  elements.button.click();
  assert.equal(elements.button.textContent, 'Actualización');
  assert.equal(elements.button.getAttribute('aria-label'), 'Ver actualización');
  assert.deepEqual(views.at(-1), { text: historicalOriginal.text, lang: 'es', view: 'original' });
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

test('añade comillas decorativas a un fragmento sin comillas exteriores', () => {
  assert.equal(formatQuotedText('Texto traducido.'), '“Texto traducido.”');
  assert.deepEqual(getQuoteBoundaryDecoration('Texto traducido.'), {
    addOpening: true,
    addClosing: true,
  });
});

test('no duplica las comillas tipográficas que ya delimitan un original', () => {
  const quotedOriginal = '“If I can’t stay here, there is no use in my loving Green Gables.”';
  assert.equal(formatQuotedText(quotedOriginal), quotedOriginal);
  assert.deepEqual(getQuoteBoundaryDecoration(quotedOriginal), {
    addOpening: false,
    addClosing: false,
  });
});

test('completa solo el extremo que no está delimitado', () => {
  assert.equal(formatQuotedText('“Un diálogo sin cierre'), '“Un diálogo sin cierre”');
  assert.equal(formatQuotedText('Un diálogo con cierre”'), '“Un diálogo con cierre”');
});

test('no duplica ni cierra artificialmente una marca de continuación de párrafo', () => {
  const continuation = '»¿De dónde ha brotado Eugenia? ¿qué soy yo?';
  assert.equal(formatQuotedText(continuation), continuation);
  assert.deepEqual(getQuoteBoundaryDecoration(continuation), {
    addOpening: false,
    addClosing: false,
  });
});
