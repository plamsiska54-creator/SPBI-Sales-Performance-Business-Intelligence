/* ============================================================
   Amazon API Dashboard — ดึงข้อมูลจาก sales_daily_amazon
   ============================================================ */
var _AMZ_API = { loading: false, cache: {}, currentMonth: '' };

function _amzApiLoad(yearMonth) {
  if (_AMZ_API.loading) return;
  if (!yearMonth) {
    var now = new Date();
    yearMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  }
  _AMZ_API.currentMonth = yearMonth;

  var parts = yearMonth.split('-');
  var y = parseInt(parts[0]), m = parseInt(parts[1]);
  var sd = yearMonth + '-01';
  var ed = yearMonth + '-' + new Date(y, m, 0).getDate();

  var el = document.getElementById('amzApiContent');
  if (!el) return;

  if (_AMZ_API.cache[yearMonth]) {
    _amzApiRender(_AMZ_API.cache[yearMonth], yearMonth);
    return;
  }

  _AMZ_API.loading = true;
  var statusEl = document.getElementById('amzApiStatus');
  if (statusEl) statusEl.innerHTML = '<span style="color:var(--accent)">⏳ กำลังโหลดข้อมูล ' + _thaiMonth(m) + '...</span>';

  _supaFetch('sales_daily',
    'select=date,customer_category,branch_code,qty,revenue&channel=in.(Amazon,Telesale)&date=gte.' + sd + '&date=lte.' + ed + '&order=date'
  ).then(function(rows) {
    _AMZ_API.cache[yearMonth] = rows;
    _AMZ_API.loading = false;
    _amzApiRender(rows, yearMonth);
  }).catch(function(err) {
    _AMZ_API.loading = false;
    if (statusEl) statusEl.innerHTML = '<span style="color:#dc2626">❌ โหลดไม่สำเร็จ: ' + err.message + '</span>';
  });
}

function _amzApiLoadYTD() {
  var statusEl = document.getElementById('amzApiStatus');
  if (statusEl) statusEl.innerHTML = '<span style="color:var(--accent)">⏳ กำลังโหลดข้อมูลทั้งปี...</span>';
  _AMZ_API.loading = true;

  _supaFetch('sales_daily',
    'select=date,customer_category,branch_code,qty,revenue&channel=in.(Amazon,Telesale)&date=gte.' + new Date().getFullYear() + '-01-01&order=date'
  ).then(function(rows) {
    _AMZ_API.cache['ytd'] = rows;
    _AMZ_API.loading = false;
    _amzApiRender(rows, 'ytd');
  }).catch(function(err) {
    _AMZ_API.loading = false;
    if (statusEl) statusEl.innerHTML = '<span style="color:#dc2626">❌ โหลดไม่สำเร็จ</span>';
  });
}

function _thaiMonth(m) {
  return ['','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'][m] || '';
}

