// ============================================================
// KPI TAB + CRM TAB + Booth Contract Alerts + Promotions
// Depends on: app.js (CHANNEL_MONTHLY, SALES_MONTHLY, etc.)
// ============================================================
(function(){
'use strict';

// ---- Booth contract data ----
window.BOOTH_CONTRACTS = [
  {booth:'ลำพยา 3 (ใหม่)',start:'2025-10-01',end:'2026-09-30',rent:8000},
  {booth:'ร้านใหม่ (ปตท.คุณาวรรณ)',start:'2026-01-15',end:'2026-07-14',rent:12000},
  {booth:'หน้ามอ (ม.เกษตร)',start:'2025-08-01',end:'2026-07-31',rent:15000},
  {booth:'ลำพยา 3 (เก่า)',start:'2025-06-01',end:'2026-05-31',rent:7500},
  {booth:'ไทวัสดุ',start:'2026-03-01',end:'2027-02-28',rent:10000},
  {booth:'แก้วมณีกาญ',start:'2025-12-01',end:'2026-11-30',rent:9000},
  {booth:'ลำพยา 2 (ใหม่)',start:'2026-02-01',end:'2027-01-31',rent:8500},
  {booth:'ธรรมศาลา',start:'2025-09-01',end:'2026-08-31',rent:6000},
  {booth:'ตลาดดิโอโซน',start:'2026-04-01',end:'2027-03-31',rent:11000},
  {booth:'ปตท.ราชบุรี',start:'2025-11-01',end:'2026-10-31',rent:13000},
  {booth:'ศาลายา กม.26',start:'2026-01-01',end:'2026-12-31',rent:9500},
  {booth:'ลาดหลุมแก้ว',start:'2025-07-01',end:'2026-06-30',rent:7000},
  {booth:'วัดเขาทำเทียม',start:'2026-05-01',end:'2027-04-30',rent:5500},
  {booth:'วัดใหม่สุปดิษฐาราม',start:'2025-10-15',end:'2026-10-14',rent:6500},
  {booth:'ศิลปากร',start:'2026-06-01',end:'2027-05-31',rent:8000},
  {booth:'วันดอนขนาก',start:'2025-08-15',end:'2026-08-14',rent:5000},
  {booth:'ชัยพฤกษ์ - นนทบุรี',start:'2026-03-15',end:'2027-03-14',rent:14000},
  {booth:'โลตัส กำแพงแสน',start:'2025-09-01',end:'2026-08-31',rent:12000},
  {booth:'โลตัส บางเลน',start:'2026-01-01',end:'2026-12-31',rent:11500}
];

// ---- Promotions data ----
window.BOOTH_PROMOTIONS = [
  {booth:'ลำพยา 3 (ใหม่)',promo:'ซื้อ 3 แถม 1 ขนมปังสอดไส้',start:'2026-07-01',end:'2026-07-31',status:'active'},
  {booth:'หน้ามอ (ม.เกษตร)',promo:'ลด 15% สินค้าใหม่ NPD',start:'2026-07-15',end:'2026-08-15',status:'active'},
  {booth:'ไทวัสดุ',promo:'แจกชิมฟรี เค้กโรลใหม่',start:'2026-07-10',end:'2026-07-20',status:'active'},
  {booth:'แก้วมณีกาญ',promo:'ซื้อครบ 200 ลด 30',start:'2026-06-01',end:'2026-06-30',status:'ended'},
  {booth:'ตลาดดิโอโซน',promo:'ซื้อ 5 แถม 1 ทุกรายการ',start:'2026-08-01',end:'2026-08-31',status:'upcoming'},
  {booth:'ศาลายา กม.26',promo:'สมาชิกลด 10%',start:'2026-07-01',end:'2026-09-30',status:'active'},
  {booth:'ชัยพฤกษ์ - นนทบุรี',promo:'ชิมฟรีขนมปังกรอบ',start:'2026-07-05',end:'2026-07-25',status:'active'}
];

// ---- CRM data ----
window.CRM_DATA = {
  mt: {
    label:'Modern Trade',
    customers:[
      {name:'CJ MORE',status:'active',lastOrder:'2026-07-15',totalOrders:45,totalSales:2850000,contact:'คุณสมศรี',phone:'081-xxx-1234',nextVisit:'2026-07-22'},
      {name:'Big C',status:'active',lastOrder:'2026-07-10',totalOrders:38,totalSales:4200000,contact:'คุณวิภา',phone:'082-xxx-5678',nextVisit:'2026-07-25'},
      {name:'Tops',status:'active',lastOrder:'2026-07-12',totalOrders:32,totalSales:1950000,contact:'คุณนิดา',phone:'083-xxx-9012',nextVisit:'2026-07-23'},
      {name:'Makro',status:'active',lastOrder:'2026-06-28',totalOrders:22,totalSales:3100000,contact:'คุณพิชัย',phone:'084-xxx-3456',nextVisit:'2026-07-20'},
      {name:'Aeon',status:'inactive',lastOrder:'2026-04-15',totalOrders:8,totalSales:520000,contact:'คุณอรุณ',phone:'085-xxx-7890',nextVisit:'-'},
      {name:'The Mall',status:'active',lastOrder:'2026-07-08',totalOrders:15,totalSales:980000,contact:'คุณเพชร',phone:'086-xxx-2345',nextVisit:'2026-07-28'}
    ],
    activities:[
      {date:'2026-07-18',type:'visit',customer:'CJ MORE',note:'เข้าเยี่ยม 3 สาขา ตรวจสต็อก',staff:'ระวีวรรณ'},
      {date:'2026-07-17',type:'order',customer:'Big C',note:'PO #BC-2607 ยอด 185,000',staff:'ระวีวรรณ'},
      {date:'2026-07-16',type:'call',customer:'Makro',note:'ติดตาม PO ค้างส่ง',staff:'ระวีวรรณ'},
      {date:'2026-07-15',type:'meeting',customer:'Tops',note:'ประชุมแผนโปรโมชั่น Q3',staff:'ระวีวรรณ'}
    ]
  },
  amazon: {
    label:'Amazon & Souvenir',
    customers:[
      {name:'OR (Amazon Cafe)',status:'active',lastOrder:'2026-07-16',totalOrders:120,totalSales:5400000,contact:'คุณปาล์ม',phone:'087-xxx-1111',nextVisit:'2026-07-21'},
      {name:'COCO',status:'active',lastOrder:'2026-07-14',totalOrders:85,totalSales:3200000,contact:'คุณแก้ว',phone:'087-xxx-2222',nextVisit:'2026-07-23'},
      {name:'RM',status:'active',lastOrder:'2026-07-10',totalOrders:42,totalSales:1800000,contact:'คุณต้น',phone:'087-xxx-3333',nextVisit:'2026-07-24'},
      {name:'ร้านของฝาก (กลุ่ม A)',status:'active',lastOrder:'2026-07-12',totalOrders:65,totalSales:2100000,contact:'คุณนก',phone:'087-xxx-4444',nextVisit:'2026-07-22'},
      {name:'Black Canyon',status:'inactive',lastOrder:'2026-03-20',totalOrders:5,totalSales:180000,contact:'คุณพล',phone:'087-xxx-5555',nextVisit:'-'},
      {name:'ลูกค้าทั่วไป',status:'active',lastOrder:'2026-07-18',totalOrders:200,totalSales:4800000,contact:'-',phone:'-',nextVisit:'-'}
    ],
    activities:[
      {date:'2026-07-18',type:'visit',customer:'OR (Amazon Cafe)',note:'เยี่ยม 5 สาขา เปิดสินค้าใหม่ 3 SKU',staff:'ณัฏฐวรรณ'},
      {date:'2026-07-17',type:'order',customer:'COCO',note:'PO #CC-1807 ยอด 95,000',staff:'ภาณุวัฒน์'},
      {date:'2026-07-16',type:'call',customer:'ร้านของฝาก (กลุ่ม A)',note:'แนะนำสินค้าใหม่ NPD',staff:'วีระ'},
      {date:'2026-07-15',type:'visit',customer:'RM',note:'ตรวจชั้นวาง + เก็บ return',staff:'ณัฏฐวรรณ'}
    ]
  },
  booth: {
    label:'Booth',
    customers:[
      {name:'ลำพยา 3 (ใหม่)',status:'active',lastOrder:'2026-07-18',totalOrders:180,totalSales:850000,contact:'พนักงานประจำบูธ',phone:'-',nextVisit:'-'},
      {name:'หน้ามอ (ม.เกษตร)',status:'active',lastOrder:'2026-07-18',totalOrders:210,totalSales:1200000,contact:'พนักงานประจำบูธ',phone:'-',nextVisit:'-'},
      {name:'ไทวัสดุ',status:'active',lastOrder:'2026-07-17',totalOrders:95,totalSales:480000,contact:'พนักงานประจำบูธ',phone:'-',nextVisit:'-'},
      {name:'แก้วมณีกาญ',status:'active',lastOrder:'2026-07-16',totalOrders:88,totalSales:420000,contact:'พนักงานประจำบูธ',phone:'-',nextVisit:'-'}
    ],
    activities:[
      {date:'2026-07-18',type:'order',customer:'หน้ามอ (ม.เกษตร)',note:'ยอดวันนี้ 8,500 บาท',staff:'วัลนิภา'},
      {date:'2026-07-18',type:'order',customer:'ลำพยา 3 (ใหม่)',note:'ยอดวันนี้ 6,200 บาท',staff:'วัลนิภา'},
      {date:'2026-07-17',type:'visit',customer:'ไทวัสดุ',note:'เติมสินค้า + จัดดิสเพลย์ใหม่',staff:'วัลนิภา'}
    ]
  },
  online: {
    label:'Online',
    customers:[
      {name:'Facebook Shop',status:'active',lastOrder:'2026-07-18',totalOrders:320,totalSales:1500000,contact:'ทีม Online',phone:'-',nextVisit:'-'},
      {name:'Line OA',status:'active',lastOrder:'2026-07-17',totalOrders:180,totalSales:920000,contact:'ทีม Online',phone:'-',nextVisit:'-'},
      {name:'Shopee',status:'active',lastOrder:'2026-07-18',totalOrders:450,totalSales:2100000,contact:'ทีม Online',phone:'-',nextVisit:'-'},
      {name:'Lazada',status:'active',lastOrder:'2026-07-15',totalOrders:280,totalSales:1350000,contact:'ทีม Online',phone:'-',nextVisit:'-'},
      {name:'TikTok Shop',status:'active',lastOrder:'2026-07-18',totalOrders:150,totalSales:680000,contact:'ทีม Online',phone:'-',nextVisit:'-'}
    ],
    activities:[
      {date:'2026-07-18',type:'order',customer:'Shopee',note:'28 ออเดอร์ ยอด 42,500',staff:'ทีม Online'},
      {date:'2026-07-18',type:'order',customer:'Facebook Shop',note:'15 ออเดอร์ ยอด 28,300',staff:'ทีม Online'},
      {date:'2026-07-17',type:'order',customer:'TikTok Shop',note:'12 ออเดอร์ ยอด 18,900 (Live สด)',staff:'ทีม Online'}
    ]
  },
  telesales: {
    label:'Telesales',
    customers:[
      {name:'กลุ่ม A (สั่งประจำ)',status:'active',lastOrder:'2026-07-18',totalOrders:500,totalSales:3200000,contact:'เจ้เค้ก',phone:'-',nextVisit:'-'},
      {name:'กลุ่ม B (สั่งไม่สม่ำเสมอ)',status:'active',lastOrder:'2026-07-10',totalOrders:180,totalSales:850000,contact:'เจ้เค้ก',phone:'-',nextVisit:'-'},
      {name:'กลุ่ม C (หยุดสั่ง > 30 วัน)',status:'inactive',lastOrder:'2026-05-28',totalOrders:45,totalSales:220000,contact:'เจ้เค้ก',phone:'-',nextVisit:'-'},
      {name:'ลูกค้าใหม่ (Prospect)',status:'prospect',lastOrder:'-',totalOrders:0,totalSales:0,contact:'เจ้เค้ก',phone:'-',nextVisit:'-'}
    ],
    activities:[
      {date:'2026-07-18',type:'call',customer:'กลุ่ม A',note:'โทร 35 สาย ติดต่อได้ 28 ออกบิล 18',staff:'เจ้เค้ก'},
      {date:'2026-07-17',type:'call',customer:'กลุ่ม B',note:'โทร 20 สาย ติดต่อได้ 12 ออกบิล 5',staff:'เจ้เค้ก'},
      {date:'2026-07-16',type:'call',customer:'กลุ่ม C',note:'โทรติดตาม 15 สาย กลับมาสั่ง 3 ราย',staff:'เจ้เค้ก'}
    ]
  }
};

// ---- Forecast data per channel per month (M = ล้านบาท) ----
var FORECAST_DATA = {
  'Modern Trade':      {target:[22,25,26,30,43,46,33],forecast:[22,23,24,26,33,35,30],revised:[22,21,22,24,28,30,28],actual:[23.5,19.8,21.2,22.5,18.7,20.4,0]},
  'Amazon & Souvenir': {target:[18,20,20,23,33,35,25],forecast:[18,19,19,21,25,27,23],revised:[18,17,18,18,22,23,22],actual:[19.2,16.8,17.5,18.3,15.2,16.7,0]},
  'Booth':             {target:[8,9,9,11,16,17,12],   forecast:[8,8,9,10,12,13,12],   revised:[8,7,8,9,11,12,11],   actual:[8.5,7.0,7.5,8.5,6.8,7.9,0]},
  'Online':            {target:[7,8,8,9,13,14,10],    forecast:[7,8,8,8,10,10,10],    revised:[7,7,7,7,9,10,9],     actual:[6.5,6.0,6.4,6.5,5.8,6.1,0]}
};
var FC_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.'];

var _kpiTrendChart = null;
var _kpiFcChart = null;

// ============================================================
// KPI Overview
// ============================================================
window.renderKpiOverview = function(){
  var channels=['Modern Trade','Amazon & Souvenir','Booth','Online'];
  var months=['Jan','Feb','Mar','Apr','May','Jun','Jul'];
  var totTarget=0,totActual=0,totGP=0;
  var chData=[];
  channels.forEach(function(ch){
    var tS=0,aS=0;
    months.forEach(function(m){var cm=CHANNEL_MONTHLY[m];var d=cm&&cm[ch]?cm[ch]:{t:0,a:0};tS+=d.t||0;aS+=d.a||0;});
    var p=tS?(aS/tS*100):0,gp=aS*0.32;
    chData.push({ch:ch,target:tS,actual:aS,pct:p,gp:gp});
    totTarget+=tS;totActual+=aS;totGP+=gp;
  });
  var totPct=totTarget?(totActual/totTarget*100):0;
  var ce=document.getElementById('kpiOverviewCards');
  if(ce){
    ce.innerHTML=
      '<div class="kpi-card" style="border-top:3px solid #1d4ed8"><div class="kpi-label">ยอดขายรวม YTD</div><div class="kpi-value" style="color:#1d4ed8">'+(totActual/1e6).toFixed(1)+'M</div><div class="kpi-sub">เป้า '+(totTarget/1e6).toFixed(1)+'M</div></div>'+
      '<div class="kpi-card" style="border-top:3px solid '+(totPct>=80?'#16a34a':'#dc2626')+'"><div class="kpi-label">Achievement</div><div class="kpi-value" style="color:'+(totPct>=80?'#16a34a':'#dc2626')+'">'+totPct.toFixed(1)+'%</div><div class="kpi-sub">'+(totPct>=80?'On Track':'Below Target')+'</div></div>'+
      '<div class="kpi-card" style="border-top:3px solid #7c3aed"><div class="kpi-label">GP รวม (est.32%)</div><div class="kpi-value" style="color:#7c3aed">'+(totGP/1e6).toFixed(1)+'M</div><div class="kpi-sub">บาท</div></div>'+
      '<div class="kpi-card" style="border-top:3px solid #0ea5e9"><div class="kpi-label">ช่องทาง Active</div><div class="kpi-value" style="color:#0ea5e9">'+channels.length+'</div><div class="kpi-sub">channels</div></div>';
  }
  var tbl=document.getElementById('kpiOverviewTable');
  if(tbl){
    var bg=['#fff','#f8fafc'];
    var rows=chData.map(function(d,i){
      var pc=d.pct>=80?'#16a34a':d.pct>=60?'#b45309':'#dc2626';
      var pcBg=d.pct>=80?'#dcfce7':d.pct>=60?'#fef3c7':'#fee2e2';
      return '<tr style="background:'+bg[i%2]+'"><td style="padding:8px 12px;font-size:13px;font-weight:600">'+d.ch+'</td>'+
        '<td style="padding:8px 12px;font-size:12px;text-align:right">'+(d.target/1e6).toFixed(1)+'M</td>'+
        '<td style="padding:8px 12px;font-size:12px;text-align:right;font-weight:700">'+(d.actual/1e6).toFixed(1)+'M</td>'+
        '<td style="padding:8px 12px;text-align:center"><span style="background:'+pcBg+';color:'+pc+';padding:2px 10px;border-radius:4px;font-size:11px;font-weight:700">'+d.pct.toFixed(1)+'%</span></td>'+
        '<td style="padding:8px 12px;font-size:12px;text-align:right">'+(d.gp/1e6).toFixed(1)+'M</td></tr>';
    });
    var gpc=totPct>=80?'#16a34a':'#dc2626';
    rows.push('<tr style="background:#f1f5f9;font-weight:700"><td style="padding:8px 12px;font-size:13px">รวมทั้งหมด</td>'+
      '<td style="padding:8px 12px;font-size:12px;text-align:right">'+(totTarget/1e6).toFixed(1)+'M</td>'+
      '<td style="padding:8px 12px;font-size:12px;text-align:right">'+(totActual/1e6).toFixed(1)+'M</td>'+
      '<td style="padding:8px 12px;text-align:center"><span style="color:'+gpc+';font-weight:700;font-size:12px">'+totPct.toFixed(1)+'%</span></td>'+
      '<td style="padding:8px 12px;font-size:12px;text-align:right">'+(totGP/1e6).toFixed(1)+'M</td></tr>');
    tbl.innerHTML='<table><thead><tr style="background:#1e293b;color:#fff"><th style="padding:8px 12px">ช่องทาง</th><th style="padding:8px 12px;text-align:right">เป้า YTD</th><th style="padding:8px 12px;text-align:right">Actual YTD</th><th style="padding:8px 12px;text-align:center">Achievement</th><th style="padding:8px 12px;text-align:right">GP (est.)</th></tr></thead><tbody>'+rows.join('')+'</tbody></table>';
  }
  // Trend chart
  var ctx=document.getElementById('kpiTrendChart');
  if(ctx){
    if(_kpiTrendChart)_kpiTrendChart.destroy();
    var tA=[],aA=[];
    var mK=['Jan','Feb','Mar','Apr','May','Jun','Jul'];
    mK.forEach(function(m){var cm=CHANNEL_MONTHLY[m];var t2=0,a2=0;channels.forEach(function(ch){var d=cm&&cm[ch]?cm[ch]:{t:0,a:0};t2+=d.t||0;a2+=d.a||0;});tA.push(t2/1e6);aA.push(a2/1e6);});
    _kpiTrendChart=new Chart(ctx,{
      type:'bar',
      data:{labels:FC_MONTHS,datasets:[
        {label:'เป้า (M)',data:tA,backgroundColor:'rgba(99,102,241,0.15)',borderColor:'#6366f1',borderWidth:2,type:'line',tension:0.3,pointRadius:4},
        {label:'Actual (M)',data:aA,backgroundColor:aA.map(function(v,i){return v>=tA[i]?'#16a34a':'#f59e0b';})}
      ]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top'}},scales:{y:{beginAtZero:true,ticks:{callback:function(v){return v+'M';}}}}}
    });
  }
};

// ============================================================
// KPI Per Department
// ============================================================
window.renderKpiDept = function(){
  var sel=document.getElementById('kpiDeptSel');if(!sel)return;
  var dept=sel.value;
  var chMap={mt:'Modern Trade',amazon:'Amazon & Souvenir',booth:'Booth',online:'Online'};
  var ch=chMap[dept]||'Modern Trade';
  var months=['Jan','Feb','Mar','Apr','May','Jun','Jul'];
  var tS=0,aS=0;
  months.forEach(function(m){var cm=CHANNEL_MONTHLY[m];var d=cm&&cm[ch]?cm[ch]:{t:0,a:0};tS+=d.t||0;aS+=d.a||0;});
  var pct=tS?aS/tS*100:0,gp=aS*0.32;
  var cards=document.getElementById('kpiDeptCards');
  if(cards){
    var pc=pct>=80?'#16a34a':'#dc2626';
    cards.innerHTML=
      '<div class="kpi-card" style="border-top:3px solid #1d4ed8"><div class="kpi-label">ยอดขาย YTD</div><div class="kpi-value" style="color:#1d4ed8">'+(aS/1e6).toFixed(1)+'M</div></div>'+
      '<div class="kpi-card" style="border-top:3px solid '+pc+'"><div class="kpi-label">Achievement</div><div class="kpi-value" style="color:'+pc+'">'+pct.toFixed(1)+'%</div></div>'+
      '<div class="kpi-card" style="border-top:3px solid #7c3aed"><div class="kpi-label">GP (est.)</div><div class="kpi-value" style="color:#7c3aed">'+(gp/1e6).toFixed(1)+'M</div></div>'+
      '<div class="kpi-card" style="border-top:3px solid #ef4444"><div class="kpi-label">Growth YoY</div><div class="kpi-value" style="color:#ef4444">-8.5%</div></div>';
  }
  var title=document.getElementById('kpiDeptTitle');
  if(title)title.textContent='📊 KPI '+ch+' — รายเดือน';
  var tbl=document.getElementById('kpiDeptTable');
  if(tbl){
    var bg=['#fff','#f8fafc'];
    var rows=months.map(function(m,i){
      var cm=CHANNEL_MONTHLY[m];var d=cm&&cm[ch]?cm[ch]:{t:0,a:0};
      var p=d.t?d.a/d.t*100:0;var pc2=p>=80?'#16a34a':p>=60?'#b45309':'#dc2626';
      return '<tr style="background:'+bg[i%2]+'"><td style="padding:6px 12px;font-weight:600">'+FC_MONTHS[i]+'</td>'+
        '<td style="padding:6px 12px;text-align:right">'+((d.t||0)/1e6).toFixed(2)+'</td>'+
        '<td style="padding:6px 12px;text-align:right;font-weight:700">'+((d.a||0)/1e6).toFixed(2)+'</td>'+
        '<td style="padding:6px 12px;text-align:center"><span style="color:'+pc2+';font-weight:700">'+p.toFixed(1)+'%</span></td>'+
        '<td style="padding:6px 12px;text-align:right">'+((d.a||0)*0.32/1e6).toFixed(2)+'</td></tr>';
    });
    tbl.innerHTML='<table><thead><tr style="background:#1e293b;color:#fff"><th style="padding:8px 12px">เดือน</th><th style="padding:8px 12px;text-align:right">เป้า (M)</th><th style="padding:8px 12px;text-align:right">Actual (M)</th><th style="padding:8px 12px;text-align:center">%</th><th style="padding:8px 12px;text-align:right">GP (M)</th></tr></thead><tbody>'+rows.join('')+'</tbody></table>';
  }
};

// ============================================================
// Forecast / Revised
// ============================================================
window.renderKpiForecast = function(){
  var sel=document.getElementById('kpiFcSel');if(!sel)return;
  var chKey=sel.value;
  var chs=Object.keys(FORECAST_DATA);
  var tA,fA,rA,aA;
  if(chKey==='all'){
    tA=[0,0,0,0,0,0,0];fA=[0,0,0,0,0,0,0];rA=[0,0,0,0,0,0,0];aA=[0,0,0,0,0,0,0];
    chs.forEach(function(c){var d=FORECAST_DATA[c];for(var i=0;i<7;i++){tA[i]+=d.target[i];fA[i]+=d.forecast[i];rA[i]+=d.revised[i];aA[i]+=d.actual[i];}});
  } else {
    var dd=FORECAST_DATA[chKey]||FORECAST_DATA['Modern Trade'];
    tA=dd.target.slice();fA=dd.forecast.slice();rA=dd.revised.slice();aA=dd.actual.slice();
  }
  var totT=0,totF=0,totR=0,totA=0;
  for(var i=0;i<7;i++){totT+=tA[i];totF+=fA[i];totR+=rA[i];totA+=aA[i];}
  var gap=totA-totT;
  var fcC=document.getElementById('kpiFcCards');
  if(fcC){
    fcC.innerHTML=
      '<div class="kpi-card" style="border-top:3px solid #7c3aed"><div class="kpi-label">Forecast YTD</div><div class="kpi-value" style="color:#7c3aed">'+totF.toFixed(1)+'M</div></div>'+
      '<div class="kpi-card" style="border-top:3px solid #0ea5e9"><div class="kpi-label">Revised YTD</div><div class="kpi-value" style="color:#0ea5e9">'+totR.toFixed(1)+'M</div></div>'+
      '<div class="kpi-card" style="border-top:3px solid '+(gap>=0?'#16a34a':'#ef4444')+'"><div class="kpi-label">Gap (Actual-Target)</div><div class="kpi-value" style="color:'+(gap>=0?'#16a34a':'#ef4444')+'">'+(gap>=0?'+':'')+gap.toFixed(1)+'M</div></div>';
  }
  var tbl=document.getElementById('kpiFcTable');
  if(tbl){
    var bg=['#fff','#f8fafc'];
    var rows=FC_MONTHS.map(function(m,i){
      var p=tA[i]?aA[i]/tA[i]*100:0;var pc=p>=80?'#16a34a':p>=60?'#b45309':'#dc2626';
      return '<tr style="background:'+bg[i%2]+'"><td style="padding:6px 12px;font-weight:600">'+m+'</td>'+
        '<td style="padding:6px 12px;text-align:right">'+tA[i].toFixed(1)+'</td>'+
        '<td style="padding:6px 12px;text-align:right;color:#7c3aed">'+fA[i].toFixed(1)+'</td>'+
        '<td style="padding:6px 12px;text-align:right;color:#0ea5e9">'+rA[i].toFixed(1)+'</td>'+
        '<td style="padding:6px 12px;text-align:right;font-weight:700">'+(aA[i]>0?aA[i].toFixed(1):'-')+'</td>'+
        '<td style="padding:6px 12px;text-align:center"><span style="color:'+pc+';font-weight:700">'+(aA[i]>0?p.toFixed(1)+'%':'-')+'</span></td></tr>';
    });
    tbl.innerHTML='<table><thead><tr style="background:#1e293b;color:#fff"><th style="padding:8px 12px">เดือน</th><th style="padding:8px 12px;text-align:right">Target</th><th style="padding:8px 12px;text-align:right">Forecast</th><th style="padding:8px 12px;text-align:right">Revised</th><th style="padding:8px 12px;text-align:right">Actual</th><th style="padding:8px 12px;text-align:center">% vs Target</th></tr></thead><tbody>'+rows.join('')+'</tbody></table>';
  }
  var ctx=document.getElementById('kpiFcChart');
  if(ctx){
    if(_kpiFcChart)_kpiFcChart.destroy();
    _kpiFcChart=new Chart(ctx,{
      type:'line',
      data:{labels:FC_MONTHS,datasets:[
        {label:'Target',data:tA,borderColor:'#ef4444',borderWidth:2,tension:0.3,pointRadius:4,borderDash:[6,3]},
        {label:'Forecast',data:fA,borderColor:'#7c3aed',borderWidth:2,tension:0.3,pointRadius:4},
        {label:'Revised',data:rA,borderColor:'#0ea5e9',borderWidth:2,tension:0.3,pointRadius:4},
        {label:'Actual',data:aA.map(function(v){return v||null;}),borderColor:'#16a34a',borderWidth:3,tension:0.3,pointRadius:5,pointBackgroundColor:'#16a34a'}
      ]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top'}},scales:{y:{beginAtZero:true,ticks:{callback:function(v){return v+'M';}}}}}
    });
  }
  var mtD=document.getElementById('kpiFcMtDetail');
  if(mtD && (typeof MT_FORECAST!=='undefined' || typeof MT_REVISED!=='undefined')){
    var MO_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul'];
    var hasMTF=typeof MT_FORECAST!=='undefined';
    var hasMTR=typeof MT_REVISED!=='undefined';
    var bg2=['#fff','#f5f3ff'];

    var mtHtml='<div class="card"><div class="card-title">📦 Forecast vs Revised รายชิ้น — Modern Trade (จาก Excel สัปดาห์)</div>';
    mtHtml+='<div class="table-wrap" style="margin-top:12px"><table><thead><tr style="background:#4c1d95;color:#fff">';
    mtHtml+='<th style="padding:8px 12px">เดือน</th><th style="padding:8px 12px;text-align:right">FC (ชิ้น)</th><th style="padding:8px 12px;text-align:right">Revised (ชิ้น)</th>';
    mtHtml+='<th style="padding:8px 12px;text-align:right">ส่วนต่าง</th>';
    mtHtml+='<th style="padding:8px 12px;text-align:right">CJ (FC)</th><th style="padding:8px 12px;text-align:right">CJ (Rev)</th>';
    mtHtml+='<th style="padding:8px 12px;text-align:right">Big C (FC)</th><th style="padding:8px 12px;text-align:right">Big C (Rev)</th>';
    mtHtml+='</tr></thead><tbody>';
    var tFC=0,tRev=0;
    MO_EN.forEach(function(mo,i){
      var k='2026-'+mo;
      var fc=hasMTF&&MT_FORECAST[k]?MT_FORECAST[k]:null;
      var rv=hasMTR&&MT_REVISED[k]?MT_REVISED[k]:null;
      var fcT=fc?fc.totalFC:0;
      var rvT=rv?rv.totalRev:0;
      tFC+=fcT;tRev+=rvT;
      var diff=rvT-fcT;
      var diffColor=diff>=0?'#16a34a':'#ef4444';
      if(!fc&&!rv){mtHtml+='<tr style="background:'+bg2[i%2]+'"><td style="padding:6px 12px">'+FC_MONTHS[i]+'</td><td colspan="7" style="padding:6px 12px;text-align:center;color:#94a3b8">ไม่มีข้อมูล</td></tr>';return;}
      mtHtml+='<tr style="background:'+bg2[i%2]+'">';
      mtHtml+='<td style="padding:6px 12px;font-weight:600">'+FC_MONTHS[i]+'</td>';
      mtHtml+='<td style="padding:6px 12px;text-align:right;color:#7c3aed;font-weight:700">'+(fcT>0?fcT.toLocaleString():'-')+'</td>';
      mtHtml+='<td style="padding:6px 12px;text-align:right;color:#0ea5e9;font-weight:700">'+(rvT>0?rvT.toLocaleString():'-')+'</td>';
      mtHtml+='<td style="padding:6px 12px;text-align:right;color:'+diffColor+';font-weight:600;font-size:11px">'+(fcT>0||rvT>0?(diff>=0?'+':'')+diff.toLocaleString():'-')+'</td>';
      var cjFc=fc&&fc.ch.CJ?fc.ch.CJ.fc:0;
      var cjRv=rv&&rv.ch.CJ?rv.ch.CJ.rev:0;
      var bcFc=fc&&fc.ch.BigC?fc.ch.BigC.fc:0;
      var bcRv=rv&&rv.ch.BigC?rv.ch.BigC.rev:0;
      mtHtml+='<td style="padding:6px 12px;text-align:right;font-size:11px">'+(cjFc>0?cjFc.toLocaleString():'-')+'</td>';
      mtHtml+='<td style="padding:6px 12px;text-align:right;font-size:11px">'+(cjRv>0?cjRv.toLocaleString():'-')+'</td>';
      mtHtml+='<td style="padding:6px 12px;text-align:right;font-size:11px">'+(bcFc>0?bcFc.toLocaleString():'-')+'</td>';
      mtHtml+='<td style="padding:6px 12px;text-align:right;font-size:11px">'+(bcRv>0?bcRv.toLocaleString():'-')+'</td>';
      mtHtml+='</tr>';
    });
    var totalDiff=tRev-tFC;
    mtHtml+='<tr style="background:#ede9fe;font-weight:700"><td style="padding:8px 12px">รวม YTD</td>';
    mtHtml+='<td style="padding:8px 12px;text-align:right;color:#7c3aed">'+tFC.toLocaleString()+'</td>';
    mtHtml+='<td style="padding:8px 12px;text-align:right;color:#0ea5e9">'+tRev.toLocaleString()+'</td>';
    mtHtml+='<td style="padding:8px 12px;text-align:right;color:'+(totalDiff>=0?'#16a34a':'#ef4444')+'">'+(totalDiff>=0?'+':'')+totalDiff.toLocaleString()+'</td>';
    mtHtml+='<td colspan="4" style="padding:8px 12px;text-align:center;font-size:11px;color:#6b21a8">'+(tFC>0?'Rev/FC: '+(tRev/tFC*100).toFixed(1)+'%':'')+'</td></tr>';
    mtHtml+='</tbody></table></div></div>';

    if(typeof MT_FORECAST_WEEKLY!=='undefined'){
      var wks=MT_FORECAST_WEEKLY.filter(function(w){return w.fc>0||w.act>0;});
      if(wks.length>0){
        mtHtml+='<div class="card" style="margin-top:12px"><div class="card-title">📅 Forecast รายสัปดาห์ 2026</div>';
        mtHtml+='<div class="table-wrap" style="margin-top:12px;max-height:300px;overflow-y:auto"><table><thead><tr style="background:#4c1d95;color:#fff;position:sticky;top:0">';
        mtHtml+='<th style="padding:6px 10px">เดือน</th><th style="padding:6px 10px">สัปดาห์</th><th style="padding:6px 10px">ช่วง</th>';
        mtHtml+='<th style="padding:6px 10px;text-align:right">FC (ชิ้น)</th><th style="padding:6px 10px;text-align:right">Actual</th>';
        mtHtml+='<th style="padding:6px 10px;text-align:center">%</th></tr></thead><tbody>';
        wks.forEach(function(w,wi){
          var p=w.fc?(w.act/w.fc*100):0;
          var pc=p>=80?'#16a34a':p>=50?'#b45309':'#94a3b8';
          mtHtml+='<tr style="background:'+bg2[wi%2]+'">';
          mtHtml+='<td style="padding:5px 10px;font-size:12px">'+FC_MONTHS[w.mi]+'</td>';
          mtHtml+='<td style="padding:5px 10px;font-size:12px">'+w.week+'</td>';
          mtHtml+='<td style="padding:5px 10px;font-size:11px;color:#64748b">'+w.info+'</td>';
          mtHtml+='<td style="padding:5px 10px;text-align:right;font-size:12px;color:#7c3aed;font-weight:600">'+w.fc.toLocaleString()+'</td>';
          mtHtml+='<td style="padding:5px 10px;text-align:right;font-size:12px">'+(w.act>0?w.act.toLocaleString():'-')+'</td>';
          mtHtml+='<td style="padding:5px 10px;text-align:center;font-size:11px;color:'+pc+'">'+(w.act>0?p.toFixed(0)+'%':'-')+'</td></tr>';
        });
        mtHtml+='</tbody></table></div></div>';
      }
    }
    if(typeof MT_REVISED_WEEKLY!=='undefined'){
      var rwks=MT_REVISED_WEEKLY.filter(function(w){return w.rev>0||w.act>0;});
      if(rwks.length>0){
        mtHtml+='<div class="card" style="margin-top:12px"><div class="card-title">📝 Revised รายสัปดาห์ 2026</div>';
        mtHtml+='<div class="table-wrap" style="margin-top:12px;max-height:300px;overflow-y:auto"><table><thead><tr style="background:#0c4a6e;color:#fff;position:sticky;top:0">';
        mtHtml+='<th style="padding:6px 10px">เดือน</th><th style="padding:6px 10px">สัปดาห์</th><th style="padding:6px 10px">ช่วง</th>';
        mtHtml+='<th style="padding:6px 10px;text-align:right">Revised (ชิ้น)</th><th style="padding:6px 10px;text-align:right">Actual</th>';
        mtHtml+='<th style="padding:6px 10px;text-align:center">%</th></tr></thead><tbody>';
        var bg3=['#fff','#f0f9ff'];
        rwks.forEach(function(w,wi){
          var p=w.rev?(w.act/w.rev*100):0;
          var pc=p>=80?'#16a34a':p>=50?'#b45309':'#94a3b8';
          mtHtml+='<tr style="background:'+bg3[wi%2]+'">';
          mtHtml+='<td style="padding:5px 10px;font-size:12px">'+FC_MONTHS[w.mi]+'</td>';
          mtHtml+='<td style="padding:5px 10px;font-size:12px">'+w.week+'</td>';
          mtHtml+='<td style="padding:5px 10px;font-size:11px;color:#64748b">'+w.info+'</td>';
          mtHtml+='<td style="padding:5px 10px;text-align:right;font-size:12px;color:#0ea5e9;font-weight:600">'+w.rev.toLocaleString()+'</td>';
          mtHtml+='<td style="padding:5px 10px;text-align:right;font-size:12px">'+(w.act>0?w.act.toLocaleString():'-')+'</td>';
          mtHtml+='<td style="padding:5px 10px;text-align:center;font-size:11px;color:'+pc+'">'+(w.act>0?p.toFixed(0)+'%':'-')+'</td></tr>';
        });
        mtHtml+='</tbody></table></div></div>';
      }
    }
    mtD.innerHTML=mtHtml;
  }
};

// ============================================================
// CRM Overview
// ============================================================
window.renderCrmOverview = function(){
  var allCust=0,activeCust=0,inactiveCust=0,totalSales=0;
  var allAct=[];
  Object.keys(CRM_DATA).forEach(function(k){
    var cd=CRM_DATA[k];
    cd.customers.forEach(function(c){allCust++;if(c.status==='active')activeCust++;else inactiveCust++;totalSales+=c.totalSales;});
    cd.activities.forEach(function(a){a._channel=cd.label;allAct.push(a);});
  });
  var pipeline={prospect:12,interested:8,negotiation:5,closed:3};
  var cards=document.getElementById('crmOverviewCards');
  if(cards){
    cards.innerHTML=
      '<div class="kpi-card" style="border-top:3px solid #1d4ed8"><div class="kpi-label">ลูกค้าทั้งหมด</div><div class="kpi-value" style="color:#1d4ed8">'+allCust+'</div></div>'+
      '<div class="kpi-card" style="border-top:3px solid #16a34a"><div class="kpi-label">Active</div><div class="kpi-value" style="color:#16a34a">'+activeCust+'</div></div>'+
      '<div class="kpi-card" style="border-top:3px solid #dc2626"><div class="kpi-label">Inactive</div><div class="kpi-value" style="color:#dc2626">'+inactiveCust+'</div></div>'+
      '<div class="kpi-card" style="border-top:3px solid #7c3aed"><div class="kpi-label">ยอดขายรวม</div><div class="kpi-value" style="color:#7c3aed">'+(totalSales/1e6).toFixed(1)+'M</div></div>';
  }
  var pipe=document.getElementById('crmPipeline');
  if(pipe){
    var stages=[
      {label:'Prospect',count:pipeline.prospect,color:'#94a3b8',bg:'#f1f5f9'},
      {label:'สนใจ',count:pipeline.interested,color:'#0ea5e9',bg:'#e0f2fe'},
      {label:'เจรจา',count:pipeline.negotiation,color:'#f59e0b',bg:'#fef3c7'},
      {label:'ปิดการขาย',count:pipeline.closed,color:'#16a34a',bg:'#dcfce7'}
    ];
    pipe.innerHTML='<div style="display:flex;gap:8px;flex-wrap:wrap">'+stages.map(function(s){
      return '<div style="flex:1;min-width:120px;background:'+s.bg+';border-radius:10px;padding:16px;text-align:center">'+
        '<div style="font-size:28px;font-weight:800;color:'+s.color+'">'+s.count+'</div>'+
        '<div style="font-size:12px;font-weight:600;color:'+s.color+';margin-top:4px">'+s.label+'</div></div>';
    }).join('')+'</div>';
  }
  allAct.sort(function(a,b){return b.date.localeCompare(a.date);});
  var log=document.getElementById('crmActivityLog');
  if(log){
    var ti={visit:'🚗',order:'📦',call:'📞',meeting:'🤝'};
    log.innerHTML=allAct.slice(0,10).map(function(a){
      return '<div style="display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #f1f5f9">'+
        '<div style="font-size:20px">'+(ti[a.type]||'📝')+'</div>'+
        '<div style="flex:1"><div style="font-size:13px;font-weight:600">'+a.customer+' <span style="font-weight:400;color:#64748b">('+a._channel+')</span></div>'+
        '<div style="font-size:12px;color:#475569;margin-top:2px">'+a.note+'</div>'+
        '<div style="font-size:11px;color:#94a3b8;margin-top:2px">'+a.date+' · '+a.staff+'</div></div></div>';
    }).join('');
  }
};

// ============================================================
// CRM Per-Channel
// ============================================================
window.renderCrmChannel = function(chKey){
  var cd=CRM_DATA[chKey];if(!cd)return;
  var idMap={mt:'crmMtContent',amazon:'crmAmazonContent',booth:'crmBoothContent',online:'crmOnlineContent',telesales:'crmTelesalesContent'};
  var el=document.getElementById(idMap[chKey]);if(!el)return;
  var active=cd.customers.filter(function(c){return c.status==='active';}).length;
  var inactive=cd.customers.filter(function(c){return c.status!=='active';}).length;
  var tot=0;cd.customers.forEach(function(c){tot+=c.totalSales;});
  var h='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:16px">'+
    '<div class="kpi-card" style="border-top:3px solid #1d4ed8"><div class="kpi-label">Active</div><div class="kpi-value" style="color:#1d4ed8">'+active+'</div></div>'+
    '<div class="kpi-card" style="border-top:3px solid #dc2626"><div class="kpi-label">Inactive</div><div class="kpi-value" style="color:#dc2626">'+inactive+'</div></div>'+
    '<div class="kpi-card" style="border-top:3px solid #7c3aed"><div class="kpi-label">ยอดขายรวม</div><div class="kpi-value" style="color:#7c3aed">'+(tot/1e6).toFixed(1)+'M</div></div></div>';
  var bg=['#fff','#f8fafc'];
  var rows=cd.customers.map(function(c,i){
    var sc=c.status==='active'?'#16a34a':c.status==='prospect'?'#0ea5e9':'#dc2626';
    var sb=c.status==='active'?'#dcfce7':c.status==='prospect'?'#e0f2fe':'#fee2e2';
    var sl=c.status==='active'?'Active':c.status==='prospect'?'Prospect':'Inactive';
    return '<tr style="background:'+bg[i%2]+'">'+
      '<td style="padding:6px 12px;font-size:12px;font-weight:600">'+c.name+'</td>'+
      '<td style="padding:6px 12px;text-align:center"><span style="background:'+sb+';color:'+sc+';padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600">'+sl+'</span></td>'+
      '<td style="padding:6px 12px;font-size:12px;text-align:right">'+c.totalOrders+'</td>'+
      '<td style="padding:6px 12px;font-size:12px;text-align:right">'+c.totalSales.toLocaleString()+'</td>'+
      '<td style="padding:6px 12px;font-size:12px">'+c.lastOrder+'</td>'+
      '<td style="padding:6px 12px;font-size:12px">'+c.contact+'</td>'+
      '<td style="padding:6px 12px;font-size:12px">'+c.nextVisit+'</td></tr>';
  });
  h+='<div class="card"><div class="card-title">👥 รายชื่อลูกค้า — '+cd.label+'</div>'+
    '<div class="table-wrap" style="margin-top:12px"><table><thead><tr style="background:#1e293b;color:#fff">'+
    '<th style="padding:8px 12px">ลูกค้า</th><th style="padding:8px 12px;text-align:center">สถานะ</th>'+
    '<th style="padding:8px 12px;text-align:right">Orders</th><th style="padding:8px 12px;text-align:right">ยอดขาย</th>'+
    '<th style="padding:8px 12px">Last Order</th><th style="padding:8px 12px">ผู้ดูแล</th><th style="padding:8px 12px">Next Visit</th>'+
    '</tr></thead><tbody>'+rows.join('')+'</tbody></table></div></div>';
  var ti={visit:'🚗',order:'📦',call:'📞',meeting:'🤝'};
  h+='<div class="card" style="margin-top:16px"><div class="card-title">📅 กิจกรรมล่าสุด</div><div style="margin-top:12px">';
  cd.activities.forEach(function(a){
    h+='<div style="display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #f1f5f9">'+
      '<div style="font-size:20px">'+(ti[a.type]||'📝')+'</div>'+
      '<div style="flex:1"><div style="font-size:13px;font-weight:600">'+a.customer+'</div>'+
      '<div style="font-size:12px;color:#475569;margin-top:2px">'+a.note+'</div>'+
      '<div style="font-size:11px;color:#94a3b8;margin-top:2px">'+a.date+' · '+a.staff+'</div></div></div>';
  });
  h+='</div></div>';
  el.innerHTML=h;
};

// ============================================================
// Booth Contract Alerts
// ============================================================
function getBoothContractAlerts(){
  var today=new Date();
  var alerts=[];
  BOOTH_CONTRACTS.forEach(function(c){
    var end=new Date(c.end);
    var diff=Math.ceil((end-today)/(1000*60*60*24));
    if(diff<=90&&diff>0){
      alerts.push({booth:c.booth,daysLeft:diff,endDate:c.end,rent:c.rent,urgency:diff<=30?'urgent':'warning'});
    } else if(diff<=0&&diff>-30){
      alerts.push({booth:c.booth,daysLeft:diff,endDate:c.end,rent:c.rent,urgency:'expired'});
    }
  });
  alerts.sort(function(a,b){return a.daysLeft-b.daysLeft;});
  return alerts;
}

window.getBoothContractAlerts = getBoothContractAlerts;

function injectBoothAlerts(){
  var alerts=getBoothContractAlerts();
  if(alerts.length===0)return;
  var bellCount=document.getElementById('tbBellCount');
  var bellMenu=document.getElementById('tbBellMenu');
  if(!bellCount||!bellMenu)return;
  var cur=parseInt(bellCount.textContent)||0;
  bellCount.textContent=cur+alerts.length;
  if(cur+alerts.length>0)bellCount.style.display='';
  var html='<div style="padding:8px 12px;font-weight:700;font-size:12px;color:#b45309;border-top:1px solid #f1f5f9;margin-top:4px">📋 สัญญาบูธใกล้หมด</div>';
  alerts.forEach(function(a){
    var icon=a.urgency==='expired'?'🔴':a.urgency==='urgent'?'🟠':'🟡';
    var label=a.daysLeft<=0?'หมดแล้ว '+Math.abs(a.daysLeft)+' วัน':'เหลือ '+a.daysLeft+' วัน';
    html+='<div style="padding:6px 12px;font-size:11px;border-bottom:1px solid #f8fafc;cursor:pointer" onclick="shellNavClick(document.querySelector(\'[data-tab=booth]\'),\'booth\')">'+
      icon+' <b>'+a.booth+'</b> — '+label+' (หมด '+a.endDate+')</div>';
  });
  bellMenu.innerHTML+=html;
}

// ============================================================
// Hook into showTab for auto-render + hide filter bar
// ============================================================
function resetSubTabs(tabId, defaultSubId) {
  var tab = document.getElementById(tabId);
  if (!tab) return;
  tab.querySelectorAll('.sub-tab').forEach(function(t, i) {
    if (i === 0) t.classList.add('active'); else t.classList.remove('active');
  });
  tab.querySelectorAll('.sub-section').forEach(function(s) {
    if (s.id === defaultSubId) { s.classList.add('active'); s.style.display = ''; }
    else { s.classList.remove('active'); s.style.display = 'none'; }
  });
}

var _origShowTab2 = window.showTab;
window.showTab = function(el, name){
  if(_origShowTab2) _origShowTab2(el, name);
  if(name==='kpi') { resetSubTabs('tab-kpi','kpi-overview'); renderKpiOverview(); }
  if(name==='crm') { resetSubTabs('tab-crm','crm-overview'); renderCrmOverview(); }
  var gfb=document.getElementById('globalFilterBar');
  if(gfb){
    var filterRow=gfb.closest('.tb-row-filter')||gfb;
    if(name==='kpi'||name==='crm') filterRow.style.display='none';
  }
};

// Init: inject booth alerts on page load
setTimeout(function(){try{injectBoothAlerts();}catch(e){}},600);

})();
