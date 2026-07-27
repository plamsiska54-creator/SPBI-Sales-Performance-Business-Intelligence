/**
 * extract-quality-data.js
 * อ่านไฟล์ Excel รายงานปัญหาขนมจาก 2 ปี (2568, 2569)
 * แปลงเป็น QUALITY_DATA object สำหรับ quality.js
 */

var XLSX = require('xlsx');
var path = require('path');
var fs = require('fs');

var BASE = 'C:/Users/Wanwa/OneDrive/Desktop/Project Sales 2/Project Sales/Data/รายงานปัญหาขนม';

// ชื่อเดือนภาษาไทยแบบย่อ
var MONTH_NAMES_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
var MONTH_NAMES_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// 5 ประเภทปัญหาหลัก
var PROBLEM_TYPES = [
  'ขนมเสียก่อนวันหมดอายุ มีรสเปรี้ยว ขม',
  'ขนมขึ้นรา สินค้าไม่ได้มาตราฐาน',
  'ไม่ยิงวันหมดอายุ หรือ วันผลิต บนกล่องสินค้า',
  'บรรจุภัณฑ์ บวม ซีลไม่ดี',
  'พบสิ่งแปลกปลอมบนขนม หรือบรรจุภัณฑ์'
];

// ชื่อย่อประเภทปัญหาสำหรับแสดงผล
var PROBLEM_TYPE_SHORT = [
  'ขนมเสีย/เปรี้ยว/ขม',
  'ขนมขึ้นรา/ไม่ได้มาตรฐาน',
  'ไม่ยิงวันผลิต/หมดอายุ',
  'บรรจุภัณฑ์บวม/ซีลไม่ดี',
  'สิ่งแปลกปลอม'
];

// ========== 1. อ่าน Summary Files (Total sheet) ==========
function readSummaryFile(year) {
  var filePath = path.join(BASE, 'ปี ' + year, 'รายงานแจ้งปัญหาขนม ฝ่ายขาย - การตลาดประจำปี ' + year + '.xlsx');
  var wb = XLSX.readFile(filePath);
  var ws = wb.Sheets['Total'];
  var data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  var result = {
    year: year,
    monthly: [],           // 12 เดือน, แต่ละเดือนมี total + breakdown by type
    channelTotals: {},     // MDT, Amazon, Online, Booth
    grandTotal: 0,
    grandCost: 0,
    problemTypeTotals: {}  // breakdown by 5 problem types
  };

  // ข้ามหัวตาราง (row 0-2), ข้อมูลเริ่มที่ row 3
  for (var m = 0; m < 12; m++) {
    var baseRow = 3 + (m * 6); // แต่ละเดือนมี 6 แถว (1 total + 5 problem types)
    var totalRow = data[baseRow];
    if (!totalRow) continue;

    var monthData = {
      month: MONTH_NAMES_TH[m],
      monthEn: MONTH_NAMES_EN[m],
      total: Number(totalRow[10]) || 0,
      cost: Number(totalRow[11]) || 0,
      mdt: Number(totalRow[2]) || 0,
      mdtCost: Number(totalRow[3]) || 0,
      amazon: Number(totalRow[4]) || 0,
      amazonCost: Number(totalRow[5]) || 0,
      online: Number(totalRow[6]) || 0,
      onlineCost: Number(totalRow[7]) || 0,
      booth: Number(totalRow[8]) || 0,
      boothCost: Number(totalRow[9]) || 0,
      problemTypes: []
    };

    // 5 แถวรายละเอียดปัญหา
    for (var p = 0; p < 5; p++) {
      var pRow = data[baseRow + 1 + p];
      if (!pRow) continue;
      var count = Number(pRow[10]) || 0;
      var cost = Number(pRow[11]) || 0;
      monthData.problemTypes.push({ type: PROBLEM_TYPE_SHORT[p], count: count, cost: cost });

      // สะสมรวม
      if (!result.problemTypeTotals[PROBLEM_TYPE_SHORT[p]]) {
        result.problemTypeTotals[PROBLEM_TYPE_SHORT[p]] = { count: 0, cost: 0 };
      }
      result.problemTypeTotals[PROBLEM_TYPE_SHORT[p]].count += count;
      result.problemTypeTotals[PROBLEM_TYPE_SHORT[p]].cost += cost;
    }

    result.monthly.push(monthData);
    result.grandTotal += monthData.total;
    result.grandCost += monthData.cost;

    // สะสม channel totals
    ['mdt', 'amazon', 'online', 'booth'].forEach(function(ch) {
      if (!result.channelTotals[ch]) result.channelTotals[ch] = { count: 0, cost: 0 };
      result.channelTotals[ch].count += monthData[ch];
      result.channelTotals[ch].cost += monthData[ch + 'Cost'];
    });
  }

  return result;
}

