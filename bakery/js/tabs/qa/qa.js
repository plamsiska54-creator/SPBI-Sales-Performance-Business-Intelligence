/**
 * Q&A Tab Module - "ถาม-ตอบ สินค้า"
 * ช่วยตอบว่า "เราควรเสนอขนมชนิดไหนดีในช่วงนี้"
 * Hardcoded demo data สำหรับธุรกิจเบเกอรี่ ช่วง ส.ค.-ก.ย. 2569
 */

let mountId = 0;
const STYLE_ID = 'style-qa';

/* ============================================================
   Demo Data — คำถามและคำตอบ
   ============================================================ */

const QUESTIONS = [
  { id: 'best-seller', icon: '\u{1F525}', text: 'ขนมอะไรขายดีสุดตอนนี้?' },
  { id: 'mt-recommend', icon: '\u{1F3EA}', text: 'ควรเสนอขนมอะไรให้ Modern Trade ช่วงนี้?' },
  { id: 'high-margin', icon: '\u{1F4B0}', text: 'ขนมอะไรกำไรดีที่สุด?' },
  { id: 'back-to-school', icon: '\u{1F393}', text: 'เทรนด์ขนมช่วงเปิดเทอม (ส.ค.-ก.ย.) คืออะไร?' },
  { id: 'cvs-fit', icon: '\u{1F3AA}', text: 'ขนมอะไรเหมาะกับร้านสะดวกซื้อ?' },
  { id: 'competitor', icon: '\u{1F50D}', text: 'คู่แข่งกำลังดันสินค้าตัวไหน?' },
  { id: 'promo', icon: '\u{1F3AF}', text: 'สินค้าตัวไหนควรทำโปรโมชัน?' },
  { id: 'health', icon: '\u{1F96C}', text: 'ขนมอะไรเหมาะกับลูกค้ากลุ่มสุขภาพ?' },
];

