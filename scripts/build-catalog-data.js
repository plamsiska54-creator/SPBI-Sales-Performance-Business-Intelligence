/**
 * build-catalog-data.js
 * อ่าน Excel ข้อมูลสินค้าฝ่ายขาย แล้วสร้าง js/catalog-data.js
 * Usage: node scripts/build-catalog-data.js
 */
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

// --- Config ---
const EXCEL_PATH = path.resolve(
  'C:/Users/Wanwa/OneDrive/Desktop',
  'Data สินค้า ฝ่ายขาย (สินค้าขายปัจจุบัน - สินค้าเข้าใหม่ - สินค้ายกเลิก - สินค้ากำลังพัฒนา) AI.xlsx'
);
const OUTPUT_PATH = path.join(__dirname, '..', 'js', 'catalog-data.js');

// Channel definitions: sheetName -> config
// dataRow = row index (0-based) ที่ข้อมูลเริ่ม
const CHANNELS = [
  { sheet: 'CJ',       key: 'CJ',       label: 'CJ Express',   dataRow: 1, format: 'standard' },
  { sheet: 'Big C',     key: 'Big C',    label: 'Big C',        dataRow: 1, format: 'standard' },
  { sheet: 'Makro',     key: 'Makro',    label: 'Makro',        dataRow: 1, format: 'extended' },
  { sheet: 'Top',       key: 'Top',      label: 'Tops',         dataRow: 1, format: 'extended' },
  { sheet: 'Aeon',      key: 'Aeon',     label: 'Aeon',         dataRow: 1, format: 'aeon' },
  { sheet: 'The Mall',  key: 'The Mall', label: 'The Mall',     dataRow: 1, format: 'mall' },
  { sheet: 'Amazon',    key: 'Amazon',   label: 'Amazon',       dataRow: 2, format: 'amazon' },
  { sheet: 'BCY',       key: 'BCY',      label: 'Black Canyon', dataRow: 2, format: 'bcy' },
  { sheet: 'Booth',     key: 'Booth',    label: 'Booth',        dataRow: 2, format: 'booth' },
  { sheet: 'Online',    key: 'Online',   label: 'Online',       dataRow: 2, format: 'online' },
  { sheet: 'พันธุ์ไทย',  key: 'พันธุ์ไทย', label: 'พันธุ์ไทย',     dataRow: 2, format: 'panthai' },
];

