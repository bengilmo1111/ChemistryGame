import Phaser from 'phaser';
import { artAssets } from '../data/artAssets.js';
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    artAssets.forEach((asset) => {
      this.load.svg(asset.key, asset.path);
    });
  }

  create() {
    this.createCircleTexture('bubble', 0x9de8ff, 20, 0xffffff);
    this.createCircleTexture('foam', 0xffffff, 28, 0x9de8ff);
    this.createCircleTexture('soot', 0x222222, 32, 0x444444);
    this.createCircleTexture('slime', 0x67f2c4, 34, 0x1ab98d);
    this.createCrystalTexture();
    this.createCorkTexture();
    this.scene.start('MenuScene');
  }

  createCircleTexture(key, fill, radius, stroke) {
    const graphics = this.add.graphics();
    graphics.fillStyle(fill, 1).fillCircle(radius, radius, radius - 2);
    graphics.lineStyle(4, stroke, 1).strokeCircle(radius, radius, radius - 3);
    graphics.generateTexture(key, radius * 2, radius * 2);
    graphics.destroy();
  }

  createCrystalTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xd8fbff, 1).fillTriangle(24, 0, 48, 48, 0, 48);
    graphics.lineStyle(3, 0x76d7ea, 1).strokeTriangle(24, 0, 48, 48, 0, 48);
    graphics.generateTexture('crystal', 48, 52);
    graphics.destroy();
  }

  createCorkTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xc28b48, 1).fillRoundedRect(0, 0, 54, 28, 10);
    graphics.lineStyle(3, 0x6d421c, 1).strokeRoundedRect(0, 0, 54, 28, 10);
    graphics.generateTexture('cork', 58, 32);
    graphics.destroy();
  }
}
