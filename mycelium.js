import { isNightTime } from './dayNight.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const PATH_LENGTH_KEY = Symbol('myceliumPathLength');

const PATH_DEFINITIONS = [
  {
    d: 'M0 910 C160 868 320 822 480 776 C640 734 820 706 960 710 C986 711 1000 718 1000 718',
    width: 1.9,
    opacity: 0.44,
    duration: 8.8,
    delay: 0.25,
    accent: false,
    pulse: true,
    pulseDuration: 18,
    pulseAmplitude: 0.08
  },
  {
    d: 'M0 820 C180 768 340 712 500 668 C660 624 820 598 1000 600',
    width: 1.6,
    opacity: 0.4,
    duration: 8.6,
    delay: 0.55,
    accent: false,
    pulse: true,
    pulseDuration: 19,
    pulseAmplitude: 0.07
  },
  {
    d: 'M0 720 C160 676 320 644 480 620 C640 596 820 578 1000 560',
    width: 1.3,
    opacity: 0.38,
    duration: 8.2,
    delay: 0.85,
    accent: true,
    pulse: true,
    pulseDuration: 18,
    pulseAmplitude: 0.06
  },
  {
    d: 'M1000 860 C860 820 700 764 560 706 C420 652 280 598 120 560 C70 548 32 536 0 534',
    width: 1.7,
    opacity: 0.42,
    duration: 9.0,
    delay: 0.4,
    accent: false,
    pulse: true,
    pulseDuration: 20,
    pulseAmplitude: 0.08
  },
  {
    d: 'M1000 760 C840 720 700 676 560 630 C420 586 260 548 100 520 C66 514 34 508 0 506',
    width: 1.2,
    opacity: 0.36,
    duration: 8.0,
    delay: 1.0,
    accent: true,
    pulse: true,
    pulseDuration: 17,
    pulseAmplitude: 0.06
  },
  {
    d: 'M0 640 C150 632 300 628 450 636 C610 646 780 668 940 708 C966 714 986 720 1000 726',
    width: 1.4,
    opacity: 0.35,
    duration: 8.4,
    delay: 1.3,
    accent: false,
    pulse: false
  },
  {
    d: 'M0 580 C160 594 320 616 480 650 C640 686 820 736 1000 796',
    width: 1.1,
    opacity: 0.33,
    duration: 7.8,
    delay: 1.5,
    accent: true,
    pulse: false
  },
  {
    d: 'M120 0 C150 180 190 360 240 520 C292 692 340 856 360 1000',
    width: 0.95,
    opacity: 0.32,
    duration: 7.6,
    delay: 1.2,
    accent: true,
    pulse: true,
    pulseDuration: 19,
    pulseAmplitude: 0.05
  },
  {
    d: 'M260 0 C300 180 360 360 420 520 C480 688 520 840 540 1000',
    width: 0.9,
    opacity: 0.3,
    duration: 7.4,
    delay: 1.55,
    accent: false,
    pulse: true,
    pulseDuration: 18,
    pulseAmplitude: 0.05
  },
  {
    d: 'M740 0 C720 180 680 360 640 520 C600 688 560 844 540 1000',
    width: 0.9,
    opacity: 0.3,
    duration: 7.5,
    delay: 1.65,
    accent: true,
    pulse: true,
    pulseDuration: 18,
    pulseAmplitude: 0.05
  },
  {
    d: 'M880 0 C850 200 810 380 760 540 C712 692 660 846 640 1000',
    width: 0.98,
    opacity: 0.32,
    duration: 7.9,
    delay: 1.85,
    accent: false,
    pulse: true,
    pulseDuration: 19,
    pulseAmplitude: 0.05
  },
  {
    d: 'M0 460 C160 480 320 506 480 548 C640 592 820 652 1000 720',
    width: 0.82,
    opacity: 0.29,
    duration: 7.2,
    delay: 1.95,
    accent: true,
    pulse: false
  },
  {
    d: 'M0 380 C140 404 300 436 460 492 C620 548 780 624 940 712 C968 728 986 742 1000 754',
    width: 0.78,
    opacity: 0.28,
    duration: 7.0,
    delay: 2.1,
    accent: false,
    pulse: true,
    pulseDuration: 16,
    pulseAmplitude: 0.05
  },
  {
    d: 'M0 300 C160 340 320 388 470 456 C620 526 780 612 940 712 C970 730 990 746 1000 758',
    width: 0.72,
    opacity: 0.27,
    duration: 6.9,
    delay: 2.25,
    accent: true,
    pulse: false
  },
  {
    d: 'M1000 420 C860 440 720 472 580 520 C440 568 280 644 120 744 C80 768 40 792 0 816',
    width: 0.74,
    opacity: 0.28,
    duration: 7.3,
    delay: 2.35,
    accent: false,
    pulse: true,
    pulseDuration: 17,
    pulseAmplitude: 0.05
  },
  {
    d: 'M1000 340 C860 370 720 410 580 470 C440 532 280 624 120 738 C80 766 40 792 0 820',
    width: 0.7,
    opacity: 0.27,
    duration: 7.1,
    delay: 2.5,
    accent: true,
    pulse: false
  }
];

