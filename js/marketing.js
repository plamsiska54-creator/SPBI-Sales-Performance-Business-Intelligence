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

// ── 1. แผนการตลาด ──
function renderMktPlan() {
  var el = document.getElementById('mktPlanContent');
  if (!el) return;
  var data = _loadMktData();
  var plans = data.plans || [];

  var kpis = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">'
    + _card('📋', 'แผนทั้งหมด', plans.length, 'รายการ', '#2563eb', 'linear-gradient(135deg,#eff6ff,#dbeafe)')
    + _card('✅', 'เสร็จแล้ว', plans.filter(function(p){return p.status==='done';}).length, 'รายการ', '#16a34a', 'linear-gradient(135deg,#f0fdf4,#bbf7d0)')
    + _card('🔄', 'กำลังดำเนินการ', plans.filter(function(p){return p.status==='active';}).length, 'รายการ', '#f97316', 'linear-gradient(135deg,#fff7ed,#fed7aa)')
    + _card('📅', 'รอดำเนินการ', plans.filter(function(p){return !p.status||p.status==='pending';}).length, 'รายการ', '#7c3aed', 'linear-gradient(135deg,#faf5ff,#e9d5ff)')
    +'</div>';

  var addBtn = '<button onclick="mktAddPlan()" style="padding:8px 18px;border:none;border-radius:12px;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:16px">➕ เพิ่มแผนการตลาด</button>';

  var table = '';
  if (plans.length > 0) {
    var TH = 'padding:9px 12px;font-size:11px;font-weight:700;color:#fff;background:#1e293b;';
    table = '<div style="overflow-x:auto;border-radius:12px;border:1px solid #e2e8f0"><table style="width:100%;border-collapse:collapse;font-size:13px">'
      +'<thead><tr>'
      +'<th style="'+TH+'text-align:center">#</th>'
      +'<th style="'+TH+'text-align:left">ชื่อแผน</th>'
      +'<th style="'+TH+'text-align:left">ช่องทาง</th>'
      +'<th style="'+TH+'text-align:center">ระยะเวลา</th>'
      +'<th style="'+TH+'text-align:right">งบประมาณ</th>'
      +'<th style="'+TH+'text-align:center">สถานะ</th>'
      +'<th style="'+TH+'text-align:center">จัดการ</th>'
      +'</tr></thead><tbody>'
      + plans.map(function(p, i) {
        var statusColors = {done:'#16a34a',active:'#f97316',pending:'#94a3b8'};
        var statusLabels = {done:'✅ เสร็จ',active:'🔄 ดำเนินการ',pending:'⏳ รอ'};
        var st = p.status || 'pending';
        return '<tr style="border-bottom:1px solid #f1f5f9;background:'+(i%2?'#fafafa':'#fff')+'">'
          +'<td style="padding:8px 12px;text-align:center;color:#94a3b8">'+(i+1)+'</td>'
          +'<td style="padding:8px 12px;font-weight:600;color:#1e293b">'+p.name+'</td>'
          +'<td style="padding:8px 12px;color:#475569">'+(p.channel||'—')+'</td>'
          +'<td style="padding:8px 12px;text-align:center;color:#475569;font-size:11px">'+(p.start||'—')+' ~ '+(p.end||'—')+'</td>'
          +'<td style="padding:8px 12px;text-align:right;font-weight:700;color:#2563eb">฿'+(p.budget||0).toLocaleString()+'</td>'
          +'<td style="padding:8px 12px;text-align:center"><span style="padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;color:#fff;background:'+(statusColors[st]||'#94a3b8')+'">'+( statusLabels[st]||st)+'</span></td>'
          +'<td style="padding:8px 12px;text-align:center">'
          +'<button onclick="mktEditPlan('+i+')" style="border:none;background:none;cursor:pointer;font-size:14px" title="แก้ไข">✏️</button>'
          +'<button onclick="mktDeletePlan('+i+')" style="border:none;background:none;cursor:pointer;font-size:14px" title="ลบ">🗑️</button>'
          +'</td></tr>';
      }).join('')
      +'</tbody></table></div>';
  } else {
    table = _emptyState('📋', 'ยังไม่มีแผนการตลาด', 'กดปุ่ม "เพิ่มแผนการตลาด" เพื่อเริ่มวางแผนแคมเปญแรก');
  }

  el.innerHTML = kpis + addBtn + table;
}

