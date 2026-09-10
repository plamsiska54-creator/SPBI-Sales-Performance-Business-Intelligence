/**
 * sidebar.js - Left sidebar navigation for multi-section dashboard
 * Renders sidebar, manages active state, collapse/expand, mobile overlay
 */

import { icons } from './icons.js';
import { t } from './i18n.js';

const SECTIONS = [
  { key: 'executive',  i18n: 'nav.executive',  icon: 'barChart3' },
  { key: 'market',     i18n: 'nav.market',     icon: 'trendingUp' },
  { key: 'competitor', i18n: 'nav.competitor',  icon: 'users' },
  { key: 'product',    i18n: 'nav.product',     icon: 'package2' },
  { key: 'consumer',   i18n: 'nav.consumer',    icon: 'heart' },
  { key: 'area',       i18n: 'nav.area',        icon: 'mapPin' },
  { key: 'monitor',    i18n: 'nav.monitor',     icon: 'eye' },
  { key: 'ai-insight', i18n: 'nav.ai-insight',  icon: 'brain' },
  { key: 'alert',      i18n: 'nav.alert',       icon: 'bell' },
  { key: 'qa',         i18n: 'nav.qa',          icon: 'helpCircle' },
  { key: 'action',     i18n: 'nav.action',      icon: 'clipboardCheck' },
  { key: 'sources',    i18n: 'nav.sources',     icon: 'bookOpen' },
];

const LS_KEY = 'sidebar-collapsed';

let activeKey = SECTIONS[0].key;
let collapsed = false;
const clickListeners = [];

function loadCollapsedState() {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored !== null) collapsed = stored === 'true';
  } catch { /* localStorage unavailable */ }
}

function saveCollapsedState() {
  try {
    localStorage.setItem(LS_KEY, String(collapsed));
  } catch { /* localStorage unavailable */ }
}

function isMobile() {
  return window.innerWidth < 768;
}

function buildMenuItems() {
  return SECTIONS.map(sec => {
    const iconFn = icons[sec.icon];
    const iconSvg = iconFn ? iconFn() : '';
    const activeCls = sec.key === activeKey ? ' active' : '';
    const label = t(sec.i18n);
    return `<a class="sidebar-item${activeCls}" data-section="${sec.key}" data-tooltip="${label}" href="#${sec.key}">
      <span class="sidebar-icon">${iconSvg}</span>
      <span class="sidebar-label">${label}</span>
    </a>`;
  }).join('\n');
}

/**
 * Render the sidebar into a container element
 * @param {HTMLElement} container - Element to render sidebar into
 */
export function renderSidebar(container) {
  if (!container) return;

  loadCollapsedState();

  const collapsedCls = collapsed && !isMobile() ? ' collapsed' : '';

  container.innerHTML = `
    <aside class="sidebar${collapsedCls}" id="sidebar">
      <div class="sidebar-header">
        <span class="sidebar-logo">Bakery Analytics</span>
        <button class="sidebar-toggle" id="sidebar-toggle" aria-label="Toggle sidebar">
          ${icons.chevronLeft()}
        </button>
      </div>
      <nav class="sidebar-nav">
        ${buildMenuItems()}
      </nav>
    </aside>
    <div class="sidebar-backdrop" id="sidebar-backdrop"></div>
  `;

  // Menu item click
  const navItems = container.querySelectorAll('.sidebar-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const key = item.dataset.section;
      setActiveSection(key);
      document.dispatchEvent(new CustomEvent('section-change', { detail: { section: key } }));
      for (const cb of clickListeners) {
        try { cb(key); } catch (err) { console.error('Sidebar click listener error:', err); }
      }
      // Close sidebar on mobile after selection
      if (isMobile()) closeMobileSidebar();
    });
  });

  // Toggle button (desktop collapse / mobile close)
  const toggleBtn = container.querySelector('#sidebar-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (isMobile()) {
        closeMobileSidebar();
      } else {
        toggleSidebar();
      }
    });
  }

  // Mobile menu button (in header, outside sidebar container)
  const headerMenuBtn = document.getElementById('header-mobile-menu');
  if (headerMenuBtn) {
    headerMenuBtn.addEventListener('click', openMobileSidebar);
  }

  // Backdrop click closes mobile sidebar
  const backdrop = container.querySelector('#sidebar-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', closeMobileSidebar);
  }
}

function openMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) {
    sidebar.classList.remove('collapsed');
    sidebar.classList.add('mobile-open');
  }
  if (backdrop) backdrop.classList.add('active');
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (backdrop) backdrop.classList.remove('active');
}

/**
 * Set the active section and update sidebar UI
 * @param {string} sectionKey - Key of the section to activate
 */
export function setActiveSection(sectionKey) {
  activeKey = sectionKey;
  const items = document.querySelectorAll('.sidebar-item');
  items.forEach(item => {
    if (item.dataset.section === sectionKey) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

/**
 * Register a click handler for section navigation
 * @param {function} callback - Called with the section key string
 */
export function onSectionClick(callback) {
  if (typeof callback === 'function') {
    clickListeners.push(callback);
  }
}

/**
 * Toggle sidebar collapse/expand (desktop)
 */
export function toggleSidebar() {
  collapsed = !collapsed;
  saveCollapsedState();
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('collapsed', collapsed);
  }
}

/**
 * Check if sidebar is currently collapsed
 * @returns {boolean}
 */
export function isSidebarCollapsed() {
  return collapsed;
}

/**
 * Re-render sidebar labels (called on language change)
 */
export function updateSidebarLabels() {
  const items = document.querySelectorAll('.sidebar-item');
  items.forEach(item => {
    const key = item.dataset.section;
    const sec = SECTIONS.find(s => s.key === key);
    if (!sec) return;
    const label = t(sec.i18n);
    const labelEl = item.querySelector('.sidebar-label');
    if (labelEl) labelEl.textContent = label;
    item.setAttribute('data-tooltip', label);
  });
  const logo = document.querySelector('.sidebar-logo');
  if (logo) logo.textContent = t('ui.sidebarTitle');
}
