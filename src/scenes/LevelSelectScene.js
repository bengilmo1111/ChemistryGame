import Phaser from 'phaser';
import { experiments } from '../data/experiments.js';
import Button from '../ui/Button.js';

export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelectScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#20275f');
    this.add.text(512, 62, 'Choose a Lab Card', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#11152f',
      strokeThickness: 6,
    }).setOrigin(0.5);

    experiments.forEach((experiment, index) => this.createCard(experiment, 206 + index * 306, 308));
    new Button(this, 96, 586, 'Back', () => this.scene.start('MenuScene'), { width: 140, fill: 0xff8bd1, stroke: 0x7e2453 });
  }

  createCard(experiment, x, y) {
    this.add.rectangle(x, y, 260, 370, 0xfff7d6).setStrokeStyle(5, 0x8a5a24);
    this.add.text(x, y - 150, experiment.title, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '26px',
      color: '#4b2f10',
      align: 'center',
      wordWrap: { width: 220 },
    }).setOrigin(0.5);
    this.add.text(x, y - 70, experiment.goal, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '18px',
      color: '#4b2f10',
      align: 'center',
      wordWrap: { width: 215 },
    }).setOrigin(0.5);
    this.add.text(x, y + 28, `Science words:\n${experiment.vocabulary.join(', ')}`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '17px',
      color: '#273469',
      align: 'center',
      wordWrap: { width: 210 },
    }).setOrigin(0.5);
    new Button(this, x, y + 138, 'Experiment!', () => this.scene.start('LabScene', { experimentId: experiment.id }), {
      width: 190,
      fill: 0xa8ffb0,
      stroke: 0x2f7d38,
      fontSize: '20px',
    });
  }
}
