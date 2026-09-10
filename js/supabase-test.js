/* ============================================================
   Supabase Test Dashboard — ดึงข้อมูลจาก API แสดงผลทดสอบ
   ============================================================ */
var SUPA = {
  URL: 'https://gdjwsxeptloppefuiwum.supabase.co/rest/v1',
  KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkandzeGVwdGxvcHBlZnVpd3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NDk5NTcsImV4cCI6MjEwMTEyNTk1N30.vZaVm-aHbWvChHuizuzJvbSDW-x7FMo_nMImq412r2s'
};

var _supaState = {
  preset: 'all',
  startDate: '',
  endDate: '',
  loading: false,
  cache: {},
  charts: {},
  loadId: 0
};

function _supaHeaders() {
  return { 'apikey': SUPA.KEY, 'Authorization': 'Bearer ' + SUPA.KEY, 'Content-Type': 'application/json' };
}

function _supaFetch(table, params, limit) {
  limit = limit || 1000;
  var baseUrl = SUPA.URL + '/' + table + '?' + params;
  var cacheKey = baseUrl;
  if (_supaState.cache[cacheKey]) return Promise.resolve(_supaState.cache[cacheKey]);

  var allRows = [];
  function fetchPage(offset) {
    var sep = params ? '&' : '';
    var url = SUPA.URL + '/' + table + '?' + params + sep + 'limit=' + limit + '&offset=' + offset;
    return fetch(url, { headers: _supaHeaders() })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        allRows = allRows.concat(data);
        if (data.length >= limit) return fetchPage(offset + limit);
        _supaState.cache[cacheKey] = allRows;
        return allRows;
      });
  }
  return fetchPage(0);
}

function _supaFmtBaht(v) {
  if (v >= 1e6) return (v / 1e6).toFixed(2) + ' M';
  if (v >= 1e3) return (v / 1e3).toFixed(1) + ' K';
  return v.toFixed(0);
}

function _supaFmtNum(v) {
  return v.toLocaleString('th-TH', { maximumFractionDigits: 0 });
}

