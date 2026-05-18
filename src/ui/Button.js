export default class Button {
  constructor(scene, x, y, label, onClick, options = {}) {
    const width = options.width ?? 220;
    const height = options.height ?? 54;
    const fill = options.fill ?? 0xffd166;
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.back = scene.add.roundedRectangle?.(0, 0, width, height, 16, fill) ?? scene.add.rectangle(0, 0, width, height, fill);
    this.back.setStrokeStyle(4, options.stroke ?? 0x5b3a00);
    this.text = scene.add.text(0, 0, label, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: options.fontSize ?? '22px',
      color: options.color ?? '#3a2600',
      align: 'center',
    }).setOrigin(0.5);
    this.container.add([this.back, this.text]);
    this.container.setSize(width, height).setInteractive({ useHandCursor: true });
    this.container.on('pointerdown', (...args) => {
      const sfx = scene.registry.get('sfx');
      if (sfx) { sfx.resume(); sfx.click(); }
      onClick?.(...args);
    });
    this.container.on('pointerover', () => this.scene.tweens.add({ targets: this.container, scale: 1.06, duration: 120 }));
    this.container.on('pointerout', () => this.scene.tweens.add({ targets: this.container, scale: 1, duration: 120 }));
  }

  setEnabled(enabled) {
    this.container.setAlpha(enabled ? 1 : 0.45);
    enabled ? this.container.setInteractive({ useHandCursor: true }) : this.container.disableInteractive();
  }
}
