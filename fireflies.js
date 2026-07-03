const MIN_FIREFLIES = 35;
const MAX_FIREFLIES = 55;
const COMPACT_MIN_FIREFLIES = 18;
const COMPACT_MAX_FIREFLIES = 26;
const REDUCED_MIN_FIREFLIES = 12;
const REDUCED_MAX_FIREFLIES = 18;
const REDUCED_COMPACT_MIN_FIREFLIES = 7;
const REDUCED_COMPACT_MAX_FIREFLIES = 11;
const MIN_FLICKER = 1.9;
const MAX_FLICKER = 4.4;
const MIN_SPEED = 8;
const MAX_SPEED = 18;
const REDUCED_MOTION_SPEED_FACTOR = 0.04;
const SCREEN_EDGE_BUFFER = 180;
const FIREFLY_PROFILES = Object.freeze([
  {
    weight: 0.66,
    minSize: 2.4,
    maxSize: 4.4,
    minOpacity: 0.3,
    maxOpacity: 0.52,
    coreAlpha: 0.3,
    glowAlpha: 0.22,
    haloAlpha: 0.1,
    tightGlow: '10px',
    tightSpread: '3px',
    wideGlow: '22px',
    wideSpread: '8px',
    blur: '0.1px',
    speedScale: 1.1,
  },
  {
    weight: 0.28,
    minSize: 4.2,
    maxSize: 7.1,
    minOpacity: 0.46,
    maxOpacity: 0.76,
    coreAlpha: 0.42,
    glowAlpha: 0.32,
    haloAlpha: 0.16,
    tightGlow: '14px',
    tightSpread: '5px',
    wideGlow: '30px',
    wideSpread: '12px',
    blur: '0.16px',
    speedScale: 1,
  },
  {
    weight: 0.06,
    minSize: 7.2,
    maxSize: 9.4,
    minOpacity: 0.62,
    maxOpacity: 0.9,
    coreAlpha: 0.52,
    glowAlpha: 0.42,
    haloAlpha: 0.22,
    tightGlow: '18px',
    tightSpread: '7px',
    wideGlow: '42px',
    wideSpread: '16px',
    blur: '0.22px',
    speedScale: 0.78,
  },
]);
let reduceMotionMedia;
let nightTimerId = null;
let animationFrameId = null;
let cleanupCurrentLayer = null;
let listenersBound = false;
let activeFireflies = [];
let lastAnimationTime = 0;
let viewportWidth = 0;
let viewportHeight = 0;

const WEATHER_CHANGE_EVENT = 'paramo:weather-change';
const RAIN_WEATHER_STATES = new Set(['light-rain', 'heavy-rain', 'night-rain']);

