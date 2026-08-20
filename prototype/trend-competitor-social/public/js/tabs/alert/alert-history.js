/**
 * alert-history.js - Sub-tab: ประวัติแจ้งเตือน
 * แสดง chart ปริมาณแจ้งเตือนรายสัปดาห์ + donut ประเภท + ตารางประวัติ
 * ข้อมูล demo ในตัว (hardcoded)
 * รองรับ reactive filters
 */
import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { buildFilterBar, PERIOD_FILTER, PRIORITY_FILTER } from '../../shared/filter-builder.js';
import { onFilterChange, getFilterValues } from '../../shared/filter-builder.js';
import { varyValue, varyArray, filterByPriority } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

/* ---------- ข้อมูล Demo ---------- */

const WEEKLY_LABELS = ['สัปดาห์ที่ 1', 'สัปดาห์ที่ 2', 'สัปดาห์ที่ 3', 'สัปดาห์ที่ 4'];
const BASE_WEEKLY_COUNTS = [12, 8, 15, 10];

const TYPE_BREAKDOWN = [
  { type: 'ราคาคู่แข่งเปลี่ยน',   count: 18, color: '#dc2626' },
  { type: 'สินค้าใหม่ในตลาด',     count: 12, color: '#f59e0b' },
  { type: 'sentiment ติดลบ',     count: 8,  color: '#7b2ff7' },
  { type: 'market share เปลี่ยน', count: 7,  color: '#2979ff' }
];

const HISTORY = [
  { date: '2026-08-08', type: 'ราคาคู่แข่งเปลี่ยน',   priority: 'urgent', message: 'After You ลดราคาเค้ก 20%',               status: 'จัดการแล้ว' },
  { date: '2026-08-07', type: 'สินค้าใหม่ในตลาด',     priority: 'high',   message: 'S&P เปิดตัวขนมปังใหม่ 3 SKU',            status: 'จัดการแล้ว' },
  { date: '2026-08-06', type: 'sentiment ติดลบ',     priority: 'high',   message: 'รีวิวติดลบเพิ่มขึ้น 15%',                   status: 'รอดำเนินการ' },
  { date: '2026-08-05', type: 'market share เปลี่ยน', priority: 'urgent', message: 'ส่วนแบ่งตลาดโดนัทลดลง 2.3%',            status: 'รอดำเนินการ' },
  { date: '2026-08-03', type: 'ราคาคู่แข่งเปลี่ยน',   priority: 'high',   message: 'Yamazaki ปรับขึ้นราคาขนมปัง 7%',          status: 'จัดการแล้ว' },
  { date: '2026-08-01', type: 'สินค้าใหม่ในตลาด',     priority: 'high',   message: 'Farmhouse เปิดตัวครัวซองต์พรีเมียม',       status: 'จัดการแล้ว' },
  { date: '2026-07-30', type: 'sentiment ติดลบ',     priority: 'normal', message: 'พบรีวิวเรื่องบรรจุภัณฑ์ 8 รายการ',         status: 'จัดการแล้ว' },
  { date: '2026-07-28', type: 'ราคาคู่แข่งเปลี่ยน',   priority: 'normal', message: 'Farmhouse ปรับราคาขนมปังโฮลวีท +10%',    status: 'จัดการแล้ว' },
  { date: '2026-07-25', type: 'market share เปลี่ยน', priority: 'high',   message: 'Le Pain market share เพิ่ม 1.5% ในกรุงเทพ', status: 'รอดำเนินการ' },
  { date: '2026-07-22', type: 'สินค้าใหม่ในตลาด',     priority: 'normal', message: 'ร้าน local ใหม่เปิดในเขตสาทร',             status: 'จัดการแล้ว' }
];

/* ---------- Helpers ---------- */

function fmtDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}

/* ---------- Render Content ---------- */

function renderContent(container, filters) {
  destroyAll();

  const contentEl = container.querySelector('.alerthistory-content');
  if (!contentEl) return;

  // กรองตาม priority
  const filteredHistory = filterByPriority(HISTORY, filters);

  // vary chart data
  const weeklyData = varyArray(BASE_WEEKLY_COUNTS, filters, { startSeed: 800 }).map(v => Math.round(v));
  const typeData = TYPE_BREAKDOWN.map((t, i) => ({
    ...t,
    count: Math.round(varyValue(t.count, filters, { seed: 820 + i, min: 1 }))
  }));

  // สร้างตาราง
  const tableRows = filteredHistory.map(h => {
    const statusColor = h.status === 'จัดการแล้ว' ? '#16a34a' : '#f59e0b';
    return `
      <tr>
        <td class="num">${fmtDate(h.date)}</td>
        <td>${h.type}</td>
        <td>${h.message}</td>
        <td><span style="color:${statusColor};font-weight:600">${h.status}</span></td>
      </tr>`;
  }).join('');

  const emptyRow = filteredHistory.length === 0
    ? '<tr><td colspan="4" style="text-align:center;color:#718096;padding:30px">ไม่พบประวัติแจ้งเตือนที่ตรงกับเงื่อนไข</td></tr>'
    : '';

  contentEl.innerHTML = `
    <div class="chart-grid">
      <div class="chart-card">
        <h3 class="chart-card-title">ปริมาณแจ้งเตือนรายสัปดาห์</h3>
        <p class="chart-card-subtitle">4 สัปดาห์ล่าสุด</p>
        <div class="chart-container"><canvas id="chart-alert-volume"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">สัดส่วนประเภทแจ้งเตือน</h3>
        <div class="chart-container chart-tall"><canvas id="chart-alert-type"></canvas></div>
      </div>
    </div>
    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">ประวัติแจ้งเตือน</h3>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th class="num">วันที่</th>
              <th>ประเภท</th>
              <th>รายละเอียด</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>${tableRows}${emptyRow}</tbody>
        </table>
      </div>
    </div>
  `;

  // Render charts
  createChart('chart-alert-volume', {
    type: 'bar',
    data: {
      labels: WEEKLY_LABELS,
      datasets: [{
        label: 'จำนวนแจ้งเตือน',
        data: weeklyData,
        backgroundColor: CHART_COLORS.slice(0, 4).map(c => c + 'CC'),
        borderColor: CHART_COLORS.slice(0, 4),
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${ctx.parsed.y} รายการ` } }
      },
      scales: {
        x: { ticks: { color: '#4a5568' }, grid: { color: 'rgba(0,0,0,0.06)' } },
        y: {
          beginAtZero: true,
          ticks: { color: '#4a5568', stepSize: 5 },
          grid: { color: 'rgba(0,0,0,0.06)' }
        }
      }
    }
  });

  createChart('chart-alert-type', {
    type: 'doughnut',
    data: {
      labels: typeData.map(t => t.type),
      datasets: [{
        data: typeData.map(t => t.count),
        backgroundColor: typeData.map(t => t.color),
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      cutout: '55%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#4a5568', padding: 10, usePointStyle: true, font: { size: 11 } }
        },
        tooltip: {
          callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed} ครั้ง` }
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
        <p class="loading-text">กำลังโหลดประวัติแจ้งเตือน...</p>
      </div>
    </div>
  `;

  try {
    await Promise.resolve();
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">${buildFilterBar([PERIOD_FILTER, PRIORITY_FILTER])}<div class="alerthistory-content"></div></div>`;

    function render(filters) { renderContent(container, filters); }
    render(getFilterValues(container));
    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('AlertHistory mount error:', err);
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