// --- Column mappers: แต่ละ format คืน object จาก row array ---
function colStandard(r) {
  // CJ, Big C: [ลำดับ,รหัส,ชื่อ,barcode,weight,shelfLife,?,pack,type,gp%,wholesaleEx,wholesaleIn,retailEx,retailIn,?,status]
  return {
    seq: r[0], code: r[1], name: r[2], barcode: r[3],
    fda: null, halal: null,
    weight: r[4], shelfLife: r[5], pack: r[7], type: r[8],
    gp: r[9], wholesaleEx: r[10], wholesaleIn: r[11],
    retailEx: r[12], retailIn: r[13], status: r[15], note: null,
  };
}
function colExtended(r) {
  // Makro, Top: [ลำดับ,รหัส,ชื่อ,barcode,fda,halal,weight,shelfLife,?,pack,type,gp%,wholesaleEx,wholesaleIn,retailEx,retailIn,?,status]
  return {
    seq: r[0], code: r[1], name: r[2], barcode: r[3],
    fda: r[4], halal: r[5],
    weight: r[6], shelfLife: r[7], pack: r[9], type: r[10],
    gp: r[11], wholesaleEx: r[12], wholesaleIn: r[13],
    retailEx: r[14], retailIn: r[15], status: r[17], note: null,
  };
}
function colAeon(r) {
  // Aeon: [ลำดับ,รหัส,ชื่อ,barcode,?,?,weight,shelfLife,?,?,type,gp%,wholesaleEx,wholesaleIn,retailEx,retailIn,?,status]
  return {
    seq: r[0], code: r[1], name: r[2], barcode: r[3],
    fda: null, halal: null,
    weight: r[6], shelfLife: r[7], pack: null, type: r[10],
    gp: r[11], wholesaleEx: r[12], wholesaleIn: r[13],
    retailEx: r[14], retailIn: r[15], status: r[17], note: null,
  };
}
function colMall(r) {
  // The Mall: [ลำดับ,รหัส,ชื่อ,barcode,weight,?,?,?,?,?,type,gp%,wholesaleEx,wholesaleIn,retailEx,retailIn,?,status]
  return {
    seq: r[0], code: r[1], name: r[2], barcode: r[3],
    fda: null, halal: null,
    weight: r[4], shelfLife: null, pack: null, type: r[10],
    gp: r[11], wholesaleEx: r[12], wholesaleIn: r[13],
    retailEx: r[14], retailIn: r[15], status: r[17], note: null,
  };
}
function colAmazon(r) {
  // Amazon: [ลำดับ,รหัส,ชื่อ,barcode,fda,halal,weight,shelfLife,รูป,type,gp%,wholesaleEx,wholesaleIn,retailEx,retailIn,ราคาขายหน้าร้าน,ราคาเคลมได้,ราคาขายขาด,status,หมายเหตุ]
  return {
    seq: r[0], code: r[1], name: r[2], barcode: r[3],
    fda: r[4], halal: r[5],
    weight: r[6], shelfLife: r[7], pack: null, type: r[9],
    gp: r[10], wholesaleEx: r[11], wholesaleIn: r[12],
    retailEx: r[13], retailIn: r[15], // ราคาขายหน้าร้าน as retailIn
    status: r[18], note: r[19],
  };
}
function colBcy(r) {
  // BCY: [ลำดับ,รหัส,ชื่อ,barcode,fda,halal,weight,shelfLife,รูป,type,gp%,wholesaleEx,wholesaleIn,retailEx,retailIn,หมายเหตุ]
  return {
    seq: r[0], code: r[1], name: r[2], barcode: r[3],
    fda: r[4], halal: r[5],
    weight: r[6], shelfLife: r[7], pack: null, type: r[9],
    gp: r[10], wholesaleEx: r[11], wholesaleIn: r[12],
    retailEx: r[13], retailIn: r[14], status: null, note: r[15],
  };
}
function colBooth(r) {
  // Booth: [ลำดับ,รหัส,ชื่อ,barcode,fda,halal,weight,รูป,type,gp%,ราคาขาย,หมายเหตุ]
  return {
    seq: r[0], code: r[1], name: r[2], barcode: r[3],
    fda: r[4], halal: r[5],
    weight: r[6], shelfLife: null, pack: null, type: r[8],
    gp: r[9], wholesaleEx: 0, wholesaleIn: 0,
    retailEx: 0, retailIn: 0,
    status: null, note: r[11],
    _priceText: r[10], // "ส่ง 60 ปลีก -" -- parse ราคาจากข้อความ
  };
}
function colOnline(r) {
  // Online: [ลำดับ,รหัส,ชื่อ,barcode,fda,halal,weight,รูป,type,gp%,shopee,tiktok,lazada,facebook,หมายเหตุ]
  return {
    seq: r[0], code: r[1], name: r[2], barcode: r[3],
    fda: r[4], halal: r[5],
    weight: r[6], shelfLife: null, pack: null, type: r[8],
    gp: r[9], wholesaleEx: 0, wholesaleIn: 0,
    retailEx: 0, retailIn: 0,
    status: null, note: r[14],
    _shopee: r[10], _tiktok: r[11], _lazada: r[12], _facebook: r[13],
  };
}
function colPanthai(r) {
  // พันธุ์ไทย: [ลำดับ,รหัส,ชื่อ,barcode,weight,?,รูป,type,gp%,wholesaleEx,wholesaleIn,retailEx,retailIn,หมายเหตุ]
  return {
    seq: r[0], code: r[1], name: r[2], barcode: r[3],
    fda: null, halal: null,
    weight: r[4], shelfLife: null, pack: null, type: r[7],
    gp: r[8], wholesaleEx: r[9], wholesaleIn: r[10],
    retailEx: r[11], retailIn: r[12], status: null, note: r[13],
  };
}

