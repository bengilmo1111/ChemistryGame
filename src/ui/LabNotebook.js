export default class LabNotebook {
  constructor(scene, x, y) {
    this.scene = scene;
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

  update({ prediction, ingredients, actions, stepStatus = [] }) {
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
}
