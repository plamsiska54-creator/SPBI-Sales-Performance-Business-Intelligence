// ============================================================
// SALES-EXPENSE.JS — ฝ่ายขาย - การตลาด (8 เมนูหลัก)
// localStorage keys: smExpSales, smExpFda, smExpSample, smExpSupply
// ============================================================

// ---- 2-Level Navigation ----
var SM_MENU = {
  'sm-products':     { label: '📋 รายการสินค้า', subs: null },
  'sm-quality':      { label: '🔍 คุณภาพสินค้า', subs: null },
  'sm-workflow':     { label: '🔄 Work Flow', subs: null },
  'sm-performance':  { label: '📈 Performance Sales', subs: [
    { id: 'sm-perf-mt',     label: '🏪 Modern Trade' },
    { id: 'sm-perf-booth',  label: '🏕️ Booth' },
    { id: 'sm-perf-online', label: '🛒 Online' },
    { id: 'sm-perf-amazon', label: '📦 Amazon' },
    { id: 'sm-perf-oc',     label: '📝 Ordering Center' }
  ]},
  'sm-kpi':          { label: '🎯 KPI', subs: null },
  'sm-expense':      { label: '💼 ค่าใช้จ่าย', subs: [
    { id: 'sm-summary',    label: '📊 สรุปภาพรวม',       render: 'renderSmSummary' },
    { id: 'sm-exp-sales',  label: '💰 ค่าใช้จ่ายเซลล์',  render: 'renderSmExpSalesForm' },
    { id: 'sm-fda',        label: '🏷️ ค่าจดทะเบียน อ.ย.', render: 'renderSmFdaForm' },
    { id: 'sm-sample',     label: '🧪 ค่าสินค้าตัวอย่าง', render: 'renderSmSampleForm' },
    { id: 'sm-supply',     label: '📦 ของใช้ในแผนก',      render: 'renderSmSupplyForm' }
  ]},
  'sm-leave':        { label: '📅 ลงวันหยุด', subs: [
    { id: 'sm-leave-dashboard', label: '📊 ภาพรวมการลา', render: 'renderLeaveDashboard' },
    { id: 'sm-leave-calendar',  label: '📅 ปฏิทินการลา', render: 'renderLeaveCalendar' },
    { id: 'sm-leave-form',      label: '📝 ลงวันหยุด',   render: 'renderLeaveForm' }
  ]},
  'sm-hr':           { label: '👥 ข้อมูลบุคลากร', subs: [
    { id: 'sm-hr-org',  label: '🏢 Organization Sales' },
    { id: 'sm-hr-data', label: '📋 Data' }
  ]},
  'sm-delist':       { label: '⚠️ สินค้าเสี่ยงถอด', subs: [
    { id: 'sm-delist-form',  label: '📝 กรอกข้อมูล',   render: 'renderDelistForm' },
    { id: 'sm-delist-list',  label: '📋 รายการทั้งหมด', render: 'renderDelistList' },
    { id: 'sm-delist-dash',  label: '📊 Dashboard',     render: 'renderDelistDash' }
  ]},
  'sm-jd':           { label: '📋 JD', subs: null, render: 'renderSmJD' }
};

var _smCurrentMain = 'sm-products';

function smSelectMain(el, mainKey) {
  _smCurrentMain = mainKey;
  // Highlight main tab
  var mainTabs = document.querySelectorAll('#smMainTabs .sub-tab');
  for (var i = 0; i < mainTabs.length; i++) mainTabs[i].classList.remove('active');
  if (el) el.classList.add('active');

  // Hide all sub-sections in this tab
  var allSubs = document.querySelectorAll('#tab-sm-expense .sub-section');
  for (var i = 0; i < allSubs.length; i++) allSubs[i].classList.remove('active');

  var menu = SM_MENU[mainKey];
  var subBar = document.getElementById('smSubTabs');

  if (!menu.subs) {
    // No sub-tabs — show the main section directly
    subBar.classList.remove('has-subs');
    var sec = document.getElementById(mainKey);
    if (sec) { sec.classList.add('active'); }
    if (menu.render && window[menu.render]) window[menu.render]();
    else _smRenderSection(mainKey);
  } else {
    // Build sub-tab bar
    subBar.classList.add('has-subs');
    var h = '';
    menu.subs.forEach(function(sub, idx) {
      var active = idx === 0 ? ' active' : '';
      h += '<div class="sub-tab' + active + '" onclick="smSelectSub(this,\'' + sub.id + '\'' +
        (sub.render ? ',\'' + sub.render + '\'' : '') + ')">' + sub.label + '</div>';
    });
    subBar.innerHTML = h;
    // Show first sub-section
    var first = menu.subs[0];
    var sec = document.getElementById(first.id);
    if (sec) sec.classList.add('active');
    if (first.render && window[first.render]) window[first.render]();
    else _smRenderSection(first.id);
  }
  var mt = document.getElementById('smMainTabs');
  if (mt) mt.scrollIntoView({behavior:'smooth', block:'start'});
}

function smSelectSub(el, subId, renderFn) {
  // Highlight sub-tab
  var subTabs = document.querySelectorAll('#smSubTabs .sub-tab');
  for (var i = 0; i < subTabs.length; i++) subTabs[i].classList.remove('active');
  if (el) el.classList.add('active');
  // Hide all sub-sections
  var allSubs = document.querySelectorAll('#tab-sm-expense .sub-section');
  for (var i = 0; i < allSubs.length; i++) allSubs[i].classList.remove('active');
  // Show target
  var sec = document.getElementById(subId);
  if (sec) sec.classList.add('active');
  if (renderFn && window[renderFn]) window[renderFn]();
  else _smRenderSection(subId);
  var mt = document.getElementById('smMainTabs');
  if (mt) mt.scrollIntoView({behavior:'smooth', block:'start'});
}

function _smPortal(targetEl, sourceTabId) {
  var src = document.getElementById(sourceTabId);
  if (!src) return false;
  var wrapper = document.createElement('div');
  wrapper.className = 'portal-scope';
  while (src.firstChild) wrapper.appendChild(src.firstChild);
  targetEl.appendChild(wrapper);
  return true;
}

function _smPortalKpi(targetEl, sectionIds) {
  var wrapper = document.createElement('div');
  wrapper.className = 'portal-scope';
  var subBar = null;
  var kpiTab = document.getElementById('tab-kpi');
  if (kpiTab) {
    subBar = kpiTab.querySelector('.sub-tabs');
    if (subBar) wrapper.appendChild(subBar);
  }
  sectionIds.forEach(function(sid) {
    var sec = document.getElementById(sid);
    if (sec) wrapper.appendChild(sec);
  });
  targetEl.appendChild(wrapper);
}

function _smRenderSection(id) {
  var el = document.getElementById(id);
  if (!el || el.getAttribute('data-sm-rendered') === '1') return;
  el.setAttribute('data-sm-rendered', '1');

  var CHANNEL_NAMES = ['Modern Trade','Booth','Online','Amazon','Ordering Center'];

  // ---- 1. รายการสินค้า (portal from tab-products) ----
  if (id === 'sm-products') {
    _smPortal(el, 'tab-products');
    if (typeof initProducts === 'function') try { initProducts(); } catch(e) {}
    if (typeof renderProdOverview === 'function') try { renderProdOverview(); } catch(e) {}
  }
  // ---- 2. คุณภาพสินค้า (portal from tab-quality) ----
  else if (id === 'sm-quality') {
    _smPortal(el, 'tab-quality');
    if (typeof renderQualityOverview === 'function') try { renderQualityOverview(); } catch(e) {}
  }
  // ---- 3. Work Flow (portal from tab-workflow) ----
  else if (id === 'sm-workflow') {
    _smPortal(el, 'tab-workflow');
    if (typeof renderWfFlow === 'function') try { renderWfFlow(); } catch(e) {}
  }
  // ---- 4. Performance Sales ----
  else if (id.indexOf('sm-perf-') === 0) {
    var ch = id.replace('sm-perf-', '');
    var chMap = { mt: 'Modern Trade', booth: 'Booth', online: 'Online', amazon: 'Amazon', oc: 'Ordering Center' };
    var chName = chMap[ch] || ch;
    el.innerHTML = _smPageCard('📈', 'Performance — ' + chName, 'ผลงานการขาย ' + chName, _smPerfContent(chName));
  }
  // ---- 6. KPI ตัวชี้วัด ----
  else if (id === 'sm-kpi') {
    el.innerHTML = _smPageCard('🎯', 'KPI ฝ่ายขาย - การตลาด 2026', 'ตัวชี้วัดรายทีม ม.ค. - มิ.ย. 2569', _smKpiContent());
  }
  // ---- 8. ข้อมูลบุคลากร ----
  else if (id === 'sm-hr-org') {
    el.innerHTML = _smPageCard('🏢', 'Organization Sales', 'โครงสร้างองค์กร ฝ่ายขาย – การตลาด', _smOrgChart());
  }
  else if (id === 'sm-hr-data') {
    el.innerHTML = _smPageCard('📋', 'Data — ข้อมูลพนักงาน', 'ข้อมูลพนักงานฝ่ายขาย – การตลาด', _smStaffTable());
  }
}

// ---- Helper: navigate to other tabs ----
function smGoToTab(tabId, subId) {
  var navLinks = document.querySelectorAll('#sidebarNav a');
  for (var i = 0; i < navLinks.length; i++) {
    if (navLinks[i].getAttribute('data-tab') === tabId) { navLinks[i].click(); break; }
  }
  if (subId) {
    setTimeout(function() {
      var sec = document.getElementById(subId);
      if (sec) {
        var parent = sec.closest('.section');
        if (parent) {
          var subTabs = parent.querySelectorAll('.sub-tab');
          for (var j = 0; j < subTabs.length; j++) {
            if (subTabs[j].textContent && subTabs[j].getAttribute('onclick') && subTabs[j].getAttribute('onclick').indexOf(subId) >= 0) {
              subTabs[j].click(); break;
            }
          }
        }
      }
    }, 200);
  }
}

// ---- Helper: card wrapper ----
function _smPageCard(icon, title, desc, body) {
  return '<div class="card" style="margin-top:8px"><div style="padding:20px 24px 0">' +
    '<h2 style="margin:0;font-size:1.4rem;color:#1e293b">' + icon + ' ' + title + '</h2>' +
    '<p style="margin:4px 0 16px;font-size:13px;color:#94a3b8">' + desc + '</p></div>' +
    '<div style="padding:0 24px 24px">' + body + '</div></div>';
}

// ---- KPI ตัวชี้วัด content (from Excel) ----
var SM_KPI_DATA = {
  'Modern Trade': {
    score: [2.50, 3.05, 2.95, 2.75, 2.45, 2.50],
    items: [
      { no:1, cat:'Financial', name:'ยอดขายสุทธิ (Net Sales Revenue)', unit:'%', weight:20, target:'640.5M บาท/ปี',
        monthly:[{v:39.51,s:2},{v:36.30,s:2},{v:39.78,s:3},{v:37.65,s:2},{v:35.48,s:1},{v:34.43,s:1}], avg:0.92 },
      { no:'', cat:'', name:'กำไรหลังหักค่าใช้จ่าย', unit:'%', weight:20, target:'64.05M บาท/ปี',
        monthly:[{v:1.74,s:1},{v:1.90,s:1},{v:0,s:0},{v:0,s:1},{v:0,s:0},{v:0,s:0}], avg:0.25 },
      { no:2, cat:'Customer & Market', name:'สินค้าใหม่เข้าห้าง (New Listing)', unit:'SKUs', weight:15, target:'80-100 SKUs/ปี',
        monthly:[{v:4,s:2},{v:5,s:3},{v:5,s:3},{v:3,s:2},{v:6,s:3},{v:3,s:2}], avg:1.25 },
      { no:3, cat:'Operational', name:'อัตราสินค้าขาดสต็อก (Out of Stock)', unit:'%', weight:15, target:'90-100%',
        monthly:[{v:'100%',s:5},{v:'100%',s:5},{v:'100%',s:5},{v:'98%',s:5},{v:'100%',s:5},{v:'100%',s:5}], avg:2.50 },
      { no:'', cat:'Internal Process', name:'ความแม่นยำพยากรณ์ (Forecast Accuracy)', unit:'%', weight:15, target:'90-100%',
        monthly:[{v:'95%',s:4},{v:'95%',s:4},{v:'95%',s:4},{v:'90%',s:3},{v:'95%',s:4},{v:'95%',s:4}], avg:1.92 },
      { no:4, cat:'', name:'อัตราสินค้าถูกคัดออก (De-list Rate)', unit:'%', weight:10, target:'0-10%',
        monthly:[{v:'7.1%',s:2},{v:'2.7%',s:4},{v:'12.3%',s:3},{v:'6.1%',s:4},{v:'12.9%',s:2},{v:'5.4%',s:4}], avg:1.58 },
      { no:'', cat:'Reporting', name:'Daily & Weekly Insight Report', unit:'%', weight:5, target:'90-100%',
        monthly:[{v:'80%',s:1},{v:'100%',s:5},{v:'100%',s:5},{v:'100%',s:5},{v:'100%',s:5},{v:'100%',s:5}], avg:2.17 }
    ]
  },
  'Amazon & Souvenir': {
    score: [2.10, 1.95, 1.15, 1.40, 1.40, 1.60],
    items: [
      { no:1, cat:'Strategic Growth', name:'HQ Listing & Product Launch Success', unit:'SKUs', weight:20, target:'30-50 SKUs/ปี',
        monthly:[{v:0,s:1},{v:0,s:1},{v:0,s:1},{v:0,s:1},{v:0,s:1},{v:0,s:1}], avg:0.50 },
      { no:'', cat:'Channel Expansion', name:'New Franchise Acquisition Rate (DSD)', unit:'%', weight:20, target:'20-30%',
        monthly:[{v:'0.7%',s:1},{v:'0%',s:1},{v:'0%',s:1},{v:'0.7%',s:1},{v:'0.7%',s:1},{v:'0.6%',s:1}], avg:0.50 },
      { no:2, cat:'Distribution', name:'Distribution Coverage (Route Planning)', unit:'Quality', weight:10, target:'80-100 สาขา/ปี',
        monthly:[{v:7,s:4},{v:0,s:1},{v:0,s:1},{v:6,s:3},{v:6,s:3},{v:12,s:5}], avg:1.42 },
      { no:3, cat:'Operational', name:'Waste & Return Optimization', unit:'%', weight:5, target:'90-100%',
        monthly:[{v:'3.7%',s:5},{v:'6.5%',s:4},{v:'6%',s:4},{v:'1.2%',s:5},{v:'0.5%',s:5},{v:'0.5%',s:5}], avg:2.33 },
      { no:'', cat:'Financial', name:'Sales Target Achievement', unit:'%', weight:20, target:'194.5M บาท/ปี',
        monthly:[{v:'88.6%',s:1},{v:'80.9%',s:1},{v:'77.5%',s:1},{v:'71.3%',s:1},{v:'63.0%',s:1},{v:'57.2%',s:1}], avg:0.50 },
      { no:'', cat:'', name:'กำไรหลังหักค่าใช้จ่าย', unit:'%', weight:20, target:'19.45M บาท/ปี',
        monthly:[{v:'17.8%',s:4},{v:'17.8%',s:4},{v:'0%',s:0},{v:'0%',s:0},{v:'0%',s:0},{v:'0%',s:0}], avg:0.67 },
      { no:4, cat:'Reporting', name:'Daily & Weekly Insight Report', unit:'%', weight:5, target:'90-100%',
        monthly:[{v:'80%',s:1},{v:'100%',s:5},{v:'100%',s:5},{v:'100%',s:5},{v:'100%',s:5},{v:'100%',s:5}], avg:2.17 }
    ]
  },
  'Booth': {
    score: [4.20, 3.20, 3.75, 3.55, 3.40, 3.70],
    items: [
      { no:1, cat:'Sales Growth', name:'Sales Target Achievement', unit:'%', weight:20, target:'36M บาท/ปี',
        monthly:[{v:'192%',s:5},{v:'96.9%',s:2},{v:'94.1%',s:2},{v:'50.6%',s:1},{v:'27.2%',s:1},{v:'17.8%',s:1}], avg:1.00 },
      { no:'', cat:'', name:'กำไรหลังหักค่าใช้จ่าย', unit:'%', weight:20, target:'360K บาท/ปี',
        monthly:[{v:'13.1%',s:2},{v:'13.1%',s:2},{v:'33.5%',s:5},{v:'13.1%',s:5},{v:'31.0%',s:5},{v:'30.9%',s:5}], avg:2.00 },
      { no:2, cat:'Operational', name:'Wastage Management', unit:'%', weight:20, target:'ไม่เกิน 5-10%',
        monthly:[{v:'1.8%',s:5},{v:'4.4%',s:5},{v:'3.7%',s:5},{v:'5%',s:4},{v:'3%',s:5},{v:'3%',s:5}], avg:2.42 },
      { no:'', cat:'', name:'Stock & Audit Accuracy', unit:'%', weight:20, target:'90-100%',
        monthly:[{v:'100%',s:5},{v:'99%',s:5},{v:'99%',s:4},{v:'100%',s:5},{v:'99%',s:4},{v:'99%',s:4}], avg:2.25 },
      { no:3, cat:'Expansion', name:'New Location Acquisition', unit:'Quality', weight:15, target:'50-60 แห่ง',
        monthly:[{v:6,s:5},{v:1,s:1},{v:2,s:2},{v:2,s:2},{v:0,s:1},{v:3,s:3}], avg:1.17 },
      { no:4, cat:'Reporting', name:'Daily & Weekly Insight Report', unit:'%', weight:5, target:'90-100%',
        monthly:[{v:'80%',s:1},{v:'100%',s:5},{v:'100%',s:5},{v:'100%',s:5},{v:'100%',s:5},{v:'100%',s:5}], avg:2.17 }
    ]
  },
  'Online': {
    score: [4.35, 3.25, 2.55, 2.60, 2.85, 2.75],
    items: [
      { no:1, cat:'Sales & Revenue', name:'ยอดขายรวมตามเป้า', unit:'%', weight:25, target:'90M บาท/ปี',
        monthly:[{v:'113.8%',s:5},{v:'59.3%',s:1},{v:'41.2%',s:1},{v:'42.9%',s:2},{v:'44.5%',s:1},{v:'37.1%',s:1}], avg:0.92 },
      { no:'', cat:'', name:'กำไรหลังหักค่าใช้จ่าย', unit:'%', weight:20, target:'9M บาท/ปี',
        monthly:[{v:'44.3%',s:5},{v:'32.1%',s:5},{v:'0.1%',s:1},{v:'14.9%',s:2},{v:'18.6%',s:4},{v:'15.4%',s:3}], avg:1.67 },
      { no:2, cat:'Strategic Growth', name:'Test Market (New Product)', unit:'SKUs', weight:10, target:'50-60 SKUs',
        monthly:[{v:0,s:1},{v:0,s:1},{v:3,s:2},{v:1,s:1},{v:3,s:2},{v:0,s:1}], avg:0.67 },
      { no:'', cat:'', name:'ROAS / Marketing Efficiency', unit:'%', weight:15, target:'5-10%',
        monthly:[{v:'5.2%',s:5},{v:'10.5%',s:3},{v:'12.3%',s:3},{v:'17.3%',s:1},{v:'15.3%',s:1},{v:'13.3%',s:2}], avg:1.25 },
      { no:3, cat:'Live & Channel', name:'Traffic & Follower Growth', unit:'%', weight:10, target:'20-50%',
        monthly:[{v:'35.1%',s:5},{v:'99.97%',s:5},{v:'99.97%',s:5},{v:'85.6%',s:5},{v:'105.6%',s:5},{v:'36.4%',s:5}], avg:2.50 },
      { no:4, cat:'Operations', name:'Fulfillment Efficiency', unit:'%', weight:10, target:'0-10%',
        monthly:[{v:'1.1%',s:5},{v:'0.6%',s:5},{v:'1.0%',s:5},{v:'0.9%',s:5},{v:'1.2%',s:5},{v:'1.0%',s:5}], avg:2.50 },
      { no:'', cat:'Team Performance', name:'การพัฒนาทักษะทีมงาน', unit:'Quality', weight:5, target:'100-120 ครั้ง/ปี',
        monthly:[{v:8,s:4},{v:8,s:4},{v:8,s:4},{v:9,s:4},{v:9,s:4},{v:12,s:5}], avg:2.08 },
      { no:5, cat:'Reporting', name:'Daily & Weekly Insight Report', unit:'%', weight:5, target:'90-100%',
        monthly:[{v:'80%',s:1},{v:'100%',s:5},{v:'100%',s:5},{v:'100%',s:5},{v:'100%',s:5},{v:'100%',s:5}], avg:2.17 }
    ]
  },
  'Ordering Center': {
    score: [0, 0, 0, 0, 0, 0],
    items: [
      { no:1, cat:'Sales Target', name:'ยอดขายรวมตามเป้า', unit:'%', weight:30, target:'-', monthly:[{v:'-',s:0},{v:'-',s:0},{v:'-',s:0},{v:'-',s:0},{v:'-',s:0},{v:'-',s:0}], avg:0 },
      { no:2, cat:'TeleSales', name:'ยอดเป้าหมายการโทรเปิดออเดอร์', unit:'%', weight:15, target:'-', monthly:[{v:'-',s:0},{v:'-',s:0},{v:'-',s:0},{v:'-',s:0},{v:'-',s:0},{v:'-',s:0}], avg:0 },
      { no:3, cat:'Conversion', name:'อัตราการเปลี่ยนลูกค้า', unit:'%', weight:15, target:'-', monthly:[{v:'-',s:0},{v:'-',s:0},{v:'-',s:0},{v:'-',s:0},{v:'-',s:0},{v:'-',s:0}], avg:0 }
    ]
  }
};

function _smKpiContent() {
  var months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.'];
  var teamKeys = Object.keys(SM_KPI_DATA);
  var scoreColor = function(s) {
    if (s >= 4) return '#16a34a';
    if (s >= 3) return '#2563eb';
    if (s >= 2) return '#f59e0b';
    if (s >= 1) return '#f97316';
    return '#dc2626';
  };
  var starScore = function(s) {
    if (s >= 5) return '★★★★★';
    if (s >= 4) return '★★★★☆';
    if (s >= 3) return '★★★☆☆';
    if (s >= 2) return '★★☆☆☆';
    if (s >= 1) return '★☆☆☆☆';
    return '☆☆☆☆☆';
  };
  var h = '';

  // --- Summary cards ---
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:20px">';
  for (var t = 0; t < teamKeys.length; t++) {
    var tk = teamKeys[t];
    var td = SM_KPI_DATA[tk];
    var lastScore = 0;
    for (var ls = td.score.length - 1; ls >= 0; ls--) { if (td.score[ls] > 0) { lastScore = td.score[ls]; break; } }
    var avgScore = 0; var cnt = 0;
    for (var a = 0; a < td.score.length; a++) { if (td.score[a] > 0) { avgScore += td.score[a]; cnt++; } }
    avgScore = cnt ? avgScore / cnt : 0;
    var pct = (avgScore / 5 * 100).toFixed(0);
    var col = scoreColor(avgScore);
    h += '<div style="background:#fff;border-radius:12px;padding:16px;border-left:4px solid '+col+';box-shadow:0 1px 3px rgba(0,0,0,.08)">';
    h += '<div style="font-size:12px;color:#64748b;font-weight:600">'+tk+'</div>';
    h += '<div style="font-size:28px;font-weight:800;color:'+col+';margin:4px 0">'+avgScore.toFixed(2)+'</div>';
    h += '<div style="font-size:11px;color:#94a3b8">เฉลี่ย / เต็ม 5.00 ('+pct+'%)</div>';
    h += '<div style="margin-top:6px;height:6px;background:#e2e8f0;border-radius:3px"><div style="height:100%;width:'+pct+'%;background:'+col+';border-radius:3px"></div></div>';
    h += '</div>';
  }
  h += '</div>';

  // --- Monthly trend chart (text-based) ---
  h += '<div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,.08)">';
  h += '<div style="font-weight:700;font-size:14px;color:#1e293b;margin-bottom:12px">📊 คะแนน KPI รายเดือน (เต็ม 5.00)</div>';
  h += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">';
  h += '<tr style="background:#f8fafc"><th style="padding:8px;text-align:left;border-bottom:2px solid #e2e8f0">ทีม</th>';
  for (var m = 0; m < months.length; m++) h += '<th style="padding:8px;text-align:center;border-bottom:2px solid #e2e8f0">'+months[m]+'</th>';
  h += '<th style="padding:8px;text-align:center;border-bottom:2px solid #e2e8f0;font-weight:700">เฉลี่ย</th></tr>';
  for (var t2 = 0; t2 < teamKeys.length; t2++) {
    var tk2 = teamKeys[t2]; var td2 = SM_KPI_DATA[tk2];
    h += '<tr><td style="padding:8px;font-weight:600;border-bottom:1px solid #f1f5f9">'+tk2+'</td>';
    var sum2 = 0; var cnt2 = 0;
    for (var m2 = 0; m2 < 6; m2++) {
      var sv = td2.score[m2];
      var c2 = scoreColor(sv);
      if (sv > 0) { sum2 += sv; cnt2++; }
      h += '<td style="padding:8px;text-align:center;border-bottom:1px solid #f1f5f9"><span style="display:inline-block;padding:2px 8px;border-radius:6px;background:'+c2+'15;color:'+c2+';font-weight:700">'+(sv > 0 ? sv.toFixed(2) : '-')+'</span></td>';
    }
    var avg2 = cnt2 ? (sum2/cnt2) : 0;
    h += '<td style="padding:8px;text-align:center;border-bottom:1px solid #f1f5f9;font-weight:800;color:'+scoreColor(avg2)+'">'+avg2.toFixed(2)+'</td>';
    h += '</tr>';
  }
  h += '</table></div></div>';

  // --- Detail per team (accordion) ---
  h += '<div id="smKpiTeams">';
  for (var t3 = 0; t3 < teamKeys.length; t3++) {
    var tk3 = teamKeys[t3]; var td3 = SM_KPI_DATA[tk3];
    var avgS = 0; var cntS = 0;
    for (var x = 0; x < td3.score.length; x++) { if (td3.score[x] > 0) { avgS += td3.score[x]; cntS++; } }
    avgS = cntS ? avgS/cntS : 0;
    var col3 = scoreColor(avgS);
    h += '<div style="background:#fff;border-radius:12px;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,.08);overflow:hidden">';
    h += '<div onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display===\'none\'?\'block\':\'none\';this.querySelector(\'.kpi-arrow\').textContent=this.nextElementSibling.style.display===\'none\'?\'▶\':\'▼\'" style="padding:14px 16px;cursor:pointer;display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,'+col3+'08,'+col3+'03)">';
    h += '<span class="kpi-arrow" style="font-size:12px;color:#64748b">▶</span>';
    h += '<span style="font-weight:700;color:#1e293b;flex:1">'+tk3+'</span>';
    h += '<span style="font-size:12px;color:'+col3+';font-weight:700">'+avgS.toFixed(2)+' / 5.00</span>';
    h += '<span style="font-size:11px;color:#94a3b8">'+starScore(avgS)+'</span>';
    h += '</div>';
    h += '<div style="display:none;padding:0 16px 16px">';
    h += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:8px">';
    h += '<tr style="background:#f8fafc"><th style="padding:6px 8px;text-align:left;border-bottom:2px solid #e2e8f0;white-space:nowrap">หัวข้อ</th><th style="padding:6px 8px;text-align:left;border-bottom:2px solid #e2e8f0">ตัวชี้วัด</th><th style="padding:6px 8px;text-align:center;border-bottom:2px solid #e2e8f0">น้ำหนัก</th><th style="padding:6px 8px;text-align:center;border-bottom:2px solid #e2e8f0">เป้าหมาย</th>';
    for (var m3 = 0; m3 < months.length; m3++) h += '<th style="padding:6px 8px;text-align:center;border-bottom:2px solid #e2e8f0">'+months[m3]+'</th>';
    h += '<th style="padding:6px 8px;text-align:center;border-bottom:2px solid #e2e8f0">ค่าเฉลี่ย</th></tr>';
    for (var i3 = 0; i3 < td3.items.length; i3++) {
      var it = td3.items[i3];
      h += '<tr><td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:11px;white-space:nowrap">'+(it.cat||'')+'</td>';
      h += '<td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;font-weight:600;white-space:nowrap">'+it.name+'</td>';
      h += '<td style="padding:6px 8px;text-align:center;border-bottom:1px solid #f1f5f9">'+it.weight+'%</td>';
      h += '<td style="padding:6px 8px;text-align:center;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:11px;white-space:nowrap">'+it.target+'</td>';
      for (var m4 = 0; m4 < 6; m4++) {
        var md = it.monthly[m4];
        var sc = md.s;
        var bgc = sc >= 4 ? '#dcfce7' : sc >= 3 ? '#dbeafe' : sc >= 2 ? '#fef3c7' : sc >= 1 ? '#ffedd5' : '#fee2e2';
        var txc = sc >= 4 ? '#166534' : sc >= 3 ? '#1e40af' : sc >= 2 ? '#92400e' : sc >= 1 ? '#9a3412' : '#991b1b';
        h += '<td style="padding:6px 8px;text-align:center;border-bottom:1px solid #f1f5f9"><span style="display:inline-block;padding:2px 6px;border-radius:4px;background:'+bgc+';color:'+txc+';font-weight:600;font-size:11px">'+md.v+'</span><div style="font-size:9px;color:#94a3b8;margin-top:1px">'+sc+'/5</div></td>';
      }
      var avgCol = scoreColor(it.avg);
      h += '<td style="padding:6px 8px;text-align:center;border-bottom:1px solid #f1f5f9;font-weight:700;color:'+avgCol+'">'+it.avg.toFixed(2)+'</td>';
      h += '</tr>';
    }
    // total row
    h += '<tr style="background:#f8fafc;font-weight:700"><td colspan="4" style="padding:8px;border-top:2px solid #e2e8f0">รวมคะแนน KPI</td>';
    for (var m5 = 0; m5 < 6; m5++) {
      var msv = td3.score[m5];
      var mc5 = scoreColor(msv);
      h += '<td style="padding:8px;text-align:center;border-top:2px solid #e2e8f0;color:'+mc5+'">'+( msv > 0 ? msv.toFixed(2) : '-')+'</td>';
    }
    h += '<td style="padding:8px;text-align:center;border-top:2px solid #e2e8f0;color:'+col3+'">'+avgS.toFixed(2)+'</td></tr>';
    h += '</table></div></div></div>';
  }
  h += '</div>';
  return h;
}

function _smPlaceholder(name) {
  return '<div style="text-align:center;padding:40px 20px;background:#f8fafc;border-radius:12px;border:2px dashed #e2e8f0">' +
    '<div style="font-size:3rem;margin-bottom:12px">🚧</div>' +
    '<div style="font-size:16px;font-weight:700;color:#475569">' + name + '</div>' +
    '<div style="font-size:13px;color:#94a3b8;margin-top:6px">เตรียมพร้อมใช้งาน — สามารถเพิ่มข้อมูลได้ในอนาคต</div></div>';
}