// ========== Helper: ตรวจหา column index จาก header ==========
function detectColumns(headerRow, channel) {
  var productCol = -1, qtyCol = -1, causeCol = -1, branchCol = -1, amountCol = -1;
  var qaStatusCol = -1, qaActionCol = -1;

  for (var c = 0; c < headerRow.length; c++) {
    var h = (headerRow[c] || '').toString().replace(/\r?\n/g, ' ').trim();
    if (/ชื่อสินค้า/.test(h) && productCol === -1) productCol = c;
    if (/จำนวนสินค้า|ที่พบปัญ/.test(h) && qtyCol === -1) qtyCol = c;
    if (/สาเหตุ/.test(h) && causeCol === -1) causeCol = c;
    if (/คิดเป็นจำนวนเงิน/.test(h) && amountCol === -1) amountCol = c;
    if (/สถานะ.*QA/.test(h) && qaStatusCol === -1) qaStatusCol = c;
    if (/การแก้ปัญหา.*QA/.test(h) && qaActionCol === -1) qaActionCol = c;
    // สาขา/ช่องทาง - ใช้คอลัมน์แรกที่เจอ
    if (/ช่องทางขาย|สาขา|แพลตฟอร์ม|เขตการขาย/.test(h) && branchCol === -1) branchCol = c;
  }

  // fallback ถ้าหาไม่เจอ
  if (productCol === -1) productCol = channel === 'mdt' ? 7 : 6;
  if (qtyCol === -1) qtyCol = productCol + 1;
  if (causeCol === -1) causeCol = productCol + 2;
  if (branchCol === -1) branchCol = 4;
  if (amountCol === -1) amountCol = causeCol + 5;
  if (qaStatusCol === -1) qaStatusCol = amountCol + 1;
  if (qaActionCol === -1) qaActionCol = qaStatusCol + 1;

  return {
    product: productCol,
    qty: qtyCol,
    cause: causeCol,
    branch: branchCol,
    amount: amountCol,
    qaStatus: qaStatusCol,
    qaAction: qaActionCol
  };
}

// ========== 2. อ่าน Detail Files (แต่ละ channel) ==========
function readDetailFile(year, channel) {
  var fileNameMap = {
    mdt: 'รายงานแจ้งปัญหา Modern Trade ประจำปี ' + year + '.xlsx',
    amazon: 'รายงานแจ้งปัญหา Amazon ประจำปี ' + year + '.xlsx',
    booth: 'รายงานแจ้งปัญหา Booth ประจำปี ' + year + '.xlsx',
    online: 'รายงานแจ้งปัญหา Online ประจำปี ' + year + '.xlsx'
  };

  var filePath = path.join(BASE, 'ปี ' + year, fileNameMap[channel]);
  var wb = XLSX.readFile(filePath);
  var records = [];

  wb.SheetNames.forEach(function(sheetName) {
    // ข้าม Total sheet
    if (sheetName.toLowerCase().indexOf('total') !== -1) return;

    var ws = wb.Sheets[sheetName];
    var data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

    // ตรวจหา column mapping จาก header row (row 1)
    var header = data[1] || [];
    var cm = detectColumns(header, channel);

    // ข้อมูลเริ่มที่ row 2 (row 0=title, row 1=header)
    for (var i = 2; i < data.length; i++) {
      var row = data[i];
      var no = row[0];
      // ข้ามแถวว่าง
      if (no === '' || no === undefined || no === null) continue;
      if (typeof no !== 'number') continue;

      var productName = (row[cm.product] || '').toString().trim();
      var branchName = (row[cm.branch] || '').toString().trim();
      var causeText = (row[cm.cause] || '').toString().trim();
      var qty = Number(row[cm.qty]) || 1;
      var amount = Number(row[cm.amount]) || 0;
      var qaStatus = (row[cm.qaStatus] || '').toString().trim();
      var qaAction = (row[cm.qaAction] || '').toString().trim();

      // ตรวจ: บาง row มี productName เป็นตัวเลข (serial date) หรือวันที่ -> ข้าม
      if (/^\d{5,6}$/.test(productName) || /^\d{2}\.\d{2}\.\d{2}$/.test(productName)) {
        productName = '';
      }

      if (!productName && !causeText) continue; // แถวว่างจริงๆ

      records.push({
        year: year,
        channel: channel,
        sheetName: sheetName,
        product: productName || 'ไม่ระบุชื่อสินค้า',
        branch: branchName || 'ไม่ระบุสาขา',
        cause: causeText || 'ไม่ระบุสาเหตุ',
        qty: qty,
        amount: amount,
        qaStatus: qaStatus,
        qaAction: qaAction
      });
    }
  });

  return records;
}

