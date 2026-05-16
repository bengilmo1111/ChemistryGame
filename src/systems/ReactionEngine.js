import { funnyFailures, reactionOutcomes } from '../data/reactions.js';

function sameSet(left, right) {
  return left.length === right.length && left.every((item) => right.includes(item));
}

export default class ReactionEngine {
  resolve(experiment, ingredientIds, labActions = {}) {
    const uniqueIngredients = [...new Set(ingredientIds)];
    const success = reactionOutcomes.find(
      (outcome) => outcome.experimentId === experiment.id && sameSet(outcome.ingredients, uniqueIngredients),
    );

    if (success) {
      return {
        ...success,
        vocabulary: experiment.vocabulary,
        safetyNote: 'Mad Flask Lab uses fictional ingredients only. Real labs need a grown-up, goggles, and safe instructions.',
      };
    }

    const actionBonus = labActions.sealed ? 0 : labActions.heated ? 1 : labActions.shaken ? 2 : 3;
    const failureIndex = (uniqueIngredients.join('').length + experiment.id.length + actionBonus) % funnyFailures.length;
    const failure = funnyFailures[failureIndex];

    return {
      ...failure,
      kind: 'failure',
      badge: 'chaos-noticer',
      vocabulary: experiment.vocabulary,
      safetyNote: 'This was a cartoon failure, not a real recipe. Safe scientists test ideas carefully.',
    };
  }
}
