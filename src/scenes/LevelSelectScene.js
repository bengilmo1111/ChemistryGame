import Phaser from 'phaser';
import { getMode } from '../data/modes.js';
import { defineVocabulary } from '../data/vocabulary.js';
import DiscoverySystem from '../systems/DiscoverySystem.js';
import StarSystem from '../systems/StarSystem.js';
import Button from '../ui/Button.js';

export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelectScene');
  }

  init(data = {}) {
    this.modeId = data.modeId ?? 'henry';
    this.mode = getMode(this.modeId);
    this.experiments = this.mode.experiments;
    this.reactionOutcomes = this.mode.reactionOutcomes;
    this.failures = this.mode.failures ?? this.mode.funnyFailures ?? [];
  }

  create() {
    this.cameras.main.setBackgroundColor(this.mode.colors.labBackground);
    this.discoveries = new DiscoverySystem();
    this.stars = new StarSystem();
    this.add.text(512, 54, this.mode.labels.levelTitle, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '44px',
      color: '#ffffff',
      stroke: '#11152f',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.experiments.forEach((experiment, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      this.createCard(experiment, 206 + column * 306, 236 + row * 230);
    });
    new Button(this, 96, 586, 'Back', () => this.scene.start('MenuScene'), { width: 140, fill: 0xff8bd1, stroke: 0x7e2453 });
  }

  createCard(experiment, x, y) {
    this.add.rectangle(x, y, 280, 216, this.mode.colors.cardFill).setStrokeStyle(5, this.mode.colors.cardStroke);
    this.add.text(x, y - 108, this.stars.display(experiment.id, this.modeId), {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '22px',
      color: '#ffd166',
      stroke: '#11152f',
      strokeThickness: 5,
    }).setOrigin(0.5);
    this.add.text(x, y - 86, experiment.title, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '20px',
      color: '#4b2f10',
      align: 'center',
      wordWrap: { width: 254 },
    }).setOrigin(0.5);
    this.add.text(x, y - 52, experiment.goal, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '13px',
      color: '#4b2f10',
      align: 'center',
      lineSpacing: 2,
      wordWrap: { width: 252 },
    }).setOrigin(0.5);
    const wordPreview = defineVocabulary(experiment.vocabulary)
      .map(({ word, definition }) => `${word}: ${definition}`)
      .join('\n');
    this.add.text(x, y + 4, wordPreview, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '11px',
      color: '#273469',
      align: 'center',
      lineSpacing: 2,
      wordWrap: { width: 252 },
    }).setOrigin(0.5);
    const totalDiscoveries = this.reactionOutcomes.filter((outcome) => outcome.experimentId === experiment.id).length + this.failures.length;
    const foundDiscoveries = this.discoveries.countForExperiment(experiment.id, this.modeId);
    this.add.text(x, y + 56, `Discovered: ${foundDiscoveries}/${totalDiscoveries} outcomes`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '12px',
      color: foundDiscoveries ? '#2f7d38' : '#7e2453',
      align: 'center',
      wordWrap: { width: 254 },
    }).setOrigin(0.5);
    new Button(this, x, y + 82, 'Experiment!', () => this.scene.start('LabScene', { modeId: this.modeId, experimentId: experiment.id }), {
      width: 170,
      height: 38,
      fill: 0xa8ffb0,
      stroke: 0x2f7d38,
      fontSize: '17px',
    });
  }
}
