const SCENE_ASSETS = Object.freeze({
  day: Object.freeze({
    webp: './backgrounds/paramodia.webp',
    fallback: './backgrounds/paramodia.png',
  }),
  dawn: Object.freeze({
    webp: './backgrounds/paramoamanecer.webp',
    fallback: './backgrounds/paramoamanecer.png',
  }),
  sunny: Object.freeze({
    webp: './backgrounds/paramosol.webp',
    fallback: './backgrounds/paramosol.png',
  }),
  rainbow: Object.freeze({
    webp: './backgrounds/paramoarcoiris.webp',
    fallback: './backgrounds/paramoarcoiris.png',
  }),
  sunset: Object.freeze({
    webp: './backgrounds/paramoatardecer.webp',
    fallback: './backgrounds/paramoatardecer.png',
  }),
  night: Object.freeze({
    webp: './backgrounds/paramonoche.webp',
    fallback: './backgrounds/paramonoche.png',
  }),
});

const SCENE_ASSET_BY_VISUAL_SCENE = Object.freeze({
  dawn: 'dawn',
  'sunny-day': 'sunny',
  'rainbow-after-rain': 'rainbow',
  sunset: 'sunset',
  'sunset-mist': 'sunset',
  'sunset-rain': 'sunset',
  night: 'night',
  'night-clear': 'night',
  'night-mist': 'night',
  'night-rain': 'night',
});

const SCENE_ASSET_BY_TIME = Object.freeze({
  dawn: 'dawn',
  day: 'day',
  sunset: 'sunset',
  night: 'night',
});

export function resolveSceneBackground(visualState = {}) {
  const assetId =
    SCENE_ASSET_BY_VISUAL_SCENE[visualState.visualScene]
    || SCENE_ASSET_BY_TIME[visualState.timeOfDay]
    || 'day';

  return {
    id: assetId,
    ...SCENE_ASSETS[assetId],
  };
}

function waitForImage(url, ImageConstructor) {
  return new Promise((resolve, reject) => {
    const image = new ImageConstructor();
    image.addEventListener('load', async () => {
      if (typeof image.decode === 'function') {
        try {
          await image.decode();
        } catch {
          // La descarga terminó; el navegador aún puede pintar la imagen.
        }
      }
      resolve(url);
    }, { once: true });
    image.addEventListener('error', reject, { once: true });
    image.src = url;
  });
}

async function loadSceneAsset(scene, ImageConstructor) {
  try {
    return await waitForImage(scene.webp, ImageConstructor);
  } catch {
    return waitForImage(scene.fallback, ImageConstructor);
  }
}

function waitForTransition(layer, duration, windowRef) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      layer.removeEventListener('transitionend', handleTransitionEnd);
      windowRef.clearTimeout(timeoutId);
      resolve();
    };
    const handleTransitionEnd = (event) => {
      if (event.target === layer && event.propertyName === 'opacity') {
        finish();
      }
    };
    const timeoutId = windowRef.setTimeout(finish, duration + 120);
    layer.addEventListener('transitionend', handleTransitionEnd);
  });
}

export function createSceneBackgroundController({
  documentRef = document,
  windowRef = window,
  ImageConstructor = Image,
  transitionDuration = 2800,
} = {}) {
  const root = documentRef.getElementById('scene-background');
  const layers = root ? [...root.querySelectorAll('[data-scene-layer]')] : [];
  const reduceMotionQuery = windowRef.matchMedia?.('(prefers-reduced-motion: reduce)');

  let activeLayer = layers.find(layer => layer.classList.contains('is-visible')) || layers[0];
  let activeSceneId = activeLayer?.dataset.sceneId || 'day';
  let requestedScene = null;
  let processing = false;

  async function crossfade(scene, assetUrl) {
    if (!activeLayer || layers.length < 2) return;
    const incomingLayer = layers.find(layer => layer !== activeLayer);
    const reducedMotion = reduceMotionQuery?.matches ?? false;
    const duration = reducedMotion ? 140 : transitionDuration;

    incomingLayer.style.setProperty('--scene-transition-duration', `${duration}ms`);
    incomingLayer.style.backgroundImage = `url("${assetUrl}")`;
    incomingLayer.dataset.sceneId = scene.id;
    incomingLayer.classList.add('is-entering');

    await new Promise(resolve => windowRef.requestAnimationFrame(resolve));
    incomingLayer.classList.add('is-visible');
    await waitForTransition(incomingLayer, duration, windowRef);

    activeLayer.classList.remove('is-visible', 'is-entering');
    incomingLayer.classList.remove('is-entering');
    activeLayer = incomingLayer;
    activeSceneId = scene.id;
    if (root) root.dataset.activeScene = scene.id;
  }

  async function processQueue() {
    if (processing || !activeLayer || layers.length < 2) return;
    processing = true;

    while (requestedScene) {
      const scene = requestedScene;
      requestedScene = null;
      if (scene.id === activeSceneId) continue;

      let assetUrl;
      try {
        assetUrl = await loadSceneAsset(scene, ImageConstructor);
      } catch {
        continue;
      }

      if (requestedScene && requestedScene.id !== scene.id) {
        continue;
      }
      await crossfade(scene, assetUrl);
    }

    processing = false;
  }

  function setScene(visualState) {
    const scene = resolveSceneBackground(visualState);
    if (scene.id === activeSceneId && !processing) return;
    requestedScene = scene;
    processQueue();
  }

  return {
    setScene,
    getActiveSceneId: () => activeSceneId,
  };
}
