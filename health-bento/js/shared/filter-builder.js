/**
 * filter-builder.js — ตัวสร้างแถบฟิลเตอร์ที่ใช้ร่วมกันทุกหน้า
 * วิธีใช้: const html = buildFilterBar([YEAR_FILTER, CHANNEL_FILTER])
 * หลังใส่ HTML ลง DOM แล้วเรียก onFilterChange(container, callback) เพื่อรับค่าเมื่อผู้ใช้เปลี่ยนฟิลเตอร์
 */

export function buildFilterBar(filters, containerId = '') {
  const id = containerId ? ` id="${containerId}"` : '';
  const groups = filters.map(f => {
    const opts = f.options.map(o =>
      `<option value="${o.value}"${o.selected ? ' selected' : ''}>${o.text}</option>`
    ).join('');
    return `<div class="filter-group">
      <label>${f.label}</label>
      <select data-filter="${f.id}">${opts}</select>
    </div>`;
  }).join('\n');

  return `<div class="filter-bar"${id}>${groups}</div>`;
}

export function getFilterValues(container) {
  const vals = {};
  const selects = container.querySelectorAll('select[data-filter]');
  selects.forEach(sel => { vals[sel.dataset.filter] = sel.value; });
  return vals;
}

export function onFilterChange(container, callback) {
  function handler() { callback(getFilterValues(container)); }
  const selects = container.querySelectorAll('select[data-filter]');
  selects.forEach(sel => sel.addEventListener('change', handler));
  return function cleanup() {
    selects.forEach(sel => sel.removeEventListener('change', handler));
  };
}

// ── ฟิลเตอร์สำเร็จรูป (โดเมนข้าวกล่องเพื่อสุขภาพ) ──────────────

/** ปีตามแผนธุรกิจ 3 ปี (พ.ศ.) */
export const YEAR_FILTER = {
  id: 'year', label: 'ปีตามแผน',
  options: [
    { value: '2569', text: 'ปีที่ 1 (พ.ศ. 2569)', selected: true },
    { value: '2570', text: 'ปีที่ 2 (พ.ศ. 2570)' },
    { value: '2571', text: 'ปีที่ 3 (พ.ศ. 2571)' }
  ]
};

export const PERIOD_FILTER = {
  id: 'period', label: 'ช่วงเวลา',
  options: [
    { value: 'all', text: 'ทั้งปี (12 เดือน)', selected: true },
    { value: '6m', text: '6 เดือนล่าสุด' },
    { value: '3m', text: '3 เดือนล่าสุด' },
    { value: '1m', text: 'เดือนล่าสุด' }
  ]
};

export const MONTH_FILTER = {
  id: 'month', label: 'เดือน',
  options: [
    { value: 'all', text: 'ทุกเดือน', selected: true },
    { value: '1', text: 'ม.ค.' }, { value: '2', text: 'ก.พ.' },
    { value: '3', text: 'มี.ค.' }, { value: '4', text: 'เม.ย.' },
    { value: '5', text: 'พ.ค.' }, { value: '6', text: 'มิ.ย.' },
    { value: '7', text: 'ก.ค.' }, { value: '8', text: 'ส.ค.' },
    { value: '9', text: 'ก.ย.' }, { value: '10', text: 'ต.ค.' },
    { value: '11', text: 'พ.ย.' }, { value: '12', text: 'ธ.ค.' }
  ]
};

/** หมวดเมนู — ผสมไทย + สากล */
export const MENU_FILTER = {
  id: 'menu', label: 'หมวดเมนู',
  options: [
    { value: 'all', text: 'ทุกหมวด', selected: true },
    { value: 'thaiclean', text: 'คลีนไทย' },
    { value: 'bowl', text: 'สลัด/ไรซ์โบว์ล' },
    { value: 'keto', text: 'คีโต/โลว์คาร์บ' },
    { value: 'protein', text: 'โปรตีนสูง (ออกกำลังกาย)' },
    { value: 'vegan', text: 'มังสวิรัติ/เจ' },
    { value: 'medical', text: 'ผู้สูงอายุ/ผู้ป่วยเฉพาะโรค' }
  ]
};

/** ช่องทางขาย — ครบทุกช่องทาง */
export const CHANNEL_FILTER = {
  id: 'channel', label: 'ช่องทางขาย',
  options: [
    { value: 'all', text: 'ทุกช่องทาง', selected: true },
    { value: 'line', text: 'LINE OA / เว็บไซต์' },
    { value: 'delivery', text: 'แอปเดลิเวอรี' },
    { value: 'corporate', text: 'องค์กร / แคทเทอริง' },
    { value: 'fitness', text: 'ฟิตเนส / คลินิก' },
    { value: 'store', text: 'หน้าร้าน / ตู้แช่' }
  ]
};

/** พื้นที่ให้บริการ — เริ่มจากกรุงเทพฯ และปริมณฑล */
export const REGION_FILTER = {
  id: 'region', label: 'พื้นที่',
  options: [
    { value: 'all', text: 'ทุกพื้นที่', selected: true },
    { value: 'bkk_in', text: 'กรุงเทพฯ ชั้นใน' },
    { value: 'bkk_out', text: 'กรุงเทพฯ ชั้นนอก' },
    { value: 'nonthaburi', text: 'นนทบุรี / ปทุมธานี' },
    { value: 'samutprakan', text: 'สมุทรปราการ' },
    { value: 'upcountry', text: 'ต่างจังหวัด (ส่งข้ามคืน)' }
  ]
};

