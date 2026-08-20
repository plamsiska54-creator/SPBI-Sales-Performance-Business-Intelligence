/**
 * area-overview.js - Sub-tab: ภาพรวมพื้นที่
 * REWRITE: เพิ่ม rich comparison table (เรา vs คู่แข่ง) + opportunity indicator
 * แสดงรายได้, การเติบโตเปรียบเทียบ, ตารางโอกาส/ภัยคุกคาม
 * ข้อมูล demo ในตัว (hardcoded)
 * รองรับ filter reactive (เปลี่ยน filter -> ข้อมูลเปลี่ยนตาม)
 */
import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { buildFilterBar, onFilterChange, getFilterValues, PERIOD_FILTER, REGION_FILTER } from '../../shared/filter-builder.js';
import { varyValue, varyPercent } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

const STYLE_ID = 'style-area-overview';

/* ---------- CSS ---------- */

const MODULE_CSS = `
.area-comparison-table th, .area-comparison-table td {
  padding: 10px 12px;
}
.opp-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}
.opp-badge.opportunity {
  background: rgba(22,163,74,0.1);
  color: #16a34a;
}
.opp-badge.threat {
  background: rgba(220,38,38,0.1);
  color: #dc2626;
}
.opp-badge.neutral {
  background: rgba(113,128,150,0.1);
  color: #718096;
}
.area-insight-box {
  background: linear-gradient(135deg, rgba(0,210,255,0.06), rgba(123,47,247,0.06));
  border: 1px solid rgba(123,47,247,0.15);
  border-radius: 12px;
  padding: 20px 24px;
  margin-top: 24px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.area-insight-box .insight-icon { font-size: 1.5rem; flex-shrink: 0; }
.area-insight-box .insight-title { font-weight: 700; color: #7b2ff7; margin-bottom: 6px; }
.area-insight-box .insight-detail { color: #4a5568; font-size: 0.9rem; line-height: 1.6; }
`;

/* ---------- ข้อมูล Demo ---------- */

const AREA_DATA = [
  { name: 'กรุงเทพฯ',   revenue: 4200, marketGrowth: 8,  ourGrowth: 5,  competitorGrowth: 12, topBrand: 'S&P' },
  { name: 'นครปฐม',     revenue: 1200, marketGrowth: 15, ourGrowth: 18, competitorGrowth: 7,  topBrand: 'วรรณวนัช' },
  { name: 'นนทบุรี',     revenue: 1800, marketGrowth: 10, ourGrowth: 4,  competitorGrowth: 14, topBrand: 'After You' },
  { name: 'ชลบุรี',      revenue: 1500, marketGrowth: 12, ourGrowth: 15, competitorGrowth: 8,  topBrand: 'วรรณวนัช' },
  { name: 'เชียงใหม่',   revenue: 1100, marketGrowth: 6,  ourGrowth: 10, competitorGrowth: 5,  topBrand: 'Yamazaki' },
  { name: 'สงขลา',      revenue: 900,  marketGrowth: 9,  ourGrowth: 3,  competitorGrowth: 11, topBrand: 'S&P' }
];

/* ---------- Helpers ---------- */

function fmt(n) { return Number(n).toLocaleString('th-TH'); }

function getOpportunityStatus(ourGrowth, competitorGrowth) {
  if (ourGrowth > competitorGrowth) return { label: 'Opportunity', cssClass: 'opportunity', icon: '&#128994;' };
  if (ourGrowth < competitorGrowth) return { label: 'Threat', cssClass: 'threat', icon: '&#128308;' };
  return { label: 'Neutral', cssClass: 'neutral', icon: '&#128992;' };
}

/* ---------- CSS Injection ---------- */

function injectCSS() {
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = MODULE_CSS;
    document.head.appendChild(style);
  }
}

function removeCSS() {
  const el = document.getElementById(STYLE_ID);
  if (el) el.remove();
}

/* ---------- Render Content (filter-reactive) ---------- */