const FORMAT_MAP = {
  standard: colStandard,
  extended: colExtended,
  aeon: colAeon,
  mall: colMall,
  amazon: colAmazon,
  bcy: colBcy,
  booth: colBooth,
  online: colOnline,
  panthai: colPanthai,
};

// --- Helpers ---

/** ตัด prefix "วรรณวนัช" / "วรรณนัช" ออกจากชื่อสินค้า แล้ว trim */
function stripPrefix(name) {
  if (!name || typeof name !== 'string') return name;
  return name.replace(/^(วรรณวนัช|วรรณนัช)\s*/g, '').trim();
}

/** แปลง GP%: ถ้า 0 < x < 1 คูณ 100 แล้วปัดเศษ */
function normalizeGp(val) {
  if (val == null || val === '' || isNaN(Number(val))) return 0;
  const n = Number(val);
  if (n === 0) return 0;
  if (n > 0 && n < 1) return Math.round(n * 100);
  return Math.round(n);
}

/** Map status text */
function mapStatus(raw) {
  if (!raw || typeof raw !== 'string') return 'วางจำหน่าย'; // default = active
  const s = raw.trim();
  if (s === 'ขายอยู่ปัจจุบัน') return 'วางจำหน่าย';
  if (s === 'ยกเลิกขาย' || s === 'ยกเลิก') return 'ยกเลิก';
  if (s === 'สินค้าใหม่') return 'สินค้าใหม่';
  if (s.includes('พัฒนา')) return 'กำลังพัฒนา';
  return s;
}

/** ตรวจว่า row เป็น data row ที่ถูกต้อง (col 0 เป็นตัวเลข ลำดับ, col 2 มีชื่อสินค้า) */
function isValidRow(row) {
  if (!row || !Array.isArray(row)) return false;
  const seq = row[0];
  const name = row[2];
  if (seq == null || name == null) return false;
  if (typeof seq === 'string' && isNaN(Number(seq))) return false;
  if (typeof name !== 'string' || name.trim() === '') return false;
  return true;
}

