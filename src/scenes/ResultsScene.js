import Phaser from 'phaser';
import { getMode } from '../data/modes.js';
import { findEffectArt } from '../data/artAssets.js';
import { formatVocabularyDefinitions } from '../data/vocabulary.js';
import BadgeSystem from '../systems/BadgeSystem.js';
import DiscoverySystem from '../systems/DiscoverySystem.js';
import { buildQuiz } from '../systems/QuizSystem.js';
import StarSystem, { MAX_STARS, computeStars } from '../systems/StarSystem.js';
import VariableCoach from '../systems/VariableCoach.js';
import Button from '../ui/Button.js';
import { confettiBurst } from '../ui/effects.js';

const QUIZ_BONUS = 25;

const EFFECT_EMOJI = {
  foam: '🫧',
  rainbow: '🌈',
  crystal: '💎',
  layers: '🥞',
  pop: '🍾',
  swirl: '🌀',
  cork: '🚀',
  soot: '☁️',
  slime: '👾',
  duck: '🦆',
  lava: '🌋',
  galaxy: '🌌',
  disco: '🪩',
  blob: '🟢',
  dragon: '🐉',
  snow: '☃️',
  tornado: '🌪️',
  burp: '💨',
};

export default class ResultsScene extends Phaser.Scene {
  constructor() {
    super('ResultsScene');
  }

  init(data) {
    this.modeId = data.modeId ?? 'henry';
    this.mode = getMode(this.modeId);
    this.hero = this.mode.hero;
    this.experiment = this.mode.experiments.find((experiment) => experiment.id === data.experimentId) ?? this.mode.experiments[0];
    this.findReagent = (id) => this.mode.reagents.find((reagent) => reagent.id === id);
    this.outcome = data.outcome;
    this.prediction = data.prediction;
    this.predictionMatched = data.predictionMatched;
    this.selectedIngredientIds = data.selectedIngredientIds ?? [];
    this.actions = data.actions ?? {};
    this.discoveryCount = 0;
    this.variableCoach = new VariableCoach();
  }

