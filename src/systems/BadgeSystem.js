import { badges } from '../data/badges.js';

const STORAGE_KEY = 'mad-flask-lab-badges';

export default class BadgeSystem {
  constructor(storage = window.localStorage) {
    this.storage = storage;
    this.earned = new Set(JSON.parse(this.storage.getItem(STORAGE_KEY) ?? '[]'));
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
