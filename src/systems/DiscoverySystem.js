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

function progressKey(experimentId, modeId = 'henry') {
  return modeId ? `${modeId}:${experimentId}` : experimentId;
}

function isNamespacedKey(key) {
  return typeof key === 'string' && key.includes(':');
}

function migrateLegacyDiscoveries(discoveries) {
  let migrated = false;
  const next = { ...discoveries };

  Object.entries(discoveries).forEach(([key, value]) => {
    if (isNamespacedKey(key)) return;
    const henryKey = progressKey(key, 'henry');
    next[henryKey] = unique([...(Array.isArray(next[henryKey]) ? next[henryKey] : []), ...(Array.isArray(value) ? value : [])]);
    delete next[key];
    migrated = true;
  });

  return { discoveries: next, migrated };
}

export default class DiscoverySystem {
  constructor(storage = safeStorage()) {
    this.storage = storage;
    const { discoveries, migrated } = migrateLegacyDiscoveries(parseDiscoveries(readRaw(this.storage)));
    this.discoveries = discoveries;
    if (migrated) this.persist();
  }

  persist() {
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this.discoveries));
    } catch (_error) {
      /* storage unavailable; discoveries remain in memory this session */
    }
  }

  record(experimentId, outcomeId, modeId = 'henry') {
    if (!experimentId || !outcomeId) return this.getForExperiment(experimentId, modeId);

    const key = progressKey(experimentId, modeId);
    const current = unique(this.discoveries[key]);
    if (!current.includes(outcomeId)) {
      current.push(outcomeId);
      this.discoveries = { ...this.discoveries, [key]: current };
      this.persist();
    }

    return current;
  }

  getForExperiment(experimentId, modeId = 'henry') {
    return unique(this.discoveries[progressKey(experimentId, modeId)]);
  }

  countForExperiment(experimentId, modeId = 'henry') {
    return this.getForExperiment(experimentId, modeId).length;
  }
}
