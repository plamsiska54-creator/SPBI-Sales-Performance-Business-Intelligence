/**
 * mon-realtime.js - Sub-tab: กิจกรรมคู่แข่ง (Real-time) (Redesigned)
 * Activity Log พร้อมระบบ status + Data Entry Form (disabled/display only)
 * + chart จำนวนกิจกรรมตามแบรนด์/ประเภท
 * ข้อมูล demo ในตัว (hardcoded)
 * รองรับ filter reactive (เปลี่ยน filter -> ข้อมูลเปลี่ยนตาม)
 */
import { createChart, destroyAll, CHART_COLORS, BRAND_COLORS } from '../../shared/chart-factory.js';
import { buildFilterBar, onFilterChange, getFilterValues, PERIOD_FILTER, COMPETITOR_FILTER, STATUS_FILTER } from '../../shared/filter-builder.js';
import { varyValue, filterByCompetitor, filterByStatus } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

const STYLE_ID = 'mon-realtime-style';

/* ---------- ข้อมูล Demo ---------- */

const ACTIVITY_TYPES = {
  'สินค้าใหม่': { color: '#7b2ff7', icon: '\u{1F195}' },
  'ลดราคา':    { color: '#dc2626', icon: '\u{1F3F7}️' },
  'แคมเปญ':   { color: '#f59e0b', icon: '\u{1F4E2}' },
  'สาขาใหม่':  { color: '#16a34a', icon: '\u{1F3EA}' },
  'ปรับราคา':  { color: '#e91e63', icon: '\u{1F4B0}' }
};

const STATUS_MAP = {
  normal:   { icon: '\u{1F7E2}', label: 'ปกติ',              cls: 'mon-status-normal' },
  change:   { icon: '\u{1F7E1}', label: 'มีการเปลี่ยนแปลง',   cls: 'mon-status-change' },
  critical: { icon: '\u{1F534}', label: 'คู่แข่งมี Action สำคัญ', cls: 'mon-status-critical' }
};

const ACTIVITIES = [
  { brand: 'S&P',       brandId: 'snp',       type: 'ลดราคา',    message: 'S&P ลดราคาเค้กทุกชิ้น 20% ทุกสาขา',           time: '1 ชม. ที่แล้ว',   status: 'critical' },
  { brand: 'After You', brandId: 'afteryou',  type: 'สินค้าใหม่', message: 'After You เปิดตัว Limited Edition เค้กวันแม่',    time: '2 ชม. ที่แล้ว',   status: 'change' },
  { brand: 'Yamazaki',  brandId: 'yamazaki',  type: 'แคมเปญ',   message: 'Yamazaki จัดแคมเปญ "ซื้อ 2 แถม 1" ครัวซองต์',  time: '3 ชม. ที่แล้ว',   status: 'change' },
  { brand: 'Farmhouse', brandId: 'farmhouse', type: 'ปรับราคา',  message: 'Farmhouse ปรับราคาขนมปังขึ้น 3-5 บาท',        time: '5 ชม. ที่แล้ว',   status: 'critical' },
  { brand: 'S&P',       brandId: 'snp',       type: 'สินค้าใหม่', message: 'S&P เปิดตัวขนมปังโฮลวีทใหม่ 3 รายการ',        time: '6 ชม. ที่แล้ว',   status: 'normal' },
  { brand: 'Le Pain',   brandId: 'lepain',    type: 'สินค้าใหม่', message: 'Le Pain เปิดตัวครัวซองต์ไส้ใหม่ 2 รสชาติ',       time: '8 ชม. ที่แล้ว',   status: 'normal' },
  { brand: 'S&P',       brandId: 'snp',       type: 'แคมเปญ',   message: 'S&P จัดโปรโมชั่น member day ลด 15%',           time: 'เมื่อวาน',        status: 'change' },
  { brand: 'After You', brandId: 'afteryou',  type: 'แคมเปญ',   message: 'After You ร่วมกับ Grab ส่งฟรีทั้งเดือน',         time: 'เมื่อวาน',        status: 'critical' },
  { brand: 'Farmhouse', brandId: 'farmhouse', type: 'สาขาใหม่',  message: 'Farmhouse เปิดจุดจำหน่ายใหม่ใน Lotus 5 แห่ง', time: '2 วันที่แล้ว',    status: 'normal' },
  { brand: 'Yamazaki',  brandId: 'yamazaki',  type: 'ลดราคา',    message: 'Yamazaki ปรับลดราคาขนมปังกลุ่ม classic 10%',   time: '2 วันที่แล้ว',    status: 'change' },
  { brand: 'Le Pain',   brandId: 'lepain',    type: 'สาขาใหม่',  message: 'Le Pain เปิดสาขาใหม่ที่เซ็นทรัลพระราม 9',      time: '3 วันที่แล้ว',    status: 'normal' },
  { brand: 'Farmhouse', brandId: 'farmhouse', type: 'แคมเปญ',   message: 'Farmhouse เปิดแคมเปญโฆษณาทีวีชุดใหม่',       time: '4 วันที่แล้ว',    status: 'change' }
];

