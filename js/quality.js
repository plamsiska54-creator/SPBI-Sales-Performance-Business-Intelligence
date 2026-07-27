// ============================================================
// QUALITY.JS — Product Quality Analytics Tab
// Depends on: Chart.js, app.js (showSubTab)
// ============================================================

// --- ข้อมูลดิบรายเดือน สำหรับ filter ตามปี/เดือน ---
var QUALITY_RAW = [
  // ปี 2568 (ม.ค. - ธ.ค.)
  { year: 2568, month: 1, channels: { MDT: 9, Amazon: 16, Online: 0, Booth: 174 }, channelCost: { MDT: 395, Amazon: 850, Online: 0, Booth: 9595 }, types: { 'ขนมเสีย/เปรี้ยว/ขม': 102, 'ขนมขึ้นรา/ไม่ได้มาตรฐาน': 13, 'ไม่ยิงวันผลิต/หมดอายุ': 80, 'บรรจุภัณฑ์บวม/ซีลไม่ดี': 0, 'สิ่งแปลกปลอม': 4 }, totalCount: 199, totalCost: 10840 },
  { year: 2568, month: 2, channels: { MDT: 9, Amazon: 27, Online: 0, Booth: 23 }, channelCost: { MDT: 350, Amazon: 1420, Online: 0, Booth: 620 }, types: { 'ขนมเสีย/เปรี้ยว/ขม': 34, 'ขนมขึ้นรา/ไม่ได้มาตรฐาน': 1, 'ไม่ยิงวันผลิต/หมดอายุ': 3, 'บรรจุภัณฑ์บวม/ซีลไม่ดี': 0, 'สิ่งแปลกปลอม': 21 }, totalCount: 59, totalCost: 2390 },
  { year: 2568, month: 3, channels: { MDT: 5, Amazon: 116, Online: 2, Booth: 22 }, channelCost: { MDT: 179, Amazon: 6983, Online: 75, Booth: 1230 }, types: { 'ขนมเสีย/เปรี้ยว/ขม': 104, 'ขนมขึ้นรา/ไม่ได้มาตรฐาน': 11, 'ไม่ยิงวันผลิต/หมดอายุ': 10, 'บรรจุภัณฑ์บวม/ซีลไม่ดี': 19, 'สิ่งแปลกปลอม': 1 }, totalCount: 145, totalCost: 8467 },
  { year: 2568, month: 4, channels: { MDT: 7, Amazon: 96, Online: 12, Booth: 2 }, channelCost: { MDT: 335, Amazon: 12360, Online: 510, Booth: 105 }, types: { 'ขนมเสีย/เปรี้ยว/ขม': 36, 'ขนมขึ้นรา/ไม่ได้มาตรฐาน': 15, 'ไม่ยิงวันผลิต/หมดอายุ': 6, 'บรรจุภัณฑ์บวม/ซีลไม่ดี': 6, 'สิ่งแปลกปลอม': 54 }, totalCount: 117, totalCost: 13310 },
  { year: 2568, month: 5, channels: { MDT: 47, Amazon: 31, Online: 5, Booth: 7 }, channelCost: { MDT: 4155, Amazon: 1745, Online: 240, Booth: 500 }, types: { 'ขนมเสีย/เปรี้ยว/ขม': 21, 'ขนมขึ้นรา/ไม่ได้มาตรฐาน': 44, 'ไม่ยิงวันผลิต/หมดอายุ': 0, 'บรรจุภัณฑ์บวม/ซีลไม่ดี': 17, 'สิ่งแปลกปลอม': 8 }, totalCount: 90, totalCost: 6640 },
  { year: 2568, month: 6, channels: { MDT: 84, Amazon: 20, Online: 35, Booth: 19 }, channelCost: { MDT: 7908, Amazon: 1145, Online: 910, Booth: 1360 }, types: { 'ขนมเสีย/เปรี้ยว/ขม': 17, 'ขนมขึ้นรา/ไม่ได้มาตรฐาน': 111, 'ไม่ยิงวันผลิต/หมดอายุ': 1, 'บรรจุภัณฑ์บวม/ซีลไม่ดี': 24, 'สิ่งแปลกปลอม': 5 }, totalCount: 158, totalCost: 11323 },
  { year: 2568, month: 7, channels: { MDT: 18, Amazon: 41, Online: 18, Booth: 12 }, channelCost: { MDT: 475, Amazon: 2375, Online: 602, Booth: 575 }, types: { 'ขนมเสีย/เปรี้ยว/ขม': 50, 'ขนมขึ้นรา/ไม่ได้มาตรฐาน': 25, 'ไม่ยิงวันผลิต/หมดอายุ': 1, 'บรรจุภัณฑ์บวม/ซีลไม่ดี': 10, 'สิ่งแปลกปลอม': 3 }, totalCount: 89, totalCost: 4027 },
  { year: 2568, month: 8, channels: { MDT: 20, Amazon: 56, Online: 59, Booth: 13 }, channelCost: { MDT: 699, Amazon: 3298, Online: 0, Booth: 1160 }, types: { 'ขนมเสีย/เปรี้ยว/ขม': 83, 'ขนมขึ้นรา/ไม่ได้มาตรฐาน': 14, 'ไม่ยิงวันผลิต/หมดอายุ': 0, 'บรรจุภัณฑ์บวม/ซีลไม่ดี': 20, 'สิ่งแปลกปลอม': 31 }, totalCount: 148, totalCost: 5157 },
  { year: 2568, month: 9, channels: { MDT: 14, Amazon: 5, Online: 22, Booth: 0 }, channelCost: { MDT: 496, Amazon: 350, Online: 3958.44, Booth: 0 }, types: { 'ขนมเสีย/เปรี้ยว/ขม': 11, 'ขนมขึ้นรา/ไม่ได้มาตรฐาน': 11, 'ไม่ยิงวันผลิต/หมดอายุ': 0, 'บรรจุภัณฑ์บวม/ซีลไม่ดี': 15, 'สิ่งแปลกปลอม': 4 }, totalCount: 41, totalCost: 4804.44 },
  { year: 2568, month: 10, channels: { MDT: 11, Amazon: 0, Online: 23, Booth: 0 }, channelCost: { MDT: 429, Amazon: 0, Online: 3316, Booth: 0 }, types: { 'ขนมเสีย/เปรี้ยว/ขม': 17, 'ขนมขึ้นรา/ไม่ได้มาตรฐาน': 1, 'ไม่ยิงวันผลิต/หมดอายุ': 0, 'บรรจุภัณฑ์บวม/ซีลไม่ดี': 6, 'สิ่งแปลกปลอม': 10 }, totalCount: 34, totalCost: 3745 },
  { year: 2568, month: 11, channels: { MDT: 7, Amazon: 20, Online: 11, Booth: 0 }, channelCost: { MDT: 243, Amazon: 1180, Online: 420, Booth: 0 }, types: { 'ขนมเสีย/เปรี้ยว/ขม': 11, 'ขนมขึ้นรา/ไม่ได้มาตรฐาน': 1, 'ไม่ยิงวันผลิต/หมดอายุ': 3, 'บรรจุภัณฑ์บวม/ซีลไม่ดี': 3, 'สิ่งแปลกปลอม': 20 }, totalCount: 38, totalCost: 1843 },
  { year: 2568, month: 12, channels: { MDT: 3, Amazon: 3, Online: 2, Booth: 0 }, channelCost: { MDT: 129, Amazon: 120, Online: 480.76, Booth: 0 }, types: { 'ขนมเสีย/เปรี้ยว/ขม': 2, 'ขนมขึ้นรา/ไม่ได้มาตรฐาน': 0, 'ไม่ยิงวันผลิต/หมดอายุ': 0, 'บรรจุภัณฑ์บวม/ซีลไม่ดี': 2, 'สิ่งแปลกปลอม': 4 }, totalCount: 8, totalCost: 729.76 },
  // ปี 2569 (ม.ค. - เม.ย.)
  { year: 2569, month: 1, channels: { MDT: 15, Amazon: 40, Online: 0, Booth: 2 }, channelCost: { MDT: 460, Amazon: 3855.01, Online: 0, Booth: 100 }, types: { 'ขนมเสีย/เปรี้ยว/ขม': 4, 'ขนมขึ้นรา/ไม่ได้มาตรฐาน': 8, 'ไม่ยิงวันผลิต/หมดอายุ': 0, 'บรรจุภัณฑ์บวม/ซีลไม่ดี': 11, 'สิ่งแปลกปลอม': 34 }, totalCount: 57, totalCost: 4415.01 },
  { year: 2569, month: 2, channels: { MDT: 8, Amazon: 8, Online: 0, Booth: 71 }, channelCost: { MDT: 275, Amazon: 695.37, Online: 0, Booth: 1420 }, types: { 'ขนมเสีย/เปรี้ยว/ขม': 2, 'ขนมขึ้นรา/ไม่ได้มาตรฐาน': 74, 'ไม่ยิงวันผลิต/หมดอายุ': 0, 'บรรจุภัณฑ์บวม/ซีลไม่ดี': 5, 'สิ่งแปลกปลอม': 6 }, totalCount: 87, totalCost: 2390.37 },
  { year: 2569, month: 3, channels: { MDT: 67, Amazon: 51, Online: 0, Booth: 3 }, channelCost: { MDT: 1482, Amazon: 2851.03, Online: 0, Booth: 195 }, types: { 'ขนมเสีย/เปรี้ยว/ขม': 4, 'ขนมขึ้นรา/ไม่ได้มาตรฐาน': 20, 'ไม่ยิงวันผลิต/หมดอายุ': 1, 'บรรจุภัณฑ์บวม/ซีลไม่ดี': 2, 'สิ่งแปลกปลอม': 94 }, totalCount: 121, totalCost: 4528.03 },
  { year: 2569, month: 4, channels: { MDT: 2, Amazon: 3, Online: 0, Booth: 2 }, channelCost: { MDT: 68, Amazon: 1345, Online: 0, Booth: 220 }, types: { 'ขนมเสีย/เปรี้ยว/ขม': 0, 'ขนมขึ้นรา/ไม่ได้มาตรฐาน': 2, 'ไม่ยิงวันผลิต/หมดอายุ': 0, 'บรรจุภัณฑ์บวม/ซีลไม่ดี': 2, 'สิ่งแปลกปลอม': 3 }, totalCount: 7, totalCost: 1633 }
];