// ---- Performance Sales content ----
function _smPerfContent(chName) {
  var chStaffMap = {
    'Modern Trade': ['ระวีวรรณ (แอลลี่)', 'Vacancy (ว่าง)'],
    'Booth': ['Booth (ว่าง)'],
    'Online': ['Online (นนท์)'],
    'Amazon': ['ณัฏฐวรรณ (ยู)', 'ภาณุวัฒน์ (ซี)', 'วีระ (กานต์)'],
    'Ordering Center': []
  };
  var staff = chStaffMap[chName] || [];
  if (!staff.length || typeof SALES_MONTHLY === 'undefined') {
    return '<div style="text-align:center;padding:30px;background:#f8fafc;border-radius:12px;border:2px dashed #e2e8f0">' +
      '<div style="font-size:2.5rem;margin-bottom:8px">📈</div>' +
      '<div style="font-size:16px;font-weight:700;color:#475569">Performance Sales — ' + chName + '</div>' +
      '<div style="font-size:13px;color:#94a3b8;margin-top:6px">ยังไม่มีข้อมูลพนักงานในช่องทางนี้</div></div>';
  }

  var mos = (typeof _resolveMonths === 'function') ? _resolveMonths() : (typeof MONTHS !== 'undefined' ? MONTHS : ['Jan','Feb','Mar','Apr','May','Jun']);
  var moTh = { Jan:'ม.ค.', Feb:'ก.พ.', Mar:'มี.ค.', Apr:'เม.ย.', May:'พ.ค.', Jun:'มิ.ย.', Jul:'ก.ค.', Aug:'ส.ค.', Sep:'ก.ย.', Oct:'ต.ค.', Nov:'พ.ย.', Dec:'ธ.ค.' };
  var periodLabel = mos.length === 1 ? moTh[mos[0]] || mos[0] : 'YTD ' + (moTh[mos[0]] || '') + '–' + (moTh[mos[mos.length - 1]] || '');

  var chTotalAct = 0, chTotalTgt = 0;
  var staffData = [];
  staff.forEach(function(name) {
    var sm = SALES_MONTHLY[name];
    var st = SALES_MTH_TARGET[name] || {};
    if (!sm) return;
    var act = 0, tgt = 0;
    mos.forEach(function(mo) { act += (sm[mo] || 0); tgt += (st[mo] || 0); });
    var pct = tgt ? (act / tgt * 100) : 0;
    chTotalAct += act;
    chTotalTgt += tgt;
    staffData.push({ name: name, zone: sm.zone || '', act: act, tgt: tgt, pct: pct, monthly: sm, mTarget: st });
  });

  var chPct = chTotalTgt ? (chTotalAct / chTotalTgt * 100) : 0;
  var fmtN = function(v) { return (v / 1e6).toFixed(2) + ' M'; };
  var pctCls = function(p) { return p >= 80 ? '#22c55e' : p >= 60 ? '#f59e0b' : '#ef4444'; };
  var pctBg = function(p) { return p >= 80 ? '#f0fdf4' : p >= 60 ? '#fffbeb' : '#fef2f2'; };

  var html = '';

  // Channel summary
  html += '<div style="background:linear-gradient(135deg,#fff7ed,#ffedd5);border-radius:16px;padding:20px;margin-bottom:20px;border:1px solid #fed7aa">';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">';
  html += '<div><div style="font-size:13px;color:#9a3412;font-weight:600">📊 สรุปภาพรวม ' + chName + '</div>';
  html += '<div style="font-size:11px;color:#c2410c;margin-top:2px">' + periodLabel + '</div></div>';
  html += '<div style="display:flex;gap:20px;flex-wrap:wrap">';
  html += '<div style="text-align:center"><div style="font-size:11px;color:#78716c">เป้าหมาย</div><div style="font-size:18px;font-weight:700;color:#1e293b">' + fmtN(chTotalTgt) + '</div></div>';
  html += '<div style="text-align:center"><div style="font-size:11px;color:#78716c">ยอดจริง</div><div style="font-size:18px;font-weight:700;color:#ea580c">' + fmtN(chTotalAct) + '</div></div>';
  html += '<div style="text-align:center"><div style="font-size:11px;color:#78716c">ส่วนต่าง</div><div style="font-size:18px;font-weight:700;color:' + (chTotalAct >= chTotalTgt ? '#22c55e' : '#ef4444') + '">' + (chTotalAct >= chTotalTgt ? '+' : '') + fmtN(chTotalAct - chTotalTgt) + '</div></div>';
  html += '<div style="text-align:center"><div style="font-size:11px;color:#78716c">สำเร็จ</div><div style="font-size:18px;font-weight:700;color:' + pctCls(chPct) + '">' + chPct.toFixed(1) + '%</div></div>';
  html += '</div></div></div>';

  // Staff cards
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-bottom:20px">';
  staffData.forEach(function(s, idx) {
    var diff = s.act - s.tgt;
    html += '<div style="background:#fff;border-radius:14px;padding:18px;border:1px solid #e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,0.04)">';
    // Header
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">';
    html += '<div><div style="font-size:15px;font-weight:700;color:#1e293b">' + s.name + '</div>';
    html += '<div style="font-size:11px;color:#64748b;margin-top:2px">' + s.zone + '</div></div>';
    html += '<div style="background:' + pctBg(s.pct) + ';color:' + pctCls(s.pct) + ';padding:4px 10px;border-radius:20px;font-size:13px;font-weight:700">' + s.pct.toFixed(1) + '%</div>';
    html += '</div>';
    // Progress bar
    var barW = Math.min(Math.max(s.pct, 0), 100);
    html += '<div style="background:#f1f5f9;border-radius:6px;height:8px;margin-bottom:12px;overflow:hidden">';
    html += '<div style="background:' + pctCls(s.pct) + ';height:100%;border-radius:6px;width:' + barW + '%;transition:width .5s"></div></div>';
    // Numbers
    html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center">';
    html += '<div><div style="font-size:10px;color:#94a3b8">เป้าหมาย</div><div style="font-size:14px;font-weight:600;color:#475569">' + fmtN(s.tgt) + '</div></div>';
    html += '<div><div style="font-size:10px;color:#94a3b8">ยอดจริง</div><div style="font-size:14px;font-weight:600;color:#ea580c">' + fmtN(s.act) + '</div></div>';
    html += '<div><div style="font-size:10px;color:#94a3b8">ส่วนต่าง</div><div style="font-size:14px;font-weight:600;color:' + (diff >= 0 ? '#22c55e' : '#ef4444') + '">' + (diff >= 0 ? '+' : '') + fmtN(diff) + '</div></div>';
    html += '</div>';
    html += '</div>';
  });
  html += '</div>';

  // Monthly breakdown table
  html += '<div style="background:#fff;border-radius:14px;padding:18px;border:1px solid #e2e8f0;overflow-x:auto">';
  html += '<div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:12px">📅 ยอดขายรายเดือน</div>';
  html += '<table style="width:100%;border-collapse:collapse;font-size:12px">';
  html += '<thead><tr style="background:#f8fafc">';
  html += '<th style="padding:8px 10px;text-align:left;border-bottom:2px solid #e2e8f0;font-weight:600;color:#64748b;position:sticky;left:0;background:#f8fafc">พนักงาน</th>';
  mos.forEach(function(mo) {
    html += '<th style="padding:8px 6px;text-align:right;border-bottom:2px solid #e2e8f0;font-weight:600;color:#64748b;min-width:70px">' + (moTh[mo] || mo) + '</th>';
  });
  html += '<th style="padding:8px 10px;text-align:right;border-bottom:2px solid #e2e8f0;font-weight:700;color:#1e293b">รวม</th></tr></thead>';
  html += '<tbody>';
  staffData.forEach(function(s) {
    html += '<tr>';
    html += '<td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;font-weight:600;white-space:nowrap;position:sticky;left:0;background:#fff">' + s.name + '</td>';
    mos.forEach(function(mo) {
      var v = s.monthly[mo] || 0;
      var t = s.mTarget[mo] || 0;
      var mPct = t ? (v / t * 100) : 0;
      html += '<td style="padding:8px 6px;text-align:right;border-bottom:1px solid #f1f5f9;color:' + pctCls(mPct) + ';font-weight:500">' + fmtN(v) + '</td>';
    });
    html += '<td style="padding:8px 10px;text-align:right;border-bottom:1px solid #f1f5f9;font-weight:700;color:#ea580c">' + fmtN(s.act) + '</td>';
    html += '</tr>';
    // Target row
    html += '<tr style="background:#fafafa">';
    html += '<td style="padding:4px 10px;border-bottom:1px solid #f1f5f9;font-size:10px;color:#94a3b8;position:sticky;left:0;background:#fafafa">เป้า</td>';
    mos.forEach(function(mo) {
      html += '<td style="padding:4px 6px;text-align:right;border-bottom:1px solid #f1f5f9;font-size:10px;color:#94a3b8">' + fmtN(s.mTarget[mo] || 0) + '</td>';
    });
    html += '<td style="padding:4px 10px;text-align:right;border-bottom:1px solid #f1f5f9;font-size:10px;color:#94a3b8;font-weight:600">' + fmtN(s.tgt) + '</td>';
    html += '</tr>';
  });
  html += '</tbody></table></div>';

  return html;
}

// ---- Organization chart ----
function _smOrgChart() {
  var deptColors = { 'Modern Trade':'#f97316', 'Amazon':'#8b5cf6', 'Booth':'#10b981', 'Ordering Center':'#3b82f6', 'Online':'#ec4899' };
  var levelIcons = { 'ผู้อำนวยการ':'👑', 'ผู้จัดการ':'⭐', 'หัวหน้างาน':'🔷', 'เจ้าหน้าที่':'👤', 'พนักงาน':'🧑‍💼' };

  // Group by department
  var depts = {};
  SM_STAFF_DB.forEach(function(s) {
    if (!depts[s.dept]) depts[s.dept] = [];
    depts[s.dept].push(s);
  });

  // Count per department
  var deptCounts = {};
  SM_STAFF_DB.forEach(function(s) {
    if (!deptCounts[s.dept]) deptCounts[s.dept] = 0;
    deptCounts[s.dept]++;
  });

  var h = '<div style="padding:12px">';

  // Summary cards: total + per dept
  h += '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:20px;align-items:center">';
  h += '<div style="background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;padding:12px 20px;border-radius:12px;font-weight:700;font-size:14px;text-align:center;min-width:140px">' +
    '<div style="font-size:24px;font-weight:800">' + SM_STAFF_DB.length + '</div><div style="font-size:12px;opacity:.85">พนักงานทั้งหมด</div></div>';
  var deptOrder = ['Modern Trade','Amazon','Booth','Ordering Center','Online'];
  deptOrder.forEach(function(d) {
    var c = deptColors[d] || '#64748b';
    var cnt = deptCounts[d] || 0;
    h += '<div style="background:#fff;border:2px solid ' + c + ';padding:10px 16px;border-radius:10px;text-align:center;min-width:110px">' +
      '<div style="font-size:20px;font-weight:800;color:' + c + '">' + cnt + '</div>' +
      '<div style="font-size:11px;color:#475569">' + d + '</div></div>';
  });
  h += '</div>';

  // Top: Director + Manager
  var topStaff = SM_STAFF_DB.filter(function(s) { return s.level === 'ผู้อำนวยการ' || s.level === 'ผู้จัดการ'; });
  h += '<div style="text-align:center;margin-bottom:20px">';
  h += '<div style="display:inline-block;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;margin-bottom:16px">ฝ่ายขาย - การตลาด</div>';
  h += '<div style="display:flex;gap:16px;justify-content:center;margin-bottom:8px">';
  topStaff.forEach(function(s) {
    h += '<div style="background:#fff;border:2px solid #f97316;border-radius:12px;padding:16px 20px;min-width:200px;text-align:center;box-shadow:0 2px 8px rgba(249,115,22,0.15)">' +
      '<div style="font-size:1.8rem;margin-bottom:4px">' + (levelIcons[s.level] || '👤') + '</div>' +
      '<div style="font-weight:800;font-size:14px;color:#1e293b">' + s.nick + '</div>' +
      '<div style="font-size:11px;color:#475569;margin-top:2px">' + s.name + '</div>' +
      '<div style="font-size:11px;color:#f97316;font-weight:600;margin-top:4px">' + s.positionTh + '</div>' +
      '<div style="font-size:10px;color:#94a3b8;margin-top:2px">รหัส: ' + s.empId + '</div></div>';
  });
  h += '</div>';
  // Connector line
  h += '<div style="width:2px;height:20px;background:#e2e8f0;margin:0 auto"></div>';
  h += '</div>';

  // Department groups
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">';
  Object.keys(depts).forEach(function(dept) {
    var staff = depts[dept].filter(function(s) { return s.level !== 'ผู้อำนวยการ' && s.level !== 'ผู้จัดการ'; });
    if (staff.length === 0) return;
    var color = deptColors[dept] || '#64748b';
    h += '<div class="card" style="padding:0;overflow:hidden">';
    h += '<div style="background:' + color + ';color:#fff;padding:10px 16px;font-weight:700;font-size:13px">' + dept + ' <span style="opacity:.7;font-weight:400">(' + staff.length + ' คน)</span></div>';
    h += '<div style="padding:12px;display:flex;flex-direction:column;gap:8px">';
    staff.forEach(function(s) {
      h += '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:#f8fafc;border-radius:8px;border-left:3px solid ' + color + '">' +
        '<div style="font-size:1.2rem">' + (levelIcons[s.level] || '👤') + '</div>' +
        '<div style="flex:1">' +
        '<div style="font-weight:700;font-size:13px;color:#1e293b">' + s.nick + ' <span style="font-weight:400;color:#94a3b8;font-size:11px">(' + s.empId + ')</span></div>' +
        '<div style="font-size:11px;color:#475569">' + s.positionTh + '</div>' +
        '<div style="font-size:10px;color:#94a3b8">' + s.name + '</div>' +
        '</div>' +
        '<div style="font-size:10px;color:' + color + ';font-weight:600;background:' + color + '15;padding:2px 8px;border-radius:10px">' + s.level + '</div>' +
        '</div>';
    });
    h += '</div></div>';
  });
  h += '</div></div>';
  return h;
}

// ---- Staff data table ----
function _smStaffTable() {
  var deptColors = { 'Modern Trade':'#f97316', 'Amazon':'#8b5cf6', 'Booth':'#10b981', 'Ordering Center':'#3b82f6', 'Online':'#ec4899' };
  var staffList = (typeof _getAdminStaffList === 'function') ? _getAdminStaffList() : SM_STAFF_DB;
  var h = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">';
  h += '<div style="font-size:13px;color:#475569">จำนวนพนักงานทั้งหมด: <b style="color:#f97316">' + staffList.length + '</b> คน</div>';
  h += '<div style="display:flex;gap:8px">';
  h += '<button onclick="_openStaffForm()" style="padding:8px 18px;border:none;border-radius:8px;background:#22c55e;color:#fff;cursor:pointer;font-size:13px;font-weight:600">➕ เพิ่มพนักงาน</button>';
  h += '</div></div>';
  h += '<div class="table-wrap" style="overflow-x:auto"><table style="width:100%;font-size:11px;border-collapse:collapse;min-width:1400px"><thead><tr style="background:#1e293b;color:#fff">' +
    '<th style="padding:6px 8px;text-align:center;white-space:nowrap">#</th>' +
    '<th style="padding:6px 8px;text-align:left;white-space:nowrap">รหัส</th>' +
    '<th style="padding:6px 8px;text-align:left;white-space:nowrap">ชื่อ-นามสกุล</th>' +
    '<th style="padding:6px 8px;text-align:left;white-space:nowrap">ชื่อเล่น</th>' +
    '<th style="padding:6px 8px;text-align:left;white-space:nowrap">ตำแหน่ง (TH)</th>' +
    '<th style="padding:6px 8px;text-align:left;white-space:nowrap">ตำแหน่ง (EN)</th>' +
    '<th style="padding:6px 8px;text-align:left;white-space:nowrap">ระดับ</th>' +
    '<th style="padding:6px 8px;text-align:left;white-space:nowrap">แผนก</th>' +
    '<th style="padding:6px 8px;text-align:left;white-space:nowrap">สาขา/ความรับผิดชอบ</th>' +
    '<th style="padding:6px 8px;text-align:left;white-space:nowrap">เบอร์โทร</th>' +
    '<th style="padding:6px 8px;text-align:center;white-space:nowrap">วันเกิด</th>' +
    '<th style="padding:6px 8px;text-align:center;white-space:nowrap">วันเริ่มงาน</th>' +
    '<th style="padding:6px 8px;text-align:center;white-space:nowrap">อายุ</th>' +
    '<th style="padding:6px 8px;text-align:left;white-space:nowrap">Email บริษัท</th>' +
    '<th style="padding:6px 8px;text-align:left;white-space:nowrap">Email ส่วนตัว</th>' +
    '<th style="padding:6px 8px;text-align:center;white-space:nowrap">Actions</th>' +
    '</tr></thead><tbody>';
  staffList.forEach(function(s, i) {
    var color = deptColors[s.dept] || '#64748b';
    var bg = i % 2 === 0 ? '#fff' : '#f8fafc';
    h += '<tr style="border-bottom:1px solid #f1f5f9;background:' + bg + '">' +
      '<td style="padding:5px 8px;text-align:center;color:#94a3b8">' + (i+1) + '</td>' +
      '<td style="padding:5px 8px;font-family:monospace;color:#64748b;white-space:nowrap">' + s.empId + '</td>' +
      '<td style="padding:5px 8px;white-space:nowrap">' + s.name + '</td>' +
      '<td style="padding:5px 8px;font-weight:700;color:#1e293b">' + s.nick + '</td>' +
      '<td style="padding:5px 8px;color:#475569;font-size:10px">' + s.positionTh + '</td>' +
      '<td style="padding:5px 8px;color:#64748b;font-size:10px">' + (s.positionEn || '-') + '</td>' +
      '<td style="padding:5px 8px"><span style="font-size:10px;background:#f1f5f9;padding:2px 6px;border-radius:10px;white-space:nowrap">' + s.level + '</span></td>' +
      '<td style="padding:5px 8px"><span style="color:' + color + ';font-weight:600;font-size:10px;white-space:nowrap">' + s.dept + '</span></td>' +
      '<td style="padding:5px 8px;font-size:10px;color:#475569;max-width:180px">' + (s.branch || '-') + '</td>' +
      '<td style="padding:5px 8px;font-size:10px;color:#475569;white-space:nowrap">' + (s.phone || '-') + '</td>' +
      '<td style="padding:5px 8px;text-align:center;font-size:10px;color:#475569;white-space:nowrap">' + (s.birthday || '-') + '</td>' +
      '<td style="padding:5px 8px;text-align:center;font-size:10px;color:#475569;white-space:nowrap">' + (s.startDate || '-') + '</td>' +
      '<td style="padding:5px 8px;text-align:center;font-size:10px;color:#475569">' + (s.age || '-') + '</td>' +
      '<td style="padding:5px 8px;font-size:10px;color:#2563eb;white-space:nowrap">' + (s.emailCo || '-') + '</td>' +
      '<td style="padding:5px 8px;font-size:10px;color:#7c3aed;white-space:nowrap">' + (s.emailPersonal || '-') + '</td>' +
      '<td style="padding:5px 8px;text-align:center;white-space:nowrap">' +
      '<button onclick="smEditStaff(\'' + s.empId + '\')" style="background:none;border:none;cursor:pointer;font-size:13px" title="แก้ไข">✏️</button>' +
      '<button onclick="smDeleteStaff(\'' + s.empId + '\')" style="background:none;border:none;cursor:pointer;font-size:13px;margin-left:2px" title="ลบ">🗑️</button>' +
      '</td></tr>';
  });
  h += '</tbody></table></div>';
  return h;
}

function _smRefreshStaffData() {
  var el = document.getElementById('sm-hr-data');
  if (el && el.style.display !== 'none') {
    el.innerHTML = _smPageCard('📋', 'Data — ข้อมูลพนักงาน', 'ข้อมูลพนักงานฝ่ายขาย – การตลาด', _smStaffTable());
  }
}

function smEditStaff(empId) {
  var staff = (typeof _getAdminStaffList === 'function') ? _getAdminStaffList() : SM_STAFF_DB;
  var s = null;
  staff.forEach(function(x) { if (x.empId === empId) s = x; });
  if (!s) { alert('ไม่พบข้อมูลพนักงาน'); return; }
  _openStaffForm(s);
}

function smDeleteStaff(empId) {
  var staff = (typeof _getAdminStaffList === 'function') ? _getAdminStaffList() : SM_STAFF_DB;
  var s = null;
  staff.forEach(function(x) { if (x.empId === empId) s = x; });
  if (!s) return;
  if (!confirm('ลบพนักงาน "' + s.name + ' (' + s.nick + ')" ?')) return;
  if (typeof _saveAdminStaffOverride === 'function') _saveAdminStaffOverride(s, true);
  _smRefreshStaffData();
}

// ---- Auto-init first menu on tab open ----
var _smInited = false;
function smInitTab() {
  if (_smInited) return;
  _smInited = true;
  smSelectMain(document.querySelector('#smMainTabs .sub-tab'), 'sm-products');
  if (typeof _lvCheckEmailReminder === 'function') _lvCheckEmailReminder();
}

// --- ข้อมูลตั้งต้น ---
var SM_STAFF = [
  'นางสาววนัสนันท์ อินต๊ะเสน (คุณวี)',
  'นางสาวระวีวรรณ ไพรสงบ (แอลลี่)',
  'นางสาวณัฏฐวรรณ ธัญรัตนศรีสกุล (ยู)',
  'นายภาณุวัฒน์ ปานเผือก (ซี)',
  'นายวีระ พรมมี (กานต์)',
  'นางสาวธัญรัตน์ พุ่มนิล (ต้นปาล์ม)',
  'ฝ่ายขาย - การตลาด',
  'ออนไลน์'
];

var SM_CHANNELS = ['Modern Trade', 'Booth', 'Online', 'Amazon', 'Ordering Center', 'ฝ่ายขาย - การตลาด'];

var SM_EXP_TYPES = ['ค่าน้ำมัน', 'ค่าเบี้ยเลี้ยง', 'ค่าคอมมิชชั่น', 'ค่าทางด่วน', 'ค่าที่จอดรถ', 'ค่าใช้จ่ายอื่นๆ'];

var SM_SAMPLE_REASONS = [
  'ใช้สำหรับเป็นตัวอย่างการผลิตสินค้าใหม่',
  'ใช้สำหรับการผลิตสินค้าตัวอย่าง',
  'ใช้สำหรับการผลิต'
];

var SM_SUPPLY_REASONS = [
  'ใช้สำหรับส่งเสริมการขาย',
  'ใช้สำหรับทำงานในฝ่ายขาย - การตลาด',
  'อื่นๆ'
];

var _smRendered = {};

// --- Helper ---
function _smOpts(arr, ph) {
  var h = '<option value="">' + (ph || '-- เลือก --') + '</option>';
  for (var i = 0; i < arr.length; i++) h += '<option value="' + arr[i] + '">' + arr[i] + '</option>';
  return h;
}
function _smToday() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}
function _smGenId(prefix, key) {
  var today = _smToday().replace(/-/g, '');
  var all = _smLoad(key);
  var pfx = prefix + today + '-';
  var max = 0;
  for (var i = 0; i < all.length; i++) {
    if (all[i].id && all[i].id.indexOf(pfx) === 0) {
      var n = parseInt(all[i].id.substring(pfx.length), 10);
      if (n > max) max = n;
    }
  }
  return pfx + String(max+1).padStart(3,'0');
}

function _smLoad(key) {
  try { var d = localStorage.getItem(key); return d ? JSON.parse(d) : []; } catch(e) { return []; }
}
function _smSave(key, arr) { localStorage.setItem(key, JSON.stringify(arr)); }

