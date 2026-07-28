// ============================================================
// ORDERING-DATA.JS — อัพเดทข้อมูล (ธุรการขาย) tab render functions
// ============================================================
(function(){
'use strict';

var _ordCharts = {};

var ORD_STAFF = [
  {name:'กาญจนา ศรีเหรา',nick:'แตงกวา',zone:'COCO (กรุงเทพฯ)',role:'ธุรการขาย',phone:'-',code:'S01',empId:68080282},
  {name:'พีรพัฒน์ เพราะเจริญ',nick:'บิวตี้',zone:'ต่างจังหวัด (สระบุรี/โคราช/ชลบุรี/กาญจนบุรี)',role:'ธุรการขาย',phone:'-',code:'S02',empId:69050031},
  {name:'ยุวดี สิงคาน',nick:'อ้อ',zone:'ภาคเหนือ/ใต้ (เชียงใหม่/สงขลา/ภูเก็ต)',role:'ธุรการขาย',phone:'-',code:'S03',empId:62070003},
  {name:'สุพัตรา แซ่ตั้น',nick:'โบว์',zone:'ภาคอีสาน (ขอนแก่น/อุบล/นครสวรรค์)',role:'ธุรการขาย',phone:'-',code:'S05',empId:68120509},
  {name:'จุฑามาศ คุ้มผล',nick:'อัพ',zone:'ภาคตะวันออก/บูธ (ระยอง/เพชรบุรี/ราชบุรี)',role:'ธุรการขาย',phone:'-',code:'S06',empId:67120209}
];

var ORD_ROUTES = [
  {route:'COCO C F1 F2',day:'อาทิตย์ , พุธ',region:'กรุงเทพฯ',code:'S01',person:'แตงกวา (S01)'},
  {route:'COCO D E G B',day:'พฤหัสบดี',region:'กรุงเทพฯ',code:'S01',person:'แตงกวา (S01)'},
  {route:'ราชพฤกษ์',day:'จันทร์',region:'กรุงเทพฯ',code:'S01',person:'แตงกวา (S01)'},
  {route:'COCO D E G',day:'จันทร์',region:'กรุงเทพฯ',code:'S01',person:'แตงกวา (S01)'},
  {route:'COCO A B',day:'อังคาร',region:'กรุงเทพฯ',code:'S01',person:'แตงกวา (S01)'},
  {route:'COCO A B G',day:'ศุกร์',region:'กรุงเทพฯ',code:'S01',person:'แตงกวา (S01)'},
  {route:'สระบุรี 1',day:'อังคาร',region:'สระบุรี',code:'S02',person:'บิวตี้ (S02)'},
  {route:'สระบุรี 2',day:'อังคาร',region:'สระบุรี',code:'S02',person:'บิวตี้ (S02)'},
  {route:'โคราช',day:'อาทิตย์',region:'นครราชสีมา',code:'S02',person:'บิวตี้ (S02)'},
  {route:'สุพรรณบุรี',day:'พุธ',region:'สุพรรณบุรี',code:'S02',person:'บิวตี้ (S02)'},
  {route:'ชลบุรี 1',day:'จันทร์',region:'ชลบุรี',code:'S02',person:'บิวตี้ (S02)'},
  {route:'ชลบุรี 2',day:'จันทร์',region:'ชลบุรี',code:'S02',person:'บิวตี้ (S02)'},
  {route:'กาญจนบุรี',day:'พฤหัสบดี',region:'กาญจนบุรี',code:'S02',person:'บิวตี้ (S02)'},
  {route:'อำนาจเจริญ',day:'พฤหัสบดี',region:'อำนาจเจริญ',code:'S02',person:'บิวตี้ (S02)'},
  {route:'โคราช 2',day:'ศุกร์',region:'นครราชสีมา',code:'S02',person:'บิวตี้ (S02)'},
  {route:'โคราช 1',day:'ศุกร์',region:'นครราชสีมา',code:'S02',person:'บิวตี้ (S02)'},
  {route:'บ่อพลอย-หลุมรัง (ลุงฮู้ด)',day:'พุธ',region:'กาญจนบุรี',code:'S02',person:'บิวตี้ (S02)'},
  {route:'กระทุ่มแบน',day:'จันทร์',region:'สมุทรสาคร',code:'S02',person:'บิวตี้ (S02)'},
  {route:'เชียงใหม่',day:'จันทร์',region:'เชียงใหม่',code:'S03',person:'อ้อ (S03)'},
  {route:'สงขลา - นครศรีธรรมราช',day:'อังคาร',region:'สงขลา',code:'S03',person:'อ้อ (S03)'},
  {route:'เชียงราย',day:'อาทิตย์',region:'เชียงราย',code:'S03',person:'อ้อ (S03)'},
  {route:'กำแพงเพชร - ตาก',day:'อาทิตย์',region:'กำแพงเพชร',code:'S03',person:'อ้อ (S03)'},
  {route:'ใต้ - ภูเก็ต',day:'อาทิตย์',region:'ภูเก็ต',code:'S03',person:'อ้อ (S03)'},
  {route:'เพชรบูรณ์',day:'พฤหัสบดี',region:'เพชรบูรณ์',code:'S03',person:'อ้อ (S03)'},
  {route:'นครสวรรค์ 1',day:'พุธ',region:'นครสวรรค์',code:'S05',person:'โบว์ (S05)'},
  {route:'ขอนแก่น - มิตรภาพ',day:'อังคาร',region:'ขอนแก่น',code:'S05',person:'โบว์ (S05)'},
  {route:'นครสวรรค์ 2',day:'พฤหัสบดี',region:'นครสวรรค์',code:'S05',person:'โบว์ (S05)'},
  {route:'อุบลราชธานี - บุรีรัมย์',day:'จันทร์',region:'อุบลราชธานี',code:'S05',person:'โบว์ (S05)'},
  {route:'ขอนแก่น',day:'อังคาร',region:'ขอนแก่น',code:'S05',person:'โบว์ (S05)'},
  {route:'ระยอง',day:'อาทิตย์',region:'ระยอง',code:'S06',person:'อัพ (S06)'},
  {route:'เพชรบุรี',day:'พุธ',region:'เพชรบุรี',code:'S06',person:'อัพ (S06)'},
  {route:'บูธหลัก',day:'อาทิตย์ , อังคาร',region:'กรุงเทพฯ',code:'S06',person:'อัพ (S06)'},
  {route:'นครนายก',day:'พุธ',region:'นครนายก',code:'S06',person:'อัพ (S06)'},
  {route:'ราชบุรี',day:'อังคาร',region:'ราชบุรี',code:'S06',person:'อัพ (S06)'}
];

var ORD_CUTOFF = [
  {label:'รอบเช้า',time:'ก่อน 10:00 น.',note:'ส่งผลิตวันเดียวกัน'},
  {label:'รอบบ่าย',time:'ก่อน 15:00 น.',note:'ส่งผลิตวันถัดไป'},
  {label:'หลังเวลา',time:'หลัง 15:00 น.',note:'ค้างรอบเช้าวันถัดไป'}
];

var ORD_BILLS = {
  staff: ORD_STAFF.map(function(s){return s.nick;}),
  months: {
    'มี.ค.': [142,128,115,108,96],
    'เม.ย.': [155,139,122,119,105],
    'พ.ค.':  [163,145,130,126,112],
    'มิ.ย.': [148,131,118,110,99]
  },
  pieces: {
    'มี.ค.': [4260,3840,3450,3240,2880],
    'เม.ย.': [4650,4170,3660,3570,3150],
    'พ.ค.':  [4890,4350,3900,3780,3360],
    'มิ.ย.': [4440,3930,3540,3300,2970]
  },
  daily5: [
    {day:'01',bills:[7,6,5,4,3]},{day:'02',bills:[8,7,6,5,4]},{day:'03',bills:[6,5,4,5,3]},
    {day:'04',bills:[7,6,5,4,4]},{day:'05',bills:[5,5,4,3,3]},{day:'06',bills:[0,0,0,0,0]},
    {day:'07',bills:[0,0,0,0,0]},{day:'08',bills:[8,7,6,5,4]},{day:'09',bills:[7,6,5,4,3]},
    {day:'10',bills:[6,5,5,4,4]},{day:'11',bills:[7,7,6,5,3]},{day:'12',bills:[8,6,5,5,4]},
    {day:'13',bills:[0,0,0,0,0]},{day:'14',bills:[0,0,0,0,0]},{day:'15',bills:[7,6,6,5,4]},
    {day:'16',bills:[8,7,5,4,3]},{day:'17',bills:[6,6,5,5,4]},{day:'18',bills:[7,5,5,4,3]},
    {day:'19',bills:[8,7,6,5,5]},{day:'20',bills:[0,0,0,0,0]},{day:'21',bills:[0,0,0,0,0]},
    {day:'22',bills:[7,6,5,4,4]},{day:'23',bills:[6,5,5,5,3]},{day:'24',bills:[7,7,6,4,4]},
    {day:'25',bills:[8,6,5,5,3]},{day:'26',bills:[7,7,6,5,4]},{day:'27',bills:[0,0,0,0,0]},
    {day:'28',bills:[0,0,0,0,0]},{day:'29',bills:[6,5,4,4,3]},{day:'30',bills:[7,6,5,5,4]}
  ],
  daily6: [
    {day:'01',bills:[6,5,4,4,3]},{day:'02',bills:[7,6,5,4,3]},{day:'03',bills:[0,0,0,0,0]},
    {day:'04',bills:[0,0,0,0,0]},{day:'05',bills:[7,6,5,5,4]},{day:'06',bills:[8,7,6,5,3]},
    {day:'07',bills:[6,5,5,4,4]},{day:'08',bills:[7,6,5,5,3]},{day:'09',bills:[7,6,6,4,4]},
    {day:'10',bills:[0,0,0,0,0]},{day:'11',bills:[0,0,0,0,0]},{day:'12',bills:[8,7,5,5,4]},
    {day:'13',bills:[7,6,5,4,3]},{day:'14',bills:[6,5,5,4,4]},{day:'15',bills:[7,6,5,5,3]},
    {day:'16',bills:[7,7,6,5,4]},{day:'17',bills:[0,0,0,0,0]},{day:'18',bills:[0,0,0,0,0]},
    {day:'19',bills:[8,7,5,4,4]},{day:'20',bills:[7,6,6,5,3]},{day:'21',bills:[6,5,4,4,3]},
    {day:'22',bills:[7,6,5,5,4]},{day:'23',bills:[8,7,6,5,4]},{day:'24',bills:[0,0,0,0,0]},
    {day:'25',bills:[0,0,0,0,0]},{day:'26',bills:[7,6,5,4,3]},{day:'27',bills:[6,5,5,5,4]},
    {day:'28',bills:[7,6,5,4,3]},{day:'29',bills:[7,7,6,5,4]},{day:'30',bills:[6,5,4,4,3]}
  ]
};

var _ordBillMonth = 5;

window.ORD_CHECKLIST_ROUTES = [
  {no:1,code:'S01',route:'COCO C F1 F2',person:'แตงกวา',empId:68080282,fullName:'นางสาวกาญจนา ศรีเหรา',orderDay:'อาทิตย์ , พุธ',prodDay:'จันทร์ , พฤหัสบดี',shipDay:'อังคาร , ศุกร์',url:'https://docs.google.com/spreadsheets/d/13A_WJ_KkBiAK_YTdEi1VzTU8JJD2bj6F2nU0ygTtmM8/edit?usp=sharing'},
  {no:2,code:'S01',route:'COCO D E G B',person:'แตงกวา',empId:68080282,fullName:'นางสาวกาญจนา ศรีเหรา',orderDay:'พฤหัสบดี',prodDay:'ศุกร์',shipDay:'เสาร์',url:'https://docs.google.com/spreadsheets/d/1eKNHyIk0cHumHKiZ3u2Kf2zG_6itIYYvHQNwFB9yd_I/edit?usp=sharing'},
  {no:3,code:'S01',route:'ราชพฤกษ์',person:'แตงกวา',empId:68080282,fullName:'นางสาวกาญจนา ศรีเหรา',orderDay:'จันทร์',prodDay:'อังคาร',shipDay:'พุธ',url:'https://docs.google.com/spreadsheets/d/18pY6Rs1sdPdZnmnAfGB1yJ4K5Ur02B8xiQNp9scYyjE/edit?usp=sharing'},
  {no:4,code:'S01',route:'COCO D E G',person:'แตงกวา',empId:68080282,fullName:'นางสาวกาญจนา ศรีเหรา',orderDay:'จันทร์',prodDay:'อังคาร',shipDay:'พุธ',url:'https://docs.google.com/spreadsheets/d/1evFlzcFEnLEwoU8RWr3MR-mxRJ04xpYks_1Z5Yz7Gqk/edit?usp=sharing'},
  {no:5,code:'S01',route:'COCO A B',person:'แตงกวา',empId:68080282,fullName:'นางสาวกาญจนา ศรีเหรา',orderDay:'อังคาร',prodDay:'พุธ',shipDay:'พฤหัสบดี',url:'https://docs.google.com/spreadsheets/d/1W80YW_SM6PFL8niP7NtyI7yH3Z5KHneb0hQqaMyWwfQ/edit?usp=sharing'},
  {no:6,code:'S01',route:'COCO A B G',person:'แตงกวา',empId:68080282,fullName:'นางสาวกาญจนา ศรีเหรา',orderDay:'ศุกร์',prodDay:'เสาร์',shipDay:'อาทิตย์',url:'https://docs.google.com/spreadsheets/d/1kjwcdUR_f_pJL2zbe8Sd_G7wHw0tl2Aj1cOnsoBurdM/edit?usp=sharing'},
  {no:7,code:'S02',route:'สระบุรี 1',person:'บิวตี้',empId:69050031,fullName:'นายพีรพัฒน์ เพราะเจริญ',orderDay:'อังคาร',prodDay:'พุธ',shipDay:'พฤหัสบดี',url:'https://docs.google.com/spreadsheets/d/1EOk5urK635P9uRQ5Mg0VN7e4j_hTgbwxPkxJcI4cfds/edit?usp=sharing'},
  {no:8,code:'S02',route:'สระบุรี 2',person:'บิวตี้',empId:69050031,fullName:'นายพีรพัฒน์ เพราะเจริญ',orderDay:'อังคาร',prodDay:'พุธ',shipDay:'พฤหัสบดี',url:'https://docs.google.com/spreadsheets/d/1J9paYZS6GvB7f6o7Wdgy72GTkGoqIa64a6hr8aBrcvA/edit?usp=sharing'},
  {no:9,code:'S02',route:'โคราช',person:'บิวตี้',empId:69050031,fullName:'นายพีรพัฒน์ เพราะเจริญ',orderDay:'อาทิตย์',prodDay:'จันทร์',shipDay:'อังคาร',url:'https://docs.google.com/spreadsheets/d/1h2epdwFY8EPEDG7s_HckuRHCzzdt4SqPTjPW1kN3HLU/edit?usp=sharing'},
  {no:10,code:'S02',route:'สุพรณบุรี',person:'บิวตี้',empId:69050031,fullName:'นายพีรพัฒน์ เพราะเจริญ',orderDay:'พุธ',prodDay:'พฤหัสบดี',shipDay:'ศุกร์',url:'https://docs.google.com/spreadsheets/d/1CKTb3p44ldASzlgAhuKuzQVpBdojPAj_C9UfrQ_qh8Q/edit?usp=sharing'},
  {no:11,code:'S02',route:'ชลบุรี 1',person:'บิวตี้',empId:69050031,fullName:'นายพีรพัฒน์ เพราะเจริญ',orderDay:'จันทร์',prodDay:'อังคาร',shipDay:'พุธ',url:'https://docs.google.com/spreadsheets/d/1sYGGxLTb13u0nmzcSD31kR097xDh_OMTauJSv0Rf2fY/edit?usp=sharing'},
  {no:12,code:'S02',route:'ชลบุรี 2',person:'บิวตี้',empId:69050031,fullName:'นายพีรพัฒน์ เพราะเจริญ',orderDay:'จันทร์',prodDay:'อังคาร',shipDay:'พุธ',url:'https://docs.google.com/spreadsheets/d/114If98BIT2d-xk5F5If9lruA5_AnVeRQuOAnzeRDyk8/edit?usp=sharing'},
  {no:13,code:'S02',route:'กาญจนบุรี',person:'บิวตี้',empId:69050031,fullName:'นายพีรพัฒน์ เพราะเจริญ',orderDay:'พฤหัสบดี',prodDay:'ศุกร์',shipDay:'เสาร์',url:'https://docs.google.com/spreadsheets/d/1c2OBaYq0Ck4eU2PIHvsdMf0_VvALB2xp6uUsWEFVAkY/edit?usp=sharing'},
  {no:14,code:'S02',route:'อำนาจเจริญ',person:'บิวตี้',empId:69050031,fullName:'นายพีรพัฒน์ เพราะเจริญ',orderDay:'พฤหัสบดี',prodDay:'ศุกร์',shipDay:'เสาร์',url:'https://docs.google.com/spreadsheets/d/1KhGiPW5n_m27B4OMM0tcURmvDv5AgcO6X46yIqmyou8/edit?usp=sharing'},
  {no:15,code:'S02',route:'โคราช 2',person:'บิวตี้',empId:69050031,fullName:'นายพีรพัฒน์ เพราะเจริญ',orderDay:'ศุกร์',prodDay:'เสาร์',shipDay:'อาทิตย์',url:'https://docs.google.com/spreadsheets/d/13dmOZIl3zlAFgLSMkFxbneGtLac8VXHUto-vpUOr8v4/edit?usp=sharing'},
  {no:16,code:'S02',route:'โคราช 1',person:'บิวตี้',empId:69050031,fullName:'นายพีรพัฒน์ เพราะเจริญ',orderDay:'ศุกร์',prodDay:'เสาร์',shipDay:'อาทิตย์',url:'https://docs.google.com/spreadsheets/d/1sKaUDs8Lj4AuhsWacXvKpxqLOsQXUyY2I7UFCucv9VY/edit?usp=sharing'},
  {no:17,code:'S02',route:'บ่อพลอย-หลุมรัง (ลุงฮู้ด)',person:'บิวตี้',empId:69050031,fullName:'นายพีรพัฒน์ เพราะเจริญ',orderDay:'พุธ',prodDay:'พฤหัสบดี',shipDay:'ศุกร์',url:'https://docs.google.com/spreadsheets/d/1HsQpg3U7RXybSrFArxuDaQpCIo4dmyMC8Pq05eFdOtg/edit?usp=sharing'},
  {no:18,code:'S02',route:'กระทุ่มแบน',person:'บิวตี้',empId:69050031,fullName:'นายพีรพัฒน์ เพราะเจริญ',orderDay:'จันทร์',prodDay:'อังคาร',shipDay:'พุธ',url:'https://docs.google.com/spreadsheets/d/1qiS3ZJT8qixeisxRltuw6bnbrRqCsnKN3qOSUOj74Aw/edit?usp=sharing'},
  {no:19,code:'S03',route:'เชียงใหม่',person:'อ้อ',empId:62070003,fullName:'นางสาวยุวดี สิงคาน',orderDay:'จันทร์',prodDay:'อังคาร',shipDay:'พุธ',url:'https://docs.google.com/spreadsheets/d/1Z8Um1LWwOZUrjiFnT1aFGYhyK5CV9SmSf81HkrmDutc/edit?usp=sharing'},
  {no:20,code:'S03',route:'สงขลา - นครศรีธรรมราช',person:'อ้อ',empId:62070003,fullName:'นางสาวยุวดี สิงคาน',orderDay:'อังคาร',prodDay:'พุธ',shipDay:'พฤหัสบดี',url:'https://docs.google.com/spreadsheets/d/1gGqFdn02xSAW2VoW78s7W1HH95VD5lPRRWVZhjPrJ3A/edit?usp=sharing'},
  {no:21,code:'S03',route:'เชียงราย',person:'อ้อ',empId:62070003,fullName:'นางสาวยุวดี สิงคาน',orderDay:'อาทิตย์',prodDay:'จันทร์',shipDay:'อังคาร',url:'https://docs.google.com/spreadsheets/d/1tZgp-7v50ptcWjNeeXH-uvSDFdA1fgMuhDrTqgT-O-I/edit?usp=sharing'},
  {no:22,code:'S03',route:'กำแพงเพชร - ตาก',person:'อ้อ',empId:62070003,fullName:'นางสาวยุวดี สิงคาน',orderDay:'อาทิตย์',prodDay:'จันทร์',shipDay:'อังคาร',url:'https://docs.google.com/spreadsheets/d/1KksKaUykaFapCYEBNU3HRsuO2HFGLTS8lcSGyfkI-vQ/edit?usp=sharing'},
  {no:23,code:'S03',route:'ใต้ - ภูเก็ต',person:'อ้อ',empId:62070003,fullName:'นางสาวยุวดี สิงคาน',orderDay:'อาทิตย์',prodDay:'จันทร์',shipDay:'อังคาร',url:'https://docs.google.com/spreadsheets/d/1UwHcYfuydbZAGsJ9F1Yxtn4IkQDPSiU8l1KVKgnqjFM/edit?usp=sharing'},
  {no:24,code:'S03',route:'เพชรบูรณ์',person:'อ้อ',empId:62070003,fullName:'นางสาวยุวดี สิงคาน',orderDay:'พฤหัสบดี',prodDay:'ศุกร์',shipDay:'เสาร์',url:'https://docs.google.com/spreadsheets/d/1LdIHJIHVqPqNPCe3sIOUXpK2ASh6PmgFbpG4eto2DzQ/edit?usp=sharing'},
  {no:25,code:'S05',route:'นครสวรรค์ 1',person:'โบว์',empId:68120509,fullName:'นางสาวสุพัตรา แซ่ตั้น',orderDay:'พุธ',prodDay:'พฤหัสบดี',shipDay:'ศุกร์',url:'https://docs.google.com/spreadsheets/d/16fphaF38XiQkXTcEcNha9anFpQ59dXpW9pse9lFkGG0/edit?usp=sharing'},
  {no:26,code:'S05',route:'ขอนแก่น - มิตรภาพ',person:'โบว์',empId:68120509,fullName:'นางสาวสุพัตรา แซ่ตั้น',orderDay:'อังคาร',prodDay:'พุธ',shipDay:'พฤหัสบดี',url:'https://docs.google.com/spreadsheets/d/1HZHpsymmOn0yLrXLu7b4-CFulSI_Lse273AfgPJEzwU/edit?usp=sharing'},
  {no:27,code:'S05',route:'นครสวรรค์ 2',person:'โบว์',empId:68120509,fullName:'นางสาวสุพัตรา แซ่ตั้น',orderDay:'พฤหัสบดี',prodDay:'ศุกร์',shipDay:'เสาร์',url:'https://docs.google.com/spreadsheets/d/1PwMczWFtFWiunyx9gVGY0URAKN8zBk0jCP7FlQHDIoM/edit?usp=sharing'},
  {no:28,code:'S05',route:'อุบลราชธานี - บุรีรัมย์',person:'โบว์',empId:68120509,fullName:'นางสาวสุพัตรา แซ่ตั้น',orderDay:'จันทร์',prodDay:'อังคาร',shipDay:'พุธ',url:'https://docs.google.com/spreadsheets/d/1tyoJ3wc1ORLvIyDQRUXcQGZCJzStgVpAA9gw867hSlk/edit?usp=sharing'},
  {no:29,code:'S05',route:'ขอนแก่น',person:'โบว์',empId:68120509,fullName:'นางสาวสุพัตรา แซ่ตั้น',orderDay:'อังคาร',prodDay:'พุธ',shipDay:'พฤหัสบดี',url:'https://docs.google.com/spreadsheets/d/1f7UngeB9i75j5H9I-kvMoUPijS_wMK-1nSl9mxUT2no/edit?usp=sharing'},
  {no:30,code:'S06',route:'ระยอง',person:'อัพ',empId:67120209,fullName:'นางสาวจุฑามาศ คุ้มผล',orderDay:'อาทิตย์',prodDay:'จันทร์',shipDay:'อังคาร',url:'https://docs.google.com/spreadsheets/d/1Ph7MJ19e6snpCMmnTiBVP5fA-qnL-0IHlBC-d9RbwCU/edit?usp=sharing'},
  {no:31,code:'S06',route:'เพชรบุรี',person:'อัพ',empId:67120209,fullName:'นางสาวจุฑามาศ คุ้มผล',orderDay:'พุธ',prodDay:'พฤหัสบดี',shipDay:'ศุกร์',url:'https://docs.google.com/spreadsheets/d/1rIPVNgktrib1p6luVE70W-XJrKSj5AqQt1p4AEhz0ug/edit?usp=sharing'},
  {no:32,code:'S06',route:'บูธหลัก',person:'อัพ',empId:67120209,fullName:'นางสาวจุฑามาศ คุ้มผล',orderDay:'อาทิตย์ , อังคาร',prodDay:'จันทร์ , พุธ',shipDay:'อังคาร , พฤหัสบดี',url:'https://docs.google.com/spreadsheets/d/17ToMLCWDM7maaztFi-HdEdv7E7wZHlpSQKM2GPX-RUw/edit?usp=sharing'},
  {no:33,code:'S06',route:'นครนายก',person:'อัพ',empId:67120209,fullName:'นางสาวจุฑามาศ คุ้มผล',orderDay:'พุธ',prodDay:'พฤหัสบดี',shipDay:'ศุกร์',url:'https://docs.google.com/spreadsheets/d/1pnX2UILtb-_IUcwFsVZHjXpiirsu5YGFkRDkeFL9S9w/edit?usp=sharing'},
  {no:34,code:'S06',route:'ราชบุรี',person:'อัพ',empId:67120209,fullName:'นางสาวจุฑามาศ คุ้มผล',orderDay:'อังคาร',prodDay:'พุธ',shipDay:'พฤหัสบดี',url:'https://docs.google.com/spreadsheets/d/1_VPNkVJ3G3NUhksGKwsFFxV9cxjH9hJWJc-XWy_RjCw/edit?usp=sharing'}
];

var ORD_ERRORS = [];
var ORD_RETURNS = [];
var ORD_CLAIMS = [];

function _getCallData(){
  return (window.CALL_LOG_DATA && window.CALL_LOG_DATA.length>0) ? window.CALL_LOG_DATA : [];
}
function _extractNick(caller){
  var m = caller.match(/\(([^)]+)\)/);
  return m ? m[1] : caller;
}
function _isOrdered(result){
  return result==='ปิดการขายได้';
}
function _needFollowUp(result){
  return result==='รอการตัดสินใจ'||result==='ขอให้โทรกลับ'||result==='ฝากข้อความ'||result==='ลูกค้าสนใจ';
}

var ORD_CALL_REF = [];

function fmt(n){ return n.toLocaleString('th-TH'); }

function destroyChart(key){
  if(_ordCharts[key]){ _ordCharts[key].destroy(); _ordCharts[key]=null; }
}

function kpiCard(label,value,sub,color){
  return '<div class="kpi-card"><div class="kpi-label">'+label+'</div>'
    +'<div class="kpi-value" style="color:'+(color||'var(--primary)')+'">'+value+'</div>'
    +(sub?'<div class="kpi-sub">'+sub+'</div>':'')+'</div>';
}

// ============================================================
// 1) renderOrdStaff — พนักงาน & เขต
// ============================================================
window.renderOrdStaff = function(){
  var kpi = document.getElementById('ordStaffKPI');
  if(kpi){
    kpi.innerHTML = kpiCard('👥 พนักงานทั้งหมด',ORD_STAFF.length+' คน','ธุรการขาย/ศูนย์รับออเดอร์')
      + kpiCard('🗺️ เส้นทางทั้งหมด',ORD_ROUTES.length+' เส้นทาง','ครอบคลุม 5 จังหวัด')
      + kpiCard('⏰ รอบรับออเดอร์','3 รอบ/วัน','เช้า / บ่าย / หลังเวลา');
  }

  var cards = document.getElementById('ordStaffCards');
  if(cards){
    cards.innerHTML = ORD_STAFF.map(function(s){
      return '<div class="ord-staff-card">'
        +'<div class="ord-staff-avatar">👤</div>'
        +'<div class="ord-staff-name">'+s.name+' ('+s.nick+')</div>'
        +'<div class="ord-staff-role">'+s.role+'</div>'
        +'<div class="ord-staff-zone">📍 '+s.zone+'</div>'
        +'<div class="ord-staff-phone">📞 '+s.phone+'</div>'
        +'</div>';
    }).join('');
  }

  renderOrdRoutes();

  var cutoff = document.getElementById('ordCutoff');
  if(cutoff){
    cutoff.innerHTML = ORD_CUTOFF.map(function(c){
      return '<div class="kpi-card"><div class="kpi-label">'+c.label+'</div>'
        +'<div class="kpi-value" style="font-size:18px">'+c.time+'</div>'
        +'<div class="kpi-sub">'+c.note+'</div></div>';
    }).join('');
  }
};

window.renderOrdRoutes = function(){
  var search = (document.getElementById('ordRouteSearch')||{}).value||'';
  search = search.toLowerCase();
  var tbody = document.getElementById('ordRoutesTBody');
  if(!tbody) return;
  var rows = ORD_ROUTES.filter(function(r){
    if(!search) return true;
    return (r.route+r.day+r.region+r.code+r.person).toLowerCase().indexOf(search)>=0;
  });
  tbody.innerHTML = rows.map(function(r){
    return '<tr><td>'+r.route+'</td><td>'+r.day+'</td><td>'+r.region+'</td><td>'+r.code+'</td><td>'+r.person+'</td></tr>';
  }).join('');
};

// ============================================================
// 2) renderOrdBills — จำนวนบิล
// ============================================================
window.ordSelectBillMonth = function(m, el){
  _ordBillMonth = m;
  var tabs = document.querySelectorAll('#ordBillMonthTabs .fmtab');
  tabs.forEach(function(t){ t.classList.toggle('active', Number(t.dataset.m)===m); });
  renderOrdBillDaily();
};

window.renderOrdBills = function(){
  var kpi = document.getElementById('ordBillsKPI');
  var mKeys = Object.keys(ORD_BILLS.months);
  var lastM = mKeys[mKeys.length-1];
  var totalBills = ORD_BILLS.months[lastM].reduce(function(a,b){return a+b;},0);
  var totalPcs = ORD_BILLS.pieces[lastM].reduce(function(a,b){return a+b;},0);
  if(kpi){
    kpi.innerHTML = kpiCard('🧾 บิลเดือนล่าสุด ('+lastM+')',fmt(totalBills)+' บิล','รวมทุกคน')
      + kpiCard('📦 ชิ้นเดือนล่าสุด',fmt(totalPcs)+' ชิ้น',lastM)
      + kpiCard('👥 เฉลี่ย/คน',fmt(Math.round(totalBills/ORD_STAFF.length))+' บิล/คน','');
  }

  var sel = document.getElementById('ordBillPerson');
  if(sel && sel.options.length <= 1){
    ORD_STAFF.forEach(function(s){
      var o = document.createElement('option');
      o.value = s.nick; o.textContent = s.name+' ('+s.nick+')';
      sel.appendChild(o);
    });
  }

  renderOrdBillDaily();
  renderOrdBillMonthly();
  renderOrdBillSummary();
};

window.renderOrdBillDaily = function(){
  var canvas = document.getElementById('ordBillDailyChart');
  if(!canvas) return;
  destroyChart('billDaily');
  var data = _ordBillMonth===5 ? ORD_BILLS.daily5 : ORD_BILLS.daily6;
  var selVal = (document.getElementById('ordBillPerson')||{}).value||'all';
  var labels = data.map(function(d){return d.day;});
  var values;
  if(selVal==='all'){
    values = data.map(function(d){return d.bills.reduce(function(a,b){return a+b;},0);});
  } else {
    var idx = ORD_STAFF.map(function(s){return s.nick;}).indexOf(selVal);
    values = data.map(function(d){return idx>=0 ? d.bills[idx] : 0;});
  }
  _ordCharts.billDaily = new Chart(canvas,{
    type:'bar',
    data:{labels:labels,datasets:[{label:'จำนวนบิล',data:values,backgroundColor:'rgba(59,130,246,.6)',borderRadius:4}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
      scales:{y:{beginAtZero:true,title:{display:true,text:'บิล'}},x:{title:{display:true,text:'วันที่'}}}}
  });
};

function renderOrdBillMonthly(){
  var canvas = document.getElementById('ordBillMonthlyChart');
  if(!canvas) return;
  destroyChart('billMonthly');
  var colors = ['#3b82f6','#f59e0b','#10b981','#ef4444','#8b5cf6'];
  var datasets = ORD_STAFF.map(function(s,i){
    var vals = Object.keys(ORD_BILLS.months).map(function(m){return ORD_BILLS.months[m][i];});
    return {label:s.nick,data:vals,backgroundColor:colors[i%colors.length]};
  });
  _ordCharts.billMonthly = new Chart(canvas,{
    type:'bar',
    data:{labels:Object.keys(ORD_BILLS.months),datasets:datasets},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top'}},
      scales:{y:{beginAtZero:true,title:{display:true,text:'บิล'}}}}
  });
}

function renderOrdBillSummary(){
  var tbody = document.getElementById('ordBillSummaryTBody');
  if(!tbody) return;
  var html = '';
  ORD_STAFF.forEach(function(s,i){
    Object.keys(ORD_BILLS.months).forEach(function(m){
      html += '<tr><td>'+s.name+'</td><td>'+s.nick+'</td><td>'+s.zone+'</td><td>'+m+'</td>'
        +'<td style="text-align:right">'+fmt(ORD_BILLS.months[m][i])+'</td>'
        +'<td style="text-align:right">'+fmt(ORD_BILLS.pieces[m][i])+'</td></tr>';
    });
  });
  tbody.innerHTML = html;
}

// ============================================================
// 3) renderOrdChecklist — เช็คลิสร้านค้า (เส้นทาง + ลิงก์ Google Sheets)
// ============================================================
var _chkStaffColors = {
  'แตงกวา':'#3b82f6','บิวตี้':'#f59e0b','อ้อ':'#10b981',
  'โบว์':'#8b5cf6','อัพ':'#ef4444'
};

window.renderOrdChecklist = function(){
  var sel = document.getElementById('ordChkPerson');
  if(sel && sel.options.length === 0){
    var all = document.createElement('option');
    all.value='all'; all.textContent='ทุกคน'; sel.appendChild(all);
    var seen = {};
    ORD_CHECKLIST_ROUTES.forEach(function(r){
      if(!seen[r.person]){ seen[r.person]=1;
        var o=document.createElement('option');
        o.value=r.person; o.textContent=r.person+' ('+r.code+')';
        sel.appendChild(o);
      }
    });
  }
  renderOrdChecklistData();
};

window.renderOrdChecklistData = function(){
  var selVal = (document.getElementById('ordChkPerson')||{}).value||'all';
  var search = (document.getElementById('ordChkSearch')||{}).value||'';
  search = search.trim().toLowerCase();
  var filtered = ORD_CHECKLIST_ROUTES;
  if(selVal!=='all') filtered = filtered.filter(function(r){return r.person===selVal;});
  if(search) filtered = filtered.filter(function(r){
    return (r.route+' '+r.person+' '+r.code+' '+r.fullName).toLowerCase().indexOf(search)!==-1;
  });

  var staffMap = {};
  filtered.forEach(function(r){
    if(!staffMap[r.person]) staffMap[r.person]={person:r.person,code:r.code,empId:r.empId,fullName:r.fullName,routes:[]};
    staffMap[r.person].routes.push(r);
  });
  var groups = Object.keys(staffMap).map(function(k){return staffMap[k];});
  var totalStaff = groups.length;
  var totalRoutes = filtered.length;

  var kpi = document.getElementById('ordChkKPI');
  if(kpi){
    kpi.innerHTML = kpiCard('👥 พนักงาน',totalStaff+' คน','')
      + kpiCard('🗺️ เส้นทางทั้งหมด',totalRoutes+' เส้น','')
      + kpiCard('📋 เช็คลิส (Google Sheets)',totalRoutes+' ลิงก์','','#16a34a');
  }

  var wrap = document.getElementById('ordChkCards');
  if(!wrap) return;

  var html = '';
  groups.forEach(function(g){
    var color = _chkStaffColors[g.person]||'#6b7280';
    html += '<div class="card" style="border-left:4px solid '+color+';margin-bottom:16px">'
      +'<div class="card-title" style="display:flex;align-items:center;gap:8px">'
      +'<span style="background:'+color+';color:#fff;padding:2px 10px;border-radius:12px;font-size:0.85rem">'+g.code+'</span>'
      +'<span>'+g.person+'</span>'
      +'<span style="color:#64748b;font-size:0.85rem"> — '+g.fullName+' ('+g.empId+')</span>'
      +'<span style="margin-left:auto;background:#e2e8f0;padding:2px 10px;border-radius:12px;font-size:0.8rem">'+g.routes.length+' เส้นทาง</span>'
      +'</div>'
      +'<div class="table-wrap"><table><thead><tr>'
      +'<th style="width:40px">#</th><th>เส้นทาง</th><th>วันรับออเดอร์</th><th>วันลงผลิต</th><th>วันขนส่ง</th><th style="width:120px;text-align:center">เช็คลิส</th>'
      +'</tr></thead><tbody>';
    g.routes.forEach(function(r){
      html += '<tr>'
        +'<td style="text-align:center;color:#94a3b8">'+r.no+'</td>'
        +'<td style="font-weight:600">'+r.route+'</td>'
        +'<td>'+r.orderDay+'</td>'
        +'<td>'+r.prodDay+'</td>'
        +'<td>'+r.shipDay+'</td>'
        +'<td style="text-align:center">'
        +(r.url ? '<a href="'+r.url+'" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:4px;background:#16a34a;color:#fff;padding:4px 12px;border-radius:6px;text-decoration:none;font-size:0.82rem">📋 เปิดเช็คลิส</a>' : '-')
        +'</td></tr>';
    });
    html += '</tbody></table></div></div>';
  });

  wrap.innerHTML = html;
};

// ============================================================
// 4) renderOrdErrors — ความผิดพลาด & เคลม
// ============================================================
window.renderOrdErrors = function(){
  var section = document.getElementById('ord-errors');
  if(!section) return;
  renderOrdProxy();
  renderOrdErrorTable();
  renderOrdReturns();
  renderOrdClaims();
};

function renderOrdProxy(){
  var tbody = document.getElementById('ordProxyTBody');
  if(!tbody) return;
  var lastM = Object.keys(ORD_BILLS.months);
  var m6 = lastM[lastM.length-1];
  tbody.innerHTML = ORD_STAFF.map(function(s,i){
    return '<tr><td>'+s.name+' ('+s.nick+')</td><td>'+s.zone+'</td>'
      +'<td style="text-align:right">'+fmt(ORD_BILLS.months[m6][i])+'</td>'
      +'<td style="text-align:right">'+fmt(ORD_BILLS.pieces[m6][i])+'</td>'
      +'<td style="text-align:right">'+fmt(Math.round(ORD_BILLS.pieces[m6][i]/30))+'</td></tr>';
  }).join('');

  destroyChart('proxy');
  var canvas = document.getElementById('ordProxyChart');
  if(!canvas) return;
  var colors = ['#3b82f6','#f59e0b','#10b981','#ef4444','#8b5cf6'];
  _ordCharts.proxy = new Chart(canvas,{
    type:'bar',
    data:{labels:ORD_STAFF.map(function(s){return s.nick;}),
      datasets:[{label:'บิล ('+m6+')',data:ORD_BILLS.months[m6],backgroundColor:colors}]},
    options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',
      plugins:{legend:{display:false}},scales:{x:{beginAtZero:true}}}
  });
}

