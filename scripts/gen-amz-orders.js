const XLSX = require('xlsx');
const fs = require('fs');
const src = 'C:\\Users\\Wanwa\\OneDrive\\Desktop\\รวมnew.xlsx';

console.log('Reading file...');
console.time('read');
const wb = XLSX.readFile(src, { dense: true, raw: true });
console.timeEnd('read');

const ws = wb.Sheets['Sheet1'];
const range = XLSX.utils.decode_range(ws['!ref']);

function cellStr(row, col) { return row && row[col] ? String(row[col].v) : ''; }
function cellNum(row, col) { return row && row[col] ? Number(row[col].v) || 0 : 0; }
function xlYM(serial) {
  var d = new Date((serial - 25569) * 86400000);
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
}

var C = { BRANCH:0, BNAME:1, CUST:2, PORT:3, PERSON:4, PCODE:7, PNAME:8, UNIT:9,
  QTY:10, UPRICE:11, TPRICE:12, DISC:13, EXCL:14, TAX:15, NET:16, DATE:17,
  DOC:18, DOCTYPE:19, COST:26, PROFIT:27 };

// Map customer names to AMZ channels
var CUST_TO_CH = {
  'OR': 'OR',
  'ร้านของฝาก': 'ร้านของฝาก',
  'Amazon': 'Amazon',
  'AMAZON': 'Amazon',
  'RM': 'RM',
  'ลูกค้าทั่วไป': 'ลูกค้าทั่วไป',
  'black canyon': 'Black Canyon',
  'Black Canyon': 'Black Canyon',
  'Online': 'Online'
};

// Aggregate
var byCh = {};        // channel totals
var byChMonth = {};   // channel+month
var byChProd = {};    // channel+product
var byChBranch = {};  // channel+branch
var allTotal = { net: 0, qty: 0, bills: 0, disc: 0 };
var allMonthly = {};
var allProd = {};
var allBranch = {};
var allProdMonth = {};     // product+month: {prod, ym, net, qty}
var byChProdMonth = {};    // channel+product+month: {ch, prod, ym, net, qty}

console.log('Processing...');
console.time('proc');
for (var r = 1; r <= range.e.r; r++) {
  var row = ws[r]; if (!row) continue;
  var cust = cellStr(row, C.CUST);
  var ch = CUST_TO_CH[cust];
  if (!ch) continue; // skip non-Amazon customers

  var qty = cellNum(row, C.QTY);
  var net = cellNum(row, C.NET);
  var disc = cellNum(row, C.DISC);
  var pname = cellStr(row, C.PNAME);
  var bname = cellStr(row, C.BNAME);
  var dt = cellNum(row, C.DATE);

  allTotal.net += net; allTotal.qty += qty; allTotal.bills++; allTotal.disc += disc;

  if (!byCh[ch]) byCh[ch] = { net: 0, qty: 0, bills: 0 };
  byCh[ch].net += net; byCh[ch].qty += qty; byCh[ch].bills++;

  if (dt > 40000) {
    var ym = xlYM(dt);
    // All monthly
    if (!allMonthly[ym]) allMonthly[ym] = { net: 0, qty: 0, bills: 0 };
    allMonthly[ym].net += net; allMonthly[ym].qty += qty; allMonthly[ym].bills++;
    // Channel monthly
    var cmk = ch + '|' + ym;
    if (!byChMonth[cmk]) byChMonth[cmk] = { ch: ch, ym: ym, net: 0, qty: 0, bills: 0 };
    byChMonth[cmk].net += net; byChMonth[cmk].qty += qty; byChMonth[cmk].bills++;
  }

  // Product
  if (pname) {
    var pk = ch + '|' + pname;
    if (!byChProd[pk]) byChProd[pk] = { ch: ch, prod: pname, net: 0, qty: 0 };
    byChProd[pk].net += net; byChProd[pk].qty += qty;
    if (!allProd[pname]) allProd[pname] = { net: 0, qty: 0 };
    allProd[pname].net += net; allProd[pname].qty += qty;
    // Monthly product tracking
    if (dt > 40000) {
      var pmk = pname + '|' + ym;
      if (!allProdMonth[pmk]) allProdMonth[pmk] = { prod: pname, ym: ym, net: 0, qty: 0 };
      allProdMonth[pmk].net += net; allProdMonth[pmk].qty += qty;
      var cpmk = ch + '|' + pname + '|' + ym;
      if (!byChProdMonth[cpmk]) byChProdMonth[cpmk] = { ch: ch, prod: pname, ym: ym, net: 0, qty: 0 };
      byChProdMonth[cpmk].net += net; byChProdMonth[cpmk].qty += qty;
    }
  }

  // Branch
  if (bname) {
    var bk = ch + '|' + bname;
    if (!byChBranch[bk]) byChBranch[bk] = { ch: ch, branch: bname, net: 0, qty: 0, bills: 0 };
    byChBranch[bk].net += net; byChBranch[bk].qty += qty; byChBranch[bk].bills++;
  }
}
console.timeEnd('proc');