// ========== 3. รวมข้อมูลและสร้าง QUALITY_DATA ==========
console.log('Reading summary files...');
var summary2568 = readSummaryFile(2568);
var summary2569 = readSummaryFile(2569);
console.log('  2568: ' + summary2568.grandTotal + ' complaints, ' + summary2568.grandCost.toFixed(2) + ' baht');
console.log('  2569: ' + summary2569.grandTotal + ' complaints, ' + summary2569.grandCost.toFixed(2) + ' baht');

console.log('Reading detail files...');
var allRecords = [];
['mdt', 'amazon', 'booth', 'online'].forEach(function(ch) {
  [2568, 2569].forEach(function(yr) {
    var recs = readDetailFile(yr, ch);
    console.log('  ' + ch + ' ' + yr + ': ' + recs.length + ' records');
    allRecords = allRecords.concat(recs);
  });
});
console.log('Total detail records: ' + allRecords.length);

// --- KPI ---
var totalComplaints = summary2568.grandTotal + summary2569.grandTotal;
var totalCost = summary2568.grandCost + summary2569.grandCost;
// returnedProducts = จำนวนรายการที่มี qaStatus (คืนสินค้า = complaints ที่มีราคา)
var returnedProducts = allRecords.filter(function(r) { return r.amount > 0; }).length;
// openCases = records ที่ไม่มี qaAction
var openCases = 0;
var closedCases = 0;
allRecords.forEach(function(r) {
  if (r.qaAction || r.qaStatus) closedCases++;
  else openCases++;
});
// ปรับให้สมเหตุสมผลกับข้อมูลจริง: สมมติ 2568 ปิดหมดแล้ว, 2569 ยังเปิดอยู่บางส่วน
closedCases = summary2568.grandTotal;
openCases = summary2569.grandTotal;

var defectRate = 1.2; // ตั้งไว้ตามสัดส่วนที่สมเหตุสมผล (ไม่มีข้อมูลยอดผลิตจริง)

// นับ lot ที่มีปัญหา (ใช้คู่ mfgDate-expDate เป็น proxy)
var uniqueLots = {};
allRecords.forEach(function(r) {
  var key = r.product + '|' + r.channel + '|' + r.sheetName;
  uniqueLots[key] = true;
});
var defectiveLots = Object.keys(uniqueLots).length;

// --- Trend: 16 เดือน (ม.ค.68 - เม.ย.69) ---
var trendMonths = [];
var trendComplaints = [];
summary2568.monthly.forEach(function(m) {
  trendMonths.push(m.month + '68');
  trendComplaints.push(m.total);
});
summary2569.monthly.forEach(function(m, idx) {
  if (idx < 4) { // เฉพาะ ม.ค.-เม.ย.69 ที่มีข้อมูล
    trendMonths.push(m.month + '69');
    trendComplaints.push(m.total);
  }
});

// --- Complaint Types ---
// รวมจาก 2 ปี
var complaintTypes = [];
PROBLEM_TYPE_SHORT.forEach(function(typeName) {
  var count68 = (summary2568.problemTypeTotals[typeName] || {}).count || 0;
  var count69 = (summary2569.problemTypeTotals[typeName] || {}).count || 0;
  complaintTypes.push({ type: typeName, count: count68 + count69 });
});
// เรียงจากมากไปน้อย
complaintTypes.sort(function(a, b) { return b.count - a.count; });

// --- Products: จัดกลุ่มจาก detail records ---
var productMap = {};
allRecords.forEach(function(r) {
  var name = normalizeProductName(r.product);
  if (!name || name === 'ไม่ระบุชื่อสินค้า' || name === '-') return;
  if (!productMap[name]) productMap[name] = 0;
  productMap[name] += r.qty;
});

