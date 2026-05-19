function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
  };
}

export function safeStorage() {
  try {
    const candidate = globalThis.localStorage;
    if (!candidate) return createMemoryStorage();
    const probeKey = '__mfl_probe__';
    candidate.setItem(probeKey, '1');
    candidate.getItem(probeKey);
    candidate.removeItem?.(probeKey);
    return candidate;
  } catch (_error) {
    return createMemoryStorage();
  }
}

export { createMemoryStorage };
