# SPBI Architecture Proposal
> Generated: 2026-07-15
> Status: Waiting for approval

## แนวทาง 3 ทาง

### A: Vanilla JS + Supabase CDN (แนะนำ)
- Frontend: Vanilla JS เดิม + Supabase JS client ผ่าน CDN
- Backend: Supabase BaaS (PostgreSQL + Auth + Storage + RLS)
- Hosting: Cloudflare Pages (free, unlimited bandwidth, commercial OK)
- Reuse โค้ดเดิม: 80-90%
- Learning curve: 2/10
- ระยะเวลา MVP: 10-12 สัปดาห์
- ค่าใช้จ่าย: 0 บาท (free tier) → 800-900 บาท/เดือน (Pro)
- ข้อดี: เรียนรู้น้อยสุด, migrate ทีละ tab ได้, reuse สูงสุด
- ข้อเสีย: ไม่มี ES modules, global namespace, ยากเมื่อ 15+ JS files

### B: Vite + ES Modules + Supabase
- Frontend: Vanilla JS + ES modules + Vite build tool
- Backend: Supabase (เหมือน A)
- Hosting: Cloudflare Pages / Vercel
- Reuse โค้ดเดิม: 50-60%
- Learning curve: 5/10
- ระยะเวลา MVP: 14-18 สัปดาห์
- ค่าใช้จ่าย: 0-900 บาท/เดือน
- ข้อดี: โค้ดจัดระเบียบดี, hot reload, tree-shaking
- ข้อเสีย: ต้องเรียน npm/import/export, refactor 13K+ lines ก่อน

### C: Next.js (React) + Supabase
- Frontend: Next.js 15 + React 19 + shadcn/ui + Tailwind
- Backend: Next.js API routes + Supabase
- Hosting: Vercel ($20/seat/month for commercial)
- Reuse โค้ดเดิม: 0-10%
- Learning curve: 9/10
- ระยะเวลา MVP: 20-28 สัปดาห์
- ค่าใช้จ่าย: 700-1,600 บาท/เดือน
- ข้อดี: scalable สุด, ecosystem ใหญ่, หา dev ง่าย
- ข้อเสีย: ต้องเรียน React/JSX/hooks ทั้งหมด, rewrite 100%

## คำแนะนำ: แนวทาง A

**เหตุผล:**
1. ตรงกับ skill ทีม — ไม่ต้องเรียน framework ใหม่
2. Reuse 80-90% — Chart configs, tables, filter, export, CSS
3. Supabase ปิดช่อง "ไม่มี backend skill"
4. Migrate ทีละ tab ได้ — ลดความเสี่ยง
5. Free tier ครอบคลุม MVP
6. Upgrade path: A → B ได้ง่ายเมื่อทีมพร้อม

## Tech Stack (แนวทาง A)
- Vanilla JS + Chart.js 4.4.1 + SheetJS + html2canvas + jsPDF + Leaflet (CDN)
- Supabase JS Client v2 (CDN)
- Supabase PostgreSQL + Auth + RLS + Storage
- Cloudflare Pages (hosting)
- GitHub (version control + auto-deploy)

## Database Schema (MVP)
- monthly_sales, customer_sales, booth_daily, booth_products
- online_sales, staff_targets, cost_data
- user_roles (admin/manager/sales/viewer)
- audit_log (Phase 2)

## RBAC via RLS
- viewer: SELECT only
- sales: SELECT all + UPDATE own zone
- manager: SELECT + UPDATE + INSERT
- admin: full CRUD

## Hosting Choice: Cloudflare Pages > Vercel
- Cloudflare: unlimited bandwidth, free commercial use
- Vercel hobby: ห้าม commercial use (ต้อง Pro $20/seat)