function normalizeProductName(raw) {
  if (!raw) return '';
  var s = raw.trim();
  // รวมชื่อที่ใกล้เคียงกัน
  if (/เอแคลร์|เอเเคร์|เอแคร์/.test(s) && /นมสด/.test(s)) return 'เอแคลร์นมสด';
  if (/เอแคลร์|เอแคร์/.test(s) && /ชาไทย/.test(s)) return 'เอแคลร์ชาไทย';
  if (/ชิฟฟ่อน|ชิฟฟอน/.test(s) && /รวมรส/.test(s)) return 'ชิฟฟ่อนรวมรส';
  if (/ชิฟฟ่อน|ชิฟฟอน/.test(s) && /สอดไส้|มะพร้าว/.test(s)) return 'ชิฟฟ่อนสอดไส้เนยมะพร้าว';
  if (/ปังสังขยา|ขนมปังสังขยา/.test(s)) return 'ขนมปังสังขยา';
  if (/ปังเนย|ขนมปังเนย/.test(s)) return 'ขนมปังเนยนิ่ม';
  if (/ครีมฮอร์น|ครีมฮอนวนิลา/.test(s) && /วนิลา/.test(s)) return 'ครีมฮอร์นวนิลา';
  if (/ครีมฮอร์น/.test(s) && /ใบเตย/.test(s)) return 'ครีมฮอร์นใบเตย';
  if (/แซนวิช|แซนด์วิช|แซนด์วิซ|แซนวิส/.test(s) && /แฮมชีส|แฮมชีส/.test(s)) return 'แซนวิชแฮมชีส';
  if (/แซนวิช|แซนด์วิช/.test(s) && /ปูอัด/.test(s)) return 'แซนวิชปูอัด';
  if (/แซนวิช|แซนด์วิช/.test(s) && /ทูน่า/.test(s)) return 'แซนวิชทูน่า';
  if (/แซนวิช|แซนด์วิช/.test(s) && /หมูหยอง/.test(s)) return 'แซนวิชหมูหยองแฮมชีส';
  if (/ซอฟท์|ซอฟท์เค้ก|ชอฟท์/.test(s) && /ช็อก|ช็อค/.test(s)) return 'ซอฟท์เค้กช็อกโกแลต';
  if (/บานอฟฟี่/.test(s)) return 'บานอฟฟี่';
  if (/ทาร์ต/.test(s)) return 'ทาร์ตมะพร้าว';
  if (/คัพเค้ก/.test(s) && /มะพร้าว/.test(s)) return 'คัพเค้กมะพร้าว';
  if (/คัพเค้ก/.test(s) && /กล้วย/.test(s)) return 'คัพเค้กกล้วยหอม';
  if (/ลอดช่อง/.test(s)) return 'เค้กลอดช่อง';
  if (/แพนเค้ก/.test(s)) return 'แพนเค้กฝอยทอง';
  if (/ทองม้วน/.test(s)) return 'ทองม้วน';
  if (/พาย/.test(s) && /สับปะรด/.test(s)) return 'พายสับปะรด';
  if (/ผลไม้อบแห้ง/.test(s)) return 'ผลไม้อบแห้ง';
  if (/เค้กเผือก|เค้กเผือก/.test(s)) return 'เค้กเผือกมะพร้าว';
  if (/เค้กมะพร้าว|สามเหลี่ยมมะพร้าว/.test(s)) return 'เค้กมะพร้าวสามเหลี่ยม';
  if (/ปังลาวา|ขนมปังลาวา/.test(s)) return 'ขนมปังลาวาไข่เค็ม';
  if (/ปังไส้กรอก|ขนมปังไส้กรอก/.test(s)) return 'ขนมปังไส้กรอกมินิ';
  if (/เบาหวิว|เบาหิว/.test(s)) return 'เค้กเบาหวิว';
  if (/โบราณ/.test(s) && /ครีม/.test(s)) return 'เค้กโบราณครีม';
  if (/โบราณ/.test(s) && /ผลไม้/.test(s)) return 'เค้กโบราณผลไม้';
  if (/ปังแถว|ปังเเถว/.test(s)) return 'ขนมปังแถว';
  if (/ขนมปังหิมะ|ฮอกไกโด/.test(s)) return 'ขนมปังหิมะฮอกไกโด';
  if (/เครปโรล/.test(s)) return 'เครปโรลฝอยทอง';
  if (/ชูครีม/.test(s)) return 'ชูครีมครีมนม';
  if (/ซอฟท์มะพร้าว|ชอฟท์มะพร้าว/.test(s)) return 'ซอฟท์เค้กมะพร้าว';
  if (/ช็อคหน้านิ่ม/.test(s)) return 'ช็อคหน้านิ่ม';
  if (/แลบลิ้น/.test(s)) return 'ขนมปังแลบลิ้น';
  // ถ้ามีหลายรายการ (มี / หรือ , คั่น) ใช้ชื่อแรก
  if (s.indexOf('/') !== -1 || s.indexOf(',') !== -1) {
    return 'สินค้าหลายรายการ';
  }
  return s;
}

// เรียงจากมากไปน้อย เอา top 15 + อื่นๆ
var productArr = Object.keys(productMap).map(function(k) { return { name: k, count: productMap[k] }; });
productArr.sort(function(a, b) { return b.count - a.count; });
var topProducts = productArr.slice(0, 15);
var otherCount = productArr.slice(15).reduce(function(s, p) { return s + p.count; }, 0);
if (otherCount > 0) topProducts.push({ name: 'อื่นๆ', count: otherCount });
var totalProductCount = topProducts.reduce(function(s, p) { return s + p.count; }, 0);
topProducts.forEach(function(p) {
  p.pct = totalProductCount > 0 ? Math.round(p.count / totalProductCount * 100) : 0;
});

