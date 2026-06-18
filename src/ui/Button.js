export default class Button {
  constructor(scene, x, y, label, onClick, options = {}) {
    const width = options.width ?? 220;
    const height = options.height ?? 54;
    const fill = options.fill ?? 0xffd166;
    this.scene = scene;
    this.container = scene.add.container(x, y);
    const radius = options.radius ?? 16;
    this.shadow = scene.add.roundedRectangle?.(options.shadowOffsetX ?? 4, options.shadowOffsetY ?? 5, width, height, radius, options.shadow ?? 0x2b2254, options.shadowAlpha ?? 0.32)
      ?? scene.add.rectangle(options.shadowOffsetX ?? 4, options.shadowOffsetY ?? 5, width, height, options.shadow ?? 0x2b2254, options.shadowAlpha ?? 0.32);
    this.back = scene.add.roundedRectangle?.(0, 0, width, height, radius, fill) ?? scene.add.rectangle(0, 0, width, height, fill);
    this.back.setStrokeStyle(options.strokeWidth ?? 4, options.stroke ?? 0x5b3a00);
    this.highlight = scene.add.ellipse(-width * 0.24, -height * 0.24, width * 0.38, height * 0.18, 0xffffff, options.highlightAlpha ?? 0.28);
    this.text = scene.add.text(0, 0, label, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: options.fontSize ?? '22px',
      color: options.color ?? '#3a2600',
      align: 'center',
      lineSpacing: options.lineSpacing ?? 0,
      wordWrap: options.wordWrap,
    }).setOrigin(0.5);
    this.container.add([this.shadow, this.back, this.highlight, this.text]);
    if (options.angle) this.container.setAngle(options.angle);
    this.container.setSize(width, height).setInteractive({ useHandCursor: true });
    this.container.on('pointerdown', (...args) => {
      const sfx = scene.registry.get('sfx');
      if (sfx) { sfx.resume(); sfx.click(); }
      onClick?.(...args);
    });
    this.container.on('pointerover', () => this.scene.tweens.add({ targets: this.container, scale: options.hoverScale ?? 1.06, duration: 120, ease: 'Back.Out' }));
    this.container.on('pointerout', () => this.scene.tweens.add({ targets: this.container, scale: 1, duration: 120 }));
  }

  setEnabled(enabled) {
    this.container.setAlpha(enabled ? 1 : 0.45);
    enabled ? this.container.setInteractive({ useHandCursor: true }) : this.container.disableInteractive();
  }
}
