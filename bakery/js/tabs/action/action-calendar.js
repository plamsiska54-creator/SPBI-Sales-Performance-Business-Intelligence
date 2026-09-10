/**
 * action-calendar.js - Sub-tab: ปฏิทินกิจกรรม
 * แสดงปฏิทินแบบเดือน (มิถุนายน 2569) + รายการกิจกรรมที่กำลังจะถึง
 * ใช้ข้อมูล demo (static) สำหรับ prototype
 * รองรับ reactive filters
 */
import { destroyAll } from '../../shared/chart-factory.js';
import { buildFilterBar, YEAR_FILTER, MONTH_FILTER } from '../../shared/filter-builder.js';
import { onFilterChange, getFilterValues } from '../../shared/filter-builder.js';

let mountId = 0;
let filterCleanup = null;

/* ---------- Demo Data ---------- */

// กิจกรรมบนปฏิทิน (วันที่ -> รายละเอียด)
const CALENDAR_EVENTS = {
  5:  'ประชุมวางแผน Q3',
  10: 'Review แคมเปญโดนัท',
  15: 'Deadline: โดนัทพรีเมียม',
  18: 'นำเสนอผลวิจัยตลาด',
  20: 'ประชุมทีม',
  25: 'อบรมพนักงานขายใหม่',
  30: 'สรุปผล Q2'
};

// รายการกิจกรรมที่กำลังจะถึง
const UPCOMING_EVENTS = [
  { date: '15 มิ.ย. 69', title: 'Deadline: โดนัทพรีเมียม',   color: '#dc2626' },
  { date: '18 มิ.ย. 69', title: 'นำเสนอผลวิจัยตลาด',       color: '#7c4dff' },
  { date: '20 มิ.ย. 69', title: 'ประชุมทีม',                color: '#f59e0b' },
  { date: '25 มิ.ย. 69', title: 'อบรมพนักงานขายใหม่',       color: '#16a34a' },
  { date: '30 มิ.ย. 69', title: 'สรุปผล Q2',               color: '#3498db' }
];

/* ---------- Inline Styles ---------- */

const STYLES = `
  .cal-grid { width: 100%; border-collapse: separate; border-spacing: 4px; }
  .cal-grid th { text-align: center; font-size: 0.8rem; color: #718096; padding: 8px; }
  .cal-grid td { text-align: center; padding: 10px; border-radius: 8px; font-size: 0.85rem; color: #4a5568; background: #fff; cursor: default; }
  .cal-grid td.today { background: linear-gradient(135deg, #ff4081, #7c4dff); color: #fff; font-weight: 600; }
  .cal-grid td.has-event { position: relative; }
  .cal-grid td.has-event::after { content: ''; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); width: 6px; height: 6px; border-radius: 50%; background: #ff4081; }
  .cal-grid td.empty { background: transparent; }
  .cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .cal-title { font-size: 1.2rem; font-weight: 600; color: #1a202c; }
  .cal-nav { background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 6px; color: #718096; font-size: 1.2rem; }
  .cal-nav:hover { background: rgba(0,0,0,0.06); }
  .upcoming-list { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
  .upcoming-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #fff; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
  .upcoming-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .upcoming-info { flex: 1; }
  .upcoming-title { font-weight: 600; color: #1a202c; font-size: 0.9rem; }
  .upcoming-date { font-size: 0.8rem; color: #718096; margin-top: 2px; }
  @media (max-width: 767px) { .cal-grid td { padding: 6px; font-size: 0.75rem; } }
`;

/* ---------- Month data helper ---------- */

const MONTH_NAMES = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                     'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

const YEAR_MAP = { '2569': 2026, '2568': 2025, '2567': 2024 };

function getMonthInfo(filters) {
  const yearBE = filters.year || '2569';
  const monthFilter = filters.month || 'all';
  const yearCE = YEAR_MAP[yearBE] || 2026;
  // ถ้าเลือก 'all' ใช้เดือน มิ.ย. (5) เป็น default
  const monthIdx = monthFilter === 'all' ? 5 : parseInt(monthFilter) - 1;
  const monthName = MONTH_NAMES[monthIdx];

  // คำนวณข้อมูลเดือน
  const firstDay = new Date(yearCE, monthIdx, 1);
  const daysInMonth = new Date(yearCE, monthIdx + 1, 0).getDate();
  // 0=Sun, ปรับให้ 0=Mon
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  return { yearBE, yearCE, monthIdx, monthName, daysInMonth, startDay };
}

/* ---------- Calendar HTML Builder ---------- */

function calendarGridHTML(info) {
  const { daysInMonth, startDay, monthIdx, yearCE } = info;
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === yearCE && now.getMonth() === monthIdx;
  const todayDate = isCurrentMonth ? now.getDate() : -1;

  const dayHeaders = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];

  let rows = '';
  let dayCount = 1;
  const numWeeks = Math.ceil((daysInMonth + startDay) / 7);

  for (let week = 0; week < numWeeks; week++) {
    let cells = '';
    for (let dow = 0; dow < 7; dow++) {
      if ((week === 0 && dow < startDay) || dayCount > daysInMonth) {
        cells += '<td class="empty"></td>';
      } else {
        const classes = [];
        if (dayCount === todayDate) classes.push('today');
        if (CALENDAR_EVENTS[dayCount]) classes.push('has-event');
        const tooltip = CALENDAR_EVENTS[dayCount] ? ` title="${CALENDAR_EVENTS[dayCount]}"` : '';
        cells += `<td class="${classes.join(' ')}"${tooltip}>${dayCount}</td>`;
        dayCount++;
      }
    }
    rows += `<tr>${cells}</tr>`;
  }

  return `
    <table class="cal-grid">
      <thead>
        <tr>${dayHeaders.map(d => `<th>${d}</th>`).join('')}</tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

/* ---------- Render Content ---------- */

function renderContent(container, filters) {
  const contentEl = container.querySelector('.actioncalendar-content');
  if (!contentEl) return;

  const info = getMonthInfo(filters);

  // Upcoming events
  const upcomingItems = UPCOMING_EVENTS.map(ev => `
    <div class="upcoming-item">
      <div class="upcoming-dot" style="background: ${ev.color}"></div>
      <div class="upcoming-info">
        <div class="upcoming-title">${ev.title}</div>
        <div class="upcoming-date">${ev.date}</div>
      </div>
    </div>
  `).join('');

  contentEl.innerHTML = `
    <div class="chart-grid">
      <div class="chart-card full-width">
        <div class="cal-header">
          <button class="cal-nav" disabled>&larr;</button>
          <span class="cal-title">${info.monthName} ${info.yearBE}</span>
          <button class="cal-nav" disabled>&rarr;</button>
        </div>
        ${calendarGridHTML(info)}
      </div>
      <div class="chart-card full-width">
        <h3 class="chart-card-title">กิจกรรมที่กำลังจะถึง</h3>
        <div class="upcoming-list">${upcomingItems}</div>
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
        <p class="loading-text">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  `;

  await new Promise(r => setTimeout(r, 200));
  if (thisMount !== mountId) return;

  container.innerHTML = `
    <div class="tab-content">
      <style>${STYLES}</style>
      ${buildFilterBar([YEAR_FILTER, MONTH_FILTER])}
      <div class="actioncalendar-content"></div>
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
