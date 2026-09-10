/**
 * i18n.js — Thai/English language toggle with localStorage persistence
 */

const LS_KEY = 'bakery-lang';
const listeners = [];
let currentLang = 'th';

const DICT = {
  // Header
  'header.title': { th: 'Bakery Analytics', en: 'Bakery Analytics' },
  'header.subtitle': { th: 'แดชบอร์ดวิเคราะห์เทรนด์ & คู่แข่ง', en: 'Trend & Competitor Analysis Dashboard' },
  'header.lastUpdate': { th: 'อัปเดตล่าสุด', en: 'Last updated' },
  'header.loading': { th: 'กำลังโหลด...', en: 'Loading...' },
  'header.unknown': { th: 'ไม่ทราบ', en: 'Unknown' },
  'header.refresh': { th: 'รีเฟรช', en: 'Refresh' },
  'banner.demo': { th: 'ข้อมูลจำลอง (Demo Data) เพื่อการทดสอบ', en: 'Demo Data — For Testing Purposes' },

  // Sidebar sections
  'nav.executive': { th: 'ภาพรวมผู้บริหาร', en: 'Executive Overview' },
  'nav.market': { th: 'เทรนด์ตลาด', en: 'Market Trends' },
  'nav.competitor': { th: 'วิเคราะห์คู่แข่ง', en: 'Competitor Analysis' },
  'nav.product': { th: 'เทรนด์สินค้า', en: 'Product Trends' },
  'nav.consumer': { th: 'พฤติกรรมผู้บริโภค', en: 'Consumer Behavior' },
  'nav.area': { th: 'พื้นที่/ภูมิภาค', en: 'Area / Region' },
  'nav.monitor': { th: 'ติดตามคู่แข่ง', en: 'Competitor Monitor' },
  'nav.ai-insight': { th: 'AI วิเคราะห์', en: 'AI Insights' },
  'nav.alert': { th: 'ศูนย์แจ้งเตือน', en: 'Alert Center' },
  'nav.qa': { th: 'ถาม-ตอบ สินค้า', en: 'Product Q&A' },
  'nav.action': { th: 'แผนปฏิบัติการ', en: 'Action Plans' },
  'nav.sources': { th: 'แหล่งที่มาข้อมูล', en: 'Data Sources' },

  // Sub-tabs — Market
  'tab.market-overview': { th: 'ภาพรวมตลาด', en: 'Market Overview' },
  'tab.market-growth': { th: 'การเติบโตตามหมวด', en: 'Category Growth' },
  'tab.market-seasonal': { th: 'เทรนด์ตามฤดูกาล', en: 'Seasonal Trends' },

  // Sub-tabs — Competitor
  'tab.comp-overview': { th: 'ภาพรวมคู่แข่ง', en: 'Competitor Overview' },
  'tab.comp-price': { th: 'เปรียบเทียบราคา', en: 'Price Comparison' },
  'tab.comp-product': { th: 'เปรียบเทียบสินค้า', en: 'Product Comparison' },
  'tab.comp-promo': { th: 'เปรียบเทียบโปรโมชัน', en: 'Promotion Comparison' },

  // Sub-tabs — Product
  'tab.prod-trending': { th: 'สินค้ายอดนิยม', en: 'Trending Products' },
  'tab.prod-category': { th: 'ตามหมวดหมู่', en: 'By Category' },
  'tab.prod-keyword': { th: 'คีย์เวิร์ดและการค้นหา', en: 'Keywords & Search' },

  // Sub-tabs — Consumer
  'tab.cons-behavior': { th: 'พฤติกรรมการซื้อ', en: 'Buying Behavior' },
  'tab.cons-sentiment': { th: 'ความรู้สึกและรีวิว', en: 'Sentiment & Reviews' },
  'tab.cons-social': { th: 'Social Listening', en: 'Social Listening' },

  // Sub-tabs — Area
  'tab.area-overview': { th: 'ภาพรวมภูมิภาค', en: 'Regional Overview' },
  'tab.area-channel': { th: 'ช่องทางจำหน่าย', en: 'Sales Channels' },
  'tab.area-heatmap': { th: 'แผนที่ความร้อน', en: 'Heatmap' },

  // Sub-tabs — Monitor
  'tab.mon-realtime': { th: 'กิจกรรมล่าสุด', en: 'Recent Activity' },
  'tab.mon-newproduct': { th: 'สินค้าใหม่', en: 'New Products' },
  'tab.mon-pricing': { th: 'การเปลี่ยนแปลงราคา', en: 'Price Changes' },

  // Sub-tabs — AI Insight
  'tab.ai-summary': { th: 'สรุปอัตโนมัติ', en: 'Auto Summary' },
  'tab.ai-forecast': { th: 'พยากรณ์แนวโน้ม', en: 'Trend Forecast' },
  'tab.ai-recommend': { th: 'คำแนะนำ', en: 'Recommendations' },

  // Sub-tabs — Alert
  'tab.alert-active': { th: 'แจ้งเตือนปัจจุบัน', en: 'Active Alerts' },
  'tab.alert-history': { th: 'ประวัติ', en: 'History' },
  'tab.alert-settings': { th: 'ตั้งค่า', en: 'Settings' },

  // Sub-tabs — Action
  'tab.action-plan': { th: 'แผนงาน', en: 'Action Plan' },
  'tab.action-calendar': { th: 'ปฏิทิน', en: 'Calendar' },
  'tab.action-kpi': { th: 'KPI ติดตาม', en: 'KPI Tracking' },

  // Filter labels
  'filter.period': { th: 'ช่วงเวลา', en: 'Period' },
  'filter.year': { th: 'ปี', en: 'Year' },
  'filter.month': { th: 'เดือน', en: 'Month' },
  'filter.category': { th: 'หมวดหมู่', en: 'Category' },
  'filter.channel': { th: 'ช่องทาง', en: 'Channel' },
  'filter.region': { th: 'ภูมิภาค', en: 'Region' },
  'filter.competitor': { th: 'คู่แข่ง', en: 'Competitor' },
  'filter.platform': { th: 'แพลตฟอร์ม', en: 'Platform' },
  'filter.status': { th: 'สถานะ', en: 'Status' },
  'filter.priority': { th: 'ระดับ', en: 'Priority' },
  'filter.age': { th: 'กลุ่มอายุ', en: 'Age Group' },
  'filter.type': { th: 'ประเภท', en: 'Type' },

  // Common UI
  'ui.loadingModule': { th: 'กำลังโหลดโมดูล...', en: 'Loading module...' },
  'ui.noMount': { th: 'โมดูลไม่มีฟังก์ชัน mount()', en: 'Module has no mount() function' },
  'ui.loadError': { th: 'เกิดข้อผิดพลาดในการโหลดโมดูล', en: 'Error loading module' },
  'ui.sidebarTitle': { th: 'Bakery Analytics', en: 'Bakery Analytics' },
  'ui.toggleSidebar': { th: 'ย่อ/ขยายเมนู', en: 'Toggle sidebar' },
  'ui.openMenu': { th: 'เปิดเมนู', en: 'Open menu' },
};

