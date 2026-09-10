/**
 * LINE Messaging API — ส่งภาพ + ข้อความสรุปยอดขายรายวันไป LINE
 *
 * ใช้ puppeteer จับภาพ dashboard → อัปโหลด Supabase Storage → ส่ง LINE
 *
 * วิธีตั้งค่า:
 *   1. สมัคร LINE Developers → สร้าง Messaging API channel
 *   2. คัดลอก Channel access token → ใส่ใน .env
 *   3. เพิ่ม Bot เป็นเพื่อนใน LINE
 *   4. ทดสอบ:  node js/line-notify.js
 */

require('dotenv').config();
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ===== ตั้งค่า =====
const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const LINE_GROUP_IDS = (process.env.LINE_GROUP_IDS || '').split(',').filter(Boolean);

const SUPA = {
  URL: 'https://gdjwsxeptloppefuiwum.supabase.co',
  REST: 'https://gdjwsxeptloppefuiwum.supabase.co/rest/v1',
  KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkandzeGVwdGxvcHBlZnVpd3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NDk5NTcsImV4cCI6MjEwMTEyNTk1N30.vZaVm-aHbWvChHuizuzJvbSDW-x7FMo_nMImq412r2s'
};

const MONTHS_12 = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const CH_NAMES = ['Modern Trade','Amazon & Souvenir','Booth','Online'];
const CH_ICONS = {'Modern Trade':'🏪','Amazon & Souvenir':'🛒','Booth':'🎪','Online':'🖥️'};
const CH_MAP = { 'ModernTrade':'Modern Trade', 'Amazon':'Amazon & Souvenir', 'Telesale':'Amazon & Souvenir', 'Booth':'Booth', 'Online':'Online' };

const MONTHLY_TARGET = [55120000,62220000,63570000,67050000,69300000,69800000,83955000,85995000,88445000,91680000,102330000,111930000];
const CH_TARGET = {
  Jan:{'Modern Trade':39870000,'Amazon & Souvenir':10950000,'Booth':300000,'Online':4000000},
  Feb:{'Modern Trade':45870000,'Amazon & Souvenir':11550000,'Booth':300000,'Online':4500000},
  Mar:{'Modern Trade':46720000,'Amazon & Souvenir':12050000,'Booth':300000,'Online':4500000},
  Apr:{'Modern Trade':48450000,'Amazon & Souvenir':13100000,'Booth':500000,'Online':5000000},
  May:{'Modern Trade':49600000,'Amazon & Souvenir':13700000,'Booth':1000000,'Online':5000000},
  Jun:{'Modern Trade':49600000,'Amazon & Souvenir':16050000,'Booth':1500000,'Online':5000000},
  Jul:{'Modern Trade':53905000,'Amazon & Souvenir':17050000,'Booth':2000000,'Online':10000000},
  Aug:{'Modern Trade':54550000,'Amazon & Souvenir':17050000,'Booth':2500000,'Online':10000000},
  Sep:{'Modern Trade':56495000,'Amazon & Souvenir':17450000,'Booth':2500000,'Online':12000000},
  Oct:{'Modern Trade':59480000,'Amazon & Souvenir':17700000,'Booth':2500000,'Online':12000000},
  Nov:{'Modern Trade':68330000,'Amazon & Souvenir':19500000,'Booth':2500000,'Online':12000000},
  Dec:{'Modern Trade':77930000,'Amazon & Souvenir':19500000,'Booth':2500000,'Online':12000000}
};

// ===== HTTP helpers =====
function httpRequest(url, options, body) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const mod = parsedUrl.protocol === 'https:' ? https : http;
    const opts = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      ...options
    };
    const req = mod.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function httpUpload(url, headers, fileBuffer) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const opts = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: { ...headers, 'Content-Length': fileBuffer.length }
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(fileBuffer);
    req.end();
  });
}

// ===== ดึงข้อมูลจาก Supabase =====
async function supaQuery(params) {
  const res = await httpRequest(
    `${SUPA.REST}/sales_daily?${params}`,
    { method: 'GET', headers: { 'apikey': SUPA.KEY, 'Authorization': 'Bearer ' + SUPA.KEY, 'Content-Type': 'application/json' } }
  );
  return JSON.parse(res.body);
}

