// ============================================================
// ORDERING-DATA.JS — อัพเดทข้อมูล (ธุรการขาย) tab render functions
// ============================================================
(function(){
'use strict';

var _ordCharts = {};

var ORD_STAFF = [
  {name:'สุภาพร',nick:'แอน',zone:'นครปฐม-กำแพงแสน',role:'ธุรการขาย',phone:'081-xxx-1111'},
  {name:'ปวีณา',nick:'ปุ๋ย',zone:'นครปฐม-เมือง',role:'ธุรการขาย',phone:'081-xxx-2222'},
  {name:'นภัสสร',nick:'มิ้นท์',zone:'ราชบุรี',role:'ธุรการขาย',phone:'081-xxx-3333'},
  {name:'ศิริพร',nick:'นุ่น',zone:'สมุทรสาคร',role:'ธุรการขาย',phone:'081-xxx-4444'},
  {name:'ธนพร',nick:'โบว์',zone:'นนทบุรี-ปทุมธานี',role:'ธุรการขาย',phone:'081-xxx-5555'}
];

var ORD_ROUTES = [
  {route:'R01 กำแพงแสน-ดอนตูม',day:'จันทร์',region:'นครปฐม',code:'S01',person:'สุภาพร (แอน)'},
  {route:'R02 ท่ามะกา-ท่าม่วง',day:'จันทร์',region:'กาญจนบุรี',code:'S02',person:'ปวีณา (ปุ๋ย)'},
  {route:'R03 เมืองนครปฐม',day:'อังคาร',region:'นครปฐม',code:'S01',person:'สุภาพร (แอน)'},
  {route:'R04 บ้านโป่ง-โพธาราม',day:'อังคาร',region:'ราชบุรี',code:'S03',person:'นภัสสร (มิ้นท์)'},
  {route:'R05 สามพราน-พุทธมณฑล',day:'พุธ',region:'นครปฐม',code:'S01',person:'สุภาพร (แอน)'},
  {route:'R06 เมืองราชบุรี',day:'พุธ',region:'ราชบุรี',code:'S03',person:'นภัสสร (มิ้นท์)'},
  {route:'R07 ศาลายา-นครชัยศรี',day:'พฤหัสบดี',region:'นครปฐม',code:'S02',person:'ปวีณา (ปุ๋ย)'},
  {route:'R08 มหาชัย-บางบอน',day:'พฤหัสบดี',region:'สมุทรสาคร',code:'S04',person:'ศิริพร (นุ่น)'},
  {route:'R09 บางเลน-ลาดหลุมแก้ว',day:'ศุกร์',region:'นครปฐม',code:'S01',person:'สุภาพร (แอน)'},
  {route:'R10 ปากท่อ-วัดเพลง',day:'ศุกร์',region:'ราชบุรี',code:'S03',person:'นภัสสร (มิ้นท์)'},
  {route:'R11 บางใหญ่-บางบัวทอง',day:'จันทร์',region:'นนทบุรี',code:'S05',person:'ธนพร (โบว์)'},
  {route:'R12 ปทุมธานี-คลองหลวง',day:'พุธ',region:'ปทุมธานี',code:'S05',person:'ธนพร (โบว์)'}
];

var ORD_CUTOFF = [
  {label:'รอบเช้า',time:'ก่อน 10:00 น.',note:'ส่งผลิตวันเดียวกัน'},
  {label:'รอบบ่าย',time:'ก่อน 15:00 น.',note:'ส่งผลิตวันถัดไป'},
  {label:'หลังเวลา',time:'หลัง 15:00 น.',note:'ค้างรอบเช้าวันถัดไป'}
];

var ORD_BILLS = {
  staff: ORD_STAFF.map(function(s){return s.nick;}),
  months: {
    'มี.ค.': [142,128,115,108,96],
    'เม.ย.': [155,139,122,119,105],
    'พ.ค.':  [163,145,130,126,112],
    'มิ.ย.': [148,131,118,110,99]
  },
  pieces: {
    'มี.ค.': [4260,3840,3450,3240,2880],
    'เม.ย.': [4650,4170,3660,3570,3150],
    'พ.ค.':  [4890,4350,3900,3780,3360],
    'มิ.ย.': [4440,3930,3540,3300,2970]
  },
  daily5: [
    {day:'01',bills:[7,6,5,4,3]},{day:'02',bills:[8,7,6,5,4]},{day:'03',bills:[6,5,4,5,3]},
    {day:'04',bills:[7,6,5,4,4]},{day:'05',bills:[5,5,4,3,3]},{day:'06',bills:[0,0,0,0,0]},
    {day:'07',bills:[0,0,0,0,0]},{day:'08',bills:[8,7,6,5,4]},{day:'09',bills:[7,6,5,4,3]},
    {day:'10',bills:[6,5,5,4,4]},{day:'11',bills:[7,7,6,5,3]},{day:'12',bills:[8,6,5,5,4]},
    {day:'13',bills:[0,0,0,0,0]},{day:'14',bills:[0,0,0,0,0]},{day:'15',bills:[7,6,6,5,4]},
    {day:'16',bills:[8,7,5,4,3]},{day:'17',bills:[6,6,5,5,4]},{day:'18',bills:[7,5,5,4,3]},
    {day:'19',bills:[8,7,6,5,5]},{day:'20',bills:[0,0,0,0,0]},{day:'21',bills:[0,0,0,0,0]},
    {day:'22',bills:[7,6,5,4,4]},{day:'23',bills:[6,5,5,5,3]},{day:'24',bills:[7,7,6,4,4]},
    {day:'25',bills:[8,6,5,5,3]},{day:'26',bills:[7,7,6,5,4]},{day:'27',bills:[0,0,0,0,0]},
    {day:'28',bills:[0,0,0,0,0]},{day:'29',bills:[6,5,4,4,3]},{day:'30',bills:[7,6,5,5,4]}
  ],
  daily6: [
    {day:'01',bills:[6,5,4,4,3]},{day:'02',bills:[7,6,5,4,3]},{day:'03',bills:[0,0,0,0,0]},
    {day:'04',bills:[0,0,0,0,0]},{day:'05',bills:[7,6,5,5,4]},{day:'06',bills:[8,7,6,5,3]},
    {day:'07',bills:[6,5,5,4,4]},{day:'08',bills:[7,6,5,5,3]},{day:'09',bills:[7,6,6,4,4]},
    {day:'10',bills:[0,0,0,0,0]},{day:'11',bills:[0,0,0,0,0]},{day:'12',bills:[8,7,5,5,4]},
    {day:'13',bills:[7,6,5,4,3]},{day:'14',bills:[6,5,5,4,4]},{day:'15',bills:[7,6,5,5,3]},
    {day:'16',bills:[7,7,6,5,4]},{day:'17',bills:[0,0,0,0,0]},{day:'18',bills:[0,0,0,0,0]},
    {day:'19',bills:[8,7,5,4,4]},{day:'20',bills:[7,6,6,5,3]},{day:'21',bills:[6,5,4,4,3]},
    {day:'22',bills:[7,6,5,5,4]},{day:'23',bills:[8,7,6,5,4]},{day:'24',bills:[0,0,0,0,0]},
    {day:'25',bills:[0,0,0,0,0]},{day:'26',bills:[7,6,5,4,3]},{day:'27',bills:[6,5,5,5,4]},
    {day:'28',bills:[7,6,5,4,3]},{day:'29',bills:[7,7,6,5,4]},{day:'30',bills:[6,5,4,4,3]}
  ]
};

var _ordBillMonth = 5;

var ORD_CHECKLIST = [
  {code:'C001',name:'ร้านป้าแมว นครปฐม',person:'แอน',period:'มี.ค. 69',pcs:120,status:'สั่งซื้อ'},
  {code:'C002',name:'ร้านลุงเสริม กำแพงแสน',person:'แอน',period:'มี.ค. 69',pcs:85,status:'สั่งซื้อ'},
  {code:'C003',name:'มินิมาร์ท ดอนตูม',person:'แอน',period:'มี.ค. 69',pcs:200,status:'สั่งซื้อ'},
  {code:'C004',name:'ร้านค้าส่ง ท่ามะกา',person:'ปุ๋ย',period:'มี.ค. 69',pcs:310,status:'สั่งซื้อ'},
  {code:'C005',name:'ร้านของฝาก ท่าม่วง',person:'ปุ๋ย',period:'มี.ค. 69',pcs:95,status:'สั่งซื้อ'},
  {code:'C006',name:'เซเว่น โพธาราม',person:'มิ้นท์',period:'มี.ค. 69',pcs:180,status:'สั่งซื้อ'},
  {code:'C007',name:'ร้านเจ๊หน่อย ราชบุรี',person:'มิ้นท์',period:'มี.ค. 69',pcs:140,status:'สั่งซื้อ'},
  {code:'C008',name:'ตลาดนัดศาลายา',person:'นุ่น',period:'มี.ค. 69',pcs:250,status:'สั่งซื้อ'},
  {code:'C009',name:'ร้านค้า บางบอน',person:'นุ่น',period:'มี.ค. 69',pcs:160,status:'สั่งซื้อ'},
  {code:'C010',name:'ร้านสะดวกซื้อ บางใหญ่',person:'โบว์',period:'มี.ค. 69',pcs:175,status:'สั่งซื้อ'}
];

var ORD_ERRORS = [
  {person:'แอน',zone:'นครปฐม-กำแพงแสน',month:'เม.ย.',noSend:1,wrongKey:0,missed:0,dup:0,wrongBranch:0},
  {person:'แอน',zone:'นครปฐม-กำแพงแสน',month:'พ.ค.',noSend:0,wrongKey:1,missed:0,dup:0,wrongBranch:0},
  {person:'แอน',zone:'นครปฐม-กำแพงแสน',month:'มิ.ย.',noSend:0,wrongKey:0,missed:1,dup:0,wrongBranch:0},
  {person:'ปุ๋ย',zone:'นครปฐม-เมือง',month:'เม.ย.',noSend:0,wrongKey:0,missed:0,dup:1,wrongBranch:0},
  {person:'ปุ๋ย',zone:'นครปฐม-เมือง',month:'พ.ค.',noSend:0,wrongKey:0,missed:0,dup:0,wrongBranch:1},
  {person:'ปุ๋ย',zone:'นครปฐม-เมือง',month:'มิ.ย.',noSend:1,wrongKey:0,missed:0,dup:0,wrongBranch:0},
  {person:'มิ้นท์',zone:'ราชบุรี',month:'เม.ย.',noSend:0,wrongKey:1,missed:0,dup:0,wrongBranch:0},
  {person:'มิ้นท์',zone:'ราชบุรี',month:'พ.ค.',noSend:0,wrongKey:0,missed:0,dup:0,wrongBranch:0},
  {person:'มิ้นท์',zone:'ราชบุรี',month:'มิ.ย.',noSend:0,wrongKey:0,missed:0,dup:1,wrongBranch:0},
  {person:'นุ่น',zone:'สมุทรสาคร',month:'เม.ย.',noSend:0,wrongKey:0,missed:1,dup:0,wrongBranch:0},
  {person:'นุ่น',zone:'สมุทรสาคร',month:'พ.ค.',noSend:0,wrongKey:0,missed:0,dup:0,wrongBranch:0},
  {person:'นุ่น',zone:'สมุทรสาคร',month:'มิ.ย.',noSend:0,wrongKey:0,missed:0,dup:0,wrongBranch:0},
  {person:'โบว์',zone:'นนทบุรี-ปทุมธานี',month:'เม.ย.',noSend:0,wrongKey:0,missed:0,dup:0,wrongBranch:0},
  {person:'โบว์',zone:'นนทบุรี-ปทุมธานี',month:'พ.ค.',noSend:1,wrongKey:0,missed:0,dup:0,wrongBranch:0},
  {person:'โบว์',zone:'นนทบุรี-ปทุมธานี',month:'มิ.ย.',noSend:0,wrongKey:0,missed:0,dup:0,wrongBranch:1}
];

var ORD_RETURNS = [
  {no:1,date:'2026-06-12',product:'ปังสังขยาใบเตย 190g',qty:24,cause:'สินค้าเสียหาย',route:'R01',person:'แอน',keyer:'แอน',action:'เปลี่ยนสินค้าใหม่'},
  {no:2,date:'2026-06-15',product:'ปังไส้ครีม 130g',qty:12,cause:'ส่งผิดรายการ',route:'R04',person:'มิ้นท์',keyer:'ปุ๋ย',action:'รับคืนแล้ว'},
  {no:3,date:'2026-05-20',product:'ปังนมสด 200g',qty:36,cause:'หมดอายุ',route:'R08',person:'นุ่น',keyer:'นุ่น',action:'ทำลายสินค้า'},
  {no:4,date:'2026-05-28',product:'ปังช็อกโกแลต 150g',qty:18,cause:'บรรจุภัณฑ์ชำรุด',route:'R11',person:'โบว์',keyer:'โบว์',action:'เปลี่ยนสินค้าใหม่'},
  {no:5,date:'2026-04-10',product:'ปังสังขยาใบเตย 190g',qty:48,cause:'ส่งเกินจำนวน',route:'R03',person:'แอน',keyer:'แอน',action:'รับคืนแล้ว'}
];

var ORD_CLAIMS = [
  {month:'ม.ค.',count:3},{month:'ก.พ.',count:5},{month:'มี.ค.',count:2},{month:'เม.ย.',count:4}
];

var ORD_CALL_LOG = [
  {date:'2026-06-20',staff:'แอน',code:'C001',name:'ร้านป้าแมว',route:'R01',result:'สั่งซื้อ',ordered:true,followUp:false,note:'สั่ง 120 ชิ้น'},
  {date:'2026-06-20',staff:'แอน',code:'C002',name:'ร้านลุงเสริม',route:'R01',result:'ไม่รับสาย',ordered:false,followUp:true,note:'โทรกลับพรุ่งนี้'},
  {date:'2026-06-20',staff:'ปุ๋ย',code:'C004',name:'ร้านค้าส่ง ท่ามะกา',route:'R02',result:'สั่งซื้อ',ordered:true,followUp:false,note:'สั่ง 200 ชิ้น'},
  {date:'2026-06-20',staff:'ปุ๋ย',code:'C005',name:'ร้านของฝาก ท่าม่วง',route:'R02',result:'ยังไม่ตัดสินใจ',ordered:false,followUp:true,note:'ติดตามสัปดาห์หน้า'},
  {date:'2026-06-19',staff:'มิ้นท์',code:'C006',name:'เซเว่น โพธาราม',route:'R04',result:'สั่งซื้อ',ordered:true,followUp:false,note:'สั่ง 150 ชิ้น'},
  {date:'2026-06-19',staff:'มิ้นท์',code:'C007',name:'ร้านเจ๊หน่อย',route:'R06',result:'สั่งซื้อ',ordered:true,followUp:false,note:'สั่ง 90 ชิ้น'},
  {date:'2026-06-19',staff:'นุ่น',code:'C008',name:'ตลาดนัดศาลายา',route:'R08',result:'ไม่รับสาย',ordered:false,followUp:true,note:''},
  {date:'2026-06-19',staff:'นุ่น',code:'C009',name:'ร้านค้า บางบอน',route:'R08',result:'สั่งซื้อ',ordered:true,followUp:false,note:'สั่ง 100 ชิ้น'},
  {date:'2026-06-18',staff:'โบว์',code:'C010',name:'ร้านสะดวกซื้อ บางใหญ่',route:'R11',result:'สั่งซื้อ',ordered:true,followUp:false,note:'สั่ง 80 ชิ้น'},
  {date:'2026-06-18',staff:'โบว์',code:'C011',name:'ร้านโชห่วย คลองหลวง',route:'R12',result:'ปิดกิจการ',ordered:false,followUp:false,note:'ลบจากรายชื่อ'}
];

var ORD_CALL_REF = [
  {route:'R01 กำแพงแสน-ดอนตูม',date:'2026-06-20',total:15,ordered:12,notOrdered:2,followUp:1},
  {route:'R02 ท่ามะกา-ท่าม่วง',date:'2026-06-20',total:12,ordered:9,notOrdered:2,followUp:1},
  {route:'R04 บ้านโป่ง-โพธาราม',date:'2026-06-19',total:18,ordered:14,notOrdered:3,followUp:1},
  {route:'R06 เมืองราชบุรี',date:'2026-06-19',total:10,ordered:8,notOrdered:1,followUp:1},
  {route:'R08 มหาชัย-บางบอน',date:'2026-06-19',total:14,ordered:10,notOrdered:3,followUp:1},
  {route:'R11 บางใหญ่-บางบัวทอง',date:'2026-06-18',total:11,ordered:8,notOrdered:2,followUp:1}
];

function fmt(n){ return n.toLocaleString('th-TH'); }

function destroyChart(key){
  if(_ordCharts[key]){ _ordCharts[key].destroy(); _ordCharts[key]=null; }
}

function kpiCard(label,value,sub,color){
  return '<div class="kpi-card"><div class="kpi-label">'+label+'</div>'
    +'<div class="kpi-value" style="color:'+(color||'var(--primary)')+'">'+value+'</div>'
    +(sub?'<div class="kpi-sub">'+sub+'</div>':'')+'</div>';
}

// ============================================================
// 1) renderOrdStaff — พนักงาน & เขต
// ============================================================
window.renderOrdStaff = function(){
  var kpi = document.getElementById('ordStaffKPI');
  if(kpi){
    kpi.innerHTML = kpiCard('👥 พนักงานทั้งหมด',ORD_STAFF.length+' คน','ธุรการขาย/ศูนย์รับออเดอร์')
      + kpiCard('🗺️ เส้นทางทั้งหมด',ORD_ROUTES.length+' เส้นทาง','ครอบคลุม 5 จังหวัด')
      + kpiCard('⏰ รอบรับออเดอร์','3 รอบ/วัน','เช้า / บ่าย / หลังเวลา');
  }

  var cards = document.getElementById('ordStaffCards');
  if(cards){
    cards.innerHTML = ORD_STAFF.map(function(s){
      return '<div class="ord-staff-card">'
        +'<div class="ord-staff-avatar">👤</div>'
        +'<div class="ord-staff-name">'+s.name+' ('+s.nick+')</div>'
        +'<div class="ord-staff-role">'+s.role+'</div>'
        +'<div class="ord-staff-zone">📍 '+s.zone+'</div>'
        +'<div class="ord-staff-phone">📞 '+s.phone+'</div>'
        +'</div>';
    }).join('');
  }

  renderOrdRoutes();

  var cutoff = document.getElementById('ordCutoff');
  if(cutoff){
    cutoff.innerHTML = ORD_CUTOFF.map(function(c){
      return '<div class="kpi-card"><div class="kpi-label">'+c.label+'</div>'
        +'<div class="kpi-value" style="font-size:18px">'+c.time+'</div>'
        +'<div class="kpi-sub">'+c.note+'</div></div>';
    }).join('');
  }
};

window.renderOrdRoutes = function(){
  var search = (document.getElementById('ordRouteSearch')||{}).value||'';
  search = search.toLowerCase();
  var tbody = document.getElementById('ordRoutesTBody');
  if(!tbody) return;
  var rows = ORD_ROUTES.filter(function(r){
    if(!search) return true;
    return (r.route+r.day+r.region+r.code+r.person).toLowerCase().indexOf(search)>=0;
  });
  tbody.innerHTML = rows.map(function(r){
    return '<tr><td>'+r.route+'</td><td>'+r.day+'</td><td>'+r.region+'</td><td>'+r.code+'</td><td>'+r.person+'</td></tr>';
  }).join('');
};

// ============================================================
// 2) renderOrdBills — จำนวนบิล
// ============================================================
window.ordSelectBillMonth = function(m, el){
  _ordBillMonth = m;
  var tabs = document.querySelectorAll('#ordBillMonthTabs .fmtab');
  tabs.forEach(function(t){ t.classList.toggle('active', Number(t.dataset.m)===m); });
  renderOrdBillDaily();
};

window.renderOrdBills = function(){
  var kpi = document.getElementById('ordBillsKPI');
  var mKeys = Object.keys(ORD_BILLS.months);
  var lastM = mKeys[mKeys.length-1];
  var totalBills = ORD_BILLS.months[lastM].reduce(function(a,b){return a+b;},0);
  var totalPcs = ORD_BILLS.pieces[lastM].reduce(function(a,b){return a+b;},0);
  if(kpi){
    kpi.innerHTML = kpiCard('🧾 บิลเดือนล่าสุด ('+lastM+')',fmt(totalBills)+' บิล','รวมทุกคน')
      + kpiCard('📦 ชิ้นเดือนล่าสุด',fmt(totalPcs)+' ชิ้น',lastM)
      + kpiCard('👥 เฉลี่ย/คน',fmt(Math.round(totalBills/ORD_STAFF.length))+' บิล/คน','');
  }

  var sel = document.getElementById('ordBillPerson');
  if(sel && sel.options.length <= 1){
    ORD_STAFF.forEach(function(s){
      var o = document.createElement('option');
      o.value = s.nick; o.textContent = s.name+' ('+s.nick+')';
      sel.appendChild(o);
    });
  }

  renderOrdBillDaily();
  renderOrdBillMonthly();
  renderOrdBillSummary();
};

window.renderOrdBillDaily = function(){
  var canvas = document.getElementById('ordBillDailyChart');
  if(!canvas) return;
  destroyChart('billDaily');
  var data = _ordBillMonth===5 ? ORD_BILLS.daily5 : ORD_BILLS.daily6;
  var selVal = (document.getElementById('ordBillPerson')||{}).value||'all';
  var labels = data.map(function(d){return d.day;});
  var values;
  if(selVal==='all'){
    values = data.map(function(d){return d.bills.reduce(function(a,b){return a+b;},0);});
  } else {
    var idx = ORD_STAFF.map(function(s){return s.nick;}).indexOf(selVal);
    values = data.map(function(d){return idx>=0 ? d.bills[idx] : 0;});
  }
  _ordCharts.billDaily = new Chart(canvas,{
    type:'bar',
    data:{labels:labels,datasets:[{label:'จำนวนบิล',data:values,backgroundColor:'rgba(59,130,246,.6)',borderRadius:4}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
      scales:{y:{beginAtZero:true,title:{display:true,text:'บิล'}},x:{title:{display:true,text:'วันที่'}}}}
  });
};

function renderOrdBillMonthly(){
  var canvas = document.getElementById('ordBillMonthlyChart');
  if(!canvas) return;
  destroyChart('billMonthly');
  var colors = ['#3b82f6','#f59e0b','#10b981','#ef4444','#8b5cf6'];
  var datasets = ORD_STAFF.map(function(s,i){
    var vals = Object.keys(ORD_BILLS.months).map(function(m){return ORD_BILLS.months[m][i];});
    return {label:s.nick,data:vals,backgroundColor:colors[i%colors.length]};
  });
  _ordCharts.billMonthly = new Chart(canvas,{
    type:'bar',
    data:{labels:Object.keys(ORD_BILLS.months),datasets:datasets},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top'}},
      scales:{y:{beginAtZero:true,title:{display:true,text:'บิล'}}}}
  });
}

function renderOrdBillSummary(){
  var tbody = document.getElementById('ordBillSummaryTBody');
  if(!tbody) return;
  var html = '';
  ORD_STAFF.forEach(function(s,i){
    Object.keys(ORD_BILLS.months).forEach(function(m){
      html += '<tr><td>'+s.name+'</td><td>'+s.nick+'</td><td>'+s.zone+'</td><td>'+m+'</td>'
        +'<td style="text-align:right">'+fmt(ORD_BILLS.months[m][i])+'</td>'
        +'<td style="text-align:right">'+fmt(ORD_BILLS.pieces[m][i])+'</td></tr>';
    });
  });
  tbody.innerHTML = html;
}

// ============================================================
// 3) renderOrdChecklist — เช็คลิสลูกค้า
// ============================================================
window.renderOrdChecklist = function(){
  var sel = document.getElementById('ordChkPerson');
  if(sel && sel.options.length === 0){
    var all = document.createElement('option');
    all.value='all'; all.textContent='ทุกคน'; sel.appendChild(all);
    ORD_STAFF.forEach(function(s){
      var o=document.createElement('option');
      o.value=s.nick; o.textContent=s.nick;
      sel.appendChild(o);
    });
  }
  renderOrdChecklistData();
};

window.renderOrdChecklistData = function(){
  var selVal = (document.getElementById('ordChkPerson')||{}).value||'all';
  var filtered = selVal==='all' ? ORD_CHECKLIST : ORD_CHECKLIST.filter(function(c){return c.person===selVal;});
  var ordered = filtered.filter(function(c){return c.status==='สั่งซื้อ';}).length;
  var notOrdered = filtered.length - ordered;

  var kpi = document.getElementById('ordChkKPI');
  if(kpi){
    kpi.innerHTML = kpiCard('📋 ลูกค้าทั้งหมด',filtered.length+' ราย','')
      + kpiCard('✅ สั่งซื้อ',ordered+' ราย','','#10b981')
      + kpiCard('❌ ไม่สั่งซื้อ',notOrdered+' ราย','','#ef4444');
  }

  destroyChart('chkDonut');
  var canvas = document.getElementById('ordChkDonut');
  if(canvas){
    _ordCharts.chkDonut = new Chart(canvas,{
      type:'doughnut',
      data:{labels:['สั่งซื้อ','ไม่สั่งซื้อ'],datasets:[{data:[ordered,notOrdered||0],backgroundColor:['#10b981','#ef4444']}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}
    });
  }

  var note = document.getElementById('ordChkTableNote');
  if(note) note.textContent = 'แสดง '+filtered.length+' รายการ'+(selVal!=='all'?' (กรอง: '+selVal+')':'');

  var tbody = document.getElementById('ordChkTBody');
  if(tbody){
    tbody.innerHTML = filtered.map(function(c){
      var badge = c.status==='สั่งซื้อ' ? '<span style="color:#10b981;font-weight:600">✅ สั่งซื้อ</span>' : '<span style="color:#ef4444;font-weight:600">❌ ไม่สั่ง</span>';
      return '<tr><td>'+c.code+'</td><td>'+c.name+'</td><td>'+c.person+'</td><td>'+c.period+'</td><td style="text-align:right">'+fmt(c.pcs)+'</td><td>'+badge+'</td></tr>';
    }).join('');
  }
};

// ============================================================
// 4) renderOrdErrors — ความผิดพลาด & เคลม
// ============================================================
window.renderOrdErrors = function(){
  renderOrdProxy();
  renderOrdErrorTable();
  renderOrdReturns();
  renderOrdClaims();
};

function renderOrdProxy(){
  var tbody = document.getElementById('ordProxyTBody');
  if(!tbody) return;
  var lastM = Object.keys(ORD_BILLS.months);
  var m6 = lastM[lastM.length-1];
  tbody.innerHTML = ORD_STAFF.map(function(s,i){
    return '<tr><td>'+s.name+' ('+s.nick+')</td><td>'+s.zone+'</td>'
      +'<td style="text-align:right">'+fmt(ORD_BILLS.months[m6][i])+'</td>'
      +'<td style="text-align:right">'+fmt(ORD_BILLS.pieces[m6][i])+'</td>'
      +'<td style="text-align:right">'+fmt(Math.round(ORD_BILLS.pieces[m6][i]/30))+'</td></tr>';
  }).join('');

  destroyChart('proxy');
  var canvas = document.getElementById('ordProxyChart');
  if(!canvas) return;
  var colors = ['#3b82f6','#f59e0b','#10b981','#ef4444','#8b5cf6'];
  _ordCharts.proxy = new Chart(canvas,{
    type:'bar',
    data:{labels:ORD_STAFF.map(function(s){return s.nick;}),
      datasets:[{label:'บิล ('+m6+')',data:ORD_BILLS.months[m6],backgroundColor:colors}]},
    options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',
      plugins:{legend:{display:false}},scales:{x:{beginAtZero:true}}}
  });
}

function renderOrdErrorTable(){
  var tbody = document.getElementById('ordErrorTBody');
  if(!tbody) return;
  tbody.innerHTML = ORD_ERRORS.map(function(e){
    var total = e.noSend+e.wrongKey+e.missed+e.dup+e.wrongBranch;
    return '<tr><td>'+e.person+'</td><td>'+e.zone+'</td><td>'+e.month+'</td>'
      +'<td style="text-align:right">'+e.noSend+'</td><td style="text-align:right">'+e.wrongKey+'</td>'
      +'<td style="text-align:right">'+e.missed+'</td><td style="text-align:right">'+e.dup+'</td>'
      +'<td style="text-align:right">'+e.wrongBranch+'</td>'
      +'<td style="text-align:right;font-weight:600'+(total>0?';color:#ef4444':'')+'">'+total+'</td></tr>';
  }).join('');

  destroyChart('error');
  var canvas = document.getElementById('ordErrorChart');
  if(!canvas) return;
  var persons = [];
  ORD_ERRORS.forEach(function(e){ if(persons.indexOf(e.person)<0) persons.push(e.person); });
  var totals = persons.map(function(p){
    return ORD_ERRORS.filter(function(e){return e.person===p;}).reduce(function(s,e){
      return s+e.noSend+e.wrongKey+e.missed+e.dup+e.wrongBranch;
    },0);
  });
  _ordCharts.error = new Chart(canvas,{
    type:'bar',
    data:{labels:persons,datasets:[{label:'ข้อผิดพลาดรวม',data:totals,backgroundColor:'#ef4444'}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
      scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}
  });
}

window.renderOrdReturns = function(){
  var sel = document.getElementById('ordReturnPeriod');
  if(sel && sel.options.length===0){
    ['ทั้งหมด','เม.ย. 69','พ.ค. 69','มิ.ย. 69'].forEach(function(p){
      var o=document.createElement('option'); o.value=p; o.textContent=p; sel.appendChild(o);
    });
  }
  var period = sel ? sel.value : 'ทั้งหมด';
  var filtered = ORD_RETURNS;
  if(period!=='ทั้งหมด'){
    var monthMap = {'เม.ย. 69':'04','พ.ค. 69':'05','มิ.ย. 69':'06'};
    var mm = monthMap[period]||'';
    filtered = ORD_RETURNS.filter(function(r){return r.date.indexOf('-'+mm+'-')>=0;});
  }
  var tbody = document.getElementById('ordReturnTBody');
  if(!tbody) return;
  tbody.innerHTML = filtered.map(function(r){
    return '<tr><td>'+r.no+'</td><td>'+r.date+'</td><td>'+r.product+'</td>'
      +'<td style="text-align:right">'+r.qty+'</td><td>'+r.cause+'</td><td>'+r.route+'</td>'
      +'<td>'+r.person+'</td><td>'+r.keyer+'</td><td>'+r.action+'</td></tr>';
  }).join('');
};

function renderOrdClaims(){
  var tbody = document.getElementById('ordClaimTBody');
  if(tbody){
    tbody.innerHTML = ORD_CLAIMS.map(function(c){
      return '<tr><td>'+c.month+'</td><td style="text-align:right">'+c.count+'</td></tr>';
    }).join('');
  }
  destroyChart('claim');
  var canvas = document.getElementById('ordClaimChart');
  if(!canvas) return;
  _ordCharts.claim = new Chart(canvas,{
    type:'bar',
    data:{labels:ORD_CLAIMS.map(function(c){return c.month;}),
      datasets:[{label:'จำนวนบิลเคลม',data:ORD_CLAIMS.map(function(c){return c.count;}),
        backgroundColor:'#f59e0b',borderRadius:4}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
      scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}
  });
}

// ============================================================
// 5) renderOrdCalls — การโทรลูกค้า
// ============================================================
window.renderOrdCalls = function(){
  var staffSel = document.getElementById('callLogStaff');
  if(staffSel && staffSel.options.length<=1){
    ORD_STAFF.forEach(function(s){
      var o=document.createElement('option'); o.value=s.nick; o.textContent=s.nick;
      staffSel.appendChild(o);
    });
  }
  var dashStaff = document.getElementById('callDashStaff');
  if(dashStaff && dashStaff.options.length<=1){
    ORD_STAFF.forEach(function(s){
      var o=document.createElement('option'); o.value=s.nick; o.textContent=s.nick;
      dashStaff.appendChild(o);
    });
  }
  renderCallLogTable();
  renderCallDashboard();
  renderCallRef();
};

window.renderCallLogTable = function(){
  var staffVal = (document.getElementById('callLogStaff')||{}).value||'all';
  var dateVal = (document.getElementById('callLogDate')||{}).value||'';
  var filtered = ORD_CALL_LOG.filter(function(c){
    if(staffVal!=='all' && c.staff!==staffVal) return false;
    if(dateVal && c.date!==dateVal) return false;
    return true;
  });
  var note = document.getElementById('callLogNote');
  if(note) note.textContent = 'แสดง '+filtered.length+' รายการ';
  var tbody = document.getElementById('callLogTBody');
  if(!tbody) return;
  tbody.innerHTML = filtered.map(function(c){
    return '<tr><td>'+c.date+'</td><td>'+c.staff+'</td><td>'+c.code+'</td><td>'+c.name+'</td><td>'+c.route+'</td>'
      +'<td>'+c.result+'</td><td>'+(c.ordered?'✅':'—')+'</td><td>'+(c.followUp?'🔄':'—')+'</td>'
      +'<td>'+c.note+'</td><td style="text-align:center"><button class="ord-mini-btn" onclick="alert(\'ฟังก์ชันแก้ไขอยู่ระหว่างพัฒนา\')">✏️</button></td></tr>';
  }).join('');
};

window.callLogClearFilter = function(){
  var s = document.getElementById('callLogStaff');
  var d = document.getElementById('callLogDate');
  if(s) s.value='all';
  if(d) d.value='';
  renderCallLogTable();
};

window.renderCallDashboard = function(){
  var dateVal = (document.getElementById('callDashDate')||{}).value||'2026-06-20';
  var staffVal = (document.getElementById('callDashStaff')||{}).value||'all';

  var staffList = staffVal==='all' ? ORD_STAFF.map(function(s){return s.nick;}) : [staffVal];
  var rows = staffList.map(function(nick){
    var calls = ORD_CALL_LOG.filter(function(c){return c.staff===nick && c.date===dateVal;});
    var closed = calls.filter(function(c){return c.ordered;}).length;
    return {staff:nick, target:20, called:calls.length, closed:closed,
      conv: calls.length>0 ? Math.round(closed/calls.length*100) : 0,
      goal: Math.round(calls.length/20*100)};
  });

  var kpi = document.getElementById('callDashKPI');
  if(kpi){
    var totalCalled = rows.reduce(function(s,r){return s+r.called;},0);
    var totalClosed = rows.reduce(function(s,r){return s+r.closed;},0);
    kpi.innerHTML = kpiCard('📞 โทรทั้งหมด',totalCalled+' สาย','วันที่ '+dateVal)
      + kpiCard('✅ ปิดการขาย',totalClosed+' ราย','','#10b981')
      + kpiCard('📊 Conversion',totalCalled>0?Math.round(totalClosed/totalCalled*100)+'%':'0%','');
  }

  var tbody = document.getElementById('callDashTBody');
  if(tbody){
    tbody.innerHTML = rows.map(function(r){
      return '<tr><td>'+r.staff+'</td><td style="text-align:right">'+r.target+'</td>'
        +'<td style="text-align:right">'+r.called+'</td><td style="text-align:right">'+r.closed+'</td>'
        +'<td style="text-align:right">'+r.conv+'%</td>'
        +'<td style="text-align:right;color:'+(r.goal>=100?'#10b981':'#ef4444')+'">'+r.goal+'%</td></tr>';
    }).join('');
  }

  destroyChart('callDash');
  var canvas = document.getElementById('callDashChart');
  if(!canvas) return;
  _ordCharts.callDash = new Chart(canvas,{
    type:'bar',
    data:{labels:rows.map(function(r){return r.staff;}),
      datasets:[
        {label:'โทรแล้ว',data:rows.map(function(r){return r.called;}),backgroundColor:'#3b82f6'},
        {label:'ปิดการขาย',data:rows.map(function(r){return r.closed;}),backgroundColor:'#10b981'}
      ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'top'}},scales:{y:{beginAtZero:true}}}
  });
};

function renderCallRef(){
  var tbody = document.getElementById('callRefTBody');
  if(!tbody) return;
  tbody.innerHTML = ORD_CALL_REF.map(function(r){
    return '<tr><td>'+r.route+'</td><td>'+r.date+'</td><td style="text-align:right">'+r.total+'</td>'
      +'<td style="text-align:right">'+r.ordered+'</td><td style="text-align:right">'+r.notOrdered+'</td>'
      +'<td style="text-align:right">'+r.followUp+'</td></tr>';
  }).join('');
}

window.openCallModal = function(){
  alert('ระบบบันทึกการโทรอยู่ระหว่างพัฒนา');
};

// ============================================================
// 6) renderOrdPerf — Performance รายคน
// ============================================================
var _ordPerfMode = 'ytd';

window.renderOrdPerf = function(){
  var sel = document.getElementById('ordPerfPerson');
  if(sel && sel.options.length===0){
    ORD_STAFF.forEach(function(s){
      var o=document.createElement('option'); o.value=s.nick; o.textContent=s.name+' ('+s.nick+')';
      sel.appendChild(o);
    });
  }
  ordPerfRender();
};

window.ordPerfSetMode = function(mode, el){
  _ordPerfMode = mode;
  var tabs = document.querySelectorAll('#ordPerfModeTabs .fmtab');
  tabs.forEach(function(t){ t.classList.toggle('active', t.dataset.mode===mode); });
  var mw = document.getElementById('ordPerfMonthWrap');
  var rw = document.getElementById('ordPerfRangeWrap');
  if(mw) mw.style.display = mode==='month'?'':'none';
  if(rw) rw.style.display = mode==='range'?'':'none';
  ordPerfRender();
};

window.ordPerfSetPeriod = function(){ ordPerfRender(); };
window.ordPerfSetRange = function(){ ordPerfRender(); };
window.ordPerfSetSort = function(){ ordPerfRender(); };
window.ordPerfDetailChange = function(){ ordPerfRenderDetail(); };

function ordPerfRender(){
  var months = ['มี.ค.','เม.ย.','พ.ค.','มิ.ย.'];
  var mKeys = Object.keys(ORD_BILLS.months);

  var label = document.getElementById('ordPerfLabel');
  if(label) label.textContent = 'ช่วงเวลา: '+(_ordPerfMode==='ytd'?'ทั้งหมด (YTD มี.ค.–มิ.ย. 2569)':
    _ordPerfMode==='3m'?'3 เดือนล่าสุด':_ordPerfMode==='month'?'รายเดือน':'กำหนดเอง');

  var perfData = ORD_STAFF.map(function(s,i){
    var totalBills=0, totalPcs=0;
    mKeys.forEach(function(m){ totalBills+=ORD_BILLS.months[m][i]; totalPcs+=ORD_BILLS.pieces[m][i]; });
    var calls = ORD_CALL_LOG.filter(function(c){return c.staff===s.nick;}).length;
    var closed = ORD_CALL_LOG.filter(function(c){return c.staff===s.nick && c.ordered;}).length;
    var errors = ORD_ERRORS.filter(function(e){return e.person===s.nick;}).reduce(function(sum,e){
      return sum+e.noSend+e.wrongKey+e.missed+e.dup+e.wrongBranch;
    },0);
    return {name:s.name,nick:s.nick,zone:s.zone,bills:totalBills,pcs:totalPcs,
      calls:calls,closed:closed,conv:calls>0?Math.round(closed/calls*100):0,errors:errors};
  });

  var sortKey = (document.getElementById('ordPerfSort')||{}).value||'bills';
  perfData.sort(function(a,b){
    if(sortKey==='errors') return a[sortKey]-b[sortKey];
    return b[sortKey]-a[sortKey];
  });

  var teamKPI = document.getElementById('ordPerfTeamKPI');
  if(teamKPI){
    var tb = perfData.reduce(function(s,d){return s+d.bills;},0);
    var tp = perfData.reduce(function(s,d){return s+d.pcs;},0);
    var tc = perfData.reduce(function(s,d){return s+d.calls;},0);
    var tcl = perfData.reduce(function(s,d){return s+d.closed;},0);
    teamKPI.innerHTML = kpiCard('🧾 บิลรวม',fmt(tb),'')
      + kpiCard('📦 ชิ้นรวม',fmt(tp),'')
      + kpiCard('📞 โทรรวม',tc+' สาย','')
      + kpiCard('✅ ปิดการขาย',tcl+' ราย','','#10b981');
  }

  var tbody = document.getElementById('ordPerfRankTBody');
  if(tbody){
    tbody.innerHTML = perfData.map(function(d,i){
      var medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':''+(i+1);
      return '<tr style="cursor:pointer" onclick="document.getElementById(\'ordPerfPerson\').value=\''+d.nick+'\';ordPerfDetailChange()">'
        +'<td>'+medal+'</td><td>'+d.name+' ('+d.nick+')</td><td>'+d.zone+'</td>'
        +'<td style="text-align:right">'+fmt(d.bills)+'</td><td style="text-align:right">'+fmt(d.pcs)+'</td>'
        +'<td style="text-align:right">'+d.calls+'</td><td style="text-align:right">'+d.closed+'</td>'
        +'<td style="text-align:right">'+d.conv+'%</td>'
        +'<td style="text-align:right;color:'+(d.errors>0?'#ef4444':'#10b981')+'">'+d.errors+'</td></tr>';
    }).join('');
  }

  destroyChart('perfBill');
  var billCanvas = document.getElementById('ordPerfRankBillChart');
  if(billCanvas){
    var colors = ['#3b82f6','#f59e0b','#10b981','#ef4444','#8b5cf6'];
    _ordCharts.perfBill = new Chart(billCanvas,{
      type:'bar',
      data:{labels:perfData.map(function(d){return d.nick;}),
        datasets:[{label:'จำนวนบิล',data:perfData.map(function(d){return d.bills;}),backgroundColor:colors}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
        scales:{y:{beginAtZero:true}}}
    });
  }

  destroyChart('perfConv');
  var convCanvas = document.getElementById('ordPerfRankConvChart');
  if(convCanvas){
    _ordCharts.perfConv = new Chart(convCanvas,{
      type:'bar',
      data:{labels:perfData.map(function(d){return d.nick;}),
        datasets:[{label:'Conversion %',data:perfData.map(function(d){return d.conv;}),
          backgroundColor:perfData.map(function(d){return d.conv>=50?'#10b981':'#f59e0b';})}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
        scales:{y:{beginAtZero:true,max:100,title:{display:true,text:'%'}}}}
    });
  }

  ordPerfRenderDetail();
}

function ordPerfRenderDetail(){
  var nick = (document.getElementById('ordPerfPerson')||{}).value;
  if(!nick) nick = ORD_STAFF[0].nick;
  var idx = ORD_STAFF.map(function(s){return s.nick;}).indexOf(nick);
  if(idx<0) return;
  var s = ORD_STAFF[idx];
  var mKeys = Object.keys(ORD_BILLS.months);

  var kpi = document.getElementById('ordPerfDetailKPI');
  if(kpi){
    var tb = mKeys.reduce(function(sum,m){return sum+ORD_BILLS.months[m][idx];},0);
    var tp = mKeys.reduce(function(sum,m){return sum+ORD_BILLS.pieces[m][idx];},0);
    var calls = ORD_CALL_LOG.filter(function(c){return c.staff===nick;}).length;
    var closed = ORD_CALL_LOG.filter(function(c){return c.staff===nick&&c.ordered;}).length;
    kpi.innerHTML = kpiCard('👤 '+s.name+' ('+nick+')',s.zone,'')
      + kpiCard('🧾 บิลรวม',fmt(tb),'')
      + kpiCard('📞 โทร',calls+' สาย','ปิดการขาย '+closed)
      + kpiCard('📊 Conversion',calls>0?Math.round(closed/calls*100)+'%':'0%','');
  }

  var tbody = document.getElementById('ordPerfDetailTBody');
  if(tbody){
    tbody.innerHTML = mKeys.map(function(m){
      var calls = ORD_CALL_LOG.filter(function(c){return c.staff===nick;}).length;
      var closed = ORD_CALL_LOG.filter(function(c){return c.staff===nick&&c.ordered;}).length;
      var errors = ORD_ERRORS.filter(function(e){return e.person===nick && e.month===m.replace(' 2569','').replace('.','');}).reduce(function(sum,e){
        return sum+e.noSend+e.wrongKey+e.missed+e.dup+e.wrongBranch;
      },0);
      var conv = calls>0?Math.round(closed/calls*100):0;
      return '<tr><td>'+m+'</td><td style="text-align:right">'+fmt(ORD_BILLS.months[m][idx])+'</td>'
        +'<td style="text-align:right">'+fmt(ORD_BILLS.pieces[m][idx])+'</td>'
        +'<td style="text-align:right">'+Math.round(calls/4)+'</td>'
        +'<td style="text-align:right">'+Math.round(closed/4)+'</td>'
        +'<td style="text-align:right">'+conv+'%</td>'
        +'<td style="text-align:right;color:'+(errors>0?'#ef4444':'#10b981')+'">'+errors+'</td></tr>';
    }).join('');
  }

  destroyChart('perfDetail');
  var canvas = document.getElementById('ordPerfDetailChart');
  if(!canvas) return;
  _ordCharts.perfDetail = new Chart(canvas,{
    type:'line',
    data:{labels:mKeys,
      datasets:[
        {label:'บิล',data:mKeys.map(function(m){return ORD_BILLS.months[m][idx];}),borderColor:'#3b82f6',tension:0.3,fill:false},
        {label:'ชิ้น (÷10)',data:mKeys.map(function(m){return Math.round(ORD_BILLS.pieces[m][idx]/10);}),borderColor:'#f59e0b',tension:0.3,fill:false}
      ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top'}},
      scales:{y:{beginAtZero:true}}}
  });
}

})();
