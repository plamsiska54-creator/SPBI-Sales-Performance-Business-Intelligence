// ═══════════════════ ACTIVATION MODULE ═══════════════════
// Activation วัดผลครบ 3 มิติ สร้างคุณค่าให้แบรนด์ (CJ MORE)
(function(){
'use strict';

var ACT_KEY = 'mkt_activation_v1';
function _load(){ try{return JSON.parse(localStorage.getItem(ACT_KEY))||[];}catch(e){return [];} }
function _save(arr){ try{localStorage.setItem(ACT_KEY,JSON.stringify(arr));}catch(e){} }

// ── KPI Definitions from PDF ──
var BOOTH_KPIS = [
  {no:'01', name:'Execution Compliance', nameTH:'การปฏิบัติตามมาตรฐาน', measure:'Check-in / Check-out (เวลา-สถานที่), ภาพถ่ายบูธ / อุปกรณ์ / ป้าย, ครบตามแผนที่กำหนด', unit:'Compliance %', icon:'✅'},
  {no:'02', name:'Sample Usage', nameTH:'การใช้ตัวอย่างสินค้า', measure:'Stock เริ่ม – Stock หลัง, จำนวนตัวอย่างที่แจกจริง', unit:'Sample Used %', icon:'📦'},
  {no:'03', name:'Verified QR Action', nameTH:'การกระตุ้นให้ลูกค้าสแกน QR', measure:'Unique Scan จาก QR ของทีม/สาขา, ข้อมูลจากระบบ (ไม่ใช้เลขที่กรอกเอง)', unit:'QR Actions', icon:'📱'},
  {no:'04', name:'Activation Efficiency', nameTH:'ประสิทธิภาพในการทำงาน', measure:'QR Actions ต่อชั่วโมง / ต่อวัน, เปรียบเทียบประสิทธิภาพระหว่างสาขา/ทีม', unit:'Actions / Hour', icon:'⚡'},
  {no:'05', name:'Cost per Verified Action', nameTH:'ค่าใช้จ่ายต่อ Action', measure:'ค่าใช้จ่ายรวม ÷ Unique QR Actions, ยิ่งน้อย ยิ่งมีประสิทธิภาพ', unit:'Cost / Action', icon:'💰'},
  {no:'06', name:'Store Manager Feedback', nameTH:'ความเห็นร้านค้า (POST-ACTIVATION)', measure:'ผู้จัดการร้านประเมินผ่าน QR Form, คะแนน 1-5 และข้อเสนอแนะเพิ่มเติม', unit:'Feedback Score', icon:'⭐'}
];

var MKT_KPIS = [
  {no:'01', name:'LINE OA Growth', nameTH:'จำนวนเพื่อนใหม่', measure:'จำนวนเพื่อนใหม่ (New Friends), แยกตาม Campaign Source (QR)', unit:'New Friends', icon:'💚'},
  {no:'02', name:'Cost per New Friend', nameTH:'ต้นทุนในการสร้างเพื่อนใหม่ 1 คน', measure:'งบการตลาด + New Friends', unit:'Cost / Friend', icon:'💵'},
  {no:'03', name:'Incremental Growth', nameTH:'การเติบโตเพิ่มขึ้น', measure:'เทียบ Friend Growth ช่วง Activation กับ Baseline, ช่วงไม่มีแคมเปญ', unit:'Uplift %', icon:'📈'},
  {no:'04', name:'Product Interest', nameTH:'ความสนใจในสินค้า', measure:'Click ดูสินค้า / เมนู / จุดจ่าย, Link / Rich Menu / CTA', unit:'Action Rate %', icon:'🛒'},
  {no:'05', name:'Audience Quality', nameTH:'คุณภาพของกลุ่มเป้าหมาย', measure:'Engagement (เปิด/คลิก/ตอบกลับ), Block Rate หลังจบแคมเปญ (7/30 วัน)', unit:'Engagement %', icon:'👥'}
];

var SALES_KPIS = [
  {name:'Baseline Sales', nameTH:'ยอดขายก่อนทำกิจกรรม', desc:'ยอดขายเฉลี่ยก่อนทำกิจกรรม ก่อนจัดกิจกรรม 2-4 สัปดาห์', icon:'📊'},
  {name:'Activation Sales', nameTH:'ยอดขายช่วงทำกิจกรรม', desc:'ยอดขายในช่วงที่มีกิจกรรมการตลาด / แจกชิม', icon:'🔥'},
  {name:'Post-Activation Sales', nameTH:'ยอดขายหลังจบกิจกรรม', desc:'ยอดขายหลังจบกิจกรรม 2-4 สัปดาห์', icon:'📉'},
  {name:'Unit Sales', nameTH:'จำนวนชิ้นที่ขาย', desc:'จำนวนชิ้นที่ขายที่กำหนด', icon:'📦'},
  {name:'Sales Uplift %', nameTH:'เปอร์เซ็นต์การเติบโต', desc:'เทียบกับ Baseline', icon:'🚀'},
  {name:'SKU Performance', nameTH:'ยอดขายตามรายหัว SKU', desc:'ดูว่า SKU ไหน ตอบรับดีที่สุด Top SKU: A / B / C', icon:'🏷️'}
];

var FEEDBACK_QUESTIONS = [
  'ความเหมาะสมของกิจกรรมกับลูกค้าและพื้นที่ร้าน',
  'ความสนใจของลูกค้าต่อกิจกรรม',
  'การเข้าแนะนำสินค้า เข้าใจง่ายและน่าสนใจ',
  'ความเรียบร้อยของบูธ อุปกรณ์ และการดำเนินกิจกรรม',
  'ผลตอบรับจากลูกค้า (ยอดขาย/ความสนใจ)',
  'ความเหมาะสมในการจัดกิจกรรมเพิ่มเติมครั้งต่อไป',
  'ข้อเสนอแนะเพิ่มเติม'
];

function _newRecord(){
  return {
    id: Date.now(),
    date: new Date().toISOString().slice(0,10),
    campaignName: '',
    store: '',
    booth: { compliance:0, sampleStart:0, sampleEnd:0, qrActions:0, hours:0, cost:0, feedbackScore:0 },
    marketing: { newFriends:0, budget:0, baselineFriends:0, clicks:0, impressions:0, engagement:0, blockRate:0 },
    sales: { baseline:0, activation:0, postActivation:0, units:0, targetUnits:0 },
    feedback: [0,0,0,0,0,0,''],
    notes: ''
  };
}

// ══════════ Render ══════════
window.renderMktActivation = function(){
  var el = document.getElementById('mktActivationContent');
  if(!el) return;
  var records = _load();
  var html = '';

  // ── Header ──
  html += '<div class="card" style="background:linear-gradient(135deg,#1a237e 0%,#0d47a1 50%,#01579b 100%);color:#fff;padding:24px;border-radius:12px;margin-bottom:16px">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">';
  html += '<div>';
  html += '<h2 style="margin:0;font-size:1.5em;font-weight:800">ACTIVATION วัดผลครบ 3 มิติ</h2>';
  html += '<p style="margin:4px 0 0;opacity:0.9;font-size:0.95em">สร้างคุณค่าให้แบรนด์ — CJ MORE</p>';
  html += '</div>';
  html += '<button onclick="showActForm()" style="background:#fff;color:#1a237e;border:none;padding:10px 20px;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.95em">+ บันทึกผล Activation</button>';
  html += '</div>';
  html += '<div style="display:flex;gap:16px;margin-top:16px;flex-wrap:wrap">';
  html += '<span style="background:rgba(255,255,255,0.15);padding:6px 14px;border-radius:20px;font-size:0.85em">✅ วัดด้วยข้อมูลที่ VERIFY ได้เอง</span>';
  html += '<span style="background:rgba(255,255,255,0.15);padding:6px 14px;border-radius:20px;font-size:0.85em">📊 ขอยอดขายจาก CJ เพื่อประเมินผลเชิงธุรกิจ</span>';
  html += '<span style="background:rgba(255,255,255,0.15);padding:6px 14px;border-radius:20px;font-size:0.85em">🔒 ไม่ใช้ข้อมูลหลังบ้าน CJ</span>';
  html += '<span style="background:rgba(255,255,255,0.15);padding:6px 14px;border-radius:20px;font-size:0.85em">📈 นำข้อมูลไปพัฒนาและต่อยอดกิจกรรม</span>';
  html += '</div>';
  html += '</div>';

  // ── 3 Dimension Cards ──
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:16px;margin-bottom:16px">';

  // Dimension 1: Booth Performance
  html += '<div class="card" style="border-top:4px solid #1565c0;padding:0">';
  html += '<div style="background:#e3f2fd;padding:14px 16px;border-radius:8px 8px 0 0">';
  html += '<h3 style="margin:0;color:#1565c0;font-size:1.1em">1) BOOTH PERFORMANCE</h3>';
  html += '<p style="margin:4px 0 0;color:#555;font-size:0.85em">วัดว่า "ทีมออกบูธทำงานจริงและมีประสิทธิภาพไหม?"</p>';
  html += '</div>';
  html += '<div style="padding:12px 16px">';
  html += '<table style="width:100%;border-collapse:collapse;font-size:0.85em">';
  html += '<tr style="background:#f5f5f5"><th style="padding:8px;text-align:left;width:30px">#</th><th style="padding:8px;text-align:left">KPI</th><th style="padding:8px;text-align:left">วิธีการวัด</th><th style="padding:8px;text-align:center;width:90px">หน่วย</th></tr>';
  BOOTH_KPIS.forEach(function(k){
    html += '<tr style="border-bottom:1px solid #eee"><td style="padding:8px;font-weight:700;color:#1565c0">' + k.no + '</td>';
    html += '<td style="padding:8px"><strong>' + k.icon + ' ' + k.name + '</strong><br><span style="color:#777;font-size:0.9em">' + k.nameTH + '</span></td>';
    html += '<td style="padding:8px;color:#555;font-size:0.9em">' + k.measure + '</td>';
    html += '<td style="padding:8px;text-align:center;color:#1565c0;font-weight:600;font-size:0.85em">' + k.unit + '</td></tr>';
  });
  html += '</table></div></div>';

  // Dimension 2: Marketing Performance
  html += '<div class="card" style="border-top:4px solid #e65100;padding:0">';
  html += '<div style="background:#fff3e0;padding:14px 16px;border-radius:8px 8px 0 0">';
  html += '<h3 style="margin:0;color:#e65100;font-size:1.1em">2) MARKETING PERFORMANCE</h3>';
  html += '<p style="margin:4px 0 0;color:#555;font-size:0.85em">วัดว่า "เงิน Marketing สร้างอะไรให้แบรนด์?"</p>';
  html += '</div>';
  html += '<div style="padding:12px 16px">';
  html += '<table style="width:100%;border-collapse:collapse;font-size:0.85em">';
  html += '<tr style="background:#f5f5f5"><th style="padding:8px;text-align:left;width:30px">#</th><th style="padding:8px;text-align:left">KPI</th><th style="padding:8px;text-align:left">วิธีการวัด</th><th style="padding:8px;text-align:center;width:90px">หน่วย</th></tr>';
  MKT_KPIS.forEach(function(k){
    html += '<tr style="border-bottom:1px solid #eee"><td style="padding:8px;font-weight:700;color:#e65100">' + k.no + '</td>';
    html += '<td style="padding:8px"><strong>' + k.icon + ' ' + k.name + '</strong><br><span style="color:#777;font-size:0.9em">' + k.nameTH + '</span></td>';
    html += '<td style="padding:8px;color:#555;font-size:0.9em">' + k.measure + '</td>';
    html += '<td style="padding:8px;text-align:center;color:#e65100;font-weight:600;font-size:0.85em">' + k.unit + '</td></tr>';
  });
  html += '</table></div></div>';

  // Dimension 3: Sales Impact
  html += '<div class="card" style="border-top:4px solid #2e7d32;padding:0">';
  html += '<div style="background:#e8f5e9;padding:14px 16px;border-radius:8px 8px 0 0">';
  html += '<h3 style="margin:0;color:#2e7d32;font-size:1.1em">3) SALES IMPACT — CJ DATA</h3>';
  html += '<p style="margin:4px 0 0;color:#555;font-size:0.85em">วัดว่า "กิจกรรมส่งผลต่อยอดขายหรือไม่?"</p>';
  html += '</div>';
  html += '<div style="padding:12px 16px">';
  html += '<table style="width:100%;border-collapse:collapse;font-size:0.85em">';
  html += '<tr style="background:#f5f5f5"><th style="padding:8px;text-align:left">ตัวชี้วัด</th><th style="padding:8px;text-align:left">คำอธิบาย</th><th style="padding:8px;text-align:center;width:100px">KPI ตัวอย่าง</th></tr>';
  var sampleKPI = ['100 ชิ้น/สัปดาห์','180 ชิ้น/สัปดาห์','130 ชิ้น/สัปดาห์','1,800 ชิ้น','+80%','Top SKU: A/B/C'];
  SALES_KPIS.forEach(function(k,i){
    html += '<tr style="border-bottom:1px solid #eee"><td style="padding:8px"><strong>' + k.icon + ' ' + k.name + '</strong><br><span style="color:#777;font-size:0.9em">' + k.nameTH + '</span></td>';
    html += '<td style="padding:8px;color:#555;font-size:0.9em">' + k.desc + '</td>';
    html += '<td style="padding:8px;text-align:center;color:#2e7d32;font-weight:600;font-size:0.85em">' + sampleKPI[i] + '</td></tr>';
  });
  html += '</table></div></div>';

  html += '</div>'; // end grid

  // ── Sales Uplift Calculation ──
  html += '<div class="card" style="margin-bottom:16px">';
  html += '<h3 style="margin:0 0 12px;color:#1a237e">📐 สูตรคำนวณ Sales Uplift</h3>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">';

  // Uplift table
  html += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:0.9em">';
  html += '<tr style="background:#e8eaf6"><th style="padding:10px;text-align:left">ช่วงเวลา</th><th style="padding:10px;text-align:center">ยอดขายเฉลี่ย<br>(ชิ้น/สัปดาห์)</th><th style="padding:10px;text-align:center">เทียบกับ Baseline</th></tr>';
  html += '<tr style="border-bottom:1px solid #eee"><td style="padding:10px">📊 ก่อนทำกิจกรรม (Baseline)</td><td style="padding:10px;text-align:center;font-weight:700">100</td><td style="padding:10px;text-align:center">—</td></tr>';
  html += '<tr style="border-bottom:1px solid #eee;background:#fff8e1"><td style="padding:10px">🔥 ช่วงทำกิจกรรม (Activation)</td><td style="padding:10px;text-align:center;font-weight:700">180</td><td style="padding:10px;text-align:center;color:#e65100;font-weight:700">+80%</td></tr>';
  html += '<tr><td style="padding:10px">📈 หลังกิจกรรม (Post)</td><td style="padding:10px;text-align:center;font-weight:700">130</td><td style="padding:10px;text-align:center;color:#2e7d32;font-weight:700">+30%</td></tr>';
  html += '</table></div>';

  // Formula
  html += '<div style="background:#e8eaf6;padding:20px;border-radius:12px;display:flex;flex-direction:column;justify-content:center;align-items:center">';
  html += '<div style="font-weight:700;color:#1a237e;font-size:1.1em;margin-bottom:12px">สูตรคำนวณ Uplift</div>';
  html += '<div style="background:#fff;padding:16px 24px;border-radius:8px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.08)">';
  html += '<div style="font-size:1.2em;font-weight:700;color:#1565c0">Uplift % =</div>';
  html += '<div style="font-size:0.95em;margin-top:8px;color:#333">(ยอดช่วงทำกิจกรรม − Baseline)</div>';
  html += '<div style="border-top:2px solid #1565c0;margin:6px 20px;"></div>';
  html += '<div style="font-size:0.95em;color:#333">Baseline × 100</div>';
  html += '</div></div>';

  html += '</div></div>';

  // ── Data Flow ──
  html += '<div class="card" style="margin-bottom:16px">';
  html += '<h3 style="margin:0 0 12px;color:#1a237e">🔄 DATA FLOW ภาพรวมการไหลของข้อมูล</h3>';
  html += '<div style="display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;padding:12px;background:#f5f5f5;border-radius:8px;font-size:0.9em">';
  var flowSteps = [
    {icon:'🏢',text:'ออกบูธที่ CJ'},
    {icon:'📱',text:'ลูกค้าสแกน QR'},
    {icon:'💚',text:'Add LINE OA'},
    {icon:'👥',text:'ได้ฐานลูกค้า<br>(Owned Audience)'},
    {icon:'📊',text:'เก็บ Engagement<br>และ Actions'},
    {icon:'📋',text:'ขอข้อมูลยอดขาย<br>จาก CJ'},
    {icon:'📈',text:'ประเมินผลครบ<br>3 มิติ'}
  ];
  flowSteps.forEach(function(s,i){
    html += '<div style="text-align:center;min-width:90px"><div style="font-size:1.8em">' + s.icon + '</div><div style="margin-top:4px;font-size:0.85em;line-height:1.3">' + s.text + '</div></div>';
    if(i < flowSteps.length-1) html += '<div style="font-size:1.3em;color:#1565c0">→</div>';
  });
  html += '</div></div>';

  // ── Store Manager Feedback Questions ──
  html += '<div class="card" style="margin-bottom:16px">';
  html += '<h3 style="margin:0 0 12px;color:#1a237e">📝 แบบสอบถามผู้จัดการร้าน (1 = น้อยที่สุด, 5 = มากที่สุด)</h3>';
  html += '<table style="width:100%;border-collapse:collapse;font-size:0.9em;max-width:700px">';
  html += '<tr style="background:#f5f5f5"><th style="padding:8px;text-align:left;width:30px">#</th><th style="padding:8px;text-align:left">หัวข้อ</th><th style="padding:8px;text-align:center;width:120px">คะแนน</th></tr>';
  FEEDBACK_QUESTIONS.forEach(function(q,i){
    html += '<tr style="border-bottom:1px solid #eee"><td style="padding:8px;color:#1565c0;font-weight:700">' + (i+1) + '</td>';
    html += '<td style="padding:8px">' + q + '</td>';
    if(i < 6){
      html += '<td style="padding:8px;text-align:center">⭐⭐⭐⭐⭐</td>';
    } else {
      html += '<td style="padding:8px;text-align:center;color:#999;font-size:0.85em">ข้อความ</td>';
    }
    html += '</tr>';
  });
  html += '</table></div>';

  // ── Summary ──
  html += '<div class="card" style="background:#e8f5e9;border-left:4px solid #2e7d32;margin-bottom:16px">';
  html += '<h3 style="margin:0 0 8px;color:#2e7d32">✅ สรุปแนวทางการประเมิน</h3>';
  html += '<ol style="margin:0;padding-left:20px;line-height:1.8;font-size:0.95em">';
  html += '<li><strong>Booth Performance</strong> = วัด Execution และประสิทธิภาพหน้างาน</li>';
  html += '<li><strong>Marketing Performance</strong> = วัดผลด้านการตลาดที่สร้าง Asset ให้แบรนด์</li>';
  html += '<li><strong>Sales Impact (CJ Data)</strong> = วัดผลลัพธ์ทางธุรกิจจากยอดขาย</li>';
  html += '</ol>';
  html += '<p style="margin:12px 0 0;font-weight:700;color:#1a237e;font-size:0.95em">3 มิติ รวมกัน ทำให้เรารู้ทั้ง "ประสิทธิภาพ" "ฐานลูกค้าที่มีคุณภาพ" และ "ผลลัพธ์ทางยอดขาย"</p>';
  html += '</div>';

  // ── Bottom banner ──
  html += '<div style="background:linear-gradient(90deg,#1565c0,#0d47a1,#01579b,#00695c,#2e7d32);padding:14px 20px;border-radius:8px;display:flex;justify-content:space-around;flex-wrap:wrap;gap:8px">';
  var goals = ['🎯 เป้าหมายสูงสุด','💡 ใช้เงินอย่างมีประสิทธิภาพ','👥 สร้างฐานลูกค้าที่มีคุณภาพ','📈 เพิ่มโอกาสการซื้อในอนาคต','💰 ยอดขายได้อย่างยั่งยืน'];
  goals.forEach(function(g,i){
    html += '<span style="color:#fff;font-size:0.85em;font-weight:600">' + g + (i<goals.length-1?' →':'') + '</span>';
  });
  html += '</div>';

  // ── Records Table ──
  if(records.length > 0){
    html += '<div class="card" style="margin-top:16px">';
    html += '<h3 style="margin:0 0 12px;color:#1a237e">📋 บันทึกผล Activation (' + records.length + ' รายการ)</h3>';
    html += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:0.85em">';
    html += '<tr style="background:#e8eaf6"><th style="padding:8px">วันที่</th><th style="padding:8px">แคมเปญ</th><th style="padding:8px">สาขา</th><th style="padding:8px;text-align:center">QR Actions</th><th style="padding:8px;text-align:center">New Friends</th><th style="padding:8px;text-align:center">Baseline</th><th style="padding:8px;text-align:center">Activation</th><th style="padding:8px;text-align:center">Uplift %</th><th style="padding:8px;text-align:center">Feedback</th><th style="padding:8px">จัดการ</th></tr>';
    records.forEach(function(r){
      var uplift = r.sales.baseline > 0 ? (((r.sales.activation - r.sales.baseline) / r.sales.baseline) * 100).toFixed(1) : '—';
      var upliftColor = parseFloat(uplift) > 0 ? '#2e7d32' : parseFloat(uplift) < 0 ? '#c62828' : '#333';
      var fbAvg = 0; var fbCount = 0;
      for(var i=0;i<6;i++){ if(r.feedback[i]>0){fbAvg+=r.feedback[i];fbCount++;} }
      fbAvg = fbCount > 0 ? (fbAvg/fbCount).toFixed(1) : '—';
      html += '<tr style="border-bottom:1px solid #eee">';
      html += '<td style="padding:8px">' + r.date + '</td>';
      html += '<td style="padding:8px">' + (r.campaignName||'—') + '</td>';
      html += '<td style="padding:8px">' + (r.store||'—') + '</td>';
      html += '<td style="padding:8px;text-align:center;font-weight:700;color:#1565c0">' + (r.booth.qrActions||0) + '</td>';
      html += '<td style="padding:8px;text-align:center;font-weight:700;color:#2e7d32">' + (r.marketing.newFriends||0) + '</td>';
      html += '<td style="padding:8px;text-align:center">' + (r.sales.baseline||0).toLocaleString() + '</td>';
      html += '<td style="padding:8px;text-align:center">' + (r.sales.activation||0).toLocaleString() + '</td>';
      html += '<td style="padding:8px;text-align:center;font-weight:700;color:' + upliftColor + '">' + (uplift==='—'?'—':uplift+'%') + '</td>';
      html += '<td style="padding:8px;text-align:center">' + fbAvg + '/5</td>';
      html += '<td style="padding:8px"><button onclick="deleteActRecord(' + r.id + ')" style="background:#ef5350;color:#fff;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:0.85em">ลบ</button></td>';
      html += '</tr>';
    });
    html += '</table></div></div>';
  }

  el.innerHTML = html;
};

// ── Form ──
window.showActForm = function(editId){
  var records = _load();
  var rec = editId ? records.find(function(r){return r.id===editId;}) : _newRecord();
  if(!rec) rec = _newRecord();

  var el = document.getElementById('mktActivationContent');
  var html = '<div class="card" style="margin-bottom:16px">';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">';
  html += '<h3 style="margin:0;color:#1a237e">📝 ' + (editId?'แก้ไข':'บันทึก') + 'ผล Activation</h3>';
  html += '<button onclick="renderMktActivation()" style="background:#eee;border:none;padding:8px 16px;border-radius:6px;cursor:pointer">✕ ยกเลิก</button>';
  html += '</div>';

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin-bottom:16px">';
  html += '<div><label style="font-weight:600;font-size:0.9em">วันที่</label><input type="date" id="actDate" value="' + rec.date + '" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;margin-top:4px"></div>';
  html += '<div><label style="font-weight:600;font-size:0.9em">ชื่อแคมเปญ</label><input type="text" id="actCampaign" value="' + (rec.campaignName||'') + '" placeholder="เช่น Sampling CJ สาขาบางบอน" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;margin-top:4px"></div>';
  html += '<div><label style="font-weight:600;font-size:0.9em">สาขา/ร้านค้า</label><input type="text" id="actStore" value="' + (rec.store||'') + '" placeholder="เช่น CJ สาขาบางบอน" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;margin-top:4px"></div>';
  html += '</div>';

  // Booth Performance
  html += '<h4 style="color:#1565c0;margin:16px 0 8px;border-bottom:2px solid #1565c0;padding-bottom:4px">1) Booth Performance</h4>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">';
  html += _numField('actCompliance','Compliance %',rec.booth.compliance);
  html += _numField('actSampleStart','Sample เริ่ม (ชิ้น)',rec.booth.sampleStart);
  html += _numField('actSampleEnd','Sample เหลือ (ชิ้น)',rec.booth.sampleEnd);
  html += _numField('actQrActions','QR Actions',rec.booth.qrActions);
  html += _numField('actHours','ชั่วโมงทำงาน',rec.booth.hours);
  html += _numField('actCost','ค่าใช้จ่ายรวม (บาท)',rec.booth.cost);
  html += '</div>';

  // Marketing Performance
  html += '<h4 style="color:#e65100;margin:16px 0 8px;border-bottom:2px solid #e65100;padding-bottom:4px">2) Marketing Performance</h4>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">';
  html += _numField('actNewFriends','New Friends',rec.marketing.newFriends);
  html += _numField('actMktBudget','งบการตลาด (บาท)',rec.marketing.budget);
  html += _numField('actBaselineFriends','Baseline Friends (ก่อน)',rec.marketing.baselineFriends);
  html += _numField('actClicks','Clicks (ดูสินค้า)',rec.marketing.clicks);
  html += _numField('actImpressions','Impressions',rec.marketing.impressions);
  html += _numField('actEngagement','Engagement %',rec.marketing.engagement);
  html += _numField('actBlockRate','Block Rate %',rec.marketing.blockRate);
  html += '</div>';

  // Sales Impact
  html += '<h4 style="color:#2e7d32;margin:16px 0 8px;border-bottom:2px solid #2e7d32;padding-bottom:4px">3) Sales Impact</h4>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">';
  html += _numField('actBaseline','Baseline Sales (ชิ้น/สัปดาห์)',rec.sales.baseline);
  html += _numField('actActivation','Activation Sales (ชิ้น/สัปดาห์)',rec.sales.activation);
  html += _numField('actPost','Post-Activation Sales',rec.sales.postActivation);
  html += _numField('actUnits','Unit Sales (ชิ้น)',rec.sales.units);
  html += _numField('actTargetUnits','เป้าหมาย (ชิ้น)',rec.sales.targetUnits);
  html += '</div>';

  // Feedback
  html += '<h4 style="color:#7b1fa2;margin:16px 0 8px;border-bottom:2px solid #7b1fa2;padding-bottom:4px">⭐ Store Manager Feedback</h4>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:8px">';
  FEEDBACK_QUESTIONS.forEach(function(q,i){
    if(i < 6){
      html += '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:0.85em;flex:1">' + (i+1) + '. ' + q + '</span>';
      html += '<select id="actFb' + i + '" style="padding:6px;border:1px solid #ddd;border-radius:4px;width:60px">';
      for(var s=0;s<=5;s++) html += '<option value="' + s + '"' + (rec.feedback[i]===s?' selected':'') + '>' + (s===0?'—':s) + '</option>';
      html += '</select></div>';
    } else {
      html += '<div><span style="font-size:0.85em">' + (i+1) + '. ' + q + '</span>';
      html += '<textarea id="actFb6" rows="2" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:4px;margin-top:4px">' + (rec.feedback[6]||'') + '</textarea></div>';
    }
  });
  html += '</div>';

  html += '<div style="display:flex;gap:8px;margin-top:16px"><label style="font-weight:600;font-size:0.9em">หมายเหตุ</label></div>';
  html += '<textarea id="actNotes" rows="2" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;margin-top:4px">' + (rec.notes||'') + '</textarea>';

  html += '<div style="margin-top:16px;text-align:right">';
  html += '<button onclick="saveActRecord(' + (editId||0) + ')" style="background:#1565c0;color:#fff;border:none;padding:10px 28px;border-radius:8px;font-weight:700;cursor:pointer;font-size:1em">💾 บันทึก</button>';
  html += '</div></div>';

  el.innerHTML = html;
};

function _numField(id, label, val){
  return '<div><label style="font-weight:600;font-size:0.85em;color:#555">' + label + '</label>' +
    '<input type="number" id="' + id + '" value="' + (val||0) + '" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;margin-top:4px"></div>';
}

function _v(id){ return parseFloat(document.getElementById(id).value)||0; }
function _t(id){ return (document.getElementById(id).value||'').trim(); }

window.saveActRecord = function(editId){
  var records = _load();
  var rec = editId ? records.find(function(r){return r.id===editId;}) : _newRecord();
  if(!rec){ rec = _newRecord(); records.push(rec); }
  else if(!editId){ records.push(rec); }

  rec.date = _t('actDate');
  rec.campaignName = _t('actCampaign');
  rec.store = _t('actStore');
  rec.booth = { compliance:_v('actCompliance'), sampleStart:_v('actSampleStart'), sampleEnd:_v('actSampleEnd'), qrActions:_v('actQrActions'), hours:_v('actHours'), cost:_v('actCost') };
  rec.marketing = { newFriends:_v('actNewFriends'), budget:_v('actMktBudget'), baselineFriends:_v('actBaselineFriends'), clicks:_v('actClicks'), impressions:_v('actImpressions'), engagement:_v('actEngagement'), blockRate:_v('actBlockRate') };
  rec.sales = { baseline:_v('actBaseline'), activation:_v('actActivation'), postActivation:_v('actPost'), units:_v('actUnits'), targetUnits:_v('actTargetUnits') };

  var fb = [];
  for(var i=0;i<6;i++) fb.push(parseInt(document.getElementById('actFb'+i).value)||0);
  fb.push(_t('actFb6'));
  rec.feedback = fb;
  rec.notes = _t('actNotes');

  _save(records);
  renderMktActivation();
};

window.deleteActRecord = function(id){
  if(!confirm('ลบรายการนี้?')) return;
  var records = _load().filter(function(r){return r.id!==id;});
  _save(records);
  renderMktActivation();
};

// ── Hook into marketing tab switch ──
var _origMktSub = window.showMktSub;
window.showMktSub = function(el, sub){
  _origMktSub(el, sub);
  if(sub === 'mkt-activation') renderMktActivation();
};

})();
