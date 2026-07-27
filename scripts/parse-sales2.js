const XLSX = require('xlsx');
const fs = require('fs');

console.log('Loading file (stream mode)...');
console.time('load');

// Use dense mode for memory efficiency
const wb = XLSX.readFile('C:/Users/Wanwa/OneDrive/Documents/รวมnew.xlsx', {
  dense: true,
  cellFormula: false,
  cellStyles: false,
  cellHTML: false
});
console.timeEnd('load');

const ws = wb.Sheets['Sheet1'];
console.log('Converting to JSON...');
console.time('convert');
const data = XLSX.utils.sheet_to_json(ws, {defval: ''});
console.timeEnd('convert');
console.log('Total rows:', data.length);

function excelDateToYM(serial) {
  if (!serial || typeof serial !== 'number') return null;
  const d = new Date((serial - 25569) * 86400 * 1000);
  return { y: d.getFullYear(), m: d.getMonth() + 1 };
}

// Collect
const ports = {};
const customers = {};
const years = {};
const custByPort = {};
// Monthly sales: port > customer > year > month
const monthly = {};
// Orders
const orderMap = {};

let processed = 0;
data.forEach(r => {
  const port = r['port'] || 'Unknown';
  const cust = r['ลูกค้า'] || 'Unknown';
  const qty = Number(r['จำนวน']) || 0;
  const exVat = Number(r['มูลค่าไม่รวมภาษี']) || 0;
  const netTotal = Number(r['ยอดสุทธิ']) || 0;
  const cost = Number(r['ต้นทุน']) || 0;
  const profit = Number(r['กำไร']) || 0;
  const invoice = r['เลขที่เอกสาร'] || '';
  const docType = r['ตัวย่อประเภทเอกสาร'] || '';
  const prodCode = String(r['รหัสสินค้า'] || '');
  const prodName = r['ชื่อสินค้า'] || '';
  const branchCode = r['รหัสสาขา'] || '';
  const branchName = r['ชื่อสาขา_x'] || '';
  const custGroup = r['กลุ่มลูกค้า'] || '';

  if (!prodCode) return;

  const ym = excelDateToYM(r['วันที่']);
  if (!ym) return;

  ports[port] = (ports[port] || 0) + 1;
  customers[cust] = (customers[cust] || 0) + 1;
  years[ym.y] = (years[ym.y] || 0) + 1;

  if (!custByPort[port]) custByPort[port] = {};
  custByPort[port][cust] = (custByPort[port][cust] || 0) + 1;

  // Monthly key
  const mk = `${port}|${cust}|${ym.y}|${ym.m}`;
  if (!monthly[mk]) monthly[mk] = { port, cust, y: ym.y, m: ym.m, qty: 0, exVat: 0, net: 0, cost: 0, profit: 0, lines: 0 };
  const s = monthly[mk];
  s.qty += qty; s.exVat += exVat; s.net += netTotal; s.cost += cost; s.profit += profit; s.lines++;

  // Orders
  if (invoice) {
    if (!orderMap[invoice]) {
      orderMap[invoice] = {
        inv: invoice, docType, port, cust, branch: branchCode, branchName,
        date: r['วันที่'], y: ym.y, m: ym.m, custGroup,
        items: 0, qty: 0, exVat: 0, net: 0, cost: 0, profit: 0
      };
    }
    const o = orderMap[invoice];
    o.items++; o.qty += qty; o.exVat += exVat; o.net += netTotal; o.cost += cost; o.profit += profit;
  }

  processed++;
  if (processed % 100000 === 0) console.log('  processed', processed);
});

console.log('\n=== STATS ===');
console.log('Processed rows:', processed);
console.log('Ports:', JSON.stringify(ports));
console.log('Years:', JSON.stringify(years));
console.log('Unique customers:', Object.keys(customers).length);
console.log('Customer list:', JSON.stringify(Object.keys(customers).sort()));
console.log('Customers by port:', JSON.stringify(Object.fromEntries(
  Object.entries(custByPort).map(([p, cs]) => [p, Object.keys(cs).sort()])
)));
console.log('Total orders:', Object.keys(orderMap).length);

// Save compact summary JSON
const result = {
  ports, customers, years, custByPort,
  monthly: Object.values(monthly),
  orderCount: Object.keys(orderMap).length,
  orders: Object.values(orderMap)
};
const outPath = 'C:/Users/Wanwa/OneDrive/Desktop/Project Sales/scripts/sales-data-summary.json';
fs.writeFileSync(outPath, JSON.stringify(result));
console.log('Saved to', outPath, '- size:', (fs.statSync(outPath).size / 1024).toFixed(0) + 'KB');
