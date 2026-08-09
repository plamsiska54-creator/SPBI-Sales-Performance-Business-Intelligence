/**
 * competitors.js - Tab: Competitor Analysis
 * แสดง chart 4 ตัว (ราคา, radar, ยอดขาย, market share) + ตารางสรุป
 * รองรับ loading / empty / error states + race condition guard
 */
import { createChart, destroyAll, BRAND_COLORS } from '../shared/chart-factory.js';
import { fetchJSON } from '../shared/data-loader.js';
import { renderFilters, getFilters, onFilterChange, removeFilterListener } from '../shared/filters.js';

let filterHandler = null;
let mountId = 0; // ป้องกัน race condition เมื่อสลับ tab เร็ว

/* ---------- Helpers ---------- */

/** สร้าง label สัปดาห์ W01..W26 */
function weekLabels(count) {
  return Array.from({ length: count }, (_, i) => `W${String(i + 1).padStart(2, '0')}`);
}

/** แปลง dateRange filter -> ช่วง index ของ weeklySales */
function weekSlice(dateRange, total) {
  const map = { '4w': 4, '8w': 8, '12w': 12 };
  const n = map[dateRange] || total;
  return { start: Math.max(0, total - n), end: total };
}

/** จัด format ตัวเลข */
function fmt(n) { return Number(n).toLocaleString('th-TH'); }

/* ---------- Chart Area HTML Template ---------- */

function chartAreaHTML() {
  return `
    <div class="chart-grid">
      <div class="chart-card">
        <h3 class="chart-card-title">เปรียบเทียบราคาเฉลี่ย</h3>
        <div class="chart-container"><canvas id="chart-comp-price"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">คะแนนรีวิวเปรียบเทียบ</h3>
        <div class="chart-container chart-tall"><canvas id="chart-comp-radar"></canvas></div>
      </div>
      <div class="chart-card full-width">
        <h3 class="chart-card-title">ยอดขายรายสัปดาห์</h3>
        <div class="chart-container"><canvas id="chart-comp-sales"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">ส่วนแบ่งตลาด</h3>
        <div class="chart-container chart-tall"><canvas id="chart-comp-mshare"></canvas></div>
      </div>
    </div>
    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">ตารางเปรียบเทียบคู่แข่ง</h3>
      <div id="comp-table"></div>
    </div>
  `;
}

/* ---------- Top-level Overview Cards ---------- */

