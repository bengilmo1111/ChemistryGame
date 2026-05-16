import assert from 'node:assert/strict';
import { experiments } from '../src/data/experiments.js';
import { reactionOutcomes } from '../src/data/reactions.js';
import DiscoverySystem from '../src/systems/DiscoverySystem.js';
import LabInventory from '../src/systems/LabInventory.js';
import PredictionSystem from '../src/systems/PredictionSystem.js';
import ReactionEngine from '../src/systems/ReactionEngine.js';
import VariableCoach from '../src/systems/VariableCoach.js';
import { defineVocabulary, formatVocabularyDefinitions } from '../src/data/vocabulary.js';

const engine = new ReactionEngine();

assert.deepEqual(defineVocabulary(['gas'])[0], {
  word: 'gas',
  definition: 'a material that spreads out and takes up space',
});
assert.match(formatVocabularyDefinitions(['pressure']), /pressure: a push made/i);

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
assert.equal(predictionSystem.choose('pressure').label, 'Pressure pops');
assert.equal(predictionSystem.matchesOutcome({ effect: 'pop' }), true);

const pressureExperiment = experiments.find((item) => item.id === 'pressure-pop');
const pressureSuccess = engine.resolve(pressureExperiment, pressureExperiment.required, { sealed: true });
assert.equal(pressureSuccess.effect, 'pop');
assert.equal(pressureSuccess.badge, 'pressure-pal');

const variableCoach = new VariableCoach();
assert.match(
  variableCoach.nextStep(missingToolExperiment, missingToolFailure, missingToolExperiment.required, {}),
  /try stirring as your one changed variable/i,
);
assert.match(
  variableCoach.nextStep(pressureExperiment, pressureSuccess, pressureExperiment.required, { sealed: true }),
  /change one ingredient or one tool/i,
);
const wrongIngredientFailure = engine.resolve(missingToolExperiment, ['glimmer-salt', 'goo-gel'], { cooled: true });
assert.equal(wrongIngredientFailure.kind, 'failure');
assert.match(
  variableCoach.nextStep(missingToolExperiment, wrongIngredientFailure, ['glimmer-salt', 'goo-gel'], { cooled: true }),
  /match the lab card ingredients first/i,
);
assert.ok(wrongIngredientFailure.vocabulary.includes('gas'), 'failure should still include experiment vocabulary');

const storedValues = new Map();
const storage = {
  getItem: (key) => storedValues.get(key) ?? null,
  setItem: (key, value) => storedValues.set(key, value),
};
const discoveries = new DiscoverySystem(storage);
assert.deepEqual(discoveries.record('foamy-fountain', 'foam-eruption'), ['foam-eruption']);
assert.deepEqual(discoveries.record('foamy-fountain', 'foam-eruption'), ['foam-eruption']);
assert.equal(discoveries.countForExperiment('foamy-fountain'), 1);
assert.deepEqual(new DiscoverySystem(storage).getForExperiment('foamy-fountain'), ['foam-eruption']);

console.log('Reaction and lab systems tests passed.');
