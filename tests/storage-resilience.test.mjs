import assert from 'node:assert/strict';
import BadgeSystem from '../src/systems/BadgeSystem.js';
import DiscoverySystem from '../src/systems/DiscoverySystem.js';
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

console.log('Storage resilience tests passed.');
