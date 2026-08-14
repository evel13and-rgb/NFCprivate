const FIREFLY_LAYERS = Object.freeze([
  {
    key: 'back',
    className: 'fireflies-layer fireflies-back',
    minCount: 46,
    maxCount: 70,
    compactMinCount: 14,
    compactMaxCount: 20,
    reducedMinCount: 12,
    reducedMaxCount: 18,
    reducedCompactMinCount: 9,
    reducedCompactMaxCount: 13,
    sizeScale: 1,
    opacityScale: 1.08,
    glowScale: 1.12,
    motionScale: 0.82,
    swayScale: 1,
    nearProfileBoost: 0,
  },
  {
    key: 'front',
    className: 'fireflies-layer fireflies-front',
    minCount: 8,
    maxCount: 13,
    compactMinCount: 5,
    compactMaxCount: 8,
    reducedMinCount: 3,
    reducedMaxCount: 5,
    reducedCompactMinCount: 3,
    reducedCompactMaxCount: 5,
    sizeScale: 1.18,
    opacityScale: 1.22,
    glowScale: 1.42,
    motionScale: 0.68,
    swayScale: 1.22,
    nearProfileBoost: 0.18,
  },
]);
const MIN_FLICKER = 2.4;
const MAX_FLICKER = 5.8;
const MIN_SPEED = 5;
const MAX_SPEED = 14;
const SCREEN_EDGE_BUFFER = 180;
const CONSTRAINED_EDGE_BUFFER = 48;
const CONSTRAINED_FRAME_INTERVAL_MS = 1000 / 24;
const FIREFLY_PROFILES = Object.freeze([
  {
    weight: 0.58,
    minSize: 3.1,
    maxSize: 5.4,
    minOpacity: 0.42,
    maxOpacity: 0.66,
    coreAlpha: 0.48,
    glowAlpha: 0.34,
    haloAlpha: 0.18,
    tightGlow: '14px',
    tightSpread: '4px',
    wideGlow: '34px',
    wideSpread: '12px',
    blur: '0.12px',
    speedScale: 1.1,
  },
  {
    weight: 0.32,
    minSize: 5.3,
    maxSize: 8.8,
    minOpacity: 0.56,
    maxOpacity: 0.86,
    coreAlpha: 0.58,
    glowAlpha: 0.46,
    haloAlpha: 0.25,
    tightGlow: '19px',
    tightSpread: '7px',
    wideGlow: '46px',
    wideSpread: '17px',
    blur: '0.18px',
    speedScale: 1,
  },
  {
    weight: 0.1,
    minSize: 8.9,
    maxSize: 13.2,
    minOpacity: 0.68,
    maxOpacity: 0.96,
    coreAlpha: 0.68,
    glowAlpha: 0.56,
    haloAlpha: 0.34,
    tightGlow: '26px',
    tightSpread: '9px',
    wideGlow: '64px',
    wideSpread: '24px',
    blur: '0.24px',
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
let constrainedAtmosphereMedia;
let activeRuntimeMode = null;

const WEATHER_CHANGE_EVENT = 'paramo:weather-change';
const RAIN_WEATHER_STATES = new Set(['light-rain', 'heavy-rain', 'night-rain']);
const CONSTRAINED_ATMOSPHERE_QUERY = '(max-width: 768px), (pointer: coarse)';

export function resolveFireflyRuntimeMode({ constrained = false, reduceMotion = false, rainy = false } = {}) {
  const constrainedDevice = Boolean(constrained);
  const rainyScene = Boolean(rainy);
  const usesLightweightMode = constrainedDevice || rainyScene;
  return {
    constrained: usesLightweightMode,
    reduceMotion: Boolean(reduceMotion),
    animate: !reduceMotion && (!rainyScene || constrainedDevice),
    frameIntervalMs: usesLightweightMode ? CONSTRAINED_FRAME_INTERVAL_MS : 0,
  };
}

function getLayerCountBounds(runtimeMode, layerConfig, compactViewport = runtimeMode.constrained) {
  if (runtimeMode.reduceMotion) {
    return {
      min: compactViewport ? layerConfig.reducedCompactMinCount : layerConfig.reducedMinCount,
      max: compactViewport ? layerConfig.reducedCompactMaxCount : layerConfig.reducedMaxCount,
    };
  }

  return {
    min: compactViewport ? layerConfig.compactMinCount : layerConfig.minCount,
    max: compactViewport ? layerConfig.compactMaxCount : layerConfig.maxCount,
  };
}

export function getFireflyCountBounds({ constrained = false, reduceMotion = false, rainy = false } = {}) {
  const runtimeMode = resolveFireflyRuntimeMode({ constrained, reduceMotion, rainy });
  return FIREFLY_LAYERS.reduce((total, layerConfig) => {
    const bounds = getLayerCountBounds(runtimeMode, layerConfig);
    return {
      min: total.min + bounds.min,
      max: total.max + bounds.max,
    };
  }, { min: 0, max: 0 });
}

export function shouldShowFirefliesForState({
  documentHidden = false,
  timeOfDay,
  weather,
  visualScene,
} = {}) {
  if (documentHidden) {
    return false;
  }

  const isNight = timeOfDay === 'night';
  const excludesFireflies =
    visualScene === 'dawn'
    || visualScene === 'rainbow-after-rain';

  return isNight && !excludesFireflies;
}

function shouldShowFireflies() {
  return shouldShowFirefliesForState({
    documentHidden: document.hidden,
    timeOfDay: document.body?.dataset.timeOfDay,
    weather: document.body?.dataset.weather,
    visualScene: document.body?.dataset.visualScene,
  });
}

function getCurrentFireflyRuntimeMode() {
  const weather = document.body?.dataset.weather;
  const visualScene = document.body?.dataset.visualScene;
  const rainyScene = RAIN_WEATHER_STATES.has(weather) || visualScene === 'night-rain';
  return resolveFireflyRuntimeMode({
    constrained: constrainedAtmosphereMedia?.matches ?? false,
    reduceMotion: reduceMotionMedia?.matches ?? false,
    rainy: rainyScene,
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function pickCount(runtimeMode, layerConfig) {
  const compactViewport = runtimeMode.constrained || viewportWidth <= 600;
  const { min, max } = getLayerCountBounds(runtimeMode, layerConfig, compactViewport);
  return Math.floor(randomBetween(min, max + 1));
}

function pickFireflyProfile(layerConfig) {
  const roll = Math.min(1, Math.random() + layerConfig.nearProfileBoost);
  let threshold = 0;
  for (const profile of FIREFLY_PROFILES) {
    threshold += profile.weight;
    if (roll <= threshold) {
      return profile;
    }
  }
  return FIREFLY_PROFILES[FIREFLY_PROFILES.length - 1];
}

function scalePixelValue(value, scale) {
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric)) {
    return value;
  }
  return `${(numeric * scale).toFixed(1)}px`;
}

function updateViewportSize() {
  viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
}

function createFireflyState(element, runtimeMode, profile, layerConfig) {
  const angle = randomBetween(0, Math.PI * 2);
  const constrainedMotionScale = runtimeMode.constrained ? 0.58 : 1;
  const speed = randomBetween(MIN_SPEED, MAX_SPEED)
    * profile.speedScale
    * layerConfig.motionScale
    * constrainedMotionScale;
  const reducedScale = runtimeMode.reduceMotion ? 0.08 : 1;
  const swayScale = layerConfig.swayScale * reducedScale;
  const edgeBuffer = runtimeMode.reduceMotion
    ? 0
    : runtimeMode.constrained
      ? CONSTRAINED_EDGE_BUFFER
      : SCREEN_EDGE_BUFFER;

  return {
    element,
    layer: layerConfig.key,
    x: randomBetween(-edgeBuffer, viewportWidth + edgeBuffer),
    y: randomBetween(-edgeBuffer, viewportHeight + edgeBuffer),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed * 0.72,
    phase: randomBetween(0, Math.PI * 2),
    secondaryPhase: randomBetween(0, Math.PI * 2),
    swayAmplitude: randomBetween(30, 96) * swayScale,
    swaySpeed: randomBetween(0.12, 0.34),
    floatAmplitude: randomBetween(18, 68) * swayScale,
    floatSpeed: randomBetween(0.16, 0.42),
    wanderAmplitude: randomBetween(6, 22) * swayScale,
    wanderSpeed: randomBetween(0.07, 0.18),
    scale: randomBetween(0.86, 1.18),
    edgeBuffer,
  };
}

function wrapFireflyPosition(firefly) {
  const minX = -firefly.edgeBuffer;
  const maxX = viewportWidth + firefly.edgeBuffer;
  const minY = -firefly.edgeBuffer;
  const maxY = viewportHeight + firefly.edgeBuffer;

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
  const organicX =
    Math.sin(seconds * firefly.swaySpeed + firefly.phase) * firefly.swayAmplitude
    + Math.sin(seconds * firefly.wanderSpeed + firefly.secondaryPhase) * firefly.wanderAmplitude;
  const organicY =
    Math.cos(seconds * firefly.floatSpeed + firefly.phase) * firefly.floatAmplitude
    + Math.cos(seconds * firefly.wanderSpeed * 1.35 + firefly.secondaryPhase) * firefly.wanderAmplitude;
  const x = clamp(firefly.x + organicX, -firefly.edgeBuffer, viewportWidth + firefly.edgeBuffer);
  const y = clamp(firefly.y + organicY, -firefly.edgeBuffer, viewportHeight + firefly.edgeBuffer);

  firefly.element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${firefly.scale.toFixed(2)})`;
}

function animateFireflies(timestamp) {
  if (!activeRuntimeMode?.animate) {
    animationFrameId = null;
    return;
  }

  if (!lastAnimationTime) {
    lastAnimationTime = timestamp;
  }

  const elapsedMs = timestamp - lastAnimationTime;
  if (activeRuntimeMode.frameIntervalMs > 0 && elapsedMs < activeRuntimeMode.frameIntervalMs) {
    animationFrameId = window.requestAnimationFrame(animateFireflies);
    return;
  }

  const deltaSeconds = Math.min(elapsedMs / 1000, 0.08);
  lastAnimationTime = timestamp;

  activeFireflies.forEach((firefly) => {
    firefly.x += firefly.vx * deltaSeconds;
    firefly.y += firefly.vy * deltaSeconds;
    wrapFireflyPosition(firefly);
    renderFirefly(firefly, timestamp);
  });

  animationFrameId = window.requestAnimationFrame(animateFireflies);
}

function startFireflyAnimation() {
  if (animationFrameId !== null || !activeRuntimeMode?.animate) {
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

function createLayerFireflies(layer, layerConfig, runtimeMode) {
  const total = pickCount(runtimeMode, layerConfig);

  for (let i = 0; i < total; i += 1) {
    const profile = pickFireflyProfile(layerConfig);
    const firefly = document.createElement('span');
    firefly.className = 'firefly';
    const size = randomBetween(profile.minSize, profile.maxSize) * layerConfig.sizeScale;
    firefly.style.width = `${size.toFixed(2)}px`;
    firefly.style.height = `${size.toFixed(2)}px`;

    const opacity = clamp(randomBetween(profile.minOpacity, profile.maxOpacity) * layerConfig.opacityScale, 0.18, 1);
    firefly.style.setProperty('--firefly-base-opacity', opacity.toFixed(2));
    firefly.style.setProperty('--firefly-core-alpha', clamp(profile.coreAlpha * layerConfig.opacityScale, 0.2, 1).toFixed(2));
    firefly.style.setProperty('--firefly-glow-alpha', clamp(profile.glowAlpha * layerConfig.opacityScale, 0.12, 0.82).toFixed(2));
    firefly.style.setProperty('--firefly-halo-alpha', clamp(profile.haloAlpha * layerConfig.opacityScale, 0.08, 0.56).toFixed(2));
    firefly.style.setProperty('--firefly-tight-glow', scalePixelValue(profile.tightGlow, layerConfig.glowScale));
    firefly.style.setProperty('--firefly-tight-spread', scalePixelValue(profile.tightSpread, layerConfig.glowScale));
    firefly.style.setProperty('--firefly-wide-glow', scalePixelValue(profile.wideGlow, layerConfig.glowScale));
    firefly.style.setProperty('--firefly-wide-spread', scalePixelValue(profile.wideSpread, layerConfig.glowScale));
    firefly.style.setProperty('--firefly-blur', profile.blur);

    const flickerDuration = randomBetween(MIN_FLICKER, MAX_FLICKER);
    firefly.style.setProperty('--flicker-duration', `${flickerDuration.toFixed(2)}s`);
    firefly.style.setProperty('--flicker-delay', `${(-Math.random() * flickerDuration).toFixed(2)}s`);

    activeFireflies.push(createFireflyState(firefly, runtimeMode, profile, layerConfig));
    layer.appendChild(firefly);
  }
}

function createFirefliesLayer(layerConfig, runtimeMode) {
  const layer = document.createElement('div');
  layer.className = layerConfig.className;
  layer.dataset.layer = layerConfig.key;
  layer.setAttribute('aria-hidden', 'true');
  if (runtimeMode.constrained) {
    layer.dataset.constrained = 'true';
  }
  if (runtimeMode.reduceMotion) {
    layer.dataset.reduceMotion = 'true';
  }

  createLayerFireflies(layer, layerConfig, runtimeMode);
  return layer;
}

function createFirefliesLayers() {
  updateViewportSize();
  activeFireflies = [];
  activeRuntimeMode = getCurrentFireflyRuntimeMode();
  const layers = FIREFLY_LAYERS.map((layerConfig) => createFirefliesLayer(layerConfig, activeRuntimeMode));

  let nightClassAdded = false;

  if (!document.body.classList.contains('night-fall')) {
    document.body.classList.add('night-fall');
    nightClassAdded = true;
  }

  document.body.append(...layers);
  activeFireflies.forEach((firefly) => {
    renderFirefly(firefly, performance.now());
  });
  startFireflyAnimation();

  const release = () => {
    stopFireflyAnimation();
    layers.forEach((layer) => {
      if (layer.parentNode) {
        layer.remove();
      }
    });
    activeFireflies = [];
    activeRuntimeMode = null;
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
    cleanupCurrentLayer = createFirefliesLayers();
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
  const nextRuntimeMode = getCurrentFireflyRuntimeMode();
  if (
    cleanupCurrentLayer
    && activeRuntimeMode
    && (
      nextRuntimeMode.constrained !== activeRuntimeMode.constrained
      || nextRuntimeMode.reduceMotion !== activeRuntimeMode.reduceMotion
    )
  ) {
    cleanupCurrentLayer();
  }
  evaluateNightState();
}

function handleAtmosphereConstraintChange() {
  if (cleanupCurrentLayer) {
    cleanupCurrentLayer();
  }
  evaluateNightState();
}

function handleVisibilityChange() {
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
  if (!constrainedAtmosphereMedia) {
    constrainedAtmosphereMedia = window.matchMedia(CONSTRAINED_ATMOSPHERE_QUERY);
  }

  evaluateNightState();

  if (!listenersBound) {
    reduceMotionMedia.addEventListener('change', handleReduceMotionChange);
    constrainedAtmosphereMedia.addEventListener('change', handleAtmosphereConstraintChange);
    document.addEventListener(WEATHER_CHANGE_EVENT, handleWeatherStateChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
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
  if (constrainedAtmosphereMedia) {
    constrainedAtmosphereMedia.removeEventListener('change', handleAtmosphereConstraintChange);
  }
  window.removeEventListener('resize', handleResize);
  document.removeEventListener(WEATHER_CHANGE_EVENT, handleWeatherStateChange);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  if (cleanupCurrentLayer) {
    cleanupCurrentLayer();
    cleanupCurrentLayer = null;
  }
  listenersBound = false;
}
