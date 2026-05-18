import Phaser from 'phaser';
import { experiments } from '../data/experiments.js';
import { hero } from '../data/hero.js';
import { findReagent } from '../data/reagents.js';
import { formatVocabularyDefinitions } from '../data/vocabulary.js';
import BadgeSystem from '../systems/BadgeSystem.js';
import DiscoverySystem from '../systems/DiscoverySystem.js';
import VariableCoach from '../systems/VariableCoach.js';
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
    this.discoveryCount = 0;
    this.variableCoach = new VariableCoach();
  }

  create() {
    this.cameras.main.setBackgroundColor('#15183a');
    this.discoveryCount = new DiscoverySystem().record(this.experiment.id, this.outcome.id).length;
    this.add.image(96, 348, 'art-junior-scientist').setDisplaySize(116, 148).setAngle(-6);
    this.add.text(96, 442, hero.name, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '15px',
      color: '#fff5a8',
      align: 'center',
      wordWrap: { width: 150 },
    }).setOrigin(0.5);
    this.add.text(512, 44, this.outcome.title, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '42px',
      color: this.outcome.kind === 'success' ? '#a8ffb0' : '#ffd166',
      stroke: '#11152f',
      strokeThickness: 7,
    }).setOrigin(0.5);

    const score = this.registry.get('score');
    if (score) {
      const banner = this.add.text(900, 44, `⭐ ${score.score}`, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '24px',
        color: '#fff176',
        stroke: '#11152f',
        strokeThickness: 5,
      }).setOrigin(1, 0.5);
      if (score.streak >= 2) {
        this.add.text(900, 76, `🔥 streak x${score.streak}`, {
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '16px',
          color: '#ff8bd1',
        }).setOrigin(1, 0.5);
      }
      this.tweens.add({ targets: banner, scale: 1.15, duration: 220, yoyo: true, ease: 'Sine.InOut' });
    }

    this.add.rectangle(550, 296, 700, 432, 0xfff7d6).setStrokeStyle(5, 0x8a5a24);
    this.layoutRows().forEach((row) => {
      this.add.text(row.x ?? 550, row.y, row.text, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: row.size,
        color: row.color,
        align: 'center',
        lineSpacing: row.lineSpacing ?? 2,
        wordWrap: { width: row.wrap ?? 660 },
      }).setOrigin(0.5);
    });

    this.showBadges();
    new Button(this, 384, 588, 'Replay', () => this.scene.start('LabScene', { experimentId: this.experiment.id }), { width: 170, height: 44, fill: 0x9de8ff, stroke: 0x235b72, fontSize: '20px' });
    new Button(this, 600, 588, 'More Cards', () => this.scene.start('LevelSelectScene'), { width: 200, height: 44, fill: 0xffd166, stroke: 0x8a5a24, fontSize: '20px' });
    new Button(this, 810, 588, 'Menu', () => this.scene.start('MenuScene'), { width: 130, height: 44, fill: 0xff8bd1, stroke: 0x7e2453, fontSize: '20px' });
  }

  layoutRows() {
    const ingredientNames = this.selectedIngredientIds.map((id) => findReagent(id)?.name).filter(Boolean).join(' + ');
    const actionNames = Object.entries(this.actions).filter(([, used]) => used).map(([name]) => ({ stirred: 'Stir', heated: 'Warm', cooled: 'Cool', sealed: 'Seal', shaken: 'Shake' }[name] ?? name)).join(', ');
    const predictionMessage = this.predictionMatched
      ? `Nice observing, ${hero.shortName} — your prediction matched!`
      : `Surprise, ${hero.shortName}! The observation was different from your prediction.`;
    return [
      { y: 110, size: '20px', color: '#4b2f10', text: `${hero.shortName}'s prediction: ${this.prediction?.icon ?? '❔'} ${this.prediction?.label ?? 'none'}` },
      { y: 140, size: '17px', color: this.predictionMatched ? '#2f7d38' : '#7e2453', text: predictionMessage },
      { y: 188, size: '18px', color: '#273469', text: this.outcome.explanation },
      { y: 256, size: '14px', color: '#4b2f10', text: `Notes: ${ingredientNames || 'no ingredients'} + ${actionNames || 'no tools'} → ${this.outcome.title}` },
      { y: 320, size: '14px', color: '#7e2453', text: `Science words:\n${formatVocabularyDefinitions(this.outcome.vocabulary)}` },
      { y: 396, size: '14px', color: '#273469', text: `Discovery log: ${this.discoveryCount} outcome${this.discoveryCount === 1 ? '' : 's'} found here. Replay to compare results.` },
      { y: 436, size: '14px', color: '#2f7d38', text: `Next variable test: ${this.variableCoach.nextStep(this.experiment, this.outcome, this.selectedIngredientIds, this.actions)}` },
      { y: 484, size: '13px', color: '#4b2f10', text: this.outcome.safetyNote },
    ];
  }

  showBadges() {
    const earned = new BadgeSystem().getEarned();
    this.add.text(512, 522, 'Badges Earned', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);
    const badgesText = earned.length ? earned.map((badge) => `${badge.icon} ${badge.name}`).join('   ') : 'Try an experiment to earn badges!';
    this.add.text(512, 548, badgesText, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '16px',
      color: '#fff5a8',
      align: 'center',
      wordWrap: { width: 820 },
    }).setOrigin(0.5);
  }
}