const BRAND_ACTIVITY_COUNT = [
  { brand: 'S&P',       brandId: 'snp',       count: 8 },
  { brand: 'After You', brandId: 'afteryou',  count: 6 },
  { brand: 'Farmhouse', brandId: 'farmhouse', count: 5 },
  { brand: 'Yamazaki',  brandId: 'yamazaki',  count: 5 },
  { brand: 'Le Pain',   brandId: 'lepain',    count: 3 }
];

const TYPE_BREAKDOWN = [
  { type: 'สินค้าใหม่', count: 12 },
  { type: 'ลดราคา',    count: 8 },
  { type: 'แคมเปญ',   count: 10 },
  { type: 'สาขาใหม่',  count: 5 },
  { type: 'ปรับราคา',  count: 3 }
];

/* ---------- CSS Injection ---------- */

function injectCSS() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .mon-activity-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 0;
      border-bottom: 1px solid rgba(0,0,0,0.06);
      transition: background 0.15s;
    }
    .mon-activity-item:hover {
      background: #f7fafc;
      margin: 0 -8px;
      padding-left: 8px;
      padding-right: 8px;
      border-radius: 8px;
    }
    .mon-activity-icon { font-size: 1.5rem; flex-shrink: 0; }
    .mon-activity-body { flex: 1; }
    .mon-activity-msg { font-weight: 600; color: #1a202c; margin-bottom: 4px; }
    .mon-activity-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      flex-wrap: wrap;
    }
    .mon-type-badge {
      color: #fff;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .mon-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
    }
    .mon-status-normal   { background: #dcfce7; color: #166534; }
    .mon-status-change   { background: #fef9c3; color: #854d0e; }
    .mon-status-critical { background: #fee2e2; color: #991b1b; }
    .mon-time { color: #718096; }

    /* Data Entry Form */
    .monitor-form {
      margin-top: 24px;
      background: #f7fafc;
      border: 1px dashed #cbd5e0;
      border-radius: 12px;
      padding: 24px;
    }
    .monitor-form h3 {
      font-size: 1rem;
      color: #4a5568;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .mon-form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 14px;
    }
    .mon-form-group label {
      display: block;
      font-size: 0.8rem;
      color: #718096;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .mon-form-group input,
    .mon-form-group select,
    .mon-form-group textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.85rem;
      background: #edf2f7;
      color: #a0aec0;
      cursor: not-allowed;
      box-sizing: border-box;
    }
    .mon-form-group textarea {
      height: 60px;
      resize: none;
    }
    .mon-form-note {
      grid-column: 1 / -1;
      font-size: 0.8rem;
      color: #a0aec0;
      font-style: italic;
      margin-top: 4px;
    }
  `;
  document.head.appendChild(style);
}

function removeCSS() {
  const el = document.getElementById(STYLE_ID);
  if (el) el.remove();
}

/* ---------- Render Content (filter-reactive) ---------- */

function renderContent(container, filters) {
  destroyAll();

  const contentEl = container.querySelector('.mon-realtime-content');

  // กรอง activities ตาม competitor และ status
  const filteredByCompetitor = filterByCompetitor(ACTIVITIES, filters, 'brandId');
  const filteredActivities = filterByStatus(filteredByCompetitor, filters);

  // กรอง brand activity count ตาม competitor
  const filteredBrandCount = filterByCompetitor(BRAND_ACTIVITY_COUNT, filters, 'brandId');

  // Vary ค่า count ตาม filter
  const variedBrandCount = filteredBrandCount.map((b, i) => ({
    ...b,
    count: varyValue(b.count, filters, { seed: 900 + i, asInt: true, min: 1 })
  }));

  const variedTypeBreakdown = TYPE_BREAKDOWN.map((t, i) => ({
    ...t,
    count: varyValue(t.count, filters, { seed: 920 + i, asInt: true, min: 1 })
  }));

  // Timeline HTML
  const timelineItems = filteredActivities.map(a => {
    const typeInfo = ACTIVITY_TYPES[a.type] || { color: '#718096', icon: '\u{1F4CB}' };
    const st = STATUS_MAP[a.status] || STATUS_MAP.normal;

    return `
      <div class="mon-activity-item">
        <div class="mon-activity-icon">${typeInfo.icon}</div>
        <div class="mon-activity-body">
          <div class="mon-activity-msg">${a.message}</div>
          <div class="mon-activity-meta">
            <span class="mon-type-badge" style="background:${typeInfo.color}">${a.type}</span>
            <span class="mon-status-badge ${st.cls}">${st.icon} ${st.label}</span>
            <span class="mon-time">${a.time}</span>
          </div>
        </div>
      </div>`;
  }).join('');

  const emptyTimeline = filteredActivities.length === 0
    ? '<p style="color:#a0aec0;text-align:center;padding:40px 0">ไม่พบกิจกรรมในเงื่อนไขที่เลือก</p>'
    : '';

  const formHTML = `
    <div class="monitor-form">
      <h3>\u{1F4DD} บันทึกข้อมูลคู่แข่ง</h3>
      <div class="mon-form-grid">
        <div class="mon-form-group">
          <label>วันที่</label>
          <input type="date" disabled>
        </div>
        <div class="mon-form-group">
          <label>คู่แข่ง</label>
          <select disabled>
            <option>เลือกคู่แข่ง...</option>
            <option>S&P</option>
            <option>After You</option>
            <option>ฟาร์มเฮ้าส์</option>
            <option>ยามาซากิ</option>
            <option>เลอแปง</option>
          </select>
        </div>
        <div class="mon-form-group">
          <label>สินค้า</label>
          <input type="text" disabled placeholder="ชื่อสินค้า">
        </div>
        <div class="mon-form-group">
          <label>ราคา</label>
          <input type="text" disabled placeholder="฿">
        </div>
        <div class="mon-form-group">
          <label>Promotion</label>
          <input type="text" disabled placeholder="รายละเอียดโปรโมชั่น">
        </div>
        <div class="mon-form-group">
          <label>Channel</label>
          <select disabled>
            <option>เลือก Channel...</option>
            <option>ร้าน</option>
            <option>Online</option>
            <option>MT</option>
            <option>CVS</option>
          </select>
        </div>
        <div class="mon-form-group">
          <label>สถานะ</label>
          <select disabled>
            <option>\u{1F7E2} ปกติ</option>
            <option>\u{1F7E1} มีการเปลี่ยนแปลง</option>
            <option>\u{1F534} คู่แข่งมี Action สำคัญ</option>
          </select>
        </div>
        <div class="mon-form-group">
          <label>Remark</label>
          <textarea disabled placeholder="หมายเหตุเพิ่มเติม"></textarea>
        </div>
        <div class="mon-form-note">* ฟอร์มนี้เป็นตัวอย่าง ยังไม่เปิดใช้งาน (Coming Soon)</div>
      </div>
    </div>`;

  contentEl.innerHTML = `
    <div class="chart-grid">
      <div class="chart-card">
        <h3 class="chart-card-title">กิจกรรมล่าสุดของคู่แข่ง</h3>
        <div style="max-height:520px;overflow-y:auto;padding:0 4px">
          ${timelineItems || emptyTimeline}
        </div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">จำนวนกิจกรรมตามแบรนด์ (เดือนนี้)</h3>
        <div class="chart-container"><canvas id="chart-mon-brand-activity"></canvas></div>
        <h3 class="chart-card-title" style="margin-top:var(--spacing-lg)">สัดส่วนประเภทกิจกรรม</h3>
        <div class="chart-container"><canvas id="chart-mon-type-donut"></canvas></div>
      </div>
    </div>
    ${formHTML}
  `;

  // --- Charts ---

  // Brand Activity Bar
  if (variedBrandCount.length > 0) {
    createChart('chart-mon-brand-activity', {
      type: 'bar',
      data: {
        labels: variedBrandCount.map(b => b.brand),
        datasets: [{
          label: 'จำนวนกิจกรรม',
          data: variedBrandCount.map(b => b.count),
          backgroundColor: variedBrandCount.map(b => BRAND_COLORS[b.brandId] || CHART_COLORS[0]),
          borderRadius: 6
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => `${ctx.parsed.y} กิจกรรม` } }
        },
        scales: {
          x: { ticks: { color: '#4a5568' }, grid: { color: 'rgba(0,0,0,0.06)' } },
          y: {
            beginAtZero: true,
            ticks: { color: '#4a5568', stepSize: 2 },
            grid: { color: 'rgba(0,0,0,0.06)' }
          }
        }
      }
    });
  }

  // Type Donut
  const typeColors = variedTypeBreakdown.map(t => {
    const info = ACTIVITY_TYPES[t.type];
    return info ? info.color : '#718096';
  });

  createChart('chart-mon-type-donut', {
    type: 'doughnut',
    data: {
      labels: variedTypeBreakdown.map(t => t.type),
      datasets: [{
        data: variedTypeBreakdown.map(t => t.count),
        backgroundColor: typeColors,
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
          callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed} ครั้ง` }
        }
      }
    }
  });
}

/* ---------- Tab lifecycle ---------- */

export async function mount(container) {
  const thisMount = ++mountId;
  injectCSS();

  container.innerHTML = `
    <div class="tab-content">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">กำลังโหลดกิจกรรมคู่แข่ง...</p>
      </div>
    </div>`;

  try {
    await Promise.resolve();
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">${buildFilterBar([PERIOD_FILTER, COMPETITOR_FILTER, STATUS_FILTER])}<div class="mon-realtime-content"></div></div>`;

    function render(filters) { renderContent(container, filters); }

    render(getFilterValues(container));

    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('MonRealtime mount error:', err);
    container.innerHTML = `
      <div class="tab-content">
        <div class="error-state">
          <p class="error-state-text">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        </div>
      </div>`;
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
  removeCSS();
}