const ANSWERS = {
  'best-seller': {
    title: 'สินค้าขายดีสุดช่วง ส.ค. 2569',
    summary: 'โดนัทและครัวซองต์เป็นหมวดที่เติบโตเร็วที่สุดจากเทรนด์คาเฟ่และ Social Media',
    items: [
      {
        name: 'โดนัท (Donut)',
        priority: 'high',
        reason: 'กระแส Social Media ดันยอดขายพุ่ง โดยเฉพาะโดนัทไส้ครีมและโดนัทท็อปปิ้งสีสันสดใส',
        stats: [
          { label: 'อัตราเติบโต', value: '+22% YoY' },
          { label: 'ยอดขายเฉลี่ย/เดือน', value: '฿4.2M' },
          { label: 'Gross Margin', value: '58%' },
        ],
        period: 'ส.ค. - ต.ค. 2569',
        channels: ['ร้านสาขา', 'ออนไลน์', 'คาเฟ่'],
      },
      {
        name: 'ครัวซองต์ (Croissant)',
        priority: 'high',
        reason: 'เทรนด์คาเฟ่พรีเมียมทำให้ครัวซองต์เนยสดเป็นที่นิยม โดยเฉพาะ Croffle (ครัวซองต์+วาฟเฟิล)',
        stats: [
          { label: 'อัตราเติบโต', value: '+18% YoY' },
          { label: 'ยอดขายเฉลี่ย/เดือน', value: '฿3.5M' },
          { label: 'Gross Margin', value: '55%' },
        ],
        period: 'ส.ค. - ธ.ค. 2569',
        channels: ['คาเฟ่', 'ร้านสาขา', 'Delivery'],
      },
      {
        name: 'ขนมปังแซนด์วิช (Sandwich Bread)',
        priority: 'medium',
        reason: 'สินค้าหลักที่เติบโตต่อเนื่อง เหมาะกับ Modern Trade ที่ต้องการสินค้า volume สูง',
        stats: [
          { label: 'อัตราเติบโต', value: '+14% YoY' },
          { label: 'ยอดขายเฉลี่ย/เดือน', value: '฿6.8M' },
          { label: 'Gross Margin', value: '42%' },
        ],
        period: 'ตลอดปี',
        channels: ['Modern Trade', 'ซูเปอร์มาร์เก็ต', 'สะดวกซื้อ'],
      },
    ],
  },

  'mt-recommend': {
    title: 'สินค้าแนะนำสำหรับ Modern Trade ช่วง ส.ค.-ก.ย. 2569',
    summary: 'Modern Trade ต้องการสินค้าที่ Shelf Life ยาว หมุนเวียนเร็ว และมีแบรนด์รองรับ',
    items: [
      {
        name: 'ขนมปังแซนด์วิช (Sandwich Bread)',
        priority: 'high',
        reason: 'เป็น staple product ที่ลูกค้าซื้อประจำ Turn Rate สูง เหมาะกับ planogram หลัก',
        stats: [
          { label: 'อัตราเติบโต', value: '+14% YoY' },
          { label: 'Turn Rate', value: '4.2x/สัปดาห์' },
          { label: 'Gross Margin', value: '42%' },
        ],
        period: 'ตลอดปี',
        channels: ['Big C', 'Lotus\'s', 'Tops', 'Makro'],
      },
      {
        name: 'คุกกี้เนยสด (Butter Cookies)',
        priority: 'high',
        reason: 'Margin สูงมาก เหมาะกับ Gondola End และโซนของฝาก Shelf Life 3-6 เดือน',
        stats: [
          { label: 'Gross Margin', value: '68%' },
          { label: 'ยอดขายเฉลี่ย/เดือน', value: '฿2.8M' },
          { label: 'Shelf Life', value: '180 วัน' },
        ],
        period: 'ส.ค. - ธ.ค. (ช่วงของขวัญ)',
        channels: ['Big C', 'Tops', 'Gourmet Market'],
      },
      {
        name: 'เค้กวันเกิด (Birthday Cake)',
        priority: 'medium',
        reason: 'ตลาดขนาดใหญ่ สั่งล่วงหน้าผ่าน Counter ใน MT ได้ ช่วยดึงลูกค้าเข้าร้าน',
        stats: [
          { label: 'ขนาดตลาด', value: '฿2.1B' },
          { label: 'Avg. Order Value', value: '฿450' },
          { label: 'Gross Margin', value: '52%' },
        ],
        period: 'ตลอดปี (พีคช่วงปลายปี)',
        channels: ['Tops', 'Gourmet Market', 'Central Food Hall'],
      },
      {
        name: 'พายสับปะรด (Pineapple Pie)',
        priority: 'interesting',
        reason: 'ของฝากยอดนิยมจากจีนและไต้หวัน เหมาะวางโซนท่องเที่ยว/สนามบิน/ของฝาก',
        stats: [
          { label: 'อัตราเติบโต', value: '+12% YoY' },
          { label: 'ยอดขายเฉลี่ย/เดือน', value: '฿1.9M' },
          { label: 'Shelf Life', value: '90 วัน' },
        ],
        period: 'ต.ค. - ก.พ. (ช่วงท่องเที่ยว)',
        channels: ['Tops', 'King Power', 'ร้านของฝาก'],
      },
    ],
  },

  'high-margin': {
    title: 'สินค้า Gross Margin สูงสุด',
    summary: 'คุกกี้เนยสดครองแชมป์ Margin ตามด้วยครัวซองต์และเค้ก ควรเพิ่มสัดส่วนใน Portfolio',
    items: [
      {
        name: 'คุกกี้เนยสด (Butter Cookies)',
        priority: 'high',
        reason: 'ต้นทุนวัตถุดิบต่ำ ราคาขายพรีเมียมได้ Shelf Life ยาว ลด waste เกือบเป็นศูนย์',
        stats: [
          { label: 'Gross Margin', value: '68%' },
          { label: 'Net Margin', value: '45%' },
          { label: 'ยอดขายเฉลี่ย/เดือน', value: '฿2.8M' },
        ],
        period: 'ตลอดปี (พีคเทศกาล)',
        channels: ['ทุกช่องทาง'],
      },
      {
        name: 'โดนัท (Donut)',
        priority: 'high',
        reason: 'ต้นทุนแป้งต่ำ Topping หลากหลายทำราคาพรีเมียมได้ ขายดีทุกช่องทาง',
        stats: [
          { label: 'Gross Margin', value: '58%' },
          { label: 'Net Margin', value: '38%' },
          { label: 'อัตราเติบโต', value: '+22% YoY' },
        ],
        period: 'ตลอดปี',
        channels: ['ร้านสาขา', 'ออนไลน์', 'Delivery'],
      },
      {
        name: 'ครัวซองต์ (Croissant)',
        priority: 'medium',
        reason: 'วัตถุดิบเนยแพงขึ้น แต่ราคาขายยืดหยุ่นสูง ลูกค้ายอมจ่ายเพราะ perceived value',
        stats: [
          { label: 'Gross Margin', value: '55%' },
          { label: 'Net Margin', value: '33%' },
          { label: 'อัตราเติบโต', value: '+18% YoY' },
        ],
        period: 'ตลอดปี',
        channels: ['คาเฟ่', 'ร้านสาขา', 'Delivery'],
      },
      {
        name: 'เค้กวันเกิด (Birthday Cake)',
        priority: 'medium',
        reason: 'สั่งทำตามออเดอร์ ไม่มี waste Avg. Order Value สูง',
        stats: [
          { label: 'Gross Margin', value: '52%' },
          { label: 'Net Margin', value: '35%' },
          { label: 'Avg. Order Value', value: '฿450' },
        ],
        period: 'ตลอดปี',
        channels: ['ร้านสาขา', 'ออนไลน์', 'Modern Trade'],
      },
    ],
  },

  'back-to-school': {
    title: 'เทรนด์ขนมช่วงเปิดเทอม (ส.ค.-ก.ย. 2569)',
    summary: 'ช่วงเปิดเทอมยอดขายขนมปัง แซนด์วิช และ Snack พุ่ง เน้นสินค้าพกพาสะดวก ราคาจับต้องได้',
    items: [
      {
        name: 'ขนมปังแซนด์วิช (Sandwich Bread)',
        priority: 'high',
        reason: 'ผู้ปกครองซื้อทำอาหารเช้าให้ลูก ยอดขายพุ่งทุกปีช่วงเปิดเทอม',
        stats: [
          { label: 'ยอดขายเพิ่มขึ้น', value: '+28% vs ก.ค.' },
          { label: 'กลุ่มลูกค้าหลัก', value: 'ครอบครัว' },
          { label: 'ราคาเฉลี่ย', value: '฿35-55/ถุง' },
        ],
        period: 'ส.ค. - ก.ย. 2569',
        channels: ['Modern Trade', 'สะดวกซื้อ', 'ซูเปอร์มาร์เก็ต'],
      },
      {
        name: 'โดนัท (Donut)',
        priority: 'high',
        reason: 'เด็กนักเรียนนิยมเป็น Snack ราคาถูก สีสันสดใส ดึงดูดกลุ่ม Gen Z',
        stats: [
          { label: 'อัตราเติบโต', value: '+22% YoY' },
          { label: 'กลุ่มลูกค้าหลัก', value: 'นักเรียน/นักศึกษา' },
          { label: 'ราคาเฉลี่ย', value: '฿20-45/ชิ้น' },
        ],
        period: 'ส.ค. - ก.ย. 2569',
        channels: ['ร้านสาขา', 'สะดวกซื้อ', 'โรงเรียน'],
      },
      {
        name: 'ขนมปังโฮลวีท (Whole Wheat Bread)',
        priority: 'medium',
        reason: 'ผู้ปกครองรุ่นใหม่ใส่ใจสุขภาพ เลือกซื้อขนมปังโฮลวีทให้ลูกมากขึ้น',
        stats: [
          { label: 'อัตราเติบโต', value: '+25% YoY' },
          { label: 'กลุ่มลูกค้าหลัก', value: 'ครอบครัวรุ่นใหม่' },
          { label: 'Gross Margin', value: '48%' },
        ],
        period: 'ตลอดปี (พีคเปิดเทอม)',
        channels: ['Modern Trade', 'ซูเปอร์มาร์เก็ต'],
      },
    ],
  },

  'cvs-fit': {
    title: 'สินค้าเหมาะกับร้านสะดวกซื้อ',
    summary: 'ร้านสะดวกซื้อต้องการสินค้าที่ Shelf Life ยาว ขนาดพอดีคำ กินได้ทันที ราคาไม่เกิน ฿50',
    items: [
      {
        name: 'โดนัท (Donut)',
        priority: 'high',
        reason: 'แพ็คชิ้นเดียว ราคาจับต้องได้ ขนาดพอดีมือ เหมาะกินเป็น Snack ระหว่างวัน',
        stats: [
          { label: 'ราคาขายปลีก', value: '฿25-35/ชิ้น' },
          { label: 'Turn Rate', value: '5x/สัปดาห์' },
          { label: 'Gross Margin', value: '58%' },
        ],
        period: 'ตลอดปี',
        channels: ['7-Eleven', 'FamilyMart', 'Lawson', 'CJ'],
      },
      {
        name: 'ขนมปังแซนด์วิช (Sandwich Bread)',
        priority: 'high',
        reason: 'สินค้า must-have ของ CVS ลูกค้าซื้อทำอาหารเช้า/กลางวัน',
        stats: [
          { label: 'ราคาขายปลีก', value: '฿39-55/ถุง' },
          { label: 'Turn Rate', value: '4x/สัปดาห์' },
          { label: 'Gross Margin', value: '42%' },
        ],
        period: 'ตลอดปี',
        channels: ['7-Eleven', 'FamilyMart', 'Lawson'],
      },
      {
        name: 'พายสับปะรด (Pineapple Pie)',
        priority: 'medium',
        reason: 'แพ็คพอดี 2-3 ชิ้น Shelf Life ยาว วางได้นาน ไม่ต้องแช่เย็น',
        stats: [
          { label: 'ราคาขายปลีก', value: '฿35-49/แพ็ค' },
          { label: 'Shelf Life', value: '90 วัน' },
          { label: 'Gross Margin', value: '50%' },
        ],
        period: 'ตลอดปี',
        channels: ['7-Eleven', 'FamilyMart'],
      },
      {
        name: 'คุกกี้เนยสด (Butter Cookies)',
        priority: 'interesting',
        reason: 'แพ็คเล็ก 4-6 ชิ้นเหมาะ impulse buy ตรง Counter จุดชำระเงิน',
        stats: [
          { label: 'ราคาขายปลีก', value: '฿29-45/แพ็ค' },
          { label: 'Shelf Life', value: '180 วัน' },
          { label: 'Gross Margin', value: '68%' },
        ],
        period: 'ตลอดปี',
        channels: ['7-Eleven', 'FamilyMart', 'Lawson'],
      },
    ],
  },

  'competitor': {
    title: 'สินค้าที่คู่แข่งกำลังดัน (ส.ค. 2569)',
    summary: 'S&P เน้นครัวซองต์พรีเมียม, Yamazaki ดันขนมปังโฮลวีท, Dunkin\' ทุ่มโปรโดนัท',
    items: [
      {
        name: 'ครัวซองต์ (Croissant)',
        priority: 'high',
        reason: 'S&P ลงทุนเปิดไลน์ครัวซองต์พรีเมียม 5 รสใหม่ ทำ Co-branding กับคาเฟ่ชื่อดัง',
        stats: [
          { label: 'คู่แข่งหลัก', value: 'S&P Syndicate' },
          { label: 'งบโฆษณาเพิ่ม', value: '+35% QoQ' },
          { label: 'SKU ใหม่', value: '5 รายการ' },
        ],
        period: 'ส.ค. - ต.ค. 2569',
        channels: ['ร้านสาขา S&P', 'คาเฟ่พันธมิตร'],
      },
      {
        name: 'ขนมปังโฮลวีท (Whole Wheat Bread)',
        priority: 'high',
        reason: 'Yamazaki ออกไลน์ "Healthy Choice" ใหม่ ราคาแข่งขัน วาง MT ทั่วประเทศ',
        stats: [
          { label: 'คู่แข่งหลัก', value: 'Yamazaki' },
          { label: 'ราคาแข่งขัน', value: 'ต่ำกว่าตลาด 10%' },
          { label: 'Distribution', value: '3,200 สาขา' },
        ],
        period: 'ส.ค. 2569 เป็นต้นไป',
        channels: ['Modern Trade', 'สะดวกซื้อ'],
      },
      {
        name: 'โดนัท (Donut)',
        priority: 'medium',
        reason: 'Dunkin\' จัดโปรซื้อ 6 แถม 2 ต่อเนื่อง 3 เดือน กดราคาตลาด',
        stats: [
          { label: 'คู่แข่งหลัก', value: 'Dunkin\' Donuts' },
          { label: 'โปรโมชัน', value: 'ซื้อ 6 แถม 2' },
          { label: 'ระยะเวลา', value: 'ส.ค. - ต.ค. 2569' },
        ],
        period: 'ส.ค. - ต.ค. 2569',
        channels: ['ร้านสาขา Dunkin\'', 'Delivery'],
      },
    ],
  },

  'promo': {
    title: 'สินค้าที่ควรทำโปรโมชัน (ส.ค.-ก.ย. 2569)',
    summary: 'เน้นสินค้า Margin สูง + กำลังเทรนด์ เพื่อดึงลูกค้าใหม่และสร้าง Repeat Purchase',
    items: [
      {
        name: 'โดนัท (Donut)',
        priority: 'high',
        reason: 'Margin สูง 58% สามารถรับโปร Buy 2 Get 1 ได้โดยยังกำไร ช่วยแข่ง Dunkin\'',
        stats: [
          { label: 'Gross Margin', value: '58%' },
          { label: 'โปรแนะนำ', value: 'ซื้อ 2 แถม 1' },
          { label: 'ต้นทุนโปร', value: '-19% margin' },
        ],
        period: 'ส.ค. - ก.ย. 2569',
        channels: ['ร้านสาขา', 'ออนไลน์'],
      },
      {
        name: 'คุกกี้เนยสด (Butter Cookies)',
        priority: 'high',
        reason: 'Margin สูงสุด 68% ทำ Bundle Set ของขวัญช่วงเปิดเทอม/วันแม่ได้',
        stats: [
          { label: 'Gross Margin', value: '68%' },
          { label: 'โปรแนะนำ', value: 'Bundle Set ฿199' },
          { label: 'Uplift คาดการณ์', value: '+40% ยอดขาย' },
        ],
        period: 'ส.ค. (วันแม่) - ก.ย.',
        channels: ['ร้านสาขา', 'Modern Trade', 'ออนไลน์'],
      },
      {
        name: 'ขนมเปี๊ยะไส้ถั่ว (Mung Bean Pastry)',
        priority: 'medium',
        reason: 'เทศกาลไหว้พระจันทร์ (ก.ย.) ทำ Early Bird -15% กระตุ้นสั่งล่วงหน้า',
        stats: [
          { label: 'เทศกาล', value: 'ไหว้พระจันทร์ ก.ย.' },
          { label: 'โปรแนะนำ', value: 'Early Bird -15%' },
          { label: 'ยอดขายเทศกาลปีก่อน', value: '฿3.2M' },
        ],
        period: 'ก.ย. 2569',
        channels: ['ร้านสาขา', 'ออนไลน์', 'ร้านของฝาก'],
      },
      {
        name: 'ครัวซองต์ (Croissant)',
        priority: 'interesting',
        reason: 'จับคู่กับเครื่องดื่มเป็น Combo Set ราคาพิเศษ สู้กับ S&P',
        stats: [
          { label: 'Gross Margin', value: '55%' },
          { label: 'โปรแนะนำ', value: 'Combo + กาแฟ ฿79' },
          { label: 'Uplift คาดการณ์', value: '+25% ยอดขาย' },
        ],
        period: 'ส.ค. - ต.ค. 2569',
        channels: ['ร้านสาขา', 'คาเฟ่'],
      },
    ],
  },

  'health': {
    title: 'สินค้าสำหรับลูกค้ากลุ่มสุขภาพ',
    summary: 'เทรนด์ Health & Wellness โตต่อเนื่อง คำค้น "เบเกอรี่สุขภาพ" เพิ่มขึ้น 42% ควรมีสินค้ารองรับ',
    items: [
      {
        name: 'ขนมปังโฮลวีท (Whole Wheat Bread)',
        priority: 'high',
        reason: 'สินค้าหลักกลุ่มสุขภาพ เติบโตเร็วที่สุดในหมวด ลูกค้ายอมจ่ายแพงกว่าขนมปังขาว 30%',
        stats: [
          { label: 'อัตราเติบโต', value: '+25% YoY' },
          { label: 'ราคาเฉลี่ย', value: '฿55-75/ถุง' },
          { label: 'กลุ่มลูกค้า', value: 'อายุ 25-45 ปี' },
        ],
        period: 'ตลอดปี',
        channels: ['Modern Trade', 'ออนไลน์', 'ร้านสุขภาพ'],
      },
      {
        name: 'คุกกี้เนยสด สูตรน้ำตาลน้อย',
        priority: 'medium',
        reason: 'ต่อยอดจากคุกกี้เนยสดที่ขายดี ลดน้ำตาล 40% ใช้สตีเวียแทน จับกลุ่ม Health-conscious',
        stats: [
          { label: 'Gross Margin', value: '62%' },
          { label: 'ตลาด Low-sugar', value: '+30% YoY' },
          { label: 'Willingness to Pay', value: 'สูงกว่าปกติ 20%' },
        ],
        period: 'ตลอดปี',
        channels: ['Modern Trade', 'ออนไลน์', 'Gourmet Market'],
      },
      {
        name: 'ครัวซองต์โฮลเกรน (Whole Grain Croissant)',
        priority: 'interesting',
        reason: 'นวัตกรรมใหม่ ผสมแป้งโฮลเกรน 30% รสชาติใกล้เคียงครัวซองต์ปกติ แต่ใยอาหารสูง',
        stats: [
          { label: 'ศักยภาพตลาด', value: '฿500M' },
          { label: 'คู่แข่งในตลาด', value: 'น้อย (Blue Ocean)' },
          { label: 'ต้นทุนเพิ่มขึ้น', value: '+8% vs ปกติ' },
        ],
        period: 'ต.ค. 2569 เป็นต้นไป (R&D)',
        channels: ['คาเฟ่', 'ร้านสาขา', 'ออนไลน์'],
      },
    ],
  },
};

