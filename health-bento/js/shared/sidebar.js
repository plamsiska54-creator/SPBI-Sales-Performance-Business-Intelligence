/**
 * sidebar.js — เมนูนำทางด้านซ้าย
 * แสดงรายการ section, จัดการสถานะ active, ย่อ/ขยาย และโหมดมือถือ (overlay)
 */

import { icons } from './icons.js';
import { t } from './i18n.js';

const SECTIONS = [
  { key: 'overview',  i18n: 'nav.overview',  icon: 'layoutDashboard' },
  { key: 'market',    i18n: 'nav.market',    icon: 'trendingUp' },
  { key: 'product',   i18n: 'nav.product',   icon: 'salad' },
  { key: 'ops',       i18n: 'nav.ops',       icon: 'chefHat' },
  { key: 'marketing', i18n: 'nav.marketing', icon: 'megaphone' },
  { key: 'retail',    i18n: 'nav.retail',    icon: 'store' },
  { key: 'finance',   i18n: 'nav.finance',   icon: 'wallet' },
  { key: 'plan',      i18n: 'nav.plan',      icon: 'calendarCheck' },
  { key: 'sources',   i18n: 'nav.sources',   icon: 'bookOpen' },
];

const LS_KEY = 'hb-sidebar-collapsed';

let activeKey = SECTIONS[0].key;
let allowedKeys = null;   // null = ยังไม่จำกัดสิทธิ์ (แสดงทุกเมนู)
let collapsed = false;
const clickListeners = [];

function loadCollapsedState() {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored !== null) collapsed = stored === 'true';
  } catch { /* localStorage ใช้ไม่ได้ */ }
}

function saveCollapsedState() {
  try {
    localStorage.setItem(LS_KEY, String(collapsed));
  } catch { /* localStorage ใช้ไม่ได้ */ }
}

function isMobile() {
  return window.innerWidth < 768;
}

/** เมนูที่ผู้ใช้ปัจจุบันมีสิทธิ์เห็น */
function visibleSections() {
  if (!allowedKeys) return SECTIONS;
  return SECTIONS.filter(s => allowedKeys.includes(s.key));
}

function buildMenuItems() {
  return visibleSections().map(sec => {
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
 * วาด sidebar ลงใน container
 * @param {HTMLElement} container
 */
export function renderSidebar(container, allowed) {
  if (!container) return;

  if (Array.isArray(allowed)) allowedKeys = allowed.slice();

  loadCollapsedState();

  const collapsedCls = collapsed && !isMobile() ? ' collapsed' : '';

  container.innerHTML = `
    <aside class="sidebar${collapsedCls}" id="sidebar">
      <div class="sidebar-header">
        <span class="sidebar-logo">${t('ui.sidebarTitle')}</span>
        <button class="sidebar-toggle" id="sidebar-toggle" aria-label="${t('ui.toggleSidebar')}">
          ${icons.chevronLeft()}
        </button>
      </div>
      <nav class="sidebar-nav">
        ${buildMenuItems()}
      </nav>
    </aside>
    <div class="sidebar-backdrop" id="sidebar-backdrop"></div>
  `;

  // คลิกเมนู
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
      if (isMobile()) closeMobileSidebar();
    });
  });

  // ปุ่มย่อ/ขยาย (เดสก์ท็อป) หรือปิด (มือถือ)
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

  // ปุ่มเมนูบนหัวเว็บ (อยู่นอก container นี้)
  const headerMenuBtn = document.getElementById('header-mobile-menu');
  if (headerMenuBtn) {
    headerMenuBtn.addEventListener('click', openMobileSidebar);
  }

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
 * กำหนด section ที่กำลังใช้งานและอัปเดตหน้าตาเมนู
 * @param {string} sectionKey
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
 * ลงทะเบียนฟังก์ชันที่จะถูกเรียกเมื่อคลิกเมนู
 * @param {function} callback รับ section key
 */
export function onSectionClick(callback) {
  if (typeof callback === 'function') {
    clickListeners.push(callback);
  }
}

/** ย่อ/ขยาย sidebar (เดสก์ท็อป) */
export function toggleSidebar() {
  collapsed = !collapsed;
  saveCollapsedState();
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('collapsed', collapsed);
  }
}

/**
 * คีย์เมนูที่แสดงอยู่ตามสิทธิ์ปัจจุบัน
 * @returns {string[]}
 */
export function getVisibleSectionKeys() {
  return visibleSections().map(s => s.key);
}

/** @returns {boolean} sidebar ถูกย่ออยู่หรือไม่ */
export function isSidebarCollapsed() {
  return collapsed;
}

/** อัปเดตข้อความเมนูเมื่อเปลี่ยนภาษา */
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
