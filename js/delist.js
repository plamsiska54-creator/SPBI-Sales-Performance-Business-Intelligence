// ============================================================
// DELIST.JS — สินค้าเสี่ยงถูกถอดออก (Delist Risk)
// localStorage key: smDelistData
// ============================================================

var DELIST_CHANNELS = ['Moderntrade', 'Amazon', 'Booth', 'Online'];

var DELIST_CUSTOMERS = {
  'Moderntrade': ['CJ','Big C','Top','Makro','MM','Aeon','The Mall'],
  'Amazon': ['OR','COCO','RM','ร้านของฝาก','ลูกค้าทั่วไป','Black Canyon'],
  'Booth': ['ลำพยา 3 (ใหม่)','ร้านใหม่ (ปตท.คุณาวรรณ)','หน้ามอ (ม.เกษตร)','ลำพยา 3 (เก่า)','ไทวัสดุ','แก้วมณีกาญ','ลำพยา 2 (ใหม่)','ธรรมศาลา','ตลาดดิโอโซน','ปตท.ราชบุรี','ศาลายา กม.26','ลาดหลุมแก้ว','วัดเขาทำเทียม','วัดใหม่สุปดิษฐาราม','ศิลปากร','วัดดอนขนาก','ชัยพฤกษ์','นนทบุรี','โลตัส กำแพงแสน','โลตัส บางเลน'],
  'Online': ['Facebook','Line OA','Shopee','Lazada','TikTok']
};

var DELIST_REASONS = [
  'ยอดขายไม่เป็นไปตามเป้าหมาย',
  'ปัญหาคุณภาพสินค้า',
  'หมดฤดูกาล',
  'พื้นที่วางสินค้าไม่เพียงพอ',
  'ลูกค้ายกเลิกการจำหน่าย',
  'มีสินค้าใหม่มาแทน',
  'ราคาสูงกว่าคู่แข่ง',
  'กำไรไม่คุ้ม'
];

var DELIST_ACTIONS = [
  'ขอระบายสินค้า',
  'ขอจัดโปรโมชั่น',
  'ขอเปลี่ยนแพ็กเกจ',
  'ขอผลิตสติ๊กเกอร์ใหม่',
  'รอคำสั่งจากฝ่ายขาย',
  'แจ้งฝ่ายผลิต',
  'แจ้งฝ่ายจัดซื้อ',
  'แจ้งฝ่ายวางแผน'
];

var DELIST_STATUSES = [
  { id: 'pending',      label: 'รอพิจารณา',              color: '#eab308' },
  { id: 'in-progress',  label: 'อยู่ระหว่างดำเนินการ',   color: '#3b82f6' },
  { id: 'clearing',     label: 'อยู่ระหว่างระบายสินค้า', color: '#f97316' },
  { id: 'negotiating',  label: 'อยู่ระหว่างเจรจากับลูกค้า', color: '#a855f7' },
  { id: 'resolved',     label: 'แก้ไขแล้ว',              color: '#22c55e' },
  { id: 'delisted',     label: 'ถอดสินค้าแล้ว',          color: '#ef4444' }
];

var DELIST_EMAIL_TARGETS = ['ฝ่ายขาย','การตลาด','ฝ่ายผลิต','วางแผนการผลิต','จัดซื้อ','ผู้บริหาร'];

function _delistLoad() {
  try { return JSON.parse(localStorage.getItem('smDelistData')) || []; } catch(e) { return []; }
}
function _delistSave(data) {
  localStorage.setItem('smDelistData', JSON.stringify(data));
}

