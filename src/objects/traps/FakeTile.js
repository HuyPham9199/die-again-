export class FakeTile {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.staticSprite(x, y, 'fake_tile');
    this.sprite.setOrigin(0, 0);
    this.triggered = false;

    // Subtle wobble hint after player touches once
    this._wobblePlayed = false;
  }

  // Called by GameScene to set up overlap with player
  addCollider(player, onDie) {
    // First: collide so player can stand on it
    this._collider = this.scene.physics.add.collider(player, this.sprite, () => {
      if (this.triggered) return;
      if (!this._wobblePlayed) {
        this._wobblePlayed = true;
        this.scene.tweens.add({
          targets: this.sprite, angle: [0, 3, -3, 2, -2, 0], duration: 300,
        });
      }
      // If player is ON TOP (falling down onto it), start drop timer
      if (player.body.blocked.down) {
        this.triggered = true;
        this.scene.time.delayedCall(400, () => {
          this.scene.tweens.add({
            targets: this.sprite, y: '+=' + 400, alpha: 0, duration: 600,
            onComplete: () => { this.sprite.destroy(); },
          });
          this.scene.sound.play('trap_trigger', { volume: 0.4 });
        });
      }
    });
  }

  destroy() { this.sprite.destroy(); }
}
