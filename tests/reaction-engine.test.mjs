import assert from 'node:assert/strict';
import { experiments } from '../src/data/experiments.js';
import { hero, randomQuip } from '../src/data/hero.js';
import { reactionOutcomes, secretReactions } from '../src/data/reactions.js';
import DiscoverySystem from '../src/systems/DiscoverySystem.js';
import LabInventory from '../src/systems/LabInventory.js';
import PredictionSystem from '../src/systems/PredictionSystem.js';
import { buildQuiz } from '../src/systems/QuizSystem.js';
import ReactionEngine from '../src/systems/ReactionEngine.js';
import ScoreSystem from '../src/systems/ScoreSystem.js';
import StarSystem, { computeStars } from '../src/systems/StarSystem.js';
import VariableCoach from '../src/systems/VariableCoach.js';
import { defineVocabulary, formatVocabularyDefinitions, vocabularyDefinitions } from '../src/data/vocabulary.js';

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

for (const secret of secretReactions) {
  const actions = Object.fromEntries(secret.requiredActions.map((action) => [action, true]));
  const result = engine.resolveSandbox(secret.ingredients, actions);
  assert.equal(result.id, secret.id, `sandbox should resolve secret ${secret.id}`);
  assert.equal(result.kind, 'success');
  assert.equal(result.secret, true);
  assert.match(result.safetyNote, /secret pretend recipe/i);
}

const sandboxKnown = engine.resolveSandbox(['fizz-powder', 'sour-drops'], { stirred: true });
assert.equal(sandboxKnown.id, 'foam-eruption', 'sandbox should still resolve regular recipes');

const sandboxMess = engine.resolveSandbox(['fizz-powder'], {});
assert.equal(sandboxMess.kind, 'failure');

assert.equal(computeStars({ kind: 'failure' }), 0);
assert.equal(computeStars({ kind: 'success' }), 1);
assert.equal(computeStars({ kind: 'success', predictionMatched: true }), 2);
assert.equal(computeStars({ kind: 'success', predictionMatched: true, discoveryCount: 3 }), 3);

assert.ok(hero.successQuips.includes(randomQuip('success')));
assert.ok(hero.failureQuips.includes(randomQuip('failure')));

const quiz = buildQuiz(['pressure', 'gas']);
assert.ok(['pressure', 'gas'].includes(quiz.answer));
assert.equal(quiz.options.length, 3);
assert.ok(quiz.options.includes(quiz.answer));
assert.equal(new Set(quiz.options).size, 3);
assert.ok(quiz.question.includes(vocabularyDefinitions[quiz.answer]));
assert.equal(buildQuiz(['made-up-word']), null);

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

const starStorage = {
  getItem: (key) => storedValues.get(key) ?? null,
  setItem: (key, value) => storedValues.set(key, value),
};
const starSystem = new StarSystem(starStorage);
assert.equal(starSystem.getStars('foamy-fountain'), 0);
assert.equal(starSystem.record('foamy-fountain', 2), 2);
assert.equal(starSystem.record('foamy-fountain', 1), 2, 'stars should never go down');
assert.equal(new StarSystem(starStorage).getStars('foamy-fountain'), 2);
assert.equal(starSystem.display('foamy-fountain'), '★★☆');

const scoreSystem = new ScoreSystem(starStorage);
const beforeBonus = scoreSystem.score;
assert.deepEqual(scoreSystem.addBonus(25), { gained: 25, total: beforeBonus + 25 });
assert.equal(new ScoreSystem(starStorage).score, beforeBonus + 25);

console.log('Reaction and lab systems tests passed.');