function aggregateRows(rows) {
  const channelActual = {};
  CH_NAMES.forEach(c => channelActual[c] = 0);
  let total = 0;
  const daysWithSales = new Set();
  rows.forEach(row => {
    const ch = CH_MAP[row.channel] || row.channel;
    const rev = parseFloat(row.revenue) || 0;
    if (channelActual.hasOwnProperty(ch)) channelActual[ch] += rev;
    total += rev;
    if (rev > 0) daysWithSales.add(row.date);
  });
  return { channelActual, total, dayCount: daysWithSales.size };
}

async function fetchSalesData() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const mo = MONTHS_12[month];
  const totalDays = new Date(year, month + 1, 0).getDate();

  // ดึงข้อมูลเดือนปัจจุบัน
  const startDate = `${year}-${String(month+1).padStart(2,'0')}-01`;
  const endDate = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  console.log(`📡 ดึงข้อมูลจาก Supabase (${startDate} ถึง ${endDate})...`);
  const curRows = await supaQuery(`select=date,channel,revenue&date=gte.${startDate}&date=lte.${endDate}&order=date`);
  console.log(`   ได้ ${curRows.length} รายการ (เดือนนี้)`);
  const cur = aggregateRows(curRows);

  // ดึงข้อมูลเดือนก่อน (full month)
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevMo = MONTHS_12[prevMonth];
  const prevStart = `${prevYear}-${String(prevMonth+1).padStart(2,'0')}-01`;
  const prevLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
  const prevEnd = `${prevYear}-${String(prevMonth+1).padStart(2,'0')}-${String(prevLastDay).padStart(2,'0')}`;
  const prevRows = await supaQuery(`select=date,channel,revenue&date=gte.${prevStart}&date=lte.${prevEnd}&order=date`);
  console.log(`   ได้ ${prevRows.length} รายการ (เดือนก่อน)`);
  const prev = aggregateRows(prevRows);

  // ดึงข้อมูลปีก่อนเดือนเดียวกัน (full month)
  const yoyStart = `${year-1}-${String(month+1).padStart(2,'0')}-01`;
  const yoyLastDay = new Date(year-1, month + 1, 0).getDate();
  const yoyEnd = `${year-1}-${String(month+1).padStart(2,'0')}-${String(yoyLastDay).padStart(2,'0')}`;
  const yoyRows = await supaQuery(`select=date,channel,revenue&date=gte.${yoyStart}&date=lte.${yoyEnd}&order=date`);
  console.log(`   ได้ ${yoyRows.length} รายการ (ปีก่อน)`);
  const yoy = aggregateRows(yoyRows);

  const channels = CH_NAMES.map(c => {
    const target = (CH_TARGET[mo] && CH_TARGET[mo][c]) || 0;
    const actual = cur.channelActual[c] || 0;
    const prevActual = prev.channelActual[c] || 0;
    const yoyActual = yoy.channelActual[c] || 0;
    const momPct = prevActual > 0 ? ((actual - prevActual) / prevActual * 100) : 0;
    const yoyPct = yoyActual > 0 ? ((actual - yoyActual) / yoyActual * 100) : 0;
    return { name: c, icon: CH_ICONS[c], target, actual, prevActual, yoyActual, momPct, yoyPct };
  });

  return {
    month: mo, moIdx: month, dayCount: cur.dayCount, totalDays,
    totalTarget: MONTHLY_TARGET[month] || 0,
    totalActual: cur.total,
    prevTotal: prev.total,
    yoyTotal: yoy.total,
    channels
  };
}

