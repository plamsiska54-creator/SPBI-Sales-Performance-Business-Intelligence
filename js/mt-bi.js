// ════════════════════════════════════════
// MT BI MODULE — Modern Trade Business Intelligence
// 20 menus × 7 channels
// ════════════════════════════════════════

var _mtBiCurrent = 'dashboard';
var _mtBiCatOpen = {};

// ── MT Channel Company Info ──
var MT_COMPANY_INFO = {
  CJ: {
    nameTH: 'บริษัท ซี.เจ. เอ็กซ์เพรส กรุ๊ป จำกัด',
    nameEN: 'C.J. Express Group Co., Ltd.',
    taxId: '0105556055491',
    address: '393 อาคาร 393 สีลม ชั้น 2, 4 และ 5 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพมหานคร 10500',
    type: 'ค้าปลีก (Retail)',
    country: '🇹🇭 ไทย',
    desc: 'ดำเนินกิจการร้านสะดวกซื้อและซูเปอร์มาร์เก็ต CJ More / CJ Supermarket ทั่วประเทศไทย',
    website: 'https://cjexpress.co.th',
    webLabel: 'cjexpress.co.th'
  },
  BigC: {
    nameTH: 'บริษัท บิ๊กซี ซูเปอร์เซ็นเตอร์ จำกัด (มหาชน)',
    nameEN: 'Big C Supercenter Public Company Limited',
    taxId: '0107536000633',
    address: '97/11 ชั้น 6 ถนนราชดำริ แขวงลุมพินี เขตปทุมวัน กรุงเทพมหานคร 10330',
    type: 'ค้าปลีก (Retail — Hypermarket)',
    country: '🇹🇭 ไทย',
    desc: 'ห้างค้าปลีกขนาดใหญ่ (Hypermarket/Supercenter) ภายใต้กลุ่ม BJC (เบอร์ลี่ ยุคเกอร์)',
    website: 'https://corporate.bigc.co.th',
    webLabel: 'corporate.bigc.co.th'
  },
  Top: {
    nameTH: 'บริษัท เซ็นทรัล ฟู้ด รีเทล จำกัด',
    nameEN: 'Central Food Retail Co., Ltd.',
    taxId: '0105535134278',
    address: '99/9 อาคารเซ็นทรัลพลาซา แจ้งวัฒนะ ออฟฟิศ ทาวเวอร์ ชั้น 12, 15-18 หมู่ 2 ถนนแจ้งวัฒนะ ตำบลบางตลาด อำเภอปากเกร็ด จังหวัดนนทบุรี 11120',
    type: 'ค้าปลีก (Retail — Supermarket)',
    country: '🇹🇭 ไทย',
    desc: 'บริหารซูเปอร์มาร์เก็ต Tops Market, Tops Super, Tops Daily, Central Food Hall ในเครือเซ็นทรัล รีเทล',
    website: 'https://corporate.tops.co.th',
    webLabel: 'corporate.tops.co.th'
  },
  Makro: {
    nameTH: 'บริษัท ซีพี แอ็กซ์ตร้า จำกัด (มหาชน)',
    nameEN: 'CP Axtra Public Company Limited',
    taxId: '0107537000521',
    address: '1468 ถนนพัฒนาการ แขวงพัฒนาการ เขตสวนหลวง กรุงเทพมหานคร 10250',
    type: 'ค้าส่ง/ค้าปลีก (Wholesale/Retail)',
    country: '🇹🇭 ไทย',
    desc: 'ดำเนินกิจการค้าส่งภายใต้แบรนด์ Makro และค้าปลีกภายใต้แบรนด์ Lotus\'s ในเครือ CP Group (เดิมชื่อ สยามแม็คโคร)',
    website: 'https://www.cpaxtra.com',
    webLabel: 'cpaxtra.com'
  },
  Aeon: {
    nameTH: 'บริษัท อิออน (ไทยแลนด์) จำกัด',
    nameEN: 'AEON (Thailand) Co., Ltd.',
    taxId: '0105527044125',
    address: '78 อาคารอิออน ชั้น 2 ถนนแจ้งวัฒนะ แขวงอนุสาวรีย์ เขตบางเขน กรุงเทพมหานคร 10220',
    type: 'ค้าปลีก (Retail — Supermarket)',
    country: '🇹🇭 ไทย',
    desc: 'ดำเนินกิจการซูเปอร์มาร์เก็ต MaxValu และร้านค้าปลีกในเครือ AEON Group ของญี่ปุ่น',
    website: 'https://www.aeonthailand.co.th',
    webLabel: 'aeonthailand.co.th'
  },
  TheMall: {
    nameTH: 'บริษัท เดอะมอลล์ กรุ๊ป จำกัด',
    nameEN: 'The Mall Group Co., Ltd.',
    taxId: '0105523009350',
    address: '49 ถนนรามคำแหง แขวงหัวหมาก เขตบางกะปิ กรุงเทพมหานคร 10240',
    type: 'ค้าปลีก/ศูนย์การค้า (Retail/Shopping Center)',
    country: '🇹🇭 ไทย',
    desc: 'บริหารศูนย์การค้า The Mall, D.E.M District (EmQuartier, Emporium, Emsphere) และ Siam Paragon',
    website: 'https://www.themallgroup.com',
    webLabel: 'themallgroup.com'
  },
  MM: {
    nameTH: 'MM Mega Market (Vietnam) Co., Ltd.',
    nameEN: 'MM Mega Market Vietnam (MMVN)',
    taxId: '0302249586',
    address: 'Khu B, Khu do thi moi An Phu - An Khanh, Phuong An Phu, Thanh pho Thu Duc, Ho Chi Minh City, Vietnam',
    type: 'ค้าส่ง (Wholesale)',
    country: '🇻🇳 เวียดนาม',
    desc: 'ผู้นำด้าน supply chain เชื่อมเกษตรกร-ผู้ผลิตท้องถิ่น สู่ผู้บริโภค ในเครือ TCC Group ของไทย',
    website: 'https://mmvietnam.com/en/',
    webLabel: 'mmvietnam.com'
  }
};

// ── MT Delivery Schedule ──
var MT_DELIVERY = {
  CJ: [
    {dc:'ศูนย์กระจายสินค้า CJ Express บางวัว',code:'DC1',day:'ทุกวัน',leave:'20.00-20.30 น.',checkin:'00.00 น.',unload:'01.00-03.00 น.',tel:'095-8759396',addr:'139/7 หมู่ 4 ต.บ้านฆ้อง อ.โพธาราม จ.ราชบุรี 70120',map:'https://www.google.com/maps/dir/?api=1&destination=13.678205,100.897897',note:''},
    {dc:'ศูนย์กระจายสินค้า CJ Express โพธาราม',code:'DC2',day:'ทุกวัน',leave:'22.30 น.',checkin:'00.00 น.',unload:'01.00-03.00 น.',tel:'086-4294238, 081-3782021',addr:'139/7 หมู่ 4 ต.บ้านฆ้อง อ.โพธาราม จ.ราชบุรี 70120',map:'https://www.google.com/maps?q=13.678205,99.867558',note:''},
    {dc:'ศูนย์กระจายสินค้า CJ ขอนแก่น',code:'DC4',day:'อ, พฤ, ส',leave:'9.00 น.',checkin:'19.00 น.',unload:'21.00 น.',tel:'—',addr:'—',map:'',note:''}
  ],
  BigC: [
    {dc:'ไฮเปอร์',code:'Group1',day:'จ, อ, พ, พฤ, ศ, ส',leave:'10.00 น.',checkin:'14.00 น.',unload:'16.00 น.',tel:'033-021-701',addr:'99/7 หมู่ 7 ต.คลองเปรง อ.เมืองฉะเชิงเทรา จ.ฉะเชิงเทรา 24000',map:'https://www.google.com/maps?q=13.691691,100.897897',note:''},
    {dc:'มินิ',code:'Group2',day:'จ, อ, พ, พฤ, ศ, ส',leave:'10.00 น.',checkin:'14.00 น.',unload:'16.00 น.',tel:'033-021-701',addr:'99/7 หมู่ 7 ต.คลองเปรง อ.เมืองฉะเชิงเทรา จ.ฉะเชิงเทรา 24000',map:'https://www.google.com/maps?q=13.691691,100.897898',note:''}
  ],
  Top: [
    {dc:'บ้านเล็ก',code:'Central Food Retail (FDC)',day:'ศ',leave:'6.00 น.',checkin:'9.00 น.',unload:'11.00 น.',tel:'034-495-900',addr:'8/5-7 ต.บางกระเจ้า อ.เมืองสมุทรสาคร จ.สมุทรสาคร 74000',map:'https://maps.google.com/?q=8.5-7+Bang+Krachao+Mueang+Samut+Sakhon+74000',note:'ถ้าเกินเสียค่าปรับ นาทีละ 10 บาท'},
    {dc:'บ้านใหญ่',code:'Central Food Retail (FDC)',day:'ศ',leave:'6.00 น.',checkin:'9.00 น.',unload:'11.00 น.',tel:'034-495-900',addr:'8/5-7 ต.บางกระเจ้า อ.เมืองสมุทรสาคร จ.สมุทรสาคร 74000',map:'https://maps.google.com/?q=8.5-7+Bang+Krachao+Mueang+Samut+Sakhon+74000',note:'ถ้าเกินเสียค่าปรับ นาทีละ 10 บาท'}
  ],
  TheMall: [
    {dc:'The Mall',code:'—',day:'ส',leave:'—',checkin:'—',unload:'—',tel:'—',addr:'—',map:'',note:''}
  ],
  Aeon: [
    {dc:'Aeon',code:'—',day:'จ, ศ',leave:'8.00 น.',checkin:'11.00 น.',unload:'11.00 น.',tel:'081-480-8002',addr:'ต.ลำลูกกา อ.ลำลูกกา จ.ปทุมธานี 12150',map:'https://maps.app.goo.gl/ozEJEokwR3x16S4FA',note:''}
  ],
  Makro: [
    {dc:'วังน้อย',code:'DC-WN',day:'จ, พ',leave:'6.00 น.',checkin:'9.00 น.',unload:'11.00 น.',tel:'035-799-729',addr:'88 หมู่ 2 ต.ลำไทร อ.วังน้อย จ.พระนครศรีอยุธยา 13170',map:'https://maps.google.com/?q=88+หมู่+2+ตำบลลำไทร+อำเภอวังน้อย+พระนครศรีอยุธยา+13170',note:''},
    {dc:'มหาชัย',code:'DC-MC',day:'จ, พ',leave:'6.00 น.',checkin:'9.00 น.',unload:'11.00 น.',tel:'034-440-871',addr:'54/6 ต.กาหลง อ.เมืองสมุทรสาคร จ.สมุทรสาคร 74000',map:'https://maps.google.com/?q=99/99+หมู่+4+ตำบลนาดี+อำเภอเมืองสมุทรสาคร+74000',note:''}
  ],
  MM: [
    {dc:'ไฮเปอร์',code:'Group1',day:'จ, อ, พ, พฤ, ศ, ส',leave:'10.00 น.',checkin:'14.00 น.',unload:'16.00 น.',tel:'033-021-701',addr:'99/7 หมู่ 7 ต.คลองเปรง อ.เมืองฉะเชิงเทรา จ.ฉะเชิงเทรา 24000',map:'https://www.google.com/maps?q=13.691691,100.897897',note:''}
  ]
};

function _mtBiRenderDeliveryTable(chKey){
  var items=MT_DELIVERY[chKey];
  if(!items||!items.length) return '';
  var color=(typeof MT_CH_COLORS!=='undefined'&&MT_CH_COLORS[chKey])?MT_CH_COLORS[chKey]:'#ea580c';
  var html='<div class="card" style="margin-bottom:16px;border-top:3px solid '+color+'">';
  html+='<div class="card-title">🚚 ตารางส่งสินค้า</div>';
  html+='<div class="table-wrap"><table><thead><tr>';
  html+='<th>คลัง</th><th>รหัส</th><th>วันที่ส่ง</th><th>ออกจากบริษัท</th><th>เช็คอิน</th><th>ลงของ</th><th>เบอร์โทร</th><th>ที่อยู่คลัง</th><th>แผนที่</th>';
  if(items.some(function(d){return d.note;})) html+='<th>หมายเหตุ</th>';
  html+='</tr></thead><tbody>';
  var hasNote=items.some(function(d){return d.note;});
  items.forEach(function(d){
    html+='<tr>';
    html+='<td style="font-weight:600;white-space:nowrap">'+d.dc+'</td>';
    html+='<td style="white-space:nowrap"><span style="background:'+color+'15;color:'+color+';padding:2px 8px;border-radius:8px;font-size:11px;font-weight:700">'+d.code+'</span></td>';
    html+='<td style="white-space:nowrap;font-weight:600;color:'+color+'">'+d.day+'</td>';
    html+='<td style="white-space:nowrap">'+d.leave+'</td>';
    html+='<td style="white-space:nowrap">'+d.checkin+'</td>';
    html+='<td style="white-space:nowrap">'+d.unload+'</td>';
    html+='<td style="white-space:nowrap">'+d.tel+'</td>';
    html+='<td style="font-size:11px;max-width:220px;white-space:normal;line-height:1.4">'+d.addr+'</td>';
    html+='<td>'+(d.map?'<a href="'+d.map+'" target="_blank" style="color:#3b82f6;text-decoration:none;font-weight:600;font-size:12px">📍 ดู</a>':'—')+'</td>';
    if(hasNote) html+='<td style="font-size:11px;color:#dc2626;max-width:150px;white-space:normal">'+(d.note||'—')+'</td>';
    html+='</tr>';
  });
  html+='</tbody></table></div></div>';
  return html;
}

function _mtBiRenderDelivery(){
  var ch=_mtCh;
  var color=(ch==='All')?'#4f46e5':((typeof MT_CH_COLORS!=='undefined'&&MT_CH_COLORS[ch])?MT_CH_COLORS[ch]:'#ea580c');
  var chLabel=(ch==='All')?'ทุกช่องทาง':((typeof MT_CH_LABELS!=='undefined'&&MT_CH_LABELS[ch])?MT_CH_LABELS[ch]:ch);
  var html='';
  html+='<div class="card" style="background:linear-gradient(135deg,'+color+','+_mtBiLighten(color)+');color:#fff;padding:24px 28px;margin-bottom:18px;border-radius:14px">';
  html+='<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
  html+='<div><div style="font-size:20px;font-weight:800">🚚 การจัดส่ง</div>';
  html+='<div style="font-size:13px;opacity:.85;margin-top:4px">'+chLabel+' — ตารางส่งสินค้าและข้อมูลคลังสินค้า</div></div>';
  html+='<div style="background:rgba(255,255,255,.2);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700">'+chLabel+'</div>';
  html+='</div></div>';
  if(ch==='All'){
    var keys=Object.keys(MT_DELIVERY);
    keys.forEach(function(k){
      var label=(typeof MT_CH_LABELS!=='undefined'&&MT_CH_LABELS[k])?MT_CH_LABELS[k]:k;
      html+='<h3 style="margin:18px 0 6px;font-size:15px;font-weight:700;color:'+((typeof MT_CH_COLORS!=='undefined'&&MT_CH_COLORS[k])?MT_CH_COLORS[k]:'#ea580c')+'">'+label+'</h3>';
      html+=_mtBiRenderDeliveryTable(k);
    });
  } else {
    html+=_mtBiRenderDeliveryTable(ch);
    if(!MT_DELIVERY[ch]||!MT_DELIVERY[ch].length){
      html+='<div class="card" style="padding:40px;text-align:center;color:var(--muted)">ยังไม่มีข้อมูลตารางส่งสินค้าสำหรับช่องทางนี้</div>';
    }
  }
  return html;
}

// ── MT Period Filter ──
var _mtPeriod = { type: 'all', year: null, months: null, label: 'ทั้งหมด' };

function mtSetPeriod(type, btnEl) {
  var now = new Date();
  var curY = now.getFullYear();
  var curM = now.getMonth(); // 0-based
  var MONTHS_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

  if (type === 'all') {
    _mtPeriod = { type: 'all', year: null, months: null, label: 'ทั้งหมด' };
    document.getElementById('mtQuarterSelect').value = '';
    document.getElementById('mtYearSelect').value = '';
  } else if (type === 'today' || type === 'month') {
    _mtPeriod = { type: type, year: curY, months: [curM], label: MONTHS_TH[curM] + ' ' + curY };
    document.getElementById('mtQuarterSelect').value = '';
    document.getElementById('mtYearSelect').value = '';
  } else if (type === 'lastmonth') {
    var lmY = curM === 0 ? curY - 1 : curY;
    var lmM = curM === 0 ? 11 : curM - 1;
    _mtPeriod = { type: 'lastmonth', year: lmY, months: [lmM], label: MONTHS_TH[lmM] + ' ' + lmY };
    document.getElementById('mtQuarterSelect').value = '';
    document.getElementById('mtYearSelect').value = '';
  } else if (type === 'quarter') {
    var qVal = document.getElementById('mtQuarterSelect').value;
    if (!qVal) return;
    var parts = qVal.split('-');
    var qY = parseInt(parts[0]);
    var qN = parseInt(parts[1].replace('Q', ''));
    var qStart = (qN - 1) * 3;
    _mtPeriod = { type: 'quarter', year: qY, months: [qStart, qStart + 1, qStart + 2], label: 'Q' + qN + '/' + qY };
    document.getElementById('mtYearSelect').value = '';
    btnEl = null;
  } else if (type === 'year') {
    var yVal = document.getElementById('mtYearSelect').value;
    if (!yVal) return;
    _mtPeriod = { type: 'year', year: parseInt(yVal), months: null, label: 'ปี ' + yVal };
    document.getElementById('mtQuarterSelect').value = '';
    btnEl = null;
  }

  // Update active button + dropdown styles
  document.querySelectorAll('#mtPeriodFilter .fmtab').forEach(function (b) { b.classList.remove('active'); });
  var qBtn = document.getElementById('mtQuarterDropBtn');
  var yBtn = document.getElementById('mtYearDropBtn');

  if (type === 'quarter') {
    if (qBtn) { qBtn.classList.add('active'); document.getElementById('mtQuarterLabel').textContent = '📆 ' + _mtPeriod.label; }
    if (yBtn) { yBtn.classList.remove('active'); document.getElementById('mtYearLabel').textContent = '📅 รายปี'; }
    var mBtn2 = document.getElementById('mtMonthDropBtn');
    if (mBtn2) { mBtn2.classList.remove('active'); document.getElementById('mtMonthLabel').textContent = '📅 รายเดือน'; }
  } else if (type === 'year') {
    var thaiY = _mtPeriod.year + 543;
    if (yBtn) { yBtn.classList.add('active'); document.getElementById('mtYearLabel').textContent = '📅 ปี ' + thaiY; }
    if (qBtn) { qBtn.classList.remove('active'); document.getElementById('mtQuarterLabel').textContent = '📆 รายไตรมาส'; }
    var mBtn3 = document.getElementById('mtMonthDropBtn');
    if (mBtn3) { mBtn3.classList.remove('active'); document.getElementById('mtMonthLabel').textContent = '📅 รายเดือน'; }
  } else {
    if (btnEl) btnEl.classList.add('active');
    if (qBtn) { qBtn.classList.remove('active'); document.getElementById('mtQuarterLabel').textContent = '📆 รายไตรมาส'; }
    if (yBtn) { yBtn.classList.remove('active'); document.getElementById('mtYearLabel').textContent = '📅 รายปี'; }
    var mBtn = document.getElementById('mtMonthDropBtn');
    if (mBtn) { mBtn.classList.remove('active'); document.getElementById('mtMonthLabel').textContent = '📅 รายเดือน'; }
  }

  // Update label
  var lbl = document.getElementById('mtPeriodLabel');
  if (lbl) lbl.textContent = 'กำลังแสดง: ' + _mtPeriod.label;

  // Sync year selectors in sub-pages
  if (_mtPeriod.year) {
    _spYear = _mtPeriod.year;
    _ordYear = _mtPeriod.year;
  }

  // Re-render current page
  _mtPeriodRefresh();
}

function _mtPeriodRefresh() {
  if (_mtBiCurrent === 'dashboard') {
    renderMTPage();
  } else {
    var dynDiv = document.getElementById('mtBiDynamic');
    if (dynDiv) dynDiv.innerHTML = mtBiRenderPage(_mtBiCurrent);
  }
}

function _mtPeriodSyncUI() {
  var btns = document.querySelectorAll('#mtPeriodFilter .fmtab');
  btns.forEach(function (b) { b.classList.remove('active'); });
  // Reset dropdown buttons
  var qBtn = document.getElementById('mtQuarterDropBtn');
  var yBtn = document.getElementById('mtYearDropBtn');
  if (qBtn) { qBtn.classList.remove('active'); document.getElementById('mtQuarterLabel').textContent = '📆 รายไตรมาส'; }
  if (yBtn) { yBtn.classList.remove('active'); document.getElementById('mtYearLabel').textContent = '📅 รายปี'; }
  // Reset hidden selects
  var qSel = document.getElementById('mtQuarterSelect');
  var ySel = document.getElementById('mtYearSelect');
  if (qSel) qSel.value = '';
  if (ySel) ySel.value = '';
  if (_mtPeriod.type === 'year') {
    if (ySel) ySel.value = String(_mtPeriod.year);
    var thaiY = _mtPeriod.year + 543;
    if (yBtn) { yBtn.classList.add('active'); document.getElementById('mtYearLabel').textContent = '📅 ปี ' + thaiY; }
  }
  if (_mtPeriod.type === 'quarter' && qBtn) {
    qBtn.classList.add('active');
    document.getElementById('mtQuarterLabel').textContent = '📆 ' + _mtPeriod.label;
  }
  if (_mtPeriod.type === 'all') btns[0].classList.add('active');
  var lbl = document.getElementById('mtPeriodLabel');
  if (lbl) lbl.textContent = 'กำลังแสดง: ' + _mtPeriod.label;
}

// ── MT Quarter/Year Dropdown Functions ──
function mtToggleQMenu() {
  var m = document.getElementById('mtQuarterMenu');
  if (m.style.display !== 'none') { m.style.display = 'none'; return; }
  m.style.display = 'block';
  document.getElementById('mtYearMenu').style.display = 'none';
  setTimeout(function () { document.addEventListener('click', _mtCloseQMenu); }, 0);
}
function _mtCloseQMenu(e) {
  var d = document.getElementById('mtQuarterDropdown');
  if (d && !d.contains(e.target)) {
    document.getElementById('mtQuarterMenu').style.display = 'none';
    document.removeEventListener('click', _mtCloseQMenu);
  }
}
function mtPickQuarter(val, el) {
  document.getElementById('mtQuarterMenu').style.display = 'none';
  document.removeEventListener('click', _mtCloseQMenu);
  // Clear active in menu
  var items = document.querySelectorAll('#mtQuarterMenu .qmenu-item');
  items.forEach(function (i) { i.classList.remove('active'); });
  if (el) el.classList.add('active');
  // Set hidden select and trigger
  document.getElementById('mtQuarterSelect').value = val;
  mtSetPeriod('quarter', null);
}
function mtToggleYMenu() {
  var m = document.getElementById('mtYearMenu');
  if (m.style.display !== 'none') { m.style.display = 'none'; return; }
  m.style.display = 'block';
  document.getElementById('mtQuarterMenu').style.display = 'none';
  setTimeout(function () { document.addEventListener('click', _mtCloseYMenu); }, 0);
}
function _mtCloseYMenu(e) {
  var d = document.getElementById('mtYearDropdown');
  if (d && !d.contains(e.target)) {
    document.getElementById('mtYearMenu').style.display = 'none';
    document.removeEventListener('click', _mtCloseYMenu);
  }
}
function mtPickYear(yr, el) {
  document.getElementById('mtYearMenu').style.display = 'none';
  document.removeEventListener('click', _mtCloseYMenu);
  var items = document.querySelectorAll('#mtYearMenu .qmenu-item');
  items.forEach(function (i) { i.classList.remove('active'); });
  if (el) el.classList.add('active');
  document.getElementById('mtYearSelect').value = String(yr);
  mtSetPeriod('year', null);
}

// ===== Month dropdown =====
function mtToggleMoMenu() {
  var m = document.getElementById('mtMonthMenu');
  if (m.style.display !== 'none') { m.style.display = 'none'; return; }
  m.style.display = 'block';
  document.getElementById('mtQuarterMenu').style.display = 'none';
  document.getElementById('mtYearMenu').style.display = 'none';
  setTimeout(function () { document.addEventListener('click', _mtCloseMoMenu); }, 0);
}
function _mtCloseMoMenu(e) {
  var d = document.getElementById('mtMonthDropdown');
  if (d && !d.contains(e.target)) {
    document.getElementById('mtMonthMenu').style.display = 'none';
    document.removeEventListener('click', _mtCloseMoMenu);
  }
}
function mtPickMonth(mo, el) {
  document.getElementById('mtMonthMenu').style.display = 'none';
  document.removeEventListener('click', _mtCloseMoMenu);
  var items = document.querySelectorAll('#mtMonthMenu .qmenu-item');
  items.forEach(function (i) { i.classList.remove('active'); });
  if (el) el.classList.add('active');
  var ML = {Jan:'ม.ค.',Feb:'ก.พ.',Mar:'มี.ค.',Apr:'เม.ย.',May:'พ.ค.',Jun:'มิ.ย.',Jul:'ก.ค.',Aug:'ส.ค.',Sep:'ก.ย.',Oct:'ต.ค.',Nov:'พ.ย.',Dec:'ธ.ค.'};
  var MI = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
  var now = new Date();
  var curY = now.getFullYear();
  _mtPeriod = { type: 'pickmonth', year: curY, months: [MI[mo]], label: ML[mo] + ' ' + curY };
  document.querySelectorAll('#mtPeriodFilter .fmtab').forEach(function (b) { b.classList.remove('active'); });
  var qBtn = document.getElementById('mtQuarterDropBtn');
  var yBtn = document.getElementById('mtYearDropBtn');
  var mBtn = document.getElementById('mtMonthDropBtn');
  if (qBtn) { qBtn.classList.remove('active'); document.getElementById('mtQuarterLabel').textContent = '📆 รายไตรมาส'; }
  if (yBtn) { yBtn.classList.remove('active'); document.getElementById('mtYearLabel').textContent = '📅 รายปี'; }
  if (mBtn) { mBtn.classList.add('active'); document.getElementById('mtMonthLabel').textContent = '📅 ' + ML[mo]; }
  document.getElementById('mtQuarterSelect').value = '';
  document.getElementById('mtYearSelect').value = '';
  var lbl = document.getElementById('mtPeriodLabel');
  if (lbl) lbl.textContent = 'กำลังแสดง: ' + _mtPeriod.label;
  _mtPeriodRefresh();
}

// Helper: get filtered monthly data from SALES_DATA for given channel + period
function _mtGetFilteredSales(ch) {
  var MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var p = _mtPeriod;
  var years = p.year ? [p.year] : [2024, 2025, 2026];
  var monthIdxs = p.months; // null = all

  var totalNet = 0, totalQty = 0, totalOrders = 0;
  var monthRows = [];

  for (var yi = 0; yi < years.length; yi++) {
    var yr = years[yi];
    var yearData, yearOrders;
    if (ch === 'All') {
      var agg = _mtBiGetSalesAll(yr);
      yearData = agg ? { months: agg.months } : null;
      yearOrders = _mtBiGetOrderAll(yr);
    } else {
      var salesCh = (typeof SALES_DATA !== 'undefined' && SALES_DATA.ModernTrade && SALES_DATA.ModernTrade[ch]) ? SALES_DATA.ModernTrade[ch] : null;
      var orderCh = (typeof ORDER_SUMMARY !== 'undefined' && ORDER_SUMMARY.ModernTrade && ORDER_SUMMARY.ModernTrade[ch]) ? ORDER_SUMMARY.ModernTrade[ch] : null;
      yearData = salesCh && salesCh.years && salesCh.years[yr] ? salesCh.years[yr] : null;
      yearOrders = orderCh && orderCh[yr] ? orderCh[yr] : null;
    }

    for (var mi = 0; mi < 12; mi++) {
      if (monthIdxs && monthIdxs.indexOf(mi) === -1) continue;
      var mk = MONTHS_EN[mi];
      var md = yearData && yearData.months && yearData.months[mk] ? yearData.months[mk] : null;
      var od = yearOrders && yearOrders[mk] ? yearOrders[mk] : null;
      var net = md ? (md.b || 0) : 0;
      var qty = md ? (md.q || 0) : 0;
      var orders = od ? (od.orders || 0) : 0;
      totalNet += net;
      totalQty += qty;
      totalOrders += orders;
    }
  }
  return { net: totalNet, qty: totalQty, orders: totalOrders };
}

// ── Category & Menu definitions ──
var MT_BI_CATS = [
  {key:'dashboard',icon:'📊',label:'แดชบอร์ด',items:[
    {key:'dashboard',label:'ภาพรวม'}
  ]},
  {key:'sales',icon:'💰',label:'ยอดขาย',items:[
    {key:'sales-perf',label:'ผลงานยอดขาย'},
    {key:'sales-target',label:'เป้าหมายยอดขาย'}
  ]},
  {key:'customer',icon:'👥',label:'ลูกค้า',items:[
    {key:'customer-mgmt',label:'จัดการลูกค้า'}
  ]},
  {key:'product',icon:'🍞',label:'สินค้า',items:[
    {key:'product-perf',label:'ผลงานสินค้า'},
    {key:'competitor',label:'คู่แข่ง'}
  ]},
  {key:'promo',icon:'🎯',label:'โปรโมชั่น',items:[
    {key:'promotion',label:'โปรโมชั่น'}
  ]},
  {key:'supply',icon:'📦',label:'ซัพพลายเชน',items:[
    {key:'order',label:'คำสั่งซื้อ'},
    {key:'delivery',label:'การจัดส่ง'},
    {key:'claim',label:'เคลม / ข้อร้องเรียน'}
  ]},
  {key:'report',icon:'📈',label:'ตัวชี้วัด & รายงาน',items:[
    {key:'kpi',label:'ตัวชี้วัด'},
    {key:'forecast',label:'พยากรณ์'}
  ]},
  {key:'ai',icon:'🤖',label:'วิเคราะห์ AI',items:[
    {key:'ai-analytics',label:'วิเคราะห์ AI ⭐'}
  ]},
  {key:'dataupdate',icon:'🔄',label:'อัพเดทข้อมูล',items:[
    {key:'data-update',label:'อัพเดทข้อมูล'}
  ]}
];

