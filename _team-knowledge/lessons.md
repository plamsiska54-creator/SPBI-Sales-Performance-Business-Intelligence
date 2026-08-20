# Lessons Learned

## From Phase A+B (2026-07-15)
- Single-file HTML at 17K lines is unmaintainable — split early
- PIN hardcoded in source was a security risk — always hash
- SheetJS (XLSX) is already loaded and works well for Excel parsing
- `window.onerror` + tab-level try/catch provides good error coverage
- Bell notification system works with inline-flex positioning (not absolute)
- Thai text in Excel may have encoding issues with openpyxl
- Screenshot timeouts common with large dashboards — use JS verification instead
- `node --check` is effective for finding syntax errors in extracted JS files
- Watch for `<script>` tags leaking into extracted JS files

## From Trend & Competitor Dashboard Prototype (2026-08-09)

### Architecture & Patterns
- **Micro-module SPA pattern** แก้ปัญหา monolithic file ได้ดี: HTML shell เดียว + แต่ละ tab เป็น JS module ที่มี `mount(container)` / `unmount()` -- ใช้ `<script type="module">` + ES import ปกติ ไม่ต้องมี build tool
- **Chart registry pattern** (Map in chart-factory.js): เก็บ canvasId -> Chart instance -- `createChart()` เช็ค registry ก่อน ถ้ามีอยู่แล้ว destroy ก่อนสร้างใหม่ -- `destroyAll()` วน destroy ทุกตัวตอน unmount tab -- ป้องกัน memory leak ที่เกิดจาก Chart.js ไม่ถูก destroy เวลาสลับ tab
- **Race condition guard** (mountId counter): ตอน mount ให้ `++mountId` แล้วเก็บค่า `thisMount` -- หลัง await fetch ตรวจ `thisMount !== mountId` ถ้าไม่ตรงแสดงว่า user สลับ tab ไปแล้ว ให้ return ทันที ไม่ render -- ตอน unmount ให้ `mountId++` เพื่อ cancel render ที่ค้างอยู่
- **Filter state singleton**: เก็บ state (dateRange, platform) เป็น module-level variable ใน filters.js -- persist ข้าม tab switches โดยไม่ต้องใช้ state management library -- ใช้ CustomEvent / callback array สำหรับ notify tabs

### Chart.js & Dependencies
- **Chart.js CDN ถูก block โดย CSP**: Browser pane CSP อาจ block CDN -- วิธีแก้: `npm install chart.js` แล้ว copy `node_modules/chart.js/dist/chart.umd.js` ไปวางใน public/ โหลดเป็น `<script>` แทน -- ใช้ `window.Chart` ใน module code
- **Word Cloud plugin ไม่เสถียร**: chartjs-chart-wordcloud อาจ incompatible กับ Chart.js 4.x -- ควรเตรียม fallback เป็น horizontal bar chart เสมอ -- กฎ: ถ้าแก้ plugin เกิน 30 นาที ให้สลับไป fallback

### Data & Encoding
- **Demo data ที่สมจริงทำให้ prototype น่าเชื่อถือ**: ข้อมูลตลาดขนมไทย 6 แบรนด์จริง + seasonal patterns ทำให้ stakeholder เห็นภาพ -- ไม่ควรใช้ "Lorem ipsum data"
- **Windows gitignore case-insensitive**: rule `Data/` ใน .gitignore จะ match `data/` ด้วยบน Windows -- ถ้าต้อง track `data/` (lowercase) ต้อง `git add -f data/` -- ระวังเรื่องนี้เมื่อ dev บน Windows แต่ deploy บน Linux

### Process
- **แยก prototype ออกเป็น sub-folder** (`prototype/trend-competitor-social/`) ดีกว่ายัดใน main project -- มี server.js + package.json ของตัวเอง -- ไม่กระทบ codebase หลัก ทดลองได้อิสระ
