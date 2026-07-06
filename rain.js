(() => {
  'use strict';

  const RAIN_SCENES = new Set(['day-rain', 'sunset-rain', 'night-rain']);
  const LIGHT_RAIN = 'light-rain';
  const HEAVY_RAIN = 'heavy-rain';
  const MOBILE_BREAKPOINT = 640;
  const DPR_LIMIT = 1.75;
  const CARD_RECT_REFRESH_MS = 250;

  const canvas = document.querySelector('.rain-canvas');
  const context = canvas?.getContext?.('2d', { alpha: true });

  if (!canvas || !context || typeof window === 'undefined' || !document.body) {
    return;
  }

  const reduceMotionMedia = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  let viewportWidth = 0;
  let viewportHeight = 0;
  let pixelRatio = 1;
  let activeMode = null;
  let activeScene = null;
  let drops = [];
  let frameId = null;
  let lastFrameTime = 0;
  let cardRect = null;
  let lastCardRectTime = 0;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function isReducedMotion() {
    return reduceMotionMedia?.matches ?? false;
  }

  function isMobileViewport() {
    return viewportWidth <= MOBILE_BREAKPOINT;
  }

  function getRainMode(weather, visualScene) {
    if (weather === HEAVY_RAIN) {
      return 'heavy';
    }

    if (weather === LIGHT_RAIN || RAIN_SCENES.has(visualScene)) {
      return 'light';
    }

    return null;
  }

  function getRainScene(weather, visualScene) {
    if (RAIN_SCENES.has(visualScene)) {
      return visualScene;
    }

    const timeOfDay = document.body.dataset.timeOfDay;
    if (weather === LIGHT_RAIN || weather === HEAVY_RAIN) {
      if (timeOfDay === 'night') {
        return 'night-rain';
      }
      if (timeOfDay === 'sunset') {
        return 'sunset-rain';
      }
      return 'day-rain';
    }

    return 'day-rain';
  }

  function getSceneColor(scene) {
    if (scene === 'sunset-rain') {
      return { r: 226, g: 198, b: 154 };
    }

    if (scene === 'night-rain') {
      return { r: 172, g: 205, b: 230 };
    }

    return { r: 207, g: 224, b: 224 };
  }

  function updateCanvasSize() {
    const nextWidth = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
    const nextHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
    const nextRatio = Math.min(window.devicePixelRatio || 1, DPR_LIMIT);
    const widthChanged = nextWidth !== viewportWidth || nextHeight !== viewportHeight || nextRatio !== pixelRatio;

    viewportWidth = nextWidth;
    viewportHeight = nextHeight;
    pixelRatio = nextRatio;

    if (widthChanged) {
      canvas.width = Math.ceil(viewportWidth * pixelRatio);
      canvas.height = Math.ceil(viewportHeight * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    return widthChanged;
  }

  function refreshCardRect(force = false) {
    const now = performance.now();
    if (!force && now - lastCardRectTime < CARD_RECT_REFRESH_MS) {
      return;
    }

    const card = document.getElementById('quote-card');
    if (!card) {
      cardRect = null;
      lastCardRectTime = now;
      return;
    }

    const rect = card.getBoundingClientRect();
    cardRect = {
      top: rect.top - 18,
      right: rect.right + 18,
      bottom: rect.bottom + 18,
      left: rect.left - 18,
    };
    lastCardRectTime = now;
  }

  function getDropCount(mode) {
    const areaFactor = clamp((viewportWidth * viewportHeight) / (1280 * 720), 0.5, 1.55);
    const mobile = isMobileViewport();
    const baseCount = mode === 'heavy'
      ? (mobile ? 112 : 220)
      : (mobile ? 42 : 86);
    const reducedFactor = isReducedMotion()
      ? (mode === 'heavy' ? 0.18 : 0.24)
      : 1;

    return Math.round(baseCount * areaFactor * reducedFactor);
  }

  function pickDepth() {
    if (Math.random() > 0.9) {
      return randomBetween(0.78, 1);
    }

    return Math.pow(Math.random(), 1.85) * 0.78;
  }

  function createDrop(mode, startAbove = false) {
    const depth = pickDepth();
    const heavy = mode === 'heavy';
    const length = clamp(
      randomBetween(heavy ? 5 : 3, heavy ? 10 : 7) + depth * randomBetween(heavy ? 9 : 5, heavy ? 17 : 11),
      heavy ? 5 : 3,
      heavy ? 24 : 16,
    );
    const speed = randomBetween(heavy ? 360 : 185, heavy ? 650 : 350) * (0.48 + depth * 0.82);
    const opacity = randomBetween(heavy ? 0.045 : 0.025, heavy ? 0.11 : 0.07) + depth * (heavy ? 0.12 : 0.075);
    const thickness = randomBetween(0.45, heavy ? 1.05 : 0.82) * (0.62 + depth * 0.72);

    return {
      x: randomBetween(-viewportWidth * 0.08, viewportWidth * 1.08),
      y: startAbove ? randomBetween(-viewportHeight * 0.18, -length) : randomBetween(-viewportHeight * 0.12, viewportHeight * 1.05),
      length,
      speed,
      opacity,
      thickness,
      wind: randomBetween(heavy ? -38 : -20, heavy ? 18 : 14) * (0.44 + depth * 0.72),
      depth,
    };
  }

  function resetDrops() {
    if (!activeMode) {
      drops = [];
      return;
    }

    const total = getDropCount(activeMode);
    drops = Array.from({ length: total }, () => createDrop(activeMode));
  }

  function clearCanvas() {
    context.clearRect(0, 0, viewportWidth, viewportHeight);
  }

  function getCardOpacityFactor(drop) {
    if (!cardRect) {
      return 1;
    }

    const centerX = drop.x + ((drop.wind / Math.max(drop.speed, 1)) * drop.length * 0.5);
    const centerY = drop.y + drop.length * 0.5;
    const overlapsCard = (
      centerX >= cardRect.left
      && centerX <= cardRect.right
      && centerY >= cardRect.top
      && centerY <= cardRect.bottom
    );

    if (!overlapsCard) {
      return 1;
    }

    return 0.16 + (1 - drop.depth) * 0.1;
  }

  function drawRain(timestamp = performance.now()) {
    clearCanvas();

    if (!activeMode) {
      return;
    }

    refreshCardRect();

    const color = getSceneColor(activeScene);
    const reducedMotionFactor = isReducedMotion() ? 0.48 : 1;
    const modeFactor = activeMode === 'heavy' ? 1 : 0.9;

    context.lineCap = 'round';
    context.lineJoin = 'round';

    drops.forEach((drop, index) => {
      const cardFactor = getCardOpacityFactor(drop);
      const alpha = clamp(drop.opacity * reducedMotionFactor * modeFactor * cardFactor, 0, 0.34);

      if (alpha <= 0.004) {
        return;
      }

      const vectorX = (drop.wind / Math.max(drop.speed, 1)) * drop.length;
      const organicJitter = Math.sin(timestamp * 0.0014 + index * 1.37) * drop.depth * 0.7;
      const startX = drop.x + organicJitter;
      const startY = drop.y;
      const endX = startX + vectorX;
      const endY = startY + drop.length;

      context.beginPath();
      context.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha.toFixed(3)})`;
      context.lineWidth = drop.thickness;
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.stroke();
    });
  }

  function recycleDrop(drop) {
    Object.assign(drop, createDrop(activeMode, true));
  }

  function animateRain(timestamp) {
    if (!activeMode || isReducedMotion() || document.hidden) {
      frameId = null;
      return;
    }

    if (!lastFrameTime) {
      lastFrameTime = timestamp;
    }

    const deltaSeconds = Math.min((timestamp - lastFrameTime) / 1000, 0.06);
    const gust = Math.sin(timestamp * 0.00024) * (activeMode === 'heavy' ? 12 : 6);
    lastFrameTime = timestamp;

    drops.forEach((drop) => {
      drop.y += drop.speed * deltaSeconds;
      drop.x += (drop.wind + gust * drop.depth) * deltaSeconds;

      if (
        drop.y - drop.length > viewportHeight
        || drop.x < -viewportWidth * 0.16
        || drop.x > viewportWidth * 1.16
      ) {
        recycleDrop(drop);
      }
    });

    drawRain(timestamp);
    frameId = window.requestAnimationFrame(animateRain);
  }

  function stopAnimation() {
    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
      frameId = null;
    }
    lastFrameTime = 0;
  }

  function startAnimation() {
    if (!activeMode || isReducedMotion() || document.hidden || frameId !== null) {
      return;
    }

    lastFrameTime = 0;
    frameId = window.requestAnimationFrame(animateRain);
  }

  function activateRain(mode, scene) {
    const changed = mode !== activeMode || scene !== activeScene;
    activeMode = mode;
    activeScene = scene;
    canvas.classList.add('is-active');
    updateCanvasSize();
    refreshCardRect(true);

    const expectedDropCount = getDropCount(activeMode);
    if (changed || drops.length !== expectedDropCount) {
      resetDrops();
    }

    if (isReducedMotion()) {
      stopAnimation();
      drawRain();
      return;
    }

    startAnimation();
  }

  function deactivateRain() {
    stopAnimation();
    activeMode = null;
    activeScene = null;
    drops = [];
    canvas.classList.remove('is-active');
    clearCanvas();
  }

  function evaluateRainState() {
    const { weather, visualScene } = document.body.dataset;
    const nextMode = getRainMode(weather, visualScene);

    if (!nextMode) {
      deactivateRain();
      return;
    }

    activateRain(nextMode, getRainScene(weather, visualScene));
  }

  function handleResize() {
    const sizeChanged = updateCanvasSize();
    refreshCardRect(true);

    if (!activeMode) {
      clearCanvas();
      return;
    }

    if (sizeChanged) {
      resetDrops();
    }

    if (isReducedMotion()) {
      drawRain();
    }
  }

  function handleReducedMotionChange() {
    if (!activeMode) {
      return;
    }

    resetDrops();
    if (isReducedMotion()) {
      stopAnimation();
      drawRain();
    } else {
      startAnimation();
    }
  }

  function handleVisibilityChange() {
    if (!activeMode) {
      return;
    }

    if (document.hidden) {
      stopAnimation();
    } else if (isReducedMotion()) {
      drawRain();
    } else {
      startAnimation();
    }
  }

  const observer = new MutationObserver(evaluateRainState);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-weather', 'data-visual-scene'],
  });

  window.addEventListener('resize', handleResize, { passive: true });
  document.addEventListener('visibilitychange', handleVisibilityChange);

  if (reduceMotionMedia) {
    if (typeof reduceMotionMedia.addEventListener === 'function') {
      reduceMotionMedia.addEventListener('change', handleReducedMotionChange);
    } else if (typeof reduceMotionMedia.addListener === 'function') {
      reduceMotionMedia.addListener(handleReducedMotionChange);
    }
  }

  updateCanvasSize();
  evaluateRainState();
})();
