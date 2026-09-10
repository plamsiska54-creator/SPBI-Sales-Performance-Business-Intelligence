/**
 * cons-behavior.js - Tab: พฤติกรรมผู้บริโภค (Consumer Buying Behavior)
 * REWRITE: เพิ่ม Consumer Preference Keywords + Opportunity Box
 * แสดง chart ความถี่ซื้อ, ช่องทาง, ยอดใช้จ่ายตามกลุ่มอายุ,
 * preference keywords, opportunity box, ตารางสรุป
 * ข้อมูล: static data (survey-based)
 * รองรับ loading / empty / error states + race condition guard
 * Filter-reactive: เปลี่ยน filter แล้ว render ใหม่ทันที
 */

import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { buildFilterBar, onFilterChange, getFilterValues, PERIOD_FILTER, AGE_GROUP_FILTER, CHANNEL_FILTER } from '../../shared/filter-builder.js';
import { varyValue, varyPercent } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

const STYLE_ID = 'style-cons-behavior';

/* ---------- CSS ---------- */

const MODULE_CSS = `
.preference-keywords {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.pref-kw-card {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 10px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.pref-kw-card .kw-icon {
  font-size: 1.6rem;
  flex-shrink: 0;
}
.pref-kw-card .kw-info .kw-label {
  font-weight: 700;
  color: #1a202c;
  font-size: 0.95rem;
  margin-bottom: 2px;
}
.pref-kw-card .kw-info .kw-detail {
  font-size: 0.85rem;
  color: #718096;
}
.pref-kw-card .kw-change {
  margin-left: auto;
  font-weight: 700;
  font-size: 1.1rem;
}
.pref-kw-card .kw-change.up { color: #16a34a; }
.pref-kw-card .kw-change.hot { color: #dc2626; }

.opportunity-box {
  background: linear-gradient(135deg, rgba(46,204,113,0.06), rgba(0,210,255,0.06));
  border: 1px solid rgba(46,204,113,0.25);
  border-radius: 12px;
  padding: 20px 24px;
  margin-top: 24px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.opportunity-box .opp-icon { font-size: 1.5rem; flex-shrink: 0; margin-top: 2px; }
.opportunity-box .opp-title { font-weight: 700; color: #16a34a; margin-bottom: 6px; font-size: 0.95rem; }
.opportunity-box .opp-detail { color: #4a5568; font-size: 0.9rem; line-height: 1.6; }
`;

/* ---------- Static Data (Survey Results) ---------- */

const PURCHASE_FREQUENCY = [
  { label: 'ซื้อทุกวัน', value: 12, color: '#2ecc71' },
  { label: 'สัปดาห์ละ 2-3 ครั้ง', value: 32, color: '#3498db' },
  { label: 'สัปดาห์ละครั้ง', value: 28, color: '#f39c12' },
  { label: 'เดือนละ 2-3 ครั้ง', value: 18, color: '#e74c3c' },
  { label: 'นาน ๆ ครั้ง', value: 10, color: '#9b59b6' }
];

const PURCHASE_CHANNELS = [
  { label: 'ร้านสะดวกซื้อ (7-11 etc.)', value: 35, color: '#7b2ff7' },
  { label: 'ซูเปอร์มาร์เก็ต/ไฮเปอร์', value: 20, color: '#2ecc71' },
  { label: 'ร้านเบเกอรี่/คาเฟ่', value: 22, color: '#f39c12' },
  { label: 'ออนไลน์/เดลิเวอรี่', value: 8, color: '#00d2ff' },
  { label: 'ตลาดนัด/ร้านอื่นๆ', value: 15, color: '#e74c3c' }
];

const AVG_SPEND_BY_AGE = [
  { ageGroup: 'Gen Z (14-29)', spend: 180 },
  { ageGroup: 'Millennials (30-45)', spend: 320 },
  { ageGroup: 'Gen X (46-61)', spend: 280 },
  { ageGroup: 'Boomers (62+)', spend: 160 }
];

