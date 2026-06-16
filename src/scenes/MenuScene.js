import Phaser from 'phaser';
import { modes } from '../data/modes.js';
import DiscoverySystem from '../systems/DiscoverySystem.js';
import StarSystem, { MAX_STARS } from '../systems/StarSystem.js';
import Button from '../ui/Button.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#111b36');
    this.addDecorations();
    const logo = this.add.image(512, 104, 'art-logo').setDisplaySize(520, 146);
    this.tweens.add({ targets: logo, y: 110, angle: 1.4, duration: 1900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    const heroArt = this.add.image(150, 426, 'art-junior-scientist').setDisplaySize(164, 210).setAngle(-4);
    this.tweens.add({ targets: heroArt, y: 420, angle: 2, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.add.text(150, 552, 'Choose your chemistry guide', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '17px',
      color: '#fff5a8',
      align: 'center',
      wordWrap: { width: 220 },
    }).setOrigin(0.5);
    this.add.text(512, 186, 'Predict → Mix → Observe → Explain', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '26px',
      color: '#9de8ff',
    }).setOrigin(0.5);
    this.discoveries = new DiscoverySystem();
    this.stars = new StarSystem();

    this.add.text(512, 232, 'Choose Your Experiment Style', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '30px',
      color: '#ffd166',
    }).setOrigin(0.5);

    this.createModeCard(modes.henry, 356, 400);
    this.createModeCard(modes.pauling, 668, 400);

    this.add.text(512, 552, 'Safety note: real chemistry should always be supervised by a trusted adult or instructor.', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '16px',
      color: '#fff5a8',
      align: 'center',
      wordWrap: { width: 650 },
    }).setOrigin(0.5);

    new Button(this, 512, 596, 'Full Safety Promise', () => this.showSafety(), { width: 260, height: 42, fill: 0x9de8ff, stroke: 0x235b72, fontSize: '16px' });
    this.muteButton = new Button(this, 940, 44, this.muteLabel(), () => this.toggleMute(), { width: 140, height: 40, fill: 0x273469, stroke: 0x9de8ff, fontSize: '14px', color: '#ffffff' });
    const score = this.registry.get('score');
    if (score && (score.best > 0 || score.longestStreak > 0)) {
      this.add.text(512, 628, `Best score: ${score.best}   •   Longest streak: ${score.longestStreak}`, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '15px',
        color: '#9de8ff',
      }).setOrigin(0.5);
    }
  }

  createModeCard(mode, x, y) {
    const isHenry = mode.id === 'henry';
    const cardWidth = 292;
    const cardHeight = 258;
    const palette = isHenry
      ? {
        fill: mode.colors.cardFill,
        stroke: mode.colors.cardStroke,
        title: '#7b2cbf',
        subtitle: '#273469',
        badgeFill: 0xff8bd1,
        badgeStroke: 0xffd166,
        buttonFill: 0xffd166,
        buttonText: '#3a2600',
        emoji: '🧪💥',
        eyebrow: 'Wild but science-based',
        subtitleText: 'Fictional reagents, real science ideas, maximum lab chaos.',
        action: 'Start Henry Chaos',
      }
      : {
        fill: mode.colors.cardFill,
        stroke: mode.colors.cardStroke,
        title: '#12384f',
        subtitle: '#235b72',
        badgeFill: 0xd9f4ff,
        badgeStroke: 0x235b72,
        buttonFill: 0x9de8ff,
        buttonText: '#102334',
        emoji: '🔬📓',
        eyebrow: 'Evidence-based process',
        subtitleText: 'Realistic chemicals, observations, variables, and conclusions.',
        action: 'Study with Pauling',
      };

    const container = this.add.container(x, y);
    const back = this.add.rectangle(0, 0, cardWidth, cardHeight, palette.fill, 0.97).setStrokeStyle(6, palette.stroke);
    const topBand = this.add.rectangle(0, -96, cardWidth - 24, 44, palette.badgeFill, 0.94).setStrokeStyle(3, palette.badgeStroke);
    const emoji = this.add.text(0, -96, palette.emoji, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: isHenry ? '26px' : '24px',
      color: palette.title,
    }).setOrigin(0.5);
    const title = this.add.text(0, -54, mode.label, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: isHenry ? '23px' : '24px',
      color: palette.title,
      align: 'center',
      wordWrap: { width: cardWidth - 34 },
    }).setOrigin(0.5);
    const eyebrow = this.add.text(0, -12, palette.eyebrow, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '16px',
      color: palette.subtitle,
      align: 'center',
      fontStyle: isHenry ? 'bold italic' : 'bold',
      wordWrap: { width: cardWidth - 36 },
    }).setOrigin(0.5);
    const subtitle = this.add.text(0, 24, palette.subtitleText, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '15px',
      color: palette.subtitle,
      align: 'center',
      lineSpacing: 4,
      wordWrap: { width: cardWidth - 40 },
    }).setOrigin(0.5);
    const progress = this.add.text(0, 66, this.progressSummary(mode), {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '13px',
      color: palette.subtitle,
      align: 'center',
      lineSpacing: 2,
      wordWrap: { width: cardWidth - 44 },
    }).setOrigin(0.5);
    const button = this.add.rectangle(0, 104, cardWidth - 46, 42, palette.buttonFill, 0.98).setStrokeStyle(4, palette.stroke);
    const buttonLabel = this.add.text(0, 104, palette.action, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '16px',
      color: palette.buttonText,
      align: 'center',
    }).setOrigin(0.5);

    container.add([back, topBand, emoji, title, eyebrow, subtitle, progress, button, buttonLabel]);
    container.setSize(cardWidth, cardHeight).setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => {
      const sfx = this.registry.get('sfx');
      if (sfx) { sfx.resume(); sfx.click(); }
      this.scene.start('LevelSelectScene', { modeId: mode.id });
    });
    container.on('pointerover', () => this.tweens.add({ targets: container, scale: 1.04, duration: 120 }));
    container.on('pointerout', () => this.tweens.add({ targets: container, scale: 1, duration: 120 }));

    if (isHenry) {
      this.tweens.add({ targets: topBand, angle: 2.5, duration: 480, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }
  }


  progressSummary(mode) {
    const outcomesByExperiment = new Map();
    mode.reactionOutcomes.forEach((outcome) => {
      const current = outcomesByExperiment.get(outcome.experimentId) ?? 0;
      outcomesByExperiment.set(outcome.experimentId, current + 1);
    });

    const totalOutcomes = mode.experiments.reduce((sum, experiment) => {
      const outcomeCount = outcomesByExperiment.get(experiment.id) ?? 0;
      return sum + outcomeCount + (mode.failures?.length ?? mode.funnyFailures?.length ?? 0);
    }, 0);
    const foundOutcomes = mode.experiments.reduce(
      (sum, experiment) => sum + this.discoveries.countForExperiment(experiment.id, mode.id),
      0,
    );
    const earnedStars = mode.experiments.reduce(
      (sum, experiment) => sum + this.stars.getStars(experiment.id, mode.id),
      0,
    );
    const totalStars = mode.experiments.length * MAX_STARS;

    return `Progress: ${foundOutcomes}/${totalOutcomes} outcomes
Stars: ${earnedStars}/${totalStars}`;
  }

  muteLabel() {
    const sfx = this.registry.get('sfx');
    return sfx && sfx.muted ? '🔇 Sound OFF' : '🔊 Sound ON';
  }

  toggleMute() {
    const sfx = this.registry.get('sfx');
    if (!sfx) return;
    sfx.toggleMute();
    this.muteButton.text.setText(this.muteLabel());
  }

  addDecorations() {
    for (let i = 0; i < 24; i += 1) {
      const x = Phaser.Math.Between(30, 994);
      const y = Phaser.Math.Between(40, 600);
      const star = this.add.text(x, y, Phaser.Math.RND.pick(['✦', '●', '◆', '○']), {
        fontSize: `${Phaser.Math.Between(16, 34)}px`,
        color: Phaser.Math.RND.pick(['#9de8ff', '#fff5a8', '#ff8bd1', '#a8ffb0']),
      }).setAlpha(0.65);
      this.tweens.add({ targets: star, y: y + Phaser.Math.Between(-12, 12), duration: Phaser.Math.Between(1200, 2400), yoyo: true, repeat: -1 });
    }
  }

  showSafety() {
    const panel = this.add.rectangle(512, 520, 760, 98, 0xffffff, 0.96).setStrokeStyle(4, 0x273469);
    const note = this.add.text(512, 520, `${modes.henry.safetyText}\n${modes.pauling.safetyText}`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '17px',
      color: '#273469',
      align: 'center',
      wordWrap: { width: 700 },
    }).setOrigin(0.5);
    this.time.delayedCall(4200, () => {
      panel.destroy();
      note.destroy();
    });
  }
}
