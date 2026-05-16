import Phaser from 'phaser';
import './styles.css';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import LevelSelectScene from './scenes/LevelSelectScene.js';
import LabScene from './scenes/LabScene.js';
import ResultsScene from './scenes/ResultsScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#15183a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1024,
    height: 640,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 520 },
      debug: false,
    },
  },
  scene: [BootScene, PreloadScene, MenuScene, LevelSelectScene, LabScene, ResultsScene],
};

window.addEventListener('load', () => {
  window.madFlaskGame = new Phaser.Game(config);
});
