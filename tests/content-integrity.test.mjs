import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { artAssets, reagentArt } from '../src/data/artAssets.js';
import { experiments } from '../src/data/experiments.js';
import { reactionOutcomes } from '../src/data/reactions.js';
import { reagents } from '../src/data/reagents.js';

const reagentIds = new Set(reagents.map((reagent) => reagent.id));
const reagentArtKeys = new Set(reagentArt.map((asset) => asset.key));

for (const experiment of experiments) {
  assert.ok(experiment.required.length > 0, `${experiment.id} should require at least one reagent`);
  for (const reagentId of experiment.required) {
    assert.ok(reagentIds.has(reagentId), `${experiment.id} references missing reagent ${reagentId}`);
  }
}

for (const outcome of reactionOutcomes) {
  assert.ok(experiments.some((experiment) => experiment.id === outcome.experimentId), `${outcome.id} references a missing experiment`);
  for (const reagentId of outcome.ingredients) {
    assert.ok(reagentIds.has(reagentId), `${outcome.id} references missing reagent ${reagentId}`);
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