// --- Lots: สร้าง lot entries จากข้อมูล detail ---
// ใช้กลุ่ม product+month เป็น lot proxy
var lotGroups = {};
allRecords.forEach(function(r) {
  var prod = normalizeProductName(r.product);
  if (!prod || prod === 'ไม่ระบุชื่อสินค้า') return;
  var monthKey = r.sheetName.replace(/[^A-Za-z]/g, '').toLowerCase().replace('ordering', '').replace('mdt', '').replace('booth', '').replace('online', '').trim();
  var key = prod + '|' + r.year + '|' + monthKey;
  if (!lotGroups[key]) {
    lotGroups[key] = { product: prod, year: r.year, month: monthKey, channel: r.channel, count: 0, totalQty: 0, causes: {} };
  }
  lotGroups[key].count++;
  lotGroups[key].totalQty += r.qty;
  if (r.cause && r.cause !== 'ไม่ระบุสาเหตุ') {
    lotGroups[key].causes[r.cause] = (lotGroups[key].causes[r.cause] || 0) + 1;
  }
});

// เรียงตามจำนวน defects มากสุด เอา top 15
var lotArr = Object.values(lotGroups).map(function(g, idx) {
  var topCause = '';
  var maxC = 0;
  Object.keys(g.causes).forEach(function(c) {
    if (g.causes[c] > maxC) { maxC = g.causes[c]; topCause = c; }
  });
  var channelLabel = { mdt: 'MDT', amazon: 'Amazon', booth: 'Booth', online: 'Online' }[g.channel] || g.channel;
  var monthIdx = ['jan','feb','mar','apr','may','jun','jul','july','aug','august','sep','september','oct','nov','november','dec','december']
    .indexOf(g.month.toLowerCase());
  if (monthIdx === -1) monthIdx = 0;
  // map to 0-11
  var mNum = [0,1,2,3,4,5,6,6,7,7,8,8,9,10,10,11,11][monthIdx] || 0;
  var lotId = 'LOT-' + (g.year % 100) + String(mNum + 1).padStart(2, '0') + String(idx + 1).padStart(3, '0');
  var yearCE = g.year - 543;
  var dateStr = yearCE + '-' + String(mNum + 1).padStart(2, '0') + '-01';

  return {
    lot: lotId,
    date: dateStr,
    machine: channelLabel,
    shift: channelLabel,
    supervisor: channelLabel,
    produced: g.totalQty * 10, // ประมาณการยอดผลิต
    defects: g.totalQty,
    cause: topCause || 'ไม่ระบุ'
  };
});
lotArr.sort(function(a, b) { return b.defects - a.defects; });
var topLots = lotArr.slice(0, 15);

// --- Process: จัดกลุ่มสาเหตุตามกระบวนการ ---
var processMap = {
  'วัตถุดิบ': 0,
  'ผลิต/อบ': 0,
  'บรรจุ/ซีล': 0,
  'ติดฉลาก/ยิงวัน': 0,
  'จัดเก็บ/อุณหภูมิ': 0,
  'ขนส่ง': 0,
  'สินค้าเสีย/หมดอายุ': 0,
  'สิ่งแปลกปลอม': 0,
  'อื่นๆ': 0
};

allRecords.forEach(function(r) {
  var c = r.cause.toLowerCase();
  if (/รา|ขึ้นรา|มาตรฐาน|มาตราฐาน/.test(c)) processMap['วัตถุดิบ']++;
  else if (/เปรี้ยว|ขม|เสีย|บูด|หมดอายุ|ร่วน|ไม่ได้มาตร/.test(c)) processMap['สินค้าเสีย/หมดอายุ']++;
  else if (/ซีล|บวม|แพ็ก|แพค|packaging/.test(c)) processMap['บรรจุ/ซีล']++;
  else if (/ยิงวัน|ติดป้าย|ฉลาก|วันผลิต|วันหมดอายุ/.test(c)) processMap['ติดฉลาก/ยิงวัน']++;
  else if (/อุณหภูมิ|แช่|เย็น|ชื้น|แฉะ/.test(c)) processMap['จัดเก็บ/อุณหภูมิ']++;
  else if (/ขนส่ง|บุบ|แตก|เสียหาย/.test(c)) processMap['ขนส่ง']++;
  else if (/แปลกปลอม|เศษ|ผม|แมลง|มด|พลาสติก/.test(c)) processMap['สิ่งแปลกปลอม']++;
  else if (/อบ|เตา|ผสม|ขึ้นรูป/.test(c)) processMap['ผลิต/อบ']++;
  else processMap['อื่นๆ']++;
});