// ── Page placeholder definitions ──
var MT_BI_PAGES = {
  'sales-perf':{
    icon:'💰',title:'ผลงานยอดขาย',subtitle:'วิเคราะห์ยอดขาย',
    kpis:[{label:'ยอดขายรวม',icon:'💰',color:'blue'},{label:'จำนวนออเดอร์',icon:'📋',color:'cyan'},{label:'เติบโต MoM',icon:'📈',color:'green'},{label:'มูลค่าออเดอร์เฉลี่ย',icon:'🎯',color:'yellow'}],
    sections:[
      {title:'📊 เมนูย่อย',type:'tabs',items:['Sales Summary','Sales by Customer','Sales by Branch','Sales by Province','Sales by Region','Sales by SKU','Sales by Category','Sales by Brand','Sales by Salesman','Sales by Distributor']},
      {title:'🔍 Filter',type:'tags',items:['ปี','เดือน','สัปดาห์','วัน','ลูกค้า','จังหวัด','ภาค','เซลล์','สินค้า','Brand']}
    ],
    charts:[{title:'📈 Sales Trend',h:240},{title:'📊 Sales by Category',h:240}],
    table:{title:'📋 Sales Data',cols:['#','Customer','Province','Revenue','Qty','GP%']}
  },
  'sales-target':{
    icon:'🎯',title:'เป้าหมายยอดขาย',subtitle:'เป้าหมายยอดขาย',
    kpis:[{label:'เป้าหมายปี',icon:'🎯',color:'blue'},{label:'ยอดจริงสะสม',icon:'💰',color:'cyan'},{label:'% สำเร็จ',icon:'📊',color:'green'},{label:'ส่วนต่าง',icon:'⚡',color:'red'}],
    sections:[
      {title:'📊 มุมมอง',type:'tabs',items:['รายปี','รายเดือน','รายสัปดาห์','รายวัน']},
      {title:'📈 เปรียบเทียบ',type:'tags',items:['Target vs Actual','Achievement %','Trend']}
    ],
    charts:[{title:'📊 Target vs Actual',h:260},{title:'📈 Achievement Trend',h:260}],
    table:{title:'📋 Target Breakdown',cols:['เดือน','Target','Actual','Achieve%','Gap']}
  },
  'customer-mgmt':{
    icon:'👥',title:'จัดการลูกค้า',subtitle:'ข้อมูลลูกค้าห้างค้าปลีก',
    kpis:[{label:'จำนวนลูกค้า',icon:'👥',color:'blue'},{label:'สาขาทั้งหมด',icon:'🏢',color:'cyan'},{label:'ลูกค้าที่ใช้งาน',icon:'✅',color:'green'},{label:'ลูกค้าใหม่',icon:'🆕',color:'yellow'}],
    sections:[
      {title:'📋 ข้อมูลที่จัดเก็บ',type:'tags',items:['รายชื่อลูกค้า','สำนักงานใหญ่','รายชื่อสาขา','ช่องทางติดต่อ','Buyer','Merchandiser','เงื่อนไขการค้า','เครดิต','วันสั่งสินค้า','วันส่งสินค้า','สัญญา']}
    ],
    charts:[{title:'📊 Customer Revenue Share',h:240},{title:'📈 Customer Growth',h:240}],
    table:{title:'📋 Customer List',cols:['#','ชื่อลูกค้า','สาขา','Buyer','เครดิต','สัญญา']}
  },
  'branch-mgmt':{
    icon:'🏢',title:'จัดการสาขา',subtitle:'ข้อมูลสาขา',
    kpis:[{label:'จำนวนสาขา',icon:'🏢',color:'blue'},{label:'ยอดขายเฉลี่ย/สาขา',icon:'💰',color:'cyan'},{label:'สาขาเปิดใหม่',icon:'🆕',color:'green'},{label:'สาขาปิด',icon:'🔴',color:'red'}],
    sections:[
      {title:'📋 ข้อมูลสาขา',type:'tags',items:['จำนวนสาขา','ยอดขายแต่ละสาขา','Ranking','เปิด/ปิดสาขา','จังหวัด','Location']},
      {title:'🗺️ แผนที่',type:'tags',items:['แสดงตำแหน่งสาขาบนแผนที่']}
    ],
    charts:[{title:'📊 Branch Ranking',h:260},{title:'🗺️ Map View',h:260}],
    table:{title:'📋 Branch List',cols:['#','สาขา','จังหวัด','ยอดขาย','Rank','สถานะ']}
  },
  'visit-report':{
    icon:'📍',title:'รายงานเข้าเยี่ยม',subtitle:'การเข้าพบลูกค้า',
    kpis:[{label:'เยี่ยมวันนี้',icon:'📍',color:'blue'},{label:'เยี่ยมเดือนนี้',icon:'📊',color:'cyan'},{label:'เฉลี่ยเยี่ยม/วัน',icon:'📈',color:'green'},{label:'งานค้างติดตาม',icon:'⚠️',color:'yellow'}],
    sections:[
      {title:'📋 ข้อมูล Visit',type:'tags',items:['Check In','Check Out','GPS','รูปภาพ','รายงานการเยี่ยม','งานที่ต้องติดตาม']}
    ],
    charts:[{title:'📊 Visit Summary',h:240},{title:'📈 Visit Trend',h:240}],
    table:{title:'📋 Visit Log',cols:['วันที่','Sales','ลูกค้า','Check In','Check Out','สถานะ']}
  },
  'product-perf':{
    icon:'🍞',title:'ผลงานสินค้า',subtitle:'วิเคราะห์สินค้า',
    kpis:[{label:'จำนวน SKU',icon:'📦',color:'blue'},{label:'สินค้าใหม่',icon:'🆕',color:'cyan'},{label:'ขายดี',icon:'🚀',color:'green'},{label:'ขายช้า',icon:'🐌',color:'red'}],
    sections:[
      {title:'📊 วิเคราะห์',type:'tabs',items:['Top SKU','Bottom SKU','New Product','Slow Moving','Fast Moving','Out of Stock','Share by Category']},
      {title:'🤖 AI วิเคราะห์',type:'tags',items:['ควรเพิ่มสินค้าอะไร','ควรถอดสินค้าอะไร']}
    ],
    charts:[{title:'📊 Product Ranking',h:260},{title:'📈 Category Share',h:260}],
    table:{title:'📋 Product List',cols:['#','SKU','ชื่อสินค้า','Category','Revenue','Qty','Rank']}
  },
  'price-monitor':{
    icon:'💲',title:'ติดตามราคา',subtitle:'ตรวจสอบราคา',
    kpis:[{label:'จำนวน SKU',icon:'📦',color:'blue'},{label:'ราคาเปลี่ยน',icon:'📊',color:'cyan'},{label:'ต่ำกว่าตลาด',icon:'📉',color:'green'},{label:'สูงกว่าตลาด',icon:'📈',color:'yellow'}],
    sections:[
      {title:'📋 ข้อมูลราคา',type:'tags',items:['ราคาปัจจุบัน','ราคาคู่แข่ง','Promotion Price','Price History']}
    ],
    charts:[{title:'📊 Price Comparison',h:240},{title:'📈 Price History',h:240}],
    table:{title:'📋 Price List',cols:['SKU','สินค้า','ราคาเรา','ราคาคู่แข่ง','ส่วนต่าง','Promo']}
  },
  'competitor':{
    icon:'⚔️',title:'คู่แข่ง',subtitle:'ข้อมูลคู่แข่ง',
    kpis:[{label:'จำนวนคู่แข่ง',icon:'⚔️',color:'blue'},{label:'Market Share',icon:'📊',color:'cyan'},{label:'New Product คู่แข่ง',icon:'🆕',color:'yellow'},{label:'Promo คู่แข่ง',icon:'🏷️',color:'red'}],
    sections:[
      {title:'📋 ข้อมูลที่ติดตาม',type:'tags',items:['ราคา','Promotion','New Product','Market Share','Shelf Display']},
      {title:'📸 รูปหน้าร้าน',type:'tags',items:['อัปโหลดรูปจากหน้าร้าน']}
    ],
    charts:[{title:'📊 Market Share',h:260},{title:'📈 Competitor Activity',h:260}],
    table:{title:'📋 Competitor List',cols:['คู่แข่ง','สินค้า','ราคา','Promo','Shelf%']}
  },
  'promotion':{
    icon:'🏷️',title:'โปรโมชั่น',subtitle:'ข้อมูลโปรโมชั่น',
    kpis:[{label:'โปรโมชั่นใช้งาน',icon:'🏷️',color:'blue'},{label:'งบโปรโมชั่น',icon:'💰',color:'cyan'},{label:'ผลตอบแทน',icon:'📈',color:'green'},{label:'ยอดเพิ่ม',icon:'🚀',color:'yellow'}],
    sections:[
      {title:'📋 โปรโมชั่น',type:'tabs',items:['Promotion ปัจจุบัน','กำลังจะเริ่ม','จบแล้ว','Promotion Calendar']},
      {title:'📊 วิเคราะห์',type:'tags',items:['งบโปรโมชั่น','ROI','Lift Sales']}
    ],
    charts:[{title:'📅 Promotion Calendar',h:260},{title:'📈 Promotion ROI',h:260}],
    table:{title:'📋 Promotion List',cols:['#','ชื่อ Promo','ช่วงเวลา','งบ','ROI','Lift%','สถานะ']}
  },
  'trade-mkt':{
    icon:'🎪',title:'การตลาดค้าปลีก',subtitle:'กิจกรรมการตลาด ณ จุดขาย',
    kpis:[{label:'Display',icon:'🖼️',color:'blue'},{label:'Shelf Share',icon:'📊',color:'cyan'},{label:'Sampling',icon:'🍞',color:'green'},{label:'Event',icon:'🎪',color:'yellow'}],
    sections:[
      {title:'📋 กิจกรรม',type:'tags',items:['Display','Shelf Share','POP','Sampling','Promotion','Event']}
    ],
    charts:[{title:'📊 Shelf Share',h:240},{title:'📅 Event Calendar',h:240}],
    table:{title:'📋 Trade Marketing Activities',cols:['วันที่','ประเภท','สาขา','รายละเอียด','งบ','ผล']}
  },
  'inventory':{
    icon:'📦',title:'คลังสินค้า',subtitle:'ข้อมูลสต๊อก',
    kpis:[{label:'Stock โรงงาน',icon:'🏭',color:'blue'},{label:'Stock DC',icon:'📦',color:'cyan'},{label:'Stock ลูกค้า',icon:'🏪',color:'green'},{label:'Days of Inventory',icon:'📊',color:'yellow'}],
    sections:[
      {title:'📋 ข้อมูล Stock',type:'tags',items:['Stock โรงงาน','Stock DC','Stock ลูกค้า','Days of Inventory','Safety Stock']}
    ],
    charts:[{title:'📊 Inventory Level',h:240},{title:'📈 DOI Trend',h:240}],
    table:{title:'📋 Inventory List',cols:['SKU','สินค้า','โรงงาน','DC','ลูกค้า','DOI','Safety']}
  },
  'order':{
    icon:'📋',title:'คำสั่งซื้อ',subtitle:'ข้อมูลออเดอร์',
    kpis:[{label:'ออเดอร์วันนี้',icon:'📋',color:'blue'},{label:'รอดำเนินการ',icon:'⏳',color:'yellow'},{label:'เสร็จสิ้น',icon:'✅',color:'green'},{label:'ยกเลิก',icon:'❌',color:'red'}],
    sections:[
      {title:'📊 สถานะ',type:'tabs',items:['Order Today','Pending','Approved','Shipping','Complete','Cancel']}
    ],
    charts:[{title:'📊 Order Status',h:240},{title:'📈 Order Trend',h:240}],
    table:{title:'📋 Order List',cols:['#','Order ID','วันที่','ลูกค้า','จำนวน','มูลค่า','สถานะ']}
  },
  'delivery':{
    icon:'🚚',title:'การจัดส่ง',subtitle:'การจัดส่ง',
    kpis:[{label:'จัดส่งวันนี้',icon:'🚚',color:'blue'},{label:'ตรงเวลา',icon:'✅',color:'green'},{label:'ล่าช้า',icon:'⏰',color:'red'},{label:'% ตรงเวลา',icon:'📊',color:'cyan'}],
    sections:[
      {title:'📋 ข้อมูลจัดส่ง',type:'tags',items:['ตารางส่งสินค้า','Tracking','On Time','Delay']}
    ],
    charts:[{title:'📊 Delivery Status',h:240},{title:'📈 On-Time Rate',h:240}],
    table:{title:'📋 Delivery Schedule',cols:['วันที่','Order ID','ลูกค้า','สาขา','สถานะ','Tracking']}
  },
  'claim':{
    icon:'⚠️',title:'เคลม / ข้อร้องเรียน',subtitle:'ข้อร้องเรียน',
    kpis:[{label:'เคสทั้งหมด',icon:'📋',color:'blue'},{label:'เปิดเคส',icon:'🔴',color:'red'},{label:'กำลังดำเนินการ',icon:'⏳',color:'yellow'},{label:'ปิดเคส',icon:'✅',color:'green'}],
    sections:[
      {title:'📋 ประเภทปัญหา',type:'tags',items:['สินค้ามีปัญหา','สิ่งปนเปื้อน','ขึ้นรา','Packaging','คืนสินค้า']},
      {title:'📊 Dashboard',type:'tags',items:['เปิดเคส','กำลังดำเนินการ','ปิดเคส']}
    ],
    charts:[{title:'📊 Case by Type',h:240},{title:'📈 Case Trend',h:240}],
    table:{title:'📋 Case List',cols:['#','Case ID','วันที่','ลูกค้า','สินค้า','ประเภท','สถานะ']}
  },
  'kpi':{
    icon:'📈',title:'ตัวชี้วัด',subtitle:'วัดผลทีมขาย',
    kpis:[{label:'จำนวนเซลล์',icon:'👤',color:'blue'},{label:'ผลสำเร็จเฉลี่ย',icon:'📊',color:'cyan'},{label:'ผลงานดีสุด',icon:'🏆',color:'green'},{label:'ต่ำกว่าเป้า',icon:'⚠️',color:'red'}],
    sections:[
      {title:'📊 ตัวชี้วัด',type:'tags',items:['ยอดขาย','Target','GP','Visit','New SKU','New Branch','New Customer','Ranking']}
    ],
    charts:[{title:'📊 KPI Dashboard',h:260},{title:'📈 Sales Ranking',h:260}],
    table:{title:'📋 Sales KPI',cols:['Sales','ยอดขาย','Target','Achieve%','GP','Visit','Rank']}
  },
  'forecast':{
    icon:'🔮',title:'พยากรณ์',subtitle:'คาดการณ์ยอดขาย',
    kpis:[{label:'Forecast เดือนหน้า',icon:'📊',color:'blue'},{label:'Forecast ไตรมาส',icon:'📈',color:'cyan'},{label:'Confidence',icon:'🎯',color:'green'},{label:'Stock แนะนำ',icon:'📦',color:'yellow'}],
    sections:[
      {title:'🤖 AI Forecast',type:'tabs',items:['เดือนหน้า','ไตรมาสหน้า','ปีหน้า']},
      {title:'💡 คำแนะนำ',type:'tags',items:['ควรผลิตเท่าไร','Stock ที่เหมาะสม']}
    ],
    charts:[{title:'📈 Forecast Trend',h:260},{title:'📊 Production Plan',h:260}],
    table:{title:'📋 Forecast Data',cols:['เดือน','Forecast','Actual','Accuracy','Stock แนะนำ']}
  },
  'doc-center':{
    icon:'📁',title:'ศูนย์เอกสาร',subtitle:'เอกสารทั้งหมด',
    kpis:[{label:'เอกสารทั้งหมด',icon:'📁',color:'blue'},{label:'อัปเดตล่าสุด',icon:'📅',color:'cyan'},{label:'ใกล้หมดอายุ',icon:'⚠️',color:'yellow'},{label:'หมดอายุ',icon:'🔴',color:'red'}],
    sections:[
      {title:'📁 ประเภทเอกสาร',type:'tabs',items:['Price List','Agreement','Promotion','Presentation','Product Catalog','รูปสินค้า']}
    ],
    charts:null,
    table:{title:'📋 Document List',cols:['#','ชื่อเอกสาร','ประเภท','วันที่อัปเดต','หมดอายุ','ดาวน์โหลด']}
  },
  'report-center':{
    icon:'📄',title:'ศูนย์รายงาน',subtitle:'รายงาน',
    kpis:[{label:'รายงานทั้งหมด',icon:'📄',color:'blue'},{label:'ส่งอัตโนมัติ',icon:'📧',color:'cyan'},{label:'รายงานวันนี้',icon:'📊',color:'green'},{label:'รอส่ง',icon:'⏳',color:'yellow'}],
    sections:[
      {title:'📤 Export',type:'tabs',items:['Excel','PDF','PowerPoint','รูปภาพ']},
      {title:'⏰ ตั้งเวลาส่ง',type:'tags',items:['Email','LINE','รายวัน','รายสัปดาห์','รายเดือน']}
    ],
    charts:null,
    table:{title:'📋 Report Schedule',cols:['#','ชื่อรายงาน','Format','ช่องทาง','ความถี่','เวลา','สถานะ']}
  },
  'ai-analytics':{
    icon:'🤖',title:'วิเคราะห์ AI ⭐',subtitle:'AI วิเคราะห์อัตโนมัติ',
    kpis:[{label:'ข้อมูลเชิงลึกวันนี้',icon:'💡',color:'blue'},{label:'แจ้งเตือนสำคัญ',icon:'🚨',color:'red'},{label:'โอกาส',icon:'🎯',color:'green'},{label:'ความแม่นยำพยากรณ์',icon:'📊',color:'cyan'}],
    sections:[
      {title:'🤖 AI วิเคราะห์อัตโนมัติ',type:'list',items:[
        'สินค้าไหนยอดตก','ลูกค้าไหนกำลังลดการสั่งซื้อ','ลูกค้าเสี่ยงหยุดซื้อ',
        'สินค้าควรดันเพิ่ม','จังหวัดไหนโตที่สุด','จังหวัดไหนยอดตก',
        'คู่แข่งมีผลกระทบหรือไม่','ควรจัดโปรโมชั่นอะไร','ควรผลิตสินค้าเพิ่มหรือไม่',
        'ควรลดสต๊อกหรือไม่','คาดการณ์ยอดขายเดือนหน้า','วิเคราะห์สาเหตุที่ยอดไม่ถึงเป้าหมาย'
      ]}
    ],
    charts:[{title:'📊 AI Insights Dashboard',h:300},{title:'📈 Prediction Model',h:300}],
    table:null
  }
};

// ── Helpers ──
function _mtBiLighten(hex){
  var r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  r=Math.min(255,r+50); g=Math.min(255,g+50); b=Math.min(255,b+50);
  return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}

// ── Sidebar rendering ──
function mtBiRenderSidebar(){
  var el=document.getElementById('mtBiSidebar');
  if(!el) return;
  var _mt=typeof _t==='function'?_t:function(k){return k;};
  var html='<div style="padding:10px 16px 14px;font-size:11px;font-weight:800;color:var(--muted);letter-spacing:1px;text-transform:uppercase">'+_mt('mtbi.nav')+'</div>';

  MT_BI_CATS.forEach(function(cat){
    var catLabel=_mt('mtbi.'+cat.key);
    var hasActive=cat.items.some(function(it){return it.key===_mtBiCurrent;});
    var isOpen=_mtBiCatOpen[cat.key]!==undefined ? _mtBiCatOpen[cat.key] : hasActive || cat.key==='dashboard';

    if(cat.items.length===1){
      var item=cat.items[0];
      var active=item.key===_mtBiCurrent;
      html+='<div class="mtbi-nav-item'+(active?' active':'')+'" onclick="mtBiSelectMenu(\''+item.key+'\')">';
      html+='<span class="mtbi-nav-icon">'+cat.icon+'</span><span>'+catLabel+'</span></div>';
    } else {
      html+='<div class="mtbi-nav-cat'+(hasActive?' has-active':'')+'">';
      html+='<div class="mtbi-nav-cat-header" onclick="mtBiToggleCat(\''+cat.key+'\')">';
      html+='<span class="mtbi-nav-icon">'+cat.icon+'</span><span>'+catLabel+'</span>';
      html+='<span class="mtbi-nav-arrow">'+(isOpen?'▾':'▸')+'</span></div>';
      if(isOpen){
        html+='<div class="mtbi-nav-sub">';
        cat.items.forEach(function(item){
          var active=item.key===_mtBiCurrent;
          html+='<div class="mtbi-nav-sub-item'+(active?' active':'')+'" onclick="mtBiSelectMenu(\''+item.key+'\')">';
          html+=_mt('mtbi.'+item.key)+'</div>';
        });
        html+='</div>';
      }
      html+='</div>';
    }
  });

  el.innerHTML=html;
}

// ── Category toggle ──
function mtBiToggleCat(catKey){
  var isOpen=_mtBiCatOpen[catKey];
  if(isOpen===undefined){
    var cat=MT_BI_CATS.find(function(c){return c.key===catKey;});
    var hasActive=cat && cat.items.some(function(it){return it.key===_mtBiCurrent;});
    isOpen=hasActive;
  }
  _mtBiCatOpen[catKey]=!isOpen;
  mtBiRenderSidebar();
}

// ── Menu switching ──
function mtBiSelectMenu(key){
  _mtBiCurrent=key;
  var dashDiv=document.getElementById('mt-bi-dashboard');
  var dynDiv=document.getElementById('mtBiDynamic');
  if(!dashDiv||!dynDiv) return;

  // expand the parent category
  MT_BI_CATS.forEach(function(cat){
    if(cat.items.some(function(it){return it.key===key;})){
      _mtBiCatOpen[cat.key]=true;
    }
  });

  // Move compensate back to dashboard container if it was moved
  var comp=document.getElementById('mt-compensate');
  var dashComp=dashDiv.querySelector('#mt-compensate');
  if(comp&&!dashComp){
    comp.style.display='none';
    dashDiv.appendChild(comp);
  }

  var periodBar=document.getElementById('mtPeriodFilter');
  var hideFilter=(key==='customer-mgmt'||key==='branch-mgmt'||key==='product-perf'||key==='competitor'||key==='promotion'||key==='delivery'||key==='ai-analytics'||key==='data-update');
  if(periodBar) periodBar.style.display=hideFilter?'none':'';

  if(key==='dashboard'){
    dashDiv.style.display='';
    dynDiv.style.display='none';
    renderMTPage();
  } else {
    dashDiv.style.display='none';
    dynDiv.style.display='';
    dynDiv.innerHTML=mtBiRenderPage(key);
  }

  mtBiRenderSidebar();
}

// ── Compute actual sales per channel from MT_DATA ──
function _mtBiChannelActual(chKey){
  var prods=(typeof MT_DATA!=='undefined'&&MT_DATA.ch&&MT_DATA.ch[chKey])?MT_DATA.ch[chKey]:[];
  var months={},total=0;
  prods.forEach(function(p){
    if(!p.m) return;
    Object.keys(p.m).forEach(function(mo){
      if(!months[mo]) months[mo]=0;
      months[mo]+=(p.m[mo].b||0);
      total+=(p.m[mo].b||0);
    });
  });
  return {months:months,total:total};
}

// ── Compute actual sales per channel by CE year from SALES_DATA ──
function _mtBiChannelActualByYear(chKey, ceYear){
  var MONTHS_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var months={},total=0;
  if(typeof SALES_DATA!=='undefined'&&SALES_DATA.ModernTrade&&SALES_DATA.ModernTrade[chKey]){
    var chData=SALES_DATA.ModernTrade[chKey];
    if(chData.years&&chData.years[ceYear]&&chData.years[ceYear].months){
      var ym=chData.years[ceYear].months;
      for(var i=0;i<12;i++){
        var mo=MONTHS_EN[i];
        if(ym[mo]){
          months[mo]=ym[mo].b||0;
          total+=(ym[mo].b||0);
        }
      }
    }
  }
  if(total===0) return _mtBiChannelActual(chKey);
  return {months:months,total:total};
}

// ── Aggregate all MT channels ──
var _MT_ALL_CHANNELS = ['CJ','BigC','Top','Makro','MM','Aeon','TheMall','Lotus','Villa','MK'];

function _mtBiGetSalesAll(yr) {
  if (typeof SALES_DATA === 'undefined' || !SALES_DATA.ModernTrade) return null;
  var mt = SALES_DATA.ModernTrade;
  var MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var months = {};
  for (var i = 0; i < 12; i++) months[MONTHS_EN[i]] = { q: 0, b: 0, cost: 0, profit: 0, lines: 0 };
  var keys = Object.keys(mt);
  for (var ki = 0; ki < keys.length; ki++) {
    var chData = mt[keys[ki]];
    if (!chData || !chData.years || !chData.years[yr]) continue;
    var ym = chData.years[yr].months;
    if (!ym) continue;
    for (var mi = 0; mi < 12; mi++) {
      var mk = MONTHS_EN[mi];
      if (ym[mk]) {
        months[mk].q += (ym[mk].q || 0);
        months[mk].b += (ym[mk].b || 0);
        months[mk].cost += (ym[mk].cost || 0);
        months[mk].profit += (ym[mk].profit || 0);
        months[mk].lines += (ym[mk].lines || 0);
      }
    }
  }
  return { years: {} , _agg: true, months: months };
}

function _mtBiGetOrderAll(yr) {
  if (typeof ORDER_SUMMARY === 'undefined' || !ORDER_SUMMARY.ModernTrade) return null;
  var mt = ORDER_SUMMARY.ModernTrade;
  var MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var result = {};
  var keys = Object.keys(mt);
  for (var ki = 0; ki < keys.length; ki++) {
    var chYr = mt[keys[ki]][yr];
    if (!chYr) continue;
    for (var mi = 0; mi < 12; mi++) {
      var mk = MONTHS_EN[mi];
      if (chYr[mk]) {
        if (!result[mk]) result[mk] = { orders: 0, qty: 0, net: 0, items: 0 };
        result[mk].orders += (chYr[mk].orders || 0);
        result[mk].qty += (chYr[mk].qty || 0);
        result[mk].net += (chYr[mk].net || 0);
        result[mk].items += (chYr[mk].items || 0);
      }
    }
  }
  return result;
}

// ── Aggregate actual across ALL MT channels by year ──
function _mtBiAllChannelsActualByYear(ceYear){
  var MONTHS_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var months={},total=0;
  var chKeys=typeof MT_DATA!=='undefined'&&MT_DATA.ch?Object.keys(MT_DATA.ch):['CJ','BigC','Top','Makro','MM','Aeon','TheMall'];
  for(var ci=0;ci<chKeys.length;ci++){
    var r=_mtBiChannelActualByYear(chKeys[ci],ceYear);
    for(var i=0;i<12;i++){
      var mo=MONTHS_EN[i];
      if(!months[mo]) months[mo]=0;
      months[mo]+=(r.months[mo]||0);
      total+=(r.months[mo]||0);
    }
  }
  return {months:months,total:total};
}

// ── Render REAL Sales Target page ──
function _mtBiRenderSalesTarget(){
  var chKey=_mtCh;
  var isAll=(!chKey||chKey==='All');
  if(!chKey) chKey='All';
  var tgtYear=_mtPeriod.year||2026;
  var TGT=getTargetByYear(tgtYear);
  var target;
  if(isAll){
    target=(TGT&&TGT.mtTotal)?TGT.mtTotal:null;
  } else {
    target=(TGT&&TGT.mt)?TGT.mt[chKey]:null;
  }
  if(!target){ chKey='CJ'; isAll=false; target=(TGT&&TGT.mt)?TGT.mt[chKey]:null; }
  if(!target) return '';

  var actual=isAll?_mtBiAllChannelsActualByYear(tgtYear):_mtBiChannelActualByYear(chKey, tgtYear);
  var ch=isAll?'ทุกช่องทาง MT':((typeof MT_CH_LABELS!=='undefined'&&MT_CH_LABELS[chKey])?MT_CH_LABELS[chKey]:(chKey||'CJ'));
  var color=(typeof MT_CH_COLORS!=='undefined'&&MT_CH_COLORS[chKey])?MT_CH_COLORS[chKey]:'#ea580c';
  var MONTHS_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var MONTHS_TH=TGT.MONTHS_TH;

  var dataMonths=12;
  for(var dm=11;dm>=0;dm--){if(actual.months[MONTHS_EN[dm]]>0){dataMonths=dm+1;break;}}
  if(dataMonths===12&&actual.total===0) dataMonths=typeof MONTHS!=='undefined'?MONTHS.length:6;

  // Determine which months to show based on period filter
  var filterIdx=[];
  var periodLabel='';
  if(_mtPeriod.months&&_mtPeriod.months.length>0){
    filterIdx=_mtPeriod.months.map(function(m){return m-1;});
    periodLabel=_mtPeriod.label;
  } else {
    for(var fi=0;fi<dataMonths;fi++) filterIdx.push(fi);
    periodLabel='YTD ('+MONTHS_TH[0]+' – '+MONTHS_TH[dataMonths-1]+')';
  }

  var targetFiltered=0,actualFiltered=0;
  for(var fi=0;fi<filterIdx.length;fi++){
    var mi=filterIdx[fi];
    targetFiltered+=target.monthly[mi]||0;
    actualFiltered+=(actual.months[MONTHS_EN[mi]]||0);
  }
  var achievePct=targetFiltered>0?(actualFiltered/targetFiltered*100):0;
  var gap=actualFiltered-targetFiltered;
  var achColor=achievePct>=80?'#16a34a':achievePct>=60?'#d97706':'#dc2626';

  var html='';

  // Header
  html+='<div class="card" style="background:linear-gradient(135deg,'+color+','+_mtBiLighten(color)+');color:#fff;padding:24px 28px;margin-bottom:18px;border-radius:14px">';
  html+='<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
  html+='<div><div style="font-size:20px;font-weight:800">🎯 Sales Target</div>';
  html+='<div style="font-size:13px;opacity:.85;margin-top:4px">'+ch+' — เป้าหมายยอดขาย '+tgtYear+' ('+periodLabel+')</div></div>';
  html+='<div style="background:rgba(255,255,255,.2);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700">'+ch+'</div>';
  html+='</div></div>';

  // KPIs
  html+='<div class="kpi-grid" style="margin-bottom:18px">';
  html+='<div class="kpi-card blue"><div class="kpi-label">🎯 Target ('+periodLabel+')</div><div class="kpi-value">'+fmtTargetM(targetFiltered)+'</div><div class="kpi-sub">Full Year: '+fmtTargetM(target.total)+'</div></div>';
  html+='<div class="kpi-card cyan"><div class="kpi-label">💰 Actual ('+periodLabel+')</div><div class="kpi-value">'+fmtTargetM(actualFiltered)+'</div><div class="kpi-sub">'+periodLabel+'</div></div>';
  html+='<div class="kpi-card '+(achievePct>=80?'green':achievePct>=60?'yellow':'red')+'"><div class="kpi-label">📊 % Achievement</div><div class="kpi-value">'+achievePct.toFixed(1)+'%</div><div class="kpi-sub">เทียบ Target '+periodLabel+'</div></div>';
  html+='<div class="kpi-card '+(gap>=0?'green':'red')+'"><div class="kpi-label">⚡ Gap</div><div class="kpi-value">'+(gap>=0?'+':'')+fmtTargetM(gap)+'</div><div class="kpi-sub">'+(gap>=0?'เกินเป้า':'ต่ำกว่าเป้า')+'</div></div>';
  html+='</div>';

  // Charts row: Bar chart + Donut chart
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">';
  html+='<div class="card"><div class="card-title">📊 Target vs Actual รายเดือน (ล้านบาท)</div>';
  html+='<div style="position:relative;height:300px"><canvas id="stBarChart"></canvas></div></div>';
  html+='<div class="card"><div class="card-title">🎯 สัดส่วนยอดขายจริง vs เป้าหมาย</div>';
  html+='<div style="position:relative;height:300px"><canvas id="stDonutChart"></canvas></div></div>';
  html+='</div>';

  // Monthly Target vs Actual Table
  html+='<div class="card" style="margin-bottom:16px">';
  html+='<div class="card-title">📋 Target vs Actual รายเดือน — '+ch+'</div>';
  html+='<div class="table-wrap"><table><thead><tr>';
  html+='<th>เดือน</th><th style="text-align:right">Target</th><th style="text-align:right">Actual</th><th style="text-align:right">Gap</th><th style="text-align:right">%Achieve</th><th>Progress</th>';
  html+='</tr></thead><tbody>';

  var cumTarget=0,cumActual=0;
  for(var mi=0;mi<12;mi++){
    var tVal=target.monthly[mi];
    var aVal=actual.months[MONTHS_EN[mi]]||0;
    var hasData=mi<dataMonths&&aVal>0;
    var mGap=aVal-tVal;
    var mAch=tVal>0?(aVal/tVal*100):0;
    if(mi<dataMonths) cumTarget+=tVal;
    if(hasData) cumActual+=aVal;

    var inFilter=filterIdx.indexOf(mi)!==-1;
    var rowStyle=mi>=dataMonths?'opacity:.35':(!inFilter?'opacity:.4;background:#f8f8f8':'');
    html+='<tr style="'+rowStyle+'">';
    html+='<td><strong>'+MONTHS_TH[mi]+'</strong></td>';
    html+='<td style="text-align:right">'+Math.round(tVal).toLocaleString('th-TH')+'</td>';
    if(hasData){
      html+='<td style="text-align:right">'+Math.round(aVal).toLocaleString('th-TH')+'</td>';
      html+='<td style="text-align:right;color:'+(mGap>=0?'#16a34a':'#dc2626')+'">'+(mGap>=0?'+':'')+Math.round(mGap).toLocaleString('th-TH')+'</td>';
      html+='<td style="text-align:right"><span class="pill '+(mAch>=80?'green':mAch>=60?'yellow':'red')+'">'+mAch.toFixed(1)+'%</span></td>';
      var pw=Math.min(Math.max(mAch,0),100),pcls=mAch>=80?'high':mAch>=60?'mid':'low';
      html+='<td><div class="prog-wrap"><div class="prog" style="width:80px"><div class="prog-fill '+pcls+'" style="width:'+pw+'%"></div></div><span class="prog-label">'+mAch.toFixed(1)+'%</span></div></td>';
    } else {
      html+='<td style="text-align:right;color:#94a3b8">—</td>';
      html+='<td style="text-align:right;color:#94a3b8">—</td>';
      html+='<td style="text-align:right;color:#94a3b8">—</td>';
      html+='<td style="color:#94a3b8;font-size:11px">ยังไม่มีข้อมูล</td>';
    }
    html+='</tr>';
  }

  // Total row
  var totAch=cumTarget>0?(cumActual/cumTarget*100):0;
  var totGap=cumActual-cumTarget;
  html+='<tr class="tr-total">';
  html+='<td>รวม YTD</td>';
  html+='<td style="text-align:right">'+Math.round(cumTarget).toLocaleString('th-TH')+'</td>';
  html+='<td style="text-align:right">'+Math.round(cumActual).toLocaleString('th-TH')+'</td>';
  html+='<td style="text-align:right;color:'+(totGap>=0?'#16a34a':'#dc2626')+'">'+(totGap>=0?'+':'')+Math.round(totGap).toLocaleString('th-TH')+'</td>';
  html+='<td style="text-align:right"><span class="pill '+(totAch>=80?'green':totAch>=60?'yellow':'red')+'">'+totAch.toFixed(1)+'%</span></td>';
  var tw=Math.min(Math.max(totAch,0),100),tcls=totAch>=80?'high':totAch>=60?'mid':'low';
  html+='<td><div class="prog-wrap"><div class="prog" style="width:80px"><div class="prog-fill '+tcls+'" style="width:'+tw+'%"></div></div><span class="prog-label">'+totAch.toFixed(1)+'%</span></div></td>';
  html+='</tr>';
  html+='</tbody></table></div></div>';

  // Source note
  html+='<div style="text-align:center;padding:12px;color:var(--muted);font-size:11px">';
  html+='📄 ข้อมูล Target จาก Target '+tgtYear+'.xlsx | '+periodLabel+'</div>';

  // Chart init
  var _stMonthsTH=MONTHS_TH.slice();
  var _stTargetArr=target.monthly.slice();
  var _stActualArr=[];
  for(var ai=0;ai<12;ai++) _stActualArr.push(actual.months[MONTHS_EN[ai]]||0);
  var _stColor=color;
  var _stActualYTD=actualFiltered;
  var _stTargetTotal=targetFiltered;

  setTimeout(function(){
    // Bar chart: Target vs Actual per month
    var barCtx=document.getElementById('stBarChart');
    if(barCtx){
      new Chart(barCtx.getContext('2d'),{
        type:'bar',
        data:{
          labels:_stMonthsTH,
          datasets:[
            {label:'Target',data:_stTargetArr.map(function(v){return v/1e6;}),backgroundColor:'rgba(99,102,241,0.25)',borderColor:'#6366f1',borderWidth:2,borderRadius:4,barPercentage:0.7},
            {label:'Actual',data:_stActualArr.map(function(v){return v/1e6;}),backgroundColor:_stColor,borderColor:_stColor,borderWidth:0,borderRadius:4,barPercentage:0.7}
          ]
        },
        options:{
          responsive:true,maintainAspectRatio:false,
          plugins:{legend:{position:'top',labels:{font:{size:11},usePointStyle:true,pointStyle:'rect'}},
            tooltip:{callbacks:{label:function(ctx){return ctx.dataset.label+': '+ctx.parsed.y.toFixed(2)+' M';}}}},
          scales:{
            x:{grid:{display:false}},
            y:{beginAtZero:true,ticks:{callback:function(v){return v.toFixed(1)+' M';}},grid:{color:'rgba(0,0,0,0.05)'}}
          }
        }
      });
    }

    // Donut chart: Actual vs Remaining
    var donutCtx=document.getElementById('stDonutChart');
    if(donutCtx){
      var remaining=Math.max(0,_stTargetTotal-_stActualYTD);
      var pct=_stTargetTotal>0?(_stActualYTD/_stTargetTotal*100):0;
      new Chart(donutCtx.getContext('2d'),{
        type:'doughnut',
        data:{
          labels:['ยอดขายจริง (Actual)','เป้าหมายที่เหลือ'],
          datasets:[{
            data:[_stActualYTD/1e6,remaining/1e6],
            backgroundColor:[_stColor,'#e2e8f0'],
            borderWidth:0,
            hoverOffset:8
          }]
        },
        options:{
          responsive:true,maintainAspectRatio:false,cutout:'65%',
          plugins:{
            legend:{position:'bottom',labels:{font:{size:11},usePointStyle:true,pointStyle:'circle',padding:16}},
            tooltip:{callbacks:{label:function(ctx){return ctx.label+': '+ctx.parsed.toFixed(2)+' M';}}},
            // Center text via plugin
          }
        },
        plugins:[{
          id:'centerText',
          afterDraw:function(chart){
            var w=chart.width,h=chart.height,ctx2=chart.ctx;
            ctx2.save();
            ctx2.textAlign='center';ctx2.textBaseline='middle';
            var cx=w/2,cy=(h-30)/2;
            ctx2.font='bold 28px sans-serif';ctx2.fillStyle=pct>=80?'#16a34a':pct>=60?'#d97706':'#dc2626';
            ctx2.fillText(pct.toFixed(1)+'%',cx,cy);
            ctx2.font='12px sans-serif';ctx2.fillStyle='#94a3b8';
            ctx2.fillText('Achievement',cx,cy+22);
            ctx2.restore();
          }
        }]
      });
    }
  },120);

  return html;
}