const PREFERENCE_KEYWORDS = [
  { keyword: 'ครัวซองต์พรีเมียม', change: 42, icon: '&#129360;', detail: 'Shio Pan / Crookie เทรนด์ viral +42%' },
  { keyword: 'โปรตีนสูง/โลว์คาร์บ', change: 24, icon: '&#128170;', detail: 'ส่วนแบ่ง 17%→24% กำลังเติบโตเร็ว' },
  { keyword: 'Plant-based / Vegan', change: 12, icon: '&#127793;', detail: 'เทรนด์ทั่วโลก เติบโต 12% YoY' },
  { keyword: 'Gluten Free', change: 13, icon: '&#127838;', detail: 'ตลาด GF โลก $15.2B, ไทยเริ่มตาม' },
  { keyword: 'เดลิเวอรี่/Quick Commerce', change: 11, icon: '&#128666;', detail: 'ช่องทางออนไลน์ CAGR 10.9%' },
  { keyword: 'ขนมอบ Instagrammable', change: null, icon: '&#128248;', detail: '84% Gen Z ถือว่า snacking = self-care' }
];

/* ---------- Chart Area HTML Template ---------- */

function chartAreaHTML() {
  return `
    <div class="chart-grid">
      <div class="chart-card">
        <h3 class="chart-card-title">ความถี่ในการซื้อ</h3>
        <p class="chart-card-subtitle">จากผลสำรวจผู้บริโภค</p>
        <div class="chart-container chart-tall">
          <canvas id="chart-freq"></canvas>
        </div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">ช่องทางการซื้อ</h3>
        <p class="chart-card-subtitle">สัดส่วนแต่ละช่องทาง (%)</p>
        <div class="chart-container chart-tall">
          <canvas id="chart-channel"></canvas>
        </div>
      </div>
      <div class="chart-card full-width">
        <h3 class="chart-card-title">ยอดใช้จ่ายเฉลี่ยต่อครั้ง (ตามกลุ่มอายุ)</h3>
        <p class="chart-card-subtitle">บาทต่อครั้ง</p>
        <div class="chart-container">
          <canvas id="chart-spend"></canvas>
        </div>
      </div>
    </div>

    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">&#128270; Consumer Preference Keywords</h3>
      <p class="chart-card-subtitle">คีย์เวิร์ดจากข้อมูล social / review ที่ผู้บริโภคพูดถึงมากที่สุด</p>
      <div class="preference-keywords" id="pref-kw-area"></div>
    </div>

    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">สรุปพฤติกรรมผู้บริโภค</h3>
      <div class="data-table-wrapper" id="behavior-summary-table"></div>
    </div>

    <div id="opportunity-box-area"></div>
  `;
}

/* ---------- Render Functions ---------- */

function renderFrequencyChart(filters) {
  const variedData = PURCHASE_FREQUENCY.map((f, i) =>
    varyPercent(f.value, filters, { seed: 100 + i })
  );

  createChart('chart-freq', {
    type: 'doughnut',
    data: {
      labels: PURCHASE_FREQUENCY.map((f, i) => `${f.label} (${variedData[i]}%)`),
      datasets: [{
        data: variedData,
        backgroundColor: PURCHASE_FREQUENCY.map(f => f.color),
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      cutout: '50%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#4a5568', padding: 10, usePointStyle: true, font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: ctx => `${PURCHASE_FREQUENCY[ctx.dataIndex].label}: ${ctx.parsed}%`
          }
        }
      }
    }
  });
}

function renderChannelChart(filters) {
  const variedData = PURCHASE_CHANNELS.map((c, i) =>
    varyPercent(c.value, filters, { seed: 200 + i })
  );

  createChart('chart-channel', {
    type: 'bar',
    data: {
      labels: PURCHASE_CHANNELS.map(c => c.label),
      datasets: [{
        label: 'สัดส่วน (%)',
        data: variedData,
        backgroundColor: PURCHASE_CHANNELS.map(c => c.color + 'CC'),
        borderColor: PURCHASE_CHANNELS.map(c => c.color),
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => `${ctx.parsed.y}%` }
        }
      },
      scales: {
        x: {
          ticks: { color: '#4a5568' },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: {
          beginAtZero: true,
          max: 50,
          ticks: { color: '#4a5568', callback: v => `${v}%` },
          grid: { color: 'rgba(0,0,0,0.06)' }
        }
      }
    }
  });
}

