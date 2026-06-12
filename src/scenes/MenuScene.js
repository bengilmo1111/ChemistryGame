import Phaser from 'phaser';
import { hero } from '../data/hero.js';
import { secretReactions } from '../data/reactions.js';
import DiscoverySystem from '../systems/DiscoverySystem.js';
import Button from '../ui/Button.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#15183a');
    this.addDecorations();
    this.add.image(512, 104, 'art-logo').setDisplaySize(520, 146);
    this.add.image(150, 426, 'art-junior-scientist').setDisplaySize(164, 210).setAngle(-4);
    this.add.text(150, 552, hero.tagline, {
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
    this.add.text(512, 234, `Starring ${hero.name}`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '22px',
      color: '#ffd166',
    }).setOrigin(0.5);
    this.add.text(512, 290, hero.intro, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '19px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 720 },
    }).setOrigin(0.5);
    new Button(this, 512, 388, `Play as ${hero.shortName}`, () => this.scene.start('LevelSelectScene'), { width: 300 });
    new Button(this, 512, 452, '🧪 MAD MIX (Sandbox)', () => this.scene.start('LabScene', { experimentId: 'sandbox' }), { width: 300, fill: 0xa8ffb0, stroke: 0x2f7d38 });
    const sandboxFinds = new DiscoverySystem().getForExperiment('sandbox');
    const secretsFound = secretReactions.filter((secret) => sandboxFinds.includes(secret.id)).length;
    this.add.text(512, 562, `🕵️ Secret recipes found: ${secretsFound}/${secretReactions.length}`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '14px',
      color: '#a8ffb0',
    }).setOrigin(0.5);
    new Button(this, 512, 514, 'Safety Promise', () => this.showSafety(), { width: 260, fill: 0x9de8ff, stroke: 0x235b72 });
    this.muteButton = new Button(this, 940, 44, this.muteLabel(), () => this.toggleMute(), { width: 140, height: 40, fill: 0x273469, stroke: 0x9de8ff, fontSize: '14px', color: '#ffffff' });
    const score = this.registry.get('score');
    if (score && (score.best > 0 || score.longestStreak > 0)) {
      this.add.text(512, 588, `Best score: ${score.best}   •   Longest streak: ${score.longestStreak}`, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '15px',
        color: '#9de8ff',
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
    const panel = this.add.rectangle(512, 520, 760, 78, 0xffffff, 0.96).setStrokeStyle(4, 0x273469);
    const note = this.add.text(512, 520, 'All reagents are pretend. Real experiments need a trusted grown-up, goggles, and safe school instructions.', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '20px',
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
