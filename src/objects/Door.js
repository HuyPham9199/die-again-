export class Door extends Phaser.GameObjects.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {boolean} fake - true = kills player on touch
   * @param {object} [opts]
   * @param {boolean} [opts.running] - door runs away from player (Level 3)
   */
  constructor(scene, x, y, fake = false, opts = {}) {
    super(scene, x, y, fake ? 'fake_door' : 'door');
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static by default

    this.isFake   = fake;
    this.isRunning = opts.running || false;
    this.runSpeed  = 180;
    this.triggered = false;

    this.setOrigin(0.5, 1); // anchor at bottom-center

    // Gentle idle float
    scene.tweens.add({
      targets: this,
      y:       y - 6,
      duration: 800,
      yoyo:    true,
      repeat:  -1,
      ease:    'Sine.easeInOut',
    });
  }

  update(player) {
    if (!this.isRunning || this.triggered) return;

    // Run away horizontally when player is within 120 px
    const dist = Math.abs(player.x - this.x);
    if (dist < 120) {
      const dir = this.x > player.x ? 1 : -1;
      this.x += dir * this.runSpeed * (1 / 60);
      // Clamp inside world
      const bounds = this.scene.physics.world.bounds;
      this.x = Phaser.Math.Clamp(this.x, 24, bounds.width - 24);
      // Update physics body position
      this.body.reset(this.x, this.y);
    }
  }

  triggerFake(player) {
    if (this.triggered) return;
    this.triggered = true;
    this.scene.sound.play('door_fake', { volume: 0.7 });
    // Troll animation: bounce + tint red
    this.scene.tweens.add({
      targets: this,
      scaleX:  1.5,
      scaleY:  1.5,
      angle:   [0, 15, -15, 10, -10, 0],
      duration: 400,
      onComplete: () => player.die(() => {}),
    });
    // Show laugh emoji briefly
    const txt = this.scene.add.text(this.x, this.y - 60, '😂 HA HA HA!', {
      fontSize: '18px', color: '#e94560', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);
    this.scene.time.delayedCall(1200, () => txt.destroy());
  }
}
