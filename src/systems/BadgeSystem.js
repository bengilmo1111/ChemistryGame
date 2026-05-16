import { badges } from '../data/badges.js';

const STORAGE_KEY = 'mad-flask-lab-badges';

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
}

function readEarned(storage) {
  const rawValue = storage.getItem(STORAGE_KEY);
  const parsed = rawValue ? JSON.parse(rawValue) : [];
  return Array.isArray(parsed) ? parsed : [];
}

export default class BadgeSystem {
  constructor(storage = globalThis.localStorage ?? createMemoryStorage()) {
    this.storage = storage;
    this.earned = new Set(readEarned(this.storage));
  }

  award(badgeId) {
    if (badgeId) {
      this.earned.add(badgeId);
      this.storage.setItem(STORAGE_KEY, JSON.stringify([...this.earned]));
    }
    return this.getEarned();
  }

  getEarned() {
    return badges.filter((badge) => this.earned.has(badge.id));
  }
}
