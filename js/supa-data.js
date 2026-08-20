/* ============================================================
   Supabase Live Data Layer
   ดึงข้อมูลยอดขายจาก Supabase ทุกปี (2022+) แล้ว override ค่า actual
   ============================================================ */

var _SUPA_LIVE = { loaded: false, loading: false, _promise: null };

var _SL_CH_MAP = { 'ModernTrade': 'Modern Trade', 'Amazon': 'Amazon & Souvenir', 'Telesale': 'Amazon & Souvenir', 'Booth': 'Booth', 'Online': 'Online' };
var _SL_DAILY_CH = { 'ModernTrade': 'MT', 'Amazon': 'AMS', 'Telesale': 'AMS', 'Booth': 'Booth', 'Online': 'Online' };
var _SL_MT_KEY = { 'Big C': 'BIG C', 'Makro': 'MAKRO', 'Aeon': 'AEON', 'Top': 'TOP', 'ซีเจ': 'CJ', 'LOTUS': 'Lotus' };
var _SL_AMZ_KEY = { 'black canyon': 'Black Canyon', 'ร้านกาแฟทั่วไป': 'ลูกค้าทั่วไป' };
var _SL_BOOTH_KEY = { 'ลำยา3เก่า': 'ลำพยา 3 (เก่า)', 'ปตทคุณาวรรณ': 'ร้านใหม่ (ปตท.คุณาวรรณ)', 'หน้ามอ': 'หน้ามอ (ม.เกษตร)', 'หนองพงนก': 'หนองพงนก' };
var _SL_CH_NORMALIZE = { 'Telesale': 'Amazon', '': null };
var _SL_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function supaLiveLoad() {
  if (_SUPA_LIVE.loaded) return Promise.resolve(true);
  if (_SUPA_LIVE.loading) return _SUPA_LIVE._promise;
  _SUPA_LIVE.loading = true;

  _SUPA_LIVE._promise = Promise.all([
    _supaFetch('sales_daily',
      'select=date,channel,customer_category,revenue,qty,n_transactions&date=gte.2022-01-01&order=date'),
    _supaFetch('product_monthly',
      'select=year_month,product_code,product_name,channel,source,customer_category,revenue,qty&year_month=gte.2022-01&order=revenue.desc')
  ]).then(function(results) {
    _supaLiveApplyAll(results[0]);
    _supaApplyProducts(results[1]);
    _SUPA_LIVE.loaded = true;
    _SUPA_LIVE.loading = false;
    console.log('[SupaLive] product_monthly:', results[1].length, 'รายการ');
    return true;
  }).catch(function(err) {
    console.error('[SupaLive] fetch error:', err);
    _SUPA_LIVE.loading = false;
    return false;
  });

  return _SUPA_LIVE._promise;
}

function _supaCreateEmptyYear() {
  var cm = {}, mt = {}, amz = {}, bth = {}, ol = {}, da = {};
  _SL_MONTHS.forEach(function(mo) {
    cm[mo] = { 'Modern Trade': {t:0,a:0}, 'Amazon & Souvenir': {t:0,a:0}, 'Booth': {t:0,a:0}, 'Online': {t:0,a:0} };
    mt[mo] = {}; amz[mo] = {}; bth[mo] = {}; ol[mo] = {};
    da[mo] = { all: new Array(31).fill(0), MT: new Array(31).fill(0), AMS: new Array(31).fill(0), Booth: new Array(31).fill(0), Online: new Array(31).fill(0) };
  });
  return {
    MONTHLY_TARGET: [0,0,0,0,0,0,0,0,0,0,0,0],
    _ACTUAL_FALLBACK: [0,0,0,0,0,0,0,0,0,0,0,0],
    CHANNEL_MONTHLY: cm,
    MT_CUST: mt,
    AMZ_CUST: amz,
    BOOTH_DATA: bth,
    OL_DETAIL: ol,
    AMZ_REGION: {},
    DAILY_ACTUAL: da
  };
}

