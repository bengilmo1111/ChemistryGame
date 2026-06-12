import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { artAssets, reagentArt } from '../src/data/artAssets.js';
import { badges } from '../src/data/badges.js';
import { experiments } from '../src/data/experiments.js';
import { funnyFailures, reactionOutcomes, secretReactions } from '../src/data/reactions.js';
import { reagents } from '../src/data/reagents.js';
import { vocabularyDefinitions } from '../src/data/vocabulary.js';

const validActions = new Set(['stirred', 'heated', 'cooled', 'sealed', 'shaken']);
const reagentIds = new Set(reagents.map((reagent) => reagent.id));
const reagentArtKeys = new Set(reagentArt.map((asset) => asset.key));
const badgeIds = new Set(badges.map((badge) => badge.id));
const vocabularyWords = new Set(Object.keys(vocabularyDefinitions));

for (const experiment of experiments) {
  assert.ok(experiment.required.length > 0, `${experiment.id} should require at least one reagent`);
  assert.ok(experiment.requiredActions.length > 0, `${experiment.id} should require at least one lab tool`);
  assert.ok(experiment.actionHint, `${experiment.id} should provide a tool hint`);
  for (const word of experiment.vocabulary) {
    assert.ok(vocabularyWords.has(word), `${experiment.id} is missing a child-friendly definition for ${word}`);
    assert.ok(vocabularyDefinitions[word].length <= 90, `${word} definition should stay short for children`);
  }
  for (const reagentId of experiment.required) {
    assert.ok(reagentIds.has(reagentId), `${experiment.id} references missing reagent ${reagentId}`);
  }
  for (const action of experiment.requiredActions) {
    assert.ok(validActions.has(action), `${experiment.id} references unknown action ${action}`);
  }
}

for (const outcome of reactionOutcomes) {
  assert.ok(experiments.some((experiment) => experiment.id === outcome.experimentId), `${outcome.id} references a missing experiment`);
  assert.ok(badgeIds.has(outcome.badge), `${outcome.id} references missing badge ${outcome.badge}`);
  assert.ok(outcome.requiredActions.length > 0, `${outcome.id} should require at least one tool action`);
  for (const reagentId of outcome.ingredients) {
    assert.ok(reagentIds.has(reagentId), `${outcome.id} references missing reagent ${reagentId}`);
  }
  for (const action of outcome.requiredActions) {
    assert.ok(validActions.has(action), `${outcome.id} references unknown action ${action}`);
  }
}

function recipeKey(outcome) {
  return `${[...outcome.ingredients].sort().join('+')}|${[...outcome.requiredActions].sort().join('+')}`;
}

const recipeKeys = new Set();
for (const outcome of [...reactionOutcomes, ...secretReactions]) {
  const key = recipeKey(outcome);
  assert.ok(!recipeKeys.has(key), `${outcome.id} duplicates another recipe (${key})`);
  recipeKeys.add(key);
}

for (const secret of secretReactions) {
  assert.ok(secret.secret === true, `${secret.id} should be flagged as secret`);
  assert.ok(secret.hint, `${secret.id} should give children a cryptic hint`);
  assert.ok(secret.explanation, `${secret.id} should explain its science idea`);
  assert.ok(badgeIds.has(secret.badge), `${secret.id} references missing badge ${secret.badge}`);
  assert.ok(secret.requiredActions.length > 0, `${secret.id} should require at least one tool action`);
  assert.ok(secret.ingredients.length >= 2, `${secret.id} should mix at least two reagents`);
  for (const reagentId of secret.ingredients) {
    assert.ok(reagentIds.has(reagentId), `${secret.id} references missing reagent ${reagentId}`);
  }
  for (const action of secret.requiredActions) {
    assert.ok(validActions.has(action), `${secret.id} references unknown action ${action}`);
  }
  for (const word of secret.vocabulary) {
    assert.ok(vocabularyWords.has(word), `${secret.id} references undefined word ${word}`);
  }
}

for (const failure of funnyFailures) {
  assert.ok(Array.isArray(failure.vocabulary), `${failure.id} should declare vocabulary`);
  for (const word of failure.vocabulary) {
    assert.ok(vocabularyWords.has(word), `${failure.id} references undefined word ${word}`);
  }
}

for (const reagent of reagents) {
  assert.ok(reagent.artKey, `${reagent.id} is missing an art key`);
  assert.ok(reagentArtKeys.has(reagent.artKey), `${reagent.id} art key ${reagent.artKey} is not registered`);
}

for (const asset of artAssets) {
  const assetPath = fileURLToPath(new URL(`../src/assets/images/${asset.fileName}`, import.meta.url));
  assert.ok(existsSync(assetPath), `${asset.fileName} should exist`);
  assert.match(readFileSync(assetPath, 'utf8'), /<svg[\s>]/, `${asset.fileName} should be an SVG asset`);
}

console.log('Content integrity tests passed.');
