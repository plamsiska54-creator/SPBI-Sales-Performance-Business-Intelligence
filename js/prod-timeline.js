/* prod-timeline.js — Time Line สินค้า (สินค้าใหม่ NPD / สินค้ายกเลิก)
   แสดงเป็นตารางที่มีหัวข้อครบตามไฟล์ Time Line Product.xlsx
   ข้อมูลตั้งต้นมาจาก js/prod-timeline-data.js (สร้างโดย scripts/build-timeline-data.js)
   สิ่งที่ผู้ใช้แก้ผ่านหน้าเว็บเก็บใน localStorage แยกจากข้อมูลตั้งต้น */
(function () {
'use strict';

var TL_KEY = 'prod_timeline_v2';        // v1 เป็นสคีมาเก่า คนละคอลัมน์กัน จึงขึ้นคีย์ใหม่
var _view = 'new';                      // 'new' | 'cancel'
var _f = { search: '', channel: '', cust: '', task: '' };
var _editing = null;

/* 9 หัวข้อในกลุ่ม "สิ่งที่เกี่ยวข้อง" — ลำดับและชื่อตรงตามไฟล์ Excel */
var TASKS = [
  { key: 'cost',        grp: '',     label: 'ต้นทุน' },
  { key: 'quote',       grp: '',     label: 'ใบเสนอราคา' },
  { key: 'labelDesign', grp: 'ฉลาก', label: 'ออกแบบ' },
  { key: 'labelOrder',  grp: 'ฉลาก', label: 'สั่งซื้อ' },
  { key: 'labelStock',  grp: 'ฉลาก', label: 'สต็อกคลัง' },
  { key: 'material',    grp: '',     label: 'วัตถุดิบ' },
  { key: 'nutrition',   grp: '',     label: 'นูทริชั่น' },
  { key: 'shelfLife',   grp: '',     label: 'อายุสินค้า' },
  { key: 'fda',         grp: '',     label: 'อย.' }
];

/* จับกลุ่มข้อความสถานะที่ไฟล์ใช้ ให้กลายเป็นสี + สัญลักษณ์ที่กวาดตาอ่านได้เร็ว */
function taskStyle(v) {
  var s = String(v || '').trim();
  if (!s) return { cls: 'tl-t-none', icon: '–', label: 'ยังไม่กรอก' };
  if (/ยังไม่|ไม่ผ่าน/.test(s)) return { cls: 'tl-t-none', icon: '•', label: s };
  if (/เสร็จ|ผ่าน|เรียบร้อย/.test(s)) return { cls: 'tl-t-done', icon: '✓', label: s };
  if (/กำลัง/.test(s)) return { cls: 'tl-t-prog', icon: '◐', label: s };
  if (/^รอ/.test(s)) return { cls: 'tl-t-wait', icon: '⏳', label: s };
  return { cls: 'tl-t-none', icon: '•', label: s };
}

function approvalStyle(v) {
  var s = String(v || '').trim();
  if (!s) return { bg: '#f1f5f9', fg: '#94a3b8', label: 'ยังไม่ระบุ' };
  if (/ไม่ผ่าน/.test(s)) return { bg: '#fee2e2', fg: '#b91c1c', label: s };
  if (/ผ่าน/.test(s)) return { bg: '#dcfce7', fg: '#15803d', label: s };
  if (/กำลังพัฒนา/.test(s)) return { bg: '#dbeafe', fg: '#1d4ed8', label: s };
  if (/^รอ/.test(s)) return { bg: '#fef3c7', fg: '#b45309', label: s };
  return { bg: '#f1f5f9', fg: '#475569', label: s };
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function fmtNum(n) {
  return (n === null || n === undefined || n === '') ? '' : Number(n).toLocaleString('th-TH');
}
/** แสดงวันที่เป็น พ.ศ. แบบสั้น เช่น 1 พ.ย. 69 */
function fmtDate(d) {
  if (!d) return '';
  var p = String(d).split('-');
  if (p.length !== 3) return esc(d);
  var TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  var beShort = (parseInt(p[0], 10) + 543) % 100;
  return parseInt(p[2], 10) + ' ' + (TH[parseInt(p[1], 10) - 1] || p[1]) + ' ' + beShort;
}
function genId() { return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
function uniq(arr) {
  var seen = {}, out = [];
  arr.forEach(function (v) { if (v && !seen[v]) { seen[v] = 1; out.push(v); } });
  return out.sort();
}

/* ── ข้อมูล ──
   ข้อมูลตั้งต้นเปลี่ยนทุกครั้งที่ทีมอัปเดต Excel จึงเทียบ version
   ถ้าไฟล์ใหม่กว่าที่เก็บไว้ ให้ใช้ของใหม่ แต่คงรายการที่ผู้ใช้เพิ่มเองไว้ */
function load() {
  var def = (typeof TIMELINE_DEFAULT_DATA !== 'undefined') ? TIMELINE_DEFAULT_DATA : null;
  var stored = null;
  try { stored = JSON.parse(localStorage.getItem(TL_KEY) || 'null'); } catch (e) {}

  if (!def) return stored || { newItems: [], cancelItems: [] };
  if (!stored) return JSON.parse(JSON.stringify(def));
  if (stored.version === def.version) return stored;

  var mine = function (arr) {
    return (arr || []).filter(function (it) { return /^x/.test(it.id || ''); });
  };
  var merged = JSON.parse(JSON.stringify(def));
  merged.newItems = merged.newItems.concat(mine(stored.newItems));
  merged.cancelItems = merged.cancelItems.concat(mine(stored.cancelItems));
  save(merged);
  return merged;
}

function save(data) {
  try { localStorage.setItem(TL_KEY, JSON.stringify(data)); }
  catch (e) { alert('บันทึกไม่สำเร็จ พื้นที่เก็บข้อมูลของเบราว์เซอร์เต็ม'); }
}

function taskDone(item) {
  var t = item.tasks || {};
  var n = 0;
  TASKS.forEach(function (x) {
    var v = t[x.key] || '';
    if (/เสร็จ|ผ่าน|เรียบร้อย/.test(v) && !/ยังไม่|ไม่ผ่าน/.test(v)) n++;
  });
  return n;
}

function filtered(items) {
  var q = _f.search.trim().toLowerCase();
  return items.filter(function (it) {
    if (_f.channel && it.channel !== _f.channel) return false;
    if (_view === 'new') {
      if (_f.cust && (it.customer || {}).status !== _f.cust) return false;
      if (_f.task) {
        var t = it.tasks || {};
        var hit = TASKS.some(function (x) { return t[x.key] === _f.task; });
        if (!hit) return false;
      }
    }
    if (q) {
      var hay = (it.name + ' ' + (it.code || '') + ' ' + (it.channel || '')).toLowerCase();
      if (hay.indexOf(q) < 0) return false;
    }
    return true;
  });
}

/* ── หน้าหลัก ── */
window.renderProdTimeline = function () {
  var el = document.getElementById('prodContent');
  if (!el) return;
  var data = load();
  el.classList.add('tl-root');

  var all = _view === 'new' ? (data.newItems || []) : (data.cancelItems || []);
  var items = filtered(all);
  var isNew = _view === 'new';

  el.innerHTML =
    '<div class="tl-head">' +
      '<div class="tl-h1">📅 Time Line สินค้า' +
        '<small>ที่มา: ' + esc(data.source || 'Time Line Product.xlsx') +
        (data.asOf ? ' · ข้อมูล ณ ' + fmtDate(data.asOf) : '') + '</small></div>' +
      '<button class="tl-vbtn' + (isNew ? ' on' : '') + '" style="border-color:#22c55e;color:#16a34a' +
        (isNew ? ';background:#22c55e' : '') + '" onclick="_tlView(\'new\')">🆕 สินค้าใหม่ (' +
        (data.newItems || []).length + ')</button>' +
      '<button class="tl-vbtn' + (!isNew ? ' on' : '') + '" style="border-color:#ef4444;color:#dc2626' +
        (!isNew ? ';background:#ef4444' : '') + '" onclick="_tlView(\'cancel\')">❌ สินค้ายกเลิก (' +
        (data.cancelItems || []).length + ')</button>' +
    '</div>' +
    (isNew ? kpisNew(data.newItems || []) : kpisCancel(data.cancelItems || [])) +
    filterBar(data, all, items.length) +
    (items.length
      ? (isNew ? tableNew(items, data) : tableCancel(items, data))
      : '<div class="tl-empty"><div class="tl-big">🔍</div><h3>ไม่พบรายการที่ตรงกับเงื่อนไข</h3>' +
        '<p>ลองล้างตัวกรองหรือเปลี่ยนคำค้น</p></div>') +
    (isNew && items.length ? legend() : '');
};

function kpiBox(color, label, val) {
  return '<div class="tl-kpi" style="border-left-color:' + color + '">' +
    '<div class="tl-kpi-lbl">' + label + '</div>' +
    '<div class="tl-kpi-val" style="color:' + color + '">' + val + '</div></div>';
}

function kpisNew(all) {
  var st = function (i) { return (i.customer || {}).status || ''; };
  return '<div class="tl-kpis">' +
    kpiBox('#0891b2', 'สินค้าใหม่ทั้งหมด', all.length) +
    kpiBox('#16a34a', 'ลูกค้าอนุมัติแล้ว', all.filter(function (i) { return /ผ่าน/.test(st(i)) && !/ไม่ผ่าน/.test(st(i)); }).length) +
    kpiBox('#1d4ed8', 'กำลังพัฒนา', all.filter(function (i) { return /กำลังพัฒนา/.test(st(i)); }).length) +
    kpiBox('#b45309', 'รอดำเนินการ', all.filter(function (i) { return /^รอ/.test(st(i)); }).length) +
    kpiBox('#7c3aed', 'มีวันกำหนดขาย', all.filter(function (i) { return i.sellDate; }).length) +
  '</div>';
}

function kpisCancel(all) {
  var sum = function (f) { return all.reduce(function (s, i) { return s + (f(i) || 0); }, 0); };
  return '<div class="tl-kpis">' +
    kpiBox('#dc2626', 'สินค้ายกเลิกทั้งหมด', all.length) +
    kpiBox('#b45309', 'แพ็คเกจจิ้งคงเหลือ', fmtNum(sum(function (i) { return ((i.stock || {}).packaging || {}).total; }))) +
    kpiBox('#7c3aed', 'สติ๊กเกอร์คงเหลือ', fmtNum(sum(function (i) { return ((i.stock || {}).sticker || {}).total; }))) +
  '</div>';
}

function filterBar(data, all, shown) {
  var chs = uniq(all.map(function (i) { return i.channel; }));
  var opt = function (v, cur, label) {
    return '<option value="' + esc(v) + '"' + (cur === v ? ' selected' : '') + '>' + esc(label || v) + '</option>';
  };

  var h = '<div class="tl-bar">' +
    '<input class="tl-in" style="width:220px" placeholder="🔍 ค้นหาชื่อสินค้า / รหัส" value="' + esc(_f.search) +
      '" oninput="_tlSet(\'search\',this.value)">' +
    '<select class="tl-in" onchange="_tlSet(\'channel\',this.value)">' + opt('', _f.channel, 'ทุกช่องทาง') +
      chs.map(function (c) { return opt(c, _f.channel); }).join('') + '</select>';

  if (_view === 'new') {
    h += '<select class="tl-in" onchange="_tlSet(\'cust\',this.value)">' +
        opt('', _f.cust, 'สถานะลูกค้า: ทั้งหมด') +
        (data.approvalOptions || []).map(function (o) { return opt(o, _f.cust); }).join('') + '</select>' +
      '<select class="tl-in" onchange="_tlSet(\'task\',this.value)">' +
        opt('', _f.task, 'สถานะงาน: ทั้งหมด') +
        (data.taskOptions || []).map(function (o) { return opt(o, _f.task); }).join('') + '</select>';
  }

  h += '<button class="tl-btn" style="border-color:#0891b2;color:#0891b2" onclick="_tlAdd()">➕ ' +
      (_view === 'new' ? 'เพิ่มสินค้าใหม่' : 'แจ้งยกเลิกสินค้า') + '</button>' +
    '<span class="tl-count">แสดง <b>' + shown + '</b> จาก ' + all.length + ' รายการ</span>' +
  '</div>';
  return h;
}

function catChip(cat) {
  if (!cat) return '';
  var chill = /chill/i.test(cat);
  return '<span class="tl-chip" style="background:' + (chill ? '#ecfeff;color:#0e7490' : '#fef3c7;color:#b45309') +
    '">' + esc(cat) + '</span>';
}
var DASH = '<span style="color:#cbd5e1">—</span>';

/* ── ตารางสินค้าใหม่ (NPD) — หัวข้อตรงตาม Excel ── */
function tableNew(items, data) {
  var head =
    '<thead>' +
      '<tr>' +
        '<th rowspan="2">ลำดับ</th>' +
        '<th rowspan="2" class="tl-name">ชื่อสินค้า</th>' +
        '<th rowspan="2">ช่องทาง</th>' +
        '<th rowspan="2">ประเภท<br>สินค้า</th>' +
        '<th rowspan="2">จำนวน<br>ชิ้น/หน่วย</th>' +
        '<th colspan="2" class="tl-grp">สถานะ</th>' +
        '<th rowspan="2">วันที่<br>กำหนดขาย</th>' +
        '<th colspan="' + TASKS.length + '" class="tl-grp">สิ่งที่เกี่ยวข้อง</th>' +
        '<th rowspan="2">ความ<br>คืบหน้า</th>' +
        '<th rowspan="2">จัดการ</th>' +
      '</tr>' +
      '<tr>' +
        '<th class="tl-r2 tl-st">คุณอู๋</th>' +
        '<th class="tl-r2 tl-st">ลูกค้า</th>' +
        TASKS.map(function (t) {
          return '<th class="tl-r2" title="' + esc((t.grp ? t.grp + ' › ' : '') + t.label) + '">' +
            (t.grp ? '<span style="font-size:9.5px;color:#94a3b8;display:block">' + esc(t.grp) + '</span>' : '') +
            esc(t.label) + '</th>';
        }).join('') +
      '</tr>' +
    '</thead>';

  var arr = data.newItems || [];
  var body = '<tbody>' + items.map(function (it, i) {
    var own = approvalStyle((it.owner || {}).status);
    var cus = approvalStyle((it.customer || {}).status);
    var done = taskDone(it);
    var pct = Math.round((done / TASKS.length) * 100);
    var idx = arr.indexOf(it);

    return '<tr>' +
      '<td class="tl-c" style="color:var(--tl-muted)">' + (it.seq || i + 1) + '</td>' +
      '<td class="tl-name">' + esc(it.name) +
        (it.sellDateNote ? '<div class="tl-sub">📌 ' + esc(it.sellDateNote) + '</div>' : '') + '</td>' +
      '<td class="tl-c">' + esc(it.channel || '') + '</td>' +
      '<td class="tl-c">' + catChip(it.category) + '</td>' +
      '<td class="tl-num">' + fmtNum(it.packSize) + '</td>' +
      '<td class="tl-c tl-st"><span class="tl-chip" style="background:' + own.bg + ';color:' + own.fg + '">' +
        esc(own.label) + '</span>' +
        ((it.owner || {}).note ? '<div class="tl-note">' + esc(it.owner.note) + '</div>' : '') + '</td>' +
      '<td class="tl-c tl-st"><span class="tl-chip" style="background:' + cus.bg + ';color:' + cus.fg + '">' +
        esc(cus.label) + '</span>' +
        ((it.customer || {}).note ? '<div class="tl-note">' + esc(it.customer.note) + '</div>' : '') + '</td>' +
      '<td class="tl-c" style="white-space:nowrap">' +
        (it.sellDate ? '<b>' + fmtDate(it.sellDate) + '</b>' : DASH) + '</td>' +
      TASKS.map(function (t) {
        var st = taskStyle((it.tasks || {})[t.key]);
        return '<td class="tl-c"><span class="tl-task ' + st.cls + '" title="' +
          esc((t.grp ? t.grp + ' › ' : '') + t.label + ': ' + st.label) + '">' + st.icon + '</span></td>';
      }).join('') +
      '<td><div class="tl-prog"><div class="tl-prog-bar"><i style="width:' + pct + '%"></i></div>' +
        '<span class="tl-prog-txt">' + done + '/' + TASKS.length + '</span></div></td>' +
      '<td><div class="tl-act">' +
        '<button class="tl-ibtn" title="แก้ไข" onclick="_tlEdit(\'new\',' + idx + ')">✏️</button>' +
        '<button class="tl-ibtn" title="ลบ" onclick="_tlDel(\'new\',' + idx + ')">🗑️</button>' +
      '</div></td>' +
    '</tr>';
  }).join('') + '</tbody>';

  return '<div class="tl-wrap"><table class="tl-tbl">' + head + body + '</table></div>';
}

/* ── ตารางสินค้ายกเลิก — หัวข้อตรงตามชีท "ยกเลิก" ── */
function tableCancel(items, data) {
  var head =
    '<thead>' +
      '<tr>' +
        '<th rowspan="3">ลำดับ</th>' +
        '<th rowspan="3" class="tl-name">ชื่อสินค้า</th>' +
        '<th rowspan="3">ช่องทาง</th>' +
        '<th rowspan="3">รหัสสินค้า</th>' +
        '<th rowspan="3">ประเภท<br>สินค้า</th>' +
        '<th rowspan="3">จำนวน<br>ชิ้น/หน่วย</th>' +
        '<th rowspan="3">วันที่</th>' +
        '<th colspan="3" class="tl-grp">สาเหตุ</th>' +
        '<th colspan="6" class="tl-grp">วัตถุดิบในคลัง</th>' +
        '<th colspan="4" class="tl-grp">ประสานงาน</th>' +
        '<th rowspan="3">จัดการ</th>' +
      '</tr>' +
      '<tr>' +
        '<th class="tl-r2" rowspan="2">สาเหตุ 1</th>' +
        '<th class="tl-r2" rowspan="2">สาเหตุ 2</th>' +
        '<th class="tl-r2" rowspan="2">สาเหตุ 3</th>' +
        '<th class="tl-r2" colspan="3">แพ็คเกจจิ้ง</th>' +
        '<th class="tl-r2" colspan="3">สติ๊กเกอร์</th>' +
        '<th class="tl-r2" rowspan="2">แจ้งทีม</th>' +
        '<th class="tl-r2" rowspan="2">แจ้งวางแผน</th>' +
        '<th class="tl-r2" rowspan="2">แจ้งผลิต</th>' +
        '<th class="tl-r2" rowspan="2">แจ้งคลัง</th>' +
      '</tr>' +
      '<tr>' +
        '<th>คลัง</th><th>คุณเปิ้ล</th><th>รวม</th>' +
        '<th>คลัง</th><th>คุณเปิ้ล</th><th>รวม</th>' +
      '</tr>' +
    '</thead>';

  var okChip = function (v) {
    if (!v) return DASH;
    var ok = /เรียบร้อย|เสร็จ/.test(v);
    return '<span class="tl-chip" style="background:' +
      (ok ? '#dcfce7;color:#15803d' : '#fef3c7;color:#b45309') + '">' + esc(v) + '</span>';
  };

  var arr = data.cancelItems || [];
  var body = '<tbody>' + items.map(function (it, i) {
    var idx = arr.indexOf(it);
    var st = it.stock || {};
    var pkg = st.packaging || {}, stk = st.sticker || {};
    var nf = it.notify || {};
    var r = it.reasons || [];
    return '<tr>' +
      '<td class="tl-c" style="color:var(--tl-muted)">' + (it.seq || i + 1) + '</td>' +
      '<td class="tl-name">' + esc(it.name) + '</td>' +
      '<td class="tl-c">' + esc(it.channel || '') + '</td>' +
      '<td class="tl-c" style="font-family:Consolas,monospace;font-size:11.5px">' + esc(it.code || '') + '</td>' +
      '<td class="tl-c">' + catChip(it.category) + '</td>' +
      '<td class="tl-num">' + fmtNum(it.packSize) + '</td>' +
      '<td class="tl-c" style="white-space:nowrap">' +
        (it.date ? fmtDate(it.date) : '<span class="tl-note">' + esc(it.dateNote || '') + '</span>') + '</td>' +
      '<td>' + (r[0] ? esc(r[0]) : DASH) + '</td>' +
      '<td>' + (r[1] ? esc(r[1]) : DASH) + '</td>' +
      '<td>' + (r[2] ? esc(r[2]) : DASH) + '</td>' +
      '<td class="tl-num">' + fmtNum(pkg.warehouse) + '</td>' +
      '<td class="tl-num">' + fmtNum(pkg.staff) + '</td>' +
      '<td class="tl-num"><b>' + fmtNum(pkg.total) + '</b></td>' +
      '<td class="tl-num">' + fmtNum(stk.warehouse) + '</td>' +
      '<td class="tl-num">' + fmtNum(stk.staff) + '</td>' +
      '<td class="tl-num"><b>' + fmtNum(stk.total) + '</b></td>' +
      '<td class="tl-c">' + okChip(nf.team) + '</td>' +
      '<td class="tl-c">' + okChip(nf.plan) + '</td>' +
      '<td class="tl-c">' + okChip(nf.prod) + '</td>' +
      '<td class="tl-c">' + okChip(nf.store) + '</td>' +
      '<td><div class="tl-act">' +
        '<button class="tl-ibtn" title="แก้ไข" onclick="_tlEdit(\'cancel\',' + idx + ')">✏️</button>' +
        '<button class="tl-ibtn" title="ลบ" onclick="_tlDel(\'cancel\',' + idx + ')">🗑️</button>' +
      '</div></td>' +
    '</tr>';
  }).join('') + '</tbody>';

  return '<div class="tl-wrap"><table class="tl-tbl">' + head + body + '</table></div>';
}

function legend() {
  var ic = function (cls, sym) {
    return '<span class="tl-task ' + cls + '" style="width:20px;height:20px;font-size:11px">' + sym + '</span>';
  };
  return '<div class="tl-legend"><b>สัญลักษณ์ในกลุ่ม "สิ่งที่เกี่ยวข้อง":</b>' +
    '<span>' + ic('tl-t-done', '✓') + ' เสร็จแล้ว</span>' +
    '<span>' + ic('tl-t-prog', '◐') + ' กำลังดำเนินการ</span>' +
    '<span>' + ic('tl-t-wait', '⏳') + ' รอ (สั่งซื้อ / RD / อนุมัติ / บัญชีต้นทุน)</span>' +
    '<span>' + ic('tl-t-none', '–') + ' ยังไม่กรอก</span>' +
    '<span style="color:var(--tl-muted)">เอาเมาส์ชี้ที่สัญลักษณ์เพื่อดูข้อความเต็ม</span>' +
  '</div>';
}

/* ── ฟอร์มเพิ่ม/แก้ไข ── */
function form(type, item) {
  item = item || {};
  var isNew = type === 'new';
  var data = load();
  var accent = isNew ? '#0891b2' : '#dc2626';
  var t = item.tasks || {};

  var sel = function (id, val, opts, blank) {
    return '<select class="tl-in" id="' + id + '"><option value="">' + (blank || '— ยังไม่ระบุ —') + '</option>' +
      opts.map(function (o) {
        return '<option' + (val === o ? ' selected' : '') + '>' + esc(o) + '</option>';
      }).join('') + '</select>';
  };
  var fld = function (label, inner) {
    return '<div class="tl-fld"><label>' + label + '</label>' + inner + '</div>';
  };
  var input = function (id, val, ph, type2) {
    return '<input class="tl-in" id="' + id + '" value="' + esc(val == null ? '' : val) + '"' +
      (type2 ? ' type="' + type2 + '"' : '') + (ph ? ' placeholder="' + esc(ph) + '"' : '') + '>';
  };

  var chs = uniq((data.newItems || []).concat(data.cancelItems || [])
    .map(function (i) { return i.channel; }));

  var h = '<div class="tl-form">' +
    '<div class="tl-form-hd" style="background:' + accent + '">' +
      (isNew ? '🆕 ' : '❌ ') +
      (_editing ? 'แก้ไขข้อมูล' : (isNew ? 'เพิ่มสินค้าใหม่' : 'แจ้งยกเลิกสินค้า')) + '</div>' +
    '<div class="tl-form-bd">' +
      '<div class="tl-sec">ข้อมูลสินค้า</div>' +
      '<div class="tl-grid">' +
        fld('ชื่อสินค้า', input('tlName', item.name, 'ชื่อสินค้า')) +
        fld('ช่องทาง', sel('tlChannel', item.channel, chs, '— เลือกช่องทาง —')) +
        fld('ประเภทสินค้า', sel('tlCategory', item.category, ['Chill', 'Ambient', 'Frozen'])) +
        fld('จำนวนชิ้น/หน่วย', input('tlPack', item.packSize, '', 'number')) +
        (isNew ? '' : fld('รหัสสินค้า', input('tlCode', item.code, 'เช่น 20065595'))) +
      '</div>';

  if (isNew) {
    h += '<div class="tl-sec">สถานะ</div>' +
      '<div class="tl-grid">' +
        fld('สถานะ (คุณอู๋)', sel('tlOwnerSt', (item.owner || {}).status, data.approvalOptions || [])) +
        fld('หมายเหตุ (คุณอู๋)', input('tlOwnerNote', (item.owner || {}).note, 'เช่น รอตัวอย่าง 21/08/2569')) +
        fld('สถานะ (ลูกค้า)', sel('tlCustSt', (item.customer || {}).status, data.approvalOptions || [])) +
        fld('หมายเหตุ (ลูกค้า)', input('tlCustNote', (item.customer || {}).note, 'เช่น รอกำหนดขาย')) +
        fld('วันที่กำหนดขาย', input('tlSellDate', item.sellDate, '', 'date')) +
      '</div>' +
      '<div class="tl-sec">สิ่งที่เกี่ยวข้อง</div>' +
      '<div class="tl-grid">' +
        TASKS.map(function (x) {
          return fld((x.grp ? x.grp + ' › ' : '') + x.label,
            sel('tlT_' + x.key, t[x.key], data.taskOptions || []));
        }).join('') +
      '</div>';
  } else {
    h += '<div class="tl-sec">สาเหตุที่ยกเลิก</div>' +
      '<div class="tl-grid">' +
        fld('วันที่', input('tlDate', item.date, '', 'date')) +
        fld('สาเหตุ 1', input('tlR1', (item.reasons || [])[0], 'เช่น ยอดขายไม่เป็นไปตามเป้าหมาย')) +
        fld('สาเหตุ 2', input('tlR2', (item.reasons || [])[1], '')) +
        fld('สาเหตุ 3', input('tlR3', (item.reasons || [])[2], '')) +
      '</div>' +
      '<div class="tl-sec">วัตถุดิบในคลัง <span style="font-size:11px;font-weight:500;color:#94a3b8">' +
        '(ยอดรวมคำนวณให้อัตโนมัติ)</span></div>' +
      '<div class="tl-grid">' +
        fld('แพ็คเกจจิ้ง — คลัง', input('tlPkgW', ((item.stock || {}).packaging || {}).warehouse, '', 'number')) +
        fld('แพ็คเกจจิ้ง — คุณเปิ้ล', input('tlPkgS', ((item.stock || {}).packaging || {}).staff, '', 'number')) +
        fld('สติ๊กเกอร์ — คลัง', input('tlStkW', ((item.stock || {}).sticker || {}).warehouse, '', 'number')) +
        fld('สติ๊กเกอร์ — คุณเปิ้ล', input('tlStkS', ((item.stock || {}).sticker || {}).staff, '', 'number')) +
      '</div>' +
      '<div class="tl-sec">ประสานงาน</div>' +
      '<div class="tl-grid">' +
        fld('แจ้งทีม', sel('tlNfTeam', (item.notify || {}).team, ['เรียบร้อย', 'กำลังดำเนินการ'])) +
        fld('แจ้งวางแผน', sel('tlNfPlan', (item.notify || {}).plan, ['เรียบร้อย', 'กำลังดำเนินการ'])) +
        fld('แจ้งผลิต', sel('tlNfProd', (item.notify || {}).prod, ['เรียบร้อย', 'กำลังดำเนินการ'])) +
        fld('แจ้งคลัง', sel('tlNfStore', (item.notify || {}).store, ['เรียบร้อย', 'กำลังดำเนินการ'])) +
      '</div>';
  }

  h += '</div><div class="tl-form-ft">' +
      '<button class="tl-btn" style="border-color:#cbd5e1;color:#64748b" onclick="_tlCancelForm()">ยกเลิก</button>' +
      '<button class="tl-btn" style="border-color:' + accent + ';background:' + accent +
        ';color:#fff" onclick="_tlSave(\'' + type + '\')">💾 บันทึก</button>' +
    '</div></div>';
  return h;
}

/* ── ตัวจัดการเหตุการณ์ ── */
window._tlView = function (v) {
  _view = v;
  _f = { search: '', channel: '', cust: '', task: '' };
  renderProdTimeline();
};
window._tlSet = function (k, v) { _f[k] = v; renderProdTimeline(); };

window._tlAdd = function () {
  _editing = null;
  var el = document.getElementById('prodContent');
  if (el) { el.classList.add('tl-root'); el.innerHTML = form(_view, {}); }
};

window._tlEdit = function (type, idx) {
  var data = load();
  var arr = type === 'new' ? data.newItems : data.cancelItems;
  if (!arr || !arr[idx]) return;
  _editing = { type: type, idx: idx };
  var el = document.getElementById('prodContent');
  if (el) { el.classList.add('tl-root'); el.innerHTML = form(type, arr[idx]); }
};

window._tlDel = function (type, idx) {
  var data = load();
  var arr = type === 'new' ? data.newItems : data.cancelItems;
  if (!arr || !arr[idx]) return;
  if (!confirm('ยืนยันลบ "' + arr[idx].name + '" ออกจากรายการ?')) return;
  arr.splice(idx, 1);
  save(data);
  renderProdTimeline();
};

window._tlCancelForm = function () { _editing = null; renderProdTimeline(); };

window._tlSave = function (type) {
  var g = function (id) { var e = document.getElementById(id); return e ? String(e.value || '').trim() : ''; };
  var gn = function (id) { var v = g(id); return v === '' ? null : (parseFloat(v) || 0); };
  var isNew = type === 'new';

  var name = g('tlName');
  if (!name) { alert('กรุณาใส่ชื่อสินค้า'); return; }

  var item = {
    name: name,
    channel: g('tlChannel'),
    category: g('tlCategory'),
    packSize: gn('tlPack')
  };

  if (isNew) {
    item.owner = { status: g('tlOwnerSt'), note: g('tlOwnerNote') };
    item.customer = { status: g('tlCustSt'), note: g('tlCustNote') };
    item.sellDate = g('tlSellDate') || null;
    item.tasks = {};
    TASKS.forEach(function (x) { item.tasks[x.key] = g('tlT_' + x.key); });
  } else {
    item.code = g('tlCode');
    item.date = g('tlDate') || null;
    item.reasons = [g('tlR1'), g('tlR2'), g('tlR3')].filter(Boolean);
    var pw = gn('tlPkgW'), ps = gn('tlPkgS'), sw = gn('tlStkW'), ss = gn('tlStkS');
    // ยอดรวมคำนวณให้เอง ไม่ต้องกรอกซ้ำแล้วเสี่ยงไม่ตรงกัน
    item.stock = {
      packaging: { warehouse: pw, staff: ps, total: ((pw || 0) + (ps || 0)) || null },
      sticker:   { warehouse: sw, staff: ss, total: ((sw || 0) + (ss || 0)) || null }
    };
    item.notify = { team: g('tlNfTeam'), plan: g('tlNfPlan'), prod: g('tlNfProd'), store: g('tlNfStore') };
  }

  var data = load();
  var arr = isNew ? data.newItems : data.cancelItems;

  if (_editing && _editing.idx !== undefined && arr[_editing.idx]) {
    var old = arr[_editing.idx];
    item.id = old.id;
    item.seq = old.seq;
    arr[_editing.idx] = Object.assign({}, old, item);
  } else {
    item.id = genId();               // ขึ้นต้น x = รายการที่เพิ่มเอง จะไม่ถูกทับตอน Excel อัปเดต
    item.seq = arr.length + 1;
    arr.push(item);
  }

  save(data);
  _editing = null;
  renderProdTimeline();
};

})();
