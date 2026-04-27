import { GAME_HEIGHT } from '../config.js';

// ── Level 3: "Phản bội" ────────────────────────────────────────
// Gravity flip zone, running door, reversed controls zone,
// AN TOÀN / NGUY HIỂM floor text trick.

const FLOOR = GAME_HEIGHT - 32;

export const level3 = {
  background: 0x1a0d2e,

  spawn: { x: 60, y: FLOOR - 32 },

  groundSegments: [
    { x: 0,   y: FLOOR, w: 800, h: 32 },
    // Elevated platforms for gravity flip section
    { x: 160, y: FLOOR - 128, w: 96,  h: 16 },
    { x: 340, y: FLOOR - 96,  w: 80,  h: 16 },
    { x: 500, y: FLOOR - 160, w: 96,  h: 16 },
  ],

  door: { x: 720, y: FLOOR, fake: false, running: true }, // the door runs away!

  // Floor text trick: "AN TOÀN" zone = dangerous; "NGUY HIỂM" zone = safe
  floorLabels: [
    { x: 200, y: FLOOR - 14, text: 'AN TOÀN', color: '#22c55e' },
    { x: 400, y: FLOOR - 14, text: 'NGUY HIỂM', color: '#e94560' },
  ],

  traps: [
    // Spike under "AN TOÀN" text (standing on it kills)
    { type: 'SpikeFromCeiling', triggerX: 200, ceilY: 0, delay: 100, triggerWidth: 96 },
    // "NGUY HIỂM" zone is actually safe (no traps)

    // Gravity flip zone between x=320..480
    { type: 'GravityFlip', x: 320, y: 0, w: 160, h: GAME_HEIGHT, durationMs: 3000 },

    // Reversed controls zone near the end
    { type: 'ReverseControls', x: 560, y: 0, w: 160, h: GAME_HEIGHT, durationMs: 4000 },
  ],

  checkpoints: [
    { x: 400, y: FLOOR - 32 },
  ],

  hints: [
    { afterDeaths: 1, text: '"AN TOÀN" mà chết... 🤨', x: 400, y: 60 },
    { afterDeaths: 2, text: 'Cửa đang... chạy trốn bạn à?', x: 400, y: 60 },
    { afterDeaths: 4, text: 'Tiếp cận cửa từ trên xuống!', x: 400, y: 60 },
  ],
};