window.mktAddPlan = function() {
  var name = prompt('ชื่อแผนการตลาด:');
  if (!name) return;
  var channel = prompt('ช่องทาง (เช่น Facebook, Line, บูธ, MT):') || '';
  var budget = parseInt(prompt('งบประมาณ (บาท):') || '0');
  var start = prompt('วันเริ่ม (เช่น 01/08/2569):') || '';
  var end = prompt('วันสิ้นสุด (เช่น 31/08/2569):') || '';
  var data = _loadMktData();
  if (!data.plans) data.plans = [];
  data.plans.push({name:name, channel:channel, budget:budget, start:start, end:end, status:'pending'});
  _saveMktData(data);
  renderMktPlan();
};

window.mktEditPlan = function(i) {
  var data = _loadMktData();
  var p = data.plans[i];
  if (!p) return;
  var statuses = ['pending','active','done'];
  var labels = ['⏳ รอดำเนินการ','🔄 กำลังดำเนินการ','✅ เสร็จแล้ว'];
  var curr = statuses.indexOf(p.status);
  var next = (curr + 1) % 3;
  p.status = statuses[next];
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

// ── 2. โปรโมชัน/แคมเปญ ──
function renderMktPromo() {
  var el = document.getElementById('mktPromoContent');
  if (!el) return;
  var data = _loadMktData();
  var promos = data.promos || [];

  var kpis = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">'
    + _card('🎁', 'แคมเปญทั้งหมด', promos.length, 'รายการ', '#dc2626', 'linear-gradient(135deg,#fef2f2,#fecaca)')
    + _card('🔥', 'กำลังดำเนินการ', promos.filter(function(p){return p.status==='active';}).length, 'รายการ', '#f97316', 'linear-gradient(135deg,#fff7ed,#fed7aa)')
    + _card('💰', 'งบรวม', '฿'+promos.reduce(function(s,p){return s+(p.budget||0);},0).toLocaleString(), 'บาท', '#2563eb', 'linear-gradient(135deg,#eff6ff,#dbeafe)')
    + _card('📊', 'ยอดขายจากโปรโมชัน', '฿'+promos.reduce(function(s,p){return s+(p.revenue||0);},0).toLocaleString(), 'บาท', '#16a34a', 'linear-gradient(135deg,#f0fdf4,#bbf7d0)')
    +'</div>';

  var addBtn = '<button onclick="mktAddPromo()" style="padding:8px 18px;border:none;border-radius:12px;background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:16px">➕ เพิ่มโปรโมชัน</button>';

  var cards = promos.length > 0 ? '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px">'
    + promos.map(function(p, i) {
      var statusColors = {done:'#16a34a',active:'#f97316',pending:'#94a3b8'};
      var st = p.status || 'pending';
      return '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.05)">'
        +'<div style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:14px 18px;display:flex;justify-content:space-between;align-items:center">'
          +'<div style="font-size:14px;font-weight:800;color:#fff">🎁 '+p.name+'</div>'
          +'<span style="padding:3px 10px;border-radius:12px;font-size:10px;font-weight:700;background:rgba(255,255,255,.2);color:#fff">'+(st==='active'?'🔥 Live':st==='done'?'✅ จบ':'⏳ รอ')+'</span>'
        +'</div>'
        +'<div style="padding:14px 18px">'
          +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">'
            +'<div><div style="font-size:10px;color:#94a3b8">ช่องทาง</div><div style="font-size:12px;font-weight:600">'+(p.channel||'—')+'</div></div>'
            +'<div><div style="font-size:10px;color:#94a3b8">ระยะเวลา</div><div style="font-size:12px;font-weight:600">'+(p.period||'—')+'</div></div>'
            +'<div><div style="font-size:10px;color:#94a3b8">งบประมาณ</div><div style="font-size:12px;font-weight:700;color:#dc2626">฿'+(p.budget||0).toLocaleString()+'</div></div>'
            +'<div><div style="font-size:10px;color:#94a3b8">ยอดขายจากโปรฯ</div><div style="font-size:12px;font-weight:700;color:#16a34a">฿'+(p.revenue||0).toLocaleString()+'</div></div>'
          +'</div>'
          +'<div style="display:flex;gap:6px">'
            +'<button onclick="mktEditPromo('+i+')" style="flex:1;padding:6px;border:1.5px solid #e2e8f0;border-radius:8px;background:#fff;font-size:11px;cursor:pointer">✏️ แก้ไข</button>'
            +'<button onclick="mktDeletePromo('+i+')" style="flex:1;padding:6px;border:1.5px solid #fecaca;border-radius:8px;background:#fef2f2;color:#dc2626;font-size:11px;cursor:pointer">🗑️ ลบ</button>'
          +'</div>'
        +'</div></div>';
    }).join('') + '</div>'
    : _emptyState('🎁', 'ยังไม่มีโปรโมชัน', 'เพิ่มโปรโมชันเพื่อติดตามแคมเปญและวัดผล ROI');

  el.innerHTML = kpis + addBtn + cards;
}

window.mktAddPromo = function() {
  var name = prompt('ชื่อโปรโมชัน/แคมเปญ:');
  if (!name) return;
  var channel = prompt('ช่องทาง:') || '';
  var period = prompt('ระยะเวลา:') || '';
  var budget = parseInt(prompt('งบประมาณ (บาท):') || '0');
  var data = _loadMktData();
  if (!data.promos) data.promos = [];
  data.promos.push({name:name, channel:channel, period:period, budget:budget, revenue:0, status:'pending'});
  _saveMktData(data);
  renderMktPromo();
};
window.mktEditPromo = function(i) {
  var data = _loadMktData();
  var p = data.promos[i]; if (!p) return;
  var rev = prompt('ยอดขายจากโปรโมชัน (บาท):', p.revenue||0);
  if (rev !== null) p.revenue = parseInt(rev) || 0;
  var statuses = ['pending','active','done'];
  var curr = statuses.indexOf(p.status);
  p.status = statuses[(curr + 1) % 3];
  _saveMktData(data);
  renderMktPromo();
};
window.mktDeletePromo = function(i) {
  if (!confirm('ลบโปรโมชันนี้?')) return;
  var data = _loadMktData();
  data.promos.splice(i, 1);
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

// ── 4. Content Calendar ──
function renderMktContent() {
  var el = document.getElementById('mktContentContent');
  if (!el) return;
  var data = _loadMktData();
  var contents = data.contents || [];

  var addBtn = '<button onclick="mktAddContent()" style="padding:8px 18px;border:none;border-radius:12px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:16px">➕ เพิ่มคอนเทนต์</button>';

  var cal = '';
  if (contents.length > 0) {
    var byDate = {};
    contents.forEach(function(c){ if (!byDate[c.date]) byDate[c.date]=[]; byDate[c.date].push(c); });
    var dates = Object.keys(byDate).sort();
    cal = '<div style="display:grid;gap:10px">';
    dates.forEach(function(d) {
      cal += '<div style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;padding:14px 18px">'
        +'<div style="font-size:12px;font-weight:700;color:#7c3aed;margin-bottom:8px">📅 '+d+'</div>';
      byDate[d].forEach(function(c, ci) {
        var platformIcons = {facebook:'📘',line:'💚',tiktok:'🎵',ig:'📸',other:'📣'};
        cal += '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-top:1px solid #f1f5f9">'
          +'<span style="font-size:16px">'+(platformIcons[c.platform]||'📣')+'</span>'
          +'<div style="flex:1"><div style="font-size:12px;font-weight:600;color:#1e293b">'+c.title+'</div>'
          +'<div style="font-size:11px;color:#94a3b8">'+(c.type||'โพสต์')+' · '+(c.platform||'—')+'</div></div>'
          +'<span style="padding:2px 8px;border-radius:8px;font-size:10px;font-weight:700;background:'+(c.done?'#bbf7d0':'#fef3c7')+';color:'+(c.done?'#16a34a':'#d97706')+'">'+(c.done?'✅ เผยแพร่แล้ว':'⏳ รอเผยแพร่')+'</span>'
          +'</div>';
      });
      cal += '</div>';
    });
    cal += '</div>';
  } else {
    cal = _emptyState('📝', 'ยังไม่มี Content Calendar', 'วางแผนคอนเทนต์ล่วงหน้าเพื่อให้สื่อสารตรงกลุ่มเป้าหมาย');
  }

  el.innerHTML = addBtn + cal;
}

window.mktAddContent = function() {
  var title = prompt('หัวข้อคอนเทนต์:');
  if (!title) return;
  var date = prompt('วันที่เผยแพร่ (เช่น 2569-08-20):') || '';
  var platform = prompt('แพลตฟอร์ม (facebook/line/tiktok/ig):') || 'facebook';
  var type = prompt('ประเภท (โพสต์/วิดีโอ/ไลฟ์/สตอรี่):') || 'โพสต์';
  var data = _loadMktData();
  if (!data.contents) data.contents = [];
  data.contents.push({title:title, date:date, platform:platform, type:type, done:false});
  _saveMktData(data);
  renderMktContent();
};

// ── 5. Influencer ──
function renderMktInfluencer() {
  var el = document.getElementById('mktInfluencerContent');
  if (!el) return;
  var data = _loadMktData();
  var influencers = data.influencers || [];

  var kpis = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">'
    + _card('🌟', 'Influencer ทั้งหมด', influencers.length, 'คน', '#d97706', 'linear-gradient(135deg,#fffbeb,#fef3c7)')
    + _card('💰', 'ค่าใช้จ่ายรวม', '฿'+influencers.reduce(function(s,x){return s+(x.cost||0);},0).toLocaleString(), 'บาท', '#dc2626', 'linear-gradient(135deg,#fef2f2,#fecaca)')
    + _card('📊', 'Reach รวม', influencers.reduce(function(s,x){return s+(x.reach||0);},0).toLocaleString(), 'คน', '#2563eb', 'linear-gradient(135deg,#eff6ff,#dbeafe)')
    +'</div>';

  var addBtn = '<button onclick="mktAddInfluencer()" style="padding:8px 18px;border:none;border-radius:12px;background:linear-gradient(135deg,#d97706,#f59e0b);color:#fff;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:16px">➕ เพิ่ม Influencer</button>';

  var table = '';
  if (influencers.length > 0) {
    var TH = 'padding:9px 12px;font-size:11px;font-weight:700;color:#fff;background:#1e293b;';
    table = '<div style="overflow-x:auto;border-radius:12px;border:1px solid #e2e8f0"><table style="width:100%;border-collapse:collapse;font-size:13px">'
      +'<thead><tr>'
      +'<th style="'+TH+'text-align:center">#</th>'
      +'<th style="'+TH+'text-align:left">ชื่อ</th>'
      +'<th style="'+TH+'text-align:left">แพลตฟอร์ม</th>'
      +'<th style="'+TH+'text-align:right">ผู้ติดตาม</th>'
      +'<th style="'+TH+'text-align:right">ค่าใช้จ่าย</th>'
      +'<th style="'+TH+'text-align:right">Reach</th>'
      +'<th style="'+TH+'text-align:right">ยอดขาย</th>'
      +'<th style="'+TH+'text-align:center">จัดการ</th>'
      +'</tr></thead><tbody>'
      + influencers.map(function(inf, i) {
        return '<tr style="border-bottom:1px solid #f1f5f9;background:'+(i%2?'#fafafa':'#fff')+'">'
          +'<td style="padding:8px 12px;text-align:center;color:#94a3b8">'+(i+1)+'</td>'
          +'<td style="padding:8px 12px;font-weight:600;color:#1e293b">'+inf.name+'</td>'
          +'<td style="padding:8px 12px;color:#475569">'+(inf.platform||'—')+'</td>'
          +'<td style="padding:8px 12px;text-align:right">'+(inf.followers||0).toLocaleString()+'</td>'
          +'<td style="padding:8px 12px;text-align:right;font-weight:700;color:#dc2626">฿'+(inf.cost||0).toLocaleString()+'</td>'
          +'<td style="padding:8px 12px;text-align:right;color:#2563eb">'+(inf.reach||0).toLocaleString()+'</td>'
          +'<td style="padding:8px 12px;text-align:right;font-weight:700;color:#16a34a">฿'+(inf.revenue||0).toLocaleString()+'</td>'
          +'<td style="padding:8px 12px;text-align:center">'
          +'<button onclick="mktDeleteInfluencer('+i+')" style="border:none;background:none;cursor:pointer;font-size:14px">🗑️</button></td></tr>';
      }).join('')
      +'</tbody></table></div>';
  } else {
    table = _emptyState('🌟', 'ยังไม่มี Influencer', 'เพิ่ม Influencer เพื่อติดตามผลงานและวัด ROI');
  }

  el.innerHTML = kpis + addBtn + table;
}

window.mktAddInfluencer = function() {
  var name = prompt('ชื่อ Influencer:');
  if (!name) return;
  var platform = prompt('แพลตฟอร์ม:') || '';
  var followers = parseInt(prompt('ผู้ติดตาม:') || '0');
  var cost = parseInt(prompt('ค่าใช้จ่าย (บาท):') || '0');
  var reach = parseInt(prompt('Reach:') || '0');
  var revenue = parseInt(prompt('ยอดขายที่ได้:') || '0');
  var data = _loadMktData();
  if (!data.influencers) data.influencers = [];
  data.influencers.push({name:name, platform:platform, followers:followers, cost:cost, reach:reach, revenue:revenue});
  _saveMktData(data);
  renderMktInfluencer();
};
window.mktDeleteInfluencer = function(i) {
  if (!confirm('ลบ Influencer นี้?')) return;
  var data = _loadMktData();
  data.influencers.splice(i, 1);
  _saveMktData(data);
  renderMktInfluencer();
};

// ── 6. งบการตลาด ──
function renderMktBudget() {
  var el = document.getElementById('mktBudgetContent');
  if (!el) return;
  var data = _loadMktData();
  var budget = data.budget || {total:0, items:[]};

  var spent = budget.items.reduce(function(s,x){return s+(x.amount||0);},0);
  var remain = (budget.total||0) - spent;
  var pct = budget.total > 0 ? (spent/budget.total*100) : 0;

  var kpis = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">'
    + _card('💰', 'งบรวมทั้งปี', '฿'+(budget.total||0).toLocaleString(), 'บาท', '#2563eb', 'linear-gradient(135deg,#eff6ff,#dbeafe)')
    + _card('📊', 'ใช้ไปแล้ว', '฿'+spent.toLocaleString(), pct.toFixed(1)+'%', '#f97316', 'linear-gradient(135deg,#fff7ed,#fed7aa)')
    + _card('💵', 'คงเหลือ', '฿'+remain.toLocaleString(), 'บาท', remain>=0?'#16a34a':'#dc2626', remain>=0?'linear-gradient(135deg,#f0fdf4,#bbf7d0)':'linear-gradient(135deg,#fef2f2,#fecaca)')
    + _card('📈', '% ใช้งบ', pct.toFixed(1)+'%', pct>100?'เกินงบ!':'ภายในงบ', pct>80?'#dc2626':'#16a34a', pct>80?'linear-gradient(135deg,#fef2f2,#fecaca)':'linear-gradient(135deg,#f0fdf4,#bbf7d0)')
    +'</div>';

  // Progress bar
  var barColor = pct > 100 ? '#dc2626' : pct > 80 ? '#f97316' : '#16a34a';
  var bar = '<div style="background:#e2e8f0;border-radius:8px;height:16px;overflow:hidden;margin-bottom:20px">'
    +'<div style="background:'+barColor+';height:100%;width:'+Math.min(pct,100)+'%;border-radius:8px;transition:width .5s"></div></div>';

  var btns = '<div style="display:flex;gap:8px;margin-bottom:16px">'
    +'<button onclick="mktSetBudgetTotal()" style="padding:8px 18px;border:none;border-radius:12px;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;font-size:13px;font-weight:700;cursor:pointer">📝 ตั้งงบประมาณรวม</button>'
    +'<button onclick="mktAddBudgetItem()" style="padding:8px 18px;border:none;border-radius:12px;background:linear-gradient(135deg,#f97316,#fb923c);color:#fff;font-size:13px;font-weight:700;cursor:pointer">➕ เพิ่มรายจ่าย</button>'
    +'</div>';

  var table = '';
  if (budget.items.length > 0) {
    var TH = 'padding:9px 12px;font-size:11px;font-weight:700;color:#fff;background:#1e293b;';
    table = '<div style="overflow-x:auto;border-radius:12px;border:1px solid #e2e8f0"><table style="width:100%;border-collapse:collapse;font-size:13px">'
      +'<thead><tr>'
      +'<th style="'+TH+'text-align:center">#</th>'
      +'<th style="'+TH+'text-align:left">รายการ</th>'
      +'<th style="'+TH+'text-align:left">หมวด</th>'
      +'<th style="'+TH+'text-align:right">จำนวนเงิน</th>'
      +'<th style="'+TH+'text-align:right">% ของงบ</th>'
      +'<th style="'+TH+'text-align:center">จัดการ</th>'
      +'</tr></thead><tbody>'
      + budget.items.map(function(item, i) {
        var itemPct = budget.total > 0 ? (item.amount/budget.total*100) : 0;
        return '<tr style="border-bottom:1px solid #f1f5f9;background:'+(i%2?'#fafafa':'#fff')+'">'
          +'<td style="padding:8px 12px;text-align:center;color:#94a3b8">'+(i+1)+'</td>'
          +'<td style="padding:8px 12px;font-weight:600;color:#1e293b">'+item.name+'</td>'
          +'<td style="padding:8px 12px;color:#475569">'+(item.category||'—')+'</td>'
          +'<td style="padding:8px 12px;text-align:right;font-weight:700;color:#f97316">฿'+(item.amount||0).toLocaleString()+'</td>'
          +'<td style="padding:8px 12px;text-align:right;color:#64748b">'+itemPct.toFixed(1)+'%</td>'
          +'<td style="padding:8px 12px;text-align:center">'
          +'<button onclick="mktDeleteBudgetItem('+i+')" style="border:none;background:none;cursor:pointer;font-size:14px">🗑️</button></td></tr>';
      }).join('')
      +'<tr style="background:#1e293b"><td colspan="3" style="padding:8px 12px;font-weight:800;color:#fff">รวม</td>'
      +'<td style="padding:8px 12px;text-align:right;font-weight:800;color:#fb923c">฿'+spent.toLocaleString()+'</td>'
      +'<td style="padding:8px 12px;text-align:right;color:#fde68a">'+pct.toFixed(1)+'%</td><td></td></tr>'
      +'</tbody></table></div>';
  }

  el.innerHTML = kpis + bar + btns + table;
}

window.mktSetBudgetTotal = function() {
  var data = _loadMktData();
  if (!data.budget) data.budget = {total:0, items:[]};
  var v = prompt('งบประมาณการตลาดรวมทั้งปี (บาท):', data.budget.total||0);
  if (v !== null) { data.budget.total = parseInt(v)||0; _saveMktData(data); renderMktBudget(); }
};
window.mktAddBudgetItem = function() {
  var name = prompt('ชื่อรายการ:');
  if (!name) return;
  var category = prompt('หมวด (โฆษณา/อีเวนต์/Influencer/สื่อ/อื่นๆ):') || '';
  var amount = parseInt(prompt('จำนวนเงิน (บาท):') || '0');
  var data = _loadMktData();
  if (!data.budget) data.budget = {total:0, items:[]};
  data.budget.items.push({name:name, category:category, amount:amount});
  _saveMktData(data);
  renderMktBudget();
};
window.mktDeleteBudgetItem = function(i) {
  if (!confirm('ลบรายการนี้?')) return;
  var data = _loadMktData();
  data.budget.items.splice(i, 1);
  _saveMktData(data);
  renderMktBudget();
};

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
