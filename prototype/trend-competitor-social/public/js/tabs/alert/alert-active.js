/**
 * alert-active.js - Sub-tab: แจ้งเตือนที่ใช้งานอยู่
 * แสดง summary cards 3 ใบ + รายการแจ้งเตือนที่ active
 * ข้อมูล demo ในตัว (hardcoded)
 * รองรับ reactive filters
 */
import { destroyAll } from '../../shared/chart-factory.js';
import { buildFilterBar, PERIOD_FILTER, PRIORITY_FILTER, STATUS_FILTER } from '../../shared/filter-builder.js';
import { onFilterChange, getFilterValues } from '../../shared/filter-builder.js';
import { varyValue, filterByPriority } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

/* ---------- ข้อมูล Demo ---------- */

const SEVERITY = {
  'เร่งด่วน': { color: '#dc2626', bg: 'rgba(220,38,38,0.08)', icon: '🔴' },
  'สำคัญ':   { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: '🟡' },
  'ข้อมูล':   { color: '#2979ff', bg: 'rgba(41,121,255,0.08)', icon: '🔵' }
};

const BASE_SUMMARY = [
  { label: 'แจ้งเตือนเร่งด่วน', count: 2, severity: 'เร่งด่วน' },
  { label: 'แจ้งเตือนสำคัญ',   count: 5, severity: 'สำคัญ' },
  { label: 'แจ้งเตือนข้อมูล',   count: 3, severity: 'ข้อมูล' }
];

const ALERTS = [
  { severity: 'เร่งด่วน', priority: 'urgent', type: 'ราคาคู่แข่งเปลี่ยน',   message: 'After You ลดราคาเค้ก 20% ทุกสาขา อาจกระทบยอดขายกลุ่มเค้กของเรา',                    time: '15 นาทีที่แล้ว', status: 'critical' },
  { severity: 'เร่งด่วน', priority: 'urgent', type: 'market share เปลี่ยน', message: 'ส่วนแบ่งตลาดหมวดโดนัทลดลง 2.3% ใน 2 สัปดาห์ที่ผ่านมา',                             time: '1 ชม. ที่แล้ว', status: 'critical' },
  { severity: 'สำคัญ',   priority: 'high',   type: 'สินค้าใหม่ในตลาด',     message: 'S&P เปิดตัวขนมปังใหม่ 3 SKU ในกลุ่ม premium ที่เราเป็น leader',                        time: '2 ชม. ที่แล้ว', status: 'warning' },
  { severity: 'สำคัญ',   priority: 'high',   type: 'sentiment ติดลบ',     message: 'รีวิวติดลบเพิ่มขึ้น 15% ใน 1 สัปดาห์ ส่วนใหญ่เรื่องความสดของขนมปัง',                   time: '3 ชม. ที่แล้ว', status: 'warning' },
  { severity: 'สำคัญ',   priority: 'high',   type: 'ราคาคู่แข่งเปลี่ยน',   message: 'Yamazaki ปรับขึ้นราคาขนมปัง sandwich 7% อาจเป็นโอกาสชิง market share',                time: '5 ชม. ที่แล้ว', status: 'warning' },
  { severity: 'สำคัญ',   priority: 'high',   type: 'สินค้าใหม่ในตลาด',     message: 'Farmhouse เปิดตัวครัวซองต์เนยสดฝรั่งเศส แข่งในกลุ่ม premium pastry',                   time: '8 ชม. ที่แล้ว', status: 'warning' },
  { severity: 'สำคัญ',   priority: 'high',   type: 'market share เปลี่ยน', message: 'Le Pain มี market share เพิ่มขึ้น 1.5% ในพื้นที่กรุงเทพ',                               time: 'เมื่อวาน', status: 'warning' },
  { severity: 'ข้อมูล',   priority: 'normal', type: 'ราคาคู่แข่งเปลี่ยน',   message: 'Farmhouse ปรับราคาขนมปังโฮลวีท +10% ตามต้นทุนวัตถุดิบ',                              time: 'เมื่อวาน', status: 'normal' },
  { severity: 'ข้อมูล',   priority: 'normal', type: 'sentiment ติดลบ',     message: 'พบรีวิวติดลบเกี่ยวกับบรรจุภัณฑ์ไม่สวย 8 รายการในสัปดาห์นี้',                             time: '2 วันที่แล้ว', status: 'normal' },
  { severity: 'ข้อมูล',   priority: 'normal', type: 'สินค้าใหม่ในตลาด',     message: 'ร้านเบเกอรี่ local ใหม่เปิดในเขตสาทร มีรีวิวดีบน social media',                          time: '3 วันที่แล้ว', status: 'normal' }
];

