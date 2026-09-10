/* sticker-data.js — ข้อมูลตั้งต้นสติ๊กเกอร์สินค้า
   ที่มา: Google Sheet "ตารางอัพเดทสติ๊กเกอร์"
   โครงสร้าง: categories > items
   ผู้ใช้แก้ไขผ่านหน้าเว็บเก็บใน localStorage แยกจากข้อมูลตั้งต้น */
var STICKER_DEFAULT_DATA = {
  version: '20260821a',
  asOf: '2026-08-21',
  source: 'ตารางอัพเดทสติ๊กเกอร์',
  leadTimeDays: 30,
  categories: [
    {
      name: 'สติกเกอร์ สินค้า CJ',
      items: [
        {
          code: '20039044', version: 'V6-20251111', barcode: '8857125000567',
          name: 'นวนัชเอแคลร์นมสด 125g',
          stockPacking: 3955, stockWip: 1086, stockFg: 3345, totalRemaining: 37955,
          avgPoPerDay: 2000, daysRemaining: 18.98,
          minStock: 15, maxStock: 45, orderQty: 0,
          prStatus: '', prDate: '', expectedReceiveDate: '',
          salesApproval: '', tracking: '', note: ''
        },
        {
          code: '20039051', version: 'V4-20260301', barcode: '8857125000574',
          name: 'นวนัชเอแคลร์ช็อกโกแลต 125g',
          stockPacking: 1200, stockWip: 500, stockFg: 1800, totalRemaining: 12500,
          avgPoPerDay: 1500, daysRemaining: 8.33,
          minStock: 15, maxStock: 45, orderQty: 55000,
          prStatus: 'opened', prDate: '2026-08-15', expectedReceiveDate: '2026-09-14',
          salesApproval: 'อนุมัติ', tracking: 'รอสินค้าจากโรงพิมพ์', note: 'สต็อกใกล้หมด เร่งด่วน'
        },
        {
          code: '20039068', version: 'V3-20260115', barcode: '8857125000581',
          name: 'นวนัชเอแคลร์สตรอว์เบอร์รี 125g',
          stockPacking: 5200, stockWip: 2100, stockFg: 4800, totalRemaining: 52100,
          avgPoPerDay: 1200, daysRemaining: 43.42,
          minStock: 15, maxStock: 45, orderQty: 0,
          prStatus: '', prDate: '', expectedReceiveDate: '',
          salesApproval: '', tracking: '', note: ''
        },
        {
          code: '20039075', version: 'V5-20260501', barcode: '8857125000598',
          name: 'นวนัชพัฟครีมวานิลลา 80g',
          stockPacking: 800, stockWip: 300, stockFg: 900, totalRemaining: 8200,
          avgPoPerDay: 1800, daysRemaining: 4.56,
          minStock: 15, maxStock: 45, orderQty: 72800,
          prStatus: 'approved', prDate: '2026-08-10', expectedReceiveDate: '2026-09-09',
          salesApproval: 'อนุมัติ', tracking: 'โรงพิมพ์กำลังผลิต', note: 'วิกฤต - แจ้งโรงงานเร่งผลิต'
        },
        {
          code: '20039082', version: 'V2-20260201', barcode: '8857125000604',
          name: 'นวนัชโดนัทเคลือบน้ำตาล 6ชิ้น',
          stockPacking: 4500, stockWip: 1800, stockFg: 3200, totalRemaining: 42500,
          avgPoPerDay: 1300, daysRemaining: 32.69,
          minStock: 15, maxStock: 45, orderQty: 0,
          prStatus: '', prDate: '', expectedReceiveDate: '',
          salesApproval: '', tracking: '', note: ''
        },
        {
          code: '20039099', version: 'V3-20260601', barcode: '8857125000611',
          name: 'นวนัชครัวซองต์เนยสด 4ชิ้น',
          stockPacking: 2200, stockWip: 900, stockFg: 2000, totalRemaining: 21000,
          avgPoPerDay: 900, daysRemaining: 23.33,
          minStock: 15, maxStock: 45, orderQty: 0,
          prStatus: '', prDate: '', expectedReceiveDate: '',
          salesApproval: '', tracking: '', note: ''
        }
      ]
    },
    {
      name: 'สติกเกอร์ สินค้า Own Brand',
      items: [
        {
          code: '30051001', version: 'V8-20260701', barcode: '8857125001001',
          name: 'วรรณวนัชเค้กกล้วยหอม 200g',
          stockPacking: 6200, stockWip: 2500, stockFg: 5800, totalRemaining: 65000,
          avgPoPerDay: 2500, daysRemaining: 26.0,
          minStock: 15, maxStock: 45, orderQty: 0,
          prStatus: '', prDate: '', expectedReceiveDate: '',
          salesApproval: '', tracking: '', note: ''
        },
        {
          code: '30051002', version: 'V5-20260301', barcode: '8857125001018',
          name: 'วรรณวนัชเค้กช็อกโกแลต 200g',
          stockPacking: 1500, stockWip: 600, stockFg: 1200, totalRemaining: 14800,
          avgPoPerDay: 2200, daysRemaining: 6.73,
          minStock: 15, maxStock: 45, orderQty: 84200,
          prStatus: 'ordered', prDate: '2026-08-05', expectedReceiveDate: '2026-09-04',
          salesApproval: 'อนุมัติ', tracking: 'สั่งผลิตแล้ว รอส่ง', note: 'สินค้าขายดี สต็อกหมดเร็ว'
        },
        {
          code: '30051003', version: 'V4-20260401', barcode: '8857125001025',
          name: 'วรรณวนัชขนมปังแซนด์วิช 400g',
          stockPacking: 3800, stockWip: 1200, stockFg: 3500, totalRemaining: 38500,
          avgPoPerDay: 1100, daysRemaining: 35.0,
          minStock: 15, maxStock: 45, orderQty: 0,
          prStatus: '', prDate: '', expectedReceiveDate: '',
          salesApproval: '', tracking: '', note: ''
        },
        {
          code: '30051004', version: 'V6-20260601', barcode: '8857125001032',
          name: 'วรรณวนัชเค้กมะพร้าว 200g',
          stockPacking: 950, stockWip: 400, stockFg: 800, totalRemaining: 9150,
          avgPoPerDay: 800, daysRemaining: 11.44,
          minStock: 15, maxStock: 45, orderQty: 26850,
          prStatus: 'opened', prDate: '2026-08-18', expectedReceiveDate: '2026-09-17',
          salesApproval: 'รออนุมัติ', tracking: 'เปิด PR แล้ว รอฝ่ายจัดซื้อ', note: ''
        },
        {
          code: '30051005', version: 'V3-20260201', barcode: '8857125001049',
          name: 'วรรณวนัชบราวนี่ดาร์กช็อก 150g',
          stockPacking: 7500, stockWip: 3000, stockFg: 6200, totalRemaining: 72000,
          avgPoPerDay: 1600, daysRemaining: 45.0,
          minStock: 15, maxStock: 45, orderQty: 0,
          prStatus: '', prDate: '', expectedReceiveDate: '',
          salesApproval: '', tracking: '', note: ''
        },
        {
          code: '30051006', version: 'V2-20260101', barcode: '8857125001056',
          name: 'วรรณวนัชคุกกี้เนยสด 120g',
          stockPacking: 2800, stockWip: 1100, stockFg: 2400, totalRemaining: 27300,
          avgPoPerDay: 950, daysRemaining: 28.74,
          minStock: 15, maxStock: 45, orderQty: 0,
          prStatus: '', prDate: '', expectedReceiveDate: '',
          salesApproval: '', tracking: '', note: ''
        }
      ]
    },
    {
      name: 'สติกเกอร์ สินค้า OEM',
      items: [
        {
          code: '40061001', version: 'V3-20260501', barcode: '8857125002001',
          name: 'OEM พายช็อกโกแลต 90g (บริษัท A)',
          stockPacking: 500, stockWip: 200, stockFg: 400, totalRemaining: 4800,
          avgPoPerDay: 600, daysRemaining: 8.0,
          minStock: 15, maxStock: 45, orderQty: 22200,
          prStatus: 'opened', prDate: '2026-08-19', expectedReceiveDate: '2026-09-18',
          salesApproval: 'รออนุมัติ', tracking: 'รอฝ่ายขายอนุมัติ', note: 'ลูกค้าแจ้งเพิ่มออเดอร์'
        },
        {
          code: '40061002', version: 'V2-20260301', barcode: '8857125002018',
          name: 'OEM เค้กมะม่วง 180g (บริษัท B)',
          stockPacking: 4200, stockWip: 1800, stockFg: 3600, totalRemaining: 41600,
          avgPoPerDay: 850, daysRemaining: 48.94,
          minStock: 15, maxStock: 45, orderQty: 0,
          prStatus: '', prDate: '', expectedReceiveDate: '',
          salesApproval: '', tracking: '', note: ''
        },
        {
          code: '40061003', version: 'V4-20260601', barcode: '8857125002025',
          name: 'OEM ขนมปังไส้ครีม 150g (บริษัท C)',
          stockPacking: 1800, stockWip: 700, stockFg: 1500, totalRemaining: 17500,
          avgPoPerDay: 1200, daysRemaining: 14.58,
          minStock: 15, maxStock: 45, orderQty: 36500,
          prStatus: '', prDate: '', expectedReceiveDate: '',
          salesApproval: '', tracking: '', note: 'ใกล้ถึงจุดสั่งซื้อ'
        },
        {
          code: '40061004', version: 'V1-20260101', barcode: '8857125002032',
          name: 'OEM โดนัทมินิ 12ชิ้น (บริษัท A)',
          stockPacking: 3100, stockWip: 1400, stockFg: 2800, totalRemaining: 33100,
          avgPoPerDay: 700, daysRemaining: 47.29,
          minStock: 15, maxStock: 45, orderQty: 0,
          prStatus: '', prDate: '', expectedReceiveDate: '',
          salesApproval: '', tracking: '', note: ''
        },
        {
          code: '40061005', version: 'V2-20260401', barcode: '8857125002049',
          name: 'OEM วาฟเฟิลกรอบ 100g (บริษัท D)',
          stockPacking: 600, stockWip: 250, stockFg: 500, totalRemaining: 5350,
          avgPoPerDay: 450, daysRemaining: 11.89,
          minStock: 15, maxStock: 45, orderQty: 14900,
          prStatus: 'received', prDate: '2026-07-20', expectedReceiveDate: '2026-08-19',
          salesApproval: 'อนุมัติ', tracking: 'รับของเรียบร้อย', note: 'ล็อตใหม่เข้าแล้ว 20/08'
        }
      ]
    }
  ]
};