function renderSpendChart(filters) {
  const ageColors = ['#00d2ff', '#7b2ff7', '#2ecc71', '#f39c12'];
  const variedSpend = AVG_SPEND_BY_AGE.map((a, i) =>
    varyValue(a.spend, filters, { seed: 300 + i, asInt: true, min: 0 })
  );

  createChart('chart-spend', {
    type: 'bar',
    data: {
      labels: AVG_SPEND_BY_AGE.map(a => a.ageGroup),
      datasets: [{
        label: 'ยอดใช้จ่ายเฉลี่ย (บาท)',
        data: variedSpend,
        backgroundColor: ageColors.map(c => c + 'CC'),
        borderColor: ageColors,
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => `${ctx.parsed.y} บาท/ครั้ง` }
        }
      },
      scales: {
        x: {
          ticks: { color: '#4a5568' },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#4a5568', callback: v => `${v} ฿` },
          grid: { color: 'rgba(0,0,0,0.06)' },
          title: { display: true, text: 'บาท/ครั้ง', color: '#718096' }
        }
      }
    }
  });
}

/** Preference Keywords cards */
function renderPreferenceKeywords(filters) {
  const el = document.getElementById('pref-kw-area');
  if (!el) return;

  el.innerHTML = PREFERENCE_KEYWORDS.map((k, i) => {
    const variedChange = k.change !== null ? Math.round(varyPercent(k.change, filters, { seed: 400 + i })) : null;
    const changeText = variedChange !== null ? `+${variedChange}%` : '#1';
    const changeClass = variedChange && variedChange >= 30 ? 'hot' : 'up';
    return `
      <div class="pref-kw-card">
        <div class="kw-icon">${k.icon}</div>
        <div class="kw-info">
          <div class="kw-label">${k.keyword}</div>
          <div class="kw-detail">${k.detail}</div>
        </div>
        <div class="kw-change ${changeClass}">${changeText}</div>
      </div>`;
  }).join('');
}

/** Opportunity Box */
function renderOpportunityBox(filters) {
  const el = document.getElementById('opportunity-box-area');
  if (!el) return;

  const croissantGrowth = Math.round(varyPercent(42, filters, { seed: 500 }));
  const onlineCagr = Math.round(varyPercent(11, filters, { seed: 501 }));

  el.innerHTML = `
    <div class="opportunity-box">
      <div class="opp-icon">&#128161;</div>
      <div>
        <div class="opp-title">Opportunity Insight</div>
        <div class="opp-detail">
          <strong>"ครัวซองต์พรีเมียม"</strong> (Shio Pan / Crookie) เติบโต +${croissantGrowth}% จาก viral trend
          &#8594; <strong>Opportunity:</strong> ออกไลน์ครัวซองต์พรีเมียมจับกลุ่ม Gen Z ที่ยอมจ่ายเพื่อ Instagrammable snacking
          <br><strong>"โปรตีนสูง/โลว์คาร์บ"</strong> มีส่วนแบ่งเพิ่มจาก 17% เป็น 24% + <strong>"Plant-based"</strong> โตทั่วโลก 12% YoY
          &#8594; พัฒนาสินค้ากลุ่ม Healthy Bakery เพื่อจับเทรนด์สุขภาพ
          <br>ช่องทาง <strong>ออนไลน์/Quick Commerce</strong> เติบโต CAGR +${onlineCagr}%
          &#8594; ขยายช่องทาง delivery เพื่อเข้าถึงผู้บริโภครุ่นใหม่
        </div>
      </div>
    </div>
  `;
}