// Build JS data
var rnd = function(n) { return Math.round(n * 100) / 100; };

// Get all months sorted
var allYMs = Object.keys(allMonthly).sort();

// Channel list
var channels = ['OR', 'ร้านของฝาก', 'RM', 'Amazon', 'ลูกค้าทั่วไป', 'Black Canyon'];

// Monthly data per channel
var monthlyByCh = {};
channels.forEach(function(ch) {
  monthlyByCh[ch] = {};
  allYMs.forEach(function(ym) {
    var k = ch + '|' + ym;
    if (byChMonth[k]) {
      monthlyByCh[ch][ym] = { net: rnd(byChMonth[k].net), qty: byChMonth[k].qty, bills: byChMonth[k].bills };
    }
  });
});

// Top products per channel (top 20)
var topProdByCh = {};
channels.forEach(function(ch) {
  topProdByCh[ch] = Object.values(byChProd)
    .filter(function(d) { return d.ch === ch; })
    .sort(function(a, b) { return b.net - a.net; })
    .slice(0, 20)
    .map(function(d) { return { p: d.prod.substring(0, 50), n: rnd(d.net), q: d.qty }; });
});

// Top products all channels
var topProdAll = Object.entries(allProd)
  .sort(function(a, b) { return b[1].net - a[1].net; })
  .slice(0, 30)
  .map(function(e) { return { p: e[0].substring(0, 50), n: rnd(e[1].net), q: e[1].qty }; });

// Top branches per channel (top 20)
var topBranchByCh = {};
channels.forEach(function(ch) {
  topBranchByCh[ch] = Object.values(byChBranch)
    .filter(function(d) { return d.ch === ch; })
    .sort(function(a, b) { return b.net - a.net; })
    .slice(0, 20)
    .map(function(d) { return { b: d.branch.substring(0, 50), n: rnd(d.net), q: d.qty, bi: d.bills }; });
});

// Channel totals
var chTotals = {};
channels.forEach(function(ch) {
  if (byCh[ch]) chTotals[ch] = { net: rnd(byCh[ch].net), qty: byCh[ch].qty, bills: byCh[ch].bills };
  else chTotals[ch] = { net: 0, qty: 0, bills: 0 };
});

// All monthly
var monthlyAll = {};
allYMs.forEach(function(ym) {
  monthlyAll[ym] = { net: rnd(allMonthly[ym].net), qty: allMonthly[ym].qty, bills: allMonthly[ym].bills };
});

// Monthly data per product (all channels combined)
var prodMonthly = {};
Object.values(allProdMonth).forEach(function(d) {
  var pShort = d.prod.substring(0, 50);
  if (!prodMonthly[pShort]) prodMonthly[pShort] = {};
  prodMonthly[pShort][d.ym] = { n: rnd(d.net), q: d.qty };
});

// Monthly data per product per channel
var prodMonthlyByCh = {};
channels.forEach(function(ch) { prodMonthlyByCh[ch] = {}; });
Object.values(byChProdMonth).forEach(function(d) {
  var pShort = d.prod.substring(0, 50);
  if (!prodMonthlyByCh[d.ch]) prodMonthlyByCh[d.ch] = {};
  if (!prodMonthlyByCh[d.ch][pShort]) prodMonthlyByCh[d.ch][pShort] = {};
  prodMonthlyByCh[d.ch][pShort][d.ym] = { n: rnd(d.net), q: d.qty };
});

var data = {
  total: { net: rnd(allTotal.net), qty: allTotal.qty, bills: allTotal.bills, disc: rnd(allTotal.disc) },
  dateRange: allYMs.length > 0 ? [allYMs[0], allYMs[allYMs.length-1]] : [],
  months: allYMs,
  channels: chTotals,
  monthlyAll: monthlyAll,
  monthlyByCh: monthlyByCh,
  topProdAll: topProdAll,
  topProdByCh: topProdByCh,
  topBranchByCh: topBranchByCh,
  prodMonthly: prodMonthly,
  prodMonthlyByCh: prodMonthlyByCh
};

var js = '// Auto-generated from รวมnew.xlsx (' + new Date().toISOString().slice(0,10) + ')\n';
js += '// Amazon & ของฝาก ordering data\n';
js += 'var AMZ_ORDER_DATA = ' + JSON.stringify(data) + ';\n';

fs.writeFileSync('js/amz-order-data.js', js, 'utf8');
console.log('\nWritten: js/amz-order-data.js (' + Math.round(js.length / 1024) + ' KB)');
console.log('Total:', JSON.stringify(data.total));
console.log('Channels:', JSON.stringify(chTotals));
console.log('Months:', allYMs.length);
