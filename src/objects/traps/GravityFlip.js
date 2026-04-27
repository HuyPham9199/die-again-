import { GRAVITY } from '../../config.js';

export class GravityFlip {
  /**
   * A zone that flips gravity for `durationMs` when player enters.
   */
  constructor(scene, x, y, width, height, durationMs = 3000) {
    this.scene      = scene;
    this.duration   = durationMs;
    this.triggered  = false;
    this.zone = scene.add.zone(x, y, width, height).setOrigin(0, 0);
    scene.physics.add.existing(this.zone, true);

    // Visual indicator — flashing arrows
    this._label = scene.add.text(x + width / 2, y + height / 2, '⚠ GRAVITY', {
      fontSize: '12px', color: '#f5a623', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
  }

  addOverlap(player) {
    this.scene.physics.add.overlap(player, this.zone, () => {
      if (this.triggered || !player.isAlive) return;
      this.triggered = true;

      const flipped = !player.gravityFlipped;
      player.gravityFlipped = flipped;
      player.body.setGravityY(flipped ? -GRAVITY * 2 : 0);

      this.scene.cameras.main.flash(300, 245, 158, 11, false);
      this.scene.sound.play('trap_trigger', { volume: 0.5 });

      // Show countdown
      let remaining = this.duration;
      const timer = this.scene.time.addEvent({
        delay: 500, repeat: (this.duration / 500) - 1,
        callback: () => {
          remaining -= 500;
          this._label.setText(`⚠ GRAVITY ${(remaining / 1000).toFixed(1)}s`);
        },
      });

      this.scene.time.delayedCall(this.duration, () => {
        player.gravityFlipped = false;
        player.body.setGravityY(0);
        this._label.setText('⚠ GRAVITY');
        this.triggered = false;
        timer.remove();
      });
    });
  }

  destroy() { this.zone.destroy(); this._label.destroy(); }
}
