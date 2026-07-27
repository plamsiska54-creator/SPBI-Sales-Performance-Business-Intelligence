/* =====================================================
   CJ Compensate (ค่าโปรโมชั่น CJ) — data + render
   ===================================================== */

var CJ_COMP = {
  months: ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.'],
  promos: [
    {key:'lineOA',   name:'Line OA 3 บาท',              day:'ศ ส อา',  discount:5,  cjPay:2, wePay:3, color:'#3b82f6'},
    {key:'bread',    name:'ขนมปังชนิดแผ่นลด 2 บาท',     day:'ทุกวัน',  discount:2,  cjPay:0, wePay:2, color:'#f59e0b'},
    {key:'newStore', name:'โปร14วันสาขาใหม่ 4 บาท',     day:'ทุกวัน',  discount:10, cjPay:6, wePay:4, color:'#10b981'},
    {key:'weekend',  name:'ศ ส อา 4 บาท',               day:'ศ ส อา',  discount:10, cjPay:6, wePay:4, color:'#ef4444'},
    {key:'tuesday',  name:'อังคารลดจุก 3 บาท',           day:'อังคาร',  discount:5,  cjPay:2, wePay:3, color:'#8b5cf6'}
  ],
  thb: {
    lineOA:   [0,141,267,153,141,210],
    bread:    [15460,0,0,0,0,0],
    newStore: [15360,0,0,0,0,0],
    weekend:  [1138548,1110592,1159604,1180631,1297441,1008096],
    tuesday:  [158301,224190,218337,216501,193205,234090],
    total:    [1327669,1334923,1378208,1397285,1490787,1242396],
    salesEA:  [1306468,1309376,1514173,1426980,1374891,1178826],
    salesTHB: [24755356,25401307,29607294,27708934,26966363,23597778],
    pctToSale:[5.36,5.26,4.65,5.04,5.53,5.26]
  },
  ea: {
    lineOA:   [0,47,89,51,47,70],
    bread:    [7730,0,0,0,0,0],
    newStore: [3840,0,0,0,0,0],
    weekend:  [284637,277648,289901,295158,324360,252024],
    tuesday:  [52767,74730,72779,72167,64402,78030],
    total:    [348974,352425,362769,367376,388809,330124],
    salesEA:  [1306468,1309376,1514173,1426980,1374891,1178826],
    salesTHB: [24755356,25401307,29607294,27708934,26966363,23597778],
    pctToSale:[26.71,26.92,23.96,25.75,28.28,28.00]
  },
  grandTotal: {
    thb: {total:8171268,  salesEA:8110714, salesTHB:158037032, pct:5.17},
    ea:  {total:2150477,  salesEA:8110714, salesTHB:158037032, pct:26.51}
  }
};

var _cjCompState = { mode: 'thb', chart: null, rendered: false };

/* ---------- helpers ---------- */
function _cjFmt(n){
  if(n==null) return '-';
  return n.toLocaleString('en-US');
}
function _cjPct(n){
  if(n==null) return '-';
  return n.toFixed(2)+'%';
}

/* ---------- main entry ---------- */
function renderCjCompensate(){
  if(_cjCompState.rendered) return;
  _cjCompState.rendered = true;
  _cjCompRenderKPI();
  _cjCompRenderPromoDetails();
  _cjCompRenderChart();
  _cjCompRenderTable();
}

/* ---------- toggle THB / EA ---------- */
function cjCompSetMode(mode){
  _cjCompState.mode = mode;
  // toggle button styles
  document.getElementById('cjToggleTHB').classList.toggle('active', mode==='thb');
  document.getElementById('cjToggleEA').classList.toggle('active',  mode==='ea');
  _cjCompRenderKPI();
  _cjCompRenderChart();
  _cjCompRenderTable();
}

/* ---------- KPI cards ---------- */
function _cjCompRenderKPI(){
  var m = _cjCompState.mode;
  var g = CJ_COMP.grandTotal[m];
  var unit = m==='thb' ? '฿' : '';
  var suffix = m==='thb' ? '' : ' ชิ้น';
  var cards = [
    {label:'ค่าโปร '+(m==='thb'?'THB':'ชิ้น')+' รวม', value: (m==='thb'?'฿':'')+_cjFmt(g.total)+(m==='ea'?' ชิ้น':''), accent:'#3b82f6', icon:'💰'},
    {label:'ยอดขาย EA รวม', value:_cjFmt(g.salesEA)+' ชิ้น', accent:'#10b981', icon:'📦'},
    {label:'ยอดขาย THB รวม', value:'฿'+_cjFmt(g.salesTHB), accent:'#f59e0b', icon:'💵'},
    {label:'%To Sale', value:_cjPct(g.pct), accent:'#8b5cf6', icon:'📊'}
  ];
  var el = document.getElementById('cjCompKPI');
  el.innerHTML = cards.map(function(c){
    return '<div class="card" style="padding:16px 18px;border-left:4px solid '+c.accent+'">'
      +'<div style="font-size:12px;color:#64748b;font-weight:600">'+c.icon+' '+c.label+'</div>'
      +'<div style="font-size:22px;font-weight:800;color:'+c.accent+';margin-top:4px">'+c.value+'</div>'
      +'</div>';
  }).join('');
}