// ---- FORM ----
var _delistFormRendered = false;
window.renderDelistForm = function() {
  if (_delistFormRendered) return;
  _delistFormRendered = true;
  var el = document.getElementById('sm-delist-form');
  if (!el) return;

  var staffName = '', staffPos = '', staffDept = '';
  if (typeof SM_STAFF_DB !== 'undefined') {
    var user = SM_STAFF_DB[0];
    if (user) { staffName = user.name; staffPos = user.positionTh; staffDept = user.deptTh; }
  }

  var today = new Date();
  var dd = String(today.getDate()).padStart(2,'0');
  var mm = String(today.getMonth()+1).padStart(2,'0');
  var yyyy = today.getFullYear();
  var todayStr = yyyy + '-' + mm + '-' + dd;

  var html = '';
  html += '<div style="max-width:900px;margin:0 auto;padding:16px">';
  html += '<div style="text-align:center;margin-bottom:24px">';
  html += '<h2 style="color:#dc2626;margin:0;font-size:22px">⚠️ แบบฟอร์มแจ้งสินค้าเสี่ยงถูกถอดออก</h2>';
  html += '<p style="color:#64748b;margin:4px 0 0;font-size:13px">Product Delist Risk Report</p>';
  html += '</div>';

  // Section 1: ข้อมูลทั่วไป
  html += '<div class="card" style="padding:20px;margin-bottom:16px">';
  html += '<h3 style="color:#ea580c;margin:0 0 16px;font-size:15px;border-bottom:2px solid #fed7aa;padding-bottom:8px">📋 ข้อมูลทั่วไป</h3>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">';
  html += _dlField('วันที่บันทึก', '<input type="date" id="dlRecordDate" class="dl-input" value="' + todayStr + '">');
  html += _dlField('วันที่คาดว่าจะถูกถอดออก', '<input type="date" id="dlDelistDate" class="dl-input">');
  html += _dlField('ช่องทางการขาย', '<select id="dlChannel" class="dl-input" onchange="window._dlChannelChanged()"><option value="">-- เลือกช่องทาง --</option>' + DELIST_CHANNELS.map(function(c){ return '<option value="'+c+'">'+c+'</option>'; }).join('') + '</select>');
  html += _dlField('ห้าง / ลูกค้า', '<select id="dlCustomer" class="dl-input"><option value="">-- เลือกช่องทางก่อน --</option></select>');
  html += '</div></div>';

  // Section 2: ข้อมูลสินค้า
  html += '<div class="card" style="padding:20px;margin-bottom:16px">';
  html += '<h3 style="color:#ea580c;margin:0 0 16px;font-size:15px;border-bottom:2px solid #fed7aa;padding-bottom:8px">📦 ข้อมูลสินค้า</h3>';
  html += '<div style="margin-bottom:14px">';
  html += '<label style="display:block;font-size:12px;font-weight:600;color:#475569;margin-bottom:5px">ค้นหา / เลือกสินค้า</label>';
  html += '<div style="position:relative">';
  html += '<input type="text" id="dlProdSearch" class="dl-input" placeholder="พิมพ์ชื่อหรือรหัสสินค้าเพื่อค้นหา..." oninput="window._dlSearchProd(this.value)" onfocus="window._dlSearchProd(this.value)" autocomplete="off" style="padding-right:32px">';
  html += '<span style="position:absolute;right:10px;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:16px;pointer-events:none">🔍</span>';
  html += '<div id="dlProdDropdown" style="display:none;position:absolute;top:100%;left:0;right:0;max-height:250px;overflow-y:auto;background:#fff;border:1.5px solid #ea580c;border-radius:0 0 10px 10px;box-shadow:0 8px 24px rgba(0,0,0,0.12);z-index:100"></div>';
  html += '</div></div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">';
  html += _dlField('รหัสสินค้า', '<input type="text" id="dlProdCode" class="dl-input" placeholder="เลือกจากรายการด้านบน" readonly style="background:#f8fafc">');
  html += _dlField('ชื่อสินค้า', '<input type="text" id="dlProdName" class="dl-input" placeholder="เลือกจากรายการด้านบน" readonly style="background:#f8fafc">');
  html += '</div></div>';

  // Section 3: สาเหตุ
  html += '<div class="card" style="padding:20px;margin-bottom:16px">';
  html += '<h3 style="color:#ea580c;margin:0 0 16px;font-size:15px;border-bottom:2px solid #fed7aa;padding-bottom:8px">❓ สาเหตุที่มีแนวโน้มถูกถอดออก <span style="color:#94a3b8;font-weight:400;font-size:12px">(เลือกได้มากกว่า 1 ข้อ)</span></h3>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
  DELIST_REASONS.forEach(function(r, i) {
    html += '<label style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:13px;border:1px solid #e2e8f0;transition:all .2s" onmouseover="this.style.background=\'#fff7ed\'" onmouseout="this.style.background=\'\'">';
    html += '<input type="checkbox" class="dl-reason" value="' + r + '" style="accent-color:#ea580c"> ' + r + '</label>';
  });
  html += '</div>';
  html += '<div style="margin-top:10px;display:flex;align-items:center;gap:8px">';
  html += '<label style="font-size:13px;white-space:nowrap">อื่น ๆ:</label>';
  html += '<input type="text" id="dlReasonOther" class="dl-input" placeholder="ระบุสาเหตุเพิ่มเติม" style="flex:1">';
  html += '</div></div>';

  // Section 4: ข้อมูลสต็อก
  html += '<div class="card" style="padding:20px;margin-bottom:16px">';
  html += '<h3 style="color:#ea580c;margin:0 0 16px;font-size:15px;border-bottom:2px solid #fed7aa;padding-bottom:8px">📊 ข้อมูลสต็อก</h3>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px">';
  html += _dlField('สต็อกสินค้าปัจจุบัน', '<div style="display:flex;gap:8px"><input type="number" id="dlStock" class="dl-input" placeholder="0" style="flex:1"><select id="dlStockUnit" class="dl-input" style="width:100px"><option>กล่อง</option><option>ลัง</option><option>ชิ้น</option></select></div>');
  html += _dlField('สติ๊กเกอร์คงเหลือ (ดวง)', '<input type="number" id="dlSticker" class="dl-input" placeholder="0">');
  html += _dlField('คาดว่าใช้ได้อีก (วัน)', '<input type="number" id="dlDaysLeft" class="dl-input" placeholder="0">');
  html += '</div></div>';

  // Section 5: แนวทางดำเนินการ
  html += '<div class="card" style="padding:20px;margin-bottom:16px">';
  html += '<h3 style="color:#ea580c;margin:0 0 16px;font-size:15px;border-bottom:2px solid #fed7aa;padding-bottom:8px">🔧 แนวทางดำเนินการ <span style="color:#94a3b8;font-weight:400;font-size:12px">(เลือกได้มากกว่า 1 ข้อ)</span></h3>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
  DELIST_ACTIONS.forEach(function(a) {
    html += '<label style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:13px;border:1px solid #e2e8f0;transition:all .2s" onmouseover="this.style.background=\'#fff7ed\'" onmouseout="this.style.background=\'\'">';
    html += '<input type="checkbox" class="dl-action" value="' + a + '" style="accent-color:#ea580c"> ' + a + '</label>';
  });
  html += '</div>';
  html += '<div style="margin-top:10px;display:flex;align-items:center;gap:8px">';
  html += '<label style="font-size:13px;white-space:nowrap">อื่น ๆ:</label>';
  html += '<input type="text" id="dlActionOther" class="dl-input" placeholder="ระบุแนวทางเพิ่มเติม" style="flex:1">';
  html += '</div></div>';

  // Section 6: สถานะ
  html += '<div class="card" style="padding:20px;margin-bottom:16px">';
  html += '<h3 style="color:#ea580c;margin:0 0 16px;font-size:15px;border-bottom:2px solid #fed7aa;padding-bottom:8px">🏷️ สถานะการดำเนินการ</h3>';
  html += '<div style="display:flex;flex-wrap:wrap;gap:8px">';
  DELIST_STATUSES.forEach(function(s, i) {
    var checked = i === 0 ? ' checked' : '';
    html += '<label style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:20px;cursor:pointer;font-size:13px;font-weight:600;border:2px solid ' + s.color + ';color:' + s.color + ';transition:all .2s">';
    html += '<input type="radio" name="dlStatus" value="' + s.id + '"' + checked + ' style="accent-color:' + s.color + '"> ' + s.label + '</label>';
  });
  html += '</div></div>';

  // Section 7: หมายเหตุ
  html += '<div class="card" style="padding:20px;margin-bottom:16px">';
  html += '<h3 style="color:#ea580c;margin:0 0 16px;font-size:15px;border-bottom:2px solid #fed7aa;padding-bottom:8px">📝 หมายเหตุ</h3>';
  html += '<textarea id="dlNotes" class="dl-input" rows="4" placeholder="หมายเหตุเพิ่มเติม..." style="resize:vertical"></textarea>';
  html += '</div>';

  // Section 8: เอกสารแนบ
  html += '<div class="card" style="padding:20px;margin-bottom:16px">';
  html += '<h3 style="color:#ea580c;margin:0 0 16px;font-size:15px;border-bottom:2px solid #fed7aa;padding-bottom:8px">📎 เอกสารแนบ</h3>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">';
  var attachTypes = ['รูปสินค้า','รูปชั้นวาง','หนังสือแจ้งจากลูกค้า','อื่นๆ'];
  attachTypes.forEach(function(t) {
    html += '<div style="border:2px dashed #cbd5e1;border-radius:10px;padding:14px;text-align:center;cursor:pointer;transition:all .2s" onclick="this.querySelector(\'input\').click()" onmouseover="this.style.borderColor=\'#ea580c\';this.style.background=\'#fff7ed\'" onmouseout="this.style.borderColor=\'#cbd5e1\';this.style.background=\'\'">';
    html += '<div style="font-size:24px;margin-bottom:4px">📎</div>';
    html += '<div style="font-size:12px;color:#64748b">' + t + '</div>';
    html += '<input type="file" class="dl-attach" data-type="' + t + '" accept="image/*,.pdf,.doc,.docx" style="display:none" multiple onchange="window._dlFileSelected(this)">';
    html += '<div class="dl-file-names" style="font-size:11px;color:#22c55e;margin-top:4px"></div>';
    html += '</div>';
  });
  html += '</div></div>';

  // Section 9: ผู้บันทึก
  html += '<div class="card" style="padding:20px;margin-bottom:16px">';
  html += '<h3 style="color:#ea580c;margin:0 0 16px;font-size:15px;border-bottom:2px solid #fed7aa;padding-bottom:8px">👤 ผู้บันทึก</h3>';
  var staffOpts = '<option value="">-- เลือกผู้บันทึก --</option>';
  if (typeof SM_STAFF_DB !== 'undefined') {
    SM_STAFF_DB.forEach(function(s) {
      var displayName = s.name.replace(/^(นาย|นางสาว|นาง)/, '');
      staffOpts += '<option value="' + s.empId + '">' + displayName + ' (' + s.nick + ')</option>';
    });
  }
  html += _dlField('ชื่อผู้บันทึก', '<select id="dlReporter" class="dl-input" onchange="window._dlReporterChanged()">' + staffOpts + '</select>');
  html += '</div>';

  // Buttons
  html += '<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:20px;margin-bottom:32px">';
  html += '<button onclick="window._dlSave()" style="background:#22c55e;color:#fff;border:none;padding:12px 28px;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(34,197,94,0.3);transition:all .2s" onmouseover="this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.transform=\'\'">🟢 บันทึกข้อมูล</button>';
  html += '<p style="font-size:12px;color:#94a3b8;margin-top:8px;text-align:center">💡 บันทึกเสร็จแล้ว ไปที่แท็บ "รายการทั้งหมด" เพื่อส่ง E-mail / LINE แจ้งเตือน</p>';
  html += '</div>';

  html += '</div>'; // max-width container

  // CSS
  html += '<style>';
  html += '.dl-input{width:100%;padding:9px 12px;border:1.5px solid #cbd5e1;border-radius:8px;font-size:13px;font-family:inherit;outline:none;transition:border .2s,box-shadow .2s;box-sizing:border-box}';
  html += '.dl-input:focus{border-color:#ea580c;box-shadow:0 0 0 3px rgba(234,88,12,0.1)}';
  html += 'select.dl-input{cursor:pointer;background:#fff}';
  html += '</style>';

  el.innerHTML = html;
};

