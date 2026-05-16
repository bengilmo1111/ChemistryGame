import Phaser from 'phaser';
import { experiments } from '../data/experiments.js';
import { reagents, findReagent } from '../data/reagents.js';
import BadgeSystem from '../systems/BadgeSystem.js';
import DangerMeter from '../systems/DangerMeter.js';
import DialogueSystem from '../systems/DialogueSystem.js';
import LabInventory from '../systems/LabInventory.js';
import PredictionSystem, { predictions } from '../systems/PredictionSystem.js';
import ReactionEngine from '../systems/ReactionEngine.js';
import Button from '../ui/Button.js';
import LabNotebook from '../ui/LabNotebook.js';
import Meter from '../ui/Meter.js';
import Tooltip from '../ui/Tooltip.js';

const ACTION_DETAILS = {
  stirred: { label: 'Stir', note: 'The spoon spreads ingredients through the flask.', icon: '🥄' },
  heated: { label: 'Warm', note: 'Warmth makes pretend particles wiggle faster.', icon: '🔥' },
  cooled: { label: 'Cool', note: 'Cooling slows motion so patterns and layers can settle.', icon: '❄️' },
  sealed: { label: 'Seal', note: 'A cork traps pretend gas, so pressure can build.', icon: '🧱' },
  shaken: { label: 'Shake', note: 'Gentle shaking gives mixtures more motion.', icon: '🌀' },
};

function actionLabel(action) {
  return ACTION_DETAILS[action]?.label ?? action;
}

export default class LabScene extends Phaser.Scene {
  constructor() {
    super('LabScene');
  }

  init(data) {
    this.experiment = experiments.find((experiment) => experiment.id === data.experimentId) ?? experiments[0];
    this.inventory = new LabInventory();
    this.predictions = new PredictionSystem();
    this.engine = new ReactionEngine();
    this.danger = new DangerMeter();
    this.actions = { stirred: false, heated: false, cooled: false, sealed: false, shaken: false };
    this.toolEffectSprites = [];
  }

  create() {
    this.cameras.main.setBackgroundColor('#232a62');
    this.physics.world.setBounds(0, 0, 1024, 640);
    this.addLabBench();
    this.dialogue = new DialogueSystem(this, 380, 76, 650);
    this.dialogue.say(this.experiment.prompt);
    this.notebook = new LabNotebook(this, 858, 286);
    this.meter = new Meter(this, 858, 478, 'Chaos Meter');
    this.tooltip = new Tooltip(this);
    this.createPredictionButtons();
    this.createLabCard();
    this.createFlask();
    this.createObservationClues();
    this.createReagents();
    this.createToolButtons();
    this.mixButton = new Button(this, 858, 570, 'Mix!', () => this.mix(), { width: 180, fill: 0xffd166 });
    this.mixButton.setEnabled(false);
    this.resetButton = new Button(this, 666, 570, 'Reset Flask', () => this.resetFlask(), { width: 170, height: 46, fill: 0xffffff, stroke: 0x273469, fontSize: '18px', color: '#273469' });
    new Button(this, 92, 44, 'Cards', () => this.scene.start('LevelSelectScene'), { width: 136, height: 44, fill: 0xff8bd1, stroke: 0x7e2453, fontSize: '18px' });
    this.updateNotebook();
  }

