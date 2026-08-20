/**
 * area-heatmap.js - Sub-tab: Heatmap พื้นที่
 * ENHANCE: เพิ่ม growth heatmap + ตารางจังหวัดละเอียดมากขึ้น
 * แสดง heatmap grid (HTML table + สี opacity) ของรายได้ตามภูมิภาค x หมวดสินค้า
 * + ตารางจังหวัดที่มียอดสูงสุด
 * ข้อมูล demo ในตัว (hardcoded)
 * รองรับ filter reactive (เปลี่ยน filter -> ข้อมูลเปลี่ยนตาม)
 */
import { destroyAll } from '../../shared/chart-factory.js';
import { buildFilterBar, onFilterChange, getFilterValues, PERIOD_FILTER, REGION_FILTER } from '../../shared/filter-builder.js';
import { varyValue, varyPercent } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

/* ---------- ข้อมูล Demo ---------- */

const REGIONS = ['กรุงเทพ', 'ภาคกลาง', 'ภาคเหนือ', 'ภาคอีสาน', 'ภาคใต้', 'ภาคตะวันออก'];
const CATEGORIES = ['เค้ก', 'ขนมปัง', 'คุกกี้', 'เพสทรี', 'โดนัท', 'พาย'];

// รายได้ (ล้านบาท) - region x category
const HEATMAP_VALUES = [
  [850, 1200, 420, 380, 520, 280],
  [580, 780,  310, 250, 380, 180],
  [320, 420,  180, 140, 200, 90],
  [380, 520,  210, 160, 250, 120],
  [280, 380,  150, 120, 180, 80],
  [180, 260,  100, 80,  140, 60]
];

// Growth (%) - region x category
const GROWTH_VALUES = [
  [5, 3, 8, 12, 22, -3],
  [8, 6, 10, 5, 18, 2],
  [4, 7, 3, 8, 15, -1],
  [12, 9, 14, 6, 20, 1],
  [3, 5, 6, 4, 10, -5],
  [15, 11, 18, 10, 25, 4]
];

const PROVINCE_DATA = [
  { province: 'กรุงเทพ',       region: 'กรุงเทพ',       revenue: 4200, growth: 7,  ourShare: 18, competitorShare: 25 },
  { province: 'เชียงใหม่',     region: 'ภาคเหนือ',     revenue: 620,  growth: 8,  ourShare: 22, competitorShare: 20 },
  { province: 'ขอนแก่น',      region: 'ภาคอีสาน',     revenue: 480,  growth: 14, ourShare: 15, competitorShare: 12 },
  { province: 'สงขลา',        region: 'ภาคใต้',        revenue: 420,  growth: 5,  ourShare: 12, competitorShare: 18 },
  { province: 'ชลบุรี',        region: 'ภาคตะวันออก',  revenue: 380,  growth: 18, ourShare: 20, competitorShare: 15 },
  { province: 'นครราชสีมา',   region: 'ภาคอีสาน',     revenue: 350,  growth: 11, ourShare: 16, competitorShare: 14 },
  { province: 'นครปฐม',      region: 'ภาคกลาง',      revenue: 340,  growth: 15, ourShare: 25, competitorShare: 18 },
  { province: 'ภูเก็ต',        region: 'ภาคใต้',        revenue: 280,  growth: 9,  ourShare: 10, competitorShare: 22 }
];

/* ---------- Helpers ---------- */

function fmt(n) { return Number(n).toLocaleString('th-TH'); }

function calcOpacity(value, maxValue) {
  return 0.15 + (value / maxValue) * 0.85;
}

/* ---------- Render Content (filter-reactive) ---------- */

