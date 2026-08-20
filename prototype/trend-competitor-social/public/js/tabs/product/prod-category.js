/**
 * prod-category.js - Tab: วิเคราะห์หมวดหมู่สินค้า (Product Category)
 * ENHANCE: เพิ่ม growth comparison chart + ตารางที่มีข้อมูลละเอียดมากขึ้น
 * แสดง donut หมวดหมู่, bar เปรียบเทียบ, growth bar, ตารางรายละเอียด
 * ใช้ข้อมูลจาก /data/trends.json
 * รองรับ loading / empty / error states + race condition guard
 * Filter-reactive: เปลี่ยน filter แล้ว render ใหม่ทันที
 */

import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import { buildFilterBar, onFilterChange, getFilterValues, PERIOD_FILTER, CATEGORY_FILTER } from '../../shared/filter-builder.js';
import { varyValue, varyPercent, filterByCategory } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

/* ---------- Helpers ---------- */

function fmt(n) { return Number(n).toLocaleString('th-TH'); }

function getCatName(categories, catId) {
  const cat = categories.find(c => c.id === catId);
  return cat ? cat.name : catId;
}

/** คำนวณ growth จาก weekly data */
function calcProductGrowth(product) {
  const weeks = product.weeklyData;
  if (!weeks || weeks.length < 8) return 0;
  const recent = weeks.slice(-4).reduce((s, w) => s + w.searchVolume, 0);
  const prev = weeks.slice(-8, -4).reduce((s, w) => s + w.searchVolume, 0);
  return prev > 0 ? +((recent - prev) / prev * 100).toFixed(1) : 0;
}

/* ---------- Chart Area HTML Template ---------- */

function chartAreaHTML() {
  return `
    <div class="chart-grid">
      <div class="chart-card">
        <h3 class="chart-card-title">สัดส่วนสินค้าตามหมวดหมู่</h3>
        <p class="chart-card-subtitle">จำนวนสินค้าในแต่ละหมวด</p>
        <div class="chart-container chart-tall">
          <canvas id="chart-cat-donut"></canvas>
        </div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">เปรียบเทียบ Trend Score เฉลี่ย</h3>
        <p class="chart-card-subtitle">คะแนนเฉลี่ยของแต่ละหมวด</p>
        <div class="chart-container chart-tall">
          <canvas id="chart-cat-score"></canvas>
        </div>
      </div>
    </div>
    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">การเติบโตเฉลี่ยตามหมวดหมู่</h3>
      <p class="chart-card-subtitle">% เปลี่ยนแปลง (4 สัปดาห์ล่าสุด vs ก่อนหน้า)</p>
      <div class="chart-container">
        <canvas id="chart-cat-growth"></canvas>
      </div>
    </div>
    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">ตารางรายละเอียดหมวดหมู่</h3>
      <div class="data-table-wrapper" id="cat-detail-table"></div>
    </div>
  `;
}

/* ---------- Data Processing ---------- */

function buildCategorySummary(products, categories, filters) {
  const catMap = {};

  for (const p of products) {
    if (!catMap[p.category]) {
      catMap[p.category] = {
        id: p.category,
        name: getCatName(categories, p.category),
        products: [],
        totalScore: 0,
        totalGrowth: 0,
        totalVolume: 0,
        count: 0
      };
    }
    const growth = calcProductGrowth(p);
    const totalVol = p.weeklyData.reduce((s, w) => s + w.searchVolume, 0);
    catMap[p.category].products.push(p);
    catMap[p.category].totalScore += p.score;
    catMap[p.category].totalGrowth += growth;
    catMap[p.category].totalVolume += totalVol;
    catMap[p.category].count++;
  }

  return Object.values(catMap).map((cat, idx) => ({
    ...cat,
    avgScore: varyValue(+(cat.totalScore / cat.count).toFixed(1), filters, { seed: 100 + idx, min: 0 }),
    avgGrowth: varyPercent(+(cat.totalGrowth / cat.count).toFixed(1), filters, { seed: 200 + idx }),
    totalVolume: varyValue(cat.totalVolume, filters, { seed: 300 + idx, asInt: true, min: 0 }),
    topProduct: cat.products.reduce((a, b) => (a.score > b.score ? a : b))
  }));
}

/* ---------- Render Functions ---------- */

