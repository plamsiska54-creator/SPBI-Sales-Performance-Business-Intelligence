// ═══════════════════ EVENT MANAGEMENT MODULE ═══════════════════
(function(){
'use strict';

var EVT_KEY = 'mkt_events_v1';
function _load(){ try{return JSON.parse(localStorage.getItem(EVT_KEY))||[];}catch(e){return [];} }
function _save(arr){ try{localStorage.setItem(EVT_KEY,JSON.stringify(arr));}catch(e){} }

var PROVINCES = ['กรุงเทพฯ','กระบี่','กาญจนบุรี','กาฬสินธุ์','กำแพงเพชร','ขอนแก่น','จันทบุรี','ฉะเชิงเทรา','ชลบุรี','ชัยนาท','ชัยภูมิ','ชุมพร','เชียงราย','เชียงใหม่','ตรัง','ตราด','ตาก','นครนายก','นครปฐม','นครพนม','นครราชสีมา','นครศรีธรรมราช','นครสวรรค์','นนทบุรี','นราธิวาส','น่าน','บึงกาฬ','บุรีรัมย์','ปทุมธานี','ประจวบคีรีขันธ์','ปราจีนบุรี','ปัตตานี','พระนครศรีอยุธยา','พังงา','พัทลุง','พิจิตร','พิษณุโลก','เพชรบุรี','เพชรบูรณ์','แพร่','พะเยา','ภูเก็ต','มหาสารคาม','มุกดาหาร','แม่ฮ่องสอน','ยโสธร','ยะลา','ร้อยเอ็ด','ระนอง','ระยอง','ราชบุรี','ลพบุรี','ลำปาง','ลำพูน','เลย','ศรีสะเกษ','สกลนคร','สงขลา','สตูล','สมุทรปราการ','สมุทรสงคราม','สมุทรสาคร','สระแก้ว','สระบุรี','สิงห์บุรี','สุโขทัย','สุพรรณบุรี','สุราษฎร์ธานี','สุรินทร์','หนองคาย','หนองบัวลำภู','อ่างทอง','อุดรธานี','อุทัยธานี','อุตรดิตถ์','อุบลราชธานี','อำนาจเจริญ'];
var EVENT_TYPES = ['อบรม','เปิดตัวสินค้า','Roadshow','Sampling','งานแสดงสินค้า'];
var DEPTS = ['Marketing','Sales'];
var STATUSES = ['วางแผน','กำลังดำเนินการ','เสร็จสิ้น'];
var STATUS_COLORS = {'วางแผน':'#7c3aed','กำลังดำเนินการ':'#f97316','เสร็จสิ้น':'#16a34a'};
var OBJECTIVES = ['เพิ่มยอดขาย','โปรโมตสินค้า','เปิดตัวสินค้า'];
var CHANNELS = ['CJ','Big C','Makro','Top','Aeon','TheMall','Modern Trade','Amazon','Booth','Online'];

function _newEvent(){
  return {
    id: Date.now(),
    recordDate:'', name:'', type:'', channel:'', responsible:'', department:'', status:'วางแผน',
    startDate:'', endDate:'', startTime:'', endTime:'',
    locations:[],
    objective:'',
    participants:[], products:[],
    fuel:[], tolls:[], accommodation:[], perDiem:[], otherExpenses:[],
    salesBefore:0, salesAfter:0,
    roi:{
      grossProfit:0, mktBudget:0,
      newCustCount:0, firstPurchaseRevenue:0,
      avgOrderValue:0, purchaseFreqYear:0, custLifeYears:0,
      laborSavings:0, agencySavings:0, wasteSavings:0, automationCost:0
    },
    goals:{
      lineOaBefore:0, lineOaAfter:0,
      fbBefore:0, fbAfter:0,
      newProdItems:0, newProdAmount:0,
      newCustomers:0, newCustBills:[],
      clipTarget:0, clipActual:0
    }
  };
}

// ── Staff & Product lookup helpers ──
function _getStaffList(){
  if(typeof SM_STAFF_DB!=='undefined') return SM_STAFF_DB.filter(function(s){return !s.resigned;});
  return [];
}
function _getAllProducts(){
  var list = [];
  if(typeof PRODUCTS==='undefined') return list;
  Object.keys(PRODUCTS).forEach(function(ch){
    (PRODUCTS[ch]||[]).forEach(function(p){
      if(p.code && p.name && p.status!=='inactive') list.push({code:p.code, name:p.name, price:p.price||0});
    });
  });
  return list;
}
function _findProduct(code){
  var all = _getAllProducts();
  for(var i=0;i<all.length;i++) if(all[i].code===code) return all[i];
  return null;
}
function _findStaff(nick){
  var list = _getStaffList();
  for(var i=0;i<list.length;i++) if(list[i].nick===nick) return list[i];
  return null;
}

function _fmt(n){ return (n||0).toLocaleString(); }
function _sumArr(arr,key){ return arr.reduce(function(s,x){return s+(parseFloat(x[key])||0);},0); }

function _productTotal(p){ return (parseFloat(p.qty)||0) * (parseFloat(p.price)||0); }
function _accomTotal(a){ return (parseFloat(a.nights)||0) * (parseFloat(a.rooms)||0) * (parseFloat(a.amount)||0); }
function _perDiemTotal(p){ return (parseFloat(p.days)||0) * (parseFloat(p.rate)||0); }

function _budgetSummary(ev){
  var prodCost = ev.products.reduce(function(s,p){return s+_productTotal(p);},0);
  var fuelCost = _sumArr(ev.fuel,'amount');
  var tollCost = _sumArr(ev.tolls,'amount');
  var accomCost = ev.accommodation.reduce(function(s,a){return s+_accomTotal(a);},0);
  var perDiemCost = ev.perDiem.reduce(function(s,p){return s+_perDiemTotal(p);},0);
  var otherCost = _sumArr(ev.otherExpenses,'amount');
  var travelCost = fuelCost + tollCost;
  var total = prodCost + accomCost + travelCost + perDiemCost + otherCost;
  return {prodCost:prodCost, fuelCost:fuelCost, tollCost:tollCost, accomCost:accomCost,
    perDiemCost:perDiemCost, otherCost:otherCost, travelCost:travelCost, total:total};
}

// CSS styles
var _evtStyleAdded = false;
function _addStyles(){
  if(_evtStyleAdded) return;
  _evtStyleAdded = true;
  var css = document.createElement('style');
  css.textContent = [
    '.evt-form{max-width:900px;margin:0 auto}',
    '.evt-section{background:#fff;border-radius:14px;border:1px solid #e2e8f0;margin-bottom:16px;overflow:hidden}',
    '.evt-section-head{background:linear-gradient(135deg,#1e293b,#334155);color:#fff;padding:14px 20px;font-size:14px;font-weight:800;display:flex;align-items:center;gap:8px}',
    '.evt-section-body{padding:18px 20px}',
    '.evt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}',
    '.evt-field label{display:block;font-size:11px;font-weight:700;color:#64748b;margin-bottom:4px;text-transform:uppercase}',
    '.evt-field input,.evt-field select,.evt-field textarea{width:100%;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:13px;transition:border .2s;box-sizing:border-box;font-family:inherit}',
    '.evt-field input:focus,.evt-field select:focus{border-color:#3b82f6;outline:none;box-shadow:0 0 0 3px rgba(59,130,246,.1)}',
    '.evt-tbl{width:100%;border-collapse:collapse;font-size:12px}',
    '.evt-tbl th{padding:8px 10px;background:#f1f5f9;font-weight:700;color:#475569;text-align:left;font-size:11px}',
    '.evt-tbl td{padding:7px 10px;border-bottom:1px solid #f1f5f9}',
    '.evt-tbl input{width:100%;padding:6px 8px;border:1px solid #e2e8f0;border-radius:8px;font-size:12px;box-sizing:border-box}',
    '.evt-tbl input[type=number]{text-align:right}',
    '.evt-add-btn{padding:6px 14px;border:1.5px dashed #cbd5e1;border-radius:10px;background:#f8fafc;color:#64748b;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s}',
    '.evt-add-btn:hover{border-color:#3b82f6;color:#3b82f6;background:#eff6ff}',
    '.evt-del-btn{border:none;background:none;cursor:pointer;font-size:14px;padding:2px 4px}',
    '.evt-summary-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px}',
    '.evt-summary-row:last-child{border:none;font-weight:800;font-size:15px;color:#1e293b;padding-top:12px;border-top:2px solid #e2e8f0}',
    '.evt-summary-val{font-weight:700;color:#2563eb}',
    '.evt-back-btn{padding:8px 18px;border:1.5px solid #e2e8f0;border-radius:12px;background:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s}',
    '.evt-back-btn:hover{background:#f1f5f9}',
    '.evt-save-btn{padding:8px 24px;border:none;border-radius:12px;background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s}',
    '.evt-save-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(22,163,74,.3)}',
    '[data-theme="dark"] .evt-section{background:var(--surface,#1e293b);border-color:var(--border,#334155)}',
    '[data-theme="dark"] .evt-field input,[data-theme="dark"] .evt-field select{background:var(--surface,#1e293b);border-color:var(--border,#334155);color:var(--text,#e2e8f0)}',
    '[data-theme="dark"] .evt-tbl th{background:var(--surface,#1e293b);color:var(--text2,#94a3b8)}',
    '[data-theme="dark"] .evt-tbl input{background:var(--surface,#1e293b);border-color:var(--border,#334155);color:var(--text,#e2e8f0)}',
    '[data-theme="dark"] .evt-add-btn{background:var(--surface,#1e293b);border-color:var(--border,#334155);color:var(--text2,#94a3b8)}'
  ].join('\n');
  document.head.appendChild(css);
}

// ── Current editing state ──
var _editingEvt = null; // null = list view, object = form view

// ══════════════ EVENT LIST VIEW ══════════════
function renderMktEvents(){
  _addStyles();
  var el = document.getElementById('mktEventsContent');
  if(!el) return;

  if(_editingEvt !== null){
    _renderEventForm(el);
    return;
  }

  var events = _load();
  var totalBudget = events.reduce(function(s,e){return s+_budgetSummary(e).total;},0);
  var active = events.filter(function(e){return e.status==='กำลังดำเนินการ';}).length;
  var done = events.filter(function(e){return e.status==='เสร็จสิ้น';}).length;

  var kpis = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">'
    +'<div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:14px;padding:18px 22px"><div style="font-size:24px">🎪</div><div style="font-size:11px;color:#64748b;font-weight:600;margin-top:4px">Event ทั้งหมด</div><div style="font-size:24px;font-weight:800;color:#2563eb;margin-top:4px">'+events.length+'</div><div style="font-size:11px;color:#94a3b8">รายการ</div></div>'
    +'<div style="background:linear-gradient(135deg,#fff7ed,#fed7aa);border-radius:14px;padding:18px 22px"><div style="font-size:24px">🔥</div><div style="font-size:11px;color:#64748b;font-weight:600;margin-top:4px">กำลังดำเนินการ</div><div style="font-size:24px;font-weight:800;color:#f97316;margin-top:4px">'+active+'</div><div style="font-size:11px;color:#94a3b8">รายการ</div></div>'
    +'<div style="background:linear-gradient(135deg,#f0fdf4,#bbf7d0);border-radius:14px;padding:18px 22px"><div style="font-size:24px">✅</div><div style="font-size:11px;color:#64748b;font-weight:600;margin-top:4px">เสร็จสิ้น</div><div style="font-size:24px;font-weight:800;color:#16a34a;margin-top:4px">'+done+'</div><div style="font-size:11px;color:#94a3b8">รายการ</div></div>'
    +'<div style="background:linear-gradient(135deg,#faf5ff,#e9d5ff);border-radius:14px;padding:18px 22px"><div style="font-size:24px">💰</div><div style="font-size:11px;color:#64748b;font-weight:600;margin-top:4px">งบใช้ไปทั้งหมด</div><div style="font-size:24px;font-weight:800;color:#7c3aed;margin-top:4px">฿'+_fmt(totalBudget)+'</div><div style="font-size:11px;color:#94a3b8">บาท</div></div>'
    +'</div>';

  var addBtn = '<button onclick="evtNew()" style="padding:8px 18px;border:none;border-radius:12px;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:16px">➕ สร้าง Event ใหม่</button>';

  var table = '';
  if(events.length > 0){
    var TH = 'padding:9px 12px;font-size:11px;font-weight:700;color:#fff;background:#1e293b;';
    table = '<div style="overflow-x:auto;border-radius:12px;border:1px solid #e2e8f0"><table style="width:100%;border-collapse:collapse;font-size:13px">'
      +'<thead><tr>'
      +'<th style="'+TH+'text-align:center">#</th>'
      +'<th style="'+TH+'text-align:left">ชื่อ Event</th>'
      +'<th style="'+TH+'text-align:left">ประเภท</th>'
      +'<th style="'+TH+'text-align:center">วันที่</th>'
      +'<th style="'+TH+'text-align:left">จังหวัด</th>'
      +'<th style="'+TH+'text-align:right">งบประมาณ</th>'
      +'<th style="'+TH+'text-align:center">สถานะ</th>'
      +'<th style="'+TH+'text-align:center">จัดการ</th>'
      +'</tr></thead><tbody>';
    events.forEach(function(ev, i){
      var b = _budgetSummary(ev);
      var sc = STATUS_COLORS[ev.status] || '#94a3b8';
      table += '<tr style="border-bottom:1px solid #f1f5f9;background:'+(i%2?'#fafafa':'#fff')+';cursor:pointer" onclick="evtEdit('+ev.id+')">'
        +'<td style="padding:8px 12px;text-align:center;color:#94a3b8">'+(i+1)+'</td>'
        +'<td style="padding:8px 12px;font-weight:600;color:#1e293b">'+ev.name+'</td>'
        +'<td style="padding:8px 12px;color:#475569">'+(ev.type||'—')+'</td>'
        +'<td style="padding:8px 12px;text-align:center;color:#475569;font-size:11px">'+(ev.startDate||'—')+(ev.endDate?' ~ '+ev.endDate:'')+'</td>'
        +'<td style="padding:8px 12px;color:#475569">'+(ev.province||'—')+'</td>'
        +'<td style="padding:8px 12px;text-align:right;font-weight:700;color:#2563eb">฿'+_fmt(b.total)+'</td>'
        +'<td style="padding:8px 12px;text-align:center"><span style="padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;color:#fff;background:'+sc+'">'+ev.status+'</span></td>'
        +'<td style="padding:8px 12px;text-align:center" onclick="event.stopPropagation()">'
        +'<button onclick="evtEdit('+ev.id+')" style="border:none;background:none;cursor:pointer;font-size:14px" title="แก้ไข">✏️</button>'
        +'<button onclick="evtDuplicate('+ev.id+')" style="border:none;background:none;cursor:pointer;font-size:14px" title="คัดลอก">📋</button>'
        +'<button onclick="evtDelete('+ev.id+')" style="border:none;background:none;cursor:pointer;font-size:14px" title="ลบ">🗑️</button>'
        +'</td></tr>';
    });
    table += '</tbody></table></div>';
  } else {
    table = '<div style="text-align:center;padding:60px 20px"><div style="font-size:48px;margin-bottom:12px">🎪</div><div style="font-size:18px;font-weight:800;color:#1e293b;margin-bottom:8px">ยังไม่มีกิจกรรม</div><div style="font-size:13px;color:#94a3b8">กด "สร้าง Event ใหม่" เพื่อเริ่มบันทึกกิจกรรมแรก</div></div>';
  }

  el.innerHTML = kpis + addBtn + table;
}
window.renderMktEvents = renderMktEvents;

// ══════════════ EVENT FORM ══════════════
function _renderEventForm(el){
  var ev = _editingEvt;
  var b = _budgetSummary(ev);

  var html = '<div class="evt-form">';

  // Top bar
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">'
    +'<button class="evt-back-btn" onclick="evtBack()">← กลับรายการ</button>'
    +'<div style="display:flex;gap:8px">'
    +'<button class="evt-save-btn" onclick="evtSave()">💾 บันทึก</button>'
    +'</div></div>';

  // ── Section 1: Event Info ──
  html += '<div class="evt-section"><div class="evt-section-head">1️⃣ ข้อมูลทั่วไปของกิจกรรม</div><div class="evt-section-body"><div class="evt-grid">'
    + _field('วันที่บันทึก','date','recordDate',ev.recordDate)
    + _field('ชื่อ Event','text','name',ev.name)
    + _select('ประเภทกิจกรรม','type',EVENT_TYPES,ev.type)
    + _select('ช่องทางขาย','channel',CHANNELS,ev.channel)
    + _field('ผู้รับผิดชอบ','text','responsible',ev.responsible)
    + _select('แผนก','department',DEPTS,ev.department)
    + _select('สถานะ','status',STATUSES,ev.status)
    +'</div></div></div>';

  // ── Section 2: Event Details ──
  if(!ev.locations) ev.locations = [];
  // migrate old single-location
  if(ev.location && ev.locations.length===0) { ev.locations.push({name:ev.location,province:ev.province||''}); }
  html += '<div class="evt-section"><div class="evt-section-head">2️⃣ รายละเอียดการจัดงาน</div><div class="evt-section-body"><div class="evt-grid">'
    + _field('วันที่เริ่มต้น','date','startDate',ev.startDate)
    + _field('วันที่สิ้นสุด','date','endDate',ev.endDate)
    + _field('เวลาเริ่ม','time','startTime',ev.startTime)
    + _field('เวลาสิ้นสุด','time','endTime',ev.endTime)
    + _select('วัตถุประสงค์','objective',OBJECTIVES,ev.objective)
    +'</div>'
    +'<div style="margin-top:14px;font-size:13px;font-weight:700;color:#1e293b;margin-bottom:6px">📍 สถานที่จัดงาน</div>'
    +'<div style="overflow-x:auto"><table class="evt-tbl"><thead><tr><th>สถานที่</th><th style="width:180px">จังหวัด</th><th style="width:140px">วันที่</th><th style="width:40px"></th></tr></thead><tbody id="evtLocBody">';
  ev.locations.forEach(function(loc,i){ html += _locRow(loc,i); });
  html += '</tbody></table></div>'
    +'<button class="evt-add-btn" onclick="evtAddLoc()" style="margin-top:6px">➕ เพิ่มสถานที่</button>'
    +'</div></div>';

  // ── Section 3: Participants (with staff autocomplete) ──
  var staffOpts = _getStaffList().map(function(s){return '<option value="'+s.nick+'">'+s.nick+' — '+s.name+'</option>';}).join('');
  html += '<div class="evt-section"><div class="evt-section-head">3️⃣ ผู้เข้าร่วมโครงการ</div><div class="evt-section-body">'
    +'<datalist id="evtStaffList">'+staffOpts+'</datalist>'
    +'<div style="overflow-x:auto"><table class="evt-tbl"><thead><tr><th>ชื่อ (พิมพ์เพื่อค้นหา)</th><th>ตำแหน่ง</th><th>แผนก</th><th>เบอร์โทรศัพท์</th><th style="width:40px"></th></tr></thead><tbody id="evtPartBody">';
  ev.participants.forEach(function(p,i){
    html += _partRow(p,i);
  });
  html += '</tbody></table></div>'
    +'<button class="evt-add-btn" onclick="evtAddPart()" style="margin-top:8px">➕ เพิ่มรายการ</button>'
    +'<div id="evtPartSummary" style="margin-top:10px;padding:10px;background:#f8fafc;border-radius:10px;font-size:12px;color:#475569">'+_partSummary(ev)+'</div>'
    +'</div></div>';

  // ── Section 4: Products ──
  html += '<div class="evt-section"><div class="evt-section-head">4️⃣ สินค้าที่ใช้ในกิจกรรม</div><div class="evt-section-body">'
    +'<div style="overflow-x:auto"><table class="evt-tbl"><thead><tr><th>รหัสสินค้า</th><th>ชื่อสินค้า</th><th style="text-align:right">จำนวน</th><th style="text-align:right">ราคาส่ง/ชิ้น</th><th style="text-align:right">รวม</th><th style="width:40px"></th></tr></thead><tbody id="evtProdBody">';
  ev.products.forEach(function(p,i){
    html += _prodRow(p,i);
  });
  html += '</tbody></table></div>'
    +'<button class="evt-add-btn" onclick="evtAddProd()" style="margin-top:8px">➕ เพิ่มสินค้า</button>'
    +'<div id="evtProdSummary" style="margin-top:10px;padding:10px;background:#f8fafc;border-radius:10px;font-size:12px;color:#475569">'+_prodSummary(ev)+'</div>'
    +'</div></div>';

  // ── Section 5: Travel Expenses ──
  html += '<div class="evt-section"><div class="evt-section-head">5️⃣ ค่าใช้จ่ายในการเดินทาง</div><div class="evt-section-body">';

  // Fuel
  html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:6px">⛽ ค่าน้ำมัน</div>'
    +'<div style="overflow-x:auto"><table class="evt-tbl"><thead><tr><th>รายการ</th><th style="text-align:right;width:160px">จำนวนเงิน</th><th style="width:40px"></th></tr></thead><tbody id="evtFuelBody">';
  ev.fuel.forEach(function(f,i){ html += _expRow('fuel',f,i); });
  html += '</tbody></table></div><button class="evt-add-btn" onclick="evtAddExp(\'fuel\',\'เติมน้ำมันครั้งที่ '+(ev.fuel.length+1)+'\')" style="margin:6px 0 16px">➕ เพิ่มรายการ</button>';

  // Tolls
  html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:6px">🛣️ ค่าทางด่วน</div>'
    +'<div style="overflow-x:auto"><table class="evt-tbl"><thead><tr><th>รายการ</th><th style="text-align:right;width:160px">จำนวนเงิน</th><th style="width:40px"></th></tr></thead><tbody id="evtTollBody">';
  ev.tolls.forEach(function(t,i){ html += _expRow('toll',t,i); });
  html += '</tbody></table></div><button class="evt-add-btn" onclick="evtAddExp(\'toll\',\'ด่านที่ '+(ev.tolls.length+1)+'\')" style="margin:6px 0 16px">➕ เพิ่มรายการ</button>';

  // Accommodation
  html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:6px">🏨 ค่าที่พัก</div>'
    +'<div style="overflow-x:auto"><table class="evt-tbl"><thead><tr><th>โรงแรม</th><th style="text-align:right;width:100px">จำนวนคืน</th><th style="text-align:right;width:100px">จำนวนห้อง</th><th style="text-align:right;width:130px">ราคา/คืน/ห้อง</th><th style="text-align:right;width:100px">รวม</th><th style="width:40px"></th></tr></thead><tbody id="evtAccomBody">';
  ev.accommodation.forEach(function(a,i){ html += _accomRow(a,i); });
  html += '</tbody></table></div><button class="evt-add-btn" onclick="evtAddAccom()" style="margin:6px 0 16px">➕ เพิ่มรายการ</button>';

  // Per diem
  html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:6px">🍽️ ค่าเบี้ยเลี้ยง</div>'
    +'<div style="overflow-x:auto"><table class="evt-tbl"><thead><tr><th>พนักงาน</th><th style="text-align:right;width:100px">จำนวนวัน</th><th style="text-align:right;width:130px">อัตรา/วัน</th><th style="text-align:right;width:100px">รวม</th><th style="width:40px"></th></tr></thead><tbody id="evtPerDiemBody">';
  ev.perDiem.forEach(function(p,i){ html += _perDiemRow(p,i); });
  html += '</tbody></table></div><button class="evt-add-btn" onclick="evtAddPerDiem()" style="margin:6px 0 16px">➕ เพิ่มรายการ</button>';

  // Other expenses
  html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:6px">📋 ค่าใช้จ่ายอื่นๆ</div>'
    +'<div style="overflow-x:auto"><table class="evt-tbl"><thead><tr><th>รายการ</th><th style="text-align:right;width:160px">จำนวนเงิน</th><th style="width:40px"></th></tr></thead><tbody id="evtOtherBody">';
  ev.otherExpenses.forEach(function(o,i){ html += _expRow('other',o,i); });
  html += '</tbody></table></div><button class="evt-add-btn" onclick="evtAddExp(\'other\',\'\')" style="margin:6px 0 0">➕ เพิ่มรายการ</button>';

  html += '</div></div>';

  // ── Section 6: Budget Summary ──
  html += '<div class="evt-section"><div class="evt-section-head">6️⃣ สรุปงบประมาณ (Budget Summary)</div><div class="evt-section-body" id="evtBudgetSummary">'
    + _budgetHTML(b)
    +'</div></div>';

  // ── Section 7: Marketing ROI (4 มิติ) ──
  if(!ev.roi) ev.roi = {grossProfit:0,mktBudget:0,newCustCount:0,firstPurchaseRevenue:0,avgOrderValue:0,purchaseFreqYear:0,custLifeYears:0,laborSavings:0,agencySavings:0,wasteSavings:0,automationCost:0};
  var roi = ev.roi;
  html += '<div class="evt-section"><div class="evt-section-head">7️⃣ Marketing ROI (4 มิติ)</div><div class="evt-section-body">';

  // 7.1 Direct Sales
  html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:8px">📈 1. ยอดขายตรงและการเติบโต (Direct Sales)</div>'
    +'<div class="evt-grid">'
    + _field('ยอดขายก่อนแคมเปญ (บาท)','number','salesBefore',ev.salesBefore)
    + _field('ยอดขายหลังแคมเปญ (บาท)','number','salesAfter',ev.salesAfter)
    +'<div class="evt-field"><label>กำไรขั้นต้นจากแคมเปญ (บาท)</label><input type="number" data-roi="grossProfit" value="'+(roi.grossProfit||0)+'" onchange="evtRoiChange(this)"></div>'
    +'<div class="evt-field"><label>งบการตลาดทั้งหมด (บาท)</label><input type="number" data-roi="mktBudget" value="'+(roi.mktBudget||0)+'" onchange="evtRoiChange(this)"></div>'
    +'</div>';

  // 7.2 Customer Acquisition
  html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin:14px 0 8px">👥 2. การสร้างฐานลูกค้าใหม่ (Customer Acquisition)</div>'
    +'<div class="evt-grid">'
    +'<div class="evt-field"><label>จำนวนลูกค้าใหม่ (ราย)</label><input type="number" data-roi="newCustCount" value="'+(roi.newCustCount||0)+'" onchange="evtRoiChange(this)"></div>'
    +'<div class="evt-field"><label>รายได้จากการซื้อครั้งแรกรวม (บาท)</label><input type="number" data-roi="firstPurchaseRevenue" value="'+(roi.firstPurchaseRevenue||0)+'" onchange="evtRoiChange(this)"></div>'
    +'</div>';

  // 7.3 Customer Lifetime Value
  html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin:14px 0 8px">💎 3. คุณค่าลูกค้าระยะยาว (Customer Lifetime Value)</div>'
    +'<div class="evt-grid">'
    +'<div class="evt-field"><label>ยอดสั่งซื้อเฉลี่ย/ครั้ง (บาท)</label><input type="number" data-roi="avgOrderValue" value="'+(roi.avgOrderValue||0)+'" onchange="evtRoiChange(this)"></div>'
    +'<div class="evt-field"><label>ความถี่ซื้อ (ครั้ง/ปี)</label><input type="number" data-roi="purchaseFreqYear" value="'+(roi.purchaseFreqYear||0)+'" onchange="evtRoiChange(this)"></div>'
    +'<div class="evt-field"><label>ระยะเวลาเป็นลูกค้า (ปี)</label><input type="number" data-roi="custLifeYears" value="'+(roi.custLifeYears||0)+'" onchange="evtRoiChange(this)"></div>'
    +'</div>';

  // 7.4 Operational Efficiency
  html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin:14px 0 8px">⚙️ 4. ประสิทธิภาพกระบวนการ (Operational Efficiency)</div>'
    +'<div class="evt-grid">'
    +'<div class="evt-field"><label>ประหยัดค่าแรง/เดือน (บาท)</label><input type="number" data-roi="laborSavings" value="'+(roi.laborSavings||0)+'" onchange="evtRoiChange(this)"></div>'
    +'<div class="evt-field"><label>ประหยัดค่าเอเจนซี/เดือน (บาท)</label><input type="number" data-roi="agencySavings" value="'+(roi.agencySavings||0)+'" onchange="evtRoiChange(this)"></div>'
    +'<div class="evt-field"><label>ลดของเสีย/เดือน (บาท)</label><input type="number" data-roi="wasteSavings" value="'+(roi.wasteSavings||0)+'" onchange="evtRoiChange(this)"></div>'
    +'<div class="evt-field"><label>ต้นทุนระบบ Automation (บาท)</label><input type="number" data-roi="automationCost" value="'+(roi.automationCost||0)+'" onchange="evtRoiChange(this)"></div>'
    +'</div>';

  // ROI Dashboard
  html += '<div id="evtRoiDashboard" style="margin-top:16px">'+_roiDashHTML(ev)+'</div>';
  html += '</div></div>';

  // ── Section 8: Event Goals / Results ──
  if(!ev.goals) ev.goals = {lineOaBefore:0,lineOaAfter:0,fbBefore:0,fbAfter:0,newProdItems:0,newProdAmount:0,newCustomers:0,newCustBills:[],clipTarget:0,clipActual:0};
  var g = ev.goals;
  html += '<div class="evt-section"><div class="evt-section-head">8️⃣ เป้าหมาย / ผลลัพธ์กิจกรรม (Event Goals)</div><div class="evt-section-body">';

  // Line OA
  html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:8px">📱 Line OA</div>'
    +'<div class="evt-grid">'
    +'<div class="evt-field"><label>ผู้ติดตาม (ก่อน)</label><input type="number" data-goal="lineOaBefore" value="'+(g.lineOaBefore||0)+'" onchange="evtGoalChange(this)"></div>'
    +'<div class="evt-field"><label>ผู้ติดตาม (หลัง)</label><input type="number" data-goal="lineOaAfter" value="'+(g.lineOaAfter||0)+'" onchange="evtGoalChange(this)"></div>'
    +'</div>';

  // Facebook
  html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin:14px 0 8px">📘 Facebook Page</div>'
    +'<div class="evt-grid">'
    +'<div class="evt-field"><label>ผู้ติดตาม (ก่อน)</label><input type="number" data-goal="fbBefore" value="'+(g.fbBefore||0)+'" onchange="evtGoalChange(this)"></div>'
    +'<div class="evt-field"><label>ผู้ติดตาม (หลัง)</label><input type="number" data-goal="fbAfter" value="'+(g.fbAfter||0)+'" onchange="evtGoalChange(this)"></div>'
    +'</div>';

  // New product sales
  html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin:14px 0 8px">🆕 ยอดขายสินค้าใหม่ที่นำไปเสนอ</div>'
    +'<div class="evt-grid">'
    +'<div class="evt-field"><label>จำนวน (ชิ้น)</label><input type="number" data-goal="newProdItems" value="'+(g.newProdItems||0)+'" onchange="evtGoalChange(this)"></div>'
    +'<div class="evt-field"><label>ยอดเงิน (บาท)</label><input type="number" data-goal="newProdAmount" value="'+(g.newProdAmount||0)+'" onchange="evtGoalChange(this)"></div>'
    +'</div>';

  // New customers
  html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin:14px 0 8px">🏪 ลูกค้าใหม่ (ภายใน 30 วันหลังจัดงาน)</div>'
    +'<div class="evt-grid">'
    +'<div class="evt-field"><label>จำนวนร้าน</label><input type="number" data-goal="newCustomers" value="'+(g.newCustomers||0)+'" onchange="evtGoalChange(this)"></div>'
    +'</div>'
    +'<div style="margin-top:8px"><label style="font-size:12px;font-weight:600;color:#475569">หมายเลขบิลลูกค้าใหม่</label>'
    +'<div style="overflow-x:auto;margin-top:4px"><table class="evt-tbl"><thead><tr><th>ร้าน/ลูกค้า</th><th>หมายเลขบิล</th><th>วันที่</th><th style="width:40px"></th></tr></thead><tbody id="evtBillBody">';
  (g.newCustBills||[]).forEach(function(bill,i){ html += _billRow(bill,i); });
  html += '</tbody></table></div>'
    +'<button class="evt-add-btn" onclick="evtAddBill()" style="margin-top:6px">➕ เพิ่มบิลลูกค้าใหม่</button></div>';

  // Clips
  html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin:14px 0 8px">🎬 คลิปโปรโมทหน้างาน</div>'
    +'<div class="evt-grid">'
    +'<div class="evt-field"><label>เป้าหมาย (คลิป)</label><input type="number" data-goal="clipTarget" value="'+(g.clipTarget||0)+'" onchange="evtGoalChange(this)"></div>'
    +'<div class="evt-field"><label>ทำได้จริง (คลิป)</label><input type="number" data-goal="clipActual" value="'+(g.clipActual||0)+'" onchange="evtGoalChange(this)"></div>'
    +'</div>';

  // Goals summary
  html += '<div id="evtGoalsSummary" style="margin-top:16px">'+_goalsSummaryHTML(g)+'</div>';
  html += '</div></div>';

  // ── Section 9: AI Analysis ──
  html += '<div class="evt-section"><div class="evt-section-head">9️⃣ 🤖 AI วิเคราะห์ความคุ้มค่า</div><div class="evt-section-body">'
    +'<button class="evt-save-btn" onclick="evtAiAnalyze()" style="background:linear-gradient(135deg,#7c3aed,#2563eb);margin-bottom:12px">🤖 วิเคราะห์โดย AI</button>'
    +'<div id="evtAiResult" style="padding:16px;background:#f8fafc;border-radius:12px;font-size:13px;color:#334155;line-height:1.8;min-height:60px">'
    +'<span style="color:#94a3b8">กดปุ่มด้านบนเพื่อให้ AI วิเคราะห์ความคุ้มค่าของ Event นี้</span>'
    +'</div></div></div>';

  // ── Section 10: Memo Generation ──
  html += '<div class="evt-section"><div class="evt-section-head">🔟 📋 Memo เสนอโครงการ</div><div class="evt-section-body">'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">'
    +'<button class="evt-save-btn" onclick="evtGenMemo()" style="background:linear-gradient(135deg,#0891b2,#0284c7)">📝 สร้าง Memo</button>'
    +'<button class="evt-add-btn" onclick="evtDownloadMemo(\'pdf\')" style="background:#dc2626;color:#fff;border-color:#dc2626">📄 PDF</button>'
    +'<button class="evt-add-btn" onclick="evtDownloadMemo(\'image\')" style="background:#7c3aed;color:#fff;border-color:#7c3aed">🖼️ รูปภาพ</button>'
    +'<button class="evt-add-btn" onclick="evtDownloadMemo(\'excel\')" style="background:#16a34a;color:#fff;border-color:#16a34a">📊 Excel</button>'
    +'</div>'
    +'<div id="evtMemoContent" style="padding:20px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;min-height:80px;font-size:13px;color:#334155;line-height:1.8">'
    +'<span style="color:#94a3b8">กดปุ่ม "สร้าง Memo" เพื่อสร้างเอกสารเสนอโครงการ</span>'
    +'</div></div></div>';

  // Bottom save
  html += '<div style="display:flex;justify-content:flex-end;gap:8px;margin:16px 0 30px">'
    +'<button class="evt-back-btn" onclick="evtBack()">← กลับ</button>'
    +'<button class="evt-save-btn" onclick="evtSave()">💾 บันทึก</button>'
    +'</div>';

  html += '</div>';
  el.innerHTML = html;
}

// ── Field helpers ──
function _field(label,type,name,val){
  return '<div class="evt-field"><label>'+label+'</label><input type="'+type+'" data-evt="'+name+'" value="'+(val||'')+'" onchange="evtFieldChange(this)"></div>';
}
function _select(label,name,options,val){
  var html = '<div class="evt-field"><label>'+label+'</label><select data-evt="'+name+'" onchange="evtFieldChange(this)"><option value="">-- เลือก --</option>';
  options.forEach(function(o){ html += '<option value="'+o+'"'+(o===val?' selected':'')+'>'+o+'</option>'; });
  return html + '</select></div>';
}

// ── Row renderers ──
function _locRow(loc,i){
  var provOpts = '<option value="">-- เลือก --</option>';
  PROVINCES.forEach(function(p){ provOpts += '<option value="'+p+'"'+(p===(loc.province||'')?' selected':'')+'>'+p+'</option>'; });
  return '<tr><td><input value="'+(loc.name||'')+'" placeholder="ชื่อสถานที่" onchange="evtLocChange('+i+',\'name\',this.value)"></td>'
    +'<td><select onchange="evtLocChange('+i+',\'province\',this.value)">'+provOpts+'</select></td>'
    +'<td><input type="date" value="'+(loc.date||'')+'" onchange="evtLocChange('+i+',\'date\',this.value)"></td>'
    +'<td><button class="evt-del-btn" onclick="evtDelLoc('+i+')">🗑️</button></td></tr>';
}
function _partRow(p,i){
  return '<tr><td><input list="evtStaffList" value="'+(p.name||'')+'" placeholder="พิมพ์ชื่อเล่น..." onchange="evtPartStaffSelect('+i+',this.value)"></td>'
    +'<td><input value="'+(p.position||'')+'" readonly style="background:#f1f5f9;color:#475569"></td>'
    +'<td><input value="'+(p.department||'')+'" readonly style="background:#f1f5f9;color:#475569"></td>'
    +'<td><input value="'+(p.phone||'')+'" readonly style="background:#f1f5f9;color:#475569"></td>'
    +'<td><button class="evt-del-btn" onclick="evtDelPart('+i+')">🗑️</button></td></tr>';
}
function _prodRow(p,i){
  var tot = _productTotal(p);
  var prodList = _getAllProducts();
  var dlId = 'evtProdDL'+i;
  var dl = '<datalist id="'+dlId+'">';
  prodList.forEach(function(pr){ dl+='<option value="'+pr.code+'">'+pr.code+' — '+pr.name+'</option>'; });
  dl+='</datalist>';
  return '<tr><td>'+dl+'<input list="'+dlId+'" value="'+(p.code||'')+'" placeholder="พิมพ์รหัสสินค้า..." onchange="evtProdCodeLookup('+i+',this.value)"></td>'
    +'<td><input value="'+(p.name||'')+'" readonly style="background:#f1f5f9;color:#475569"></td>'
    +'<td><input type="number" value="'+(p.qty||'')+'" onchange="evtProdChange('+i+',\'qty\',this.value)" style="text-align:right"></td>'
    +'<td><input type="number" value="'+(p.price||'')+'" onchange="evtProdChange('+i+',\'price\',this.value)" style="text-align:right"></td>'
    +'<td style="text-align:right;font-weight:700;color:#2563eb">฿'+_fmt(tot)+'</td>'
    +'<td><button class="evt-del-btn" onclick="evtDelProd('+i+')">🗑️</button></td></tr>';
}
function _expRow(type,item,i){
  return '<tr><td><input value="'+(item.label||'')+'" onchange="evtExpChange(\''+type+'\','+i+',\'label\',this.value)"></td>'
    +'<td><input type="number" value="'+(item.amount||'')+'" onchange="evtExpChange(\''+type+'\','+i+',\'amount\',this.value)" style="text-align:right"></td>'
    +'<td><button class="evt-del-btn" onclick="evtDelExp(\''+type+'\','+i+')">🗑️</button></td></tr>';
}
function _accomRow(a,i){
  var tot = _accomTotal(a);
  return '<tr><td><input value="'+(a.hotel||'')+'" onchange="evtAccomChange('+i+',\'hotel\',this.value)"></td>'
    +'<td><input type="number" value="'+(a.nights||'')+'" onchange="evtAccomChange('+i+',\'nights\',this.value)" style="text-align:right"></td>'
    +'<td><input type="number" value="'+(a.rooms||'')+'" onchange="evtAccomChange('+i+',\'rooms\',this.value)" style="text-align:right"></td>'
    +'<td><input type="number" value="'+(a.amount||'')+'" onchange="evtAccomChange('+i+',\'amount\',this.value)" style="text-align:right"></td>'
    +'<td style="text-align:right;font-weight:700;color:#2563eb">฿'+_fmt(tot)+'</td>'
    +'<td><button class="evt-del-btn" onclick="evtDelAccom('+i+')">🗑️</button></td></tr>';
}
function _perDiemRow(p,i){
  var tot = _perDiemTotal(p);
  return '<tr><td><input value="'+(p.employee||'')+'" onchange="evtPerDiemChange('+i+',\'employee\',this.value)"></td>'
    +'<td><input type="number" value="'+(p.days||'')+'" onchange="evtPerDiemChange('+i+',\'days\',this.value)" style="text-align:right"></td>'
    +'<td><input type="number" value="'+(p.rate||'')+'" onchange="evtPerDiemChange('+i+',\'rate\',this.value)" style="text-align:right"></td>'
    +'<td style="text-align:right;font-weight:700;color:#2563eb">฿'+_fmt(tot)+'</td>'
    +'<td><button class="evt-del-btn" onclick="evtDelPerDiem('+i+')">🗑️</button></td></tr>';
}

// ── Summary renderers ──
function _partSummary(ev){
  var total = ev.participants.length;
  var sales = ev.participants.filter(function(p){return (p.department||'').toLowerCase().indexOf('sale')!==-1;}).length;
  var mkt = ev.participants.filter(function(p){return (p.department||'').toLowerCase().indexOf('market')!==-1;}).length;
  return '👥 ผู้เข้าร่วมทั้งหมด: <b>'+total+'</b> คน | 🛒 ฝ่ายขาย: <b>'+sales+'</b> คน | 📣 ฝ่ายการตลาด: <b>'+mkt+'</b> คน';
}
function _prodSummary(ev){
  var items = ev.products.length;
  var qty = ev.products.reduce(function(s,p){return s+(parseFloat(p.qty)||0);},0);
  var val = ev.products.reduce(function(s,p){return s+_productTotal(p);},0);
  return '📦 จำนวนสินค้า: <b>'+items+'</b> รายการ | 📊 จำนวนชิ้นรวม: <b>'+_fmt(qty)+'</b> ชิ้น | 💰 มูลค่ารวม: <b>฿'+_fmt(val)+'</b>';
}
function _budgetHTML(b){
  return '<div style="max-width:400px">'
    +'<div class="evt-summary-row"><span>📦 ค่าสินค้า</span><span class="evt-summary-val">฿'+_fmt(b.prodCost)+'</span></div>'
    +'<div class="evt-summary-row"><span>🏨 ค่าที่พัก</span><span class="evt-summary-val">฿'+_fmt(b.accomCost)+'</span></div>'
    +'<div class="evt-summary-row"><span>🚗 ค่าเดินทาง (น้ำมัน+ทางด่วน)</span><span class="evt-summary-val">฿'+_fmt(b.travelCost)+'</span></div>'
    +'<div class="evt-summary-row"><span>🍽️ ค่าเบี้ยเลี้ยง</span><span class="evt-summary-val">฿'+_fmt(b.perDiemCost)+'</span></div>'
    +'<div class="evt-summary-row"><span>📋 ค่าใช้จ่ายอื่น</span><span class="evt-summary-val">฿'+_fmt(b.otherCost)+'</span></div>'
    +'<div class="evt-summary-row"><span>💰 รวมทั้งหมด</span><span class="evt-summary-val" style="color:#dc2626;font-size:18px">฿'+_fmt(b.total)+'</span></div>'
    +'</div>';
}
function _roiCalc(ev){
  var r = ev.roi || {};
  var b = _budgetSummary(ev);
  var salesBefore = parseFloat(ev.salesBefore)||0;
  var salesAfter = parseFloat(ev.salesAfter)||0;
  var salesDiff = salesAfter - salesBefore;
  var grossProfit = parseFloat(r.grossProfit)||0;
  var mktBudget = parseFloat(r.mktBudget)||0;
  // 1. Direct Sales ROI
  var directROI = mktBudget > 0 ? ((grossProfit - mktBudget) / mktBudget * 100) : 0;
  // 2. CAC
  var newCustCount = parseFloat(r.newCustCount)||0;
  var firstPurchaseRevenue = parseFloat(r.firstPurchaseRevenue)||0;
  var cac = newCustCount > 0 ? (mktBudget / newCustCount) : 0;
  var revenuePerNewCust = newCustCount > 0 ? (firstPurchaseRevenue / newCustCount) : 0;
  var cacROIPositive = revenuePerNewCust > cac;
  // 3. LTV
  var avgOrder = parseFloat(r.avgOrderValue)||0;
  var freq = parseFloat(r.purchaseFreqYear)||0;
  var years = parseFloat(r.custLifeYears)||0;
  var ltv = avgOrder * freq * years;
  var ltvCacRatio = cac > 0 ? (ltv / cac) : 0;
  // 4. Operational
  var laborSav = parseFloat(r.laborSavings)||0;
  var agencySav = parseFloat(r.agencySavings)||0;
  var wasteSav = parseFloat(r.wasteSavings)||0;
  var autoCost = parseFloat(r.automationCost)||0;
  var totalSavingsYear = (laborSav + agencySav + wasteSav) * 12;
  var opROI = autoCost > 0 ? ((totalSavingsYear - autoCost) / autoCost * 100) : 0;

  return {salesBefore:salesBefore, salesAfter:salesAfter, salesDiff:salesDiff,
    grossProfit:grossProfit, mktBudget:mktBudget, directROI:directROI, totalCost:b.total,
    newCustCount:newCustCount, firstPurchaseRevenue:firstPurchaseRevenue, cac:cac,
    revenuePerNewCust:revenuePerNewCust, cacROIPositive:cacROIPositive,
    ltv:ltv, ltvCacRatio:ltvCacRatio,
    laborSav:laborSav, agencySav:agencySav, wasteSav:wasteSav, autoCost:autoCost,
    totalSavingsYear:totalSavingsYear, opROI:opROI};
}

function _roiCard(icon,title,value,color,sub){
  return '<div style="padding:12px;background:#fff;border-radius:10px;border-left:4px solid '+color+'">'
    +'<div style="font-size:10px;color:#64748b">'+icon+' '+title+'</div>'
    +'<div style="font-size:20px;font-weight:800;color:'+color+'">'+value+'</div>'
    +(sub?'<div style="font-size:10px;color:#64748b;margin-top:2px">'+sub+'</div>':'')
    +'</div>';
}

function _roiDashHTML(ev){
  var c = _roiCalc(ev);
  var hasData = c.mktBudget>0 || c.salesAfter>0 || c.newCustCount>0;
  if(!hasData) return '<div style="padding:20px;text-align:center;color:#94a3b8;font-size:13px">📊 กรอกข้อมูลด้านบนเพื่อแสดงผลวิเคราะห์ ROI 4 มิติ</div>';

  var directColor = c.directROI > 0 ? '#16a34a' : c.directROI < 0 ? '#dc2626' : '#64748b';
  var cacColor = c.cacROIPositive ? '#16a34a' : c.cac > 0 ? '#f97316' : '#64748b';
  var ltvColor = c.ltvCacRatio >= 3 ? '#16a34a' : c.ltvCacRatio >= 1 ? '#f97316' : c.ltvCacRatio > 0 ? '#dc2626' : '#64748b';
  var opColor = c.opROI > 0 ? '#16a34a' : c.opROI < 0 ? '#dc2626' : '#64748b';

  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;padding:14px;background:linear-gradient(135deg,#f8fafc,#f0f9ff);border-radius:14px">';

  // Card 1: Direct ROI
  html += _roiCard('📈','Direct Sales ROI',
    c.mktBudget>0 ? c.directROI.toFixed(1)+'%' : '-', directColor,
    c.mktBudget>0 ? 'กำไร ฿'+_fmt(c.grossProfit)+' / งบ ฿'+_fmt(c.mktBudget) : '');

  // Card 2: CAC
  html += _roiCard('👥','Customer Acquisition',
    c.newCustCount>0 ? '฿'+_fmt(Math.round(c.cac))+'/คน' : '-', cacColor,
    c.newCustCount>0 ? 'ลูกค้าใหม่ '+_fmt(c.newCustCount)+' ราย | รายได้ ฿'+_fmt(Math.round(c.revenuePerNewCust))+'/คน' : '');

  // Card 3: LTV:CAC
  html += _roiCard('💎','LTV : CAC Ratio',
    c.ltvCacRatio>0 ? c.ltvCacRatio.toFixed(1)+' : 1' : '-', ltvColor,
    c.ltv>0 ? 'LTV ฿'+_fmt(Math.round(c.ltv))+' | '+(c.ltvCacRatio>=3?'✅ ดีมาก':c.ltvCacRatio>=1?'⚠️ พอใช้':'❌ ต่ำเกินไป') : 'เกณฑ์ดี ≥ 3:1');

  // Card 4: Operational
  html += _roiCard('⚙️','Operational Savings',
    c.totalSavingsYear>0 ? '฿'+_fmt(Math.round(c.totalSavingsYear))+'/ปี' : '-', opColor,
    c.autoCost>0 ? 'ROI '+c.opROI.toFixed(1)+'% | ต้นทุนระบบ ฿'+_fmt(c.autoCost) : '');

  html += '</div>';

  // Overall verdict
  var score = 0;
  if(c.directROI > 0) score++; if(c.directROI > 50) score++;
  if(c.cacROIPositive) score++;
  if(c.ltvCacRatio >= 3) score += 2; else if(c.ltvCacRatio >= 1) score++;
  if(c.opROI > 0) score++;

  var verdictBg, verdictColor, verdictText;
  if(score >= 5){ verdictBg='#dcfce7'; verdictColor='#16a34a'; verdictText='🏆 ผลตอบแทนดีเยี่ยมทุกมิติ — แนะนำขยายผลแคมเปญ'; }
  else if(score >= 3){ verdictBg='#fef9c3'; verdictColor='#a16207'; verdictText='👍 ผลตอบแทนพอใช้ได้ — ควรปรับปรุงมิติที่ยังอ่อน'; }
  else if(score >= 1){ verdictBg='#fed7aa'; verdictColor='#c2410c'; verdictText='⚠️ ผลตอบแทนยังไม่ดีนัก — ทบทวนกลยุทธ์และงบประมาณ'; }
  else { verdictBg='#f1f5f9'; verdictColor='#64748b'; verdictText='📊 กรอกข้อมูลเพิ่มเพื่อวิเคราะห์ครบทุกมิติ'; }

  html += '<div style="margin-top:10px;padding:10px 14px;background:'+verdictBg+';border-radius:10px;font-size:13px;font-weight:700;color:'+verdictColor+';text-align:center">'+verdictText+'</div>';

  return html;
}

// ── Event handlers ──
window.evtFieldChange = function(input){
  var key = input.getAttribute('data-evt');
  if(!key || !_editingEvt) return;
  _editingEvt[key] = input.value;
  // Live-update budget and ROI sections
  if(key==='salesBefore'||key==='salesAfter'){
    var b = _budgetSummary(_editingEvt);
    var bs = document.getElementById('evtBudgetSummary');
    if(bs) bs.innerHTML = _budgetHTML(b);
    var rd = document.getElementById('evtRoiDashboard');
    if(rd) rd.innerHTML = _roiDashHTML(_editingEvt);
  }
};

// Participants
window.evtAddPart = function(){
  _editingEvt.participants.push({name:'',position:'',department:'',phone:''});
  _refreshPartTable();
};
window.evtPartChange = function(i,key,val){
  _editingEvt.participants[i][key] = val;
  var s = document.getElementById('evtPartSummary');
  if(s) s.innerHTML = _partSummary(_editingEvt);
};
window.evtDelPart = function(i){
  _editingEvt.participants.splice(i,1);
  _refreshPartTable();
};
function _refreshPartTable(){
  var tb = document.getElementById('evtPartBody');
  if(!tb) return;
  tb.innerHTML = '';
  _editingEvt.participants.forEach(function(p,i){ tb.innerHTML += _partRow(p,i); });
  var s = document.getElementById('evtPartSummary');
  if(s) s.innerHTML = _partSummary(_editingEvt);
}

// Products
window.evtAddProd = function(){
  _editingEvt.products.push({code:'',name:'',qty:0,price:0});
  _refreshProdTable();
};
window.evtProdChange = function(i,key,val){
  _editingEvt.products[i][key] = key==='code'||key==='name' ? val : parseFloat(val)||0;
  _refreshProdTable();
};
window.evtDelProd = function(i){
  _editingEvt.products.splice(i,1);
  _refreshProdTable();
};
function _refreshProdTable(){
  var tb = document.getElementById('evtProdBody');
  if(!tb) return;
  tb.innerHTML = '';
  _editingEvt.products.forEach(function(p,i){ tb.innerHTML += _prodRow(p,i); });
  var s = document.getElementById('evtProdSummary');
  if(s) s.innerHTML = _prodSummary(_editingEvt);
  _refreshBudget();
}

// Generic expense (fuel/toll/other)
window.evtAddExp = function(type,defaultLabel){
  var arr = type==='fuel'? _editingEvt.fuel : type==='toll'? _editingEvt.tolls : _editingEvt.otherExpenses;
  arr.push({label:defaultLabel||'',amount:0});
  _refreshExpTable(type);
};
window.evtExpChange = function(type,i,key,val){
  var arr = type==='fuel'? _editingEvt.fuel : type==='toll'? _editingEvt.tolls : _editingEvt.otherExpenses;
  arr[i][key] = key==='amount' ? parseFloat(val)||0 : val;
  _refreshBudget();
};
window.evtDelExp = function(type,i){
  var arr = type==='fuel'? _editingEvt.fuel : type==='toll'? _editingEvt.tolls : _editingEvt.otherExpenses;
  arr.splice(i,1);
  _refreshExpTable(type);
};
function _refreshExpTable(type){
  var bodyId = type==='fuel'?'evtFuelBody':type==='toll'?'evtTollBody':'evtOtherBody';
  var tb = document.getElementById(bodyId);
  if(!tb) return;
  var arr = type==='fuel'? _editingEvt.fuel : type==='toll'? _editingEvt.tolls : _editingEvt.otherExpenses;
  tb.innerHTML = '';
  arr.forEach(function(item,i){ tb.innerHTML += _expRow(type,item,i); });
  _refreshBudget();
}

// Accommodation
window.evtAddAccom = function(){
  _editingEvt.accommodation.push({hotel:'',nights:0,rooms:0,amount:0});
  _refreshAccomTable();
};
window.evtAccomChange = function(i,key,val){
  _editingEvt.accommodation[i][key] = key==='hotel' ? val : parseFloat(val)||0;
  _refreshAccomTable();
};
window.evtDelAccom = function(i){
  _editingEvt.accommodation.splice(i,1);
  _refreshAccomTable();
};
function _refreshAccomTable(){
  var tb = document.getElementById('evtAccomBody');
  if(!tb) return;
  tb.innerHTML = '';
  _editingEvt.accommodation.forEach(function(a,i){ tb.innerHTML += _accomRow(a,i); });
  _refreshBudget();
}

// Per diem
window.evtAddPerDiem = function(){
  _editingEvt.perDiem.push({employee:'',days:0,rate:0});
  _refreshPerDiemTable();
};
window.evtPerDiemChange = function(i,key,val){
  _editingEvt.perDiem[i][key] = key==='employee' ? val : parseFloat(val)||0;
  _refreshPerDiemTable();
};
window.evtDelPerDiem = function(i){
  _editingEvt.perDiem.splice(i,1);
  _refreshPerDiemTable();
};
function _refreshPerDiemTable(){
  var tb = document.getElementById('evtPerDiemBody');
  if(!tb) return;
  tb.innerHTML = '';
  _editingEvt.perDiem.forEach(function(p,i){ tb.innerHTML += _perDiemRow(p,i); });
  _refreshBudget();
}

function _refreshBudget(){
  var b = _budgetSummary(_editingEvt);
  var bs = document.getElementById('evtBudgetSummary');
  if(bs) bs.innerHTML = _budgetHTML(b);
}

// ── Bill row renderer ──
function _billRow(bill,i){
  return '<tr><td><input value="'+(bill.customer||'')+'" placeholder="ชื่อร้าน/ลูกค้า" onchange="evtBillChange('+i+',\'customer\',this.value)"></td>'
    +'<td><input value="'+(bill.billNo||'')+'" placeholder="เลขบิล" onchange="evtBillChange('+i+',\'billNo\',this.value)"></td>'
    +'<td><input type="date" value="'+(bill.date||'')+'" onchange="evtBillChange('+i+',\'date\',this.value)"></td>'
    +'<td><button class="evt-del-btn" onclick="evtDelBill('+i+')">🗑️</button></td></tr>';
}

// ── Goals summary ──
function _goalsSummaryHTML(g){
  var lineGain = (g.lineOaAfter||0) - (g.lineOaBefore||0);
  var fbGain = (g.fbAfter||0) - (g.fbBefore||0);
  var clipPct = (g.clipTarget||0) > 0 ? Math.round((g.clipActual||0)/(g.clipTarget)*100) : 0;
  return '<div style="padding:14px;background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border-radius:12px">'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;text-align:center">'
    +'<div style="padding:8px;background:#fff;border-radius:8px"><div style="font-size:10px;color:#64748b">Line OA เพิ่ม</div><div style="font-size:18px;font-weight:800;color:'+(lineGain>0?'#16a34a':'#94a3b8')+'">+'+(lineGain>0?_fmt(lineGain):'0')+'</div></div>'
    +'<div style="padding:8px;background:#fff;border-radius:8px"><div style="font-size:10px;color:#64748b">Facebook เพิ่ม</div><div style="font-size:18px;font-weight:800;color:'+(fbGain>0?'#16a34a':'#94a3b8')+'">+'+(fbGain>0?_fmt(fbGain):'0')+'</div></div>'
    +'<div style="padding:8px;background:#fff;border-radius:8px"><div style="font-size:10px;color:#64748b">สินค้าใหม่</div><div style="font-size:18px;font-weight:800;color:#2563eb">'+_fmt(g.newProdItems||0)+' ชิ้น</div><div style="font-size:10px;color:#64748b">฿'+_fmt(g.newProdAmount||0)+'</div></div>'
    +'<div style="padding:8px;background:#fff;border-radius:8px"><div style="font-size:10px;color:#64748b">ลูกค้าใหม่</div><div style="font-size:18px;font-weight:800;color:#7c3aed">'+_fmt(g.newCustomers||0)+' ร้าน</div><div style="font-size:10px;color:#64748b">'+((g.newCustBills||[]).length)+' บิล</div></div>'
    +'<div style="padding:8px;background:#fff;border-radius:8px"><div style="font-size:10px;color:#64748b">คลิป</div><div style="font-size:18px;font-weight:800;color:'+(clipPct>=100?'#16a34a':'#f97316')+'">'+(g.clipActual||0)+'/'+(g.clipTarget||0)+'</div><div style="font-size:10px;color:#64748b">'+clipPct+'%</div></div>'
    +'</div></div>';
}

// ── Location handlers ──
window.evtAddLoc = function(){
  _editingEvt.locations.push({name:'',province:''});
  _refreshLocTable();
};
window.evtLocChange = function(i,key,val){
  _editingEvt.locations[i][key] = val;
};
window.evtDelLoc = function(i){
  _editingEvt.locations.splice(i,1);
  _refreshLocTable();
};
function _refreshLocTable(){
  var tb = document.getElementById('evtLocBody');
  if(!tb) return;
  tb.innerHTML = '';
  _editingEvt.locations.forEach(function(loc,i){ tb.innerHTML += _locRow(loc,i); });
}

// ── Staff autocomplete handler ──
window.evtPartStaffSelect = function(i,val){
  var staff = _findStaff(val);
  if(staff){
    _editingEvt.participants[i] = {name:staff.nick, position:staff.positionTh||'', department:staff.deptTh||staff.dept||'', phone:staff.phone||''};
  } else {
    _editingEvt.participants[i].name = val;
  }
  _refreshPartTable();
  var s = document.getElementById('evtPartSummary');
  if(s) s.innerHTML = _partSummary(_editingEvt);
};

// ── Product code autocomplete handler ──
window.evtProdCodeLookup = function(i,code){
  var prod = _findProduct(code);
  if(prod){
    _editingEvt.products[i].code = prod.code;
    _editingEvt.products[i].name = prod.name;
    _editingEvt.products[i].price = prod.price||0;
  } else {
    _editingEvt.products[i].code = code;
  }
  _refreshProdTable();
};

// ── ROI handlers ──
window.evtRoiChange = function(el){
  var key = el.getAttribute('data-roi');
  if(!key || !_editingEvt) return;
  if(!_editingEvt.roi) _editingEvt.roi = {};
  _editingEvt.roi[key] = parseFloat(el.value)||0;
  var rd = document.getElementById('evtRoiDashboard');
  if(rd) rd.innerHTML = _roiDashHTML(_editingEvt);
};

// ── Goals handlers ──
window.evtGoalChange = function(el){
  var key = el.getAttribute('data-goal');
  if(!key || !_editingEvt) return;
  if(!_editingEvt.goals) _editingEvt.goals = {};
  _editingEvt.goals[key] = parseFloat(el.value)||0;
  var gs = document.getElementById('evtGoalsSummary');
  if(gs) gs.innerHTML = _goalsSummaryHTML(_editingEvt.goals);
};
window.evtAddBill = function(){
  if(!_editingEvt.goals) _editingEvt.goals = {};
  if(!_editingEvt.goals.newCustBills) _editingEvt.goals.newCustBills = [];
  _editingEvt.goals.newCustBills.push({customer:'',billNo:'',date:''});
  _refreshBillTable();
};
window.evtBillChange = function(i,key,val){
  _editingEvt.goals.newCustBills[i][key] = val;
};
window.evtDelBill = function(i){
  _editingEvt.goals.newCustBills.splice(i,1);
  _refreshBillTable();
};
function _refreshBillTable(){
  var tb = document.getElementById('evtBillBody');
  if(!tb) return;
  tb.innerHTML = '';
  (_editingEvt.goals.newCustBills||[]).forEach(function(bill,i){ tb.innerHTML += _billRow(bill,i); });
  var gs = document.getElementById('evtGoalsSummary');
  if(gs) gs.innerHTML = _goalsSummaryHTML(_editingEvt.goals);
}

// ── AI Analysis (4 มิติ ROI) ──
window.evtAiAnalyze = function(){
  if(!_editingEvt) return;
  var ev = _editingEvt;
  var b = _budgetSummary(ev);
  var c = _roiCalc(ev);
  var g = ev.goals || {};
  var lineGain = (g.lineOaAfter||0)-(g.lineOaBefore||0);
  var fbGain = (g.fbAfter||0)-(g.fbBefore||0);
  var clipPct = (g.clipTarget||0)>0 ? Math.round((g.clipActual||0)/(g.clipTarget)*100) : 0;
  var days = 0;
  if(ev.startDate && ev.endDate){ days = Math.max(1,Math.ceil((new Date(ev.endDate)-new Date(ev.startDate))/(1000*60*60*24))+1); }

  var html = '<div style="line-height:2">';
  html += '<div style="font-weight:700;font-size:15px;color:#1e293b;margin-bottom:10px">📊 สรุปผลการวิเคราะห์ ROI 4 มิติ: '+ev.name+'</div>';

  // ── มิติที่ 1: Direct Sales ──
  html += '<div style="padding:12px;background:#f0fdf4;border-radius:10px;margin-bottom:10px;border-left:4px solid #16a34a">';
  html += '<b>📈 มิติที่ 1: ยอดขายตรง (Direct Sales ROI)</b><br>';
  html += 'ค่าใช้จ่ายรวม: ฿'+_fmt(b.total);
  if(days>0) html += ' (฿'+_fmt(Math.round(b.total/days))+'/วัน)';
  html += '<br>';
  if(c.mktBudget>0){
    html += 'สูตร: (กำไรขั้นต้น ฿'+_fmt(c.grossProfit)+' - งบการตลาด ฿'+_fmt(c.mktBudget)+') / งบการตลาด × 100<br>';
    html += '<b>ROI = '+c.directROI.toFixed(1)+'%</b> ';
    if(c.directROI>50) html += '<span style="color:#16a34a">✅ คุ้มค่ามาก!</span>';
    else if(c.directROI>0) html += '<span style="color:#f97316">⚠️ คุ้มค่าเล็กน้อย ควรหาทางเพิ่มกำไรหรือลดงบ</span>';
    else html += '<span style="color:#dc2626">❌ ขาดทุน ควรทบทวนรูปแบบแคมเปญ</span>';
  } else {
    html += '<span style="color:#94a3b8">กรอกกำไรขั้นต้นและงบการตลาดเพื่อคำนวณ</span>';
  }
  html += '</div>';

  // ── มิติที่ 2: Customer Acquisition ──
  html += '<div style="padding:12px;background:#eff6ff;border-radius:10px;margin-bottom:10px;border-left:4px solid #2563eb">';
  html += '<b>👥 มิติที่ 2: การสร้างฐานลูกค้าใหม่ (CAC)</b><br>';
  if(c.newCustCount>0){
    html += 'ต้นทุนได้ลูกค้าใหม่ (CAC): ฿'+_fmt(Math.round(c.cac))+'/คน<br>';
    html += 'รายได้จากการซื้อครั้งแรก: ฿'+_fmt(Math.round(c.revenuePerNewCust))+'/คน<br>';
    if(c.cacROIPositive) html += '<b style="color:#16a34a">✅ ROI เป็นบวกทันที</b> — รายได้ซื้อครั้งแรก > CAC';
    else html += '<b style="color:#dc2626">❌ ROI ยังติดลบ</b> — รายได้ซื้อครั้งแรก < CAC (ต้องพึ่งการซื้อซ้ำ)';
  } else {
    html += '<span style="color:#94a3b8">กรอกจำนวนลูกค้าใหม่เพื่อคำนวณ CAC</span>';
  }
  html += '</div>';

  // ── มิติที่ 3: LTV ──
  html += '<div style="padding:12px;background:#faf5ff;border-radius:10px;margin-bottom:10px;border-left:4px solid #7c3aed">';
  html += '<b>💎 มิติที่ 3: คุณค่าลูกค้าระยะยาว (LTV)</b><br>';
  if(c.ltv>0 && c.cac>0){
    html += 'LTV = ฿'+_fmt(Math.round(c.ltv))+' (ยอดเฉลี่ย × ความถี่ × ปี)<br>';
    html += 'LTV : CAC = <b>'+c.ltvCacRatio.toFixed(1)+' : 1</b> ';
    if(c.ltvCacRatio>=3) html += '<span style="color:#16a34a">✅ ดีมาก! (เกณฑ์ ≥ 3:1)</span>';
    else if(c.ltvCacRatio>=1) html += '<span style="color:#f97316">⚠️ พอใช้ แต่ต่ำกว่าเกณฑ์ 3:1 — ควรเพิ่มความถี่ซื้อหรือระยะเป็นลูกค้า</span>';
    else html += '<span style="color:#dc2626">❌ ต่ำเกินไป — ค่าได้ลูกค้าสูงกว่ามูลค่าที่ลูกค้าสร้าง</span>';
  } else {
    html += '<span style="color:#94a3b8">กรอกยอดเฉลี่ย/ครั้ง ความถี่ และระยะเวลาเพื่อคำนวณ LTV</span>';
  }
  html += '</div>';

  // ── มิติที่ 4: Operational ──
  html += '<div style="padding:12px;background:#fff7ed;border-radius:10px;margin-bottom:10px;border-left:4px solid #f97316">';
  html += '<b>⚙️ มิติที่ 4: ประสิทธิภาพกระบวนการ</b><br>';
  if(c.totalSavingsYear>0||c.autoCost>0){
    html += 'ประหยัดได้/ปี: ฿'+_fmt(Math.round(c.totalSavingsYear));
    if(c.laborSav>0) html += ' (ค่าแรง ฿'+_fmt(c.laborSav*12);
    if(c.agencySav>0) html += ' + เอเจนซี ฿'+_fmt(c.agencySav*12);
    if(c.wasteSav>0) html += ' + ลดของเสีย ฿'+_fmt(c.wasteSav*12);
    html += ')<br>';
    if(c.autoCost>0){
      html += 'ต้นทุนระบบ: ฿'+_fmt(c.autoCost)+' | <b>ROI = '+c.opROI.toFixed(1)+'%</b> ';
      html += c.opROI>0 ? '<span style="color:#16a34a">✅ คุ้มค่า</span>' : '<span style="color:#dc2626">❌ ยังไม่คืนทุน</span>';
    }
  } else {
    html += '<span style="color:#94a3b8">กรอกข้อมูลประหยัดค่าใช้จ่ายเพื่อคำนวณ</span>';
  }
  html += '</div>';

  // ── Social Media & Goals ──
  if(lineGain>0||fbGain>0||(g.newProdItems||0)>0||clipPct>0){
    html += '<div style="padding:12px;background:#f8fafc;border-radius:10px;margin-bottom:10px;border-left:4px solid #0891b2">';
    html += '<b>📱 ผลลัพธ์เพิ่มเติม:</b><br>';
    if(lineGain>0) html += 'Line OA +'+_fmt(lineGain)+' คน ';
    if(fbGain>0) html += '| Facebook +'+_fmt(fbGain)+' คน ';
    if(lineGain>0||fbGain>0){
      var costPerFollower = (lineGain+fbGain)>0 ? Math.round(b.total/(lineGain+fbGain)) : 0;
      if(costPerFollower>0) html += '(฿'+_fmt(costPerFollower)+'/follower) ';
      html += '<br>';
    }
    if((g.newProdItems||0)>0) html += 'สินค้าใหม่: '+_fmt(g.newProdItems)+' ชิ้น ฿'+_fmt(g.newProdAmount||0)+'<br>';
    if((g.clipTarget||0)>0) html += 'คลิป: '+(g.clipActual||0)+'/'+g.clipTarget+' ('+clipPct+'%) '+(clipPct>=100?'✅':'⚠️')+'<br>';
    html += '</div>';
  }

  // ── Overall ──
  var score = 0;
  if(c.directROI>0) score+=2; if(c.directROI>50) score++;
  if(c.cacROIPositive) score+=2;
  if(c.ltvCacRatio>=3) score+=2; else if(c.ltvCacRatio>=1) score++;
  if(c.opROI>0) score++;
  if(lineGain>0||fbGain>0) score++;

  html += '<div style="margin-top:4px;padding:12px;border-radius:10px;font-weight:700;text-align:center;';
  if(score>=7) html += 'background:#dcfce7;color:#16a34a">🏆 สรุป: แคมเปญนี้คุ้มค่าทุกมิติ — แนะนำขยายผลและเพิ่มงบ';
  else if(score>=4) html += 'background:#fef9c3;color:#a16207">👍 สรุป: แคมเปญนี้พอใช้ได้ — ควรเน้นปรับปรุงมิติที่ยังอ่อน';
  else if(score>=1) html += 'background:#fed7aa;color:#c2410c">⚠️ สรุป: ผลตอบแทนยังไม่ดี — ทบทวนกลุ่มเป้าหมาย ช่องทาง และกลยุทธ์';
  else html += 'background:#f1f5f9;color:#64748b">📊 กรอกข้อมูล ROI ให้ครบเพื่อวิเคราะห์ครบทุกมิติ';
  html += '</div>';

  // ── AI suggestions ──
  html += '<div style="margin-top:12px;padding:12px;background:#f0f9ff;border-radius:10px">'
    +'<div style="font-weight:700;color:#0369a1;margin-bottom:6px">💡 คำแนะนำจาก AI:</div><ul style="margin:0;padding-left:20px;color:#334155">';
  if(c.directROI<0&&c.mktBudget>0) html += '<li>Direct ROI ติดลบ — ลองลดงบยิงโฆษณาและเน้น Organic Content แทน</li>';
  if(c.cac>0 && !c.cacROIPositive) html += '<li>CAC สูงกว่ารายได้ซื้อครั้งแรก — ลองเพิ่ม Offer สำหรับลูกค้าใหม่ หรือลดต้นทุนโฆษณา</li>';
  if(c.ltvCacRatio>0 && c.ltvCacRatio<3) html += '<li>LTV:CAC ต่ำกว่า 3:1 — ลงทุน CRM, LINE OA, Member Program เพื่อเพิ่มการซื้อซ้ำ</li>';
  if(b.travelCost > b.total*0.3) html += '<li>ค่าเดินทางสูงเกิน 30% ของงบ — พิจารณาจัดงานใกล้ขึ้นหรือรวมเส้นทาง</li>';
  if(ev.participants.length<3) html += '<li>ทีมน้อยเกินไป — เพิ่มคนเพื่อเข้าถึงลูกค้าได้มากขึ้น</li>';
  if((g.lineOaAfter||0)==0&&(g.fbAfter||0)==0) html += '<li>ยังไม่ได้เก็บ Social Media — ควรตั้ง QR Code Line OA และป้ายเชิญ Follow Facebook</li>';
  if((g.clipTarget||0)==0) html += '<li>ยังไม่ตั้งเป้าคลิป — ควรถ่ายคลิป Live/สั้น เพื่อใช้ในการตลาดออนไลน์</li>';
  if(c.totalSavingsYear==0&&c.autoCost==0) html += '<li>ยังไม่ได้วัด Operational Savings — ลองประเมินเวลาและค่าใช้จ่ายที่ประหยัดได้จาก Automation</li>';
  html += '<li>ควรติดตามผลหลัง Event 30/60/90 วัน เพื่อวัดผล LTV จริง</li>';
  html += '</ul></div>';

  html += '</div>';
  var el = document.getElementById('evtAiResult');
  if(el) el.innerHTML = html;
};

// ── Memo Generation ──
window.evtGenMemo = function(){
  if(!_editingEvt) return;
  var ev = _editingEvt;
  var b = _budgetSummary(ev);
  var g = ev.goals || {};
  var r = ev.roi || {};
  var TD = 'padding:6px 8px;border-bottom:1px solid #e2e8f0;';
  var TDR = TD+'text-align:right;';
  var TH = 'padding:6px 8px;font-weight:700;border-bottom:1px solid #e2e8f0;';
  var THW = TH+'width:150px;';
  var SEC = 'font-weight:700;font-size:14px;color:#1e293b;margin:18px 0 8px;';
  var TBLH = 'padding:6px 8px;background:#f1f5f9;font-size:11px;font-weight:700;color:#475569;border-bottom:1px solid #e2e8f0;';

  var html = '<div id="evtMemoPrintArea" style="font-family:\'Sarabun\',sans-serif;max-width:750px;margin:0 auto">';
  html += '<div style="text-align:center;border-bottom:3px double #1e293b;padding-bottom:12px;margin-bottom:16px">'
    +'<div style="font-size:20px;font-weight:800;color:#1e293b">📋 บันทึกข้อความ (Memo)</div>'
    +'<div style="font-size:14px;color:#64748b;margin-top:4px">โครงการ: '+ev.name+'</div></div>';

  // ── 1. ข้อมูลทั่วไป ──
  html += '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px">';
  html += '<tr><td style="'+THW+'">ชื่อโครงการ</td><td style="'+TD+'"><strong>'+ev.name+'</strong></td></tr>';
  html += '<tr><td style="'+THW+'">ประเภท</td><td style="'+TD+'">'+(ev.type||'-')+'</td></tr>';
  if(ev.channel) html += '<tr><td style="'+THW+'">ช่องทางขาย</td><td style="'+TD+'">'+ev.channel+'</td></tr>';
  html += '<tr><td style="'+THW+'">วันที่จัดงาน</td><td style="'+TD+'">'+(ev.startDate||'-')+' ถึง '+(ev.endDate||'-')
    +((ev.startTime||ev.endTime)?' (เวลา '+(ev.startTime||'?')+' - '+(ev.endTime||'?')+')':'')+'</td></tr>';
  if(ev.recordDate) html += '<tr><td style="'+THW+'">วันที่บันทึก</td><td style="'+TD+'">'+ev.recordDate+'</td></tr>';
  html += '<tr><td style="'+THW+'">สถานะ</td><td style="'+TD+'">'+(ev.status||'-')+'</td></tr>';
  html += '<tr><td style="'+THW+'">วัตถุประสงค์</td><td style="'+TD+'">'+(ev.objective||'-')+'</td></tr>';
  html += '<tr><td style="'+THW+'">ผู้รับผิดชอบ</td><td style="'+TD+'">'+(ev.responsible||'-')+'</td></tr>';
  if(ev.department) html += '<tr><td style="'+THW+'">แผนก</td><td style="'+TD+'">'+ev.department+'</td></tr>';
  html += '</table>';

  // ── 2. สถานที่จัดงาน ──
  var locs = ev.locations||[];
  if(locs.length>0){
    html += '<div style="'+SEC+'">📍 สถานที่จัดงาน ('+locs.length+' แห่ง)</div>';
    html += '<table style="width:100%;border-collapse:collapse;font-size:12px">';
    html += '<tr><th style="'+TBLH+'">#</th><th style="'+TBLH+'">สถานที่</th><th style="'+TBLH+'">จังหวัด</th><th style="'+TBLH+'">วันที่</th></tr>';
    locs.forEach(function(l,i){
      html += '<tr><td style="'+TD+'text-align:center">'+(i+1)+'</td><td style="'+TD+'">'+(l.name||'-')+'</td><td style="'+TD+'">'+(l.province||'-')+'</td><td style="'+TD+'">'+(l.date||'-')+'</td></tr>';
    });
    html += '</table>';
  }

  // ── 3. ผู้เข้าร่วม ──
  var parts = ev.participants||[];
  if(parts.length>0){
    html += '<div style="'+SEC+'">👥 ผู้เข้าร่วม ('+parts.length+' คน)</div>';
    html += '<table style="width:100%;border-collapse:collapse;font-size:12px">';
    html += '<tr><th style="'+TBLH+'">#</th><th style="'+TBLH+'">ชื่อ</th><th style="'+TBLH+'">ตำแหน่ง</th><th style="'+TBLH+'">แผนก</th><th style="'+TBLH+'">โทร</th></tr>';
    parts.forEach(function(p,i){
      html += '<tr><td style="'+TD+'text-align:center">'+(i+1)+'</td><td style="'+TD+'">'+(p.name||'-')+'</td><td style="'+TD+'">'+(p.position||'-')+'</td><td style="'+TD+'">'+(p.department||'-')+'</td><td style="'+TD+'">'+(p.phone||'-')+'</td></tr>';
    });
    html += '</table>';
  }

  // ── 4. รายการสินค้า ──
  var prods = ev.products||[];
  if(prods.length>0){
    var prodTotal = prods.reduce(function(s,p){return s+_productTotal(p);},0);
    html += '<div style="'+SEC+'">📦 รายการสินค้า ('+prods.length+' รายการ)</div>';
    html += '<table style="width:100%;border-collapse:collapse;font-size:12px">';
    html += '<tr><th style="'+TBLH+'">#</th><th style="'+TBLH+'">รหัส</th><th style="'+TBLH+'">ชื่อสินค้า</th><th style="'+TBLH+'text-align:right">จำนวน</th><th style="'+TBLH+'text-align:right">ราคา/หน่วย</th><th style="'+TBLH+'text-align:right">รวม</th></tr>';
    prods.forEach(function(p,i){
      html += '<tr><td style="'+TD+'text-align:center">'+(i+1)+'</td><td style="'+TD+'">'+(p.code||'-')+'</td><td style="'+TD+'">'+(p.name||'-')+'</td><td style="'+TDR+'">'+_fmt(p.qty||0)+'</td><td style="'+TDR+'">฿'+_fmt(p.price||0)+'</td><td style="'+TDR+'font-weight:700">฿'+_fmt(_productTotal(p))+'</td></tr>';
    });
    html += '<tr style="font-weight:700;background:#f8fafc"><td colspan="5" style="'+TD+'">รวมค่าสินค้า</td><td style="'+TDR+'font-weight:700;color:#dc2626">฿'+_fmt(prodTotal)+'</td></tr>';
    html += '</table>';
  }

  // ── 5. งบประมาณรวม ──
  html += '<div style="'+SEC+'">💰 งบประมาณ</div>';
  html += '<table style="width:100%;border-collapse:collapse;font-size:13px">';

  // 5a. ค่าเดินทาง (แยกน้ำมัน + ทางด่วน)
  if(ev.fuel.length>0 || ev.tolls.length>0){
    html += '<tr><td colspan="2" style="padding:6px 8px;font-weight:700;color:#475569;font-size:12px;background:#f8fafc;border-bottom:1px solid #e2e8f0">🚗 ค่าเดินทาง</td></tr>';
    ev.fuel.forEach(function(f){
      html += '<tr><td style="'+TD+'padding-left:24px">น้ำมัน: '+(f.desc||'-')+'</td><td style="'+TDR+'">฿'+_fmt(f.amount||0)+'</td></tr>';
    });
    ev.tolls.forEach(function(t){
      html += '<tr><td style="'+TD+'padding-left:24px">ทางด่วน: '+(t.desc||'-')+'</td><td style="'+TDR+'">฿'+_fmt(t.amount||0)+'</td></tr>';
    });
    html += '<tr><td style="'+TD+'padding-left:24px;font-weight:600">รวมค่าเดินทาง</td><td style="'+TDR+'font-weight:600">฿'+_fmt(b.travelCost)+'</td></tr>';
  } else {
    html += '<tr><td style="'+TD+'">ค่าเดินทาง</td><td style="'+TDR+'">฿'+_fmt(b.travelCost)+'</td></tr>';
  }

  // 5b. ค่าที่พัก (แยกรายการ)
  if(ev.accommodation.length>0){
    html += '<tr><td colspan="2" style="padding:6px 8px;font-weight:700;color:#475569;font-size:12px;background:#f8fafc;border-bottom:1px solid #e2e8f0">🏨 ค่าที่พัก</td></tr>';
    ev.accommodation.forEach(function(a){
      html += '<tr><td style="'+TD+'padding-left:24px">'+(a.place||'-')+' ('+_fmt(a.nights||0)+' คืน × '+_fmt(a.rooms||0)+' ห้อง × ฿'+_fmt(a.amount||0)+')</td><td style="'+TDR+'">฿'+_fmt(_accomTotal(a))+'</td></tr>';
    });
    html += '<tr><td style="'+TD+'padding-left:24px;font-weight:600">รวมค่าที่พัก</td><td style="'+TDR+'font-weight:600">฿'+_fmt(b.accomCost)+'</td></tr>';
  } else {
    html += '<tr><td style="'+TD+'">ค่าที่พัก</td><td style="'+TDR+'">฿'+_fmt(b.accomCost)+'</td></tr>';
  }

  // 5c. ค่าเบี้ยเลี้ยง (แยกรายการ)
  if(ev.perDiem.length>0){
    html += '<tr><td colspan="2" style="padding:6px 8px;font-weight:700;color:#475569;font-size:12px;background:#f8fafc;border-bottom:1px solid #e2e8f0">🍽️ ค่าเบี้ยเลี้ยง</td></tr>';
    ev.perDiem.forEach(function(p){
      html += '<tr><td style="'+TD+'padding-left:24px">'+(p.name||'-')+' ('+_fmt(p.days||0)+' วัน × ฿'+_fmt(p.rate||0)+')</td><td style="'+TDR+'">฿'+_fmt(_perDiemTotal(p))+'</td></tr>';
    });
    html += '<tr><td style="'+TD+'padding-left:24px;font-weight:600">รวมค่าเบี้ยเลี้ยง</td><td style="'+TDR+'font-weight:600">฿'+_fmt(b.perDiemCost)+'</td></tr>';
  } else {
    html += '<tr><td style="'+TD+'">ค่าเบี้ยเลี้ยง</td><td style="'+TDR+'">฿'+_fmt(b.perDiemCost)+'</td></tr>';
  }

  // 5d. ค่าสินค้า
  html += '<tr><td style="'+TD+'">ค่าสินค้า ('+prods.length+' รายการ)</td><td style="'+TDR+'">฿'+_fmt(b.prodCost)+'</td></tr>';

  // 5e. ค่าใช้จ่ายอื่น
  if(ev.otherExpenses.length>0){
    html += '<tr><td colspan="2" style="padding:6px 8px;font-weight:700;color:#475569;font-size:12px;background:#f8fafc;border-bottom:1px solid #e2e8f0">📎 ค่าใช้จ่ายอื่น</td></tr>';
    ev.otherExpenses.forEach(function(o){
      html += '<tr><td style="'+TD+'padding-left:24px">'+(o.desc||'-')+'</td><td style="'+TDR+'">฿'+_fmt(o.amount||0)+'</td></tr>';
    });
    html += '<tr><td style="'+TD+'padding-left:24px;font-weight:600">รวมค่าใช้จ่ายอื่น</td><td style="'+TDR+'font-weight:600">฿'+_fmt(b.otherCost)+'</td></tr>';
  } else {
    html += '<tr><td style="'+TD+'">ค่าใช้จ่ายอื่น</td><td style="'+TDR+'">฿'+_fmt(b.otherCost)+'</td></tr>';
  }

  // Total
  html += '<tr style="font-weight:700;font-size:15px"><td style="padding:10px 8px;border-top:3px double #1e293b">รวมงบประมาณทั้งหมด</td><td style="padding:10px 8px;text-align:right;border-top:3px double #1e293b;color:#dc2626;font-size:16px">฿'+_fmt(b.total)+'</td></tr>';
  html += '</table>';

  // ── 6. ยอดขาย ──
  var salesBefore = parseFloat(ev.salesBefore)||0;
  var salesAfter = parseFloat(ev.salesAfter)||0;
  if(salesBefore>0 || salesAfter>0){
    html += '<div style="'+SEC+'">📊 ยอดขาย</div>';
    html += '<table style="width:100%;border-collapse:collapse;font-size:13px">';
    html += '<tr><td style="'+TD+'">ยอดขายก่อน</td><td style="'+TDR+'">฿'+_fmt(salesBefore)+'</td></tr>';
    html += '<tr><td style="'+TD+'">ยอดขายหลัง</td><td style="'+TDR+'">฿'+_fmt(salesAfter)+'</td></tr>';
    var diff = salesAfter - salesBefore;
    var diffColor = diff>=0?'#16a34a':'#dc2626';
    html += '<tr style="font-weight:700"><td style="'+TD+'">ผลต่าง</td><td style="'+TDR+'color:'+diffColor+'">'+(diff>=0?'+':'')+_fmt(diff)+' ('+(salesBefore>0?(diff/salesBefore*100).toFixed(1):'0')+'%)</td></tr>';
    html += '</table>';
  }

  // ── 7. ROI 4 มิติ ──
  var c = _roiCalc(ev);
  if(c.mktBudget>0 || c.newCustCount>0 || c.ltv>0 || c.totalSavingsYear>0){
    html += '<div style="'+SEC+'">📈 วิเคราะห์ ROI 4 มิติ</div>';
    html += '<table style="width:100%;border-collapse:collapse;font-size:12px">';
    if(c.mktBudget>0){
      html += '<tr><td colspan="2" style="padding:5px 8px;font-weight:700;color:#2563eb;background:#eff6ff;border-bottom:1px solid #e2e8f0">1. Direct Sales ROI</td></tr>';
      html += '<tr><td style="'+TD+'padding-left:16px">กำไรขั้นต้น / งบการตลาด</td><td style="'+TDR+'">฿'+_fmt(c.grossProfit)+' / ฿'+_fmt(c.mktBudget)+'</td></tr>';
      html += '<tr><td style="'+TD+'padding-left:16px;font-weight:600">ROI</td><td style="'+TDR+'font-weight:700;color:'+(c.directROI>=0?'#16a34a':'#dc2626')+'">'+c.directROI.toFixed(1)+'%</td></tr>';
    }
    if(c.newCustCount>0){
      html += '<tr><td colspan="2" style="padding:5px 8px;font-weight:700;color:#7c3aed;background:#faf5ff;border-bottom:1px solid #e2e8f0">2. Customer Acquisition (CAC)</td></tr>';
      html += '<tr><td style="'+TD+'padding-left:16px">ลูกค้าใหม่ / รายได้จากลูกค้าใหม่</td><td style="'+TDR+'">'+_fmt(c.newCustCount)+' ราย / ฿'+_fmt(c.firstPurchaseRevenue)+'</td></tr>';
      html += '<tr><td style="'+TD+'padding-left:16px;font-weight:600">CAC</td><td style="'+TDR+'font-weight:700">฿'+_fmt(Math.round(c.cac))+'/คน</td></tr>';
    }
    if(c.ltv>0){
      html += '<tr><td colspan="2" style="padding:5px 8px;font-weight:700;color:#0891b2;background:#ecfeff;border-bottom:1px solid #e2e8f0">3. Customer Lifetime Value (LTV)</td></tr>';
      html += '<tr><td style="'+TD+'padding-left:16px">LTV / LTV:CAC</td><td style="'+TDR+'">฿'+_fmt(Math.round(c.ltv))+' / '+c.ltvCacRatio.toFixed(1)+':1</td></tr>';
    }
    if(c.totalSavingsYear>0){
      html += '<tr><td colspan="2" style="padding:5px 8px;font-weight:700;color:#f97316;background:#fff7ed;border-bottom:1px solid #e2e8f0">4. Operational Efficiency</td></tr>';
      html += '<tr><td style="'+TD+'padding-left:16px">ประหยัดรวม/ปี / ROI</td><td style="'+TDR+'">฿'+_fmt(c.totalSavingsYear)+' / '+c.opROI.toFixed(1)+'%</td></tr>';
    }
    html += '</table>';
  }

  // ── 8. เป้าหมาย/ผลลัพธ์ ──
  html += '<div style="'+SEC+'">🎯 เป้าหมาย/ผลลัพธ์ที่คาดหวัง</div>'
    +'<ul style="margin:0;padding-left:20px;font-size:13px;line-height:2">';
  if((g.lineOaBefore||0)>0||(g.lineOaAfter||0)>0) html += '<li>Line OA: จาก '+_fmt(g.lineOaBefore||0)+' เป็น '+_fmt(g.lineOaAfter||0)+' (<span style="color:'+(((g.lineOaAfter||0)-(g.lineOaBefore||0))>=0?'#16a34a':'#dc2626')+'">'+(((g.lineOaAfter||0)-(g.lineOaBefore||0))>=0?'+':'')+_fmt((g.lineOaAfter||0)-(g.lineOaBefore||0))+'</span>)</li>';
  if((g.fbBefore||0)>0||(g.fbAfter||0)>0) html += '<li>Facebook: จาก '+_fmt(g.fbBefore||0)+' เป็น '+_fmt(g.fbAfter||0)+' (<span style="color:'+(((g.fbAfter||0)-(g.fbBefore||0))>=0?'#16a34a':'#dc2626')+'">'+(((g.fbAfter||0)-(g.fbBefore||0))>=0?'+':'')+_fmt((g.fbAfter||0)-(g.fbBefore||0))+'</span>)</li>';
  if((g.newProdItems||0)>0) html += '<li>สินค้าใหม่: '+_fmt(g.newProdItems)+' รายการ มูลค่า ฿'+_fmt(g.newProdAmount||0)+'</li>';
  if((g.newCustomers||0)>0) html += '<li>ลูกค้าใหม่: '+_fmt(g.newCustomers)+' ร้าน</li>';
  if((g.clipTarget||0)>0) html += '<li>คลิปหน้างาน: เป้า '+g.clipTarget+' คลิป / ทำได้ '+(g.clipActual||0)+' คลิป</li>';
  html += '</ul>';

  // ── 8b. รายการบิลลูกค้าใหม่ ──
  var bills = g.newCustBills||[];
  if(bills.length>0){
    html += '<div style="'+SEC+'font-size:13px;margin-top:10px">📝 รายการบิลลูกค้าใหม่ ('+bills.length+' บิล)</div>';
    html += '<table style="width:100%;border-collapse:collapse;font-size:12px">';
    html += '<tr><th style="'+TBLH+'">#</th><th style="'+TBLH+'">ชื่อลูกค้า</th><th style="'+TBLH+'">เลขที่บิล</th><th style="'+TBLH+'">วันที่</th></tr>';
    bills.forEach(function(bl,i){
      html += '<tr><td style="'+TD+'text-align:center">'+(i+1)+'</td><td style="'+TD+'">'+(bl.customer||'-')+'</td><td style="'+TD+'">'+(bl.billNo||'-')+'</td><td style="'+TD+'">'+(bl.date||'-')+'</td></tr>';
    });
    html += '</table>';
  }

  // ── Footer ──
  html += '<div style="margin-top:24px;border-top:2px solid #1e293b;padding-top:12px;display:flex;justify-content:space-between;font-size:12px;color:#94a3b8">'
    +'<span>วันที่สร้าง: '+new Date().toLocaleDateString('th-TH')+'</span>'
    +'<span>ผู้จัดทำ: '+(ev.responsible||'-')+'</span>'
    +'</div></div>';

  var el = document.getElementById('evtMemoContent');
  if(el) el.innerHTML = html;
};

window.evtDownloadMemo = function(type){
  var content = document.getElementById('evtMemoPrintArea');
  if(!content){ alert('กรุณาสร้าง Memo ก่อนดาวน์โหลด'); return; }
  var name = (_editingEvt?_editingEvt.name:'Event')+'_Memo';

  if(type==='pdf'||type==='image'){
    var printWin = window.open('','','width=800,height=600');
    printWin.document.write('<html><head><title>'+name+'</title><style>body{font-family:Sarabun,sans-serif;padding:20px;}</style></head><body>');
    printWin.document.write(content.innerHTML);
    printWin.document.write('</body></html>');
    printWin.document.close();
    setTimeout(function(){ printWin.print(); },500);
  } else if(type==='excel'){
    var table = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body>';
    table += content.innerHTML;
    table += '</body></html>';
    var blob = new Blob([table],{type:'application/vnd.ms-excel;charset=utf-8'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name+'.xls'; a.click();
    URL.revokeObjectURL(url);
  }
};

// ── CRUD operations ──
window.evtNew = function(){
  _editingEvt = _newEvent();
  renderMktEvents();
};
window.evtEdit = function(id){
  var events = _load();
  var ev = events.find(function(e){return e.id===id;});
  if(!ev) return;
  _editingEvt = JSON.parse(JSON.stringify(ev));
  renderMktEvents();
};
window.evtBack = function(){
  _editingEvt = null;
  renderMktEvents();
};
window.evtSave = function(){
  if(!_editingEvt) return;
  // Collect field values from DOM
  document.querySelectorAll('[data-evt]').forEach(function(el){
    _editingEvt[el.getAttribute('data-evt')] = el.value;
  });
  // Collect ROI from DOM
  if(!_editingEvt.roi) _editingEvt.roi = {};
  document.querySelectorAll('[data-roi]').forEach(function(el){
    _editingEvt.roi[el.getAttribute('data-roi')] = parseFloat(el.value)||0;
  });
  // Collect goals from DOM
  if(!_editingEvt.goals) _editingEvt.goals = {};
  document.querySelectorAll('[data-goal]').forEach(function(el){
    _editingEvt.goals[el.getAttribute('data-goal')] = parseFloat(el.value)||0;
  });
  if(!_editingEvt.name){ alert('กรุณากรอกชื่อ Event'); return; }

  var events = _load();
  var idx = -1;
  for(var i=0;i<events.length;i++){ if(events[i].id===_editingEvt.id){idx=i;break;} }
  if(idx>=0) events[idx] = _editingEvt;
  else events.push(_editingEvt);
  _save(events);
  _editingEvt = null;
  renderMktEvents();
};
window.evtDelete = function(id){
  if(!confirm('ลบ Event นี้?')) return;
  var events = _load().filter(function(e){return e.id!==id;});
  _save(events);
  renderMktEvents();
};
window.evtDuplicate = function(id){
  var events = _load();
  var ev = events.find(function(e){return e.id===id;});
  if(!ev) return;
  var copy = JSON.parse(JSON.stringify(ev));
  copy.id = Date.now();
  copy.name = copy.name + ' (สำเนา)';
  copy.status = 'วางแผน';
  events.push(copy);
  _save(events);
  renderMktEvents();
};

// ══════════════ EVENT DASHBOARD ══════════════
var _evtCharts = {};
function renderEvtDashboard(){
  _addStyles();
  var el = document.getElementById('mktEvtDashContent');
  if(!el) return;

  var events = _load();
  if(events.length === 0){
    el.innerHTML = '<div style="text-align:center;padding:60px 20px"><div style="font-size:48px;margin-bottom:12px">📊</div><div style="font-size:18px;font-weight:800;color:#1e293b;margin-bottom:8px">ยังไม่มีข้อมูล Event</div><div style="font-size:13px;color:#94a3b8">สร้าง Event ในแท็บ "กิจกรรม/Event" เพื่อดู Dashboard</div></div>';
    return;
  }

  var totalBudget = 0;
  var monthlyCost = {};
  var typeCost = {};
  var provinceCounts = {};
  var productUsage = {};
  var roiData = [];

  events.forEach(function(ev){
    var b = _budgetSummary(ev);
    totalBudget += b.total;

    // Monthly
    var m = (ev.startDate||'').substring(0,7);
    if(m){ monthlyCost[m] = (monthlyCost[m]||0) + b.total; }

    // By type
    var t = ev.type || 'อื่นๆ';
    typeCost[t] = (typeCost[t]||0) + b.total;

    // Province
    if(ev.province) provinceCounts[ev.province] = (provinceCounts[ev.province]||0) + 1;

    // Products
    ev.products.forEach(function(p){
      if(p.name) productUsage[p.name] = (productUsage[p.name]||0) + (parseFloat(p.qty)||0);
    });

    // ROI
    var salesBefore = parseFloat(ev.salesBefore)||0;
    var salesAfter = parseFloat(ev.salesAfter)||0;
    if(salesBefore>0||salesAfter>0){
      roiData.push({name:ev.name, before:salesBefore, after:salesAfter, cost:b.total,
        roi: b.total>0?((salesAfter-salesBefore-b.total)/b.total*100):0});
    }
  });

  var avgCost = events.length > 0 ? totalBudget/events.length : 0;
  var topProvince = Object.keys(provinceCounts).sort(function(a,b){return provinceCounts[b]-provinceCounts[a];})[0] || '—';
  var topProduct = Object.keys(productUsage).sort(function(a,b){return productUsage[b]-productUsage[a];})[0] || '—';

  // KPI cards
  var kpis = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px">'
    +'<div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:12px;padding:14px 16px"><div style="font-size:20px">🎪</div><div style="font-size:10px;color:#64748b;font-weight:600;margin-top:3px">จำนวน Event</div><div style="font-size:20px;font-weight:800;color:#2563eb;margin-top:2px">'+events.length+'</div></div>'
    +'<div style="background:linear-gradient(135deg,#fef2f2,#fecaca);border-radius:12px;padding:14px 16px"><div style="font-size:20px">💰</div><div style="font-size:10px;color:#64748b;font-weight:600;margin-top:3px">งบรวมทั้งหมด</div><div style="font-size:20px;font-weight:800;color:#dc2626;margin-top:2px">฿'+_fmt(totalBudget)+'</div></div>'
    +'<div style="background:linear-gradient(135deg,#fff7ed,#fed7aa);border-radius:12px;padding:14px 16px"><div style="font-size:20px">📊</div><div style="font-size:10px;color:#64748b;font-weight:600;margin-top:3px">เฉลี่ย/Event</div><div style="font-size:20px;font-weight:800;color:#f97316;margin-top:2px">฿'+_fmt(Math.round(avgCost))+'</div></div>'
    +'<div style="background:linear-gradient(135deg,#f0fdf4,#bbf7d0);border-radius:12px;padding:14px 16px"><div style="font-size:20px">📍</div><div style="font-size:10px;color:#64748b;font-weight:600;margin-top:3px">จังหวัดที่จัดมากสุด</div><div style="font-size:16px;font-weight:800;color:#16a34a;margin-top:2px">'+topProvince+'</div></div>'
    +'</div>';

  // Charts
  var charts = '<div style="display:grid;grid-template-columns:3fr 2fr;gap:14px;margin-bottom:16px">'
    +'<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:16px"><div style="font-size:14px;font-weight:800;color:#1e293b;margin-bottom:10px">📊 ค่าใช้จ่ายรายเดือน</div><div style="height:220px"><canvas id="evtChartMonthly"></canvas></div></div>'
    +'<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:16px"><div style="font-size:14px;font-weight:800;color:#1e293b;margin-bottom:10px">🎯 ค่าใช้จ่ายแยกตามประเภท</div><div style="height:220px;display:flex;justify-content:center"><canvas id="evtChartType"></canvas></div></div>'
    +'</div>';

  // ROI comparison
  var roiSection = '';
  if(roiData.length > 0){
    roiSection = '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:16px;margin-bottom:16px">'
      +'<div style="font-size:14px;font-weight:800;color:#1e293b;margin-bottom:10px">📈 เปรียบเทียบ ROI แต่ละ Event</div>'
      +'<div style="height:220px"><canvas id="evtChartROI"></canvas></div></div>';
  }

  // Top products table
  var prodKeys = Object.keys(productUsage).sort(function(a,b){return productUsage[b]-productUsage[a];}).slice(0,10);
  var prodTable = '';
  if(prodKeys.length > 0){
    var TH = 'padding:9px 12px;font-size:11px;font-weight:700;color:#fff;background:#1e293b;';
    prodTable = '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:20px">'
      +'<div style="padding:14px 18px;font-size:13px;font-weight:800;color:#1e293b">📦 สินค้าที่ใช้มากที่สุด</div>'
      +'<table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr>'
      +'<th style="'+TH+'text-align:center">#</th><th style="'+TH+'text-align:left">สินค้า</th><th style="'+TH+'text-align:right">จำนวนรวม</th></tr></thead><tbody>';
    prodKeys.forEach(function(k,i){
      prodTable += '<tr style="border-bottom:1px solid #f1f5f9;background:'+(i%2?'#fafafa':'#fff')+'"><td style="padding:8px 12px;text-align:center;color:#94a3b8">'+(i+1)+'</td><td style="padding:8px 12px;font-weight:600">'+k+'</td><td style="padding:8px 12px;text-align:right;font-weight:700;color:#2563eb">'+_fmt(productUsage[k])+'</td></tr>';
    });
    prodTable += '</tbody></table></div>';
  }

  el.innerHTML = kpis + charts + roiSection + prodTable;

  // Render Chart.js charts
  setTimeout(function(){
    _renderEvtCharts(monthlyCost, typeCost, roiData);
  }, 100);
}
window.renderEvtDashboard = renderEvtDashboard;

function _renderEvtCharts(monthlyCost, typeCost, roiData){
  if(typeof Chart === 'undefined') return;

  // Destroy old charts
  Object.keys(_evtCharts).forEach(function(k){
    if(_evtCharts[k]){ _evtCharts[k].destroy(); _evtCharts[k]=null; }
  });

  // Monthly bar chart
  var mKeys = Object.keys(monthlyCost).sort();
  var mCtx = document.getElementById('evtChartMonthly');
  if(mCtx && mKeys.length > 0){
    _evtCharts.monthly = new Chart(mCtx.getContext('2d'), {
      type:'bar',
      data:{
        labels:mKeys,
        datasets:[{label:'ค่าใช้จ่าย (บาท)', data:mKeys.map(function(k){return monthlyCost[k];}),
          backgroundColor:'rgba(37,99,235,.7)', borderRadius:6}]
      },
      options:{responsive:true,maintainAspectRatio:false,
        plugins:{legend:{display:false},tooltip:{titleFont:{size:13},bodyFont:{size:13}}},
        scales:{y:{beginAtZero:true,ticks:{font:{size:12},callback:function(v){return '฿'+v.toLocaleString();}}},
                x:{ticks:{font:{size:12}}}}}
    });
  }

  // Type doughnut
  var tKeys = Object.keys(typeCost);
  var tCtx = document.getElementById('evtChartType');
  var typeColors = ['#3b82f6','#f97316','#16a34a','#7c3aed','#dc2626','#0891b2','#d97706'];
  if(tCtx && tKeys.length > 0){
    _evtCharts.type = new Chart(tCtx.getContext('2d'), {
      type:'doughnut',
      data:{
        labels:tKeys,
        datasets:[{data:tKeys.map(function(k){return typeCost[k];}),
          backgroundColor:typeColors.slice(0,tKeys.length)}]
      },
      options:{responsive:true,maintainAspectRatio:false,
        plugins:{legend:{position:'bottom',labels:{font:{size:13},padding:12}},
                 tooltip:{titleFont:{size:13},bodyFont:{size:13}}}}
    });
  }

  // ROI comparison bar
  var rCtx = document.getElementById('evtChartROI');
  if(rCtx && roiData.length > 0){
    _evtCharts.roi = new Chart(rCtx.getContext('2d'), {
      type:'bar',
      data:{
        labels:roiData.map(function(r){return r.name.length>20?r.name.substring(0,20)+'...':r.name;}),
        datasets:[
          {label:'ยอดขายก่อน',data:roiData.map(function(r){return r.before;}),backgroundColor:'rgba(148,163,184,.5)',borderRadius:4},
          {label:'ค่าใช้จ่าย',data:roiData.map(function(r){return r.cost;}),backgroundColor:'rgba(220,38,38,.6)',borderRadius:4},
          {label:'ยอดขายหลัง',data:roiData.map(function(r){return r.after;}),backgroundColor:'rgba(22,163,74,.6)',borderRadius:4}
        ]
      },
      options:{responsive:true,maintainAspectRatio:false,
        plugins:{legend:{position:'bottom',labels:{font:{size:13},padding:12}},
                 tooltip:{titleFont:{size:13},bodyFont:{size:13}}},
        scales:{y:{beginAtZero:true,ticks:{font:{size:12},callback:function(v){return '฿'+v.toLocaleString();}}},
                x:{ticks:{font:{size:12}}}}}
    });
  }
}

// ── Hook into marketing tab switch ──
var _origShowMktSub = window.showMktSub;
window.showMktSub = function(el, sub){
  _origShowMktSub(el, sub);
  if(sub === 'mkt-events') renderMktEvents();
  else if(sub === 'mkt-evt-dash') renderEvtDashboard();
};

})();
