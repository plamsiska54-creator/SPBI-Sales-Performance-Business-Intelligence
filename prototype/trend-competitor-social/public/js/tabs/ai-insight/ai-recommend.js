/**
 * ai-recommend.js - Sub-tab: คำแนะนำ AI
 * ENHANCE: เพิ่ม priority-based action cards + impact scoring + timeline
 * แสดง recommendation cards พร้อม priority/impact/timeline + opportunity score radar
 * ข้อมูล demo ในตัว (hardcoded)
 * รองรับ reactive filters
 */
import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { buildFilterBar, PRIORITY_FILTER, CATEGORY_FILTER } from '../../shared/filter-builder.js';
import { onFilterChange, getFilterValues } from '../../shared/filter-builder.js';
import { varyValue, varyArray, filterByPriority } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

const STYLE_ID = 'style-ai-recommend';

/* ---------- CSS ---------- */

const MODULE_CSS = `
.rec-card {
  background: var(--card-bg, #fff);
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
  transition: box-shadow 0.2s;
}
.rec-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}
.rec-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.rec-card-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rec-card-num {
  font-weight: 700;
  color: #4a5568;
  font-size: 0.85rem;
}
.rec-priority-badge {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
}
.rec-card-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.rec-metric {
  text-align: center;
}
.rec-metric-label {
  font-size: 0.7rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.rec-metric-value {
  font-weight: 700;
  font-size: 1.1rem;
}
.rec-card-title {
  font-weight: 700;
  font-size: 1.05rem;
  color: #1a202c;
  margin-bottom: 6px;
}
.rec-card-detail {
  color: #718096;
  font-size: 0.9rem;
  line-height: 1.5;
}
.rec-card-footer {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(0,0,0,0.04);
  font-size: 0.8rem;
  color: #718096;
}
.rec-card-footer span {
  display: flex;
  align-items: center;
  gap: 4px;
}
`;

/* ---------- ข้อมูล Demo ---------- */