function renderCategoryDonut(catSummary) {
  const labels = catSummary.map(c => c.name);
  const counts = catSummary.map(c => c.count);
  const colors = catSummary.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

  createChart('chart-cat-donut', {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: colors,
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
          callbacks: {
            label: ctx => `${ctx.label}: ${ctx.parsed} สินค้า`
          }
        }
      }
    }
  });
}

function renderCategoryScoreBar(catSummary) {
  const sorted = [...catSummary].sort((a, b) => b.avgScore - a.avgScore);
  const labels = sorted.map(c => c.name);
  const scores = sorted.map(c => c.avgScore);
  const colors = sorted.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

  createChart('chart-cat-score', {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Avg Trend Score',
        data: scores,
        backgroundColor: colors.map(c => c + 'CC'),
        borderColor: colors,
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `คะแนนเฉลี่ย: ${ctx.parsed.y.toFixed(1)}`
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
          max: 100,
          ticks: { color: '#4a5568' },
          grid: { color: 'rgba(0,0,0,0.06)' },
          title: { display: true, text: 'Trend Score', color: '#718096' }
        }
      }
    }
  });
}

/** Bar chart: การเติบโตเฉลี่ยตามหมวดหมู่ */
function renderCategoryGrowthBar(catSummary) {
  const sorted = [...catSummary].sort((a, b) => b.avgGrowth - a.avgGrowth);

  createChart('chart-cat-growth', {
    type: 'bar',
    data: {
      labels: sorted.map(c => c.name),
      datasets: [{
        label: 'Avg Growth (%)',
        data: sorted.map(c => c.avgGrowth),
        backgroundColor: sorted.map(c =>
          c.avgGrowth >= 5 ? '#16a34a' : c.avgGrowth >= 0 ? '#3498db' : '#dc2626'
        ),
        borderRadius: 6
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.parsed.y > 0 ? '+' : ''}${ctx.parsed.y}%`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#4a5568' },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: {
          ticks: { color: '#4a5568', callback: v => `${v}%` },
          grid: { color: 'rgba(0,0,0,0.06)' }
        }
      }
    }
  });
}

function renderCategoryTable(catSummary) {
  const tableEl = document.getElementById('cat-detail-table');
  if (!tableEl) return;

  const sorted = [...catSummary].sort((a, b) => b.avgScore - a.avgScore);

  const rows = sorted.map(c => {
    const growthColor = c.avgGrowth >= 0 ? '#16a34a' : '#dc2626';
    const growthStr = c.avgGrowth >= 0 ? `+${c.avgGrowth}%` : `${c.avgGrowth}%`;
    return `
    <tr>
      <td>${c.name}</td>
      <td class="num">${c.count}</td>
      <td class="num">${c.avgScore.toFixed(1)}</td>
      <td class="num" style="color:${growthColor};font-weight:600">${growthStr}</td>
      <td class="num">${fmt(c.totalVolume)}</td>
      <td>${c.topProduct.name} (${c.topProduct.score})</td>
    </tr>
  `;}).join('');

  tableEl.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>หมวดหมู่</th>
          <th class="num">จำนวนสินค้า</th>
          <th class="num">Avg Score</th>
          <th class="num">Avg Growth</th>
          <th class="num">Volume รวม</th>
          <th>สินค้าอันดับ 1</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

/* ---------- renderContent: เรนเดอร์เนื้อหาตาม filter ---------- */

function renderContent(container, topProducts, categories, filters) {
  destroyAll();

  // กรองตาม category ถ้าเลือก
  const products = filterByCategory(topProducts, filters);

  const contentEl = container.querySelector('.prod-category-content');
  if (!contentEl) return;

  if (!products || products.length === 0) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-text">ไม่พบข้อมูลสินค้าในเงื่อนไขที่เลือก</p>
      </div>
    `;
    return;
  }

  contentEl.innerHTML = chartAreaHTML();

  const catSummary = buildCategorySummary(products, categories, filters);

  renderCategoryDonut(catSummary);
  renderCategoryScoreBar(catSummary);
  renderCategoryGrowthBar(catSummary);
  renderCategoryTable(catSummary);
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
        <div class="prod-category-content"></div>
      </div>
    `;

    function render(filters) { renderContent(container, topProducts, categories, filters); }

    render(getFilterValues(container));

    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('ProdCategory mount error:', err);
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
