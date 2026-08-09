# Implementation Plan: Trend & Competitor Analysis Dashboard
> สร้างเมื่อ: 2026-08-09
> สถานะ: พร้อมให้ developer ทำตาม
> Pattern: Micro-module (Vanilla JS SPA, ไม่มี build tool)

---

## 1. โครงสร้างไฟล์/โฟลเดอร์

```
prototype/trend-competitor-social/
├── server.js                    # (มีอยู่แล้ว) Static file server, port 3500
├── package.json                 # (มีอยู่แล้ว) npm start → node server.js
│
├── public/
│   ├── index.html               # SPA shell: header + tab bar + #app container
│   │
│   ├── css/
│   │   ├── main.css             # CSS variables, layout, tab bar, shared components
│   │   └── charts.css           # Chart container, card grid, responsive chart sizing
│   │
│   ├── js/
│   │   ├── app.js               # Tab router: click handler → mount/unmount modules
│   │   │
│   │   ├── tabs/
│   │   │   ├── trends.js        # Tab 1: Product Trends (line, bar, keyword cloud)
│   │   │   ├── competitors.js   # Tab 2: Competitor Analysis (radar, table, comparison)
│   │   │   └── social.js        # Tab 3: Social Listening (sentiment, mentions, hashtags)
│   │   │
│   │   └── shared/
│   │       ├── chart-factory.js # createChart() wrapper — สร้าง/ทำลาย Chart.js instances
│   │       ├── data-loader.js   # fetchJSON() with in-memory cache + loading state
│   │       └── filters.js       # Date range picker + platform filter + event emitter
│   │
│   └── data/
│       ├── trends.json          # ข้อมูลเทรนด์สินค้า (26 สัปดาห์, 6 หมวด, keywords)
│       ├── competitors.json     # ข้อมูลคู่แข่ง 6 แบรนด์ (ราคา, รีวิว, ยอดขาย, market share)
│       └── social.json          # ข้อมูล social mentions, sentiment, hashtags
│
└── _team/
    └── plan.md                  # (ไฟล์นี้)
```

### หน้าที่แต่ละไฟล์

| ไฟล์ | หน้าที่ |
|------|---------|
| `index.html` | SPA shell — โหลด CDN (Chart.js 4.x, chartjs-chart-wordcloud), tab bar 3 ปุ่ม, `<div id="app">` สำหรับ mount content, โหลด JS ทุกตัวด้วย `<script>` |
| `css/main.css` | CSS custom properties (สี, spacing), layout grid, tab bar active state, filter bar, loading spinner, empty state, dark theme base |
| `css/charts.css` | `.chart-card` container, responsive grid สำหรับ charts, chart aspect ratio, table styling |
| `js/app.js` | Tab router — listen click บน tab bar, เรียก `currentTab.unmount()` แล้ว `newTab.mount(container)`, จัดการ hash URL |
| `js/tabs/trends.js` | mount(): โหลด trends.json → render Top Products line chart, Category bar chart, Keyword cloud/bar, Growth table |
| `js/tabs/competitors.js` | mount(): โหลด competitors.json → render Price comparison bar, Review score radar, Sales volume line, Market share doughnut, Competitor table |
| `js/tabs/social.js` | mount(): โหลด social.json → render Mentions over time line, Sentiment pie/doughnut, Top Hashtags horizontal bar, Platform breakdown |
| `js/shared/chart-factory.js` | `createChart(canvasId, config)` — สร้าง Chart.js instance, track ไว้ใน registry, `destroyAll()` สำหรับ unmount |
| `js/shared/data-loader.js` | `fetchJSON(url)` — fetch + cache ใน Map, return cached ถ้ามี, handle error → throw with message |
| `js/shared/filters.js` | Render date range inputs + platform dropdown, emit `filter-change` CustomEvent, export `getFilters()` |
| `data/trends.json` | 26 data points (weekly, ม.ค.-มิ.ย. 2026), หมวด: ขนมกรอบ, ขนมอบ, ขนมเพื่อสุขภาพ, ขนมนำเข้า, ขนมท้องถิ่น, เครื่องดื่ม; keywords 20-30 คำ |
| `data/competitors.json` | 6 แบรนด์: วรรณวนัช, เถ้าแก่น้อย, มโนราห์, ฮานามิ, เลย์, โคอิเกะยะ; ข้อมูลราคา/รีวิว/ยอดขาย/market share ราย platform |
| `data/social.json` | Mentions count รายสัปดาห์, sentiment (positive/neutral/negative) %, hashtags top 15, แยกตาม platform (Facebook, X, TikTok, Instagram, Pantip) |

