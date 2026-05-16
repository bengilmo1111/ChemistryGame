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
  }

  create() {
    this.cameras.main.setBackgroundColor('#232a62');
    this.physics.world.setBounds(0, 0, 1024, 640);
    this.addLabBench();
    this.dialogue = new DialogueSystem(this, 380, 76, 650);
    this.dialogue.say(this.experiment.prompt);
    this.notebook = new LabNotebook(this, 858, 238);
    this.meter = new Meter(this, 858, 478, 'Chaos Meter');
    this.tooltip = new Tooltip(this);
    this.createPredictionButtons();
    this.createFlask();
    this.createReagents();
    this.createToolButtons();
    this.mixButton = new Button(this, 858, 570, 'Mix!', () => this.mix(), { width: 180, fill: 0xffd166 });
    this.mixButton.setEnabled(false);
    new Button(this, 92, 44, 'Cards', () => this.scene.start('LevelSelectScene'), { width: 136, height: 44, fill: 0xff8bd1, stroke: 0x7e2453, fontSize: '18px' });
    this.updateNotebook();
  }

  addLabBench() {
    this.add.rectangle(512, 566, 1024, 148, 0x6d421c);
    this.add.rectangle(512, 506, 1024, 34, 0xc28b48);
    this.add.text(512, 30, this.experiment.title, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '30px',
      color: '#fff5a8',
    }).setOrigin(0.5);
  }

  createPredictionButtons() {
    this.add.text(42, 122, '1. Predict', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '24px', color: '#ffffff' });
    predictions.forEach((prediction, index) => {
      const button = new Button(this, 128 + index * 154, 174, `${prediction.icon} ${prediction.label}`, () => {
        this.predictions.choose(prediction.id);
        this.dialogue.say(`Prediction saved: ${prediction.label}. Now drag ingredients into the flask.`);
        this.updateNotebook();
        this.updateMixButton();
      }, { width: 144, height: 48, fill: 0x9de8ff, stroke: 0x235b72, fontSize: '15px' });
      button.container.setDepth(4);
    });
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

  createReagents() {
    this.add.text(42, 244, '2. Pick Fictional Ingredients', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '24px', color: '#ffffff' });
    reagents.forEach((reagent, index) => {
      const x = 80 + (index % 3) * 142;
      const y = 326 + Math.floor(index / 3) * 110;
      const bottle = this.add.container(x, y);
      const shape = this.add.rectangle(0, 0, 94, 70, reagent.color).setStrokeStyle(4, 0xffffff);
      const icon = this.add.text(0, -8, reagent.icon, { fontSize: '28px', color: '#273469' }).setOrigin(0.5);
      const label = this.add.text(0, 48, reagent.name, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '15px', color: '#ffffff', align: 'center' }).setOrigin(0.5);
      bottle.add([shape, icon, label]);
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
    const tools = [
      ['stirred', 'Stir', 0],
      ['heated', 'Warm', 1],
      ['cooled', 'Cool', 2],
      ['sealed', 'Seal', 3],
      ['shaken', 'Shake', 4],
    ];
    tools.forEach(([key, label], index) => {
      new Button(this, 622, 300 + index * 48, label, () => this.useTool(key, label), { width: 120, height: 38, fill: 0xb388ff, stroke: 0x4b2bbf, fontSize: '17px', color: '#ffffff' });
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
    this.liquid.setFillStyle(reagent.color, 0.62);
    this.danger.add(12);
    this.meter.setValue(this.danger.value, this.danger.label());
    this.spawnBubbles(6, reagent.color);
    this.dialogue.say(`${reagent.name} added. Observe: ${reagent.clue}`);
    this.updateNotebook();
    this.updateMixButton();
  }

  useTool(key, label) {
    this.actions[key] = true;
    this.danger.add(key === 'sealed' || key === 'heated' ? 18 : 8);
    this.meter.setValue(this.danger.value, this.danger.label());
    this.cameras.main.shake(90, key === 'shaken' ? 0.01 : 0.004);
    this.dialogue.say(`${label} used. Tools can change reaction speed, temperature, pressure, or motion.`);
    this.updateNotebook();
  }

  updateNotebook() {
    this.notebook.update({
      prediction: this.predictions.currentPrediction,
      ingredients: this.inventory.selected.map((id) => findReagent(id).name),
      actions: Object.entries(this.actions).filter(([, used]) => used).map(([key]) => key),
    });
  }

  updateMixButton() {
    this.mixButton.setEnabled(Boolean(this.predictions.currentPrediction) && this.inventory.selected.length > 0);
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

  spawnFlying(texture, x, y, tint, yVelocity = -360) {
    const sprite = this.physics.add.image(x + Phaser.Math.Between(-35, 35), y + Phaser.Math.Between(-20, 20), texture).setTint(tint).setScale(Phaser.Math.FloatBetween(0.55, 1.2));
    sprite.setVelocity(Phaser.Math.Between(-220, 220), yVelocity + Phaser.Math.Between(-80, 80)).setAngularVelocity(Phaser.Math.Between(-360, 360)).setBounce(0.7).setCollideWorldBounds(true);
    this.time.delayedCall(1800, () => sprite.destroy());
  }
}