function _supaZeroYear(d) {
  d._ACTUAL_FALLBACK = [0,0,0,0,0,0,0,0,0,0,0,0];
  var props = ['CHANNEL_MONTHLY','MT_CUST','AMZ_CUST','BOOTH_DATA'];
  props.forEach(function(p) {
    if (!d[p]) return;
    _SL_MONTHS.forEach(function(mo) {
      if (!d[p][mo]) return;
      Object.keys(d[p][mo]).forEach(function(k) {
        if (d[p][mo][k] && typeof d[p][mo][k].a === 'number') d[p][mo][k].a = 0;
      });
    });
  });
  _SL_MONTHS.forEach(function(mo) {
    if (d.OL_DETAIL && d.OL_DETAIL[mo]) {
      Object.keys(d.OL_DETAIL[mo]).forEach(function(k) { d.OL_DETAIL[mo][k] = 0; });
    }
    if (d.DAILY_ACTUAL && d.DAILY_ACTUAL[mo]) {
      var da = d.DAILY_ACTUAL[mo];
      Object.keys(da).forEach(function(ch) {
        if (Array.isArray(da[ch])) da[ch] = da[ch].map(function() { return 0; });
      });
    }
  });
}

function _supaApplyChannelTargets(d, ceYear) {
  if (typeof getTargetByYear !== 'function') return;
  var tgt = getTargetByYear(ceYear);
  if (!tgt) return;
  var chMap = {mtTotal:'Modern Trade', amazonTotal:'Amazon & Souvenir', boothTotal:'Booth', onlineTotal:'Online'};
  _SL_MONTHS.forEach(function(mo, mi) {
    if (!d.CHANNEL_MONTHLY[mo]) d.CHANNEL_MONTHLY[mo] = {};
    Object.keys(chMap).forEach(function(tgtKey) {
      var chName = chMap[tgtKey];
      if (tgt[tgtKey] && tgt[tgtKey].monthly) {
        var target = tgt[tgtKey].monthly[mi] || 0;
        if (!d.CHANNEL_MONTHLY[mo][chName]) d.CHANNEL_MONTHLY[mo][chName] = { t: 0, a: 0 };
        d.CHANNEL_MONTHLY[mo][chName].t = target;
      }
    });
  });
}

