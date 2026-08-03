import { createQuoteManager } from './quoteLogic.js';
import { EMERGENCY_QUOTES, findStoredQuoteIndex, loadPublicQuotes } from './publicQuotes.js';
import { initFireflyAura } from './fireflies.js';
import { getTimeOfDay, isNightTime } from './dayNight.js';
import { initDaylightMotes, setDaylightMotesActive } from './dayMotes.js';
import {
  ALLOWED_TIMES_OF_DAY,
  FALLBACK_WEATHER_STATE,
  normalizeVisualWeatherState,
  resolveVisualWeatherState,
  supportsDaylightMotes,
} from './weatherVisual.js';
import { createSceneBackgroundController } from './sceneBackground.js?v=1';
const QUOTE_INTERVAL_HOURS = 0.5;
const QUOTE_INTERVAL_MS = QUOTE_INTERVAL_HOURS * 60 * 60 * 1000;
const QUOTE_STATE_KEY = 'paramo-literario-last-quote-state';
const SHARE_IMAGE_FILE_NAME = 'paramo-literario.png';

const ALLOWED_WEATHER_TIMES = new Set(ALLOWED_TIMES_OF_DAY);
const FALLBACK_TIME_OF_DAY = 'day';
const WEATHER_CHANGE_EVENT = 'paramo:weather-change';
const MIN_WEATHER_REFRESH_MS = 5 * 60 * 1000;
const MAX_WEATHER_REFRESH_MS = 60 * 60 * 1000;
const FAILED_WEATHER_REFRESH_MS = 15 * 60 * 1000;

const AUTHORS_INFO = {};

const WORKS_INFO = {};

async function fetchPublicProfiles(relativePath) {
  const response = await fetch(new URL(relativePath, import.meta.url));
  if (!response.ok) {
    throw new Error(`${relativePath}: HTTP ${response.status}`);
  }
  const profiles = await response.json();
  if (!profiles || typeof profiles !== 'object' || Array.isArray(profiles)) {
    throw new Error(`${relativePath}: se esperaba un objeto`);
  }
  return profiles;
}

async function loadPublicProfiles() {
  try {
    const profiles = await fetchPublicProfiles('./public/data/literary-profiles.json');
    const authorProfiles = Array.isArray(profiles?.authors) ? profiles.authors : [];
    const workProfiles = Array.isArray(profiles?.works) ? profiles.works : [];

    for (const profile of authorProfiles) {
      if (profile?.author_id) {
        AUTHORS_INFO[profile.author_id] = profile;
      }
    }
    for (const profile of workProfiles) {
      if (profile?.work_id) {
        WORKS_INFO[profile.work_id] = profile;
      }
    }
  } catch (error) {
    console.error('No se pudieron cargar las fichas literarias manuales', error);
  }
}

const publicProfilesReady = loadPublicProfiles();

const storage = typeof window !== 'undefined' ? window.localStorage : undefined;
let activeQuotes = EMERGENCY_QUOTES;
let quoteManager = createQuoteManager(activeQuotes, storage);
const publicQuotesReady = loadPublicQuotes('./public/data/quotes.json');

let currentQuote = null;
let quoteElementRef = null;
let quoteHighlightRef = null;
let quoteCardRef = null;
let shareButtonRef = null;
let listenVoiceButtonRef = null;
let shareFeedbackRef = null;
let isSharingImage = false;
let quoteImageCache = null;
let quoteImageGenerationPromise = null;
let shareFallbackImageUrl = null;
let currentSpeechUtterance = null;
let allWordElements = [];
let animatedWordElements = [];
let dayHandlersAttached = false;
let prefersReducedMotion = false;
let reduceMotionQuery = null;
let esNoche = isNightTime();
let activeModal = null;
let lastModalTrigger = null;
let activePortraitLightbox = null;
let latestServerWeatherState = null;
let weatherRefreshTimerId = null;
let sceneBackgroundController = null;

function initMotionPreferenceWatcher() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    prefersReducedMotion = false;
    return;
  }
  reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  prefersReducedMotion = reduceMotionQuery.matches;
  const listener = (event) => {
    prefersReducedMotion = event.matches;
    resetWordEffects();
    updateWordModeBindings();
  };
  if (typeof reduceMotionQuery.addEventListener === 'function') {
    reduceMotionQuery.addEventListener('change', listener);
  } else if (typeof reduceMotionQuery.addListener === 'function') {
    reduceMotionQuery.addListener(listener);
  }
}

function normalizeWeatherState(input = {}) {
  return normalizeVisualWeatherState(input);
}

function getFallbackWeatherState() {
  return {
    ...FALLBACK_WEATHER_STATE,
  };
}

function getLocalTimeOfDay() {
  const timeOfDay = getTimeOfDay();
  return ALLOWED_WEATHER_TIMES.has(timeOfDay) ? timeOfDay : FALLBACK_TIME_OF_DAY;
}

function updateAtmosphericParticles(weatherState) {
  setDaylightMotesActive(supportsDaylightMotes(weatherState));
}

function applyTimeOfDayToDocument(timeOfDay) {
  const body = document.body;
  if (!body) {
    return;
  }

  const isNight = timeOfDay === 'night';
  body.classList.toggle('night-fall', isNight);
  body.setAttribute('data-mode', timeOfDay);
  body.dataset.timeOfDay = timeOfDay;
  setNightModeState(isNight);
}

function applyWeatherStateToDocument(weatherState) {
  if (!document.body) {
    return;
  }

  const normalizedState = normalizeWeatherState(weatherState);
  const visualState = resolveVisualWeatherState(normalizedState, getLocalTimeOfDay());

  document.body.dataset.weather = visualState.weather;
  document.body.dataset.weatherIntensity = visualState.intensity;
  document.body.dataset.visualScene = visualState.visualScene;
  applyTimeOfDayToDocument(visualState.timeOfDay);
  sceneBackgroundController?.setScene(visualState);
  updateAtmosphericParticles(visualState);
  document.dispatchEvent(new CustomEvent(WEATHER_CHANGE_EVENT, {
    detail: visualState,
  }));
}

function scheduleWeatherRefresh(expiresAt, fallbackDelay = MAX_WEATHER_REFRESH_MS) {
  const scheduler = typeof window !== 'undefined' ? window : globalThis;
  if (!scheduler || typeof scheduler.setTimeout !== 'function') return;
  if (weatherRefreshTimerId) scheduler.clearTimeout(weatherRefreshTimerId);

  const expiresMs = Date.parse(expiresAt);
  const requestedDelay = Number.isFinite(expiresMs) ? expiresMs - Date.now() + 1000 : fallbackDelay;
  const delay = Math.min(MAX_WEATHER_REFRESH_MS, Math.max(MIN_WEATHER_REFRESH_MS, requestedDelay));
  weatherRefreshTimerId = scheduler.setTimeout(refreshGlobalWeatherState, delay);
}

