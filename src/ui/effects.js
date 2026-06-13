import Phaser from 'phaser';

const CONFETTI_PALETTE = [0xff4d6d, 0xffd166, 0x72d6ff, 0xb388ff, 0xa8ffb0, 0xff8bd1, 0xfff176];

export function confettiBurst(scene, count = 50) {
  for (let i = 0; i < count; i += 1) {
    const piece = scene.physics.add.image(Phaser.Math.Between(80, 944), Phaser.Math.Between(-60, -10), 'confetti')
      .setTint(Phaser.Math.RND.pick(CONFETTI_PALETTE))
      .setScale(Phaser.Math.FloatBetween(0.7, 1.4))
      .setDepth(44);
    piece.setVelocity(Phaser.Math.Between(-60, 60), Phaser.Math.Between(40, 160)).setAngularVelocity(Phaser.Math.Between(-360, 360));
    piece.body.setGravityY(-280);
    scene.time.delayedCall(2600, () => piece.destroy());
  }
}