// ชื่อเดือนภาษาไทย (index 1-12)
var _qaMonthNames = ['', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

// --- Real Data (extracted from Excel: รายงานปัญหาขนม ปี 2568-2569) ---
var QUALITY_DATA = {
  kpi: {
    totalComplaints: 1398,
    returnedProducts: 601,
    defectRate: 1.2,
    defectiveLots: 449,
    qualityCost: 86242.61,
    closedCases: 1126,
    openCases: 272
  },
  trend: {
    months: ['ม.ค.68','ก.พ.68','มี.ค.68','เม.ย.68','พ.ค.68','มิ.ย.68','ก.ค.68','ส.ค.68','ก.ย.68','ต.ค.68','พ.ย.68','ธ.ค.68','ม.ค.69','ก.พ.69','มี.ค.69','เม.ย.69'],
    complaints: [199,59,145,117,90,158,89,148,41,34,38,8,57,87,121,7]
  },
  complaintTypes: [
    { type: 'ขนมเสีย/เปรี้ยว/ขม', count: 498 },
    { type: 'ขนมขึ้นรา/ไม่ได้มาตรฐาน', count: 351 },
    { type: 'สิ่งแปลกปลอม', count: 302 },
    { type: 'บรรจุภัณฑ์บวม/ซีลไม่ดี', count: 142 },
    { type: 'ไม่ยิงวันผลิต/หมดอายุ', count: 105 }
  ],
  products: [
    { name: 'เอแคลร์นมสด', count: 456, pct: 21 },
    { name: 'ครีมฮอร์น', count: 214, pct: 10 },
    { name: 'ชิฟฟ่อนรวมรส', count: 191, pct: 9 },
    { name: 'ขนมปังสังขยา', count: 97, pct: 5 },
    { name: 'ผลไม้อบแห้ง', count: 80, pct: 4 },
    { name: 'ทองม้วน', count: 80, pct: 4 },
    { name: 'ขนมปังแถว', count: 74, pct: 3 },
    { name: 'ชิฟฟ่อนสอดไส้เนยมะพร้าว', count: 71, pct: 3 },
    { name: 'ลูกส้ม', count: 71, pct: 3 },
    { name: 'เค้กเบาหวิว', count: 68, pct: 3 },
    { name: 'ชิฟฟ่อนแยกชิ้น', count: 60, pct: 3 },
    { name: 'ครีมฮอร์น คละรส', count: 49, pct: 2 },
    { name: 'ครีมฮอร์นวนิลา', count: 44, pct: 2 },
    { name: 'ขนมปังเนยนิ่ม', count: 41, pct: 2 },
    { name: 'เอแคลร์ชาไทย', count: 38, pct: 2 },
    { name: 'อื่นๆ', count: 514, pct: 24 }
  ],
  lots: [
    { lot: 'LOT-6804019', date: '2025-04-01', machine: 'MDT', shift: 'MDT', supervisor: 'MDT', produced: 1700, defects: 170, cause: 'เปรี้ยวก่อนวันหมดอายุ' },
    { lot: 'LOT-6803018', date: '2025-03-01', machine: 'MDT', shift: 'MDT', supervisor: 'MDT', produced: 980, defects: 98, cause: 'เปรี้ยวก่อนวันหมดอายุ' },
    { lot: 'LOT-6806289', date: '2025-06-01', machine: 'Online', shift: 'Online', supervisor: 'Online', produced: 870, defects: 87, cause: 'ได้รับวนิลาแทนใบเตย' },
    { lot: 'LOT-6807297', date: '2025-07-01', machine: 'Online', shift: 'Online', supervisor: 'Online', produced: 850, defects: 85, cause: 'ขนมปังแข็ง รสชาติไม่อร่อย' },
    { lot: 'LOT-6801253', date: '2025-01-01', machine: 'Booth', shift: 'Booth', supervisor: 'Booth', produced: 800, defects: 80, cause: 'ก้นกล่องแฉะ' },
    { lot: 'LOT-6801255', date: '2025-01-01', machine: 'Booth', shift: 'Booth', supervisor: 'Booth', produced: 800, defects: 80, cause: 'ไม่มีวันผลิต/วันหมดอายุ' },
    { lot: 'LOT-6806028', date: '2025-06-01', machine: 'MDT', shift: 'MDT', supervisor: 'MDT', produced: 770, defects: 77, cause: 'ขึ้นรา' },
    { lot: 'LOT-6902278', date: '2026-02-01', machine: 'Booth', shift: 'Booth', supervisor: 'Booth', produced: 710, defects: 71, cause: 'ขึ้นรา' },
    { lot: 'LOT-6802008', date: '2025-02-01', machine: 'MDT', shift: 'MDT', supervisor: 'MDT', produced: 640, defects: 64, cause: 'เปรี้ยวก่อนวันหมดอายุ' },
    { lot: 'LOT-6803125', date: '2025-03-01', machine: 'Amazon', shift: 'Amazon', supervisor: 'Amazon', produced: 580, defects: 58, cause: 'ลูกค้าได้ของไม่ครบ' },
    { lot: 'LOT-6810321', date: '2025-10-01', machine: 'Online', shift: 'Online', supervisor: 'Online', produced: 500, defects: 50, cause: 'แพ็คสินค้าไม่ดี ไม่เรียง' },
    { lot: 'LOT-6802010', date: '2025-02-01', machine: 'MDT', shift: 'MDT', supervisor: 'MDT', produced: 400, defects: 40, cause: 'เปรี้ยวก่อนวันหมดอายุ' },
    { lot: 'LOT-6810325', date: '2025-10-01', machine: 'Online', shift: 'Online', supervisor: 'Online', produced: 390, defects: 39, cause: 'มีรสชาติเปรี้ยว' },
    { lot: 'LOT-6801001', date: '2025-01-01', machine: 'MDT', shift: 'MDT', supervisor: 'MDT', produced: 380, defects: 38, cause: 'ไส้เปรี้ยวก่อนวันหมดอายุ' },
    { lot: 'LOT-6809313', date: '2025-09-01', machine: 'Online', shift: 'Online', supervisor: 'Online', produced: 360, defects: 36, cause: 'ขึ้นราก่อนวันหมดอายุ' }
  ],
  process: [
    { step: 'สินค้าเสีย/หมดอายุ', defects: 231 },
    { step: 'อื่นๆ', defects: 190 },
    { step: 'วัตถุดิบ', defects: 152 },
    { step: 'สิ่งแปลกปลอม', defects: 100 },
    { step: 'ขนส่ง', defects: 46 },
    { step: 'ติดฉลาก/ยิงวัน', defects: 14 },
    { step: 'ผลิต/อบ', defects: 10 },
    { step: 'บรรจุ/ซีล', defects: 6 },
    { step: 'จัดเก็บ/อุณหภูมิ', defects: 2 }
  ],
  materials: [
    { supplier: 'เอแคลร์นมสด', lot: 'PRD-001', received: 'ปี 2568-2569', expiry: '-', issues: 456 },
    { supplier: 'ครีมฮอร์น', lot: 'PRD-002', received: 'ปี 2568-2569', expiry: '-', issues: 214 },
    { supplier: 'ชิฟฟ่อนรวมรส', lot: 'PRD-003', received: 'ปี 2568-2569', expiry: '-', issues: 191 },
    { supplier: 'ขนมปังสังขยา', lot: 'PRD-004', received: 'ปี 2568-2569', expiry: '-', issues: 97 },
    { supplier: 'ผลไม้อบแห้ง', lot: 'PRD-005', received: 'ปี 2568-2569', expiry: '-', issues: 80 },
    { supplier: 'ทองม้วน', lot: 'PRD-006', received: 'ปี 2568-2569', expiry: '-', issues: 80 },
    { supplier: 'ขนมปังแถว', lot: 'PRD-007', received: 'ปี 2568-2569', expiry: '-', issues: 74 },
    { supplier: 'ชิฟฟ่อนสอดไส้เนยมะพร้าว', lot: 'PRD-008', received: 'ปี 2568-2569', expiry: '-', issues: 71 }
  ],
  customers: [
    { channel: 'Cafe Amazon', complaints: 533, returns: 240, returnRate: 45.0 },
    { channel: 'Booth', complaints: 350, returns: 158, returnRate: 45.1 },
    { channel: 'Modern Trade', complaints: 326, returns: 147, returnRate: 45.1 },
    { channel: 'Online', complaints: 189, returns: 85, returnRate: 45.0 }
  ],
  geo: [
    { province: 'Online Platform', issues: 203, branches: 'Lazada, TikTok, Shopee' },
    { province: 'CJ Express', issues: 71, branches: 'CJ สาขาต่างๆ' },
    { province: 'Amazon (COCO)', issues: 53, branches: 'COCO C, COCO F2, COCO A' },
    { province: 'Big C', issues: 52, branches: 'Big C สาขาต่างๆ' },
    { province: 'นครปฐม', issues: 49, branches: 'คุณาวรรณ, หน้ามอ, ลำพยา' },
    { province: 'อำนาจเจริญ', issues: 19, branches: 'สาขาอำนาจเจริญ' },
    { province: 'ระยอง', issues: 17, branches: 'มินิบิ๊กซี ระยอง' },
    { province: 'ลูกค้ารายวัน', issues: 17, branches: 'บูธรายวัน' },
    { province: 'ราชบุรี', issues: 16, branches: 'บิ๊กซีมินิ ราชบุรี' },
    { province: 'ภูเก็ต', issues: 15, branches: 'ใต้-ภูเก็ต' },
    { province: 'บูธขาย', issues: 15, branches: 'บูธหลัก, แม่กุหลาบ' },
    { province: 'นครสวรรค์', issues: 14, branches: 'นครสวรรค์ 1, 2' }
  ],
  rca: [
    { category: 'คน', label: 'Man', count: 214, details: 'พนักงานลืมยิงวันผลิต/หมดอายุ, ขาดการอบรม' },
    { category: 'เครื่องจักร', label: 'Machine', count: 142, details: 'เครื่องซีลเสื่อมสภาพ, อุณหภูมิซีลไม่เหมาะสม' },
    { category: 'วัตถุดิบ', label: 'Material', count: 389, details: 'วัตถุดิบเสื่อมคุณภาพ, ไข่/นมใกล้หมดอายุ' },
    { category: 'วิธีการ', label: 'Method', count: 42, details: 'SOP ไม่ครบถ้วน, ขั้นตอนตรวจสอบไม่เพียงพอ' },
    { category: 'สิ่งแวดล้อม', label: 'Environment', count: 460, details: 'อุณหภูมิจัดเก็บ/ขนส่งไม่เหมาะสม, ความชื้นสูง' },
    { category: 'การวัด', label: 'Measurement', count: 151, details: 'ไม่มีเครื่องตรวจจับโลหะ, ตรวจสอบไม่ทั่วถึง' }
  ],
  capa: [
    { date: '2025-01-05', owner: 'ฝ่ายผลิต', cause: 'ขนมเสีย/เปรี้ยวก่อนหมดอายุ', action: 'ตรวจสอบอุณหภูมิจัดเก็บทุกวัน + ปรับอายุสินค้า', due: '2025-01-15', status: 'done', closed: '2025-01-13' },
    { date: '2025-02-07', owner: 'QA/QC', cause: 'ขนมขึ้นรา/ไม่ได้มาตรฐาน', action: 'ปรับปรุงระบบควบคุมความชื้น + ตรวจวัตถุดิบเข้มงวด', due: '2025-02-17', status: 'done', closed: '2025-02-15' },
    { date: '2025-03-09', owner: 'ฝ่ายผลิต', cause: 'ไม่ยิงวันผลิต/หมดอายุ', action: 'อบรมพนักงานใหม่ + เพิ่ม checklist ก่อนส่ง', due: '2025-03-19', status: 'done', closed: '2025-03-17' },
    { date: '2025-04-11', owner: 'ฝ่ายซ่อมบำรุง', cause: 'บรรจุภัณฑ์บวม/ซีลไม่ดี', action: 'PM เครื่องซีลทุกสัปดาห์ + ตรวจอุณหภูมิซีลบาร์', due: '2025-04-21', status: 'done', closed: '2025-04-19' },
    { date: '2025-05-13', owner: 'QA/QC', cause: 'สิ่งแปลกปลอม', action: 'ติดตั้ง metal detector + สวมหมวก/ถุงมือ 100%', due: '2025-05-23', status: 'inprogress', closed: '' },
    { date: '2026-06-15', owner: 'ฝ่ายคลัง', cause: 'อุณหภูมิจัดเก็บไม่เหมาะสม', action: 'ติดตั้ง IoT sensor ในตู้แช่ + แจ้งเตือนอัตโนมัติ', due: '2026-06-25', status: 'inprogress', closed: '' },
    { date: '2026-01-17', owner: 'ฝ่ายจัดซื้อ', cause: 'วัตถุดิบใกล้หมดอายุ', action: 'ใช้ระบบ FEFO + ตรวจรับสินค้าเข้มงวด', due: '2026-01-27', status: 'inprogress', closed: '' },
    { date: '2026-02-19', owner: 'ฝ่าย R&D', cause: 'ขนมขึ้นราในฤดูฝน (มิ.ย.-ส.ค.)', action: 'เพิ่มสารกันรา + ลดอายุสินค้า 2 วัน', due: '2026-02-28', status: 'pending', closed: '' },
    { date: '2026-03-21', owner: 'ฝ่ายขาย', cause: 'ปัญหาเฉพาะช่วง Amazon มี.ค.-เม.ย.68', action: 'ตรวจสอบ cold chain ตัวแทน Amazon + ปรับเส้นทางขนส่ง', due: '2026-03-28', status: 'pending', closed: '' },
    { date: '2026-04-23', owner: 'ฝ่ายขาย', cause: 'Booth มี complaint สูง ม.ค.68', action: 'อบรมพนักงานบูธ + ตรวจ stock rotation', due: '2026-04-28', status: 'pending', closed: '' }
  ]
};

// --- Render tracking ---
var _qaRendered = {};
var _qaCharts = {};

// ฟังก์ชันช่วยทำลาย Chart เดิมก่อนสร้างใหม่
function _qaDestroyChart(key) {
  if (_qaCharts[key]) {
    _qaCharts[key].destroy();
    _qaCharts[key] = null;
  }
}

// ฟังก์ชันจัดรูปแบบตัวเลข
function _qaFmtNum(n) {
  return n.toLocaleString('th-TH');
}

// ============================================================
// 1. Quality Overview (qa-overview)
// ============================================================
function renderQaOverview() {
  if (_qaRendered['overview']) return;
  _qaRendered['overview'] = true;

  var d = QUALITY_DATA.kpi;
  var container = document.getElementById('qa-overview');
  if (!container) return;

  // KPI cards
  var kpiHtml = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">'
    + '<div class="kpi-card blue"><div class="kpi-label">ข้อร้องเรียนทั้งหมด</div><div class="kpi-value">' + d.totalComplaints + '</div><div class="kpi-sub">รายการ</div></div>'
    + '<div class="kpi-card cyan"><div class="kpi-label">สินค้าคืน</div><div class="kpi-value">' + d.returnedProducts + '</div><div class="kpi-sub">รายการ</div></div>'
    + '<div class="kpi-card red"><div class="kpi-label">อัตราของเสีย</div><div class="kpi-value">' + d.defectRate + '%</div><div class="kpi-sub">ของยอดผลิตทั้งหมด</div></div>'
    + '<div class="kpi-card yellow"><div class="kpi-label">Lot ที่มีปัญหา</div><div class="kpi-value">' + d.defectiveLots + '</div><div class="kpi-sub">Lot</div></div>'
    + '<div class="kpi-card purple"><div class="kpi-label">ต้นทุนคุณภาพ</div><div class="kpi-value">฿' + _qaFmtNum(d.qualityCost) + '</div><div class="kpi-sub">บาท</div></div>'
    + '<div class="kpi-card green"><div class="kpi-label">เคสปิดแล้ว</div><div class="kpi-value">' + d.closedCases + '</div><div class="kpi-sub">รายการ</div></div>'
    + '<div class="kpi-card red"><div class="kpi-label">เคสค้างอยู่</div><div class="kpi-value">' + d.openCases + '</div><div class="kpi-sub">รายการ</div></div>'
    + '</div>';

  // Charts
  var chartHtml = '<div class="grid g2" style="margin-top:18px">'
    + '<div><h4 style="margin-bottom:8px">แนวโน้มข้อร้องเรียน (6 เดือนล่าสุด)</h4><div class="chart-wrap h280"><canvas id="qaChartTrend"></canvas></div></div>'
    + '<div><h4 style="margin-bottom:8px">สถานะเคส</h4><div class="chart-wrap h280"><canvas id="qaChartStatus"></canvas></div></div>'
    + '</div>';

  container.innerHTML = kpiHtml + chartHtml;

  // Trend chart
  _qaDestroyChart('trend');
  var ctx1 = document.getElementById('qaChartTrend');
  if (ctx1) {
    _qaCharts['trend'] = new Chart(ctx1, {
      type: 'line',
      data: {
        labels: QUALITY_DATA.trend.months,
        datasets: [{
          label: 'จำนวน Complaints',
          data: QUALITY_DATA.trend.complaints,
          borderColor: '#ea580c',
          backgroundColor: 'rgba(234,88,12,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: '#ea580c'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }

  // Status donut
  _qaDestroyChart('status');
  var ctx2 = document.getElementById('qaChartStatus');
  if (ctx2) {
    _qaCharts['status'] = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: ['ปิดแล้ว', 'ค้างอยู่'],
        datasets: [{
          data: [d.closedCases, d.openCases],
          backgroundColor: ['#22c55e', '#ef4444']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '58%', plugins: { legend: { position: 'bottom' } } }
    });
  }
}

// ============================================================
// 2. วิเคราะห์ประเภทปัญหา (qa-complaint)
// ============================================================
function renderQaComplaint() {
  if (_qaRendered['complaint']) return;
  _qaRendered['complaint'] = true;

  var container = document.getElementById('qa-complaint');
  if (!container) return;

  var items = QUALITY_DATA.complaintTypes;
  var labels = items.map(function(i) { return i.type; });
  var counts = items.map(function(i) { return i.count; });
  var total = counts.reduce(function(a, b) { return a + b; }, 0);

  var chartHtml = '<h4 style="margin-bottom:8px">จำนวนปัญหาตามประเภท</h4>'
    + '<div class="chart-wrap" style="height:380px"><canvas id="qaChartComplaint"></canvas></div>';

  var tableHtml = '<h4 style="margin:18px 0 8px">สรุปตาราง</h4><div class="table-wrap"><table>'
    + '<thead><tr><th>ลำดับ</th><th>ประเภทปัญหา</th><th>จำนวน</th><th>สัดส่วน (%)</th></tr></thead><tbody>';
  items.forEach(function(it, idx) {
    var pct = total > 0 ? (it.count / total * 100).toFixed(1) : '0.0';
    tableHtml += '<tr><td>' + (idx + 1) + '</td><td>' + it.type + '</td><td>' + it.count + '</td><td>' + pct + '%</td></tr>';
  });
  tableHtml += '</tbody></table></div>';

  container.innerHTML = chartHtml + tableHtml;

  _qaDestroyChart('complaint');
  var ctx = document.getElementById('qaChartComplaint');
  if (ctx) {
    _qaCharts['complaint'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'จำนวน',
          data: counts,
          backgroundColor: '#f97316'
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true } }
      }
    });
  }
}

// ============================================================
// 3. วิเคราะห์ตามสินค้า (qa-product)
// ============================================================
function renderQaProduct() {
  if (_qaRendered['product']) return;
  _qaRendered['product'] = true;

  var container = document.getElementById('qa-product');
  if (!container) return;

  var items = QUALITY_DATA.products;
  var labels = items.map(function(i) { return i.name; });
  var counts = items.map(function(i) { return i.count; });

  var chartHtml = '<h4 style="margin-bottom:8px">ปัญหาตามกลุ่มสินค้า</h4>'
    + '<div class="chart-wrap h280"><canvas id="qaChartProduct"></canvas></div>';

  var tableHtml = '<h4 style="margin:18px 0 8px">สรุปตาราง</h4><div class="table-wrap"><table>'
    + '<thead><tr><th>สินค้า</th><th>จำนวนปัญหา</th><th>สัดส่วน (%)</th></tr></thead><tbody>';
  items.forEach(function(it) {
    tableHtml += '<tr><td>' + it.name + '</td><td>' + it.count + '</td><td>' + it.pct + '%</td></tr>';
  });
  tableHtml += '</tbody></table></div>';

  container.innerHTML = chartHtml + tableHtml;

  _qaDestroyChart('product');
  var ctx = document.getElementById('qaChartProduct');
  if (ctx) {
    _qaCharts['product'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'จำนวนปัญหา',
          data: counts,
          backgroundColor: ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#e2e8f0']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }
}

// ============================================================
// 4. วิเคราะห์ตาม Lot (qa-lot)
// ============================================================
function renderQaLot() {
  if (_qaRendered['lot']) return;
  _qaRendered['lot'] = true;

  var container = document.getElementById('qa-lot');
  if (!container) return;

  var lots = QUALITY_DATA.lots;
  var html = '<h4 style="margin-bottom:8px">รายละเอียด Lot ที่มีปัญหา</h4><div class="table-wrap"><table>'
    + '<thead><tr><th>เลข Lot</th><th>วันที่ผลิต</th><th>เครื่องจักร</th><th>กะ</th><th>ผู้ควบคุม</th><th>จำนวนผลิต</th><th>จำนวนของเสีย</th><th>อัตรา (%)</th><th>สาเหตุ</th></tr></thead><tbody>';
  lots.forEach(function(l) {
    var rate = (l.defects / l.produced * 100).toFixed(2);
    html += '<tr><td><strong>' + l.lot + '</strong></td><td>' + l.date + '</td><td>' + l.machine + '</td><td>' + l.shift + '</td><td>'
      + l.supervisor + '</td><td>' + _qaFmtNum(l.produced) + '</td><td>' + l.defects + '</td><td>' + rate + '%</td><td>' + l.cause + '</td></tr>';
  });
  html += '</tbody></table></div>';

  container.innerHTML = html;
}

// ============================================================
// 5. วิเคราะห์ตามกระบวนการ (qa-process)
// ============================================================
function renderQaProcess() {
  if (_qaRendered['process']) return;
  _qaRendered['process'] = true;

  var container = document.getElementById('qa-process');
  if (!container) return;

  var items = QUALITY_DATA.process;
  var labels = items.map(function(i) { return i.step; });
  var defects = items.map(function(i) { return i.defects; });

  var html = '<h4 style="margin-bottom:8px">ของเสียตามกระบวนการผลิต</h4>'
    + '<div class="chart-wrap" style="height:340px"><canvas id="qaChartProcess"></canvas></div>';

  container.innerHTML = html;

  _qaDestroyChart('process');
  var ctx = document.getElementById('qaChartProcess');
  if (ctx) {
    _qaCharts['process'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'จำนวนของเสีย',
          data: defects,
          backgroundColor: '#3b82f6'
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true } }
      }
    });
  }
}

