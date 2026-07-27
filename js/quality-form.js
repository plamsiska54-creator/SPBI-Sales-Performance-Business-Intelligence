// ============================================================
// QUALITY-FORM.JS — Complaint Intake Form + Admin Complaint DB
// Depends on: app.js (showSubTab), dashboard.css
// localStorage key: qaComplaints
// ============================================================

// --- ข้อมูลตัวเลือกช่องทาง (Cascading dropdown) ---
var QA_CHANNELS = {
  'Modern Trade': ['CJ', 'Big C', 'Top', 'Makro', 'MM', 'Aeon', 'The Mall'],
  'Amazon': ['OR', 'COCO', 'RM', 'ร้านของฝาก', 'ลูกค้าทั่วไป', 'Black Canyon'],
  'Booth': ['ลำพยา 3 (ใหม่)', 'ร้านใหม่ (ปตท.คุณาวรรณ)', 'หน้ามอ (ม.เกษตร)', 'ลำพยา 3 (เก่า)', 'ไทวัสดุ', 'แก้วมณีกาญ', 'ลำพยา 2 (ใหม่)', 'ธรรมศาลา', 'ตลาดดิโอโซน', 'ปตท.ราชบุรี', 'ศาลายา กม.26', 'ลาดหลุมแก้ว', 'วัดเขาทำเทียม', 'วัดใหม่สุปดิษฐาราม', 'ศิลปากร', 'วันดอนขนาก', 'ชัยพฤกษ์ - นนทบุรี', 'โลตัส กำแพงแสน', 'โลตัส บางเลน'],
  'Online': ['Facebook', 'Line OA', 'Shopee', 'Lazada', 'Tiktok'],
  'อื่นๆ': ['อื่นๆ']
};

var QA_BANKS = [
  'ธนาคารกรุงเทพ (BBL)',
  'ธนาคารกสิกรไทย (KBANK)',
  'ธนาคารกรุงไทย (KTB)',
  'ธนาคารไทยพาณิชย์ (SCB)',
  'ธนาคารกรุงศรีอยุธยา (BAY)',
  'ธนาคารทหารไทยธนชาต (ttb)',
  'ธนาคารยูโอบี (UOB)',
  'ธนาคารซีไอเอ็มบี ไทย (CIMB)',
  'ธนาคารเกียรตินาคินภัทร (KKP)',
  'ธนาคารแลนด์ แอนด์ เฮ้าส์ (LH Bank)',
  'ธนาคารไอซีบีซี ไทย (ICBC)',
  'ธนาคารแห่งประเทศจีน ไทย (BOC)',
  'ธนาคารออมสิน (GSB)',
  'ธ.ก.ส. (BAAC)',
  'ธนาคารอาคารสงเคราะห์ (GHB)',
  'ธนาคารอิสลามแห่งประเทศไทย (ibank)',
  'ธนาคาร EXIM Bank',
  'ธนาคาร SME D Bank'
];

var QA_CAUSES = [
  'ขึ้นรา (Mold)',
  'สิ่งแปลกปลอม',
  'กลิ่นผิดปกติ',
  'รสชาติผิดปกติ',
  'สีผิดปกติ',
  'เนื้อสัมผัสผิดปกติ',
  'บรรจุภัณฑ์เสียหาย',
  'สินค้าหมดอายุก่อนกำหนด',
  'อื่น ๆ'
];

var QA_ASSESSMENT_OPTIONS = [
  'หนังสือชี้แจง - ระบุสาเหตุ',
  'นำสินค้ากลับมาตรวจ',
  'หนังสือชี้แจง'
];

var QA_SOLUTION_OPTIONS = [
  'นำสินค้ากลับมาตรวจ',
  'หนังสือชี้แจง'
];

// --- Helper: สร้าง select options ---
function _qfOpts(arr, placeholder) {
  var h = '<option value="">' + (placeholder || '-- เลือก --') + '</option>';
  for (var i = 0; i < arr.length; i++) {
    h += '<option value="' + arr[i] + '">' + arr[i] + '</option>';
  }
  return h;
}

// --- Helper: วันที่ปัจจุบัน YYYY-MM-DD ---
function _qfToday() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// --- Helper: สร้าง ID ใหม่ ---
function _qfGenId() {
  var today = _qfToday().replace(/-/g, '');
  var all = qaLoadComplaints();
  var prefix = 'QA-' + today + '-';
  var max = 0;
  for (var i = 0; i < all.length; i++) {
    if (all[i].id && all[i].id.indexOf(prefix) === 0) {
      var n = parseInt(all[i].id.substring(prefix.length), 10);
      if (n > max) max = n;
    }
  }
  return prefix + String(max + 1).padStart(3, '0');
}

// --- ตัวแปรติดตามว่ากำลังแก้ไขรายการเดิมหรือไม่ ---
var _qfEditingId = null;

// --- localStorage CRUD ---
function qaLoadComplaints() {
  try {
    var d = localStorage.getItem('qaComplaints');
    return d ? JSON.parse(d) : [];
  } catch (e) { return []; }
}

function qaSaveComplaints(arr) {
  localStorage.setItem('qaComplaints', JSON.stringify(arr));
}

