import Phaser from 'phaser';
import { getMode } from '../data/modes.js';
import BadgeSystem from '../systems/BadgeSystem.js';
import DangerMeter from '../systems/DangerMeter.js';
import DialogueSystem from '../systems/DialogueSystem.js';
import LabInventory from '../systems/LabInventory.js';
import PredictionSystem, { predictions } from '../systems/PredictionSystem.js';
import ReactionEngine from '../systems/ReactionEngine.js';
import DiscoverySystem from '../systems/DiscoverySystem.js';
import Button from '../ui/Button.js';
import LabNotebook from '../ui/LabNotebook.js';
import Meter from '../ui/Meter.js';
import Tooltip from '../ui/Tooltip.js';
import { confettiBurst } from '../ui/effects.js';

const ACTION_DETAILS = {
  stirred: { label: 'Stir', note: 'The spoon spreads ingredients through the flask.', icon: '🥄' },
  heated: { label: 'Warm', note: 'Warmth makes pretend particles wiggle faster.', icon: '🔥' },
  cooled: { label: 'Cool', note: 'Cooling slows motion so patterns and layers can settle.', icon: '❄️' },
  sealed: { label: 'Seal', note: 'A cork traps pretend gas, so pressure can build.', icon: '🧱' },
  shaken: { label: 'Shake', note: 'Gentle shaking gives mixtures more motion.', icon: '🌀' },
};

const SANDBOX_EXPERIMENT = {
  id: 'sandbox',
  title: '🧪 MAD MIX — Sandbox Lab',
  goal: 'Mix anything! Secret recipes are hiding in here.',
  prompt: 'Drop in any ingredients and try any tools — secret recipes are hiding!',
  required: [],
  requiredActions: [],
  actionHint: 'Open the Recipe Book for secret clues.',
  hints: ['Secret recipes hide here — check the Recipe Book!', 'Tools change the result — try Seal for booms!'],
  vocabulary: ['particles', 'bubbles', 'gas'],
};

const HERO_QUIP_CHANCE = 0.3;

const SPLASH_WORDS = {
  foam: { word: 'WHOOOSH!', color: '#ffffff' },
  rainbow: { word: 'KAPOW!', color: '#ff8bd1' },
  crystal: { word: 'SHAZAM!', color: '#9de8ff' },
  layers: { word: 'PLOP!', color: '#67f2c4' },
  pop: { word: 'BA-BOOM!', color: '#ffd166' },
  swirl: { word: 'ZOOM!', color: '#fff176' },
  cork: { word: 'BOING!', color: '#ffd166' },
  soot: { word: 'POOF!', color: '#888888' },
  slime: { word: 'BLERG!', color: '#67f2c4' },
  duck: { word: 'QUACK?!', color: '#fff176' },
  lava: { word: 'BLORP!', color: '#ff9e54' },
  galaxy: { word: 'WHOA!', color: '#b388ff' },
  disco: { word: 'GROOVY!', color: '#ff8bd1' },
  blob: { word: 'BOING!', color: '#a8ffb0' },
  dragon: { word: 'ACHOO!', color: '#b4ff7a' },
  snow: { word: 'BRRRR!', color: '#d8fbff' },
  tornado: { word: 'WHIRRRL!', color: '#fff176' },
  burp: { word: 'BUUURP!', color: '#b4ff7a' },
};

function actionLabel(action) {
  return ACTION_DETAILS[action]?.label ?? action;
}

function makeSandboxExperiment(secretReactions, labels) {
  const formatSecretCount = (text) => text?.replace('{secretCount}', secretReactions.length);
  return {
    ...SANDBOX_EXPERIMENT,
    title: labels?.sandboxTitle ?? labels?.sandbox ?? SANDBOX_EXPERIMENT.title,
    goal: formatSecretCount(labels?.sandboxGoal) ?? `Mix anything! ${secretReactions.length} secret recipes are hiding in here.`,
    prompt: labels?.sandboxPrompt ?? SANDBOX_EXPERIMENT.prompt,
  };
}

function findExperiment(id, experiments, sandboxExperiment) {
  if (id === 'sandbox') return sandboxExperiment;
  return experiments.find((experiment) => experiment.id === id) ?? experiments[0];
}

export default class LabScene extends Phaser.Scene {
  constructor() {
    super('LabScene');
  }

  init(data = {}) {
    this.modeId = data.modeId ?? 'henry';
    this.mode = getMode(this.modeId);
    this.hero = this.mode.hero;
    this.experiments = this.mode.experiments;
    this.reagents = this.mode.reagents;
    this.reactionOutcomes = this.mode.reactionOutcomes;
    this.secretReactions = this.mode.secretReactions;
    this.failures = this.mode.failures ?? this.mode.funnyFailures;
    this.safetyText = this.mode.safetyText;
    this.modeColors = this.mode.colors;
    this.modeLabels = this.mode.labels;
    this.findReagent = this.mode.findReagent ?? ((id) => this.reagents.find((reagent) => reagent.id === id));
    this.sandboxExperiment = makeSandboxExperiment(this.secretReactions, this.modeLabels);
    this.experiment = findExperiment(data.experimentId, this.experiments, this.sandboxExperiment);
    this.isSandbox = this.experiment.id === 'sandbox';
    this.inventory = new LabInventory(this.reagents);
    this.predictions = new PredictionSystem();
    this.engine = new ReactionEngine({
      reactionOutcomes: this.reactionOutcomes,
      secretReactions: this.secretReactions,
      failures: this.failures,
      safetyCopy: this.safetyText,
    });
    this.danger = new DangerMeter();
    this.actions = { stirred: false, heated: false, cooled: false, sealed: false, shaken: false };
    this.toolEffectSprites = [];
    this.predictionButtons = new Map();
    this.mixCount = 0;
    this.labPanicTriggered = false;
    this.sfx = this.registry.get('sfx');
    this.scoreSystem = this.registry.get('score');
    this.discoveries = new DiscoverySystem();
    this.recipeBook = null;
    this.isMixing = false;
  }

  secretsFound() {
    const found = this.discoveries.getForExperiment('sandbox', this.modeId);
    return this.secretReactions.filter((secret) => found.includes(secret.id)).length;
  }

