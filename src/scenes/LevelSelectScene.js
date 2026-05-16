import Phaser from 'phaser';
import { experiments } from '../data/experiments.js';
import { funnyFailures, reactionOutcomes } from '../data/reactions.js';
import DiscoverySystem from '../systems/DiscoverySystem.js';
import Button from '../ui/Button.js';

export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelectScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#20275f');
    this.discoveries = new DiscoverySystem();
    this.add.text(512, 54, 'Choose a Lab Card', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '44px',
      color: '#ffffff',
      stroke: '#11152f',
      strokeThickness: 6,
    }).setOrigin(0.5);

    experiments.forEach((experiment, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      this.createCard(experiment, 206 + column * 306, 236 + row * 230);
    });
    new Button(this, 96, 586, 'Back', () => this.scene.start('MenuScene'), { width: 140, fill: 0xff8bd1, stroke: 0x7e2453 });
  }

  createCard(experiment, x, y) {
    this.add.rectangle(x, y, 260, 198, 0xfff7d6).setStrokeStyle(5, 0x8a5a24);
    this.add.text(x, y - 76, experiment.title, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '23px',
      color: '#4b2f10',
      align: 'center',
      wordWrap: { width: 220 },
    }).setOrigin(0.5);
    this.add.text(x, y - 28, experiment.goal, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '15px',
      color: '#4b2f10',
      align: 'center',
      wordWrap: { width: 218 },
    }).setOrigin(0.5);
    this.add.text(x, y + 20, `Words: ${experiment.vocabulary.join(', ')}`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '14px',
      color: '#273469',
      align: 'center',
      wordWrap: { width: 218 },
    }).setOrigin(0.5);
    const totalDiscoveries = reactionOutcomes.filter((outcome) => outcome.experimentId === experiment.id).length + funnyFailures.length;
    const foundDiscoveries = this.discoveries.countForExperiment(experiment.id);
    this.add.text(x, y + 50, `Discovered: ${foundDiscoveries}/${totalDiscoveries} outcomes`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '13px',
      color: foundDiscoveries ? '#2f7d38' : '#7e2453',
      align: 'center',
      wordWrap: { width: 218 },
    }).setOrigin(0.5);
    new Button(this, x, y + 76, 'Experiment!', () => this.scene.start('LabScene', { experimentId: experiment.id }), {
      width: 178,
      height: 42,
      fill: 0xa8ffb0,
      stroke: 0x2f7d38,
      fontSize: '18px',
    });
  }
}