/** อัพเดต overview cards 3 ใบด้านบน (ใน HTML หลัก) */
function updateTopLevelCards(brands) {
  // Card 0: จำนวนคู่แข่ง
  const card0 = document.getElementById('top-card-0');
  if (card0) {
    setCardContent(card0, 'จำนวนคู่แข่ง', String(brands.length), 'แบรนด์ที่ติดตาม');
  }

  // Card 1: Market Leader
  const card1 = document.getElementById('top-card-1');
  if (card1 && brands.length > 0) {
    const leader = brands.reduce((a, b) => (a.marketShare > b.marketShare ? a : b));
    setCardContent(card1, 'Market Leader', leader.name, `Market Share ${leader.marketShare}%`);
  }

  // Card 2: ราคาเฉลี่ยตลาด
  const card2 = document.getElementById('top-card-2');
  if (card2 && brands.length > 0) {
    const avg = Math.round(brands.reduce((s, b) => s + b.avgPrice, 0) / brands.length);
    setCardContent(card2, 'ราคาเฉลี่ยตลาด', `${avg} บาท`, 'เฉลี่ยทุกแบรนด์');
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

/* ---------- Render Functions ---------- */

function renderPriceBar(brands) {
  createChart('chart-comp-price', {
    type: 'bar',
    data: {
      labels: brands.map(b => b.name),
      datasets: [{
        label: 'ราคาเฉลี่ย (บาท)',
        data: brands.map(b => b.avgPrice),
        backgroundColor: brands.map(b => BRAND_COLORS[b.id]),
        borderColor: brands.map(b => BRAND_COLORS[b.id]),
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${ctx.parsed.y} บาท` } }
      },
      scales: {
        x: { ticks: { color: '#ccc' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: {
          beginAtZero: true,
          ticks: { color: '#ccc', callback: v => `${v} ฿` },
          grid: { color: 'rgba(255,255,255,0.05)' }
        }
      }
    }
  });
}

function renderRadar(brands) {
  const dims = ['taste', 'value', 'packaging', 'freshness', 'delivery', 'overall'];
  const labels = ['รสชาติ', 'คุ้มค่า', 'บรรจุภัณฑ์', 'ความสด', 'จัดส่ง', 'ภาพรวม'];

  const datasets = brands.map(b => ({
    label: b.name,
    data: dims.map(d => b.ratings[d]),
    borderColor: BRAND_COLORS[b.id],
    backgroundColor: BRAND_COLORS[b.id] + '33',
    pointBackgroundColor: BRAND_COLORS[b.id],
    pointRadius: 3,
    borderWidth: 2
  }));

  createChart('chart-comp-radar', {
    type: 'radar',
    data: { labels, datasets },
    options: {
      scales: {
        r: {
          min: 0,
          max: 5,
          ticks: { stepSize: 1, color: '#999', backdropColor: 'transparent' },
          grid: { color: 'rgba(255,255,255,0.1)' },
          pointLabels: { color: '#ccc', font: { size: 12 } },
          angleLines: { color: 'rgba(255,255,255,0.1)' }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#ccc', usePointStyle: true, padding: 12 }
        }
      }
    }
  });
}

function renderSalesLine(brands, labels, start, end) {
  const datasets = brands.map(b => ({
    label: b.name,
    data: b.weeklySales.slice(start, end),
    borderColor: BRAND_COLORS[b.id],
    backgroundColor: BRAND_COLORS[b.id] + '1A',
    tension: 0.3,
    pointRadius: 2,
    pointHoverRadius: 5,
    borderWidth: 2
  }));

  createChart('chart-comp-sales', {
    type: 'line',
    data: { labels, datasets },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#ccc', usePointStyle: true, padding: 12 }
        },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${fmt(ctx.parsed.y)} บาท`
          }
        }
      },
      scales: {
        x: { ticks: { color: '#ccc' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: {
          ticks: {
            color: '#ccc',
            callback: v => (v / 1e6).toFixed(1) + 'M'
          },
          grid: { color: 'rgba(255,255,255,0.05)' }
        }
      }
    }
  });
}

function renderDoughnut(brands) {
  const totalShare = brands.reduce((s, b) => s + b.marketShare, 0);
  const othersShare = Math.max(0, +(100 - totalShare).toFixed(1));

  const lbls   = [...brands.map(b => b.name), 'อื่น ๆ'];
  const vals   = [...brands.map(b => b.marketShare), othersShare];
  const colors = [...brands.map(b => BRAND_COLORS[b.id]), '#555555'];

  createChart('chart-comp-mshare', {
    type: 'doughnut',
    data: {
      labels: lbls,
      datasets: [{
        data: vals,
        backgroundColor: colors,
        borderColor: 'rgba(15, 12, 41, 0.8)',
        borderWidth: 2
      }]
    },
    options: {
      cutout: '55%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#ccc', padding: 10, usePointStyle: true }
        },
        tooltip: {
          callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed}%` }
        }
      }
    }
  });
}

function renderTable(brands) {
  const el = document.getElementById('comp-table');
  if (!el) return;

  const rows = brands.map(b => `
    <tr>
      <td>${b.logo} ${b.name}</td>
      <td class="num">${b.products}</td>
      <td class="num">${b.avgPrice} ฿</td>
      <td class="num">${b.ratings.overall}</td>
      <td class="num">${fmt(b.reviewCount)}</td>
      <td class="num">${b.marketShare}%</td>
      <td>${b.marketing.strategy}</td>
    </tr>`).join('');

  el.innerHTML = `
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>แบรนด์</th>
            <th class="num">สินค้า</th>
            <th class="num">ราคาเฉลี่ย</th>
            <th class="num">Rating</th>
            <th class="num">รีวิว</th>
            <th class="num">Market Share</th>
            <th>กลยุทธ์</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

/* ---------- Main render pipeline ---------- */

async function renderAll() {
  const chartArea = document.getElementById('comp-chart-area');
  if (!chartArea) return;

  try {
    const data = await fetchJSON('/data/competitors.json');
    const { brands } = data;
    const filters = getFilters();

    // ตรวจ empty state
    if (!brands || brands.length === 0) {
      destroyAll();
      chartArea.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-text">ไม่พบข้อมูลในเงื่อนไขที่เลือก</p>
        </div>
      `;
      return;
    }

    // ทำลาย chart เดิมก่อนสร้าง canvas ใหม่
    destroyAll();
    chartArea.innerHTML = chartAreaHTML();

    const total = brands[0].weeklySales.length;
    const allLabels = weekLabels(total);
    const { start, end } = weekSlice(filters.dateRange, total);
    const slicedLabels = allLabels.slice(start, end);

    updateTopLevelCards(brands);
    renderPriceBar(brands);
    renderRadar(brands);
    renderSalesLine(brands, slicedLabels, start, end);
    renderDoughnut(brands);
    renderTable(brands);

  } catch (err) {
    console.error('Competitors renderAll error:', err);
    chartArea.innerHTML = `
      <div class="error-state">
        <p class="error-state-text">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
      </div>
    `;
  }
}

/* ---------- Tab lifecycle ---------- */

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
    // โหลดข้อมูลล่วงหน้า
    await fetchJSON('/data/competitors.json');

    // ตรวจ race condition
    if (thisMount !== mountId) return;

    // สร้าง HTML จริงของ tab
    container.innerHTML = `
      <div class="tab-content">
        <div id="comp-filters"></div>
        <div id="comp-chart-area"></div>
      </div>
    `;

    renderFilters(document.getElementById('comp-filters'));
    await renderAll();

    if (thisMount !== mountId) return;

    filterHandler = () => renderAll();
    onFilterChange(filterHandler);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('Competitors mount error:', err);
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
  mountId++; // ยกเลิก render ที่อาจค้างอยู่
  destroyAll();
  if (filterHandler) {
    removeFilterListener(filterHandler);
    filterHandler = null;
  }
}
