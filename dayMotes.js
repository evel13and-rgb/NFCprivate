import { isNightTime } from './dayNight.js';

const MIN_MOTES = 10;
const MAX_MOTES = 15;
const MIN_SIZE = 2;
const MAX_SIZE = 4;
const MIN_OPACITY = 0.15;
const MAX_OPACITY = 0.4;
const MIN_DURATION = 12;
const MAX_DURATION = 20;
const MAX_DRIFT_X = 20;
const BASE_BOTTOM = -32;
const BOTTOM_RANGE = 36;
const ITERATION_HANDLER_KEY = Symbol('dayMoteIterationHandler');

let layer = null;
let motes = [];
let reduceMotionMedia;
let reduceMotionEnabled = false;
let resizeBound = false;
let hideTimerId = null;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function pickCount() {
  return Math.floor(randomBetween(MIN_MOTES, MAX_MOTES + 1));
}

function getViewportWidth() {
  if (typeof window === 'undefined') {
    return 0;
  }
  const width = window.innerWidth || document.documentElement?.clientWidth || 0;
  return Math.max(width, 0);
}

function restartMoteAnimation(mote) {
  mote.style.animation = 'none';
  // Force reflow so the browser restarts the animation timeline
  void mote.offsetWidth;
  mote.style.animation = '';
}

function randomizeMote(mote, { resetSize = false, resetDelay = false, resetOpacity = false } = {}) {
  if (!mote) return;

  if (resetSize) {
    const size = randomBetween(MIN_SIZE, MAX_SIZE);
    const rounded = size.toFixed(2);
    mote.style.width = `${rounded}px`;
    mote.style.height = `${rounded}px`;
  }

  if (resetOpacity) {
    const opacity = randomBetween(MIN_OPACITY, MAX_OPACITY);
    mote.style.setProperty('--mote-opacity', opacity.toFixed(2));
  }

  const viewportWidth = getViewportWidth();
  const moteWidth = Number.parseFloat(mote.style.width) || MAX_SIZE;
  const maxLeft = Math.max(viewportWidth - moteWidth, 0);
  const left = randomBetween(0, maxLeft);
  mote.style.left = `${left.toFixed(2)}px`;

  const bottom = randomBetween(BASE_BOTTOM, BASE_BOTTOM + BOTTOM_RANGE);
  mote.style.bottom = `${bottom.toFixed(2)}px`;

  const drift = randomBetween(-MAX_DRIFT_X, MAX_DRIFT_X);
  mote.style.setProperty('--mote-drift-x', `${drift.toFixed(2)}px`);

  const duration = randomBetween(MIN_DURATION, MAX_DURATION);
  mote.style.setProperty('--mote-duration', `${duration.toFixed(2)}s`);

  if (resetDelay) {
    const delay = randomBetween(0, 4);
    mote.style.animationDelay = `${delay.toFixed(2)}s`;
  }
}

function registerIterationHandler(mote) {
  const handler = () => {
    if (!reduceMotionEnabled) {
      randomizeMote(mote);
    }
  };
  mote[ITERATION_HANDLER_KEY] = handler;
  if (!reduceMotionEnabled) {
    mote.addEventListener('animationiteration', handler);
  }
}

function enableIteration(mote) {
  const handler = mote[ITERATION_HANDLER_KEY];
  if (!handler) return;
  mote.removeEventListener('animationiteration', handler);
  mote.addEventListener('animationiteration', handler);
}

function disableIteration(mote) {
  const handler = mote[ITERATION_HANDLER_KEY];
  if (!handler) return;
  mote.removeEventListener('animationiteration', handler);
}

