const NIGHT_START_HOUR = 19;
const NIGHT_END_HOUR = 6;
const MIN_FIREFLIES = 10;
const MAX_FIREFLIES = 12;
const MIN_SIZE = 6;
const MAX_SIZE = 8;
const MIN_FLICKER = 0.8;
const MAX_FLICKER = 1.6;
const MIN_OPACITY = 0.4;
const MAX_OPACITY = 0.9;
const MIN_DRIFT = 10;
const MAX_DRIFT = 15;
const FADE_IN_MS = 2400;
const FADE_OUT_MS = 3500;
const VISIBLE_MS = 10000;

let darkSchemeMedia;
let reduceMotionMedia;
let nightTimerId = null;
let cleanupCurrentLayer = null;
let listenersBound = false;
let hasDisplayedFireflies = false;

function isNightByTime() {
  const now = new Date();
  const hour = now.getHours();
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
}

function shouldShowFireflies() {
  return isNightByTime() || (darkSchemeMedia && darkSchemeMedia.matches);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function pickCount() {
  return Math.floor(randomBetween(MIN_FIREFLIES, MAX_FIREFLIES + 1));
}

function isOutsideProtectedArea(x, y, protectedRect, margin = 36) {
  if (!protectedRect) return true;
  return (
    x < protectedRect.left - margin ||
    x > protectedRect.right + margin ||
    y < protectedRect.top - margin ||
    y > protectedRect.bottom + margin
  );
}

function createTrajectory(protectedRect) {
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  let attempts = 0;

  while (attempts < 30) {
    const startX = randomBetween(0, viewportWidth);
    const startY = randomBetween(0, viewportHeight);
    const travelX = randomBetween(-viewportWidth * 0.45, viewportWidth * 0.45);
    const travelY = randomBetween(-viewportHeight * 0.4, viewportHeight * 0.4);

    const midX = startX + travelX * 0.5;
    const midY = startY + travelY * 0.5;
    const endX = startX + travelX;
    const endY = startY + travelY;

    const withinViewport =
      startX >= -80 && startX <= viewportWidth + 80 &&
      startY >= -80 && startY <= viewportHeight + 80 &&
      endX >= -120 && endX <= viewportWidth + 120 &&
      endY >= -120 && endY <= viewportHeight + 120;

    if (
      withinViewport &&
      isOutsideProtectedArea(startX, startY, protectedRect) &&
      isOutsideProtectedArea(midX, midY, protectedRect) &&
      isOutsideProtectedArea(endX, endY, protectedRect)
    ) {
      return {
        startX,
        startY,
        travelX,
        travelY,
        midX,
        midY,
        endX,
        endY
      };
    }
    attempts += 1;
  }

  const fallbackX = protectedRect ? clamp(protectedRect.left - 60, 12, viewportWidth - 12) : randomBetween(12, viewportWidth - 12);
  const fallbackY = protectedRect ? clamp(protectedRect.top - 60, 12, viewportHeight - 12) : randomBetween(12, viewportHeight - 12);
  return {
    startX: fallbackX,
    startY: fallbackY,
    travelX: randomBetween(-120, 120),
    travelY: randomBetween(-90, 90)
  };
}

function createFirefliesLayer() {
  const layer = document.createElement('div');
  layer.className = 'fireflies-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.style.setProperty('--firefly-fade-in', `${FADE_IN_MS}ms`);
  layer.style.setProperty('--firefly-fade-out', `${FADE_OUT_MS}ms`);
  const reduceMotion = reduceMotionMedia?.matches ?? false;
  if (reduceMotion) {
    layer.dataset.reduceMotion = 'true';
  }

  const quotePanel = document.getElementById('quote-panel');
  const protectedRect = quotePanel ? quotePanel.getBoundingClientRect() : null;
  const total = pickCount();

  for (let i = 0; i < total; i += 1) {
    const firefly = document.createElement('span');
    firefly.className = 'firefly';
    const size = randomBetween(MIN_SIZE, MAX_SIZE);
    firefly.style.width = `${size.toFixed(2)}px`;
    firefly.style.height = `${size.toFixed(2)}px`;

    const opacity = randomBetween(MIN_OPACITY, MAX_OPACITY);
    firefly.style.setProperty('--firefly-base-opacity', opacity.toFixed(2));

    const flickerDuration = randomBetween(MIN_FLICKER, MAX_FLICKER);
    firefly.style.setProperty('--flicker-duration', `${flickerDuration.toFixed(2)}s`);
    firefly.style.setProperty('--flicker-delay', `${(-Math.random() * flickerDuration).toFixed(2)}s`);

    if (!reduceMotion) {
      const driftDuration = randomBetween(MIN_DRIFT, MAX_DRIFT);
      firefly.style.setProperty('--drift-duration', `${driftDuration.toFixed(2)}s`);
    }

    const trajectory = createTrajectory(protectedRect);
    firefly.style.left = `${trajectory.startX}px`;
    firefly.style.top = `${trajectory.startY}px`;

    if (!reduceMotion) {
      firefly.style.setProperty('--dx', `${trajectory.travelX.toFixed(2)}px`);
      firefly.style.setProperty('--dy', `${trajectory.travelY.toFixed(2)}px`);
    }

    layer.appendChild(firefly);
  }

  let nightClassAdded = false;

  if (!document.body.classList.contains('night-fall')) {
    document.body.classList.add('night-fall');
    nightClassAdded = true;
  }

  document.body.appendChild(layer);

  let fadeOutTimer;
  let removeTimer;

  const release = () => {
    window.clearTimeout(fadeOutTimer);
    window.clearTimeout(removeTimer);
    if (layer.parentNode) {
      layer.remove();
    }
    if (nightClassAdded) {
      document.body.classList.remove('night-fall');
    }
    if (cleanupCurrentLayer === release) {
      cleanupCurrentLayer = null;
    }
  };

  fadeOutTimer = window.setTimeout(() => {
    layer.classList.add('fireflies-fade-out');
  }, VISIBLE_MS);

  removeTimer = window.setTimeout(() => {
    release();
  }, VISIBLE_MS + FADE_OUT_MS);

  return release;
}

function evaluateNightState() {
  const shouldShow = shouldShowFireflies();
  if (shouldShow && !cleanupCurrentLayer && !hasDisplayedFireflies) {
    cleanupCurrentLayer = createFirefliesLayer();
    hasDisplayedFireflies = true;
  } else if (!shouldShow) {
    if (cleanupCurrentLayer) {
      cleanupCurrentLayer();
    }
    hasDisplayedFireflies = false;
  }
}

function handleDarkSchemeChange() {
  evaluateNightState();
}

function handleReduceMotionChange() {
  if (cleanupCurrentLayer) {
    cleanupCurrentLayer();
    hasDisplayedFireflies = false;
    evaluateNightState();
  }
}

export function initFireflyAura() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  if (!darkSchemeMedia) {
    darkSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
  }
  if (!reduceMotionMedia) {
    reduceMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
  }

  evaluateNightState();

  if (!listenersBound) {
    darkSchemeMedia.addEventListener('change', handleDarkSchemeChange);
    reduceMotionMedia.addEventListener('change', handleReduceMotionChange);
    nightTimerId = window.setInterval(() => {
      evaluateNightState();
    }, 60 * 1000);
    listenersBound = true;
  }
}

export function teardownFireflyAura() {
  if (nightTimerId) {
    window.clearInterval(nightTimerId);
    nightTimerId = null;
  }
  if (darkSchemeMedia) {
    darkSchemeMedia.removeEventListener('change', handleDarkSchemeChange);
  }
  if (reduceMotionMedia) {
    reduceMotionMedia.removeEventListener('change', handleReduceMotionChange);
  }
  if (cleanupCurrentLayer) {
    cleanupCurrentLayer();
    cleanupCurrentLayer = null;
  }
  listenersBound = false;
  hasDisplayedFireflies = false;
}