// ============================================================
// 6. วิเคราะห์ตามวัตถุดิบ (qa-material)
// ============================================================
function renderQaMaterial() {
  if (_qaRendered['material']) return;
  _qaRendered['material'] = true;

  var container = document.getElementById('qa-material');
  if (!container) return;

  var mats = QUALITY_DATA.materials;
  var html = '<h4 style="margin-bottom:8px">ปัญหาตามวัตถุดิบ / Supplier</h4><div class="table-wrap"><table>'
    + '<thead><tr><th>Supplier</th><th>เลข Lot วัตถุดิบ</th><th>วันที่รับเข้า</th><th>วันหมดอายุ</th><th>จำนวนปัญหา</th></tr></thead><tbody>';
  mats.forEach(function(m) {
    var cls = m.issues >= 4 ? ' style="color:#dc2626;font-weight:700"' : '';
    html += '<tr><td>' + m.supplier + '</td><td>' + m.lot + '</td><td>' + m.received + '</td><td>' + m.expiry + '</td><td' + cls + '>' + m.issues + '</td></tr>';
  });
  html += '</tbody></table></div>';

  container.innerHTML = html;
}

// ============================================================
// 7. วิเคราะห์ตามลูกค้า (qa-customer)
// ============================================================
function renderQaCustomer() {
  if (_qaRendered['customer']) return;
  _qaRendered['customer'] = true;

  var container = document.getElementById('qa-customer');
  if (!container) return;

  var items = QUALITY_DATA.customers;
  var labels = items.map(function(i) { return i.channel; });
  var complaints = items.map(function(i) { return i.complaints; });

  var chartHtml = '<h4 style="margin-bottom:8px">Complaints ตามช่องทางลูกค้า</h4>'
    + '<div class="chart-wrap h280"><canvas id="qaChartCustomer"></canvas></div>';

  var tableHtml = '<h4 style="margin:18px 0 8px">สรุปตาราง</h4><div class="table-wrap"><table>'
    + '<thead><tr><th>ช่องทาง</th><th>จำนวน Complaints</th><th>จำนวนคืนสินค้า</th><th>Return Rate (%)</th></tr></thead><tbody>';
  items.forEach(function(it) {
    tableHtml += '<tr><td>' + it.channel + '</td><td>' + it.complaints + '</td><td>' + it.returns + '</td><td>' + it.returnRate.toFixed(1) + '%</td></tr>';
  });
  tableHtml += '</tbody></table></div>';

  container.innerHTML = chartHtml + tableHtml;

  _qaDestroyChart('customer');
  var ctx = document.getElementById('qaChartCustomer');
  if (ctx) {
    _qaCharts['customer'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Complaints',
          data: complaints,
          backgroundColor: ['#ea580c', '#d97706', '#16a34a', '#3b82f6', '#7c3aed']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }
}

// ============================================================
// 8. วิเคราะห์ตามพื้นที่ (qa-geo)
// ============================================================
function renderQaGeo() {
  if (_qaRendered['geo']) return;
  _qaRendered['geo'] = true;

  var container = document.getElementById('qa-geo');
  if (!container) return;

  var items = QUALITY_DATA.geo;
  var labels = items.map(function(i) { return i.province; });
  var counts = items.map(function(i) { return i.issues; });

  var chartHtml = '<h4 style="margin-bottom:8px">Top 10 จังหวัดที่มีปัญหา</h4>'
    + '<div class="chart-wrap h280"><canvas id="qaChartGeo"></canvas></div>';

  var tableHtml = '<h4 style="margin:18px 0 8px">รายละเอียดตามพื้นที่</h4><div class="table-wrap"><table>'
    + '<thead><tr><th>ลำดับ</th><th>จังหวัด</th><th>จำนวนปัญหา</th><th>สาขาที่แจ้งเคลมบ่อย</th></tr></thead><tbody>';
  items.forEach(function(it, idx) {
    tableHtml += '<tr><td>' + (idx + 1) + '</td><td>' + it.province + '</td><td>' + it.issues + '</td><td>' + it.branches + '</td></tr>';
  });
  tableHtml += '</tbody></table></div>';

  container.innerHTML = chartHtml + tableHtml;

  _qaDestroyChart('geo');
  var ctx = document.getElementById('qaChartGeo');
  if (ctx) {
    _qaCharts['geo'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'จำนวนปัญหา',
          data: counts,
          backgroundColor: '#f97316'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }
}

// ============================================================
// 9. Root Cause Analysis (qa-rca)
// ============================================================
function renderQaRca() {
  if (_qaRendered['rca']) return;
  _qaRendered['rca'] = true;

  var container = document.getElementById('qa-rca');
  if (!container) return;

  var items = QUALITY_DATA.rca;
  var labels = items.map(function(i) { return i.category + ' (' + i.label + ')'; });
  var counts = items.map(function(i) { return i.count; });
  var colors = ['#3b82f6', '#ef4444', '#f59e0b', '#22c55e', '#8b5cf6', '#06b6d4'];

  // KPI cards สำหรับแต่ละ category
  var cardsHtml = '<h4 style="margin-bottom:8px">การวิเคราะห์ก้างปลา (6M)</h4><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">';
  var cardColors = ['blue', 'red', 'yellow', 'green', 'purple', 'cyan'];
  items.forEach(function(it, idx) {
    cardsHtml += '<div class="kpi-card ' + cardColors[idx] + '"><div class="kpi-label">' + it.category + ' — ' + it.label + '</div>'
      + '<div class="kpi-value">' + it.count + '</div><div class="kpi-sub">' + it.details + '</div></div>';
  });
  cardsHtml += '</div>';

  var chartHtml = '<div style="margin-top:18px"><h4 style="margin-bottom:8px">สัดส่วนสาเหตุรากเหง้า</h4>'
    + '<div class="chart-wrap h280"><canvas id="qaChartRca"></canvas></div></div>';

  container.innerHTML = cardsHtml + chartHtml;

  _qaDestroyChart('rca');
  var ctx = document.getElementById('qaChartRca');
  if (ctx) {
    _qaCharts['rca'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: colors
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '50%', plugins: { legend: { position: 'right' } } }
    });
  }
}

