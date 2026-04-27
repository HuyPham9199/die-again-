export class ReverseControls {
  constructor(scene, x, y, width, height, durationMs = 4000) {
    this.scene     = scene;
    this.duration  = durationMs;
    this.triggered = false;
    this.zone = scene.add.zone(x, y, width, height).setOrigin(0, 0);
    scene.physics.add.existing(this.zone, true);

    this._label = scene.add.text(x + width / 2, y - 16, '⚠ ???', {
      fontSize: '12px', color: '#a855f7', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
  }

  addOverlap(player) {
    this.scene.physics.add.overlap(player, this.zone, () => {
      if (this.triggered || !player.isAlive) return;
      this.triggered = true;
      player.controlsReversed = true;
      this._label.setText('CONTROLS REVERSED!');
      this.scene.sound.play('trap_trigger', { volume: 0.5 });
      this.scene.time.delayedCall(this.duration, () => {
        player.controlsReversed = false;
        this._label.setText('⚠ ???');
        this.triggered = false;
      });
    });
  }

  destroy() { this.zone.destroy(); this._label.destroy(); }
}