async function refreshGlobalWeatherState() {
  try {
    const response = await fetch('/api/weather-state', {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`weather endpoint responded with ${response.status}`);
    }

    const weatherState = await response.json();
    latestServerWeatherState = weatherState;
    applyWeatherStateToDocument(weatherState);
    scheduleWeatherRefresh(weatherState.expiresAt);
  } catch (error) {
    console.warn('No se pudo refrescar el clima global; conservando el estado anterior.', error);
    if (!latestServerWeatherState) applyWeatherStateToDocument(getFallbackWeatherState());
    scheduleWeatherRefresh(null, FAILED_WEATHER_REFRESH_MS);
  }
}

function initGlobalWeatherState() {
  applyWeatherStateToDocument(getFallbackWeatherState());
  return refreshGlobalWeatherState();
}

function waitForLoaderDelay(delay) {
  return new Promise(resolve => window.setTimeout(resolve, delay));
}

function waitForInitialPaint() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(resolve);
    });
  });
}

function getAppLoaderTiming() {
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const returningVisit = document.documentElement.classList.contains('app-loader-returning');

  if (reducedMotion) {
    return { maximum: 50, removal: 140 };
  }
  if (returningVisit) {
    return { maximum: 100, removal: 220 };
  }
  return { maximum: 180, removal: 300 };
}

function dismissAppLoader(removalDelay) {
  const loader = document.getElementById('app-loader');
  document.body?.classList.remove('app-loading');
  if (!loader) return;

  loader.classList.add('is-leaving');
  loader.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => loader.remove(), removalDelay);
}

async function revealAppWhenReady() {
  const timing = getAppLoaderTiming();
  const safetyTimeout = waitForLoaderDelay(timing.maximum);

  await Promise.race([waitForInitialPaint(), safetyTimeout]);
  try {
    sessionStorage.setItem('paramo-loader-seen', '1');
  } catch {
    // La transición funciona igualmente si el almacenamiento está desactivado.
  }
  dismissAppLoader(timing.removal);
}

function createWordSpan(content, extraClass = '') {
  const span = document.createElement('span');
  span.className = extraClass ? `word ${extraClass}` : 'word';
  span.textContent = content;
  return span;
}

function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function interpolateNumber(from, to, amount) {
  return from + (to - from) * amount;
}

const QUOTE_LENGTH_CLASSES = [
  'quote-text--short',
  'quote-text--medium',
  'quote-text--long',
  'quote-text--very-long',
];

function getQuoteLengthClass(text) {
  const content = typeof text === 'string' ? text.trim() : '';
  const characterCount = Array.from(content).length;

  if (characterCount < 260) return 'quote-text--short';
  if (characterCount <= 520) return 'quote-text--medium';
  if (characterCount <= 900) return 'quote-text--long';
  return 'quote-text--very-long';
}

function applyQuoteLengthSizing(text) {
  if (!quoteElementRef) {
    return;
  }

  const normalizedText = typeof text === 'string' ? text.replace(/\s+/g, ' ').trim() : '';
  const characterCount = Array.from(normalizedText).length;
  const wordCount = normalizedText ? normalizedText.split(' ').length : 0;
  const effectiveLength = characterCount + Math.max(wordCount - 18, 0) * 2;
  const lengthAmount = clampNumber((effectiveLength - 70) / 170, 0, 1);

  const desktopSize = interpolateNumber(1.9, 1.38, lengthAmount);
  const mobileSize = interpolateNumber(1.46, 1.08, lengthAmount);
  const desktopLineHeight = interpolateNumber(1.3, 1.24, lengthAmount);
  const mobileLineHeight = interpolateNumber(1.23, 1.17, lengthAmount);

  quoteElementRef.style.setProperty('--quote-font-size', `${desktopSize.toFixed(2)}rem`);
  quoteElementRef.style.setProperty('--quote-mobile-font-size', `${mobileSize.toFixed(2)}rem`);
  quoteElementRef.style.setProperty('--quote-line-height', desktopLineHeight.toFixed(2));
  quoteElementRef.style.setProperty('--quote-mobile-line-height', mobileLineHeight.toFixed(2));
  quoteElementRef.dataset.quoteLength = lengthAmount < 0.33 ? 'short' : lengthAmount < 0.72 ? 'medium' : 'long';
}

function clearWordHighlight(word) {
  if (!word) return;
  const timerId = word._highlightTimerId;
  if (typeof timerId === 'number') {
    clearTimeout(timerId);
    delete word._highlightTimerId;
  }
  word.classList.remove('word--soft-glow');
}

function resetWordEffects() {
  for (const word of allWordElements) {
    if (!word) continue;
    clearWordHighlight(word);
    word.classList.remove('word--fall', 'word--returning', 'word--pulse');
    word.style.removeProperty('--word-fall-translate');
    word.style.removeProperty('--word-fall-rotate');
    word.style.removeProperty('--word-fall-duration');
    word.style.removeProperty('--word-return-duration');
  }
}

function detachNightHandlers() {
  for (const word of allWordElements) {
    if (!word) continue;
    const pointerHandler = word._nightPointerHandler;
    if (pointerHandler) {
      word.removeEventListener('pointerdown', pointerHandler);
      delete word._nightPointerHandler;
    }
    const animationHandler = word._nightAnimationHandler;
    if (animationHandler) {
      word.removeEventListener('animationend', animationHandler);
      word.removeEventListener('animationcancel', animationHandler);
      delete word._nightAnimationHandler;
    }
  }
}

function attachNightHandlers() {
  if (!esNoche || !animatedWordElements.length) {
    return;
  }
  for (const word of animatedWordElements) {
    if (!word) continue;
    const onPulse = () => {
      triggerWordPulse(word);
    };
    word.addEventListener('pointerdown', onPulse);
    word._nightPointerHandler = onPulse;
    const onAnimationDone = () => {
      word.classList.remove('word--pulse');
    };
    word.addEventListener('animationend', onAnimationDone);
    word.addEventListener('animationcancel', onAnimationDone);
    word._nightAnimationHandler = onAnimationDone;
  }
}

function triggerWordPulse(word) {
  if (!word) return;
  if (prefersReducedMotion) {
    applySoftHighlight([word], 900);
    return;
  }
  word.classList.remove('word--pulse');
  // force reflow to restart animation when needed
  void word.offsetWidth; // eslint-disable-line no-unused-expressions
  word.classList.add('word--pulse');
}

function detachDayHandlers() {
  if (!dayHandlersAttached) {
    return;
  }
  dayHandlersAttached = false;
  for (const word of allWordElements) {
    if (!word) continue;
    const pointerHandler = word._dayPointerHandler;
    if (pointerHandler) {
      word.removeEventListener('pointerdown', pointerHandler);
      delete word._dayPointerHandler;
    }
    const animationHandler = word._dayAnimationHandler;
    if (animationHandler) {
      word.removeEventListener('animationend', animationHandler);
      word.removeEventListener('animationcancel', animationHandler);
      delete word._dayAnimationHandler;
    }
  }
}

function applySoftHighlight(words, duration = 600) {
  if (!words || !words.length) {
    return;
  }
  for (const word of words) {
    if (!word) continue;
    clearWordHighlight(word);
    word.classList.add('word--soft-glow');
    const timeoutId = setTimeout(() => {
      word.classList.remove('word--soft-glow');
      delete word._highlightTimerId;
    }, duration);
    word._highlightTimerId = timeoutId;
  }
}

