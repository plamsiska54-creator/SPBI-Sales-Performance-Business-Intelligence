/**
 * action-kpi.js - Sub-tab: KPI Tracking Dashboard
 * แสดง KPI cards 4 ใบ + horizontal bar chart + line chart + ตารางสรุป KPI
 * ใช้ข้อมูล demo (static) สำหรับ prototype
 * รองรับ reactive filters
 */
import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { buildFilterBar, PERIOD_FILTER, CATEGORY_FILTER } from '../../shared/filter-builder.js';
import { onFilterChange, getFilterValues } from '../../shared/filter-builder.js';
import { varyValue, varyPercent, varyArray } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

/* ---------- Demo Data ---------- */

const KPI_DATA = [
  { name: 'Market Share',            target: '12%',  actual: '10.0%', targetVal: 12,  actualVal: 10.0, pct: 83, unit: '%' },
  { name: 'Revenue Growth',          target: '+15%', actual: '+8.2%', targetVal: 15,  actualVal: 8.2,  pct: 55, unit: '%' },
  { name: 'Customer Satisfaction',   target: '4.5',  actual: '4.2',   targetVal: 4.5, actualVal: 4.2,  pct: 93, unit: 'คะแนน' },
  { name: 'New Products',            target: '12',   actual: '8',     targetVal: 12,  actualVal: 8,    pct: 67, unit: 'รายการ' }
];

// ข้อมูล KPI รายเดือน (6 เดือน) สำหรับ trend chart
const KPI_MONTHLY = {
  labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'],
  marketShare:   [8.5, 8.8, 9.2, 9.5, 9.8, 10.0],
  revenueGrowth: [3.0, 4.5, 5.8, 6.5, 7.2, 8.2],
  custSat:       [4.0, 4.0, 4.1, 4.1, 4.2, 4.2],
  newProducts:   [1, 2, 3, 5, 6, 8]
};

/* ---------- Inline Styles ---------- */

const STYLES = `
  .kpi-cards-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .kpi-card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
  .kpi-name { font-size: 0.85rem; color: #718096; margin-bottom: 8px; }
  .kpi-values { display: flex; justify-content: space-between; align-items: flex-end; }
  .kpi-actual { font-size: 1.5rem; font-weight: 700; color: #1a202c; }
  .kpi-target { font-size: 0.85rem; color: #718096; }
  .kpi-progress { height: 6px; background: #e2e8f0; border-radius: 3px; margin-top: 12px; overflow: hidden; }
  .kpi-progress-bar { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
  .kpi-progress-bar.good { background: #16a34a; }
  .kpi-progress-bar.warning { background: #f59e0b; }
  .kpi-progress-bar.critical { background: #dc2626; }
  .kpi-pct { font-size: 0.75rem; color: #718096; margin-top: 4px; text-align: right; }
  @media (max-width: 1024px) { .kpi-cards-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 767px) { .kpi-cards-grid { grid-template-columns: 1fr; } }
`;

/* ---------- Helper ---------- */

function progressClass(pct) {
  if (pct >= 80) return 'good';
  if (pct >= 60) return 'warning';
  return 'critical';
}

/* ---------- Render Content ---------- */

