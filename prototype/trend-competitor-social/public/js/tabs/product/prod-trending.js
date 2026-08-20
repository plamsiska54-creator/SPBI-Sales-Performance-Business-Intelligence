/**
 * prod-trending.js - Tab: สินค้ายอดนิยม (Top Trending Products)
 * REWRITE: เพิ่ม Product Quadrant System + AI Decision Box
 * แสดง chart สินค้า trending, badges, ตารางรายละเอียด
 * ใช้ข้อมูลจาก /data/trends.json
 * รองรับ loading / empty / error states + race condition guard
 * Filter-reactive: เปลี่ยน filter แล้ว render ใหม่ทันที
 */

import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import { buildFilterBar, onFilterChange, getFilterValues, PERIOD_FILTER, CATEGORY_FILTER } from '../../shared/filter-builder.js';
import { varyValue, varyPercent, varyArray, filterByCategory } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

const STYLE_ID = 'style-prod-trending';

/* ---------- CSS ---------- */

const MODULE_CSS = `
.product-quadrant-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}
.quadrant {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.quadrant.rising { border-left: 4px solid #16a34a; }
.quadrant.high-demand { border-left: 4px solid #2979ff; }
.quadrant.declining { border-left: 4px solid #f59e0b; }
.quadrant.dead { border-left: 4px solid #dc2626; }
.quadrant h4 { font-size: 1rem; margin-bottom: 4px; }
.quadrant p { font-size: 0.8rem; color: #718096; margin-bottom: 12px; }
.quadrant ul { list-style: none; padding: 0; margin: 0; }
.quadrant li {
  padding: 6px 0;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  font-size: 0.85rem;
  color: #4a5568;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.quadrant li:last-child { border-bottom: none; }
.quadrant li .product-name { font-weight: 600; }
.quadrant li .product-stats { font-size: 0.8rem; color: #718096; }

.ai-decision-box {
  background: linear-gradient(135deg, #667eea11, #764ba211);
  border: 1px solid rgba(123, 47, 247, 0.2);
  border-radius: 12px;
  padding: 20px 24px;
  margin-top: 24px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.ai-decision-box .ai-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-top: 2px;
}
.ai-decision-box .ai-title {
  font-weight: 700;
  color: #7b2ff7;
  margin-bottom: 6px;
  font-size: 0.95rem;
}
.ai-decision-box .ai-detail {
  color: #4a5568;
  font-size: 0.9rem;
  line-height: 1.6;
}

@media (max-width: 767px) {
  .product-quadrant-grid { grid-template-columns: 1fr; }
}
`;

/* ---------- Helpers ---------- */

function fmt(n) { return Number(n).toLocaleString('th-TH'); }

function trendBadge(trend) {
  if (trend === 'up') return '<span class="positive">&#9650; ขาขึ้น</span>';
  if (trend === 'down') return '<span class="negative">&#9660; ขาลง</span>';
  return '<span>&#9654; ทรงตัว</span>';
}

/** คำนวณ growth จาก weekly data (4 สัปดาห์ล่าสุด vs 4 สัปดาห์ก่อนหน้า) */
function calcGrowth(product) {
  const weeks = product.weeklyData;
  if (!weeks || weeks.length < 8) return 0;
  const recent = weeks.slice(-4).reduce((s, w) => s + w.searchVolume, 0);
  const prev = weeks.slice(-8, -4).reduce((s, w) => s + w.searchVolume, 0);
  return prev > 0 ? +((recent - prev) / prev * 100).toFixed(1) : 0;
}

function getCatName(categories, catId) {
  const cat = categories.find(c => c.id === catId);
  return cat ? cat.name : catId;
}

/* ---------- Quadrant Classification ---------- */

/**
 * จัดกลุ่มสินค้าเป็น 4 quadrant:
 * - Rising Star: growth >= 5% && score >= 70
 * - High Demand: score >= 80 && growth < 5% (ยอดสูงแต่ไม่โตเร็ว)
 * - Declining: growth < 0 && score >= 50
 * - Dead Product: growth < 0 && score < 50
 */
function classifyProducts(products, filters) {
  const rising = [];
  const highDemand = [];
  const declining = [];
  const dead = [];

  for (const p of products) {
    const growth = calcGrowth(p);
    const score = varyValue(p.score, filters, { seed: p.score + 100, min: 0 });
    const item = { ...p, growth, score };

    if (growth >= 5 && score >= 70) {
      rising.push(item);
    } else if (score >= 80 && growth >= 0) {
      highDemand.push(item);
    } else if (growth < 0 && score >= 50) {
      declining.push(item);
    } else if (growth < 0 && score < 50) {
      dead.push(item);
    } else if (score >= 70) {
      highDemand.push(item);
    } else if (growth < 0) {
      declining.push(item);
    } else {
      if (score < 60) declining.push(item);
      else highDemand.push(item);
    }
  }

  rising.sort((a, b) => b.growth - a.growth);
  highDemand.sort((a, b) => b.score - a.score);
  declining.sort((a, b) => a.growth - b.growth);
  dead.sort((a, b) => a.growth - b.growth);

  return { rising, highDemand, declining, dead };
}