function attachDayHandlers() {
  if (dayHandlersAttached || !quoteElementRef) {
    return;
  }
  dayHandlersAttached = true;
  for (const word of animatedWordElements) {
    if (!word) continue;
    const onPulse = () => {
      triggerWordPulse(word);
    };
    word.addEventListener('pointerdown', onPulse);
    word._dayPointerHandler = onPulse;
    const onAnimationDone = () => {
      word.classList.remove('word--pulse');
    };
    word.addEventListener('animationend', onAnimationDone);
    word.addEventListener('animationcancel', onAnimationDone);
    word._dayAnimationHandler = onAnimationDone;
  }
}

function updateWordModeBindings() {
  if (!quoteElementRef) {
    return;
  }
  if (esNoche) {
    detachDayHandlers();
    detachNightHandlers();
    attachNightHandlers();
  } else {
    detachNightHandlers();
    attachDayHandlers();
  }
}

function setNightModeState(isNight) {
  const changed = esNoche !== isNight;
  esNoche = isNight;
  if (changed) {
    resetWordEffects();
  }
  updateWordModeBindings();
}

function setQuoteTextContent(text, { includeQuotes = true } = {}) {
  if (!quoteElementRef) {
    return;
  }
  if (allWordElements.length) {
    resetWordEffects();
    detachNightHandlers();
    detachDayHandlers();
  }
  const fragment = document.createDocumentFragment();
  if (includeQuotes) {
    fragment.appendChild(createWordSpan('“', 'word--quote-open'));
  }
  const content = typeof text === 'string' ? text : '';
  applyQuoteLengthSizing(content);
  const tokens = content.split(/(\s+)/);
  for (const token of tokens) {
    if (!token) continue;
    if (/^\s+$/.test(token)) {
      fragment.appendChild(document.createTextNode(token));
    } else {
      fragment.appendChild(createWordSpan(token));
    }
  }
  if (includeQuotes) {
    fragment.appendChild(createWordSpan('”', 'word--quote-close'));
  }
  quoteElementRef.replaceChildren(fragment);
  allWordElements = Array.from(quoteElementRef.querySelectorAll('.word'));
  animatedWordElements = allWordElements;
  updateWordModeBindings();
}

function applyDayNightMode() {
  const body = document.body;
  if (!body) {
    return;
  }

  applyWeatherStateToDocument(latestServerWeatherState || {
    weather: body.dataset.weather || FALLBACK_WEATHER_STATE.weather,
    intensity: body.dataset.weatherIntensity || FALLBACK_WEATHER_STATE.intensity,
  });
}

function scheduleDayNightModeUpdates() {
  applyDayNightMode();
  const scheduler = typeof window !== 'undefined' ? window : globalThis;
  if (scheduler && typeof scheduler.setInterval === 'function') {
    scheduler.setInterval(applyDayNightMode, 60 * 1000);
  }
}

function readQuoteState() {
  if (!storage) return null;
  try {
    const raw = storage.getItem(QUOTE_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      lastQuoteId: parsed.lastQuoteId,
      stableQuoteId: parsed.stableQuoteId,
      lastShownAt: parsed.lastShownAt,
      nextAllowedAt: parsed.nextAllowedAt
    };
  } catch {
    return null;
  }
}

