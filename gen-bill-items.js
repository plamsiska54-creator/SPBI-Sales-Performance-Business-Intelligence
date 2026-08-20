// Generate bill items lookup from Excel (dense mode)
// ws is an array: ws[row][col].v
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = path.join(__dirname, 'Data', 'รวมnew2.xlsx');
const outPath = path.join(__dirname, 'js', 'bill-items-gen.js');

console.log('Reading Excel (dense):', excelPath);
console.time('total');
console.time('read');
const ws = XLSX.readFile(excelPath, {
  dense: true, cellFormula: false, cellHTML: false, cellStyles: false
}).Sheets['Sheet1'];
console.timeEnd('read');

const totalRows = ws.length;
console.log('Rows:', totalRows);

console.time('build');
const map = {};
let count = 0, noInv = 0;

for (let r = 1; r < totalRows; r++) {
  const row = ws[r];
  if (!row) { noInv++; continue; }
  const invCell = row[18];
  if (!invCell || !invCell.v) { noInv++; continue; }
  const inv = String(invCell.v);

  if (!map[inv]) map[inv] = [];
  map[inv].push([
    row[7] ? String(row[7].v || '') : '',
    row[8] ? String(row[8].v || '') : '',
    row[9] ? String(row[9].v || '') : '',
    row[10] ? (row[10].v || 0) : 0,
    row[11] ? (row[11].v || 0) : 0,
    row[16] ? (row[16].v || 0) : 0
  ]);
  count++;
  if (count % 100000 === 0) console.log('  processed', count, 'items...');
}
console.timeEnd('build');

const invCount = Object.keys(map).length;
console.log('Invoices:', invCount, 'items:', count, 'skipped:', noInv);

console.time('write');
const out = fs.createWriteStream(outPath, { encoding: 'utf8' });
out.write('// Bill items — ' + invCount + ' invoices, ' + count + ' items\n');
out.write('// Generated: ' + new Date().toISOString().split('T')[0] + '\n');
out.write('// Format: [code, name, unit, qty, unitPrice, net]\n');
out.write('var BILL_ITEMS=');

const keys = Object.keys(map);
out.write('{');
for (let i = 0; i < keys.length; i++) {
  if (i > 0) out.write(',');
  out.write(JSON.stringify(keys[i]) + ':' + JSON.stringify(map[keys[i]]));
}
out.write('};\n');

out.end(function() {
  console.timeEnd('write');
  const stat = fs.statSync(outPath);
  console.log('Written:', outPath, '(' + (stat.size / 1024 / 1024).toFixed(1) + ' MB)');
  console.timeEnd('total');
});