function _dlField(label, inputHtml) {
  return '<div><label style="display:block;font-size:12px;font-weight:600;color:#475569;margin-bottom:5px">' + label + '</label>' + inputHtml + '</div>';
}

window._dlChannelChanged = function() {
  var ch = document.getElementById('dlChannel').value;
  var sel = document.getElementById('dlCustomer');
  var custs = DELIST_CUSTOMERS[ch] || [];
  sel.innerHTML = '<option value="">-- เลือกลูกค้า --</option>' + custs.map(function(c){ return '<option value="'+c+'">'+c+'</option>'; }).join('');
  var s = document.getElementById('dlProdSearch'); if (s) s.value = '';
  var c = document.getElementById('dlProdCode'); if (c) c.value = '';
  var n = document.getElementById('dlProdName'); if (n) n.value = '';
};

window._dlReporterChanged = function() {
  var sel = document.getElementById('dlReporter');
  if (!sel || !sel.value || typeof SM_STAFF_DB === 'undefined') return;
  var staff = SM_STAFF_DB.find(function(s){ return s.empId === sel.value; });
  if (!staff) return;
};

// ---- Product Search ----
var _dlProdCustomerMap = {
  'CJ': 'CJ', 'Big C': 'Big C', 'Top': 'Top', 'Makro': 'Makro',
  'Aeon': 'Aeon', 'The Mall': 'The Mall', 'Amazon': 'Amazon',
  'Black Canyon': 'BCY', 'OR': 'Amazon', 'COCO': 'Amazon',
  'RM': 'Amazon', 'ร้านของฝาก': 'Amazon', 'ลูกค้าทั่วไป': 'Amazon',
  'Facebook': 'Online', 'Line OA': 'Online', 'Shopee': 'Online',
  'Lazada': 'Online', 'TikTok': 'Online'
};

function _dlGetProducts() {
  if (typeof PRODUCTS === 'undefined') return [];
  var customer = (document.getElementById('dlCustomer') || {}).value || '';
  var prodKey = _dlProdCustomerMap[customer] || '';

  if (prodKey && PRODUCTS[prodKey]) return PRODUCTS[prodKey];

  var all = [];
  Object.keys(PRODUCTS).forEach(function(k) {
    PRODUCTS[k].forEach(function(p) {
      if (!all.some(function(a){ return a.code === p.code; })) all.push(p);
    });
  });
  return all;
}