function writeQuoteState(state) {
  if (!storage) return;
  try {
    storage.setItem(QUOTE_STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors silently
  }
}

function toQuoteWithIndex(idx) {
  if (!Number.isInteger(idx) || idx < 0 || idx >= activeQuotes.length) {
    return null;
  }
  const base = activeQuotes[idx];
  return base ? { ...base, idx } : null;
}

function getNavigationType() {
  if (typeof performance === 'undefined' || typeof performance.getEntriesByType !== 'function') {
    return 'navigate';
  }
  const entries = performance.getEntriesByType('navigation');
  if (entries && entries.length > 0) {
    return entries[0].type || 'navigate';
  }
  return 'navigate';
}

function storeNewQuote(quote, timestamp) {
  if (!quote) return;
  const shownAt = typeof timestamp === 'number' ? timestamp : Date.now();
  writeQuoteState({
    lastQuoteId: Number.isInteger(quote.legacy_index) ? quote.legacy_index : quote.idx,
    stableQuoteId: typeof quote.id === 'string' ? quote.id : null,
    lastShownAt: shownAt,
    nextAllowedAt: shownAt + QUOTE_INTERVAL_MS
  });
}

function pickNewQuote() {
  const nextQuote = quoteManager.next();
  storeNewQuote(nextQuote, Date.now());
  return nextQuote;
}

function determineQuoteForDisplay() {
  const navigationType = getNavigationType();
  const storedState = readQuoteState();
  const now = Date.now();
  const storedQuoteIndex = findStoredQuoteIndex(activeQuotes, storedState);
  const storedQuote = toQuoteWithIndex(storedQuoteIndex);

  if (navigationType === 'reload' || navigationType === 'back_forward') {
    if (storedQuote) {
      return { quote: storedQuote };
    }
    return { quote: pickNewQuote() };
  }

  if (storedQuote && typeof storedState?.nextAllowedAt === 'number' && now < storedState.nextAllowedAt) {
    return {
      quote: storedQuote,
      message: 'Aún respira esta frase. Vuelve más tarde para otra.'
    };
  }

  return { quote: pickNewQuote() };
}

function ensureMessageElement() {
  let messageElement = document.getElementById('quote-message');
  if (!messageElement) {
    const panel = document.getElementById('quote-panel');
    if (!panel) {
      return null;
    }
    messageElement = document.createElement('p');
    messageElement.id = 'quote-message';
    messageElement.className = 'tiny';
    messageElement.hidden = true;
    panel.appendChild(messageElement);
  }
  return messageElement;
}

function setGentleMessage(message) {
  const element = ensureMessageElement();
  if (!element) return;
  if (message) {
    element.textContent = message;
    element.hidden = false;
  } else {
    element.textContent = '';
    element.hidden = true;
  }
}

function slugify(value) {
  if (!value) return '';
  return value
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function splitWorkMetadata(work) {
  if (!work || typeof work !== 'string') {
    return { title: '', author: '' };
  }
  const lastCommaIndex = work.lastIndexOf(',');
  if (lastCommaIndex === -1) {
    return { title: work.trim(), author: '' };
  }
  const title = work.slice(0, lastCommaIndex).trim();
  const author = work.slice(lastCommaIndex + 1).trim();
  return { title, author };
}

function getQuoteMetadata(quote) {
  const { title, author: inferredAuthor } = splitWorkMetadata(quote.obra ?? '');
  const workTitle = title || quote.obra || '';
  const author = quote.autor ?? inferredAuthor;
  return { author, workTitle };
}

function getCatalogEntry(type, id) {
  if (!id) return null;
  const catalog = type === 'author' ? AUTHORS_INFO : WORKS_INFO;
  return catalog[id] ?? null;
}

function hasProfileValue(value) {
  if (Array.isArray(value)) {
    return value.some(item => typeof item === 'string' && item.trim());
  }
  return value !== null
    && value !== undefined
    && (typeof value !== 'string' || Boolean(value.trim()));
}

function appendProfileMetaLine(container, items, options = {}) {
  const values = items.filter(([, value]) => hasProfileValue(value));
  if (!values.length) return;
  const line = document.createElement('p');
  line.className = `profile-meta${options.secondary ? ' profile-meta--secondary' : ''}`;
  for (const [label, value, suffix] of values) {
    const item = document.createElement('span');
    item.className = 'profile-meta__item';
    item.setAttribute('aria-label', `${label}: ${value}${suffix || ''}`);
    item.textContent = `${value}${suffix || ''}`;
    line.appendChild(item);
  }
  container.appendChild(line);
}

function appendProfileSection(container, title, value, options = {}) {
  if (!hasProfileValue(value)) return;
  const section = document.createElement('section');
  section.className = `profile-section${options.compact ? ' profile-section--compact' : ''}`;
  const heading = document.createElement('h3');
  heading.className = 'profile-section__title';
  heading.textContent = title;
  section.appendChild(heading);

  if (Array.isArray(value) && !options.paragraphs) {
    const list = document.createElement('ul');
    list.className = options.chips ? 'profile-themes' : 'profile-list';
    for (const text of value) {
      if (typeof text !== 'string' || !text.trim()) continue;
      const item = document.createElement('li');
      item.textContent = text;
      list.appendChild(item);
    }
    section.appendChild(list);
  } else {
    const paragraphs = options.paragraphs ? value : [value];
    for (const text of paragraphs) {
      if (!hasProfileValue(text)) continue;
      const paragraph = document.createElement('p');
      paragraph.className = 'profile-section__text';
      paragraph.textContent = text;
      section.appendChild(paragraph);
    }
  }
  container.appendChild(section);
}

function getPortraitLightboxFocusableElements(root) {
  return [...root.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')]
    .filter(element => !element.hidden && !element.hasAttribute('disabled'));
}

function closePortraitLightbox() {
  if (!activePortraitLightbox || activePortraitLightbox.closing) return;
  const lightbox = activePortraitLightbox;
  lightbox.closing = true;
  lightbox.root.classList.add('is-closing');
  lightbox.root.classList.remove('is-open');
  document.removeEventListener('keydown', handlePortraitLightboxKeydown, true);

  const finishClosing = () => {
    if (activePortraitLightbox !== lightbox) return;
    lightbox.root.remove();
    if (activeModal?.root) activeModal.root.inert = false;
    activePortraitLightbox = null;
    if (typeof lightbox.trigger.focus === 'function') {
      lightbox.trigger.focus({ preventScroll: true });
    }
  };

  window.setTimeout(finishClosing, prefersReducedMotion ? 120 : 320);
}

function handlePortraitLightboxKeydown(event) {
  if (!activePortraitLightbox) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    closePortraitLightbox();
    return;
  }
  if (event.key !== 'Tab') return;

  const focusable = getPortraitLightboxFocusableElements(activePortraitLightbox.root);
  if (!focusable.length) {
    event.preventDefault();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function openPortraitLightbox(portrait, trigger) {
  if (activePortraitLightbox || !portrait?.path || !portrait?.alt) return;

  const root = document.createElement('div');
  root.className = 'portrait-lightbox';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', portrait.alt);

  const backdrop = document.createElement('div');
  backdrop.className = 'portrait-lightbox__backdrop';
  backdrop.addEventListener('click', closePortraitLightbox);

  const figure = document.createElement('figure');
  figure.className = 'portrait-lightbox__figure';

  const image = document.createElement('img');
  image.className = 'portrait-lightbox__image';
  image.src = `./${portrait.path}`;
  image.alt = portrait.alt;
  image.decoding = 'async';
  figure.appendChild(image);

  const details = [portrait.caption, portrait.credit, portrait.rights].filter(hasProfileValue);
  if (details.length || portrait.source_url) {
    const caption = document.createElement('figcaption');
    caption.className = 'portrait-lightbox__caption';
    caption.id = 'portrait-lightbox-caption';
    if (details.length) {
      const text = document.createElement('span');
      text.textContent = details.join(' · ');
      caption.appendChild(text);
    }
    if (portrait.source_url) {
      const source = document.createElement('a');
      source.href = portrait.source_url;
      source.target = '_blank';
      source.rel = 'noopener noreferrer';
      source.textContent = 'Ver fuente';
      caption.appendChild(source);
    }
    figure.appendChild(caption);
    root.setAttribute('aria-describedby', caption.id);
  }

  const close = document.createElement('button');
  close.className = 'portrait-lightbox__close';
  close.type = 'button';
  close.setAttribute('aria-label', 'Cerrar retrato ampliado');
  close.textContent = '×';
  close.addEventListener('click', closePortraitLightbox);

  root.append(backdrop, figure, close);
  document.body.appendChild(root);
  if (activeModal?.root) activeModal.root.inert = true;
  activePortraitLightbox = { root, trigger, closing: false };
  document.addEventListener('keydown', handlePortraitLightboxKeydown, true);
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => root.classList.add('is-open'));
  });
  close.focus({ preventScroll: true });
}

function getVisiblePortraitAttribution(portrait) {
  const details = [portrait?.caption, portrait?.credit].filter(hasProfileValue);
  return details.filter((detail, index) => {
    const normalizedDetail = detail.trim().toLocaleLowerCase('es');
    return !details.slice(0, index).some(previous => {
      const normalizedPrevious = previous.trim().toLocaleLowerCase('es');
      return normalizedPrevious === normalizedDetail
        || normalizedPrevious.includes(normalizedDetail)
        || normalizedDetail.includes(normalizedPrevious);
    });
  });
}

function appendAuthorPortrait(container, portrait) {
  if (!portrait?.path || !portrait?.alt) return;
  const figure = document.createElement('figure');
  figure.className = 'author-portrait';
  const frame = document.createElement('button');
  frame.className = 'author-portrait__frame';
  frame.type = 'button';
  frame.setAttribute('aria-label', `Ampliar ${portrait.alt.toLocaleLowerCase('es')}`);
  frame.addEventListener('click', () => openPortraitLightbox(portrait, frame));
  const image = document.createElement('img');
  image.className = 'author-portrait__image';
  image.src = `./${portrait.path}`;
  image.alt = portrait.alt;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.width = 800;
  image.height = 1000;
  const portraitPosition = typeof portrait.object_position === 'string'
    && /^[0-9]{1,3}% [0-9]{1,3}%$/.test(portrait.object_position)
    ? portrait.object_position
    : '50% 38%';
  image.style.setProperty('--portrait-fit', 'cover');
  image.style.setProperty('--portrait-position', portraitPosition);
  image.style.setProperty('--portrait-scale', '1');
  image.style.setProperty('--portrait-translate-x', '0%');
  image.style.setProperty('--portrait-translate-y', '0%');
  frame.appendChild(image);
  figure.appendChild(frame);

  const details = getVisiblePortraitAttribution(portrait);
  if (details.length) {
    const caption = document.createElement('figcaption');
    caption.className = 'author-portrait__caption';
    if (portrait.source_url) {
      const link = document.createElement('a');
      link.href = portrait.source_url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = details.join(' · ');
      caption.appendChild(link);
    } else {
      caption.textContent = details.join(' · ');
    }
    figure.appendChild(caption);
  }
  container.appendChild(figure);
}

function renderInfoContent(type, contentElement, entry) {
  if (!contentElement) return;
  const fragment = document.createDocumentFragment();

  if (entry) {
    if (type === 'author') {
      appendAuthorPortrait(fragment, entry.portrait);
      const dates = entry.birth_year && entry.death_year
        ? `${entry.birth_year}–${entry.death_year}`
        : entry.birth_year || entry.death_year || null;
      appendProfileMetaLine(fragment, [
        ['Fechas', dates],
        ['País', entry.country],
        ['Lengua', entry.language],
      ]);
      appendProfileMetaLine(fragment, [
        ['Época', entry.period],
        ['Movimiento o corriente', entry.movement],
      ], { secondary: true });
      const biographies = [entry.bio_short];
      if (entry.bio_long && entry.bio_long !== entry.bio_short) biographies.push(entry.bio_long);
      appendProfileSection(fragment, 'Biografía', biographies, { paragraphs: true });
      appendProfileSection(fragment, 'Temas', entry.themes, { chips: true });
      appendProfileSection(fragment, 'Estilo y tono', entry.tone_notes);
      appendProfileSection(
        fragment,
        'En Páramo Literario',
        entry.why_in_paramo,
      );
      appendProfileSection(
        fragment,
        'Fuentes de información',
        entry.information_sources,
        { compact: true },
      );
    } else {
      const authorEntry = getCatalogEntry('author', entry.author_id);
      appendProfileMetaLine(fragment, [
        ['Autor', authorEntry?.display_name],
        ['Año', entry.publication_year],
        ['Género', entry.genre],
        ['Fragmentos incluidos', entry.fragment_count, ' fragmentos incluidos'],
      ]);
      appendProfileMetaLine(fragment, [
        ['Título original', entry.original_title],
        ['Lengua', entry.language],
      ], { secondary: true });
      const summaries = [entry.summary_short];
      if (entry.summary_long && entry.summary_long !== entry.summary_short) summaries.push(entry.summary_long);
      appendProfileSection(fragment, 'Resumen', summaries, { paragraphs: true });
      appendProfileSection(fragment, 'Contexto', entry.context_notes);
      appendProfileSection(fragment, 'Temas', entry.themes, { chips: true });
      appendProfileSection(fragment, 'Tono', entry.tone_notes);
      appendProfileSection(fragment, 'Fragmentos', entry.fragment_notes);
      appendProfileSection(
        fragment,
        'En Páramo Literario',
        entry.why_in_paramo,
      );
      appendProfileSection(
        fragment,
        'Fuentes de información',
        entry.information_sources,
        { compact: true },
      );
    }
  }

  if (!fragment.childNodes.length) {
    const pending = document.createElement('p');
    pending.textContent = type === 'author'
      ? 'Ficha de autor pendiente.'
      : 'Ficha de obra pendiente.';
    fragment.appendChild(pending);
  }

  contentElement.replaceChildren(fragment);
}

function getModalElements(type) {
  const baseId = type === 'author' ? 'author' : 'work';
  const modal = document.getElementById(`${baseId}-modal`);
  if (!modal) return null;
  return {
    root: modal,
    overlay: modal.querySelector('.modal__overlay'),
    dialog: modal.querySelector('.modal__dialog'),
    title: modal.querySelector('.modal__title'),
    content: modal.querySelector(type === 'author' ? '.author-content' : '.work-content'),
    close: modal.querySelector('.modal__close')
  };
}

function closeActiveModal() {
  if (!activeModal) return;
  const { root } = activeModal;
  root.classList.add('is-hidden');
  root.setAttribute('aria-hidden', 'true');
  document.removeEventListener('keydown', handleEscapeKey, true);
  document.body.classList.remove('modal-open');
  if (lastModalTrigger && typeof lastModalTrigger.focus === 'function') {
    lastModalTrigger.focus({ preventScroll: true });
  }
  activeModal = null;
}

function handleEscapeKey(event) {
  if (activePortraitLightbox) return;
  if (event.key === 'Escape') {
    closeActiveModal();
  }
}

async function openModal(type, triggerElement, titleText) {
  const elements = getModalElements(type);
  if (!elements) return;
  const catalogId = type === 'author'
    ? triggerElement?.dataset?.authorId
    : triggerElement?.dataset?.workId;

  elements.root.classList.remove('is-hidden');
  elements.root.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  if (elements.title) {
    elements.title.textContent = titleText || '';
  }
  await publicProfilesReady;
  const entry = getCatalogEntry(type, catalogId || slugify(titleText || ''));
  renderInfoContent(type, elements.content, entry);
  if (elements.content) {
    elements.content.scrollTop = 0;
  }
  if (elements.close) {
    elements.close.focus({ preventScroll: true });
  }

  activeModal = { type, ...elements };
  lastModalTrigger = triggerElement;
  document.addEventListener('keydown', handleEscapeKey, true);
}

function bindModal(type) {
  const elements = getModalElements(type);
  if (!elements) return;
  if (elements.overlay) {
    elements.overlay.addEventListener('click', closeActiveModal);
  }
  if (elements.close) {
    elements.close.addEventListener('click', closeActiveModal);
  }
  if (elements.dialog) {
    elements.dialog.addEventListener('click', (event) => event.stopPropagation());
  }
  if (elements.root) {
    elements.root.addEventListener('click', (event) => {
      if (event.target === elements.root) {
        closeActiveModal();
      }
    });
  }
}

function initMetadataInteractions() {
  const authorLink = document.getElementById('author-name');
  const workLink = document.getElementById('author-work');

  bindModal('author');
  bindModal('work');

  if (authorLink?.tagName === 'BUTTON') {
    authorLink.addEventListener('click', () => {
      if (authorLink.hidden) return;
      openModal('author', authorLink, authorLink.textContent);
    });
  }

  if (workLink?.tagName === 'BUTTON') {
    workLink.addEventListener('click', () => {
      if (workLink.hidden) return;
      openModal('work', workLink, workLink.textContent);
    });
  }
}

function getQuoteIdentifier() {
  if (typeof currentQuote?.idx === 'number') {
    return currentQuote.idx;
  }
  if (typeof currentQuote?.id === 'string' && currentQuote.id.trim() !== '') {
    return currentQuote.id.trim();
  }
  return 'actual';
}

function getVisibleElementText(id) {
  const element = document.getElementById(id);
  if (!element || element.hidden) return '';
  return (element.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function getShareImageTheme() {
  return document.body?.classList.contains('night-fall') ? 'night' : 'day';
}

function getQuoteCardSnapshot() {
  const quoteText = (currentQuote?.t ?? '').trim();
  const author = getVisibleElementText('author-name');
  const workTitle = getVisibleElementText('author-work');
  const title = getVisibleElementText('quote-card-title') || 'Páramo Literario';
  const theme = getShareImageTheme();

  return {
    key: [
      getQuoteIdentifier(),
      theme,
      quoteText,
      author,
      workTitle
    ].join('|'),
    quoteText,
    author,
    workTitle,
    title,
    theme
  };
}

function getSnapshotShareText(snapshot) {
  const quoteText = (snapshot?.quoteText ?? '').trim();
  const details = [snapshot?.author, snapshot?.workTitle].filter(Boolean).join(' · ');
  if (!quoteText) return snapshot?.title || 'Páramo Literario';
  return details ? `“${quoteText}”\n— ${details}` : `“${quoteText}”`;
}

function getQuoteVoiceText() {
  const quoteText = (currentQuote?.t ?? '').trim();
  const { author, workTitle } = getQuoteMetadata(currentQuote);
  const details = [author, workTitle].filter(Boolean).join(', ');
  return [quoteText, details].filter(Boolean).join('. ');
}

function updateListenVoiceButton(isSpeaking = false) {
  if (!listenVoiceButtonRef) return;
  listenVoiceButtonRef.classList.toggle('is-speaking', isSpeaking);
  listenVoiceButtonRef.setAttribute('aria-pressed', String(isSpeaking));
  const label = listenVoiceButtonRef.querySelector('span:last-child');
  if (label) {
    label.textContent = isSpeaking ? 'Detener voz' : 'Escuchar voz';
  }
}

function stopQuoteVoice() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  currentSpeechUtterance = null;
  updateListenVoiceButton(false);
}

function speakQuote() {
  if (typeof window === 'undefined' || !window.speechSynthesis || typeof SpeechSynthesisUtterance !== 'function') {
    showShareFeedback('Tu navegador no permite escuchar la frase en voz alta.');
    return;
  }

  if (currentSpeechUtterance) {
    stopQuoteVoice();
    return;
  }

  const voiceText = getQuoteVoiceText();
  if (!voiceText) return;

  const utterance = new SpeechSynthesisUtterance(voiceText);
  utterance.lang = currentQuote?.lang || 'es-ES';
  utterance.rate = 0.92;
  utterance.pitch = 0.9;
  utterance.onend = () => {
    currentSpeechUtterance = null;
    updateListenVoiceButton(false);
  };
  utterance.onerror = () => {
    currentSpeechUtterance = null;
    updateListenVoiceButton(false);
    showShareFeedback('No se pudo reproducir la voz. Inténtalo de nuevo.');
  };

  currentSpeechUtterance = utterance;
  updateListenVoiceButton(true);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function canvasToBlob(canvas, mimeType = 'image/png', quality = 0.92) {
  return new Promise((resolve, reject) => {
    if (!canvas?.toBlob) {
      reject(new Error('No se pudo generar la imagen'));
      return;
    }
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('No se pudo crear el archivo de imagen'));
      }
    }, mimeType, quality);
  });
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}

