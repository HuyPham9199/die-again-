// A coin that looks collectible but kills the player on touch.
export class KillCoin {
  constructor(scene, x, y) {
    this.scene = scene;
    this.coin  = scene.physics.add.staticSprite(x, y, 'coin');
    this.coin.setOrigin(0.5, 0.5);
    scene.tweens.add({
      targets: this.coin, y: y - 8, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  addOverlap(player, onDie) {
    this.scene.physics.add.overlap(player, this.coin, () => {
      if (!player.isAlive) return;
      // Flash "nice try" text
      const txt = this.scene.add.text(this.coin.x, this.coin.y - 30, 'Nice try! 😂', {
        fontSize: '14px', color: '#e94560', stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5);
      this.scene.time.delayedCall(1000, () => txt.destroy());
      this.coin.destroy();
      onDie();
    });
  }

  destroy() { this.coin.destroy(); }
}