// ============================================================
// 10. CAPA Tracking (qa-capa)
// ============================================================
function renderQaCapa() {
  if (_qaRendered['capa']) return;
  _qaRendered['capa'] = true;

  var container = document.getElementById('qa-capa');
  if (!container) return;

  var items = QUALITY_DATA.capa;
  var statusMap = {
    done: { label: 'เสร็จแล้ว', cls: 'qa-status-done' },
    inprogress: { label: 'กำลังดำเนินการ', cls: 'qa-status-inprogress' },
    pending: { label: 'รอดำเนินการ', cls: 'qa-status-pending' }
  };

  // สรุปจำนวนตามสถานะ
  var doneCount = items.filter(function(i) { return i.status === 'done'; }).length;
  var ipCount = items.filter(function(i) { return i.status === 'inprogress'; }).length;
  var pendCount = items.filter(function(i) { return i.status === 'pending'; }).length;

  var summaryHtml = '<div class="grid g3" style="margin-bottom:18px">'
    + '<div class="kpi-card green"><div class="kpi-label">เสร็จแล้ว</div><div class="kpi-value">' + doneCount + '</div></div>'
    + '<div class="kpi-card yellow"><div class="kpi-label">กำลังดำเนินการ</div><div class="kpi-value">' + ipCount + '</div></div>'
    + '<div class="kpi-card red"><div class="kpi-label">รอดำเนินการ</div><div class="kpi-value">' + pendCount + '</div></div>'
    + '</div>';

  var tableHtml = '<h4 style="margin-bottom:8px">CAPA Tracking</h4><div class="table-wrap"><table>'
    + '<thead><tr><th>วันที่แจ้ง</th><th>ผู้รับผิดชอบ</th><th>สาเหตุ</th><th>แนวทางแก้ไข</th><th>กำหนดเสร็จ</th><th>สถานะ</th><th>วันที่ปิดงาน</th></tr></thead><tbody>';
  items.forEach(function(it) {
    var st = statusMap[it.status] || { label: it.status, cls: '' };
    tableHtml += '<tr><td>' + it.date + '</td><td>' + it.owner + '</td><td>' + it.cause + '</td><td>' + it.action + '</td><td>' + it.due + '</td>'
      + '<td><span class="' + st.cls + '">' + st.label + '</span></td><td>' + (it.closed || '-') + '</td></tr>';
  });
  tableHtml += '</tbody></table></div>';

  container.innerHTML = summaryHtml + tableHtml;
}

