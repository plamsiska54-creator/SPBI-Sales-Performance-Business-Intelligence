/**
 * action-plan.js - Sub-tab: Action Plan Overview
 * แสดง status cards 3 ใบ + รายการ action items + doughnut chart สรุปความคืบหน้า
 * ใช้ข้อมูล demo (static) สำหรับ prototype
 * รองรับ reactive filters
 */
import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { buildFilterBar, PERIOD_FILTER, PRIORITY_FILTER, STATUS_FILTER } from '../../shared/filter-builder.js';
import { onFilterChange, getFilterValues } from '../../shared/filter-builder.js';
import { varyValue, filterByPriority, filterByStatus } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

/* ---------- Demo Data ---------- */

const BASE_STATUS_SUMMARY = [
  { label: 'กำลังดำเนินการ', count: 4, color: '#f59e0b' },
  { label: 'เสร็จสิ้น',     count: 6, color: '#16a34a' },
  { label: 'รอเริ่ม',       count: 3, color: '#718096' }
];

const ACTION_ITEMS = [
  { title: 'เปิดตัวไลน์โดนัทพรีเมียม',       priority: 'high',   priorityLabel: 'สูง',  assignee: 'ทีมผลิตภัณฑ์',  deadline: '30 มิ.ย. 69', status: 'progress', statusLabel: 'กำลังดำเนินการ' },
  { title: 'ปรับราคาขนมปังแซนวิช',           priority: 'normal', priorityLabel: 'กลาง', assignee: 'ทีมการตลาด',   deadline: '15 ก.ค. 69',  status: 'waiting',  statusLabel: 'รอเริ่ม' },
  { title: 'แคมเปญ Social Media Q3',         priority: 'high',   priorityLabel: 'สูง',  assignee: 'ทีมดิจิทัล',    deadline: '1 ก.ค. 69',   status: 'progress', statusLabel: 'กำลังดำเนินการ' },
  { title: 'ขยายช่องทาง Modern Trade',        priority: 'high',   priorityLabel: 'สูง',  assignee: 'ทีมขาย',       deadline: '31 ก.ค. 69',  status: 'progress', statusLabel: 'กำลังดำเนินการ' },
  { title: 'พัฒนาบรรจุภัณฑ์รักษ์โลก',         priority: 'normal', priorityLabel: 'กลาง', assignee: 'ทีมผลิตภัณฑ์',  deadline: '15 ส.ค. 69',  status: 'waiting',  statusLabel: 'รอเริ่ม' },
  { title: 'อบรมพนักงานขายประจำไตรมาส',       priority: 'low',    priorityLabel: 'ต่ำ',  assignee: 'ทีม HR',       deadline: '30 มิ.ย. 69', status: 'done',     statusLabel: 'เสร็จสิ้น' },
  { title: 'วิเคราะห์คู่แข่งรายไตรมาส',        priority: 'normal', priorityLabel: 'กลาง', assignee: 'ทีมวิจัย',      deadline: '20 มิ.ย. 69', status: 'done',     statusLabel: 'เสร็จสิ้น' },
  { title: 'ปรับปรุง Line OA สำหรับสั่งซื้อ',   priority: 'high',   priorityLabel: 'สูง',  assignee: 'ทีมดิจิทัล',    deadline: '10 ก.ค. 69',  status: 'progress', statusLabel: 'กำลังดำเนินการ' }
];

/* ---------- Inline Styles ---------- */

const STYLES = `
  .action-status-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .action-status-card { background: #fff; border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
  .action-status-count { font-size: 2rem; font-weight: 700; }
  .action-status-label { font-size: 0.85rem; color: #718096; margin-top: 4px; }
  .action-items-list { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
  .action-item { display: flex; align-items: center; gap: 12px; background: #fff; border-radius: 10px; padding: 14px 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
  .action-priority { padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; color: #fff; flex-shrink: 0; }
  .priority-high { background: #dc2626; }
  .priority-medium { background: #f59e0b; }
  .priority-low { background: #16a34a; }
  .action-info { flex: 1; }
  .action-title { font-weight: 600; color: #1a202c; font-size: 0.95rem; }
  .action-meta { font-size: 0.8rem; color: #718096; margin-top: 2px; }
  .action-status { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; flex-shrink: 0; }
  .status-progress { background: rgba(245,158,11,0.1); color: #f59e0b; }
  .status-done { background: rgba(22,163,74,0.1); color: #16a34a; }
  .status-waiting { background: rgba(113,128,150,0.1); color: #718096; }
  @media (max-width: 767px) { .action-status-grid { grid-template-columns: 1fr; } .action-item { flex-wrap: wrap; } }
`;

