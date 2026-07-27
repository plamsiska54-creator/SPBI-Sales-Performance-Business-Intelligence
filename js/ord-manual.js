// ============================================================
// ORD-MANUAL.JS — คู่มือการทำงาน (ธุรการขาย)
// ============================================================
(function(){
'use strict';

var COLORS = {
  S01:'#fecaca', S02:'#cffafe', S03:'#fef08a',
  S05:'#bbf7d0', S06:'#fef3c7', S07:'#ddd6fe',
  holiday:'#ef4444'
};
var NAMES = {S01:'แดงกวา',S02:'บิวตี้',S03:'อ้อ',S05:'โบว์',S06:'อัพ',S07:'อัพ'};
var DAYS = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];

// Each row = array of 7 cells {route, code, off}
// off=true means หยุด (red)

var ORDER_DATA = [
  [
    {route:'กำแพงเพชร-ตาก',code:'S03'},
    {route:'เชียงใหม่',code:'S03'},
    {route:'ราชบุรี / นครนายก',code:'S07'},
    {route:'เพชรบุรี',code:'S07'},
    {route:'เพชรบูรณ์',code:'S03'},
    {route:'หยุด',code:'S03',off:true},
    {route:'เชียงราย',code:'S03'}
  ],[
    {route:'หยุด',code:'S02',off:true},
    {route:'กระทุ่มแบน',code:'S02'},
    {route:'สระบุรี 1-2',code:'S02'},
    {route:'สุพรรณบุรี',code:'S02'},
    {route:'กาญจนบุรี',code:'S02'},
    {route:'โคราช 1-2',code:'S02'},
    {route:'ชลบุรี 1-2',code:'S02'}
  ],[
    {route:'ระยอง',code:'S07'},
    {route:'อุบล - บุรีรัมย์',code:'S05'},
    {route:'ขอนแก่น + ร.พ.',code:'S05'},
    {route:'นครสวรรค์ 1',code:'S05'},
    {route:'อำนาจเจริญ',code:'S05'},
    {route:'หยุด',code:'S05',off:true},
    {route:'ขอนแก่น + ร.พ. + มิตรภาพ',code:'S05'}
  ],[
    {route:'C/F1/F2',code:'S01'},
    {route:'D/E/G -ราชพฤกษ์',code:'S01'},
    {route:'A/B',code:'S01'},
    {route:'C/F1/F2',code:'S01'},
    {route:'D/E/G/B',code:'S01'},
    {route:'A/B/G',code:'S01'},
    {route:'หยุด',code:'S01',off:true}
  ],[
    {route:'ใต้ - ภูเก็ต',code:'S03'},
    {route:'บูธรายวัน/VIP',code:'S06'},
    {route:'สงขลา - นคร',code:'S03'},
    {route:'บ่อพลอย (ลุงอู๊ด)',code:'S03'},
    {route:'บูธรายวัน/VIP/บูธ หลัก',code:'S06'},
    {route:'บูธรายวัน/VIP',code:'S06'},
    {route:'หยุด',code:'S06',off:true}
  ],[
    {route:'บูธรายวัน/VIP/บูธ หลัก',code:'S06'},
    {route:'บูธรายวัน/VIP',code:'S06'},
    {route:'บูธรายวัน/VIP/บูธ หลัก',code:'S06'},
    {route:'บูธรายวัน/VIP',code:'S06'},
    {route:'นครสวรรค์ 2',code:'S05'},
    {route:'',code:''},
    {route:'',code:''}
  ]
];

var PROD_DATA = [
  [
    {route:'เชียงราย',code:'S03'},
    {route:'กำแพงเพชร-ตาก',code:'S03'},
    {route:'เชียงใหม่',code:'S03'},
    {route:'ราชบุรี / นครนายก',code:'S07'},
    {route:'เพชรบุรี',code:'S07'},
    {route:'เพชรบูรณ์',code:'S03'},
    {route:'',code:''}
  ],[
    {route:'โคราช 1-2',code:'S02'},
    {route:'ชลบุรี 1-2',code:'S02'},
    {route:'อุบล - บุรีรัมย์',code:'S05'},
    {route:'สระบุรี 1-2',code:'S02'},
    {route:'สุพรรณบุรี',code:'S02'},
    {route:'กาญจนบุรี',code:'S07'},
    {route:'',code:''}
  ],[
    {route:'ขอนแก่น + ร.พ. + มิตรภาพ',code:'S05'},
    {route:'ระยอง',code:'S07'},
    {route:'D/E/G -ราชพฤกษ์',code:'S01'},
    {route:'ขอนแก่น + ร.พ.',code:'S05'},
    {route:'นครสวรรค์ 1',code:'S05'},
    {route:'นครสวรรค์ 2',code:'S05'},
    {route:'หยุด',code:'',off:true}
  ],[
    {route:'A/B/G',code:'S01'},
    {route:'C/F1/F2',code:'S01'},
    {route:'กระทุ่มแบน',code:'S02'},
    {route:'A/B',code:'S01'},
    {route:'C/F1/F2',code:'S01'},
    {route:'D/E/G/B',code:'S01'},
    {route:'',code:''}
  ],[
    {route:'บูธรายวัน/VIP',code:'S06'},
    {route:'ใต้ - ภูเก็ต',code:'S03'},
    {route:'บูธรายวัน/VIP',code:'S06'},
    {route:'สงขลา - นคร',code:'S03'},
    {route:'บ่อพลอย (ลุงอู๊ด)',code:'S03'},
    {route:'บูธรายวัน/VIP/บูธ หลัก',code:'S06'},
    {route:'',code:''}
  ],[
    {route:'บูธรายวัน/VIP/บูธ หลัก',code:'S06'},
    {route:'',code:''},
    {route:'บูธรายวัน/VIP/บูธ หลัก',code:'S06'},
    {route:'บูธรายวัน/VIP',code:'S06'},
    {route:'บูธรายวัน/VIP',code:'S06'},
    {route:'อำนาจเจริญ',code:'S05'},
    {route:'',code:''}
  ]
];

var SHIP_DATA = [
  [
    {route:'',code:''},
    {route:'เชียงราย',code:'S03'},
    {route:'ตาก',code:'S03'},
    {route:'เชียงใหม่',code:'S03'},
    {route:'ราชบุรี',code:'S03'},
    {route:'เพชรบุรี',code:'S03'},
    {route:'เพชรบูรณ์',code:'S03'}
  ],[
    {route:'',code:''},
    {route:'โคราช',code:'S02'},
    {route:'ชลบุรี 1-2',code:'S02'},
    {route:'ราชพฤกษ์',code:'S02'},
    {route:'สระบุรี 1-2',code:'S02'},
    {route:'สุพรรณบุรี',code:'S02'},
    {route:'กาญจนบุรี',code:'S02'}
  ],[
    {route:'',code:''},
    {route:'ขอนแก่น + ร.พ. + มิตรภาพ',code:'S05'},
    {route:'ระยอง',code:'S05'},
    {route:'อุบล - บุรีรัมย์',code:'S05'},
    {route:'ขอนแก่น + ร.พ.',code:'S05'},
    {route:'นครสวรรค์ 1',code:'S05'},
    {route:'นครสวรรค์ 2',code:'S05'}
  ],[
    {route:'หยุด',code:'',off:true},
    {route:'A/B/G',code:'S01'},
    {route:'C/F1/F2',code:'S01'},
    {route:'D/E/G',code:'S01'},
    {route:'A/B',code:'S01'},
    {route:'C/F1/F2',code:'S01'},
    {route:'D/E/G/B',code:'S01'}
  ],[
    {route:'',code:''},
    {route:'',code:''},
    {route:'ใต้ - ภูเก็ต',code:'S04'},
    {route:'',code:''},
    {route:'สงขลา - นคร',code:'S04'},
    {route:'ลุงอู๊ด',code:''},
    {route:'',code:''}
  ],[
    {route:'',code:''},
    {route:'บูธ บ้านแห้ว',code:'S06'},
    {route:'บูธ หลัก',code:'S06'},
    {route:'กระทุ่มแบน',code:'S06'},
    {route:'บูธ หลัก',code:'S06'},
    {route:'',code:''},
    {route:'บูธหลัก',code:'S06'}
  ],[
    {route:'',code:''},
    {route:'',code:''},
    {route:'',code:''},
    {route:'',code:''},
    {route:'นครนายก',code:''},
    {route:'',code:''},
    {route:'อำนาจเจริญ',code:'S05'}
  ]
];

function cellHtml(c){
  if(!c || (!c.route && !c.code)) return '<td style="border:1px solid #d1d5db;padding:6px 8px;text-align:center;font-size:12px"></td>';
  var bg = '#fff';
  var color = '#1f2937';
  if(c.off){ bg = COLORS.holiday; color = '#fff'; }
  else if(c.code && COLORS[c.code]){ bg = COLORS[c.code]; }
  var name = c.code && NAMES[c.code] ? NAMES[c.code] : '';
  var codeStr = c.code ? '('+c.code+') '+name : '';
  return '<td style="border:1px solid #d1d5db;padding:6px 8px;text-align:center;font-size:12px;background:'+bg+';color:'+color+';vertical-align:top;min-width:100px">'
    +'<div style="font-weight:600;margin-bottom:2px">'+c.route+'</div>'
    +(codeStr?'<div style="font-size:11px;'+(c.off?'color:#fff':'color:#6b7280')+'">'+codeStr+'</div>':'')
    +'</td>';
}

function buildTable(title, data){
  var h = '<div style="margin-bottom:28px">';
  h += '<h3 style="text-align:center;font-size:18px;margin:0 0 8px;color:#1f2937;border-bottom:2px solid #1f2937;padding-bottom:6px;display:inline-block;margin-left:50%;transform:translateX(-50%)">'+title+'</h3>';
  h += '<div style="overflow-x:auto">';
  h += '<table style="width:100%;border-collapse:collapse;table-layout:fixed">';
  h += '<thead><tr>';
  DAYS.forEach(function(d){
    h += '<th style="border:1px solid #9ca3af;padding:8px 6px;text-align:center;font-size:13px;font-weight:700;background:#f1f5f9;color:#1e293b">'+d+'</th>';
  });
  h += '</tr></thead><tbody>';
  data.forEach(function(row){
    h += '<tr>';
    row.forEach(function(c){ h += cellHtml(c); });
    h += '</tr>';
  });
  h += '</tbody></table></div></div>';
  return h;
}

window.renderOrdManual = function(){
  var el = document.getElementById('ord-manual');
  if(!el) return;

  var html = '';

  // Legend
  html += '<div class="card" style="margin-bottom:16px">';
  html += '<div class="card-title">📖 คู่มือการทำงาน — ตารางรับออเดอร์ / ลงผลิต / ขนส่ง</div>';
  html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">';
  var codes = ['S01','S02','S03','S05','S06','S07'];
  codes.forEach(function(c){
    html += '<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:8px;font-size:12px;font-weight:600;background:'+COLORS[c]+';border:1px solid #d1d5db">('+c+') '+NAMES[c]+'</span>';
  });
  html += '<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:8px;font-size:12px;font-weight:600;background:#ef4444;color:#fff;border:1px solid #dc2626">หยุด</span>';
  html += '</div>';

  html += buildTable('วันรับออเดอร์', ORDER_DATA);
  html += buildTable('วันลงผลิต (ใช้สรุปเส้น)', PROD_DATA);
  html += buildTable('วันขนส่ง', SHIP_DATA);

  html += '</div>';

  el.innerHTML = html;
};

})();