function _smCsvEsc(val) {
  if (!val) return '';
  var s = String(val);
  if (s.indexOf(',') >= 0 || s.indexOf('"') >= 0 || s.indexOf('\n') >= 0) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function _smExportCsv(headers, rows, filename) {
  if (rows.length === 0) { alert('ไม่มีข้อมูล'); return; }
  var csv = '﻿' + headers.join(',') + '\n' + rows.join('\n');
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

// ============================================================
// SUMMARY DASHBOARD (sm-summary) — delegates to renderOvExpense
// ============================================================
function renderSmSummary() {
  renderOvExpense();
}

// ============================================================
// 1. ค่าใช้จ่ายเซลล์ — FORM
// ============================================================
function renderSmExpSalesForm() {
  var el = document.getElementById('sm-exp-sales');
  if (!el) return;
  if (el.getAttribute('data-rendered') === '1') return;
  el.setAttribute('data-rendered', '1');

  var today = _smToday();
  var html = '<div class="qf-container">';
  html += '<div class="qf-header"><h2>แบบฟอร์มค่าใช้จ่ายเซลล์</h2><p>กรอกข้อมูลค่าใช้จ่ายแล้วกด "บันทึก"</p></div>';
  html += '<div class="qf-section" id="sm-sec-sales"><div class="qf-section-header" onclick="qfToggleSection(this)"><span>รายละเอียดค่าใช้จ่าย</span><span class="qf-chevron">&#9650;</span></div><div class="qf-section-body">';
  html += '<div class="qf-row">' +
    '<div class="qf-field qf-half"><label class="qf-label">วันที่เบิก</label><input type="date" id="sm-s-dateW" class="qf-input" value="' + today + '"></div>' +
    '<div class="qf-field qf-half"><label class="qf-label">วันที่ตามบิลค่าใช้จ่าย</label><input type="date" id="sm-s-dateB" class="qf-input" value="' + today + '"></div></div>';
  html += '<div class="qf-row">' +
    '<div class="qf-field qf-half"><label class="qf-label">ชื่อเซลล์</label><select id="sm-s-staff" class="qf-input">' + _smOpts(SM_STAFF, '-- เลือกเซลล์ --') + '</select></div>' +
    '<div class="qf-field qf-half"><label class="qf-label">หัวข้อค่าใช้จ่าย</label><select id="sm-s-type" class="qf-input">' + _smOpts(SM_EXP_TYPES, '-- เลือกหัวข้อ --') + '</select></div></div>';
  html += '<div class="qf-row">' +
    '<div class="qf-field qf-third"><label class="qf-label">เลขที่บิล</label><input type="text" id="sm-s-billNo" class="qf-input" placeholder="เลขที่บิล"></div>' +
    '<div class="qf-field qf-third"><label class="qf-label">มูลค่า (บาท)</label><input type="number" id="sm-s-amount" class="qf-input" placeholder="0.00" min="0" step="0.01"></div>' +
    '<div class="qf-field qf-third"><label class="qf-label">หมายเหตุ</label><input type="text" id="sm-s-remark" class="qf-input" placeholder="หมายเหตุ"></div></div>';
  // แนบบิล
  html += '<div class="qf-row">' +
    '<div class="qf-field qf-half"><label class="qf-label">บิลค่าใช้จ่าย (รูป/PDF)</label><input type="file" id="sm-s-fileBill" class="qf-input" accept="image/*,.pdf"><div id="sm-s-fileBill-name" class="qf-file-name"></div></div>' +
    '<div class="qf-field qf-half"><label class="qf-label">Memo ตั้งเบิก (PDF)</label><input type="file" id="sm-s-fileMemo" class="qf-input" accept=".pdf"><div id="sm-s-fileMemo-name" class="qf-file-name"></div></div></div>';
  html += '</div></div>';
  html += '<div class="qf-submit-area"><button type="button" class="qf-btn-submit" onclick="smSubmitSalesExp()">บันทึกข้อมูล</button><button type="button" class="qf-btn-clear" onclick="smClearForm(\'sm-exp-sales\')">ล้างฟอร์ม</button></div>';
  html += '</div>';
  el.innerHTML = html;
}

function smSubmitSalesExp() {
  var staff = document.getElementById('sm-s-staff').value;
  var expType = document.getElementById('sm-s-type').value;
  var amount = parseFloat(document.getElementById('sm-s-amount').value) || 0;
  if (!staff) { alert('กรุณาเลือกชื่อเซลล์'); return; }
  if (!expType) { alert('กรุณาเลือกหัวข้อค่าใช้จ่าย'); return; }
  if (amount <= 0) { alert('กรุณากรอกมูลค่า'); return; }
  var rec = {
    id: _smGenId('SE-', 'smExpSales'),
    dateWithdraw: document.getElementById('sm-s-dateW').value,
    dateBill: document.getElementById('sm-s-dateB').value,
    staff: staff,
    expType: expType,
    billNo: (document.getElementById('sm-s-billNo').value || '').trim(),
    amount: amount,
    remark: (document.getElementById('sm-s-remark').value || '').trim(),
    createdAt: new Date().toISOString()
  };
  var all = _smLoad('smExpSales');
  all.push(rec);
  _smSave('smExpSales', all);
  alert('บันทึกสำเร็จ! รหัส: ' + rec.id);
  smClearForm('sm-exp-sales');
}

// ============================================================
// 2. ค่าจดทะเบียน อ.ย. — FORM
// ============================================================
function renderSmFdaForm() {
  var el = document.getElementById('sm-fda');
  if (!el) return;
  if (el.getAttribute('data-rendered') === '1') return;
  el.setAttribute('data-rendered', '1');

  var today = _smToday();
  var html = '<div class="qf-container">';
  html += '<div class="qf-header"><h2>แบบฟอร์มค่าจดทะเบียน อ.ย.</h2><p>กรอกข้อมูลค่าจดทะเบียน อ.ย.</p></div>';
  html += '<div class="qf-section"><div class="qf-section-header" onclick="qfToggleSection(this)"><span>ข้อมูลจดทะเบียน อ.ย.</span><span class="qf-chevron">&#9650;</span></div><div class="qf-section-body">';
  html += '<div class="qf-row">' +
    '<div class="qf-field qf-half"><label class="qf-label">วันที่จด อ.ย.</label><input type="date" id="sm-f-date" class="qf-input" value="' + today + '"></div>' +
    '<div class="qf-field qf-half"><label class="qf-label">ช่องทางจำหน่าย</label><select id="sm-f-channel" class="qf-input">' + _smOpts(SM_CHANNELS, '-- เลือกช่องทาง --') + '</select></div></div>';
  html += '<div class="qf-row">' +
    '<div class="qf-field qf-half"><label class="qf-label">รหัสสินค้า</label><input type="text" id="sm-f-prodcode" class="qf-input" placeholder="รหัสสินค้า"></div>' +
    '<div class="qf-field qf-half"><label class="qf-label">ชื่อสินค้า (ภาษาไทย)</label><input type="text" id="sm-f-prodth" class="qf-input" placeholder="ชื่อสินค้า (ไทย)"></div></div>';
  html += '<div class="qf-row">' +
    '<div class="qf-field qf-half"><label class="qf-label">ชื่อสินค้า (ภาษาอังกฤษ)</label><input type="text" id="sm-f-proden" class="qf-input" placeholder="Product name (EN)"></div>' +
    '<div class="qf-field qf-half"><label class="qf-label">เลข อ.ย.</label><input type="text" id="sm-f-fdano" class="qf-input" placeholder="เลข อ.ย."></div></div>';
  html += '<div class="qf-row">' +
    '<div class="qf-field qf-half"><label class="qf-label">ค่าใช้จ่าย (บาท)</label><input type="number" id="sm-f-cost" class="qf-input" placeholder="0.00" min="0" step="0.01"></div>' +
    '<div class="qf-field qf-half"><label class="qf-label">หมายเหตุ</label><input type="text" id="sm-f-remark" class="qf-input" placeholder="หมายเหตุ"></div></div>';
  html += '<div class="qf-row">' +
    '<div class="qf-field qf-half"><label class="qf-label">บิลค่าใช้จ่าย (รูป/PDF)</label><input type="file" id="sm-f-fileBill" class="qf-input" accept="image/*,.pdf"><div id="sm-f-fileBill-name" class="qf-file-name"></div></div>' +
    '<div class="qf-field qf-half"><label class="qf-label">Memo ตั้งเบิก (PDF)</label><input type="file" id="sm-f-fileMemo" class="qf-input" accept=".pdf"><div id="sm-f-fileMemo-name" class="qf-file-name"></div></div></div>';
  html += '<div class="qf-row">' +
    '<div class="qf-field qf-full"><label class="qf-label">สลิปการจ่ายค่าขึ้นทะเบียน อ.ย. (รูป/PDF)</label><input type="file" id="sm-f-fileSlip" class="qf-input" accept="image/*,.pdf"><div id="sm-f-fileSlip-name" class="qf-file-name"></div></div></div>';
  html += '</div></div>';
  html += '<div class="qf-submit-area"><button type="button" class="qf-btn-submit" onclick="smSubmitFda()">บันทึกข้อมูล</button><button type="button" class="qf-btn-clear" onclick="smClearForm(\'sm-fda\')">ล้างฟอร์ม</button></div>';
  html += '</div>';
  el.innerHTML = html;
}

function smSubmitFda() {
  var prodTh = (document.getElementById('sm-f-prodth').value || '').trim();
  var cost = parseFloat(document.getElementById('sm-f-cost').value) || 0;
  if (!prodTh) { alert('กรุณากรอกชื่อสินค้า'); return; }
  if (cost <= 0) { alert('กรุณากรอกค่าใช้จ่าย'); return; }
  var rec = {
    id: _smGenId('FDA-', 'smExpFda'),
    dateFda: document.getElementById('sm-f-date').value,
    channel: document.getElementById('sm-f-channel').value,
    prodCode: (document.getElementById('sm-f-prodcode').value || '').trim(),
    prodTh: prodTh,
    prodEn: (document.getElementById('sm-f-proden').value || '').trim(),
    fdaNo: (document.getElementById('sm-f-fdano').value || '').trim(),
    cost: cost,
    remark: (document.getElementById('sm-f-remark').value || '').trim(),
    createdAt: new Date().toISOString()
  };
  var all = _smLoad('smExpFda');
  all.push(rec);
  _smSave('smExpFda', all);
  alert('บันทึกสำเร็จ! รหัส: ' + rec.id);
  smClearForm('sm-fda');
}

// ============================================================
// 3. ค่าสินค้าตัวอย่าง — FORM
// ============================================================
function renderSmSampleForm() {
  var el = document.getElementById('sm-sample');
  if (!el) return;
  if (el.getAttribute('data-rendered') === '1') return;
  el.setAttribute('data-rendered', '1');

  var today = _smToday();
  var html = '<div class="qf-container">';
  html += '<div class="qf-header"><h2>แบบฟอร์มค่าสินค้าตัวอย่าง</h2><p>กรอกข้อมูลค่าสินค้าตัวอย่าง ฝ่ายขาย – การตลาด</p></div>';
  html += '<div class="qf-section"><div class="qf-section-header" onclick="qfToggleSection(this)"><span>ข้อมูลสินค้าตัวอย่าง</span><span class="qf-chevron">&#9650;</span></div><div class="qf-section-body">';
  html += '<div class="qf-row">' +
    '<div class="qf-field qf-half"><label class="qf-label">วันที่เบิก</label><input type="date" id="sm-sp-dateW" class="qf-input" value="' + today + '"></div>' +
    '<div class="qf-field qf-half"><label class="qf-label">วันที่ตามบิลค่าใช้จ่าย</label><input type="date" id="sm-sp-dateB" class="qf-input" value="' + today + '"></div></div>';
  html += '<div class="qf-row">' +
    '<div class="qf-field qf-half"><label class="qf-label">ชื่อเซลล์</label><select id="sm-sp-staff" class="qf-input">' + _smOpts(SM_STAFF, '-- เลือกเซลล์ --') + '</select></div>' +
    '<div class="qf-field qf-half"><label class="qf-label">ช่องทาง</label><select id="sm-sp-channel" class="qf-input">' + _smOpts(SM_CHANNELS, '-- เลือกช่องทาง --') + '</select></div></div>';
  html += '<div class="qf-row">' +
    '<div class="qf-field qf-half"><label class="qf-label">ชื่อร้าน</label><input type="text" id="sm-sp-shop" class="qf-input" placeholder="ชื่อร้าน"></div>' +
    '<div class="qf-field qf-half"><label class="qf-label">ชื่อสินค้า</label><input type="text" id="sm-sp-prod" class="qf-input" placeholder="ชื่อสินค้า"></div></div>';
  html += '<div class="qf-row">' +
    '<div class="qf-field qf-third"><label class="qf-label">จำนวน</label><input type="number" id="sm-sp-qty" class="qf-input" placeholder="0" min="0" oninput="smCalcSampleTotal()"></div>' +
    '<div class="qf-field qf-third"><label class="qf-label">ราคา/ชิ้น</label><input type="number" id="sm-sp-price" class="qf-input" placeholder="0.00" min="0" step="0.01" oninput="smCalcSampleTotal()"></div>' +
    '<div class="qf-field qf-third"><label class="qf-label">ยอดรวม</label><input type="text" id="sm-sp-total" class="qf-input" readonly value="0.00 บาท"></div></div>';
  html += '<div class="qf-row">' +
    '<div class="qf-field qf-third"><label class="qf-label">เลขที่บิล</label><input type="text" id="sm-sp-billNo" class="qf-input" placeholder="เลขที่บิล"></div>' +
    '<div class="qf-field qf-third"><label class="qf-label">สาเหตุการซื้อ</label><select id="sm-sp-reason" class="qf-input">' + _smOpts(SM_SAMPLE_REASONS, '-- เลือกสาเหตุ --') + '</select></div>' +
    '<div class="qf-field qf-third"><label class="qf-label">หมายเหตุ</label><input type="text" id="sm-sp-remark" class="qf-input" placeholder="หมายเหตุ"></div></div>';
  html += '<div class="qf-row">' +
    '<div class="qf-field qf-half"><label class="qf-label">บิลค่าใช้จ่าย (รูป/PDF)</label><input type="file" id="sm-sp-fileBill" class="qf-input" accept="image/*,.pdf"><div id="sm-sp-fileBill-name" class="qf-file-name"></div></div>' +
    '<div class="qf-field qf-half"><label class="qf-label">Memo ตั้งเบิก (PDF)</label><input type="file" id="sm-sp-fileMemo" class="qf-input" accept=".pdf"><div id="sm-sp-fileMemo-name" class="qf-file-name"></div></div></div>';
  html += '</div></div>';
  html += '<div class="qf-submit-area"><button type="button" class="qf-btn-submit" onclick="smSubmitSample()">บันทึกข้อมูล</button><button type="button" class="qf-btn-clear" onclick="smClearForm(\'sm-sample\')">ล้างฟอร์ม</button></div>';
  html += '</div>';
  el.innerHTML = html;
}

function smCalcSampleTotal() {
  var qty = parseInt(document.getElementById('sm-sp-qty').value) || 0;
  var price = parseFloat(document.getElementById('sm-sp-price').value) || 0;
  var total = qty * price;
  document.getElementById('sm-sp-total').value = total.toLocaleString('th-TH', {minimumFractionDigits:2}) + ' บาท';
}

function smSubmitSample() {
  var staff = document.getElementById('sm-sp-staff').value;
  var prod = (document.getElementById('sm-sp-prod').value || '').trim();
  if (!staff) { alert('กรุณาเลือกชื่อเซลล์'); return; }
  if (!prod) { alert('กรุณากรอกชื่อสินค้า'); return; }
  var qty = parseInt(document.getElementById('sm-sp-qty').value) || 0;
  var price = parseFloat(document.getElementById('sm-sp-price').value) || 0;
  var rec = {
    id: _smGenId('SP-', 'smExpSample'),
    dateWithdraw: document.getElementById('sm-sp-dateW').value,
    dateBill: document.getElementById('sm-sp-dateB').value,
    staff: staff,
    channel: document.getElementById('sm-sp-channel').value,
    shop: (document.getElementById('sm-sp-shop').value || '').trim(),
    product: prod,
    billNo: (document.getElementById('sm-sp-billNo').value || '').trim(),
    qty: qty,
    pricePerUnit: price,
    totalPrice: qty * price,
    reason: document.getElementById('sm-sp-reason').value,
    remark: (document.getElementById('sm-sp-remark').value || '').trim(),
    createdAt: new Date().toISOString()
  };
  var all = _smLoad('smExpSample');
  all.push(rec);
  _smSave('smExpSample', all);
  alert('บันทึกสำเร็จ! รหัส: ' + rec.id);
  smClearForm('sm-sample');
}

// ============================================================
// 4. ของใช้ในแผนก — FORM
// ============================================================
function renderSmSupplyForm() {
  var el = document.getElementById('sm-supply');
  if (!el) return;
  if (el.getAttribute('data-rendered') === '1') return;
  el.setAttribute('data-rendered', '1');

  var today = _smToday();
  var html = '<div class="qf-container">';
  html += '<div class="qf-header"><h2>แบบฟอร์มขอซื้อของใช้ในแผนก</h2><p>กรอกข้อมูลค่าของใช้ ส่วนกลางฝ่ายขาย</p></div>';
  html += '<div class="qf-section"><div class="qf-section-header" onclick="qfToggleSection(this)"><span>รายละเอียดของใช้ในแผนก</span><span class="qf-chevron">&#9650;</span></div><div class="qf-section-body">';
  html += '<div class="qf-row">' +
    '<div class="qf-field qf-half"><label class="qf-label">วันที่เบิก</label><input type="date" id="sm-su-date" class="qf-input" value="' + today + '"></div>' +
    '<div class="qf-field qf-half"><label class="qf-label">ช่องทาง</label><select id="sm-su-channel" class="qf-input">' + _smOpts(SM_CHANNELS, '-- เลือกช่องทาง --') + '</select></div></div>';
  html += '<div class="qf-row">' +
    '<div class="qf-field qf-full"><label class="qf-label">รายการค่าใช้จ่าย</label><input type="text" id="sm-su-item" class="qf-input" placeholder="ชื่อรายการ"></div></div>';
  html += '<div class="qf-row">' +
    '<div class="qf-field qf-third"><label class="qf-label">จำนวน</label><input type="number" id="sm-su-qty" class="qf-input" placeholder="0" min="0" oninput="smCalcSupplyTotal()"></div>' +
    '<div class="qf-field qf-third"><label class="qf-label">ราคาต่อชิ้น</label><input type="number" id="sm-su-price" class="qf-input" placeholder="0.00" min="0" step="0.01" oninput="smCalcSupplyTotal()"></div>' +
    '<div class="qf-field qf-third"><label class="qf-label">มูลค่า</label><input type="text" id="sm-su-total" class="qf-input" readonly value="0.00 บาท"></div></div>';
  html += '<div class="qf-row">' +
    '<div class="qf-field qf-half"><label class="qf-label">สาเหตุการซื้อ</label><select id="sm-su-reason" class="qf-input">' + _smOpts(SM_SUPPLY_REASONS, '-- เลือกสาเหตุ --') + '</select></div>' +
    '<div class="qf-field qf-half"><label class="qf-label">หมายเหตุ</label><input type="text" id="sm-su-remark" class="qf-input" placeholder="หมายเหตุ"></div></div>';
  html += '</div></div>';
  html += '<div class="qf-submit-area"><button type="button" class="qf-btn-submit" onclick="smSubmitSupply()">บันทึกข้อมูล</button><button type="button" class="qf-btn-clear" onclick="smClearForm(\'sm-supply\')">ล้างฟอร์ม</button></div>';
  html += '</div>';
  el.innerHTML = html;
}

function smCalcSupplyTotal() {
  var qty = parseInt(document.getElementById('sm-su-qty').value) || 0;
  var price = parseFloat(document.getElementById('sm-su-price').value) || 0;
  var total = qty * price;
  document.getElementById('sm-su-total').value = total.toLocaleString('th-TH', {minimumFractionDigits:2}) + ' บาท';
}

function smSubmitSupply() {
  var item = (document.getElementById('sm-su-item').value || '').trim();
  if (!item) { alert('กรุณากรอกรายการค่าใช้จ่าย'); return; }
  var qty = parseInt(document.getElementById('sm-su-qty').value) || 0;
  var price = parseFloat(document.getElementById('sm-su-price').value) || 0;
  var rec = {
    id: _smGenId('SU-', 'smExpSupply'),
    dateWithdraw: document.getElementById('sm-su-date').value,
    channel: document.getElementById('sm-su-channel').value,
    item: item,
    qty: qty,
    pricePerUnit: price,
    amount: qty * price,
    reason: document.getElementById('sm-su-reason').value,
    remark: (document.getElementById('sm-su-remark').value || '').trim(),
    createdAt: new Date().toISOString()
  };
  var all = _smLoad('smExpSupply');
  all.push(rec);
  _smSave('smExpSupply', all);
  alert('บันทึกสำเร็จ! รหัส: ' + rec.id);
  smClearForm('sm-supply');
}

// --- Clear form ---
function smClearForm(sectionId) {
  var el = document.getElementById(sectionId);
  if (el) { el.removeAttribute('data-rendered'); }
  if (sectionId === 'sm-exp-sales') renderSmExpSalesForm();
  if (sectionId === 'sm-fda') renderSmFdaForm();
  if (sectionId === 'sm-sample') renderSmSampleForm();
  if (sectionId === 'sm-supply') renderSmSupplyForm();
}

// ============================================================
// ADMIN VIEWS — เรนเดอร์ตาราง + filter + download ในแผงแอดมิน
// ============================================================
function renderAdmSmExpenses(tabKey) {
  var configMap = {
    'sales':  { key: 'smExpSales', title: 'ค่าใช้จ่ายเซลล์', elId: 'adm-sm-sales-body', headers: ['รหัส','วันที่เบิก','วันที่บิล','ชื่อเซลล์','หัวข้อ','มูลค่า','หมายเหตุ'],
      row: function(r) { return [r.id, r.dateWithdraw, r.dateBill, _smCsvEsc(r.staff), _smCsvEsc(r.expType), (r.amount||0).toFixed(2), _smCsvEsc(r.remark)]; },
      html: function(r) { return '<td>'+r.id+'</td><td>'+(r.dateWithdraw||'-')+'</td><td>'+(r.dateBill||'-')+'</td><td>'+(r.staff||'-')+'</td><td>'+(r.expType||'-')+'</td><td style="text-align:right">'+(r.amount||0).toLocaleString('th-TH',{minimumFractionDigits:2})+'</td><td>'+(r.remark||'-')+'</td>'; }
    },
    'fda':    { key: 'smExpFda', title: 'ค่าจดทะเบียน อ.ย.', elId: 'adm-sm-fda-body', headers: ['รหัส','วันที่','ช่องทาง','รหัสสินค้า','ชื่อสินค้า(ไทย)','ชื่อสินค้า(EN)','เลข อ.ย.','ค่าใช้จ่าย','หมายเหตุ'],
      row: function(r) { return [r.id, r.dateFda, _smCsvEsc(r.channel), _smCsvEsc(r.prodCode), _smCsvEsc(r.prodTh), _smCsvEsc(r.prodEn), _smCsvEsc(r.fdaNo), (r.cost||0).toFixed(2), _smCsvEsc(r.remark)]; },
      html: function(r) { return '<td>'+r.id+'</td><td>'+(r.dateFda||'-')+'</td><td>'+(r.channel||'-')+'</td><td>'+(r.prodCode||'-')+'</td><td>'+(r.prodTh||'-')+'</td><td>'+(r.prodEn||'-')+'</td><td>'+(r.fdaNo||'-')+'</td><td style="text-align:right">'+(r.cost||0).toLocaleString('th-TH',{minimumFractionDigits:2})+'</td><td>'+(r.remark||'-')+'</td>'; }
    },
    'sample': { key: 'smExpSample', title: 'ค่าสินค้าตัวอย่าง', elId: 'adm-sm-sample-body', headers: ['รหัส','วันที่เบิก','ชื่อเซลล์','ช่องทาง','ร้าน','สินค้า','จำนวน','ราคา/ชิ้น','ยอดรวม','สาเหตุ','หมายเหตุ'],
      row: function(r) { return [r.id, r.dateWithdraw, _smCsvEsc(r.staff), _smCsvEsc(r.channel), _smCsvEsc(r.shop), _smCsvEsc(r.product), r.qty, (r.pricePerUnit||0).toFixed(2), (r.totalPrice||0).toFixed(2), _smCsvEsc(r.reason), _smCsvEsc(r.remark)]; },
      html: function(r) { return '<td>'+r.id+'</td><td>'+(r.dateWithdraw||'-')+'</td><td>'+(r.staff||'-')+'</td><td>'+(r.channel||'-')+'</td><td>'+(r.shop||'-')+'</td><td>'+(r.product||'-')+'</td><td>'+r.qty+'</td><td style="text-align:right">'+(r.pricePerUnit||0).toFixed(2)+'</td><td style="text-align:right">'+(r.totalPrice||0).toLocaleString('th-TH',{minimumFractionDigits:2})+'</td><td>'+(r.reason||'-')+'</td><td>'+(r.remark||'-')+'</td>'; }
    },
    'supply': { key: 'smExpSupply', title: 'ของใช้ในแผนก', elId: 'adm-sm-supply-body', headers: ['รหัส','วันที่','ช่องทาง','รายการ','จำนวน','ราคา/ชิ้น','มูลค่า','สาเหตุ','หมายเหตุ'],
      row: function(r) { return [r.id, r.dateWithdraw, _smCsvEsc(r.channel), _smCsvEsc(r.item), r.qty, (r.pricePerUnit||0).toFixed(2), (r.amount||0).toFixed(2), _smCsvEsc(r.reason), _smCsvEsc(r.remark)]; },
      html: function(r) { return '<td>'+r.id+'</td><td>'+(r.dateWithdraw||'-')+'</td><td>'+(r.channel||'-')+'</td><td>'+(r.item||'-')+'</td><td>'+r.qty+'</td><td style="text-align:right">'+(r.pricePerUnit||0).toFixed(2)+'</td><td style="text-align:right">'+(r.amount||0).toLocaleString('th-TH',{minimumFractionDigits:2})+'</td><td>'+(r.reason||'-')+'</td><td>'+(r.remark||'-')+'</td>'; }
    }
  };

  var cfg = configMap[tabKey];
  if (!cfg) return;
  var el = document.getElementById(cfg.elId);
  if (!el) return;
  var all = _smLoad(cfg.key);

  var total = 0;
  all.forEach(function(r) { total += (r.amount || r.cost || r.totalPrice || 0); });

  var h = '<div class="qf-admin-cards" style="grid-template-columns:repeat(2,1fr)">' +
    '<div class="kpi-card" style="border-top:3px solid #3b82f6"><div class="kpi-label">จำนวนรายการ</div><div class="kpi-value" style="color:#3b82f6">' + all.length + '</div></div>' +
    '<div class="kpi-card" style="border-top:3px solid #ea580c"><div class="kpi-label">ยอดรวม</div><div class="kpi-value" style="color:#ea580c">฿' + total.toLocaleString('th-TH',{minimumFractionDigits:2}) + '</div></div></div>';

  h += '<div class="qf-admin-filter"><input type="text" id="smAdm' + tabKey + 'Search" class="qf-input" placeholder="ค้นหา..." oninput="smAdmFilter(\'' + tabKey + '\')" style="max-width:300px">' +
    '<button class="qf-btn-download" onclick="smAdmExport(\'' + tabKey + '\')">📥 ดาวน์โหลด CSV</button></div>';

  h += '<div class="table-wrap"><table class="qf-admin-table"><thead><tr style="background:#1e293b;color:#fff">';
  cfg.headers.forEach(function(hd) { h += '<th>' + hd + '</th>'; });
  h += '<th>จัดการ</th></tr></thead><tbody id="smAdm' + tabKey + 'Body">';
  if (all.length === 0) {
    h += '<tr><td colspan="' + (cfg.headers.length+1) + '" style="text-align:center;color:#94a3b8;padding:24px">ยังไม่มีข้อมูล</td></tr>';
  } else {
    for (var i = all.length - 1; i >= 0; i--) {
      h += '<tr data-id="' + all[i].id + '">' + cfg.html(all[i]) +
        '<td><button class="admin-btn sm" onclick="smAdmDelete(\'' + tabKey + '\',\'' + all[i].id + '\')" style="background:#fee2e2;color:#dc2626;border-color:#fca5a5">ลบ</button></td></tr>';
    }
  }
  h += '</tbody></table></div>';

  el.innerHTML = h;
}

function smAdmFilter(tabKey) {
  var search = (document.getElementById('smAdm' + tabKey + 'Search') || {}).value;
  if (search === undefined) return;
  search = search.toLowerCase();
  var rows = document.querySelectorAll('#smAdm' + tabKey + 'Body tr');
  for (var i = 0; i < rows.length; i++) {
    var txt = rows[i].textContent.toLowerCase();
    rows[i].style.display = (!search || txt.indexOf(search) >= 0) ? '' : 'none';
  }
}

function smAdmDelete(tabKey, id) {
  if (!confirm('ยืนยันลบรายการ ' + id + '?')) return;
  var keyMap = { sales: 'smExpSales', fda: 'smExpFda', sample: 'smExpSample', supply: 'smExpSupply' };
  var all = _smLoad(keyMap[tabKey]);
  var filtered = all.filter(function(r) { return r.id !== id; });
  _smSave(keyMap[tabKey], filtered);
  renderAdmSmExpenses(tabKey);
}

function smAdmExport(tabKey) {
  var configMap = {
    'sales':  { key: 'smExpSales', headers: ['รหัส','วันที่เบิก','วันที่บิล','ชื่อเซลล์','หัวข้อ','มูลค่า','หมายเหตุ'], row: function(r) { return [r.id, r.dateWithdraw, r.dateBill, _smCsvEsc(r.staff), _smCsvEsc(r.expType), (r.amount||0).toFixed(2), _smCsvEsc(r.remark)]; } },
    'fda':    { key: 'smExpFda', headers: ['รหัส','วันที่','ช่องทาง','รหัสสินค้า','ชื่อสินค้า(ไทย)','ชื่อสินค้า(EN)','เลข อ.ย.','ค่าใช้จ่าย','หมายเหตุ'], row: function(r) { return [r.id, r.dateFda, _smCsvEsc(r.channel), _smCsvEsc(r.prodCode), _smCsvEsc(r.prodTh), _smCsvEsc(r.prodEn), _smCsvEsc(r.fdaNo), (r.cost||0).toFixed(2), _smCsvEsc(r.remark)]; } },
    'sample': { key: 'smExpSample', headers: ['รหัส','วันที่เบิก','ชื่อเซลล์','ช่องทาง','ร้าน','สินค้า','จำนวน','ราคา/ชิ้น','ยอดรวม','สาเหตุ','หมายเหตุ'], row: function(r) { return [r.id, r.dateWithdraw, _smCsvEsc(r.staff), _smCsvEsc(r.channel), _smCsvEsc(r.shop), _smCsvEsc(r.product), r.qty, (r.pricePerUnit||0).toFixed(2), (r.totalPrice||0).toFixed(2), _smCsvEsc(r.reason), _smCsvEsc(r.remark)]; } },
    'supply': { key: 'smExpSupply', headers: ['รหัส','วันที่','ช่องทาง','รายการ','จำนวน','ราคา/ชิ้น','มูลค่า','สาเหตุ','หมายเหตุ'], row: function(r) { return [r.id, r.dateWithdraw, _smCsvEsc(r.channel), _smCsvEsc(r.item), r.qty, (r.pricePerUnit||0).toFixed(2), (r.amount||0).toFixed(2), _smCsvEsc(r.reason), _smCsvEsc(r.remark)]; } }
  };
  var cfg = configMap[tabKey];
  if (!cfg) return;
  var all = _smLoad(cfg.key);
  var rows = all.map(function(r) { return cfg.row(r).join(','); });
  var now = new Date();
  _smExportCsv(cfg.headers, rows, tabKey + '_' + now.getFullYear() + String(now.getMonth()+1).padStart(2,'0') + String(now.getDate()).padStart(2,'0') + '.csv');
}

// ============================================================
// OVERVIEW DASHBOARD — ค่าใช้จ่ายฝ่ายขาย sub-tab (Full)
// ============================================================
var _ovExpCharts = {};
function _ovExpDestroy(id) { if (_ovExpCharts[id]) { _ovExpCharts[id].destroy(); _ovExpCharts[id] = null; } }
function _ovExpDestroyAll() { Object.keys(_ovExpCharts).forEach(function(k) { _ovExpDestroy(k); }); }

function _ovExpFmt(v) { return '฿' + v.toLocaleString('th-TH', {minimumFractionDigits: 2}); }
function _ovExpPct(part, total) { return total > 0 ? (part / total * 100).toFixed(1) + '%' : '0%'; }

var _ovExpFilter = { year: '', quarter: '', month: '', dateFrom: '', dateTo: '' };

function _ovExpGetDate(r, cat) {
  if (cat === 'fda') return r.dateFda || '';
  return r.dateBill || r.dateWithdraw || '';
}

function _ovExpPassFilter(dateStr) {
  if (!dateStr) return true;
  var f = _ovExpFilter;
  if (f.dateFrom && dateStr < f.dateFrom) return false;
  if (f.dateTo && dateStr > f.dateTo) return false;
  if (f.year) {
    var y = dateStr.substring(0, 4);
    if (y !== f.year) return false;
  }
  if (f.month) {
    var m = dateStr.substring(5, 7);
    if (m !== f.month) return false;
  }
  if (f.quarter) {
    var mo = parseInt(dateStr.substring(5, 7));
    var q = Math.ceil(mo / 3);
    if (String(q) !== f.quarter) return false;
  }
  return true;
}

function _ovExpFilterData(arr, cat) {
  return arr.filter(function(r) { return _ovExpPassFilter(_ovExpGetDate(r, cat)); });
}

function _ovExpCollectYears() {
  var years = {};
  var keys = ['smExpSales', 'smExpFda', 'smExpSample', 'smExpSupply'];
  var cats = ['sales', 'fda', 'sample', 'supply'];
  for (var i = 0; i < keys.length; i++) {
    var arr = _smLoad(keys[i]);
    for (var j = 0; j < arr.length; j++) {
      var d = _ovExpGetDate(arr[j], cats[i]);
      if (d && d.length >= 4) years[d.substring(0, 4)] = true;
    }
  }
  var sorted = Object.keys(years).sort();
  if (sorted.length === 0) {
    var cy = new Date().getFullYear();
    sorted = [String(cy)];
  }
  return sorted;
}

function _ovExpBuildFilterBar() {
  var f = _ovExpFilter;
  var years = _ovExpCollectYears();
  var h = '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:16px;padding:14px 16px;background:#fff;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,.08)">';

  h += '<div style="display:flex;flex-direction:column;gap:4px"><label style="font-size:11px;font-weight:600;color:#64748b">ปี</label>' +
    '<select id="ovExpF-year" onchange="_ovExpOnFilter()" style="padding:6px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;min-width:90px">' +
    '<option value="">ทุกปี</option>';
  for (var i = 0; i < years.length; i++) {
    var sel = f.year === years[i] ? ' selected' : '';
    h += '<option value="' + years[i] + '"' + sel + '>' + (parseInt(years[i]) + 543) + '</option>';
  }
  h += '</select></div>';

  h += '<div style="display:flex;flex-direction:column;gap:4px"><label style="font-size:11px;font-weight:600;color:#64748b">ไตรมาส</label>' +
    '<select id="ovExpF-quarter" onchange="_ovExpOnFilter()" style="padding:6px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;min-width:90px">' +
    '<option value="">ทุกไตรมาส</option>';
  var qLabels = ['Q1 (ม.ค.-มี.ค.)', 'Q2 (เม.ย.-มิ.ย.)', 'Q3 (ก.ค.-ก.ย.)', 'Q4 (ต.ค.-ธ.ค.)'];
  for (var q = 1; q <= 4; q++) {
    var sel = f.quarter === String(q) ? ' selected' : '';
    h += '<option value="' + q + '"' + sel + '>' + qLabels[q - 1] + '</option>';
  }
  h += '</select></div>';

  h += '<div style="display:flex;flex-direction:column;gap:4px"><label style="font-size:11px;font-weight:600;color:#64748b">เดือน</label>' +
    '<select id="ovExpF-month" onchange="_ovExpOnFilter()" style="padding:6px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;min-width:110px">' +
    '<option value="">ทุกเดือน</option>';
  var mLabels = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  for (var m = 1; m <= 12; m++) {
    var mv = String(m).length < 2 ? '0' + m : String(m);
    var sel = f.month === mv ? ' selected' : '';
    h += '<option value="' + mv + '"' + sel + '>' + mLabels[m - 1] + '</option>';
  }
  h += '</select></div>';

  h += '<div style="display:flex;flex-direction:column;gap:4px"><label style="font-size:11px;font-weight:600;color:#64748b">ตั้งแต่วันที่</label>' +
    '<input type="date" id="ovExpF-dateFrom" value="' + (f.dateFrom || '') + '" onchange="_ovExpOnFilter()" style="padding:6px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px"></div>';

  h += '<div style="display:flex;flex-direction:column;gap:4px"><label style="font-size:11px;font-weight:600;color:#64748b">ถึงวันที่</label>' +
    '<input type="date" id="ovExpF-dateTo" value="' + (f.dateTo || '') + '" onchange="_ovExpOnFilter()" style="padding:6px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px"></div>';

  h += '<button onclick="_ovExpResetFilter()" style="padding:6px 14px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;cursor:pointer;color:#64748b;align-self:end">ล้างตัวกรอง</button>';

  h += '</div>';
  return h;
}

function _ovExpOnFilter() {
  _ovExpFilter.year = (document.getElementById('ovExpF-year') || {}).value || '';
  _ovExpFilter.quarter = (document.getElementById('ovExpF-quarter') || {}).value || '';
  _ovExpFilter.month = (document.getElementById('ovExpF-month') || {}).value || '';
  _ovExpFilter.dateFrom = (document.getElementById('ovExpF-dateFrom') || {}).value || '';
  _ovExpFilter.dateTo = (document.getElementById('ovExpF-dateTo') || {}).value || '';
  renderOvExpense();
}

function _ovExpResetFilter() {
  _ovExpFilter = { year: '', quarter: '', month: '', dateFrom: '', dateTo: '' };
  renderOvExpense();
}

function renderOvExpense() {
  var el = document.getElementById('ovExpContent');
  if (!el) return;
  _ovExpDestroyAll();

  var sales = _ovExpFilterData(_smLoad('smExpSales'), 'sales');
  var fda = _ovExpFilterData(_smLoad('smExpFda'), 'fda');
  var sample = _ovExpFilterData(_smLoad('smExpSample'), 'sample');
  var supply = _ovExpFilterData(_smLoad('smExpSupply'), 'supply');

  var totalSales = 0, totalFda = 0, totalSample = 0, totalSupply = 0;
  sales.forEach(function(r) { totalSales += (r.amount || 0); });
  fda.forEach(function(r) { totalFda += (r.cost || 0); });
  sample.forEach(function(r) { totalSample += (r.totalPrice || 0); });
  supply.forEach(function(r) { totalSupply += (r.amount || 0); });
  var grandTotal = totalSales + totalFda + totalSample + totalSupply;
  var totalCount = sales.length + fda.length + sample.length + supply.length;

  var mNames = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  var CAT_COLORS = ['#ea580c','#2563eb','#16a34a','#7c3aed'];
  var CAT_BG     = ['#fff7ed','#eff6ff','#f0fdf4','#f5f3ff'];
  var CAT_NAMES  = ['ค่าใช้จ่ายเซลล์','ค่าจดทะเบียน อ.ย.','ค่าสินค้าตัวอย่าง','ของใช้ในแผนก'];
  var CAT_ICONS  = ['💰','🏷️','🧪','📦'];
  var CAT_TOTALS = [totalSales, totalFda, totalSample, totalSupply];
  var CAT_COUNTS = [sales.length, fda.length, sample.length, supply.length];

  // ── Build HTML ──
  var h = '';

  // Filter bar
  h += _ovExpBuildFilterBar();

  // Active filter label
  var _fParts = [];
  if (_ovExpFilter.year) _fParts.push('ปี ' + (parseInt(_ovExpFilter.year) + 543));
  if (_ovExpFilter.quarter) _fParts.push('ไตรมาส ' + _ovExpFilter.quarter);
  if (_ovExpFilter.month) { var _ml = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']; _fParts.push(_ml[parseInt(_ovExpFilter.month) - 1]); }
  if (_ovExpFilter.dateFrom) _fParts.push('ตั้งแต่ ' + _ovExpFilter.dateFrom);
  if (_ovExpFilter.dateTo) _fParts.push('ถึง ' + _ovExpFilter.dateTo);
  if (_fParts.length > 0) {
    h += '<div style="margin-bottom:12px;padding:8px 14px;background:#fef3c7;border-radius:8px;font-size:13px;color:#92400e">🔍 กรองข้อมูล: <strong>' + _fParts.join(' · ') + '</strong> (' + totalCount + ' รายการ)</div>';
  }

  // Row 1: Grand total KPI
  h += '<div class="card" style="border-top:4px solid #f97316;margin-bottom:16px;text-align:center;padding:24px">' +
    '<div style="font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px">ค่าใช้จ่ายรวมทั้งหมด — ฝ่ายขาย & การตลาด</div>' +
    '<div style="font-size:2.4rem;font-weight:800;color:#ea580c;margin:8px 0">' + _ovExpFmt(grandTotal) + '</div>' +
    '<div style="font-size:13px;color:#94a3b8">' + totalCount + ' รายการ</div></div>';

  // Row 2: 4 category KPI cards — 2x2 grid
  h += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:16px">';
  for (var i = 0; i < 4; i++) {
    h += '<div class="kpi-card" style="border-top:3px solid ' + CAT_COLORS[i] + ';background:' + CAT_BG[i] + '">' +
      '<div class="kpi-label">' + CAT_ICONS[i] + ' ' + CAT_NAMES[i] + '</div>' +
      '<div class="kpi-value" style="color:' + CAT_COLORS[i] + '">' + _ovExpFmt(CAT_TOTALS[i]) + '</div>' +
      '<div class="kpi-sub">' + CAT_COUNTS[i] + ' รายการ · ' + _ovExpPct(CAT_TOTALS[i], grandTotal) + '</div></div>';
  }
  h += '</div>';

  // Row 3: Pie chart (สัดส่วน) + Bar chart (เปรียบเทียบหมวด)
  h += '<div class="row cols2">' +
    '<div class="card"><div class="card-title">สัดส่วนค่าใช้จ่ายแยกหมวด</div><div class="chart-wrap h280"><canvas id="ovExpPie"></canvas></div></div>' +
    '<div class="card"><div class="card-title">เปรียบเทียบค่าใช้จ่ายแต่ละหมวด</div><div class="chart-wrap h280"><canvas id="ovExpCatBar"></canvas></div></div></div>';

  // Row 4: Stacked bar chart (รายเดือน แยกหมวด)
  h += '<div class="card" style="margin-top:16px"><div class="card-title">ค่าใช้จ่ายรายเดือน แยกตามหมวด</div><div class="chart-wrap" style="height:320px"><canvas id="ovExpMonthStack"></canvas></div></div>';

  // Row 5: Staff horizontal bar + Expense type breakdown (ค่าใช้จ่ายเซลล์ แยกหัวข้อ)
  h += '<div class="row cols2" style="margin-top:16px">' +
    '<div class="card"><div class="card-title">ค่าใช้จ่ายรายบุคคล (Top 10)</div><div class="chart-wrap h280"><canvas id="ovExpStaff"></canvas></div></div>' +
    '<div class="card"><div class="card-title">ค่าใช้จ่ายเซลล์ แยกหัวข้อ</div><div class="chart-wrap h280"><canvas id="ovExpTypePie"></canvas></div></div></div>';

  // Row 6: Channel pie + Recent table
  h += '<div class="row cols2" style="margin-top:16px">' +
    '<div class="card"><div class="card-title">ค่าใช้จ่ายแยกช่องทาง</div><div class="chart-wrap h280"><canvas id="ovExpChPie"></canvas></div></div>' +
    '<div class="card"><div class="card-title">รายการล่าสุด (10 รายการ)</div><div id="ovExpRecent" style="overflow-x:auto"></div></div></div>';

  el.innerHTML = h;

  // ── Charts ──

  // 1) Doughnut — สัดส่วนหมวด
  _ovExpCharts.pie = new Chart(document.getElementById('ovExpPie'), {
    type: 'doughnut',
    data: { labels: CAT_NAMES, datasets: [{ data: CAT_TOTALS, backgroundColor: CAT_COLORS, borderWidth: 2, borderColor: '#fff' }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '55%',
      plugins: { legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } },
        tooltip: { callbacks: { label: function(ctx) { return ctx.label + ': ' + _ovExpFmt(ctx.raw) + ' (' + _ovExpPct(ctx.raw, grandTotal) + ')'; } } } } }
  });

  // 2) Bar — เปรียบเทียบหมวด
  _ovExpCharts.catBar = new Chart(document.getElementById('ovExpCatBar'), {
    type: 'bar',
    data: { labels: CAT_NAMES, datasets: [{ data: CAT_TOTALS, backgroundColor: CAT_COLORS, borderRadius: 8, barPercentage: 0.6 }] },
    options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y',
      plugins: { legend: { display: false },
        tooltip: { callbacks: { label: function(ctx) { return _ovExpFmt(ctx.raw); } } } },
      scales: { x: { beginAtZero: true, ticks: { callback: function(v) { return '฿' + v.toLocaleString(); } } } } }
  });

  // 3) Stacked bar — รายเดือน แยกหมวด
  var monthKeys = {};
  function _addMonth(date, amount, cat) {
    if (!date) return;
    var k = date.substring(0, 7);
    if (!monthKeys[k]) monthKeys[k] = { sales: 0, fda: 0, sample: 0, supply: 0 };
    monthKeys[k][cat] += amount;
  }
  sales.forEach(function(r) { _addMonth(r.dateBill || r.dateWithdraw, r.amount || 0, 'sales'); });
  fda.forEach(function(r) { _addMonth(r.dateFda, r.cost || 0, 'fda'); });
  sample.forEach(function(r) { _addMonth(r.dateBill || r.dateWithdraw, r.totalPrice || 0, 'sample'); });
  supply.forEach(function(r) { _addMonth(r.dateWithdraw, r.amount || 0, 'supply'); });

  var sortedMK = Object.keys(monthKeys).sort();
  var mkLabels = sortedMK.map(function(k) { var m = parseInt(k.substring(5, 7)); return mNames[m - 1] + ' ' + (parseInt(k.substring(0, 4)) + 543); });
  var catKeys = ['sales', 'fda', 'sample', 'supply'];

  _ovExpCharts.monthStack = new Chart(document.getElementById('ovExpMonthStack'), {
    type: 'bar',
    data: {
      labels: mkLabels,
      datasets: catKeys.map(function(ck, ci) {
        return { label: CAT_NAMES[ci], data: sortedMK.map(function(mk) { return monthKeys[mk][ck]; }),
          backgroundColor: CAT_COLORS[ci], borderRadius: 4 };
      })
    },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { padding: 14, font: { size: 11 } } },
        tooltip: { callbacks: { label: function(ctx) { return ctx.dataset.label + ': ' + _ovExpFmt(ctx.raw); } } } },
      scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true, ticks: { callback: function(v) { return '฿' + v.toLocaleString(); } } } } }
  });

  // 4) Staff horizontal bar (top 10)
  var byStaff = {};
  sales.forEach(function(r) { if (r.staff) byStaff[r.staff] = (byStaff[r.staff] || 0) + (r.amount || 0); });
  sample.forEach(function(r) { if (r.staff) byStaff[r.staff] = (byStaff[r.staff] || 0) + (r.totalPrice || 0); });
  var staffArr = Object.keys(byStaff).map(function(k) { return { name: k, total: byStaff[k] }; });
  staffArr.sort(function(a, b) { return b.total - a.total; });
  staffArr = staffArr.slice(0, 10);
  var staffColors = ['#f97316','#fb923c','#fdba74','#3b82f6','#60a5fa','#93c5fd','#16a34a','#4ade80','#86efac','#a78bfa'];

  _ovExpCharts.staff = new Chart(document.getElementById('ovExpStaff'), {
    type: 'bar',
    data: {
      labels: staffArr.map(function(s) { var m = s.name.match(/\(([^)]+)\)/); return m ? m[1] : s.name.substring(0, 15); }),
      datasets: [{ data: staffArr.map(function(s) { return s.total; }), backgroundColor: staffColors.slice(0, staffArr.length), borderRadius: 6 }]
    },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false },
        tooltip: { callbacks: { label: function(ctx) { return staffArr[ctx.dataIndex].name + ': ' + _ovExpFmt(ctx.raw); } } } },
      scales: { x: { beginAtZero: true, ticks: { callback: function(v) { return '฿' + v.toLocaleString(); } } } } }
  });

  // 5) Pie — ค่าใช้จ่ายเซลล์ แยกหัวข้อ (ค่าน้ำมัน, ค่าเบี้ยเลี้ยง, etc.)
  var byType = {};
  sales.forEach(function(r) { if (r.expType) byType[r.expType] = (byType[r.expType] || 0) + (r.amount || 0); });
  var typeNames = Object.keys(byType);
  var typeVals = typeNames.map(function(k) { return byType[k]; });
  var typeColors = ['#f97316','#eab308','#14b8a6','#8b5cf6','#ec4899','#6366f1'];

  _ovExpCharts.typePie = new Chart(document.getElementById('ovExpTypePie'), {
    type: 'pie',
    data: { labels: typeNames, datasets: [{ data: typeVals, backgroundColor: typeColors.slice(0, typeNames.length), borderWidth: 2, borderColor: '#fff' }] },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { padding: 10, font: { size: 11 } } },
        tooltip: { callbacks: { label: function(ctx) { return ctx.label + ': ' + _ovExpFmt(ctx.raw); } } } } }
  });

  // 6) Pie — แยกช่องทาง (รวมทุกหมวดที่มี channel)
  var byCh = {};
  fda.forEach(function(r) { if (r.channel) byCh[r.channel] = (byCh[r.channel] || 0) + (r.cost || 0); });
  sample.forEach(function(r) { if (r.channel) byCh[r.channel] = (byCh[r.channel] || 0) + (r.totalPrice || 0); });
  supply.forEach(function(r) { if (r.channel) byCh[r.channel] = (byCh[r.channel] || 0) + (r.amount || 0); });
  var chNames = Object.keys(byCh);
  var chVals = chNames.map(function(k) { return byCh[k]; });
  var chColors = ['#0ea5e9','#f43f5e','#10b981','#f59e0b','#8b5cf6','#64748b'];

  _ovExpCharts.chPie = new Chart(document.getElementById('ovExpChPie'), {
    type: 'doughnut',
    data: { labels: chNames, datasets: [{ data: chVals, backgroundColor: chColors.slice(0, chNames.length), borderWidth: 2, borderColor: '#fff' }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '50%',
      plugins: { legend: { position: 'bottom', labels: { padding: 10, font: { size: 11 } } },
        tooltip: { callbacks: { label: function(ctx) { var chTotal = chVals.reduce(function(a,b){return a+b;},0); return ctx.label + ': ' + _ovExpFmt(ctx.raw) + ' (' + _ovExpPct(ctx.raw, chTotal) + ')'; } } } } }
  });

  // 7) Recent transactions table
  var allRecs = [];
  sales.forEach(function(r) { allRecs.push({ date: r.dateBill || r.dateWithdraw, id: r.id, type: 'ค่าใช้จ่ายเซลล์', detail: r.expType + ' — ' + (r.staff || ''), amount: r.amount || 0 }); });
  fda.forEach(function(r) { allRecs.push({ date: r.dateFda, id: r.id, type: 'จดทะเบียน อ.ย.', detail: (r.prodTh || '') + ' ' + (r.fdaNo || ''), amount: r.cost || 0 }); });
  sample.forEach(function(r) { allRecs.push({ date: r.dateBill || r.dateWithdraw, id: r.id, type: 'สินค้าตัวอย่าง', detail: (r.product || '') + ' — ' + (r.staff || ''), amount: r.totalPrice || 0 }); });
  supply.forEach(function(r) { allRecs.push({ date: r.dateWithdraw, id: r.id, type: 'ของใช้ในแผนก', detail: r.item || '', amount: r.amount || 0 }); });
  allRecs.sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); });
  allRecs = allRecs.slice(0, 10);

  var th = '<table style="width:100%;font-size:12px;border-collapse:collapse"><thead><tr style="background:#f1f5f9">' +
    '<th style="padding:8px;text-align:left">วันที่</th><th style="padding:8px;text-align:left">รหัส</th>' +
    '<th style="padding:8px;text-align:left">ประเภท</th><th style="padding:8px;text-align:left">รายละเอียด</th>' +
    '<th style="padding:8px;text-align:right">มูลค่า</th></tr></thead><tbody>';
  if (allRecs.length === 0) {
    th += '<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:20px">ยังไม่มีข้อมูล</td></tr>';
  } else {
    allRecs.forEach(function(r) {
      th += '<tr style="border-bottom:1px solid #f1f5f9"><td style="padding:6px 8px">' + (r.date || '-') + '</td>' +
        '<td style="padding:6px 8px;font-family:monospace;font-size:11px">' + r.id + '</td>' +
        '<td style="padding:6px 8px">' + r.type + '</td>' +
        '<td style="padding:6px 8px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + r.detail + '</td>' +
        '<td style="padding:6px 8px;text-align:right;font-weight:600">' + _ovExpFmt(r.amount) + '</td></tr>';
    });
  }
  th += '</tbody></table>';
  document.getElementById('ovExpRecent').innerHTML = th;
}

