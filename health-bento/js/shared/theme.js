/**
 * theme.js — Dark/Light theme toggle with localStorage persistence
 */

const LS_KEY = 'hb-theme';
const listeners = [];

let currentTheme = 'light';

function loadTheme() {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored === 'dark' || stored === 'light') currentTheme = stored;
  } catch { /* ignore */ }
}

function saveTheme() {
  try { localStorage.setItem(LS_KEY, currentTheme); } catch { /* ignore */ }
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.innerHTML = currentTheme === 'dark'
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    btn.title = currentTheme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดกลางคืน';
  }
}

export function initTheme() {
  loadTheme();
  applyTheme();
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', toggleTheme);
  }
}

export function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  saveTheme();
  applyTheme();
  for (const cb of listeners) {
    try { cb(currentTheme); } catch (e) { console.error(e); }
  }
}

export function getTheme() {
  return currentTheme;
}

export function onThemeChange(callback) {
  if (typeof callback === 'function') listeners.push(callback);
}
