// ============================================================
// CALL-LOG.JS — ระบบบันทึกการโทรลูกค้า (Call Log System)
// ============================================================
(function(){
'use strict';

// --- Sample Data ---
var DEFAULT_CALL_LOG_DATA = [
  {id:1,date:'2026-07-21',startTime:'09:00',endTime:'09:15',duration:'00:15:00',caller:'(เค้ก) นางสาวภาณุมาศ ศรีทันดร',callType:'โทรออก',channel:'โทรศัพท์',customerId:'C001',customerName:'คุณสมชาย',storeName:'ร้านป้าแมว',phone:'081-234-5678',province:'นครปฐม',district:'กำแพงแสน',salesChannel:'ร้านของฝาก',contactPerson:'คุณสมชาย',contactPosition:'เจ้าของร้าน',purpose:'เสนอขายสินค้า',result:'ลูกค้าสนใจ',note:'ลูกค้าขอตัวอย่างสินค้า',status:'published'},
  {id:2,date:'2026-07-21',startTime:'09:30',endTime:'09:42',duration:'00:12:00',caller:'(อ้อ) นางสาวยุวดี สิงคาน',callType:'โทรออก',channel:'โทรศัพท์',customerId:'C002',customerName:'คุณวิภา',storeName:'ร้านลุงเสริม',phone:'089-111-2222',province:'นครปฐม',district:'กำแพงแสน',salesChannel:'ร้านของฝาก',contactPerson:'คุณวิภา',contactPosition:'ผู้จัดการร้าน',purpose:'รับออเดอร์',result:'ปิดการขายได้',note:'สั่งขนม 5 รายการ',status:'published'},
  {id:3,date:'2026-07-21',startTime:'10:00',endTime:'10:05',duration:'00:05:00',caller:'(แตงกวา) นางสาวกาญจนา ศรีเหรา',callType:'โทรออก',channel:'โทรศัพท์',customerId:'C003',customerName:'คุณมาลี',storeName:'มินิมาร์ท ดอนตูม',phone:'086-333-4444',province:'นครปฐม',district:'ดอนตูม',salesChannel:'ลูกค้าทั่วไป',contactPerson:'คุณมาลี',contactPosition:'เจ้าของร้าน',purpose:'ติดตามออเดอร์',result:'ไม่รับสาย',note:'โทรกลับช่วงบ่าย',status:'published'},
  {id:4,date:'2026-07-21',startTime:'10:30',endTime:'10:48',duration:'00:18:00',caller:'(อัพ) นางสาวจุฑามาศ คุ้มผล',callType:'โทรออก',channel:'LINE',customerId:'C004',customerName:'คุณประสิทธิ์',storeName:'ร้านค้าส่ง ท่ามะกา',phone:'087-555-6666',province:'กาญจนบุรี',district:'ท่ามะกา',salesChannel:'ร้านของฝาก',contactPerson:'คุณประสิทธิ์',contactPosition:'เจ้าของร้าน',purpose:'แจ้งโปรโมชั่น',result:'ลูกค้าสนใจ',note:'สนใจโปรซื้อ 10 แถม 1',status:'published'},
  {id:5,date:'2026-07-22',startTime:'09:15',endTime:'09:28',duration:'00:13:00',caller:'(โบว์) นางสาวสุพัตรา แซ่ตั้น',callType:'โทรเข้า',channel:'โทรศัพท์',customerId:'C005',customerName:'คุณนภา',storeName:'ร้านของฝาก ท่าม่วง',phone:'082-777-8888',province:'กาญจนบุรี',district:'ท่าม่วง',salesChannel:'ร้านของฝาก',contactPerson:'คุณนภา',contactPosition:'พนักงาน',purpose:'รับข้อร้องเรียน',result:'ติดต่อได้',note:'สินค้าหมดอายุก่อนกำหนด ส่งเรื่องต่อ QC',status:'published'},
  {id:6,date:'2026-07-22',startTime:'11:00',endTime:'11:20',duration:'00:20:00',caller:'(บิวตี้) นายพีรพัฒน์ เพราะเจริญ',callType:'โทรออก',channel:'โทรศัพท์',customerId:'C006',customerName:'คุณสมศรี',storeName:'เซเว่น โพธาราม',phone:'091-999-0000',province:'ราชบุรี',district:'โพธาราม',salesChannel:'COCO',contactPerson:'คุณสมศรี',contactPosition:'ผู้จัดการสาขา',purpose:'นัดพบลูกค้า',result:'นัดหมายสำเร็จ',note:'นัดพบ 25 ก.ค. 69 เวลา 14:00',status:'published'},
  {id:7,date:'2026-07-22',startTime:'13:00',endTime:'13:10',duration:'00:10:00',caller:'(เค้ก) นางสาวภาณุมาศ ศรีทันดร',callType:'โทรออก',channel:'โทรศัพท์',customerId:'C007',customerName:'คุณเจ๊หน่อย',storeName:'ร้านเจ๊หน่อย ราชบุรี',phone:'084-222-3333',province:'ราชบุรี',district:'เมืองราชบุรี',salesChannel:'ร้านของฝาก',contactPerson:'คุณเจ๊หน่อย',contactPosition:'เจ้าของร้าน',purpose:'เสนอขายสินค้า',result:'รอการตัดสินใจ',note:'ขอดูราคาเปรียบเทียบก่อน',status:'published'},
  {id:8,date:'2026-07-23',startTime:'09:00',endTime:'09:08',duration:'00:08:00',caller:'(อ้อ) นางสาวยุวดี สิงคาน',callType:'โทรออก',channel:'WhatsApp',customerId:'C008',customerName:'คุณตลาดนัด',storeName:'ตลาดนัดศาลายา',phone:'095-444-5555',province:'นครปฐม',district:'พุทธมณฑล',salesChannel:'ลูกค้าทั่วไป',contactPerson:'คุณตลาดนัด',contactPosition:'ผู้ดูแลตลาด',purpose:'แจ้งสินค้าใหม่',result:'ลูกค้าไม่สนใจ',note:'ยังไม่มีแผนสั่งสินค้าเพิ่ม',status:'draft'},
  {id:9,date:'2026-07-23',startTime:'10:30',endTime:'10:45',duration:'00:15:00',caller:'(แตงกวา) นางสาวกาญจนา ศรีเหรา',callType:'โทรเข้า',channel:'โทรศัพท์',customerId:'C009',customerName:'คุณสมหมาย',storeName:'ร้านค้า บางบอน',phone:'088-666-7777',province:'กรุงเทพฯ',district:'บางบอน',salesChannel:'ลูกค้าทั่วไป',contactPerson:'คุณสมหมาย',contactPosition:'เจ้าของร้าน',purpose:'ติดตามการชำระเงิน',result:'ติดต่อได้',note:'จะโอนภายในวันศุกร์นี้',status:'published'},
  {id:10,date:'2026-07-23',startTime:'14:00',endTime:'14:22',duration:'00:22:00',caller:'(อัพ) นางสาวจุฑามาศ คุ้มผล',callType:'โทรออก',channel:'LINE',customerId:'C010',customerName:'คุณร้านสะดวกซื้อ',storeName:'ร้านสะดวกซื้อ บางใหญ่',phone:'093-888-9999',province:'นนทบุรี',district:'บางใหญ่',salesChannel:'COCO',contactPerson:'คุณร้านสะดวกซื้อ',contactPosition:'ผู้จัดการร้าน',purpose:'เสนอขายสินค้า',result:'ปิดการขายได้',note:'สั่งขนม 8 รายการ จัดส่งสัปดาห์หน้า',status:'published'}
];

// --- Dropdown Options ---
var CALL_LOG_CALLERS = [
  '(เค้ก) นางสาวภาณุมาศ ศรีทันดร',
  '(อ้อ) นางสาวยุวดี สิงคาน',
  '(แตงกวา) นางสาวกาญจนา ศรีเหรา',
  '(อัพ) นางสาวจุฑามาศ คุ้มผล',
  '(โบว์) นางสาวสุพัตรา แซ่ตั้น',
  '(บิวตี้) นายพีรพัฒน์ เพราะเจริญ'
];

var CALL_LOG_TYPES = ['โทรออก','โทรเข้า'];
var CALL_LOG_CHANNELS = ['โทรศัพท์','LINE','WhatsApp','อื่น ๆ'];
var CALL_LOG_SALES_CHANNELS = ['COCO','Amazon','ร้านของฝาก','ลูกค้าทั่วไป','อื่นๆ'];

var CALL_LOG_PURPOSES = [
  'เสนอขายสินค้า','รับออเดอร์','ติดตามออเดอร์','แจ้งโปรโมชั่น',
  'ติดตามการชำระเงิน','แจ้งสินค้าใหม่','นัดพบลูกค้า','แก้ไขปัญหา',
  'รับข้อร้องเรียน','อื่น ๆ'
];

var CALL_LOG_RESULTS = [
  'ติดต่อได้','ไม่รับสาย','สายไม่ว่าง','ปิดเครื่อง','เบอร์ผิด',
  'ฝากข้อความ','ขอให้โทรกลับ','ลูกค้าสนใจ','ลูกค้าไม่สนใจ',
  'ปิดการขายได้','นัดหมายสำเร็จ','รอการตัดสินใจ','ปฏิเสธ'
];

// --- สีสำหรับผลลัพธ์ ---
var RESULT_COLORS = {
  'ปิดการขายได้':'#16a34a','ลูกค้าสนใจ':'#16a34a','นัดหมายสำเร็จ':'#16a34a','ติดต่อได้':'#16a34a',
  'รอการตัดสินใจ':'#ea580c','ขอให้โทรกลับ':'#ea580c','ฝากข้อความ':'#ea580c',
  'ปฏิเสธ':'#dc2626','ลูกค้าไม่สนใจ':'#dc2626','เบอร์ผิด':'#dc2626',
  'ไม่รับสาย':'#6b7280','สายไม่ว่าง':'#6b7280','ปิดเครื่อง':'#6b7280'
};

// --- โหลดข้อมูลจาก localStorage หรือใช้ default ---
var CALL_LOG_DATA = (function(){
  try {
    var saved = localStorage.getItem('CALL_LOG_DATA_OVERRIDE');
    if(saved){
      var parsed = JSON.parse(saved);
      if(Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch(e){ /* ignore */ }
  return DEFAULT_CALL_LOG_DATA.slice();
})();

function _persistCallLog(){
  try { localStorage.setItem('CALL_LOG_DATA_OVERRIDE', JSON.stringify(CALL_LOG_DATA)); } catch(e){ /* ignore */ }
}

function _nextId(){
  var max = 0;
  CALL_LOG_DATA.forEach(function(r){ if(r.id > max) max = r.id; });
  return max + 1;
}

// --- วันที่วันนี้ในรูปแบบ YYYY-MM-DD ---
function _todayStr(){
  var d = new Date();
  var mm = ('0'+(d.getMonth()+1)).slice(-2);
  var dd = ('0'+d.getDate()).slice(-2);
  return d.getFullYear()+'-'+mm+'-'+dd;
}

// --- ฟอร์แมต HH:MM:SS จากนาที ---
function _fmtDuration(mins){
  if(isNaN(mins) || mins < 0) return '00:00:00';
  var h = Math.floor(mins/60);
  var m = Math.floor(mins%60);
  var s = 0;
  return ('0'+h).slice(-2)+':'+('0'+m).slice(-2)+':'+('0'+s).slice(-2);
}

// ============================================================
// คำนวณระยะเวลาการโทร
// ============================================================
function _calcCallDuration(){
  var startEl = document.getElementById('cl-startTime');
  var endEl = document.getElementById('cl-endTime');
  var durEl = document.getElementById('cl-duration');
  if(!startEl || !endEl || !durEl) return;
  var s = startEl.value;
  var e = endEl.value;
  if(!s || !e){ durEl.value = ''; return; }
  var sp = s.split(':'), ep = e.split(':');
  var sMins = parseInt(sp[0],10)*60 + parseInt(sp[1],10);
  var eMins = parseInt(ep[0],10)*60 + parseInt(ep[1],10);
  var diff = eMins - sMins;
  if(diff < 0) diff += 24*60; // ข้ามเที่ยงคืน
  durEl.value = _fmtDuration(diff);
}
window._calcCallDuration = _calcCallDuration;

// ============================================================
// สร้าง select HTML
// ============================================================
function _selectHtml(id, options, selected, placeholder){
  var h = '<select id="'+id+'" style="width:100%;padding:8px 12px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;background:#fff">';
  h += '<option value="">'+(placeholder||'-- เลือก --')+'</option>';
  options.forEach(function(o){
    h += '<option value="'+o+'"'+(o===selected?' selected':'')+'>'+o+'</option>';
  });
  h += '</select>';
  return h;
}

// ============================================================
// สร้าง input HTML
// ============================================================
function _inputHtml(id, type, value, extra){
  var val = value||'';
  extra = extra||'';
  return '<input id="'+id+'" type="'+type+'" value="'+val+'" style="width:100%;padding:8px 12px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box" '+extra+'/>';
}

// ============================================================
// สร้าง label HTML
// ============================================================
function _labelHtml(text, forId){
  return '<label for="'+forId+'" style="font-weight:600;font-size:13px;color:#374151;margin-bottom:4px;display:block">'+text+'</label>';
}

// ============================================================
// openCallModal — เปิดฟอร์มบันทึกการโทร
// ============================================================
function openCallModal(editId){
  // หา record ถ้าเป็นการแก้ไข
  var rec = null;
  if(editId){
    for(var i=0; i<CALL_LOG_DATA.length; i++){
      if(CALL_LOG_DATA[i].id === editId){ rec = CALL_LOG_DATA[i]; break; }
    }
  }

  var isEdit = !!rec;
  var title = isEdit ? 'แก้ไขข้อมูลการโทร' : 'เพิ่มข้อมูลการโทร';

  // ลบ modal เก่าถ้ามี
  var old = document.getElementById('callLogModalOverlay');
  if(old) old.remove();

  var overlay = document.createElement('div');
  overlay.id = 'callLogModalOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:9999;display:flex;align-items:center;justify-content:center';

  var fieldStyle = 'margin-bottom:12px';
  var gridStyle = 'display:grid;grid-template-columns:1fr 1fr;gap:0 16px';
  var sectionStyle = 'font-size:15px;font-weight:700;color:#ea580c;border-bottom:2px solid #fed7aa;padding-bottom:6px;margin:18px 0 10px';

  var html = '';
  html += '<div style="background:#fff;border-radius:16px;padding:28px 32px;max-width:800px;width:95%;max-height:90vh;overflow-y:auto;position:relative">';

  // ปุ่มปิด
  html += '<button onclick="document.getElementById(\'callLogModalOverlay\').remove()" style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:22px;cursor:pointer;color:#6b7280">&times;</button>';

  // หัวข้อ
  html += '<h3 style="margin:0 0 18px;font-size:18px;color:#1f2937">&#x1F4DE; '+title+'</h3>';

  // ข้อมูล editId (ซ่อน)
  html += '<input type="hidden" id="cl-editId" value="'+(isEdit?rec.id:'')+'"/>';

  // --- ข้อมูลการโทร ---
  html += '<div style="'+gridStyle+'">';

  // วันที่
  html += '<div style="'+fieldStyle+'">';
  html += _labelHtml('วันที่ *','cl-date');
  html += _inputHtml('cl-date','date', isEdit?rec.date:_todayStr());
  html += '</div>';

  // เวลาเริ่มโทร
  html += '<div style="'+fieldStyle+'">';
  html += _labelHtml('เวลาเริ่มโทร','cl-startTime');
  html += _inputHtml('cl-startTime','time', isEdit?rec.startTime:'', 'oninput="_calcCallDuration()"');
  html += '</div>';

  // เวลาสิ้นสุด
  html += '<div style="'+fieldStyle+'">';
  html += _labelHtml('เวลาสิ้นสุด','cl-endTime');
  html += _inputHtml('cl-endTime','time', isEdit?rec.endTime:'', 'oninput="_calcCallDuration()"');
  html += '</div>';

  // ระยะเวลาการโทร
  html += '<div style="'+fieldStyle+'">';
  html += _labelHtml('ระยะเวลาการโทร','cl-duration');
  html += _inputHtml('cl-duration','text', isEdit?rec.duration:'', 'readonly style="width:100%;padding:8px 12px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;background:#f3f4f6;box-sizing:border-box"');
  html += '</div>';

  // ผู้โทร
  html += '<div style="'+fieldStyle+'">';
  html += _labelHtml('ผู้โทร (พนักงาน) *','cl-caller');
  html += _selectHtml('cl-caller', CALL_LOG_CALLERS, isEdit?rec.caller:'', '-- เลือกพนักงาน --');
  html += '</div>';

  // ประเภทการโทร
  html += '<div style="'+fieldStyle+'">';
  html += _labelHtml('ประเภทการโทร','cl-callType');
  html += _selectHtml('cl-callType', CALL_LOG_TYPES, isEdit?rec.callType:'โทรออก');
  html += '</div>';

  // ช่องทางการติดต่อ
  html += '<div style="'+fieldStyle+'">';
  html += _labelHtml('ช่องทางการติดต่อ','cl-channel');
  html += _selectHtml('cl-channel', CALL_LOG_CHANNELS, isEdit?rec.channel:'โทรศัพท์');
  html += '</div>';

  html += '</div>'; // end grid

  // --- ข้อมูลลูกค้า ---
  html += '<div style="'+sectionStyle+'">ข้อมูลลูกค้า</div>';
  html += '<div style="'+gridStyle+'">';

  // รหัสลูกค้า
  html += '<div style="'+fieldStyle+'">';
  html += _labelHtml('รหัสลูกค้า/สาขา','cl-customerId');
  html += _inputHtml('cl-customerId','text', isEdit?rec.customerId:'');
  html += '</div>';

  // ชื่อลูกค้า
  html += '<div style="'+fieldStyle+'">';
  html += _labelHtml('ชื่อลูกค้า','cl-customerName');
  html += _inputHtml('cl-customerName','text', isEdit?rec.customerName:'');
  html += '</div>';

  // ชื่อร้านค้า
  html += '<div style="'+fieldStyle+'">';
  html += _labelHtml('ชื่อร้านค้า','cl-storeName');
  html += _inputHtml('cl-storeName','text', isEdit?rec.storeName:'');
  html += '</div>';

  // เบอร์โทรศัพท์
  html += '<div style="'+fieldStyle+'">';
  html += _labelHtml('เบอร์โทรศัพท์','cl-phone');
  html += _inputHtml('cl-phone','tel', isEdit?rec.phone:'');
  html += '</div>';

  // จังหวัด
  html += '<div style="'+fieldStyle+'">';
  html += _labelHtml('จังหวัด','cl-province');
  html += _inputHtml('cl-province','text', isEdit?rec.province:'');
  html += '</div>';

  // เขต/พื้นที่
  html += '<div style="'+fieldStyle+'">';
  html += _labelHtml('เขต/พื้นที่','cl-district');
  html += _inputHtml('cl-district','text', isEdit?rec.district:'');
  html += '</div>';

  html += '</div>'; // end grid

  // --- ข้อมูลเพิ่มเติม ---
  html += '<div style="'+sectionStyle+'">รายละเอียดการโทร</div>';
  html += '<div style="'+gridStyle+'">';

  // ช่องทางการขาย
  html += '<div style="'+fieldStyle+'">';
  html += _labelHtml('ช่องทางการขาย','cl-salesChannel');
  html += _selectHtml('cl-salesChannel', CALL_LOG_SALES_CHANNELS, isEdit?rec.salesChannel:'');
  html += '</div>';

  // ผู้ติดต่อ
  html += '<div style="'+fieldStyle+'">';
  html += _labelHtml('ผู้ติดต่อ','cl-contactPerson');
  html += _inputHtml('cl-contactPerson','text', isEdit?rec.contactPerson:'');
  html += '</div>';

  // ตำแหน่งผู้ติดต่อ
  html += '<div style="'+fieldStyle+'">';
  html += _labelHtml('ตำแหน่งผู้ติดต่อ','cl-contactPosition');
  html += _inputHtml('cl-contactPosition','text', isEdit?rec.contactPosition:'');
  html += '</div>';

  // วัตถุประสงค์
  html += '<div style="'+fieldStyle+'">';
  html += _labelHtml('วัตถุประสงค์ของการโทร *','cl-purpose');
  html += _selectHtml('cl-purpose', CALL_LOG_PURPOSES, isEdit?rec.purpose:'');
  html += '</div>';

  // ผลลัพธ์
  html += '<div style="'+fieldStyle+'">';
  html += _labelHtml('ผลลัพธ์ของการโทร *','cl-result');
  html += _selectHtml('cl-result', CALL_LOG_RESULTS, isEdit?rec.result:'');
  html += '</div>';

  html += '</div>'; // end grid

  // หมายเหตุ (full width)
  html += '<div style="'+fieldStyle+'">';
  html += _labelHtml('หมายเหตุ','cl-note');
  html += '<textarea id="cl-note" rows="3" style="width:100%;padding:8px 12px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;resize:vertical;box-sizing:border-box">'+(isEdit?rec.note:'')+'</textarea>';
  html += '</div>';

  // --- ปุ่มด้านล่าง ---
  html += '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;flex-wrap:wrap">';
  html += '<button onclick="document.getElementById(\'callLogModalOverlay\').remove()" style="padding:10px 22px;border:1.5px solid #d1d5db;border-radius:8px;background:#f9fafb;color:#374151;font-size:14px;cursor:pointer;font-weight:600">ยกเลิก</button>';
  html += '<button onclick="_saveCallLog(\'draft\')" style="padding:10px 22px;border:1.5px solid #3b82f6;border-radius:8px;background:#fff;color:#3b82f6;font-size:14px;cursor:pointer;font-weight:600">บันทึกแบบร่าง</button>';
  html += '<button onclick="_saveCallLog(\'published\')" style="padding:10px 22px;border:none;border-radius:8px;background:#ea580c;color:#fff;font-size:14px;cursor:pointer;font-weight:600">บันทึก</button>';
  html += '</div>';

  html += '</div>'; // end card

  overlay.innerHTML = html;

  // ปิด modal เมื่อคลิก overlay
  overlay.addEventListener('click', function(e){
    if(e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);
}

// ============================================================
// บันทึกข้อมูลการโทร
// ============================================================
function _saveCallLog(status){
  var date = (document.getElementById('cl-date')||{}).value||'';
  var caller = (document.getElementById('cl-caller')||{}).value||'';
  var purpose = (document.getElementById('cl-purpose')||{}).value||'';
  var result = (document.getElementById('cl-result')||{}).value||'';

  // Validate
  var missing = [];
  if(!date) missing.push('วันที่');
  if(!caller) missing.push('ผู้โทร');
  if(!purpose) missing.push('วัตถุประสงค์');
  if(!result) missing.push('ผลลัพธ์');
  if(missing.length > 0){
    alert('กรุณากรอกข้อมูลที่จำเป็น:\n- ' + missing.join('\n- '));
    return;
  }

  var startTime = (document.getElementById('cl-startTime')||{}).value||'';
  var endTime = (document.getElementById('cl-endTime')||{}).value||'';

  // คำนวณ duration
  var duration = '';
  if(startTime && endTime){
    var sp = startTime.split(':'), ep = endTime.split(':');
    var diff = (parseInt(ep[0],10)*60+parseInt(ep[1],10)) - (parseInt(sp[0],10)*60+parseInt(sp[1],10));
    if(diff < 0) diff += 24*60;
    duration = _fmtDuration(diff);
  }

  var record = {
    date: date,
    startTime: startTime,
    endTime: endTime,
    duration: duration,
    caller: caller,
    callType: (document.getElementById('cl-callType')||{}).value||'โทรออก',
    channel: (document.getElementById('cl-channel')||{}).value||'โทรศัพท์',
    customerId: (document.getElementById('cl-customerId')||{}).value||'',
    customerName: (document.getElementById('cl-customerName')||{}).value||'',
    storeName: (document.getElementById('cl-storeName')||{}).value||'',
    phone: (document.getElementById('cl-phone')||{}).value||'',
    province: (document.getElementById('cl-province')||{}).value||'',
    district: (document.getElementById('cl-district')||{}).value||'',
    salesChannel: (document.getElementById('cl-salesChannel')||{}).value||'',
    contactPerson: (document.getElementById('cl-contactPerson')||{}).value||'',
    contactPosition: (document.getElementById('cl-contactPosition')||{}).value||'',
    purpose: purpose,
    result: result,
    note: (document.getElementById('cl-note')||{}).value||'',
    status: status
  };

  var editId = (document.getElementById('cl-editId')||{}).value;
  if(editId){
    // แก้ไข record เดิม
    var id = parseInt(editId,10);
    for(var i=0; i<CALL_LOG_DATA.length; i++){
      if(CALL_LOG_DATA[i].id === id){
        record.id = id;
        CALL_LOG_DATA[i] = record;
        break;
      }
    }
  } else {
    // เพิ่ม record ใหม่
    record.id = _nextId();
    CALL_LOG_DATA.push(record);
  }

  _persistCallLog();

  // ปิด modal
  var overlay = document.getElementById('callLogModalOverlay');
  if(overlay) overlay.remove();

  // รีเรนเดอร์ตาราง
  if(typeof window.renderCallLogTable === 'function') window.renderCallLogTable();
  if(typeof window.renderAdminCallLog === 'function') window.renderAdminCallLog();

  // แสดงข้อความสำเร็จ
  _showCallLogToast(editId ? 'แก้ไขข้อมูลการโทรสำเร็จ' : 'บันทึกข้อมูลการโทรสำเร็จ');
}

// ============================================================
// ลบข้อมูลการโทร
// ============================================================
function _deleteCallLog(id){
  if(!confirm('ต้องการลบข้อมูลการโทรนี้หรือไม่?')) return;
  CALL_LOG_DATA = CALL_LOG_DATA.filter(function(r){ return r.id !== id; });
  _persistCallLog();
  if(typeof window.renderAdminCallLog === 'function') window.renderAdminCallLog();
  if(typeof window.renderCallLogTable === 'function') window.renderCallLogTable();
  _showCallLogToast('ลบข้อมูลการโทรสำเร็จ');
}

// ============================================================
// Toast แจ้งเตือน
// ============================================================
function _showCallLogToast(msg){
  var toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#16a34a;color:#fff;padding:12px 28px;border-radius:10px;font-size:15px;font-weight:600;z-index:10000;box-shadow:0 4px 16px rgba(0,0,0,0.18);transition:opacity 0.4s';
  document.body.appendChild(toast);
  setTimeout(function(){
    toast.style.opacity = '0';
    setTimeout(function(){ toast.remove(); }, 400);
  }, 2000);
}

// ============================================================
// renderAdminCallLog — แผงแอดมินสำหรับจัดการข้อมูลการโทร
// ============================================================
function renderAdminCallLog(){
  var container = document.getElementById('adm-calllog');
  if(!container) return;

  // กรองข้อมูล
  var dateFrom = (document.getElementById('admCL-dateFrom')||{}).value||'';
  var dateTo = (document.getElementById('admCL-dateTo')||{}).value||'';
  var callerFilter = (document.getElementById('admCL-caller')||{}).value||'all';
  var searchVal = ((document.getElementById('admCL-search')||{}).value||'').toLowerCase();

  var filtered = CALL_LOG_DATA.filter(function(r){
    if(dateFrom && r.date < dateFrom) return false;
    if(dateTo && r.date > dateTo) return false;
    if(callerFilter !== 'all' && r.caller !== callerFilter) return false;
    if(searchVal){
      var searchable = (r.customerName+' '+r.storeName+' '+r.phone+' '+r.note+' '+r.customerId).toLowerCase();
      if(searchable.indexOf(searchVal) === -1) return false;
    }
    return true;
  });

  // KPI
  var totalCalls = filtered.length;
  var totalOutbound = filtered.filter(function(r){return r.callType==='โทรออก';}).length;
  var totalInbound = filtered.filter(function(r){return r.callType==='โทรเข้า';}).length;
  var totalDurMins = 0;
  filtered.forEach(function(r){
    if(r.duration){
      var p = r.duration.split(':');
      totalDurMins += parseInt(p[0],10)*60 + parseInt(p[1],10) + parseInt(p[2]||0,10)/60;
    }
  });
  var durH = Math.floor(totalDurMins/60);
  var durM = Math.round(totalDurMins%60);

  var html = '';

  // ปุ่มเพิ่มข้อมูล
  html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;margin-bottom:16px">';
  html += '<h3 style="margin:0;font-size:17px;color:#1f2937">ข้อมูลการโทรลูกค้า</h3>';
  html += '<button onclick="openCallModal()" style="padding:8px 18px;background:#ea580c;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">&#x2795; เพิ่มข้อมูลการโทร</button>';
  html += '</div>';

  // KPI cards
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:18px">';
  html += _admKpiCard('&#x1F4DE;','การโทรทั้งหมด',totalCalls+' สาย','#ea580c');
  html += _admKpiCard('&#x23F1;','ระยะเวลารวม',durH+'ชม. '+durM+'น.','#7c3aed');
  html += _admKpiCard('&#x1F4E4;','โทรออก',totalOutbound+' สาย','#3b82f6');
  html += _admKpiCard('&#x1F4E5;','โทรเข้า',totalInbound+' สาย','#16a34a');
  html += '</div>';

  // Filters
  html += '<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;margin-bottom:14px;padding:12px 16px;background:#f9fafb;border-radius:10px">';
  html += '<div><label style="font-size:12px;font-weight:600;color:#6b7280;display:block">จากวันที่</label>';
  html += '<input id="admCL-dateFrom" type="date" value="'+dateFrom+'" onchange="renderAdminCallLog()" style="padding:6px 10px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px"/></div>';
  html += '<div><label style="font-size:12px;font-weight:600;color:#6b7280;display:block">ถึงวันที่</label>';
  html += '<input id="admCL-dateTo" type="date" value="'+dateTo+'" onchange="renderAdminCallLog()" style="padding:6px 10px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px"/></div>';
  html += '<div><label style="font-size:12px;font-weight:600;color:#6b7280;display:block">ผู้โทร</label>';
  html += '<select id="admCL-caller" onchange="renderAdminCallLog()" style="padding:6px 10px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px">';
  html += '<option value="all">ทั้งหมด</option>';
  CALL_LOG_CALLERS.forEach(function(c){
    html += '<option value="'+c+'"'+(c===callerFilter?' selected':'')+'>'+c+'</option>';
  });
  html += '</select></div>';
  html += '<div><label style="font-size:12px;font-weight:600;color:#6b7280;display:block">ค้นหา</label>';
  html += '<input id="admCL-search" type="text" placeholder="ชื่อ/ร้าน/เบอร์..." value="'+searchVal+'" oninput="renderAdminCallLog()" style="padding:6px 10px;border:1.5px solid #d1d5db;border-radius:8px;font-size:13px;width:180px"/></div>';
  html += '<div><button onclick="document.getElementById(\'admCL-dateFrom\').value=\'\';document.getElementById(\'admCL-dateTo\').value=\'\';document.getElementById(\'admCL-caller\').value=\'all\';document.getElementById(\'admCL-search\').value=\'\';renderAdminCallLog()" style="padding:6px 14px;border:1.5px solid #d1d5db;border-radius:8px;background:#fff;font-size:13px;cursor:pointer">ล้างตัวกรอง</button></div>';
  html += '</div>';

  // ตารางข้อมูล
  html += '<div style="overflow-x:auto">';
  html += '<table style="width:100%;border-collapse:collapse;font-size:13px">';
  html += '<thead><tr style="background:#f1f5f9">';
  var headers = ['วันที่','เวลา','ระยะเวลา','ผู้โทร','ประเภท','ช่องทาง','รหัสลค.','ชื่อลูกค้า','ร้านค้า','เบอร์โทร','จังหวัด','ช่องทางขาย','วัตถุประสงค์','ผลลัพธ์','สถานะ','หมายเหตุ','จัดการ'];
  headers.forEach(function(h){
    html += '<th style="padding:8px 6px;text-align:left;border-bottom:2px solid #e2e8f0;white-space:nowrap;font-size:12px;color:#475569">'+h+'</th>';
  });
  html += '</tr></thead><tbody>';

  if(filtered.length === 0){
    html += '<tr><td colspan="'+headers.length+'" style="text-align:center;padding:24px;color:#9ca3af">ไม่พบข้อมูล</td></tr>';
  } else {
    filtered.forEach(function(r){
      var resultColor = RESULT_COLORS[r.result]||'#374151';
      var statusBadge = r.status==='draft'
        ? '<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:12px;font-size:11px;white-space:nowrap">&#x1F4DD; ร่าง</span>'
        : '<span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:12px;font-size:11px;white-space:nowrap">&#x2705; เผยแพร่</span>';

      // แสดงชื่อย่อผู้โทร (ชื่อเล่น)
      var callerShort = r.caller;
      var nickMatch = r.caller.match(/\(([^)]+)\)/);
      if(nickMatch) callerShort = nickMatch[1];

      html += '<tr style="border-bottom:1px solid #e2e8f0">';
      html += '<td style="padding:7px 6px;white-space:nowrap">'+r.date+'</td>';
      html += '<td style="padding:7px 6px;white-space:nowrap">'+(r.startTime||'-')+' - '+(r.endTime||'-')+'</td>';
      html += '<td style="padding:7px 6px;white-space:nowrap">'+(r.duration||'-')+'</td>';
      html += '<td style="padding:7px 6px;white-space:nowrap" title="'+r.caller+'">'+callerShort+'</td>';
      html += '<td style="padding:7px 6px;white-space:nowrap">'+(r.callType||'-')+'</td>';
      html += '<td style="padding:7px 6px;white-space:nowrap">'+(r.channel||'-')+'</td>';
      html += '<td style="padding:7px 6px">'+(r.customerId||'-')+'</td>';
      html += '<td style="padding:7px 6px">'+(r.customerName||'-')+'</td>';
      html += '<td style="padding:7px 6px">'+(r.storeName||'-')+'</td>';
      html += '<td style="padding:7px 6px;white-space:nowrap">'+(r.phone||'-')+'</td>';
      html += '<td style="padding:7px 6px">'+(r.province||'-')+'</td>';
      html += '<td style="padding:7px 6px">'+(r.salesChannel||'-')+'</td>';
      html += '<td style="padding:7px 6px">'+(r.purpose||'-')+'</td>';
      html += '<td style="padding:7px 6px;color:'+resultColor+';font-weight:600;white-space:nowrap">'+(r.result||'-')+'</td>';
      html += '<td style="padding:7px 6px">'+statusBadge+'</td>';
      html += '<td style="padding:7px 6px;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+(r.note||'')+'">'+(r.note||'-')+'</td>';
      html += '<td style="padding:7px 6px;white-space:nowrap">';
      html += '<button onclick="openCallModal('+r.id+')" style="background:none;border:none;cursor:pointer;font-size:16px;padding:2px 4px" title="แก้ไข">&#x270F;&#xFE0F;</button>';
      html += '<button onclick="_deleteCallLog('+r.id+')" style="background:none;border:none;cursor:pointer;font-size:16px;padding:2px 4px" title="ลบ">&#x1F5D1;&#xFE0F;</button>';
      html += '</td>';
      html += '</tr>';
    });
  }

  html += '</tbody></table></div>';
  html += '<div style="margin-top:8px;font-size:12px;color:#9ca3af">แสดง '+filtered.length+' จาก '+CALL_LOG_DATA.length+' รายการ</div>';

  container.innerHTML = html;
}

// KPI card สำหรับ admin
function _admKpiCard(icon, label, value, color){
  return '<div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;padding:14px 18px;text-align:center">'
    +'<div style="font-size:22px;margin-bottom:4px">'+icon+'</div>'
    +'<div style="font-size:22px;font-weight:800;color:'+(color||'#1f2937')+'">'+value+'</div>'
    +'<div style="font-size:12px;color:#6b7280;margin-top:2px">'+label+'</div></div>';
}

// ============================================================
// Expose to window
// ============================================================
window.openCallModal = openCallModal;
window._saveCallLog = _saveCallLog;
window._deleteCallLog = _deleteCallLog;
window._calcCallDuration = _calcCallDuration;
window.renderAdminCallLog = renderAdminCallLog;
window.CALL_LOG_DATA = CALL_LOG_DATA;

})();
