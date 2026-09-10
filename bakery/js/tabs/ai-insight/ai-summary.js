/**
 * ai-summary.js - Sub-tab: AI Market Analyst Report
 * REWRITE: Major redesign เป็น AI analyst report
 * แสดง alerts (critical/warning/opportunity), recommended actions,
 * market health score, trend direction chart
 * ข้อมูล demo ในตัว (hardcoded)
 * รองรับ reactive filters
 */
import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { buildFilterBar, PERIOD_FILTER, INSIGHT_TYPE_FILTER } from '../../shared/filter-builder.js';
import { onFilterChange, getFilterValues } from '../../shared/filter-builder.js';
import { varyValue, varyPercent, varyArray } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

const STYLE_ID = 'style-ai-summary';

/* ---------- CSS ---------- */

const MODULE_CSS = `
.ai-analyst-report {
  margin-bottom: 24px;
}
.ai-header {
  margin-bottom: 20px;
}
.ai-header h2 {
  font-size: 1.3rem;
  font-weight: 800;
  color: #1a202c;
  margin: 0 0 4px 0;
}
.ai-date {
  font-size: 0.85rem;
  color: #718096;
}

.ai-alerts {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}
.ai-alert {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 20px;
  border-radius: 12px;
  border-left: 4px solid transparent;
}
.ai-alert .alert-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
  margin-top: 2px;
}
.ai-alert strong {
  display: block;
  font-size: 0.95rem;
  margin-bottom: 4px;
}
.ai-alert p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #4a5568;
}

.ai-alert.critical {
  background: linear-gradient(135deg, rgba(220,38,38,0.06), rgba(220,38,38,0.02));
  border-left-color: #dc2626;
}
.ai-alert.critical strong { color: #dc2626; }

.ai-alert.warning {
  background: linear-gradient(135deg, rgba(245,158,11,0.06), rgba(245,158,11,0.02));
  border-left-color: #f59e0b;
}
.ai-alert.warning strong { color: #f59e0b; }

.ai-alert.opportunity {
  background: linear-gradient(135deg, rgba(22,163,74,0.06), rgba(22,163,74,0.02));
  border-left-color: #16a34a;
}
.ai-alert.opportunity strong { color: #16a34a; }

.ai-alert.info {
  background: linear-gradient(135deg, rgba(41,121,255,0.06), rgba(41,121,255,0.02));
  border-left-color: #2979ff;
}
.ai-alert.info strong { color: #2979ff; }

.ai-recommendations {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  margin-bottom: 24px;
}
.ai-recommendations h3 {
  font-size: 1.1rem;
  margin: 0 0 16px 0;
  color: #1a202c;
}
.ai-recommendations ol {
  margin: 0;
  padding-left: 20px;
}
.ai-recommendations li {
  padding: 8px 0;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  font-size: 0.9rem;
  color: #4a5568;
  line-height: 1.5;
}
.ai-recommendations li:last-child { border-bottom: none; }
.ai-recommendations li strong {
  color: #1a202c;
}

@media (max-width: 767px) {
  .ai-alert { flex-direction: column; gap: 8px; }
}
`;

/* ---------- ข้อมูล Demo ---------- */

const AI_ALERTS = [
  {
    type: 'critical',
    insightType: 'trend',
    icon: '&#128293;',
    title: 'Trend Alert',
    detail: 'ตลาด Sandwich เติบโต +15.5% ในเดือนนี้ แต่ยอดขายบริษัทเติบโตเพียง +4% &#8212; ต้องเร่งแก้ไข'
  },
  {
    type: 'warning',
    insightType: 'competitor',
    icon: '&#9888;&#65039;',
    title: 'Competitor Alert',
    detail: 'S&P ลดราคาเฉลี่ย 8% ใน Channel Modern Trade &#8212; อาจกระทบยอดขายเรา'
  },
  {
    type: 'opportunity',
    insightType: 'opportunity',
    icon: '&#128161;',
    title: 'Opportunity',
    detail: 'แนะนำทดลอง Promotion โดนัท + เครื่องดื่ม ในพื้นที่กรุงเทพ ตลาดโตเร็ว +22%'
  },
  {
    type: 'info',
    insightType: 'action',
    icon: '&#128202;',
    title: 'Market Update',
    detail: 'ตลาดเบเกอรี่ภาพรวมเติบโต 8.2% YoY มูลค่ารวม 12.6 พันล้านบาท &#8212; แนวโน้มเป็นบวกต่อเนื่อง'
  }
];