// ============================================================
// สำรองข้อมูลเต็ม (ใช้อ้างอิงเมื่อ scale proportional data)
// ============================================================
var QUALITY_DATA_FULL = JSON.parse(JSON.stringify(QUALITY_DATA));
var _qaGrandTotal = 1398; // ผลรวม complaints ทั้งหมด

// ============================================================
// Aggregation — สร้าง QUALITY_DATA ใหม่จาก records ที่ filter แล้ว
// ============================================================
function _qaAggregate(records) {
  if (records.length === 0) {
    // ไม่มีข้อมูล — set ทุกอย่างเป็น 0
    QUALITY_DATA.kpi = { totalComplaints: 0, returnedProducts: 0, defectRate: 0, defectiveLots: 0, qualityCost: 0, closedCases: 0, openCases: 0 };
    QUALITY_DATA.trend = { months: [], complaints: [] };
    QUALITY_DATA.complaintTypes = QUALITY_DATA_FULL.complaintTypes.map(function(t) { return { type: t.type, count: 0 }; });
    QUALITY_DATA.customers = QUALITY_DATA_FULL.customers.map(function(c) { return { channel: c.channel, complaints: 0, returns: 0, returnRate: 0 }; });
    // Proportional data = 0
    var ratio = 0;
    QUALITY_DATA.products = QUALITY_DATA_FULL.products.map(function(p) { return { name: p.name, count: 0, pct: 0 }; });
    QUALITY_DATA.process = QUALITY_DATA_FULL.process.map(function(p) { return { step: p.step, defects: 0 }; });
    QUALITY_DATA.rca = QUALITY_DATA_FULL.rca.map(function(r) { return { category: r.category, label: r.label, count: 0, details: r.details }; });
    QUALITY_DATA.geo = QUALITY_DATA_FULL.geo.map(function(g) { return { province: g.province, issues: 0, branches: g.branches }; });
    QUALITY_DATA.materials = QUALITY_DATA_FULL.materials.map(function(m) { return { supplier: m.supplier, lot: m.lot, received: m.received, expiry: m.expiry, issues: 0 }; });
    QUALITY_DATA.lots = [];
    QUALITY_DATA.capa = QUALITY_DATA_FULL.capa;
    return;
  }

  // รวมยอดจาก records
  var totalCount = 0, totalCost = 0;
  var chComplaints = { MDT: 0, Amazon: 0, Online: 0, Booth: 0 };
  var chCost = { MDT: 0, Amazon: 0, Online: 0, Booth: 0 };
  var typeSum = {};
  var trendMonths = [];
  var trendCounts = [];

  records.forEach(function(r) {
    totalCount += r.totalCount;
    totalCost += r.totalCost;
    // channels
    var chKeys = ['MDT', 'Amazon', 'Online', 'Booth'];
    chKeys.forEach(function(k) { chComplaints[k] += (r.channels[k] || 0); chCost[k] += (r.channelCost[k] || 0); });
    // types
    Object.keys(r.types).forEach(function(k) { typeSum[k] = (typeSum[k] || 0) + r.types[k]; });
    // trend label
    var yrShort = String(r.year).slice(-2);
    trendMonths.push(_qaMonthNames[r.month] + yrShort);
    trendCounts.push(r.totalCount);
  });

  // ratio สำหรับ proportional scaling
  var ratio = _qaGrandTotal > 0 ? totalCount / _qaGrandTotal : 0;

  // KPI
  QUALITY_DATA.kpi = {
    totalComplaints: totalCount,
    returnedProducts: Math.round(QUALITY_DATA_FULL.kpi.returnedProducts * ratio),
    defectRate: parseFloat((QUALITY_DATA_FULL.kpi.defectRate * ratio).toFixed(2)),
    defectiveLots: Math.round(QUALITY_DATA_FULL.kpi.defectiveLots * ratio),
    qualityCost: parseFloat(totalCost.toFixed(2)),
    closedCases: Math.round(QUALITY_DATA_FULL.kpi.closedCases * ratio),
    openCases: Math.round(QUALITY_DATA_FULL.kpi.openCases * ratio)
  };

  // Trend
  QUALITY_DATA.trend = { months: trendMonths, complaints: trendCounts };

  // Complaint types (มี per-month data)
  QUALITY_DATA.complaintTypes = QUALITY_DATA_FULL.complaintTypes.map(function(t) {
    return { type: t.type, count: typeSum[t.type] || 0 };
  });

  // Customers (มี per-month channel data)
  var channelMap = { 'Modern Trade': 'MDT', 'Cafe Amazon': 'Amazon', 'Online': 'Online', 'Booth': 'Booth' };
  QUALITY_DATA.customers = QUALITY_DATA_FULL.customers.map(function(c) {
    var key = channelMap[c.channel] || c.channel;
    var comp = chComplaints[key] || 0;
    var ret = Math.round(comp * (c.returnRate / 100));
    return { channel: c.channel, complaints: comp, returns: ret, returnRate: comp > 0 ? c.returnRate : 0 };
  });

  // Proportional scaling สำหรับ products, process, rca, geo, materials
  QUALITY_DATA.products = QUALITY_DATA_FULL.products.map(function(p) {
    var cnt = Math.round(p.count * ratio);
    var pctVal = totalCount > 0 ? Math.round(cnt / totalCount * 100) : 0;
    return { name: p.name, count: cnt, pct: pctVal };
  });
  QUALITY_DATA.process = QUALITY_DATA_FULL.process.map(function(p) {
    return { step: p.step, defects: Math.round(p.defects * ratio) };
  });
  QUALITY_DATA.rca = QUALITY_DATA_FULL.rca.map(function(r) {
    return { category: r.category, label: r.label, count: Math.round(r.count * ratio), details: r.details };
  });
  QUALITY_DATA.geo = QUALITY_DATA_FULL.geo.map(function(g) {
    return { province: g.province, issues: Math.round(g.issues * ratio), branches: g.branches };
  });
  QUALITY_DATA.materials = QUALITY_DATA_FULL.materials.map(function(m) {
    return { supplier: m.supplier, lot: m.lot, received: m.received, expiry: m.expiry, issues: Math.round(m.issues * ratio) };
  });

  // Lots — filter ตาม year/month ที่เลือก
  var selectedPeriods = {};
  records.forEach(function(r) { selectedPeriods[r.year + '-' + r.month] = true; });
  QUALITY_DATA.lots = QUALITY_DATA_FULL.lots.filter(function(l) {
    var d = new Date(l.date);
    var ceYear = d.getFullYear();
    var beYear = ceYear + 543;
    var m = d.getMonth() + 1;
    return selectedPeriods[beYear + '-' + m];
  });

  // CAPA ไม่ filter ตามวันที่ (static)
  QUALITY_DATA.capa = QUALITY_DATA_FULL.capa;
}