window._dlSearchProd = function(query) {
  var dropdown = document.getElementById('dlProdDropdown');
  if (!dropdown) return;

  var products = _dlGetProducts();
  var q = (query || '').toLowerCase().trim();

  var filtered = products;
  if (q) {
    filtered = products.filter(function(p) {
      return p.code.toLowerCase().indexOf(q) >= 0 || p.name.toLowerCase().indexOf(q) >= 0;
    });
  }

  if (filtered.length === 0) {
    dropdown.innerHTML = '<div style="padding:12px;text-align:center;color:#94a3b8;font-size:13px">ไม่พบสินค้า</div>';
    dropdown.style.display = 'block';
    return;
  }

  var html = '';
  filtered.slice(0, 50).forEach(function(p) {
    var statusBadge = p.status === 'active'
      ? '<span style="background:#dcfce7;color:#166534;padding:1px 6px;border-radius:4px;font-size:10px;margin-left:6px">Active</span>'
      : '<span style="background:#fee2e2;color:#991b1b;padding:1px 6px;border-radius:4px;font-size:10px;margin-left:6px">Discontinued</span>';
    html += '<div class="dl-prod-option" onclick="window._dlSelectProd(\'' + p.code.replace(/'/g,"\\'") + '\')" style="padding:10px 14px;cursor:pointer;border-bottom:1px solid #f1f5f9;transition:background .15s;display:flex;align-items:center;gap:8px" onmouseover="this.style.background=\'#fff7ed\'" onmouseout="this.style.background=\'\'">';
    html += '<span style="font-family:monospace;color:#ea580c;font-weight:600;font-size:12px;min-width:80px">' + p.code + '</span>';
    html += '<span style="font-size:13px;color:#1e293b;flex:1">' + p.name + '</span>';
    html += statusBadge;
    html += '</div>';
  });
  if (filtered.length > 50) {
    html += '<div style="padding:8px;text-align:center;color:#94a3b8;font-size:11px">แสดง 50/' + filtered.length + ' รายการ — พิมพ์เพิ่มเพื่อกรองผล</div>';
  }
  dropdown.innerHTML = html;
  dropdown.style.display = 'block';
};

window._dlSelectProd = function(code) {
  var products = _dlGetProducts();
  var found = products.find(function(p){ return p.code === code; });
  if (!found) return;
  document.getElementById('dlProdCode').value = found.code;
  document.getElementById('dlProdName').value = found.name;
  document.getElementById('dlProdSearch').value = found.code + ' — ' + found.name;
  document.getElementById('dlProdDropdown').style.display = 'none';
};

document.addEventListener('click', function(e) {
  var dropdown = document.getElementById('dlProdDropdown');
  var search = document.getElementById('dlProdSearch');
  if (dropdown && search && !search.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});

window._dlFileSelected = function(input) {
  var names = [];
  for (var i = 0; i < input.files.length; i++) names.push(input.files[i].name);
  var container = input.parentElement.querySelector('.dl-file-names');
  if (container) container.textContent = names.join(', ');
};

function _dlCollect() {
  var reasons = [];
  document.querySelectorAll('.dl-reason:checked').forEach(function(cb){ reasons.push(cb.value); });
  var otherReason = (document.getElementById('dlReasonOther') || {}).value;
  if (otherReason) reasons.push('อื่นๆ: ' + otherReason);

  var actions = [];
  document.querySelectorAll('.dl-action:checked').forEach(function(cb){ actions.push(cb.value); });
  var otherAction = (document.getElementById('dlActionOther') || {}).value;
  if (otherAction) actions.push('อื่นๆ: ' + otherAction);

  var statusEl = document.querySelector('input[name="dlStatus"]:checked');

  return {
    id: Date.now(),
    recordDate: (document.getElementById('dlRecordDate') || {}).value || '',
    delistDate: (document.getElementById('dlDelistDate') || {}).value || '',
    channel: (document.getElementById('dlChannel') || {}).value || '',
    customer: (document.getElementById('dlCustomer') || {}).value || '',
    prodCode: (document.getElementById('dlProdCode') || {}).value || '',
    prodName: (document.getElementById('dlProdName') || {}).value || '',
    reasons: reasons,
    stock: (document.getElementById('dlStock') || {}).value || '0',
    stockUnit: (document.getElementById('dlStockUnit') || {}).value || 'กล่อง',
    sticker: (document.getElementById('dlSticker') || {}).value || '0',
    daysLeft: (document.getElementById('dlDaysLeft') || {}).value || '0',
    actions: actions,
    status: statusEl ? statusEl.value : 'pending',
    notes: (document.getElementById('dlNotes') || {}).value || '',
    reporter: (function(){ var s = document.getElementById('dlReporter'); return s ? s.options[s.selectedIndex].text : ''; })(),
    reporterEmpId: (document.getElementById('dlReporter') || {}).value || ''
  };
}

function _dlValidate(d) {
  if (!d.channel) return 'กรุณาเลือกช่องทางการขาย';
  if (!d.customer) return 'กรุณาเลือกห้าง / ลูกค้า';
  if (!d.prodCode && !d.prodName) return 'กรุณากรอกรหัสหรือชื่อสินค้า';
  if (d.reasons.length === 0) return 'กรุณาเลือกสาเหตุอย่างน้อย 1 ข้อ';
  return null;
}

window._dlSave = function() {
  var d = _dlCollect();
  var err = _dlValidate(d);
  if (err) { alert('⚠️ ' + err); return; }

  var data = _delistLoad();
  data.unshift(d);
  _delistSave(data);

  _delistListRendered = false;
  _delistDashRendered = false;

  alert('✅ บันทึกข้อมูลสำเร็จ\n\nสินค้า: ' + d.prodName + '\nช่องทาง: ' + d.channel + ' — ' + d.customer);
  _dlResetForm();
};

function _dlResetForm() {
  var fields = ['dlDelistDate','dlProdSearch','dlProdCode','dlProdName','dlReasonOther','dlStock','dlSticker','dlDaysLeft','dlActionOther','dlNotes'];
  fields.forEach(function(id) { var el = document.getElementById(id); if (el) el.value = ''; });
  document.querySelectorAll('.dl-reason:checked, .dl-action:checked').forEach(function(cb){ cb.checked = false; });
  var firstStatus = document.querySelector('input[name="dlStatus"]');
  if (firstStatus) firstStatus.checked = true;
  document.querySelectorAll('.dl-file-names').forEach(function(el){ el.textContent = ''; });
  var rep = document.getElementById('dlReporter'); if (rep) rep.selectedIndex = 0;
}

function _dlFormatMsg(d) {
  var statusLabel = '';
  DELIST_STATUSES.forEach(function(s){ if (s.id === d.status) statusLabel = s.label; });
  var msg = '🔴 แจ้งเตือนสินค้าเสี่ยงถูกถอดออก\n';
  msg += '━━━━━━━━━━━━━━━━━━━━\n';
  msg += '📅 วันที่บันทึก: ' + _dlFormatDate(d.recordDate) + '\n';
  msg += '📅 คาดถอดออก: ' + _dlFormatDate(d.delistDate) + '\n';
  msg += '🏪 ช่องทาง: ' + d.channel + '\n';
  msg += '👤 ลูกค้า: ' + d.customer + '\n';
  msg += '🔖 รหัสสินค้า: ' + d.prodCode + '\n';
  msg += '📦 สินค้า: ' + d.prodName + '\n\n';
  msg += '❓ เหตุผล:\n';
  d.reasons.forEach(function(r){ msg += '  • ' + r + '\n'; });
  msg += '\n📊 สต็อก:\n';
  msg += '  สต็อกสินค้า: ' + Number(d.stock).toLocaleString() + ' ' + d.stockUnit + '\n';
  msg += '  สติ๊กเกอร์คงเหลือ: ' + Number(d.sticker).toLocaleString() + ' ดวง\n';
  msg += '  คาดว่าใช้ได้อีก: ' + d.daysLeft + ' วัน\n\n';
  if (d.actions.length) {
    msg += '🔧 แนวทาง:\n';
    d.actions.forEach(function(a){ msg += '  • ' + a + '\n'; });
    msg += '\n';
  }
  msg += '🏷️ สถานะ: ' + statusLabel + '\n';
  if (d.notes) msg += '📝 หมายเหตุ: ' + d.notes + '\n';
  msg += '👤 ผู้บันทึก: ' + d.reporter + '\n';
  msg += '━━━━━━━━━━━━━━━━━━━━';
  return msg;
}

var DELIST_EMAIL_RECIPIENTS = [
  'sathidpong.w@wanwanach.com',
  'panuwat.w@wanwanach.com',
  'palm.b@wanwanach.com',
  'gm.manager@wanwanach.com',
  'secretary@wanwanach.com',
  'sales.manager@wanwanach.com',
  'sale.analysis@wanwanach.com'
];

window._dlSendEmail = function() {
  var d = _dlCollect();
  var err = _dlValidate(d);
  if (err) { alert('⚠️ กรุณากรอกข้อมูลให้ครบก่อนส่ง\n' + err); return; }

  var subject = '⚠️ แจ้งเตือนสินค้าเสี่ยงถูกถอดออก — ' + d.prodName + ' (' + d.customer + ')';
  var body = _dlFormatMsg(d);
  var to = DELIST_EMAIL_RECIPIENTS.join(',');

  var mailUrl = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  window.open(mailUrl, '_blank');

  alert('📧 เปิดหน้าต่าง E-mail แล้ว\n\nส่งไปยัง:\n' + DELIST_EMAIL_RECIPIENTS.join('\n'));
};

window._dlSendLine = function() {
  var d = _dlCollect();
  var err = _dlValidate(d);
  if (err) { alert('⚠️ กรุณากรอกข้อมูลให้ครบก่อนส่ง\n' + err); return; }

  var msg = _dlFormatMsg(d);
  var token = localStorage.getItem('lineNotifyToken');
  if (!token) {
    var t = prompt('กรุณาใส่ LINE Notify Token\n\n(ขอ Token ได้ที่ https://notify-bot.line.me/)\n1. เข้าสู่ระบบด้วย LINE\n2. กด "Generate token"\n3. ตั้งชื่อ เช่น "Sales Dashboard"\n4. เลือกกลุ่มที่ต้องการส่ง\n5. คัดลอก Token มาวางที่นี่');
    if (!t) return;
    localStorage.setItem('lineNotifyToken', t.trim());
    token = t.trim();
  }
  fetch('/api/line-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: token, message: '\n' + msg })
  }).then(function(res){ return res.json(); })
    .then(function(result){
      if (result.status === 200) {
        alert('✅ ส่งแจ้งเตือน LINE สำเร็จ!');
      } else if (result.status === 401) {
        localStorage.removeItem('lineNotifyToken');
        alert('❌ Token ไม่ถูกต้องหรือหมดอายุ\nกรุณากด LINE อีกครั้งเพื่อใส่ Token ใหม่');
      } else {
        alert('❌ ส่ง LINE ไม่สำเร็จ: ' + (result.message || 'Unknown error'));
      }
    }).catch(function(err){
      alert('❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์\n' + err.message);
    });
};

function _dlFormatDate(dateStr) {
  if (!dateStr) return '-';
  var parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  var beYear = parseInt(parts[0]) + 543;
  return parts[2] + '/' + parts[1] + '/' + beYear;
}

// ---- LIST ----
var _delistListRendered = false;
var _dlListFilter = 'all'; // all, day, month, year
var _dlListDateFrom = '';
var _dlListDateTo = '';
var _dlListMonth = '';
var _dlListYear = '';

function _dlFilteredList() {
  var data = _delistLoad();
  if (_dlListFilter === 'day' && _dlListDateFrom) {
    data = data.filter(function(d) {
      if (!d.recordDate) return false;
      if (_dlListDateTo) return d.recordDate >= _dlListDateFrom && d.recordDate <= _dlListDateTo;
      return d.recordDate === _dlListDateFrom;
    });
  } else if (_dlListFilter === 'month' && _dlListMonth) {
    data = data.filter(function(d) { return d.recordDate && d.recordDate.substring(0, 7) === _dlListMonth; });
  } else if (_dlListFilter === 'year' && _dlListYear) {
    data = data.filter(function(d) { return d.recordDate && d.recordDate.substring(0, 4) === _dlListYear; });
  }
  return data;
}

window.renderDelistList = function() {
  _delistListRendered = true;
  var el = document.getElementById('sm-delist-list');
  if (!el) return;

  var allData = _delistLoad();
  var data = _dlFilteredList();

  var html = '<div style="max-width:1200px;margin:0 auto;padding:16px">';
  html += '<h2 style="text-align:center;color:#dc2626;margin:0 0 16px;font-size:20px">📋 รายการสินค้าเสี่ยงถูกถอดออก</h2>';

  // Filter bar
  html += '<div class="card" style="padding:14px 16px;margin-bottom:16px;display:flex;flex-wrap:wrap;align-items:center;gap:10px">';
  html += '<span style="font-size:13px;font-weight:600;color:#475569">📅 ช่วงเวลา:</span>';
  var filters = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'day', label: 'รายวัน' },
    { id: 'month', label: 'รายเดือน' },
    { id: 'year', label: 'รายปี' }
  ];
  filters.forEach(function(f) {
    var active = _dlListFilter === f.id;
    html += '<button onclick="window._dlSetListFilter(\'' + f.id + '\')" style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid ' + (active ? '#ea580c' : '#cbd5e1') + ';background:' + (active ? '#ea580c' : '#fff') + ';color:' + (active ? '#fff' : '#475569') + ';transition:all .2s">' + f.label + '</button>';
  });

  if (_dlListFilter === 'day') {
    html += '<input type="date" id="dlFilterFrom" class="dl-input" style="width:150px;padding:5px 8px;font-size:12px" value="' + _dlListDateFrom + '" onchange="window._dlListDateFrom=this.value;renderDelistList()">';
    html += '<span style="font-size:12px;color:#94a3b8">ถึง</span>';
    html += '<input type="date" id="dlFilterTo" class="dl-input" style="width:150px;padding:5px 8px;font-size:12px" value="' + _dlListDateTo + '" onchange="window._dlListDateTo=this.value;renderDelistList()">';
  } else if (_dlListFilter === 'month') {
    html += '<input type="month" id="dlFilterMonth" class="dl-input" style="width:170px;padding:5px 8px;font-size:12px" value="' + _dlListMonth + '" onchange="window._dlListMonth=this.value;renderDelistList()">';
  } else if (_dlListFilter === 'year') {
    html += '<select id="dlFilterYear" class="dl-input" style="width:120px;padding:5px 8px;font-size:12px" onchange="window._dlListYear=this.value;renderDelistList()">';
    html += '<option value="">-- ปี --</option>';
    var years = {};
    allData.forEach(function(d) { if (d.recordDate) years[d.recordDate.substring(0, 4)] = true; });
    Object.keys(years).sort().reverse().forEach(function(y) {
      html += '<option value="' + y + '"' + (y === _dlListYear ? ' selected' : '') + '>' + (parseInt(y) + 543) + ' (' + y + ')</option>';
    });
    html += '</select>';
  }

  html += '<span style="margin-left:auto;font-size:12px;color:#64748b">แสดง <strong>' + data.length + '</strong> / ' + allData.length + ' รายการ</span>';
  html += '</div>';

  // Export bar
  html += '<div style="display:flex;gap:8px;margin-bottom:12px;justify-content:flex-end;flex-wrap:wrap">';
  html += '<button onclick="window._dlExportExcel()" style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid #22c55e;background:#f0fdf4;color:#166534;transition:all .2s" onmouseover="this.style.background=\'#22c55e\';this.style.color=\'#fff\'" onmouseout="this.style.background=\'#f0fdf4\';this.style.color=\'#166534\'">📊 Excel (.xlsx)</button>';
  html += '<button onclick="window._dlExportPDF()" style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid #ef4444;background:#fef2f2;color:#991b1b;transition:all .2s" onmouseover="this.style.background=\'#ef4444\';this.style.color=\'#fff\'" onmouseout="this.style.background=\'#fef2f2\';this.style.color=\'#991b1b\'">📄 PDF</button>';
  html += '<button onclick="window._dlExportImage()" style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid #3b82f6;background:#eff6ff;color:#1e40af;transition:all .2s" onmouseover="this.style.background=\'#3b82f6\';this.style.color=\'#fff\'" onmouseout="this.style.background=\'#eff6ff\';this.style.color=\'#1e40af\'">🖼️ รูปภาพ (.png)</button>';
  html += '</div>';

  if (data.length === 0) {
    html += '<div class="card" style="padding:40px;text-align:center;color:#94a3b8">';
    html += '<div style="font-size:48px;margin-bottom:12px">📭</div>';
    html += '<div style="font-size:16px">ยังไม่มีรายการ' + (_dlListFilter !== 'all' ? 'ในช่วงเวลาที่เลือก' : '') + '</div>';
    html += '</div>';
  } else {
    html += '<div id="dlListTableWrap" style="overflow-x:auto">';
    html += '<table id="dlListTable" style="width:100%;border-collapse:collapse;font-size:12px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">';
    html += '<thead><tr style="background:#1e293b;color:#fff">';
    html += '<th style="padding:10px 8px;text-align:left">วันที่</th>';
    html += '<th style="padding:10px 8px;text-align:left">ช่องทาง</th>';
    html += '<th style="padding:10px 8px;text-align:left">ลูกค้า</th>';
    html += '<th style="padding:10px 8px;text-align:left">รหัส</th>';
    html += '<th style="padding:10px 8px;text-align:left">สินค้า</th>';
    html += '<th style="padding:10px 8px;text-align:left">สาเหตุ</th>';
    html += '<th style="padding:10px 8px;text-align:right">สต็อก</th>';
    html += '<th style="padding:10px 8px;text-align:center">สถานะ</th>';
    html += '<th style="padding:10px 8px;text-align:center">แจ้งเตือน</th>';
    html += '<th style="padding:10px 8px;text-align:center">จัดการ</th>';
    html += '</tr></thead><tbody>';

    data.forEach(function(d, idx) {
      var statusObj = DELIST_STATUSES.find(function(s){ return s.id === d.status; }) || DELIST_STATUSES[0];
      var bg = idx % 2 === 0 ? '#fff' : '#f8fafc';
      html += '<tr style="background:' + bg + ';border-bottom:1px solid #f1f5f9">';
      html += '<td style="padding:8px;white-space:nowrap">' + _dlFormatDate(d.recordDate) + '</td>';
      html += '<td style="padding:8px">' + (d.channel || '-') + '</td>';
      html += '<td style="padding:8px">' + (d.customer || '-') + '</td>';
      html += '<td style="padding:8px;font-family:monospace">' + (d.prodCode || '-') + '</td>';
      html += '<td style="padding:8px;font-weight:600">' + (d.prodName || '-') + '</td>';
      html += '<td style="padding:8px;max-width:180px"><div style="display:flex;flex-wrap:wrap;gap:3px">';
      (d.reasons || []).forEach(function(r) {
        html += '<span style="background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:4px;font-size:10px">' + r + '</span>';
      });
      html += '</div></td>';
      html += '<td style="padding:8px;text-align:right;white-space:nowrap">' + Number(d.stock || 0).toLocaleString() + ' ' + (d.stockUnit || '') + '</td>';
      html += '<td style="padding:8px;text-align:center"><span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;color:#fff;background:' + statusObj.color + '">' + statusObj.label + '</span></td>';

      // Send buttons
      html += '<td style="padding:8px;text-align:center;white-space:nowrap">';
      if (d.emailSent) {
        html += '<span style="font-size:10px;color:#22c55e;font-weight:600">✅ ส่ง Email แล้ว</span>';
      } else {
        html += '<button onclick="window._dlSendEmailById(' + d.id + ')" style="background:#3b82f6;color:#fff;border:none;padding:3px 8px;border-radius:6px;cursor:pointer;font-size:10px;font-weight:600" title="ส่ง E-mail">📧 Email</button>';
      }
      html += '<br>';
      if (d.lineSent) {
        html += '<span style="font-size:10px;color:#22c55e;font-weight:600">✅ ส่ง LINE แล้ว</span>';
      } else {
        html += '<button onclick="window._dlSendLineById(' + d.id + ')" style="background:#06c755;color:#fff;border:none;padding:3px 8px;border-radius:6px;cursor:pointer;font-size:10px;font-weight:600" title="ส่ง LINE">💬 LINE</button>';
      }
      if (d.emailSent || d.lineSent) {
        html += '<br><button onclick="window._dlResetSent(' + d.id + ')" style="background:#f59e0b;color:#fff;border:none;padding:2px 8px;border-radius:6px;cursor:pointer;font-size:9px;font-weight:600;margin-top:3px" title="รีเฟรชสถานะเพื่อส่งใหม่">🔄 รีเฟรช</button>';
      }
      html += '</td>';

      // Manage
      html += '<td style="padding:8px;text-align:center">';
      html += '<select onchange="window._dlChangeStatus(' + d.id + ',this.value)" style="font-size:11px;padding:3px 6px;border:1px solid #cbd5e1;border-radius:6px;cursor:pointer">';
      DELIST_STATUSES.forEach(function(s) {
        html += '<option value="' + s.id + '"' + (s.id === d.status ? ' selected' : '') + '>' + s.label + '</option>';
      });
      html += '</select>';
      html += ' <button onclick="window._dlDelete(' + d.id + ')" style="background:#ef4444;color:#fff;border:none;padding:3px 8px;border-radius:6px;cursor:pointer;font-size:11px;margin-left:4px" title="ลบ">🗑️</button>';
      html += '</td></tr>';
    });
    html += '</tbody></table></div>';
  }
  html += '</div>';
  el.innerHTML = html;
};