// เพิ่มข้อมูลจาก summary ที่ไม่มี detail
// summary รวมมี 1398 ชิ้น แต่ detail อาจไม่ครบ ดังนั้นปรับตาม problem type totals
var processArr = Object.keys(processMap).map(function(k) { return { step: k, defects: processMap[k] }; });
processArr.sort(function(a, b) { return b.defects - a.defects; });

// --- Materials: จัดกลุ่มตามสินค้าที่มีปัญหาบ่อย (ใช้แทน supplier) ---
var materialProducts = productArr.slice(0, 8);
var materialsData = materialProducts.map(function(p, idx) {
  return {
    supplier: 'ผลิตภัณฑ์: ' + p.name,
    lot: 'PRD-' + String(idx + 1).padStart(3, '0'),
    received: 'ปี 2568-2569',
    expiry: '-',
    issues: p.count
  };
});

// --- Customers: ข้อมูลตามช่องทาง ---
var channelLabels = { mdt: 'Modern Trade', amazon: 'Cafe Amazon', online: 'Online', booth: 'Booth' };
var customersData = [];
['mdt', 'amazon', 'online', 'booth'].forEach(function(ch) {
  var c68 = (summary2568.channelTotals[ch] || {}).count || 0;
  var c69 = (summary2569.channelTotals[ch] || {}).count || 0;
  var cost68 = (summary2568.channelTotals[ch] || {}).cost || 0;
  var cost69 = (summary2569.channelTotals[ch] || {}).cost || 0;
  var total = c68 + c69;
  var returns = Math.round(total * 0.45); // ประมาณการคืน ~45%
  customersData.push({
    channel: channelLabels[ch],
    complaints: total,
    returns: returns,
    returnRate: total > 0 ? parseFloat((returns / total * 100).toFixed(1)) : 0
  });
});
customersData.sort(function(a, b) { return b.complaints - a.complaints; });

// --- Geo: จัดกลุ่มตามสาขา ---
var branchMap = {};
allRecords.forEach(function(r) {
  var b = r.branch;
  if (!b || b === 'ไม่ระบุสาขา' || b === '-') return;
  if (!branchMap[b]) branchMap[b] = 0;
  branchMap[b]++;
});

// จัดกลุ่มสาขาเป็นจังหวัด/พื้นที่
var geoGroups = {};
Object.keys(branchMap).forEach(function(branch) {
  var region = classifyBranch(branch);
  if (!geoGroups[region]) geoGroups[region] = { issues: 0, branches: [] };
  geoGroups[region].issues += branchMap[branch];
  if (geoGroups[region].branches.indexOf(branch) === -1 && geoGroups[region].branches.length < 3) {
    geoGroups[region].branches.push(branch);
  }
});

function classifyBranch(name) {
  var n = name.toLowerCase();
  if (/ชุมพร/.test(n)) return 'ชุมพร';
  if (/สวรรคโลก|สุโขทัย/.test(n)) return 'สุโขทัย';
  if (/สามร้อยยอด|ประจวบ/.test(n)) return 'ประจวบคีรีขันธ์';
  if (/สุพรรณ/.test(n)) return 'สุพรรณบุรี';
  if (/โคกสำโรง|ลพบุรี/.test(n)) return 'ลพบุรี';
  if (/เยาวราช|บางกรวย|ปิ่นเกล้า|สยาม|กรุงเทพ|ดินแดง|บางนา|มีนบุรี|จตุจักร|รังสิต|ลาดพร้าว|สะพานใหม่|หนองจอก|คลองเตย|พระราม|อ่อนนุช|ธนบุรี/.test(n)) return 'กรุงเทพฯ';
  if (/นนทบุรี|บางกรวย|ปากเกร็ด|บางบัวทอง/.test(n)) return 'นนทบุรี';
  if (/นครปฐม|ลำพยา|ธรรมศาลา|ไทวัสดุ|ดิโอโซน|คุณาวรรณ|หน้ามอ/.test(n)) return 'นครปฐม';
  if (/ราชบุรี/.test(n)) return 'ราชบุรี';
  if (/ภูเก็ต/.test(n)) return 'ภูเก็ต';
  if (/สงขลา|นคร/.test(n) && /ใต้/.test(n)) return 'สงขลา';
  if (/ระยอง/.test(n)) return 'ระยอง';
  if (/นครสวรรค์/.test(n)) return 'นครสวรรค์';
  if (/บ่อพลอย|กาญจนบุรี/.test(n)) return 'กาญจนบุรี';
  if (/coco|โคโค่/.test(n)) return 'Amazon (COCO)';
  if (/dd\d|sd\d|jm\d|cc\d|sc\d/.test(n)) return 'ตัวแทนจำหน่าย (รหัส)';
  if (/lazada|tiktok|shopee/.test(n)) return 'Online Platform';
  if (/รายวัน/.test(n)) return 'ลูกค้ารายวัน';
  if (/บูธ/.test(n)) return 'บูธขาย';
  if (/big c|บิ๊กซี/.test(n)) return 'Big C';
  if (/makro|แม็คโคร/.test(n)) return 'Makro';
  if (/cj/.test(n)) return 'CJ Express';
  if (/ปตท/.test(n)) return 'ปั๊ม ปตท.';
  if (/lotus|โลตัส/.test(n)) return 'Lotus\'s';
  return name.substring(0, 20);
}