// ============================================================
// Merge localStorage complaints → QUALITY_RAW compatible records
// ============================================================
function _qaMergeLocalComplaints(records, year, month) {
  if (typeof qaLoadComplaints !== 'function') return records;
  var local = qaLoadComplaints();
  if (!local || local.length === 0) return records;

  var channelMap = { 'Modern Trade': 'MDT', 'Amazon': 'Amazon', 'Online': 'Online', 'Booth': 'Booth' };
  var causeMap = {
    'ขึ้นรา (Mold)': 'ขนมขึ้นรา/ไม่ได้มาตรฐาน',
    'สิ่งแปลกปลอม': 'สิ่งแปลกปลอม',
    'กลิ่นผิดปกติ': 'ขนมเสีย/เปรี้ยว/ขม',
    'รสชาติผิดปกติ': 'ขนมเสีย/เปรี้ยว/ขม',
    'สีผิดปกติ': 'ขนมเสีย/เปรี้ยว/ขม',
    'เนื้อสัมผัสผิดปกติ': 'ขนมเสีย/เปรี้ยว/ขม',
    'บรรจุภัณฑ์เสียหาย': 'บรรจุภัณฑ์บวม/ซีลไม่ดี',
    'สินค้าหมดอายุก่อนกำหนด': 'ไม่ยิงวันผลิต/หมดอายุ',
    'อื่น ๆ': 'ขนมเสีย/เปรี้ยว/ขม'
  };

  var buckets = {};
  local.forEach(function(c) {
    if (!c.dateReceived) return;
    var parts = c.dateReceived.split('-');
    var ceY = parseInt(parts[0]);
    var m = parseInt(parts[1]);
    var beY = ceY + 543;
    if (year !== 'all' && beY !== parseInt(year)) return;
    if (month !== 'all' && m !== parseInt(month)) return;
    var key = beY + '-' + m;
    if (!buckets[key]) {
      buckets[key] = { year: beY, month: m, channels: { MDT: 0, Amazon: 0, Online: 0, Booth: 0 }, channelCost: { MDT: 0, Amazon: 0, Online: 0, Booth: 0 }, types: { 'ขนมเสีย/เปรี้ยว/ขม': 0, 'ขนมขึ้นรา/ไม่ได้มาตรฐาน': 0, 'ไม่ยิงวันผลิต/หมดอายุ': 0, 'บรรจุภัณฑ์บวม/ซีลไม่ดี': 0, 'สิ่งแปลกปลอม': 0 }, totalCount: 0, totalCost: 0, _fromLocal: true };
    }
    var b = buckets[key];
    var qty = c.qty || 1;
    var chKey = channelMap[c.channelMain] || 'MDT';
    b.channels[chKey] += qty;
    b.channelCost[chKey] += (c.damageValue || 0);
    var causeKey = causeMap[c.cause] || 'ขนมเสีย/เปรี้ยว/ขม';
    b.types[causeKey] += qty;
    b.totalCount += qty;
    b.totalCost += (c.costTotal || c.damageValue || 0);
  });

  var merged = records.slice();
  Object.keys(buckets).forEach(function(key) {
    var lb = buckets[key];
    var found = false;
    for (var i = 0; i < merged.length; i++) {
      if (merged[i].year === lb.year && merged[i].month === lb.month && !merged[i]._fromLocal) {
        var m = merged[i];
        ['MDT', 'Amazon', 'Online', 'Booth'].forEach(function(ch) {
          m.channels[ch] += lb.channels[ch];
          m.channelCost[ch] += lb.channelCost[ch];
        });
        Object.keys(lb.types).forEach(function(t) { m.types[t] += lb.types[t]; });
        m.totalCount += lb.totalCount;
        m.totalCost += lb.totalCost;
        found = true;
        break;
      }
    }
    if (!found) merged.push(lb);
  });

  merged.sort(function(a, b) { return (a.year * 100 + a.month) - (b.year * 100 + b.month); });
  return merged;
}