function renderContent(container, filters) {
  destroyAll();

  const contentEl = container.querySelector('.actionkpi-content');
  if (!contentEl) return;

  // vary KPI data ตาม filter
  const variedKPI = KPI_DATA.map((kpi, i) => {
    const actualVal = varyValue(kpi.actualVal, filters, { seed: 1000 + i });
    const pct = Math.min(100, Math.round((actualVal / kpi.targetVal) * 100));
    // จัดรูปแบบ actual
    let actualStr;
    if (kpi.unit === '%' && kpi.name === 'Revenue Growth') {
      actualStr = `+${actualVal.toFixed(1)}%`;
    } else if (kpi.unit === '%') {
      actualStr = `${actualVal.toFixed(1)}%`;
    } else if (kpi.unit === 'คะแนน') {
      actualStr = actualVal.toFixed(1);
    } else {
      actualStr = String(Math.round(actualVal));
    }
    return { ...kpi, actualVal, actualStr, pct };
  });

  // KPI Cards
  const kpiCards = variedKPI.map(kpi => `
    <div class="kpi-card">
      <div class="kpi-name">${kpi.name}</div>
      <div class="kpi-values">
        <span class="kpi-actual">${kpi.actualStr}</span>
        <span class="kpi-target">เป้า ${kpi.target}</span>
      </div>
      <div class="kpi-progress">
        <div class="kpi-progress-bar ${progressClass(kpi.pct)}" style="width: ${kpi.pct}%"></div>
      </div>
      <div class="kpi-pct">${kpi.pct}%</div>
    </div>
  `).join('');

  // KPI Table
  const statusBadge = (pct) => {
    if (pct >= 80) return '<span style="color:#16a34a;font-weight:600">บรรลุเป้า</span>';
    if (pct >= 60) return '<span style="color:#f59e0b;font-weight:600">ใกล้เป้า</span>';
    return '<span style="color:#dc2626;font-weight:600">ต่ำกว่าเป้า</span>';
  };

  const tableRows = variedKPI.map(kpi => `
    <tr>
      <td>${kpi.name}</td>
      <td class="num">${kpi.target}</td>
      <td class="num">${kpi.actualStr}</td>
      <td class="num">${kpi.pct}%</td>
      <td class="num">${statusBadge(kpi.pct)}</td>
    </tr>
  `).join('');

  // vary monthly data
  const variedMarketShare = varyArray(KPI_MONTHLY.marketShare, filters, { startSeed: 1100 });
  const variedRevenueGrowth = varyArray(KPI_MONTHLY.revenueGrowth, filters, { startSeed: 1110 });
  const variedCustSat = varyArray(KPI_MONTHLY.custSat, filters, { startSeed: 1120 });
  const variedNewProducts = varyArray(KPI_MONTHLY.newProducts, filters, { startSeed: 1130 });

  contentEl.innerHTML = `
    <div class="kpi-cards-grid">${kpiCards}</div>
    <div class="chart-grid">
      <div class="chart-card">
        <h3 class="chart-card-title">ความสำเร็จตามเป้าหมาย</h3>
        <div class="chart-container"><canvas id="chart-kpi-progress"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">แนวโน้ม KPI รายเดือน</h3>
        <div class="chart-container"><canvas id="chart-kpi-trend"></canvas></div>
      </div>
    </div>
    <div class="chart-card" style="margin-top: var(--spacing-lg, 24px)">
      <h3 class="chart-card-title">ตาราง KPI โดยละเอียด</h3>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>KPI</th>
              <th class="num">เป้าหมาย</th>
              <th class="num">ผลจริง</th>
              <th class="num">%</th>
              <th class="num">สถานะ</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    </div>
  `;

  // Chart: KPI Progress (Horizontal Bar)
  const bgColors = variedKPI.map(kpi => {
    if (kpi.pct >= 80) return '#16a34a';
    if (kpi.pct >= 60) return '#f59e0b';
    return '#dc2626';
  });

  createChart('chart-kpi-progress', {
    type: 'bar',
    data: {
      labels: variedKPI.map(k => k.name),
      datasets: [{
        label: '% ความสำเร็จ',
        data: variedKPI.map(k => k.pct),
        backgroundColor: bgColors.map(c => c + 'CC'),
        borderColor: bgColors,
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: { color: '#4a5568', callback: v => `${v}%` },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: {
          ticks: { color: '#4a5568', font: { size: 12 } },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.parsed.x}% ของเป้าหมาย`
          }
        }
      }
    }
  });

  // Chart: KPI Trend (Line)
  createChart('chart-kpi-trend', {
    type: 'line',
    data: {
      labels: KPI_MONTHLY.labels,
      datasets: [
        {
          label: 'Market Share (%)',
          data: variedMarketShare,
          borderColor: CHART_COLORS[0],
          backgroundColor: CHART_COLORS[0] + '1A',
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2
        },
        {
          label: 'Revenue Growth (%)',
          data: variedRevenueGrowth,
          borderColor: CHART_COLORS[1],
          backgroundColor: CHART_COLORS[1] + '1A',
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2
        },
        {
          label: 'Customer Sat. (x20)',
          data: variedCustSat.map(v => v * 20),
          borderColor: CHART_COLORS[2],
          backgroundColor: CHART_COLORS[2] + '1A',
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2
        },
        {
          label: 'New Products (รายการ)',
          data: variedNewProducts,
          borderColor: CHART_COLORS[3],
          backgroundColor: CHART_COLORS[3] + '1A',
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2
        }
      ]
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          ticks: { color: '#4a5568' },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#4a5568' },
          grid: { color: 'rgba(0,0,0,0.06)' }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#4a5568', usePointStyle: true, padding: 12 }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              if (ctx.datasetIndex === 2) {
                return `${ctx.dataset.label.replace(' (x20)', '')}: ${(ctx.parsed.y / 20).toFixed(1)}`;
              }
              return `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}`;
            }
          }
        }
      }
    }
  });
}

/* ---------- Tab lifecycle ---------- */

export async function mount(container) {
  const thisMount = ++mountId;

  container.innerHTML = `
    <div class="tab-content">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  `;

  await new Promise(r => setTimeout(r, 200));
  if (thisMount !== mountId) return;

  container.innerHTML = `
    <div class="tab-content">
      <style>${STYLES}</style>
      ${buildFilterBar([PERIOD_FILTER, CATEGORY_FILTER])}
      <div class="actionkpi-content"></div>
    </div>
  `;

  function render(filters) { renderContent(container, filters); }
  render(getFilterValues(container));
  filterCleanup = onFilterChange(container, render);
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
