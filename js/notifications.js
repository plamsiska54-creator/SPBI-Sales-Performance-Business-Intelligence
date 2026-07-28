// ============================================================
// NOTIFICATIONS.JS — ระบบแจ้งเตือนรวมทุกจุด + วิเคราะห์ AI
// ============================================================
(function(){
'use strict';

var _alertCache = [];

function _today(){ return new Date().toISOString().slice(0,10); }
function _daysLeft(iso){
  var d = new Date(iso); var now = new Date(); now.setHours(0,0,0,0); d.setHours(0,0,0,0);
  return Math.round((d-now)/(1000*60*60*24));
}
function _monthName(m){
  return ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'][m];
}
function _fmtM(n){ return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(0)+'K':n.toString(); }

function collectAlerts(){
  var alerts = [];

  // ─── 1. ยอดขายต่ำกว่าเป้า (ภาพรวม) ───
  try {
    if(typeof getChannelData==='function' && typeof CH_NAMES!=='undefined'){
      var chData = getChannelData(typeof currentMonth!=='undefined'?currentMonth:null);
      CH_NAMES.forEach(function(ch){
        var d = chData[ch]||{};
        if(d.t>0 && d.a<d.t){
          var gap = d.t-d.a;
          var pct = Math.round((1-d.a/d.t)*100);
          alerts.push({cat:'sales',icon:'📉',severity:pct>30?'critical':'warning',
            title:ch+' ขาดเป้า '+pct+'%',
            detail:'เป้า '+_fmtM(d.t)+' | จริง '+_fmtM(d.a)+' | ขาด '+_fmtM(gap),
            tab:'overview'});
        }
      });
    }
  } catch(e){}

  // ─── 2. สัญญาบูธใกล้หมด ───
  try {
    if(typeof getBoothContractAlerts==='function'){
      var ba = getBoothContractAlerts();
      ba.forEach(function(a){
        var icon = a.urgency==='expired'?'🔴':a.urgency==='urgent'?'🟠':'🟡';
        alerts.push({cat:'booth',icon:icon,severity:a.urgency==='expired'?'critical':'warning',
          title:'บูธ '+a.booth,
          detail:a.daysLeft<=0?'หมดแล้ว '+Math.abs(a.daysLeft)+' วัน':'เหลือ '+a.daysLeft+' วัน (หมด '+a.endDate+')',
          tab:'booth'});
      });
    }
  } catch(e){}

  // ─── 3. ของคืน-ของเสียเกินเกณฑ์ (บูธ) ───
  try {
    if(typeof BOOTH_RETURN_DATA!=='undefined'){
      Object.keys(BOOTH_RETURN_DATA).forEach(function(b){
        Object.keys(BOOTH_RETURN_DATA[b]).forEach(function(y){
          Object.keys(BOOTH_RETURN_DATA[b][y]).forEach(function(m){
            var d = BOOTH_RETURN_DATA[b][y][m];
            if(d && d.tot_q>=60){
              alerts.push({cat:'booth-return',icon:'📦',severity:'warning',
                title:'ของคืน '+b+' เกิน 60 ชิ้น',
                detail:m+'/'+y+' — '+d.tot_q+' ชิ้น',
                tab:'booth'});
            }
          });
        });
      });
    }
  } catch(e){}

  // ─── 4. สินค้าเสี่ยงถอด (Delist) ───
  try {
    if(typeof DELIST_DATA!=='undefined' && Array.isArray(DELIST_DATA)){
      var delistCount = DELIST_DATA.filter(function(d){return d.risk==='สูง'||d.risk==='high';}).length;
      if(delistCount>0){
        alerts.push({cat:'delist',icon:'⚠️',severity:'warning',
          title:'สินค้าเสี่ยงถอด '+delistCount+' รายการ',
          detail:'มีสินค้าที่ความเสี่ยงระดับสูงถูกถอดออกจากชั้นวาง',
          tab:'sales-marketing'});
      }
    }
  } catch(e){}

  // ─── 5. คุณภาพสินค้า — ปัญหาที่ยังไม่ปิด ───
  try {
    if(typeof QA_DATA!=='undefined' && Array.isArray(QA_DATA)){
      var openQA = QA_DATA.filter(function(q){return q.status!=='closed'&&q.status!=='ปิดแล้ว';});
      if(openQA.length>0){
        var critical = openQA.filter(function(q){return q.severity==='critical'||q.severity==='วิกฤต';}).length;
        alerts.push({cat:'quality',icon:'🔬',severity:critical>0?'critical':'info',
          title:'ปัญหาคุณภาพค้าง '+openQA.length+' รายการ',
          detail:critical>0?'วิกฤต '+critical+' รายการ ต้องดำเนินการด่วน':'รอดำเนินการแก้ไข/ป้องกัน',
          tab:'quality'});
      }
    }
  } catch(e){}

  // ─── 6. ธุรการขาย — วันโทรตามออเดอร์ ───
  try {
    var thDays = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
    var todayDay = thDays[new Date().getDay()];
    if(typeof window.ORD_CHECKLIST_ROUTES!=='undefined'){
      var todayRoutes = window.ORD_CHECKLIST_ROUTES.filter(function(r){
        return r.orderDay && r.orderDay.indexOf(todayDay)>=0;
      });
      if(todayRoutes.length>0){
        alerts.push({cat:'ordering',icon:'📞',severity:'info',
          title:'วันนี้ต้องโทรตาม '+todayRoutes.length+' เส้นทาง',
          detail:todayRoutes.map(function(r){return r.route;}).slice(0,5).join(', ')+(todayRoutes.length>5?' ...':''),
          tab:'ordering'});
      }
    }
  } catch(e){}

  // ─── 7. การโทรลูกค้า — ผลลัพธ์ต้องติดตาม ───
  try {
    var callData = window.CALL_LOG_DATA||[];
    if(callData.length>0){
      var followUps = callData.filter(function(c){
        return c.result==='รอการตัดสินใจ'||c.result==='ขอให้โทรกลับ'||c.result==='ฝากข้อความ'||c.result==='ลูกค้าสนใจ';
      });
      if(followUps.length>0){
        alerts.push({cat:'calls',icon:'🔄',severity:'info',
          title:'ลูกค้ารอติดตาม '+followUps.length+' ราย',
          detail:'ผลโทร: รอตัดสินใจ/สนใจ/ฝากข้อความ — ต้องโทรกลับ',
          tab:'ordering'});
      }
      var noAnswer = callData.filter(function(c){return c.result==='ไม่รับสาย'||c.result==='สายไม่ว่าง'||c.result==='ปิดเครื่อง';});
      if(noAnswer.length>0){
        alerts.push({cat:'calls-miss',icon:'📵',severity:'info',
          title:'โทรไม่ติด '+noAnswer.length+' ราย',
          detail:'ไม่รับสาย/สายไม่ว่าง/ปิดเครื่อง — รอโทรซ้ำ',
          tab:'ordering'});
      }
    }
  } catch(e){}

  // ─── 8. AI วิเคราะห์ — แนวโน้มยอดขาย ───
  try {
    if(typeof getChannelData==='function' && typeof CH_NAMES!=='undefined'){
      var chAll = getChannelData(null);
      CH_NAMES.forEach(function(ch){
        var d = chAll[ch]||{};
        if(d.t>0 && d.a>0){
          var achievePct = Math.round(d.a/d.t*100);
          var now = new Date();
          var monthsPassed = now.getMonth()+1;
          var projectedYear = monthsPassed>0 ? Math.round((d.a/monthsPassed)*12) : 0;
          var yearTarget = d.t*2;
          if(projectedYear>0 && yearTarget>0){
            var projPct = Math.round(projectedYear/yearTarget*100);
            if(projPct<70){
              alerts.push({cat:'ai-trend',icon:'🤖',severity:'critical',
                title:'AI: '+ch+' เสี่ยงไม่ถึงเป้าปี',
                detail:'คาดการณ์ทั้งปี ~'+_fmtM(projectedYear)+' ('+projPct+'% ของเป้า) — ต้องเร่งยอด',
                tab:'overview'});
            }
          }
        }
      });
    }
  } catch(e){}

  // ─── 9. AI วิเคราะห์ — Conversion การโทรต่ำ ───
  try {
    var cData = window.CALL_LOG_DATA||[];
    if(cData.length>=5){
      var totalCalls = cData.length;
      var closedCalls = cData.filter(function(c){return c.result==='ปิดการขายได้';}).length;
      var convPct = Math.round(closedCalls/totalCalls*100);
      if(convPct<30){
        alerts.push({cat:'ai-conv',icon:'🤖',severity:'warning',
          title:'AI: Conversion โทรต่ำ '+convPct+'%',
          detail:'ปิดการขายได้ '+closedCalls+'/'+totalCalls+' สาย — แนะนำทบทวนสคริปต์การขาย',
          tab:'ordering'});
      }
    }
  } catch(e){}

  // ─── 10. AI วิเคราะห์ — ค่าใช้จ่ายเซลล์ผิดปกติ ───
  try {
    if(typeof SALES_EXPENSE_DATA!=='undefined' && Array.isArray(SALES_EXPENSE_DATA)){
      var totalExp = SALES_EXPENSE_DATA.reduce(function(s,e){return s+(e.amount||0);},0);
      var avgExp = SALES_EXPENSE_DATA.length>0 ? totalExp/SALES_EXPENSE_DATA.length : 0;
      var outliers = SALES_EXPENSE_DATA.filter(function(e){return (e.amount||0)>avgExp*2;});
      if(outliers.length>0){
        alerts.push({cat:'ai-expense',icon:'🤖',severity:'info',
          title:'AI: ค่าใช้จ่ายผิดปกติ '+outliers.length+' รายการ',
          detail:'มีรายการที่สูงกว่าค่าเฉลี่ยมากกว่า 2 เท่า — ควรตรวจสอบ',
          tab:'sales-marketing'});
      }
    }
  } catch(e){}

  // ─── 11. เช็คลิส — เส้นทางยังไม่เช็ค ───
  try {
    if(typeof window.ORD_CHECKLIST_ROUTES!=='undefined'){
      var thDays2 = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
      var td = thDays2[new Date().getDay()];
      var todayR = window.ORD_CHECKLIST_ROUTES.filter(function(r){
        return r.orderDay && r.orderDay.indexOf(td)>=0;
      });
      if(todayR.length>0){
        alerts.push({cat:'checklist',icon:'✅',severity:'info',
          title:'เช็คลิสวันนี้ '+todayR.length+' เส้นทาง',
          detail:'ตรวจสอบว่าพนักงานเปิดเช็คลิสและติ๊กเรียบร้อย',
          tab:'ordering'});
      }
    }
  } catch(e){}

  // Sort: critical first, then warning, then info
  var sevOrder = {critical:0, warning:1, info:2};
  alerts.sort(function(a,b){return (sevOrder[a.severity]||2)-(sevOrder[b.severity]||2);});

  _alertCache = alerts;
  return alerts;
}

function renderBellMenu(){
  var alerts = collectAlerts();
  var menu = document.getElementById('tbBellMenu');
  var count = document.getElementById('tbBellCount');
  if(!menu||!count) return;

  count.textContent = alerts.length;
  count.style.display = alerts.length>0?'':'none';

  if(alerts.length===0){
    menu.innerHTML = '<div style="padding:20px;text-align:center;color:#94a3b8;font-size:13px">✅ ไม่มีการแจ้งเตือน</div>';
    return;
  }

  var html = '<div style="padding:8px 12px;font-weight:700;font-size:13px;color:#1e293b;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center">'
    +'<span>🔔 การแจ้งเตือน ('+alerts.length+')</span>'
    +'</div>';

  var grouped = {};
  alerts.forEach(function(a){
    var key = a.cat.split('-')[0];
    var labels = {sales:'📊 ยอดขาย',booth:'🏕️ บูธ',delist:'⚠️ สินค้าเสี่ยง',quality:'🔬 คุณภาพ',
      ordering:'📞 ธุรการขาย',calls:'📞 การโทร',checklist:'✅ เช็คลิส',ai:'🤖 วิเคราะห์ AI'};
    var group = labels[key]||('🤖 วิเคราะห์ AI');
    if(!grouped[group]) grouped[group]=[];
    grouped[group].push(a);
  });

  Object.keys(grouped).forEach(function(g){
    html += '<div style="padding:6px 12px;font-weight:700;font-size:11px;color:#b45309;border-top:1px solid #f1f5f9;margin-top:2px;background:#fffbeb">'+g+' ('+grouped[g].length+')</div>';
    grouped[g].forEach(function(a){
      var sevColor = a.severity==='critical'?'#fef2f2':a.severity==='warning'?'#fffbeb':'#f0f9ff';
      var borderColor = a.severity==='critical'?'#fecaca':a.severity==='warning'?'#fed7aa':'#bfdbfe';
      html += '<div style="padding:8px 12px;font-size:12px;border-bottom:1px solid #f8fafc;cursor:pointer;'
        +'background:'+sevColor+';border-left:3px solid '+borderColor+'" '
        +'onclick="handleAlertClick(\''+a.tab+'\')">'
        +'<div style="font-weight:600;color:#1e293b">'+a.icon+' '+a.title+'</div>'
        +'<div style="color:#64748b;font-size:11px;margin-top:2px">'+a.detail+'</div>'
        +'</div>';
    });
  });

  menu.innerHTML = html;
}

window.handleAlertClick = function(tab){
  var menu = document.getElementById('tbBellMenu');
  if(menu) menu.classList.remove('open');
  if(typeof shellNavClick==='function'){
    var link = document.querySelector('[data-tab="'+tab+'"]');
    if(link) shellNavClick(link, tab);
  }
};

window.refreshNotifications = renderBellMenu;

setTimeout(renderBellMenu, 800);
setInterval(renderBellMenu, 60000);

// ── AI Analysis Scheduler ──
// ความถี่วิเคราะห์: ทุกวัน 10:00, 12:00, 15:00, 17:00, 20:00
var AI_SCHEDULE_HOURS = [10, 12, 15, 17, 20];
var _aiLastRun = localStorage.getItem('spbi-ai-last-run') || '';

function _aiRunAnalysis() {
  var now = new Date();
  var stamp = now.toISOString().slice(0, 16);
  localStorage.setItem('spbi-ai-last-run', stamp);
  _aiLastRun = stamp;

  renderBellMenu();

  if (typeof _mtBiRenderAI === 'function') try { _mtBiRenderAI(); } catch (e) {}
  if (typeof renderAmzAI === 'function') try { renderAmzAI(); } catch (e) {}
  if (typeof renderOrdAI === 'function') try { renderOrdAI(); } catch (e) {}
  if (typeof renderOverviewAI === 'function') try { renderOverviewAI(); } catch (e) {}
  if (typeof renderSmAI === 'function') try { renderSmAI(); } catch (e) {}

  console.log('[AI Scheduler] วิเคราะห์ข้อมูลอัตโนมัติ ' + now.toLocaleTimeString('th-TH'));
}

function _aiCheckSchedule() {
  var now = new Date();
  var h = now.getHours();
  var m = now.getMinutes();
  if (m !== 0) return;
  if (AI_SCHEDULE_HOURS.indexOf(h) === -1) return;
  var todayKey = now.toISOString().slice(0, 10) + 'T' + (h < 10 ? '0' : '') + h + ':00';
  if (_aiLastRun === todayKey) return;
  _aiRunAnalysis();
}

setInterval(_aiCheckSchedule, 60000);

window.getAiSchedule = function () {
  return {
    hours: AI_SCHEDULE_HOURS,
    lastRun: _aiLastRun || 'ยังไม่เคยรัน',
    label: AI_SCHEDULE_HOURS.map(function (h) { return (h < 10 ? '0' : '') + h + ':00 น.'; }).join(', ')
  };
};

window.triggerAiAnalysis = _aiRunAnalysis;

})();
