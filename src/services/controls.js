export const isMobile =
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  'ontouchstart' in window;

// Virtual button state — read by GameScene every frame
export const virtualKeys = {
  left:  false,
  right: false,
  jump:  false,
};

let jumpConsumed = false;

export function initMobileControls() {
  if (!isMobile) return;

  const el = document.getElementById('mobile-controls');
  el.classList.remove('hidden');

  const buttons = {
    'ctrl-left':  'left',
    'ctrl-right': 'right',
    'ctrl-jump':  'jump',
  };

  for (const [id, action] of Object.entries(buttons)) {
    const btn = document.getElementById(id);
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      virtualKeys[action] = true;
      if (navigator.vibrate) navigator.vibrate(15);
    });
    btn.addEventListener('pointerup',   () => { virtualKeys[action] = false; });
    btn.addEventListener('pointerleave',() => { virtualKeys[action] = false; });
  }
}

export function showMobileControls(visible) {
  const el = document.getElementById('mobile-controls');
  if (visible && isMobile) el.classList.remove('hidden');
  else el.classList.add('hidden');
}