// ===== จับภาพ Dashboard ด้วย Puppeteer (2 หน้า) =====
async function captureDashboardImages() {
  console.log('📸 กำลังจับภาพ Dashboard...');
  const puppeteer = require('puppeteer');

  const rootDir = path.resolve(__dirname, '..');
  let port = 9876;
  const server = http.createServer((req, res) => {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/spbi.html';
    const filePath = path.join(rootDir, reqPath);
    if (!filePath.startsWith(rootDir)) { res.writeHead(403); res.end(); return; }
    const ext = path.extname(filePath);
    const types = {'.html':'text/html;charset=utf-8','.js':'application/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.woff2':'font/woff2','.woff':'font/woff'};
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, {'Content-Type': types[ext] || 'application/octet-stream'});
      res.end(data);
    });
  });
  await new Promise((resolve) => {
    server.listen(port, '0.0.0.0', resolve);
    server.on('error', () => { port = 9877; server.listen(port, '0.0.0.0', resolve); });
  });
  console.log(`   Local server on port ${port}`);

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 2 });

  // Inject session ก่อนทุก page load เพื่อข้ามหน้า login
  await page.evaluateOnNewDocument(() => {
    try {
      const session = JSON.stringify({ name: 'แอดมิน', role: 'admin', email: 'sale.analysis@wanwanach.com', allowedMenus: null });
      sessionStorage.setItem('__spbi_session', session);
      localStorage.setItem('__spbi_session', session);
    } catch(e) { /* about:blank — skip */ }
  });
  console.log('   🔑 Login session injected');

  // เปิด dashboard
  await page.goto(`http://127.0.0.1:${port}/spbi.html`, { waitUntil: 'networkidle2', timeout: 60000 });

  // รอ Supabase โหลดสำเร็จ (badge ✅) — ใช้เวลา ~60-90s
  console.log('   รอข้อมูล Supabase โหลด...');
  await page.waitForFunction(() => {
    const badge = document.getElementById('supaLiveBadge');
    return badge && badge.textContent.includes('✅');
  }, { timeout: 120000 }).catch(() => console.log('   ⚠️ Supabase timeout'));
  await new Promise(r => setTimeout(r, 2000));

  // ไปหน้า Overview (แสดง section + render)
  await page.evaluate(() => {
    // ซ่อนทุก section แล้วแสดง overview
    document.querySelectorAll('.section').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
    var sec = document.getElementById('tab-overview');
    if (sec) { sec.classList.add('active'); sec.style.display = 'block'; sec.style.opacity = '1'; }
    var wl = document.getElementById('welcomeLanding');
    if (wl) wl.style.display = 'none';
    // render ข้อมูล
    if (typeof renderOverview === 'function') renderOverview();
  });
  await new Promise(r => setTimeout(r, 1000));

  // คลิก "เดือนนี้" เพื่อแสดงข้อมูลเดือนปัจจุบัน
  await page.evaluate(() => {
    const btns = document.querySelectorAll('.filter-btn, .time-btn, button');
    for (const b of btns) {
      if (b.textContent.trim() === 'เดือนนี้') { b.click(); return; }
    }
  });
  await new Promise(r => setTimeout(r, 3000));

  // ยืนยันว่า KPI elements มีเนื้อหา
  const kpiReady = await page.evaluate(() => {
    const el = document.getElementById('overviewKPI');
    return el && el.offsetHeight > 50 && el.innerHTML.length > 100;
  });
  console.log(`   📊 KPI ready: ${kpiReady}`);

  // === ภาพที่ 1: Overview KPI (ใช้ html2canvas แบบเดียวกับปุ่มจับภาพ) ===
  const overviewPath = path.resolve(rootDir, 'temp_overview.png');
  const ovData = await page.evaluate(() => {
    return new Promise((resolve) => {
      if (typeof _buildKPICanvas !== 'function') { resolve(null); return; }
      _buildKPICanvas(function(canvas) {
        if (!canvas) { resolve(null); return; }
        resolve(canvas.toDataURL('image/png'));
      });
    });
  });
  if (ovData) {
    const base64 = ovData.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(overviewPath, Buffer.from(base64, 'base64'));
    console.log('   ✅ ภาพ 1: Overview KPI (html2canvas)');
  } else {
    // fallback: screenshot จาก element
    const kpiEl = await page.$('#overviewKPI');
    const belowEl = await page.$('#ovBelowTarget');
    if (kpiEl && belowEl) {
      const box1 = await kpiEl.boundingBox();
      const box3 = await belowEl.boundingBox();
      if (box1 && box3) {
        await page.screenshot({ path: overviewPath, clip: {
          x: Math.max(box1.x - 10, 0), y: box1.y - 10,
          width: Math.min(1180, page.viewport().width), height: (box3.y + box3.height) - box1.y + 20
        }, type: 'png' });
      } else {
        await page.screenshot({ path: overviewPath, fullPage: false, type: 'png' });
      }
    } else {
      await page.screenshot({ path: overviewPath, fullPage: false, type: 'png' });
    }
    console.log('   ✅ ภาพ 1: Overview (screenshot fallback)');
  }

  // === ภาพที่ 2: AI Tab (ใช้ html2canvas แบบเดียวกับปุ่มจับภาพ) ===
  const aiPath = path.resolve(rootDir, 'temp_ai.png');
  // สลับไป AI sub-tab
  await page.evaluate(() => {
    // ซ่อน sub-section ทั้งหมด แล้วแสดง ov-ai
    var sec = document.getElementById('tab-overview');
    if (sec) {
      sec.querySelectorAll('.sub-section').forEach(s => s.classList.remove('active'));
      sec.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
    }
    var ai = document.getElementById('ov-ai');
    if (ai) ai.classList.add('active');
    // render AI data
    if (typeof renderSalesTargetAI === 'function') renderSalesTargetAI();
  });
  await new Promise(r => setTimeout(r, 3000));

  const aiData = await page.evaluate(() => {
    return new Promise((resolve) => {
      if (typeof _buildAICanvas !== 'function') { resolve(null); return; }
      _buildAICanvas(function(canvas) {
        if (!canvas) { resolve(null); return; }
        resolve(canvas.toDataURL('image/png'));
      });
    });
  });
  if (aiData) {
    const base64 = aiData.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(aiPath, Buffer.from(base64, 'base64'));
    console.log('   ✅ ภาพ 2: AI Tab (html2canvas)');
  } else {
    // fallback: screenshot element
    const aiContent = await page.$('#salesTargetContent');
    if (aiContent) {
      const aiBox = await aiContent.boundingBox();
      if (aiBox) {
        await page.screenshot({ path: aiPath, clip: {
          x: Math.max(aiBox.x - 10, 0), y: aiBox.y - 10,
          width: Math.min(aiBox.width + 20, page.viewport().width),
          height: Math.min(aiBox.height + 20, 5000)
        }, type: 'png' });
      } else {
        await page.screenshot({ path: aiPath, fullPage: true, type: 'png' });
      }
    } else {
      await page.screenshot({ path: aiPath, fullPage: true, type: 'png' });
    }
    console.log('   ✅ ภาพ 2: AI Tab (screenshot fallback)');
  }

  await browser.close();
  server.close();
  return { overviewPath, aiPath };
}