function ensureLayer() {
  if (layer) {
    return layer;
  }

  const body = document.body;
  if (!body) {
    return null;
  }

  layer = document.createElement('div');
  layer.className = 'day-motes-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.style.visibility = 'hidden';

  const total = pickCount();
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < total; index += 1) {
    const mote = document.createElement('span');
    mote.className = 'day-mote';
    mote.classList.add(index % 2 === 0 ? 'day-mote--primary' : 'day-mote--secondary');
    randomizeMote(mote, { resetSize: true, resetDelay: true, resetOpacity: true });
    registerIterationHandler(mote);
    motes.push(mote);
    fragment.appendChild(mote);
  }

  layer.appendChild(fragment);
  body.appendChild(layer);

  return layer;
}

function handleResize() {
  if (!layer) {
    return;
  }
  motes.forEach((mote) => {
    randomizeMote(mote);
  });
}

function handleReduceMotionChange(event) {
  const shouldReduce = event.matches;
  if (shouldReduce === reduceMotionEnabled) {
    return;
  }
  reduceMotionEnabled = shouldReduce;
  if (!layer) {
    return;
  }

  if (shouldReduce) {
    layer.dataset.reduceMotion = 'true';
    motes.forEach((mote) => {
      disableIteration(mote);
    });
  } else {
    delete layer.dataset.reduceMotion;
    motes.forEach((mote) => {
      enableIteration(mote);
      randomizeMote(mote, { resetDelay: true });
      restartMoteAnimation(mote);
    });
  }
}

function setLayerVisibility(visible) {
  if (!layer) {
    return;
  }

  if (visible) {
    const scheduler = typeof window !== 'undefined' ? window : globalThis;
    if (hideTimerId) {
      scheduler.clearTimeout(hideTimerId);
      hideTimerId = null;
    }
    layer.style.visibility = 'visible';

    if (reduceMotionEnabled) {
      motes.forEach((mote) => {
        randomizeMote(mote);
      });
    } else {
      motes.forEach((mote) => {
        randomizeMote(mote, { resetDelay: true });
        restartMoteAnimation(mote);
      });
    }

    const requestFrame =
      typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
        ? window.requestAnimationFrame.bind(window)
        : (callback) => {
            const host = typeof window !== 'undefined' ? window : globalThis;
            return host.setTimeout(callback, 16);
          };

    requestFrame(() => {
      if (layer) {
        layer.classList.add('day-motes-layer--visible');
      }
    });
  } else {
    const scheduler = typeof window !== 'undefined' ? window : globalThis;
    layer.classList.remove('day-motes-layer--visible');
    hideTimerId = scheduler.setTimeout(() => {
      if (layer && !layer.classList.contains('day-motes-layer--visible')) {
        layer.style.visibility = 'hidden';
      }
    }, 2100);
  }
}

export function initDaylightMotes() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  if (!reduceMotionMedia) {
    reduceMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduceMotionEnabled = reduceMotionMedia?.matches ?? false;
    if (typeof reduceMotionMedia.addEventListener === 'function') {
      reduceMotionMedia.addEventListener('change', handleReduceMotionChange);
    } else if (typeof reduceMotionMedia.addListener === 'function') {
      reduceMotionMedia.addListener(handleReduceMotionChange);
    }
  } else {
    reduceMotionEnabled = reduceMotionMedia.matches;
  }

  if (!layer) {
    ensureLayer();
  }

  if (!layer) {
    return;
  }

  if (reduceMotionEnabled) {
    layer.dataset.reduceMotion = 'true';
    motes.forEach((mote) => {
      disableIteration(mote);
    });
  } else {
    delete layer.dataset.reduceMotion;
    motes.forEach((mote) => {
      enableIteration(mote);
    });
  }

  if (!resizeBound) {
    window.addEventListener('resize', handleResize);
    resizeBound = true;
  }

  setLayerVisibility(!isNightTime());
}

export function setDaylightMotesActive(active) {
  if (!layer) {
    if (!active) {
      return;
    }
    ensureLayer();
    if (!layer) {
      return;
    }

    if (reduceMotionEnabled) {
      layer.dataset.reduceMotion = 'true';
    } else {
      delete layer.dataset.reduceMotion;
    }
  }

  setLayerVisibility(active);
}