function _amzApiRender(rows, period) {
  var statusEl = document.getElementById('amzApiStatus');
  if (statusEl) statusEl.innerHTML = '<span style="color:#16a34a">✅ โหลดแล้ว ' + rows.length.toLocaleString() + ' รายการ</span>';

  var totalRev = 0, totalQty = 0, totalTx = rows.length;
  var branches = {}, products = {}, cats = {}, daily = {}, monthly = {};

  rows.forEach(function(r) {
    var rev = Number(r.revenue) || 0;
    var qty = Number(r.qty) || 0;
    totalRev += rev;
    totalQty += qty;

    var bc = r.branch_code || '-';
    if (!branches[bc]) branches[bc] = { rev: 0, qty: 0, n: 0 };
    branches[bc].rev += rev;
    branches[bc].qty += qty;
    branches[bc].n++;

    var pk = (r.product_code || '') + '|' + (r.product_name || '-');
    if (!products[pk]) products[pk] = { code: r.product_code, name: r.product_name || '-', rev: 0, qty: 0, n: 0 };
    products[pk].rev += rev;
    products[pk].qty += qty;
    products[pk].n++;

    var cat = r.customer_category || '-';
    if (!cats[cat]) cats[cat] = { rev: 0, qty: 0, n: 0 };
    cats[cat].rev += rev;
    cats[cat].qty += qty;
    cats[cat].n++;

    var day = r.date || '';
    if (!daily[day]) daily[day] = 0;
    daily[day] += rev;

    var mo = day.substring(0, 7);
    if (!monthly[mo]) monthly[mo] = 0;
    monthly[mo] += rev;
  });

  var nBranch = Object.keys(branches).length;
  var nProduct = Object.keys(products).length;

  // KPI Cards
  document.getElementById('amzApiKpi').innerHTML =
    _kpiCard('💰', 'รายได้รวม', _fmtM(totalRev), 'บาท') +
    _kpiCard('📦', 'จำนวนชิ้น', totalQty.toLocaleString(), 'ชิ้น') +
    _kpiCard('🏪', 'สาขา', nBranch.toLocaleString(), 'สาขา') +
    _kpiCard('🧁', 'สินค้า', nProduct.toLocaleString(), 'รายการ') +
    _kpiCard('🧾', 'รายการขาย', totalTx.toLocaleString(), 'rows');

  // Category breakdown
  var catKeys = Object.keys(cats).sort(function(a, b) { return cats[b].rev - cats[a].rev; });
  var catHtml = '<div class="card-title">📊 แยกตามกลุ่มลูกค้า</div><table class="api-tbl"><thead><tr><th>กลุ่ม</th><th style="text-align:right">รายได้</th><th style="text-align:right">สัดส่วน</th><th style="text-align:right">จำนวนชิ้น</th></tr></thead><tbody>';
  catKeys.forEach(function(k) {
    var pct = totalRev > 0 ? (cats[k].rev / totalRev * 100).toFixed(1) : '0';
    catHtml += '<tr><td><strong>' + k + '</strong></td><td style="text-align:right">' + _fmtM(cats[k].rev) + '</td><td style="text-align:right">' + pct + '%</td><td style="text-align:right">' + cats[k].qty.toLocaleString() + '</td></tr>';
  });
  catHtml += '</tbody></table>';
  document.getElementById('amzApiCats').innerHTML = catHtml;

  // Daily chart
  _amzApiDailyChart(daily, period);

  // Monthly chart (only for YTD)
  var moEl = document.getElementById('amzApiMonthlyChart');
  if (period === 'ytd') {
    moEl.style.display = '';
    _amzApiMonthlyChart(monthly);
  } else {
    moEl.style.display = 'none';
  }

  // Top products
  var prodArr = Object.values(products).sort(function(a, b) { return b.rev - a.rev; });
  var prodHtml = '<div class="card-title">🧁 Top 20 สินค้าขายดี</div><table class="api-tbl"><thead><tr><th>#</th><th>รหัส</th><th>ชื่อสินค้า</th><th style="text-align:right">รายได้</th><th style="text-align:right">จำนวน</th><th style="text-align:right">รายการ</th></tr></thead><tbody>';
  prodArr.slice(0, 20).forEach(function(p, i) {
    prodHtml += '<tr><td>' + (i + 1) + '</td><td><code>' + (p.code || '-') + '</code></td><td>' + p.name + '</td><td style="text-align:right">' + _fmtM(p.rev) + '</td><td style="text-align:right">' + p.qty.toLocaleString() + '</td><td style="text-align:right">' + p.n.toLocaleString() + '</td></tr>';
  });
  prodHtml += '</tbody></table>';
  document.getElementById('amzApiProducts').innerHTML = prodHtml;

  // Top branches
  var brArr = Object.keys(branches).map(function(k) { return { code: k, rev: branches[k].rev, qty: branches[k].qty, n: branches[k].n }; }).sort(function(a, b) { return b.rev - a.rev; });
  var brHtml = '<div class="card-title">🏪 Top 20 สาขาขายดี</div><table class="api-tbl"><thead><tr><th>#</th><th>รหัสสาขา</th><th style="text-align:right">รายได้</th><th style="text-align:right">จำนวน</th><th style="text-align:right">รายการ</th></tr></thead><tbody>';
  brArr.slice(0, 20).forEach(function(b, i) {
    brHtml += '<tr><td>' + (i + 1) + '</td><td><code>' + b.code + '</code></td><td style="text-align:right">' + _fmtM(b.rev) + '</td><td style="text-align:right">' + b.qty.toLocaleString() + '</td><td style="text-align:right">' + b.n.toLocaleString() + '</td></tr>';
  });
  brHtml += '</tbody></table>';
  document.getElementById('amzApiBranches').innerHTML = brHtml;
}