const RECOMMENDATIONS = [
  {
    title: 'เพิ่มไลน์โดนัทพรีเมียม',
    detail: 'ตลาดโดนัทโตเร็ว +22% แต่คู่แข่งยังน้อย โอกาสครองส่วนแบ่งสูง ควรเริ่มจากสูตร Mochi Donut + Glazed Premium',
    priority: 'urgent',
    priorityLabel: 'สูง',
    priorityColor: '#dc2626',
    impact: 92,
    effort: 'ปานกลาง',
    timeline: '1-2 เดือน',
    category: 'Product'
  },
  {
    title: 'ขยายช่องทางออนไลน์',
    detail: 'ช่องทางออนไลน์เติบโต 28% ควรเพิ่ม platform delivery (Grab, LINE MAN, Robinhood) และ social commerce',
    priority: 'urgent',
    priorityLabel: 'สูง',
    priorityColor: '#dc2626',
    impact: 88,
    effort: 'ต่ำ',
    timeline: '2-4 สัปดาห์',
    category: 'Channel'
  },
  {
    title: 'ทำ Promotion Sandwich + เครื่องดื่ม',
    detail: 'ตลาด Sandwich โต +15.5% แต่เราโตเพียง 4% ควรทำ combo promotion กับเครื่องดื่ม ในพื้นที่กรุงเทพ',
    priority: 'urgent',
    priorityLabel: 'สูง',
    priorityColor: '#dc2626',
    impact: 85,
    effort: 'ต่ำ',
    timeline: '1-2 สัปดาห์',
    category: 'Promotion'
  },
  {
    title: 'พัฒนาสินค้า Healthy Option',
    detail: 'เทรนด์สุขภาพเติบโตต่อเนื่อง Low sugar +25%, Gluten Free +15% ควรพัฒนาขนมปังโฮลวีท/ธัญพืช',
    priority: 'high',
    priorityLabel: 'กลาง',
    priorityColor: '#f59e0b',
    impact: 75,
    effort: 'สูง',
    timeline: '2-3 เดือน',
    category: 'Product'
  },
  {
    title: 'เจาะตลาดภาคตะวันออก (ชลบุรี)',
    detail: 'ภาคตะวันออกเติบโต +15% สูงสุด เราโตกว่าคู่แข่ง ควรเพิ่ม SKU และขยายจุดขาย',
    priority: 'high',
    priorityLabel: 'กลาง',
    priorityColor: '#f59e0b',
    impact: 70,
    effort: 'ปานกลาง',
    timeline: '1-2 เดือน',
    category: 'Area'
  },
  {
    title: 'แก้ปัญหา Pain Point "ความสด"',
    detail: 'จากรีวิวลูกค้า "ไม่สด" เป็น pain point อันดับ 1 (342 mentions) ควรปรับ supply chain / cold chain',
    priority: 'high',
    priorityLabel: 'กลาง',
    priorityColor: '#f59e0b',
    impact: 68,
    effort: 'สูง',
    timeline: '2-4 เดือน',
    category: 'Operations'
  },
  {
    title: 'ปรับกลยุทธ์ราคาคุกกี้',
    detail: 'หมวดคุกกี้เริ่มหดตัว -2% ควรปรับราคาและ positioning ใหม่ หรือทำ bundle กับสินค้าอื่น',
    priority: 'normal',
    priorityLabel: 'ต่ำ',
    priorityColor: '#16a34a',
    impact: 55,
    effort: 'ต่ำ',
    timeline: '1-2 สัปดาห์',
    category: 'Pricing'
  },
  {
    title: 'Monitor คู่แข่ง S&P ลดราคา Modern Trade',
    detail: 'S&P ลดราคา 8% ใน Modern Trade ควรติดตามทุกสัปดาห์และเตรียม counter-strategy',
    priority: 'normal',
    priorityLabel: 'ต่ำ',
    priorityColor: '#16a34a',
    impact: 50,
    effort: 'ต่ำ',
    timeline: 'ต่อเนื่อง',
    category: 'Competitive'
  }
];

const BASE_OPPORTUNITY_SCORES = [82, 78, 65, 90, 85, 72];
const OPPORTUNITY_LABELS = ['ขนาดตลาด', 'การเติบโต', 'การแข่งขัน', 'ศักยภาพออนไลน์', 'ความต้องการผู้บริโภค', 'ความพร้อมของเรา'];

/* ---------- Render Content ---------- */