let layer = null;
let svgElement = null;
let growthPaths = [];
let desiredActive = false;
let isLayerVisible = false;
let reduceMotionMedia = null;
let reduceMotionEnabled = false;
let hideTimerId = null;
let restTimerId = null;

function ensureLayer() {
  if (layer) {
    return layer;
  }
  const body = document.body;
  if (!body) {
    return null;
  }

  layer = document.createElement('div');
  layer.className = 'mycelium-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.style.visibility = 'hidden';

  svgElement = document.createElementNS(SVG_NS, 'svg');
  svgElement.classList.add('mycelium-canvas');
  svgElement.setAttribute('viewBox', '0 0 1000 1000');
  svgElement.setAttribute('preserveAspectRatio', 'none');

  growthPaths = PATH_DEFINITIONS.map((definition) => {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', definition.d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-width', definition.width.toString());
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    path.classList.add('mycelium-path');
    path.classList.add(definition.accent ? 'mycelium-path--accent' : 'mycelium-path--base');
    path.style.opacity = definition.opacity.toString();
    path.dataset.growthDuration = definition.duration.toString();
    path.dataset.growthDelay = definition.delay.toString();
    if (definition.pulse) {
      path.dataset.pulse = 'true';
      const minOpacity = definition.opacity;
      const maxOpacity = Math.min(definition.opacity + (definition.pulseAmplitude ?? 0.06), 0.65);
      path.style.setProperty('--mycelium-pulse-min-opacity', minOpacity.toFixed(2));
      path.style.setProperty('--mycelium-pulse-max-opacity', maxOpacity.toFixed(2));
      if (definition.pulseDuration) {
        path.style.setProperty('--mycelium-pulse-duration', `${definition.pulseDuration}s`);
      }
    }
    svgElement.appendChild(path);
    return path;
  });

  layer.appendChild(svgElement);
  body.insertBefore(layer, body.firstChild || null);
  return layer;
}

function rewindPaths() {
  if (!growthPaths.length) {
    return;
  }
  growthPaths.forEach((path) => {
    const length = typeof path.getTotalLength === 'function' ? path.getTotalLength() : 0;
    path[PATH_LENGTH_KEY] = length;
    path.style.transition = 'none';
    path.style.removeProperty('transition-delay');
    path.style.strokeDasharray = length ? `${length}` : '';
    path.style.strokeDashoffset = length ? `${length}` : '';
  });
  if (svgElement) {
    void svgElement.getBoundingClientRect();
  }
  growthPaths.forEach((path) => {
    path.style.removeProperty('transition');
  });
}

function showLayer() {
  if (!layer) {
    return false;
  }
  if (isLayerVisible) {
    return false;
  }
  const scheduler = typeof window !== 'undefined' ? window : globalThis;
  if (hideTimerId && scheduler) {
    scheduler.clearTimeout(hideTimerId);
    hideTimerId = null;
  }
  layer.style.visibility = 'visible';
  layer.classList.add('mycelium-layer--visible');
  isLayerVisible = true;
  return true;
}

