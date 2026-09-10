/**
 * comp-promo.js - Sub-tab: วิเคราะห์โปรโมชั่นคู่แข่ง (Redesigned)
 * 3 Charts: Promotion Activity Stacked Bar, Type Distribution Doughnut, Promotion Impact Bar
 * + Promotion Tracking Table (15 rows)
 * ข้อมูล mock ในตัว (hardcoded)
 * รองรับ reactive filters (period, competitor, channel)
 */
import { createChart, destroyAll, BRAND_COLORS, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import { buildFilterBar, getFilterValues, onFilterChange, PERIOD_FILTER, COMPETITOR_FILTER, CHANNEL_FILTER } from '../../shared/filter-builder.js';
import { varyValue, varyPercent, varyArray, filterByCompetitor } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

const STYLE_ID = 'comp-promo-style';

/* ---------- Mock Data ---------- */

// 8 ประเภทโปรโมชั่นที่ติดตาม
const PROMO_TYPE_LIST = ['ลดราคา', 'ซื้อ1แถม1', 'ซื้อ2แถม1', 'Bundle', 'Coupon', 'Member Price', 'เทศกาล', 'ตาม Channel'];

// Stacked bar: จำนวนแต่ละประเภทต่อแบรนด์
const PROMO_BY_BRAND = {
  brands: [
    { id: 'snp',       name: 'S&P' },
    { id: 'afteryou',  name: 'After You' },
    { id: 'farmhouse', name: 'Farmhouse' },
    { id: 'yamazaki',  name: 'Yamazaki' },
    { id: 'wanwanach', name: 'วรรณวนัช' },
    { id: 'breadtalk', name: 'BreadTalk' }
  ],
  // [ลดราคา, ซื้อ1แถม1, ซื้อ2แถม1, Bundle, Coupon, Member Price, เทศกาล, ตาม Channel]
  data: {
    snp:       [4, 2, 1, 2, 1, 3, 2, 2],
    afteryou:  [1, 1, 0, 1, 0, 2, 3, 0],
    farmhouse: [3, 3, 1, 0, 3, 0, 1, 4],
    yamazaki:  [2, 1, 1, 1, 0, 1, 1, 1],
    wanwanach: [2, 1, 1, 1, 2, 1, 1, 1],
    breadtalk: [2, 0, 0, 1, 1, 0, 1, 1]
  }
};

// สัดส่วนประเภทโปรโมชั่น (รวมทั้งตลาด)
const PROMO_TYPE_DIST = [
  { type: 'ลดราคา',      pct: 25 },
  { type: 'ซื้อ1แถม1',   pct: 15 },
  { type: 'ซื้อ2แถม1',   pct: 8 },
  { type: 'Bundle',      pct: 12 },
  { type: 'Coupon',      pct: 14 },
  { type: 'Member Price', pct: 8 },
  { type: 'เทศกาล',      pct: 10 },
  { type: 'ตาม Channel', pct: 8 }
];

// ผลกระทบโปรโมชั่น (estimated sales lift)
const PROMO_IMPACT = [
  { type: 'ลดราคา',      lift: 15 },
  { type: 'ซื้อ1แถม1',   lift: 35 },
  { type: 'ซื้อ2แถม1',   lift: 25 },
  { type: 'Bundle',      lift: 20 },
  { type: 'Coupon',      lift: 10 },
  { type: 'Member Price', lift: 8 },
  { type: 'เทศกาล',      lift: 28 },
  { type: 'ตาม Channel', lift: 12 }
];

// ตารางโปรโมชั่น 15 รายการ
const PROMO_TABLE = [
  { brand: 'S&P',        brandId: 'snp',       type: 'Member Price', detail: 'Joy Card สมาชิกลด 10% ทุกเมนู',         period: 'ตลอดปี',       discount: '10%',  channel: 'ทุกสาขา',     impact: 'mid' },
  { brand: 'S&P',        brandId: 'snp',       type: 'ลดราคา',      detail: 'ลด 20% ทุกวันพุธ-เสาร์',               period: 'ตลอดปี',       discount: '20%',  channel: 'ทุกสาขา',     impact: 'high' },
  { brand: 'S&P',        brandId: 'snp',       type: 'เทศกาล',      detail: 'วันเกิดลดเพิ่ม 20% (ซื้อ 500+)',        period: 'เดือนเกิด',    discount: '20%',  channel: 'ทุกสาขา',     impact: 'mid' },
  { brand: 'After You',  brandId: 'afteryou',  type: 'ซื้อ1แถม1',   detail: 'JCB Ultimate Card ซื้อ1แถม1',           period: '1 ม.ค.-31 ธ.ค. 69', discount: '50%', channel: 'ร้าน',     impact: 'high' },
  { brand: 'After You',  brandId: 'afteryou',  type: 'Coupon',      detail: 'Samsung Galaxy ลด 20 บาททุกเมนู',       period: 'ตลอดปี',       discount: '฿20',  channel: 'ร้าน',        impact: 'low' },
  { brand: 'After You',  brandId: 'afteryou',  type: 'เทศกาล',      detail: 'Limited Edition เมนูฤดูกาล (FOMO)',      period: 'ทุกไตรมาส',    discount: '-',    channel: 'ร้าน/Online', impact: 'high' },
  { brand: 'After You',  brandId: 'afteryou',  type: 'Member Price', detail: 'After You App สะสมแต้ม 1pt/฿100',      period: 'ตลอดปี',       discount: '5-10%', channel: 'ร้าน',       impact: 'mid' },
  { brand: 'Farmhouse',  brandId: 'farmhouse', type: 'ซื้อ1แถม1',   detail: 'ขนมปังแซนวิช BOGO ที่ 7-11',           period: 'ทุก 2 สัปดาห์', discount: '50%',  channel: '7-11',        impact: 'high' },
  { brand: 'Farmhouse',  brandId: 'farmhouse', type: 'Coupon',      detail: 'คูปอง LINE OA ลด ฿5',                  period: 'รายเดือน',     discount: '฿5',   channel: 'Online',      impact: 'low' },
  { brand: 'Farmhouse',  brandId: 'farmhouse', type: 'ตาม Channel', detail: 'ลดพิเศษเฉพาะ Lotus/BigC/Tops',          period: 'สลับสัปดาห์',  discount: '10-15%', channel: 'MT',        impact: 'mid' },
  { brand: 'Yamazaki',   brandId: 'yamazaki',  type: 'ลดราคา',      detail: 'ลด 15-20% กลุ่ม Classic ตามสาขา',       period: 'ทุกเดือน',     discount: '15-20%', channel: 'ห้าง/BTS',  impact: 'mid' },
  { brand: 'Yamazaki',   brandId: 'yamazaki',  type: 'Bundle',      detail: 'Set ขนมปัง 3 ชิ้น ราคาพิเศษ',          period: 'ทุกสัปดาห์',   discount: '20%',  channel: 'ร้าน',        impact: 'low' },
  { brand: 'BreadTalk',  brandId: 'breadtalk', type: 'ลดราคา',      detail: 'โปรสินค้าเลือก 3 ชิ้น ฿99',            period: 'รายสัปดาห์',   discount: '25-30%', channel: 'ร้าน',      impact: 'mid' },
  { brand: 'วรรณวนัช',   brandId: 'wanwanach', type: 'เทศกาล',      detail: 'เทศกาลแม่ เค้กวันแม่ลด 15%',           period: '5-12 ส.ค.',    discount: '15%',  channel: 'ทุกช่องทาง',   impact: 'high' },
  { brand: 'วรรณวนัช',   brandId: 'wanwanach', type: 'ซื้อ1แถม1',   detail: 'คุกกี้ BOGO ทุกวันศุกร์',              period: 'ทุกศุกร์',     discount: '50%',  channel: 'ร้าน/CJ',    impact: 'mid' }
];

/* ---------- CSS Injection ---------- */

function injectCSS() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .cpromo-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .cpromo-table-wrap table { min-width: 900px; }
    .cpromo-impact {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
      font-size: 0.85rem;
    }
    .cpromo-impact-high { color: #dc2626; }
    .cpromo-impact-mid  { color: #f59e0b; }
    .cpromo-impact-low  { color: #16a34a; }
    .cpromo-type-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #e2e8f0;
      color: #4a5568;
    }
  `;
  document.head.appendChild(style);
}

function removeCSS() {
  const el = document.getElementById(STYLE_ID);
  if (el) el.remove();
}

/* ---------- renderContent (reactive) ---------- */

function renderContent(container, filters) {
  destroyAll();

  const contentEl = container.querySelector('.comp-promo-content');
  if (!contentEl) return;

  const f = filters;

  // กรองแบรนด์ตาม competitor filter
  const filteredBrands = filterByCompetitor(PROMO_BY_BRAND.brands, f, 'id');
  if (filteredBrands.length === 0) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-text">ไม่พบข้อมูลโปรโมชั่นในเงื่อนไขที่เลือก</p>
      </div>`;
    return;
  }

  // --- Chart area HTML ---
  contentEl.innerHTML = `
    <div class="chart-grid">
      <div class="chart-card full-width">
        <h3 class="chart-card-title">โปรโมชั่นแต่ละแบรนด์ตามประเภท (Promotion Activity)</h3>
        <div class="chart-container"><canvas id="chart-promo-stacked"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">สัดส่วนประเภทโปรโมชั่น</h3>
        <div class="chart-container chart-tall"><canvas id="chart-promo-types"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">ผลกระทบของโปรโมชั่น (Sales Lift)</h3>
        <div class="chart-container chart-tall"><canvas id="chart-promo-impact"></canvas></div>
      </div>
    </div>
    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">ตารางติดตามโปรโมชั่นคู่แข่ง</h3>
      <div id="comp-promo-table"></div>
    </div>
  `;

  // --- Promotion Activity Stacked Bar ---
  const typeColors = ['#dc2626', '#f59e0b', '#16a34a', '#3498db', '#9b59b6', '#e91e63', '#f39c12', '#1abc9c'];

  const stackedDatasets = PROMO_TYPE_LIST.map((type, idx) => ({
    label: type,
    data: filteredBrands.map((b, bIdx) => {
      const base = PROMO_BY_BRAND.data[b.id] ? PROMO_BY_BRAND.data[b.id][idx] : 0;
      return varyValue(base, f, { seed: 100 + idx * 10 + bIdx, asInt: true, min: 0 });
    }),
    backgroundColor: typeColors[idx],
    borderColor: typeColors[idx],
    borderWidth: 1,
    borderRadius: 2
  }));

  createChart('chart-promo-stacked', {
    type: 'bar',
    data: {
      labels: filteredBrands.map(b => b.name),
      datasets: stackedDatasets
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#4a5568', usePointStyle: true, padding: 8, font: { size: 11 } }
        },
        tooltip: {
          callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y} รายการ` }
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: '#4a5568' },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: { color: '#4a5568', stepSize: 2 },
          grid: { color: 'rgba(0,0,0,0.06)' }
        }
      }
    }
  });

  // --- Promotion Type Distribution Doughnut ---
  const typePcts = PROMO_TYPE_DIST.map((t, i) => varyPercent(t.pct, f, { seed: 200 + i }));

  createChart('chart-promo-types', {
    type: 'doughnut',
    data: {
      labels: PROMO_TYPE_DIST.map(t => t.type),
      datasets: [{
        data: typePcts,
        backgroundColor: typeColors,
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      cutout: '55%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#4a5568', padding: 8, usePointStyle: true, font: { size: 11 } }
        },
        tooltip: {
          callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed}%` }
        }
      }
    }
  });

  // --- Promotion Impact Bar (เรียงตาม lift สูง -> ต่ำ) ---
  const impactSorted = [...PROMO_IMPACT]
    .map((d, i) => ({ ...d, vLift: varyPercent(d.lift, f, { seed: 300 + i }) }))
    .sort((a, b) => b.vLift - a.vLift);

  const impactColors = impactSorted.map(d => {
    if (d.vLift >= 25) return '#dc2626';
    if (d.vLift >= 15) return '#f59e0b';
    return '#16a34a';
  });

  createChart('chart-promo-impact', {
    type: 'bar',
    data: {
      labels: impactSorted.map(d => d.type),
      datasets: [{
        label: 'Sales Lift (%)',
        data: impactSorted.map(d => d.vLift),
        backgroundColor: impactColors,
        borderColor: impactColors,
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `+${ctx.parsed.x}% sales lift` } }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { color: '#4a5568', callback: v => `+${v}%` },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: {
          ticks: { color: '#4a5568', font: { size: 11 } },
          grid: { color: 'rgba(0,0,0,0.06)' }
        }
      }
    }
  });

  // --- Promotion Tracking Table ---
  const tableEl = document.getElementById('comp-promo-table');
  if (tableEl) {
    // กรองตาราง: competitor filter
    const filteredTable = filterByCompetitor(PROMO_TABLE, f, 'brandId');

    const impactMap = {
      high: { icon: '&#128308;', text: 'สูง',  cls: 'cpromo-impact-high' },
      mid:  { icon: '&#128993;', text: 'กลาง', cls: 'cpromo-impact-mid' },
      low:  { icon: '&#128994;', text: 'ต่ำ',   cls: 'cpromo-impact-low' }
    };

    const rows = filteredTable.map(p => {
      const imp = impactMap[p.impact] || impactMap.low;
      return `
        <tr>
          <td style="white-space:nowrap"><span style="color:${BRAND_COLORS[p.brandId] || '#555'};font-weight:600">${p.brand}</span></td>
          <td><span class="cpromo-type-badge">${p.type}</span></td>
          <td>${p.detail}</td>
          <td class="num" style="white-space:nowrap">${p.period}</td>
          <td class="num">${p.discount}</td>
          <td>${p.channel}</td>
          <td class="num"><span class="cpromo-impact ${imp.cls}">${imp.icon} ${imp.text}</span></td>
        </tr>`;
    }).join('');

    tableEl.innerHTML = `
      <div class="cpromo-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>คู่แข่ง</th>
              <th>ประเภท</th>
              <th>รายละเอียด</th>
              <th class="num">ช่วงเวลา</th>
              <th class="num">ส่วนลด</th>
              <th>Channel</th>
              <th class="num">ผลกระทบ</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }
}

/* ---------- Tab lifecycle ---------- */

export async function mount(container) {
  const thisMount = ++mountId;
  injectCSS();

  container.innerHTML = `
    <div class="tab-content">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">กำลังโหลดข้อมูลโปรโมชั่น...</p>
      </div>
    </div>`;

  // จำลอง async เล็กน้อยเพื่อให้ loading state แสดงก่อน DOM render
  await new Promise(r => setTimeout(r, 50));

  if (thisMount !== mountId) return;

  container.innerHTML = `
    <div class="tab-content">
      ${buildFilterBar([PERIOD_FILTER, COMPETITOR_FILTER, CHANNEL_FILTER])}
      <div class="comp-promo-content"></div>
    </div>`;

  function render(filters) { renderContent(container, filters); }
  render(getFilterValues(container));
  filterCleanup = onFilterChange(container, render);
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
  removeCSS();
}