// ── Render REAL KPI page ──
function _mtBiRenderKPI(){
  var chKey=_mtCh;
  var isAll=(!chKey||chKey==='All');
  if(!chKey) chKey='All';
  var tgtYear=_mtPeriod.year||2026;
  var TGT=getTargetByYear(tgtYear);
  var target;
  if(isAll){
    target=(TGT&&TGT.mtTotal)?TGT.mtTotal:null;
  } else {
    target=(TGT&&TGT.mt)?TGT.mt[chKey]:null;
  }
  if(!target){ chKey='CJ'; isAll=false; target=(TGT&&TGT.mt)?TGT.mt[chKey]:null; }
  if(!target) return '';

  var actual=isAll?_mtBiAllChannelsActualByYear(tgtYear):_mtBiChannelActualByYear(chKey, tgtYear);
  var ch=isAll?'ทุกช่องทาง MT':((typeof MT_CH_LABELS!=='undefined'&&MT_CH_LABELS[chKey])?MT_CH_LABELS[chKey]:(chKey||'CJ'));
  var color=(typeof MT_CH_COLORS!=='undefined'&&MT_CH_COLORS[chKey])?MT_CH_COLORS[chKey]:'#ea580c';
  var MONTHS_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var MONTHS_TH_S=TGT.MONTHS_TH;
  var dataMonths=12;
  for(var dm=11;dm>=0;dm--){if(actual.months[MONTHS_EN[dm]]>0){dataMonths=dm+1;break;}}
  if(dataMonths===12&&actual.total===0) dataMonths=typeof MONTHS!=='undefined'?MONTHS.length:6;

  // Determine which months to show based on period filter
  var kpiFilterIdx=[];
  var kpiPeriodLabel='';
  if(_mtPeriod.months&&_mtPeriod.months.length>0){
    kpiFilterIdx=_mtPeriod.months.map(function(m){return m-1;});
    kpiPeriodLabel=_mtPeriod.label;
  } else {
    for(var fi=0;fi<dataMonths;fi++) kpiFilterIdx.push(fi);
    kpiPeriodLabel='YTD ('+MONTHS_TH_S[0]+' – '+MONTHS_TH_S[dataMonths-1]+')';
  }

  var targetYTD=0,actualYTD=0;
  for(var fi=0;fi<kpiFilterIdx.length;fi++){
    var idx=kpiFilterIdx[fi];
    targetYTD+=target.monthly[idx]||0;
    actualYTD+=(actual.months[MONTHS_EN[idx]]||0);
  }
  var achievePct=targetYTD>0?(actualYTD/targetYTD*100):0;
  var avgPerMonth=kpiFilterIdx.length>0?actualYTD/kpiFilterIdx.length:0;

  var html='';
  html+='<div class="card" style="background:linear-gradient(135deg,'+color+','+_mtBiLighten(color)+');color:#fff;padding:24px 28px;margin-bottom:18px;border-radius:14px">';
  html+='<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
  html+='<div><div style="font-size:20px;font-weight:800">📈 KPI</div>';
  html+='<div style="font-size:13px;opacity:.85;margin-top:4px">'+ch+' — วัดผลทีมขาย '+tgtYear+' ('+kpiPeriodLabel+')</div></div>';
  html+='<div style="background:rgba(255,255,255,.2);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700">'+ch+'</div>';
  html+='</div></div>';

  html+='<div class="kpi-grid" style="margin-bottom:18px">';
  html+='<div class="kpi-card blue"><div class="kpi-label">🎯 Target ('+kpiPeriodLabel+')</div><div class="kpi-value">'+fmtTargetM(targetYTD)+'</div></div>';
  html+='<div class="kpi-card cyan"><div class="kpi-label">💰 Actual ('+kpiPeriodLabel+')</div><div class="kpi-value">'+fmtTargetM(actualYTD)+'</div></div>';
  html+='<div class="kpi-card '+(achievePct>=80?'green':achievePct>=60?'yellow':'red')+'"><div class="kpi-label">📊 Achievement</div><div class="kpi-value">'+achievePct.toFixed(1)+'%</div></div>';
  html+='<div class="kpi-card yellow"><div class="kpi-label">📈 เฉลี่ย/เดือน</div><div class="kpi-value">'+fmtTargetM(avgPerMonth)+'</div></div>';
  html+='</div>';

  // Monthly achievement table
  html+='<div class="card" style="margin-bottom:16px">';
  html+='<div class="card-title">📊 KPI Achievement รายเดือน — '+ch+' ('+kpiPeriodLabel+')</div>';
  html+='<div class="table-wrap"><table><thead><tr>';
  html+='<th>เดือน</th><th style="text-align:right">Target</th><th style="text-align:right">Actual</th><th style="text-align:right">%Achieve</th><th>Progress</th><th style="text-align:center">สถานะ</th>';
  html+='</tr></thead><tbody>';

  for(var mi=0;mi<dataMonths;mi++){
    var kpiInFilter=kpiFilterIdx.indexOf(mi)!==-1;
    if(!kpiInFilter) continue;
    var tVal=target.monthly[mi];
    var aVal=actual.months[MONTHS_EN[mi]]||0;
    var mAch=tVal>0?(aVal/tVal*100):0;
    var status=mAch>=100?'✅ เกินเป้า':mAch>=80?'🟢 ใกล้เป้า':mAch>=60?'🟡 ต้องเร่ง':'🔴 ต่ำกว่าเป้า';
    html+='<tr>';
    html+='<td><strong>'+MONTHS_TH_S[mi]+'</strong></td>';
    html+='<td style="text-align:right">'+Math.round(tVal).toLocaleString('th-TH')+'</td>';
    html+='<td style="text-align:right">'+Math.round(aVal).toLocaleString('th-TH')+'</td>';
    html+='<td style="text-align:right"><span class="pill '+(mAch>=80?'green':mAch>=60?'yellow':'red')+'">'+mAch.toFixed(1)+'%</span></td>';
    var pw=Math.min(Math.max(mAch,0),100),pcls=mAch>=80?'high':mAch>=60?'mid':'low';
    html+='<td><div class="prog-wrap"><div class="prog" style="width:80px"><div class="prog-fill '+pcls+'" style="width:'+pw+'%"></div></div></div></td>';
    html+='<td style="text-align:center;font-size:12px">'+status+'</td>';
    html+='</tr>';
  }
  html+='</tbody></table></div></div>';

  html+='<div style="text-align:center;padding:12px;color:var(--muted);font-size:11px">';
  html+='📄 ข้อมูลจาก Target 2026.xlsx + ยอดขายจริง</div>';
  return html;
}

// ── Promotion Page (CJ Compensate) ──
function _mtBiRenderPromotion(){
  var ch=_mtCh||'CJ';
  var chLabel=ch==='All'?'ทุกช่องทาง':((typeof MT_CH_LABELS!=='undefined'&&MT_CH_LABELS[ch])?MT_CH_LABELS[ch]:ch);
  var color=ch==='All'?'#4f46e5':((typeof MT_CH_COLORS!=='undefined'&&MT_CH_COLORS[ch])?MT_CH_COLORS[ch]:'#ea580c');

  if(ch==='All'){
    return _mtBiRenderPromoAll();
  }

  if(ch!=='CJ'){
    var html='<div style="margin-bottom:12px"><button onclick="_mtBiGoChannel(\'All\',\'promotion\')" style="background:none;border:1px solid var(--border,#e2e8f0);padding:6px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-family:inherit;color:var(--text,#334155);font-weight:600">← กลับหน้าโปรโมชั่นหลัก</button></div>';
    html+='<div class="card" style="background:linear-gradient(135deg,'+color+','+_mtBiLighten(color)+');color:#fff;padding:24px 28px;margin-bottom:18px;border-radius:14px">';
    html+='<div style="font-size:20px;font-weight:800">🏷️ โปรโมชั่น</div>';
    html+='<div style="font-size:13px;opacity:.85;margin-top:4px">'+chLabel+' — ข้อมูลโปรโมชั่น</div></div>';
    html+='<div class="card" style="padding:60px;text-align:center;color:var(--muted)">';
    html+='<div style="font-size:48px;margin-bottom:12px">🏷️</div>';
    html+='<div style="font-size:16px;font-weight:700;margin-bottom:8px">โปรโมชั่น '+chLabel+'</div>';
    html+='<div style="font-size:13px">ไม่มีโปรโมชั่นที่เข้าร่วม</div></div>';
    return html;
  }

  // CJ: move compensate div into dynamic area
  setTimeout(function(){
    var comp=document.getElementById('mt-compensate');
    var dynDiv=document.getElementById('mtBiDynamic');
    if(comp&&dynDiv){
      dynDiv.innerHTML='<div style="margin-bottom:12px"><button onclick="_mtBiGoChannel(\'All\',\'promotion\')" style="background:none;border:1px solid var(--border,#e2e8f0);padding:6px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-family:inherit;color:var(--text,#334155);font-weight:600">← กลับหน้าโปรโมชั่นหลัก</button></div>';
      comp.style.display='block';
      dynDiv.appendChild(comp);
      _cjCompState.rendered=false;
      renderCjCompensate();
    }
  },50);
  return '';
}

function _mtBiRenderPromoAll(){
  var hasCJ=typeof CJ_COMP!=='undefined';
  var comp=hasCJ?CJ_COMP:null;
  var html='';

  // Header
  html+='<div class="card" style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:24px 28px;margin-bottom:18px;border-radius:14px">';
  html+='<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
  html+='<div><div style="font-size:20px;font-weight:800">🏷️ โปรโมชั่น — ทุกช่องทาง</div>';
  html+='<div style="font-size:13px;opacity:.85;margin-top:4px">สรุปโปรโมชั่นและค่าชดเชยจากทุกช่องทางค้าปลีก</div></div>';
  html+='<div style="background:rgba(255,255,255,.2);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700">ทุกช่องทาง</div>';
  html+='</div></div>';

  // KPIs from CJ data
  var totalPromo=0,totalSales=0,promoCount=0;
  if(comp){
    totalPromo=comp.grandTotal.thb.total;
    totalSales=comp.grandTotal.thb.salesTHB;
    promoCount=comp.promos.length;
  }
  html+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:18px">';
  var kpis=[
    {icon:'🏷️',label:'โปรโมชั่นทั้งหมด',value:promoCount+' รายการ',color:'#3b82f6'},
    {icon:'💰',label:'ค่าชดเชยรวม (CJ)',value:(totalPromo/1e6).toFixed(2)+' M',color:'#ef4444'},
    {icon:'📊',label:'% ต่อยอดขาย',value:comp?(comp.grandTotal.thb.pct).toFixed(2)+'%':'—',color:'#f59e0b'},
    {icon:'🏪',label:'ช่องทางที่เข้าร่วม',value:'1 / 6 ช่องทาง',color:'#10b981'}
  ];
  kpis.forEach(function(k){
    html+='<div class="card" style="padding:18px;border-radius:12px;border-left:4px solid '+k.color+'">';
    html+='<div style="font-size:12px;color:var(--muted)">'+k.icon+' '+k.label+'</div>';
    html+='<div style="font-size:22px;font-weight:800;margin-top:6px;color:'+k.color+'">'+k.value+'</div>';
    html+='</div>';
  });
  html+='</div>';

  // Channel Promo Status
  var chPromos=[
    {key:'CJ',label:'CJ MORE',icon:'🏪',color:'#ea580c',active:true,count:promoCount,cost:totalPromo,pct:comp?comp.grandTotal.thb.pct:0},
    {key:'BigC',label:'Big C',icon:'🛒',color:'#e53e3e',active:false,count:0,cost:0,pct:0},
    {key:'Top',label:'Tops',icon:'🏷',color:'#16a34a',active:false,count:0,cost:0,pct:0},
    {key:'TheMall',label:'The Mall',icon:'🏢',color:'#d97706',active:false,count:0,cost:0,pct:0},
    {key:'Makro',label:'Makro',icon:'📦',color:'#0ea5e9',active:false,count:0,cost:0,pct:0},
    {key:'Aeon',label:'Aeon',icon:'🛍',color:'#e11d48',active:false,count:0,cost:0,pct:0}
  ];

  html+='<div class="card" style="padding:20px;border-radius:12px;margin-bottom:18px">';
  html+='<div style="font-weight:700;margin-bottom:14px">📋 สถานะโปรโมชั่นแต่ละช่องทาง</div>';
  html+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">';
  chPromos.forEach(function(cp){
    var border=cp.active?'2px solid '+cp.color:'1px solid var(--border-color,#e5e7eb)';
    var bg=cp.active?cp.color+'08':'transparent';
    html+='<div style="border:'+border+';border-radius:10px;padding:14px;background:'+bg+';cursor:pointer" onclick="_mtBiGoChannel(\''+cp.key+'\',\'promotion\')">';
    html+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">';
    html+='<span style="font-size:20px">'+cp.icon+'</span>';
    html+='<span style="font-weight:700;font-size:14px">'+cp.label+'</span>';
    if(cp.active){
      html+='<span style="margin-left:auto;background:#10b981;color:#fff;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700">Active</span>';
    } else {
      html+='<span style="margin-left:auto;background:var(--border-color,#e5e7eb);color:var(--muted);padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700">ยังไม่มี</span>';
    }
    html+='</div>';
    if(cp.active){
      html+='<div style="font-size:12px;color:var(--muted)">'+cp.count+' โปรโมชั่น | ค่าชดเชย '+(cp.cost/1e6).toFixed(2)+' M | '+cp.pct.toFixed(2)+'% ต่อยอดขาย</div>';
    } else {
      html+='<div style="font-size:12px;color:var(--muted)">ยังไม่มีข้อมูลโปรโมชั่น</div>';
    }
    html+='</div>';
  });
  html+='</div></div>';

  // CJ Promo Detail
  if(comp){
    html+='<div class="card" style="padding:20px;border-radius:12px;border-top:3px solid #ea580c;margin-bottom:18px">';
    html+='<div style="font-weight:700;margin-bottom:4px">🏪 CJ MORE — รายละเอียดโปรโมชั่น</div>';
    html+='<div style="font-size:12px;color:var(--muted);margin-bottom:14px">ม.ค. – มิ.ย. 2026</div>';

    // Promo cards
    html+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-bottom:16px">';
    comp.promos.forEach(function(p){
      var totalThb=0;
      if(comp.thb[p.key]) comp.thb[p.key].forEach(function(v){totalThb+=v;});
      html+='<div style="border:1px solid var(--border-color,#e5e7eb);border-radius:10px;padding:14px;border-left:4px solid '+p.color+'">';
      html+='<div style="font-weight:700;font-size:13px;margin-bottom:6px">'+p.name+'</div>';
      html+='<div style="display:flex;gap:12px;font-size:12px;color:var(--muted)">';
      html+='<span>📅 '+p.day+'</span>';
      html+='<span>💰 ลด '+p.discount+' บาท</span>';
      html+='</div>';
      html+='<div style="display:flex;gap:12px;font-size:12px;margin-top:6px">';
      html+='<span style="color:#ef4444">CJ จ่าย: '+p.cjPay+' ฿</span>';
      html+='<span style="color:#f97316">เราจ่าย: '+p.wePay+' ฿</span>';
      html+='</div>';
      html+='<div style="margin-top:8px;font-size:13px;font-weight:700;color:'+p.color+'">รวม: '+totalThb.toLocaleString()+' บาท</div>';
      html+='</div>';
    });
    html+='</div>';

    // Monthly table
    html+='<div style="overflow-x:auto">';
    html+='<table style="width:100%;border-collapse:collapse;font-size:12px">';
    html+='<thead><tr style="background:var(--bg,#f9fafb);border-bottom:2px solid var(--border-color,#e5e7eb)">';
    html+='<th style="padding:8px 10px;text-align:left;font-weight:700">เดือน</th>';
    comp.promos.forEach(function(p){
      html+='<th style="padding:8px 10px;text-align:right;font-weight:700;color:'+p.color+'">'+p.name.split(' ')[0]+'</th>';
    });
    html+='<th style="padding:8px 10px;text-align:right;font-weight:700">รวม</th>';
    html+='<th style="padding:8px 10px;text-align:right;font-weight:700">ยอดขาย</th>';
    html+='<th style="padding:8px 10px;text-align:right;font-weight:700">%</th>';
    html+='</tr></thead><tbody>';
    for(var mi=0;mi<comp.months.length;mi++){
      var rowBg=mi%2===0?'':'background:var(--bg,#f9fafb)';
      html+='<tr style="border-bottom:1px solid var(--border-color,#e5e7eb);'+rowBg+'">';
      html+='<td style="padding:8px 10px;font-weight:600">'+comp.months[mi]+'</td>';
      comp.promos.forEach(function(p){
        var val=comp.thb[p.key]?comp.thb[p.key][mi]:0;
        html+='<td style="padding:8px 10px;text-align:right">'+val.toLocaleString()+'</td>';
      });
      html+='<td style="padding:8px 10px;text-align:right;font-weight:700;color:#ef4444">'+comp.thb.total[mi].toLocaleString()+'</td>';
      html+='<td style="padding:8px 10px;text-align:right">'+(comp.thb.salesTHB[mi]/1e6).toFixed(2)+' M</td>';
      html+='<td style="padding:8px 10px;text-align:right;font-weight:600">'+comp.thb.pctToSale[mi].toFixed(2)+'%</td>';
      html+='</tr>';
    }
    // Grand total row
    html+='<tr style="border-top:2px solid var(--border-color,#e5e7eb);font-weight:700;background:rgba(234,88,12,.05)">';
    html+='<td style="padding:8px 10px">รวม 6 เดือน</td>';
    comp.promos.forEach(function(p){
      var sum=0;
      if(comp.thb[p.key]) comp.thb[p.key].forEach(function(v){sum+=v;});
      html+='<td style="padding:8px 10px;text-align:right">'+sum.toLocaleString()+'</td>';
    });
    html+='<td style="padding:8px 10px;text-align:right;color:#ef4444">'+comp.grandTotal.thb.total.toLocaleString()+'</td>';
    html+='<td style="padding:8px 10px;text-align:right">'+(comp.grandTotal.thb.salesTHB/1e6).toFixed(2)+' M</td>';
    html+='<td style="padding:8px 10px;text-align:right">'+comp.grandTotal.thb.pct.toFixed(2)+'%</td>';
    html+='</tr>';
    html+='</tbody></table></div>';

    html+='<div style="margin-top:12px;text-align:right"><span style="color:#ea580c;cursor:pointer;font-weight:600;font-size:13px" onclick="_mtBiGoChannel(\'CJ\',\'promotion\')">ดูรายละเอียด CJ เต็ม →</span></div>';
    html+='</div>';
  }

  return html;
}

// ── Sales Performance Page ──
var _spYear = 2026;
function _spSelectYear(y) {
  _spYear = y;
  _mtPeriod = { type: 'year', year: y, months: null, label: 'ปี ' + y };
  _mtPeriodSyncUI();
  mtBiSelectMenu('sales-perf');
}

function _spFmtBaht(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + ' M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + ' K';
  return Math.round(n).toLocaleString('th-TH');
}

function _mtBiRenderSalesPerf() {
  var ch = _mtCh || 'CJ';
  var isAll = ch === 'All';
  var chLabel = isAll ? 'ทุกช่องทาง' : ((typeof MT_CH_LABELS !== 'undefined' && MT_CH_LABELS[ch]) ? MT_CH_LABELS[ch] : ch);
  var color = isAll ? '#4f46e5' : ((typeof MT_CH_COLORS !== 'undefined' && MT_CH_COLORS[ch]) ? MT_CH_COLORS[ch] : '#ea580c');
  var MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var MONTHS_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  var YEARS = [2024, 2025, 2026];
  var yr = _spYear;

  var salesCh, orderCh, yearData, yearOrders;
  if (isAll) {
    var aggSales = _mtBiGetSalesAll(yr);
    yearData = aggSales ? { months: aggSales.months } : null;
    yearOrders = _mtBiGetOrderAll(yr);
  } else {
    salesCh = (typeof SALES_DATA !== 'undefined' && SALES_DATA.ModernTrade && SALES_DATA.ModernTrade[ch]) ? SALES_DATA.ModernTrade[ch] : null;
    orderCh = (typeof ORDER_SUMMARY !== 'undefined' && ORDER_SUMMARY.ModernTrade && ORDER_SUMMARY.ModernTrade[ch]) ? ORDER_SUMMARY.ModernTrade[ch] : null;
    yearData = salesCh && salesCh.years && salesCh.years[yr] ? salesCh.years[yr] : null;
    yearOrders = orderCh && orderCh[yr] ? orderCh[yr] : null;
  }

  var pMonths = _mtPeriod.months;
  var totalNet = 0, totalQty = 0, totalCost = 0, totalProfit = 0, totalOrders = 0;
  var monthRows = [];
  for (var mi = 0; mi < 12; mi++) {
    var mk = MONTHS_EN[mi];
    var inFilter = !pMonths || pMonths.indexOf(mi) !== -1;
    var md = yearData && yearData.months && yearData.months[mk] ? yearData.months[mk] : null;
    var od = yearOrders && yearOrders[mk] ? yearOrders[mk] : null;
    var net = inFilter && md ? (md.b || 0) : 0;
    var qty = inFilter && md ? (md.q || 0) : 0;
    var cost = inFilter && md ? (md.cost || 0) : 0;
    var profit = inFilter && md ? (md.profit || 0) : 0;
    var orders = inFilter && od ? (od.orders || 0) : 0;
    totalNet += net;
    totalQty += qty;
    totalCost += cost;
    totalProfit += profit;
    totalOrders += orders;
    monthRows.push({ mk: mk, label: MONTHS_TH[mi], net: net, qty: qty, cost: cost, profit: profit, orders: orders, hasData: net > 0, inFilter: inFilter });
  }

  var html = '';

  // Gradient header
  html += '<div class="card" style="background:linear-gradient(135deg,' + color + ',' + _mtBiLighten(color) + ');color:#fff;padding:24px 28px;margin-bottom:18px;border-radius:14px">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
  html += '<div><div style="font-size:20px;font-weight:800">💰 ผลงานยอดขาย</div>';
  html += '<div style="font-size:13px;opacity:.85;margin-top:4px">' + chLabel + ' — วิเคราะห์ยอดขาย ' + yr + '</div></div>';
  html += '<div style="background:rgba(255,255,255,.2);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700">' + chLabel + '</div>';
  html += '</div></div>';

  // KPI cards
  html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:16px">';
  html += '<div class="card" style="text-align:center;padding:16px"><div style="font-size:11px;color:var(--muted)">💰 ยอดขายรวม</div><div style="font-size:22px;font-weight:800;color:#16a34a">' + _spFmtBaht(totalNet) + '</div><div style="font-size:11px;color:var(--muted)">บาท</div></div>';
  html += '<div class="card" style="text-align:center;padding:16px"><div style="font-size:11px;color:var(--muted)">📋 จำนวนออเดอร์</div><div style="font-size:22px;font-weight:800;color:#2563eb">' + totalOrders.toLocaleString('th-TH') + '</div><div style="font-size:11px;color:var(--muted)">ออเดอร์</div></div>';
  html += '</div>';

  // Chart
  html += '<div class="card" style="margin-bottom:16px"><div class="card-title">📊 ยอดขายรายเดือน (' + yr + ')</div>';
  html += '<div style="position:relative;height:300px"><canvas id="spMonthlyChart"></canvas></div></div>';

  // Monthly summary table
  html += '<div class="card" style="margin-bottom:16px">';
  html += '<div class="card-title">📋 สรุปยอดขายรายเดือน — ' + chLabel + ' (' + yr + ')</div>';
  html += '<div class="table-wrap"><table><thead><tr>';
  html += '<th>เดือน</th><th style="text-align:right">ยอดขาย (บาท)</th><th style="text-align:right">จำนวน (ชิ้น)</th><th style="text-align:right">ออเดอร์</th>';
  html += '</tr></thead><tbody>';

  for (var ri = 0; ri < monthRows.length; ri++) {
    var r = monthRows[ri];
    if (!r.hasData) {
      html += '<tr style="opacity:.5">';
      html += '<td><strong>' + r.label + '</strong></td>';
      html += '<td style="text-align:right;color:#94a3b8">—</td>';
      html += '<td style="text-align:right;color:#94a3b8">—</td>';
      html += '<td style="text-align:right;color:#94a3b8">—</td>';
      html += '</tr>';
      continue;
    }
    html += '<tr>';
    html += '<td><strong>' + r.label + '</strong></td>';
    html += '<td style="text-align:right">' + Math.round(r.net).toLocaleString('th-TH') + '</td>';
    html += '<td style="text-align:right">' + Math.round(r.qty).toLocaleString('th-TH') + '</td>';
    html += '<td style="text-align:right">' + r.orders.toLocaleString('th-TH') + '</td>';
    html += '</tr>';
  }

  // Total row
  html += '<tr style="font-weight:800;background:var(--hover)">';
  html += '<td>รวมทั้งปี</td>';
  html += '<td style="text-align:right">' + Math.round(totalNet).toLocaleString('th-TH') + '</td>';
  html += '<td style="text-align:right">' + Math.round(totalQty).toLocaleString('th-TH') + '</td>';
  html += '<td style="text-align:right">' + totalOrders.toLocaleString('th-TH') + '</td>';
  html += '</tr>';
  html += '</tbody></table></div></div>';

  // 3-Year comparison chart
  html += '<div class="card" style="margin-bottom:16px"><div class="card-title">📊 เปรียบเทียบยอดขาย 3 ปี — ' + chLabel + ' (2024 / 2025 / 2026)</div>';
  html += '<div style="position:relative;height:350px"><canvas id="sp3YearChart"></canvas></div></div>';

  // Year comparison table
  html += '<div class="card" style="margin-bottom:16px">';
  html += '<div class="card-title">📈 เปรียบเทียบรายปี — ' + chLabel + '</div>';
  html += '<div class="table-wrap"><table><thead><tr>';
  html += '<th>ปี</th><th style="text-align:right">ยอดขาย</th><th style="text-align:right">จำนวน</th><th style="text-align:right">ออเดอร์</th>';
  html += '</tr></thead><tbody>';

  for (var yci = 0; yci < YEARS.length; yci++) {
    var yc = YEARS[yci];
    var ycNet = 0, ycQty = 0, ycCost = 0, ycProfit = 0, ycOrd = 0;
    if (isAll) {
      var ycAgg = _mtBiGetSalesAll(yc);
      var ycOrdAgg = _mtBiGetOrderAll(yc);
      if (ycAgg) {
        var ycMks = Object.keys(ycAgg.months);
        for (var ai = 0; ai < ycMks.length; ai++) {
          ycNet += ycAgg.months[ycMks[ai]].b || 0;
          ycQty += ycAgg.months[ycMks[ai]].q || 0;
          ycCost += ycAgg.months[ycMks[ai]].cost || 0;
          ycProfit += ycAgg.months[ycMks[ai]].profit || 0;
        }
      }
      if (ycOrdAgg) {
        var ycOMks = Object.keys(ycOrdAgg);
        for (var oi = 0; oi < ycOMks.length; oi++) ycOrd += (ycOrdAgg[ycOMks[oi]].orders || 0);
      }
    } else {
      var ycData = salesCh && salesCh.years && salesCh.years[yc] ? salesCh.years[yc] : null;
      var ycOrders = orderCh && orderCh[yc] ? orderCh[yc] : null;
      ycNet = ycData && ycData.total ? (ycData.total.net || 0) : 0;
      ycQty = ycData && ycData.total ? (ycData.total.qty || 0) : 0;
      ycCost = ycData && ycData.total ? (ycData.total.cost || 0) : 0;
      ycProfit = ycData && ycData.total ? (ycData.total.profit || 0) : 0;
      if (ycOrders) {
        var ycMKeys = Object.keys(ycOrders);
        for (var oki = 0; oki < ycMKeys.length; oki++) {
          ycOrd += (ycOrders[ycMKeys[oki]].orders || 0);
        }
      }
    }
    var rowBold = yc === yr ? 'font-weight:800;background:var(--hover)' : '';
    html += '<tr style="' + rowBold + '">';
    html += '<td><strong>' + yc + '</strong></td>';
    html += '<td style="text-align:right">' + (ycNet > 0 ? Math.round(ycNet).toLocaleString('th-TH') : '—') + '</td>';
    html += '<td style="text-align:right">' + (ycQty > 0 ? Math.round(ycQty).toLocaleString('th-TH') : '—') + '</td>';
    html += '<td style="text-align:right">' + (ycOrd > 0 ? ycOrd.toLocaleString('th-TH') : '—') + '</td>';
    html += '</tr>';
  }
  html += '</tbody></table></div></div>';

  // Footer
  html += '<div style="text-align:center;padding:12px;color:var(--muted);font-size:11px">';
  html += '📄 ข้อมูลจาก รวมnew.xlsx — ' + chLabel + ' (' + yr + ')</div>';

  // Build 3-year monthly data for comparison chart
  var y3Data = {};
  var MT_CHS_ALL = ['CJ','BigC','Top','TheMall','Makro','Aeon','MM'];
  [2024, 2025, 2026].forEach(function(yy) {
    var arr = [];
    for (var m = 0; m < 12; m++) {
      var mk2 = MONTHS_EN[m];
      var net2 = 0;
      if (isAll) {
        var agg2 = _mtBiGetSalesAll(yy);
        if (agg2 && agg2.months && agg2.months[mk2]) net2 = agg2.months[mk2].b || 0;
      } else {
        if (salesCh && salesCh.years && salesCh.years[yy] && salesCh.years[yy].months && salesCh.years[yy].months[mk2])
          net2 = salesCh.years[yy].months[mk2].b || 0;
      }
      arr.push(net2);
    }
    y3Data[yy] = arr;
  });

  // Chart init
  setTimeout(function () {
    _spInitCharts(monthRows, color, y3Data);
  }, 100);

  return html;
}

function _spInitCharts(monthRows, color, y3Data) {
  var labels = [], dataNet = [];
  for (var i = 0; i < monthRows.length; i++) {
    if (monthRows[i].hasData) {
      labels.push(monthRows[i].label);
      dataNet.push(monthRows[i].net);
    }
  }

  var ctx1 = document.getElementById('spMonthlyChart');
  if (ctx1) {
    new Chart(ctx1.getContext('2d'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'ยอดขาย (บาท)',
          data: dataNet,
          backgroundColor: color,
          borderRadius: 6,
          barThickness: 28
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: function (ctx) { return Math.round(ctx.raw).toLocaleString('th-TH') + ' บาท'; } } }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { callback: function (v) { if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M'; if (v >= 1e3) return (v / 1e3).toFixed(0) + 'K'; return v; } }, grid: { color: 'rgba(0,0,0,0.05)' } }
        }
      }
    });
  }

  // 3-Year comparison grouped bar chart
  if (y3Data) {
    var ctx3 = document.getElementById('sp3YearChart');
    if (ctx3) {
      var MO_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
      var hasAny = [];
      for (var mi = 0; mi < 12; mi++) {
        if ((y3Data[2024] && y3Data[2024][mi] > 0) || (y3Data[2025] && y3Data[2025][mi] > 0) || (y3Data[2026] && y3Data[2026][mi] > 0))
          hasAny.push(mi);
      }
      var lbl3 = hasAny.map(function(m) { return MO_TH[m]; });
      new Chart(ctx3.getContext('2d'), {
        type: 'bar',
        data: {
          labels: lbl3,
          datasets: [
            { label: '2024', data: hasAny.map(function(m) { return y3Data[2024] ? y3Data[2024][m] : 0; }), backgroundColor: '#94a3b8', borderRadius: 4 },
            { label: '2025', data: hasAny.map(function(m) { return y3Data[2025] ? y3Data[2025][m] : 0; }), backgroundColor: '#3b82f6', borderRadius: 4 },
            { label: '2026', data: hasAny.map(function(m) { return y3Data[2026] ? y3Data[2026][m] : 0; }), backgroundColor: '#f97316', borderRadius: 4 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, padding: 16, font: { size: 12, weight: '600' } } },
            tooltip: { callbacks: { label: function (ctx) { return ctx.dataset.label + ': ' + (ctx.raw >= 1e6 ? (ctx.raw / 1e6).toFixed(2) + 'M' : Math.round(ctx.raw).toLocaleString('th-TH')) + ' บาท'; } } }
          },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { callback: function (v) { if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M'; if (v >= 1e3) return (v / 1e3).toFixed(0) + 'K'; return v; } }, grid: { color: 'rgba(0,0,0,0.05)' } }
          }
        }
      });
    }
  }
}

// ── Order Report Page ──
var _ordYear = 2026;
var _ordPage = 0;
var _ordSearch = '';
var _ordBillMonth = null; // null = ทั้งหมด, 1-12 = เดือน

function _ordSelectYear(y) {
  _ordYear = y;
  _mtPeriod = { type: 'year', year: y, months: null, label: 'ปี ' + y };
  _mtPeriodSyncUI();
  mtBiSelectMenu('order');
}

function _ordBillChangeYear(val) {
  _ordYear = parseInt(val);
  _ordPage = 0;
  _ordBillMonth = null;
  var mSel = document.getElementById('ordBillMonthSel');
  if (mSel) mSel.value = '';
  var titleEl = document.getElementById('ordBillTitle');
  if (titleEl) {
    var chLabel = (_mtCh === 'All') ? 'ทุกช่องทาง' : ((typeof MT_CH_LABELS !== 'undefined' && MT_CH_LABELS[_mtCh]) ? MT_CH_LABELS[_mtCh] : _mtCh);
    titleEl.textContent = '📋 รายการบิล — ' + chLabel + ' (' + _ordYear + ')';
  }
  _ordRenderBillTable();
}

function _ordBillChangeMonth(val) {
  _ordBillMonth = val ? parseInt(val) : null;
  _ordPage = 0;
  _ordRenderBillTable();
}

