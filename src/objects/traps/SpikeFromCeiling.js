import { TILE_SIZE } from '../../config.js';

export class SpikeFromCeiling {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} triggerX  - horizontal center of trigger zone
   * @param {number} ceilY     - y position (top of world or ceiling tile y)
   * @param {object} [opts]
   * @param {number} [opts.delay=500]     - ms after trigger before spike drops
   * @param {number} [opts.triggerWidth=64] - width of proximity zone
   */
  constructor(scene, triggerX, ceilY, opts = {}) {
    this.scene        = scene;
    this.triggerX     = triggerX;
    this.ceilY        = ceilY;
    this.delay        = opts.delay        ?? 500;
    this.triggerWidth = opts.triggerWidth ?? 64;
    this.triggered    = false;
    this.dropped      = false;

    // Spike sprite starts at ceiling, hidden until triggered
    this.spike = scene.physics.add.sprite(triggerX, ceilY + 8, 'spike_ceil');
    this.spike.setOrigin(0.5, 0);
    this.spike.body.setAllowGravity(false);
    this.spike.body.setImmovable(true);
    this.spike.setAlpha(0.15); // barely visible hint
  }

  addOverlap(player, onDie) {
    this._overlap = this.scene.physics.add.overlap(player, this.spike, () => {
      onDie();
    });
  }

  update(player) {
    if (this.triggered) return;
    const inZone = Math.abs(player.x - this.triggerX) < this.triggerWidth / 2;
    if (inZone && player.isAlive) {
      this.triggered = true;
      // Warning shake
      this.scene.tweens.add({ targets: this.spike, alpha: 0.8, duration: this.delay / 2, yoyo: false });
      this.scene.time.delayedCall(this.delay, () => {
        this.dropped = true;
        this.spike.body.setAllowGravity(true);
        this.spike.setAlpha(1);
        this.scene.sound.play('trap_trigger', { volume: 0.5 });
        // Auto-reset after 3 seconds
        this.scene.time.delayedCall(3000, () => {
          this.spike.body.setAllowGravity(false);
          this.spike.setVelocityY(0);
          this.spike.setPosition(this.triggerX, this.ceilY + 8);
          this.spike.setAlpha(0.15);
          this.triggered = false;
          this.dropped   = false;
        });
      });
    }
  }

  destroy() { this.spike.destroy(); }
}
