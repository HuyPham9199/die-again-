export class DisappearingPlatform {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} [width=64]   tile width in px
   * @param {object} [opts]
   * @param {number} [opts.holdMs=600]  ms before it disappears after first touch
   * @param {number} [opts.hideMs=1200] ms it stays gone before reappearing
   */
  constructor(scene, x, y, width = 64, opts = {}) {
    this.scene   = scene;
    this.holdMs  = opts.holdMs ?? 600;
    this.hideMs  = opts.hideMs ?? 1200;
    this.touched = false;
    this.gone    = false;

    // Build a static group of tiles to form the platform
    this.tiles = [];
    const count = Math.ceil(width / 32);
    for (let i = 0; i < count; i++) {
      const t = scene.physics.add.staticSprite(x + i * 32, y, 'tile');
      t.setOrigin(0, 0);
      this.tiles.push(t);
    }
  }

  addCollider(player) {
    this.tiles.forEach(t => {
      this.scene.physics.add.collider(player, t, () => {
        if (this.touched || this.gone) return;
        if (player.body.blocked.down) {
          this.touched = true;
          // Flash warning
          this.scene.tweens.add({
            targets: this.tiles, alpha: 0.3, duration: this.holdMs / 2, yoyo: true,
            onComplete: () => this._disappear(player),
          });
        }
      });
    });
  }

  _disappear(player) {
    this.gone = true;
    this.tiles.forEach(t => { t.setVisible(false); t.body.enable = false; });
    this.scene.time.delayedCall(this.hideMs, () => {
      this.tiles.forEach(t => { t.setVisible(true); t.setAlpha(1); t.body.enable = true; t.body.reset(t.x, t.y); });
      this.gone    = false;
      this.touched = false;
    });
  }

  destroy() { this.tiles.forEach(t => t.destroy()); }
}
