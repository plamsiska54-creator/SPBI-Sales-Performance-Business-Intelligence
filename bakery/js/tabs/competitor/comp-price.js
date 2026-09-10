/**
 * comp-price.js - Sub-tab: วิเคราะห์ราคาคู่แข่ง (Redesigned)
 * 4 Charts: Price Comparison Bar, Price per Gram, Price Positioning Map, Normal vs Promo Price
 * + Price Table พร้อม color-coded ส่วนต่าง
 * ข้อมูลจาก competitors.json + enriched mock data
 * รองรับ reactive filters (period, category, competitor)
 */
import { createChart, destroyAll, BRAND_COLORS, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import { buildFilterBar, getFilterValues, onFilterChange, PERIOD_FILTER, CATEGORY_FILTER, COMPETITOR_FILTER } from '../../shared/filter-builder.js';
import { varyValue, varyPercent, varyArray, filterByCompetitor } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

const STYLE_ID = 'comp-price-style';

/* ---------- Mock Data ---------- */

// ราคาเปรียบเทียบรายสินค้า: เรา vs คู่แข่ง vs ตลาด
const PRICE_TABLE_DATA = [
  { product: 'ครัวซองต์',      ours: 55,  compA: 50,  compB: 49,  market: 45 },
  { product: 'ขนมปังแซนวิช',  ours: 35,  compA: 29,  compB: 24,  market: 30 },
  { product: 'เค้กชิ้น',       ours: 175, compA: 169, compB: 195, market: 180 },
  { product: 'คุกกี้กล่อง',    ours: 149, compA: 139, compB: 199, market: 159 },
  { product: 'โดนัท',         ours: 32,  compA: 29,  compB: 35,  market: 32 }
];

// ราคาต่อกรัม
const PRICE_PER_GRAM = [
  { product: 'ขนมปังแซนวิช', wanwanach: 0.44, snp: 0.53, afteryou: null, farmhouse: 0.10, yamazaki: 0.36, breadtalk: 0.89 },
  { product: 'เค้กชิ้น',      wanwanach: 1.06, snp: 1.05, afteryou: 1.63, farmhouse: null, yamazaki: null, breadtalk: 1.41 },
  { product: 'ครัวซองต์',     wanwanach: 0.79, snp: null, afteryou: null, farmhouse: null, yamazaki: 0.26, breadtalk: 0.71 },
  { product: 'คุกกี้กล่อง',   wanwanach: 1.06, snp: 0.99, afteryou: null, farmhouse: null, yamazaki: null, breadtalk: null }
];

// ราคาปกติ vs ราคาโปรโมชั่น
const NORMAL_VS_PROMO = [
  { brand: 'วรรณวนัช',   brandId: 'wanwanach', normal: 55,  promo: 47 },
  { brand: 'S&P',        brandId: 'snp',       normal: 75,  promo: 60 },
  { brand: 'After You',  brandId: 'afteryou',  normal: 205, promo: 195 },
  { brand: 'Farmhouse',  brandId: 'farmhouse', normal: 32,  promo: 27 },
  { brand: 'Yamazaki',   brandId: 'yamazaki',  normal: 34,  promo: 29 },
  { brand: 'BreadTalk',  brandId: 'breadtalk', normal: 50,  promo: 43 }
];

/* ---------- CSS Injection ---------- */

function injectCSS() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .cp-diff-positive { color: #16a34a; font-weight: 600; }
    .cp-diff-negative { color: #dc2626; font-weight: 600; }
    .cp-diff-neutral  { color: #718096; font-weight: 600; }
    .cp-price-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  `;
  document.head.appendChild(style);
}

function removeCSS() {
  const el = document.getElementById(STYLE_ID);
  if (el) el.remove();
}

/* ---------- Helpers ---------- */

function fmt(n) { return Number(n).toLocaleString('th-TH'); }

function calcDiffPct(ours, market) {
  if (!market || market === 0) return { pct: 0, label: '0%', cls: 'cp-diff-neutral' };
  const pct = ((ours - market) / market * 100).toFixed(1);
  const num = Number(pct);
  const cls = num < 0 ? 'cp-diff-positive' : num > 0 ? 'cp-diff-negative' : 'cp-diff-neutral';
  return { pct: num, label: `${num > 0 ? '+' : ''}${pct}%`, cls };
}

/* ---------- renderContent (reactive) ---------- */

function renderContent(container, data, filters) {
  destroyAll();

  const contentEl = container.querySelector('.comp-price-content');
  if (!contentEl) return;

  const allBrands = data.brands;
  if (!allBrands || allBrands.length === 0) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-text">ไม่พบข้อมูลราคาคู่แข่ง</p>
      </div>`;
    return;
  }

  const brands = filterByCompetitor(allBrands, filters, 'id');
  if (brands.length === 0) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-text">ไม่พบข้อมูลราคาในเงื่อนไขที่เลือก</p>
      </div>`;
    return;
  }

  const f = filters;

  // --- Chart area HTML ---
  contentEl.innerHTML = `
    <div class="chart-grid">
      <div class="chart-card full-width">
        <h3 class="chart-card-title">เปรียบเทียบราคาสินค้า (เรา vs คู่แข่ง vs ตลาด)</h3>
        <div class="chart-container"><canvas id="chart-price-compare"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">ราคาต่อกรัม (Price per Gram)</h3>
        <div class="chart-container chart-tall"><canvas id="chart-price-gram"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">Price Positioning Map</h3>
        <p style="font-size:0.8rem;color:#718096;margin:-8px 0 8px">X: ราคา | Y: Rating | ขนาด: Market Share</p>
        <div class="chart-container chart-tall"><canvas id="chart-price-position"></canvas></div>
      </div>
      <div class="chart-card full-width">
        <h3 class="chart-card-title">ราคาปกติ vs ราคาโปรโมชั่น</h3>
        <div class="chart-container"><canvas id="chart-price-promo"></canvas></div>
      </div>
    </div>
    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">ตารางเปรียบเทียบราคา</h3>
      <div id="comp-price-table"></div>
    </div>
  `;

  // --- Price Comparison Bar (grouped): เรา vs คู่แข่ง A vs คู่แข่ง B vs ราคาเฉลี่ยตลาด ---
  const vOurs   = PRICE_TABLE_DATA.map((d, i) => varyValue(d.ours,   f, { seed: 100 + i }));
  const vCompA  = PRICE_TABLE_DATA.map((d, i) => varyValue(d.compA,  f, { seed: 110 + i }));
  const vCompB  = PRICE_TABLE_DATA.map((d, i) => varyValue(d.compB,  f, { seed: 120 + i }));
  const vMarket = PRICE_TABLE_DATA.map((d, i) => varyValue(d.market, f, { seed: 130 + i }));

  createChart('chart-price-compare', {
    type: 'bar',
    data: {
      labels: PRICE_TABLE_DATA.map(d => d.product),
      datasets: [
        {
          label: 'เรา (วรรณวนัช)',
          data: vOurs,
          backgroundColor: BRAND_COLORS.wanwanach,
          borderColor: BRAND_COLORS.wanwanach,
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: 'คู่แข่ง A',
          data: vCompA,
          backgroundColor: '#94a3b8',
          borderColor: '#94a3b8',
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: 'คู่แข่ง B',
          data: vCompB,
          backgroundColor: '#cbd5e0',
          borderColor: '#cbd5e0',
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: 'ราคาเฉลี่ยตลาด',
          data: vMarket,
          type: 'line',
          borderColor: '#e74c3c',
          borderWidth: 2,
          borderDash: [6, 3],
          pointRadius: 4,
          pointBackgroundColor: '#e74c3c',
          tension: 0.2,
          fill: false
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#4a5568', usePointStyle: true, padding: 12 }
        },
        tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ฿${ctx.parsed.y}` } }
      },
      scales: {
        x: { ticks: { color: '#4a5568' }, grid: { color: 'rgba(0,0,0,0.06)' } },
        y: {
          beginAtZero: true,
          ticks: { color: '#4a5568', callback: v => `฿${v}` },
          grid: { color: 'rgba(0,0,0,0.06)' }
        }
      }
    }
  });

  // --- Price per Gram (grouped bar) ---
  const allBrandIds = ['wanwanach', 'snp', 'afteryou', 'farmhouse', 'yamazaki', 'breadtalk'];
  const brandNames = { wanwanach: 'วรรณวนัช', snp: 'S&P', afteryou: 'After You', farmhouse: 'ฟาร์มเฮ้าส์', yamazaki: 'ยามาซากิ', breadtalk: 'BreadTalk' };

  // กรองแบรนด์ตาม competitor filter
  let gramBrandIds = allBrandIds;
  if (f.competitor && f.competitor !== 'all') {
    gramBrandIds = allBrandIds.filter(id => id === f.competitor);
  }

  const gramDatasets = gramBrandIds.map((id, bIdx) => ({
    label: brandNames[id],
    data: PRICE_PER_GRAM.map((p, pIdx) => {
      const base = p[id] || 0;
      return base > 0 ? varyValue(base, f, { seed: 200 + bIdx * 10 + pIdx }) : 0;
    }),
    backgroundColor: BRAND_COLORS[id],
    borderColor: BRAND_COLORS[id],
    borderWidth: 1,
    borderRadius: 4
  }));

  createChart('chart-price-gram', {
    type: 'bar',
    data: {
      labels: PRICE_PER_GRAM.map(p => p.product),
      datasets: gramDatasets
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#4a5568', usePointStyle: true, padding: 8, font: { size: 11 } }
        },
        tooltip: {
          callbacks: { label: ctx => `${ctx.dataset.label}: ฿${ctx.parsed.y.toFixed(2)}/g` }
        }
      },
      scales: {
        x: { ticks: { color: '#4a5568', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.06)' } },
        y: {
          beginAtZero: true,
          ticks: { color: '#4a5568', callback: v => `฿${v.toFixed(1)}` },
          grid: { color: 'rgba(0,0,0,0.06)' },
          title: { display: true, text: 'บาท/กรัม', color: '#4a5568' }
        }
      }
    }
  });

  // --- Price Positioning Map (bubble chart) ---
  const posDatasets = brands.map((b, i) => ({
    label: b.name,
    data: [{
      x: varyValue(b.avgPrice, f, { seed: 300 + i }),
      y: b.ratings.overall,
      r: varyPercent(b.marketShare, f, { seed: 310 + i }) * 1.5
    }],
    backgroundColor: BRAND_COLORS[b.id] + '80',
    borderColor: BRAND_COLORS[b.id],
    borderWidth: 2
  }));

  createChart('chart-price-position', {
    type: 'bubble',
    data: { datasets: posDatasets },
    options: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#4a5568', usePointStyle: true, padding: 10 }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const p = ctx.raw;
              return `${ctx.dataset.label}: ราคา ฿${p.x} | Rating ${p.y} | Share ${(p.r / 1.5).toFixed(0)}%`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'ราคาเฉลี่ย (บาท)', color: '#4a5568' },
          ticks: { color: '#4a5568', callback: v => `฿${v}` },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: {
          title: { display: true, text: 'คุณภาพ/Rating', color: '#4a5568' },
          min: 3,
          max: 5,
          ticks: { color: '#4a5568', stepSize: 0.5 },
          grid: { color: 'rgba(0,0,0,0.06)' }
        }
      }
    }
  });

  // --- Normal vs Promo Price (grouped bar) ---
  const filteredPromo = filterByCompetitor(NORMAL_VS_PROMO, f, 'brandId');

  createChart('chart-price-promo', {
    type: 'bar',
    data: {
      labels: filteredPromo.map(d => d.brand),
      datasets: [
        {
          label: 'ราคาปกติ',
          data: filteredPromo.map((d, i) => varyValue(d.normal, f, { seed: 400 + i })),
          backgroundColor: '#94a3b8',
          borderColor: '#94a3b8',
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: 'ราคาโปรโมชั่น',
          data: filteredPromo.map((d, i) => varyValue(d.promo, f, { seed: 420 + i })),
          backgroundColor: filteredPromo.map(d => BRAND_COLORS[d.brandId]),
          borderColor: filteredPromo.map(d => BRAND_COLORS[d.brandId]),
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#4a5568', usePointStyle: true, padding: 12 }
        },
        tooltip: {
          callbacks: {
            afterBody: (items) => {
              const idx = items[0]?.dataIndex;
              if (idx == null) return '';
              const d = filteredPromo[idx];
              if (!d) return '';
              const vNorm = varyValue(d.normal, f, { seed: 400 + idx });
              const vProm = varyValue(d.promo, f, { seed: 420 + idx });
              const disc = Math.round((1 - vProm / vNorm) * 100);
              return `ส่วนลด: ${disc}%`;
            },
            label: ctx => `${ctx.dataset.label}: ฿${ctx.parsed.y}`
          }
        }
      },
      scales: {
        x: { ticks: { color: '#4a5568' }, grid: { color: 'rgba(0,0,0,0.06)' } },
        y: {
          beginAtZero: true,
          ticks: { color: '#4a5568', callback: v => `฿${v}` },
          grid: { color: 'rgba(0,0,0,0.06)' }
        }
      }
    }
  });

  // --- Price Table ---
  const tableEl = document.getElementById('comp-price-table');
  if (tableEl) {
    const rows = PRICE_TABLE_DATA.map((d, i) => {
      const vO = varyValue(d.ours, f, { seed: 500 + i });
      const vA = varyValue(d.compA, f, { seed: 510 + i });
      const vB = varyValue(d.compB, f, { seed: 520 + i });
      const vM = varyValue(d.market, f, { seed: 530 + i });
      const diff = calcDiffPct(vO, vM);
      return `
        <tr>
          <td>${d.product}</td>
          <td class="num">฿${fmt(vO)}</td>
          <td class="num">฿${fmt(vA)}</td>
          <td class="num">฿${fmt(vB)}</td>
          <td class="num">฿${fmt(vM)}</td>
          <td class="num ${diff.cls}">${diff.label}</td>
        </tr>`;
    }).join('');

    tableEl.innerHTML = `
      <div class="cp-price-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>สินค้า</th>
              <th class="num">เรา</th>
              <th class="num">คู่แข่ง A</th>
              <th class="num">คู่แข่ง B</th>
              <th class="num">ราคาเฉลี่ยตลาด</th>
              <th class="num">ส่วนต่าง</th>
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
        <p class="loading-text">กำลังโหลดข้อมูลราคา...</p>
      </div>
    </div>`;

  try {
    const data = await fetchJSON('/data/competitors.json');
    if (thisMount !== mountId) return;

    container.innerHTML = `
      <div class="tab-content">
        ${buildFilterBar([PERIOD_FILTER, CATEGORY_FILTER, COMPETITOR_FILTER])}
        <div class="comp-price-content"></div>
      </div>`;

    function render(filters) { renderContent(container, data, filters); }
    render(getFilterValues(container));
    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('Competitors Price mount error:', err);
    container.innerHTML = `
      <div class="tab-content">
        <div class="error-state">
          <p class="error-state-text">เกิดข้อผิดพลาดในการโหลดข้อมูลราคา</p>
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