// ดึงรายการบิลจาก ORDER_LIST ตาม channel + ปี + คำค้นหา
function _ordGetBills() {
  var custMap = {CJ:'ซีเจ', BigC:'BIG C', Top:'TOP', Makro:'MAKRO', MM:'MM', Aeon:'AEON', TheMall:'The Mall', Lotus:'LOTUS', Villa:'VILLA MARKET'};
  var isAll = _mtCh === 'All';
  var custName = isAll ? null : (custMap[_mtCh] || _mtCh);
  var allCustNames = null;
  if (isAll) {
    allCustNames = {};
    var keys = Object.keys(custMap);
    for (var k = 0; k < keys.length; k++) allCustNames[custMap[keys[k]]] = true;
  }
  if (typeof ORDER_LIST === 'undefined') return [];
  var yr = _ordYear;
  var pMonths = _mtPeriod.months;
  var results = [];
  for (var i = 0; i < ORDER_LIST.length; i++) {
    var o = ORDER_LIST[i];
    if (o[3] !== yr) continue;
    if (_OL_PORTS[o[1]] !== 'ModernTrade') continue;
    if (_ordBillMonth && o[4] !== _ordBillMonth) continue;
    if (!_ordBillMonth && pMonths && pMonths.indexOf(o[4] - 1) === -1) continue;
    if (isAll) {
      if (!allCustNames[_OL_CUSTS[o[2]]]) continue;
    } else {
      if (_OL_CUSTS[o[2]] !== custName) continue;
    }
    if (_ordSearch && o[0].toLowerCase().indexOf(_ordSearch.toLowerCase()) === -1) continue;
    results.push(o);
  }
  return results;
}

function _ordSearchBills(val) {
  _ordSearch = val;
  _ordPage = 0;
  _ordRenderBillTable();
}

function _ordPageBills(dir) {
  _ordPage += dir;
  _ordRenderBillTable();
}

// วาดตารางบิลลงใน DOM โดยตรง (ใช้ตอน search/pagination ไม่ต้อง render ทั้งหน้า)
function _ordRenderBillTable() {
  var bills = _ordGetBills();
  var PER_PAGE = 20;
  var totalPages = Math.max(1, Math.ceil(bills.length / PER_PAGE));
  if (_ordPage >= totalPages) _ordPage = totalPages - 1;
  if (_ordPage < 0) _ordPage = 0;
  var start = _ordPage * PER_PAGE;
  var page = bills.slice(start, start + PER_PAGE);

  var MONTHS_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

  var html = '';
  // จำนวนผลลัพธ์
  html += '<div style="font-size:13px;color:var(--muted);margin-bottom:10px">พบ ' + bills.length.toLocaleString('th-TH') + ' รายการ</div>';

  // ตารางบิล
  var billIsAll = _mtCh === 'All';
  html += '<div class="table-wrap"><table><thead><tr>';
  html += '<th style="text-align:center">#</th>';
  html += '<th style="text-align:left">เลขที่บิล</th>';
  if (billIsAll) html += '<th style="text-align:left">ช่องทาง</th>';
  html += '<th style="text-align:left">เดือน</th>';
  html += '<th style="text-align:left">สาขา</th>';
  html += '<th style="text-align:right">รายการ</th>';
  html += '<th style="text-align:right">จำนวน</th>';
  html += '<th style="text-align:right">ยอดรวม</th>';
  html += '</tr></thead><tbody>';

  var pageQty = 0, pageNet = 0, pageItems = 0;
  for (var i = 0; i < page.length; i++) {
    var b = page[i];
    var monthLabel = (b[4] >= 1 && b[4] <= 12) ? MONTHS_TH[b[4] - 1] : b[4];
    var branchName = (typeof _OL_BRANCHES !== 'undefined' && _OL_BRANCHES[b[8]]) ? _OL_BRANCHES[b[8]] : '-';
    pageQty += (b[6] || 0);
    pageNet += (b[7] || 0);
    pageItems += (b[5] || 0);
    html += '<tr>';
    html += '<td style="text-align:center;color:var(--muted)">' + (start + i + 1) + '</td>';
    html += '<td style="text-align:left;font-family:monospace;font-size:12px">' + b[0] + '</td>';
    if (billIsAll) html += '<td style="text-align:left;font-size:12px">' + (_OL_CUSTS[b[2]] || '-') + '</td>';
    html += '<td style="text-align:left">' + monthLabel + '</td>';
    html += '<td style="text-align:left;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="' + branchName + '">' + branchName + '</td>';
    html += '<td style="text-align:right">' + (b[5] || 0).toLocaleString('th-TH') + '</td>';
    html += '<td style="text-align:right">' + (b[6] || 0).toLocaleString('th-TH') + '</td>';
    html += '<td style="text-align:right">' + Math.round(b[7] || 0).toLocaleString('th-TH') + '</td>';
    html += '</tr>';
  }

  // แถวรวมของหน้านี้
  if (page.length > 0) {
    html += '<tr style="font-weight:800;background:var(--hover)">';
    html += '<td colspan="' + (billIsAll ? 5 : 4) + '" style="text-align:right">รวมหน้านี้</td>';
    html += '<td style="text-align:right">' + pageItems.toLocaleString('th-TH') + '</td>';
    html += '<td style="text-align:right">' + pageQty.toLocaleString('th-TH') + '</td>';
    html += '<td style="text-align:right">' + Math.round(pageNet).toLocaleString('th-TH') + '</td>';
    html += '</tr>';
  }
  html += '</tbody></table></div>';

  // Pagination
  if (totalPages > 1) {
    html += '<div style="display:flex;justify-content:center;align-items:center;gap:12px;margin-top:12px">';
    html += '<button onclick="_ordPageBills(-1)" ' + (_ordPage <= 0 ? 'disabled' : '') + ' style="padding:6px 16px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);cursor:' + (_ordPage <= 0 ? 'default' : 'pointer') + ';font-size:12px;opacity:' + (_ordPage <= 0 ? '0.4' : '1') + '">&#9664; ก่อนหน้า</button>';
    html += '<span style="font-size:13px;color:var(--muted)">หน้า ' + (_ordPage + 1) + '/' + totalPages + '</span>';
    html += '<button onclick="_ordPageBills(1)" ' + (_ordPage >= totalPages - 1 ? 'disabled' : '') + ' style="padding:6px 16px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);cursor:' + (_ordPage >= totalPages - 1 ? 'default' : 'pointer') + ';font-size:12px;opacity:' + (_ordPage >= totalPages - 1 ? '0.4' : '1') + '">ถัดไป &#9654;</button>';
    html += '</div>';
  }

  var el = document.getElementById('ordBillTableArea');
  if (el) el.innerHTML = html;
}

function _mtBiRenderOrder() {
  _ordPage = 0;
  _ordSearch = '';
  _ordBillMonth = null;

  var ch = _mtCh || 'CJ';
  var isAll = ch === 'All';
  var chLabel = isAll ? 'ทุกช่องทาง' : ((typeof MT_CH_LABELS !== 'undefined' && MT_CH_LABELS[ch]) ? MT_CH_LABELS[ch] : ch);
  var color = isAll ? '#4f46e5' : ((typeof MT_CH_COLORS !== 'undefined' && MT_CH_COLORS[ch]) ? MT_CH_COLORS[ch] : '#ea580c');
  var MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var MONTHS_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  var YEARS = [2024, 2025, 2026];
  var yr = _ordYear;

  var yearOrders;
  if (isAll) {
    yearOrders = _mtBiGetOrderAll(yr);
  } else {
    var orderCh = (typeof ORDER_SUMMARY !== 'undefined' && ORDER_SUMMARY.ModernTrade && ORDER_SUMMARY.ModernTrade[ch]) ? ORDER_SUMMARY.ModernTrade[ch] : null;
    yearOrders = orderCh && orderCh[yr] ? orderCh[yr] : null;
  }

  // คำนวณข้อมูลรายเดือน (กรองตาม period filter)
  var pMonths = _mtPeriod.months;
  var totalOrders = 0, totalQty = 0, totalNet = 0, totalItems = 0;
  var monthRows = [];
  for (var mi = 0; mi < 12; mi++) {
    var mk = MONTHS_EN[mi];
    var inFilter = !pMonths || pMonths.indexOf(mi) !== -1;
    var od = inFilter && yearOrders && yearOrders[mk] ? yearOrders[mk] : null;
    var orders = od ? (od.orders || 0) : 0;
    var qty = od ? (od.qty || 0) : 0;
    var net = od ? (od.net || 0) : 0;
    var items = od ? (od.items || 0) : 0;
    totalOrders += orders;
    totalQty += qty;
    totalNet += net;
    totalItems += items;
    monthRows.push({ mk: mk, label: MONTHS_TH[mi], orders: orders, qty: qty, net: net, items: items, hasData: orders > 0, inFilter: inFilter });
  }

  var avgPerOrder = totalOrders > 0 ? (totalNet / totalOrders) : 0;
  var html = '';

  // Gradient header
  html += '<div class="card" style="background:linear-gradient(135deg,' + color + ',' + _mtBiLighten(color) + ');color:#fff;padding:24px 28px;margin-bottom:18px;border-radius:14px">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
  html += '<div><div style="font-size:20px;font-weight:800">📋 รายงานคำสั่งซื้อ</div>';
  html += '<div style="font-size:13px;opacity:.85;margin-top:4px">' + chLabel + ' — สรุปคำสั่งซื้อ ' + yr + '</div></div>';
  html += '<div style="background:rgba(255,255,255,.2);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700">' + chLabel + '</div>';
  html += '</div></div>';


  // KPI cards (4 cards)
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">';
  html += '<div class="card" style="text-align:center;padding:16px"><div style="font-size:11px;color:var(--muted)">📦 ออเดอร์ทั้งหมด</div><div style="font-size:22px;font-weight:800;color:#2563eb">' + totalOrders.toLocaleString('th-TH') + '</div><div style="font-size:11px;color:var(--muted)">ออเดอร์</div></div>';
  html += '<div class="card" style="text-align:center;padding:16px"><div style="font-size:11px;color:var(--muted)">📦 จำนวนสินค้า</div><div style="font-size:22px;font-weight:800;color:#d97706">' + totalQty.toLocaleString('th-TH') + '</div><div style="font-size:11px;color:var(--muted)">ชิ้น</div></div>';
  html += '<div class="card" style="text-align:center;padding:16px"><div style="font-size:11px;color:var(--muted)">💰 ยอดรวม</div><div style="font-size:22px;font-weight:800;color:#16a34a">' + _spFmtBaht(totalNet) + '</div><div style="font-size:11px;color:var(--muted)">บาท</div></div>';
  html += '<div class="card" style="text-align:center;padding:16px"><div style="font-size:11px;color:var(--muted)">📈 เฉลี่ย/ออเดอร์</div><div style="font-size:22px;font-weight:800;color:#7c3aed">' + _spFmtBaht(avgPerOrder) + '</div><div style="font-size:11px;color:var(--muted)">บาท</div></div>';
  html += '</div>';

  // Monthly bar chart
  html += '<div class="card" style="margin-bottom:16px">';
  html += '<div class="card-title">📊 จำนวนออเดอร์รายเดือน (' + yr + ')</div>';
  html += '<div style="position:relative;height:300px"><canvas id="ordMonthlyChart"></canvas></div>';
  html += '</div>';

  // Monthly order table
  html += '<div class="card" style="margin-bottom:16px">';
  html += '<div class="card-title">📋 สรุปคำสั่งซื้อรายเดือน — ' + chLabel + ' (' + yr + ')</div>';
  html += '<div class="table-wrap"><table><thead><tr>';
  html += '<th>เดือน</th><th style="text-align:right">จำนวนออเดอร์</th><th style="text-align:right">จำนวนสินค้า (ชิ้น)</th><th style="text-align:right">ยอดรวม (บาท)</th><th style="text-align:right">เฉลี่ย/ออเดอร์</th><th style="text-align:right">รายการสินค้า</th>';
  html += '</tr></thead><tbody>';

  for (var ri = 0; ri < monthRows.length; ri++) {
    var r = monthRows[ri];
    if (!r.hasData) {
      html += '<tr style="opacity:.5">';
      html += '<td><strong>' + r.label + '</strong></td>';
      html += '<td style="text-align:right;color:#94a3b8">—</td>';
      html += '<td style="text-align:right;color:#94a3b8">—</td>';
      html += '<td style="text-align:right;color:#94a3b8">—</td>';
      html += '<td style="text-align:right;color:#94a3b8">—</td>';
      html += '<td style="text-align:right;color:#94a3b8">—</td>';
      html += '</tr>';
      continue;
    }
    var avg = r.orders > 0 ? (r.net / r.orders) : 0;
    html += '<tr>';
    html += '<td><strong>' + r.label + '</strong></td>';
    html += '<td style="text-align:right">' + r.orders.toLocaleString('th-TH') + '</td>';
    html += '<td style="text-align:right">' + Math.round(r.qty).toLocaleString('th-TH') + '</td>';
    html += '<td style="text-align:right">' + Math.round(r.net).toLocaleString('th-TH') + '</td>';
    html += '<td style="text-align:right">' + _spFmtBaht(avg) + '</td>';
    html += '<td style="text-align:right">' + r.items.toLocaleString('th-TH') + '</td>';
    html += '</tr>';
  }

  // Total row
  html += '<tr style="font-weight:800;background:var(--hover)">';
  html += '<td>รวมทั้งปี</td>';
  html += '<td style="text-align:right">' + totalOrders.toLocaleString('th-TH') + '</td>';
  html += '<td style="text-align:right">' + Math.round(totalQty).toLocaleString('th-TH') + '</td>';
  html += '<td style="text-align:right">' + Math.round(totalNet).toLocaleString('th-TH') + '</td>';
  html += '<td style="text-align:right">' + _spFmtBaht(avgPerOrder) + '</td>';
  html += '<td style="text-align:right">' + totalItems.toLocaleString('th-TH') + '</td>';
  html += '</tr>';
  html += '</tbody></table></div></div>';

  // Year comparison table
  html += '<div class="card" style="margin-bottom:16px">';
  html += '<div class="card-title">📈 เปรียบเทียบคำสั่งซื้อรายปี — ' + chLabel + '</div>';
  html += '<div class="table-wrap"><table><thead><tr>';
  html += '<th>ปี</th><th style="text-align:right">ออเดอร์</th><th style="text-align:right">จำนวนสินค้า</th><th style="text-align:right">ยอดรวม</th><th style="text-align:right">เฉลี่ย/ออเดอร์</th><th style="text-align:right">รายการสินค้า</th>';
  html += '</tr></thead><tbody>';

  for (var yci = 0; yci < YEARS.length; yci++) {
    var yc = YEARS[yci];
    var ycOrdData = isAll ? _mtBiGetOrderAll(yc) : (orderCh && orderCh[yc] ? orderCh[yc] : null);
    var ycTotalOrd = 0, ycTotalQty = 0, ycTotalNet = 0, ycTotalItems = 0;
    if (ycOrdData) {
      var ycMKeys = Object.keys(ycOrdData);
      for (var oki = 0; oki < ycMKeys.length; oki++) {
        var omd = ycOrdData[ycMKeys[oki]];
        ycTotalOrd += (omd.orders || 0);
        ycTotalQty += (omd.qty || 0);
        ycTotalNet += (omd.net || 0);
        ycTotalItems += (omd.items || 0);
      }
    }
    var ycAvg = ycTotalOrd > 0 ? (ycTotalNet / ycTotalOrd) : 0;
    var rowBold = yc === yr ? 'font-weight:800;background:var(--hover)' : '';
    html += '<tr style="' + rowBold + '">';
    html += '<td><strong>' + yc + '</strong></td>';
    html += '<td style="text-align:right">' + (ycTotalOrd > 0 ? ycTotalOrd.toLocaleString('th-TH') : '—') + '</td>';
    html += '<td style="text-align:right">' + (ycTotalQty > 0 ? Math.round(ycTotalQty).toLocaleString('th-TH') : '—') + '</td>';
    html += '<td style="text-align:right">' + (ycTotalNet > 0 ? Math.round(ycTotalNet).toLocaleString('th-TH') : '—') + '</td>';
    html += '<td style="text-align:right">' + (ycTotalOrd > 0 ? _spFmtBaht(ycAvg) : '—') + '</td>';
    html += '<td style="text-align:right">' + (ycTotalItems > 0 ? ycTotalItems.toLocaleString('th-TH') : '—') + '</td>';
    html += '</tr>';
  }
  html += '</tbody></table></div></div>';

  // Bill listing section (รายการบิลจาก ORDER_LIST)
  html += '<div class="card" style="margin-bottom:16px">';
  html += '<div id="ordBillTitle" class="card-title">📋 รายการบิล — ' + chLabel + ' (' + yr + ')</div>';
  html += '<div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap">';
  // Year dropdown
  html += '<select id="ordBillYearSel" onchange="_ordBillChangeYear(this.value)" style="padding:8px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;background:var(--card);color:var(--text);outline:none;cursor:pointer;min-width:120px">';
  html += '<option value="2024"' + (yr === 2024 ? ' selected' : '') + '>ปี 2567</option>';
  html += '<option value="2025"' + (yr === 2025 ? ' selected' : '') + '>ปี 2568</option>';
  html += '<option value="2026"' + (yr === 2026 ? ' selected' : '') + '>ปี 2569</option>';
  html += '</select>';
  // Month dropdown
  var MONTHS_TH_BILL = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  html += '<select id="ordBillMonthSel" onchange="_ordBillChangeMonth(this.value)" style="padding:8px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;background:var(--card);color:var(--text);outline:none;cursor:pointer;min-width:120px">';
  html += '<option value="">ทุกเดือน</option>';
  for (var mi = 0; mi < 12; mi++) {
    html += '<option value="' + (mi + 1) + '"' + (_ordBillMonth === (mi + 1) ? ' selected' : '') + '>' + MONTHS_TH_BILL[mi] + '</option>';
  }
  html += '</select>';
  // Search
  html += '<input type="text" id="ordSearchInput" placeholder="🔍 ค้นหาเลขที่บิล..." oninput="_ordSearchBills(this.value)" style="flex:1;padding:8px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;background:var(--card);color:var(--text);outline:none;min-width:150px" value="' + (_ordSearch || '') + '">';
  html += '<button onclick="_ordSearch=\'\';document.getElementById(\'ordSearchInput\').value=\'\';_ordBillMonth=null;document.getElementById(\'ordBillMonthSel\').value=\'\';_ordPage=0;_ordRenderBillTable()" style="padding:8px 14px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--text);cursor:pointer;font-size:12px">ล้าง</button>';
  html += '</div>';
  html += '<div id="ordBillTableArea"></div>';
  html += '</div>';

  // Footer
  html += '<div style="text-align:center;padding:12px;color:var(--muted);font-size:11px">';
  html += '📄 ข้อมูลจาก รวมnew.xlsx — ' + chLabel + ' (' + yr + ')</div>';

  // Chart init
  setTimeout(function () {
    _ordInitChart(monthRows, color);
  }, 100);

  // Bill table init
  setTimeout(function () {
    _ordRenderBillTable();
  }, 150);

  return html;
}

function _ordInitChart(monthRows, color) {
  var labels = [], dataOrders = [];
  for (var i = 0; i < monthRows.length; i++) {
    labels.push(monthRows[i].label);
    dataOrders.push(monthRows[i].orders);
  }

  var ctx = document.getElementById('ordMonthlyChart');
  if (ctx) {
    new Chart(ctx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'จำนวนออเดอร์',
          data: dataOrders,
          backgroundColor: color,
          borderRadius: 6,
          barThickness: 28
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: function (ctx) { return ctx.raw.toLocaleString('th-TH') + ' ออเดอร์'; } } }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { callback: function (v) { return v.toLocaleString('th-TH'); } }, grid: { color: 'rgba(0,0,0,0.05)' } }
        }
      }
    });
  }
}

// ── Product Performance Page ──
function _mtBiRenderProductPerf(){
  var ch=_mtCh||'CJ';
  var isAllPP=ch==='All';
  var chLabel=isAllPP?'ทุกช่องทาง':((typeof MT_CH_LABELS!=='undefined'&&MT_CH_LABELS[ch])?MT_CH_LABELS[ch]:ch);
  var color=isAllPP?'#4f46e5':((typeof MT_CH_COLORS!=='undefined'&&MT_CH_COLORS[ch])?MT_CH_COLORS[ch]:'#ea580c');
  var products;
  if(isAllPP){
    var seen={};
    Object.keys(MT_DATA.ch).forEach(function(k){
      (MT_DATA.ch[k]||[]).forEach(function(p){
        var key=p.code+p.name;
        if(!seen[key]){seen[key]={code:p.code,name:p.name,type:p.type,rank:p.rank,tu:0,tb:0,m:{}};}
        seen[key].tu+=p.tu||0; seen[key].tb+=p.tb||0;
        if(p.m){Object.keys(p.m).forEach(function(mk){
          if(!seen[key].m[mk])seen[key].m[mk]={u:0,b:0};
          seen[key].m[mk].u+=(p.m[mk].u||0);
          seen[key].m[mk].b+=(p.m[mk].b||0);
        });}
      });
    });
    products=Object.values(seen);
  } else {
    products=MT_DATA.ch[ch]||[];
  }
  var totalBaht=0,totalQty=0,ambientB=0,chillB=0,ambientQ=0,chillQ=0;
  var skuCount=products.length,rankCounts={};
  var MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var MONTH_TH=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  var activeMonths=[];

  products.forEach(function(p){
    totalBaht+=p.tb||0; totalQty+=p.tu||0;
    if(p.type==='Ambient'){ambientB+=p.tb||0;ambientQ+=p.tu||0;}
    else{chillB+=p.tb||0;chillQ+=p.tu||0;}
    rankCounts[p.rank]=(rankCounts[p.rank]||0)+1;
    if(p.m){Object.keys(p.m).forEach(function(mk){if(activeMonths.indexOf(mk)===-1)activeMonths.push(mk);});}
  });
  activeMonths.sort(function(a,b){return MONTHS.indexOf(a)-MONTHS.indexOf(b);});

  var html='';

  // Header
  html+='<div class="card" style="background:linear-gradient(135deg,'+color+','+_mtBiLighten(color)+');color:#fff;padding:24px 28px;margin-bottom:18px;border-radius:14px">';
  html+='<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
  html+='<div><div style="font-size:20px;font-weight:800">🍞 ผลงานสินค้า</div>';
  html+='<div style="font-size:13px;opacity:.85;margin-top:4px">'+chLabel+' — วิเคราะห์ผลงานสินค้าทุก SKU</div></div>';
  html+='<div style="background:rgba(255,255,255,.2);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700">'+chLabel+'</div>';
  html+='</div></div>';

  // KPI cards
  var fmtB=function(n){if(n>=1e6)return(n/1e6).toFixed(2)+' M';if(n>=1e3)return(n/1e3).toFixed(1)+' K';return Math.round(n).toLocaleString();};
  var fmtQ=function(n){return Math.round(n).toLocaleString('th-TH');};
  html+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">';
  html+='<div class="card" style="text-align:center;padding:16px"><div style="font-size:11px;color:var(--muted)">จำนวน SKU</div><div style="font-size:22px;font-weight:800;color:#4f46e5">'+skuCount+'</div></div>';
  html+='<div class="card" style="text-align:center;padding:16px"><div style="font-size:11px;color:var(--muted)">ยอดขายรวม (บาท)</div><div style="font-size:22px;font-weight:800;color:#16a34a">'+fmtB(totalBaht)+'</div></div>';
  html+='<div class="card" style="text-align:center;padding:16px"><div style="font-size:11px;color:var(--muted)">ยอดขายรวม (ชิ้น)</div><div style="font-size:22px;font-weight:800;color:#0891b2">'+fmtQ(totalQty)+'</div></div>';
  html+='<div class="card" style="text-align:center;padding:16px"><div style="font-size:11px;color:var(--muted)">Ambient / Chill</div><div style="font-size:22px;font-weight:800;color:#d97706">'+(products.filter(function(p){return p.type==='Ambient';}).length)+' / '+(products.filter(function(p){return p.type!=='Ambient';}).length)+'</div></div>';
  html+='</div>';

  // Charts row: Top 10 bar + Ambient vs Chill pie
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">';
  html+='<div class="card"><div class="card-title">📊 Top 10 สินค้าขายดี (บาท)</div>';
  html+='<div style="position:relative;height:300px"><canvas id="ppTop10Chart"></canvas></div></div>';
  html+='<div class="card"><div class="card-title">📊 Ambient vs Chill</div>';
  html+='<div style="position:relative;height:300px"><canvas id="ppTypeChart"></canvas></div></div>';
  html+='</div>';

  // Filters
  html+='<div class="card" style="margin-bottom:16px">';
  html+='<div class="card-title">📋 ตารางผลงานสินค้า</div>';
  html+='<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;align-items:center">';
  html+='<select id="ppFilterType" onchange="_ppFilterTable()" style="padding:6px 12px;border-radius:8px;border:1px solid var(--border);font-size:13px;background:var(--card);color:var(--text)">';
  html+='<option value="all">ประเภท: ทั้งหมด</option><option value="Ambient">Ambient</option><option value="Chill">Chill</option></select>';
  html+='<select id="ppFilterRank" onchange="_ppFilterTable()" style="padding:6px 12px;border-radius:8px;border:1px solid var(--border);font-size:13px;background:var(--card);color:var(--text)">';
  html+='<option value="all">Rank: ทั้งหมด</option><option value="A+">A+</option><option value="A">A</option><option value="B">B</option><option value="C">C</option></select>';
  html+='<input id="ppSearch" oninput="_ppFilterTable()" placeholder="🔍 ค้นหาสินค้า..." style="padding:6px 12px;border-radius:8px;border:1px solid var(--border);font-size:13px;flex:1;min-width:180px;background:var(--card);color:var(--text)">';
  html+='</div>';

  // Product ranking table
  html+='<div class="table-wrap"><table id="ppProdTable"><thead><tr>';
  html+='<th>NO</th><th style="text-align:left">ชื่อสินค้า</th><th>TYPE</th><th style="text-align:right">RSP</th><th style="text-align:right">GP%</th><th>RANK</th><th style="text-align:right">รวมชิ้น</th><th style="text-align:right">รวมบาท</th><th style="text-align:right">%REVENUE</th><th style="text-align:left">หมายเหตุ</th>';
  html+='</tr></thead><tbody>';
  products.forEach(function(p,i){
    var pct=totalBaht>0?((p.tb/totalBaht)*100):0;
    var rankColor=p.rank==='A+'?'#dc2626':p.rank==='A'?'#ea580c':p.rank==='B'?'#d97706':'#94a3b8';
    html+='<tr data-type="'+p.type+'" data-rank="'+p.rank+'" data-name="'+(p.name||'').toLowerCase()+'">';
    html+='<td style="text-align:center">'+(i+1)+'</td>';
    html+='<td style="text-align:left;max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="'+_stripBrand(p.name)+'">'+_stripBrand(p.name)+'</td>';
    html+='<td style="text-align:center"><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;background:'+(p.type==='Ambient'?'#fff7ed':'#eff6ff')+';color:'+(p.type==='Ambient'?'#ea580c':'#2563eb')+'">'+p.type+'</span></td>';
    html+='<td style="text-align:right">'+(p.rsp||0).toFixed(0)+'</td>';
    html+='<td style="text-align:right">'+(p.gp||0).toFixed(1)+'%</td>';
    html+='<td style="text-align:center"><span style="display:inline-block;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:800;color:#fff;background:'+rankColor+'">'+p.rank+'</span></td>';
    html+='<td style="text-align:right;font-weight:600">'+fmtQ(p.tu)+'</td>';
    html+='<td style="text-align:right;font-weight:600">'+fmtB(p.tb)+'</td>';
    html+='<td style="text-align:right">'+pct.toFixed(1)+'%</td>';
    html+='<td style="text-align:left;font-size:12px;color:var(--muted)">'+(p.rmk||'—')+'</td>';
    html+='</tr>';
  });
  html+='</tbody></table></div></div>';

  // Monthly sales breakdown table
  html+='<div class="card" style="margin-bottom:16px">';
  html+='<div class="card-title">📅 ยอดขายรายเดือน</div>';
  html+='<div style="display:flex;gap:8px;margin-bottom:10px">';
  html+='<button id="ppMonthUnit" onclick="_ppToggleMonthUnit()" style="padding:4px 14px;border-radius:8px;border:1px solid var(--border);font-size:12px;cursor:pointer;background:var(--card);color:var(--text)">แสดง: บาท</button>';
  html+='</div>';
  html+='<div class="table-wrap"><table id="ppMonthTable"><thead><tr>';
  html+='<th style="text-align:left;position:sticky;left:0;background:var(--card);z-index:2">ชื่อสินค้า</th>';
  activeMonths.forEach(function(mk){
    var idx=MONTHS.indexOf(mk);
    html+='<th style="text-align:right">'+(idx>=0?MONTH_TH[idx]:mk)+'</th>';
  });
  html+='<th style="text-align:right;font-weight:800">ยอดรวม</th>';
  html+='</tr></thead><tbody>';
  products.forEach(function(p){
    html+='<tr data-mtype="'+p.type+'" data-mrank="'+p.rank+'">';
    html+='<td style="text-align:left;position:sticky;left:0;background:var(--card);z-index:1;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px" title="'+_stripBrand(p.name)+'">'+_stripBrand(p.name)+'</td>';
    activeMonths.forEach(function(mk){
      var md=p.m&&p.m[mk]?p.m[mk]:null;
      html+='<td style="text-align:right;font-size:12px" data-b="'+(md?md.b:0)+'" data-q="'+(md?md.u:0)+'">'+(md?fmtB(md.b):'—')+'</td>';
    });
    html+='<td style="text-align:right;font-weight:700;font-size:12px">'+fmtB(p.tb)+'</td>';
    html+='</tr>';
  });
  // Total row
  html+='<tr style="font-weight:800;background:var(--hover)">';
  html+='<td style="text-align:left;position:sticky;left:0;background:var(--hover);z-index:1">รวมทั้งหมด</td>';
  activeMonths.forEach(function(mk){
    var sumB=0;
    products.forEach(function(p){if(p.m&&p.m[mk])sumB+=p.m[mk].b||0;});
    html+='<td style="text-align:right;font-size:12px">'+fmtB(sumB)+'</td>';
  });
  html+='<td style="text-align:right;font-size:12px">'+fmtB(totalBaht)+'</td>';
  html+='</tr>';
  html+='</tbody></table></div></div>';

  html+='<div style="text-align:center;padding:12px;color:var(--muted);font-size:11px">';
  html+='📄 ข้อมูลจาก MT Data — '+chLabel+'</div>';

  // Delayed chart init
  setTimeout(function(){_ppInitCharts(products,ambientB,chillB,color);},100);

  return html;
}

function _ppInitCharts(products,ambientB,chillB,color){
  var top10=products.slice().sort(function(a,b){return(b.tb||0)-(a.tb||0);}).slice(0,10);
  var barColors=['#4f46e5','#2563eb','#0891b2','#0d9488','#16a34a','#65a30d','#d97706','#ea580c','#dc2626','#7c3aed'];

  var ctx1=document.getElementById('ppTop10Chart');
  if(ctx1){
    new Chart(ctx1.getContext('2d'),{
      type:'bar',
      data:{
        labels:top10.map(function(p){var n=_stripBrand(p.name);return n.length>25?n.substring(0,25)+'…':n;}),
        datasets:[{
          data:top10.map(function(p){return p.tb||0;}),
          backgroundColor:barColors.slice(0,top10.length),
          borderRadius:4,barThickness:20
        }]
      },
      options:{
        indexAxis:'y',
        responsive:true,maintainAspectRatio:false,
        plugins:{legend:{display:false},tooltip:{callbacks:{label:function(ctx){return Math.round(ctx.raw).toLocaleString('th-TH')+' บาท';}}}},
        scales:{
          x:{ticks:{callback:function(v){return(v/1e6).toFixed(1)+'M';}},beginAtZero:true,grid:{color:'rgba(0,0,0,0.05)'}},
          y:{grid:{display:false},ticks:{font:{size:11}}}
        }
      }
    });
  }

  var ctx2=document.getElementById('ppTypeChart');
  if(ctx2){
    new Chart(ctx2.getContext('2d'),{
      type:'doughnut',
      data:{
        labels:['Ambient','Chill'],
        datasets:[{data:[ambientB,chillB],backgroundColor:['#f97316','#3b82f6'],borderWidth:2}]
      },
      options:{
        responsive:true,maintainAspectRatio:false,
        plugins:{
          legend:{position:'bottom',labels:{font:{size:13},padding:16}},
          tooltip:{callbacks:{label:function(ctx){
            var val=ctx.raw;
            var total=ambientB+chillB;
            var pct=total>0?((val/total)*100).toFixed(1):'0';
            return ctx.label+': '+Math.round(val).toLocaleString('th-TH')+' บาท ('+pct+'%)';
          }}}
        }
      }
    });
  }
}

function _ppFilterTable(){
  var ft=document.getElementById('ppFilterType');
  var fr=document.getElementById('ppFilterRank');
  var fs=document.getElementById('ppSearch');
  var typeVal=ft?ft.value:'all';
  var rankVal=fr?fr.value:'all';
  var searchVal=fs?fs.value.toLowerCase():'';
  var rows=document.querySelectorAll('#ppProdTable tbody tr');
  var no=0;
  for(var i=0;i<rows.length;i++){
    var r=rows[i];
    var show=true;
    if(typeVal!=='all'&&r.getAttribute('data-type')!==typeVal) show=false;
    if(rankVal!=='all'&&r.getAttribute('data-rank')!==rankVal) show=false;
    if(searchVal&&(r.getAttribute('data-name')||'').indexOf(searchVal)===-1) show=false;
    r.style.display=show?'':'none';
    if(show){no++;r.cells[0].textContent=no;}
  }
}

var _ppShowBaht=true;
function _ppToggleMonthUnit(){
  _ppShowBaht=!_ppShowBaht;
  var btn=document.getElementById('ppMonthUnit');
  if(btn) btn.textContent='แสดง: '+(_ppShowBaht?'บาท':'ชิ้น');
  var fmtB2=function(n){if(n>=1e6)return(n/1e6).toFixed(2)+' M';if(n>=1e3)return(n/1e3).toFixed(1)+' K';return Math.round(n).toLocaleString();};
  var fmtQ2=function(n){return Math.round(n).toLocaleString('th-TH');};
  var rows=document.querySelectorAll('#ppMonthTable tbody tr');
  for(var i=0;i<rows.length;i++){
    var cells=rows[i].cells;
    for(var j=1;j<cells.length;j++){
      var b=parseFloat(cells[j].getAttribute('data-b'));
      var q=parseFloat(cells[j].getAttribute('data-q'));
      if(!isNaN(b)&&!isNaN(q)){
        cells[j].textContent=_ppShowBaht?(b>0?fmtB2(b):'—'):(q>0?fmtQ2(q):'—');
      }
    }
  }
}

// ── Claim / Complaints — tab switching ──
var _claimTab = 'all';
function _claimSelectTab(tab) {
  _claimTab = tab;
  mtBiSelectMenu('claim');
}