window._dlSetListFilter = function(f) {
  _dlListFilter = f;
  _dlListDateFrom = ''; _dlListDateTo = ''; _dlListMonth = ''; _dlListYear = '';
  renderDelistList();
};

window._dlChangeStatus = function(id, newStatus) {
  var data = _delistLoad();
  data.forEach(function(d) { if (d.id === id) d.status = newStatus; });
  _delistSave(data);
  _delistDashRendered = false;
  renderDelistList();
};

window._dlDelete = function(id) {
  if (!confirm('ต้องการลบรายการนี้?')) return;
  var data = _delistLoad().filter(function(d){ return d.id !== id; });
  _delistSave(data);
  _delistDashRendered = false;
  renderDelistList();
};

// Send email/LINE from list by ID
window._dlSendEmailById = function(id) {
  var data = _delistLoad();
  var d = data.find(function(item){ return item.id === id; });
  if (!d) return;
  var subject = '⚠️ แจ้งเตือนสินค้าเสี่ยงถูกถอดออก — ' + d.prodName + ' (' + d.customer + ')';
  var body = _dlFormatMsg(d);
  var to = DELIST_EMAIL_RECIPIENTS.join(',');
  var mailUrl = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  window.open(mailUrl, '_blank');
  d.emailSent = true;
  _delistSave(data);
  renderDelistList();
};

