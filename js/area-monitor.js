// ============================================================
// AREA-MONITOR.JS — Sales Monitoring by Area
// แดชบอร์ดติดตามยอดขายรายเขต (9 เขต) พร้อม filter, KPI, charts, table
// Depends on: Chart.js (global)
// ============================================================

(function () {
  'use strict';

  // ---- State ----
  var _amData = null;        // cached JSON data
  var _amInited = false;     // prevent double init
  var _amCharts = {};        // chart instances for cleanup
  var _amSortCol = 'total';  // current sort column
  var _amSortAsc = false;    // sort ascending?
  var _amPage = 0;           // current page for table
  var _amPageSize = 50;      // rows per page
  var _amSearchTerm = '';    // search text for table
  var _amBranchNames = {};   // code -> name lookup

  var AREA_NAMES = [];
  var ALL_MONTH_LABELS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  var MONTH_LABELS = [];
  var MONTH_NUMS = [];

  // สีสำหรับแต่ละเขต (orange/brown theme)
  var AREA_COLORS = [
    '#C45C26', '#E07A3A', '#F4A261', '#D4813B', '#8B4513',
    '#A0522D', '#CD853F', '#DEB887', '#D2691E'
  ];

  // ---- Channel filter helper ----
  function _amFilterBranches(branches, channelVal) {
    if (!channelVal) return branches;
    return branches.filter(function (b) { return b.channel === channelVal; });
  }

  // ---- Number formatting ----
  function _amFmtNum(n) {
    if (n == null || isNaN(n)) return '0';
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toLocaleString('th-TH', { maximumFractionDigits: 0 });
  }

  function _amFmtBaht(n) {
    if (n == null || isNaN(n)) return '0';
    return n.toLocaleString('th-TH', { maximumFractionDigits: 0 });
  }

  function _amFmtPct(n) {
    if (n == null || isNaN(n)) return '0.0%';
    return (n * 100).toFixed(1) + '%';
  }

  // ---- Init ----
  window.areaMonitorInit = function () {
    if (_amInited && _amData) {
      areaMonitorRender();
      return;
    }
    Promise.all([
      fetch('data/area_monitoring.json').then(function (r) { return r.json(); }),
      fetch('data/branch_names.json').then(function (r) { return r.json(); }).catch(function () { return {}; })
    ])
      .then(function (results) {
        _amData = results[0];
        _amBranchNames = results[1] || {};
        AREA_NAMES = Object.keys(_amData).filter(function(k) { return k.charAt(0) !== '_'; });
        // Derive months from data dynamically
        var firstArea = _amData[AREA_NAMES[0]];
        if (firstArea && firstArea.months) {
          MONTH_NUMS = firstArea.months;
        } else {
          MONTH_NUMS = [1,2,3,4,5,6,7,8,9,10,11,12];
        }
        MONTH_LABELS = MONTH_NUMS.map(function(m) { return ALL_MONTH_LABELS[m - 1]; });
        _amInited = true;
        _amSetupFilters();
        _amSetupListeners();
        areaMonitorRender();
      })
      .catch(function (err) {
        console.error('area-monitor: failed to load data', err);
        var wrap = document.getElementById('amz-area-monitor');
        if (wrap) wrap.innerHTML = '<div class="card" style="padding:24px;color:#c00">โหลดข้อมูลไม่สำเร็จ: ' + err.message + '</div>';
      });
  };

  // ---- Setup dropdown options ----
  function _amSetupFilters() {
    var areaSel = document.getElementById('amAreaFilter');
    if (!areaSel) return;
    areaSel.innerHTML = '<option value="">ทุกเขต</option>';
    AREA_NAMES.forEach(function (name) {
      areaSel.innerHTML += '<option value="' + name + '">' + name + '</option>';
    });
    // Channel dropdown
    var channelSel = document.getElementById('amChannelFilter');
    if (channelSel) {
      var channels = _amData._channels || [];
      channelSel.innerHTML = '<option value="">ทุกช่องทาง</option>';
      channels.forEach(function (ch) {
        channelSel.innerHTML += '<option value="' + ch + '">' + ch + '</option>';
      });
    }
    _amPopulateBranchDropdown();
    var top10Sel = document.getElementById('amTop10AreaSel');
    if (top10Sel) {
      top10Sel.innerHTML = '<option value="">เลือกเขต...</option>';
      AREA_NAMES.forEach(function (name) {
        top10Sel.innerHTML += '<option value="' + name + '">' + name + '</option>';
      });
    }
  }

  var _amBranchCodes = [];

  function _amPopulateBranchDropdown(areaFilter) {
    var datalist = document.getElementById('amBranchDatalist');
    var input = document.getElementById('amBranchFilterInput');
    var hidden = document.getElementById('amBranchFilter');
    if (!datalist || !_amData) return;
    var prev = hidden ? hidden.value : '';
    _amBranchCodes = [];
    var areas = areaFilter ? [areaFilter] : AREA_NAMES;
    areas.forEach(function (name) {
      var area = _amData[name];
      if (!area) return;
      area.branches.forEach(function (b) {
        if (b.code && _amBranchCodes.indexOf(b.code) === -1) _amBranchCodes.push(b.code);
      });
    });
    _amBranchCodes.sort();
    var html = '';
    _amBranchCodes.forEach(function (c) {
      html += '<option value="' + c + '">';
    });
    datalist.innerHTML = html;
    if (input) input.placeholder = 'ทุกสาขา (' + _amBranchCodes.length + ')';
    if (prev && _amBranchCodes.indexOf(prev) !== -1) {
      if (hidden) hidden.value = prev;
      if (input) input.value = prev;
    } else {
      if (hidden) hidden.value = '';
      if (input) input.value = '';
    }
  }

  function _amSetupListeners() {
    var areaSel = document.getElementById('amAreaFilter');
    var monthSel = document.getElementById('amMonthFilter');
    var branchInput = document.getElementById('amBranchFilterInput');
    var branchHidden = document.getElementById('amBranchFilter');
    var searchInput = document.getElementById('amBranchSearch');

    if (areaSel) areaSel.addEventListener('change', function () {
      _amPage = 0;
      _amPopulateBranchDropdown(this.value);
      areaMonitorRender();
    });
    if (monthSel) monthSel.addEventListener('change', function () { _amPage = 0; areaMonitorRender(); });
    var channelSel = document.getElementById('amChannelFilter');
    if (channelSel) channelSel.addEventListener('change', function () { _amPage = 0; areaMonitorRender(); });
    if (branchInput) {
      branchInput.addEventListener('input', function () {
        var val = this.value.trim();
        if (val === '' || _amBranchCodes.indexOf(val) !== -1) {
          branchHidden.value = val;
          _amPage = 0;
          areaMonitorRender();
        }
      });
      branchInput.addEventListener('change', function () {
        var val = this.value.trim();
        if (_amBranchCodes.indexOf(val) !== -1) {
          branchHidden.value = val;
        } else if (val === '') {
          branchHidden.value = '';
        } else {
          this.value = '';
          branchHidden.value = '';
        }
        _amPage = 0;
        areaMonitorRender();
      });
    }
    if (searchInput) searchInput.addEventListener('input', function () {
      _amSearchTerm = this.value.trim().toLowerCase();
      _amPage = 0;
      _amRenderTable(_amGetFilteredData());
    });
    var top10Sel = document.getElementById('amTop10AreaSel');
    if (top10Sel) top10Sel.addEventListener('change', function () {
      _amRenderTop10(_amGetFilteredData());
    });
  }

  // ---- Get filtered data ----
  function _amGetFilteredData() {
    if (!_amData) return null;
    var areaSel = document.getElementById('amAreaFilter');
    var monthSel = document.getElementById('amMonthFilter');
    var branchSel = document.getElementById('amBranchFilter');
    var channelSel = document.getElementById('amChannelFilter');
    var areaVal = areaSel ? areaSel.value : '';
    var monthVal = monthSel ? monthSel.value : '';
    var branchVal = branchSel ? branchSel.value : '';
    var channelVal = channelSel ? channelSel.value : '';

    return {
      area: areaVal,
      month: monthVal,
      branch: branchVal,
      channel: channelVal,
      areas: areaVal ? [areaVal] : AREA_NAMES,
      monthNum: monthVal ? parseInt(monthVal) : 0
    };
  }

  // ---- Main render ----
  window.areaMonitorRender = function () {
    if (!_amData) return;
    var f = _amGetFilteredData();
    _amRenderKPI(f);
    _amRenderAreaChart(f);
    _amRenderDoughnutChart(f);
    _amRenderTrendChart(f);
    _amRenderGrowthChart(f);
    _amRenderTop20(f);
    _amRenderTop10(f);
    _amRenderTable(f);
  };

  // ---- KPI Cards ----
  function _amRenderKPI(f) {
    var totalRevenue = 0;
    var totalBranches = 0;
    var growthSum = 0;
    var growthCount = 0;
    var netCustTotal = 0;

    f.areas.forEach(function (areaName) {
      var area = _amData[areaName];
      if (!area) return;
      var filtered = _amFilterBranches(area.branches, f.channel);

      // Revenue — sum from filtered branches when channel is set
      if (f.channel) {
        filtered.forEach(function (b) {
          if (f.monthNum) { totalRevenue += (b[String(f.monthNum)] || 0); }
          else { totalRevenue += (b.total || 0); }
        });
      } else {
        if (f.monthNum) { totalRevenue += (area.grandTotal[f.monthNum] || 0); }
        else { totalRevenue += (area.grandTotal.total || 0); }
      }

      // Branch count
      totalBranches += filtered.length;

      // Growth average
      filtered.forEach(function (b) {
        if (b.growthMOM != null && !isNaN(b.growthMOM)) {
          growthSum += b.growthMOM;
          growthCount++;
        }
      });

      // Net customer growth
      if (!f.channel && area.customerGrowth) {
        area.customerGrowth.forEach(function (cg) {
          if (f.monthNum) {
            if (cg.month === 'เดือน ' + f.monthNum) { netCustTotal += (cg.netGrowth || 0); }
          } else {
            if (cg.month === 'Total') { netCustTotal += (cg.netGrowth || 0); }
          }
        });
      }
    });

    var avgGrowth = growthCount ? growthSum / growthCount : 0;

    var kpiEl = document.getElementById('amKpiCards');
    if (!kpiEl) return;

    kpiEl.innerHTML =
      '<div class="am-kpi-card">' +
        '<div class="am-kpi-icon" style="background:#FFF3E6;color:#C45C26">&#3647;</div>' +
        '<div class="am-kpi-body"><div class="am-kpi-label">Revenue รวม</div>' +
        '<div class="am-kpi-value">' + _amFmtNum(totalRevenue) + '</div></div></div>' +

      '<div class="am-kpi-card">' +
        '<div class="am-kpi-icon" style="background:#E8F5E9;color:#388E3C">&#127970;</div>' +
        '<div class="am-kpi-body"><div class="am-kpi-label">จำนวนสาขา</div>' +
        '<div class="am-kpi-value">' + _amFmtBaht(totalBranches) + '</div></div></div>' +

      '<div class="am-kpi-card">' +
        '<div class="am-kpi-icon" style="background:#E3F2FD;color:#1565C0">&#128200;</div>' +
        '<div class="am-kpi-body"><div class="am-kpi-label">Growth เฉลี่ย</div>' +
        '<div class="am-kpi-value" style="color:' + (avgGrowth >= 0 ? '#388E3C' : '#C62828') + '">' + _amFmtPct(avgGrowth) + '</div></div></div>' +

      '<div class="am-kpi-card">' +
        '<div class="am-kpi-icon" style="background:#FFF8E1;color:#F9A825">&#128101;</div>' +
        '<div class="am-kpi-body"><div class="am-kpi-label">ลูกค้าใหม่สุทธิ</div>' +
        '<div class="am-kpi-value" style="color:' + (netCustTotal >= 0 ? '#388E3C' : '#C62828') + '">' + (netCustTotal >= 0 ? '+' : '') + netCustTotal + '</div></div></div>';
  }

  // ---- Area Revenue Bar Chart (Horizontal) ----
  function _amRenderAreaChart(f) {
    var canvas = document.getElementById('amAreaBarChart');
    if (!canvas) return;
    if (_amCharts.areaBar) { _amCharts.areaBar.destroy(); _amCharts.areaBar = null; }

    var labels = [];
    var values = [];
    AREA_NAMES.forEach(function (name, idx) {
      var area = _amData[name];
      if (!area) return;
      var filtered = _amFilterBranches(area.branches, f.channel);
      var val = 0;
      if (f.channel) {
        filtered.forEach(function (b) { val += f.monthNum ? (b[String(f.monthNum)] || 0) : (b.total || 0); });
      } else {
        val = f.monthNum ? (area.grandTotal[f.monthNum] || 0) : (area.grandTotal.total || 0);
      }
      labels.push(name);
      values.push(val);
    });

    // Sort descending by value
    var sorted = labels.map(function (l, i) { return { label: l, value: values[i], color: AREA_COLORS[i % AREA_COLORS.length] }; });
    sorted.sort(function (a, b) { return b.value - a.value; });

    _amCharts.areaBar = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: sorted.map(function (s) { return s.label; }),
        datasets: [{
          label: 'Revenue (บาท)',
          data: sorted.map(function (s) { return s.value; }),
          backgroundColor: sorted.map(function (s) { return s.color; }),
          borderRadius: 6,
          barThickness: 22
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) { return _amFmtBaht(ctx.parsed.x) + ' บาท'; }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              callback: function (v) { return _amFmtNum(v); },
              font: { size: 11 }
            },
            grid: { color: 'rgba(0,0,0,0.06)' }
          },
          y: {
            ticks: { font: { size: 11 } },
            grid: { display: false }
          }
        }
      }
    });
  }

  // ---- Monthly Trend Line Chart ----
  function _amRenderTrendChart(f) {
    var canvas = document.getElementById('amTrendLineChart');
    if (!canvas) return;
    if (_amCharts.trend) { _amCharts.trend.destroy(); _amCharts.trend = null; }

    var datasets = [];

    function _sumByMonth(branches, m) {
      var s = 0; branches.forEach(function (b) { s += (b[String(m)] || 0); }); return s;
    }

    if (f.area) {
      var area = _amData[f.area];
      if (!area) return;
      var filtered = _amFilterBranches(area.branches, f.channel);
      var mData = f.channel
        ? MONTH_NUMS.map(function (m) { return _sumByMonth(filtered, m); })
        : MONTH_NUMS.map(function (m) { return area.grandTotal[m] || 0; });
      datasets.push({
        label: f.area,
        data: mData,
        borderColor: '#C45C26',
        backgroundColor: 'rgba(196,92,38,0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        borderWidth: 2
      });
    } else {
      AREA_NAMES.forEach(function (name, idx) {
        var area = _amData[name];
        if (!area) return;
        var filtered = _amFilterBranches(area.branches, f.channel);
        var mData = f.channel
          ? MONTH_NUMS.map(function (m) { return _sumByMonth(filtered, m); })
          : MONTH_NUMS.map(function (m) { return area.grandTotal[m] || 0; });
        datasets.push({
          label: name,
          data: mData,
          borderColor: AREA_COLORS[idx % AREA_COLORS.length],
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 3,
          borderWidth: 2
        });
      });
    }

    _amCharts.trend = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: { labels: MONTH_LABELS, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 12 } },
          tooltip: {
            callbacks: {
              label: function (ctx) { return ctx.dataset.label + ': ' + _amFmtBaht(ctx.parsed.y) + ' บาท'; }
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: function (v) { return _amFmtNum(v); },
              font: { size: 11 }
            },
            grid: { color: 'rgba(0,0,0,0.06)' }
          },
          x: {
            ticks: { font: { size: 11 } },
            grid: { display: false }
          }
        }
      }
    });
  }

  // ---- Customer Growth Grouped Bar Chart ----
  function _amRenderGrowthChart(f) {
    var canvas = document.getElementById('amGrowthBarChart');
    if (!canvas) return;
    if (_amCharts.growth) { _amCharts.growth.destroy(); _amCharts.growth = null; }

    // รวมข้อมูล customer growth ตาม month label
    var monthMap = {}; // "เดือน 2" -> { newCust, lostCust, netGrowth }

    f.areas.forEach(function (areaName) {
      var area = _amData[areaName];
      if (!area || !area.customerGrowth) return;
      area.customerGrowth.forEach(function (cg) {
        if (cg.month === 'Total') return;
        if (!monthMap[cg.month]) monthMap[cg.month] = { newCust: 0, lostCust: 0, netGrowth: 0 };
        monthMap[cg.month].newCust += (cg.newCust || 0);
        monthMap[cg.month].lostCust += (cg.lostCust || 0);
        monthMap[cg.month].netGrowth += (cg.netGrowth || 0);
      });
    });

    // Sort months
    var sortedMonths = Object.keys(monthMap).sort(function (a, b) {
      var na = parseInt(a.replace(/\D/g, '')) || 0;
      var nb = parseInt(b.replace(/\D/g, '')) || 0;
      return na - nb;
    });

    _amCharts.growth = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: sortedMonths,
        datasets: [
          {
            label: 'ลูกค้าใหม่',
            data: sortedMonths.map(function (m) { return monthMap[m].newCust; }),
            backgroundColor: '#4CAF50',
            borderRadius: 4
          },
          {
            label: 'ลูกค้าหาย',
            data: sortedMonths.map(function (m) { return monthMap[m].lostCust; }),
            backgroundColor: '#EF5350',
            borderRadius: 4
          },
          {
            label: 'สุทธิ',
            data: sortedMonths.map(function (m) { return monthMap[m].netGrowth; }),
            backgroundColor: '#FF9800',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } }
        },
        scales: {
          y: {
            ticks: { font: { size: 11 } },
            grid: { color: 'rgba(0,0,0,0.06)' }
          },
          x: {
            ticks: { font: { size: 11 } },
            grid: { display: false }
          }
        }
      }
    });
  }

  // ---- Doughnut Chart: สัดส่วนเขต ----
  function _amRenderDoughnutChart(f) {
    var canvas = document.getElementById('amAreaDoughnutChart');
    if (!canvas) return;
    if (_amCharts.doughnut) { _amCharts.doughnut.destroy(); _amCharts.doughnut = null; }

    var labels = [];
    var values = [];
    AREA_NAMES.forEach(function (name, idx) {
      var area = _amData[name];
      if (!area) return;
      var filtered = _amFilterBranches(area.branches, f.channel);
      var val = 0;
      if (f.channel) {
        filtered.forEach(function (b) { val += f.monthNum ? (b[String(f.monthNum)] || 0) : (b.total || 0); });
      } else {
        val = f.monthNum ? (area.grandTotal[f.monthNum] || 0) : (area.grandTotal.total || 0);
      }
      labels.push(name);
      values.push(val);
    });

    var total = values.reduce(function (s, v) { return s + v; }, 0);

    _amCharts.doughnut = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: AREA_COLORS,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '55%',
        plugins: {
          legend: {
            position: 'right',
            labels: { font: { size: 11 }, padding: 8, usePointStyle: true, pointStyle: 'circle' }
          },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                var pct = total ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
                return ctx.label + ': ' + _amFmtBaht(ctx.parsed) + ' (' + pct + '%)';
              }
            }
          }
        }
      }
    });
  }

  // ---- Helper: get all branches sorted by revenue ----
  function _amGetSortedBranches(f) {
    var rows = [];
    f.areas.forEach(function (areaName) {
      var area = _amData[areaName];
      if (!area) return;
      _amFilterBranches(area.branches, f.channel).forEach(function (b) {
        var rev = f.monthNum ? (b[String(f.monthNum)] || 0) : (b.total || 0);
        rows.push({ area: areaName, code: b.code || '', revenue: rev, growth: b.growthMOM });
      });
    });
    rows.sort(function (a, b) { return b.revenue - a.revenue; });
    return rows;
  }

  // ---- Render ranking table HTML ----
  function _amCalcPerformance(r) {
    // เปรียบเทียบ 3 เดือนแรก vs 3 เดือนหลังสุดที่มีข้อมูล (dynamic)
    var n = MONTH_NUMS.length;
    var earlyNums = MONTH_NUMS.slice(0, Math.min(3, n));
    var lateNums = MONTH_NUMS.slice(Math.max(0, n - 3));
    var early = earlyNums.map(function(m){ return r['m' + m] || 0; }).filter(function(v){ return v > 0; });
    var late  = lateNums.map(function(m){ return r['m' + m] || 0; }).filter(function(v){ return v > 0; });
    if (early.length === 0 || late.length === 0) return { label: '-', color: '#94a3b8', icon: '', pct: 0, cls: 'neutral' };
    var avgE = early.reduce(function(a,b){ return a+b; },0) / early.length;
    var avgL = late.reduce(function(a,b){ return a+b; },0) / late.length;
    var pct = avgE > 0 ? ((avgL - avgE) / avgE) : 0;
    if (pct > 0.05) return { label: 'ขาขึ้น', color: '#16a34a', icon: '▲', pct: pct, cls: 'up' };
    if (pct < -0.05) return { label: 'ขาลง', color: '#dc2626', icon: '▼', pct: pct, cls: 'down' };
    return { label: 'คงที่', color: '#d97706', icon: '►', pct: pct, cls: 'stable' };
  }

  function _amPerfBadge(perf) {
    var bg = perf.cls === 'up' ? '#dcfce7' : perf.cls === 'down' ? '#fee2e2' : perf.cls === 'stable' ? '#fef9c3' : '#f1f5f9';
    if (perf.label === '-') return '<span style="color:#94a3b8">-</span>';
    return '<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:600;background:' + bg + ';color:' + perf.color + '">' +
      perf.icon + ' ' + perf.label +
      '<span style="font-weight:400;font-size:10px;opacity:0.8">(' + (perf.pct >= 0 ? '+' : '') + (perf.pct * 100).toFixed(1) + '%)</span>' +
      '</span>';
  }

  function _amRankingTableHTML(rows, showRank) {
    var html = '<table class="am-table"><thead><tr>';
    if (showRank) html += '<th style="width:40px;text-align:center">#</th>';
    html += '<th>เขต</th><th>รหัสสาขา</th><th>ชื่อสาขา</th>';
    if (MONTH_LABELS) {
      MONTH_LABELS.forEach(function (ml) { html += '<th class="am-th-num">' + ml + '</th>'; });
    }
    html += '<th class="am-th-num" style="font-weight:700">รวม</th>';
    html += '<th class="am-th-num">GROWTH%</th>';
    html += '<th class="am-th-num">Performance</th>';
    html += '<th style="width:40px"></th></tr></thead><tbody>';

    if (rows.length === 0) {
      var cols = (showRank ? 5 : 4) + MONTH_NUMS.length + 3;
      html += '<tr><td colspan="' + cols + '" style="text-align:center;color:#94a3b8;padding:20px">เลือกเขตเพื่อแสดงข้อมูล</td></tr>';
    } else {
      rows.forEach(function (r, idx) {
        var stripe = idx % 2 === 0 ? '' : ' style="background:rgba(0,0,0,0.02)"';
        var gColor = (r.growth >= 0) ? '#388E3C' : '#C62828';
        var bName = _amBranchNames[r.code] || '-';
        var perf = _amCalcPerformance(r);
        html += '<tr' + stripe + ' style="cursor:pointer;' + (idx % 2 !== 0 ? 'background:rgba(0,0,0,0.02)' : '') + '" onmouseover="this.style.background=\'#fff7ed\'" onmouseout="this.style.background=\'' + (idx % 2 !== 0 ? 'rgba(0,0,0,0.02)' : '') + '\'" onclick="amShowPerfDetail(\'' + r.area.replace(/'/g, "\\'") + '\',\'' + r.code + '\')">';
        if (showRank) html += '<td style="text-align:center;font-weight:700;color:#C45C26">' + (idx + 1) + '</td>';
        html += '<td>' + r.area + '</td>';
        html += '<td style="font-weight:600">' + r.code + '</td>';
        html += '<td style="font-size:11px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + bName + '</td>';
        MONTH_NUMS.forEach(function (mi) {
          html += '<td class="am-td-num">' + _amFmtBaht(r['m' + mi] || 0) + '</td>';
        });
        html += '<td class="am-td-num" style="font-weight:700">' + _amFmtBaht(r.revenue) + '</td>';
        html += '<td class="am-td-num" style="color:' + gColor + ';font-weight:600">' + _amFmtPct(r.growth) + '</td>';
        html += '<td class="am-td-num">' + _amPerfBadge(perf) + '</td>';
        html += '<td style="text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:#f1f5f9;color:#3b82f6;font-size:14px;transition:background .15s" onmouseover="this.style.background=\'#dbeafe\'" onmouseout="this.style.background=\'#f1f5f9\'">&#128269;</span></td>';
        html += '</tr>';
      });
    }
    html += '</tbody></table>';
    return html;
  }

  // ---- Top 20 ทุกเส้นทาง ----
  function _amRenderTop20(f) {
    var wrap = document.getElementById('amTop20TableWrap');
    if (!wrap) return;

    var rows = [];
    f.areas.forEach(function (areaName) {
      var area = _amData[areaName];
      if (!area) return;
      _amFilterBranches(area.branches, f.channel).forEach(function (b) {
        var rev = f.monthNum ? (b[String(f.monthNum)] || 0) : (b.total || 0);
        var row = { area: areaName, code: b.code || '', revenue: rev, growth: b.growthMOM };
        MONTH_NUMS.forEach(function (mi) { row['m' + mi] = b[String(mi)] || 0; });
        rows.push(row);
      });
    });
    rows.sort(function (a, b) { return b.revenue - a.revenue; });
    wrap.innerHTML = _amRankingTableHTML(rows.slice(0, 20), true);
  }

  // ---- Top 10 แต่ละเขต ----
  function _amRenderTop10(f) {
    var wrap = document.getElementById('amTop10TableWrap');
    if (!wrap) return;

    var top10Sel = document.getElementById('amTop10AreaSel');
    var selectedArea = top10Sel ? top10Sel.value : '';
    if (!selectedArea) {
      wrap.innerHTML = '<div style="text-align:center;color:#94a3b8;padding:24px;font-size:13px">กรุณาเลือกเขตเพื่อแสดง Top 20</div>';
      return;
    }

    var area = _amData[selectedArea];
    if (!area) { wrap.innerHTML = ''; return; }

    var rows = [];
    _amFilterBranches(area.branches, f.channel).forEach(function (b) {
      var rev = f.monthNum ? (b[String(f.monthNum)] || 0) : (b.total || 0);
      var row = { area: selectedArea, code: b.code || '', revenue: rev, growth: b.growthMOM };
      MONTH_NUMS.forEach(function (mi) { row['m' + mi] = b[String(mi)] || 0; });
      rows.push(row);
    });
    rows.sort(function (a, b) { return b.revenue - a.revenue; });
    wrap.innerHTML = _amRankingTableHTML(rows.slice(0, 20), true);
  }

  // ---- Branch Table ----
  function _amRenderTable(f) {
    var tableWrap = document.getElementById('amBranchTableWrap');
    if (!tableWrap) return;

    // รวม branches จากเขตที่เลือก พร้อมใส่ชื่อเขต
    var rows = [];
    f.areas.forEach(function (areaName) {
      var area = _amData[areaName];
      if (!area) return;
      _amFilterBranches(area.branches, f.channel).forEach(function (b) {
        var row = {
          area: areaName,
          code: b.code || '',
          name: _amBranchNames[b.code] || '-',
          total: b.total || 0,
          growth: b.growthMOM
        };
        MONTH_NUMS.forEach(function (mi) { row['m' + mi] = b[String(mi)] || 0; });
        rows.push(row);
      });
    });

    // Branch dropdown filter
    if (f.branch) {
      rows = rows.filter(function (r) { return r.code === f.branch; });
    }

    // Search filter
    if (_amSearchTerm) {
      rows = rows.filter(function (r) {
        var bName = (_amBranchNames[r.code] || '').toLowerCase();
        return r.code.toLowerCase().indexOf(_amSearchTerm) !== -1 ||
               r.area.toLowerCase().indexOf(_amSearchTerm) !== -1 ||
               bName.indexOf(_amSearchTerm) !== -1;
      });
    }

    // Sort
    rows.sort(function (a, b) {
      var va = a[_amSortCol], vb = b[_amSortCol];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return _amSortAsc ? -1 : 1;
      if (va > vb) return _amSortAsc ? 1 : -1;
      return 0;
    });

    var totalRows = rows.length;
    var totalPages = Math.ceil(totalRows / _amPageSize) || 1;
    if (_amPage >= totalPages) _amPage = totalPages - 1;
    if (_amPage < 0) _amPage = 0;
    var start = _amPage * _amPageSize;
    var pageRows = rows.slice(start, start + _amPageSize);

    var sortIcon = function (col) {
      if (_amSortCol !== col) return ' <span style="opacity:0.3">&#9650;</span>';
      return _amSortAsc ? ' <span style="color:#C45C26">&#9650;</span>' : ' <span style="color:#C45C26">&#9660;</span>';
    };

    var html = '<table class="am-table">';
    html += '<thead><tr>';
    html += '<th class="am-th-sort" data-col="area">เขต' + sortIcon('area') + '</th>';
    html += '<th class="am-th-sort" data-col="code">รหัสสาขา' + sortIcon('code') + '</th>';
    html += '<th class="am-th-sort" data-col="name">ชื่อสาขา' + sortIcon('name') + '</th>';
    MONTH_LABELS.forEach(function (ml, i) {
      html += '<th class="am-th-sort am-th-num" data-col="m' + (i + 1) + '">' + ml + sortIcon('m' + (i + 1)) + '</th>';
    });
    html += '<th class="am-th-sort am-th-num" data-col="total">รวม' + sortIcon('total') + '</th>';
    html += '<th class="am-th-sort am-th-num" data-col="growth">Growth MOM%' + sortIcon('growth') + '</th>';
    html += '<th class="am-th-num">Performance</th>';
    html += '<th style="width:40px"></th>';
    html += '</tr></thead>';

    html += '<tbody>';
    if (pageRows.length === 0) {
      html += '<tr><td colspan="' + (4 + MONTH_NUMS.length + 3) + '" style="text-align:center;color:#94a3b8;padding:24px">ไม่พบข้อมูล</td></tr>';
    } else {
      pageRows.forEach(function (r, idx) {
        var stripe = idx % 2 === 0 ? '' : ' class="am-row-alt"';
        var gColor = (r.growth >= 0) ? '#388E3C' : '#C62828';
        var perf = _amCalcPerformance(r);
        html += '<tr' + stripe + ' onclick="amShowPerfDetail(\'' + r.area.replace(/'/g, "\\'") + '\',\'' + r.code + '\')" style="cursor:pointer" onmouseover="this.style.background=\'#fff7ed\'" onmouseout="this.style.background=\'' + (idx % 2 !== 0 ? 'rgba(0,0,0,0.02)' : '') + '\'">';
        html += '<td>' + r.area + '</td>';
        html += '<td style="font-weight:600">' + r.code + '</td>';
        html += '<td style="font-size:11px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + r.name + '</td>';
        MONTH_NUMS.forEach(function (mi) {
          html += '<td class="am-td-num">' + _amFmtBaht(r['m' + mi]) + '</td>';
        });
        html += '<td class="am-td-num" style="font-weight:700">' + _amFmtBaht(r.total) + '</td>';
        html += '<td class="am-td-num" style="color:' + gColor + ';font-weight:600">' + _amFmtPct(r.growth) + '</td>';
        html += '<td class="am-td-num">' + _amPerfBadge(perf) + '</td>';
        html += '<td style="text-align:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:#f1f5f9;color:#3b82f6;font-size:14px;transition:background .15s" onmouseover="this.style.background=\'#dbeafe\'" onmouseout="this.style.background=\'#f1f5f9\'">&#128269;</span></td>';
        html += '</tr>';
      });
    }
    html += '</tbody></table>';

    // Pagination
    html += '<div class="am-pagination">';
    html += '<span style="font-size:12px;color:#64748b">แสดง ' + (start + 1) + '-' + Math.min(start + _amPageSize, totalRows) + ' จาก ' + totalRows + ' สาขา</span>';
    html += '<div style="display:flex;gap:4px">';
    html += '<button class="am-page-btn" onclick="amTablePage(\'prev\')"' + (_amPage === 0 ? ' disabled' : '') + '>&laquo; ก่อนหน้า</button>';
    // Page numbers (max 5 around current)
    var pStart = Math.max(0, _amPage - 2);
    var pEnd = Math.min(totalPages, pStart + 5);
    for (var p = pStart; p < pEnd; p++) {
      html += '<button class="am-page-btn' + (p === _amPage ? ' am-page-active' : '') + '" onclick="amTablePage(' + p + ')">' + (p + 1) + '</button>';
    }
    html += '<button class="am-page-btn" onclick="amTablePage(\'next\')"' + (_amPage >= totalPages - 1 ? ' disabled' : '') + '>ถัดไป &raquo;</button>';
    html += '</div></div>';

    tableWrap.innerHTML = html;

    // Attach sort click handlers
    tableWrap.querySelectorAll('.am-th-sort').forEach(function (th) {
      th.style.cursor = 'pointer';
      th.addEventListener('click', function () {
        var col = this.getAttribute('data-col');
        if (_amSortCol === col) {
          _amSortAsc = !_amSortAsc;
        } else {
          _amSortCol = col;
          _amSortAsc = true;
        }
        _amRenderTable(_amGetFilteredData());
      });
    });
  }

  // ---- Pagination handler ----
  window.amTablePage = function (action) {
    if (!_amData) return;
    var f = _amGetFilteredData();
    var allBranches = 0;
    f.areas.forEach(function (areaName) {
      var area = _amData[areaName];
      if (area) allBranches += _amFilterBranches(area.branches, f.channel).length;
    });
    var totalPages = Math.ceil(allBranches / _amPageSize) || 1;

    if (action === 'prev') {
      _amPage = Math.max(0, _amPage - 1);
    } else if (action === 'next') {
      _amPage = Math.min(totalPages - 1, _amPage + 1);
    } else {
      _amPage = parseInt(action) || 0;
    }
    _amRenderTable(f);
  };

  // ---- Performance Detail Modal ----
  var _amPerfChart = null;

  window.amShowPerfDetail = function (areaName, code) {
    if (!_amData || !_amData[areaName]) return;
    var area = _amData[areaName];
    var branch = null;
    area.branches.forEach(function (b) { if (b.code === code) branch = b; });
    if (!branch) return;

    var bName = _amBranchNames[code] || code;
    var months = [];
    var salesData = [];
    var totalSales = 0;
    var bestMonth = { label: '-', val: 0 };
    MONTH_NUMS.forEach(function (mi) {
      var val = branch[String(mi)] || 0;
      months.push(ALL_MONTH_LABELS[mi - 1]);
      salesData.push(val);
      totalSales += val;
      if (val > bestMonth.val) { bestMonth = { label: ALL_MONTH_LABELS[mi - 1], val: val }; }
    });
    var avgMonth = months.length > 0 ? Math.round(totalSales / months.length) : 0;
    var perfObj = {};
    MONTH_NUMS.forEach(function (mi) { perfObj['m' + mi] = branch[String(mi)] || 0; });
    var perf = _amCalcPerformance(perfObj);

    // MoM table rows
    var momRows = '';
    for (var i = 0; i < months.length; i++) {
      var momPct = '';
      var momColor = '#94a3b8';
      if (i > 0 && salesData[i - 1] > 0) {
        var chg = ((salesData[i] - salesData[i - 1]) / salesData[i - 1]) * 100;
        momPct = (chg >= 0 ? '+' : '') + chg.toFixed(1) + '%';
        momColor = chg >= 0 ? '#16a34a' : '#dc2626';
      } else {
        momPct = '—';
      }
      momRows += '<tr>' +
        '<td style="font-weight:600;padding:10px 16px">' + months[i] + '</td>' +
        '<td style="text-align:right;padding:10px 16px">' + _amFmtBaht(salesData[i]) + '</td>' +
        '<td style="text-align:right;padding:10px 16px;color:' + momColor + ';font-weight:600">' + momPct + '</td>' +
        '</tr>';
    }

    var perfBg = perf.cls === 'up' ? '#dcfce7' : perf.cls === 'down' ? '#fee2e2' : '#fef9c3';

    var html = '<div id="amPerfOverlay" onclick="amClosePerfDetail()" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px">' +
      '<div onclick="event.stopPropagation()" style="background:#fff;border-radius:16px;max-width:680px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)">' +

      // Header
      '<div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between">' +
        '<div>' +
          '<div style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">📊 Customer Performance</div>' +
          '<div style="font-size:18px;font-weight:700;color:#1e293b;margin-top:2px">' + bName + '</div>' +
          '<div style="font-size:12px;color:#64748b">' + areaName + ' · ' + code + '</div>' +
        '</div>' +
        '<button onclick="amClosePerfDetail()" style="background:none;border:none;font-size:24px;cursor:pointer;color:#94a3b8;padding:4px 8px;line-height:1">&times;</button>' +
      '</div>' +

      // KPI Cards
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:20px 24px">' +
        '<div style="text-align:center"><div style="font-size:20px;font-weight:700;color:#2563eb">' + _amFmtNum(totalSales) + '</div><div style="font-size:11px;color:#94a3b8">ยอดขายรวม (บาท)</div></div>' +
        '<div style="text-align:center"><div style="font-size:20px;font-weight:700;color:#1e293b">' + _amFmtBaht(avgMonth) + '</div><div style="font-size:11px;color:#94a3b8">เฉลี่ย/เดือน (บาท)</div></div>' +
        '<div style="text-align:center"><div style="font-size:20px;font-weight:700;color:#16a34a">' + bestMonth.label + '</div><div style="font-size:11px;color:#94a3b8">เดือนขายดีสุด</div></div>' +
        '<div style="text-align:center"><div style="display:inline-block;padding:4px 10px;border-radius:6px;font-size:14px;font-weight:700;background:' + perfBg + ';color:' + perf.color + '">' + perf.icon + ' ' + (perf.pct >= 0 ? '+' : '') + (perf.pct * 100).toFixed(1) + '%</div><div style="font-size:11px;color:#94a3b8;margin-top:4px">' + perf.label + '</div></div>' +
      '</div>' +

      // Chart
      '<div style="padding:0 24px 16px"><div style="background:#f8fafc;border-radius:12px;padding:16px"><canvas id="amPerfChart" height="200"></canvas></div></div>' +

      // Summary
      '<div style="display:flex;justify-content:center;gap:40px;padding:8px 24px 16px">' +
        '<div style="text-align:center"><div style="font-size:18px;font-weight:700;color:#1e293b">' + _amFmtBaht(avgMonth) + '</div><div style="font-size:11px;color:#94a3b8">เฉลี่ย/เดือน (บาท)</div></div>' +
        '<div style="text-align:center"><div style="font-size:18px;font-weight:700;color:#1e293b">' + months.length + ' เดือน</div><div style="font-size:11px;color:#94a3b8">มีข้อมูล</div></div>' +
      '</div>' +

      // MoM Table
      '<div style="padding:0 24px 24px">' +
        '<table style="width:100%;border-collapse:collapse;font-size:13px">' +
          '<thead><tr style="border-bottom:2px solid #e2e8f0">' +
            '<th style="text-align:left;padding:10px 16px;color:#64748b;font-weight:600">เดือน</th>' +
            '<th style="text-align:right;padding:10px 16px;color:#64748b;font-weight:600">ยอดขาย (บาท)</th>' +
            '<th style="text-align:right;padding:10px 16px;color:#64748b;font-weight:600">% เทียบเดือนก่อน</th>' +
          '</tr></thead>' +
          '<tbody>' + momRows + '</tbody>' +
        '</table>' +
      '</div>' +

      '</div></div>';

    var existing = document.getElementById('amPerfOverlay');
    if (existing) existing.remove();

    var div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div.firstChild);

    // Render chart
    setTimeout(function () {
      var canvas = document.getElementById('amPerfChart');
      if (!canvas || typeof Chart === 'undefined') return;
      if (_amPerfChart) { _amPerfChart.destroy(); _amPerfChart = null; }
      _amPerfChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'ยอดขาย (บาท)',
            data: salesData,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37,99,235,0.08)',
            borderWidth: 2.5,
            pointBackgroundColor: '#2563eb',
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function (ctx) { return _amFmtBaht(ctx.raw) + ' บาท'; }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (v) { return _amFmtNum(v); },
                font: { size: 11 }
              },
              grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
              ticks: { font: { size: 11 } },
              grid: { display: false }
            }
          }
        }
      });
    }, 100);
  };

  window.amClosePerfDetail = function () {
    if (_amPerfChart) { _amPerfChart.destroy(); _amPerfChart = null; }
    var overlay = document.getElementById('amPerfOverlay');
    if (overlay) overlay.remove();
  };

  // ---- Click handler for sub-tab (called from amz-portal pattern) ----
  window.amzClickAreaMonitor = function (el) {
    if (typeof _amzApiHide === 'function') _amzApiHide();
    // Mark active tab
    document.querySelectorAll('#amzChannelTabs .sub-tab').forEach(function (t) { t.classList.remove('active'); });
    if (el) el.classList.add('active');

    // Show the sub-section using _amzShowDirect pattern
    var section = document.getElementById('tab-amazon');
    if (!section) return;
    section.querySelectorAll('.sub-section').forEach(function (s) { s.classList.remove('active'); });
    var target = document.getElementById('amz-area-monitor');
    if (target) target.classList.add('active');

    // Hide portal sidebar, show content full width
    var sidebar = document.getElementById('amzBiSidebar');
    var content = document.getElementById('amzBiContent');
    if (sidebar) sidebar.style.display = 'none';
    if (content) content.style.gridColumn = '1 / -1';

    areaMonitorInit();
  };

})();