/* ---------- promotion details table ---------- */
function _cjCompRenderPromoDetails(){
  var body = document.getElementById('cjPromoDetailBody');
  body.innerHTML = CJ_COMP.promos.map(function(p,i){
    return '<tr style="border-left:4px solid '+p.color+'">'
      +'<td>'+(i+1)+'</td>'
      +'<td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+p.color+';margin-right:6px"></span>'+p.name+'</td>'
      +'<td>'+p.day+'</td>'
      +'<td style="text-align:right">'+p.discount+' ฿</td>'
      +'<td style="text-align:right">'+p.cjPay+' ฿</td>'
      +'<td style="text-align:right">'+p.wePay+' ฿</td>'
      +'</tr>';
  }).join('');
}

/* ---------- Chart.js stacked bar + line ---------- */
function _cjCompRenderChart(){
  var m = _cjCompState.mode;
  var d = CJ_COMP[m];
  var datasets = CJ_COMP.promos.map(function(p){
    return {
      label: p.name,
      data: d[p.key],
      backgroundColor: p.color,
      borderRadius: 4,
      stack: 'stack1',
      yAxisID: 'y',
      order: 2
    };
  });
  // line overlay: %ToSale
  datasets.push({
    label: '%ToSale',
    data: d.pctToSale,
    type: 'line',
    borderColor: '#f97316',
    backgroundColor: 'rgba(249,115,22,.15)',
    borderWidth: 2.5,
    pointRadius: 4,
    pointBackgroundColor: '#f97316',
    fill: false,
    yAxisID: 'y1',
    order: 1
  });

  if(_cjCompState.chart){
    _cjCompState.chart.destroy();
  }
  var ctx = document.getElementById('cjCompChart').getContext('2d');
  _cjCompState.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: CJ_COMP.months,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode:'index', intersect:false },
      plugins: {
        legend: { position:'bottom', labels:{boxWidth:12, font:{size:11}} },
        tooltip: {
          callbacks: {
            label: function(ctx){
              if(ctx.dataset.yAxisID==='y1') return ctx.dataset.label+': '+ctx.parsed.y.toFixed(2)+'%';
              return ctx.dataset.label+': '+ctx.parsed.y.toLocaleString('en-US');
            }
          }
        }
      },
      scales: {
        x: { stacked:true, grid:{display:false} },
        y: {
          stacked: true,
          position: 'left',
          ticks: {
            callback: function(v){ return v>=1000000?(v/1000000).toFixed(1)+'M':v>=1000?(v/1000).toFixed(0)+'K':v; }
          },
          title: { display:true, text: m==='thb'?'บาท':'ชิ้น', font:{size:11} }
        },
        y1: {
          position: 'right',
          grid: { drawOnChartArea:false },
          ticks: { callback: function(v){ return v+'%'; } },
          title: { display:true, text:'%ToSale', font:{size:11} }
        }
      }
    }
  });
}

/* ---------- monthly summary table ---------- */
function _cjCompRenderTable(){
  var m = _cjCompState.mode;
  var d = CJ_COMP[m];
  var titleEl = document.getElementById('cjTableTitle');
  titleEl.textContent = m==='thb' ? '📅 สรุปรายเดือน (THB)' : '📅 สรุปรายเดือน (Pieces)';

  var keys = ['lineOA','bread','newStore','weekend','tuesday'];
  var rows = '';
  for(var i=0; i<6; i++){
    rows += '<tr>'
      +'<td>'+CJ_COMP.months[i]+'</td>'
      +'<td style="text-align:right">'+_cjFmt(d.lineOA[i])+'</td>'
      +'<td style="text-align:right">'+_cjFmt(d.bread[i])+'</td>'
      +'<td style="text-align:right">'+_cjFmt(d.newStore[i])+'</td>'
      +'<td style="text-align:right">'+_cjFmt(d.weekend[i])+'</td>'
      +'<td style="text-align:right">'+_cjFmt(d.tuesday[i])+'</td>'
      +'<td style="text-align:right;font-weight:800">'+_cjFmt(d.total[i])+'</td>'
      +'<td style="text-align:right">'+_cjFmt(d.salesEA[i])+'</td>'
      +'<td style="text-align:right">'+_cjFmt(d.salesTHB[i])+'</td>'
      +'<td style="text-align:right;color:#f97316;font-weight:700">'+_cjPct(d.pctToSale[i])+'</td>'
      +'</tr>';
  }

  // Total row
  var gt = CJ_COMP.grandTotal[m];
  var totLineOA=0, totBread=0, totNew=0, totWknd=0, totTue=0;
  for(var j=0;j<6;j++){
    totLineOA += d.lineOA[j];
    totBread  += d.bread[j];
    totNew    += d.newStore[j];
    totWknd   += d.weekend[j];
    totTue    += d.tuesday[j];
  }
  rows += '<tr style="background:#fef3c7;font-weight:800">'
    +'<td>รวม</td>'
    +'<td style="text-align:right">'+_cjFmt(totLineOA)+'</td>'
    +'<td style="text-align:right">'+_cjFmt(totBread)+'</td>'
    +'<td style="text-align:right">'+_cjFmt(totNew)+'</td>'
    +'<td style="text-align:right">'+_cjFmt(totWknd)+'</td>'
    +'<td style="text-align:right">'+_cjFmt(totTue)+'</td>'
    +'<td style="text-align:right">'+_cjFmt(gt.total)+'</td>'
    +'<td style="text-align:right">'+_cjFmt(gt.salesEA)+'</td>'
    +'<td style="text-align:right">'+_cjFmt(gt.salesTHB)+'</td>'
    +'<td style="text-align:right;color:#f97316">'+_cjPct(gt.pct)+'</td>'
    +'</tr>';

  document.getElementById('cjMonthlySummary').innerHTML = rows;
}