/** กลุ่มลูกค้าเป้าหมาย */
export const CUSTOMER_FILTER = {
  id: 'customer', label: 'กลุ่มลูกค้า',
  options: [
    { value: 'all', text: 'ทุกกลุ่ม', selected: true },
    { value: 'office', text: 'พนักงานออฟฟิศ' },
    { value: 'fitness', text: 'คนออกกำลังกาย' },
    { value: 'diet', text: 'ควบคุมน้ำหนัก' },
    { value: 'medical', text: 'ผู้ป่วย/ผู้สูงอายุ' },
    { value: 'corporate', text: 'องค์กร' }
  ]
};

export const COMPETITOR_FILTER = {
  id: 'competitor', label: 'คู่แข่ง',
  options: [
    { value: 'all', text: 'ทั้งหมด', selected: true },
    { value: 'simplefit', text: 'Simple Fit' },
    { value: 'cleanmeal', text: 'Clean Meal' },
    { value: 'fitwhey', text: 'Fitwhey Food' },
    { value: 'dietfood', text: 'Diet Food' },
    { value: 'kinkin', text: 'KinKin Clean' }
  ]
};

/** สถานการณ์ประมาณการทางการเงิน */
export const SCENARIO_FILTER = {
  id: 'scenario', label: 'สถานการณ์',
  options: [
    { value: 'base', text: 'กรณีฐาน (Base)', selected: true },
    { value: 'best', text: 'กรณีดี (Best)' },
    { value: 'worst', text: 'กรณีแย่ (Worst)' }
  ]
};

/** สถานะงานใน roadmap */
export const STATUS_FILTER = {
  id: 'status', label: 'สถานะ',
  options: [
    { value: 'all', text: 'ทั้งหมด', selected: true },
    { value: 'done', text: 'เสร็จแล้ว' },
    { value: 'doing', text: 'กำลังทำ' },
    { value: 'todo', text: 'รอเริ่ม' }
  ]
};

/** ระดับความสำคัญ/ความเสี่ยง */
export const PRIORITY_FILTER = {
  id: 'priority', label: 'ระดับ',
  options: [
    { value: 'all', text: 'ทั้งหมด', selected: true },
    { value: 'high', text: 'สูง' },
    { value: 'medium', text: 'กลาง' },
    { value: 'low', text: 'ต่ำ' }
  ]
};

/** ห้าง / Modern Trade */
export const CHAIN_FILTER = {
  id: 'chain', label: 'ห้าง',
  options: [
    { value: 'all', text: 'ทุกห้าง', selected: true },
    { value: 'gourmet', text: 'Gourmet Market' },
    { value: 'villa', text: 'Villa Market' },
    { value: 'topsfoodhall', text: 'Tops Food Hall' },
    { value: 'tops', text: 'Tops (ทั่วไป)' },
    { value: 'topsdaily', text: 'Tops Daily' },
    { value: 'foodland', text: 'Foodland' },
    { value: 'bigc', text: 'Big C' },
    { value: 'lotuss', text: "Lotus's" },
    { value: 'makro', text: 'Makro' },
    { value: 'sevenmore', text: '7-Eleven' },
    { value: 'cjmore', text: 'CJ More' }
  ]
};

/** รูปแบบร้านของห้าง */
export const FORMAT_FILTER = {
  id: 'format', label: 'รูปแบบร้าน',
  options: [
    { value: 'all', text: 'ทุกรูปแบบ', selected: true },
    { value: 'premium', text: 'ซูเปอร์พรีเมียม' },
    { value: 'super', text: 'ซูเปอร์มาร์เก็ต' },
    { value: 'hyper', text: 'ไฮเปอร์มาร์เก็ต' },
    { value: 'cvs', text: 'ร้านสะดวกซื้อ' },
    { value: 'wholesale', text: 'ค้าส่ง / B2B' }
  ]
};

/** กลุ่มลูกค้าย่อยในสายโปรตีนสูง/โลว์คาร์บ */
export const LOWCARB_SEGMENT_FILTER = {
  id: 'segment', label: 'กลุ่มย่อย',
  options: [
    { value: 'all', text: 'ทุกกลุ่ม', selected: true },
    { value: 'builder', text: 'เพิ่มกล้าม / เพาะกาย' },
    { value: 'cutting', text: 'ลดไขมัน / คุมคาร์บ' },
    { value: 'keto', text: 'สายคีโตเคร่งครัด' },
    { value: 'metabolic', text: 'เบาหวาน / ดื้ออินซูลิน' }
  ]
};

/** ประเภทอาหารตามเกณฑ์โภชนาการ */
export const DIET_TYPE_FILTER = {
  id: 'diet', label: 'เกณฑ์เมนู',
  options: [
    { value: 'all', text: 'ทุกเมนูในสายนี้', selected: true },
    { value: 'keto', text: 'ผ่านเกณฑ์คีโต (net carb ≤ 15)' },
    { value: 'lowcarb', text: 'ผ่านเกณฑ์โลว์คาร์บ (≤ 25)' },
    { value: 'highprotein', text: 'โปรตีนสูง (≥ 40 ก.)' }
  ]
};
