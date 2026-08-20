/**
 * market-overview.js - Sub-tab: Market Overview
 * แสดงภาพรวมตลาดเบเกอรี่ด้วย overview cards 4 ใบ, 12-month sales trend,
 * category market size chart, ตารางเปรียบเทียบหมวดหมู่
 * ข้อมูลจาก trends.json + estimated market data
 * รองรับ loading / empty / error states + race condition guard + reactive filters
 */
import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import { buildFilterBar, onFilterChange, getFilterValues, YEAR_FILTER, MONTH_FILTER, CHANNEL_FILTER, REGION_FILTER } from '../../shared/filter-builder.js';
import { varyValue, varyPercent, varyArray, getMonthSlice } from '../../shared/filter-data.js';

let mountId = 0; // ป้องกัน race condition เมื่อสลับ tab เร็ว
let filterCleanup = null;

/* ---------- Style injection ---------- */

const STYLE_ID = 'style-market-overview';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .mkt-ov-table { width: 100%; border-collapse: collapse; }
    .mkt-ov-table th,
    .mkt-ov-table td {
      padding: 10px 14px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.9rem;
    }
    .mkt-ov-table th {
      background: #f7fafc;
      color: #4a5568;
      font-weight: 600;
    }
    .mkt-ov-table td { color: #1a202c; }
    .mkt-ov-table tr:last-child td { border-bottom: none; }
    .mkt-ov-table .trend-hot { color: #16a34a; font-weight: 700; }
    .mkt-ov-table .trend-up { color: #16a34a; }
    .mkt-ov-table .trend-down { color: #dc2626; font-weight: 600; }
    .mkt-ov-table .num { text-align: right; font-variant-numeric: tabular-nums; }
  `;
  document.head.appendChild(style);
}

function removeStyles() {
  const el = document.getElementById(STYLE_ID);
  if (el) el.remove();
}

/* ---------- ข้อมูล Market Size โดยประมาณ ---------- */

const MARKET_SIZE_DATA = {
  labels: ['ขนมปัง', 'เค้ก', 'คุกกี้', 'เพสทรี', 'โดนัท', 'พาย'],
  values: [4.1, 3.2, 1.8, 1.5, 1.2, 0.7],
};

/* ข้อมูลเปรียบเทียบหมวดหมู่รายเดือน */
const CATEGORY_TABLE_DATA = [
  { name: 'Sandwich', thisMonth: 8.2, lastMonth: 7.1, growth: 15.5, trend: 'hot' },
  { name: 'Cake',     thisMonth: 6.4, lastMonth: 6.8, growth: -5.9, trend: 'down' },
  { name: 'Bread',    thisMonth: 10.2, lastMonth: 9.5, growth: 7.4, trend: 'up' },
  { name: 'Cookie',   thisMonth: 3.1, lastMonth: 2.8, growth: 10.7, trend: 'hot' },
  { name: 'Donut',    thisMonth: 2.8, lastMonth: 2.3, growth: 21.7, trend: 'hot' },
  { name: 'Pastry',   thisMonth: 1.5, lastMonth: 1.4, growth: 7.1, trend: 'up' },
];

/* ---------- Helpers ---------- */

function calcAvgScore(products) {
  if (!products.length) return 0;
  return Math.round(products.reduce((s, p) => s + p.score, 0) / products.length);
}

/* ---------- renderContent (reactive) ---------- */

function renderContent(container, data, filters) {
  destroyAll();

  const f = filters;
  const { topProducts, categories } = data;

  const avgScore = varyValue(calcAvgScore(topProducts), f, { seed: 100, asInt: true, min: 1 });
  const marketGrowth = varyPercent(8.2, f, { seed: 101 });
  const productCount = varyValue(topProducts.length, f, { seed: 102, asInt: true, min: 1 });

  const contentEl = container.querySelector('.mktov-content');

  // --- Overview cards ---
  const cards = [
    { label: 'จำนวนสินค้าที่ติดตาม', value: `${productCount}`, note: 'สินค้าในระบบ' },
    { label: 'หมวดหมู่', value: `${categories.length}`, note: 'หมวดสินค้าที่ติดตาม' },
    { label: 'ค่าเฉลี่ย Trend Score', value: `${avgScore}`, note: `จากสินค้า ${topProducts.length} รายการ` },
    { label: 'Market Growth', value: `+${marketGrowth}%`, note: 'เทียบปีก่อน (YoY)' },
  ];

  const overviewHTML = `<div class="overview-cards">${cards.map(c => `
    <div class="overview-card">
      <div class="overview-card-label">${c.label}</div>
      <div class="overview-card-value">${c.value}</div>
      <div class="overview-card-note">${c.note}</div>
    </div>
  `).join('')}</div>`;

  // --- Chart area ---
  const chartAreaHTML = `
    <div class="chart-grid">
      <div class="chart-card">
        <h3 class="chart-card-title">แนวโน้มมูลค่าตลาดรายเดือน 2569</h3>
        <p class="chart-card-subtitle">มูลค่าตลาดรวมเบเกอรี่ (พันล้านบาท) พร้อมอัตราเติบโต MoM</p>
        <div class="chart-container"><canvas id="chart-mktov-trend"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">ขนาดตลาดตามหมวดหมู่</h3>
        <p class="chart-card-subtitle">มูลค่าตลาดโดยประมาณ (พันล้านบาท)</p>
        <div class="chart-container"><canvas id="chart-mktov-size"></canvas></div>
      </div>
    </div>
  `;

  // --- Category table (vary ค่ารายหมวด) ---
  const trendIcon = (t) => {
    if (t === 'hot') return '<span class="trend-hot">\u{1F525} Hot</span>';
    if (t === 'up') return '<span class="trend-up">↑</span>';
    return '<span class="trend-down">↓</span>';
  };

  const growthFmt = (g) => {
    const sign = g > 0 ? '+' : '';
    const cls = g > 10 ? 'trend-hot' : g > 0 ? 'trend-up' : 'trend-down';
    return `<span class="${cls}">${sign}${g.toFixed(1)}%</span>`;
  };

  const tableRows = CATEGORY_TABLE_DATA.map((r, i) => {
    const tm = varyValue(r.thisMonth, f, { seed: 130 + i });
    const lm = varyValue(r.lastMonth, f, { seed: 140 + i });
    const g = lm > 0 ? +((tm - lm) / lm * 100).toFixed(1) : 0;
    const trend = g > 10 ? 'hot' : g > 0 ? 'up' : 'down';
    return `
      <tr>
        <td>${r.name}</td>
        <td class="num">${tm.toFixed(1)} MB</td>
        <td class="num">${lm.toFixed(1)} MB</td>
        <td class="num">${growthFmt(g)}</td>
        <td class="num">${trendIcon(trend)}</td>
      </tr>
    `;
  }).join('');

  const tableHTML = `
    <div class="chart-card full-width" style="margin-top:var(--spacing-lg, 24px)">
      <h3 class="chart-card-title">เปรียบเทียบหมวดหมู่รายเดือน</h3>
      <p class="chart-card-subtitle">ข้อมูลมูลค่าตลาดรายหมวดและอัตราการเติบโต</p>
      <div class="data-table-wrapper">
        <table class="mkt-ov-table">
          <thead>
            <tr>
              <th>Category</th>
              <th class="num">เดือนนี้</th>
              <th class="num">เดือนก่อน</th>
              <th class="num">Growth</th>
              <th class="num">Trend</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    </div>
  `;

  contentEl.innerHTML = overviewHTML + chartAreaHTML + tableHTML;

  // --- Monthly trend chart (line + getMonthSlice) ---
  const allLabels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                     'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const allData = varyArray([9.8, 10.2, 10.5, 10.8, 11.2, 11.5, 11.8, 12.0, 12.2, 12.3, 12.4, 12.5], f, { startSeed: 110 });
  const sliced = getMonthSlice(allLabels, allData, f);

  const momGrowth = sliced.data.map((v, i) => {
    if (i === 0) return null;
    return (((v - sliced.data[i - 1]) / sliced.data[i - 1]) * 100).toFixed(1);
  });

  // y-axis min คำนวณจากข้อมูลจริงเพื่อไม่ให้ chart ว่างเมื่อ filter ลดค่า
  const yMin = Math.max(0, Math.floor(Math.min(...sliced.data) * 0.9));

  createChart('chart-mktov-trend', {
    type: 'line',
    data: {
      labels: sliced.labels,
      datasets: [{
        label: 'มูลค่าตลาด (พันล้านบาท)',
        data: sliced.data,
        borderColor: '#7c4dff',
        backgroundColor: 'rgba(124, 77, 255, 0.12)',
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#7c4dff',
        borderWidth: 2.5
      }]
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const val = `${ctx.parsed.y.toFixed(1)} พันล้านบาท`;
              const g = momGrowth[ctx.dataIndex];
              return g ? `${val} (MoM +${g}%)` : val;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#4a5568' },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: {
          beginAtZero: false,
          min: yMin,
          ticks: {
            color: '#4a5568',
            callback: v => v.toFixed(1) + 'B'
          },
          grid: { color: 'rgba(0,0,0,0.06)' },
          title: { display: true, text: 'พันล้านบาท', color: '#4a5568' }
        }
      }
    }
  });

  // --- Market size bar chart ---
  const sizeData = varyArray(MARKET_SIZE_DATA.values, f, { startSeed: 120 });
  const barColors = CHART_COLORS.slice(0, 6);

  createChart('chart-mktov-size', {
    type: 'bar',
    data: {
      labels: MARKET_SIZE_DATA.labels,
      datasets: [{
        label: 'มูลค่าตลาด (พันล้านบาท)',
        data: sizeData,
        backgroundColor: barColors.map(c => c + 'CC'),
        borderColor: barColors,
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.parsed.y.toFixed(1)} พันล้านบาท`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#4a5568' },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#4a5568',
            callback: v => `${v}B`
          },
          grid: { color: 'rgba(0,0,0,0.06)' },
          title: { display: true, text: 'พันล้านบาท', color: '#4a5568' }
        }
      }
    }
  });
}

