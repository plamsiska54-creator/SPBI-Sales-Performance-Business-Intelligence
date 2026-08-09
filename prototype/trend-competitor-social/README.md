# Trend & Competitor Analysis Dashboard

Dashboard สำหรับวิเคราะห์เทรนด์สินค้า คู่แข่ง และติดตามโซเชียลมีเดียในอุตสาหกรรมขนม/อาหาร
เป็น prototype module ของแพลตฟอร์ม SPBI ใช้ข้อมูลจำลอง (Demo Data) ตลาดขนมไทย

---

## ภาพรวม

Web App แบบ Single Page Application (SPA) ที่แสดงข้อมูลผ่าน 3 แท็บหลัก:

| แท็บ | ชื่อ | เนื้อหา |
|------|------|---------|
| 1 | **Product Trends** (เทรนด์สินค้า) | Line chart สินค้ายอดนิยม, Bar chart หมวดหมู่, Horizontal bar คีย์เวิร์ด Top 20, ตาราง Top 10 |
| 2 | **Competitor Analysis** (วิเคราะห์คู่แข่ง) | Bar chart ราคา, Radar chart รีวิว, Line chart ยอดขาย, Doughnut market share, ตารางสรุป |
| 3 | **Social Listening** (ติดตามโซเชียล) | Line chart mentions รายสัปดาห์, Doughnut sentiment, Horizontal bar hashtags, Bar chart platforms |

---

## Tech Stack

- **Frontend**: HTML / CSS / JavaScript (Vanilla, ES Modules) -- ไม่มี build tool / framework
- **Charts**: Chart.js 4.4.7 (UMD, โหลด local จาก `public/js/lib/chart.umd.js`)
- **Server**: Node.js static file server (ไม่มี dependency นอกจาก `chart.js`)
- **Theme**: Dark theme, glass-morphism, responsive layout
- **Pattern**: Micro-module SPA -- HTML shell ตัวเดียว + module mount/unmount ต่อแท็บ

---

## โครงสร้างไฟล์

```
trend-competitor-social/
├── server.js                       # Static file server, port 3500
├── package.json                    # npm start -> node server.js
│
├── public/
│   ├── index.html                  # SPA shell: header, tab bar 3 ปุ่ม, overview cards, #app
│   │
│   ├── css/
│   │   ├── main.css                # CSS variables, layout, tab bar, filter bar, loading/error states
│   │   └── charts.css              # Chart card grid, data table, responsive sizing
│   │
│   ├── js/
│   │   ├── app.js                  # Tab router: mount/unmount modules, URL hash management
│   │   │
│   │   ├── tabs/
│   │   │   ├── trends.js           # Tab 1: Product Trends (line, bar, keywords, table)
│   │   │   ├── competitors.js      # Tab 2: Competitor Analysis (price, radar, sales, doughnut, table)
│   │   │   └── social.js           # Tab 3: Social Listening (mentions, sentiment, hashtags, platforms)
│   │   │
│   │   ├── shared/
│   │   │   ├── chart-factory.js    # createChart/destroyAll -- registry pattern จัดการ Chart.js instances
│   │   │   ├── data-loader.js      # fetchJSON() + in-memory cache + week-range filtering
│   │   │   └── filters.js          # Date range + platform dropdown, event emitter, filter persistence
│   │   │
│   │   └── lib/
│   │       └── chart.umd.js        # Chart.js 4.4.7 UMD bundle (local copy)
│   │
│   └── data/
│       ├── trends.json             # เทรนด์สินค้า: 26 สัปดาห์ (W01-W26), 6 หมวด, 20+ keywords
│       ├── competitors.json        # 6 แบรนด์: ราคา, รีวิว 6 มิติ, ยอดขายรายสัปดาห์, market share
│       └── social.json             # Mentions 5 platforms, sentiment, hashtags 15 อันดับ
│
└── _team/
    └── plan.md                     # แผนพัฒนา (internal)
```