function renderSummaryTable(filters) {
  const tableEl = document.getElementById('behavior-summary-table');
  if (!tableEl) return;

  const ageDistribution = [0.28, 0.32, 0.25, 0.15];
  const baseWeightedAvg = AVG_SPEND_BY_AGE.reduce((s, a, i) => s + a.spend * ageDistribution[i], 0);
  const weightedAvg = varyValue(baseWeightedAvg, filters, { seed: 600, asInt: true, min: 0 });

  const onlineGrowth = Math.round(varyPercent(11, filters, { seed: 601 }));
  const croissantGrowth = Math.round(varyPercent(42, filters, { seed: 602 }));

  const summaryData = [
    { metric: 'ความถี่ซื้อสูงสุด', value: 'สัปดาห์ละ 2-3 ครั้ง', detail: `${varyPercent(32, filters, { seed: 610 })}% ของผู้บริโภค` },
    { metric: 'ช่องทางหลัก', value: 'ร้านสะดวกซื้อ (7-11 etc.)', detail: `${varyPercent(35, filters, { seed: 611 })}% ของยอดขาย` },
    { metric: 'กลุ่มอายุที่ใช้จ่ายสูงสุด', value: 'Millennials (30-45)', detail: `${varyValue(320, filters, { seed: 612, asInt: true })} บาท/ครั้ง` },
    { metric: 'ยอดใช้จ่ายเฉลี่ยรวม', value: `${weightedAvg} บาท/ครั้ง`, detail: 'เฉลี่ยถ่วงน้ำหนักทุกกลุ่มอายุ' },
    { metric: 'ช่องทางออนไลน์', value: `${varyPercent(8, filters, { seed: 613 })}%`, detail: `CAGR +${onlineGrowth}% เติบโตเร็วที่สุด` },
    { metric: 'ผู้ซื้อประจำ (ทุกวัน+สัปดาห์)', value: `${varyPercent(72, filters, { seed: 614 })}%`, detail: 'ซื้ออย่างน้อยสัปดาห์ละครั้ง' },
    { metric: 'เทรนด์ยอดนิยม', value: 'ครัวซองต์พรีเมียม', detail: `Shio Pan / Crookie +${croissantGrowth}% viral trend` },
    { metric: 'เทรนด์สุขภาพ', value: 'โปรตีนสูง / Plant-based / GF', detail: 'เติบโต 12-24%' }
  ];

  const rows = summaryData.map(s => `
    <tr>
      <td>${s.metric}</td>
      <td style="font-weight:600">${s.value}</td>
      <td style="color:#718096">${s.detail}</td>
    </tr>
  `).join('');

  tableEl.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>ตัวชี้วัด</th>
          <th>ค่า</th>
          <th>รายละเอียด</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
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

/* ---------- renderContent: เรนเดอร์เนื้อหาตาม filter ---------- */

function renderContent(container, filters) {
  destroyAll();

  const contentEl = container.querySelector('.cons-behavior-content');
  if (!contentEl) return;

  contentEl.innerHTML = chartAreaHTML();

  renderFrequencyChart(filters);
  renderChannelChart(filters);
  renderSpendChart(filters);
  renderPreferenceKeywords(filters);
  renderSummaryTable(filters);
  renderOpportunityBox(filters);
}

/* ---------- Tab lifecycle ---------- */

export async function mount(container) {
  const thisMount = ++mountId;
  injectCSS();

  container.innerHTML = `
    <div class="tab-content">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  `;

  await new Promise(r => setTimeout(r, 100));
  if (thisMount !== mountId) return;

  try {
    container.innerHTML = `
      <div class="tab-content">
        ${buildFilterBar([PERIOD_FILTER, AGE_GROUP_FILTER, CHANNEL_FILTER])}
        <div class="cons-behavior-content"></div>
      </div>
    `;

    function render(filters) { renderContent(container, filters); }

    render(getFilterValues(container));

    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('ConsBehavior mount error:', err);
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