// ============================================================
// LEAVE MANAGEMENT — ลงวันหยุดบุคลากร
// localStorage key: smLeaveData
// ============================================================

var SM_LEAVE_TYPES = [
  { id: 'sick',         label: 'ลาป่วย (Sick Leave)',             maxDays: 30, paid: true,  rules: 'ลาได้เท่าที่ป่วยจริง ไม่เกิน 30 วัน/ปี · ลา 1-2 วันไม่ต้องแนบใบรับรองแพทย์ · ลา 3 วันขึ้นไปต้องแนบใบรับรองแพทย์' },
  { id: 'personal',     label: 'ลากิจ (Personal Leave)',          maxDays: 3,  paid: true,  rules: 'ลากิจจำเป็นไม่เกิน 3 วัน/ปี โดยได้รับค่าจ้าง' },
  { id: 'annual',       label: 'ลาพักร้อน (Annual Leave)',        maxDays: 6,  paid: true,  rules: 'ทำงานครบ 1 ปี ได้สิทธิลาพักร้อนไม่น้อยกว่า 6 วัน/ปี โดยได้รับค่าจ้าง' },
  { id: 'maternity',    label: 'ลาคลอด (Maternity Leave)',        maxDays: 98, paid: true,  rules: 'ลาคลอดไม่เกิน 98 วันต่อการตั้งครรภ์ 1 ครั้ง นับรวมวันหยุดทุกประเภท · ใช้สำหรับตรวจครรภ์ คลอดบุตร และพักฟื้น' },
  { id: 'sterilization',label: 'ลาทำหมัน (Sterilization Leave)',  maxDays: 1,  paid: true,  rules: 'ลาทำหมันได้ 1 วันทำงาน โดยได้รับค่าจ้าง' },
  { id: 'ordination',   label: 'ลาอุปสมบท (Ordination Leave)',    maxDays: 15, paid: true,  rules: 'อายุงานครบ 1 ปี ลาบวชไม่เกิน 15 วัน โดยได้รับค่าจ้าง · ใช้สิทธิได้ 1 ครั้งตลอดอายุการทำงาน' },
  { id: 'hajj',         label: 'ลาฮัจย์ (Hajj Leave)',            maxDays: null, paid: false, rules: 'ยื่นขอลาล่วงหน้าอย่างน้อย 30 วัน พร้อมแนบเอกสารกำหนดการเดินทาง' },
  { id: 'military',     label: 'ลาเกณฑ์ทหาร (Military Leave)',    maxDays: 60, paid: true,  rules: 'ลาเพื่อรับราชการทหาร ฝึกวิชาทหาร ไม่เกิน 60 วัน/ปี · ต้องแนบหมายเรียกจากหน่วยงานราชการ' },
  { id: 'training',     label: 'ลาอบรม (Training Leave)',         maxDays: null, paid: true,  rules: 'ยื่นคำขอล่วงหน้าไม่น้อยกว่า 7 วัน พร้อมแนบหนังสือเชิญ/กำหนดการอบรม' },
  { id: 'lwop',         label: 'ลาไม่รับค่าจ้าง (LWOP)',          maxDays: null, paid: false, rules: 'ต้องได้รับอนุมัติจากผู้บังคับบัญชาและ HR · ยื่นล่วงหน้าอย่างน้อย 3 วันทำการ' },
  { id: 'other',        label: 'ลาอื่นๆ (Other Leave)',           maxDays: null, paid: false, rules: '' },
  { id: 'swap',         label: 'สลับวันหยุด',                     maxDays: null, paid: true,  rules: 'สลับวันหยุดเพื่อออกตลาด/พบลูกค้า/อบรม/Event/ธุระ' }
];

var SM_SWAP_REASONS = ['ออกตลาด', 'พบลูกค้า', 'อบรมนอกสถานที่', 'Event', 'ธุระ', 'อื่นๆ'];

var SM_DEPARTMENTS = ['Modern Trade', 'Booth', 'Online', 'Amazon', 'Ordering Center'];

var SM_POSITIONS = ['ผู้อำนวยการ', 'ผู้จัดการ', 'หัวหน้าแผนก', 'หัวหน้างาน', 'เจ้าหน้าที่', 'พนักงาน'];

// ฐานข้อมูลพนักงานฝ่ายขาย - การตลาด (from Excel)
var SM_STAFF_DB = [
  { empId:'64070068', name:'นางสาวปาล์ม บุญกุศล', nick:'คุณปาล์ม', positionTh:'ผู้อำนวยการฝ่ายขาย - การตลาด', positionEn:'Sales & Marketing Manager', level:'ผู้อำนวยการ', dept:'Modern Trade', deptTh:'ขายรายเดือน', branch:'ดูแลบริหารงานฝ่ายขายและการตลาด', phone:'', birthday:'', startDate:'', age:'', emailCo:'palm.b@wanwanach.com', emailPersonal:'' },
  { empId:'68030039', name:'นางสาววนัสนันท์ อินต๊ะเสน', nick:'คุณวี', positionTh:'ผู้จัดการฝ่ายขาย - การตลาด', positionEn:'Sales & Marketing Manager', level:'ผู้จัดการ', dept:'Modern Trade', deptTh:'ขายรายเดือน', branch:'ดูแลบริหารงานฝ่ายขายและการตลาด', phone:'096-2616598, 092-9526666', birthday:'01/06/1980', startDate:'16/03/2025', age:'45', emailCo:'sales.manager@wanwanach.com', emailPersonal:'sales.manager@wanwanach.com' },
  { empId:'66100584', name:'นางสาวธัญรัตน์ พุ่มนิล', nick:'ต้นปาล์ม', positionTh:'นักวิเคราะห์ยอดขาย', positionEn:'Sales Analysis', level:'เจ้าหน้าที่', dept:'Modern Trade', deptTh:'ขายรายเดือน', branch:'ประสานงาน ซัพพอตข้อมูลฝ่ายขายและการตลาด', phone:'082-6672575', birthday:'01/03/1993', startDate:'25/10/2023', age:'32', emailCo:'sale.analysis@wanwanach.com', emailPersonal:'plamwanwanuch25102566@gmail.com' },
  { empId:'65040204', name:'นางสาวระวีวรรณ ไพรสงบ', nick:'แอล', positionTh:'เซลล์โมเดิร์นเทรด', positionEn:'Sales Modern Trade', level:'เจ้าหน้าที่', dept:'Modern Trade', deptTh:'ขายรายเดือน', branch:'CJ, Aeon, Top, Big C, The Mall, Makro', phone:'093-4569749', birthday:'07/02/2001', startDate:'20/04/2022', age:'24', emailCo:'moderntrde_sales@wanwanach.com', emailPersonal:'raweewan070244@gmail.com' },
  { empId:'68110501', name:'นางสาวณัฏฐวรรณ ธัญรัตนศรีสกุล', nick:'ยู', positionTh:'เซลล์อเมซอน', positionEn:'Sale Amazon', level:'เจ้าหน้าที่', dept:'Amazon', deptTh:'ขายรายเดือน', branch:'BKK 01 (ปทุมธานี)', phone:'063-9835692', birthday:'', startDate:'04/02/2026', age:'29', emailCo:'amazon.sales@wanwanach.com', emailPersonal:'Nattawanhh1412@gmail.com' },
  { empId:'69020177', name:'นายภาณุวัฒน์ ปานเผือก', nick:'ซี', positionTh:'เซลล์อเมซอน', positionEn:'Sale Amazon', level:'เจ้าหน้าที่', dept:'Amazon', deptTh:'ขายรายเดือน', branch:'BKK 02 (นนทบุรี)', phone:'080-6623863', birthday:'', startDate:'', age:'43', emailCo:'amazon.sales@wanwanach.com', emailPersonal:'zeenew650@gmail.com' },
  { empId:'67050052', name:'นายวีระ พรมมี', nick:'กานต์', positionTh:'เซลล์อเมซอน', positionEn:'Sale Amazon', level:'เจ้าหน้าที่', dept:'Amazon', deptTh:'ขายรายเดือน', branch:'BKK 03 (สมุทรปราการ)', phone:'091-0030257', birthday:'05/02/1994', startDate:'23/05/2024', age:'31', emailCo:'amazon.sales@wanwanach.com', emailPersonal:'Weeraprommee@gmail.com' },
  { empId:'67110178', name:'นางสาววันเพ็ญ สินธุ์เจริญ', nick:'นกหวีด', positionTh:'เจ้าหน้าที่สนับสนุนฝ่ายขาย', positionEn:'Support Sales', level:'เจ้าหน้าที่', dept:'Modern Trade', deptTh:'ขายรายเดือน', branch:'ฝ่ายขาย - การตลาด', phone:'098-9136804', birthday:'21/06/1999', startDate:'17/11/2024', age:'26', emailCo:'support.sale@wanwanach.com', emailPersonal:'wanpensinchareon@gmail.com' },
  { empId:'67100138', name:'นางสาววิลาศีณี โชติช่วง', nick:'กลอย', positionTh:'เจ้าหน้าที่สนับสนุนฝ่ายขาย', positionEn:'Support Sales', level:'เจ้าหน้าที่', dept:'Modern Trade', deptTh:'ขายรายเดือน', branch:'ฝ่ายขาย - การตลาด', phone:'061-0390217', birthday:'07/06/2000', startDate:'16/10/2024', age:'25', emailCo:'moderntrade.support@wanwanach.com', emailPersonal:'wilasineechotchuang@gmail.com' },
  { empId:'69010012', name:'นางสาวศุภนิดา สวัสดี', nick:'ทราย', positionTh:'เจ้าหน้าที่สนับสนุนฝ่ายขาย', positionEn:'Support Sales', level:'เจ้าหน้าที่', dept:'Modern Trade', deptTh:'ขายรายเดือน', branch:'ฝ่ายขาย - การตลาด', phone:'063-5917919', birthday:'17/10/1990', startDate:'04/01/2026', age:'36', emailCo:'support.sale2@wanwanach.com', emailPersonal:'phaphatlalin@gmail.com' },
  { empId:'64120242', name:'นางสาววัลนิภา ฤทธิ์ประดับ', nick:'น้อย', positionTh:'พนักงานขายบูธสินค้า', positionEn:'พนักงานขาย', level:'พนักงาน', dept:'Booth', deptTh:'บูธรายวัน', branch:'ร้านใหม่ (ปตท.คุณาวรรณ)', phone:'063-2612368', birthday:'22/11/1986', startDate:'10/12/2021', age:'39', emailCo:'', emailPersonal:'' },
  { empId:'68020017', name:'นางสาวเปรมยุดา ฤทธิ์ประดับ', nick:'อุ้ม', positionTh:'พนักงานขายบูธสินค้า', positionEn:'พนักงานขาย', level:'พนักงาน', dept:'Booth', deptTh:'บูธรายวัน', branch:'หน้ามอ (ม.เกษตร)', phone:'062-5989488', birthday:'13/09/1993', startDate:'01/02/2025', age:'32', emailCo:'', emailPersonal:'' },
  { empId:'68080314', name:'นางสาวปราณี มาตยาคลู', nick:'นก', positionTh:'พนักงานขายบูธสินค้า', positionEn:'พนักงานขาย', level:'พนักงาน', dept:'Booth', deptTh:'บูธรายวัน', branch:'ลำพยา 3 เก่า', phone:'066-1253392', birthday:'23/05/1974', startDate:'03/10/2014', age:'51', emailCo:'', emailPersonal:'' },
  { empId:'67070076', name:'นางสาวภาณุมาศ ศรีทันดร', nick:'เค้ก', positionTh:'หัวหน้างานธุรการขาย', positionEn:'หัวหน้างาน Ordering Center', level:'หัวหน้างาน', dept:'Ordering Center', deptTh:'ธุรการขาย', branch:'ดูแลงานออเดอร์ฝ่ายขาย', phone:'092-6864207', birthday:'16/05/1985', startDate:'01/07/2024', age:'40', emailCo:'order.supervisor@wanwanach.com', emailPersonal:'cake162528@gmail.com' },
  { empId:'62070003', name:'นางสาวยุวดี สิงคาน', nick:'อ้อ', positionTh:'ธุรการขาย', positionEn:'Ordering Center Officer', level:'เจ้าหน้าที่', dept:'Ordering Center', deptTh:'ธุรการขาย', branch:'คีย์ออเดอร์ ติดต่อประสานงานลูกค้า', phone:'065-6204259', birthday:'19/02/1991', startDate:'01/07/2019', age:'35', emailCo:'online.sale@wanwanach.com', emailPersonal:'yuwadeearo4259@gmail.com' },
  { empId:'68080282', name:'นางสาวกาญจนา ศรีเหรา', nick:'แตงกวา', positionTh:'ธุรการขาย', positionEn:'Ordering Center Officer', level:'เจ้าหน้าที่', dept:'Ordering Center', deptTh:'ธุรการขาย', branch:'คีย์ออเดอร์ ติดต่อประสานงานลูกค้า', phone:'099-0830014', birthday:'04/07/2003', startDate:'03/08/2025', age:'22', emailCo:'online.sale@wanwanach.com', emailPersonal:'tangkwar4444@gmail.com' },
  { empId:'67120209', name:'นางสาวจุฑามาศ คุ้มผล', nick:'อัพ', positionTh:'ธุรการขาย', positionEn:'Ordering Center Officer', level:'เจ้าหน้าที่', dept:'Ordering Center', deptTh:'ธุรการขาย', branch:'คีย์ออเดอร์ ติดต่อประสานงานลูกค้า', phone:'094-5451300', birthday:'02/03/2001', startDate:'17/12/2024', age:'24', emailCo:'online.sale@wanwanach.com', emailPersonal:'workforjutamas@gmail.com' },
  { empId:'68120509', name:'นางสาวสุพัตรา แซ่ตั้น', nick:'โบว์', positionTh:'ธุรการขาย', positionEn:'Ordering Center Officer', level:'เจ้าหน้าที่', dept:'Ordering Center', deptTh:'ธุรการขาย', branch:'คีย์ออเดอร์ ติดต่อประสานงานลูกค้า', phone:'093-4342441', birthday:'05/01/1987', startDate:'01/12/2025', age:'38', emailCo:'online.sale@wanwanach.com', emailPersonal:'supattrasae1987@gmail.com' },
  { empId:'69050031', name:'นายพีรพัฒน์ เพราะเจริญ', nick:'บิวตี้', positionTh:'ธุรการขาย', positionEn:'Ordering Center Officer', level:'เจ้าหน้าที่', dept:'Ordering Center', deptTh:'ธุรการขาย', branch:'คีย์ออเดอร์ ติดต่อประสานงานลูกค้า', phone:'061-6067114', birthday:'02/07/2005', startDate:'20/06/2026', age:'21', emailCo:'online.sale@wanwanach.com', emailPersonal:'bb0616067114@gmail.com' },
  { empId:'67120200', name:'นายอัฐพล สงวนดี', nick:'ฟิวส์', positionTh:'ธุรการขาย', positionEn:'Ordering Center Officer', level:'เจ้าหน้าที่', dept:'Ordering Center', deptTh:'ธุรการขาย', branch:'Support, รับ PO: Amazon, MDT', phone:'098-6372738', birthday:'15/05/2002', startDate:'08/12/2024', age:'23', emailCo:'online.sale@wanwanach.com', emailPersonal:'fivufiw04@gmail.com' },
  { empId:'68020024', name:'นางสาวพุธิตา พจสุวรรณ์', nick:'นับนิว', positionTh:'ธุรการออนไลน์', positionEn:'Online Officer', level:'เจ้าหน้าที่', dept:'Online', deptTh:'ขายออนไลน์', branch:'ทำ Memo, Revised, Forecast, เปิดบิล, คีย์ COD', phone:'092-2525944', birthday:'02/02/2001', startDate:'02/02/2025', age:'24', emailCo:'online.sale@wanwanach.com', emailPersonal:'phuthita.nn@gmail.com' },
  { empId:'66070413', name:'นางสาวนฤมล ทองเต่าอินทร์', nick:'ส้ม', positionTh:'ธุรการออนไลน์', positionEn:'Online Officer', level:'เจ้าหน้าที่', dept:'Online', deptTh:'ขายออนไลน์', branch:'งานธุรการ ออกบิล ตอบแชท งานเอกสารทั้งหมด', phone:'093-0292194', birthday:'05/03/1996', startDate:'05/07/2023', age:'29', emailCo:'online.sale@wanwanach.com', emailPersonal:'somnarumon39@gmail.com' },
  { empId:'66070443', name:'นางสาวฐิติพร ลวกิตติไชยยันต์', nick:'อาย', positionTh:'ไลฟ์สดออนไลน์', positionEn:'Live Staff', level:'เจ้าหน้าที่', dept:'Online', deptTh:'ขายออนไลน์', branch:'ไลฟ์สด', phone:'083-2622509', birthday:'28/06/2000', startDate:'09/07/2023', age:'25', emailCo:'online.sale@wanwanach.com', emailPersonal:'thitipornlwktcy@gmail.com' },
  { empId:'67090114', name:'นางสาวสุดารัตน์ สวัสดิ์รัมย์', nick:'เรย์', positionTh:'ไลฟ์สดออนไลน์', positionEn:'Live Staff', level:'เจ้าหน้าที่', dept:'Online', deptTh:'ขายออนไลน์', branch:'ไลฟ์สด', phone:'098-1370395', birthday:'20/06/2000', startDate:'05/09/2024', age:'25', emailCo:'online.sale@wanwanach.com', emailPersonal:'sudarat.sawatram@gmail.com' },
  { empId:'64110282', name:'นางสาวรวีวรรณ มีจั่นเพชร', nick:'แอม', positionTh:'ไลฟ์สดออนไลน์', positionEn:'Live Staff', level:'เจ้าหน้าที่', dept:'Online', deptTh:'ขายออนไลน์', branch:'ไลฟ์สด', phone:'098-9849399', birthday:'02/01/1999', startDate:'30/11/2021', age:'26', emailCo:'online.sale@wanwanach.com', emailPersonal:'raweewan5499@gmail.com' },
  { empId:'6810492',  name:'นางสาวอริสยา แซ่ลิ้ม', nick:'แจม', positionTh:'ไลฟ์สดออนไลน์', positionEn:'Live Staff', level:'เจ้าหน้าที่', dept:'Online', deptTh:'ขายออนไลน์', branch:'ไลฟ์สด', phone:'092-8036541', birthday:'01/04/2002', startDate:'01/02/2022', age:'23', emailCo:'online.sale@wanwanach.com', emailPersonal:'opporeno15fmk@gmail.com' }
];

var SM_LEAVE_STAFF = SM_STAFF_DB;

function _getLeaveData() {
  try { return JSON.parse(localStorage.getItem('smLeaveData') || '[]'); } catch(e) { return []; }
}

function _saveLeaveData(arr) {
  localStorage.setItem('smLeaveData', JSON.stringify(arr));
}

// ---- Cleanup: remove old holiday seed data from localStorage ----
(function(){
  var arr = _getLeaveData();
  var before = arr.length;
  arr = arr.filter(function(r){ return r.source !== 'excel-import'; });
  if (arr.length < before) { _saveLeaveData(arr); }
  localStorage.removeItem('smLeaveDataSeeded');
})();