function _supaLiveApplyAll(rows) {
  var byYear = {};
  rows.forEach(function(r) {
    if (!r.date) return;
    var yr = parseInt(r.date.split('-')[0], 10);
    if (!byYear[yr]) byYear[yr] = [];
    byYear[yr].push(r);
  });

  var years = Object.keys(byYear).map(Number).sort();
  console.log('[SupaLive] ปีที่พบข้อมูล:', years.join(', '), '| ทั้งหมด', rows.length, 'รายการ');

  years.forEach(function(ceYear) {
    var beYear = ceYear + 543;
    var d = _YEAR_MAP[beYear];
    if (!d) {
      d = _supaCreateEmptyYear();
      _YEAR_MAP[beYear] = d;
    }
    _supaZeroYear(d);
    _supaApplyYearRows(d, byYear[ceYear]);
    _supaApplyChannelTargets(d, ceYear);

    // Supabase doesn't have platform-level online data — fill from OL_EXPENSE
    if (beYear === 2569 && typeof OL_EXPENSE !== 'undefined') {
      _SL_MONTHS.forEach(function(mo) {
        if (!OL_EXPENSE[mo]) return;
        if (!d.OL_DETAIL[mo]) d.OL_DETAIL[mo] = {};
        Object.keys(OL_EXPENSE[mo]).forEach(function(p) {
          if (OL_EXPENSE[mo][p] && typeof OL_EXPENSE[mo][p].net === 'number') {
            d.OL_DETAIL[mo][p] = Math.round(OL_EXPENSE[mo][p].net);
          }
        });
      });
      // Fill CHANNEL_MONTHLY Online.a from CASH_DATA_69 for months not in Supabase
      if (typeof CASH_DATA_69 !== 'undefined') {
        var _thToEn = {'ม.ค.':'Jan','ก.พ.':'Feb','มี.ค.':'Mar','เม.ย.':'Apr','พ.ค.':'May','มิ.ย.':'Jun','ก.ค.':'Jul','ส.ค.':'Aug','ก.ย.':'Sep','ต.ค.':'Oct','พ.ย.':'Nov','ธ.ค.':'Dec'};
        Object.keys(CASH_DATA_69).forEach(function(thMo) {
          var mo = _thToEn[thMo];
          if (!mo || !d.CHANNEL_MONTHLY[mo] || !d.CHANNEL_MONTHLY[mo]['Online']) return;
          if (d.CHANNEL_MONTHLY[mo]['Online'].a === 0 && CASH_DATA_69[thMo].net > 0) {
            d.CHANNEL_MONTHLY[mo]['Online'].a = Math.round(CASH_DATA_69[thMo].net);
          }
        });
      }
      // Restore DAILY_ACTUAL Online from hardcoded fallback
      if (typeof _DAILY_ONLINE_FALLBACK !== 'undefined') {
        _SL_MONTHS.forEach(function(mo) {
          if (!_DAILY_ONLINE_FALLBACK[mo] || !d.DAILY_ACTUAL[mo]) return;
          var allZero = d.DAILY_ACTUAL[mo].Online.every(function(v) { return v === 0; });
          if (allZero) {
            d.DAILY_ACTUAL[mo].Online = _DAILY_ONLINE_FALLBACK[mo].slice();
            _DAILY_ONLINE_FALLBACK[mo].forEach(function(v, i) {
              d.DAILY_ACTUAL[mo].all[i] += v;
            });
          }
        });
      }
    }

    var s = _buildSalesData(d);
    d.SALES_MONTHLY = s.SALES_MONTHLY;
    d.SALES_YTD_TARGET = s.SALES_YTD_TARGET;
    d.SALES_MTH_TARGET = s.SALES_MTH_TARGET;
  });

  // Zero OL_CUST_STATIC for current year
  if (typeof OL_CUST_STATIC !== 'undefined') {
    _SL_MONTHS.forEach(function(mo) {
      if (!OL_CUST_STATIC[mo]) return;
      Object.keys(OL_CUST_STATIC[mo]).forEach(function(k) {
        if (OL_CUST_STATIC[mo][k] && typeof OL_CUST_STATIC[mo][k].a === 'number') OL_CUST_STATIC[mo][k].a = 0;
      });
    });
  }
  // Re-apply OL_CUST for 2026
  if (byYear[2026]) {
    byYear[2026].forEach(function(r) {
      if (!r.date || r.channel !== 'Online' || !r.customer_category) return;
      var mi = parseInt(r.date.split('-')[1], 10) - 1;
      var mo = _SL_MONTHS[mi]; if (!mo) return;
      var cat = r.customer_category;
      var rev = Number(r.revenue) || 0;
      if (typeof OL_CUST_STATIC !== 'undefined') {
        if (!OL_CUST_STATIC[mo]) OL_CUST_STATIC[mo] = {};
        if (!OL_CUST_STATIC[mo][cat]) OL_CUST_STATIC[mo][cat] = { t: 0, a: 0 };
        OL_CUST_STATIC[mo][cat].a += Math.round(rev);
      }
    });
  }
}

