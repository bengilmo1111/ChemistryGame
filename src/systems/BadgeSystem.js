import { badges } from '../data/badges.js';
import { safeStorage } from './safeStorage.js';

const STORAGE_KEY = 'mad-flask-lab-badges';

function readEarned(storage) {
  let rawValue = null;
  try {
    rawValue = storage.getItem(STORAGE_KEY);
  } catch (_error) {
    rawValue = null;
  }
  try {
    const parsed = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

export default class BadgeSystem {
  constructor(storage = safeStorage()) {
    this.storage = storage;
    this.earned = new Set(readEarned(this.storage));
  }

  award(badgeId) {
    if (badgeId) {
      this.earned.add(badgeId);
      try {
        this.storage.setItem(STORAGE_KEY, JSON.stringify([...this.earned]));
      } catch (_error) {
        /* storage unavailable; badges remain in memory this session */
      }
    }
    return this.getEarned();
  }

  getEarned() {
    return badges.filter((badge) => this.earned.has(badge.id));
  }
}