/* ============================================================
   Priority Badge Rendering
   ============================================================ */

function priorityBadge(level) {
  switch (level) {
    case 'high':
      return '<span class="qa-priority qa-priority--high">\u{1F525} แนะนำสูง</span>';
    case 'medium':
      return '<span class="qa-priority qa-priority--medium">⭐ แนะนำ</span>';
    case 'interesting':
      return '<span class="qa-priority qa-priority--interesting">\u{1F4A1} น่าสนใจ</span>';
    default:
      return '';
  }
}

/* ============================================================
   Render Answer HTML
   ============================================================ */

function renderAnswer(answer) {
  const itemsHTML = answer.items.map((item, idx) => `
    <div class="qa-item" style="animation-delay: ${idx * 0.08}s">
      <div class="qa-item-header">
        <h4 class="qa-item-name">${item.name}</h4>
        ${priorityBadge(item.priority)}
      </div>
      <p class="qa-item-reason">${item.reason}</p>
      <div class="qa-stats-grid">
        ${item.stats.map(s => `
          <div class="qa-stat">
            <span class="qa-stat-label">${s.label}</span>
            <span class="qa-stat-value">${s.value}</span>
          </div>
        `).join('')}
      </div>
      <div class="qa-item-meta">
        <span class="qa-meta-tag">\u{1F4C5} ${item.period}</span>
        <span class="qa-meta-tag">\u{1F6D2} ${item.channels.join(', ')}</span>
      </div>
    </div>
  `).join('');

  return `
    <div class="qa-answer-container qa-fade-in">
      <h3 class="qa-answer-title">${answer.title}</h3>
      <p class="qa-answer-summary">${answer.summary}</p>
      <div class="qa-items-list">
        ${itemsHTML}
      </div>
    </div>
  `;
}

