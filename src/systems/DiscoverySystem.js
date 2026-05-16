const STORAGE_KEY = 'mad-flask-lab-discoveries';

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
}

function parseDiscoveries(rawValue) {
  if (!rawValue) return {};

  try {
    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (_error) {
    return {};
  }
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

export default class DiscoverySystem {
  constructor(storage = globalThis.localStorage ?? createMemoryStorage()) {
    this.storage = storage;
    this.discoveries = parseDiscoveries(this.storage.getItem(STORAGE_KEY));
  }

  record(experimentId, outcomeId) {
    if (!experimentId || !outcomeId) return this.getForExperiment(experimentId);

    const current = unique(this.discoveries[experimentId]);
    if (!current.includes(outcomeId)) {
      current.push(outcomeId);
      this.discoveries = { ...this.discoveries, [experimentId]: current };
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this.discoveries));
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