function _supaFmtDate(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

var _SUPA_MTH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

function supaTestInit() {
  supaPreset('all');
}

function _supaCalcPresetRange(key) {
  var today = new Date();
  var y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
  var dow = today.getDay();
  var start, end;

  switch (key) {
    case 'today':
      start = end = _supaFmtDate(today);
      break;
    case 'yesterday':
      var yd = new Date(y, m, d - 1);
      start = end = _supaFmtDate(yd);
      break;
    case 'thisWeek':
      var mon = new Date(y, m, d - ((dow + 6) % 7));
      start = _supaFmtDate(mon);
      end = _supaFmtDate(today);
      break;
    case 'lastWeek':
      var lmon = new Date(y, m, d - ((dow + 6) % 7) - 7);
      var lsun = new Date(lmon.getFullYear(), lmon.getMonth(), lmon.getDate() + 6);
      start = _supaFmtDate(lmon);
      end = _supaFmtDate(lsun);
      break;
    case 'thisMonth':
      start = y + '-' + String(m + 1).padStart(2, '0') + '-01';
      end = _supaFmtDate(today);
      break;
    case 'lastMonth':
      var lm = m === 0 ? 11 : m - 1;
      var ly = m === 0 ? y - 1 : y;
      start = ly + '-' + String(lm + 1).padStart(2, '0') + '-01';
      var lastDay = new Date(ly, lm + 1, 0).getDate();
      end = ly + '-' + String(lm + 1).padStart(2, '0') + '-' + String(lastDay).padStart(2, '0');
      break;
    case '3months':
      var sm = m - 2;
      var sy = y;
      if (sm < 0) { sm += 12; sy--; }
      start = sy + '-' + String(sm + 1).padStart(2, '0') + '-01';
      end = _supaFmtDate(today);
      break;
    case 'all':
    default:
      start = '2022-01-01';
      end = _supaFmtDate(today);
      break;
  }
  return { startDate: start, endDate: end };
}

function supaPreset(key) {
  _supaState.preset = key;
  var btns = document.querySelectorAll('.supa-p-btn');
  btns.forEach(function(b) {
    if (b.getAttribute('data-p') === key) {
      b.style.background = '#ea580c'; b.style.color = '#fff';
    } else {
      b.style.background = '#fff'; b.style.color = '#64748b';
    }
  });

  if (key === 'custom') return;

  var range = _supaCalcPresetRange(key);
  _supaState.startDate = range.startDate;
  _supaState.endDate = range.endDate;
  document.getElementById('supaDateFrom').value = range.startDate;
  document.getElementById('supaDateTo').value = range.endDate;
  _supaUpdateRangeLabel();
  _supaState.cache = {};
  _supaLoadAll();
}

function supaApplyCustom() {
  var from = document.getElementById('supaDateFrom').value;
  var to = document.getElementById('supaDateTo').value;
  if (!from || !to) return;
  if (from > to) { var tmp = from; from = to; to = tmp; document.getElementById('supaDateFrom').value = from; document.getElementById('supaDateTo').value = to; }
  _supaState.preset = 'custom';
  _supaState.startDate = from;
  _supaState.endDate = to;
  var btns = document.querySelectorAll('.supa-p-btn');
  btns.forEach(function(b) {
    b.style.background = b.getAttribute('data-p') === 'custom' ? '#ea580c' : '#fff';
    b.style.color = b.getAttribute('data-p') === 'custom' ? '#fff' : '#64748b';
  });
  _supaUpdateRangeLabel();
  _supaState.cache = {};
  _supaLoadAll();
}

function supaApplyPeriod() {
  _supaLoadAll();
}

function _supaUpdateRangeLabel() {
  var el = document.getElementById('supaRangeLabel');
  if (el) el.textContent = _supaState.startDate + ' ~ ' + _supaState.endDate;
}

function _supaShowLoading(show) {
  var el = document.getElementById('supaLoading');
  if (el) el.style.display = show ? '' : 'none';
}

function _supaShowError(msg) {
  var el = document.getElementById('supaError');
  if (!el) return;
  if (msg) { el.textContent = msg; el.style.display = ''; }
  else el.style.display = 'none';
}

function _supaShowFresh(text) {
  var el = document.getElementById('supaFreshness');
  if (el) el.textContent = text;
}

function _supaGetFilters() {
  var chSel = document.getElementById('supaChannelSel');
  var src = document.getElementById('supaSourceSel');
  var rawVal = chSel ? chSel.value : '';
  var channel = '', subChannel = '';
  if (rawVal) {
    var parts = rawVal.split(':');
    channel = parts[0];
    subChannel = parts.length > 1 ? parts.slice(1).join(':') : '';
  }
  return {
    channel: channel,
    subChannel: subChannel,
    source: src ? src.value : ''
  };
}

var _SUPA_CH_ALIAS = { 'Amazon': ['Amazon', 'Telesale'] };
var _SUPA_CAT_ALIAS = { 'CJ': ['CJ', 'ซีเจ'], 'Black Canyon': ['Black Canyon', 'black canyon'],
  'ลำพยา 3 (เก่า)': ['ลำพยา 3 (เก่า)', 'ลำยา3เก่า'], 'ร้านใหม่ (ปตท.คุณาวรรณ)': ['ร้านใหม่ (ปตท.คุณาวรรณ)', 'ปตทคุณาวรรณ'],
  'หน้ามอ (ม.เกษตร)': ['หน้ามอ (ม.เกษตร)', 'หน้ามอ'] };

function _supaFilterRows(data) {
  var f = _supaGetFilters();
  if (!f.channel && !f.subChannel && !f.source) return data;
  var chList = _SUPA_CH_ALIAS[f.channel] || (f.channel ? [f.channel] : null);
  var catList = _SUPA_CAT_ALIAS[f.subChannel] || (f.subChannel ? [f.subChannel] : null);
  return data.filter(function(r) {
    if (chList && chList.indexOf(r.channel) < 0) return false;
    if (catList && catList.indexOf(r.customer_category) < 0) return false;
    if (f.source && r.source !== f.source) return false;
    return true;
  });
}

function _supaGetStartMonth() {
  return _supaState.startDate.substring(0, 7);
}
function _supaGetEndMonth() {
  return _supaState.endDate.substring(0, 7);
}

function _supaIsSingleDay() {
  return _supaState.startDate === _supaState.endDate;
}

function _supaDaySpan() {
  var s = new Date(_supaState.startDate);
  var e = new Date(_supaState.endDate);
  return Math.round((e - s) / 86400000) + 1;
}

function _supaLoadAll() {
  if (!_supaState.startDate || !_supaState.endDate) return;

  _supaShowLoading(true);
  _supaShowError('');
  var myLoadId = ++_supaState.loadId;

  var sd = _supaState.startDate;
  var ed = _supaState.endDate;
  var sm = _supaGetStartMonth();
  var em = _supaGetEndMonth();

  Promise.all([
    _supaFetch('sales_daily', 'select=date,channel,source,customer_category,revenue,qty,n_transactions&date=gte.' + sd + '&date=lte.' + ed + '&order=date'),
    _supaFetch('product_monthly', 'select=year_month,product_code,product_name,channel,source,revenue,qty&year_month=gte.' + sm + '&year_month=lte.' + em + '&order=revenue.desc'),
    _supaFetch('location_monthly', 'select=year_month,area,province,branch_code,branch_name,revenue,qty&year_month=gte.' + sm + '&year_month=lte.' + em + '&order=revenue.desc'),
    fetch(SUPA.URL + '/sales_daily?select=date,updated_at&order=updated_at.desc&limit=1', { headers: _supaHeaders() }).then(function(r) { return r.json(); })
  ]).then(function(results) {
    if (myLoadId !== _supaState.loadId) return;
    _supaShowLoading(false);
    var daily = _supaFilterRows(results[0]);
    var products = _supaFilterRows(results[1]);
    var locations = results[2];
    var freshness = results[3];

    var f = _supaGetFilters();
    var freshText = '';
    if (freshness.length > 0) {
      var dt = new Date(freshness[0].updated_at);
      freshText = 'อัปเดตล่าสุด: ' + dt.toLocaleString('th-TH') + ' | ข้อมูลถึง: ' + freshness[0].date;
    }
    if (f.channel) freshText += ' | Channel: ' + f.channel;
    if (f.subChannel) freshText += ' | สาขา: ' + f.subChannel;
    if (f.source) freshText += ' | Source: ' + f.source;
    _supaShowFresh(freshText);

    _supaRenderKPI(daily);
    _supaRenderMonthlyChart(daily);
    _supaRenderChannelChart(daily);
    _supaRenderDailyChart(daily);
    _supaRenderTopProducts(products);
    _supaRenderAreaChart(locations);
    _supaRenderDataTable(daily);
  }).catch(function(err) {
    _supaShowLoading(false);
    _supaShowError('ไม่สามารถเชื่อมต่อ Supabase: ' + err.message);
  });
}

function _supaRenderKPI(data) {
  var totalRev = 0, totalQty = 0, totalTx = 0;
  var months = new Set();
  var days = new Set();
  data.forEach(function(r) {
    totalRev += r.revenue || 0;
    totalQty += r.qty || 0;
    totalTx += r.n_transactions || 0;
    months.add(r.date.substring(0, 7));
    days.add(r.date);
  });
  var nMonths = months.size;
  var nDays = days.size;
  var avgLabel, avgVal;
  if (_supaIsSingleDay()) {
    avgLabel = '1 วัน';
    avgVal = totalRev;
  } else if (nDays <= 14) {
    avgLabel = nDays + ' วัน';
    avgVal = nDays > 0 ? totalRev / nDays : 0;
  } else {
    avgLabel = nMonths + ' เดือน';
    avgVal = nMonths > 0 ? totalRev / nMonths : 0;
  }

  document.getElementById('supaKpiRevenue').textContent = _supaFmtBaht(totalRev);
  document.getElementById('supaKpiQty').textContent = _supaFmtNum(totalQty);
  document.getElementById('supaKpiTx').textContent = _supaFmtNum(totalTx);
  document.getElementById('supaKpiAvg').textContent = _supaFmtBaht(avgVal);
  document.getElementById('supaKpiMonths').textContent = avgLabel;
}

function _supaDestroyChart(key) {
  if (_supaState.charts[key]) { _supaState.charts[key].destroy(); _supaState.charts[key] = null; }
}

function _supaRenderMonthlyChart(data) {
  var span = _supaDaySpan();

  if (span <= 1) {
    var channels = {};
    data.forEach(function(r) {
      var ch = r.channel || 'Other';
      channels[ch] = (channels[ch] || 0) + (r.revenue || 0);
    });
    var sorted = Object.entries(channels).sort(function(a, b) { return b[1] - a[1]; });
    _supaDestroyChart('monthly');
    var ctx = document.getElementById('supaMonthlyChart');
    if (!ctx) return;
    _supaState.charts.monthly = new Chart(ctx, {
      type: 'bar',
      data: { labels: sorted.map(function(e) { return e[0]; }), datasets: [{ label: 'Revenue (฿)', data: sorted.map(function(e) { return e[1]; }), backgroundColor: '#f97316', borderRadius: 6 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, title: { display: true, text: 'Revenue ตาม Channel', font: { size: 13 } } },
        scales: { y: { ticks: { callback: function(v) { return _supaFmtBaht(v); } }, grid: { color: 'rgba(0,0,0,.06)' } }, x: { grid: { display: false } } }
      }
    });
    return;
  }

  if (span <= 31) {
    var daily = {};
    data.forEach(function(r) {
      var day = r.date.substring(5);
      daily[day] = (daily[day] || 0) + (r.revenue || 0);
    });
    var sortedD = Object.entries(daily).sort(function(a, b) { return a[0].localeCompare(b[0]); });
    _supaDestroyChart('monthly');
    var ctx = document.getElementById('supaMonthlyChart');
    if (!ctx) return;
    _supaState.charts.monthly = new Chart(ctx, {
      type: 'bar',
      data: { labels: sortedD.map(function(e) { return e[0]; }), datasets: [{ label: 'Revenue (฿)', data: sortedD.map(function(e) { return e[1]; }), backgroundColor: '#f97316', borderRadius: 4 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, title: { display: true, text: 'Revenue รายวัน', font: { size: 13 } } },
        scales: { y: { ticks: { callback: function(v) { return _supaFmtBaht(v); } }, grid: { color: 'rgba(0,0,0,.06)' } }, x: { grid: { display: false } } }
      }
    });
    return;
  }

  var monthly = {};
  data.forEach(function(r) {
    var m = parseInt(r.date.substring(5, 7));
    var ym = r.date.substring(0, 7);
    if (!monthly[ym]) monthly[ym] = { m: m, rev: 0 };
    monthly[ym].rev += r.revenue || 0;
  });
  var sortedM = Object.entries(monthly).sort(function(a, b) { return a[0].localeCompare(b[0]); });
  var labels = sortedM.map(function(e) { return _SUPA_MTH[e[1].m - 1]; });
  var vals = sortedM.map(function(e) { return e[1].rev; });

  _supaDestroyChart('monthly');
  var ctx = document.getElementById('supaMonthlyChart');
  if (!ctx) return;
  _supaState.charts.monthly = new Chart(ctx, {
    type: 'bar',
    data: { labels: labels, datasets: [{ label: 'Revenue (฿)', data: vals, backgroundColor: '#f97316', borderRadius: 6 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { ticks: { callback: function(v) { return _supaFmtBaht(v); } }, grid: { color: 'rgba(0,0,0,.06)' } }, x: { grid: { display: false } } }
    }
  });
}

function _supaRenderChannelChart(data) {
  var channels = {};
  data.forEach(function(r) {
    var ch = r.channel || 'Other';
    if (!channels[ch]) channels[ch] = 0;
    channels[ch] += r.revenue || 0;
  });

  var sorted = Object.entries(channels).sort(function(a, b) { return b[1] - a[1]; });
  var labels = sorted.map(function(e) { return e[0]; });
  var vals = sorted.map(function(e) { return e[1]; });
  var colors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#6b7280'];

  _supaDestroyChart('channel');
  var ctx = document.getElementById('supaChannelChart');
  if (!ctx) return;
  _supaState.charts.channel = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: labels, datasets: [{ data: vals, backgroundColor: colors.slice(0, labels.length) }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { font: { size: 12 }, padding: 12 } },
        tooltip: { callbacks: { label: function(c) { return c.label + ': ฿' + _supaFmtBaht(c.raw); } } }
      }
    }
  });
}