function _kpiCard(icon, label, value, unit) {
  return '<div class="api-kpi-card"><div class="api-kpi-icon">' + icon + '</div><div class="api-kpi-val">' + value + '</div><div class="api-kpi-label">' + label + '</div></div>';
}

function _fmtM(v) {
  if (v >= 1e6) return (v / 1e6).toFixed(2) + ' M';
  if (v >= 1e3) return (v / 1e3).toFixed(1) + ' K';
  return Math.round(v).toLocaleString();
}

function _amzApiDailyChart(daily, period) {
  var canvas = document.getElementById('amzApiDailyCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = canvas.parentElement.offsetWidth - 20;
  canvas.width = W; canvas.height = 260;
  ctx.clearRect(0, 0, W, 260);

  var days = Object.keys(daily).sort();
  if (!days.length) return;
  var vals = days.map(function(d) { return daily[d]; });
  var maxV = Math.max.apply(null, vals) || 1;

  var pad = { l: 65, r: 15, t: 10, b: 40 };
  var cw = W - pad.l - pad.r, ch = 260 - pad.t - pad.b;
  var bw = Math.max(2, Math.floor(cw / days.length) - 2);

  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  var barColor = isDark ? '#f97316' : '#ea580c';
  var textColor = isDark ? '#a0a0a0' : '#666';
  var gridColor = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)';

  // Grid
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (var g = 0; g <= 4; g++) {
    var gy = pad.t + ch - (ch * g / 4);
    ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(W - pad.r, gy); ctx.stroke();
    ctx.fillStyle = textColor; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(_fmtM(maxV * g / 4), pad.l - 6, gy + 3);
  }

  // Bars
  days.forEach(function(d, i) {
    var x = pad.l + (cw / days.length) * i + 1;
    var h = (vals[i] / maxV) * ch;
    ctx.fillStyle = barColor;
    ctx.fillRect(x, pad.t + ch - h, bw, h);

    if (days.length <= 31) {
      ctx.fillStyle = textColor; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
      var label = d.substring(8);
      ctx.fillText(label, x + bw / 2, 260 - pad.b + 14);
    }
  });

  // Title
  ctx.fillStyle = textColor; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('รายได้รายวัน', W / 2, 260 - 4);
}

function _amzApiMonthlyChart(monthly) {
  var canvas = document.getElementById('amzApiMonthlyCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = canvas.parentElement.offsetWidth - 20;
  canvas.width = W; canvas.height = 260;
  ctx.clearRect(0, 0, W, 260);

  var months = Object.keys(monthly).sort();
  if (!months.length) return;
  var vals = months.map(function(m) { return monthly[m]; });
  var maxV = Math.max.apply(null, vals) || 1;

  var pad = { l: 65, r: 15, t: 10, b: 40 };
  var cw = W - pad.l - pad.r, ch = 260 - pad.t - pad.b;
  var bw = Math.min(60, Math.floor(cw / months.length) - 8);

  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  var barColor = isDark ? '#f97316' : '#ea580c';
  var textColor = isDark ? '#a0a0a0' : '#666';
  var gridColor = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)';

  for (var g = 0; g <= 4; g++) {
    var gy = pad.t + ch - (ch * g / 4);
    ctx.strokeStyle = gridColor; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(W - pad.r, gy); ctx.stroke();
    ctx.fillStyle = textColor; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(_fmtM(maxV * g / 4), pad.l - 6, gy + 3);
  }

  months.forEach(function(m, i) {
    var x = pad.l + (cw / months.length) * i + (cw / months.length - bw) / 2;
    var h = (vals[i] / maxV) * ch;
    ctx.fillStyle = barColor;
    ctx.fillRect(x, pad.t + ch - h, bw, h);

    ctx.fillStyle = textColor; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
    var mi = parseInt(m.split('-')[1]);
    ctx.fillText(_thaiMonth(mi), x + bw / 2, 260 - pad.b + 14);

    ctx.fillStyle = textColor; ctx.font = '9px sans-serif';
    ctx.fillText(_fmtM(vals[i]), x + bw / 2, pad.t + ch - h - 4);
  });

  ctx.fillStyle = textColor; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('รายได้รายเดือน', W / 2, 260 - 4);
}