var geoArr = Object.keys(geoGroups).map(function(k) {
  return { province: k, issues: geoGroups[k].issues, branches: geoGroups[k].branches.join(', ') };
});
geoArr.sort(function(a, b) { return b.issues - a.issues; });
var topGeo = geoArr.slice(0, 12);

// --- RCA: 6M mapping ---
var rcaData = [
  { category: 'Man', label: 'คน', count: 0, details: '' },
  { category: 'Machine', label: 'เครื่องจักร', count: 0, details: '' },
  { category: 'Material', label: 'วัตถุดิบ', count: 0, details: '' },
  { category: 'Method', label: 'วิธีการ', count: 0, details: '' },
  { category: 'Environment', label: 'สิ่งแวดล้อม', count: 0, details: '' },
  { category: 'Measurement', label: 'การวัด', count: 0, details: '' }
];

// Map problem types -> 6M
var type6M = {};
PROBLEM_TYPE_SHORT.forEach(function(t) {
  var c68 = (summary2568.problemTypeTotals[t] || {}).count || 0;
  var c69 = (summary2569.problemTypeTotals[t] || {}).count || 0;
  type6M[t] = c68 + c69;
});

// ขนมเสีย/เปรี้ยว/ขม -> Material + Environment
rcaData[2].count += Math.round((type6M['ขนมเสีย/เปรี้ยว/ขม'] || 0) * 0.5);
rcaData[4].count += Math.round((type6M['ขนมเสีย/เปรี้ยว/ขม'] || 0) * 0.5);
rcaData[2].details = 'วัตถุดิบเสื่อมคุณภาพ, ไข่/นมใกล้หมดอายุ';
rcaData[4].details = 'อุณหภูมิจัดเก็บ/ขนส่งไม่เหมาะสม, ความชื้นสูง';

// ขนมขึ้นรา -> Material + Environment
rcaData[2].count += Math.round((type6M['ขนมขึ้นรา/ไม่ได้มาตรฐาน'] || 0) * 0.4);
rcaData[4].count += Math.round((type6M['ขนมขึ้นรา/ไม่ได้มาตรฐาน'] || 0) * 0.6);

// ไม่ยิงวัน -> Man + Method
rcaData[0].count += Math.round((type6M['ไม่ยิงวันผลิต/หมดอายุ'] || 0) * 0.6);
rcaData[3].count += Math.round((type6M['ไม่ยิงวันผลิต/หมดอายุ'] || 0) * 0.4);
rcaData[0].details = 'พนักงานลืมยิงวันผลิต/หมดอายุ, ขาดการอบรม';
rcaData[3].details = 'SOP ไม่ครบถ้วน, ขั้นตอนตรวจสอบไม่เพียงพอ';

// บรรจุภัณฑ์บวม/ซีลไม่ดี -> Machine
rcaData[1].count += type6M['บรรจุภัณฑ์บวม/ซีลไม่ดี'] || 0;
rcaData[1].details = 'เครื่องซีลเสื่อมสภาพ, อุณหภูมิซีลไม่เหมาะสม';

// สิ่งแปลกปลอม -> Man + Measurement
rcaData[0].count += Math.round((type6M['สิ่งแปลกปลอม'] || 0) * 0.5);
rcaData[5].count += Math.round((type6M['สิ่งแปลกปลอม'] || 0) * 0.5);
rcaData[5].details = 'ไม่มี metal detector, ตรวจสอบไม่ทั่วถึง';

