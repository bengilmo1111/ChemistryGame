import assert from 'node:assert/strict';
import { experiments } from '../src/data/experiments.js';
import { reactionOutcomes } from '../src/data/reactions.js';
import LabInventory from '../src/systems/LabInventory.js';
import PredictionSystem from '../src/systems/PredictionSystem.js';
import ReactionEngine from '../src/systems/ReactionEngine.js';

const engine = new ReactionEngine();

for (const outcome of reactionOutcomes) {
  const experiment = experiments.find((item) => item.id === outcome.experimentId);
  const result = engine.resolve(experiment, outcome.ingredients);
  assert.equal(result.id, outcome.id);
  assert.equal(result.kind, 'success');
  assert.deepEqual(result.vocabulary, experiment.vocabulary);
  assert.match(result.safetyNote, /fictional ingredients/i);
}

const failure = engine.resolve(experiments[0], ['goo-gel'], { sealed: true });
assert.equal(failure.kind, 'failure');
assert.equal(failure.badge, 'chaos-noticer');
assert.match(failure.safetyNote, /cartoon failure/i);

const inventory = new LabInventory();
assert.equal(inventory.add('fizz-powder'), true);
assert.equal(inventory.add('fizz-powder'), false);
assert.deepEqual(inventory.selected, ['fizz-powder']);

const predictionSystem = new PredictionSystem();
assert.equal(predictionSystem.choose('foam').label, 'Foam climbs up');
assert.equal(predictionSystem.matchesOutcome({ effect: 'foam' }), true);
assert.equal(predictionSystem.matchesOutcome({ effect: 'crystal' }), false);

console.log('Reaction and lab systems tests passed.');
