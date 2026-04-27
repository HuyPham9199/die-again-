import { GAME_HEIGHT } from '../config.js';

// ── Level 2: "Đừng tin vào mắt" ───────────────────────────────
// Two identical-looking doors; true door is behind a hidden platform.
// Crusher, disappearing platform, kill coin.

const FLOOR = GAME_HEIGHT - 32;

export const level2 = {
  background: 0x0d1a2e,

  spawn: { x: 60, y: FLOOR - 32 },

  groundSegments: [
    { x: 0,   y: FLOOR, w: 800, h: 32 },
    // Platform at top-left (hidden path to real door)
    { x: 16,  y: FLOOR - 160, w: 80,  h: 16 },
    { x: 16,  y: FLOOR - 320, w: 80,  h: 16 },
    // Mid platforms for traversal
    { x: 300, y: FLOOR - 96,  w: 80,  h: 16 },
    { x: 480, y: FLOOR - 64,  w: 96,  h: 16 },
  ],

  // Two fake doors side by side near the right end
  // Real door is tucked in top-left corner (reach via hidden platforms)
  doors: [
    { x: 600, y: FLOOR, fake: true },
    { x: 660, y: FLOOR, fake: true },
    // Real door: top-left corner, reachable by jumping left platforms
    { x: 40,  y: FLOOR - 320 - 48, fake: false },
  ],

  signs: [
    { x: 590, y: FLOOR - 28, text: '⬆ FINISH', color: '#22c55e', size: 14 },
    { x: 650, y: FLOOR - 28, text: '⬆ FINISH', color: '#22c55e', size: 14 },
    // Misleading signs — both say finish but both are fake
  ],

  traps: [
    // Disappearing platform mid-route
    { type: 'DisappearingPlatform', x: 300, y: FLOOR - 96, w: 80, holdMs: 500, hideMs: 1000 },

    // Crusher near the two fake doors
    { type: 'Crusher', x: 560, ceilY: 0, targetY: FLOOR - 80, downMs: 500, holdMs: 500, upMs: 400, pauseMs: 1400 },

    // Kill coin on the most obvious platform
    { type: 'KillCoin', x: 480, y: FLOOR - 96 },

    // Ceiling spike guarding approach to fake doors
    { type: 'SpikeFromCeiling', triggerX: 620, ceilY: 0, delay: 300, triggerWidth: 100 },
  ],

  checkpoints: [
    { x: 300, y: FLOOR - 32 }, // mid-level checkpoint (hidden, auto-triggered)
  ],

  hints: [
    { afterDeaths: 1, text: 'Hai cánh cửa... có gì đó không ổn', x: 400, y: 60 },
    { afterDeaths: 3, text: 'Có khi nào đường ra lại ở đằng... sau không? 🤔', x: 400, y: 60 },
  ],
};