function hideLayer(force = false) {
  if (!layer) {
    return;
  }
  layer.classList.remove('mycelium-layer--visible');
  layer.classList.remove('mycelium-layer--resting');
  if (restTimerId && typeof window !== 'undefined') {
    window.clearTimeout(restTimerId);
    restTimerId = null;
  }
  rewindPaths();
  isLayerVisible = false;
  const scheduler = typeof window !== 'undefined' ? window : globalThis;
  if (!scheduler) {
    layer.style.visibility = 'hidden';
    return;
  }
  if (hideTimerId) {
    scheduler.clearTimeout(hideTimerId);
  }
  const delay = force ? 0 : 1400;
  hideTimerId = scheduler.setTimeout(() => {
    if (layer && !layer.classList.contains('mycelium-layer--visible')) {
      layer.style.visibility = 'hidden';
    }
  }, delay);
}

function scheduleRestingState(maxDurationSeconds) {
  if (restTimerId && typeof window !== 'undefined') {
    window.clearTimeout(restTimerId);
    restTimerId = null;
  }
  if (typeof window === 'undefined') {
    return;
  }
  restTimerId = window.setTimeout(() => {
    if (layer && isLayerVisible) {
      layer.classList.add('mycelium-layer--resting');
    }
  }, Math.max(maxDurationSeconds * 1000 + 200, 0));
}

function playGrowthAnimation() {
  if (!growthPaths.length) {
    return;
  }
  let longestDuration = 0;
  growthPaths.forEach((path) => {
    const length = path[PATH_LENGTH_KEY] ?? (typeof path.getTotalLength === 'function' ? path.getTotalLength() : 0);
    path[PATH_LENGTH_KEY] = length;
    path.style.transition = 'none';
    path.style.removeProperty('transition-delay');
    path.style.strokeDasharray = length ? `${length}` : '';
    path.style.strokeDashoffset = length ? `${length}` : '';
  });
  if (svgElement) {
    void svgElement.getBoundingClientRect();
  }
  growthPaths.forEach((path) => {
    const duration = Number.parseFloat(path.dataset.growthDuration) || 7.5;
    const delay = Number.parseFloat(path.dataset.growthDelay) || 0;
    path.style.transition = `stroke-dashoffset ${duration}s cubic-bezier(0.45, 0, 0.25, 1)`;
    if (delay > 0) {
      path.style.transitionDelay = `${delay}s`;
    } else {
      path.style.removeProperty('transition-delay');
    }
    path.style.strokeDashoffset = '0';
    const total = duration + delay;
    if (total > longestDuration) {
      longestDuration = total;
    }
  });
  scheduleRestingState(longestDuration || 0);
}

function applyActiveState() {
  if (!desiredActive && !layer) {
    return;
  }
  ensureLayer();
  if (!layer) {
    return;
  }

  if (reduceMotionEnabled) {
    layer.dataset.reduceMotion = 'true';
    hideLayer(true);
    return;
  }

  delete layer.dataset.reduceMotion;

  if (desiredActive) {
    const becameVisible = showLayer();
    if (becameVisible) {
      layer.classList.remove('mycelium-layer--resting');
      const raf = typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
        ? window.requestAnimationFrame.bind(window)
        : null;
      if (raf) {
        raf(() => {
          raf(() => {
            playGrowthAnimation();
          });
        });
      } else {
        playGrowthAnimation();
      }
    }
  } else {
    hideLayer();
  }
}

function handleReduceMotionChange(event) {
  const shouldReduce = !!event.matches;
  if (shouldReduce === reduceMotionEnabled) {
    return;
  }
  reduceMotionEnabled = shouldReduce;
  applyActiveState();
}

export function initDayMycelium() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  if (!reduceMotionMedia && typeof window.matchMedia === 'function') {
    reduceMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduceMotionEnabled = reduceMotionMedia?.matches ?? false;
    if (typeof reduceMotionMedia.addEventListener === 'function') {
      reduceMotionMedia.addEventListener('change', handleReduceMotionChange);
    } else if (typeof reduceMotionMedia.addListener === 'function') {
      reduceMotionMedia.addListener(handleReduceMotionChange);
    }
  } else {
    reduceMotionEnabled = reduceMotionMedia?.matches ?? false;
  }

  desiredActive = !isNightTime();
  applyActiveState();
}

export function setDayMyceliumActive(active) {
  const next = !!active;
  if (next === desiredActive && layer) {
    if (reduceMotionEnabled) {
      hideLayer(true);
    }
    return;
  }
  desiredActive = next;
  applyActiveState();
}

