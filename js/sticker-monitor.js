/* sticker-monitor.js — ระบบมอนิเตอร์สติ๊กเกอร์สินค้า
   แสดงสถานะสต็อกสติ๊กเกอร์ เตือนเมื่อใกล้หมด จัดการ PR สั่งซื้อ
   ข้อมูลตั้งต้นมาจาก js/sticker-data.js
   ผู้ใช้แก้ไขผ่านหน้าเว็บเก็บใน localStorage แยกจากข้อมูลตั้งต้น */
(function () {
'use strict';

var STK_KEY = 'sticker_monitor_v1';
var _layout = 'card';                 // 'card' | 'table'
var _f = { search: '', category: '', status: '' };
var _expanded = {};                    // track expanded cards by code

/* ── ฟังก์ชันพื้นฐาน (fallback ถ้า global ไม่มี) ── */
function _esc(s) {
  if (typeof esc === 'function') return esc(s);
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function _fmtNum(n) {
  if (typeof fmtNum === 'function') return fmtNum(n);
  return (n === null || n === undefined || n === '') ? '' : Number(n).toLocaleString('th-TH');
}

function todayStr() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function fmtDateTh(d) {
  if (!d) return '';
  var p = String(d).split('-');
  if (p.length !== 3) return _esc(d);
  var TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  var beShort = (parseInt(p[0], 10) + 543) % 100;
  return parseInt(p[2], 10) + ' ' + (TH[parseInt(p[1], 10) - 1] || p[1]) + ' ' + beShort;
}
function addDays(dateStr, days) {
  if (!dateStr) return '';
  var d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/* ── ข้อมูล ──
   เทียบ version: ถ้าไฟล์ใหม่กว่าที่เก็บไว้ ให้ใช้ของใหม่ */
function load() {
  var def = (typeof STICKER_DEFAULT_DATA !== 'undefined') ? STICKER_DEFAULT_DATA : null;
  var stored = null;
  try { stored = JSON.parse(localStorage.getItem(STK_KEY) || 'null'); } catch (e) {}

  if (!def) return stored || { categories: [] };
  if (!stored) return JSON.parse(JSON.stringify(def));
  if (stored.version === def.version) return stored;

  /* version ต่างกัน — ใช้ default ใหม่ */
  var merged = JSON.parse(JSON.stringify(def));
  save(merged);
  return merged;
}

function save(data) {
  try { localStorage.setItem(STK_KEY, JSON.stringify(data)); }
  catch (e) { alert('บันทึกไม่สำเร็จ พื้นที่เก็บข้อมูลของเบราว์เซอร์เต็ม'); }
}

/* ── รวมรายการทุก category เป็น flat array ── */
function allItems(data) {
  var out = [];
  (data.categories || []).forEach(function (cat) {
    (cat.items || []).forEach(function (it) {
      out.push({ item: it, category: cat.name });
    });
  });
  return out;
}

/* ── สถานะสต็อก ── */
function stockStatus(item) {
  if (item.daysRemaining < (item.minStock || 15)) return 'critical';
  if (item.daysRemaining < 30) return 'warning';
  return 'healthy';
}
function statusColor(s) {
  if (s === 'critical') return 'var(--stk-red,#dc2626)';
  if (s === 'warning') return 'var(--stk-yellow,#d97706)';
  return 'var(--stk-green,#16a34a)';
}
function statusLabel(s) {
  if (s === 'critical') return 'วิกฤต';
  if (s === 'warning') return 'ระวัง';
  return 'ปลอดภัย';
}

/* ── คำนวณจำนวนแนะนำสั่งซื้อ ── */
function calcOrderQty(item) {
  var need = ((item.maxStock || 45) * (item.avgPoPerDay || 0)) - (item.totalRemaining || 0);
  return need > 0 ? Math.ceil(need) : 0;
}

/* ── Category chip class ── */
function catChipCls(catName) {
  if (/OEM/i.test(catName)) return 'stk-cat-chip stk-cat-oem';
  if (/Own/i.test(catName)) return 'stk-cat-chip stk-cat-own';
  return 'stk-cat-chip';
}

/* ── PR status badge ── */
function prBadge(status) {
  if (!status) return '';
  var map = {
    'opened':   { cls: 'stk-pr-opened',   label: 'เปิด PR' },
    'approved': { cls: 'stk-pr-approved',  label: 'อนุมัติแล้ว' },
    'ordered':  { cls: 'stk-pr-ordered',   label: 'สั่งซื้อแล้ว' },
    'received': { cls: 'stk-pr-received',  label: 'รับของแล้ว' }
  };
  var m = map[status] || { cls: '', label: status };
  return '<span class="stk-pr-badge ' + m.cls + '">' + _esc(m.label) + '</span>';
}

/* ── กรอง ── */
function filtered(all) {
  var q = _f.search.trim().toLowerCase();
  return all.filter(function (o) {
    if (_f.category && o.category !== _f.category) return false;
    if (_f.status && stockStatus(o.item) !== _f.status) return false;
    if (q) {
      var hay = (o.item.name + ' ' + o.item.code + ' ' + o.item.barcode + ' ' + o.category).toLowerCase();
      if (hay.indexOf(q) < 0) return false;
    }
    return true;
  });
}

/* ============================================================
   RENDER MAIN
   ============================================================ */
window.renderStickerMonitor = function () {
  var el = document.getElementById('stickerContent');
  if (!el) return;
  var data = load();
  el.classList.add('stk-root');

  var all = allItems(data);
  var items = filtered(all);

  /* สถิติ KPI */
  var critCount = 0, warnCount = 0, healthCount = 0, prCount = 0;
  all.forEach(function (o) {
    var s = stockStatus(o.item);
    if (s === 'critical') critCount++;
    else if (s === 'warning') warnCount++;
    else healthCount++;
    if (o.item.prStatus && o.item.prStatus !== 'received') prCount++;
  });

  el.innerHTML =
    renderHead(data) +
    renderKpis(all.length, critCount, warnCount, healthCount, prCount) +
    renderFilterBar(data, all, items.length) +
    (items.length
      ? (_layout === 'card' ? renderCards(items, data) : renderTable(items, data))
      : '<div class="stk-empty"><div class="stk-big">🔍</div><h3>ไม่พบรายการที่ตรงกับเงื่อนไข</h3>' +
        '<p>ลองล้างตัวกรองหรือเปลี่ยนคำค้น</p></div>') +
    renderLegend();
};

/* ---- Head ---- */
function renderHead(data) {
  return '<div class="stk-head">' +
    '<div class="stk-h1">🏷️ มอนิเตอร์สติ๊กเกอร์สินค้า' +
      '<small>ที่มา: ' + _esc(data.source || 'ตารางอัพเดทสติ๊กเกอร์') +
      (data.asOf ? ' · ข้อมูล ณ ' + fmtDateTh(data.asOf) : '') +
      ' · Lead Time ' + (data.leadTimeDays || 30) + ' วัน</small></div>' +
  '</div>';
}

/* ---- KPI Cards ---- */
function kpiBox(color, label, val) {
  return '<div class="stk-kpi" style="border-left-color:' + color + '">' +
    '<div class="stk-kpi-lbl">' + label + '</div>' +
    '<div class="stk-kpi-val" style="color:' + color + '">' + val + '</div></div>';
}
function renderKpis(total, crit, warn, health, prs) {
  return '<div class="stk-kpis">' +
    kpiBox('#0891b2', 'SKU ทั้งหมด', total) +
    kpiBox('#dc2626', '🔴 วิกฤต (< Min)', crit) +
    kpiBox('#d97706', '🟡 ระวัง (Min-30 วัน)', warn) +
    kpiBox('#16a34a', '🟢 ปลอดภัย (> 30 วัน)', health) +
    kpiBox('#7c3aed', '📋 PR ที่กำลังดำเนินการ', prs) +
  '</div>';
}

/* ---- Filter Bar ---- */
function renderFilterBar(data, all, shown) {
  var cats = [];
  (data.categories || []).forEach(function (c) {
    if (cats.indexOf(c.name) < 0) cats.push(c.name);
  });
  var opt = function (v, cur, label) {
    return '<option value="' + _esc(v) + '"' + (cur === v ? ' selected' : '') + '>' + _esc(label || v) + '</option>';
  };

  return '<div class="stk-bar">' +
    '<input class="stk-in" style="width:220px" placeholder="🔍 ค้นหาชื่อสินค้า / รหัส / บาร์โค้ด" value="' + _esc(_f.search) +
      '" oninput="window._stkSet(\'search\',this.value)">' +
    '<select class="stk-in" onchange="window._stkSet(\'category\',this.value)">' + opt('', _f.category, 'ทุกหมวดหมู่') +
      cats.map(function (c) { return opt(c, _f.category); }).join('') + '</select>' +
    '<select class="stk-in" onchange="window._stkSet(\'status\',this.value)">' +
      opt('', _f.status, 'สถานะ: ทั้งหมด') +
      opt('critical', _f.status, '🔴 วิกฤต') +
      opt('warning', _f.status, '🟡 ระวัง') +
      opt('healthy', _f.status, '🟢 ปลอดภัย') +
    '</select>' +
    '<div class="stk-layout-toggle">' +
      '<button class="stk-lbtn' + (_layout === 'card' ? ' on' : '') + '" onclick="window._stkLayout(\'card\')" title="มุมมองการ์ด">▦</button>' +
      '<button class="stk-lbtn' + (_layout === 'table' ? ' on' : '') + '" onclick="window._stkLayout(\'table\')" title="มุมมองตาราง">☰</button>' +
    '</div>' +
    '<div class="stk-export-wrap">' +
      '<button class="stk-btn" style="border-color:#7c3aed;color:#7c3aed" onclick="window._stkExportMenu()">📤 ส่งออก ▾</button>' +
      '<div id="stkExportMenu" class="stk-export-menu" style="display:none">' +
        '<button onclick="window._stkExportExcel();window._stkExportMenu()">📊 Excel (.xlsx)</button>' +
        '<button onclick="window._stkExportPDF();window._stkExportMenu()">📄 PDF</button>' +
        '<button onclick="window._stkExportImage();window._stkExportMenu()">🖼️ รูปภาพ (.png)</button>' +
      '</div>' +
    '</div>' +
    '<span class="stk-count">แสดง <b>' + shown + '</b> จาก ' + all.length + ' รายการ</span>' +
  '</div>';
}

/* ---- Card View ---- */
function renderCards(items, data) {
  var h = '<div class="stk-cards">';
  items.forEach(function (o, idx) {
    var it = o.item;
    var st = stockStatus(it);
    var gaugeW = Math.min(100, Math.max(0, (it.daysRemaining / (it.maxStock || 45)) * 100));
    var gaugeCls = st === 'critical' ? 'stk-g-red' : st === 'warning' ? 'stk-g-yellow' : 'stk-g-green';
    var isExpanded = _expanded[it.code];
    var pulseClass = st === 'critical' ? ' stk-pulse' : '';

    h += '<div class="stk-card stk-' + st + pulseClass + '" onclick="window._stkToggleCard(\'' + _esc(it.code) + '\')">' +
      '<div class="stk-card-head">' +
        '<div class="stk-card-info">' +
          '<div class="stk-card-name">' + _esc(it.name) + '</div>' +
          '<div class="stk-card-sub">' + _esc(it.code) + ' · ' + _esc(it.version) +
            ' <span class="' + catChipCls(o.category) + '">' + _esc(o.category.replace('สติกเกอร์ สินค้า ', '')) + '</span>' +
            (it.prStatus ? ' ' + prBadge(it.prStatus) : '') +
          '</div>' +
        '</div>' +
        '<div class="stk-card-days">' +
          '<div class="stk-card-days-num" style="color:' + statusColor(st) + '">' + it.daysRemaining.toFixed(0) + '</div>' +
          '<div class="stk-card-days-lbl">วันเหลือใช้</div>' +
        '</div>' +
      '</div>' +
      '<div class="stk-gauge"><div class="stk-gauge-fill ' + gaugeCls + '" style="width:' + gaugeW.toFixed(1) + '%"></div></div>' +
      '<div class="stk-minmax"><span>Min ' + (it.minStock || 15) + ' วัน</span><span>Max ' + (it.maxStock || 45) + ' วัน</span></div>' +
      '<div class="stk-stock-row">' +
        '<span class="stk-stock-item">ห้องแพ็ค: <b>' + _fmtNum(it.stockPacking) + '</b></span>' +
        '<span class="stk-stock-item">WIP: <b>' + _fmtNum(it.stockWip) + '</b></span>' +
        '<span class="stk-stock-item">FG: <b>' + _fmtNum(it.stockFg) + '</b></span>' +
        '<span class="stk-stock-item">รวม: <b>' + _fmtNum(it.totalRemaining) + '</b></span>' +
      '</div>' +
      '<div class="stk-stock-row"><span class="stk-stock-item">เฉลี่ย PO/วัน: <b>' + _fmtNum(it.avgPoPerDay) + '</b></span></div>';

    if (isExpanded) {
      h += renderExpandedCard(o, data);
    }

    h += '</div>';
  });
  h += '</div>';
  return h;
}

/* ---- Expanded Card Detail ---- */
function renderExpandedCard(o, data) {
  var it = o.item;
  var recQty = calcOrderQty(it);
  var leadTime = (data.leadTimeDays || 30);

  var h = '<div class="stk-card-expand" onclick="event.stopPropagation()">' +
    '<dl class="stk-detail-grid">' +
      '<dt>บาร์โค้ด</dt><dd>' + _esc(it.barcode) + '</dd>' +
      '<dt>หมวดหมู่</dt><dd>' + _esc(o.category) + '</dd>' +
      '<dt>วันเหลือใช้</dt><dd style="color:' + statusColor(stockStatus(it)) + '">' + it.daysRemaining.toFixed(2) + ' วัน (' + statusLabel(stockStatus(it)) + ')</dd>' +
      '<dt>สต็อกรวม</dt><dd>' + _fmtNum(it.totalRemaining) + '</dd>' +
      '<dt>เฉลี่ย PO/วัน</dt><dd>' + _fmtNum(it.avgPoPerDay) + '</dd>' +
      '<dt>จำนวนแนะนำสั่งซื้อ</dt><dd style="color:' + (recQty > 0 ? 'var(--stk-red)' : 'var(--stk-green)') + '">' +
        (recQty > 0 ? _fmtNum(recQty) + ' ชิ้น' : 'ไม่ต้องสั่ง') + '</dd>' +
    '</dl>';

  /* PR form */
  h += '<div class="stk-form">' +
    '<div class="stk-form-title">📋 ใบขอสั่งซื้อ (PR)</div>' +
    '<div class="stk-form-row">' +
      '<label>สถานะ PR</label>' +
      '<select id="stkPrStatus_' + it.code + '">' +
        '<option value=""' + (!it.prStatus ? ' selected' : '') + '>ยังไม่เปิด</option>' +
        '<option value="opened"' + (it.prStatus === 'opened' ? ' selected' : '') + '>เปิด PR แล้ว</option>' +
        '<option value="approved"' + (it.prStatus === 'approved' ? ' selected' : '') + '>อนุมัติแล้ว</option>' +
        '<option value="ordered"' + (it.prStatus === 'ordered' ? ' selected' : '') + '>สั่งซื้อแล้ว</option>' +
        '<option value="received"' + (it.prStatus === 'received' ? ' selected' : '') + '>รับของแล้ว</option>' +
      '</select>' +
    '</div>' +
    '<div class="stk-form-row">' +
      '<label>จำนวนสั่ง</label>' +
      '<input type="number" id="stkOrderQty_' + it.code + '" value="' + (it.orderQty || recQty) + '" placeholder="' + recQty + '">' +
    '</div>' +
    '<div class="stk-form-row">' +
      '<label>วันที่เปิด PR</label>' +
      '<input type="date" id="stkPrDate_' + it.code + '" value="' + (it.prDate || todayStr()) + '"' +
        ' onchange="window._stkCalcExpDate(\'' + it.code + '\',' + leadTime + ')">' +
    '</div>' +
    '<div class="stk-form-row">' +
      '<label>วันที่กำหนดรับ</label>' +
      '<input type="date" id="stkExpDate_' + it.code + '" value="' +
        (it.expectedReceiveDate || addDays(it.prDate || todayStr(), leadTime)) + '">' +
    '</div>' +
    '<div class="stk-form-row">' +
      '<label>ฝ่ายขายอนุมัติ</label>' +
      '<select id="stkApproval_' + it.code + '">' +
        '<option value=""' + (!it.salesApproval ? ' selected' : '') + '>-</option>' +
        '<option value="อนุมัติ"' + (it.salesApproval === 'อนุมัติ' ? ' selected' : '') + '>อนุมัติ</option>' +
        '<option value="รออนุมัติ"' + (it.salesApproval === 'รออนุมัติ' ? ' selected' : '') + '>รออนุมัติ</option>' +
        '<option value="ไม่อนุมัติ"' + (it.salesApproval === 'ไม่อนุมัติ' ? ' selected' : '') + '>ไม่อนุมัติ</option>' +
      '</select>' +
    '</div>' +
    '<div class="stk-form-row">' +
      '<label>การติดตาม</label>' +
      '<input type="text" id="stkTracking_' + it.code + '" value="' + _esc(it.tracking) + '" placeholder="สถานะการติดตาม...">' +
    '</div>' +
    '<div class="stk-form-row">' +
      '<label>หมายเหตุ</label>' +
      '<textarea id="stkNote_' + it.code + '" placeholder="บันทึกเพิ่มเติม...">' + _esc(it.note) + '</textarea>' +
    '</div>' +
    '<div class="stk-form-actions">' +
      '<button class="stk-form-save" onclick="window._stkSavePR(\'' + _esc(it.code) + '\')">💾 บันทึก</button>' +
    '</div>' +
  '</div>';

  h += '</div>';
  return h;
}

/* ---- Table View ---- */
function renderTable(items, data) {
  var h = '<div class="stk-wrap"><table class="stk-tbl">' +
    '<thead><tr>' +
      '<th class="stk-name-col">สินค้า</th>' +
      '<th>รหัส</th><th>Version</th><th>บาร์โค้ด</th>' +
      '<th>หมวดหมู่</th>' +
      '<th>ห้องแพ็ค</th><th>WIP</th><th>FG</th><th>รวม</th>' +
      '<th>PO เฉลี่ย/วัน</th><th>วันเหลือใช้</th>' +
      '<th>Min</th><th>Max</th>' +
      '<th>สถานะ PR</th><th>จำนวนสั่ง</th>' +
      '<th>วันเปิด PR</th><th>กำหนดรับ</th>' +
      '<th>ฝ่ายขาย</th><th>การติดตาม</th><th>หมายเหตุ</th>' +
    '</tr></thead><tbody>';

  /* จัดกลุ่มตาม category */
  var lastCat = '';
  items.forEach(function (o) {
    var it = o.item;
    if (o.category !== lastCat) {
      h += '<tr class="stk-cat-row"><td colspan="20">' + _esc(o.category) + '</td></tr>';
      lastCat = o.category;
    }
    var st = stockStatus(it);
    var daysCls = st === 'critical' ? 'stk-days-red' : st === 'warning' ? 'stk-days-yellow' : 'stk-days-green';

    h += '<tr>' +
      '<td class="stk-name-col">' + _esc(it.name) + '</td>' +
      '<td class="stk-c">' + _esc(it.code) + '</td>' +
      '<td class="stk-c">' + _esc(it.version) + '</td>' +
      '<td class="stk-c">' + _esc(it.barcode) + '</td>' +
      '<td class="stk-c"><span class="' + catChipCls(o.category) + '">' + _esc(o.category.replace('สติกเกอร์ สินค้า ', '')) + '</span></td>' +
      '<td class="stk-num">' + _fmtNum(it.stockPacking) + '</td>' +
      '<td class="stk-num">' + _fmtNum(it.stockWip) + '</td>' +
      '<td class="stk-num">' + _fmtNum(it.stockFg) + '</td>' +
      '<td class="stk-num" style="font-weight:700">' + _fmtNum(it.totalRemaining) + '</td>' +
      '<td class="stk-num">' + _fmtNum(it.avgPoPerDay) + '</td>' +
      '<td class="stk-num ' + daysCls + '">' + it.daysRemaining.toFixed(1) + '</td>' +
      '<td class="stk-num">' + (it.minStock || 15) + '</td>' +
      '<td class="stk-num">' + (it.maxStock || 45) + '</td>' +
      '<td class="stk-c">' + (it.prStatus ? prBadge(it.prStatus) : '-') + '</td>' +
      '<td class="stk-num">' + (it.orderQty ? _fmtNum(it.orderQty) : '-') + '</td>' +
      '<td class="stk-c">' + (it.prDate ? fmtDateTh(it.prDate) : '-') + '</td>' +
      '<td class="stk-c">' + (it.expectedReceiveDate ? fmtDateTh(it.expectedReceiveDate) : '-') + '</td>' +
      '<td class="stk-c">' + _esc(it.salesApproval || '-') + '</td>' +
      '<td>' + _esc(it.tracking || '-') + '</td>' +
      '<td>' + _esc(it.note || '-') + '</td>' +
    '</tr>';
  });

  h += '</tbody></table></div>';
  return h;
}

/* ---- Legend ---- */
function renderLegend() {
  return '<div class="stk-legend">' +
    '<b>สัญลักษณ์:</b>' +
    '<span><span class="stk-legend-dot" style="background:#dc2626"></span> วิกฤต (&lt; Min วัน)</span>' +
    '<span><span class="stk-legend-dot" style="background:#d97706"></span> ระวัง (Min-30 วัน)</span>' +
    '<span><span class="stk-legend-dot" style="background:#16a34a"></span> ปลอดภัย (&gt; 30 วัน)</span>' +
    '<span>| Lead Time: 30 วัน | Min: 15 วัน | Max: 45 วัน</span>' +
  '</div>';
}

/* ============================================================
   EVENT HANDLERS — window._stk* prefix
   ============================================================ */
window._stkSet = function (k, v) { _f[k] = v; renderStickerMonitor(); };
window._stkLayout = function (v) { _layout = v; renderStickerMonitor(); };
window._stkToggleCard = function (code) {
  var wasOpen = _expanded[code];
  _expanded = {};
  if (!wasOpen) _expanded[code] = true;
  renderStickerMonitor();
};

window._stkCalcExpDate = function (code, leadTime) {
  var prDateEl = document.getElementById('stkPrDate_' + code);
  var expDateEl = document.getElementById('stkExpDate_' + code);
  if (prDateEl && expDateEl) {
    expDateEl.value = addDays(prDateEl.value, leadTime);
  }
};

window._stkSavePR = function (code) {
  var data = load();
  var found = false;
  (data.categories || []).forEach(function (cat) {
    (cat.items || []).forEach(function (it) {
      if (it.code === code) {
        var g = function (id) { var e = document.getElementById(id); return e ? String(e.value || '').trim() : ''; };
        it.prStatus = g('stkPrStatus_' + code);
        it.orderQty = parseInt(g('stkOrderQty_' + code), 10) || 0;
        it.prDate = g('stkPrDate_' + code);
        it.expectedReceiveDate = g('stkExpDate_' + code);
        it.salesApproval = g('stkApproval_' + code);
        it.tracking = g('stkTracking_' + code);
        it.note = g('stkNote_' + code);
        found = true;
      }
    });
  });
  if (found) {
    save(data);
    renderStickerMonitor();
    /* แสดง feedback สั้น ๆ */
    var el = document.getElementById('stickerContent');
    if (el) {
      var toast = document.createElement('div');
      toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#0891b2;color:#fff;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:700;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.15);animation:stkSlide .3s ease';
      toast.textContent = '✅ บันทึกข้อมูล PR เรียบร้อย';
      document.body.appendChild(toast);
      setTimeout(function () { toast.remove(); }, 2500);
    }
  }
};

/* ---- Export ---- */
window._stkExportMenu = function () {
  var menu = document.getElementById('stkExportMenu');
  if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
};

window._stkExportExcel = function () {
  if (typeof XLSX === 'undefined') return alert('ไม่พบไลบรารี XLSX');
  var data = load();
  var all = allItems(data);
  var items = filtered(all);

  var rows = [['รหัส', 'Version', 'บาร์โค้ด', 'สินค้า', 'หมวดหมู่',
    'ห้องแพ็ค', 'WIP', 'FG', 'คงเหลือรวม', 'PO เฉลี่ย/วัน', 'วันเหลือใช้',
    'Min', 'Max', 'สถานะ', 'สถานะ PR', 'จำนวนสั่ง',
    'วันเปิด PR', 'กำหนดรับ', 'ฝ่ายขายอนุมัติ', 'การติดตาม', 'หมายเหตุ']];

  items.forEach(function (o) {
    var it = o.item;
    rows.push([
      it.code, it.version, it.barcode, it.name, o.category,
      it.stockPacking, it.stockWip, it.stockFg, it.totalRemaining,
      it.avgPoPerDay, it.daysRemaining,
      it.minStock || 15, it.maxStock || 45, statusLabel(stockStatus(it)),
      it.prStatus || '-', it.orderQty || 0,
      it.prDate || '-', it.expectedReceiveDate || '-',
      it.salesApproval || '-', it.tracking || '-', it.note || '-'
    ]);
  });

  var ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 35 }, { wch: 22 },
    { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 6 }, { wch: 6 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 25 }
  ];
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sticker Monitor');
  XLSX.writeFile(wb, 'StickerMonitor_' + todayStr() + '.xlsx');
};

window._stkExportPDF = function () {
  var el = document.querySelector('.stk-wrap') || document.querySelector('.stk-cards');
  if (!el) return alert('ไม่พบข้อมูลที่จะส่งออก');
  if (typeof html2canvas === 'undefined') return alert('ไม่พบไลบรารี html2canvas');
  html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then(function (canvas) {
    var pdf = new (window.jspdf || window.jsPDF).jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save('StickerMonitor_' + todayStr() + '.pdf');
  });
};

window._stkExportImage = function () {
  var el = document.querySelector('.stk-wrap') || document.querySelector('.stk-cards');
  if (!el) return alert('ไม่พบข้อมูลที่จะส่งออก');
  if (typeof html2canvas === 'undefined') return alert('ไม่พบไลบรารี html2canvas');
  html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then(function (canvas) {
    var a = document.createElement('a');
    a.download = 'StickerMonitor_' + todayStr() + '.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  });
};

})();
