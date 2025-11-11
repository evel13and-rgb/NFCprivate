import { isNightTime } from './dayNight.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const PATH_LENGTH_KEY = Symbol('myceliumPathLength');

const PATH_DEFINITIONS = [
  {
    d: 'M0 640 C70 630 140 600 210 540 C270 490 330 450 390 420 C420 404 450 388 460 360',
    width: 1.8,
    opacity: 0.42,
    duration: 8.6,
    delay: 0.25,
    accent: false,
    pulse: true,
    pulseDuration: 18,
    pulseAmplitude: 0.08
  },
  {
    d: 'M120 600 C160 562 210 522 270 500 C312 484 348 466 372 444',
    width: 0.95,
    opacity: 0.36,
    duration: 7.4,
    delay: 1.05,
    accent: true,
    pulse: true,
    pulseDuration: 19,
    pulseAmplitude: 0.06
  },
  {
    d: 'M180 708 C226 664 272 622 320 584 C356 556 392 528 420 496',
    width: 1.1,
    opacity: 0.34,
    duration: 7.9,
    delay: 0.75,
    accent: false,
    pulse: false
  },
  {
    d: 'M58 1000 C92 920 132 856 188 792 C234 738 286 686 336 646 C366 620 392 588 408 554',
    width: 1.6,
    opacity: 0.38,
    duration: 8.8,
    delay: 0.6,
    accent: false,
    pulse: true,
    pulseDuration: 20,
    pulseAmplitude: 0.07
  },
  {
    d: 'M216 792 C248 752 290 716 330 692 C360 672 384 646 402 616',
    width: 0.7,
    opacity: 0.32,
    duration: 6.6,
    delay: 1.5,
    accent: true,
    pulse: false
  },
  {
    d: 'M1000 662 C934 638 868 600 804 540 C742 482 694 440 646 410 C608 386 572 366 540 350',
    width: 1.9,
    opacity: 0.44,
    duration: 8.9,
    delay: 0.35,
    accent: false,
    pulse: true,
    pulseDuration: 17,
    pulseAmplitude: 0.08
  },
  {
    d: 'M820 562 C778 520 738 492 700 472 C660 452 624 432 592 408',
    width: 1.0,
    opacity: 0.37,
    duration: 7.2,
    delay: 1.2,
    accent: true,
    pulse: true,
    pulseDuration: 18,
    pulseAmplitude: 0.05
  },
  {
    d: 'M942 1000 C900 926 858 862 810 804 C760 744 716 692 678 648 C646 612 624 574 608 540',
    width: 1.5,
    opacity: 0.4,
    duration: 9.2,
    delay: 0.9,
    accent: false,
    pulse: true,
    pulseDuration: 21,
    pulseAmplitude: 0.07
  },
  {
    d: 'M752 784 C718 742 684 706 648 672 C620 646 600 616 584 584',
    width: 0.65,
    opacity: 0.33,
    duration: 6.8,
    delay: 1.6,
    accent: true,
    pulse: false
  },
  {
    d: 'M486 1000 C468 940 446 882 426 832 C406 784 398 742 394 704',
    width: 1.1,
    opacity: 0.31,
    duration: 7.1,
    delay: 1.8,
    accent: false,
    pulse: false
  },
  {
    d: 'M212 566 C244 540 274 520 304 496 C332 474 354 450 374 426',
    width: 0.62,
    opacity: 0.29,
    duration: 6.7,
    delay: 2.0,
    accent: true,
    pulse: false
  },
  {
    d: 'M168 652 C202 620 234 590 260 556 C282 526 304 498 322 468',
    width: 0.58,
    opacity: 0.27,
    duration: 6.5,
    delay: 1.95,
    accent: false,
    pulse: true,
    pulseDuration: 16,
    pulseAmplitude: 0.05
  },
  {
    d: 'M292 742 C320 708 348 678 378 650 C402 628 426 604 446 576',
    width: 0.55,
    opacity: 0.28,
    duration: 6.9,
    delay: 2.2,
    accent: true,
    pulse: false
  },
  {
    d: 'M818 534 C782 506 746 478 714 450 C684 424 654 400 624 374',
    width: 0.6,
    opacity: 0.3,
    duration: 6.8,
    delay: 2.05,
    accent: true,
    pulse: false
  },
  {
    d: 'M864 616 C826 586 792 554 758 524 C730 500 704 470 676 444',
    width: 0.57,
    opacity: 0.28,
    duration: 6.6,
    delay: 2.1,
    accent: false,
    pulse: true,
    pulseDuration: 17,
    pulseAmplitude: 0.05
  },
  {
    d: 'M716 706 C686 676 656 646 630 618 C604 590 582 562 560 534',
    width: 0.54,
    opacity: 0.27,
    duration: 7.0,
    delay: 2.3,
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

