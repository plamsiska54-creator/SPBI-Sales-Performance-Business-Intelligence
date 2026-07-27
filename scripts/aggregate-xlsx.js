const XLSX = require('xlsx');
const fs = require('fs');
const src = 'C:\\Users\\Wanwa\\OneDrive\\Desktop\\รวมnew.xlsx';

console.log('Reading file (dense + raw)...');
console.time('read');
const wb = XLSX.readFile(src, { dense: true, raw: true });
console.timeEnd('read');

const ws = wb.Sheets['Sheet1'];
const range = XLSX.utils.decode_range(ws['!ref']);
console.log('Rows:', range.e.r);

function cellStr(row, col) { return row && row[col] ? String(row[col].v) : ''; }
function cellNum(row, col) { return row && row[col] ? Number(row[col].v) || 0 : 0; }
function xlYM(serial) {
  var d = new Date((serial - 25569) * 86400000);
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
}

var C = { BRANCH:0, BNAME:1, CUST:2, PORT:3, PERSON:4, PCODE:7, PNAME:8, UNIT:9,
  QTY:10, UPRICE:11, TPRICE:12, DISC:13, EXCL:14, TAX:15, NET:16, DATE:17,
  DOC:18, DOCTYPE:19, COST:26, PROFIT:27, CUSTGRP:28 };

var byPort = {}, byPortMonth = {}, byPortCust = {}, byPortProd = {}, byPortBranch = {};
var grand = { net:0, qty:0, cost:0, profit:0, disc:0, bills:0 };
var dateMin = Infinity, dateMax = -Infinity;

console.log('Aggregating...');
console.time('agg');
for (var r = 1; r <= range.e.r; r++) {
  var row = ws[r]; if (!row) continue;
  var port = cellStr(row,C.PORT) || 'unknown';
  var cust = cellStr(row,C.CUST) || 'unknown';
  var pname = cellStr(row,C.PNAME);
  var bname = cellStr(row,C.BNAME);
  var qty = cellNum(row,C.QTY), net = cellNum(row,C.NET);
  var cost = cellNum(row,C.COST), profit = cellNum(row,C.PROFIT), disc = cellNum(row,C.DISC);
  var dt = cellNum(row,C.DATE);

  grand.net+=net; grand.qty+=qty; grand.cost+=cost; grand.profit+=profit; grand.disc+=disc; grand.bills++;

  if (!byPort[port]) byPort[port]={net:0,qty:0,cost:0,profit:0,disc:0,bills:0};
  var bp=byPort[port]; bp.net+=net; bp.qty+=qty; bp.cost+=cost; bp.profit+=profit; bp.disc+=disc; bp.bills++;

  if (dt>40000) {
    if(dt<dateMin) dateMin=dt; if(dt>dateMax) dateMax=dt;
    var ym=xlYM(dt), pmk=port+'|'+ym;
    if(!byPortMonth[pmk]) byPortMonth[pmk]={port:port,ym:ym,net:0,qty:0,bills:0};
    var pm=byPortMonth[pmk]; pm.net+=net; pm.qty+=qty; pm.bills++;
  }

  var pck=port+'|'+cust;
  if(!byPortCust[pck]) byPortCust[pck]={port:port,cust:cust,net:0,qty:0,bills:0};
  var pc=byPortCust[pck]; pc.net+=net; pc.qty+=qty; pc.bills++;

  if(pname){var ppk=port+'|'+pname;
    if(!byPortProd[ppk]) byPortProd[ppk]={port:port,prod:pname,net:0,qty:0};
    var pp=byPortProd[ppk]; pp.net+=net; pp.qty+=qty;}

  if(bname){var pbk=port+'|'+bname;
    if(!byPortBranch[pbk]) byPortBranch[pbk]={port:port,branch:bname,net:0,qty:0,bills:0};
    var pb=byPortBranch[pbk]; pb.net+=net; pb.qty+=qty; pb.bills++;}
}
console.timeEnd('agg');

