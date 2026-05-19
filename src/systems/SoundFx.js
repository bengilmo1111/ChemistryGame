import { safeStorage } from './safeStorage.js';

const STORAGE_KEY = 'mad-flask-lab-sound-muted';

export default class SoundFx {
  constructor(storage = safeStorage()) {
    this.storage = storage;
    this.context = null;
    this.master = null;
    let muted = false;
    try {
      muted = this.storage.getItem(STORAGE_KEY) === '1';
    } catch (_error) {
      muted = false;
    }
    this.muted = muted;
  }

  ensure() {
    if (this.context) return this.context;
    const Ctx = globalThis.AudioContext ?? globalThis.webkitAudioContext;
    if (!Ctx) return null;
    try {
      this.context = new Ctx();
      this.master = this.context.createGain();
      this.master.gain.value = 0.4;
      this.master.connect(this.context.destination);
    } catch (_error) {
      this.context = null;
    }
    return this.context;
  }

  resume() {
    const ctx = this.ensure();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  setMuted(value) {
    this.muted = Boolean(value);
    try {
      this.storage.setItem(STORAGE_KEY, this.muted ? '1' : '0');
    } catch (_error) {
      /* storage unavailable; in-memory state still applies */
    }
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  envelope(node, { attack = 0.005, decay = 0.18, sustain = 0, release = 0.05, peak = 1 } = {}) {
    const ctx = this.context;
    const t = ctx.currentTime;
    node.gain.cancelScheduledValues(t);
    node.gain.setValueAtTime(0.0001, t);
    node.gain.exponentialRampToValueAtTime(peak, t + attack);
    node.gain.exponentialRampToValueAtTime(Math.max(sustain, 0.0001), t + attack + decay);
    node.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay + release);
    return attack + decay + release;
  }

  tone({ freq = 440, type = 'sine', sweepTo = null, duration = 0.18, peak = 0.6, attack = 0.005, decay, release = 0.04 } = {}) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (sweepTo) osc.frequency.exponentialRampToValueAtTime(Math.max(sweepTo, 1), ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.master);
    const total = this.envelope(gain, { attack, decay: decay ?? duration * 0.7, sustain: 0, release, peak });
    osc.start();
    osc.stop(ctx.currentTime + total + 0.05);
  }

  noise({ duration = 0.2, peak = 0.4, type = 'white', filterFreq = 1200, filterQ = 1, attack = 0.005, release = 0.05 } = {}) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i += 1) {
      const white = Math.random() * 2 - 1;
      if (type === 'pink') {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      } else if (type === 'brown') {
        last = (last + 0.1 * white) / 1.1;
        data[i] = last * 3;
      } else {
        data[i] = white;
      }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = filterQ;
    const gain = ctx.createGain();
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    const total = this.envelope(gain, { attack, decay: duration * 0.7, sustain: 0, release, peak });
    source.start();
    source.stop(ctx.currentTime + total + 0.05);
  }

  click() {
    this.tone({ freq: 880, type: 'square', duration: 0.06, peak: 0.18, decay: 0.05, release: 0.02 });
  }

  pour() {
    this.noise({ duration: 0.35, peak: 0.25, type: 'pink', filterFreq: 900 });
    this.tone({ freq: 420, sweepTo: 180, type: 'sine', duration: 0.32, peak: 0.18 });
  }

  bubble() {
    const base = 320 + Math.random() * 380;
    this.tone({ freq: base, sweepTo: base * 2.2, type: 'sine', duration: 0.12, peak: 0.22 });
  }

  fizz() {
    this.noise({ duration: 0.55, peak: 0.35, type: 'white', filterFreq: 4200, filterQ: 0.8 });
  }

  pop() {
    this.tone({ freq: 1200, sweepTo: 220, type: 'square', duration: 0.12, peak: 0.4, decay: 0.08, release: 0.04 });
    this.noise({ duration: 0.08, peak: 0.3, type: 'white', filterFreq: 2400 });
  }

  boom() {
    this.tone({ freq: 90, sweepTo: 35, type: 'sawtooth', duration: 0.55, peak: 0.55, decay: 0.4, release: 0.2 });
    this.noise({ duration: 0.45, peak: 0.5, type: 'brown', filterFreq: 800 });
  }

  whoosh() {
    this.noise({ duration: 0.4, peak: 0.35, type: 'pink', filterFreq: 1800 });
  }

  sparkle() {
    [880, 1320, 1760].forEach((freq, index) => {
      setTimeout(() => this.tone({ freq, type: 'triangle', duration: 0.12, peak: 0.22 }), index * 60);
    });
  }

  jingle() {
    [523, 659, 784, 1046].forEach((freq, index) => {
      setTimeout(() => this.tone({ freq, type: 'triangle', duration: 0.18, peak: 0.3 }), index * 90);
    });
  }

  wahWah() {
    [440, 392, 349, 294].forEach((freq, index) => {
      setTimeout(() => this.tone({ freq, type: 'sawtooth', duration: 0.22, peak: 0.28 }), index * 110);
    });
  }

  zap() {
    this.tone({ freq: 1800, sweepTo: 220, type: 'square', duration: 0.22, peak: 0.35 });
  }

  rocket() {
    this.tone({ freq: 220, sweepTo: 1400, type: 'sawtooth', duration: 0.45, peak: 0.32 });
    this.noise({ duration: 0.5, peak: 0.3, type: 'pink', filterFreq: 2200 });
  }
}