  create() {
    this.cameras.main.setBackgroundColor(this.mode.colors.menuBackground ?? '#15183a');
    this.discoveryCount = new DiscoverySystem().record(this.experiment.id, this.outcome.id, this.modeId).length;
    this.starsEarned = computeStars({
      kind: this.outcome.kind,
      predictionMatched: this.predictionMatched,
      discoveryCount: this.discoveryCount,
    });
    new StarSystem().record(this.experiment.id, this.starsEarned, this.modeId);
    this.add.image(96, 348, 'art-junior-scientist').setDisplaySize(116, 148).setAngle(-6);
    this.add.text(96, 442, this.hero.name, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '15px',
      color: '#fff5a8',
      align: 'center',
      wordWrap: { width: 150 },
    }).setOrigin(0.5);
    this.add.text(96, 484, `💬 "${this.randomQuip(this.outcome.kind)}"`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '13px',
      fontStyle: 'italic',
      color: '#9de8ff',
      align: 'center',
      lineSpacing: 2,
      wordWrap: { width: 168 },
    }).setOrigin(0.5);
    const title = this.add.text(512, 44, this.outcome.title, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '42px',
      color: this.outcome.kind === 'success' ? '#a8ffb0' : '#ffd166',
      stroke: '#11152f',
      strokeThickness: 7,
    }).setOrigin(0.5).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 380, ease: 'Back.Out' });
    if (this.outcome.kind === 'success') confettiBurst(this, 40);

    const score = this.registry.get('score');
    this.scoreSystem = score ?? null;
    if (score) {
      const banner = this.add.text(900, 44, `⭐ ${score.score}`, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '24px',
        color: '#fff176',
        stroke: '#11152f',
        strokeThickness: 5,
      }).setOrigin(1, 0.5);
      this.scoreBanner = banner;
      if (score.streak >= 2) {
        this.add.text(900, 76, `🔥 streak x${score.streak}`, {
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '16px',
          color: '#ff8bd1',
        }).setOrigin(1, 0.5);
      }
      this.tweens.add({ targets: banner, scale: 1.15, duration: 220, yoyo: true, ease: 'Sine.InOut' });
    }

    this.createDiscoveryCard();

    this.showStars();
    this.showBadges();
    this.createQuizButton();
    new Button(this, 384, 588, 'Replay', () => this.scene.start('LabScene', { modeId: this.modeId, experimentId: this.experiment.id }), { width: 170, height: 44, fill: 0x9de8ff, stroke: 0x235b72, fontSize: '20px' });
    new Button(this, 600, 588, 'More Cards', () => this.scene.start('LevelSelectScene', { modeId: this.modeId }), { width: 200, height: 44, fill: 0xffd166, stroke: 0x8a5a24, fontSize: '20px' });
    new Button(this, 810, 588, 'Menu', () => this.scene.start('MenuScene'), { width: 130, height: 44, fill: 0xff8bd1, stroke: 0x7e2453, fontSize: '20px' });
  }

  createDiscoveryCard() {
    this.add.rectangle(550, 296, 720, 438, 0x8a5a24, 0.55).setOrigin(0.5).setAngle(1);
    this.add.rectangle(550, 296, 700, 432, 0xfff7d6).setStrokeStyle(5, 0x8a5a24);
    this.add.rectangle(550, 96, 660, 38, 0x273469, 0.95).setStrokeStyle(2, 0xffd166);
    this.add.text(550, 96, 'Discovery Card', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#fff5a8',
      letterSpacing: 2,
    }).setOrigin(0.5);

    this.createOutcomeIllustration();
    this.createRecipeStrip();
    this.layoutRows().forEach((row) => {
      this.add.text(row.x ?? 612, row.y, row.text, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: row.size,
        fontStyle: row.style ?? '',
        color: row.color,
        align: row.align ?? 'center',
        lineSpacing: row.lineSpacing ?? 2,
        wordWrap: { width: row.wrap ?? 452 },
      }).setOrigin(row.originX ?? 0.5, 0.5);
    });
  }

  createOutcomeIllustration() {
    const effectAsset = findEffectArt(this.outcome.effect);
    this.add.rectangle(308, 260, 230, 252, 0xffffff, 0.86).setStrokeStyle(4, 0xffd166);
    this.add.text(308, 145, 'New Find!', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#7e2453',
    }).setOrigin(0.5);
    const art = effectAsset
      ? this.add.image(308, 258, effectAsset.key).setDisplaySize(178, 178)
      : this.add.text(308, 258, EFFECT_EMOJI[this.outcome.effect] ?? '🧪', { fontSize: '92px' });
    art.setOrigin(0.5).setScale(0);
    this.tweens.add({ targets: art, scale: 1, duration: 420, delay: 200, ease: 'Back.Out' });
    this.tweens.add({ targets: art, y: 270, angle: 5, duration: 1400, delay: 650, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.add.text(308, 382, `${EFFECT_EMOJI[this.outcome.effect] ?? '🧪'} ${this.outcome.effect?.toUpperCase() ?? 'MYSTERY'}`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#273469',
    }).setOrigin(0.5);
  }

  createRecipeStrip() {
    const { ingredientNames, actionNames } = this.recipeParts();
    this.add.rectangle(612, 262, 430, 58, 0xffffff, 0.7).setStrokeStyle(3, 0x9de8ff);
    this.add.text(612, 250, 'Recipe Strip', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#235b72',
    }).setOrigin(0.5);
    this.add.text(612, 276, `${ingredientNames || 'no ingredients'}  +  ${actionNames || 'no tools'}`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '14px',
      color: '#4b2f10',
      align: 'center',
      wordWrap: { width: 398 },
    }).setOrigin(0.5);
  }

  recipeParts() {
    const ingredientNames = this.selectedIngredientIds.map((id) => this.findReagent(id)?.name).filter(Boolean).join(' + ');
    const actionNames = Object.entries(this.actions).filter(([, used]) => used).map(([name]) => ({ stirred: 'Stir', heated: 'Warm', cooled: 'Cool', sealed: 'Seal', shaken: 'Shake' }[name] ?? name)).join(', ');
    return { ingredientNames, actionNames };
  }


  randomQuip(kind = 'success') {
    const pool = kind === 'success' ? this.hero.successQuips : this.hero.failureQuips;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  predictionFeedback() {
    if (!this.prediction) {
      return this.modeId === 'pauling'
        ? 'No hypothesis recorded — choose one next trial to compare evidence clearly.'
        : 'No prediction this time — take a guess next mix for bonus ⭐!';
    }
    if (this.predictionMatched) {
      return this.modeId === 'pauling'
        ? `Evidence matched the hypothesis, ${this.hero.shortName}.${this.outcome.kind === 'success' ? ' +50 ⭐' : ''}`
        : `Nailed it, ${this.hero.shortName} — your prediction matched!${this.outcome.kind === 'success' ? ' +50 ⭐' : ''}`;
    }
    return this.modeId === 'pauling'
      ? `The evidence did not match the hypothesis, ${this.hero.shortName}. Revise one variable and test again.`
      : `Surprise, ${this.hero.shortName}! The flask had other plans.`;
  }

  layoutRows() {
    const predictionMessage = this.predictionFeedback();
    return [
      { x: 612, y: 140, size: '18px', style: 'bold', color: '#4b2f10', text: `${this.hero.shortName}'s prediction: ${this.prediction?.icon ?? '❔'} ${this.prediction?.label ?? 'none'}` },
      { x: 612, y: 170, size: '15px', color: this.predictionMatched ? '#2f7d38' : '#7e2453', text: predictionMessage },
      { x: 612, y: 218, size: '17px', style: 'bold', color: '#273469', text: this.outcome.explanation },
      { x: 612, y: 332, size: '13px', color: '#7e2453', text: `Science words:\n${formatVocabularyDefinitions(this.outcome.vocabulary)}` },
      { x: 612, y: 414, size: '13px', color: '#2f7d38', text: `${this.modeId === 'pauling' ? '🔬 Next controlled trial' : '🔬 Next mad idea'}: ${this.variableCoach.nextStep(this.experiment, this.outcome, this.selectedIngredientIds, this.actions)}` },
      { x: 612, y: 474, size: '11px', color: '#8a7a5a', text: this.outcome.safetyNote },
    ];
  }

  showStars() {
    const spacing = 44;
    for (let i = 0; i < MAX_STARS; i += 1) {
      const earned = i < this.starsEarned;
      const star = this.add.text(96 + (i - 1) * spacing, 140, earned ? '⭐' : '☆', {
        fontSize: '34px',
        color: '#ffd166',
      }).setOrigin(0.5).setScale(0);
      this.tweens.add({ targets: star, scale: 1, duration: 260, delay: 300 + i * 220, ease: 'Back.Out' });
      if (earned) {
        this.time.delayedCall(300 + i * 220, () => this.registry.get('sfx')?.sparkle());
      }
    }
    const tip = this.outcome.kind !== 'success'
      ? 'Finish the goal to earn stars!'
      : this.starsEarned < 2
        ? 'Match your prediction for ⭐⭐!'
        : this.starsEarned < MAX_STARS
          ? 'Find 3 outcomes here for ⭐⭐⭐!'
          : 'All stars earned — amazing!';
    this.add.text(96, 188, tip, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '13px',
      color: '#9de8ff',
      align: 'center',
      wordWrap: { width: 160 },
    }).setOrigin(0.5);
  }

  createQuizButton() {
    if (!this.outcome.vocabulary?.length) return;
    this.quizButton = new Button(this, 110, 540, `🧠 Brain Bonus +${QUIZ_BONUS}`, () => this.openQuiz(), {
      width: 180,
      height: 46,
      fill: 0xb388ff,
      stroke: 0x4b2bbf,
      fontSize: '14px',
      color: '#ffffff',
    });
  }

  openQuiz() {
    const quiz = buildQuiz(this.outcome.vocabulary);
    if (!quiz) return;
    this.quizButton.setEnabled(false);
    const panel = this.add.container(512, 320).setDepth(50);
    const backdrop = this.add.rectangle(0, 0, 1024, 640, 0x11152f, 0.6).setInteractive();
    const card = this.add.rectangle(0, 0, 620, 320, 0xfff7d6, 0.98).setStrokeStyle(6, 0x4b2bbf);
    const question = this.add.text(0, -110, `🧠 Brain Bonus!\n${quiz.question}`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '19px',
      color: '#273469',
      align: 'center',
      lineSpacing: 6,
      wordWrap: { width: 560 },
    }).setOrigin(0.5);
    panel.add([backdrop, card, question]);
    const sfx = this.registry.get('sfx');
    quiz.options.forEach((option, index) => {
      const button = new Button(this, 0, -10 + index * 58, option, () => {
        const correct = option === quiz.answer;
        const message = correct
          ? `Correct! ${quiz.answer} it is. +${QUIZ_BONUS} points!`
          : `Good try! The answer was "${quiz.answer}".`;
        if (correct) {
          sfx?.jingle();
          if (this.scoreSystem) {
            this.scoreSystem.addBonus(QUIZ_BONUS);
            this.scoreBanner?.setText(`⭐ ${this.scoreSystem.score}`);
          }
        } else {
          sfx?.wahWah();
        }
        panel.destroy();
        const feedbackPanel = this.add.container(512, 320).setDepth(50);
        const dim = this.add.rectangle(0, 0, 1024, 640, 0x11152f, 0.6);
        const feedback = this.add.text(0, 0, message, {
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '26px',
          color: correct ? '#a8ffb0' : '#ffd166',
          stroke: '#11152f',
          strokeThickness: 6,
          align: 'center',
          wordWrap: { width: 700 },
        }).setOrigin(0.5);
        feedbackPanel.add([dim, feedback]);
        this.tweens.add({ targets: feedbackPanel, alpha: 0, duration: 600, delay: 1600, onComplete: () => feedbackPanel.destroy() });
      }, { width: 380, height: 48, fill: 0x9de8ff, stroke: 0x235b72, fontSize: '18px' });
      panel.add(button.container);
    });
  }

  showBadges() {
    const earned = new BadgeSystem().getEarned();
    this.add.rectangle(512, 522, 560, 42, 0x273469, 0.75).setStrokeStyle(3, 0xffd166);
    this.add.text(512, 508, 'Badge Sticker Area', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);
    const badgesText = earned.length ? earned.map((badge) => `${badge.icon} ${badge.name}`).join('   ') : 'Try an experiment to earn badges!';
    this.add.text(512, 536, badgesText, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '16px',
      color: '#fff5a8',
      align: 'center',
      wordWrap: { width: 820 },
    }).setOrigin(0.5);
  }
}
