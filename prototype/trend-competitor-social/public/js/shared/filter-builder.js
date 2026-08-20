/**
 * filter-builder.js — Shared filter bar generator with reactive events
 * Usage: const html = buildFilterBar(filters)
 * After inserting HTML: call onFilterChange(container, callback) to listen
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

// Common filter presets
export const PERIOD_FILTER = {
  id: 'period', label: 'ช่วงเวลา',
  options: [
    { value: 'all', text: 'ทั้งหมด (6 เดือน)', selected: true },
    { value: '3m', text: '3 เดือนล่าสุด' },
    { value: '1m', text: 'เดือนล่าสุด' },
    { value: '1w', text: 'สัปดาห์ล่าสุด' }
  ]
};

export const YEAR_FILTER = {
  id: 'year', label: 'ปี',
  options: [
    { value: '2569', text: 'พ.ศ. 2569', selected: true },
    { value: '2568', text: 'พ.ศ. 2568' },
    { value: '2567', text: 'พ.ศ. 2567' }
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

export const CATEGORY_FILTER = {
  id: 'category', label: 'หมวดหมู่',
  options: [
    { value: 'all', text: 'ทุกหมวด', selected: true },
    { value: 'bread', text: 'ขนมปัง' },
    { value: 'cake', text: 'เค้ก' },
    { value: 'cookie', text: 'คุกกี้/บิสกิต' },
    { value: 'pastry', text: 'ครัวซองต์/เพสทรี' },
    { value: 'donut', text: 'โดนัท' },
    { value: 'pie', text: 'พาย/ทาร์ต' }
  ]
};

export const CHANNEL_FILTER = {
  id: 'channel', label: 'ช่องทาง',
  options: [
    { value: 'all', text: 'ทุกช่องทาง', selected: true },
    { value: 'store', text: 'ร้านสาขา' },
    { value: 'online', text: 'ออนไลน์' },
    { value: 'mt', text: 'Modern Trade' },
    { value: 'cvs', text: 'ร้านสะดวกซื้อ' },
    { value: 'market', text: 'ตลาด/อื่นๆ' }
  ]
};

export const REGION_FILTER = {
  id: 'region', label: 'ภูมิภาค',
  options: [
    { value: 'all', text: 'ทั่วประเทศ', selected: true },
    { value: 'bkk', text: 'กรุงเทพฯ' },
    { value: 'central', text: 'ภาคกลาง' },
    { value: 'north', text: 'ภาคเหนือ' },
    { value: 'northeast', text: 'ภาคอีสาน' },
    { value: 'south', text: 'ภาคใต้' },
    { value: 'east', text: 'ภาคตะวันออก' }
  ]
};

export const COMPETITOR_FILTER = {
  id: 'competitor', label: 'คู่แข่ง',
  options: [
    { value: 'all', text: 'ทั้งหมด', selected: true },
    { value: 'snp', text: 'S&P' },
    { value: 'afteryou', text: 'After You' },
    { value: 'farmhouse', text: 'ฟาร์มเฮ้าส์' },
    { value: 'yamazaki', text: 'ยามาซากิ' },
    { value: 'lepain', text: 'เลอแปง' },
    { value: 'misterdonut', text: 'Mister Donut' }
  ]
};

export const PLATFORM_FILTER = {
  id: 'platform', label: 'แพลตฟอร์ม',
  options: [
    { value: 'all', text: 'ทั้งหมด', selected: true },
    { value: 'facebook', text: 'Facebook' },
    { value: 'instagram', text: 'Instagram' },
    { value: 'tiktok', text: 'TikTok' },
    { value: 'x', text: 'X (Twitter)' },
    { value: 'pantip', text: 'Pantip' }
  ]
};

export const STATUS_FILTER = {
  id: 'status', label: 'สถานะ',
  options: [
    { value: 'all', text: 'ทั้งหมด', selected: true },
    { value: 'critical', text: 'สำคัญ' },
    { value: 'warning', text: 'เปลี่ยนแปลง' },
    { value: 'normal', text: 'ปกติ' }
  ]
};

export const PRIORITY_FILTER = {
  id: 'priority', label: 'ระดับ',
  options: [
    { value: 'all', text: 'ทั้งหมด', selected: true },
    { value: 'urgent', text: 'เร่งด่วน' },
    { value: 'high', text: 'สำคัญ' },
    { value: 'normal', text: 'ปกติ' },
    { value: 'low', text: 'ต่ำ' }
  ]
};

export const AGE_GROUP_FILTER = {
  id: 'age', label: 'กลุ่มอายุ',
  options: [
    { value: 'all', text: 'ทุกกลุ่ม', selected: true },
    { value: 'teen', text: '13-17 ปี' },
    { value: 'young', text: '18-24 ปี' },
    { value: 'adult', text: '25-34 ปี' },
    { value: 'middle', text: '35-44 ปี' },
    { value: 'senior', text: '45+ ปี' }
  ]
};

export const INSIGHT_TYPE_FILTER = {
  id: 'type', label: 'ประเภท',
  options: [
    { value: 'all', text: 'ทั้งหมด', selected: true },
    { value: 'trend', text: 'Trend Alert' },
    { value: 'competitor', text: 'Competitor' },
    { value: 'opportunity', text: 'Opportunity' },
    { value: 'action', text: 'Action' }
  ]
};
