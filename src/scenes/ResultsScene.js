import Phaser from 'phaser';
import { experiments } from '../data/experiments.js';
import { findReagent } from '../data/reagents.js';
import BadgeSystem from '../systems/BadgeSystem.js';
import Button from '../ui/Button.js';

export default class ResultsScene extends Phaser.Scene {
  constructor() {
    super('ResultsScene');
  }

  init(data) {
    this.experiment = experiments.find((experiment) => experiment.id === data.experimentId) ?? experiments[0];
    this.outcome = data.outcome;
    this.prediction = data.prediction;
    this.predictionMatched = data.predictionMatched;
    this.selectedIngredientIds = data.selectedIngredientIds ?? [];
    this.actions = data.actions ?? {};
  }

  create() {
    this.cameras.main.setBackgroundColor('#15183a');
    this.add.image(132, 514, 'art-junior-scientist').setDisplaySize(132, 168).setAngle(-6);
    this.add.text(512, 64, this.outcome.title, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '54px',
      color: this.outcome.kind === 'success' ? '#a8ffb0' : '#ffd166',
      stroke: '#11152f',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.rectangle(512, 296, 760, 340, 0xfff7d6).setStrokeStyle(5, 0x8a5a24);
    const predictionMessage = this.predictionMatched ? 'Nice observing — your prediction matched!' : 'Surprise! The observation was different from your prediction.';
    this.add.text(512, 138, `Your prediction: ${this.prediction?.icon ?? '❔'} ${this.prediction?.label ?? 'none'}`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '25px',
      color: '#4b2f10',
      align: 'center',
    }).setOrigin(0.5);
    this.add.text(512, 178, predictionMessage, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '21px',
      color: this.predictionMatched ? '#2f7d38' : '#7e2453',
      align: 'center',
    }).setOrigin(0.5);
    this.add.text(512, 250, this.outcome.explanation, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '24px',
      color: '#273469',
      align: 'center',
      wordWrap: { width: 690 },
    }).setOrigin(0.5);
    const ingredientNames = this.selectedIngredientIds.map((id) => findReagent(id)?.name).filter(Boolean).join(' + ');
    const actionNames = Object.entries(this.actions).filter(([, used]) => used).map(([name]) => name).join(', ');
    this.add.text(512, 330, `Observation notes: ${ingredientNames || 'No ingredients'} + ${actionNames || 'no tools'} → ${this.outcome.title}`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '19px',
      color: '#4b2f10',
      align: 'center',
      wordWrap: { width: 690 },
    }).setOrigin(0.5);
    this.add.text(512, 374, `Science words: ${this.outcome.vocabulary.join(' • ')}`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '22px',
      color: '#7e2453',
      align: 'center',
      wordWrap: { width: 690 },
    }).setOrigin(0.5);
    this.add.text(512, 428, this.outcome.safetyNote, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '19px',
      color: '#4b2f10',
      align: 'center',
      wordWrap: { width: 690 },
    }).setOrigin(0.5);

    this.showBadges();
    new Button(this, 390, 570, 'Replay', () => this.scene.start('LabScene', { experimentId: this.experiment.id }), { width: 180, fill: 0x9de8ff, stroke: 0x235b72 });
    new Button(this, 620, 570, 'More Cards', () => this.scene.start('LevelSelectScene'), { width: 210, fill: 0xffd166, stroke: 0x8a5a24 });
  }

  showBadges() {
    const earned = new BadgeSystem().getEarned();
    this.add.text(512, 474, 'Badges Earned', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);
    const badgesText = earned.length ? earned.map((badge) => `${badge.icon} ${badge.name}`).join('   ') : 'Try an experiment to earn badges!';
    this.add.text(512, 512, badgesText, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '21px',
      color: '#fff5a8',
      align: 'center',
      wordWrap: { width: 820 },
    }).setOrigin(0.5);
  }
}