// ── Claim / Complaints page — ดึงข้อมูลจาก QUALITY_RAW (quality.js) แยกช่องทาง ──
function _mtBiRenderClaim() {
  var color = '#ea580c';
  var MONTHS_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  var CH_KEYS = ['all','MDT','Amazon','Online','Booth'];
  var CH_NAMES = { all:'ทุกช่องทาง', MDT:'Modern Trade', Amazon:'Amazon', Online:'Online', Booth:'Booth' };
  var CH_ICONS = { all:'📊', MDT:'🏪', Amazon:'📦', Online:'💻', Booth:'🎪' };
  var CH_COLORS = { all:'#4f46e5', MDT:'#ea580c', Amazon:'#2563eb', Online:'#7c3aed', Booth:'#16a34a' };
  var tab = 'all';

  if (typeof QUALITY_RAW === 'undefined' || !QUALITY_RAW.length) {
    return '<div class="card" style="padding:40px;text-align:center;color:var(--muted)">ไม่พบข้อมูลคุณภาพสินค้า</div>';
  }

  // ── Aggregate from QUALITY_RAW ──
  var pMonths = _mtPeriod.months;
  var byChannel = {};
  var byMonthAll = [];
  for (var ki = 0; ki < CH_KEYS.length; ki++) byChannel[CH_KEYS[ki]] = { count: 0, cost: 0, byType: {}, byMonth: [] };

  for (var ri = 0; ri < QUALITY_RAW.length; ri++) {
    var r = QUALITY_RAW[ri];
    var ceYear = r.year - 543;
    var inFilter = true;
    if (_mtPeriod.year && ceYear !== _mtPeriod.year) inFilter = false;
    if (inFilter && pMonths && pMonths.indexOf(r.month - 1) === -1) inFilter = false;
    if (!inFilter) continue;

    var monthEntry = { year: r.year, month: r.month, total: r.totalCount, totalCost: r.totalCost };
    var chDataKeys = ['MDT','Amazon','Online','Booth'];
    for (var ci = 0; ci < chDataKeys.length; ci++) {
      var ck = chDataKeys[ci];
      var cnt = r.channels[ck] || 0;
      var cst = r.channelCost ? (r.channelCost[ck] || 0) : 0;
      byChannel[ck].count += cnt;
      byChannel[ck].cost += cst;
      byChannel.all.count += cnt;
      byChannel.all.cost += cst;
      monthEntry[ck] = cnt;
      monthEntry[ck + 'Cost'] = cst;

      var ratio = r.totalCount > 0 ? (cnt / r.totalCount) : 0;
      var typeKeys = Object.keys(r.types);
      for (var ti = 0; ti < typeKeys.length; ti++) {
        var tk = typeKeys[ti];
        if (!byChannel[ck].byType[tk]) byChannel[ck].byType[tk] = 0;
        if (!byChannel.all.byType[tk]) byChannel.all.byType[tk] = 0;
        var v = Math.round(r.types[tk] * ratio);
        byChannel[ck].byType[tk] += v;
        byChannel.all.byType[tk] += v;
      }
    }
    byMonthAll.push(monthEntry);
  }

  // Store month data per channel
  for (var bmi = 0; bmi < byMonthAll.length; bmi++) {
    var me = byMonthAll[bmi];
    byChannel.all.byMonth.push({ year: me.year, month: me.month, count: me.total, cost: me.totalCost });
    for (var ci2 = 0; ci2 < chDataKeys.length; ci2++) {
      var ck2 = chDataKeys[ci2];
      byChannel[ck2].byMonth.push({ year: me.year, month: me.month, count: me[ck2], cost: me[ck2 + 'Cost'] });
    }
  }

  // CAPA counts
  var openCases = 0, closedCases = 0;
  if (typeof QUALITY_DATA !== 'undefined' && QUALITY_DATA.capa) {
    for (var cp0 = 0; cp0 < QUALITY_DATA.capa.length; cp0++) {
      if (QUALITY_DATA.capa[cp0].status === 'done') closedCases++;
      else openCases++;
    }
  }

  // Current tab data
  var cur = byChannel[tab] || byChannel.all;
  var curName = CH_NAMES[tab] || 'ทุกช่องทาง';
  var curColor = CH_COLORS[tab] || '#4f46e5';
  var curAvg = cur.byMonth.length > 0 ? Math.round(cur.count / cur.byMonth.length) : 0;

  var html = '';

  // Header
  html += '<div class="card" style="background:linear-gradient(135deg,' + curColor + ',' + _mtBiLighten(curColor) + ');color:#fff;padding:24px 28px;margin-bottom:18px;border-radius:14px">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
  html += '<div><div style="font-size:20px;font-weight:800">⚠️ เคลม / ข้อร้องเรียน</div>';
  html += '<div style="font-size:13px;opacity:.85;margin-top:4px">' + curName + ' — ข้อมูลจากระบบคุณภาพสินค้า</div></div>';
  html += '<div style="background:rgba(255,255,255,.2);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700">' + curName + '</div>';
  html += '</div></div>';

  // KPI Cards
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">';
  html += '<div class="card" style="text-align:center;padding:16px;border-top:3px solid ' + curColor + '"><div style="font-size:11px;color:var(--muted)">📋 เคสทั้งหมด</div><div style="font-size:22px;font-weight:800;color:' + curColor + '">' + cur.count.toLocaleString('th-TH') + '</div><div style="font-size:11px;color:var(--muted)">ชิ้น</div></div>';
  html += '<div class="card" style="text-align:center;padding:16px;border-top:3px solid #dc2626"><div style="font-size:11px;color:var(--muted)">💰 มูลค่าเคลม</div><div style="font-size:22px;font-weight:800;color:#dc2626">' + Math.round(cur.cost).toLocaleString('th-TH') + '</div><div style="font-size:11px;color:var(--muted)">บาท</div></div>';
  html += '<div class="card" style="text-align:center;padding:16px;border-top:3px solid #d97706"><div style="font-size:11px;color:var(--muted)">📊 เฉลี่ย/เดือน</div><div style="font-size:22px;font-weight:800;color:#d97706">' + curAvg.toLocaleString('th-TH') + '</div><div style="font-size:11px;color:var(--muted)">ชิ้น</div></div>';
  html += '<div class="card" style="text-align:center;padding:16px;border-top:3px solid #16a34a"><div style="font-size:11px;color:var(--muted)">⏳ CAPA เปิด/ปิด</div><div style="font-size:22px;font-weight:800;color:#16a34a">' + openCases + ' / ' + closedCases + '</div><div style="font-size:11px;color:var(--muted)">เคส</div></div>';
  html += '</div>';

  // ── เปรียบเทียบทุกช่องทาง (show on 'all' tab) ──
  if (tab === 'all') {
    html += '<div class="card" style="margin-bottom:16px">';
    html += '<div class="card-title">📊 เปรียบเทียบทุกช่องทาง</div>';
    html += '<div class="table-wrap"><table><thead><tr><th>ช่องทาง</th><th style="text-align:right">จำนวน (ชิ้น)</th><th style="text-align:right">มูลค่า (บาท)</th><th style="text-align:right">สัดส่วน</th><th>กราฟ</th></tr></thead><tbody>';
    var chDataOrder = ['MDT','Amazon','Online','Booth'];
    var allTotal = byChannel.all.count || 1;
    for (var ac = 0; ac < chDataOrder.length; ac++) {
      var ack = chDataOrder[ac];
      var acd = byChannel[ack];
      var acPct = ((acd.count / allTotal) * 100).toFixed(1);
      var acBar = Math.round((acd.count / allTotal) * 100);
      html += '<tr style="cursor:pointer" onclick="_claimSelectTab(\'' + ack + '\')">';
      html += '<td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + CH_COLORS[ack] + ';margin-right:6px"></span>' + CH_NAMES[ack] + '</td>';
      html += '<td style="text-align:right">' + acd.count.toLocaleString('th-TH') + '</td>';
      html += '<td style="text-align:right">' + Math.round(acd.cost).toLocaleString('th-TH') + '</td>';
      html += '<td style="text-align:right">' + acPct + '%</td>';
      html += '<td style="width:120px"><div style="background:var(--hover);border-radius:4px;height:10px;overflow:hidden"><div style="width:' + acBar + '%;height:100%;background:' + CH_COLORS[ack] + ';border-radius:4px"></div></div></td>';
      html += '</tr>';
    }
    html += '</tbody></table></div></div>';
  }

  // ── ประเภทปัญหา ──
  var typeArr = [];
  var curTypeKeys = Object.keys(cur.byType);
  for (var t2 = 0; t2 < curTypeKeys.length; t2++) typeArr.push({ type: curTypeKeys[t2], count: cur.byType[curTypeKeys[t2]] });
  typeArr.sort(function(a, b) { return b.count - a.count; });

  html += '<div class="card" style="margin-bottom:16px">';
  html += '<div class="card-title">📋 ประเภทปัญหา — ' + curName + '</div>';
  if (typeArr.length === 0 || cur.count === 0) {
    html += '<div style="color:var(--muted);text-align:center;padding:20px">ไม่มีข้อมูล</div>';
  } else {
    var maxTC = typeArr[0].count || 1;
    var barColors = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6'];
    for (var t3 = 0; t3 < typeArr.length; t3++) {
      if (typeArr[t3].count === 0) continue;
      var pctT = ((typeArr[t3].count / cur.count) * 100).toFixed(1);
      var barWT = Math.round((typeArr[t3].count / maxTC) * 100);
      html += '<div style="margin-bottom:10px">';
      html += '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px"><span>' + typeArr[t3].type + '</span><span style="font-weight:700">' + typeArr[t3].count.toLocaleString('th-TH') + ' (' + pctT + '%)</span></div>';
      html += '<div style="background:var(--hover);border-radius:6px;height:14px;overflow:hidden"><div style="width:' + barWT + '%;height:100%;background:' + barColors[t3 % 5] + ';border-radius:6px;transition:width .3s"></div></div>';
      html += '</div>';
    }
  }
  html += '</div>';

  // ── Trend chart ──
  html += '<div class="card" style="margin-bottom:16px">';
  html += '<div class="card-title">📈 แนวโน้มเคลมรายเดือน — ' + curName + '</div>';
  html += '<div style="position:relative;height:280px"><canvas id="claimTrendChart"></canvas></div>';
  html += '</div>';

  // ── ตาราง CAPA ──
  if (typeof QUALITY_DATA !== 'undefined' && QUALITY_DATA.capa && QUALITY_DATA.capa.length) {
    html += '<div class="card" style="margin-bottom:16px">';
    html += '<div class="card-title">🔧 CAPA — การแก้ไข/ป้องกัน</div>';
    html += '<div class="table-wrap"><table><thead><tr><th>วันที่</th><th>ผู้รับผิดชอบ</th><th>สาเหตุ</th><th>มาตรการ</th><th>สถานะ</th></tr></thead><tbody>';
    for (var cp = 0; cp < QUALITY_DATA.capa.length; cp++) {
      var c = QUALITY_DATA.capa[cp];
      var stColor = c.status === 'done' ? '#16a34a' : (c.status === 'inprogress' ? '#d97706' : '#dc2626');
      var stLabel = c.status === 'done' ? '✅ เสร็จแล้ว' : (c.status === 'inprogress' ? '⏳ กำลังดำเนินการ' : '🔴 รอดำเนินการ');
      html += '<tr>';
      html += '<td style="white-space:nowrap;font-size:12px">' + c.date + '</td>';
      html += '<td style="font-size:12px">' + c.owner + '</td>';
      html += '<td style="font-size:12px;max-width:200px">' + c.cause + '</td>';
      html += '<td style="font-size:12px;max-width:250px">' + c.action + '</td>';
      html += '<td style="font-size:12px;color:' + stColor + ';font-weight:700;white-space:nowrap">' + stLabel + '</td>';
      html += '</tr>';
    }
    html += '</tbody></table></div></div>';
  }

  // ── ตารางรายเดือน ──
  html += '<div class="card" style="margin-bottom:16px">';
  html += '<div class="card-title">📋 สรุปเคลมรายเดือน — ' + curName + '</div>';
  if (tab === 'all') {
    html += '<div class="table-wrap"><table><thead><tr><th>เดือน</th><th style="text-align:right">MDT</th><th style="text-align:right">Amazon</th><th style="text-align:right">Online</th><th style="text-align:right">Booth</th><th style="text-align:right;font-weight:800">รวม</th><th style="text-align:right">มูลค่า (บาท)</th></tr></thead><tbody>';
    var sumC = { MDT:0, Amazon:0, Online:0, Booth:0, total:0, cost:0 };
    for (var bm = 0; bm < byMonthAll.length; bm++) {
      var me2 = byMonthAll[bm];
      var lbl = MONTHS_TH[me2.month - 1] + (me2.year - 543);
      html += '<tr>';
      html += '<td>' + lbl + '</td>';
      html += '<td style="text-align:right">' + (me2.MDT || 0).toLocaleString('th-TH') + '</td>';
      html += '<td style="text-align:right">' + (me2.Amazon || 0).toLocaleString('th-TH') + '</td>';
      html += '<td style="text-align:right">' + (me2.Online || 0).toLocaleString('th-TH') + '</td>';
      html += '<td style="text-align:right">' + (me2.Booth || 0).toLocaleString('th-TH') + '</td>';
      html += '<td style="text-align:right;font-weight:700">' + me2.total.toLocaleString('th-TH') + '</td>';
      html += '<td style="text-align:right">' + Math.round(me2.totalCost).toLocaleString('th-TH') + '</td>';
      html += '</tr>';
      sumC.MDT += (me2.MDT || 0); sumC.Amazon += (me2.Amazon || 0); sumC.Online += (me2.Online || 0); sumC.Booth += (me2.Booth || 0); sumC.total += me2.total; sumC.cost += me2.totalCost;
    }
    html += '<tr style="font-weight:800;background:var(--hover)"><td>รวม</td>';
    html += '<td style="text-align:right">' + sumC.MDT.toLocaleString('th-TH') + '</td>';
    html += '<td style="text-align:right">' + sumC.Amazon.toLocaleString('th-TH') + '</td>';
    html += '<td style="text-align:right">' + sumC.Online.toLocaleString('th-TH') + '</td>';
    html += '<td style="text-align:right">' + sumC.Booth.toLocaleString('th-TH') + '</td>';
    html += '<td style="text-align:right">' + sumC.total.toLocaleString('th-TH') + '</td>';
    html += '<td style="text-align:right">' + Math.round(sumC.cost).toLocaleString('th-TH') + '</td>';
    html += '</tr>';
  } else {
    html += '<div class="table-wrap"><table><thead><tr><th>เดือน</th><th style="text-align:right">จำนวน (ชิ้น)</th><th style="text-align:right">มูลค่า (บาท)</th><th style="text-align:right">สัดส่วนจากรวม</th></tr></thead><tbody>';
    var sumSingle = 0, sumSingleCost = 0, sumSingleTotal = 0;
    for (var bm2 = 0; bm2 < cur.byMonth.length; bm2++) {
      var m2 = cur.byMonth[bm2];
      var allM = byChannel.all.byMonth[bm2];
      var lbl2 = MONTHS_TH[m2.month - 1] + (m2.year - 543);
      var pctM = allM && allM.count > 0 ? ((m2.count / allM.count) * 100).toFixed(1) : '0.0';
      sumSingle += m2.count; sumSingleCost += m2.cost; sumSingleTotal += (allM ? allM.count : 0);
      html += '<tr>';
      html += '<td>' + lbl2 + '</td>';
      html += '<td style="text-align:right">' + m2.count.toLocaleString('th-TH') + '</td>';
      html += '<td style="text-align:right">' + Math.round(m2.cost).toLocaleString('th-TH') + '</td>';
      html += '<td style="text-align:right">' + pctM + '%</td>';
      html += '</tr>';
    }
    var sumSPct = sumSingleTotal > 0 ? ((sumSingle / sumSingleTotal) * 100).toFixed(1) : '0.0';
    html += '<tr style="font-weight:800;background:var(--hover)"><td>รวม</td>';
    html += '<td style="text-align:right">' + sumSingle.toLocaleString('th-TH') + '</td>';
    html += '<td style="text-align:right">' + Math.round(sumSingleCost).toLocaleString('th-TH') + '</td>';
    html += '<td style="text-align:right">' + sumSPct + '%</td>';
    html += '</tr>';
  }
  html += '</tbody></table></div></div>';

  // ── Source note ──
  html += '<div style="text-align:center;font-size:11px;color:var(--muted);margin-top:8px">📎 ข้อมูลดึงจากระบบคุณภาพสินค้า (ฝ่ายขาย-การตลาด) อัตโนมัติ — เมื่อข้อมูลคุณภาพเปลี่ยน หน้านี้จะอัพเดทตาม</div>';

  // ── Chart ──
  var chartMonths = cur.byMonth;
  setTimeout(function() {
    var canvas = document.getElementById('claimTrendChart');
    if (!canvas || typeof Chart === 'undefined') return;
    var ctx = canvas.getContext('2d');
    var labels = [], curData = [];
    for (var ci3 = 0; ci3 < chartMonths.length; ci3++) {
      labels.push(MONTHS_TH[chartMonths[ci3].month - 1] + (chartMonths[ci3].year - 543));
      curData.push(chartMonths[ci3].count);
    }
    var datasets = [{ label: curName + ' (ชิ้น)', data: curData, backgroundColor: curColor + 'b3', borderRadius: 4, order: 1 }];
    if (tab !== 'all') {
      var allData = [];
      for (var ci4 = 0; ci4 < byChannel.all.byMonth.length; ci4++) allData.push(byChannel.all.byMonth[ci4].count);
      datasets.push({ label: 'รวมทุกช่อง', data: allData, type: 'line', borderColor: '#6366f1', backgroundColor: 'transparent', pointRadius: 3, tension: 0.3, order: 0 });
    } else {
      var chDataSets = ['MDT','Amazon','Online','Booth'];
      for (var ds = 0; ds < chDataSets.length; ds++) {
        var dsk = chDataSets[ds];
        var dsData = [];
        for (var ci5 = 0; ci5 < byChannel[dsk].byMonth.length; ci5++) dsData.push(byChannel[dsk].byMonth[ci5].count);
        datasets.push({ label: CH_NAMES[dsk], data: dsData, type: 'line', borderColor: CH_COLORS[dsk], backgroundColor: 'transparent', pointRadius: 3, tension: 0.3, borderWidth: 2 });
      }
      datasets.shift();
    }
    new Chart(ctx, {
      type: 'bar',
      data: { labels: labels, datasets: datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } },
        scales: { y: { beginAtZero: true, ticks: { font: { size: 11 } } }, x: { ticks: { font: { size: 10 }, maxRotation: 45 } } }
      }
    });
  }, 200);

  return html;
}

function _mtBiGoChannel(chKey,menuKey){
  var tab=document.querySelector('[onclick*="mtClickChannel(this,\''+chKey+'\')"]');
  if(tab) mtClickChannel(tab,chKey);
  if(menuKey) mtBiSelectMenu(menuKey);
}

// ── Render Customer All Channels ──
function _mtBiRenderCustomerAll(){
  var channels=[
    {key:'CJ',label:'CJ MORE',color:'#ea580c',icon:'🏪',getBranches:function(){return typeof CJ_BRANCHES!=='undefined'?CJ_BRANCHES:[];}},
    {key:'BigC',label:'Big C',color:'#e53e3e',icon:'🛒',getBranches:function(){return typeof BIGC_BRANCHES!=='undefined'?BIGC_BRANCHES:[];}},
    {key:'Top',label:'Tops',color:'#16a34a',icon:'🏷',getBranches:function(){return typeof TOPS_BRANCHES!=='undefined'?TOPS_BRANCHES:[];}},
    {key:'TheMall',label:'The Mall Group',color:'#d97706',icon:'🏢',getBranches:function(){return typeof MALL_BRANCHES!=='undefined'?MALL_BRANCHES:[];}},
    {key:'Makro',label:'Makro',color:'#0ea5e9',icon:'📦',getBranches:function(){return typeof MAKRO_BRANCHES!=='undefined'?MAKRO_BRANCHES:[];}},
    {key:'Aeon',label:'Aeon (MaxValu)',color:'#e11d48',icon:'🛍',getBranches:function(){return typeof AEON_BRANCHES!=='undefined'?AEON_BRANCHES:[];}}
  ];

  var totalBranches=0;
  var allProvinces={};
  var chStats=[];
  channels.forEach(function(ch){
    var br=ch.getBranches();
    var provSet={};
    var isCJ=ch.key==='CJ';
    br.forEach(function(b){
      var prov=isCJ?b[6]:b[6];
      if(prov) provSet[prov]=(provSet[prov]||0)+1;
    });
    var provCount=Object.keys(provSet).length;
    Object.keys(provSet).forEach(function(p){allProvinces[p]=(allProvinces[p]||0)+provSet[p];});
    totalBranches+=br.length;
    chStats.push({key:ch.key,label:ch.label,color:ch.color,icon:ch.icon,count:br.length,provinces:provCount,provData:provSet});
  });

  var totalProvs=Object.keys(allProvinces).length;
  var html='';

  // Header
  html+='<div class="card" style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:24px 28px;margin-bottom:18px;border-radius:14px">';
  html+='<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
  html+='<div><div style="font-size:20px;font-weight:800">👥 จัดการลูกค้า — ทุกช่องทาง</div>';
  html+='<div style="font-size:13px;opacity:.85;margin-top:4px">สรุปข้อมูลลูกค้าและสาขาจากทุกช่องทางค้าปลีก</div></div>';
  html+='<div style="background:rgba(255,255,255,.2);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700">ทุกช่องทาง</div>';
  html+='</div></div>';

  // KPI Cards
  html+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:18px">';
  var kpis=[
    {icon:'🏪',label:'ช่องทางทั้งหมด',value:channels.length+' ช่องทาง',color:'#4f46e5'},
    {icon:'🏢',label:'สาขาทั้งหมด',value:totalBranches.toLocaleString()+' สาขา',color:'#10b981'},
    {icon:'🗺️',label:'จังหวัดที่ครอบคลุม',value:totalProvs+' จังหวัด',color:'#f59e0b'},
    {icon:'📊',label:'เฉลี่ย/ช่องทาง',value:Math.round(totalBranches/channels.length)+' สาขา',color:'#ef4444'}
  ];
  kpis.forEach(function(k){
    html+='<div class="card" style="padding:18px;border-radius:12px;border-left:4px solid '+k.color+'">';
    html+='<div style="font-size:12px;color:var(--muted)">'+k.icon+' '+k.label+'</div>';
    html+='<div style="font-size:22px;font-weight:800;margin-top:6px;color:'+k.color+'">'+k.value+'</div>';
    html+='</div>';
  });
  html+='</div>';

  // Channel Breakdown Cards
  html+='<div class="card" style="padding:20px;border-radius:12px;margin-bottom:18px">';
  html+='<div style="font-weight:700;margin-bottom:14px">📊 จำนวนสาขาแต่ละช่องทาง</div>';
  var maxCount=0;
  chStats.forEach(function(s){if(s.count>maxCount)maxCount=s.count;});
  chStats.sort(function(a,b){return b.count-a.count;});
  chStats.forEach(function(s){
    var pct=maxCount>0?Math.round(s.count/maxCount*100):0;
    html+='<div style="margin-bottom:12px">';
    html+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">';
    html+='<span style="font-size:13px;font-weight:600">'+s.icon+' '+s.label+'</span>';
    html+='<span style="font-size:13px;font-weight:700;color:'+s.color+'">'+s.count.toLocaleString()+' สาขา <span style="font-size:11px;color:var(--muted);font-weight:400">('+s.provinces+' จังหวัด)</span></span>';
    html+='</div>';
    html+='<div style="height:22px;background:var(--border-color,#e5e7eb);border-radius:11px;overflow:hidden">';
    html+='<div style="height:100%;width:'+pct+'%;background:'+s.color+';border-radius:11px;transition:width .6s;display:flex;align-items:center;justify-content:flex-end;padding-right:8px">';
    if(pct>15) html+='<span style="font-size:10px;color:#fff;font-weight:700">'+Math.round(s.count/totalBranches*100)+'%</span>';
    html+='</div></div></div>';
  });
  html+='</div>';

  // Channel Detail Cards Grid
  html+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;margin-bottom:18px">';
  chStats.forEach(function(s){
    html+='<div class="card" style="padding:18px;border-radius:12px;border-top:3px solid '+s.color+';cursor:pointer" onclick="_mtBiGoChannel(\''+s.key+'\',\'customer-mgmt\')">';
    html+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">';
    html+='<span style="font-size:28px">'+s.icon+'</span>';
    html+='<div><div style="font-weight:700;font-size:15px">'+s.label+'</div>';
    html+='<div style="font-size:12px;color:var(--muted)">'+s.count.toLocaleString()+' สาขา</div></div>';
    html+='<div style="margin-left:auto;text-align:right"><div style="font-size:20px;font-weight:800;color:'+s.color+'">'+s.provinces+'</div>';
    html+='<div style="font-size:11px;color:var(--muted)">จังหวัด</div></div>';
    html+='</div>';

    // Top 5 provinces for this channel
    var provArr=[];
    Object.keys(s.provData).forEach(function(p){provArr.push({name:p,count:s.provData[p]});});
    provArr.sort(function(a,b){return b.count-a.count;});
    var top5=provArr.slice(0,5);
    html+='<div style="font-size:11px;color:var(--muted);margin-bottom:6px">จังหวัดหลัก:</div>';
    html+='<div style="display:flex;flex-wrap:wrap;gap:4px">';
    top5.forEach(function(p){
      html+='<span style="background:'+s.color+'15;color:'+s.color+';padding:3px 8px;border-radius:10px;font-size:11px;font-weight:600">'+p.name+' ('+p.count+')</span>';
    });
    if(provArr.length>5) html+='<span style="color:var(--muted);font-size:11px;padding:3px 4px">+อีก '+(provArr.length-5)+' จังหวัด</span>';
    html+='</div>';
    html+='<div style="margin-top:10px;text-align:right;font-size:11px;color:'+s.color+';font-weight:600">ดูแผนที่สาขา →</div>';
    html+='</div>';
  });
  html+='</div>';

  // Province Summary Table
  var provArr=[];
  Object.keys(allProvinces).forEach(function(p){provArr.push({name:p,count:allProvinces[p]});});
  provArr.sort(function(a,b){return b.count-a.count;});

  html+='<div class="card" style="padding:20px;border-radius:12px;margin-bottom:18px">';
  html+='<div style="font-weight:700;margin-bottom:14px">🗺️ สรุปจังหวัดที่ครอบคลุม (Top 20)</div>';
  html+='<div style="overflow-x:auto">';
  html+='<table style="width:100%;border-collapse:collapse;font-size:13px">';
  html+='<thead><tr style="background:var(--bg,#f9fafb);border-bottom:2px solid var(--border-color,#e5e7eb)">';
  ['#','จังหวัด','จำนวนสาขารวม','สัดส่วน'].forEach(function(h){
    html+='<th style="padding:10px 12px;text-align:left;font-weight:700">'+h+'</th>';
  });
  html+='</tr></thead><tbody>';
  var top20=provArr.slice(0,20);
  top20.forEach(function(p,i){
    var pct=(p.count/totalBranches*100).toFixed(1);
    var barW=Math.min(100,Math.round(p.count/top20[0].count*100));
    var rowBg=i%2===0?'':'background:var(--bg,#f9fafb)';
    html+='<tr style="border-bottom:1px solid var(--border-color,#e5e7eb);'+rowBg+'">';
    html+='<td style="padding:8px 12px;color:var(--muted)">'+(i+1)+'</td>';
    html+='<td style="padding:8px 12px;font-weight:600">'+_stripBrand(p.name)+'</td>';
    html+='<td style="padding:8px 12px"><div style="display:flex;align-items:center;gap:8px"><span style="font-weight:700;min-width:40px">'+p.count+'</span>';
    html+='<div style="flex:1;height:14px;background:var(--border-color,#e5e7eb);border-radius:7px;overflow:hidden;max-width:200px">';
    html+='<div style="height:100%;width:'+barW+'%;background:linear-gradient(90deg,#4f46e5,#7c3aed);border-radius:7px"></div>';
    html+='</div></div></td>';
    html+='<td style="padding:8px 12px;color:var(--muted)">'+pct+'%</td>';
    html+='</tr>';
  });
  if(provArr.length>20){
    var restCount=0;
    provArr.slice(20).forEach(function(p){restCount+=p.count;});
    html+='<tr style="border-top:2px solid var(--border-color,#e5e7eb);color:var(--muted)">';
    html+='<td style="padding:8px 12px">—</td>';
    html+='<td style="padding:8px 12px">อื่นๆ ('+(provArr.length-20)+' จังหวัด)</td>';
    html+='<td style="padding:8px 12px;font-weight:600">'+restCount+'</td>';
    html+='<td style="padding:8px 12px">'+(restCount/totalBranches*100).toFixed(1)+'%</td>';
    html+='</tr>';
  }
  html+='</tbody></table></div></div>';

  // Channel comparison table
  html+='<div class="card" style="padding:20px;border-radius:12px">';
  html+='<div style="font-weight:700;margin-bottom:14px">📋 เปรียบเทียบช่องทาง</div>';
  html+='<div style="overflow-x:auto">';
  html+='<table style="width:100%;border-collapse:collapse;font-size:13px">';
  html+='<thead><tr style="background:var(--bg,#f9fafb);border-bottom:2px solid var(--border-color,#e5e7eb)">';
  ['ช่องทาง','สาขา','จังหวัด','สัดส่วน','ดูรายละเอียด'].forEach(function(h){
    html+='<th style="padding:10px 12px;text-align:left;font-weight:700;white-space:nowrap">'+h+'</th>';
  });
  html+='</tr></thead><tbody>';
  chStats.forEach(function(s,i){
    var pct=(s.count/totalBranches*100).toFixed(1);
    var rowBg=i%2===0?'':'background:var(--bg,#f9fafb)';
    html+='<tr style="border-bottom:1px solid var(--border-color,#e5e7eb);'+rowBg+'">';
    html+='<td style="padding:10px 12px;font-weight:700">'+s.icon+' '+s.label+'</td>';
    html+='<td style="padding:10px 12px;font-weight:700;color:'+s.color+'">'+s.count.toLocaleString()+'</td>';
    html+='<td style="padding:10px 12px">'+s.provinces+'</td>';
    html+='<td style="padding:10px 12px">'+pct+'%</td>';
    html+='<td style="padding:10px 12px"><span style="color:'+s.color+';cursor:pointer;font-weight:600" onclick="_mtBiGoChannel(\''+s.key+'\',\'customer-mgmt\')">ดูแผนที่ →</span></td>';
    html+='</tr>';
  });
  // Total row
  html+='<tr style="border-top:2px solid var(--border-color,#e5e7eb);font-weight:700;background:rgba(79,70,229,.05)">';
  html+='<td style="padding:10px 12px">รวมทั้งหมด</td>';
  html+='<td style="padding:10px 12px;color:#4f46e5">'+totalBranches.toLocaleString()+'</td>';
  html+='<td style="padding:10px 12px">'+totalProvs+'</td>';
  html+='<td style="padding:10px 12px">100%</td>';
  html+='<td style="padding:10px 12px"></td>';
  html+='</tr>';
  html+='</tbody></table></div></div>';

  return html;
}

// ── Render Branch Map (ลูกค้า / จัดการสาขา) ──
var _cjMapInstance=null;
var BIGC_TYPE_NAMES={1:'บิ๊กซี',3:'บิ๊กซี มาร์เก็ต',4:'บิ๊กซี ฟู๊ดเพลส',5:'บิ๊กซีมินิ',6:'ร้านยาเพรียว',7:'บิ๊กซี ดีโป้'};
var BIGC_TYPE_COLORS={1:'#e53e3e',3:'#dd6b20',4:'#d69e2e',5:'#38a169',6:'#3182ce',7:'#805ad5'};
var TOPS_TYPE_NAMES={1:'Tops',2:'Tops Daily',3:'Tops Food Hall',4:'Tops Wine Cellar'};
var TOPS_TYPE_COLORS={1:'#16a34a',2:'#0891b2',3:'#9333ea',4:'#b91c1c'};
var MALL_TYPE_NAMES={1:'The Mall',2:'Emporium',3:'EmQuartier',4:'Emsphere',5:'Paragon'};
var MALL_TYPE_COLORS={1:'#d97706',2:'#7c3aed',3:'#0d9488',4:'#e11d48',5:'#2563eb'};
var MAKRO_TYPE_NAMES={1:'Makro',2:'Makro Food Service'};
var MAKRO_TYPE_COLORS={1:'#0ea5e9',2:'#f97316'};
var AEON_TYPE_NAMES={1:'MaxValu',2:'MaxValu Tanjai'};
var AEON_TYPE_COLORS={1:'#e11d48',2:'#8b5cf6'};

function _mtBiGetBranches(){
  if(_mtCh==='BigC') return typeof BIGC_BRANCHES!=='undefined'?BIGC_BRANCHES:[];
  if(_mtCh==='Top') return typeof TOPS_BRANCHES!=='undefined'?TOPS_BRANCHES:[];
  if(_mtCh==='TheMall') return typeof MALL_BRANCHES!=='undefined'?MALL_BRANCHES:[];
  if(_mtCh==='Makro') return typeof MAKRO_BRANCHES!=='undefined'?MAKRO_BRANCHES:[];
  if(_mtCh==='Aeon') return typeof AEON_BRANCHES!=='undefined'?AEON_BRANCHES:[];
  return typeof CJ_BRANCHES!=='undefined'?CJ_BRANCHES:[];
}
function _mtBiIsBigC(){ return _mtCh==='BigC'; }
function _mtBiIsTops(){ return _mtCh==='Top'; }
function _mtBiIsMall(){ return _mtCh==='TheMall'; }
function _mtBiIsMakro(){ return _mtCh==='Makro'; }
function _mtBiIsAeon(){ return _mtCh==='Aeon'; }
function _mtBiHasTypes(){ return _mtCh==='BigC'||_mtCh==='Top'||_mtCh==='TheMall'||_mtCh==='Makro'||_mtCh==='Aeon'; }

