import { funnyFailures, reactionOutcomes, secretReactions } from '../data/reactions.js';

function sameSet(left, right) {
  return left.length === right.length && left.every((item) => right.includes(item));
}

function hasRequiredActions(requiredActions = [], labActions = {}) {
  return requiredActions.every((action) => labActions[action]);
}

export default class ReactionEngine {
  resolve(experiment, ingredientIds, labActions = {}) {
    const uniqueIngredients = [...new Set(ingredientIds)];
    const success = reactionOutcomes.find(
      (outcome) => outcome.experimentId === experiment.id
        && sameSet(outcome.ingredients, uniqueIngredients)
        && hasRequiredActions(outcome.requiredActions, labActions),
    );

    if (success) {
      return {
        ...success,
        vocabulary: experiment.vocabulary,
        safetyNote: 'Mad Flask Lab uses fictional ingredients only. Real labs need a grown-up, goggles, and safe instructions.',
      };
    }

    const missingActions = (experiment.requiredActions ?? []).filter((action) => !labActions[action]);
    const actionBonus = labActions.sealed ? 0 : labActions.heated ? 1 : labActions.shaken ? 2 : 3;
    const failureIndex = (uniqueIngredients.join('').length + experiment.id.length + actionBonus) % funnyFailures.length;
    const failure = missingActions.length > 0 && sameSet(experiment.required, uniqueIngredients)
      ? funnyFailures.find((item) => item.id === 'soot-face')
      : funnyFailures[failureIndex];

    const explanation = missingActions.length > 0 && sameSet(experiment.required, uniqueIngredients)
      ? `The ingredients were close, but the flask needed a tool step: ${missingActions.join(', ')}. Scientists change one thing at a time and try again.`
      : failure.explanation;

    const vocabulary = [...new Set([...(failure.vocabulary ?? []), ...experiment.vocabulary])];

    return {
      ...failure,
      explanation,
      kind: 'failure',
      badge: 'chaos-noticer',
      missingActions,
      vocabulary,
      safetyNote: 'This was a cartoon failure, not a real recipe. Safe scientists test ideas carefully.',
    };
  }

  resolveSandbox(ingredientIds, labActions = {}) {
    const uniqueIngredients = [...new Set(ingredientIds)];
    const match = [...secretReactions, ...reactionOutcomes].find(
      (outcome) => sameSet(outcome.ingredients, uniqueIngredients)
        && hasRequiredActions(outcome.requiredActions, labActions),
    );

    if (match) {
      return {
        ...match,
        vocabulary: match.vocabulary ?? [],
        safetyNote: match.secret
          ? 'You found a secret pretend recipe! Real labs never mix mystery chemicals.'
          : 'Mad Mix is sandbox play — all reagents are pretend.',
      };
    }

    const seed = uniqueIngredients.join('').length
      + Object.values(labActions).filter(Boolean).length * 3;
    const failure = funnyFailures[seed % funnyFailures.length];
    return {
      ...failure,
      kind: 'failure',
      badge: 'chaos-noticer',
      missingActions: [],
      vocabulary: failure.vocabulary ?? [],
      safetyNote: 'Mad Mix is sandbox play — surprising combos make pretend mess only.',
    };
  }
}