// ===== อัปโหลดรูปไป Supabase Storage =====
async function uploadImage(filePath, prefix) {
  prefix = prefix || 'kpi';
  console.log(`☁️  อัปโหลดรูป (${prefix}) ไป Supabase Storage...`);
  const fileBuffer = fs.readFileSync(filePath);
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPA.KEY;
  const now = new Date();
  const fileName = `${prefix}_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${now.getHours()}${String(now.getMinutes()).padStart(2,'0')}.png`;

  const res = await httpUpload(
    `${SUPA.URL}/storage/v1/object/line-images/${fileName}`,
    {
      'apikey': SUPA.KEY,
      'Authorization': 'Bearer ' + serviceKey,
      'Content-Type': 'image/png',
      'x-upsert': 'true'
    },
    fileBuffer
  );

  if (res.statusCode === 200 || res.statusCode === 201) {
    const publicUrl = `${SUPA.URL}/storage/v1/object/public/line-images/${fileName}`;
    console.log(`   ✅ อัปโหลดสำเร็จ: ${publicUrl}`);
    return publicUrl;
  } else {
    console.error(`   ❌ อัปโหลดล้มเหลว (${res.statusCode}):`, res.body);
    return null;
  }
}

// ===== ลบรูปเก่ากว่า 7 วันจาก Supabase Storage =====
async function cleanupOldImages() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPA.KEY;
  try {
    const listRes = await httpRequest(
      `${SUPA.URL}/storage/v1/object/list/line-images`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPA.KEY,
          'Authorization': 'Bearer ' + serviceKey,
          'Content-Type': 'application/json'
        }
      },
      JSON.stringify({ prefix: '', limit: 100, offset: 0, sortBy: { column: 'created_at', order: 'asc' } })
    );

    if (listRes.statusCode !== 200) return;
    const files = JSON.parse(listRes.body);
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oldFiles = files.filter(f => new Date(f.created_at) < cutoff).map(f => f.name);

    if (oldFiles.length === 0) return;
    console.log(`🗑️  ลบรูปเก่า ${oldFiles.length} ไฟล์...`);

    const delRes = await httpRequest(
      `${SUPA.URL}/storage/v1/object/line-images`,
      {
        method: 'DELETE',
        headers: {
          'apikey': SUPA.KEY,
          'Authorization': 'Bearer ' + serviceKey,
          'Content-Type': 'application/json'
        }
      },
      JSON.stringify({ prefixes: oldFiles })
    );

    if (delRes.statusCode === 200) {
      console.log(`   ✅ ลบแล้ว ${oldFiles.length} ไฟล์`);
    }
  } catch(e) {
    console.warn('   ⚠️ ลบรูปเก่าไม่สำเร็จ:', e.message);
  }
}