/* ---------- Render Quadrant ---------- */

function renderQuadrantItem(item) {
  const growthStr = item.growth >= 0 ? `+${item.growth}%` : `${item.growth}%`;
  const growthColor = item.growth >= 0 ? '#16a34a' : '#dc2626';
  return `
    <li>
      <span class="product-name">${item.name}</span>
      <span class="product-stats">
        Growth <span style="color:${growthColor};font-weight:600">${growthStr}</span>, Score ${Math.round(item.score)}
      </span>
    </li>`;
}

function renderQuadrantGrid(products, filters) {
  const q = classifyProducts(products, filters);

  return `
    <div class="product-quadrant-grid">
      <div class="quadrant rising">
        <h4>&#128293; Rising Star</h4>
        <p>สินค้ากำลังโตเร็ว</p>
        <ul>${q.rising.length > 0
          ? q.rising.slice(0, 5).map(renderQuadrantItem).join('')
          : '<li style="color:#718096;text-align:center">ไม่มีสินค้าในกลุ่มนี้</li>'
        }</ul>
      </div>
      <div class="quadrant high-demand">
        <h4>&#11088; High Demand</h4>
        <p>ขายดีและเติบโตต่อเนื่อง</p>
        <ul>${q.highDemand.length > 0
          ? q.highDemand.slice(0, 5).map(renderQuadrantItem).join('')
          : '<li style="color:#718096;text-align:center">ไม่มีสินค้าในกลุ่มนี้</li>'
        }</ul>
      </div>
      <div class="quadrant declining">
        <h4>&#9888;&#65039; Declining</h4>
        <p>ยอดขายเริ่มลดลง</p>
        <ul>${q.declining.length > 0
          ? q.declining.slice(0, 5).map(renderQuadrantItem).join('')
          : '<li style="color:#718096;text-align:center">ไม่มีสินค้าในกลุ่มนี้</li>'
        }</ul>
      </div>
      <div class="quadrant dead">
        <h4>&#128128; Dead Product</h4>
        <p>ยอดต่ำและไม่มี Trend</p>
        <ul>${q.dead.length > 0
          ? q.dead.slice(0, 5).map(renderQuadrantItem).join('')
          : '<li style="color:#718096;text-align:center">ไม่มีสินค้าในกลุ่มนี้</li>'
        }</ul>
      </div>
    </div>`;
}

/* ---------- AI Decision Box ---------- */

function renderAIDecisionBox(products, filters) {
  const q = classifyProducts(products, filters);
  const risingNames = q.rising.slice(0, 3).map(p => p.name).join(', ');
  const decliningNames = q.declining.slice(0, 2).map(p => p.name).join(', ');
  const deadNames = q.dead.slice(0, 2).map(p => p.name).join(', ');

  let advice = 'AI แนะนำ: ';
  const parts = [];
  if (risingNames) parts.push(`ควรเพิ่มสินค้าในกลุ่ม Rising Star (${risingNames})`);
  if (deadNames) parts.push(`ลด SKU ใน Dead Product (${deadNames})`);
  else if (decliningNames) parts.push(`ลด SKU ใน Declining (${decliningNames})`);
  if (q.declining.length > 0) parts.push('ทำ Promotion ให้ Declining products เพื่อกระตุ้นยอดขาย');
  if (parts.length === 0) parts.push('สินค้าทุกกลุ่มมีสถานะดี ควรรักษาระดับต่อไป');

  advice += parts.join(' / ');

  return `
    <div class="ai-decision-box">
      <div class="ai-icon">&#129302;</div>
      <div>
        <div class="ai-title">AI Decision Support</div>
        <div class="ai-detail">${advice}</div>
      </div>
    </div>`;
}

/* ---------- Chart Area HTML Template ---------- */

function chartAreaHTML(products, filters) {
  return `
    ${renderQuadrantGrid(products, filters)}
    <div class="chart-grid">
      <div class="chart-card full-width">
        <h3 class="chart-card-title">Top 10 สินค้ายอดนิยม</h3>
        <p class="chart-card-subtitle">เรียงตาม Trend Score สูงสุด</p>
        <div class="chart-container chart-tall">
          <canvas id="chart-prod-trending"></canvas>
        </div>
      </div>
    </div>
    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">สินค้าที่กำลังเติบโตสูงสุด</h3>
      <p class="chart-card-subtitle">Growth สัปดาห์ล่าสุดเทียบกับก่อนหน้า</p>
      <div id="prod-trending-badges"></div>
    </div>
    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">ตารางสินค้ายอดนิยม</h3>
      <p class="chart-card-subtitle">Top 10 เรียงตามคะแนน</p>
      <div class="data-table-wrapper" id="prod-trending-table"></div>
    </div>
    ${renderAIDecisionBox(products, filters)}
  `;
}

/* ---------- Render Functions ---------- */

