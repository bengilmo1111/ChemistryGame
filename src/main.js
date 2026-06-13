import Phaser from 'phaser';
import './styles.css';
import { displayScale } from './systems/displayScale.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import LevelSelectScene from './scenes/LevelSelectScene.js';
import LabScene from './scenes/LabScene.js';
import ResultsScene from './scenes/ResultsScene.js';

// The game runs at a fixed 1024x640 world that Scale.FIT stretches to the
// screen. On retina / iOS displays that stretch makes Phaser's 1x text
// textures blurry, so render every Text object at the device pixel ratio.
// Patching the factory once keeps every `add.text` call crisp with no churn.
const factory = Phaser.GameObjects.GameObjectFactory.prototype;
const createText = factory.text;
factory.text = function patchedText(...args) {
  return createText.apply(this, args).setResolution(displayScale());
};

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
