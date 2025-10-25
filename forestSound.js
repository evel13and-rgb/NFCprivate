const AudioCtor = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;

let audioCtx = null;
let masterGain = null;
let noiseLayers = [];
let shimmerOsc = null;
let shimmerLfo = null;
let chirpTimeoutId = null;
let enabled = false;
let interactionArmed = false;

function ensureContext() {
  if (!AudioCtor) {
    return null;
  }
  if (!audioCtx) {
    audioCtx = new AudioCtor();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioCtx.destination);
  }
  return audioCtx;
}

function createNoiseBuffer(ctx, seconds = 4) {
  const frameCount = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < frameCount; i += 1) {
    const random = Math.random() * 2 - 1;
    // smooth out the noise slightly to keep it gentle
    last = last * 0.7 + random * 0.3;
    data[i] = last * 0.6;
  }
  return buffer;
}

function addNoiseLayer(centerFreq, gainValue) {
  const ctx = ensureContext();
  if (!ctx) return null;
  const source = ctx.createBufferSource();
  source.buffer = createNoiseBuffer(ctx, 5);
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = centerFreq;
  filter.Q.value = 0.9;

  const layerGain = ctx.createGain();
  layerGain.gain.value = gainValue;

  source.connect(filter);
  filter.connect(layerGain);
  layerGain.connect(masterGain);
  source.start();
  return { source, filter, layerGain };
}

function ensureNoiseLayers() {
  if (!audioCtx || noiseLayers.length) {
    return;
  }
  noiseLayers.push(addNoiseLayer(420, 0.18));
  noiseLayers.push(addNoiseLayer(1800, 0.12));
}

function ensureShimmer() {
  if (!audioCtx || shimmerOsc) {
    return;
  }
  shimmerOsc = audioCtx.createOscillator();
  shimmerOsc.type = 'sine';
  shimmerOsc.frequency.value = 940;

  const shimmerGain = audioCtx.createGain();
  shimmerGain.gain.value = 0.015;

  shimmerOsc.connect(shimmerGain);
  shimmerGain.connect(masterGain);

  shimmerLfo = audioCtx.createOscillator();
  shimmerLfo.type = 'sine';
  shimmerLfo.frequency.value = 0.18;

  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 120;

  shimmerLfo.connect(lfoGain);
  lfoGain.connect(shimmerOsc.frequency);

  shimmerOsc.start();
  shimmerLfo.start();
}

function scheduleChirp() {
  if (!enabled || !audioCtx) {
    return;
  }
  const delay = 7000 + Math.random() * 5000;
  chirpTimeoutId = setTimeout(() => {
    if (!enabled || !audioCtx) {
      return;
    }
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    const freqBase = 1300 + Math.random() * 220;
    osc.frequency.setValueAtTime(freqBase, now);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 1.4);
    osc.onended = () => {
      gain.disconnect();
    };

    scheduleChirp();
  }, delay);
}

function cancelChirp() {
  if (chirpTimeoutId) {
    clearTimeout(chirpTimeoutId);
    chirpTimeoutId = null;
  }
}

function armInteractionResume() {
  if (interactionArmed || typeof document === 'undefined') {
    return;
  }
  interactionArmed = true;
  const handler = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  };
  const onceHandler = () => {
    handler();
    document.removeEventListener('pointerdown', onceHandler);
    document.removeEventListener('keydown', onceHandler);
  };
  document.addEventListener('pointerdown', onceHandler, { passive: true });
  document.addEventListener('keydown', onceHandler);
}

export function initForestSound() {
  if (!AudioCtor) {
    return;
  }
  armInteractionResume();
}

export function setForestSoundActive(active) {
  if (!AudioCtor) {
    return;
  }
  enabled = Boolean(active);
  const ctx = ensureContext();
  if (!ctx || !masterGain) {
    return;
  }
  ensureNoiseLayers();
  ensureShimmer();
  ctx.resume?.().catch(() => {});
  const now = ctx.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  if (enabled) {
    masterGain.gain.setTargetAtTime(0.16, now, 2.8);
    cancelChirp();
    scheduleChirp();
  } else {
    masterGain.gain.setTargetAtTime(0.0001, now, 1.6);
    cancelChirp();
  }
}
