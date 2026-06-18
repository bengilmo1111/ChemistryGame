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
    const logo = this.add.image(512, 92, 'art-logo').setDisplaySize(500, 140);
    this.tweens.add({ targets: logo, y: 98, angle: 1.4, duration: 1900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    const heroArt = this.add.image(116, 472, 'art-junior-scientist').setDisplaySize(144, 184).setAngle(-4);
    this.tweens.add({ targets: heroArt, y: 466, angle: 2, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.add.text(512, 180, 'Pick a lab, then start mixing', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '28px',
      color: '#9de8ff',
      stroke: '#11152f',
      strokeThickness: 4,
    }).setOrigin(0.5);
    this.discoveries = new DiscoverySystem();
    this.stars = new StarSystem();

    this.add.text(512, 226, 'Choose Your Experiment Style', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '30px',
      color: '#ffd166',
    }).setOrigin(0.5);

    this.createModeCard(modes.henry, 344, 418);
    this.createModeCard(modes.pauling, 700, 418);
    this.muteButton = new Button(this, 940, 44, this.muteLabel(), () => this.toggleMute(), { width: 140, height: 40, fill: 0x273469, stroke: 0x9de8ff, fontSize: '14px', color: '#ffffff' });
    const score = this.registry.get('score');
    if (score && (score.best > 0 || score.longestStreak > 0)) {
      this.add.text(512, 604, `Best score: ${score.best} - Longest streak: ${score.longestStreak}`, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '15px',
        color: '#9de8ff',
      }).setOrigin(0.5);
    }
  }

  createModeCard(mode, x, y) {
    const isHenry = mode.id === 'henry';
    const cardWidth = 328;
    const cardHeight = 320;
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
        portrait: 'art-mode-henry-adventure',
        heroIcon: 'Fizz Quest',
        subtitleText: 'Big reactions and secret recipes.',
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
        portrait: 'art-mode-pauling-adventure',
        heroIcon: 'Clue Lab',
        subtitleText: 'Clues, patterns, and careful tests.',
        action: 'Study with Pauling',
      };

    const container = this.add.container(x, y);
    const back = this.add.rectangle(0, 0, cardWidth, cardHeight, palette.fill, 0.97).setStrokeStyle(6, palette.stroke);
    const glow = this.add.ellipse(0, -70, cardWidth - 34, 132, palette.badgeFill, 0.42);
    const headerPanel = this.add.rectangle(0, -74, cardWidth - 24, 124, isHenry ? 0xfff5a8 : 0xffffff, 0.54)
      .setStrokeStyle(3, palette.badgeStroke);

    const patternItems = [];
    if (isHenry) {
      [
        [-104, -114, 0xa8ffb0], [-76, -38, 0x9de8ff], [96, -114, 0xff8bd1], [112, -34, 0xffd166],
      ].forEach(([px, py, color]) => patternItems.push(this.add.circle(px, py, 10, color, 0.72).setStrokeStyle(2, palette.stroke, 0.55)));
      patternItems.push(this.add.arc(-118, -72, 18, 20, 330, false, 0x67f2c4, 0.65).setStrokeStyle(3, palette.stroke, 0.35));
      patternItems.push(this.add.star(115, -76, 5, 8, 18, 0xffd166, 0.75).setStrokeStyle(2, palette.stroke, 0.45));
    } else {
      [-106, -106, -74, -38, 82, -104, 110, -50].forEach((value, index, arr) => {
        if (index % 2 === 0) {
          const px = value;
          const py = arr[index + 1];
          patternItems.push(this.add.rectangle(px, py, 44, 28, 0xffffff, 0.5).setStrokeStyle(2, palette.badgeStroke, 0.45).setAngle(index % 4 === 0 ? -6 : 5));
          patternItems.push(this.add.line(px, py, -14, -4, 14, -4, palette.badgeStroke, 0.42).setLineWidth(3));
          patternItems.push(this.add.line(px, py + 7, -12, -4, 10, -4, palette.badgeStroke, 0.32).setLineWidth(2));
        }
      });
      patternItems.push(this.add.circle(116, -88, 18, 0xd9f4ff, 0.42).setStrokeStyle(3, palette.badgeStroke, 0.6));
    }

    const portrait = this.add.image(-72, -82, palette.portrait).setDisplaySize(142, 128);
    const iconBadge = this.add.rectangle(80, -112, 122, 36, palette.badgeFill, 0.94).setStrokeStyle(3, palette.badgeStroke);
    const iconText = this.add.text(80, -112, palette.heroIcon, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '19px',
      color: palette.title,
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);
    const title = this.add.text(78, -66, mode.label, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: isHenry ? '24px' : '25px',
      color: palette.title,
      align: 'center',
      wordWrap: { width: 154 },
    }).setOrigin(0.5);
    const subtitle = this.add.text(0, 22, palette.subtitleText, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '19px',
      color: palette.subtitle,
      align: 'center',
      fontStyle: 'bold',
      lineSpacing: 4,
      wordWrap: { width: cardWidth - 38 },
    }).setOrigin(0.5);
    const progress = this.add.text(0, 66, this.progressSummary(mode), {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '13px',
      color: palette.subtitle,
      align: 'center',
      lineSpacing: 2,
      wordWrap: { width: cardWidth - 58 },
    }).setOrigin(0.5);
    const button = this.add.rectangle(0, 112, cardWidth - 42, 52, palette.buttonFill, 0.98).setStrokeStyle(4, palette.stroke);
    const buttonLabel = this.add.text(0, 112, palette.action, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '20px',
      color: palette.buttonText,
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    const sandboxButton = this.add.rectangle(0, 162, cardWidth - 72, 38, isHenry ? 0xa8ffb0 : 0xd9f4ff, 0.98).setStrokeStyle(3, palette.stroke);
    const sandboxLabel = this.add.text(0, 162, mode.labels.sandbox, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '15px',
      color: palette.buttonText,
      align: 'center',
    }).setOrigin(0.5);

    container.add([back, glow, headerPanel, ...patternItems, portrait, iconBadge, iconText, title, subtitle, progress, button, buttonLabel, sandboxButton, sandboxLabel]);
    container.setSize(cardWidth, cardHeight).setInteractive({ useHandCursor: true });
    container.on('pointerdown', (pointer) => {
      const sfx = this.registry.get('sfx');
      if (sfx) { sfx.resume(); sfx.click(); }
      const localPoint = container.getLocalPoint(pointer.x, pointer.y);
      if (localPoint.y >= 140) {
        this.scene.start('LabScene', { modeId: mode.id, experimentId: 'sandbox' });
      } else {
        this.scene.start('LevelSelectScene', { modeId: mode.id });
      }
    });
    container.on('pointerover', () => this.tweens.add({ targets: container, scale: 1.04, duration: 120 }));
    container.on('pointerout', () => this.tweens.add({ targets: container, scale: 1, duration: 120 }));

    if (isHenry) {
      this.tweens.add({ targets: portrait, angle: 2.5, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      this.tweens.add({ targets: patternItems, scale: 1.16, duration: 640, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
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
    return sfx && sfx.muted ? 'Sound OFF' : 'Sound ON';
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
      const star = this.add.text(x, y, Phaser.Math.RND.pick(['*', '+', '.', 'o']), {
        fontSize: `${Phaser.Math.Between(16, 34)}px`,
        color: Phaser.Math.RND.pick(['#9de8ff', '#fff5a8', '#ff8bd1', '#a8ffb0']),
      }).setAlpha(0.65);
      this.tweens.add({ targets: star, y: y + Phaser.Math.Between(-12, 12), duration: Phaser.Math.Between(1200, 2400), yoyo: true, repeat: -1 });
    }
  }

}
