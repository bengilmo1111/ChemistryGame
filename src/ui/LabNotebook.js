export default class LabNotebook {
  constructor(scene, x, y, { modeId = 'henry' } = {}) {
    this.scene = scene;
    this.modeId = modeId;
    this.container = scene.add.container(x, y).setDepth(5);

    const shadow = scene.add.rectangle(7, 9, 280, 200, 0x2b2254, 0.28).setAngle(2);
    this.page = scene.add.rectangle(0, 0, 280, 200, 0xfff7d6).setStrokeStyle(5, 0x8a5a24).setAngle(-1.2);
    const spine = scene.add.rectangle(-126, 0, 24, 190, 0xff8bd1, 0.95).setStrokeStyle(3, 0x7e2453).setAngle(-1.2);
    const tabA = scene.add.rectangle(-78, -108, 72, 24, 0x9de8ff, 0.95).setStrokeStyle(3, 0x235b72);
    const tabB = scene.add.rectangle(2, -108, 72, 24, 0xffd166, 0.95).setStrokeStyle(3, 0x8a5a24);
    const sticker = scene.add.text(102, -76, '⭐', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '24px' }).setOrigin(0.5).setAngle(12);
    const doodle = scene.add.text(96, 74, '⚗️  ✎', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '18px', color: '#7e2453' }).setOrigin(0.5).setAngle(-8);

    this.title = scene.add.text(-108, -88, 'Lab Journal', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '19px',
      color: '#4b2f10',
      stroke: '#fff7d6',
      strokeThickness: 2,
    });
    this.lines = scene.add.text(-112, -58, '', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '13px',
      color: '#4b2f10',
      lineSpacing: 4,
      wordWrap: { width: 236 },
    });
    this.container.add([shadow, tabA, tabB, this.page, spine, sticker, doodle, this.title, this.lines]);
  }

  update({ prediction, ingredients, actions, observations = [], conclusion, stepStatus = [] }) {
    if (this.modeId === 'pauling') {
      this.updatePauling({ prediction, ingredients, actions, observations, conclusion });
      return;
    }

    this.lines.setText([
      `🔮 Prediction: ${prediction?.label ?? 'choose one'}`,
      '',
      `🧂 Ingredients: ${ingredients.length ? ingredients.join(', ') : 'none yet'}`,
      '',
      `🧰 Tools: ${actions.length ? actions.join(', ') : 'try a tool'}`,
      '',
      `✅ Steps: ${stepStatus.length ? stepStatus.join('  ') : 'predict first'}`,
    ].join('\n'));
  }

  updatePauling({ prediction, ingredients, actions, observations, conclusion }) {
    const observationText = observations.length ? observations[0] : 'record evidence after trial';
    this.lines.setText([
      `🔮 Hypothesis: ${prediction?.label ?? 'choose one'}`,
      `🧂 Materials: ${ingredients.length ? ingredients.join(', ') : 'select reagents'}`,
      `🧰 Procedure/tool step: ${actions.length ? actions.join(', ') : 'choose a tool'}`,
      `👀 Observations: ${observationText}`,
      `⭐ Conclusion: ${conclusion ?? 'compare evidence to hypothesis'}`,
    ].join('\n\n'));
  }
}
