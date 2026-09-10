/**
 * biz-timeline.js -- แผนดำเนินงาน 12 เดือน (Vertical Timeline)
 * แสดง milestones แต่ละเดือนเป็น timeline card พร้อม task list
 * แบ่ง phase ด้วยสี: เตรียมการ / เริ่มดำเนินงาน / ขยายตลาด / growth
 */

import { fetchJSON } from '../../shared/data-loader.js';
import { kpiGrid, fmtNum, loadingHTML, errorHTML } from '../../shared/ui-kit.js';

// ── Mount guard ─────────────────────────────────────────────
let mountId = 0;

// ── สีตาม phase ของแต่ละเดือน ────────────────────────────────
function phaseColor(month) {
  if (month <= 3) return '#667eea';  // เตรียมการ
  if (month <= 6) return '#16a34a';  // เริ่มดำเนินงาน
  if (month <= 9) return '#7c4dff';  // ขยายตลาด
  return '#f59e0b';                  // growth
}

function phaseLabel(month) {
  if (month <= 3) return 'เตรียมการ';
  if (month <= 6) return 'เริ่มดำเนินงาน';
  if (month <= 9) return 'ขยายตลาด';
  return 'Growth';
}

// ── สร้าง timeline HTML ──────────────────────────────────────
function renderTimeline(milestones) {
  const items = milestones.map(m => {
    const color = phaseColor(m.month);
    const tasksHtml = (m.tasks || []).map(t =>
      `<li>${t}</li>`
    ).join('');

    return `
      <div class="tl-item">
        <div class="tl-dot" style="background:linear-gradient(135deg, ${color}, ${color}dd);box-shadow:0 2px 8px ${color}4d;">
          ${m.month}
        </div>
        <div class="tl-card">
          <div class="tl-month" style="color:${color};">
            เดือนที่ ${m.month} <span class="tl-phase" style="background:${color}15;color:${color};margin-left:8px;padding:2px 8px;border-radius:10px;font-size:0.7rem;">${phaseLabel(m.month)}</span>
          </div>
          <div class="tl-title">${m.title}</div>
          <ul class="tl-tasks">${tasksHtml}</ul>
        </div>
      </div>`;
  }).join('');

  return `<div class="timeline">${items}</div>`;
}

// ── CSS (inject ใน <style> block) ────────────────────────────
function timelineStyles() {
  return `<style>
/* ── Timeline Layout ─────────────────────────────── */
.timeline {
  position: relative;
  padding: 20px 0;
  margin-top: 16px;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 28px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #667eea, #16a34a, #7c4dff, #f59e0b);
  border-radius: 2px;
}

/* ── Timeline Item ───────────────────────────────── */
.tl-item {
  position: relative;
  padding-left: 64px;
  padding-bottom: 28px;
}
.tl-item:last-child {
  padding-bottom: 0;
}

/* ── Dot (เลขเดือน) ──────────────────────────────── */
.tl-dot {
  position: absolute;
  left: 18px;
  top: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(102,126,234,0.3);
  z-index: 1;
}

/* ── Card ────────────────────────────────────────── */
.tl-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  padding: 16px 20px;
  transition: box-shadow 0.2s, transform 0.2s;
}
.tl-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  transform: translateY(-1px);
}

/* ── Month label ─────────────────────────────────── */
.tl-month {
  font-size: 0.75rem;
  font-weight: 600;
  color: #667eea;
  text-transform: uppercase;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
}
.tl-phase {
  display: inline-block;
}

/* ── Title ───────────────────────────────────────── */
.tl-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary, #2d3748);
  margin-bottom: 8px;
}

/* ── Task list ───────────────────────────────────── */
.tl-tasks {
  list-style: none;
  padding: 0;
  margin: 0;
}
.tl-tasks li {
  font-size: 0.85rem;
  color: var(--text-secondary, #4a5568);
  padding: 3px 0 3px 18px;
  position: relative;
  line-height: 1.5;
}
.tl-tasks li::before {
  content: '\\2713';
  position: absolute;
  left: 0;
  color: #16a34a;
  font-weight: bold;
}

/* ── Responsive ──────────────────────────────────── */
@media (max-width: 640px) {
  .timeline::before {
    left: 18px;
  }
  .tl-item {
    padding-left: 48px;
    padding-bottom: 20px;
  }
  .tl-dot {
    left: 8px;
    width: 22px;
    height: 22px;
    font-size: 0.65rem;
  }
  .tl-card {
    padding: 12px 14px;
  }
  .tl-title {
    font-size: 0.9rem;
  }
  .tl-tasks li {
    font-size: 0.8rem;
  }
  .tl-month {
    font-size: 0.7rem;
    flex-wrap: wrap;
    gap: 4px;
  }
  .tl-phase {
    margin-left: 0 !important;
  }
}
</style>`;
}

// ── Mount ───────────────────────────────────────────────────
export async function mount(container) {
  const id = ++mountId;
  container.innerHTML = loadingHTML();

  try {
    const data = await fetchJSON('/data/bizplan.json');
    if (id !== mountId) return;

    const milestones = data.milestones;
    if (!Array.isArray(milestones) || milestones.length === 0) {
      container.innerHTML = errorHTML('ไม่พบข้อมูลแผนดำเนินงาน');
      return;
    }

    // นับจำนวน task ทั้งหมด
    const totalTasks = milestones.reduce((sum, m) => sum + (m.tasks ? m.tasks.length : 0), 0);

    // ── KPI summary ─────────────────────────────────────
    const kpis = kpiGrid([
      { icon: '📅', label: 'ระยะเวลาแผน', value: fmtNum(milestones.length) + ' เดือน' },
      { icon: '📋', label: 'งานทั้งหมด', value: fmtNum(totalTasks) + ' รายการ' },
      { icon: '🚀', label: 'Phase', value: '4 ช่วง' },
      { icon: '🎯', label: 'เป้าหมายสุดท้าย', value: '80 ออเดอร์/วัน' }
    ], { cols: 4 });

    // ── ประกอบ HTML ─────────────────────────────────────
    container.innerHTML = `
      <div class="tab-content">
        ${timelineStyles()}
        ${kpis}
        ${renderTimeline(milestones)}
      </div>`;

  } catch (err) {
    if (id !== mountId) return;
    console.error('biz-timeline mount error:', err);
    container.innerHTML = errorHTML();
  }
}

// ── Unmount ─────────────────────────────────────────────────
export function unmount() {
  mountId++;
}
