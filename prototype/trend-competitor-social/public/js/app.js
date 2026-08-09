/**
 * app.js - Tab Router (ES Module)
 * SPA tab switching: mount/unmount tab modules, URL hash management
 */

import * as trends from './tabs/trends.js';
import * as competitors from './tabs/competitors.js';
import * as social from './tabs/social.js';

// Tab modules map
const TABS = {
  trends,
  competitors,
  social,
};

// Default tab
const DEFAULT_TAB = 'trends';

// State
let currentTabKey = null;

/**
 * Switch to a tab by key name
 * @param {string} tabKey - 'trends' | 'competitors' | 'social'
 */
function switchTab(tabKey) {
  if (!TABS[tabKey]) {
    console.warn(`Tab "${tabKey}" not found, falling back to "${DEFAULT_TAB}"`);
    tabKey = DEFAULT_TAB;
  }

  // Skip if already on this tab
  if (tabKey === currentTabKey) return;

  const container = document.getElementById('app');
  if (!container) return;

  // Unmount current tab
  if (currentTabKey && TABS[currentTabKey]) {
    TABS[currentTabKey].unmount();
  }

  // Update active state on tab bar buttons
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach((btn) => {
    if (btn.dataset.tab === tabKey) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update URL hash (without triggering hashchange)
  history.replaceState(null, '', `#${tabKey}`);

  // Mount new tab
  currentTabKey = tabKey;
  TABS[tabKey].mount(container);
}

/**
 * Read tab key from URL hash
 * @returns {string} tab key
 */
function getTabFromHash() {
  const hash = window.location.hash.replace('#', '');
  return TABS[hash] ? hash : DEFAULT_TAB;
}

/**
 * Initialize: bind tab bar clicks, read hash, mount default tab
 */
function init() {
  // Bind click events on tab bar buttons
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabKey = btn.dataset.tab;
      if (tabKey) {
        switchTab(tabKey);
      }
    });
  });

  // Listen for hash changes (browser back/forward)
  window.addEventListener('hashchange', () => {
    switchTab(getTabFromHash());
  });

  // Mount initial tab from hash or default
  switchTab(getTabFromHash());
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
