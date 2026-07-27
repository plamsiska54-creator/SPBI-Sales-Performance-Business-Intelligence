const XLSX = require('xlsx');
const fs = require('fs');
const path = 'C:/Users/Wanwa/OneDrive/Documents/รวมnew.xlsx';

console.log('Loading file...');
const wb = XLSX.readFile(path);
const ws = wb.Sheets['Sheet1'];
console.log('Parsing to JSON...');
const rows = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
const header = rows[0];
const data = rows.slice(1).filter(r => r[7]); // filter rows with product code

console.log('Total data rows:', data.length);

// Column indices
const COL = {
  branchCode: 0, branchName: 1, customer: 2, port: 3, note: 4,
  branchCode2: 6, prodCode: 7, prodName: 8, unit: 9,
  qty: 10, price: 11, totalPrice: 12, discount: 13,
  exVat: 14, vat: 15, netTotal: 16, date: 17,
  invoiceNo: 18, docType: 19, docMeaning: 20, unit2: 21,
  memberId: 22, memberName: 23, agentCode: 24, agentName: 25,
  cost: 26, profit: 27, custGroup: 28, costPerDay: 29
};

// Excel date to year/month
function excelDateToYM(serial) {
  if (!serial || typeof serial !== 'number') return null;
  const d = new Date((serial - 25569) * 86400 * 1000);
  return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate(), date: d };
}

// Collect stats
const stats = {
  ports: {},
  customers: {},
  years: {},
  docTypes: {},
  totalRows: data.length,
  dateRange: { min: Infinity, max: -Infinity }
};

// Summarize by: port > customer > year > month
const salesByPortCustYearMonth = {};
// Orders by invoice
const orders = {};

data.forEach((r, idx) => {
  const port = r[COL.port] || 'Unknown';
  const cust = r[COL.customer] || 'Unknown';
  const qty = Number(r[COL.qty]) || 0;
  const exVat = Number(r[COL.exVat]) || 0;
  const netTotal = Number(r[COL.netTotal]) || 0;
  const cost = Number(r[COL.cost]) || 0;
  const profit = Number(r[COL.profit]) || 0;
  const invoice = r[COL.invoiceNo] || '';
  const docType = r[COL.docType] || '';
  const prodCode = String(r[COL.prodCode]);
  const prodName = r[COL.prodName] || '';
  const branchCode = r[COL.branchCode] || '';
  const branchName = r[COL.branchName] || '';
  const dateSerial = r[COL.date];

  const ym = excelDateToYM(dateSerial);
  if (!ym) return;

  const year = ym.y;
  const month = ym.m;

  // Track stats
  stats.ports[port] = (stats.ports[port] || 0) + 1;
  stats.customers[cust] = (stats.customers[cust] || 0) + 1;
  stats.years[year] = (stats.years[year] || 0) + 1;
  stats.docTypes[docType] = (stats.docTypes[docType] || 0) + 1;
  if (dateSerial < stats.dateRange.min) stats.dateRange.min = dateSerial;
  if (dateSerial > stats.dateRange.max) stats.dateRange.max = dateSerial;

  // Sales summary
  const key = `${port}|${cust}|${year}|${month}`;
  if (!salesByPortCustYearMonth[key]) {
    salesByPortCustYearMonth[key] = { port, cust, year, month, qty: 0, exVat: 0, netTotal: 0, cost: 0, profit: 0, items: 0 };
  }
  const s = salesByPortCustYearMonth[key];
  s.qty += qty;
  s.exVat += exVat;
  s.netTotal += netTotal;
  s.cost += cost;
  s.profit += profit;
  s.items++;

  // Orders
  if (invoice) {
    if (!orders[invoice]) {
      orders[invoice] = {
        invoice, docType, port, cust, branchCode, branchName,
        date: ym.date.toISOString().split('T')[0],
        year, month,
        lines: [], totalQty: 0, totalExVat: 0, totalNet: 0, totalCost: 0, totalProfit: 0
      };
    }
    const o = orders[invoice];
    o.lines.push({ prodCode, prodName, qty, price: r[COL.price], exVat, netTotal, cost, profit });
    o.totalQty += qty;
    o.totalExVat += exVat;
    o.totalNet += netTotal;
    o.totalCost += cost;
    o.totalProfit += profit;
  }
});

console.log('\n--- STATS ---');
console.log('Ports:', JSON.stringify(stats.ports));
console.log('Customers:', JSON.stringify(stats.customers));
console.log('Years:', JSON.stringify(stats.years));
console.log('Doc types:', JSON.stringify(stats.docTypes));

const minD = excelDateToYM(stats.dateRange.min);
const maxD = excelDateToYM(stats.dateRange.max);
console.log('Date range:', minD?.date.toISOString().split('T')[0], 'to', maxD?.date.toISOString().split('T')[0]);
console.log('Total orders (unique invoices):', Object.keys(orders).length);

// Output monthly summaries
const summaryKeys = Object.keys(salesByPortCustYearMonth).sort();
console.log('\n--- MONTHLY SUMMARIES (first 30) ---');
summaryKeys.slice(0, 30).forEach(k => {
  const s = salesByPortCustYearMonth[k];
  console.log(`${s.port} | ${s.cust} | ${s.year}/${String(s.month).padStart(2,'0')} | items=${s.items} qty=${s.qty} net=${Math.round(s.netTotal)} cost=${Math.round(s.cost)} profit=${Math.round(s.profit)}`);
});

// Save full summary as JSON for later use
const output = {
  stats,
  monthlySummary: Object.values(salesByPortCustYearMonth),
  orderCount: Object.keys(orders).length,
  orderSample: Object.values(orders).slice(0, 5)
};
fs.writeFileSync('C:/Users/Wanwa/AppData/Local/Temp/claude/C--Users-Wanwa-OneDrive-Desktop-Project-Sales/bec96274-48d2-4b80-ab3f-ca57d100012a/scratchpad/sales-summary.json', JSON.stringify(output, null, 2));
console.log('\nSummary saved to sales-summary.json');
