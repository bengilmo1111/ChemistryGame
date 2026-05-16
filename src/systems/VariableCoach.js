const ACTION_LABELS = {
  stirred: 'stirring',
  heated: 'warming',
  cooled: 'cooling',
  sealed: 'sealing',
  shaken: 'shaking',
};

function difference(left = [], right = []) {
  return left.filter((item) => !right.includes(item));
}

export default class VariableCoach {
  nextStep(experiment, outcome, selectedIngredientIds = [], labActions = {}) {
    const selected = [...new Set(selectedIngredientIds)];
    const missingIngredients = difference(experiment.required, selected);
    const extraIngredients = difference(selected, experiment.required);
    const missingActions = outcome.missingActions?.length
      ? outcome.missingActions
      : (experiment.requiredActions ?? []).filter((action) => !labActions[action]);

    if (outcome.kind === 'success') {
      return 'Replay and change one ingredient or one tool to compare what stays the same and what changes.';
    }

    if (missingActions.length) {
      return `Keep the ingredients the same, then try ${missingActions.map((action) => ACTION_LABELS[action] ?? action).join(' and ')} as your one changed variable.`;
    }

    if (missingIngredients.length || extraIngredients.length) {
      return 'Change just one ingredient toward the lab card goal, then observe whether the result moves closer to your prediction.';
    }

    return 'Pick one small change, make a new prediction, and compare the new result with this observation.';
  }
}