// ============================================================
// Filter handler — เรียกเมื่อผู้ใช้เปลี่ยน filter
// ============================================================
function qaApplyFilter() {
  var yearEl = document.getElementById('qaFilterYear');
  var monthEl = document.getElementById('qaFilterMonth');
  if (!yearEl || !monthEl) return;

  var year = yearEl.value;
  var month = monthEl.value;

  var filtered = QUALITY_RAW.filter(function(r) {
    if (year !== 'all' && r.year !== parseInt(year)) return false;
    if (month !== 'all' && r.month !== parseInt(month)) return false;
    return true;
  });

  filtered = _qaMergeLocalComplaints(filtered, year, month);

  _qaAggregate(filtered);

  // Reset render flags ทั้งหมด
  _qaRendered = {};

  // ทำลาย chart เดิมทั้งหมด
  Object.keys(_qaCharts).forEach(function(k) { _qaDestroyChart(k); });

  // Render sub-tab ที่ active อยู่ใหม่
  var activeSub = document.querySelector('#tab-quality .sub-section.active');
  if (activeSub) {
    var renderMap = {
      'qa-overview': renderQaOverview,
      'qa-complaint': renderQaComplaint,
      'qa-product': renderQaProduct,
      'qa-lot': renderQaLot,
      'qa-process': renderQaProcess,
      'qa-material': renderQaMaterial,
      'qa-customer': renderQaCustomer,
      'qa-geo': renderQaGeo,
      'qa-rca': renderQaRca,
      'qa-capa': renderQaCapa
    };
    if (renderMap[activeSub.id]) renderMap[activeSub.id]();
  }

  // อัปเดตข้อความสถานะ filter
  _qaUpdateFilterStatus(year, month);
}

