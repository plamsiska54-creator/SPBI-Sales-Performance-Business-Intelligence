const XLSX = require('xlsx');
const fs = require('fs');
const path = 'C:\\Users\\Wanwa\\OneDrive\\Desktop\\รวมnew.xlsx';

console.log('Reading full file (771K rows)...');
console.time('read');
const wb = XLSX.readFile(path);
console.timeEnd('read');

const ws = wb.Sheets['Sheet1'];
console.log('Converting to JSON...');
console.time('convert');
const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
console.timeEnd('convert');
console.log('Total rows:', rows.length);

// Unique port values
var ports = {};
var customers = {};
var docTypes = {};
var custGroups = {};
var dateRange = [Infinity, -Infinity];

rows.forEach(function(r) {
  var p = r['port'] || '(empty)';
  ports[p] = (ports[p] || 0) + 1;

  var c = r['ลูกค้า'] || '(empty)';
  customers[c] = (customers[c] || 0) + 1;

  var dt = r['ตัวย่อประเภทเอกสาร'] || '(empty)';
  docTypes[dt] = (docTypes[dt] || 0) + 1;

  var cg = r['กลุ่มลูกค้า'] || '(empty)';
  if (cg) custGroups[cg] = (custGroups[cg] || 0) + 1;

  var d = r['วันที่'];
  if (typeof d === 'number') {
    if (d < dateRange[0]) dateRange[0] = d;
    if (d > dateRange[1]) dateRange[1] = d;
  }
});

// Convert Excel date serial to readable
function xlDate(serial) {
  var d = new Date((serial - 25569) * 86400000);
  return d.toISOString().slice(0,10);
}

console.log('\n=== PORT (channel) ===');
Object.keys(ports).sort().forEach(function(k) { console.log(k + ': ' + ports[k]); });

console.log('\n=== CUSTOMERS (top 30) ===');
Object.entries(customers).sort(function(a,b){return b[1]-a[1];}).slice(0,30).forEach(function(e) { console.log(e[0] + ': ' + e[1]); });

console.log('\n=== DOC TYPES ===');
Object.keys(docTypes).sort().forEach(function(k) { console.log(k + ': ' + docTypes[k]); });

console.log('\n=== CUSTOMER GROUPS ===');
Object.keys(custGroups).sort().forEach(function(k) { console.log(k + ': ' + custGroups[k]); });

console.log('\n=== DATE RANGE ===');
console.log('From:', xlDate(dateRange[0]), '(' + dateRange[0] + ')');
console.log('To:', xlDate(dateRange[1]), '(' + dateRange[1] + ')');
