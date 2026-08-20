/**
 * build-timeline-data.js
 * ดึงข้อมูล Time Line สินค้าใหม่ (NPD) และสินค้ายกเลิก จากไฟล์ Excel
 *
 *   input : Time Line Product.xlsx  (2 ชีท: NPD, ยกเลิก)
 *   output: js/prod-timeline-data.js  → window.TIMELINE_DEFAULT_DATA
 *
 * รัน: node scripts/build-timeline-data.js
 *
 * หัวตารางใน Excel เป็นหัวซ้อน 3 ชั้น (merge cell) สคริปต์นี้จับตำแหน่งคอลัมน์
 * ตามลำดับที่เห็นในไฟล์ ถ้าใครไปแทรก/สลับคอลัมน์ใน Excel ต้องมาแก้ที่ COLS ด้วย
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'js', 'prod-timeline-data.js');

// ไฟล์อยู่บนเดสก์ท็อป ไม่ได้อยู่ในโปรเจกต์ — เปลี่ยนที่ได้ด้วย env TIMELINE_XLSX
const XLSX_FILE = process.env.TIMELINE_XLSX ||
  path.join(ROOT, '..', 'Time Line Product.xlsx');

/** ตำแหน่งคอลัมน์ในชีท NPD (ดูจากหัวซ้อน 3 ชั้น แถวที่ 2-4 ของไฟล์) */
const NPD = {
  seq: 0, channel: 1, name: 2, category: 3, packSize: 4,
  asOf: 5,
  ownerStatus: 6, ownerNote: 7,       // สถานะ > คุณอู๋ + หมายเหตุ
  custStatus: 8, custNote: 9,         // สถานะ > ลูกค้า + หมายเหตุ
  sellDate: 10,                       // วันที่กำหนดขาย
  cost: 11,                           // สิ่งที่เกี่ยวข้อง > ต้นทุน
  quote: 12,                          //                  > ใบเสนอราคา
  labelDesign: 13,                    //                  > ฉลาก > ออกแบบ
  labelOrder: 14,                     //                         > สั่งซื้อ
  labelStock: 15,                     //                         > สต็อกคลัง
  material: 16,                       //                  > วัตถุดิบ
  nutrition: 17,                      //                  > นูทริชั่น
  shelfLife: 18,                      //                  > อายุสินค้า
  fda: 19                             //                  > อย.
};

/** ตำแหน่งคอลัมน์ในชีท "ยกเลิก" */
const CXL = {
  seq: 0, channel: 1, code: 2, name: 3, category: 4, packSize: 5,
  date: 6,
  reason1: 7, reason2: 8, reason3: 9,
  pkgWarehouse: 10, pkgStaff: 11, pkgTotal: 12,   // แพ็คเกจจิ้ง: คลัง / คุณเปิ้ล / รวม
  stkWarehouse: 13, stkStaff: 14, stkTotal: 15,   // สติ๊กเกอร์: คลัง / คุณเปิ้ล / รวม
  notifyTeam: 16, notifyPlan: 17, notifyProd: 18, notifyStore: 19
};

const txt = (v) => (v === null || v === undefined ? '' : String(v).trim());
const num = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
  return isFinite(n) ? n : null;
};

/**
 * วันที่ในไฟล์เก็บเป็นปี พ.ศ. (serial ราว 244,xxx) ต้องลบ 543 ปีให้เป็น ค.ศ.
 * ถ้าช่องนั้นเป็นข้อความ (เช่น "สินค้าใหม่เข้าจึงถอด") ให้คืนข้อความไปเลย
 */
function thaiDate(v) {
  if (v === '' || v === null || v === undefined) return { date: null, note: '' };
  if (typeof v !== 'number') return { date: null, note: txt(v) };
  const d = XLSX.SSF.parse_date_code(v);
  if (!d) return { date: null, note: '' };
  const y = d.y > 2400 ? d.y - 543 : d.y;   // ปี พ.ศ. → ค.ศ.
  return {
    date: y + '-' + String(d.m).padStart(2, '0') + '-' + String(d.d).padStart(2, '0'),
    note: ''
  };
}

