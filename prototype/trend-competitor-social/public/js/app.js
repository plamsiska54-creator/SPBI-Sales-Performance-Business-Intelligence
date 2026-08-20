/**
 * app.js - 2-Level Hash Router (ES Module)
 * SPA routing: sidebar sections + sub-tab navigation
 * Hash format: #section or #section/subtab
 * Lazy-loads tab modules via dynamic import(), caches for reuse
 */

import { renderSidebar, setActiveSection, onSectionClick, updateSidebarLabels } from './shared/sidebar.js';
import { renderSubTabs, onSubTabClick, removeSubTabListener } from './shared/sub-tabs.js';
import { initTheme } from './shared/theme.js';
import { initI18n, onLangChange, t } from './shared/i18n.js';
import { initAuth } from './shared/auth.js';

// ── Section Config ──────────────────────────────────────────

const SECTIONS = {
  executive: {
    label: 'ภาพรวมผู้บริหาร',
    subtabs: null,
    defaultTab: null,
    load: function () { return import('./tabs/executive/executive.js'); }
  },
  market: {
    label: 'เทรนด์ตลาด',
    subtabs: [
      { key: 'market-overview', label: 'ภาพรวมตลาด' },
      { key: 'market-growth', label: 'การเติบโตตามหมวด' },
      { key: 'market-seasonal', label: 'เทรนด์ตามฤดูกาล' },
    ],
    defaultTab: 'market-overview',
    load: function (tab) { return import('./tabs/market/' + tab + '.js'); }
  },
  competitor: {
    label: 'วิเคราะห์คู่แข่ง',
    subtabs: [
      { key: 'comp-overview', label: 'ภาพรวมคู่แข่ง' },
      { key: 'comp-price', label: 'เปรียบเทียบราคา' },
      { key: 'comp-product', label: 'เปรียบเทียบสินค้า' },
      { key: 'comp-promo', label: 'เปรียบเทียบโปรโมชัน' },
    ],
    defaultTab: 'comp-overview',
    load: function (tab) { return import('./tabs/competitor/' + tab + '.js'); }
  },
  product: {
    label: 'เทรนด์สินค้า',
    subtabs: [
      { key: 'prod-trending', label: 'สินค้ายอดนิยม' },
      { key: 'prod-category', label: 'ตามหมวดหมู่' },
      { key: 'prod-keyword', label: 'คีย์เวิร์ดและการค้นหา' },
    ],
    defaultTab: 'prod-trending',
    load: function (tab) { return import('./tabs/product/' + tab + '.js'); }
  },
  consumer: {
    label: 'พฤติกรรมผู้บริโภค',
    subtabs: [
      { key: 'cons-behavior', label: 'พฤติกรรมการซื้อ' },
      { key: 'cons-sentiment', label: 'ความรู้สึกและรีวิว' },
      { key: 'cons-social', label: 'Social Listening' },
    ],
    defaultTab: 'cons-behavior',
    load: function (tab) { return import('./tabs/consumer/' + tab + '.js'); }
  },
  area: {
    label: 'พื้นที่/ภูมิภาค',
    subtabs: [
      { key: 'area-overview', label: 'ภาพรวมภูมิภาค' },
      { key: 'area-channel', label: 'ช่องทางจำหน่าย' },
      { key: 'area-heatmap', label: 'แผนที่ความร้อน' },
    ],
    defaultTab: 'area-overview',
    load: function (tab) { return import('./tabs/area/' + tab + '.js'); }
  },
  monitor: {
    label: 'ติดตามคู่แข่ง',
    subtabs: [
      { key: 'mon-realtime', label: 'กิจกรรมล่าสุด' },
      { key: 'mon-newproduct', label: 'สินค้าใหม่' },
      { key: 'mon-pricing', label: 'การเปลี่ยนแปลงราคา' },
    ],
    defaultTab: 'mon-realtime',
    load: function (tab) { return import('./tabs/monitor/' + tab + '.js'); }
  },
  'ai-insight': {
    label: 'AI วิเคราะห์',
    subtabs: [
      { key: 'ai-summary', label: 'สรุปอัตโนมัติ' },
      { key: 'ai-forecast', label: 'พยากรณ์แนวโน้ม' },
      { key: 'ai-recommend', label: 'คำแนะนำ' },
    ],
    defaultTab: 'ai-summary',
    load: function (tab) { return import('./tabs/ai-insight/' + tab + '.js'); }
  },
  alert: {
    label: 'ศูนย์แจ้งเตือน',
    subtabs: [
      { key: 'alert-active', label: 'แจ้งเตือนปัจจุบัน' },
      { key: 'alert-history', label: 'ประวัติ' },
      { key: 'alert-settings', label: 'ตั้งค่า' },
    ],
    defaultTab: 'alert-active',
    load: function (tab) { return import('./tabs/alert/' + tab + '.js'); }
  },
  action: {
    label: 'แผนปฏิบัติการ',
    subtabs: [
      { key: 'action-plan', label: 'แผนงาน' },
      { key: 'action-calendar', label: 'ปฏิทิน' },
      { key: 'action-kpi', label: 'KPI ติดตาม' },
    ],
    defaultTab: 'action-plan',
    load: function (tab) { return import('./tabs/action/' + tab + '.js'); }
  },
};

