// ═══════════════════ MARKETING TAB ═══════════════════
(function(){
'use strict';

var _mktCurrentSub = 'mkt-plan';

window.showMktSub = function(el, sub) {
  document.querySelectorAll('#tab-marketing .sub-tab').forEach(function(t){ t.classList.remove('active'); });
  if (el) el.classList.add('active');
  document.querySelectorAll('.mkt-sub').forEach(function(d){ d.style.display='none'; });
  var target = document.getElementById(sub);
  if (target) target.style.display = 'block';
  _mktCurrentSub = sub;
  renderMktSub(sub);
};

function renderMktSub(sub) {
  switch(sub) {
    case 'mkt-plan':      renderMktPlan(); break;
    case 'mkt-promo':     renderMktPromo(); break;
    case 'mkt-social':    renderMktSocial(); break;
    case 'mkt-content':   renderMktContent(); break;
    case 'mkt-influencer': renderMktInfluencer(); break;
    case 'mkt-budget':    renderMktBudget(); break;
    case 'mkt-roi':       renderMktRoi(); break;
  }
}

var MKT_DATA_KEY = 'mkt_data_v1';
function _loadMktData() {
  try { return JSON.parse(localStorage.getItem(MKT_DATA_KEY)) || {}; } catch(e) { return {}; }
}
function _saveMktData(data) {
  try { localStorage.setItem(MKT_DATA_KEY, JSON.stringify(data)); } catch(e) {}
}

var MTH = ['','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

function _card(icon, title, value, sub, color, bg) {
  return '<div style="background:'+bg+';border-radius:14px;padding:18px 22px">'
    +'<div style="font-size:24px;margin-bottom:4px">'+icon+'</div>'
    +'<div style="font-size:11px;color:#64748b;font-weight:600">'+title+'</div>'
    +'<div style="font-size:24px;font-weight:800;color:'+color+';margin-top:4px">'+value+'</div>'
    +'<div style="font-size:11px;color:#94a3b8;margin-top:2px">'+sub+'</div>'
    +'</div>';
}

function _sectionHead(icon, title) {
  return '<div style="font-size:15px;font-weight:800;color:#1e293b;margin:24px 0 14px;display:flex;align-items:center;gap:8px">'+icon+' '+title+'</div>';
}

function _emptyState(icon, title, desc) {
  return '<div style="text-align:center;padding:60px 20px">'
    +'<div style="font-size:48px;margin-bottom:12px">'+icon+'</div>'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b;margin-bottom:8px">'+title+'</div>'
    +'<div style="font-size:13px;color:#94a3b8;max-width:400px;margin:0 auto">'+desc+'</div>'
    +'</div>';
}

// ── 1. แผนการตลาด (Marketing Planning & Performance Dashboard) ──
window._planView = 'dashboard'; // dashboard | form | calendar | performance
window._planEditIdx = -1; // -1 = new, >= 0 = edit index
window.renderMktPlan = null; // set below after function definition

var PLAN_STATUSES = [
  {key:'pending',   icon:'⚪', label:'รอดำเนินการ',      color:'#94a3b8', bg:'#f1f5f9'},
  {key:'active',    icon:'🔵', label:'กำลังดำเนินการ',    color:'#2563eb', bg:'#dbeafe'},
  {key:'approaching',icon:'🟡',label:'ใกล้ถึงกำหนด',     color:'#d97706', bg:'#fef3c7'},
  {key:'delayed',   icon:'🔴', label:'ล่าช้า/เลยกำหนด',  color:'#dc2626', bg:'#fecaca'},
  {key:'done',      icon:'🟢', label:'เสร็จสมบูรณ์',      color:'#16a34a', bg:'#bbf7d0'}
];
var PLAN_CHANNELS = ['Facebook','Line OA','TikTok','Instagram','YouTube','Shopee','Lazada','บูธ/Event','MT','GT','อื่นๆ'];
var PLAN_CAMPAIGNS = ['Brand Awareness','Lead Generation','Sales Promotion','Product Launch','Seasonal','Event/Activation','Customer Retention','อื่นๆ'];
var PLAN_OBJECTIVES = ['เพิ่มยอดขาย','เพิ่มการรับรู้แบรนด์','เพิ่มฐานลูกค้าใหม่','รักษาลูกค้าเดิม','เปิดตัวสินค้า','สร้าง Engagement','เพิ่มการเข้าถึง','อื่นๆ'];

function _getStatusObj(key) {
  return PLAN_STATUSES.find(function(s){return s.key===key;}) || PLAN_STATUSES[0];
}

function _autoStatus(plan) {
  if (plan.status === 'done') return 'done';
  if (!plan.endDate) return plan.status || 'pending';
  var now = new Date();
  var end = new Date(plan.endDate);
  var diff = (end - now) / (1000*60*60*24);
  if (diff < 0) return 'delayed';
  if (diff <= 7) return 'approaching';
  if (plan.status === 'active') return 'active';
  return plan.status || 'pending';
}

function _planBudgetTotal(plans) {
  return plans.reduce(function(s,p){return s+(p.budget||0);},0);
}
function _planBudgetActual(plans) {
  return plans.reduce(function(s,p){return s+(p.budgetActual||0);},0);
}
function _planRevenue(plans) {
  return plans.reduce(function(s,p){return s+(p.revenueDuring||0);},0);
}

function renderMktPlan() {
  var el = document.getElementById('mktPlanContent');
  if (!el) return;
  switch(window._planView) {
    case 'form':        _renderPlanForm(el); break;
    case 'calendar':    _renderPlanCalendar(el); break;
    case 'performance': _renderPlanPerformance(el); break;
    default:            _renderPlanDashboard(el);
  }
}
window.renderMktPlan = renderMktPlan;

// ─── Dashboard View ───
function _renderPlanDashboard(el) {
  var data = _loadMktData();
  var plans = data.plans || [];
  // Auto-update statuses
  plans.forEach(function(p){ p.status = _autoStatus(p); });
  _saveMktData(data);

  var done    = plans.filter(function(p){return p.status==='done';}).length;
  var active  = plans.filter(function(p){return p.status==='active';}).length;
  var delayed = plans.filter(function(p){return p.status==='delayed';}).length;
  var approaching = plans.filter(function(p){return p.status==='approaching';}).length;
  var pending = plans.filter(function(p){return p.status==='pending';}).length;
  var totalBudget = _planBudgetTotal(plans);
  var actualBudget = _planBudgetActual(plans);
  var totalRevenue = _planRevenue(plans);
  var roi = actualBudget > 0 ? ((totalRevenue - actualBudget) / actualBudget * 100) : 0;
  var roas = actualBudget > 0 ? (totalRevenue / actualBudget) : 0;

  var html = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap">'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b;flex:1">📋 Marketing Planning & Performance Dashboard</div>'
    +'<button onclick="_planView=\'form\';_planEditIdx=-1;renderMktPlan()" style="padding:7px 16px;border:none;border-radius:10px;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;font-size:12px;font-weight:700;cursor:pointer">➕ สร้างแผนใหม่</button>'
    +'<button onclick="_planView=\'calendar\';renderMktPlan()" style="padding:7px 16px;border:1.5px solid #7c3aed;border-radius:10px;background:#fff;color:#7c3aed;font-size:12px;font-weight:700;cursor:pointer">📅 ปฏิทิน</button>'
    +'<button onclick="_planView=\'performance\';renderMktPlan()" style="padding:7px 16px;border:1.5px solid #16a34a;border-radius:10px;background:#fff;color:#16a34a;font-size:12px;font-weight:700;cursor:pointer">📊 ผลแคมเปญ</button>'
    +'</div>';

  // KPI Cards Row 1
  html += '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:12px">'
    + _card('📋','แผนทั้งหมด', plans.length, 'รายการ', '#2563eb', 'linear-gradient(135deg,#eff6ff,#dbeafe)')
    + _card('🔵','กำลังดำเนินการ', active, 'รายการ', '#2563eb', 'linear-gradient(135deg,#eff6ff,#dbeafe)')
    + _card('🟢','เสร็จสมบูรณ์', done, 'รายการ', '#16a34a', 'linear-gradient(135deg,#f0fdf4,#bbf7d0)')
    + _card('🟡','ใกล้กำหนด', approaching, 'รายการ', '#d97706', 'linear-gradient(135deg,#fffbeb,#fef3c7)')
    + _card('🔴','ล่าช้า', delayed, 'รายการ', '#dc2626', 'linear-gradient(135deg,#fef2f2,#fecaca)')
    +'</div>';

  // KPI Cards Row 2
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px">'
    + _card('💰','งบประมาณรวม', '฿'+totalBudget.toLocaleString(), 'บาท', '#2563eb', 'linear-gradient(135deg,#eff6ff,#dbeafe)')
    + _card('💸','ใช้จ่ายจริง', '฿'+actualBudget.toLocaleString(), totalBudget>0?(actualBudget/totalBudget*100).toFixed(1)+'%':'—', '#f97316', 'linear-gradient(135deg,#fff7ed,#fed7aa)')
    + _card('📈','รายได้จากแคมเปญ', '฿'+totalRevenue.toLocaleString(), 'บาท', '#16a34a', 'linear-gradient(135deg,#f0fdf4,#bbf7d0)')
    + _card('🎯','ROI / ROAS', roi.toFixed(1)+'% / '+roas.toFixed(2)+'x', roi>=0?'กำไร':'ขาดทุน', roi>=0?'#16a34a':'#dc2626', roi>=0?'linear-gradient(135deg,#f0fdf4,#bbf7d0)':'linear-gradient(135deg,#fef2f2,#fecaca)')
    +'</div>';

  // Status legend
  html += '<div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap">';
  PLAN_STATUSES.forEach(function(s){
    html += '<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:#475569">'
      +'<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:'+s.color+'"></span> '+s.label+'</span>';
  });
  html += '</div>';

  // Plans table
  if (plans.length > 0) {
    var TH = 'padding:9px 10px;font-size:11px;font-weight:700;color:#fff;background:#1e293b;white-space:nowrap;';
    html += '<div style="overflow-x:auto;border-radius:12px;border:1px solid #e2e8f0"><table style="width:100%;border-collapse:collapse;font-size:12px">'
      +'<thead><tr>'
      +'<th style="'+TH+'text-align:center">#</th>'
      +'<th style="'+TH+'text-align:left">ชื่อแผน</th>'
      +'<th style="'+TH+'text-align:left">แคมเปญ</th>'
      +'<th style="'+TH+'text-align:left">ช่องทาง</th>'
      +'<th style="'+TH+'text-align:center">ระยะเวลา</th>'
      +'<th style="'+TH+'text-align:right">งบ (฿)</th>'
      +'<th style="'+TH+'text-align:right">ใช้จริง (฿)</th>'
      +'<th style="'+TH+'text-align:left">ผู้รับผิดชอบ</th>'
      +'<th style="'+TH+'text-align:center">สถานะ</th>'
      +'<th style="'+TH+'text-align:center">จัดการ</th>'
      +'</tr></thead><tbody>';

    plans.forEach(function(p, i) {
      var st = _getStatusObj(p.status);
      var startStr = p.startDate ? new Date(p.startDate).toLocaleDateString('th-TH',{day:'2-digit',month:'short'}) : '—';
      var endStr = p.endDate ? new Date(p.endDate).toLocaleDateString('th-TH',{day:'2-digit',month:'short'}) : '—';
      html += '<tr style="border-bottom:1px solid #f1f5f9;background:'+(i%2?'#fafafa':'#fff')+'">'
        +'<td style="padding:7px 10px;text-align:center;color:#94a3b8">'+(i+1)+'</td>'
        +'<td style="padding:7px 10px;font-weight:600;color:#1e293b;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+(p.name||'')+'">'+( p.name||'—')+'</td>'
        +'<td style="padding:7px 10px;color:#475569;font-size:11px">'+(p.campaign||'—')+'</td>'
        +'<td style="padding:7px 10px;color:#475569;font-size:11px">'+(p.channel||'—')+'</td>'
        +'<td style="padding:7px 10px;text-align:center;color:#475569;font-size:11px">'+startStr+' ~ '+endStr+'</td>'
        +'<td style="padding:7px 10px;text-align:right;font-weight:700;color:#2563eb">'+( p.budget||0).toLocaleString()+'</td>'
        +'<td style="padding:7px 10px;text-align:right;font-weight:600;color:#f97316">'+(p.budgetActual||0).toLocaleString()+'</td>'
        +'<td style="padding:7px 10px;color:#475569;font-size:11px">'+(p.responsible||'—')+'</td>'
        +'<td style="padding:7px 10px;text-align:center"><span style="padding:3px 10px;border-radius:12px;font-size:10px;font-weight:700;color:#fff;background:'+st.color+'">'+st.icon+' '+st.label+'</span></td>'
        +'<td style="padding:7px 10px;text-align:center;white-space:nowrap">'
        +'<button onclick="mktEditPlan('+i+')" style="border:none;background:none;cursor:pointer;font-size:13px" title="แก้ไข">✏️</button>'
        +'<button onclick="mktPlanStatus('+i+')" style="border:none;background:none;cursor:pointer;font-size:13px" title="เปลี่ยนสถานะ">🔄</button>'
        +'<button onclick="mktDeletePlan('+i+')" style="border:none;background:none;cursor:pointer;font-size:13px" title="ลบ">🗑️</button>'
        +'</td></tr>';
    });
    html += '</tbody></table></div>';
  } else {
    html += _emptyState('📋', 'ยังไม่มีแผนการตลาด', 'กดปุ่ม "สร้างแผนใหม่" เพื่อเริ่มวางแผนแคมเปญแรก');
  }

  // AI Marketing Analysis
  html += _renderPlanAIAnalysis(plans);

  // Cross-link flow
  html += '<div style="margin-top:24px;background:linear-gradient(135deg,#f8fafc,#f1f5f9);border-radius:14px;padding:18px 22px;border:1px solid #e2e8f0">'
    +'<div style="font-size:13px;font-weight:800;color:#1e293b;margin-bottom:12px">🔗 Marketing Flow (แผนผังเชื่อมโยง)</div>'
    +'<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:12px;font-weight:600">'
    +'<span style="padding:6px 14px;border-radius:10px;background:#2563eb;color:#fff">📋 แผนการตลาด</span>'
    +'<span style="color:#94a3b8">→</span>'
    +'<span style="padding:6px 14px;border-radius:10px;background:#7c3aed;color:#fff">🎯 แคมเปญ</span>'
    +'<span style="color:#94a3b8">→</span>'
    +'<span style="padding:6px 14px;border-radius:10px;background:#d97706;color:#fff">📅 อีเวนต์</span>'
    +'<span style="color:#94a3b8">→</span>'
    +'<span style="padding:6px 14px;border-radius:10px;background:#dc2626;color:#fff">💰 งบประมาณ</span>'
    +'<span style="color:#94a3b8">→</span>'
    +'<span style="padding:6px 14px;border-radius:10px;background:#f97316;color:#fff">🎁 โปรโมชัน</span>'
    +'<span style="color:#94a3b8">→</span>'
    +'<span style="padding:6px 14px;border-radius:10px;background:#16a34a;color:#fff">📊 ผลลัพธ์ยอดขาย</span>'
    +'</div></div>';

  el.innerHTML = html;
}

// ─── AI Marketing Analysis ───
function _renderPlanAIAnalysis(plans) {
  if (plans.length === 0) return '';
  var done = plans.filter(function(p){return p.status==='done';});
  var active = plans.filter(function(p){return p.status==='active';});
  var delayed = plans.filter(function(p){return p.status==='delayed';});
  var totalBudget = _planBudgetTotal(plans);
  var actualBudget = _planBudgetActual(plans);
  var totalRevenue = _planRevenue(plans);
  var roi = actualBudget > 0 ? ((totalRevenue - actualBudget) / actualBudget * 100) : 0;

  var insights = [];
  if (delayed.length > 0) insights.push('🔴 มี '+delayed.length+' แผนล่าช้า ควรเร่งดำเนินการหรือปรับแผน: '+delayed.map(function(p){return '"'+p.name+'"';}).join(', '));
  if (actualBudget > totalBudget && totalBudget > 0) insights.push('⚠️ ใช้งบเกินแผน '+(((actualBudget-totalBudget)/totalBudget)*100).toFixed(1)+'% — ควรทบทวนรายจ่ายที่ไม่จำเป็น');
  if (roi > 50) insights.push('🌟 ROI สูงมากที่ '+roi.toFixed(1)+'% — กลยุทธ์ได้ผลดี ควรขยายแคมเปญที่ทำกำไรสูงสุด');
  else if (roi > 0 && roi <= 50) insights.push('✅ ROI เป็นบวก '+roi.toFixed(1)+'% — ผลตอบแทนดี ปรับจูน targeting เพิ่มเพื่อเพิ่ม conversion');
  else if (actualBudget > 0 && roi <= 0) insights.push('📉 ROI ติดลบ '+roi.toFixed(1)+'% — ควรวิเคราะห์ช่องทางที่ขาดทุนและปรับกลยุทธ์');

  // Channel analysis
  var chSpend = {};
  plans.forEach(function(p) {
    var ch = p.channel || 'อื่นๆ';
    if (!chSpend[ch]) chSpend[ch] = {budget:0,actual:0,revenue:0,count:0};
    chSpend[ch].budget += (p.budget||0);
    chSpend[ch].actual += (p.budgetActual||0);
    chSpend[ch].revenue += (p.revenueDuring||0);
    chSpend[ch].count++;
  });
  var bestCh = null, bestRoi = -Infinity;
  Object.keys(chSpend).forEach(function(ch) {
    var c = chSpend[ch];
    if (c.actual > 0) {
      var chRoi = (c.revenue - c.actual) / c.actual * 100;
      if (chRoi > bestRoi) { bestRoi = chRoi; bestCh = ch; }
    }
  });
  if (bestCh && bestRoi > 0) insights.push('📊 ช่องทาง "'+bestCh+'" ให้ ROI สูงสุดที่ '+bestRoi.toFixed(1)+'% — ควรจัดสรรงบเพิ่ม');

  if (done.length > 0 && plans.length > 0) insights.push('📈 อัตราสำเร็จ '+(done.length/plans.length*100).toFixed(0)+'% ('+done.length+'/'+plans.length+' แผน)');

  // Recommendations
  var recs = [];
  if (active.length === 0 && plans.length > 0) recs.push('ไม่มีแผนที่กำลังดำเนินการ — ควรเริ่มดำเนินแผนที่รอคิวอยู่');
  if (plans.length < 3) recs.push('มีแผนน้อย — ควรวางแผนเพิ่มเพื่อครอบคลุมหลายช่องทาง');
  var uniqueChannels = {};
  plans.forEach(function(p){ if(p.channel) uniqueChannels[p.channel]=1; });
  if (Object.keys(uniqueChannels).length <= 2 && plans.length >= 3) recs.push('ใช้เพียง '+Object.keys(uniqueChannels).length+' ช่องทาง — ควรกระจายช่องทางเพื่อลดความเสี่ยง');

  var html = '<div style="margin-top:20px;background:linear-gradient(135deg,#eff6ff,#e0e7ff);border-radius:14px;padding:18px 22px;border:1px solid #c7d2fe">'
    +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">'
    +'<span style="font-size:20px">🤖</span>'
    +'<span style="font-size:15px;font-weight:800;color:#1e293b">AI Marketing Analysis</span>'
    +'</div>';

  if (insights.length > 0) {
    html += '<div style="margin-bottom:12px">';
    insights.forEach(function(ins) {
      html += '<div style="font-size:12px;color:#1e293b;padding:6px 0;border-bottom:1px solid rgba(99,102,241,.1)">'+ins+'</div>';
    });
    html += '</div>';
  }

  if (recs.length > 0) {
    html += '<div style="font-size:12px;font-weight:700;color:#4f46e5;margin-bottom:6px">💡 คำแนะนำ:</div>';
    recs.forEach(function(r) {
      html += '<div style="font-size:12px;color:#475569;padding:3px 0">• '+r+'</div>';
    });
  }

  html += '</div>';
  return html;
}

// ─── Create/Edit Plan Form ───
function _renderPlanForm(el) {
  var data = _loadMktData();
  var plans = data.plans || [];
  var p = _planEditIdx >= 0 && plans[_planEditIdx] ? plans[_planEditIdx] : {};
  var isEdit = _planEditIdx >= 0;
  var STY = 'padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;width:100%;box-sizing:border-box;';

  var html = '<div style="max-width:900px;margin:0 auto">'
    +'<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_planView=\'dashboard\';renderMktPlan()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:16px;font-weight:800;color:#1e293b">'+(isEdit?'✏️ แก้ไขแผนการตลาด':'➕ สร้างแผนการตลาดใหม่')+'</div>'
    +'</div>';

  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:22px">'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">';

  // 1. ชื่อแผน
  html += '<div style="grid-column:1/-1"><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📋 ชื่อแผนการตลาด *</label>'
    +'<input id="pf_name" value="'+(p.name||'')+'" placeholder="เช่น โปรโมชัน Summer Sale 2569" style="'+STY+'font-weight:600"></div>';

  // 2. ปี/เดือน
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📅 ปี พ.ศ.</label>'
    +'<select id="pf_year" style="'+STY+'">'
    +'<option value="2569"'+(p.year==='2569'?' selected':'')+'>2569</option>'
    +'<option value="2570"'+(p.year==='2570'?' selected':'')+'>2570</option>'
    +'</select></div>';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📅 เดือน</label>'
    +'<select id="pf_month" style="'+STY+'"><option value="">— เลือกเดือน —</option>';
  MTH.forEach(function(m,i){ if(i===0) return; html += '<option value="'+i+'"'+(p.month==i?' selected':'')+'>'+m+'</option>'; });
  html += '</select></div>';

  // 3. ประเภทแคมเปญ
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">🎯 ประเภทแคมเปญ</label>'
    +'<select id="pf_campaign" style="'+STY+'"><option value="">— เลือก —</option>';
  PLAN_CAMPAIGNS.forEach(function(c){ html += '<option value="'+c+'"'+(p.campaign===c?' selected':'')+'>'+c+'</option>'; });
  html += '</select></div>';

  // 4. วัตถุประสงค์
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">🎯 วัตถุประสงค์</label>'
    +'<select id="pf_objective" style="'+STY+'"><option value="">— เลือก —</option>';
  PLAN_OBJECTIVES.forEach(function(o){ html += '<option value="'+o+'"'+(p.objective===o?' selected':'')+'>'+o+'</option>'; });
  html += '</select></div>';

  // 5. กลุ่มเป้าหมาย
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">👥 กลุ่มเป้าหมาย</label>'
    +'<input id="pf_target" value="'+(p.targetGroup||'')+'" placeholder="เช่น ผู้หญิง 25-45 ปี กรุงเทพฯ" style="'+STY+'"></div>';

  // 6. ช่องทาง
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📱 ช่องทาง</label>'
    +'<select id="pf_channel" style="'+STY+'"><option value="">— เลือก —</option>';
  PLAN_CHANNELS.forEach(function(c){ html += '<option value="'+c+'"'+(p.channel===c?' selected':'')+'>'+c+'</option>'; });
  html += '</select></div>';

  // 7. สินค้า/SKU
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📦 สินค้า/SKU</label>'
    +'<input id="pf_products" value="'+(p.products||'')+'" placeholder="เช่น กล่องเค้ก 3 ปอนด์, ถุงขนม" style="'+STY+'"></div>';

  // 8. สถานที่
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📍 สถานที่</label>'
    +'<input id="pf_location" value="'+(p.location||'')+'" placeholder="เช่น Central World, ทั่วประเทศ" style="'+STY+'"></div>';

  // 9. วันเริ่ม - วันสิ้นสุด
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📅 วันเริ่มต้น</label>'
    +'<input type="date" id="pf_start" value="'+(p.startDate||'')+'" style="'+STY+'"></div>';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📅 วันสิ้นสุด</label>'
    +'<input type="date" id="pf_end" value="'+(p.endDate||'')+'" style="'+STY+'"></div>';

  // 10. ผู้รับผิดชอบ
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">👤 ผู้รับผิดชอบ</label>'
    +'<input id="pf_responsible" value="'+(p.responsible||'')+'" placeholder="ชื่อทีม/บุคคล" style="'+STY+'"></div>';

  // 11. งบประมาณ
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">💰 งบประมาณ (บาท)</label>'
    +'<input type="number" id="pf_budget" value="'+(p.budget||'')+'" placeholder="0" style="'+STY+'font-weight:700;color:#2563eb"></div>';

  // 12. KPI/เป้าหมาย
  html += '<div style="grid-column:1/-1"><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">🎯 KPI / เป้าหมาย</label>'
    +'<input id="pf_kpi" value="'+(p.kpiTarget||'')+'" placeholder="เช่น ยอดขายเพิ่ม 20%, Reach 50,000 คน, Lead 500 ราย" style="'+STY+'"></div>';

  // 13. รายละเอียดกิจกรรม
  html += '<div style="grid-column:1/-1"><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📝 รายละเอียดกิจกรรม</label>'
    +'<textarea id="pf_details" rows="3" placeholder="อธิบายรายละเอียดแคมเปญ กิจกรรมหลัก ข้อเสนอพิเศษ ฯลฯ" style="'+STY+'resize:vertical">'+(p.details||'')+'</textarea></div>';

  // Performance data (show in edit mode)
  if (isEdit) {
    html += '<div style="grid-column:1/-1;border-top:2px solid #e2e8f0;padding-top:16px;margin-top:8px">'
      +'<div style="font-size:13px;font-weight:800;color:#1e293b;margin-bottom:12px">📊 ข้อมูลผลลัพธ์ (กรอกหลังดำเนินการ)</div></div>';

    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">💸 งบใช้จริง (บาท)</label>'
      +'<input type="number" id="pf_budgetActual" value="'+(p.budgetActual||'')+'" placeholder="0" style="'+STY+'font-weight:700;color:#f97316"></div>';

    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📊 ยอดขายก่อนแคมเปญ (฿)</label>'
      +'<input type="number" id="pf_revBefore" value="'+(p.revenueBefore||'')+'" placeholder="0" style="'+STY+'"></div>';

    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📈 ยอดขายระหว่างแคมเปญ (฿)</label>'
      +'<input type="number" id="pf_revDuring" value="'+(p.revenueDuring||'')+'" placeholder="0" style="'+STY+'font-weight:700;color:#16a34a"></div>';

    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📉 ยอดขายหลังแคมเปญ (฿)</label>'
      +'<input type="number" id="pf_revAfter" value="'+(p.revenueAfter||'')+'" placeholder="0" style="'+STY+'"></div>';

    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">👥 จำนวนลูกค้า</label>'
      +'<input type="number" id="pf_customers" value="'+(p.customers||'')+'" placeholder="0" style="'+STY+'"></div>';

    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">🧾 จำนวนบิล</label>'
      +'<input type="number" id="pf_bills" value="'+(p.bills||'')+'" placeholder="0" style="'+STY+'"></div>';

    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📦 จำนวนชิ้น</label>'
      +'<input type="number" id="pf_units" value="'+(p.units||'')+'" placeholder="0" style="'+STY+'"></div>';
  }

  html += '</div>'; // close grid

  // Save/Cancel
  html += '<div style="margin-top:20px;display:flex;gap:10px">'
    +'<button onclick="mktSavePlan()" style="padding:10px 28px;border:none;border-radius:10px;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;font-size:14px;font-weight:700;cursor:pointer">💾 '+(isEdit?'บันทึกการแก้ไข':'สร้างแผน')+'</button>'
    +'<button onclick="_planView=\'dashboard\';renderMktPlan()" style="padding:10px 20px;border:1.5px solid #e2e8f0;border-radius:10px;background:#fff;color:#64748b;font-size:13px;font-weight:600;cursor:pointer">ยกเลิก</button>'
    +'</div>';

  html += '</div></div>';
  el.innerHTML = html;
}

// ─── Marketing Calendar ───
function _renderPlanCalendar(el) {
  var data = _loadMktData();
  var plans = data.plans || [];
  plans.forEach(function(p){ p.status = _autoStatus(p); });

  var html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_planView=\'dashboard\';renderMktPlan()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b">📅 Marketing Calendar</div>'
    +'</div>';

  if (plans.length === 0) {
    html += _emptyState('📅', 'ยังไม่มีแผนการตลาด', 'สร้างแผนแล้วมาดูปฏิทินได้');
    el.innerHTML = html;
    return;
  }

  // Sort by start date
  var sorted = plans.map(function(p,i){return {p:p,idx:i};}).sort(function(a,b){
    return (a.p.startDate||'9999').localeCompare(b.p.startDate||'9999');
  });

  var TH = 'padding:9px 12px;font-size:11px;font-weight:700;color:#fff;background:#1e293b;';
  html += '<div style="overflow-x:auto;border-radius:12px;border:1px solid #e2e8f0"><table style="width:100%;border-collapse:collapse;font-size:12px">'
    +'<thead><tr>'
    +'<th style="'+TH+'text-align:center">📅 วันที่</th>'
    +'<th style="'+TH+'text-align:left">🎯 แคมเปญ</th>'
    +'<th style="'+TH+'text-align:left">📝 กิจกรรม</th>'
    +'<th style="'+TH+'text-align:left">📱 ช่องทาง</th>'
    +'<th style="'+TH+'text-align:right">💰 งบ</th>'
    +'<th style="'+TH+'text-align:left">👤 ผู้รับผิดชอบ</th>'
    +'<th style="'+TH+'text-align:center">สถานะ</th>'
    +'</tr></thead><tbody>';

  sorted.forEach(function(item, i) {
    var p = item.p;
    var st = _getStatusObj(p.status);
    var dateRange = '';
    if (p.startDate) {
      dateRange = new Date(p.startDate).toLocaleDateString('th-TH',{day:'2-digit',month:'short',year:'2-digit'});
      if (p.endDate) dateRange += ' — ' + new Date(p.endDate).toLocaleDateString('th-TH',{day:'2-digit',month:'short',year:'2-digit'});
    } else { dateRange = '—'; }

    html += '<tr style="border-bottom:1px solid #f1f5f9;background:'+(i%2?'#fafafa':'#fff')+';cursor:pointer" onclick="mktEditPlan('+item.idx+')">'
      +'<td style="padding:8px 12px;text-align:center;font-size:11px;color:#475569">'+dateRange+'</td>'
      +'<td style="padding:8px 12px;font-weight:600;color:#1e293b">'+(p.campaign||'—')+'</td>'
      +'<td style="padding:8px 12px;color:#475569">'+(p.name||'—')+'</td>'
      +'<td style="padding:8px 12px;color:#475569">'+(p.channel||'—')+'</td>'
      +'<td style="padding:8px 12px;text-align:right;font-weight:700;color:#2563eb">฿'+(p.budget||0).toLocaleString()+'</td>'
      +'<td style="padding:8px 12px;color:#475569">'+(p.responsible||'—')+'</td>'
      +'<td style="padding:8px 12px;text-align:center"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+st.color+'" title="'+st.label+'"></span></td>'
      +'</tr>';
  });

  html += '</tbody></table></div>';

  // Month summary
  var monthMap = {};
  plans.forEach(function(p) {
    var m = p.month || (p.startDate ? new Date(p.startDate).getMonth()+1 : 0);
    if (!m) return;
    if (!monthMap[m]) monthMap[m] = {count:0, budget:0, active:0};
    monthMap[m].count++;
    monthMap[m].budget += (p.budget||0);
    if (p.status==='active') monthMap[m].active++;
  });

  var months = Object.keys(monthMap).sort(function(a,b){return a-b;});
  if (months.length > 0) {
    html += '<div style="margin-top:20px"><div style="font-size:14px;font-weight:800;color:#1e293b;margin-bottom:10px">📊 สรุปรายเดือน</div>'
      +'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px">';
    months.forEach(function(m) {
      var d = monthMap[m];
      html += '<div style="background:#f8fafc;border-radius:10px;padding:12px;border:1px solid #e2e8f0;text-align:center">'
        +'<div style="font-size:13px;font-weight:800;color:#2563eb">'+MTH[parseInt(m)]+'</div>'
        +'<div style="font-size:11px;color:#64748b;margin-top:4px">'+d.count+' แผน · ฿'+d.budget.toLocaleString()+'</div>'
        +'</div>';
    });
    html += '</div></div>';
  }

  el.innerHTML = html;
}

// ─── Campaign Performance ───
function _renderPlanPerformance(el) {
  var data = _loadMktData();
  var plans = data.plans || [];
  var withData = plans.filter(function(p){return (p.budgetActual||0)>0 || (p.revenueDuring||0)>0;});

  var html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_planView=\'dashboard\';renderMktPlan()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b">📊 Campaign Performance</div>'
    +'</div>';

  if (withData.length === 0) {
    html += _emptyState('📊', 'ยังไม่มีข้อมูลผลแคมเปญ', 'แก้ไขแผนที่ดำเนินการแล้วเพื่อกรอกข้อมูลยอดขายและงบใช้จริง');
    el.innerHTML = html;
    return;
  }

  // Performance cards
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:16px">';
  withData.forEach(function(p, i) {
    var st = _getStatusObj(p.status || 'pending');
    var roi = (p.budgetActual||0) > 0 ? ((p.revenueDuring||0) - (p.budgetActual||0)) / (p.budgetActual||0) * 100 : 0;
    var roas = (p.budgetActual||0) > 0 ? (p.revenueDuring||0) / (p.budgetActual||0) : 0;
    var uplift = (p.revenueBefore||0) > 0 ? (((p.revenueDuring||0) - (p.revenueBefore||0)) / (p.revenueBefore||0) * 100) : 0;
    var budgetPct = (p.budget||0) > 0 ? ((p.budgetActual||0) / (p.budget||0) * 100) : 0;

    html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;overflow:hidden">'
      +'<div style="background:linear-gradient(135deg,#1e293b,#334155);padding:14px 18px;display:flex;align-items:center;gap:10px">'
        +'<div style="flex:1"><div style="font-size:14px;font-weight:800;color:#fff">'+(p.name||'แผน '+(i+1))+'</div>'
        +'<div style="font-size:11px;color:#94a3b8">'+(p.campaign||'—')+' · '+(p.channel||'—')+'</div></div>'
        +'<span style="padding:3px 10px;border-radius:10px;font-size:10px;font-weight:700;background:'+st.color+';color:#fff">'+st.icon+' '+st.label+'</span>'
      +'</div>'
      +'<div style="padding:16px 18px">'
        +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px">'
          +'<div><div style="font-size:10px;color:#94a3b8">งบแผน</div><div style="font-size:13px;font-weight:700;color:#2563eb">฿'+(p.budget||0).toLocaleString()+'</div></div>'
          +'<div><div style="font-size:10px;color:#94a3b8">งบใช้จริง</div><div style="font-size:13px;font-weight:700;color:#f97316">฿'+(p.budgetActual||0).toLocaleString()+'</div></div>'
          +'<div><div style="font-size:10px;color:#94a3b8">% งบใช้</div><div style="font-size:13px;font-weight:700;color:'+(budgetPct>100?'#dc2626':'#475569')+'">'+budgetPct.toFixed(1)+'%</div></div>'
        +'</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px">'
          +'<div><div style="font-size:10px;color:#94a3b8">ยอดขายก่อน</div><div style="font-size:12px;font-weight:600">฿'+(p.revenueBefore||0).toLocaleString()+'</div></div>'
          +'<div><div style="font-size:10px;color:#94a3b8">ยอดขายระหว่าง</div><div style="font-size:12px;font-weight:700;color:#16a34a">฿'+(p.revenueDuring||0).toLocaleString()+'</div></div>'
          +'<div><div style="font-size:10px;color:#94a3b8">ยอดขายหลัง</div><div style="font-size:12px;font-weight:600">฿'+(p.revenueAfter||0).toLocaleString()+'</div></div>'
        +'</div>'
        +'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">'
          +'<div style="text-align:center;padding:8px;background:#f8fafc;border-radius:8px"><div style="font-size:10px;color:#94a3b8">ลูกค้า</div><div style="font-size:14px;font-weight:800;color:#1e293b">'+(p.customers||0).toLocaleString()+'</div></div>'
          +'<div style="text-align:center;padding:8px;background:#f8fafc;border-radius:8px"><div style="font-size:10px;color:#94a3b8">บิล</div><div style="font-size:14px;font-weight:800;color:#1e293b">'+(p.bills||0).toLocaleString()+'</div></div>'
          +'<div style="text-align:center;padding:8px;background:#f8fafc;border-radius:8px"><div style="font-size:10px;color:#94a3b8">ชิ้น</div><div style="font-size:14px;font-weight:800;color:#1e293b">'+(p.units||0).toLocaleString()+'</div></div>'
          +'<div style="text-align:center;padding:8px;background:'+(uplift>=0?'#f0fdf4':'#fef2f2')+';border-radius:8px"><div style="font-size:10px;color:#94a3b8">Uplift</div><div style="font-size:14px;font-weight:800;color:'+(uplift>=0?'#16a34a':'#dc2626')+'">'+( uplift>=0?'+':'')+uplift.toFixed(1)+'%</div></div>'
        +'</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding-top:10px;border-top:1px solid #f1f5f9">'
          +'<div style="text-align:center;padding:10px;background:linear-gradient(135deg,'+(roi>=0?'#f0fdf4,#bbf7d0':'#fef2f2,#fecaca')+');border-radius:10px">'
            +'<div style="font-size:10px;font-weight:700;color:#64748b">ROI</div>'
            +'<div style="font-size:20px;font-weight:800;color:'+(roi>=0?'#16a34a':'#dc2626')+'">'+roi.toFixed(1)+'%</div></div>'
          +'<div style="text-align:center;padding:10px;background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:10px">'
            +'<div style="font-size:10px;font-weight:700;color:#64748b">ROAS</div>'
            +'<div style="font-size:20px;font-weight:800;color:#2563eb">'+roas.toFixed(2)+'x</div></div>'
        +'</div>';

    // vs Target
    if (p.kpiTarget) {
      html += '<div style="margin-top:10px;padding:8px 12px;background:#faf5ff;border-radius:8px;font-size:11px;color:#7c3aed">'
        +'<strong>🎯 เป้าหมาย:</strong> '+p.kpiTarget+'</div>';
    }

    html += '</div></div>';
  });
  html += '</div>';

  el.innerHTML = html;
}

// ─── Save Plan ───
window.mktSavePlan = function() {
  var nameEl = document.getElementById('pf_name');
  if (!nameEl || !nameEl.value.trim()) { alert('กรุณากรอกชื่อแผนการตลาด'); return; }

  var data = _loadMktData();
  if (!data.plans) data.plans = [];

  var plan = _planEditIdx >= 0 && data.plans[_planEditIdx] ? data.plans[_planEditIdx] : {};

  plan.name = nameEl.value.trim();
  plan.year = (document.getElementById('pf_year')||{}).value || '';
  plan.month = (document.getElementById('pf_month')||{}).value || '';
  plan.campaign = (document.getElementById('pf_campaign')||{}).value || '';
  plan.objective = (document.getElementById('pf_objective')||{}).value || '';
  plan.targetGroup = (document.getElementById('pf_target')||{}).value || '';
  plan.channel = (document.getElementById('pf_channel')||{}).value || '';
  plan.products = (document.getElementById('pf_products')||{}).value || '';
  plan.location = (document.getElementById('pf_location')||{}).value || '';
  plan.startDate = (document.getElementById('pf_start')||{}).value || '';
  plan.endDate = (document.getElementById('pf_end')||{}).value || '';
  plan.responsible = (document.getElementById('pf_responsible')||{}).value || '';
  plan.budget = parseFloat((document.getElementById('pf_budget')||{}).value) || 0;
  plan.kpiTarget = (document.getElementById('pf_kpi')||{}).value || '';
  plan.details = (document.getElementById('pf_details')||{}).value || '';

  // Performance fields (edit mode only)
  var baEl = document.getElementById('pf_budgetActual');
  if (baEl) plan.budgetActual = parseFloat(baEl.value) || 0;
  var rbEl = document.getElementById('pf_revBefore');
  if (rbEl) plan.revenueBefore = parseFloat(rbEl.value) || 0;
  var rdEl = document.getElementById('pf_revDuring');
  if (rdEl) plan.revenueDuring = parseFloat(rdEl.value) || 0;
  var raEl = document.getElementById('pf_revAfter');
  if (raEl) plan.revenueAfter = parseFloat(raEl.value) || 0;
  var cuEl = document.getElementById('pf_customers');
  if (cuEl) plan.customers = parseInt(cuEl.value) || 0;
  var biEl = document.getElementById('pf_bills');
  if (biEl) plan.bills = parseInt(biEl.value) || 0;
  var unEl = document.getElementById('pf_units');
  if (unEl) plan.units = parseInt(unEl.value) || 0;

  if (!plan.status) plan.status = 'pending';
  plan.status = _autoStatus(plan);

  if (_planEditIdx < 0) {
    data.plans.push(plan);
  } else {
    data.plans[_planEditIdx] = plan;
  }

  _saveMktData(data);
  _planView = 'dashboard';
  renderMktPlan();
};

window.mktAddPlan = function() {
  _planEditIdx = -1;
  _planView = 'form';
  renderMktPlan();
};

window.mktEditPlan = function(i) {
  _planEditIdx = i;
  _planView = 'form';
  renderMktPlan();
};

window.mktPlanStatus = function(i) {
  var data = _loadMktData();
  var p = data.plans[i];
  if (!p) return;
  var keys = PLAN_STATUSES.map(function(s){return s.key;});
  var curr = keys.indexOf(p.status);
  p.status = keys[(curr + 1) % keys.length];
  _saveMktData(data);
  renderMktPlan();
};

window.mktDeletePlan = function(i) {
  if (!confirm('ลบแผนนี้?')) return;
  var data = _loadMktData();
  data.plans.splice(i, 1);
  _saveMktData(data);
  renderMktPlan();
};

// ── 2. โปรโมชัน/แคมเปญ (Promotion & Campaign Dashboard) ──
window._promoView = 'dashboard'; // dashboard | form | detail | promo | calendar
window._promoEditIdx = -1;
window._promoDetailIdx = -1;

var CAMP_TYPES = ['Promotion','Discount','Bundle','Free Gift','New Product','Seasonal','Event','Online Ads'];
var CAMP_STATUSES = [
  {key:'pending', icon:'⏳', label:'รอเริ่ม',       color:'#94a3b8', bg:'#f1f5f9'},
  {key:'active',  icon:'🟢', label:'กำลังดำเนินการ', color:'#16a34a', bg:'#bbf7d0'},
  {key:'done',    icon:'✅', label:'สิ้นสุดแล้ว',    color:'#2563eb', bg:'#dbeafe'},
  {key:'paused',  icon:'⏸️', label:'หยุดชั่วคราว',   color:'#d97706', bg:'#fef3c7'}
];
var CAMP_CHANNELS = ['Modern Trade','Cafe Amazon','ร้านของฝาก','Online','B2B','B2C','ลูกค้าใหม่','ลูกค้าเก่า'];
var CAMP_REGIONS = ['กรุงเทพฯ','ภาคกลาง','ภาคเหนือ','ภาคใต้','ภาคอีสาน','ภาคตะวันออก','ภาคตะวันตก','ทั่วประเทศ'];
var PROMO_TYPES = ['ซื้อ X แถม Y','ซื้อครบ X ลด Y','ซื้อคู่ราคาพิเศษ','Discount %','Free Gift','Clearance','เฉพาะสาขา','อื่นๆ'];

function _getCampStatusObj(key) {
  return CAMP_STATUSES.find(function(s){return s.key===key;}) || CAMP_STATUSES[0];
}

function _autoCampStatus(c) {
  if (c.status === 'done' || c.status === 'paused') return c.status;
  if (!c.endDate) return c.status || 'pending';
  var now = new Date(); var end = new Date(c.endDate); var start = new Date(c.startDate||c.endDate);
  if (end < now) return 'done';
  if (start <= now && end >= now) return 'active';
  return c.status || 'pending';
}

function renderMktPromo() {
  var el = document.getElementById('mktPromoContent');
  if (!el) return;
  switch(window._promoView) {
    case 'form':     _renderCampForm(el); break;
    case 'detail':   _renderCampDetail(el); break;
    case 'promo':    _renderPromoMgmt(el); break;
    case 'calendar': _renderCampCalendar(el); break;
    default:         _renderCampDashboard(el);
  }
}
window.renderMktPromo = renderMktPromo;

// ─── 2.1 Campaign Dashboard ───
function _renderCampDashboard(el) {
  var data = _loadMktData();
  var camps = data.promos || [];
  camps.forEach(function(c){ c.status = _autoCampStatus(c); });
  _saveMktData(data);

  var active  = camps.filter(function(c){return c.status==='active';}).length;
  var pending = camps.filter(function(c){return c.status==='pending';}).length;
  var done    = camps.filter(function(c){return c.status==='done';}).length;
  var totalBudget  = camps.reduce(function(s,c){return s+(c.budget||0);},0);
  var actualSpend  = camps.reduce(function(s,c){return s+(c.actualSpend||0);},0);
  var totalTarget  = camps.reduce(function(s,c){return s+(c.targetSales||0);},0);
  var totalActual  = camps.reduce(function(s,c){return s+(c.actualSales||0);},0);
  var roi = actualSpend > 0 ? ((totalActual - actualSpend) / actualSpend * 100) : 0;

  var html = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap">'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b;flex:1">🎯 Promotion & Campaign Dashboard</div>'
    +'<button onclick="_promoView=\'form\';_promoEditIdx=-1;renderMktPromo()" style="padding:7px 16px;border:none;border-radius:10px;background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff;font-size:12px;font-weight:700;cursor:pointer">➕ สร้าง Campaign</button>'
    +'<button onclick="_promoView=\'promo\';renderMktPromo()" style="padding:7px 16px;border:1.5px solid #f97316;border-radius:10px;background:#fff;color:#f97316;font-size:12px;font-weight:700;cursor:pointer">🎁 โปรโมชัน</button>'
    +'<button onclick="_promoView=\'calendar\';renderMktPromo()" style="padding:7px 16px;border:1.5px solid #7c3aed;border-radius:10px;background:#fff;color:#7c3aed;font-size:12px;font-weight:700;cursor:pointer">📅 ปฏิทิน</button>'
    +'</div>';

  // KPI Row 1
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px">'
    + _card('🎯','Campaign ทั้งหมด', camps.length, 'รายการ', '#dc2626', 'linear-gradient(135deg,#fef2f2,#fecaca)')
    + _card('🟢','กำลังดำเนินการ', active, 'รายการ', '#16a34a', 'linear-gradient(135deg,#f0fdf4,#bbf7d0)')
    + _card('⏳','รอเริ่ม', pending, 'รายการ', '#94a3b8', 'linear-gradient(135deg,#f8fafc,#f1f5f9)')
    + _card('✅','สิ้นสุดแล้ว', done, 'รายการ', '#2563eb', 'linear-gradient(135deg,#eff6ff,#dbeafe)')
    +'</div>';

  // KPI Row 2
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px">'
    + _card('💰','งบประมาณรวม', '฿'+totalBudget.toLocaleString(), 'บาท', '#2563eb', 'linear-gradient(135deg,#eff6ff,#dbeafe)')
    + _card('💸','ใช้จริง', '฿'+actualSpend.toLocaleString(), totalBudget>0?(actualSpend/totalBudget*100).toFixed(1)+'%':'—', '#f97316', 'linear-gradient(135deg,#fff7ed,#fed7aa)')
    + _card('📈','ยอดขายจาก Campaign', '฿'+totalActual.toLocaleString(), totalTarget>0?'Achievement '+(totalActual/totalTarget*100).toFixed(1)+'%':'—', '#16a34a', 'linear-gradient(135deg,#f0fdf4,#bbf7d0)')
    + _card('⭐','ROI', roi.toFixed(1)+'%', roi>=0?'กำไร':'ขาดทุน', roi>=0?'#16a34a':'#dc2626', roi>=0?'linear-gradient(135deg,#f0fdf4,#bbf7d0)':'linear-gradient(135deg,#fef2f2,#fecaca)')
    +'</div>';

  // Campaign table
  if (camps.length > 0) {
    var TH = 'padding:9px 10px;font-size:11px;font-weight:700;color:#fff;background:#1e293b;white-space:nowrap;';
    html += '<div style="overflow-x:auto;border-radius:12px;border:1px solid #e2e8f0"><table style="width:100%;border-collapse:collapse;font-size:12px">'
      +'<thead><tr>'
      +'<th style="'+TH+'text-align:left">Campaign</th>'
      +'<th style="'+TH+'text-align:left">ประเภท</th>'
      +'<th style="'+TH+'text-align:center">ระยะเวลา</th>'
      +'<th style="'+TH+'text-align:left">ช่องทาง</th>'
      +'<th style="'+TH+'text-align:right">Target Sales</th>'
      +'<th style="'+TH+'text-align:right">Actual Sales</th>'
      +'<th style="'+TH+'text-align:right">งบ</th>'
      +'<th style="'+TH+'text-align:center">สถานะ</th>'
      +'<th style="'+TH+'text-align:center">จัดการ</th>'
      +'</tr></thead><tbody>';

    camps.forEach(function(c, i) {
      var st = _getCampStatusObj(c.status);
      var startStr = c.startDate ? new Date(c.startDate).toLocaleDateString('th-TH',{day:'2-digit',month:'short'}) : '—';
      var endStr = c.endDate ? new Date(c.endDate).toLocaleDateString('th-TH',{day:'2-digit',month:'short'}) : '—';
      var achPct = (c.targetSales||0) > 0 ? ((c.actualSales||0)/(c.targetSales)*100) : 0;
      html += '<tr style="border-bottom:1px solid #f1f5f9;background:'+(i%2?'#fafafa':'#fff')+';cursor:pointer" onclick="_promoDetailIdx='+i+';_promoView=\'detail\';renderMktPromo()">'
        +'<td style="padding:7px 10px;font-weight:600;color:#1e293b;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(c.name||'—')+'</td>'
        +'<td style="padding:7px 10px;color:#475569;font-size:11px"><span style="padding:2px 8px;border-radius:8px;background:#f1f5f9;font-size:10px;font-weight:600">'+(c.campType||'—')+'</span></td>'
        +'<td style="padding:7px 10px;text-align:center;color:#475569;font-size:11px">'+startStr+' ~ '+endStr+'</td>'
        +'<td style="padding:7px 10px;color:#475569;font-size:11px">'+(c.channels?c.channels.join(', '):(c.channel||'—'))+'</td>'
        +'<td style="padding:7px 10px;text-align:right;color:#64748b">฿'+(c.targetSales||0).toLocaleString()+'</td>'
        +'<td style="padding:7px 10px;text-align:right;font-weight:700;color:'+(achPct>=80?'#16a34a':achPct>=50?'#d97706':'#dc2626')+'">฿'+(c.actualSales||0).toLocaleString()+'</td>'
        +'<td style="padding:7px 10px;text-align:right;font-weight:600;color:#2563eb">฿'+(c.budget||0).toLocaleString()+'</td>'
        +'<td style="padding:7px 10px;text-align:center"><span style="padding:3px 10px;border-radius:12px;font-size:10px;font-weight:700;color:#fff;background:'+st.color+'">'+st.icon+' '+st.label+'</span></td>'
        +'<td style="padding:7px 10px;text-align:center;white-space:nowrap" onclick="event.stopPropagation()">'
        +'<button onclick="_promoEditIdx='+i+';_promoView=\'form\';renderMktPromo()" style="border:none;background:none;cursor:pointer;font-size:13px" title="แก้ไข">✏️</button>'
        +'<button onclick="mktCampStatus('+i+')" style="border:none;background:none;cursor:pointer;font-size:13px" title="เปลี่ยนสถานะ">🔄</button>'
        +'<button onclick="mktDeletePromo('+i+')" style="border:none;background:none;cursor:pointer;font-size:13px" title="ลบ">🗑️</button>'
        +'</td></tr>';
    });
    html += '</tbody></table></div>';
  } else {
    html += _emptyState('🎯', 'ยังไม่มี Campaign', 'กดปุ่ม "สร้าง Campaign" เพื่อเริ่มสร้างแคมเปญแรก');
  }

  // AI Campaign Analysis
  html += _renderCampAIAnalysis(camps);

  el.innerHTML = html;
}

// ─── 2.2 AI Campaign Analysis ───
function _renderCampAIAnalysis(camps) {
  if (camps.length === 0) return '';
  var insights = [];
  var totalTarget = camps.reduce(function(s,c){return s+(c.targetSales||0);},0);
  var totalActual = camps.reduce(function(s,c){return s+(c.actualSales||0);},0);
  var totalBudget = camps.reduce(function(s,c){return s+(c.budget||0);},0);
  var actualSpend = camps.reduce(function(s,c){return s+(c.actualSpend||0);},0);
  var achPct = totalTarget > 0 ? (totalActual/totalTarget*100) : 0;

  // Per-campaign insights
  camps.forEach(function(c) {
    if (!c.actualSales && !c.actualSpend) return;
    var pct = (c.targetSales||0) > 0 ? ((c.actualSales||0)/(c.targetSales)*100) : 0;
    var campRoi = (c.actualSpend||0) > 0 ? ((c.actualSales||0)-(c.actualSpend||0))/(c.actualSpend||0)*100 : 0;
    if (pct >= 100) insights.push('🌟 "'+c.name+'" ทำยอดเกินเป้า '+pct.toFixed(0)+'% — ควรขยายแคมเปญลักษณะนี้');
    else if (pct > 0 && pct < 50) insights.push('⚠️ "'+c.name+'" ทำยอดได้เพียง '+pct.toFixed(0)+'% — ควรเพิ่มการสื่อสารในพื้นที่ที่ยอดขายต่ำ');
    if (campRoi > 500) insights.push('📊 "'+c.name+'" ROI สูง '+campRoi.toFixed(0)+'% — ควรจัดสรรงบเพิ่มให้แคมเปญนี้');
  });

  if (achPct > 0 && achPct < 70) insights.push('📉 Achievement รวมอยู่ที่ '+achPct.toFixed(1)+'% — ควรทบทวนกลยุทธ์ Campaign');
  if (achPct >= 90) insights.push('🎉 Achievement รวม '+achPct.toFixed(1)+'% — ผลงานดีมาก!');

  // Channel analysis
  var chMap = {};
  camps.forEach(function(c) {
    var chs = c.channels || (c.channel ? [c.channel] : []);
    chs.forEach(function(ch) {
      if (!chMap[ch]) chMap[ch] = {actual:0,target:0,count:0};
      chMap[ch].actual += (c.actualSales||0);
      chMap[ch].target += (c.targetSales||0);
      chMap[ch].count++;
    });
  });
  var bestCh = null, bestAch = 0;
  Object.keys(chMap).forEach(function(ch) {
    var ach = chMap[ch].target > 0 ? (chMap[ch].actual/chMap[ch].target*100) : 0;
    if (ach > bestAch) { bestAch = ach; bestCh = ch; }
  });
  if (bestCh && bestAch > 0) insights.push('📊 ช่องทาง "'+bestCh+'" ให้ Achievement สูงสุด '+bestAch.toFixed(0)+'%');

  var recs = [];
  var activeCamps = camps.filter(function(c){return c.status==='active';});
  if (activeCamps.length === 0 && camps.length > 0) recs.push('ไม่มี Campaign ที่กำลังดำเนินการ — ควรเปิด Campaign ใหม่เพื่อกระตุ้นยอดขาย');
  var types = {};
  camps.forEach(function(c){ if(c.campType) types[c.campType]=1; });
  if (Object.keys(types).length <= 1 && camps.length >= 3) recs.push('ใช้ Campaign ประเภทเดียว — ควรกระจายหลายรูปแบบ (Promotion, Bundle, Event)');

  if (insights.length === 0 && recs.length === 0) return '';

  var html = '<div style="margin-top:20px;background:linear-gradient(135deg,#fef2f2,#ffe4e6);border-radius:14px;padding:18px 22px;border:1px solid #fecaca">'
    +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">'
    +'<span style="font-size:20px">🤖</span>'
    +'<span style="font-size:15px;font-weight:800;color:#1e293b">AI Campaign Analysis</span></div>';

  if (insights.length > 0) {
    insights.forEach(function(ins) {
      html += '<div style="font-size:12px;color:#1e293b;padding:6px 0;border-bottom:1px solid rgba(220,38,38,.1)">'+ins+'</div>';
    });
  }
  if (recs.length > 0) {
    html += '<div style="font-size:12px;font-weight:700;color:#dc2626;margin:10px 0 6px">💡 Recommendation:</div>';
    recs.forEach(function(r) {
      html += '<div style="font-size:12px;color:#475569;padding:3px 0">• '+r+'</div>';
    });
  }
  html += '</div>';
  return html;
}

// ─── 2.3 Create/Edit Campaign Form ───
function _renderCampForm(el) {
  var data = _loadMktData();
  var camps = data.promos || [];
  var c = window._promoEditIdx >= 0 && camps[window._promoEditIdx] ? camps[window._promoEditIdx] : {};
  var isEdit = window._promoEditIdx >= 0;
  var STY = 'padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;width:100%;box-sizing:border-box;';

  var html = '<div style="max-width:950px;margin:0 auto">'
    +'<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_promoView=\'dashboard\';renderMktPromo()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:16px;font-weight:800;color:#1e293b">'+(isEdit?'✏️ แก้ไข Campaign':'➕ สร้าง Promotion / Campaign')+'</div></div>';

  // === Section: Campaign Info ===
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:22px;margin-bottom:16px">'
    +'<div style="font-size:14px;font-weight:800;color:#dc2626;margin-bottom:16px">🎯 ข้อมูล Campaign</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">';

  html += '<div style="grid-column:1/-1"><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">🎯 ชื่อ Campaign *</label>'
    +'<input id="cf_name" value="'+(c.name||'')+'" placeholder="เช่น Sandwich 20.- Special" style="'+STY+'font-weight:600"></div>';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">🔖 รหัส Campaign</label>'
    +'<input id="cf_code" value="'+(c.code||'')+'" placeholder="เช่น CAMP-2569-08-001" style="'+STY+'"></div>';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📋 ประเภท</label>'
    +'<select id="cf_type" style="'+STY+'"><option value="">— เลือก —</option>';
  CAMP_TYPES.forEach(function(t){ html += '<option value="'+t+'"'+(c.campType===t?' selected':'')+'>'+t+'</option>'; });
  html += '</select></div>';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📅 วันเริ่มต้น</label>'
    +'<input type="date" id="cf_start" value="'+(c.startDate||'')+'" style="'+STY+'"></div>';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📅 วันสิ้นสุด</label>'
    +'<input type="date" id="cf_end" value="'+(c.endDate||'')+'" style="'+STY+'"></div>';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📊 สถานะ</label>'
    +'<select id="cf_status" style="'+STY+'">';
  CAMP_STATUSES.forEach(function(s){ html += '<option value="'+s.key+'"'+((c.status||'pending')===s.key?' selected':'')+'>'+s.icon+' '+s.label+'</option>'; });
  html += '</select></div>';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">👤 ผู้รับผิดชอบ</label>'
    +'<input id="cf_responsible" value="'+(c.responsible||'')+'" placeholder="ชื่อทีม/บุคคล" style="'+STY+'"></div>';

  // Link to marketing plan
  var plans = data.plans || [];
  html += '<div style="grid-column:1/-1"><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📋 Marketing Plan ที่เกี่ยวข้อง</label>'
    +'<select id="cf_planLink" style="'+STY+'"><option value="">— ไม่เชื่อมโยง —</option>';
  plans.forEach(function(p,pi){ html += '<option value="'+pi+'"'+(c.planLink==pi?' selected':'')+'>'+p.name+'</option>'; });
  html += '</select></div>';

  html += '</div></div>'; // close campaign info

  // === Section: Products ===
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:22px;margin-bottom:16px">'
    +'<div style="font-size:14px;font-weight:800;color:#f97316;margin-bottom:16px">📦 สินค้าที่เข้าร่วม</div>';

  var prods = c.products || [];
  html += '<div id="cf_prodList">';
  if (prods.length > 0) {
    prods.forEach(function(pr, pi) {
      html += _renderProdRow(pi, pr);
    });
  } else {
    html += _renderProdRow(0, {});
  }
  html += '</div>';
  html += '<button onclick="mktCampAddProdRow()" style="margin-top:8px;padding:6px 14px;border:1.5px dashed #e2e8f0;border-radius:8px;background:#fff;font-size:12px;font-weight:600;color:#64748b;cursor:pointer">➕ เพิ่มสินค้า</button>';
  html += '</div>';

  // === Section: Channels & Areas ===
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:22px;margin-bottom:16px">'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">';

  // Channels (checkboxes)
  var selCh = c.channels || [];
  html += '<div><div style="font-size:14px;font-weight:800;color:#16a34a;margin-bottom:12px">👥 กลุ่มลูกค้า / ช่องทาง</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
  CAMP_CHANNELS.forEach(function(ch) {
    var checked = selCh.indexOf(ch) >= 0 ? ' checked' : '';
    html += '<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#475569;cursor:pointer;padding:4px 0">'
      +'<input type="checkbox" class="cf_channel" value="'+ch+'"'+checked+' style="cursor:pointer"> '+ch+'</label>';
  });
  html += '</div></div>';

  // Areas
  var selArea = c.areas || [];
  html += '<div><div style="font-size:14px;font-weight:800;color:#7c3aed;margin-bottom:12px">📍 พื้นที่</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
  CAMP_REGIONS.forEach(function(r) {
    var checked = selArea.indexOf(r) >= 0 ? ' checked' : '';
    html += '<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#475569;cursor:pointer;padding:4px 0">'
      +'<input type="checkbox" class="cf_area" value="'+r+'"'+checked+' style="cursor:pointer"> '+r+'</label>';
  });
  html += '</div>'
    +'<div style="margin-top:8px"><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📍 ลูกค้า/สาขาเฉพาะ</label>'
    +'<input id="cf_branches" value="'+(c.branches||'')+'" placeholder="ระบุสาขา/ลูกค้าเฉพาะ (ถ้ามี)" style="'+STY+'"></div>'
    +'</div>';

  html += '</div></div>'; // close channels & areas

  // === Section: Budget & Target ===
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:22px;margin-bottom:16px">'
    +'<div style="font-size:14px;font-weight:800;color:#2563eb;margin-bottom:16px">💰 งบประมาณ & เป้าหมาย</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">💰 งบประมาณ (฿)</label>'
    +'<input type="number" id="cf_budget" value="'+(c.budget||'')+'" placeholder="0" style="'+STY+'font-weight:700;color:#2563eb"></div>';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">🎯 Target Sales (฿)</label>'
    +'<input type="number" id="cf_target" value="'+(c.targetSales||'')+'" placeholder="0" style="'+STY+'font-weight:700;color:#dc2626"></div>';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📦 จำนวนเป้าหมาย (ชิ้น)</label>'
    +'<input type="number" id="cf_targetQty" value="'+(c.targetQty||'')+'" placeholder="0" style="'+STY+'"></div>';

  html += '</div>';

  // Performance data (edit mode)
  if (isEdit) {
    html += '<div style="border-top:2px solid #e2e8f0;padding-top:16px;margin-top:16px">'
      +'<div style="font-size:13px;font-weight:800;color:#1e293b;margin-bottom:12px">📊 ผลลัพธ์จริง</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:14px">';

    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">💸 ใช้จริง (฿)</label>'
      +'<input type="number" id="cf_actualSpend" value="'+(c.actualSpend||'')+'" placeholder="0" style="'+STY+'font-weight:700;color:#f97316"></div>';

    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📈 ยอดขายจริง (฿)</label>'
      +'<input type="number" id="cf_actualSales" value="'+(c.actualSales||'')+'" placeholder="0" style="'+STY+'font-weight:700;color:#16a34a"></div>';

    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📊 ยอดขายก่อน (฿)</label>'
      +'<input type="number" id="cf_salesBefore" value="'+(c.salesBefore||'')+'" placeholder="0" style="'+STY+'"></div>';

    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📉 ยอดขายหลัง (฿)</label>'
      +'<input type="number" id="cf_salesAfter" value="'+(c.salesAfter||'')+'" placeholder="0" style="'+STY+'"></div>';

    html += '</div></div>';
  }

  html += '</div>'; // close budget section

  // Save/Cancel
  html += '<div style="display:flex;gap:10px">'
    +'<button onclick="mktSaveCamp()" style="padding:10px 28px;border:none;border-radius:10px;background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff;font-size:14px;font-weight:700;cursor:pointer">💾 '+(isEdit?'บันทึกการแก้ไข':'สร้าง Campaign')+'</button>'
    +'<button onclick="_promoView=\'dashboard\';renderMktPromo()" style="padding:10px 20px;border:1.5px solid #e2e8f0;border-radius:10px;background:#fff;color:#64748b;font-size:13px;font-weight:600;cursor:pointer">ยกเลิก</button>'
    +'</div></div>';

  el.innerHTML = html;
}

function _renderProdRow(idx, pr) {
  var STY = 'padding:6px 10px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:12px;width:100%;box-sizing:border-box;';
  return '<div class="cf_prodRow" style="display:grid;grid-template-columns:100px 1fr 90px 90px 70px 90px 90px 32px;gap:6px;margin-bottom:6px;align-items:end">'
    +'<div><div style="font-size:10px;color:#94a3b8;margin-bottom:2px">'+(idx===0?'รหัส':'')+'</div>'
    +'<input class="cf_pCode" value="'+(pr.code||'')+'" placeholder="SKU" style="'+STY+'"></div>'
    +'<div><div style="font-size:10px;color:#94a3b8;margin-bottom:2px">'+(idx===0?'ชื่อสินค้า':'')+'</div>'
    +'<input class="cf_pName" value="'+(pr.name||'')+'" placeholder="ชื่อสินค้า" style="'+STY+'"></div>'
    +'<div><div style="font-size:10px;color:#94a3b8;margin-bottom:2px">'+(idx===0?'ราคาปกติ':'')+'</div>'
    +'<input type="number" class="cf_pPrice" value="'+(pr.price||'')+'" placeholder="0" style="'+STY+'"></div>'
    +'<div><div style="font-size:10px;color:#94a3b8;margin-bottom:2px">'+(idx===0?'ราคาพิเศษ':'')+'</div>'
    +'<input type="number" class="cf_pSpecial" value="'+(pr.specialPrice||'')+'" placeholder="0" style="'+STY+'"></div>'
    +'<div><div style="font-size:10px;color:#94a3b8;margin-bottom:2px">'+(idx===0?'ลด %':'')+'</div>'
    +'<input type="number" class="cf_pDisc" value="'+(pr.discount||'')+'" placeholder="0" style="'+STY+'"></div>'
    +'<div><div style="font-size:10px;color:#94a3b8;margin-bottom:2px">'+(idx===0?'เป้าหมาย':'')+'</div>'
    +'<input type="number" class="cf_pTarget" value="'+(pr.targetQty||'')+'" placeholder="0" style="'+STY+'"></div>'
    +'<div><div style="font-size:10px;color:#94a3b8;margin-bottom:2px">'+(idx===0?'งบ':'')+'</div>'
    +'<input type="number" class="cf_pBudget" value="'+(pr.budget||'')+'" placeholder="0" style="'+STY+'"></div>'
    +'<button onclick="this.parentElement.remove()" style="border:none;background:none;cursor:pointer;font-size:14px;padding:4px" title="ลบ">🗑️</button>'
    +'</div>';
}

window.mktCampAddProdRow = function() {
  var list = document.getElementById('cf_prodList');
  if (!list) return;
  var count = list.querySelectorAll('.cf_prodRow').length;
  var div = document.createElement('div');
  div.innerHTML = _renderProdRow(count, {});
  list.appendChild(div.firstChild);
};

// ─── 2.4 Campaign Detail ───
function _renderCampDetail(el) {
  var data = _loadMktData();
  var camps = data.promos || [];
  var c = camps[window._promoDetailIdx];
  if (!c) { window._promoView = 'dashboard'; renderMktPromo(); return; }

  var st = _getCampStatusObj(c.status);
  var achPct = (c.targetSales||0)>0 ? ((c.actualSales||0)/(c.targetSales)*100) : 0;
  var roi = (c.actualSpend||0)>0 ? ((c.actualSales||0)/(c.actualSpend||1)) : 0;
  var budgetPct = (c.budget||0)>0 ? ((c.actualSpend||0)/(c.budget)*100) : 0;

  var html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_promoView=\'dashboard\';renderMktPromo()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:16px;font-weight:800;color:#1e293b">📊 Campaign Detail</div></div>';

  // Header card
  html += '<div style="background:linear-gradient(135deg,#1e293b,#334155);border-radius:14px;padding:20px 24px;margin-bottom:20px">'
    +'<div style="display:flex;align-items:center;gap:12px">'
    +'<div style="flex:1"><div style="font-size:18px;font-weight:800;color:#fff">'+(c.name||'Campaign')+'</div>'
    +'<div style="font-size:12px;color:#94a3b8;margin-top:4px">'+(c.campType||'')+' · '+(c.channels?c.channels.join(', '):'—')+' · '+(c.responsible||'')+'</div></div>'
    +'<span style="padding:6px 16px;border-radius:12px;font-size:12px;font-weight:700;background:'+st.color+';color:#fff">'+st.icon+' '+st.label+'</span>'
    +'</div></div>';

  // Sales Performance
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:22px;margin-bottom:16px">'
    +'<div style="font-size:14px;font-weight:800;color:#1e293b;margin-bottom:16px">📈 Sales Performance</div>'
    +'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:16px">'
    +'<div style="text-align:center;padding:16px;background:linear-gradient(135deg,#fef2f2,#fecaca);border-radius:12px">'
      +'<div style="font-size:11px;font-weight:700;color:#64748b">Target</div>'
      +'<div style="font-size:22px;font-weight:800;color:#dc2626">฿'+(c.targetSales||0).toLocaleString()+'</div></div>'
    +'<div style="text-align:center;padding:16px;background:linear-gradient(135deg,#f0fdf4,#bbf7d0);border-radius:12px">'
      +'<div style="font-size:11px;font-weight:700;color:#64748b">Actual</div>'
      +'<div style="font-size:22px;font-weight:800;color:#16a34a">฿'+(c.actualSales||0).toLocaleString()+'</div></div>'
    +'<div style="text-align:center;padding:16px;background:linear-gradient(135deg,'+(achPct>=80?'#f0fdf4,#bbf7d0':achPct>=50?'#fffbeb,#fef3c7':'#fef2f2,#fecaca')+';border-radius:12px">'
      +'<div style="font-size:11px;font-weight:700;color:#64748b">Achievement</div>'
      +'<div style="font-size:22px;font-weight:800;color:'+(achPct>=80?'#16a34a':achPct>=50?'#d97706':'#dc2626')+'">'+achPct.toFixed(1)+'%</div></div>'
    +'</div>';

  // Budget & ROI
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:16px">'
    +'<div style="text-align:center;padding:14px;background:#f8fafc;border-radius:10px">'
      +'<div style="font-size:10px;font-weight:700;color:#64748b">Budget</div>'
      +'<div style="font-size:16px;font-weight:800;color:#2563eb">฿'+(c.budget||0).toLocaleString()+'</div></div>'
    +'<div style="text-align:center;padding:14px;background:#f8fafc;border-radius:10px">'
      +'<div style="font-size:10px;font-weight:700;color:#64748b">Actual Spend</div>'
      +'<div style="font-size:16px;font-weight:800;color:#f97316">฿'+(c.actualSpend||0).toLocaleString()+'</div></div>'
    +'<div style="text-align:center;padding:14px;background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:10px">'
      +'<div style="font-size:10px;font-weight:700;color:#64748b">ROI</div>'
      +'<div style="font-size:16px;font-weight:800;color:#2563eb">'+roi.toFixed(1)+'x</div></div>'
    +'</div>';

  // Sales Trend: Before → During → After
  if ((c.salesBefore||0)>0 || (c.actualSales||0)>0 || (c.salesAfter||0)>0) {
    var vals = [c.salesBefore||0, c.actualSales||0, c.salesAfter||0];
    var maxV = Math.max.apply(null, vals) || 1;
    html += '<div style="margin-bottom:16px">'
      +'<div style="font-size:13px;font-weight:800;color:#1e293b;margin-bottom:12px">📊 ยอดขาย: ก่อน → ระหว่าง → หลัง Campaign</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;text-align:center">';
    var labels = ['ก่อน Campaign','ระหว่าง Campaign','หลัง Campaign'];
    var colors = ['#94a3b8','#16a34a','#64748b'];
    vals.forEach(function(v, vi) {
      var h = Math.max(20, (v/maxV)*120);
      html += '<div>'
        +'<div style="display:flex;flex-direction:column;align-items:center">'
        +'<div style="font-size:13px;font-weight:800;color:'+colors[vi]+';margin-bottom:6px">฿'+v.toLocaleString()+'</div>'
        +'<div style="width:60px;background:#e2e8f0;border-radius:8px;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;height:120px">'
        +'<div style="height:'+h+'px;background:'+colors[vi]+';border-radius:8px;transition:height .5s"></div>'
        +'</div>'
        +'<div style="font-size:10px;color:#64748b;margin-top:6px">'+labels[vi]+'</div>'
        +'</div></div>';
    });
    html += '</div></div>';
  }

  // Products
  if (c.products && c.products.length > 0 && c.products[0].name) {
    html += '<div style="margin-top:12px"><div style="font-size:13px;font-weight:800;color:#1e293b;margin-bottom:8px">📦 สินค้าที่เข้าร่วม</div>';
    var PTH = 'padding:7px 10px;font-size:10px;font-weight:700;color:#fff;background:#1e293b;';
    html += '<div style="overflow-x:auto;border-radius:10px;border:1px solid #e2e8f0"><table style="width:100%;border-collapse:collapse;font-size:12px">'
      +'<thead><tr><th style="'+PTH+'text-align:left">สินค้า</th><th style="'+PTH+'text-align:right">ราคาปกติ</th><th style="'+PTH+'text-align:right">ราคาพิเศษ</th><th style="'+PTH+'text-align:right">ลด %</th><th style="'+PTH+'text-align:right">เป้าหมาย</th></tr></thead><tbody>';
    c.products.forEach(function(pr, pi) {
      if (!pr.name) return;
      html += '<tr style="border-bottom:1px solid #f1f5f9;background:'+(pi%2?'#fafafa':'#fff')+'">'
        +'<td style="padding:6px 10px;font-weight:600">'+(pr.code?pr.code+' ':'')+(pr.name||'')+'</td>'
        +'<td style="padding:6px 10px;text-align:right">฿'+(pr.price||0).toLocaleString()+'</td>'
        +'<td style="padding:6px 10px;text-align:right;font-weight:700;color:#dc2626">฿'+(pr.specialPrice||0).toLocaleString()+'</td>'
        +'<td style="padding:6px 10px;text-align:right;color:#f97316">'+(pr.discount||0)+'%</td>'
        +'<td style="padding:6px 10px;text-align:right">'+(pr.targetQty||0).toLocaleString()+'</td>'
        +'</tr>';
    });
    html += '</tbody></table></div></div>';
  }

  html += '</div>'; // close perf card

  // AI Analysis for this campaign
  var aiHtml = '';
  if ((c.actualSales||0)>0) {
    aiHtml = '<div style="background:linear-gradient(135deg,#fef2f2,#ffe4e6);border-radius:14px;padding:18px 22px;border:1px solid #fecaca">'
      +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span style="font-size:18px">🤖</span>'
      +'<span style="font-size:14px;font-weight:800;color:#1e293b">AI Analysis</span></div>';

    aiHtml += '<div style="font-size:12px;color:#1e293b;line-height:1.8">';
    aiHtml += 'Campaign "'+c.name+'" ทำยอดขายได้ <strong>฿'+(c.actualSales||0).toLocaleString()+'</strong> จากเป้าหมาย <strong>฿'+(c.targetSales||0).toLocaleString()+'</strong> คิดเป็น <strong>'+achPct.toFixed(1)+'%</strong><br>';

    if ((c.salesBefore||0) > 0 && (c.actualSales||0) > 0) {
      var uplift = ((c.actualSales - c.salesBefore) / c.salesBefore * 100);
      aiHtml += '<strong>Insight:</strong> ยอดขาย'+(uplift>=0?'เพิ่มขึ้น':'ลดลง')+' <strong>'+Math.abs(uplift).toFixed(1)+'%</strong> ในช่วง Campaign';
      if ((c.salesAfter||0) > 0) {
        var afterChange = ((c.salesAfter - c.salesBefore) / c.salesBefore * 100);
        aiHtml += ' หลัง Campaign ยอดขาย'+(afterChange>=0?'ยังสูงกว่า':'ต่ำกว่า')+'ก่อน Campaign '+ Math.abs(afterChange).toFixed(1)+'%';
      }
      aiHtml += '<br>';
    }

    if (achPct < 80) aiHtml += '<strong>Recommendation:</strong> แนะนำเพิ่มการสื่อสาร Promotion ในพื้นที่ที่ยอดขายต่ำ และผลักดัน SKU ที่มี Conversion สูง';
    else if (achPct >= 100) aiHtml += '<strong>Recommendation:</strong> แคมเปญได้ผลดีมาก ควรทำต่อเนื่องและขยายช่องทาง';
    else aiHtml += '<strong>Recommendation:</strong> ผลใกล้เป้า ควร optimize targeting เพิ่มเพื่อ push ให้ถึง 100%';

    aiHtml += '</div></div>';
  }
  html += aiHtml;

  // Edit button
  html += '<div style="margin-top:16px"><button onclick="_promoEditIdx='+window._promoDetailIdx+';_promoView=\'form\';renderMktPromo()" style="padding:10px 24px;border:none;border-radius:10px;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;font-size:13px;font-weight:700;cursor:pointer">✏️ แก้ไข Campaign</button></div>';

  el.innerHTML = html;
}

// ─── 2.5 Promotion Management ───
function _renderPromoMgmt(el) {
  var data = _loadMktData();
  var promoList = data.promoList || [];

  var html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_promoView=\'dashboard\';renderMktPromo()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b;flex:1">🎁 Promotion Management</div>'
    +'<button onclick="mktAddPromoItem()" style="padding:7px 16px;border:none;border-radius:10px;background:linear-gradient(135deg,#f97316,#fb923c);color:#fff;font-size:12px;font-weight:700;cursor:pointer">➕ เพิ่มโปรโมชัน</button>'
    +'</div>';

  if (promoList.length > 0) {
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px">';
    promoList.forEach(function(pr, i) {
      var isActive = pr.endDate ? new Date(pr.endDate) >= new Date() : true;
      html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;overflow:hidden">'
        +'<div style="background:linear-gradient(135deg,'+(isActive?'#f97316,#fb923c':'#94a3b8,#cbd5e1')+');padding:12px 18px;display:flex;align-items:center;gap:8px">'
        +'<div style="flex:1"><div style="font-size:14px;font-weight:800;color:#fff">🎁 '+pr.name+'</div>'
        +'<div style="font-size:11px;color:rgba(255,255,255,.8)">'+(pr.promoType||'—')+'</div></div>'
        +'<span style="padding:3px 10px;border-radius:10px;font-size:10px;font-weight:700;background:rgba(255,255,255,.2);color:#fff">'+(isActive?'🟢 Active':'⏹️ หมดอายุ')+'</span>'
        +'</div>'
        +'<div style="padding:14px 18px">'
        +'<div style="font-size:12px;color:#475569;margin-bottom:8px">📝 <strong>เงื่อนไข:</strong> '+(pr.condition||'—')+'</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;margin-bottom:10px">'
        +'<div><span style="color:#94a3b8">เริ่ม:</span> <strong>'+(pr.startDate||'—')+'</strong></div>'
        +'<div><span style="color:#94a3b8">สิ้นสุด:</span> <strong>'+(pr.endDate||'—')+'</strong></div>'
        +'<div><span style="color:#94a3b8">ช่องทาง:</span> <strong>'+(pr.channel||'ทั้งหมด')+'</strong></div>'
        +'<div><span style="color:#94a3b8">สาขา:</span> <strong>'+(pr.branch||'ทุกสาขา')+'</strong></div>'
        +'</div>'
        +'<button onclick="mktDeletePromoItem('+i+')" style="padding:4px 12px;border:1.5px solid #fecaca;border-radius:8px;background:#fef2f2;color:#dc2626;font-size:11px;cursor:pointer">🗑️ ลบ</button>'
        +'</div></div>';
    });
    html += '</div>';
  } else {
    html += _emptyState('🎁', 'ยังไม่มีโปรโมชัน', 'เพิ่มโปรโมชัน เช่น ซื้อ 10 แถม 1, ลดราคา, แถมฟรี');
  }

  el.innerHTML = html;
}

// ─── 2.6 Campaign Calendar ───
function _renderCampCalendar(el) {
  var data = _loadMktData();
  var camps = data.promos || [];
  camps.forEach(function(c){ c.status = _autoCampStatus(c); });

  var html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_promoView=\'dashboard\';renderMktPromo()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b">📅 Campaign Calendar</div></div>';

  if (camps.length === 0) {
    html += _emptyState('📅', 'ยังไม่มี Campaign', 'สร้าง Campaign แล้วมาดูปฏิทินได้');
    el.innerHTML = html;
    return;
  }

  // Group by month
  var monthMap = {};
  camps.forEach(function(c, ci) {
    var d = c.startDate ? new Date(c.startDate) : null;
    var mKey = d ? (d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')) : 'no-date';
    if (!monthMap[mKey]) monthMap[mKey] = [];
    monthMap[mKey].push({c:c, idx:ci});
  });

  var months = Object.keys(monthMap).sort();
  months.forEach(function(mKey) {
    var label = mKey === 'no-date' ? 'ไม่ระบุวันที่' : (function() {
      var parts = mKey.split('-');
      return MTH[parseInt(parts[1])] + ' ' + (parseInt(parts[0])+543);
    })();

    html += '<div style="margin-bottom:20px">'
      +'<div style="font-size:14px;font-weight:800;color:#1e293b;margin-bottom:10px;padding:8px 14px;background:#f8fafc;border-radius:10px;border-left:4px solid #dc2626">📅 '+label+'</div>';

    monthMap[mKey].forEach(function(item) {
      var c = item.c;
      var st = _getCampStatusObj(c.status);
      var startStr = c.startDate ? new Date(c.startDate).toLocaleDateString('th-TH',{day:'2-digit',month:'short'}) : '—';
      var endStr = c.endDate ? new Date(c.endDate).toLocaleDateString('th-TH',{day:'2-digit',month:'short'}) : '—';

      html += '<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;background:#fff;border:1px solid #e2e8f0;margin-bottom:6px;cursor:pointer" onclick="_promoDetailIdx='+item.idx+';_promoView=\'detail\';renderMktPromo()">'
        +'<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:'+st.color+'"></span>'
        +'<div style="font-size:12px;color:#64748b;min-width:120px">'+startStr+' ~ '+endStr+'</div>'
        +'<div style="flex:1;font-size:13px;font-weight:600;color:#1e293b">'+(c.name||'—')+'</div>'
        +'<span style="padding:2px 8px;border-radius:8px;font-size:10px;font-weight:600;background:#f1f5f9;color:#475569">'+(c.campType||'')+'</span>'
        +'<span style="font-size:12px;font-weight:700;color:#2563eb">฿'+(c.budget||0).toLocaleString()+'</span>'
        +'</div>';
    });
    html += '</div>';
  });

  el.innerHTML = html;
}

// ─── Save Campaign ───
window.mktSaveCamp = function() {
  var nameEl = document.getElementById('cf_name');
  if (!nameEl || !nameEl.value.trim()) { alert('กรุณากรอกชื่อ Campaign'); return; }

  var data = _loadMktData();
  if (!data.promos) data.promos = [];
  var c = window._promoEditIdx >= 0 && data.promos[window._promoEditIdx] ? data.promos[window._promoEditIdx] : {};

  c.name = nameEl.value.trim();
  c.code = (document.getElementById('cf_code')||{}).value || '';
  c.campType = (document.getElementById('cf_type')||{}).value || '';
  c.startDate = (document.getElementById('cf_start')||{}).value || '';
  c.endDate = (document.getElementById('cf_end')||{}).value || '';
  c.status = (document.getElementById('cf_status')||{}).value || 'pending';
  c.responsible = (document.getElementById('cf_responsible')||{}).value || '';
  c.planLink = (document.getElementById('cf_planLink')||{}).value || '';
  c.budget = parseFloat((document.getElementById('cf_budget')||{}).value) || 0;
  c.targetSales = parseFloat((document.getElementById('cf_target')||{}).value) || 0;
  c.targetQty = parseInt((document.getElementById('cf_targetQty')||{}).value) || 0;
  c.branches = (document.getElementById('cf_branches')||{}).value || '';

  // Channels
  c.channels = [];
  document.querySelectorAll('.cf_channel:checked').forEach(function(cb){ c.channels.push(cb.value); });
  c.channel = c.channels.join(', ');

  // Areas
  c.areas = [];
  document.querySelectorAll('.cf_area:checked').forEach(function(cb){ c.areas.push(cb.value); });

  // Products
  c.products = [];
  document.querySelectorAll('.cf_prodRow').forEach(function(row) {
    var pr = {
      code: (row.querySelector('.cf_pCode')||{}).value || '',
      name: (row.querySelector('.cf_pName')||{}).value || '',
      price: parseFloat((row.querySelector('.cf_pPrice')||{}).value) || 0,
      specialPrice: parseFloat((row.querySelector('.cf_pSpecial')||{}).value) || 0,
      discount: parseFloat((row.querySelector('.cf_pDisc')||{}).value) || 0,
      targetQty: parseInt((row.querySelector('.cf_pTarget')||{}).value) || 0,
      budget: parseFloat((row.querySelector('.cf_pBudget')||{}).value) || 0
    };
    if (pr.name || pr.code) c.products.push(pr);
  });

  // Performance (edit mode)
  var asEl = document.getElementById('cf_actualSpend');
  if (asEl) c.actualSpend = parseFloat(asEl.value) || 0;
  var acEl = document.getElementById('cf_actualSales');
  if (acEl) c.actualSales = parseFloat(acEl.value) || 0;
  var sbEl = document.getElementById('cf_salesBefore');
  if (sbEl) c.salesBefore = parseFloat(sbEl.value) || 0;
  var saEl = document.getElementById('cf_salesAfter');
  if (saEl) c.salesAfter = parseFloat(saEl.value) || 0;

  // For backward compat
  c.revenue = c.actualSales;

  c.status = _autoCampStatus(c);

  if (window._promoEditIdx < 0) {
    data.promos.push(c);
  } else {
    data.promos[window._promoEditIdx] = c;
  }

  _saveMktData(data);
  window._promoView = 'dashboard';
  renderMktPromo();
};

window.mktAddPromo = function() {
  window._promoEditIdx = -1;
  window._promoView = 'form';
  renderMktPromo();
};

window.mktEditPromo = function(i) {
  window._promoEditIdx = i;
  window._promoView = 'form';
  renderMktPromo();
};

window.mktCampStatus = function(i) {
  var data = _loadMktData();
  var c = data.promos[i]; if (!c) return;
  var keys = CAMP_STATUSES.map(function(s){return s.key;});
  var curr = keys.indexOf(c.status);
  c.status = keys[(curr + 1) % keys.length];
  _saveMktData(data);
  renderMktPromo();
};

window.mktDeletePromo = function(i) {
  if (!confirm('ลบ Campaign นี้?')) return;
  var data = _loadMktData();
  data.promos.splice(i, 1);
  _saveMktData(data);
  renderMktPromo();
};

window.mktAddPromoItem = function() {
  var name = prompt('ชื่อโปรโมชัน:');
  if (!name) return;
  var promoType = prompt('ประเภท (ซื้อ X แถม Y / ลดราคา / Discount % / Free Gift / Clearance / เฉพาะสาขา):') || '';
  var condition = prompt('เงื่อนไข:') || '';
  var startDate = prompt('วันเริ่ม (yyyy-mm-dd):') || '';
  var endDate = prompt('วันสิ้นสุด (yyyy-mm-dd):') || '';
  var channel = prompt('ช่องทาง:') || 'ทั้งหมด';
  var branch = prompt('สาขา (ถ้าเฉพาะสาขา):') || 'ทุกสาขา';
  var data = _loadMktData();
  if (!data.promoList) data.promoList = [];
  data.promoList.push({name:name, promoType:promoType, condition:condition, startDate:startDate, endDate:endDate, channel:channel, branch:branch});
  _saveMktData(data);
  renderMktPromo();
};

window.mktDeletePromoItem = function(i) {
  if (!confirm('ลบโปรโมชันนี้?')) return;
  var data = _loadMktData();
  data.promoList.splice(i, 1);
  _saveMktData(data);
  renderMktPromo();
};

// ── 3. Social Media (Multi-page, Monthly tracking) ──
var SOCIAL_PLATFORMS = [
  {key:'facebook', icon:'📘', name:'Facebook', color:'#1877f2', bg:'linear-gradient(135deg,#eff6ff,#dbeafe)',
   metrics:[
     {k:'followers',l:'ผู้ติดตาม',icon:'👥'},
     {k:'reach',l:'การเข้าถึง',icon:'📡'},
     {k:'posts',l:'โพสต์',icon:'📝'},
     {k:'engage',l:'Engagement',icon:'💬'},
     {k:'likes',l:'ถูกใจเพจ',icon:'👍'},
     {k:'shares',l:'แชร์',icon:'🔄'},
     {k:'clicks',l:'คลิกลิงก์',icon:'🔗'},
     {k:'videoViews',l:'วิวคลิป',icon:'🎬'}
   ],
   apiInfo:'Facebook Graph API — ต้องมี Page Access Token จาก developers.facebook.com',
   apiUrl:'https://developers.facebook.com/apps/'},
  {key:'line', icon:'💚', name:'Line OA', color:'#06c755', bg:'linear-gradient(135deg,#f0fdf4,#bbf7d0)',
   metrics:[
     {k:'friends',l:'เพื่อน',icon:'👥'},
     {k:'targetReach',l:'กลุ่มเป้าหมาย',icon:'🎯'},
     {k:'messages',l:'ข้อความส่ง',icon:'💬'},
     {k:'msgOpen',l:'เปิดอ่าน',icon:'📖'},
     {k:'msgClick',l:'คลิกลิงก์',icon:'🔗'},
     {k:'blocks',l:'บล็อก',icon:'🚫'},
     {k:'reach',l:'การเข้าถึง',icon:'📡'},
     {k:'coupons',l:'คูปองใช้',icon:'🎟️'}
   ],
   apiInfo:'LINE Messaging API — ต้องมี Channel Access Token จาก manager.line.biz',
   apiUrl:'https://manager.line.biz/'},
  {key:'tiktok', icon:'🎵', name:'TikTok', color:'#1e293b', bg:'linear-gradient(135deg,#f8fafc,#e2e8f0)',
   metrics:[
     {k:'followers',l:'ผู้ติดตาม',icon:'👥'},
     {k:'views',l:'ยอดวิว',icon:'👁️'},
     {k:'likes',l:'ถูกใจ',icon:'❤️'},
     {k:'comments',l:'คอมเมนต์',icon:'💬'},
     {k:'shares',l:'แชร์',icon:'🔄'},
     {k:'clips',l:'คลิปโพสต์',icon:'🎬'},
     {k:'avgWatch',l:'เวลาดูเฉลี่ย(วิ)',icon:'⏱️'},
     {k:'profileViews',l:'เข้าชมโปรไฟล์',icon:'📊'}
   ],
   apiInfo:'TikTok Business API — ต้องมี Access Token จาก TikTok for Business',
   apiUrl:'https://business.tiktok.com/'},
  {key:'instagram', icon:'📸', name:'Instagram', color:'#e4405f', bg:'linear-gradient(135deg,#fef2f2,#fecaca)',
   metrics:[
     {k:'followers',l:'ผู้ติดตาม',icon:'👥'},
     {k:'reach',l:'การเข้าถึง',icon:'📡'},
     {k:'impressions',l:'Impressions',icon:'👁️'},
     {k:'posts',l:'โพสต์',icon:'📝'},
     {k:'stories',l:'Stories',icon:'📱'},
     {k:'reels',l:'Reels วิว',icon:'🎬'},
     {k:'engage',l:'Engagement',icon:'💬'},
     {k:'saves',l:'บันทึก',icon:'🔖'}
   ],
   apiInfo:'Instagram Graph API (ผ่าน Facebook) — ใช้ Page Access Token เดียวกับ Facebook',
   apiUrl:'https://developers.facebook.com/apps/'},
  {key:'youtube', icon:'🔴', name:'YouTube', color:'#ff0000', bg:'linear-gradient(135deg,#fef2f2,#fee2e2)',
   metrics:[
     {k:'subscribers',l:'ผู้ติดตาม',icon:'👥'},
     {k:'views',l:'ยอดวิว',icon:'👁️'},
     {k:'watchTime',l:'ชม.ดู(นาที)',icon:'⏱️'},
     {k:'videos',l:'วิดีโอใหม่',icon:'🎬'},
     {k:'likes',l:'ถูกใจ',icon:'👍'},
     {k:'comments',l:'คอมเมนต์',icon:'💬'},
     {k:'shares',l:'แชร์',icon:'🔄'},
     {k:'ctr',l:'CTR %',icon:'📊'}
   ],
   apiInfo:'YouTube Data API v3 — ต้องมี API Key จาก Google Cloud Console',
   apiUrl:'https://console.cloud.google.com/'},
  {key:'shopee', icon:'🟠', name:'Shopee', color:'#ee4d2d', bg:'linear-gradient(135deg,#fff7ed,#fed7aa)',
   metrics:[
     {k:'followers',l:'ผู้ติดตาม',icon:'👥'},
     {k:'visitors',l:'ผู้เข้าชม',icon:'👁️'},
     {k:'orders',l:'ออเดอร์',icon:'📦'},
     {k:'revenue',l:'รายได้',icon:'💰'},
     {k:'chatResponse',l:'ตอบแชท %',icon:'💬'},
     {k:'rating',l:'เรตติ้ง',icon:'⭐'},
     {k:'returns',l:'คืนสินค้า',icon:'↩️'},
     {k:'adsSpend',l:'ค่าโฆษณา',icon:'📊'}
   ],
   apiInfo:'Shopee Open Platform — ต้องลงทะเบียน Partner ที่ open.shopee.com',
   apiUrl:'https://open.shopee.com/'},
  {key:'lazada', icon:'🔵', name:'Lazada', color:'#0f1573', bg:'linear-gradient(135deg,#eff6ff,#c7d2fe)',
   metrics:[
     {k:'followers',l:'ผู้ติดตาม',icon:'👥'},
     {k:'visitors',l:'ผู้เข้าชม',icon:'👁️'},
     {k:'orders',l:'ออเดอร์',icon:'📦'},
     {k:'revenue',l:'รายได้',icon:'💰'},
     {k:'chatResponse',l:'ตอบแชท %',icon:'💬'},
     {k:'rating',l:'เรตติ้ง',icon:'⭐'},
     {k:'returns',l:'คืนสินค้า',icon:'↩️'},
     {k:'adsSpend',l:'ค่าโฆษณา',icon:'📊'}
   ],
   apiInfo:'Lazada Open Platform — ต้องลงทะเบียนที่ open.lazada.com',
   apiUrl:'https://open.lazada.com/'}
];

window._socialView = 'dashboard';
window._socialEditPlatform = '';
window._socialEditPage = '';
window._socialEditMonth = '';
window._getCurrentMonth = null; // set below
window.renderMktSocial = null; // set below

var OL_SHOPS_MAP = {
  'Facebook':'facebook','Lazada':'lazada','Shopee':'shopee','Shoppee':'shopee',
  'Tiktok':'tiktok','IG':'instagram','LINE':'line','Threads':'threads',
  'G-mail':'gmail'
};

function _syncFromOlShops(allData) {
  if (typeof window.OL_SHOPS_RAW === 'undefined') {
    // Try to read from the rendered OL_SHOPS in app.js
    // OL_SHOPS is inside renderOlShops() closure, so we extract from the known array
    return;
  }
}

function _getLinkedShops(platformKey) {
  // Read OL_SHOPS from app.js (exposed via window)
  var shops = window._OL_SHOPS_LIST || [];
  return shops.filter(function(s) {
    return OL_SHOPS_MAP[s.ch] === platformKey;
  });
}

function _getSocialData() {
  var data = _loadMktData();
  if (!data.socialV2) data.socialV2 = {};
  return data;
}

function _saveSocialPages(socialV2) {
  var data = _loadMktData();
  data.socialV2 = socialV2;
  _saveMktData(data);
}

function _getPages(socialV2, platformKey) {
  if (!socialV2[platformKey]) socialV2[platformKey] = {pages:[]};
  return socialV2[platformKey].pages || [];
}

function _getCurrentMonth() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
}

function _monthLabel(ym) {
  if (!ym) return '—';
  var parts = ym.split('-');
  return MTH[parseInt(parts[1])] + ' ' + (parseInt(parts[0])+543);
}

function _sumPagesMetric(socialV2, platformKey, metricKey, month) {
  var pages = _getPages(socialV2, platformKey);
  var total = 0;
  pages.forEach(function(pg) {
    if (month) {
      var rec = (pg.monthly || []).find(function(m){ return m.month === month; });
      if (rec) total += (rec[metricKey] || 0);
    } else {
      var latest = (pg.monthly || []).sort(function(a,b){ return b.month.localeCompare(a.month); })[0];
      if (latest) total += (latest[metricKey] || 0);
    }
  });
  return total;
}

function renderMktSocial() {
  var el = document.getElementById('mktSocialContent');
  if (!el) return;

  switch(window._socialView) {
    case 'dashboard': _renderSocialDashboard(el); break;
    case 'form':      _renderSocialForm(el); break;
    case 'history':   _renderSocialHistory(el); break;
    case 'api':       _renderSocialApi(el); break;
    default:          _renderSocialDashboard(el);
  }
}

function _renderSocialDashboard(el) {
  var allData = _getSocialData();
  var sv2 = allData.socialV2 || {};
  var curMonth = _getCurrentMonth();

  // Migrate old data if exists
  if (allData.social && !allData._socialMigrated) {
    _migrateSocialV1(allData);
  }

  // Auto-sync pages from OL_SHOPS (ข้อมูลร้านค้า)
  _autoSyncOlShops(sv2);

  var toolbar = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap">'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b;flex:1">📱 Social Media Dashboard</div>'
    +'<button onclick="mktSocialSyncShops()" style="padding:7px 16px;border:1.5px solid #16a34a;border-radius:10px;background:#fff;color:#16a34a;font-size:12px;font-weight:700;cursor:pointer">🔄 ซิงค์จากร้านค้า</button>'
    +'<button onclick="window._socialView=\'api\';renderMktSocial()" style="padding:7px 16px;border:1.5px solid #7c3aed;border-radius:10px;background:#fff;color:#7c3aed;font-size:12px;font-weight:700;cursor:pointer">🔗 เชื่อม API</button>'
    +'<button onclick="window._socialView=\'history\';renderMktSocial()" style="padding:7px 16px;border:1.5px solid #2563eb;border-radius:10px;background:#fff;color:#2563eb;font-size:12px;font-weight:700;cursor:pointer">📈 ดูย้อนหลัง</button>'
    +'</div>';

  // Summary cards across all platforms
  var totalFollowers = 0, totalReach = 0, totalPages = 0, activePlatforms = 0;
  var totalLinkedShops = 0;
  SOCIAL_PLATFORMS.forEach(function(pl) {
    var pages = _getPages(sv2, pl.key);
    totalPages += pages.length;
    if (pages.length > 0) activePlatforms++;
    totalFollowers += _sumPagesMetric(sv2, pl.key, pl.metrics[0].k, '');
    totalReach += _sumPagesMetric(sv2, pl.key, pl.key==='line'?'friends':'reach', '');
    totalLinkedShops += _getLinkedShops(pl.key).length;
  });

  var summary = '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:20px">'
    + _card('📱', 'แพลตฟอร์ม', activePlatforms + '/' + SOCIAL_PLATFORMS.length, 'ใช้งาน', '#7c3aed', 'linear-gradient(135deg,#faf5ff,#e9d5ff)')
    + _card('📄', 'เพจ/บัญชี', totalPages, 'ติดตามข้อมูล', '#2563eb', 'linear-gradient(135deg,#eff6ff,#dbeafe)')
    + _card('🏪', 'เชื่อมร้านค้า', totalLinkedShops, 'จากข้อมูลร้านค้า', '#0891b2', 'linear-gradient(135deg,#ecfeff,#a5f3fc)')
    + _card('👥', 'ผู้ติดตามรวม', totalFollowers.toLocaleString(), 'คน', '#16a34a', 'linear-gradient(135deg,#f0fdf4,#bbf7d0)')
    + _card('📡', 'Reach/เพื่อน', totalReach.toLocaleString(), 'เดือนล่าสุด', '#f97316', 'linear-gradient(135deg,#fff7ed,#fed7aa)')
    +'</div>';

  // Platform cards
  var platformCards = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:16px">';
  SOCIAL_PLATFORMS.forEach(function(pl) {
    var pages = _getPages(sv2, pl.key);
    var linkedShops = _getLinkedShops(pl.key);
    var shopCount = linkedShops.length;

    platformCards += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;overflow:hidden">'
      +'<div style="background:'+pl.bg+';padding:14px 18px;display:flex;align-items:center;gap:10px">'
        +'<div style="font-size:28px">'+pl.icon+'</div>'
        +'<div style="flex:1"><div style="font-size:15px;font-weight:800;color:'+pl.color+'">'+pl.name+'</div>'
        +'<div style="font-size:11px;color:#64748b">'+pages.length+' เพจติดตาม'+(shopCount?' · 🏪 '+shopCount+' ร้านค้าเชื่อม':'')+'</div></div>'
        +'<button onclick="mktSocialAddPage(\''+pl.key+'\')" style="border:none;background:'+pl.color+';color:#fff;border-radius:8px;padding:5px 12px;font-size:11px;font-weight:700;cursor:pointer">+ เพิ่มเพจ</button>'
      +'</div>';

    // Linked shops section
    if (shopCount > 0) {
      platformCards += '<div style="padding:10px 16px;background:linear-gradient(90deg,'+pl.bg+',#fff);border-bottom:1px solid #f1f5f9">'
        +'<div style="font-size:10px;font-weight:700;color:#64748b;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">🏪 ร้านค้าเชื่อมต่อ (จากแท็บออนไลน์)</div>'
        +'<div style="display:flex;flex-wrap:wrap;gap:6px">';
      linkedShops.forEach(function(s) {
        var hasLink = s.link && s.link.length > 5;
        platformCards += '<div style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:16px;background:#fff;border:1px solid #e2e8f0;font-size:11px">'
          +'<span style="font-weight:600;color:#1e293b;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+s.name+'</span>';
        if (hasLink) {
          platformCards += '<a href="'+s.link+'" target="_blank" rel="noopener" style="color:'+pl.color+';text-decoration:none;font-weight:700" title="เปิดหน้าร้าน">↗</a>';
        }
        platformCards += '</div>';
      });
      platformCards += '</div></div>';
    }

    if (pages.length === 0 && shopCount === 0) {
      platformCards += '<div style="padding:24px;text-align:center;color:#94a3b8;font-size:12px">ยังไม่มีเพจ — กด "+ เพิ่มเพจ" หรือ "🔄 ซิงค์จากร้านค้า"</div>';
    } else if (pages.length === 0 && shopCount > 0) {
      platformCards += '<div style="padding:16px;text-align:center;color:#94a3b8;font-size:12px">มีร้านค้าเชื่อมแล้ว — กด "🔄 ซิงค์จากร้านค้า" เพื่อสร้างเพจติดตามข้อมูลอัตโนมัติ</div>';
    } else {
      platformCards += '<div style="padding:12px 16px">';
      pages.forEach(function(pg, pi) {
        var latest = (pg.monthly || []).sort(function(a,b){ return b.month.localeCompare(a.month); })[0] || {};
        var m1 = pl.metrics[0]; var m2 = pl.metrics[1];
        var v1 = latest[m1.k] || 0;
        var v2 = latest[m2.k] || 0;
        // Find matching shop link
        var shopLink = '';
        if (pg.shopLink) shopLink = pg.shopLink;
        else {
          var matchShop = linkedShops.find(function(s){ return s.name === pg.name; });
          if (matchShop && matchShop.link) shopLink = matchShop.link;
        }
        platformCards += '<div style="padding:10px 12px;border-radius:10px;background:#f8fafc;margin-bottom:8px;display:flex;align-items:center;gap:10px">'
          +'<div style="flex:1">'
            +'<div style="display:flex;align-items:center;gap:6px">'
              +'<span style="font-size:13px;font-weight:700;color:#1e293b">'+pg.name+'</span>'
              +(shopLink ? '<a href="'+shopLink+'" target="_blank" rel="noopener" style="font-size:10px;color:'+pl.color+';text-decoration:none;font-weight:700;padding:1px 6px;border-radius:6px;background:'+pl.bg+'" title="เปิดหน้าร้าน">🏪 เปิด ↗</a>' : '')
            +'</div>'
            +'<div style="font-size:11px;color:#94a3b8;margin-top:2px">'
              +m1.icon+' '+m1.l+': <strong style="color:'+pl.color+'">'+v1.toLocaleString()+'</strong>'
              +' &nbsp;·&nbsp; '+m2.icon+' '+m2.l+': <strong style="color:'+pl.color+'">'+v2.toLocaleString()+'</strong>'
            +'</div>'
            +(latest.month ? '<div style="font-size:10px;color:#cbd5e1;margin-top:2px">ข้อมูลล่าสุด: '+_monthLabel(latest.month)+'</div>' : '')
          +'</div>'
          +'<button onclick="window._socialEditPlatform=\''+pl.key+'\';window._socialEditPage=\''+pg.id+'\';window._socialEditMonth=_getCurrentMonth();window._socialView=\'form\';renderMktSocial()" style="border:none;background:'+pl.color+';color:#fff;border-radius:8px;padding:5px 12px;font-size:11px;font-weight:600;cursor:pointer">📝 กรอกข้อมูล</button>'
          +'<button onclick="mktSocialDeletePage(\''+pl.key+'\','+pi+')" style="border:none;background:none;cursor:pointer;font-size:14px" title="ลบเพจ">🗑️</button>'
          +'</div>';
      });
      platformCards += '</div>';
    }
    platformCards += '</div>';
  });
  platformCards += '</div>';

  el.innerHTML = toolbar + summary + platformCards;
}

function _autoSyncOlShops(sv2) {
  var shops = window._OL_SHOPS_LIST || [];
  if (shops.length === 0) return;
  // Auto-create pages for shops that don't have a matching page yet
  // Only on first load (check flag)
  var data = _loadMktData();
  if (data._olShopsSynced) return;
  _doSyncOlShops(sv2, shops, false);
  data._olShopsSynced = true;
  data.socialV2 = sv2;
  _saveMktData(data);
}

function _doSyncOlShops(sv2, shops, force) {
  var added = 0;
  shops.forEach(function(s) {
    var platKey = OL_SHOPS_MAP[s.ch];
    if (!platKey) return;
    // Check platform exists in SOCIAL_PLATFORMS
    if (!SOCIAL_PLATFORMS.find(function(p){ return p.key === platKey; })) return;
    if (!sv2[platKey]) sv2[platKey] = {pages:[]};
    // Check if page with same name already exists
    var exists = sv2[platKey].pages.find(function(pg){ return pg.name === s.name; });
    if (exists) {
      // Update link if missing
      if (!exists.shopLink && s.link) exists.shopLink = s.link;
      return;
    }
    // Create new page
    sv2[platKey].pages.push({
      id: Date.now() + '_' + platKey + '_' + added,
      name: s.name,
      shopLink: s.link || '',
      shopUser: s.user || '',
      monthly: []
    });
    added++;
  });
  return added;
}

function _migrateSocialV1(allData) {
  var old = allData.social;
  if (!allData.socialV2) allData.socialV2 = {};
  var curMonth = _getCurrentMonth();
  ['facebook','line','tiktok'].forEach(function(key) {
    if (old[key] && Object.keys(old[key]).some(function(k){ return old[key][k] > 0; })) {
      if (!allData.socialV2[key]) allData.socialV2[key] = {pages:[]};
      if (allData.socialV2[key].pages.length === 0) {
        var pg = {id: Date.now()+'_'+key, name: key==='facebook'?'Facebook หลัก':key==='line'?'Line OA หลัก':'TikTok หลัก', monthly:[Object.assign({month:curMonth}, old[key])]};
        allData.socialV2[key].pages.push(pg);
      }
    }
  });
  allData._socialMigrated = true;
  _saveMktData(allData);
}

function _renderSocialForm(el) {
  var allData = _getSocialData();
  var sv2 = allData.socialV2 || {};
  var pl = SOCIAL_PLATFORMS.find(function(p){ return p.key === window._socialEditPlatform; });
  if (!pl) { window._socialView = 'dashboard'; renderMktSocial(); return; }

  var pages = _getPages(sv2, pl.key);
  var page = pages.find(function(pg){ return pg.id === window._socialEditPage; });
  if (!page) { window._socialView = 'dashboard'; renderMktSocial(); return; }

  var month = window._socialEditMonth || _getCurrentMonth();
  var existing = (page.monthly || []).find(function(m){ return m.month === month; }) || {};

  var STY = 'padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;width:100%;box-sizing:border-box;';

  var html = '<div style="max-width:800px;margin:0 auto">'
    +'<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
      +'<button onclick="window._socialView=\'dashboard\';renderMktSocial()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
      +'<div style="font-size:16px;font-weight:800;color:'+pl.color+'">'+pl.icon+' '+pl.name+' — '+page.name+'</div>'
    +'</div>';

  // Month selector
  html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap">'
    +'<label style="font-size:13px;font-weight:700;color:#1e293b">📅 เดือน:</label>'
    +'<input type="month" id="socialFormMonth" value="'+month+'" onchange="window._socialEditMonth=this.value;renderMktSocial()" style="'+STY+'width:200px;cursor:pointer">';

  // Quick month buttons
  var cm = _getCurrentMonth();
  var prevM = new Date(); prevM.setMonth(prevM.getMonth()-1);
  var pmStr = prevM.getFullYear()+'-'+String(prevM.getMonth()+1).padStart(2,'0');
  html += '<button onclick="document.getElementById(\'socialFormMonth\').value=\''+cm+'\';window._socialEditMonth=\''+cm+'\';renderMktSocial()" style="padding:4px 10px;border:1px solid #e2e8f0;border-radius:6px;background:'+(month===cm?'#2563eb':'#fff')+';color:'+(month===cm?'#fff':'#475569')+';font-size:11px;cursor:pointer;font-weight:600">เดือนนี้</button>'
    +'<button onclick="document.getElementById(\'socialFormMonth\').value=\''+pmStr+'\';window._socialEditMonth=\''+pmStr+'\';renderMktSocial()" style="padding:4px 10px;border:1px solid #e2e8f0;border-radius:6px;background:'+(month===pmStr?'#2563eb':'#fff')+';color:'+(month===pmStr?'#fff':'#475569')+';font-size:11px;cursor:pointer;font-weight:600">เดือนที่แล้ว</button>'
    +'</div>';

  // Metrics form
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:20px">'
    +'<div style="font-size:14px;font-weight:800;color:#1e293b;margin-bottom:16px">📊 ข้อมูลประจำ '+_monthLabel(month)+'</div>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px">';

  pl.metrics.forEach(function(m) {
    var val = existing[m.k] || '';
    html += '<div>'
      +'<label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">'+m.icon+' '+m.l+'</label>'
      +'<input type="number" data-social-metric="'+m.k+'" value="'+val+'" placeholder="0" style="'+STY+'font-weight:700;color:'+pl.color+'">'
      +'</div>';
  });

  html += '</div>';

  // Notes
  html += '<div style="margin-top:16px">'
    +'<label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📝 หมายเหตุ</label>'
    +'<textarea id="socialFormNotes" rows="2" placeholder="บันทึกเพิ่มเติม เช่น แคมเปญที่รัน, โปรโมชั่น ฯลฯ" style="'+STY+'resize:vertical">'+(existing.notes||'')+'</textarea>'
    +'</div>';

  // Save button
  html += '<div style="margin-top:18px;display:flex;gap:10px">'
    +'<button onclick="mktSocialSaveForm()" style="padding:10px 28px;border:none;border-radius:10px;background:linear-gradient(135deg,'+pl.color+','+pl.color+'cc);color:#fff;font-size:14px;font-weight:700;cursor:pointer">💾 บันทึก</button>'
    +'<button onclick="window._socialView=\'dashboard\';renderMktSocial()" style="padding:10px 20px;border:1.5px solid #e2e8f0;border-radius:10px;background:#fff;color:#64748b;font-size:13px;font-weight:600;cursor:pointer">ยกเลิก</button>'
    +'</div></div>';

  // Show previous months data
  var history = (page.monthly || []).filter(function(m){ return m.month !== month; }).sort(function(a,b){ return b.month.localeCompare(a.month); });
  if (history.length > 0) {
    html += '<div style="margin-top:24px"><div style="font-size:14px;font-weight:800;color:#1e293b;margin-bottom:12px">📅 ข้อมูลเดือนก่อนหน้า</div>';
    html += '<div style="overflow-x:auto;border-radius:12px;border:1px solid #e2e8f0"><table style="width:100%;border-collapse:collapse;font-size:12px">';
    html += '<thead><tr><th style="padding:8px 10px;background:#1e293b;color:#fff;font-size:11px;text-align:left">เดือน</th>';
    pl.metrics.forEach(function(m) {
      html += '<th style="padding:8px 10px;background:#1e293b;color:#fff;font-size:11px;text-align:right">'+m.l+'</th>';
    });
    html += '</tr></thead><tbody>';
    history.slice(0, 6).forEach(function(rec, ri) {
      html += '<tr style="border-bottom:1px solid #f1f5f9;background:'+(ri%2?'#fafafa':'#fff')+'">'
        +'<td style="padding:6px 10px;font-weight:600;color:'+pl.color+'">'+_monthLabel(rec.month)+'</td>';
      pl.metrics.forEach(function(m) {
        html += '<td style="padding:6px 10px;text-align:right;font-weight:600">'+(rec[m.k]||0).toLocaleString()+'</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table></div></div>';
  }

  html += '</div>';
  el.innerHTML = html;
}

function _renderSocialHistory(el) {
  var allData = _getSocialData();
  var sv2 = allData.socialV2 || {};

  var html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="window._socialView=\'dashboard\';renderMktSocial()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b">📈 ข้อมูลย้อนหลังทุกแพลตฟอร์ม</div>'
    +'</div>';

  SOCIAL_PLATFORMS.forEach(function(pl) {
    var pages = _getPages(sv2, pl.key);
    if (pages.length === 0) return;

    html += '<div style="margin-bottom:24px">'
      +'<div style="font-size:15px;font-weight:800;color:'+pl.color+';margin-bottom:10px">'+pl.icon+' '+pl.name+'</div>';

    pages.forEach(function(pg) {
      var records = (pg.monthly || []).sort(function(a,b){ return b.month.localeCompare(a.month); });
      if (records.length === 0) return;

      html += '<div style="margin-bottom:14px;font-size:13px;font-weight:700;color:#475569">📄 '+pg.name+'</div>';
      html += '<div style="overflow-x:auto;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:16px"><table style="width:100%;border-collapse:collapse;font-size:12px">';
      html += '<thead><tr><th style="padding:8px 10px;background:'+pl.color+';color:#fff;font-size:11px;text-align:left">เดือน</th>';
      pl.metrics.forEach(function(m) {
        html += '<th style="padding:8px 10px;background:'+pl.color+';color:#fff;font-size:11px;text-align:right">'+m.icon+' '+m.l+'</th>';
      });
      html += '<th style="padding:8px 10px;background:'+pl.color+';color:#fff;font-size:11px;text-align:left">หมายเหตุ</th>';
      html += '</tr></thead><tbody>';
      records.forEach(function(rec, ri) {
        html += '<tr style="border-bottom:1px solid #f1f5f9;background:'+(ri%2?'#fafafa':'#fff')+'">'
          +'<td style="padding:6px 10px;font-weight:700;color:'+pl.color+'">'+_monthLabel(rec.month)+'</td>';
        pl.metrics.forEach(function(m) {
          var val = rec[m.k] || 0;
          html += '<td style="padding:6px 10px;text-align:right;font-weight:600">'+val.toLocaleString()+'</td>';
        });
        html += '<td style="padding:6px 10px;font-size:11px;color:#94a3b8">'+(rec.notes||'—')+'</td>';
        html += '</tr>';
      });
      html += '</tbody></table></div>';
    });
    html += '</div>';
  });

  if (html.indexOf('<table') === -1) {
    html += _emptyState('📊', 'ยังไม่มีข้อมูลย้อนหลัง', 'กรอกข้อมูลรายเดือนก่อนเพื่อดูแนวโน้ม');
  }

  el.innerHTML = html;
}

function _renderSocialApi(el) {
  var allData = _getSocialData();
  var apiKeys = allData.socialApiKeys || {};

  var STY = 'padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:12px;width:100%;box-sizing:border-box;font-family:monospace;';

  var html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="window._socialView=\'dashboard\';renderMktSocial()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b">🔗 เชื่อมต่อ API แพลตฟอร์ม</div>'
    +'</div>';

  html += '<div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:12px;padding:16px 20px;margin-bottom:20px;font-size:12px;color:#1e40af">'
    +'<strong>💡 วิธีใช้:</strong> ถ้ามี API Token/Key ของแพลตฟอร์มใดใส่ได้เลย ระบบจะลองดึงข้อมูลให้อัตโนมัติ<br>'
    +'ถ้ายังไม่มี สามารถกรอกข้อมูลด้วยตัวเองจากหน้า Dashboard ได้ตามปกติ<br>'
    +'<strong>⚠️ หมายเหตุ:</strong> Token เก็บใน localStorage เครื่องนี้เท่านั้น ไม่ส่งไปที่ไหน'
    +'</div>';

  SOCIAL_PLATFORMS.forEach(function(pl) {
    var token = apiKeys[pl.key] || '';
    html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:16px 20px;margin-bottom:14px">'
      +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">'
        +'<span style="font-size:24px">'+pl.icon+'</span>'
        +'<div style="flex:1"><div style="font-size:14px;font-weight:800;color:'+pl.color+'">'+pl.name+'</div>'
        +'<div style="font-size:11px;color:#94a3b8">'+pl.apiInfo+'</div></div>'
        +(pl.apiUrl ? '<a href="'+pl.apiUrl+'" target="_blank" rel="noopener" style="font-size:11px;color:#2563eb;font-weight:600;text-decoration:none">🔗 เปิดหน้าจัดการ</a>' : '')
      +'</div>'
      +'<div style="display:flex;gap:8px;align-items:center">'
        +'<input type="password" data-api-key="'+pl.key+'" value="'+token+'" placeholder="Access Token / API Key" style="'+STY+'flex:1">'
        +'<button onclick="mktSocialToggleToken(this)" style="border:1px solid #e2e8f0;background:#fff;border-radius:8px;padding:6px 10px;cursor:pointer;font-size:11px">👁️</button>'
        +'<button onclick="mktSocialTestApi(\''+pl.key+'\')" style="border:none;background:'+pl.color+';color:#fff;border-radius:8px;padding:6px 14px;font-size:11px;font-weight:700;cursor:pointer"'+(token?'':' disabled style="border:none;background:#cbd5e1;color:#fff;border-radius:8px;padding:6px 14px;font-size:11px;font-weight:700;cursor:not-allowed"')+'>🧪 ทดสอบ</button>'
      +'</div>'
      +'<div id="apiStatus_'+pl.key+'" style="font-size:11px;margin-top:6px;color:#94a3b8"></div>'
    +'</div>';
  });

  html += '<div style="margin-top:18px;display:flex;gap:10px">'
    +'<button onclick="mktSocialSaveApiKeys()" style="padding:10px 28px;border:none;border-radius:10px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-size:14px;font-weight:700;cursor:pointer">💾 บันทึก API Keys</button>'
    +'</div>';

  el.innerHTML = html;
}

window._getCurrentMonth = _getCurrentMonth;
window.renderMktSocial = renderMktSocial;

window.mktSocialAddPage = function(platformKey) {
  var name = prompt('ชื่อเพจ/บัญชี:');
  if (!name) return;
  var allData = _getSocialData();
  if (!allData.socialV2) allData.socialV2 = {};
  if (!allData.socialV2[platformKey]) allData.socialV2[platformKey] = {pages:[]};
  allData.socialV2[platformKey].pages.push({
    id: Date.now() + '_' + platformKey,
    name: name,
    url: '',
    monthly: []
  });
  _saveMktData(allData);
  renderMktSocial();
};

window.mktSocialDeletePage = function(platformKey, idx) {
  if (!confirm('ลบเพจนี้และข้อมูลทั้งหมด?')) return;
  var allData = _getSocialData();
  allData.socialV2[platformKey].pages.splice(idx, 1);
  _saveMktData(allData);
  renderMktSocial();
};

window.mktSocialSaveForm = function() {
  var allData = _getSocialData();
  var sv2 = allData.socialV2 || {};
  var pages = _getPages(sv2, window._socialEditPlatform);
  var page = pages.find(function(pg){ return pg.id === window._socialEditPage; });
  if (!page) return;

  var month = window._socialEditMonth || _getCurrentMonth();
  if (!page.monthly) page.monthly = [];
  var rec = page.monthly.find(function(m){ return m.month === month; });
  if (!rec) { rec = {month: month}; page.monthly.push(rec); }

  document.querySelectorAll('[data-social-metric]').forEach(function(inp) {
    rec[inp.getAttribute('data-social-metric')] = parseFloat(inp.value) || 0;
  });
  var notesEl = document.getElementById('socialFormNotes');
  if (notesEl) rec.notes = notesEl.value;

  _saveSocialPages(sv2);
  window._socialView = 'dashboard';
  renderMktSocial();
};

window.mktSocialSyncShops = function() {
  var shops = window._OL_SHOPS_LIST || [];
  if (shops.length === 0) { alert('ไม่พบข้อมูลร้านค้า — โปรดเปิดแท็บออนไลน์ > ข้อมูลร้านค้า ก่อน'); return; }
  var allData = _getSocialData();
  var sv2 = allData.socialV2 || {};
  var added = _doSyncOlShops(sv2, shops, true);
  allData.socialV2 = sv2;
  allData._olShopsSynced = true;
  _saveMktData(allData);
  renderMktSocial();
  if (added > 0) alert('ซิงค์สำเร็จ! เพิ่ม ' + added + ' เพจใหม่จากข้อมูลร้านค้า');
  else alert('ข้อมูลเป็นปัจจุบันแล้ว — ไม่มีเพจใหม่ที่ต้องเพิ่ม');
};

window.mktSocialToggleToken = function(btn) {
  var inp = btn.previousElementSibling;
  inp.type = inp.type === 'password' ? 'text' : 'password';
};

window.mktSocialTestApi = function(platformKey) {
  var statusEl = document.getElementById('apiStatus_' + platformKey);
  if (statusEl) statusEl.innerHTML = '<span style="color:#f97316">🔄 กำลังทดสอบ...</span>';
  setTimeout(function() {
    var inp = document.querySelector('[data-api-key="'+platformKey+'"]');
    var token = inp ? inp.value.trim() : '';
    if (!token) {
      if (statusEl) statusEl.innerHTML = '<span style="color:#dc2626">❌ กรุณาใส่ Token ก่อน</span>';
      return;
    }
    if (statusEl) statusEl.innerHTML = '<span style="color:#f97316">⚠️ การเชื่อม API ต้องทำผ่าน backend proxy (CORS) — ตอนนี้ระบบรองรับการกรอกข้อมูลด้วยตนเอง ดึงอัตโนมัติจะพร้อมใช้เมื่อ deploy บน server</span>';
  }, 1500);
};

window.mktSocialSaveApiKeys = function() {
  var allData = _getSocialData();
  if (!allData.socialApiKeys) allData.socialApiKeys = {};
  document.querySelectorAll('[data-api-key]').forEach(function(inp) {
    var key = inp.getAttribute('data-api-key');
    var val = inp.value.trim();
    if (val) allData.socialApiKeys[key] = val;
    else delete allData.socialApiKeys[key];
  });
  _saveMktData(allData);
  alert('บันทึก API Keys เรียบร้อย');
};

// ── 4. Content Calendar (Full System) ──
window._contentView = 'dashboard'; // dashboard | form | detail | calendar | ideas | performance
window._contentEditIdx = -1;
window._contentDetailIdx = -1;
window._calMonth = new Date().getMonth();
window._calYear = new Date().getFullYear();
window._calMode = 'month'; // month | week | list

var CONTENT_TYPES = ['Product','Promotion','Campaign','Brand','Ads','Event','Seasonal','Knowledge','Review','Behind the Scene'];
var CONTENT_PLATFORMS = ['Facebook','Instagram','TikTok','LINE OA','YouTube','Website','Marketplace'];
var CONTENT_STATUSES = [
  {key:'idea',      icon:'💡', label:'Idea',       color:'#94a3b8', bg:'#f1f5f9'},
  {key:'draft',     icon:'📝', label:'Draft',      color:'#64748b', bg:'#f8fafc'},
  {key:'design',    icon:'🎨', label:'Design',     color:'#a855f7', bg:'#f3e8ff'},
  {key:'review',    icon:'🔍', label:'Review',     color:'#d97706', bg:'#fef3c7'},
  {key:'approved',  icon:'✅', label:'Approved',   color:'#16a34a', bg:'#dcfce7'},
  {key:'scheduled', icon:'📅', label:'Scheduled',  color:'#2563eb', bg:'#dbeafe'},
  {key:'published', icon:'🟢', label:'Published',  color:'#059669', bg:'#d1fae5'},
  {key:'analyze',   icon:'📊', label:'Analyze',    color:'#7c3aed', bg:'#ede9fe'}
];
var CONTENT_PRIORITIES = [{key:'low',icon:'⭐',label:'Low'},{key:'medium',icon:'⭐⭐',label:'Medium'},{key:'high',icon:'⭐⭐⭐',label:'High'},{key:'urgent',icon:'🔥',label:'Urgent'}];
var CONTENT_TYPE_COLORS = {
  'Product':'#2563eb','Promotion':'#16a34a','Campaign':'#f97316','Brand':'#7c3aed',
  'Ads':'#dc2626','Event':'#d97706','Seasonal':'#92400e','Knowledge':'#0891b2',
  'Review':'#4f46e5','Behind the Scene':'#6d28d9'
};
var PLATFORM_ICONS = {'Facebook':'📘','Instagram':'📸','TikTok':'🎵','LINE OA':'💚','YouTube':'▶️','Website':'🌐','Marketplace':'🛒'};
var DAY_NAMES = ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];

function _getContentStatusObj(key) {
  return CONTENT_STATUSES.find(function(s){return s.key===key;}) || CONTENT_STATUSES[0];
}

function renderMktContent() {
  var el = document.getElementById('mktContentContent');
  if (!el) return;
  switch(window._contentView) {
    case 'form':        _renderContentForm(el); break;
    case 'detail':      _renderContentDetail(el); break;
    case 'calendar':    _renderContentCalendar(el); break;
    case 'ideas':       _renderContentIdeas(el); break;
    case 'performance': _renderContentPerformance(el); break;
    default:            _renderContentDashboard(el);
  }
}
window.renderMktContent = renderMktContent;

// ─── 4.1 Content Dashboard ───
function _renderContentDashboard(el) {
  var data = _loadMktData();
  var contents = data.contents || [];
  var now = new Date();

  var drafts = contents.filter(function(c){return c.status==='draft';}).length;
  var reviews = contents.filter(function(c){return c.status==='review';}).length;
  var scheduled = contents.filter(function(c){return c.status==='scheduled';}).length;
  var published = contents.filter(function(c){return c.status==='published'||c.status==='analyze';}).length;
  var overdue = contents.filter(function(c){
    if (c.status==='published'||c.status==='analyze') return false;
    return c.publishDate && new Date(c.publishDate) < now;
  }).length;

  var totalReach = contents.reduce(function(s,c){return s+(c.perf&&c.perf.reach||0);},0);
  var totalEngagement = contents.reduce(function(s,c){return s+(c.perf&&c.perf.engagement||0);},0);
  var totalLeads = contents.reduce(function(s,c){return s+(c.perf&&c.perf.leads||0);},0);
  var totalSales = contents.reduce(function(s,c){return s+(c.perf&&c.perf.sales||0);},0);

  var html = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap">'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b;flex:1">📅 Content Calendar</div>'
    +'<button onclick="_contentView=\'form\';_contentEditIdx=-1;renderMktContent()" style="padding:7px 16px;border:none;border-radius:10px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-size:12px;font-weight:700;cursor:pointer">➕ Create Content</button>'
    +'<button onclick="_contentView=\'calendar\';renderMktContent()" style="padding:7px 16px;border:1.5px solid #2563eb;border-radius:10px;background:#fff;color:#2563eb;font-size:12px;font-weight:700;cursor:pointer">📅 Calendar</button>'
    +'<button onclick="_contentView=\'ideas\';renderMktContent()" style="padding:7px 16px;border:1.5px solid #f97316;border-radius:10px;background:#fff;color:#f97316;font-size:12px;font-weight:700;cursor:pointer">💡 Ideas</button>'
    +'<button onclick="_contentView=\'performance\';renderMktContent()" style="padding:7px 16px;border:1.5px solid #16a34a;border-radius:10px;background:#fff;color:#16a34a;font-size:12px;font-weight:700;cursor:pointer">📊 Performance</button>'
    +'</div>';

  // KPI Row 1: Status
  html += '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:10px">'
    + _card('📋','Content ทั้งหมด', contents.length, 'รายการ', '#7c3aed', 'linear-gradient(135deg,#f5f3ff,#ede9fe)')
    + _card('📝','ร่าง', drafts, 'รายการ', '#64748b', 'linear-gradient(135deg,#f8fafc,#f1f5f9)')
    + _card('🟡','รออนุมัติ', reviews, 'รายการ', '#d97706', 'linear-gradient(135deg,#fffbeb,#fef3c7)')
    + _card('🔵','Scheduled', scheduled, 'รายการ', '#2563eb', 'linear-gradient(135deg,#eff6ff,#dbeafe)')
    + _card('🟢','Published', published, 'รายการ', '#059669', 'linear-gradient(135deg,#ecfdf5,#d1fae5)')
    + _card('🔴','Overdue', overdue, 'รายการ', '#dc2626', 'linear-gradient(135deg,#fef2f2,#fecaca)')
    +'</div>';

  // KPI Row 2: Performance
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px">'
    + _card('👁️','Reach รวม', totalReach>0?totalReach.toLocaleString():'—', '', '#2563eb', 'linear-gradient(135deg,#eff6ff,#dbeafe)')
    + _card('❤️','Engagement', totalEngagement>0?totalEngagement.toLocaleString():'—', totalReach>0?(totalEngagement/totalReach*100).toFixed(1)+'%':'', '#dc2626', 'linear-gradient(135deg,#fef2f2,#fecaca)')
    + _card('🎯','Leads', totalLeads>0?totalLeads.toLocaleString():'—', '', '#f97316', 'linear-gradient(135deg,#fff7ed,#fed7aa)')
    + _card('💰','Sales จาก Content', totalSales>0?'฿'+totalSales.toLocaleString():'—', '', '#16a34a', 'linear-gradient(135deg,#f0fdf4,#bbf7d0)')
    +'</div>';

  // Content Workflow Overview
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:16px 20px;margin-bottom:16px">'
    +'<div style="font-size:13px;font-weight:800;color:#1e293b;margin-bottom:12px">📊 Content Workflow</div>'
    +'<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">';
  CONTENT_STATUSES.forEach(function(st) {
    var count = contents.filter(function(c){return c.status===st.key;}).length;
    html += '<div style="flex:1;min-width:70px;text-align:center;padding:10px 4px;background:'+st.bg+';border-radius:10px">'
      +'<div style="font-size:16px">'+st.icon+'</div>'
      +'<div style="font-size:18px;font-weight:800;color:'+st.color+'">'+count+'</div>'
      +'<div style="font-size:9px;font-weight:600;color:#64748b">'+st.label+'</div></div>';
    if (st.key !== 'analyze') html += '<div style="color:#cbd5e1;font-size:16px">→</div>';
  });
  html += '</div></div>';

  // Today's Content + Upcoming
  var todayStr = now.toISOString().split('T')[0];
  var todayContent = contents.filter(function(c){return c.publishDate===todayStr;});
  var upcoming = contents.filter(function(c){
    if (!c.publishDate) return false;
    var d = new Date(c.publishDate);
    return d > now && d <= new Date(now.getTime()+7*86400000);
  }).sort(function(a,b){return a.publishDate<b.publishDate?-1:1;});
  var overdueList = contents.filter(function(c){
    if (c.status==='published'||c.status==='analyze') return false;
    return c.publishDate && new Date(c.publishDate) < now;
  });

  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">';

  // Today
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:16px 20px">'
    +'<div style="font-size:13px;font-weight:800;color:#7c3aed;margin-bottom:10px">📅 Content วันนี้</div>';
  if (todayContent.length > 0) {
    todayContent.forEach(function(c,ci){
      html += _contentMiniCard(c, ci, contents);
    });
  } else {
    html += '<div style="font-size:12px;color:#94a3b8;text-align:center;padding:20px 0">ไม่มี Content วันนี้</div>';
  }
  html += '</div>';

  // Upcoming + Overdue
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:16px 20px">'
    +'<div style="font-size:13px;font-weight:800;color:#2563eb;margin-bottom:10px">📋 งานที่รอดำเนินการ</div>';
  if (overdueList.length > 0) {
    html += '<div style="font-size:11px;font-weight:700;color:#dc2626;margin-bottom:6px">🔴 Overdue</div>';
    overdueList.slice(0,3).forEach(function(c){ html += _contentMiniCard(c, contents.indexOf(c), contents); });
  }
  if (upcoming.length > 0) {
    html += '<div style="font-size:11px;font-weight:700;color:#2563eb;margin:'+(overdueList.length>0?'8':'0')+'px 0 6px">📅 ใกล้ Deadline (7 วัน)</div>';
    upcoming.slice(0,4).forEach(function(c){ html += _contentMiniCard(c, contents.indexOf(c), contents); });
  }
  if (overdueList.length===0 && upcoming.length===0) {
    html += '<div style="font-size:12px;color:#94a3b8;text-align:center;padding:20px 0">ไม่มีงานที่รอ</div>';
  }
  html += '</div></div>';

  // Content List (recent)
  if (contents.length > 0) {
    var sorted = contents.slice().sort(function(a,b){return (b.publishDate||'')>(a.publishDate||'')?1:-1;});
    var TH = 'padding:8px 10px;font-size:11px;font-weight:700;color:#fff;background:#1e293b;white-space:nowrap;';
    html += '<div style="overflow-x:auto;border-radius:12px;border:1px solid #e2e8f0"><table style="width:100%;border-collapse:collapse;font-size:12px">'
      +'<thead><tr>'
      +'<th style="'+TH+'text-align:left">Content</th>'
      +'<th style="'+TH+'text-align:left">Type</th>'
      +'<th style="'+TH+'text-align:center">Platform</th>'
      +'<th style="'+TH+'text-align:center">วันที่</th>'
      +'<th style="'+TH+'text-align:center">Priority</th>'
      +'<th style="'+TH+'text-align:center">Status</th>'
      +'<th style="'+TH+'text-align:center">จัดการ</th>'
      +'</tr></thead><tbody>';

    sorted.forEach(function(c, si) {
      var realIdx = contents.indexOf(c);
      var st = _getContentStatusObj(c.status);
      var typeColor = CONTENT_TYPE_COLORS[c.contentType] || '#64748b';
      var dateStr = c.publishDate ? new Date(c.publishDate).toLocaleDateString('th-TH',{day:'2-digit',month:'short'}) : '—';
      var platforms = (c.platforms||[]).map(function(p){return PLATFORM_ICONS[p]||'📣';}).join(' ');
      var priObj = CONTENT_PRIORITIES.find(function(p){return p.key===c.priority;}) || CONTENT_PRIORITIES[0];

      html += '<tr style="border-bottom:1px solid #f1f5f9;background:'+(si%2?'#fafafa':'#fff')+';cursor:pointer" onclick="_contentDetailIdx='+realIdx+';_contentView=\'detail\';renderMktContent()">'
        +'<td style="padding:7px 10px;font-weight:600;color:#1e293b;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(c.title||'—')+'</td>'
        +'<td style="padding:7px 10px"><span style="padding:2px 8px;border-radius:8px;font-size:10px;font-weight:600;background:'+typeColor+'20;color:'+typeColor+'">'+(c.contentType||'—')+'</span></td>'
        +'<td style="padding:7px 10px;text-align:center;font-size:14px">'+(platforms||'—')+'</td>'
        +'<td style="padding:7px 10px;text-align:center;color:#475569;font-size:11px">'+dateStr+'</td>'
        +'<td style="padding:7px 10px;text-align:center;font-size:11px">'+priObj.icon+'</td>'
        +'<td style="padding:7px 10px;text-align:center"><span style="padding:3px 10px;border-radius:12px;font-size:10px;font-weight:700;color:#fff;background:'+st.color+'">'+st.icon+' '+st.label+'</span></td>'
        +'<td style="padding:7px 10px;text-align:center;white-space:nowrap" onclick="event.stopPropagation()">'
        +'<button onclick="_contentEditIdx='+realIdx+';_contentView=\'form\';renderMktContent()" style="border:none;background:none;cursor:pointer;font-size:13px" title="แก้ไข">✏️</button>'
        +'<button onclick="mktContentNextStatus('+realIdx+')" style="border:none;background:none;cursor:pointer;font-size:13px" title="เลื่อนสถานะ">⏭️</button>'
        +'<button onclick="mktDeleteContent('+realIdx+')" style="border:none;background:none;cursor:pointer;font-size:13px" title="ลบ">🗑️</button>'
        +'</td></tr>';
    });
    html += '</tbody></table></div>';
  } else {
    html += _emptyState('📅', 'ยังไม่มี Content', 'กดปุ่ม "Create Content" เพื่อเริ่มวางแผนคอนเทนต์');
  }

  // AI Content Analysis
  html += _renderContentAI(contents);

  el.innerHTML = html;
}

function _contentMiniCard(c, idx, all) {
  var st = _getContentStatusObj(c.status);
  var typeColor = CONTENT_TYPE_COLORS[c.contentType] || '#64748b';
  var platforms = (c.platforms||[]).map(function(p){return PLATFORM_ICONS[p]||'📣';}).join(' ');
  return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f8fafc;cursor:pointer" onclick="_contentDetailIdx='+idx+';_contentView=\'detail\';renderMktContent()">'
    +'<span style="display:inline-block;width:4px;height:28px;border-radius:2px;background:'+typeColor+'"></span>'
    +'<div style="flex:1"><div style="font-size:12px;font-weight:600;color:#1e293b">'+(c.title||'')+'</div>'
    +'<div style="font-size:10px;color:#94a3b8">'+(c.publishTime||'')+ ' '+platforms+'</div></div>'
    +'<span style="padding:2px 6px;border-radius:6px;font-size:9px;font-weight:700;background:'+st.bg+';color:'+st.color+'">'+st.icon+'</span>'
    +'</div>';
}

// ─── 4.2 Content Form ───
function _renderContentForm(el) {
  var data = _loadMktData();
  var contents = data.contents || [];
  var c = window._contentEditIdx >= 0 && contents[window._contentEditIdx] ? contents[window._contentEditIdx] : {};
  var isEdit = window._contentEditIdx >= 0;
  var STY = 'padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;width:100%;box-sizing:border-box;';

  var html = '<div style="max-width:900px;margin:0 auto">'
    +'<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_contentView=\'dashboard\';renderMktContent()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:16px;font-weight:800;color:#1e293b">'+(isEdit?'✏️ แก้ไข Content':'➕ Create Content')+'</div></div>';

  // Content Info
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:22px;margin-bottom:16px">'
    +'<div style="font-size:14px;font-weight:800;color:#7c3aed;margin-bottom:16px">📝 Content Information</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">';

  html += '<div style="grid-column:1/-1"><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📝 ชื่อ Content *</label>'
    +'<input id="cc_title" value="'+(c.title||'').replace(/"/g,'&quot;')+'" placeholder="เช่น แซนด์วิช 20 บาท อร่อยคุ้มทุกคำ" style="'+STY+'font-weight:600"></div>';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">🆔 Content ID</label>'
    +'<input id="cc_id" value="'+(c.contentId||'')+'" placeholder="เช่น CT-2569-08-001" style="'+STY+'"></div>';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📋 Content Type</label>'
    +'<select id="cc_type" style="'+STY+'"><option value="">— เลือก —</option>';
  CONTENT_TYPES.forEach(function(t){ html += '<option value="'+t+'"'+(c.contentType===t?' selected':'')+'>'+t+'</option>'; });
  html += '</select></div>';

  html += '<div style="grid-column:1/-1"><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📌 หัวข้อ / Topic</label>'
    +'<input id="cc_topic" value="'+(c.topic||'').replace(/"/g,'&quot;')+'" placeholder="หัวข้อหลักของ Content" style="'+STY+'"></div>';

  html += '<div style="grid-column:1/-1"><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">💬 Caption</label>'
    +'<textarea id="cc_caption" rows="3" placeholder="ข้อความ Caption ที่จะโพสต์จริง..." style="'+STY+'resize:vertical">'+(c.caption||'')+'</textarea></div>';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📅 วันที่เผยแพร่</label>'
    +'<input type="date" id="cc_date" value="'+(c.publishDate||'')+'" style="'+STY+'"></div>';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">🕐 เวลา</label>'
    +'<input type="time" id="cc_time" value="'+(c.publishTime||'')+'" style="'+STY+'"></div>';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">👤 ผู้รับผิดชอบ</label>'
    +'<input id="cc_responsible" value="'+(c.responsible||'')+'" placeholder="ชื่อทีม/บุคคล" style="'+STY+'"></div>';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">🔍 ผู้ตรวจสอบ</label>'
    +'<input id="cc_reviewer" value="'+(c.reviewer||'')+'" placeholder="ชื่อผู้อนุมัติ" style="'+STY+'"></div>';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">⭐ Priority</label>'
    +'<select id="cc_priority" style="'+STY+'">';
  CONTENT_PRIORITIES.forEach(function(p){ html += '<option value="'+p.key+'"'+((c.priority||'medium')===p.key?' selected':'')+'>'+p.icon+' '+p.label+'</option>'; });
  html += '</select></div>';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📊 Status</label>'
    +'<select id="cc_status" style="'+STY+'">';
  CONTENT_STATUSES.forEach(function(s){ html += '<option value="'+s.key+'"'+((c.status||'draft')===s.key?' selected':'')+'>'+s.icon+' '+s.label+'</option>'; });
  html += '</select></div>';

  html += '</div></div>'; // close info

  // Platforms
  var selPlatforms = c.platforms || [];
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:22px;margin-bottom:16px">'
    +'<div style="font-size:14px;font-weight:800;color:#2563eb;margin-bottom:12px">📱 Platform (เลือกได้หลายช่องทาง)</div>'
    +'<div style="display:flex;flex-wrap:wrap;gap:10px">';
  CONTENT_PLATFORMS.forEach(function(p) {
    var checked = selPlatforms.indexOf(p) >= 0 ? ' checked' : '';
    html += '<label style="display:flex;align-items:center;gap:6px;font-size:13px;color:#475569;cursor:pointer;padding:8px 14px;background:#f8fafc;border-radius:10px;border:1.5px solid '+(checked?' #2563eb':'#e2e8f0')+'">'
      +'<input type="checkbox" class="cc_platform" value="'+p+'"'+checked+' style="cursor:pointer"> '+(PLATFORM_ICONS[p]||'')+' '+p+'</label>';
  });
  html += '</div></div>';

  // Link to Campaign
  var camps = data.promos || [];
  var plans = data.plans || [];
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:22px;margin-bottom:16px">'
    +'<div style="font-size:14px;font-weight:800;color:#f97316;margin-bottom:12px">🔗 เชื่อมกับ Campaign</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📋 Marketing Plan</label>'
    +'<select id="cc_planLink" style="'+STY+'"><option value="">— ไม่เชื่อม —</option>';
  plans.forEach(function(p,pi){ html += '<option value="'+pi+'"'+(c.planLink==pi?' selected':'')+'>'+p.name+'</option>'; });
  html += '</select></div>';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">🎯 Campaign</label>'
    +'<select id="cc_campLink" style="'+STY+'"><option value="">— ไม่เชื่อม —</option>';
  camps.forEach(function(cp,ci){ html += '<option value="'+ci+'"'+(c.campLink==ci?' selected':'')+'>'+cp.name+'</option>'; });
  html += '</select></div>';

  html += '</div></div>';

  // Media
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:22px;margin-bottom:16px">'
    +'<div style="font-size:14px;font-weight:800;color:#16a34a;margin-bottom:12px">🎬 Media</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📋 Media Type</label>'
    +'<select id="cc_mediaType" style="'+STY+'"><option value="">— เลือก —</option>'
    +'<option value="image"'+(c.mediaType==='image'?' selected':'')+'>📸 รูปภาพ</option>'
    +'<option value="video"'+(c.mediaType==='video'?' selected':'')+'>🎬 Video</option>'
    +'<option value="reel"'+(c.mediaType==='reel'?' selected':'')+'>📱 Reel</option>'
    +'<option value="artwork"'+(c.mediaType==='artwork'?' selected':'')+'>🎨 Artwork</option>'
    +'<option value="carousel"'+(c.mediaType==='carousel'?' selected':'')+'>🔄 Carousel</option>'
    +'</select></div>';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📝 หมายเหตุ Media</label>'
    +'<input id="cc_mediaNotes" value="'+(c.mediaNotes||'').replace(/"/g,'&quot;')+'" placeholder="รายละเอียดเพิ่มเติม" style="'+STY+'"></div>';

  html += '</div></div>';

  // Performance (edit mode only, for published content)
  if (isEdit && (c.status==='published'||c.status==='analyze')) {
    var perf = c.perf || {};
    html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:22px;margin-bottom:16px">'
      +'<div style="font-size:14px;font-weight:800;color:#059669;margin-bottom:16px">📊 Content Performance</div>'
      +'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">';

    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">👁️ Reach</label>'
      +'<input type="number" id="cc_pReach" value="'+(perf.reach||'')+'" placeholder="0" style="'+STY+'"></div>';
    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">❤️ Engagement</label>'
      +'<input type="number" id="cc_pEngagement" value="'+(perf.engagement||'')+'" placeholder="0" style="'+STY+'"></div>';
    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">▶️ Video Views</label>'
      +'<input type="number" id="cc_pViews" value="'+(perf.views||'')+'" placeholder="0" style="'+STY+'"></div>';
    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">🔗 Click</label>'
      +'<input type="number" id="cc_pClicks" value="'+(perf.clicks||'')+'" placeholder="0" style="'+STY+'"></div>';
    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">🎯 Leads</label>'
      +'<input type="number" id="cc_pLeads" value="'+(perf.leads||'')+'" placeholder="0" style="'+STY+'"></div>';
    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">💰 Sales (฿)</label>'
      +'<input type="number" id="cc_pSales" value="'+(perf.sales||'')+'" placeholder="0" style="'+STY+'"></div>';
    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">💸 Cost (฿)</label>'
      +'<input type="number" id="cc_pCost" value="'+(perf.cost||'')+'" placeholder="0" style="'+STY+'"></div>';

    html += '</div></div>';
  }

  // Save/Cancel
  html += '<div style="display:flex;gap:10px">'
    +'<button onclick="mktSaveContent()" style="padding:10px 28px;border:none;border-radius:10px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-size:14px;font-weight:700;cursor:pointer">💾 '+(isEdit?'บันทึก':'สร้าง Content')+'</button>'
    +'<button onclick="_contentView=\'dashboard\';renderMktContent()" style="padding:10px 20px;border:1.5px solid #e2e8f0;border-radius:10px;background:#fff;color:#64748b;font-size:13px;font-weight:600;cursor:pointer">ยกเลิก</button>'
    +'</div></div>';

  el.innerHTML = html;
}

// ─── 4.3 Content Detail ───
function _renderContentDetail(el) {
  var data = _loadMktData();
  var contents = data.contents || [];
  var c = contents[window._contentDetailIdx];
  if (!c) { window._contentView = 'dashboard'; renderMktContent(); return; }

  var st = _getContentStatusObj(c.status);
  var typeColor = CONTENT_TYPE_COLORS[c.contentType] || '#64748b';
  var platforms = (c.platforms||[]).map(function(p){return (PLATFORM_ICONS[p]||'')+' '+p;}).join(' · ');
  var perf = c.perf || {};

  var html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_contentView=\'dashboard\';renderMktContent()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:16px;font-weight:800;color:#1e293b">🎬 Content Detail</div></div>';

  // Header
  html += '<div style="background:linear-gradient(135deg,#1e293b,#334155);border-radius:14px;padding:20px 24px;margin-bottom:20px">'
    +'<div style="display:flex;align-items:center;gap:12px">'
    +'<div style="width:50px;height:50px;border-radius:12px;background:'+typeColor+';display:flex;align-items:center;justify-content:center;font-size:24px">'
    +({'image':'📸','video':'🎬','reel':'📱','artwork':'🎨','carousel':'🔄'}[c.mediaType]||'📝')+'</div>'
    +'<div style="flex:1"><div style="font-size:18px;font-weight:800;color:#fff">'+(c.title||'Content')+'</div>'
    +'<div style="font-size:12px;color:#94a3b8;margin-top:4px">'+(c.contentType||'')+' · '+platforms+' · '+(c.responsible||'')+'</div></div>'
    +'<span style="padding:6px 16px;border-radius:12px;font-size:12px;font-weight:700;background:'+st.color+';color:#fff">'+st.icon+' '+st.label+'</span>'
    +'</div></div>';

  // Content Details
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:22px;margin-bottom:16px">'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">'
    +'<div><span style="font-size:10px;font-weight:700;color:#94a3b8">Content ID</span><div style="font-size:13px;font-weight:600;color:#1e293b">'+(c.contentId||'—')+'</div></div>'
    +'<div><span style="font-size:10px;font-weight:700;color:#94a3b8">วันที่เผยแพร่</span><div style="font-size:13px;font-weight:600;color:#1e293b">'+(c.publishDate||'—')+' '+(c.publishTime||'')+'</div></div>'
    +'<div><span style="font-size:10px;font-weight:700;color:#94a3b8">ผู้ตรวจสอบ</span><div style="font-size:13px;font-weight:600;color:#1e293b">'+(c.reviewer||'—')+'</div></div>'
    +'<div><span style="font-size:10px;font-weight:700;color:#94a3b8">Media Type</span><div style="font-size:13px;font-weight:600;color:#1e293b">'+(c.mediaType||'—')+'</div></div>'
    +'</div>';

  // Caption
  if (c.caption) {
    html += '<div style="margin-bottom:16px"><div style="font-size:12px;font-weight:700;color:#7c3aed;margin-bottom:6px">💬 Caption</div>'
      +'<div style="background:#f8fafc;border-radius:10px;padding:14px 16px;font-size:13px;color:#334155;line-height:1.8;white-space:pre-wrap">'+c.caption+'</div></div>';
  }

  // Campaign link
  if (c.campLink !== '' && c.campLink !== undefined) {
    var camps = data.promos || [];
    var camp = camps[c.campLink];
    if (camp) {
      html += '<div style="margin-bottom:16px"><div style="font-size:12px;font-weight:700;color:#f97316;margin-bottom:6px">🔗 Campaign</div>'
        +'<div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:#fff7ed;border-radius:10px;border:1px solid #fed7aa">'
        +'<span style="font-size:16px">🎯</span>'
        +'<div style="font-size:13px;font-weight:600;color:#9a3412">'+camp.name+'</div>'
        +'<span style="padding:2px 8px;border-radius:6px;font-size:10px;font-weight:600;background:#f1f5f9;color:#475569">'+(camp.campType||'')+'</span>'
        +'</div></div>';
    }
  }

  html += '</div>'; // close details card

  // Performance
  if (perf.reach || perf.engagement || perf.views || perf.clicks || perf.leads || perf.sales) {
    html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:22px;margin-bottom:16px">'
      +'<div style="font-size:14px;font-weight:800;color:#059669;margin-bottom:14px">📊 Content Performance</div>'
      +'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px">';

    var engRate = (perf.reach||0) > 0 ? ((perf.engagement||0)/(perf.reach)*100) : 0;
    var costPerResult = (perf.cost||0) > 0 && (perf.engagement||0) > 0 ? ((perf.cost)/(perf.engagement)) : 0;
    var roi = (perf.cost||0) > 0 ? (((perf.sales||0)-(perf.cost))/perf.cost*100) : 0;

    html += '<div style="text-align:center;padding:12px;background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:10px">'
      +'<div style="font-size:10px;font-weight:700;color:#64748b">Reach</div>'
      +'<div style="font-size:18px;font-weight:800;color:#2563eb">'+(perf.reach||0).toLocaleString()+'</div></div>';
    html += '<div style="text-align:center;padding:12px;background:linear-gradient(135deg,#fef2f2,#fecaca);border-radius:10px">'
      +'<div style="font-size:10px;font-weight:700;color:#64748b">Engagement</div>'
      +'<div style="font-size:18px;font-weight:800;color:#dc2626">'+(perf.engagement||0).toLocaleString()+'</div>'
      +'<div style="font-size:10px;font-weight:600;color:#f97316">Rate '+engRate.toFixed(1)+'%</div></div>';
    html += '<div style="text-align:center;padding:12px;background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-radius:10px">'
      +'<div style="font-size:10px;font-weight:700;color:#64748b">Video Views</div>'
      +'<div style="font-size:18px;font-weight:800;color:#7c3aed">'+(perf.views||0).toLocaleString()+'</div></div>';
    html += '<div style="text-align:center;padding:12px;background:linear-gradient(135deg,#fff7ed,#fed7aa);border-radius:10px">'
      +'<div style="font-size:10px;font-weight:700;color:#64748b">Click</div>'
      +'<div style="font-size:18px;font-weight:800;color:#f97316">'+(perf.clicks||0).toLocaleString()+'</div></div>';

    html += '</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">';
    html += '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:10px">'
      +'<div style="font-size:10px;font-weight:700;color:#64748b">Leads</div>'
      +'<div style="font-size:16px;font-weight:800;color:#1e293b">'+(perf.leads||0).toLocaleString()+'</div></div>';
    html += '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:10px">'
      +'<div style="font-size:10px;font-weight:700;color:#64748b">Sales</div>'
      +'<div style="font-size:16px;font-weight:800;color:#16a34a">฿'+(perf.sales||0).toLocaleString()+'</div></div>';
    html += '<div style="text-align:center;padding:12px;background:#f8fafc;border-radius:10px">'
      +'<div style="font-size:10px;font-weight:700;color:#64748b">Cost/Result</div>'
      +'<div style="font-size:16px;font-weight:800;color:#64748b">฿'+costPerResult.toFixed(1)+'</div></div>';
    html += '<div style="text-align:center;padding:12px;background:linear-gradient(135deg,'+(roi>=0?'#f0fdf4,#bbf7d0':'#fef2f2,#fecaca')+';border-radius:10px">'
      +'<div style="font-size:10px;font-weight:700;color:#64748b">ROI</div>'
      +'<div style="font-size:16px;font-weight:800;color:'+(roi>=0?'#16a34a':'#dc2626')+'">'+roi.toFixed(1)+'%</div></div>';
    html += '</div></div>';
  }

  // Workflow Progress
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:18px 22px;margin-bottom:16px">'
    +'<div style="font-size:13px;font-weight:800;color:#1e293b;margin-bottom:10px">📊 Workflow Progress</div>'
    +'<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">';
  var currentFound = false;
  CONTENT_STATUSES.forEach(function(stObj) {
    var isCurrent = stObj.key === c.status;
    var isPast = !currentFound && !isCurrent;
    if (isCurrent) currentFound = true;
    var bg = isCurrent ? stObj.color : (isPast ? stObj.color+'40' : '#f1f5f9');
    var textColor = isCurrent ? '#fff' : (isPast ? stObj.color : '#cbd5e1');
    html += '<div style="flex:1;min-width:60px;text-align:center;padding:8px 4px;background:'+bg+';border-radius:8px;'+(isCurrent?'box-shadow:0 2px 8px '+stObj.color+'40':'')+'">'
      +'<div style="font-size:12px">'+stObj.icon+'</div>'
      +'<div style="font-size:9px;font-weight:700;color:'+textColor+'">'+stObj.label+'</div></div>';
    if (stObj.key !== 'analyze') html += '<div style="color:'+(isPast||isCurrent?'#64748b':'#e2e8f0')+';font-size:12px">→</div>';
  });
  html += '</div></div>';

  // Edit button
  html += '<div style="margin-top:16px"><button onclick="_contentEditIdx='+window._contentDetailIdx+';_contentView=\'form\';renderMktContent()" style="padding:10px 24px;border:none;border-radius:10px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-size:13px;font-weight:700;cursor:pointer">✏️ แก้ไข Content</button></div>';

  el.innerHTML = html;
}

// ─── 4.4 Calendar View ───
function _renderContentCalendar(el) {
  var data = _loadMktData();
  var contents = data.contents || [];
  var y = window._calYear;
  var m = window._calMonth;
  var mode = window._calMode;

  var monthLabel = MTH[m+1] + ' ' + (y+543);

  var html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap">'
    +'<button onclick="_contentView=\'dashboard\';renderMktContent()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b;flex:1">📅 Content Calendar</div>'
    +'<div style="display:flex;gap:4px">';
  ['month','week','list'].forEach(function(md) {
    var active = mode===md;
    html += '<button onclick="_calMode=\''+md+'\';renderMktContent()" style="padding:5px 12px;border:'+(active?'none':'1.5px solid #e2e8f0')+';border-radius:8px;background:'+(active?'linear-gradient(135deg,#7c3aed,#a855f7)':'#fff')+';color:'+(active?'#fff':'#64748b')+';font-size:11px;font-weight:700;cursor:pointer">'+({'month':'Month','week':'Week','list':'List'}[md])+'</button>';
  });
  html += '</div></div>';

  // Month nav
  html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">'
    +'<button onclick="_calMonth--;if(_calMonth<0){_calMonth=11;_calYear--;}renderMktContent()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:16px">◀</button>'
    +'<div style="font-size:16px;font-weight:800;color:#1e293b;flex:1;text-align:center">📅 '+monthLabel+'</div>'
    +'<button onclick="_calMonth++;if(_calMonth>11){_calMonth=0;_calYear++;}renderMktContent()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:16px">▶</button>'
    +'</div>';

  // Content type legend
  html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">';
  Object.keys(CONTENT_TYPE_COLORS).forEach(function(t) {
    html += '<span style="display:flex;align-items:center;gap:4px;font-size:10px;color:#475569"><span style="width:10px;height:10px;border-radius:3px;background:'+CONTENT_TYPE_COLORS[t]+'"></span>'+t+'</span>';
  });
  html += '</div>';

  if (mode === 'month') {
    html += _buildMonthGrid(y, m, contents);
  } else if (mode === 'week') {
    html += _buildWeekView(y, m, contents);
  } else {
    html += _buildListView(y, m, contents);
  }

  el.innerHTML = html;
}

function _buildMonthGrid(year, month, contents) {
  var firstDay = new Date(year, month, 1).getDay();
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var today = new Date();
  var todayStr = today.toISOString().split('T')[0];

  var html = '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;background:#fff;border-radius:14px;border:1px solid #e2e8f0;overflow:hidden">';

  // Day headers
  DAY_NAMES.forEach(function(d) {
    html += '<div style="padding:8px;text-align:center;font-size:11px;font-weight:700;color:#64748b;background:#f8fafc">'+d+'</div>';
  });

  // Empty cells before first day
  for (var e = 0; e < firstDay; e++) {
    html += '<div style="padding:6px;min-height:80px;background:#fafafa"></div>';
  }

  // Days
  for (var d = 1; d <= daysInMonth; d++) {
    var dateStr = year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    var isToday = dateStr === todayStr;
    var dayContents = contents.filter(function(c){return c.publishDate===dateStr;});

    html += '<div style="padding:4px;min-height:80px;background:'+(isToday?'#f5f3ff':'#fff')+';border:'+(isToday?'2px solid #7c3aed':'1px solid #f1f5f9')+'">'
      +'<div style="font-size:11px;font-weight:'+(isToday?'800':'600')+';color:'+(isToday?'#7c3aed':'#475569')+';margin-bottom:2px">'+d+'</div>';

    dayContents.forEach(function(c) {
      var typeColor = CONTENT_TYPE_COLORS[c.contentType] || '#64748b';
      var idx = contents.indexOf(c);
      html += '<div onclick="_contentDetailIdx='+idx+';_contentView=\'detail\';renderMktContent()" style="padding:2px 4px;margin-bottom:2px;border-radius:4px;background:'+typeColor+'20;border-left:3px solid '+typeColor+';cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'
        +'<div style="font-size:9px;font-weight:600;color:'+typeColor+'">'+(c.title||'').substring(0,15)+'</div>'
        +'</div>';
    });
    html += '</div>';
  }

  // Fill remaining cells
  var totalCells = firstDay + daysInMonth;
  var remaining = (7 - (totalCells % 7)) % 7;
  for (var r = 0; r < remaining; r++) {
    html += '<div style="padding:6px;min-height:80px;background:#fafafa"></div>';
  }

  html += '</div>';
  return html;
}

function _buildWeekView(year, month, contents) {
  var now = new Date();
  var dayOfWeek = now.getDay();
  var startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);

  var html = '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;overflow:hidden">';
  html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:0">';

  for (var i = 0; i < 7; i++) {
    var day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    var dateStr = day.toISOString().split('T')[0];
    var isToday = dateStr === now.toISOString().split('T')[0];
    var dayContents = contents.filter(function(c){return c.publishDate===dateStr;});

    html += '<div style="padding:8px;min-height:200px;border-right:1px solid #f1f5f9;background:'+(isToday?'#f5f3ff':'#fff')+'">'
      +'<div style="text-align:center;margin-bottom:8px">'
      +'<div style="font-size:10px;color:#94a3b8">'+DAY_NAMES[i]+'</div>'
      +'<div style="font-size:16px;font-weight:'+(isToday?'800':'600')+';color:'+(isToday?'#7c3aed':'#1e293b')+'">'+day.getDate()+'</div></div>';

    dayContents.forEach(function(c) {
      var typeColor = CONTENT_TYPE_COLORS[c.contentType] || '#64748b';
      var idx = contents.indexOf(c);
      var st = _getContentStatusObj(c.status);
      html += '<div onclick="_contentDetailIdx='+idx+';_contentView=\'detail\';renderMktContent()" style="padding:6px 8px;margin-bottom:4px;border-radius:8px;background:'+typeColor+'15;border-left:3px solid '+typeColor+';cursor:pointer">'
        +'<div style="font-size:10px;font-weight:700;color:'+typeColor+'">'+(c.title||'').substring(0,20)+'</div>'
        +'<div style="font-size:9px;color:#94a3b8">'+(c.publishTime||'')+ ' '+st.icon+'</div>'
        +'</div>';
    });
    html += '</div>';
  }

  html += '</div></div>';
  return html;
}

function _buildListView(year, month, contents) {
  var monthContents = contents.filter(function(c) {
    if (!c.publishDate) return false;
    var d = new Date(c.publishDate);
    return d.getFullYear() === year && d.getMonth() === month;
  }).sort(function(a,b){return (a.publishDate||'')<(b.publishDate||'')?-1:1;});

  if (monthContents.length === 0) return _emptyState('📅', 'ไม่มี Content เดือนนี้', 'สร้าง Content ใหม่แล้วกำหนดวันที่เผยแพร่');

  var html = '<div style="display:grid;gap:8px">';
  monthContents.forEach(function(c) {
    var typeColor = CONTENT_TYPE_COLORS[c.contentType] || '#64748b';
    var st = _getContentStatusObj(c.status);
    var idx = contents.indexOf(c);
    var platforms = (c.platforms||[]).map(function(p){return PLATFORM_ICONS[p]||'';}).join(' ');
    var dateStr = c.publishDate ? new Date(c.publishDate).toLocaleDateString('th-TH',{weekday:'short',day:'2-digit',month:'short'}) : '—';

    html += '<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#fff;border-radius:12px;border:1px solid #e2e8f0;cursor:pointer" onclick="_contentDetailIdx='+idx+';_contentView=\'detail\';renderMktContent()">'
      +'<div style="width:4px;height:40px;border-radius:2px;background:'+typeColor+'"></div>'
      +'<div style="min-width:80px"><div style="font-size:12px;font-weight:700;color:#1e293b">'+dateStr+'</div><div style="font-size:11px;color:#94a3b8">'+(c.publishTime||'')+'</div></div>'
      +'<div style="flex:1"><div style="font-size:13px;font-weight:600;color:#1e293b">'+(c.title||'')+'</div>'
      +'<div style="font-size:11px;color:#64748b">'+(c.contentType||'')+' · '+platforms+'</div></div>'
      +'<span style="padding:3px 10px;border-radius:10px;font-size:10px;font-weight:700;background:'+st.color+';color:#fff">'+st.icon+' '+st.label+'</span>'
      +'</div>';
  });
  html += '</div>';
  return html;
}

// ─── 4.5 Content Ideas Bank ───
function _renderContentIdeas(el) {
  var data = _loadMktData();
  var ideas = data.contentIdeas || [];

  var html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_contentView=\'dashboard\';renderMktContent()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b;flex:1">💡 Content Ideas Bank</div>'
    +'<button onclick="mktAddIdea()" style="padding:7px 16px;border:none;border-radius:10px;background:linear-gradient(135deg,#f97316,#fb923c);color:#fff;font-size:12px;font-weight:700;cursor:pointer">➕ เพิ่มไอเดีย</button>'
    +'</div>';

  if (ideas.length > 0) {
    var TH = 'padding:9px 10px;font-size:11px;font-weight:700;color:#fff;background:#1e293b;white-space:nowrap;';
    html += '<div style="overflow-x:auto;border-radius:12px;border:1px solid #e2e8f0"><table style="width:100%;border-collapse:collapse;font-size:12px">'
      +'<thead><tr>'
      +'<th style="'+TH+'text-align:left">Idea</th>'
      +'<th style="'+TH+'text-align:left">Category</th>'
      +'<th style="'+TH+'text-align:left">Product</th>'
      +'<th style="'+TH+'text-align:center">Priority</th>'
      +'<th style="'+TH+'text-align:center">Status</th>'
      +'<th style="'+TH+'text-align:center">จัดการ</th>'
      +'</tr></thead><tbody>';

    ideas.forEach(function(idea, i) {
      var priObj = CONTENT_PRIORITIES.find(function(p){return p.key===idea.priority;}) || CONTENT_PRIORITIES[0];
      var isReady = idea.ideaStatus === 'ready';
      html += '<tr style="border-bottom:1px solid #f1f5f9;background:'+(i%2?'#fafafa':'#fff')+'">'
        +'<td style="padding:7px 10px;font-weight:600;color:#1e293b">'+(idea.title||'—')+'</td>'
        +'<td style="padding:7px 10px;color:#475569"><span style="padding:2px 8px;border-radius:8px;font-size:10px;font-weight:600;background:'+(CONTENT_TYPE_COLORS[idea.category]||'#64748b')+'20;color:'+(CONTENT_TYPE_COLORS[idea.category]||'#64748b')+'">'+(idea.category||'—')+'</span></td>'
        +'<td style="padding:7px 10px;color:#475569">'+(idea.product||'—')+'</td>'
        +'<td style="padding:7px 10px;text-align:center">'+priObj.icon+'</td>'
        +'<td style="padding:7px 10px;text-align:center"><span style="padding:3px 10px;border-radius:10px;font-size:10px;font-weight:700;background:'+(isReady?'#bbf7d0':'#f1f5f9')+';color:'+(isReady?'#16a34a':'#64748b')+'">'+(isReady?'✅ Ready':'💡 Idea')+'</span></td>'
        +'<td style="padding:7px 10px;text-align:center;white-space:nowrap">'
        +'<button onclick="mktIdeaToContent('+i+')" style="border:none;background:none;cursor:pointer;font-size:12px" title="Add to Calendar">📅</button>'
        +'<button onclick="mktDeleteIdea('+i+')" style="border:none;background:none;cursor:pointer;font-size:12px" title="ลบ">🗑️</button>'
        +'</td></tr>';
    });
    html += '</tbody></table></div>';
  } else {
    html += _emptyState('💡', 'ยังไม่มีไอเดีย', 'เก็บไอเดีย Content ไว้ก่อน แล้วกด Add to Calendar เมื่อพร้อม');
  }

  el.innerHTML = html;
}

// ─── 4.6 Content Performance ───
function _renderContentPerformance(el) {
  var data = _loadMktData();
  var contents = data.contents || [];
  var published = contents.filter(function(c){return c.perf && (c.perf.reach||c.perf.engagement||c.perf.sales);});

  var html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_contentView=\'dashboard\';renderMktContent()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b">📊 Content Performance</div></div>';

  if (published.length === 0) {
    html += _emptyState('📊', 'ยังไม่มีข้อมูล Performance', 'เผยแพร่ Content แล้วบันทึกผลลัพธ์เพื่อดู Performance');
    el.innerHTML = html;
    return;
  }

  // Summary
  var totalReach = published.reduce(function(s,c){return s+(c.perf.reach||0);},0);
  var totalEng = published.reduce(function(s,c){return s+(c.perf.engagement||0);},0);
  var totalViews = published.reduce(function(s,c){return s+(c.perf.views||0);},0);
  var totalClicks = published.reduce(function(s,c){return s+(c.perf.clicks||0);},0);
  var totalLeads = published.reduce(function(s,c){return s+(c.perf.leads||0);},0);
  var totalSales = published.reduce(function(s,c){return s+(c.perf.sales||0);},0);
  var totalCost = published.reduce(function(s,c){return s+(c.perf.cost||0);},0);
  var avgEngRate = totalReach>0 ? (totalEng/totalReach*100) : 0;
  var roi = totalCost>0 ? ((totalSales-totalCost)/totalCost*100) : 0;

  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">'
    + _card('👁️','Reach รวม', totalReach.toLocaleString(), '', '#2563eb', 'linear-gradient(135deg,#eff6ff,#dbeafe)')
    + _card('❤️','Engagement', totalEng.toLocaleString(), 'Rate '+avgEngRate.toFixed(1)+'%', '#dc2626', 'linear-gradient(135deg,#fef2f2,#fecaca)')
    + _card('🎯','Leads', totalLeads.toLocaleString(), '', '#f97316', 'linear-gradient(135deg,#fff7ed,#fed7aa)')
    + _card('💰','Sales', '฿'+totalSales.toLocaleString(), 'ROI '+roi.toFixed(0)+'%', '#16a34a', 'linear-gradient(135deg,#f0fdf4,#bbf7d0)')
    +'</div>';

  // Top Performing Content
  var sorted = published.slice().sort(function(a,b){return (b.perf.engagement||0)-(a.perf.engagement||0);});
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:20px;margin-bottom:16px">'
    +'<div style="font-size:14px;font-weight:800;color:#1e293b;margin-bottom:14px">🏆 Top Performing Content</div>';

  var TH = 'padding:8px 10px;font-size:10px;font-weight:700;color:#fff;background:#1e293b;white-space:nowrap;';
  html += '<div style="overflow-x:auto;border-radius:10px;border:1px solid #e2e8f0"><table style="width:100%;border-collapse:collapse;font-size:12px">'
    +'<thead><tr>'
    +'<th style="'+TH+'text-align:left">Content</th>'
    +'<th style="'+TH+'text-align:left">Type</th>'
    +'<th style="'+TH+'text-align:right">Reach</th>'
    +'<th style="'+TH+'text-align:right">Engagement</th>'
    +'<th style="'+TH+'text-align:right">Eng. Rate</th>'
    +'<th style="'+TH+'text-align:right">Clicks</th>'
    +'<th style="'+TH+'text-align:right">Sales</th>'
    +'</tr></thead><tbody>';

  sorted.slice(0,10).forEach(function(c, i) {
    var engRate = (c.perf.reach||0) > 0 ? ((c.perf.engagement||0)/(c.perf.reach)*100) : 0;
    html += '<tr style="border-bottom:1px solid #f1f5f9;background:'+(i%2?'#fafafa':'#fff')+'">'
      +'<td style="padding:6px 10px;font-weight:600;color:#1e293b">'+(c.title||'—')+'</td>'
      +'<td style="padding:6px 10px"><span style="padding:2px 6px;border-radius:6px;font-size:10px;font-weight:600;background:'+(CONTENT_TYPE_COLORS[c.contentType]||'#64748b')+'20;color:'+(CONTENT_TYPE_COLORS[c.contentType]||'#64748b')+'">'+(c.contentType||'')+'</span></td>'
      +'<td style="padding:6px 10px;text-align:right">'+(c.perf.reach||0).toLocaleString()+'</td>'
      +'<td style="padding:6px 10px;text-align:right;font-weight:700;color:#dc2626">'+(c.perf.engagement||0).toLocaleString()+'</td>'
      +'<td style="padding:6px 10px;text-align:right;font-weight:600;color:#f97316">'+engRate.toFixed(1)+'%</td>'
      +'<td style="padding:6px 10px;text-align:right">'+(c.perf.clicks||0).toLocaleString()+'</td>'
      +'<td style="padding:6px 10px;text-align:right;font-weight:700;color:#16a34a">฿'+(c.perf.sales||0).toLocaleString()+'</td>'
      +'</tr>';
  });
  html += '</tbody></table></div></div>';

  // AI Analysis
  html += _renderContentAI(contents);

  el.innerHTML = html;
}

// ─── 4.7 AI Content Analysis ───
function _renderContentAI(contents) {
  if (contents.length === 0) return '';
  var insights = [];
  var recs = [];

  var published = contents.filter(function(c){return c.status==='published'||c.status==='analyze';});
  var drafts = contents.filter(function(c){return c.status==='draft';});
  var overdue = contents.filter(function(c){
    if (c.status==='published'||c.status==='analyze') return false;
    return c.publishDate && new Date(c.publishDate) < new Date();
  });

  if (overdue.length > 0) insights.push('🔴 มี Content Overdue '+overdue.length+' รายการ — ควรอัปเดตสถานะหรือปรับวันเผยแพร่');
  if (drafts.length > 5) insights.push('📝 มี Draft สะสม '+drafts.length+' รายการ — ควร review และ push เข้า workflow');

  // Content type distribution
  var typeCount = {};
  contents.forEach(function(c){ if(c.contentType) typeCount[c.contentType]=(typeCount[c.contentType]||0)+1; });
  var types = Object.keys(typeCount);
  if (types.length === 1 && contents.length >= 5) recs.push('ใช้ Content ประเภทเดียว ('+types[0]+') — ควรกระจายหลายรูปแบบเพื่อเพิ่ม Engagement');

  // Platform analysis
  var platCount = {};
  contents.forEach(function(c){ (c.platforms||[]).forEach(function(p){ platCount[p]=(platCount[p]||0)+1; }); });
  var bestPlat = null, bestCount = 0;
  Object.keys(platCount).forEach(function(p){ if(platCount[p]>bestCount){bestCount=platCount[p];bestPlat=p;} });
  if (bestPlat) insights.push('📊 Platform หลัก: '+bestPlat+' ('+bestCount+' Content)');

  // Performance insights
  var withPerf = contents.filter(function(c){return c.perf&&(c.perf.engagement||0)>0;});
  if (withPerf.length >= 2) {
    var bestEng = withPerf.sort(function(a,b){return (b.perf.engagement||0)-(a.perf.engagement||0);})[0];
    insights.push('🏆 Content Engagement สูงสุด: "'+bestEng.title+'" ('+(bestEng.perf.engagement||0).toLocaleString()+' engagement)');

    var engByType = {};
    withPerf.forEach(function(c){
      var t = c.contentType||'Other';
      if(!engByType[t]) engByType[t]={total:0,count:0};
      engByType[t].total += (c.perf.engagement||0);
      engByType[t].count++;
    });
    var bestType = null, bestAvg = 0;
    Object.keys(engByType).forEach(function(t){
      var avg = engByType[t].total/engByType[t].count;
      if(avg>bestAvg){bestAvg=avg;bestType=t;}
    });
    if (bestType) recs.push('Content ประเภท "'+bestType+'" ให้ Engagement เฉลี่ยสูงสุด — ควรเพิ่มสัดส่วน');
  }

  // Content gap analysis
  var now = new Date();
  var next7 = [];
  for (var d = 0; d < 7; d++) {
    var day = new Date(now.getTime()+d*86400000);
    var ds = day.toISOString().split('T')[0];
    var hasContent = contents.some(function(c){return c.publishDate===ds;});
    if (!hasContent) next7.push(DAY_NAMES[day.getDay()]+' '+day.getDate());
  }
  if (next7.length > 0 && next7.length < 7) recs.push('Content Gap: ไม่มี Content วัน '+next7.join(', ')+' ใน 7 วันข้างหน้า');

  if (insights.length === 0 && recs.length === 0) return '';

  var html = '<div style="margin-top:20px;background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-radius:14px;padding:18px 22px;border:1px solid #c4b5fd">'
    +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">'
    +'<span style="font-size:20px">🤖</span>'
    +'<span style="font-size:15px;font-weight:800;color:#1e293b">AI Content Assistant</span></div>';

  if (insights.length > 0) {
    insights.forEach(function(ins) {
      html += '<div style="font-size:12px;color:#1e293b;padding:6px 0;border-bottom:1px solid rgba(124,58,237,.1)">'+ins+'</div>';
    });
  }
  if (recs.length > 0) {
    html += '<div style="font-size:12px;font-weight:700;color:#7c3aed;margin:10px 0 6px">💡 Recommendation:</div>';
    recs.forEach(function(r) {
      html += '<div style="font-size:12px;color:#475569;padding:3px 0">• '+r+'</div>';
    });
  }
  html += '</div>';
  return html;
}

// ─── Save / Delete / Status Actions ───
window.mktSaveContent = function() {
  var titleEl = document.getElementById('cc_title');
  if (!titleEl || !titleEl.value.trim()) { alert('กรุณากรอกชื่อ Content'); return; }

  var data = _loadMktData();
  if (!data.contents) data.contents = [];
  var c = window._contentEditIdx >= 0 && data.contents[window._contentEditIdx] ? data.contents[window._contentEditIdx] : {};

  c.title = titleEl.value.trim();
  c.contentId = (document.getElementById('cc_id')||{}).value || '';
  c.contentType = (document.getElementById('cc_type')||{}).value || '';
  c.topic = (document.getElementById('cc_topic')||{}).value || '';
  c.caption = (document.getElementById('cc_caption')||{}).value || '';
  c.publishDate = (document.getElementById('cc_date')||{}).value || '';
  c.publishTime = (document.getElementById('cc_time')||{}).value || '';
  c.responsible = (document.getElementById('cc_responsible')||{}).value || '';
  c.reviewer = (document.getElementById('cc_reviewer')||{}).value || '';
  c.priority = (document.getElementById('cc_priority')||{}).value || 'medium';
  c.status = (document.getElementById('cc_status')||{}).value || 'draft';
  c.mediaType = (document.getElementById('cc_mediaType')||{}).value || '';
  c.mediaNotes = (document.getElementById('cc_mediaNotes')||{}).value || '';
  c.planLink = (document.getElementById('cc_planLink')||{}).value || '';
  c.campLink = (document.getElementById('cc_campLink')||{}).value || '';

  c.platforms = [];
  document.querySelectorAll('.cc_platform:checked').forEach(function(cb){ c.platforms.push(cb.value); });

  // Performance data
  if (document.getElementById('cc_pReach')) {
    if (!c.perf) c.perf = {};
    c.perf.reach = parseInt((document.getElementById('cc_pReach')||{}).value) || 0;
    c.perf.engagement = parseInt((document.getElementById('cc_pEngagement')||{}).value) || 0;
    c.perf.views = parseInt((document.getElementById('cc_pViews')||{}).value) || 0;
    c.perf.clicks = parseInt((document.getElementById('cc_pClicks')||{}).value) || 0;
    c.perf.leads = parseInt((document.getElementById('cc_pLeads')||{}).value) || 0;
    c.perf.sales = parseFloat((document.getElementById('cc_pSales')||{}).value) || 0;
    c.perf.cost = parseFloat((document.getElementById('cc_pCost')||{}).value) || 0;
  }

  // backward compat
  c.date = c.publishDate;
  c.platform = (c.platforms||[])[0] || '';
  c.type = c.contentType;

  if (window._contentEditIdx < 0) {
    data.contents.push(c);
  } else {
    data.contents[window._contentEditIdx] = c;
  }

  _saveMktData(data);
  window._contentView = 'dashboard';
  renderMktContent();
};

window.mktAddContent = function() {
  window._contentEditIdx = -1;
  window._contentView = 'form';
  renderMktContent();
};

window.mktDeleteContent = function(i) {
  if (!confirm('ลบ Content นี้?')) return;
  var data = _loadMktData();
  data.contents.splice(i, 1);
  _saveMktData(data);
  renderMktContent();
};

window.mktContentNextStatus = function(i) {
  var data = _loadMktData();
  var c = data.contents[i]; if (!c) return;
  var keys = CONTENT_STATUSES.map(function(s){return s.key;});
  var curr = keys.indexOf(c.status);
  c.status = keys[Math.min(curr + 1, keys.length - 1)];
  _saveMktData(data);
  renderMktContent();
};

window.mktAddIdea = function() {
  var title = prompt('ชื่อไอเดีย:');
  if (!title) return;
  var category = prompt('Category (Product/Promotion/Brand/Knowledge/Review):') || 'Product';
  var product = prompt('สินค้า:') || '';
  var priority = prompt('Priority (low/medium/high/urgent):') || 'medium';
  var data = _loadMktData();
  if (!data.contentIdeas) data.contentIdeas = [];
  data.contentIdeas.push({title:title, category:category, product:product, priority:priority, ideaStatus:'idea'});
  _saveMktData(data);
  renderMktContent();
};

window.mktIdeaToContent = function(i) {
  var data = _loadMktData();
  var idea = (data.contentIdeas||[])[i];
  if (!idea) return;
  if (!data.contents) data.contents = [];
  data.contents.push({
    title: idea.title, contentType: idea.category, topic: idea.product,
    status: 'draft', priority: idea.priority, platforms: [], caption: '', perf: {}
  });
  idea.ideaStatus = 'ready';
  _saveMktData(data);
  window._contentView = 'dashboard';
  renderMktContent();
};

window.mktDeleteIdea = function(i) {
  if (!confirm('ลบไอเดียนี้?')) return;
  var data = _loadMktData();
  data.contentIdeas.splice(i, 1);
  _saveMktData(data);
  renderMktContent();
};

// ── 5. Influencer Management (Full System) ──
window._infView = 'dashboard'; // dashboard | form | detail | campaign | seeding | performance
window._infEditIdx = -1;
window._infDetailIdx = -1;
window._infCampEditIdx = -1;

var INF_PLATFORMS = ['TikTok','Instagram','Facebook','YouTube','LINE OA','Twitter','Website'];
var INF_CATEGORIES = ['Food','Café','Lifestyle','Family','Student','Healthy','Local/จังหวัด','Travel','Beauty','Tech'];
var INF_TIERS = [
  {key:'mega', label:'Mega (1M+)', icon:'👑', min:1000000},
  {key:'macro', label:'Macro (100K–1M)', icon:'⭐', min:100000},
  {key:'mid', label:'Mid-tier (50K–100K)', icon:'🔥', min:50000},
  {key:'micro', label:'Micro (10K–50K)', icon:'💫', min:10000},
  {key:'nano', label:'Nano (<10K)', icon:'🌱', min:0}
];
var INF_WORKFLOW = [
  {key:'new',icon:'🆕',label:'New',color:'#94a3b8'},
  {key:'contacted',icon:'📞',label:'Contacted',color:'#2563eb'},
  {key:'negotiating',icon:'💬',label:'Negotiating',color:'#d97706'},
  {key:'confirmed',icon:'✅',label:'Confirmed',color:'#16a34a'},
  {key:'product_sent',icon:'📦',label:'Product Sent',color:'#7c3aed'},
  {key:'content_review',icon:'🔍',label:'Content Review',color:'#f97316'},
  {key:'published',icon:'🟢',label:'Published',color:'#059669'},
  {key:'performance',icon:'📊',label:'Performance',color:'#0891b2'},
  {key:'completed',icon:'🏁',label:'Completed',color:'#1e293b'}
];

function _getInfTier(followers) {
  for (var i = 0; i < INF_TIERS.length; i++) {
    if ((followers||0) >= INF_TIERS[i].min) return INF_TIERS[i];
  }
  return INF_TIERS[INF_TIERS.length-1];
}

function _fmtFollowers(n) {
  if (!n) return '0';
  if (n >= 1000000) return (n/1000000).toFixed(1)+'M';
  if (n >= 1000) return (n/1000).toFixed(1)+'K';
  return n.toString();
}

function renderMktInfluencer() {
  var el = document.getElementById('mktInfluencerContent');
  if (!el) return;
  switch(window._infView) {
    case 'form':        _renderInfForm(el); break;
    case 'detail':      _renderInfDetail(el); break;
    case 'campaign':    _renderInfCampaigns(el); break;
    case 'seeding':     _renderInfSeeding(el); break;
    case 'performance': _renderInfPerformance(el); break;
    default:            _renderInfDashboard(el);
  }
}
window.renderMktInfluencer = renderMktInfluencer;

// ─── 5.1 Influencer Dashboard ───
function _renderInfDashboard(el) {
  var data = _loadMktData();
  var infs = data.influencers || [];
  var infCamps = data.infCampaigns || [];

  var active = infs.filter(function(x){return x.status==='active';}).length;
  var inCamp = infCamps.filter(function(x){return x.wfStatus && x.wfStatus!=='completed';}).length;
  var waiting = infCamps.filter(function(x){return x.wfStatus==='content_review'||x.wfStatus==='product_sent';}).length;
  var done = infCamps.filter(function(x){return x.wfStatus==='completed';}).length;
  var totalBudget = infs.reduce(function(s,x){return s+(x.cost||0);},0) + infCamps.reduce(function(s,x){return s+(x.fee||0);},0);
  var totalReach = infs.reduce(function(s,x){return s+(x.reach||0);},0);
  var totalSales = infs.reduce(function(s,x){return s+(x.revenue||0);},0);
  var roi = totalBudget > 0 ? (totalSales / totalBudget) : 0;

  var html = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap">'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b;flex:1">🌟 Influencer Management</div>'
    +'<button onclick="_infView=\'form\';_infEditIdx=-1;renderMktInfluencer()" style="padding:7px 16px;border:none;border-radius:10px;background:linear-gradient(135deg,#d97706,#f59e0b);color:#fff;font-size:12px;font-weight:700;cursor:pointer">➕ Add Influencer</button>'
    +'<button onclick="_infView=\'campaign\';renderMktInfluencer()" style="padding:7px 16px;border:1.5px solid #7c3aed;border-radius:10px;background:#fff;color:#7c3aed;font-size:12px;font-weight:700;cursor:pointer">📢 Campaign</button>'
    +'<button onclick="_infView=\'seeding\';renderMktInfluencer()" style="padding:7px 16px;border:1.5px solid #16a34a;border-radius:10px;background:#fff;color:#16a34a;font-size:12px;font-weight:700;cursor:pointer">🎁 Seeding</button>'
    +'<button onclick="_infView=\'performance\';renderMktInfluencer()" style="padding:7px 16px;border:1.5px solid #2563eb;border-radius:10px;background:#fff;color:#2563eb;font-size:12px;font-weight:700;cursor:pointer">📊 Performance</button>'
    +'<button onclick="mktImportOnlineInfluencers()" style="padding:7px 16px;border:1.5px solid #f97316;border-radius:10px;background:#fff;color:#f97316;font-size:12px;font-weight:700;cursor:pointer">📥 Import จาก Online</button>'
    +'</div>';

  // KPI
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px">'
    + _card('👤','Influencer ทั้งหมด', infs.length, 'คน', '#d97706', 'linear-gradient(135deg,#fffbeb,#fef3c7)')
    + _card('🟢','Active', active, 'คน', '#16a34a', 'linear-gradient(135deg,#f0fdf4,#bbf7d0)')
    + _card('📢','กำลังทำ Campaign', inCamp, 'รายการ', '#7c3aed', 'linear-gradient(135deg,#f5f3ff,#ede9fe)')
    + _card('✅','Campaign สำเร็จ', done, 'รายการ', '#2563eb', 'linear-gradient(135deg,#eff6ff,#dbeafe)')
    +'</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px">'
    + _card('💰','งบ Influencer', '฿'+totalBudget.toLocaleString(), 'บาท', '#dc2626', 'linear-gradient(135deg,#fef2f2,#fecaca)')
    + _card('📈','Reach รวม', _fmtFollowers(totalReach), '', '#2563eb', 'linear-gradient(135deg,#eff6ff,#dbeafe)')
    + _card('💵','ยอดขาย', '฿'+totalSales.toLocaleString(), '', '#16a34a', 'linear-gradient(135deg,#f0fdf4,#bbf7d0)')
    + _card('⭐','ROI', roi.toFixed(1)+'x', roi>=1?'คุ้มค่า':'ต่ำ', roi>=1?'#16a34a':'#dc2626', roi>=1?'linear-gradient(135deg,#f0fdf4,#bbf7d0)':'linear-gradient(135deg,#fef2f2,#fecaca)')
    +'</div>';

  // Influencer Database Table
  if (infs.length > 0) {
    var TH = 'padding:8px 10px;font-size:10px;font-weight:700;color:#fff;background:#1e293b;white-space:nowrap;';
    html += '<div style="overflow-x:auto;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:16px"><table style="width:100%;border-collapse:collapse;font-size:12px">'
      +'<thead><tr>'
      +'<th style="'+TH+'text-align:left">Influencer</th>'
      +'<th style="'+TH+'text-align:left">Platform</th>'
      +'<th style="'+TH+'text-align:left">Category</th>'
      +'<th style="'+TH+'text-align:right">Followers</th>'
      +'<th style="'+TH+'text-align:right">Eng.Rate</th>'
      +'<th style="'+TH+'text-align:right">Rate</th>'
      +'<th style="'+TH+'text-align:center">Tier</th>'
      +'<th style="'+TH+'text-align:center">Status</th>'
      +'<th style="'+TH+'text-align:center">จัดการ</th>'
      +'</tr></thead><tbody>';

    infs.forEach(function(inf, i) {
      var tier = _getInfTier(inf.followers);
      var isActive = inf.status === 'active';
      html += '<tr style="border-bottom:1px solid #f1f5f9;background:'+(i%2?'#fafafa':'#fff')+';cursor:pointer" onclick="_infDetailIdx='+i+';_infView=\'detail\';renderMktInfluencer()">'
        +'<td style="padding:7px 10px"><div style="font-weight:700;color:#1e293b">'+(inf.name||'')+'</div><div style="font-size:10px;color:#94a3b8">'+(inf.realName||'')+'</div></td>'
        +'<td style="padding:7px 10px"><span style="font-size:14px">'+(PLATFORM_ICONS[inf.platform]||'📣')+'</span> <span style="font-size:11px;color:#475569">'+(inf.platform||'')+'</span></td>'
        +'<td style="padding:7px 10px;font-size:11px;color:#475569">'+(inf.category||'—')+'</td>'
        +'<td style="padding:7px 10px;text-align:right;font-weight:700;color:#1e293b">'+_fmtFollowers(inf.followers)+'</td>'
        +'<td style="padding:7px 10px;text-align:right;font-weight:600;color:#f97316">'+(inf.engRate||0).toFixed(1)+'%</td>'
        +'<td style="padding:7px 10px;text-align:right;font-weight:600;color:#2563eb">฿'+(inf.ratePost||0).toLocaleString()+'</td>'
        +'<td style="padding:7px 10px;text-align:center"><span style="font-size:11px">'+tier.icon+' </span><span style="font-size:10px;color:#64748b">'+tier.label.split(' ')[0]+'</span></td>'
        +'<td style="padding:7px 10px;text-align:center"><span style="padding:2px 8px;border-radius:8px;font-size:10px;font-weight:700;background:'+(isActive?'#bbf7d0':'#f1f5f9')+';color:'+(isActive?'#16a34a':'#64748b')+'">'+(isActive?'🟢 Active':'⚪ Inactive')+'</span></td>'
        +'<td style="padding:7px 10px;text-align:center;white-space:nowrap" onclick="event.stopPropagation()">'
        +'<button onclick="_infEditIdx='+i+';_infView=\'form\';renderMktInfluencer()" style="border:none;background:none;cursor:pointer;font-size:13px">✏️</button>'
        +'<button onclick="mktDeleteInfluencer('+i+')" style="border:none;background:none;cursor:pointer;font-size:13px">🗑️</button>'
        +'</td></tr>';
    });
    html += '</tbody></table></div>';
  } else {
    html += _emptyState('🌟', 'ยังไม่มี Influencer', 'กดปุ่ม "Add Influencer" เพื่อเริ่มสร้างฐานข้อมูล Influencer');
  }

  // Top Ranking + AI
  html += _renderInfRanking(infs);
  html += _renderInfAI(infs, infCamps);

  el.innerHTML = html;
}

// ─── 5.2 Influencer Form ───
function _renderInfForm(el) {
  var data = _loadMktData();
  var infs = data.influencers || [];
  var inf = window._infEditIdx >= 0 && infs[window._infEditIdx] ? infs[window._infEditIdx] : {};
  var isEdit = window._infEditIdx >= 0;
  var S = 'padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;width:100%;box-sizing:border-box;';

  var html = '<div style="max-width:900px;margin:0 auto">'
    +'<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_infView=\'dashboard\';renderMktInfluencer()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:16px;font-weight:800;color:#1e293b">'+(isEdit?'✏️ แก้ไข Influencer':'➕ Add Influencer')+'</div></div>';

  // Profile
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:22px;margin-bottom:16px">'
    +'<div style="font-size:14px;font-weight:800;color:#d97706;margin-bottom:16px">👤 Profile</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">🌟 ชื่อ Influencer *</label>'
    +'<input id="if_name" value="'+(inf.name||'').replace(/"/g,'&quot;')+'" placeholder="@username" style="'+S+'font-weight:600"></div>';
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">👤 ชื่อจริง / ชื่อช่อง</label>'
    +'<input id="if_realName" value="'+(inf.realName||'').replace(/"/g,'&quot;')+'" placeholder="" style="'+S+'"></div>';
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📱 Platform</label>'
    +'<select id="if_platform" style="'+S+'"><option value="">— เลือก —</option>';
  INF_PLATFORMS.forEach(function(p){ html += '<option value="'+p+'"'+(inf.platform===p?' selected':'')+'>'+p+'</option>'; });
  html += '</select></div>';
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">🔗 Link ช่อง</label>'
    +'<input id="if_link" value="'+(inf.link||'')+'" placeholder="URL" style="'+S+'"></div>';
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📍 จังหวัด / พื้นที่</label>'
    +'<input id="if_location" value="'+(inf.location||'')+'" placeholder="" style="'+S+'"></div>';
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📋 Category</label>'
    +'<select id="if_category" style="'+S+'"><option value="">— เลือก —</option>';
  INF_CATEGORIES.forEach(function(c){ html += '<option value="'+c+'"'+(inf.category===c?' selected':'')+'>'+c+'</option>'; });
  html += '</select></div>';
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📊 Status</label>'
    +'<select id="if_status" style="'+S+'"><option value="active"'+((inf.status||'active')==='active'?' selected':'')+'>🟢 Active</option><option value="inactive"'+(inf.status==='inactive'?' selected':'')+'>⚪ Inactive</option></select></div>';

  html += '</div></div>';

  // Audience
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:22px;margin-bottom:16px">'
    +'<div style="font-size:14px;font-weight:800;color:#2563eb;margin-bottom:16px">📊 Audience & Performance</div>'
    +'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">';

  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">👥 Followers</label>'
    +'<input type="number" id="if_followers" value="'+(inf.followers||'')+'" placeholder="0" style="'+S+'font-weight:700"></div>';
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">❤️ Engagement Rate (%)</label>'
    +'<input type="number" step="0.1" id="if_engRate" value="'+(inf.engRate||'')+'" placeholder="0.0" style="'+S+'"></div>';
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">👁️ Average Views</label>'
    +'<input type="number" id="if_avgViews" value="'+(inf.avgViews||'')+'" placeholder="0" style="'+S+'"></div>';
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">👍 Average Likes</label>'
    +'<input type="number" id="if_avgLikes" value="'+(inf.avgLikes||'')+'" placeholder="0" style="'+S+'"></div>';
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">💬 Average Comments</label>'
    +'<input type="number" id="if_avgComments" value="'+(inf.avgComments||'')+'" placeholder="0" style="'+S+'"></div>';
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">🎯 Audience</label>'
    +'<input id="if_audience" value="'+(inf.audience||'')+'" placeholder="อายุ/เพศ/พื้นที่" style="'+S+'"></div>';

  html += '</div></div>';

  // Commercial
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:22px;margin-bottom:16px">'
    +'<div style="font-size:14px;font-weight:800;color:#dc2626;margin-bottom:16px">💰 Commercial Rate</div>'
    +'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">';

  var rateFields = [
    {id:'ratePost',label:'ราคา Post'},{id:'rateReel',label:'ราคา Reel'},
    {id:'rateVideo',label:'ราคา Video'},{id:'rateStory',label:'ราคา Story'},
    {id:'rateLive',label:'ราคา Live'},{id:'ratePackage',label:'Package'},
    {id:'rateTravel',label:'ค่าเดินทาง'}
  ];
  rateFields.forEach(function(f) {
    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">💵 '+f.label+' (฿)</label>'
      +'<input type="number" id="if_'+f.id+'" value="'+(inf[f.id]||'')+'" placeholder="0" style="'+S+'"></div>';
  });
  html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📝 เงื่อนไขชำระ</label>'
    +'<input id="if_payTerms" value="'+(inf.payTerms||'')+'" placeholder="เช่น โอนก่อน 50%" style="'+S+'"></div>';

  html += '</div></div>';

  // Cumulative performance (edit only)
  if (isEdit) {
    html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:22px;margin-bottom:16px">'
      +'<div style="font-size:14px;font-weight:800;color:#059669;margin-bottom:16px">📈 ผลลัพธ์สะสม</div>'
      +'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">';
    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">💰 ค่าใช้จ่ายรวม</label>'
      +'<input type="number" id="if_cost" value="'+(inf.cost||'')+'" placeholder="0" style="'+S+'"></div>';
    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">👁️ Reach รวม</label>'
      +'<input type="number" id="if_reach" value="'+(inf.reach||'')+'" placeholder="0" style="'+S+'"></div>';
    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">💵 ยอดขาย</label>'
      +'<input type="number" id="if_revenue" value="'+(inf.revenue||'')+'" placeholder="0" style="'+S+'"></div>';
    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">📊 จำนวน Campaign</label>'
      +'<input type="number" id="if_campCount" value="'+(inf.campCount||'')+'" placeholder="0" style="'+S+'"></div>';
    html += '</div></div>';
  }

  html += '<div style="display:flex;gap:10px">'
    +'<button onclick="mktSaveInfluencer()" style="padding:10px 28px;border:none;border-radius:10px;background:linear-gradient(135deg,#d97706,#f59e0b);color:#fff;font-size:14px;font-weight:700;cursor:pointer">💾 '+(isEdit?'บันทึก':'เพิ่ม Influencer')+'</button>'
    +'<button onclick="_infView=\'dashboard\';renderMktInfluencer()" style="padding:10px 20px;border:1.5px solid #e2e8f0;border-radius:10px;background:#fff;color:#64748b;font-size:13px;font-weight:600;cursor:pointer">ยกเลิก</button>'
    +'</div></div>';

  el.innerHTML = html;
}

// ─── 5.3 Influencer Detail ───
function _renderInfDetail(el) {
  var data = _loadMktData();
  var infs = data.influencers || [];
  var inf = infs[window._infDetailIdx];
  if (!inf) { window._infView = 'dashboard'; renderMktInfluencer(); return; }

  var tier = _getInfTier(inf.followers);
  var roi = (inf.cost||0) > 0 ? ((inf.revenue||0)/(inf.cost)) : 0;
  var infCamps = (data.infCampaigns||[]).filter(function(ic){return ic.influencerIdx===window._infDetailIdx;});

  var html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_infView=\'dashboard\';renderMktInfluencer()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:16px;font-weight:800;color:#1e293b">🌟 Influencer Detail</div></div>';

  // Profile Header
  html += '<div style="background:linear-gradient(135deg,#1e293b,#334155);border-radius:14px;padding:22px 26px;margin-bottom:20px">'
    +'<div style="display:flex;align-items:center;gap:16px">'
    +'<div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#d97706,#f59e0b);display:flex;align-items:center;justify-content:center;font-size:28px">🌟</div>'
    +'<div style="flex:1"><div style="font-size:20px;font-weight:800;color:#fff">'+(inf.name||'')+'</div>'
    +'<div style="font-size:12px;color:#94a3b8">'+(inf.realName||'')+' · '+(PLATFORM_ICONS[inf.platform]||'')+' '+(inf.platform||'')+' · '+(inf.location||'')+'</div>'
    +'<div style="margin-top:6px;display:flex;gap:6px">'
    +'<span style="padding:3px 10px;border-radius:8px;font-size:10px;font-weight:700;background:rgba(255,255,255,.15);color:#fbbf24">'+tier.icon+' '+tier.label+'</span>'
    +'<span style="padding:3px 10px;border-radius:8px;font-size:10px;font-weight:700;background:rgba(255,255,255,.15);color:#a5f3fc">'+(inf.category||'')+'</span>'
    +'</div></div>'
    +'<div style="text-align:center"><div style="font-size:28px;font-weight:800;color:#fbbf24">'+_fmtFollowers(inf.followers)+'</div>'
    +'<div style="font-size:10px;color:#94a3b8">Followers</div></div>'
    +'</div></div>';

  // Stats
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">'
    + _card('❤️','Eng. Rate', (inf.engRate||0).toFixed(1)+'%', '', '#dc2626', 'linear-gradient(135deg,#fef2f2,#fecaca)')
    + _card('👁️','Avg Views', _fmtFollowers(inf.avgViews||0), '', '#2563eb', 'linear-gradient(135deg,#eff6ff,#dbeafe)')
    + _card('👍','Avg Likes', _fmtFollowers(inf.avgLikes||0), '', '#f97316', 'linear-gradient(135deg,#fff7ed,#fed7aa)')
    + _card('💬','Avg Comments', (inf.avgComments||0).toLocaleString(), '', '#7c3aed', 'linear-gradient(135deg,#f5f3ff,#ede9fe)')
    +'</div>';

  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">'
    + _card('💰','ค่าใช้จ่ายรวม', '฿'+(inf.cost||0).toLocaleString(), '', '#dc2626', 'linear-gradient(135deg,#fef2f2,#fecaca)')
    + _card('📈','Reach รวม', _fmtFollowers(inf.reach||0), '', '#2563eb', 'linear-gradient(135deg,#eff6ff,#dbeafe)')
    + _card('💵','ยอดขาย', '฿'+(inf.revenue||0).toLocaleString(), '', '#16a34a', 'linear-gradient(135deg,#f0fdf4,#bbf7d0)')
    + _card('⭐','ROI', roi.toFixed(1)+'x', '', roi>=1?'#16a34a':'#dc2626', roi>=1?'linear-gradient(135deg,#f0fdf4,#bbf7d0)':'linear-gradient(135deg,#fef2f2,#fecaca)')
    +'</div>';

  // Rate Card
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:18px 22px;margin-bottom:16px">'
    +'<div style="font-size:13px;font-weight:800;color:#1e293b;margin-bottom:12px">💰 Rate Card</div>'
    +'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">';
  [{l:'Post',k:'ratePost'},{l:'Reel',k:'rateReel'},{l:'Video',k:'rateVideo'},{l:'Story',k:'rateStory'},{l:'Live',k:'rateLive'},{l:'Package',k:'ratePackage'},{l:'Travel',k:'rateTravel'}].forEach(function(r){
    html += '<div style="text-align:center;padding:8px;background:#f8fafc;border-radius:8px"><div style="font-size:10px;color:#94a3b8">'+r.l+'</div>'
      +'<div style="font-size:14px;font-weight:700;color:#1e293b">฿'+(inf[r.k]||0).toLocaleString()+'</div></div>';
  });
  html += '</div></div>';

  // Campaign History
  if (infCamps.length > 0) {
    html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:18px 22px;margin-bottom:16px">'
      +'<div style="font-size:13px;font-weight:800;color:#7c3aed;margin-bottom:10px">📢 Campaign History</div>';
    infCamps.forEach(function(ic) {
      var wf = INF_WORKFLOW.find(function(w){return w.key===ic.wfStatus;}) || INF_WORKFLOW[0];
      html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f1f5f9">'
        +'<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+wf.color+'"></span>'
        +'<div style="flex:1"><div style="font-size:12px;font-weight:600;color:#1e293b">'+(ic.campName||'')+'</div>'
        +'<div style="font-size:10px;color:#94a3b8">'+(ic.product||'')+' · ฿'+(ic.fee||0).toLocaleString()+'</div></div>'
        +'<span style="padding:2px 8px;border-radius:8px;font-size:10px;font-weight:700;background:'+wf.color+'20;color:'+wf.color+'">'+wf.icon+' '+wf.label+'</span>'
        +'</div>';
    });
    html += '</div>';
  }

  html += '<button onclick="_infEditIdx='+window._infDetailIdx+';_infView=\'form\';renderMktInfluencer()" style="padding:10px 24px;border:none;border-radius:10px;background:linear-gradient(135deg,#d97706,#f59e0b);color:#fff;font-size:13px;font-weight:700;cursor:pointer">✏️ แก้ไข</button>';

  el.innerHTML = html;
}

// ─── 5.4 Influencer Campaign ───
function _renderInfCampaigns(el) {
  var data = _loadMktData();
  var infCamps = data.infCampaigns || [];
  var infs = data.influencers || [];

  var html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_infView=\'dashboard\';renderMktInfluencer()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b;flex:1">📢 Influencer Campaign</div>'
    +'<button onclick="mktAddInfCamp()" style="padding:7px 16px;border:none;border-radius:10px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-size:12px;font-weight:700;cursor:pointer">➕ เพิ่ม Campaign</button>'
    +'</div>';

  // Workflow Kanban
  html += '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:10px;margin-bottom:16px">';
  INF_WORKFLOW.forEach(function(wf) {
    var items = infCamps.filter(function(ic){return ic.wfStatus===wf.key;});
    html += '<div style="min-width:140px;flex:1;background:#f8fafc;border-radius:12px;padding:10px">'
      +'<div style="font-size:11px;font-weight:800;color:'+wf.color+';margin-bottom:8px;text-align:center">'+wf.icon+' '+wf.label+' ('+items.length+')</div>';
    items.forEach(function(ic, ici) {
      var realIdx = infCamps.indexOf(ic);
      var infName = infs[ic.influencerIdx] ? infs[ic.influencerIdx].name : '—';
      html += '<div style="background:#fff;border-radius:8px;padding:8px;margin-bottom:4px;border:1px solid #e2e8f0;border-left:3px solid '+wf.color+';font-size:10px;cursor:pointer" onclick="mktInfCampNext('+realIdx+')">'
        +'<div style="font-weight:700;color:#1e293b">'+(ic.campName||'').substring(0,20)+'</div>'
        +'<div style="color:#94a3b8">'+infName+'</div>'
        +'</div>';
    });
    html += '</div>';
  });
  html += '</div>';

  // Table
  if (infCamps.length > 0) {
    var TH = 'padding:7px 8px;font-size:10px;font-weight:700;color:#fff;background:#1e293b;white-space:nowrap;';
    html += '<div style="overflow-x:auto;border-radius:12px;border:1px solid #e2e8f0"><table style="width:100%;border-collapse:collapse;font-size:11px">'
      +'<thead><tr><th style="'+TH+'text-align:left">Campaign</th><th style="'+TH+'text-align:left">Influencer</th><th style="'+TH+'text-align:left">Product</th><th style="'+TH+'text-align:left">Deliverables</th><th style="'+TH+'text-align:right">Fee</th><th style="'+TH+'text-align:center">Status</th><th style="'+TH+'text-align:center">จัดการ</th></tr></thead><tbody>';
    infCamps.forEach(function(ic, i) {
      var wf = INF_WORKFLOW.find(function(w){return w.key===ic.wfStatus;}) || INF_WORKFLOW[0];
      var infName = infs[ic.influencerIdx] ? infs[ic.influencerIdx].name : '—';
      html += '<tr style="border-bottom:1px solid #f1f5f9">'
        +'<td style="padding:6px 8px;font-weight:600">'+(ic.campName||'')+'</td>'
        +'<td style="padding:6px 8px">'+infName+'</td>'
        +'<td style="padding:6px 8px;color:#475569">'+(ic.product||'')+'</td>'
        +'<td style="padding:6px 8px;color:#475569;font-size:10px">'+(ic.deliverables||'')+'</td>'
        +'<td style="padding:6px 8px;text-align:right;font-weight:700;color:#dc2626">฿'+(ic.fee||0).toLocaleString()+'</td>'
        +'<td style="padding:6px 8px;text-align:center"><span style="padding:2px 8px;border-radius:8px;font-size:9px;font-weight:700;background:'+wf.color+'20;color:'+wf.color+'">'+wf.icon+' '+wf.label+'</span></td>'
        +'<td style="padding:6px 8px;text-align:center"><button onclick="mktInfCampNext('+i+')" style="border:none;background:none;cursor:pointer;font-size:12px" title="เลื่อนสถานะ">⏭️</button><button onclick="mktDeleteInfCamp('+i+')" style="border:none;background:none;cursor:pointer;font-size:12px">🗑️</button></td></tr>';
    });
    html += '</tbody></table></div>';
  } else {
    html += _emptyState('📢', 'ยังไม่มี Campaign', 'สร้าง Influencer Campaign เพื่อติดตาม Workflow');
  }

  el.innerHTML = html;
}

// ─── 5.5 Product Seeding ───
function _renderInfSeeding(el) {
  var data = _loadMktData();
  var seeds = data.infSeedings || [];
  var infs = data.influencers || [];

  var totalCost = seeds.reduce(function(s,x){return s+((x.productCost||0)+(x.shippingCost||0));},0);

  var html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_infView=\'dashboard\';renderMktInfluencer()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b;flex:1">🎁 Product Seeding</div>'
    +'<div style="font-size:13px;font-weight:700;color:#dc2626">ต้นทุนรวม: ฿'+totalCost.toLocaleString()+'</div>'
    +'<button onclick="mktAddSeeding()" style="padding:7px 16px;border:none;border-radius:10px;background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;font-size:12px;font-weight:700;cursor:pointer">➕ เพิ่มการส่ง</button>'
    +'</div>';

  if (seeds.length > 0) {
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px">';
    seeds.forEach(function(sd, i) {
      var infName = infs[sd.influencerIdx] ? infs[sd.influencerIdx].name : '—';
      var cost = (sd.productCost||0) + (sd.shippingCost||0);
      html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;overflow:hidden">'
        +'<div style="background:linear-gradient(135deg,#16a34a,#22c55e);padding:12px 18px;display:flex;justify-content:space-between;align-items:center">'
        +'<div style="font-size:13px;font-weight:800;color:#fff">🎁 '+infName+'</div>'
        +'<span style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;background:rgba(255,255,255,.2);color:#fff">'+(sd.received?'✅ ได้รับแล้ว':'📦 ส่งแล้ว')+'</span>'
        +'</div>'
        +'<div style="padding:14px 18px;font-size:12px">'
        +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">'
        +'<div><span style="color:#94a3b8">สินค้า:</span> <strong>'+(sd.product||'—')+'</strong></div>'
        +'<div><span style="color:#94a3b8">จำนวน:</span> <strong>'+(sd.qty||0)+'</strong></div>'
        +'<div><span style="color:#94a3b8">ราคาสินค้า:</span> <strong>฿'+(sd.productCost||0).toLocaleString()+'</strong></div>'
        +'<div><span style="color:#94a3b8">ค่าขนส่ง:</span> <strong>฿'+(sd.shippingCost||0).toLocaleString()+'</strong></div>'
        +'<div><span style="color:#94a3b8">วันที่ส่ง:</span> <strong>'+(sd.sentDate||'—')+'</strong></div>'
        +'<div><span style="color:#94a3b8">Tracking:</span> <strong>'+(sd.tracking||'—')+'</strong></div>'
        +'</div>'
        +'<div style="font-size:11px;font-weight:700;color:#dc2626">ต้นทุนรวม: ฿'+cost.toLocaleString()+'</div>'
        +'<div style="margin-top:8px"><button onclick="mktDeleteSeeding('+i+')" style="padding:4px 12px;border:1.5px solid #fecaca;border-radius:8px;background:#fef2f2;color:#dc2626;font-size:10px;cursor:pointer">🗑️ ลบ</button></div>'
        +'</div></div>';
    });
    html += '</div>';
  } else {
    html += _emptyState('🎁', 'ยังไม่มีการส่งสินค้า', 'เพิ่มรายการส่งสินค้าให้ Influencer');
  }

  el.innerHTML = html;
}

// ─── 5.6 Influencer Performance & Ranking ───
function _renderInfPerformance(el) {
  var data = _loadMktData();
  var infs = data.influencers || [];
  var withData = infs.filter(function(x){return (x.reach||0)>0||(x.revenue||0)>0;});

  var html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_infView=\'dashboard\';renderMktInfluencer()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b">📊 Influencer Performance</div></div>';

  if (withData.length === 0) {
    html += _emptyState('📊', 'ยังไม่มีข้อมูล Performance', 'เพิ่มข้อมูลผลลัพธ์ใน Influencer Profile');
    el.innerHTML = html;
    return;
  }

  // Summary
  var totalCost = withData.reduce(function(s,x){return s+(x.cost||0);},0);
  var totalReach = withData.reduce(function(s,x){return s+(x.reach||0);},0);
  var totalSales = withData.reduce(function(s,x){return s+(x.revenue||0);},0);
  var cpm = totalReach>0 ? (totalCost/(totalReach/1000)) : 0;
  var roas = totalCost>0 ? (totalSales/totalCost) : 0;

  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px">'
    + _card('💰','Total Spend', '฿'+totalCost.toLocaleString(), '', '#dc2626', 'linear-gradient(135deg,#fef2f2,#fecaca)')
    + _card('👁️','Total Reach', _fmtFollowers(totalReach), '', '#2563eb', 'linear-gradient(135deg,#eff6ff,#dbeafe)')
    + _card('📊','CPM', '฿'+cpm.toFixed(0), '', '#f97316', 'linear-gradient(135deg,#fff7ed,#fed7aa)')
    + _card('⭐','ROAS', roas.toFixed(1)+'x', '', roas>=1?'#16a34a':'#dc2626', roas>=1?'linear-gradient(135deg,#f0fdf4,#bbf7d0)':'linear-gradient(135deg,#fef2f2,#fecaca)')
    +'</div>';

  // Ranking table
  html += _renderInfRanking(infs);
  html += _renderInfAI(infs, data.infCampaigns||[]);

  el.innerHTML = html;
}

// ─── 5.7 Ranking ───
function _renderInfRanking(infs) {
  var ranked = infs.filter(function(x){return (x.revenue||0)>0||(x.reach||0)>0;}).slice().sort(function(a,b){
    var roiA = (a.cost||0)>0 ? ((a.revenue||0)/(a.cost)) : 0;
    var roiB = (b.cost||0)>0 ? ((b.revenue||0)/(b.cost)) : 0;
    return roiB - roiA;
  });
  if (ranked.length === 0) return '';

  var medals = ['🥇','🥈','🥉'];
  var html = '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:18px 22px;margin-bottom:16px">'
    +'<div style="font-size:14px;font-weight:800;color:#1e293b;margin-bottom:14px">🏆 Influencer Ranking (by ROI)</div>';

  ranked.slice(0,5).forEach(function(inf, i) {
    var roi = (inf.cost||0)>0 ? ((inf.revenue||0)/(inf.cost)) : 0;
    html += '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f1f5f9">'
      +'<span style="font-size:20px;width:30px;text-align:center">'+(medals[i]||'🔹')+'</span>'
      +'<div style="flex:1"><div style="font-size:13px;font-weight:700;color:#1e293b">'+(inf.name||'')+'</div>'
      +'<div style="font-size:10px;color:#94a3b8">'+(PLATFORM_ICONS[inf.platform]||'')+' '+(inf.platform||'')+' · '+_fmtFollowers(inf.followers)+' followers · Eng '+((inf.engRate||0).toFixed(1))+'%</div></div>'
      +'<div style="text-align:right"><div style="font-size:14px;font-weight:800;color:#16a34a">'+roi.toFixed(1)+'x ROI</div>'
      +'<div style="font-size:10px;color:#64748b">Sales ฿'+(inf.revenue||0).toLocaleString()+' / Cost ฿'+(inf.cost||0).toLocaleString()+'</div></div>'
      +'</div>';
  });
  html += '</div>';
  return html;
}

// ─── 5.8 AI Influencer Recommendation ───
function _renderInfAI(infs, infCamps) {
  if (infs.length === 0) return '';
  var insights = [];
  var recs = [];

  // Best performing
  var ranked = infs.filter(function(x){return (x.revenue||0)>0;}).sort(function(a,b){
    return ((b.revenue||0)/(b.cost||1))-((a.revenue||0)/(a.cost||1));
  });
  if (ranked.length > 0) insights.push('🏆 Influencer คุ้มค่าที่สุด: "'+ranked[0].name+'" ROI '+(((ranked[0].revenue||0)/(ranked[0].cost||1))).toFixed(1)+'x');

  // Tier distribution
  var tierMap = {};
  infs.forEach(function(x){ var t = _getInfTier(x.followers); tierMap[t.key]=(tierMap[t.key]||0)+1; });
  var tiers = Object.keys(tierMap);
  if (tiers.length === 1) recs.push('ใช้ Influencer ระดับเดียว — ควรกระจายหลาย Tier (Micro+Macro) เพื่อเพิ่ม Coverage');

  // Platform diversity
  var platMap = {};
  infs.forEach(function(x){ if(x.platform) platMap[x.platform]=(platMap[x.platform]||0)+1; });
  var plats = Object.keys(platMap);
  if (plats.length === 1 && infs.length >= 3) recs.push('ใช้ Platform เดียว ('+plats[0]+') — ควรกระจายไป Instagram/YouTube เพื่อเข้าถึงกลุ่มเป้าหมายที่ต่างกัน');

  // Category match
  var catMap = {};
  infs.forEach(function(x){ if(x.category) catMap[x.category]=(catMap[x.category]||0)+1; });
  var bestCat = null, bestCatCount = 0;
  Object.keys(catMap).forEach(function(c){ if(catMap[c]>bestCatCount){bestCatCount=catMap[c];bestCat=c;} });
  if (bestCat) insights.push('📊 Category หลัก: '+bestCat+' ('+bestCatCount+' คน)');

  // High engagement, low cost
  var gems = infs.filter(function(x){ return (x.engRate||0)>5 && (x.ratePost||0)<15000 && (x.followers||0)>=10000; });
  if (gems.length > 0) recs.push('พบ Hidden Gem: "'+gems[0].name+'" Engagement '+gems[0].engRate+'% แต่ราคาเพียง ฿'+(gems[0].ratePost||0).toLocaleString());

  if (insights.length === 0 && recs.length === 0) return '';

  var html = '<div style="margin-top:16px;background:linear-gradient(135deg,#fffbeb,#fef3c7);border-radius:14px;padding:18px 22px;border:1px solid #fbbf24">'
    +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">'
    +'<span style="font-size:20px">🤖</span>'
    +'<span style="font-size:15px;font-weight:800;color:#1e293b">AI Influencer Recommendation</span></div>';

  insights.forEach(function(ins) {
    html += '<div style="font-size:12px;color:#1e293b;padding:6px 0;border-bottom:1px solid rgba(217,119,6,.1)">'+ins+'</div>';
  });
  if (recs.length > 0) {
    html += '<div style="font-size:12px;font-weight:700;color:#d97706;margin:10px 0 6px">💡 Recommendation:</div>';
    recs.forEach(function(r) {
      html += '<div style="font-size:12px;color:#475569;padding:3px 0">• '+r+'</div>';
    });
  }
  html += '</div>';
  return html;
}

// ─── Save / Delete / Actions ───
window.mktSaveInfluencer = function() {
  var nameEl = document.getElementById('if_name');
  if (!nameEl || !nameEl.value.trim()) { alert('กรุณากรอกชื่อ Influencer'); return; }
  var data = _loadMktData();
  if (!data.influencers) data.influencers = [];
  var inf = window._infEditIdx >= 0 && data.influencers[window._infEditIdx] ? data.influencers[window._infEditIdx] : {};

  inf.name = nameEl.value.trim();
  inf.realName = (document.getElementById('if_realName')||{}).value || '';
  inf.platform = (document.getElementById('if_platform')||{}).value || '';
  inf.link = (document.getElementById('if_link')||{}).value || '';
  inf.location = (document.getElementById('if_location')||{}).value || '';
  inf.category = (document.getElementById('if_category')||{}).value || '';
  inf.status = (document.getElementById('if_status')||{}).value || 'active';
  inf.followers = parseInt((document.getElementById('if_followers')||{}).value) || 0;
  inf.engRate = parseFloat((document.getElementById('if_engRate')||{}).value) || 0;
  inf.avgViews = parseInt((document.getElementById('if_avgViews')||{}).value) || 0;
  inf.avgLikes = parseInt((document.getElementById('if_avgLikes')||{}).value) || 0;
  inf.avgComments = parseInt((document.getElementById('if_avgComments')||{}).value) || 0;
  inf.audience = (document.getElementById('if_audience')||{}).value || '';
  ['ratePost','rateReel','rateVideo','rateStory','rateLive','ratePackage','rateTravel'].forEach(function(f){
    inf[f] = parseFloat((document.getElementById('if_'+f)||{}).value) || 0;
  });
  inf.payTerms = (document.getElementById('if_payTerms')||{}).value || '';

  var costEl = document.getElementById('if_cost');
  if (costEl) {
    inf.cost = parseFloat(costEl.value) || 0;
    inf.reach = parseInt((document.getElementById('if_reach')||{}).value) || 0;
    inf.revenue = parseFloat((document.getElementById('if_revenue')||{}).value) || 0;
    inf.campCount = parseInt((document.getElementById('if_campCount')||{}).value) || 0;
  }

  if (window._infEditIdx < 0) data.influencers.push(inf);
  else data.influencers[window._infEditIdx] = inf;
  _saveMktData(data);
  window._infView = 'dashboard';
  renderMktInfluencer();
};

window.mktAddInfluencer = function() {
  window._infEditIdx = -1;
  window._infView = 'form';
  renderMktInfluencer();
};

window.mktDeleteInfluencer = function(i) {
  if (!confirm('ลบ Influencer นี้?')) return;
  var data = _loadMktData();
  data.influencers.splice(i, 1);
  _saveMktData(data);
  renderMktInfluencer();
};

window.mktAddInfCamp = function() {
  var data = _loadMktData();
  var infs = data.influencers || [];
  if (infs.length === 0) { alert('กรุณาเพิ่ม Influencer ก่อน'); return; }
  var names = infs.map(function(x,i){return (i+1)+'. '+x.name;}).join('\n');
  var idx = parseInt(prompt('เลือก Influencer (ใส่ลำดับ):\n'+names)) - 1;
  if (isNaN(idx) || !infs[idx]) return;
  var campName = prompt('ชื่อ Campaign:');
  if (!campName) return;
  var product = prompt('สินค้า:') || '';
  var deliverables = prompt('Deliverables (เช่น TikTok 1 Video, IG Story 2):') || '';
  var fee = parseInt(prompt('ค่าจ้าง (฿):') || '0');
  if (!data.infCampaigns) data.infCampaigns = [];
  data.infCampaigns.push({influencerIdx:idx, campName:campName, product:product, deliverables:deliverables, fee:fee, wfStatus:'new'});
  _saveMktData(data);
  renderMktInfluencer();
};

window.mktInfCampNext = function(i) {
  var data = _loadMktData();
  var ic = (data.infCampaigns||[])[i]; if (!ic) return;
  var keys = INF_WORKFLOW.map(function(w){return w.key;});
  var curr = keys.indexOf(ic.wfStatus);
  ic.wfStatus = keys[Math.min(curr+1, keys.length-1)];
  _saveMktData(data);
  renderMktInfluencer();
};

window.mktDeleteInfCamp = function(i) {
  if (!confirm('ลบ Campaign นี้?')) return;
  var data = _loadMktData();
  data.infCampaigns.splice(i, 1);
  _saveMktData(data);
  renderMktInfluencer();
};

window.mktAddSeeding = function() {
  var data = _loadMktData();
  var infs = data.influencers || [];
  if (infs.length === 0) { alert('กรุณาเพิ่ม Influencer ก่อน'); return; }
  var names = infs.map(function(x,i){return (i+1)+'. '+x.name;}).join('\n');
  var idx = parseInt(prompt('เลือก Influencer:\n'+names)) - 1;
  if (isNaN(idx) || !infs[idx]) return;
  var product = prompt('สินค้าที่ส่ง:') || '';
  var qty = parseInt(prompt('จำนวน:') || '1');
  var productCost = parseInt(prompt('ราคาสินค้า (฿):') || '0');
  var shippingCost = parseInt(prompt('ค่าขนส่ง (฿):') || '0');
  var sentDate = prompt('วันที่ส่ง (yyyy-mm-dd):') || '';
  var tracking = prompt('Tracking No:') || '';
  if (!data.infSeedings) data.infSeedings = [];
  data.infSeedings.push({influencerIdx:idx, product:product, qty:qty, productCost:productCost, shippingCost:shippingCost, sentDate:sentDate, tracking:tracking, received:false});
  _saveMktData(data);
  renderMktInfluencer();
};

window.mktDeleteSeeding = function(i) {
  if (!confirm('ลบรายการนี้?')) return;
  var data = _loadMktData();
  data.infSeedings.splice(i, 1);
  _saveMktData(data);
  renderMktInfluencer();
};

// ─── Import from Online INFLU_DATA ───
window.mktImportOnlineInfluencers = function() {
  if (typeof INFLU_DATA === 'undefined') { alert('ไม่พบข้อมูล INFLU_DATA'); return; }
  var data = _loadMktData();
  if (!data.influencers) data.influencers = [];
  var existing = {};
  data.influencers.forEach(function(inf) { existing[(inf.name||'').toLowerCase()] = true; });

  var allYears = typeof INFLU_YEARS !== 'undefined' ? INFLU_YEARS : Object.keys(INFLU_DATA).map(Number);
  var uniqueMap = {};

  allYears.forEach(function(yr) {
    var rows = INFLU_DATA[yr] || [];
    rows.forEach(function(d) {
      var key = (d.name || '').trim();
      if (!key) return;
      if (!uniqueMap[key]) {
        var plat = (d.platform || 'TikTok').split('/')[0].trim();
        uniqueMap[key] = {
          name: (d.page || key),
          realName: key,
          platform: plat,
          link: '',
          location: '',
          category: 'Food',
          status: 'active',
          followers: 0,
          engRate: 0,
          avgViews: 0,
          avgLikes: 0,
          avgComments: 0,
          audience: '',
          ratePost: 0,
          rateReel: 0,
          rateVideo: 0,
          rateStory: 0,
          rateLive: 0,
          ratePackage: 0,
          rateTravel: 0,
          payTerms: '',
          cost: 0,
          reach: 0,
          revenue: 0,
          campCount: 0,
          _fees: [],
          _years: []
        };
      }
      var u = uniqueMap[key];
      u.cost += (d.fee || 0);
      u._fees.push(d.fee || 0);
      u.campCount++;
      if (u._years.indexOf(yr) < 0) u._years.push(yr);

      var vStr = String(d.views || '0').replace(/,/g, '');
      var vNum = 0;
      if (vStr.indexOf('M') >= 0) vNum = parseFloat(vStr) * 1000000;
      else if (vStr.indexOf('K') >= 0) vNum = parseFloat(vStr) * 1000;
      else if (!isNaN(parseFloat(vStr))) vNum = parseFloat(vStr);
      u.reach += vNum;
    });
  });

  var added = 0;
  Object.keys(uniqueMap).forEach(function(key) {
    var u = uniqueMap[key];
    if (existing[u.realName.toLowerCase()] || existing[(u.name||'').toLowerCase()]) return;
    var avgFee = u._fees.length ? Math.round(u.cost / u._fees.length) : 0;
    u.ratePost = avgFee;
    u.avgViews = u.campCount > 0 ? Math.round(u.reach / u.campCount) : 0;
    delete u._fees;
    delete u._years;
    data.influencers.push(u);
    added++;
  });

  _saveMktData(data);
  alert('นำเข้าสำเร็จ: เพิ่ม ' + added + ' คน (ข้าม ' + (Object.keys(uniqueMap).length - added) + ' คนที่มีอยู่แล้ว)');
  window._infView = 'dashboard';
  renderMktInfluencer();
};

// ── 6. Marketing Budget (Full System) ──
window._budgetView = 'dashboard'; // dashboard | form | expense | expenseForm | approval | compare | performance
window._budgetEditIdx = -1;
window._expenseEditIdx = -1;

var BUDGET_TYPES = ['📢 Advertising','📱 Social Media','🌟 Influencer','🎪 Event','🎁 Promotion','🎨 Design / Production','📦 Product Sampling','🚚 Transportation','🖨️ Printing','🏢 Booth / Exhibition','📝 Other'];
var BUDGET_STATUSES = [
  {key:'draft',label:'Draft',icon:'🟡',color:'#d97706'},
  {key:'pending',label:'Pending Approval',icon:'🔵',color:'#2563eb'},
  {key:'approved',label:'Approved',icon:'🟢',color:'#16a34a'},
  {key:'rejected',label:'Rejected',icon:'🔴',color:'#dc2626'},
  {key:'closed',label:'Closed',icon:'⚫',color:'#475569'}
];
var BUDGET_CAT_COLORS = {'Advertising':'#ef4444','Social Media':'#3b82f6','Influencer':'#f59e0b','Event':'#8b5cf6','Promotion':'#ec4899','Design / Production':'#14b8a6','Product Sampling':'#f97316','Transportation':'#6366f1','Printing':'#64748b','Booth / Exhibition':'#0891b2','Other':'#94a3b8'};

function _getBudgetData() {
  var data = _loadMktData();
  if (!data.budgetV2) data.budgetV2 = {totalBudget:2000000, budgets:[], expenses:[]};
  return data;
}
function _catKey(cat) { return (cat||'Other').replace(/^[^\s]+\s/,''); }

window.renderMktBudget = renderMktBudget;
function renderMktBudget() {
  var el = document.getElementById('mktBudgetContent');
  if (!el) return;
  switch(window._budgetView) {
    case 'form':        _renderBudgetForm(el); break;
    case 'expense':     _renderExpenseList(el); break;
    case 'expenseForm': _renderExpenseForm(el); break;
    case 'approval':    _renderBudgetApproval(el); break;
    case 'compare':     _renderBudgetCompare(el); break;
    case 'performance': _renderBudgetPerformance(el); break;
    default:            _renderBudgetDashboard(el);
  }
}

// ─── 6.1 Budget Dashboard ───
function _renderBudgetDashboard(el) {
  var data = _getBudgetData();
  var bv = data.budgetV2;
  var budgets = bv.budgets || [];
  var expenses = bv.expenses || [];
  var totalBudget = bv.totalBudget || 0;

  var approved = budgets.filter(function(b){return b.status==='approved';}).reduce(function(s,b){return s+(b.amount||0);},0);
  var actualSpent = expenses.reduce(function(s,e){return s+(e.actual||0);},0);
  var remain = totalBudget - actualSpent;
  var pct = totalBudget > 0 ? (actualSpent/totalBudget*100) : 0;
  var totalSales = expenses.reduce(function(s,e){return s+(e.sales||0);},0);
  var roi = actualSpent > 0 ? (totalSales/actualSpent) : 0;

  var html = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap">'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b;flex:1">💰 Marketing Budget</div>'
    +'<button onclick="_budgetView=\'form\';_budgetEditIdx=-1;renderMktBudget()" style="padding:7px 16px;border:none;border-radius:10px;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;font-size:12px;font-weight:700;cursor:pointer">➕ สร้างงบประมาณ</button>'
    +'<button onclick="_budgetView=\'expense\';renderMktBudget()" style="padding:7px 16px;border:1.5px solid #f97316;border-radius:10px;background:#fff;color:#f97316;font-size:12px;font-weight:700;cursor:pointer">💸 Expense</button>'
    +'<button onclick="_budgetView=\'approval\';renderMktBudget()" style="padding:7px 16px;border:1.5px solid #7c3aed;border-radius:10px;background:#fff;color:#7c3aed;font-size:12px;font-weight:700;cursor:pointer">📋 Approval</button>'
    +'<button onclick="_budgetView=\'compare\';renderMktBudget()" style="padding:7px 16px;border:1.5px solid #0891b2;border-radius:10px;background:#fff;color:#0891b2;font-size:12px;font-weight:700;cursor:pointer">📊 Budget vs Actual</button>'
    +'<button onclick="_budgetView=\'performance\';renderMktBudget()" style="padding:7px 16px;border:1.5px solid #16a34a;border-radius:10px;background:#fff;color:#16a34a;font-size:12px;font-weight:700;cursor:pointer">📈 Performance</button>'
    +'</div>';

  // KPI Cards
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px">'
    + _card('💰','งบประมาณทั้งหมด','฿'+totalBudget.toLocaleString(),'บาท','#2563eb','linear-gradient(135deg,#eff6ff,#dbeafe)')
    + _card('📋','อนุมัติแล้ว','฿'+approved.toLocaleString(),'บาท','#7c3aed','linear-gradient(135deg,#f5f3ff,#ede9fe)')
    + _card('💸','ใช้จริง','฿'+actualSpent.toLocaleString(),'บาท','#f97316','linear-gradient(135deg,#fff7ed,#fed7aa)')
    + _card('🟢','งบคงเหลือ','฿'+remain.toLocaleString(),'บาท',remain>=0?'#16a34a':'#dc2626',remain>=0?'linear-gradient(135deg,#f0fdf4,#bbf7d0)':'linear-gradient(135deg,#fef2f2,#fecaca)')
    +'</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">'
    + _card('📊','ใช้ไปแล้ว',pct.toFixed(1)+'%','',pct>80?'#dc2626':'#16a34a',pct>80?'linear-gradient(135deg,#fef2f2,#fecaca)':'linear-gradient(135deg,#f0fdf4,#bbf7d0)')
    + _card('📈','ยอดขายจาก Marketing','฿'+totalSales.toLocaleString(),'','#2563eb','linear-gradient(135deg,#eff6ff,#dbeafe)')
    + _card('⭐','ROI',roi.toFixed(1)+'x','',roi>=1?'#16a34a':'#dc2626',roi>=1?'linear-gradient(135deg,#f0fdf4,#bbf7d0)':'linear-gradient(135deg,#fef2f2,#fecaca)')
    +'</div>';

  // Progress Bar
  var barColor = pct > 100 ? '#dc2626' : pct > 80 ? '#f97316' : '#16a34a';
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:18px 22px;margin-bottom:16px">'
    +'<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px"><span style="font-weight:700;color:#1e293b">งบทั้งหมด ฿'+totalBudget.toLocaleString()+'</span><span style="font-weight:700;color:'+barColor+'">'+pct.toFixed(1)+'%</span></div>'
    +'<div style="background:#e2e8f0;border-radius:8px;height:20px;overflow:hidden;position:relative">'
    +'<div style="background:'+barColor+';height:100%;width:'+Math.min(pct,100)+'%;border-radius:8px;transition:width .5s"></div></div>'
    +'<div style="display:flex;justify-content:space-between;font-size:11px;margin-top:6px;color:#64748b"><span>ใช้แล้ว ฿'+actualSpent.toLocaleString()+'</span><span>คงเหลือ ฿'+remain.toLocaleString()+'</span></div>'
    +'</div>';

  // Budget Allocation
  html += _renderAllocation(budgets, expenses, totalBudget);

  // Budget Alert
  html += _renderBudgetAlerts(budgets, expenses, totalBudget);

  // AI Analysis
  html += _renderBudgetAI(budgets, expenses, totalBudget, totalSales, roi);

  el.innerHTML = html;
}

// ─── Budget Allocation (Donut-like) ───
function _renderAllocation(budgets, expenses, totalBudget) {
  var catBudget = {}, catActual = {};
  budgets.filter(function(b){return b.status==='approved';}).forEach(function(b) {
    var ck = _catKey(b.budgetType);
    catBudget[ck] = (catBudget[ck]||0) + (b.amount||0);
  });
  expenses.forEach(function(e) {
    var ck = _catKey(e.category);
    catActual[ck] = (catActual[ck]||0) + (e.actual||0);
  });
  var allCats = Object.keys(catBudget);
  Object.keys(catActual).forEach(function(c){ if(allCats.indexOf(c)<0) allCats.push(c); });
  if (allCats.length === 0) return '';

  var html = '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:18px 22px;margin-bottom:16px">'
    +'<div style="font-size:14px;font-weight:800;color:#1e293b;margin-bottom:14px">📊 Budget Allocation</div>';

  // Donut visual (CSS-based)
  var totalAlloc = allCats.reduce(function(s,c){return s+(catBudget[c]||0);},0);
  if (totalAlloc > 0) {
    var segments = [], cumPct = 0;
    allCats.forEach(function(c) {
      var p = ((catBudget[c]||0)/totalAlloc*100);
      var col = BUDGET_CAT_COLORS[c] || '#94a3b8';
      if (p > 0) segments.push(col+' '+cumPct.toFixed(1)+'% '+(cumPct+p).toFixed(1)+'%');
      cumPct += p;
    });
    html += '<div style="display:flex;gap:20px;align-items:center;margin-bottom:14px">'
      +'<div style="width:120px;height:120px;border-radius:50%;background:conic-gradient('+segments.join(',')+');position:relative;flex-shrink:0">'
      +'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:70px;height:70px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#1e293b">฿'+(totalAlloc>=1000000?(totalAlloc/1000000).toFixed(1)+'M':(totalAlloc/1000).toFixed(0)+'K')+'</div></div>'
      +'<div style="flex:1;display:flex;flex-wrap:wrap;gap:6px">';
    allCats.forEach(function(c) {
      var col = BUDGET_CAT_COLORS[c] || '#94a3b8';
      html += '<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:#475569"><span style="width:10px;height:10px;border-radius:3px;background:'+col+'"></span>'+c+'</span>';
    });
    html += '</div></div>';
  }

  // Table
  var TH = 'padding:7px 10px;font-size:10px;font-weight:700;color:#fff;background:#1e293b;white-space:nowrap;';
  html += '<div style="overflow-x:auto;border-radius:10px;border:1px solid #e2e8f0"><table style="width:100%;border-collapse:collapse;font-size:12px">'
    +'<thead><tr><th style="'+TH+'text-align:left">หมวด</th><th style="'+TH+'text-align:right">Budget</th><th style="'+TH+'text-align:right">ใช้จริง</th><th style="'+TH+'text-align:right">คงเหลือ</th><th style="'+TH+'text-align:right">% Used</th></tr></thead><tbody>';
  allCats.forEach(function(c, i) {
    var b = catBudget[c]||0, a = catActual[c]||0, r = b-a, p = b>0?(a/b*100):0;
    var col = BUDGET_CAT_COLORS[c]||'#94a3b8';
    html += '<tr style="border-bottom:1px solid #f1f5f9;background:'+(i%2?'#fafafa':'#fff')+'">'
      +'<td style="padding:6px 10px"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:'+col+';margin-right:6px"></span>'+c+'</td>'
      +'<td style="padding:6px 10px;text-align:right;font-weight:600">฿'+(b>=1000?(b/1000).toFixed(0)+'K':b.toLocaleString())+'</td>'
      +'<td style="padding:6px 10px;text-align:right;font-weight:600;color:#f97316">฿'+(a>=1000?(a/1000).toFixed(0)+'K':a.toLocaleString())+'</td>'
      +'<td style="padding:6px 10px;text-align:right;color:'+(r>=0?'#16a34a':'#dc2626')+'">฿'+(Math.abs(r)>=1000?(Math.abs(r)/1000).toFixed(0)+'K':Math.abs(r).toLocaleString())+(r<0?' (เกิน)':'')+'</td>'
      +'<td style="padding:6px 10px;text-align:right"><span style="padding:2px 8px;border-radius:8px;font-size:10px;font-weight:700;background:'+(p>100?'#fecaca':p>80?'#fed7aa':'#bbf7d0')+';color:'+(p>100?'#dc2626':p>80?'#d97706':'#16a34a')+'">'+p.toFixed(0)+'%</span></td></tr>';
  });
  html += '</tbody></table></div></div>';
  return html;
}

// ─── 6.2 Budget Form ───
function _renderBudgetForm(el) {
  var data = _getBudgetData();
  var bv = data.budgetV2;
  var b = window._budgetEditIdx >= 0 && (bv.budgets||[])[window._budgetEditIdx] ? bv.budgets[window._budgetEditIdx] : {};
  var isEdit = window._budgetEditIdx >= 0;
  var S = 'padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;width:100%;box-sizing:border-box;';

  var html = '<div style="max-width:800px;margin:0 auto">'
    +'<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_budgetView=\'dashboard\';renderMktBudget()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:16px;font-weight:800;color:#1e293b">'+(isEdit?'✏️ แก้ไขงบประมาณ':'➕ สร้างงบประมาณ')+'</div></div>';

  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:22px;margin-bottom:16px">'
    +'<div style="font-size:14px;font-weight:800;color:#2563eb;margin-bottom:16px">📋 ข้อมูล Budget</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">';

  var fields = [
    {id:'bf_year',label:'ปี',type:'number',val:b.year||2026},
    {id:'bf_month',label:'เดือน',type:'select',val:b.month||'',opts:[''].concat(MTH.slice(1))},
    {id:'bf_name',label:'ชื่องบประมาณ *',type:'text',val:b.name||''},
    {id:'bf_type',label:'Budget Type',type:'select',val:b.budgetType||'',opts:[''].concat(BUDGET_TYPES)},
    {id:'bf_plan',label:'Marketing Plan',type:'text',val:b.plan||''},
    {id:'bf_campaign',label:'Campaign',type:'text',val:b.campaign||''},
    {id:'bf_owner',label:'ผู้รับผิดชอบ',type:'text',val:b.owner||''},
    {id:'bf_costCenter',label:'Cost Center',type:'text',val:b.costCenter||''},
    {id:'bf_amount',label:'งบประมาณที่ขอ (฿) *',type:'number',val:b.amount||''},
    {id:'bf_startDate',label:'วันที่เริ่มต้น',type:'date',val:b.startDate||''},
    {id:'bf_endDate',label:'วันที่สิ้นสุด',type:'date',val:b.endDate||''},
    {id:'bf_status',label:'สถานะ',type:'select',val:b.status||'draft',opts:BUDGET_STATUSES.map(function(s){return s.key;})}
  ];

  fields.forEach(function(f) {
    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">'+f.label+'</label>';
    if (f.type === 'select') {
      html += '<select id="'+f.id+'" style="'+S+'">'+f.opts.map(function(o){
        var v = typeof o === 'string' ? o : o;
        return '<option value="'+v+'"'+(f.val===v?' selected':'')+'>'+v+'</option>';
      }).join('')+'</select>';
    } else {
      html += '<input type="'+f.type+'" id="'+f.id+'" value="'+(f.val||'').toString().replace(/"/g,'&quot;')+'" style="'+S+'">';
    }
    html += '</div>';
  });

  html += '</div><div style="margin-top:12px"><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">หมายเหตุ</label>'
    +'<textarea id="bf_note" rows="2" style="'+S+'resize:vertical">'+(b.note||'')+'</textarea></div>';

  html += '</div><div style="display:flex;gap:10px">'
    +'<button onclick="mktSaveBudget()" style="padding:10px 28px;border:none;border-radius:10px;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;font-size:14px;font-weight:700;cursor:pointer">💾 '+(isEdit?'บันทึก':'สร้างงบประมาณ')+'</button>'
    +'<button onclick="_budgetView=\'dashboard\';renderMktBudget()" style="padding:10px 20px;border:1.5px solid #e2e8f0;border-radius:10px;background:#fff;color:#64748b;font-size:13px;font-weight:600;cursor:pointer">ยกเลิก</button>'
    +'</div></div>';

  el.innerHTML = html;
}

// ─── 6.3 Expense List ───
function _renderExpenseList(el) {
  var data = _getBudgetData();
  var expenses = data.budgetV2.expenses || [];

  var html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_budgetView=\'dashboard\';renderMktBudget()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b;flex:1">💸 Marketing Expense</div>'
    +'<button onclick="_budgetView=\'expenseForm\';_expenseEditIdx=-1;renderMktBudget()" style="padding:7px 16px;border:none;border-radius:10px;background:linear-gradient(135deg,#f97316,#fb923c);color:#fff;font-size:12px;font-weight:700;cursor:pointer">➕ บันทึกค่าใช้จ่าย</button>'
    +'</div>';

  if (expenses.length > 0) {
    var TH = 'padding:7px 8px;font-size:10px;font-weight:700;color:#fff;background:#1e293b;white-space:nowrap;';
    html += '<div style="overflow-x:auto;border-radius:12px;border:1px solid #e2e8f0"><table style="width:100%;border-collapse:collapse;font-size:11px">'
      +'<thead><tr><th style="'+TH+'text-align:left">วันที่</th><th style="'+TH+'text-align:left">รายการ</th><th style="'+TH+'text-align:left">Campaign</th><th style="'+TH+'text-align:left">หมวด</th><th style="'+TH+'text-align:right">Budget</th><th style="'+TH+'text-align:right">Actual</th><th style="'+TH+'text-align:right">ส่วนต่าง</th><th style="'+TH+'text-align:center">สถานะ</th><th style="'+TH+'text-align:center">จัดการ</th></tr></thead><tbody>';
    expenses.forEach(function(e, i) {
      var diff = (e.budget||0) - (e.actual||0);
      var diffColor = diff >= 0 ? '#16a34a' : '#dc2626';
      var statusIcon = diff >= 0 ? '✅' : '⚠️';
      html += '<tr style="border-bottom:1px solid #f1f5f9;background:'+(i%2?'#fafafa':'#fff')+'">'
        +'<td style="padding:6px 8px;color:#64748b">'+(e.date||'')+'</td>'
        +'<td style="padding:6px 8px;font-weight:600;color:#1e293b">'+(e.name||'')+'</td>'
        +'<td style="padding:6px 8px;color:#475569">'+(e.campaign||'')+'</td>'
        +'<td style="padding:6px 8px;font-size:10px;color:#475569">'+_catKey(e.category||'')+'</td>'
        +'<td style="padding:6px 8px;text-align:right;color:#2563eb;font-weight:600">฿'+(e.budget||0).toLocaleString()+'</td>'
        +'<td style="padding:6px 8px;text-align:right;color:#f97316;font-weight:700">฿'+(e.actual||0).toLocaleString()+'</td>'
        +'<td style="padding:6px 8px;text-align:right;font-weight:600;color:'+diffColor+'">'+(diff>=0?'':'+')+Math.abs(diff).toLocaleString()+'</td>'
        +'<td style="padding:6px 8px;text-align:center">'+statusIcon+'</td>'
        +'<td style="padding:6px 8px;text-align:center"><button onclick="mktDeleteExpense('+i+')" style="border:none;background:none;cursor:pointer;font-size:12px">🗑️</button></td></tr>';
    });
    var totalBudget = expenses.reduce(function(s,e){return s+(e.budget||0);},0);
    var totalActual = expenses.reduce(function(s,e){return s+(e.actual||0);},0);
    html += '<tr style="background:#1e293b"><td colspan="4" style="padding:7px 8px;font-weight:800;color:#fff">รวม</td>'
      +'<td style="padding:7px 8px;text-align:right;font-weight:800;color:#93c5fd">฿'+totalBudget.toLocaleString()+'</td>'
      +'<td style="padding:7px 8px;text-align:right;font-weight:800;color:#fb923c">฿'+totalActual.toLocaleString()+'</td>'
      +'<td colspan="3"></td></tr>';
    html += '</tbody></table></div>';
  } else {
    html += _emptyState('💸', 'ยังไม่มีค่าใช้จ่าย', 'กดปุ่ม "บันทึกค่าใช้จ่าย" เพื่อเริ่มบันทึก');
  }

  el.innerHTML = html;
}

// ─── 6.4 Expense Form ───
function _renderExpenseForm(el) {
  var data = _getBudgetData();
  var expenses = data.budgetV2.expenses || [];
  var e = window._expenseEditIdx >= 0 && expenses[window._expenseEditIdx] ? expenses[window._expenseEditIdx] : {};
  var isEdit = window._expenseEditIdx >= 0;
  var S = 'padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;width:100%;box-sizing:border-box;';

  var html = '<div style="max-width:700px;margin:0 auto">'
    +'<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_budgetView=\'expense\';renderMktBudget()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:16px;font-weight:800;color:#1e293b">'+(isEdit?'✏️ แก้ไข':'➕ บันทึก')+' ค่าใช้จ่าย</div></div>';

  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:22px">'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">';

  var fields = [
    {id:'ef_date',label:'วันที่',type:'date',val:e.date||''},
    {id:'ef_name',label:'รายการ *',type:'text',val:e.name||''},
    {id:'ef_campaign',label:'Campaign',type:'text',val:e.campaign||''},
    {id:'ef_category',label:'หมวด',type:'select',val:e.category||'',opts:[''].concat(BUDGET_TYPES)},
    {id:'ef_budget',label:'Budget (฿)',type:'number',val:e.budget||''},
    {id:'ef_actual',label:'Actual (฿) *',type:'number',val:e.actual||''},
    {id:'ef_sales',label:'ยอดขายที่ได้ (฿)',type:'number',val:e.sales||''},
    {id:'ef_note',label:'หมายเหตุ',type:'text',val:e.note||''}
  ];

  fields.forEach(function(f) {
    html += '<div><label style="font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px">'+f.label+'</label>';
    if (f.type === 'select') {
      html += '<select id="'+f.id+'" style="'+S+'">'+f.opts.map(function(o){ return '<option value="'+o+'"'+(f.val===o?' selected':'')+'>'+o+'</option>'; }).join('')+'</select>';
    } else {
      html += '<input type="'+f.type+'" id="'+f.id+'" value="'+(f.val||'').toString().replace(/"/g,'&quot;')+'" style="'+S+'">';
    }
    html += '</div>';
  });

  html += '</div></div><div style="margin-top:16px;display:flex;gap:10px">'
    +'<button onclick="mktSaveExpense()" style="padding:10px 28px;border:none;border-radius:10px;background:linear-gradient(135deg,#f97316,#fb923c);color:#fff;font-size:14px;font-weight:700;cursor:pointer">💾 บันทึก</button>'
    +'<button onclick="_budgetView=\'expense\';renderMktBudget()" style="padding:10px 20px;border:1.5px solid #e2e8f0;border-radius:10px;background:#fff;color:#64748b;font-size:13px;font-weight:600;cursor:pointer">ยกเลิก</button>'
    +'</div></div>';

  el.innerHTML = html;
}

// ─── 6.5 Approval Workflow ───
function _renderBudgetApproval(el) {
  var data = _getBudgetData();
  var budgets = data.budgetV2.budgets || [];

  var html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_budgetView=\'dashboard\';renderMktBudget()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b;flex:1">📋 Approval Workflow</div></div>';

  // Workflow diagram
  html += '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:18px 22px;margin-bottom:16px;text-align:center">'
    +'<div style="display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;font-size:11px">';
  ['สร้างคำของบ','ส่งอนุมัติ','Manager','Marketing Manager','ผู้บริหาร','APPROVED','ใช้งบ'].forEach(function(step, i) {
    if (i > 0) html += '<span style="color:#94a3b8">→</span>';
    html += '<span style="padding:4px 10px;border-radius:8px;background:'+(i===5?'#bbf7d0':'#f1f5f9')+';font-weight:600;color:'+(i===5?'#16a34a':'#475569')+'">'+step+'</span>';
  });
  html += '</div></div>';

  // Status groups
  BUDGET_STATUSES.forEach(function(st) {
    var items = budgets.filter(function(b){return b.status===st.key;});
    if (items.length === 0) return;
    html += '<div style="margin-bottom:12px"><div style="font-size:13px;font-weight:700;color:'+st.color+';margin-bottom:8px">'+st.icon+' '+st.label+' ('+items.length+')</div>';
    items.forEach(function(b, bi) {
      var realIdx = budgets.indexOf(b);
      html += '<div style="background:#fff;border-radius:10px;border:1px solid #e2e8f0;border-left:4px solid '+st.color+';padding:12px 16px;margin-bottom:6px;display:flex;align-items:center;gap:12px">'
        +'<div style="flex:1"><div style="font-size:13px;font-weight:700;color:#1e293b">'+(b.name||'')+'</div>'
        +'<div style="font-size:11px;color:#94a3b8">'+_catKey(b.budgetType||'')+' · '+(b.owner||'')+' · ฿'+(b.amount||0).toLocaleString()+'</div></div>';
      if (st.key === 'draft') html += '<button onclick="mktBudgetStatus('+realIdx+',\'pending\')" style="padding:4px 12px;border:none;border-radius:8px;background:#2563eb;color:#fff;font-size:11px;font-weight:700;cursor:pointer">ส่งอนุมัติ</button>';
      if (st.key === 'pending') {
        html += '<button onclick="mktBudgetStatus('+realIdx+',\'approved\')" style="padding:4px 12px;border:none;border-radius:8px;background:#16a34a;color:#fff;font-size:11px;font-weight:700;cursor:pointer;margin-right:4px">อนุมัติ</button>';
        html += '<button onclick="mktBudgetStatus('+realIdx+',\'rejected\')" style="padding:4px 12px;border:none;border-radius:8px;background:#dc2626;color:#fff;font-size:11px;font-weight:700;cursor:pointer">ปฏิเสธ</button>';
      }
      html += '<button onclick="mktDeleteBudgetItem('+realIdx+')" style="border:none;background:none;cursor:pointer;font-size:13px">🗑️</button>'
        +'</div>';
    });
    html += '</div>';
  });

  if (budgets.length === 0) html += _emptyState('📋', 'ยังไม่มีงบประมาณ', 'สร้างงบประมาณจากหน้า Dashboard');

  el.innerHTML = html;
}

// ─── 6.6 Budget vs Actual ───
function _renderBudgetCompare(el) {
  var data = _getBudgetData();
  var bv = data.budgetV2;
  var budgets = bv.budgets || [];
  var expenses = bv.expenses || [];
  var totalBudget = bv.totalBudget || 0;
  var totalActual = expenses.reduce(function(s,e){return s+(e.actual||0);},0);
  var remain = totalBudget - totalActual;
  var pct = totalBudget > 0 ? (totalActual/totalBudget*100) : 0;

  var html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_budgetView=\'dashboard\';renderMktBudget()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b">📊 Budget vs Actual</div></div>';

  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">'
    + _card('💰','Budget','฿'+totalBudget.toLocaleString(),'','#2563eb','linear-gradient(135deg,#eff6ff,#dbeafe)')
    + _card('💸','Actual','฿'+totalActual.toLocaleString(),'','#f97316','linear-gradient(135deg,#fff7ed,#fed7aa)')
    + _card('🟢','Remaining','฿'+remain.toLocaleString(),'',remain>=0?'#16a34a':'#dc2626',remain>=0?'linear-gradient(135deg,#f0fdf4,#bbf7d0)':'linear-gradient(135deg,#fef2f2,#fecaca)')
    + _card('📊','Achievement',pct.toFixed(1)+'%','',pct>80?'#dc2626':'#16a34a',pct>80?'linear-gradient(135deg,#fef2f2,#fecaca)':'linear-gradient(135deg,#f0fdf4,#bbf7d0)')
    +'</div>';

  html += _renderAllocation(budgets, expenses, totalBudget);

  el.innerHTML = html;
}

// ─── 6.7 Budget Performance ───
function _renderBudgetPerformance(el) {
  var data = _getBudgetData();
  var expenses = data.budgetV2.expenses || [];
  var withSales = expenses.filter(function(e){return (e.sales||0)>0;});

  var html = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">'
    +'<button onclick="_budgetView=\'dashboard\';renderMktBudget()" style="border:none;background:#f1f5f9;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;color:#475569">← กลับ</button>'
    +'<div style="font-size:18px;font-weight:800;color:#1e293b">📈 Budget Performance</div></div>';

  if (withSales.length > 0) {
    var sorted = withSales.slice().sort(function(a,b){ return ((b.sales||0)/(b.actual||1))-((a.sales||0)/(a.actual||1)); });
    var TH = 'padding:8px 10px;font-size:10px;font-weight:700;color:#fff;background:#1e293b;white-space:nowrap;';
    html += '<div style="overflow-x:auto;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:16px"><table style="width:100%;border-collapse:collapse;font-size:12px">'
      +'<thead><tr><th style="'+TH+'text-align:left">Campaign</th><th style="'+TH+'text-align:right">Budget</th><th style="'+TH+'text-align:right">Actual</th><th style="'+TH+'text-align:right">Sales</th><th style="'+TH+'text-align:right">ROI</th></tr></thead><tbody>';
    sorted.forEach(function(e, i) {
      var roi = (e.actual||0) > 0 ? ((e.sales||0)/(e.actual)) : 0;
      html += '<tr style="border-bottom:1px solid #f1f5f9;background:'+(i%2?'#fafafa':'#fff')+'">'
        +'<td style="padding:7px 10px;font-weight:600;color:#1e293b">'+(e.campaign||e.name||'')+'</td>'
        +'<td style="padding:7px 10px;text-align:right;color:#2563eb">฿'+(e.budget||0).toLocaleString()+'</td>'
        +'<td style="padding:7px 10px;text-align:right;color:#f97316;font-weight:600">฿'+(e.actual||0).toLocaleString()+'</td>'
        +'<td style="padding:7px 10px;text-align:right;color:#16a34a;font-weight:700">฿'+(e.sales||0).toLocaleString()+'</td>'
        +'<td style="padding:7px 10px;text-align:right"><span style="padding:2px 8px;border-radius:8px;font-size:11px;font-weight:800;background:'+(roi>=3?'#bbf7d0':roi>=1?'#fef3c7':'#fecaca')+';color:'+(roi>=3?'#16a34a':roi>=1?'#d97706':'#dc2626')+'">'+roi.toFixed(1)+'x</span></td></tr>';
    });
    html += '</tbody></table></div>';
  } else {
    html += _emptyState('📈', 'ยังไม่มีข้อมูล Performance', 'บันทึกยอดขายในค่าใช้จ่ายเพื่อดู ROI');
  }

  html += _renderBudgetAI(data.budgetV2.budgets||[], expenses, data.budgetV2.totalBudget||0, expenses.reduce(function(s,e){return s+(e.sales||0);},0), 0);

  el.innerHTML = html;
}

// ─── 6.8 Budget Alert ───
function _renderBudgetAlerts(budgets, expenses, totalBudget) {
  var alerts = [];
  var catBudget = {}, catActual = {};
  budgets.filter(function(b){return b.status==='approved';}).forEach(function(b){
    var ck = b.name || _catKey(b.budgetType);
    catBudget[ck] = (catBudget[ck]||0) + (b.amount||0);
  });
  expenses.forEach(function(e){
    var ck = e.campaign || e.name || '';
    catActual[ck] = (catActual[ck]||0) + (e.actual||0);
  });

  // Check each budget for alerts
  budgets.filter(function(b){return b.status==='approved';}).forEach(function(b) {
    var bName = b.name || '';
    var bAmt = b.amount || 0;
    var spent = 0;
    expenses.forEach(function(e){ if ((e.campaign||e.name||'')===bName) spent += (e.actual||0); });
    var pUsed = bAmt > 0 ? (spent/bAmt*100) : 0;
    var sales = 0;
    expenses.forEach(function(e){ if ((e.campaign||e.name||'')===bName) sales += (e.sales||0); });
    var roi = spent > 0 ? (sales/spent) : 0;

    if (pUsed > 100) alerts.push({type:'red',icon:'🔴',msg:bName+' ใช้จริงเกิน Budget '+(pUsed-100).toFixed(0)+'%'});
    else if (pUsed > 80) alerts.push({type:'yellow',icon:'🟡',msg:bName+' ใช้งบไปแล้ว '+pUsed.toFixed(0)+'% ของ Budget'});
    if (pUsed < 30 && b.endDate) {
      var daysLeft = Math.ceil((new Date(b.endDate) - new Date()) / 86400000);
      if (daysLeft < 14 && daysLeft > 0) alerts.push({type:'blue',icon:'🔵',msg:bName+' เหลืองบ '+(100-pUsed).toFixed(0)+'% และใกล้หมด Campaign'});
    }
    if (spent > 50000 && roi < 1.5 && roi > 0) alerts.push({type:'warn',icon:'⚠️',msg:bName+' ใช้งบ ฿'+spent.toLocaleString()+' แต่ ROI เพียง '+roi.toFixed(1)+'x'});
  });

  if (alerts.length === 0) return '';
  var html = '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:18px 22px;margin-bottom:16px">'
    +'<div style="font-size:14px;font-weight:800;color:#1e293b;margin-bottom:12px">🚨 Budget Alert</div>';
  alerts.forEach(function(a) {
    var bg = a.type==='red'?'#fef2f2':a.type==='yellow'?'#fffbeb':a.type==='blue'?'#eff6ff':'#fff7ed';
    var border = a.type==='red'?'#fecaca':a.type==='yellow'?'#fde68a':a.type==='blue'?'#bfdbfe':'#fed7aa';
    html += '<div style="padding:10px 14px;border-radius:8px;background:'+bg+';border:1px solid '+border+';margin-bottom:6px;font-size:12px;color:#1e293b">'+a.icon+' '+a.msg+'</div>';
  });
  html += '</div>';
  return html;
}

// ─── 6.9 AI Budget Analysis ───
function _renderBudgetAI(budgets, expenses, totalBudget, totalSales, roi) {
  var insights = [];
  var recs = [];
  var actualSpent = expenses.reduce(function(s,e){return s+(e.actual||0);},0);
  var calcRoi = actualSpent > 0 ? (totalSales/actualSpent) : 0;
  var pct = totalBudget > 0 ? (actualSpent/totalBudget*100) : 0;

  if (pct > 0) insights.push('เดือนนี้ใช้งบ Marketing ไป '+pct.toFixed(1)+'% ของงบทั้งหมด');

  // Best performing campaign
  var campMap = {};
  expenses.forEach(function(e) {
    var k = e.campaign || e.name || '';
    if (!k) return;
    if (!campMap[k]) campMap[k] = {actual:0, sales:0};
    campMap[k].actual += (e.actual||0);
    campMap[k].sales += (e.sales||0);
  });
  var bestCamp = null, bestRoi = 0;
  var worstCamp = null, worstRoi = 999;
  Object.keys(campMap).forEach(function(k) {
    var r = campMap[k].actual > 0 ? (campMap[k].sales/campMap[k].actual) : 0;
    if (r > bestRoi) { bestRoi = r; bestCamp = k; }
    if (r < worstRoi && campMap[k].actual > 0) { worstRoi = r; worstCamp = k; }
  });
  if (bestCamp) insights.push('Campaign ที่มีประสิทธิภาพสูงสุดคือ "'+bestCamp+'" มี ROI '+bestRoi.toFixed(1)+'x');
  if (worstCamp && worstCamp !== bestCamp && worstRoi < 2) insights.push('Campaign "'+worstCamp+'" มี ROI ต่ำสุดที่ '+worstRoi.toFixed(1)+'x');

  // Category analysis
  var catSpend = {};
  expenses.forEach(function(e){ var c = _catKey(e.category||'Other'); catSpend[c]=(catSpend[c]||0)+(e.actual||0); });
  var topCat = null, topAmt = 0;
  Object.keys(catSpend).forEach(function(c){ if(catSpend[c]>topAmt){topAmt=catSpend[c];topCat=c;} });
  if (topCat) insights.push('หมวดที่ใช้งบมากที่สุด: '+topCat+' (฿'+topAmt.toLocaleString()+')');

  if (worstCamp && bestCamp && worstCamp !== bestCamp) {
    recs.push('แนะนำโยกงบประมาณจาก "'+worstCamp+'" (ROI '+worstRoi.toFixed(1)+'x) ไปยัง "'+bestCamp+'" (ROI '+bestRoi.toFixed(1)+'x) ที่มี Conversion สูงกว่า');
  }
  if (pct > 80) recs.push('งบใช้ไปมากกว่า 80% แล้ว ควรระวังการใช้จ่ายและพิจารณา re-allocate');
  if (pct < 30 && expenses.length > 0) recs.push('งบใช้ไปน้อย — ควรเร่งใช้งบให้เกิดประโยชน์ก่อนสิ้นปี');

  if (insights.length === 0 && recs.length === 0) return '';

  var html = '<div style="margin-top:16px;background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:14px;padding:18px 22px;border:1px solid #93c5fd">'
    +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">'
    +'<span style="font-size:20px">🤖</span>'
    +'<span style="font-size:15px;font-weight:800;color:#1e293b">AI Marketing Budget Analysis</span></div>';
  insights.forEach(function(ins) {
    html += '<div style="font-size:12px;color:#1e293b;padding:6px 0;border-bottom:1px solid rgba(37,99,235,.1)">📊 '+ins+'</div>';
  });
  if (recs.length > 0) {
    html += '<div style="font-size:12px;font-weight:700;color:#2563eb;margin:10px 0 6px">💡 Recommendation:</div>';
    recs.forEach(function(r) {
      html += '<div style="font-size:12px;color:#475569;padding:3px 0">• '+r+'</div>';
    });
  }
  html += '</div>';
  return html;
}

// ─── Save / Delete / Actions ───
window.mktSaveBudget = function() {
  var nameEl = document.getElementById('bf_name');
  if (!nameEl || !nameEl.value.trim()) { alert('กรุณากรอกชื่องบประมาณ'); return; }
  var data = _getBudgetData();
  var bv = data.budgetV2;
  if (!bv.budgets) bv.budgets = [];
  var b = window._budgetEditIdx >= 0 && bv.budgets[window._budgetEditIdx] ? bv.budgets[window._budgetEditIdx] : {};

  b.year = parseInt((document.getElementById('bf_year')||{}).value) || 2026;
  b.month = (document.getElementById('bf_month')||{}).value || '';
  b.name = nameEl.value.trim();
  b.budgetType = (document.getElementById('bf_type')||{}).value || '';
  b.plan = (document.getElementById('bf_plan')||{}).value || '';
  b.campaign = (document.getElementById('bf_campaign')||{}).value || '';
  b.owner = (document.getElementById('bf_owner')||{}).value || '';
  b.costCenter = (document.getElementById('bf_costCenter')||{}).value || '';
  b.amount = parseFloat((document.getElementById('bf_amount')||{}).value) || 0;
  b.startDate = (document.getElementById('bf_startDate')||{}).value || '';
  b.endDate = (document.getElementById('bf_endDate')||{}).value || '';
  b.status = (document.getElementById('bf_status')||{}).value || 'draft';
  b.note = (document.getElementById('bf_note')||{}).value || '';

  if (window._budgetEditIdx < 0) bv.budgets.push(b);
  else bv.budgets[window._budgetEditIdx] = b;
  _saveMktData(data);
  window._budgetView = 'dashboard';
  renderMktBudget();
};

window.mktSaveExpense = function() {
  var nameEl = document.getElementById('ef_name');
  if (!nameEl || !nameEl.value.trim()) { alert('กรุณากรอกรายการ'); return; }
  var data = _getBudgetData();
  var bv = data.budgetV2;
  if (!bv.expenses) bv.expenses = [];
  var e = window._expenseEditIdx >= 0 && bv.expenses[window._expenseEditIdx] ? bv.expenses[window._expenseEditIdx] : {};

  e.date = (document.getElementById('ef_date')||{}).value || '';
  e.name = nameEl.value.trim();
  e.campaign = (document.getElementById('ef_campaign')||{}).value || '';
  e.category = (document.getElementById('ef_category')||{}).value || '';
  e.budget = parseFloat((document.getElementById('ef_budget')||{}).value) || 0;
  e.actual = parseFloat((document.getElementById('ef_actual')||{}).value) || 0;
  e.sales = parseFloat((document.getElementById('ef_sales')||{}).value) || 0;
  e.note = (document.getElementById('ef_note')||{}).value || '';

  if (window._expenseEditIdx < 0) bv.expenses.push(e);
  else bv.expenses[window._expenseEditIdx] = e;
  _saveMktData(data);
  window._budgetView = 'expense';
  renderMktBudget();
};

window.mktBudgetStatus = function(i, status) {
  var data = _getBudgetData();
  var b = (data.budgetV2.budgets||[])[i];
  if (!b) return;
  b.status = status;
  _saveMktData(data);
  renderMktBudget();
};

window.mktDeleteBudgetItem = function(i) {
  if (!confirm('ลบงบประมาณนี้?')) return;
  var data = _getBudgetData();
  data.budgetV2.budgets.splice(i, 1);
  _saveMktData(data);
  renderMktBudget();
};

window.mktDeleteExpense = function(i) {
  if (!confirm('ลบค่าใช้จ่ายนี้?')) return;
  var data = _getBudgetData();
  data.budgetV2.expenses.splice(i, 1);
  _saveMktData(data);
  renderMktBudget();
};

window.mktSetBudgetTotal = function() {
  var data = _getBudgetData();
  var v = prompt('งบประมาณการตลาดรวมทั้งปี (บาท):', data.budgetV2.totalBudget||0);
  if (v !== null) { data.budgetV2.totalBudget = parseInt(v)||0; _saveMktData(data); renderMktBudget(); }
};
window.mktAddBudgetItem = window.mktDeleteBudgetItem;

// ── 7. วิเคราะห์ ROI ──
function renderMktRoi() {
  var el = document.getElementById('mktRoiContent');
  if (!el) return;
  var data = _loadMktData();

  // Aggregate from all sources
  var promos = data.promos || [];
  var influencers = data.influencers || [];
  var budget = data.budget || {total:0, items:[]};

  var totalSpend = budget.items.reduce(function(s,x){return s+(x.amount||0);},0);
  var promoRevenue = promos.reduce(function(s,x){return s+(x.revenue||0);},0);
  var infRevenue = influencers.reduce(function(s,x){return s+(x.revenue||0);},0);
  var totalRevenue = promoRevenue + infRevenue;
  var roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend * 100) : 0;
  var roas = totalSpend > 0 ? (totalRevenue / totalSpend) : 0;

  var kpis = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">'
    + _card('💰', 'งบที่ใช้ทั้งหมด', '฿'+totalSpend.toLocaleString(), 'บาท', '#dc2626', 'linear-gradient(135deg,#fef2f2,#fecaca)')
    + _card('📊', 'รายได้จากการตลาด', '฿'+totalRevenue.toLocaleString(), 'บาท', '#16a34a', 'linear-gradient(135deg,#f0fdf4,#bbf7d0)')
    + _card('📈', 'ROI', roi.toFixed(1)+'%', roi>=0?'กำไร':'ขาดทุน', roi>=0?'#16a34a':'#dc2626', roi>=0?'linear-gradient(135deg,#f0fdf4,#bbf7d0)':'linear-gradient(135deg,#fef2f2,#fecaca)')
    + _card('🎯', 'ROAS', roas.toFixed(2)+'x', 'ต่อ 1 บาท ได้ '+roas.toFixed(2)+' บาท', roas>=1?'#2563eb':'#dc2626', 'linear-gradient(135deg,#eff6ff,#dbeafe)')
    +'</div>';

  // Breakdown by channel
  var channels = {};
  promos.forEach(function(p) {
    var ch = p.channel || 'อื่นๆ';
    if (!channels[ch]) channels[ch] = {spend:0, revenue:0};
    channels[ch].spend += (p.budget||0);
    channels[ch].revenue += (p.revenue||0);
  });
  influencers.forEach(function(inf) {
    var ch = 'Influencer';
    if (!channels[ch]) channels[ch] = {spend:0, revenue:0};
    channels[ch].spend += (inf.cost||0);
    channels[ch].revenue += (inf.revenue||0);
  });

  var chKeys = Object.keys(channels).sort(function(a,b){return channels[b].revenue-channels[a].revenue;});

  var breakdown = '';
  if (chKeys.length > 0) {
    breakdown = _sectionHead('📊', 'ROI แยกตามช่องทาง');
    var TH = 'padding:9px 12px;font-size:11px;font-weight:700;color:#fff;background:#1e293b;';
    breakdown += '<div style="overflow-x:auto;border-radius:12px;border:1px solid #e2e8f0"><table style="width:100%;border-collapse:collapse;font-size:13px">'
      +'<thead><tr>'
      +'<th style="'+TH+'text-align:left">ช่องทาง</th>'
      +'<th style="'+TH+'text-align:right">งบที่ใช้</th>'
      +'<th style="'+TH+'text-align:right">รายได้</th>'
      +'<th style="'+TH+'text-align:right">กำไร/ขาดทุน</th>'
      +'<th style="'+TH+'text-align:right">ROI</th>'
      +'<th style="'+TH+'text-align:right">ROAS</th>'
      +'</tr></thead><tbody>'
      + chKeys.map(function(ch, i) {
        var c = channels[ch];
        var profit = c.revenue - c.spend;
        var chRoi = c.spend > 0 ? (profit / c.spend * 100) : 0;
        var chRoas = c.spend > 0 ? (c.revenue / c.spend) : 0;
        return '<tr style="border-bottom:1px solid #f1f5f9;background:'+(i%2?'#fafafa':'#fff')+'">'
          +'<td style="padding:8px 12px;font-weight:600;color:#1e293b">'+ch+'</td>'
          +'<td style="padding:8px 12px;text-align:right;color:#dc2626">฿'+c.spend.toLocaleString()+'</td>'
          +'<td style="padding:8px 12px;text-align:right;color:#16a34a">฿'+c.revenue.toLocaleString()+'</td>'
          +'<td style="padding:8px 12px;text-align:right;font-weight:700;color:'+(profit>=0?'#16a34a':'#dc2626')+'">฿'+profit.toLocaleString()+'</td>'
          +'<td style="padding:8px 12px;text-align:right;font-weight:700;color:'+(chRoi>=0?'#16a34a':'#dc2626')+'">'+chRoi.toFixed(1)+'%</td>'
          +'<td style="padding:8px 12px;text-align:right;color:#2563eb">'+chRoas.toFixed(2)+'x</td>'
          +'</tr>';
      }).join('')
      +'</tbody></table></div>';
  } else {
    breakdown = _emptyState('📈', 'ยังไม่มีข้อมูล ROI', 'เพิ่มโปรโมชันและ Influencer พร้อมยอดขาย เพื่อให้ระบบคำนวณ ROI ให้อัตโนมัติ');
  }

  el.innerHTML = kpis + breakdown;
}

// Init on tab show
window.initMarketingTab = function() {
  renderMktSub(_mktCurrentSub);
};

})();