/** แปลงค่าเป็นตัวเลข, null/NaN -> 0 */
function num(val) {
  if (val == null || val === '') return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

/** แปลง barcode เป็น string (ป้องกัน number truncation) */
function barcodeStr(val) {
  if (val == null || val === '') return null;
  const s = String(val).trim();
  if (s === 'ไม่มีบาร์โค๊ด' || s === '-' || s === '0') return null;
  return s;
}

/** แปลง string ที่อาจเป็น null */
function strOrNull(val) {
  if (val == null || val === '') return null;
  const s = String(val).trim();
  return s === '' ? null : s;
}

/** ดึงชื่อบริษัทจาก row 0 ของ sheet (pattern: "จำหน่ายที่ ... บริษัท ...")  */
function extractCompany(headerRow) {
  if (!headerRow || !headerRow[0] || typeof headerRow[0] !== 'string') return '';
  const text = headerRow[0];
  // ลอง match "บริษัท..." ไปจนจบ (ก่อน สำนักงาน หรือ จบ string)
  // บาง sheet เขียน "บริษัทบริษัท ..." ซ้ำ ให้ตัดซ้ำออก
  const m = text.match(/(บริษัท\s*)+(.+?)(?:\s*สำนักงาน|\s*$)/);
  if (m) {
    return ('บริษัท ' + m[2]).trim();
  }
  return '';
}

/** พยายาม parse ราคาจากข้อความ Booth เช่น "ส่ง 60 ปลีก -" */
function parseBoothPrice(text) {
  if (!text || typeof text !== 'string') return { wholesaleIn: 0, retailIn: 0 };
  const sendMatch = text.match(/ส่ง\s*(\d+(?:\.\d+)?)/);
  const retailMatch = text.match(/ปลีก\s*(\d+(?:\.\d+)?)/);
  return {
    wholesaleIn: sendMatch ? Number(sendMatch[1]) : 0,
    retailIn: retailMatch ? Number(retailMatch[1]) : 0,
  };
}

// --- Main ---
function main() {
  console.log('Reading Excel:', EXCEL_PATH);
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error('ERROR: Excel file not found at', EXCEL_PATH);
    process.exit(1);
  }

  const wb = XLSX.readFile(EXCEL_PATH);
  const channelsResult = [];
  const productsResult = [];
  let idCounter = 0;

  for (const ch of CHANNELS) {
    const ws = wb.Sheets[ch.sheet];
    if (!ws) {
      console.warn(`WARNING: Sheet "${ch.sheet}" not found, skipping.`);
      channelsResult.push({ key: ch.key, label: ch.label, company: '', count: 0 });
      continue;
    }

    const allRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
    const mapper = FORMAT_MAP[ch.format];

    // ดึง company จาก row 0
    let company = '';
    const defaultCompanies = { Amazon: '', Booth: '', Online: '', 'พันธุ์ไทย': '' };
    if (ch.key in defaultCompanies) {
      company = defaultCompanies[ch.key];
    } else {
      company = extractCompany(allRows[0]);
    }

    let activeCount = 0;
    const dataRows = allRows.slice(ch.dataRow);

    for (const row of dataRows) {
      if (!isValidRow(row)) continue;

      const mapped = mapper(row);

      // Strip prefix จากชื่อ
      let prodName = stripPrefix(mapped.name);
      if (!prodName) continue;

      const status = mapStatus(mapped.status);
      const active = (status === 'วางจำหน่าย' || status === 'สินค้าใหม่');
      if (active) activeCount++;

      // Booth: parse ราคาจาก _priceText
      let wEx = num(mapped.wholesaleEx);
      let wIn = num(mapped.wholesaleIn);
      let rEx = num(mapped.retailEx);
      let rIn = num(mapped.retailIn);
      if (ch.format === 'booth' && mapped._priceText) {
        const bp = parseBoothPrice(mapped._priceText);
        wIn = bp.wholesaleIn;
        rIn = bp.retailIn;
      }

      idCounter++;
      productsResult.push({
        id: 'p' + idCounter,
        channel: ch.key,
        code: String(mapped.code || ''),
        name: prodName,
        barcode: barcodeStr(mapped.barcode),
        fda: strOrNull(mapped.fda),
        halal: strOrNull(mapped.halal),
        weight: num(mapped.weight),
        shelfLife: num(mapped.shelfLife) || null,
        pack: strOrNull(mapped.pack),
        type: strOrNull(mapped.type) || 'Ambient',
        gp: normalizeGp(mapped.gp),
        status: status,
        active: active,
        note: strOrNull(mapped.note),
        img: null,
        wholesaleEx: wEx,
        wholesaleIn: wIn,
        retailEx: rEx,
        retailIn: rIn,
      });
    }

    channelsResult.push({
      key: ch.key,
      label: ch.label,
      company: company,
      count: activeCount,
    });

    console.log(`  ${ch.key}: ${activeCount} active / ${productsResult.filter(p => p.channel === ch.key).length} total`);
  }

  // สร้าง output
  const output = {
    channels: channelsResult,
    products: productsResult,
  };

  const js = [
    '/* สร้างอัตโนมัติโดย scripts/build-catalog-data.js — อย่าแก้ไฟล์นี้ด้วยมือ',
    '   แก้ข้อมูลที่ Excel แล้วรัน: node scripts/build-catalog-data.js */',
    'window.CATALOG_DATA = ' + JSON.stringify(output, null, 1) + ';',
    '',
  ].join('\n');

  fs.writeFileSync(OUTPUT_PATH, js, 'utf8');
  console.log(`\nOutput: ${OUTPUT_PATH}`);
  console.log(`Channels: ${channelsResult.length}, Products: ${productsResult.length}`);
}

main();