function _qaUpdateFilterStatus(year, month) {
  var statusEl = document.getElementById('qaFilterStatus');
  if (!statusEl) return;

  var yearText = year === 'all' ? 'ทุกปี' : ('ปี ' + year);
  var monthText = month === 'all' ? 'ทุกเดือน' : _qaMonthNames[parseInt(month)];
  statusEl.textContent = 'แสดงข้อมูล: ' + yearText + ' ' + monthText;
}

// ============================================================
// renderQualityOverview — เรียกเมื่อ tab quality ถูกเปิด
// ============================================================
function renderQualityOverview() {
  _qaRefreshWithLocal();
  renderQaOverview();
}

// อัพเดท QUALITY_DATA ให้รวม localStorage complaints (เรียกตอนเปิด tab)
function _qaRefreshWithLocal() {
  var merged = _qaMergeLocalComplaints(QUALITY_RAW.slice(), 'all', 'all');
  var newTotal = 0;
  merged.forEach(function(r) { newTotal += r.totalCount; });
  if (newTotal !== _qaGrandTotal) {
    _qaGrandTotal = newTotal;
    _qaAggregate(merged);
    QUALITY_DATA_FULL = JSON.parse(JSON.stringify(QUALITY_DATA));
    _qaRendered = {};
    Object.keys(_qaCharts).forEach(function(k) { _qaDestroyChart(k); });
  }
}