function _supaApplyYearRows(d, rows) {
  var mTotals = [0,0,0,0,0,0,0,0,0,0,0,0];

  rows.forEach(function(r) {
    var dt = r.date; if (!dt) return;
    var parts = dt.split('-');
    var mi = parseInt(parts[1], 10) - 1;
    var day = parseInt(parts[2], 10) - 1;
    var mo = _SL_MONTHS[mi]; if (!mo) return;

    var ch = r.channel || '';
    var normCh = _SL_CH_NORMALIZE[ch]; if (normCh !== undefined) ch = normCh;
    if (ch === null) return;

    var cat = r.customer_category || '';
    var rev = Number(r.revenue) || 0;
    var dashCh = _SL_CH_MAP[ch] || ch;
    var dayCh = _SL_DAILY_CH[ch] || '';

    if (!d.CHANNEL_MONTHLY[mo]) d.CHANNEL_MONTHLY[mo] = {};
    if (!d.CHANNEL_MONTHLY[mo][dashCh]) d.CHANNEL_MONTHLY[mo][dashCh] = { t: 0, a: 0 };
    d.CHANNEL_MONTHLY[mo][dashCh].a += rev;

    if (ch === 'ModernTrade' && cat) {
      if (!d.MT_CUST[mo]) d.MT_CUST[mo] = {};
      var mk = _SL_MT_KEY[cat] || cat;
      if (!d.MT_CUST[mo][mk]) d.MT_CUST[mo][mk] = { t: 0, a: 0 };
      d.MT_CUST[mo][mk].a += rev;
    } else if ((ch === 'Amazon' || ch === 'Telesale') && cat) {
      if (!d.AMZ_CUST[mo]) d.AMZ_CUST[mo] = {};
      var ak = _SL_AMZ_KEY[cat] || cat;
      if (!d.AMZ_CUST[mo][ak]) d.AMZ_CUST[mo][ak] = { t: 0, a: 0 };
      d.AMZ_CUST[mo][ak].a += rev;
    } else if (ch === 'Booth' && cat) {
      if (!d.BOOTH_DATA[mo]) d.BOOTH_DATA[mo] = {};
      var bk = _SL_BOOTH_KEY[cat] || cat;
      if (!d.BOOTH_DATA[mo][bk]) d.BOOTH_DATA[mo][bk] = { t: 0, a: 0 };
      d.BOOTH_DATA[mo][bk].a += rev;
    } else if (ch === 'Online' && cat) {
      if (!d.OL_DETAIL[mo]) d.OL_DETAIL[mo] = {};
      if (!d.OL_DETAIL[mo][cat]) d.OL_DETAIL[mo][cat] = 0;
      d.OL_DETAIL[mo][cat] += rev;
    }

    mTotals[mi] += rev;

    if (!d.DAILY_ACTUAL[mo]) {
      d.DAILY_ACTUAL[mo] = { all: new Array(31).fill(0), MT: new Array(31).fill(0), AMS: new Array(31).fill(0), Booth: new Array(31).fill(0), Online: new Array(31).fill(0) };
    }
    if (day >= 0 && day < 31) {
      d.DAILY_ACTUAL[mo].all[day] += rev;
      if (dayCh && d.DAILY_ACTUAL[mo][dayCh]) d.DAILY_ACTUAL[mo][dayCh][day] += rev;
    }
  });

  // Round all values
  _SL_MONTHS.forEach(function(mo) {
    if (d.CHANNEL_MONTHLY[mo]) {
      Object.keys(d.CHANNEL_MONTHLY[mo]).forEach(function(c) {
        d.CHANNEL_MONTHLY[mo][c].a = Math.round(d.CHANNEL_MONTHLY[mo][c].a);
      });
    }
    ['MT_CUST','AMZ_CUST','BOOTH_DATA'].forEach(function(prop) {
      if (d[prop] && d[prop][mo]) {
        Object.keys(d[prop][mo]).forEach(function(k) {
          if (d[prop][mo][k] && typeof d[prop][mo][k].a === 'number')
            d[prop][mo][k].a = Math.round(d[prop][mo][k].a);
        });
      }
    });
    if (d.OL_DETAIL && d.OL_DETAIL[mo]) {
      Object.keys(d.OL_DETAIL[mo]).forEach(function(k) {
        d.OL_DETAIL[mo][k] = Math.round(d.OL_DETAIL[mo][k]);
      });
    }
  });

  d._ACTUAL_FALLBACK = mTotals.map(function(v) { return Math.round(v); });
}

function supaLiveRefresh(callback) {
  _SUPA_LIVE.loaded = false;
  _SUPA_LIVE.loading = false;
  _supaState.cache = {};

  var badge = document.getElementById('supaLiveBadge');
  if (badge) { badge.textContent = '⏳ กำลังรีเฟรชข้อมูล...'; badge.style.color = '#ea580c'; }

  supaLiveLoad().then(function(ok) {
    if (ok) {
      _applyYear(_CY);
      _supaUpdateYearDropdowns();
      _supaReRenderVisible();
      if (badge) { badge.textContent = '✅ ข้อมูลสดจาก Supabase'; badge.style.color = '#16a34a'; }
      if (typeof callback === 'function') callback(true);
    } else {
      if (badge) { badge.textContent = '⚠️ รีเฟรชไม่สำเร็จ'; badge.style.color = '#dc2626'; }
      if (typeof callback === 'function') callback(false);
    }
  });
}

