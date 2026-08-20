/**
 * mon-pricing.js - Sub-tab: ติดตามราคาคู่แข่ง (Redesigned)
 * เพิ่ม severity indicators ตามระดับการเปลี่ยนแปลงราคา
 * + chart ราคาก่อน/หลัง + price index line + ตารางเปลี่ยนแปลงราคา
 * ข้อมูล demo ในตัว (hardcoded)
 * รองรับ filter reactive (เปลี่ยน filter -> ข้อมูลเปลี่ยนตาม)
 */
import { createChart, destroyAll, CHART_COLORS, BRAND_COLORS } from '../../shared/chart-factory.js';
import { buildFilterBar, onFilterChange, getFilterValues, PERIOD_FILTER, COMPETITOR_FILTER } from '../../shared/filter-builder.js';
import { varyValue, varyArray, filterByCompetitor } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

const STYLE_ID = 'mon-pricing-style';

/* ---------- ข้อมูล Demo ---------- */

const PRICE_CHANGES = [
  { brand: 'S&P',       brandId: 'snp',       product: 'เค้กช็อกโกแลต',    oldPrice: 280, newPrice: 299, date: '2026-08-03' },
  { brand: 'Yamazaki',  brandId: 'yamazaki',  product: 'ขนมปัง sandwich',   oldPrice: 42,  newPrice: 45,  date: '2026-07-28' },
  { brand: 'After You', brandId: 'afteryou',  product: 'ชีสเค้ก original',   oldPrice: 350, newPrice: 329, date: '2026-07-25' },
  { brand: 'Farmhouse', brandId: 'farmhouse', product: 'ขนมปังโฮลวีท',     oldPrice: 38,  newPrice: 42,  date: '2026-07-20' },
  { brand: 'Le Pain',   brandId: 'lepain',    product: 'ครัวซองต์เนยสด',    oldPrice: 85,  newPrice: 79,  date: '2026-07-15' },
  { brand: 'S&P',       brandId: 'snp',       product: 'ครัวซองต์อัลมอนด์',  oldPrice: 75,  newPrice: 82,  date: '2026-07-12' },
  { brand: 'Farmhouse', brandId: 'farmhouse', product: 'ขนมปังแซนวิช',     oldPrice: 32,  newPrice: 35,  date: '2026-07-10' },
  { brand: 'Yamazaki',  brandId: 'yamazaki',  product: 'โดนัทช็อกโกแลต',   oldPrice: 38,  newPrice: 35,  date: '2026-07-05' }
];

const PRICE_INDEX = [
  { month: 'มี.ค.', index: 100.0 },
  { month: 'เม.ย.', index: 101.2 },
  { month: 'พ.ค.', index: 102.5 },
  { month: 'มิ.ย.', index: 101.8 },
  { month: 'ก.ค.', index: 103.1 },
  { month: 'ส.ค.', index: 104.0 }
];

/* ---------- CSS Injection ---------- */