function amzClickApiDash(el) {
  document.querySelectorAll('#amzChannelTabs .sub-tab').forEach(function(t) { t.classList.remove('active'); });
  if (el) el.classList.add('active');
  var section = document.getElementById('tab-amazon');
  if (!section) return;
  var biLayout = section.querySelector('.mt-bi-layout');
  if (biLayout) biLayout.style.display = 'none';
  var target = document.getElementById('amz-api-dashboard');
  if (target) target.style.display = 'block';
  if (!_AMZ_API.currentMonth) _amzApiLoad('2026-08');
}

function _amzApiHide() {
  var biLayout = document.querySelector('#tab-amazon .mt-bi-layout');
  if (biLayout) biLayout.style.display = '';
  var target = document.getElementById('amz-api-dashboard');
  if (target) target.style.display = 'none';
}

// ---- Auto-sync: สร้าง AMZ_ORDER_DATA จาก Supabase ทั้งหมด (2022–2026) ----
var _amzApiSynced = false;
var _AMZ_CAT_MAP = { 'ร้านกาแฟทั่วไป': 'ลูกค้าทั่วไป', 'black canyon': 'Black Canyon' };

function _amzNormCat(cat) {
  return _AMZ_CAT_MAP[cat] || cat || 'OR';
}

function _amzApiAutoSync() {
  if (_amzApiSynced || typeof _supaFetch !== 'function') return;
  _amzApiSynced = true;

  var p1 = _supaFetch('sales_daily',
    'select=date,customer_category,branch_code,qty,revenue&channel=in.(Amazon,Telesale)&date=gte.2022-01-01&order=date'
  );
  var p2 = _supaFetch('product_monthly',
    'select=year_month,product_name,customer_category,revenue,qty&channel=eq.Telesale&order=year_month'
  );

  Promise.all([p1, p2]).then(function(results) {
    var dailyRows = results[0] || [];
    var prodRows = results[1] || [];
    if (!dailyRows.length && !prodRows.length) { _amzApiSynced = false; return; }
    _amzApiBuildOrderData(dailyRows, prodRows);
  }).catch(function() {
    _amzApiSynced = false;
  });
}

