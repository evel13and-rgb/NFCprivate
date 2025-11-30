const AudioCtor = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;

let audioCtx = null;
let masterGain = null;
let noiseLayers = [];
let shimmerOsc = null;
let shimmerLfo = null;
let breezeLayer = null;
let chirpTimeoutId = null;
let owlTimeoutId = null;
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
  // A soft bed of nighttime ambience with a warm low layer
  noiseLayers.push(addNoiseLayer(220, 0.13));
  noiseLayers.push(addNoiseLayer(860, 0.11));
  noiseLayers.push(addNoiseLayer(2400, 0.05));
}

function ensureShimmer() {
  if (!audioCtx || shimmerOsc) {
    return;
  }
  shimmerOsc = audioCtx.createOscillator();
  shimmerOsc.type = 'sine';
  shimmerOsc.frequency.value = 420;

  const shimmerGain = audioCtx.createGain();
  shimmerGain.gain.value = 0.012;

  shimmerOsc.connect(shimmerGain);
  shimmerGain.connect(masterGain);

  shimmerLfo = audioCtx.createOscillator();
  shimmerLfo.type = 'sine';
  shimmerLfo.frequency.value = 0.12;

  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 35;

  shimmerLfo.connect(lfoGain);
  lfoGain.connect(shimmerOsc.frequency);

  shimmerOsc.start();
  shimmerLfo.start();
}

function ensureBreezeLayer() {
  if (!audioCtx || breezeLayer) {
    return;
  }
  const source = audioCtx.createBufferSource();
  source.buffer = createNoiseBuffer(audioCtx, 7);
  source.loop = true;

  const highpass = audioCtx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 90;

  const bandpass = audioCtx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 420;
  bandpass.Q.value = 0.5;

  const gain = audioCtx.createGain();
  gain.gain.value = 0.08;

  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.02 + Math.random() * 0.015;

  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 0.05;

  const lfoOffset = audioCtx.createConstantSource();
  lfoOffset.offset.value = 0.07;

  source.connect(highpass);
  highpass.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(masterGain);

  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);
  lfoOffset.connect(gain.gain);

  source.start();
  lfo.start();
  lfoOffset.start();

  breezeLayer = { source, lfo, lfoOffset };
}

function scheduleChirp() {
  if (!enabled || !audioCtx) {
    return;
  }
  const delay = 5000 + Math.random() * 4000;
  chirpTimeoutId = setTimeout(() => {
    if (!enabled || !audioCtx) {
      return;
    }
    const now = audioCtx.currentTime;
    const chirpCount = 2 + Math.floor(Math.random() * 3);
    const chirpSpacing = 0.18 + Math.random() * 0.04;
    for (let i = 0; i < chirpCount; i += 1) {
      const startTime = now + i * chirpSpacing;
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      const freqBase = 2600 + Math.random() * 420;
      osc.frequency.setValueAtTime(freqBase, startTime);
      osc.frequency.exponentialRampToValueAtTime(freqBase * 0.7, startTime + 0.09);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freqBase, startTime);
      filter.Q.value = 6;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.02, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0003, startTime + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start(startTime);
      osc.stop(startTime + 0.26);
      osc.onended = () => {
        gain.disconnect();
      };
    }

    scheduleChirp();
  }, delay);
}

function cancelChirp() {
  if (chirpTimeoutId) {
    clearTimeout(chirpTimeoutId);
    chirpTimeoutId = null;
  }
}

function scheduleOwl() {
  if (!enabled || !audioCtx) {
    return;
  }
  const delay = 16000 + Math.random() * 18000;
  owlTimeoutId = setTimeout(() => {
    if (!enabled || !audioCtx) {
      return;
    }
    const now = audioCtx.currentTime + 0.4;
    const hootCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < hootCount; i += 1) {
      const startTime = now + i * 0.55;
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      const freqBase = 360 + Math.random() * 30;
      osc.frequency.setValueAtTime(freqBase, startTime);
      osc.frequency.exponentialRampToValueAtTime(freqBase * 0.92, startTime + 0.35);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.03, startTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.65);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(startTime);
      osc.stop(startTime + 0.7);
      osc.onended = () => {
        gain.disconnect();
      };
    }

    scheduleOwl();
  }, delay);
}

function cancelOwl() {
  if (owlTimeoutId) {
    clearTimeout(owlTimeoutId);
    owlTimeoutId = null;
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
  ensureBreezeLayer();
  ctx.resume?.().catch(() => {});
  const now = ctx.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  if (enabled) {
    masterGain.gain.setTargetAtTime(0.16, now, 2.8);
    cancelChirp();
    cancelOwl();
    scheduleChirp();
    scheduleOwl();
  } else {
    masterGain.gain.setTargetAtTime(0.0001, now, 1.6);
    cancelChirp();
    cancelOwl();
  }
}