// ============================================================
// RENDER FORM
// ============================================================
function renderQaForm() {
  var el = document.getElementById('qa-form');
  if (!el) return;
  // ป้องกัน re-render ถ้ามีเนื้อหาแล้ว
  if (el.getAttribute('data-rendered') === '1') return;
  el.setAttribute('data-rendered', '1');

  var today = _qfToday();
  var bankOpts = _qfOpts(QA_BANKS, '-- เลือกธนาคาร --');
  var causeOpts = _qfOpts(QA_CAUSES, '-- เลือกสาเหตุ --');
  var assessOpts = _qfOpts(QA_ASSESSMENT_OPTIONS, '-- เลือก --');
  var solOpts = _qfOpts(QA_SOLUTION_OPTIONS, '-- เลือก --');

  // สร้างตัวเลือกช่องทางหลัก
  var chMain = '<option value="">-- เลือกช่องทาง --</option>';
  var keys = Object.keys(QA_CHANNELS);
  for (var i = 0; i < keys.length; i++) {
    chMain += '<option value="' + keys[i] + '">' + keys[i] + '</option>';
  }

  var html = '<div class="qf-container">';
  html += '<div class="qf-header"><h2>แบบฟอร์มแจ้งปัญหาคุณภาพสินค้า</h2><p>กรอกข้อมูลให้ครบถ้วน แล้วกด "บันทึกข้อมูล" หรือ "บันทึกร่าง" เพื่อทำต่อทีหลัง</p></div>';

  // --- แสดงรายการร่าง/เคสที่ยังไม่ปิด ---
  html += _qfDraftList();

  // --- Section 1: ข้อมูลลูกค้า ---
  html += _qfSection('sec-customer', 'ข้อมูลลูกค้า', true,
    _qfRow([
      _qfField('วันที่รับปัญหา', '<input type="date" id="qf-date" class="qf-input" value="' + today + '">', 'half'),
      _qfField('ชื่อลูกค้า', '<input type="text" id="qf-custname" class="qf-input" placeholder="ชื่อ-สกุล ลูกค้า">', 'half')
    ]) +
    _qfRow([
      _qfField('เบอร์โทรติดต่อ', '<input type="tel" id="qf-phone" class="qf-input" placeholder="0xx-xxx-xxxx">', 'half'),
      _qfField('ที่อยู่', '<textarea id="qf-address" class="qf-input qf-textarea" placeholder="ที่อยู่จัดส่ง" rows="2"></textarea>', 'half')
    ])
  );

  // --- Section 2: ข้อมูลบัญชีธนาคาร ---
  html += _qfSection('sec-bank', 'ข้อมูลบัญชีธนาคาร', false,
    _qfRow([
      _qfField('ธนาคาร', '<select id="qf-bank" class="qf-input">' + bankOpts + '</select>', 'half'),
      _qfField('เลขที่บัญชี', '<input type="text" id="qf-bankno" class="qf-input" placeholder="xxx-x-xxxxx-x">', 'half')
    ]) +
    _qfRow([
      _qfField('ชื่อบัญชี', '<input type="text" id="qf-bankname" class="qf-input" placeholder="ชื่อบัญชี">', 'half'),
      _qfField('ยอดโอนคืนลูกค้า (บาท)', '<input type="number" id="qf-refund" class="qf-input" placeholder="0.00" min="0" step="0.01" oninput="qfCalcCost()">', 'half')
    ])
  );

  // --- Section 3: ช่องทาง ---
  html += _qfSection('sec-channel', 'ข้อมูลช่องทาง', false,
    _qfRow([
      _qfField('ช่องทางหลัก', '<select id="qf-ch-main" class="qf-input" onchange="qfChMainChange()">' + chMain + '</select>', 'half'),
      _qfField('ช่องทางย่อย', '<select id="qf-ch-sub" class="qf-input" disabled><option value="">-- เลือกช่องทางหลักก่อน --</option></select>', 'half')
    ])
  );

  // --- Section 4: ข้อมูลปัญหา ---
  html += _qfSection('sec-problem', 'ข้อมูลปัญหา', false,
    _qfRow([
      _qfField('จำนวน (ชิ้น)', '<input type="number" id="qf-qty" class="qf-input" placeholder="0" min="0">', 'third'),
      _qfField('สาเหตุของปัญหา', '<select id="qf-cause" class="qf-input">' + causeOpts + '</select>', 'third'),
      _qfField('มูลค่าความเสียหาย (บาท)', '<input type="number" id="qf-damage" class="qf-input" placeholder="0.00" min="0" step="0.01">', 'third')
    ])
  );

  // --- Section 5: แนบหลักฐาน ---
  html += _qfSection('sec-attach', 'แนบหลักฐาน', false,
    '<div class="qf-attach-grid">' +
      _qfFileBtn('qf-file-product', 'รูปสินค้า', 'image/*') +
      _qfFileBtn('qf-file-video', 'วีดีโอ', 'video/*') +
      _qfFileBtn('qf-file-receipt', 'ใบเสร็จ', 'image/*') +
      _qfFileBtn('qf-file-contact', 'รูปที่ลูกค้าติดต่อแจ้งปัญหา', 'image/*') +
    '</div>' +
    '<div class="qf-hint">* รูปภาพ: สูงสุด 500KB/ไฟล์ (เก็บเป็น base64) | วีดีโอ: เก็บเฉพาะชื่อไฟล์</div>'
  );

  // --- Section 6: QA Process Dates ---
  html += _qfSection('sec-qa-dates', 'QA Process Dates', false,
    _qfRow([
      _qfField('วันที่ขอรับคืนสินค้า', '<input type="date" id="qf-dt-return" class="qf-input">', 'half'),
      _qfField('วันที่ส่งสินค้าให้ QA', '<input type="date" id="qf-dt-sendqa" class="qf-input">', 'half')
    ]) +
    _qfRow([
      _qfField('วันที่แจ้งปัญหา QA', '<input type="date" id="qf-dt-notifyqa" class="qf-input">', 'half'),
      _qfField('วันที่ตอบกลับจาก QA', '<input type="date" id="qf-dt-qaresponse" class="qf-input">', 'half')
    ])
  );

  // --- Section 7: QA Assessment ---
  html += _qfSection('sec-qa-assess', 'QA Assessment', false,
    _qfRow([
      _qfField('รายละเอียดที่ QA ประเมิน', '<select id="qf-qa-assess" class="qf-input">' + assessOpts + '</select>', 'half'),
      _qfField('การแก้ปัญหาของ QA', '<select id="qf-qa-solution" class="qf-input">' + solOpts + '</select>', 'half')
    ]) +
    _qfRow([
      _qfField('แนบไฟล์ PDF หนังสือชี้แจง', '<input type="file" id="qf-qa-pdf" class="qf-input" accept=".pdf">', 'full')
    ])
  );

  // --- Section 8: Resolution ---
  html += _qfSection('sec-resolve', 'Resolution (การแก้ไข)', false,
    _qfRow([
      _qfField('วันที่แจ้งกลับลูกค้า', '<input type="date" id="qf-dt-notify-cust" class="qf-input">', 'half'),
      _qfField('วันที่ส่งมอบกระเช้า', '<input type="date" id="qf-dt-basket" class="qf-input">', 'half')
    ]) +
    _qfField('รายละเอียดการปิดปัญหา', '<textarea id="qf-resolve-detail" class="qf-input qf-textarea" rows="3" placeholder="รายละเอียดการปิดปัญหา"></textarea>', 'full')
  );

  // --- Section 9: Gift Basket ---
  html += _qfSection('sec-basket', 'กระเช้า (Gift Basket)', false,
    '<div id="qf-basket-items">' +
      '<div class="qf-basket-row" data-idx="0">' +
        '<input type="text" class="qf-input qf-basket-name" placeholder="ชื่อสินค้า">' +
        '<input type="number" class="qf-input qf-basket-price" placeholder="ราคา" min="0" step="0.01" oninput="qfCalcBasket()">' +
        '<button type="button" class="qf-btn-remove" onclick="qfRemoveBasketRow(this)" title="ลบ">x</button>' +
      '</div>' +
    '</div>' +
    '<div class="qf-basket-footer">' +
      '<button type="button" class="qf-btn-add-row" onclick="qfAddBasketRow()">+ เพิ่มรายการ</button>' +
      '<div class="qf-basket-total">ยอดรวมกระเช้า: <span id="qf-basket-total">0.00</span> บาท</div>' +
    '</div>' +
    _qfRow([
      _qfField('ผู้มอบกระเช้า', '<input type="text" id="qf-basket-giver" class="qf-input" placeholder="ชื่อผู้มอบ">', 'half'),
      _qfField('โลเคชั่น', '<input type="text" id="qf-basket-location" class="qf-input" placeholder="สถานที่มอบ">', 'half')
    ]) +
    _qfRow([
      _qfField('ประเมินน้ำมัน (กม.)', '<input type="number" id="qf-fuel-km" class="qf-input" placeholder="0" min="0" oninput="qfCalcFuel()">', 'half'),
      _qfField('ค่าเดินทาง (ไป-กลับ 4 บาท/กม.)', '<input type="text" id="qf-fuel-cost" class="qf-input" readonly value="0.00 บาท">', 'half')
    ]) +
    _qfField('หลักฐานการมอบกระเช้า', '<input type="file" id="qf-file-basket" accept="image/*" onchange="qfHandleFile(this,\'qf-file-basket-name\',500)">', 'full') +
    '<div id="qf-file-basket-name" class="qf-file-name"></div>'
  );

  // --- Section 10: Cost Summary ---
  html += _qfSection('sec-cost', 'ค่าใช้จ่ายทั้งหมด', false,
    '<div class="qf-cost-grid">' +
      '<div class="qf-cost-row"><label>ค่าส่งสินค้า</label><input type="number" id="qf-cost-ship" class="qf-input" placeholder="0.00" min="0" step="0.01" oninput="qfCalcCost()"></div>' +
      '<div class="qf-cost-row"><label>ค่ากระเช้า</label><input type="text" id="qf-cost-basket" class="qf-input" readonly value="0.00"></div>' +
      '<div class="qf-cost-row"><label>ค่าเดินทาง</label><input type="text" id="qf-cost-travel" class="qf-input" readonly value="0.00"></div>' +
      '<div class="qf-cost-row"><label>ค่าขนมโอนเงินคืนลูกค้า</label><input type="text" id="qf-cost-refund" class="qf-input" readonly value="0.00"></div>' +
      '<div class="qf-cost-row"><label>ค่าใช้จ่ายอื่นๆ</label><input type="number" id="qf-cost-other" class="qf-input" placeholder="0.00" min="0" step="0.01" oninput="qfCalcCost()"></div>' +
      '<div class="qf-cost-total"><label>รวมค่าใช้จ่ายทั้งหมด</label><span id="qf-cost-total">0.00 บาท</span></div>' +
    '</div>'
  );

  // --- Section 11: Closure ---
  html += _qfSection('sec-closure', 'ปิดจบปัญหา', false,
    _qfRow([
      _qfField('วันที่ปิดจบปัญหา', '<input type="date" id="qf-dt-close" class="qf-input">', 'half'),
      _qfField('ผู้บันทึกข้อมูล', '<input type="text" id="qf-recorder" class="qf-input" placeholder="ชื่อผู้บันทึก">', 'half')
    ]) +
    _qfField('หมายเหตุ', '<textarea id="qf-remark" class="qf-input qf-textarea" rows="3" placeholder="หมายเหตุเพิ่มเติม"></textarea>', 'full')
  );

  // --- Submit ---
  html += '<div class="qf-submit-area">';
  html += '<button type="button" class="qf-btn-submit" onclick="qaSubmitComplaint()">บันทึกข้อมูล</button>';
  html += '<button type="button" class="qf-btn-draft" onclick="qfSaveDraft()">💾 บันทึกร่าง</button>';
  html += '<button type="button" class="qf-btn-clear" onclick="qfClearForm()">ล้างฟอร์ม</button>';
  html += '</div>';
  html += '<div id="qf-editing-banner" class="qf-editing-banner" style="display:none"></div>';

  html += '</div>'; // /qf-container
  el.innerHTML = html;
}

