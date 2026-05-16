export default class LabNotebook {
  constructor(scene, x, y) {
    this.scene = scene;
    this.page = scene.add.rectangle(x, y, 280, 330, 0xfff7d6).setStrokeStyle(4, 0x8a5a24).setDepth(5);
    this.title = scene.add.text(x - 120, y - 145, 'Lab Notebook', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '24px',
      color: '#4b2f10',
    }).setDepth(6);
    this.lines = scene.add.text(x - 120, y - 105, '', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '16px',
      color: '#4b2f10',
      lineSpacing: 7,
      wordWrap: { width: 235 },
    }).setDepth(6);
  }

  update({ prediction, ingredients, actions, toolHint, observations = [], stepStatus = [] }) {
    this.lines.setText([
      `Prediction: ${prediction?.label ?? 'choose one'}`,
      '',
      `Ingredients: ${ingredients.length ? ingredients.join(', ') : 'none yet'}`,
      '',
      `Tools: ${actions.length ? actions.join(', ') : 'try a tool'}`,
      '',
      `Step check: ${stepStatus.length ? stepStatus.join('  ') : 'start with a prediction'}`,
      '',
      `Clue: ${toolHint}`,
      '',
      `Watch for: ${observations.length ? observations.join(' / ') : 'changes'}`,
    ]);
  }
}