function _supaRenderDailyChart(data) {
  var span = _supaDaySpan();

  if (span <= 1) {
    var sources = {};
    data.forEach(function(r) {
      var src = r.source || 'other';
      sources[src] = (sources[src] || 0) + (r.revenue || 0);
    });
    var sorted = Object.entries(sources).sort(function(a, b) { return b[1] - a[1]; });
    _supaDestroyChart('daily');
    var ctx = document.getElementById('supaDailyChart');
    if (!ctx) return;
    _supaState.charts.daily = new Chart(ctx, {
      type: 'bar',
      data: { labels: sorted.map(function(e) { return e[0]; }), datasets: [{ label: 'Revenue', data: sorted.map(function(e) { return e[1]; }), backgroundColor: '#3b82f6', borderRadius: 4 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, title: { display: true, text: 'Revenue ตาม Source', font: { size: 13 } } },
        scales: { y: { ticks: { callback: function(v) { return _supaFmtBaht(v); } }, grid: { color: 'rgba(0,0,0,.06)' } }, x: { grid: { display: false } } }
      }
    });
    return;
  }

  var daily = {};
  data.forEach(function(r) {
    if (!daily[r.date]) daily[r.date] = 0;
    daily[r.date] += r.revenue || 0;
  });

  var sorted = Object.entries(daily).sort(function(a, b) { return a[0].localeCompare(b[0]); });
  if (span > 90) {
    sorted = sorted.slice(-30);
  }
  var labels = sorted.map(function(e) { return e[0].substring(5); });
  var vals = sorted.map(function(e) { return e[1]; });

  _supaDestroyChart('daily');
  var ctx = document.getElementById('supaDailyChart');
  if (!ctx) return;
  _supaState.charts.daily = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Revenue รายวัน',
        data: vals,
        borderColor: '#f97316',
        backgroundColor: 'rgba(249,115,22,0.1)',
        fill: true, tension: 0.3, pointRadius: 2, pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { callback: function(v) { return _supaFmtBaht(v); } }, grid: { color: 'rgba(0,0,0,.06)' } },
        x: { grid: { display: false }, ticks: { maxTicksLimit: 15 } }
      }
    }
  });
}