function measureLetterSpacedText(ctx, text, letterSpacing) {
  if (!text) return 0;
  return Array.from(text).reduce((width, character, index) => {
    return width + ctx.measureText(character).width + (index > 0 ? letterSpacing : 0);
  }, 0);
}

function drawLetterSpacedText(ctx, text, centerX, y, letterSpacing) {
  const characters = Array.from(text);
  let x = centerX - measureLetterSpacedText(ctx, text, letterSpacing) / 2;
  for (const character of characters) {
    ctx.fillText(character, x, y);
    x += ctx.measureText(character).width + letterSpacing;
  }
}

function splitLongWord(ctx, word, maxWidth) {
  const chunks = [];
  let current = '';
  for (const character of Array.from(word)) {
    const next = `${current}${character}`;
    if (current && ctx.measureText(next).width > maxWidth) {
      chunks.push(current);
      current = character;
    } else {
      current = next;
    }
  }
  if (current) {
    chunks.push(current);
  }
  return chunks;
}

function wrapCanvasText(ctx, text, maxWidth) {
  const normalized = String(text ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trim().replace(/\s+/g, ' '));
  const lines = [];

  for (const paragraph of normalized) {
    if (!paragraph) {
      if (lines.length && lines[lines.length - 1] !== '') {
        lines.push('');
      }
      continue;
    }

    const words = paragraph.split(' ');
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
        continue;
      }

      if (current) {
        lines.push(current);
        current = '';
      }

      if (ctx.measureText(word).width > maxWidth) {
        const chunks = splitLongWord(ctx, word, maxWidth);
        lines.push(...chunks.slice(0, -1));
        current = chunks[chunks.length - 1] ?? '';
      } else {
        current = word;
      }
    }

    if (current) {
      lines.push(current);
    }
  }

  return lines.length ? lines : [''];
}