  create() {
    this.cameras.main.setBackgroundColor(this.isSandbox ? this.modeColors.sandboxBackground : this.modeColors.labBackground);
    this.physics.world.setBounds(0, 0, 1024, 640);
    this.addLabBench();
    this.dialogue = new DialogueSystem(this, 380, 80, 650, 56);
    const greet = this.isSandbox
      ? `${this.hero.shortName}, ${this.experiment.prompt}`
      : `${this.hero.shortName}, ${this.experiment.prompt}`;
    this.dialogue.say(greet);
    this.notebook = new LabNotebook(this, 858, 250, { modeId: this.modeId, labels: this.modeLabels });
    this.meter = new Meter(this, 858, 422, this.modeLabels.meterLabel);
    this.tooltip = new Tooltip(this);
    this.createPredictionButtons();
    this.createLabCard();
    this.createFlask();
    this.createObservationClues();
    this.createBenchToys();
    this.createReagents();
    this.createToolButtons();
    this.createScoreHud();
    this.mixButton = new Button(this, 858, 570, this.modeLabels.mixButton, () => this.mix(), { width: 180, height: 58, fill: 0xffd166, fontSize: '26px' });
    this.mixButton.setEnabled(false);
    this.resetButton = new Button(this, 666, 570, 'Reset Flask', () => this.resetFlask(), { width: 170, height: 46, fill: 0xffffff, stroke: 0x273469, fontSize: '18px', color: '#273469' });
    new Button(this, 92, 44, this.isSandbox ? 'Menu' : 'Cards', () => this.scene.start(this.isSandbox ? 'MenuScene' : 'LevelSelectScene', { modeId: this.modeId }), { width: 136, height: 44, fill: 0xff8bd1, stroke: 0x7e2453, fontSize: '18px' });
    if (this.isSandbox) {
      new Button(this, 666, 512, '📖 Recipe Book', () => this.toggleRecipeBook(), { width: 170, height: 42, fill: 0xfff7d6, stroke: 0x8a5a24, fontSize: '16px', color: '#4b2f10' });
    }
    this.updateNotebook();
  }

