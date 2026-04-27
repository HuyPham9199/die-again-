import { GAME_HEIGHT } from '../config.js';

// ── Level 1: "Chào mừng" ───────────────────────────────────────
// Simple left-to-right. One fake tile, one ceiling spike.
// Mũi tên hướng dẫn sai: đi NGƯỢC mới sống.

const FLOOR = GAME_HEIGHT - 32;

export const level1 = {
  background: 0x1a1a2e,

  spawn: { x: 60, y: FLOOR - 32 },

  // World border walls/ceiling
  worldBounds: true,

  // Static tile layout: arrays of { x, y, w, h } rectangles in pixels
  // Each entry is a solid tile group (platform or wall)
  platforms: [
    // Ground
    { x: 0,   y: FLOOR, w: 800, h: 32 },
    // Gap from x=240 to x=320 (player must jump over)
    // Left ground ends at 240, right ground starts at 320
    // Override: split ground
  ],

  // Easier to define as explicit ground segments + platforms
  groundSegments: [
    { x: 0,   y: FLOOR, w: 240, h: 32 },  // left side
    { x: 320, y: FLOOR, w: 480, h: 32 },  // right side (after gap)
    // Platform above gap to jump from
    { x: 200, y: FLOOR - 96, w: 64, h: 16 },
  ],

  door: { x: 744, y: FLOOR, fake: false },

  // Sign / label hints (drawn in GameScene)
  signs: [
    { x: 350, y: FLOOR - 20, text: '→', color: '#f5a623', size: 28 },
    { x: 450, y: FLOOR - 20, text: '→', color: '#f5a623', size: 28 },
    // Following the arrows leads to ceiling spike; go left instead
  ],

  traps: [
    // FakeTile on the right-side ground shortcut path
    { type: 'FakeTile', x: 480, y: FLOOR },

    // Ceiling spike triggered when player follows the → arrows
    { type: 'SpikeFromCeiling', triggerX: 430, ceilY: 0, delay: 500, triggerWidth: 80 },

    // Safe passage is actually left of the signs (double-back)
    // The REAL path: jump the gap, ignore signs, hug left wall past fake tile
  ],

  checkpoints: [],  // no checkpoint for level 1 (short enough)

  hints: [
    // After first death, show: "Mũi tên nói dối đó..."
    { afterDeaths: 1, text: 'Mũi tên nói dối đó... 🤔', x: 400, y: 60 },
  ],
};
