/**
 * sub-tabs.js - Sub-tab bar for content sections
 * Renders horizontal tab buttons within a section, emits 'subtab-change' events
 */

import { t } from './i18n.js';

const listeners = [];

/**
 * Render a sub-tab bar into a container
 * @param {HTMLElement} container - Element to render sub-tabs into
 * @param {Array<{key: string, label: string}>} tabs - Tab definitions
 * @param {string} activeKey - Currently active sub-tab key
 */
export function renderSubTabs(container, tabs, activeKey) {
  if (!container || !Array.isArray(tabs)) return;

  const buttonsHtml = tabs.map(tab => {
    const activeCls = tab.key === activeKey ? ' active' : '';
    const label = t('tab.' + tab.key) !== ('tab.' + tab.key) ? t('tab.' + tab.key) : tab.label;
    return `<button class="sub-tab-btn${activeCls}" data-subtab="${tab.key}">${label}</button>`;
  }).join('\n');

  container.innerHTML = `<div class="sub-tab-bar">${buttonsHtml}</div>`;

  const buttons = container.querySelectorAll('.sub-tab-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.subtab;

      // Update active state in DOM
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Dispatch custom event
      document.dispatchEvent(new CustomEvent('subtab-change', { detail: { subtab: key } }));

      // Notify registered listeners
      for (const cb of listeners) {
        try { cb(key); } catch (err) { console.error('Sub-tab listener error:', err); }
      }
    });
  });
}

/**
 * Register a handler for sub-tab clicks
 * @param {function} callback - Called with the sub-tab key string
 */
export function onSubTabClick(callback) {
  if (typeof callback === 'function') {
    listeners.push(callback);
  }
}

/**
 * Remove a previously registered sub-tab click handler
 * @param {function} callback
 */
export function removeSubTabListener(callback) {
  const idx = listeners.indexOf(callback);
  if (idx !== -1) {
    listeners.splice(idx, 1);
  }
}
