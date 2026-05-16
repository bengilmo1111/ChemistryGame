import assert from 'node:assert/strict';
import { experiments } from '../src/data/experiments.js';
import { reactionOutcomes } from '../src/data/reactions.js';
import LabInventory from '../src/systems/LabInventory.js';
import PredictionSystem from '../src/systems/PredictionSystem.js';
import ReactionEngine from '../src/systems/ReactionEngine.js';

const engine = new ReactionEngine();

for (const outcome of reactionOutcomes) {
  const experiment = experiments.find((item) => item.id === outcome.experimentId);
  const actions = Object.fromEntries((outcome.requiredActions ?? []).map((action) => [action, true]));
  const result = engine.resolve(experiment, outcome.ingredients, actions);
  assert.equal(result.id, outcome.id);
  assert.equal(result.kind, 'success');
  assert.deepEqual(result.vocabulary, experiment.vocabulary);
  assert.match(result.safetyNote, /fictional ingredients/i);
}

const missingToolExperiment = experiments.find((item) => item.id === 'foamy-fountain');
const missingToolFailure = engine.resolve(missingToolExperiment, missingToolExperiment.required);
assert.equal(missingToolFailure.kind, 'failure');
assert.deepEqual(missingToolFailure.missingActions, ['stirred']);

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
assert.equal(predictionSystem.choose('layers').label, 'Layers stack');
assert.equal(predictionSystem.matchesOutcome({ effect: 'layers' }), true);

console.log('Reaction and lab systems tests passed.');