function _supaReRenderVisible() {
  var rerender = {
    overview:'renderOverview', channel:'renderChannel', customer:'renderCustomer',
    sales:'renderSales', booth:'renderBooth', online:'renderOnline',
    amazon:'renderAmazon', mt:'renderMTPage'
  };
  Object.keys(rerender).forEach(function(tab) {
    var sec = document.getElementById('tab-' + tab);
    if (sec && sec.style.display !== 'none' && typeof window[rerender[tab]] === 'function') {
      try { window[rerender[tab]](); } catch(e) { console.warn('[SupaLive] re-render', tab, e); }
    }
  });
}

function _supaUpdateYearDropdowns() {
  var years = Object.keys(_YEAR_MAP).map(Number).sort();
  var menu = document.getElementById('annualMenu');
  if (menu) {
    var html = '';
    years.forEach(function(be) {
      var ce = be - 543;
      var cls = (be === _CY) ? ' active' : '';
      html += '<div class="qmenu-item' + cls + '" data-y="' + be + '" onclick="pickAnnual(' + be + ',this)">ปี ' + be + ' (' + ce + ')</div>';
    });
    menu.innerHTML = html;
  }
  var mtMenu = document.getElementById('mtYearMenu');
  if (mtMenu) {
    var h2 = '';
    years.slice().reverse().forEach(function(be) {
      var ce = be - 543;
      h2 += '<div class="qmenu-item" onclick="mtPickYear(' + ce + ',this)">📅 ปี ' + be + ' (' + ce + ')</div>';
    });
    mtMenu.innerHTML = h2;
  }
  var mtYSel = document.getElementById('mtYearSelect');
  if (mtYSel) {
    var h3 = '<option value=""></option>';
    years.slice().reverse().forEach(function(be) { var ce = be - 543; h3 += '<option value="' + ce + '">' + ce + '</option>'; });
    mtYSel.innerHTML = h3;
  }
  var mtQSel = document.getElementById('mtQuarterSelect');
  if (mtQSel) {
    var h4 = '<option value=""></option>';
    years.slice().reverse().forEach(function(be) {
      var ce = be - 543;
      for (var q = 1; q <= 4; q++) h4 += '<option value="' + ce + '-Q' + q + '">Q' + q + '/' + ce + '</option>';
    });
    mtQSel.innerHTML = h4;
  }
}

// Build MT_DATA from product_monthly for each year
var _SL_MT_SOURCE_KEY = {'CJ':'CJ','ซีเจ':'CJ','Big C':'BigC','BIG C':'BigC','Makro':'Makro','MAKRO':'Makro',
  'Aeon':'Aeon','AEON':'Aeon','Top':'Top','TOP':'Top','The Mall':'TheMall','MM':'MM','Lotus':'Lotus','LOTUS':'Lotus','VILLA MARKET':'Villa'};