function shouldShowFireflies() {
  const timeOfDay = document.body?.dataset.timeOfDay;
  const weather = document.body?.dataset.weather;
  const visualScene = document.body?.dataset.visualScene;

  const isNight = timeOfDay === 'night';
  const isRain =
    RAIN_WEATHER_STATES.has(weather)
    || visualScene === 'night-rain';

  return isNight && !isRain;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function pickCount(reduceMotion) {
  const compactViewport = viewportWidth <= 600;
  if (reduceMotion) {
    const min = compactViewport ? REDUCED_COMPACT_MIN_FIREFLIES : REDUCED_MIN_FIREFLIES;
    const max = compactViewport ? REDUCED_COMPACT_MAX_FIREFLIES : REDUCED_MAX_FIREFLIES;
    return Math.floor(randomBetween(min, max + 1));
  }

  const min = compactViewport ? COMPACT_MIN_FIREFLIES : MIN_FIREFLIES;
  const max = compactViewport ? COMPACT_MAX_FIREFLIES : MAX_FIREFLIES;
  return Math.floor(randomBetween(min, max + 1));
}

function pickFireflyProfile() {
  const roll = Math.random();
  let threshold = 0;
  for (const profile of FIREFLY_PROFILES) {
    threshold += profile.weight;
    if (roll <= threshold) {
      return profile;
    }
  }
  return FIREFLY_PROFILES[FIREFLY_PROFILES.length - 1];
}

function updateViewportSize() {
  viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
}

function createFireflyState(element, reduceMotion, profile) {
  const angle = randomBetween(0, Math.PI * 2);
  const speed = randomBetween(MIN_SPEED, MAX_SPEED) * profile.speedScale;
  const reducedScale = reduceMotion ? 0.08 : 1;

  return {
    element,
    x: randomBetween(-SCREEN_EDGE_BUFFER, viewportWidth + SCREEN_EDGE_BUFFER),
    y: randomBetween(-SCREEN_EDGE_BUFFER, viewportHeight + SCREEN_EDGE_BUFFER),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed * 0.72,
    phase: randomBetween(0, Math.PI * 2),
    swayAmplitude: randomBetween(24, 78) * reducedScale,
    swaySpeed: randomBetween(0.18, 0.48),
    floatAmplitude: randomBetween(16, 58) * reducedScale,
    floatSpeed: randomBetween(0.22, 0.58),
    scale: randomBetween(0.86, 1.18),
  };
}

function wrapFireflyPosition(firefly) {
  const minX = -SCREEN_EDGE_BUFFER;
  const maxX = viewportWidth + SCREEN_EDGE_BUFFER;
  const minY = -SCREEN_EDGE_BUFFER;
  const maxY = viewportHeight + SCREEN_EDGE_BUFFER;

  if (firefly.x < minX) {
    firefly.x = maxX;
  } else if (firefly.x > maxX) {
    firefly.x = minX;
  }

  if (firefly.y < minY) {
    firefly.y = maxY;
  } else if (firefly.y > maxY) {
    firefly.y = minY;
  }
}

function renderFirefly(firefly, timestamp) {
  const seconds = timestamp / 1000;
  const organicX = Math.sin(seconds * firefly.swaySpeed + firefly.phase) * firefly.swayAmplitude;
  const organicY = Math.cos(seconds * firefly.floatSpeed + firefly.phase) * firefly.floatAmplitude;
  const x = clamp(firefly.x + organicX, -SCREEN_EDGE_BUFFER, viewportWidth + SCREEN_EDGE_BUFFER);
  const y = clamp(firefly.y + organicY, -SCREEN_EDGE_BUFFER, viewportHeight + SCREEN_EDGE_BUFFER);

  firefly.element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${firefly.scale.toFixed(2)})`;
}

function animateFireflies(timestamp) {
  if (!lastAnimationTime) {
    lastAnimationTime = timestamp;
  }

  const deltaSeconds = Math.min((timestamp - lastAnimationTime) / 1000, 0.08);
  const reduceMotion = reduceMotionMedia?.matches ?? false;
  const speedFactor = reduceMotion ? REDUCED_MOTION_SPEED_FACTOR : 1;
  lastAnimationTime = timestamp;

  activeFireflies.forEach((firefly) => {
    firefly.x += firefly.vx * deltaSeconds * speedFactor;
    firefly.y += firefly.vy * deltaSeconds * speedFactor;
    wrapFireflyPosition(firefly);
    renderFirefly(firefly, timestamp);
  });

  animationFrameId = window.requestAnimationFrame(animateFireflies);
}

function startFireflyAnimation() {
  if (animationFrameId !== null) {
    return;
  }

  lastAnimationTime = 0;
  animationFrameId = window.requestAnimationFrame(animateFireflies);
}

function stopFireflyAnimation() {
  if (animationFrameId !== null) {
    window.cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  lastAnimationTime = 0;
}

function createFirefliesLayer() {
  updateViewportSize();
  activeFireflies = [];
  const layer = document.createElement('div');
  layer.className = 'fireflies-layer';
  layer.setAttribute('aria-hidden', 'true');
  const reduceMotion = reduceMotionMedia?.matches ?? false;
  if (reduceMotion) {
    layer.dataset.reduceMotion = 'true';
  }

  const total = pickCount(reduceMotion);

  for (let i = 0; i < total; i += 1) {
    const profile = pickFireflyProfile();
    const firefly = document.createElement('span');
    firefly.className = 'firefly';
    const size = randomBetween(profile.minSize, profile.maxSize);
    firefly.style.width = `${size.toFixed(2)}px`;
    firefly.style.height = `${size.toFixed(2)}px`;

    const opacity = randomBetween(profile.minOpacity, profile.maxOpacity);
    firefly.style.setProperty('--firefly-base-opacity', opacity.toFixed(2));
    firefly.style.setProperty('--firefly-core-alpha', profile.coreAlpha.toFixed(2));
    firefly.style.setProperty('--firefly-glow-alpha', profile.glowAlpha.toFixed(2));
    firefly.style.setProperty('--firefly-halo-alpha', profile.haloAlpha.toFixed(2));
    firefly.style.setProperty('--firefly-tight-glow', profile.tightGlow);
    firefly.style.setProperty('--firefly-tight-spread', profile.tightSpread);
    firefly.style.setProperty('--firefly-wide-glow', profile.wideGlow);
    firefly.style.setProperty('--firefly-wide-spread', profile.wideSpread);
    firefly.style.setProperty('--firefly-blur', profile.blur);

    const flickerDuration = randomBetween(MIN_FLICKER, MAX_FLICKER);
    firefly.style.setProperty('--flicker-duration', `${flickerDuration.toFixed(2)}s`);
    firefly.style.setProperty('--flicker-delay', `${(-Math.random() * flickerDuration).toFixed(2)}s`);

    activeFireflies.push(createFireflyState(firefly, reduceMotion, profile));
    layer.appendChild(firefly);
  }

  let nightClassAdded = false;

  if (!document.body.classList.contains('night-fall')) {
    document.body.classList.add('night-fall');
    nightClassAdded = true;
  }

  document.body.appendChild(layer);
  activeFireflies.forEach((firefly) => {
    renderFirefly(firefly, performance.now());
  });
  startFireflyAnimation();

  const release = () => {
    stopFireflyAnimation();
    if (layer.parentNode) {
      layer.remove();
    }
    activeFireflies = [];
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
  } else if (shouldShow) {
    startFireflyAnimation();
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

function handleResize() {
  updateViewportSize();
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
    window.addEventListener('resize', handleResize);
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
  window.removeEventListener('resize', handleResize);
  document.removeEventListener(WEATHER_CHANGE_EVENT, handleWeatherStateChange);
  if (cleanupCurrentLayer) {
    cleanupCurrentLayer();
    cleanupCurrentLayer = null;
  }
  listenersBound = false;
}
