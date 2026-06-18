export default class Tooltip {
  constructor(scene) {
    this.shadow = scene.add.rectangle(5, 6, 288, 84, 0x11152f, 0.28).setVisible(false).setDepth(49);
    this.box = scene.add.rectangle(0, 0, 288, 84, 0xfff176, 0.96).setStrokeStyle(4, 0xff8bd1).setVisible(false).setDepth(50);
    this.tail = scene.add.triangle(-122, 38, 0, 0, 22, 0, 0, 18, 0xfff176, 0.96).setStrokeStyle(3, 0xff8bd1).setVisible(false).setDepth(50);
    this.text = scene.add.text(0, 0, '', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '16px',
      color: '#273469',
      wordWrap: { width: 246 },
    }).setVisible(false).setDepth(51);
  }

  show(x, y, message) {
    this.shadow.setPosition(x + 5, y + 6).setVisible(true);
    this.box.setPosition(x, y).setVisible(true);
    this.tail.setPosition(x, y).setVisible(true);
    this.text.setPosition(x - 123, y - 30).setText(message).setVisible(true);
  }

  hide() {
    this.shadow.setVisible(false);
    this.box.setVisible(false);
    this.tail.setVisible(false);
    this.text.setVisible(false);
  }
}