// ===== ข้อความชุดที่ 1: สรุปยอดขาย =====
function buildSummaryText(d) {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const buddhistYear = yyyy + 543;
  const moTH = MONTHS_TH[d.moIdx];
  const fM = v => (Math.abs(v)/1e6).toFixed(2);

  const diff = d.totalActual - d.totalTarget;
  const ach = d.totalTarget ? (d.totalActual/d.totalTarget*100) : 0;

  const lines = [];
  lines.push('📊 สรุปยอดขาย');
  lines.push(`1-${d.dayCount} ${moTH} ${buddhistYear}`);
  lines.push('');
  lines.push('━━ ภาพรวมทุกช่องทาง ━━');
  lines.push(`เป้าหมาย : ${fM(d.totalTarget)} M`);
  lines.push(`ยอดจริง  : ${fM(d.totalActual)} M`);
  lines.push(`ผลต่าง  : ${(diff/1e6).toFixed(2)} M`);
  lines.push(`Achievement : ${ach.toFixed(1)}%`);
  lines.push('');
  lines.push('━━ แยกตามช่องทาง ━━');

  d.channels.forEach(ch => {
    const chAch = ch.target ? (ch.actual/ch.target*100) : 0;
    lines.push(`${ch.icon} ${ch.name}`);
    lines.push(`   ${fM(ch.actual)} / ${fM(ch.target)} M (${chAch.toFixed(1)}%)`);
  });

  return lines.join('\n');
}