/* ---------- Render Content ---------- */

function renderContent(container, filters) {
  const contentEl = container.querySelector('.alertactive-content');
  if (!contentEl) return;

  // กรองตาม priority และ status
  let filteredAlerts = filterByPriority(ALERTS, filters);
  // กรองตาม status filter ด้วย
  const statusFilter = filters.status;
  if (statusFilter && statusFilter !== 'all') {
    filteredAlerts = filteredAlerts.filter(a => a.status === statusFilter);
  }

  // Summary cards (vary ด้วย filter)
  const summaryCards = BASE_SUMMARY.map((s, idx) => {
    const sev = SEVERITY[s.severity];
    const count = Math.round(varyValue(s.count, filters, { seed: 700 + idx, min: 0 }));
    return `
      <div style="background:${sev.bg};border:2px solid ${sev.color}22;border-radius:12px;padding:20px;text-align:center">
        <div style="font-size:2.2rem;font-weight:800;color:${sev.color}">${count}</div>
        <div style="color:#4a5568;font-size:0.9rem;margin-top:4px">${s.label}</div>
      </div>`;
  }).join('');

  // Alert list
  const alertItems = filteredAlerts.map(a => {
    const sev = SEVERITY[a.severity];
    return `
      <div style="display:flex;align-items:flex-start;gap:12px;padding:14px 0;border-bottom:1px solid rgba(0,0,0,0.06)">
        <div style="font-size:1.2rem;flex-shrink:0;margin-top:2px">${sev.icon}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap">
            <span style="background:${sev.color};color:#fff;padding:2px 8px;border-radius:12px;font-size:0.7rem;font-weight:600">${a.severity}</span>
            <span style="background:rgba(0,0,0,0.06);color:#4a5568;padding:2px 8px;border-radius:12px;font-size:0.7rem">${a.type}</span>
            <span style="color:#a0aec0;font-size:0.8rem;margin-left:auto;white-space:nowrap">${a.time}</span>
          </div>
          <div style="color:#1a202c;font-size:0.9rem;line-height:1.5">${a.message}</div>
        </div>
      </div>`;
  }).join('');

  const emptyMsg = filteredAlerts.length === 0
    ? '<div style="text-align:center;color:#718096;padding:40px 0">ไม่พบแจ้งเตือนที่ตรงกับเงื่อนไข</div>'
    : '';

  contentEl.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:var(--spacing-lg,24px)">
      ${summaryCards}
    </div>
    <div class="chart-card">
      <h3 class="chart-card-title">แจ้งเตือนที่ใช้งานอยู่</h3>
      <div style="max-height:520px;overflow-y:auto;padding:0 4px">
        ${alertItems}
        ${emptyMsg}
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
        <p class="loading-text">กำลังโหลดแจ้งเตือน...</p>
      </div>
    </div>
  `;

  try {
    await Promise.resolve();
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">${buildFilterBar([PERIOD_FILTER, PRIORITY_FILTER, STATUS_FILTER])}<div class="alertactive-content"></div></div>`;

    function render(filters) { renderContent(container, filters); }
    render(getFilterValues(container));
    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('AlertActive mount error:', err);
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
