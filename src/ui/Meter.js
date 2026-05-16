import Phaser from 'phaser';
export default class Meter {
  constructor(scene, x, y, label) {
    this.scene = scene;
    this.fill = scene.add.rectangle(x - 100, y, 1, 20, 0xff4d6d).setOrigin(0, 0.5);
    this.border = scene.add.rectangle(x, y, 208, 28, 0x000000, 0).setStrokeStyle(3, 0xffffff);
    this.label = scene.add.text(x, y - 42, label, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.valueText = scene.add.text(x, y + 32, 'Curious', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '16px',
      color: '#ffe8a3',
    }).setOrigin(0.5);
  }

  setValue(value, label) {
    this.scene.tweens.add({ targets: this.fill, displayWidth: Phaser.Math.Clamp(value * 2, 1, 200), duration: 220 });
    this.valueText.setText(label);
  }
}
