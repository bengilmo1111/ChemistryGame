import Phaser from 'phaser';

export default class DangerMeter {
  constructor() {
    this.value = 0;
  }

  add(amount) {
    this.value = Phaser.Math.Clamp(this.value + amount, 0, 100);
    return this.value;
  }

  label() {
    if (this.value < 35) return 'Curious';
    if (this.value < 70) return 'Wobbly';
    return 'Kaboom-ish';
  }
}