function getShareQuoteFontSize(quoteText) {
  const length = quoteText.length;
  if (length > 1100) return 30;
  if (length > 850) return 32;
  if (length > 650) return 35;
  if (length > 460) return 38;
  if (length > 280) return 42;
  return 50;
}

function getShareImagePalette(theme) {
  if (theme === 'night') {
    return {
      backgroundTop: '#120f15',
      backgroundBottom: '#0d0a10',
      glow: 'rgba(246, 234, 199, 0.16)',
      border: 'rgba(246, 234, 199, 0.28)',
      title: '#f9f3da',
      text: '#f6efd9',
      author: '#d3cab0',
      shadow: 'rgba(0, 0, 0, 0.48)'
    };
  }

  return {
    backgroundTop: '#181612',
    backgroundBottom: '#14120f',
    glow: 'rgba(200, 162, 90, 0.17)',
    border: 'rgba(200, 162, 90, 0.42)',
    title: '#c8a25a',
    text: '#f2efe8',
    author: '#b8b2a8',
    shadow: 'rgba(0, 0, 0, 0.44)'
  };
}

function createQuoteImageCanvas(snapshot) {
  const width = 1080;
  const minHeight = 1350;
  const paddingX = 96;
  const maxTextWidth = width - paddingX * 2;
  const palette = getShareImagePalette(snapshot.theme);
  const quoteFontSize = getShareQuoteFontSize(snapshot.quoteText);
  const lineHeight = Math.round(quoteFontSize * 1.36);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No se pudo crear el canvas');
  }

  ctx.font = `500 ${quoteFontSize}px "Playfair Display", Georgia, serif`;
  const quoteLines = wrapCanvasText(ctx, `“${snapshot.quoteText}”`, maxTextWidth);
  const quoteBlockHeight = quoteLines.reduce((height, line) => {
    return height + (line ? lineHeight : Math.round(lineHeight * 0.55));
  }, 0);
  const metadataHeight = (snapshot.author ? 44 : 0) + (snapshot.workTitle ? 48 : 0);
  const naturalHeight = 360 + quoteBlockHeight + 84 + metadataHeight + 160;
  const height = Math.max(minHeight, naturalHeight);

  canvas.width = width;
  canvas.height = height;

  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, palette.backgroundTop);
  background.addColorStop(1, palette.backgroundBottom);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(width / 2, 0, 0, width / 2, 0, width * 0.78);
  glow.addColorStop(0, palette.glow);
  glow.addColorStop(0.58, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  drawRoundedRect(ctx, 28, 28, width - 56, height - 56, 32);
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = palette.shadow;
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 4;

  ctx.fillStyle = palette.title;
  ctx.font = '500 40px "Playfair Display", Georgia, serif';
  drawLetterSpacedText(ctx, snapshot.title.toLocaleUpperCase('es'), width / 2, 132, 10);

  ctx.font = '500 132px "Playfair Display", Georgia, serif';
  ctx.globalAlpha = 0.9;
  ctx.fillText('“', width / 2, 252);
  ctx.globalAlpha = 1;

  const ruleY = 304;
  const ruleWidth = 330;
  const diamondSize = 13;
  ctx.shadowBlur = 0;
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - ruleWidth / 2, ruleY);
  ctx.lineTo(width / 2 - 26, ruleY);
  ctx.moveTo(width / 2 + 26, ruleY);
  ctx.lineTo(width / 2 + ruleWidth / 2, ruleY);
  ctx.stroke();
  ctx.save();
  ctx.translate(width / 2, ruleY);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = palette.title;
  ctx.fillRect(-diamondSize / 2, -diamondSize / 2, diamondSize, diamondSize);
  ctx.restore();

  const contentHeight = quoteBlockHeight + 70 + metadataHeight;
  const availableHeight = height - 420 - 170;
  let y = 392 + Math.max(0, (availableHeight - contentHeight) * 0.32);

  ctx.fillStyle = palette.text;
  ctx.font = `500 ${quoteFontSize}px "Playfair Display", Georgia, serif`;
  ctx.shadowColor = palette.shadow;
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 3;
  for (const line of quoteLines) {
    if (!line) {
      y += Math.round(lineHeight * 0.55);
      continue;
    }
    ctx.fillText(line, width / 2, y);
    y += lineHeight;
  }

  y += 56;
  ctx.shadowBlur = 0;
  ctx.fillStyle = palette.title;
  if (snapshot.author) {
    ctx.font = '600 28px Inter, Arial, sans-serif';
    drawLetterSpacedText(ctx, `— ${snapshot.author.toLocaleUpperCase('es')}`, width / 2, y, 6);
    y += 46;
  }

  if (snapshot.workTitle) {
    ctx.fillStyle = palette.author;
    ctx.font = 'italic 30px "Playfair Display", Georgia, serif';
    const workLines = wrapCanvasText(ctx, snapshot.workTitle, maxTextWidth * 0.72);
    for (const line of workLines.slice(0, 2)) {
      ctx.fillText(line, width / 2, y);
      y += 38;
    }
  }

  ctx.globalAlpha = 0.34;
  ctx.fillStyle = palette.author;
  ctx.font = '500 22px Inter, Arial, sans-serif';
  drawLetterSpacedText(ctx, 'paramoliterario.com', width / 2, height - 82, 4);
  ctx.globalAlpha = 1;

  return canvas;
}