window._dlSendLineById = function(id) {
  var data = _delistLoad();
  var d = data.find(function(item){ return item.id === id; });
  if (!d) return;
  var msg = _dlFormatMsg(d);
  var token = localStorage.getItem('lineNotifyToken');
  if (!token) {
    var t = prompt('กรุณาใส่ LINE Notify Token\n\n(ขอ Token ได้ที่ https://notify-bot.line.me/)\n1. เข้าสู่ระบบด้วย LINE\n2. กด "Generate token"\n3. ตั้งชื่อ เช่น "Sales Dashboard"\n4. เลือกกลุ่มที่ต้องการส่ง\n5. คัดลอก Token มาวางที่นี่');
    if (!t) return;
    localStorage.setItem('lineNotifyToken', t.trim());
    token = t.trim();
  }
  fetch('/api/line-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: token, message: '\n' + msg })
  }).then(function(res){ return res.json(); })
    .then(function(result){
      if (result.status === 200) {
        d.lineSent = true;
        _delistSave(data);
        renderDelistList();
        alert('✅ ส่งแจ้งเตือน LINE สำเร็จ!');
      } else if (result.status === 401) {
        localStorage.removeItem('lineNotifyToken');
        alert('❌ Token ไม่ถูกต้องหรือหมดอายุ\nกรุณากด LINE อีกครั้งเพื่อใส่ Token ใหม่');
      } else {
        alert('❌ ส่ง LINE ไม่สำเร็จ: ' + (result.message || 'Unknown error'));
      }
    }).catch(function(err){
      alert('❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์\n' + err.message);
    });
};

