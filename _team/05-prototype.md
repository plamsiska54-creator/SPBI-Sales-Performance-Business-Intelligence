# SPBI Prototype Summary
> สร้างเมื่อ: 2026-07-15
> ประเภท: Working HTML Prototype (ไฟล์เดียว, กดใช้ได้จริง)

---

## 1. ไฟล์ต้นแบบและวิธีเปิดใช้

**ไฟล์:** `prototype/spbi-mockup.html`

**วิธีเปิด:** ดับเบิลคลิกไฟล์ หรือลาก drop เข้า browser (Chrome/Edge/Firefox)
ไม่ต้องติดตั้งอะไร ไม่ต้องรัน server ไม่ต้องต่อ internet

---

## 2. สิ่งที่ครอบคลุม / จำลอง / ยังไม่มี

### ของจริง (กดใช้งานได้)
| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| Login Page | หน้า Login สวย professional, กรอก email + password แล้วกด login ได้ |
| Mock Authentication | รองรับ 4 email (admin/manager/sales/viewer) แสดง role ที่ login เข้ามา |
| Dashboard Header | ชื่อระบบ + ชื่อ user + role badge + ปุ่ม Logout |
| Tab Bar | 9 tabs สลับได้จริง เหมือนระบบเดิม |
| KPI Cards | 4 การ์ด (ยอดรวม, เป้าหมาย, Achievement%, YoY) ข้อมูลจำลอง |
| RBAC Demo | ปุ่มสลับ role ด้านบน -> UI เปลี่ยนทันที (ซ่อน/แสดงปุ่ม Export, Import, Admin) |
| Filter Bar | ปุ่มเลือกช่วงเวลา กดสลับได้ |
| Bell Notification | กดกระดิ่ง -> แสดง panel แจ้งเตือน 4 รายการจำลอง |
| Responsive | ดูได้ทั้ง desktop, tablet, mobile |
| Top 5 Sales Table | ตารางพนักงานขาย mock data พร้อม ranking, achievement, สถานะ |

### จำลองไว้ (แสดง placeholder)
| ส่วน | สถานะ |
|------|-------|
| Chart ยอดขายรายเดือน | แสดง mock bar chart ด้วย CSS (ไม่ใช่ Chart.js จริง) |
| Chart สัดส่วนช่องทาง | แสดงสัดส่วน % เป็น tag (ไม่ใช่ donut chart จริง) |
| Tab อื่นๆ (Sales, MT, Booth, Online, Cost, Products, Workflow) | แสดง placeholder บอกว่าจะมีอะไร |
| Upload ข้อมูล | แสดง drag-drop zone จำลอง (ไม่ parse จริง) |

### ยังไม่มี
- เชื่อมต่อ Supabase จริง
- Chart.js กราฟจริง
- Excel upload/parse จริง
- Session persistence (refresh แล้วกลับหน้า login)
- Sub-tabs ภายใน tab ภาพรวม (Budget vs Actual, ช่องทาง, Trend, รายวัน, ลูกค้า)
- Admin Panel UI

---

## 3. ประเด็น UX ที่ตัดสินใจไปแล้ว + ทางเลือกที่ต้องเคาะ

### ตัดสินใจแล้ว
1. **Login Page แยกหน้า** -- ไม่ใช่ PIN overlay บนหน้า dashboard เหมือนเดิม เพราะ Supabase Auth ใช้ email/password
2. **Role Badge แสดงบน Header** -- ให้ผู้ใช้เห็นตลอดว่าตัวเอง role อะไร
3. **สี/ธีม reuse จากระบบเดิม** -- ใช้ CSS variables เดิม (สีส้ม-เหลือง-ครีม) ให้ไม่รู้สึกว่าเปลี่ยนระบบ
4. **Notification panel เป็น overlay** -- ไม่ใช่หน้าแยก เพื่อไม่ขัดจังหวะการทำงาน
5. **Filter bar อยู่ใต้ header** -- sticky เหมือนเดิม ใช้ปุ่มกดแทน dropdown

### ทางเลือกที่ต้องเคาะ
| หัวข้อ | ทางเลือก A | ทางเลือก B |
|--------|-----------|-----------|
| Tab "อัพเดทข้อมูล" | ซ่อนจาก viewer/sales (ปัจจุบัน) | แสดงทุก role แต่ disable ปุ่ม upload |
| ชื่อระบบ | "SPBI Dashboard" (ปัจจุบัน) | "วรรณวนัช Dashboard" เหมือนเดิม |
| Tab order | เรียงตามปัจจุบัน (9 tabs) | รวม tab ที่ใกล้กัน เช่น Online + Amazon |
| กราฟ placeholder | แสดง mock bar chart CSS | แสดงแค่ text placeholder |

---

## 4. คำถามสำหรับด่านอนุมัติ

ผู้ใช้ควรเปิดไฟล์ `prototype/spbi-mockup.html` แล้วทดลองทำสิ่งต่อไปนี้:

1. **Login Flow** -- กด Login ด้วย email ต่างๆ (admin/manager/sales/viewer) -> ดูว่า flow การเข้าสู่ระบบโอเคไหม? หน้า Login ดูดีไหม?

2. **RBAC** -- กดปุ่มสลับ Role ที่แถบดำด้านบน -> ดูว่าปุ่มที่ซ่อน/แสดงตาม role ถูกต้องไหม? ต้องการปรับสิทธิ์อะไรเพิ่มไหม?

3. **Tab Bar** -- กดสลับ tab ต่างๆ -> ลำดับ tab ถูกต้องไหม? ต้องเพิ่ม/ลด/เปลี่ยนชื่อ tab ไหน?

4. **KPI Cards** -- ดู 4 การ์ด KPI -> ข้อมูลที่แสดงเพียงพอไหม? ต้องการ KPI อื่นเพิ่มไหม?

5. **Layout โดยรวม** -- Header, Filter bar, สี, font -> ดูสบายตาไหม? ต้องปรับอะไร?

6. **มือถือ** -- ลองย่อหน้าจอ browser หรือเปิดบนมือถือ -> ใช้งานได้ไหม?

**คำถามหลัก:** "ต้นแบบนี้ตรงกับสิ่งที่ต้องการไหม? มีส่วนไหนอยากปรับก่อนเริ่มเขียนระบบจริง?"
