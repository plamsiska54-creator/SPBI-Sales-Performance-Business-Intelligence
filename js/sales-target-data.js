// ============================================================
// SALES-TARGET-DATA.JS — สร้างข้อมูล Sales Target Tracking AI จาก globals จริง
// คำนวณตอนเรียก (ไม่ใช่ตอนโหลด) เพราะ globals อาจยังไม่พร้อม
// ============================================================

window.buildSalesTargetData = function () {
  'use strict';

  // ---- ตรวจ globals ที่จำเป็น ----
  var months     = (typeof MONTHS !== 'undefined') ? MONTHS : null;
  var chMonthly  = (typeof CHANNEL_MONTHLY !== 'undefined') ? CHANNEL_MONTHLY : null;
  var chNames    = (typeof CH_NAMES !== 'undefined') ? CH_NAMES : null;
  var target2026 = (typeof TARGET_2026 !== 'undefined') ? TARGET_2026 : null;
  var mtCust     = (typeof MT_CUST !== 'undefined') ? MT_CUST : null;
  var amzCust    = (typeof AMZ_CUST !== 'undefined') ? AMZ_CUST : null;
  var boothData  = (typeof BOOTH_DATA !== 'undefined') ? BOOTH_DATA : null;
  var olCust     = (typeof OL_CUST !== 'undefined') ? OL_CUST : null;

  // ---- Month mappings ----
  var MONTH_TH = {
    Jan: 'มกราคม', Feb: 'กุมภาพันธ์', Mar: 'มีนาคม', Apr: 'เมษายน',
    May: 'พฤษภาคม', Jun: 'มิถุนายน', Jul: 'กรกฎาคม', Aug: 'สิงหาคม',
    Sep: 'กันยายน', Oct: 'ตุลาคม', Nov: 'พฤศจิกายน', Dec: 'ธันวาคม'
  };
  var MONTH_IDX = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };
  // MT_CUST key -> TARGET_2026.mt key
  var MT_KEY_MAP = {
    'CJ': 'CJ', 'BIG C': 'BigC', 'MAKRO': 'Makro', 'AEON': 'Aeon',
    'The Mall': 'TheMall', 'TOP': 'Top', 'MM': 'MM'
  };
  // OL_CUST key -> TARGET_2026.online key (Direct = Facebook ในข้อมูลจริง)
  var OL_KEY_MAP = {
    'Tiktok': 'Tiktok', 'Direct': 'Facebook', 'Shopee': 'Shopee', 'Lazada': 'Lazada',
    'Facebook': 'Facebook'
  };

  // ---- Period ----
  var now = new Date();
  var MONTH_ORDER = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var currentMonth = null;
  if (chMonthly && months && months.length > 0) {
    for (var mi = months.length - 1; mi >= 0; mi--) {
      var md_check = chMonthly[months[mi]];
      if (md_check) {
        var hasActual = false;
        Object.keys(md_check).forEach(function(k) {
          if ((md_check[k].a || 0) > 0) hasActual = true;
        });
        if (hasActual) { currentMonth = months[mi]; break; }
      }
    }
  }
  if (!currentMonth && months && months.length > 0) currentMonth = months[months.length - 1];
  var monthIdx = currentMonth ? (MONTH_IDX[currentMonth] != null ? MONTH_IDX[currentMonth] : -1) : -1;
  var daysPassed = now.getDate();
  var totalDays = currentMonth
    ? new Date(now.getFullYear(), monthIdx + 1, 0).getDate()
    : 31;

  var period = {
    month: currentMonth ? (MONTH_TH[currentMonth] || currentMonth) : 'N/A',
    year: now.getFullYear() + 543,
    daysPassed: daysPassed,
    totalDays: totalDays
  };

  // ---- Team totals (เดือนปัจจุบัน) ----
  var teamTarget = 0;
  var teamActual = 0;
  if (chMonthly && currentMonth && chNames) {
    var md = chMonthly[currentMonth] || {};
    chNames.forEach(function (c) {
      var d = md[c] || { t: 0, a: 0 };
      teamTarget += (d.t || 0);
      teamActual += (d.a || 0);
    });
  }
  var teamForecast = (daysPassed > 0)
    ? Math.round((teamActual / daysPassed) * totalDays)
    : 0;

  // ---- Salespeople (รายบุคคลจาก SALES_MONTHLY) ----
  var salesMonthly = (typeof SALES_MONTHLY !== 'undefined') ? SALES_MONTHLY : null;
  var salesMthTarget = (typeof SALES_MTH_TARGET !== 'undefined') ? SALES_MTH_TARGET : null;
  var salesYtdTarget = (typeof SALES_YTD_TARGET !== 'undefined') ? SALES_YTD_TARGET : null;

  var ZONE_AVATAR = {
    'Modern Trade': '🏪',
    'Amazon': '🛒',
    'Booth': '🎪',
    'Online': '💻'
  };

  // หาเดือนล่าสุดที่มีข้อมูลจริงใน SALES_MONTHLY (actual > 0)
  var salesMonth = currentMonth;
  if (salesMonthly) {
    var firstKey = Object.keys(salesMonthly)[0];
    if (firstKey) {
      var sKeys = Object.keys(salesMonthly[firstKey]).filter(function(k){return k!=='zone';});
      for (var si = sKeys.length - 1; si >= 0; si--) {
        var mKey = sKeys[si];
        var hasVal = false;
        Object.keys(salesMonthly).forEach(function(p) {
          if ((salesMonthly[p][mKey] || 0) > 0) hasVal = true;
        });
        if (hasVal) { salesMonth = mKey; break; }
      }
    }
  }
  var salesMonthIdx = salesMonth ? (MONTH_IDX[salesMonth] != null ? MONTH_IDX[salesMonth] : -1) : -1;

  var accounts = [];
  if (salesMonthly && salesMonth) {
    Object.keys(salesMonthly).forEach(function (name) {
      var d = salesMonthly[name];
      var actual = d[salesMonth] || 0;
      var zone = d.zone || '';
      var tgt = 0;
      if (salesMthTarget && salesMthTarget[name] && salesMthTarget[name][salesMonth]) {
        tgt = salesMthTarget[name][salesMonth];
      }
      var avatar = '👤';
      Object.keys(ZONE_AVATAR).forEach(function (k) {
        if (zone.indexOf(k) !== -1) avatar = ZONE_AVATAR[k];
      });
      accounts.push({
        name: name,
        avatar: avatar,
        target: tgt,
        actual: actual,
        forecast: (daysPassed > 0) ? Math.round((actual / daysPassed) * totalDays) : 0,
        zone: zone
      });
    });
  }

  accounts.sort(function (a, b) { return b.actual - a.actual; });
  var salespeople = accounts.map(function (a, i) {
    return {
      id: 'SP' + String(i + 1).padStart(2, '0'),
      name: a.name,
      avatar: a.avatar,
      target: a.target,
      actual: a.actual,
      forecast: a.forecast
    };
  });

  // ---- topCustomersDecline (MoM comparison, MT customers) ----
  var topCustomersDecline = [];
  if (mtCust && months && months.length >= 2) {
    var prevMonth = months[months.length - 2];
    var curMonth  = months[months.length - 1];
    var prevData  = mtCust[prevMonth] || {};
    var curData   = mtCust[curMonth] || {};

    // รวม AMZ, Booth, Online ด้วยเพื่อความครอบคลุม
    var allPrev = {};
    var allCur = {};

    // MT
    Object.keys(prevData).forEach(function (k) { allPrev['[MT] ' + k] = prevData[k].a || 0; });
    Object.keys(curData).forEach(function (k) { allCur['[MT] ' + k] = curData[k].a || 0; });

    // AMZ
    if (amzCust) {
      var amzPrev = amzCust[prevMonth] || {};
      var amzCur  = amzCust[curMonth] || {};
      Object.keys(amzPrev).forEach(function (k) { allPrev['[AMZ] ' + k] = amzPrev[k].a || 0; });
      Object.keys(amzCur).forEach(function (k) { allCur['[AMZ] ' + k] = amzCur[k].a || 0; });
    }

    // Booth
    if (boothData) {
      var bthPrev = boothData[prevMonth] || {};
      var bthCur  = boothData[curMonth] || {};
      Object.keys(bthPrev).forEach(function (k) { allPrev['[Booth] ' + k] = bthPrev[k].a || 0; });
      Object.keys(bthCur).forEach(function (k) { allCur['[Booth] ' + k] = bthCur[k].a || 0; });
    }

    // Online
    if (olCust) {
      var olPrev = olCust[prevMonth] || {};
      var olCurD = olCust[curMonth] || {};
      Object.keys(olPrev).forEach(function (k) { allPrev['[Online] ' + k] = olPrev[k].a || 0; });
      Object.keys(olCurD).forEach(function (k) { allCur['[Online] ' + k] = olCurD[k].a || 0; });
    }

    var declines = [];
    Object.keys(allPrev).forEach(function (k) {
      var prev = allPrev[k];
      var cur  = allCur[k] || 0;
      if (prev > 0 && cur < prev) {
        var change = ((cur - prev) / prev) * 100;
        declines.push({ name: k, change: Math.round(change) });
      }
    });
    declines.sort(function (a, b) { return a.change - b.change; }); // most negative first
    topCustomersDecline = declines.slice(0, 5).map(function (d, i) {
      return { rank: i + 1, name: d.name, change: d.change };
    });
  }

  // ---- Opportunities (sub-channels ที่ actual < target, มีโอกาสเพิ่ม) ----
  var opportunities = [];
  accounts.forEach(function (a) {
    if (a.target > 0 && a.actual < a.target) {
      var gap = a.target - a.actual;
      var prob = Math.round((a.actual / a.target) * 100);
      if (prob > 95) prob = 95;
      opportunities.push({
        id: (a.zone || 'SP') + '_' + a.name.replace(/\s+/g, '_'),
        name: 'เพิ่มยอด ' + a.name, // เพิ่มยอด
        value: gap,
        probability: prob
      });
    }
  });
  opportunities.sort(function (a, b) { return b.value - a.value; });
  opportunities = opportunities.slice(0, 5);

  // ---- Return final data ----
  return {
    period: period,
    team: {
      target: teamTarget,
      actual: teamActual,
      forecast: teamForecast
    },
    salespeople: salespeople,
    topCustomersDecline: topCustomersDecline,
    opportunities: opportunities
  };
};
