export class Crusher {
  /**
   * Ceiling crusher that descends on a cycle.
   * @param {Phaser.Scene} scene
   * @param {number} x        left edge
   * @param {number} ceilY    starting y (top of stroke)
   * @param {number} targetY  bottom of stroke (where it crushes to)
   * @param {object} [opts]
   * @param {number} [opts.downMs=600]  time to descend
   * @param {number} [opts.holdMs=400]  time held at bottom
   * @param {number} [opts.upMs=400]    time to retract
   * @param {number} [opts.pauseMs=1600] time paused at top between cycles
   */
  constructor(scene, x, ceilY, targetY, opts = {}) {
    this.scene   = scene;
    this.crusher = scene.physics.add.image(x + 32, ceilY, 'crusher');
    this.crusher.setOrigin(0.5, 0);
    this.crusher.body.setImmovable(true);
    this.crusher.body.setAllowGravity(false);

    const { downMs = 600, holdMs = 400, upMs = 400, pauseMs = 1600 } = opts;
    const cycle = () => {
      scene.tweens.add({
        targets:  this.crusher,
        y:        targetY,
        duration: downMs,
        ease:     'Cubic.easeIn',
        onComplete: () => {
          scene.time.delayedCall(holdMs, () => {
            scene.tweens.add({
              targets: this.crusher, y: ceilY, duration: upMs, ease: 'Cubic.easeOut',
              onComplete: () => scene.time.delayedCall(pauseMs, cycle),
            });
          });
        },
      });
    };
    cycle();
  }

  addOverlap(player, onDie) {
    this.scene.physics.add.overlap(player, this.crusher, () => onDie());
  }

  destroy() { this.crusher.destroy(); }
}