async function waitForShareImageFonts() {
  if (!document.fonts?.ready) return;
  try {
    await Promise.race([
      document.fonts.ready,
      new Promise(resolve => setTimeout(resolve, 800))
    ]);
  } catch {
    // The canvas can still be generated with fallback fonts.
  }
}

async function createQuoteImageBlob(snapshot) {
  await waitForShareImageFonts();
  const canvas = createQuoteImageCanvas(snapshot);
  return canvasToBlob(canvas, 'image/png');
}

function prepareQuoteImage() {
  if (!currentQuote) {
    return Promise.resolve(null);
  }

  const snapshot = getQuoteCardSnapshot();
  if (!snapshot.quoteText) {
    return Promise.resolve(null);
  }

  if (quoteImageCache?.key === snapshot.key) {
    return Promise.resolve(quoteImageCache);
  }

  if (quoteImageGenerationPromise?.key === snapshot.key) {
    return quoteImageGenerationPromise;
  }

  const fileName = SHARE_IMAGE_FILE_NAME;
  const generation = createQuoteImageBlob(snapshot)
    .then(blob => {
      const result = {
        key: snapshot.key,
        blob,
        fileName,
        text: getSnapshotShareText(snapshot)
      };
      quoteImageCache = result;
      return result;
    })
    .finally(() => {
      if (quoteImageGenerationPromise === generation) {
        quoteImageGenerationPromise = null;
      }
    });

  generation.key = snapshot.key;
  quoteImageGenerationPromise = generation;
  return generation;
}

function triggerImageDownload(blob, fileName) {
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);
}

function isMobileShareDevice() {
  const userAgent = navigator.userAgent || '';
  return /Android|iPhone|iPad|iPod/i.test(userAgent) || (
    /Macintosh/i.test(userAgent) &&
    Number(navigator.maxTouchPoints || 0) > 1
  );
}

function createShareImageFile(blob) {
  if (!blob || typeof File !== 'function') return null;
  return new File([blob], SHARE_IMAGE_FILE_NAME, { type: 'image/png' });
}

function openImageInNewTab(blob) {
  const imageUrl = URL.createObjectURL(blob);
  const openedWindow = window.open(imageUrl, '_blank');

  if (!openedWindow) {
    URL.revokeObjectURL(imageUrl);
    return false;
  }

  openedWindow.opener = null;

  window.setTimeout(() => {
    URL.revokeObjectURL(imageUrl);
  }, 60000);

  return true;
}

function hideShareImageFallback() {
  const fallback = document.getElementById('share-image-fallback');
  if (fallback) {
    const image = fallback.querySelector('img');
    if (image) {
      image.removeAttribute('src');
    }
    fallback.hidden = true;
  }

  if (shareFallbackImageUrl) {
    URL.revokeObjectURL(shareFallbackImageUrl);
    shareFallbackImageUrl = null;
  }
}

function showInlineShareImageFallback(blob) {
  hideShareImageFallback();

  const imageUrl = URL.createObjectURL(blob);
  shareFallbackImageUrl = imageUrl;

  let fallback = document.getElementById('share-image-fallback');
  if (!fallback) {
    fallback = document.createElement('figure');
    fallback.id = 'share-image-fallback';
    fallback.className = 'share-image-fallback';

    const image = document.createElement('img');
    image.alt = 'Imagen generada de P\u00e1ramo Literario';
    fallback.appendChild(image);

    const anchor = shareFeedbackRef || quoteCardRef;
    anchor?.insertAdjacentElement('afterend', fallback);
  }

  const image = fallback.querySelector('img');
  if (image) {
    image.src = imageUrl;
  }
  fallback.hidden = false;
}

function showMobileImageFallback(blob) {
  if (openImageInNewTab(blob)) {
    showShareFeedback('Imagen abierta en una nueva pesta\u00f1a. Mant\u00e9n pulsada la imagen para guardarla.');
    return;
  }

  showInlineShareImageFallback(blob);
  showShareFeedback('Mant\u00e9n pulsada la imagen para guardarla.');
}