function renderContent(container, filters) {
  destroyAll();

  const contentEl = container.querySelector('.area-heatmap-content');

  // Vary heatmap values ตาม filter
  const variedHeatmap = HEATMAP_VALUES.map((row, ri) =>
    row.map((val, ci) => varyValue(val, filters, { seed: 600 + ri * 10 + ci, asInt: true }))
  );

  // Vary growth values ตาม filter
  const variedGrowth = GROWTH_VALUES.map((row, ri) =>
    row.map((val, ci) => varyPercent(val, filters, { seed: 700 + ri * 10 + ci }))
  );

  // Vary province data ตาม filter
  const variedProvinces = PROVINCE_DATA.map((p, i) => ({
    province: p.province,
    region: p.region,
    revenue: varyValue(p.revenue, filters, { seed: 800 + i, asInt: true }),
    growth: varyPercent(p.growth, filters, { seed: 810 + i }),
    ourShare: varyPercent(p.ourShare, filters, { seed: 820 + i }),
    competitorShare: varyPercent(p.competitorShare, filters, { seed: 830 + i })
  }));

  const maxVal = Math.max(...variedHeatmap.flat());

  // Revenue heatmap
  const heatmapRows = REGIONS.map((region, ri) => {
    const cells = CATEGORIES.map((_, ci) => {
      const val = variedHeatmap[ri][ci];
      const opacity = calcOpacity(val, maxVal);
      const textColor = opacity > 0.6 ? '#ffffff' : '#1a202c';
      return `<td class="heatmap-cell" style="background:rgba(124,77,255,${opacity.toFixed(2)});color:${textColor};text-align:center;padding:12px 8px;font-weight:600">${fmt(val)}</td>`;
    }).join('');
    return `<tr><td style="font-weight:600;padding:12px 8px;white-space:nowrap">${region}</td>${cells}</tr>`;
  }).join('');

  // Growth heatmap
  const maxGrowth = Math.max(...variedGrowth.flat().map(Math.abs));
  const growthRows = REGIONS.map((region, ri) => {
    const cells = CATEGORIES.map((_, ci) => {
      const val = variedGrowth[ri][ci];
      const isPositive = val >= 0;
      const intensity = Math.abs(val) / maxGrowth;
      const bgColor = isPositive
        ? `rgba(22,163,74,${(0.15 + intensity * 0.7).toFixed(2)})`
        : `rgba(220,38,38,${(0.15 + intensity * 0.7).toFixed(2)})`;
      const textColor = intensity > 0.5 ? '#ffffff' : '#1a202c';
      return `<td style="background:${bgColor};color:${textColor};text-align:center;padding:12px 8px;font-weight:600">${val > 0 ? '+' : ''}${val}%</td>`;
    }).join('');
    return `<tr><td style="font-weight:600;padding:12px 8px;white-space:nowrap">${region}</td>${cells}</tr>`;
  }).join('');

  // Province table
  const provinceRows = variedProvinces.map(p => {
    const shareGap = +(p.ourShare - p.competitorShare).toFixed(1);
    const shareColor = shareGap >= 0 ? '#16a34a' : '#dc2626';
    return `
    <tr>
      <td style="font-weight:600">${p.province}</td>
      <td>${p.region}</td>
      <td class="num">${fmt(p.revenue)}M</td>
      <td class="num" style="color:${p.growth >= 10 ? '#16a34a' : '#4a5568'}">+${p.growth}%</td>
      <td class="num">${p.ourShare}%</td>
      <td class="num">${p.competitorShare}%</td>
      <td class="num" style="color:${shareColor};font-weight:600">${shareGap > 0 ? '+' : ''}${shareGap}%</td>
    </tr>`;
  }).join('');

  contentEl.innerHTML = `
    <div class="chart-card">
      <h3 class="chart-card-title">Heatmap รายได้ตามภูมิภาค x หมวดสินค้า</h3>
      <p class="chart-card-subtitle">ค่าในตาราง = ล้านบาท | สีเข้ม = รายได้สูง</p>
      <div class="data-table-wrapper">
        <table class="data-table" style="border-collapse:separate;border-spacing:2px">
          <thead>
            <tr>
              <th style="min-width:120px">ภูมิภาค</th>
              ${CATEGORIES.map(c => `<th style="text-align:center">${c}</th>`).join('')}
            </tr>
          </thead>
          <tbody>${heatmapRows}</tbody>
        </table>
      </div>
    </div>

    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">Heatmap การเติบโตตามภูมิภาค x หมวดสินค้า</h3>
      <p class="chart-card-subtitle">เขียว = เติบโต | แดง = หดตัว | สีเข้ม = ค่าสูง</p>
      <div class="data-table-wrapper">
        <table class="data-table" style="border-collapse:separate;border-spacing:2px">
          <thead>
            <tr>
              <th style="min-width:120px">ภูมิภาค</th>
              ${CATEGORIES.map(c => `<th style="text-align:center">${c}</th>`).join('')}
            </tr>
          </thead>
          <tbody>${growthRows}</tbody>
        </table>
      </div>
    </div>

    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">จังหวัดที่มียอดรายได้สูงสุด</h3>
      <p class="chart-card-subtitle">เปรียบเทียบส่วนแบ่งตลาดของเรา vs คู่แข่ง</p>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>จังหวัด</th>
              <th>ภูมิภาค</th>
              <th class="num">รายได้</th>
              <th class="num">การเติบโต</th>
              <th class="num">Share เรา</th>
              <th class="num">Share คู่แข่ง</th>
              <th class="num">Gap</th>
            </tr>
          </thead>
          <tbody>${provinceRows}</tbody>
        </table>
      </div>
    </div>
  `;
}

/* ---------- Tab lifecycle ---------- */

export async function mount(container) {
  const thisMount = ++mountId;

  container.innerHTML = `
    <div class="tab-content">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">กำลังโหลดข้อมูล Heatmap...</p>
      </div>
    </div>
  `;

  try {
    await Promise.resolve();
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">${buildFilterBar([PERIOD_FILTER, REGION_FILTER])}<div class="area-heatmap-content"></div></div>`;

    function render(filters) { renderContent(container, filters); }

    render(getFilterValues(container));

    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('AreaHeatmap mount error:', err);
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