function renderContent(container, filters) {
  destroyAll();

  const contentEl = container.querySelector('.area-overview-content');

  // คำนวณค่าที่ vary ตาม filter สำหรับแต่ละพื้นที่
  const variedData = AREA_DATA.map((a, i) => ({
    name: a.name,
    revenue: varyValue(a.revenue, filters, { seed: 100 + i, asInt: true }),
    marketGrowth: varyPercent(a.marketGrowth, filters, { seed: 200 + i }),
    ourGrowth: varyPercent(a.ourGrowth, filters, { seed: 300 + i }),
    competitorGrowth: varyPercent(a.competitorGrowth, filters, { seed: 400 + i }),
    topBrand: a.topBrand
  }));

  // ตาราง comparison
  const comparisonRows = variedData.map(a => {
    const opp = getOpportunityStatus(a.ourGrowth, a.competitorGrowth);
    const ourColor = a.ourGrowth >= a.competitorGrowth ? '#16a34a' : '#dc2626';
    const compColor = a.competitorGrowth > a.ourGrowth ? '#dc2626' : '#16a34a';
    return `
      <tr>
        <td style="font-weight:600">${a.name}</td>
        <td class="num">+${a.marketGrowth}%</td>
        <td class="num" style="color:${ourColor};font-weight:600">+${a.ourGrowth}%</td>
        <td class="num" style="color:${compColor}">+${a.competitorGrowth}%</td>
        <td class="num">${fmt(a.revenue)}M</td>
        <td><span class="opp-badge ${opp.cssClass}">${opp.icon} ${opp.label}</span></td>
      </tr>`;
  }).join('');

  // สรุป insight
  const threats = variedData.filter(a => a.ourGrowth < a.competitorGrowth);
  const opportunities = variedData.filter(a => a.ourGrowth > a.competitorGrowth);
  const threatNames = threats.map(a => a.name).join(', ');
  const oppNames = opportunities.map(a => a.name).join(', ');

  contentEl.innerHTML = `
    <div class="chart-card">
      <h3 class="chart-card-title">เปรียบเทียบการเติบโต: เรา vs คู่แข่ง</h3>
      <p class="chart-card-subtitle">เทียบ growth ของเรากับคู่แข่งในแต่ละพื้นที่</p>
      <div class="data-table-wrapper">
        <table class="data-table area-comparison-table">
          <thead>
            <tr>
              <th>พื้นที่</th>
              <th class="num">ตลาดโต</th>
              <th class="num">เราโต</th>
              <th class="num">คู่แข่งโต</th>
              <th class="num">รายได้</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>${comparisonRows}</tbody>
        </table>
      </div>
    </div>

    <div class="chart-grid" style="margin-top:var(--spacing-lg)">
      <div class="chart-card">
        <h3 class="chart-card-title">รายได้ตามพื้นที่</h3>
        <p class="chart-card-subtitle">หน่วย: ล้านบาท</p>
        <div class="chart-container"><canvas id="chart-area-revenue"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">เปรียบเทียบ Growth: เรา vs คู่แข่ง</h3>
        <p class="chart-card-subtitle">% เทียบปีก่อน</p>
        <div class="chart-container"><canvas id="chart-area-growth-compare"></canvas></div>
      </div>
    </div>

    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">Opportunity Indicator</h3>
      <p class="chart-card-subtitle">แท่งเขียว = เราโตเร็วกว่าคู่แข่ง | แท่งแดง = คู่แข่งนำ</p>
      <div class="chart-container">
        <canvas id="chart-area-opportunity"></canvas>
      </div>
    </div>

    <div class="area-insight-box">
      <div class="insight-icon">&#128161;</div>
      <div>
        <div class="insight-title">Area Intelligence</div>
        <div class="insight-detail">
          ${threats.length > 0 ? `<strong>&#128308; Threat:</strong> พื้นที่ ${threatNames} คู่แข่งโตเร็วกว่าเรา &#8594; ควรเร่งทำ Promotion<br>` : ''}
          ${opportunities.length > 0 ? `<strong>&#128994; Opportunity:</strong> พื้นที่ ${oppNames} เราโตเร็วกว่า &#8594; ควรเพิ่ม SKU และขยายจุดขาย` : ''}
        </div>
      </div>
    </div>
  `;

  // --- Charts ---

  // Revenue bar
  createChart('chart-area-revenue', {
    type: 'bar',
    data: {
      labels: variedData.map(r => r.name),
      datasets: [{
        label: 'รายได้ (ล้านบาท)',
        data: variedData.map(r => r.revenue),
        backgroundColor: CHART_COLORS.slice(0, 6).map(c => c + 'CC'),
        borderColor: CHART_COLORS.slice(0, 6),
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${fmt(ctx.parsed.y)} ล้านบาท` } }
      },
      scales: {
        x: { ticks: { color: '#4a5568' }, grid: { color: 'rgba(0,0,0,0.06)' } },
        y: {
          beginAtZero: true,
          ticks: { color: '#4a5568', callback: v => `${(v / 1000).toFixed(1)}B` },
          grid: { color: 'rgba(0,0,0,0.06)' }
        }
      }
    }
  });

  // Grouped bar: เราโต vs คู่แข่งโต
  createChart('chart-area-growth-compare', {
    type: 'bar',
    data: {
      labels: variedData.map(r => r.name),
      datasets: [
        {
          label: 'เราโต (%)',
          data: variedData.map(r => r.ourGrowth),
          backgroundColor: '#7b2ff7CC',
          borderColor: '#7b2ff7',
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: 'คู่แข่งโต (%)',
          data: variedData.map(r => r.competitorGrowth),
          backgroundColor: '#e74c3cCC',
          borderColor: '#e74c3c',
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
          callbacks: { label: ctx => `${ctx.dataset.label}: +${ctx.parsed.y}%` }
        }
      },
      scales: {
        x: { ticks: { color: '#4a5568' }, grid: { color: 'rgba(0,0,0,0.06)' } },
        y: {
          beginAtZero: true,
          ticks: { color: '#4a5568', callback: v => `${v}%` },
          grid: { color: 'rgba(0,0,0,0.06)' }
        }
      }
    }
  });

  // Opportunity indicator: ส่วนต่าง (เราโต - คู่แข่งโต)
  const diffs = variedData.map(r => +(r.ourGrowth - r.competitorGrowth).toFixed(1));

  createChart('chart-area-opportunity', {
    type: 'bar',
    data: {
      labels: variedData.map(r => r.name),
      datasets: [{
        label: 'Growth Gap (เรา - คู่แข่ง)',
        data: diffs,
        backgroundColor: diffs.map(d => d >= 0 ? 'rgba(22,163,74,0.7)' : 'rgba(220,38,38,0.7)'),
        borderColor: diffs.map(d => d >= 0 ? '#16a34a' : '#dc2626'),
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const val = ctx.parsed.y;
              return val >= 0 ? `เราโตกว่า +${val}%` : `คู่แข่งโตกว่า ${Math.abs(val)}%`;
            }
          }
        }
      },
      scales: {
        x: { ticks: { color: '#4a5568' }, grid: { color: 'rgba(0,0,0,0.06)' } },
        y: {
          ticks: { color: '#4a5568', callback: v => `${v > 0 ? '+' : ''}${v}%` },
          grid: { color: 'rgba(0,0,0,0.06)' }
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
        <p class="loading-text">กำลังโหลดข้อมูลภาพรวมพื้นที่...</p>
      </div>
    </div>
  `;

  try {
    await Promise.resolve();

    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">${buildFilterBar([PERIOD_FILTER, REGION_FILTER])}<div class="area-overview-content"></div></div>`;

    function render(filters) { renderContent(container, filters); }

    render(getFilterValues(container));

    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('AreaOverview mount error:', err);
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
  removeCSS();
}
