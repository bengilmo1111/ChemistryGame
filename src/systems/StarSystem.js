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
    this.stars = parseStars(readRaw(this.storage));
  }

  record(experimentId, stars) {
    if (!experimentId) return 0;
    const clamped = Math.max(0, Math.min(MAX_STARS, Math.floor(stars) || 0));
    if (clamped > this.getStars(experimentId)) {
      this.stars = { ...this.stars, [experimentId]: clamped };
      try {
        this.storage.setItem(STORAGE_KEY, JSON.stringify(this.stars));
      } catch (_error) {
        /* storage unavailable; stars remain in memory this session */
      }
    }
    return this.getStars(experimentId);
  }

  getStars(experimentId) {
    const value = Number(this.stars[experimentId]);
    return Number.isFinite(value) ? Math.max(0, Math.min(MAX_STARS, value)) : 0;
  }

  display(experimentId) {
    const earned = this.getStars(experimentId);
    return '★'.repeat(earned) + '☆'.repeat(MAX_STARS - earned);
  }
}
