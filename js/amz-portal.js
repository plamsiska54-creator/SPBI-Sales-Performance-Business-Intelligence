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
    if (_amzPeriod === 'thismonth') {
      var idx = mo; // Jul=6
      if (idx >= 0 && idx < AMZ_MONTHS_ALL.length) return { months: [AMZ_MONTHS_ALL[idx]], labels: [AMZ_MONTH_TH_ALL[idx]] };
      return { months: AMZ_MONTHS_ALL, labels: AMZ_MONTH_TH_ALL };
    }
    if (_amzPeriod === 'lastmonth') {
      var idx = mo - 1;
      if (idx >= 0 && idx < AMZ_MONTHS_ALL.length) return { months: [AMZ_MONTHS_ALL[idx]], labels: [AMZ_MONTH_TH_ALL[idx]] };
      return { months: AMZ_MONTHS_ALL, labels: AMZ_MONTH_TH_ALL };
    }
    if (_amzPeriod === 'q1') return { months: ['Jan','Feb','Mar'], labels: ['ม.ค.','ก.พ.','มี.ค.'] };
    if (_amzPeriod === 'q2') return { months: ['Apr','May','Jun'], labels: ['เม.ย.','พ.ค.','มิ.ย.'] };
    if (_amzPeriod === 'q3') return { months: ['Jul'], labels: ['ก.ค.'] };
    if (_amzPeriod === 'q4') return { months: [], labels: [] };
    return { months: AMZ_MONTHS_ALL, labels: AMZ_MONTH_TH_ALL };
  }

  var _MO_TH = ['','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

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
    var infoMap = { all: _amzYmLabel(months[0]) + ' – ' + _amzYmLabel(months[months.length-1]), thismonth:'ก.ค. '+be, lastmonth:'มิ.ย. '+be, q1:'Q1 ม.ค.–มี.ค. '+be, q2:'Q2 เม.ย.–มิ.ย. '+be, q3:'Q3 ก.ค.–ก.ย. '+be, q4:'Q4 ต.ค.–ธ.ค. '+be };
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
    if(label) label.textContent = y === 'all' ? '📅 ทั้งหมด (3 ปี)' : '📅 ปี ' + (parseInt(y) + 543);
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
    window.renderAmzDashboard();
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
    {key:'supply', icon:'📦', label:'ซัพพลายเชน', items:[
      {key:'order', label:'คำสั่งซื้อ', sub:'amz-order', render:'renderAmzOrder'},
      {key:'map', label:'Map Wanwanach', sub:'amz-map', render:'renderMapTierKPI'},
      {key:'branches', label:'สาขา', sub:'amz-branches', render:'renderAmzBranches'}
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
    // Hide portal sidebar, show content full width
    var sidebar = document.getElementById('amzBiSidebar');
    var content = document.getElementById('amzBiContent');
    if (sidebar) sidebar.style.display = 'none';
    if (content) content.style.gridColumn = '1 / -1';
    if (renderFn && typeof window[renderFn] === 'function') window[renderFn]();
  }

  function _amzRestoreLayout() {
    var sidebar = document.getElementById('amzBiSidebar');
    var content = document.getElementById('amzBiContent');
    if (sidebar) sidebar.style.display = '';
    if (content) content.style.gridColumn = '';
  }

  window.amzClickTeam = function (el) {
    document.querySelectorAll('#amzChannelTabs .sub-tab').forEach(function (t) { t.classList.remove('active'); });
    _amzCh = 'All';
    _amzBiCurrent = 'team-info';
    _teamRendered = false;
    _amzShowDirect('amz-team', 'renderAmzTeam');
  };

  window.amzClickComplaint = function (el) {
    document.querySelectorAll('#amzChannelTabs .sub-tab').forEach(function (t) { t.classList.remove('active'); });
    _amzCh = 'All';
    _amzBiCurrent = 'complaint';
    _amzShowDirect('amz-complaint', 'renderAmzComplaint');
  };

  window.amzClickChannel = function (el, ch) {
    document.querySelectorAll('#amzChannelTabs .sub-tab').forEach(function (t) { t.classList.remove('active'); });
    el.classList.add('active');
    _amzCh = ch;
    _dashboardRendered = false;
    _branchRendered = false;
    _amzRestoreLayout();
    if (_amzBranchMap) { _amzBranchMap.remove(); _amzBranchMap = null; }
    amzBiSelectMenu('dashboard');
  };

  function _amzItemVisible(itemKey) {
    if (itemKey === 'map') {
      if (_amzCh === 'BlackCanyon' || _amzCh === 'Souvenir') return false;
    }
    if (itemKey === 'branches') {
      if (_amzCh === 'Souvenir') return false;
    }
    if (_amzCh === 'BlackCanyon') {
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

  // ---- RENDER: แดชบอร์ด (amz-dashboard) — MT style ----
  var _dashboardRendered = false;

  window.renderAmzDashboard = function () {
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
    var yearLabel = _amzYear === 'all' ? '3 ปี (2024–2026)' : 'ปี ' + (parseInt(_amzYear)+543);

    var kpiEl = document.getElementById('amazonKPI');
    if (kpiEl) {
      kpiEl.innerHTML =
        '<div class="kpi-card blue"><div class="kpi-label">💰 Revenue รวม</div>'
        + '<div class="kpi-value sm">' + (grandA / 1e6).toFixed(2) + ' M</div>'
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
    if(label) label.textContent = y === 'all' ? '📅 ทั้งหมด (3 ปี)' : '📅 ปี ' + (parseInt(y) + 543);
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
    var yearLabel = _amzSalesYear === 'all' ? '3 ปี (2024–2026)' : 'ปี ' + (parseInt(_amzSalesYear)+543);

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

    var mthLabels = months.map(function(ym) { return _amzYmLabel(ym); });
    var mthVals = months.map(function(ym) {
      var sum = 0;
      channels.forEach(function(ch) { if (D.monthlyByCh[ch] && D.monthlyByCh[ch][ym]) sum += D.monthlyByCh[ch][ym].net; });
      return sum / 1e6;
    });
    mkChart('amzSalesMthBar', {
      type: 'bar',
      data: { labels: mthLabels, datasets: [{ label: 'Revenue (M฿)', data: mthVals, backgroundColor: chIdx >= 0 ? palette[chIdx] + 'cc' : 'rgba(234,88,12,.8)', borderRadius: 5 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: function (v) { return v.toFixed(1) + ' M'; } } }, x: { ticks: { maxRotation: 60, font: { size: 9 } } } } }
    });

    // Top channels bar (replaces top customers when multi-year)
    var chBarData = channels.map(function(ch) {
      var total = 0;
      months.forEach(function(ym) { if (D.monthlyByCh[ch] && D.monthlyByCh[ch][ym]) total += D.monthlyByCh[ch][ym].net; });
      return { ch: ch, n: total };
    }).sort(function(a,b){ return b.n - a.n; }).slice(0, 10);
    mkChart('amzSalesTopBar', {
      type: 'bar',
      data: {
        labels: chBarData.map(function(d){ return d.ch.length > 20 ? d.ch.slice(0,18) + '…' : d.ch; }),
        datasets: [{ label: 'Revenue (฿)', data: chBarData.map(function(d){ return d.n; }),
          backgroundColor: chBarData.map(function(d) { var i = AMZ_CHANNELS.indexOf(d.ch); return palette[i >= 0 ? i : 0]; }), borderRadius: 5 }]
      },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { x: { ticks: { callback: function (v) { return (v / 1e6).toFixed(2) + ' M'; } } } } }
    });

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
      rows += '<tr>';
      rows += '<td style="padding:8px 10px;font-weight:600">' + _amzYmLabel(ym) + '</td>';
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
    if(label) label.textContent = y === 'all' ? '📅 ทั้งหมด (3 ปี)' : '📅 ปี ' + (parseInt(y) + 543);
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
    var yearLabel = _amzTargetYear === 'all' ? '3 ปี (2024–2026)' : 'ปี ' + (parseInt(_amzTargetYear)+543);
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
    var tgtVals = months.map(function(ym) { var s = 0; filteredChs.forEach(function(ch){ s += _amzGetTarget(ym, ch); }); return s / 1e6; });
    var actVals = months.map(function(ym) { var s = 0; filteredChs.forEach(function(ch){ if (D.monthlyByCh[ch] && D.monthlyByCh[ch][ym]) s += D.monthlyByCh[ch][ym].net; }); return s / 1e6; });

    var datasets = [{ label: 'Actual', data: actVals, backgroundColor: 'rgba(234,88,12,.65)', borderColor: '#ea580c', borderWidth: 2, borderRadius: 6 }];
    if (hasTarget) datasets.unshift({ label: 'Target', data: tgtVals, backgroundColor: 'rgba(79,70,229,.25)', borderColor: '#4f46e5', borderWidth: 2, borderRadius: 6 });
    mkChart('amzTargetVsActualBar', {
      type: 'bar',
      data: { labels: mthLabels, datasets: datasets },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } },
        scales: { y: { ticks: { callback: function (v) { return v.toFixed(1) + ' M'; } } }, x: { ticks: { maxRotation: 60, font: { size: 9 } } } } }
    });

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
      var html = '<table style="width:100%;border-collapse:collapse;font-size:13px">';
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
      html += '<td></td></tr></tbody></table>';
      chTbl.innerHTML = html;
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

    var totalRev = 0, totalQty = 0, ambientCount = 0, chillCount = 0;
    prods.forEach(function(d){ totalRev += d.n; totalQty += d.q; if(d.type==='Ambient') ambientCount++; else chillCount++; });
    var rankCounts = { 'A+':0, 'A':0, 'B':0, 'C':0 };
    prods.forEach(function(d){ rankCounts[d.rank]++; });

    // Period filter bar (dropdown style)
    var isQtr = ['q1','q2','q3','q4'].indexOf(_amzProdPeriod) >= 0;
    var isYear = _amzProdYear !== 'all';
    var html = '<div class="filter-bar" id="amzProdPeriodBar" style="gap:6px;flex-wrap:wrap;margin-bottom:12px;display:flex;align-items:center;padding:8px 12px;background:var(--card);border-radius:10px;border:1px solid var(--border)">';
    html += '<span style="font-size:12px;font-weight:700;color:var(--text2)">📅 ช่วงเวลา:</span>';
    html += '<div style="display:flex;gap:4px;flex-wrap:wrap" id="amzProdPeriodBtns">';
    html += '<div class="period-type-btn' + (_amzProdPeriod==='all'&&_amzProdYear==='all'?' active':'') + '" onclick="_amzProdSetPeriod(\'all\',this)">ทั้งหมด</div>';
    html += '<div class="period-type-btn' + (_amzProdPeriod==='thismonth'?' active':'') + '" onclick="_amzProdSetPeriod(\'thismonth\',this)">เดือนนี้</div>';
    html += '<div class="period-type-btn' + (_amzProdPeriod==='lastmonth'?' active':'') + '" onclick="_amzProdSetPeriod(\'lastmonth\',this)">เดือนที่แล้ว</div>';
    // Year dropdown
    html += '<div id="amzProdYearDropdown" style="position:relative;display:inline-block">';
    html += '<div class="period-type-btn' + (isYear?' active':'') + '" onclick="_amzProdToggleYMenu()" style="padding-right:22px;cursor:pointer"><span id="amzProdYearLabel">📅 รายปี</span><span style="position:absolute;right:7px;top:50%;transform:translateY(-50%);font-size:10px;pointer-events:none">▾</span></div>';
    html += '<div id="amzProdYearMenu" style="display:none;position:absolute;top:calc(100% + 4px);left:0;background:#fff;border:1px solid #e2e8f0;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.1);min-width:150px;z-index:200;padding:4px 0">';
    html += '<div class="qmenu-item' + (_amzProdYear==='all'&&!isQtr?' active':'') + '" onclick="_amzProdPickYear(\'all\',this)">📅 ทั้งหมด</div>';
    html += '<div class="qmenu-item' + (_amzProdYear==='2024'?' active':'') + '" onclick="_amzProdPickYear(\'2024\',this)">📅 ปี 2567 (2024)</div>';
    html += '<div class="qmenu-item' + (_amzProdYear==='2025'?' active':'') + '" onclick="_amzProdPickYear(\'2025\',this)">📅 ปี 2568 (2025)</div>';
    html += '<div class="qmenu-item' + (_amzProdYear==='2026'?' active':'') + '" onclick="_amzProdPickYear(\'2026\',this)">📅 ปี 2569 (2026)</div>';
    html += '</div></div>';
    html += '</div>';
    html += '<span style="font-size:11px;color:#64748b;margin-left:auto">' + periodInfoText + '</span>';
    html += '</div>';

    html += '<div class="card" style="background:linear-gradient(135deg,#ea580c,#fb923c);color:#fff;padding:20px 24px;border-radius:14px;margin-bottom:16px">';
    html += '<div style="font-size:18px;font-weight:800">🍞 ผลงานสินค้า</div>';
    html += '<div style="font-size:13px;opacity:.85;margin-top:4px">' + prods.length + ' รายการ — ยอดขาย: ' + fmt(periodNet) + ' (' + periodLabel + ')</div>';
    html += '<div style="display:flex;gap:16px;margin-top:10px;flex-wrap:wrap;font-size:12px;opacity:.9">';
    html += '<span>Ambient: ' + ambientCount + '</span><span>Chill: ' + chillCount + '</span>';
    html += '<span>A+: ' + rankCounts['A+'] + '</span><span>A: ' + rankCounts['A'] + '</span><span>B: ' + rankCounts['B'] + '</span><span>C: ' + rankCounts['C'] + '</span>';
    html += '</div></div>';

    html += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px" id="amzProdViewTabs">';
    html += '<button class="fmtab' + (_amzProdView==='all'?' active':'') + '" onclick="_amzProdViewSwitch(\'all\',this)">ทั้งหมด (' + prods.length + ')</button>';
    html += '<button class="fmtab' + (_amzProdView==='chill'?' active':'') + '" onclick="_amzProdViewSwitch(\'chill\',this)">❄️ Chill (' + chillCount + ')</button>';
    html += '<button class="fmtab' + (_amzProdView==='ambient'?' active':'') + '" onclick="_amzProdViewSwitch(\'ambient\',this)">☀️ Ambient (' + ambientCount + ')</button>';
    html += '</div>';

    var rankStyle = { 'A+':'background:#dc2626;color:#fff', 'A':'background:#ea580c;color:#fff', 'B':'background:#f59e0b;color:#fff', 'C':'background:#94a3b8;color:#fff' };

    html += '<div class="card" style="padding:0;overflow:hidden"><div style="overflow-x:auto">';
    html += '<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#fff7ed;color:#9a3412">';
    html += '<th style="padding:8px 10px;text-align:left">#</th>';
    html += '<th style="padding:8px 10px;text-align:left">สินค้า</th>';
    html += '<th style="padding:8px 10px;text-align:center">TYPE</th>';
    html += '<th style="padding:8px 10px;text-align:center">RANK</th>';
    html += '<th style="padding:8px 10px;text-align:right">฿/ชิ้น</th>';
    html += '<th style="padding:8px 10px;text-align:right">ยอดขาย (฿)</th>';
    html += '<th style="padding:8px 10px;text-align:right">จำนวน (ชิ้น)</th>';
    html += '<th style="padding:8px 10px;text-align:right">% สัดส่วน</th>';
    html += '<th style="padding:8px 10px;min-width:100px">กราฟ</th>';
    html += '</tr></thead><tbody>';
    var topNet = filtered.length > 0 ? filtered[0].n : 1;
    filtered.forEach(function(d, i) {
      var barW = Math.round((d.n / topNet) * 100);
      var share = totalRev > 0 ? ((d.n / totalRev) * 100).toFixed(1) : '0.0';
      var typeColor = d.type === 'Chill' ? '#0891b2' : '#d97706';
      var typeIcon = d.type === 'Chill' ? '❄️' : '☀️';
      html += '<tr style="border-bottom:1px solid #f1f5f9">';
      html += '<td style="padding:6px 10px;font-weight:700;color:#ea580c">' + (i+1) + '</td>';
      html += '<td style="padding:6px 10px;font-weight:600;max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="' + d.p + '">' + d.p + '</td>';
      html += '<td style="padding:6px 10px;text-align:center"><span style="font-size:10px;padding:2px 6px;border-radius:4px;color:' + typeColor + ';background:' + typeColor + '18;font-weight:700">' + typeIcon + ' ' + d.type + '</span></td>';
      html += '<td style="padding:6px 10px;text-align:center"><span style="font-size:10px;padding:2px 8px;border-radius:4px;font-weight:800;' + rankStyle[d.rank] + '">' + d.rank + '</span></td>';
      html += '<td style="padding:6px 10px;text-align:right;font-weight:600;color:#0891b2">' + d.ppc.toFixed(2) + '</td>';
      html += '<td style="padding:6px 10px;text-align:right;font-weight:700">' + d.n.toLocaleString() + '</td>';
      html += '<td style="padding:6px 10px;text-align:right">' + d.q.toLocaleString() + '</td>';
      html += '<td style="padding:6px 10px;text-align:right;font-weight:600">' + share + '%</td>';
      html += '<td style="padding:6px 10px"><div style="background:#f1f5f9;border-radius:4px;height:12px;overflow:hidden"><div style="width:' + barW + '%;height:100%;background:rgba(234,88,12,.6);border-radius:4px"></div></div></td>';
      html += '</tr>';
    });
    html += '</tbody></table></div></div>';
    el.innerHTML = html;
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

    // Filter months by period
    var allMonths = D.months || [];
    var months = _amzOrderFilterMonths(allMonths);

    // Render period filter bar (dropdown style)
    var periodBar = document.getElementById('amzOrderPeriodBar');
    if (periodBar) {
      var isQtr = ['q1','q2','q3','q4'].indexOf(_amzOrderPeriod) >= 0;
      var isYear = _amzOrderYear !== 'all';
      var periodInfoText = months.length ? 'กำลังแสดง: ' + _amzYmLabel(months[0]) + ' – ' + _amzYmLabel(months[months.length-1]) : '';
      var bh = '<span style="font-size:12px;font-weight:700;color:var(--text2)">📅 ช่วงเวลา:</span>';
      bh += '<div style="display:flex;gap:4px;flex-wrap:wrap" id="amzOrderPeriodBtns">';
      bh += '<div class="period-type-btn' + (_amzOrderPeriod==='all'&&_amzOrderYear==='all'?' active':'') + '" onclick="_amzOrderSetPeriod(\'all\',this)">ทั้งหมด</div>';
      bh += '<div class="period-type-btn' + (_amzOrderPeriod==='thismonth'?' active':'') + '" onclick="_amzOrderSetPeriod(\'thismonth\',this)">เดือนนี้</div>';
      bh += '<div class="period-type-btn' + (_amzOrderPeriod==='lastmonth'?' active':'') + '" onclick="_amzOrderSetPeriod(\'lastmonth\',this)">เดือนที่แล้ว</div>';
      bh += '<div id="amzOrderQtrDropdown" style="position:relative;display:inline-block">';
      bh += '<div class="period-type-btn' + (isQtr?' active':'') + '" onclick="_amzOrderToggleQMenu()" style="padding-right:22px;cursor:pointer"><span id="amzOrderQtrLabel">📆 รายไตรมาส</span><span style="position:absolute;right:7px;top:50%;transform:translateY(-50%);font-size:10px;pointer-events:none">▾</span></div>';
      bh += '<div id="amzOrderQtrMenu" style="display:none;position:absolute;top:calc(100% + 4px);left:0;background:#fff;border:1px solid #e2e8f0;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.1);min-width:190px;z-index:200;padding:4px 0">';
      var _oqKey = _amzOrderPeriod + (_amzOrderYear !== 'all' ? '-' + _amzOrderYear : '');
      [2026,2025,2024].forEach(function(yr, yi) {
        if (yi > 0) bh += '<div style="border-top:1px solid #e2e8f0;margin:4px 0"></div>';
        bh += '<div class="qmenu-item' + (_oqKey==='q1-'+yr?' active':'') + '" onclick="_amzOrderPickQtr(\''+yr+'-Q1\',this)">Q1/'+yr+' ม.ค.–มี.ค.</div>';
        bh += '<div class="qmenu-item' + (_oqKey==='q2-'+yr?' active':'') + '" onclick="_amzOrderPickQtr(\''+yr+'-Q2\',this)">Q2/'+yr+' เม.ย.–มิ.ย.</div>';
        bh += '<div class="qmenu-item' + (_oqKey==='q3-'+yr?' active':'') + '" onclick="_amzOrderPickQtr(\''+yr+'-Q3\',this)">Q3/'+yr+' ก.ค.–ก.ย.</div>';
        bh += '<div class="qmenu-item' + (_oqKey==='q4-'+yr?' active':'') + '" onclick="_amzOrderPickQtr(\''+yr+'-Q4\',this)">Q4/'+yr+' ต.ค.–ธ.ค.</div>';
      });
      bh += '</div></div>';
      bh += '<div id="amzOrderYearDropdown" style="position:relative;display:inline-block">';
      bh += '<div class="period-type-btn' + (isYear?' active':'') + '" onclick="_amzOrderToggleYMenu()" style="padding-right:22px;cursor:pointer"><span id="amzOrderYearLabel">📅 รายปี</span><span style="position:absolute;right:7px;top:50%;transform:translateY(-50%);font-size:10px;pointer-events:none">▾</span></div>';
      bh += '<div id="amzOrderYearMenu" style="display:none;position:absolute;top:calc(100% + 4px);left:0;background:#fff;border:1px solid #e2e8f0;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.1);min-width:150px;z-index:200;padding:4px 0">';
      bh += '<div class="qmenu-item' + (_amzOrderYear==='all'&&!isQtr?' active':'') + '" onclick="_amzOrderPickYear(\'all\',this)">📅 ทั้งหมด</div>';
      bh += '<div class="qmenu-item' + (_amzOrderYear==='2024'?' active':'') + '" onclick="_amzOrderPickYear(\'2024\',this)">📅 ปี 2567 (2024)</div>';
      bh += '<div class="qmenu-item' + (_amzOrderYear==='2025'?' active':'') + '" onclick="_amzOrderPickYear(\'2025\',this)">📅 ปี 2568 (2025)</div>';
      bh += '<div class="qmenu-item' + (_amzOrderYear==='2026'?' active':'') + '" onclick="_amzOrderPickYear(\'2026\',this)">📅 ปี 2569 (2026)</div>';
      bh += '</div></div>';
      bh += '</div>';
      bh += '<span style="font-size:11px;color:#64748b;margin-left:auto">' + periodInfoText + '</span>';
      periodBar.innerHTML = bh;
    }

    // Compute KPI from filtered months
    var filtNet = 0, filtQty = 0, filtBills = 0;
    months.forEach(function(ym) {
      if (chFilter) {
        channels.forEach(function(ch) {
          if (D.monthlyByCh[ch] && D.monthlyByCh[ch][ym]) {
            filtNet += D.monthlyByCh[ch][ym].net;
            filtQty += D.monthlyByCh[ch][ym].qty;
            filtBills += D.monthlyByCh[ch][ym].bills;
          }
        });
      } else {
        if (D.monthlyAll[ym]) {
          filtNet += D.monthlyAll[ym].net;
          filtQty += D.monthlyAll[ym].qty;
          filtBills += D.monthlyAll[ym].bills;
        }
      }
    });
    var avgOrder = filtBills > 0 ? filtNet / filtBills : 0;

    var periodLabel = months.length ? _amzYmLabel(months[0]) + ' – ' + _amzYmLabel(months[months.length-1]) : '-';

    var kpiEl = document.getElementById('amzOrderKPI');
    if (kpiEl) {
      kpiEl.innerHTML =
        '<div class="kpi-card blue"><div class="kpi-label">💰 ยอดขายรวม</div><div class="kpi-value sm">' + fmt(filtNet) + '</div><div class="kpi-sub">' + periodLabel + '</div></div>'
        + '<div class="kpi-card blue"><div class="kpi-label">📋 จำนวนบิล</div><div class="kpi-value sm">' + filtBills.toLocaleString() + '</div><div class="kpi-sub">' + channels.length + ' ช่องทาง</div></div>'
        + '<div class="kpi-card blue"><div class="kpi-label">📦 จำนวนชิ้น</div><div class="kpi-value sm">' + filtQty.toLocaleString() + '</div><div class="kpi-sub">ทั้งหมด</div></div>'
        + '<div class="kpi-card blue"><div class="kpi-label">📊 เฉลี่ย/บิล</div><div class="kpi-value sm">' + fmt(avgOrder) + '</div><div class="kpi-sub">บาท/บิล</div></div>';
    }

    // Monthly bar chart
    var mthLabels = months.map(function(ym) {
      var parts = ym.split('-'); var m = parseInt(parts[1]);
      var thM = ['','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
      return thM[m] + ' ' + (parseInt(parts[0]) + 543 - 2500);
    });
    var mthVals = months.map(function(ym) {
      if (chFilter) {
        var sum = 0;
        channels.forEach(function(ch) { if (D.monthlyByCh[ch] && D.monthlyByCh[ch][ym]) sum += D.monthlyByCh[ch][ym].net; });
        return sum / 1e6;
      }
      return D.monthlyAll[ym] ? D.monthlyAll[ym].net / 1e6 : 0;
    });
    mkChart('amzOrderMonthlyBar', {
      type: 'bar',
      data: { labels: mthLabels, datasets: [{ label: 'Revenue (M฿)', data: mthVals, backgroundColor: 'rgba(234,88,12,.75)', borderRadius: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: function(v) { return v.toFixed(1) + ' M'; } } }, x: { ticks: { maxRotation: 60, font: { size: 9 } } } } }
    });

    // Channel pie — sum from filtered months
    var chData = channels.map(function(ch) {
      if (_amzOrderPeriod === 'all' && D.channels[ch]) return D.channels[ch].net;
      var sum = 0;
      months.forEach(function(ym){ if(D.monthlyByCh[ch] && D.monthlyByCh[ch][ym]) sum += D.monthlyByCh[ch][ym].net; });
      return sum;
    });
    var chColors = channels.map(function(ch) { var i = AMZ_CHANNELS.indexOf(ch); return palette[i >= 0 ? i : 0]; });
    mkChart('amzOrderChPie', {
      type: 'doughnut',
      data: { labels: channels, datasets: [{ data: chData, backgroundColor: chColors, borderWidth: 2 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }
    });

    // Products table
    var prodEl = document.getElementById('amzOrderProdTable');
    if (prodEl) {
      var prods = chFilter ? [] : (D.topProdAll || []);
      if (chFilter) {
        var prodMap = {};
        channels.forEach(function(ch) {
          (D.topProdByCh[ch] || []).forEach(function(d) {
            if (!prodMap[d.p]) prodMap[d.p] = { p: d.p, n: 0, q: 0 };
            prodMap[d.p].n += d.n; prodMap[d.p].q += d.q;
          });
        });
        prods = Object.values(prodMap).sort(function(a,b){ return b.n - a.n; }).slice(0, 20);
      }
      var html = '<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#fff7ed;color:#9a3412"><th style="padding:8px;text-align:left">#</th><th style="padding:8px;text-align:left">สินค้า</th><th style="padding:8px;text-align:right">ยอดขาย (฿)</th><th style="padding:8px;text-align:right">จำนวน</th></tr></thead><tbody>';
      prods.forEach(function(d, i) {
        html += '<tr style="border-bottom:1px solid #f1f5f9"><td style="padding:6px 8px">' + (i+1) + '</td><td style="padding:6px 8px">' + d.p + '</td><td style="padding:6px 8px;text-align:right;font-weight:600">' + d.n.toLocaleString() + '</td><td style="padding:6px 8px;text-align:right">' + d.q.toLocaleString() + '</td></tr>';
      });
      html += '</tbody></table>';
      prodEl.innerHTML = html;
    }

    // Branch/customer table
    var brEl = document.getElementById('amzOrderBranchTable');
    if (brEl) {
      var branches = [];
      channels.forEach(function(ch) {
        (D.topBranchByCh[ch] || []).forEach(function(d) { branches.push({ b: d.b, n: d.n, q: d.q, bi: d.bi, ch: ch }); });
      });
      branches.sort(function(a,b){ return b.n - a.n; });
      branches = branches.slice(0, 20);
      var html = '<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#fff7ed;color:#9a3412"><th style="padding:8px;text-align:left">#</th><th style="padding:8px;text-align:left">สาขา</th><th style="padding:8px;text-align:left">ช่องทาง</th><th style="padding:8px;text-align:right">ยอดขาย (฿)</th><th style="padding:8px;text-align:right">บิล</th></tr></thead><tbody>';
      branches.forEach(function(d, i) {
        html += '<tr style="border-bottom:1px solid #f1f5f9"><td style="padding:6px 8px">' + (i+1) + '</td><td style="padding:6px 8px">' + d.b + '</td><td style="padding:6px 8px">' + d.ch + '</td><td style="padding:6px 8px;text-align:right;font-weight:600">' + d.n.toLocaleString() + '</td><td style="padding:6px 8px;text-align:right">' + d.bi.toLocaleString() + '</td></tr>';
      });
      html += '</tbody></table>';
      brEl.innerHTML = html;
    }
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
      team.sort(function(a, b) { return amzNicks.indexOf(a.nick) - amzNicks.indexOf(b.nick); });
    }
    if (team.length === 0) {
      team = [
        { nick: 'ยู', name: 'ณัฏฐวรรณ ธัญรัตนศรีสกุล', positionTh: 'เซลล์อเมซอน', phone: '', emailCo: '', birthday: '', startDate: '', empId: '', branch: 'BKK 01 (ปทุมธานี)' },
        { nick: 'ซี', name: 'ภาณุวัฒน์ ปานเผือก', positionTh: 'เซลล์อเมซอน', phone: '', emailCo: '', birthday: '', startDate: '', empId: '', branch: 'BKK 02 (นนทบุรี)' },
        { nick: 'กานต์', name: 'วีระ พรมมี', positionTh: 'เซลล์อเมซอน', phone: '', emailCo: '', birthday: '', startDate: '', empId: '', branch: 'BKK 03 (สมุทรปราการ)' }
      ];
    }

    var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px">';
    team.forEach(function (s) {
      var zone = zoneMap[s.nick] || s.branch || '';
      var displayName = s.name.replace(/^(นาย|นางสาว|นาง)/, '');
      var isMale = s.name.indexOf('นาย') === 0;
      var imgPath = 'assets/staff/' + s.empId + '.jpg';

      html += '<div class="card" style="padding:28px 24px;text-align:center">';
      html += '<div style="margin-bottom:14px;display:inline-block;position:relative">';
      html += '<img src="' + imgPath + '" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid #fed7aa;box-shadow:0 4px 12px rgba(234,88,12,0.15)" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">';
      html += '<div style="display:none;width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,#fed7aa,#fdba74);justify-content:center;align-items:center;font-size:36px;border:3px solid #fed7aa;box-shadow:0 4px 12px rgba(234,88,12,0.15)">' + (isMale ? '👨‍💼' : '👩‍💼') + '</div>';
      html += '<label style="position:absolute;bottom:2px;right:2px;width:28px;height:28px;border-radius:50%;background:#ea580c;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.2);border:2px solid #fff" title="อัพโหลดรูป">';
      html += '<input type="file" accept="image/*" style="display:none" onchange="window._amzUploadStaffPhoto(this,\'' + s.empId + '\')">📷</label>';
      html += '</div>';
      html += '<div style="font-size:17px;font-weight:800;color:#1e293b">' + displayName + '</div>';
      html += '<div style="font-size:13px;color:#ea580c;font-weight:700;margin-top:2px">(' + s.nick + ')</div>';
      html += '<div style="font-size:12px;color:#8b5cf6;font-weight:600;margin-top:4px">' + (s.positionTh || 'เจ้าหน้าที่ขาย') + '</div>';
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
    // Period filter bar (dropdown style)
    html += '<div class="filter-bar" id="amzCmpPeriodBar" style="gap:6px;flex-wrap:wrap;margin-bottom:12px;display:flex;align-items:center;padding:8px 12px;background:var(--card);border-radius:10px;border:1px solid var(--border)">';
    html += '<span style="font-size:12px;font-weight:700;color:var(--text2)">📅 ช่วงเวลา:</span>';
    html += '<div style="display:flex;gap:4px;flex-wrap:wrap" id="amzCmpPeriodBtns">';
    html += '<div class="period-type-btn' + (_amzCmpPeriod==='all'&&_amzCmpYear==='all'?' active':'') + '" onclick="_amzCmpSetPeriod(\'all\',this)">ทั้งหมด</div>';
    html += '<div class="period-type-btn' + (_amzCmpPeriod==='thismonth'?' active':'') + '" onclick="_amzCmpSetPeriod(\'thismonth\',this)">เดือนนี้</div>';
    html += '<div class="period-type-btn' + (_amzCmpPeriod==='lastmonth'?' active':'') + '" onclick="_amzCmpSetPeriod(\'lastmonth\',this)">เดือนที่แล้ว</div>';
    html += '<div id="amzCmpQtrDropdown" style="position:relative;display:inline-block">';
    html += '<div class="period-type-btn' + (isQtr?' active':'') + '" onclick="_amzCmpToggleQMenu()" style="padding-right:22px;cursor:pointer"><span id="amzCmpQtrLabel">📆 รายไตรมาส</span><span style="position:absolute;right:7px;top:50%;transform:translateY(-50%);font-size:10px;pointer-events:none">▾</span></div>';
    html += '<div id="amzCmpQtrMenu" style="display:none;position:absolute;top:calc(100% + 4px);left:0;background:#fff;border:1px solid #e2e8f0;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.1);min-width:190px;z-index:200;padding:4px 0">';
    var _cqKey = _amzCmpPeriod + (_amzCmpYear !== 'all' ? '-' + _amzCmpYear : '');
    [2026,2025,2024].forEach(function(yr, yi) {
      if (yi > 0) html += '<div style="border-top:1px solid #e2e8f0;margin:4px 0"></div>';
      html += '<div class="qmenu-item' + (_cqKey==='q1-'+yr?' active':'') + '" onclick="_amzCmpPickQtr(\''+yr+'-Q1\',this)">Q1/'+yr+' ม.ค.–มี.ค.</div>';
      html += '<div class="qmenu-item' + (_cqKey==='q2-'+yr?' active':'') + '" onclick="_amzCmpPickQtr(\''+yr+'-Q2\',this)">Q2/'+yr+' เม.ย.–มิ.ย.</div>';
      html += '<div class="qmenu-item' + (_cqKey==='q3-'+yr?' active':'') + '" onclick="_amzCmpPickQtr(\''+yr+'-Q3\',this)">Q3/'+yr+' ก.ค.–ก.ย.</div>';
      html += '<div class="qmenu-item' + (_cqKey==='q4-'+yr?' active':'') + '" onclick="_amzCmpPickQtr(\''+yr+'-Q4\',this)">Q4/'+yr+' ต.ค.–ธ.ค.</div>';
    });
    html += '</div></div>';
    html += '<div id="amzCmpYearDropdown" style="position:relative;display:inline-block">';
    html += '<div class="period-type-btn' + (isCmpYear?' active':'') + '" onclick="_amzCmpToggleYMenu()" style="padding-right:22px;cursor:pointer"><span id="amzCmpYearLabel">📅 รายปี</span><span style="position:absolute;right:7px;top:50%;transform:translateY(-50%);font-size:10px;pointer-events:none">▾</span></div>';
    html += '<div id="amzCmpYearMenu" style="display:none;position:absolute;top:calc(100% + 4px);left:0;background:#fff;border:1px solid #e2e8f0;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.1);min-width:150px;z-index:200;padding:4px 0">';
    html += '<div class="qmenu-item' + (_amzCmpYear==='all'&&!isQtr?' active':'') + '" onclick="_amzCmpPickYear(\'all\',this)">📅 ทั้งหมด</div>';
    html += '<div class="qmenu-item' + (_amzCmpYear==='2024'?' active':'') + '" onclick="_amzCmpPickYear(\'2024\',this)">📅 ปี 2567 (2024)</div>';
    html += '<div class="qmenu-item' + (_amzCmpYear==='2025'?' active':'') + '" onclick="_amzCmpPickYear(\'2025\',this)">📅 ปี 2568 (2025)</div>';
    html += '<div class="qmenu-item' + (_amzCmpYear==='2026'?' active':'') + '" onclick="_amzCmpPickYear(\'2026\',this)">📅 ปี 2569 (2026)</div>';
    html += '</div></div>';
    html += '</div>';
    html += '<span style="font-size:11px;color:#64748b;margin-left:auto">' + periodInfoText + '</span>';
    html += '</div>';

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