// ── MM Mega Market Customer Page ──
function _mtBiRenderMMCustomer(){
  var color='#16a34a';
  var tgtYear=_mtPeriod.year||2026;
  var TGT=getTargetByYear(tgtYear);
  var target=(TGT&&TGT.mt&&TGT.mt.MM)?TGT.mt.MM:null;
  var actual=_mtBiChannelActualByYear('MM',tgtYear);
  var prods=(typeof MT_DATA!=='undefined'&&MT_DATA.ch&&MT_DATA.ch.MM)?MT_DATA.ch.MM:[];

  var MONTHS_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var MONTHS_TH=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  var dataMonths=0;
  for(var dm=11;dm>=0;dm--){if(actual.months[MONTHS_EN[dm]]>0){dataMonths=dm+1;break;}}
  var totalActual=actual.total;
  var totalTarget=target?target.total:0;
  var achievePct=totalTarget>0?(totalActual/totalTarget*100):0;

  var html='';
  html+='<div style="margin-bottom:12px"><button onclick="_mtBiGoChannel(\'All\',\'customer-mgmt\')" style="background:none;border:1px solid var(--border,#e2e8f0);padding:6px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-family:inherit;color:var(--text,#334155);font-weight:600">← กลับหน้าลูกค้าหลัก</button></div>';

  // Header
  html+='<div class="card" style="background:linear-gradient(135deg,'+color+',#22c55e);color:#fff;padding:24px 28px;margin-bottom:18px;border-radius:14px">';
  html+='<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
  html+='<div><div style="font-size:20px;font-weight:800">👥 ข้อมูลลูกค้า — MM Mega Market</div>';
  html+='<div style="font-size:13px;opacity:.85;margin-top:4px">MM Mega Market Vietnam (MMVN) — ปี '+(tgtYear+543)+'</div></div>';
  html+='<div style="background:rgba(255,255,255,.2);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700">MM Mega</div>';
  html+='</div></div>';

  // Company Info + Registration Card
  var _mmComp=MT_COMPANY_INFO.MM;
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">';

  html+='<div class="card" style="padding:20px;border-radius:12px;border-left:4px solid '+color+'">';
  html+='<div style="font-size:16px;font-weight:700;margin-bottom:12px;color:'+color+'">🏢 ข้อมูลบริษัท</div>';
  html+='<table style="width:100%;font-size:13px;border-collapse:collapse">';
  html+='<tr><td style="padding:6px 0;color:var(--muted);width:130px">ชื่อบริษัท</td><td style="padding:6px 0;font-weight:600">'+_mmComp.nameTH+'</td></tr>';
  html+='<tr><td style="padding:6px 0;color:var(--muted)">ชื่อ (EN)</td><td style="padding:6px 0">'+_mmComp.nameEN+'</td></tr>';
  html+='<tr><td style="padding:6px 0;color:var(--muted)">ประเภท</td><td style="padding:6px 0">'+_mmComp.type+'</td></tr>';
  html+='<tr><td style="padding:6px 0;color:var(--muted)">ประเทศ</td><td style="padding:6px 0">'+_mmComp.country+'</td></tr>';
  html+='<tr><td style="padding:6px 0;color:var(--muted)">จุดเด่น</td><td style="padding:6px 0">'+_mmComp.desc+'</td></tr>';
  html+='<tr><td style="padding:6px 0;color:var(--muted)">กลุ่มลูกค้า</td><td style="padding:6px 0">ร้านค้าปลีก, โรงแรม, ร้านอาหาร, สำนักงาน, โรงงาน</td></tr>';
  html+='<tr><td style="padding:6px 0;color:var(--muted)">เว็บไซต์</td><td style="padding:6px 0"><a href="'+_mmComp.website+'" target="_blank" style="color:#3b82f6;text-decoration:none;font-weight:600">🔗 '+_mmComp.webLabel+'</a></td></tr>';
  html+='</table></div>';

  html+='<div class="card" style="padding:20px;border-radius:12px;border-left:4px solid #f59e0b">';
  html+='<div style="font-size:16px;font-weight:700;margin-bottom:12px;color:#f59e0b">📋 ข้อมูลจดทะเบียน</div>';
  html+='<table style="width:100%;font-size:13px;border-collapse:collapse">';
  html+='<tr><td style="padding:6px 0;color:var(--muted);width:160px">เลขประจำตัวผู้เสียภาษี</td><td style="padding:6px 0;font-weight:700;font-size:15px;letter-spacing:1px">'+_mmComp.taxId+'</td></tr>';
  html+='<tr><td style="padding:6px 0;color:var(--muted)">ที่อยู่สำนักงานใหญ่</td><td style="padding:6px 0;line-height:1.5">'+_mmComp.address+'</td></tr>';
  html+='</table>';
  html+='<div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border,#e2e8f0)">';
  html+='<div style="font-size:14px;font-weight:700;margin-bottom:8px;color:#f59e0b">📊 สรุปยอดขาย ปี '+(tgtYear+543)+'</div>';
  html+='<table style="width:100%;font-size:13px;border-collapse:collapse">';
  html+='<tr><td style="padding:4px 0;color:var(--muted);width:120px">เป้าหมาย</td><td style="padding:4px 0;font-weight:600">'+fmtTargetM(totalTarget)+'</td></tr>';
  html+='<tr><td style="padding:4px 0;color:var(--muted)">ยอดจริง</td><td style="padding:4px 0;font-weight:600;color:'+(totalActual>=totalTarget?'#16a34a':'#dc2626')+'">'+fmtTargetM(totalActual)+'</td></tr>';
  html+='<tr><td style="padding:4px 0;color:var(--muted)">Achievement</td><td style="padding:4px 0"><span class="pill '+(achievePct>=80?'green':achievePct>=60?'yellow':'red')+'">'+achievePct.toFixed(1)+'%</span></td></tr>';
  html+='<tr><td style="padding:4px 0;color:var(--muted)">จำนวน SKU</td><td style="padding:4px 0;font-weight:600">'+prods.length+' รายการ</td></tr>';
  html+='<tr><td style="padding:4px 0;color:var(--muted)">เดือนที่มีข้อมูล</td><td style="padding:4px 0">'+dataMonths+' เดือน'+(dataMonths>0?' ('+MONTHS_TH[0]+' – '+MONTHS_TH[dataMonths-1]+')':'')+'</td></tr>';
  html+='</table></div></div>';

  html+='</div>';

  // Monthly chart + product table
  html+='<div class="card" style="margin-bottom:16px"><div class="card-title">📊 Target vs Actual รายเดือน (บาท)</div>';
  html+='<div style="position:relative;height:280px"><canvas id="mmCustChart"></canvas></div></div>';

  // Product table
  if(prods.length>0){
    html+='<div class="card" style="margin-bottom:16px">';
    html+='<div class="card-title">📦 รายการสินค้าที่ส่ง MM Mega Market ('+prods.length+' SKUs)</div>';
    html+='<div class="table-wrap"><table><thead><tr>';
    html+='<th>#</th><th>ชื่อสินค้า</th>';
    for(var mi=0;mi<dataMonths;mi++) html+='<th style="text-align:right">'+MONTHS_TH[mi]+'</th>';
    html+='<th style="text-align:right">รวม</th></tr></thead><tbody>';
    for(var pi=0;pi<prods.length;pi++){
      var p=prods[pi];
      var rowTotal=0;
      html+='<tr><td>'+(pi+1)+'</td><td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+_stripBrand((p.n||p.name)||'สินค้า '+(pi+1))+'</td>';
      for(var mi=0;mi<dataMonths;mi++){
        var val=(p.m&&p.m[MONTHS_EN[mi]])?p.m[MONTHS_EN[mi]].b||0:0;
        rowTotal+=val;
        html+='<td style="text-align:right">'+(val>0?Math.round(val).toLocaleString('th-TH'):'—')+'</td>';
      }
      html+='<td style="text-align:right;font-weight:600">'+(rowTotal>0?Math.round(rowTotal).toLocaleString('th-TH'):'—')+'</td></tr>';
    }
    html+='</tbody></table></div></div>';
  }

  // Source
  html+='<div style="text-align:center;padding:12px;color:var(--muted);font-size:11px">';
  html+='📄 ข้อมูลจาก SALES_DATA + Target '+tgtYear+'.xlsx | <a href="https://mmvietnam.com/en/" target="_blank" style="color:#3b82f6">mmvietnam.com</a></div>';

  // Chart init
  var _mmTgtArr=target?target.monthly.slice():[];
  var _mmActArr=[];
  for(var ai=0;ai<12;ai++) _mmActArr.push(actual.months[MONTHS_EN[ai]]||0);

  setTimeout(function(){
    var ctx=document.getElementById('mmCustChart');
    if(!ctx) return;
    new Chart(ctx.getContext('2d'),{
      type:'bar',
      data:{
        labels:MONTHS_TH,
        datasets:[
          {label:'Target',data:_mmTgtArr,backgroundColor:'rgba(22,163,74,0.2)',borderColor:'#16a34a',borderWidth:2,borderRadius:4,barPercentage:0.7},
          {label:'Actual',data:_mmActArr,backgroundColor:'#16a34a',borderColor:'#16a34a',borderWidth:0,borderRadius:4,barPercentage:0.7}
        ]
      },
      options:{
        responsive:true,maintainAspectRatio:false,
        plugins:{legend:{position:'top',labels:{font:{size:11},usePointStyle:true,pointStyle:'rect'}},
          tooltip:{callbacks:{label:function(c){return c.dataset.label+': '+Math.round(c.raw).toLocaleString('th-TH')+' ฿';}}}},
        scales:{y:{beginAtZero:true,ticks:{callback:function(v){return (v/1e6).toFixed(1)+'M';}}}}
      }
    });
  },120);

  return html;
}

function _mtBiRenderBranchMap(pageKey){
  var page=MT_BI_PAGES[pageKey];
  var ch=_mtCh==='All'?'ทุกช่องทาง':((typeof MT_CH_LABELS!=='undefined'&&MT_CH_LABELS[_mtCh])?MT_CH_LABELS[_mtCh]:(_mtCh||'CJ'));
  var color=_mtCh==='All'?'#4f46e5':((typeof MT_CH_COLORS!=='undefined'&&MT_CH_COLORS[_mtCh])?MT_CH_COLORS[_mtCh]:'#ea580c');
  var isBigC=_mtBiIsBigC();
  var isTops=_mtBiIsTops();
  var isMall=_mtBiIsMall();
  var isMakro=_mtBiIsMakro();
  var isAeon=_mtBiIsAeon();
  var hasTypes=_mtBiHasTypes();
  var branches=_mtBiGetBranches();
  var totalBranches=branches.length;
  var brandName=isBigC?'Big C':isTops?'Tops':isMall?'The Mall Group':isMakro?'Makro':isAeon?'Aeon (MaxValu)':'CJ MORE';
  var sourceUrl=isBigC?'corporate.bigc.co.th/callchatshop':isTops?'corporate.tops.co.th/store':isMall?'themallgroup.com/index.php/contact':isMakro?'makro.co.th/en/contact-us':isAeon?'aeonthailand.co.th/th/store-information/1':'cjmore.co.th/branch';
  var typeNames=isBigC?BIGC_TYPE_NAMES:isTops?TOPS_TYPE_NAMES:isMall?MALL_TYPE_NAMES:isMakro?MAKRO_TYPE_NAMES:isAeon?AEON_TYPE_NAMES:{};
  var typeColors=isBigC?BIGC_TYPE_COLORS:isTops?TOPS_TYPE_COLORS:isMall?MALL_TYPE_COLORS:isMakro?MAKRO_TYPE_COLORS:isAeon?AEON_TYPE_COLORS:{};

  var html='';
  html+='<div style="margin-bottom:12px"><button onclick="_mtBiGoChannel(\'All\',\'customer-mgmt\')" style="background:none;border:1px solid var(--border,#e2e8f0);padding:6px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-family:inherit;color:var(--text,#334155);font-weight:600">← กลับหน้าลูกค้าหลัก</button></div>';
  html+='<div class="card" style="background:linear-gradient(135deg,'+color+','+_mtBiLighten(color)+');color:#fff;padding:24px 28px;margin-bottom:18px;border-radius:14px">';
  html+='<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
  html+='<div><div style="font-size:20px;font-weight:800">'+(page?page.icon:'🏢')+' '+(page?page.title:'จัดการสาขา')+'</div>';
  html+='<div style="font-size:13px;opacity:.85;margin-top:4px">'+ch+' — สาขา '+brandName+' ทั่วประเทศ '+totalBranches.toLocaleString('th-TH')+' สาขา</div></div>';
  html+='<div style="background:rgba(255,255,255,.2);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700">'+ch+'</div>';
  html+='</div></div>';

  // Company Info Section
  var _compInfo=MT_COMPANY_INFO[_mtCh];
  if(_compInfo){
    html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">';
    html+='<div class="card" style="padding:20px;border-radius:12px;border-left:4px solid '+color+'">';
    html+='<div style="font-size:16px;font-weight:700;margin-bottom:12px;color:'+color+'">🏢 ข้อมูลบริษัท</div>';
    html+='<table style="width:100%;font-size:13px;border-collapse:collapse">';
    html+='<tr><td style="padding:6px 0;color:var(--muted);width:130px">ชื่อบริษัท (TH)</td><td style="padding:6px 0;font-weight:600">'+_compInfo.nameTH+'</td></tr>';
    html+='<tr><td style="padding:6px 0;color:var(--muted)">ชื่อบริษัท (EN)</td><td style="padding:6px 0">'+_compInfo.nameEN+'</td></tr>';
    html+='<tr><td style="padding:6px 0;color:var(--muted)">ประเภทธุรกิจ</td><td style="padding:6px 0">'+_compInfo.type+'</td></tr>';
    html+='<tr><td style="padding:6px 0;color:var(--muted)">ประเทศ</td><td style="padding:6px 0">'+_compInfo.country+'</td></tr>';
    html+='<tr><td style="padding:6px 0;color:var(--muted)">รายละเอียด</td><td style="padding:6px 0">'+_compInfo.desc+'</td></tr>';
    html+='<tr><td style="padding:6px 0;color:var(--muted)">เว็บไซต์</td><td style="padding:6px 0"><a href="'+_compInfo.website+'" target="_blank" style="color:#3b82f6;text-decoration:none;font-weight:600">🔗 '+_compInfo.webLabel+'</a></td></tr>';
    html+='</table></div>';

    html+='<div class="card" style="padding:20px;border-radius:12px;border-left:4px solid #f59e0b">';
    html+='<div style="font-size:16px;font-weight:700;margin-bottom:12px;color:#f59e0b">📋 ข้อมูลจดทะเบียน</div>';
    html+='<table style="width:100%;font-size:13px;border-collapse:collapse">';
    html+='<tr><td style="padding:6px 0;color:var(--muted);width:160px">เลขประจำตัวผู้เสียภาษี</td><td style="padding:6px 0;font-weight:700;font-size:15px;letter-spacing:1px">'+_compInfo.taxId+'</td></tr>';
    html+='<tr><td style="padding:6px 0;color:var(--muted)">ที่อยู่สำนักงานใหญ่</td><td style="padding:6px 0;line-height:1.5">'+_compInfo.address+'</td></tr>';
    html+='</table></div>';
    html+='</div>';
  }

  // KPIs
  html+='<div class="kpi-grid" style="margin-bottom:18px">';
  html+='<div class="kpi-card blue"><div class="kpi-label">🏢 จำนวนสาขา</div><div class="kpi-value">'+totalBranches.toLocaleString('th-TH')+'</div><div class="kpi-sub">สาขา '+brandName+' ทั่วประเทศ</div></div>';
  var provSet={};
  branches.forEach(function(b){
    var prov=b[6]||'';
    if(prov) provSet[prov]=1;
  });
  var provCount=Object.keys(provSet).length||60;
  html+='<div class="kpi-card cyan"><div class="kpi-label">🗺️ จังหวัด</div><div class="kpi-value">'+provCount+'</div><div class="kpi-sub">ครอบคลุมทั่วประเทศ</div></div>';

  if(isBigC){
    var typeCounts={};
    branches.forEach(function(b){ var t=b[0]; typeCounts[t]=(typeCounts[t]||0)+1; });
    var mainCount=typeCounts[1]||0;
    var miniCount=typeCounts[5]||0;
    html+='<div class="kpi-card green"><div class="kpi-label">🏬 บิ๊กซี (สาขาหลัก)</div><div class="kpi-value">'+mainCount+'</div><div class="kpi-sub">+ มาร์เก็ต '+(typeCounts[3]||0)+' + ฟู๊ดเพลส '+(typeCounts[4]||0)+'</div></div>';
    html+='<div class="kpi-card yellow"><div class="kpi-label">🏪 บิ๊กซีมินิ</div><div class="kpi-value">'+miniCount.toLocaleString('th-TH')+'</div><div class="kpi-sub">+ เพรียว '+(typeCounts[6]||0)+' + ดีโป้ '+(typeCounts[7]||0)+'</div></div>';
  } else if(isTops){
    var typeCounts={};
    branches.forEach(function(b){ var t=b[0]; typeCounts[t]=(typeCounts[t]||0)+1; });
    html+='<div class="kpi-card green"><div class="kpi-label">🛒 Tops</div><div class="kpi-value">'+(typeCounts[1]||0)+'</div><div class="kpi-sub">สาขา Tops ซูเปอร์มาร์เก็ต</div></div>';
    html+='<div class="kpi-card yellow"><div class="kpi-label">🏪 Tops Daily</div><div class="kpi-value">'+(typeCounts[2]||0)+'</div><div class="kpi-sub">+ Food Hall '+(typeCounts[3]||0)+' + Wine Cellar '+(typeCounts[4]||0)+'</div></div>';
  } else if(isMall){
    var typeCounts={};
    branches.forEach(function(b){ var t=b[0]; typeCounts[t]=(typeCounts[t]||0)+1; });
    html+='<div class="kpi-card green"><div class="kpi-label">🏬 The Mall</div><div class="kpi-value">'+(typeCounts[1]||0)+'</div><div class="kpi-sub">สาขา The Mall / Lifestore</div></div>';
    html+='<div class="kpi-card yellow"><div class="kpi-label">✨ Em District + Paragon</div><div class="kpi-value">'+((typeCounts[2]||0)+(typeCounts[3]||0)+(typeCounts[4]||0)+(typeCounts[5]||0))+'</div><div class="kpi-sub">Emporium '+(typeCounts[2]||0)+' + EmQuartier '+(typeCounts[3]||0)+' + Emsphere '+(typeCounts[4]||0)+' + Paragon '+(typeCounts[5]||0)+'</div></div>';
  } else if(isMakro){
    var typeCounts={};
    branches.forEach(function(b){ var t=b[0]; typeCounts[t]=(typeCounts[t]||0)+1; });
    html+='<div class="kpi-card green"><div class="kpi-label">🏬 Makro</div><div class="kpi-value">'+(typeCounts[1]||0)+'</div><div class="kpi-sub">สาขาแม็คโคร ค้าส่ง</div></div>';
    html+='<div class="kpi-card yellow"><div class="kpi-label">🍴 Food Service</div><div class="kpi-value">'+(typeCounts[2]||0)+'</div><div class="kpi-sub">สาขาแม็คโคร ฟู้ดเซอร์วิส</div></div>';
  } else if(isAeon){
    var typeCounts={};
    branches.forEach(function(b){ var t=b[0]; typeCounts[t]=(typeCounts[t]||0)+1; });
    html+='<div class="kpi-card green"><div class="kpi-label">🛒 MaxValu</div><div class="kpi-value">'+(typeCounts[1]||0)+'</div><div class="kpi-sub">สาขาแม็กซ์แวลู ซูเปอร์มาร์เก็ต</div></div>';
    html+='<div class="kpi-card yellow"><div class="kpi-label">🏪 MaxValu Tanjai</div><div class="kpi-value">'+(typeCounts[2]||0)+'</div><div class="kpi-sub">สาขาแม็กซ์แวลู ทันใจ</div></div>';
  } else {
    html+='<div class="kpi-card green"><div class="kpi-label">📍 ภาคกลาง</div><div class="kpi-value">—</div><div class="kpi-sub">มากที่สุด</div></div>';
    html+='<div class="kpi-card yellow"><div class="kpi-label">📞 ข้อมูลติดต่อ</div><div class="kpi-value">ครบ</div><div class="kpi-sub">ชื่อ ที่อยู่ เบอร์โทร</div></div>';
  }
  html+='</div>';

  if(hasTypes){
    html+='<div class="card" style="margin-bottom:16px;padding:14px">';
    html+='<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">';
    html+='<span style="font-size:13px;font-weight:700;color:#334155;margin-right:4px">ประเภทสาขา:</span>';
    var typeKeys=isBigC?[1,3,4,5,6,7]:isMall?[1,2,3,4,5]:isMakro?[1,2]:isAeon?[1,2]:[1,2,3,4];
    typeKeys.forEach(function(tk){
      var cnt=0; branches.forEach(function(b){if(b[0]===tk)cnt++;});
      html+='<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:16px;font-size:11px;font-weight:600;background:'+typeColors[tk]+';color:#fff;cursor:pointer" onclick="_bigcFilterType('+tk+')">';
      html+='<span style="width:8px;height:8px;border-radius:50%;background:#fff;display:inline-block"></span>'+typeNames[tk]+' ('+cnt+')</span>';
    });
    html+='<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:16px;font-size:11px;font-weight:600;background:#64748b;color:#fff;cursor:pointer" onclick="_bigcFilterType(0)">ทั้งหมด</span>';
    html+='</div></div>';
  }

  // Search + Filter
  html+='<div class="card" style="margin-bottom:16px;padding:16px">';
  var provList=Object.keys(provSet).sort(function(a,b){return a.localeCompare(b,'th');});
  html+='<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">';
  html+='<input id="cjBranchSearch" type="text" placeholder="🔍 ค้นหาสาขา..." style="flex:1;min-width:200px;padding:10px 16px;border:2px solid #e2e8f0;border-radius:10px;font-size:14px;outline:none;font-family:inherit" oninput="_cjFilterBranches()">';
  html+='<select id="cjProvFilter" onchange="_cjFilterBranches()" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:10px;font-size:14px;outline:none;font-family:inherit;background:#fff;min-width:160px;cursor:pointer">';
  html+='<option value="">📍 ทุกจังหวัด ('+provList.length+')</option>';
  for(var p=0;p<provList.length;p++){
    var cnt=0; branches.forEach(function(b){if(b[6]===provList[p])cnt++;});
    html+='<option value="'+provList[p]+'">'+provList[p]+' ('+cnt+')</option>';
  }
  html+='</select>';
  if(hasTypes){
    var filterTypeKeys=isBigC?[1,3,4,5,6,7]:isMall?[1,2,3,4,5]:isMakro?[1,2]:[1,2,3,4];
    html+='<select id="bigcTypeFilter" onchange="_cjFilterBranches()" style="padding:10px 14px;border:2px solid #e2e8f0;border-radius:10px;font-size:14px;outline:none;font-family:inherit;background:#fff;min-width:140px;cursor:pointer">';
    html+='<option value="">🏢 ทุกประเภท</option>';
    filterTypeKeys.forEach(function(tk){
      html+='<option value="'+tk+'">'+typeNames[tk]+'</option>';
    });
    html+='</select>';
  }
  html+='<span id="cjBranchCount" style="font-size:13px;color:#64748b">แสดง '+totalBranches+' สาขา</span>';
  html+='</div></div>';

  // Map
  html+='<div class="card" style="margin-bottom:16px">';
  html+='<div class="card-title">🗺️ แผนที่สาขา '+brandName+'</div>';
  html+='<div id="cjBranchMap" style="height:500px;border-radius:10px;z-index:1"></div>';
  html+='</div>';

  // Branch list table
  html+='<div class="card">';
  html+='<div class="card-title">📋 รายชื่อสาขา '+brandName+'</div>';
  html+='<div class="table-wrap" style="max-height:400px;overflow-y:auto"><table><thead><tr>';
  if(hasTypes) html+='<th>ประเภท</th>';
  else html+='<th>รหัสสาขา</th>';
  html+='<th>สาขา</th><th>จังหวัด</th><th>ที่อยู่</th><th>เบอร์โทร</th><th>ดูบนแผนที่</th>';
  html+='</tr></thead><tbody id="cjBranchTableBody">';
  var showMax=100;
  for(var i=0;i<Math.min(branches.length,showMax);i++){
    var b=branches[i];
    if(hasTypes){
      var typeName=typeNames[b[0]]||'อื่นๆ';
      var typeColor=typeColors[b[0]]||'#64748b';
      html+='<tr><td><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;background:'+typeColor+';color:#fff">'+typeName+'</span></td>';
    } else {
      html+='<tr><td>'+b[0]+'</td>';
    }
    html+='<td>'+b[1]+'</td><td>'+b[6]+'</td><td style="font-size:11px;max-width:250px;white-space:normal">'+b[5]+'</td><td>'+b[4]+'</td>';
    html+='<td><button onclick="_cjPanTo('+b[2]+','+b[3]+',\''+b[1].replace(/'/g,"\\'")+'\')" style="background:'+color+';color:#fff;border:none;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:11px;font-family:inherit">📍 ดู</button></td></tr>';
  }
  if(branches.length>showMax){
    html+='<tr><td colspan="'+(isBigC?6:6)+'" style="text-align:center;color:#64748b;font-size:12px">แสดง '+showMax+' จาก '+totalBranches+' สาขา — ใช้ช่องค้นหาเพื่อกรอง</td></tr>';
  }
  html+='</tbody></table></div></div>';

  html+='<div style="text-align:center;padding:12px;color:var(--muted);font-size:11px">📄 ข้อมูลสาขาจาก '+sourceUrl+' | '+brandName+' '+totalBranches+' สาขาทั่วประเทศ</div>';

  // Init map after render
  setTimeout(function(){
    var mapEl=document.getElementById('cjBranchMap');
    if(!mapEl||typeof L==='undefined') return;
    if(_cjMapInstance){try{_cjMapInstance.remove();}catch(e){}_cjMapInstance=null;}
    var map=L.map('cjBranchMap',{scrollWheelZoom:false,preferCanvas:true}).setView([13.75,100.5],6);
    _cjMapInstance=map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      attribution:'&copy; OpenStreetMap',maxZoom:18
    }).addTo(map);

    var markers=[];
    for(var i=0;i<branches.length;i++){
      var b=branches[i];
      if(!b[2]||!b[3]) continue;
      var markerColor=hasTypes?(typeColors[b[0]]||'#64748b'):'#ea580c';
      var mk=L.circleMarker([b[2],b[3]],{radius:hasTypes?4:5,fillColor:markerColor,color:'#fff',weight:1.5,fillOpacity:0.85,_name:b[1],_tel:b[4],_prov:b[6],_type:b[0]});
      var popupHtml='<strong>'+b[1]+'</strong><br>';
      if(hasTypes){
        var tn=typeNames[b[0]]||'';
        popupHtml+='<span style="display:inline-block;padding:1px 6px;border-radius:8px;font-size:10px;font-weight:600;background:'+(typeColors[b[0]]||'#64748b')+';color:#fff;margin:2px 0">'+tn+'</span><br>';
      } else {
        popupHtml+='<span style="font-size:12px;color:#64748b">รหัส: '+b[0]+' | '+b[6]+'</span><br>';
      }
      popupHtml+='<span style="font-size:11px;color:#64748b">📍 '+b[6]+'</span><br>';
      if(b[4]) popupHtml+='<span style="font-size:11px;color:#64748b">📞 '+b[4]+'</span><br>';
      popupHtml+='<span style="font-size:11px;color:#94a3b8">'+b[5]+'</span><br>';
      popupHtml+='<a href="https://maps.google.com?q='+b[2]+','+b[3]+'" target="_blank" style="font-size:12px;color:#3b82f6">เปิดใน Google Maps →</a>';
      mk.bindPopup(popupHtml);
      markers.push(mk);
    }
    var layerGroup=L.layerGroup(markers).addTo(map);
    window._cjMapMarkers=markers;
    window._cjMapLayer=layerGroup;
    setTimeout(function(){
      map.invalidateSize();
      if(markers.length>0){
        var bounds=L.latLngBounds(markers.map(function(mk){return mk.getLatLng();}));
        map.fitBounds(bounds,{padding:[30,30],maxZoom:10});
      }
    },300);
  },200);

  return html;
}

function _bigcFilterType(typeId){
  var el=document.getElementById('bigcTypeFilter');
  if(el) el.value=typeId===0?'':typeId;
  _cjFilterBranches();
}

function _cjPanTo(lat,lng,name){
  if(!_cjMapInstance) return;
  _cjMapInstance.setView([lat,lng],15);
  if(window._cjMapMarkers){
    window._cjMapMarkers.forEach(function(mk){
      if(mk.options._name===name) mk.openPopup();
    });
  }
  document.getElementById('cjBranchMap').scrollIntoView({behavior:'smooth',block:'center'});
}