function renderTrendingChart(products, filters) {
  const top10 = [...products]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .reverse();

  const labels = top10.map(p => p.name);
  const scores = top10.map((p, i) => varyValue(p.score, filters, { seed: 200 + i, min: 0 }));
  const bgColors = top10.map(p => {
    if (p.trend === 'up') return 'rgba(46, 204, 113, 0.7)';
    if (p.trend === 'down') return 'rgba(231, 76, 60, 0.7)';
    return 'rgba(241, 196, 15, 0.7)';
  });
  const borderColors = top10.map(p => {
    if (p.trend === 'up') return '#2ecc71';
    if (p.trend === 'down') return '#e74c3c';
    return '#f1c40f';
  });

  createChart('chart-prod-trending', {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Trend Score',
        data: scores,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const product = top10[ctx.dataIndex];
              return `Score: ${ctx.parsed.x.toFixed(1)} | ${product.brand}`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: { color: '#4a5568' },
          grid: { color: 'rgba(0,0,0,0.06)' },
          title: { display: true, text: 'Trend Score', color: '#718096' }
        },
        y: {
          ticks: { color: '#4a5568', font: { size: 12 } },
          grid: { display: false }
        }
      }
    }
  });
}

function renderTrendingBadges(products, filters) {
  const el = document.getElementById('prod-trending-badges');
  if (!el) return;

  const withGrowth = products.map(p => ({ ...p, growth: calcGrowth(p) }));
  const topGrowth = withGrowth
    .filter(p => p.growth > 0)
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 6);

  if (topGrowth.length === 0) {
    el.innerHTML = '<p style="color:#718096;text-align:center">ไม่พบสินค้าที่มีการเติบโต</p>';
    return;
  }

  const cards = topGrowth.map((p, i) => {
    const variedScore = varyValue(p.score, filters, { seed: 300 + i, min: 0 });
    return `
    <div style="background:rgba(46,204,113,0.08);border:1px solid rgba(46,204,113,0.2);border-radius:8px;padding:12px 16px;text-align:center">
      <div style="font-size:1.5rem;font-weight:700;color:#2ecc71">+${p.growth}%</div>
      <div style="font-weight:600;margin:4px 0;color:#2d3748">${p.name}</div>
      <div style="font-size:0.85rem;color:#718096">${p.brand} | Score: ${Math.round(variedScore)}</div>
    </div>
  `;}).join('');

  el.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;padding:12px 0">${cards}</div>`;
}

function renderTable(products, categories, filters) {
  const tableEl = document.getElementById('prod-trending-table');
  if (!tableEl) return;

  const top10 = [...products]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const rows = top10.map((p, i) => {
    const growth = calcGrowth(p);
    const totalVolume = p.weeklyData.reduce((s, w) => s + w.searchVolume, 0);
    const variedScore = varyValue(p.score, filters, { seed: 400 + i, min: 0 });
    const variedVolume = varyValue(totalVolume, filters, { seed: 500 + i, asInt: true, min: 0 });
    return `
      <tr>
        <td class="num">${i + 1}</td>
        <td>${p.name}</td>
        <td>${getCatName(categories, p.category)}</td>
        <td class="num">${Math.round(variedScore)}</td>
        <td class="num">${growth > 0 ? '+' : ''}${growth}%</td>
        <td class="num">${fmt(variedVolume)}</td>
        <td>${trendBadge(p.trend)}</td>
      </tr>
    `;
  }).join('');

  tableEl.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th class="num">#</th>
          <th>สินค้า</th>
          <th>หมวดหมู่</th>
          <th class="num">Trend Score</th>
          <th class="num">เปลี่ยนแปลง</th>
          <th class="num">Volume รวม</th>
          <th>แนวโน้ม</th>
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

function renderContent(container, topProducts, categories, filters) {
  destroyAll();

  // กรองตาม category ถ้าเลือก
  const products = filterByCategory(topProducts, filters);

  const contentEl = container.querySelector('.prod-trending-content');
  if (!contentEl) return;

  if (!products || products.length === 0) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-text">ไม่พบข้อมูลสินค้าในเงื่อนไขที่เลือก</p>
      </div>
    `;
    return;
  }

  contentEl.innerHTML = chartAreaHTML(products, filters);

  renderTrendingChart(products, filters);
  renderTrendingBadges(products, filters);
  renderTable(products, categories, filters);
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

  try {
    const data = await fetchJSON('/data/trends.json');
    if (thisMount !== mountId) return;

    const { topProducts, categories } = data;

    if (!topProducts || topProducts.length === 0) {
      container.innerHTML = `
        <div class="tab-content">
          <div class="empty-state">
            <p class="empty-state-text">ไม่พบข้อมูลสินค้า</p>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="tab-content">
        ${buildFilterBar([PERIOD_FILTER, CATEGORY_FILTER])}
        <div class="prod-trending-content"></div>
      </div>
    `;

    function render(filters) { renderContent(container, topProducts, categories, filters); }

    render(getFilterValues(container));

    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('ProdTrending mount error:', err);
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
