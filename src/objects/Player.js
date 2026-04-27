import { PLAYER_SPEED, JUMP_VELOCITY } from '../config.js';
import { virtualKeys, isMobile } from '../services/controls.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.body.setSize(20, 30);
    this.body.setOffset(2, 2);

    this.cursors = scene.input.keyboard.addKeys({
      left:   Phaser.Input.Keyboard.KeyCodes.A,
      right:  Phaser.Input.Keyboard.KeyCodes.D,
      jump:   Phaser.Input.Keyboard.KeyCodes.W,
      jump2:  Phaser.Input.Keyboard.KeyCodes.SPACE,
      left2:  Phaser.Input.Keyboard.KeyCodes.LEFT,
      right2: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up:     Phaser.Input.Keyboard.KeyCodes.UP,
      down:   Phaser.Input.Keyboard.KeyCodes.DOWN,
    });

    // Prevent arrow keys from scrolling the page
    scene.input.keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    ]);

    this.isAlive     = true;
    this.jumpPressed = false;

    // modifiers that traps can flip
    this.controlsReversed = false;
    this.gravityFlipped   = false;
    this.jumpDisabled     = false;
  }

  respawn(x, y) {
    this.isAlive = true;
    this.controlsReversed = false;
    this.gravityFlipped   = false;
    this.jumpDisabled     = false;
    this.body.setGravityY(0);
    this.setPosition(x, y);
    this.body.setVelocity(0, 0);
    this.setAlpha(1);
    this.setTint(0xffffff);
  }

  update() {
    if (!this.isAlive) return;

    const kb = this.cursors;
    const kbLeft  = kb.left.isDown  || kb.left2.isDown;
    const kbRight = kb.right.isDown || kb.right2.isDown;
    const kbJump  = kb.jump.isDown  || kb.jump2.isDown || kb.up.isDown;

    const goLeft   = (isMobile ? virtualKeys.left  : kbLeft)  ^ this.controlsReversed;
    const goRight  = (isMobile ? virtualKeys.right : kbRight) ^ this.controlsReversed;
    const wantJump = isMobile ? virtualKeys.jump : kbJump;

    if (goLeft)       this.setVelocityX(-PLAYER_SPEED);
    else if (goRight) this.setVelocityX(PLAYER_SPEED);
    else              this.setVelocityX(0);

    const onGround = this.body.blocked.down || this.body.blocked.up;

    if (wantJump && !this.jumpPressed && onGround && !this.jumpDisabled) {
      const vel = this.gravityFlipped ? -JUMP_VELOCITY : JUMP_VELOCITY;
      this.setVelocityY(vel);
      this.scene.sound.play('jump', { volume: 0.5 });
    }
    this.jumpPressed = wantJump;

    // Visual flip
    if (goLeft)        this.setFlipX(true);
    else if (goRight)  this.setFlipX(false);
  }

  die(onComplete) {
    if (!this.isAlive) return;
    this.isAlive = false;

    this.scene.sound.play('death', { volume: 0.6 });
    this.scene.cameras.main.shake(200, 0.015);

    // Death particles
    const particles = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 80, max: 240 },
      scale: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 18,
      tint: [0xe94560, 0xf5a623, 0xffffff],
    });
    this.scene.time.delayedCall(700, () => particles.destroy());

    this.setVisible(false);
    this.scene.time.delayedCall(750, () => {
      this.setVisible(true);
      if (onComplete) onComplete();
    });
  }
}
