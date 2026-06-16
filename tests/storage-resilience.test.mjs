import assert from 'node:assert/strict';
import BadgeSystem from '../src/systems/BadgeSystem.js';
import DiscoverySystem from '../src/systems/DiscoverySystem.js';
import StarSystem from '../src/systems/StarSystem.js';
import ScoreSystem from '../src/systems/ScoreSystem.js';
import SoundFx from '../src/systems/SoundFx.js';

// Simulate iOS Safari private-browsing: localStorage exists but
// every getItem/setItem throws SecurityError. The boot flow must
// not crash when constructing these systems.
const throwingStorage = {
  getItem() { throw new Error('SecurityError: storage is not allowed'); },
  setItem() { throw new Error('SecurityError: storage is not allowed'); },
  removeItem() { throw new Error('SecurityError: storage is not allowed'); },
};

const score = new ScoreSystem(throwingStorage);
assert.equal(score.score, 0);
const result = score.award({ kind: 'success', predictionMatched: true, ingredientCount: 2 });
assert.ok(result.total >= 100, 'score should still award in-memory');

const fx = new SoundFx(throwingStorage);
assert.equal(fx.muted, false);
fx.setMuted(true);
assert.equal(fx.muted, true);

const badges = new BadgeSystem(throwingStorage);
badges.award('bubble-boss');
assert.equal(badges.getEarned().length, 1);

const discoveries = new DiscoverySystem(throwingStorage);
discoveries.record('foamy-fountain', 'foam-eruption');
assert.equal(discoveries.countForExperiment('foamy-fountain'), 1);

const storedValues = new Map([
  ['mad-flask-lab-discoveries', JSON.stringify({ 'foamy-fountain': ['foam-eruption'] })],
  ['mad-flask-lab-stars', JSON.stringify({ 'foamy-fountain': 2 })],
]);
const migratingStorage = {
  getItem(key) { return storedValues.get(key) ?? null; },
  setItem(key, value) { storedValues.set(key, value); },
  removeItem(key) { storedValues.delete(key); },
};

const migratedDiscoveries = new DiscoverySystem(migratingStorage);
assert.deepEqual(migratedDiscoveries.getForExperiment('foamy-fountain', 'henry'), ['foam-eruption']);
assert.equal(migratedDiscoveries.countForExperiment('foamy-fountain', 'pauling'), 0);
assert.equal(JSON.parse(storedValues.get('mad-flask-lab-discoveries'))['foamy-fountain'], undefined);
assert.deepEqual(JSON.parse(storedValues.get('mad-flask-lab-discoveries'))['henry:foamy-fountain'], ['foam-eruption']);

const migratedStars = new StarSystem(migratingStorage);
assert.equal(migratedStars.getStars('foamy-fountain', 'henry'), 2);
assert.equal(migratedStars.getStars('foamy-fountain', 'pauling'), 0);
assert.equal(JSON.parse(storedValues.get('mad-flask-lab-stars'))['foamy-fountain'], undefined);
assert.equal(JSON.parse(storedValues.get('mad-flask-lab-stars'))['henry:foamy-fountain'], 2);

console.log('Storage resilience tests passed.');