// --- ฟังก์ชันสร้าง HTML ย่อย ---
function _qfSection(id, title, open, content) {
  return '<div class="qf-section" id="' + id + '">' +
    '<div class="qf-section-header" onclick="qfToggleSection(this)">' +
      '<span>' + title + '</span>' +
      '<span class="qf-chevron">' + (open ? '&#9650;' : '&#9660;') + '</span>' +
    '</div>' +
    '<div class="qf-section-body"' + (open ? '' : ' style="display:none"') + '>' + content + '</div>' +
  '</div>';
}

function _qfRow(cols) {
  if (typeof cols === 'string') return '<div class="qf-row">' + cols + '</div>';
  return '<div class="qf-row">' + cols.join('') + '</div>';
}

function _qfField(label, input, size) {
  return '<div class="qf-field qf-' + (size || 'full') + '"><label class="qf-label">' + label + '</label>' + input + '</div>';
}

function _qfFileBtn(id, label, accept) {
  return '<div class="qf-attach-item">' +
    '<label class="qf-attach-label">' + label + '</label>' +
    '<input type="file" id="' + id + '" accept="' + accept + '" onchange="qfHandleFile(this,\'' + id + '-name\',' + (accept.indexOf('video') >= 0 ? '0' : '500') + ')" style="display:none">' +
    '<button type="button" class="qf-attach-btn" onclick="document.getElementById(\'' + id + '\').click()">เลือกไฟล์</button>' +
    '<div id="' + id + '-name" class="qf-file-name"></div>' +
  '</div>';
}

// --- Toggle Section ---
function qfToggleSection(headerEl) {
  var body = headerEl.nextElementSibling;
  var chevron = headerEl.querySelector('.qf-chevron');
  if (body.style.display === 'none') {
    body.style.display = '';
    chevron.innerHTML = '&#9650;';
  } else {
    body.style.display = 'none';
    chevron.innerHTML = '&#9660;';
  }
}

// --- Cascading Channel Dropdown ---
function qfChMainChange() {
  var main = document.getElementById('qf-ch-main').value;
  var sub = document.getElementById('qf-ch-sub');
  if (!main || !QA_CHANNELS[main]) {
    sub.innerHTML = '<option value="">-- เลือกช่องทางหลักก่อน --</option>';
    sub.disabled = true;
    return;
  }
  var subs = QA_CHANNELS[main];
  var h = '<option value="">-- เลือกช่องทางย่อย --</option>';
  for (var i = 0; i < subs.length; i++) {
    h += '<option value="' + subs[i] + '">' + subs[i] + '</option>';
  }
  sub.innerHTML = h;
  sub.disabled = false;
}

// --- File Handling ---
function qfHandleFile(input, nameElId, maxKB) {
  var nameEl = document.getElementById(nameElId);
  if (!input.files || !input.files[0]) {
    if (nameEl) nameEl.textContent = '';
    return;
  }
  var file = input.files[0];
  // maxKB = 0 หมายถึง เก็บเฉพาะชื่อ (video)
  if (maxKB > 0 && file.size > maxKB * 1024) {
    alert('ไฟล์ "' + file.name + '" มีขนาด ' + (file.size / 1024).toFixed(0) + 'KB เกินขีดจำกัด ' + maxKB + 'KB');
    input.value = '';
    if (nameEl) nameEl.textContent = '';
    return;
  }
  if (nameEl) nameEl.textContent = file.name;
}

// --- Basket Item Rows ---
function qfAddBasketRow() {
  var container = document.getElementById('qf-basket-items');
  var idx = container.children.length;
  var row = document.createElement('div');
  row.className = 'qf-basket-row';
  row.setAttribute('data-idx', idx);
  row.innerHTML =
    '<input type="text" class="qf-input qf-basket-name" placeholder="ชื่อสินค้า">' +
    '<input type="number" class="qf-input qf-basket-price" placeholder="ราคา" min="0" step="0.01" oninput="qfCalcBasket()">' +
    '<button type="button" class="qf-btn-remove" onclick="qfRemoveBasketRow(this)" title="ลบ">x</button>';
  container.appendChild(row);
}

