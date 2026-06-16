export default class LabNotebook {
  constructor(scene, x, y, { modeId = 'henry' } = {}) {
    this.scene = scene;
    this.modeId = modeId;
    this.page = scene.add.rectangle(x, y, 280, 200, 0xfff7d6).setStrokeStyle(4, 0x8a5a24).setDepth(5);
    this.title = scene.add.text(x - 120, y - 88, 'Lab Notebook', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '18px',
      color: '#4b2f10',
    }).setDepth(6);
    this.lines = scene.add.text(x - 120, y - 60, '', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '13px',
      color: '#4b2f10',
      lineSpacing: 4,
      wordWrap: { width: 240 },
    }).setDepth(6);
  }

  update({ prediction, ingredients, actions, observations = [], conclusion, stepStatus = [] }) {
    if (this.modeId === 'pauling') {
      this.updatePauling({ prediction, ingredients, actions, observations, conclusion });
      return;
    }

    this.lines.setText([
      `Prediction: ${prediction?.label ?? 'choose one'}`,
      '',
      `Ingredients: ${ingredients.length ? ingredients.join(', ') : 'none yet'}`,
      '',
      `Tools: ${actions.length ? actions.join(', ') : 'try a tool'}`,
      '',
      `Steps: ${stepStatus.length ? stepStatus.join('  ') : 'predict first'}`,
    ].join('\n'));
  }

  updatePauling({ prediction, ingredients, actions, observations, conclusion }) {
    const observationText = observations.length ? observations[0] : 'record evidence after trial';
    this.lines.setText([
      `Hypothesis: ${prediction?.label ?? 'choose one'}`,
      `Materials: ${ingredients.length ? ingredients.join(', ') : 'select reagents'}`,
      `Procedure/tool step: ${actions.length ? actions.join(', ') : 'choose a tool'}`,
      `Observations: ${observationText}`,
      `Conclusion: ${conclusion ?? 'compare evidence to hypothesis'}`,
    ].join('\n\n'));
  }
}