  addLabBench() {
    this.add.image(512, 320, 'art-lab-bench').setDisplaySize(1024, 640);
    this.add.rectangle(512, 566, 1024, 148, 0x6d421c);
    this.add.rectangle(512, 506, 1024, 34, 0xc28b48);
    this.add.text(512, 30, this.experiment.title, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '30px',
      color: '#fff5a8',
    }).setOrigin(0.5);
  }

  createPredictionButtons() {
    this.add.text(42, 112, '1. Predict', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '24px', color: '#ffffff' });
    predictions.forEach((prediction, index) => {
      const x = 104 + (index % 3) * 136;
      const y = 156 + Math.floor(index / 3) * 48;
      const button = new Button(this, x, y, `${prediction.icon} ${prediction.label}`, () => {
        this.predictions.choose(prediction.id);
        this.dialogue.say(`Prediction saved: ${prediction.label}. Now drag ingredients into the flask.`);
        this.updateNotebook();
        this.updateMixButton();
      }, { width: 126, height: 38, fill: 0x9de8ff, stroke: 0x235b72, fontSize: '13px' });
      button.container.setDepth(4);
    });
  }

  createLabCard() {
    this.add.rectangle(858, 84, 280, 70, 0xfff7d6, 0.96).setStrokeStyle(4, 0x8a5a24);
    this.add.text(858, 62, `Goal: ${this.experiment.goal}`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '14px',
      color: '#4b2f10',
      align: 'center',
      wordWrap: { width: 244 },
    }).setOrigin(0.5);
    this.add.text(858, 101, `Tool clue: ${this.experiment.actionHint}`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '13px',
      color: '#273469',
      align: 'center',
      wordWrap: { width: 250 },
    }).setOrigin(0.5);
  }

  createFlask() {
    this.flask = this.add.container(392, 386);
    const glass = this.add.graphics();
    glass.fillStyle(0xffffff, 0.18).fillRoundedRect(-70, -115, 140, 205, 32);
    glass.lineStyle(6, 0xd8fbff, 0.95).strokeRoundedRect(-70, -115, 140, 205, 32);
    glass.fillStyle(0x83d8ff, 0.45).fillRoundedRect(-52, 4, 104, 76, 28);
    this.liquid = this.add.rectangle(0, 42, 104, 76, 0x83d8ff, 0.65);
    this.flask.add([glass, this.liquid]);
    this.dropZone = this.add.zone(392, 386, 170, 230).setRectangleDropZone(170, 230);
    this.add.text(392, 520, 'Drop ingredients here', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
    this.input.on('drop', (_pointer, gameObject) => this.addIngredient(gameObject));
  }

  createObservationClues() {
    this.add.rectangle(392, 586, 320, 78, 0x15183a, 0.5).setStrokeStyle(3, 0x9de8ff);
    this.add.text(392, 556, 'Observation Clues', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '18px',
      color: '#fff5a8',
    }).setOrigin(0.5);
    this.add.text(392, 594, this.experiment.hints.map((hint) => `• ${hint}`).join('\n'), {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '15px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 3,
      wordWrap: { width: 286 },
    }).setOrigin(0.5);
  }

  createReagents() {
    this.add.text(42, 252, '2. Pick Fictional Ingredients', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '24px', color: '#ffffff' });
    reagents.forEach((reagent, index) => {
      const x = 80 + (index % 3) * 142;
      const y = 334 + Math.floor(index / 3) * 110;
      const bottle = this.add.container(x, y);
      const bottleArt = this.add.image(0, -6, reagent.artKey).setDisplaySize(82, 98);
      const label = this.add.text(0, 52, reagent.name, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '15px', color: '#ffffff', align: 'center' }).setOrigin(0.5);
      bottle.add([bottleArt, label]);
      bottle.setSize(94, 90).setInteractive({ draggable: true, useHandCursor: true });
      bottle.setData('reagentId', reagent.id);
      bottle.setData('home', { x, y });
      bottle.on('pointerover', () => this.tooltip.show(x + 95, y - 36, `${reagent.concept}: ${reagent.clue}`));
      bottle.on('pointerout', () => this.tooltip.hide());
      this.input.setDraggable(bottle);
    });

    this.input.on('drag', (_pointer, gameObject, dragX, dragY) => gameObject.setPosition(dragX, dragY));
    this.input.on('dragend', (_pointer, gameObject, dropped) => {
      if (!dropped) {
        const home = gameObject.getData('home');
        this.tweens.add({ targets: gameObject, x: home.x, y: home.y, duration: 220, ease: 'Back.Out' });
      }
    });
  }

  createToolButtons() {
    this.add.text(586, 244, '3. Lab Tools', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '24px', color: '#ffffff' });
    const tools = Object.entries(ACTION_DETAILS).map(([key, detail]) => [key, `${detail.icon} ${detail.label}`]);
    this.add.text(646, 268, 'Tools change cause and effect.', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '14px', color: '#fff5a8' }).setOrigin(0.5);
    this.toolButtons = new Map();
    tools.forEach(([key, label], index) => {
      const button = new Button(this, 622, 306 + index * 46, label, () => this.useTool(key), { width: 134, height: 36, fill: 0xb388ff, stroke: 0x4b2bbf, fontSize: '16px', color: '#ffffff' });
      this.toolButtons.set(key, button);
    });
  }

  addIngredient(gameObject) {
    const reagentId = gameObject.getData('reagentId');
    const home = gameObject.getData('home');
    this.tweens.add({ targets: gameObject, x: home.x, y: home.y, duration: 240, ease: 'Back.Out' });
    const reagent = findReagent(reagentId);
    const added = this.inventory.add(reagentId);
    if (!added) {
      this.dialogue.say(`${reagent.name} is already in the flask. Try a different ingredient or mix your prediction!`);
      return;
    }
    this.playPour(reagent);
    this.liquid.setFillStyle(reagent.color, 0.62);
    this.danger.add(12);
    this.meter.setValue(this.danger.value, this.danger.label());
    this.spawnBubbles(6, reagent.color);
    this.dialogue.say(`${reagent.name} added. Observe: ${reagent.clue}`);
    this.updateNotebook();
    this.updateMixButton();
  }


  playPour(reagent) {
    const stream = this.add.rectangle(392, 270, 12, 0, reagent.color, 0.78).setOrigin(0.5, 0);
    const drop = this.add.circle(392, 270, 10, reagent.color, 0.86);
    this.tweens.add({ targets: stream, displayHeight: 118, duration: 180, yoyo: true, ease: 'Sine.InOut', onComplete: () => stream.destroy() });
    this.tweens.add({ targets: drop, y: 410, scale: 0.25, alpha: 0.35, duration: 360, ease: 'Sine.In', onComplete: () => drop.destroy() });
    this.tweens.add({ targets: this.flask, angle: 2, duration: 90, yoyo: true, repeat: 1, onComplete: () => this.flask.setAngle(0) });
  }

  useTool(key) {
    const detail = ACTION_DETAILS[key];
    this.actions[key] = true;
    this.danger.add(key === 'sealed' || key === 'heated' ? 18 : 8);
    this.meter.setValue(this.danger.value, this.danger.label());
    this.cameras.main.shake(90, key === 'shaken' ? 0.01 : 0.004);
    this.toolButtons.get(key)?.back.setFillStyle(0xa8ffb0);
    this.toolButtons.get(key)?.text.setColor('#173f20');
    this.playToolEffect(key);
    this.dialogue.say(`${detail.label} used. ${detail.note}`);
    this.updateNotebook();
  }

  updateNotebook() {
    this.notebook.update({
      prediction: this.predictions.currentPrediction,
      ingredients: this.inventory.selected.map((id) => findReagent(id).name),
      actions: Object.entries(this.actions).filter(([, used]) => used).map(([key]) => actionLabel(key)),
      toolHint: this.experiment.actionHint,
      observations: this.experiment.hints,
    });
  }

  updateMixButton() {
    this.mixButton.setEnabled(Boolean(this.predictions.currentPrediction) && this.inventory.selected.length > 0);
  }

  resetFlask() {
    this.inventory.clear();
    this.actions = { stirred: false, heated: false, cooled: false, sealed: false, shaken: false };
    this.danger = new DangerMeter();
    this.liquid.setFillStyle(0x83d8ff, 0.65);
    this.meter.setValue(this.danger.value, this.danger.label());
    this.toolEffectSprites.forEach((sprite) => sprite.destroy());
    this.toolEffectSprites = [];
    this.toolButtons.forEach((button) => {
      button.back.setFillStyle(0xb388ff);
      button.text.setColor('#ffffff');
    });
    this.dialogue.say('Flask reset. Make a prediction, choose ingredients, try tools, and observe again.');
    this.updateNotebook();
    this.updateMixButton();
  }

  mix() {
    const outcome = this.engine.resolve(this.experiment, this.inventory.selected, this.actions);
    const predictionMatched = this.predictions.matchesOutcome(outcome);
    this.playOutcome(outcome);
    new BadgeSystem().award(outcome.badge);
    this.time.delayedCall(2300, () => this.scene.start('ResultsScene', {
      experimentId: this.experiment.id,
      outcome,
      prediction: this.predictions.currentPrediction,
      predictionMatched,
      selectedIngredientIds: this.inventory.selected,
      actions: this.actions,
    }));
  }

  spawnBubbles(count, tint = 0x9de8ff) {
    for (let i = 0; i < count; i += 1) {
      const bubble = this.physics.add.image(392 + Phaser.Math.Between(-42, 42), 448, 'bubble').setTint(tint).setScale(Phaser.Math.FloatBetween(0.35, 0.75));
      bubble.body.setAllowGravity(false);
      this.tweens.add({ targets: bubble, y: 262 + Phaser.Math.Between(-20, 20), x: bubble.x + Phaser.Math.Between(-28, 28), alpha: 0, duration: 1000, onComplete: () => bubble.destroy() });
    }
  }

  playOutcome(outcome) {
    this.mixButton.setEnabled(false);
    this.dialogue.say(outcome.title);
    this.cameras.main.shake(260, outcome.kind === 'success' ? 0.008 : 0.018);
    if (outcome.effect === 'foam') this.foamEruption();
    if (outcome.effect === 'rainbow') this.rainbowSludge();
    if (outcome.effect === 'crystal') this.crystalJam();
    if (outcome.effect === 'cork') this.corkRocket();
    if (outcome.effect === 'soot') this.sootBlast();
    if (outcome.effect === 'slime') this.slimeEscape();
    if (outcome.effect === 'duck') this.duckPortal();
    if (outcome.effect === 'layers') this.layerLagoon();
    if (outcome.effect === 'swirl') this.speedySwirls();
  }

  playToolEffect(key) {
    if (key === 'stirred') this.stirEffect();
    if (key === 'heated') this.heatEffect();
    if (key === 'cooled') this.coolEffect();
    if (key === 'sealed') this.sealEffect();
    if (key === 'shaken') this.shakeEffect();
  }

  rememberEffect(sprite, lifetime = 1200) {
    this.toolEffectSprites.push(sprite);
    this.time.delayedCall(lifetime, () => {
      sprite.destroy();
      this.toolEffectSprites = this.toolEffectSprites.filter((item) => item !== sprite);
    });
    return sprite;
  }

  stirEffect() {
    const spoon = this.rememberEffect(this.add.text(392, 342, '🥄', { fontSize: '54px' }).setOrigin(0.5).setAngle(-38), 900);
    this.tweens.add({ targets: spoon, angle: 322, duration: 650, ease: 'Sine.InOut' });
    this.spawnBubbles(10, 0xd8fbff);
  }

  heatEffect() {
    [-24, 0, 24].forEach((offset, index) => {
      const flame = this.rememberEffect(this.add.text(392 + offset, 500, '🔥', { fontSize: '34px' }).setOrigin(0.5), 1100);
      this.tweens.add({ targets: flame, y: 488, scale: 1.25, duration: 260 + index * 70, yoyo: true, repeat: 2 });
    });
    this.liquid.setFillStyle(0xffd166, 0.72);
    this.spawnBubbles(12, 0xfff176);
  }

  coolEffect() {
    for (let i = 0; i < 8; i += 1) {
      const flake = this.rememberEffect(this.add.text(334 + i * 16, 276 + Phaser.Math.Between(-16, 10), '❄️', { fontSize: '24px' }).setOrigin(0.5), 1300);
      this.tweens.add({ targets: flake, y: flake.y + 82, alpha: 0.2, duration: 1000, ease: 'Sine.In' });
    }
    this.liquid.setFillStyle(0x72d6ff, 0.65);
  }

  sealEffect() {
    const cork = this.rememberEffect(this.add.image(392, 270, 'cork').setAngle(-4), 1600);
    const ring = this.rememberEffect(this.add.circle(392, 336, 48, 0xffd166, 0.14).setStrokeStyle(4, 0xffd166), 900);
    this.tweens.add({ targets: cork, y: 292, duration: 260, ease: 'Bounce.Out' });
    this.tweens.add({ targets: ring, radius: 86, alpha: 0, duration: 820 });
  }

  shakeEffect() {
    this.tweens.add({ targets: this.flask, x: 380, angle: -5, duration: 80, yoyo: true, repeat: 5, onComplete: () => this.flask.setPosition(392, 386).setAngle(0) });
    this.spawnBubbles(16, 0xffffff);
  }

  foamEruption() {
    for (let i = 0; i < 34; i += 1) this.spawnFlying('foam', 392, 345, 0xffffff);
  }

  rainbowSludge() {
    [0xff4d6d, 0xffd166, 0x72d6ff, 0xb388ff, 0xa8ffb0].forEach((color, index) => {
      this.time.delayedCall(index * 140, () => {
        this.liquid.setFillStyle(color, 0.72);
        this.spawnBubbles(8, color);
      });
    });
  }

  crystalJam() {
    for (let i = 0; i < 16; i += 1) this.spawnFlying('crystal', 392, 405, 0xffffff, -260);
  }

  corkRocket() {
    const cork = this.physics.add.image(392, 270, 'cork');
    cork.setVelocity(Phaser.Math.Between(-160, 160), -520).setAngularVelocity(540).setBounce(0.8).setCollideWorldBounds(true);
  }

  sootBlast() {
    for (let i = 0; i < 22; i += 1) this.spawnFlying('soot', 392, 336, 0xffffff, -180);
  }

  slimeEscape() {
    for (let i = 0; i < 10; i += 1) this.spawnFlying('slime', 392, 428, 0xffffff, -80);
  }

  duckPortal() {
    const portal = this.add.circle(392, 340, 18, 0xb388ff, 0.7).setStrokeStyle(6, 0x9de8ff);
    const duck = this.add.text(392, 340, '🦆', { fontSize: '60px' }).setOrigin(0.5).setScale(0);
    this.tweens.add({ targets: portal, radius: 92, angle: 360, duration: 900, yoyo: true, repeat: 1 });
    this.tweens.add({ targets: duck, scale: 1.4, angle: 12, duration: 700, ease: 'Back.Out' });
  }

  layerLagoon() {
    const colors = [0x67f2c4, 0xb4ff7a, 0xd8fbff];
    colors.forEach((color, index) => {
      const layer = this.add.rectangle(392, 462 - index * 24, 104, 22, color, 0.72).setOrigin(0.5);
      this.tweens.add({ targets: layer, x: 392 + Phaser.Math.Between(-8, 8), duration: 700, yoyo: true, repeat: 2 });
    });
    this.spawnBubbles(12, 0xb4ff7a);
  }

  speedySwirls() {
    const swirlColors = [0xfff176, 0xb4ff7a, 0xffffff];
    for (let i = 0; i < 18; i += 1) {
      this.time.delayedCall(i * 45, () => this.spawnFlying('bubble', 392, 420, swirlColors[i % swirlColors.length], -260));
    }
    this.tweens.add({ targets: this.liquid, angle: 6, duration: 100, yoyo: true, repeat: 8 });
  }

  spawnFlying(texture, x, y, tint, yVelocity = -360) {
    const sprite = this.physics.add.image(x + Phaser.Math.Between(-35, 35), y + Phaser.Math.Between(-20, 20), texture).setTint(tint).setScale(Phaser.Math.FloatBetween(0.55, 1.2));
    sprite.setVelocity(Phaser.Math.Between(-220, 220), yVelocity + Phaser.Math.Between(-80, 80)).setAngularVelocity(Phaser.Math.Between(-360, 360)).setBounce(0.7).setCollideWorldBounds(true);
    this.time.delayedCall(1800, () => sprite.destroy());
  }
}
