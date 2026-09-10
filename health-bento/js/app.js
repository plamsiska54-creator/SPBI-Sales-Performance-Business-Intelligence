/**
 * app.js — Hash Router 2 ระดับ (ES Module)
 * เส้นทาง: #section หรือ #section/subtab
 * โหลดโมดูลของแต่ละหน้าแบบ lazy ด้วย dynamic import() และ cache ไว้ใช้ซ้ำ
 */

import { renderSidebar, setActiveSection, onSectionClick, updateSidebarLabels } from './shared/sidebar.js';
import { renderSubTabs, onSubTabClick } from './shared/sub-tabs.js';
import { initTheme, onThemeChange } from './shared/theme.js';
import { initI18n, onLangChange } from './shared/i18n.js';
import { initAuth, onAuthChange, getAllowedSections, isLoggedIn } from './shared/auth.js';
import { clearCache } from './shared/data-loader.js';
import { loadMarketBenchmark } from './shared/ai-analyst.js';

// ── ตั้งค่า Section ──────────────────────────────────────────

const SECTIONS = {
  overview: {
    label: 'ภาพรวมธุรกิจ',
    subtabs: null,
    defaultTab: null,
    load: function () { return import('./tabs/overview/overview.js'); }
  },
  market: {
    label: 'ตลาด & ลูกค้า',
    subtabs: [
      { key: 'market-size', label: 'ขนาดตลาด & การเติบโต' },
      { key: 'market-persona', label: 'กลุ่มลูกค้าเป้าหมาย' },
      { key: 'market-competitor', label: 'คู่แข่งในตลาด' },
      { key: 'market-lowcarb', label: 'โปรตีนสูง & โลว์คาร์บ' },
      { key: 'market-survey', label: 'สำรวจราคาตลาดจริง' },
    ],
    defaultTab: 'market-size',
    load: function (tab) { return import('./tabs/market/' + tab + '.js'); }
  },
  product: {
    label: 'เมนู & ราคา',
    subtabs: [
      { key: 'prod-menu', label: 'เมนู & โภชนาการ' },
      { key: 'prod-price', label: 'โครงสร้างราคา' },
      { key: 'prod-cost', label: 'ต้นทุน & กำไรต่อกล่อง' },
    ],
    defaultTab: 'prod-menu',
    load: function (tab) { return import('./tabs/product/' + tab + '.js'); }
  },
  ops: {
    label: 'ผลิต & จัดส่ง',
    subtabs: [
      { key: 'ops-capacity', label: 'ครัวกลาง & กำลังผลิต' },
      { key: 'ops-supply', label: 'วัตถุดิบ & ซัพพลายเออร์' },
      { key: 'ops-delivery', label: 'จัดส่ง & โลจิสติกส์' },
    ],
    defaultTab: 'ops-capacity',
    load: function (tab) { return import('./tabs/ops/' + tab + '.js'); }
  },
  marketing: {
    label: 'การตลาด & ช่องทาง',
    subtabs: [
      { key: 'mkt-channel', label: 'ช่องทางขาย' },
      { key: 'mkt-campaign', label: 'แคมเปญ & แพ็กเกจสมาชิก' },
    ],
    defaultTab: 'mkt-channel',
    load: function (tab) { return import('./tabs/marketing/' + tab + '.js'); }
  },
  retail: {
    label: 'ห้าง / Modern Trade',
    subtabs: [
      { key: 'retail-chains', label: 'ทุกห้าง & กลุ่มลูกค้า' },
      { key: 'retail-terms', label: 'เงื่อนไขวางขาย' },
      { key: 'retail-shelf', label: 'คู่แข่งบนชั้นวาง' },
      { key: 'retail-potential', label: 'ศักยภาพยอดขาย' },
    ],
    defaultTab: 'retail-chains',
    load: function (tab) { return import('./tabs/retail/' + tab + '.js'); }
  },
  finance: {
    label: 'การเงิน',
    subtabs: [
      { key: 'fin-invest', label: 'เงินลงทุนเริ่มต้น' },
      { key: 'fin-pnl', label: 'ประมาณการกำไรขาดทุน' },
      { key: 'fin-breakeven', label: 'จุดคุ้มทุน & กระแสเงินสด' },
    ],
    defaultTab: 'fin-invest',
    load: function (tab) { return import('./tabs/finance/' + tab + '.js'); }
  },
  plan: {
    label: 'แผนดำเนินงาน',
    subtabs: [
      { key: 'plan-roadmap', label: 'ไทม์ไลน์ 12 เดือน' },
      { key: 'plan-risk', label: 'ความเสี่ยง & แผนรับมือ' },
    ],
    defaultTab: 'plan-roadmap',
    load: function (tab) { return import('./tabs/plan/' + tab + '.js'); }
  },
  sources: {
    label: 'แหล่งที่มาข้อมูล',
    subtabs: null,
    defaultTab: null,
    load: function () { return import('./tabs/sources/sources.js'); }
  },
};

const DEFAULT_SECTION = 'overview';

