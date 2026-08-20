/* Menu Engineering Matrix — จัดกลุ่มสินค้าเป็น 4 กลุ่มตามกำไรต่อหน่วย × ความนิยม
     ดาวเด่น (Stars)      กำไรสูง ขายดี     → รักษาไว้ ดันต่อ
     ปริศนา (Puzzles)     กำไรสูง ขายน้อย   → ดันการตลาด หาสาเหตุที่ขายไม่ออก
     ม้างาน (Plow Horses) กำไรต่ำ ขายดี     → ลองขึ้นราคา / ลดต้นทุน
     ตัวถ่วง (Dogs)       กำไรต่ำ ขายน้อย   → พิจารณาตัดออก

   ใช้ได้ทั้ง catalog.html และ sales_dashboard.html
   เรียกด้วย CatalogMatrix.mount('ไอดีของกล่องที่จะวาดลงไป')
   ต้องมี css/menu-matrix.css และไฟล์ข้อมูล js/catalog-data.js + js/catalog-sales.js */
(function () {
  'use strict';

  var CATS = [
    { key: 'star',   no: 1, label: 'ดาวเด่น (Stars)',      short: 'ดาวเด่น', color: '#10b981', tip: 'กำไรดี ขายดี — รักษาคุณภาพและดันต่อ' },
    { key: 'puzzle', no: 2, label: 'ปริศนา (Puzzles)',     short: 'ปริศนา',  color: '#f5b301', tip: 'กำไรดีแต่ขายน้อย — ดันการตลาด/จัดวางใหม่' },
    { key: 'plow',   no: 3, label: 'ม้างาน (Plow Horses)', short: 'ม้างาน',  color: '#f97316', tip: 'ขายดีแต่กำไรน้อย — ลองขึ้นราคาหรือลดต้นทุน' },
    { key: 'dog',    no: 4, label: 'ตัวถ่วง (Dogs)',       short: 'ตัวถ่วง', color: '#ef4444', tip: 'กำไรน้อย ขายน้อย — พิจารณาตัดออก' }
  ];
  var CAT_BY_KEY = {};
  CATS.forEach(function (c) { CAT_BY_KEY[c.key] = c; });

  var host = null;          // element ที่ mount ไว้
  var year = null;
  var points = [];
  var axis = null;
  var activeCat = null;
  var chLabel = {};

  /* ───────── ตัวช่วย ───────── */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtB(v) {
    if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(2) + ' M';
    if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + ' K';
    return Math.round(v).toLocaleString('th-TH');
  }
  function baht(v) {
    return (Math.round(v * 100) / 100).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function q(sel) { return host ? host.querySelector(sel) : null; }

  /* ───────── แหล่งข้อมูลสินค้า ─────────
     หน้า catalog มี window.CatalogApp ซึ่งรวมข้อมูลที่แก้ผ่านเบราว์เซอร์ไว้แล้ว (รวมถึงต้นทุน)
     หน้า dashboard ไม่มี จึงอ่านจาก window.CATALOG_DATA แล้วดึง overrides มาทับเอง */

  var _fallbackProducts = null;

  function products() {
    if (window.CatalogApp && window.CatalogApp.products) return window.CatalogApp.products;
    return _fallbackProducts || [];
  }

  function channels() {
    if (window.CatalogApp && window.CatalogApp.channels) return window.CatalogApp.channels;
    return (window.CATALOG_DATA && window.CATALOG_DATA.channels) || [];
  }

  function loadScript(src) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { resolve(); };
      document.head.appendChild(s);
    });
  }

  async function ensureData() {
    if (!window.CATALOG_SALES) await loadScript('js/catalog-sales.js');

    if (!window.CatalogApp) {
      if (!window.CATALOG_DATA) await loadScript('js/catalog-data.js');
      if (!window.CATALOG_DATA) return false;

      if (!_fallbackProducts) {
        _fallbackProducts = window.CATALOG_DATA.products.map(function (p) {
          return Object.assign({}, p);
        });
        // ต้นทุน/ราคาที่แก้ผ่านหน้าจัดการข้อมูลเก็บอยู่ที่ฝั่งเซิร์ฟเวอร์
        try {
          var res = await fetch('/api/catalog/overrides');
          if (res.ok) {
            var ov = await res.json();
            var prod = (ov && ov.products) || {};
            _fallbackProducts.forEach(function (p) {
              var o = prod[p.channel + '||' + p.code];
              if (o) Object.keys(o).forEach(function (k) { p[k] = o[k]; });
            });
          }
        } catch (e) { /* เปิดแบบไม่มีเซิร์ฟเวอร์ก็ยังใช้ข้อมูลจาก Excel ได้ */ }
      }
    }

    chLabel = {};
    channels().forEach(function (c) { chLabel[c.key] = c.label; });
    return !!(window.CATALOG_SALES && products().length);
  }

  /* ───────── เตรียมข้อมูลจุด ───────── */

  function build() {
    var S = window.CATALOG_SALES;
    var ch = q('#fMxCh').value;
    var mode = q('#fMxAxis').value;              // 'revenue' | 'profit'
    var mos = (S.months || []).filter(function (m) { return m.slice(0, 4) === String(year); });
    var partial = S.partial || [];
    var useMos = mos.filter(function (m) { return partial.indexOf(m) < 0; });

    var seen = {};
    var list = [];

    products().forEach(function (p) {
      if (ch && p.channel !== ch) return;
      if (seen[p.code]) return;
      seen[p.code] = 1;

      var rec = S.byCode[String(p.code)];
      if (!rec) return;

      var src = ch ? (rec.ch[ch] || {}) : rec.m;
      var qty = 0, revenue = 0;
      useMos.forEach(function (m) {
        var v = src[m];
        if (v) { qty += v[0]; revenue += v[1]; }
      });
      if (qty <= 0) return;

      var perUnit = revenue / qty;
      var cost = (p.cost !== null && p.cost !== undefined && p.cost !== '') ? Number(p.cost) : null;
      var hasCost = cost !== null && isFinite(cost) && cost > 0;

      list.push({
        code: p.code, name: p.name, channel: p.channel,
        qty: qty, revenue: revenue, revenuePerUnit: perUnit,
        cost: hasCost ? cost : null,
        x: mode === 'profit' ? perUnit - cost : perUnit,
        hasCost: hasCost
      });
    });

    // นับจากฐานเดียวกับที่แสดงบนกราฟ (สินค้าที่มียอดขายในปี/ช่องทางที่เลือก)
    var universe = list.length;
    var filled = list.filter(function (d) { return d.hasCost; }).length;

    // โหมดกำไรรับเฉพาะสินค้าที่กรอกต้นทุนแล้ว
    // ถ้าเอากำไรของตัวหนึ่งไปวางแกนเดียวกับรายได้ของอีกตัว มันเทียบกันไม่ได้
    if (mode === 'profit') list = list.filter(function (d) { return d.hasCost; });

    /* เส้นแบ่งตามวิธี Kasavana & Smith
       แกนกำไร: ค่าเฉลี่ยถ่วงน้ำหนักตามจำนวนชิ้น (สินค้าที่ขายเยอะต้องมีน้ำหนักมากกว่า)
       แกนความนิยม: 70% ของส่วนแบ่งเฉลี่ย — ถ้าใช้ค่าเฉลี่ยตรง ๆ สินค้าขายดีไม่กี่ตัว
       จะดันเส้นสูงจนสินค้าเกือบทั้งหมดตกไปอยู่ฝั่ง "ขายน้อย" */
    var totalQty = list.reduce(function (s, d) { return s + d.qty; }, 0);
    var avgX = totalQty > 0
      ? list.reduce(function (s, d) { return s + d.x * d.qty; }, 0) / totalQty
      : 0;
    var avgY = list.length ? (totalQty / list.length) * 0.7 : 0;

    list.forEach(function (d) {
      d.cat = d.x >= avgX
        ? (d.qty >= avgY ? 'star' : 'puzzle')
        : (d.qty >= avgY ? 'plow' : 'dog');
    });

    points = list;
    axis = {
      mode: mode, avgX: avgX, avgY: avgY,
      months: useMos.length,
      skippedPartial: mos.length - useMos.length,
      costFilled: filled, universe: universe
    };
  }

  /* ───────── กราฟกระจาย (SVG ล้วน ไม่พึ่งไลบรารีภายนอก) ───────── */

  function scatter() {
    var W = 720, H = 480, padL = 74, padR = 22, padT = 18, padB = 46;
    if (!points.length) return '';

    var xs = points.map(function (d) { return d.x; });
    var ys = points.map(function (d) { return d.qty; });
    var xMin = Math.min.apply(null, xs.concat([axis.avgX]));
    var xMax = Math.max.apply(null, xs.concat([axis.avgX]));
    var yMax = Math.max.apply(null, ys);

    var xPad = (xMax - xMin) * 0.06 || 1;
    xMin -= xPad; xMax += xPad;
    yMax = yMax * 1.06 || 1;

    /* ยอดขายต่างกันหลายหลัก (หลักสิบถึงล้านชิ้น) ถ้าใช้มาตราส่วนปกติ
       สินค้าเกือบทั้งหมดจะกองอยู่มุมซ้ายล่างจนดูไม่ออก จึงมีโหมดลอการิทึมให้เลือก */
    var isLog = q('#fMxScale').value === 'log';
    var yFloor = Math.max(1, Math.min.apply(null, ys) * 0.8);
    var lg = function (v) { return Math.log10(Math.max(v, yFloor)); };
    var lgMin = lg(yFloor), lgMax = lg(yMax);

    var sx = function (v) { return padL + ((v - xMin) / (xMax - xMin)) * (W - padL - padR); };
    var sy = function (v) {
      var t = isLog
        ? (lgMax > lgMin ? (lg(v) - lgMin) / (lgMax - lgMin) : 0)
        : v / yMax;
      return H - padB - t * (H - padT - padB);
    };

    var cx = sx(axis.avgX), cy = sy(axis.avgY);

    var zones =
      '<rect x="' + cx + '" y="' + padT + '" width="' + (W - padR - cx) + '" height="' + (cy - padT) + '" fill="#10b981" opacity=".045"/>' +
      '<rect x="' + cx + '" y="' + cy + '" width="' + (W - padR - cx) + '" height="' + (H - padB - cy) + '" fill="#f5b301" opacity=".05"/>' +
      '<rect x="' + padL + '" y="' + padT + '" width="' + (cx - padL) + '" height="' + (cy - padT) + '" fill="#f97316" opacity=".05"/>' +
      '<rect x="' + padL + '" y="' + cy + '" width="' + (cx - padL) + '" height="' + (H - padB - cy) + '" fill="#ef4444" opacity=".045"/>';

    var zoneLabels =
      '<text x="' + (W - padR - 10) + '" y="' + (padT + 18) + '" text-anchor="end" font-size="12" font-weight="800" fill="#10b981" opacity=".55">1. ดาวเด่น</text>' +
      '<text x="' + (W - padR - 10) + '" y="' + (H - padB - 8) + '" text-anchor="end" font-size="12" font-weight="800" fill="#d19700" opacity=".6">2. ปริศนา</text>' +
      '<text x="' + (padL + 10) + '" y="' + (padT + 18) + '" font-size="12" font-weight="800" fill="#f97316" opacity=".6">3. ม้างาน</text>' +
      '<text x="' + (padL + 10) + '" y="' + (H - padB - 8) + '" font-size="12" font-weight="800" fill="#ef4444" opacity=".55">4. ตัวถ่วง</text>';

    var grid = '';
    for (var g = 0; g <= 4; g++) {
      var yv = isLog ? Math.pow(10, lgMin + ((lgMax - lgMin) * g) / 4) : (yMax * g) / 4;
      grid += '<text x="' + (padL - 10) + '" y="' + (sy(yv) + 4) + '" text-anchor="end" font-size="10.5" fill="var(--mx-muted)">' +
        fmtB(yv) + '</text>';
    }
    for (var i = 0; i <= 4; i++) {
      var xv = xMin + ((xMax - xMin) * i) / 4;
      grid += '<text x="' + sx(xv) + '" y="' + (H - padB + 20) + '" text-anchor="middle" font-size="10.5" fill="var(--mx-muted)">฿' +
        (Math.round(xv * 10) / 10) + '</text>';
    }

    var axes =
      '<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (H - padB) + '" stroke="var(--mx-border)" stroke-width="1.5"/>' +
      '<line x1="' + padL + '" y1="' + (H - padB) + '" x2="' + (W - padR) + '" y2="' + (H - padB) + '" stroke="var(--mx-border)" stroke-width="1.5"/>' +
      '<line x1="' + cx + '" y1="' + padT + '" x2="' + cx + '" y2="' + (H - padB) + '" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5 4"/>' +
      '<line x1="' + padL + '" y1="' + cy + '" x2="' + (W - padR) + '" y2="' + cy + '" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5 4"/>';

    var midY = padT + (H - padT - padB) / 2;
    var axisTitles =
      '<text x="' + (padL + (W - padL - padR) / 2) + '" y="' + (H - 6) + '" text-anchor="middle" ' +
        'font-size="12" font-weight="700" fill="var(--mx-text2)">' +
        (axis.mode === 'profit' ? 'กำไรต่อหน่วย (บาท)' : 'รายได้ต่อหน่วย (บาท)') + '</text>' +
      '<text x="16" y="' + midY + '" text-anchor="middle" font-size="12" font-weight="700" ' +
        'fill="var(--mx-text2)" transform="rotate(-90 16 ' + midY + ')">' +
        'จำนวนชิ้นที่ขายได้' + (isLog ? ' (ลอการิทึม)' : '') + '</text>';

    // จุดใหญ่วาดก่อน จุดเล็กทับทีหลัง จะได้ไม่โดนบัง
    var dots = points.slice().sort(function (a, b) { return b.qty - a.qty; }).map(function (d) {
      return '<circle class="mx-dot" cx="' + sx(d.x).toFixed(1) + '" cy="' + sy(d.qty).toFixed(1) + '" r="6.5" ' +
        'fill="' + CAT_BY_KEY[d.cat].color + '" fill-opacity=".78" stroke="#fff" stroke-width="1.2" ' +
        'data-code="' + esc(d.code) + '"/>';
    }).join('');

    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="mx-chart" id="mxSvg">' +
      zones + grid + axes + zoneLabels + axisTitles + dots + '</svg>';
  }

  /* ───────── การ์ดสรุปและตาราง ───────── */

  function summary() {
    return '<div class="mx-legend">' + CATS.map(function (c) {
      var items = points.filter(function (d) { return d.cat === c.key; });
      var rev = items.reduce(function (s, d) { return s + d.revenue; }, 0);
      return '<button class="mx-cat' + (activeCat === c.key ? ' on' : '') + '" data-cat="' + c.key +
          '" style="border-left-color:' + c.color + '">' +
        '<span class="mx-dotlg" style="background:' + c.color + '"></span>' +
        '<span class="mx-cat-name">' + c.no + '. ' + esc(c.label) + '</span>' +
        '<span class="mx-cat-num">' + items.length + ' รายการ</span>' +
        '<span class="mx-cat-rev">฿' + fmtB(rev) + '</span>' +
        '<span class="mx-cat-tip">' + esc(c.tip) + '</span>' +
      '</button>';
    }).join('') + '</div>';
  }

  function table(catKey) {
    var items = points.filter(function (d) { return !catKey || d.cat === catKey; })
      .sort(function (a, b) { return b.revenue - a.revenue; });
    if (!items.length) return '';

    var c = catKey ? CAT_BY_KEY[catKey] : null;
    var canZoom = !!window.CatalogPerf;

    return '<div class="mx-title">' + (c ? esc(c.label) : 'สินค้าทั้งหมด') + ' — ' + items.length + ' รายการ</div>' +
      '<div class="mx-tbl-wrap"><table class="mx-tbl"><thead><tr>' +
        '<th>สินค้า</th><th>รหัส</th><th class="mx-num">จำนวนชิ้น</th>' +
        '<th class="mx-num">ยอดขาย</th><th class="mx-num">รายได้/ชิ้น</th>' +
        '<th class="mx-num">ต้นทุน/ชิ้น</th><th class="mx-num">กำไร/ชิ้น</th><th>กลุ่ม</th>' +
        (canZoom ? '<th></th>' : '') +
      '</tr></thead><tbody>' +
      items.map(function (d) {
        var cat = CAT_BY_KEY[d.cat];
        var profit = d.hasCost ? d.revenuePerUnit - d.cost : null;
        return '<tr data-row="' + esc(d.code) + '">' +
          '<td class="mx-name">' + esc(d.name) + '</td>' +
          '<td class="mx-code">' + esc(d.code) + '</td>' +
          '<td class="mx-num">' + Math.round(d.qty).toLocaleString('th-TH') + '</td>' +
          '<td class="mx-num">' + fmtB(d.revenue) + '</td>' +
          '<td class="mx-num">' + baht(d.revenuePerUnit) + '</td>' +
          '<td class="mx-num">' + (d.hasCost ? baht(d.cost) : '<span class="mx-dash">—</span>') + '</td>' +
          '<td class="mx-num">' + (d.hasCost
            ? '<b style="color:' + (profit >= 0 ? 'var(--mx-green)' : 'var(--mx-red)') + '">' + baht(profit) + '</b>'
            : '<span class="mx-dash">—</span>') + '</td>' +
          '<td><span class="mx-tag" style="background:' + cat.color + '22;color:' + cat.color + '">' +
            cat.no + '. ' + esc(cat.short) + '</span></td>' +
          (canZoom ? '<td><button class="mx-zoom" data-zoom="' + esc(d.code) + '" title="ดูยอดขายรายเดือน">🔍</button></td>' : '') +
        '</tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* ───────── วาดผลลัพธ์ ───────── */

  function draw() {
    build();

    var body = q('#mxBody');
    if (!points.length) {
      q('#mxCount').textContent = '';
      body.innerHTML = '<div class="mx-empty"><div class="mx-big">🎯</div>' +
        (axis.mode === 'profit'
          ? '<h3>ยังไม่ได้กรอกต้นทุนสินค้าสักรายการ</h3>' +
            '<p>โหมดกำไรใช้ได้เฉพาะสินค้าที่กรอก “ต้นทุน/หน่วย” ไว้แล้ว<br>' +
            'กรอกได้ที่ catalog.html แท็บ “จัดการข้อมูล” หรือสลับกลับไปโหมดรายได้ต่อหน่วย</p>'
          : '<h3>ไม่มีสินค้าที่มียอดขายในเงื่อนไขนี้</h3><p>ลองเปลี่ยนปีหรือช่องทาง</p>') +
        '</div>';
      return;
    }

    var note = axis.mode === 'profit'
      ? '<b>แกนนอนคือกำไรต่อหน่วยจริง</b> (รายได้ต่อชิ้น − ต้นทุนที่กรอกไว้) — ' +
        'แสดงเฉพาะ ' + points.length + ' รายการที่กรอกต้นทุนแล้ว จากทั้งหมด ' + axis.universe + ' รายการ'
      : 'แกนนอนคือ<b>รายได้ต่อหน่วย ยังไม่ใช่กำไร</b> เพราะระบบไม่มีข้อมูลต้นทุนสินค้า — ' +
        'กรอกต้นทุนแล้ว <b>' + axis.costFilled + '/' + axis.universe + '</b> รายการ ' +
        (axis.costFilled ? 'สลับไปโหมด “กำไรต่อหน่วย” เพื่อดูเฉพาะรายการที่กรอกแล้วได้'
                         : '(กรอกที่ catalog.html แท็บ “จัดการข้อมูล” ช่อง “ต้นทุน/หน่วย”)');

    q('#mxCount').innerHTML = 'สินค้า <b>' + points.length + '</b> รายการ · ' + axis.months + ' เดือน';

    body.innerHTML =
      '<div class="mx-note"><span>💡</span><div>' + note +
        '<br>เส้นแบ่ง (วิธี Kasavana &amp; Smith): ' +
        (axis.mode === 'profit' ? 'กำไร' : 'รายได้') + '/ชิ้น <b>฿' + baht(axis.avgX) +
        '</b> (เฉลี่ยถ่วงน้ำหนัก) · ความนิยม <b>' + Math.round(axis.avgY).toLocaleString('th-TH') +
        ' ชิ้น</b> (70% ของค่าเฉลี่ย)' +
        (axis.skippedPartial ? ' · ตัดเดือนที่ข้อมูลไม่ครบออก ' + axis.skippedPartial + ' เดือน' : '') +
      '</div></div>' +
      summary() +
      '<div class="mx-chart-box">' + scatter() + '<div class="mx-tip" id="mxTip"></div></div>' +
      '<div id="mxTable">' + table(activeCat) + '</div>';
  }

  /* ───────── กล่องข้อมูลตอนเอาเมาส์ชี้ ───────── */

  function showTip(dot) {
    var d = points.filter(function (x) { return String(x.code) === dot.dataset.code; })[0];
    if (!d) return;
    var cat = CAT_BY_KEY[d.cat];
    var box = q('#mxTip');
    var svg = q('#mxSvg');
    var r = svg.getBoundingClientRect();
    var pt = dot.getBoundingClientRect();

    box.innerHTML =
      '<div class="mx-tip-name">' + esc(d.name) + '</div>' +
      '<div class="mx-tip-row"><span>รหัสสินค้า</span><b>' + esc(d.code) + '</b></div>' +
      '<div class="mx-tip-row"><span>จำนวนชิ้นที่ขายได้</span><b>' + Math.round(d.qty).toLocaleString('th-TH') + '</b></div>' +
      '<div class="mx-tip-row"><span>ยอดขายรวม</span><b>฿' + fmtB(d.revenue) + '</b></div>' +
      '<div class="mx-tip-row"><span>รายได้ต่อหน่วย</span><b>฿' + baht(d.revenuePerUnit) + '</b></div>' +
      (d.hasCost
        ? '<div class="mx-tip-row"><span>ต้นทุนต่อหน่วย</span><b>฿' + baht(d.cost) + '</b></div>' +
          '<div class="mx-tip-row"><span>กำไรต่อหน่วย</span><b style="color:' +
            (d.revenuePerUnit - d.cost >= 0 ? 'var(--mx-green)' : 'var(--mx-red)') + '">฿' +
            baht(d.revenuePerUnit - d.cost) + '</b></div>'
        : '') +
      '<div class="mx-tip-row"><span>กลุ่ม</span><b style="color:' + cat.color + '">' +
        cat.no + '. ' + esc(cat.label) + '</b></div>';

    var left = pt.left - r.left + 16;
    var top = pt.top - r.top + 16;
    box.style.display = 'block';
    if (left + box.offsetWidth > r.width) left = pt.left - r.left - box.offsetWidth - 16;
    if (top + box.offsetHeight > r.height) top = r.height - box.offsetHeight - 6;
    box.style.left = Math.max(4, left) + 'px';
    box.style.top = Math.max(4, top) + 'px';
  }

  /** ไม่มีหน้าต่างกราฟรายเดือน (นอก catalog.html) ก็ให้เลื่อนไปหาแถวในตารางแทน */
  function highlightRow(code) {
    var row = q('[data-row="' + code + '"]');
    if (!row) {
      activeCat = null;
      q('#mxTable').innerHTML = table(null);
      row = q('[data-row="' + code + '"]');
      host.querySelectorAll('.mx-cat').forEach(function (b) { b.classList.remove('on'); });
    }
    if (!row) return;
    host.querySelectorAll('.mx-tbl tr.mx-hit').forEach(function (r) { r.classList.remove('mx-hit'); });
    row.classList.add('mx-hit');
    row.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  /* ───────── ประกอบหน้าและผูก event ───────── */

  function controlsHtml() {
    // ครอบด้วย .mx-root ชั้นใน ไม่ใช่ที่ตัว host เอง
    // เพราะในแดชบอร์ด #prodContent ถูกใช้ร่วมกับแท็บย่อยอื่น
    // ถ้าติดคลาสไว้ที่ host สไตล์จะไปมีผลกับเนื้อหาแท็บอื่นด้วย
    return '<div class="mx-root">' +
      '<div class="mx-bar">' +
        '<span class="mx-bar-label">🎯 จัดกลุ่มสินค้า 4 กลุ่ม</span>' +
        '<select class="mx-sel" id="fMxYear"></select>' +
        '<select class="mx-sel" id="fMxCh"></select>' +
        '<select class="mx-sel" id="fMxAxis" title="แกนนอนใช้อะไรวัด">' +
          '<option value="revenue">แกนนอน: รายได้ต่อหน่วย</option>' +
          '<option value="profit">แกนนอน: กำไรต่อหน่วย (ต้องกรอกต้นทุน)</option>' +
        '</select>' +
        '<select class="mx-sel" id="fMxScale" title="ยอดขายต่างกันหลายหลัก ลอการิทึมจะกระจายจุดให้ดูง่ายขึ้น">' +
          '<option value="log">แกนตั้ง: ลอการิทึม</option>' +
          '<option value="linear">แกนตั้ง: ปกติ</option>' +
        '</select>' +
        '<span class="mx-sep"></span>' +
        '<span class="mx-count" id="mxCount"></span>' +
      '</div>' +
      '<div id="mxBody"></div>' +
    '</div>';
  }

  function bind() {
    host.addEventListener('change', function (e) {
      if (e.target.id === 'fMxYear') year = e.target.value;
      if (['fMxYear', 'fMxCh', 'fMxAxis', 'fMxScale'].indexOf(e.target.id) >= 0) draw();
    });

    host.addEventListener('click', function (e) {
      var z = e.target.closest('[data-zoom]');
      if (z && window.CatalogPerf) { window.CatalogPerf.zoom(z.dataset.zoom); return; }

      var dot = e.target.closest('.mx-dot');
      if (dot) {
        if (window.CatalogPerf) window.CatalogPerf.zoom(dot.dataset.code);
        else highlightRow(dot.dataset.code);
        return;
      }

      var cat = e.target.closest('[data-cat]');
      if (cat) {
        activeCat = activeCat === cat.dataset.cat ? null : cat.dataset.cat;
        host.querySelectorAll('.mx-cat').forEach(function (b) {
          b.classList.toggle('on', b.dataset.cat === activeCat);
        });
        q('#mxTable').innerHTML = table(activeCat);
      }
    });

    host.addEventListener('mouseover', function (e) {
      var dot = e.target.closest('.mx-dot');
      if (dot) showTip(dot);
    });
    host.addEventListener('mouseout', function (e) {
      var tip = q('#mxTip');
      if (e.target.closest('.mx-dot') && tip) tip.style.display = 'none';
    });
  }

  /**
   * วาด Menu Engineering ลงในกล่องที่ระบุ
   * @param {string} containerId ไอดีของ element ที่จะวาดลงไป
   */
  async function mount(containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;

    if (host !== el) {
      host = el;
      bind();          // ผูกที่ตัว host ครั้งเดียว listener อยู่รอดแม้ innerHTML ถูกเขียนทับ
      year = null;
    }

    // แท็บย่อยอื่นในแดชบอร์ดเขียนทับ innerHTML ทิ้ง ต้องสร้างโครงใหม่ทุกครั้งที่หาย
    if (!q('#mxBody')) el.innerHTML = controlsHtml();

    q('#mxBody').innerHTML = '<div class="mx-empty"><div class="mx-big">⏳</div>' +
      '<h3>กำลังโหลดข้อมูลยอดขาย…</h3><p>ไฟล์ข้อมูลราว 750 KB ครั้งแรกอาจใช้เวลาสักครู่</p></div>';

    var ok = await ensureData();
    if (!ok) {
      q('#mxBody').innerHTML = '<div class="mx-empty"><div class="mx-big">⚠️</div>' +
        '<h3>ยังไม่มีข้อมูลยอดขาย</h3>' +
        '<p>ต้องสร้างไฟล์ข้อมูลก่อน:<br>' +
        '<code>node scripts/build-catalog-data.js</code><br>' +
        '<code>node --max-old-space-size=6144 scripts/build-catalog-sales.js</code></p></div>';
      return;
    }

    /* เติมตัวเลือกทุกครั้งที่ยังว่าง — ในแดชบอร์ด #prodContent ถูกเขียนทับตอนสลับแท็บ
       ตัวเลือกที่เคยเติมไว้จึงหายไป ต้องเติมใหม่ ไม่ใช่เช็คแค่ครั้งแรก */
    var ys = {};
    (window.CATALOG_SALES.months || []).forEach(function (m) { ys[m.slice(0, 4)] = 1; });
    var yearList = Object.keys(ys).sort().reverse();
    if (!year || yearList.indexOf(String(year)) < 0) year = yearList[0];

    if (!q('#fMxYear').options.length) {
      q('#fMxYear').innerHTML = yearList.map(function (y) {
        return '<option value="' + y + '"' + (String(y) === String(year) ? ' selected' : '') + '>ปี ' + y + '</option>';
      }).join('');
    }
    if (!q('#fMxCh').options.length) {
      q('#fMxCh').innerHTML = '<option value="">ทุกช่องทาง</option>' +
        channels().filter(function (c) { return c.count > 0; }).map(function (c) {
          return '<option value="' + esc(c.key) + '">' + esc(c.label) + '</option>';
        }).join('');
    }
    draw();
  }

  window.CatalogMatrix = {
    mount: mount,
    // ของเดิมในหน้า catalog เรียก render() — คงไว้ให้ใช้ได้เหมือนเดิม
    render: function () { return mount('matrixHost'); }
  };
})();
