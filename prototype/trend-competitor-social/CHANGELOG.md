# Changelog

การเปลี่ยนแปลงทั้งหมดของ Trend & Competitor Analysis Dashboard

## [1.0.0] - 2026-08-09

### เพิ่มใหม่ (Added)

#### โครงสร้างระบบ
- สร้างโปรเจกต์ prototype แยกออกจาก Sales Dashboard หลัก
- HTTP server (Node.js) ที่ `server.js` รองรับ static file serving บน port 3500
- SPA tab router (`app.js`) รองรับ hash-based navigation + browser back/forward
- ระบบ mount/unmount ป้องกัน race condition เมื่อสลับ tab เร็ว

#### Tab 1: Product Trends
- Line chart แสดง Top 5 สินค้ายอดนิยม (Search Volume รายสัปดาห์)
- Bar chart แสดงเทรนด์ตามหมวดหมู่สินค้า
- Horizontal bar chart แสดง Top 20 คีย์เวิร์ดยอดนิยม พร้อมตัวบ่งชี้แนวโน้ม (ขาขึ้น/ขาลง/ทรงตัว)
- ตาราง Top 10 สินค้าเรียงตามคะแนน
- กรองข้อมูลตาม platform และช่วงเวลา

#### Tab 2: Competitor Analysis
- Bar chart เปรียบเทียบราคาเฉลี่ยของแต่ละแบรนด์
- Radar chart เปรียบเทียบคะแนนรีวิว 6 มิติ (รสชาติ, คุ้มค่า, บรรจุภัณฑ์, ความสด, จัดส่ง, ภาพรวม)
- Line chart แสดงยอดขายรายสัปดาห์เปรียบเทียบ
- Doughnut chart แสดงส่วนแบ่งตลาด (Market Share)
- ตารางสรุปข้อมูลคู่แข่ง (สินค้า, ราคา, Rating, รีวิว, Market Share, กลยุทธ์)

#### Tab 3: Social Listening
- Multi-line chart แสดง Mentions รายสัปดาห์แยกตามแพลตฟอร์ม (Facebook, Instagram, X, TikTok, Pantip)
- Doughnut chart แสดง Sentiment Analysis (Positive/Neutral/Negative) พร้อมข้อความกลาง
- Horizontal bar chart แสดง Hashtags ยอดนิยม Top 15 พร้อมตัวบ่งชี้แนวโน้ม
- Bar chart แสดง Mentions แยกตามแพลตฟอร์ม พร้อม tooltip ข้อมูล engagement

#### ระบบ Shared
- `chart-factory.js` -- Registry pattern จัดการ Chart.js instance ป้องกัน memory leak
- `data-loader.js` -- Fetch JSON พร้อม in-memory cache + ฟังก์ชันกรอง week range
- `filters.js` -- Filter bar (ช่วงเวลา + แพลตฟอร์ม) พร้อม event emitter สำหรับ reactive update

#### UI/UX
- Dark theme + glass-morphism design สอดคล้องกับ Sales Dashboard หลัก
- Overview cards 3 ใบด้านบน อัพเดตตาม tab ที่เลือก
- Loading state (spinner), Empty state, Error state ครบทุก tab
- Responsive design รองรับ desktop, tablet, mobile
- Tab bar scroll ได้บนจอเล็ก
- Custom scrollbar ธีมมืด
- Animation: fade-in tab content, slide-in overview cards

#### ข้อมูลจำลอง (Demo Data)
- `trends.json` -- ข้อมูลสินค้ายอดนิยม, หมวดหมู่, คีย์เวิร์ด (26 สัปดาห์)
- `competitors.json` -- ข้อมูลคู่แข่ง 6 แบรนด์ (ราคา, รีวิว, ยอดขาย, market share)
- `social.json` -- ข้อมูล social mentions, sentiment, hashtags, platform breakdown

#### DevOps
- `.gitignore` สำหรับ Node.js project
- `package.json` พร้อม dependency (Chart.js 4.4.7)
- Chart.js UMD bundle ในโปรเจกต์ (`public/js/lib/chart.umd.js`) ไม่ต้องพึ่ง CDN
- Launch configuration สำหรับ Claude Code (`.claude/launch.json`)
