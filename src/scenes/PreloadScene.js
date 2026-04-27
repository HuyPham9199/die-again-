export class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene'); }

  preload() {
    // Real audio assets — place files in /public/assets/audio/
    // Falls back silently if files are missing (placeholder game still runs)
    const audioFiles = ['jump', 'death', 'win', 'door_fake', 'trap_trigger', 'bgm', 'ui_click'];
    audioFiles.forEach(key => {
      this.load.audio(key, [`/assets/audio/${key}.mp3`, `/assets/audio/${key}.wav`]);
    });

    // Progress bar
    const { width, height } = this.scale;
    const bar = this.add.graphics();
    this.load.on('progress', (v) => {
      bar.clear();
      bar.fillStyle(0xe94560);
      bar.fillRect(width / 4, height / 2 - 8, (width / 2) * v, 16);
    });
  }

  create() {
    this.scene.start('GameScene', { level: null }); // goes to lobby first
    // Lobby is HTML overlay; GameScene will wait until lobby triggers a level
  }
}