function injectCSS() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .mprice-severity {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
      font-size: 0.85rem;
      padding: 2px 10px;
      border-radius: 12px;
    }
    .mprice-severity-low {
      background: #dcfce7;
      color: #166534;
    }
    .mprice-severity-mid {
      background: #fef9c3;
      color: #854d0e;
    }
    .mprice-severity-high {
      background: #fee2e2;
      color: #991b1b;
    }
    .mprice-change-up { color: #dc2626; font-weight: 600; }
    .mprice-change-down { color: #16a34a; font-weight: 600; }
    .mprice-brand { font-weight: 600; }
    .mprice-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .mprice-table-wrap table { min-width: 800px; }
    .mprice-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }
    .mprice-summary-card {
      background: #fff;
      border-radius: 10px;
      padding: 16px;
      text-align: center;
      border: 1px solid rgba(0,0,0,0.06);
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .mprice-summary-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a202c;
    }
    .mprice-summary-label {
      font-size: 0.8rem;
      color: #718096;
      margin-top: 4px;
    }
  `;
  document.head.appendChild(style);
}

function removeCSS() {
  const el = document.getElementById(STYLE_ID);
  if (el) el.remove();
}

/* ---------- Helpers ---------- */

function fmtDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

function calcChange(oldP, newP) {
  const pct = ((newP - oldP) / oldP * 100).toFixed(1);
  return { pct: Number(pct), label: `${Number(pct) > 0 ? '+' : ''}${pct}%` };
}

/**
 * กำหนด severity จากขนาดการเปลี่ยนแปลง (%)
 * < 5%: เปลี่ยนแปลงเล็กน้อย
 * 5-10%: เปลี่ยนแปลงปานกลาง
 * > 10%: เปลี่ยนแปลงมาก
 */
function getSeverity(pct) {
  const abs = Math.abs(pct);
  if (abs >= 10) return { icon: '\u{1F534}', label: 'สูง',     cls: 'mprice-severity-high' };
  if (abs >= 5)  return { icon: '\u{1F7E1}', label: 'ปานกลาง', cls: 'mprice-severity-mid' };
  return { icon: '\u{1F7E2}', label: 'เล็กน้อย', cls: 'mprice-severity-low' };
}

/* ---------- Render Content (filter-reactive) ---------- */

function renderContent(container, filters) {
  destroyAll();

  const contentEl = container.querySelector('.mon-pricing-content');

  // กรอง price changes ตาม competitor
  const filteredChanges = filterByCompetitor(PRICE_CHANGES, filters, 'brandId');

  // Vary ราคาตาม filter
  const variedChanges = filteredChanges.map((p, i) => {
    const oldP = varyValue(p.oldPrice, filters, { seed: 1000 + i, asInt: true, min: 1 });
    const newP = varyValue(p.newPrice, filters, { seed: 1010 + i, asInt: true, min: 1 });
    return { ...p, oldPrice: oldP, newPrice: newP };
  });

  // Vary price index ตาม filter
  const variedIndex = PRICE_INDEX.map((p, i) => ({
    month: p.month,
    index: varyValue(p.index, filters, { seed: 1020 + i })
  }));

  // สรุป
  const totalChanges = variedChanges.length;
  const increases = variedChanges.filter(p => p.newPrice > p.oldPrice).length;
  const decreases = variedChanges.filter(p => p.newPrice < p.oldPrice).length;
  const avgChange = totalChanges > 0
    ? (variedChanges.reduce((s, p) => s + ((p.newPrice - p.oldPrice) / p.oldPrice * 100), 0) / totalChanges).toFixed(1)
    : '0.0';

  const summaryHTML = `
    <div class="mprice-summary">
      <div class="mprice-summary-card">
        <div class="mprice-summary-value">${totalChanges}</div>
        <div class="mprice-summary-label">รายการที่เปลี่ยนแปลง</div>
      </div>
      <div class="mprice-summary-card">
        <div class="mprice-summary-value" style="color:#dc2626">${increases} &#9650;</div>
        <div class="mprice-summary-label">ราคาขึ้น</div>
      </div>
      <div class="mprice-summary-card">
        <div class="mprice-summary-value" style="color:#16a34a">${decreases} &#9660;</div>
        <div class="mprice-summary-label">ราคาลง</div>
      </div>
      <div class="mprice-summary-card">
        <div class="mprice-summary-value">${avgChange > 0 ? '+' : ''}${avgChange}%</div>
        <div class="mprice-summary-label">เปลี่ยนแปลงเฉลี่ย</div>
      </div>
    </div>`;

  const tableRows = variedChanges.map(p => {
    const { pct, label } = calcChange(p.oldPrice, p.newPrice);
    const changeCls = pct > 0 ? 'mprice-change-up' : 'mprice-change-down';
    const severity = getSeverity(pct);
    return `
      <tr>
        <td><span class="mprice-brand" style="color:${BRAND_COLORS[p.brandId] || '#555'}">${p.brand}</span></td>
        <td>${p.product}</td>
        <td class="num">${p.oldPrice} ฿</td>
        <td class="num">${p.newPrice} ฿</td>
        <td class="num ${changeCls}">${label}</td>
        <td class="num"><span class="mprice-severity ${severity.cls}">${severity.icon} ${severity.label}</span></td>
        <td class="num">${fmtDate(p.date)}</td>
      </tr>`;
  }).join('');

  const emptyTable = variedChanges.length === 0
    ? '<tr><td colspan="7" style="text-align:center;color:#a0aec0;padding:40px 0">ไม่พบข้อมูลในเงื่อนไขที่เลือก</td></tr>'
    : '';

  contentEl.innerHTML = `
    ${summaryHTML}
    <div class="chart-grid">
      <div class="chart-card">
        <h3 class="chart-card-title">ราคาก่อน / หลังปรับ</h3>
        <p style="font-size:0.8rem;color:#718096;margin:-8px 0 8px">เปรียบเทียบราคาสินค้าที่มีการเปลี่ยนแปลงล่าสุด</p>
        <div class="chart-container"><canvas id="chart-price-change"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">ดัชนีราคาเฉลี่ยตลาด</h3>
        <p style="font-size:0.8rem;color:#718096;margin:-8px 0 8px">Price Index (ฐาน = 100, 6 เดือนล่าสุด)</p>
        <div class="chart-container"><canvas id="chart-price-index"></canvas></div>
      </div>
    </div>
    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">ตารางเปลี่ยนแปลงราคา</h3>
      <div class="mprice-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>แบรนด์</th>
              <th>สินค้า</th>
              <th class="num">ราคาเดิม</th>
              <th class="num">ราคาใหม่</th>
              <th class="num">เปลี่ยนแปลง</th>
              <th class="num">ระดับ</th>
              <th class="num">วันที่</th>
            </tr>
          </thead>
          <tbody>${tableRows || emptyTable}</tbody>
        </table>
      </div>
    </div>
  `;

  // --- Charts ---

  // Price Change Bar (grouped)
  if (variedChanges.length > 0) {
    createChart('chart-price-change', {
      type: 'bar',
      data: {
        labels: variedChanges.map(p => `${p.brand} - ${p.product}`),
        datasets: [
          {
            label: 'ราคาเดิม',
            data: variedChanges.map(p => p.oldPrice),
            backgroundColor: '#94a3b8',
            borderRadius: 6
          },
          {
            label: 'ราคาใหม่',
            data: variedChanges.map(p => p.newPrice),
            backgroundColor: variedChanges.map(p =>
              p.newPrice > p.oldPrice ? '#dc2626' : '#16a34a'
            ),
            borderRadius: 6
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#4a5568', usePointStyle: true, padding: 12 }
          },
          tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y} บาท` } }
        },
        scales: {
          x: { ticks: { color: '#4a5568', font: { size: 9 }, maxRotation: 45 }, grid: { color: 'rgba(0,0,0,0.06)' } },
          y: {
            beginAtZero: true,
            ticks: { color: '#4a5568', callback: v => `${v} ฿` },
            grid: { color: 'rgba(0,0,0,0.06)' }
          }
        }
      }
    });
  }

  // Price Index Line
  createChart('chart-price-index', {
    type: 'line',
    data: {
      labels: variedIndex.map(p => p.month),
      datasets: [{
        label: 'Price Index',
        data: variedIndex.map(p => p.index),
        borderColor: CHART_COLORS[1],
        backgroundColor: CHART_COLORS[1] + '33',
        borderWidth: 3,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: CHART_COLORS[1],
        fill: true
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `Index: ${ctx.parsed.y.toFixed(1)}` } }
      },
      scales: {
        x: { ticks: { color: '#4a5568' }, grid: { color: 'rgba(0,0,0,0.06)' } },
        y: {
          min: 98,
          ticks: { color: '#4a5568', callback: v => v.toFixed(0) },
          grid: { color: 'rgba(0,0,0,0.06)' },
          title: { display: true, text: 'Price Index', color: '#4a5568' }
        }
      }
    }
  });
}

/* ---------- Tab lifecycle ---------- */

export async function mount(container) {
  const thisMount = ++mountId;
  injectCSS();

  container.innerHTML = `
    <div class="tab-content">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">กำลังโหลดข้อมูลราคาคู่แข่ง...</p>
      </div>
    </div>`;

  try {
    await Promise.resolve();
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">${buildFilterBar([PERIOD_FILTER, COMPETITOR_FILTER])}<div class="mon-pricing-content"></div></div>`;

    function render(filters) { renderContent(container, filters); }

    render(getFilterValues(container));

    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('MonPricing mount error:', err);
    container.innerHTML = `
      <div class="tab-content">
        <div class="error-state">
          <p class="error-state-text">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        </div>
      </div>`;
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
  removeCSS();
}
