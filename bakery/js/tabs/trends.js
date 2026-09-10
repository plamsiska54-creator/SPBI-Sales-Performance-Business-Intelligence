/**
 * trends.js - Tab: Product Trends
 * แสดง trend สินค้ายอดนิยม, หมวดหมู่, คีย์เวิร์ด พร้อมตาราง
 * รองรับ loading / empty / error states + race condition guard
 */

import { createChart, destroyAll, CHART_COLORS } from '../shared/chart-factory.js';
import { fetchJSON, filterByWeekRange, getRecentWeekRange } from '../shared/data-loader.js';
import { renderFilters, getFilters, onFilterChange, removeFilterListener } from '../shared/filters.js';

let filterHandler = null;
let mountId = 0; // ป้องกัน race condition เมื่อสลับ tab เร็ว

/**
 * Mount tab: แสดง loading -> โหลดข้อมูล -> render content
 * @param {HTMLElement} container - #app element
 */
export async function mount(container) {
  const thisMount = ++mountId;

  // แสดง loading state ก่อน fetch
  container.innerHTML = `
    <div class="tab-content">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  `;

  try {
    // โหลดข้อมูลล่วงหน้า (เข้า cache สำหรับ renderAll ครั้งถัดไป)
    await fetchJSON('/data/trends.json');

    // ตรวจ race condition: ถ้า tab ถูกเปลี่ยนระหว่าง fetch ไม่ต้อง render
    if (thisMount !== mountId) return;

    // สร้าง HTML จริงของ tab
    container.innerHTML = `
      <div class="tab-content">
        <div id="trends-filters"></div>
        <div id="trends-chart-area"></div>
      </div>
    `;

    renderFilters(document.getElementById('trends-filters'));
    await renderAll();

    // ตรวจ guard อีกรอบหลัง renderAll
    if (thisMount !== mountId) return;

    filterHandler = () => renderAll();
    onFilterChange(filterHandler);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('Trends mount error:', err);
    container.innerHTML = `
      <div class="tab-content">
        <div class="error-state">
          <p class="error-state-text">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        </div>
      </div>
    `;
  }
}

/**
 * Unmount tab: ทำลาย chart ทั้งหมด + ถอด filter listener + ยกเลิก render ค้าง
 */
export function unmount() {
  mountId++; // ยกเลิก render ที่อาจค้างอยู่
  destroyAll();
  if (filterHandler) {
    removeFilterListener(filterHandler);
    filterHandler = null;
  }
}

// ── Chart Area HTML Template ─────────────────────────────────

function chartAreaHTML() {
  return `
    <div class="chart-grid">
      <div class="chart-card">
        <h3 class="chart-card-title">Top 5 สินค้ายอดนิยม</h3>
        <p class="chart-card-subtitle">Search Volume รายสัปดาห์</p>
        <div class="chart-container">
          <canvas id="chart-top-products"></canvas>
        </div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">เทรนด์ตามหมวดหมู่</h3>
        <p class="chart-card-subtitle">ปริมาณการค้นหารวมแต่ละหมวด</p>
        <div class="chart-container">
          <canvas id="chart-categories"></canvas>
        </div>
      </div>
      <div class="chart-card full-width">
        <h3 class="chart-card-title">คีย์เวิร์ดยอดนิยม</h3>
        <p class="chart-card-subtitle">Top 20 คีย์เวิร์ด เรียงตามปริมาณการค้นหา</p>
        <div class="chart-container chart-tall">
          <canvas id="chart-keywords"></canvas>
        </div>
      </div>
    </div>
    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">ตารางสินค้ายอดนิยม</h3>
      <p class="chart-card-subtitle">Top 10 เรียงตามคะแนน</p>
      <div class="data-table-wrapper" id="trends-table"></div>
    </div>
  `;
}

// ── Render Pipeline ──────────────────────────────────────────

