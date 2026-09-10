/**
 * i18n.js — สลับภาษาไทย/อังกฤษ พร้อมจำค่าไว้ใน localStorage
 */

const LS_KEY = 'hb-lang';
const listeners = [];
let currentLang = 'th';

const DICT = {
  // ── คีย์ของโครงสร้าง Health Bento 8 หมวด (กู้กลับ) ──
  'nav.overview': { th: 'ภาพรวมธุรกิจ', en: 'Business Overview' },
  'nav.product': { th: 'เมนู & ราคา', en: 'Menu & Pricing' },
  'nav.ops': { th: 'ผลิต & จัดส่ง', en: 'Kitchen & Delivery' },
  'nav.marketing': { th: 'การตลาด & ช่องทาง', en: 'Marketing & Channels' },
  'nav.retail': { th: 'ห้าง / Modern Trade', en: 'Retail / Modern Trade' },
  'nav.plan': { th: 'แผนดำเนินงาน', en: 'Execution Plan' },
  'nav.sources': { th: 'แหล่งที่มาข้อมูล', en: 'Data Sources' },
  'tab.market-size': { th: 'ขนาดตลาด & การเติบโต', en: 'Market Size & Growth' },
  'tab.market-persona': { th: 'กลุ่มลูกค้าเป้าหมาย', en: 'Target Customers' },
  'tab.market-competitor': { th: 'คู่แข่งในตลาด', en: 'Competitors' },
  'tab.market-lowcarb': { th: 'โปรตีนสูง & โลว์คาร์บ', en: 'High-Protein & Low-Carb' },
  'tab.market-survey': { th: 'สำรวจราคาตลาดจริง', en: 'Real Price Survey' },
  'tab.prod-menu': { th: 'เมนู & โภชนาการ', en: 'Menu & Nutrition' },
  'tab.prod-price': { th: 'โครงสร้างราคา', en: 'Pricing Structure' },
  'tab.prod-cost': { th: 'ต้นทุน & กำไรต่อกล่อง', en: 'Cost & Margin per Box' },
  'tab.ops-capacity': { th: 'ครัวกลาง & กำลังผลิต', en: 'Central Kitchen & Capacity' },
  'tab.ops-supply': { th: 'วัตถุดิบ & ซัพพลายเออร์', en: 'Ingredients & Suppliers' },
  'tab.ops-delivery': { th: 'จัดส่ง & โลจิสติกส์', en: 'Delivery & Logistics' },
  'tab.mkt-channel': { th: 'ช่องทางขาย', en: 'Sales Channels' },
  'tab.mkt-campaign': { th: 'แคมเปญ & แพ็กเกจสมาชิก', en: 'Campaigns & Subscriptions' },
  'tab.retail-chains': { th: 'ทุกห้าง & กลุ่มลูกค้า', en: 'Chains & Customers' },
  'tab.retail-terms': { th: 'เงื่อนไขวางขาย', en: 'Trading Terms' },
  'tab.retail-shelf': { th: 'คู่แข่งบนชั้นวาง', en: 'On-shelf Competitors' },
  'tab.retail-potential': { th: 'ศักยภาพยอดขาย', en: 'Sales Potential' },
  'tab.fin-invest': { th: 'เงินลงทุนเริ่มต้น', en: 'Initial Investment' },
  'tab.fin-pnl': { th: 'ประมาณการกำไรขาดทุน', en: 'P&L Projection' },
  'tab.fin-breakeven': { th: 'จุดคุ้มทุน & กระแสเงินสด', en: 'Break-even & Cash Flow' },
  'tab.plan-roadmap': { th: 'ไทม์ไลน์ 12 เดือน', en: '12-Month Roadmap' },
  'tab.plan-risk': { th: 'ความเสี่ยง & แผนรับมือ', en: 'Risks & Mitigation' },

  // Header
  'header.title': { th: 'Health Bento', en: 'Health Bento' },
  'header.subtitle': { th: 'ข้าวกล่องเพื่อสุขภาพ — แผนธุรกิจ & แดชบอร์ด', en: 'Healthy Meal Box — Business Plan & Dashboard' },
  'header.lastUpdate': { th: 'อัปเดตล่าสุด', en: 'Last updated' },
  'header.loading': { th: 'กำลังโหลด...', en: 'Loading...' },
  'header.unknown': { th: 'ไม่ทราบ', en: 'Unknown' },
  'header.refresh': { th: 'รีเฟรช', en: 'Refresh' },

  // เมนูด้านซ้าย (5 sections)
  'nav.bizplan': { th: 'แผนธุรกิจ', en: 'Business Plan' },
  'nav.menu': { th: 'จัดการเมนู', en: 'Menu Management' },
  'nav.market': { th: 'ตลาด & ลูกค้า', en: 'Market & Customers' },
  'nav.finance': { th: 'การเงิน', en: 'Financials' },
  'nav.orders': { th: 'ออเดอร์/การขาย', en: 'Orders & Sales' },

  // แท็บย่อย — แผนธุรกิจ
  'tab.biz-overview': { th: 'ภาพรวมธุรกิจ', en: 'Business Overview' },
  'tab.biz-swot': { th: 'SWOT Analysis', en: 'SWOT Analysis' },
  'tab.biz-model': { th: 'Business Model Canvas', en: 'Business Model Canvas' },
  'tab.biz-timeline': { th: 'แผนดำเนินงาน', en: 'Execution Timeline' },

  // แท็บย่อย — จัดการเมนู
  'tab.menu-catalog': { th: 'แคตตาล็อกเมนู', en: 'Menu Catalog' },
  'tab.menu-nutrition': { th: 'โภชนาการ', en: 'Nutrition' },
  'tab.menu-cost': { th: 'ต้นทุนเมนู', en: 'Menu Costing' },
  'tab.menu-plan': { th: 'แผนเมนูรายสัปดาห์', en: 'Weekly Menu Plan' },

  // แท็บย่อย — วิเคราะห์ตลาด
  'tab.mkt-overview': { th: 'ภาพรวมตลาด', en: 'Market Overview' },
  'tab.mkt-target': { th: 'กลุ่มเป้าหมาย', en: 'Target Segments' },
  'tab.mkt-competitor': { th: 'คู่แข่ง', en: 'Competitors' },

  // แท็บย่อย — การเงิน
  'tab.fin-summary': { th: 'สรุปการเงิน', en: 'Financial Summary' },
  'tab.fin-revenue': { th: 'ประมาณการรายรับ', en: 'Revenue Forecast' },
  'tab.fin-cost': { th: 'โครงสร้างต้นทุน', en: 'Cost Structure' },
  'tab.fin-cashflow': { th: 'กระแสเงินสด', en: 'Cash Flow' },

  // แท็บย่อย — ออเดอร์/การขาย
  'tab.ord-dashboard': { th: 'Dashboard ออเดอร์', en: 'Order Dashboard' },
  'tab.ord-history': { th: 'ประวัติออเดอร์', en: 'Order History' },
  'tab.ord-analytics': { th: 'วิเคราะห์ออเดอร์', en: 'Order Analytics' },

  // ป้ายฟิลเตอร์
  'filter.year': { th: 'ปีตามแผน', en: 'Plan Year' },
  'filter.period': { th: 'ช่วงเวลา', en: 'Period' },
  'filter.month': { th: 'เดือน', en: 'Month' },
  'filter.menu': { th: 'หมวดเมนู', en: 'Menu Category' },
  'filter.channel': { th: 'ช่องทางขาย', en: 'Sales Channel' },
  'filter.region': { th: 'พื้นที่', en: 'Area' },
  'filter.customer': { th: 'กลุ่มลูกค้า', en: 'Customer Group' },
  'filter.competitor': { th: 'คู่แข่ง', en: 'Competitor' },
  'filter.scenario': { th: 'สถานการณ์', en: 'Scenario' },
  'filter.chain': { th: 'ห้าง', en: 'Retail Chain' },
  'filter.format': { th: 'รูปแบบร้าน', en: 'Store Format' },
  'filter.segment': { th: 'กลุ่มย่อย', en: 'Sub-segment' },
  'filter.diet': { th: 'เกณฑ์เมนู', en: 'Diet Rule' },
  'filter.status': { th: 'สถานะ', en: 'Status' },
  'filter.priority': { th: 'ระดับ', en: 'Level' },

  // ข้อความ UI ทั่วไป
  'ui.loadingModule': { th: 'กำลังโหลดโมดูล...', en: 'Loading module...' },
  'ui.noMount': { th: 'โมดูลไม่มีฟังก์ชัน mount()', en: 'Module has no mount() function' },
  'ui.loadError': { th: 'เกิดข้อผิดพลาดในการโหลดโมดูล', en: 'Error loading module' },
  'ui.sidebarTitle': { th: 'Health Bento', en: 'Health Bento' },
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
