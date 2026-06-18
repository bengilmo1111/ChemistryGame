import Phaser from 'phaser';
export default class Meter {
  constructor(scene, x, y, label) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.container = scene.add.container(x, y);
    const shadow = scene.add.ellipse(4, 10, 222, 70, 0x11152f, 0.28);
    const face = scene.add.ellipse(0, 0, 218, 74, 0xfff7d6, 0.98).setStrokeStyle(5, 0x8a5a24);
    const grin = scene.add.arc(0, 10, 56, Phaser.Math.DegToRad(15), Phaser.Math.DegToRad(165), false, 0xffd166, 0.5).setStrokeStyle(4, 0x273469, 0.7);
    this.needle = scene.add.rectangle(0, 4, 72, 8, 0xff4d6d).setOrigin(0.08, 0.5).setStrokeStyle(2, 0xffffff);
    const knob = scene.add.circle(0, 4, 13, 0x273469).setStrokeStyle(3, 0xffffff);
    this.label = scene.add.text(0, -50, `🤪 ${label}`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#11152f',
      strokeThickness: 4,
    }).setOrigin(0.5);
    this.valueText = scene.add.text(0, 48, 'Curious', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '16px',
      color: '#ffe8a3',
      stroke: '#11152f',
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.container.add([shadow, face, grin, this.needle, knob, this.label, this.valueText]);
  }

  setValue(value, label) {
    const clamped = Phaser.Math.Clamp(value, 0, 100);
    const angle = Phaser.Math.Linear(-58, 58, clamped / 100);
    this.scene.tweens.add({ targets: this.needle, angle, duration: 260, ease: 'Elastic.Out' });
    this.scene.tweens.add({ targets: this.container, angle: clamped >= 70 ? 3 : 1, duration: 90, yoyo: true, repeat: clamped >= 70 ? 3 : 1 });
    this.valueText.setText(label);
  }
}