// ---- (removed) Seed data from Sales holiday record.xlsx ----
/*"2026-01-02":["แอล","อ้อ","โบว์","แอม"],"2026-01-03":["คุณวี","ต้นปาล์ม","แอล","กานต์","นกหวีด","กลอย","ทราย","เค้ก","กาฟิวส์","แตงกวา","อัพ","ส้ม","เรย์"],"2026-01-04":["คุณวี","ยู","อาย","นับนิว"],"2026-01-05":["อาย"],"2026-01-06":["แจม"],"2026-01-09":["คุณวี","ต้นปาล์ม","แอล","กานต์","ยู","นกหวีด","กลอย","ทราย","เค้ก","อ้อ","โบว์","กาฟิวส์","แตงกวา","อัพ","อาย","แจม","นับนิว"],"2026-01-10":["คุณวี","ต้นปาล์ม","แอล","นกหวีด","กลอย","ทราย","เค้ก","กาฟิวส์","แตงกวา","อัพ","ส้ม","เรย์","แอม"],"2026-01-11":["คุณวี","ต้นปาล์ม","กานต์","ยู","นกหวีด","กลอย","กาฟิวส์","ส้ม"],"2026-01-12":["ส้ม"],"2026-01-13":["แจม"],"2026-01-15":["กานต์","นับนิว","แอม"],"2026-01-16":["อ้อ","โบว์","อาย"],"2026-01-17":["คุณวี","ต้นปาล์ม","แอล","นกหวีด","กลอย","ทราย","เค้ก","กาฟิวส์","แตงกวา","อัพ","เรย์"],"2026-01-18":["คุณวี","กานต์","ยู","กาฟิวส์","แตงกวา","ส้ม"],"2026-01-20":["แจม"],"2026-01-21":["นับนิว"],"2026-01-22":["กลอย","นับนิว"],"2026-01-23":["กลอย","อ้อ","โบว์","อาย","นับนิว"],"2026-01-24":["คุณวี","ต้นปาล์ม","แอล","นกหวีด","กลอย","ทราย","เค้ก","กาฟิวส์","แตงกวา","อัพ","เรย์","แอม"],"2026-01-25":["คุณวี","ยู","กลอย","เรย์","แอม"],"2026-01-26":["กานต์","กลอย","ส้ม","อาย"],"2026-01-27":["กลอย","อัพ","แจม"],"2026-01-28":["กลอย"],"2026-01-29":["กลอย","เค้ก","แตงกวา","นับนิว","แอม"],"2026-01-30":["กลอย","อ้อ","โบว์","กาฟิวส์","แตงกวา","อาย"],"2026-01-31":["คุณวี","ต้นปาล์ม","แอล","กานต์","นกหวีด","กลอย","ทราย","เค้ก","กาฟิวส์","แตงกวา","อุ้ม","อัพ","เรย์"],"2026-02-01":["คุณวี","ยู","นกหวีด","กลอย","กาฟิวส์","อัพ","แจม"],"2026-02-02":["กานต์","นกหวีด","กลอย","แตงกวา","อัพ","ส้ม"],"2026-02-03":["กลอย","อาย"],"2026-02-04":["กานต์","กลอย","อาย","นับนิว","แอม"],"2026-02-05":["กานต์","กลอย"],"2026-02-06":["นกหวีด","กลอย","อ้อ","โบว์","อัพ","ส้ม","เรย์"],"2026-02-07":["คุณวี","ต้นปาล์ม","แอล","นกหวีด","กลอย","เค้ก","กาฟิวส์","แตงกวา","อุ้ม","อัพ"],"2026-02-08":["คุณวี","ยู","กลอย","กาฟิวส์","อัพ","เรย์","อาย","นับนิว"],"2026-02-09":["แจม"],"2026-02-10":["นับนิว"],"2026-02-12":["ต้นปาล์ม"],"2026-02-13":["ต้นปาล์ม","นกหวีด","กลอย","เค้ก","อ้อ","โบว์","อัพ","นับนิว","แอม"],"2026-02-14":["คุณวี","ต้นปาล์ม","แอล","นกหวีด","กลอย","เค้ก","กาฟิวส์","แตงกวา","อุ้ม","อัพ","ส้ม","เรย์"],"2026-02-15":["คุณวี","ยู","แจม"],"2026-02-16":["คุณวี","ต้นปาล์ม","แอล","กานต์","ยู","นกหวีด","กลอย","ทราย","เค้ก","อ้อ","โบว์","กาฟิวส์","แตงกวา","อุ้ม","อัพ","นับนิว"],"2026-02-17":["กลอย"],"2026-02-18":["แอม"],"2026-02-19":["แอม"],"2026-02-20":["อ้อ","โบว์"],"2026-02-21":["คุณวี","ต้นปาล์ม","แอล","นกหวีด","กลอย","ทราย","เค้ก","กาฟิวส์","แตงกวา","อุ้ม","อัพ","เรย์"],"2026-02-22":["คุณวี","ยู","นกหวีด","อุ้ม","แจม"],"2026-02-23":["อัพ"],"2026-02-24":["กานต์","ส้ม","นับนิว"],"2026-02-26":["นับนิว","แอม"],"2026-02-27":["อ้อ","โบว์","นับนิว"],"2026-02-28":["คุณวี","ต้นปาล์ม","แอล","นกหวีด","กลอย","ทราย","เค้ก","กาฟิวส์","แตงกวา","อุ้ม","อัพ","ส้ม","เรย์"],"2026-02-29":["คุณวี","ยู"],"2026-03-01":["คุณวี","ต้นปาล์ม","ยู","ซี","ส้ม","แจม"],"2026-03-03":["คุณวี","ต้นปาล์ม","แอล","กานต์","ยู","ซี","นกหวีด","กลอย","ทราย","เค้ก","อ้อ","โบว์","กาฟิวส์","แตงกวา","อุ้ม","อัพ","อาย"],"2026-03-04":["อาย","แอม"],"2026-03-05":["อาย"],"2026-03-06":["อ้อ","โบว์","อัพ","นับนิว"],"2026-03-07":["คุณวี","ต้นปาล์ม","แอล","กานต์","ยู","นกหวีด","กลอย","ทราย","เค้ก","กาฟิวส์","แตงกวา","อุ้ม","อัพ","ส้ม","เรย์"],"2026-03-08":["คุณวี","ยู","ซี","เรย์"],"2026-03-09":["ต้นปาล์ม","อาย","แจม"],"2026-03-10":["นับนิว"],"2026-03-11":["แอม"],"2026-03-12":["แอม"],"2026-03-13":["ต้นปาล์ม","อ้อ","โบว์","เรย์","นับนิว"],"2026-03-14":["คุณวี","ต้นปาล์ม","แอล","ยู","นกหวีด","กลอย","ทราย","เค้ก","กาฟิวส์","แตงกวา","อุ้ม","อัพ","เรย์"],"2026-03-15":["คุณวี","กานต์","ยู","ซี","เค้ก","เรย์","แจม"],"2026-03-17":["แตงกวา"],"2026-03-18":["อาย","แอม"],"2026-03-19":["นกหวีด","นับนิว","แอม"],"2026-03-20":["อ้อ","โบว์","อาย"],"2026-03-21":["คุณวี","ต้นปาล์ม","แอล","กานต์","กลอย","กาฟิวส์","แตงกวา","อุ้ม","อัพ","ส้ม","เรย์"],"2026-03-22":["คุณวี","ยู","ซี","นกหวีด","กลอย","ทราย","ส้ม","แจม"],"2026-03-23":["แจม","แอม"],"2026-03-25":["อาย","แอม"],"2026-03-26":["กานต์","อาย","นับนิว","แอม"],"2026-03-27":["อ้อ","โบว์","อัพ","ส้ม"],"2026-03-28":["คุณวี","ต้นปาล์ม","กาฟิวส์","แตงกวา","อุ้ม","อัพ","ส้ม","เรย์"],"2026-03-29":["คุณวี","แอล","ยู","ซี","นกหวีด","กลอย","ทราย","เค้ก","ส้ม","แจม"],"2026-03-30":["โบว์","อาย"],"2026-03-31":["อาย","แจม"],"2026-04-01":["อาย","แจม"],"2026-04-02":["นับนิว"],"2026-04-03":["อ้อ","โบว์"],"2026-04-04":["คุณวี","ต้นปาล์ม","บี","แอล","นกหวีด","กลอย","ทราย","เค้ก","กาฟิวส์","แตงกวา","อุ้ม","อัพ","ส้ม","เรย์"],"2026-04-05":["คุณวี","บี","แอล","ยู","ซี","แอม"],"2026-04-06":["คุณวี","ต้นปาล์ม","บี","แอล","กานต์","ยู","ซี","นกหวีด","กลอย","ทราย","เค้ก","อ้อ","โบว์","กาฟิวส์","แตงกวา","อุ้ม","อัพ","อาย","แอม"],"2026-04-07":["กานต์","กลอย","อาย","แจม"],"2026-04-08":["ส้ม","แจม"],"2026-04-09":["แอม"],"2026-04-10":["อ้อ","โบว์"],"2026-04-11":["คุณวี","ต้นปาล์ม","กานต์","นกหวีด","กลอย","ทราย","เค้ก","กาฟิวส์","แตงกวา","อุ้ม","อัพ","ส้ม","เรย์"],"2026-04-12":["คุณวี","แอล","ยู","ซี","เรย์"],"2026-04-13":["คุณวี","บี","แอล","กานต์","อาย","แจม"],"2026-04-14":["คุณวี","ต้นปาล์ม","บี","แอล","กานต์","ยู","ซี","นกหวีด","กลอย","ทราย","เค้ก","อ้อ","โบว์","กาฟิวส์","แตงกวา","อุ้ม","อัพ","อาย","แจม"],"2026-04-15":["คุณวี","ต้นปาล์ม","บี","แอล","กานต์","ยู","ซี","นกหวีด","กลอย","ทราย","เค้ก","อ้อ","โบว์","กาฟิวส์","แตงกวา","อุ้ม","อัพ","นับนิว","แอม"],"2026-04-16":["คุณวี","ทราย","นับนิว","แอม"],"2026-04-17":["คุณวี","อ้อ","โบว์","กาฟิวส์","ส้ม"],"2026-04-18":["คุณวี","ต้นปาล์ม","กานต์","นกหวีด","กลอย","ทราย","เค้ก","กาฟิวส์","แตงกวา","อุ้ม","อัพ","ส้ม","เรย์"],"2026-04-19":["คุณวี","ยู","ซี","เรย์","นับนิว"],"2026-04-20":["นกหวีด","อุ้ม","นับนิว","แอม"],"2026-04-21":["ต้นปาล์ม","แอล","อาย","แจม","นับนิว"],"2026-04-22":["นับนิว","แอม"],"2026-04-23":["แอล","นับนิว","แอม"],"2026-04-24":["อ้อ","โบว์","ส้ม"],"2026-04-25":["คุณวี","นกหวีด","กลอย","ทราย","เค้ก","กาฟิวส์","แตงกวา","อุ้ม","อัพ","ส้ม","เรย์","แจม"],"2026-04-26":["คุณวี","ต้นปาล์ม","บี","แอล","ยู","ซี","เรย์","แจม"],"2026-04-27":["ทราย","อาย"],"2026-04-28":["กานต์","กลอย","อัพ","อาย","แจม"],"2026-04-29":["กลอย","โบว์","อาย","นับนิว","แอม"],"2026-04-30":["นับนิว","แอม"],"2026-05-01":["คุณวี","ต้นปาล์ม","บี","แอล","กานต์","ยู","ซี","นกหวีด","กลอย","ทราย","เค้ก","อ้อ","โบว์","กาฟิวส์","แตงกวา","อุ้ม","อัพ","บิวตี้"],"2026-05-02":["คุณวี","ต้นปาล์ม","บี","แอล","กานต์","ซี","นกหวีด","กลอย","ทราย","เค้ก","กาฟิวส์","แตงกวา","อุ้ม","อัพ","ส้ม","เรย์","อาย"],"2026-05-03":["คุณวี","ต้นปาล์ม","ยู","ซี","นกหวีด","ส้ม","เรย์"],"2026-05-04":["อาย","แจม"],"2026-05-05":["นับนิว"],"2026-05-07":["เค้ก","อ้อ","นับนิว","แอม"],"2026-05-08":["เค้ก","อ้อ","โบว์","บิวตี้","นับนิว","แอม"],"2026-05-09":["คุณวี","ต้นปาล์ม","แอล","นกหวีด","กลอย","ทราย","เค้ก","โบว์","กาฟิวส์","แตงกวา","อุ้ม","อัพ","ส้ม","เรย์"],"2026-05-10":["คุณวี","บี","ยู","ซี","ทราย","แจม"],"2026-05-11":["กานต์","โบว์","อาย","แจม"],"2026-05-12":["อาย"],"2026-05-13":["คุณวี","ต้นปาล์ม","บี","แอล","กานต์","ยู","ซี","นกหวีด","กลอย","ทราย","กาฟิวส์","แตงกวา","บิวตี้","แอม"],"2026-05-14":["นกหวีด","นับนิว"],"2026-05-15":["อ้อ","โบว์","แตงกวา","บิวตี้"],"2026-05-16":["คุณวี","ต้นปาล์ม","แอล","นกหวีด","กลอย","ทราย","เค้ก","กาฟิวส์","แตงกวา","อุ้ม","อัพ","ส้ม","เรย์"],"2026-05-17":["คุณวี","บี","ยู","ซี","ส้ม","แจม"],"2026-05-18":["กานต์","ส้ม","แจม"],"2026-05-19":["บี","อาย"],"2026-05-20":["ยู","อาย","นับนิว","แอม"],"2026-05-21":["นับนิว","แอม"],"2026-05-22":["อ้อ","โบว์","บิวตี้"],"2026-05-23":["คุณวี","ต้นปาล์ม","บี","แอล","กานต์","นกหวีด","กลอย","ทราย","เค้ก","กาฟิวส์","แตงกวา","อุ้ม","อัพ","ส้ม","เรย์"],"2026-05-24":["คุณวี","แอล","ยู","ซี","อ้อ"],"2026-05-25":["อาย","แจม"],"2026-05-26":["ต้นปาล์ม","อาย"],"2026-05-27":["บี","ส้ม","แอม"],"2026-05-28":["แอม"],"2026-05-29":["เค้ก","อ้อ","โบว์","บิวตี้","อาย"],"2026-05-30":["คุณวี","ต้นปาล์ม","บี","กานต์","นกหวีด","กลอย","ทราย","เค้ก","กาฟิวส์","แตงกวา","อุ้ม","อัพ","เรย์","นับนิว"],"2026-05-31":["คุณวี","แอล","ยู","ซี","นกหวีด","เรย์","นับนิว"]};

var _LEAVE_SEED_STAFF = {"คุณวี":{"e":"68030039","d":"Modern Trade","p":"ผู้จัดการ","t":"ผู้จัดการฝ่ายขาย - การตลาด"},"ต้นปาล์ม":{"e":"66100584","d":"Modern Trade","p":"เจ้าหน้าที่","t":"นักวิเคราะห์ยอดขาย"},"แอล":{"e":"65040204","d":"Modern Trade","p":"เจ้าหน้าที่","t":"เซลล์โมเดิร์นเทรด"},"กานต์":{"e":"67050052","d":"Amazon","p":"เจ้าหน้าที่","t":"เซลล์อเมซอน"},"ยู":{"e":"68110501","d":"Amazon","p":"เจ้าหน้าที่","t":"เซลล์อเมซอน"},"ซี":{"e":"69020177","d":"Amazon","p":"เจ้าหน้าที่","t":"เซลล์อเมซอน"},"นกหวีด":{"e":"67110178","d":"Modern Trade","p":"เจ้าหน้าที่","t":"เจ้าหน้าที่สนับสนุนฝ่ายขาย"},"กลอย":{"e":"67100138","d":"Modern Trade","p":"เจ้าหน้าที่","t":"เจ้าหน้าที่สนับสนุนฝ่ายขาย"},"ทราย":{"e":"69010012","d":"Modern Trade","p":"เจ้าหน้าที่","t":"เจ้าหน้าที่สนับสนุนฝ่ายขาย"},"เค้ก":{"e":"67070076","d":"Ordering Center","p":"หัวหน้างาน","t":"หัวหน้างานธุรการขาย"},"อ้อ":{"e":"62070003","d":"Ordering Center","p":"เจ้าหน้าที่","t":"ธุรการขาย"},"โบว์":{"e":"68120509","d":"Ordering Center","p":"เจ้าหน้าที่","t":"ธุรการขาย"},"กาฟิวส์":{"e":"67120200","d":"Ordering Center","p":"เจ้าหน้าที่","t":"ธุรการขาย"},"แตงกวา":{"e":"68080282","d":"Ordering Center","p":"เจ้าหน้าที่","t":"ธุรการขาย"},"อุ้ม":{"e":"68020017","d":"Booth","p":"พนักงาน","t":"พนักงานขายบูธสินค้า"},"อัพ":{"e":"67120209","d":"Ordering Center","p":"เจ้าหน้าที่","t":"ธุรการขาย"},"ส้ม":{"e":"66070413","d":"Online","p":"เจ้าหน้าที่","t":"ธุรการออนไลน์"},"เรย์":{"e":"67090114","d":"Online","p":"เจ้าหน้าที่","t":"ไลฟ์สดออนไลน์"},"อาย":{"e":"66070443","d":"Online","p":"เจ้าหน้าที่","t":"ไลฟ์สดออนไลน์"},"แจม":{"e":"6810492","d":"Online","p":"เจ้าหน้าที่","t":"ไลฟ์สดออนไลน์"},"นับนิว":{"e":"68020024","d":"Online","p":"เจ้าหน้าที่","t":"ธุรการออนไลน์"},"แอม":{"e":"64110282","d":"Online","p":"เจ้าหน้าที่","t":"ไลฟ์สดออนไลน์"},"บี":{"e":"","d":"Modern Trade","p":"เจ้าหน้าที่","t":"เซลล์โมเดิร์นเทรด"},"บิวตี้":{"e":"69050031","d":"Ordering Center","p":"เจ้าหน้าที่","t":"ธุรการขาย"}};

function _initLeaveSeedData() {
  if (localStorage.getItem('smLeaveDataSeeded') === 'v1') return;
  var existing = _getLeaveData();
  var existingIds = {};
  existing.forEach(function(r) { existingIds[r.id] = true; });

  var counter = 100;
  var dates = Object.keys(_LEAVE_SEED_DATES);
  for (var i = 0; i < dates.length; i++) {
    var dateStr = dates[i];
    var nicks = _LEAVE_SEED_DATES[dateStr];
    for (var j = 0; j < nicks.length; j++) {
      var nick = nicks[j];
      var info = _LEAVE_SEED_STAFF[nick] || { e:'', d:'', p:'', t:'' };
      counter++;
      var id = 'LV-' + dateStr.replace(/-/g, '') + '-' + counter;
      if (existingIds[id]) continue;
      existing.push({
        id: id,
        recordDate: dateStr,
        dateFrom: dateStr,
        dateTo: dateStr,
        timeFrom: '',
        timeTo: '',
        days: '1',
        staffNick: nick,
        empId: info.e,
        position: info.p,
        positionTitle: info.t,
        dept: info.d,
        division: 'ขาย – การตลาด',
        type: 'other',
        swapReason: '',
        reason: 'วันหยุด',
        note: 'นำเข้าจาก Sales holiday record',
        hasMedCert: false,
        hasPhoto: false,
        createdAt: '2026-07-21T00:00:00.000Z',
        source: 'excel-import'
      });
    }
  }
  _saveLeaveData(existing);
  localStorage.setItem('smLeaveDataSeeded', 'v1');
}

*/

// ---- Leave Dashboard ----
var _lvDashFilter = { year: '', month: '', dateFrom: '', dateTo: '' };

function _lvDashPassFilter(dateStr) {
  if (!dateStr) return true;
  var f = _lvDashFilter;
  if (f.dateFrom && dateStr < f.dateFrom) return false;
  if (f.dateTo && dateStr > f.dateTo) return false;
  if (f.year && dateStr.substring(0, 4) !== f.year) return false;
  if (f.month && dateStr.substring(5, 7) !== f.month) return false;
  return true;
}

function _lvDashCollectYears() {
  var years = {};
  var data = _getLeaveData();
  for (var i = 0; i < data.length; i++) {
    var d = data[i].dateFrom || '';
    if (d.length >= 4) years[d.substring(0, 4)] = true;
  }
  var sorted = Object.keys(years).sort();
  if (sorted.length === 0) sorted = [String(new Date().getFullYear())];
  return sorted;
}

function _lvDashBuildFilterBar() {
  var f = _lvDashFilter;
  var years = _lvDashCollectYears();
  var h = '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:16px;padding:14px 16px;background:#fff;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,.08)">';

  h += '<div style="display:flex;flex-direction:column;gap:4px"><label style="font-size:11px;font-weight:600;color:#64748b">ปี</label>' +
    '<select id="lvDashF-year" onchange="_lvDashOnFilter()" style="padding:6px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;min-width:90px">' +
    '<option value="">ทุกปี</option>';
  for (var i = 0; i < years.length; i++) {
    var sel = f.year === years[i] ? ' selected' : '';
    h += '<option value="' + years[i] + '"' + sel + '>' + (parseInt(years[i]) + 543) + '</option>';
  }
  h += '</select></div>';

  h += '<div style="display:flex;flex-direction:column;gap:4px"><label style="font-size:11px;font-weight:600;color:#64748b">เดือน</label>' +
    '<select id="lvDashF-month" onchange="_lvDashOnFilter()" style="padding:6px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;min-width:110px">' +
    '<option value="">ทุกเดือน</option>';
  var mLabels = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  for (var m = 1; m <= 12; m++) {
    var mv = m < 10 ? '0' + m : '' + m;
    var sel = f.month === mv ? ' selected' : '';
    h += '<option value="' + mv + '"' + sel + '>' + mLabels[m - 1] + '</option>';
  }
  h += '</select></div>';

  h += '<div style="display:flex;flex-direction:column;gap:4px"><label style="font-size:11px;font-weight:600;color:#64748b">ตั้งแต่วันที่</label>' +
    '<input type="date" id="lvDashF-dateFrom" value="' + (f.dateFrom || '') + '" onchange="_lvDashOnFilter()" style="padding:6px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px"></div>';

  h += '<div style="display:flex;flex-direction:column;gap:4px"><label style="font-size:11px;font-weight:600;color:#64748b">ถึงวันที่</label>' +
    '<input type="date" id="lvDashF-dateTo" value="' + (f.dateTo || '') + '" onchange="_lvDashOnFilter()" style="padding:6px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px"></div>';

  h += '<button onclick="_lvDashResetFilter()" style="padding:6px 14px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;cursor:pointer;color:#64748b;align-self:end">ล้างตัวกรอง</button>';
  h += '</div>';
  return h;
}

function _lvDashOnFilter() {
  _lvDashFilter.year = (document.getElementById('lvDashF-year') || {}).value || '';
  _lvDashFilter.month = (document.getElementById('lvDashF-month') || {}).value || '';
  _lvDashFilter.dateFrom = (document.getElementById('lvDashF-dateFrom') || {}).value || '';
  _lvDashFilter.dateTo = (document.getElementById('lvDashF-dateTo') || {}).value || '';
  renderLeaveDashboard();
}

function _lvDashResetFilter() {
  _lvDashFilter = { year: '', month: '', dateFrom: '', dateTo: '' };
  renderLeaveDashboard();
}

function renderLeaveDashboard() {
  var el = document.getElementById('sm-leave-dashboard');
  if (!el) return;
  var allData = _getLeaveData();
  var data = allData.filter(function(r) { return _lvDashPassFilter(r.dateFrom || ''); });
  var today = new Date();
  var todayStr = today.toISOString().slice(0, 10);
  var monthStr = todayStr.slice(0, 7);
  var yearStr = _lvDashFilter.year || todayStr.slice(0, 4);

  var todayCount = 0, monthCount = 0, filteredCount = 0;
  var byStaff = {}, byType = {}, byDept = {}, monthlyData = {};

  SM_LEAVE_STAFF.forEach(function(s) {
    byStaff[s.nick] = { sick:0, personal:0, annual:0, other:0, total:0, empId: s.empId, position: s.level, dept: s.dept };
  });

  SM_LEAVE_TYPES.forEach(function(t) { byType[t.id] = 0; });
  SM_DEPARTMENTS.forEach(function(d) { byDept[d] = 0; });
  for (var mi = 1; mi <= 12; mi++) {
    var mk = mi < 10 ? '0' + mi : '' + mi;
    monthlyData[mk] = 0;
  }

  data.forEach(function(r) {
    var days = parseFloat(r.days) || 1;
    var from = r.dateFrom || '';
    var mo = from.slice(5, 7);

    filteredCount += days;
    if (from === todayStr || (from <= todayStr && (r.dateTo || from) >= todayStr)) todayCount += days;
    if (from.slice(0, 7) === monthStr) monthCount += days;

    if (byStaff[r.staffNick]) {
      byStaff[r.staffNick].total += days;
      if (r.type === 'sick') byStaff[r.staffNick].sick += days;
      else if (r.type === 'personal') byStaff[r.staffNick].personal += days;
      else if (r.type === 'annual') byStaff[r.staffNick].annual += days;
      else byStaff[r.staffNick].other += days;
    }
    if (byType[r.type] !== undefined) byType[r.type] += days;
    if (r.dept && byDept[r.dept] !== undefined) byDept[r.dept] += days;
    if (mo && monthlyData[mo] !== undefined) monthlyData[mo] += days;
  });

  var h = '<div style="padding:8px">';

  // Filter bar
  h += _lvDashBuildFilterBar();

  // Active filter label
  var _fParts = [];
  if (_lvDashFilter.year) _fParts.push('ปี ' + (parseInt(_lvDashFilter.year) + 543));
  if (_lvDashFilter.month) { var _ml = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']; _fParts.push(_ml[parseInt(_lvDashFilter.month) - 1]); }
  if (_lvDashFilter.dateFrom) _fParts.push('ตั้งแต่ ' + _lvDashFilter.dateFrom);
  if (_lvDashFilter.dateTo) _fParts.push('ถึง ' + _lvDashFilter.dateTo);
  if (_fParts.length > 0) {
    h += '<div style="margin-bottom:12px;padding:8px 14px;background:#fef3c7;border-radius:8px;font-size:13px;color:#92400e">🔍 กรองข้อมูล: <strong>' + _fParts.join(' · ') + '</strong> (' + data.length + ' รายการ, ' + filteredCount + ' วัน)</div>';
  }

  // KPI Cards
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:20px">';
  h += _leaveKpiCard('📅', 'วันนี้', todayCount + ' คนลา', '#f97316');
  h += _leaveKpiCard('📆', 'เดือนนี้', monthCount + ' วัน', '#2563eb');
  h += _leaveKpiCard('📊', 'รวมทั้งหมด', filteredCount + ' วัน', '#059669');
  h += _leaveKpiCard('👥', 'พนักงาน', SM_LEAVE_STAFF.length + ' คน', '#7c3aed');
  h += '</div>';

  // Staff leave summary table
  h += '<div class="card" style="margin-bottom:16px;padding:20px"><h3 style="margin:0 0 12px;font-size:15px;color:#1e293b">📋 สรุปการลางานรายบุคคล (ปี ' + yearStr + ')</h3>';
  h += '<div class="table-wrap"><table style="width:100%;font-size:12px;border-collapse:collapse"><thead><tr style="background:#1e293b;color:#fff">' +
    '<th style="padding:6px 8px;text-align:left">รหัส</th>' +
    '<th style="padding:6px 8px;text-align:left">ชื่อเล่น</th>' +
    '<th style="padding:6px 8px;text-align:left">ตำแหน่ง</th>' +
    '<th style="padding:6px 8px;text-align:left">แผนก</th>' +
    '<th style="padding:6px 8px;text-align:center">ป่วย</th>' +
    '<th style="padding:6px 8px;text-align:center">กิจ</th>' +
    '<th style="padding:6px 8px;text-align:center">พักร้อน</th>' +
    '<th style="padding:6px 8px;text-align:center">อื่นๆ</th>' +
    '<th style="padding:6px 8px;text-align:center;background:#f97316">รวม</th>' +
    '</tr></thead><tbody>';
  Object.keys(byStaff).forEach(function(nick) {
    var s = byStaff[nick];
    var sickWarn = s.sick > 20 ? 'color:#ef4444;font-weight:700' : '';
    h += '<tr style="border-bottom:1px solid #f1f5f9">' +
      '<td style="padding:6px 8px;color:#64748b;font-size:11px">' + (s.empId || '') + '</td>' +
      '<td style="padding:6px 8px;font-weight:600">' + nick + '</td>' +
      '<td style="padding:6px 8px;color:#64748b;font-size:11px">' + (s.position || '') + '</td>' +
      '<td style="padding:6px 8px;color:#64748b;font-size:11px">' + (s.dept || '') + '</td>' +
      '<td style="padding:6px 8px;text-align:center;' + sickWarn + '">' + s.sick + ' <span style="color:#94a3b8;font-size:10px">/ 30</span></td>' +
      '<td style="padding:6px 8px;text-align:center">' + s.personal + ' <span style="color:#94a3b8;font-size:10px">/ 3</span></td>' +
      '<td style="padding:6px 8px;text-align:center">' + s.annual + ' <span style="color:#94a3b8;font-size:10px">/ 6</span></td>' +
      '<td style="padding:6px 8px;text-align:center">' + s.other + '</td>' +
      '<td style="padding:6px 8px;text-align:center;font-weight:700;color:#f97316">' + s.total + '</td></tr>';
  });
  h += '</tbody></table></div></div>';

  // Leave type breakdown + Monthly chart
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">';

  // By type
  h += '<div class="card" style="padding:20px"><h3 style="margin:0 0 12px;font-size:15px;color:#1e293b">📊 สรุปตามประเภทการลา</h3>';
  h += '<div style="display:flex;flex-direction:column;gap:6px">';
  var typeColors = { sick:'#ef4444', personal:'#f59e0b', annual:'#3b82f6', maternity:'#ec4899', sterilization:'#8b5cf6', ordination:'#f97316', hajj:'#06b6d4', military:'#64748b', training:'#10b981', lwop:'#94a3b8', other:'#cbd5e1', swap:'#6366f1' };
  SM_LEAVE_TYPES.forEach(function(t) {
    var cnt = byType[t.id] || 0;
    if (cnt === 0 && t.id !== 'sick' && t.id !== 'personal' && t.id !== 'annual') return;
    var maxW = filteredCount > 0 ? Math.max(5, cnt / filteredCount * 100) : 5;
    h += '<div style="display:flex;align-items:center;gap:8px">' +
      '<div style="width:120px;font-size:12px;color:#475569;text-align:right;flex-shrink:0">' + t.label.split('(')[0].trim() + '</div>' +
      '<div style="flex:1;background:#f1f5f9;border-radius:4px;height:20px;position:relative">' +
      '<div style="width:' + maxW + '%;background:' + (typeColors[t.id]||'#94a3b8') + ';height:100%;border-radius:4px;min-width:2px"></div></div>' +
      '<div style="width:30px;font-size:12px;font-weight:700;color:#1e293b">' + cnt + '</div></div>';
  });
  h += '</div></div>';

  // By department
  h += '<div class="card" style="padding:20px"><h3 style="margin:0 0 12px;font-size:15px;color:#1e293b">🏢 สรุปตามแผนก</h3>';
  h += '<div style="display:flex;flex-direction:column;gap:8px">';
  var deptColors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];
  SM_DEPARTMENTS.forEach(function(d, di) {
    var cnt = byDept[d] || 0;
    var maxW = filteredCount > 0 ? Math.max(5, cnt / filteredCount * 100) : 5;
    h += '<div style="display:flex;align-items:center;gap:8px">' +
      '<div style="width:110px;font-size:12px;color:#475569;text-align:right;flex-shrink:0">' + d + '</div>' +
      '<div style="flex:1;background:#f1f5f9;border-radius:4px;height:24px;position:relative">' +
      '<div style="width:' + maxW + '%;background:' + deptColors[di] + ';height:100%;border-radius:4px;min-width:2px"></div></div>' +
      '<div style="width:40px;font-size:13px;font-weight:700;color:#1e293b">' + cnt + ' วัน</div></div>';
  });
  h += '</div></div>';
  h += '</div>';

  // Monthly bar chart (canvas)
  h += '<div class="card" style="padding:20px;margin-bottom:16px"><h3 style="margin:0 0 12px;font-size:15px;color:#1e293b">📈 จำนวนวันลารายเดือน (ปี ' + yearStr + ')</h3>';
  h += '<canvas id="leaveMonthlyChart" height="120"></canvas></div>';

  // Recent leave records
  h += '<div class="card" style="padding:20px"><h3 style="margin:0 0 12px;font-size:15px;color:#1e293b">📋 รายการลาล่าสุด (10 รายการ)</h3>';
  var recent = data.slice().sort(function(a, b) { return (b.dateFrom || '').localeCompare(a.dateFrom || ''); }).slice(0, 10);
  if (recent.length === 0) {
    h += '<div style="text-align:center;padding:30px;color:#94a3b8;font-size:14px">ยังไม่มีข้อมูลการลา</div>';
  } else {
    h += '<div class="table-wrap"><table style="width:100%;font-size:12px;border-collapse:collapse"><thead><tr style="background:#f8fafc">' +
      '<th style="padding:8px;text-align:left">วันที่</th><th style="padding:8px;text-align:left">พนักงาน</th>' +
      '<th style="padding:8px;text-align:left">รหัส</th><th style="padding:8px;text-align:left">ตำแหน่ง</th>' +
      '<th style="padding:8px;text-align:left">แผนก</th><th style="padding:8px;text-align:left">ประเภท</th>' +
      '<th style="padding:8px;text-align:center">จำนวนวัน</th><th style="padding:8px;text-align:left">เหตุผล</th>' +
      '<th style="padding:8px;text-align:center">ลบ</th></tr></thead><tbody>';
    recent.forEach(function(r) {
      var typeLabel = '';
      SM_LEAVE_TYPES.forEach(function(t) { if (t.id === r.type) typeLabel = t.label.split('(')[0].trim(); });
      h += '<tr style="border-bottom:1px solid #f1f5f9">' +
        '<td style="padding:6px 8px">' + (r.dateFrom || '') + (r.dateTo && r.dateTo !== r.dateFrom ? ' ~ ' + r.dateTo : '') + '</td>' +
        '<td style="padding:6px 8px;font-weight:600">' + (r.staffNick || '') + '</td>' +
        '<td style="padding:6px 8px;color:#64748b;font-size:11px">' + (r.empId || '-') + '</td>' +
        '<td style="padding:6px 8px;color:#64748b;font-size:11px">' + (r.position || '-') + '</td>' +
        '<td style="padding:6px 8px">' + (r.dept || '') + '</td>' +
        '<td style="padding:6px 8px">' + typeLabel + '</td>' +
        '<td style="padding:6px 8px;text-align:center;font-weight:700">' + (r.days || '') + '</td>' +
        '<td style="padding:6px 8px;color:#64748b">' + (r.reason || '') + '</td>' +
        '<td style="padding:6px 8px;text-align:center"><button onclick="smDeleteLeave(\'' + r.id + '\')" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:14px" title="ลบ">🗑️</button></td></tr>';
    });
    h += '</tbody></table></div>';
  }
  h += '</div></div>';

  el.innerHTML = h;

  // Render monthly chart
  _renderLeaveMonthlyChart(monthlyData);
}

function _leaveKpiCard(icon, label, value, color) {
  return '<div class="card" style="padding:16px;border-left:4px solid ' + color + '">' +
    '<div style="font-size:12px;color:#64748b;margin-bottom:4px">' + icon + ' ' + label + '</div>' +
    '<div style="font-size:22px;font-weight:800;color:' + color + '">' + value + '</div></div>';
}

var _leaveChart = null;
function _renderLeaveMonthlyChart(monthlyData) {
  var canvas = document.getElementById('leaveMonthlyChart');
  if (!canvas || typeof Chart === 'undefined') return;
  if (_leaveChart) { _leaveChart.destroy(); _leaveChart = null; }
  var labels = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  var values = [];
  for (var mi = 1; mi <= 12; mi++) {
    var mk = mi < 10 ? '0' + mi : '' + mi;
    values.push(monthlyData[mk] || 0);
  }
  _leaveChart = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: { labels: labels, datasets: [{ label: 'วันลา', data: values, backgroundColor: '#f97316', borderRadius: 6 }] },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
  });
}

function smDeleteLeave(id) {
  if (!confirm('ยืนยันลบรายการลานี้?')) return;
  var data = _getLeaveData().filter(function(r) { return r.id !== id; });
  _saveLeaveData(data);
  renderLeaveDashboard();
}

// ---- Leave Form ----
function renderLeaveForm() {
  var el = document.getElementById('sm-leave-form');
  if (!el) return;
  var today = new Date().toISOString().slice(0, 10);

  var h = '<div class="card" style="margin-top:8px;padding:24px">';
  h += '<h2 style="margin:0 0 4px;font-size:1.3rem;color:#1e293b">📝 แบบฟอร์มลงวันหยุดบุคลากร</h2>';
  h += '<p style="margin:0 0 20px;font-size:13px;color:#94a3b8">กรอกข้อมูลการลาแล้วกด "บันทึก"</p>';

  // Section: หน่วยการลา (วัน / ชั่วโมง)
  h += '<div style="margin-bottom:16px">';
  h += '<label style="font-weight:600;font-size:13px;color:#475569;display:block;margin-bottom:6px">หน่วยการลา</label>';
  h += '<div style="display:flex;gap:8px">';
  h += '<button type="button" id="lvUnitDay" class="qf-btn-submit" onclick="lvSetUnit(\'day\')" style="min-width:100px;padding:8px 16px;font-size:14px">📅 เป็นวัน</button>';
  h += '<button type="button" id="lvUnitHour" onclick="lvSetUnit(\'hour\')" style="min-width:100px;padding:8px 16px;font-size:14px;background:#e2e8f0;color:#475569;border:1px solid #cbd5e1;border-radius:8px;cursor:pointer">🕐 เป็นชั่วโมง</button>';
  h += '</div></div>';

  // Section: วันที่
  h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">';
  h += _lfField('วันที่ลงบันทึก', '<input type="date" id="lvRecDate" value="' + today + '" class="qf-input">');
  h += _lfField('วันที่เริ่มลา', '<input type="date" id="lvDateFrom" value="' + today + '" class="qf-input" onchange="lvDateFromChanged()">');
  h += _lfField('วันที่สิ้นสุด', '<input type="date" id="lvDateTo" value="' + today + '" class="qf-input" onchange="lvCalcDays()">');
  h += '</div>';

  // Section: เวลา + จำนวน
  h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">';
  h += _lfField('เวลาเริ่มต้น', '<input type="time" id="lvTimeFrom" value="08:00" class="qf-input" onchange="lvCalcHours()">');
  h += _lfField('เวลาสิ้นสุด', '<input type="time" id="lvTimeTo" value="17:00" class="qf-input" onchange="lvCalcHours()">');
  h += _lfField('<span id="lvDaysLabel">จำนวนวันที่ลา</span>', '<input type="number" id="lvDays" value="1" min="0.5" step="0.5" class="qf-input" style="font-weight:700;font-size:16px;color:#f97316">');
  h += '</div>';

  // Section: พนักงาน (auto-fill รหัส + ตำแหน่ง + แผนก)
  h += '<div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px;margin-bottom:16px">';
  var staffOpts = '<option value="">-- เลือกพนักงาน --</option>';
  SM_STAFF_DB.forEach(function(s) {
    staffOpts += '<option value="' + s.nick + '">' + s.nick + ' — ' + s.name + '</option>';
  });
  h += _lfField('ชื่อพนักงาน', '<select id="lvStaff" class="qf-input" onchange="lvStaffChanged()">' + staffOpts + '</select>');
  h += _lfField('รหัสพนักงาน', '<input type="text" id="lvEmpId" class="qf-input" readonly style="background:#f0fdf4;font-weight:600">');
  h += _lfField('ตำแหน่ง (ระดับ)', '<input type="text" id="lvPosition" class="qf-input" readonly style="background:#f0fdf4;font-weight:600">');
  h += '</div>';

  // Section: ตำแหน่งงาน + ฝ่าย + แผนก (auto-filled)
  h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">';
  h += _lfField('ตำแหน่งงาน', '<input type="text" id="lvPositionTitle" class="qf-input" readonly style="background:#f0fdf4">');
  h += _lfField('ฝ่าย', '<input type="text" value="ขาย – การตลาด" class="qf-input" disabled style="background:#f8fafc">');
  h += _lfField('แผนก', '<input type="text" id="lvDept" class="qf-input" readonly style="background:#f0fdf4;font-weight:600">');
  h += '</div>';

  // Section: ประเภทการลา
  h += '<div style="margin-bottom:16px">';
  h += '<label style="font-weight:600;font-size:13px;color:#475569;display:block;margin-bottom:6px">ประเภทการลา</label>';
  h += '<select id="lvType" class="qf-input" onchange="lvTypeChanged()" style="width:100%">';
  h += '<option value="">-- เลือกประเภทการลา --</option>';
  SM_LEAVE_TYPES.forEach(function(t) { h += '<option value="' + t.id + '">' + t.label + '</option>'; });
  h += '</select>';
  h += '<div id="lvRulesBox" style="display:none;margin-top:8px;padding:12px;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;font-size:12px;color:#92400e"></div>';
  h += '</div>';

  // Section: สลับวันหยุด (hidden by default)
  h += '<div id="lvSwapSection" style="display:none;margin-bottom:16px">';
  h += '<label style="font-weight:600;font-size:13px;color:#475569;display:block;margin-bottom:6px">สาเหตุการสลับวันหยุด</label>';
  var swapOpts = '<option value="">-- เลือกสาเหตุ --</option>';
  SM_SWAP_REASONS.forEach(function(r) { swapOpts += '<option value="' + r + '">' + r + '</option>'; });
  h += '<select id="lvSwapReason" class="qf-input" style="width:100%">' + swapOpts + '</select></div>';

  // Section: เหตุผล + หมายเหตุ
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">';
  h += _lfField('เหตุผลการลา', '<input type="text" id="lvReason" class="qf-input" placeholder="ระบุเหตุผล">');
  h += _lfField('หมายเหตุ', '<input type="text" id="lvNote" class="qf-input" placeholder="หมายเหตุเพิ่มเติม">');
  h += '</div>';

  // Section: แนบไฟล์
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">';
  h += _lfField('แนบใบรับรองแพทย์', '<input type="file" id="lvMedCert" class="qf-input" accept="image/*,.pdf">');
  h += _lfField('แนบรูปการณ์ลา', '<input type="file" id="lvPhoto" class="qf-input" accept="image/*,.pdf">');
  h += '</div>';

  // Buttons
  h += '<div style="display:flex;gap:12px;justify-content:center">';
  h += '<button class="qf-btn-submit" onclick="lvSubmit()" style="min-width:160px">📝 บันทึกข้อมูล</button>';
  h += '<button class="qf-btn-submit" onclick="lvClearForm()" style="min-width:120px;background:linear-gradient(135deg,#64748b,#94a3b8)">🔄 ล้างฟอร์ม</button>';
  h += '</div>';

  h += '</div>';

  el.innerHTML = h;
}

function _lfField(label, inputHtml) {
  return '<div><label style="font-weight:600;font-size:13px;color:#475569;display:block;margin-bottom:4px">' + label + '</label>' + inputHtml + '</div>';
}

function lvStaffChanged() {
  var sel = document.getElementById('lvStaff');
  var empIdEl = document.getElementById('lvEmpId');
  var posEl = document.getElementById('lvPosition');
  var posTitleEl = document.getElementById('lvPositionTitle');
  var deptEl = document.getElementById('lvDept');
  if (!sel) return;
  var nick = sel.value;
  var staff = null;
  SM_STAFF_DB.forEach(function(s) { if (s.nick === nick) staff = s; });
  if (staff) {
    if (empIdEl) empIdEl.value = staff.empId;
    if (posEl) posEl.value = staff.level;
    if (posTitleEl) posTitleEl.value = staff.positionTh;
    if (deptEl) deptEl.value = staff.dept;
  } else {
    if (empIdEl) empIdEl.value = '';
    if (posEl) posEl.value = '';
    if (posTitleEl) posTitleEl.value = '';
    if (deptEl) deptEl.value = '';
  }
}

