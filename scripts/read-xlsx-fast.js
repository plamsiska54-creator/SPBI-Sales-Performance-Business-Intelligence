const XLSX = require('xlsx');
const fs = require('fs');
const src = 'C:\\Users\\Wanwa\\OneDrive\\Desktop\\รวมnew.xlsx';

// Read first 50,000 rows to get summary stats
console.log('Reading first 50000 rows...');
console.time('read');
const wb = XLSX.readFile(src, { sheetRows: 50000 });
console.timeEnd('read');

const ws = wb.Sheets['Sheet1'];
console.log('Range:', ws['!ref']);

const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
console.log('Data rows:', rows.length);

var ports = {};
var customers = {};
var custGroups = {};
var dateMin = Infinity, dateMax = -Infinity;
var totalNet = 0, totalQty = 0, totalCost = 0, totalProfit = 0;
var monthlyData = {};
var productTop = {};
var branchTop = {};

rows.forEach(function(r) {
  var port = r['port'] || '(empty)';
  ports[port] = (ports[port] || 0) + 1;

  var cust = r['ลูกค้า'] || '(empty)';
  customers[cust] = (customers[cust] || 0) + 1;

  var cg = r['กลุ่มลูกค้า'] || '';
  if (cg) custGroups[cg] = (custGroups[cg] || 0) + 1;

  var net = Number(r['ยอดสุทธิ']) || 0;
  var qty = Number(r['จำนวน']) || 0;
  var cost = Number(r['ต้นทุน']) || 0;
  var profit = Number(r['กำไร']) || 0;
  totalNet += net;
  totalQty += qty;
  totalCost += cost;
  totalProfit += profit;

  var dt = r['วันที่'];
  if (typeof dt === 'number' && dt > 40000) {
    if (dt < dateMin) dateMin = dt;
    if (dt > dateMax) dateMax = dt;
    var d = new Date((dt - 25569) * 86400000);
    var ym = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
    if (!monthlyData[ym]) monthlyData[ym] = { net: 0, qty: 0, bills: 0 };
    monthlyData[ym].net += net;
    monthlyData[ym].qty += qty;
    monthlyData[ym].bills++;
  }

  var prod = r['ชื่อสินค้า'] || '';
  if (prod) {
    if (!productTop[prod]) productTop[prod] = { qty: 0, net: 0 };
    productTop[prod].qty += qty;
    productTop[prod].net += net;
  }

  var branch = r['ชื่อสาขา_x'] || '';
  if (branch) {
    if (!branchTop[branch]) branchTop[branch] = { net: 0, qty: 0, bills: 0 };
    branchTop[branch].net += net;
    branchTop[branch].qty += qty;
    branchTop[branch].bills++;
  }
});

function xlDate(serial) {
  return new Date((serial - 25569) * 86400000).toISOString().slice(0,10);
}

console.log('\nTotal net (50K rows):', totalNet.toFixed(2));
console.log('Total qty:', totalQty);

console.log('\n=== PORTS ===');
Object.keys(ports).sort().forEach(function(k) { console.log(k + ': ' + ports[k]); });

console.log('\n=== TOP 30 CUSTOMERS ===');
Object.entries(customers).sort(function(a,b){return b[1]-a[1];}).slice(0,30).forEach(function(e) { console.log(e[0] + ': ' + e[1]); });

console.log('\n=== CUSTOMER GROUPS ===');
Object.keys(custGroups).sort().forEach(function(k) { console.log(k + ': ' + custGroups[k]); });

console.log('\n=== DATE RANGE ===');
if (dateMin < Infinity) console.log('From:', xlDate(dateMin), 'To:', xlDate(dateMax));

console.log('\n=== MONTHLY SUMMARY ===');
Object.keys(monthlyData).sort().forEach(function(k) {
  var m = monthlyData[k];
  console.log(k + ': net=' + m.net.toFixed(0) + ' qty=' + m.qty + ' bills=' + m.bills);
});

console.log('\n=== TOP 20 PRODUCTS ===');
Object.entries(productTop).sort(function(a,b){return b[1].net-a[1].net;}).slice(0,20).forEach(function(e) {
  console.log(e[0] + ': net=' + e[1].net.toFixed(0) + ' qty=' + e[1].qty);
});

console.log('\n=== TOP 20 BRANCHES ===');
Object.entries(branchTop).sort(function(a,b){return b[1].net-a[1].net;}).slice(0,20).forEach(function(e) {
  console.log(e[0].substring(0,50) + ': net=' + e[1].net.toFixed(0) + ' bills=' + e[1].bills);
});