// Also aggregate by customer (across all ports) for Amazon mapping
var byCust = {};
for (var r2 = 1; r2 <= range.e.r; r2++) {
  var row2 = ws[r2]; if(!row2) continue;
  var cust2 = cellStr(row2,C.CUST) || 'unknown';
  var net2 = cellNum(row2,C.NET), qty2 = cellNum(row2,C.QTY);
  var dt2 = cellNum(row2,C.DATE);
  if(!byCust[cust2]) byCust[cust2]={net:0,qty:0,bills:0,monthly:{}};
  var bc=byCust[cust2]; bc.net+=net2; bc.qty+=qty2; bc.bills++;
  if(dt2>40000){
    var ym2=xlYM(dt2);
    if(!bc.monthly[ym2]) bc.monthly[ym2]={net:0,qty:0,bills:0};
    bc.monthly[ym2].net+=net2; bc.monthly[ym2].qty+=qty2; bc.monthly[ym2].bills++;
  }
}

function rnd(n){return Math.round(n*100)/100;}
function topN(obj, port, field, n) {
  return Object.values(obj).filter(function(d){return d.port===port;})
    .sort(function(a,b){return b.net-a.net;}).slice(0,n)
    .map(function(d){var o={net:rnd(d.net),qty:d.qty};
      if(d.cust) o.cust=d.cust; if(d.prod) o.prod=d.prod;
      if(d.branch) o.branch=d.branch.substring(0,60); if(d.bills) o.bills=d.bills;
      return o;});
}

var out = {
  meta:{rows:range.e.r, dateFrom: dateMin<Infinity?new Date((dateMin-25569)*86400000).toISOString().slice(0,10):null,
    dateTo: dateMax>-Infinity?new Date((dateMax-25569)*86400000).toISOString().slice(0,10):null},
  grand:{net:rnd(grand.net),qty:grand.qty,cost:rnd(grand.cost),profit:rnd(grand.profit),disc:rnd(grand.disc),bills:grand.bills},
  byPort:{}, monthly:[], custByPort:{}, prodByPort:{}, branchByPort:{},
  byCustMonthly:{}
};

Object.keys(byPort).forEach(function(p){
  var d=byPort[p]; out.byPort[p]={net:rnd(d.net),qty:d.qty,cost:rnd(d.cost),profit:rnd(d.profit),disc:rnd(d.disc),bills:d.bills};
});
Object.values(byPortMonth).forEach(function(d){out.monthly.push({port:d.port,ym:d.ym,net:rnd(d.net),qty:d.qty,bills:d.bills});});
out.monthly.sort(function(a,b){return a.ym<b.ym?-1:a.ym>b.ym?1:0;});
Object.keys(byPort).forEach(function(p){
  out.custByPort[p]=topN(byPortCust,p,'net',30);
  out.prodByPort[p]=topN(byPortProd,p,'net',30);
  out.branchByPort[p]=topN(byPortBranch,p,'net',30);
});

// Customer monthly for Amazon-related customers
['Amazon','AMAZON','OR','Online','ร้านของฝาก','ลูกค้าทั่วไป','black canyon','Black Canyon'].forEach(function(c){
  if(byCust[c]){
    out.byCustMonthly[c]={net:rnd(byCust[c].net),qty:byCust[c].qty,bills:byCust[c].bills,monthly:{}};
    Object.keys(byCust[c].monthly).forEach(function(ym){
      var m=byCust[c].monthly[ym];
      out.byCustMonthly[c].monthly[ym]={net:rnd(m.net),qty:m.qty,bills:m.bills};
    });
  }
});

fs.mkdirSync('data',{recursive:true});
var json=JSON.stringify(out);
fs.writeFileSync('data/orders-agg.json',json,'utf8');
console.log('\nJSON: data/orders-agg.json ('+Math.round(json.length/1024)+' KB)');
console.log('Done!');