function qfRemoveBasketRow(btn) {
  var container = document.getElementById('qf-basket-items');
  if (container.children.length <= 1) return; // เก็บอย่างน้อย 1 แถว
  btn.closest('.qf-basket-row').remove();
  qfCalcBasket();
}

function qfCalcBasket() {
  var prices = document.querySelectorAll('#qf-basket-items .qf-basket-price');
  var total = 0;
  for (var i = 0; i < prices.length; i++) {
    total += parseFloat(prices[i].value) || 0;
  }
  document.getElementById('qf-basket-total').textContent = total.toFixed(2);
  var costBasket = document.getElementById('qf-cost-basket');
  if (costBasket) costBasket.value = total.toFixed(2);
  qfCalcCost();
}

// --- Fuel Calculation ---
function qfCalcFuel() {
  var km = parseFloat(document.getElementById('qf-fuel-km').value) || 0;
  var cost = km * 4 * 2; // 4 บาท/กม. x 2 (ไปกลับ)
  document.getElementById('qf-fuel-cost').value = cost.toFixed(2) + ' บาท';
  var costTravel = document.getElementById('qf-cost-travel');
  if (costTravel) costTravel.value = cost.toFixed(2);
  qfCalcCost();
}

// --- Cost Calculation ---
function qfCalcCost() {
  var ship = parseFloat((document.getElementById('qf-cost-ship') || {}).value) || 0;
  var basket = parseFloat((document.getElementById('qf-cost-basket') || {}).value) || 0;
  var travel = parseFloat((document.getElementById('qf-cost-travel') || {}).value) || 0;
  var refund = parseFloat((document.getElementById('qf-refund') || {}).value) || 0;
  var other = parseFloat((document.getElementById('qf-cost-other') || {}).value) || 0;

  // อัพเดท cost-refund
  var costRefund = document.getElementById('qf-cost-refund');
  if (costRefund) costRefund.value = refund.toFixed(2);

  var total = ship + basket + travel + refund + other;
  var totalEl = document.getElementById('qf-cost-total');
  if (totalEl) totalEl.textContent = total.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' บาท';
}

// --- Read file as base64 (สำหรับรูป max 500KB) ---
function _qfReadFileBase64(inputId) {
  return new Promise(function(resolve) {
    var input = document.getElementById(inputId);
    if (!input || !input.files || !input.files[0]) { resolve(null); return; }
    var file = input.files[0];
    // วีดีโอ: เก็บเฉพาะชื่อ
    if (file.type && file.type.indexOf('video') >= 0) {
      resolve({ name: file.name, type: 'video', data: null });
      return;
    }
    // PDF: เก็บเฉพาะชื่อ
    if (file.name && file.name.toLowerCase().endsWith('.pdf')) {
      resolve({ name: file.name, type: 'pdf', data: null });
      return;
    }
    // รูป: เก็บ base64 (ตรวจขนาดแล้วตอน input)
    var reader = new FileReader();
    reader.onload = function(e) {
      resolve({ name: file.name, type: file.type, data: e.target.result });
    };
    reader.onerror = function() { resolve(null); };
    reader.readAsDataURL(file);
  });
}

// --- Collect basket items ---
function _qfCollectBasket() {
  var rows = document.querySelectorAll('#qf-basket-items .qf-basket-row');
  var items = [];
  for (var i = 0; i < rows.length; i++) {
    var name = rows[i].querySelector('.qf-basket-name').value.trim();
    var price = parseFloat(rows[i].querySelector('.qf-basket-price').value) || 0;
    if (name) items.push({ name: name, price: price });
  }
  return items;
}

// ============================================================
// DRAFT LIST — แสดงร่าง/เคสที่ยังไม่ปิดให้เลือกแก้ไขต่อ
// ============================================================
function _qfDraftList() {
  var all = qaLoadComplaints();
  var open = all.filter(function(r) { return !r.dtClose; });
  if (open.length === 0) return '';
  var h = '<div class="qf-draft-list">';
  h += '<div class="qf-draft-title">📋 เคสที่ยังไม่ปิด — คลิกเพื่อแก้ไข/ทำต่อ</div>';
  for (var i = open.length - 1; i >= 0; i--) {
    var r = open[i];
    var st = r.draft ? '📝 ร่าง' : (_qfGetStatus(r) === 'inprogress' ? '🔄 กำลังดำเนินการ' : '⏳ รอดำเนินการ');
    h += '<div class="qf-draft-item" onclick="qfLoadComplaint(\'' + r.id + '\')">';
    h += '<span class="qf-draft-id">' + r.id + '</span>';
    h += '<span class="qf-draft-name">' + (r.custName || '-') + '</span>';
    h += '<span class="qf-draft-cause">' + (r.cause || '-') + '</span>';
    h += '<span class="qf-draft-status">' + st + '</span>';
    h += '<span class="qf-draft-date">' + (r.dateReceived || '-') + '</span>';
    h += '</div>';
  }
  h += '</div>';
  return h;
}

// ============================================================
// SAVE DRAFT — บันทึกร่างโดยไม่ต้อง validate
// ============================================================
function qfSaveDraft() {
  var custName = (document.getElementById('qf-custname').value || '').trim();
  if (!custName) { alert('กรุณากรอกชื่อลูกค้าก่อนบันทึกร่าง'); document.getElementById('qf-custname').focus(); return; }

  var record = _qfCollectAllFields();
  record.draft = true;

  try {
    var all = qaLoadComplaints();
    if (_qfEditingId) {
      for (var i = 0; i < all.length; i++) {
        if (all[i].id === _qfEditingId) { all[i] = record; break; }
      }
    } else {
      all.push(record);
    }
    qaSaveComplaints(all);
  } catch (e) {
    alert('เกิดข้อผิดพลาด: ' + e.message); return;
  }
  alert('บันทึกร่างสำเร็จ! รหัส: ' + record.id);
  _qfEditingId = null;
  qfClearForm();
}