---

## 2. งานย่อย (Tasks) เรียงตามลำดับ

### Milestone 1: โครงหลักรันได้ (M1)

| รหัส | สิ่งที่ต้องทำ | ไฟล์ที่เกี่ยวข้อง | ขึ้นกับ | เกณฑ์ว่าเสร็จ | ประมาณเวลา |
|------|--------------|-------------------|---------|--------------|------------|
| T1 | **Shell + Router** — สร้าง SPA shell (header, tab bar 3 ปุ่ม, #app), CSS layout, tab router ที่ mount/unmount ได้ | `index.html`, `css/main.css`, `css/charts.css`, `js/app.js` | - | (1) `npm start` แล้วเปิด localhost:3500 เห็น header + 3 tab (2) คลิก tab เปลี่ยน active state + แสดงชื่อ tab ใน #app (3) URL hash เปลี่ยนตาม tab (4) ไม่มี console error (5) CSS แยกไฟล์ ไม่มี inline style ใน HTML | 2 ชม. |
| T2 | **Demo Data** — สร้าง JSON 3 ไฟล์ ข้อมูลสมจริงตลาดขนมไทย, รวมไม่เกิน 300KB | `data/trends.json`, `data/competitors.json`, `data/social.json` | - | (1) JSON valid ทุกไฟล์ (parse ได้ไม่ error) (2) trends มี 26 จุดข้อมูลรายสัปดาห์ (3) competitors มี 6 แบรนด์ครบ (4) social มี 5 platforms (5) ขนาดรวม 3 ไฟล์ ไม่เกิน 300KB (6) encoding UTF-8 without BOM | 3 ชม. |
| T3 | **Shared Modules** — chart-factory (สร้าง/ทำลาย chart), data-loader (fetch+cache), filters (date range + platform) | `js/shared/chart-factory.js`, `js/shared/data-loader.js`, `js/shared/filters.js` | T1 | (1) `createChart()` สร้าง chart บน canvas ได้ (2) `destroyAll()` ทำลาย chart ทุกตัวใน registry ได้ (3) `fetchJSON()` โหลด data ได้ + cache ไม่โหลดซ้ำ (4) filter bar render ได้ + emit event เมื่อเปลี่ยนค่า (5) ทดสอบด้วยข้อมูลจำลองบน console ไม่มี error | 2 ชม. |

### Milestone 2: ฟีเจอร์ครบ (M2)

| รหัส | สิ่งที่ต้องทำ | ไฟล์ที่เกี่ยวข้อง | ขึ้นกับ | เกณฑ์ว่าเสร็จ | ประมาณเวลา |
|------|--------------|-------------------|---------|--------------|------------|
| T4 | **Tab Product Trends** — line chart (top products over time), bar chart (category comparison), keyword cloud/bar, growth rate table, filter integration | `js/tabs/trends.js`, อาจแก้ `index.html` เพิ่ม CDN wordcloud | T2, T3 | (1) เข้า tab Trends เห็น chart 3-4 ตัว + ตาราง (2) Line chart แสดง trend รายสัปดาห์ของ top 5 สินค้า (3) Bar chart แสดงยอดตามหมวดสินค้า (4) Keyword section แสดงได้ (word cloud หรือ horizontal bar fallback) (5) เปลี่ยน date range แล้ว chart อัพเดต (6) ไม่มี console error (7) unmount แล้วสลับ tab กลับมา chart ไม่ซ้อน | 4 ชม. |
| T5 | **Tab Competitor Analysis** — price comparison bar, review radar, sales line, market share doughnut, competitor detail table | `js/tabs/competitors.js` | T2, T3 | (1) เข้า tab Competitors เห็น chart 4 ตัว + ตาราง (2) Bar chart เปรียบเทียบราคา 6 แบรนด์ (3) Radar chart แสดงคะแนนรีวิวหลายมิติ (4) Line chart แสดงยอดขายเทียบกัน (5) Doughnut แสดง market share (6) ตารางแสดงรายละเอียดแบรนด์ (7) filter platform ทำงาน (8) unmount/remount ไม่มี chart ซ้อน | 4 ชม. |
| T6 | **Tab Social Listening** — mentions over time line, sentiment doughnut, hashtags horizontal bar, platform breakdown bar | `js/tabs/social.js` | T2, T3 | (1) เข้า tab Social เห็น chart 4 ตัว (2) Line chart mentions รายสัปดาห์ (3) Doughnut/Pie แสดง sentiment ratio (4) Horizontal bar แสดง top 15 hashtags (5) Bar chart แสดงจำนวน mentions ต่อ platform (6) filter ทำงาน (7) unmount/remount ไม่ซ้อน | 4 ชม. |

### Milestone 3: ขัดเกลา + ทดสอบ (M3)

| รหัส | สิ่งที่ต้องทำ | ไฟล์ที่เกี่ยวข้อง | ขึ้นกับ | เกณฑ์ว่าเสร็จ | ประมาณเวลา |
|------|--------------|-------------------|---------|--------------|------------|
| T7 | **Cross-tab Filter + Integration** — ทดสอบ filter ข้าม tab, สลับ tab ไปกลับ, date range edge case | ทุกไฟล์ JS | T4, T5, T6 | (1) เปลี่ยน filter แล้วสลับ tab: ค่า filter คงอยู่ (2) สลับ tab เร็ว ๆ ไม่เกิด race condition (3) date range ว่าง → แสดงข้อมูลทั้งหมด (4) ไม่มี memory leak (chart ถูก destroy ทุกครั้ง) | 2 ชม. |
| T8 | **Loading + Empty + Error States** — spinner ขณะโหลด, empty state เมื่อ filter ไม่มีข้อมูล, error state เมื่อ fetch ล้มเหลว | `js/shared/data-loader.js`, `js/tabs/*.js`, `css/main.css` | T4, T5, T6 | (1) เห็น loading spinner ขณะ fetch (อาจใส่ delay จำลอง) (2) filter ช่วงที่ไม่มีข้อมูล → แสดง "ไม่พบข้อมูลในช่วงเวลาที่เลือก" (3) ลบ data file แล้วเปิด tab → แสดง error message ไม่ใช่หน้าว่าง (4) ไม่มี unhandled promise rejection | 2 ชม. |
| T9 | **Responsive + Visual Polish** — tablet/desktop layout, chart resize, tooltip ภาษาไทย, สี/font สอดคล้อง | `css/main.css`, `css/charts.css`, `js/tabs/*.js` | T7, T8 | (1) Desktop (1200px+): chart grid 2 คอลัมน์ (2) Tablet (768-1199px): chart grid 1-2 คอลัมน์ ยังใช้งานได้ (3) Chart resize เมื่อ window resize (4) Tooltip แสดงภาษาไทย (5) สี consistent ทุก tab (6) โหลดหน้าเสร็จภายใน 3 วินาที | 2 ชม. |
| T10 | **Final QA + Cleanup** — ทดสอบรวม, ลบ code ที่ไม่ใช้, ตรวจ console, เช็ค encoding | ทุกไฟล์ | T9 | (1) ทุก tab โหลดได้ไม่มี console error (2) สลับ tab ทุกลำดับ ไม่พัง (3) ไม่มี `console.log` debug ค้างอยู่ (4) ทุกไฟล์ UTF-8 without BOM (5) `node --check` ผ่านทุก JS file (6) JSON parse ผ่านทุก data file | 1 ชม. |

### สรุปลำดับ Dependencies

```
T1 (Shell+Router) ─────┐
                        ├──→ T3 (Shared Modules) ─┬──→ T4 (Trends)     ─┐
T2 (Demo Data) ─────────┘                         ├──→ T5 (Competitors) ├──→ T7 (Cross-tab) → T8 (States) → T9 (Polish) → T10 (QA)
                                                   └──→ T6 (Social)     ─┘
```

- T1 กับ T2 ทำพร้อมกันได้ (ไม่ขึ้นต่อกัน)
- T4, T5, T6 ทำพร้อมกันได้ (ถ้ามีหลาย developer) หรือทำทีละตัวก็ได้
- T7-T10 ต้องทำเรียงลำดับ

---

## 3. Definition of Done (DoD)

โปรเจกต์ถือว่า **เสร็จสมบูรณ์** เมื่อครบทุกข้อต่อไปนี้:

### ฟังก์ชันการทำงาน
- [ ] Tab Product Trends: แสดง line chart (top products), bar chart (categories), keyword section, growth table
- [ ] Tab Competitor Analysis: แสดง price comparison, review radar, sales line, market share doughnut, competitor table
- [ ] Tab Social Listening: แสดง mentions line, sentiment doughnut, hashtags bar, platform breakdown
- [ ] Filter (date range + platform) ทำงานทุก tab + ค่าคงอยู่เมื่อสลับ tab
- [ ] Word Cloud แสดงได้ หรือ fallback เป็น horizontal bar ถ้า plugin มีปัญหา

### คุณภาพทางเทคนิค
- [ ] ไม่มี JavaScript console error ใด ๆ เมื่อใช้งานปกติ
- [ ] ทุกไฟล์ encoding UTF-8 without BOM
- [ ] `node --check` ผ่านทุก .js file
- [ ] JSON.parse() ผ่านทุก .json file
- [ ] ไม่มี inline style ใน HTML — CSS แยกไฟล์ทั้งหมด
- [ ] ไม่มี hardcoded data ใน JS — ข้อมูลอยู่ใน JSON files เท่านั้น
- [ ] Chart instances ถูก destroy เมื่อ unmount tab (ไม่มี memory leak)

### การใช้งาน
- [ ] `npm start` → เปิด http://localhost:3500 → เห็น dashboard ทำงานได้
- [ ] โหลดหน้าเสร็จภายใน 5 วินาที (ตาม standards)
- [ ] Desktop + Tablet layout ใช้งานได้ (Mobile เลื่อนออกไป)
- [ ] Loading state แสดงขณะโหลดข้อมูล
- [ ] Empty state แสดงเมื่อ filter ไม่มีข้อมูล
- [ ] Error state แสดงเมื่อ fetch ล้มเหลว

### ข้อมูล
- [ ] Demo data สมจริง ตลาดขนมไทย 6 แบรนด์
- [ ] Time granularity รายสัปดาห์ 26 จุด (ม.ค.-มิ.ย. 2026)
- [ ] ขนาด JSON รวมไม่เกิน 300KB

---

## 4. แนวทางการทดสอบ

### 4.1 Manual Smoke Test (ทำทุก task)

ทดสอบด้วยมือตาม checklist ต่อไปนี้:

**Tab Navigation:**
1. เปิด http://localhost:3500 → เห็น tab แรก (Trends) ทำงาน
2. คลิก tab Competitors → เห็น charts เปลี่ยน, tab แรกถูก unmount
3. คลิก tab Social → เห็น charts เปลี่ยน
4. คลิกกลับ tab Trends → charts แสดงถูกต้อง ไม่ซ้อน
5. สลับ tab เร็ว ๆ 10 ครั้ง → ไม่มี error, ไม่มี chart ซ้อน

**Filter:**
6. เปลี่ยน date range เป็น 4 สัปดาห์ → charts อัพเดต แสดงข้อมูลน้อยลง
7. เปลี่ยน platform เป็น Shopee → ข้อมูลกรองตาม platform
8. สลับ tab → filter ค่าเดิมคงอยู่
9. เคลียร์ filter → แสดงข้อมูลทั้งหมด

**Error Handling:**
10. ลบ data/trends.json → เปิด tab Trends → เห็น error message
11. คืน trends.json กลับมา → refresh → ทำงานปกติ

**Responsive:**
12. ย่อ browser เหลือ 768px กว้าง → layout ยังใช้ได้
13. ขยายกลับ 1400px → layout 2 คอลัมน์

### 4.2 Syntax Validation (อัตโนมัติ)

```bash
# ตรวจ JS syntax ทุกไฟล์
for file in public/js/**/*.js; do node --check "$file" && echo "OK: $file"; done

# ตรวจ JSON validity
for file in public/data/*.json; do node -e "JSON.parse(require('fs').readFileSync('$file','utf8'))" && echo "OK: $file"; done

# ตรวจขนาด JSON รวม
du -cb public/data/*.json | tail -1   # ต้องไม่เกิน 307200 bytes
```

### 4.3 Console Error Test

1. เปิด browser DevTools → Console tab
2. Refresh หน้า → ต้องไม่มี error สีแดง
3. คลิกทุก tab → ต้องไม่มี error
4. เปลี่ยน filter ทุกค่า → ต้องไม่มี error
5. เปิด Network tab → ไม่มี 404 request

### 4.4 Memory Leak Test

1. เปิด DevTools → Memory tab → Take heap snapshot
2. สลับ tab ไปกลับ 20 ครั้ง
3. Take heap snapshot อีกครั้ง
4. เทียบขนาด: ต้องไม่โตเกิน 5MB (chart instances ถูก destroy)

### 4.5 Chart Rendering Test (ตรวจด้วยตา)

| Tab | Chart | ตรวจสอบ |
|-----|-------|---------|
| Trends | Line: Top Products | เส้น 5 สินค้า แยกสี, legend ถูกต้อง, tooltip แสดงค่า |
| Trends | Bar: Categories | แท่ง 6 หมวด, label ภาษาไทย |
| Trends | Keywords | word cloud หรือ bar แสดง 15-20 คำ |
| Competitors | Bar: Price | 6 แบรนด์ เปรียบเทียบราคาได้ |
| Competitors | Radar: Reviews | 6 แบรนด์ 4-5 มิติ (รสชาติ, ความคุ้ม, บรรจุภัณฑ์, ความสด, จัดส่ง) |
| Competitors | Line: Sales | เส้น 6 แบรนด์ รายสัปดาห์ |
| Competitors | Doughnut: Market Share | % รวม = 100% |
| Social | Line: Mentions | เส้น 26 จุด |
| Social | Doughnut: Sentiment | 3 ส่วน (positive/neutral/negative) |
| Social | H-Bar: Hashtags | top 15 เรียงจากมากไปน้อย |
| Social | Bar: Platforms | 5 platforms |

---

## 5. ความเสี่ยงของแผน & แผนสำรอง

### R1: chartjs-chart-wordcloud plugin ใช้ไม่ได้
- **ความน่าจะเป็น**: ปานกลาง (plugin อาจ incompatible กับ Chart.js 4.x version ที่ใช้)
- **ผลกระทบ**: T4 ติดตรง keyword section
- **แผนสำรอง**: Fallback เป็น horizontal bar chart แสดง keyword + frequency แทน (ตามที่ analyst แนะนำ) — ไม่ต้องรอแก้ plugin, ทำ bar ต่อได้เลย
- **สัญญาณเตือน**: ถ้าใช้เวลาแก้ word cloud เกิน 30 นาที → สลับไป fallback ทันที

### R2: Demo Data ไม่สมจริง / ขนาดเกิน 300KB
- **ความน่าจะเป็น**: ต่ำ
- **ผลกระทบ**: T2 ใช้เวลานานกว่ากำหนด, หรือ chart แสดงผลไม่สวย
- **แผนสำรอง**: เริ่มจาก data โครงสร้างเรียบง่าย (5 สัปดาห์ 3 แบรนด์) ให้ chart แสดงได้ก่อน แล้วขยายเป็น 26 สัปดาห์ 6 แบรนด์ทีหลัง
- **สัญญาณเตือน**: ถ้า JSON ไฟล์เดียวเกิน 150KB → ลด field/precision

### R3: Tab สลับแล้ว Chart ซ้อน (Memory Leak)
- **ความน่าจะเป็น**: สูง (ปัญหาพบบ่อยกับ Chart.js SPA)
- **ผลกระทบ**: T7 ต้องแก้ bug นานเกินคาด
- **แผนสำรอง**: chart-factory.js ออกแบบ registry pattern ตั้งแต่ T3 — ทุก chart ที่สร้างต้องผ่าน `createChart()` ซึ่งเก็บ reference ใน array, `destroyAll()` วน destroy + clear array ก่อน mount ใหม่ทุกครั้ง
- **ป้องกัน**: ใน T3 ทดสอบ create → destroyAll → create ซ้ำ 5 รอบ ต้องไม่มี canvas ค้าง

### R4: Filter ข้าม tab ทำงานไม่ถูก
- **ความน่าจะเป็น**: ปานกลาง
- **ผลกระทบ**: T7 ต้องแก้ event wiring
- **แผนสำรอง**: ถ้า CustomEvent ไม่ work → ใช้ simple callback pattern แทน (filters.js เก็บ callbacks array, tab register callback ตอน mount, unregister ตอน unmount)
- **ป้องกัน**: ใน T3 ทดสอบ emit+listen ใน console ก่อนต่อกับ tab จริง

### R5: Encoding ผิด (BOM / Thai garbled)
- **ความน่าจะเป็น**: ต่ำ-ปานกลาง (จาก lessons: Thai text encoding issues)
- **ผลกระทบ**: ภาษาไทยแสดงผิด
- **แผนสำรอง**: ทุกไฟล์ save เป็น UTF-8 without BOM, server.js ส่ง `charset=utf-8` ใน content-type (ตรวจแล้ว: server.js ทำอยู่แล้ว), ตรวจทุกไฟล์ด้วย `file --mime-encoding` หรือเทียบเท่า

### R6: server.js ไม่ serve nested path ถูก
- **ความน่าจะเป็น**: ต่ำ (ตรวจแล้ว server.js ใช้ path.join กับ req.url ทำงานได้กับ nested)
- **ผลกระทบ**: CSS/JS/JSON 404
- **แผนสำรอง**: ถ้ามีปัญหา → เปลี่ยนไปใช้ `npx serve public` แทน (ไม่ต้องแก้โค้ด)

---

## สรุปภาพรวม

| Milestone | Tasks | รวมประมาณเวลา | ผลลัพธ์ |
|-----------|-------|--------------|---------|
| M1: โครงหลักรันได้ | T1, T2, T3 | 7 ชม. | เปิด localhost:3500 เห็น tab bar สลับได้, shared modules พร้อม |
| M2: ฟีเจอร์ครบ | T4, T5, T6 | 12 ชม. | 3 tab แสดง chart + table + filter ครบ |
| M3: ขัดเกลา | T7, T8, T9, T10 | 7 ชม. | Integration ทดสอบแล้ว, responsive, error handling, QA ผ่าน |
| **รวม** | **10 tasks** | **~26 ชม.** | **Dashboard พร้อมใช้งาน** |

### สิ่งที่อยู่นอกขอบเขต (Out of Scope)
- Mobile layout optimization (เลื่อนออกไป)
- Influencer tracking (เลื่อนออกไป)
- กลยุทธ์คู่แข่ง text analysis (เลื่อนออกไป)
- Auth / Login (ไม่ต้องมี)
- Integration กับ Sales Dashboard เดิม (ไม่ต้อง)
- Real API connection (ใช้ demo JSON)
- Backend / Database (ใช้ static JSON)
