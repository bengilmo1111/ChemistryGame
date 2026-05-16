export default class DialogueSystem {
  constructor(scene, x, y, width = 560) {
    this.scene = scene;
    this.panel = scene.add.rectangle(x, y, width, 92, 0xffffff, 0.94).setStrokeStyle(4, 0x273469);
    this.text = scene.add.text(x - width / 2 + 22, y - 34, '', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '20px',
      color: '#273469',
      wordWrap: { width: width - 44 },
    });
  }

  say(message) {
    this.text.setText(message);
    this.scene.tweens.add({ targets: [this.panel, this.text], scale: { from: 0.98, to: 1 }, duration: 180, ease: 'Back.Out' });
  }
}