/* ---------- Render Content ---------- */

function renderContent(container, filters) {
  destroyAll();

  const contentEl = container.querySelector('.actionplan-content');
  if (!contentEl) return;

  // กรอง priority และ status
  let filteredItems = filterByPriority(ACTION_ITEMS, filters);
  filteredItems = filterByStatus(filteredItems, filters);

  // Status summary (vary ด้วย filter)
  const statusCards = BASE_STATUS_SUMMARY.map((s, idx) => {
    const count = Math.round(varyValue(s.count, filters, { seed: 900 + idx, min: 0 }));
    return `
      <div class="action-status-card">
        <div class="action-status-count" style="color: ${s.color}">${count}</div>
        <div class="action-status-label">${s.label}</div>
      </div>`;
  }).join('');

  // Action items list
  const itemsHTML = filteredItems.length > 0
    ? filteredItems.map(item => `
      <div class="action-item">
        <span class="action-priority priority-${item.priority === 'normal' ? 'medium' : item.priority}">${item.priorityLabel}</span>
        <div class="action-info">
          <div class="action-title">${item.title}</div>
          <div class="action-meta">${item.assignee} · กำหนด ${item.deadline}</div>
        </div>
        <span class="action-status status-${item.status}">${item.statusLabel}</span>
      </div>
    `).join('')
    : '<div style="text-align:center;color:#718096;padding:30px">ไม่พบรายการที่ตรงกับเงื่อนไข</div>';

  // คำนวณ progress % จากข้อมูลที่กรอง
  const total = filteredItems.length || 1;
  const doneCount = filteredItems.filter(i => i.status === 'done').length;
  const progressCount = filteredItems.filter(i => i.status === 'progress').length;
  const waitingCount = filteredItems.filter(i => i.status === 'waiting').length;
  const donePct = Math.round(doneCount / total * 100);
  const progressPct = Math.round(progressCount / total * 100);
  const waitingPct = 100 - donePct - progressPct;

  contentEl.innerHTML = `
    <div class="action-status-grid">${statusCards}</div>
    <div class="chart-grid">
      <div class="chart-card full-width">
        <div class="chart-card" style="margin-bottom: 24px">
          <h3 class="chart-card-title">รายการแผนงาน</h3>
          <div class="action-items-list">${itemsHTML}</div>
        </div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">ความคืบหน้าโดยรวม</h3>
        <div class="chart-container chart-tall"><canvas id="chart-action-progress"></canvas></div>
      </div>
    </div>
  `;

  // Render doughnut chart
  const centerTextPlugin = {
    id: 'actionCenterText',
    afterDraw(chart) {
      const { ctx, chartArea } = chart;
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.font = "bold 28px 'Segoe UI', sans-serif";
      ctx.fillStyle = '#16a34a';
      ctx.fillText(`${donePct}%`, centerX, centerY - 10);

      ctx.font = "12px 'Segoe UI', sans-serif";
      ctx.fillStyle = '#718096';
      ctx.fillText('เสร็จสิ้น', centerX, centerY + 14);

      ctx.restore();
    }
  };

  createChart('chart-action-progress', {
    type: 'doughnut',
    data: {
      labels: [`เสร็จสิ้น ${donePct}%`, `กำลังดำเนินการ ${progressPct}%`, `รอเริ่ม ${waitingPct}%`],
      datasets: [{
        data: [donePct, progressPct, waitingPct],
        backgroundColor: ['#16a34a', '#f59e0b', '#718096'],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#4a5568', padding: 14, usePointStyle: true }
        },
        tooltip: {
          callbacks: { label: ctx => `${ctx.label}` }
        }
      }
    },
    plugins: [centerTextPlugin]
  });
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

  await new Promise(r => setTimeout(r, 200));
  if (thisMount !== mountId) return;

  container.innerHTML = `
    <div class="tab-content">
      <style>${STYLES}</style>
      ${buildFilterBar([PERIOD_FILTER, PRIORITY_FILTER, STATUS_FILTER])}
      <div class="actionplan-content"></div>
    </div>
  `;

  function render(filters) { renderContent(container, filters); }
  render(getFilterValues(container));
  filterCleanup = onFilterChange(container, render);
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