var _lvUnit = 'day';

function lvSetUnit(unit) {
  _lvUnit = unit;
  var btnDay = document.getElementById('lvUnitDay');
  var btnHour = document.getElementById('lvUnitHour');
  var label = document.getElementById('lvDaysLabel');
  var daysEl = document.getElementById('lvDays');
  var toEl = document.getElementById('lvDateTo');
  if (unit === 'hour') {
    if (btnDay) { btnDay.style.background = '#e2e8f0'; btnDay.style.color = '#475569'; btnDay.className = ''; btnDay.style.border = '1px solid #cbd5e1'; btnDay.style.borderRadius = '8px'; btnDay.style.cursor = 'pointer'; btnDay.style.minWidth = '100px'; btnDay.style.padding = '8px 16px'; btnDay.style.fontSize = '14px'; }
    if (btnHour) { btnHour.className = 'qf-btn-submit'; btnHour.style.cssText = 'min-width:100px;padding:8px 16px;font-size:14px'; }
    if (label) label.textContent = 'จำนวนชั่วโมงที่ลา';
    if (daysEl) { daysEl.min = '0.5'; daysEl.step = '0.5'; }
    if (toEl) { toEl.value = document.getElementById('lvDateFrom').value; toEl.setAttribute('readonly', ''); toEl.style.background = '#f1f5f9'; }
    lvCalcHours();
  } else {
    if (btnHour) { btnHour.className = ''; btnHour.style.cssText = 'min-width:100px;padding:8px 16px;font-size:14px;background:#e2e8f0;color:#475569;border:1px solid #cbd5e1;border-radius:8px;cursor:pointer'; }
    if (btnDay) { btnDay.className = 'qf-btn-submit'; btnDay.style.cssText = 'min-width:100px;padding:8px 16px;font-size:14px'; }
    if (label) label.textContent = 'จำนวนวันที่ลา';
    if (daysEl) { daysEl.min = '0.5'; daysEl.step = '0.5'; }
    if (toEl) { toEl.removeAttribute('readonly'); toEl.style.background = ''; }
    lvCalcDays();
  }
}

function lvDateFromChanged() {
  var from = document.getElementById('lvDateFrom');
  var to = document.getElementById('lvDateTo');
  if (from && to) to.value = from.value;
  if (_lvUnit === 'hour') {
    lvCalcHours();
  } else {
    lvCalcDays();
  }
}

function lvCalcHours() {
  if (_lvUnit !== 'hour') return;
  var timeFrom = document.getElementById('lvTimeFrom');
  var timeTo = document.getElementById('lvTimeTo');
  var daysEl = document.getElementById('lvDays');
  if (!timeFrom || !timeTo || !daysEl || !timeFrom.value || !timeTo.value) return;
  var parts1 = timeFrom.value.split(':');
  var parts2 = timeTo.value.split(':');
  var mins1 = parseInt(parts1[0]) * 60 + parseInt(parts1[1]);
  var mins2 = parseInt(parts2[0]) * 60 + parseInt(parts2[1]);
  var diffHours = (mins2 - mins1) / 60;
  if (diffHours < 0) diffHours = 0;
  daysEl.value = Math.round(diffHours * 10) / 10;
}

function lvCalcDays() {
  var from = document.getElementById('lvDateFrom');
  var to = document.getElementById('lvDateTo');
  var days = document.getElementById('lvDays');
  if (!from || !to || !days || !from.value || !to.value) return;
  var d1 = new Date(from.value), d2 = new Date(to.value);
  if (d2 < d1) { to.value = from.value; d2 = d1; }
  var diff = Math.round((d2 - d1) / 86400000) + 1;
  if (diff < 1) diff = 1;
  days.value = diff;
}

function lvTypeChanged() {
  var sel = document.getElementById('lvType');
  var rulesBox = document.getElementById('lvRulesBox');
  var swapSec = document.getElementById('lvSwapSection');
  if (!sel) return;
  var typeId = sel.value;

  if (swapSec) swapSec.style.display = typeId === 'swap' ? '' : 'none';

  if (rulesBox) {
    var type = null;
    SM_LEAVE_TYPES.forEach(function(t) { if (t.id === typeId) type = t; });
    if (type && type.rules) {
      rulesBox.style.display = '';
      var maxText = type.maxDays ? ' (สิทธิสูงสุด: ' + type.maxDays + ' วัน/ปี)' : '';
      var paidText = type.paid ? '✅ ได้รับค่าจ้าง' : '❌ ไม่ได้รับค่าจ้าง';
      rulesBox.innerHTML = '<div style="font-weight:700;margin-bottom:4px">📌 กฎเกณฑ์' + maxText + ' — ' + paidText + '</div>' +
        '<div>' + type.rules.split('·').map(function(r) { return r.trim(); }).filter(Boolean).map(function(r) { return '• ' + r; }).join('<br>') + '</div>';
    } else {
      rulesBox.style.display = 'none';
    }
  }
}

function lvSubmit() {
  var staff = document.getElementById('lvStaff');
  var dept = document.getElementById('lvDept');
  var type = document.getElementById('lvType');
  var dateFrom = document.getElementById('lvDateFrom');
  var dateTo = document.getElementById('lvDateTo');
  var days = document.getElementById('lvDays');
  var reason = document.getElementById('lvReason');

  var empId = document.getElementById('lvEmpId');
  var position = document.getElementById('lvPosition');

  var posTitle = document.getElementById('lvPositionTitle');

  if (!staff || !staff.value) { alert('กรุณาเลือกพนักงาน'); return; }
  if (!empId || !empId.value) { alert('กรุณาเลือกพนักงานเพื่อดึงรหัสพนักงาน'); return; }
  if (!dept || !dept.value) { alert('กรุณาเลือกพนักงานเพื่อดึงแผนก'); return; }
  if (!type || !type.value) { alert('กรุณาเลือกประเภทการลา'); return; }
  if (!dateFrom || !dateFrom.value) { alert('กรุณาระบุวันที่เริ่มลา'); return; }

  var swapReason = '';
  if (type.value === 'swap') {
    var sr = document.getElementById('lvSwapReason');
    swapReason = sr ? sr.value : '';
  }

  var typeObj = null;
  SM_LEAVE_TYPES.forEach(function(t) { if (t.id === type.value) typeObj = t; });

  // Check quota
  if (typeObj && typeObj.maxDays) {
    var data = _getLeaveData();
    var year = dateFrom.value.slice(0, 4);
    var usedDays = 0;
    data.forEach(function(r) {
      if (r.staffNick === staff.value && r.type === type.value && (r.dateFrom || '').slice(0, 4) === year) {
        usedDays += parseFloat(r.days) || 0;
      }
    });
    var newDays = parseFloat(days.value) || 0;
    if (usedDays + newDays > typeObj.maxDays) {
      alert('⚠️ เกินสิทธิการลา!\n\n' + typeObj.label + '\nสิทธิสูงสุด: ' + typeObj.maxDays + ' วัน/ปี\nใช้ไปแล้ว: ' + usedDays + ' วัน\nคงเหลือ: ' + (typeObj.maxDays - usedDays) + ' วัน\nจำนวนที่ขอลา: ' + newDays + ' วัน');
      return;
    }
  }

  // Check sick leave 3+ days needs medical cert
  if (type.value === 'sick' && parseFloat(days.value) >= 3) {
    var medCert = document.getElementById('lvMedCert');
    if (!medCert || !medCert.files || medCert.files.length === 0) {
      if (!confirm('⚠️ ลาป่วย 3 วันขึ้นไป ต้องแนบใบรับรองแพทย์\n\nต้องการบันทึกโดยไม่แนบใบรับรองแพทย์หรือไม่?')) return;
    }
  }

  var recDate = document.getElementById('lvRecDate');
  var timeFrom = document.getElementById('lvTimeFrom');
  var timeTo = document.getElementById('lvTimeTo');
  var note = document.getElementById('lvNote');

  var leaveUnit = _lvUnit || 'day';
  var record = {
    id: 'LV-' + dateFrom.value.replace(/-/g, '') + '-' + String(Math.floor(Math.random() * 900) + 100),
    recordDate: recDate ? recDate.value : '',
    dateFrom: dateFrom.value,
    dateTo: dateTo ? dateTo.value : dateFrom.value,
    timeFrom: timeFrom ? timeFrom.value : '',
    timeTo: timeTo ? timeTo.value : '',
    days: days ? days.value : '1',
    unit: leaveUnit,
    staffNick: staff.value,
    empId: empId ? empId.value : '',
    position: position ? position.value : '',
    positionTitle: posTitle ? posTitle.value : '',
    dept: dept.value,
    division: 'ขาย – การตลาด',
    type: type.value,
    swapReason: swapReason,
    reason: reason ? reason.value : '',
    note: note ? note.value : '',
    hasMedCert: (document.getElementById('lvMedCert') && document.getElementById('lvMedCert').files.length > 0),
    hasPhoto: (document.getElementById('lvPhoto') && document.getElementById('lvPhoto').files.length > 0),
    createdAt: new Date().toISOString()
  };

  var data = _getLeaveData();
  data.push(record);
  _saveLeaveData(data);

  var typeLabel = '';
  SM_LEAVE_TYPES.forEach(function(t) { if (t.id === type.value) typeLabel = t.label; });
  var unitText = leaveUnit === 'hour' ? ' ชั่วโมง' : ' วัน';
  var timeText = leaveUnit === 'hour' ? '\nเวลา: ' + record.timeFrom + ' - ' + record.timeTo : '';
  alert('✅ บันทึกการลาสำเร็จ!\n\nID: ' + record.id + '\nพนักงาน: ' + staff.value + '\nประเภท: ' + typeLabel + '\nวันที่: ' + record.dateFrom + (record.dateTo !== record.dateFrom ? ' ~ ' + record.dateTo : '') + timeText + '\nจำนวน: ' + record.days + unitText);

  lvClearForm();
}

function lvClearForm() {
  var today = new Date().toISOString().slice(0, 10);
  var fields = { lvRecDate: today, lvDateFrom: today, lvDateTo: today, lvTimeFrom: '08:30', lvTimeTo: '17:30', lvDays: '1', lvStaff: '', lvEmpId: '', lvPosition: '', lvPositionTitle: '', lvDept: '', lvType: '', lvReason: '', lvNote: '' };
  Object.keys(fields).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = fields[id];
  });
  lvSetUnit('day');
  var rulesBox = document.getElementById('lvRulesBox');
  if (rulesBox) rulesBox.style.display = 'none';
  var swapSec = document.getElementById('lvSwapSection');
  if (swapSec) swapSec.style.display = 'none';
  var medCert = document.getElementById('lvMedCert');
  if (medCert) medCert.value = '';
  var photo = document.getElementById('lvPhoto');
  if (photo) photo.value = '';
}

// ============================================================
// LEAVE CALENDAR — ปฏิทินการลา
// ============================================================

var _lvCalMonth = null;
var _lvCalYear = null;

function renderLeaveCalendar() {
  var el = document.getElementById('sm-leave-calendar');
  if (!el) return;
  var today = new Date();
  if (_lvCalMonth === null) _lvCalMonth = today.getMonth();
  if (_lvCalYear === null) _lvCalYear = today.getFullYear();
  _buildCalendar(el);
}

function _buildCalendar(el) {
  var data = _getLeaveData();
  var today = new Date();
  var todayStr = today.toISOString().slice(0, 10);
  var thMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  var thDays = ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];

  var firstDay = new Date(_lvCalYear, _lvCalMonth, 1).getDay();
  var daysInMonth = new Date(_lvCalYear, _lvCalMonth + 1, 0).getDate();

  // Build leave map: date -> array of records
  var leaveMap = {};
  data.forEach(function(r) {
    if (!r.dateFrom) return;
    var from = new Date(r.dateFrom);
    var to = r.dateTo ? new Date(r.dateTo) : from;
    var cur = new Date(from);
    while (cur <= to) {
      var ds = cur.toISOString().slice(0, 10);
      if (!leaveMap[ds]) leaveMap[ds] = [];
      leaveMap[ds].push(r);
      cur.setDate(cur.getDate() + 1);
    }
  });

  var typeColors = { sick:'#ef4444', personal:'#f59e0b', annual:'#3b82f6', maternity:'#ec4899', swap:'#6366f1', training:'#10b981', lwop:'#94a3b8' };

  var h = '<div style="padding:8px">';

  // Header: month navigation + email button
  h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">';
  h += '<div style="display:flex;align-items:center;gap:12px">';
  h += '<button onclick="lvCalNav(-1)" style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:16px">◀</button>';
  h += '<h2 style="margin:0;font-size:1.3rem;color:#1e293b">📅 ' + thMonths[_lvCalMonth] + ' ' + (_lvCalYear + 543) + '</h2>';
  h += '<button onclick="lvCalNav(1)" style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:16px">▶</button>';
  h += '<button onclick="lvCalToday()" style="background:#f97316;color:#fff;border:none;border-radius:8px;padding:8px 16px;cursor:pointer;font-size:13px;font-weight:600">วันนี้</button>';
  h += '</div>';
  h += '<button onclick="lvSendDailySummary()" style="background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;border:none;border-radius:8px;padding:10px 20px;cursor:pointer;font-size:13px;font-weight:600">📧 ส่งสรุปวันนี้ทางอีเมล</button>';
  h += '</div>';

  // Calendar grid
  h += '<div class="card" style="padding:16px;overflow-x:auto">';
  h += '<table style="width:100%;border-collapse:collapse;table-layout:fixed">';

  // Day headers
  h += '<thead><tr>';
  thDays.forEach(function(d, i) {
    var color = i === 0 ? '#ef4444' : (i === 6 ? '#3b82f6' : '#475569');
    h += '<th style="padding:10px 4px;text-align:center;font-size:13px;font-weight:700;color:' + color + ';border-bottom:2px solid #e2e8f0">' + d + '</th>';
  });
  h += '</tr></thead><tbody>';

  // Calendar cells
  var day = 1;
  for (var row = 0; row < 6; row++) {
    if (day > daysInMonth) break;
    h += '<tr>';
    for (var col = 0; col < 7; col++) {
      if ((row === 0 && col < firstDay) || day > daysInMonth) {
        h += '<td style="padding:4px;border:1px solid #f1f5f9;vertical-align:top;height:90px;background:#fafafa"></td>';
      } else {
        var dateStr = _lvCalYear + '-' + (_lvCalMonth + 1 < 10 ? '0' : '') + (_lvCalMonth + 1) + '-' + (day < 10 ? '0' : '') + day;
        var isToday = dateStr === todayStr;
        var isWeekend = col === 0 || col === 6;
        var bg = isToday ? '#fff7ed' : (isWeekend ? '#f8fafc' : '#fff');
        var border = isToday ? '2px solid #f97316' : '1px solid #f1f5f9';
        var leaves = leaveMap[dateStr] || [];

        h += '<td style="padding:4px;border:' + border + ';vertical-align:top;height:90px;background:' + bg + ';cursor:' + (leaves.length ? 'pointer' : 'default') + '" onclick="lvCalDayClick(\'' + dateStr + '\')">';

        // Day number
        var dayColor = isToday ? '#f97316' : (col === 0 ? '#ef4444' : (col === 6 ? '#3b82f6' : '#1e293b'));
        h += '<div style="font-size:13px;font-weight:' + (isToday ? '800' : '600') + ';color:' + dayColor + ';margin-bottom:2px">' + day;
        if (isToday) h += ' <span style="font-size:10px;background:#f97316;color:#fff;padding:1px 5px;border-radius:10px">วันนี้</span>';
        h += '</div>';

        // Leave entries (max 3 visible)
        leaves.slice(0, 3).forEach(function(r) {
          var typeLabel = '';
          SM_LEAVE_TYPES.forEach(function(t) { if (t.id === r.type) typeLabel = t.label.split('(')[0].trim(); });
          var c = typeColors[r.type] || '#94a3b8';
          h += '<div style="font-size:10px;background:' + c + '18;color:' + c + ';padding:1px 4px;border-radius:3px;margin-bottom:1px;border-left:2px solid ' + c + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="' + (r.staffNick || '') + ' — ' + typeLabel + '">';
          h += (r.staffNick || '') + ' ' + typeLabel;
          h += '</div>';
        });
        if (leaves.length > 3) {
          h += '<div style="font-size:10px;color:#94a3b8;text-align:center">+' + (leaves.length - 3) + ' คน</div>';
        }
        h += '</td>';
        day++;
      }
    }
    h += '</tr>';
  }
  h += '</tbody></table></div>';

  // Day detail panel (shown when clicking a date)
  h += '<div id="lvCalDetail" style="display:none;margin-top:16px"></div>';

  h += '</div>';
  el.innerHTML = h;
}

function lvCalNav(dir) {
  _lvCalMonth += dir;
  if (_lvCalMonth < 0) { _lvCalMonth = 11; _lvCalYear--; }
  if (_lvCalMonth > 11) { _lvCalMonth = 0; _lvCalYear++; }
  var el = document.getElementById('sm-leave-calendar');
  if (el) _buildCalendar(el);
}

function lvCalToday() {
  var today = new Date();
  _lvCalMonth = today.getMonth();
  _lvCalYear = today.getFullYear();
  var el = document.getElementById('sm-leave-calendar');
  if (el) _buildCalendar(el);
}