// ============================================================
// LOAD COMPLAINT — โหลดข้อมูลเดิมเข้าฟอร์มเพื่อแก้ไข
// ============================================================
function qfLoadComplaint(id) {
  var all = qaLoadComplaints();
  var rec = null;
  for (var i = 0; i < all.length; i++) {
    if (all[i].id === id) { rec = all[i]; break; }
  }
  if (!rec) { alert('ไม่พบข้อมูล'); return; }

  // Re-render form fresh
  var el = document.getElementById('qa-form');
  if (el) el.removeAttribute('data-rendered');
  _qfEditingId = id;
  renderQaForm();

  // populate fields
  setTimeout(function() {
    _qfSetVal('qf-date', rec.dateReceived);
    _qfSetVal('qf-custname', rec.custName);
    _qfSetVal('qf-phone', rec.phone);
    _qfSetVal('qf-address', rec.address);
    _qfSetVal('qf-bank', rec.bank);
    _qfSetVal('qf-bankno', rec.bankNo);
    _qfSetVal('qf-bankname', rec.bankName);
    _qfSetVal('qf-refund', rec.refund || '');
    _qfSetVal('qf-ch-main', rec.channelMain);
    qfChMainChange();
    _qfSetVal('qf-ch-sub', rec.channelSub);
    _qfSetVal('qf-qty', rec.qty || '');
    _qfSetVal('qf-cause', rec.cause);
    _qfSetVal('qf-damage', rec.damageValue || '');
    _qfSetVal('qf-dt-return', rec.dtReturn);
    _qfSetVal('qf-dt-sendqa', rec.dtSendQa);
    _qfSetVal('qf-dt-notifyqa', rec.dtNotifyQa);
    _qfSetVal('qf-dt-qaresponse', rec.dtQaResponse);
    _qfSetVal('qf-qa-assess', rec.qaAssess);
    _qfSetVal('qf-qa-solution', rec.qaSolution);
    _qfSetVal('qf-dt-notify-cust', rec.dtNotifyCust);
    _qfSetVal('qf-resolve-detail', rec.resolveDetail);
    _qfSetVal('qf-dt-basket', rec.dtBasket);
    _qfSetVal('qf-basket-giver', rec.basketGiver);
    _qfSetVal('qf-basket-location', rec.basketLocation);
    _qfSetVal('qf-fuel-km', rec.fuelKm || '');
    _qfSetVal('qf-cost-ship', rec.costShip || '');
    _qfSetVal('qf-cost-other', rec.costOther || '');
    _qfSetVal('qf-dt-close', rec.dtClose);
    _qfSetVal('qf-recorder', rec.recorder);
    _qfSetVal('qf-remark', rec.remark);

    // Basket items
    if (rec.basketItems && rec.basketItems.length > 0) {
      var container = document.getElementById('qf-basket-items');
      if (container) {
        container.innerHTML = '';
        for (var b = 0; b < rec.basketItems.length; b++) {
          var row = document.createElement('div');
          row.className = 'qf-basket-row';
          row.innerHTML =
            '<input type="text" class="qf-input qf-basket-name" placeholder="ชื่อสินค้า" value="' + (rec.basketItems[b].name || '') + '">' +
            '<input type="number" class="qf-input qf-basket-price" placeholder="ราคา" min="0" step="0.01" oninput="qfCalcBasket()" value="' + (rec.basketItems[b].price || 0) + '">' +
            '<button type="button" class="qf-btn-remove" onclick="qfRemoveBasketRow(this)" title="ลบ">x</button>';
          container.appendChild(row);
        }
      }
    }

    qfCalcBasket();
    qfCalcFuel();
    qfCalcCost();

    // Show editing banner
    var banner = document.getElementById('qf-editing-banner');
    if (banner) {
      banner.style.display = 'block';
      banner.innerHTML = '✏️ กำลังแก้ไข: <strong>' + id + '</strong> — ' + (rec.custName || '') + ' <button class="qf-btn-cancel-edit" onclick="qfCancelEdit()">ยกเลิกแก้ไข</button>';
    }
  }, 50);
}

function _qfSetVal(id, val) {
  var el = document.getElementById(id);
  if (el && val !== undefined && val !== null) el.value = val;
}

function qfCancelEdit() {
  _qfEditingId = null;
  qfClearForm();
}

// ============================================================
// COLLECT ALL FIELDS — อ่านค่าจากฟอร์มทั้งหมด (ใช้ร่วมกับ submit และ draft)
// ============================================================
function _qfCollectAllFields() {
  var id = _qfEditingId || _qfGenId();
  return {
    id: id,
    dateReceived: document.getElementById('qf-date').value || _qfToday(),
    custName: (document.getElementById('qf-custname').value || '').trim(),
    phone: (document.getElementById('qf-phone').value || '').trim(),
    address: (document.getElementById('qf-address').value || '').trim(),
    bank: document.getElementById('qf-bank').value,
    bankNo: (document.getElementById('qf-bankno').value || '').trim(),
    bankName: (document.getElementById('qf-bankname').value || '').trim(),
    refund: parseFloat(document.getElementById('qf-refund').value) || 0,
    channelMain: document.getElementById('qf-ch-main').value,
    channelSub: document.getElementById('qf-ch-sub').value,
    qty: parseInt(document.getElementById('qf-qty').value) || 0,
    cause: document.getElementById('qf-cause').value,
    damageValue: parseFloat(document.getElementById('qf-damage').value) || 0,
    files: {},
    dtReturn: document.getElementById('qf-dt-return').value,
    dtSendQa: document.getElementById('qf-dt-sendqa').value,
    dtNotifyQa: document.getElementById('qf-dt-notifyqa').value,
    dtQaResponse: document.getElementById('qf-dt-qaresponse').value,
    qaAssess: document.getElementById('qf-qa-assess').value,
    qaSolution: document.getElementById('qf-qa-solution').value,
    dtNotifyCust: document.getElementById('qf-dt-notify-cust').value,
    resolveDetail: (document.getElementById('qf-resolve-detail').value || '').trim(),
    dtBasket: document.getElementById('qf-dt-basket').value,
    basketItems: _qfCollectBasket(),
    basketGiver: (document.getElementById('qf-basket-giver').value || '').trim(),
    basketLocation: (document.getElementById('qf-basket-location').value || '').trim(),
    fuelKm: parseFloat(document.getElementById('qf-fuel-km').value) || 0,
    fuelCost: parseFloat((document.getElementById('qf-cost-travel') || {}).value) || 0,
    costShip: parseFloat((document.getElementById('qf-cost-ship') || {}).value) || 0,
    costBasket: parseFloat((document.getElementById('qf-cost-basket') || {}).value) || 0,
    costTravel: parseFloat((document.getElementById('qf-cost-travel') || {}).value) || 0,
    costRefund: parseFloat(document.getElementById('qf-refund').value) || 0,
    costOther: parseFloat((document.getElementById('qf-cost-other') || {}).value) || 0,
    costTotal: 0,
    dtClose: document.getElementById('qf-dt-close').value,
    recorder: (document.getElementById('qf-recorder').value || '').trim(),
    remark: (document.getElementById('qf-remark').value || '').trim(),
    createdAt: new Date().toISOString()
  };
}

// ============================================================
// SUBMIT FORM
// ============================================================
function qaSubmitComplaint() {
  var custName = (document.getElementById('qf-custname').value || '').trim();
  var cause = document.getElementById('qf-cause').value;
  if (!custName) { alert('กรุณากรอกชื่อลูกค้า'); document.getElementById('qf-custname').focus(); return; }
  if (!cause) { alert('กรุณาเลือกสาเหตุของปัญหา'); document.getElementById('qf-cause').focus(); return; }

  Promise.all([
    _qfReadFileBase64('qf-file-product'),
    _qfReadFileBase64('qf-file-video'),
    _qfReadFileBase64('qf-file-receipt'),
    _qfReadFileBase64('qf-file-contact'),
    _qfReadFileBase64('qf-qa-pdf'),
    _qfReadFileBase64('qf-file-basket')
  ]).then(function(files) {
    var record = _qfCollectAllFields();
    record.draft = false;
    record.files = {
      product: files[0], video: files[1], receipt: files[2],
      contact: files[3], qaPdf: files[4], basketEvidence: files[5]
    };
    record.costTotal = record.costShip + record.costBasket + record.costTravel + record.costRefund + record.costOther;

    try {
      var all = qaLoadComplaints();
      if (_qfEditingId) {
        for (var i = 0; i < all.length; i++) {
          if (all[i].id === _qfEditingId) {
            if (all[i].files) record.files = _qfMergeFiles(all[i].files, record.files);
            all[i] = record; break;
          }
        }
      } else {
        all.push(record);
      }
      qaSaveComplaints(all);
    } catch (e) {
      if (e.name === 'QuotaExceededError' || (e.message && e.message.indexOf('quota') >= 0)) {
        alert('localStorage เต็ม! กรุณาลบข้อมูลเก่าหรือลดขนาดไฟล์แนบ');
        return;
      }
      alert('เกิดข้อผิดพลาด: ' + e.message);
      return;
    }

    alert('บันทึกสำเร็จ! รหัส: ' + record.id);
    _qfEditingId = null;
    qfClearForm();
  });
}