const DEFAULT_SECTION = 'executive';

// ── State ───────────────────────────────────────────────────

let currentSection = null;   // section key ที่กำลังแสดงอยู่
let currentSubTab = null;    // subtab key ที่กำลังแสดงอยู่ (null ถ้า section ไม่มี subtabs)
let currentModule = null;    // module instance ที่ mount อยู่ (มี mount/unmount)
let navigating = false;      // ป้องกัน navigate ซ้อนกัน

// Module cache: key -> module (ป้องกัน re-import)
const moduleCache = new Map();

// ── Hash Parsing ────────────────────────────────────────────

/**
 * Parse URL hash เป็น { section, subtab }
 * รองรับ #section และ #section/subtab
 * ถ้า hash ไม่ถูกต้องจะ fallback ไป default
 * @returns {{ section: string, subtab: string|null }}
 */
function parseHash() {
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw) {
    return { section: DEFAULT_SECTION, subtab: null };
  }

  const parts = raw.split('/');
  const section = parts[0];
  const subtab = parts[1] || null;

  // ตรวจว่า section ถูกต้อง
  if (!SECTIONS[section]) {
    return { section: DEFAULT_SECTION, subtab: null };
  }

  const config = SECTIONS[section];

  // ถ้า section ไม่มี subtabs ให้ ignore subtab จาก hash
  if (!config.subtabs) {
    return { section: section, subtab: null };
  }

  // ถ้ามี subtab ใน hash — ตรวจว่าเป็น key ที่ถูกต้อง
  if (subtab) {
    const valid = config.subtabs.some(function (st) { return st.key === subtab; });
    if (valid) {
      return { section: section, subtab: subtab };
    }
  }

  // subtab ไม่ถูกต้องหรือไม่ได้ระบุ — ใช้ default
  return { section: section, subtab: config.defaultTab };
}

/**
 * สร้าง hash string จาก section + subtab
 * @param {string} section
 * @param {string|null} subtab
 * @returns {string} เช่น '#executive' หรือ '#competitor/comp-price'
 */
function buildHash(section, subtab) {
  if (subtab) {
    return '#' + section + '/' + subtab;
  }
  return '#' + section;
}

// ── Loading / Error UI ──────────────────────────────────────

/**
 * แสดง loading spinner ใน container
 * @param {HTMLElement} container
 */
function showLoading(container) {
  container.innerHTML =
    '<div class="loading-container">' +
      '<div class="loading-spinner"></div>' +
      '<p class="loading-text">กำลังโหลดโมดูล...</p>' +
    '</div>';
}

/**
 * แสดง error state ใน container
 * @param {HTMLElement} container
 * @param {string} message
 */
function showError(container, message) {
  container.innerHTML =
    '<div class="error-state">' +
      '<p class="error-state-text">' + message + '</p>' +
    '</div>';
}

