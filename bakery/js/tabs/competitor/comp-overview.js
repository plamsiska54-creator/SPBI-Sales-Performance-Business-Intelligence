/**
 * comp-overview.js - Sub-tab: ภาพรวมคู่แข่ง (Redesigned)
 * KPI Cards 6 ใบ (3x2 grid) + Market Share Donut + Sales Growth Bar + Radar Chart + Rich Table
 * ข้อมูลจาก competitors.json + enriched mock data สำหรับคอลัมน์เพิ่มเติม
 * รองรับ reactive filters (period, competitor)
 */
import { createChart, destroyAll, BRAND_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import { buildFilterBar, getFilterValues, onFilterChange, PERIOD_FILTER, COMPETITOR_FILTER } from '../../shared/filter-builder.js';
import { varyValue, varyPercent, filterByCompetitor } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

const STYLE_ID = 'comp-overview-style';

/* ---------- Enriched Data (ข้อมูลเสริมที่ไม่มีใน JSON) ---------- */

const ENRICHED = {
  snp:       { growth: 6,  avgPrice: 75,  sku: 85,  promoLevel: 'สูง',  branches: 450,  channels: 'ร้าน/Online/MT',  strength: 'แบรนด์แข็ง',  weakness: 'ราคาสูง' },
  afteryou:  { growth: 12, avgPrice: 165, sku: 35,  promoLevel: 'กลาง', branches: 42,   channels: 'ร้าน/Online',     strength: 'Premium',      weakness: 'สาขาน้อย' },
  farmhouse: { growth: 4,  avgPrice: 45,  sku: 120, promoLevel: 'สูง',  branches: null, channels: 'MT/CVS',          strength: 'ราคาถูก',      weakness: 'ภาพลักษณ์' },
  yamazaki:  { growth: 3,  avgPrice: 55,  sku: 65,  promoLevel: 'กลาง', branches: null, channels: 'MT/CVS',          strength: 'คุณภาพ',       weakness: 'สินค้าจำกัด' },
  wanwanach: { growth: 15, avgPrice: 65,  sku: 40,  promoLevel: 'สูง',  branches: 25,   channels: 'ร้าน/Online/CJ',  strength: 'เติบโตเร็ว',    weakness: 'แบรนด์ใหม่' },
  lepain:    { growth: 8,  avgPrice: 135, sku: 28,  promoLevel: 'ต่ำ',   branches: 15,   channels: 'ร้าน',             strength: 'Premium',      weakness: 'สาขาจำกัด' }
};

// Rating เพิ่มเติมสำหรับ Radar Chart (เพิ่ม innovation + branding)
const EXTRA_RATINGS = {
  wanwanach: { innovation: 4.0, branding: 3.5 },
  snp:       { innovation: 3.8, branding: 4.5 },
  afteryou:  { innovation: 4.5, branding: 4.7 },
  farmhouse: { innovation: 3.2, branding: 4.0 },
  yamazaki:  { innovation: 3.6, branding: 3.8 },
  lepain:    { innovation: 4.2, branding: 3.6 }
};

/* ---------- Helpers ---------- */

function fmt(n) { return Number(n).toLocaleString('th-TH'); }

/* ---------- CSS Injection ---------- */

function injectCSS() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .co-kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .co-kpi-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: 1px solid rgba(0,0,0,0.06);
      text-align: center;
      transition: box-shadow 0.2s;
    }
    .co-kpi-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
    .co-kpi-label {
      font-size: 0.85rem;
      color: #718096;
      margin-bottom: 8px;
    }
    .co-kpi-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 4px;
    }
    .co-kpi-note {
      font-size: 0.8rem;
      color: #a0aec0;
    }
    .co-kpi-note .up { color: #16a34a; font-weight: 600; }
    .co-kpi-note .down { color: #dc2626; font-weight: 600; }
    .co-rich-table-wrap {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .co-rich-table-wrap table { min-width: 1100px; }
    .co-promo-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #fff;
    }
    .co-promo-badge.high { background: #dc2626; }
    .co-promo-badge.mid  { background: #f59e0b; }
    .co-promo-badge.low  { background: #16a34a; }
    .co-tag {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 8px;
      font-size: 0.75rem;
      margin: 1px;
    }
    .co-tag-strength { background: #dcfce7; color: #166534; }
    .co-tag-weakness { background: #fee2e2; color: #991b1b; }
    @media (max-width: 768px) {
      .co-kpi-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 480px) {
      .co-kpi-grid { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(style);
}

function removeCSS() {
  const el = document.getElementById(STYLE_ID);
  if (el) el.remove();
}

/* ---------- renderContent (reactive) ---------- */

function renderContent(container, data, filters) {
  destroyAll();

  const contentEl = container.querySelector('.comp-overview-content');
  if (!contentEl) return;

  const allBrands = data.brands;
  if (!allBrands || allBrands.length === 0) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-text">ไม่พบข้อมูลในเงื่อนไขที่เลือก</p>
      </div>`;
    return;
  }

  const brands = filterByCompetitor(allBrands, filters, 'id');
  if (brands.length === 0) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-text">ไม่พบข้อมูลคู่แข่งในเงื่อนไขที่เลือก</p>
      </div>`;
    return;
  }

  const f = filters;

  // --- KPI Cards ---
  const us = brands.find(b => b.id === 'wanwanach');
  const leader = brands.reduce((a, b) => (a.marketShare > b.marketShare ? a : b));
  const totalSKU = Object.values(ENRICHED).reduce((s, e) => s + e.sku, 0);
  const avgPrice = Math.round(
    Object.values(ENRICHED).reduce((s, e) => s + e.avgPrice, 0) / Object.keys(ENRICHED).length
  );

  const vTotalSKU = varyValue(totalSKU, f, { seed: 101, asInt: true });
  const vAvgPrice = varyValue(avgPrice, f, { seed: 102, asInt: true });
  const vPromos = varyValue(18, f, { seed: 103, asInt: true, min: 1 });
  const vOurShare = us ? varyPercent(us.marketShare, f, { seed: 104 }) : '-';
  const vShareChange = varyPercent(1.2, f, { seed: 105 });
  const vLeaderShare = varyPercent(leader.marketShare, f, { seed: 106 });

  const cards = [
    { label: 'คู่แข่งทั้งหมด',     value: `${brands.length}`,              note: 'แบรนด์ที่ติดตาม' },
    { label: 'Market Leader',       value: leader.name,                     note: `Market Share ${vLeaderShare}%` },
    { label: 'Our Share',           value: `${vOurShare}%`, note: us ? `<span class="up">+${vShareChange}pp</span> จากไตรมาสก่อน` : '' },
    { label: 'ราคาเฉลี่ยตลาด',     value: `฿${vAvgPrice}`,             note: 'เฉลี่ยทุกแบรนด์' },
    { label: 'จำนวน SKU ทั้งตลาด',  value: fmt(vTotalSKU),                   note: 'รวมทุกแบรนด์' },
    { label: 'โปรโมชั่น Active',    value: `${vPromos}`,                     note: 'รายการที่ดำเนินอยู่' }
  ];

  const kpiHTML = `
    <div class="co-kpi-grid">
      ${cards.map(c => `
        <div class="co-kpi-card">
          <div class="co-kpi-label">${c.label}</div>
          <div class="co-kpi-value">${c.value}</div>
          <div class="co-kpi-note">${c.note}</div>
        </div>
      `).join('')}
    </div>
  `;

  // --- Chart containers ---
  const chartHTML = `
    <div class="chart-grid">
      <div class="chart-card">
        <h3 class="chart-card-title">ส่วนแบ่งตลาด (Market Share)</h3>
        <div class="chart-container chart-tall"><canvas id="chart-comp-mshare"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">อัตราการเติบโต (Sales Growth)</h3>
        <div class="chart-container chart-tall"><canvas id="chart-comp-growth"></canvas></div>
      </div>
      <div class="chart-card full-width">
        <h3 class="chart-card-title">คะแนนรีวิวเปรียบเทียบ (Radar)</h3>
        <div class="chart-container chart-tall"><canvas id="chart-comp-radar"></canvas></div>
      </div>
    </div>
    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">ตารางเปรียบเทียบคู่แข่ง (Competitor Comparison)</h3>
      <div id="comp-overview-table"></div>
    </div>
  `;

  contentEl.innerHTML = kpiHTML + chartHTML;

  // --- Market Share Doughnut ---
  const shares = brands.map((b, i) => varyPercent(b.marketShare, f, { seed: 200 + i }));
  const totalShare = shares.reduce((s, v) => s + v, 0);
  const othersShare = Math.max(0, +(100 - totalShare).toFixed(1));

  createChart('chart-comp-mshare', {
    type: 'doughnut',
    data: {
      labels: [...brands.map(b => b.name), 'อื่น ๆ'],
      datasets: [{
        data: [...shares, othersShare],
        backgroundColor: [...brands.map(b => BRAND_COLORS[b.id]), '#cbd5e0'],
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

  // --- Sales Growth Bar (เรียง สูง -> ต่ำ) ---
  const sorted = brands
    .map((b, i) => ({
      ...b,
      growth: varyPercent(ENRICHED[b.id]?.growth || 0, f, { seed: 300 + i })
    }))
    .sort((a, b) => b.growth - a.growth);

  createChart('chart-comp-growth', {
    type: 'bar',
    data: {
      labels: sorted.map(b => b.name),
      datasets: [{
        label: 'การเติบโต (%)',
        data: sorted.map(b => b.growth),
        backgroundColor: sorted.map(b => BRAND_COLORS[b.id]),
        borderColor: sorted.map(b => BRAND_COLORS[b.id]),
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `+${ctx.parsed.x}%` } }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { color: '#4a5568', callback: v => `${v}%` },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: { ticks: { color: '#4a5568' }, grid: { color: 'rgba(0,0,0,0.06)' } }
      }
    }
  });

  // --- Radar Chart ---
  const dims = ['taste', 'value', 'packaging', 'freshness', 'delivery', 'overall', 'innovation', 'branding'];
  const radarLabels = ['รสชาติ', 'คุ้มค่า', 'บรรจุภัณฑ์', 'ความสด', 'จัดส่ง', 'ภาพรวม', 'นวัตกรรม', 'แบรนดิ้ง'];

  const radarDatasets = brands.map(b => ({
    label: b.name,
    data: dims.map(d => {
      if (b.ratings[d] != null) return b.ratings[d];
      if (EXTRA_RATINGS[b.id] && EXTRA_RATINGS[b.id][d] != null) return EXTRA_RATINGS[b.id][d];
      return 0;
    }),
    borderColor: BRAND_COLORS[b.id],
    backgroundColor: BRAND_COLORS[b.id] + '25',
    pointBackgroundColor: BRAND_COLORS[b.id],
    pointRadius: 3,
    borderWidth: 2
  }));

  createChart('chart-comp-radar', {
    type: 'radar',
    data: { labels: radarLabels, datasets: radarDatasets },
    options: {
      scales: {
        r: {
          min: 0,
          max: 5,
          ticks: { stepSize: 1, color: '#718096', backdropColor: 'transparent' },
          grid: { color: 'rgba(0,0,0,0.08)' },
          pointLabels: { color: '#4a5568', font: { size: 12 } },
          angleLines: { color: 'rgba(0,0,0,0.08)' }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#4a5568', usePointStyle: true, padding: 12 }
        }
      }
    }
  });

  // --- Rich Table ---
  const tableEl = document.getElementById('comp-overview-table');
  if (tableEl) {
    function promoBadge(level) {
      const cls = level === 'สูง' ? 'high' : level === 'กลาง' ? 'mid' : 'low';
      return `<span class="co-promo-badge ${cls}">${level}</span>`;
    }

    const rows = brands.map((b, i) => {
      const e = ENRICHED[b.id] || {};
      const vShare = varyPercent(b.marketShare, f, { seed: 400 + i });
      const vGrowth = varyPercent(e.growth || 0, f, { seed: 410 + i });
      const vPrice = varyValue(e.avgPrice || b.avgPrice, f, { seed: 420 + i, asInt: true });
      const vSku = varyValue(e.sku || b.products, f, { seed: 430 + i, asInt: true, min: 1 });
      const vBranches = e.branches != null ? varyValue(e.branches, f, { seed: 440 + i, asInt: true, min: 1 }) : null;

      return `
        <tr>
          <td style="white-space:nowrap">${b.logo} ${b.name}</td>
          <td class="num">${vShare}%</td>
          <td class="num" style="color:#16a34a;font-weight:600">+${vGrowth}%</td>
          <td class="num">฿${vPrice}</td>
          <td class="num">${vSku}</td>
          <td class="num">${promoBadge(e.promoLevel || '-')}</td>
          <td class="num">${vBranches != null ? fmt(vBranches) : '-'}</td>
          <td>${e.channels || '-'}</td>
          <td><span class="co-tag co-tag-strength">${e.strength || '-'}</span></td>
          <td><span class="co-tag co-tag-weakness">${e.weakness || '-'}</span></td>
        </tr>`;
    }).join('');

    tableEl.innerHTML = `
      <div class="co-rich-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>คู่แข่ง</th>
              <th class="num">Market Share</th>
              <th class="num">Growth</th>
              <th class="num">ราคาเฉลี่ย</th>
              <th class="num">SKU</th>
              <th class="num">Promotion</th>
              <th class="num">สาขา</th>
              <th>ช่องทาง</th>
              <th>จุดแข็ง</th>
              <th>จุดอ่อน</th>
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
        <p class="loading-text">กำลังโหลดข้อมูล...</p>
      </div>
    </div>`;

  try {
    const data = await fetchJSON('/data/competitors.json');
    if (thisMount !== mountId) return;

    if (!data.brands || data.brands.length === 0) {
      container.innerHTML = `
        <div class="tab-content">
          <div class="empty-state">
            <p class="empty-state-text">ไม่พบข้อมูลคู่แข่ง</p>
          </div>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="tab-content">
        ${buildFilterBar([PERIOD_FILTER, COMPETITOR_FILTER])}
        <div class="comp-overview-content"></div>
      </div>`;

    function render(filters) { renderContent(container, data, filters); }
    render(getFilterValues(container));
    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('Competitors Overview mount error:', err);
    container.innerHTML = `
      <div class="tab-content">
        <div class="error-state">
          <p class="error-state-text">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
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
