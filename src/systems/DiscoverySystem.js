import { safeStorage } from './safeStorage.js';

const STORAGE_KEY = 'mad-flask-lab-discoveries';

function parseDiscoveries(rawValue) {
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

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

export default class DiscoverySystem {
  constructor(storage = safeStorage()) {
    this.storage = storage;
    this.discoveries = parseDiscoveries(readRaw(this.storage));
  }

  record(experimentId, outcomeId) {
    if (!experimentId || !outcomeId) return this.getForExperiment(experimentId);

    const current = unique(this.discoveries[experimentId]);
    if (!current.includes(outcomeId)) {
      current.push(outcomeId);
      this.discoveries = { ...this.discoveries, [experimentId]: current };
      try {
        this.storage.setItem(STORAGE_KEY, JSON.stringify(this.discoveries));
      } catch (_error) {
        /* storage unavailable; discoveries remain in memory this session */
      }
    }

    return current;
  }

  getForExperiment(experimentId) {
    return unique(this.discoveries[experimentId]);
  }

  countForExperiment(experimentId) {
    return this.getForExperiment(experimentId).length;
  }
}