// ===== ข้อความชุดที่ 2: Sales Target Tracking AI =====
function buildAIText(d) {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const fM = v => (Math.abs(v)/1e6).toFixed(2);

  const gap = d.totalTarget - d.totalActual;
  const ach = d.totalTarget ? (d.totalActual/d.totalTarget*100) : 0;
  const forecast = d.dayCount > 0 ? Math.round((d.totalActual / d.dayCount) * d.totalDays) : 0;
  const forecastAch = d.totalTarget ? (forecast/d.totalTarget*100) : 0;
  const forecastGap = d.totalTarget - forecast;
  const momTotal = d.prevTotal > 0 ? ((d.totalActual - d.prevTotal) / d.prevTotal * 100) : 0;
  const yoyTotal = d.yoyTotal > 0 ? ((d.totalActual - d.yoyTotal) / d.yoyTotal * 100) : 0;

  // หา channel ที่มีปัญหา
  const issues = [];
  d.channels.forEach(ch => {
    if (ch.momPct < -10) {
      issues.push(`${ch.name} ยอด MTD ลดลง ${Math.abs(ch.momPct).toFixed(1)}% MoM` +
        (ch.yoyPct < -10 ? ` และ ${Math.abs(ch.yoyPct).toFixed(1)}% YoY` : '') +
        (ch.name === 'Modern Trade' ? ' เป็นช่องทางหลักที่ส่งผลต่อ Gap' : ''));
    }
  });

  // หา channel ที่เติบโต
  const growing = d.channels.filter(ch => ch.momPct > 5);

  // คำนวณ opportunity (channels ที่ actual < target)
  let oppTotal = 0;
  let oppCount = 0;
  d.channels.forEach(ch => {
    if (ch.target > 0 && ch.actual < ch.target) {
      oppTotal += (ch.target - ch.actual);
      oppCount++;
    }
  });

  const riskLevel = forecastAch >= 90 ? 'ปานกลาง' : forecastAch >= 70 ? 'สูง' : 'สูงมาก';

  const L = [];
  L.push(`📊 ภาพรวมยอดขาย`);
  L.push(`ยอดขายสะสม MTD อยู่ที่ ${fM(d.totalActual)} ล้านบาท จากเป้าหมาย ${fM(d.totalTarget)} ล้านบาท คิดเป็น ${ach.toFixed(1)}% Achievement โดยยังมี Gap จากเป้าหมาย ${fM(gap)} ล้านบาท`);
  L.push('');

  L.push(`🔮 แนวโน้มปิดเดือน`);
  L.push(`AI Forecast คาดว่ายอดขายสิ้นเดือนจะอยู่ที่ ${fM(forecast)} ล้านบาท หรือ ${forecastAch.toFixed(1)}% ของเป้าหมาย ซึ่งต่ำกว่า Target ประมาณ ${fM(forecastGap > 0 ? forecastGap : 0)} ล้านบาท สะท้อนว่า มีความเสี่ยง${riskLevel}ที่จะไม่บรรลุเป้าหมายเดือนนี้`);
  L.push('');

  L.push(`🚨 ประเด็นที่ต้องจับตา`);
  if (issues.length > 0) {
    issues.forEach((iss, i) => L.push(`${i+1}. ${iss}`));
  }
  if (ach < 80) L.push(`${issues.length+1}. หลาย Sales/Customer มี Achievement ต่ำกว่าเป้าหมาย`);
  if (forecastAch < 80) L.push(`${issues.length+2}. Forecast ปัจจุบันยังไม่เพียงพอต่อการปิด Gap`);
  L.push('');

  L.push(`⚡ Opportunity ที่ควรเร่ง`);
  L.push(`มี Opportunity สำหรับ Follow-up ${oppCount} ช่องทาง มูลค่ารวมประมาณ ${fM(oppTotal)} ล้านบาท ควรจัดลำดับตามมูลค่าและโอกาสปิดการขาย เพื่อดึงยอดกลับเข้ามาภายในเดือนนี้`);
  L.push('');

  L.push(`🎯 Action วันนี้`);
  L.push(`• เร่ง Follow-up Top Opportunity ทุกช่องทาง`);
  L.push(`• ให้ Sales จัดทำ Action รายลูกค้าที่มียอดตกและมี Gap สูง`);
  const mainCh = d.channels.reduce((a, b) => (b.target - b.actual) > (a.target - a.actual) ? b : a);
  L.push(`• เร่งยอด ${mainCh.name} เป็น Priority หลัก`);
  if (growing.length > 0) {
    L.push(`• ขยายยอด ${growing[0].name} ซึ่งยังเติบโต +${growing[0].momPct.toFixed(1)}% MoM`);
  }
  L.push(`• ติดตามยอด ราย Sales / ราย Customer แบบ Daily`);
  L.push('');

  L.push(`👔 Management Attention`);
  L.push(`ปัจจุบัน Forecast ต่ำกว่า Target อย่างมีนัยสำคัญ จึงควรเร่งปิด Opportunity ที่มีโอกาสสร้างยอดได้จริง และกำหนดเป้าหมาย Recovery รายวันจนถึงสิ้นเดือน`);

  return L.join('\n');
}

