export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    // Generate placeholder textures programmatically so the game runs
    // even before real art is ready. Replace with real sprite sheets later.
    this.generateTextures();
  }

  create() {
    this.scene.start('PreloadScene');
  }

  generateTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // player — 24×32 white rectangle with face
    g.clear();
    g.fillStyle(0xf5a623);
    g.fillRect(0, 0, 24, 32);
    g.fillStyle(0x000000);
    g.fillRect(6,  10, 4, 4);   // left eye
    g.fillRect(14, 10, 4, 4);   // right eye
    g.fillRect(8,  20, 8, 3);   // mouth
    g.generateTexture('player', 24, 32);

    // tile — 32×32 brick-ish
    g.clear();
    g.fillStyle(0x4a3728);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x6b5344);
    g.fillRect(1, 1, 30, 14);
    g.fillRect(1, 17, 14, 14);
    g.fillRect(17, 17, 14, 14);
    g.generateTexture('tile', 32, 32);

    // fake_tile — slight red tint to tile (barely visible)
    g.clear();
    g.fillStyle(0x5a2a28);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x7a4a44);
    g.fillRect(1, 1, 30, 14);
    g.fillRect(1, 17, 14, 14);
    g.fillRect(17, 17, 14, 14);
    g.generateTexture('fake_tile', 32, 32);

    // spike — 16×16 triangle-like
    g.clear();
    g.fillStyle(0xe94560);
    g.fillTriangle(8, 0, 0, 16, 16, 16);
    g.generateTexture('spike', 16, 16);

    // spike_ceil — upside down spike
    g.clear();
    g.fillStyle(0xe94560);
    g.fillTriangle(8, 16, 0, 0, 16, 0);
    g.generateTexture('spike_ceil', 16, 16);

    // door — 32×48 green rectangle
    g.clear();
    g.fillStyle(0x22c55e);
    g.fillRect(0, 0, 32, 48);
    g.fillStyle(0x16a34a);
    g.fillRect(4, 4, 24, 40);
    g.fillStyle(0xfbbf24);
    g.fillCircle(24, 28, 3);  // knob
    g.generateTexture('door', 32, 48);

    // fake_door — red door
    g.clear();
    g.fillStyle(0xe94560);
    g.fillRect(0, 0, 32, 48);
    g.fillStyle(0xbe123c);
    g.fillRect(4, 4, 24, 40);
    g.fillStyle(0xfbbf24);
    g.fillCircle(24, 28, 3);
    g.generateTexture('fake_door', 32, 48);

    // coin — 16×16 yellow circle
    g.clear();
    g.fillStyle(0xfbbf24);
    g.fillCircle(8, 8, 7);
    g.fillStyle(0xf59e0b);
    g.fillCircle(8, 8, 4);
    g.generateTexture('coin', 16, 16);

    // crusher — 64×16 grey block
    g.clear();
    g.fillStyle(0x6b7280);
    g.fillRect(0, 0, 64, 16);
    g.fillStyle(0x9ca3af);
    g.fillRect(2, 2, 60, 5);
    g.generateTexture('crusher', 64, 16);

    // particle — 4×4 dot
    g.clear();
    g.fillStyle(0xffffff);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture('particle', 4, 4);

    g.destroy();
  }
}