function _amzApiBuildOrderData(dailyRows, prodRows) {
  var byCh = {};
  var byAll = {};
  var branchAgg = {};

  dailyRows.forEach(function(r) {
    var mo = (r.date || '').substring(0, 7);
    if (!mo) return;
    var cat = _amzNormCat(r.customer_category);
    var rev = Number(r.revenue) || 0;
    var qty = Number(r.qty) || 0;
    var branch = r.branch_code || '';

    if (!byCh[cat]) byCh[cat] = {};
    if (!byCh[cat][mo]) byCh[cat][mo] = { net: 0, qty: 0, bills: 0 };
    byCh[cat][mo].net += rev;
    byCh[cat][mo].qty += qty;
    byCh[cat][mo].bills += 1;

    if (!byAll[mo]) byAll[mo] = { net: 0, qty: 0, bills: 0 };
    byAll[mo].net += rev;
    byAll[mo].qty += qty;
    byAll[mo].bills += 1;

    if (branch) {
      if (!branchAgg[cat]) branchAgg[cat] = {};
      if (!branchAgg[cat][branch]) branchAgg[cat][branch] = { n: 0, q: 0, bi: 0 };
      branchAgg[cat][branch].n += rev;
      branchAgg[cat][branch].q += qty;
      branchAgg[cat][branch].bi += 1;
    }
  });

  // product aggregation from product_monthly
  var prodAgg = {};
  prodRows.forEach(function(r) {
    var mo = r.year_month || '';
    if (!mo) return;
    var cat = _amzNormCat(r.customer_category);
    var prod = r.product_name || '';
    if (!prod) return;
    var pk = prod.length > 50 ? prod.substring(0, 50) : prod;
    var rev = Number(r.revenue) || 0;
    var qty = Number(r.qty) || 0;

    if (!prodAgg[pk]) prodAgg[pk] = {};
    if (!prodAgg[pk][cat]) prodAgg[pk][cat] = {};
    if (!prodAgg[pk][cat][mo]) prodAgg[pk][cat][mo] = { n: 0, q: 0 };
    prodAgg[pk][cat][mo].n += rev;
    prodAgg[pk][cat][mo].q += qty;
  });

  var allMonths = Object.keys(byAll).sort();

  // channels totals
  var channels = {};
  Object.keys(byCh).forEach(function(cat) {
    var t = { net: 0, qty: 0, bills: 0 };
    Object.keys(byCh[cat]).forEach(function(mo) {
      t.net += byCh[cat][mo].net;
      t.qty += byCh[cat][mo].qty;
      t.bills += byCh[cat][mo].bills;
    });
    channels[cat] = t;
  });

  var gt = { net: 0, qty: 0, bills: 0, disc: 0 };
  Object.keys(channels).forEach(function(ch) {
    gt.net += channels[ch].net;
    gt.qty += channels[ch].qty;
    gt.bills += channels[ch].bills;
  });

  // top products overall
  var prodTotals = {};
  Object.keys(prodAgg).forEach(function(pk) {
    var t = { n: 0, q: 0 };
    Object.keys(prodAgg[pk]).forEach(function(cat) {
      Object.keys(prodAgg[pk][cat]).forEach(function(mo) {
        t.n += prodAgg[pk][cat][mo].n;
        t.q += prodAgg[pk][cat][mo].q;
      });
    });
    prodTotals[pk] = t;
  });
  var topProdAll = Object.keys(prodTotals)
    .map(function(p) { return { p: p, n: prodTotals[p].n, q: prodTotals[p].q }; })
    .sort(function(a, b) { return b.n - a.n; })
    .slice(0, 30);

  // top products by channel
  var topProdByCh = {};
  var _chProd = {};
  Object.keys(prodAgg).forEach(function(pk) {
    Object.keys(prodAgg[pk]).forEach(function(cat) {
      if (!_chProd[cat]) _chProd[cat] = {};
      if (!_chProd[cat][pk]) _chProd[cat][pk] = { n: 0, q: 0 };
      Object.keys(prodAgg[pk][cat]).forEach(function(mo) {
        _chProd[cat][pk].n += prodAgg[pk][cat][mo].n;
        _chProd[cat][pk].q += prodAgg[pk][cat][mo].q;
      });
    });
  });
  Object.keys(_chProd).forEach(function(cat) {
    topProdByCh[cat] = Object.keys(_chProd[cat])
      .map(function(p) { return { p: p, n: _chProd[cat][p].n, q: _chProd[cat][p].q }; })
      .sort(function(a, b) { return b.n - a.n; })
      .slice(0, 20);
  });

  // top branches by channel
  var topBranchByCh = {};
  Object.keys(branchAgg).forEach(function(cat) {
    topBranchByCh[cat] = Object.keys(branchAgg[cat])
      .map(function(b) { return { b: b, n: branchAgg[cat][b].n, q: branchAgg[cat][b].q, bi: branchAgg[cat][b].bi }; })
      .sort(function(a, b) { return b.n - a.n; })
      .slice(0, 20);
  });

  // product monthly (all channels combined)
  var prodMonthly = {};
  Object.keys(prodAgg).forEach(function(pk) {
    prodMonthly[pk] = {};
    Object.keys(prodAgg[pk]).forEach(function(cat) {
      Object.keys(prodAgg[pk][cat]).forEach(function(mo) {
        if (!prodMonthly[pk][mo]) prodMonthly[pk][mo] = { n: 0, q: 0 };
        prodMonthly[pk][mo].n += prodAgg[pk][cat][mo].n;
        prodMonthly[pk][mo].q += prodAgg[pk][cat][mo].q;
      });
    });
  });

  // product monthly by channel
  var prodMonthlyByCh = {};
  Object.keys(prodAgg).forEach(function(pk) {
    Object.keys(prodAgg[pk]).forEach(function(cat) {
      if (!prodMonthlyByCh[cat]) prodMonthlyByCh[cat] = {};
      prodMonthlyByCh[cat][pk] = prodAgg[pk][cat];
    });
  });

  // สร้าง AMZ_ORDER_DATA ใหม่ทั้งหมด
  window.AMZ_ORDER_DATA = {
    total: gt,
    dateRange: [allMonths[0], allMonths[allMonths.length - 1]],
    months: allMonths,
    channels: channels,
    monthlyAll: byAll,
    monthlyByCh: byCh,
    topProdAll: topProdAll,
    topProdByCh: topProdByCh,
    topBranchByCh: topBranchByCh,
    prodMonthly: prodMonthly,
    prodMonthlyByCh: prodMonthlyByCh
  };

  // อัพเดท AMZ_CUST ทุกปีที่มีข้อมูล
  var _moMap = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var _beYearMap = {};
  dailyRows.forEach(function(r) {
    var mo = (r.date || '').substring(0, 7);
    if (!mo) return;
    var ceY = parseInt(mo.substring(0, 4));
    var mIdx = parseInt(mo.substring(5, 7));
    var beY = ceY + 543;
    var mKey = _moMap[mIdx];
    if (!mKey) return;
    var cat = _amzNormCat(r.customer_category);
    var rev = Number(r.revenue) || 0;
    if (!_beYearMap[beY]) _beYearMap[beY] = {};
    if (!_beYearMap[beY][mKey]) _beYearMap[beY][mKey] = {};
    if (!_beYearMap[beY][mKey][cat]) _beYearMap[beY][mKey][cat] = { t: 0, a: 0 };
    _beYearMap[beY][mKey][cat].a += rev;
  });

  if (typeof _YEAR_MAP !== 'undefined') {
    Object.keys(_beYearMap).forEach(function(beY) {
      var d = _YEAR_MAP[beY];
      if (!d) return;
      Object.keys(_beYearMap[beY]).forEach(function(mKey) {
        if (!d.AMZ_CUST[mKey]) d.AMZ_CUST[mKey] = {};
        Object.keys(_beYearMap[beY][mKey]).forEach(function(cat) {
          if (!d.AMZ_CUST[mKey][cat]) d.AMZ_CUST[mKey][cat] = { t: 0, a: 0 };
          d.AMZ_CUST[mKey][cat].a = _beYearMap[beY][mKey][cat].a;
        });
      });
    });
  }

  // รีเรนเดอร์
  if (typeof window.renderAmzDashboard === 'function') {
    window._amzForceRerender = true;
    window.renderAmzDashboard();
  }
  if (typeof window.renderAmzSalesPage === 'function') {
    window._salesPageRendered = false;
  }

  console.log('[API Sync] สร้าง AMZ_ORDER_DATA จาก Supabase สำเร็จ:', allMonths.length, 'เดือน,', rows.length, 'รายการ');
}

function _amzApiSetMonth(val) {
  var btns = document.querySelectorAll('#amzApiPeriodBtns .period-type-btn');
  btns.forEach(function(b) { b.classList.remove('active'); });
  event.target.classList.add('active');

  if (val === 'ytd') {
    if (_AMZ_API.cache['ytd']) { _amzApiRender(_AMZ_API.cache['ytd'], 'ytd'); }
    else { _amzApiLoadYTD(); }
  } else {
    _amzApiLoad(val);
  }
}