function renderOrdErrorTable(){
  var tbody = document.getElementById('ordErrorTBody');
  if(!tbody) return;
  tbody.innerHTML = ORD_ERRORS.map(function(e){
    var total = e.noSend+e.wrongKey+e.missed+e.dup+e.wrongBranch;
    return '<tr><td>'+e.person+'</td><td>'+e.zone+'</td><td>'+e.month+'</td>'
      +'<td style="text-align:right">'+e.noSend+'</td><td style="text-align:right">'+e.wrongKey+'</td>'
      +'<td style="text-align:right">'+e.missed+'</td><td style="text-align:right">'+e.dup+'</td>'
      +'<td style="text-align:right">'+e.wrongBranch+'</td>'
      +'<td style="text-align:right;font-weight:600'+(total>0?';color:#ef4444':'')+'">'+total+'</td></tr>';
  }).join('');

  destroyChart('error');
  var canvas = document.getElementById('ordErrorChart');
  if(!canvas) return;
  var persons = [];
  ORD_ERRORS.forEach(function(e){ if(persons.indexOf(e.person)<0) persons.push(e.person); });
  var totals = persons.map(function(p){
    return ORD_ERRORS.filter(function(e){return e.person===p;}).reduce(function(s,e){
      return s+e.noSend+e.wrongKey+e.missed+e.dup+e.wrongBranch;
    },0);
  });
  _ordCharts.error = new Chart(canvas,{
    type:'bar',
    data:{labels:persons,datasets:[{label:'ข้อผิดพลาดรวม',data:totals,backgroundColor:'#ef4444'}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
      scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}
  });
}

window.renderOrdReturns = function(){
  var sel = document.getElementById('ordReturnPeriod');
  if(sel && sel.options.length===0){
    ['ทั้งหมด','เม.ย. 69','พ.ค. 69','มิ.ย. 69'].forEach(function(p){
      var o=document.createElement('option'); o.value=p; o.textContent=p; sel.appendChild(o);
    });
  }
  var period = sel ? sel.value : 'ทั้งหมด';
  var filtered = ORD_RETURNS;
  if(period!=='ทั้งหมด'){
    var monthMap = {'เม.ย. 69':'04','พ.ค. 69':'05','มิ.ย. 69':'06'};
    var mm = monthMap[period]||'';
    filtered = ORD_RETURNS.filter(function(r){return r.date.indexOf('-'+mm+'-')>=0;});
  }
  var tbody = document.getElementById('ordReturnTBody');
  if(!tbody) return;
  tbody.innerHTML = filtered.map(function(r){
    return '<tr><td>'+r.no+'</td><td>'+r.date+'</td><td>'+r.product+'</td>'
      +'<td style="text-align:right">'+r.qty+'</td><td>'+r.cause+'</td><td>'+r.route+'</td>'
      +'<td>'+r.person+'</td><td>'+r.keyer+'</td><td>'+r.action+'</td></tr>';
  }).join('');
};

function renderOrdClaims(){
  var tbody = document.getElementById('ordClaimTBody');
  if(tbody){
    tbody.innerHTML = ORD_CLAIMS.map(function(c){
      return '<tr><td>'+c.month+'</td><td style="text-align:right">'+c.count+'</td></tr>';
    }).join('');
  }
  destroyChart('claim');
  var canvas = document.getElementById('ordClaimChart');
  if(!canvas) return;
  _ordCharts.claim = new Chart(canvas,{
    type:'bar',
    data:{labels:ORD_CLAIMS.map(function(c){return c.month;}),
      datasets:[{label:'จำนวนบิลเคลม',data:ORD_CLAIMS.map(function(c){return c.count;}),
        backgroundColor:'#f59e0b',borderRadius:4}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
      scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}
  });
}

// ============================================================
// 5) renderOrdCalls — การโทรลูกค้า
// ============================================================
window.renderOrdCalls = function(){
  var cData = _getCallData();
  var nicks = {};
  ORD_STAFF.forEach(function(s){ nicks[s.nick]=1; });
  cData.forEach(function(c){ var n=_extractNick(c.caller||''); if(n) nicks[n]=1; });
  var nickList = Object.keys(nicks).sort();
  var staffSel = document.getElementById('callLogStaff');
  if(staffSel && staffSel.options.length<=1){
    nickList.forEach(function(n){
      var o=document.createElement('option'); o.value=n; o.textContent=n;
      staffSel.appendChild(o);
    });
  }
  var dashStaff = document.getElementById('callDashStaff');
  if(dashStaff && dashStaff.options.length<=1){
    nickList.forEach(function(n){
      var o=document.createElement('option'); o.value=n; o.textContent=n;
      dashStaff.appendChild(o);
    });
  }
  renderCallLogTable();
  renderCallDashboard();
  renderCallRef();
};

window.renderCallLogTable = function(){
  var staffVal = (document.getElementById('callLogStaff')||{}).value||'all';
  var dateVal = (document.getElementById('callLogDate')||{}).value||'';
  var data = _getCallData();
  var filtered = data.filter(function(c){
    var nick = _extractNick(c.caller||'');
    if(staffVal!=='all' && nick!==staffVal) return false;
    if(dateVal && c.date!==dateVal) return false;
    return true;
  });
  var note = document.getElementById('callLogNote');
  if(note) note.textContent = 'แสดง '+filtered.length+' รายการ';
  var tbody = document.getElementById('callLogTBody');
  if(!tbody) return;
  tbody.innerHTML = filtered.map(function(c){
    var nick = _extractNick(c.caller||'');
    var ordered = _isOrdered(c.result);
    var followUp = _needFollowUp(c.result);
    var rColor = {'ปิดการขายได้':'#16a34a','ลูกค้าสนใจ':'#2563eb','นัดหมายสำเร็จ':'#16a34a','ติดต่อได้':'#475569',
      'รอการตัดสินใจ':'#ea580c','ไม่รับสาย':'#94a3b8','ลูกค้าไม่สนใจ':'#dc2626','ปฏิเสธ':'#dc2626'}[c.result]||'#64748b';
    return '<tr><td>'+c.date+'</td><td>'+nick+'</td><td>'+(c.customerId||'')+'</td><td>'+(c.storeName||c.customerName||'')+'</td><td>'+(c.province||'')+'</td>'
      +'<td style="color:'+rColor+'">'+c.result+'</td><td>'+(ordered?'✅':'—')+'</td><td>'+(followUp?'🔄':'—')+'</td>'
      +'<td>'+(c.note||'')+'</td><td style="text-align:center"><button class="ord-mini-btn" onclick="openCallModal('+c.id+')">✏️</button></td></tr>';
  }).join('');
};

window.callLogClearFilter = function(){
  var s = document.getElementById('callLogStaff');
  var d = document.getElementById('callLogDate');
  if(s) s.value='all';
  if(d) d.value='';
  renderCallLogTable();
};

window.renderCallDashboard = function(){
  var data = _getCallData();
  var latestDate = data.length>0 ? data.reduce(function(mx,c){return c.date>mx?c.date:mx;},data[0].date) : '';
  var dateEl = document.getElementById('callDashDate');
  if(dateEl && !dateEl.value && latestDate) dateEl.value = latestDate;
  var dateVal = (dateEl||{}).value||latestDate||'';
  var staffVal = (document.getElementById('callDashStaff')||{}).value||'all';

  var staffList = staffVal==='all' ? ORD_STAFF.map(function(s){return s.nick;}) : [staffVal];
  var rows = staffList.map(function(nick){
    var calls = data.filter(function(c){return _extractNick(c.caller||'')===nick && c.date===dateVal;});
    var closed = calls.filter(function(c){return _isOrdered(c.result);}).length;
    return {staff:nick, target:20, called:calls.length, closed:closed,
      conv: calls.length>0 ? Math.round(closed/calls.length*100) : 0,
      goal: Math.round(calls.length/20*100)};
  });

  var kpi = document.getElementById('callDashKPI');
  if(kpi){
    var totalCalled = rows.reduce(function(s,r){return s+r.called;},0);
    var totalClosed = rows.reduce(function(s,r){return s+r.closed;},0);
    kpi.innerHTML = kpiCard('📞 โทรทั้งหมด',totalCalled+' สาย','วันที่ '+dateVal)
      + kpiCard('✅ ปิดการขาย',totalClosed+' ราย','','#10b981')
      + kpiCard('📊 Conversion',totalCalled>0?Math.round(totalClosed/totalCalled*100)+'%':'0%','');
  }

  var tbody = document.getElementById('callDashTBody');
  if(tbody){
    tbody.innerHTML = rows.map(function(r){
      return '<tr><td>'+r.staff+'</td><td style="text-align:right">'+r.target+'</td>'
        +'<td style="text-align:right">'+r.called+'</td><td style="text-align:right">'+r.closed+'</td>'
        +'<td style="text-align:right">'+r.conv+'%</td>'
        +'<td style="text-align:right;color:'+(r.goal>=100?'#10b981':'#ef4444')+'">'+r.goal+'%</td></tr>';
    }).join('');
  }

  destroyChart('callDash');
  var canvas = document.getElementById('callDashChart');
  if(!canvas) return;
  _ordCharts.callDash = new Chart(canvas,{
    type:'bar',
    data:{labels:rows.map(function(r){return r.staff;}),
      datasets:[
        {label:'โทรแล้ว',data:rows.map(function(r){return r.called;}),backgroundColor:'#3b82f6'},
        {label:'ปิดการขาย',data:rows.map(function(r){return r.closed;}),backgroundColor:'#10b981'}
      ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'top'}},scales:{y:{beginAtZero:true}}}
  });
};

function renderCallRef(){
  var tbody = document.getElementById('callRefTBody');
  if(!tbody) return;
  var data = _getCallData();
  var grouped = {};
  data.forEach(function(c){
    var prov = c.province||'ไม่ระบุ';
    var key = prov+'|'+c.date;
    if(!grouped[key]) grouped[key] = {route:prov, date:c.date, total:0, ordered:0, notOrdered:0, followUp:0};
    grouped[key].total++;
    if(_isOrdered(c.result)) grouped[key].ordered++;
    else if(_needFollowUp(c.result)) grouped[key].followUp++;
    else grouped[key].notOrdered++;
  });
  var rows = Object.keys(grouped).map(function(k){return grouped[k];});
  rows.sort(function(a,b){return a.date>b.date?-1:a.date<b.date?1:0;});
  tbody.innerHTML = rows.map(function(r){
    return '<tr><td>'+r.route+'</td><td>'+r.date+'</td><td style="text-align:right">'+r.total+'</td>'
      +'<td style="text-align:right">'+r.ordered+'</td><td style="text-align:right">'+r.notOrdered+'</td>'
      +'<td style="text-align:right">'+r.followUp+'</td></tr>';
  }).join('');
}

// ============================================================
// 6) renderOrdPerf — Performance รายคน
// ============================================================
var _ordPerfMode = 'ytd';

window.renderOrdPerf = function(){
  var sel = document.getElementById('ordPerfPerson');
  if(sel && sel.options.length===0){
    ORD_STAFF.forEach(function(s){
      var o=document.createElement('option'); o.value=s.nick; o.textContent=s.name+' ('+s.nick+')';
      sel.appendChild(o);
    });
  }
  ordPerfRender();
};

window.ordPerfSetMode = function(mode, el){
  _ordPerfMode = mode;
  var tabs = document.querySelectorAll('#ordPerfModeTabs .fmtab');
  tabs.forEach(function(t){ t.classList.toggle('active', t.dataset.mode===mode); });
  var mw = document.getElementById('ordPerfMonthWrap');
  var rw = document.getElementById('ordPerfRangeWrap');
  if(mw) mw.style.display = mode==='month'?'':'none';
  if(rw) rw.style.display = mode==='range'?'':'none';
  ordPerfRender();
};

window.ordPerfSetPeriod = function(){ ordPerfRender(); };
window.ordPerfSetRange = function(){ ordPerfRender(); };
window.ordPerfSetSort = function(){ ordPerfRender(); };
window.ordPerfDetailChange = function(){ ordPerfRenderDetail(); };

function ordPerfRender(){
  var months = ['มี.ค.','เม.ย.','พ.ค.','มิ.ย.'];
  var mKeys = Object.keys(ORD_BILLS.months);

  var label = document.getElementById('ordPerfLabel');
  if(label) label.textContent = 'ช่วงเวลา: '+(_ordPerfMode==='ytd'?'ทั้งหมด (YTD มี.ค.–มิ.ย. 2569)':
    _ordPerfMode==='3m'?'3 เดือนล่าสุด':_ordPerfMode==='month'?'รายเดือน':'กำหนดเอง');

  var perfData = ORD_STAFF.map(function(s,i){
    var totalBills=0, totalPcs=0;
    mKeys.forEach(function(m){ totalBills+=ORD_BILLS.months[m][i]; totalPcs+=ORD_BILLS.pieces[m][i]; });
    var cData = _getCallData();
    var calls = cData.filter(function(c){return _extractNick(c.caller||'')===s.nick;}).length;
    var closed = cData.filter(function(c){return _extractNick(c.caller||'')===s.nick && _isOrdered(c.result);}).length;
    var errors = ORD_ERRORS.filter(function(e){return e.person===s.nick;}).reduce(function(sum,e){
      return sum+e.noSend+e.wrongKey+e.missed+e.dup+e.wrongBranch;
    },0);
    return {name:s.name,nick:s.nick,zone:s.zone,bills:totalBills,pcs:totalPcs,
      calls:calls,closed:closed,conv:calls>0?Math.round(closed/calls*100):0,errors:errors};
  });

  var sortKey = (document.getElementById('ordPerfSort')||{}).value||'bills';
  perfData.sort(function(a,b){
    if(sortKey==='errors') return a[sortKey]-b[sortKey];
    return b[sortKey]-a[sortKey];
  });

  var teamKPI = document.getElementById('ordPerfTeamKPI');
  if(teamKPI){
    var tb = perfData.reduce(function(s,d){return s+d.bills;},0);
    var tp = perfData.reduce(function(s,d){return s+d.pcs;},0);
    var tc = perfData.reduce(function(s,d){return s+d.calls;},0);
    var tcl = perfData.reduce(function(s,d){return s+d.closed;},0);
    teamKPI.innerHTML = kpiCard('🧾 บิลรวม',fmt(tb),'')
      + kpiCard('📦 ชิ้นรวม',fmt(tp),'')
      + kpiCard('📞 โทรรวม',tc+' สาย','')
      + kpiCard('✅ ปิดการขาย',tcl+' ราย','','#10b981');
  }

  var tbody = document.getElementById('ordPerfRankTBody');
  if(tbody){
    tbody.innerHTML = perfData.map(function(d,i){
      var medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':''+(i+1);
      return '<tr style="cursor:pointer" onclick="document.getElementById(\'ordPerfPerson\').value=\''+d.nick+'\';ordPerfDetailChange()">'
        +'<td>'+medal+'</td><td>'+d.name+' ('+d.nick+')</td><td>'+d.zone+'</td>'
        +'<td style="text-align:right">'+fmt(d.bills)+'</td><td style="text-align:right">'+fmt(d.pcs)+'</td>'
        +'<td style="text-align:right">'+d.calls+'</td><td style="text-align:right">'+d.closed+'</td>'
        +'<td style="text-align:right">'+d.conv+'%</td>'
        +'<td style="text-align:right;color:'+(d.errors>0?'#ef4444':'#10b981')+'">'+d.errors+'</td></tr>';
    }).join('');
  }

  destroyChart('perfBill');
  var billCanvas = document.getElementById('ordPerfRankBillChart');
  if(billCanvas){
    var colors = ['#3b82f6','#f59e0b','#10b981','#ef4444','#8b5cf6'];
    _ordCharts.perfBill = new Chart(billCanvas,{
      type:'bar',
      data:{labels:perfData.map(function(d){return d.nick;}),
        datasets:[{label:'จำนวนบิล',data:perfData.map(function(d){return d.bills;}),backgroundColor:colors}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
        scales:{y:{beginAtZero:true}}}
    });
  }

  destroyChart('perfConv');
  var convCanvas = document.getElementById('ordPerfRankConvChart');
  if(convCanvas){
    _ordCharts.perfConv = new Chart(convCanvas,{
      type:'bar',
      data:{labels:perfData.map(function(d){return d.nick;}),
        datasets:[{label:'Conversion %',data:perfData.map(function(d){return d.conv;}),
          backgroundColor:perfData.map(function(d){return d.conv>=50?'#10b981':'#f59e0b';})}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
        scales:{y:{beginAtZero:true,max:100,title:{display:true,text:'%'}}}}
    });
  }

  ordPerfRenderDetail();
}

function ordPerfRenderDetail(){
  var nick = (document.getElementById('ordPerfPerson')||{}).value;
  if(!nick) nick = ORD_STAFF[0].nick;
  var idx = ORD_STAFF.map(function(s){return s.nick;}).indexOf(nick);
  if(idx<0) return;
  var s = ORD_STAFF[idx];
  var mKeys = Object.keys(ORD_BILLS.months);

  var kpi = document.getElementById('ordPerfDetailKPI');
  if(kpi){
    var tb = mKeys.reduce(function(sum,m){return sum+ORD_BILLS.months[m][idx];},0);
    var tp = mKeys.reduce(function(sum,m){return sum+ORD_BILLS.pieces[m][idx];},0);
    var cData = _getCallData();
    var calls = cData.filter(function(c){return _extractNick(c.caller||'')===nick;}).length;
    var closed = cData.filter(function(c){return _extractNick(c.caller||'')===nick&&_isOrdered(c.result);}).length;
    kpi.innerHTML = kpiCard('👤 '+s.name+' ('+nick+')',s.zone,'')
      + kpiCard('🧾 บิลรวม',fmt(tb),'')
      + kpiCard('📞 โทร',calls+' สาย','ปิดการขาย '+closed)
      + kpiCard('📊 Conversion',calls>0?Math.round(closed/calls*100)+'%':'0%','');
  }

  var tbody = document.getElementById('ordPerfDetailTBody');
  if(tbody){
    var cData2 = _getCallData();
    tbody.innerHTML = mKeys.map(function(m){
      var calls = cData2.filter(function(c){return _extractNick(c.caller||'')===nick;}).length;
      var closed = cData2.filter(function(c){return _extractNick(c.caller||'')===nick&&_isOrdered(c.result);}).length;
      var errors = ORD_ERRORS.filter(function(e){return e.person===nick && e.month===m.replace(' 2569','').replace('.','');}).reduce(function(sum,e){
        return sum+e.noSend+e.wrongKey+e.missed+e.dup+e.wrongBranch;
      },0);
      var conv = calls>0?Math.round(closed/calls*100):0;
      return '<tr><td>'+m+'</td><td style="text-align:right">'+fmt(ORD_BILLS.months[m][idx])+'</td>'
        +'<td style="text-align:right">'+fmt(ORD_BILLS.pieces[m][idx])+'</td>'
        +'<td style="text-align:right">'+Math.round(calls/4)+'</td>'
        +'<td style="text-align:right">'+Math.round(closed/4)+'</td>'
        +'<td style="text-align:right">'+conv+'%</td>'
        +'<td style="text-align:right;color:'+(errors>0?'#ef4444':'#10b981')+'">'+errors+'</td></tr>';
    }).join('');
  }

  destroyChart('perfDetail');
  var canvas = document.getElementById('ordPerfDetailChart');
  if(!canvas) return;
  _ordCharts.perfDetail = new Chart(canvas,{
    type:'line',
    data:{labels:mKeys,
      datasets:[
        {label:'บิล',data:mKeys.map(function(m){return ORD_BILLS.months[m][idx];}),borderColor:'#3b82f6',tension:0.3,fill:false},
        {label:'ชิ้น (÷10)',data:mKeys.map(function(m){return Math.round(ORD_BILLS.pieces[m][idx]/10);}),borderColor:'#f59e0b',tension:0.3,fill:false}
      ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top'}},
      scales:{y:{beginAtZero:true}}}
  });
}

// ============================================================
// Period Filter (ธุรการขาย)
// ============================================================
window._ordPeriod = {type:'all', year:null, quarter:null};

window.ordSetPeriod = function(type, el){
  window._ordPeriod = {type:type, year:null, quarter:null};
  var bar = document.getElementById('ordPeriodFilter');
  bar.querySelectorAll('.fmtab').forEach(function(b){b.classList.remove('active');});
  el.classList.add('active');
  bar.querySelectorAll('.period-type-btn').forEach(function(b){b.classList.remove('active');});
  document.getElementById('ordQuarterLabel').textContent = '📆 รายไตรมาส';
  document.getElementById('ordYearLabel').textContent = '📅 รายปี';
  var labels = {all:'ทั้งหมด', month:'เดือนนี้ ('+_ordCurrentMonthLabel()+')', lastmonth:'เดือนที่แล้ว ('+_ordLastMonthLabel()+')'};
  document.getElementById('ordPeriodLabel').textContent = 'กำลังแสดง: '+(labels[type]||type);
  _ordApplyPeriod();
};

window.ordToggleQMenu = function(){
  var m = document.getElementById('ordQuarterMenu');
  if(m.style.display!=='none'){m.style.display='none';return;}
  m.style.display='block';
  document.getElementById('ordYearMenu').style.display='none';
  setTimeout(function(){document.addEventListener('click',_ordCloseQMenu);},0);
};
function _ordCloseQMenu(e){
  var m=document.getElementById('ordQuarterMenu');
  if(m&&!m.parentElement.contains(e.target)){m.style.display='none';document.removeEventListener('click',_ordCloseQMenu);}
}

window.ordPickQuarter = function(val, el){
  document.getElementById('ordQuarterMenu').style.display='none';
  document.removeEventListener('click',_ordCloseQMenu);
  var bar = document.getElementById('ordPeriodFilter');
  bar.querySelectorAll('.fmtab').forEach(function(b){b.classList.remove('active');});
  bar.querySelectorAll('.period-type-btn').forEach(function(b){b.classList.remove('active');});
  el.closest('.period-type-btn')|| el.parentElement.parentElement.querySelector('.period-type-btn');
  var btn = el.parentElement.previousElementSibling;
  if(btn) btn.classList.add('active');
  var parts = val.split('-');
  window._ordPeriod = {type:'quarter', year:parseInt(parts[0]), quarter:parts[1]};
  var qLabels = {Q1:'Q1 ม.ค.–มี.ค.', Q2:'Q2 เม.ย.–มิ.ย.', Q3:'Q3 ก.ค.–ก.ย.', Q4:'Q4 ต.ค.–ธ.ค.'};
  document.getElementById('ordQuarterLabel').textContent = '📆 '+qLabels[parts[1]];
  document.getElementById('ordYearLabel').textContent = '📅 รายปี';
  document.getElementById('ordPeriodLabel').textContent = 'กำลังแสดง: '+qLabels[parts[1]]+' '+parts[0];
  _ordApplyPeriod();
};

window.ordToggleYMenu = function(){
  var m = document.getElementById('ordYearMenu');
  if(m.style.display!=='none'){m.style.display='none';return;}
  m.style.display='block';
  document.getElementById('ordQuarterMenu').style.display='none';
  setTimeout(function(){document.addEventListener('click',_ordCloseYMenu);},0);
};
function _ordCloseYMenu(e){
  var m=document.getElementById('ordYearMenu');
  if(m&&!m.parentElement.contains(e.target)){m.style.display='none';document.removeEventListener('click',_ordCloseYMenu);}
}

window.ordPickYear = function(year, el){
  document.getElementById('ordYearMenu').style.display='none';
  document.removeEventListener('click',_ordCloseYMenu);
  var bar = document.getElementById('ordPeriodFilter');
  bar.querySelectorAll('.fmtab').forEach(function(b){b.classList.remove('active');});
  bar.querySelectorAll('.period-type-btn').forEach(function(b){b.classList.remove('active');});
  var btn = el.parentElement.previousElementSibling;
  if(btn) btn.classList.add('active');
  window._ordPeriod = {type:'year', year:year, quarter:null};
  var be = year+543;
  document.getElementById('ordYearLabel').textContent = '📅 ปี '+be+' ('+year+')';
  document.getElementById('ordQuarterLabel').textContent = '📆 รายไตรมาส';
  document.getElementById('ordPeriodLabel').textContent = 'กำลังแสดง: ปี '+be+' ('+year+')';
  _ordApplyPeriod();
};

// ===== Month dropdown (Ordering) =====
window.ordToggleMoMenu = function(){
  var m = document.getElementById('ordMonthMenu');
  if(m.style.display!=='none'){m.style.display='none';return;}
  m.style.display='block';
  document.getElementById('ordQuarterMenu').style.display='none';
  document.getElementById('ordYearMenu').style.display='none';
  setTimeout(function(){document.addEventListener('click',_ordCloseMoMenu);},0);
};
function _ordCloseMoMenu(e){
  var m=document.getElementById('ordMonthMenu');
  if(m&&!m.parentElement.contains(e.target)){m.style.display='none';document.removeEventListener('click',_ordCloseMoMenu);}
}
window.ordPickMonth = function(mo, el){
  var ML = {Jan:'ม.ค.',Feb:'ก.พ.',Mar:'มี.ค.',Apr:'เม.ย.',May:'พ.ค.',Jun:'มิ.ย.',Jul:'ก.ค.',Aug:'ส.ค.',Sep:'ก.ย.',Oct:'ต.ค.',Nov:'พ.ย.',Dec:'ธ.ค.'};
  var MI = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
  document.getElementById('ordMonthMenu').style.display='none';
  document.removeEventListener('click',_ordCloseMoMenu);
  var bar = document.getElementById('ordPeriodFilter');
  bar.querySelectorAll('.fmtab').forEach(function(b){b.classList.remove('active');});
  bar.querySelectorAll('.period-type-btn').forEach(function(b){b.classList.remove('active');});
  var dd = el.parentElement.previousElementSibling;
  if(dd) dd.classList.add('active');
  document.querySelectorAll('#ordMonthMenu .qmenu-item').forEach(function(b){b.classList.remove('active');});
  if(el) el.classList.add('active');
  var now = new Date();
  window._ordPeriod = {type:'pickmonth', year:now.getFullYear(), month:MI[mo]};
  document.getElementById('ordMonthLabel').textContent = '📅 '+ML[mo];
  document.getElementById('ordQuarterLabel').textContent = '📆 รายไตรมาส';
  document.getElementById('ordYearLabel').textContent = '📅 รายปี';
  var be = now.getFullYear()+543;
  document.getElementById('ordPeriodLabel').textContent = 'กำลังแสดง: '+ML[mo]+' '+be;
  _ordApplyPeriod();
};

function _ordCurrentMonthLabel(){
  var m = new Date().getMonth();
  var names = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  return names[m]+' '+(new Date().getFullYear()+543);
}
function _ordLastMonthLabel(){
  var d = new Date(); d.setMonth(d.getMonth()-1);
  var names = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  return names[d.getMonth()]+' '+(d.getFullYear()+543);
}

window.ordGetDateRange = function(){
  var p = window._ordPeriod;
  var now = new Date();
  if(p.type==='all') return null;
  if(p.type==='month'){
    var start = new Date(now.getFullYear(), now.getMonth(), 1);
    var end = new Date(now.getFullYear(), now.getMonth()+1, 0);
    return {start:start, end:end};
  }
  if(p.type==='lastmonth'){
    var start = new Date(now.getFullYear(), now.getMonth()-1, 1);
    var end = new Date(now.getFullYear(), now.getMonth(), 0);
    return {start:start, end:end};
  }
  if(p.type==='quarter'){
    var qMap = {Q1:[0,2], Q2:[3,5], Q3:[6,8], Q4:[9,11]};
    var range = qMap[p.quarter];
    return {start:new Date(p.year, range[0], 1), end:new Date(p.year, range[1]+1, 0)};
  }
  if(p.type==='year'){
    return {start:new Date(p.year, 0, 1), end:new Date(p.year, 11, 31)};
  }
  return null;
};

function _ordApplyPeriod(){
  var active = document.querySelector('#tab-ordering .sub-section.active');
  if(!active) return;
  var id = active.id;
  if(id==='ord-bills' && typeof renderOrdBills==='function') renderOrdBills();
  if(id==='ord-errors' && typeof renderOrdErrors==='function') renderOrdErrors();
  if(id==='ord-calls' && typeof renderOrdCalls==='function') renderOrdCalls();
  if(id==='ord-perf' && typeof renderOrdPerf==='function') renderOrdPerf();
}

// ============================================================
// AI Analysis for Ordering
// ============================================================
window.renderOrdAI = function(){
  var body = document.getElementById('ordAIBody');
  if(!body) return;

  var callData = _getCallData();
  var html = '';

  // ─── Header ───
  html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">'
    +'<div style="font-size:28px">🤖</div>'
    +'<div><div style="font-size:18px;font-weight:800;color:var(--text)">วิเคราะห์ AI — ธุรการขาย</div>'
    +'<div style="font-size:12px;color:#64748b">วิเคราะห์อัตโนมัติจากข้อมูลบิล, การโทร, เช็คลิส และผลงานพนักงาน</div></div></div>';

  // ─── KPI Summary Cards ───
  var totalCalls = callData.length;
  var closedCalls = callData.filter(function(c){return _isOrdered(c.result);}).length;
  var followCalls = callData.filter(function(c){return _needFollowUp(c.result);}).length;
  var convPct = totalCalls>0 ? Math.round(closedCalls/totalCalls*100) : 0;

  var mKeys = Object.keys(ORD_BILLS.months);
  var totalBills = 0;
  if(mKeys.length>0){
    var lastM = mKeys[mKeys.length-1];
    totalBills = ORD_BILLS.months[lastM].reduce(function(a,b){return a+b;},0);
  }

  var totalRoutes = window.ORD_CHECKLIST_ROUTES ? window.ORD_CHECKLIST_ROUTES.length : 0;

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:20px">';
  html += _aiKpiCard('📞','สายโทรทั้งหมด',totalCalls+' สาย','จาก call log','#2563eb');
  html += _aiKpiCard('✅','ปิดการขายได้',closedCalls+' สาย',convPct+'% conversion',convPct>=40?'#16a34a':'#dc2626');
  html += _aiKpiCard('🔄','รอติดตาม',followCalls+' ราย','ต้องโทรกลับ',followCalls>0?'#f59e0b':'#16a34a');
  html += _aiKpiCard('🧾','บิลเดือนล่าสุด',totalBills+' บิล',mKeys.length>0?mKeys[mKeys.length-1]:'—','#7c3aed');
  html += _aiKpiCard('🗺️','เส้นทางทั้งหมด',totalRoutes+' เส้นทาง','เช็คลิสร้านค้า','#0891b2');
  html += '</div>';

  // ─── AI Insights ───
  var insights = [];

  // 1. Call Conversion Analysis
  if(totalCalls>=3){
    if(convPct<30){
      insights.push({icon:'🔴',severity:'critical',title:'อัตราปิดการขายต่ำ ('+convPct+'%)',
        detail:'ปิดการขายได้เพียง '+closedCalls+' จาก '+totalCalls+' สาย — แนะนำให้ทบทวนสคริปต์การขาย, ฝึกอบรมเทคนิคการปิดการขาย และวิเคราะห์สาเหตุที่ลูกค้าปฏิเสธ',
        action:'📋 ทบทวนสคริปต์การขาย + จัดอบรม'});
    } else if(convPct<50){
      insights.push({icon:'🟡',severity:'warning',title:'อัตราปิดการขายปานกลาง ('+convPct+'%)',
        detail:'ยังมีช่องว่างในการปรับปรุง — พิจารณาจัดกลุ่มลูกค้าตาม Potential เพื่อโฟกัสสายที่มีโอกาสสูง',
        action:'📊 วิเคราะห์กลุ่มลูกค้า Potential สูง'});
    } else {
      insights.push({icon:'🟢',severity:'good',title:'อัตราปิดการขายดี ('+convPct+'%)',
        detail:'ทีมมี Conversion Rate ที่ดี — รักษาระดับนี้ไว้และขยายจำนวนสายโทรเพื่อเพิ่มยอดขาย',
        action:'📈 เพิ่มจำนวนสายโทรต่อวัน'});
    }
  }

  // 2. Follow-up urgency
  if(followCalls>0){
    var urgentFollows = callData.filter(function(c){
      if(!_needFollowUp(c.result)) return false;
      var d = new Date(c.date);
      var diff = Math.round((new Date()-d)/(1000*60*60*24));
      return diff>=3;
    });
    if(urgentFollows.length>0){
      insights.push({icon:'⏰',severity:'critical',title:'ลูกค้ารอติดตามเกิน 3 วัน: '+urgentFollows.length+' ราย',
        detail:'ลูกค้าที่รอการตัดสินใจ/ฝากข้อความนานเกินไปอาจเปลี่ยนใจ — ควรโทรกลับทันที: '+urgentFollows.map(function(c){return c.customerName||c.storeName;}).slice(0,5).join(', '),
        action:'📞 โทรกลับด่วนภายในวันนี้'});
    }
  }

  // 3. Staff performance analysis
  if(callData.length>0){
    var staffCalls = {};
    callData.forEach(function(c){
      var nick = _extractNick(c.caller);
      if(!staffCalls[nick]) staffCalls[nick] = {total:0,closed:0,follow:0};
      staffCalls[nick].total++;
      if(_isOrdered(c.result)) staffCalls[nick].closed++;
      if(_needFollowUp(c.result)) staffCalls[nick].follow++;
    });

    var bestStaff = null, worstStaff = null;
    Object.keys(staffCalls).forEach(function(name){
      var s = staffCalls[name];
      s.rate = s.total>0 ? Math.round(s.closed/s.total*100) : 0;
      if(!bestStaff || s.rate>bestStaff.rate) bestStaff = {name:name, rate:s.rate, total:s.total, closed:s.closed};
      if(s.total>=2 && (!worstStaff || s.rate<worstStaff.rate)) worstStaff = {name:name, rate:s.rate, total:s.total, closed:s.closed};
    });

    if(bestStaff && bestStaff.rate>0){
      insights.push({icon:'⭐',severity:'good',title:'พนักงานดีเด่น: '+bestStaff.name+' ('+bestStaff.rate+'% conversion)',
        detail:'ปิดการขายได้ '+bestStaff.closed+'/'+bestStaff.total+' สาย — แนะนำให้แชร์เทคนิคกับทีม',
        action:'🎓 ให้ '+bestStaff.name+' แชร์เทคนิคในประชุมทีม'});
    }
    if(worstStaff && bestStaff && worstStaff.name!==bestStaff.name && worstStaff.rate<30){
      insights.push({icon:'📉',severity:'warning',title:worstStaff.name+' ต้องการพัฒนา ('+worstStaff.rate+'% conversion)',
        detail:'ปิดการขาย '+worstStaff.closed+'/'+worstStaff.total+' สาย — แนะนำจับคู่กับ '+bestStaff.name+' เพื่อเรียนรู้',
        action:'👥 จับคู่ Buddy กับพนักงานที่มี Conversion สูง'});
    }
  }

  // 4. Bill trend analysis
  if(mKeys.length>=2){
    var prev = ORD_BILLS.months[mKeys[mKeys.length-2]];
    var curr = ORD_BILLS.months[mKeys[mKeys.length-1]];
    var prevTotal = prev.reduce(function(a,b){return a+b;},0);
    var currTotal = curr.reduce(function(a,b){return a+b;},0);
    var billChange = prevTotal>0 ? Math.round((currTotal-prevTotal)/prevTotal*100) : 0;
    if(billChange<-10){
      insights.push({icon:'📉',severity:'critical',title:'จำนวนบิลลดลง '+Math.abs(billChange)+'%',
        detail:mKeys[mKeys.length-2]+': '+prevTotal+' บิล → '+mKeys[mKeys.length-1]+': '+currTotal+' บิล — แนวโน้มลดลง ต้องหาสาเหตุ',
        action:'🔍 วิเคราะห์สาเหตุที่บิลลด + เพิ่มความถี่โทร'});
    } else if(billChange>10){
      insights.push({icon:'📈',severity:'good',title:'จำนวนบิลเพิ่มขึ้น '+billChange+'%',
        detail:mKeys[mKeys.length-2]+': '+prevTotal+' บิล → '+mKeys[mKeys.length-1]+': '+currTotal+' บิล — แนวโน้มดี!',
        action:'🎯 รักษาโมเมนตัมและขยายผล'});
    } else {
      insights.push({icon:'➡️',severity:'info',title:'จำนวนบิลทรงตัว ('+billChange+'%)',
        detail:mKeys[mKeys.length-2]+': '+prevTotal+' → '+mKeys[mKeys.length-1]+': '+currTotal+' บิล',
        action:'💡 หาโอกาสเพิ่มฐานลูกค้าใหม่'});
    }
  }

  // 5. Time-of-day call pattern
  if(callData.length>=3){
    var hourBuckets = {morning:0,afternoon:0,evening:0};
    callData.forEach(function(c){
      if(!c.startTime) return;
      var h = parseInt(c.startTime.split(':')[0]);
      if(h<12) hourBuckets.morning++;
      else if(h<17) hourBuckets.afternoon++;
      else hourBuckets.evening++;
    });
    var bestTime = hourBuckets.morning>=hourBuckets.afternoon && hourBuckets.morning>=hourBuckets.evening ? 'เช้า (ก่อนเที่ยง)' :
      hourBuckets.afternoon>=hourBuckets.evening ? 'บ่าย (12:00–17:00)' : 'เย็น (หลัง 17:00)';
    insights.push({icon:'🕐',severity:'info',title:'ช่วงเวลาโทรมากที่สุด: '+bestTime,
      detail:'เช้า '+hourBuckets.morning+' สาย | บ่าย '+hourBuckets.afternoon+' สาย | เย็น '+hourBuckets.evening+' สาย',
      action:'📅 จัดตาราง Focus Call ในช่วง '+bestTime});
  }

  // 6. Province coverage
  if(callData.length>0){
    var provinces = {};
    callData.forEach(function(c){ if(c.province) provinces[c.province] = (provinces[c.province]||0)+1; });
    var provList = Object.keys(provinces).sort(function(a,b){return provinces[b]-provinces[a];});
    if(provList.length>0){
      insights.push({icon:'🗺️',severity:'info',title:'ครอบคลุม '+provList.length+' จังหวัด',
        detail:'Top: '+provList.slice(0,5).map(function(p){return p+' ('+provinces[p]+')';}).join(', '),
        action:'📍 ขยายพื้นที่จังหวัดที่ยังไม่มีการโทร'});
    }
  }

  // Render insights
  if(insights.length===0){
    html += '<div class="card" style="padding:40px;text-align:center;color:#94a3b8"><div style="font-size:48px;margin-bottom:12px">📊</div>ยังไม่มีข้อมูลเพียงพอสำหรับวิเคราะห์ — เพิ่มข้อมูลการโทรและบิลเพื่อดู AI Insights</div>';
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:12px">';
    insights.forEach(function(ins){
      var bg = ins.severity==='critical'?'#fef2f2':ins.severity==='warning'?'#fffbeb':ins.severity==='good'?'#f0fdf4':'#f0f9ff';
      var border = ins.severity==='critical'?'#fecaca':ins.severity==='warning'?'#fed7aa':ins.severity==='good'?'#bbf7d0':'#bfdbfe';
      var actionColor = ins.severity==='critical'?'#dc2626':ins.severity==='warning'?'#d97706':ins.severity==='good'?'#16a34a':'#2563eb';
      html += '<div class="card" style="background:'+bg+';border:1px solid '+border+';border-left:4px solid '+border+';padding:16px">'
        +'<div style="display:flex;align-items:flex-start;gap:12px">'
        +'<div style="font-size:24px;flex-shrink:0">'+ins.icon+'</div>'
        +'<div style="flex:1">'
        +'<div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:4px">'+ins.title+'</div>'
        +'<div style="font-size:12px;color:#475569;line-height:1.6;margin-bottom:8px">'+ins.detail+'</div>'
        +'<div style="display:inline-block;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;color:'+actionColor+';background:rgba(0,0,0,.05)">'+ins.action+'</div>'
        +'</div></div></div>';
    });
    html += '</div>';
  }

  // ─── Staff Performance Table ───
  if(callData.length>0){
    var staffMap = {};
    callData.forEach(function(c){
      var nick = _extractNick(c.caller);
      if(!staffMap[nick]) staffMap[nick] = {total:0,closed:0,follow:0,noAns:0,duration:0};
      staffMap[nick].total++;
      if(_isOrdered(c.result)) staffMap[nick].closed++;
      if(_needFollowUp(c.result)) staffMap[nick].follow++;
      if(c.result==='ไม่รับสาย'||c.result==='สายไม่ว่าง'||c.result==='ปิดเครื่อง') staffMap[nick].noAns++;
      if(c.duration) staffMap[nick].duration += parseInt(c.duration)||0;
    });

    html += '<div class="card" style="margin-top:20px">'
      +'<div class="card-title">📊 AI Scorecard — ผลงานรายคน</div>'
      +'<div style="overflow-x:auto;margin-top:12px"><table style="width:100%;border-collapse:collapse;font-size:13px">'
      +'<thead><tr style="background:#f8fafc"><th style="padding:10px;text-align:left">พนักงาน</th>'
      +'<th style="padding:10px;text-align:right">สายทั้งหมด</th>'
      +'<th style="padding:10px;text-align:right">ปิดขาย</th>'
      +'<th style="padding:10px;text-align:right">Conversion</th>'
      +'<th style="padding:10px;text-align:right">รอติดตาม</th>'
      +'<th style="padding:10px;text-align:right">ไม่ติด</th>'
      +'<th style="padding:10px;text-align:center">ระดับ</th>'
      +'</tr></thead><tbody>';

    var staffArr = Object.keys(staffMap).map(function(name){
      var s = staffMap[name];
      s.name = name;
      s.rate = s.total>0 ? Math.round(s.closed/s.total*100) : 0;
      return s;
    }).sort(function(a,b){return b.rate-a.rate;});

    staffArr.forEach(function(s){
      var grade = s.rate>=60?'⭐ A':s.rate>=40?'👍 B':s.rate>=20?'📊 C':'⚠️ D';
      var gradeColor = s.rate>=60?'#16a34a':s.rate>=40?'#2563eb':s.rate>=20?'#d97706':'#dc2626';
      var rateColor = s.rate>=50?'#16a34a':s.rate>=30?'#d97706':'#dc2626';
      html += '<tr style="border-bottom:1px solid #f1f5f9">'
        +'<td style="padding:10px;font-weight:600">'+s.name+'</td>'
        +'<td style="padding:10px;text-align:right">'+s.total+'</td>'
        +'<td style="padding:10px;text-align:right;color:#16a34a;font-weight:700">'+s.closed+'</td>'
        +'<td style="padding:10px;text-align:right"><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-weight:700;font-size:12px;color:#fff;background:'+rateColor+'">'+s.rate+'%</span></td>'
        +'<td style="padding:10px;text-align:right;color:#d97706">'+s.follow+'</td>'
        +'<td style="padding:10px;text-align:right;color:#94a3b8">'+s.noAns+'</td>'
        +'<td style="padding:10px;text-align:center;font-weight:700;color:'+gradeColor+'">'+grade+'</td>'
        +'</tr>';
    });

    html += '</tbody></table></div></div>';
  }

  // ─── Recommendations ───
  html += '<div class="card" style="margin-top:20px;background:linear-gradient(135deg,#eff6ff,#f0fdf4);border:1px solid #bfdbfe">'
    +'<div class="card-title">💡 แผนปฏิบัติแนะนำ (AI Action Plan)</div>'
    +'<div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">';

  var actions = [];
  if(followCalls>0) actions.push({pri:'สูง',icon:'📞',text:'โทรติดตามลูกค้า '+followCalls+' ราย ที่รอการตัดสินใจ'});
  if(convPct<40 && totalCalls>0) actions.push({pri:'สูง',icon:'📋',text:'จัดประชุมทบทวนสคริปต์การขาย + Roleplay ฝึกซ้อม'});
  if(mKeys.length>=2){
    var prev2 = ORD_BILLS.months[mKeys[mKeys.length-2]];
    var curr2 = ORD_BILLS.months[mKeys[mKeys.length-1]];
    var p2 = prev2.reduce(function(a,b){return a+b;},0);
    var c2 = curr2.reduce(function(a,b){return a+b;},0);
    if(c2<p2) actions.push({pri:'กลาง',icon:'🧾',text:'วิเคราะห์สาเหตุบิลลดลงจาก '+p2+' เป็น '+c2+' บิล'});
  }
  actions.push({pri:'กลาง',icon:'📊',text:'ตั้งเป้า Conversion Rate ≥ 40% ภายในเดือนหน้า'});
  actions.push({pri:'ต่ำ',icon:'🗺️',text:'สำรวจพื้นที่ใหม่ที่ยังไม่มีการโทร เพื่อขยายฐานลูกค้า'});

  actions.forEach(function(a){
    var priColor = a.pri==='สูง'?'#dc2626':a.pri==='กลาง'?'#d97706':'#2563eb';
    html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#fff;border-radius:8px;border:1px solid #e2e8f0">'
      +'<span style="font-size:18px">'+a.icon+'</span>'
      +'<span style="flex:1;font-size:13px;color:#1e293b">'+a.text+'</span>'
      +'<span style="padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;color:#fff;background:'+priColor+'">'+a.pri+'</span>'
      +'</div>';
  });

  html += '</div></div>';

  body.innerHTML = html;
};

function _aiKpiCard(icon,label,value,sub,color){
  return '<div style="background:#fff;border-radius:12px;padding:16px;border:1px solid #e2e8f0;border-top:3px solid '+color+'">'
    +'<div style="font-size:22px;margin-bottom:4px">'+icon+'</div>'
    +'<div style="font-size:20px;font-weight:800;color:'+color+'">'+value+'</div>'
    +'<div style="font-size:12px;color:#64748b;font-weight:600">'+label+'</div>'
    +'<div style="font-size:11px;color:#94a3b8">'+sub+'</div></div>';
}

})();