  addLabBench() {
    this.add.image(512, 320, 'art-lab-bench').setDisplaySize(1024, 640);
    this.add.text(512, 28, this.experiment.title, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '26px',
      color: this.isSandbox ? '#a8ffb0' : this.modeColors.accent,
    }).setOrigin(0.5);
  }


  createBenchToys() {
    const toys = [
      {
        x: 510,
        y: 520,
        emoji: '🦆',
        label: 'bench duck',
        sound: 'pop',
        line: 'Bench duck says: “Quackademics are important!”',
        tween: { angle: 18, y: 508, scale: 1.28, duration: 130, yoyo: true, repeat: 2, ease: 'Sine.InOut' },
      },
      {
        x: 724,
        y: 214,
        emoji: '🚀',
        label: 'cork rocket',
        sound: 'rocket',
        line: 'Tiny cork rocket requests clearance for launch-ish!',
        tween: { y: 168, angle: 28, scale: 1.22, duration: 260, yoyo: true, ease: 'Back.Out' },
      },
      {
        x: 712,
        y: 466,
        emoji: '🫧',
        label: 'bubble popper',
        sound: 'bubble',
        line: 'Bubble popper reports: “Bloop bloop. Very official.”',
        tween: { scale: 1.42, angle: -12, duration: 150, yoyo: true, repeat: 1, ease: 'Sine.InOut' },
      },
    ];

    toys.forEach((toy) => {
      const spot = this.add.circle(toy.x, toy.y, 28, 0xffffff, 0.12)
        .setStrokeStyle(2, 0xfff176, 0.42)
        .setDepth(3);
      const sprite = this.add.text(toy.x, toy.y, toy.emoji, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '34px',
      }).setOrigin(0.5).setDepth(4).setInteractive({ useHandCursor: true });
      sprite.setData('benchToy', toy.label);
      sprite.on('pointerdown', () => this.playBenchToy(toy, sprite, spot));
    });
  }

  playBenchToy(toy, sprite, spot) {
    this.sfx?.resume();
    this.sfx?.[toy.sound]?.();
    this.dialogue.say(toy.line);
    this.tweens.killTweensOf(sprite);
    this.tweens.killTweensOf(spot);
    sprite.setPosition(toy.x, toy.y).setScale(1).setAngle(0).setAlpha(1);
    spot.setScale(1).setAlpha(0.7);
    this.tweens.add({ targets: sprite, ...toy.tween, onComplete: () => sprite.setPosition(toy.x, toy.y).setScale(1).setAngle(0) });
    this.tweens.add({ targets: spot, scale: 1.45, alpha: 0, duration: 360, ease: 'Sine.Out', onComplete: () => spot.setScale(1).setAlpha(0.7) });
  }

  createPredictionButtons() {
    this.add.text(42, 124, this.modeLabels.predictionLabel, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '18px', color: '#ffffff' });
    predictions.forEach((prediction, index) => {
      const x = 88 + (index % 4) * 104;
      const y = 162 + Math.floor(index / 4) * 44;
      const button = new Button(this, x, y, `${prediction.icon} ${prediction.label}`, () => {
        this.predictions.choose(prediction.id);
        this.highlightPrediction(prediction.id);
        this.dialogue.say(`${this.hero.shortName}'s prediction: ${prediction.label}. Drag or tap ingredients into the flask.`);
        this.updateNotebook();
        this.updateMixButton();
      }, { width: 98, height: 38, fill: 0x9de8ff, stroke: 0x235b72, fontSize: '11px' });
      button.container.setDepth(4);
      this.predictionButtons.set(prediction.id, button);
    });
  }

  highlightPrediction(predictionId) {
    this.predictionButtons.forEach((button, id) => {
      const selected = id === predictionId;
      button.back.setFillStyle(selected ? 0xa8ffb0 : 0x9de8ff);
      button.text.setColor(selected ? '#173f20' : '#3a2600');
      button.container.setScale(selected ? 1.04 : 1);
    });
  }

  createLabCard() {
    this.add.rectangle(858, 88, 280, 96, 0xfff7d6, 0.96).setStrokeStyle(4, 0x8a5a24);
    this.add.text(858, 64, `Goal: ${this.experiment.goal}`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '12px',
      color: '#4b2f10',
      align: 'center',
      lineSpacing: 2,
      wordWrap: { width: 254 },
    }).setOrigin(0.5);
    const clueText = this.isSandbox
      ? `🕵️ Secrets found: ${this.secretsFound()}/${this.secretReactions.length} — open the Recipe Book!`
      : `Tool clue: ${this.experiment.actionHint}`;
    this.labCardClue = this.add.text(858, 110, clueText, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '11px',
      color: '#273469',
      align: 'center',
      lineSpacing: 2,
      wordWrap: { width: 254 },
    }).setOrigin(0.5);
  }

  refreshSecretCounter() {
    if (!this.isSandbox || !this.labCardClue) return;
    this.labCardClue.setText(`🕵️ Secrets found: ${this.secretsFound()}/${this.secretReactions.length} — open the Recipe Book!`);
  }

  toggleRecipeBook() {
    if (this.recipeBook) {
      this.closeRecipeBook();
    } else {
      this.openRecipeBook();
    }
  }

  closeRecipeBook() {
    this.recipeBook?.destroy();
    this.recipeBook = null;
  }

  openRecipeBook() {
    const found = this.discoveries.getForExperiment('sandbox', this.modeId);
    this.recipeBook = this.add.container(512, 320).setDepth(60);
    const backdrop = this.add.rectangle(0, 0, 1024, 640, 0x11152f, 0.55).setInteractive();
    backdrop.on('pointerdown', () => this.closeRecipeBook());
    const page = this.add.rectangle(0, 0, 660, 480, 0xfff7d6, 0.98).setStrokeStyle(6, 0x8a5a24);
    page.setInteractive();
    const title = this.add.text(0, -210, `📖 Secret Recipe Book — ${this.secretsFound()}/${this.secretReactions.length} found`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '22px',
      color: '#4b2f10',
    }).setOrigin(0.5);
    this.recipeBook.add([backdrop, page, title]);
    this.secretReactions.forEach((secret, index) => {
      const y = -158 + index * 58;
      const isFound = found.includes(secret.id);
      const recipe = `${secret.ingredients.map((id) => this.findReagent(id).name).join(' + ')} + ${secret.requiredActions.map(actionLabel).join(' + ')}`;
      const heading = isFound ? `✅ ${secret.title}` : '❓ ??? Mystery Recipe';
      const detail = isFound ? recipe : `Hint: ${secret.hint}`;
      this.recipeBook.add(this.add.text(-300, y, heading, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '17px',
        color: isFound ? '#2f7d38' : '#7e2453',
      }).setOrigin(0, 0.5));
      this.recipeBook.add(this.add.text(-300, y + 22, detail, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '13px',
        color: '#273469',
        wordWrap: { width: 600 },
      }).setOrigin(0, 0.5));
    });
    const closeButton = new Button(this, 0, 212, 'Back to mixing!', () => this.closeRecipeBook(), { width: 220, height: 42, fill: 0xffd166, stroke: 0x8a5a24, fontSize: '17px' });
    this.recipeBook.add(closeButton.container);
  }

  createScoreHud() {
    if (!this.scoreSystem) return;
    this.scoreText = this.add.text(252, 44, this.scoreHudText(), {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '16px',
      color: '#fff176',
      stroke: '#11152f',
      strokeThickness: 4,
    }).setOrigin(0, 0.5).setDepth(20);
  }

  scoreHudText() {
    if (!this.scoreSystem) return '';
    const streakFlame = this.scoreSystem.streak >= 2 ? ` 🔥x${this.scoreSystem.streak}` : '';
    return `⭐ ${this.scoreSystem.score}${streakFlame}`;
  }

  refreshScoreHud(gainedAmount = 0) {
    if (!this.scoreText) return;
    this.scoreText.setText(this.scoreHudText());
    if (gainedAmount > 0) {
      const popup = this.add.text(this.scoreText.x + 8, this.scoreText.y - 8, `+${gainedAmount}`, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '20px',
        color: '#a8ffb0',
        stroke: '#11152f',
        strokeThickness: 4,
      }).setDepth(21);
      this.tweens.add({ targets: popup, y: popup.y - 36, alpha: 0, duration: 900, ease: 'Sine.Out', onComplete: () => popup.destroy() });
    }
  }

  createFlask() {
    this.dropGlow = this.add.ellipse(392, 386, 210, 250, 0xfff176, 0.12).setStrokeStyle(4, 0xfff176, 0.8).setVisible(false);
    this.flask = this.add.container(392, 386);
    const glass = this.add.graphics();
    glass.fillStyle(0xffffff, 0.18).fillRoundedRect(-66, -100, 132, 180, 30);
    glass.lineStyle(6, 0xd8fbff, 0.95).strokeRoundedRect(-66, -100, 132, 180, 30);
    glass.fillStyle(0x83d8ff, 0.45).fillRoundedRect(-50, 8, 100, 64, 24);
    this.liquid = this.add.rectangle(0, 40, 100, 64, 0x83d8ff, 0.65);
    this.flask.add([glass, this.liquid]);
    this.createFlaskFace();
    this.dropZone = this.add.zone(392, 386, 160, 200).setRectangleDropZone(160, 200);
    this.add.text(392, 478, 'Drop or tap ingredients here', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '13px', color: '#ffffff' }).setOrigin(0.5);
    this.input.on('drop', (_pointer, gameObject) => this.addIngredient(gameObject));
    this.time.addEvent({ delay: 850, loop: true, callback: () => this.ambientBubble() });
    this.time.addEvent({ delay: 3400, loop: true, callback: () => this.blink() });
  }

  createFlaskFace() {
    this.eyes = [];
    [-24, 24].forEach((offsetX) => {
      const white = this.add.ellipse(offsetX, -52, 28, 32, 0xffffff, 0.95).setStrokeStyle(3, 0x273469, 0.55);
      const pupil = this.add.circle(offsetX, -52, 7, 0x273469);
      this.flask.add([white, pupil]);
      this.eyes.push({ white, pupil, baseX: offsetX, baseY: -52 });
    });
    this.mouth = this.add.graphics();
    this.flask.add(this.mouth);
    this.faceMood = null;
    this.setFaceMood();
  }

  drawMouth(mood) {
    this.mouth.clear();
    this.mouth.lineStyle(4, 0x273469, 0.75);
    if (mood === 'happy') {
      this.mouth.beginPath();
      this.mouth.arc(0, -28, 13, Phaser.Math.DegToRad(25), Phaser.Math.DegToRad(155), false);
      this.mouth.strokePath();
    } else if (mood === 'flat') {
      this.mouth.lineBetween(-11, -20, 11, -20);
    } else {
      this.mouth.strokeCircle(0, -19, 7);
    }
  }

  setFaceMood() {
    const label = this.danger.label();
    const mood = label === 'Curious' ? 'happy' : label === 'Wobbly' ? 'flat' : 'worried';
    if (mood === this.faceMood) return;
    this.faceMood = mood;
    this.drawMouth(mood);
    if (mood === 'worried') {
      const sweat = this.add.text(this.flask.x + 48, this.flask.y - 92, '💧', { fontSize: '22px' }).setOrigin(0.5).setDepth(8);
      this.tweens.add({ targets: sweat, y: sweat.y + 28, alpha: 0, duration: 850, repeat: 2, onComplete: () => sweat.destroy() });
    }
  }

  blink() {
    this.eyes?.forEach(({ white, pupil }) => {
      this.tweens.add({ targets: [white, pupil], scaleY: 0.12, duration: 70, yoyo: true });
    });
  }

  update() {
    if (!this.eyes?.length) return;
    const pointer = this.input.activePointer;
    this.eyes.forEach(({ pupil, baseX, baseY }) => {
      const eyeX = this.flask.x + baseX;
      const eyeY = this.flask.y + baseY;
      const angle = Math.atan2(pointer.worldY - eyeY, pointer.worldX - eyeX);
      const reach = Math.min(5, Phaser.Math.Distance.Between(pointer.worldX, pointer.worldY, eyeX, eyeY) * 0.05);
      pupil.x = baseX + Math.cos(angle) * reach;
      pupil.y = baseY + Math.sin(angle) * reach;
    });
  }

  ambientBubble() {
    if (!this.inventory.selected.length) return;
    const bubble = this.add.image(392 + Phaser.Math.Between(-34, 34), 442, 'bubble').setScale(0.22).setAlpha(0.65);
    this.tweens.add({ targets: bubble, y: 392, alpha: 0, duration: 900, ease: 'Sine.Out', onComplete: () => bubble.destroy() });
  }

  updateLiquidLevel() {
    const level = Math.min(64 + this.inventory.selected.length * 11, 108);
    this.liquid.setSize(100, level);
    this.liquid.y = 72 - level / 2;
  }

  createObservationClues() {
    this.add.rectangle(392, 584, 320, 76, 0x15183a, 0.78).setStrokeStyle(3, 0x9de8ff);
    this.add.text(392, 556, this.isSandbox ? this.modeLabels.sandboxObservationHeading : this.modeLabels.observationHeading, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '16px',
      color: '#fff5a8',
    }).setOrigin(0.5);
    this.add.text(392, 590, this.experiment.hints.map((hint) => `• ${hint}`).join('\n'), {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 2,
      wordWrap: { width: 296 },
    }).setOrigin(0.5);
  }

  createReagents() {
    this.add.text(42, 242, this.modeLabels.labIngredients, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '20px', color: '#ffffff' });
    this.reagents.forEach((reagent, index) => {
      const x = 60 + (index % 3) * 100;
      const y = 322 + Math.floor(index / 3) * 92;
      const bottle = this.add.container(x, y);
      const bottleArt = this.add.image(0, -8, reagent.artKey).setDisplaySize(62, 74);
      const label = this.add.text(0, 34, reagent.name, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '12px', color: '#ffffff', align: 'center' }).setOrigin(0.5);
      bottle.add([bottleArt, label]);
      bottle.setSize(80, 82).setInteractive({ draggable: true, useHandCursor: true });
      bottle.setData('reagentId', reagent.id);
      bottle.setData('home', { x, y });
      bottle.on('pointerover', () => this.tooltip.show(x + 95, y - 36, `${reagent.concept}: ${reagent.clue}`));
      bottle.on('pointerout', () => this.tooltip.hide());
      bottle.on('pointerup', () => {
        const home = bottle.getData('home');
        const isTapAtHome = Phaser.Math.Distance.Between(bottle.x, bottle.y, home.x, home.y) < 8;
        if (isTapAtHome) this.addIngredientById(reagent.id, bottle);
      });
      this.input.setDraggable(bottle);
    });

    this.input.on('dragstart', (_pointer, gameObject) => {
      gameObject.setScale?.(1.18);
      this.dropGlow.setVisible(true).setAlpha(0.6);
      this.tweens.add({ targets: this.dropGlow, alpha: 1, scaleX: 1.06, scaleY: 1.06, duration: 360, yoyo: true, repeat: -1 });
    });
    this.input.on('drag', (_pointer, gameObject, dragX, dragY) => gameObject.setPosition(dragX, dragY));
    this.input.on('dragend', (_pointer, gameObject, dropped) => {
      gameObject.setScale?.(1);
      this.tweens.killTweensOf(this.dropGlow);
      this.dropGlow.setVisible(false).setScale(1);
      if (!dropped) {
        const home = gameObject.getData('home');
        this.tweens.add({ targets: gameObject, x: home.x, y: home.y, duration: 220, ease: 'Back.Out' });
      }
    });
  }

  createToolButtons() {
    this.add.text(564, 248, this.modeLabels.labTools, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '22px', color: '#ffffff' });
    const tools = Object.entries(ACTION_DETAILS).map(([key, detail]) => [key, `${detail.icon} ${detail.label}`]);
    this.add.text(622, 274, this.modeLabels.toolHint, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '13px', color: '#fff5a8' }).setOrigin(0.5);
    this.toolButtons = new Map();
    tools.forEach(([key, label], index) => {
      const button = new Button(this, 622, 304 + index * 38, label, () => this.useTool(key), { width: 130, height: 32, fill: 0xb388ff, stroke: 0x4b2bbf, fontSize: '15px', color: '#ffffff' });
      this.toolButtons.set(key, button);
    });
  }

  addIngredient(gameObject) {
    const reagentId = gameObject.getData('reagentId');
    const home = gameObject.getData('home');
    this.tweens.add({ targets: gameObject, x: home.x, y: home.y, duration: 240, ease: 'Back.Out' });
    this.addIngredientById(reagentId, gameObject);
  }

  addIngredientById(reagentId, sourceObject = null) {
    const reagent = this.findReagent(reagentId);
    const added = this.inventory.add(reagentId);
    if (!added) {
      this.dialogue.say(`${reagent.name} is already in the flask. Try a different ingredient or mix your prediction!`);
      return;
    }
    if (sourceObject) {
      this.tweens.add({ targets: sourceObject, scale: 1.12, duration: 90, yoyo: true, ease: 'Sine.InOut' });
    }
    this.sfx?.pour();
    this.time.delayedCall(180, () => this.sfx?.bubble());
    this.playPour(reagent);
    this.liquid.setFillStyle(reagent.color, 0.62);
    this.updateLiquidLevel();
    const previousDanger = this.danger.value;
    this.danger.add(12);
    this.meter.setValue(this.danger.value, this.danger.label());
    this.setFaceMood();
    const dangerQuipQueued = this.checkDangerThreshold(previousDanger, 'ingredient');
    this.spawnBubbles(8, reagent.color);
    this.dialogue.say(`${reagent.name} added. Observe: ${reagent.clue}`);
    if (!dangerQuipQueued) this.sayHeroQuip(this.isNearSuccess() ? 'nearSuccess' : 'ingredient');
    this.updateNotebook();
    this.updateMixButton();
  }


  isNearSuccess() {
    if (this.isSandbox) return false;
    const selected = new Set(this.inventory.selected);
    const hasAllIngredients = this.experiment.required.every((id) => selected.has(id));
    const hasAnyIngredient = this.experiment.required.some((id) => selected.has(id));
    const usedActions = this.experiment.requiredActions.filter((action) => this.actions[action]);
    const hasAllActions = usedActions.length === this.experiment.requiredActions.length;
    const missingSomething = !hasAllIngredients || !hasAllActions;

    return missingSomething && ((hasAllIngredients && this.experiment.requiredActions.length > 0) || (hasAnyIngredient && hasAllActions));
  }

  sayHeroQuip(type, { chance = HERO_QUIP_CHANCE, delay = 950 } = {}) {
    const pools = {
      ingredient: this.hero.ingredientQuips,
      tool: this.hero.toolQuips,
      danger: this.hero.dangerQuips,
      nearSuccess: this.hero.nearSuccessQuips,
    };
    const pool = pools[type];
    if (!pool?.length || Math.random() > chance) return false;

    this.time.delayedCall(delay, () => {
      this.dialogue.say(`${this.hero.shortName}: ${Phaser.Math.RND.pick(pool)}`);
    });
    return true;
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
    const previousDanger = this.danger.value;
    this.danger.add(key === 'sealed' || key === 'heated' ? 18 : 8);
    this.meter.setValue(this.danger.value, this.danger.label());
    this.setFaceMood();
    const dangerQuipQueued = this.checkDangerThreshold(previousDanger, 'tool');
    this.cameras.main.shake(90, key === 'shaken' ? 0.01 : 0.004);
    this.toolButtons.get(key)?.back.setFillStyle(0xa8ffb0);
    this.toolButtons.get(key)?.text.setColor('#173f20');
    this.playToolEffect(key);
    this.playToolSound(key);
    this.dialogue.say(`${detail.label} used. ${detail.note}`);
    if (!dangerQuipQueued) this.sayHeroQuip(this.isNearSuccess() ? 'nearSuccess' : 'tool');
    this.updateNotebook();
  }

  checkDangerThreshold(previousDanger, source) {
    if (this.labPanicTriggered) return false;
    if (this.danger.value >= 100 && source === 'tool') {
      this.triggerLabPanic();
      return true;
    }

    const crossedMedium = previousDanger < 35 && this.danger.value >= 35;
    const crossedHigh = previousDanger < 70 && this.danger.value >= 70;
    if (!crossedMedium && !crossedHigh) return false;
    this.playDangerWarning(crossedHigh ? 'high' : 'medium');
    if (!crossedHigh) return false;
    return this.sayHeroQuip('danger', { chance: 0.35, delay: 1200 });
  }

  playDangerWarning(tier) {
    const warnings = tier === 'high'
      ? [
        () => {
          this.cameras.main.shake(260, 0.012);
          this.dialogue.say(`${this.hero.shortName}: The flask is doing the wobbly warning wiggle! Mix soon or reset safely.`);
        },
        () => {
          this.spawnBubbles(24, 0xffd166);
          this.showSplash('burp');
          this.dialogue.say('Henry says: “Those bubbles look extra excited. Time to make a careful choice!”');
        },
        () => {
          this.flashScreen(0xffd166, 0.28, 220);
          this.showSplash('tornado');
          this.dialogue.say('Warning: cartoon chaos is rising. Scientists pause before adding more variables.');
        },
      ]
      : [
        () => {
          this.cameras.main.shake(160, 0.006);
          this.dialogue.say('The danger meter wobbles. Still harmless, but the flask wants careful observations!');
        },
        () => {
          this.spawnBubbles(16, 0xfff176);
          this.dialogue.say('Henry quips: “Tiny bubbles, big feelings!”');
        },
        () => {
          this.flashScreen(0xfff176, 0.18, 180);
          this.dialogue.say('A friendly warning light blinks: try mixing before adding too many more changes.');
        },
      ];
    Phaser.Math.RND.pick(warnings)();
  }

  makeLabPanicOutcome() {
    const panicFailure = this.failures.find((failure) => failure.id === 'lab-panic-tornado')
      ?? this.failures.find((failure) => failure.effect === 'tornado')
      ?? this.failures[0];
    const vocabulary = [...new Set([...(panicFailure?.vocabulary ?? []), ...(this.experiment.vocabulary ?? [])])];
    return {
      ...panicFailure,
      id: panicFailure?.id ?? 'lab-panic',
      title: panicFailure?.title ?? 'Lab Panic!',
      effect: panicFailure?.effect ?? 'tornado',
      explanation: panicFailure?.explanation ?? 'The danger meter reached maximum cartoon wobble before mixing, so Henry called a silly lab pause. Science takeaway: changing too many variables at once makes results hard to understand.',
      kind: 'failure',
      badge: 'chaos-noticer',
      missingActions: [],
      vocabulary,
      safetyNote: this.safetyText ?? 'This was a cartoon failure, not a real recipe. Safe scientists test ideas carefully.',
    };
  }

  triggerLabPanic() {
    this.labPanicTriggered = true;
    this.mixButton.setEnabled(false);
    this.toolButtons.forEach((button) => button.setEnabled?.(false));
    const outcome = this.makeLabPanicOutcome();
    this.dialogue.say('MAX DANGER! Henry hits the big pretend panic button before anyone adds more tools.');
    this.time.delayedCall(150, () => this.playOutcome(outcome));
    new BadgeSystem().award(outcome.badge);
    this.time.delayedCall(2600, () => {
      this.tweens.killAll();
      this.scene.start('ResultsScene', {
        experimentId: this.experiment.id,
        modeId: this.modeId,
        outcome,
        prediction: this.predictions.currentPrediction,
        predictionMatched: false,
        selectedIngredientIds: this.inventory.selected,
        actions: this.actions,
      });
    });
  }

  playToolSound(key) {
    if (!this.sfx) return;
    if (key === 'stirred') this.sfx.whoosh();
    if (key === 'heated') this.sfx.fizz();
    if (key === 'cooled') this.sfx.sparkle();
    if (key === 'sealed') this.sfx.pop();
    if (key === 'shaken') this.sfx.whoosh();
  }

  updateNotebook() {
    this.notebook.update({
      prediction: this.predictions.currentPrediction,
      ingredients: this.inventory.selected.map((id) => this.findReagent(id).name),
      actions: Object.entries(this.actions).filter(([, used]) => used).map(([key]) => actionLabel(key)),
      toolHint: this.experiment.actionHint,
      observations: this.experiment.hints,
      conclusion: this.experiment.conclusion,
      stepStatus: this.stepStatus(),
    });
  }

  stepStatus() {
    const hasPrediction = Boolean(this.predictions.currentPrediction);
    const hasIngredients = this.inventory.selected.length > 0;
    const hasTool = Object.values(this.actions).some(Boolean);
    return [
      `${hasPrediction ? '✓' : '○'} predict`,
      `${hasIngredients ? '✓' : '○'} ingredient`,
      `${hasTool ? '✓' : '○'} tool`,
    ];
  }

  updateMixButton() {
    if (this.isMixing) {
      this.mixButton.setEnabled(false);
      return;
    }
    const ready = this.inventory.selected.length > 0;
    this.mixButton.setEnabled(ready);
    if (ready && !this.mixPulse) {
      this.mixPulse = this.tweens.add({ targets: this.mixButton.container, scale: 1.07, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    } else if (!ready) {
      this.stopMixPulse();
    }
  }

  stopMixPulse() {
    if (!this.mixPulse) return;
    this.mixPulse.stop();
    this.mixPulse = null;
    this.mixButton.container.setScale(1);
  }

  resetFlask() {
    if (this.isMixing) return;
    this.inventory.clear();
    this.actions = { stirred: false, heated: false, cooled: false, sealed: false, shaken: false };
    this.danger = new DangerMeter();
    this.liquid.setFillStyle(0x83d8ff, 0.65);
    this.updateLiquidLevel();
    this.meter.setValue(this.danger.value, this.danger.label());
    this.setFaceMood();
    this.toolEffectSprites.forEach((sprite) => sprite.destroy());
    this.toolEffectSprites = [];
    this.predictions = new PredictionSystem();
    this.highlightPrediction(null);
    this.toolButtons.forEach((button) => {
      button.back.setFillStyle(0xb388ff);
      button.text.setColor('#ffffff');
    });
    this.dialogue.say(`Flask reset, ${this.hero.shortName}. Make a prediction, choose ingredients, try tools, and observe again.`);
    this.updateNotebook();
    this.updateMixButton();
  }

  mix() {
    if (this.isMixing || this.inventory.selected.length === 0) return;
    this.isMixing = true;
    this.stopMixPulse();
    this.mixButton.setEnabled(false);
    this.resetButton.setEnabled(false);
    this.playPreMixSequence(() => this.resolveMixOutcome());
  }

  playPreMixSequence(onComplete) {
    this.dialogue.say('Stand back... science incoming!');
    this.sfx?.whoosh?.();
    this.cameras.main.shake(220, 0.006);
    this.spawnBubbles(20, this.liquid.fillColor ?? 0x9de8ff);

    this.tweens.killTweensOf(this.flask);
    this.tweens.add({
      targets: this.flask,
      x: 384,
      angle: -4,
      duration: 90,
      yoyo: true,
      repeat: 4,
      ease: 'Sine.InOut',
      onComplete: () => this.flask.setPosition(392, 386).setAngle(0),
    });

    const originalColor = this.liquid.fillColor ?? 0x83d8ff;
    const flashColors = [0xfff176, 0xff8bd1, 0x9de8ff, originalColor];
    flashColors.forEach((color, index) => {
      this.time.delayedCall(120 + index * 130, () => this.liquid.setFillStyle(color, 0.72));
    });

    this.time.delayedCall(780, () => {
      this.spawnBubbles(12, 0xffffff);
      onComplete?.();
    });
  }

  resolveMixOutcome() {
    const outcome = this.isSandbox
      ? this.engine.resolveSandbox(this.inventory.selected, this.actions)
      : this.engine.resolve(this.experiment, this.inventory.selected, this.actions);
    const predictionMatched = this.predictions.matchesOutcome(outcome);
    this.mixCount += 1;

    const before = this.discoveries.getForExperiment(this.experiment.id, this.modeId);
    const isNewDiscovery = !before.includes(outcome.id);
    if (this.scoreSystem) {
      const result = this.scoreSystem.award({
        kind: outcome.kind,
        predictionMatched,
        isNewDiscovery,
        ingredientCount: this.inventory.selected.length,
      });
      this.refreshScoreHud(result.gained);
    }

    this.playOutcome(outcome);
    new BadgeSystem().award(outcome.badge);

    if (this.isSandbox) {
      this.discoveries.record(this.experiment.id, outcome.id, this.modeId);
      this.refreshSecretCounter();
      if (outcome.secret && isNewDiscovery) {
        this.time.delayedCall(900, () => this.celebrateSecretDiscovery());
      }
      this.time.delayedCall(2300, () => this.sandboxAftermath(outcome));
    } else {
      this.time.delayedCall(2300, () => {
        this.tweens.killAll();
        this.scene.start('ResultsScene', {
          experimentId: this.experiment.id,
          modeId: this.modeId,
          outcome,
          prediction: this.predictions.currentPrediction,
          predictionMatched,
          selectedIngredientIds: this.inventory.selected,
          actions: this.actions,
        });
      });
    }
  }

  sandboxAftermath(outcome) {
    this.isMixing = false;
    this.resetButton.setEnabled(true);
    this.dialogue.say(`${outcome.title} — ${outcome.explanation}`);
    this.tweens.killTweensOf(this.flask);
    this.flask.setAngle(0).setPosition(392, 386);
    this.resetFlask();
  }

  celebrateSecretDiscovery() {
    this.sfx?.jingle();
    confettiBurst(this);
    const banner = this.add.text(512, 180, '🕵️ NEW SECRET DISCOVERED!', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '40px',
      color: '#fff176',
      stroke: '#11152f',
      strokeThickness: 10,
    }).setOrigin(0.5).setDepth(46).setScale(0);
    this.tweens.add({ targets: banner, scale: 1, duration: 300, ease: 'Back.Out' });
    this.tweens.add({ targets: banner, alpha: 0, y: 140, duration: 500, delay: 1300, onComplete: () => banner.destroy() });
  }


  spawnBubbles(count, tint = 0x9de8ff) {
    for (let i = 0; i < count; i += 1) {
      const bubble = this.physics.add.image(392 + Phaser.Math.Between(-42, 42), 448, 'bubble').setTint(tint).setScale(Phaser.Math.FloatBetween(0.35, 0.75));
      bubble.body.setAllowGravity(false);
      this.tweens.add({ targets: bubble, y: 262 + Phaser.Math.Between(-20, 20), x: bubble.x + Phaser.Math.Between(-28, 28), alpha: 0, duration: 1000, onComplete: () => bubble.destroy() });
    }
  }

  flashScreen(color = 0xffffff, alpha = 0.55, duration = 280) {
    const flash = this.add.rectangle(512, 320, 1024, 640, color, alpha).setDepth(40);
    this.tweens.add({ targets: flash, alpha: 0, duration, onComplete: () => flash.destroy() });
  }

  showSplash(effect) {
    const splash = SPLASH_WORDS[effect] ?? { word: 'WOW!', color: '#ffffff' };
    const text = this.add.text(512, 300, splash.word, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '110px',
      color: splash.color,
      stroke: '#11152f',
      strokeThickness: 12,
    }).setOrigin(0.5).setDepth(45).setScale(0).setAngle(Phaser.Math.Between(-12, 12));
    this.tweens.add({ targets: text, scale: 1.15, duration: 320, ease: 'Back.Out' });
    this.tweens.add({ targets: text, scale: 1, duration: 180, delay: 320, ease: 'Sine.InOut' });
    this.tweens.add({ targets: text, alpha: 0, y: text.y - 40, duration: 480, delay: 900, onComplete: () => text.destroy() });
  }

  playOutcome(outcome) {
    this.stopMixPulse();
    this.mixButton.setEnabled(false);
    this.dialogue.say(outcome.title);
    this.eyes?.forEach(({ pupil }) => {
      this.tweens.add({ targets: pupil, scale: 1.6, duration: 180, yoyo: true, repeat: 2 });
    });
    this.cameras.main.zoomTo(1.06, 130, 'Sine.easeInOut');
    this.time.delayedCall(280, () => this.cameras.main.zoomTo(1, 240, 'Sine.easeInOut'));
    const intensity = outcome.kind === 'success' ? 0.014 : 0.022;
    this.cameras.main.shake(360, intensity);
    this.flashScreen(outcome.kind === 'success' ? 0xfff5a8 : 0xff8bd1);
    this.showSplash(outcome.effect);
    this.playOutcomeSound(outcome);
    if (outcome.effect === 'foam') this.foamEruption();
    if (outcome.effect === 'rainbow') this.rainbowSludge();
    if (outcome.effect === 'crystal') this.crystalJam();
    if (outcome.effect === 'cork') this.corkRocket();
    if (outcome.effect === 'soot') this.sootBlast();
    if (outcome.effect === 'slime') this.slimeEscape();
    if (outcome.effect === 'duck') this.duckPortal();
    if (outcome.effect === 'layers') this.layerLagoon();
    if (outcome.effect === 'swirl') this.speedySwirls();
    if (outcome.effect === 'pop') this.pressurePop();
    if (outcome.effect === 'lava') this.lavaLampGlow();
    if (outcome.effect === 'galaxy') this.galaxySwirl();
    if (outcome.effect === 'disco') this.discoStorm();
    if (outcome.effect === 'blob') this.bouncyBlob();
    if (outcome.effect === 'dragon') this.dragonSneeze();
    if (outcome.effect === 'snow') this.snowGlobe();
    if (outcome.effect === 'tornado') this.glitterTornado();
    if (outcome.effect === 'burp') this.burpBlast();
    if (outcome.kind === 'success') confettiBurst(this);
  }

  playOutcomeSound(outcome) {
    if (!this.sfx) return;
    const big = ['pop', 'cork', 'foam'];
    if (big.includes(outcome.effect)) this.sfx.boom();
    if (outcome.effect === 'cork' || outcome.effect === 'pop') this.sfx.rocket();
    if (outcome.effect === 'foam') this.sfx.fizz();
    if (outcome.effect === 'rainbow') this.sfx.sparkle();
    if (outcome.effect === 'crystal') this.sfx.sparkle();
    if (outcome.effect === 'layers') this.sfx.bubble();
    if (outcome.effect === 'swirl') this.sfx.whoosh();
    if (outcome.effect === 'soot') this.sfx.boom();
    if (outcome.effect === 'slime') this.sfx.wahWah();
    if (outcome.effect === 'duck') this.sfx.zap();
    if (outcome.effect === 'lava') { this.sfx.bubble(); this.sfx.fizz(); }
    if (outcome.effect === 'galaxy') this.sfx.sparkle();
    if (outcome.effect === 'disco') { this.sfx.sparkle(); this.sfx.zap(); }
    if (outcome.effect === 'blob') this.sfx.pop();
    if (outcome.effect === 'dragon') { this.sfx.boom(); this.sfx.fizz(); }
    if (outcome.effect === 'snow') this.sfx.sparkle();
    if (outcome.effect === 'tornado') { this.sfx.whoosh(); this.sfx.zap(); }
    if (outcome.effect === 'burp') this.sfx.burp();
    this.time.delayedCall(380, () => {
      if (outcome.kind === 'success') this.sfx.jingle(); else this.sfx.wahWah();
    });
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
      this.tweens.killTweensOf(sprite);
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
    for (let i = 0; i < 60; i += 1) this.spawnFlying('foam', 392, 345, 0xffffff);
    this.time.delayedCall(180, () => { for (let i = 0; i < 30; i += 1) this.spawnFlying('foam', 392, 345, 0xffffff, -440); });
  }

  rainbowSludge() {
    [0xff4d6d, 0xffd166, 0x72d6ff, 0xb388ff, 0xa8ffb0, 0xff8bd1, 0x67f2c4].forEach((color, index) => {
      this.time.delayedCall(index * 120, () => {
        this.liquid.setFillStyle(color, 0.78);
        this.spawnBubbles(14, color);
        for (let i = 0; i < 6; i += 1) this.spawnFlying('bubble', 392, 380, color, -260);
      });
    });
  }

  crystalJam() {
    for (let i = 0; i < 28; i += 1) this.spawnFlying('crystal', 392, 405, 0xffffff, -360);
    this.time.delayedCall(220, () => { for (let i = 0; i < 16; i += 1) this.spawnFlying('crystal', 392, 405, 0xd8fbff, -440); });
  }

  corkRocket() {
    const cork = this.physics.add.image(392, 270, 'cork');
    cork.setVelocity(Phaser.Math.Between(-160, 160), -640).setAngularVelocity(540).setBounce(0.8).setCollideWorldBounds(true);
    for (let i = 0; i < 14; i += 1) this.spawnFlying('foam', 392, 300, 0xffd166, -380);
  }

  sootBlast() {
    for (let i = 0; i < 40; i += 1) this.spawnFlying('soot', 392, 336, 0xffffff, -260);
  }

  slimeEscape() {
    for (let i = 0; i < 24; i += 1) this.spawnFlying('slime', 392, 428, 0xffffff, -180);
  }

  duckPortal() {
    const portal = this.add.circle(392, 340, 18, 0xb388ff, 0.7).setStrokeStyle(6, 0x9de8ff);
    const duck = this.add.text(392, 340, '🦆', { fontSize: '78px' }).setOrigin(0.5).setScale(0);
    this.tweens.add({ targets: portal, radius: 110, angle: 720, duration: 900, yoyo: true, repeat: 1 });
    this.tweens.add({ targets: duck, scale: 1.7, angle: 18, duration: 700, ease: 'Back.Out' });
    for (let i = 0; i < 6; i += 1) {
      this.time.delayedCall(i * 120, () => {
        const extra = this.add.text(392 + Phaser.Math.Between(-180, 180), 340 + Phaser.Math.Between(-100, 100), '🦆', { fontSize: '34px' }).setOrigin(0.5);
        this.tweens.add({ targets: extra, alpha: 0, y: extra.y - 80, duration: 700, onComplete: () => extra.destroy() });
      });
    }
  }

  layerLagoon() {
    const colors = [0x67f2c4, 0xb4ff7a, 0xd8fbff, 0xffd166];
    colors.forEach((color, index) => {
      const layer = this.add.rectangle(392, 470 - index * 22, 110, 20, color, 0.78).setOrigin(0.5);
      this.tweens.add({ targets: layer, x: 392 + Phaser.Math.Between(-10, 10), duration: 700, yoyo: true, repeat: 3 });
    });
    this.spawnBubbles(18, 0xb4ff7a);
  }

  speedySwirls() {
    const swirlColors = [0xfff176, 0xb4ff7a, 0xffffff, 0xff8bd1];
    for (let i = 0; i < 36; i += 1) {
      this.time.delayedCall(i * 30, () => this.spawnFlying('bubble', 392, 420, swirlColors[i % swirlColors.length], -340));
    }
    this.tweens.add({ targets: this.liquid, angle: 8, duration: 100, yoyo: true, repeat: 12 });
  }


  pressurePop() {
    const cork = this.physics.add.image(392, 270, 'cork').setAngle(-4);
    cork.setVelocity(Phaser.Math.Between(-80, 80), -520).setAngularVelocity(360).setBounce(0.85).setCollideWorldBounds(true);
    this.spawnBubbles(30, 0xfff176);
    [0xffd166, 0xff8bd1, 0x9de8ff, 0xa8ffb0, 0xfff176, 0xff8bd1].forEach((color, index) => {
      this.time.delayedCall(index * 70, () => {
        for (let i = 0; i < 6; i += 1) this.spawnFlying('bubble', 392, 330, color, -380);
      });
    });
    this.time.delayedCall(1800, () => cork.destroy());
  }

  lavaLampGlow() {
    this.liquid.setFillStyle(0xff9e54, 0.8);
    for (let i = 0; i < 9; i += 1) {
      const blob = this.add.image(392 + Phaser.Math.Between(-38, 38), 440, 'slime')
        .setTint(Phaser.Math.RND.pick([0xff9e54, 0xffd166, 0xff4d6d]))
        .setScale(Phaser.Math.FloatBetween(0.4, 0.9))
        .setAlpha(0.9);
      this.tweens.add({
        targets: blob,
        y: 300 + Phaser.Math.Between(-24, 24),
        duration: Phaser.Math.Between(600, 1100),
        yoyo: true,
        ease: 'Sine.InOut',
        delay: i * 90,
        onComplete: () => blob.destroy(),
      });
    }
    this.spawnBubbles(10, 0xffd166);
  }

  galaxySwirl() {
    this.liquid.setFillStyle(0x4b2bbf, 0.85);
    for (let i = 0; i < 18; i += 1) {
      const star = this.add.text(392 + Phaser.Math.Between(-150, 150), 340 + Phaser.Math.Between(-110, 110), Phaser.Math.RND.pick(['✦', '✧', '⭐']), {
        fontSize: `${Phaser.Math.Between(14, 30)}px`,
        color: Phaser.Math.RND.pick(['#ffffff', '#d8fbff', '#fff176']),
      }).setOrigin(0.5).setAlpha(0).setDepth(8);
      this.tweens.add({ targets: star, alpha: 1, scale: 1.3, angle: 180, duration: 500, delay: i * 70, yoyo: true, onComplete: () => star.destroy() });
    }
    for (let i = 0; i < 12; i += 1) this.spawnFlying('bubble', 392, 380, Phaser.Math.RND.pick([0xb388ff, 0xff8bd1, 0x9de8ff]), -240);
  }

  discoStorm() {
    const colors = [0xff4d6d, 0xfff176, 0x72d6ff, 0xb388ff, 0xa8ffb0, 0xff8bd1];
    colors.forEach((color, index) => {
      this.time.delayedCall(index * 160, () => {
        this.flashScreen(color, 0.25, 150);
        this.liquid.setFillStyle(color, 0.8);
        for (let i = 0; i < 5; i += 1) this.spawnFlying('crystal', 392, 380, color, -380);
      });
    });
  }

  bouncyBlob() {
    const blob = this.physics.add.image(392, 380, 'slime').setScale(2.2).setTint(0xa8ffb0);
    blob.setVelocity(Phaser.Math.Between(-120, 120), -500).setBounce(0.92).setCollideWorldBounds(true).setAngularVelocity(220);
    this.tweens.add({ targets: blob, scaleX: 2.6, scaleY: 1.8, duration: 160, yoyo: true, repeat: 8 });
    for (let i = 0; i < 10; i += 1) this.spawnFlying('slime', 392, 420, 0xb4ff7a, -220);
    this.time.delayedCall(2100, () => blob.destroy());
  }

  dragonSneeze() {
    const dragon = this.add.text(392, 300, '🐉', { fontSize: '84px' }).setOrigin(0.5).setScale(0).setDepth(8);
    this.tweens.add({ targets: dragon, scale: 1.4, duration: 420, ease: 'Back.Out' });
    this.tweens.add({ targets: dragon, alpha: 0, y: 240, duration: 600, delay: 1100, onComplete: () => dragon.destroy() });
    for (let i = 0; i < 12; i += 1) {
      this.time.delayedCall(i * 70, () => {
        const flame = this.add.text(392 + Phaser.Math.Between(-60, 60), 350, '🔥', { fontSize: `${Phaser.Math.Between(26, 44)}px` }).setOrigin(0.5).setDepth(8);
        this.tweens.add({ targets: flame, y: flame.y - Phaser.Math.Between(60, 140), alpha: 0, duration: 700, onComplete: () => flame.destroy() });
      });
    }
    this.liquid.setFillStyle(0xb4ff7a, 0.8);
    for (let i = 0; i < 20; i += 1) this.spawnFlying('foam', 392, 340, 0xb4ff7a, -320);
  }

  snowGlobe() {
    this.liquid.setFillStyle(0xd8fbff, 0.7);
    const dome = this.add.circle(392, 360, 120, 0xd8fbff, 0.12).setStrokeStyle(4, 0xd8fbff, 0.8);
    this.tweens.add({ targets: dome, alpha: 0, duration: 600, delay: 1600, onComplete: () => dome.destroy() });
    for (let i = 0; i < 22; i += 1) {
      this.time.delayedCall(i * 80, () => {
        const flake = this.add.text(392 + Phaser.Math.Between(-110, 110), 250 + Phaser.Math.Between(-20, 10), '❄️', {
          fontSize: `${Phaser.Math.Between(14, 26)}px`,
        }).setOrigin(0.5).setDepth(8);
        this.tweens.add({ targets: flake, y: flake.y + Phaser.Math.Between(120, 200), x: flake.x + Phaser.Math.Between(-24, 24), alpha: 0.1, duration: 1300, ease: 'Sine.In', onComplete: () => flake.destroy() });
      });
    }
    for (let i = 0; i < 8; i += 1) this.spawnFlying('crystal', 392, 400, 0xffffff, -260);
  }

  glitterTornado() {
    const tornado = this.add.text(392, 370, '🌪️', { fontSize: '92px' }).setOrigin(0.5).setDepth(8).setScale(0);
    this.tweens.add({ targets: tornado, scale: 1.3, angle: 1080, y: 290, duration: 1600, ease: 'Sine.InOut', onComplete: () => tornado.destroy() });
    for (let i = 0; i < 30; i += 1) {
      this.time.delayedCall(i * 50, () => this.spawnFlying('crystal', 392, 380, Phaser.Math.RND.pick([0xfff176, 0xff8bd1, 0xd8fbff]), -300));
    }
  }

  burpBlast() {
    const burp = this.add.text(392, 320, '💨', { fontSize: '82px' }).setOrigin(0.5).setScale(0).setDepth(8);
    this.tweens.add({ targets: burp, scale: 1.8, y: 215, alpha: 0, duration: 1100, ease: 'Sine.Out', onComplete: () => burp.destroy() });
    this.tweens.add({ targets: this.flask, scaleX: 1.12, scaleY: 0.9, duration: 140, yoyo: true, repeat: 3, onComplete: () => this.flask.setScale(1) });
    this.spawnBubbles(24, 0xb4ff7a);
  }

  spawnFlying(texture, x, y, tint, yVelocity = -360) {
    const sprite = this.physics.add.image(x + Phaser.Math.Between(-35, 35), y + Phaser.Math.Between(-20, 20), texture).setTint(tint).setScale(Phaser.Math.FloatBetween(0.55, 1.2));
    sprite.setVelocity(Phaser.Math.Between(-280, 280), yVelocity + Phaser.Math.Between(-100, 100)).setAngularVelocity(Phaser.Math.Between(-540, 540)).setBounce(0.7).setCollideWorldBounds(true);
    this.time.delayedCall(1800, () => sprite.destroy());
  }
}