function _cjFilterBranches(){
  var q=(document.getElementById('cjBranchSearch').value||'').toLowerCase();
  var provSel=document.getElementById('cjProvFilter');
  var selProv=provSel?provSel.value:'';
  var branches=_mtBiGetBranches();
  var isBigC=_mtBiIsBigC();
  var isMall=_mtBiIsMall();
  var isMakro=_mtBiIsMakro();
  var isAeon=_mtBiIsAeon();
  var hasTypes=_mtBiHasTypes();
  var typeNames=isBigC?BIGC_TYPE_NAMES:isMall?MALL_TYPE_NAMES:isMakro?MAKRO_TYPE_NAMES:isAeon?AEON_TYPE_NAMES:TOPS_TYPE_NAMES;
  var typeColors=isBigC?BIGC_TYPE_COLORS:isMall?MALL_TYPE_COLORS:isMakro?MAKRO_TYPE_COLORS:isAeon?AEON_TYPE_COLORS:TOPS_TYPE_COLORS;
  var typeFilterEl=document.getElementById('bigcTypeFilter');
  var selType=typeFilterEl?parseInt(typeFilterEl.value)||0:0;
  var tbody=document.getElementById('cjBranchTableBody');
  if(!tbody) return;
  var color=_mtCh==='All'?'#4f46e5':((typeof MT_CH_COLORS!=='undefined'&&MT_CH_COLORS[_mtCh])?MT_CH_COLORS[_mtCh]:'#ea580c');
  var filtered=[];
  for(var i=0;i<branches.length;i++){
    var b=branches[i];
    if(selProv&&b[6]!==selProv) continue;
    if(hasTypes&&selType&&b[0]!==selType) continue;
    var searchText=(b[1]+' '+b[6]+' '+b[5]+' '+b[0]).toLowerCase();
    if(!q||searchText.indexOf(q)!==-1) filtered.push(b);
  }
  var showMax=100;
  var html='';
  for(var i=0;i<Math.min(filtered.length,showMax);i++){
    var b=filtered[i];
    if(hasTypes){
      var typeName=typeNames[b[0]]||'อื่นๆ';
      var typeColor=typeColors[b[0]]||'#64748b';
      html+='<tr><td><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;background:'+typeColor+';color:#fff">'+typeName+'</span></td>';
    } else {
      html+='<tr><td>'+b[0]+'</td>';
    }
    html+='<td>'+b[1]+'</td><td>'+b[6]+'</td><td style="font-size:11px;max-width:250px;white-space:normal">'+b[5]+'</td><td>'+b[4]+'</td>';
    html+='<td><button onclick="_cjPanTo('+b[2]+','+b[3]+',\''+b[1].replace(/'/g,"\\'")+'\')" style="background:'+color+';color:#fff;border:none;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:11px;font-family:inherit">📍 ดู</button></td></tr>';
  }
  if(filtered.length>showMax) html+='<tr><td colspan="6" style="text-align:center;color:#64748b;font-size:12px">แสดง '+showMax+' จาก '+filtered.length+' สาขา</td></tr>';
  tbody.innerHTML=html;
  var countEl=document.getElementById('cjBranchCount');
  if(countEl) countEl.textContent='แสดง '+Math.min(filtered.length,showMax)+' / '+filtered.length+' สาขา';

  // Filter map markers
  if(_cjMapInstance&&window._cjMapMarkers){
    if(window._cjMapLayer) _cjMapInstance.removeLayer(window._cjMapLayer);
    var vis=[];
    window._cjMapMarkers.forEach(function(mk){
      var name=mk.options._name||'';
      var prov=mk.options._prov||'';
      var mtype=mk.options._type||0;
      if(selProv&&prov!==selProv) return;
      if(hasTypes&&selType&&mtype!==selType) return;
      if(!q||name.toLowerCase().indexOf(q)!==-1||prov.toLowerCase().indexOf(q)!==-1) vis.push(mk);
    });
    window._cjMapLayer=L.layerGroup(vis).addTo(_cjMapInstance);
    if(vis.length>0&&(q||selProv)){
      var bounds=L.latLngBounds(vis.map(function(mk){return mk.getLatLng();}));
      _cjMapInstance.fitBounds(bounds,{padding:[30,30],maxZoom:12});
    }
  }
}

// ── Forecast Render ──
function _mtBiRenderForecast(){
  var ch=_mtCh||'CJ';
  var isAll=ch==='All';
  var chLabel=isAll?'ทุกช่องทาง':((typeof MT_CH_LABELS!=='undefined'&&MT_CH_LABELS[ch])?MT_CH_LABELS[ch]:ch);
  var color=isAll?'#7c3aed':((typeof MT_CH_COLORS!=='undefined'&&MT_CH_COLORS[ch])?MT_CH_COLORS[ch]:'#ea580c');
  var MO_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var MO_TH=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  var hasFD=typeof MT_FORECAST!=='undefined';
  var hasRV=typeof MT_REVISED!=='undefined';
  var hasSD=typeof SALES_DATA!=='undefined'&&SALES_DATA.ModernTrade;
  var hasTG=typeof TARGET_2026!=='undefined';
  var MT_CHS=['CJ','BigC','Top','TheMall','Makro','Aeon','MM'];

  // Build monthly rows: target, forecast(pieces), revised(pieces), actual(baht)
  var rows=[];
  var ytdFC=0,ytdRev=0,ytdAct=0,ytdTgt=0;
  for(var mi=0;mi<7;mi++){
    var key='2026-'+MO_EN[mi];
    var fcPcs=0,revPcs=0;
    if(hasFD&&MT_FORECAST[key]){
      if(isAll) fcPcs=MT_FORECAST[key].totalFC;
      else fcPcs=MT_FORECAST[key].ch[ch]?MT_FORECAST[key].ch[ch].fc:0;
    }
    if(hasRV&&MT_REVISED[key]){
      if(isAll) revPcs=MT_REVISED[key].totalRev;
      else revPcs=MT_REVISED[key].ch[ch]?MT_REVISED[key].ch[ch].rev:0;
    }
    // Actual from SALES_DATA
    var actBaht=0;
    if(hasSD){
      var chKeys=isAll?MT_CHS:[ch];
      chKeys.forEach(function(ck){
        var sd=SALES_DATA.ModernTrade[ck];
        if(sd&&sd.years&&sd.years[2026]&&sd.years[2026].months&&sd.years[2026].months[MO_EN[mi]])
          actBaht+=sd.years[2026].months[MO_EN[mi]].b||0;
      });
    }
    // Target from TARGET_2026
    var tgtBaht=0;
    if(hasTG&&TARGET_2026.mt){
      var tChKeys=isAll?MT_CHS:[ch];
      tChKeys.forEach(function(ck){
        if(TARGET_2026.mt[ck]&&TARGET_2026.mt[ck].monthly)
          tgtBaht+=TARGET_2026.mt[ck].monthly[mi]||0;
      });
    }
    ytdFC+=fcPcs;ytdRev+=revPcs;ytdAct+=actBaht;ytdTgt+=tgtBaht;
    rows.push({mi:mi,mo:MO_TH[mi],fcPcs:fcPcs,revPcs:revPcs,actBaht:actBaht,tgtBaht:tgtBaht,achPct:tgtBaht>0?(actBaht/tgtBaht*100):0});
  }

  // Top products from latest month with forecast
  var topProds=[];
  for(var ti=6;ti>=0;ti--){
    var tk='2026-'+MO_EN[ti];
    if(hasFD&&MT_FORECAST[tk]&&MT_FORECAST[tk].topProducts&&MT_FORECAST[tk].topProducts.length>0){
      var src=MT_FORECAST[tk].topProducts;
      topProds=isAll?src:src.filter(function(p){return p.ch===ch;});
      if(topProds.length>0) break;
    }
  }

  // Weekly detail
  var weekRows=[];
  if(typeof MT_FORECAST_WEEKLY!=='undefined'){
    MT_FORECAST_WEEKLY.forEach(function(w){
      if(w.fc<=0) return;
      var wfc=isAll?w.fc:(w.ch[ch]||0);
      if(wfc<=0) return;
      weekRows.push({mi:w.mi,mo:MO_TH[w.mi],week:w.week,info:w.info,fc:wfc});
    });
  }

  // Channel breakdown
  var chBreak=[];
  if(isAll&&hasFD){
    MT_CHS.forEach(function(ck){
      var total=0;
      for(var mi=0;mi<7;mi++){
        var k2='2026-'+MO_EN[mi];
        if(MT_FORECAST[k2]&&MT_FORECAST[k2].ch[ck]) total+=MT_FORECAST[k2].ch[ck].fc;
      }
      if(total>0) chBreak.push({ch:ck,label:(typeof MT_CH_LABELS!=='undefined'&&MT_CH_LABELS[ck])?MT_CH_LABELS[ck]:ck,fc:total});
    });
    chBreak.sort(function(a,b){return b.fc-a.fc;});
  }

  var html='';

  // Header
  html+='<div class="card" style="background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:24px 28px;margin-bottom:18px;border-radius:14px">';
  html+='<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
  html+='<div><div style="font-size:20px;font-weight:800">🔮 พยากรณ์ — Forecast สัปดาห์ MT</div>';
  html+='<div style="font-size:13px;opacity:.85;margin-top:4px">'+chLabel+' — ข้อมูลจาก Forecast สัปดาห์ MDT Excel (YTD 2026)</div></div>';
  html+='<div style="background:rgba(255,255,255,.2);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700">'+chLabel+'</div>';
  html+='</div></div>';

  // KPIs
  var fcMonths=rows.filter(function(r){return r.fcPcs>0;}).length;
  var accPct=ytdTgt>0?(ytdAct/ytdTgt*100):0;
  html+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px;margin-bottom:18px">';
  var kpis=[
    {icon:'📦',label:'Forecast YTD (ชิ้น)',value:(ytdFC/1e6).toFixed(2)+' M ชิ้น',color:'#7c3aed'},
    {icon:'📝',label:'Revised YTD (ชิ้น)',value:(ytdRev/1e6).toFixed(2)+' M ชิ้น',color:'#0ea5e9'},
    {icon:'💰',label:'Actual YTD (บาท)',value:(ytdAct/1e6).toFixed(2)+' M',color:'#4f46e5'},
    {icon:'🎯',label:'Target YTD',value:(ytdTgt/1e6).toFixed(2)+' M',color:'#f59e0b'},
    {icon:'📊',label:'Achievement',value:accPct.toFixed(1)+'%',color:accPct>=80?'#10b981':'#ef4444'}
  ];
  kpis.forEach(function(k){
    html+='<div class="card" style="padding:18px;border-radius:12px;border-left:4px solid '+k.color+'">';
    html+='<div style="font-size:12px;color:var(--muted)">'+k.icon+' '+k.label+'</div>';
    html+='<div style="font-size:20px;font-weight:800;margin-top:6px;color:'+k.color+'">'+k.value+'</div>';
    html+='</div>';
  });
  html+='</div>';

  // Monthly Forecast vs Actual Table
  html+='<div class="card" style="padding:20px;border-radius:12px;margin-bottom:18px">';
  html+='<div style="font-weight:700;margin-bottom:14px">📋 FORECAST vs TARGET vs ACTUAL (รายเดือน)</div>';
  html+='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">';
  html+='<thead><tr style="background:var(--bg,#f9fafb);border-bottom:2px solid var(--border-color,#e5e7eb)">';
  ['เดือน','TARGET (บาท)','FORECAST (ชิ้น)','REVISED (ชิ้น)','ACTUAL (บาท)','% vs TARGET'].forEach(function(h){
    html+='<th style="padding:10px;text-align:left;font-weight:700;white-space:nowrap">'+h+'</th>';
  });
  html+='</tr></thead><tbody>';
  rows.forEach(function(r,i){
    var rowBg=i%2===0?'':'background:var(--bg,#f9fafb)';
    var achColor=r.achPct>=90?'#10b981':r.achPct>=70?'#f59e0b':'#ef4444';
    html+='<tr style="border-bottom:1px solid var(--border-color,#e5e7eb);'+rowBg+'">';
    html+='<td style="padding:8px 10px;font-weight:600">'+r.mo+'</td>';
    html+='<td style="padding:8px 10px">'+(r.tgtBaht>0?(r.tgtBaht/1e6).toFixed(1)+' M':'—')+'</td>';
    html+='<td style="padding:8px 10px;color:#7c3aed;font-weight:600">'+(r.fcPcs>0?(r.fcPcs/1e3).toFixed(0)+'K':'—')+'</td>';
    html+='<td style="padding:8px 10px;color:#0ea5e9;font-weight:600">'+(r.revPcs>0?(r.revPcs/1e3).toFixed(0)+'K':'—')+'</td>';
    html+='<td style="padding:8px 10px;font-weight:700;color:#4f46e5">'+(r.actBaht>0?(r.actBaht/1e6).toFixed(2)+' M':'—')+'</td>';
    html+='<td style="padding:8px 10px;font-weight:700;color:'+achColor+'">'+(r.achPct>0?r.achPct.toFixed(1)+'%':'—')+'</td>';
    html+='</tr>';
  });
  // Total row
  html+='<tr style="border-top:2px solid var(--border-color,#e5e7eb);font-weight:700;background:rgba(124,58,237,.05)">';
  html+='<td style="padding:8px 10px">รวม YTD</td>';
  html+='<td style="padding:8px 10px">'+(ytdTgt/1e6).toFixed(1)+' M</td>';
  html+='<td style="padding:8px 10px;color:#7c3aed">'+(ytdFC/1e3).toFixed(0)+'K</td>';
  html+='<td style="padding:8px 10px;color:#0ea5e9">'+(ytdRev/1e3).toFixed(0)+'K</td>';
  html+='<td style="padding:8px 10px;color:#4f46e5">'+(ytdAct/1e6).toFixed(2)+' M</td>';
  html+='<td style="padding:8px 10px;color:'+(accPct>=80?'#10b981':'#ef4444')+'">'+accPct.toFixed(1)+'%</td>';
  html+='</tr></tbody></table></div></div>';

  // Channel Breakdown (All mode)
  if(isAll&&chBreak.length>0){
    html+='<div class="card" style="padding:20px;border-radius:12px;margin-bottom:18px">';
    html+='<div style="font-weight:700;margin-bottom:14px">📊 Forecast แยกช่องทาง (ชิ้น YTD)</div>';
    var maxFC=chBreak[0].fc;
    chBreak.forEach(function(c){
      var pct=maxFC>0?(c.fc/maxFC*100):0;
      var pctAll=ytdFC>0?(c.fc/ytdFC*100):0;
      html+='<div style="margin-bottom:10px">';
      html+='<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px"><span style="font-weight:600">'+c.label+'</span><span style="color:var(--muted)">'+(c.fc/1e6).toFixed(2)+' M ('+pctAll.toFixed(1)+'%)</span></div>';
      html+='<div style="height:22px;background:var(--border-color,#e5e7eb);border-radius:11px;overflow:hidden">';
      html+='<div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#7c3aed,#a855f7);border-radius:11px;transition:width .6s"></div>';
      html+='</div></div>';
    });
    html+='</div>';
  }

  // Top Products Forecast
  if(topProds.length>0){
    html+='<div class="card" style="padding:20px;border-radius:12px;margin-bottom:18px">';
    html+='<div style="font-weight:700;margin-bottom:14px">🏆 สินค้า Forecast สูงสุด (เดือนล่าสุด)</div>';
    html+='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">';
    html+='<thead><tr style="background:var(--bg,#f9fafb);border-bottom:2px solid var(--border-color,#e5e7eb)">';
    ['#','สินค้า','ช่องทาง','Forecast (ชิ้น)'].forEach(function(h){
      html+='<th style="padding:8px 10px;text-align:left;font-weight:700;white-space:nowrap">'+h+'</th>';
    });
    html+='</tr></thead><tbody>';
    topProds.slice(0,10).forEach(function(p,i){
      var rowBg=i%2===0?'':'background:var(--bg,#f9fafb)';
      var chLbl=(typeof MT_CH_LABELS!=='undefined'&&MT_CH_LABELS[p.ch])?MT_CH_LABELS[p.ch]:p.ch;
      html+='<tr style="border-bottom:1px solid var(--border-color,#e5e7eb);'+rowBg+'">';
      html+='<td style="padding:8px 10px;color:var(--muted)">'+(i+1)+'</td>';
      html+='<td style="padding:8px 10px;font-weight:600;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+_stripBrand(p.n)+'</td>';
      html+='<td style="padding:8px 10px"><span style="background:#7c3aed;color:#fff;padding:2px 8px;border-radius:8px;font-size:10px">'+chLbl+'</span></td>';
      html+='<td style="padding:8px 10px;font-weight:700;color:#7c3aed">'+p.fc.toLocaleString()+' ชิ้น</td>';
      html+='</tr>';
    });
    html+='</tbody></table></div></div>';
  }

  // Footer
  html+='<div style="font-size:11px;color:var(--muted);text-align:center;margin-top:8px">';
  html+='⚠️ ข้อมูล Forecast/Revised จากไฟล์ Excel "Forecast/Revised สัปดาห์ MDT" — หน่วย: ชิ้น | Actual: บาท จาก SALES_DATA</div>';

  return html;
}

// ── AI Analytics Render ──
function _mtBiRenderAI(){
  var ch=_mtCh||'CJ';
  var isAll=ch==='All';
  var chLabel=isAll?'ทุกช่องทาง':((typeof MT_CH_LABELS!=='undefined'&&MT_CH_LABELS[ch])?MT_CH_LABELS[ch]:ch);
  var color=isAll?'#4f46e5':((typeof MT_CH_COLORS!=='undefined'&&MT_CH_COLORS[ch])?MT_CH_COLORS[ch]:'#ea580c');
  var MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var MO_TH=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  var yr=2026;

  // ── Gather channel sales data ──
  var chKeys=['CJ','BigC','Top','TheMall','Makro','Aeon','MM'];
  var chSales={};
  var totalYTD=0,totalTarget=0;
  var hasSales=typeof SALES_DATA!=='undefined'&&SALES_DATA.ModernTrade;
  var hasTarget=typeof TARGET_2026!=='undefined';
  chKeys.forEach(function(ck){
    var sd=hasSales&&SALES_DATA.ModernTrade[ck]?SALES_DATA.ModernTrade[ck]:null;
    var yd=sd&&sd.years&&sd.years[yr]?sd.years[yr]:null;
    var tg=hasTarget&&TARGET_2026.mt&&TARGET_2026.mt[ck]?TARGET_2026.mt[ck]:null;
    var ytd=0,monthly=[];
    for(var mi=0;mi<12;mi++){
      var v=yd&&yd.months&&yd.months[MO[mi]]?(yd.months[MO[mi]].b||0):0;
      monthly.push(v);
      ytd+=v;
    }
    var tgTotal=tg?tg.total:0;
    var tgYTD=0;
    if(tg&&tg.monthly) for(var ti=0;ti<6;ti++) tgYTD+=tg.monthly[ti];
    totalYTD+=ytd;
    totalTarget+=tgYTD;
    chSales[ck]={ytd:ytd,monthly:monthly,target:tgTotal,targetYTD:tgYTD,achieve:tgYTD>0?(ytd/tgYTD*100):0};
  });

  // ── Product analysis (MT_DATA) ──
  var products=[];
  var hasMT=typeof MT_DATA!=='undefined'&&MT_DATA.ch;
  if(hasMT){
    var chData=isAll?null:(MT_DATA.ch[ch]||MT_DATA.ch['CJ']);
    var srcChannels=isAll?Object.keys(MT_DATA.ch):[ch];
    var prodMap={};
    srcChannels.forEach(function(ck){
      var prods=MT_DATA.ch[ck]||[];
      prods.forEach(function(p){
        var key=p.code||p.name;
        if(!prodMap[key]){
          prodMap[key]={name:p.name,code:p.code,rsp:p.rsp,type:p.type,rank:p.rank,tu:0,tb:0,monthly:[],ch:ck};
          for(var i=0;i<12;i++) prodMap[key].monthly.push(0);
        }
        prodMap[key].tu+=(p.tu||0);
        prodMap[key].tb+=(p.tb||0);
        if(p.m){
          for(var mi=0;mi<12;mi++){
            var md=p.m[MO[mi]];
            if(md) prodMap[key].monthly[mi]+=(md.b||0);
          }
        }
      });
    });
    Object.keys(prodMap).forEach(function(k){products.push(prodMap[k]);});
  }

  // Sort products by total sales
  products.sort(function(a,b){return b.tb-a.tb;});

  // Find declining products (last month vs previous)
  var declining=[];
  var growing=[];
  products.forEach(function(p){
    var lastIdx=-1;
    for(var i=11;i>=0;i--){if(p.monthly[i]>0){lastIdx=i;break;}}
    if(lastIdx<1) return;
    var prev=p.monthly[lastIdx-1];
    var curr=p.monthly[lastIdx];
    if(prev>0){
      var chg=(curr-prev)/prev*100;
      if(chg<-10) declining.push({name:p.name,prev:prev,curr:curr,chg:chg,rank:p.rank,mo:MO_TH[lastIdx]});
      if(chg>10) growing.push({name:p.name,prev:prev,curr:curr,chg:chg,rank:p.rank,mo:MO_TH[lastIdx]});
    }
  });
  declining.sort(function(a,b){return a.chg-b.chg;});
  growing.sort(function(a,b){return b.chg-a.chg;});

  // Channel ranking
  var chRank=[];
  chKeys.forEach(function(ck){
    if(chSales[ck].ytd>0) chRank.push({key:ck,label:(typeof MT_CH_LABELS!=='undefined'&&MT_CH_LABELS[ck])?MT_CH_LABELS[ck]:ck,ytd:chSales[ck].ytd,achieve:chSales[ck].achieve,targetYTD:chSales[ck].targetYTD});
  });
  chRank.sort(function(a,b){return b.ytd-a.ytd;});

  // Channel MoM trend
  var chTrends=[];
  chKeys.forEach(function(ck){
    var m=chSales[ck].monthly;
    var lastIdx=-1;
    for(var i=11;i>=0;i--){if(m[i]>0){lastIdx=i;break;}}
    if(lastIdx<1) return;
    var chg=(m[lastIdx]-m[lastIdx-1])/(m[lastIdx-1]||1)*100;
    chTrends.push({key:ck,label:(typeof MT_CH_LABELS!=='undefined'&&MT_CH_LABELS[ck])?MT_CH_LABELS[ck]:ck,chg:chg,curr:m[lastIdx],prev:m[lastIdx-1],mo:MO_TH[lastIdx]});
  });

  // Insights count
  var alertCount=declining.length;
  var oppCount=growing.length;
  var achievePct=totalTarget>0?(totalYTD/totalTarget*100):0;

  var html='';

  // Header
  html+='<div class="card" style="background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;padding:24px 28px;margin-bottom:18px;border-radius:14px">';
  html+='<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
  html+='<div><div style="font-size:20px;font-weight:800">🤖 วิเคราะห์ AI ⭐</div>';
  html+='<div style="font-size:13px;opacity:.85;margin-top:4px">'+chLabel+' — วิเคราะห์อัตโนมัติจากข้อมูลจริง (YTD '+yr+')</div>';
  var _ais=typeof getAiSchedule==='function'?getAiSchedule():null;
  if(_ais) html+='<div style="font-size:11px;opacity:.7;margin-top:2px">⏰ ความถี่วิเคราะห์: '+_ais.label+'</div>';
  html+='</div>';
  html+='<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">';
  html+='<div style="background:rgba(255,255,255,.2);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700">'+chLabel+'</div>';
  if(_ais&&_ais.lastRun&&_ais.lastRun!=='ยังไม่เคยรัน') html+='<div style="font-size:10px;opacity:.6">อัปเดตล่าสุด: '+_ais.lastRun.replace('T',' ')+'</div>';
  html+='</div>';
  html+='</div></div>';

  // KPIs
  html+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px;margin-bottom:18px">';
  var kpis=[
    {icon:'💡',label:'ข้อมูลเชิงลึก',value:(alertCount+oppCount)+' รายการ',color:'#3b82f6'},
    {icon:'🚨',label:'แจ้งเตือนยอดตก',value:Math.min(alertCount,10)+' สินค้า',color:'#ef4444'},
    {icon:'🎯',label:'โอกาสเติบโต',value:Math.min(oppCount,10)+' สินค้า',color:'#10b981'},
    {icon:'📊',label:'ถึงเป้า YTD',value:achievePct.toFixed(1)+'%',color:achievePct>=80?'#10b981':'#ef4444'}
  ];
  kpis.forEach(function(k){
    html+='<div class="card" style="padding:18px;border-radius:12px;border-left:4px solid '+k.color+'">';
    html+='<div style="font-size:12px;color:var(--muted)">'+k.icon+' '+k.label+'</div>';
    html+='<div style="font-size:22px;font-weight:800;margin-top:6px;color:'+k.color+'">'+k.value+'</div>';
    html+='</div>';
  });
  html+='</div>';

  // 1. Channel Performance
  if(chRank.length>0){
    html+='<div class="card" style="padding:20px;border-radius:12px;margin-bottom:18px">';
    html+='<div style="font-weight:700;margin-bottom:14px">📊 1. อันดับช่องทาง — ยอดขาย YTD '+yr+'</div>';
    html+='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">';
    html+='<thead><tr style="background:var(--bg,#f9fafb);border-bottom:2px solid var(--border-color,#e5e7eb)">';
    ['#','ช่องทาง','ยอดขาย YTD','เป้า YTD','ถึงเป้า','สถานะ'].forEach(function(h){
      html+='<th style="padding:10px;text-align:left;font-weight:700;white-space:nowrap">'+h+'</th>';
    });
    html+='</tr></thead><tbody>';
    chRank.forEach(function(c,i){
      var ach=c.achieve;
      var status=ach>=90?'✅ ดี':ach>=70?'⚠️ ต้องเร่ง':'🔴 ต่ำกว่าเป้า';
      var sColor=ach>=90?'#10b981':ach>=70?'#f59e0b':'#ef4444';
      var rowBg=i%2===0?'':'background:var(--bg,#f9fafb)';
      html+='<tr style="border-bottom:1px solid var(--border-color,#e5e7eb);'+rowBg+'">';
      html+='<td style="padding:8px 10px;color:var(--muted)">'+(i+1)+'</td>';
      html+='<td style="padding:8px 10px;font-weight:700">'+c.label+'</td>';
      html+='<td style="padding:8px 10px;font-weight:700;color:#4f46e5">'+(c.ytd/1e6).toFixed(2)+' M</td>';
      html+='<td style="padding:8px 10px">'+(c.targetYTD>0?(c.targetYTD/1e6).toFixed(2)+' M':'—')+'</td>';
      html+='<td style="padding:8px 10px;font-weight:700;color:'+sColor+'">'+ach.toFixed(1)+'%</td>';
      html+='<td style="padding:8px 10px;font-size:12px">'+status+'</td>';
      html+='</tr>';
    });
    html+='<tr style="border-top:2px solid var(--border-color,#e5e7eb);font-weight:700;background:rgba(79,70,229,.05)">';
    html+='<td style="padding:8px 10px"></td><td style="padding:8px 10px">รวม MT</td>';
    html+='<td style="padding:8px 10px;color:#4f46e5">'+(totalYTD/1e6).toFixed(2)+' M</td>';
    html+='<td style="padding:8px 10px">'+(totalTarget>0?(totalTarget/1e6).toFixed(2)+' M':'—')+'</td>';
    html+='<td style="padding:8px 10px;color:'+(achievePct>=80?'#10b981':'#ef4444')+'">'+achievePct.toFixed(1)+'%</td>';
    html+='<td style="padding:8px 10px"></td></tr>';
    html+='</tbody></table></div></div>';
  }

  // 2. Channel MoM Trend
  var risingCh=chTrends.filter(function(t){return t.chg>0;});
  var fallingCh=chTrends.filter(function(t){return t.chg<0;});
  risingCh.sort(function(a,b){return b.chg-a.chg;});
  fallingCh.sort(function(a,b){return a.chg-b.chg;});

  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px">';

  html+='<div class="card" style="padding:20px;border-radius:12px;border-top:3px solid #10b981">';
  html+='<div style="font-weight:700;margin-bottom:12px">📈 2. ช่องทางที่เติบโต (MoM)</div>';
  if(risingCh.length===0) html+='<div style="color:var(--muted);font-size:13px;padding:20px;text-align:center">ไม่มีข้อมูล</div>';
  risingCh.forEach(function(t){
    html+='<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color,#e5e7eb)">';
    html+='<span style="font-weight:600;font-size:13px">'+t.label+'</span>';
    html+='<span style="color:#10b981;font-weight:700;font-size:13px">🔺 +'+t.chg.toFixed(1)+'%</span>';
    html+='</div>';
  });
  html+='</div>';

  html+='<div class="card" style="padding:20px;border-radius:12px;border-top:3px solid #ef4444">';
  html+='<div style="font-weight:700;margin-bottom:12px">📉 3. ช่องทางที่ลดลง (MoM)</div>';
  if(fallingCh.length===0) html+='<div style="color:var(--muted);font-size:13px;padding:20px;text-align:center">ไม่มีข้อมูล</div>';
  fallingCh.forEach(function(t){
    html+='<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color,#e5e7eb)">';
    html+='<span style="font-weight:600;font-size:13px">'+t.label+'</span>';
    html+='<span style="color:#ef4444;font-weight:700;font-size:13px">🔻 '+t.chg.toFixed(1)+'%</span>';
    html+='</div>';
  });
  html+='</div>';
  html+='</div>';

  // 3. Top Products
  if(products.length>0){
    html+='<div class="card" style="padding:20px;border-radius:12px;margin-bottom:18px">';
    html+='<div style="font-weight:700;margin-bottom:14px">🏆 4. สินค้าขายดี Top 10 — '+chLabel+'</div>';
    html+='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">';
    html+='<thead><tr style="background:var(--bg,#f9fafb);border-bottom:2px solid var(--border-color,#e5e7eb)">';
    ['#','สินค้า','Rank','ประเภท','ยอดขาย','จำนวน','ราคา'].forEach(function(h){
      html+='<th style="padding:8px 10px;text-align:left;font-weight:700;white-space:nowrap">'+h+'</th>';
    });
    html+='</tr></thead><tbody>';
    var top10=products.slice(0,10);
    top10.forEach(function(p,i){
      var rankColor=p.rank==='A+'?'#ef4444':p.rank==='A'?'#f59e0b':p.rank==='B'?'#3b82f6':'#6b7280';
      var rowBg=i%2===0?'':'background:var(--bg,#f9fafb)';
      html+='<tr style="border-bottom:1px solid var(--border-color,#e5e7eb);'+rowBg+'">';
      html+='<td style="padding:8px 10px;color:var(--muted)">'+(i+1)+'</td>';
      html+='<td style="padding:8px 10px;font-weight:600;max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+_stripBrand(p.name)+'</td>';
      html+='<td style="padding:8px 10px"><span style="background:'+rankColor+';color:#fff;padding:2px 8px;border-radius:8px;font-size:10px;font-weight:700">'+(p.rank||'—')+'</span></td>';
      html+='<td style="padding:8px 10px;font-size:11px">'+(p.type||'—')+'</td>';
      html+='<td style="padding:8px 10px;font-weight:700;color:#4f46e5">'+(p.tb/1e6).toFixed(2)+' M</td>';
      html+='<td style="padding:8px 10px">'+p.tu.toLocaleString()+'</td>';
      html+='<td style="padding:8px 10px">'+(p.rsp||'—')+' ฿</td>';
      html+='</tr>';
    });
    html+='</tbody></table></div></div>';
  }

  // 4. Declining Products Alert
  if(declining.length>0){
    html+='<div class="card" style="padding:20px;border-radius:12px;border-left:4px solid #ef4444;margin-bottom:18px">';
    html+='<div style="font-weight:700;margin-bottom:14px">🚨 5. สินค้ายอดตก — ต้องเร่งแก้ไข</div>';
    var showDecline=declining.slice(0,8);
    showDecline.forEach(function(d,i){
      html+='<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-color,#e5e7eb)">';
      html+='<span style="color:var(--muted);font-size:12px;min-width:20px">'+(i+1)+'</span>';
      html+='<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+d.name+'</div>';
      html+='<div style="font-size:11px;color:var(--muted)">Rank: '+(d.rank||'—')+' | เดือน: '+d.mo+'</div></div>';
      html+='<div style="text-align:right;flex-shrink:0"><div style="color:#ef4444;font-weight:700;font-size:14px">'+d.chg.toFixed(1)+'%</div>';
      html+='<div style="font-size:10px;color:var(--muted)">'+(d.prev/1e6).toFixed(2)+'M → '+(d.curr/1e6).toFixed(2)+'M</div></div>';
      html+='</div>';
    });
    if(declining.length>8) html+='<div style="text-align:center;color:var(--muted);font-size:12px;margin-top:8px">+อีก '+(declining.length-8)+' สินค้า</div>';
    html+='</div>';
  }

  // 5. Growing Products
  if(growing.length>0){
    html+='<div class="card" style="padding:20px;border-radius:12px;border-left:4px solid #10b981;margin-bottom:18px">';
    html+='<div style="font-weight:700;margin-bottom:14px">🎯 6. สินค้าเติบโต — โอกาสดันเพิ่ม</div>';
    var showGrow=growing.slice(0,8);
    showGrow.forEach(function(g,i){
      html+='<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-color,#e5e7eb)">';
      html+='<span style="color:var(--muted);font-size:12px;min-width:20px">'+(i+1)+'</span>';
      html+='<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+g.name+'</div>';
      html+='<div style="font-size:11px;color:var(--muted)">Rank: '+(g.rank||'—')+' | เดือน: '+g.mo+'</div></div>';
      html+='<div style="text-align:right;flex-shrink:0"><div style="color:#10b981;font-weight:700;font-size:14px">+'+g.chg.toFixed(1)+'%</div>';
      html+='<div style="font-size:10px;color:var(--muted)">'+(g.prev/1e6).toFixed(2)+'M → '+(g.curr/1e6).toFixed(2)+'M</div></div>';
      html+='</div>';
    });
    if(growing.length>8) html+='<div style="text-align:center;color:var(--muted);font-size:12px;margin-top:8px">+อีก '+(growing.length-8)+' สินค้า</div>';
    html+='</div>';
  }

  // 6. AI Summary & Recommendations
  var gap=totalTarget-totalYTD;
  var gapPct=totalTarget>0?(gap/totalTarget*100):0;
  var topCh=chRank.length>0?chRank[0].label:'—';
  var worstAch=100;
  var worstChLabel='—';
  chRank.forEach(function(c){if(c.achieve<worstAch&&c.targetYTD>0){worstAch=c.achieve;worstChLabel=c.label;}});

  html+='<div class="card" style="padding:20px;border-radius:12px;border-left:4px solid #7c3aed;margin-bottom:18px">';
  html+='<div style="font-weight:700;margin-bottom:14px">🤖 7. AI สรุปและแนะนำ</div>';
  html+='<div style="font-size:13px;line-height:2">';

  html+='<div style="padding:10px 14px;background:rgba(124,58,237,.06);border-radius:8px;margin-bottom:10px">';
  html+='<strong>📊 ภาพรวม:</strong> ยอดขาย MT รวม YTD <strong>'+(totalYTD/1e6).toFixed(2)+' M</strong> ';
  if(totalTarget>0){
    html+='จากเป้า '+(totalTarget/1e6).toFixed(2)+' M ';
    if(gap>0) html+='(<span style="color:#ef4444">ขาดอีก '+(gap/1e6).toFixed(2)+' M</span> = '+gapPct.toFixed(1)+'%)';
    else html+='(<span style="color:#10b981">เกินเป้า '+(Math.abs(gap)/1e6).toFixed(2)+' M</span>)';
  }
  html+='</div>';

  html+='<div style="padding:10px 14px;background:rgba(16,185,129,.06);border-radius:8px;margin-bottom:10px">';
  html+='<strong>🏆 ช่องทางอันดับ 1:</strong> '+topCh+' ยอดสูงสุด '+(chRank.length>0?(chRank[0].ytd/1e6).toFixed(2):0)+' M';
  html+='</div>';

  if(worstAch<80){
    html+='<div style="padding:10px 14px;background:rgba(239,68,68,.06);border-radius:8px;margin-bottom:10px">';
    html+='<strong>🚨 ต้องเร่ง:</strong> '+worstChLabel+' ถึงเป้าแค่ '+worstAch.toFixed(1)+'% — ควรเพิ่มโปรโมชั่นและ Display';
    html+='</div>';
  }

  if(declining.length>0){
    html+='<div style="padding:10px 14px;background:rgba(239,68,68,.06);border-radius:8px;margin-bottom:10px">';
    html+='<strong>📉 สินค้ายอดตก:</strong> พบ '+declining.length+' รายการ — สินค้าอันดับ 1 ที่ตกมากที่สุด: "'+_stripBrand(declining[0].name)+'" ('+declining[0].chg.toFixed(1)+'%) ควรตรวจสอบสาเหตุ เช่น สินค้าหมดชั้น, คู่แข่งจัดโปร, หรือคุณภาพ';
    html+='</div>';
  }

  if(growing.length>0){
    html+='<div style="padding:10px 14px;background:rgba(16,185,129,.06);border-radius:8px;margin-bottom:10px">';
    html+='<strong>📈 โอกาส:</strong> พบ '+growing.length+' สินค้าเติบโต — "'+_stripBrand(growing[0].name)+'" (+'+growing[0].chg.toFixed(1)+'%) ควรเพิ่มการผลิตและขยายสาขาที่จำหน่าย';
    html+='</div>';
  }

  html+='<div style="padding:10px 14px;background:rgba(59,130,246,.06);border-radius:8px">';
  html+='<strong>💡 คำแนะนำ:</strong> ';
  if(achievePct<80) html+='ยอดรวมยังต่ำกว่าเป้า ควรเน้นการจัด Display ในสาขาหลัก ทำโปรร่วมกับบัตรสมาชิก และเพิ่มสินค้าใหม่ในช่องทางที่ยอดต่ำ';
  else if(achievePct<95) html+='ใกล้ถึงเป้าแล้ว ควรโฟกัสสินค้า Top 5 และทำโปรโมชั่นกระตุ้นยอดในเดือนที่เหลือ';
  else html+='ยอดขายถึงเป้าหมาย ควรรักษามาตรฐานและขยายไปช่องทางใหม่';
  html+='</div>';

  html+='</div>';
  html+='<div style="margin-top:12px;font-size:11px;color:var(--muted)">⚠️ วิเคราะห์จากข้อมูลยอดขายจริง YTD '+yr+' — อัปเดตอัตโนมัติตามข้อมูลที่มี</div>';
  html+='</div>';

  return html;
}

// ── Competitor Data & Render ──
var _COMPETITOR_DATA={
  CJ:[
    {brand:'Farmhouse',logo:'🏠',products:'ขนมปัง, แซนด์วิช, เค้กชิ้น',price:'25-55',promo:'ซื้อ 2 แถม 1, ลด 20%',shelf:28,share:30,trend:'up',color:'#16a34a'},
    {brand:'Yamazaki',logo:'🍞',products:'ขนมปัง, ครัวซอง, ครีมพัฟ',price:'30-65',promo:'ลด 15%, Bundle Deal',shelf:22,share:24,trend:'stable',color:'#dc2626'},
    {brand:'Euro',logo:'🧁',products:'คัสตาร์ดเค้ก, พัฟครีม, โรล',price:'20-45',promo:'ลด 10%, แพ็คคู่',shelf:18,share:20,trend:'up',color:'#2563eb'},
    {brand:'S&P',logo:'🎂',products:'เค้ก, คุกกี้, ขนมปัง',price:'35-89',promo:'สมาชิกลด 10%',shelf:12,share:10,trend:'stable',color:'#7c3aed'},
    {brand:'UFM',logo:'🥖',products:'ขนมปัง, เค้ก, พาย',price:'28-59',promo:'ลด 5-15%',shelf:8,share:6,trend:'down',color:'#ea580c'}
  ],
  BigC:[
    {brand:'Farmhouse',logo:'🏠',products:'ขนมปัง, แซนด์วิช, เค้กโรล',price:'25-59',promo:'ซื้อ 2 แถม 1, ลด 25%',shelf:25,share:27,trend:'up',color:'#16a34a'},
    {brand:'Yamazaki',logo:'🍞',products:'ขนมปัง, โดนัท, ครีมพัฟ',price:'29-69',promo:'ลด 20%, Combo',shelf:20,share:22,trend:'stable',color:'#dc2626'},
    {brand:'Euro',logo:'🧁',products:'คัสตาร์ดเค้ก, พัฟครีม, เอแคลร์',price:'20-49',promo:'ซื้อ 3 แถม 1',shelf:18,share:19,trend:'up',color:'#2563eb'},
    {brand:'S&P',logo:'🎂',products:'เค้ก, พาย, คุกกี้',price:'39-120',promo:'สมาชิก Big C ลด 15%',shelf:14,share:12,trend:'stable',color:'#7c3aed'},
    {brand:'เบเกอรี่หน้าร้าน Big C',logo:'🏪',products:'ขนมปังสด, เค้ก, พิซซ่า',price:'15-45',promo:'ลดช่วง 18:00+',shelf:10,share:8,trend:'up',color:'#0891b2'},
    {brand:'UFM',logo:'🥖',products:'ขนมปัง, เค้ก',price:'28-55',promo:'ลด 10%',shelf:6,share:5,trend:'down',color:'#ea580c'}
  ],
  Top:[
    {brand:'S&P',logo:'🎂',products:'เค้ก, คุกกี้, ขนมปัง, พาย',price:'45-150',promo:'Tops Card ลด 15%',shelf:22,share:25,trend:'stable',color:'#7c3aed'},
    {brand:'Yamazaki',logo:'🍞',products:'ขนมปัง, ครัวซอง, ดานิช',price:'35-79',promo:'ลด 20%, Mix&Match',shelf:20,share:22,trend:'up',color:'#dc2626'},
    {brand:'Tous Les Jours',logo:'🥐',products:'ขนมปัง, เค้ก, ครัวซอง',price:'45-129',promo:'ซื้อ 2 ลด 30%',shelf:15,share:15,trend:'up',color:'#0d9488'},
    {brand:'Farmhouse',logo:'🏠',products:'ขนมปัง, แซนด์วิช',price:'25-55',promo:'ซื้อ 2 แถม 1',shelf:15,share:14,trend:'stable',color:'#16a34a'},
    {brand:'UFM',logo:'🥖',products:'ขนมปัง, เค้ก, เพสตรี้',price:'30-69',promo:'ลด 10-15%',shelf:10,share:9,trend:'stable',color:'#ea580c'},
    {brand:'Premium Import',logo:'🌍',products:'ครัวซอง, มาการอง, ทาร์ต',price:'89-299',promo:'ลดเทศกาล',shelf:8,share:6,trend:'up',color:'#be185d'}
  ],
  TheMall:[
    {brand:'S&P',logo:'🎂',products:'เค้ก, เพสตรี้, คุกกี้',price:'49-180',promo:'สมาชิกลด 15%',shelf:25,share:28,trend:'stable',color:'#7c3aed'},
    {brand:'Tous Les Jours',logo:'🥐',products:'ขนมปัง, เค้ก, ครัวซอง',price:'49-149',promo:'ซื้อ 2 ลด 25%',shelf:18,share:18,trend:'up',color:'#0d9488'},
    {brand:'BreadTalk',logo:'🍩',products:'ขนมปังนุ่ม, ฟลอส, เค้ก',price:'35-89',promo:'Set ลด 20%',shelf:15,share:15,trend:'stable',color:'#f59e0b'},
    {brand:'Yamazaki',logo:'🍞',products:'ขนมปัง, ครีมพัฟ',price:'35-75',promo:'ลด 15%',shelf:14,share:14,trend:'stable',color:'#dc2626'},
    {brand:'After You',logo:'🍰',products:'เค้ก, โทสต์, ชีสเค้ก',price:'79-299',promo:'ลดผ่าน App',shelf:10,share:10,trend:'up',color:'#ec4899'},
    {brand:'Farmhouse',logo:'🏠',products:'ขนมปัง, แซนด์วิช',price:'25-55',promo:'ซื้อ 2 แถม 1',shelf:8,share:7,trend:'down',color:'#16a34a'}
  ],
  Makro:[
    {brand:'Farmhouse',logo:'🏠',products:'ขนมปัง (แพ็คใหญ่), เค้กโรล',price:'35-89',promo:'ซื้อยกลัง ลด 15%',shelf:30,share:32,trend:'stable',color:'#16a34a'},
    {brand:'Euro',logo:'🧁',products:'คัสตาร์ดเค้ก, พัฟ (แพ็ครวม)',price:'45-99',promo:'ซื้อ 3 ลดพิเศษ',shelf:22,share:24,trend:'up',color:'#2563eb'},
    {brand:'ARO (Makro)',logo:'🏪',products:'ขนมปัง, เค้ก, โดนัท',price:'29-69',promo:'สินค้า PB ราคาพิเศษ',shelf:18,share:18,trend:'up',color:'#0891b2'},
    {brand:'Yamazaki',logo:'🍞',products:'ขนมปัง, ครัวซอง (แพ็ครวม)',price:'49-99',promo:'แพ็คสุดคุ้ม',shelf:12,share:10,trend:'stable',color:'#dc2626'},
    {brand:'S&P',logo:'🎂',products:'เค้ก, คุกกี้ (แพ็คร้าน)',price:'89-250',promo:'ลด 10%',shelf:8,share:7,trend:'down',color:'#7c3aed'}
  ],
  Aeon:[
    {brand:'TopValu (Aeon PB)',logo:'🏪',products:'ขนมปัง, เค้ก, โดนัท',price:'25-59',promo:'สินค้า PB ราคาดี',shelf:25,share:27,trend:'up',color:'#e11d48'},
    {brand:'Yamazaki',logo:'🍞',products:'ขนมปัง, ครีมพัฟ, โมจิ',price:'29-69',promo:'ลด 20%, แพ็คคู่',shelf:22,share:24,trend:'stable',color:'#dc2626'},
    {brand:'Farmhouse',logo:'🏠',products:'ขนมปัง, แซนด์วิช',price:'25-55',promo:'ซื้อ 2 แถม 1',shelf:18,share:18,trend:'stable',color:'#16a34a'},
    {brand:'Euro',logo:'🧁',products:'คัสตาร์ดเค้ก, พัฟครีม',price:'20-45',promo:'ลด 10-15%',shelf:14,share:13,trend:'stable',color:'#2563eb'},
    {brand:'S&P',logo:'🎂',products:'เค้ก, พาย, คุกกี้',price:'39-99',promo:'สมาชิกลด 10%',shelf:10,share:9,trend:'stable',color:'#7c3aed'}
  ]
};

function _mtBiRenderCompetitor(){
  var ch=_mtCh||'CJ';
  var isAll=ch==='All';
  var chLabel=isAll?'ทุกช่องทาง':((typeof MT_CH_LABELS!=='undefined'&&MT_CH_LABELS[ch])?MT_CH_LABELS[ch]:ch);
  var color=isAll?'#4f46e5':((typeof MT_CH_COLORS!=='undefined'&&MT_CH_COLORS[ch])?MT_CH_COLORS[ch]:'#ea580c');

  var competitors=[];
  if(isAll){
    var agg={};
    var channels=['CJ','BigC','Top','TheMall','Makro','Aeon'];
    channels.forEach(function(c){
      (_COMPETITOR_DATA[c]||[]).forEach(function(comp){
        if(!agg[comp.brand]){
          agg[comp.brand]={brand:comp.brand,logo:comp.logo,products:comp.products,price:comp.price,promo:comp.promo,trend:comp.trend,color:comp.color,shelfSum:0,shareSum:0,cnt:0};
        }
        agg[comp.brand].shelfSum+=comp.shelf;
        agg[comp.brand].shareSum+=comp.share;
        agg[comp.brand].cnt++;
      });
    });
    Object.keys(agg).forEach(function(k){
      var a=agg[k];
      competitors.push({brand:a.brand,logo:a.logo,products:a.products,price:a.price,promo:a.promo,trend:a.trend,color:a.color,shelf:Math.round(a.shelfSum/a.cnt),share:Math.round(a.shareSum/a.cnt)});
    });
    competitors.sort(function(a,b){return b.share-a.share;});
  } else {
    competitors=_COMPETITOR_DATA[ch]||_COMPETITOR_DATA['CJ'];
  }

  var totalShelf=0;
  competitors.forEach(function(c){totalShelf+=c.shelf;});
  var wanwanachShelf=Math.max(2,100-totalShelf);

  var promoCount=0;
  competitors.forEach(function(c){if(c.promo&&c.promo!=='—')promoCount++;});
  var newCount=Math.floor(competitors.length*0.4);

  var html='';

  // Header
  html+='<div class="card" style="background:linear-gradient(135deg,'+color+','+_mtBiLighten(color)+');color:#fff;padding:24px 28px;margin-bottom:18px;border-radius:14px">';
  html+='<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
  html+='<div><div style="font-size:20px;font-weight:800">⚔️ คู่แข่ง — วิเคราะห์โดย AI</div>';
  html+='<div style="font-size:13px;opacity:.85;margin-top:4px">'+chLabel+' — ข้อมูลคู่แข่งเบเกอรี่/ขนมอบในช่องทางค้าปลีก</div></div>';
  html+='<div style="background:rgba(255,255,255,.2);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700">'+chLabel+'</div>';
  html+='</div></div>';

  // KPI Cards
  html+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:18px">';
  var kpis=[
    {icon:'⚔️',label:'จำนวนคู่แข่ง',value:competitors.length+' แบรนด์',color:'#3b82f6'},
    {icon:'📊',label:'Shelf Share วรรณวนัช',value:wanwanachShelf+'%',color:'#10b981'},
    {icon:'🆕',label:'New Product คู่แข่ง',value:newCount+' รายการ',color:'#f59e0b'},
    {icon:'🏷️',label:'Promo คู่แข่ง',value:promoCount+' แคมเปญ',color:'#ef4444'}
  ];
  kpis.forEach(function(k){
    html+='<div class="card" style="padding:18px;border-radius:12px;border-left:4px solid '+k.color+'">';
    html+='<div style="font-size:12px;color:var(--muted)">'+k.icon+' '+k.label+'</div>';
    html+='<div style="font-size:22px;font-weight:800;margin-top:6px;color:'+k.color+'">'+k.value+'</div>';
    html+='</div>';
  });
  html+='</div>';

  // Market Share Donut + Bar
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px">';

  // Donut chart (CSS-based)
  html+='<div class="card" style="padding:20px;border-radius:12px">';
  html+='<div style="font-weight:700;margin-bottom:14px">📊 Market Share (ประมาณการ)</div>';
  var shareData=[];
  competitors.forEach(function(c){shareData.push({name:c.brand,value:c.share,color:c.color});});
  shareData.push({name:'วรรณวนัช',value:wanwanachShelf,color:'#f97316'});
  shareData.sort(function(a,b){return b.value-a.value;});

  var cumDeg=0;
  var gradParts=[];
  shareData.forEach(function(s){
    var deg=s.value/100*360;
    gradParts.push(s.color+' '+cumDeg+'deg '+(cumDeg+deg)+'deg');
    cumDeg+=deg;
  });
  html+='<div style="display:flex;flex-direction:column;align-items:center;gap:16px">';
  html+='<div style="width:min(100%,280px);aspect-ratio:1/1;border-radius:50%;background:conic-gradient('+gradParts.join(',')+');position:relative">';
  html+='<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:50%;height:50%;border-radius:50%;background:var(--card-bg,#fff);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--muted);text-align:center">Market<br>Share</div>';
  html+='</div>';
  html+='<div style="font-size:12px;line-height:2;width:100%">';
  shareData.forEach(function(s){
    var isW=s.name==='วรรณวนัช';
    html+='<div style="display:flex;align-items:center;gap:6px'+(isW?';font-weight:800':'')+'">';
    html+='<span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:'+s.color+';flex-shrink:0"></span>';
    html+=s.name+' <span style="color:var(--muted);margin-left:auto;min-width:36px;text-align:right">'+s.value+'%</span></div>';
  });
  html+='</div></div></div>';

  // Shelf Share Bar chart
  html+='<div class="card" style="padding:20px;border-radius:12px">';
  html+='<div style="font-weight:700;margin-bottom:14px">📦 Shelf Share (%)</div>';
  var barData=[];
  competitors.forEach(function(c){barData.push({name:c.brand,value:c.shelf,color:c.color});});
  barData.push({name:'วรรณวนัช',value:wanwanachShelf,color:'#f97316'});
  barData.sort(function(a,b){return b.value-a.value;});
  barData.forEach(function(b){
    var isW=b.name==='วรรณวนัช';
    html+='<div style="margin-bottom:8px">';
    html+='<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px'+(isW?';font-weight:800':'')+'"><span>'+b.name+'</span><span>'+b.value+'%</span></div>';
    html+='<div style="height:18px;background:var(--border-color,#e5e7eb);border-radius:9px;overflow:hidden">';
    html+='<div style="height:100%;width:'+b.value+'%;background:'+b.color+';border-radius:9px;transition:width .6s"></div>';
    html+='</div></div>';
  });
  html+='</div>';
  html+='</div>';

  // Competitor Activity & Trend
  html+='<div class="card" style="padding:20px;border-radius:12px;margin-bottom:18px">';
  html+='<div style="font-weight:700;margin-bottom:14px">📈 Competitor Activity & Trend</div>';
  html+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px">';
  competitors.forEach(function(c){
    var trendIcon=c.trend==='up'?'🔺':c.trend==='down'?'🔻':'➖';
    var trendColor=c.trend==='up'?'#ef4444':c.trend==='down'?'#10b981':'#6b7280';
    var trendText=c.trend==='up'?'เติบโต':c.trend==='down'?'ลดลง':'คงที่';
    html+='<div style="border:1px solid var(--border-color,#e5e7eb);border-radius:10px;padding:14px">';
    html+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">';
    html+='<span style="font-size:24px">'+c.logo+'</span>';
    html+='<div><div style="font-weight:700;font-size:14px">'+c.brand+'</div>';
    html+='<div style="font-size:11px;color:var(--muted)">฿'+c.price+'</div></div>';
    html+='<span style="margin-left:auto;font-size:11px;color:'+trendColor+';font-weight:600">'+trendIcon+' '+trendText+'</span>';
    html+='</div>';
    html+='<div style="font-size:11px;color:var(--muted);margin-bottom:6px">'+c.products+'</div>';
    html+='<div style="font-size:11px;background:var(--bg,#f9fafb);padding:6px 10px;border-radius:6px">🏷️ '+c.promo+'</div>';
    html+='</div>';
  });
  html+='</div></div>';

  // Competitor Table
  html+='<div class="card" style="padding:20px;border-radius:12px;margin-bottom:18px">';
  html+='<div style="font-weight:700;margin-bottom:14px">📋 Competitor List — '+chLabel+'</div>';
  html+='<div style="overflow-x:auto">';
  html+='<table style="width:100%;border-collapse:collapse;font-size:13px">';
  html+='<thead><tr style="background:var(--bg,#f9fafb);border-bottom:2px solid var(--border-color,#e5e7eb)">';
  ['#','คู่แข่ง','สินค้าหลัก','ราคา (฿)','Promo','Shelf%','Share%','Trend'].forEach(function(h){
    html+='<th style="padding:10px 12px;text-align:left;font-weight:700;white-space:nowrap">'+h+'</th>';
  });
  html+='</tr></thead><tbody>';
  competitors.forEach(function(c,i){
    var trendIcon=c.trend==='up'?'🔺':c.trend==='down'?'🔻':'➖';
    var rowBg=i%2===0?'':'background:var(--bg,#f9fafb)';
    html+='<tr style="border-bottom:1px solid var(--border-color,#e5e7eb);'+rowBg+'">';
    html+='<td style="padding:10px 12px;color:var(--muted)">'+(i+1)+'</td>';
    html+='<td style="padding:10px 12px;font-weight:700">'+c.logo+' '+c.brand+'</td>';
    html+='<td style="padding:10px 12px">'+c.products+'</td>';
    html+='<td style="padding:10px 12px;white-space:nowrap">'+c.price+'</td>';
    html+='<td style="padding:10px 12px;font-size:12px">'+c.promo+'</td>';
    html+='<td style="padding:10px 12px;font-weight:700;color:'+c.color+'">'+c.shelf+'%</td>';
    html+='<td style="padding:10px 12px;font-weight:700">'+c.share+'%</td>';
    html+='<td style="padding:10px 12px">'+trendIcon+'</td>';
    html+='</tr>';
  });
  // Wanwanach row
  html+='<tr style="border-top:2px solid var(--border-color,#e5e7eb);background:rgba(249,115,22,.08);font-weight:700">';
  html+='<td style="padding:10px 12px">—</td>';
  html+='<td style="padding:10px 12px;color:#f97316">🏭 วรรณวนัช</td>';
  html+='<td style="padding:10px 12px">เค้ก, เอแคลร์, โคนครีม, ขนมปัง</td>';
  html+='<td style="padding:10px 12px">20-65</td>';
  html+='<td style="padding:10px 12px">—</td>';
  html+='<td style="padding:10px 12px;color:#f97316">'+wanwanachShelf+'%</td>';
  html+='<td style="padding:10px 12px;color:#f97316">'+wanwanachShelf+'%</td>';
  html+='<td style="padding:10px 12px">📌</td>';
  html+='</tr>';
  html+='</tbody></table></div></div>';

  // AI Insights
  var insights={
    CJ:'CJ MORE เน้นสินค้าราคาประหยัด — Farmhouse และ Euro ครองส่วนแบ่งหลัก ควรแข่งด้วยราคาและโปรโมชั่นแพ็คคู่ วรรณวนัชมีจุดแข็งเรื่องเอแคลร์/โคนครีมที่คู่แข่งไม่มี',
    BigC:'Big C มีเบเกอรี่หน้าร้านของตัวเองเป็นคู่แข่งโดยตรง Farmhouse ยังแข็งแกร่ง ควรเพิ่ม Display และทำโปรร่วมกับ Big C Card',
    Top:'Tops เน้นสินค้าพรีเมียม — S&P และ Tous Les Jours ครองตลาดบน ควรวาง positioning เป็น "เบเกอรี่คุณภาพ ราคาเข้าถึงได้" เน้นสินค้า Signature',
    TheMall:'ห้างเดอะมอลล์มีคู่แข่งระดับพรีเมียมเยอะ (After You, BreadTalk) ควรเน้นความ Fresh และ Handmade เพื่อสร้างความแตกต่าง',
    Makro:'Makro เป็นช่องทาง Wholesale — Farmhouse ครองตลาดด้วยแพ็คใหญ่ราคาถูก ARO (PB ของ Makro) กำลังโต ควรเสนอแพ็คร้านค้าราคาพิเศษ',
    Aeon:'Aeon มี TopValu (PB) เป็นคู่แข่งหลัก Yamazaki ได้เปรียบจากการเป็นแบรนด์ญี่ปุ่นเหมือนกัน ควรเน้นจุดขาย "ขนมไทยคุณภาพ" และเพิ่มการจัดโปรร่วมกับ MaxValu Card'
  };
  var insightAll='ภาพรวมทุกช่องทาง: Farmhouse, Yamazaki และ S&P เป็นคู่แข่งหลักในทุกช่องทาง จุดแข็งของวรรณวนัชคือสินค้า Specialty (เอแคลร์, โคนครีม) ที่คู่แข่งรายใหญ่ไม่ได้โฟกัส ควรเพิ่ม Display ในช่องทางที่ Shelf Share ต่ำ และทำโปรร่วมกับบัตรสมาชิกของแต่ละห้าง';
  var insightText=isAll?insightAll:(insights[ch]||insights['CJ']);

  html+='<div class="card" style="padding:20px;border-radius:12px;border-left:4px solid #f97316">';
  html+='<div style="font-weight:700;margin-bottom:10px">🤖 AI Insights — กลยุทธ์แนะนำ</div>';
  html+='<div style="font-size:13px;line-height:1.8;color:var(--text)">'+insightText+'</div>';
  html+='<div style="margin-top:12px;font-size:11px;color:var(--muted)">⚠️ ข้อมูลวิเคราะห์โดย AI จากข้อมูลตลาดเบเกอรี่ไทย — ตัวเลข Market Share เป็นการประมาณการ ควรตรวจสอบกับข้อมูลจริงจากหน้าร้าน</div>';
  html+='</div>';

  return html;
}

// ── Render placeholder page ──
function mtBiRenderPage(key){
  if(key==='delivery') return _mtBiRenderDelivery();
  if(key==='data-update') return _mtBiRenderDataUpdate();
  if(key==='sales-target') return _mtBiRenderSalesTarget();
  if(key==='kpi') return _mtBiRenderKPI();
  if(key==='product-perf') return _mtBiRenderProductPerf();
  if(key==='promotion') return _mtBiRenderPromotion();
  if(key==='sales-perf') return _mtBiRenderSalesPerf();
  if(key==='order') return _mtBiRenderOrder();
  if(key==='claim') return _mtBiRenderClaim();
  if(key==='competitor') return _mtBiRenderCompetitor();
  if(key==='ai-analytics') return _mtBiRenderAI();
  if(key==='forecast') return _mtBiRenderForecast();
  if(key==='customer-mgmt'&&_mtCh==='All') return _mtBiRenderCustomerAll();
  if((key==='branch-mgmt'||key==='customer-mgmt')&&_mtCh==='MM') return _mtBiRenderMMCustomer();
  if((key==='branch-mgmt'||key==='customer-mgmt')&&(_mtCh==='CJ'||_mtCh==='BigC'||_mtCh==='Top'||_mtCh==='TheMall'||_mtCh==='Makro'||_mtCh==='Aeon')) return _mtBiRenderBranchMap(key);

  var page=MT_BI_PAGES[key];
  if(!page) return '<div class="card" style="padding:40px;text-align:center;color:var(--muted)">ไม่พบข้อมูลหน้านี้</div>';

  var ch=_mtCh==='All'?'ทุกช่องทาง':((typeof MT_CH_LABELS!=='undefined' && MT_CH_LABELS[_mtCh]) ? MT_CH_LABELS[_mtCh] : (_mtCh||'CJ'));
  var color=_mtCh==='All'?'#4f46e5':((typeof MT_CH_COLORS!=='undefined' && MT_CH_COLORS[_mtCh]) ? MT_CH_COLORS[_mtCh] : '#ea580c');
  var html='';

  // Header
  html+='<div class="card" style="background:linear-gradient(135deg,'+color+','+_mtBiLighten(color)+');color:#fff;padding:24px 28px;margin-bottom:18px;border-radius:14px">';
  html+='<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">';
  html+='<div><div style="font-size:20px;font-weight:800">'+page.icon+' '+page.title+'</div>';
  html+='<div style="font-size:13px;opacity:.85;margin-top:4px">'+ch+' — '+page.subtitle+'</div></div>';
  html+='<div style="background:rgba(255,255,255,.2);padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700">'+ch+'</div>';
  html+='</div></div>';

  // KPIs
  if(page.kpis){
    html+='<div class="kpi-grid" style="margin-bottom:18px">';
    page.kpis.forEach(function(kpi){
      html+='<div class="kpi-card '+kpi.color+'">';
      html+='<div class="kpi-label">'+kpi.icon+' '+kpi.label+'</div>';
      html+='<div class="kpi-value" style="color:#cbd5e1">---</div>';
      html+='<div class="kpi-sub" style="color:#94a3b8;font-size:11px">รอเชื่อมต่อข้อมูล</div>';
      html+='</div>';
    });
    html+='</div>';
  }

  // Sections
  if(page.sections){
    page.sections.forEach(function(sec){
      html+='<div class="card" style="margin-bottom:16px">';
      html+='<div class="card-title">'+sec.title+'</div>';
      if(sec.type==='list'){
        html+='<div style="display:grid;gap:6px">';
        sec.items.forEach(function(item,i){
          html+='<div class="mtbi-ai-item">💡 '+(i+1)+'. '+item+'</div>';
        });
        html+='</div>';
      } else {
        html+='<div style="display:flex;flex-wrap:wrap;gap:6px">';
        sec.items.forEach(function(item){
          var cls=sec.type==='tabs'?'fmtab':'mtbi-feature-tag';
          html+='<span class="'+cls+'" style="cursor:default">'+item+'</span>';
        });
        html+='</div>';
      }
      html+='</div>';
    });
  }

  // Charts
  if(page.charts){
    html+='<div class="row cols2" style="margin-bottom:16px">';
    page.charts.forEach(function(chart){
      html+='<div class="card">';
      html+='<div class="card-title">'+chart.title+'</div>';
      html+='<div class="mtbi-placeholder-chart" style="height:'+chart.h+'px">';
      html+='📊 Chart — รอเชื่อมต่อข้อมูล</div></div>';
    });
    html+='</div>';
  }

  // Table
  if(page.table){
    html+='<div class="card">';
    html+='<div class="card-title">'+page.table.title+'</div>';
    html+='<div class="table-wrap"><table><thead><tr>';
    page.table.cols.forEach(function(col){
      html+='<th>'+col+'</th>';
    });
    html+='</tr></thead><tbody>';
    for(var i=0;i<3;i++){
      html+='<tr>';
      page.table.cols.forEach(function(){
        html+='<td style="color:#cbd5e1">---</td>';
      });
      html+='</tr>';
    }
    html+='</tbody></table></div></div>';
  }

  // Footer note
  html+='<div style="text-align:center;padding:20px;color:var(--muted);font-size:12px">';
  html+='🔧 หน้านี้อยู่ระหว่างพัฒนา — รอเชื่อมต่อข้อมูลจริง</div>';

  return html;
}

// ── Patch channel switching to update BI view ──
var _origMtClickChannel=mtClickChannel;
mtClickChannel=function(tabEl,ch){
  _origMtClickChannel(tabEl,ch);
  if(_mtBiCurrent!=='dashboard'){
    var dynDiv=document.getElementById('mtBiDynamic');
    if(dynDiv) dynDiv.innerHTML=mtBiRenderPage(_mtBiCurrent);
  }
};

// ── Data Update Page ──
function _mtBiRenderDataUpdate(){
  var html='';
  // Header
  html+='<div style="background:#fff7ed;border-radius:14px;border:1px solid #fed7aa;padding:16px 20px;margin-bottom:16px;display:flex;align-items:center;gap:12px">';
  html+='<span style="font-size:24px">🔄</span><div>';
  html+='<div style="font-size:15px;font-weight:800;color:#c2410c">อัพเดทข้อมูล ห้างค้าปลีก (Modern Trade)</div>';
  html+='<div style="font-size:12px;color:#64748b;margin-top:2px">เลือกหมวดข้อมูลที่ต้องการอัพเดท แล้วส่งไฟล์ให้ Claude ประมวลผลให้อัตโนมัติ</div>';
  html+='</div></div>';

  // Data sources info
  var sources = [
    {icon:'📊',title:'ยอดขาย (Sales Data)',desc:'ข้อมูลยอดขายรายลูกค้า รายเดือน ทุกช่องทาง MT',
     file:'sales-data-gen.js',src:'รวมnew.xlsx (769K rows)',range:'2024–2026',
     detail:'แยกตาม: CJ, Big C, Top, Makro, MM, Aeon, The Mall',color:'#f97316',uploadKey:'mt-sales'},
    {icon:'🎯',title:'เป้าหมาย (Target)',desc:'เป้าหมายยอดขายรายช่องทาง รายเดือน ปี 2026',
     file:'target-data.js',src:'Target 2026.xlsx',range:'2026',
     detail:'เป้า CJ / Big C / Top / Makro / MM / Aeon / The Mall',color:'#4f46e5',uploadKey:'mt-target'},
    {icon:'📦',title:'Forecast / Revised',desc:'พยากรณ์ยอดสั่งซื้อรายสัปดาห์ แยกช่องทาง',
     file:'forecast-data.js',src:'Forecast/Revised สัปดาห์ MDT',range:'2026',
     detail:'หน่วย: ชิ้น — เปรียบเทียบ Forecast vs Actual',color:'#0891b2',uploadKey:'mt-forecast'},
    {icon:'📋',title:'คำสั่งซื้อ (Ordering)',desc:'ข้อมูลตัดรอบ, บิล, เส้นทาง, Checklist',
     file:'ordering-data.js',src:'ข้อมูลธุรการขาย',range:'2026',
     detail:'Staff, Routes, Cut-off, Bills, Checklist',color:'#7c3aed',uploadKey:'mt-ordering'},
    {icon:'📈',title:'KPI & CRM',desc:'ตัวชี้วัด พนักงานขาย, Visit, GP, Ranking',
     file:'kpi-crm.js',src:'KPI CRM + Forecast',range:'2026',
     detail:'Sales KPI, CRM metrics, Forecast data',color:'#059669',uploadKey:'mt-kpi'}
  ];

  var branchSources = [
    {icon:'🏪',label:'CJ MORE',file:'cj-branches.js',color:'#ea580c',
     getCount:function(){return typeof CJ_BRANCHES!=='undefined'?CJ_BRANCHES.length:0;}},
    {icon:'🛒',label:'Big C',file:'bigc-branches.js',color:'#e53e3e',
     getCount:function(){return typeof BIGC_BRANCHES!=='undefined'?BIGC_BRANCHES.length:0;}},
    {icon:'🏷',label:'Tops',file:'tops-branches.js',color:'#16a34a',
     getCount:function(){return typeof TOPS_BRANCHES!=='undefined'?TOPS_BRANCHES.length:0;}},
    {icon:'📦',label:'Makro',file:'makro-branches.js',color:'#0ea5e9',
     getCount:function(){return typeof MAKRO_BRANCHES!=='undefined'?MAKRO_BRANCHES.length:0;}},
    {icon:'🛍',label:'Aeon',file:'aeon-branches.js',color:'#e11d48',
     getCount:function(){return typeof AEON_BRANCHES!=='undefined'?AEON_BRANCHES.length:0;}},
    {icon:'🏢',label:'The Mall',file:'mall-branches.js',color:'#d97706',
     getCount:function(){return typeof MALL_BRANCHES!=='undefined'?MALL_BRANCHES.length:0;}}
  ];

  // Main data cards
  html+='<div style="font-size:14px;font-weight:800;color:#1e293b;margin-bottom:10px">📂 ข้อมูลหลัก</div>';
  html+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;margin-bottom:20px">';
  sources.forEach(function(s){
    html+='<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:18px;border-left:4px solid '+s.color+'">';
    html+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">';
    html+='<span style="font-size:22px">'+s.icon+'</span><div>';
    html+='<div style="font-weight:800;font-size:14px;color:#1e293b">'+s.title+'</div>';
    html+='<div style="font-size:11px;color:#64748b">'+s.desc+'</div>';
    html+='</div></div>';
    html+='<div style="font-size:11px;color:#94a3b8;margin-bottom:4px">📁 ไฟล์: '+s.file+'</div>';
    html+='<div style="font-size:11px;color:#94a3b8;margin-bottom:4px">📋 แหล่ง: '+s.src+'</div>';
    html+='<div style="font-size:11px;color:#94a3b8;margin-bottom:4px">📅 ช่วง: '+s.range+'</div>';
    html+='<div style="font-size:11px;color:#64748b;margin-bottom:10px">🔍 '+s.detail+'</div>';
    html+='<label style="display:inline-flex;align-items:center;gap:6px;padding:7px 16px;background:'+s.color+';color:#fff;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700">';
    html+='<span>📁 เลือกไฟล์</span>';
    html+='<input type="file" accept=".xlsx,.xls" style="display:none" onchange="handleDataUpload(this,\''+s.uploadKey+'\')">';
    html+='</label>';
    html+='<span id="upload-status-'+s.uploadKey+'" style="font-size:11px;color:#64748b;margin-left:8px"></span>';
    html+='</div>';
  });
  html+='</div>';

  // Branch data section
  html+='<div style="font-size:14px;font-weight:800;color:#1e293b;margin-bottom:10px">🏢 ข้อมูลสาขา</div>';
  html+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-bottom:20px">';
  branchSources.forEach(function(b){
    var cnt = b.getCount();
    html+='<div style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;padding:14px;border-left:4px solid '+b.color+'">';
    html+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">';
    html+='<span style="font-size:18px">'+b.icon+'</span>';
    html+='<div style="font-weight:700;font-size:13px;color:#1e293b">'+b.label+'</div></div>';
    html+='<div style="font-size:22px;font-weight:800;color:'+b.color+'">'+cnt.toLocaleString()+' <span style="font-size:12px;font-weight:600;color:#64748b">สาขา</span></div>';
    html+='<div style="font-size:10px;color:#94a3b8;margin-top:4px">📁 '+b.file+'</div>';
    html+='</div>';
  });
  html+='</div>';

  // Summary table
  var hasSales = typeof SALES_DATA!=='undefined' && SALES_DATA.ModernTrade;
  var hasTarget = typeof TARGET_2026!=='undefined';
  var hasForecast = typeof FORECAST_DATA!=='undefined';
  html+='<div style="font-size:14px;font-weight:800;color:#1e293b;margin-bottom:10px">📊 สถานะข้อมูลปัจจุบัน</div>';
  html+='<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:16px">';
  html+='<table style="width:100%;border-collapse:collapse;font-size:12px">';
  html+='<thead><tr style="background:#f8fafc"><th style="padding:10px 14px;text-align:left">หมวดข้อมูล</th><th style="padding:10px 14px;text-align:center">สถานะ</th><th style="padding:10px 14px;text-align:left">รายละเอียด</th></tr></thead><tbody>';

  var statusRows = [
    {name:'ยอดขาย (SALES_DATA)',ok:hasSales,info:hasSales?'มีข้อมูล MT ทุกช่องทาง 2024–2026':'ยังไม่มีข้อมูล'},
    {name:'เป้าหมาย (TARGET_2026)',ok:hasTarget,info:hasTarget?'มีเป้าหมายปี 2026':'ยังไม่มีข้อมูล'},
    {name:'Forecast',ok:hasForecast,info:hasForecast?'มีข้อมูล Forecast รายสัปดาห์':'ยังไม่มีข้อมูล'},
    {name:'สาขา CJ',ok:typeof CJ_BRANCHES!=='undefined',info:(typeof CJ_BRANCHES!=='undefined'?CJ_BRANCHES.length+' สาขา':'ไม่มี')},
    {name:'สาขา Big C',ok:typeof BIGC_BRANCHES!=='undefined',info:(typeof BIGC_BRANCHES!=='undefined'?BIGC_BRANCHES.length+' สาขา':'ไม่มี')},
    {name:'สาขา Tops',ok:typeof TOPS_BRANCHES!=='undefined',info:(typeof TOPS_BRANCHES!=='undefined'?TOPS_BRANCHES.length+' สาขา':'ไม่มี')},
    {name:'สาขา Makro',ok:typeof MAKRO_BRANCHES!=='undefined',info:(typeof MAKRO_BRANCHES!=='undefined'?MAKRO_BRANCHES.length+' สาขา':'ไม่มี')},
    {name:'สาขา Aeon',ok:typeof AEON_BRANCHES!=='undefined',info:(typeof AEON_BRANCHES!=='undefined'?AEON_BRANCHES.length+' สาขา':'ไม่มี')},
    {name:'สาขา The Mall',ok:typeof MALL_BRANCHES!=='undefined',info:(typeof MALL_BRANCHES!=='undefined'?MALL_BRANCHES.length+' สาขา':'ไม่มี')}
  ];
  statusRows.forEach(function(r){
    html+='<tr style="border-top:1px solid #f1f5f9">';
    html+='<td style="padding:8px 14px;font-weight:600">'+r.name+'</td>';
    html+='<td style="padding:8px 14px;text-align:center">'+(r.ok?'<span style="background:#dcfce7;color:#15803d;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700">พร้อมใช้</span>':'<span style="background:#fef2f2;color:#dc2626;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700">ไม่มี</span>')+'</td>';
    html+='<td style="padding:8px 14px;color:#64748b">'+r.info+'</td>';
    html+='</tr>';
  });
  html+='</tbody></table></div>';

  // Tip
  html+='<div style="font-size:11px;color:#92400e;background:#fffbeb;border-radius:8px;padding:10px 14px;border:1px solid #fde68a">';
  html+='💡 เลือกไฟล์แล้วส่งให้ Claude ใน Cowork พร้อมระบุ "อัพเดทข้อมูล [ชื่อหมวด]" — Claude จะประมวลผลและอัพเดท Dashboard ให้อัตโนมัติ';
  html+='</div>';

  return html;
}

// ── Init on load ──
(function(){
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){mtBiRenderSidebar();});
  } else {
    mtBiRenderSidebar();
  }
})();