---

## ความต้องการของระบบ

- **Node.js** >= 14 (ใช้สำหรับ static server เท่านั้น)
- **Browser**: Chrome, Edge, Firefox, Safari (รองรับ ES Modules)

---

## วิธีติดตั้งและรัน

```bash
# 1. เข้าโฟลเดอร์โปรเจกต์
cd prototype/trend-competitor-social

# 2. ติดตั้ง dependencies
npm install

# 3. รัน server
npm start

# 4. เปิด browser ไปที่
# http://localhost:3500
```

Server จะแสดงข้อความ: `Trend Dashboard server running on http://localhost:3500`

หมายเหตุ: Port สามารถเปลี่ยนได้ผ่าน environment variable `PORT` เช่น `PORT=4000 npm start`

---

## สถาปัตยกรรม (Architecture)

### Micro-module SPA Pattern

```
index.html (SPA shell)
  ├── header + tab bar (3 ปุ่ม)
  ├── overview cards (3 ใบ -- แต่ละ tab อัพเดตค่าเอง)
  └── <div id="app"> ← tab content mount ที่นี่

app.js (Tab Router)
  ├── click tab btn → unmount() tab เก่า → mount(container) tab ใหม่
  ├── URL hash sync (#trends, #competitors, #social)
  └── hashchange listener (browser back/forward)

tabs/*.js (Tab Modules)
  ├── mount(container):  แสดง loading → fetch data → render charts + tables
  ├── unmount():         destroyAll charts + remove filter listener
  └── renderAll():       อ่าน filter state → กรองข้อมูล → สร้าง chart ใหม่

shared/chart-factory.js (Chart Registry)
  ├── createChart(canvasId, config):  สร้าง Chart.js instance + เก็บใน Map
  ├── destroyAll():                   ทำลาย chart ทุกตัว (ป้องกัน memory leak)
  └── registry: Map<canvasId, Chart>

shared/data-loader.js (Data Layer)
  ├── fetchJSON(url):           fetch + cache ใน Map (ไม่โหลดซ้ำ)
  ├── filterByWeekRange():      กรองข้อมูลตามช่วงสัปดาห์
  └── getRecentWeekRange():     คำนวณช่วง N สัปดาห์ล่าสุด

shared/filters.js (Filter State)
  ├── renderFilters(container):  สร้าง dropdown ช่วงเวลา + platform
  ├── getFilters():              อ่านค่า filter ปัจจุบัน
  ├── onFilterChange(cb):        ลงทะเบียน callback เมื่อ filter เปลี่ยน
  └── removeFilterListener(cb):  ถอด callback (ตอน unmount)
```

### การไหลของข้อมูล

```
User คลิก tab → app.js unmount tab เก่า (destroy charts, remove listener)
                        → mount tab ใหม่ → loading state
                                         → fetchJSON (cached) → filter data
                                         → destroyAll → render charts
                                         → register filter listener

User เปลี่ยน filter → filters.js emit callback → tab renderAll()
                                                → กรอง data ตาม filter
                                                → destroyAll → render charts ใหม่
```

---

## ฟีเจอร์สำคัญ

### Filter Persistence
ค่า filter (ช่วงเวลา, platform) ถูกเก็บเป็น module-level state ใน `filters.js`
เมื่อสลับ tab ค่า filter ยังคงอยู่ -- tab ใหม่จะ render ด้วยค่าเดิม

### Chart Registry Pattern
ทุก Chart.js instance ถูกสร้างผ่าน `createChart()` ซึ่งเก็บ reference ใน `Map`
เมื่อ unmount tab จะเรียก `destroyAll()` เพื่อทำลาย chart ทุกตัว ป้องกัน memory leak และ chart ซ้อน

### Race Condition Guard
แต่ละ tab ใช้ `mountId` counter -- เมื่อ fetch data เสร็จ จะตรวจว่า mountId ยังตรงกับตอนเริ่ม mount หรือไม่
ถ้า user สลับ tab ระหว่าง fetch ระบบจะยกเลิก render (ไม่ render tab ที่ไม่ได้ active อยู่)

