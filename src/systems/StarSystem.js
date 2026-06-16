import { safeStorage } from './safeStorage.js';

const STORAGE_KEY = 'mad-flask-lab-stars';
export const MAX_STARS = 3;

function parseStars(rawValue) {
  if (!rawValue) return {};
  try {
    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (_error) {
    return {};
  }
}

function readRaw(storage) {
  try {
    return storage.getItem(STORAGE_KEY);
  } catch (_error) {
    return null;
  }
}

function progressKey(experimentId, modeId = 'henry') {
  return modeId ? `${modeId}:${experimentId}` : experimentId;
}

function isNamespacedKey(key) {
  return typeof key === 'string' && key.includes(':');
}

function normalizeStars(value) {
  const stars = Number(value);
  return Number.isFinite(stars) ? Math.max(0, Math.min(MAX_STARS, stars)) : 0;
}

function migrateLegacyStars(stars) {
  let migrated = false;
  const next = { ...stars };

  Object.entries(stars).forEach(([key, value]) => {
    if (isNamespacedKey(key)) return;
    const henryKey = progressKey(key, 'henry');
    next[henryKey] = Math.max(normalizeStars(next[henryKey]), normalizeStars(value));
    delete next[key];
    migrated = true;
  });

  return { stars: next, migrated };
}

export function computeStars({ kind = 'failure', predictionMatched = false, discoveryCount = 0 } = {}) {
  if (kind !== 'success') return 0;
  let stars = 1;
  if (predictionMatched) stars += 1;
  if (discoveryCount >= 3) stars += 1;
  return stars;
}

export default class StarSystem {
  constructor(storage = safeStorage()) {
    this.storage = storage;
    const { stars, migrated } = migrateLegacyStars(parseStars(readRaw(this.storage)));
    this.stars = stars;
    if (migrated) this.persist();
  }

  persist() {
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this.stars));
    } catch (_error) {
      /* storage unavailable; stars remain in memory this session */
    }
  }

  record(experimentId, stars, modeId = 'henry') {
    if (!experimentId) return 0;
    const key = progressKey(experimentId, modeId);
    const clamped = Math.max(0, Math.min(MAX_STARS, Math.floor(stars) || 0));
    if (clamped > this.getStars(experimentId, modeId)) {
      this.stars = { ...this.stars, [key]: clamped };
      this.persist();
    }
    return this.getStars(experimentId, modeId);
  }

  getStars(experimentId, modeId = 'henry') {
    return normalizeStars(this.stars[progressKey(experimentId, modeId)]);
  }

  display(experimentId, modeId = 'henry') {
    const earned = this.getStars(experimentId, modeId);
    return '★'.repeat(earned) + '☆'.repeat(MAX_STARS - earned);
  }
}