function _supaRenderTopProducts(data) {
  var products = {};
  data.forEach(function(r) {
    var key = r.product_name || r.product_code;
    if (!products[key]) products[key] = { name: key, revenue: 0, qty: 0 };
    products[key].revenue += r.revenue || 0;
    products[key].qty += r.qty || 0;
  });

  var sorted = Object.values(products).sort(function(a, b) { return b.revenue - a.revenue; }).slice(0, 15);
  var labels = sorted.map(function(p) { return p.name.length > 25 ? p.name.substring(0, 23) + '…' : p.name; });
  var vals = sorted.map(function(p) { return p.revenue; });

  _supaDestroyChart('products');
  var ctx = document.getElementById('supaProductChart');
  if (!ctx) return;
  _supaState.charts.products = new Chart(ctx, {
    type: 'bar',
    data: { labels: labels, datasets: [{ label: 'Revenue', data: vals, backgroundColor: '#3b82f6', borderRadius: 4 }] },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { callback: function(v) { return _supaFmtBaht(v); } }, grid: { color: 'rgba(0,0,0,.06)' } },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });
}

function _supaRenderAreaChart(data) {
  var areas = {};
  data.forEach(function(r) {
    var a = r.area || 'ไม่ระบุ';
    if (!areas[a]) areas[a] = 0;
    areas[a] += r.revenue || 0;
  });

  var sorted = Object.entries(areas).sort(function(a, b) { return b[1] - a[1]; });
  var labels = sorted.map(function(e) { return e[0]; });
  var vals = sorted.map(function(e) { return e[1]; });
  var colors = ['#f97316','#3b82f6','#10b981','#8b5cf6','#ef4444','#f59e0b','#06b6d4','#ec4899','#84cc16','#6366f1','#14b8a6','#f43f5e'];

  _supaDestroyChart('area');
  var ctx = document.getElementById('supaAreaChart');
  if (!ctx) return;
  _supaState.charts.area = new Chart(ctx, {
    type: 'bar',
    data: { labels: labels, datasets: [{ label: 'Revenue', data: vals, backgroundColor: colors.slice(0, labels.length), borderRadius: 4 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { callback: function(v) { return _supaFmtBaht(v); } }, grid: { color: 'rgba(0,0,0,.06)' } },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } }
      }
    }
  });
}

