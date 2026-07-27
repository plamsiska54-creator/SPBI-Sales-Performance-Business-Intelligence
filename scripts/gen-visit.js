const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

var files = [
  { path: 'C:/Users/Wanwa/OneDrive/Desktop/Project Sales 2/Project Sales/Data/Amazon/Sales Visit/WWN_Sales_Visit_Tracker_Amazon (กานต์).xlsx', person: 'กานต์' },
  { path: 'C:/Users/Wanwa/OneDrive/Desktop/Project Sales 2/Project Sales/Data/Amazon/Sales Visit/WWN_Sales_Visit_Tracker_Amazon (ซี).xlsx', person: 'ชี' }
];

function xlDate(serial) {
  if (!serial || serial < 40000) return '';
  var d = new Date((serial - 25569) * 86400000);
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

var allRows = [];

files.forEach(function(f) {
  var wb = XLSX.readFile(f.path);
  var ws = wb.Sheets['Sales Visit Tracker'];
  if (!ws) { console.log('No sheet "Sales Visit Tracker" in', f.path); return; }
  var data = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // Find header row (contains วันเดือนปี)
  var headerIdx = -1;
  for (var i = 0; i < Math.min(10, data.length); i++) {
    if (data[i] && data[i][0] && String(data[i][0]).indexOf('วันเดือนปี') >= 0) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx < 0) { console.log('Header not found in', f.path); return; }

  // Process data rows
  for (var r = headerIdx + 1; r < data.length; r++) {
    var row = data[r];
    if (!row || !row[0]) continue;

    var date = typeof row[0] === 'number' ? xlDate(row[0]) : String(row[0]);
    if (!date || date.length < 8) continue;

    var storeCode = row[1] ? String(row[1]).trim() : '';
    var storeName = row[2] ? String(row[2]).trim() : '';

    // Skip sub-rows (product lines without store code)
    if (!storeCode && !storeName) continue;

    var reason = row[3] ? String(row[3]).trim() : '';
    var product = row[4] ? String(row[4]).trim() : '';
    var result = row[5] ? String(row[5]).trim() : '';
    var callStatus = row[6] ? String(row[6]).trim() : '';
    var salesStatus = row[7] ? String(row[7]).trim() : '';
    var notes = row[8] ? String(row[8]).trim() : '';
    var salesPerson = row[9] ? String(row[9]).trim() : f.person;

    // Use file's person if column value is empty or not a known salesperson name
    if (!salesPerson || (salesPerson !== 'กานต์' && salesPerson !== 'ชี' && salesPerson !== 'ยู')) {
      if (salesPerson && salesPerson !== f.person) notes = (notes ? notes + ' ' : '') + salesPerson;
      salesPerson = f.person;
    }

    allRows.push([date, storeCode, storeName, reason, product, result, callStatus, salesStatus, notes, salesPerson]);
  }

  console.log(f.person + ': ' + (allRows.length) + ' rows total so far');
});

// Sort by date
allRows.sort(function(a, b) { return a[0].localeCompare(b[0]); });

console.log('Total visit rows:', allRows.length);

// Read existing file
var existingFile = 'js/amz-visit-tracker.js';
var existing = fs.readFileSync(existingFile, 'utf8');

// Find the data array boundaries
var startMarker = 'var AMZ_VISIT_DATA = [';
var startIdx = existing.indexOf(startMarker);
if (startIdx < 0) { console.log('Could not find AMZ_VISIT_DATA'); process.exit(1); }

// Find the closing ];
var afterStart = startIdx + startMarker.length;
var bracketCount = 1;
var endIdx = afterStart;
for (var i = afterStart; i < existing.length; i++) {
  if (existing[i] === '[') bracketCount++;
  if (existing[i] === ']') {
    bracketCount--;
    if (bracketCount === 0) { endIdx = i + 1; break; }
  }
}

// Build new data
var dataLines = allRows.map(function(row) {
  var escaped = row.map(function(v) {
    return "'" + String(v).replace(/'/g, "\\'").replace(/[\r\n]+/g, ' ') + "'";
  });
  return '  [' + escaped.join(',') + ']';
});

var newData = startMarker + '\n' + dataLines.join(',\n') + '\n]';

// Replace
var newFile = existing.substring(0, startIdx) + newData + existing.substring(endIdx);
fs.writeFileSync(existingFile, newFile, 'utf8');
console.log('Updated:', existingFile, '(' + allRows.length + ' visits)');
