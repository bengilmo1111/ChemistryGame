export default class Tooltip {
  constructor(scene) {
    this.box = scene.add.rectangle(0, 0, 280, 76, 0x1f2559, 0.95).setStrokeStyle(2, 0x9de8ff).setVisible(false).setDepth(50);
    this.text = scene.add.text(0, 0, '', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: 246 },
    }).setVisible(false).setDepth(51);
  }

  show(x, y, message) {
    this.box.setPosition(x, y).setVisible(true);
    this.text.setPosition(x - 123, y - 28).setText(message).setVisible(true);
  }

  hide() {
    this.box.setVisible(false);
    this.text.setVisible(false);
  }
}
