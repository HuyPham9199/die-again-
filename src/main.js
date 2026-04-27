import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import { BootScene }    from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { GameScene }    from './scenes/GameScene.js';
import {
  loginWithGoogle, logout, onAuthChange,
  loadUserProgress, saveProgress, incrementDeaths, fetchLeaderboard,
} from './services/firebase.js';
import { initMobileControls, showMobileControls } from './services/controls.js';
import { localGetHighest, localSetHighest, localIncrementDeaths } from './utils/storage.js';
import { TOTAL_LEVELS } from './config.js';

// ─── Phaser game ────────────────────────────────────────────────
const config = {
  type:   Phaser.AUTO,
  width:  GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0d0d1a',
  canvasFocus: true,
  physics: {
    default: 'arcade',
    arcade:  { debug: false },
  },
  scene: [BootScene, PreloadScene, GameScene],
};

const game = new Phaser.Game(config);

// ─── App state ──────────────────────────────────────────────────
let currentUser    = null;
let highestLevel   = 0;   // loaded from Firestore or localStorage
let gameSceneRef   = null;

game.events.on('ready', () => {
  gameSceneRef = game.scene.getScene('GameScene');
  if (gameSceneRef) {
    gameSceneRef.events.on('playerDied', onPlayerDied);
    gameSceneRef.events.on('levelComplete', onLevelComplete);
  }
});

// ─── Auth state ─────────────────────────────────────────────────
onAuthChange(async (user) => {
  currentUser = user;
  if (user) {
    const data = await loadUserProgress(user.uid);
    highestLevel = data?.highestLevel ?? localGetHighest();
    localSetHighest(highestLevel);
    showUserInfo(user, highestLevel);
  } else {
    highestLevel = localGetHighest();
    showLoggedOut();
  }
  refreshLevelGrid();
});

// ─── Lobby UI ───────────────────────────────────────────────────
document.getElementById('btn-google-login').addEventListener('click', async () => {
  try { await loginWithGoogle(); }
  catch (e) { console.error('Login failed', e); }
});

document.getElementById('btn-logout').addEventListener('click', async () => {
  await logout();
});

document.getElementById('btn-play').addEventListener('click', () => {
  showScreen('level-select');
  refreshLevelGrid();
  playUiClick();
});

document.getElementById('btn-back-lobby').addEventListener('click', () => {
  showScreen('lobby');
  playUiClick();
});

document.getElementById('btn-leaderboard').addEventListener('click', async () => {
  document.getElementById('leaderboard-modal').classList.remove('hidden');
  playUiClick();
  await renderLeaderboard();
});

document.getElementById('btn-close-lb').addEventListener('click', () => {
  document.getElementById('leaderboard-modal').classList.add('hidden');
});

// ─── Level grid ─────────────────────────────────────────────────
function refreshLevelGrid() {
  const grid = document.getElementById('level-grid');
  grid.innerHTML = '';
  for (let i = 1; i <= 100; i++) {
    const cell = document.createElement('div');
    cell.className = 'level-cell';
    cell.textContent = i;

    if (i <= TOTAL_LEVELS) {
      if (i <= highestLevel) {
        cell.classList.add('completed');
        cell.addEventListener('click', () => launchLevel(i));
      } else if (i === highestLevel + 1 || (i === 1 && highestLevel === 0)) {
        cell.classList.add('unlocked');
        cell.addEventListener('click', () => launchLevel(i));
      } else {
        cell.classList.add('locked');
        cell.textContent = '🔒';
      }
    } else {
      // Beyond TOTAL_LEVELS MVP — always locked
      cell.classList.add('locked');
      cell.textContent = '🔒';
    }
    grid.appendChild(cell);
  }
}

function launchLevel(num) {
  showScreen('game');
  playUiClick();
  initMobileControls();
  showMobileControls(true);

  // Small delay to ensure scene is ready, then focus canvas for keyboard input
  setTimeout(() => {
    game.canvas.setAttribute('tabindex', '0');
    game.canvas.focus();
    const gs = game.scene.getScene('GameScene');
    if (gs) {
      gs.startLevel(num);
    }
  }, 100);
}

// ─── Return from game ────────────────────────────────────────────
window.addEventListener('gameReturnToLobby', () => {
  showScreen('lobby');
  showMobileControls(false);
});

// ─── Progress callbacks ──────────────────────────────────────────
async function onPlayerDied() {
  localIncrementDeaths();
  if (currentUser) {
    try { await incrementDeaths(currentUser.uid); } catch (_) {}
  }
}

async function onLevelComplete(levelNum) {
  const prev = highestLevel;
  highestLevel = Math.max(highestLevel, levelNum);
  localSetHighest(highestLevel);

  if (currentUser && levelNum > prev) {
    try {
      await saveProgress(currentUser.uid, levelNum, prev);
    } catch (e) {
      console.error('Could not save progress', e);
    }
  }

  if (currentUser) {
    document.getElementById('user-level').textContent = `Level: ${highestLevel}`;
  }
}

// ─── Leaderboard ─────────────────────────────────────────────────
async function renderLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  list.innerHTML = '<p>Đang tải...</p>';
  try {
    const rows = await fetchLeaderboard();
    if (!rows.length) { list.innerHTML = '<p>Chưa có ai chơi!</p>'; return; }

    list.innerHTML = '';
    const medals = ['🥇', '🥈', '🥉'];
    rows.forEach((row, i) => {
      const isMe = currentUser && row.uid === currentUser.uid;
      const div  = document.createElement('div');
      div.className = `lb-row${isMe ? ' me' : ''}`;
      div.innerHTML = `
        <span class="lb-rank">${medals[i] || '#' + (i + 1)}</span>
        <img class="lb-avatar" src="${row.photoURL || ''}" alt="" onerror="this.style.display='none'" />
        <span class="lb-name">${isMe ? '⭐ BẠN' : (row.displayName || 'Ẩn danh')}</span>
        <span class="lb-level">Level ${row.highestLevel}</span>
      `;
      list.appendChild(div);
    });
  } catch (e) {
    list.innerHTML = '<p>Lỗi kết nối Firestore. Kiểm tra firebaseConfig.</p>';
    console.error(e);
  }
}

// ─── UI helpers ──────────────────────────────────────────────────
function showScreen(which) {
  document.getElementById('lobby').classList.add('hidden');
  document.getElementById('level-select').classList.add('hidden');
  // game-container is always visible; overlays sit on top
  if (which === 'lobby') {
    document.getElementById('lobby').classList.remove('hidden');
    document.getElementById('lobby').classList.add('active');
  } else if (which === 'level-select') {
    document.getElementById('level-select').classList.remove('hidden');
  }
  // 'game' → no overlay shown
}

function showUserInfo(user, level) {
  document.getElementById('btn-google-login').classList.add('hidden');
  const ui = document.getElementById('user-info');
  ui.classList.remove('hidden');
  document.getElementById('user-avatar').src = user.photoURL || '';
  document.getElementById('user-name').textContent  = user.displayName || user.email;
  document.getElementById('user-level').textContent = `Level: ${level}`;
  document.getElementById('btn-logout').classList.remove('hidden');
}

function showLoggedOut() {
  document.getElementById('btn-google-login').classList.remove('hidden');
  document.getElementById('user-info').classList.add('hidden');
  document.getElementById('btn-logout').classList.add('hidden');
}

function playUiClick() {
  try { game.sound.play('ui_click', { volume: 0.3 }); } catch (_) {}
}