function _supaRenderDataTable(data) {
  var singleDay = _supaIsSingleDay();
  var grouped = {};

  if (singleDay) {
    data.forEach(function(r) {
      var ch = r.channel || 'Other';
      if (!grouped[ch]) grouped[ch] = { label: _supaState.startDate, channel: ch, revenue: 0, qty: 0, tx: 0 };
      grouped[ch].revenue += r.revenue || 0;
      grouped[ch].qty += r.qty || 0;
      grouped[ch].tx += r.n_transactions || 0;
    });
  } else {
    data.forEach(function(r) {
      var m = r.date.substring(0, 7);
      var ch = r.channel || 'Other';
      var key = m + '|' + ch;
      if (!grouped[key]) {
        var mIdx = parseInt(m.substring(5, 7)) - 1;
        var yr = parseInt(m.substring(0, 4)) + 543;
        grouped[key] = { label: _SUPA_MTH[mIdx] + ' ' + yr, channel: ch, revenue: 0, qty: 0, tx: 0, sortKey: m };
      }
      grouped[key].revenue += r.revenue || 0;
      grouped[key].qty += r.qty || 0;
      grouped[key].tx += r.n_transactions || 0;
    });
  }

  var sorted = Object.values(grouped).sort(function(a, b) {
    if (a.sortKey && b.sortKey) return a.sortKey === b.sortKey ? b.revenue - a.revenue : a.sortKey.localeCompare(b.sortKey);
    return b.revenue - a.revenue;
  });

  var tbody = document.getElementById('supaDataTbody');
  if (!tbody) return;
  var html = '';
  sorted.forEach(function(r) {
    html += '<tr>';
    html += '<td>' + r.label + '</td>';
    html += '<td>' + r.channel + '</td>';
    html += '<td class="td-right">฿' + _supaFmtNum(Math.round(r.revenue)) + '</td>';
    html += '<td class="td-right">' + _supaFmtNum(Math.round(r.qty)) + '</td>';
    html += '<td class="td-right">' + _supaFmtNum(r.tx) + '</td>';
    html += '</tr>';
  });
  tbody.innerHTML = html;
}

function supaRefresh() {
  _supaState.cache = {};
  _supaLoadAll();
}