// ── สิทธิ์การเข้าถึงเมนู ─────────────────────────────────────

/**
 * คีย์เมนูที่ผู้ใช้ปัจจุบันเปิดได้ (เซิร์ฟเวอร์เป็นผู้กำหนดตอนล็อกอิน)
 * ถ้ายังไม่ได้ล็อกอินจะได้ลิสต์ว่าง — หน้าเนื้อหาจะไม่ถูกโหลด
 * @returns {string[]}
 */
function allowedSections() {
  const allowed = getAllowedSections().filter(k => SECTIONS[k]);
  return allowed;
}

function isAllowed(section) {
  return allowedSections().includes(section);
}

/** เมนูแรกที่ผู้ใช้เปิดได้ ใช้เป็นหน้าเริ่มต้นแทน overview เมื่อไม่มีสิทธิ์ */
function firstAllowedSection() {
  const allowed = allowedSections();
  if (!allowed.length) return null;
  return allowed.includes(DEFAULT_SECTION) ? DEFAULT_SECTION : allowed[0];
}

function showLocked(container) {
  container.innerHTML =
    '<div class="error-state">' +
      '<p class="error-state-text">บัญชีของคุณไม่มีสิทธิ์เข้าถึงเมนูนี้ — ติดต่อผู้ดูแลระบบหากต้องการสิทธิ์เพิ่ม</p>' +
    '</div>';
}

function showLoginRequired(container) {
  container.innerHTML =
    '<div class="empty-state">' +
      '<p class="empty-state-text">กรุณาเข้าสู่ระบบเพื่อดูข้อมูล</p>' +
    '</div>';
}

// ── สถานะ ───────────────────────────────────────────────────

let currentSection = null;   // section ที่กำลังแสดง
let currentSubTab = null;    // subtab ที่กำลังแสดง (null ถ้า section ไม่มี subtabs)
let currentModule = null;    // โมดูลที่ mount อยู่
let navigating = false;      // กัน navigate ซ้อนกัน

const moduleCache = new Map();

// ── อ่าน/สร้าง hash ─────────────────────────────────────────

function parseHash() {
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw) {
    return { section: DEFAULT_SECTION, subtab: null };
  }

  const parts = raw.split('/');
  const section = parts[0];
  const subtab = parts[1] || null;

  if (!SECTIONS[section]) {
    return { section: DEFAULT_SECTION, subtab: null };
  }

  const config = SECTIONS[section];

  if (!config.subtabs) {
    return { section: section, subtab: null };
  }

  if (subtab) {
    const valid = config.subtabs.some(function (st) { return st.key === subtab; });
    if (valid) {
      return { section: section, subtab: subtab };
    }
  }

  return { section: section, subtab: config.defaultTab };
}

function buildHash(section, subtab) {
  if (subtab) {
    return '#' + section + '/' + subtab;
  }
  return '#' + section;
}

// ── UI ระหว่างโหลด / ผิดพลาด ────────────────────────────────

function showLoading(container) {
  container.innerHTML =
    '<div class="loading-container">' +
      '<div class="loading-spinner"></div>' +
      '<p class="loading-text">กำลังโหลดโมดูล...</p>' +
    '</div>';
}

function showError(container, message) {
  container.innerHTML =
    '<div class="error-state">' +
      '<p class="error-state-text">' + message + '</p>' +
    '</div>';
}

// ── โหลดโมดูล ───────────────────────────────────────────────

async function loadModule(section, subtab) {
  var cacheKey = subtab ? section + '/' + subtab : section;

  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }

  var config = SECTIONS[section];
  if (!config) {
    throw new Error('ไม่พบ section: ' + section);
  }

  var mod;
  if (config.subtabs && subtab) {
    mod = await config.load(subtab);
  } else {
    mod = await config.load();
  }

  moduleCache.set(cacheKey, mod);
  return mod;
}

// ── การนำทาง ────────────────────────────────────────────────