function showShareFeedback(message) {
  if (!shareFeedbackRef) return;
  if (!message) {
    shareFeedbackRef.hidden = true;
    shareFeedbackRef.textContent = '';
    return;
  }
  shareFeedbackRef.hidden = false;
  shareFeedbackRef.textContent = message;
}

function wasShareCancelled(error) {
  return error?.name === 'AbortError';
}

function canShareImageFile(file) {
  if (
    !file ||
    typeof navigator.share !== 'function' ||
    typeof navigator.canShare !== 'function'
  ) {
    return false;
  }

  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

async function shareQuoteAsImage() {
  if (!quoteCardRef || !currentQuote || isSharingImage) return;
  isSharingImage = true;

  if (shareButtonRef) {
    shareButtonRef.disabled = true;
  }

  showShareFeedback('Preparando imagen...');

  try {
    hideShareImageFallback();
    const snapshot = getQuoteCardSnapshot();
    let image = quoteImageCache?.key === snapshot.key ? quoteImageCache : null;
    if (!image) {
      image = await prepareQuoteImage();
    }

    if (!image?.blob) {
      throw new Error('No se pudo preparar la imagen');
    }

    const file = createShareImageFile(image.blob);

    if (canShareImageFile(file)) {
      try {
        await navigator.share({
          title: 'Páramo Literario',
          text: 'Una frase de Páramo Literario',
          files: [file]
        });
        showShareFeedback('');
        return;
      } catch (error) {
        if (wasShareCancelled(error)) {
          showShareFeedback('');
          return;
        }
        console.error('Error al compartir imagen:', error);
        if (isMobileShareDevice()) {
          showMobileImageFallback(image.blob);
          alert('No se pudo compartir la imagen. Mantén pulsada la imagen para guardarla.');
          return;
        }
        triggerImageDownload(image.blob, image.fileName);
        showShareFeedback('No se pudo abrir el menú de compartir. Descargamos la imagen automáticamente.');
        return;
      }
    }

    if (isMobileShareDevice()) {
      showMobileImageFallback(image.blob);
      return;
    }

    triggerImageDownload(image.blob, image.fileName);
    showShareFeedback('Tu dispositivo no permite compartir archivos directo. Descargamos la imagen para que la compartas.');
  } catch (error) {
    console.error('Error al compartir imagen:', error);
    showShareFeedback('No se pudo compartir la imagen. Mantén pulsada la imagen para guardarla.');
    alert('No se pudo compartir la imagen. Mantén pulsada la imagen para guardarla.');
  } finally {
    isSharingImage = false;
    if (shareButtonRef) {
      shareButtonRef.disabled = false;
    }
  }
}

function initQuoteActionButtons() {
  quoteCardRef = document.getElementById('quote-card');
  shareButtonRef = document.getElementById('share-image-btn');
  listenVoiceButtonRef = document.getElementById('listen-voice-btn');
  shareFeedbackRef = document.getElementById('share-feedback');

  if (listenVoiceButtonRef) {
    listenVoiceButtonRef.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      speakQuote();
    });
  }

  if (shareButtonRef) {
    shareButtonRef.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      shareQuoteAsImage();
    });
  }
}

function renderQuote(quote) {
  if (!quote) {
    return;
  }
  currentQuote = quote;
  stopQuoteVoice();
  if (quoteElementRef) {
    const isPoem = currentQuote.type === 'poem';
    const quoteLengthClass = getQuoteLengthClass(currentQuote.t);
    quoteElementRef.classList.toggle('quote-text--poem', isPoem);
    quoteElementRef.classList.toggle('quote-text--prose', !isPoem);
    quoteElementRef.classList.remove(...QUOTE_LENGTH_CLASSES);
    quoteElementRef.classList.add(quoteLengthClass);
    setQuoteTextContent(currentQuote.t ?? '', { includeQuotes: true });
    if (currentQuote.lang) {
      quoteElementRef.setAttribute('lang', currentQuote.lang);
    } else {
      quoteElementRef.removeAttribute('lang');
    }
  }

  if (quoteHighlightRef) {
    const highlight = typeof currentQuote.highlight === 'string'
      ? currentQuote.highlight.trim()
      : '';
    quoteHighlightRef.textContent = highlight;
    quoteHighlightRef.hidden = !highlight;
  }

  const authorContainer = document.getElementById('author');
  const authorName = document.getElementById('author-name');
  const authorWork = document.getElementById('author-work');
  const authorSeparator = document.getElementById('author-separator');
  const metaPrefix = document.querySelector('.meta-prefix');

  const { author, workTitle } = getQuoteMetadata(currentQuote);

  const hasAuthor = Boolean(author);
  const hasWork = Boolean(workTitle);

  const authorId = currentQuote.authorId || `author-${slugify(author || '')}`;
  const workId = currentQuote.workId || `work-${slugify(workTitle || '')}`;

  if (authorName) {
    authorName.textContent = author ?? '';
    authorName.hidden = !hasAuthor;
    authorName.dataset.authorId = authorId;
    authorName.setAttribute('aria-label', hasAuthor ? `Abrir información sobre ${author}` : '');
  }
  if (authorWork) {
    authorWork.textContent = workTitle ?? '';
    authorWork.hidden = !hasWork;
    authorWork.dataset.workId = workId;
    authorWork.setAttribute('aria-label', hasWork ? `Abrir información sobre ${workTitle}` : '');
  }
  if (authorSeparator) {
    authorSeparator.hidden = !(hasAuthor && hasWork);
  }
  if (metaPrefix) {
    metaPrefix.hidden = !(hasAuthor || hasWork);
  }
  if (authorContainer) {
    const metaParts = [author, workTitle].filter(Boolean);
    authorContainer.setAttribute('data-full-text', metaParts.join(' · '));
  }

  quoteImageCache = null;
  hideShareImageFallback();
}

async function initApp() {
  const publicQuotes = await publicQuotesReady;
  activeQuotes = publicQuotes.quotes;
  quoteManager = createQuoteManager(activeQuotes, storage);
  if (publicQuotes.error) {
    console.warn('No se pudo cargar el runtime público de frases; se usa el fallback de emergencia', publicQuotes.error);
  }
  const { quote, message } = determineQuoteForDisplay();
  quoteElementRef = document.getElementById('quote');
  quoteHighlightRef = document.getElementById('quote-highlight');
  sceneBackgroundController = createSceneBackgroundController();
  initDaylightMotes();
  initGlobalWeatherState();
  initMotionPreferenceWatcher();
  if (quoteElementRef) {
    setQuoteTextContent(quoteElementRef.textContent ?? '', { includeQuotes: false });
  }
  if (quote) {
    renderQuote(quote);
  }
  setGentleMessage(message);
  initMetadataInteractions();
  initQuoteActionButtons();
}

document.addEventListener('DOMContentLoaded', async () => {
  await initApp();
  initFireflyAura();
  scheduleDayNightModeUpdates();
  revealAppWhenReady();
});