/* ---------- Tab lifecycle ---------- */

export async function mount(container) {
  const thisMount = ++mountId;

  injectStyles();

  container.innerHTML = `
    <div class="tab-content">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">กำลังโหลดข้อมูลภาพรวมตลาด...</p>
      </div>
    </div>
  `;

  try {
    const data = await fetchJSON('/data/trends.json');

    if (thisMount !== mountId) return;

    const { topProducts, categories } = data;

    if (!topProducts || topProducts.length === 0) {
      container.innerHTML = `
        <div class="tab-content">
          <div class="empty-state">
            <p class="empty-state-text">ไม่พบข้อมูลตลาด</p>
          </div>
        </div>
      `;
      return;
    }

    // Filter bar อยู่นอก content div เพื่อไม่ให้ถูก re-render
    container.innerHTML = `
      <div class="tab-content">
        ${buildFilterBar([YEAR_FILTER, MONTH_FILTER, CHANNEL_FILTER, REGION_FILTER])}
        <div class="mktov-content"></div>
      </div>
    `;

    function render(filters) { renderContent(container, data, filters); }

    render(getFilterValues(container));

    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('MarketOverview mount error:', err);
    container.innerHTML = `
      <div class="tab-content">
        <div class="error-state">
          <p class="error-state-text">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        </div>
      </div>
    `;
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
  removeStyles();
}