function _supaApplyProducts(rows) {
  if (!rows || !rows.length) return;
  var byYear = {};
  rows.forEach(function(r) {
    if (!r.year_month || !r.channel) return;
    var yr = parseInt(r.year_month.split('-')[0], 10);
    if (!byYear[yr]) byYear[yr] = [];
    byYear[yr].push(r);
  });

  Object.keys(byYear).forEach(function(ceYrStr) {
    var ceYear = Number(ceYrStr);
    var beYear = ceYear + 543;
    var yearRows = byYear[ceYrStr];

    // Build MT_DATA-like structure for MT products
    var mtMonthly = {};
    var mtCh = {};
    var prodMap = {};

    yearRows.forEach(function(r) {
      if (r.channel !== 'ModernTrade') return;
      var mi = parseInt(r.year_month.split('-')[1], 10) - 1;
      var mo = _SL_MONTHS[mi]; if (!mo) return;
      var cat = r.customer_category || r.source || '';
      var chKey = _SL_MT_SOURCE_KEY[cat] || cat;
      if (!chKey) return;

      var rev = Number(r.revenue) || 0;
      var qty = Number(r.qty) || 0;
      var code = r.product_code || '';
      var name = r.product_name || code;

      if (!mtMonthly[mo]) mtMonthly[mo] = {u:0, b:0};
      mtMonthly[mo].b += rev;
      mtMonthly[mo].u += qty;

      if (!mtCh[chKey]) mtCh[chKey] = {};
      var pKey = chKey + '|' + code;
      if (!prodMap[pKey]) {
        prodMap[pKey] = {no:Object.keys(mtCh[chKey]).length+1, code:code, name:name, rsp:0, gp:0, type:'', rank:'', tu:0, tb:0, rmk:'', m:{}};
        mtCh[chKey][code] = prodMap[pKey];
      }
      var prod = prodMap[pKey];
      if (!prod.m[mo]) prod.m[mo] = {u:0, b:0};
      prod.m[mo].b += rev;
      prod.m[mo].u += qty;
      prod.tb += rev;
      prod.tu += qty;
    });

    // Convert mtCh from map to array per channel
    var chArrays = {};
    Object.keys(mtCh).forEach(function(chKey) {
      chArrays[chKey] = Object.values(mtCh[chKey]).sort(function(a,b){ return b.tb - a.tb; });
      chArrays[chKey].forEach(function(p,i){ p.no = i+1; });
    });

    // Round values
    Object.keys(mtMonthly).forEach(function(mo) {
      mtMonthly[mo].b = Math.round(mtMonthly[mo].b);
      mtMonthly[mo].u = Math.round(mtMonthly[mo].u);
    });

    // Store as _YEAR_MAP[beYear]._MT_PRODUCTS
    if (!_YEAR_MAP[beYear]) {
      _YEAR_MAP[beYear] = _supaCreateEmptyYear();
    }
    _YEAR_MAP[beYear]._MT_PRODUCTS = { monthly: mtMonthly, ch: chArrays };

    // For current year (2026), merge Supabase sales data into existing MT_DATA
    // Keep product metadata (rsp, gp, type, rank, rmk) from hardcoded MT_DATA
    if (ceYear === 2026 && typeof MT_DATA !== 'undefined') {
      MT_DATA.monthly = mtMonthly;
      Object.keys(chArrays).forEach(function(chKey) {
        if (!MT_DATA.ch[chKey]) { MT_DATA.ch[chKey] = chArrays[chKey]; return; }
        var existing = {};
        MT_DATA.ch[chKey].forEach(function(p) { existing[p.code] = p; });
        chArrays[chKey].forEach(function(sp) {
          var ep = existing[sp.code];
          if (ep) {
            ep.tu = sp.tu; ep.tb = sp.tb; ep.m = sp.m;
          } else {
            MT_DATA.ch[chKey].push(sp);
          }
        });
        MT_DATA.ch[chKey].sort(function(a,b){ return b.tb - a.tb; });
        MT_DATA.ch[chKey].forEach(function(p,i){ p.no = i+1; });
      });
    }
  });

  console.log('[SupaLive] MT_DATA สร้างจาก product_monthly สำเร็จ');
}

function _supaLiveAutoLoad() {
  var badge = document.getElementById('supaLiveBadge');
  if (badge) { badge.textContent = '⏳ กำลังโหลดข้อมูลสด...'; badge.style.display = 'inline-block'; }

  supaLiveLoad().then(function(ok) {
    if (ok) {
      _applyYear(_CY);
      _supaUpdateYearDropdowns();
      _supaReRenderVisible();
      if (badge) { badge.textContent = '✅ ข้อมูลสดจาก Supabase'; badge.style.color = '#16a34a'; }
      console.log('[SupaLive] โหลดสำเร็จ — ปีที่มี:', Object.keys(_YEAR_MAP).sort().join(', '));
    } else {
      if (badge) { badge.textContent = '⚠️ โหลดข้อมูลสดไม่สำเร็จ'; badge.style.color = '#dc2626'; }
    }
  });
}