/* ============================================================
   Module CSS
   ============================================================ */

const MODULE_CSS = `
  /* --- Q&A Section Header --- */
  .qa-section-header {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-heading, #1a202c);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .qa-section-header .qa-section-icon {
    font-size: 1.3rem;
  }

  /* --- Question Grid --- */
  .qa-questions-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 32px;
  }
  .qa-question-btn {
    background: var(--card-bg, #ffffff);
    border: 2px solid transparent;
    border-radius: var(--radius-md, 12px);
    padding: 16px;
    cursor: pointer;
    text-align: left;
    box-shadow: var(--card-shadow, 0 2px 12px rgba(0,0,0,0.06));
    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-family: inherit;
    color: var(--text-primary, #2d3748);
  }
  .qa-question-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--card-shadow-hover, 0 6px 24px rgba(124,77,255,0.12));
    border-color: rgba(124, 77, 255, 0.3);
  }
  .qa-question-btn.active {
    border-color: #7c4dff;
    box-shadow: 0 4px 20px rgba(124, 77, 255, 0.18);
    background: linear-gradient(135deg, rgba(124,77,255,0.04), rgba(102,126,234,0.04));
  }
  .qa-question-icon {
    font-size: 1.6rem;
  }
  .qa-question-text {
    font-size: 0.9rem;
    line-height: 1.4;
    font-weight: 500;
  }

  /* --- Answer Container --- */
  .qa-answer-area {
    min-height: 120px;
  }
  .qa-answer-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    color: var(--text-muted, #718096);
    text-align: center;
    gap: 12px;
  }
  .qa-answer-placeholder-icon {
    font-size: 3rem;
    opacity: 0.4;
  }
  .qa-answer-placeholder-text {
    font-size: 0.95rem;
  }

  .qa-answer-container {
    background: var(--card-bg, #ffffff);
    border-radius: var(--radius-lg, 16px);
    padding: 24px;
    box-shadow: var(--card-shadow, 0 2px 12px rgba(0,0,0,0.06));
  }
  .qa-answer-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-heading, #1a202c);
    margin-bottom: 8px;
    padding-bottom: 12px;
    border-bottom: 2px solid rgba(124, 77, 255, 0.15);
  }
  .qa-answer-summary {
    font-size: 0.9rem;
    color: var(--text-muted, #718096);
    line-height: 1.6;
    margin-bottom: 20px;
  }

  /* --- Individual Item Cards --- */
  .qa-items-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .qa-item {
    background: var(--bg-main, #f0f4f8);
    border-radius: var(--radius-md, 12px);
    padding: 20px;
    border-left: 4px solid #7c4dff;
    animation: qaItemSlideIn 0.35s ease both;
  }
  .qa-item:nth-child(1) { border-left-color: #7c4dff; }
  .qa-item:nth-child(2) { border-left-color: #667eea; }
  .qa-item:nth-child(3) { border-left-color: #764ba2; }
  .qa-item:nth-child(4) { border-left-color: #00bfa5; }
  .qa-item:nth-child(5) { border-left-color: #ff4081; }

  @keyframes qaItemSlideIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .qa-item-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }
  .qa-item-name {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-heading, #1a202c);
  }
  .qa-item-reason {
    font-size: 0.88rem;
    color: var(--text-muted, #718096);
    line-height: 1.6;
    margin-bottom: 12px;
  }

  /* --- Priority Badges --- */
  .qa-priority {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.78rem;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
    white-space: nowrap;
  }
  .qa-priority--high {
    background: rgba(255, 64, 129, 0.1);
    color: #e91e63;
  }
  .qa-priority--medium {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
  }
  .qa-priority--interesting {
    background: rgba(124, 77, 255, 0.1);
    color: #7c4dff;
  }

  /* --- Stats Grid --- */
  .qa-stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 12px;
  }
  .qa-stat {
    background: var(--card-bg, #ffffff);
    border-radius: var(--radius-sm, 8px);
    padding: 10px 12px;
    text-align: center;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .qa-stat-label {
    display: block;
    font-size: 0.72rem;
    color: var(--text-muted, #718096);
    margin-bottom: 4px;
    font-weight: 500;
  }
  .qa-stat-value {
    display: block;
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--accent-purple, #7c4dff);
  }

  /* --- Meta Tags --- */
  .qa-item-meta {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .qa-meta-tag {
    font-size: 0.78rem;
    color: var(--text-muted, #718096);
    background: rgba(124, 77, 255, 0.06);
    padding: 4px 10px;
    border-radius: 20px;
  }

  /* --- Fade-in Animation --- */
  .qa-fade-in {
    animation: qaFadeIn 0.4s ease;
  }
  @keyframes qaFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* --- Responsive --- */
  @media (max-width: 1199px) {
    .qa-questions-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 767px) {
    .qa-questions-grid {
      grid-template-columns: 1fr;
    }
    .qa-stats-grid {
      grid-template-columns: 1fr;
    }
    .qa-item-meta {
      flex-direction: column;
      gap: 6px;
    }
  }

  /* --- Dark Mode --- */
  [data-theme="dark"] .qa-question-btn {
    background: var(--card-bg);
    color: var(--text-primary);
  }
  [data-theme="dark"] .qa-question-btn:hover {
    border-color: rgba(124, 77, 255, 0.5);
  }
  [data-theme="dark"] .qa-question-btn.active {
    border-color: #7c4dff;
    background: linear-gradient(135deg, rgba(124,77,255,0.1), rgba(102,126,234,0.08));
  }
  [data-theme="dark"] .qa-answer-container {
    background: var(--card-bg);
  }
  [data-theme="dark"] .qa-answer-title {
    color: var(--text-heading);
    border-bottom-color: rgba(124, 77, 255, 0.25);
  }
  [data-theme="dark"] .qa-item {
    background: rgba(255, 255, 255, 0.03);
  }
  [data-theme="dark"] .qa-item-name {
    color: var(--text-heading);
  }
  [data-theme="dark"] .qa-stat {
    background: rgba(255, 255, 255, 0.05);
    box-shadow: none;
  }
  [data-theme="dark"] .qa-priority--high {
    background: rgba(255, 64, 129, 0.15);
    color: #ff4081;
  }
  [data-theme="dark"] .qa-priority--medium {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
  }
  [data-theme="dark"] .qa-priority--interesting {
    background: rgba(124, 77, 255, 0.15);
    color: #a78bfa;
  }
  [data-theme="dark"] .qa-meta-tag {
    background: rgba(124, 77, 255, 0.12);
    color: var(--text-muted);
  }
`;

