import Phaser from 'phaser';
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#15183a');
    this.add.text(512, 292, 'Mad Flask Lab', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '54px',
      color: '#ffffff',
      stroke: '#4b2bbf',
      strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(512, 358, 'Warming up the wobble goggles...', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '22px',
      color: '#9de8ff',
    }).setOrigin(0.5);
    this.time.delayedCall(450, () => this.scene.start('PreloadScene'));
  }
}