// ── Module Loading ──────────────────────────────────────────

/**
 * โหลด module ด้วย dynamic import พร้อม cache
 * @param {string} section - section key
 * @param {string|null} subtab - subtab key (null ถ้าไม่มี subtabs)
 * @returns {Promise<{mount: Function, unmount: Function}>}
 */
async function loadModule(section, subtab) {
  // สร้าง cache key: 'executive' หรือ 'competitor/comp-price'
  var cacheKey = subtab ? section + '/' + subtab : section;

  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }

  var config = SECTIONS[section];
  if (!config) {
    throw new Error('ไม่พบ section: ' + section);
  }

  // เรียก load function จาก config
  // section ที่ไม่มี subtabs: load() ไม่รับ argument
  // section ที่มี subtabs: load(tab) รับ subtab key
  var mod;
  if (config.subtabs && subtab) {
    mod = await config.load(subtab);
  } else {
    mod = await config.load();
  }

  moduleCache.set(cacheKey, mod);
  return mod;
}

// ── Navigation ──────────────────────────────────────────────

/**
 * Navigate ไปยัง section/subtab ที่กำหนด
 * จัดการ unmount เก่า, render sub-tabs, โหลดและ mount module ใหม่
 * @param {string} section - section key
 * @param {string|null} subtab - subtab key
 * @param {Object} [options]
 * @param {boolean} [options.replaceHash=false] - ใช้ replaceState แทน pushState
 */
async function navigate(section, subtab, options) {
  var replaceHash = (options && options.replaceHash) || false;

  // ป้องกัน navigate ซ้อนกัน
  if (navigating) return;

  // ถ้าอยู่ที่เดิมแล้ว ไม่ต้องทำอะไร
  if (section === currentSection && subtab === currentSubTab) return;

  navigating = true;

  try {
    var config = SECTIONS[section];
    if (!config) {
      // section ไม่ถูกต้อง — redirect ไป default
      window.location.hash = buildHash(DEFAULT_SECTION, null);
      return;
    }

    // resolve subtab: ถ้า section มี subtabs แต่ไม่ได้ระบุ ให้ใช้ default
    if (config.subtabs && !subtab) {
      subtab = config.defaultTab;
    }
    // ถ้า section ไม่มี subtabs ต้องเป็น null
    if (!config.subtabs) {
      subtab = null;
    }

    var subTabBar = document.getElementById('sub-tab-bar');
    var tabContent = document.getElementById('tab-content');
    if (!tabContent) return;

    // -- Unmount module เก่า --
    if (currentModule && typeof currentModule.unmount === 'function') {
      currentModule.unmount();
      currentModule = null;
    }

    // -- เปลี่ยน section: อัพเดต sidebar + render sub-tabs --
    var sectionChanged = section !== currentSection;
    if (sectionChanged) {
      setActiveSection(section);

      // render sub-tab bar (ถ้ามี subtabs)
      if (subTabBar) {
        if (config.subtabs) {
          renderSubTabs(subTabBar, config.subtabs, subtab);
        } else {
          subTabBar.innerHTML = '';
        }
      }

    } else if (config.subtabs && subTabBar) {
      // section เดิม แต่เปลี่ยน subtab — อัพเดต active state ของ sub-tab bar
      renderSubTabs(subTabBar, config.subtabs, subtab);
    }

    // -- อัพเดต hash --
    // pushState ไม่ trigger hashchange event จึงใช้ได้อย่างปลอดภัย
    // replaceHash=true ใช้ตอน initial load และ hashchange (back/forward)
    var newHash = buildHash(section, subtab);
    if (replaceHash) {
      history.replaceState(null, '', newHash);
    } else {
      history.pushState(null, '', newHash);
    }

    // -- อัพเดต state --
    currentSection = section;
    currentSubTab = subtab;

    // -- โหลดและ mount module ใหม่ --
    showLoading(tabContent);

    var mod = await loadModule(section, subtab);

    // ตรวจว่าระหว่างรอโหลด user ไม่ได้ navigate ไปที่อื่น
    if (section !== currentSection || subtab !== currentSubTab) return;

    if (typeof mod.mount === 'function') {
      currentModule = mod;
      await mod.mount(tabContent);
    } else {
      showError(tabContent, 'โมดูลไม่มีฟังก์ชัน mount()');
    }

  } catch (err) {
    console.error('Navigation error:', err);
    var tc = document.getElementById('tab-content');
    if (tc) {
      showError(tc, 'เกิดข้อผิดพลาดในการโหลดโมดูล');
    }
  } finally {
    navigating = false;
  }
}

