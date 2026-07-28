// ============================================================
// ORD-MANUAL.JS — คู่มือการทำงาน (ธุรการขาย) — ครบทุก Sheet
// ============================================================
(function(){
'use strict';

// ---------- ค่าคงที่ ----------
var COLORS = {
  S01:'#fecaca', S02:'#cffafe', S03:'#fef08a', S04:'#e5e7eb',
  S05:'#bbf7d0', S06:'#fef3c7', S07:'#ddd6fe',
  holiday:'#ef4444'
};
var NAMES = {S01:'แตงกวา',S02:'บิวตี้',S03:'อ้อ',S04:'ว่าง',S05:'โบว์',S06:'อัพ',S07:'อุ้ม'};
var DAYS  = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];

// ---------- Tab definitions ----------
var TABS = [
  {id:'tab-schedule',  label:'ตารางเส้น'},
  {id:'tab-merge',     label:'การรวมเส้น'},
  {id:'tab-coco',      label:'COCO'},
  {id:'tab-zone',      label:'เขตโซนการขาย'},
  {id:'tab-booth',     label:'บูธหลัก/รายวัน'},
  {id:'tab-mdt',       label:'MDT'},
  {id:'tab-data',      label:'ข้อมูลเส้น'},
  {id:'tab-dayoff',    label:'วันหยุด'}
];

// ====================================================================
// Sheet 2: ตารางเส้น — ORDER / PROD / SHIP + Staff info
// ====================================================================
var ORDER_DATA = [
  [{route:'กำแพงเพชร-ตาก',code:'S03'},{route:'เชียงใหม่',code:'S03'},{route:'ราชบุรี / นครนายก',code:'S07'},{route:'เพชรบุรี',code:'S07'},{route:'เพชรบูรณ์',code:'S03'},{route:'หยุด',code:'S03',off:true},{route:'เชียงราย',code:'S03'}],
  [{route:'หยุด',code:'S02',off:true},{route:'กระทุ่มแบน',code:'S02'},{route:'สระบุรี 1-2',code:'S02'},{route:'สุพรรณบุรี',code:'S02'},{route:'กาญจนบุรี',code:'S02'},{route:'โคราช 1-2',code:'S02'},{route:'ชลบุรี 1-2',code:'S02'}],
  [{route:'ระยอง',code:'S07'},{route:'อุบล - บุรีรัมย์',code:'S05'},{route:'ขอนแก่น + ร.พ.',code:'S05'},{route:'นครสวรรค์ 1',code:'S05'},{route:'อำนาจเจริญ',code:'S05'},{route:'หยุด',code:'S05',off:true},{route:'ขอนแก่น + ร.พ. + มิตรภาพ',code:'S05'}],
  [{route:'C/F1/F2',code:'S01'},{route:'D/E/G -ราชพฤกษ์',code:'S01'},{route:'A/B',code:'S01'},{route:'C/F1/F2',code:'S01'},{route:'D/E/G/B',code:'S01'},{route:'A/B/G',code:'S01'},{route:'หยุด',code:'S01',off:true}],
  [{route:'ใต้ - ภูเก็ต',code:'S03'},{route:'บูธรายวัน/VIP',code:'S06'},{route:'สงขลา - นคร',code:'S03'},{route:'บ่อพลอย (ลุงอู๊ด)',code:'S03'},{route:'บูธรายวัน/VIP/บูธ หลัก',code:'S06'},{route:'บูธรายวัน/VIP',code:'S06'},{route:'หยุด',code:'S06',off:true}],
  [{route:'บูธรายวัน/VIP/บูธ หลัก',code:'S06'},{route:'บูธรายวัน/VIP',code:'S06'},{route:'บูธรายวัน/VIP/บูธ หลัก',code:'S06'},{route:'บูธรายวัน/VIP',code:'S06'},{route:'นครสวรรค์ 2',code:'S05'},{route:'',code:''},{route:'',code:''}]
];

var PROD_DATA = [
  [{route:'เชียงราย',code:'S03'},{route:'กำแพงเพชร-ตาก',code:'S03'},{route:'เชียงใหม่',code:'S03'},{route:'ราชบุรี / นครนายก',code:'S07'},{route:'เพชรบุรี',code:'S07'},{route:'เพชรบูรณ์',code:'S03'},{route:'',code:''}],
  [{route:'โคราช 1-2',code:'S02'},{route:'ชลบุรี 1-2',code:'S02'},{route:'อุบล - บุรีรัมย์',code:'S05'},{route:'สระบุรี 1-2',code:'S02'},{route:'สุพรรณบุรี',code:'S02'},{route:'กาญจนบุรี',code:'S07'},{route:'',code:''}],
  [{route:'ขอนแก่น + ร.พ. + มิตรภาพ',code:'S05'},{route:'ระยอง',code:'S07'},{route:'D/E/G -ราชพฤกษ์',code:'S01'},{route:'ขอนแก่น + ร.พ.',code:'S05'},{route:'นครสวรรค์ 1',code:'S05'},{route:'นครสวรรค์ 2',code:'S05'},{route:'หยุด',code:'',off:true}],
  [{route:'A/B/G',code:'S01'},{route:'C/F1/F2',code:'S01'},{route:'กระทุ่มแบน',code:'S02'},{route:'A/B',code:'S01'},{route:'C/F1/F2',code:'S01'},{route:'D/E/G/B',code:'S01'},{route:'',code:''}],
  [{route:'บูธรายวัน/VIP',code:'S06'},{route:'ใต้ - ภูเก็ต',code:'S03'},{route:'บูธรายวัน/VIP',code:'S06'},{route:'สงขลา - นคร',code:'S03'},{route:'บ่อพลอย (ลุงอู๊ด)',code:'S03'},{route:'บูธรายวัน/VIP/บูธ หลัก',code:'S06'},{route:'',code:''}],
  [{route:'บูธรายวัน/VIP/บูธ หลัก',code:'S06'},{route:'',code:''},{route:'บูธรายวัน/VIP/บูธ หลัก',code:'S06'},{route:'บูธรายวัน/VIP',code:'S06'},{route:'บูธรายวัน/VIP',code:'S06'},{route:'อำนาจเจริญ',code:'S05'},{route:'',code:''}]
];

var SHIP_DATA = [
  [{route:'',code:''},{route:'เชียงราย',code:'S03'},{route:'ตาก',code:'S03'},{route:'เชียงใหม่',code:'S03'},{route:'ราชบุรี',code:'S03'},{route:'เพชรบุรี',code:'S03'},{route:'เพชรบูรณ์',code:'S03'}],
  [{route:'',code:''},{route:'โคราช',code:'S02'},{route:'ชลบุรี 1-2',code:'S02'},{route:'ราชพฤกษ์',code:'S02'},{route:'สระบุรี 1-2',code:'S02'},{route:'สุพรรณบุรี',code:'S02'},{route:'กาญจนบุรี',code:'S02'}],
  [{route:'',code:''},{route:'ขอนแก่น + ร.พ. + มิตรภาพ',code:'S05'},{route:'ระยอง',code:'S05'},{route:'อุบล - บุรีรัมย์',code:'S05'},{route:'ขอนแก่น + ร.พ.',code:'S05'},{route:'นครสวรรค์ 1',code:'S05'},{route:'นครสวรรค์ 2',code:'S05'}],
  [{route:'หยุด',code:'',off:true},{route:'A/B/G',code:'S01'},{route:'C/F1/F2',code:'S01'},{route:'D/E/G',code:'S01'},{route:'A/B',code:'S01'},{route:'C/F1/F2',code:'S01'},{route:'D/E/G/B',code:'S01'}],
  [{route:'',code:''},{route:'',code:''},{route:'ใต้ - ภูเก็ต',code:'S04'},{route:'',code:''},{route:'สงขลา - นคร',code:'S04'},{route:'ลุงอู๊ด',code:''},{route:'',code:''}],
  [{route:'',code:''},{route:'บูธ บ้านแห้ว',code:'S06'},{route:'บูธ หลัก',code:'S06'},{route:'กระทุ่มแบน',code:'S06'},{route:'บูธ หลัก',code:'S06'},{route:'',code:''},{route:'บูธหลัก',code:'S06'}],
  [{route:'',code:''},{route:'',code:''},{route:'',code:''},{route:'',code:''},{route:'นครนายก',code:''},{route:'',code:''},{route:'อำนาจเจริญ',code:'S05'}]
];

var STAFF_INFO = [
  {code:'S01',name:'แตงกวา',area:'COCO/ปริมณฑล (กทม./ปริมณฑล/ราชพฤกษ์)'},
  {code:'S02',name:'บิวตี้',area:'กลาง 2 (สระบุรี1-2/ชลบุรี1-2/โคราช1-2/กระทุ่มแบน/กาญจนบุรี/สุพรรณบุรี)'},
  {code:'S03',name:'อ้อ',area:'เหนือ/ใต้ (เชียงราย/กำแพงเพชร-ตาก/ใต้-ภูเก็ต/เชียงใหม่/สงขลา-นคร/บ่อพลอย/เพชรบูรณ์)'},
  {code:'S04',name:'ว่าง',area:'ว่าง'},
  {code:'S05',name:'โบว์',area:'อีสาน (ขอนแก่น+รพ+มิตรภาพ/อุบล-บุรีรัมย์/นครสวรรค์1-2/อำนาจเจริญ)'},
  {code:'S06',name:'อัพ',area:'กลาง 3/รายวัน (รายวัน/ระยอง/ราชบุรี/นครนายก/เพชรบุรี)'},
  {code:'S07',name:'อุ้ม',area:'ว่าง'}
];

// ====================================================================
// Sheet 1: การรวมเส้น
// ====================================================================
var MERGE_SCHEDULE = [
  {day:'อาทิตย์',morning:'ไม่ต้องทำ',noon:'12.00 น. รอบส่งจันทร์',evening:'16.00 น. รอบส่งวันอังคาร',note:''},
  {day:'จันทร์',morning:'9.30 น. รอบส่งอังคาร',noon:'12.00 น. รอบส่งอังคาร',evening:'16.00 น. รอบส่งวันพุธ',note:''},
  {day:'อังคาร',morning:'9.30 น. รอบส่งวันพุธ',noon:'12.00 น. รอบส่งวันพุธ',evening:'16.00 น. รอบส่งวันพฤหัสบดี',note:''},
  {day:'พุธ',morning:'9.30 น. รอบส่งวันพฤหัสบดี',noon:'12.00 น. รอบส่งวันพฤหัสบดี',evening:'16.00 น. รอบส่งวันศุกร์',note:''},
  {day:'พฤหัสบดี',morning:'9.30 น. รอบส่งวันศุกร์',noon:'12.00 น. รอบส่งวันศุกร์',evening:'14.00 น. รอบส่งเสาร์',note:''},
  {day:'ศุกร์',morning:'วันหยุด',noon:'วันหยุด',evening:'วันหยุด',note:''},
  {day:'เสาร์',morning:'วันหยุด',noon:'วันหยุด',evening:'วันหยุด',note:''}
];

var MERGE_NOTES = [
  'วันอาทิตย์ : เส้นบูธรายวันไม่ต้องเอามารวมยอด อัพทำเอง',
  'ยอดรวมเส้น ตจว. ทุกรอบ ไม่ต้องลงบูธรายวัน / บูธบริษัท แต่ต้องเอามาใส่ในยอดแพ็ค',
  'การส่งไฟล์เข้ากลุ่ม ตจว. ส่งทุกเส้นที่ทำในวันนั้นๆ (เฉพาะที่รวมในยอดใหญ่)',
  'รวมยอดห้องแพ็ค เอาช่องแถบสีออก แล้วแทรกคอลัมน์ในช่อง C แล้วก็อปปี้วาง',
  'ยอดวันพฤหัส บ่าย 14.30 น. ให้ทำเหมือนตอนเที่ยง ที่มีการส่งสมุด ส่งทั้ง 4 ห้องด้วย',
  'การส่งเอกสาร : 5 ห้อง: 1.ห้อง QC, 2.ห้อง FG, 3.ห้องจัดของ, 4.ห้องหัวหน้า FG, 5.ห้องแพ็ค (ให้รวมยอดของบูธรายวัน / บูธบริษัท เข้าไปด้วย)',
  'ยอดรวมใหญ่ เมื่อบวกกับ บูธรายวัน / บูธบริษัท เข้าไปแล้ว จะต้องเท่ากับยอดห้องแพ็ค',
  'ดูเส้นไหนมีราคา ให้เอาในจากคนที่ดูแลเส้นนั้น เอาแยกไปด้วย แล้วสำเนาใบห้องแพ็คด้วย',
  'การเขียนสมุดส่งสีน้ำเงิน ให้เอาจำนวนเส้นทั้งหมด และนับใบห้องแพ็ครวม นับเพิ่มไปด้วย ตัวอย่าง เช่น วันนั้นมีเส้น 5 เส้น และมีใบห้องแพ็ค 1 ต้องเขียน 6 (ไม่ต้องนับ บูธรายวัน - และบูธบริษัทเข้าไป)',
  'บิลแยก : เส้นขอนแก่น จะมีเส้นมิตรภาพ ต้องตามถามผู้ที่ทำ ว่าหักจากยอดใหญ่หรือไม่ หากบิลไหนต้องหักจากยอดใหญ่ ต้องวงเล็บว่าหักยอดใหญ่บนหัวใบรวมด้วย'
];

// ====================================================================
// Sheet 3: COCO Zones + Schedule
// ====================================================================
var COCO_ZONES = [
  {zone:'A',areas:'ดุสิต / พญาไท / ราชเทวี / ปทุมวัน / บางซื้อ / บางรัก / สาทร / บางคอแหลม / ยานนาวา / ป้อมปราบศัตรูพ่าย / สัมพันธวงศ์'},
  {zone:'B',areas:'บางพลัด / บางกอกน้อย / บางกอกใหญ่ / ธนบุรี / ราชบูรณะ / ทุ่งครุ / จองทอง / ภาษีเจริญ / คลองสาน / บางบอน / บางขุนเทียน'},
  {zone:'C',areas:'จตุจักร / ลาดพร้าว / ห้วยขวาง / ดินแดง / วังทองหลาง / บางกะปิ / บึงกุ่ม / คันนายาว'},
  {zone:'D',areas:'ประเวศ / สะพานสูง / ลาดกระบัง / มีนบุรี / คลองสามวา / หนองจอก / สวนหลวง + จ.สมุทรปราการ (อ.เมือง-อ.บางเสาธง-อ.บางบ่อ)'},
  {zone:'E',areas:'คลองเตย / พระโขนง / บางนา / วัฒนา + จ.สมุทรปราการ (อ.เมือง-อ.พระสมุทรเจดีย์-อ.พระประแดง)'},
  {zone:'F1',areas:'ดอนเมือง / สายไหม / บางเขน / หลักสี่ / จ.ปทุมธานี'},
  {zone:'F2',areas:'จ.นนทบุรี'},
  {zone:'G',areas:'ทวีวัฒนา / บางแค / หนองแขม / ตลิ่งชัน / จ.นครปฐม'}
];

var COCO_SCHEDULE = [
  {zones:'A-B-G',orderDay:'เสาร์',orderTime:'08.00-17.00 น.',deliveryDay:'จันทร์'},
  {zones:'C-F',orderDay:'อาทิตย์',orderTime:'08.00-17.00 น.',deliveryDay:'อังคาร'},
  {zones:'D-E-G',orderDay:'จันทร์',orderTime:'08.00-17.00 น.',deliveryDay:'พุธ'},
  {zones:'A-B',orderDay:'อังคาร',orderTime:'08.00-17.00 น.',deliveryDay:'พฤหัสบดี'},
  {zones:'C-F',orderDay:'พุธ',orderTime:'08.00-17.00 น.',deliveryDay:'ศุกร์'},
  {zones:'D-E-G-B',orderDay:'พฤหัสบดี',orderTime:'08.00-17.00 น.',deliveryDay:'เสาร์'}
];

// ====================================================================
// Sheet 4: เขตโซนการขาย
// ====================================================================
var ZONE_ASSIGNMENTS = [
  {route:'COCO A B G',orderDay:'อาทิตย์',region:'กลาง',staffCode:'S01',staffName:'แตงกวา'},
  {route:'COCO A B',orderDay:'พุธ',region:'กลาง',staffCode:'S01',staffName:'แตงกวา'},
  {route:'COCO C F1 F2',orderDay:'จันทร์/พฤหัส',region:'กลาง',staffCode:'S01',staffName:'แตงกวา'},
  {route:'COCO D E G B',orderDay:'ศุกร์',region:'กลาง',staffCode:'S01',staffName:'แตงกวา'},
  {route:'COCO D E G',orderDay:'อังคาร',region:'กลาง',staffCode:'S01',staffName:'แตงกวา'},
  {route:'ราชพฤกษ์',orderDay:'อังคาร',region:'กลาง',staffCode:'S01',staffName:'แตงกวา'},
  {route:'กระทุ่มแบน',orderDay:'อังคาร',region:'กลาง',staffCode:'S02',staffName:'พี่อ้อ'},
  {route:'โคราช',orderDay:'อาทิตย์',region:'ตะวันออกเฉียงเหนือ',staffCode:'S02',staffName:'พี่อ้อ'},
  {route:'โคราช1',orderDay:'อาทิตย์',region:'ตะวันออกเฉียงเหนือ',staffCode:'S02',staffName:'พี่อ้อ'},
  {route:'โคราช2',orderDay:'อาทิตย์',region:'ตะวันออกเฉียงเหนือ',staffCode:'S02',staffName:'พี่อ้อ'},
  {route:'ชลบุรี 1',orderDay:'จันทร์',region:'ตะวันออก',staffCode:'S02',staffName:'พี่อ้อ'},
  {route:'ชลบุรี 2',orderDay:'จันทร์',region:'ตะวันออก',staffCode:'S02',staffName:'พี่อ้อ'},
  {route:'สระบุรี 1',orderDay:'พุธ',region:'กลาง',staffCode:'S02',staffName:'พี่อ้อ'},
  {route:'สระบุรี 2',orderDay:'พุธ',region:'กลาง',staffCode:'S02',staffName:'พี่อ้อ'},
  {route:'สุพรรณบุรี',orderDay:'พฤหัสบดี',region:'กลาง',staffCode:'S02',staffName:'พี่อ้อ'},
  {route:'กำแพงเพชร-ตาก',orderDay:'จันทร์',region:'เหนือตอนล่าง',staffCode:'S03',staffName:'พี่อ้อ'},
  {route:'เชียงราย',orderDay:'อาทิตย์',region:'เหนือ',staffCode:'S03',staffName:'พี่อ้อ'},
  {route:'เชียงใหม่',orderDay:'อังคาร',region:'เหนือ',staffCode:'S03',staffName:'พี่อ้อ'},
  {route:'นครนายก',orderDay:'พุธ',region:'กลาง',staffCode:'S03',staffName:'อุ้ม'},
  {route:'เพชรบูรณ์',orderDay:'ศุกร์',region:'เหนือตอนล่าง',staffCode:'S03',staffName:'พี่อ้อ'},
  {route:'ใต้-ภูเก็ต',orderDay:'จันทร์',region:'ใต้',staffCode:'S04',staffName:'พี่อ้อ'},
  {route:'สงขลา-นครฯ',orderDay:'พุธ',region:'ใต้',staffCode:'S04',staffName:'พี่อ้อ'},
  {route:'บ่อพลอย',orderDay:'พฤหัสบดี',region:'',staffCode:'S04',staffName:'พี่อ้อ'},
  {route:'ขอนแก่น จ-อ-พ-มิตรภาพ',orderDay:'อาทิตย์',region:'เหนือตอนล่าง',staffCode:'S04',staffName:'โบว์'},
  {route:'ขอนแก่น พฤ-ศ-ส',orderDay:'พุธ',region:'เหนือตอนล่าง',staffCode:'S05',staffName:'โบว์'},
  {route:'นครสวรรค์ 1',orderDay:'พฤหัสบดี',region:'เหนือตอนล่าง',staffCode:'S05',staffName:'โบว์'},
  {route:'นครสวรรค์ 2',orderDay:'ศุกร์',region:'เหนือตอนล่าง',staffCode:'S05',staffName:'โบว์'},
  {route:'อำนาจเจริญ',orderDay:'ศุกร์',region:'ตะวันออกเฉียงเหนือตอนล่าง',staffCode:'S05',staffName:'โบว์'},
  {route:'อุบล-บุรีรัมย์',orderDay:'อังคาร',region:'ภาคตะวันออกเฉียงเหนือ',staffCode:'S05',staffName:'โบว์'},
  {route:'บูธหลัก',orderDay:'จันทร์/พุธ/ศุกร์',region:'',staffCode:'S06',staffName:'อัพ'},
  {route:'บูธรายวัน',orderDay:'ทุกวัน',region:'',staffCode:'S06',staffName:'อัพ'},
  {route:'พนักงาน - บิลของชิม',orderDay:'ทุกวัน',region:'',staffCode:'S06',staffName:'อัพ'},
  {route:'กาญจนบุรี',orderDay:'ศุกร์',region:'ตะวันตก',staffCode:'S07',staffName:'อุ้ม'}
];

// ====================================================================
// Sheet 5: บูธหลัก - รายวัน
// ====================================================================
var BOOTH_MAIN_AREAS = [
  'กรุงเทพมหานคร',
  'จ.นครปฐม อ.เมืองนครปฐม อ.สามพราน อ.พุทธมณฑล',
  'จ.สมุทรสาคร, อ.กระทุ่มแบน สมุทรสาคร',
  'จ.นนทบุรี, อ.บางบัวทอง'
];
var BOOTH_DAILY_AREAS = [
  'อ.กำแพงแสน', 'อ.บางเลน', 'อ.นครชัยศรี', 'อ.ดอนตูม'
];
var BUDDY_PAIRS = [
  {pair:1,person1:'อัพ',off1:'เสาร์',person2:'คนใหม่',off2:'ศุกร์'},
  {pair:2,person1:'อ้อ',off1:'เสาร์',person2:'โบว์',off2:'ศุกร์'},
  {pair:3,person1:'แตงกวา',off1:'เสาร์',person2:'ต้นปาล์ม',off2:'เสาร์'},
  {pair:4,person1:'กาฟิวส์',off1:'เสาร์',person2:'คนใหม่',off2:'ศุกร์'},
  {pair:5,person1:'เบล',off1:'เสาร์',person2:'ต้นปาล์ม',off2:'เสาร์'}
];

// ====================================================================
// Sheet 6: MDT
// ====================================================================
// 7-column arrays: อา จ อ พ พฤ ศ ส — true = มี order
var MDT_ORDER = [
  {name:'CJ',days:[false,true,true,true,true,true,true]},
  {name:'Big C',days:[false,true,true,true,true,true,true]},
  {name:"Lotus's",days:[false,false,true,true,true,true,false]},
  {name:'Makro',days:[false,true,false,true,false,false,false]},
  {name:'Aeon',days:[false,true,false,false,false,true,false]},
  {name:'the Mall',days:[false,false,false,true,false,false,true]},
  {name:'TOPS',days:[false,false,false,false,false,true,false]}
];

var MDT_PROD = [
  {name:'CJ',days:[true,true,true,true,true,true,false]},
  {name:'Big C',days:[true,true,true,true,true,true,false]},
  {name:"Lotus's",days:[false,true,true,true,true,false,false]},
  {name:'Makro',days:[true,false,true,false,false,false,false]},
  {name:'Aeon',days:[true,false,false,false,true,false,false]},
  {name:'the Mall',days:[false,false,true,false,false,true,false]},
  {name:'TOPS',days:[false,false,false,false,true,false,false]}
];

var MDT_SHIP = [
  {name:'CJ โพธาราม 21.00',days:[false,true,true,true,true,true,true]},
  {name:'CJ บางประกง 19.30',days:[false,true,true,true,true,true,true]},
  {name:'Big C G2 9.00',days:[false,true,true,true,true,true,true]},
  {name:'Big C G1 16.00',days:[true,true,true,true,true,true,true]},
  {name:"Lotus's",days:[false,false,true,true,true,true,false]},
  {name:'Makro',days:[false,true,false,true,false,false,false]},
  {name:'Aeon',days:[false,true,false,false,false,true,false]}
];

// ====================================================================
// Sheet 7: DATA — Master Route Data
// ====================================================================
var MASTER_DATA = [
  {no:1,routeCode:'S01',routeName:'COCO C F1 F2',staff:'แตงกวา',empCode:'68080282',empName:'นางสาวกาญจนา ศรีเหรา',orderDays:'อาทิตย์, พุธ',prodDays:'จันทร์, พฤหัสบดี',shipDays:'อังคาร, ศุกร์'},
  {no:2,routeCode:'S01',routeName:'COCO D E G B',staff:'แตงกวา',empCode:'68080282',empName:'นางสาวกาญจนา ศรีเหรา',orderDays:'พฤหัสบดี',prodDays:'ศุกร์',shipDays:'เสาร์'},
  {no:3,routeCode:'S01',routeName:'ราชพฤกษ์',staff:'แตงกวา',empCode:'68080282',empName:'นางสาวกาญจนา ศรีเหรา',orderDays:'จันทร์',prodDays:'อังคาร',shipDays:'พุธ'},
  {no:4,routeCode:'S01',routeName:'COCO D E G',staff:'แตงกวา',empCode:'68080282',empName:'นางสาวกาญจนา ศรีเหรา',orderDays:'จันทร์',prodDays:'อังคาร',shipDays:'พุธ'},
  {no:5,routeCode:'S01',routeName:'COCO A B',staff:'แตงกวา',empCode:'68080282',empName:'นางสาวกาญจนา ศรีเหรา',orderDays:'อังคาร',prodDays:'พุธ',shipDays:'พฤหัสบดี'},
  {no:6,routeCode:'S01',routeName:'COCO A B G',staff:'แตงกวา',empCode:'68080282',empName:'นางสาวกาญจนา ศรีเหรา',orderDays:'ศุกร์',prodDays:'เสาร์',shipDays:'อาทิตย์'},
  {no:7,routeCode:'S02',routeName:'สระบุรี 1',staff:'บิวตี้',empCode:'69050031',empName:'นายพีรพัฒน์ เพราะเจริญ',orderDays:'อังคาร',prodDays:'พุธ',shipDays:'พฤหัสบดี'},
  {no:8,routeCode:'S02',routeName:'สระบุรี 2',staff:'บิวตี้',empCode:'69050031',empName:'นายพีรพัฒน์ เพราะเจริญ',orderDays:'อังคาร',prodDays:'พุธ',shipDays:'พฤหัสบดี'},
  {no:9,routeCode:'S02',routeName:'โคราช',staff:'บิวตี้',empCode:'69050031',empName:'นายพีรพัฒน์ เพราะเจริญ',orderDays:'อาทิตย์',prodDays:'จันทร์',shipDays:'อังคาร'},
  {no:10,routeCode:'S02',routeName:'สุพรณบุรี',staff:'บิวตี้',empCode:'69050031',empName:'นายพีรพัฒน์ เพราะเจริญ',orderDays:'พุธ',prodDays:'พฤหัสบดี',shipDays:'ศุกร์'},
  {no:11,routeCode:'S02',routeName:'ชลบุรี 1',staff:'บิวตี้',empCode:'69050031',empName:'นายพีรพัฒน์ เพราะเจริญ',orderDays:'จันทร์',prodDays:'อังคาร',shipDays:'พุธ'},
  {no:12,routeCode:'S02',routeName:'ชลบุรี 2',staff:'บิวตี้',empCode:'69050031',empName:'นายพีรพัฒน์ เพราะเจริญ',orderDays:'จันทร์',prodDays:'อังคาร',shipDays:'พุธ'},
  {no:13,routeCode:'S02',routeName:'กาญจนบุรี',staff:'บิวตี้',empCode:'69050031',empName:'นายพีรพัฒน์ เพราะเจริญ',orderDays:'พฤหัสบดี',prodDays:'ศุกร์',shipDays:'เสาร์'},
  {no:14,routeCode:'S02',routeName:'อำนาญเจริญ',staff:'บิวตี้',empCode:'69050031',empName:'นายพีรพัฒน์ เพราะเจริญ',orderDays:'พฤหัสบดี',prodDays:'ศุกร์',shipDays:'เสาร์'},
  {no:15,routeCode:'S02',routeName:'โคราช 2',staff:'บิวตี้',empCode:'69050031',empName:'นายพีรพัฒน์ เพราะเจริญ',orderDays:'ศุกร์',prodDays:'เสาร์',shipDays:'อาทิตย์'},
  {no:16,routeCode:'S02',routeName:'โคราช 1',staff:'บิวตี้',empCode:'69050031',empName:'นายพีรพัฒน์ เพราะเจริญ',orderDays:'ศุกร์',prodDays:'เสาร์',shipDays:'อาทิตย์'},
  {no:17,routeCode:'S02',routeName:'บ่อพลอย-หลุมรัง (ลุงฮู้ด)',staff:'บิวตี้',empCode:'69050031',empName:'นายพีรพัฒน์ เพราะเจริญ',orderDays:'พุธ',prodDays:'พฤหัสบดี',shipDays:'ศุกร์'},
  {no:18,routeCode:'S02',routeName:'กระทุ่มแบน',staff:'บิวตี้',empCode:'69050031',empName:'นายพีรพัฒน์ เพราะเจริญ',orderDays:'จันทร์',prodDays:'อังคาร',shipDays:'พุธ'},
  {no:19,routeCode:'S03',routeName:'เชียงใหม่',staff:'อ้อ',empCode:'62070003',empName:'นางสาวยุวดี สิงคาน',orderDays:'จันทร์',prodDays:'อังคาร',shipDays:'พุธ'},
  {no:20,routeCode:'S03',routeName:'สงขลา - นครศรีธรรมราช',staff:'อ้อ',empCode:'62070003',empName:'นางสาวยุวดี สิงคาน',orderDays:'อังคาร',prodDays:'พุธ',shipDays:'พฤหัสบดี'},
  {no:21,routeCode:'S03',routeName:'เชียงราย',staff:'อ้อ',empCode:'62070003',empName:'นางสาวยุวดี สิงคาน',orderDays:'อาทิตย์',prodDays:'จันทร์',shipDays:'อังคาร'},
  {no:22,routeCode:'S03',routeName:'กำแพงเพชร - ตาก',staff:'อ้อ',empCode:'62070003',empName:'นางสาวยุวดี สิงคาน',orderDays:'อาทิตย์',prodDays:'จันทร์',shipDays:'อังคาร'},
  {no:23,routeCode:'S03',routeName:'ใต้ - ภูเก็ต',staff:'อ้อ',empCode:'62070003',empName:'นางสาวยุวดี สิงคาน',orderDays:'อาทิตย์',prodDays:'จันทร์',shipDays:'อังคาร'},
  {no:24,routeCode:'S03',routeName:'เพชรบูรณ์',staff:'อ้อ',empCode:'62070003',empName:'นางสาวยุวดี สิงคาน',orderDays:'พฤหัสบดี',prodDays:'ศุกร์',shipDays:'เสาร์'},
  {no:25,routeCode:'S05',routeName:'นครสวรรค์ 1',staff:'โบว์',empCode:'68120509',empName:'นางสาวสุพัตรา แซ่ตั้น',orderDays:'พุธ',prodDays:'พฤหัสบดี',shipDays:'ศุกร์'},
  {no:26,routeCode:'S05',routeName:'ขอนแก่น - มิตรภาพ',staff:'โบว์',empCode:'68120509',empName:'นางสาวสุพัตรา แซ่ตั้น',orderDays:'อังคาร',prodDays:'พุธ',shipDays:'พฤหัสบดี'},
  {no:27,routeCode:'S05',routeName:'นครสวรรค์ 2',staff:'โบว์',empCode:'68120509',empName:'นางสาวสุพัตรา แซ่ตั้น',orderDays:'พฤหัสบดี',prodDays:'ศุกร์',shipDays:'เสาร์'},
  {no:28,routeCode:'S05',routeName:'อุบลราชธานี - บุรีรัมย์',staff:'โบว์',empCode:'68120509',empName:'นางสาวสุพัตรา แซ่ตั้น',orderDays:'จันทร์',prodDays:'อังคาร',shipDays:'พุธ'},
  {no:29,routeCode:'S05',routeName:'ขอนแก่น',staff:'โบว์',empCode:'68120509',empName:'นางสาวสุพัตรา แซ่ตั้น',orderDays:'อังคาร',prodDays:'พุธ',shipDays:'พฤหัสบดี'},
  {no:30,routeCode:'S06',routeName:'ระยอง',staff:'อัพ',empCode:'67120209',empName:'นางสาวจุฑามาศ คุ้มผล',orderDays:'อาทิตย์',prodDays:'จันทร์',shipDays:'อังคาร'},
  {no:31,routeCode:'S06',routeName:'เพชรบุรี',staff:'อัพ',empCode:'67120209',empName:'นางสาวจุฑามาศ คุ้มผล',orderDays:'พุธ',prodDays:'พฤหัสบดี',shipDays:'ศุกร์'},
  {no:32,routeCode:'S06',routeName:'บูธหลัก',staff:'อัพ',empCode:'67120209',empName:'นางสาวจุฑามาศ คุ้มผล',orderDays:'อาทิตย์, อังคาร',prodDays:'จันทร์, พุธ',shipDays:'อังคาร, พฤหัสบดี'},
  {no:33,routeCode:'S06',routeName:'นครนายก',staff:'อัพ',empCode:'67120209',empName:'นางสาวจุฑามาศ คุ้มผล',orderDays:'พุธ',prodDays:'พฤหัสบดี',shipDays:'ศุกร์'},
  {no:34,routeCode:'S06',routeName:'ราชบุรี',staff:'อัพ',empCode:'67120209',empName:'นางสาวจุฑามาศ คุ้มผล',orderDays:'อังคาร',prodDays:'พุธ',shipDays:'พฤหัสบดี'}
];

// ====================================================================
// Sheet 8: วันหยุด
// ====================================================================
var DAYOFF_STAFF = [
  {dept:'ธุรการขาย',nickname:'แตงกวา',empCode:'68080282',empName:'นางสาวกาญจนา ศรีเหรา',dayOff:'เสาร์'},
  {dept:'ธุรการขาย',nickname:'บิวตี้',empCode:'69050031',empName:'นายพีรพัฒน์ เพราะเจริญ',dayOff:'ศุกร์'},
  {dept:'ธุรการขาย',nickname:'อ้อ',empCode:'62070003',empName:'นางสาวยุวดี สิงคาน',dayOff:'ศุกร์'},
  {dept:'ธุรการขาย',nickname:'โบว์',empCode:'68120509',empName:'นางสาวสุพัตรา แซ่ตั้น',dayOff:'ศุกร์'},
  {dept:'ธุรการขาย',nickname:'อัพ',empCode:'67120209',empName:'นางสาวจุฑามาศ คุ้มผล',dayOff:'เสาร์'}
];

var DAYOFF_GRID = [
  {day:'ศุกร์',staff:['อ้อ','โบว์','บิวตี้']},
  {day:'เสาร์',staff:['กาฟิวส์','แตงกวา','อัพ','อัพ']}
];

var DAYOFF_RULES = [
  'วันพฤหัสบดีบิลเบิ้ลห้ามหยุดเด็ดขาด หากป่วยจริงๆ แจ้งได้',
  'คิวหยุดวันศุกร์ห้ามหยุดวันเสาร์เด็ดขาด เพราะต้องทำบิลในวันเสาร์ หากติดธุระด่วนแจ้งล่วงหน้า 3 วัน'
];

// ====================================================================
// HTML Helper Functions
// ====================================================================

/** สร้าง <style> สำหรับ component นี้ (inject ครั้งเดียว) */
function injectStyles(){
  if(document.getElementById('ord-manual-styles')) return;
  var css = [
    '.om-tabs{display:flex;gap:4px;flex-wrap:wrap;padding:6px 0 8px;border-bottom:2px solid var(--border);margin-bottom:16px}',
    '.om-tab{padding:7px 16px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;color:#64748b;background:#f1f5f9;transition:all .2s;user-select:none}',
    '.om-tab:hover{background:#e2e8f0;color:#374151}',
    '.om-tab.active{background:linear-gradient(135deg,#ea580c,#f97316);color:#fff;box-shadow:0 2px 8px rgba(234,88,12,.3)}',
    '.om-pane{display:none}',
    '.om-pane.active{display:block}',
    '.om-tbl{width:100%;border-collapse:collapse;font-size:13px}',
    '.om-tbl th{border:1px solid #9ca3af;padding:8px 6px;text-align:center;font-size:13px;font-weight:700;background:#f1f5f9;color:#1e293b;white-space:nowrap}',
    '.om-tbl td{border:1px solid #d1d5db;padding:6px 8px;text-align:center;font-size:12px;vertical-align:top}',
    '.om-tbl-left td,.om-tbl-left th{text-align:left}',
    '.om-note{background:#fef9f0;border-left:4px solid var(--accent,#ea580c);padding:10px 14px;margin:6px 0;border-radius:0 8px 8px 0;font-size:13px;color:#1c1410}',
    '.om-badge{display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:8px;font-size:12px;font-weight:600;border:1px solid #d1d5db}',
    '.om-section-title{font-size:16px;font-weight:700;color:var(--text,#1c1410);margin:20px 0 10px;padding-bottom:6px;border-bottom:2px solid var(--accent,#ea580c);display:inline-block}',
    '.om-rule{background:#fee2e2;border-left:4px solid #dc2626;padding:10px 14px;margin:6px 0;border-radius:0 8px 8px 0;font-size:13px;color:#991b1b;font-weight:600}',
    '.om-check{color:#16a34a;font-weight:700}',
    '.om-zone-card{background:var(--surface,#fffcf7);border:1px solid var(--border,#efd9b8);border-radius:12px;padding:12px 16px;margin-bottom:8px}',
    '.om-zone-label{display:inline-block;min-width:40px;font-weight:700;color:var(--accent,#ea580c);font-size:15px;margin-right:8px}'
  ].join('\n');
  var style = document.createElement('style');
  style.id = 'ord-manual-styles';
  style.textContent = css;
  document.head.appendChild(style);
}

/** สร้างเซลล์ตาราง schedule (มีสี staff code) */
function cellHtml(c){
  if(!c || (!c.route && !c.code)) return '<td class="om-tbl" style="border:1px solid #d1d5db;padding:6px 8px;text-align:center;font-size:12px"></td>';
  var bg = '#fff', color = '#1f2937';
  if(c.off){ bg = COLORS.holiday; color = '#fff'; }
  else if(c.code && COLORS[c.code]){ bg = COLORS[c.code]; }
  var name = c.code && NAMES[c.code] ? NAMES[c.code] : '';
  var codeStr = c.code ? '('+c.code+') '+name : '';
  return '<td style="border:1px solid #d1d5db;padding:6px 8px;text-align:center;font-size:12px;background:'+bg+';color:'+color+';vertical-align:top;min-width:100px">'
    +'<div style="font-weight:600;margin-bottom:2px">'+c.route+'</div>'
    +(codeStr?'<div style="font-size:11px;'+(c.off?'color:#fff':'color:#6b7280')+'">'+codeStr+'</div>':'')
    +'</td>';
}

/** สร้างตาราง schedule 7 วัน */
function buildScheduleTable(title, data){
  var h = '<div style="margin-bottom:28px">';
  h += '<div class="om-section-title">'+title+'</div>';
  h += '<div style="overflow-x:auto">';
  h += '<table style="width:100%;border-collapse:collapse;table-layout:fixed">';
  h += '<thead><tr>';
  DAYS.forEach(function(d){ h += '<th style="border:1px solid #9ca3af;padding:8px 6px;text-align:center;font-size:13px;font-weight:700;background:#f1f5f9;color:#1e293b">'+d+'</th>'; });
  h += '</tr></thead><tbody>';
  data.forEach(function(row){
    h += '<tr>';
    row.forEach(function(c){ h += cellHtml(c); });
    h += '</tr>';
  });
  h += '</tbody></table></div></div>';
  return h;
}

/** สร้างตาราง HTML ทั่วไปจาก headers + rows */
function buildSimpleTable(headers, rows, opts){
  opts = opts || {};
  var h = '<div style="overflow-x:auto;margin-bottom:16px">';
  h += '<table class="om-tbl'+(opts.leftAlign?' om-tbl-left':'')+'">';
  h += '<thead><tr>';
  headers.forEach(function(hd){ h += '<th>'+hd+'</th>'; });
  h += '</tr></thead><tbody>';
  rows.forEach(function(row){
    h += '<tr>';
    row.forEach(function(cell, ci){
      var style = '';
      // ถ้ามี rowColor callback
      if(opts.cellStyle) style = opts.cellStyle(cell, ci, row);
      h += '<td style="'+style+'">'+cell+'</td>';
    });
    h += '</tr>';
  });
  h += '</tbody></table></div>';
  return h;
}

/** สร้าง MDT checkbox table (วันที่มี order = เครื่องหมายถูก) */
function buildMdtTable(title, data){
  var h = '<div class="om-section-title">'+title+'</div>';
  var headers = ['รายการ'].concat(DAYS);
  var rows = data.map(function(item){
    var r = [item.name];
    item.days.forEach(function(has){ r.push(has ? '<span class="om-check">&#10003;</span>' : '-'); });
    return r;
  });
  return h + buildSimpleTable(headers, rows);
}

// ====================================================================
// Tab Content Builders
// ====================================================================

/** Tab 1: ตารางเส้น */
function renderTabSchedule(){
  var h = '';
  // Legend
  h += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">';
  ['S01','S02','S03','S04','S05','S06','S07'].forEach(function(c){
    h += '<span class="om-badge" style="background:'+COLORS[c]+'">('+c+') '+NAMES[c]+'</span>';
  });
  h += '<span class="om-badge" style="background:#ef4444;color:#fff;border-color:#dc2626">หยุด</span>';
  h += '</div>';

  h += buildScheduleTable('วันรับออเดอร์', ORDER_DATA);
  h += buildScheduleTable('วันลงผลิต (ใช้สรุปเส้น)', PROD_DATA);
  h += buildScheduleTable('วันขนส่ง', SHIP_DATA);

  // Staff info table
  h += '<div class="om-section-title">ข้อมูลพนักงานดูแลเส้น</div>';
  var sHeaders = ['รหัส','ชื่อเล่น','พื้นที่ดูแล'];
  var sRows = STAFF_INFO.map(function(s){
    return ['<span class="om-badge" style="background:'+COLORS[s.code]+'">' + s.code + '</span>', s.name, s.area];
  });
  h += buildSimpleTable(sHeaders, sRows, {leftAlign:true});

  return h;
}

/** Tab 2: การรวมเส้น */
function renderTabMerge(){
  var h = '<div class="om-section-title">การทำสรุปเส้น</div>';

  var headers = ['วัน','เช้า เก็บตกหลังจาก 16.00 น. วันก่อนหน้า','ยอดจริงของวันนั้น ส่งไฟล์ลงกลุ่ม และ ส่งใบตามห้อง 4 ห้อง','ยอดเย็น'];
  var rows = MERGE_SCHEDULE.map(function(r){
    var isOff = (r.morning === 'วันหยุด');
    var style = isOff ? 'background:#fee2e2;color:#991b1b;font-weight:600' : '';
    return [
      '<span style="font-weight:700;'+style+'">'+r.day+'</span>',
      '<span style="'+style+'">'+r.morning+'</span>',
      '<span style="'+style+'">'+r.noon+'</span>',
      '<span style="'+style+'">'+r.evening+'</span>'
    ];
  });
  h += buildSimpleTable(headers, rows, {leftAlign:true});

  // Notes
  h += '<div class="om-section-title">หมายเหตุสำคัญ</div>';
  MERGE_NOTES.forEach(function(n, i){
    h += '<div class="om-note"><strong>'+(i+1)+'.</strong> '+n+'</div>';
  });

  return h;
}

/** Tab 3: COCO */
function renderTabCoco(){
  var h = '<div class="om-section-title">โซนพื้นที่จัดส่ง COCO</div>';

  COCO_ZONES.forEach(function(z){
    h += '<div class="om-zone-card"><span class="om-zone-label">Zone '+z.zone+'</span> '+z.areas+'</div>';
  });

  h += '<div class="om-section-title" style="margin-top:24px">ตารางสั่ง-ส่ง COCO</div>';
  var headers = ['โซน','วันสั่ง','เวลาสั่ง','วันส่ง'];
  var rows = COCO_SCHEDULE.map(function(s){ return [s.zones, s.orderDay, s.orderTime, s.deliveryDay]; });
  h += buildSimpleTable(headers, rows);

  return h;
}

/** Tab 4: เขตโซนการขาย */
function renderTabZone(){
  var h = '<div class="om-section-title">เขตโซนการขาย</div>';

  var headers = ['เส้น','วันคีย์ order','ภาค','รหัสพนักงาน','ชื่อพนักงาน'];
  var rows = ZONE_ASSIGNMENTS.map(function(z){
    var bg = COLORS[z.staffCode] || '#fff';
    return [
      z.route,
      z.orderDay,
      z.region || '-',
      '<span class="om-badge" style="background:'+bg+'">'+z.staffCode+'</span>',
      z.staffName
    ];
  });
  h += buildSimpleTable(headers, rows, {leftAlign:true});

  return h;
}

/** Tab 5: บูธหลัก/รายวัน */
function renderTabBooth(){
  var h = '';

  // บูธหลัก
  h += '<div class="om-section-title">บูธหลัก (สั่ง จันทร์-พุธ-ศุกร์ / ส่ง อังคาร-พฤหัสบดี-เสาร์)</div>';
  h += '<ul style="margin:0 0 16px 20px;font-size:13px">';
  BOOTH_MAIN_AREAS.forEach(function(a){ h += '<li style="margin-bottom:4px">'+a+'</li>'; });
  h += '</ul>';

  // บูธรายวัน
  h += '<div class="om-section-title">บูธรายวัน (สั่งทุกวัน / ส่งวันถัดไป)</div>';
  h += '<ul style="margin:0 0 16px 20px;font-size:13px">';
  BOOTH_DAILY_AREAS.forEach(function(a){ h += '<li style="margin-bottom:4px">'+a+'</li>'; });
  h += '</ul>';

  // คู่บัดดี้
  h += '<div class="om-section-title">คู่บัดดี้ (Buddy Pair)</div>';
  var bHeaders = ['คู่ที่','คนที่ 1','วันหยุด','คนที่ 2','วันหยุด'];
  var bRows = BUDDY_PAIRS.map(function(b){
    return [b.pair, b.person1, b.off1, b.person2, b.off2];
  });
  h += buildSimpleTable(bHeaders, bRows);

  return h;
}

/** Tab 6: MDT */
function renderTabMdt(){
  var h = '';
  h += buildMdtTable('MDT - วันรับ Order', MDT_ORDER);
  h += buildMdtTable('MDT - วันลงผลิต (ล่วงหน้า 1 วัน)', MDT_PROD);
  h += buildMdtTable('MDT - วันขนส่ง', MDT_SHIP);
  return h;
}

/** Tab 7: ข้อมูลเส้น (DATA) */
function renderTabData(){
  var h = '<div class="om-section-title">ข้อมูลเส้นทั้งหมด (Master Route Data)</div>';

  var headers = ['#','รหัสเส้น','ชื่อเส้น','ผู้ดูแล','รหัสพนักงาน','ชื่อ-นามสกุล','วันรับออเดอร์','วันลงผลิต','วันขนส่ง'];
  var rows = MASTER_DATA.map(function(d){
    var bg = COLORS[d.routeCode] || '#fff';
    return [
      d.no,
      '<span class="om-badge" style="background:'+bg+'">'+d.routeCode+'</span>',
      d.routeName,
      d.staff,
      d.empCode,
      d.empName,
      d.orderDays,
      d.prodDays,
      d.shipDays
    ];
  });
  h += buildSimpleTable(headers, rows, {leftAlign:true});

  return h;
}

/** Tab 8: วันหยุด */
function renderTabDayoff(){
  var h = '<div class="om-section-title">ตารางวันหยุดพนักงาน</div>';

  var headers = ['แผนก','ชื่อเล่น','รหัสพนักงาน','ชื่อ-นามสกุล','วันหยุด'];
  var rows = DAYOFF_STAFF.map(function(s){
    return [s.dept, s.nickname, s.empCode, s.empName, '<span style="font-weight:700;color:#dc2626">'+s.dayOff+'</span>'];
  });
  h += buildSimpleTable(headers, rows, {leftAlign:true});

  // Grid วันหยุด
  h += '<div class="om-section-title">คิววันหยุด</div>';
  DAYOFF_GRID.forEach(function(g){
    h += '<div class="om-zone-card"><span class="om-zone-label">'+g.day+'</span> '+g.staff.join(', ')+'</div>';
  });

  // กฎ
  h += '<div class="om-section-title">กฎเกณฑ์วันหยุด</div>';
  DAYOFF_RULES.forEach(function(r){
    h += '<div class="om-rule">'+r+'</div>';
  });

  return h;
}

// ====================================================================
// Main render + Tab switching
// ====================================================================
var tabRenderers = {
  'tab-schedule': renderTabSchedule,
  'tab-merge':    renderTabMerge,
  'tab-coco':     renderTabCoco,
  'tab-zone':     renderTabZone,
  'tab-booth':    renderTabBooth,
  'tab-mdt':      renderTabMdt,
  'tab-data':     renderTabData,
  'tab-dayoff':   renderTabDayoff
};

// เก็บ cache HTML เพื่อไม่ต้อง render ซ้ำ
var paneCache = {};

function switchTab(tabId, container){
  // toggle tab active
  var tabs = container.querySelectorAll('.om-tab');
  for(var i=0;i<tabs.length;i++){
    tabs[i].classList.toggle('active', tabs[i].getAttribute('data-tab') === tabId);
  }
  // toggle pane active
  var panes = container.querySelectorAll('.om-pane');
  for(var j=0;j<panes.length;j++){
    panes[j].classList.toggle('active', panes[j].id === 'om-'+tabId);
  }
  // lazy render
  var pane = container.querySelector('#om-'+tabId);
  if(pane && !paneCache[tabId]){
    var fn = tabRenderers[tabId];
    if(fn){ pane.innerHTML = fn(); paneCache[tabId] = true; }
  }
}

window.renderOrdManual = function(){
  var el = document.getElementById('ord-manual');
  if(!el) return;

  injectStyles();
  paneCache = {};

  var html = '<div class="card" style="margin-bottom:16px">';
  html += '<div class="card-title">คู่มือการทำงาน -- ธุรการขาย</div>';

  // Tabs
  html += '<div class="om-tabs">';
  TABS.forEach(function(t, i){
    html += '<div class="om-tab'+(i===0?' active':'')+'" data-tab="'+t.id+'">'+t.label+'</div>';
  });
  html += '</div>';

  // Panes (empty, lazy-filled)
  TABS.forEach(function(t, i){
    html += '<div id="om-'+t.id+'" class="om-pane'+(i===0?' active':'')+'"></div>';
  });

  html += '</div>';
  el.innerHTML = html;

  // Render first tab
  var firstPane = el.querySelector('#om-'+TABS[0].id);
  if(firstPane){
    firstPane.innerHTML = renderTabSchedule();
    paneCache[TABS[0].id] = true;
  }

  // Attach tab click handlers
  var tabEls = el.querySelectorAll('.om-tab');
  var card = el.querySelector('.card');
  for(var k=0;k<tabEls.length;k++){
    tabEls[k].addEventListener('click', function(){
      switchTab(this.getAttribute('data-tab'), card);
    });
  }
};

})();
