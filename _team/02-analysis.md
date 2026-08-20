# SPBI Analysis Report
> Generated: 2026-07-15

## User Decisions (จากคำถาม Intake)
| คำถาม | คำตอบ |
|-------|-------|
| Hosting | Cloud (AWS/GCP/Azure) |
| Marketplace data | ทั้งสองแบบ — Import Excel/CSV + API โดยตรง |
| Offline mobile | ไม่จำเป็น |
| LINE notification | ไม่ต้องการ — ใช้ Email + In-app แทน |

## สรุปสถานะปัจจุบัน
- **Architecture**: Static HTML+JS+CSS, เปิดเป็น `file://`
- **Data**: Hardcoded JS objects ~8,000+ lines ใน app.js (13,429 บรรทัดรวม)
- **Auth**: PIN 4 ตัว SHA-256 hashed สำหรับ export เท่านั้น
- **Charts**: Chart.js 4.4.1 (~30+ charts) — reuse ได้ทั้งหมด
- **Libraries**: SheetJS, html2canvas, jsPDF, Leaflet (CDN)

## Gap Analysis
| ด้าน | ปัจจุบัน | ต้องการ | Gap |
|------|---------|--------|-----|
| Architecture | Static file:// | Multi-user web app on Cloud | สร้างใหม่ทั้ง stack |
| Data | Hardcoded JS | Database + API | ย้าย data ทั้งหมด |
| Auth | PIN export-only | Login + 4 roles RBAC | สร้างใหม่ 100% |
| Hosting | Local file | Cloud (AWS/GCP/Azure) | Setup ใหม่ |
| Mobile | ไม่มี | PWA (online-only) | สร้างใหม่ |

## ความเสี่ยงหลัก
1. **Scope creep** (สูงมาก) — 15 features + mobile เกินกำลัง → ตัด MVP เหลือ 5-7
2. **Data migration** (สูง) — hardcoded → DB ตัวเลขอาจผิด → parallel run
3. **No backend skill** (สูง) — ใช้ BaaS (Supabase/Firebase) ลดช่องว่าง
4. **Security** (ปานกลาง) — ใช้ auth service สำเร็จรูป ไม่ทำเอง

## Phasing ที่แนะนำ
### MVP (2-3 เดือน) — 7 features
1. Executive Dashboard (reuse)
2. Sales Performance (reuse)
3. Data Import Excel
4. Login + RBAC (4 roles)
5. Export + permission
6. Booth Management (reuse)
7. Online Management (reuse)

### Phase 2 (เดือนที่ 4-6) — 5 features
8. Product Analytics
9. Cost Analysis
10. Notifications (Email + In-app)
11. KPI Center
12. Audit Log

### Phase 3 (เดือนที่ 7-12) — 4 features
13. CRM
14. Personnel Database
15. Ordering Dashboard
16. Web Forms

## Reuse Assessment
- **Reuse ได้เต็ม**: Chart configs (30+), ตาราง HTML gen, Filter bar, Bell system, Export, CSS theme
- **Reuse บางส่วน**: Render functions (แยก data fetch ออก), Upload handler, Tab navigation
- **ทิ้ง/เขียนใหม่**: Hardcoded data, PIN system, Global state, file:// approach

## Tech Stack Recommendation
แนะนำ **ทางเลือก A** (เรียนรู้น้อยสุด):
- Frontend: Vanilla JS + Chart.js + Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth + Realtime + Storage)
- Hosting: Vercel (free tier เริ่มต้น) → AWS เมื่อ scale
- Mobile: PWA (online-only ตามที่ผู้ใช้เลือก)
- Marketplace: Excel import (Phase 1) + API integration (Phase 2)

## Team Mode: มาตรฐาน 🔧