async function navigate(section, subtab, options) {
  var replaceHash = (options && options.replaceHash) || false;
  var force = (options && options.force) || false;

  if (navigating) return;
  if (!force && section === currentSection && subtab === currentSubTab) return;

  navigating = true;

  try {
    var config = SECTIONS[section];
    if (!config) {
      window.location.hash = buildHash(DEFAULT_SECTION, null);
      return;
    }

    if (config.subtabs && !subtab) {
      subtab = config.defaultTab;
    }
    if (!config.subtabs) {
      subtab = null;
    }

    var subTabBar = document.getElementById('sub-tab-bar');
    var tabContent = document.getElementById('tab-content');
    if (!tabContent) return;

    // -- unmount โมดูลเดิม --
    if (currentModule && typeof currentModule.unmount === 'function') {
      currentModule.unmount();
      currentModule = null;
    }

    // -- ยังไม่ได้ล็อกอิน: ไม่โหลดข้อมูลใด ๆ --
    if (!isLoggedIn()) {
      if (subTabBar) subTabBar.innerHTML = '';
      showLoginRequired(tabContent);
      currentSection = null;
      currentSubTab = null;
      return;
    }

    // -- ล็อกอินแล้วแต่ไม่มีสิทธิ์ในเมนูนี้: พาไปเมนูแรกที่เปิดได้ --
    if (!isAllowed(section)) {
      var fallback = firstAllowedSection();
      if (fallback && fallback !== section) {
        if (subTabBar) subTabBar.innerHTML = '';
        currentSection = null;
        currentSubTab = null;
        navigating = false;
        await navigate(fallback, null, { replaceHash: true });
        return;
      }
      if (subTabBar) subTabBar.innerHTML = '';
      showLocked(tabContent);
      currentSection = null;
      currentSubTab = null;
      return;
    }

    // -- เปลี่ยน section: อัปเดตเมนู + แถบแท็บย่อย --
    var sectionChanged = section !== currentSection;
    if (sectionChanged) {
      setActiveSection(section);

      if (subTabBar) {
        if (config.subtabs) {
          renderSubTabs(subTabBar, config.subtabs, subtab);
        } else {
          subTabBar.innerHTML = '';
        }
      }

    } else if (config.subtabs && subTabBar) {
      renderSubTabs(subTabBar, config.subtabs, subtab);
    }

    // -- อัปเดต hash (pushState ไม่ trigger hashchange จึงปลอดภัย) --
    var newHash = buildHash(section, subtab);
    if (replaceHash) {
      history.replaceState(null, '', newHash);
    } else {
      history.pushState(null, '', newHash);
    }

    currentSection = section;
    currentSubTab = subtab;

    showLoading(tabContent);

    var mod = await loadModule(section, subtab);

    // ระหว่างรอโหลด ผู้ใช้อาจเปลี่ยนหน้าไปแล้ว
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

/** โหลดหน้าปัจจุบันใหม่ (ใช้ตอนกดรีเฟรช หรือสลับธีม) */
async function reloadCurrent() {
  var section = currentSection || DEFAULT_SECTION;
  var subtab = currentSubTab;
  await navigate(section, subtab, { replaceHash: true, force: true });
}

// ── ตัวจัดการเหตุการณ์ ──────────────────────────────────────

function handleSectionClick(sectionKey) {
  var config = SECTIONS[sectionKey];
  if (!config) return;

  var subtab = config.subtabs ? config.defaultTab : null;
  navigate(sectionKey, subtab);
}

function handleSubTabClick(subtabKey) {
  if (!currentSection) return;
  navigate(currentSection, subtabKey);
}

function handleHashChange() {
  var parsed = parseHash();
  navigate(parsed.section, parsed.subtab, { replaceHash: true });
}

// ── เริ่มต้นระบบ ────────────────────────────────────────────

/** วาดเมนูด้านซ้ายใหม่ตามสิทธิ์ของผู้ใช้ที่ล็อกอินอยู่ */
function renderNav() {
  var sidebarRoot = document.getElementById('sidebar-root');
  if (sidebarRoot) {
    renderSidebar(sidebarRoot, allowedSections());
  }
}

async function init() {
  initTheme();
  initI18n();

  var inIframe = window.parent !== window;
  if (!inIframe) {
    document.body.classList.add('has-sidebar');
  } else {
    var hdr = document.querySelector('.header');
    if (hdr) hdr.style.display = 'none';
    var mc = document.querySelector('.main-content');
    if (mc) { mc.style.marginLeft = '0'; mc.style.marginTop = '0'; mc.style.paddingTop = '0'; }
  }

  // โหลดผลสำรวจราคาตลาดจริงไว้ให้ AI วิเคราะห์ทุกหน้าใช้เทียบ
  await loadMarketBenchmark();

  // ต้องรู้สิทธิ์ก่อนวาดเมนูและโหลดหน้าแรก
  await initAuth();
  if (!inIframe) renderNav();

  // เข้า/ออกจากระบบแล้ววาดเมนูใหม่ตามสิทธิ์ชุดใหม่
  onAuthChange(function () {
    renderNav();
    moduleCache.clear();
    currentSection = null;
    currentSubTab = null;
    currentModule = null;
    var parsed = parseHash();
    navigate(parsed.section, parsed.subtab, { replaceHash: true });
  });

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

  // สลับธีมแล้ววาดกราฟใหม่ เพื่อให้สีของแกน/legend เข้ากับธีม
  onThemeChange(function () {
    reloadCurrent();
  });

  var initial = parseHash();
  navigate(initial.section, initial.subtab, { replaceHash: true });

  // -- ปุ่มรีเฟรช + เวลาอัปเดตล่าสุด --
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
      moduleCache.clear();
      clearCache();
      await fetch('/api/refresh');
      await updateTimestamp();
      await reloadCurrent();
    } catch (e) {
      console.error('Refresh error:', e);
    } finally {
      refreshBtn.classList.remove('loading');
    }
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', handleRefresh);
  }

  updateTimestamp();
}

export { SECTIONS, DEFAULT_SECTION };

// ── เริ่มทำงาน ──────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
