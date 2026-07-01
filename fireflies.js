import { isNightTime } from './dayNight.js';

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
let reduceMotionMedia;
let nightTimerId = null;
let cleanupCurrentLayer = null;
let listenersBound = false;

const WEATHER_CHANGE_EVENT = 'paramo:weather-change';
const CALM_NIGHT_WEATHER = 'night-clear';
const RAINY_NIGHT_WEATHER = 'night-rain';

function shouldShowFireflies() {
  const weather = document.body?.dataset.weather;
  if (weather === CALM_NIGHT_WEATHER) {
    return true;
  }
  if (weather === RAINY_NIGHT_WEATHER) {
    return false;
  }
  if (weather) {
    return false;
  }

  return isNightTime();
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

function createTrajectory() {
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  const startX = randomBetween(0, viewportWidth);
  const startY = randomBetween(0, viewportHeight);
  const travelX = randomBetween(-viewportWidth * 0.55, viewportWidth * 0.55);
  const travelY = randomBetween(-viewportHeight * 0.5, viewportHeight * 0.5);
  const endX = clamp(startX + travelX, -120, viewportWidth + 120);
  const endY = clamp(startY + travelY, -120, viewportHeight + 120);

  return {
    startX,
    startY,
    travelX: endX - startX,
    travelY: endY - startY
  };
}

function createFirefliesLayer() {
  const layer = document.createElement('div');
  layer.className = 'fireflies-layer';
  layer.setAttribute('aria-hidden', 'true');
  const reduceMotion = reduceMotionMedia?.matches ?? false;
  if (reduceMotion) {
    layer.dataset.reduceMotion = 'true';
  }

  const total = pickCount();
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const compactViewport = viewportWidth <= 600;
  const maxOpacityForViewport = compactViewport ? Math.min(MAX_OPACITY, 0.7) : MAX_OPACITY;

  for (let i = 0; i < total; i += 1) {
    const firefly = document.createElement('span');
    firefly.className = 'firefly';
    const size = randomBetween(MIN_SIZE, MAX_SIZE);
    firefly.style.width = `${size.toFixed(2)}px`;
    firefly.style.height = `${size.toFixed(2)}px`;

    const opacity = randomBetween(MIN_OPACITY, maxOpacityForViewport);
    firefly.style.setProperty('--firefly-base-opacity', opacity.toFixed(2));

    const flickerDuration = randomBetween(MIN_FLICKER, MAX_FLICKER);
    firefly.style.setProperty('--flicker-duration', `${flickerDuration.toFixed(2)}s`);
    firefly.style.setProperty('--flicker-delay', `${(-Math.random() * flickerDuration).toFixed(2)}s`);

    if (!reduceMotion) {
      const driftDuration = randomBetween(MIN_DRIFT, MAX_DRIFT);
      firefly.style.setProperty('--drift-duration', `${driftDuration.toFixed(2)}s`);
    }

    const trajectory = createTrajectory();
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

  const release = () => {
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

  return release;
}

function evaluateNightState() {
  const shouldShow = shouldShowFireflies();
  if (shouldShow && !cleanupCurrentLayer) {
    cleanupCurrentLayer = createFirefliesLayer();
  } else if (!shouldShow) {
    if (cleanupCurrentLayer) {
      cleanupCurrentLayer();
    }
  }
}

function handleReduceMotionChange() {
  if (cleanupCurrentLayer) {
    cleanupCurrentLayer();
    evaluateNightState();
  }
}

function handleWeatherStateChange() {
  evaluateNightState();
}

export function initFireflyAura() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  if (!reduceMotionMedia) {
    reduceMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
  }

  evaluateNightState();

  if (!listenersBound) {
    reduceMotionMedia.addEventListener('change', handleReduceMotionChange);
    document.addEventListener(WEATHER_CHANGE_EVENT, handleWeatherStateChange);
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
  if (reduceMotionMedia) {
    reduceMotionMedia.removeEventListener('change', handleReduceMotionChange);
  }
  document.removeEventListener(WEATHER_CHANGE_EVENT, handleWeatherStateChange);
  if (cleanupCurrentLayer) {
    cleanupCurrentLayer();
    cleanupCurrentLayer = null;
  }
  listenersBound = false;
}
