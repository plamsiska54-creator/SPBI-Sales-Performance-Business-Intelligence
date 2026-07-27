const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('C:/Users/Wanwa/OneDrive/Desktop/Project Sales/scripts/sales-data-summary.json', 'utf8'));

// Map customer names to standardized channel keys
const CUST_TO_CH = {
  'ซีเจ': 'CJ', 'BIG C': 'BigC', 'LOTUS': 'Lotus', 'MAKRO': 'Makro',
  'TOP': 'Top', 'AEON': 'Aeon', 'The Mall': 'TheMall', 'MM': 'MM',
  'VILLA MARKET': 'Villa', 'MK': 'MK', 'AMAZON': 'Amazon', 'Amazon': 'Amazon',
  'Online': 'Online', 'black canyon': 'BlackCanyon', 'OR': 'OR',
  'RM': 'RM', 'ลูกค้าทั่วไป': 'WalkIn', 'พนักงาน': 'Staff',
  'ร้านกาแฟทั่วไป': 'CoffeeShop', 'ร้านของฝาก': 'Souvenir',
  'อินทนิล': 'Inthanin', 'หนองพงนก': 'NongPhongNok'
};

const MONTH_KEYS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Build: port > customer > year > { monthly, total }
const salesData = {};

raw.monthly.forEach(r => {
  const port = r.port;
  const cust = r.cust;
  const ch = CUST_TO_CH[cust] || cust.replace(/[^a-zA-Z0-9]/g, '');
  const y = r.y;
  const mKey = MONTH_KEYS[r.m - 1];

  if (!salesData[port]) salesData[port] = {};
  if (!salesData[port][ch]) salesData[port][ch] = { name: cust, years: {} };
  if (!salesData[port][ch].years[y]) salesData[port][ch].years[y] = {
    total: { qty: 0, net: 0, cost: 0, profit: 0, lines: 0 },
    months: {}
  };

  const yearData = salesData[port][ch].years[y];
  yearData.months[mKey] = {
    q: Math.round(r.qty),
    b: Math.round(r.net * 100) / 100,
    cost: Math.round(r.cost * 100) / 100,
    profit: Math.round(r.profit * 100) / 100,
    lines: r.lines
  };
  yearData.total.qty += r.qty;
  yearData.total.net += r.net;
  yearData.total.cost += r.cost;
  yearData.total.profit += r.profit;
  yearData.total.lines += r.lines;
});

// Round totals
Object.values(salesData).forEach(portData => {
  Object.values(portData).forEach(chData => {
    Object.values(chData.years).forEach(yd => {
      yd.total.qty = Math.round(yd.total.qty);
      yd.total.net = Math.round(yd.total.net * 100) / 100;
      yd.total.cost = Math.round(yd.total.cost * 100) / 100;
      yd.total.profit = Math.round(yd.total.profit * 100) / 100;
    });
  });
});

// Build order summary: by port > customer > year > month > { count, totalNet, totalQty }
const orderSummary = {};
raw.orders.forEach(o => {
  const port = o.port;
  const ch = CUST_TO_CH[o.cust] || o.cust.replace(/[^a-zA-Z0-9]/g, '');
  const y = o.y;
  const mKey = MONTH_KEYS[o.m - 1];

  if (!orderSummary[port]) orderSummary[port] = {};
  if (!orderSummary[port][ch]) orderSummary[port][ch] = {};
  if (!orderSummary[port][ch][y]) orderSummary[port][ch][y] = {};
  if (!orderSummary[port][ch][y][mKey]) orderSummary[port][ch][y][mKey] = { orders: 0, qty: 0, net: 0, items: 0 };

  const s = orderSummary[port][ch][y][mKey];
  s.orders++;
  s.qty += o.qty;
  s.net += o.net;
  s.items += o.items;
});

// Round order summary
Object.values(orderSummary).forEach(p => {
  Object.values(p).forEach(c => {
    Object.values(c).forEach(y => {
      Object.values(y).forEach(m => {
        m.qty = Math.round(m.qty);
        m.net = Math.round(m.net);
      });
    });
  });
});

// Output as JS variable
let js = '// Sales data from รวมnew.xlsx (769K rows, 2024-2026)\n';
js += '// Generated: ' + new Date().toISOString().split('T')[0] + '\n\n';
js += 'var SALES_DATA = ' + JSON.stringify(salesData) + ';\n\n';
js += 'var ORDER_SUMMARY = ' + JSON.stringify(orderSummary) + ';\n\n';
js += 'var SALES_YEARS = [2024, 2025, 2026];\n';
js += 'var SALES_PORTS = ' + JSON.stringify(Object.keys(salesData)) + ';\n';

const outPath = 'C:/Users/Wanwa/OneDrive/Desktop/Project Sales/js/sales-data-gen.js';
fs.writeFileSync(outPath, js);
const size = fs.statSync(outPath).size;
console.log('Output:', outPath, '-', (size/1024).toFixed(0) + 'KB');

// Print summary stats
console.log('\nPorts:', Object.keys(salesData));
Object.entries(salesData).forEach(([port, channels]) => {
  console.log(`\n${port}:`);
  Object.entries(channels).forEach(([ch, data]) => {
    const yrs = Object.keys(data.years).sort();
    const totals = yrs.map(y => `${y}: ${(data.years[y].total.net/1e6).toFixed(2)}M`);
    console.log(`  ${ch} (${data.name}): ${totals.join(', ')}`);
  });
});

console.log('\nOrder summary:');
Object.entries(orderSummary).forEach(([port, channels]) => {
  let totalOrders = 0;
  Object.values(channels).forEach(ch => {
    Object.values(ch).forEach(y => {
      Object.values(y).forEach(m => totalOrders += m.orders);
    });
  });
  console.log(`  ${port}: ${totalOrders} orders`);
});