function main() {
  if (!fs.existsSync(XLSX_FILE)) {
    console.error('ไม่พบไฟล์:', XLSX_FILE);
    console.error('ระบุตำแหน่งไฟล์ได้ด้วย:  $env:TIMELINE_XLSX="D:\path\Time Line Product.xlsx"');
    process.exit(1);
  }

  const wb = XLSX.readFile(XLSX_FILE);
  const asRows = (name) => XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' });

  /* ── ชีท NPD ── */
  const npdRows = asRows('NPD');
  const newItems = [];
  let asOf = '';

  npdRows.slice(4).forEach((r) => {
    if (!txt(r[NPD.name])) return;
    if (!asOf) asOf = thaiDate(r[NPD.asOf]).date || '';

    const sell = thaiDate(r[NPD.sellDate]);
    newItems.push({
      id: 'npd_' + (num(r[NPD.seq]) || newItems.length + 1),
      seq: num(r[NPD.seq]),
      channel: txt(r[NPD.channel]),
      name: txt(r[NPD.name]),
      category: txt(r[NPD.category]),
      packSize: num(r[NPD.packSize]),
      owner: { status: txt(r[NPD.ownerStatus]), note: txt(r[NPD.ownerNote]) },
      customer: { status: txt(r[NPD.custStatus]), note: txt(r[NPD.custNote]) },
      sellDate: sell.date,
      sellDateNote: sell.note,
      // เช็คลิสต์ 9 หัวข้อ ตามกลุ่ม "สิ่งที่เกี่ยวข้อง" ในไฟล์
      tasks: {
        cost:        txt(r[NPD.cost]),
        quote:       txt(r[NPD.quote]),
        labelDesign: txt(r[NPD.labelDesign]),
        labelOrder:  txt(r[NPD.labelOrder]),
        labelStock:  txt(r[NPD.labelStock]),
        material:    txt(r[NPD.material]),
        nutrition:   txt(r[NPD.nutrition]),
        shelfLife:   txt(r[NPD.shelfLife]),
        fda:         txt(r[NPD.fda])
      }
    });
  });

  /* ── ชีท ยกเลิก ── */
  const cxlRows = asRows('ยกเลิก');
  const cancelItems = [];

  cxlRows.slice(5).forEach((r) => {
    if (!txt(r[CXL.name])) return;
    const d = thaiDate(r[CXL.date]);
    cancelItems.push({
      id: 'cxl_' + (num(r[CXL.seq]) || cancelItems.length + 1),
      seq: num(r[CXL.seq]),
      channel: txt(r[CXL.channel]),
      code: txt(r[CXL.code]),
      name: txt(r[CXL.name]),
      category: txt(r[CXL.category]),
      packSize: num(r[CXL.packSize]),
      date: d.date,
      dateNote: d.note,
      reasons: [txt(r[CXL.reason1]), txt(r[CXL.reason2]), txt(r[CXL.reason3])].filter(Boolean),
      stock: {
        packaging: { warehouse: num(r[CXL.pkgWarehouse]), staff: num(r[CXL.pkgStaff]), total: num(r[CXL.pkgTotal]) },
        sticker:   { warehouse: num(r[CXL.stkWarehouse]), staff: num(r[CXL.stkStaff]), total: num(r[CXL.stkTotal]) }
      },
      notify: {
        team:  txt(r[CXL.notifyTeam]),
        plan:  txt(r[CXL.notifyPlan]),
        prod:  txt(r[CXL.notifyProd]),
        store: txt(r[CXL.notifyStore])
      }
    });
  });

  /* ตัวเลือกสถานะที่ไฟล์ Excel ระบุไว้ในคอลัมน์ท้ายสุด (ใช้เป็น dropdown ในฟอร์ม) */
  const legend = (col) => [...new Set(npdRows.slice(4).map((r) => txt(r[col])).filter(Boolean))];

  const out = {
    version: asOf || 'unknown',
    asOf: asOf,
    source: 'Time Line Product.xlsx',
    taskOptions: legend(22),      // เสร็จแล้ว / กำลังดำเนินการ / รอสั่งซื้อ / ...
    approvalOptions: legend(23),  // ผ่าน / ไม่ผ่าน / กำลังพัฒนา / รอส่งตัวอย่าง
    newItems: newItems,
    cancelItems: cancelItems
  };

  fs.writeFileSync(OUT,
    '// สร้างอัตโนมัติโดย scripts/build-timeline-data.js — อย่าแก้ไฟล์นี้ด้วยมือ\n' +
    '// ที่มา: ' + out.source + ' (ข้อมูล ณ ' + (asOf || '-') + ')\n' +
    'var TIMELINE_DEFAULT_DATA = ' + JSON.stringify(out, null, 1) + ';\n', 'utf8');

  console.log('ข้อมูล ณ วันที่   : ' + (asOf || '-'));
  console.log('สินค้าใหม่ (NPD) : ' + newItems.length + ' รายการ');
  console.log('สินค้ายกเลิก     : ' + cancelItems.length + ' รายการ');
  console.log('ตัวเลือกสถานะงาน : ' + out.taskOptions.join(', '));
  console.log('ตัวเลือกผลอนุมัติ : ' + out.approvalOptions.join(', '));
  console.log('เขียนไฟล์        : js/prod-timeline-data.js (' + Math.round(fs.statSync(OUT).size / 1024) + ' KB)');
}

main();