### Responsive Design
- Desktop (1200px+): chart grid 2 คอลัมน์, overview cards 3 คอลัมน์
- Tablet (768-1199px): chart grid 1 คอลัมน์, overview cards 2 คอลัมน์
- tab bar สามารถ scroll แนวนอนได้เมื่อหน้าจอแคบ

### Dark Theme
Glass-morphism design พร้อม CSS custom properties, gradient background, backdrop blur

### Loading / Empty / Error States
- **Loading**: spinner + ข้อความ "กำลังโหลดข้อมูล..." ระหว่าง fetch
- **Empty**: ข้อความ "ไม่พบข้อมูลในเงื่อนไขที่เลือก" เมื่อ filter ไม่มีผลลัพธ์
- **Error**: ข้อความแจ้งเมื่อ fetch ล้มเหลว

---

## Demo Data

ข้อมูลจำลองอ้างอิงตลาดขนมไทย ช่วง มกราคม - มิถุนายน 2026 (26 สัปดาห์)

### 6 แบรนด์ขนมไทย

| แบรนด์ | ID | สี |
|--------|----|----|
| วรรณวนัช | `wanwanach` | `#7b2ff7` |
| เถ้าแก่น้อย | `taokaenoi` | `#2ecc71` |
| มโนราห์ | `manora` | `#e74c3c` |
| ฮานามิ | `hanami` | `#f39c12` |
| เลย์ | `lays` | `#3498db` |
| โคอิเกะยะ | `koikeya` | `#e91e63` |

### ไฟล์ข้อมูล

- **trends.json**: สินค้ายอดนิยม (search volume รายสัปดาห์), 6 หมวดหมู่ (ขนมกรอบ, ขนมอบ, ขนมเพื่อสุขภาพ, ขนมนำเข้า, ขนมท้องถิ่น, เครื่องดื่ม), keywords 20+ คำ
- **competitors.json**: ข้อมูล 6 แบรนด์ (ราคา, รีวิว 6 มิติ, ยอดขายรายสัปดาห์, market share, กลยุทธ์การตลาด)
- **social.json**: Mentions จาก 5 platforms (Facebook, Instagram, X, TikTok, Pantip), Sentiment analysis, Top 15 hashtags

### ตัวกรองข้อมูล

| ตัวกรอง | ตัวเลือก |
|---------|----------|
| ช่วงเวลา | ทั้งหมด (6 เดือน), 4 สัปดาห์ล่าสุด, 8 สัปดาห์ล่าสุด, 12 สัปดาห์ล่าสุด |
| แพลตฟอร์ม | ทั้งหมด, Facebook, Instagram, X, TikTok, Shopee, Lazada, Amazon, Pantip |

---

## การพัฒนาต่อ

ปัจจุบันระบบใช้ JSON ไฟล์คงที่ (static demo data) สำหรับการเชื่อมต่อข้อมูลจริงในอนาคต:

1. **เปลี่ยน data source**: แก้ URL ใน `fetchJSON()` จาก `/data/*.json` เป็น API endpoint จริง
   เช่น `/api/trends`, `/api/competitors`, `/api/social`
2. **Cache invalidation**: เพิ่ม `clearCache()` เมื่อข้อมูลมีการอัพเดต หรือใช้ TTL-based cache
3. **Real-time**: เพิ่ม WebSocket/SSE สำหรับอัพเดต mentions แบบ real-time
4. **Authentication**: เพิ่ม login/auth ก่อนเข้าถึง dashboard

สิ่งที่อยู่นอกขอบเขตปัจจุบัน:
- Mobile layout optimization
- Influencer tracking
- กลยุทธ์คู่แข่ง text analysis
- Integration กับ Sales Dashboard หลัก
- Backend / Database

---

## License

UNLICENSED (Internal use only)