window._dlResetSent = function(id) {
  var data = _delistLoad();
  var d = data.find(function(item){ return item.id === id; });
  if (!d) return;
  d.emailSent = false;
  d.lineSent = false;
  _delistSave(data);
  renderDelistList();
};

// ---- EXPORT ----
window._dlExportExcel = function() {
  var data = _dlFilteredList();
  if (data.length === 0) { alert('ไม่มีข้อมูลสำหรับดาวน์โหลด'); return; }

  var csv = '﻿'; // BOM for Excel Thai
  csv += 'วันที่บันทึก,วันที่คาดถอด,ช่องทาง,ลูกค้า,รหัสสินค้า,ชื่อสินค้า,สาเหตุ,สต็อก,หน่วย,สติ๊กเกอร์,ใช้ได้อีก(วัน),แนวทาง,สถานะ,ผู้บันทึก,ส่งEmail,ส่งLINE\n';
  data.forEach(function(d) {
    var statusLabel = '';
    DELIST_STATUSES.forEach(function(s){ if (s.id === d.status) statusLabel = s.label; });
    csv += [
      _dlFormatDate(d.recordDate),
      _dlFormatDate(d.delistDate),
      d.channel,
      d.customer,
      d.prodCode,
      '"' + (d.prodName || '').replace(/"/g, '""') + '"',
      '"' + (d.reasons || []).join(', ').replace(/"/g, '""') + '"',
      d.stock,
      d.stockUnit,
      d.sticker,
      d.daysLeft,
      '"' + (d.actions || []).join(', ').replace(/"/g, '""') + '"',
      statusLabel,
      '"' + (d.reporter || '').replace(/"/g, '""') + '"',
      d.emailSent ? 'ส่งแล้ว' : '-',
      d.lineSent ? 'ส่งแล้ว' : '-'
    ].join(',') + '\n';
  });

  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'รายการสินค้าเสี่ยงถอด_' + new Date().toISOString().slice(0, 10) + '.csv';
  link.click();
  URL.revokeObjectURL(link.href);
};

window._dlExportPDF = function() {
  var tableWrap = document.getElementById('dlListTableWrap');
  if (!tableWrap) { alert('ไม่มีตารางสำหรับดาวน์โหลด'); return; }
  var printWin = window.open('', '_blank');
  printWin.document.write('<html><head><title>รายการสินค้าเสี่ยงถูกถอดออก</title>');
  printWin.document.write('<style>body{font-family:sans-serif;padding:20px}h1{color:#dc2626;font-size:18px;text-align:center}table{width:100%;border-collapse:collapse;font-size:11px}th{background:#1e293b;color:#fff;padding:8px 6px;text-align:left}td{padding:6px;border-bottom:1px solid #e2e8f0}tr:nth-child(even){background:#f8fafc}@media print{body{padding:0}}</style>');
  printWin.document.write('</head><body>');
  printWin.document.write('<h1>📋 รายการสินค้าเสี่ยงถูกถอดออก</h1>');
  printWin.document.write('<p style="text-align:center;color:#64748b;font-size:12px">พิมพ์เมื่อ: ' + new Date().toLocaleDateString('th-TH') + '</p>');
  printWin.document.write(tableWrap.innerHTML);
  printWin.document.write('</body></html>');
  printWin.document.close();
  setTimeout(function() { printWin.print(); }, 500);
};

window._dlExportImage = function() {
  var tableWrap = document.getElementById('dlListTableWrap');
  if (!tableWrap) { alert('ไม่มีตารางสำหรับดาวน์โหลด'); return; }
  if (typeof html2canvas === 'undefined') {
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload = function() { _dlCaptureTable(); };
    script.onerror = function() {
      _dlExportPDF();
      alert('ใช้ PDF แทน (ไม่สามารถโหลด html2canvas)');
    };
    document.head.appendChild(script);
  } else {
    _dlCaptureTable();
  }
};

function _dlCaptureTable() {
  var tableWrap = document.getElementById('dlListTableWrap');
  if (!tableWrap) return;
  html2canvas(tableWrap, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then(function(canvas) {
    var link = document.createElement('a');
    link.download = 'รายการสินค้าเสี่ยงถอด_' + new Date().toISOString().slice(0, 10) + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

// ---- DASHBOARD ----
var _delistDashRendered = false;
window.renderDelistDash = function() {
  _delistDashRendered = true;
  var el = document.getElementById('sm-delist-dash');
  if (!el) return;

  var data = _delistLoad();

  var html = '<div style="max-width:1100px;margin:0 auto;padding:16px">';
  html += '<h2 style="text-align:center;color:#dc2626;margin:0 0 20px;font-size:20px">📊 Dashboard สินค้าเสี่ยงถูกถอดออก</h2>';

  // Status summary cards
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:20px">';
  DELIST_STATUSES.forEach(function(s) {
    var count = data.filter(function(d){ return d.status === s.id; }).length;
    html += '<div class="card" style="padding:16px;text-align:center;border-left:4px solid ' + s.color + '">';
    html += '<div style="font-size:28px;font-weight:800;color:' + s.color + '">' + count + '</div>';
    html += '<div style="font-size:12px;color:#64748b;margin-top:4px">' + s.label + '</div>';
    html += '</div>';
  });
  html += '</div>';

  if (data.length === 0) {
    html += '<div class="card" style="padding:40px;text-align:center;color:#94a3b8">';
    html += '<div style="font-size:48px;margin-bottom:12px">📊</div>';
    html += '<div style="font-size:14px">ยังไม่มีข้อมูลสำหรับสร้าง Dashboard</div>';
    html += '</div></div>';
    el.innerHTML = html;
    return;
  }

  // By channel
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">';
  html += '<div class="card" style="padding:20px">';
  html += '<h3 style="margin:0 0 12px;font-size:14px;color:#1e293b">📊 จำนวนตามช่องทาง</h3>';
  var byCh = {};
  data.forEach(function(d) { byCh[d.channel] = (byCh[d.channel] || 0) + 1; });
  Object.keys(byCh).sort(function(a,b){ return byCh[b]-byCh[a]; }).forEach(function(ch) {
    var pct = Math.round(byCh[ch] / data.length * 100);
    html += '<div style="margin-bottom:8px">';
    html += '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span>' + ch + '</span><span style="font-weight:700">' + byCh[ch] + ' รายการ (' + pct + '%)</span></div>';
    html += '<div style="background:#f1f5f9;border-radius:4px;height:8px;overflow:hidden"><div style="background:#ea580c;height:100%;width:' + pct + '%;border-radius:4px;transition:width .5s"></div></div>';
    html += '</div>';
  });
  html += '</div>';

  // By reason
  html += '<div class="card" style="padding:20px">';
  html += '<h3 style="margin:0 0 12px;font-size:14px;color:#1e293b">❓ สาเหตุที่พบบ่อย</h3>';
  var byReason = {};
  data.forEach(function(d) { (d.reasons || []).forEach(function(r){ byReason[r] = (byReason[r] || 0) + 1; }); });
  var topReasons = Object.keys(byReason).sort(function(a,b){ return byReason[b]-byReason[a]; }).slice(0, 8);
  var maxR = topReasons.length > 0 ? byReason[topReasons[0]] : 1;
  topReasons.forEach(function(r) {
    var pct = Math.round(byReason[r] / maxR * 100);
    html += '<div style="margin-bottom:8px">';
    html += '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span>' + r + '</span><span style="font-weight:700">' + byReason[r] + '</span></div>';
    html += '<div style="background:#f1f5f9;border-radius:4px;height:8px;overflow:hidden"><div style="background:#dc2626;height:100%;width:' + pct + '%;border-radius:4px;transition:width .5s"></div></div>';
    html += '</div>';
  });
  html += '</div></div>';

  // Urgent items
  var urgent = data.filter(function(d){ return d.status === 'pending' || d.status === 'in-progress'; });
  if (urgent.length > 0) {
    html += '<div class="card" style="padding:20px;border-left:4px solid #ef4444">';
    html += '<h3 style="margin:0 0 12px;font-size:14px;color:#dc2626">🚨 รายการที่ต้องดำเนินการ (' + urgent.length + ')</h3>';
    urgent.forEach(function(d) {
      var statusObj = DELIST_STATUSES.find(function(s){ return s.id === d.status; }) || DELIST_STATUSES[0];
      html += '<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #f1f5f9">';
      html += '<span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;color:#fff;background:' + statusObj.color + '">' + statusObj.label + '</span>';
      html += '<span style="font-size:12px;font-weight:600">' + d.prodName + '</span>';
      html += '<span style="font-size:11px;color:#64748b">' + d.channel + ' — ' + d.customer + '</span>';
      html += '<span style="font-size:11px;color:#94a3b8;margin-left:auto">' + _dlFormatDate(d.recordDate) + '</span>';
      html += '</div>';
    });
    html += '</div>';
  }

  html += '</div>';
  el.innerHTML = html;
};