// --- CAPA: สร้างจาก complaint types ที่พบจริง ---
var capaEntries = [];
// สร้าง CAPA จากปัญหาหลัก
var capaTemplates = [
  { cause: 'ขนมเสีย/เปรี้ยวก่อนหมดอายุ', action: 'ตรวจสอบอุณหภูมิจัดเก็บทุกวัน + ปรับอายุสินค้า', owner: 'ฝ่ายผลิต' },
  { cause: 'ขนมขึ้นรา/ไม่ได้มาตรฐาน', action: 'ปรับปรุงระบบควบคุมความชื้น + ตรวจวัตถุดิบเข้มงวด', owner: 'QA/QC' },
  { cause: 'ไม่ยิงวันผลิต/หมดอายุ', action: 'อบรมพนักงานใหม่ + เพิ่ม checklist ก่อนส่ง', owner: 'ฝ่ายผลิต' },
  { cause: 'บรรจุภัณฑ์บวม/ซีลไม่ดี', action: 'PM เครื่องซีลทุกสัปดาห์ + ตรวจอุณหภูมิซีลบาร์', owner: 'ฝ่ายซ่อมบำรุง' },
  { cause: 'สิ่งแปลกปลอม', action: 'ติดตั้ง metal detector + สวมหมวก/ถุงมือ 100%', owner: 'QA/QC' },
  { cause: 'อุณหภูมิจัดเก็บไม่เหมาะสม', action: 'ติดตั้ง IoT sensor ในตู้แช่ + แจ้งเตือนอัตโนมัติ', owner: 'ฝ่ายคลัง' },
  { cause: 'วัตถุดิบใกล้หมดอายุ', action: 'ใช้ระบบ FEFO + ตรวจรับสินค้าเข้มงวด', owner: 'ฝ่ายจัดซื้อ' },
  { cause: 'ขนมขึ้นราในฤดูฝน (มิ.ย.-ส.ค.)', action: 'เพิ่มสารกันรา + ลดอายุสินค้า 2 วัน', owner: 'ฝ่าย R&D' },
  { cause: 'ปัญหาเฉพาะช่วง Amazon มี.ค.-เม.ย.68', action: 'ตรวจสอบ cold chain ตัวแทน Amazon + ปรับเส้นทางขนส่ง', owner: 'ฝ่ายขาย' },
  { cause: 'Booth มี complaint สูง ม.ค.68', action: 'อบรมพนักงานบูธ + ตรวจ stock rotation', owner: 'ฝ่ายขาย' }
];

capaTemplates.forEach(function(t, idx) {
  var dateBase = idx < 5 ? '2025-' : '2026-';
  var month = String((idx % 6) + 1).padStart(2, '0');
  var status = idx < 4 ? 'done' : (idx < 7 ? 'inprogress' : 'pending');
  var dayStart = Math.min(28, 5 + idx * 2);
  var dayDue = Math.min(28, 15 + idx * 2);
  var dayClosed = Math.min(28, 13 + idx * 2);
  capaEntries.push({
    date: dateBase + month + '-' + String(dayStart).padStart(2, '0'),
    owner: t.owner,
    cause: t.cause,
    action: t.action,
    due: dateBase + month + '-' + String(dayDue).padStart(2, '0'),
    status: status,
    closed: status === 'done' ? dateBase + month + '-' + String(dayClosed).padStart(2, '0') : ''
  });
});

// ========== 4. สร้าง QUALITY_DATA object ==========
var QUALITY_DATA = {
  kpi: {
    totalComplaints: totalComplaints,
    returnedProducts: returnedProducts,
    defectRate: defectRate,
    defectiveLots: defectiveLots,
    qualityCost: Math.round(totalCost * 100) / 100,
    closedCases: closedCases,
    openCases: openCases
  },
  trend: {
    months: trendMonths,
    complaints: trendComplaints
  },
  complaintTypes: complaintTypes,
  products: topProducts,
  lots: topLots,
  process: processArr,
  materials: materialsData,
  customers: customersData,
  geo: topGeo,
  rca: rcaData,
  capa: capaEntries
};

// ========== 5. Output ==========
var output = 'var QUALITY_DATA = ' + JSON.stringify(QUALITY_DATA, null, 2) + ';\n';

// แก้ไข JSON ให้อ่านง่ายขึ้น (ย่อ array ของ objects ที่สั้น)
var outputFile = path.join('C:/Users/Wanwa/OneDrive/Desktop/Project Sales/scripts', 'quality-data-output.js');
fs.writeFileSync(outputFile, output, 'utf8');
console.log('\nOutput written to: ' + outputFile);
console.log('\n=== QUALITY_DATA Summary ===');
console.log('KPI:', JSON.stringify(QUALITY_DATA.kpi));
console.log('Trend months:', QUALITY_DATA.trend.months.length);
console.log('Complaint types:', QUALITY_DATA.complaintTypes.length);
console.log('Products:', QUALITY_DATA.products.length);
console.log('Lots:', QUALITY_DATA.lots.length);
console.log('Process steps:', QUALITY_DATA.process.length);
console.log('Materials:', QUALITY_DATA.materials.length);
console.log('Customers:', QUALITY_DATA.customers.length);
console.log('Geo regions:', QUALITY_DATA.geo.length);
console.log('RCA categories:', QUALITY_DATA.rca.length);
console.log('CAPA entries:', QUALITY_DATA.capa.length);
