/**
 * alert-settings.js - Sub-tab: ตั้งค่าแจ้งเตือน
 * แสดงฟอร์มตั้งค่า (display only) + ตารางเงื่อนไขที่ใช้งาน
 * ไม่มี chart — เป็น HTML form/table อย่างเดียว
 * ข้อมูล demo ในตัว (hardcoded)
 */
import { destroyAll } from '../../shared/chart-factory.js';

let mountId = 0;

/* ---------- ข้อมูล Demo ---------- */

const RULES = [
  { rule: 'ราคาคู่แข่งเปลี่ยนแปลง > 5%',                      condition: 'ตรวจทุก 6 ชม.',    status: true },
  { rule: 'Sentiment ติดลบ > 30%',                            condition: 'ตรวจทุก 12 ชม.',   status: true },
  { rule: 'Market share เปลี่ยนแปลง > 2%',                    condition: 'ตรวจทุกสัปดาห์',    status: true },
  { rule: 'สินค้าใหม่จากคู่แข่งหลัก (S&P, After You, Yamazaki)', condition: 'ตรวจทุกวัน',       status: true },
  { rule: 'ยอดขายลดลง > 10% เทียบสัปดาห์ก่อน',                condition: 'ตรวจทุกสัปดาห์',    status: true },
  { rule: 'รีวิวใหม่ที่มี rating < 2 ดาว',                       condition: 'Real-time',        status: false },
  { rule: 'คู่แข่งเปิดสาขาใหม่ในพื้นที่ 5 กม.',                  condition: 'ตรวจทุกวัน',       status: false }
];

/* ---------- HTML Template ---------- */

function contentHTML() {
  const ruleRows = RULES.map(r => {
    const statusLabel = r.status ? 'เปิดใช้' : 'ปิด';
    const statusColor = r.status ? '#16a34a' : '#a0aec0';
    const dot = r.status
      ? '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#16a34a;margin-right:6px"></span>'
      : '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#a0aec0;margin-right:6px"></span>';
    return `
      <tr>
        <td>${r.rule}</td>
        <td class="num">${r.condition}</td>
        <td><span style="color:${statusColor};font-weight:600">${dot}${statusLabel}</span></td>
      </tr>`;
  }).join('');

  return `
    <div class="chart-card">
      <h3 class="chart-card-title">การตั้งค่าแจ้งเตือน</h3>
      <p class="chart-card-subtitle">แสดงผลอย่างเดียว (display only)</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;padding:20px 0">

        <!-- เกณฑ์แจ้งเตือนราคา -->
        <div>
          <label style="display:block;font-weight:600;color:#4a5568;margin-bottom:8px;font-size:0.9rem">เกณฑ์แจ้งเตือนราคา</label>
          <div style="background:rgba(0,0,0,0.03);border:1px solid rgba(0,0,0,0.1);border-radius:8px;padding:12px 16px;color:#1a202c">
            เปลี่ยนแปลง > <strong>5%</strong>
          </div>
        </div>

        <!-- เกณฑ์ sentiment -->
        <div>
          <label style="display:block;font-weight:600;color:#4a5568;margin-bottom:8px;font-size:0.9rem">เกณฑ์ Sentiment ติดลบ</label>
          <div style="background:rgba(0,0,0,0.03);border:1px solid rgba(0,0,0,0.1);border-radius:8px;padding:12px 16px;color:#1a202c">
            ติดลบ > <strong>30%</strong>
          </div>
        </div>

        <!-- ช่องทางแจ้งเตือน -->
        <div>
          <label style="display:block;font-weight:600;color:#4a5568;margin-bottom:8px;font-size:0.9rem">ช่องทางแจ้งเตือน</label>
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <span style="background:#16a34a22;color:#16a34a;padding:6px 14px;border-radius:8px;font-size:0.85rem;font-weight:600">Email &#10003;</span>
            <span style="background:#16a34a22;color:#16a34a;padding:6px 14px;border-radius:8px;font-size:0.85rem;font-weight:600">Line &#10003;</span>
            <span style="background:#16a34a22;color:#16a34a;padding:6px 14px;border-radius:8px;font-size:0.85rem;font-weight:600">Dashboard &#10003;</span>
          </div>
        </div>

        <!-- ความถี่ -->
        <div>
          <label style="display:block;font-weight:600;color:#4a5568;margin-bottom:8px;font-size:0.9rem">ความถี่การตรวจสอบ</label>
          <div style="background:rgba(0,0,0,0.03);border:1px solid rgba(0,0,0,0.1);border-radius:8px;padding:12px 16px;color:#1a202c">
            <strong>Real-time</strong> (สำหรับการแจ้งเตือนเร่งด่วน)
          </div>
        </div>

      </div>
    </div>
    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">เงื่อนไขแจ้งเตือนที่กำหนดไว้</h3>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>เงื่อนไข</th>
              <th class="num">ความถี่ตรวจสอบ</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>${ruleRows}</tbody>
        </table>
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
        <p class="loading-text">กำลังโหลดการตั้งค่า...</p>
      </div>
    </div>
  `;

  try {
    await Promise.resolve();
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">${contentHTML()}</div>`;

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('AlertSettings mount error:', err);
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
  destroyAll();
}