function _qfMergeFiles(oldFiles, newFiles) {
  var merged = {};
  var keys = ['product', 'video', 'receipt', 'contact', 'qaPdf', 'basketEvidence'];
  for (var i = 0; i < keys.length; i++) {
    merged[keys[i]] = newFiles[keys[i]] || oldFiles[keys[i]] || null;
  }
  return merged;
}

// --- Clear Form ---
function qfClearForm() {
  var el = document.getElementById('qa-form');
  if (!el) return;
  _qfEditingId = null;
  el.removeAttribute('data-rendered');
  renderQaForm();
}

// ============================================================
// ADMIN: Complaint Database
// ============================================================
function renderAdminComplaints() {
  var el = document.getElementById('adm-complaints-body');
  if (!el) return;
  var all = qaLoadComplaints();

  // --- Summary cards ---
  var total = all.length;
  var closed = 0, inprogress = 0, pending = 0;
  for (var i = 0; i < all.length; i++) {
    var st = _qfGetStatus(all[i]);
    if (st === 'closed') closed++;
    else if (st === 'inprogress') inprogress++;
    else pending++;
  }

  var cardsHtml =
    '<div class="qf-admin-cards">' +
      '<div class="kpi-card" style="border-top:3px solid #3b82f6"><div class="kpi-label">จำนวนทั้งหมด</div><div class="kpi-value" style="color:#3b82f6">' + total + '</div><div class="kpi-sub">เรื่อง</div></div>' +
      '<div class="kpi-card" style="border-top:3px solid #f59e0b"><div class="kpi-label">รอดำเนินการ</div><div class="kpi-value" style="color:#f59e0b">' + pending + '</div><div class="kpi-sub">เรื่อง</div></div>' +
      '<div class="kpi-card" style="border-top:3px solid #0ea5e9"><div class="kpi-label">กำลังดำเนินการ</div><div class="kpi-value" style="color:#0ea5e9">' + inprogress + '</div><div class="kpi-sub">เรื่อง</div></div>' +
      '<div class="kpi-card" style="border-top:3px solid #22c55e"><div class="kpi-label">ปิดแล้ว</div><div class="kpi-value" style="color:#22c55e">' + closed + '</div><div class="kpi-sub">เรื่อง</div></div>' +
    '</div>';

  // --- Year/Month filter + Search/Filter ---
  var years = {};
  for (var y = 0; y < all.length; y++) {
    if (all[y].dateReceived) {
      var yr = all[y].dateReceived.substring(0, 4);
      var ceYr = parseInt(yr);
      var beYr = ceYr + 543;
      years[beYr] = true;
    }
  }
  var yearOpts = '<option value="all">ทุกปี</option>';
  Object.keys(years).sort().forEach(function(y) { yearOpts += '<option value="' + y + '">' + y + '</option>'; });

  var monthOpts = '<option value="all">ทุกเดือน</option>';
  var mNames = ['','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  for (var m = 1; m <= 12; m++) { monthOpts += '<option value="' + m + '">' + mNames[m] + '</option>'; }

  var filterHtml =
    '<div class="qf-admin-filter">' +
      '<select id="qfAdmYear" class="qf-input" onchange="qfAdmFilter()" style="max-width:120px">' + yearOpts + '</select>' +
      '<select id="qfAdmMonth" class="qf-input" onchange="qfAdmFilter()" style="max-width:120px">' + monthOpts + '</select>' +
      '<input type="text" id="qfAdmSearch" class="qf-input" placeholder="ค้นหา (รหัส, ชื่อ, ช่องทาง, สาเหตุ)" oninput="qfAdmFilter()" style="max-width:280px">' +
      '<select id="qfAdmStatusFilter" class="qf-input" onchange="qfAdmFilter()" style="max-width:150px">' +
        '<option value="all">ทุกสถานะ</option>' +
        '<option value="pending">รอดำเนินการ</option>' +
        '<option value="inprogress">กำลังดำเนินการ</option>' +
        '<option value="closed">ปิดแล้ว</option>' +
      '</select>' +
      '<button class="qf-btn-download" onclick="qfAdmExportCSV()">📥 ดาวน์โหลด CSV</button>' +
    '</div>';

  // --- Table ---
  var tableHtml =
    '<div class="table-wrap">' +
    '<table class="qf-admin-table">' +
    '<thead><tr style="background:#1e293b;color:#fff">' +
      '<th>รหัส</th><th>วันที่รับ</th><th>ชื่อลูกค้า</th><th>ช่องทาง</th><th>สาเหตุ</th><th>มูลค่า</th><th>สถานะ</th><th>จัดการ</th>' +
    '</tr></thead>' +
    '<tbody id="qfAdmTableBody">';

  if (all.length === 0) {
    tableHtml += '<tr><td colspan="8" style="text-align:center;color:#94a3b8;padding:24px">ยังไม่มีข้อมูล</td></tr>';
  } else {
    // แสดงจากใหม่ไปเก่า
    for (var j = all.length - 1; j >= 0; j--) {
      tableHtml += _qfAdmRow(all[j]);
    }
  }

  tableHtml += '</tbody></table></div>';

  // --- Detail modal area ---
  var detailHtml = '<div id="qfAdmDetail" style="display:none"></div>';

  el.innerHTML = cardsHtml + filterHtml + tableHtml + detailHtml;
}

function _qfGetStatus(rec) {
  if (rec.dtClose) return 'closed';
  if (rec.dtQaResponse) return 'inprogress';
  return 'pending';
}

function _qfStatusBadge(status) {
  if (status === 'closed') return '<span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600">ปิดแล้ว</span>';
  if (status === 'inprogress') return '<span style="background:#e0f2fe;color:#0369a1;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600">กำลังดำเนินการ</span>';
  return '<span style="background:#fef3c7;color:#b45309;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600">รอดำเนินการ</span>';
}

function _qfAdmRow(rec) {
  var st = _qfGetStatus(rec);
  var channel = (rec.channelMain || '') + (rec.channelSub ? ' / ' + rec.channelSub : '');
  return '<tr data-id="' + rec.id + '" data-status="' + st + '" data-date="' + (rec.dateReceived || '') + '">' +
    '<td style="padding:6px 12px;font-weight:600;color:#ea580c">' + rec.id + '</td>' +
    '<td style="padding:6px 12px">' + (rec.dateReceived || '-') + '</td>' +
    '<td style="padding:6px 12px">' + (rec.custName || '-') + '</td>' +
    '<td style="padding:6px 12px">' + (channel || '-') + '</td>' +
    '<td style="padding:6px 12px">' + (rec.cause || '-') + '</td>' +
    '<td style="padding:6px 12px;text-align:right">' + ((rec.damageValue || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })) + '</td>' +
    '<td style="padding:6px 12px">' + _qfStatusBadge(st) + '</td>' +
    '<td style="padding:6px 12px">' +
      '<button class="admin-btn sm" onclick="qfAdmShowDetail(\'' + rec.id + '\')" style="margin-right:4px">ดู</button>' +
      '<button class="admin-btn sm" onclick="qfAdmEdit(\'' + rec.id + '\')" style="margin-right:4px;background:#eff6ff;color:#2563eb;border-color:#93c5fd">แก้ไข</button>' +
      '<button class="admin-btn sm" onclick="qfAdmDelete(\'' + rec.id + '\')" style="background:#fee2e2;color:#dc2626;border-color:#fca5a5">ลบ</button>' +
    '</td>' +
  '</tr>';
}