function renderContent(container, filters) {
  destroyAll();

  const contentEl = container.querySelector('.airecommend-content');
  if (!contentEl) return;

  // กรองตาม priority
  const filteredRecs = filterByPriority(RECOMMENDATIONS, filters);

  // vary opportunity scores
  const opportunityScores = varyArray(BASE_OPPORTUNITY_SCORES, filters, { startSeed: 500 });

  // สร้าง recommendation cards
  const recCards = filteredRecs.map((r, i) => {
    const impactVal = Math.round(varyValue(r.impact, filters, { seed: 600 + i }));
    const impactColor = impactVal >= 80 ? '#7b2ff7' : impactVal >= 60 ? '#3498db' : '#718096';
    const effortIcon = r.effort === 'ต่ำ' ? '&#128994;' : r.effort === 'ปานกลาง' ? '&#128992;' : '&#128308;';
    return `
    <div class="rec-card">
      <div class="rec-card-header">
        <div class="rec-card-left">
          <span class="rec-card-num">#${i + 1}</span>
          <span class="rec-priority-badge" style="background:${r.priorityColor}">${r.priorityLabel}</span>
          <span style="background:rgba(0,0,0,0.05);padding:2px 8px;border-radius:10px;font-size:0.7rem;color:#718096">${r.category}</span>
        </div>
        <div class="rec-card-right">
          <div class="rec-metric">
            <div class="rec-metric-label">Impact</div>
            <div class="rec-metric-value" style="color:${impactColor}">${impactVal}</div>
          </div>
        </div>
      </div>
      <div class="rec-card-title">${r.title}</div>
      <div class="rec-card-detail">${r.detail}</div>
      <div class="rec-card-footer">
        <span>${effortIcon} Effort: ${r.effort}</span>
        <span>&#128197; Timeline: ${r.timeline}</span>
      </div>
    </div>`;
  }).join('');

  // สรุปสถิติ
  const highCount = filteredRecs.filter(r => r.priority === 'urgent').length;
  const midCount = filteredRecs.filter(r => r.priority === 'high').length;
  const lowCount = filteredRecs.filter(r => r.priority === 'normal').length;
  const avgImpact = filteredRecs.length > 0
    ? Math.round(filteredRecs.reduce((s, r, i) => s + varyValue(r.impact, filters, { seed: 600 + i }), 0) / filteredRecs.length)
    : 0;

  contentEl.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-bottom:var(--spacing-lg,24px)">
      <div style="background:#dc262611;border-radius:10px;padding:16px;text-align:center">
        <div style="font-size:1.8rem;font-weight:700;color:#dc2626">${highCount}</div>
        <div style="font-size:0.8rem;color:#718096">เร่งด่วน</div>
      </div>
      <div style="background:#f59e0b11;border-radius:10px;padding:16px;text-align:center">
        <div style="font-size:1.8rem;font-weight:700;color:#f59e0b">${midCount}</div>
        <div style="font-size:0.8rem;color:#718096">สำคัญ</div>
      </div>
      <div style="background:#16a34a11;border-radius:10px;padding:16px;text-align:center">
        <div style="font-size:1.8rem;font-weight:700;color:#16a34a">${lowCount}</div>
        <div style="font-size:0.8rem;color:#718096">ปกติ</div>
      </div>
      <div style="background:#7b2ff711;border-radius:10px;padding:16px;text-align:center">
        <div style="font-size:1.8rem;font-weight:700;color:#7b2ff7">${avgImpact}</div>
        <div style="font-size:0.8rem;color:#718096">Avg Impact</div>
      </div>
    </div>

    <div class="chart-grid">
      <div class="chart-card">
        <h3 class="chart-card-title">คำแนะนำเชิงกลยุทธ์จาก AI</h3>
        <p class="chart-card-subtitle">เรียงตาม Priority และ Impact Score</p>
        <div style="max-height:640px;overflow-y:auto;padding:4px">
          ${recCards}
        </div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">Opportunity Score</h3>
        <p class="chart-card-subtitle">คะแนนโอกาสทางธุรกิจรายมิติ (0-100)</p>
        <div class="chart-container chart-tall"><canvas id="chart-ai-opportunity"></canvas></div>
      </div>
    </div>
  `;

  // Render radar chart
  createChart('chart-ai-opportunity', {
    type: 'radar',
    data: {
      labels: OPPORTUNITY_LABELS,
      datasets: [{
        label: 'คะแนนโอกาส',
        data: opportunityScores,
        borderColor: '#7b2ff7',
        backgroundColor: 'rgba(123, 47, 247, 0.2)',
        pointBackgroundColor: '#7b2ff7',
        pointRadius: 4,
        borderWidth: 2
      }]
    },
    options: {
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { stepSize: 20, color: '#718096', backdropColor: 'transparent' },
          grid: { color: 'rgba(0,0,0,0.08)' },
          pointLabels: { color: '#4a5568', font: { size: 11 } },
          angleLines: { color: 'rgba(0,0,0,0.08)' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed.r.toFixed(0)}/100` }
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
        <p class="loading-text">กำลังสร้างคำแนะนำ AI...</p>
      </div>
    </div>
  `;

  try {
    await Promise.resolve();
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">${buildFilterBar([PRIORITY_FILTER, CATEGORY_FILTER])}<div class="airecommend-content"></div></div>`;

    function render(filters) { renderContent(container, filters); }
    render(getFilterValues(container));
    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('AIRecommend mount error:', err);
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