// ===== ส่ง LINE Push Message (เข้ากลุ่ม) =====
async function sendLinePush(groupId, messages) {
  const body = JSON.stringify({ to: groupId, messages });
  const res = await httpRequest('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + LINE_TOKEN,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  }, body);

  if (res.statusCode === 200) {
    console.log(`✅ ส่ง LINE Push (กลุ่ม ${groupId.slice(-6)}) สำเร็จ!`);
  } else {
    console.warn(`⚠️ Push กลุ่ม ${groupId.slice(-6)} ล้มเหลว (${res.statusCode}): ${res.body}`);
  }
}

// ===== ส่ง LINE Broadcast (เพื่อนทุกคน) =====
async function sendLineBroadcast(messages) {
  const body = JSON.stringify({ messages });
  const res = await httpRequest('https://api.line.me/v2/bot/message/broadcast', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + LINE_TOKEN,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  }, body);

  if (res.statusCode === 200) {
    console.log('✅ ส่ง LINE Broadcast (เพื่อน) สำเร็จ!');
  } else {
    console.warn(`⚠️ Broadcast ล้มเหลว (${res.statusCode}): ${res.body}`);
  }
}

// ===== ส่งทั้งกลุ่มและ broadcast =====
async function sendLineAll(messages) {
  for (const gid of LINE_GROUP_IDS) {
    await sendLinePush(gid, messages);
  }
  await sendLineBroadcast(messages);
}

// ===== Main =====
async function main() {
  console.log('📊 SPBI — LINE Sales Notification (2 ชุด: สรุป + AI)');
  console.log('=====================================================\n');

  try {
    // 1. ดึงข้อมูล
    const data = await fetchSalesData();
    const summaryText = buildSummaryText(data);
    const aiText = buildAIText(data);

    console.log('--- ข้อความชุดที่ 1 (สรุปยอดขาย) ---');
    console.log(summaryText);
    console.log('\n--- ข้อความชุดที่ 2 (AI วิเคราะห์) ---');
    console.log(aiText);
    console.log('--- จบ ---\n');

    // 2. ลบรูปเก่า > 7 วัน
    await cleanupOldImages();

    // 3. จับภาพ Dashboard (2 ภาพ)
    let overviewUrl = null;
    let aiUrl = null;
    try {
      const { overviewPath, aiPath } = await captureDashboardImages();
      overviewUrl = await uploadImage(overviewPath, 'overview');
      aiUrl = await uploadImage(aiPath, 'ai_tracking');
      try { fs.unlinkSync(overviewPath); } catch(e) {}
      try { fs.unlinkSync(aiPath); } catch(e) {}
    } catch(e) {
      console.warn('⚠️ จับภาพไม่สำเร็จ — ส่งเฉพาะข้อความ:', e.message);
    }

    // 4. ส่ง LINE ชุดที่ 1: ภาพ Overview + ข้อความสรุป
    console.log('\n📤 ส่ง LINE ชุดที่ 1 (สรุปยอดขาย)...');
    const msg1 = [];
    if (overviewUrl) {
      msg1.push({ type: 'image', originalContentUrl: overviewUrl, previewImageUrl: overviewUrl });
    }
    msg1.push({ type: 'text', text: summaryText });
    await sendLineAll(msg1);

    // รอ 2 วินาทีเพื่อไม่ให้ LINE rate limit
    await new Promise(r => setTimeout(r, 2000));

    // 5. ส่ง LINE ชุดที่ 2: ภาพ AI + ข้อความ AI วิเคราะห์
    console.log('\n📤 ส่ง LINE ชุดที่ 2 (AI วิเคราะห์)...');
    const msg2 = [];
    if (aiUrl) {
      msg2.push({ type: 'image', originalContentUrl: aiUrl, previewImageUrl: aiUrl });
    }
    msg2.push({ type: 'text', text: aiText });
    await sendLineAll(msg2);

    console.log('\n🎉 ส่งครบทั้ง 2 ชุดแล้ว!');

  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

main();
