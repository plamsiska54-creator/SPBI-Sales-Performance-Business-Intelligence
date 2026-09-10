// ============================================================
// SALES-TARGET-AI.JS — Sales Target Tracking AI module (combined)
// Depends on: sales-target-data.js (SALES_TARGET_DATA)
// Optional: CH_NAMES, CHANNEL_MONTHLY, MONTHS from app.js scope
// ============================================================

(function () {
  'use strict';

  // ---- Helper: format number with commas ----
  function fmtNum(n) {
    if (n == null) return '0';
    return Number(n).toLocaleString('en-US');
  }

  // ---- Helper: calculate risk level (>=100% Low, >=90% Medium, <90% High) ----
  function calcRisk(forecast, target) {
    if (!target) return 'N/A';
    var pct = (forecast / target) * 100;
    if (pct >= 100) return 'Low';
    if (pct >= 90) return 'Medium';
    return 'High';
  }

  // ---- Helper: risk badge color class ----
  function riskClass(risk) {
    if (risk === 'Low') return 'sta-risk-low';
    if (risk === 'Medium') return 'sta-risk-med';
    return 'sta-risk-high';
  }

  // ---- Helper: achievement bar color class ----
  function achvClass(pct) {
    if (pct >= 100) return 'sta-bar-green';
    if (pct >= 90) return 'sta-bar-orange';
    return 'sta-bar-red';
  }

  // ---- Clear gauge canvas before re-render ----
  function clearGauge() {
    var c = document.getElementById('staGaugeChart');
    if (c) { var ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height); }
  }

  // ---- Build achievement gauge/speedometer chart (canvas) ----
  function buildGaugeChart(canvasId, pct) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // ขนาด canvas (ใช้ devicePixelRatio เพื่อความคมชัด)
    var size = 280;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = (size * 0.65) * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = (size * 0.65) + 'px';

    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    var cx = size / 2;
    var cy = size * 0.55;
    var radius = size * 0.4;
    var lineWidth = size * 0.09;

    // วาด arc พื้นหลัง (สีเทาอ่อน)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, 2 * Math.PI, false);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
    ctx.lineCap = 'round';
    ctx.stroke();

    // วาด arc สี 3 ช่วง (green -> orange -> red)
    var startAngle = Math.PI;
    var endAngle = 2 * Math.PI;
    var totalArc = endAngle - startAngle;

    // Green segment (0-70%)
    var greenEnd = startAngle + totalArc * 0.7;
    var grad1 = ctx.createLinearGradient(cx - radius, cy, cx, cy - radius);
    grad1.addColorStop(0, '#22c55e');
    grad1.addColorStop(1, '#16a34a');
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, greenEnd, false);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = grad1;
    ctx.lineCap = 'butt';
    ctx.stroke();

    // Orange segment (70-90%)
    var orangeEnd = startAngle + totalArc * 0.9;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, greenEnd, orangeEnd, false);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineCap = 'butt';
    ctx.stroke();

    // Red segment (90-100%)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, orangeEnd, endAngle, false);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#ef4444';
    ctx.lineCap = 'round';
    ctx.stroke();

    // วาดเข็มชี้ (needle)
    var needleColor = isDark ? '#e2e8f0' : '#1e293b';
    var needlePct = Math.min(pct, 100) / 100;
    var needleAngle = startAngle + totalArc * needlePct;
    var needleLen = radius * 0.75;
    var nx = cx + needleLen * Math.cos(needleAngle);
    var ny = cy + needleLen * Math.sin(needleAngle);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.lineWidth = 3;
    ctx.strokeStyle = needleColor;
    ctx.lineCap = 'round';
    ctx.stroke();

    // วงกลมกลางเข็ม
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, 2 * Math.PI);
    ctx.fillStyle = needleColor;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
    ctx.fillStyle = isDark ? '#1e293b' : '#fff';
    ctx.fill();

    // ตัวเลข % ตรงกลาง
    var displayColor = pct >= 100 ? '#16a34a' : pct >= 90 ? '#f59e0b' : pct >= 70 ? '#16a34a' : '#dc2626';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = displayColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(pct.toFixed(0) + '%', cx, cy - 10);

    // ป้าย "Achievement"
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textBaseline = 'top';
    ctx.fillText('Achievement', cx, cy + 2);
  }

  // ---- KPI card HTML ----
  function kpiCard(iconClass, icon, label, value, unit) {
    return '<div class="sta-kpi-card">'
      + '<div class="sta-kpi-top">'
      + '  <div class="sta-kpi-icon-circle ' + iconClass + '">' + icon + '</div>'
      + '  <div class="sta-kpi-label">' + label + '</div>'
      + '</div>'
      + '<div class="sta-kpi-value">' + value + '</div>'
      + '<div class="sta-kpi-unit">' + unit + '</div>'
      + '</div>';
  }

  // ---- Channel status badge ----
  function chStatusBadge(pct) {
    if (pct >= 100) return '<span class="sta-status-badge sta-status-over">เกินเป้า</span>';
    if (pct >= 80) return '<span class="sta-status-badge sta-status-near">ใกล้เป้า</span>';
    return '<span class="sta-status-badge sta-status-under">ต่ำกว่าเป้า</span>';
  }

  // ---- Main render function ----
  var _staRetryCount = 0;
  window.renderSalesTargetAI = function () {
    var container = document.getElementById('salesTargetContent');
    if (!container) return;

    var D = window.buildSalesTargetData();
    if (!D) {
      container.innerHTML = '<p style="padding:24px;color:red">ไม่พบข้อมูล SALES_TARGET_DATA</p>';
      return;
    }

    // Wait for Supabase data if actuals are 0 and Supabase is still loading
    if (D.team.actual === 0 && _staRetryCount < 40) {
      var supaBadge = document.getElementById('supaLiveBadge');
      var supaStillLoading = supaBadge && supaBadge.textContent.indexOf('⏳') !== -1;
      if (supaStillLoading || _staRetryCount < 6) {
        _staRetryCount++;
        setTimeout(function() { window.renderSalesTargetAI(); }, 500);
        if (_staRetryCount === 1) {
          container.innerHTML = '<div style="padding:40px;text-align:center;color:var(--sta-text2)"><div style="font-size:2rem;margin-bottom:12px">⏳</div>กำลังโหลดข้อมูลจาก Supabase...</div>';
        }
        return;
      }
    }
    _staRetryCount = 0;

    clearGauge();

    var team = D.team;
    var period = D.period;
    var achievement = team.target ? ((team.actual / team.target) * 100) : 0;
    var gap = team.target - team.actual;
    var forecastAchv = team.target ? ((team.forecast / team.target) * 100) : 0;
    var forecastGap = team.target - team.forecast;
    var teamRisk = calcRisk(team.forecast, team.target);

    // Opportunity value total
    var oppTotal = 0;
    D.opportunities.forEach(function (o) { oppTotal += o.value; });

    var html = '';

    // ========== 1) Header ==========
    html += '<div class="sta-header">';
    html += '  <div class="sta-header-left">';
    html += '    <h2 class="sta-title">Sales Target Tracking AI</h2>';
    html += '    <p class="sta-subtitle">ติดตามเป้าหมาย วิเคราะห์ด้วย AI ขายได้ตามเป้า โตอย่างยั่งยืน</p>';
    html += '    <div class="sta-period-info">' + period.month + ' ' + period.year + ' • ผ่านมาแล้ว ' + period.daysPassed + '/' + period.totalDays + ' วัน</div>';
    html += '  </div>';
    html += '  <div class="sta-header-icon">';
    html += '    <span class="sta-header-robot">\u{1F916}</span>';
    html += '    <span class="sta-header-arrow">⬆️</span>';
    html += '  </div>';
    html += '</div>';

    // ========== 2) Four KPI Cards ==========
    html += '<div class="sta-kpi-row">';
    html += kpiCard('sta-icon-blue', '\u{1F3AF}', 'เป้าหมายเดือนนี้', fmtNum(team.target), 'บาท');
    html += kpiCard('sta-icon-green', '\u{1F4B0}', 'ยอดขายปัจจุบัน', fmtNum(team.actual), 'บาท');
    html += kpiCard('sta-icon-orange', '\u{1F4CA}', '% Achievement', achievement.toFixed(1) + '%', 'เทียบกับเป้า');
    html += kpiCard('sta-icon-purple', '\u{1F52E}', 'คาดการณ์สิ้นเดือน', fmtNum(team.forecast), 'บาท');
    html += '</div>';

    // ========== 3) Achievement Section (3 columns) ==========
    html += '<div class="sta-achv-section">';
    // Left: gap
    html += '  <div class="sta-achv-col sta-achv-gap">';
    html += '    <div class="sta-achv-label">ยอดขาดจากเป้า</div>';
    html += '    <div class="sta-achv-big sta-color-red">' + fmtNum(gap > 0 ? gap : 0) + '</div>';
    html += '    <div class="sta-achv-unit">บาท</div>';
    html += '  </div>';
    // Center: Donut chart
    html += '  <div class="sta-achv-col sta-achv-chart">';
    html += '    <canvas id="staGaugeChart"></canvas>';
    html += '    <div class="sta-achv-chart-label"></div>';
    html += '  </div>';
    // Right: Forecast + Risk
    html += '  <div class="sta-achv-col sta-achv-forecast">';
    html += '    <div class="sta-achv-label">Forecast Achievement</div>';
    html += '    <div class="sta-achv-big sta-color-purple">' + forecastAchv.toFixed(1) + '%</div>';
    html += '    <div class="sta-risk-label">ความเสี่ยง</div>';
    html += '    <span class="sta-risk-badge ' + riskClass(teamRisk) + '">' + teamRisk + ' Risk</span>';
    html += '  </div>';
    html += '</div>';

    // ========== 4) AI Insight Box ==========
    html += '<div class="sta-ai-insight">';
    html += '  <div class="sta-ai-insight-icon">\u{1F9E0}</div>';
    html += '  <div class="sta-ai-insight-content">';
    html += '    <div class="sta-ai-insight-label">AI Insight</div>';
    html += '    <div class="sta-ai-insight-body">';
    html += '      จากยอดขาย ' + period.daysPassed + ' วันแรก ทีมมีแนวโน้มทำได้ประมาณ <strong class="sta-highlight">' + (team.forecast / 1000000).toFixed(2) + ' ล้านบาท</strong>';
    html += '      หรือ <strong class="sta-highlight">' + forecastAchv.toFixed(1) + '%</strong> ของ Target ';
    html += '      ปัจจุบันยังขาดประมาณ <strong class="sta-highlight">' + fmtNum(forecastGap > 0 ? forecastGap : 0) + ' บาท</strong> ';
    html += '      หากต้องการถึงเป้า ควรเน้น Customer ที่มี Open Opportunity รวมประมาณ <strong class="sta-highlight">' + (oppTotal / 1000000).toFixed(1) + ' ล้านบาท</strong>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';

    // ========== Channel Performance (moved before Sales Performance) ==========
    html += renderChannelSection();

    // ========== 5) Sales Performance Table ==========
    html += '<div class="sta-table-section">';
    html += '  <div class="sta-table-header">';
    html += '    <h3>\u{1F4CA} Sales Performance</h3>';
    html += '  </div>';
    html += '  <div class="sta-table-wrap">';
    html += '  <table class="sta-table">';
    html += '    <thead><tr>';
    html += '      <th>Sales</th><th>Target (บาท)</th><th>Actual (บาท)</th><th>Achievement</th><th>Forecast</th><th>Risk</th>';
    html += '    </tr></thead>';
    html += '    <tbody>';

    D.salespeople.forEach(function (sp) {
      var achv = sp.target ? ((sp.actual / sp.target) * 100) : 0;
      var fPct = sp.target ? ((sp.forecast / sp.target) * 100) : 0;
      var risk = calcRisk(sp.forecast, sp.target);
      var actualClass = achv >= 90 ? 'sta-td-actual-good' : 'sta-td-actual-bad';
      html += '<tr>';
      html += '  <td class="sta-td-name"><span class="sta-avatar">' + sp.avatar + '</span> ' + sp.name + '</td>';
      html += '  <td class="sta-td-num">' + fmtNum(sp.target) + '</td>';
      html += '  <td class="' + actualClass + '">' + fmtNum(sp.actual) + '</td>';
      html += '  <td>';
      html += '    <div class="sta-progress-wrap">';
      html += '      <div class="sta-progress-bar ' + achvClass(achv) + '" style="width:' + Math.min(achv, 100) + '%"></div>';
      html += '    </div>';
      html += '    <span class="sta-progress-label">' + achv.toFixed(1) + '%</span>';
      html += '  </td>';
      html += '  <td class="sta-td-num">' + fPct.toFixed(1) + '%</td>';
      html += '  <td><span class="sta-risk-badge ' + riskClass(risk) + '">' + risk + '</span></td>';
      html += '</tr>';
    });

    html += '    </tbody>';
    html += '  </table>';
    html += '  </div>';
    html += '</div>';

    // ========== 6) Two-column section ==========
    html += '<div class="sta-two-col">';

    // Left: Top customers to focus
    html += '<div class="sta-col-card">';
    html += '  <h3 class="sta-col-title">\u{1F3C6} Top ลูกค้าที่ควรโฟกัส</h3>';
    html += '  <ul class="sta-rank-list">';
    D.topCustomersDecline.forEach(function (c) {
      html += '<li class="sta-rank-item">';
      html += '  <span class="sta-rank-num">' + c.rank + '</span>';
      html += '  <span class="sta-rank-name">' + c.name + '</span>';
      html += '  <span class="sta-rank-change">▼ ' + Math.abs(c.change) + '% ยอดลดลง</span>';
      html += '</li>';
    });
    html += '  </ul>';
    html += '</div>';

    // Right: Opportunities
    html += '<div class="sta-col-card">';
    html += '  <h3 class="sta-col-title">⚡ Opportunity ที่ควร Follow-up</h3>';
    html += '  <ul class="sta-rank-list">';
    D.opportunities.forEach(function (o, i) {
      html += '<li class="sta-rank-item">';
      html += '  <span class="sta-rank-num">' + (i + 1) + '</span>';
      html += '  <div class="sta-opp-detail">';
      html += '    <span class="sta-opp-name">' + o.name + '</span>';
      html += '    <span class="sta-opp-val">' + fmtNum(o.value) + ' บาท</span>';
      html += '    <div class="sta-opp-bar-wrap">';
      html += '      <div class="sta-opp-bar" style="width:' + o.probability + '%"></div>';
      html += '    </div>';
      html += '    <span class="sta-opp-prob">โอกาสสำเร็จ ' + o.probability + '%</span>';
      html += '  </div>';
      html += '</li>';
    });
    html += '  </ul>';
    html += '</div>';

    html += '</div>';

    // ========== 7) AI Recommendation Bar ==========
    html += '<div class="sta-recommend-bar">';
    html += '  <span class="sta-recommend-icon">\u{1F916}</span>';
    html += '  <div class="sta-recommend-text">';
    html += '    <strong>AI Recommendation</strong> — ';
    html += '    ควรเร่งติดตามลูกค้า ' + D.topCustomersDecline.length + ' รายนี้ และ Opportunity ' + D.opportunities.length + ' ราย ';
    html += '    มูลค่ารวม <strong>' + fmtNum(oppTotal) + ' บาท</strong> ';
    html += '    เพื่อเพิ่มโอกาสให้ถึงเป้าหมาย';
    html += '  </div>';
    html += '</div>';

    container.innerHTML = html;

    // Render chart after DOM is ready
    setTimeout(function () {
      buildGaugeChart('staGaugeChart', parseFloat(achievement.toFixed(1)));
    }, 100);
  };

  // ---- Render Channel Performance section — multi-dimensional ----
  function renderChannelSection() {
    var chNames = (typeof CH_NAMES !== 'undefined') ? CH_NAMES : null;
    var chMonthly = (typeof CHANNEL_MONTHLY !== 'undefined') ? CHANNEL_MONTHLY : null;
    var months = (typeof MONTHS !== 'undefined') ? MONTHS : null;
    var dailyActual = (typeof DAILY_ACTUAL !== 'undefined') ? DAILY_ACTUAL : null;
    var prevYearData = (typeof _D2568 !== 'undefined') ? _D2568 : null;

    if (!chNames || !chMonthly || !months) return '';

    var DA_KEY = {'Modern Trade':'MT','Amazon & Souvenir':'AMS','Booth':'Booth','Online':'Online'};
    var MONTH_ORDER = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    // find last month with actual data
    var lastDataMonth = null;
    for (var mi = months.length - 1; mi >= 0; mi--) {
      var md_c = chMonthly[months[mi]];
      if (md_c) {
        var hasData = false;
        chNames.forEach(function(c){ if ((md_c[c]||{}).a > 0) hasData = true; });
        if (hasData) { lastDataMonth = months[mi]; break; }
      }
    }
    var prevDataMonth = null;
    if (lastDataMonth) {
      var ldIdx = MONTH_ORDER.indexOf(lastDataMonth);
      for (var pi = ldIdx - 1; pi >= 0; pi--) {
        var pm = MONTH_ORDER[pi];
        var pmd = chMonthly[pm];
        if (pmd) {
          var pHas = false;
          chNames.forEach(function(c){ if ((pmd[c]||{}).a > 0) pHas = true; });
          if (pHas) { prevDataMonth = pm; break; }
        }
      }
    }

    function pctChange(cur, prev) { return prev > 0 ? ((cur - prev) / prev * 100) : 0; }
    function chgBadge(val) {
      if (val === null || isNaN(val)) return '<span style="color:#94a3b8">-</span>';
      var color = val > 0 ? '#16a34a' : val < 0 ? '#dc2626' : '#f59e0b';
      var arrow = val > 0 ? '▲' : val < 0 ? '▼' : '▸';
      return '<span style="color:' + color + ';font-weight:600">' + arrow + ' ' + Math.abs(val).toFixed(1) + '%</span>';
    }
    function fmtM(v) { return v >= 1e6 ? (v / 1e6).toFixed(2) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(0) + 'K' : v.toLocaleString(); }

    // Compute per-channel metrics
    var rows = [];
    chNames.forEach(function(c) {
      var daKey = DA_KEY[c] || c;
      var r = { name: c, daily: 0, dod: null, weekly: 0, wow: null, mtd: 0, mom: null, ytd: 0, yoy: null, ytdTarget: 0 };

      // YTD
      months.forEach(function(m) {
        var d = (chMonthly[m] || {})[c] || { t:0, a:0 };
        r.ytd += (d.a || 0);
        r.ytdTarget += (d.t || 0);
      });

      // MTD = current month actual
      if (lastDataMonth) {
        r.mtd = ((chMonthly[lastDataMonth] || {})[c] || {}).a || 0;
      }

      // MoM
      if (lastDataMonth && prevDataMonth) {
        var curMon = ((chMonthly[lastDataMonth] || {})[c] || {}).a || 0;
        var prevMon = ((chMonthly[prevDataMonth] || {})[c] || {}).a || 0;
        r.mom = pctChange(curMon, prevMon);
      }

      // Daily / DoD / Weekly / WoW from DAILY_ACTUAL
      if (dailyActual && lastDataMonth && dailyActual[lastDataMonth]) {
        var dArr = dailyActual[lastDataMonth][daKey] || dailyActual[lastDataMonth].all || [];
        // find last day with data
        var lastDay = -1;
        for (var di = dArr.length - 1; di >= 0; di--) {
          if (dArr[di] > 0) { lastDay = di; break; }
        }
        if (lastDay >= 0) {
          r.daily = dArr[lastDay];
          if (lastDay >= 1) {
            var prevDay = 0;
            for (var pd = lastDay - 1; pd >= 0; pd--) { if (dArr[pd] > 0) { prevDay = dArr[pd]; break; } }
            if (prevDay > 0) r.dod = pctChange(r.daily, prevDay);
          }
          // weekly: sum last 7 days with data vs previous 7 days
          var daysWithData = [];
          for (var wd = 0; wd < dArr.length; wd++) { if (dArr[wd] > 0) daysWithData.push(dArr[wd]); }
          if (daysWithData.length >= 7) {
            var thisWeek = 0, prevWeek = 0;
            for (var tw = daysWithData.length - 1; tw >= Math.max(0, daysWithData.length - 7); tw--) thisWeek += daysWithData[tw];
            r.weekly = thisWeek;
            if (daysWithData.length >= 14) {
              for (var pw = daysWithData.length - 8; pw >= Math.max(0, daysWithData.length - 14); pw--) prevWeek += daysWithData[pw];
              if (prevWeek > 0) r.wow = pctChange(thisWeek, prevWeek);
            }
          } else {
            for (var sw = 0; sw < daysWithData.length; sw++) r.weekly += daysWithData[sw];
          }
        }
      }

      // YoY from previous year data
      if (prevYearData && prevYearData.CHANNEL_MONTHLY && lastDataMonth) {
        var prevYM = (prevYearData.CHANNEL_MONTHLY[lastDataMonth] || {})[c];
        if (prevYM && prevYM.a > 0) {
          r.yoy = pctChange(r.mtd, prevYM.a);
        }
      }

      rows.push(r);
    });

    // Totals row
    var total = { name: 'รวมทั้งหมด', daily: 0, dod: null, weekly: 0, wow: null, mtd: 0, mom: null, ytd: 0, yoy: null, ytdTarget: 0 };
    var totalPrevMon = 0, totalCurMon = 0, totalPrevYr = 0;
    rows.forEach(function(r) {
      total.daily += r.daily; total.weekly += r.weekly;
      total.mtd += r.mtd; total.ytd += r.ytd; total.ytdTarget += r.ytdTarget;
    });
    if (lastDataMonth && prevDataMonth) {
      chNames.forEach(function(c) {
        totalCurMon += ((chMonthly[lastDataMonth]||{})[c]||{}).a || 0;
        totalPrevMon += ((chMonthly[prevDataMonth]||{})[c]||{}).a || 0;
      });
      if (totalPrevMon > 0) total.mom = pctChange(totalCurMon, totalPrevMon);
    }
    if (prevYearData && prevYearData.CHANNEL_MONTHLY && lastDataMonth) {
      chNames.forEach(function(c) {
        totalPrevYr += ((prevYearData.CHANNEL_MONTHLY[lastDataMonth]||{})[c]||{}).a || 0;
      });
      if (totalPrevYr > 0) total.yoy = pctChange(total.mtd, totalPrevYr);
    }
    // DoD / WoW for total
    if (dailyActual && lastDataMonth && dailyActual[lastDataMonth] && dailyActual[lastDataMonth].all) {
      var allArr = dailyActual[lastDataMonth].all;
      var allDays = [];
      for (var ai = 0; ai < allArr.length; ai++) { if (allArr[ai] > 0) allDays.push(allArr[ai]); }
      if (allDays.length >= 2) total.dod = pctChange(allDays[allDays.length-1], allDays[allDays.length-2]);
      if (allDays.length >= 14) {
        var tw2 = 0, pw2 = 0;
        for (var t2 = allDays.length-1; t2 >= allDays.length-7; t2--) tw2 += allDays[t2];
        for (var p2 = allDays.length-8; p2 >= allDays.length-14; p2--) pw2 += allDays[p2];
        if (pw2 > 0) total.wow = pctChange(tw2, pw2);
      }
    }

    // Build HTML
    var out = '<div class="sta-channel-section">';
    out += '<div class="sta-channel-divider">';
    out += '  <h3 class="sta-channel-divider-title">\u{1F4CA} ผลงานรายช่องทาง (Channel Performance)</h3>';
    out += '</div>';

    out += '<div class="sta-ch-card">';
    out += '<div style="overflow-x:auto;padding:0 16px 16px">';
    out += '<table class="sta-ch-table sta-ch-multi">';
    out += '<thead><tr>';
    out += '<th rowspan="2" style="min-width:110px">ช่องทาง</th>';
    out += '<th colspan="2" style="text-align:center;border-bottom:2px solid var(--sta-border)">รายวัน</th>';
    out += '<th colspan="2" style="text-align:center;border-bottom:2px solid var(--sta-border)">รายสัปดาห์</th>';
    out += '<th colspan="2" style="text-align:center;border-bottom:2px solid var(--sta-border)">MTD</th>';
    out += '<th colspan="3" style="text-align:center;border-bottom:2px solid var(--sta-border)">YTD</th>';
    out += '</tr><tr>';
    out += '<th style="text-align:right;font-size:0.72rem">ยอด</th><th style="text-align:center;font-size:0.72rem">DoD</th>';
    out += '<th style="text-align:right;font-size:0.72rem">ยอด</th><th style="text-align:center;font-size:0.72rem">WoW</th>';
    out += '<th style="text-align:right;font-size:0.72rem">ยอด</th><th style="text-align:center;font-size:0.72rem">MoM</th>';
    out += '<th style="text-align:right;font-size:0.72rem">ยอด</th><th style="text-align:center;font-size:0.72rem">YoY</th><th style="text-align:center;font-size:0.72rem">สถานะ</th>';
    out += '</tr></thead>';
    out += '<tbody>';

    function renderRow(r, isTotal) {
      var ytdPct = r.ytdTarget > 0 ? (r.ytd / r.ytdTarget * 100) : 0;
      var style = isTotal ? ' style="font-weight:700;background:var(--sta-surface2);border-top:2px solid var(--sta-border)"' : '';
      var h = '<tr' + style + '>';
      h += '<td style="font-weight:600;white-space:nowrap">' + r.name + '</td>';
      h += '<td style="text-align:right">' + fmtM(r.daily) + '</td>';
      h += '<td style="text-align:center">' + chgBadge(r.dod) + '</td>';
      h += '<td style="text-align:right">' + fmtM(r.weekly) + '</td>';
      h += '<td style="text-align:center">' + chgBadge(r.wow) + '</td>';
      h += '<td style="text-align:right">' + fmtM(r.mtd) + '</td>';
      h += '<td style="text-align:center">' + chgBadge(r.mom) + '</td>';
      h += '<td style="text-align:right">' + fmtM(r.ytd) + '</td>';
      h += '<td style="text-align:center">' + chgBadge(r.yoy) + '</td>';
      h += '<td style="text-align:center">' + chStatusBadge(ytdPct) + '</td>';
      h += '</tr>';
      return h;
    }

    rows.forEach(function(r) { out += renderRow(r, false); });
    out += renderRow(total, true);

    out += '</tbody></table>';
    out += '</div>'; // overflow-x
    out += '</div>'; // sta-ch-card
    out += '</div>'; // sta-channel-section

    return out;
  }

})();
