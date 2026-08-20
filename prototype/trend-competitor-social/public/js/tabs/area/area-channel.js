/**
 * area-channel.js - Sub-tab: ช่องทางจำหน่าย
 * ENHANCE: เพิ่ม revenue per outlet + channel performance insight
 * แสดงสัดส่วน channel mix, การเติบโตแต่ละช่องทาง + ตารางรายละเอียด
 * ข้อมูล demo ในตัว (hardcoded)
 * รองรับ filter reactive (เปลี่ยน filter -> ข้อมูลเปลี่ยนตาม)
 */
import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { buildFilterBar, onFilterChange, getFilterValues, PERIOD_FILTER, REGION_FILTER, CHANNEL_FILTER } from '../../shared/filter-builder.js';
import { varyValue, varyPercent } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

/* ---------- ข้อมูล Demo ---------- */

const CHANNEL_DATA = [
  { name: 'ร้านสาขา',       share: 35, growth: 5,   revenue: 4410, outlets: 1250, revPerOutlet: 3528 },
  { name: 'ซูเปอร์มาร์เก็ต', share: 25, growth: 3,   revenue: 3150, outlets: 890,  revPerOutlet: 3539 },
  { name: 'ร้านสะดวกซื้อ',   share: 20, growth: 12,  revenue: 2520, outlets: 15200, revPerOutlet: 166 },
  { name: 'ออนไลน์',        share: 15, growth: 28,  revenue: 1890, outlets: null,  revPerOutlet: null },
  { name: 'ตลาดนัด',        share: 5,  growth: -2,  revenue: 630,  outlets: 3400,  revPerOutlet: 185 }
];

/* ---------- Helpers ---------- */

function fmt(n) { return Number(n).toLocaleString('th-TH'); }

/* ---------- Render Content (filter-reactive) ---------- */

function renderContent(container, filters) {
  destroyAll();

  const contentEl = container.querySelector('.area-channel-content');

  // คำนวณค่าที่ vary ตาม filter
  const variedData = CHANNEL_DATA.map((c, i) => ({
    name: c.name,
    share: varyPercent(c.share, filters, { seed: 500 + i }),
    growth: varyPercent(c.growth, filters, { seed: 510 + i }),
    revenue: varyValue(c.revenue, filters, { seed: 520 + i, asInt: true }),
    outlets: c.outlets ? varyValue(c.outlets, filters, { seed: 530 + i, asInt: true }) : null,
    revPerOutlet: c.revPerOutlet ? varyValue(c.revPerOutlet, filters, { seed: 540 + i, asInt: true }) : null
  }));

  const rows = variedData.map(c => {
    const growthColor = c.growth >= 20 ? '#16a34a' : c.growth >= 0 ? '#3498db' : '#dc2626';
    const badge = c.growth >= 20 ? '<span style="background:#16a34a22;color:#16a34a;padding:2px 8px;border-radius:10px;font-size:0.75rem;font-weight:600;margin-left:6px">HOT</span>' : '';
    return `
    <tr>
      <td style="font-weight:600">${c.name}${badge}</td>
      <td class="num">${c.share}%</td>
      <td class="num">${fmt(c.revenue)}M</td>
      <td class="num" style="color:${growthColor};font-weight:600">${c.growth > 0 ? '+' : ''}${c.growth}%</td>
      <td class="num">${c.outlets ? fmt(c.outlets) : '-'}</td>
      <td class="num">${c.revPerOutlet ? fmt(c.revPerOutlet) : '-'}</td>
    </tr>`;
  }).join('');

  contentEl.innerHTML = `
    <div class="chart-grid">
      <div class="chart-card">
        <h3 class="chart-card-title">สัดส่วนช่องทางจำหน่าย</h3>
        <p class="chart-card-subtitle">Channel Mix (%)</p>
        <div class="chart-container chart-tall"><canvas id="chart-channel-mix"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">การเติบโตตามช่องทาง</h3>
        <p class="chart-card-subtitle">% เทียบปีก่อน</p>
        <div class="chart-container"><canvas id="chart-channel-growth"></canvas></div>
      </div>
    </div>
    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">รายละเอียดช่องทางจำหน่าย</h3>
      <p class="chart-card-subtitle">สรุป Revenue, Growth, จุดขาย, Revenue/Outlet</p>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>ช่องทาง</th>
              <th class="num">สัดส่วน</th>
              <th class="num">รายได้</th>
              <th class="num">การเติบโต</th>
              <th class="num">จุดขาย</th>
              <th class="num">รายได้/จุดขาย</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
    <div style="background:linear-gradient(135deg,rgba(0,210,255,0.06),rgba(123,47,247,0.06));border:1px solid rgba(0,210,255,0.2);border-radius:12px;padding:20px 24px;margin-top:24px;display:flex;gap:14px;align-items:flex-start">
      <div style="font-size:1.5rem;flex-shrink:0">&#128202;</div>
      <div>
        <div style="font-weight:700;color:#00a0cc;margin-bottom:6px">Channel Insight</div>
        <div style="color:#4a5568;font-size:0.9rem;line-height:1.6">
          <strong>ออนไลน์</strong> เป็นช่องทางที่เติบโตเร็วที่สุด (+${variedData[3].growth}%) แนะนำเพิ่มงบ Digital Marketing<br>
          <strong>ร้านสะดวกซื้อ</strong> เติบโต +${variedData[2].growth}% แต่รายได้ต่อจุดขายต่ำ (${variedData[2].revPerOutlet ? fmt(variedData[2].revPerOutlet) : '-'} บาท) ควร optimize SKU ให้เหมาะกับ format<br>
          <strong>ตลาดนัด</strong> เริ่มหดตัว (${variedData[4].growth}%) อาจต้อง reconsider การลงทุนในช่องทางนี้
        </div>
      </div>
    </div>
  `;

  // --- Charts ---

  // Channel Mix Doughnut
  createChart('chart-channel-mix', {
    type: 'doughnut',
    data: {
      labels: variedData.map(c => c.name),
      datasets: [{
        data: variedData.map(c => c.share),
        backgroundColor: CHART_COLORS.slice(0, 5),
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      cutout: '55%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#4a5568', padding: 10, usePointStyle: true }
        },
        tooltip: {
          callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed}%` }
        }
      }
    }
  });

  // Channel Growth Bar
  createChart('chart-channel-growth', {
    type: 'bar',
    data: {
      labels: variedData.map(c => c.name),
      datasets: [{
        label: 'การเติบโต (%)',
        data: variedData.map(c => c.growth),
        backgroundColor: variedData.map(c =>
          c.growth >= 20 ? '#16a34a' : c.growth >= 0 ? '#3498db' : '#dc2626'
        ),
        borderRadius: 6
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${ctx.parsed.y > 0 ? '+' : ''}${ctx.parsed.y}%` } }
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

/* ---------- Tab lifecycle ---------- */

export async function mount(container) {
  const thisMount = ++mountId;

  container.innerHTML = `
    <div class="tab-content">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">กำลังโหลดข้อมูลช่องทางจำหน่าย...</p>
      </div>
    </div>
  `;

  try {
    await Promise.resolve();
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">${buildFilterBar([PERIOD_FILTER, REGION_FILTER, CHANNEL_FILTER])}<div class="area-channel-content"></div></div>`;

    function render(filters) { renderContent(container, filters); }

    render(getFilterValues(container));

    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('AreaChannel mount error:', err);
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
}
