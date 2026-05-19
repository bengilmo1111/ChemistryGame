import { safeStorage } from './safeStorage.js';

const STORAGE_KEY = 'mad-flask-lab-score';

function readState(storage) {
  let raw = null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch (_error) {
    raw = null;
  }
  if (!raw) return { score: 0, best: 0, streak: 0, longestStreak: 0 };
  try {
    const parsed = JSON.parse(raw);
    return {
      score: Number(parsed.score) || 0,
      best: Number(parsed.best) || 0,
      streak: Number(parsed.streak) || 0,
      longestStreak: Number(parsed.longestStreak) || 0,
    };
  } catch (_error) {
    return { score: 0, best: 0, streak: 0, longestStreak: 0 };
  }
}

export default class ScoreSystem {
  constructor(storage = safeStorage()) {
    this.storage = storage;
    this.state = readState(storage);
  }

  award({ kind = 'failure', predictionMatched = false, isNewDiscovery = false, ingredientCount = 0 } = {}) {
    let gained = 0;
    if (kind === 'success') {
      gained += 100;
      this.state.streak += 1;
      if (predictionMatched) gained += 50;
      if (isNewDiscovery) gained += 75;
      gained += Math.max(0, ingredientCount - 1) * 10;
      gained += Math.min(this.state.streak - 1, 9) * 25;
    } else {
      gained += 25;
      this.state.streak = 0;
    }
    this.state.score += gained;
    if (this.state.streak > this.state.longestStreak) this.state.longestStreak = this.state.streak;
    if (this.state.score > this.state.best) this.state.best = this.state.score;
    this.persist();
    return { gained, total: this.state.score, streak: this.state.streak };
  }

  reset() {
    this.state.score = 0;
    this.state.streak = 0;
    this.persist();
  }

  persist() {
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (_error) {
      /* storage unavailable; keep state in memory only */
    }
  }

  get score() { return this.state.score; }
  get best() { return this.state.best; }
  get streak() { return this.state.streak; }
  get longestStreak() { return this.state.longestStreak; }
}
