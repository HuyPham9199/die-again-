// localStorage fallback for offline / non-logged-in state
const KEY_HIGHEST = 'da_highestLevel';
const KEY_DEATHS  = 'da_totalDeaths';

export function localGetHighest() {
  return parseInt(localStorage.getItem(KEY_HIGHEST) || '0', 10);
}
export function localSetHighest(level) {
  const current = localGetHighest();
  if (level > current) localStorage.setItem(KEY_HIGHEST, String(level));
}
export function localGetDeaths() {
  return parseInt(localStorage.getItem(KEY_DEATHS) || '0', 10);
}
export function localIncrementDeaths() {
  localStorage.setItem(KEY_DEATHS, String(localGetDeaths() + 1));
}
