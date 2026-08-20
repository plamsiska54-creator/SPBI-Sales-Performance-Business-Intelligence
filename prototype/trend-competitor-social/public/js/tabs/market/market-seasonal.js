/**
 * market-seasonal.js - Sub-tab: Seasonal Trend Analysis
 * วิเคราะห์รูปแบบตามฤดูกาล: seasonal pattern 12 เดือน (top 3 categories),
 * event impact bar, channel seasonal stacked area + ตาราง Peak Period
 * ข้อมูลจาก trends.json + estimated seasonal data
 * รองรับ loading / empty / error states + race condition guard + reactive filters
 */
import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import { buildFilterBar, onFilterChange, getFilterValues, YEAR_FILTER, MONTH_FILTER, CHANNEL_FILTER, REGION_FILTER } from '../../shared/filter-builder.js';
import { varyValue, varyPercent, varyArray, getMonthSlice } from '../../shared/filter-data.js';

let mountId = 0; // ป้องกัน race condition เมื่อสลับ tab เร็ว
let filterCleanup = null;

/* ---------- Style injection ---------- */

const STYLE_ID = 'style-market-seasonal';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .mkt-seasonal-table { width: 100%; border-collapse: collapse; }
    .mkt-seasonal-table th,
    .mkt-seasonal-table td {
      padding: 10px 14px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.9rem;
    }
    .mkt-seasonal-table th {
      background: #f7fafc;
      color: #4a5568;
      font-weight: 600;
    }
    .mkt-seasonal-table td { color: #1a202c; }
    .mkt-seasonal-table tr:last-child td { border-bottom: none; }
    .mkt-seasonal-table .num { text-align: right; font-variant-numeric: tabular-nums; }
    .mkt-seasonal-table .impact-high { color: #dc2626; font-weight: 600; }
    .mkt-seasonal-table .impact-medium { color: #f59e0b; font-weight: 600; }
    .mkt-seasonal-table .impact-very-high { color: #dc2626; font-weight: 700; }
    .seasonal-highlight {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .seasonal-highlight.spike { background: rgba(220,38,38,0.08); color: #dc2626; }
    .seasonal-highlight.dip { background: rgba(245,158,11,0.08); color: #f59e0b; }
  `;
  document.head.appendChild(style);
}

function removeStyles() {
  const el = document.getElementById(STYLE_ID);
  if (el) el.remove();
}

/* ---------- ข้อมูล Seasonal ---------- */

// เค้ก, ขนมปัง, คุกกี้ — 12 เดือน (demand index normalized)
const SEASONAL_PATTERNS = {
  cake:   [85, 145, 90, 75, 88, 95, 92, 130, 88, 85, 95, 155],
  bread:  [100, 95, 102, 90, 105, 100, 98, 100, 105, 102, 100, 95],
  cookie: [90, 135, 95, 80, 85, 90, 88, 92, 90, 95, 105, 160],
};

const EVENT_DATA = {
  events: ['วาเลนไทน์', 'สงกรานต์', 'วันแม่', 'Halloween', 'คริสต์มาส', 'ปีใหม่'],
  multiplier: [2.5, 0.8, 1.8, 1.4, 2.2, 1.5],
  months: ['ก.พ.', 'เม.ย.', 'ส.ค.', 'ต.ค.', 'ธ.ค.', 'ม.ค.'],
};

// Channel seasonal stacked area (12 เดือน)
const CHANNEL_SEASONAL = {
  months: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
           'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
  channels: [
    { name: 'ร้านสาขา',       data: [3.5, 4.2, 3.6, 3.2, 3.8, 3.9, 3.7, 4.0, 3.8, 3.6, 3.9, 4.5] },
    { name: 'ออนไลน์',        data: [2.2, 3.1, 2.4, 2.0, 2.5, 2.6, 2.5, 2.8, 2.6, 2.5, 2.8, 3.5] },
    { name: 'ซูเปอร์มาร์เก็ต', data: [2.5, 2.8, 2.6, 2.3, 2.7, 2.6, 2.5, 2.7, 2.6, 2.5, 2.7, 3.0] },
    { name: 'สะดวกซื้อ',       data: [1.3, 1.5, 1.4, 1.2, 1.4, 1.4, 1.3, 1.4, 1.4, 1.3, 1.4, 1.6] },
  ],
};

// Peak Period table data (static recommendations — ไม่ vary)
const PEAK_PERIODS = [
  { period: 'ก.พ. (สัปดาห์ 2-3)',   event: 'วาเลนไทน์',   impact: 'สูงมาก', topCategory: 'เค้ก / ช็อกโกแลต', action: 'เตรียมสต็อกเค้กและคุกกี้ Set ของขวัญ เพิ่ม 2-3 เท่า' },
  { period: 'เม.ย. (สัปดาห์ 2-3)',   event: 'สงกรานต์',    impact: 'ต่ำ (ลดลง)', topCategory: 'ขนมปัง (ของฝาก)', action: 'ลดการผลิต เน้นสินค้าที่เก็บได้นาน สำหรับเดินทาง' },
  { period: 'ส.ค. (สัปดาห์ 2)',      event: 'วันแม่',      impact: 'สูง', topCategory: 'เค้กวันแม่', action: 'เปิดรับออเดอร์เค้กล่วงหน้า 2 สัปดาห์ เพิ่ม Delivery' },
  { period: 'ต.ค. (สัปดาห์ 4-5)',    event: 'Halloween',   impact: 'ปานกลาง', topCategory: 'คุกกี้ / โดนัท', action: 'ออกแบบสินค้า Theme Halloween จำกัดรุ่น' },
  { period: 'ธ.ค. (สัปดาห์ 3-4)',    event: 'คริสต์มาส',   impact: 'สูงมาก', topCategory: 'เค้ก / คุกกี้ / พาย', action: 'เพิ่มกำลังผลิต 2x เน้น Gift Set และ Corporate Order' },
  { period: 'ม.ค. (สัปดาห์ 1)',      event: 'ปีใหม่',      impact: 'สูง', topCategory: 'คุกกี้ / ของขวัญ', action: 'ทำ Promotion New Year Set ราคาพิเศษ' },
];

/* ---------- renderContent (reactive) ---------- */

function renderContent(container, filters) {
  destroyAll();

  const f = filters;
  const contentEl = container.querySelector('.mkts-content');

  // --- Chart area HTML ---
  contentEl.innerHTML = `
    <div class="chart-card full-width">
      <h3 class="chart-card-title">รูปแบบตามฤดูกาล (Seasonal Pattern)</h3>
      <p class="chart-card-subtitle">Demand Index รายเดือน: เค้ก, ขนมปัง, คุกกี้ (ม.ค. - ธ.ค.) — จุดสูง = เทศกาล</p>
      <div class="chart-container"><canvas id="chart-mkts-seasonal"></canvas></div>
    </div>
    <div class="chart-grid">
      <div class="chart-card">
        <h3 class="chart-card-title">ผลกระทบจากเทศกาล (Event Impact)</h3>
        <p class="chart-card-subtitle">ตัวคูณยอดขายเทียบช่วงปกติ (1.0x = ปกติ)</p>
        <div class="chart-container chart-tall"><canvas id="chart-mkts-events"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">Channel Seasonal Trend</h3>
        <p class="chart-card-subtitle">มูลค่ายอดขายตามช่องทาง 12 เดือน (พันล้านบาท)</p>
        <div class="chart-container chart-tall"><canvas id="chart-mkts-channel"></canvas></div>
      </div>
    </div>
    <div class="chart-card full-width" style="margin-top:var(--spacing-lg, 24px)">
      <h3 class="chart-card-title">ช่วงเวลาพีค และแผนรับมือ</h3>
      <p class="chart-card-subtitle">Peak Period / Event / ผลกระทบ / สินค้าเด่น / Recommended Action</p>
      <div class="data-table-wrapper" id="mkts-peak-table"></div>
    </div>
  `;

  // --- 1. Seasonal pattern chart (multi-line + getMonthSlice) ---
  const monthLabels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  const cakeAll = varyArray(SEASONAL_PATTERNS.cake, f, { startSeed: 500 });
  const breadAll = varyArray(SEASONAL_PATTERNS.bread, f, { startSeed: 512 });
  const cookieAll = varyArray(SEASONAL_PATTERNS.cookie, f, { startSeed: 524 });

  const cakeSliced = getMonthSlice(monthLabels, cakeAll, f);
  const breadSliced = getMonthSlice(monthLabels, breadAll, f);
  const cookieSliced = getMonthSlice(monthLabels, cookieAll, f);

  const seasonLabels = cakeSliced.labels;

  // ไฮไลท์จุดพีคของเค้ก — คำนวณ index ใน sliced data
  // (ใช้ original month index เพื่อเทียบเทศกาล)
  const peakMonthIndices = [1, 7, 11]; // ก.พ., ส.ค., ธ.ค. (0-based)
  const dipMonthIndices = [3]; // เม.ย.

  function makePointColors(baseColor, slicedLabels) {
    return slicedLabels.map(label => {
      const origIdx = monthLabels.indexOf(label);
      if (peakMonthIndices.includes(origIdx)) return '#dc2626';
      if (dipMonthIndices.includes(origIdx)) return '#94a3b8';
      return baseColor;
    });
  }

  const seasonDatasets = [
    {
      label: 'เค้ก',
      data: cakeSliced.data,
      borderColor: CHART_COLORS[0],
      backgroundColor: CHART_COLORS[0] + '1A',
      borderWidth: 2.5,
      tension: 0.3,
      pointRadius: 5,
      pointHoverRadius: 8,
      pointBackgroundColor: makePointColors(CHART_COLORS[0], seasonLabels),
      pointBorderColor: makePointColors(CHART_COLORS[0], seasonLabels),
      fill: false
    },
    {
      label: 'ขนมปัง',
      data: breadSliced.data,
      borderColor: CHART_COLORS[2],
      backgroundColor: CHART_COLORS[2] + '1A',
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 7,
      pointBackgroundColor: CHART_COLORS[2],
      fill: false
    },
    {
      label: 'คุกกี้',
      data: cookieSliced.data,
      borderColor: CHART_COLORS[3],
      backgroundColor: CHART_COLORS[3] + '1A',
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 7,
      pointBackgroundColor: CHART_COLORS[3],
      fill: false
    },
  ];

  createChart('chart-mkts-seasonal', {
    type: 'line',
    data: { labels: seasonLabels, datasets: seasonDatasets },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#4a5568', usePointStyle: true, padding: 12 }
        },
        tooltip: {
          callbacks: {
            afterBody: (items) => {
              const label = items[0]?.label;
              if (label === 'ก.พ.') return '\n Valentine Spike';
              if (label === 'เม.ย.') return '\n Songkran Dip';
              if (label === 'ส.ค.') return "\n Mother's Day Spike";
              if (label === 'ธ.ค.') return '\n Christmas Spike';
              return '';
            },
            label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(0)} (index)`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#4a5568' },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: {
          ticks: { color: '#4a5568' },
          grid: { color: 'rgba(0,0,0,0.06)' },
          title: { display: true, text: 'Demand Index', color: '#4a5568' }
        }
      }
    }
  });

  // --- 2. Event impact chart (bar) ---
  const eventMultipliers = varyArray(EVENT_DATA.multiplier, f, { startSeed: 540 });
  const eventBgColors = eventMultipliers.map(m => {
    if (m >= 2.0) return 'rgba(220,38,38,0.8)';
    if (m >= 1.5) return 'rgba(245,158,11,0.8)';
    if (m >= 1.0) return 'rgba(22,163,74,0.8)';
    return 'rgba(148,163,184,0.8)';
  });
  const eventBorderColors = eventMultipliers.map(m => {
    if (m >= 2.0) return '#dc2626';
    if (m >= 1.5) return '#f59e0b';
    if (m >= 1.0) return '#16a34a';
    return '#94a3b8';
  });

  createChart('chart-mkts-events', {
    type: 'bar',
    data: {
      labels: EVENT_DATA.events,
      datasets: [{
        label: 'ตัวคูณยอดขาย',
        data: eventMultipliers,
        backgroundColor: eventBgColors,
        borderColor: eventBorderColors,
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const val = ctx.parsed.y;
              if (val >= 1) return `ยอดขายเพิ่ม ${val.toFixed(1)}x เทียบช่วงปกติ`;
              return `ยอดขายลดเหลือ ${val.toFixed(1)}x เทียบช่วงปกติ`;
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
          beginAtZero: true,
          max: 3,
          ticks: {
            color: '#4a5568',
            callback: v => `${v}x`,
            stepSize: 0.5
          },
          grid: { color: 'rgba(0,0,0,0.06)' },
          title: { display: true, text: 'ตัวคูณ (Multiplier)', color: '#4a5568' }
        }
      }
    }
  });

  // --- 3. Channel seasonal stacked area (+ getMonthSlice) ---
  const channelColors = ['#7c4dff', '#ff4081', '#2979ff', '#00bfa5'];

  const chDatasets = CHANNEL_SEASONAL.channels.map((ch, idx) => {
    const variedAll = varyArray(ch.data, f, { startSeed: 550 + idx * 12 });
    const sliced = getMonthSlice(CHANNEL_SEASONAL.months, variedAll, f);
    return {
      label: ch.name,
      data: sliced.data,
      borderColor: channelColors[idx],
      backgroundColor: channelColors[idx] + '40',
      borderWidth: 1.5,
      tension: 0.3,
      pointRadius: 0,
      fill: true,
      _slicedLabels: sliced.labels
    };
  });

  const chLabels = chDatasets[0]._slicedLabels;

  createChart('chart-mkts-channel', {
    type: 'line',
    data: {
      labels: chLabels,
      datasets: chDatasets.map(({ _slicedLabels, ...ds }) => ds)
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#4a5568', usePointStyle: true, padding: 12 }
        },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}B`
          }
        },
        filler: { propagate: true }
      },
      scales: {
        x: {
          ticks: { color: '#4a5568' },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: {
          stacked: true,
          beginAtZero: true,
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

  // --- 4. Peak period table (static recommendations) ---
  renderPeakTable();
}

function renderPeakTable() {
  const tableEl = document.getElementById('mkts-peak-table');
  if (!tableEl) return;

  const impactBadge = (level) => {
    if (level === 'สูงมาก') return '<span class="impact-very-high">สูงมาก</span>';
    if (level === 'สูง') return '<span class="impact-high">สูง</span>';
    if (level === 'ปานกลาง') return '<span class="impact-medium">ปานกลาง</span>';
    return `<span class="impact-medium">${level}</span>`;
  };

  const rows = PEAK_PERIODS.map(r => `
    <tr>
      <td>${r.period}</td>
      <td>${r.event}</td>
      <td class="num">${impactBadge(r.impact)}</td>
      <td>${r.topCategory}</td>
      <td>${r.action}</td>
    </tr>
  `).join('');

  tableEl.innerHTML = `
    <table class="mkt-seasonal-table">
      <thead>
        <tr>
          <th>Period</th>
          <th>Event</th>
          <th class="num">Impact</th>
          <th>Top Category</th>
          <th>Recommended Action</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

/* ---------- Tab lifecycle ---------- */

export async function mount(container) {
  const thisMount = ++mountId;

  injectStyles();

  container.innerHTML = `
    <div class="tab-content">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">กำลังโหลดข้อมูล Seasonal...</p>
      </div>
    </div>
  `;

  try {
    // fetch เพื่อให้ cache พร้อม (ใช้เป็น guard ว่า data พร้อม)
    await fetchJSON('/data/trends.json');

    if (thisMount !== mountId) return;

    // Filter bar อยู่นอก content div เพื่อไม่ให้ถูก re-render
    container.innerHTML = `
      <div class="tab-content">
        ${buildFilterBar([YEAR_FILTER, MONTH_FILTER, CHANNEL_FILTER, REGION_FILTER])}
        <div class="mkts-content"></div>
      </div>
    `;

    function render(filters) { renderContent(container, filters); }

    render(getFilterValues(container));

    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('MarketSeasonal mount error:', err);
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
