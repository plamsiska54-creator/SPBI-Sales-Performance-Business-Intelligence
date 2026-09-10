/**
 * market-growth.js - Sub-tab: Market Growth Analysis
 * วิเคราะห์การเติบโต: MoM/YoY grouped bar, category growth trend (multi-line 12 เดือน),
 * channel growth, area growth + ตาราง Growth Leaders Top 10
 * ข้อมูลจาก trends.json + estimated growth data
 * รองรับ loading / empty / error states + race condition guard + reactive filters
 */
import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import { buildFilterBar, onFilterChange, getFilterValues, YEAR_FILTER, MONTH_FILTER, CHANNEL_FILTER, REGION_FILTER } from '../../shared/filter-builder.js';
import { varyValue, varyPercent, varyArray, getMonthSlice } from '../../shared/filter-data.js';

let mountId = 0; // ป้องกัน race condition เมื่อสลับ tab เร็ว
let filterCleanup = null;

/* ---------- Style injection ---------- */

const STYLE_ID = 'style-market-growth';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .mkt-growth-table { width: 100%; border-collapse: collapse; }
    .mkt-growth-table th,
    .mkt-growth-table td {
      padding: 10px 14px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.9rem;
    }
    .mkt-growth-table th {
      background: #f7fafc;
      color: #4a5568;
      font-weight: 600;
    }
    .mkt-growth-table td { color: #1a202c; }
    .mkt-growth-table tr:last-child td { border-bottom: none; }
    .mkt-growth-table .num { text-align: right; font-variant-numeric: tabular-nums; }
    .mkt-growth-table .positive { color: #16a34a; font-weight: 600; }
    .mkt-growth-table .negative { color: #dc2626; font-weight: 600; }
    .mkt-growth-table .trend-hot { color: #16a34a; font-weight: 700; }
  `;
  document.head.appendChild(style);
}

function removeStyles() {
  const el = document.getElementById(STYLE_ID);
  if (el) el.remove();
}

/* ---------- ข้อมูล Growth ---------- */

const GROWTH_DATA = {
  categories: ['ขนมปัง', 'เค้ก & เพสทรี', 'คุกกี้ & บิสกิต', 'โดนัท', 'ขนมอบสุขภาพ', 'ขนมอบอื่นๆ'],
  categoryIds: ['bread', 'cake', 'cookie', 'donut', 'health', 'other'],
  momPct: [1.8, 1.5, 2.1, 3.2, 5.8, 0.6],
  yoyPct: [5, 4, 6, 12, 21, 2],
};

// แนวโน้มรายเดือน 12 เดือนของแต่ละหมวด (index = volume ที่ normalized)
const MONTHLY_CATEGORY_TREND = {
  bread:  [14.5, 14.6, 14.8, 14.6, 14.9, 15.0, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6],
  cake:   [13.0, 14.5, 13.2, 12.5, 13.3, 13.5, 13.4, 14.0, 13.6, 13.4, 13.8, 14.5],
  cookie: [5.2, 5.4, 5.3, 5.1, 5.3, 5.4, 5.3, 5.5, 5.5, 5.5, 5.6, 5.9],
  donut:  [1.5, 1.6, 1.6, 1.5, 1.7, 1.7, 1.7, 1.8, 1.8, 1.8, 1.9, 2.0],
  health: [3.5, 3.6, 3.7, 3.6, 3.8, 3.9, 4.0, 4.1, 4.2, 4.3, 4.5, 4.7],
  other:  [5.0, 5.0, 5.1, 5.0, 5.1, 5.1, 5.2, 5.2, 5.2, 5.2, 5.3, 5.3],
};

const CHANNEL_GROWTH = {
  channels: ['ออนไลน์/เดลิเวอรี่', 'ร้านสะดวกซื้อ', 'ซูเปอร์มาร์เก็ต', 'ร้านเบเกอรี่', 'ตลาดนัด/อื่นๆ'],
  growth: [10.9, 4.5, 6.8, 5.5, 2.1],
};

const AREA_GROWTH = {
  areas: ['กรุงเทพฯ', 'ภาคตะวันออก', 'ภาคกลาง', 'ภาคเหนือ', 'ภาคใต้', 'ภาคอีสาน'],
  growth: [25.0, 8.1, 9.8, 20.0, 19.0, 5.3],
};

/* ---------- Helpers ---------- */

function fmt(n) { return Number(n).toLocaleString('th-TH'); }

/* ---------- renderContent (reactive) ---------- */

function renderContent(container, topProducts, filters) {
  destroyAll();

  const f = filters;
  const contentEl = container.querySelector('.mktg-content');

  // --- Chart area HTML ---
  contentEl.innerHTML = `
    <div class="chart-grid">
      <div class="chart-card">
        <h3 class="chart-card-title">อัตราการเติบโต MoM vs YoY</h3>
        <p class="chart-card-subtitle">เปรียบเทียบ Growth % รายเดือนและรายปี ตามหมวดหมู่</p>
        <div class="chart-container chart-tall"><canvas id="chart-mktg-momyoy"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">แนวโน้มการเติบโตรายหมวด (12 เดือน)</h3>
        <p class="chart-card-subtitle">มูลค่าตลาดรายเดือน (พันล้านบาท) แยกตามหมวดหมู่</p>
        <div class="chart-container chart-tall"><canvas id="chart-mktg-cattrend"></canvas></div>
      </div>
    </div>
    <div class="chart-grid">
      <div class="chart-card">
        <h3 class="chart-card-title">การเติบโตตาม Channel</h3>
        <p class="chart-card-subtitle">อัตราเติบโต (%) แยกตามช่องทางจำหน่าย</p>
        <div class="chart-container chart-tall"><canvas id="chart-mktg-channel"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">การเติบโตตามภูมิภาค</h3>
        <p class="chart-card-subtitle">อัตราเติบโต (%) แยกตามพื้นที่</p>
        <div class="chart-container chart-tall"><canvas id="chart-mktg-area"></canvas></div>
      </div>
    </div>
    <div class="chart-card full-width" style="margin-top:var(--spacing-lg, 24px)">
      <h3 class="chart-card-title">สินค้าที่เติบโตสูงสุด (Growth Leaders)</h3>
      <p class="chart-card-subtitle">Top 10 สินค้าเรียงตาม Growth Rate ของ Search Volume</p>
      <div class="data-table-wrapper" id="mktg-leaders-table"></div>
    </div>
  `;

  // --- 1. MoM vs YoY chart ---
  const momData = varyArray(GROWTH_DATA.momPct, f, { startSeed: 200 });
  const yoyData = varyArray(GROWTH_DATA.yoyPct, f, { startSeed: 210 });

  createChart('chart-mktg-momyoy', {
    type: 'bar',
    data: {
      labels: GROWTH_DATA.categories,
      datasets: [
        {
          label: 'MoM %',
          data: momData,
          backgroundColor: CHART_COLORS[0] + 'CC',
          borderColor: CHART_COLORS[0],
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: 'YoY %',
          data: yoyData,
          backgroundColor: CHART_COLORS[1] + 'CC',
          borderColor: CHART_COLORS[1],
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
            label: ctx => `${ctx.dataset.label}: +${ctx.parsed.y.toFixed(1)}%`
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
            callback: v => `+${v}%`
          },
          grid: { color: 'rgba(0,0,0,0.06)' },
          title: { display: true, text: 'Growth %', color: '#4a5568' }
        }
      }
    }
  });

  // --- 2. Category trend multi-line (12 เดือน + getMonthSlice) ---
  const monthLabels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const catNames = { bread: 'ขนมปัง', cake: 'เค้ก & เพสทรี', cookie: 'คุกกี้ & บิสกิต', donut: 'โดนัท', health: 'ขนมอบสุขภาพ', other: 'ขนมอบอื่นๆ' };

  // vary แต่ละหมวดด้วย startSeed ที่ต่างกัน แล้ว slice ตาม month filter
  const catDatasets = GROWTH_DATA.categoryIds.map((catId, idx) => {
    const variedAll = varyArray(MONTHLY_CATEGORY_TREND[catId], f, { startSeed: 220 + idx * 12 });
    const sliced = getMonthSlice(monthLabels, variedAll, f);
    return { catId, idx, sliced };
  });

  // ใช้ labels จาก dataset แรก (ทุก dataset slice เหมือนกัน)
  const trendLabels = catDatasets[0].sliced.labels;

  const trendDatasets = catDatasets.map(({ catId, idx, sliced }) => ({
    label: catNames[catId] || catId,
    data: sliced.data,
    borderColor: CHART_COLORS[idx],
    backgroundColor: CHART_COLORS[idx] + '1A',
    borderWidth: 2,
    tension: 0.3,
    pointRadius: 3,
    pointHoverRadius: 6,
    pointBackgroundColor: CHART_COLORS[idx],
    fill: false
  }));

  createChart('chart-mktg-cattrend', {
    type: 'line',
    data: { labels: trendLabels, datasets: trendDatasets },
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
            callback: v => v.toFixed(1) + 'B'
          },
          grid: { color: 'rgba(0,0,0,0.06)' },
          title: { display: true, text: 'พันล้านบาท', color: '#4a5568' }
        }
      }
    }
  });

  // --- 3. Channel growth (horizontal bar) ---
  const channelData = varyArray(CHANNEL_GROWTH.growth, f, { startSeed: 300 });
  const channelBgColors = channelData.map(g => {
    if (g >= 20) return 'rgba(22,163,74,0.8)';
    if (g >= 10) return 'rgba(0,210,255,0.8)';
    if (g >= 7) return 'rgba(41,121,255,0.8)';
    return 'rgba(148,163,184,0.8)';
  });

  createChart('chart-mktg-channel', {
    type: 'bar',
    data: {
      labels: CHANNEL_GROWTH.channels,
      datasets: [{
        label: 'Growth %',
        data: channelData,
        backgroundColor: channelBgColors,
        borderColor: channelBgColors.map(c => c.replace('0.8', '1')),
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => `เติบโต +${ctx.parsed.x.toFixed(1)}%` }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: '#4a5568',
            callback: v => `+${v}%`
          },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: {
          ticks: { color: '#4a5568' },
          grid: { display: false }
        }
      }
    }
  });

  // --- 4. Area growth (horizontal bar) ---
  const areaData = varyArray(AREA_GROWTH.growth, f, { startSeed: 310 });
  const areaBgColors = areaData.map(g => {
    if (g >= 10) return 'rgba(124,77,255,0.8)';
    if (g >= 7) return 'rgba(41,121,255,0.8)';
    return 'rgba(0,191,165,0.8)';
  });

  createChart('chart-mktg-area', {
    type: 'bar',
    data: {
      labels: AREA_GROWTH.areas,
      datasets: [{
        label: 'Growth %',
        data: areaData,
        backgroundColor: areaBgColors,
        borderColor: areaBgColors.map(c => c.replace('0.8', '1')),
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => `เติบโต +${ctx.parsed.x.toFixed(1)}%` }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: '#4a5568',
            callback: v => `+${v}%`
          },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: {
          ticks: { color: '#4a5568' },
          grid: { display: false }
        }
      }
    }
  });

  // --- 5. Growth Leaders table ---
  renderGrowthTable(topProducts, f);
}

/**
 * ตาราง Growth Leaders: Top 10 สินค้าที่เติบโตสูงสุด
 * คำนวณ growth จากค่าเฉลี่ย searchVolume ครึ่งหลัง vs ครึ่งแรก ของ weeklyData
 * แล้ว vary ตามค่า filter
 */
function renderGrowthTable(products, filters) {
  const tableEl = document.getElementById('mktg-leaders-table');
  if (!tableEl) return;

  const catNameMap = { bread: 'ขนมปัง', cake: 'เค้ก & เพสทรี', cookie: 'คุกกี้ & บิสกิต', donut: 'โดนัท', health: 'ขนมอบสุขภาพ', other: 'ขนมอบอื่นๆ' };

  const withGrowth = products.map((p, idx) => {
    const weeks = p.weeklyData;
    const mid = Math.floor(weeks.length / 2);
    const firstHalf = weeks.slice(0, mid);
    const secondHalf = weeks.slice(mid);

    const avgFirst = firstHalf.reduce((s, w) => s + w.searchVolume, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((s, w) => s + w.searchVolume, 0) / secondHalf.length;

    const growthRate = avgFirst > 0
      ? ((avgSecond - avgFirst) / avgFirst * 100)
      : 0;

    // vary ค่า volume และ growth ตาม filter
    const variedVolume = varyValue(avgSecond, filters, { seed: 400 + idx, asInt: true });
    const variedGrowth = varyPercent(growthRate, filters, { seed: 450 + idx });

    return { ...p, growthRate: variedGrowth, avgSecond: variedVolume };
  });

  // เรียงตาม growthRate มากสุด เอา Top 10
  const top10 = [...withGrowth]
    .sort((a, b) => b.growthRate - a.growthRate)
    .slice(0, 10);

  const trendLabel = (rate) => {
    if (rate > 10) return `<span class="trend-hot">+${rate}% \u{1F525}</span>`;
    if (rate > 0) return `<span class="positive">+${rate}%</span>`;
    if (rate < 0) return `<span class="negative">${rate}%</span>`;
    return '<span>0%</span>';
  };

  const trendIcon = (rate) => {
    if (rate > 10) return '\u{1F525}';
    if (rate > 0) return '↑';
    return '↓';
  };

  const rows = top10.map((p, i) => `
    <tr>
      <td class="num">${i + 1}</td>
      <td>${p.name}</td>
      <td>${p.brand}</td>
      <td>${catNameMap[p.category] || p.category}</td>
      <td class="num">${fmt(Math.round(p.avgSecond))}</td>
      <td class="num">${trendLabel(p.growthRate)}</td>
      <td class="num">${trendIcon(p.growthRate)}</td>
    </tr>
  `).join('');

  tableEl.innerHTML = `
    <table class="mkt-growth-table">
      <thead>
        <tr>
          <th class="num">#</th>
          <th>สินค้า</th>
          <th>แบรนด์</th>
          <th>หมวดหมู่</th>
          <th class="num">Avg Volume</th>
          <th class="num">Growth</th>
          <th class="num">Trend</th>
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
        <p class="loading-text">กำลังโหลดข้อมูลการเติบโต...</p>
      </div>
    </div>
  `;

  try {
    const data = await fetchJSON('/data/trends.json');

    if (thisMount !== mountId) return;

    const { topProducts } = data;

    if (!topProducts || topProducts.length === 0) {
      container.innerHTML = `
        <div class="tab-content">
          <div class="empty-state">
            <p class="empty-state-text">ไม่พบข้อมูลการเติบโต</p>
          </div>
        </div>
      `;
      return;
    }

    // Filter bar อยู่นอก content div เพื่อไม่ให้ถูก re-render
    container.innerHTML = `
      <div class="tab-content">
        ${buildFilterBar([YEAR_FILTER, MONTH_FILTER, CHANNEL_FILTER, REGION_FILTER])}
        <div class="mktg-content"></div>
      </div>
    `;

    function render(filters) { renderContent(container, topProducts, filters); }

    render(getFilterValues(container));

    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('MarketGrowth mount error:', err);
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
