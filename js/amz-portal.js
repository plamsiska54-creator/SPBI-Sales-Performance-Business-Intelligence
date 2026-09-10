// ============================================================
// AMZ-PORTAL.JS — Amazon sub-tab renderers (Target, Cust Analysis, Team)
// ============================================================

(function () {
  'use strict';

  var AMZ_MONTHS_ALL = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];
  var AMZ_MONTH_TH_ALL = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.'];
  var AMZ_MONTHS = AMZ_MONTHS_ALL;
  var AMZ_MONTH_TH = AMZ_MONTH_TH_ALL;

  var _amzYear = '2026';
  var _amzPeriod = 'all';
  function _amzGetFilteredMonths() {
    var now = new Date();
    var mo = now.getMonth(); // 0-based
    var maxIdx = AMZ_MONTHS_ALL.length - 1;
    if (_amzPeriod === 'thismonth') {
      var idx = Math.min(mo, maxIdx);
      return { months: [AMZ_MONTHS_ALL[idx]], labels: [AMZ_MONTH_TH_ALL[idx]] };
    }
    if (_amzPeriod === 'lastmonth') {
      var idx = Math.min(mo - 1, maxIdx);
      if (idx < 0) idx = 0;
      return { months: [AMZ_MONTHS_ALL[idx]], labels: [AMZ_MONTH_TH_ALL[idx]] };
    }
    if (_amzPeriod === 'q1') return { months: ['Jan','Feb','Mar'], labels: ['ม.ค.','ก.พ.','มี.ค.'] };
    if (_amzPeriod === 'q2') return { months: ['Apr','May','Jun'], labels: ['เม.ย.','พ.ค.','มิ.ย.'] };
    if (_amzPeriod === 'q3') return { months: ['Jul'], labels: ['ก.ค.'] };
    if (_amzPeriod === 'q4') return { months: [], labels: [] };
    return { months: AMZ_MONTHS_ALL, labels: AMZ_MONTH_TH_ALL };
  }

  var _MO_TH = ['','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

  var _MON_IDX = {Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12'};
  function _amzGetYearMonths() {
    if (typeof AMZ_ORDER_DATA === 'undefined') return [];
    var all = AMZ_ORDER_DATA.months || [];
    var byYear = (_amzYear === 'all') ? all : all.filter(function(ym) { return ym.indexOf(_amzYear) === 0; });
    if (_amzPeriod === 'all') return byYear;
    var now = new Date();
    var curMo = ('0' + (now.getMonth() + 1)).slice(-2);
    var prevMo = ('0' + now.getMonth()).slice(-2);
    var allowed;
    if (_amzPeriod === 'thismonth') allowed = [curMo];
    else if (_amzPeriod === 'lastmonth') allowed = [prevMo];
    else if (_amzPeriod === 'q1') allowed = ['01','02','03'];
    else if (_amzPeriod === 'q2') allowed = ['04','05','06'];
    else if (_amzPeriod === 'q3') allowed = ['07','08','09'];
    else if (_amzPeriod === 'q4') allowed = ['10','11','12'];
    else if (_MON_IDX[_amzPeriod]) allowed = [_MON_IDX[_amzPeriod]];
    else return byYear;
    return byYear.filter(function(ym) { return allowed.indexOf(ym.split('-')[1]) >= 0; });
  }

  function _amzYmLabel(ym) {
    var parts = ym.split('-');
    return _MO_TH[parseInt(parts[1])] + ' ' + (parseInt(parts[0]) + 543 - 2500);
  }

  function _amzPeriodInfoText() {
    var months = _amzGetYearMonths();
    if (!months.length) return '';
    if (_amzYear === 'all') return 'กำลังแสดง: ทั้งหมด (' + _amzYmLabel(months[0]) + ' – ' + _amzYmLabel(months[months.length-1]) + ')';
    var be = parseInt(_amzYear) + 543;
    var f = _amzGetFilteredMonths();
    var thisLabel = f.labels.length === 1 ? f.labels[0] + ' ' + be : f.labels[0] + '–' + f.labels[f.labels.length-1] + ' ' + be;
    var infoMap = { all: _amzYmLabel(months[0]) + ' – ' + _amzYmLabel(months[months.length-1]), thismonth: thisLabel, lastmonth: thisLabel, q1:'Q1 ม.ค.–มี.ค. '+be, q2:'Q2 เม.ย.–มิ.ย. '+be, q3:'Q3 ก.ค.–ก.ย. '+be, q4:'Q4 ต.ค.–ธ.ค. '+be };
    return 'กำลังแสดง: ' + (infoMap[_amzPeriod] || 'ทั้งหมด');
  }

  window.amzSetPeriod = function(p, btn) {
    _amzPeriod = p;
    document.querySelectorAll('#amzPeriodBtns .period-type-btn').forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    var m = document.getElementById('amzQtrMenu'); if(m) m.style.display='none';
    var m2 = document.getElementById('amzYearMenu'); if(m2) m2.style.display='none';
    _amzApplyPeriod();
  };
  window.amzToggleQtrMenu = function(btn) {
    var m = document.getElementById('amzQtrMenu');
    if(m) m.style.display = m.style.display==='none'?'block':'none';
    var m2 = document.getElementById('amzYearMenu'); if(m2) m2.style.display='none';
  };
  window.amzPickQtr = function(q, btn) {
    _amzPeriod = q;
    document.querySelectorAll('#amzPeriodBtns .period-type-btn').forEach(function(b){ b.classList.remove('active'); });
    var dd = document.getElementById('amzQtrDropdown');
    if(dd) dd.querySelector('.period-type-btn').classList.add('active');
    document.querySelectorAll('#amzQtrMenu .qmenu-item').forEach(function(b){ b.classList.remove('active'); });
    if(btn) btn.classList.add('active');
    var label = document.getElementById('amzQtrLabel');
    if(label) label.textContent = btn ? btn.textContent : '📆 รายไตรมาส';
    var m = document.getElementById('amzQtrMenu'); if(m) m.style.display='none';
    _amzApplyPeriod();
  };
  window.amzToggleYearMenu = function(btn) {
    var m = document.getElementById('amzYearMenu');
    if(m) m.style.display = m.style.display==='none'?'block':'none';
    var m2 = document.getElementById('amzQtrMenu'); if(m2) m2.style.display='none';
  };
  window.amzPickYear = function(y, btn) {
    _amzYear = String(y);
    _amzPeriod = 'all';
    document.querySelectorAll('#amzPeriodBtns .period-type-btn').forEach(function(b){ b.classList.remove('active'); });
    var dd = document.getElementById('amzYearDropdown');
    if(dd) dd.querySelector('.period-type-btn').classList.add('active');
    document.querySelectorAll('#amzYearMenu .qmenu-item').forEach(function(b){ b.classList.remove('active'); });
    if(btn) btn.classList.add('active');
    var label = document.getElementById('amzYearLabel');
    if(label) label.textContent = y === 'all' ? '📅 ทั้งหมด (5 ปี)' : '📅 ปี ' + (parseInt(y) + 543);
    var m = document.getElementById('amzYearMenu'); if(m) m.style.display='none';
    _amzApplyPeriod();
  };

  // ===== Month dropdown (Dashboard) =====
  window.amzToggleMoMenu = function(btn) {
    var m = document.getElementById('amzMonthMenu');
    if(m) m.style.display = m.style.display==='none'?'block':'none';
    var m2 = document.getElementById('amzQtrMenu'); if(m2) m2.style.display='none';
    var m3 = document.getElementById('amzYearMenu'); if(m3) m3.style.display='none';
  };
  window.amzPickMonth = function(mo, btn) {
    var ML = {Jan:'ม.ค.',Feb:'ก.พ.',Mar:'มี.ค.',Apr:'เม.ย.',May:'พ.ค.',Jun:'มิ.ย.',Jul:'ก.ค.',Aug:'ส.ค.',Sep:'ก.ย.',Oct:'ต.ค.',Nov:'พ.ย.',Dec:'ธ.ค.'};
    _amzPeriod = mo;
    document.querySelectorAll('#amzPeriodBtns .period-type-btn').forEach(function(b){ b.classList.remove('active'); });
    var dd = document.getElementById('amzMonthDropdown');
    if(dd) dd.querySelector('.period-type-btn').classList.add('active');
    document.querySelectorAll('#amzMonthMenu .qmenu-item').forEach(function(b){ b.classList.remove('active'); });
    if(btn) btn.classList.add('active');
    var label = document.getElementById('amzMonthLabel');
    if(label) label.textContent = '📅 ' + ML[mo];
    var ql = document.getElementById('amzQtrLabel'); if(ql) ql.textContent = '📆 รายไตรมาส';
    var yl = document.getElementById('amzYearLabel'); if(yl) yl.textContent = '📅 รายปี';
    var m = document.getElementById('amzMonthMenu'); if(m) m.style.display='none';
    _amzApplyPeriod();
  };

  function _amzApplyPeriod() {
    var f = _amzGetFilteredMonths();
    AMZ_MONTHS = f.months;
    AMZ_MONTH_TH = f.labels;
    var info = document.getElementById('amzPeriodInfo');
    if(info) info.textContent = _amzPeriodInfoText();
    _dashboardRendered = false;
    _sovBranchRendered = false;
    _sovExploreRendered = false;
    _salesPageRendered = false;
    _targetPageRendered = false;
    _orderRendered = false;
    _amzComplaintRendered = false;
    if (_sovExploreMap) { _sovExploreMap.remove(); _sovExploreMap = null; }
    // re-render the currently active page
    var nav = _amzFindNav(_amzBiCurrent);
    if (nav && nav.render && typeof window[nav.render] === 'function') {
      window[nav.render]();
    } else {
      window.renderAmzDashboard();
    }
  }
  var AMZ_CHANNELS = ['OR','ร้านของฝาก','RM','Amazon','ลูกค้าทั่วไป','Black Canyon'];

  function fmt(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(2) + ' M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + ' K';
    return n.toLocaleString();
  }
  function pct(a, t) { return t > 0 ? ((a / t) * 100).toFixed(1) : '0.0'; }

  function getAmzSalesData() {
    if (typeof _D2569 === 'undefined' || !_D2569.AMZ_CUST) return null;
    return _D2569.AMZ_CUST; // nested: { Jan: { OR: {t,a}, ... }, Feb: ... }
  }
  function getVal(data, mo, ch) {
    if (!data || !data[mo] || !data[mo][ch]) return { t: 0, a: 0 };
    return data[mo][ch];
  }

  function kpiCard(icon, label, value, sub, color) {
    return '<div class="kpi-box" style="border-top:3px solid ' + color + '">'
      + '<div style="font-size:22px">' + icon + '</div>'
      + '<div style="font-size:22px;font-weight:900;color:' + color + '">' + value + '</div>'
      + '<div style="font-size:12px;color:#64748b;font-weight:600">' + label + '</div>'
      + '<div style="font-size:11px;color:#94a3b8">' + sub + '</div>'
      + '</div>';
  }

  var _charts = {};
  function mkChart(id, cfg) {
    var el = document.getElementById(id);
    if (!el) return null;
    if (_charts[id]) _charts[id].destroy();
    _charts[id] = new Chart(el.getContext('2d'), cfg);
    return _charts[id];
  }

  // ---- Shared ----
  var palette = ['#ea580c', '#2563eb', '#16a34a', '#7c3aed', '#0891b2', '#d97706'];

  function _amzFilteredChannels() {
    var filter = AMZ_CH_MAP[_amzCh];
    if (!filter) return AMZ_CHANNELS;
    return AMZ_CHANNELS.filter(function (ch) { return filter.indexOf(ch) >= 0; });
  }

  function _amzComputeChannels(data) {
    var channels = _amzFilteredChannels();
    var grandT = 0, grandA = 0;
    var chData = channels.map(function (ch) {
      var i = AMZ_CHANNELS.indexOf(ch);
      var chT = 0, chA = 0;
      AMZ_MONTHS.forEach(function (mo) { var v = getVal(data, mo, ch); chT += v.t; chA += v.a; });
      grandT += chT; grandA += chA;
      return { ch: ch, t: chT, a: chA, color: palette[i >= 0 ? i : 0] };
    });
    return { chData: chData, grandT: grandT, grandA: grandA };
  }

  // ---- Amazon BI Sidebar Navigation + Channel Switching ----
  var _amzCh = 'All';
  var _amzBiCurrent = 'dashboard';
  var _amzBiCatOpen = {};

  var AMZ_CH_MAP = {
    'All':         null,
    'Amazon':      ['OR', 'Amazon', 'RM'],
    'Souvenir':    ['ร้านของฝาก', 'ลูกค้าทั่วไป'],
    'BlackCanyon': ['Black Canyon']
  };

  var AMZ_NAV_CATS = [
    {key:'dashboard', icon:'📊', label:'แดชบอร์ด', items:[
      {key:'dashboard', label:'ภาพรวม', sub:'amz-dashboard', render:'renderAmzDashboard'}
    ]},
    {key:'sales', icon:'💰', label:'ยอดขาย', items:[
      {key:'sales-perf', label:'ผลงานยอดขาย', sub:'amz-sales', render:'renderAmzSalesPage'},
      {key:'sales-target', label:'เป้าหมายยอดขาย', sub:'amz-target', render:'renderAmzTargetPage'}
    ]},
    {key:'customer', icon:'👥', label:'ลูกค้า', items:[
      {key:'cust-new', label:'ลูกค้าใหม่/หาย', sub:'amz-customers', render:'renderAmzCustomers'},
      {key:'cust-analysis', label:'วิเคราะห์ลูกค้า', sub:'amz-cust-analysis', render:'renderAmzCustAnalysis'}
    ]},
    {key:'product', icon:'🍞', label:'สินค้า', items:[
      {key:'prod-list', label:'ผลงานสินค้า', sub:'amz-products', render:'renderAmzProducts'},
      {key:'prod-analysis', label:'วิเคราะห์สินค้า', sub:'amz-product-analysis', render:'renderAmzProdAnalysis'}
    ]},
    {key:'souvenir', icon:'📦', label:'ซัพพลายเชน', items:[
      {key:'order', label:'คำสั่งซื้อ', sub:'amz-order', render:'renderAmzOrder'},
      {key:'sov-order', label:'คำสั่งซื้อ', sub:'amz-order', render:'renderSovOrder'},
      {key:'map', label:'Map Wanwanach', sub:'amz-map', render:'renderMapTierKPI'},
      {key:'branches', label:'สาขาคาเฟ่ อเมซอน', sub:'amz-branches', render:'renderAmzBranchesReset'},
      {key:'sov-branches', label:'สาขาร้านของฝาก', sub:'amz-branches', render:'renderSovBranches'},
      {key:'sov-explore', label:'สำรวจร้านของฝากทั่วประเทศ', sub:'amz-sov-explore', render:'renderSovExplore'}
    ]},
    {key:'report', icon:'📈', label:'ตัวชี้วัด & รายงาน', items:[
      {key:'kpi', label:'ตัวชี้วัด', sub:'amz-kpi', render:'renderAmzKPI'},
      {key:'forecast', label:'พยากรณ์', sub:'amz-forecast', render:'renderAmzForecast'}
    ]},
    {key:'ai', icon:'🤖', label:'วิเคราะห์ AI', items:[
      {key:'ai-insight', label:'AI Insight', sub:'amz-ai', render:'renderAmzAI'}
    ]}
  ];

  function _amzFindNav(key) {
    for (var c = 0; c < AMZ_NAV_CATS.length; c++) {
      var cat = AMZ_NAV_CATS[c];
      for (var i = 0; i < cat.items.length; i++) {
        if (cat.items[i].key === key) return cat.items[i];
      }
    }
    return null;
  }

  window.amzClickVisit = function (el) {
    if (typeof _amzApiHide === 'function') _amzApiHide();
    document.querySelectorAll('#amzChannelTabs .sub-tab').forEach(function (t) { t.classList.remove('active'); });
    if (el) el.classList.add('active');
    _amzCh = 'All';
    _amzBiCurrent = 'cust-visit';
    _amzShowDirect('amz-visit-tracker', 'renderAmzVisitTracker');
  };

  function _amzShowDirect(subId, renderFn) {
    var section = document.getElementById('tab-amazon');
    if (!section) return;
    section.querySelectorAll('.sub-section').forEach(function (s) { s.classList.remove('active'); });
    var target = document.getElementById(subId);
    if (target) target.classList.add('active');
    // Hide portal sidebar + period filter, show content full width
    var sidebar = document.getElementById('amzBiSidebar');
    var content = document.getElementById('amzBiContent');
    var periodBar = document.getElementById('amzPeriodBar');
    if (sidebar) sidebar.style.display = 'none';
    if (content) content.style.gridColumn = '1 / -1';
    if (periodBar) periodBar.style.display = 'none';
    if (renderFn && typeof window[renderFn] === 'function') window[renderFn]();
  }

  function _amzRestoreLayout() {
    var sidebar = document.getElementById('amzBiSidebar');
    var content = document.getElementById('amzBiContent');
    var periodBar = document.getElementById('amzPeriodBar');
    if (sidebar) sidebar.style.display = '';
    if (content) content.style.gridColumn = '';
    if (periodBar) periodBar.style.display = '';
  }

  var _origBranchHTML = null;
  function _restoreBranchHTML() {
    var el = document.getElementById('amz-branches');
    if (el && _origBranchHTML) el.innerHTML = _origBranchHTML;
  }

  window.amzClickTeam = function (el) {
    if (typeof _amzApiHide === 'function') _amzApiHide();
    document.querySelectorAll('#amzChannelTabs .sub-tab').forEach(function (t) { t.classList.remove('active'); });
    _amzCh = 'All';
    _amzBiCurrent = 'team-info';
    _teamRendered = false;
    _amzShowDirect('amz-team', 'renderAmzTeam');
  };

  window.amzClickComplaint = function (el) {
    if (typeof _amzApiHide === 'function') _amzApiHide();
    document.querySelectorAll('#amzChannelTabs .sub-tab').forEach(function (t) { t.classList.remove('active'); });
    _amzCh = 'All';
    _amzBiCurrent = 'complaint';
    _amzShowDirect('amz-complaint', 'renderAmzComplaint');
  };

  window.amzClickChannel = function (el, ch) {
    if (typeof _amzApiHide === 'function') _amzApiHide();
    document.querySelectorAll('#amzChannelTabs .sub-tab').forEach(function (t) { t.classList.remove('active'); });
    el.classList.add('active');
    _amzCh = ch;
    _dashboardRendered = false;
    _branchRendered = false;
    _sovBranchRendered = false;
    _sovExploreRendered = false;
    _amzRestoreLayout();
    _restoreBranchHTML();
    if (_sovExploreMap) { _sovExploreMap.remove(); _sovExploreMap = null; }
    if (_amzBranchMap) { _amzBranchMap.remove(); _amzBranchMap = null; }
    amzBiSelectMenu('dashboard');
  };

  function _amzItemVisible(itemKey) {
    var isSov = _amzCh === 'Souvenir';
    var isBC = _amzCh === 'BlackCanyon';
    if (itemKey === 'order' || itemKey === 'map' || itemKey === 'branches') {
      if (isSov) return false;
    }
    if (itemKey === 'sov-order' || itemKey === 'sov-branches' || itemKey === 'sov-explore') {
      if (!isSov) return false;
    }
    if (itemKey === 'map') {
      if (isBC) return false;
    }
    if (isBC) {
      if (itemKey === 'cust-new' || itemKey === 'cust-analysis' || itemKey === 'prod-analysis') return false;
    }
    return true;
  }

  window.amzBiRenderSidebar = function () {
    var el = document.getElementById('amzBiSidebar');
    if (!el) return;
    var html = '<div style="padding:10px 16px 14px;font-size:11px;font-weight:800;color:var(--muted);letter-spacing:1px;text-transform:uppercase">NAVIGATION</div>';

    AMZ_NAV_CATS.forEach(function (cat) {
      var visItems = cat.items.filter(function (it) { return _amzItemVisible(it.key); });
      if (!visItems.length) return;
      var hasActive = visItems.some(function (it) { return it.key === _amzBiCurrent; });
      var isOpen = _amzBiCatOpen[cat.key] !== undefined ? _amzBiCatOpen[cat.key] : hasActive || cat.key === 'dashboard';

      if (visItems.length === 1) {
        var item = visItems[0];
        var active = item.key === _amzBiCurrent;
        html += '<div class="mtbi-nav-item' + (active ? ' active' : '') + '" onclick="amzBiSelectMenu(\'' + item.key + '\')">';
        html += '<span class="mtbi-nav-icon">' + cat.icon + '</span><span>' + (visItems.length === cat.items.length ? cat.label : item.label) + '</span></div>';
      } else {
        html += '<div class="mtbi-nav-cat' + (hasActive ? ' has-active' : '') + '">';
        html += '<div class="mtbi-nav-cat-header" onclick="amzBiToggleCat(\'' + cat.key + '\')">';
        html += '<span class="mtbi-nav-icon">' + cat.icon + '</span><span>' + cat.label + '</span>';
        html += '<span class="mtbi-nav-arrow">' + (isOpen ? '▾' : '▸') + '</span></div>';
        if (isOpen) {
          html += '<div class="mtbi-nav-sub">';
          visItems.forEach(function (item) {
            var active = item.key === _amzBiCurrent;
            html += '<div class="mtbi-nav-sub-item' + (active ? ' active' : '') + '" onclick="amzBiSelectMenu(\'' + item.key + '\')">';
            html += item.label + '</div>';
          });
          html += '</div>';
        }
        html += '</div>';
      }
    });

    el.innerHTML = html;
  }

  window.amzBiToggleCat = function (catKey) {
    var isOpen = _amzBiCatOpen[catKey];
    if (isOpen === undefined) {
      var cat = AMZ_NAV_CATS.find(function (c) { return c.key === catKey; });
      var hasActive = cat && cat.items.some(function (it) { return it.key === _amzBiCurrent; });
      isOpen = hasActive;
    }
    _amzBiCatOpen[catKey] = !isOpen;
    amzBiRenderSidebar();
  };

  window.amzBiSelectMenu = function (key) {
    _amzBiCurrent = key;
    var nav = _amzFindNav(key);
    if (!nav) return;

    AMZ_NAV_CATS.forEach(function (cat) {
      if (cat.items.some(function (it) { return it.key === key; })) {
        _amzBiCatOpen[cat.key] = true;
      }
    });

    var section = document.getElementById('tab-amazon');
    if (!section) return;
    section.querySelectorAll('.sub-section').forEach(function (s) { s.classList.remove('active'); });
    var target = document.getElementById(nav.sub);
    if (target) target.classList.add('active');

    if (nav.render && typeof window[nav.render] === 'function') {
      if (nav.render === 'renderAmzDashboard') _dashboardRendered = false;
      window[nav.render]();
    }

    amzBiRenderSidebar();
  };

  window.amzGetChannel = function () { return _amzCh; };
  window.amzGetChannelFilter = function () { return AMZ_CH_MAP[_amzCh] || null; };

  // ---- RENDER: ร้านของฝาก wrappers ----
  function _sovSwitchChannel() {
    _amzCh = 'Souvenir';
    _dashboardRendered = false;
    var tabs = document.querySelectorAll('#amzChannelTabs .sub-tab');
    tabs.forEach(function (t, i) {
      t.classList.remove('active');
      if (i === 2) t.classList.add('active');
    });
  }
  // คำนวณยอดขาย SOV ตามช่วงเวลาที่เลือก
  function _sovFilteredTotal(c) {
    if (!c.s || !c.s.length) return c.t || 0;
    var filtered = _amzGetFilteredMonths();
    if (filtered.months.length === AMZ_MONTHS_ALL.length) return c.t || 0;
    var total = 0;
    filtered.months.forEach(function (m) {
      var idx = AMZ_MONTHS_ALL.indexOf(m);
      if (idx >= 0 && idx < c.s.length) total += (c.s[idx] || 0);
    });
    return total;
  }

  function _sovPeriodLabel() {
    var f = _amzGetFilteredMonths();
    if (f.labels.length === AMZ_MONTHS_ALL.length) return 'ม.ค. – ก.ค. 69';
    if (f.labels.length === 1) return f.labels[0] + ' 69';
    return f.labels[0] + ' – ' + f.labels[f.labels.length - 1] + ' 69';
  }

  window.renderSovOrder = function () {
    _sovSwitchChannel();
    renderAmzOrder();
  };
  window.renderAmzBranchesReset = function () {
    _restoreBranchHTML();
    _branchRendered = false;
    _sovBranchRendered = false;
    if (_amzBranchMap) { _amzBranchMap.remove(); _amzBranchMap = null; }
    renderAmzBranches();
  };
  var _sovBranchRendered = false;
  window.renderSovBranches = function () {
    _sovSwitchChannel();
    if (_sovBranchRendered) return;
    _sovBranchRendered = true;
    _branchRendered = false;
    if (_amzBranchMap) { _amzBranchMap.remove(); _amzBranchMap = null; }

    var sovData = (typeof AMZ_CUST_DATA !== 'undefined' && AMZ_CUST_DATA.SOV) ? AMZ_CUST_DATA.SOV : [];
    var months = (typeof AMZ_CUST_DATA !== 'undefined' && AMZ_CUST_DATA.MONTHS) ? AMZ_CUST_DATA.MONTHS : [];
    var customers = sovData.filter(function (c) { return c.c !== 'Grand Total'; });
    if (!customers.length) return;

    var container = document.getElementById('amz-branches');
    if (!container) return;
    if (!_origBranchHTML) _origBranchHTML = container.innerHTML;

    // --- KPI ---
    var total = customers.length;
    var provCount = {};
    customers.forEach(function (c) {
      var p = c.p || 'ไม่ระบุ';
      provCount[p] = (provCount[p] || 0) + 1;
    });
    var provList = Object.keys(provCount);
    var totalProv = provList.length;
    var topProv = provList.sort(function (a, b) { return provCount[b] - provCount[a]; })[0] || '-';

    var totalSales = 0;
    customers.forEach(function (c) { totalSales += _sovFilteredTotal(c); });
    var periodLabel = _sovPeriodLabel();

    // --- Build HTML ---
    var html = '<div class="kpi-grid" id="sovBranchKPI">'
      + kpiCard('🎁', 'ร้านของฝากทั้งหมด', total + ' ร้าน', 'ลูกค้าช่องทางร้านของฝาก', '#ea580c')
      + kpiCard('🗺️', 'จำนวนจังหวัด', totalProv + ' จังหวัด', 'พื้นที่กระจายสินค้า', '#2563eb')
      + kpiCard('🏆', 'จังหวัดร้านสูงสุด', topProv, (provCount[topProv] || 0) + ' ร้าน', '#16a34a')
      + kpiCard('💰', 'ยอดขายรวม', (totalSales / 1e6).toFixed(2) + ' ล้าน', periodLabel, '#7c3aed')
      + '</div>';

    // Filter
    html += '<div id="sovBranchFilter" style="display:flex;gap:10px;margin:12px 0;flex-wrap:wrap;align-items:center">'
      + '<label style="font-size:13px;font-weight:600;color:var(--text)">🔍 กรอง:</label>'
      + '<select id="sovFilterProv" onchange="sovFilterBranches()" style="border:1.5px solid var(--border);border-radius:8px;padding:6px 12px;font-size:12px;background:var(--bg);color:var(--text);outline:none;min-width:160px">'
      + '<option value="">ทุกจังหวัด</option>' + provList.map(function (p) { return '<option value="' + p + '">' + p + ' (' + provCount[p] + ')</option>'; }).join('') + '</select>'
      + '<input id="sovBranchSearch" type="text" placeholder="ค้นหาร้าน..." oninput="sovFilterBranches()" style="border:1.5px solid var(--border);border-radius:8px;padding:6px 12px;font-size:12px;width:200px;background:var(--bg);outline:none;color:var(--text)" onfocus="this.style.borderColor=\'var(--accent)\'" onblur="this.style.borderColor=\'var(--border)\'">'
      + '<button onclick="document.getElementById(\'sovFilterProv\').value=\'\';document.getElementById(\'sovBranchSearch\').value=\'\';sovFilterBranches()" style="border:1.5px solid var(--border);border-radius:8px;padding:6px 14px;font-size:12px;background:var(--bg);color:var(--accent);cursor:pointer;font-weight:600">↺ รีเซ็ต</button>'
      + '<span id="sovFilterCount" style="font-size:12px;color:#64748b;margin-left:auto"></span>'
      + '</div>';

    // Charts
    html += '<div class="row cols2"><div class="card"><div class="card-title">จำนวนร้านแยกจังหวัด</div><div class="chart-wrap h260"><canvas id="sovBranchProvChart"></canvas></div></div>'
      + '<div class="card"><div class="card-title">ยอดขายแยกจังหวัด (บาท)</div><div class="chart-wrap h260"><canvas id="sovBranchSalesChart"></canvas></div></div></div>';

    // Table
    html += '<div class="card" style="margin-top:16px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><div class="card-title" style="margin:0">รายชื่อร้านของฝาก</div></div>'
      + '<div class="table-wrap"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:#eff6ff;font-size:12px;color:#1e40af">'
      + '<th style="padding:8px 10px;text-align:left">No.</th>'
      + '<th style="padding:8px 10px;text-align:left">รหัส</th>'
      + '<th style="padding:8px 10px;text-align:left">ชื่อร้าน</th>'
      + '<th style="padding:8px 10px;text-align:left">จังหวัด</th>'
      + '<th style="padding:8px 10px;text-align:left">อำเภอ</th>'
      + '<th style="padding:8px 10px;text-align:right">ยอดขายรวม</th>'
      + '<th style="padding:8px 10px;text-align:center">สถานะ</th>'
      + '</tr></thead><tbody id="sovBranchTableBody"></tbody></table></div></div>';

    container.innerHTML = html;

    // Store data for filtering
    window._sovCustomers = customers;

    // Province bar chart
    var provSorted = Object.keys(provCount).sort(function (a, b) { return provCount[b] - provCount[a]; });
    var provColors = provSorted.map(function (_, i) { return 'hsl(' + (20 + i * 25) + ',75%,55%)'; });
    mkChart('sovBranchProvChart', {
      type: 'bar',
      data: {
        labels: provSorted,
        datasets: [{ label: 'จำนวนร้าน', data: provSorted.map(function (p) { return provCount[p]; }), backgroundColor: provColors, borderRadius: 5 }]
      },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { stepSize: 1 } } } }
    });

    // Sales by province chart
    var salesByProv = {};
    customers.forEach(function (c) { var p = c.p || 'ไม่ระบุ'; salesByProv[p] = (salesByProv[p] || 0) + _sovFilteredTotal(c); });
    var salesProvSorted = Object.keys(salesByProv).sort(function (a, b) { return salesByProv[b] - salesByProv[a]; });
    mkChart('sovBranchSalesChart', {
      type: 'bar',
      data: {
        labels: salesProvSorted,
        datasets: [{ label: 'ยอดขาย (บาท)', data: salesProvSorted.map(function (p) { return salesByProv[p]; }), backgroundColor: '#7c3aed', borderRadius: 5 }]
      },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { callback: function (v) { return (v / 1000).toFixed(0) + 'k'; } } } } }
    });

    // Render table
    sovFilterBranches();
  };

  window.sovFilterBranches = function () {
    var customers = window._sovCustomers || [];
    var provVal = (document.getElementById('sovFilterProv') || {}).value || '';
    var searchVal = ((document.getElementById('sovBranchSearch') || {}).value || '').toLowerCase();

    var filtered = customers.filter(function (c) {
      if (provVal && c.p !== provVal) return false;
      if (searchVal && (c.n || '').toLowerCase().indexOf(searchVal) === -1 && (c.c || '').toLowerCase().indexOf(searchVal) === -1) return false;
      return true;
    });

    var countEl = document.getElementById('sovFilterCount');
    if (countEl) {
      if (provVal || searchVal) countEl.textContent = 'แสดง ' + filtered.length + ' / ' + customers.length + ' ร้าน';
      else countEl.textContent = '';
    }

    var tbody = document.getElementById('sovBranchTableBody');
    if (!tbody) return;
    var rows = '';
    filtered.forEach(function (c, i) {
      var status = '';
      if (c.nf) status = '<span style="color:#16a34a;font-size:11px">🟢 ' + c.nf + '</span>';
      if (c.lf) status += (status ? '<br>' : '') + '<span style="color:#ef4444;font-size:11px">🔴 ' + c.lf + '</span>';
      if (!status) status = '<span style="color:#64748b;font-size:11px">ปกติ</span>';
      rows += '<tr style="border-bottom:1px solid var(--border)">'
        + '<td style="padding:7px 10px">' + (i + 1) + '</td>'
        + '<td style="padding:7px 10px;font-family:monospace;font-size:12px">' + (c.c || '') + '</td>'
        + '<td style="padding:7px 10px">' + (c.n || '') + '</td>'
        + '<td style="padding:7px 10px">' + (c.p || '') + '</td>'
        + '<td style="padding:7px 10px">' + (c.d || '') + '</td>'
        + '<td style="padding:7px 10px;text-align:right;font-weight:600">' + _sovFilteredTotal(c).toLocaleString() + '</td>'
        + '<td style="padding:7px 10px;text-align:center">' + status + '</td>'
        + '</tr>';
    });
    tbody.innerHTML = rows;
  };

  // ---- RENDER: สำรวจร้านของฝากทั่วประเทศ ----
  var _sovExploreRendered = false;
  var _sovExploreMap = null;

  var THAI_PROV_COORDS = {
    'กรุงเทพมหานคร':[13.7563,100.5018],'กระบี่':[8.0863,98.9063],'กาญจนบุรี':[14.0043,99.5483],
    'กาฬสินธุ์':[16.4322,103.5061],'กำแพงเพชร':[16.4832,99.5226],'ขอนแก่น':[16.4322,102.8236],
    'จันทบุรี':[12.6113,102.1043],'ฉะเชิงเทรา':[13.6904,101.0780],'ชลบุรี':[13.3611,100.9847],
    'ชัยนาท':[15.1851,100.1251],'ชัยภูมิ':[15.8069,102.0316],'ชุมพร':[10.4931,99.1800],
    'เชียงราย':[19.9105,99.8406],'เชียงใหม่':[18.7883,98.9853],'ตรัง':[7.5563,99.6114],
    'ตราด':[12.2428,102.5175],'ตาก':[16.8840,99.1259],'นครนายก':[14.2069,101.2133],
    'นครปฐม':[13.8196,100.0641],'นครพนม':[17.3927,104.7695],'นครราชสีมา':[14.9799,102.0978],
    'นครศรีธรรมราช':[8.4325,99.9599],'นครสวรรค์':[15.7030,100.1371],'นนทบุรี':[13.8621,100.5144],
    'นราธิวาส':[6.4318,101.8237],'น่าน':[18.7756,100.7730],'บึงกาฬ':[18.3609,103.6466],
    'บุรีรัมย์':[14.9951,103.1029],'ปทุมธานี':[14.0208,100.5253],'ประจวบคีรีขันธ์':[11.8126,99.7957],
    'ปราจีนบุรี':[14.0508,101.3710],'ปัตตานี':[6.8714,101.2510],'พระนครศรีอยุธยา':[14.3532,100.5685],
    'พะเยา':[19.1664,99.9019],'พังงา':[8.4509,98.5225],'พัทลุง':[7.6167,100.0740],
    'พิจิตร':[16.4419,100.3488],'พิษณุโลก':[16.8211,100.2659],'เพชรบุรี':[13.1112,99.9390],
    'เพชรบูรณ์':[16.4190,101.1600],'แพร่':[18.1445,100.1403],'ภูเก็ต':[7.8804,98.3923],
    'มหาสารคาม':[16.1851,103.3028],'มุกดาหาร':[16.5424,104.7235],'แม่ฮ่องสอน':[19.3020,97.9654],
    'ยโสธร':[15.7944,104.1451],'ยะลา':[6.5414,101.2803],'ร้อยเอ็ด':[16.0538,103.6530],
    'ระนอง':[9.9528,98.6085],'ระยอง':[12.6834,101.2370],'ราชบุรี':[13.5283,99.8134],
    'ลพบุรี':[14.7995,100.6534],'ลำปาง':[18.2888,99.4909],'ลำพูน':[18.5744,99.0087],
    'เลย':[17.4860,101.7223],'ศรีสะเกษ':[15.1186,104.3220],'สกลนคร':[17.1545,104.1348],
    'สงขลา':[7.1894,100.5953],'สตูล':[6.6238,100.0674],'สมุทรปราการ':[13.5990,100.5998],
    'สมุทรสงคราม':[13.4098,100.0024],'สมุทรสาคร':[13.5475,100.2744],'สระแก้ว':[13.8240,102.0645],
    'สระบุรี':[14.5289,100.9103],'สิงห์บุรี':[14.8936,100.3967],'สุโขทัย':[17.0100,99.8265],
    'สุพรรณบุรี':[14.4744,100.1177],'สุราษฎร์ธานี':[9.1382,99.3217],'สุรินทร์':[14.8827,103.4937],
    'หนองคาย':[17.8783,102.7413],'หนองบัวลำภู':[17.2218,102.4260],'อ่างทอง':[14.5896,100.4550],
    'อำนาจเจริญ':[15.8656,104.6257],'อุดรธานี':[17.4156,102.7872],'อุตรดิตถ์':[17.6200,100.0993],
    'อุทัยธานี':[15.3835,100.0246],'อุบลราชธานี':[15.2287,104.8564]
  };

  var THAI_PROV_REGION = {
    'กรุงเทพมหานคร':'กรุงเทพและปริมณฑล','นนทบุรี':'กรุงเทพและปริมณฑล','ปทุมธานี':'กรุงเทพและปริมณฑล',
    'สมุทรปราการ':'กรุงเทพและปริมณฑล','สมุทรสาคร':'กรุงเทพและปริมณฑล','นครปฐม':'กรุงเทพและปริมณฑล',
    'พระนครศรีอยุธยา':'ภาคกลาง','ลพบุรี':'ภาคกลาง','สระบุรี':'ภาคกลาง','สิงห์บุรี':'ภาคกลาง',
    'อ่างทอง':'ภาคกลาง','ชัยนาท':'ภาคกลาง','นครนายก':'ภาคกลาง','สุพรรณบุรี':'ภาคกลาง',
    'กาญจนบุรี':'ภาคกลาง','ราชบุรี':'ภาคกลาง','สมุทรสงคราม':'ภาคกลาง','เพชรบุรี':'ภาคกลาง',
    'ประจวบคีรีขันธ์':'ภาคกลาง','นครสวรรค์':'ภาคกลาง','อุทัยธานี':'ภาคกลาง','กำแพงเพชร':'ภาคกลาง',
    'พิจิตร':'ภาคกลาง','พิษณุโลก':'ภาคกลาง','สุโขทัย':'ภาคกลาง','ปราจีนบุรี':'ภาคกลาง',
    'สระแก้ว':'ภาคกลาง',
    'ชลบุรี':'ภาคตะวันออก','ระยอง':'ภาคตะวันออก','จันทบุรี':'ภาคตะวันออก','ตราด':'ภาคตะวันออก',
    'ฉะเชิงเทรา':'ภาคตะวันออก',
    'เชียงใหม่':'ภาคเหนือ','เชียงราย':'ภาคเหนือ','ลำปาง':'ภาคเหนือ','ลำพูน':'ภาคเหนือ',
    'แพร่':'ภาคเหนือ','น่าน':'ภาคเหนือ','พะเยา':'ภาคเหนือ','แม่ฮ่องสอน':'ภาคเหนือ',
    'อุตรดิตถ์':'ภาคเหนือ','ตาก':'ภาคเหนือ','เพชรบูรณ์':'ภาคเหนือ',
    'นครราชสีมา':'ภาคอีสาน','ขอนแก่น':'ภาคอีสาน','อุดรธานี':'ภาคอีสาน','อุบลราชธานี':'ภาคอีสาน',
    'บุรีรัมย์':'ภาคอีสาน','สุรินทร์':'ภาคอีสาน','ชัยภูมิ':'ภาคอีสาน','มหาสารคาม':'ภาคอีสาน',
    'ร้อยเอ็ด':'ภาคอีสาน','กาฬสินธุ์':'ภาคอีสาน','สกลนคร':'ภาคอีสาน','นครพนม':'ภาคอีสาน',
    'หนองคาย':'ภาคอีสาน','เลย':'ภาคอีสาน','หนองบัวลำภู':'ภาคอีสาน','มุกดาหาร':'ภาคอีสาน',
    'ยโสธร':'ภาคอีสาน','อำนาจเจริญ':'ภาคอีสาน','บึงกาฬ':'ภาคอีสาน','ศรีสะเกษ':'ภาคอีสาน',
    'สุราษฎร์ธานี':'ภาคใต้','นครศรีธรรมราช':'ภาคใต้','สงขลา':'ภาคใต้','ภูเก็ต':'ภาคใต้',
    'กระบี่':'ภาคใต้','พังงา':'ภาคใต้','ตรัง':'ภาคใต้','พัทลุง':'ภาคใต้','ชุมพร':'ภาคใต้',
    'ระนอง':'ภาคใต้','สตูล':'ภาคใต้','ยะลา':'ภาคใต้','ปัตตานี':'ภาคใต้','นราธิวาส':'ภาคใต้'
  };

  window.renderSovExplore = function () {
    _sovSwitchChannel();
    if (_sovExploreRendered) return;
    _sovExploreRendered = true;

    var sovData = (typeof AMZ_CUST_DATA !== 'undefined' && AMZ_CUST_DATA.SOV) ? AMZ_CUST_DATA.SOV : [];
    var customers = sovData.filter(function (c) { return c.c !== 'Grand Total'; });
    if (!customers.length) return;

    // เพิ่ม region ให้แต่ละร้าน
    customers.forEach(function (c) {
      c._region = THAI_PROV_REGION[c.p] || 'อื่นๆ';
      var coords = THAI_PROV_COORDS[c.p];
      if (coords) {
        c._lat = coords[0] + (Math.random() - 0.5) * 0.08;
        c._lng = coords[1] + (Math.random() - 0.5) * 0.08;
      }
    });

    window._sovExploreData = customers;

    // --- KPI ---
    var total = customers.length;
    var regionCount = {}, provCount = {};
    var totalSales = 0;
    customers.forEach(function (c) {
      regionCount[c._region] = (regionCount[c._region] || 0) + 1;
      provCount[c.p] = (provCount[c.p] || 0) + 1;
      totalSales += _sovFilteredTotal(c);
    });
    var totalRegion = Object.keys(regionCount).length;
    var totalProv = Object.keys(provCount).length;
    var activeCount = customers.filter(function (c) { return !c.lf; }).length;
    var periodLabel = _sovPeriodLabel();

    var kpiEl = document.getElementById('sovExploreKPI');
    if (kpiEl) {
      kpiEl.innerHTML =
        kpiCard('🎁', 'ร้านของฝากทั้งหมด', total + ' ร้าน', 'สำรวจทั่วประเทศ', '#ea580c')
        + kpiCard('🗺️', 'ครอบคลุม', totalRegion + ' ภูมิภาค / ' + totalProv + ' จังหวัด', 'กระจายทั่วประเทศ', '#2563eb')
        + kpiCard('💰', 'ยอดขายรวม', (totalSales / 1e6).toFixed(2) + ' ล้าน', periodLabel, '#16a34a')
        + kpiCard('✅', 'ร้านที่ยังซื้ออยู่', activeCount + ' ร้าน', Math.round(activeCount / total * 100) + '% ของทั้งหมด', '#7c3aed');
    }

    // --- Populate filter dropdowns ---
    var regionSel = document.getElementById('sovExploreRegion');
    var provSel = document.getElementById('sovExploreProv');
    if (regionSel) {
      while (regionSel.options.length > 1) regionSel.remove(1);
      Object.keys(regionCount).sort().forEach(function (r) {
        var opt = document.createElement('option');
        opt.value = r; opt.textContent = r + ' (' + regionCount[r] + ')';
        regionSel.appendChild(opt);
      });
    }
    if (provSel) {
      while (provSel.options.length > 1) provSel.remove(1);
      Object.keys(provCount).sort().forEach(function (p) {
        var opt = document.createElement('option');
        opt.value = p; opt.textContent = p + ' (' + provCount[p] + ')';
        provSel.appendChild(opt);
      });
    }

    // --- Map ---
    var mapEl = document.getElementById('sovExploreMap');
    if (mapEl && typeof L !== 'undefined' && L.map) {
      try {
        _sovExploreMap = L.map(mapEl, { scrollWheelZoom: false }).setView([13.2, 101.0], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap', maxZoom: 18
        }).addTo(_sovExploreMap);

        var giftIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
        });

        customers.forEach(function (c) {
          if (c._lat && c._lng) {
            var status = c.lf ? '🔴 ' + c.lf : '🟢 ปกติ';
            L.marker([c._lat, c._lng], { icon: giftIcon })
              .addTo(_sovExploreMap)
              .bindPopup('<b>' + (c.n || '') + '</b><br>📍 ' + (c.p || '') + ' / ' + (c.d || '') + '<br>💰 ยอดขาย: ' + _sovFilteredTotal(c).toLocaleString() + ' บาท<br>' + status);
          }
        });

        setTimeout(function () { _sovExploreMap.invalidateSize(); }, 300);
      } catch (e) {
        mapEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:13px">ไม่สามารถโหลดแผนที่ได้</div>';
      }
    }

    // --- Region doughnut chart ---
    var regionKeys = Object.keys(regionCount).sort(function (a, b) { return regionCount[b] - regionCount[a]; });
    var regionColors = ['#ea580c', '#2563eb', '#16a34a', '#7c3aed', '#0891b2', '#d97706', '#e11d48'];
    mkChart('sovExploreRegionChart', {
      type: 'doughnut',
      data: {
        labels: regionKeys,
        datasets: [{ data: regionKeys.map(function (r) { return regionCount[r]; }), backgroundColor: regionColors.slice(0, regionKeys.length), borderWidth: 2 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }
    });

    // --- Province bar chart ---
    var provSorted = Object.keys(provCount).sort(function (a, b) { return provCount[b] - provCount[a]; });
    var provColors = provSorted.map(function (_, i) { return 'hsl(' + (20 + i * 12) + ',70%,55%)'; });
    mkChart('sovExploreProvChart', {
      type: 'bar',
      data: {
        labels: provSorted,
        datasets: [{ label: 'จำนวนร้าน', data: provSorted.map(function (p) { return provCount[p]; }), backgroundColor: provColors, borderRadius: 5 }]
      },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { stepSize: 1 } } } }
    });

    // --- Sales by region bar chart ---
    var salesByRegion = {};
    customers.forEach(function (c) { salesByRegion[c._region] = (salesByRegion[c._region] || 0) + _sovFilteredTotal(c); });
    var salesRegionSorted = Object.keys(salesByRegion).sort(function (a, b) { return salesByRegion[b] - salesByRegion[a]; });
    mkChart('sovExploreSalesChart', {
      type: 'bar',
      data: {
        labels: salesRegionSorted,
        datasets: [{ label: 'ยอดขาย (บาท)', data: salesRegionSorted.map(function (r) { return salesByRegion[r]; }), backgroundColor: regionColors.slice(0, salesRegionSorted.length), borderRadius: 5 }]
      },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { callback: function (v) { return (v / 1e6).toFixed(1) + 'M'; } } } } }
    });

    // --- Table ---
    sovExploreFilter();
  };

  window.sovExploreFilter = function (level) {
    var customers = window._sovExploreData || [];
    var regionVal = (document.getElementById('sovExploreRegion') || {}).value || '';
    var provVal = (document.getElementById('sovExploreProv') || {}).value || '';
    var searchVal = ((document.getElementById('sovExploreSearch') || {}).value || '').toLowerCase();

    if (level === 'region') {
      var provSel = document.getElementById('sovExploreProv');
      if (provSel) {
        provSel.innerHTML = '<option value="">ทุกจังหวัด</option>';
        var provs = {};
        customers.forEach(function (c) {
          if (!regionVal || c._region === regionVal) provs[c.p] = (provs[c.p] || 0) + 1;
        });
        Object.keys(provs).sort().forEach(function (p) {
          var opt = document.createElement('option');
          opt.value = p; opt.textContent = p + ' (' + provs[p] + ')';
          provSel.appendChild(opt);
        });
      }
    }

    var filtered = customers.filter(function (c) {
      if (regionVal && c._region !== regionVal) return false;
      if (provVal && c.p !== provVal) return false;
      if (searchVal && (c.n || '').toLowerCase().indexOf(searchVal) === -1 && (c.c || '').toLowerCase().indexOf(searchVal) === -1 && (c.p || '').toLowerCase().indexOf(searchVal) === -1) return false;
      return true;
    });

    var countEl = document.getElementById('sovExploreCount');
    if (countEl) {
      if (regionVal || provVal || searchVal) countEl.textContent = 'แสดง ' + filtered.length + ' / ' + customers.length + ' ร้าน';
      else countEl.textContent = '';
    }

    // Update map markers
    if (_sovExploreMap && typeof L !== 'undefined') {
      _sovExploreMap.eachLayer(function (layer) {
        if (layer instanceof L.Marker) _sovExploreMap.removeLayer(layer);
      });
      var giftIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
      });
      var bounds = [];
      filtered.forEach(function (c) {
        if (c._lat && c._lng) {
          var status = c.lf ? '🔴 ' + c.lf : '🟢 ปกติ';
          L.marker([c._lat, c._lng], { icon: giftIcon })
            .addTo(_sovExploreMap)
            .bindPopup('<b>' + (c.n || '') + '</b><br>📍 ' + (c.p || '') + ' / ' + (c.d || '') + '<br>💰 ยอดขาย: ' + _sovFilteredTotal(c).toLocaleString() + ' บาท<br>' + status);
          bounds.push([c._lat, c._lng]);
        }
      });
      if (bounds.length > 0) _sovExploreMap.fitBounds(bounds, { padding: [20, 20] });
    }

    var tbody = document.getElementById('sovExploreTableBody');
    if (!tbody) return;
    var rows = '';
    filtered.forEach(function (c, i) {
      var status = '';
      if (c.nf) status = '<span style="color:#16a34a;font-size:11px">🟢 ' + c.nf + '</span>';
      if (c.lf) status += (status ? '<br>' : '') + '<span style="color:#ef4444;font-size:11px">🔴 ' + c.lf + '</span>';
      if (!status) status = '<span style="color:#64748b;font-size:11px">ปกติ</span>';
      var mapLink = (c._lat && c._lng) ? '<a href="https://maps.google.com/maps?q=' + c._lat + ',' + c._lng + '" target="_blank" style="text-decoration:none" title="ดูแผนที่">📍</a>' : '-';
      rows += '<tr style="border-bottom:1px solid var(--border)">'
        + '<td style="padding:7px 10px">' + (i + 1) + '</td>'
        + '<td style="padding:7px 10px;font-family:monospace;font-size:12px">' + (c.c || '') + '</td>'
        + '<td style="padding:7px 10px">' + (c.n || '') + '</td>'
        + '<td style="padding:7px 10px;font-size:12px;color:#7c3aed">' + (c._region || '') + '</td>'
        + '<td style="padding:7px 10px">' + (c.p || '') + '</td>'
        + '<td style="padding:7px 10px">' + (c.d || '') + '</td>'
        + '<td style="padding:7px 10px;text-align:right;font-weight:600">' + _sovFilteredTotal(c).toLocaleString() + '</td>'
        + '<td style="padding:7px 10px;text-align:center">' + status + '</td>'
        + '<td style="padding:7px 10px;text-align:center">' + mapLink + '</td>'
        + '</tr>';
    });
    tbody.innerHTML = rows;
  };

  window.sovExploreReset = function () {
    var r = document.getElementById('sovExploreRegion');
    var p = document.getElementById('sovExploreProv');
    var s = document.getElementById('sovExploreSearch');
    if (r) r.value = '';
    if (p) p.value = '';
    if (s) s.value = '';
    sovExploreFilter('region');
  };

  // ---- RENDER: แดชบอร์ด (amz-dashboard) — MT style ----
  var _dashboardRendered = false;

  window.renderAmzDashboard = function () {
    if (window._amzForceRerender) { _dashboardRendered = false; window._amzForceRerender = false; }
    if (_dashboardRendered) return;
    if (typeof AMZ_ORDER_DATA === 'undefined') return;
    _dashboardRendered = true;
    var D = AMZ_ORDER_DATA;
    var info = document.getElementById('amzPeriodInfo');
    if(info) info.textContent = _amzPeriodInfoText();

    var filteredChs = _amzFilteredChannels();
    var months = _amzGetYearMonths();

    var chData = filteredChs.map(function(ch) {
      var i = AMZ_CHANNELS.indexOf(ch);
      var chNet = 0, chQty = 0, chBills = 0;
      months.forEach(function(ym) {
        if (D.monthlyByCh[ch] && D.monthlyByCh[ch][ym]) {
          chNet += D.monthlyByCh[ch][ym].net;
          chQty += D.monthlyByCh[ch][ym].qty || 0;
          chBills += D.monthlyByCh[ch][ym].bills || 0;
        }
      });
      return { ch: ch, a: chNet, qty: chQty, bills: chBills, color: palette[i >= 0 ? i : 0] };
    });
    var grandA = 0; chData.forEach(function(d) { grandA += d.a; });
    var avgMth = months.length > 0 ? grandA / months.length : 0;
    var topCh = chData.slice().sort(function (a, b) { return b.a - a.a; })[0] || { ch: '—', a: 0 };
    var yearLabel = _amzYear === 'all' ? '5 ปี (2022–2026)' : 'ปี ' + (parseInt(_amzYear)+543);

    var _amzCmpHtml='';
    if(typeof CMP!=='undefined'){var _ami=typeof MONTHS!=='undefined'?MONTHS.length-1:6;var _amMom=CMP.calcMoMChannel('Amazon & Souvenir',_ami);var _amYoy=CMP.calcYoYChannel('Amazon & Souvenir',_ami);var _ab1=_amMom&&_amMom.pct!==null?CMP.badge(_amMom.pct,'MoM'):'';var _ab2=_amYoy&&_amYoy.pct!==null?CMP.badge(_amYoy.pct,'YoY'):'';if(_ab1||_ab2)_amzCmpHtml='<div class="cmp-group">'+_ab1+_ab2+'</div>';}
    var kpiEl = document.getElementById('amazonKPI');
    if (kpiEl) {
      kpiEl.innerHTML =
        '<div class="kpi-card blue"><div class="kpi-label">💰 Revenue รวม</div>'
        + '<div class="kpi-value sm">' + (grandA / 1e6).toFixed(2) + ' M</div>'
        + _amzCmpHtml
        + '<div class="kpi-sub">' + yearLabel + ' (' + months.length + ' เดือน)</div></div>'
        + '<div class="kpi-card blue"><div class="kpi-label">📊 เฉลี่ย/เดือน</div>'
        + '<div class="kpi-value sm">' + (avgMth / 1e6).toFixed(2) + ' M</div>'
        + '<div class="kpi-sub">' + months.length + ' เดือน</div></div>'
        + '<div class="kpi-card blue"><div class="kpi-label">📦 จำนวนช่องทาง</div>'
        + '<div class="kpi-value sm">' + filteredChs.length + ' ช่องทาง</div>'
        + '<div class="kpi-sub">' + (_amzCh === 'All' ? 'Amazon & ของฝาก' : _amzCh === 'Amazon' ? 'OR, Amazon, RM' : _amzCh === 'Souvenir' ? 'ร้านของฝาก, ลูกค้าทั่วไป' : 'Black Canyon') + '</div></div>'
        + '<div class="kpi-card blue"><div class="kpi-label">🏆 ช่องทางอันดับ 1</div>'
        + '<div class="kpi-value sm">' + topCh.ch + '</div>'
        + '<div class="kpi-sub">' + (topCh.a / 1e6).toFixed(2) + ' M (' + (grandA > 0 ? (topCh.a / grandA * 100).toFixed(1) : 0) + '%)</div></div>';
    }

    // --- Monthly bar chart (amazonBar) ---
    var mthLabels = months.map(function(ym) { return _amzYmLabel(ym); });
    var mthVals = months.map(function(ym) {
      var sum = 0;
      filteredChs.forEach(function(ch) {
        if (D.monthlyByCh[ch] && D.monthlyByCh[ch][ym]) sum += D.monthlyByCh[ch][ym].net;
      });
      return sum / 1e6;
    });
    mkChart('amazonBar', {
      type: 'bar',
      data: { labels: mthLabels, datasets: [{ label: 'Revenue (M฿)', data: mthVals, backgroundColor: 'rgba(234,88,12,.8)', borderRadius: 5 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: function (v) { return v.toFixed(1) + ' M'; } } }, x: { ticks: { maxRotation: 60, font: { size: 9 } } } } }
    });

    // --- Channel bar chart (amzChBar) ---
    mkChart('amzChBar', {
      type: 'bar',
      data: { labels: chData.map(function (d) { return d.ch; }), datasets: [{ label: 'Revenue (M฿)', data: chData.map(function (d) { return d.a / 1e6; }), backgroundColor: chData.map(function (d) { return d.color; }), borderRadius: 5 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: function (v) { return v.toFixed(2) + ' M'; } } } } }
    });

    // --- Channel line chart (amzChannelLineChart) ---
    mkChart('amzChannelLineChart', {
      type: 'line',
      data: {
        labels: mthLabels,
        datasets: filteredChs.map(function (ch) {
          var i = AMZ_CHANNELS.indexOf(ch);
          return {
            label: ch,
            data: months.map(function (ym) { return (D.monthlyByCh[ch] && D.monthlyByCh[ch][ym]) ? D.monthlyByCh[ch][ym].net : 0; }),
            borderColor: palette[i],
            backgroundColor: palette[i] + '22',
            borderWidth: 2.5,
            pointRadius: months.length > 20 ? 2 : 4,
            pointBackgroundColor: palette[i],
            tension: 0.3,
            fill: false
          };
        })
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, usePointStyle: true } } },
        scales: { y: { beginAtZero: true, ticks: { callback: function (v) { return (v / 1e6).toFixed(1) + 'M'; } } }, x: { ticks: { maxRotation: 60, font: { size: 9 } } } }
      }
    });

    // --- Channel doughnut (amzChannelPie) ---
    mkChart('amzChannelPie', {
      type: 'doughnut',
      data: {
        labels: chData.map(function (d) { return d.ch; }),
        datasets: [{ data: chData.map(function (d) { return d.a; }), backgroundColor: chData.map(function (d) { return d.color; }), borderWidth: 2 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }
    });

    // --- Channel breakdown table (amzChannelTable) ---
    var tbl = document.getElementById('amzChannelTable');
    if (tbl) {
      var html = '<table style="width:100%;border-collapse:collapse;font-size:13px">';
      html += '<thead><tr style="background:#fff7ed;font-size:12px;color:#9a3412">';
      html += '<th style="padding:8px 10px;text-align:left">ช่องทาง</th>';
      html += '<th style="padding:8px 10px;text-align:right">ยอดจริง</th>';
      html += '<th style="padding:8px 10px;text-align:right">สัดส่วน</th>';
      html += '<th style="padding:8px 10px">กราฟ</th>';
      html += '</tr></thead><tbody>';
      chData.forEach(function (d) {
        var share = grandA > 0 ? ((d.a / grandA) * 100).toFixed(1) : '0.0';
        var barW = grandA > 0 ? Math.round((d.a / grandA) * 100) : 0;
        html += '<tr>';
        html += '<td style="padding:8px 10px;font-weight:700"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + d.color + ';margin-right:6px;vertical-align:middle"></span>' + d.ch + '</td>';
        html += '<td style="padding:8px 10px;text-align:right;font-weight:700">' + fmt(d.a) + '</td>';
        html += '<td style="padding:8px 10px;text-align:right;font-weight:600">' + share + '%</td>';
        html += '<td style="padding:8px 10px"><div style="display:flex;align-items:center;gap:6px"><div style="flex:1;background:#f1f5f9;border-radius:4px;height:14px;overflow:hidden"><div style="width:' + barW + '%;height:100%;background:' + d.color + ';border-radius:4px"></div></div></div></td>';
        html += '</tr>';
      });
      html += '<tr style="background:#fef3c7;font-weight:800">';
      html += '<td style="padding:8px 10px">รวมทั้งหมด</td>';
      html += '<td style="padding:8px 10px;text-align:right">' + fmt(grandA) + '</td>';
      html += '<td style="padding:8px 10px;text-align:right">100%</td>';
      html += '<td style="padding:8px 10px"></td>';
      html += '</tr></tbody></table>';
      tbl.innerHTML = html;
    }

    // --- TOP 10 products per channel ---
    _amzRenderTop10('all');
  };

  var _amzTop10Ch = 'all';
  window._amzTop10Switch = function(ch, btn) {
    _amzTop10Ch = ch;
    document.querySelectorAll('#amzTop10ChTabs .fmtab').forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    _amzRenderTop10(ch);
  };

  function _amzRenderTop10(ch) {
    if (typeof AMZ_ORDER_DATA === 'undefined') return;
    var D = AMZ_ORDER_DATA;
    var prods;
    if (ch === 'all') {
      prods = (D.topProdAll || []).slice(0, 10);
    } else {
      prods = (D.topProdByCh[ch] || []).slice(0, 10);
    }

    var tabEl = document.getElementById('amzTop10ChTabs');
    if (tabEl && !tabEl.hasChildNodes()) {
      var tabs = [{ k:'all', l:'ทั้งหมด' }];
      AMZ_CHANNELS.forEach(function(c){ tabs.push({ k:c, l:c }); });
      var th = '';
      tabs.forEach(function(t){
        th += '<button class="fmtab' + (t.k === 'all' ? ' active' : '') + '" onclick="_amzTop10Switch(\'' + t.k.replace(/'/g,"\\'") + '\',this)">' + t.l + '</button>';
      });
      tabEl.innerHTML = th;
    }

    var topNet = prods.length > 0 ? prods[0].n : 1;
    var tblEl = document.getElementById('amzTop10Table');
    if (tblEl) {
      var html = '<table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:#fff7ed;color:#9a3412">';
      html += '<th style="padding:8px 10px;text-align:left">#</th><th style="padding:8px 10px;text-align:left">สินค้า</th>';
      html += '<th style="padding:8px 10px;text-align:right">ยอดขาย (฿)</th><th style="padding:8px 10px;text-align:right">ชิ้น</th>';
      html += '<th style="padding:8px 10px;text-align:right">฿/ชิ้น</th><th style="padding:8px 10px;min-width:100px">สัดส่วน</th>';
      html += '</tr></thead><tbody>';
      prods.forEach(function(d, i) {
        var barW = Math.round((d.n / topNet) * 100);
        var ppc = d.q > 0 ? (d.n / d.q).toFixed(2) : '-';
        var rankColors = ['#ea580c','#f97316','#fb923c','#fdba74','#fed7aa','#ffedd5','#fff7ed','#fefce8','#f1f5f9','#f1f5f9'];
        html += '<tr style="border-bottom:1px solid #f1f5f9">';
        html += '<td style="padding:6px 10px;font-weight:800;color:' + rankColors[i] + '">' + (i+1) + '</td>';
        html += '<td style="padding:6px 10px;font-weight:600;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="' + d.p + '">' + d.p + '</td>';
        html += '<td style="padding:6px 10px;text-align:right;font-weight:700">' + d.n.toLocaleString() + '</td>';
        html += '<td style="padding:6px 10px;text-align:right">' + d.q.toLocaleString() + '</td>';
        html += '<td style="padding:6px 10px;text-align:right;color:#0891b2;font-weight:600">' + ppc + '</td>';
        html += '<td style="padding:6px 10px"><div style="background:#f1f5f9;border-radius:4px;height:12px;overflow:hidden"><div style="width:' + barW + '%;height:100%;background:rgba(234,88,12,.6);border-radius:4px"></div></div></td>';
        html += '</tr>';
      });
      html += '</tbody></table>';
      tblEl.innerHTML = html;
    }

    mkChart('amzTop10Bar', {
      type: 'bar',
      data: {
        labels: prods.map(function(d){ var n = d.p; return n.length > 20 ? n.substring(0,18) + '…' : n; }),
        datasets: [{ label: 'ยอดขาย (฿)', data: prods.map(function(d){ return d.n; }), backgroundColor: 'rgba(234,88,12,.7)', borderRadius: 4 }]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { ticks: { callback: function(v){ return (v/1e6).toFixed(1)+'M'; } } } }
      }
    });
  }

  // ---- RENDER: ยอดขาย (amz-sales) — uses AMZ_ORDER_DATA + year/period filter ----
  var _amzSalesCh = 'All';
  var _salesPageRendered = false;
  var _amzSalesYear = '2026';
  var _amzSalesPeriod = 'all';

  function _amzSalesGetMonths() {
    if (typeof AMZ_ORDER_DATA === 'undefined') return [];
    var all = AMZ_ORDER_DATA.months || [];
    var byYear = (_amzSalesYear === 'all') ? all : all.filter(function(ym) { return ym.indexOf(_amzSalesYear) === 0; });
    if (_amzSalesPeriod === 'all') return byYear;
    var now = new Date();
    var curMo = ('0' + (now.getMonth() + 1)).slice(-2);
    var prevMo = ('0' + now.getMonth()).slice(-2);
    var allowed;
    if (_amzSalesPeriod === 'thismonth') allowed = [curMo];
    else if (_amzSalesPeriod === 'lastmonth') allowed = [prevMo];
    else if (_amzSalesPeriod === 'q1') allowed = ['01','02','03'];
    else if (_amzSalesPeriod === 'q2') allowed = ['04','05','06'];
    else if (_amzSalesPeriod === 'q3') allowed = ['07','08','09'];
    else if (_amzSalesPeriod === 'q4') allowed = ['10','11','12'];
    else return byYear;
    return byYear.filter(function(ym) { return allowed.indexOf(ym.split('-')[1]) >= 0; });
  }

  function _amzSalesPeriodInfo() {
    var months = _amzSalesGetMonths();
    if (!months.length) return '';
    if (_amzSalesYear === 'all') return 'กำลังแสดง: ทั้งหมด (' + _amzYmLabel(months[0]) + ' – ' + _amzYmLabel(months[months.length-1]) + ')';
    var be = parseInt(_amzSalesYear) + 543;
    var infoMap = { all: _amzYmLabel(months[0]) + ' – ' + _amzYmLabel(months[months.length-1]), thismonth:'ก.ค. '+be, lastmonth:'มิ.ย. '+be, q1:'Q1 ม.ค.–มี.ค. '+be, q2:'Q2 เม.ย.–มิ.ย. '+be, q3:'Q3 ก.ค.–ก.ย. '+be, q4:'Q4 ต.ค.–ธ.ค. '+be };
    return 'กำลังแสดง: ' + (infoMap[_amzSalesPeriod] || 'ทั้งหมด');
  }

  function _amzSalesRefresh() {
    _salesPageRendered = false;
    var info = document.getElementById('amzSalesPeriodInfo');
    if (info) info.textContent = _amzSalesPeriodInfo();
    window.renderAmzSalesPage();
  }

  window.amzSalesSetPeriod = function(p, btn) {
    _amzSalesPeriod = p;
    document.querySelectorAll('#amzSalesPeriodBtns .period-type-btn').forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    var m = document.getElementById('amzSalesQtrMenu'); if(m) m.style.display='none';
    var m2 = document.getElementById('amzSalesYearMenu'); if(m2) m2.style.display='none';
    _amzSalesRefresh();
  };
  window.amzSalesToggleQtr = function(btn) {
    var m = document.getElementById('amzSalesQtrMenu');
    if(m) m.style.display = m.style.display==='none'?'block':'none';
    var m2 = document.getElementById('amzSalesYearMenu'); if(m2) m2.style.display='none';
  };
  window.amzSalesPickQtr = function(q, btn) {
    _amzSalesPeriod = q;
    document.querySelectorAll('#amzSalesPeriodBtns .period-type-btn').forEach(function(b){ b.classList.remove('active'); });
    var dd = document.getElementById('amzSalesQtrDD');
    if(dd) dd.querySelector('.period-type-btn').classList.add('active');
    document.querySelectorAll('#amzSalesQtrMenu .qmenu-item').forEach(function(b){ b.classList.remove('active'); });
    if(btn) btn.classList.add('active');
    var label = document.getElementById('amzSalesQtrLabel');
    if(label) label.textContent = btn ? btn.textContent : '📆 รายไตรมาส';
    var m = document.getElementById('amzSalesQtrMenu'); if(m) m.style.display='none';
    _amzSalesRefresh();
  };
  window.amzSalesToggleYear = function(btn) {
    var m = document.getElementById('amzSalesYearMenu');
    if(m) m.style.display = m.style.display==='none'?'block':'none';
    var m2 = document.getElementById('amzSalesQtrMenu'); if(m2) m2.style.display='none';
  };
  window.amzSalesPickYear = function(y, btn) {
    _amzSalesYear = String(y);
    _amzSalesPeriod = 'all';
    document.querySelectorAll('#amzSalesPeriodBtns .period-type-btn').forEach(function(b){ b.classList.remove('active'); });
    var dd = document.getElementById('amzSalesYearDD');
    if(dd) dd.querySelector('.period-type-btn').classList.add('active');
    document.querySelectorAll('#amzSalesYearMenu .qmenu-item').forEach(function(b){ b.classList.remove('active'); });
    if(btn) btn.classList.add('active');
    var label = document.getElementById('amzSalesYearLabel');
    if(label) label.textContent = y === 'all' ? '📅 ทั้งหมด (5 ปี)' : '📅 ปี ' + (parseInt(y) + 543);
    var m = document.getElementById('amzSalesYearMenu'); if(m) m.style.display='none';
    _amzSalesRefresh();
  };

  // ===== Month dropdown (Sales) =====
  window.amzSalesToggleMo = function(btn) {
    var m = document.getElementById('amzSalesMoMenu');
    if(m) m.style.display = m.style.display==='none'?'block':'none';
    var m2 = document.getElementById('amzSalesQtrMenu'); if(m2) m2.style.display='none';
    var m3 = document.getElementById('amzSalesYearMenu'); if(m3) m3.style.display='none';
  };
  window.amzSalesPickMo = function(mo, btn) {
    var ML = {Jan:'ม.ค.',Feb:'ก.พ.',Mar:'มี.ค.',Apr:'เม.ย.',May:'พ.ค.',Jun:'มิ.ย.',Jul:'ก.ค.',Aug:'ส.ค.',Sep:'ก.ย.',Oct:'ต.ค.',Nov:'พ.ย.',Dec:'ธ.ค.'};
    _amzSalesPeriod = mo;
    document.querySelectorAll('#amzSalesPeriodBtns .period-type-btn').forEach(function(b){ b.classList.remove('active'); });
    var dd = document.getElementById('amzSalesMoDD');
    if(dd) dd.querySelector('.period-type-btn').classList.add('active');
    document.querySelectorAll('#amzSalesMoMenu .qmenu-item').forEach(function(b){ b.classList.remove('active'); });
    if(btn) btn.classList.add('active');
    var label = document.getElementById('amzSalesMoLabel');
    if(label) label.textContent = '📅 ' + ML[mo];
    var ql = document.getElementById('amzSalesQtrLabel'); if(ql) ql.textContent = '📆 รายไตรมาส';
    var yl = document.getElementById('amzSalesYearLabel'); if(yl) yl.textContent = '📅 รายปี';
    var m = document.getElementById('amzSalesMoMenu'); if(m) m.style.display='none';
    _amzSalesRefresh();
  };

  window.amzSalesSetCh = function (ch, btnEl) {
    _amzSalesCh = ch;
    document.querySelectorAll('#amzSalesTypeFilter .fmtab').forEach(function (b) { b.classList.remove('active'); });
    if (btnEl) btnEl.classList.add('active');
    _salesPageRendered = false;
    window.renderAmzSalesPage();
  };

  window.renderAmzSalesPage = function () {
    if (typeof AMZ_ORDER_DATA === 'undefined') return;
    var D = AMZ_ORDER_DATA;
    _salesPageRendered = true;
    var info = document.getElementById('amzSalesPeriodInfo');
    if (info) info.textContent = _amzSalesPeriodInfo();

    var filterCh = _amzSalesCh;
    var channels = filterCh === 'All' ? AMZ_CHANNELS : [filterCh];
    var chIdx = filterCh === 'All' ? -1 : AMZ_CHANNELS.indexOf(filterCh);
    var months = _amzSalesGetMonths();

    var grandA = 0, grandQty = 0, grandBills = 0;
    months.forEach(function(ym) {
      channels.forEach(function(ch) {
        if (D.monthlyByCh[ch] && D.monthlyByCh[ch][ym]) {
          grandA += D.monthlyByCh[ch][ym].net;
          grandQty += D.monthlyByCh[ch][ym].qty || 0;
          grandBills += D.monthlyByCh[ch][ym].bills || 0;
        }
      });
    });
    var avgMth = months.length > 0 ? grandA / months.length : 0;
    var yearLabel = _amzSalesYear === 'all' ? '5 ปี (2022–2026)' : 'ปี ' + (parseInt(_amzSalesYear)+543);

    var kpiEl = document.getElementById('amzSalesKPI');
    if (kpiEl) {
      kpiEl.innerHTML =
        '<div class="kpi-card blue"><div class="kpi-label">💰 Revenue รวม</div>'
        + '<div class="kpi-value sm">' + (grandA / 1e6).toFixed(2) + ' M</div>'
        + '<div class="kpi-sub">' + yearLabel + ' · ' + (filterCh === 'All' ? 'ทุกช่องทาง' : filterCh) + '</div></div>'
        + '<div class="kpi-card blue"><div class="kpi-label">📊 เฉลี่ย/เดือน</div>'
        + '<div class="kpi-value sm">' + (avgMth / 1e6).toFixed(2) + ' M</div>'
        + '<div class="kpi-sub">' + months.length + ' เดือน</div></div>'
        + '<div class="kpi-card blue"><div class="kpi-label">📋 จำนวนบิล</div>'
        + '<div class="kpi-value sm">' + grandBills.toLocaleString() + '</div>'
        + '<div class="kpi-sub">ทั้งหมด</div></div>'
        + '<div class="kpi-card blue"><div class="kpi-label">📦 จำนวนชิ้น</div>'
        + '<div class="kpi-value sm">' + grandQty.toLocaleString() + '</div>'
        + '<div class="kpi-sub">ทั้งหมด</div></div>';
    }

    window.renderAmzSalesTable();
  };

  window.renderAmzSalesTable = function () {
    if (typeof AMZ_ORDER_DATA === 'undefined') return;
    var D = AMZ_ORDER_DATA;
    var filterCh = _amzSalesCh;
    var channels = filterCh === 'All' ? AMZ_CHANNELS : [filterCh];
    var tblBody = document.getElementById('amzSalesTable');
    if (!tblBody) return;
    var months = _amzSalesGetMonths();

    var rows = '', grandA = 0;
    var topVal = 0;
    months.forEach(function(ym) {
      var moA = 0;
      channels.forEach(function(ch) { if (D.monthlyByCh[ch] && D.monthlyByCh[ch][ym]) moA += D.monthlyByCh[ch][ym].net; });
      if (moA > topVal) topVal = moA;
    });

    months.forEach(function(ym) {
      var moA = 0, moQty = 0, moBills = 0;
      channels.forEach(function(ch) {
        if (D.monthlyByCh[ch] && D.monthlyByCh[ch][ym]) {
          moA += D.monthlyByCh[ch][ym].net;
          moQty += D.monthlyByCh[ch][ym].qty || 0;
          moBills += D.monthlyByCh[ch][ym].bills || 0;
        }
      });
      grandA += moA;
      var barW = topVal > 0 ? Math.round((moA / topVal) * 100) : 0;
      rows += '<tr style="cursor:pointer" onclick="showAmzMonthDetail(\'' + ym + '\',\'' + (_amzSalesCh || 'All') + '\')" title="คลิกเพื่อดูรายการสินค้า">';
      rows += '<td style="padding:8px 10px;font-weight:600">' + _amzYmLabel(ym) + ' <span style="font-size:10px;color:#ea580c">🔍</span></td>';
      rows += '<td style="padding:8px 10px;text-align:right;font-weight:700">' + fmt(moA) + '</td>';
      rows += '<td style="padding:8px 10px;text-align:right">' + moQty.toLocaleString() + '</td>';
      rows += '<td style="padding:8px 10px;text-align:right">' + moBills.toLocaleString() + '</td>';
      rows += '<td style="padding:8px 10px;width:120px"><div style="background:#f1f5f9;border-radius:4px;height:14px;overflow:hidden"><div style="width:' + barW + '%;height:100%;background:rgba(234,88,12,.7);border-radius:4px"></div></div></td>';
      rows += '</tr>';
    });
    rows += '<tr style="background:#fef3c7;font-weight:800"><td style="padding:8px 10px">รวม</td>';
    rows += '<td style="padding:8px 10px;text-align:right">' + fmt(grandA) + '</td>';
    rows += '<td colspan="3"></td></tr>';
    tblBody.innerHTML = rows;
    var titleEl = document.getElementById('amzSalesTableTitle');
    if (titleEl) titleEl.textContent = '📅 ยอดขายรายเดือน — ' + (_amzSalesCh === 'All' ? 'ทุกช่องทาง' : _amzSalesCh);
  };

  // ---- RENDER: ยอดขายเทียบเป้าหมาย (amz-target) — uses AMZ_ORDER_DATA + period filter ----
  var _targetPageRendered = false;
  var _amzTargetYear = '2026';
  var _amzTargetPeriod = 'all';
  var _YM_TO_MO = {1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'May',6:'Jun',7:'Jul',8:'Aug',9:'Sep',10:'Oct',11:'Nov',12:'Dec'};

  function _amzTargetGetMonths() {
    if (typeof AMZ_ORDER_DATA === 'undefined') return [];
    var all = AMZ_ORDER_DATA.months || [];
    var byYear = (_amzTargetYear === 'all') ? all : all.filter(function(ym) { return ym.indexOf(_amzTargetYear) === 0; });
    if (_amzTargetPeriod === 'all') return byYear;
    var now = new Date();
    var curMo = ('0' + (now.getMonth() + 1)).slice(-2);
    var prevMo = ('0' + now.getMonth()).slice(-2);
    var allowed;
    if (_amzTargetPeriod === 'thismonth') allowed = [curMo];
    else if (_amzTargetPeriod === 'lastmonth') allowed = [prevMo];
    else if (_amzTargetPeriod === 'q1') allowed = ['01','02','03'];
    else if (_amzTargetPeriod === 'q2') allowed = ['04','05','06'];
    else if (_amzTargetPeriod === 'q3') allowed = ['07','08','09'];
    else if (_amzTargetPeriod === 'q4') allowed = ['10','11','12'];
    else return byYear;
    return byYear.filter(function(ym) { return allowed.indexOf(ym.split('-')[1]) >= 0; });
  }

  function _amzTargetPeriodInfo() {
    var months = _amzTargetGetMonths();
    if (!months.length) return '';
    if (_amzTargetYear === 'all') return 'กำลังแสดง: ทั้งหมด (' + _amzYmLabel(months[0]) + ' – ' + _amzYmLabel(months[months.length-1]) + ')';
    var be = parseInt(_amzTargetYear) + 543;
    var infoMap = { all: _amzYmLabel(months[0]) + ' – ' + _amzYmLabel(months[months.length-1]), thismonth:'ก.ค. '+be, lastmonth:'มิ.ย. '+be, q1:'Q1 ม.ค.–มี.ค. '+be, q2:'Q2 เม.ย.–มิ.ย. '+be, q3:'Q3 ก.ค.–ก.ย. '+be, q4:'Q4 ต.ค.–ธ.ค. '+be };
    return 'กำลังแสดง: ' + (infoMap[_amzTargetPeriod] || 'ทั้งหมด');
  }

  function _amzTargetRefresh() {
    _targetPageRendered = false;
    var info = document.getElementById('amzTargetPeriodInfo');
    if (info) info.textContent = _amzTargetPeriodInfo();
    window.renderAmzTargetPage();
  }

  var _AMZ_TARGET_KEYS = ['BKK1_Amazon','BKK2_Amazon','BKK3_Amazon','North','NE_Upper','NE_Lower','Central','CentralEast','South'];
  var _SOV_TARGET_KEYS = ['BKK1_Souvenir','BKK2_Souvenir','BKK3_Souvenir'];

  function _amzGetTarget(ym, ch) {
    var parts = ym.split('-');
    var year = parseInt(parts[0]);
    var moIdx = parseInt(parts[1]) - 1;
    if (typeof getTargetByYear !== 'function') return 0;
    var T = getTargetByYear(year);
    if (!T || !T.amazon) return 0;
    var keys;
    if (ch === 'OR') keys = _AMZ_TARGET_KEYS;
    else if (ch === 'ร้านของฝาก') keys = _SOV_TARGET_KEYS;
    else return 0;
    var sum = 0;
    keys.forEach(function(k) {
      if (T.amazon[k] && T.amazon[k].monthly) sum += (T.amazon[k].monthly[moIdx] || 0);
    });
    return sum;
  }

  window.amzTargetSetPeriod = function(p, btn) {
    _amzTargetPeriod = p;
    document.querySelectorAll('#amzTargetPeriodBtns .period-type-btn').forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    var m = document.getElementById('amzTargetQtrMenu'); if(m) m.style.display='none';
    var m2 = document.getElementById('amzTargetYearMenu'); if(m2) m2.style.display='none';
    _amzTargetRefresh();
  };
  window.amzTargetToggleQtr = function(btn) {
    var m = document.getElementById('amzTargetQtrMenu');
    if(m) m.style.display = m.style.display==='none'?'block':'none';
    var m2 = document.getElementById('amzTargetYearMenu'); if(m2) m2.style.display='none';
  };
  window.amzTargetPickQtr = function(q, btn) {
    _amzTargetPeriod = q;
    document.querySelectorAll('#amzTargetPeriodBtns .period-type-btn').forEach(function(b){ b.classList.remove('active'); });
    var dd = document.getElementById('amzTargetQtrDD');
    if(dd) dd.querySelector('.period-type-btn').classList.add('active');
    document.querySelectorAll('#amzTargetQtrMenu .qmenu-item').forEach(function(b){ b.classList.remove('active'); });
    if(btn) btn.classList.add('active');
    var label = document.getElementById('amzTargetQtrLabel');
    if(label) label.textContent = btn ? btn.textContent : '📆 รายไตรมาส';
    var m = document.getElementById('amzTargetQtrMenu'); if(m) m.style.display='none';
    _amzTargetRefresh();
  };
  window.amzTargetToggleYear = function(btn) {
    var m = document.getElementById('amzTargetYearMenu');
    if(m) m.style.display = m.style.display==='none'?'block':'none';
    var m2 = document.getElementById('amzTargetQtrMenu'); if(m2) m2.style.display='none';
  };
  window.amzTargetPickYear = function(y, btn) {
    _amzTargetYear = String(y);
    _amzTargetPeriod = 'all';
    document.querySelectorAll('#amzTargetPeriodBtns .period-type-btn').forEach(function(b){ b.classList.remove('active'); });
    var dd = document.getElementById('amzTargetYearDD');
    if(dd) dd.querySelector('.period-type-btn').classList.add('active');
    document.querySelectorAll('#amzTargetYearMenu .qmenu-item').forEach(function(b){ b.classList.remove('active'); });
    if(btn) btn.classList.add('active');
    var label = document.getElementById('amzTargetYearLabel');
    if(label) label.textContent = y === 'all' ? '📅 ทั้งหมด (5 ปี)' : '📅 ปี ' + (parseInt(y) + 543);
    var m = document.getElementById('amzTargetYearMenu'); if(m) m.style.display='none';
    _amzTargetRefresh();
  };

  // ===== Month dropdown (Target) =====
  window.amzTargetToggleMo = function(btn) {
    var m = document.getElementById('amzTargetMoMenu');
    if(m) m.style.display = m.style.display==='none'?'block':'none';
    var m2 = document.getElementById('amzTargetQtrMenu'); if(m2) m2.style.display='none';
    var m3 = document.getElementById('amzTargetYearMenu'); if(m3) m3.style.display='none';
  };
  window.amzTargetPickMo = function(mo, btn) {
    var ML = {Jan:'ม.ค.',Feb:'ก.พ.',Mar:'มี.ค.',Apr:'เม.ย.',May:'พ.ค.',Jun:'มิ.ย.',Jul:'ก.ค.',Aug:'ส.ค.',Sep:'ก.ย.',Oct:'ต.ค.',Nov:'พ.ย.',Dec:'ธ.ค.'};
    _amzTargetPeriod = mo;
    document.querySelectorAll('#amzTargetPeriodBtns .period-type-btn').forEach(function(b){ b.classList.remove('active'); });
    var dd = document.getElementById('amzTargetMoDD');
    if(dd) dd.querySelector('.period-type-btn').classList.add('active');
    document.querySelectorAll('#amzTargetMoMenu .qmenu-item').forEach(function(b){ b.classList.remove('active'); });
    if(btn) btn.classList.add('active');
    var label = document.getElementById('amzTargetMoLabel');
    if(label) label.textContent = '📅 ' + ML[mo];
    var ql = document.getElementById('amzTargetQtrLabel'); if(ql) ql.textContent = '📆 รายไตรมาส';
    var yl = document.getElementById('amzTargetYearLabel'); if(yl) yl.textContent = '📅 รายปี';
    var m = document.getElementById('amzTargetMoMenu'); if(m) m.style.display='none';
    _amzTargetRefresh();
  };

  window.renderAmzTargetPage = function () {
    if (typeof AMZ_ORDER_DATA === 'undefined') return;
    var D = AMZ_ORDER_DATA;
    _targetPageRendered = true;
    var info = document.getElementById('amzTargetPeriodInfo');
    if (info) info.textContent = _amzTargetPeriodInfo();
    var months = _amzTargetGetMonths();

    var filteredChs = _amzFilteredChannels();
    var grandT = 0, grandA = 0;
    var chData = filteredChs.map(function(ch) {
      var ci = AMZ_CHANNELS.indexOf(ch);
      var chT = 0, chA = 0;
      months.forEach(function(ym) {
        chT += _amzGetTarget(ym, ch);
        if (D.monthlyByCh[ch] && D.monthlyByCh[ch][ym]) chA += D.monthlyByCh[ch][ym].net;
      });
      grandT += chT; grandA += chA;
      return { ch: ch, t: chT, a: chA, color: palette[ci >= 0 ? ci : 0] };
    });
    var achPct = pct(grandA, grandT);
    var gap = grandA - grandT;
    var yearLabel = _amzTargetYear === 'all' ? '5 ปี (2022–2026)' : 'ปี ' + (parseInt(_amzTargetYear)+543);
    var hasTarget = grandT > 0;

    var kpiEl = document.getElementById('amzTargetKPI');
    if (kpiEl) {
      kpiEl.innerHTML =
        '<div class="kpi-card blue"><div class="kpi-label">🎯 เป้าหมาย</div>'
        + '<div class="kpi-value sm">' + (hasTarget ? (grandT / 1e6).toFixed(2) + ' M' : '—') + '</div>'
        + '<div class="kpi-sub">' + yearLabel + '</div></div>'
        + '<div class="kpi-card cyan"><div class="kpi-label">💰 ยอดจริงสะสม</div>'
        + '<div class="kpi-value sm">' + (grandA / 1e6).toFixed(2) + ' M</div>'
        + '<div class="kpi-sub">' + months.length + ' เดือน</div></div>'
        + '<div class="kpi-card ' + (hasTarget ? (parseFloat(achPct) >= 100 ? 'green' : 'red') : 'blue') + '"><div class="kpi-label">📊 % สำเร็จ</div>'
        + '<div class="kpi-value sm">' + (hasTarget ? achPct + '%' : '—') + '</div>'
        + '<div class="kpi-sub">' + (hasTarget ? (parseFloat(achPct) >= 100 ? 'บรรลุเป้า' : 'ยังไม่ถึงเป้า') : 'ไม่มีเป้าหมาย') + '</div></div>'
        + '<div class="kpi-card ' + (hasTarget ? (gap >= 0 ? 'green' : 'red') : 'blue') + '"><div class="kpi-label">⚡ ส่วนต่าง</div>'
        + '<div class="kpi-value sm">' + (hasTarget ? (gap >= 0 ? '+' : '') + (gap / 1e6).toFixed(2) + ' M' : '—') + '</div>'
        + '<div class="kpi-sub">' + (hasTarget ? (gap >= 0 ? 'เกินเป้า' : 'ต่ำกว่าเป้า') : '') + '</div></div>';
    }

    var mthLabels = months.map(function(ym) { return _amzYmLabel(ym); });
    var achVals = months.map(function(ym) {
      var t = 0, a = 0;
      filteredChs.forEach(function(ch) { t += _amzGetTarget(ym, ch); if (D.monthlyByCh[ch] && D.monthlyByCh[ch][ym]) a += D.monthlyByCh[ch][ym].net; });
      return t > 0 ? (a / t * 100) : 0;
    });
    mkChart('amzAchieveLine', {
      type: 'line',
      data: { labels: mthLabels, datasets: [
        { label: '% Achievement', data: achVals, borderColor: '#ea580c', backgroundColor: '#ea580c22', borderWidth: 2.5, pointRadius: months.length > 20 ? 2 : 5, pointBackgroundColor: '#ea580c', tension: 0.3, fill: true },
        { label: 'เป้า 100%', data: months.map(function () { return 100; }), borderColor: '#16a34a', borderDash: [6, 4], borderWidth: 1.5, pointRadius: 0, fill: false }
      ] },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { min: 0, max: Math.max(120, (achVals.length ? Math.max.apply(null, achVals) : 0) + 10), ticks: { callback: function (v) { return v + '%'; } } }, x: { ticks: { maxRotation: 60, font: { size: 9 } } } } }
    });

    mkChart('amzTargetChBar', {
      type: 'bar',
      data: { labels: chData.map(function (d) { return d.ch; }),
        datasets: hasTarget
          ? [{ label: '% Achievement', data: chData.map(function (d) { return d.t > 0 ? (d.a / d.t * 100) : 0; }),
              backgroundColor: chData.map(function (d) { return d.a >= d.t ? '#16a34a' : '#ea580c'; }), borderRadius: 5 }]
          : [{ label: 'Revenue (M฿)', data: chData.map(function(d){ return d.a / 1e6; }),
              backgroundColor: chData.map(function(d){ return d.color; }), borderRadius: 5 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { y: { ticks: { callback: function (v) { return hasTarget ? v + '%' : v.toFixed(1) + 'M'; } } } } }
    });

    mkChart('amzTargetPie', {
      type: 'doughnut',
      data: { labels: chData.map(function (d) { return d.ch; }),
        datasets: [{ data: chData.map(function (d) { return hasTarget ? d.t : d.a; }), backgroundColor: chData.map(function (d) { return d.color; }), borderWidth: 2 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }
    });

    var tblBody = document.getElementById('amzTargetTable');
    if (tblBody) {
      var rows = '';
      months.forEach(function(ym) {
        var moT = 0, moA = 0;
        filteredChs.forEach(function(ch) { moT += _amzGetTarget(ym, ch); if (D.monthlyByCh[ch] && D.monthlyByCh[ch][ym]) moA += D.monthlyByCh[ch][ym].net; });
        var diff = moA - moT, ach = pct(moA, moT);
        var barW = moT > 0 ? Math.min(100, Math.round(moA / moT * 100)) : 0;
        rows += '<tr>';
        rows += '<td style="padding:8px 10px;font-weight:600">' + _amzYmLabel(ym) + '</td>';
        rows += '<td style="padding:8px 10px;text-align:right">' + (moT > 0 ? fmt(moT) : '—') + '</td>';
        rows += '<td style="padding:8px 10px;text-align:right;font-weight:700">' + fmt(moA) + '</td>';
        rows += '<td style="padding:8px 10px;text-align:right;color:' + (moT > 0 ? (diff >= 0 ? '#16a34a' : '#dc2626') : '#94a3b8') + '">' + (moT > 0 ? (diff >= 0 ? '+' : '') + fmt(diff) : '—') + '</td>';
        rows += '<td style="padding:8px 10px;text-align:right;color:' + (moT > 0 ? (parseFloat(ach) >= 100 ? '#16a34a' : '#dc2626') : '#94a3b8') + ';font-weight:600">' + (moT > 0 ? ach + '%' : '—') + '</td>';
        rows += '<td style="padding:8px 10px;width:120px"><div style="background:#f1f5f9;border-radius:4px;height:14px;overflow:hidden"><div style="width:' + barW + '%;height:100%;background:' + (moT > 0 ? (parseFloat(ach) >= 100 ? '#16a34a' : '#ea580c') : '#cbd5e1') + ';border-radius:4px"></div></div></td>';
        rows += '</tr>';
      });
      rows += '<tr style="background:#fef3c7;font-weight:800"><td style="padding:8px 10px">รวม</td>';
      rows += '<td style="padding:8px 10px;text-align:right">' + (grandT > 0 ? fmt(grandT) : '—') + '</td>';
      rows += '<td style="padding:8px 10px;text-align:right">' + fmt(grandA) + '</td>';
      rows += '<td style="padding:8px 10px;text-align:right;color:' + (grandT > 0 ? (gap >= 0 ? '#16a34a' : '#dc2626') : '#94a3b8') + '">' + (grandT > 0 ? (gap >= 0 ? '+' : '') + fmt(gap) : '—') + '</td>';
      rows += '<td style="padding:8px 10px;text-align:right;color:' + (grandT > 0 ? (grandA >= grandT ? '#16a34a' : '#dc2626') : '#94a3b8') + '">' + (grandT > 0 ? achPct + '%' : '—') + '</td>';
      rows += '<td></td></tr>';
      tblBody.innerHTML = rows;
    }

    var chTbl = document.getElementById('amzTargetChTable');
    if (chTbl) {
      var yr = parseInt(_amzTargetYear) || new Date().getFullYear();
      var T = (typeof getTargetByYear === 'function') ? getTargetByYear(yr) : null;
      var amzT = (T && T.amazon) ? T.amazon : {};

      var _regionGroups = [
        { name: 'BKK 1 (ปทุมธานี)', color: '#ea580c', items: [
          { key: 'BKK1_Amazon', label: 'Amazon' },
          { key: 'BKK1_Souvenir', label: 'ร้านของฝาก' }
        ]},
        { name: 'BKK 2 (นนทบุรี)', color: '#2563eb', items: [
          { key: 'BKK2_Amazon', label: 'Amazon' },
          { key: 'BKK2_Souvenir', label: 'ร้านของฝาก' }
        ]},
        { name: 'BKK 3 (สมุทรปราการ)', color: '#7c3aed', items: [
          { key: 'BKK3_Amazon', label: 'Amazon' },
          { key: 'BKK3_Souvenir', label: 'ร้านของฝาก' }
        ]}
      ];
      var _otherRegions = [
        { key: 'North', label: 'North (เหนือ)', color: '#16a34a' },
        { key: 'NE_Upper', label: 'อีสานบน', color: '#0891b2' },
        { key: 'NE_Lower', label: 'อีสานล่าง', color: '#d97706' },
        { key: 'Central', label: 'Central (กลาง)', color: '#e11d48' },
        { key: 'CentralEast', label: 'ตะวันออก', color: '#059669' },
        { key: 'South', label: 'South (ใต้)', color: '#6366f1' }
      ];

      function _sumKeyMonths(key) {
        var s = 0;
        if (!amzT[key] || !amzT[key].monthly) return 0;
        months.forEach(function(ym) {
          var mi = parseInt(ym.split('-')[1]) - 1;
          s += (amzT[key].monthly[mi] || 0);
        });
        return s;
      }
      function _tgtRow(label, tgt, indent, bold) {
        var style = 'padding:8px 10px' + (indent ? ';padding-left:28px' : '') + (bold ? ';font-weight:800' : '');
        var r = '<tr' + (bold ? ' style="background:#fef9c3"' : '') + '>';
        r += '<td style="' + style + '">' + label + '</td>';
        r += '<td style="padding:8px 10px;text-align:right;font-weight:' + (bold ? '800' : '600') + '">' + (tgt > 0 ? fmt(tgt) : '—') + '</td>';
        r += '</tr>';
        return r;
      }

      var html = '<table style="width:100%;border-collapse:collapse;font-size:13px">';
      html += '<thead><tr style="background:#fff7ed;font-size:12px;color:#9a3412">';
      html += '<th style="padding:8px 10px;text-align:left">เขต / ช่องทาง</th>';
      html += '<th style="padding:8px 10px;text-align:right">เป้าหมาย</th>';
      html += '</tr></thead><tbody>';

      var allRegionTotal = 0;
      _regionGroups.forEach(function(rg) {
        var groupTotal = 0;
        html += '<tr style="background:#f8fafc"><td colspan="2" style="padding:10px;font-weight:800;font-size:14px;color:' + rg.color + ';border-top:2px solid ' + rg.color + '">📍 ' + rg.name + '</td></tr>';
        rg.items.forEach(function(item) {
          var t = _sumKeyMonths(item.key);
          groupTotal += t;
          html += _tgtRow(item.label, t, true, false);
        });
        allRegionTotal += groupTotal;
        html += _tgtRow('สรุป ' + rg.name.split(' (')[0], groupTotal, false, true);
      });

      if (_otherRegions.length > 0) {
        html += '<tr style="background:#f8fafc"><td colspan="2" style="padding:10px;font-weight:800;font-size:14px;color:#475569;border-top:2px solid #94a3b8">📍 ต่างจังหวัด</td></tr>';
        var otherTotal = 0;
        _otherRegions.forEach(function(rg) {
          var t = _sumKeyMonths(rg.key);
          otherTotal += t;
          html += '<tr><td style="padding:8px 10px;padding-left:28px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + rg.color + ';margin-right:6px;vertical-align:middle"></span>' + rg.label + '</td>';
          html += '<td style="padding:8px 10px;text-align:right;font-weight:600">' + (t > 0 ? fmt(t) : '—') + '</td></tr>';
        });
        allRegionTotal += otherTotal;
        html += _tgtRow('สรุปต่างจังหวัด', otherTotal, false, true);
      }

      html += '<tr style="background:#fef3c7;font-weight:800;border-top:3px solid #f59e0b"><td style="padding:10px;font-size:14px">🎯 รวมทั้งหมด</td>';
      html += '<td style="padding:10px;text-align:right;font-size:14px">' + (allRegionTotal > 0 ? fmt(allRegionTotal) : '—') + '</td></tr>';
      html += '</tbody></table>';

      html += '<div style="margin-top:16px"><table style="width:100%;border-collapse:collapse;font-size:13px">';
      html += '<thead><tr style="background:#fff7ed;font-size:12px;color:#9a3412">';
      html += '<th style="padding:8px 10px;text-align:left">ช่องทาง</th>';
      html += '<th style="padding:8px 10px;text-align:right">เป้าหมาย</th>';
      html += '<th style="padding:8px 10px;text-align:right">ยอดจริง</th>';
      html += '<th style="padding:8px 10px;text-align:right">Gap</th>';
      html += '<th style="padding:8px 10px;text-align:right">% Achieve</th>';
      html += '<th style="padding:8px 10px">Progress</th>';
      html += '</tr></thead><tbody>';
      chData.forEach(function (d) {
        var diff = d.a - d.t, ach = pct(d.a, d.t);
        var barW = d.t > 0 ? Math.min(100, Math.round(d.a / d.t * 100)) : 0;
        html += '<tr>';
        html += '<td style="padding:8px 10px;font-weight:700"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + d.color + ';margin-right:6px;vertical-align:middle"></span>' + d.ch + '</td>';
        html += '<td style="padding:8px 10px;text-align:right">' + (d.t > 0 ? fmt(d.t) : '—') + '</td>';
        html += '<td style="padding:8px 10px;text-align:right;font-weight:700">' + fmt(d.a) + '</td>';
        html += '<td style="padding:8px 10px;text-align:right;color:' + (d.t > 0 ? (diff >= 0 ? '#16a34a' : '#dc2626') : '#94a3b8') + '">' + (d.t > 0 ? (diff >= 0 ? '+' : '') + fmt(diff) : '—') + '</td>';
        html += '<td style="padding:8px 10px;text-align:right;color:' + (d.t > 0 ? (d.a >= d.t ? '#16a34a' : '#dc2626') : '#94a3b8') + ';font-weight:600">' + (d.t > 0 ? ach + '%' : '—') + '</td>';
        html += '<td style="padding:8px 10px;width:120px"><div style="background:#f1f5f9;border-radius:4px;height:14px;overflow:hidden"><div style="width:' + barW + '%;height:100%;background:' + (d.t > 0 ? (d.a >= d.t ? '#16a34a' : '#ea580c') : '#cbd5e1') + ';border-radius:4px"></div></div></td>';
        html += '</tr>';
      });
      html += '<tr style="background:#fef3c7;font-weight:800"><td style="padding:8px 10px">รวม</td>';
      html += '<td style="padding:8px 10px;text-align:right">' + (grandT > 0 ? fmt(grandT) : '—') + '</td>';
      html += '<td style="padding:8px 10px;text-align:right">' + fmt(grandA) + '</td>';
      html += '<td style="padding:8px 10px;text-align:right;color:' + (grandT > 0 ? (gap >= 0 ? '#16a34a' : '#dc2626') : '#94a3b8') + '">' + (grandT > 0 ? (gap >= 0 ? '+' : '') + fmt(gap) : '—') + '</td>';
      html += '<td style="padding:8px 10px;text-align:right;color:' + (grandT > 0 ? (grandA >= grandT ? '#16a34a' : '#dc2626') : '#94a3b8') + '">' + (grandT > 0 ? achPct + '%' : '—') + '</td>';
      html += '<td></td></tr></tbody></table></div>';
      chTbl.innerHTML = html;
    }

    // ---- กราฟเส้นยอดขายรายเดือนแยกช่องทางย่อย ----
    var yr = parseInt(_amzTargetYear) || new Date().getFullYear();
    var allYm = (D.months || []).filter(function(ym) { return ym.indexOf(String(yr)) === 0; });
    allYm.sort();
    var MO_LABEL = {'01':'ม.ค.','02':'ก.พ.','03':'มี.ค.','04':'เม.ย.','05':'พ.ค.','06':'มิ.ย.','07':'ก.ค.','08':'ส.ค.','09':'ก.ย.','10':'ต.ค.','11':'พ.ย.','12':'ธ.ค.'};
    var moLabels = allYm.map(function(ym) { return MO_LABEL[ym.split('-')[1]] || ym; });
    var lineDatasets = [];
    var chColors = { 'OR':'#ea580c', 'ร้านของฝาก':'#2563eb', 'ลูกค้าทั่วไป':'#16a34a', 'Black Canyon':'#7c3aed', 'Amazon':'#0891b2', 'RM':'#d97706',
      'หนองพงนก':'#e11d48', 'อินทนิล':'#8b5cf6', 'พนักงาน':'#059669' };
    var extraChs = {};
    filteredChs.forEach(function(ch) {
      var vals = allYm.map(function(ym) {
        return (D.monthlyByCh[ch] && D.monthlyByCh[ch][ym]) ? D.monthlyByCh[ch][ym].net : 0;
      });
      var hasData = vals.some(function(v) { return v > 0; });
      if (!hasData) return;
      if (!chColors[ch]) { var ci = Object.keys(extraChs).length; chColors[ch] = palette[ci % palette.length]; }
      lineDatasets.push({
        label: ch,
        data: vals,
        borderColor: chColors[ch],
        backgroundColor: chColors[ch] + '18',
        borderWidth: 2.5,
        pointRadius: 5,
        pointBackgroundColor: chColors[ch],
        tension: 0.3,
        fill: false
      });
    });
    if (lineDatasets.length && allYm.length) {
      mkChart('amzChMonthlyLine', {
        type: 'line',
        data: { labels: moLabels, datasets: lineDatasets },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 12 } } },
            tooltip: { callbacks: { label: function(ctx) { return ctx.dataset.label + ': ' + (ctx.parsed.y >= 1e6 ? (ctx.parsed.y / 1e6).toFixed(2) + ' M' : ctx.parsed.y >= 1e3 ? (ctx.parsed.y / 1e3).toFixed(1) + ' K' : ctx.parsed.y.toLocaleString()); } } }
          },
          scales: {
            y: { beginAtZero: true, ticks: { callback: function(v) { return v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(0) + 'K' : v; } } },
            x: { ticks: { font: { size: 11 } } }
          }
        }
      });
    }
  };

  // ---- RENDER: วิเคราะห์ลูกค้า (amz-cust-analysis) ----
  window.renderAmzCustAnalysis = function () {
    if (typeof AMZ_CUST_DATA === 'undefined') return;

    var chMap = { 'Amazon': 'amazon', 'Souvenir': 'souvenir', 'BlackCanyon': 'amazon' };
    var chFilter = chMap[_amzCh] || 'all';
    var raw = [];
    if (chFilter === 'all' || chFilter === 'amazon') raw = raw.concat(AMZ_CUST_DATA.AMZ || []);
    if (chFilter === 'all' || chFilter === 'souvenir') raw = raw.concat(AMZ_CUST_DATA.SOV || []);
    var data = raw.filter(function(r){ return r.c !== 'Grand Total'; });
    var newCust = data.filter(function (c) { return c.nf && c.nf.length > 0; });
    var lostCust = data.filter(function (c) { return c.lf && c.lf.length > 0; });
    var active = data.filter(function (c) { return !c.lf || c.lf.length === 0; });

    var kpiEl = document.getElementById('amzCustAnalysisKpi');
    if (kpiEl) {
      kpiEl.innerHTML = kpiCard('👥', 'ลูกค้าทั้งหมด', data.length.toString(), 'ราย', '#2563eb')
        + kpiCard('🆕', 'ลูกค้าใหม่', newCust.length.toString(), 'ราย', '#16a34a')
        + kpiCard('📉', 'ลูกค้าหาย', lostCust.length.toString(), 'ราย', '#dc2626')
        + kpiCard('✅', 'ลูกค้าปกติ', active.length.toString(), 'ราย', '#7c3aed');
    }

    var el = document.getElementById('amzCustAnalysisContent');
    if (!el) return;

    var topBuyers = data.slice().sort(function (a, b) { return b.t - a.t; }).slice(0, 20);
    var html = '<div class="card mt" style="margin-bottom:16px"><div class="card-title">🏆 ลูกค้ายอดซื้อสูงสุด (Top 20)</div>';
    html += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#f8fafc;color:#64748b"><th style="padding:8px">#</th><th style="padding:8px">รหัส</th><th style="padding:8px">ชื่อลูกค้า</th><th style="padding:8px">จังหวัด</th><th style="padding:8px;text-align:right">ยอดรวม</th></tr></thead><tbody>';
    topBuyers.forEach(function (c, i) {
      html += '<tr><td style="padding:6px 8px">' + (i + 1) + '</td><td style="padding:6px 8px">' + c.c + '</td><td style="padding:6px 8px">' + c.n + '</td><td style="padding:6px 8px">' + c.p + '</td><td style="padding:6px 8px;text-align:right;font-weight:700;color:#ea580c">' + fmt(c.t) + '</td></tr>';
    });
    html += '</tbody></table></div></div>';

    html += '<div class="card mt"><div class="card-title">📉 ลูกค้าที่หายไป</div>';
    html += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#f8fafc;color:#64748b"><th style="padding:8px">รหัส</th><th style="padding:8px">ชื่อ</th><th style="padding:8px">จังหวัด</th><th style="padding:8px">หายเดือน</th><th style="padding:8px;text-align:right">ยอดรวม</th></tr></thead><tbody>';
    lostCust.slice(0, 30).forEach(function (c) {
      html += '<tr><td style="padding:6px 8px">' + c.c + '</td><td style="padding:6px 8px">' + c.n + '</td><td style="padding:6px 8px">' + c.p + '</td><td style="padding:6px 8px;color:#dc2626">' + c.lf + '</td><td style="padding:6px 8px;text-align:right">' + fmt(c.t) + '</td></tr>';
    });
    if (lostCust.length > 30) html += '<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:12px">... แสดง 30 จาก ' + lostCust.length + ' ราย</td></tr>';
    html += '</tbody></table></div></div>';
    el.innerHTML = html;
  };

  // ---- Helper: build monthly data for SKU Performance chart ----
  function _amzBuildSkuMonthly(pName) {
    if (typeof AMZ_ORDER_DATA === 'undefined') return {};
    var D = AMZ_ORDER_DATA;
    var MO_MAP = {'01':'Jan','02':'Feb','03':'Mar','04':'Apr','05':'May','06':'Jun','07':'Jul','08':'Aug','09':'Sep','10':'Oct','11':'Nov','12':'Dec'};
    var result = {};
    var chFilter = AMZ_CH_MAP[_amzCh];
    var channels = chFilter ? AMZ_CHANNELS.filter(function(c){ return chFilter.indexOf(c) >= 0; }) : null;
    if (!channels && D.prodMonthly && D.prodMonthly[pName]) {
      var pm = D.prodMonthly[pName];
      Object.keys(pm).forEach(function(ym) {
        var mo = MO_MAP[ym.split('-')[1]];
        if (mo) { if (!result[mo]) result[mo] = {b:0,u:0}; result[mo].b += pm[ym].n||0; result[mo].u += pm[ym].q||0; }
      });
    } else if (channels && D.prodMonthlyByCh) {
      channels.forEach(function(ch) {
        if (!D.prodMonthlyByCh[ch] || !D.prodMonthlyByCh[ch][pName]) return;
        var pm = D.prodMonthlyByCh[ch][pName];
        Object.keys(pm).forEach(function(ym) {
          var mo = MO_MAP[ym.split('-')[1]];
          if (mo) { if (!result[mo]) result[mo] = {b:0,u:0}; result[mo].b += pm[ym].n||0; result[mo].u += pm[ym].q||0; }
        });
      });
    }
    return result;
  }

  // ---- RENDER: ผลงานสินค้า (amz-products) — from AMZ_ORDER_DATA ----
  function _amzClassifyType(name) {
    var n = name || '';
    if (/ขนมปัง|แซนด์วิช|แซนวิช|เปี๊ยะ|คอนเฟลก|ท๊อฟฟี่|เมอร์แรง|โลฟ/.test(n)) return 'Ambient';
    return 'Chill';
  }

  function _amzComputeRank(prods) {
    var totalRev = 0;
    prods.forEach(function(d){ totalRev += d.n; });
    var cumul = 0;
    prods.forEach(function(d) {
      cumul += d.n;
      var pct = totalRev > 0 ? (cumul / totalRev) * 100 : 100;
      if (pct <= 20) d.rank = 'A+';
      else if (pct <= 50) d.rank = 'A';
      else if (pct <= 80) d.rank = 'B';
      else d.rank = 'C';
      d.type = _amzClassifyType(d.p);
      d.ppc = d.q > 0 ? d.n / d.q : 0;
    });
  }

  var _amzProdView = 'all';
  var _amzProdPeriod = 'all';
  var _amzProdYear = 'all';

  window._amzProdViewSwitch = function(v, btn) {
    _amzProdView = v;
    document.querySelectorAll('#amzProdViewTabs .fmtab').forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    window.renderAmzProducts();
  };

  window._amzProdSetPeriod = function(p, btn) {
    _amzProdPeriod = p;
    _amzProdYear = 'all';
    document.querySelectorAll('#amzProdPeriodBtns .period-type-btn').forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    var m = document.getElementById('amzProdQtrMenu'); if(m) m.style.display='none';
    var m2 = document.getElementById('amzProdYearMenu'); if(m2) m2.style.display='none';
    window.renderAmzProducts();
  };
  window._amzProdToggleQMenu = function() {
    var m = document.getElementById('amzProdQtrMenu');
    if(m) m.style.display = m.style.display==='none'?'block':'none';
    var m2 = document.getElementById('amzProdYearMenu'); if(m2) m2.style.display='none';
  };
  window._amzProdPickQtr = function(q, btn) {
    // q can be '2026-Q1' (year-specific) or 'q1' (generic)
    if (q.indexOf('-') >= 0) {
      var parts = q.split('-');
      _amzProdYear = parts[0];
      _amzProdPeriod = parts[1].toLowerCase();
    } else {
      _amzProdPeriod = q;
      _amzProdYear = 'all';
    }
    document.querySelectorAll('#amzProdPeriodBtns .period-type-btn').forEach(function(b){ b.classList.remove('active'); });
    var dd = document.getElementById('amzProdQtrDropdown');
    if(dd) dd.querySelector('.period-type-btn').classList.add('active');
    document.querySelectorAll('#amzProdQtrMenu .qmenu-item').forEach(function(b){ b.classList.remove('active'); });
    if(btn) btn.classList.add('active');
    var label = document.getElementById('amzProdQtrLabel');
    if(label) label.textContent = btn ? btn.textContent : '📆 รายไตรมาส';
    var m = document.getElementById('amzProdQtrMenu'); if(m) m.style.display='none';
    window.renderAmzProducts();
  };
  window._amzProdToggleYMenu = function() {
    var m = document.getElementById('amzProdYearMenu');
    if(m) m.style.display = m.style.display==='none'?'block':'none';
    var m2 = document.getElementById('amzProdQtrMenu'); if(m2) m2.style.display='none';
  };
  window._amzProdPickYear = function(y, btn) {
    _amzProdYear = String(y);
    _amzProdPeriod = 'all';
    document.querySelectorAll('#amzProdPeriodBtns .period-type-btn').forEach(function(b){ b.classList.remove('active'); });
    var dd = document.getElementById('amzProdYearDropdown');
    if(dd) dd.querySelector('.period-type-btn').classList.add('active');
    document.querySelectorAll('#amzProdYearMenu .qmenu-item').forEach(function(b){ b.classList.remove('active'); });
    if(btn) btn.classList.add('active');
    var label = document.getElementById('amzProdYearLabel');
    if(label) label.textContent = y === 'all' ? '📅 ทั้งหมด' : '📅 ปี ' + (parseInt(y) + 543);
    var m = document.getElementById('amzProdYearMenu'); if(m) m.style.display='none';
    window.renderAmzProducts();
  };

  function _amzProdFilterMonths(allMonths) {
    var byYear = (_amzProdYear === 'all') ? allMonths : allMonths.filter(function(ym) { return ym.indexOf(_amzProdYear) === 0; });
    if (_amzProdPeriod === 'all') return byYear;
    var now = new Date(), y = now.getFullYear(), m = now.getMonth();
    if (_amzProdPeriod === 'thismonth') {
      var k = y+'-'+String(m+1).replace(/^(\d)$/,'0$1');
      return byYear.filter(function(ym){ return ym === k; });
    }
    if (_amzProdPeriod === 'lastmonth') {
      var d = new Date(y, m-1, 1);
      var k = d.getFullYear()+'-'+String(d.getMonth()+1).replace(/^(\d)$/,'0$1');
      return byYear.filter(function(ym){ return ym === k; });
    }
    var qMap = { q1:['01','02','03'], q2:['04','05','06'], q3:['07','08','09'], q4:['10','11','12'] };
    if (qMap[_amzProdPeriod]) {
      var allowed = qMap[_amzProdPeriod];
      return byYear.filter(function(ym){ return allowed.indexOf(ym.split('-')[1]) >= 0; });
    }
    return byYear;
  }

  function _amzProdPeriodInfo(months) {
    if (!months.length) return '';
    return 'กำลังแสดง: ' + _amzYmLabel(months[0]) + ' – ' + _amzYmLabel(months[months.length-1]);
  }

  window.renderAmzProducts = function () {
    if (typeof AMZ_ORDER_DATA === 'undefined') return;
    var D = AMZ_ORDER_DATA;
    var chFilter = AMZ_CH_MAP[_amzCh];
    var channels = chFilter ? AMZ_CHANNELS.filter(function(c){ return chFilter.indexOf(c) >= 0; }) : null;

    var allMonths = D.months || [];
    var filteredMonths = _amzProdFilterMonths(allMonths);
    var isPeriodFiltered = filteredMonths.length < allMonths.length;

    var prods;
    if (isPeriodFiltered && (D.prodMonthly || D.prodMonthlyByCh)) {
      var prodMap = {};
      if (!channels) {
        var pm = D.prodMonthly || {};
        Object.keys(pm).forEach(function(pName) {
          filteredMonths.forEach(function(ym) {
            if (pm[pName][ym]) {
              if (!prodMap[pName]) prodMap[pName] = { p: pName, n: 0, q: 0 };
              prodMap[pName].n += pm[pName][ym].n;
              prodMap[pName].q += pm[pName][ym].q;
            }
          });
        });
      } else {
        var cpm = D.prodMonthlyByCh || {};
        channels.forEach(function(ch) {
          if (!cpm[ch]) return;
          Object.keys(cpm[ch]).forEach(function(pName) {
            filteredMonths.forEach(function(ym) {
              if (cpm[ch][pName][ym]) {
                if (!prodMap[pName]) prodMap[pName] = { p: pName, n: 0, q: 0 };
                prodMap[pName].n += cpm[ch][pName][ym].n;
                prodMap[pName].q += cpm[ch][pName][ym].q;
              }
            });
          });
        });
      }
      prods = Object.values(prodMap).sort(function(a,b){ return b.n - a.n; }).slice(0, 30);
    } else {
      if (!channels) {
        prods = (D.topProdAll || []).map(function(d){ return { p: d.p, n: d.n, q: d.q }; });
      } else {
        var prodMap2 = {};
        channels.forEach(function(ch) {
          (D.topProdByCh[ch] || []).forEach(function(d) {
            if (!prodMap2[d.p]) prodMap2[d.p] = { p: d.p, n: 0, q: 0 };
            prodMap2[d.p].n += d.n; prodMap2[d.p].q += d.q;
          });
        });
        prods = Object.values(prodMap2).sort(function(a,b){ return b.n - a.n; });
      }
    }
    _amzComputeRank(prods);

    // Build monthly data for each product
    prods.forEach(function(d){ d._m = _amzBuildSkuMonthly(d.p); });

    var filtered = prods;
    if (_amzProdView === 'ambient') filtered = prods.filter(function(d){ return d.type === 'Ambient'; });
    else if (_amzProdView === 'chill') filtered = prods.filter(function(d){ return d.type === 'Chill'; });

    var periodNet = 0, periodQty = 0;
    filteredMonths.forEach(function(ym){
      if (chFilter) {
        (channels || []).forEach(function(ch){ if(D.monthlyByCh[ch] && D.monthlyByCh[ch][ym]) { periodNet += D.monthlyByCh[ch][ym].net; periodQty += D.monthlyByCh[ch][ym].qty; } });
      } else {
        if (D.monthlyAll[ym]) { periodNet += D.monthlyAll[ym].net; periodQty += D.monthlyAll[ym].qty; }
      }
    });
    var periodInfoText = _amzProdPeriodInfo(filteredMonths);
    var periodLabel = filteredMonths.length ? _amzYmLabel(filteredMonths[0]) + ' – ' + _amzYmLabel(filteredMonths[filteredMonths.length-1]) : '-';

    var el = document.getElementById('amz-products');
    if (!el) return;

    var totalRev = 0, totalQty = 0, ambientB = 0, chillB = 0, ambientCount = 0, chillCount = 0;
    prods.forEach(function(d){ totalRev += d.n; totalQty += d.q; if(d.type==='Ambient'){ambientB+=d.n;ambientCount++;} else {chillB+=d.n;chillCount++;} });
    var rankCounts = { 'A+':0, 'A':0, 'B':0, 'C':0 };
    prods.forEach(function(d){ rankCounts[d.rank]++; });

    var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var MONTH_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    var fmtB = function(n){if(n>=1e6)return(n/1e6).toFixed(2)+' M';if(n>=1e3)return(n/1e3).toFixed(1)+' K';return Math.round(n).toLocaleString();};
    var fmtQ = function(n){return Math.round(n).toLocaleString('th-TH');};
    var chLabel = _amzCh === 'all' ? 'ทุกช่องทาง' : (_amzCh === 'amazon' ? 'Amazon' : _amzCh === 'telesale' ? 'Telesale' : _amzCh);
    var _amzSrc = 'อเมซอน & ของฝาก' + (_amzCh !== 'all' ? ' — ' + chLabel : '');

    // Collect active months from product data
    var activeMonths = [];
    prods.forEach(function(d){ if(d._m){Object.keys(d._m).forEach(function(mk){if(activeMonths.indexOf(mk)===-1)activeMonths.push(mk);});} });
    activeMonths.sort(function(a,b){return MONTHS.indexOf(a)-MONTHS.indexOf(b);});

    var html = '';
    var _yoyChartData = null;

    // ── 1. Gradient header ──
    html += '<div class="card" style="background:linear-gradient(135deg,#ea580c,#fb923c);color:#fff;padding:24px 28px;margin-bottom:18px;border-radius:14px">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
    html += '<div><div style="font-size:20px;font-weight:800">🍞 ผลงานสินค้า</div>';
    html += '<div style="font-size:13px;opacity:.85;margin-top:4px">' + chLabel + ' — วิเคราะห์ผลงานสินค้าทุก SKU (' + periodLabel + ')</div></div>';
    html += '<div style="background:rgba(255,255,255,.2);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700">' + chLabel + '</div>';
    html += '</div></div>';

    // ── 2. KPI cards (4 cards) ──
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">';
    html += '<div class="card" style="text-align:center;padding:16px"><div style="font-size:11px;color:var(--muted)">จำนวน SKU</div><div style="font-size:22px;font-weight:800;color:#4f46e5">' + prods.length + '</div></div>';
    html += '<div class="card" style="text-align:center;padding:16px"><div style="font-size:11px;color:var(--muted)">ยอดขายรวม (บาท)</div><div style="font-size:22px;font-weight:800;color:#16a34a">' + fmtB(totalRev) + '</div></div>';
    html += '<div class="card" style="text-align:center;padding:16px"><div style="font-size:11px;color:var(--muted)">ยอดขายรวม (ชิ้น)</div><div style="font-size:22px;font-weight:800;color:#0891b2">' + fmtQ(totalQty) + '</div></div>';
    html += '<div class="card" style="text-align:center;padding:16px"><div style="font-size:11px;color:var(--muted)">Ambient / Chill</div><div style="font-size:22px;font-weight:800;color:#d97706">' + ambientCount + ' / ' + chillCount + '</div></div>';
    html += '</div>';

    // ── 3. Charts: Top 10 bar + Ambient vs Chill pie ──
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">';
    html += '<div class="card"><div class="card-title">📊 Top 10 สินค้าขายดี (บาท)</div>';
    html += '<div style="position:relative;height:300px"><canvas id="amzPPTop10Chart"></canvas></div></div>';
    html += '<div class="card"><div class="card-title">📊 Ambient vs Chill</div>';
    html += '<div style="position:relative;height:300px"><canvas id="amzPPTypeChart"></canvas></div></div>';
    html += '</div>';

    // ── 3.5. Year-over-Year Comparison ──
    var _yoyYearSet = {};
    allMonths.forEach(function(ym) { var y = ym.split('-')[0]; if (!_yoyYearSet[y]) _yoyYearSet[y] = []; _yoyYearSet[y].push(ym); });
    var _yoySorted = Object.keys(_yoyYearSet).sort();
    if (_yoySorted.length >= 2) {
      var _yCY = _yoySorted[_yoySorted.length - 1];
      var _yPY = _yoySorted[_yoySorted.length - 2];
      var _yBaseM;
      if (_amzProdPeriod !== 'all' || _amzProdYear !== 'all') {
        _yBaseM = [];
        filteredMonths.forEach(function(ym) { var mn = ym.split('-')[1]; if (_yBaseM.indexOf(mn) === -1) _yBaseM.push(mn); });
      } else {
        _yBaseM = _yoyYearSet[_yCY].map(function(ym) { return ym.split('-')[1]; });
      }
      var _yCurMs = _yBaseM.map(function(m) { return _yCY + '-' + m; }).filter(function(ym) { return allMonths.indexOf(ym) >= 0; });
      var _yPrvMs = _yBaseM.map(function(m) { return _yPY + '-' + m; }).filter(function(ym) { return allMonths.indexOf(ym) >= 0; });
      if (_yCurMs.length || _yPrvMs.length) {
        var _yMap = {};
        var _yPM = D.prodMonthly || {};
        var _yCPM = D.prodMonthlyByCh || {};
        var _yAgg = function(pN, ms) {
          var s = { n: 0, q: 0 };
          if (!channels) { if (_yPM[pN]) ms.forEach(function(ym) { if (_yPM[pN][ym]) { s.n += _yPM[pN][ym].n || 0; s.q += _yPM[pN][ym].q || 0; } }); }
          else { channels.forEach(function(ch) { if (_yCPM[ch] && _yCPM[ch][pN]) ms.forEach(function(ym) { if (_yCPM[ch][pN][ym]) { s.n += _yCPM[ch][pN][ym].n || 0; s.q += _yCPM[ch][pN][ym].q || 0; } }); }); }
          return s;
        };
        var _yPN = {};
        if (!channels) { Object.keys(_yPM).forEach(function(p) { _yPN[p] = 1; }); }
        else { channels.forEach(function(ch) { if (_yCPM[ch]) Object.keys(_yCPM[ch]).forEach(function(p) { _yPN[p] = 1; }); }); }
        Object.keys(_yPN).forEach(function(p) {
          var c = _yAgg(p, _yCurMs), v = _yAgg(p, _yPrvMs);
          if (c.n > 0 || v.n > 0) _yMap[p] = { p: p, cn: c.n, cq: c.q, pn: v.n, pq: v.q };
        });
        var _yList = Object.values(_yMap).sort(function(a, b) { return (b.cn + b.pn) - (a.cn + a.pn); });
        var _yTC = { n: 0, q: 0 }, _yTP = { n: 0, q: 0 };
        _yList.forEach(function(d) { _yTC.n += d.cn; _yTC.q += d.cq; _yTP.n += d.pn; _yTP.q += d.pq; });
        var _yGN = _yTP.n > 0 ? ((_yTC.n - _yTP.n) / _yTP.n * 100) : (_yTC.n > 0 ? 100 : 0);
        var _yGQ = _yTP.q > 0 ? ((_yTC.q - _yTP.q) / _yTP.q * 100) : (_yTC.q > 0 ? 100 : 0);
        var _bCY = parseInt(_yCY) + 543, _bPY = parseInt(_yPY) + 543;
        var _yPLabel = _yBaseM.map(function(m) { return MONTH_TH[parseInt(m) - 1]; }).join(', ');
        _yoyChartData = { list: _yList, bePY: _bPY, beCY: _bCY };
        html += window.buildYoYHTML(_yList, _bPY, _bCY, _yPLabel, 'amzYoYChart');
      }
    }

    // ── 4. Category summary cards ──
    var PP_CATS = [
      {key:'cake',label:'กลุ่มขนมเค้ก',icon:'🎂',clr:'#e11d48',match:function(n){return(n.indexOf('เค้ก')!==-1||n.indexOf('มูส')!==-1||n.indexOf('เบาหวิว')!==-1||n.indexOf('บราวนี่')!==-1||n.indexOf('ลาวา')!==-1||n.indexOf('คัพเค้ก')!==-1)&&n.indexOf('ชิฟฟ่อน')===-1&&n.indexOf('วุ้น')===-1;}},
      {key:'bread',label:'กลุ่มขนมปัง',icon:'🍞',clr:'#d97706',match:function(n){return n.indexOf('ขนมปัง')!==-1||n.indexOf('ปังเนย')!==-1||n.indexOf('ปังสังขยา')!==-1||n.indexOf('ปังลาวา')!==-1||n.substring(0,3)==='ปัง';}},
      {key:'sandwich',label:'กลุ่มแซนวิช',icon:'🥪',clr:'#0891b2',match:function(n){return n.indexOf('แซนวิช')!==-1||n.indexOf('แซนด์วิช')!==-1;}},
      {key:'jelly',label:'กลุ่มวุ้น',icon:'🍮',clr:'#7c3aed',match:function(n){return n.indexOf('วุ้น')!==-1;}},
      {key:'chiffon',label:'กลุ่มชิฟฟ่อน',icon:'🧁',clr:'#16a34a',match:function(n){return n.indexOf('ชิฟฟ่อน')!==-1;}}
    ];
    function _amzGetCat(name){for(var i=0;i<PP_CATS.length;i++){if(PP_CATS[i].match(name))return PP_CATS[i].key;}return 'other';}
    var catCounts = {};
    PP_CATS.forEach(function(c){catCounts[c.key]=[];});
    catCounts.other = [];
    prods.forEach(function(d){var cat=_amzGetCat(d.p);catCounts[cat].push(d);});

    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:16px">';
    PP_CATS.forEach(function(c){
      var items = catCounts[c.key];
      var catTotal = items.reduce(function(s,d){return s+(d.n||0);},0);
      html += '<div class="card" style="padding:14px;text-align:center;border-left:4px solid '+c.clr+'">'
        +'<div style="font-size:18px">'+c.icon+'</div>'
        +'<div style="font-size:12px;font-weight:700;color:'+c.clr+';margin:4px 0">'+c.label+'</div>'
        +'<div style="font-size:16px;font-weight:800;color:var(--text)">'+items.length+' SKU</div>'
        +'<div style="font-size:11px;color:var(--muted)">฿'+fmtB(catTotal)+'</div></div>';
    });
    var otherItems = catCounts.other;
    var otherTotal = otherItems.reduce(function(s,d){return s+(d.n||0);},0);
    html += '<div class="card" style="padding:14px;text-align:center;border-left:4px solid #94a3b8">'
      +'<div style="font-size:18px">📦</div>'
      +'<div style="font-size:12px;font-weight:700;color:#94a3b8;margin:4px 0">อื่นๆ</div>'
      +'<div style="font-size:16px;font-weight:800;color:var(--text)">'+otherItems.length+' SKU</div>'
      +'<div style="font-size:11px;color:var(--muted)">฿'+fmtB(otherTotal)+'</div></div>';
    html += '</div>';

    // ── 5. Top 20 per category tables ──
    var MEDAL3 = ['🥇','🥈','🥉'];
    PP_CATS.forEach(function(c){
      var catItems = catCounts[c.key].slice().sort(function(a,b){return(b.n||0)-(a.n||0);}).slice(0,20);
      if(!catItems.length) return;
      var catTotal = catItems.reduce(function(s,d){return s+(d.n||0);},0);
      html += '<div class="card" style="margin-bottom:14px;border-left:4px solid '+c.clr+'">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px">';
      html += '<div style="font-size:15px;font-weight:800;color:'+c.clr+'">'+c.icon+' Top 20 '+c.label+' <span style="font-size:11px;color:var(--muted);font-weight:500">('+catCounts[c.key].length+' SKU)</span></div>';
      html += '<div style="font-size:13px;font-weight:700;color:'+c.clr+'">รวม ฿'+fmtB(catTotal)+'</div></div>';
      html += '<div class="table-wrap"><table style="width:100%;border-collapse:collapse"><thead><tr>';
      html += '<th style="padding:6px 8px;background:'+c.clr+';color:#fff;font-size:11px;text-align:center;border-radius:6px 0 0 0">#</th>';
      html += '<th style="padding:6px 8px;background:'+c.clr+';color:#fff;font-size:11px;text-align:left">ชื่อสินค้า</th>';
      html += '<th style="padding:6px 8px;background:'+c.clr+';color:#fff;font-size:11px;text-align:center">TYPE</th>';
      html += '<th style="padding:6px 8px;background:'+c.clr+';color:#fff;font-size:11px;text-align:center">RANK</th>';
      html += '<th style="padding:6px 8px;background:'+c.clr+';color:#fff;font-size:11px;text-align:right">จำนวนขาย</th>';
      html += '<th style="padding:6px 8px;background:'+c.clr+';color:#fff;font-size:11px;text-align:right">ยอดขาย (฿)</th>';
      html += '<th style="padding:6px 8px;background:'+c.clr+';color:#fff;font-size:11px;text-align:right;border-radius:0 6px 0 0">%</th>';
      html += '</tr></thead><tbody>';
      catItems.forEach(function(d,i){
        var pct = totalRev>0?((d.n/totalRev)*100).toFixed(1):'0';
        var bg3 = i%2?'rgba(0,0,0,.02)':'transparent';
        var rankClr = d.rank==='A+'?'#dc2626':d.rank==='A'?'#ea580c':d.rank==='B'?'#d97706':'#94a3b8';
        var _cmJson = JSON.stringify(d._m||{}).replace(/'/g,"\\'").replace(/"/g,'&quot;');
        var _cpName = d.p.replace(/'/g,"\\'");
        html += '<tr style="background:'+bg3+'">';
        html += '<td style="padding:5px 8px;text-align:center;font-size:11px;color:var(--muted)">'+(MEDAL3[i]||(i+1))+'</td>';
        html += '<td style="padding:5px 8px;font-weight:600;font-size:12px">'+d.p+'</td>';
        html += '<td style="padding:5px 8px;text-align:center"><span style="padding:1px 6px;border-radius:8px;font-size:10px;font-weight:700;background:'+(d.type==='Ambient'?'#fff7ed':'#eff6ff')+';color:'+(d.type==='Ambient'?'#ea580c':'#2563eb')+'">'+d.type+'</span></td>';
        html += '<td style="padding:5px 8px;text-align:center"><span style="padding:1px 6px;border-radius:8px;font-size:10px;font-weight:800;color:#fff;background:'+rankClr+'">'+d.rank+'</span></td>';
        html += '<td style="padding:5px 8px;text-align:right;font-size:12px;color:var(--text)">'+fmtQ(d.q)+' ชิ้น</td>';
        html += '<td style="padding:5px 8px;text-align:right;font-weight:700;color:'+c.clr+'">฿'+fmtB(d.n)+'</td>';
        html += '<td style="padding:5px 8px;text-align:right;font-size:12px;color:var(--muted)">'+pct+'%</td>';
        html += '</tr>';
      });
      html += '</tbody></table></div></div>';
    });

    // ── 6. View tabs + Full product table with filters ──
    html += '<div class="card" style="margin-bottom:16px">';
    html += '<div class="card-title">📋 ตารางผลงานสินค้า</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;align-items:center">';
    html += '<select id="amzPPFilterType" onchange="_amzPPFilterTable()" style="padding:6px 12px;border-radius:8px;border:1px solid var(--border);font-size:13px;background:var(--card);color:var(--text)">';
    html += '<option value="all">ประเภท: ทั้งหมด</option><option value="Ambient">Ambient</option><option value="Chill">Chill</option></select>';
    html += '<select id="amzPPFilterRank" onchange="_amzPPFilterTable()" style="padding:6px 12px;border-radius:8px;border:1px solid var(--border);font-size:13px;background:var(--card);color:var(--text)">';
    html += '<option value="all">Rank: ทั้งหมด</option><option value="A+">A+</option><option value="A">A</option><option value="B">B</option><option value="C">C</option></select>';
    html += '<input id="amzPPSearch" oninput="_amzPPFilterTable()" placeholder="🔍 ค้นหาสินค้า..." style="padding:6px 12px;border-radius:8px;border:1px solid var(--border);font-size:13px;flex:1;min-width:180px;background:var(--card);color:var(--text)">';
    html += '</div>';

    html += '<div class="table-wrap"><table id="amzPPProdTable"><thead><tr>';
    html += '<th>NO</th><th style="text-align:left">ชื่อสินค้า</th><th>TYPE</th><th>RANK</th><th style="text-align:right">฿/ชิ้น</th><th style="text-align:right">รวมชิ้น</th><th style="text-align:right">รวมบาท</th><th style="text-align:right">%REVENUE</th><th>Performance</th><th style="width:40px"></th>';
    html += '</tr></thead><tbody>';
    prods.forEach(function(d,i){
      var pct = totalRev>0?((d.n/totalRev)*100):0;
      var rankColor = d.rank==='A+'?'#dc2626':d.rank==='A'?'#ea580c':d.rank==='B'?'#d97706':'#94a3b8';
      var _mv=activeMonths.map(function(mk){return d._m&&d._m[mk]?d._m[mk].b||0:0;});
      var _pf=window.calcPerf(_mv);
      html += '<tr data-type="'+d.type+'" data-rank="'+d.rank+'" data-name="'+(d.p||'').toLowerCase()+'">';
      html += '<td style="text-align:center">'+(i+1)+'</td>';
      var _cmJson2 = JSON.stringify(d._m||{}).replace(/'/g,"\\'").replace(/"/g,'&quot;');
      var _cpName2 = d.p.replace(/'/g,"\\'");
      html += '<td style="text-align:left;max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="'+d.p+'">'+d.p+'</td>';
      html += '<td style="text-align:center"><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;background:'+(d.type==='Ambient'?'#fff7ed':'#eff6ff')+';color:'+(d.type==='Ambient'?'#ea580c':'#2563eb')+'">'+d.type+'</span></td>';
      html += '<td style="text-align:center"><span style="display:inline-block;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:800;color:#fff;background:'+rankColor+'">'+d.rank+'</span></td>';
      html += '<td style="text-align:right;font-weight:600">'+d.ppc.toFixed(2)+'</td>';
      html += '<td style="text-align:right;font-weight:600">'+fmtQ(d.q)+'</td>';
      html += '<td style="text-align:right;font-weight:600">'+fmtB(d.n)+'</td>';
      html += '<td style="text-align:right">'+pct.toFixed(1)+'%</td>';
      html += '<td style="text-align:center">'+window.perfBadgeHTML(_pf)+'</td>';
      html += '<td style="text-align:center" onclick="showSkuPerf(\''+_cpName2+'\',JSON.parse(this.getAttribute(\'data-m\')),\''+_amzSrc.replace(/'/g,"\\'")+'\')" data-m="'+_cmJson2+'">'+window.perfSearchIcon()+'</td>';
      html += '</tr>';
    });
    html += '</tbody></table></div></div>';

    // ── 7. Monthly sales breakdown table ──
    if(activeMonths.length>0){
      html += '<div class="card" style="margin-bottom:16px">';
      html += '<div class="card-title">📅 ยอดขายรายเดือน</div>';
      html += '<div style="display:flex;gap:8px;margin-bottom:10px">';
      html += '<button id="amzPPMonthUnit" onclick="_amzPPToggleMonthUnit()" style="padding:4px 14px;border-radius:8px;border:1px solid var(--border);font-size:12px;cursor:pointer;background:var(--card);color:var(--text)">แสดง: บาท</button>';
      html += '</div>';
      html += '<div class="table-wrap"><table id="amzPPMonthTable"><thead><tr>';
      html += '<th style="text-align:left;position:sticky;left:0;background:var(--card);z-index:2">ชื่อสินค้า</th>';
      activeMonths.forEach(function(mk){
        var idx = MONTHS.indexOf(mk);
        html += '<th style="text-align:right">'+(idx>=0?MONTH_TH[idx]:mk)+'</th>';
      });
      html += '<th style="text-align:right;font-weight:800">ยอดรวม</th>';
      html += '<th>Performance</th><th style="width:40px"></th>';
      html += '</tr></thead><tbody>';
      prods.forEach(function(d){
        var _mJson = JSON.stringify(d._m||{}).replace(/'/g,"\\'").replace(/"/g,'&quot;');
        var _pName = d.p.replace(/'/g,"\\'");
        var _mv2=activeMonths.map(function(mk){return d._m&&d._m[mk]?d._m[mk].b||0:0;});
        var _pf2=window.calcPerf(_mv2);
        html += '<tr data-mtype="'+d.type+'" data-mrank="'+d.rank+'">';
        html += '<td style="text-align:left;position:sticky;left:0;background:var(--card);z-index:1;max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px" title="'+d.p+'">'+d.p+'</td>';
        activeMonths.forEach(function(mk){
          var md = d._m&&d._m[mk]?d._m[mk]:null;
          html += '<td style="text-align:right;font-size:12px" data-b="'+(md?md.b:0)+'" data-q="'+(md?md.u:0)+'">'+(md?fmtB(md.b):'—')+'</td>';
        });
        html += '<td style="text-align:right;font-weight:700;font-size:12px">'+fmtB(d.n)+'</td>';
        html += '<td style="text-align:center">'+window.perfBadgeHTML(_pf2)+'</td>';
        html += '<td style="text-align:center" onclick="showSkuPerf(\''+_pName+'\',JSON.parse(this.getAttribute(\'data-m\')),\''+_amzSrc.replace(/'/g,"\\'")+'\')" data-m="'+_mJson+'">'+window.perfSearchIcon()+'</td>';
        html += '</tr>';
      });
      html += '<tr style="font-weight:800;background:var(--hover)">';
      html += '<td style="text-align:left;position:sticky;left:0;background:var(--hover);z-index:1">รวมทั้งหมด</td>';
      activeMonths.forEach(function(mk){
        var sumB = 0;
        prods.forEach(function(d){if(d._m&&d._m[mk])sumB+=d._m[mk].b||0;});
        html += '<td style="text-align:right;font-size:12px">'+fmtB(sumB)+'</td>';
      });
      html += '<td style="text-align:right;font-size:12px">'+fmtB(totalRev)+'</td>';
      html += '<td></td><td></td>';
      html += '</tr>';
      html += '</tbody></table></div></div>';
    }

    html += '<div style="text-align:center;padding:12px;color:var(--muted);font-size:11px">';
    html += '📄 ข้อมูลจาก Amazon & ของฝาก — '+chLabel+'</div>';

    el.innerHTML = html;

    // Delayed chart init
    setTimeout(function(){_amzPPInitCharts(prods, ambientB, chillB);if(_yoyChartData){if(_amzPPYoYChart){try{_amzPPYoYChart.destroy();}catch(e){}}_amzPPYoYChart=window.initYoYChart('amzYoYChart',_yoyChartData.list,_yoyChartData.bePY,_yoyChartData.beCY);}},100);
  };

  // ── Chart init for AMZ product performance ──
  var _amzPPChart1 = null, _amzPPChart2 = null, _amzPPYoYChart = null;
  function _amzPPInitCharts(products, ambientB, chillB){
    if(_amzPPChart1){try{_amzPPChart1.destroy();}catch(e){}} _amzPPChart1=null;
    if(_amzPPChart2){try{_amzPPChart2.destroy();}catch(e){}} _amzPPChart2=null;
    var top10 = products.slice().sort(function(a,b){return(b.n||0)-(a.n||0);}).slice(0,10);
    var barColors = ['#4f46e5','#2563eb','#0891b2','#0d9488','#16a34a','#65a30d','#d97706','#ea580c','#dc2626','#7c3aed'];
    var ctx1 = document.getElementById('amzPPTop10Chart');
    if(ctx1){
      _amzPPChart1 = new Chart(ctx1.getContext('2d'),{
        type:'bar',
        data:{
          labels:top10.map(function(d){var n=d.p;return n.length>25?n.substring(0,25)+'…':n;}),
          datasets:[{data:top10.map(function(d){return d.n||0;}),backgroundColor:barColors.slice(0,top10.length),borderRadius:4,barThickness:20}]
        },
        options:{
          indexAxis:'y',responsive:true,maintainAspectRatio:false,
          plugins:{legend:{display:false},tooltip:{callbacks:{label:function(ctx){return Math.round(ctx.raw).toLocaleString('th-TH')+' บาท';}}}},
          scales:{x:{ticks:{callback:function(v){return(v/1e6).toFixed(1)+'M';}},beginAtZero:true,grid:{color:'rgba(0,0,0,0.05)'}},y:{grid:{display:false},ticks:{font:{size:11}}}}
        }
      });
    }
    var ctx2 = document.getElementById('amzPPTypeChart');
    if(ctx2){
      _amzPPChart2 = new Chart(ctx2.getContext('2d'),{
        type:'doughnut',
        data:{labels:['Ambient','Chill'],datasets:[{data:[ambientB,chillB],backgroundColor:['#f97316','#3b82f6'],borderWidth:2}]},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:function(ctx){var v=ctx.raw;var t=ambientB+chillB;return ctx.label+': '+(v/1e6).toFixed(2)+'M ('+(t>0?(v/t*100).toFixed(1):0)+'%)';}}}}}
      });
    }
  }

  // ── Filter table for AMZ product performance ──
  window._amzPPFilterTable = function(){
    var typeF = document.getElementById('amzPPFilterType');
    var rankF = document.getElementById('amzPPFilterRank');
    var searchF = document.getElementById('amzPPSearch');
    var tv = typeF?typeF.value:'all';
    var rv = rankF?rankF.value:'all';
    var sv = searchF?(searchF.value||'').toLowerCase():'';
    var tbl = document.getElementById('amzPPProdTable');
    if(!tbl) return;
    var rows = tbl.querySelectorAll('tbody tr');
    rows.forEach(function(row){
      var t = row.getAttribute('data-type')||'';
      var r = row.getAttribute('data-rank')||'';
      var n = row.getAttribute('data-name')||'';
      var show = (tv==='all'||t===tv) && (rv==='all'||r===rv) && (!sv||n.indexOf(sv)!==-1);
      row.style.display = show?'':'none';
    });
  };

  // ── Toggle month unit for AMZ product performance ──
  window._amzPPToggleMonthUnit = function(){
    var btn = document.getElementById('amzPPMonthUnit');
    var tbl = document.getElementById('amzPPMonthTable');
    if(!btn||!tbl) return;
    var showQty = btn.textContent.indexOf('บาท')!==-1;
    btn.textContent = showQty?'แสดง: ชิ้น':'แสดง: บาท';
    var fmtB2 = function(n){if(n>=1e6)return(n/1e6).toFixed(2)+' M';if(n>=1e3)return(n/1e3).toFixed(1)+' K';return Math.round(n).toLocaleString();};
    var fmtQ2 = function(n){return Math.round(n).toLocaleString('th-TH');};
    var cells = tbl.querySelectorAll('tbody td[data-b]');
    cells.forEach(function(td){
      var b = parseFloat(td.getAttribute('data-b'))||0;
      var q = parseFloat(td.getAttribute('data-q'))||0;
      if(b===0&&q===0){td.textContent='—';return;}
      td.textContent = showQty?fmtQ2(q):fmtB2(b);
    });
  };

  // ---- RENDER: คำสั่งซื้อ (amz-order) — from Excel data ----
  var _orderRendered = false;
  var _amzOrderPeriod = 'all';
  var _amzOrderYear = 'all';

  function _amzOrderFilterMonths(allMonths) {
    var byYear = (_amzOrderYear === 'all') ? allMonths : allMonths.filter(function(ym) { return ym.indexOf(_amzOrderYear) === 0; });
    if (_amzOrderPeriod === 'all') return byYear;
    var now = new Date(), curYear = now.getFullYear(), curMo = now.getMonth();
    if (_amzOrderPeriod === 'thismonth') {
      var key = curYear + '-' + String(curMo+1).replace(/^(\d)$/,'0$1');
      return byYear.filter(function(ym){ return ym === key; });
    }
    if (_amzOrderPeriod === 'lastmonth') {
      var d = new Date(curYear, curMo - 1, 1);
      var key = d.getFullYear() + '-' + String(d.getMonth()+1).replace(/^(\d)$/,'0$1');
      return byYear.filter(function(ym){ return ym === key; });
    }
    var qMap = { q1:['01','02','03'], q2:['04','05','06'], q3:['07','08','09'], q4:['10','11','12'] };
    if (qMap[_amzOrderPeriod]) {
      var allowed = qMap[_amzOrderPeriod];
      return byYear.filter(function(ym){ return allowed.indexOf(ym.split('-')[1]) >= 0; });
    }
    return byYear;
  }

  window._amzOrderSetPeriod = function(p, btn) {
    _amzOrderPeriod = p;
    _amzOrderYear = 'all';
    document.querySelectorAll('#amzOrderPeriodBtns .period-type-btn').forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    var m = document.getElementById('amzOrderQtrMenu'); if(m) m.style.display='none';
    var m2 = document.getElementById('amzOrderYearMenu'); if(m2) m2.style.display='none';
    renderAmzOrder();
  };
  window._amzOrderToggleQMenu = function() {
    var m = document.getElementById('amzOrderQtrMenu');
    if(m) m.style.display = m.style.display==='none'?'block':'none';
    var m2 = document.getElementById('amzOrderYearMenu'); if(m2) m2.style.display='none';
  };
  window._amzOrderPickQtr = function(q, btn) {
    if (q.indexOf('-') >= 0) {
      var parts = q.split('-');
      _amzOrderYear = parts[0];
      _amzOrderPeriod = parts[1].toLowerCase();
    } else {
      _amzOrderPeriod = q;
      _amzOrderYear = 'all';
    }
    document.querySelectorAll('#amzOrderPeriodBtns .period-type-btn').forEach(function(b){ b.classList.remove('active'); });
    var dd = document.getElementById('amzOrderQtrDropdown');
    if(dd) dd.querySelector('.period-type-btn').classList.add('active');
    document.querySelectorAll('#amzOrderQtrMenu .qmenu-item').forEach(function(b){ b.classList.remove('active'); });
    if(btn) btn.classList.add('active');
    var label = document.getElementById('amzOrderQtrLabel');
    if(label) label.textContent = btn ? btn.textContent : '📆 รายไตรมาส';
    var m = document.getElementById('amzOrderQtrMenu'); if(m) m.style.display='none';
    renderAmzOrder();
  };
  window._amzOrderToggleYMenu = function() {
    var m = document.getElementById('amzOrderYearMenu');
    if(m) m.style.display = m.style.display==='none'?'block':'none';
    var m2 = document.getElementById('amzOrderQtrMenu'); if(m2) m2.style.display='none';
  };
  window._amzOrderPickYear = function(y, btn) {
    _amzOrderYear = String(y);
    _amzOrderPeriod = 'all';
    document.querySelectorAll('#amzOrderPeriodBtns .period-type-btn').forEach(function(b){ b.classList.remove('active'); });
    var dd = document.getElementById('amzOrderYearDropdown');
    if(dd) dd.querySelector('.period-type-btn').classList.add('active');
    document.querySelectorAll('#amzOrderYearMenu .qmenu-item').forEach(function(b){ b.classList.remove('active'); });
    if(btn) btn.classList.add('active');
    var label = document.getElementById('amzOrderYearLabel');
    if(label) label.textContent = y === 'all' ? '📅 ทั้งหมด' : '📅 ปี ' + (parseInt(y) + 543);
    var m = document.getElementById('amzOrderYearMenu'); if(m) m.style.display='none';
    renderAmzOrder();
  };

  window.renderAmzOrder = function () {
    if (typeof AMZ_ORDER_DATA === 'undefined') return;
    _orderRendered = false;
    var D = AMZ_ORDER_DATA;
    var chFilter = AMZ_CH_MAP[_amzCh];
    var channels = chFilter ? AMZ_CHANNELS.filter(function(c){ return chFilter.indexOf(c) >= 0; }) : AMZ_CHANNELS;
    var allMonths = D.months || [];
    var months = _amzGetYearMonths();

    // Compute KPI
    var filtNet = 0, filtQty = 0, filtBills = 0;
    months.forEach(function(ym) {
      if (chFilter) {
        channels.forEach(function(ch) {
          if (D.monthlyByCh[ch] && D.monthlyByCh[ch][ym]) { filtNet += D.monthlyByCh[ch][ym].net; filtQty += D.monthlyByCh[ch][ym].qty; filtBills += D.monthlyByCh[ch][ym].bills; }
        });
      } else {
        if (D.monthlyAll[ym]) { filtNet += D.monthlyAll[ym].net; filtQty += D.monthlyAll[ym].qty; filtBills += D.monthlyAll[ym].bills; }
      }
    });
    var avgOrder = filtBills > 0 ? filtNet / filtBills : 0;
    var periodLabel = months.length ? _amzYmLabel(months[0]) + ' – ' + _amzYmLabel(months[months.length-1]) : '-';
    var periodInfoText = months.length ? 'กำลังแสดง: ' + periodLabel : '';
    var chLabel = _amzCh === 'all' ? 'ทุกช่องทาง' : (_amzCh === 'amazon' ? 'Amazon' : _amzCh === 'telesale' ? 'Telesale' : _amzCh);
    var _ordSrc = 'อเมซอน & ของฝาก — คำสั่งซื้อ' + (_amzCh !== 'all' ? ' (' + chLabel + ')' : '');
    var fmtB = function(n){if(n>=1e6)return(n/1e6).toFixed(2)+' M';if(n>=1e3)return(n/1e3).toFixed(1)+' K';return Math.round(n).toLocaleString();};
    var fmtQ = function(n){return Math.round(n).toLocaleString('th-TH');};

    // Product data — filtered by selected months
    var prodMap = {};
    if (chFilter && D.prodMonthlyByCh) {
      channels.forEach(function(ch) {
        var chProds = D.prodMonthlyByCh[ch];
        if (!chProds) return;
        Object.keys(chProds).forEach(function(pk) {
          if (!prodMap[pk]) prodMap[pk] = { p: pk, n: 0, q: 0 };
          months.forEach(function(ym) {
            if (chProds[pk][ym]) { prodMap[pk].n += chProds[pk][ym].n; prodMap[pk].q += chProds[pk][ym].q; }
          });
        });
      });
    } else if (D.prodMonthly) {
      Object.keys(D.prodMonthly).forEach(function(pk) {
        if (!prodMap[pk]) prodMap[pk] = { p: pk, n: 0, q: 0 };
        months.forEach(function(ym) {
          if (D.prodMonthly[pk][ym]) { prodMap[pk].n += D.prodMonthly[pk][ym].n; prodMap[pk].q += D.prodMonthly[pk][ym].q; }
        });
      });
    }
    var prods = Object.values(prodMap).filter(function(d){ return d.n > 0; }).sort(function(a,b){ return b.n - a.n; }).slice(0, 30);
    _amzComputeRank(prods);
    prods.forEach(function(d){ d._m = _amzBuildSkuMonthly(d.p); });

    var totalRev = 0, totalQty = 0, ambientB = 0, chillB = 0, ambientC = 0, chillC = 0;
    prods.forEach(function(d){ totalRev += d.n; totalQty += d.q; if(d.type==='Ambient'){ambientB+=d.n;ambientC++;} else {chillB+=d.n;chillC++;} });

    var el = document.getElementById('amzOrderContent');
    if (!el) return;

    var html = '';

    // ── 1. Gradient header ──
    html += '<div class="card" style="background:linear-gradient(135deg,#2563eb,#60a5fa);color:#fff;padding:24px 28px;margin-bottom:18px;border-radius:14px">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
    html += '<div><div style="font-size:20px;font-weight:800">📋 คำสั่งซื้อ</div>';
    html += '<div style="font-size:13px;opacity:.85;margin-top:4px">' + chLabel + ' — วิเคราะห์คำสั่งซื้อและสินค้า (' + periodLabel + ')</div></div>';
    html += '<div style="background:rgba(255,255,255,.2);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700">' + chLabel + '</div>';
    html += '</div></div>';

    // ── 2. KPI cards ──
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">';
    html += '<div class="card" style="text-align:center;padding:16px"><div style="font-size:11px;color:var(--muted)">💰 ยอดขายรวม</div><div style="font-size:22px;font-weight:800;color:#16a34a">' + fmtB(filtNet) + '</div><div style="font-size:10px;color:var(--muted)">' + periodLabel + '</div></div>';
    html += '<div class="card" style="text-align:center;padding:16px"><div style="font-size:11px;color:var(--muted)">📋 จำนวนบิล</div><div style="font-size:22px;font-weight:800;color:#4f46e5">' + fmtQ(filtBills) + '</div><div style="font-size:10px;color:var(--muted)">' + channels.length + ' ช่องทาง</div></div>';
    html += '<div class="card" style="text-align:center;padding:16px"><div style="font-size:11px;color:var(--muted)">📦 จำนวนชิ้น</div><div style="font-size:22px;font-weight:800;color:#0891b2">' + fmtQ(filtQty) + '</div><div style="font-size:10px;color:var(--muted)">ทั้งหมด</div></div>';
    html += '<div class="card" style="text-align:center;padding:16px"><div style="font-size:11px;color:var(--muted)">📊 เฉลี่ย/บิล</div><div style="font-size:22px;font-weight:800;color:#d97706">' + fmtB(avgOrder) + '</div><div style="font-size:10px;color:var(--muted)">บาท/บิล</div></div>';
    html += '</div>';

    // ── 3. Charts: Top 10 bar + Ambient/Chill doughnut ──
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">';
    html += '<div class="card"><div class="card-title">📊 Top 10 สินค้าขายดี (บาท)</div>';
    html += '<div style="position:relative;height:300px"><canvas id="amzOrdTop10Chart"></canvas></div></div>';
    html += '<div class="card"><div class="card-title">📊 Ambient vs Chill</div>';
    html += '<div style="position:relative;height:300px"><canvas id="amzOrdTypeChart"></canvas></div></div>';
    html += '</div>';

    // ── 4. Full product table with filters ──
    html += '<div class="card" style="margin-bottom:16px">';
    html += '<div class="card-title">📦 ตารางสินค้า</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;align-items:center">';
    html += '<select id="amzOrdFilterType" onchange="_amzOrdFilterTable()" style="padding:6px 12px;border-radius:8px;border:1px solid var(--border);font-size:13px;background:var(--card);color:var(--text)">';
    html += '<option value="all">ประเภท: ทั้งหมด</option><option value="Ambient">Ambient</option><option value="Chill">Chill</option></select>';
    html += '<select id="amzOrdFilterRank" onchange="_amzOrdFilterTable()" style="padding:6px 12px;border-radius:8px;border:1px solid var(--border);font-size:13px;background:var(--card);color:var(--text)">';
    html += '<option value="all">Rank: ทั้งหมด</option><option value="A+">A+</option><option value="A">A</option><option value="B">B</option><option value="C">C</option></select>';
    html += '<input id="amzOrdSearch" oninput="_amzOrdFilterTable()" placeholder="🔍 ค้นหาสินค้า..." style="padding:6px 12px;border-radius:8px;border:1px solid var(--border);font-size:13px;flex:1;min-width:180px;background:var(--card);color:var(--text)">';
    html += '</div>';
    html += '<div class="table-wrap"><table id="amzOrdProdTable"><thead><tr>';
    html += '<th>NO</th><th style="text-align:left">ชื่อสินค้า</th><th>TYPE</th><th>RANK</th><th style="text-align:right">฿/ชิ้น</th><th style="text-align:right">รวมชิ้น</th><th style="text-align:right">รวมบาท</th><th style="text-align:right">%REVENUE</th><th style="min-width:80px">กราฟ</th><th>Performance</th><th style="width:40px"></th>';
    html += '</tr></thead><tbody>';
    var topNet = prods.length > 0 ? prods[0].n : 1;
    prods.forEach(function(d, i) {
      var pct = totalRev>0?((d.n/totalRev)*100):0;
      var barW = Math.round((d.n / topNet) * 100);
      var rankColor = d.rank==='A+'?'#dc2626':d.rank==='A'?'#ea580c':d.rank==='B'?'#d97706':'#94a3b8';
      var _mJ = JSON.stringify(d._m||{}).replace(/'/g,"\\'").replace(/"/g,'&quot;');
      var _pN = d.p.replace(/'/g,"\\'");
      var _oMks=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var _omv=_oMks.map(function(mk){return d._m&&d._m[mk]?d._m[mk].b||0:0;});
      var _opf=window.calcPerf(_omv);
      html += '<tr data-type="'+d.type+'" data-rank="'+d.rank+'" data-name="'+(d.p||'').toLowerCase()+'">';
      html += '<td style="text-align:center">'+(i+1)+'</td>';
      html += '<td style="text-align:left;max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="'+d.p+'">'+d.p+'</td>';
      html += '<td style="text-align:center"><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;background:'+(d.type==='Ambient'?'#fff7ed':'#eff6ff')+';color:'+(d.type==='Ambient'?'#ea580c':'#2563eb')+'">'+d.type+'</span></td>';
      html += '<td style="text-align:center"><span style="display:inline-block;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:800;color:#fff;background:'+rankColor+'">'+d.rank+'</span></td>';
      html += '<td style="text-align:right;font-weight:600">'+d.ppc.toFixed(2)+'</td>';
      html += '<td style="text-align:right;font-weight:600">'+fmtQ(d.q)+'</td>';
      html += '<td style="text-align:right;font-weight:600">'+fmtB(d.n)+'</td>';
      html += '<td style="text-align:right">'+pct.toFixed(1)+'%</td>';
      html += '<td><div style="background:#f1f5f9;border-radius:4px;height:12px;overflow:hidden"><div style="width:'+barW+'%;height:100%;background:rgba(37,99,235,.6);border-radius:4px"></div></div></td>';
      html += '<td style="text-align:center">'+window.perfBadgeHTML(_opf)+'</td>';
      html += '<td style="text-align:center" onclick="showSkuPerf(\''+_pN+'\',JSON.parse(this.getAttribute(\'data-m\')),\''+_ordSrc.replace(/'/g,"\\'")+'\')" data-m="'+_mJ+'">'+window.perfSearchIcon()+'</td>';
      html += '</tr>';
    });
    html += '</tbody></table></div></div>';

    // ── 5. Branch/customer table ──
    var branches = [];
    channels.forEach(function(ch) {
      (D.topBranchByCh[ch] || []).forEach(function(d) { branches.push({ b: d.b, n: d.n, q: d.q, bi: d.bi, ch: ch }); });
    });
    branches.sort(function(a,b){ return b.n - a.n; });
    branches = branches.slice(0, 20);

    html += '<div class="card" style="margin-bottom:16px">';
    html += '<div class="card-title">🏪 ลูกค้า/สาขา Top 20</div>';
    html += '<div class="table-wrap"><table><thead><tr>';
    html += '<th>#</th><th style="text-align:left">สาขา</th><th style="text-align:left">ช่องทาง</th><th style="text-align:right">ยอดขาย (฿)</th><th style="text-align:right">จำนวนชิ้น</th><th style="text-align:right">บิล</th>';
    html += '</tr></thead><tbody>';
    branches.forEach(function(d, i) {
      html += '<tr>';
      html += '<td style="text-align:center">'+(i+1)+'</td>';
      html += '<td style="text-align:left">'+d.b+'</td>';
      html += '<td style="text-align:left">'+d.ch+'</td>';
      html += '<td style="text-align:right;font-weight:600">'+fmtB(d.n)+'</td>';
      html += '<td style="text-align:right">'+fmtQ(d.q)+'</td>';
      html += '<td style="text-align:right">'+d.bi.toLocaleString()+'</td>';
      html += '</tr>';
    });
    html += '</tbody></table></div></div>';

    html += '<div style="text-align:center;padding:12px;color:var(--muted);font-size:11px">📄 ข้อมูลจาก Amazon & ของฝาก — คำสั่งซื้อ — '+chLabel+'</div>';

    el.innerHTML = html;
    setTimeout(function(){_amzOrdInitCharts(prods, ambientB, chillB);},100);
  };

  // ── Chart init for AMZ order ──
  var _amzOrdChart1 = null, _amzOrdChart2 = null;
  function _amzOrdInitCharts(products, ambientB, chillB){
    if(_amzOrdChart1){try{_amzOrdChart1.destroy();}catch(e){}} _amzOrdChart1=null;
    if(_amzOrdChart2){try{_amzOrdChart2.destroy();}catch(e){}} _amzOrdChart2=null;
    var top10 = products.slice().sort(function(a,b){return(b.n||0)-(a.n||0);}).slice(0,10);
    var barColors = ['#2563eb','#3b82f6','#0891b2','#0d9488','#16a34a','#65a30d','#d97706','#ea580c','#dc2626','#7c3aed'];
    var ctx1 = document.getElementById('amzOrdTop10Chart');
    if(ctx1){
      _amzOrdChart1 = new Chart(ctx1.getContext('2d'),{
        type:'bar',
        data:{labels:top10.map(function(d){var n=d.p;return n.length>25?n.substring(0,25)+'…':n;}),datasets:[{data:top10.map(function(d){return d.n||0;}),backgroundColor:barColors.slice(0,top10.length),borderRadius:4,barThickness:20}]},
        options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(ctx){return Math.round(ctx.raw).toLocaleString('th-TH')+' บาท';}}}},scales:{x:{ticks:{callback:function(v){return(v/1e6).toFixed(1)+'M';}},beginAtZero:true,grid:{color:'rgba(0,0,0,0.05)'}},y:{grid:{display:false},ticks:{font:{size:11}}}}}
      });
    }
    var ctx2 = document.getElementById('amzOrdTypeChart');
    if(ctx2){
      _amzOrdChart2 = new Chart(ctx2.getContext('2d'),{
        type:'doughnut',
        data:{labels:['Ambient','Chill'],datasets:[{data:[ambientB,chillB],backgroundColor:['#f97316','#3b82f6'],borderWidth:2}]},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:function(ctx){var v=ctx.raw;var t=ambientB+chillB;return ctx.label+': '+(v/1e6).toFixed(2)+'M ('+(t>0?(v/t*100).toFixed(1):0)+'%)';}}}}}
      });
    }
  }

  // ── Filter table for AMZ order ──
  window._amzOrdFilterTable = function(){
    var typeF = document.getElementById('amzOrdFilterType');
    var rankF = document.getElementById('amzOrdFilterRank');
    var searchF = document.getElementById('amzOrdSearch');
    var tv = typeF?typeF.value:'all';
    var rv = rankF?rankF.value:'all';
    var sv = searchF?(searchF.value||'').toLowerCase():'';
    var tbl = document.getElementById('amzOrdProdTable');
    if(!tbl) return;
    var rows = tbl.querySelectorAll('tbody tr');
    rows.forEach(function(row){
      var t = row.getAttribute('data-type')||'';
      var r = row.getAttribute('data-rank')||'';
      var n = row.getAttribute('data-name')||'';
      var show = (tv==='all'||t===tv) && (rv==='all'||r===rv) && (!sv||n.indexOf(sv)!==-1);
      row.style.display = show?'':'none';
    });
  };

  window._amzUploadStaffPhoto = function(input, empId) {
    if (!input.files || !input.files[0]) return;
    var file = input.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
      var card = input.closest('.card');
      if (!card) return;
      var img = card.querySelector('img');
      var fallback = img ? img.nextElementSibling : null;
      if (img) { img.src = e.target.result; img.style.display = ''; }
      if (fallback) fallback.style.display = 'none';
    };
    reader.readAsDataURL(file);
  };

  // ---- RENDER: ฝ่ายขาย (amz-team) ----
  var _teamRendered = false;
  window.renderAmzTeam = function () {
    if (_teamRendered) return;
    _teamRendered = true;

    var el = document.getElementById('amzTeamList');
    if (!el) return;

    var amzNicks = ['ยู', 'ซี', 'กานต์'];
    var zoneMap = {
      'ยู':   'เขต: BKK 1 (ปทุมธานี)\nAmazon, ร้านของฝาก, RM, ลูกค้าทั่วไป, Black Canyon',
      'ซี':   'เขต: BKK 2 (นนทบุรี)\nAmazon, ร้านของฝาก, RM, ลูกค้าทั่วไป, Black Canyon',
      'กานต์': 'เขต: BKK 3 (สมุทรปราการ)\nAmazon, ร้านของฝาก, RM, ลูกค้าทั่วไป, Black Canyon'
    };

    var team = [];
    if (typeof SM_STAFF_DB !== 'undefined') {
      SM_STAFF_DB.forEach(function(s) {
        if (s.dept === 'Amazon' && amzNicks.indexOf(s.nick) >= 0) team.push(s);
      });
      team.sort(function(a, b) {
        var ra = a.resigned ? 1 : 0, rb = b.resigned ? 1 : 0;
        if (ra !== rb) return ra - rb;
        return amzNicks.indexOf(a.nick) - amzNicks.indexOf(b.nick);
      });
    }
    if (team.length === 0) {
      team = [
        { nick: '-', name: 'ว่าง', positionTh: 'เซลล์อเมซอน (ว่าง)', phone: '', emailCo: '', birthday: '', startDate: '', empId: '', branch: 'BKK 01 (ปทุมธานี)' },
        { nick: 'ซี', name: 'ภาณุวัฒน์ ปานเผือก', positionTh: 'เซลล์อเมซอน', phone: '', emailCo: '', birthday: '', startDate: '', empId: '', branch: 'BKK 02 (นนทบุรี)' },
        { nick: 'กานต์', name: 'วีระ พรมมี', positionTh: 'เซลล์อเมซอน', phone: '', emailCo: '', birthday: '', startDate: '', empId: '', branch: 'BKK 03 (สมุทรปราการ)' }
      ];
    }

    var activeTeam = team.filter(function(s){ return !s.resigned; });
    var resignedTeam = team.filter(function(s){ return !!s.resigned; });

    var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px">';
    var _resignedSepDone = false;
    team.forEach(function (s) {
      if (s.resigned && !_resignedSepDone && resignedTeam.length > 0) {
        _resignedSepDone = true;
        html += '</div>';
        html += '<div style="margin:28px 0 16px;display:flex;align-items:center;gap:12px"><div style="flex:1;height:1px;background:#e2e8f0"></div><span style="font-size:13px;font-weight:700;color:#94a3b8;white-space:nowrap">📋 พนักงานลาออก (' + resignedTeam.length + ')</span><div style="flex:1;height:1px;background:#e2e8f0"></div></div>';
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px">';
      }
      var zone = zoneMap[s.nick] || s.branch || '';
      var displayName = s.name.replace(/^(นาย|นางสาว|นาง)/, '');
      var isMale = s.name.indexOf('นาย') === 0;
      var imgPath = 'assets/staff/' + s.empId + '.jpg';
      var isResigned = !!s.resigned;
      var borderColor = isResigned ? '#cbd5e1' : '#fed7aa';
      var shadowColor = isResigned ? 'rgba(100,116,139,0.15)' : 'rgba(234,88,12,0.15)';
      var cardOpacity = isResigned ? 'opacity:0.7;' : '';

      html += '<div class="card" style="padding:28px 24px;text-align:center;position:relative;overflow:hidden;' + cardOpacity + (isResigned ? 'border:1.5px dashed #cbd5e1;background:#f8fafc;' : '') + '">';
      if (isResigned) {
        html += '<div style="position:absolute;top:14px;right:-32px;transform:rotate(45deg);background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;font-size:11px;font-weight:800;padding:4px 40px;box-shadow:0 2px 6px rgba(220,38,38,0.3);letter-spacing:0.5px">ลาออกแล้ว</div>';
      }
      html += '<div style="margin-bottom:14px;display:inline-block;position:relative">';
      html += '<img src="' + imgPath + '" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid ' + borderColor + ';box-shadow:0 4px 12px ' + shadowColor + (isResigned ? ';filter:grayscale(40%)' : '') + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">';
      html += '<div style="display:none;width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,' + (isResigned ? '#e2e8f0,#cbd5e1' : '#fed7aa,#fdba74') + ');justify-content:center;align-items:center;font-size:36px;border:3px solid ' + borderColor + ';box-shadow:0 4px 12px ' + shadowColor + '">' + (isMale ? '👨‍💼' : '👩‍💼') + '</div>';
      if (!isResigned) {
        html += '<label style="position:absolute;bottom:2px;right:2px;width:28px;height:28px;border-radius:50%;background:#ea580c;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.2);border:2px solid #fff" title="อัพโหลดรูป">';
        html += '<input type="file" accept="image/*" style="display:none" onchange="window._amzUploadStaffPhoto(this,\'' + s.empId + '\')">📷</label>';
      }
      html += '</div>';
      html += '<div style="font-size:17px;font-weight:800;color:' + (isResigned ? '#94a3b8' : '#1e293b') + '">' + displayName + '</div>';
      html += '<div style="font-size:13px;color:' + (isResigned ? '#94a3b8' : '#ea580c') + ';font-weight:700;margin-top:2px">(' + s.nick + ')</div>';
      html += '<div style="font-size:12px;color:' + (isResigned ? '#94a3b8' : '#8b5cf6') + ';font-weight:600;margin-top:4px">' + (s.positionTh || 'เจ้าหน้าที่ขาย') + '</div>';
      html += '<div style="font-size:11px;color:#64748b;margin-top:8px;line-height:1.6;background:#f8fafc;padding:8px 12px;border-radius:8px;text-align:left">' + zone.replace(/\n/g, '<br>') + '</div>';
      html += '<div style="margin-top:12px;text-align:left;font-size:12px;color:#64748b;line-height:2">';
      if (s.phone) html += '<div>📱 <span style="color:#334155">' + s.phone + '</span></div>';
      if (s.emailCo) html += '<div>📧 <span style="color:#334155">' + s.emailCo + '</span></div>';
      if (s.empId) html += '<div>🆔 รหัสพนักงาน: <span style="color:#334155">' + s.empId + '</span></div>';
      if (s.branch) html += '<div>📍 สาขา: <span style="color:#334155">' + s.branch + '</span></div>';
      if (s.startDate) html += '<div>📅 วันเริ่มงาน: <span style="color:#334155">' + s.startDate + '</span></div>';
      if (s.age) html += '<div>🎂 อายุ: <span style="color:#334155">' + s.age + ' ปี</span></div>';
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';
    el.innerHTML = html;
  };

  // ---- RENDER: Complaint / คุณภาพสินค้า (amz-complaint) ----
  var _amzComplaintRendered = false;
  var _amzCmpCharts = {};
  var _amzCmpPeriod = 'all';
  var _amzCmpYear = 'all';

  window._amzCmpSetPeriod = function(p, btn) {
    _amzCmpPeriod = p;
    _amzCmpYear = 'all';
    document.querySelectorAll('#amzCmpPeriodBtns .period-type-btn').forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    var m = document.getElementById('amzCmpQtrMenu'); if(m) m.style.display='none';
    var m2 = document.getElementById('amzCmpYearMenu'); if(m2) m2.style.display='none';
    window.renderAmzComplaint();
  };
  window._amzCmpToggleQMenu = function() {
    var m = document.getElementById('amzCmpQtrMenu');
    if(m) m.style.display = m.style.display==='none'?'block':'none';
    var m2 = document.getElementById('amzCmpYearMenu'); if(m2) m2.style.display='none';
  };
  window._amzCmpPickQtr = function(q, btn) {
    if (q.indexOf('-') >= 0) {
      var parts = q.split('-');
      _amzCmpYear = parts[0];
      _amzCmpPeriod = parts[1].toLowerCase();
    } else {
      _amzCmpPeriod = q;
      _amzCmpYear = 'all';
    }
    document.querySelectorAll('#amzCmpPeriodBtns .period-type-btn').forEach(function(b){ b.classList.remove('active'); });
    var dd = document.getElementById('amzCmpQtrDropdown');
    if(dd) dd.querySelector('.period-type-btn').classList.add('active');
    document.querySelectorAll('#amzCmpQtrMenu .qmenu-item').forEach(function(b){ b.classList.remove('active'); });
    if(btn) btn.classList.add('active');
    var label = document.getElementById('amzCmpQtrLabel');
    if(label) label.textContent = btn ? btn.textContent : '📆 รายไตรมาส';
    var m = document.getElementById('amzCmpQtrMenu'); if(m) m.style.display='none';
    window.renderAmzComplaint();
  };
  window._amzCmpToggleYMenu = function() {
    var m = document.getElementById('amzCmpYearMenu');
    if(m) m.style.display = m.style.display==='none'?'block':'none';
    var m2 = document.getElementById('amzCmpQtrMenu'); if(m2) m2.style.display='none';
  };
  window._amzCmpPickYear = function(y, btn) {
    _amzCmpYear = String(y);
    _amzCmpPeriod = 'all';
    document.querySelectorAll('#amzCmpPeriodBtns .period-type-btn').forEach(function(b){ b.classList.remove('active'); });
    var dd = document.getElementById('amzCmpYearDropdown');
    if(dd) dd.querySelector('.period-type-btn').classList.add('active');
    document.querySelectorAll('#amzCmpYearMenu .qmenu-item').forEach(function(b){ b.classList.remove('active'); });
    if(btn) btn.classList.add('active');
    var label = document.getElementById('amzCmpYearLabel');
    if(label) label.textContent = y === 'all' ? '📅 ทั้งหมด' : '📅 ปี ' + (parseInt(y) + 543);
    var m = document.getElementById('amzCmpYearMenu'); if(m) m.style.display='none';
    window.renderAmzComplaint();
  };

  function _amzCmpFilterRaw(rawArr) {
    // QUALITY_RAW uses Buddhist year (พ.ศ.) — convert CE year filter to BE
    var byYear = (_amzCmpYear === 'all') ? rawArr : rawArr.filter(function(r){ return r.year === (parseInt(_amzCmpYear) + 543); });
    if (_amzCmpPeriod === 'all') return byYear;
    var now = new Date(), yBE = now.getFullYear() + 543, m = now.getMonth() + 1;
    if (_amzCmpPeriod === 'thismonth') return byYear.filter(function(r){ return r.year === yBE && r.month === m; });
    if (_amzCmpPeriod === 'lastmonth') {
      var d = new Date(now.getFullYear(), m-2, 1); var dBE = d.getFullYear() + 543;
      return byYear.filter(function(r){ return r.year === dBE && r.month === (d.getMonth()+1); });
    }
    var qMap = { q1:[1,2,3], q2:[4,5,6], q3:[7,8,9], q4:[10,11,12] };
    if (qMap[_amzCmpPeriod]) {
      var allowed = qMap[_amzCmpPeriod];
      return byYear.filter(function(r){ return allowed.indexOf(r.month) >= 0; });
    }
    return byYear;
  }

  function _amzCmpDestroy(k) { if (_amzCmpCharts[k]) { _amzCmpCharts[k].destroy(); _amzCmpCharts[k] = null; } }
  function _amzCmpFmt(n) { return n.toLocaleString('th-TH'); }

  window.renderAmzComplaint = function () {
    _amzComplaintRendered = false;
    var el = document.getElementById('amzComplaintBody');
    if (!el) return;
    if (typeof QUALITY_RAW === 'undefined' || typeof QUALITY_DATA === 'undefined') {
      el.innerHTML = '<div style="text-align:center;padding:60px 20px;color:#94a3b8">ไม่พบข้อมูลคุณภาพสินค้า</div>';
      return;
    }
    _amzComplaintRendered = true;

    var raw = _amzCmpFilterRaw(QUALITY_RAW);
    var qd = QUALITY_DATA;
    var monthNames = ['','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

    var totalAll = 0, totalAmz = 0, costAll = 0, costAmz = 0;
    var monthlyLabels = [], monthlyAll = [], monthlyAmz = [];
    raw.forEach(function (r) {
      totalAll += r.totalCount;
      totalAmz += (r.channels.Amazon || 0);
      costAll += r.totalCost;
      costAmz += (r.channelCost.Amazon || 0);
      var lbl = monthNames[r.month] + (r.year % 100);
      monthlyLabels.push(lbl);
      monthlyAll.push(r.totalCount);
      monthlyAmz.push(r.channels.Amazon || 0);
    });

    var amzPct = totalAll ? ((totalAmz / totalAll) * 100).toFixed(1) : '0';
    var worstMonth = '', worstVal = 0;
    raw.forEach(function (r) {
      if ((r.channels.Amazon || 0) > worstVal) { worstVal = r.channels.Amazon; worstMonth = monthNames[r.month] + ' ' + r.year; }
    });

    var typeColors = ['#f97316','#eab308','#22c55e','#3b82f6','#a855f7'];
    var prodColors = ['#f97316','#fb923c','#fdba74','#fed7aa','#ffedd5','#fef3c7','#d9f99d','#bbf7d0','#a7f3d0','#6ee7b7'];

    var periodInfoParts = [];
    if (raw.length) {
      var first = raw[0], last = raw[raw.length-1];
      periodInfoParts.push(monthNames[first.month] + ' ' + (first.year % 100));
      periodInfoParts.push(monthNames[last.month] + ' ' + (last.year % 100));
    }
    var periodLabel = periodInfoParts.length ? periodInfoParts[0] + ' – ' + periodInfoParts[1] : '-';
    var periodInfoText = periodInfoParts.length ? 'กำลังแสดง: ' + periodLabel : '';

    var isQtr = ['q1','q2','q3','q4'].indexOf(_amzCmpPeriod) >= 0;
    var isCmpYear = _amzCmpYear !== 'all';

    var html = '';

    html += '<div style="margin-bottom:18px">';
    html += '<h3 style="margin:0 0 4px;font-size:18px;color:#ea580c">📢 คุณภาพสินค้า / Complaint</h3>';
    html += '<p style="margin:0;font-size:12px;color:#94a3b8">ข้อมูลจากระบบคุณภาพสินค้า (' + periodLabel + ')</p>';
    html += '</div>';

    // KPI Cards
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px">';
    var kpis = [
      { label:'เรื่องร้องเรียนทั้งหมด', val: _amzCmpFmt(totalAll), icon:'📋', color:'#f97316' },
      { label:'เฉพาะช่อง Amazon', val: _amzCmpFmt(totalAmz) + ' (' + amzPct + '%)', icon:'☕', color:'#ea580c' },
      { label:'มูลค่าความเสียหายรวม', val: '฿' + _amzCmpFmt(Math.round(costAll)), icon:'💰', color:'#dc2626' },
      { label:'มูลค่าเสียหาย Amazon', val: '฿' + _amzCmpFmt(Math.round(costAmz)), icon:'📉', color:'#b91c1c' },
      { label:'เดือนที่แย่สุด (Amazon)', val: worstMonth + ' (' + worstVal + ')', icon:'⚠️', color:'#d97706' },
      { label:'สินค้าคืน', val: _amzCmpFmt(qd.kpi.returnedProducts) + ' ชิ้น', icon:'📦', color:'#7c3aed' }
    ];
    kpis.forEach(function (k) {
      html += '<div style="background:#fff;border-radius:10px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,.08);border-left:4px solid ' + k.color + '">';
      html += '<div style="font-size:20px;margin-bottom:4px">' + k.icon + '</div>';
      html += '<div style="font-size:11px;color:#64748b;margin-bottom:2px">' + k.label + '</div>';
      html += '<div style="font-size:18px;font-weight:700;color:' + k.color + '">' + k.val + '</div>';
      html += '</div>';
    });
    html += '</div>';

    // Charts row
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">';
    html += '<div class="chart-box" style="padding:14px"><h4 style="margin:0 0 10px;font-size:14px">📈 แนวโน้มรายเดือน (ทั้งหมด vs Amazon)</h4><div style="position:relative;height:250px"><canvas id="amzCmpTrendChart"></canvas></div></div>';
    html += '<div class="chart-box" style="padding:14px"><h4 style="margin:0 0 10px;font-size:14px">🍩 ประเภทปัญหา</h4><div style="position:relative;height:250px"><canvas id="amzCmpTypeChart"></canvas></div></div>';
    html += '</div>';

    // Product bar + complaint type table
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">';
    html += '<div class="chart-box" style="padding:14px"><h4 style="margin:0 0 10px;font-size:14px">🍞 สินค้าที่มีปัญหาสูงสุด</h4><div style="position:relative;height:300px"><canvas id="amzCmpProdChart"></canvas></div></div>';
    html += '<div class="chart-box" style="padding:14px"><h4 style="margin:0 0 10px;font-size:14px">📊 สรุปประเภทปัญหา</h4>';
    html += '<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#fff7ed">';
    html += '<th style="padding:8px;text-align:left;border-bottom:2px solid #fed7aa">ประเภท</th>';
    html += '<th style="padding:8px;text-align:right;border-bottom:2px solid #fed7aa">จำนวน</th>';
    html += '<th style="padding:8px;text-align:right;border-bottom:2px solid #fed7aa">%</th>';
    html += '</tr></thead><tbody>';
    qd.complaintTypes.forEach(function (ct, i) {
      var pct = totalAll ? ((ct.count / totalAll) * 100).toFixed(1) : '0';
      html += '<tr style="border-bottom:1px solid #f1f5f9">';
      html += '<td style="padding:8px"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + typeColors[i % typeColors.length] + ';margin-right:6px"></span>' + ct.type + '</td>';
      html += '<td style="padding:8px;text-align:right;font-weight:600">' + _amzCmpFmt(ct.count) + '</td>';
      html += '<td style="padding:8px;text-align:right;color:#64748b">' + pct + '%</td>';
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    html += '</div>';

    // Channel comparison table
    html += '<div class="chart-box" style="padding:14px;margin-bottom:20px"><h4 style="margin:0 0 10px;font-size:14px">🏪 เปรียบเทียบตามช่องทาง</h4>';
    html += '<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#fff7ed">';
    html += '<th style="padding:8px;text-align:left;border-bottom:2px solid #fed7aa">ช่องทาง</th>';
    html += '<th style="padding:8px;text-align:right;border-bottom:2px solid #fed7aa">เรื่องร้องเรียน</th>';
    html += '<th style="padding:8px;text-align:right;border-bottom:2px solid #fed7aa">สินค้าคืน</th>';
    html += '<th style="padding:8px;text-align:right;border-bottom:2px solid #fed7aa">อัตราคืน (%)</th>';
    html += '</tr></thead><tbody>';
    qd.customers.forEach(function (c) {
      var isAmz = c.channel === 'Cafe Amazon';
      html += '<tr style="border-bottom:1px solid #f1f5f9;' + (isAmz ? 'background:#fff7ed;font-weight:600' : '') + '">';
      html += '<td style="padding:8px">' + (isAmz ? '☕ ' : '') + c.channel + '</td>';
      html += '<td style="padding:8px;text-align:right">' + _amzCmpFmt(c.complaints) + '</td>';
      html += '<td style="padding:8px;text-align:right">' + _amzCmpFmt(c.returns) + '</td>';
      html += '<td style="padding:8px;text-align:right">' + c.returnRate.toFixed(1) + '%</td>';
      html += '</tr>';
    });
    html += '</tbody></table></div>';

    // CAPA tracking
    html += '<div class="chart-box" style="padding:14px;margin-bottom:20px"><h4 style="margin:0 0 10px;font-size:14px">🔧 การแก้ไข/ป้องกัน (CAPA)</h4>';
    var capaDone = 0, capaIP = 0, capaPend = 0;
    qd.capa.forEach(function (c) { if (c.status === 'done') capaDone++; else if (c.status === 'inprogress') capaIP++; else capaPend++; });
    html += '<div style="display:flex;gap:12px;margin-bottom:12px">';
    html += '<span style="background:#dcfce7;color:#16a34a;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600">✅ เสร็จ ' + capaDone + '</span>';
    html += '<span style="background:#fef9c3;color:#ca8a04;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600">🔄 กำลังทำ ' + capaIP + '</span>';
    html += '<span style="background:#fee2e2;color:#dc2626;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600">⏳ รอดำเนินการ ' + capaPend + '</span>';
    html += '</div>';
    html += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr style="background:#fff7ed">';
    html += '<th style="padding:6px 8px;text-align:left;border-bottom:2px solid #fed7aa">วันที่</th>';
    html += '<th style="padding:6px 8px;text-align:left;border-bottom:2px solid #fed7aa">ผู้รับผิดชอบ</th>';
    html += '<th style="padding:6px 8px;text-align:left;border-bottom:2px solid #fed7aa">สาเหตุ</th>';
    html += '<th style="padding:6px 8px;text-align:left;border-bottom:2px solid #fed7aa">แนวทางแก้ไข</th>';
    html += '<th style="padding:6px 8px;text-align:center;border-bottom:2px solid #fed7aa">สถานะ</th>';
    html += '</tr></thead><tbody>';
    qd.capa.forEach(function (c) {
      var stBadge = c.status === 'done' ? '<span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:10px;font-size:10px">เสร็จ</span>'
        : c.status === 'inprogress' ? '<span style="background:#fef9c3;color:#ca8a04;padding:2px 8px;border-radius:10px;font-size:10px">กำลังทำ</span>'
        : '<span style="background:#fee2e2;color:#dc2626;padding:2px 8px;border-radius:10px;font-size:10px">รอ</span>';
      html += '<tr style="border-bottom:1px solid #f1f5f9">';
      html += '<td style="padding:6px 8px;white-space:nowrap">' + c.date + '</td>';
      html += '<td style="padding:6px 8px">' + c.owner + '</td>';
      html += '<td style="padding:6px 8px">' + c.cause + '</td>';
      html += '<td style="padding:6px 8px">' + c.action + '</td>';
      html += '<td style="padding:6px 8px;text-align:center">' + stBadge + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table></div></div>';

    el.innerHTML = html;

    // --- Charts ---
    _amzCmpDestroy('trend');
    _amzCmpDestroy('type');
    _amzCmpDestroy('prod');

    var trendCtx = document.getElementById('amzCmpTrendChart');
    if (trendCtx) {
      _amzCmpCharts.trend = new Chart(trendCtx.getContext('2d'), {
        type: 'bar',
        data: {
          labels: monthlyLabels,
          datasets: [
            { label: 'ทั้งหมด', data: monthlyAll, backgroundColor: 'rgba(249,115,22,0.25)', borderColor: '#f97316', borderWidth: 1, order: 2 },
            { label: 'Amazon', data: monthlyAmz, type: 'line', borderColor: '#dc2626', backgroundColor: 'rgba(220,38,38,0.1)', pointRadius: 3, pointBackgroundColor: '#dc2626', borderWidth: 2, fill: true, order: 1 }
          ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } }, scales: { y: { beginAtZero: true, ticks: { font: { size: 10 } } }, x: { ticks: { font: { size: 9 }, maxRotation: 45 } } } }
      });
    }

    var typeCtx = document.getElementById('amzCmpTypeChart');
    if (typeCtx) {
      _amzCmpCharts.type = new Chart(typeCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: qd.complaintTypes.map(function (c) { return c.type; }),
          datasets: [{ data: qd.complaintTypes.map(function (c) { return c.count; }), backgroundColor: typeColors, borderWidth: 2, borderColor: '#fff' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, padding: 8 } } } }
      });
    }

    var prodCtx = document.getElementById('amzCmpProdChart');
    if (prodCtx) {
      var top10 = qd.products.slice(0, 10);
      _amzCmpCharts.prod = new Chart(prodCtx.getContext('2d'), {
        type: 'bar',
        data: {
          labels: top10.map(function (p) { return p.name; }),
          datasets: [{ label: 'จำนวนปัญหา', data: top10.map(function (p) { return p.count; }), backgroundColor: prodColors, borderRadius: 4 }]
        },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { font: { size: 10 } } }, y: { ticks: { font: { size: 10 } } } } }
      });
    }
  };

  // ---- RENDER: สาขา (amz-branches) ----
  var _branchRendered = false;
  var _amzBranchMap = null;

  function _getRegion(b) { return b[7] || 'ไม่ระบุ'; }

  window.renderAmzBranches = function () {
    if (_branchRendered) return;
    var isBC = _amzCh === 'BlackCanyon';
    var srcData = isBC ? (typeof BC_BRANCHES !== 'undefined' ? BC_BRANCHES : []) : (typeof AMZ_BRANCHES !== 'undefined' ? AMZ_BRANCHES : []);
    if (!srcData.length) return;
    _branchRendered = true;
    var mapTitleEl = document.getElementById('amzBranchMapTitle');
    if (mapTitleEl) mapTitleEl.textContent = 'แผนที่สาขา ' + (isBC ? 'Black Canyon' : 'Cafe Amazon');

    var branches = srcData;
    var total = branches.length;

    // นับจังหวัด
    var provCount = {};
    branches.forEach(function (b) {
      var prov = b[6] || 'ไม่ระบุ';
      provCount[prov] = (provCount[prov] || 0) + 1;
    });
    var provList = Object.keys(provCount);
    var totalProv = provList.length;
    var topProv = provList.sort(function (a, b) { return provCount[b] - provCount[a]; })[0] || '-';

    // นับภูมิภาค (ใช้ b[7] จาก API โดยตรง)
    var regionCount = {};
    branches.forEach(function (b) {
      var r = _getRegion(b);
      regionCount[r] = (regionCount[r] || 0) + 1;
    });
    var regionList = Object.keys(regionCount).sort(function (a, b) { return regionCount[b] - regionCount[a]; });

    // --- KPI ---
    var kpiEl = document.getElementById('amzBranchKPI');
    if (kpiEl) {
      kpiEl.innerHTML =
        kpiCard('🏪', 'สาขาทั้งหมด', total.toString() + ' สาขา', isBC ? 'Black Canyon' : 'Cafe Amazon', '#ea580c')
        + kpiCard('🗺️', 'จำนวนจังหวัด', totalProv.toString() + ' จังหวัด', 'พื้นที่กระจายสินค้า', '#2563eb')
        + kpiCard('🏆', 'จังหวัดสาขาสูงสุด', topProv, provCount[topProv] + ' สาขา', '#16a34a')
        + kpiCard('📍', 'ครอบคลุม', regionList.length + ' ภูมิภาค', 'ทั่วประเทศไทย', '#7c3aed');
    }

    // --- Map (Leaflet) ---
    var mapEl = document.getElementById('amzBranchMap');
    if (mapEl) {
      if (typeof L !== 'undefined' && L.map) {
        try {
          _amzBranchMap = L.map(mapEl, { scrollWheelZoom: false }).setView([13.7, 100.5], 6);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap',
            maxZoom: 18
          }).addTo(_amzBranchMap);

          // สร้าง orange icon
          var orangeIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });

          branches.forEach(function (b) {
            var lat = b[2], lng = b[3];
            if (lat && lng) {
              L.marker([lat, lng], { icon: orangeIcon })
                .addTo(_amzBranchMap)
                .bindPopup('<b>' + b[1] + '</b><br>' + (b[6] || '') + ' (' + (b[7] || '') + ')' + '<br>' + (b[5] || ''));
            }
          });

          // fix map render issue เมื่อ container ยัง hidden
          setTimeout(function () { _amzBranchMap.invalidateSize(); }, 300);
        } catch (e) {
          mapEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:13px">ไม่สามารถโหลดแผนที่ได้</div>';
        }
      } else {
        mapEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:13px">แผนที่ต้องการ Leaflet.js</div>';
      }
    }

    // --- Province bar chart (horizontal) ---
    var provSorted = Object.keys(provCount).sort(function (a, b) { return provCount[b] - provCount[a]; });
    var provColors = provSorted.map(function (_, i) {
      return 'hsl(' + (20 + i * 25) + ',75%,55%)';
    });
    mkChart('amzBranchProvChart', {
      type: 'bar',
      data: {
        labels: provSorted,
        datasets: [{
          label: 'จำนวนสาขา',
          data: provSorted.map(function (p) { return provCount[p]; }),
          backgroundColor: provColors,
          borderRadius: 5
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { stepSize: 1 } }
        }
      }
    });

    // --- Region doughnut chart ---
    var regionColors = ['#ea580c', '#2563eb', '#16a34a', '#7c3aed', '#0891b2', '#d97706'];
    mkChart('amzBranchRegionChart', {
      type: 'doughnut',
      data: {
        labels: regionList,
        datasets: [{
          data: regionList.map(function (r) { return regionCount[r]; }),
          backgroundColor: regionColors.slice(0, regionList.length),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 } } }
        }
      }
    });

    // --- Province pie chart ---
    mkChart('amzBranchProvPie', {
      type: 'pie',
      data: {
        labels: provSorted,
        datasets: [{
          data: provSorted.map(function (p) { return provCount[p]; }),
          backgroundColor: provColors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 10 } } }
        }
      }
    });

    // --- Table ---
    window.renderAmzBranchTable();

    // --- Populate filter dropdowns ---
    _populateFilters();
  };

  // ดึงชื่อเขต/อำเภอจากที่อยู่
  function _getDistrict(b) {
    var addr = b[5] || '';
    var m = addr.match(/(?:อ\.|อำเภอ|เขต)([^\s,]+)/);
    return m ? m[1].trim() : '';
  }

  // สร้างตัวเลือกใน dropdown ภาค/จังหวัด/เขต
  function _populateFilters() {
    var branches = (_amzCh === 'BlackCanyon' && typeof BC_BRANCHES !== 'undefined') ? BC_BRANCHES : (typeof AMZ_BRANCHES !== 'undefined' ? AMZ_BRANCHES : []);

    var regions = {}, provsByRegion = {}, distsByProv = {};
    branches.forEach(function (b) {
      var r = _getRegion(b);
      var p = b[6] || '';
      var d = _getDistrict(b);
      regions[r] = true;
      if (!provsByRegion[r]) provsByRegion[r] = {};
      provsByRegion[r][p] = true;
      if (!distsByProv[p]) distsByProv[p] = {};
      if (d) distsByProv[p][d] = true;
    });

    // เก็บข้อมูลไว้ใช้ตอน cascading
    window._amzFilterData = {
      provsByRegion: provsByRegion,
      distsByProv: distsByProv
    };

    // เติม region dropdown
    var regionSel = document.getElementById('amzFilterRegion');
    if (regionSel) {
      var rKeys = Object.keys(regions).sort();
      rKeys.forEach(function (r) {
        var opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        regionSel.appendChild(opt);
      });
    }
  }

  // Cascading filter: เลือกภาค -> จังหวัดอัปเดต -> เขตอัปเดต
  window.amzFilterChanged = function (level) {
    var regionSel = document.getElementById('amzFilterRegion');
    var provSel = document.getElementById('amzFilterProv');
    var distSel = document.getElementById('amzFilterDistrict');
    var data = window._amzFilterData;
    if (!data) return;

    if (level === 'region') {
      var selRegion = regionSel.value;
      provSel.innerHTML = '<option value="">ทุกจังหวัด</option>';
      distSel.innerHTML = '<option value="">ทุกเขต/อำเภอ</option>';

      if (selRegion && data.provsByRegion[selRegion]) {
        Object.keys(data.provsByRegion[selRegion]).sort().forEach(function (p) {
          var opt = document.createElement('option');
          opt.value = p; opt.textContent = p;
          provSel.appendChild(opt);
        });
      } else {
        // แสดงทุกจังหวัด
        var allProvs = {};
        Object.keys(data.provsByRegion).forEach(function (r) {
          Object.keys(data.provsByRegion[r]).forEach(function (p) { allProvs[p] = true; });
        });
        Object.keys(allProvs).sort().forEach(function (p) {
          var opt = document.createElement('option');
          opt.value = p; opt.textContent = p;
          provSel.appendChild(opt);
        });
      }
    }

    if (level === 'region' || level === 'prov') {
      var selProv = provSel.value;
      distSel.innerHTML = '<option value="">ทุกเขต/อำเภอ</option>';

      if (selProv && data.distsByProv[selProv]) {
        Object.keys(data.distsByProv[selProv]).sort().forEach(function (d) {
          var opt = document.createElement('option');
          opt.value = d; opt.textContent = d;
          distSel.appendChild(opt);
        });
      }
    }

    _applyBranchFilter();
  };

  // รีเซ็ตตัวกรองทั้งหมด
  window.amzResetFilter = function () {
    var regionSel = document.getElementById('amzFilterRegion');
    var provSel = document.getElementById('amzFilterProv');
    var distSel = document.getElementById('amzFilterDistrict');
    var searchEl = document.getElementById('amzBranchSearch');
    if (regionSel) regionSel.value = '';
    if (provSel) provSel.value = '';
    if (distSel) distSel.value = '';
    if (searchEl) searchEl.value = '';
    amzFilterChanged('region');
  };

  // กรองข้อมูลและอัปเดต KPI, แผนที่, กราฟ, ตาราง
  function _applyBranchFilter() {
    var regionVal = (document.getElementById('amzFilterRegion') || {}).value || '';
    var provVal = (document.getElementById('amzFilterProv') || {}).value || '';
    var distVal = (document.getElementById('amzFilterDistrict') || {}).value || '';

    var _srcBranches = (_amzCh === 'BlackCanyon' && typeof BC_BRANCHES !== 'undefined') ? BC_BRANCHES : (typeof AMZ_BRANCHES !== 'undefined' ? AMZ_BRANCHES : []);
    var filtered = _srcBranches.filter(function (b) {
      if (regionVal && _getRegion(b) !== regionVal) return false;
      if (provVal && (b[6] || '') !== provVal) return false;
      if (distVal && _getDistrict(b) !== distVal) return false;
      return true;
    });

    // --- อัปเดต KPI ---
    var provCount = {};
    filtered.forEach(function (b) { var p = b[6] || 'ไม่ระบุ'; provCount[p] = (provCount[p] || 0) + 1; });
    var provList = Object.keys(provCount);
    var topProv = provList.sort(function (a, b) { return provCount[b] - provCount[a]; })[0] || '-';

    var regionCount = {};
    filtered.forEach(function (b) { var r = _getRegion(b); regionCount[r] = (regionCount[r] || 0) + 1; });
    var regionList = Object.keys(regionCount).sort(function (a, b) { return regionCount[b] - regionCount[a]; });

    var kpiEl = document.getElementById('amzBranchKPI');
    if (kpiEl) {
      kpiEl.innerHTML =
        kpiCard('🏪', 'สาขาทั้งหมด', filtered.length.toString() + ' สาขา', _amzCh === 'BlackCanyon' ? 'Black Canyon' : 'Cafe Amazon', '#ea580c')
        + kpiCard('🗺️', 'จำนวนจังหวัด', provList.length.toString() + ' จังหวัด', 'พื้นที่กระจายสินค้า', '#2563eb')
        + kpiCard('🏆', 'จังหวัดสาขาสูงสุด', topProv, (provCount[topProv] || 0) + ' สาขา', '#16a34a')
        + kpiCard('📍', 'ครอบคลุม', regionList.length + ' ภูมิภาค', 'ทั่วประเทศไทย', '#7c3aed');
    }

    // --- แสดงจำนวนที่กรอง ---
    var countEl = document.getElementById('amzFilterCount');
    if (countEl) {
      if (regionVal || provVal || distVal) {
        var totalSrc = _amzCh === 'BlackCanyon' ? (typeof BC_BRANCHES !== 'undefined' ? BC_BRANCHES : []) : (typeof AMZ_BRANCHES !== 'undefined' ? AMZ_BRANCHES : []);
        countEl.textContent = 'แสดง ' + filtered.length + ' / ' + totalSrc.length + ' สาขา';
      } else {
        countEl.textContent = '';
      }
    }

    // --- อัปเดต markers บนแผนที่ ---
    if (_amzBranchMap && typeof L !== 'undefined') {
      _amzBranchMap.eachLayer(function (layer) {
        if (layer instanceof L.Marker) _amzBranchMap.removeLayer(layer);
      });

      var orangeIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
      });

      var bounds = [];
      filtered.forEach(function (b) {
        var lat = b[2], lng = b[3];
        if (lat && lng) {
          L.marker([lat, lng], { icon: orangeIcon })
            .addTo(_amzBranchMap)
            .bindPopup('<b>' + b[1] + '</b><br>' + (b[6] || '') + ' (' + (b[7] || '') + ')' + '<br>' + (b[5] || ''));
          bounds.push([lat, lng]);
        }
      });

      if (bounds.length > 0) {
        _amzBranchMap.fitBounds(bounds, { padding: [20, 20] });
      }
    }

    // --- อัปเดตกราฟจังหวัด (bar) ---
    var provSorted = Object.keys(provCount).sort(function (a, b) { return provCount[b] - provCount[a]; });
    var provColors = provSorted.map(function (_, i) { return 'hsl(' + (20 + i * 25) + ',75%,55%)'; });
    mkChart('amzBranchProvChart', {
      type: 'bar',
      data: {
        labels: provSorted,
        datasets: [{ label: 'จำนวนสาขา', data: provSorted.map(function (p) { return provCount[p]; }), backgroundColor: provColors, borderRadius: 5 }]
      },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { stepSize: 1 } } } }
    });

    // --- อัปเดตกราฟภูมิภาค (doughnut) ---
    var regionColors = ['#ea580c', '#2563eb', '#16a34a', '#7c3aed', '#0891b2', '#d97706', '#dc2626'];
    mkChart('amzBranchRegionChart', {
      type: 'doughnut',
      data: {
        labels: regionList,
        datasets: [{ data: regionList.map(function (r) { return regionCount[r]; }), backgroundColor: regionColors.slice(0, regionList.length), borderWidth: 2 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }
    });

    // --- อัปเดตกราฟจังหวัด (pie) ---
    mkChart('amzBranchProvPie', {
      type: 'pie',
      data: {
        labels: provSorted,
        datasets: [{ data: provSorted.map(function (p) { return provCount[p]; }), backgroundColor: provColors, borderWidth: 1 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } } }
    });

    // --- อัปเดตตาราง ---
    _renderFilteredTable(filtered);
  }

  // แสดงตารางจากข้อมูลที่กรองแล้ว (รวม search)
  function _renderFilteredTable(filtered) {
    var tbody = document.getElementById('amzBranchTableBody');
    if (!tbody) return;

    var search = (document.getElementById('amzBranchSearch') || {}).value || '';
    search = search.trim().toLowerCase();

    if (search) {
      filtered = filtered.filter(function (b) {
        var text = (b[1] + ' ' + (b[6] || '') + ' ' + (b[7] || '') + ' ' + (b[5] || '') + ' ' + (b[4] || '')).toLowerCase();
        return text.indexOf(search) >= 0;
      });
    }

    var titleEl = document.getElementById('amzBranchTableTitle');
    if (titleEl) titleEl.textContent = 'รายชื่อสาขา (' + filtered.length + ' สาขา)';

    var html = '';
    filtered.forEach(function (b, i) {
      var lat = b[2], lng = b[3];
      var mapLink = lat && lng
        ? '<a href="https://www.google.com/maps?q=' + lat + ',' + lng + '" target="_blank" rel="noopener" style="color:#ea580c;text-decoration:none;font-weight:600">เปิดแผนที่</a>'
        : '-';
      html += '<tr style="border-bottom:1px solid #f1f5f9">';
      html += '<td style="padding:8px 10px">' + (i + 1) + '</td>';
      html += '<td style="padding:8px 10px;font-weight:600">' + b[1] + '</td>';
      html += '<td style="padding:8px 10px">' + (b[6] || '-') + '</td>';
      html += '<td style="padding:8px 10px;font-size:11px;color:#7c3aed">' + (b[7] || '-') + '</td>';
      html += '<td style="padding:8px 10px">' + (b[4] || '-') + '</td>';
      html += '<td style="padding:8px 10px;font-size:11px;color:#64748b;max-width:250px">' + (b[5] || '-') + '</td>';
      html += '<td style="padding:8px 10px;text-align:center">' + mapLink + '</td>';
      html += '</tr>';
    });

    if (filtered.length === 0) {
      html = '<tr><td colspan="7" style="text-align:center;padding:24px;color:#94a3b8">ไม่พบสาขาที่ค้นหา</td></tr>';
    }

    tbody.innerHTML = html;
  }

  // search input เรียก filter pipeline เต็มรูปแบบ
  window.renderAmzBranchTable = function () {
    _applyBranchFilter();
  };

  // ---- RENDER: วิเคราะห์สินค้า (Product Analysis) ----
  window.renderAmzProdAnalysis = function () {
    var el = document.getElementById('amzProdAnalysisBody');
    if (!el) return;
    if (typeof AMZ_ORDER_DATA === 'undefined') { el.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8">ไม่พบข้อมูล</div>'; return; }

    var D = AMZ_ORDER_DATA;
    var chFilter = AMZ_CH_MAP[_amzCh];
    var channels = chFilter ? AMZ_CHANNELS.filter(function(c){ return chFilter.indexOf(c) >= 0; }) : AMZ_CHANNELS;
    var channelLabel = _amzCh === 'All' ? 'ทุกช่องทาง' : _amzCh === 'Amazon' ? 'Amazon' : _amzCh === 'Souvenir' ? 'ร้านของฝาก' : _amzCh;

    // Aggregate products from selected channels
    var prodMap = {};
    if (chFilter) {
      channels.forEach(function(ch) {
        (D.topProdByCh[ch] || []).forEach(function(d) {
          if (!prodMap[d.p]) prodMap[d.p] = { p: d.p, n: 0, q: 0 };
          prodMap[d.p].n += d.n; prodMap[d.p].q += d.q;
        });
      });
    } else {
      (D.topProdAll || []).forEach(function(d) {
        prodMap[d.p] = { p: d.p, n: d.n, q: d.q };
      });
    }
    var prods = Object.values(prodMap).sort(function(a,b){ return b.n - a.n; });
    var totalRev = 0;
    prods.forEach(function(p){ totalRev += p.n; });

    var html = '<div style="margin-bottom:18px"><h3 style="margin:0 0 4px;font-size:18px;color:#ea580c">📈 วิเคราะห์สินค้า — ' + channelLabel + '</h3>';
    html += '<p style="margin:0;font-size:12px;color:#94a3b8">AI วิเคราะห์จากข้อมูลจริง (' + D.dateRange[0] + ' – ' + D.dateRange[1] + ')</p></div>';

    // KPI summary
    var avgPrice = prods.length > 0 ? totalRev / prods.reduce(function(s,p){ return s + p.q; }, 0) : 0;
    var totalQty = prods.reduce(function(s,p){ return s + p.q; }, 0);
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:20px">';
    html += _kpiBox('📦','จำนวน SKU', prods.length.toLocaleString(), '#ea580c');
    html += _kpiBox('💰','ยอดขายรวม', fmt(totalRev), '#2563eb');
    html += _kpiBox('📊','จำนวนชิ้นรวม', totalQty.toLocaleString(), '#16a34a');
    html += _kpiBox('💵','ราคาเฉลี่ย/ชิ้น', avgPrice.toFixed(2) + ' ฿', '#7c3aed');
    html += '</div>';

    // ABC Analysis
    var cumRev = 0;
    var abcA = [], abcB = [], abcC = [];
    prods.forEach(function(p) {
      cumRev += p.n;
      var pct = totalRev > 0 ? cumRev / totalRev * 100 : 0;
      if (pct <= 80) abcA.push(p);
      else if (pct <= 95) abcB.push(p);
      else abcC.push(p);
    });

    html += '<div class="card" style="margin-bottom:16px;border-left:4px solid #7c3aed;padding:20px">';
    html += '<div class="card-title">📊 ABC Analysis (Pareto)</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:12px">';
    var abcRevA = abcA.reduce(function(s,p){ return s+p.n; },0);
    var abcRevB = abcB.reduce(function(s,p){ return s+p.n; },0);
    var abcRevC = abcC.reduce(function(s,p){ return s+p.n; },0);
    html += '<div style="background:#dcfce7;border-radius:12px;padding:16px;text-align:center"><div style="font-size:24px;font-weight:800;color:#16a34a">A</div><div style="font-size:12px;color:#166534;margin-top:4px">80% ของยอดขาย</div><div style="font-size:18px;font-weight:700;color:#16a34a;margin-top:8px">' + abcA.length + ' SKU</div><div style="font-size:11px;color:#166534">' + fmt(abcRevA) + '</div></div>';
    html += '<div style="background:#fef9c3;border-radius:12px;padding:16px;text-align:center"><div style="font-size:24px;font-weight:800;color:#ca8a04">B</div><div style="font-size:12px;color:#854d0e;margin-top:4px">15% ของยอดขาย</div><div style="font-size:18px;font-weight:700;color:#ca8a04;margin-top:8px">' + abcB.length + ' SKU</div><div style="font-size:11px;color:#854d0e">' + fmt(abcRevB) + '</div></div>';
    html += '<div style="background:#fee2e2;border-radius:12px;padding:16px;text-align:center"><div style="font-size:24px;font-weight:800;color:#dc2626">C</div><div style="font-size:12px;color:#991b1b;margin-top:4px">5% ของยอดขาย</div><div style="font-size:18px;font-weight:700;color:#dc2626;margin-top:8px">' + abcC.length + ' SKU</div><div style="font-size:11px;color:#991b1b">' + fmt(abcRevC) + '</div></div>';
    html += '</div></div>';

    // Top Sellers
    var top10 = prods.slice(0, 10);
    html += '<div class="card" style="margin-bottom:16px"><div class="card-title">🏆 Top Seller (10 อันดับแรก)</div>';
    html += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:#fff7ed;color:#9a3412">';
    html += '<th style="padding:8px">#</th><th style="padding:8px;text-align:left">สินค้า</th><th style="padding:8px;text-align:right">ยอดขาย</th><th style="padding:8px;text-align:right">จำนวน</th><th style="padding:8px;text-align:right">สัดส่วน</th><th style="padding:8px;text-align:left">กลุ่ม</th></tr></thead><tbody>';
    top10.forEach(function(p, i){
      var pct = totalRev > 0 ? (p.n / totalRev * 100).toFixed(1) : '0';
      var cls = i < abcA.length ? '<span style="color:#16a34a;font-weight:700">A</span>' : '<span style="color:#ca8a04;font-weight:700">B</span>';
      html += '<tr style="border-bottom:1px solid #f1f5f9"><td style="padding:8px">' + (i+1) + '</td>';
      html += '<td style="padding:8px">' + p.p + '</td>';
      html += '<td style="padding:8px;text-align:right;font-weight:700;color:#ea580c">' + fmt(p.n) + '</td>';
      html += '<td style="padding:8px;text-align:right">' + p.q.toLocaleString() + '</td>';
      html += '<td style="padding:8px;text-align:right">' + pct + '%</td>';
      html += '<td style="padding:8px">' + cls + '</td></tr>';
    });
    html += '</tbody></table></div></div>';

    // Bottom Sellers
    if (prods.length > 5) {
      var bottom5 = prods.slice(-5).reverse();
      html += '<div class="card" style="margin-bottom:16px"><div class="card-title">📉 Bottom Seller (5 อันดับท้าย)</div>';
      html += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:#fef2f2;color:#991b1b">';
      html += '<th style="padding:8px">#</th><th style="padding:8px;text-align:left">สินค้า</th><th style="padding:8px;text-align:right">ยอดขาย</th><th style="padding:8px;text-align:right">จำนวน</th><th style="padding:8px;text-align:right">สัดส่วน</th></tr></thead><tbody>';
      bottom5.forEach(function(p, i){
        var pct = totalRev > 0 ? (p.n / totalRev * 100).toFixed(2) : '0';
        html += '<tr style="border-bottom:1px solid #f1f5f9"><td style="padding:8px">' + (i+1) + '</td>';
        html += '<td style="padding:8px">' + p.p + '</td>';
        html += '<td style="padding:8px;text-align:right;font-weight:700;color:#dc2626">' + fmt(p.n) + '</td>';
        html += '<td style="padding:8px;text-align:right">' + p.q.toLocaleString() + '</td>';
        html += '<td style="padding:8px;text-align:right">' + pct + '%</td></tr>';
      });
      html += '</tbody></table></div></div>';
    }

    // Revenue per unit analysis
    var prodsByUnit = prods.slice().filter(function(p){ return p.q > 0; }).map(function(p){ p._rpu = p.n / p.q; return p; }).sort(function(a,b){ return b._rpu - a._rpu; });
    if (prodsByUnit.length > 0) {
      html += '<div class="card" style="margin-bottom:16px"><div class="card-title">💵 สินค้ามูลค่าสูงสุดต่อชิ้น (Top 10)</div>';
      html += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:#f5f3ff;color:#6d28d9">';
      html += '<th style="padding:8px">#</th><th style="padding:8px;text-align:left">สินค้า</th><th style="padding:8px;text-align:right">ราคาเฉลี่ย/ชิ้น</th><th style="padding:8px;text-align:right">ยอดขาย</th><th style="padding:8px;text-align:right">จำนวน</th></tr></thead><tbody>';
      prodsByUnit.slice(0,10).forEach(function(p, i){
        html += '<tr style="border-bottom:1px solid #f1f5f9"><td style="padding:8px">' + (i+1) + '</td>';
        html += '<td style="padding:8px">' + p.p + '</td>';
        html += '<td style="padding:8px;text-align:right;font-weight:700;color:#7c3aed">' + p._rpu.toFixed(2) + ' ฿</td>';
        html += '<td style="padding:8px;text-align:right">' + fmt(p.n) + '</td>';
        html += '<td style="padding:8px;text-align:right">' + p.q.toLocaleString() + '</td></tr>';
      });
      html += '</tbody></table></div></div>';
    }

    // AI Recommendations
    html += '<div class="card" style="margin-bottom:16px;border-left:4px solid #16a34a"><div class="card-title">💡 AI ข้อเสนอแนะ</div>';
    html += '<ul style="margin:8px 0;padding-left:20px;font-size:13px;line-height:2;color:#334155">';
    if (top10.length > 0) {
      var top3Rev = top10.slice(0,3).reduce(function(s,p){ return s+p.n; },0);
      var top3Pct = totalRev > 0 ? (top3Rev / totalRev * 100).toFixed(1) : 0;
      html += '<li>🏆 สินค้า Top 3 (<strong>' + top10[0].p + ', ' + (top10[1]?top10[1].p:'') + ', ' + (top10[2]?top10[2].p:'') + '</strong>) คิดเป็น <strong>' + top3Pct + '%</strong> ของยอดขายรวม — ต้องรักษา stock ให้เพียงพอ</li>';
    }
    html += '<li>📊 ABC Analysis: กลุ่ม A จำนวน <strong>' + abcA.length + ' SKU</strong> สร้างรายได้ 80% — ควรให้ความสำคัญกับการจัดวาง display และ promotion</li>';
    if (abcC.length > 0) {
      html += '<li>⚠️ กลุ่ม C จำนวน <strong>' + abcC.length + ' SKU</strong> สร้างรายได้เพียง 5% — พิจารณาลดพื้นที่จัดวาง หรือหาทางเพิ่มยอดด้วยโปรโมชั่น</li>';
    }
    if (prodsByUnit.length > 0) {
      html += '<li>💵 สินค้ามูลค่าสูงสุดต่อชิ้น: <strong>' + prodsByUnit[0].p + '</strong> (' + prodsByUnit[0]._rpu.toFixed(2) + ' ฿/ชิ้น) — ควรผลักดันยอดขายเพิ่ม</li>';
    }
    if (prods.length > 5) {
      var bottomP = prods[prods.length - 1];
      html += '<li>📉 สินค้าขายน้อยที่สุด: <strong>' + bottomP.p + '</strong> (' + fmt(bottomP.n) + ') — ควรวิเคราะห์สาเหตุและพิจารณาปรับกลยุทธ์</li>';
    }
    html += '</ul></div>';

    // Channel comparison (only when All channels)
    if (!chFilter && D.topProdByCh) {
      html += '<div class="card" style="margin-bottom:16px"><div class="card-title">🔀 เปรียบเทียบ Top 5 สินค้าแยกช่องทาง</div>';
      html += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#f0f9ff;color:#0369a1">';
      html += '<th style="padding:8px;text-align:left">ช่องทาง</th>';
      for (var r = 1; r <= 5; r++) html += '<th style="padding:8px;text-align:left">อันดับ ' + r + '</th>';
      html += '</tr></thead><tbody>';
      AMZ_CHANNELS.forEach(function(ch) {
        var chProds = D.topProdByCh[ch] || [];
        if (chProds.length === 0) return;
        html += '<tr style="border-bottom:1px solid #f1f5f9"><td style="padding:8px;font-weight:700">' + ch + '</td>';
        for (var r = 0; r < 5; r++) {
          if (chProds[r]) {
            html += '<td style="padding:8px"><div style="font-size:11px">' + chProds[r].p + '</div><div style="font-size:10px;color:#ea580c;font-weight:600">' + fmt(chProds[r].n) + '</div></td>';
          } else {
            html += '<td style="padding:8px;color:#cbd5e1">-</td>';
          }
        }
        html += '</tr>';
      });
      html += '</tbody></table></div></div>';
    }

    el.innerHTML = html;
  };

  // ---- RENDER: ตัวชี้วัด (KPI) ----
  window.renderAmzKPI = function () {
    var el = document.getElementById('amzKpiBody');
    if (!el) return;
    if (typeof AMZ_ORDER_DATA === 'undefined') { el.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8">ไม่พบข้อมูล</div>'; return; }

    var D = AMZ_ORDER_DATA;
    var curYear = new Date().getFullYear();
    var allYm = Object.keys(D.monthlyAll || {}).sort();
    var ymThisYear = allYm.filter(function(ym){ return ym.indexOf(curYear+'') === 0; });
    var ymLastYear = allYm.filter(function(ym){ return ym.indexOf((curYear-1)+'') === 0; });

    var totalThis = 0, totalLast = 0, billsThis = 0;
    ymThisYear.forEach(function(ym){ var d = D.monthlyAll[ym]; if(d){ totalThis += d.net; billsThis += (d.bills||0); } });
    ymLastYear.forEach(function(ym){ var d = D.monthlyAll[ym]; if(d) totalLast += d.net; });
    var moCount = ymThisYear.length || 1;
    var avgPerMonth = totalThis / moCount;
    var growthPct = totalLast > 0 ? (((totalThis / moCount) / (totalLast / Math.max(ymLastYear.length,1)) - 1) * 100).toFixed(1) : '-';

    var tgtTotal = 0;
    if (typeof getTargetByYear === 'function') {
      var T = getTargetByYear(curYear);
      if (T && T.amazonTotal && T.amazonTotal.monthly) {
        for (var m = 0; m < moCount && m < 12; m++) tgtTotal += (T.amazonTotal.monthly[m] || 0);
      }
    }
    var achPct = tgtTotal > 0 ? ((totalThis / tgtTotal) * 100).toFixed(1) : '-';

    var html = '<div style="margin-bottom:16px"><h3 style="margin:0 0 4px;font-size:18px;color:#ea580c">🎯 ตัวชี้วัด Amazon & ของฝาก</h3>';
    html += '<p style="margin:0;font-size:12px;color:#94a3b8">ปี ' + (curYear + 543) + ' (' + moCount + ' เดือน)</p></div>';

    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:20px">';
    html += _kpiBox('💰','ยอดขายรวม YTD', fmt(totalThis), '#ea580c');
    html += _kpiBox('🎯','เป้าหมาย YTD', fmt(tgtTotal), '#2563eb');
    html += _kpiBox('📊','Achievement', achPct + '%', parseFloat(achPct) >= 80 ? '#16a34a' : '#dc2626');
    html += _kpiBox('📈','เติบโต vs ปีก่อน', growthPct + '%', parseFloat(growthPct) >= 0 ? '#16a34a' : '#dc2626');
    html += _kpiBox('📋','จำนวนบิลรวม', billsThis.toLocaleString(), '#7c3aed');
    html += _kpiBox('📅','เฉลี่ย/เดือน', fmt(avgPerMonth), '#0891b2');
    html += '</div>';

    // Channel breakdown
    html += '<div class="card" style="margin-bottom:16px"><div class="card-title">📊 ยอดขายแยกช่องทาง (YTD ' + (curYear+543) + ')</div>';
    html += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:#fff7ed;color:#9a3412">';
    html += '<th style="padding:10px 8px;text-align:left">ช่องทาง</th><th style="padding:10px 8px;text-align:right">ยอดขาย</th><th style="padding:10px 8px;text-align:right">สัดส่วน</th></tr></thead><tbody>';
    var chTotals = {};
    AMZ_CHANNELS.forEach(function(ch){ chTotals[ch] = 0; });
    AMZ_CHANNELS.forEach(function(ch){
      var chData = D.monthlyByCh[ch];
      if (!chData) return;
      ymThisYear.forEach(function(ym){ if(chData[ym]) chTotals[ch] += chData[ym].net; });
    });
    var sorted = AMZ_CHANNELS.slice().sort(function(a,b){ return chTotals[b] - chTotals[a]; });
    sorted.forEach(function(ch){
      var pct = totalThis > 0 ? ((chTotals[ch] / totalThis) * 100).toFixed(1) : '0';
      html += '<tr style="border-bottom:1px solid #f1f5f9"><td style="padding:8px">' + ch + '</td>';
      html += '<td style="padding:8px;text-align:right;font-weight:700;color:#ea580c">' + fmt(chTotals[ch]) + '</td>';
      html += '<td style="padding:8px;text-align:right">' + pct + '%</td></tr>';
    });
    html += '</tbody></table></div></div>';

    el.innerHTML = html;
  };

  function _kpiBox(icon, label, val, color) {
    return '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:18px;border-top:3px solid '+color+'">'
      + '<div style="font-size:11px;color:#94a3b8;margin-bottom:4px">'+icon+' '+label+'</div>'
      + '<div style="font-size:22px;font-weight:800;color:'+color+'">'+val+'</div></div>';
  }

  // ---- RENDER: พยากรณ์ (Forecast) ----
  window.renderAmzForecast = function () {
    var el = document.getElementById('amzForecastBody');
    if (!el) return;
    el.innerHTML = '<div style="text-align:center;padding:60px 20px">'
      + '<div style="font-size:48px;margin-bottom:12px">📊</div>'
      + '<div style="font-size:18px;font-weight:700;color:#1e293b;margin-bottom:8px">พยากรณ์ยอดขาย</div>'
      + '<div style="font-size:13px;color:#94a3b8;line-height:1.6">รอข้อมูลจากไฟล์ Excel เพื่ออัพเดท<br>กรุณาอัปโหลดไฟล์พยากรณ์ในแผงแอดมิน</div>'
      + '</div>';
  };

  // ---- RENDER: วิเคราะห์ AI ----
  window.renderAmzAI = function () {
    var el = document.getElementById('amzAiBody');
    if (!el) return;
    if (typeof AMZ_ORDER_DATA === 'undefined') { el.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8">ไม่พบข้อมูล</div>'; return; }

    var D = AMZ_ORDER_DATA;
    var curYear = new Date().getFullYear();
    var allYm = Object.keys(D.monthlyAll || {}).sort();
    var ymCur = allYm.filter(function(ym){ return ym.indexOf(curYear+'') === 0; });
    var ymPrev = allYm.filter(function(ym){ return ym.indexOf((curYear-1)+'') === 0; });

    // Compute channel data — monthlyByCh[channel][year-month].net
    var chRevCur = {}, chRevPrev = {};
    AMZ_CHANNELS.forEach(function(ch){ chRevCur[ch] = 0; chRevPrev[ch] = 0; });
    AMZ_CHANNELS.forEach(function(ch){
      var cd = D.monthlyByCh[ch]; if (!cd) return;
      ymCur.forEach(function(ym){ if(cd[ym]) chRevCur[ch] += cd[ym].net; });
      ymPrev.forEach(function(ym){ if(cd[ym]) chRevPrev[ch] += cd[ym].net; });
    });

    var totalCur = 0, totalPrev = 0;
    AMZ_CHANNELS.forEach(function(ch){ totalCur += chRevCur[ch]; totalPrev += chRevPrev[ch]; });

    // Monthly trend for current year
    var moTrend = [];
    ymCur.forEach(function(ym){
      var d = D.monthlyAll[ym];
      moTrend.push({ym: ym, rev: d ? d.net : 0});
    });

    // Growth analysis
    var chGrowth = [];
    AMZ_CHANNELS.forEach(function(ch){
      var prev = chRevPrev[ch], cur = chRevCur[ch];
      var g = prev > 0 ? ((cur / Math.max(ymCur.length,1)) / (prev / Math.max(ymPrev.length,1)) - 1) * 100 : 0;
      chGrowth.push({ch: ch, cur: cur, prev: prev, growth: g});
    });
    chGrowth.sort(function(a,b){ return b.growth - a.growth; });

    // Top products
    var topProds = D.topProdAll ? D.topProdAll.slice(0, 10) : [];

    // Target analysis
    var tgtTotal = 0, achPct = 0;
    if (typeof getTargetByYear === 'function') {
      var T = getTargetByYear(curYear);
      if (T && T.amazonTotal && T.amazonTotal.monthly) {
        for (var m = 0; m < ymCur.length && m < 12; m++) tgtTotal += (T.amazonTotal.monthly[m] || 0);
      }
    }
    achPct = tgtTotal > 0 ? (totalCur / tgtTotal * 100) : 0;

    // Identify strongest/weakest months
    var bestMo = moTrend.length ? moTrend.reduce(function(a,b){ return a.rev > b.rev ? a : b; }) : null;
    var worstMo = moTrend.length ? moTrend.reduce(function(a,b){ return a.rev < b.rev ? a : b; }) : null;

    var html = '<div style="margin-bottom:18px"><h3 style="margin:0 0 4px;font-size:18px;color:#7c3aed">🤖 AI วิเคราะห์ Amazon & ของฝาก</h3>';
    html += '<p style="margin:0;font-size:12px;color:#94a3b8">วิเคราะห์อัตโนมัติจากข้อมูลจริง ปี ' + (curYear+543) + '</p></div>';

    // Summary Card
    html += '<div class="card" style="margin-bottom:16px;border-left:4px solid #7c3aed;padding:20px">';
    html += '<div class="card-title">📋 สรุปภาพรวม</div>';
    html += '<ul style="margin:8px 0;padding-left:20px;font-size:13px;line-height:2;color:#334155">';
    html += '<li>ยอดขายรวม YTD: <strong style="color:#ea580c">' + fmt(totalCur) + '</strong> (' + ymCur.length + ' เดือน)</li>';
    if (tgtTotal > 0) {
      html += '<li>เป้าหมาย YTD: ' + fmt(tgtTotal) + ' — Achievement: <strong style="color:' + (achPct >= 80 ? '#16a34a' : '#dc2626') + '">' + achPct.toFixed(1) + '%</strong></li>';
    }
    var overallGrowth = totalPrev > 0 ? ((totalCur / ymCur.length) / (totalPrev / Math.max(ymPrev.length,1)) - 1) * 100 : 0;
    html += '<li>เติบโตเทียบปีก่อน (ต่อเดือน): <strong style="color:' + (overallGrowth >= 0 ? '#16a34a' : '#dc2626') + '">' + overallGrowth.toFixed(1) + '%</strong></li>';
    if (bestMo) html += '<li>เดือนที่ขายดีที่สุด: <strong>' + _amzYmLabel(bestMo.ym) + '</strong> (' + fmt(bestMo.rev) + ')</li>';
    if (worstMo) html += '<li>เดือนที่ขายน้อยที่สุด: <strong>' + _amzYmLabel(worstMo.ym) + '</strong> (' + fmt(worstMo.rev) + ')</li>';
    html += '</ul></div>';

    // Channel Growth Analysis
    html += '<div class="card" style="margin-bottom:16px"><div class="card-title">📈 วิเคราะห์การเติบโตรายช่องทาง</div>';
    html += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:#f5f3ff;color:#6d28d9">';
    html += '<th style="padding:10px 8px;text-align:left">ช่องทาง</th><th style="padding:10px 8px;text-align:right">ปี ' + (curYear+543) + '</th><th style="padding:10px 8px;text-align:right">ปี ' + (curYear+542) + '</th><th style="padding:10px 8px;text-align:right">เติบโต</th><th style="padding:10px 8px;text-align:left">สถานะ</th></tr></thead><tbody>';
    chGrowth.forEach(function(c) {
      var badge = c.growth > 10 ? '<span style="color:#16a34a;font-weight:700">🟢 เติบโตดี</span>'
        : c.growth > 0 ? '<span style="color:#ca8a04;font-weight:700">🟡 เติบโตเล็กน้อย</span>'
        : c.growth > -10 ? '<span style="color:#ea580c;font-weight:700">🟠 ทรงตัว/ลดเล็กน้อย</span>'
        : '<span style="color:#dc2626;font-weight:700">🔴 ลดลงมาก</span>';
      html += '<tr style="border-bottom:1px solid #f1f5f9"><td style="padding:8px">' + c.ch + '</td>';
      html += '<td style="padding:8px;text-align:right;font-weight:700">' + fmt(c.cur) + '</td>';
      html += '<td style="padding:8px;text-align:right">' + fmt(c.prev) + '</td>';
      html += '<td style="padding:8px;text-align:right;font-weight:700;color:' + (c.growth >= 0 ? '#16a34a' : '#dc2626') + '">' + c.growth.toFixed(1) + '%</td>';
      html += '<td style="padding:8px">' + badge + '</td></tr>';
    });
    html += '</tbody></table></div></div>';

    // AI Recommendations
    html += '<div class="card" style="margin-bottom:16px;border-left:4px solid #16a34a"><div class="card-title">💡 ข้อเสนอแนะ AI</div>';
    html += '<ul style="margin:8px 0;padding-left:20px;font-size:13px;line-height:2;color:#334155">';
    // Generate dynamic recommendations
    var growingChs = chGrowth.filter(function(c){ return c.growth > 5 && c.cur > 0; });
    var decliningChs = chGrowth.filter(function(c){ return c.growth < -5 && c.prev > 0; });
    if (achPct < 80 && tgtTotal > 0) {
      var gap = tgtTotal - totalCur;
      html += '<li>⚠️ Achievement อยู่ที่ ' + achPct.toFixed(1) + '% ต่ำกว่าเป้า — ต้องเพิ่มยอดอีก <strong>' + fmt(gap) + '</strong> ใน ' + (12 - ymCur.length) + ' เดือนที่เหลือ (เฉลี่ย ' + fmt(gap / Math.max(12 - ymCur.length, 1)) + '/เดือน)</li>';
    }
    growingChs.forEach(function(c){
      html += '<li>🟢 ช่องทาง <strong>' + c.ch + '</strong> เติบโต ' + c.growth.toFixed(1) + '% — ควรเพิ่มทรัพยากรและขยายฐานลูกค้า</li>';
    });
    decliningChs.forEach(function(c){
      html += '<li>🔴 ช่องทาง <strong>' + c.ch + '</strong> ลดลง ' + Math.abs(c.growth).toFixed(1) + '% — ควรตรวจสอบสาเหตุและวางแผนกู้ยอด</li>';
    });
    if (topProds.length > 0) {
      html += '<li>🏆 สินค้าขายดีอันดับ 1: <strong>' + topProds[0].p + '</strong> (' + fmt(topProds[0].n) + ') — ควรรักษา stock ให้เพียงพอ</li>';
    }
    html += '</ul></div>';

    // Top Products
    if (topProds.length > 0) {
      html += '<div class="card"><div class="card-title">🏆 สินค้าขายดี Top 10</div>';
      html += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:#f5f3ff;color:#6d28d9">';
      html += '<th style="padding:8px">#</th><th style="padding:8px;text-align:left">สินค้า</th><th style="padding:8px;text-align:right">ยอดขาย</th><th style="padding:8px;text-align:right">จำนวน</th></tr></thead><tbody>';
      topProds.forEach(function(p, i){
        html += '<tr style="border-bottom:1px solid #f1f5f9"><td style="padding:8px">' + (i+1) + '</td>';
        html += '<td style="padding:8px">' + p.p + '</td>';
        html += '<td style="padding:8px;text-align:right;font-weight:700;color:#ea580c">' + fmt(p.n) + '</td>';
        html += '<td style="padding:8px;text-align:right">' + (p.q || 0).toLocaleString() + '</td></tr>';
      });
      html += '</tbody></table></div></div>';
    }

    el.innerHTML = html;
  };

})();