const RECOMMENDED_ACTIONS = [
  { text: 'ตรวจสอบราคาคู่แข่ง S&P ทุกช่องทาง', priority: 'เร่งด่วน' },
  { text: 'ทำ Promotion Sandwich + เครื่องดื่ม 2 สัปดาห์', priority: 'เร่งด่วน' },
  { text: 'เพิ่ม SKU โดนัท Premium ในกลุ่ม Rising Star', priority: 'สำคัญ' },
  { text: 'ติดตาม Sales Out รายสาขาในพื้นที่ กรุงเทพ/นนทบุรี', priority: 'สำคัญ' },
  { text: 'วิเคราะห์ pain point "ความสด" จากรีวิวลูกค้า', priority: 'ปกติ' },
  { text: 'พัฒนา Healthy Option (Low sugar, Gluten Free) ตาม Consumer Trend', priority: 'ปกติ' }
];

const KEY_INSIGHTS = [
  { icon: '&#128200;', title: 'ตลาดเติบโตต่อเนื่อง', detail: 'ตลาดเบเกอรี่เติบโต 8.2% YoY มูลค่ารวม 12.6 พันล้านบาท' },
  { icon: '&#127849;', title: 'โดนัทเติบโตเร็วที่สุด', detail: 'หมวดโดนัทเติบโต +22% จากกระแสโดนัทพรีเมียม' },
  { icon: '&#128722;', title: 'ออนไลน์เป็นช่องทางดาวรุ่ง', detail: 'ช่องทางออนไลน์เติบโต 28% สูงสุดในทุกช่องทาง' },
  { icon: '&#10024;', title: 'ความสดคือสิ่งที่ลูกค้าต้องการ', detail: 'ผู้บริโภคให้ความสำคัญกับ "ความสด" มากที่สุดจากการวิเคราะห์รีวิว' }
];

const BASE_HEALTH_SCORE = 78;

const BASE_TREND_DIRECTIONS = [22, 12, 8, 5, -2, -5];
const TREND_LABELS = ['โดนัท', 'เค้ก', 'ขนมปัง', 'เพสทรี', 'คุกกี้', 'พาย'];

/* ---------- Filter-aware content ---------- */

function filterAlertsByType(alerts, filters) {
  const t = filters.type;
  if (!t || t === 'all') return alerts;
  return alerts.filter(a => a.insightType === t);
}

