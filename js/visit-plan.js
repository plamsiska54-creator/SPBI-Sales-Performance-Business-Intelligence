/* visit-plan.js — Customer Visit Planning */
(function(){
'use strict';

/* ─── Sample Data ─── */
const _VP_STAFF = ['คุณกุ้ง','คุณเอ','คุณบี','คุณซี'];
const _VP_OBJECTIVES = ['เสนอสินค้าใหม่','ติดตามออเดอร์','แก้ปัญหา/เคลม','เจรจาต่อสัญญา','สร้างความสัมพันธ์','สำรวจตลาด'];
const _VP_CHANNELS = ['MT','GT','Online','Amazon','Booth'];
const _VP_STATUSES = ['วางแผน','ยืนยันแล้ว','เลื่อน','ยกเลิก','เข้าพบแล้ว'];
const _VP_CUSTOMERS = [
  'คุณสมชาย ร้านสุขใจ','คุณวิภา ร้านวิภาพาณิชย์','Big C ลาดพร้าว','Tops ทองหล่อ',
  'คุณมานะ ร้านมานะเทรด','Lotus\'s บางนา','คุณสุดา ร้านสุดาบิวตี้','Makro จรัญฯ',
  'คุณนิด ร้านนิดน้อย','7-Eleven สาขา 12345','คุณแจ็ค Amazon Seller','คุณเจน Shopee Mall',
  'คุณโอ๋ ร้านโอ๋ออนไลน์','AEON ศรีราชา','คุณต้น ร้านต้นไม้สวย'
];

let _vpVisits = [];
let _vpCalDate = new Date();

let _vpInited = false;
function _vpInit(){
  if(!_vpInited){
    _vpInited = true;
    const parent = document.getElementById('tab-visit-plan');
    if(parent) parent.querySelectorAll('.sub-content').forEach(s => {
      if(!s.classList.contains('active')) s.style.display = 'none';
    });
  }
  if(_vpVisits.length) return;
  _vpGenerateSampleData();
}

function _vpGenerateSampleData(){
  const now = new Date();
  const visits = [];
  for(let i = 0; i < 60; i++){
    const d = new Date(now);
    d.setDate(d.getDate() - 15 + Math.floor(Math.random()*45));
    const h = 8 + Math.floor(Math.random()*9);
    const m = Math.random() > 0.5 ? 30 : 0;
    visits.push({
      id: i+1,
      date: _fmtDate(d),
      time: String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'),
      customer: _VP_CUSTOMERS[Math.floor(Math.random()*_VP_CUSTOMERS.length)],
      location: ['Big C ลาดพร้าว','Tops ทองหล่อ','Lotus\'s บางนา','ออฟฟิศลูกค้า','ตลาดนัด','ห้างสรรพสินค้า'][Math.floor(Math.random()*6)],
      staff: _VP_STAFF[Math.floor(Math.random()*_VP_STAFF.length)],
      channel: _VP_CHANNELS[Math.floor(Math.random()*_VP_CHANNELS.length)],
      objective: _VP_OBJECTIVES[Math.floor(Math.random()*_VP_OBJECTIVES.length)],
      products: ['ครีมกันแดด','เซรั่ม','โลชั่น','แชมพู','สบู่','เซ็ตของขวัญ'][Math.floor(Math.random()*6)],
      notes: '',
      expectedValue: Math.floor(Math.random()*200000)+5000,
      probability: [90,60,30][Math.floor(Math.random()*3)],
      status: Math.random() < 0.15 ? 'ยกเลิก' : Math.random() < 0.3 ? 'เข้าพบแล้ว' : Math.random() < 0.5 ? 'ยืนยันแล้ว' : 'วางแผน'
    });
  }
  visits.sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  _vpVisits = visits;
}

function _fmtDate(d){
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function _todayStr(){ return _fmtDate(new Date()); }
function _num(n){ return Number(n||0).toLocaleString('th-TH'); }
function _money(n){ return '฿'+Number(n||0).toLocaleString('th-TH',{minimumFractionDigits:0,maximumFractionDigits:0}); }

/* ─── Sub-tab navigation ─── */
window.vpShowSub = function(el, subId){
  const parent = document.getElementById('tab-visit-plan');
  parent.querySelectorAll('.sub-content').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
  parent.querySelectorAll('.sub-tab').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  const target = document.getElementById(subId);
  if(target){ target.classList.add('active'); target.style.display = 'block'; }
  _vpInit();
  if(subId === 'vp-dashboard') vpRenderExecDash();
  if(subId === 'vp-summary') vpRenderSummary();
  if(subId === 'vp-calendar') vpCalRender();
  if(subId === 'vp-today') vpRenderToday();
  if(subId === 'vp-ai') {}
};

/* ─── 1. Executive Dashboard ─── */
function vpRenderExecDash(){
  _vpInit();
  const today = _todayStr();
  const now = new Date();
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
  const weekStartStr = _fmtDate(weekStart);
  const monthStr = today.slice(0,7);

  const active = _vpVisits.filter(v => v.status !== 'ยกเลิก');
  const todayV = active.filter(v => v.date === today);
  const weekV = active.filter(v => v.date >= weekStartStr && v.date <= today);
  const monthV = active.filter(v => v.date.startsWith(monthStr));
  const completed = active.filter(v => v.status === 'เข้าพบแล้ว');
  const totalExpected = active.reduce((s,v) => s + v.expectedValue * v.probability/100, 0);

  const kpis = [
    { label:'เข้าพบวันนี้', value: todayV.length, icon:'📍', color:'#f56e00' },
    { label:'สัปดาห์นี้', value: weekV.length, icon:'📅', color:'#0891b2' },
    { label:'เดือนนี้', value: monthV.length, icon:'📊', color:'#8b5cf6' },
    { label:'เข้าพบแล้ว', value: completed.length, icon:'✅', color:'#10b981' },
    { label:'มูลค่าคาดหวัง', value: _money(totalExpected), icon:'💰', color:'#f59e0b' }
  ];

  const kpiBox = document.getElementById('vp-exec-kpis');
  kpiBox.innerHTML = kpis.map(k => `
    <div style="background:var(--surface);border-radius:12px;padding:16px;border:1px solid var(--border);border-left:4px solid ${k.color}">
      <div style="font-size:13px;color:var(--text2)">${k.icon} ${k.label}</div>
      <div style="font-size:24px;font-weight:800;color:var(--text);margin-top:4px">${k.value}</div>
    </div>`).join('');

  _vpRenderObjChart(active);
  _vpRenderWeeklyChart(active);
  _vpRenderStaffTable(active);
}

function _vpRenderObjChart(visits){
  const canvas = document.getElementById('vp-chart-objective');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.parentElement.clientWidth - 32;
  const h = canvas.height = 220;
  ctx.clearRect(0,0,w,h);

  const counts = {};
  _VP_OBJECTIVES.forEach(o => counts[o] = 0);
  visits.forEach(v => { if(counts[v.objective] !== undefined) counts[v.objective]++; });
  const colors = ['#f56e00','#0891b2','#8b5cf6','#10b981','#f59e0b','#ec4899'];
  const total = visits.length || 1;
  const entries = Object.entries(counts).filter(([,c]) => c > 0);

  let startAngle = -Math.PI/2;
  const cx = h/2, cy = h/2, r = h/2 - 20;
  entries.forEach(([label, count], i) => {
    const slice = (count/total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, startAngle + slice);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    startAngle += slice;
  });

  let ly = 10;
  ctx.font = '12px sans-serif';
  entries.forEach(([label, count], i) => {
    const x = h + 20;
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(x, ly, 12, 12);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text') || '#333';
    ctx.fillText(`${label} (${count})`, x + 18, ly + 10);
    ly += 22;
  });
}

function _vpRenderWeeklyChart(visits){
  const canvas = document.getElementById('vp-chart-weekly');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.parentElement.clientWidth - 32;
  const h = canvas.height = 220;
  ctx.clearRect(0,0,w,h);

  const weeks = [];
  const now = new Date();
  for(let i = 7; i >= 0; i--){
    const d = new Date(now); d.setDate(d.getDate() - i*7);
    const ws = _fmtDate(d);
    const we = new Date(d); we.setDate(we.getDate()+6);
    const weStr = _fmtDate(we);
    const count = visits.filter(v => v.date >= ws && v.date <= weStr && v.status !== 'ยกเลิก').length;
    weeks.push({ label: `W${8-i}`, count });
  }

  const maxVal = Math.max(...weeks.map(w=>w.count), 1);
  const barW = Math.min(40, (w - 60) / weeks.length - 8);
  const chartH = h - 50;
  const startX = 40;

  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border') || '#ddd';
  ctx.lineWidth = 1;
  for(let i = 0; i <= 4; i++){
    const y = 10 + chartH - (chartH * i/4);
    ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(w-10, y); ctx.stroke();
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text2') || '#666';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxVal*i/4), startX-5, y+4);
  }

  weeks.forEach((wk, i) => {
    const x = startX + i * ((w - startX - 10)/weeks.length) + ((w - startX - 10)/weeks.length - barW)/2;
    const barH = (wk.count / maxVal) * chartH;
    const y = 10 + chartH - barH;
    const grad = ctx.createLinearGradient(x, y, x, 10+chartH);
    grad.addColorStop(0, '#f56e00');
    grad.addColorStop(1, '#0891b2');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, [4,4,0,0]);
    ctx.fill();
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text2') || '#666';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(wk.label, x+barW/2, h-5);
    if(wk.count > 0){
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text') || '#333';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(wk.count, x+barW/2, y-5);
    }
  });
}

function _vpRenderStaffTable(visits){
  const tbl = document.getElementById('vp-exec-staff-tbl');
  if(!tbl) return;
  const staffMap = {};
  _VP_STAFF.forEach(s => staffMap[s] = { total:0, completed:0, cancelled:0, value:0 });
  visits.forEach(v => {
    if(!staffMap[v.staff]) return;
    staffMap[v.staff].total++;
    if(v.status === 'เข้าพบแล้ว') staffMap[v.staff].completed++;
    if(v.status === 'ยกเลิก') staffMap[v.staff].cancelled++;
    staffMap[v.staff].value += v.expectedValue * v.probability/100;
  });

  tbl.querySelector('thead').innerHTML = '<tr><th>พนักงาน</th><th>ทั้งหมด</th><th>เข้าพบแล้ว</th><th>ยกเลิก</th><th>อัตราสำเร็จ</th><th>มูลค่าคาดหวัง</th></tr>';
  tbl.querySelector('tbody').innerHTML = Object.entries(staffMap).map(([name, d]) => {
    const rate = d.total ? Math.round(d.completed/d.total*100) : 0;
    return `<tr><td style="font-weight:600">${name}</td><td>${d.total}</td><td>${d.completed}</td><td>${d.cancelled}</td><td><span style="color:${rate>=50?'#10b981':'#ef4444'};font-weight:700">${rate}%</span></td><td style="text-align:right">${_money(d.value)}</td></tr>`;
  }).join('');
}

/* ─── 2. Visit Summary ─── */
window.vpRenderSummary = function(){
  _vpInit();
  const period = document.getElementById('vp-sum-period').value;
  const today = _todayStr();
  const now = new Date();
  let filtered = _vpVisits;

  if(period === 'today') filtered = filtered.filter(v => v.date === today);
  else if(period === 'week'){
    const ws = new Date(now); ws.setDate(now.getDate() - now.getDay());
    filtered = filtered.filter(v => v.date >= _fmtDate(ws));
  } else if(period === 'month') filtered = filtered.filter(v => v.date.startsWith(today.slice(0,7)));
  else if(period === 'quarter'){
    const q = Math.floor(now.getMonth()/3);
    const qs = now.getFullYear()+'-'+String(q*3+1).padStart(2,'0');
    filtered = filtered.filter(v => v.date >= qs+'-01');
  }

  const active = filtered.filter(v => v.status !== 'ยกเลิก');
  const completed = active.filter(v => v.status === 'เข้าพบแล้ว');
  const confirmed = active.filter(v => v.status === 'ยืนยันแล้ว');
  const planned = active.filter(v => v.status === 'วางแผน');
  const totalVal = active.reduce((s,v) => s+v.expectedValue*v.probability/100, 0);

  const kpis = [
    { label:'นัดทั้งหมด', value:active.length, color:'#f56e00' },
    { label:'เข้าพบแล้ว', value:completed.length, color:'#10b981' },
    { label:'ยืนยันแล้ว', value:confirmed.length, color:'#0891b2' },
    { label:'วางแผน', value:planned.length, color:'#8b5cf6' },
    { label:'มูลค่าคาดหวัง', value:_money(totalVal), color:'#f59e0b' }
  ];

  document.getElementById('vp-summary-kpis').innerHTML = kpis.map(k => `
    <div style="background:var(--surface);border-radius:12px;padding:14px;border:1px solid var(--border);border-left:4px solid ${k.color}">
      <div style="font-size:12px;color:var(--text2)">${k.label}</div>
      <div style="font-size:22px;font-weight:800;color:var(--text);margin-top:2px">${k.value}</div>
    </div>`).join('');

  const objCounts = {};
  active.forEach(v => { objCounts[v.objective] = (objCounts[v.objective]||0) + 1; });
  const tbl = document.getElementById('vp-summary-obj-tbl');
  tbl.querySelector('thead').innerHTML = '<tr><th>วัตถุประสงค์</th><th>จำนวน</th><th>สัดส่วน</th></tr>';
  tbl.querySelector('tbody').innerHTML = Object.entries(objCounts)
    .sort((a,b) => b[1]-a[1])
    .map(([obj, cnt]) => `<tr><td>${obj}</td><td>${cnt}</td><td>${active.length?Math.round(cnt/active.length*100):0}%</td></tr>`).join('');
};

/* ─── 3. Calendar ─── */
window.vpCalNav = function(dir){
  const view = document.getElementById('vp-cal-view').value;
  if(view === 'month') _vpCalDate.setMonth(_vpCalDate.getMonth() + dir);
  else _vpCalDate.setDate(_vpCalDate.getDate() + dir * 7);
  vpCalRender();
};

window.vpCalRender = function(){
  _vpInit();
  const view = document.getElementById('vp-cal-view').value;
  if(view === 'month') _vpCalRenderMonth();
  else _vpCalRenderWeek();
};

function _vpCalRenderMonth(){
  const d = _vpCalDate;
  const year = d.getFullYear(), month = d.getMonth();
  const thMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  document.getElementById('vp-cal-title').textContent = `${thMonths[month]} ${year+543}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const today = _todayStr();
  const monthStr = year+'-'+String(month+1).padStart(2,'0');
  const monthVisits = _vpVisits.filter(v => v.date.startsWith(monthStr));

  const dayNames = ['อา','จ','อ','พ','พฤ','ศ','ส'];
  let html = '<div style="display:grid;grid-template-columns:repeat(7,1fr);text-align:center">';
  dayNames.forEach(dn => { html += `<div style="padding:10px;font-weight:700;font-size:13px;color:var(--text2);background:var(--surface2)">${dn}</div>`; });

  for(let i = 0; i < firstDay; i++) html += '<div style="padding:8px;min-height:80px;border-top:1px solid var(--border)"></div>';

  for(let day = 1; day <= daysInMonth; day++){
    const dateStr = monthStr+'-'+String(day).padStart(2,'0');
    const dayVisits = monthVisits.filter(v => v.date === dateStr);
    const isToday = dateStr === today;
    html += `<div style="padding:6px;min-height:80px;border-top:1px solid var(--border);${isToday?'background:#eff6ff;':''}">`;
    html += `<div style="font-size:13px;font-weight:${isToday?'800':'600'};color:${isToday?'#f56e00':'var(--text)'};margin-bottom:4px">${day}</div>`;
    dayVisits.slice(0,3).forEach(v => {
      const sc = v.status==='เข้าพบแล้ว'?'#10b981':v.status==='ยืนยันแล้ว'?'#0891b2':v.status==='ยกเลิก'?'#ef4444':'#8b5cf6';
      html += `<div style="font-size:10px;padding:2px 4px;margin-bottom:2px;border-radius:4px;background:${sc}22;color:${sc};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:default" title="${v.time} ${v.customer} — ${v.objective}">${v.time} ${v.customer}</div>`;
    });
    if(dayVisits.length > 3) html += `<div style="font-size:10px;color:var(--muted)">+${dayVisits.length-3} อื่นๆ</div>`;
    html += '</div>';
  }
  html += '</div>';
  document.getElementById('vp-cal-grid').innerHTML = html;
}

function _vpCalRenderWeek(){
  const d = new Date(_vpCalDate);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  const weekStart = new Date(d);
  const thMonths = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  document.getElementById('vp-cal-title').textContent = `สัปดาห์ ${weekStart.getDate()} ${thMonths[weekStart.getMonth()]} ${weekStart.getFullYear()+543}`;

  const today = _todayStr();
  const dayNames = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
  let html = '<div style="display:grid;grid-template-columns:repeat(7,1fr)">';

  for(let i = 0; i < 7; i++){
    const cd = new Date(weekStart); cd.setDate(cd.getDate()+i);
    const dateStr = _fmtDate(cd);
    const isToday = dateStr === today;
    const dayVisits = _vpVisits.filter(v => v.date === dateStr);
    html += `<div style="padding:8px;min-height:160px;border-right:${i<6?'1px solid var(--border)':'none'};${isToday?'background:#eff6ff;':''}">`;
    html += `<div style="font-size:13px;font-weight:700;color:${isToday?'#f56e00':'var(--text)'};margin-bottom:6px">${dayNames[i]} ${cd.getDate()}</div>`;
    dayVisits.forEach(v => {
      const sc = v.status==='เข้าพบแล้ว'?'#10b981':v.status==='ยืนยันแล้ว'?'#0891b2':v.status==='ยกเลิก'?'#ef4444':'#8b5cf6';
      html += `<div style="font-size:11px;padding:4px 6px;margin-bottom:3px;border-radius:6px;background:${sc}15;border-left:3px solid ${sc};color:var(--text)" title="${v.objective}">
        <div style="font-weight:700">${v.time}</div>
        <div style="color:var(--text2)">${v.customer}</div>
        <div style="font-size:10px;color:${sc}">${v.status}</div>
      </div>`;
    });
    html += '</div>';
  }
  html += '</div>';
  document.getElementById('vp-cal-grid').innerHTML = html;
}

/* ─── 4. Form Submit ─── */
window.vpFormSubmit = function(e){
  e.preventDefault();
  const v = {
    id: _vpVisits.length + 1,
    date: document.getElementById('vp-f-date').value,
    time: document.getElementById('vp-f-time').value,
    customer: document.getElementById('vp-f-customer').value,
    location: document.getElementById('vp-f-location').value,
    staff: document.getElementById('vp-f-staff').value,
    channel: document.getElementById('vp-f-channel').value,
    objective: document.getElementById('vp-f-objective').value,
    products: document.getElementById('vp-f-products').value,
    notes: document.getElementById('vp-f-notes').value,
    expectedValue: Number(document.getElementById('vp-f-expected-value').value) || 0,
    probability: Number(document.getElementById('vp-f-probability').value),
    status: document.getElementById('vp-f-status').value
  };
  _vpVisits.push(v);
  _vpVisits.sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  document.getElementById('vp-visit-form').reset();
  alert('✅ บันทึกแผนเข้าพบลูกค้าเรียบร้อยแล้ว!\n\n' + v.date + ' ' + v.time + '\n' + v.customer);
};

/* ─── 5. Today's Table ─── */
window.vpRenderToday = function(){
  _vpInit();
  const today = _todayStr();
  const todayV = _vpVisits.filter(v => v.date === today);
  const active = todayV.filter(v => v.status !== 'ยกเลิก');
  const completed = todayV.filter(v => v.status === 'เข้าพบแล้ว');
  const totalVal = active.reduce((s,v) => s+v.expectedValue, 0);

  const kpis = [
    { label:'นัดวันนี้', value:active.length, color:'#f56e00' },
    { label:'เข้าพบแล้ว', value:completed.length, color:'#10b981' },
    { label:'ยังไม่เข้าพบ', value:active.length - completed.length, color:'#f59e0b' },
    { label:'มูลค่ารวม', value:_money(totalVal), color:'#0891b2' }
  ];

  document.getElementById('vp-today-kpis').innerHTML = kpis.map(k => `
    <div style="background:var(--surface);border-radius:10px;padding:12px;border:1px solid var(--border);border-left:4px solid ${k.color}">
      <div style="font-size:11px;color:var(--text2)">${k.label}</div>
      <div style="font-size:20px;font-weight:800;color:var(--text);margin-top:2px">${k.value}</div>
    </div>`).join('');

  const tbl = document.getElementById('vp-today-tbl');
  tbl.querySelector('thead').innerHTML = '<tr><th>เวลา</th><th>ลูกค้า</th><th>สถานที่</th><th>ผู้รับผิดชอบ</th><th>วัตถุประสงค์</th><th>สินค้า</th><th>มูลค่า</th><th>สถานะ</th></tr>';

  if(!todayV.length){
    tbl.querySelector('tbody').innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--muted)">ไม่มีนัดเข้าพบลูกค้าวันนี้</td></tr>';
    return;
  }

  tbl.querySelector('tbody').innerHTML = todayV.map(v => {
    const sc = v.status==='เข้าพบแล้ว'?'#10b981':v.status==='ยืนยันแล้ว'?'#0891b2':v.status==='ยกเลิก'?'#ef4444':'#8b5cf6';
    return `<tr>
      <td style="font-weight:600">${v.time}</td>
      <td>${v.customer}</td>
      <td>${v.location}</td>
      <td>${v.staff}</td>
      <td>${v.objective}</td>
      <td>${v.products}</td>
      <td style="text-align:right">${_money(v.expectedValue)}</td>
      <td><span style="padding:3px 10px;border-radius:20px;background:${sc}18;color:${sc};font-size:12px;font-weight:600">${v.status}</span></td>
    </tr>`;
  }).join('');
};

/* ─── 6. AI Summary ─── */
window.vpAiGenerate = function(){
  _vpInit();
  const out = document.getElementById('vp-ai-output');
  out.innerHTML = '<p style="text-align:center;color:var(--muted)">⏳ กำลังวิเคราะห์...</p>';

  setTimeout(() => {
    const today = _todayStr();
    const now = new Date();
    const monthStr = today.slice(0,7);
    const active = _vpVisits.filter(v => v.status !== 'ยกเลิก');
    const monthV = active.filter(v => v.date.startsWith(monthStr));
    const completed = active.filter(v => v.status === 'เข้าพบแล้ว');
    const todayV = active.filter(v => v.date === today);
    const totalVal = active.reduce((s,v) => s+v.expectedValue*v.probability/100, 0);

    const objCounts = {};
    active.forEach(v => { objCounts[v.objective] = (objCounts[v.objective]||0)+1; });
    const topObj = Object.entries(objCounts).sort((a,b)=>b[1]-a[1])[0];

    const staffCounts = {};
    active.forEach(v => { staffCounts[v.staff] = (staffCounts[v.staff]||0)+1; });
    const topStaff = Object.entries(staffCounts).sort((a,b)=>b[1]-a[1])[0];

    const rate = active.length ? Math.round(completed.length/active.length*100) : 0;

    out.innerHTML = `
      <div style="margin-bottom:16px">
        <h3 style="color:#f56e00;margin:0 0 8px">🤖 สรุปภาพรวมแผนเข้าพบลูกค้า</h3>
        <p>จากข้อมูลทั้งหมด <strong>${active.length}</strong> นัดหมาย พบว่ามีอัตราสำเร็จ <strong style="color:${rate>=50?'#10b981':'#ef4444'}">${rate}%</strong> (${completed.length}/${active.length} ครั้ง)</p>
      </div>

      <div style="margin-bottom:16px">
        <h4 style="color:#0891b2;margin:0 0 6px">📊 สถิติประจำเดือน</h4>
        <ul style="margin:0;padding-left:20px">
          <li>นัดหมายเดือนนี้: <strong>${monthV.length}</strong> ครั้ง</li>
          <li>นัดหมายวันนี้: <strong>${todayV.length}</strong> ครั้ง</li>
          <li>มูลค่าคาดหวังรวม: <strong>${_money(totalVal)}</strong></li>
        </ul>
      </div>

      <div style="margin-bottom:16px">
        <h4 style="color:#8b5cf6;margin:0 0 6px">🎯 วัตถุประสงค์ที่พบบ่อยสุด</h4>
        <p><strong>${topObj?topObj[0]:'-'}</strong> (${topObj?topObj[1]:0} ครั้ง) — แนะนำให้จัดเตรียมข้อมูลสินค้าและโปรโมชั่นให้พร้อมก่อนเข้าพบ</p>
      </div>

      <div style="margin-bottom:16px">
        <h4 style="color:#10b981;margin:0 0 6px">👤 พนักงานที่มีนัดมากสุด</h4>
        <p><strong>${topStaff?topStaff[0]:'-'}</strong> (${topStaff?topStaff[1]:0} นัด) — ควรตรวจสอบว่าไม่มี workload เกินควร</p>
      </div>

      <div style="background:#eff6ff;border-radius:10px;padding:14px;border:1px solid #93c5fd">
        <h4 style="color:#1e40af;margin:0 0 6px">💡 คำแนะนำ AI</h4>
        <ol style="margin:0;padding-left:20px;line-height:2">
          <li>เพิ่มการติดตามลูกค้าที่สถานะ "วางแผน" ให้เปลี่ยนเป็น "ยืนยันแล้ว" ภายใน 2 วันก่อนนัด</li>
          <li>ลูกค้าที่ถูกยกเลิกควรนัดใหม่ภายใน 1 สัปดาห์</li>
          <li>กระจายนัดหมายให้ทุกคนในทีมอย่างสมดุล เพื่อครอบคลุมพื้นที่ทั้งหมด</li>
          <li>เตรียมรายงานผลิตภัณฑ์ขายดีก่อนเข้าพบเพื่อเพิ่ม Conversion Rate</li>
        </ol>
      </div>
    `;
  }, 800);
};

/* ─── Hook: auto-init when tab shown ─── */
const _origShowTab = window.showTab;
if(_origShowTab){
  window.showTab = function(el, tabId){
    _origShowTab(el, tabId);
    if(tabId === 'visit-plan'){
      _vpInit();
      vpRenderExecDash();
    }
  };
}

})();