// --- Filter/Search ---
function qfAdmFilter() {
  var search = (document.getElementById('qfAdmSearch').value || '').toLowerCase();
  var status = document.getElementById('qfAdmStatusFilter').value;
  var yearFilter = (document.getElementById('qfAdmYear') || {}).value || 'all';
  var monthFilter = (document.getElementById('qfAdmMonth') || {}).value || 'all';
  var rows = document.querySelectorAll('#qfAdmTableBody tr[data-id]');
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var text = row.textContent.toLowerCase();
    var rowStatus = row.getAttribute('data-status');
    var rowDate = row.getAttribute('data-date') || '';
    var show = true;
    if (search && text.indexOf(search) < 0) show = false;
    if (status !== 'all' && rowStatus !== status) show = false;
    if (yearFilter !== 'all' && rowDate) {
      var ceYear = parseInt(rowDate.substring(0, 4));
      var beYear = ceYear + 543;
      if (beYear !== parseInt(yearFilter)) show = false;
    }
    if (monthFilter !== 'all' && rowDate) {
      var rowMonth = parseInt(rowDate.substring(5, 7));
      if (rowMonth !== parseInt(monthFilter)) show = false;
    }
    row.style.display = show ? '' : 'none';
  }
}

// --- Export CSV ---
function qfAdmExportCSV() {
  var all = qaLoadComplaints();
  var yearFilter = (document.getElementById('qfAdmYear') || {}).value || 'all';
  var monthFilter = (document.getElementById('qfAdmMonth') || {}).value || 'all';
  var statusFilter = (document.getElementById('qfAdmStatusFilter') || {}).value || 'all';
  var searchText = (document.getElementById('qfAdmSearch') || {}).value || '';

  var filtered = all.filter(function(r) {
    if (yearFilter !== 'all' && r.dateReceived) {
      var ceYear = parseInt(r.dateReceived.substring(0, 4));
      if ((ceYear + 543) !== parseInt(yearFilter)) return false;
    }
    if (monthFilter !== 'all' && r.dateReceived) {
      var m = parseInt(r.dateReceived.substring(5, 7));
      if (m !== parseInt(monthFilter)) return false;
    }
    if (statusFilter !== 'all') {
      var st = _qfGetStatus(r);
      if (st !== statusFilter) return false;
    }
    if (searchText) {
      var txt = (r.id + ' ' + r.custName + ' ' + r.channelMain + ' ' + r.cause).toLowerCase();
      if (txt.indexOf(searchText.toLowerCase()) < 0) return false;
    }
    return true;
  });

  if (filtered.length === 0) { alert('ไม่มีข้อมูลที่ตรงเงื่อนไข'); return; }

  var headers = ['รหัส','วันที่รับ','ชื่อลูกค้า','เบอร์โทร','ที่อยู่','ช่องทางหลัก','ช่องทางย่อย','สาเหตุ','จำนวน(ชิ้น)','มูลค่าเสียหาย','ธนาคาร','เลขบัญชี','ชื่อบัญชี','ยอดโอนคืน','ค่าส่ง','ค่ากระเช้า','ค่าเดินทาง','ค่าอื่นๆ','รวมค่าใช้จ่าย','สถานะ','วันที่ปิดจบ','ผู้บันทึก','หมายเหตุ'];
  var rows = [headers.join(',')];
  var statusLabels = { closed: 'ปิดแล้ว', inprogress: 'กำลังดำเนินการ', pending: 'รอดำเนินการ' };

  filtered.forEach(function(r) {
    var st = _qfGetStatus(r);
    var row = [
      r.id, r.dateReceived, _csvEsc(r.custName), _csvEsc(r.phone), _csvEsc(r.address),
      _csvEsc(r.channelMain), _csvEsc(r.channelSub), _csvEsc(r.cause),
      r.qty || 0, (r.damageValue || 0).toFixed(2),
      _csvEsc(r.bank), _csvEsc(r.bankNo), _csvEsc(r.bankName), (r.refund || 0).toFixed(2),
      (r.costShip || 0).toFixed(2), (r.costBasket || 0).toFixed(2),
      (r.costTravel || 0).toFixed(2), (r.costOther || 0).toFixed(2), (r.costTotal || 0).toFixed(2),
      statusLabels[st] || st, r.dtClose || '', _csvEsc(r.recorder), _csvEsc(r.remark)
    ];
    rows.push(row.join(','));
  });

  var bom = '﻿';
  var blob = new Blob([bom + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  var now = new Date();
  a.download = 'complaints_' + now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0') + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function _csvEsc(val) {
  if (!val) return '';
  var s = String(val);
  if (s.indexOf(',') >= 0 || s.indexOf('"') >= 0 || s.indexOf('\n') >= 0) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// --- Delete ---
function qfAdmDelete(id) {
  if (!confirm('ยืนยันลบรายการ ' + id + ' ?')) return;
  var all = qaLoadComplaints();
  var filtered = [];
  for (var i = 0; i < all.length; i++) {
    if (all[i].id !== id) filtered.push(all[i]);
  }
  qaSaveComplaints(filtered);
  renderAdminComplaints();
}

// --- Show Detail ---
function qfAdmShowDetail(id) {
  var all = qaLoadComplaints();
  var rec = null;
  for (var i = 0; i < all.length; i++) {
    if (all[i].id === id) { rec = all[i]; break; }
  }
  if (!rec) { alert('ไม่พบข้อมูล'); return; }

  var st = _qfGetStatus(rec);
  var channel = (rec.channelMain || '') + (rec.channelSub ? ' / ' + rec.channelSub : '');

  // สร้าง basket items table
  var basketHtml = '';
  if (rec.basketItems && rec.basketItems.length > 0) {
    basketHtml = '<table style="width:100%;border-collapse:collapse;margin-top:4px"><thead><tr style="background:#f1f5f9"><th style="padding:4px 8px;text-align:left">สินค้า</th><th style="padding:4px 8px;text-align:right">ราคา</th></tr></thead><tbody>';
    var bTotal = 0;
    for (var b = 0; b < rec.basketItems.length; b++) {
      basketHtml += '<tr><td style="padding:4px 8px">' + rec.basketItems[b].name + '</td><td style="padding:4px 8px;text-align:right">' + rec.basketItems[b].price.toFixed(2) + '</td></tr>';
      bTotal += rec.basketItems[b].price;
    }
    basketHtml += '<tr style="font-weight:700;border-top:1px solid #cbd5e1"><td style="padding:4px 8px">รวม</td><td style="padding:4px 8px;text-align:right">' + bTotal.toFixed(2) + '</td></tr>';
    basketHtml += '</tbody></table>';
  }

  // สร้าง file list
  var filesHtml = '';
  if (rec.files) {
    var fKeys = [['product','รูปสินค้า'],['video','วีดีโอ'],['receipt','ใบเสร็จ'],['contact','รูปแจ้งปัญหา'],['qaPdf','PDF ชี้แจง'],['basketEvidence','หลักฐานกระเช้า']];
    for (var fi = 0; fi < fKeys.length; fi++) {
      var f = rec.files[fKeys[fi][0]];
      if (f && f.name) {
        filesHtml += '<div style="margin:2px 0"><span style="color:#64748b">' + fKeys[fi][1] + ':</span> ' + f.name;
        if (f.data) filesHtml += ' <a href="' + f.data + '" target="_blank" style="color:#ea580c;font-size:11px">[ดูรูป]</a>';
        filesHtml += '</div>';
      }
    }
  }

  var html =
    '<div class="qf-detail-overlay" onclick="qfAdmCloseDetail(event)">' +
    '<div class="qf-detail-modal" onclick="event.stopPropagation()">' +
      '<div class="qf-detail-header">' +
        '<h3>' + rec.id + ' ' + _qfStatusBadge(st) + '</h3>' +
        '<button onclick="qfAdmCloseDetail()" class="admin-modal-x">x</button>' +
      '</div>' +
      '<div class="qf-detail-body">' +
        '<div class="qf-detail-grid">' +
          _qfDetailItem('วันที่รับปัญหา', rec.dateReceived) +
          _qfDetailItem('ชื่อลูกค้า', rec.custName) +
          _qfDetailItem('เบอร์โทร', rec.phone) +
          _qfDetailItem('ที่อยู่', rec.address) +
          _qfDetailItem('ช่องทาง', channel) +
          _qfDetailItem('สาเหตุ', rec.cause) +
          _qfDetailItem('จำนวน (ชิ้น)', rec.qty) +
          _qfDetailItem('มูลค่าความเสียหาย', (rec.damageValue || 0).toFixed(2) + ' บาท') +
          _qfDetailItem('ธนาคาร', rec.bank) +
          _qfDetailItem('เลขที่บัญชี', rec.bankNo) +
          _qfDetailItem('ชื่อบัญชี', rec.bankName) +
          _qfDetailItem('ยอดโอนคืน', (rec.refund || 0).toFixed(2) + ' บาท') +
        '</div>' +
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0">' +
        '<div class="qf-detail-grid">' +
          _qfDetailItem('วันที่ขอรับคืน', rec.dtReturn) +
          _qfDetailItem('วันที่ส่ง QA', rec.dtSendQa) +
          _qfDetailItem('วันที่แจ้ง QA', rec.dtNotifyQa) +
          _qfDetailItem('วันที่ QA ตอบกลับ', rec.dtQaResponse) +
          _qfDetailItem('QA ประเมิน', rec.qaAssess) +
          _qfDetailItem('การแก้ปัญหา QA', rec.qaSolution) +
        '</div>' +
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0">' +
        '<div class="qf-detail-grid">' +
          _qfDetailItem('วันที่แจ้งกลับลูกค้า', rec.dtNotifyCust) +
          _qfDetailItem('รายละเอียดปิดปัญหา', rec.resolveDetail) +
          _qfDetailItem('วันที่ส่งมอบกระเช้า', rec.dtBasket) +
          _qfDetailItem('ผู้มอบกระเช้า', rec.basketGiver) +
          _qfDetailItem('โลเคชั่น', rec.basketLocation) +
          _qfDetailItem('ระยะทาง', rec.fuelKm ? rec.fuelKm + ' กม.' : '-') +
          _qfDetailItem('ค่าเดินทาง', (rec.fuelCost || 0).toFixed(2) + ' บาท') +
        '</div>' +
        (basketHtml ? '<div style="margin-top:8px"><strong>รายการกระเช้า:</strong>' + basketHtml + '</div>' : '') +
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0">' +
        '<div class="qf-detail-grid">' +
          _qfDetailItem('ค่าส่งสินค้า', (rec.costShip || 0).toFixed(2) + ' บาท') +
          _qfDetailItem('ค่ากระเช้า', (rec.costBasket || 0).toFixed(2) + ' บาท') +
          _qfDetailItem('ค่าเดินทาง', (rec.costTravel || 0).toFixed(2) + ' บาท') +
          _qfDetailItem('ค่าโอนคืน', (rec.costRefund || 0).toFixed(2) + ' บาท') +
          _qfDetailItem('ค่าอื่นๆ', (rec.costOther || 0).toFixed(2) + ' บาท') +
          _qfDetailItem('รวมทั้งหมด', '<strong style="color:#ea580c">' + (rec.costTotal || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 }) + ' บาท</strong>') +
        '</div>' +
        (filesHtml ? '<hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0"><div><strong>ไฟล์แนบ:</strong>' + filesHtml + '</div>' : '') +
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0">' +
        '<div class="qf-detail-grid">' +
          _qfDetailItem('วันที่ปิดจบ', rec.dtClose) +
          _qfDetailItem('ผู้บันทึก', rec.recorder) +
          _qfDetailItem('หมายเหตุ', rec.remark) +
        '</div>' +
      '</div>' +
    '</div></div>';

  // ใช้ overlay ที่สร้างเอง
  var detailEl = document.getElementById('qfAdmDetail');
  if (detailEl) {
    detailEl.innerHTML = html;
    detailEl.style.display = 'block';
  }
}

function _qfDetailItem(label, value) {
  return '<div class="qf-detail-item"><span class="qf-detail-label">' + label + '</span><span class="qf-detail-value">' + (value || '-') + '</span></div>';
}

function qfAdmCloseDetail(e) {
  var detailEl = document.getElementById('qfAdmDetail');
  if (detailEl) {
    detailEl.innerHTML = '';
    detailEl.style.display = 'none';
  }
}

// --- Admin: Edit — นำทางไปหน้าฟอร์มพร้อมโหลดข้อมูล ---
function qfAdmEdit(id) {
  if (typeof showTab === 'function') {
    var qualityLink = document.querySelector('[data-tab="quality"]');
    if (qualityLink) showTab(qualityLink, 'quality');
  }
  setTimeout(function() {
    var formTab = document.querySelector('.sub-tab[onclick*="qa-form"]');
    if (formTab) {
      showSubTab(formTab, 'qa-form');
      qfLoadComplaint(id);
    }
  }, 100);
}
