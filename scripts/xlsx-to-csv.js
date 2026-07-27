const XLSX = require('xlsx');
const fs = require('fs');
const src = 'C:\\Users\\Wanwa\\OneDrive\\Desktop\\รวมnew.xlsx';
const dst = 'C:\\Users\\Wanwa\\OneDrive\\Desktop\\Project Sales\\data\\orders-raw.csv';

console.log('Reading xlsx...');
console.time('total');
const wb = XLSX.readFile(src, { dense: true, cellDates: true });
console.timeEnd('total');
const ws = wb.Sheets['Sheet1'];
console.log('Writing CSV...');
const csv = XLSX.utils.sheet_to_csv(ws);
fs.mkdirSync('data', { recursive: true });
fs.writeFileSync(dst, csv, 'utf8');
console.log('CSV written:', dst, '(' + Math.round(csv.length/1024/1024) + ' MB)');