function lvCalDayClick(dateStr) {
  var data = _getLeaveData();
  var panel = document.getElementById('lvCalDetail');
  if (!panel) return;

  // Find all leaves covering this date
  var leaves = [];
  data.forEach(function(r) {
    if (!r.dateFrom) return;
    var from = r.dateFrom;
    var to = r.dateTo || from;
    if (dateStr >= from && dateStr <= to) leaves.push(r);
  });

  if (leaves.length === 0) {
    panel.style.display = 'none';
    return;
  }

  var thDayNames = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
  var d = new Date(dateStr);
  var dayName = thDayNames[d.getDay()];
  var parts = dateStr.split('-');
  var beYear = parseInt(parts[0]) + 543;
  var displayDate = parseInt(parts[2]) + ' ' + ['','มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'][parseInt(parts[1])] + ' ' + beYear;

  var h = '<div class="card" style="padding:20px">';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">';
  h += '<h3 style="margin:0;font-size:16px;color:#1e293b">📋 สรุปการลา — วัน' + dayName + 'ที่ ' + displayDate + '</h3>';
  h += '<span style="background:#f97316;color:#fff;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:700">' + leaves.length + ' คน</span>';
  h += '</div>';

  h += '<div class="table-wrap"><table style="width:100%;font-size:13px;border-collapse:collapse">';
  h += '<thead><tr style="background:#1e293b;color:#fff">' +
    '<th style="padding:8px 10px;text-align:left">พนักงาน</th>' +
    '<th style="padding:8px 10px;text-align:left">รหัส</th>' +
    '<th style="padding:8px 10px;text-align:left">ตำแหน่ง</th>' +
    '<th style="padding:8px 10px;text-align:left">แผนก</th>' +
    '<th style="padding:8px 10px;text-align:left">ประเภทการลา</th>' +
    '<th style="padding:8px 10px;text-align:center">จำนวนวัน</th>' +
    '<th style="padding:8px 10px;text-align:left">เหตุผล</th>' +
    '</tr></thead><tbody>';

  leaves.forEach(function(r) {
    var typeLabel = '';
    SM_LEAVE_TYPES.forEach(function(t) { if (t.id === r.type) typeLabel = t.label.split('(')[0].trim(); });
    h += '<tr style="border-bottom:1px solid #f1f5f9">' +
      '<td style="padding:8px 10px;font-weight:600">' + (r.staffNick || '') + '</td>' +
      '<td style="padding:8px 10px;color:#64748b">' + (r.empId || '-') + '</td>' +
      '<td style="padding:8px 10px;color:#64748b">' + (r.position || '-') + '</td>' +
      '<td style="padding:8px 10px">' + (r.dept || '') + '</td>' +
      '<td style="padding:8px 10px">' + typeLabel + '</td>' +
      '<td style="padding:8px 10px;text-align:center;font-weight:700;color:#f97316">' + (r.days || '') + '</td>' +
      '<td style="padding:8px 10px;color:#64748b">' + (r.reason || '-') + '</td></tr>';
  });
  h += '</tbody></table></div></div>';

  panel.style.display = '';
  panel.innerHTML = h;
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================================
// EMAIL DAILY SUMMARY — ส่งสรุปการลาวันนี้ทางอีเมล
// ============================================================

function _buildDailySummaryHtml(dateStr) {
  var data = _getLeaveData();
  var leaves = [];
  data.forEach(function(r) {
    if (!r.dateFrom) return;
    var from = r.dateFrom;
    var to = r.dateTo || from;
    if (dateStr >= from && dateStr <= to) leaves.push(r);
  });

  var thDayNames = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
  var thMonths = ['','มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  var d = new Date(dateStr);
  var dayName = thDayNames[d.getDay()];
  var parts = dateStr.split('-');
  var beYear = parseInt(parts[0]) + 543;
  var displayDate = 'วัน' + dayName + 'ที่ ' + parseInt(parts[2]) + ' ' + thMonths[parseInt(parts[1])] + ' ' + beYear;

  var subject = 'สรุปการลางานประจำวัน — ' + displayDate + ' (ฝ่ายขาย-การตลาด)';

  var body = 'สรุปการลางานประจำวัน\n';
  body += displayDate + '\n';
  body += 'ฝ่ายขาย - การตลาด\n';
  body += '══════════════════════════════\n\n';

  if (leaves.length === 0) {
    body += 'ไม่มีพนักงานลาหยุดในวันนี้\n';
  } else {
    body += 'จำนวนพนักงานลา: ' + leaves.length + ' คน\n\n';

    leaves.forEach(function(r, i) {
      var typeLabel = '';
      SM_LEAVE_TYPES.forEach(function(t) { if (t.id === r.type) typeLabel = t.label; });
      body += (i + 1) + '. ' + (r.staffNick || '-') + '\n';
      body += '   รหัสพนักงาน: ' + (r.empId || '-') + '\n';
      body += '   ตำแหน่ง: ' + (r.position || '-') + '\n';
      body += '   แผนก: ' + (r.dept || '-') + '\n';
      body += '   ประเภทการลา: ' + typeLabel + '\n';
      body += '   วันที่ลา: ' + (r.dateFrom || '') + (r.dateTo && r.dateTo !== r.dateFrom ? ' ถึง ' + r.dateTo : '') + '\n';
      body += '   จำนวน: ' + (r.days || '-') + ' วัน\n';
      body += '   เหตุผล: ' + (r.reason || '-') + '\n';
      if (r.note) body += '   หมายเหตุ: ' + r.note + '\n';
      body += '\n';
    });

    // Summary table by type
    var byType = {};
    leaves.forEach(function(r) {
      if (!byType[r.type]) byType[r.type] = 0;
      byType[r.type]++;
    });
    body += '── สรุปตามประเภท ──\n';
    Object.keys(byType).forEach(function(t) {
      var label = '';
      SM_LEAVE_TYPES.forEach(function(lt) { if (lt.id === t) label = lt.label.split('(')[0].trim(); });
      body += '  • ' + label + ': ' + byType[t] + ' คน\n';
    });

    // Summary by dept
    var byDept = {};
    leaves.forEach(function(r) {
      if (!byDept[r.dept]) byDept[r.dept] = 0;
      byDept[r.dept]++;
    });
    body += '\n── สรุปตามแผนก ──\n';
    Object.keys(byDept).forEach(function(dept) {
      body += '  • ' + dept + ': ' + byDept[dept] + ' คน\n';
    });
  }

  body += '\n══════════════════════════════\n';
  body += 'ส่งจาก Sales Dashboard — ฝ่ายขาย-การตลาด\n';

  return { subject: subject, body: body, count: leaves.length };
}

function lvSendDailySummary() {
  var todayStr = new Date().toISOString().slice(0, 10);
  var summary = _buildDailySummaryHtml(todayStr);

  var to = 'sales.manager@wanwanach.com,sale.analysis@wanwanach.com';
  var mailtoUrl = 'mailto:' + to +
    '?subject=' + encodeURIComponent(summary.subject) +
    '&body=' + encodeURIComponent(summary.body);

  window.open(mailtoUrl, '_blank');
}

// ---- Auto-check email reminder at 11:00 ----
var _lvEmailReminderSet = false;
function _lvCheckEmailReminder() {
  if (_lvEmailReminderSet) return;
  _lvEmailReminderSet = true;

  function check() {
    var now = new Date();
    if (now.getHours() === 11 && now.getMinutes() === 0) {
      var todayStr = now.toISOString().slice(0, 10);
      var summary = _buildDailySummaryHtml(todayStr);
      if (summary.count > 0) {
        var panel = document.createElement('div');
        panel.id = 'lvEmailReminder';
        panel.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;background:#fff;border:2px solid #f97316;border-radius:12px;padding:20px;box-shadow:0 8px 32px rgba(0,0,0,0.15);max-width:400px';
        panel.innerHTML = '<div style="font-weight:700;font-size:15px;color:#1e293b;margin-bottom:8px">📧 แจ้งเตือน 11:00 น. — สรุปการลาวันนี้</div>' +
          '<div style="font-size:13px;color:#475569;margin-bottom:12px">วันนี้มีพนักงานลา <b style="color:#f97316">' + summary.count + '</b> คน<br>ส่งสรุปไปยัง sales.manager / sale.analysis?</div>' +
          '<div style="display:flex;gap:8px">' +
          '<button onclick="lvSendDailySummary();this.closest(\'#lvEmailReminder\').remove()" style="background:#f97316;color:#fff;border:none;border-radius:8px;padding:8px 16px;cursor:pointer;font-weight:600">📧 ส่งอีเมล</button>' +
          '<button onclick="this.closest(\'#lvEmailReminder\').remove()" style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;padding:8px 16px;cursor:pointer">ปิด</button></div>';
        document.body.appendChild(panel);
      }
    }
  }

  setInterval(check, 60000);
  check();
}

// ============================================================
// CUSTOMER DATA — ข้อมูลลูกค้า (4 channels)
// localStorage key: smCustomerData
// ============================================================

var _custData = null;

function _getCustData() {
  if (!_custData) {
    try { _custData = JSON.parse(localStorage.getItem('smCustomerData') || 'null'); } catch(e) {}
    if (!_custData) _custData = { mt: [], amazon: [], amazonBC: [], booth: [], onlineFB: [], onlineLine: [], onlineMarket: [] };
  }
  return _custData;
}

function _saveCustData() {
  localStorage.setItem('smCustomerData', JSON.stringify(_getCustData()));
}

function _custId() { return 'C' + Date.now().toString(36) + Math.random().toString(36).substr(2,4); }

// --- Shared: modal form field builder (same pattern as _openStaffForm) ---
function _custField(label, id, type, value, opts) {
  opts = opts || {};
  var inp = '';
  if (type === 'select') {
    inp = '<select id="' + id + '" style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px">';
    (opts.options || []).forEach(function(o) {
      var val = typeof o === 'object' ? o.value : o;
      var lbl = typeof o === 'object' ? o.label : o;
      inp += '<option value="' + val + '"' + (val === value ? ' selected' : '') + '>' + lbl + '</option>';
    });
    inp += '</select>';
  } else if (type === 'textarea') {
    inp = '<textarea id="' + id + '" rows="' + (opts.rows || 3) + '" style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;resize:vertical">' + (value || '') + '</textarea>';
  } else {
    var ro = opts.readonly ? ' readonly style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;background:#f1f5f9;color:#64748b"' : ' style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px"';
    inp = '<input type="' + (type || 'text') + '" id="' + id + '" value="' + String(value || '').replace(/"/g, '&quot;') + '"' + ro + (opts.placeholder ? ' placeholder="' + opts.placeholder + '"' : '') + '>';
  }
  return '<div style="margin-bottom:10px"><label style="display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:4px">' + label + (opts.required ? ' <span style="color:#ef4444">*</span>' : '') + '</label>' + inp + '</div>';
}

// --- Shared: open modal overlay ---
function _custOpenModal(title, bodyHtml, onSave, accentColor) {
  accentColor = accentColor || '#f97316';
  var old = document.getElementById('custFormOverlay');
  if (old) old.remove();

  var overlay = document.createElement('div');
  overlay.id = 'custFormOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });

  overlay.innerHTML = '<div style="background:#fff;border-radius:12px;width:100%;max-width:780px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)">'
    + '<div style="padding:20px 24px 16px;border-bottom:2px solid ' + accentColor + ';display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;border-radius:12px 12px 0 0;z-index:1">'
    + '<h3 style="margin:0;font-size:18px;color:#1e293b">' + title + '</h3>'
    + '<button onclick="document.getElementById(\'custFormOverlay\').remove()" style="background:none;border:none;font-size:22px;cursor:pointer;color:#94a3b8;padding:4px">&#10005;</button>'
    + '</div>'
    + '<div id="custFormBody" style="padding:20px 24px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px">' + bodyHtml + '</div></div>'
    + '<div style="padding:16px 24px 20px;border-top:1px solid #e5e7eb;display:flex;gap:10px;justify-content:flex-end;position:sticky;bottom:0;background:#fff;border-radius:0 0 12px 12px">'
    + '<button onclick="document.getElementById(\'custFormOverlay\').remove()" style="padding:10px 24px;border:1px solid #d1d5db;border-radius:8px;background:#fff;cursor:pointer;font-size:14px;color:#374151">ยกเลิก</button>'
    + '<button id="custSaveBtn" style="padding:10px 24px;border:none;border-radius:8px;background:' + accentColor + ';color:#fff;cursor:pointer;font-size:14px;font-weight:600">💾 บันทึก</button>'
    + '</div></div>';

  document.body.appendChild(overlay);
  document.getElementById('custSaveBtn').addEventListener('click', function() {
    if (onSave) onSave();
  });
}

// --- Shared: toolbar with add + CSV buttons ---
function _custToolbar(addLabel, onAddFn, csvFn, accentColor) {
  return '<div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">'
    + '<button onclick="' + onAddFn + '" style="padding:8px 18px;border:none;border-radius:8px;background:' + accentColor + ';color:#fff;cursor:pointer;font-size:14px;font-weight:600">➕ ' + addLabel + '</button>'
    + '<button onclick="' + csvFn + '" style="padding:8px 18px;border:1px solid #d1d5db;border-radius:8px;background:#fff;cursor:pointer;font-size:14px;color:#374151">⬇️ ดาวน์โหลด CSV</button>'
    + '</div>';
}

// --- Shared: empty state ---
function _custEmpty(message, accentColor) {
  return '<div style="text-align:center;padding:60px 20px;color:#94a3b8">'
    + '<div style="font-size:48px;margin-bottom:12px">📋</div>'
    + '<div style="font-size:16px;font-weight:600;margin-bottom:4px">' + message + '</div>'
    + '<div style="font-size:13px">กดปุ่ม ➕ ด้านบนเพื่อเพิ่มข้อมูล</div></div>';
}

// --- Shared: sub-filter pills ---
function _custPills(pills, activeIdx, onClickPrefix) {
  var h = '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">';
  pills.forEach(function(p, i) {
    var active = i === activeIdx;
    h += '<button onclick="' + onClickPrefix + '(' + i + ')" style="padding:6px 16px;border-radius:20px;border:1px solid ' + (active ? p.color : '#d1d5db') + ';background:' + (active ? p.color : '#fff') + ';color:' + (active ? '#fff' : '#374151') + ';cursor:pointer;font-size:13px;font-weight:' + (active ? '600' : '400') + '">' + p.label + '</button>';
  });
  h += '</div>';
  return h;
}

// --- CSV export helper ---
function _custExportCSV(rows, headers, filename) {
  if (!rows.length) { alert('ไม่มีข้อมูลสำหรับดาวน์โหลด'); return; }
  var csv = '﻿' + headers.join(',') + '\n';
  rows.forEach(function(r) {
    csv += r.map(function(v) { return '"' + String(v || '').replace(/"/g, '""') + '"'; }).join(',') + '\n';
  });
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}


// ============================================================
// 1. MODERN TRADE
// ============================================================
var _custMtExpanded = {};

function renderCustMt() {
  var el = document.getElementById('sm-cust-mt');
  if (!el) return;
  var data = _getCustData();
  var list = data.mt || [];
  var accent = '#f97316';

  var h = '<div style="padding:20px">';
  h += '<h3 style="margin:0 0 16px;color:' + accent + '">🏪 Modern Trade — ข้อมูลลูกค้า</h3>';
  h += _custToolbar('เพิ่มลูกค้า', '_custMtOpenForm()', '_custMtCSV()', accent);

  if (!list.length) {
    h += _custEmpty('ยังไม่มีข้อมูลลูกค้า Modern Trade', accent);
  } else {
    list.forEach(function(c, idx) {
      var expanded = _custMtExpanded[c.id];
      h += _custMtCard(c, idx, expanded, accent);
    });
  }
  h += '</div>';
  el.innerHTML = h;
}

function _custMtCard(c, idx, expanded, accent) {
  var statusColor = c.contractEnd && new Date(c.contractEnd) < new Date() ? '#ef4444' : '#10b981';
  var statusText = c.contractEnd && new Date(c.contractEnd) < new Date() ? 'หมดสัญญา' : 'ปกติ';

  var h = '<div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:12px;border-left:4px solid ' + accent + '">';
  // Card header (click to expand)
  h += '<div onclick="_custMtToggle(\'' + c.id + '\')" style="padding:14px 18px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;background:#fffbf5;border-radius:10px">';
  h += '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">';
  h += '<span style="font-weight:700;color:#1e293b">' + (c.customerId || '-') + '</span>';
  h += '<span style="color:#475569">' + (c.customerName || '-') + '</span>';
  h += '<span style="font-size:12px;color:#64748b">' + (c.companyName || '') + '</span>';
  h += '<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:' + statusColor + '20;color:' + statusColor + ';font-weight:600">' + statusText + '</span>';
  h += '</div>';
  h += '<span style="font-size:18px;transform:rotate(' + (expanded ? '180' : '0') + 'deg);transition:transform .2s">&#9660;</span>';
  h += '</div>';

  if (expanded) {
    h += '<div style="padding:18px;border-top:1px solid #e2e8f0">';
    // Main info
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px 16px;margin-bottom:16px">';
    h += _custInfoCell('ประเภทลูกค้า', c.customerType);
    h += _custInfoCell('ช่องทาง', c.channel);
    h += _custInfoCell('เริ่มสัญญา', c.contractStart);
    h += _custInfoCell('สิ้นสุดสัญญา', c.contractEnd);
    h += _custInfoCell('เลขผู้เสียภาษี', c.taxId);
    h += _custInfoCell('เครดิต (วัน)', c.credit);
    h += _custInfoCell('ที่อยู่สำนักงานใหญ่', c.headOfficeAddr);
    h += '</div>';

    // Warehouse info
    if (c.warehouseInfo) {
      var w = c.warehouseInfo;
      h += '<div style="margin-bottom:16px"><div style="font-weight:600;color:#1e293b;margin-bottom:8px;font-size:14px">📦 ข้อมูลคลังสินค้า</div>';
      h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px 16px">';
      h += _custInfoCell('ชื่อคลัง', w.name);
      h += _custInfoCell('เบอร์โทร', w.phone);
      h += _custInfoCell('รอบสั่งซื้อ', w.orderCycle);
      h += _custInfoCell('รอบส่งสินค้า', w.deliveryCycle);
      h += _custInfoCell('วันรับสินค้า', w.receiveDay);
      h += _custInfoCell('PO Cutoff', w.poCutoff);
      h += '</div></div>';
    }

    // Branch summary + table
    h += '<div style="margin-bottom:16px"><div style="font-weight:600;color:#1e293b;margin-bottom:8px;font-size:14px">🏢 ข้อมูลสาขา (' + ((c.branches || []).length) + ' สาขา)</div>';
    h += '<div style="display:flex;gap:16px;margin-bottom:8px;flex-wrap:wrap">';
    h += '<span style="font-size:13px">รวมทั้งหมด: <b>' + (c.totalBranches || 0) + '</b></span>';
    h += '<span style="font-size:13px;color:#10b981">เปิด: <b>' + (c.activeBranches || 0) + '</b></span>';
    h += '<span style="font-size:13px;color:#ef4444">ปิด: <b>' + (c.closedBranches || 0) + '</b></span>';
    h += '</div>';
    if (c.branches && c.branches.length) {
      h += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">';
      h += '<thead><tr style="background:#f8fafc"><th style="padding:8px;border:1px solid #e2e8f0;text-align:left">รหัสสาขา</th><th style="padding:8px;border:1px solid #e2e8f0;text-align:left">ชื่อสาขา</th><th style="padding:8px;border:1px solid #e2e8f0;text-align:left">จังหวัด</th><th style="padding:8px;border:1px solid #e2e8f0;text-align:left">อำเภอ</th><th style="padding:8px;border:1px solid #e2e8f0;text-align:left">เบอร์โทร</th><th style="padding:8px;border:1px solid #e2e8f0;text-align:left">GPS</th></tr></thead><tbody>';
      c.branches.forEach(function(b) {
        h += '<tr><td style="padding:8px;border:1px solid #e2e8f0">' + (b.branchId || '-') + '</td>';
        h += '<td style="padding:8px;border:1px solid #e2e8f0">' + (b.branchName || '-') + '</td>';
        h += '<td style="padding:8px;border:1px solid #e2e8f0">' + (b.province || '-') + '</td>';
        h += '<td style="padding:8px;border:1px solid #e2e8f0">' + (b.district || '-') + '</td>';
        h += '<td style="padding:8px;border:1px solid #e2e8f0">' + (b.phone || '-') + '</td>';
        h += '<td style="padding:8px;border:1px solid #e2e8f0">' + (b.gps || '-') + '</td></tr>';
      });
      h += '</tbody></table></div>';
    }
    h += '</div>';

    // Documents
    h += '<div style="margin-bottom:16px"><div style="font-weight:600;color:#1e293b;margin-bottom:8px;font-size:14px">📎 เอกสารแนบ</div>';
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px 16px">';
    var docs = c.documents || {};
    h += _custInfoCell('สัญญา', docs.contract);
    h += _custInfoCell('ป.พ.20', docs.pp20);
    h += _custInfoCell('หนังสือรับรอง', docs.certificate);
    h += _custInfoCell('อื่นๆ', docs.other);
    h += '</div></div>';

    // Action buttons
    h += '<div style="display:flex;gap:8px">';
    h += '<button onclick="_custMtOpenForm(' + idx + ')" style="padding:6px 16px;border:none;border-radius:6px;background:#3b82f6;color:#fff;cursor:pointer;font-size:13px">✏️ แก้ไข</button>';
    h += '<button onclick="_custMtDelete(' + idx + ')" style="padding:6px 16px;border:none;border-radius:6px;background:#ef4444;color:#fff;cursor:pointer;font-size:13px">🗑️ ลบ</button>';
    h += '</div>';
    h += '</div>';
  }
  h += '</div>';
  return h;
}

function _custInfoCell(label, value) {
  return '<div><span style="font-size:11px;color:#94a3b8">' + label + '</span><div style="font-size:13px;color:#1e293b">' + (value || '-') + '</div></div>';
}

function _custMtToggle(id) {
  _custMtExpanded[id] = !_custMtExpanded[id];
  renderCustMt();
}

function _custMtOpenForm(editIdx) {
  var data = _getCustData();
  var isEdit = typeof editIdx === 'number';
  var c = isEdit ? data.mt[editIdx] : { id: _custId(), customerId: '', customerName: '', companyName: '', customerType: '', channel: 'Modern Trade', contractStart: '', contractEnd: '', taxId: '', credit: '', headOfficeAddr: '', warehouseInfo: { name: '', phone: '', orderCycle: '', deliveryCycle: '', receiveDay: '', poCutoff: '' }, totalBranches: 0, activeBranches: 0, closedBranches: 0, branches: [], documents: { contract: '', pp20: '', certificate: '', other: '' } };
  var w = c.warehouseInfo || {};
  var docs = c.documents || {};

  var body = ''
    + _custField('รหัสลูกค้า', 'cf_custId', 'text', c.customerId, { required: true, placeholder: 'เช่น MT001' })
    + _custField('ชื่อลูกค้า', 'cf_custName', 'text', c.customerName, { required: true, placeholder: 'เช่น Tops Supermarket' })
    + _custField('ชื่อบริษัท', 'cf_company', 'text', c.companyName, { placeholder: 'เช่น บจก. เซ็นทรัล ฟู้ด รีเทล' })
    + _custField('ประเภทลูกค้า', 'cf_type', 'select', c.customerType, { options: ['', 'Hypermarket', 'Supermarket', 'Convenience Store', 'Department Store', 'อื่นๆ'] })
    + _custField('ช่องทาง', 'cf_channel', 'text', c.channel || 'Modern Trade')
    + _custField('เริ่มสัญญา', 'cf_contractStart', 'date', c.contractStart)
    + _custField('สิ้นสุดสัญญา', 'cf_contractEnd', 'date', c.contractEnd)
    + _custField('เลขผู้เสียภาษี', 'cf_taxId', 'text', c.taxId, { placeholder: '13 หลัก' })
    + _custField('เครดิต (วัน)', 'cf_credit', 'number', c.credit, { placeholder: 'เช่น 30' })
    + _custField('ที่อยู่สำนักงานใหญ่', 'cf_headAddr', 'text', c.headOfficeAddr)
    + '</div><h4 style="margin:16px 0 8px;color:#f97316">📦 ข้อมูลคลังสินค้า</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px">'
    + _custField('ชื่อคลัง', 'cf_whName', 'text', w.name)
    + _custField('เบอร์โทรคลัง', 'cf_whPhone', 'text', w.phone)
    + _custField('รอบสั่งซื้อ', 'cf_whOrder', 'text', w.orderCycle, { placeholder: 'เช่น ทุกวันจันทร์' })
    + _custField('รอบส่งสินค้า', 'cf_whDeliver', 'text', w.deliveryCycle)
    + _custField('วันรับสินค้า', 'cf_whReceive', 'text', w.receiveDay)
    + _custField('PO Cutoff', 'cf_whPoCutoff', 'text', w.poCutoff)
    + '</div><h4 style="margin:16px 0 8px;color:#f97316">🏢 สรุปสาขา</h4><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0 16px">'
    + _custField('สาขาทั้งหมด', 'cf_totalBr', 'number', c.totalBranches)
    + _custField('สาขาเปิด', 'cf_activeBr', 'number', c.activeBranches)
    + _custField('สาขาปิด', 'cf_closedBr', 'number', c.closedBranches)
    + '</div><h4 style="margin:16px 0 8px;color:#f97316">📎 เอกสารแนบ (ชื่อไฟล์)</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px">'
    + _custField('สัญญา', 'cf_docContract', 'text', docs.contract)
    + _custField('ป.พ.20', 'cf_docPp20', 'text', docs.pp20)
    + _custField('หนังสือรับรอง', 'cf_docCert', 'text', docs.certificate)
    + _custField('อื่นๆ', 'cf_docOther', 'text', docs.other);

  _custOpenModal((isEdit ? '✏️ แก้ไขลูกค้า' : '➕ เพิ่มลูกค้า') + ' Modern Trade', body, function() {
    var custId = document.getElementById('cf_custId').value.trim();
    var custName = document.getElementById('cf_custName').value.trim();
    if (!custId) { alert('กรุณากรอกรหัสลูกค้า'); return; }
    if (!custName) { alert('กรุณากรอกชื่อลูกค้า'); return; }

    var obj = {
      id: c.id,
      customerId: custId,
      customerName: custName,
      companyName: document.getElementById('cf_company').value.trim(),
      customerType: document.getElementById('cf_type').value,
      channel: document.getElementById('cf_channel').value.trim(),
      contractStart: document.getElementById('cf_contractStart').value,
      contractEnd: document.getElementById('cf_contractEnd').value,
      taxId: document.getElementById('cf_taxId').value.trim(),
      credit: document.getElementById('cf_credit').value.trim(),
      headOfficeAddr: document.getElementById('cf_headAddr').value.trim(),
      warehouseInfo: {
        name: document.getElementById('cf_whName').value.trim(),
        phone: document.getElementById('cf_whPhone').value.trim(),
        orderCycle: document.getElementById('cf_whOrder').value.trim(),
        deliveryCycle: document.getElementById('cf_whDeliver').value.trim(),
        receiveDay: document.getElementById('cf_whReceive').value.trim(),
        poCutoff: document.getElementById('cf_whPoCutoff').value.trim()
      },
      totalBranches: parseInt(document.getElementById('cf_totalBr').value) || 0,
      activeBranches: parseInt(document.getElementById('cf_activeBr').value) || 0,
      closedBranches: parseInt(document.getElementById('cf_closedBr').value) || 0,
      branches: c.branches || [],
      documents: {
        contract: document.getElementById('cf_docContract').value.trim(),
        pp20: document.getElementById('cf_docPp20').value.trim(),
        certificate: document.getElementById('cf_docCert').value.trim(),
        other: document.getElementById('cf_docOther').value.trim()
      }
    };

    if (isEdit) { data.mt[editIdx] = obj; }
    else { data.mt.push(obj); }
    _saveCustData();
    document.getElementById('custFormOverlay').remove();
    _custMtExpanded[obj.id] = true;
    renderCustMt();
  }, '#f97316');
}

function _custMtDelete(idx) {
  var data = _getCustData();
  var c = data.mt[idx];
  if (!confirm('ลบลูกค้า "' + (c.customerName || c.customerId) + '" ?')) return;
  data.mt.splice(idx, 1);
  _saveCustData();
  renderCustMt();
}

function _custMtCSV() {
  var data = _getCustData();
  var headers = ['รหัสลูกค้า', 'ชื่อลูกค้า', 'ชื่อบริษัท', 'ประเภท', 'ช่องทาง', 'เริ่มสัญญา', 'สิ้นสุดสัญญา', 'เครดิต', 'สาขาทั้งหมด', 'สาขาเปิด'];
  var rows = (data.mt || []).map(function(c) {
    return [c.customerId, c.customerName, c.companyName, c.customerType, c.channel, c.contractStart, c.contractEnd, c.credit, c.totalBranches, c.activeBranches];
  });
  _custExportCSV(rows, headers, 'customer_mt_' + new Date().toISOString().slice(0, 10) + '.csv');
}


// ============================================================
// 2. AMAZON
// ============================================================
var _custAmazonFilter = 0; // 0 = all channels, 1 = Black Canyon
var _custAmazonExpanded = {};

function renderCustAmazon() {
  var el = document.getElementById('sm-cust-amazon');
  if (!el) return;
  var data = _getCustData();
  var accent = '#8b5cf6';

  var pills = [
    { label: '📦 ทุกช่องทาง', color: accent },
    { label: '☕ Black Canyon', color: '#92400e' }
  ];

  var list = _custAmazonFilter === 0 ? (data.amazon || []) : (data.amazonBC || []);
  var arrKey = _custAmazonFilter === 0 ? 'amazon' : 'amazonBC';

  var h = '<div style="padding:20px">';
  h += '<h3 style="margin:0 0 16px;color:' + accent + '">📦 Amazon — ข้อมูลลูกค้า</h3>';
  h += _custPills(pills, _custAmazonFilter, '_custAmazonSetFilter');
  h += _custToolbar('เพิ่มลูกค้า', '_custAmazonOpenForm()', '_custAmazonCSV()', accent);

  if (!list.length) {
    h += _custEmpty('ยังไม่มีข้อมูลลูกค้า Amazon', accent);
  } else {
    list.forEach(function(c, idx) {
      var expanded = _custAmazonExpanded[c.id];
      h += _custAmazonCard(c, idx, expanded, accent);
    });
  }
  h += '</div>';
  el.innerHTML = h;
}

function _custAmazonSetFilter(idx) {
  _custAmazonFilter = idx;
  renderCustAmazon();
}

function _custAmazonCard(c, idx, expanded, accent) {
  var statusColor = c.contractEnd && new Date(c.contractEnd) < new Date() ? '#ef4444' : '#10b981';
  var statusText = c.contractEnd && new Date(c.contractEnd) < new Date() ? 'หมดสัญญา' : 'ปกติ';

  var h = '<div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:12px;border-left:4px solid ' + accent + '">';
  h += '<div onclick="_custAmazonToggle(\'' + c.id + '\')" style="padding:14px 18px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;background:#faf5ff;border-radius:10px">';
  h += '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">';
  h += '<span style="font-weight:700;color:#1e293b">' + (c.customerId || '-') + '</span>';
  h += '<span style="color:#475569">' + (c.customerName || '-') + '</span>';
  h += '<span style="font-size:12px;color:#64748b">' + (c.companyName || '') + '</span>';
  h += '<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:' + statusColor + '20;color:' + statusColor + ';font-weight:600">' + statusText + '</span>';
  h += '</div>';
  h += '<span style="font-size:18px;transform:rotate(' + (expanded ? '180' : '0') + 'deg);transition:transform .2s">&#9660;</span>';
  h += '</div>';

  if (expanded) {
    h += '<div style="padding:18px;border-top:1px solid #e2e8f0">';
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px 16px;margin-bottom:16px">';
    h += _custInfoCell('ประเภทลูกค้า', c.customerType);
    h += _custInfoCell('ช่องทาง', c.channel);
    h += _custInfoCell('เริ่มสัญญา', c.contractStart);
    h += _custInfoCell('สิ้นสุดสัญญา', c.contractEnd);
    h += _custInfoCell('เลขผู้เสียภาษี', c.taxId);
    h += _custInfoCell('เครดิต (วัน)', c.credit);
    h += _custInfoCell('ที่อยู่สำนักงานใหญ่', c.headOfficeAddr);
    h += '</div>';

    if (c.warehouseInfo) {
      var w = c.warehouseInfo;
      h += '<div style="margin-bottom:16px"><div style="font-weight:600;color:#1e293b;margin-bottom:8px;font-size:14px">📦 ข้อมูลคลังสินค้า</div>';
      h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px 16px">';
      h += _custInfoCell('ชื่อคลัง', w.name);
      h += _custInfoCell('เบอร์โทร', w.phone);
      h += _custInfoCell('รอบสั่งซื้อ', w.orderCycle);
      h += _custInfoCell('รอบส่งสินค้า', w.deliveryCycle);
      h += _custInfoCell('วันรับสินค้า', w.receiveDay);
      h += _custInfoCell('PO Cutoff', w.poCutoff);
      h += '</div></div>';
    }

    if (c.branches && c.branches.length) {
      h += '<div style="margin-bottom:16px"><div style="font-weight:600;color:#1e293b;margin-bottom:8px;font-size:14px">🏢 สาขา (' + c.branches.length + ')</div>';
      h += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">';
      h += '<thead><tr style="background:#f8fafc"><th style="padding:8px;border:1px solid #e2e8f0;text-align:left">รหัสสาขา</th><th style="padding:8px;border:1px solid #e2e8f0;text-align:left">ชื่อสาขา</th><th style="padding:8px;border:1px solid #e2e8f0;text-align:left">จังหวัด</th><th style="padding:8px;border:1px solid #e2e8f0;text-align:left">เบอร์โทร</th></tr></thead><tbody>';
      c.branches.forEach(function(b) {
        h += '<tr><td style="padding:8px;border:1px solid #e2e8f0">' + (b.branchId || '-') + '</td>';
        h += '<td style="padding:8px;border:1px solid #e2e8f0">' + (b.branchName || '-') + '</td>';
        h += '<td style="padding:8px;border:1px solid #e2e8f0">' + (b.province || '-') + '</td>';
        h += '<td style="padding:8px;border:1px solid #e2e8f0">' + (b.phone || '-') + '</td></tr>';
      });
      h += '</tbody></table></div></div>';
    }

    var docs = c.documents || {};
    h += '<div style="margin-bottom:16px"><div style="font-weight:600;color:#1e293b;margin-bottom:8px;font-size:14px">📎 เอกสารแนบ</div>';
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px 16px">';
    h += _custInfoCell('สัญญา', docs.contract);
    h += _custInfoCell('ป.พ.20', docs.pp20);
    h += _custInfoCell('หนังสือรับรอง', docs.certificate);
    h += _custInfoCell('อื่นๆ', docs.other);
    h += '</div></div>';

    h += '<div style="display:flex;gap:8px">';
    h += '<button onclick="_custAmazonOpenForm(' + idx + ')" style="padding:6px 16px;border:none;border-radius:6px;background:#3b82f6;color:#fff;cursor:pointer;font-size:13px">✏️ แก้ไข</button>';
    h += '<button onclick="_custAmazonDelete(' + idx + ')" style="padding:6px 16px;border:none;border-radius:6px;background:#ef4444;color:#fff;cursor:pointer;font-size:13px">🗑️ ลบ</button>';
    h += '</div>';
    h += '</div>';
  }
  h += '</div>';
  return h;
}

function _custAmazonToggle(id) {
  _custAmazonExpanded[id] = !_custAmazonExpanded[id];
  renderCustAmazon();
}

function _custAmazonOpenForm(editIdx) {
  var data = _getCustData();
  var arrKey = _custAmazonFilter === 0 ? 'amazon' : 'amazonBC';
  var isEdit = typeof editIdx === 'number';
  var c = isEdit ? data[arrKey][editIdx] : { id: _custId(), customerId: '', customerName: '', companyName: '', customerType: '', channel: 'Amazon', contractStart: '', contractEnd: '', taxId: '', credit: '', headOfficeAddr: '', warehouseInfo: { name: '', phone: '', orderCycle: '', deliveryCycle: '', receiveDay: '', poCutoff: '' }, totalBranches: 0, activeBranches: 0, closedBranches: 0, branches: [], documents: { contract: '', pp20: '', certificate: '', other: '' } };
  var w = c.warehouseInfo || {};
  var docs = c.documents || {};

  var body = ''
    + _custField('รหัสลูกค้า', 'cf_custId', 'text', c.customerId, { required: true })
    + _custField('ชื่อลูกค้า', 'cf_custName', 'text', c.customerName, { required: true })
    + _custField('ชื่อบริษัท', 'cf_company', 'text', c.companyName)
    + _custField('ประเภทลูกค้า', 'cf_type', 'select', c.customerType, { options: ['', 'E-commerce', 'Marketplace', 'อื่นๆ'] })
    + _custField('ช่องทาง', 'cf_channel', 'text', c.channel || 'Amazon')
    + _custField('เริ่มสัญญา', 'cf_contractStart', 'date', c.contractStart)
    + _custField('สิ้นสุดสัญญา', 'cf_contractEnd', 'date', c.contractEnd)
    + _custField('เลขผู้เสียภาษี', 'cf_taxId', 'text', c.taxId)
    + _custField('เครดิต (วัน)', 'cf_credit', 'number', c.credit)
    + _custField('ที่อยู่สำนักงานใหญ่', 'cf_headAddr', 'text', c.headOfficeAddr)
    + '</div><h4 style="margin:16px 0 8px;color:#8b5cf6">📦 ข้อมูลคลังสินค้า</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px">'
    + _custField('ชื่อคลัง', 'cf_whName', 'text', w.name)
    + _custField('เบอร์โทรคลัง', 'cf_whPhone', 'text', w.phone)
    + _custField('รอบสั่งซื้อ', 'cf_whOrder', 'text', w.orderCycle)
    + _custField('รอบส่งสินค้า', 'cf_whDeliver', 'text', w.deliveryCycle)
    + _custField('วันรับสินค้า', 'cf_whReceive', 'text', w.receiveDay)
    + _custField('PO Cutoff', 'cf_whPoCutoff', 'text', w.poCutoff)
    + '</div><h4 style="margin:16px 0 8px;color:#8b5cf6">📎 เอกสารแนบ (ชื่อไฟล์)</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px">'
    + _custField('สัญญา', 'cf_docContract', 'text', docs.contract)
    + _custField('ป.พ.20', 'cf_docPp20', 'text', docs.pp20)
    + _custField('หนังสือรับรอง', 'cf_docCert', 'text', docs.certificate)
    + _custField('อื่นๆ', 'cf_docOther', 'text', docs.other);

  _custOpenModal((isEdit ? '✏️ แก้ไข' : '➕ เพิ่มลูกค้า') + ' Amazon', body, function() {
    var custId = document.getElementById('cf_custId').value.trim();
    var custName = document.getElementById('cf_custName').value.trim();
    if (!custId) { alert('กรุณากรอกรหัสลูกค้า'); return; }
    if (!custName) { alert('กรุณากรอกชื่อลูกค้า'); return; }

    var obj = {
      id: c.id,
      customerId: custId,
      customerName: custName,
      companyName: document.getElementById('cf_company').value.trim(),
      customerType: document.getElementById('cf_type').value,
      channel: document.getElementById('cf_channel').value.trim(),
      contractStart: document.getElementById('cf_contractStart').value,
      contractEnd: document.getElementById('cf_contractEnd').value,
      taxId: document.getElementById('cf_taxId').value.trim(),
      credit: document.getElementById('cf_credit').value.trim(),
      headOfficeAddr: document.getElementById('cf_headAddr').value.trim(),
      warehouseInfo: {
        name: document.getElementById('cf_whName').value.trim(),
        phone: document.getElementById('cf_whPhone').value.trim(),
        orderCycle: document.getElementById('cf_whOrder').value.trim(),
        deliveryCycle: document.getElementById('cf_whDeliver').value.trim(),
        receiveDay: document.getElementById('cf_whReceive').value.trim(),
        poCutoff: document.getElementById('cf_whPoCutoff').value.trim()
      },
      totalBranches: c.totalBranches || 0,
      activeBranches: c.activeBranches || 0,
      closedBranches: c.closedBranches || 0,
      branches: c.branches || [],
      documents: {
        contract: document.getElementById('cf_docContract').value.trim(),
        pp20: document.getElementById('cf_docPp20').value.trim(),
        certificate: document.getElementById('cf_docCert').value.trim(),
        other: document.getElementById('cf_docOther').value.trim()
      }
    };

    if (isEdit) { data[arrKey][editIdx] = obj; }
    else { data[arrKey].push(obj); }
    _saveCustData();
    document.getElementById('custFormOverlay').remove();
    _custAmazonExpanded[obj.id] = true;
    renderCustAmazon();
  }, '#8b5cf6');
}

function _custAmazonDelete(idx) {
  var data = _getCustData();
  var arrKey = _custAmazonFilter === 0 ? 'amazon' : 'amazonBC';
  var c = data[arrKey][idx];
  if (!confirm('ลบลูกค้า "' + (c.customerName || c.customerId) + '" ?')) return;
  data[arrKey].splice(idx, 1);
  _saveCustData();
  renderCustAmazon();
}

function _custAmazonCSV() {
  var data = _getCustData();
  var arrKey = _custAmazonFilter === 0 ? 'amazon' : 'amazonBC';
  var headers = ['รหัสลูกค้า', 'ชื่อลูกค้า', 'ชื่อบริษัท', 'ประเภท', 'ช่องทาง', 'เริ่มสัญญา', 'สิ้นสุดสัญญา', 'เครดิต'];
  var rows = (data[arrKey] || []).map(function(c) {
    return [c.customerId, c.customerName, c.companyName, c.customerType, c.channel, c.contractStart, c.contractEnd, c.credit];
  });
  _custExportCSV(rows, headers, 'customer_amazon_' + new Date().toISOString().slice(0, 10) + '.csv');
}


// ============================================================
// 3. BOOTH
// ============================================================

var BOOTH_DEFAULT_DATA = [
  {id:'B1',branchId:'10203',branchName:'ลำพยา 3 (ใหม่)',branchType:'บูธหลัก',receiveCode:'33',salesArea:'บูธ รายวัน',salesStaffName:'-',staffId:'-',staffFullName:'-',storePhone:'066-1253396',personalPhone:'-',rentPerMonth:29768,changeAtBranch:1000,bankAccount:'ธนาคารไทยพาณิชย์ ชื่อบัญชี ภาณุวัชร วัฒนกิจรุ่งโรจน์ เลขที่บัญชี : 4047165360',contractInfo:'244714',status:'ปิดกิจการตั้งแต่ 31/10/2568',note:'',receiveSchedule:''},
  {id:'B2',branchId:'10204',branchName:'ร้านใหม่ (ปตท.คุณาวรรณ)',branchType:'บูธหลัก',receiveCode:'06',salesArea:'บูธ รายวัน',salesStaffName:'พี่น้อย',staffId:'64120242',staffFullName:'วัลนิภา ฤทธิ์ประดับ',storePhone:'066-1253390',personalPhone:'063-2612368',rentPerMonth:6155,changeAtBranch:1000,bankAccount:'ธนาคารไทยพาณิชย์ ชื่อบัญชี ภาณุวัชร วัฒนกิจรุ่งโรจน์ เลขที่บัญชี : 4047165360',contractInfo:'244714',status:'เปิดกิจการอยู่',note:'',receiveSchedule:''},
  {id:'B3',branchId:'10205',branchName:'หน้ามอ (ม.เกษตร)',branchType:'บูธหลัก',receiveCode:'07',salesArea:'บูธ รายวัน',salesStaffName:'พี่อุ้ม',staffId:'6709121-00',staffFullName:'เปรมยุดา ฤทธิ์ประดับ',storePhone:'066-1253398',personalPhone:'062-5989488',rentPerMonth:0,changeAtBranch:2000,bankAccount:'ธนาคารไทยพาณิชย์ ชื่อบัญชี ภาณุวัชร วัฒนกิจรุ่งโรจน์ เลขที่บัญชี : 4047165360',contractInfo:'ร้านของบริษัท (ไม่มีสิ้นสุดสัญญา)',status:'เปิดกิจการอยู่',note:'',receiveSchedule:''},
  {id:'B4',branchId:'10207',branchName:'ลำพยา 3 (เก่า)',branchType:'บูธหลัก',receiveCode:'10',salesArea:'บูธ รายวัน',salesStaffName:'พี่นก',staffId:'5710002',staffFullName:'ปราณี มาตยาคลู',storePhone:'066-1253393',personalPhone:'066-1253392',rentPerMonth:5000,changeAtBranch:1000,bankAccount:'ธนาคารไทยพาณิชย์ ชื่อบัญชี ภาณุวัชร วัฒนกิจรุ่งโรจน์ เลขที่บัญชี : 4047165360',contractInfo:'244559',status:'เปิดกิจการอยู่',note:'',receiveSchedule:''},
  {id:'B5',branchId:'10208',branchName:'ไทวัสดุ',branchType:'บูธหลัก',receiveCode:'04',salesArea:'บูธ รายวัน',salesStaffName:'-',staffId:'-',staffFullName:'-',storePhone:'066-1253392',personalPhone:'-',rentPerMonth:6420,changeAtBranch:1000,bankAccount:'ธนาคารไทยพาณิชย์ ชื่อบัญชี ภาณุวัชร วัฒนกิจรุ่งโรจน์ เลขที่บัญชี : 4047165360',contractInfo:'244165',status:'ปิดกิจการตั้งแต่ 31/08/2568',note:'',receiveSchedule:''},
  {id:'B6',branchId:'10209',branchName:'แก้วมณีกาญ',branchType:'บูธหลัก',receiveCode:'08',salesArea:'จ.กาญจนบุรี',salesStaffName:'-',staffId:'-',staffFullName:'-',storePhone:'066-1253395',personalPhone:'-',rentPerMonth:16000,changeAtBranch:1000,bankAccount:'ธนาคารไทยพาณิชย์ ชื่อบัญชี ภาณุวัชร วัฒนกิจรุ่งโรจน์ เลขที่บัญชี : 4047165360',contractInfo:'244349',status:'ปิดกิจการตั้งแต่ 31/10/2568',note:'',receiveSchedule:''},
  {id:'B7',branchId:'10210',branchName:'ลำพยา 2 (ใหม่)',branchType:'บูธหลัก',receiveCode:'28',salesArea:'บูธ รายวัน',salesStaffName:'-',staffId:'-',staffFullName:'-',storePhone:'066-1253397',personalPhone:'-',rentPerMonth:29768,changeAtBranch:1500,bankAccount:'ธนาคารไทยพาณิชย์ ชื่อบัญชี ภาณุวัชร วัฒนกิจรุ่งโรจน์ เลขที่บัญชี : 4047165360',contractInfo:'244349',status:'ปิดกิจการตั้งแต่ 31/10/2568',note:'',receiveSchedule:''},
  {id:'B8',branchId:'10219',branchName:'ธรรมศาลา',branchType:'บูธหลัก',receiveCode:'34',salesArea:'บูธ รายวัน',salesStaffName:'-',staffId:'-',staffFullName:'-',storePhone:'ไม่มีโทรศัพท์',personalPhone:'-',rentPerMonth:16500,changeAtBranch:1000,bankAccount:'ธนาคารไทยพาณิชย์ ชื่อบัญชี พุฒิสรรค์ แกล้ววิกย์กิจ เลขที่บัญชี : 4321496962',contractInfo:'244196',status:'ปิดกิจการตั้งแต่ 30/11/2568',note:'',receiveSchedule:''},
  {id:'B9',branchId:'10235',branchName:'ตลาดดิโอโซน',branchType:'บูธหลัก',receiveCode:'39',salesArea:'บูธ รายวัน',salesStaffName:'-',staffId:'-',staffFullName:'-',storePhone:'062-9614025',personalPhone:'-',rentPerMonth:12000,changeAtBranch:1000,bankAccount:'ธนาคารไทยพาณิชย์ ชื่อบัญชี พุฒิสรรค์ แกล้ววิกย์กิจ เลขที่บัญชี : 4321496962',contractInfo:'244349',status:'ปิดกิจการตั้งแต่ 1/06/2568',note:'',receiveSchedule:''},
  {id:'B10',branchId:'10264',branchName:'ปตท.ราชบุรี',branchType:'บูธหลัก',receiveCode:'46',salesArea:'จ.ราชบุรี',salesStaffName:'-',staffId:'-',staffFullName:'-',storePhone:'ไม่มีโทรศัพท์',personalPhone:'-',rentPerMonth:21000,changeAtBranch:1000,bankAccount:'ธนาคารไทยพาณิชย์ ชื่อบัญชี ภาณุวัชร วัฒนกิจรุ่งโรจน์ เลขที่บัญชี : 4047165360',contractInfo:'244349',status:'ปิดกิจการตั้งแต่ 30/09/2568',note:'',receiveSchedule:''},
  {id:'B11',branchId:'10377',branchName:'ศาลายา กม.26',branchType:'บูธหลัก',receiveCode:'57',salesArea:'บูธ รายวัน',salesStaffName:'-',staffId:'-',staffFullName:'-',storePhone:'ไม่มีโทรศัพท์',personalPhone:'-',rentPerMonth:22500,changeAtBranch:1000,bankAccount:'ธนาคารไทยพาณิชย์ ชื่อบัญชี ภาณุวัชร วัฒนกิจรุ่งโรจน์ เลขที่บัญชี : 4047165360',contractInfo:'244349',status:'ปิดกิจการตั้งแต่ 31/10/2568',note:'',receiveSchedule:''},
  {id:'B12',branchId:'10242',branchName:'ลาดหลุมแก้ว',branchType:'บูธหลัก',receiveCode:'37',salesArea:'บูธ รายวัน',salesStaffName:'-',staffId:'-',staffFullName:'-',storePhone:'-',personalPhone:'-',rentPerMonth:0,changeAtBranch:0,bankAccount:'-',contractInfo:'-',status:'ปิดกิจการตั้งแต่ 30/06/2567',note:'',receiveSchedule:''},
  {id:'B13',branchId:'11037',branchName:'วัดเขาทำเทียม',branchType:'บูธชั่วคราว',receiveCode:'45',salesArea:'บูธ รายวัน',salesStaffName:'-',staffId:'-',staffFullName:'-',storePhone:'-',personalPhone:'-',rentPerMonth:0,changeAtBranch:0,bankAccount:'-',contractInfo:'-',status:'ปิดกิจการตั้งแต่ 25/02/2567',note:'',receiveSchedule:''},
  {id:'B14',branchId:'10323',branchName:'วัดใหม่สุปดิษฐาราม',branchType:'บูธชั่วคราว',receiveCode:'40',salesArea:'บูธ รายวัน',salesStaffName:'-',staffId:'-',staffFullName:'-',storePhone:'-',personalPhone:'-',rentPerMonth:0,changeAtBranch:0,bankAccount:'-',contractInfo:'-',status:'ปิดกิจการตั้งแต่ 25/11/2567',note:'',receiveSchedule:''},
  {id:'B15',branchId:'10262',branchName:'ศิลปากร',branchType:'บูธหลัก',receiveCode:'38',salesArea:'บูธ รายวัน',salesStaffName:'-',staffId:'-',staffFullName:'-',storePhone:'-',personalPhone:'-',rentPerMonth:0,changeAtBranch:0,bankAccount:'-',contractInfo:'-',status:'ปิดกิจการ',note:'',receiveSchedule:''},
  {id:'B16',branchId:'10324',branchName:'วันดอนขนาก',branchType:'บูธของเล่น',receiveCode:'49',salesArea:'บูธ รายวัน',salesStaffName:'-',staffId:'-',staffFullName:'-',storePhone:'-',personalPhone:'-',rentPerMonth:0,changeAtBranch:0,bankAccount:'-',contractInfo:'-',status:'ปิดกิจการ',note:'',receiveSchedule:''},
  {id:'B17',branchId:'10371',branchName:'ชัยพฤกษ์ - นนทบุรี',branchType:'บูธหลัก',receiveCode:'51',salesArea:'บูธ รายวัน',salesStaffName:'-',staffId:'-',staffFullName:'-',storePhone:'-',personalPhone:'-',rentPerMonth:0,changeAtBranch:0,bankAccount:'-',contractInfo:'-',status:'ปิดกิจการตั้งแต่ 24/07/2568',note:'',receiveSchedule:''},
  {id:'B18',branchId:'10026',branchName:'โลตัส กำแพงแสน',branchType:'บูธของเล่น',receiveCode:'',salesArea:'บูธของเล่น',salesStaffName:'-',staffId:'-',staffFullName:'-',storePhone:'-',personalPhone:'-',rentPerMonth:0,changeAtBranch:0,bankAccount:'-',contractInfo:'-',status:'ปิดกิจการ',note:'',receiveSchedule:''},
  {id:'B19',branchId:'10347',branchName:'โลตัส บางเลน',branchType:'บูธของเล่น',receiveCode:'',salesArea:'บูธของเล่น',salesStaffName:'-',staffId:'-',staffFullName:'-',storePhone:'-',personalPhone:'-',rentPerMonth:0,changeAtBranch:0,bankAccount:'-',contractInfo:'-',status:'ปิดกิจการ',note:'',receiveSchedule:''}
];

function _getBoothWithDefaults() {
  var data = _getCustData();
  if (!data.booth || !data.booth.length) {
    data.booth = BOOTH_DEFAULT_DATA.slice();
    _saveCustData();
  }
  return data.booth;
}

function renderCustBooth() {
  var el = document.getElementById('sm-cust-booth');
  if (!el) return;
  var list = _getBoothWithDefaults();
  var accent = '#10b981';
  var openCount = 0, closedCount = 0;
  list.forEach(function(b) {
    if (b.status && b.status.indexOf('เปิด') > -1) openCount++;
    else closedCount++;
  });

  var h = '<div style="padding:20px">';
  h += '<h3 style="margin:0 0 16px;color:' + accent + '">🏕️ Booth — ข้อมูลสาขา</h3>';
  h += '<div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap">'
    + '<div style="padding:10px 20px;border-radius:8px;background:#ecfdf5;border:1px solid #a7f3d0;text-align:center"><div style="font-size:20px;font-weight:700;color:#065f46">' + list.length + '</div><div style="font-size:12px;color:#047857">ทั้งหมด</div></div>'
    + '<div style="padding:10px 20px;border-radius:8px;background:#dcfce7;border:1px solid #86efac;text-align:center"><div style="font-size:20px;font-weight:700;color:#16a34a">' + openCount + '</div><div style="font-size:12px;color:#16a34a">เปิดกิจการ</div></div>'
    + '<div style="padding:10px 20px;border-radius:8px;background:#fee2e2;border:1px solid #fca5a5;text-align:center"><div style="font-size:20px;font-weight:700;color:#dc2626">' + closedCount + '</div><div style="font-size:12px;color:#dc2626">ปิดกิจการ</div></div>'
    + '</div>';
  h += _custToolbar('เพิ่มสาขา', '_custBoothOpenForm()', '_custBoothCSV()', accent);

  if (!list.length) {
    h += _custEmpty('ยังไม่มีข้อมูลสาขา Booth', accent);
  } else {
    h += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px;min-width:1400px">';
    h += '<thead><tr style="background:#ecfdf5">';
    var cols = ['#','รหัสบูธ','ชื่อบูธ','ประเภท','รหัสบันทึกรับ','เขตการขาย','พนักงาน','รหัส พนง.','ชื่อ-นามสกุล','เบอร์โทรบูธ','เบอร์ส่วนตัว','ค่าเช่า/เดือน','เงินทอน','เลขบัญชี','สัญญา','สถานะ','จัดการ'];
    cols.forEach(function(c) { h += '<th style="padding:8px 6px;border:1px solid #d1fae5;text-align:left;white-space:nowrap;color:#065f46;font-size:11px">' + c + '</th>'; });
    h += '</tr></thead><tbody>';
    list.forEach(function(b, idx) {
      var isOpen = b.status && b.status.indexOf('เปิด') > -1;
      var stBg = isOpen ? '#dcfce7' : '#fee2e2';
      var stColor = isOpen ? '#16a34a' : '#dc2626';
      var stLabel = isOpen ? 'เปิดกิจการ' : (b.status || 'ปิดกิจการ');
      h += '<tr style="' + (idx % 2 ? 'background:#f0fdf4' : '') + '">';
      h += '<td style="padding:6px;border:1px solid #d1fae5;text-align:center">' + (idx+1) + '</td>';
      h += '<td style="padding:6px;border:1px solid #d1fae5;font-family:monospace">' + (b.branchId||'-') + '</td>';
      h += '<td style="padding:6px;border:1px solid #d1fae5;font-weight:600">' + (b.branchName||'-') + '</td>';
      h += '<td style="padding:6px;border:1px solid #d1fae5">' + (b.branchType||'-') + '</td>';
      h += '<td style="padding:6px;border:1px solid #d1fae5;text-align:center">' + (b.receiveCode||'-') + '</td>';
      h += '<td style="padding:6px;border:1px solid #d1fae5">' + (b.salesArea||'-') + '</td>';
      h += '<td style="padding:6px;border:1px solid #d1fae5;font-weight:600;color:#0369a1">' + (b.salesStaffName||'-') + '</td>';
      h += '<td style="padding:6px;border:1px solid #d1fae5;font-family:monospace;font-size:11px">' + (b.staffId||'-') + '</td>';
      h += '<td style="padding:6px;border:1px solid #d1fae5;font-size:11px">' + (b.staffFullName||'-') + '</td>';
      h += '<td style="padding:6px;border:1px solid #d1fae5">' + (b.storePhone||'-') + '</td>';
      h += '<td style="padding:6px;border:1px solid #d1fae5">' + (b.personalPhone||'-') + '</td>';
      h += '<td style="padding:6px;border:1px solid #d1fae5;text-align:right">' + (b.rentPerMonth ? Number(b.rentPerMonth).toLocaleString() : '-') + '</td>';
      h += '<td style="padding:6px;border:1px solid #d1fae5;text-align:right">' + (b.changeAtBranch ? Number(b.changeAtBranch).toLocaleString() : '-') + '</td>';
      h += '<td style="padding:6px;border:1px solid #d1fae5;font-size:10px;max-width:200px;overflow:hidden;text-overflow:ellipsis" title="' + (b.bankAccount||'').replace(/"/g,'&quot;') + '">' + (b.bankAccount||'-') + '</td>';
      h += '<td style="padding:6px;border:1px solid #d1fae5;font-size:11px">' + (b.contractInfo||'-') + '</td>';
      h += '<td style="padding:6px;border:1px solid #d1fae5;text-align:center"><span style="background:' + stBg + ';color:' + stColor + ';padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;white-space:nowrap">' + stLabel + '</span></td>';
      h += '<td style="padding:6px;border:1px solid #d1fae5;white-space:nowrap">';
      h += '<button onclick="_custBoothOpenForm(' + idx + ')" style="padding:3px 8px;border:none;border-radius:4px;background:#3b82f6;color:#fff;cursor:pointer;font-size:11px;margin-right:3px">✏️</button>';
      h += '<button onclick="_custBoothDelete(' + idx + ')" style="padding:3px 8px;border:none;border-radius:4px;background:#ef4444;color:#fff;cursor:pointer;font-size:11px">🗑️</button>';
      h += '</td></tr>';
    });
    h += '</tbody></table></div>';
  }
  h += '</div>';
  el.innerHTML = h;
}

function _custBoothOpenForm(editIdx) {
  var data = _getCustData();
  var list = _getBoothWithDefaults();
  var isEdit = typeof editIdx === 'number';
  var b = isEdit ? list[editIdx] : { id: _custId(), branchId: '', receiveCode: '', branchType: '', salesArea: '', branchName: '', salesStaffName: '', staffId: '', staffFullName: '', storePhone: '', personalPhone: '', rentPerMonth: '', changeAtBranch: '', contractInfo: '', bankAccount: '', receiveSchedule: '', status: 'เปิดกิจการอยู่', note: '' };

  var body = ''
    + _custField('รหัสบูธ', 'cf_brId', 'text', b.branchId, { required: true, placeholder: 'เช่น 10204' })
    + _custField('ชื่อบูธ', 'cf_brName', 'text', b.branchName, { required: true, placeholder: 'เช่น ร้านใหม่ (ปตท.คุณาวรรณ)' })
    + _custField('ประเภทบูธ', 'cf_brType', 'select', b.branchType, { options: ['', 'บูธหลัก', 'บูธชั่วคราว', 'บูธของเล่น'] })
    + _custField('รหัสบันทึกรับ', 'cf_recCode', 'text', b.receiveCode, { placeholder: 'เช่น 06' })
    + _custField('เขตการขาย', 'cf_salesArea', 'text', b.salesArea, { placeholder: 'เช่น บูธ รายวัน' })
    + _custField('ชื่อพนักงานบูธ', 'cf_staff', 'text', b.salesStaffName, { placeholder: 'เช่น พี่น้อย' })
    + _custField('รหัสพนักงาน', 'cf_staffId', 'text', b.staffId, { placeholder: 'เช่น 64120242' })
    + _custField('ชื่อ-นามสกุล', 'cf_staffFull', 'text', b.staffFullName, { placeholder: 'เช่น วัลนิภา ฤทธิ์ประดับ' })
    + _custField('เบอร์โทรบูธ', 'cf_storePhone', 'tel', b.storePhone)
    + _custField('เบอร์ส่วนตัว', 'cf_personalPhone', 'tel', b.personalPhone)
    + _custField('ค่าเช่า/เดือน', 'cf_rent', 'number', b.rentPerMonth, { placeholder: 'บาท' })
    + _custField('เงินทอน', 'cf_change', 'number', b.changeAtBranch, { placeholder: 'บาท' })
    + _custField('เลขบัญชีรับเงิน', 'cf_bank', 'text', b.bankAccount)
    + _custField('สัญญาบูธ', 'cf_contract', 'text', b.contractInfo, { placeholder: 'เช่น 244714' })
    + _custField('สถานะบูธ', 'cf_status', 'select', b.status, { options: ['เปิดกิจการอยู่', 'ปิดกิจการ'] })
    + _custField('หมายเหตุ', 'cf_note', 'text', b.note)
    + _custField('รอบรับสินค้า', 'cf_schedule', 'text', b.receiveSchedule, { placeholder: 'เช่น ทุกวันจันทร์' });

  _custOpenModal((isEdit ? '✏️ แก้ไขบูธ' : '➕ เพิ่มบูธ'), body, function() {
    var brId = document.getElementById('cf_brId').value.trim();
    var brName = document.getElementById('cf_brName').value.trim();
    if (!brId) { alert('กรุณากรอกรหัสบูธ'); return; }
    if (!brName) { alert('กรุณากรอกชื่อบูธ'); return; }

    var obj = {
      id: b.id,
      branchId: brId,
      branchName: brName,
      branchType: document.getElementById('cf_brType').value,
      receiveCode: document.getElementById('cf_recCode').value.trim(),
      salesArea: document.getElementById('cf_salesArea').value.trim(),
      salesStaffName: document.getElementById('cf_staff').value.trim(),
      staffId: document.getElementById('cf_staffId').value.trim(),
      staffFullName: document.getElementById('cf_staffFull').value.trim(),
      storePhone: document.getElementById('cf_storePhone').value.trim(),
      personalPhone: document.getElementById('cf_personalPhone').value.trim(),
      rentPerMonth: document.getElementById('cf_rent').value.trim(),
      changeAtBranch: document.getElementById('cf_change').value.trim(),
      bankAccount: document.getElementById('cf_bank').value.trim(),
      contractInfo: document.getElementById('cf_contract').value.trim(),
      status: document.getElementById('cf_status').value,
      note: document.getElementById('cf_note').value.trim(),
      receiveSchedule: document.getElementById('cf_schedule').value.trim()
    };

    if (isEdit) { data.booth[editIdx] = obj; }
    else { data.booth.push(obj); }
    _saveCustData();
    document.getElementById('custFormOverlay').remove();
    renderCustBooth();
  }, '#10b981');
}

function _custBoothDelete(idx) {
  var data = _getCustData();
  var b = data.booth[idx];
  if (!confirm('ลบบูธ "' + (b.branchName || b.branchId) + '" ?')) return;
  data.booth.splice(idx, 1);
  _saveCustData();
  renderCustBooth();
}

function _custBoothCSV() {
  var list = _getBoothWithDefaults();
  var headers = ['รหัสบูธ', 'ชื่อบูธ', 'ประเภทบูธ', 'รหัสบันทึกรับ', 'เขตการขาย', 'ชื่อพนักงานบูธ', 'รหัสพนักงาน', 'ชื่อ-นามสกุล', 'เบอร์โทรบูธ', 'เบอร์ส่วนตัว', 'ค่าเช่า/เดือน', 'เงินทอน', 'เลขบัญชีรับเงิน', 'สัญญาบูธ', 'สถานะบูธ', 'หมายเหตุ', 'รอบรับสินค้า'];
  var rows = list.map(function(b) {
    return [b.branchId, b.branchName, b.branchType, b.receiveCode, b.salesArea, b.salesStaffName, b.staffId, b.staffFullName, b.storePhone, b.personalPhone, b.rentPerMonth, b.changeAtBranch, b.bankAccount, b.contractInfo, b.status, b.note, b.receiveSchedule];
  });
  _custExportCSV(rows, headers, 'customer_booth_' + new Date().toISOString().slice(0, 10) + '.csv');
}


// ============================================================
// 4. ONLINE
// ============================================================
var _custOnlineFilter = 0; // 0=Facebook, 1=Line OA, 2=Marketplace

function renderCustOnline() {
  var el = document.getElementById('sm-cust-online');
  if (!el) return;
  var data = _getCustData();
  var accent = '#ec4899';

  var pills = [
    { label: '📘 Facebook', color: '#1877f2' },
    { label: '💚 Line OA', color: '#06c755' },
    { label: '🛍️ Shopee / Lazada / Tiktok', color: '#ee4d2d' }
  ];

  var h = '<div style="padding:20px">';
  h += '<h3 style="margin:0 0 16px;color:' + accent + '">🛒 Online — ข้อมูลลูกค้า</h3>';
  h += _custPills(pills, _custOnlineFilter, '_custOnlineSetFilter');

  if (_custOnlineFilter === 0) {
    h += _custOnlineRenderFB(data, accent);
  } else if (_custOnlineFilter === 1) {
    h += _custOnlineRenderLine(data, accent);
  } else {
    h += _custOnlineRenderMarket(data, accent);
  }

  h += '</div>';
  el.innerHTML = h;
}

function _custOnlineSetFilter(idx) {
  _custOnlineFilter = idx;
  renderCustOnline();
}

// --- Facebook ---
function _custOnlineRenderFB(data, accent) {
  var list = data.onlineFB || [];
  var h = _custToolbar('เพิ่มเพจ Facebook', '_custFBOpenForm()', '_custFBCSV()', '#1877f2');
  if (!list.length) {
    h += _custEmpty('ยังไม่มีข้อมูล Facebook', accent);
  } else {
    h += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">';
    h += '<thead><tr style="background:#eff6ff"><th style="padding:8px 10px;border:1px solid #dbeafe;text-align:left">#</th><th style="padding:8px 10px;border:1px solid #dbeafe;text-align:left">ชื่อเพจ</th><th style="padding:8px 10px;border:1px solid #dbeafe;text-align:left">ผู้ดูแล</th><th style="padding:8px 10px;border:1px solid #dbeafe;text-align:left">Username</th><th style="padding:8px 10px;border:1px solid #dbeafe;text-align:left">Password</th><th style="padding:8px 10px;border:1px solid #dbeafe;text-align:left">เลขบัญชี</th><th style="padding:8px 10px;border:1px solid #dbeafe;text-align:left">หมายเหตุ</th><th style="padding:8px 10px;border:1px solid #dbeafe;text-align:left">จัดการ</th></tr></thead><tbody>';
    list.forEach(function(r, idx) {
      h += '<tr><td style="padding:8px 10px;border:1px solid #dbeafe;text-align:center">' + (idx + 1) + '</td>';
      h += '<td style="padding:8px 10px;border:1px solid #dbeafe;font-weight:600">' + (r.pageName || '-') + '</td>';
      h += '<td style="padding:8px 10px;border:1px solid #dbeafe">' + (r.admin || '-') + '</td>';
      h += '<td style="padding:8px 10px;border:1px solid #dbeafe">' + (r.username || '-') + '</td>';
      h += '<td style="padding:8px 10px;border:1px solid #dbeafe;font-family:monospace;letter-spacing:2px">' + (r.password ? '********' : '-') + ' <button onclick="_custTogglePwd(this,\'' + String(r.password || '').replace(/'/g, "\\'") + '\')" style="border:none;background:none;cursor:pointer;font-size:11px" title="แสดง/ซ่อน">👁️</button></td>';
      h += '<td style="padding:8px 10px;border:1px solid #dbeafe">' + (r.bankAccount || '-') + '</td>';
      h += '<td style="padding:8px 10px;border:1px solid #dbeafe">' + (r.note || '-') + '</td>';
      h += '<td style="padding:8px 10px;border:1px solid #dbeafe;white-space:nowrap">';
      h += '<button onclick="_custFBOpenForm(' + idx + ')" style="padding:4px 10px;border:none;border-radius:4px;background:#3b82f6;color:#fff;cursor:pointer;font-size:12px;margin-right:4px">✏️</button>';
      h += '<button onclick="_custFBDelete(' + idx + ')" style="padding:4px 10px;border:none;border-radius:4px;background:#ef4444;color:#fff;cursor:pointer;font-size:12px">🗑️</button>';
      h += '</td></tr>';
    });
    h += '</tbody></table></div>';
  }
  return h;
}

function _custTogglePwd(btn, pwd) {
  var td = btn.parentElement;
  var showing = td.getAttribute('data-show') === '1';
  if (showing) {
    td.innerHTML = '********' + ' <button onclick="_custTogglePwd(this,\'' + pwd.replace(/'/g, "\\'") + '\')" style="border:none;background:none;cursor:pointer;font-size:11px" title="แสดง/ซ่อน">👁️</button>';
    td.style.fontFamily = 'monospace';
    td.style.letterSpacing = '2px';
    td.removeAttribute('data-show');
  } else {
    td.innerHTML = pwd + ' <button onclick="_custTogglePwd(this,\'' + pwd.replace(/'/g, "\\'") + '\')" style="border:none;background:none;cursor:pointer;font-size:11px" title="ซ่อน">🙈</button>';
    td.style.fontFamily = 'inherit';
    td.style.letterSpacing = 'normal';
    td.setAttribute('data-show', '1');
  }
}

function _custFBOpenForm(editIdx) {
  var data = _getCustData();
  var isEdit = typeof editIdx === 'number';
  var r = isEdit ? data.onlineFB[editIdx] : { id: _custId(), pageName: '', admin: '', username: '', password: '', bankAccount: '', note: '' };

  var body = ''
    + _custField('ชื่อเพจ', 'cf_pageName', 'text', r.pageName, { required: true, placeholder: 'เช่น WanWanach Official' })
    + _custField('ผู้ดูแล', 'cf_admin', 'text', r.admin)
    + _custField('Username', 'cf_user', 'text', r.username)
    + _custField('Password', 'cf_pwd', 'text', r.password)
    + _custField('เลขบัญชี', 'cf_bank', 'text', r.bankAccount)
    + _custField('หมายเหตุ', 'cf_note', 'text', r.note);

  _custOpenModal((isEdit ? '✏️ แก้ไข' : '➕ เพิ่ม') + ' Facebook Page', body, function() {
    var pageName = document.getElementById('cf_pageName').value.trim();
    if (!pageName) { alert('กรุณากรอกชื่อเพจ'); return; }
    var obj = {
      id: r.id,
      pageName: pageName,
      admin: document.getElementById('cf_admin').value.trim(),
      username: document.getElementById('cf_user').value.trim(),
      password: document.getElementById('cf_pwd').value.trim(),
      bankAccount: document.getElementById('cf_bank').value.trim(),
      note: document.getElementById('cf_note').value.trim()
    };
    if (isEdit) { data.onlineFB[editIdx] = obj; }
    else { data.onlineFB.push(obj); }
    _saveCustData();
    document.getElementById('custFormOverlay').remove();
    renderCustOnline();
  }, '#1877f2');
}

function _custFBDelete(idx) {
  var data = _getCustData();
  if (!confirm('ลบ "' + (data.onlineFB[idx].pageName || '') + '" ?')) return;
  data.onlineFB.splice(idx, 1);
  _saveCustData();
  renderCustOnline();
}

function _custFBCSV() {
  var data = _getCustData();
  var headers = ['ชื่อเพจ', 'ผู้ดูแล', 'Username', 'เลขบัญชี', 'หมายเหตุ'];
  var rows = (data.onlineFB || []).map(function(r) {
    return [r.pageName, r.admin, r.username, r.bankAccount, r.note];
  });
  _custExportCSV(rows, headers, 'customer_online_fb_' + new Date().toISOString().slice(0, 10) + '.csv');
}

// --- Line OA ---
function _custOnlineRenderLine(data, accent) {
  var list = data.onlineLine || [];
  var h = _custToolbar('เพิ่ม Line OA', '_custLineOpenForm()', '_custLineCSV()', '#06c755');
  if (!list.length) {
    h += _custEmpty('ยังไม่มีข้อมูล Line OA', accent);
  } else {
    h += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">';
    h += '<thead><tr style="background:#f0fdf4"><th style="padding:8px 10px;border:1px solid #d1fae5;text-align:left">#</th><th style="padding:8px 10px;border:1px solid #d1fae5;text-align:left">ชื่อไลน์</th><th style="padding:8px 10px;border:1px solid #d1fae5;text-align:left">ผู้ดูแล</th><th style="padding:8px 10px;border:1px solid #d1fae5;text-align:left">Username</th><th style="padding:8px 10px;border:1px solid #d1fae5;text-align:left">Password</th><th style="padding:8px 10px;border:1px solid #d1fae5;text-align:left">เลขบัญชี</th><th style="padding:8px 10px;border:1px solid #d1fae5;text-align:left">หมายเหตุ</th><th style="padding:8px 10px;border:1px solid #d1fae5;text-align:left">จัดการ</th></tr></thead><tbody>';
    list.forEach(function(r, idx) {
      h += '<tr><td style="padding:8px 10px;border:1px solid #d1fae5;text-align:center">' + (idx + 1) + '</td>';
      h += '<td style="padding:8px 10px;border:1px solid #d1fae5;font-weight:600">' + (r.lineName || '-') + '</td>';
      h += '<td style="padding:8px 10px;border:1px solid #d1fae5">' + (r.admin || '-') + '</td>';
      h += '<td style="padding:8px 10px;border:1px solid #d1fae5">' + (r.username || '-') + '</td>';
      h += '<td style="padding:8px 10px;border:1px solid #d1fae5;font-family:monospace;letter-spacing:2px">' + (r.password ? '********' : '-') + ' <button onclick="_custTogglePwd(this,\'' + String(r.password || '').replace(/'/g, "\\'") + '\')" style="border:none;background:none;cursor:pointer;font-size:11px" title="แสดง/ซ่อน">👁️</button></td>';
      h += '<td style="padding:8px 10px;border:1px solid #d1fae5">' + (r.bankAccount || '-') + '</td>';
      h += '<td style="padding:8px 10px;border:1px solid #d1fae5">' + (r.note || '-') + '</td>';
      h += '<td style="padding:8px 10px;border:1px solid #d1fae5;white-space:nowrap">';
      h += '<button onclick="_custLineOpenForm(' + idx + ')" style="padding:4px 10px;border:none;border-radius:4px;background:#3b82f6;color:#fff;cursor:pointer;font-size:12px;margin-right:4px">✏️</button>';
      h += '<button onclick="_custLineDelete(' + idx + ')" style="padding:4px 10px;border:none;border-radius:4px;background:#ef4444;color:#fff;cursor:pointer;font-size:12px">🗑️</button>';
      h += '</td></tr>';
    });
    h += '</tbody></table></div>';
  }
  return h;
}

function _custLineOpenForm(editIdx) {
  var data = _getCustData();
  var isEdit = typeof editIdx === 'number';
  var r = isEdit ? data.onlineLine[editIdx] : { id: _custId(), lineName: '', admin: '', username: '', password: '', bankAccount: '', note: '' };

  var body = ''
    + _custField('ชื่อไลน์', 'cf_lineName', 'text', r.lineName, { required: true, placeholder: 'เช่น @wanwanach' })
    + _custField('ผู้ดูแล', 'cf_admin', 'text', r.admin)
    + _custField('Username', 'cf_user', 'text', r.username)
    + _custField('Password', 'cf_pwd', 'text', r.password)
    + _custField('เลขบัญชี', 'cf_bank', 'text', r.bankAccount)
    + _custField('หมายเหตุ', 'cf_note', 'text', r.note);

  _custOpenModal((isEdit ? '✏️ แก้ไข' : '➕ เพิ่ม') + ' Line OA', body, function() {
    var lineName = document.getElementById('cf_lineName').value.trim();
    if (!lineName) { alert('กรุณากรอกชื่อไลน์'); return; }
    var obj = {
      id: r.id,
      lineName: lineName,
      admin: document.getElementById('cf_admin').value.trim(),
      username: document.getElementById('cf_user').value.trim(),
      password: document.getElementById('cf_pwd').value.trim(),
      bankAccount: document.getElementById('cf_bank').value.trim(),
      note: document.getElementById('cf_note').value.trim()
    };
    if (isEdit) { data.onlineLine[editIdx] = obj; }
    else { data.onlineLine.push(obj); }
    _saveCustData();
    document.getElementById('custFormOverlay').remove();
    renderCustOnline();
  }, '#06c755');
}

function _custLineDelete(idx) {
  var data = _getCustData();
  if (!confirm('ลบ "' + (data.onlineLine[idx].lineName || '') + '" ?')) return;
  data.onlineLine.splice(idx, 1);
  _saveCustData();
  renderCustOnline();
}

function _custLineCSV() {
  var data = _getCustData();
  var headers = ['ชื่อไลน์', 'ผู้ดูแล', 'Username', 'เลขบัญชี', 'หมายเหตุ'];
  var rows = (data.onlineLine || []).map(function(r) {
    return [r.lineName, r.admin, r.username, r.bankAccount, r.note];
  });
  _custExportCSV(rows, headers, 'customer_online_line_' + new Date().toISOString().slice(0, 10) + '.csv');
}

// --- Marketplace (Shopee / Lazada / Tiktok) ---
function _custOnlineRenderMarket(data, accent) {
  var list = data.onlineMarket || [];
  var h = _custToolbar('เพิ่มร้าน Marketplace', '_custMarketOpenForm()', '_custMarketCSV()', '#ee4d2d');
  if (!list.length) {
    h += _custEmpty('ยังไม่มีข้อมูล Marketplace', accent);
  } else {
    h += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">';
    h += '<thead><tr style="background:#fff5f5"><th style="padding:8px 10px;border:1px solid #fecdd3;text-align:left">#</th><th style="padding:8px 10px;border:1px solid #fecdd3;text-align:left">รหัสร้าน</th><th style="padding:8px 10px;border:1px solid #fecdd3;text-align:left">ชื่อร้าน</th><th style="padding:8px 10px;border:1px solid #fecdd3;text-align:left">ผู้ดูแล</th><th style="padding:8px 10px;border:1px solid #fecdd3;text-align:left">Username</th><th style="padding:8px 10px;border:1px solid #fecdd3;text-align:left">Password</th><th style="padding:8px 10px;border:1px solid #fecdd3;text-align:left">เลขบัญชี</th><th style="padding:8px 10px;border:1px solid #fecdd3;text-align:left">รอบตัดบัญชี</th><th style="padding:8px 10px;border:1px solid #fecdd3;text-align:left">ค่าธรรมเนียม %</th><th style="padding:8px 10px;border:1px solid #fecdd3;text-align:left">หมายเหตุ</th><th style="padding:8px 10px;border:1px solid #fecdd3;text-align:left">จัดการ</th></tr></thead><tbody>';
    list.forEach(function(r, idx) {
      h += '<tr><td style="padding:8px 10px;border:1px solid #fecdd3;text-align:center">' + (idx + 1) + '</td>';
      h += '<td style="padding:8px 10px;border:1px solid #fecdd3">' + (r.storeId || '-') + '</td>';
      h += '<td style="padding:8px 10px;border:1px solid #fecdd3;font-weight:600">' + (r.storeName || '-') + '</td>';
      h += '<td style="padding:8px 10px;border:1px solid #fecdd3">' + (r.admin || '-') + '</td>';
      h += '<td style="padding:8px 10px;border:1px solid #fecdd3">' + (r.username || '-') + '</td>';
      h += '<td style="padding:8px 10px;border:1px solid #fecdd3;font-family:monospace;letter-spacing:2px">' + (r.password ? '********' : '-') + ' <button onclick="_custTogglePwd(this,\'' + String(r.password || '').replace(/'/g, "\\'") + '\')" style="border:none;background:none;cursor:pointer;font-size:11px" title="แสดง/ซ่อน">👁️</button></td>';
      h += '<td style="padding:8px 10px;border:1px solid #fecdd3">' + (r.bankAccount || '-') + '</td>';
      h += '<td style="padding:8px 10px;border:1px solid #fecdd3">' + (r.billingCycle || '-') + '</td>';
      h += '<td style="padding:8px 10px;border:1px solid #fecdd3;text-align:right">' + (r.feePercent || '-') + '</td>';
      h += '<td style="padding:8px 10px;border:1px solid #fecdd3">' + (r.note || '-') + '</td>';
      h += '<td style="padding:8px 10px;border:1px solid #fecdd3;white-space:nowrap">';
      h += '<button onclick="_custMarketOpenForm(' + idx + ')" style="padding:4px 10px;border:none;border-radius:4px;background:#3b82f6;color:#fff;cursor:pointer;font-size:12px;margin-right:4px">✏️</button>';
      h += '<button onclick="_custMarketDelete(' + idx + ')" style="padding:4px 10px;border:none;border-radius:4px;background:#ef4444;color:#fff;cursor:pointer;font-size:12px">🗑️</button>';
      h += '</td></tr>';
    });
    h += '</tbody></table></div>';
  }
  return h;
}

function _custMarketOpenForm(editIdx) {
  var data = _getCustData();
  var isEdit = typeof editIdx === 'number';
  var r = isEdit ? data.onlineMarket[editIdx] : { id: _custId(), storeId: '', storeName: '', admin: '', username: '', password: '', bankAccount: '', billingCycle: '', feePercent: '', note: '' };

  var body = ''
    + _custField('รหัสร้าน', 'cf_storeId', 'text', r.storeId, { placeholder: 'เช่น SH001' })
    + _custField('ชื่อร้าน', 'cf_storeName', 'text', r.storeName, { required: true, placeholder: 'เช่น WanWanach Shopee' })
    + _custField('ผู้ดูแล', 'cf_admin', 'text', r.admin)
    + _custField('Username', 'cf_user', 'text', r.username)
    + _custField('Password', 'cf_pwd', 'text', r.password)
    + _custField('เลขบัญชี', 'cf_bank', 'text', r.bankAccount)
    + _custField('รอบตัดบัญชี', 'cf_billing', 'text', r.billingCycle, { placeholder: 'เช่น ทุก 15 วัน' })
    + _custField('ค่าธรรมเนียม %', 'cf_fee', 'number', r.feePercent, { placeholder: 'เช่น 3.5' })
    + _custField('หมายเหตุ', 'cf_note', 'text', r.note);

  _custOpenModal((isEdit ? '✏️ แก้ไข' : '➕ เพิ่ม') + ' Marketplace', body, function() {
    var storeName = document.getElementById('cf_storeName').value.trim();
    if (!storeName) { alert('กรุณากรอกชื่อร้าน'); return; }
    var obj = {
      id: r.id,
      storeId: document.getElementById('cf_storeId').value.trim(),
      storeName: storeName,
      admin: document.getElementById('cf_admin').value.trim(),
      username: document.getElementById('cf_user').value.trim(),
      password: document.getElementById('cf_pwd').value.trim(),
      bankAccount: document.getElementById('cf_bank').value.trim(),
      billingCycle: document.getElementById('cf_billing').value.trim(),
      feePercent: document.getElementById('cf_fee').value.trim(),
      note: document.getElementById('cf_note').value.trim()
    };
    if (isEdit) { data.onlineMarket[editIdx] = obj; }
    else { data.onlineMarket.push(obj); }
    _saveCustData();
    document.getElementById('custFormOverlay').remove();
    renderCustOnline();
  }, '#ee4d2d');
}

function _custMarketDelete(idx) {
  var data = _getCustData();
  if (!confirm('ลบ "' + (data.onlineMarket[idx].storeName || '') + '" ?')) return;
  data.onlineMarket.splice(idx, 1);
  _saveCustData();
  renderCustOnline();
}

function _custMarketCSV() {
  var data = _getCustData();
  var headers = ['รหัสร้าน', 'ชื่อร้าน', 'ผู้ดูแล', 'Username', 'เลขบัญชี', 'รอบตัดบัญชี', 'ค่าธรรมเนียม %', 'หมายเหตุ'];
  var rows = (data.onlineMarket || []).map(function(r) {
    return [r.storeId, r.storeName, r.admin, r.username, r.bankAccount, r.billingCycle, r.feePercent, r.note];
  });
  _custExportCSV(rows, headers, 'customer_online_market_' + new Date().toISOString().slice(0, 10) + '.csv');
}
