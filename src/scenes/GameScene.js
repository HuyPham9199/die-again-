import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, GRAVITY } from '../config.js';
import { Player } from '../objects/Player.js';
import { Door }   from '../objects/Door.js';
import { FakeTile }              from '../objects/traps/FakeTile.js';
import { SpikeFromCeiling }      from '../objects/traps/SpikeFromCeiling.js';
import { DisappearingPlatform }  from '../objects/traps/DisappearingPlatform.js';
import { Crusher }               from '../objects/traps/Crusher.js';
import { GravityFlip }           from '../objects/traps/GravityFlip.js';
import { ReverseControls }       from '../objects/traps/ReverseControls.js';
import { KillCoin }              from '../objects/traps/KillCoin.js';
import { level1 } from '../levels/level1.js';
import { level2 } from '../levels/level2.js';
import { level3 } from '../levels/level3.js';
import { showMobileControls } from '../services/controls.js';

const LEVEL_DATA = [null, level1, level2, level3]; // index = level number

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel   = null;
    this.deathCount     = 0;
    this.levelDeaths    = 0;
    this.checkpointPos  = null;
    this._traps         = [];
    this._doors         = [];
    this._platforms     = null;
    this._hintTexts     = [];
  }

  init(data) {
    // data.level is set when lobby triggers a level
    if (data && data.level) {
      this.currentLevel  = data.level;
      this.levelDeaths   = 0;
      this.checkpointPos = null;
    }
  }

  create() {
    if (!this.currentLevel) {
      return;
    }
    // Force keyboard focus back to Phaser canvas (lost when HTML buttons were clicked)
    this.input.keyboard.enableGlobalCapture();
    this.game.canvas.focus();

    this._buildLevel(this.currentLevel);
    showMobileControls(true);
  }

  startLevel(levelNum) {
    this.currentLevel  = levelNum;
    this.levelDeaths   = 0;
    this.checkpointPos = null;
    this._traps        = [];
    this._doors        = [];
    this._hintTexts    = [];
    this.scene.restart({ level: levelNum });
  }

  _buildLevel(num) {
    const data = LEVEL_DATA[num];
    if (!data) return;

    // Background
    this.cameras.main.setBackgroundColor(data.background ?? 0x0d0d1a);

    // World bounds
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.physics.world.gravity.y = GRAVITY;

    // ── Platforms ──────────────────────────────────────────────
    this._platforms = this.physics.add.staticGroup();
    const segments  = data.groundSegments || data.platforms || [];
    segments.forEach(seg => {
      // Use a tile-sized rectangle texture tiled across the segment
      const cols = Math.ceil(seg.w / TILE_SIZE);
      const rows = Math.ceil(seg.h / TILE_SIZE);
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const tile = this._platforms.create(seg.x + c * TILE_SIZE + TILE_SIZE / 2,
                                               seg.y + r * TILE_SIZE + TILE_SIZE / 2, 'tile');
          tile.refreshBody();
        }
      }
    });

    // ── Player ─────────────────────────────────────────────────
    const spawnX = data.spawn.x;
    const spawnY = data.spawn.y;
    this.player = new Player(this, spawnX, spawnY);
    this.physics.add.collider(this.player, this._platforms);
    this.player.setDepth(10);

    // ── Doors ──────────────────────────────────────────────────
    const doorDefs = data.doors || (data.door ? [data.door] : []);
    doorDefs.forEach(dd => {
      const door = new Door(this, dd.x, dd.y, dd.fake, { running: dd.running });
      this._doors.push(door);
      this.physics.add.overlap(this.player, door, () => {
        if (!this.player.isAlive) return;
        if (door.isFake) {
          door.triggerFake(this.player);
          this._onPlayerDie();
        } else {
          this._onLevelComplete();
        }
      });
    });

    // ── Traps ──────────────────────────────────────────────────
    this._buildTraps(data.traps || []);

    // ── Checkpoints ────────────────────────────────────────────
    (data.checkpoints || []).forEach(cp => {
      const zone = this.add.zone(cp.x, cp.y, 32, 64).setOrigin(0.5, 1);
      this.physics.add.existing(zone, true);
      this.physics.add.overlap(this.player, zone, () => {
        if (!this.checkpointPos || cp.x > this.checkpointPos.x) {
          this.checkpointPos = { x: cp.x, y: cp.y };
          this._showFloating('Checkpoint! 📍', cp.x, cp.y - 40, '#4ade80');
        }
      });
    });

    // ── Signs / floor labels ───────────────────────────────────
    (data.signs || []).forEach(s => {
      this.add.text(s.x, s.y, s.text, {
        fontSize: s.size ? `${s.size}px` : '18px',
        color: s.color || '#f5a623',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5, 1);
    });
    (data.floorLabels || []).forEach(s => {
      this.add.text(s.x, s.y, s.text, {
        fontSize: '13px', color: s.color,
        stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5, 1);
    });

    // ── HUD ────────────────────────────────────────────────────
    this._deathText = this.add.text(8, 8, `Deaths: ${this.levelDeaths}`, {
      fontSize: '14px', color: '#e94560', stroke: '#000', strokeThickness: 2,
    }).setScrollFactor(0).setDepth(50);

    this._levelText = this.add.text(GAME_WIDTH - 8, 8, `Level ${num}`, {
      fontSize: '14px', color: '#f5a623', stroke: '#000', strokeThickness: 2,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(50);

    // Back button (ESC)
    this.input.keyboard.on('keydown-ESC', () => this._returnToLobby());
  }

  _buildTraps(trapDefs) {
    trapDefs.forEach(def => {
      let trap;
      switch (def.type) {
        case 'FakeTile':
          trap = new FakeTile(this, def.x, def.y);
          trap.addCollider(this.player, () => this._onPlayerDie());
          break;

        case 'SpikeFromCeiling':
          trap = new SpikeFromCeiling(this, def.triggerX, def.ceilY, {
            delay: def.delay, triggerWidth: def.triggerWidth,
          });
          trap.addOverlap(this.player, () => this._onPlayerDie());
          break;

        case 'DisappearingPlatform':
          trap = new DisappearingPlatform(this, def.x, def.y, def.w, {
            holdMs: def.holdMs, hideMs: def.hideMs,
          });
          trap.addCollider(this.player);
          // Falling into ground is not a kill — let physics handle it
          break;

        case 'Crusher':
          trap = new Crusher(this, def.x, def.ceilY, def.targetY, {
            downMs: def.downMs, holdMs: def.holdMs, upMs: def.upMs, pauseMs: def.pauseMs,
          });
          trap.addOverlap(this.player, () => this._onPlayerDie());
          break;

        case 'GravityFlip':
          trap = new GravityFlip(this, def.x, def.y, def.w, def.h, def.durationMs);
          trap.addOverlap(this.player);
          break;

        case 'ReverseControls':
          trap = new ReverseControls(this, def.x, def.y, def.w, def.h, def.durationMs);
          trap.addOverlap(this.player);
          break;

        case 'KillCoin':
          trap = new KillCoin(this, def.x, def.y);
          trap.addOverlap(this.player, () => this._onPlayerDie());
          break;

        default:
          console.warn(`Unknown trap type: ${def.type}`);
          return;
      }
      this._traps.push(trap);
    });
  }

  _onPlayerDie() {
    if (!this.player.isAlive) return;
    this.levelDeaths++;
    this.deathCount++;
    this._deathText?.setText(`Deaths: ${this.levelDeaths}`);

    // Persist death count
    this.events.emit('playerDied');

    // Show hint after certain death counts
    const data = LEVEL_DATA[this.currentLevel];
    (data?.hints || []).forEach(h => {
      if (this.levelDeaths === h.afterDeaths) {
        this._showFloating(h.text, h.x, h.y, '#f5a623', 3000);
      }
    });

    this.player.die(() => this._respawn());
  }

  _respawn() {
    const data = LEVEL_DATA[this.currentLevel];
    const cp   = this.checkpointPos || data?.spawn || { x: 60, y: GAME_HEIGHT - 64 };
    this.player.respawn(cp.x, cp.y);
  }

  _onLevelComplete() {
    this.player.isAlive = false;
    this.sound.play('win', { volume: 0.7 });
    this.cameras.main.flash(500, 74, 222, 128);

    // Level complete banner
    const banner = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2,
      `LEVEL ${this.currentLevel} HOÀN THÀNH! 🎉`, {
        fontSize: '28px', color: '#4ade80', stroke: '#000', strokeThickness: 4,
        backgroundColor: '#00000099', padding: { x: 20, y: 10 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(60);

    this.tweens.add({ targets: banner, scaleX: 1.1, scaleY: 1.1, duration: 400, yoyo: true, repeat: 1 });
    this.events.emit('levelComplete', this.currentLevel);
    showMobileControls(false);

    this.time.delayedCall(2500, () => {
      banner.destroy();
      this._returnToLobby(true);
    });
  }

  _returnToLobby(levelJustCompleted = false) {
    showMobileControls(false);
    this.currentLevel = null;
    this._traps.forEach(t => t.destroy?.());
    this._doors.forEach(d => d.destroy?.());
    this._traps = []; this._doors = [];
    // Signal lobby
    window.dispatchEvent(new CustomEvent('gameReturnToLobby', {
      detail: { levelCompleted: levelJustCompleted, level: this.currentLevel },
    }));
    this.scene.restart({ level: null });
  }

  update() {
    if (!this.player || !this.currentLevel) return;
    this.player.update();
    this._doors.forEach(d => d.update(this.player));
    this._traps.forEach(t => t.update?.(this.player));
  }

  _showFloating(text, x, y, color = '#fff', duration = 2000) {
    const t = this.add.text(x, y, text, {
      fontSize: '16px', color, stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(55);
    this.tweens.add({ targets: t, y: y - 30, alpha: 0, duration, ease: 'Cubic.easeOut',
      onComplete: () => t.destroy() });
  }
}
