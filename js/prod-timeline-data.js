// สร้างอัตโนมัติโดย build-timeline.js — อย่าแก้ไฟล์นี้ด้วยมือ
// ที่มา: Time Line Product.xlsx (ข้อมูล ณ 2026-09-09)
var TIMELINE_DEFAULT_DATA = {
 "version": "2026-09-09",
 "asOf": "2026-09-09",
 "source": "Time Line Product.xlsx",
 "taskOptions": [
  "กำลังดำเนินการ",
  "รอบัญชีต้นทุน",
  "รอสั่งซื้อ",
  "รออนุมัติ",
  "เสร็จแล้ว",
  "ยังไม่เสร็จ",
  "รอ RD"
 ],
 "approvalOptions": [
  "กำลังพัฒนา",
  "ผ่าน",
  "ผ่านแล้ว",
  "รอส่งตัวอย่าง",
  "ไม่ผ่าน"
 ],
 "newItems": [
  {
   "id": "npd_1",
   "seq": 1,
   "channel": "Amazon",
   "name": "เค้กสตรอว์เบอร์รีซันเดย์",
   "category": "Chill",
   "packSize": 1,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "เดือนตุลาคม",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_2",
   "seq": 2,
   "channel": "Amazon",
   "name": "เค้กชาไทย มินิทองหยอด",
   "category": "Chill",
   "packSize": 1,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "เดือนตุลาคม",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_3",
   "seq": 3,
   "channel": "Amazon",
   "name": "ขนมเปี๊ยะกุหลาบไส้ถั่วไข่เค็ม",
   "category": "Ambient",
   "packSize": 4,
   "developer": "Khun.Arm",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "เดือนตุลาคม",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_4",
   "seq": 4,
   "channel": "Amazon",
   "name": "ขนมเปี๊ยะกุหลาบใบเตย",
   "category": "Ambient",
   "packSize": 4,
   "developer": "Khun.Arm",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "เดือนตุลาคม",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_5",
   "seq": 5,
   "channel": "Amazon",
   "name": "พุดดิ้งชาไทย",
   "category": "Chill",
   "packSize": 1,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "เดือนตุลาคม",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_6",
   "seq": 6,
   "channel": "Amazon",
   "name": "เค้กกล้วยหอมครีมชีส",
   "category": "Chill",
   "packSize": 1,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "เดือนตุลาคม",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_7",
   "seq": 7,
   "channel": "Amazon",
   "name": "เอแคลร์มะพร้าวอ่อน",
   "category": "Chill",
   "packSize": 8,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "เดือนตุลาคม",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_8",
   "seq": 8,
   "channel": "Amazon",
   "name": "โมจิคุกกี้แอนด์ครีม",
   "category": "Chill",
   "packSize": 2,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "เดือนตุลาคม",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_9",
   "seq": 9,
   "channel": "Amazon",
   "name": "ขนมปังสตรอเบอร์รี่",
   "category": "Ambient",
   "packSize": 5,
   "developer": "Khun.NOK",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_10",
   "seq": 10,
   "channel": "Amazon",
   "name": "ขนมปังเนยสดอัลมอนด์",
   "category": "Ambient",
   "packSize": 5,
   "developer": "Khun.NOK",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_11",
   "seq": 11,
   "channel": "Amazon",
   "name": "ขนมปังสังขยา",
   "category": "Ambient",
   "packSize": 5,
   "developer": "Khun.NOK",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_12",
   "seq": 12,
   "channel": "Amazon",
   "name": "ขนมปังเผือก",
   "category": "Ambient",
   "packSize": 5,
   "developer": "Khun.NOK",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_13",
   "seq": 13,
   "channel": "Amazon",
   "name": "ขนมปังบลูบอร์รี่",
   "category": "Ambient",
   "packSize": 5,
   "developer": "Khun.NOK",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_14",
   "seq": 14,
   "channel": "Amazon",
   "name": "ขนมปังถั่วแดง",
   "category": "Ambient",
   "packSize": 5,
   "developer": "Khun.NOK",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_15",
   "seq": 15,
   "channel": "Amazon",
   "name": "ขนมปังช็อกโกแลต",
   "category": "Ambient",
   "packSize": 5,
   "developer": "Khun.NOK",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_16",
   "seq": 16,
   "channel": "Amazon",
   "name": "ขนมปังสัปปะรด",
   "category": "Ambient",
   "packSize": 5,
   "developer": "Khun.NOK",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_17",
   "seq": 17,
   "channel": "Amazon",
   "name": "ขนมปังคัสตาร์ด",
   "category": "Ambient",
   "packSize": 5,
   "developer": "Khun.NOK",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_18",
   "seq": 18,
   "channel": "Big C",
   "name": "BOGO สังขยาใบเตย WWN",
   "category": "Ambient",
   "packSize": 4,
   "developer": "",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "รอบัญชีต้นทุน",
    "quote": "รอบัญชีต้นทุน",
    "labelDesign": "รออนุมัติ",
    "labelOrder": "รออนุมัติ",
    "labelStock": "รออนุมัติ",
    "material": "รออนุมัติ",
    "nutrition": "รออนุมัติ",
    "shelfLife": "รออนุมัติ",
    "fda": "รออนุมัติ"
   }
  },
  {
   "id": "npd_19",
   "seq": 19,
   "channel": "Big C",
   "name": "BOGO เผือก WWN",
   "category": "Ambient",
   "packSize": 4,
   "developer": "",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "รอบัญชีต้นทุน",
    "quote": "รอบัญชีต้นทุน",
    "labelDesign": "รออนุมัติ",
    "labelOrder": "รออนุมัติ",
    "labelStock": "รออนุมัติ",
    "material": "รออนุมัติ",
    "nutrition": "รออนุมัติ",
    "shelfLife": "รออนุมัติ",
    "fda": "รออนุมัติ"
   }
  },
  {
   "id": "npd_20",
   "seq": 20,
   "channel": "Big C",
   "name": "BOGO ครัสตาร์ด WWN",
   "category": "Ambient",
   "packSize": 4,
   "developer": "",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "รอบัญชีต้นทุน",
    "quote": "รอบัญชีต้นทุน",
    "labelDesign": "รออนุมัติ",
    "labelOrder": "รออนุมัติ",
    "labelStock": "รออนุมัติ",
    "material": "รออนุมัติ",
    "nutrition": "รออนุมัติ",
    "shelfLife": "รออนุมัติ",
    "fda": "รออนุมัติ"
   }
  },
  {
   "id": "npd_21",
   "seq": 21,
   "channel": "Big C",
   "name": "เค้กไก่หยองสาหร่าย",
   "category": "Ambient",
   "packSize": 1,
   "developer": "",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "เสร็จแล้ว",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "รออนุมัติ",
    "labelOrder": "รออนุมัติ",
    "labelStock": "รออนุมัติ",
    "material": "รออนุมัติ",
    "nutrition": "รออนุมัติ",
    "shelfLife": "รออนุมัติ",
    "fda": "รออนุมัติ"
   }
  },
  {
   "id": "npd_22",
   "seq": 22,
   "channel": "Big C",
   "name": "เค้กช็อกโกแลตขูด",
   "category": "Chill",
   "packSize": 1,
   "developer": "",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "เสร็จแล้ว",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "รออนุมัติ",
    "labelOrder": "รออนุมัติ",
    "labelStock": "รออนุมัติ",
    "material": "รออนุมัติ",
    "nutrition": "รออนุมัติ",
    "shelfLife": "รออนุมัติ",
    "fda": "รออนุมัติ"
   }
  },
  {
   "id": "npd_23",
   "seq": 23,
   "channel": "Big C",
   "name": "ดิปครีมชีสสตรอว์เบอรี่",
   "category": "Chill",
   "packSize": 1,
   "developer": "",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "8/9/2569 ( รอบที่ 2 )"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_24",
   "seq": 24,
   "channel": "Big C",
   "name": "ชิฟฟ่อนเรนโบว์",
   "category": "Chill",
   "packSize": 1,
   "developer": "",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "8/9/2569 ( รอบที่ 2 )"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_25",
   "seq": 25,
   "channel": "Big C",
   "name": "ชิฟฟ่อนไวท์ช็อก",
   "category": "Chill",
   "packSize": 1,
   "developer": "",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "8/9/2569 ( รอบที่ 2 )"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_26",
   "seq": 26,
   "channel": "Big C",
   "name": "BOGO สัปปะรด ศรีสุดา",
   "category": "Ambient",
   "packSize": 3,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_27",
   "seq": 27,
   "channel": "Big C",
   "name": "BOGO คัสตราด ศรีสุดา",
   "category": "Ambient",
   "packSize": 3,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_28",
   "seq": 28,
   "channel": "Big C",
   "name": "BOGO มะพร้าว ศรีสุดา",
   "category": "Ambient",
   "packSize": 3,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_29",
   "seq": 29,
   "channel": "Big C",
   "name": "BOGO ใบเตย ศรีสุดา",
   "category": "Ambient",
   "packSize": 3,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_30",
   "seq": 30,
   "channel": "Big C",
   "name": "BOGO ไส้กรอกแดงมายองเนส (ศรีสุดา)",
   "category": "Ambient",
   "packSize": 3,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_31",
   "seq": 31,
   "channel": "Big C",
   "name": "BOGO ปูอัดมายองเนส (ศรีสุดา)",
   "category": "Ambient",
   "packSize": 3,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_32",
   "seq": 32,
   "channel": "Big C",
   "name": "BOGO เนยน้ำตาล (ศรีสุดา)",
   "category": "Ambient",
   "packSize": 3,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_33",
   "seq": 33,
   "channel": "Big C",
   "name": "BOGO มะพร้าวสังขยาไข่ ศรีสุดา",
   "category": "Ambient",
   "packSize": 3,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_34",
   "seq": 34,
   "channel": "Big C",
   "name": "BOGO เผือกใบเตย ศรีสุดา",
   "category": "Ambient",
   "packSize": 3,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_35",
   "seq": 35,
   "channel": "Big C",
   "name": "BOGO ช็อกโกแลต (ปั้นกลม) ศรีสุดา",
   "category": "Ambient",
   "packSize": 4,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_36",
   "seq": 36,
   "channel": "Big C",
   "name": "BOGO คัสตราด (ปั้นกลม) ศรีสุดา",
   "category": "Ambient",
   "packSize": 4,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_37",
   "seq": 37,
   "channel": "Big C",
   "name": "BOGO สังขยาไข่ (ปั้นกลม) ศรีสุดา",
   "category": "Ambient",
   "packSize": 4,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_38",
   "seq": 38,
   "channel": "Big C",
   "name": "BOGO ถั่วแดง (ปั้นกลม) ศรีสุดา",
   "category": "Ambient",
   "packSize": 4,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_39",
   "seq": 39,
   "channel": "Big C",
   "name": "BOGO ถั่วดำ (ปั้นกลม) ศรีสุดา",
   "category": "Ambient",
   "packSize": 4,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_40",
   "seq": 40,
   "channel": "Big C",
   "name": "BOGO เผือก (ปั้นกลม) ศรีสุดา",
   "category": "Ambient",
   "packSize": 4,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_41",
   "seq": 41,
   "channel": "Big C",
   "name": "BOGO ใบเตย  (ปั้นกลม) (ไส้ศรีสุดา) ศรีสุดา",
   "category": "Ambient",
   "packSize": 4,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_42",
   "seq": 42,
   "channel": "Big C",
   "name": "BOGO ไก่หยองพริกเผา (ปั้นกลม) ศรีสุดา",
   "category": "Ambient",
   "packSize": 4,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_43",
   "seq": 43,
   "channel": "Big C",
   "name": "มินิบันเนยน้ำตาล",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_44",
   "seq": 44,
   "channel": "Big C",
   "name": "มินิบันเนยกาแฟ",
   "category": "Chill",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_45",
   "seq": 45,
   "channel": "Big C",
   "name": "มินิบันวิปปิ้งครีมฝอยทอง",
   "category": "Chill",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_46",
   "seq": 46,
   "channel": "Big C",
   "name": "มินิบันวิปปิ้งครีมช็อกโกแลตช็อกชิฟ",
   "category": "Chill",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_47",
   "seq": 47,
   "channel": "Big C",
   "name": "มินิบันวิปปิ้งครีมโอรีโอ้",
   "category": "Chill",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_48",
   "seq": 48,
   "channel": "Big C",
   "name": "มินิบันไก่หยองสลัดซีซ่า",
   "category": "Chill",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_49",
   "seq": 49,
   "channel": "Big C",
   "name": "มินิบันช็อกโกแลตลาวา",
   "category": "Chill",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_50",
   "seq": 50,
   "channel": "Big C",
   "name": "มินิบันแฮมชีสทรัฟเฟิล",
   "category": "Chill",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_51",
   "seq": 51,
   "channel": "Big C",
   "name": "มินิแฮมเบอร์เกอร์โบโลน่าน้ำสลัด",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_52",
   "seq": 52,
   "channel": "Big C",
   "name": "มินิแฮมเบอร์เกอร์ไส้กรอสชีสมายองเนส",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_53",
   "seq": 53,
   "channel": "Big C",
   "name": "ปังญวณแฮมชีส + เนยกระเทียม",
   "category": "Ambient",
   "packSize": 2,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_54",
   "seq": 54,
   "channel": "Big C",
   "name": "มินิบันนมฮอกไกโด",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_55",
   "seq": 55,
   "channel": "Big C",
   "name": "มินิบันมะพร้าว",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_56",
   "seq": 56,
   "channel": "Big C",
   "name": "มินิบันเนยสดอัลมอลล์",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_57",
   "seq": 57,
   "channel": "Big C",
   "name": "มินิบันไข่เค็มน้ำสลัดไก่หยอง",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_58",
   "seq": 58,
   "channel": "CJ",
   "name": "มินิบันเนยน้ำตาล",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_59",
   "seq": 59,
   "channel": "CJ",
   "name": "มินิบันเนยกาแฟ",
   "category": "Chill",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_60",
   "seq": 60,
   "channel": "CJ",
   "name": "มินิบันวิปปิ้งครีมฝอยทอง",
   "category": "Chill",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_61",
   "seq": 61,
   "channel": "CJ",
   "name": "มินิบันวิปปิ้งครีมช็อกโกแลตช็อกชิฟ",
   "category": "Chill",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_62",
   "seq": 62,
   "channel": "CJ",
   "name": "มินิบันวิปปิ้งครีมโอรีโอ้",
   "category": "Chill",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_63",
   "seq": 63,
   "channel": "CJ",
   "name": "มินิบันไก่หยองสลัดซีซ่า",
   "category": "Chill",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_64",
   "seq": 64,
   "channel": "CJ",
   "name": "มินิบันช็อกโกแลตลาวา",
   "category": "Chill",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_65",
   "seq": 65,
   "channel": "CJ",
   "name": "มินิบันแฮมชีสทรัฟเฟิล",
   "category": "Chill",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": ""
   },
   "tasting": [
    {
     "date": "2026-09-03",
     "note": "ผ่าน (ถ้าแซนวิชไปรอดมินิบันก็ได้เข้า)"
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_66",
   "seq": 66,
   "channel": "CJ",
   "name": "มินิแฮมเบอร์เกอร์โบโลน่าน้ำสลัด",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": "2026-09-03",
     "note": "รสชาติ : จืดไปปรับให้กลมกล่อมเค็มหวานนิดๆ\r\nท็อปปิ้ง : โอริหาโน่ไม่ต้องโรย\r\nแป้ง : ผ่าน\r\n*** CJ อยากให้ปรับ Ambient ถ้าไม่ได้ในอุณหภูมิ Ambient จะต้องปรับ Pk เป็นกล่องแซนวิชไส้กรอกทรัฟเฟิล ***"
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_67",
   "seq": 67,
   "channel": "CJ",
   "name": "มินิแฮมเบอร์เกอร์ไส้กรอสชีสมายองเนส",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": "2026-09-03",
     "note": "มินิเบอร์เกอร์ไส้กรอสชีส\r\n*** CJ อยากให้ปรับเป็นชิ้นใหญ่ 2 ชิ้น แล้วไส้กรอกยาวแบบผ่าครึ่งกลาง และหาตัวน้ำราดข้างบนเป็นน้ำมายองเนส"
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_68",
   "seq": 68,
   "channel": "CJ",
   "name": "ปังญวณแฮมชีส + เนยกระเทียม",
   "category": "Ambient",
   "packSize": 2,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": "2026-09-03",
     "note": "ลูกค้า CJ น่าจะไม่ชอบ แต่รสชาติ อร่อยดี"
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_69",
   "seq": 69,
   "channel": "CJ",
   "name": "มินิบันนมฮอกไกโด",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_70",
   "seq": 70,
   "channel": "CJ",
   "name": "มินิบันมะพร้าว",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_71",
   "seq": 71,
   "channel": "CJ",
   "name": "มินิบันเนยสดอัลมอลล์",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_72",
   "seq": 72,
   "channel": "CJ",
   "name": "มินิบันไข่เค็มน้ำสลัดไก่หยอง",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "ส่งตัวอย่างอีกรอบ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_73",
   "seq": 73,
   "channel": "CJ",
   "name": "แซนวิชไส้กรอกทรัฟเฟิล",
   "category": "Chill",
   "packSize": 1,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่านแล้ว",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": "2026-09-04",
   "sellDateNote": "",
   "tasks": {
    "cost": "เสร็จแล้ว",
    "quote": "เสร็จแล้ว",
    "labelDesign": "เสร็จแล้ว",
    "labelOrder": "เสร็จแล้ว",
    "labelStock": "เสร็จแล้ว",
    "material": "เสร็จแล้ว",
    "nutrition": "เสร็จแล้ว",
    "shelfLife": "เสร็จแล้ว",
    "fda": "เสร็จแล้ว"
   }
  },
  {
   "id": "npd_74",
   "seq": 74,
   "channel": "CJ",
   "name": "แซนวิชทูน่าสลัดซีซ่า",
   "category": "Chill",
   "packSize": 1,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่านแล้ว",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "กำลังดำเนินการ",
    "labelOrder": "กำลังดำเนินการ",
    "labelStock": "รอสั่งซื้อ",
    "material": "รอสั่งซื้อ",
    "nutrition": "กำลังดำเนินการ",
    "shelfLife": "กำลังดำเนินการ",
    "fda": "กำลังดำเนินการ"
   }
  },
  {
   "id": "npd_75",
   "seq": 75,
   "channel": "CJ",
   "name": "แซนวิชไก่หยองแฮมน้ำสลัด",
   "category": "Ambient",
   "packSize": 1,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่านแล้ว",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "กำลังดำเนินการ",
    "labelOrder": "กำลังดำเนินการ",
    "labelStock": "รอสั่งซื้อ",
    "material": "รอสั่งซื้อ",
    "nutrition": "กำลังดำเนินการ",
    "shelfLife": "กำลังดำเนินการ",
    "fda": "กำลังดำเนินการ"
   }
  },
  {
   "id": "npd_76",
   "seq": 76,
   "channel": "CJ",
   "name": "แซนวิชไส้กรอกชีส (สูตรใหม่)",
   "category": "Chill",
   "packSize": 1,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่านแล้ว",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "เสร็จแล้ว",
    "labelDesign": "เสร็จแล้ว",
    "labelOrder": "เสร็จแล้ว",
    "labelStock": "เสร็จแล้ว",
    "material": "เสร็จแล้ว",
    "nutrition": "เสร็จแล้ว",
    "shelfLife": "เสร็จแล้ว",
    "fda": "เสร็จแล้ว"
   }
  },
  {
   "id": "npd_77",
   "seq": 77,
   "channel": "CJ",
   "name": "BOGO โบโลน่าลาบ WWN",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "รอข้อมูลจากแอล"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_78",
   "seq": 78,
   "channel": "CJ",
   "name": "BOGO พิซซ่า WWN",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "รอข้อมูลจากแอล"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_79",
   "seq": 79,
   "channel": "CJ",
   "name": "BOGO สังขยา WWN",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "รอข้อมูลจากแอล"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_80",
   "seq": 80,
   "channel": "CJ",
   "name": "ชิฟฟ่อนเรนโบว์",
   "category": "Chill",
   "packSize": 1,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "รอข้อมูลจากแอล"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_81",
   "seq": 81,
   "channel": "CJ",
   "name": "ชิฟฟ่อนไวท์ช็อก",
   "category": "Chill",
   "packSize": 1,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "รอข้อมูลจากแอล"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_82",
   "seq": 82,
   "channel": "CJ",
   "name": "เครปโรลโกโก้ต้าอู๋",
   "category": "Chill",
   "packSize": 6,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "รอข้อมูลจากแอล"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_83",
   "seq": 83,
   "channel": "CJ",
   "name": "แซนวิชทูน่าสลัดซีซ่า",
   "category": "Chill",
   "packSize": 1,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "รอข้อมูลจากแอล"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_84",
   "seq": 84,
   "channel": "CJ",
   "name": "แซนวิชไส้กรอกชีส V.2",
   "category": "Chill",
   "packSize": 1,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "รอข้อมูลจากแอล"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_85",
   "seq": 85,
   "channel": "CJ",
   "name": "แซนวิชแฮมไก่หยองน้ำสลัด",
   "category": "Chill",
   "packSize": 1,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "รอข้อมูลจากแอล"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_86",
   "seq": 86,
   "channel": "CJ",
   "name": "BOGO สัปปะรด ศรีสุดา",
   "category": "Ambient",
   "packSize": 3,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_87",
   "seq": 87,
   "channel": "CJ",
   "name": "BOGO คัสตราด ศรีสุดา",
   "category": "Ambient",
   "packSize": 3,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_88",
   "seq": 88,
   "channel": "CJ",
   "name": "BOGO มะพร้าว ศรีสุดา",
   "category": "Ambient",
   "packSize": 3,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_89",
   "seq": 89,
   "channel": "CJ",
   "name": "BOGO ใบเตย ศรีสุดา",
   "category": "Ambient",
   "packSize": 3,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_90",
   "seq": 90,
   "channel": "CJ",
   "name": "BOGO ไส้กรอกแดงมายองเนส (ศรีสุดา)",
   "category": "Ambient",
   "packSize": 3,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_91",
   "seq": 91,
   "channel": "CJ",
   "name": "BOGO ปูอัดมายองเนส (ศรีสุดา)",
   "category": "Ambient",
   "packSize": 3,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_92",
   "seq": 92,
   "channel": "CJ",
   "name": "BOGO เนยน้ำตาล (ศรีสุดา)",
   "category": "Ambient",
   "packSize": 3,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_93",
   "seq": 93,
   "channel": "CJ",
   "name": "BOGO มะพร้าวสังขยาไข่ ศรีสุดา",
   "category": "Ambient",
   "packSize": 3,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_94",
   "seq": 94,
   "channel": "CJ",
   "name": "BOGO เผือกใบเตย ศรีสุดา",
   "category": "Ambient",
   "packSize": 3,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_95",
   "seq": 95,
   "channel": "CJ",
   "name": "BOGO ช็อกโกแลต (ปั้นกลม) ศรีสุดา",
   "category": "Ambient",
   "packSize": 4,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_96",
   "seq": 96,
   "channel": "CJ",
   "name": "BOGO คัสตราด (ปั้นกลม) ศรีสุดา",
   "category": "Ambient",
   "packSize": 4,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_97",
   "seq": 97,
   "channel": "CJ",
   "name": "BOGO สังขยาไข่ (ปั้นกลม) ศรีสุดา",
   "category": "Ambient",
   "packSize": 4,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_98",
   "seq": 98,
   "channel": "CJ",
   "name": "BOGO ถั่วแดง (ปั้นกลม) ศรีสุดา",
   "category": "Ambient",
   "packSize": 4,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_99",
   "seq": 99,
   "channel": "CJ",
   "name": "BOGO ถั่วดำ (ปั้นกลม) ศรีสุดา",
   "category": "Ambient",
   "packSize": 4,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_100",
   "seq": 100,
   "channel": "CJ",
   "name": "BOGO เผือก (ปั้นกลม) ศรีสุดา",
   "category": "Ambient",
   "packSize": 4,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_101",
   "seq": 101,
   "channel": "CJ",
   "name": "BOGO ใบเตย  (ปั้นกลม) (ไส้ศรีสุดา) ศรีสุดา",
   "category": "Ambient",
   "packSize": 4,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_102",
   "seq": 102,
   "channel": "CJ",
   "name": "BOGO ไก่หยองพริกเผา (ปั้นกลม) ศรีสุดา",
   "category": "Ambient",
   "packSize": 4,
   "developer": "ศรีสุดา",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ไม่ผ่าน",
    "note": "ไม่พัฒนาต่อ"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_103",
   "seq": 103,
   "channel": "Top",
   "name": "แซนวิชแฮมชีส",
   "category": "Chill",
   "packSize": 1,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": "2026-11-01",
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_104",
   "seq": 104,
   "channel": "Top",
   "name": "แซนวิชไส้กรอกชีส",
   "category": "Chill",
   "packSize": 1,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": "2026-11-01",
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_105",
   "seq": 105,
   "channel": "ร้านของฝาก",
   "name": "ขนมเปี๊ยะกุหลาบสายรุ้ง 6 ชิ้น",
   "category": "Ambient",
   "packSize": 6,
   "developer": "RD",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอกำหนดวันให้คุณอู๋ชิมใหม่"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_106",
   "seq": 106,
   "channel": "ร้านของฝาก",
   "name": "ขนมเปี๊ยะกุหลาบสายรุ้ง 12 ชิ้น",
   "category": "Ambient",
   "packSize": 12,
   "developer": "RD",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอกำหนดวันให้คุณอู๋ชิมใหม่"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_107",
   "seq": 107,
   "channel": "โรงเรียนเลินน์",
   "name": "ปังเนยนิ่ม",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_108",
   "seq": 108,
   "channel": "โรงเรียนเลินน์",
   "name": "แซนวิชโบราณ",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_109",
   "seq": 109,
   "channel": "โรงเรียนเลินน์",
   "name": "มินิปังไส้กรอกชีส",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_110",
   "seq": 110,
   "channel": "โรงเรียนเลินน์",
   "name": "คัพเค้กกล้วยหอมไส้ครีมเนยสด",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_111",
   "seq": 111,
   "channel": "โรงเรียนเลินน์",
   "name": "คัพเค้กมะพร้าวไส้ครีมเนยสด",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_112",
   "seq": 112,
   "channel": "โรงเรียนเลินน์",
   "name": "ชิฟฟ่อนสอดไส้ 1 ชิ้น ชิฟฟ่อนเค้ก เลือกรสชาติได้ (มะพร้าว)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_113",
   "seq": 113,
   "channel": "โรงเรียนเลินน์",
   "name": "ชิฟฟ่อนสอดไส้ 1 ชิ้น ชิฟฟ่อนเค้ก เลือกรสชาติได้ (สตอเบอรี่)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_114",
   "seq": 114,
   "channel": "โรงเรียนเลินน์",
   "name": "ชิฟฟ่อนสอดไส้ 1 ชิ้น ชิฟฟ่อนเค้ก เลือกรสชาติได้ (ส้ม)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_115",
   "seq": 115,
   "channel": "โรงเรียนเลินน์",
   "name": "ชิฟฟ่อนสอดไส้ 1 ชิ้น ชิฟฟ่อนเค้ก เลือกรสชาติได้ (บลูเบอรี่)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_116",
   "seq": 116,
   "channel": "โรงเรียนเลินน์",
   "name": "ชิฟฟ่อนสอดไส้ 1 ชิ้น ชิฟฟ่อนเค้ก เลือกรสชาติได้ (นมชมพู)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_117",
   "seq": 117,
   "channel": "โรงเรียนเลินน์",
   "name": "ชิฟฟ่อนสอดไส้ 1 ชิ้น ชิฟฟ่อนเค้ก เลือกรสชาติได้ (ช็อกโกแลต)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_118",
   "seq": 118,
   "channel": "โรงเรียนเลินน์",
   "name": "ชิฟฟ่อนสอดไส้ 1 ชิ้น ชิฟฟ่อนเค้ก เลือกรสชาติได้ (ฝอยทอง)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_119",
   "seq": 119,
   "channel": "โรงเรียนเลินน์",
   "name": "ชิฟฟ่อนสอดไส้ 1 ชิ้น ชิฟฟ่อนเค้ก เลือกรสชาติได้ (วนิลา)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_120",
   "seq": 120,
   "channel": "โรงเรียนเลินน์",
   "name": "ชิฟฟ่อนสอดไส้ 1 ชิ้น ชิฟฟ่อนเค้ก เลือกรสชาติได้ (ใบเตย)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_121",
   "seq": 121,
   "channel": "โรงเรียนเลินน์",
   "name": "ชิฟฟ่อนสอดไส้ 1 ชิ้น ชิฟฟ่อนเค้ก เลือกรสชาติได้ (เมล่อน)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_122",
   "seq": 122,
   "channel": "โรงเรียนเลินน์",
   "name": "ชิฟฟอนไม่มีไส้เเบบเเยกชิ้น เลือกรสชาติได้ (กาแฟ)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_123",
   "seq": 123,
   "channel": "โรงเรียนเลินน์",
   "name": "ชิฟฟอนไม่มีไส้เเบบเเยกชิ้น เลือกรสชาติได้ (ใบเตย)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_124",
   "seq": 124,
   "channel": "โรงเรียนเลินน์",
   "name": "ชิฟฟอนไม่มีไส้เเบบเเยกชิ้น เลือกรสชาติได้ (ชาไทย)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_125",
   "seq": 125,
   "channel": "โรงเรียนเลินน์",
   "name": "ชิฟฟอนไม่มีไส้เเบบเเยกชิ้น เลือกรสชาติได้ (โกโก้)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_126",
   "seq": 126,
   "channel": "โรงเรียนเลินน์",
   "name": "ชิฟฟอนไม่มีไส้เเบบเเยกชิ้น เลือกรสชาติได้ (ส้ม )",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_127",
   "seq": 127,
   "channel": "โรงเรียนเลินน์",
   "name": "ชิฟฟอนไม่มีไส้เเบบเเยกชิ้น เลือกรสชาติได้ (สตอเบอรี่)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_128",
   "seq": 128,
   "channel": "โรงเรียนเลินน์",
   "name": "ชิฟฟอนไม่มีไส้เเบบเเยกชิ้น เลือกรสชาติได้ (มะพร้าว)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_129",
   "seq": 129,
   "channel": "โรงเรียนเลินน์",
   "name": "ชิฟฟอนไม่มีไส้เเบบเเยกชิ้น เลือกรสชาติได้ (เนย)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_130",
   "seq": 130,
   "channel": "โรงเรียนเลินน์",
   "name": "ชิฟฟอนไม่มีไส้เเบบเเยกชิ้น เลือกรสชาติได้ (บลูเบอรี่)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "สินค้าขายปัจจุบัน",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "ผ่าน",
    "note": "รอกำหนดขาย"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "รอต้นทุน",
   "tasks": {
    "cost": "กำลังดำเนินการ",
    "quote": "กำลังดำเนินการ",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_131",
   "seq": 131,
   "channel": "Amazon",
   "name": "BOGO ขนมปังไส้กรอกชีส",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ไม่ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "7/9/2569 ( รอบที่ 2 )"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_132",
   "seq": 132,
   "channel": "Amazon",
   "name": "BOGO ขนมปังช็อกโกแลต",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ไม่ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "7/9/2569 ( รอบที่ 2 )"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_133",
   "seq": 133,
   "channel": "Amazon",
   "name": "BOGO ขนมปังไก่หยองพริกเผา",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ไม่ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "7/9/2569 ( รอบที่ 2 )"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_134",
   "seq": 134,
   "channel": "Amazon",
   "name": "BOGO ขนมปังเนยอัลมอลล์",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ไม่ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "7/9/2569 ( รอบที่ 2 )"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_135",
   "seq": 135,
   "channel": "Amazon",
   "name": "BOGO ขนมปังมะพร้าว",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ไม่ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "7/9/2569 ( รอบที่ 2 )"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_136",
   "seq": 136,
   "channel": "Amazon",
   "name": "BOGO ขนมปังน้ำพริกเซี้ยงไฮ้",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "ไม่ผ่าน",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "7/9/2569 ( รอบที่ 2 )"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_137",
   "seq": 137,
   "channel": "Black Canyon",
   "name": "เค้กสตรอว์เบอร์รีซันเดย์",
   "category": "Chill",
   "packSize": 1,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "7/9/2569 ( รอบที่ 1 )"
   },
   "tasting": [
    {
     "date": "2026-09-07",
     "note": "รอชิม แล้วจึงให้คำตอบ"
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_138",
   "seq": 138,
   "channel": "Black Canyon",
   "name": "เค้กชาไทยมินิทองหยอด",
   "category": "Chill",
   "packSize": 1,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "7/9/2569 ( รอบที่ 1 )"
   },
   "tasting": [
    {
     "date": "2026-09-07",
     "note": "รอชิม แล้วจึงให้คำตอบ"
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_139",
   "seq": 139,
   "channel": "Black Canyon",
   "name": "เค้กกล้วยหอมครีมชีส",
   "category": "Chill",
   "packSize": 1,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "7/9/2569 ( รอบที่ 1 )"
   },
   "tasting": [
    {
     "date": "2026-09-07",
     "note": "รอชิม แล้วจึงให้คำตอบ"
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_140",
   "seq": 140,
   "channel": "Black Canyon",
   "name": "โมจิคุกกี้แอนด์ครีม",
   "category": "Chill",
   "packSize": 2,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "7/9/2569 ( รอบที่ 1 )"
   },
   "tasting": [
    {
     "date": "2026-09-07",
     "note": "รอชิม แล้วจึงให้คำตอบ"
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_141",
   "seq": 141,
   "channel": "Black Canyon",
   "name": "เอแคลร์มะพร้าวอ่อน",
   "category": "Chill",
   "packSize": 6,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "7/9/2569 ( รอบที่ 1 )"
   },
   "tasting": [
    {
     "date": "2026-09-07",
     "note": "รอชิม แล้วจึงให้คำตอบ"
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_142",
   "seq": 142,
   "channel": "Black Canyon",
   "name": "ขนมเปี๊ยะกุหลาบไข่เค็ม",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "7/9/2569 ( รอบที่ 1 )"
   },
   "tasting": [
    {
     "date": "2026-09-07",
     "note": "รอชิม แล้วจึงให้คำตอบ"
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_143",
   "seq": 143,
   "channel": "Black Canyon",
   "name": "ขนมเปี๊ยะกุหลาบใบเตยไข่เค็ม",
   "category": "Ambient",
   "packSize": 4,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "7/9/2569 ( รอบที่ 1 )"
   },
   "tasting": [
    {
     "date": "2026-09-07",
     "note": "รอชิม แล้วจึงให้คำตอบ"
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_144",
   "seq": 144,
   "channel": "Black Canyon",
   "name": "เค้กโรลสังขยาใบเตย",
   "category": "Chill",
   "packSize": 1,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "7/9/2569 ( รอบที่ 1 )"
   },
   "tasting": [
    {
     "date": null,
     "note": "รอชิม แล้วจึงให้คำตอบ"
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_145",
   "seq": 145,
   "channel": "Black Canyon",
   "name": "เค้กโรลกาแฟ",
   "category": "Chill",
   "packSize": 1,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "9/9/2569 ( รอบที่ 1 )"
   },
   "tasting": [
    {
     "date": null,
     "note": "รอชิม แล้วจึงให้คำตอบ"
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_146",
   "seq": 146,
   "channel": "Black Canyon",
   "name": "ครีมออร์นช็อกโกแลต",
   "category": "Chill",
   "packSize": 3,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "9/9/2569 ( รอบที่ 1 )"
   },
   "tasting": [
    {
     "date": null,
     "note": "รอชิม แล้วจึงให้คำตอบ"
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_147",
   "seq": 147,
   "channel": "Black Canyon",
   "name": "ครีมออร์นวิปปิ้งครีม",
   "category": "Chill",
   "packSize": 3,
   "developer": "RD",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "9/9/2569 ( รอบที่ 1 )"
   },
   "tasting": [
    {
     "date": null,
     "note": "รอชิม แล้วจึงให้คำตอบ"
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_148",
   "seq": 148,
   "channel": "CJ",
   "name": "เค้กบานาน่าชีส",
   "category": "Chill",
   "packSize": 1,
   "developer": "RD",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_149",
   "seq": 149,
   "channel": "CJ",
   "name": "ชีสเค้กกริลล์",
   "category": "Chill",
   "packSize": 1,
   "developer": "RD",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_150",
   "seq": 150,
   "channel": "TOP",
   "name": "ข้าวเหนียวมะม่วงครีมชีส",
   "category": "Chill",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "11/9/2569 ( รอบที่ 1 )"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_151",
   "seq": 151,
   "channel": "TOP",
   "name": "บลูเบอร์รีชีชีสพาย",
   "category": "Chill",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "11/9/2569 ( รอบที่ 1 )"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_152",
   "seq": 152,
   "channel": "TOP",
   "name": "สตรอว์เบอร์รีชีสพาย",
   "category": "Chill",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "11/9/2569 ( รอบที่ 1 )"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_153",
   "seq": 153,
   "channel": "TOP",
   "name": "พุดดิ้งเสาวรส",
   "category": "Chill",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "11/9/2569 ( รอบที่ 1 )"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_154",
   "seq": 154,
   "channel": "TOP",
   "name": "พุดดิ้งเลม่อนยูสุ",
   "category": "Chill",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "",
    "note": ""
   },
   "customer": {
    "status": "รอส่งตัวอย่าง",
    "note": "11/9/2569 ( รอบที่ 1 )"
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_155",
   "seq": 155,
   "channel": "ร้านของฝาก",
   "name": "ขนมเปี๊ยะบาร์ไดฟุกุช็อกโกแลตลาวา",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_156",
   "seq": 156,
   "channel": "ร้านของฝาก",
   "name": "ขนมเปี๊ยะบาร์เผือกฝอยทองไข่เค็ม",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_157",
   "seq": 157,
   "channel": "ร้านของฝาก",
   "name": "ขนมเปี๊ยะบาร์ถั่วฝอยทองไข่เค็ม",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_158",
   "seq": 158,
   "channel": "ร้านของฝาก",
   "name": "ขนมเปี๊ยะบาร์ไดฟูกุดูไบช็อกโกแลต",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_159",
   "seq": 159,
   "channel": "ร้านของฝาก",
   "name": "ชิพฟอนทูโทน สตรอว์เบอร์รี + นมฮอกไกโด (สีชมพู + สีขาว)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_160",
   "seq": 160,
   "channel": "ร้านของฝาก",
   "name": "ชิพฟอนทูโทน บลูเบอร์รี + นมฮอกไกโด (สีม่วง + สีขาว)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_161",
   "seq": 161,
   "channel": "ร้านของฝาก",
   "name": "ชิพฟอนทูโทน ช็อกโกแลต + วานิลลา (สีน้ำตาล + สีขาว)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_162",
   "seq": 162,
   "channel": "ร้านของฝาก",
   "name": "ชิพฟอนทูโทน กาแฟ + ช็อกโกแลตโก (สีน้ำตาลอ่อน + สีน้ำตาลเข้ม)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_163",
   "seq": 163,
   "channel": "ร้านของฝาก",
   "name": "ชิพฟอนทูโทน ใบเตย + วานิลา (สีเขียว + สีขาว)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_164",
   "seq": 164,
   "channel": "ร้านของฝาก",
   "name": "ชิพฟอนทูโทน ส้ม + โยเกิร์ต (สีส้ม + สีขาว)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_165",
   "seq": 165,
   "channel": "ร้านของฝาก",
   "name": "ชิพฟอนทูโทน เลม่อน + มะม่วง (สีเขียวมะนาว + สีเหลือง)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_166",
   "seq": 166,
   "channel": "ร้านของฝาก",
   "name": "ชิพฟอนทูโทน สตรอว์เบอร์รี + นมฮอกไกโด (สีชมพู + สีขาว) มีไส้",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_167",
   "seq": 167,
   "channel": "ร้านของฝาก",
   "name": "ชิพฟอนทูโทน บลูเบอร์รี + นมฮอกไกโด (สีม่วง + สีขาว) มีไส้",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_168",
   "seq": 168,
   "channel": "ร้านของฝาก",
   "name": "ชิพฟอนทูโทน ช็อกโกแลต + วานิลลา (สีน้ำตาล + สีขาว) มีไส้",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_169",
   "seq": 169,
   "channel": "ร้านของฝาก",
   "name": "ชิพฟอนทูโทน กาแฟ + ช็อกโกแลตโก (สีน้ำตาลอ่อน + สีน้ำตาลเข้ม) มีไส้",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_170",
   "seq": 170,
   "channel": "ร้านของฝาก",
   "name": "ชิพฟอนทูโทน ใบเตย + วานิลา (สีเขียว + สีขาว) มีไส้",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_171",
   "seq": 171,
   "channel": "ร้านของฝาก",
   "name": "ชิพฟอนทูโทน ส้ม + โยเกิร์ต (สีส้ม + สีขาว) มีไส้",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_172",
   "seq": 172,
   "channel": "ร้านของฝาก",
   "name": "ชิพฟอนทูโทน เลม่อน + มะม่วง (สีเขียวมะนาว + สีเหลือง) มีไส้",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_173",
   "seq": 173,
   "channel": "ร้านของฝาก",
   "name": "ชิฟฟอนบาร์ ไก่หยองน้ำสลัด",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_174",
   "seq": 174,
   "channel": "ร้านของฝาก",
   "name": "ชิฟฟอนบาร์ มะพร้าวใบเตย",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_175",
   "seq": 175,
   "channel": "ร้านของฝาก",
   "name": "ชิฟฟอนบาร์ ใบเตยหอม",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_176",
   "seq": 176,
   "channel": "ร้านของฝาก",
   "name": "ชิฟฟอนบาร์ ช็อกโกแลตลาวา",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_177",
   "seq": 177,
   "channel": "ร้านของฝาก",
   "name": "ขนมเวียดนามหมีสีเขียว",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_178",
   "seq": 178,
   "channel": "Big C",
   "name": "ชิพฟอนทรงกลม สปรองค์ฟองน้ำ (มีดริฟซอสสไลด์น้ำผึ้ง หรือจะเป็นซันไลเรม่อน + วิปครีมโฟม)",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_179",
   "seq": 179,
   "channel": "ร้านของฝาก",
   "name": "เบาหวิว สปรองค์ฟองน้ำ",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_180",
   "seq": 180,
   "channel": "ร้านของฝาก",
   "name": "ขนมเปี๊ยะหอม เผือกไข่เค็ม",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_181",
   "seq": 181,
   "channel": "ร้านของฝาก",
   "name": "ขนมเปี๊ยะหอม ถั่วไข่เค็ม",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_182",
   "seq": 182,
   "channel": "ร้านของฝาก",
   "name": "ขนมเปี๊ยะหอม ฝอยทองไข่เค็ม",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_183",
   "seq": 183,
   "channel": "ร้านของฝาก",
   "name": "ขนมเปี๊ยะโบราณ ฟักฝอยทองไข่เค็ม",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_184",
   "seq": 184,
   "channel": "ร้านของฝาก",
   "name": "Little animal cake ขนมเค้กซีรีส์สัตว์",
   "category": "Ambient",
   "packSize": 1,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_185",
   "seq": 185,
   "channel": "สินค้าแพ็กเกจจีน",
   "name": "กล่องครึ่งวงกลมซีกส้ม > ชิฟฟอน",
   "category": "Ambient",
   "packSize": 4,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_186",
   "seq": 186,
   "channel": "สินค้าแพ็กเกจจีน",
   "name": "กล่องใหญ่สี่เหลี่ยมสีส้ม > ขนมไหว้พระจันทร์ และขนมเปี๊ยะหอม",
   "category": "Ambient",
   "packSize": 8,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  },
  {
   "id": "npd_187",
   "seq": 187,
   "channel": "สินค้าแพ็กเกจจีน",
   "name": "กล่องกลมอวกาศ > ขนมไหว้พระจันทร์ และขนมเปี๊ยะหอม",
   "category": "Ambient",
   "packSize": 8,
   "developer": "Khun.Arm",
   "owner": {
    "status": "กำลังพัฒนา",
    "note": "รอชิม"
   },
   "customer": {
    "status": "",
    "note": ""
   },
   "tasting": [
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    },
    {
     "date": null,
     "note": ""
    }
   ],
   "sellDate": null,
   "sellDateNote": "",
   "tasks": {
    "cost": "",
    "quote": "",
    "labelDesign": "",
    "labelOrder": "",
    "labelStock": "",
    "material": "",
    "nutrition": "",
    "shelfLife": "",
    "fda": ""
   }
  }
 ],
 "cancelItems": [
  {
   "id": "cxl_1",
   "seq": 1,
   "channel": "CJ",
   "code": "20065595",
   "name": "บันแฮมชีส (ถุงใส)",
   "category": "Ambient",
   "packSize": 4,
   "date": "2026-08-28",
   "dateNote": "",
   "reasons": [
    "ยอดขายไม่เป็นไปตามเป้าหมาย",
    "คุณภาพสินค้า"
   ],
   "stock": {
    "packaging": {
     "warehouse": 60080,
     "staff": 9200,
     "total": 69280
    },
    "sticker": {
     "warehouse": 5000,
     "staff": 5600,
     "total": 10600
    }
   },
   "notify": {
    "team": "เรียบร้อย",
    "plan": "เรียบร้อย",
    "prod": "เรียบร้อย",
    "store": "เรียบร้อย"
   }
  },
  {
   "id": "cxl_2",
   "seq": 2,
   "channel": "CJ",
   "code": "20065596",
   "name": "บันฝอยทองน้ำสลัด (ถุงใส)",
   "category": "Ambient",
   "packSize": 4,
   "date": "2026-08-28",
   "dateNote": "",
   "reasons": [],
   "stock": {
    "packaging": {
     "warehouse": null,
     "staff": null,
     "total": null
    },
    "sticker": {
     "warehouse": 5000,
     "staff": 6000,
     "total": 11000
    }
   },
   "notify": {
    "team": "เรียบร้อย",
    "plan": "เรียบร้อย",
    "prod": "เรียบร้อย",
    "store": "เรียบร้อย"
   }
  },
  {
   "id": "cxl_3",
   "seq": 3,
   "channel": "CJ",
   "code": "20065594",
   "name": "บันปูอัดมายองเนส (ถุงใส)",
   "category": "Ambient",
   "packSize": 4,
   "date": "2026-08-28",
   "dateNote": "",
   "reasons": [],
   "stock": {
    "packaging": {
     "warehouse": null,
     "staff": null,
     "total": null
    },
    "sticker": {
     "warehouse": 0,
     "staff": 4000,
     "total": 4000
    }
   },
   "notify": {
    "team": "เรียบร้อย",
    "plan": "เรียบร้อย",
    "prod": "เรียบร้อย",
    "store": "เรียบร้อย"
   }
  },
  {
   "id": "cxl_4",
   "seq": 4,
   "channel": "Amazon",
   "code": "1006983",
   "name": "ชิฟฟ่อนมะพร้าวลาวา",
   "category": "Chill",
   "packSize": 1,
   "date": null,
   "dateNote": "สินค้าใหม่เข้าจึงถอด",
   "reasons": [
    "ยอดขายไม่เป็นไปตามเป้าหมาย"
   ],
   "stock": {
    "packaging": {
     "warehouse": null,
     "staff": null,
     "total": null
    },
    "sticker": {
     "warehouse": null,
     "staff": null,
     "total": null
    }
   },
   "notify": {
    "team": "เรียบร้อย",
    "plan": "เรียบร้อย",
    "prod": "เรียบร้อย",
    "store": "เรียบร้อย"
   }
  },
  {
   "id": "cxl_5",
   "seq": 5,
   "channel": "Amazon",
   "code": "1006982",
   "name": "ชูครีมไส้ครีมนมฮอกไกโด",
   "category": "Chill",
   "packSize": 1,
   "date": null,
   "dateNote": "สินค้าใหม่เข้าจึงถอด",
   "reasons": [
    "ยอดขายไม่เป็นไปตามเป้าหมาย"
   ],
   "stock": {
    "packaging": {
     "warehouse": null,
     "staff": null,
     "total": null
    },
    "sticker": {
     "warehouse": null,
     "staff": null,
     "total": null
    }
   },
   "notify": {
    "team": "เรียบร้อย",
    "plan": "เรียบร้อย",
    "prod": "เรียบร้อย",
    "store": "เรียบร้อย"
   }
  },
  {
   "id": "cxl_6",
   "seq": 6,
   "channel": "Amazon",
   "code": "1006980",
   "name": "แพนเค้กฝอยทองครีมสด",
   "category": "Chill",
   "packSize": 1,
   "date": null,
   "dateNote": "สินค้าใหม่เข้าจึงถอด",
   "reasons": [
    "ยอดขายไม่เป็นไปตามเป้าหมาย"
   ],
   "stock": {
    "packaging": {
     "warehouse": null,
     "staff": null,
     "total": null
    },
    "sticker": {
     "warehouse": null,
     "staff": null,
     "total": null
    }
   },
   "notify": {
    "team": "เรียบร้อย",
    "plan": "เรียบร้อย",
    "prod": "เรียบร้อย",
    "store": "เรียบร้อย"
   }
  },
  {
   "id": "cxl_7",
   "seq": 7,
   "channel": "Amazon",
   "code": "1006979",
   "name": "คัพเค้กไส้คัสตาร์ด",
   "category": "Chill",
   "packSize": 1,
   "date": null,
   "dateNote": "สินค้าใหม่เข้าจึงถอด",
   "reasons": [
    "ยอดขายไม่เป็นไปตามเป้าหมาย"
   ],
   "stock": {
    "packaging": {
     "warehouse": null,
     "staff": null,
     "total": null
    },
    "sticker": {
     "warehouse": null,
     "staff": null,
     "total": null
    }
   },
   "notify": {
    "team": "เรียบร้อย",
    "plan": "เรียบร้อย",
    "prod": "เรียบร้อย",
    "store": "เรียบร้อย"
   }
  },
  {
   "id": "cxl_8",
   "seq": 8,
   "channel": "Amazon",
   "code": "1007017",
   "name": "มัลเบอรี่ชีสพาย",
   "category": "Chill",
   "packSize": 1,
   "date": null,
   "dateNote": "สินค้าใหม่เข้าจึงถอด",
   "reasons": [
    "ยอดขายไม่เป็นไปตามเป้าหมาย"
   ],
   "stock": {
    "packaging": {
     "warehouse": null,
     "staff": null,
     "total": null
    },
    "sticker": {
     "warehouse": null,
     "staff": null,
     "total": null
    }
   },
   "notify": {
    "team": "เรียบร้อย",
    "plan": "เรียบร้อย",
    "prod": "เรียบร้อย",
    "store": "เรียบร้อย"
   }
  },
  {
   "id": "cxl_9",
   "seq": 9,
   "channel": "Amazon",
   "code": "1007015",
   "name": "เค้กกล้วยหอมคาราเมล",
   "category": "Chill",
   "packSize": 1,
   "date": null,
   "dateNote": "สินค้าใหม่เข้าจึงถอด",
   "reasons": [
    "ยอดขายไม่เป็นไปตามเป้าหมาย"
   ],
   "stock": {
    "packaging": {
     "warehouse": null,
     "staff": null,
     "total": null
    },
    "sticker": {
     "warehouse": null,
     "staff": null,
     "total": null
    }
   },
   "notify": {
    "team": "เรียบร้อย",
    "plan": "เรียบร้อย",
    "prod": "เรียบร้อย",
    "store": "เรียบร้อย"
   }
  },
  {
   "id": "cxl_10",
   "seq": 10,
   "channel": "Amazon",
   "code": "1007019",
   "name": "ชิฟฟ่อนสตอเบอรี่นมสด",
   "category": "Chill",
   "packSize": 1,
   "date": null,
   "dateNote": "สินค้าใหม่เข้าจึงถอด",
   "reasons": [
    "ยอดขายไม่เป็นไปตามเป้าหมาย"
   ],
   "stock": {
    "packaging": {
     "warehouse": null,
     "staff": null,
     "total": null
    },
    "sticker": {
     "warehouse": null,
     "staff": null,
     "total": null
    }
   },
   "notify": {
    "team": "เรียบร้อย",
    "plan": "เรียบร้อย",
    "prod": "เรียบร้อย",
    "store": "เรียบร้อย"
   }
  },
  {
   "id": "cxl_11",
   "seq": 11,
   "channel": "Amazon",
   "code": "1007018",
   "name": "เค้กโรลมะพร้าวใบเตย",
   "category": "Chill",
   "packSize": 1,
   "date": null,
   "dateNote": "สินค้าใหม่เข้าจึงถอด",
   "reasons": [
    "ยอดขายไม่เป็นไปตามเป้าหมาย"
   ],
   "stock": {
    "packaging": {
     "warehouse": null,
     "staff": null,
     "total": null
    },
    "sticker": {
     "warehouse": null,
     "staff": null,
     "total": null
    }
   },
   "notify": {
    "team": "เรียบร้อย",
    "plan": "เรียบร้อย",
    "prod": "เรียบร้อย",
    "store": "เรียบร้อย"
   }
  }
 ]
};