/* ============================================================
   Style Injection / Removal
   ============================================================ */

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = MODULE_CSS;
  document.head.appendChild(style);
}

function removeStyles() {
  const el = document.getElementById(STYLE_ID);
  if (el) el.remove();
}

/* ============================================================
   Mount / Unmount
   ============================================================ */

export function mount(container) {
  const mid = ++mountId;
  injectStyles();

  // สร้าง HTML หลัก
  const questionsHTML = QUESTIONS.map(q => `
    <button class="qa-question-btn" data-qa-id="${q.id}" type="button">
      <span class="qa-question-icon">${q.icon}</span>
      <span class="qa-question-text">${q.text}</span>
    </button>
  `).join('');

  container.innerHTML = `
    <div class="tab-content">
      <div class="qa-section-header">
        <span class="qa-section-icon">❓</span>
        คำถามยอดนิยม
      </div>
      <div class="qa-questions-grid">
        ${questionsHTML}
      </div>

      <div class="qa-section-header">
        <span class="qa-section-icon">\u{1F4AC}</span>
        คำตอบ
      </div>
      <div class="qa-answer-area">
        <div class="qa-answer-placeholder">
          <div class="qa-answer-placeholder-icon">\u{1F447}</div>
          <p class="qa-answer-placeholder-text">กดเลือกคำถามด้านบนเพื่อดูคำแนะนำสินค้า</p>
        </div>
      </div>
    </div>
  `;

  // mountId guard หลัง render
  if (mid !== mountId) return;

  // Event delegation สำหรับปุ่มคำถาม
  const grid = container.querySelector('.qa-questions-grid');
  const answerArea = container.querySelector('.qa-answer-area');

  if (grid && answerArea) {
    grid.addEventListener('click', (e) => {
      // mountId guard ใน event handler
      if (mid !== mountId) return;

      const btn = e.target.closest('.qa-question-btn');
      if (!btn) return;

      const qId = btn.dataset.qaId;
      const answer = ANSWERS[qId];
      if (!answer) return;

      // อัปเดต active state
      grid.querySelectorAll('.qa-question-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // แสดงคำตอบ
      answerArea.innerHTML = renderAnswer(answer);
    });
  }
}

export function unmount() {
  mountId++;
  removeStyles();
}