function renderContent(container, filters) {
  destroyAll();

  const contentEl = container.querySelector('.aisummary-content');
  if (!contentEl) return;

  // กรองข้อมูลตาม filter
  const visibleAlerts = filterAlertsByType(AI_ALERTS, filters);
  const healthScore = Math.round(varyValue(BASE_HEALTH_SCORE, filters, { seed: 100 }));
  const trendData = varyArray(BASE_TREND_DIRECTIONS, filters, { startSeed: 200 });

  // Alert cards
  const alertCards = visibleAlerts.map(a => `
    <div class="ai-alert ${a.type}">
      <span class="alert-icon">${a.icon}</span>
      <div>
        <strong>${a.title}</strong>
        <p>${a.detail}</p>
      </div>
    </div>
  `).join('');

  // Recommended actions
  const actionItems = RECOMMENDED_ACTIONS.map(a => {
    const priorityColor = a.priority === 'เร่งด่วน' ? '#dc2626' : a.priority === 'สำคัญ' ? '#f59e0b' : '#16a34a';
    return `<li>
      <span style="display:inline-block;background:${priorityColor};color:#fff;padding:1px 8px;border-radius:10px;font-size:0.7rem;font-weight:600;margin-right:8px">${a.priority}</span>
      ${a.text}
    </li>`;
  }).join('');

  // Insight cards
  const insightCards = KEY_INSIGHTS.map(ins => `
    <div style="background:var(--card-bg, #fff);border:1px solid rgba(0,0,0,0.08);border-radius:12px;padding:20px;display:flex;gap:14px;align-items:flex-start">
      <div style="font-size:2rem;flex-shrink:0">${ins.icon}</div>
      <div>
        <div style="font-weight:700;font-size:1.05rem;color:#1a202c;margin-bottom:4px">${ins.title}</div>
        <div style="color:#718096;font-size:0.9rem;line-height:1.5">${ins.detail}</div>
      </div>
    </div>`).join('');

  contentEl.innerHTML = `
    <div class="ai-analyst-report">
      <div class="ai-header">
        <h2>&#129302; AI Market Analyst Report</h2>
        <p class="ai-date">อัปเดตล่าสุด: 9 สิงหาคม 2569</p>
      </div>

      <div class="ai-alerts">
        ${alertCards}
      </div>

      <div class="ai-recommendations">
        <h3>&#127919; Recommended Actions</h3>
        <ol>${actionItems}</ol>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-bottom:var(--spacing-lg,24px)">
      ${insightCards}
    </div>

    <div class="chart-grid">
      <div class="chart-card">
        <h3 class="chart-card-title">Market Health Score</h3>
        <p class="chart-card-subtitle">คะแนนสุขภาพตลาดโดยรวม</p>
        <div class="chart-container chart-tall"><canvas id="chart-ai-health"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">ทิศทางแนวโน้มตามหมวดสินค้า</h3>
        <p class="chart-card-subtitle">% เทียบปีก่อน (บวก = เติบโต, ลบ = หดตัว)</p>
        <div class="chart-container"><canvas id="chart-ai-trend-dir"></canvas></div>
      </div>
    </div>
  `;

  // Render charts
  const remaining = 100 - healthScore;
  const clampedScore = Math.min(100, Math.max(0, healthScore));

  createChart('chart-ai-health', {
    type: 'doughnut',
    data: {
      labels: ['คะแนน', 'ส่วนที่เหลือ'],
      datasets: [{
        data: [clampedScore, 100 - clampedScore],
        backgroundColor: ['#7b2ff7', 'rgba(0,0,0,0.06)'],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '75%',
      plugins: {
        legend: { display: false },
        tooltip: {
          filter: ctx => ctx.dataIndex === 0,
          callbacks: { label: ctx => `${ctx.parsed}/100 คะแนน` }
        }
      }
    },
    plugins: [{
      id: 'centerText',
      afterDraw(chart) {
        const { ctx, chartArea: { width, height, top, left } } = chart;
        const cx = left + width / 2;
        const cy = top + height / 2;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 2.5rem "Segoe UI", sans-serif';
        ctx.fillStyle = '#7b2ff7';
        ctx.fillText(`${clampedScore}`, cx, cy - 8);
        ctx.font = '0.9rem "Segoe UI", sans-serif';
        ctx.fillStyle = '#718096';
        ctx.fillText('/ 100', cx, cy + 22);
        ctx.restore();
      }
    }]
  });

  createChart('chart-ai-trend-dir', {
    type: 'bar',
    data: {
      labels: TREND_LABELS,
      datasets: [{
        label: 'การเติบโต (%)',
        data: trendData,
        backgroundColor: trendData.map(t => t >= 0 ? '#16a34a' : '#dc2626'),
        borderRadius: 6
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${ctx.parsed.y > 0 ? '+' : ''}${ctx.parsed.y.toFixed(1)}%` } }
      },
      scales: {
        x: { ticks: { color: '#4a5568' }, grid: { color: 'rgba(0,0,0,0.06)' } },
        y: {
          ticks: { color: '#4a5568', callback: v => `${v}%` },
          grid: { color: 'rgba(0,0,0,0.06)' }
        }
      }
    }
  });
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

/* ---------- Tab lifecycle ---------- */

export async function mount(container) {
  const thisMount = ++mountId;
  injectCSS();

  container.innerHTML = `
    <div class="tab-content">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">กำลังวิเคราะห์ข้อมูล AI...</p>
      </div>
    </div>
  `;

  try {
    await Promise.resolve();
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">${buildFilterBar([PERIOD_FILTER, INSIGHT_TYPE_FILTER])}<div class="aisummary-content"></div></div>`;

    function render(filters) { renderContent(container, filters); }
    render(getFilterValues(container));
    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('AISummary mount error:', err);
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
