import Phaser from 'phaser';
import { modes } from '../data/modes.js';
import DiscoverySystem from '../systems/DiscoverySystem.js';
import Button from '../ui/Button.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#15183a');
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
    this.add.text(512, 234, 'Choose a Mode', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '30px',
      color: '#ffd166',
    }).setOrigin(0.5);

    this.createModeCard(modes.henry, 356, 398);
    this.createModeCard(modes.pauling, 668, 398);

    new Button(this, 512, 554, 'Safety Promise', () => this.showSafety(), { width: 260, fill: 0x9de8ff, stroke: 0x235b72 });
    this.muteButton = new Button(this, 940, 44, this.muteLabel(), () => this.toggleMute(), { width: 140, height: 40, fill: 0x273469, stroke: 0x9de8ff, fontSize: '14px', color: '#ffffff' });
    const score = this.registry.get('score');
    if (score && (score.best > 0 || score.longestStreak > 0)) {
      this.add.text(512, 604, `Best score: ${score.best}   •   Longest streak: ${score.longestStreak}`, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '15px',
        color: '#9de8ff',
      }).setOrigin(0.5);
    }
  }

  createModeCard(mode, x, y) {
    const isHenry = mode.id === 'henry';
    this.add.rectangle(x, y, 284, 238, mode.colors.cardFill, 0.96).setStrokeStyle(5, mode.colors.cardStroke);
    this.add.text(x, y - 88, mode.label, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '22px',
      color: '#4b2f10',
      align: 'center',
      wordWrap: { width: 250 },
    }).setOrigin(0.5);
    this.add.text(x, y - 44, isHenry ? 'Playful fictional reagents and silly surprise reactions.' : 'Realistic reagents, evidence, and scientific explanations.', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '15px',
      color: '#273469',
      align: 'center',
      lineSpacing: 2,
      wordWrap: { width: 244 },
    }).setOrigin(0.5);
    const playButton = new Button(this, x, y + 30, mode.label, () => this.scene.start('LevelSelectScene', { modeId: mode.id }), { width: 244, height: 44, fill: isHenry ? 0xffd166 : 0x9de8ff, stroke: mode.colors.cardStroke, fontSize: '16px' });
    if (isHenry) this.tweens.add({ targets: playButton.container, scale: 1.04, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    new Button(this, x, y + 86, mode.labels.sandbox, () => this.scene.start('LabScene', { modeId: mode.id, experimentId: 'sandbox' }), { width: 244, height: 38, fill: 0xa8ffb0, stroke: 0x2f7d38, fontSize: '14px' });

    if (isHenry) {
      const sandboxFinds = new DiscoverySystem().getForExperiment('sandbox');
      const secretsFound = mode.secretReactions.filter((secret) => sandboxFinds.includes(secret.id)).length;
      this.add.text(x, y + 126, `🕵️ Secret recipes found: ${secretsFound}/${mode.secretReactions.length}`, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '12px',
        color: '#2f7d38',
      }).setOrigin(0.5);
    }
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