function loadLang() {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored === 'th' || stored === 'en') currentLang = stored;
  } catch { /* ignore */ }
}

function saveLang() {
  try { localStorage.setItem(LS_KEY, currentLang); } catch { /* ignore */ }
}

export function t(key) {
  const entry = DICT[key];
  if (!entry) return key;
  return entry[currentLang] || entry.th || key;
}

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (lang !== 'th' && lang !== 'en') return;
  currentLang = lang;
  saveLang();
  document.documentElement.setAttribute('lang', lang);
  updateStaticText();
  for (const cb of listeners) {
    try { cb(lang); } catch (e) { console.error(e); }
  }
}

export function toggleLang() {
  setLang(currentLang === 'th' ? 'en' : 'th');
}

export function onLangChange(callback) {
  if (typeof callback === 'function') listeners.push(callback);
}

function updateStaticText() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  const btn = document.getElementById('lang-toggle');
  if (btn) {
    btn.textContent = currentLang === 'th' ? 'EN' : 'TH';
    btn.title = currentLang === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย';
  }
}

export function initI18n() {
  loadLang();
  document.documentElement.setAttribute('lang', currentLang);
  updateStaticText();
  const btn = document.getElementById('lang-toggle');
  if (btn) {
    btn.addEventListener('click', toggleLang);
  }
}