async function renderAll() {
  const chartArea = document.getElementById('trends-chart-area');
  if (!chartArea) return;

  try {
    const data = await fetchJSON('/data/trends.json');
    const filters = getFilters();

    // กรอง product ตาม platform filter
    const filteredProducts = filterProductsByPlatform(data.topProducts, filters.platform);

    // ตรวจ empty state: ไม่มีสินค้าตรงเงื่อนไข
    if (filteredProducts.length === 0) {
      destroyAll();
      chartArea.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-text">ไม่พบข้อมูลในเงื่อนไขที่เลือก</p>
        </div>
      `;
      updateTopLevelCards([], data.categories, data.keywords);
      return;
    }

    // ทำลาย chart เดิมก่อนสร้าง canvas ใหม่
    destroyAll();
    chartArea.innerHTML = chartAreaHTML();

    // กำหนดช่วง week ตาม filter dateRange
    const weekRange = resolveWeekRange(data.topProducts[0].weeklyData, filters.dateRange);

    // อัพเดต overview cards ด้านบน
    updateTopLevelCards(filteredProducts, data.categories, data.keywords);

    // render charts
    renderTopProductsChart(filteredProducts, weekRange);
    renderCategoriesChart(data.categoryTrends, data.categories, weekRange);
    renderKeywordsChart(data.keywords);
    renderTable(filteredProducts);

  } catch (err) {
    console.error('Trends renderAll error:', err);
    chartArea.innerHTML = `
      <div class="error-state">
        <p class="error-state-text">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
      </div>
    `;
  }
}

// ── Helpers ──────────────────────────────────────────────────

/**
 * แปลง filter dateRange ('all','4w','8w','12w') เป็น {startWeek, endWeek}
 */
function resolveWeekRange(weeklyData, dateRange) {
  if (dateRange === 'all' || !dateRange) {
    return null; // ไม่กรอง
  }
  const numWeeks = parseInt(dateRange, 10); // '4w' -> 4
  return getRecentWeekRange(weeklyData, numWeeks);
}

/**
 * กรอง products ตาม platform ('all' = ไม่กรอง)
 */
function filterProductsByPlatform(products, platform) {
  if (platform === 'all' || !platform) return products;
  return products.filter(p => p.platforms.includes(platform));
}

/**
 * กรอง weeklyData ของ product ตาม weekRange
 */
function applyWeekRange(weeklyData, weekRange) {
  if (!weekRange) return weeklyData;
  return filterByWeekRange(weeklyData, weekRange.startWeek, weekRange.endWeek);
}

// ── Top-level Overview Cards ─────────────────────────────────

/** อัพเดต overview cards 3 ใบด้านบน (ใน HTML หลัก) */
function updateTopLevelCards(products, categories, keywords) {
  // Card 0: สินค้า trending (trend="up")
  const card0 = document.getElementById('top-card-0');
  if (card0) {
    const trendingCount = products.filter(p => p.trend === 'up').length;
    setCardContent(card0, 'สินค้า Trending',
      String(trendingCount),
      `จาก ${products.length} สินค้าทั้งหมด`
    );
  }

  // Card 1: Top Category (หมวดที่มี volume รวมสูงสุดจาก products)
  const card1 = document.getElementById('top-card-1');
  if (card1) {
    const catVolumes = {};
    for (const p of products) {
      const totalVol = p.weeklyData.reduce((sum, w) => sum + w.searchVolume, 0);
      catVolumes[p.category] = (catVolumes[p.category] || 0) + totalVol;
    }
    let topCatId = null;
    let topCatVol = 0;
    for (const [catId, vol] of Object.entries(catVolumes)) {
      if (vol > topCatVol) {
        topCatId = catId;
        topCatVol = vol;
      }
    }
    const topCatName = categories.find(c => c.id === topCatId)?.name || topCatId || '-';
    setCardContent(card1, 'Top Category', topCatName, `Volume ${topCatVol.toLocaleString()}`);
  }

  // Card 2: จำนวน keywords
  const card2 = document.getElementById('top-card-2');
  if (card2) {
    setCardContent(card2, 'Keywords',
      String(keywords.length),
      `${keywords.filter(k => k.trend === 'up').length} กำลังขาขึ้น`
    );
  }
}

/** ตั้งค่า label/value/note ของ overview card */
function setCardContent(card, label, value, note) {
  const labelEl = card.querySelector('.overview-card-label');
  const valueEl = card.querySelector('.overview-card-value');
  const noteEl = card.querySelector('.overview-card-note');
  if (labelEl) labelEl.textContent = label;
  if (valueEl) valueEl.textContent = value;
  if (noteEl) noteEl.textContent = note;
}

// ── Charts ───────────────────────────────────────────────────

/**
 * Line chart: Top 5 สินค้า (ตาม score) แสดง searchVolume รายสัปดาห์
 */
function renderTopProductsChart(products, weekRange) {
  // เรียงตาม score มากสุด เอา top 5
  const top5 = [...products]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (top5.length === 0) return;

  // สร้าง week labels จาก top5 ตัวแรก (ทุกตัวมี week เหมือนกัน)
  const filteredWeeks = applyWeekRange(top5[0].weeklyData, weekRange);
  const labels = filteredWeeks.map(w => w.week.replace('2026-', ''));

  const datasets = top5.map((product, idx) => {
    const weekData = applyWeekRange(product.weeklyData, weekRange);
    return {
      label: product.name,
      data: weekData.map(w => w.searchVolume),
      borderColor: CHART_COLORS[idx],
      backgroundColor: CHART_COLORS[idx] + '33',
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 2,
      pointHoverRadius: 5,
      fill: false,
    };
  });

  createChart('chart-top-products', {
    type: 'line',
    data: { labels, datasets },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#718096', maxRotation: 45 },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: {
          ticks: {
            color: '#718096',
            callback: (v) => v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v
          },
          grid: { color: 'rgba(0,0,0,0.06)' },
          title: { display: true, text: 'Search Volume', color: '#718096' }
        }
      }
    }
  });
}

/**
 * Bar chart: หมวดหมู่สินค้า - ยอดรวม volume
 */
function renderCategoriesChart(categoryTrends, categories, weekRange) {
  const catLabels = [];
  const catValues = [];
  const catColors = [];
  const palette = [...CHART_COLORS];

  for (let i = 0; i < categoryTrends.length; i++) {
    const ct = categoryTrends[i];
    const catName = categories.find(c => c.id === ct.categoryId)?.name || ct.categoryId;
    const weekData = applyWeekRange(ct.data, weekRange);
    const totalVol = weekData.reduce((sum, w) => sum + w.volume, 0);

    catLabels.push(catName);
    catValues.push(totalVol);
    catColors.push(palette[i % palette.length]);
  }

  createChart('chart-categories', {
    type: 'bar',
    data: {
      labels: catLabels,
      datasets: [{
        label: 'Search Volume รวม',
        data: catValues,
        backgroundColor: catColors.map(c => c + 'CC'),
        borderColor: catColors,
        borderWidth: 1,
        borderRadius: 4,
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `Volume: ${ctx.parsed.x.toLocaleString()}`
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#718096',
            callback: (v) => v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v
          },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: {
          ticks: { color: '#4a5568' },
          grid: { display: false }
        }
      }
    }
  });
}

/**
 * Horizontal bar chart: Top 20 keywords เรียงจากมากไปน้อย
 */
function renderKeywordsChart(keywords) {
  const sorted = [...keywords]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 20);

  const trendIcon = (t) => t === 'up' ? ' [+]' : t === 'down' ? ' [-]' : ' [=]';

  const labels = sorted.map(k => k.keyword + trendIcon(k.trend));
  const values = sorted.map(k => k.volume);

  const bgColors = sorted.map(k => {
    if (k.trend === 'up') return 'rgba(46, 204, 113, 0.7)';
    if (k.trend === 'down') return 'rgba(231, 76, 60, 0.7)';
    return 'rgba(241, 196, 15, 0.7)';
  });

  const borderColors = sorted.map(k => {
    if (k.trend === 'up') return '#2ecc71';
    if (k.trend === 'down') return '#e74c3c';
    return '#f1c40f';
  });

  createChart('chart-keywords', {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Search Volume',
        data: values,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 3,
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const kw = sorted[ctx.dataIndex];
              const changeStr = kw.change >= 0 ? `+${kw.change}%` : `${kw.change}%`;
              return `Volume: ${ctx.parsed.x.toLocaleString()} (${changeStr})`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#718096',
            callback: (v) => v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v
          },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: {
          ticks: { color: '#4a5568', font: { size: 11 } },
          grid: { display: false }
        }
      }
    }
  });
}

// ── Table ────────────────────────────────────────────────────

/**
 * ตาราง Top 10 สินค้า เรียงตามคะแนน
 */
function renderTable(products) {
  const tableEl = document.getElementById('trends-table');
  if (!tableEl) return;

  const top10 = [...products]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const trendLabel = (t) => {
    if (t === 'up') return '<span class="positive">&#9650; ขาขึ้น</span>';
    if (t === 'down') return '<span class="negative">&#9660; ขาลง</span>';
    return '<span>&#9654; ทรงตัว</span>';
  };

  const rows = top10.map((p, i) => `
    <tr>
      <td class="num">${i + 1}</td>
      <td>${p.name}</td>
      <td>${p.brand}</td>
      <td>${p.category}</td>
      <td class="num">${p.score}</td>
      <td>${trendLabel(p.trend)}</td>
    </tr>
  `).join('');

  tableEl.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th class="num">#</th>
          <th>สินค้า</th>
          <th>แบรนด์</th>
          <th>หมวดหมู่</th>
          <th class="num">คะแนน</th>
          <th>แนวโน้ม</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}
