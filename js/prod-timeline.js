/* prod-timeline.js — Time Line สินค้า (สินค้าใหม่ NPD / สินค้ายกเลิก)
   แสดงเป็นตารางที่มีหัวข้อครบตามไฟล์ Time Line Product.xlsx
   ข้อมูลตั้งต้นมาจาก js/prod-timeline-data.js (สร้างโดย scripts/build-timeline-data.js)
   สิ่งที่ผู้ใช้แก้ผ่านหน้าเว็บเก็บใน localStorage แยกจากข้อมูลตั้งต้น */
(function () {
'use strict';

var TL_KEY = 'prod_timeline_v2';        // v1 เป็นสคีมาเก่า คนละคอลัมน์กัน จึงขึ้นคีย์ใหม่
var _view = 'new';                      // 'new' | 'cancel'
var _layout = 'card';                   // 'card' | 'table'
var _f = { search: '', channel: '', cust: '', task: '', deadline: '' };
var _editing = null;
var _expanded = {};                     // track expanded cards by id

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

var PIPELINE = [
  { key: 'dev',     label: 'พัฒนาสูตร',   icon: '🔬' },
  { key: 'sample',  label: 'ส่งตัวอย่าง', icon: '📦' },
  { key: 'taste1',  label: 'ชิม #1',      icon: '🍴' },
  { key: 'taste2',  label: 'ชิม #2',      icon: '🍴' },
  { key: 'taste3',  label: 'ชิม #3',      icon: '🍴' },
  { key: 'approve', label: 'ผ่านอนุมัติ',  icon: '✅' },
  { key: 'cost',    label: 'ต้นทุน',      icon: '💰' },
  { key: 'quote',   label: 'ใบเสนอราคา', icon: '📋' },
  { key: 'label',   label: 'ฉลาก',       icon: '🏷️' },
  { key: 'material',label: 'วัตถุดิบ',    icon: '🧱' },
  { key: 'shelf',   label: 'อายุสินค้า',  icon: '⏱️' },
  { key: 'fda',     label: 'อย.',         icon: '📜' },
  { key: 'ready',   label: 'พร้อมขาย',   icon: '🚀' }
];

function stageStatus(item, stageKey) {
  var ow = (item.owner || {}).status || '';
  var cu = (item.customer || {}).status || '';
  var ts = item.tasting || [];
  var tk = item.tasks || {};
  var isDoneTask = function(v) { return /เสร็จ|ผ่าน|เรียบร้อย/.test(v) && !/ยังไม่|ไม่ผ่าน/.test(v); };
  var isTerminated = /ไม่ผ่าน/.test(cu) && /ไม่พัฒนาต่อ/.test((item.customer || {}).note || '');
  var custApproved = /ผ่าน/.test(cu) && !/ไม่ผ่าน/.test(cu);

  switch (stageKey) {
    case 'dev':     return (item.developer || custApproved) ? 'done' : 'pending';
    case 'sample':  return (ow || cu) ? (/รอส่งตัวอย่าง/.test(cu) ? 'active' : 'done') : 'pending';
    case 'taste1':
      if (custApproved) return 'done';
      return (ts[0] && ts[0].date) ? 'done' : (ow || cu) ? 'active' : 'pending';
    case 'taste2':
      if (custApproved) return 'done';
      var t1Pass = ts[0] && /ผ่าน/.test(ts[0].note || '') && !/ไม่ผ่าน/.test(ts[0].note || '');
      if (t1Pass) return 'done';
      return (ts[1] && ts[1].date) ? 'done' : (ts[0] && ts[0].date) ? 'active' : 'pending';
    case 'taste3':
      if (custApproved) return 'done';
      var anyPass = (ts[0] && /ผ่าน/.test(ts[0].note || '') && !/ไม่ผ่าน/.test(ts[0].note || '')) ||
                    (ts[1] && /ผ่าน/.test(ts[1].note || '') && !/ไม่ผ่าน/.test(ts[1].note || ''));
      if (anyPass) return 'done';
      return (ts[2] && ts[2].date) ? 'done' : (ts[1] && ts[1].date) ? 'active' : 'pending';
    case 'approve': return custApproved ? 'done' : isTerminated ? 'fail' : 'pending';
    case 'cost':    return isDoneTask(tk.cost) ? 'done' : tk.cost ? 'active' : 'pending';
    case 'quote':   return isDoneTask(tk.quote) ? 'done' : tk.quote ? 'active' : 'pending';
    case 'label':
      var ld = isDoneTask(tk.labelDesign), lo = isDoneTask(tk.labelOrder), ls = isDoneTask(tk.labelStock);
      return (ld && lo && ls) ? 'done' : (tk.labelDesign || tk.labelOrder || tk.labelStock) ? 'active' : 'pending';
    case 'material': return isDoneTask(tk.material) ? 'done' : tk.material ? 'active' : 'pending';
    case 'shelf':    return isDoneTask(tk.shelfLife) ? 'done' : tk.shelfLife ? 'active' : 'pending';
    case 'fda':      return isDoneTask(tk.fda) ? 'done' : tk.fda ? 'active' : 'pending';
    case 'ready':
      var allDone = ['cost','quote','material'].every(function(k) { return isDoneTask(tk[k]); });
      allDone = allDone && isDoneTask(tk.labelDesign) && isDoneTask(tk.labelOrder) && isDoneTask(tk.labelStock);
      allDone = allDone && isDoneTask(tk.shelfLife) && isDoneTask(tk.fda);
      allDone = allDone && /ผ่าน/.test(cu) && !/ไม่ผ่าน/.test(cu);
      return allDone ? 'done' : 'pending';
    default: return 'pending';
  }
}

function getItemPhase(item) {
  var cu = (item.customer || {}).status || '';
  var cuNote = (item.customer || {}).note || '';
  if (/ไม่ผ่าน/.test(cu) && /ไม่พัฒนาต่อ/.test(cuNote)) return { phase: 'terminated', label: 'ยุติการพัฒนา', color: '#dc2626' };
  if (/ไม่ผ่าน/.test(cu)) return { phase: 'rejected', label: 'ไม่ผ่าน', color: '#dc2626' };

  for (var i = 0; i < PIPELINE.length; i++) {
    var ss = stageStatus(item, PIPELINE[i].key);
    if (ss === 'active') return { phase: 'active', label: PIPELINE[i].label, color: '#f59e0b', stageIdx: i };
    if (ss === 'fail') return { phase: 'fail', label: 'ไม่ผ่าน — ' + PIPELINE[i].label, color: '#dc2626', stageIdx: i };
    if (ss === 'pending') return { phase: 'waiting', label: 'รอ — ' + PIPELINE[i].label, color: '#6366f1', stageIdx: i };
  }
  return { phase: 'complete', label: 'พร้อมขาย', color: '#16a34a' };
}

function checklistProgress(item) {
  var checks = [
    { label: 'สูตรสินค้า', done: !!item.developer },
    { label: 'ต้นทุน', done: stageStatus(item, 'cost') === 'done' },
    { label: 'ใบเสนอราคา', done: stageStatus(item, 'quote') === 'done' },
    { label: 'ออกแบบฉลาก', done: /เสร็จ|ผ่าน|เรียบร้อย/.test((item.tasks||{}).labelDesign||'') },
    { label: 'สั่งผลิตฉลาก', done: /เสร็จ|ผ่าน|เรียบร้อย/.test((item.tasks||{}).labelOrder||'') },
    { label: 'ฉลากเข้าสต๊อก', done: /เสร็จ|ผ่าน|เรียบร้อย/.test((item.tasks||{}).labelStock||'') },
    { label: 'วัตถุดิบ', done: stageStatus(item, 'material') === 'done' },
    { label: 'นูทริชั่น', done: stageStatus(item, 'shelf') === 'done' },
    { label: 'อย.', done: stageStatus(item, 'fda') === 'done' }
  ];
  var doneCount = checks.filter(function(c) { return c.done; }).length;
  return { checks: checks, done: doneCount, total: checks.length, pct: Math.round(doneCount / checks.length * 100) };
}

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

function todayStr() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function isDone(status) {
  var s = String(status || '');
  return /เสร็จ|ผ่าน|เรียบร้อย/.test(s) && !/ยังไม่|ไม่ผ่าน/.test(s);
}

function deadlineStatus(item, taskKey) {
  var dl = (item.taskDeadlines || {})[taskKey];
  if (!dl) return null;
  var status = (item.tasks || {})[taskKey] || '';
  if (isDone(status)) return 'done';
  var today = todayStr();
  if (dl < today) return 'overdue';
  var soon = new Date();
  soon.setDate(soon.getDate() + 3);
  var soonStr = soon.getFullYear() + '-' + String(soon.getMonth() + 1).padStart(2, '0') + '-' + String(soon.getDate()).padStart(2, '0');
  if (dl <= soonStr) return 'soon';
  return 'ok';
}

function countOverdue(items) {
  var n = 0;
  items.forEach(function (it) {
    TASKS.forEach(function (t) {
      if (deadlineStatus(it, t.key) === 'overdue') n++;
    });
  });
  return n;
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  var parts = dateStr.split('-');
  var target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  var now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / 86400000);
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
      if (_f.deadline === 'overdue') {
        var hasOverdue = TASKS.some(function (x) { return deadlineStatus(it, x.key) === 'overdue'; });
        if (!hasOverdue) return false;
      } else if (_f.deadline === 'soon') {
        var hasSoon = TASKS.some(function (x) { var ds = deadlineStatus(it, x.key); return ds === 'overdue' || ds === 'soon'; });
        if (!hasSoon) return false;
      } else if (_f.deadline === 'has') {
        var hasDl = TASKS.some(function (x) { return (it.taskDeadlines || {})[x.key]; });
        if (!hasDl) return false;
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
      ? (isNew
          ? (_layout === 'card' ? cardsNew(items, data) : tableNew(items, data))
          : tableCancel(items, data))
      : '<div class="tl-empty"><div class="tl-big">🔍</div><h3>ไม่พบรายการที่ตรงกับเงื่อนไข</h3>' +
        '<p>ลองล้างตัวกรองหรือเปลี่ยนคำค้น</p></div>') +
    (isNew && items.length && _layout === 'table' ? ganttStrip(items) : '') +
    (isNew && items.length && _layout === 'table' ? legend() : '');
};

function kpiBox(color, label, val) {
  return '<div class="tl-kpi" style="border-left-color:' + color + '">' +
    '<div class="tl-kpi-lbl">' + label + '</div>' +
    '<div class="tl-kpi-val" style="color:' + color + '">' + val + '</div></div>';
}

function kpisNew(all) {
  var phases = { developing: 0, waitTaste: 0, approved: 0, rejected: 0, stuck: 0, nearSell: 0, overdue: 0 };
  all.forEach(function(it) {
    var ph = getItemPhase(it);
    if (ph.phase === 'terminated' || ph.phase === 'rejected' || ph.phase === 'fail') phases.rejected++;
    else if (ph.phase === 'complete') phases.approved++;
    else {
      var cu = (it.customer||{}).status||'';
      if (/ผ่าน/.test(cu) && !/ไม่ผ่าน/.test(cu)) phases.approved++;
      else if (/รอ/.test(cu) || /รอชิม|รอส่ง/.test((it.customer||{}).note||'')) phases.waitTaste++;
      else phases.developing++;
    }
    // check stuck (has active task with deadline overdue)
    TASKS.forEach(function(t) { if (deadlineStatus(it, t.key) === 'overdue') phases.stuck++; });
    // near sell date
    if (it.sellDate) {
      var d = daysUntil(it.sellDate);
      if (d !== null && d <= 14 && d >= 0) phases.nearSell++;
      if (d !== null && d < 0) phases.overdue++;
    }
  });

  return '<div class="tl-kpis">' +
    kpiBox('#0891b2', '🟢 สินค้าทั้งหมด', all.length) +
    kpiBox('#16a34a', '🔵 ผ่านการอนุมัติ', phases.approved) +
    kpiBox('#1d4ed8', '🟢 กำลังพัฒนา', phases.developing) +
    kpiBox('#b45309', '🟡 รอชิม/ส่งตัวอย่าง', phases.waitTaste) +
    kpiBox('#dc2626', '🔴 ไม่ผ่าน/ยุติ', phases.rejected) +
    (phases.stuck > 0 ? kpiBox('#7c3aed', '🟠 ติดขั้นตอน', phases.stuck + ' งาน') : '') +
    (phases.nearSell > 0 ? kpiBox('#0d9488', '📅 ใกล้ถึงกำหนดขาย', phases.nearSell) : '') +
    (phases.overdue > 0 ? kpiBox('#dc2626', '⚠️ เกินกำหนดขาย', phases.overdue) : '') +
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
        (data.taskOptions || []).map(function (o) { return opt(o, _f.task); }).join('') + '</select>' +
      '<select class="tl-in" onchange="_tlSet(\'deadline\',this.value)">' +
        opt('', _f.deadline, '⏰ กำหนดเสร็จ: ทั้งหมด') +
        opt('overdue', _f.deadline, '🔴 เลยกำหนด') +
        opt('soon', _f.deadline, '🟡 ใกล้ถึงกำหนด') +
        opt('has', _f.deadline, '📅 มีกำหนดเสร็จ') +
      '</select>';
  }

  if (_view === 'new') {
    h += '<div class="tl-layout-toggle">' +
      '<button class="tl-lbtn' + (_layout === 'card' ? ' on' : '') + '" onclick="_tlLayout(\'card\')" title="มุมมองการ์ด">▦</button>' +
      '<button class="tl-lbtn' + (_layout === 'table' ? ' on' : '') + '" onclick="_tlLayout(\'table\')" title="มุมมองตาราง">☰</button>' +
    '</div>';
  }

  h += '<button class="tl-btn" style="border-color:#0891b2;color:#0891b2" onclick="_tlAdd()">➕ ' +
      (_view === 'new' ? 'เพิ่มสินค้าใหม่' : 'แจ้งยกเลิกสินค้า') + '</button>' +
    '<div class="tl-export-wrap">' +
      '<button class="tl-btn tl-export-btn" style="border-color:#7c3aed;color:#7c3aed" onclick="_tlExportMenu()">📤 ส่งออก ▾</button>' +
      '<div id="tlExportMenu" class="tl-export-menu" style="display:none">' +
        '<button onclick="_tlExportExcel();_tlExportMenu()">📊 Excel (.xlsx)</button>' +
        '<button onclick="_tlExportPDF();_tlExportMenu()">📄 PDF</button>' +
        '<button onclick="_tlExportImage();_tlExportMenu()">🖼️ รูปภาพ (.png)</button>' +
      '</div>' +
    '</div>' +
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

/* ── Pipeline / Banner / Checklist helpers ── */
function pipelineBar(item) {
  var ph = getItemPhase(item);
  var isTerminated = ph.phase === 'terminated' || ph.phase === 'fail';

  var h = '<div class="tl-pipe">';
  PIPELINE.forEach(function(s, i) {
    var ss = stageStatus(item, s.key);
    var cls = 'tl-pipe-step';
    if (ss === 'done') cls += ' tl-pipe-done';
    else if (ss === 'active') cls += ' tl-pipe-active';
    else if (ss === 'fail') cls += ' tl-pipe-fail';
    else if (isTerminated) cls += ' tl-pipe-grey';
    h += '<div class="' + cls + '" title="' + esc(s.label) + '">' +
      '<div class="tl-pipe-dot">' + (ss === 'done' ? '✓' : ss === 'fail' ? '✗' : ss === 'active' ? '◉' : '○') + '</div>' +
      '<div class="tl-pipe-lbl">' + esc(s.label) + '</div>' +
    '</div>';
    if (i < PIPELINE.length - 1) h += '<div class="tl-pipe-line' + (ss === 'done' ? ' tl-pipe-line-done' : isTerminated ? ' tl-pipe-line-grey' : '') + '"></div>';
  });
  h += '</div>';
  return h;
}

function stuckBanner(item) {
  var ph = getItemPhase(item);
  if (ph.phase === 'terminated') {
    return '<div class="tl-banner tl-banner-term">🔴 ยุติการพัฒนา — ไม่ผ่านการอนุมัติจากลูกค้า' +
      ((item.customer||{}).note ? '<span> · ' + esc((item.customer||{}).note) + '</span>' : '') + '</div>';
  }
  if (ph.phase === 'rejected' || ph.phase === 'fail') {
    return '<div class="tl-banner tl-banner-fail">🔴 ไม่ผ่าน — ' + esc(ph.label) + '</div>';
  }

  var overdueItems = [];
  TASKS.forEach(function(t) {
    if (deadlineStatus(item, t.key) === 'overdue') {
      var dl = (item.taskDeadlines||{})[t.key];
      var days = Math.abs(daysUntil(dl));
      overdueItems.push((t.grp ? t.grp + ' › ' : '') + t.label + ' (เกิน ' + days + ' วัน)');
    }
  });
  if (overdueItems.length > 0) {
    return '<div class="tl-banner tl-banner-stuck">⚠️ ติดขั้นตอน: ' + overdueItems.join(', ') + '</div>';
  }

  if (ph.phase === 'active') {
    return '<div class="tl-banner tl-banner-info">🔵 กำลังดำเนินการ: ' + esc(ph.label) + '</div>';
  }
  return '';
}

function checklistBar(item) {
  var cl = checklistProgress(item);
  var h = '<div class="tl-checklist">' +
    '<div class="tl-cl-head">' +
      '<span class="tl-cl-title">ความพร้อมก่อนขาย</span>' +
      '<span class="tl-cl-pct" style="color:' + (cl.pct >= 80 ? '#16a34a' : cl.pct >= 50 ? '#b45309' : '#dc2626') + '">' + cl.pct + '%</span>' +
    '</div>' +
    '<div class="tl-cl-bar"><div class="tl-cl-fill" style="width:' + cl.pct + '%;background:' +
      (cl.pct >= 80 ? '#22c55e' : cl.pct >= 50 ? '#f59e0b' : '#ef4444') + '"></div></div>' +
    '<div class="tl-cl-items">';
  cl.checks.forEach(function(c) {
    h += '<span class="tl-cl-item' + (c.done ? ' tl-cl-done' : '') + '">' +
      (c.done ? '✅' : '⬜') + ' ' + esc(c.label) + '</span>';
  });
  h += '</div></div>';
  return h;
}

/* ── Card view สินค้าใหม่ ── */
function cardTaskIcon(item, t) {
  var st = taskStyle((item.tasks || {})[t.key]);
  var ds = deadlineStatus(item, t.key);
  var dl = (item.taskDeadlines || {})[t.key];
  var days = dl ? daysUntil(dl) : null;
  var dlCls = ds === 'overdue' ? ' tl-dl-over' : ds === 'soon' ? ' tl-dl-soon' : ds === 'done' ? ' tl-dl-done' : '';
  var tip = (t.grp ? t.grp + ' › ' : '') + t.label + ': ' + st.label;
  if (dl) tip += '\nกำหนด: ' + fmtDate(dl) + (ds === 'overdue' ? ' (เลย ' + Math.abs(days) + ' วัน)' : ds === 'soon' ? ' (อีก ' + days + ' วัน)' : '');
  return '<span class="tl-task ' + st.cls + dlCls + '" title="' + esc(tip) + '">' + st.icon + '</span>';
}

function cardDeadlineBadge(item) {
  var worst = null;
  var worstDays = 0;
  TASKS.forEach(function (t) {
    var ds = deadlineStatus(item, t.key);
    var dl = (item.taskDeadlines || {})[t.key];
    if (ds === 'overdue') {
      var d = Math.abs(daysUntil(dl));
      if (!worst || d > worstDays) { worst = 'overdue'; worstDays = d; }
    } else if (ds === 'soon' && worst !== 'overdue') {
      var d2 = daysUntil(dl);
      worst = 'soon'; worstDays = d2;
    }
  });
  if (worst === 'overdue') return '<span class="tl-cd-badge tl-cd-over">⚠ เลย ' + worstDays + ' วัน</span>';
  if (worst === 'soon') return '<span class="tl-cd-badge tl-cd-soon">⏰ อีก ' + worstDays + ' วัน</span>';
  var hasDl = TASKS.some(function (t) { return (item.taskDeadlines || {})[t.key]; });
  if (hasDl) return '<span class="tl-cd-badge tl-cd-ok">✓ ตามแผน</span>';
  return '';
}

function cardsNew(items, data) {
  var arr = data.newItems || [];
  var h = '<div class="tl-cards">';
  h += items.map(function (it, i) {
    var own = approvalStyle((it.owner || {}).status);
    var cus = approvalStyle((it.customer || {}).status);
    var ph = getItemPhase(it);
    var idx = arr.indexOf(it);
    var isOpen = _expanded[it.id || idx];
    var isTerminated = ph.phase === 'terminated' || ph.phase === 'fail';
    var isReady = ph.phase === 'complete';

    var cardCls = 'tl-card' + (isOpen ? ' tl-card-open' : '') + (isTerminated ? ' tl-card-term' : '') + (isReady ? ' tl-card-ready' : '');
    var card = '<div class="' + cardCls + '" onclick="_tlToggleCard(\'' + esc(it.id || idx) + '\')">';

    // Top banner for ready / terminated
    if (isReady) {
      var sellInfo = it.sellDate ? '🗓 กำหนดขาย: ' + fmtDate(it.sellDate) : (it.sellDateNote ? '📌 ' + esc(it.sellDateNote) : '⚠️ ยังไม่มีกำหนดขาย');
      card += '<div class="tl-topbar tl-topbar-ready">✅ พร้อมขาย — ' + sellInfo + '</div>';
    } else if (isTerminated) {
      card += '<div class="tl-topbar tl-topbar-term">❌ ไม่ผ่าน / ยุติการพัฒนา</div>';
    }

    // Header row 1: seq + name + actions
    card += '<div class="tl-cd-head">' +
      '<span class="tl-cd-seq">' + (it.seq || i + 1) + '</span>' +
      '<span class="tl-cd-name">' + esc(it.name) + '</span>' +
      '<div class="tl-cd-actions" onclick="event.stopPropagation()">' +
        '<button class="tl-ibtn" title="แก้ไข" onclick="_tlEdit(\'new\',' + idx + ')">✏️</button>' +
        '<button class="tl-ibtn" title="ลบ" onclick="_tlDel(\'new\',' + idx + ')">🗑️</button>' +
      '</div>' +
    '</div>' +
    // Header row 2: channel + category + developer chips
    '<div class="tl-cd-tags">' +
      '<span class="tl-cd-ch">' + esc(it.channel || '') + '</span>' +
      catChip(it.category) +
      (it.developer ? '<span class="tl-chip" style="background:#ede9fe;color:#6d28d9;font-size:10px">🔬 ' + esc(it.developer) + '</span>' : '') +
    '</div>';

    // Current status badge
    card += '<div class="tl-cd-phase" style="background:' + ph.color + '15;border-left:3px solid ' + ph.color + '">' +
      '<span style="color:' + ph.color + ';font-weight:700;font-size:12px">' + esc(ph.label) + '</span>' +
      (it.sellDate ? '<span class="tl-cd-sell">🗓 ขาย: ' + fmtDate(it.sellDate) + '</span>' : '') +
      (it.sellDateNote && !it.sellDate ? '<span class="tl-cd-sell">📌 ' + esc(it.sellDateNote) + '</span>' : '') +
    '</div>';

    // Pipeline progress bar (compact)
    card += '<div class="tl-pipe-compact">';
    var doneCount = 0;
    PIPELINE.forEach(function(s, si) {
      var ss = stageStatus(it, s.key);
      if (ss === 'done') doneCount++;
      var dotCls = ss === 'done' ? 'tl-pdot-done' : ss === 'active' ? 'tl-pdot-active' : ss === 'fail' ? 'tl-pdot-fail' : isTerminated ? 'tl-pdot-grey' : 'tl-pdot-pend';
      card += '<div class="tl-pdot ' + dotCls + '" title="' + esc(s.label + ': ' + (ss === 'done' ? 'เสร็จ' : ss === 'active' ? 'กำลังดำเนินการ' : ss === 'fail' ? 'ไม่ผ่าน' : 'รอ')) + '"></div>';
      if (si < PIPELINE.length - 1) card += '<div class="tl-pline' + (ss === 'done' ? ' tl-pline-done' : isTerminated ? ' tl-pline-grey' : '') + '"></div>';
    });
    card += '<span class="tl-pipe-pct">' + doneCount + '/' + PIPELINE.length + '</span>';
    card += '</div>';

    // Stuck/status banner (if relevant)
    card += stuckBanner(it);

    // Expand arrow
    card += '<div class="tl-cd-expand-row"><span class="tl-cd-expand">' + (isOpen ? '▲ ซ่อนรายละเอียด' : '▼ ดูรายละเอียด') + '</span></div>';

    // Expanded detail
    if (isOpen) {
      card += '<div class="tl-cd-detail" onclick="event.stopPropagation()">';

      // Full pipeline
      card += '<div class="tl-sec-mini">📊 Development Timeline</div>';
      card += pipelineBar(it);

      // Tasting history
      var tasting = it.tasting || [];
      var hasTasting = tasting.some(function(t) { return t.date || t.note; });
      if (hasTasting) {
        card += '<div class="tl-sec-mini">🧪 ประวัติการชิม</div>';
        card += '<div class="tl-taste-hist">';
        tasting.forEach(function(t, ti) {
          if (!t.date && !t.note) return;
          var resultIcon = t.note && /ผ่าน/.test(t.note) && !/ไม่ผ่าน/.test(t.note) ? '✅' : t.note && /ไม่ผ่าน/.test(t.note) ? '❌' : '⏳';
          card += '<div class="tl-taste-row">' +
            '<div class="tl-taste-num">ครั้งที่ ' + (ti + 1) + '</div>' +
            '<div class="tl-taste-info">' +
              (t.date ? '<span>📅 ' + fmtDate(t.date) + '</span>' : '') +
              (t.note ? '<span>' + resultIcon + ' ' + esc(t.note) + '</span>' : '') +
            '</div></div>';
        });
        card += '</div>';
      }

      // Status
      card += '<div class="tl-sec-mini">📋 สถานะ</div>';
      card += '<div class="tl-cd-status-grid">' +
        '<div class="tl-st-box"><span class="tl-st-lbl">👤 คุณอู๋</span><span class="tl-chip" style="background:' + own.bg + ';color:' + own.fg + '">' + esc(own.label) + '</span>' +
          ((it.owner||{}).note ? '<div class="tl-note">' + esc(it.owner.note) + '</div>' : '') + '</div>' +
        '<div class="tl-st-box"><span class="tl-st-lbl">👥 ลูกค้า</span><span class="tl-chip" style="background:' + cus.bg + ';color:' + cus.fg + '">' + esc(cus.label) + '</span>' +
          ((it.customer||{}).note ? '<div class="tl-note">' + esc(it.customer.note) + '</div>' : '') + '</div>' +
      '</div>';

      // Pre-launch checklist
      card += '<div class="tl-sec-mini">✅ Checklist ก่อนออกขาย</div>';
      card += checklistBar(it);

      // Task details
      card += '<div class="tl-sec-mini">📦 สิ่งที่เกี่ยวข้อง</div>';
      card += '<div class="tl-cd-grid">';
      TASKS.forEach(function (t) {
        var st = taskStyle((it.tasks || {})[t.key]);
        var ds = deadlineStatus(it, t.key);
        var dl = (it.taskDeadlines || {})[t.key];
        var days = dl ? daysUntil(dl) : null;
        var borderColor = ds === 'overdue' ? '#ef4444' : ds === 'done' ? '#22c55e' : ds === 'soon' ? '#f59e0b' : st.cls === 'tl-t-done' ? '#22c55e' : st.cls === 'tl-t-prog' ? '#f59e0b' : st.cls === 'tl-t-wait' ? '#6366f1' : 'var(--tl-border)';
        card += '<div class="tl-cd-item" style="border-left:3px solid ' + borderColor + '">' +
          '<div class="tl-cd-item-lbl">' + (t.grp ? t.grp + ' › ' : '') + t.label + '</div>' +
          '<div class="tl-cd-item-val" style="color:' + (st.cls === 'tl-t-done' ? '#16a34a' : st.cls === 'tl-t-prog' ? '#b45309' : st.cls === 'tl-t-wait' ? '#4338ca' : 'var(--tl-muted)') + '">' + st.label + '</div>' +
          (dl ? '<div class="tl-cd-item-dl' + (ds === 'overdue' ? ' tl-cd-item-dl-over' : ds === 'soon' ? ' tl-cd-item-dl-soon' : '') + '">' +
            'กำหนด: ' + fmtDate(dl) + (ds === 'overdue' ? ' (เลย ' + Math.abs(days) + ' วัน)' : ds === 'soon' ? ' (อีก ' + days + ' วัน)' : '') +
          '</div>' : '') +
        '</div>';
      });
      card += '</div>';

      if (it.sellDateNote) card += '<div class="tl-cd-note">📌 ' + esc(it.sellDateNote) + '</div>';
      card += '</div>'; // end detail
    }

    card += '</div>'; // end card
    return card;
  }).join('');

  h += '</div>';
  return h;
}

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
        '<th rowspan="2">ผู้พัฒนา</th>' +
        '<th colspan="2" class="tl-grp">สถานะ</th>' +
        '<th colspan="3" class="tl-grp">การชิม</th>' +
        '<th rowspan="2">วันที่<br>กำหนดขาย</th>' +
        '<th colspan="' + TASKS.length + '" class="tl-grp">สิ่งที่เกี่ยวข้อง</th>' +
        '<th rowspan="2">ความ<br>คืบหน้า</th>' +
        '<th rowspan="2">จัดการ</th>' +
      '</tr>' +
      '<tr>' +
        '<th class="tl-r2 tl-st">คุณอู๋</th>' +
        '<th class="tl-r2 tl-st">ลูกค้า</th>' +
        '<th class="tl-r2">ครั้งที่ 1</th>' +
        '<th class="tl-r2">ครั้งที่ 2</th>' +
        '<th class="tl-r2">ครั้งที่ 3</th>' +
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
      '<td class="tl-c" style="white-space:nowrap">' + esc(it.developer || '') + '</td>' +
      '<td class="tl-c tl-st"><span class="tl-chip" style="background:' + own.bg + ';color:' + own.fg + '">' +
        esc(own.label) + '</span>' +
        ((it.owner || {}).note ? '<div class="tl-note">' + esc(it.owner.note) + '</div>' : '') + '</td>' +
      '<td class="tl-c tl-st"><span class="tl-chip" style="background:' + cus.bg + ';color:' + cus.fg + '">' +
        esc(cus.label) + '</span>' +
        ((it.customer || {}).note ? '<div class="tl-note">' + esc(it.customer.note) + '</div>' : '') + '</td>' +
      (function () {
        var ts = it.tasting || [];
        return [0, 1, 2].map(function (ti) {
          var t = ts[ti] || {};
          if (!t.date && !t.note) return '<td class="tl-c">' + DASH + '</td>';
          return '<td class="tl-c" style="font-size:11px">' +
            (t.date ? fmtDate(t.date) : '') +
            (t.note ? '<div class="tl-note">' + esc(t.note) + '</div>' : '') + '</td>';
        }).join('');
      })() +
      '<td class="tl-c" style="white-space:nowrap">' +
        (it.sellDate ? '<b>' + fmtDate(it.sellDate) + '</b>' : (it.sellDateNote ? '<span style="color:#b45309;font-size:11px">' + esc(it.sellDateNote) + '</span>' : DASH)) + '</td>' +
      TASKS.map(function (t) {
        var st = taskStyle((it.tasks || {})[t.key]);
        var ds = deadlineStatus(it, t.key);
        var dl = (it.taskDeadlines || {})[t.key];
        var dlCls = ds === 'overdue' ? ' tl-dl-over' : ds === 'soon' ? ' tl-dl-soon' : ds === 'done' ? ' tl-dl-done' : '';
        var days = dl ? daysUntil(dl) : null;
        var dlTip = dl ? '\nกำหนด: ' + fmtDate(dl) + (ds === 'overdue' ? ' (เลย ' + Math.abs(days) + ' วัน)' : ds === 'soon' ? ' (อีก ' + days + ' วัน)' : '') : '';
        return '<td class="tl-c"><span class="tl-task ' + st.cls + dlCls + '" title="' +
          esc((t.grp ? t.grp + ' › ' : '') + t.label + ': ' + st.label + dlTip) + '">' + st.icon + '</span>' +
          (dl ? '<div class="tl-dl-date' + (ds === 'overdue' ? ' tl-dl-txt-over' : ds === 'soon' ? ' tl-dl-txt-soon' : '') + '">' + fmtDate(dl) + '</div>' : '') +
          '</td>';
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

function ganttStrip(items) {
  var hasAny = items.some(function (it) {
    return TASKS.some(function (t) { return (it.taskDeadlines || {})[t.key]; });
  });
  if (!hasAny) return '';

  var allDates = [];
  items.forEach(function (it) {
    TASKS.forEach(function (t) {
      var d = (it.taskDeadlines || {})[t.key];
      if (d) allDates.push(d);
    });
  });
  allDates.sort();
  var minD = allDates[0];
  var maxD = allDates[allDates.length - 1];

  var parseD = function (s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
  var minMs = parseD(minD).getTime();
  var maxMs = parseD(maxD).getTime();
  var range = maxMs - minMs || 86400000;
  var todayMs = new Date().setHours(0, 0, 0, 0);
  var todayPct = Math.max(0, Math.min(100, (todayMs - minMs) / range * 100));

  var rows = '';
  items.forEach(function (it) {
    var dls = it.taskDeadlines || {};
    var hasDl = TASKS.some(function (t) { return dls[t.key]; });
    if (!hasDl) return;

    var dots = '';
    TASKS.forEach(function (t) {
      var d = dls[t.key];
      if (!d) return;
      var pct = (parseD(d).getTime() - minMs) / range * 100;
      var ds = deadlineStatus(it, t.key);
      var color = ds === 'overdue' ? '#ef4444' : ds === 'done' ? '#22c55e' : ds === 'soon' ? '#f59e0b' : '#94a3b8';
      dots += '<div class="tl-gantt-dot" style="left:' + pct.toFixed(1) + '%;background:' + color + '" title="' +
        esc((t.grp ? t.grp + ' › ' : '') + t.label + ': ' + fmtDate(d)) + '"></div>';
    });

    rows += '<div class="tl-gantt-row">' +
      '<div class="tl-gantt-name">' + esc(it.name) + '</div>' +
      '<div class="tl-gantt-bar">' + dots +
        '<div class="tl-gantt-today" style="left:' + todayPct.toFixed(1) + '%"></div>' +
      '</div></div>';
  });

  return '<div class="tl-gantt">' +
    '<div class="tl-sec">📊 Timeline กำหนดเสร็จ</div>' +
    '<div class="tl-gantt-head">' +
      '<div class="tl-gantt-name" style="font-weight:700;color:var(--tl-muted)"></div>' +
      '<div class="tl-gantt-bar" style="display:flex;justify-content:space-between;font-size:10px;color:var(--tl-muted)">' +
        '<span>' + fmtDate(minD) + '</span><span>วันนี้</span><span>' + fmtDate(maxD) + '</span></div>' +
    '</div>' +
    rows + '</div>';
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
    '<span style="border-left:2px solid var(--tl-border);padding-left:12px"><b>กำหนดเสร็จ:</b></span>' +
    '<span>' + ic('tl-t-none tl-dl-over', '!') + ' เลยกำหนด</span>' +
    '<span>' + ic('tl-t-none tl-dl-soon', '!') + ' ใกล้ถึงกำหนด (≤3 วัน)</span>' +
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
    var ts = item.tasting || [{}, {}, {}];
    h += '<div class="tl-sec">สถานะ</div>' +
      '<div class="tl-grid">' +
        fld('ผู้พัฒนา', input('tlDev', item.developer, 'เช่น RD, Khun.Arm')) +
        fld('สถานะ (คุณอู๋)', sel('tlOwnerSt', (item.owner || {}).status, data.approvalOptions || [])) +
        fld('หมายเหตุ (คุณอู๋)', input('tlOwnerNote', (item.owner || {}).note, 'เช่น รอตัวอย่าง 21/08/2569')) +
        fld('สถานะ (ลูกค้า)', sel('tlCustSt', (item.customer || {}).status, data.approvalOptions || [])) +
        fld('หมายเหตุ (ลูกค้า)', input('tlCustNote', (item.customer || {}).note, 'เช่น รอกำหนดขาย')) +
      '</div>' +
      '<div class="tl-sec">การชิม</div>' +
      '<div class="tl-grid">' +
        fld('การชิมครั้งที่ 1 วันที่', input('tlTaste0D', (ts[0] || {}).date, '', 'date')) +
        fld('การชิมครั้งที่ 1 หมายเหตุ', input('tlTaste0N', (ts[0] || {}).note, '')) +
        fld('การชิมครั้งที่ 2 วันที่', input('tlTaste1D', (ts[1] || {}).date, '', 'date')) +
        fld('การชิมครั้งที่ 2 หมายเหตุ', input('tlTaste1N', (ts[1] || {}).note, '')) +
        fld('การชิมครั้งที่ 3 วันที่', input('tlTaste2D', (ts[2] || {}).date, '', 'date')) +
        fld('การชิมครั้งที่ 3 หมายเหตุ', input('tlTaste2N', (ts[2] || {}).note, '')) +
      '</div>' +
      '<div class="tl-sec">วันกำหนดขาย</div>' +
      '<div class="tl-grid">' +
        fld('วันที่กำหนดขาย', input('tlSellDate', item.sellDate, '', 'date')) +
        fld('หมายเหตุ', input('tlSellNote', item.sellDateNote, 'เช่น เดือนตุลาคม')) +
      '</div>' +
      '<div class="tl-sec">สิ่งที่เกี่ยวข้อง</div>' +
      '<div class="tl-grid">' +
        TASKS.map(function (x) {
          var dlVal = (item.taskDeadlines || {})[x.key] || '';
          var taskSel = '<select class="tl-in" id="tlT_' + x.key + '" onchange="_tlAutoDate(\'' + x.key + '\',this.value)">' +
            '<option value="">— ยังไม่ระบุ —</option>' +
            (data.taskOptions || []).map(function (o) {
              return '<option' + (t[x.key] === o ? ' selected' : '') + '>' + esc(o) + '</option>';
            }).join('') + '</select>';
          return fld((x.grp ? x.grp + ' › ' : '') + x.label,
            taskSel +
            '<input class="tl-in tl-dl-input" id="tlDL_' + x.key + '" type="date" value="' + esc(dlVal) + '" title="กำหนดเสร็จ">');
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
  _f = { search: '', channel: '', cust: '', task: '', deadline: '' };
  renderProdTimeline();
};
window._tlSet = function (k, v) { _f[k] = v; renderProdTimeline(); };
window._tlLayout = function (v) { _layout = v; renderProdTimeline(); };
window._tlAutoDate = function (key, val) {
  var dlInput = document.getElementById('tlDL_' + key);
  if (dlInput && val && !dlInput.value) {
    var d = new Date();
    dlInput.value = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
};
window._tlToggleCard = function (id) {
  var wasOpen = _expanded[id];
  _expanded = {};
  if (!wasOpen) _expanded[id] = true;
  renderProdTimeline();
};

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
    item.developer = g('tlDev');
    item.owner = { status: g('tlOwnerSt'), note: g('tlOwnerNote') };
    item.customer = { status: g('tlCustSt'), note: g('tlCustNote') };
    item.tasting = [0, 1, 2].map(function (ti) {
      return { date: g('tlTaste' + ti + 'D') || null, note: g('tlTaste' + ti + 'N') };
    });
    item.sellDate = g('tlSellDate') || null;
    item.sellDateNote = g('tlSellNote');
    item.tasks = {};
    item.taskDeadlines = {};
    TASKS.forEach(function (x) {
      item.tasks[x.key] = g('tlT_' + x.key);
      var dl = g('tlDL_' + x.key);
      if (dl) item.taskDeadlines[x.key] = dl;
    });
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

/* ── ส่งออกข้อมูล ── */
function exportData() {
  var data = load();
  var isNew = _view === 'new';
  var all = isNew ? (data.newItems || []) : (data.cancelItems || []);
  var items = filtered(all);
  return { data: data, isNew: isNew, items: items };
}

function buildExportRows(items, isNew) {
  if (isNew) {
    var headers = ['ลำดับ', 'ชื่อสินค้า', 'ช่องทาง', 'ประเภทสินค้า', 'จำนวนชิ้น/หน่วย', 'ผู้พัฒนา',
      'สถานะ คุณอู๋', 'หมายเหตุ คุณอู๋', 'สถานะ ลูกค้า', 'หมายเหตุ ลูกค้า',
      'การชิม 1 วันที่', 'การชิม 1 หมายเหตุ', 'การชิม 2 วันที่', 'การชิม 2 หมายเหตุ',
      'การชิม 3 วันที่', 'การชิม 3 หมายเหตุ', 'วันกำหนดขาย'];
    TASKS.forEach(function (t) {
      headers.push((t.grp ? t.grp + ' › ' : '') + t.label);
      headers.push('กำหนดเสร็จ ' + t.label);
    });
    headers.push('ความคืบหน้า');

    var rows = items.map(function (it, i) {
      var ts = it.tasting || [];
      var r = [it.seq || i + 1, it.name, it.channel || '', it.category || '', it.packSize || '', it.developer || '',
        (it.owner || {}).status || '', (it.owner || {}).note || '',
        (it.customer || {}).status || '', (it.customer || {}).note || '',
        (ts[0] || {}).date || '', (ts[0] || {}).note || '',
        (ts[1] || {}).date || '', (ts[1] || {}).note || '',
        (ts[2] || {}).date || '', (ts[2] || {}).note || '',
        it.sellDate || ''];
      TASKS.forEach(function (t) {
        var st = taskStyle((it.tasks || {})[t.key]);
        r.push(st.label);
        r.push((it.taskDeadlines || {})[t.key] || '');
      });
      r.push(taskDone(it) + '/' + TASKS.length);
      return r;
    });
    return [headers].concat(rows);
  } else {
    var headers2 = ['ลำดับ', 'ชื่อสินค้า', 'ช่องทาง', 'รหัสสินค้า', 'ประเภทสินค้า',
      'จำนวนชิ้น/หน่วย', 'วันที่', 'สาเหตุ 1', 'สาเหตุ 2', 'สาเหตุ 3',
      'แพ็คเกจจิ้ง คลัง', 'แพ็คเกจจิ้ง คุณเปิ้ล', 'แพ็คเกจจิ้ง รวม',
      'สติ๊กเกอร์ คลัง', 'สติ๊กเกอร์ คุณเปิ้ล', 'สติ๊กเกอร์ รวม',
      'แจ้งทีม', 'แจ้งวางแผน', 'แจ้งผลิต', 'แจ้งคลัง'];
    var rows2 = items.map(function (it, i) {
      var st = it.stock || {};
      var pkg = st.packaging || {}, stk = st.sticker || {};
      var nf = it.notify || {};
      return [it.seq || i + 1, it.name, it.channel || '', it.code || '', it.category || '',
        it.packSize || '', it.date || '',
        (it.reasons || [])[0] || '', (it.reasons || [])[1] || '', (it.reasons || [])[2] || '',
        pkg.warehouse || '', pkg.pern || '', pkg.total || '',
        stk.warehouse || '', stk.pern || '', stk.total || '',
        nf.team || '', nf.plan || '', nf.prod || '', nf.warehouse || ''];
    });
    return [headers2].concat(rows2);
  }
}

window._tlExportExcel = function () {
  var d = exportData();
  var rows = buildExportRows(d.items, d.isNew);
  var ws = XLSX.utils.aoa_to_sheet(rows);
  var colW = rows[0].map(function (h) { return { wch: Math.max(h.length * 2, 12) }; });
  ws['!cols'] = colW;
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, d.isNew ? 'สินค้าใหม่' : 'สินค้ายกเลิก');
  XLSX.writeFile(wb, 'TimeLine_' + (d.isNew ? 'NPD' : 'Cancel') + '_' + todayStr() + '.xlsx');
};

window._tlExportPDF = function () {
  var el = document.querySelector('.tl-wrap') || document.querySelector('.tl-cards');
  if (!el) return alert('ไม่พบข้อมูลที่จะส่งออก');
  html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then(function (canvas) {
    var imgData = canvas.toDataURL('image/png');
    var pdf = new jspdf.jsPDF({ orientation: canvas.width > canvas.height ? 'l' : 'p', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('TimeLine_' + (_view === 'new' ? 'NPD' : 'Cancel') + '_' + todayStr() + '.pdf');
  });
};

window._tlExportImage = function () {
  var el = document.querySelector('.tl-wrap') || document.querySelector('.tl-cards');
  if (!el) return alert('ไม่พบข้อมูลที่จะส่งออก');
  html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then(function (canvas) {
    var a = document.createElement('a');
    a.download = 'TimeLine_' + (_view === 'new' ? 'NPD' : 'Cancel') + '_' + todayStr() + '.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  });
};

window._tlExportMenu = function () {
  var menu = document.getElementById('tlExportMenu');
  if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
};

})();