// ── Event Handlers ──────────────────────────────────────────

/**
 * Handler เมื่อ user คลิก section ใน sidebar
 * @param {string} sectionKey
 */
function handleSectionClick(sectionKey) {
  var config = SECTIONS[sectionKey];
  if (!config) return;

  var subtab = config.subtabs ? config.defaultTab : null;
  navigate(sectionKey, subtab);
}

/**
 * Handler เมื่อ user คลิก sub-tab
 * @param {string} subtabKey
 */
function handleSubTabClick(subtabKey) {
  if (!currentSection) return;
  navigate(currentSection, subtabKey);
}

/**
 * Handler สำหรับ hashchange event (browser back/forward)
 */
function handleHashChange() {
  var parsed = parseHash();
  navigate(parsed.section, parsed.subtab, { replaceHash: true });
}

// ── Initialization ──────────────────────────────────────────

/**
 * Initialize router: render sidebar, bind events, navigate ไปยัง hash ปัจจุบัน
 */
function init() {
  initTheme();
  initI18n();
  initAuth();

  document.body.classList.add('has-sidebar');

  var sidebarRoot = document.getElementById('sidebar-root');
  if (sidebarRoot) {
    renderSidebar(sidebarRoot);
  }

  onSectionClick(handleSectionClick);
  onSubTabClick(handleSubTabClick);

  window.addEventListener('hashchange', handleHashChange);
  window.addEventListener('popstate', handleHashChange);

  onLangChange(function () {
    updateSidebarLabels();
    var subTabBar = document.getElementById('sub-tab-bar');
    if (subTabBar && currentSection) {
      var config = SECTIONS[currentSection];
      if (config && config.subtabs) {
        renderSubTabs(subTabBar, config.subtabs, currentSubTab);
      }
    }
  });

  var initial = parseHash();
  navigate(initial.section, initial.subtab, { replaceHash: true });

  // -- Refresh button + last updated --
  const refreshBtn = document.getElementById('refresh-btn');
  const lastUpdatedEl = document.getElementById('last-updated');

  async function updateTimestamp() {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      if (data.lastUpdated && lastUpdatedEl) {
        const d = new Date(data.lastUpdated);
        const formatted = d.toLocaleDateString('th-TH', {
          year: 'numeric', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
        lastUpdatedEl.textContent = 'อัปเดตล่าสุด: ' + formatted;
      }
    } catch (e) {
      if (lastUpdatedEl) lastUpdatedEl.textContent = 'อัปเดตล่าสุด: ไม่ทราบ';
    }
  }

  async function handleRefresh() {
    if (!refreshBtn) return;
    refreshBtn.classList.add('loading');
    try {
      // Clear module cache so modules re-fetch data
      moduleCache.clear();
      // Call refresh API
      await fetch('/api/refresh');
      // Update timestamp
      await updateTimestamp();
      // Re-navigate to current section to reload
      const current = parseHash();
      currentSection = null;
      currentSubTab = null;
      currentModule = null;
      await navigate(current.section, current.subtab, { replaceHash: true });
    } catch (e) {
      console.error('Refresh error:', e);
    } finally {
      refreshBtn.classList.remove('loading');
    }
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', handleRefresh);
  }

  // Load initial timestamp
  updateTimestamp();
}

// ── Export สำหรับใช้ภายนอก ───────────────────────────────────

/** Export SECTIONS config ให้ sidebar/sub-tabs modules ใช้ */
export { SECTIONS, DEFAULT_SECTION };

// ── Start ───────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
