# SPBI MVP - Sprint Plan
> Generated: 2026-07-15
> แนวทาง: A (Vanilla JS + Supabase CDN + Cloudflare Pages)
> ระยะเวลารวม: 10-12 สัปดาห์ (5 Sprints x 2 สัปดาห์)
> Status: Waiting for approval
> แทนที่: แผน Phase A Quick Fix (2026-07-14) ซึ่งเสร็จแล้ว

---

## 1. โครงสร้างไฟล์/โฟลเดอร์ของโปรเจกต์ (Target)

```
Project Sales/
├── index.html                  # Landing → redirect to login or dashboard
├── login.html                  # หน้า Login (Supabase Auth)
├── dashboard.html              # หน้า Dashboard หลัก (refactor จาก sales_dashboard.html)
│
├── css/
│   ├── dashboard.css           # [มีอยู่] CSS หลัก — ใช้ต่อ, ปรับเล็กน้อย
│   └── login.css               # [ใหม่] CSS สำหรับหน้า Login
│
├── js/
│   ├── config.js               # [ใหม่] Supabase URL/Key, constants, feature flags
│   ├── supabase-client.js      # [ใหม่] Initialize Supabase client, helper functions
│   ├── auth.js                 # [ใหม่] Login/Logout, session guard, role check
│   ├── data-service.js         # [ใหม่] CRUD functions — fetch/insert/update จาก Supabase
│   ├── overview.js             # [ใหม่] แยกจาก app.js — tab ภาพรวมยอดขาย
│   ├── sales.js                # [ใหม่] แยกจาก app.js — tab พนักงานขาย (sub-tab ov-sales)
│   ├── booth.js                # [ใหม่] แยกจาก app.js — tab Booth
│   ├── online.js               # [ใหม่] แยกจาก app.js — tab Online
│   ├── import.js               # [ใหม่] Excel upload → parse → insert Supabase
│   ├── export.js               # [แก้ไข] แยกจาก app.js — export PDF/screenshot + permission
│   ├── charts.js               # [ใหม่] Chart.js shared configs & helper functions
│   ├── ui.js                   # [ใหม่] Tab switching, filter bar, bell, shared UI
│   └── app.js                  # [มีอยู่] เก็บไว้เป็น legacy fallback ระหว่าง migration
│
├── sql/
│   ├── 001_schema.sql          # [ใหม่] สร้างตาราง + indexes
│   ├── 002_rls_policies.sql    # [ใหม่] RLS policies สำหรับ 4 roles
│   ├── 003_seed_data.sql       # [ใหม่] seed data จาก hardcoded objects
│   └── 004_functions.sql       # [ใหม่] DB functions (aggregation views, etc.)
│
├── _team/                      # เอกสารทีม (ไม่ deploy)
├── _team-knowledge/            # มาตรฐาน+บทเรียน (ไม่ deploy)
├── Data/                       # ไฟล์ Excel ดิบ (ไม่ deploy)
│
├── sales_dashboard.html        # [legacy] เก็บไว้ระหว่าง parallel run
├── .gitignore                  # [มีอยู่] เพิ่ม patterns ใหม่
├── _headers                    # [ใหม่] Cloudflare Pages headers (CSP, cache)
└── _redirects                  # [ใหม่] Cloudflare Pages redirects
```

### คำอธิบายบทบาทไฟล์สำคัญ

| ไฟล์ | หน้าที่ |
|------|---------|
| `config.js` | เก็บ Supabase URL + anon key, ค่าคงที่ (MONTHS, CH_NAMES, CH_COLORS), feature flags สำหรับ toggle ระหว่าง legacy/new |
| `supabase-client.js` | สร้าง Supabase client instance, export helper: `getSupabase()`, error handler |
| `auth.js` | Login form handler, `checkSession()` guard, `getUserRole()`, redirect ถ้าไม่มี session |
| `data-service.js` | Abstraction layer: `fetchMonthlySales()`, `fetchBoothData()` ฯลฯ — เรียก Supabase แล้ว return data ในรูปแบบเดิมที่ render functions คาดหวัง |
| `overview.js` | ย้าย render functions ของ tab overview จาก app.js — เปลี่ยน data source จาก global vars เป็น data-service |
| `charts.js` | Shared chart configs (colors, fonts, tooltip format) — reuse จาก app.js |
| `ui.js` | `showTab()`, `showSubTab()`, filter bar logic, bell notification, scroll buttons |
| `import.js` | SheetJS parse → validate → `supabase.from('table').insert()` |
| `export.js` | html2canvas + jsPDF + permission check via role |

---

## 2. Database Tables (Supabase PostgreSQL)

### Sprint 1 — Foundation Tables
```sql
-- Auth: ใช้ Supabase Auth built-in (auth.users)

-- Custom profile + role
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('admin','manager','sales','viewer')),
  zone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger: auto-create profile on signup
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, '', 'viewer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Sprint 2 — Sales Data Tables
```sql
CREATE TABLE public.monthly_targets (
  id BIGSERIAL PRIMARY KEY,
  year INT NOT NULL,
  month TEXT NOT NULL,          -- 'Jan','Feb',...
  channel TEXT NOT NULL,        -- 'Modern Trade','Booth','Online','Amazon'
  target_amount NUMERIC(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(year, month, channel)
);

CREATE TABLE public.monthly_actuals (
  id BIGSERIAL PRIMARY KEY,
  year INT NOT NULL,
  month TEXT NOT NULL,
  channel TEXT NOT NULL,
  actual_amount NUMERIC(15,2) NOT NULL,
  source TEXT DEFAULT 'manual', -- 'manual','import','api'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(year, month, channel)
);

CREATE TABLE public.staff_sales (
  id BIGSERIAL PRIMARY KEY,
  year INT NOT NULL,
  month TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  zone TEXT NOT NULL,
  target_amount NUMERIC(15,2),
  actual_amount NUMERIC(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(year, month, staff_name)
);

CREATE TABLE public.customer_sales (
  id BIGSERIAL PRIMARY KEY,
  year INT NOT NULL,
  month TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  channel TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Sprint 3 — Booth & Online Tables
```sql
CREATE TABLE public.booth_daily (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  booth_name TEXT NOT NULL,
  sales_amount NUMERIC(12,2) NOT NULL,
  items_sold INT,
  returns INT DEFAULT 0,
  damaged INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, booth_name)
);

CREATE TABLE public.booth_products (
  id BIGSERIAL PRIMARY KEY,
  booth_daily_id BIGINT REFERENCES booth_daily(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL,
  amount NUMERIC(12,2) NOT NULL
);

CREATE TABLE public.online_sales (
  id BIGSERIAL PRIMARY KEY,
  year INT NOT NULL,
  month TEXT NOT NULL,
  platform TEXT NOT NULL,       -- 'Tiktok','Shopee','Lazada','Direct'
  target_amount NUMERIC(15,2),
  actual_amount NUMERIC(15,2) NOT NULL,
  gross_amount NUMERIC(15,2),
  expense_amount NUMERIC(15,2) DEFAULT 0,
  units_sold INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(year, month, platform)
);
```

---

## 3. Sprint Plan — งานย่อยเรียงตามลำดับ

---

### Sprint 1: Foundation (สัปดาห์ที่ 1-2)
**เป้าหมาย:** โครงสร้างโปรเจกต์ + Supabase + Auth + Deploy pipeline ทำงานได้

| Task ID | สิ่งที่ต้องทำ | ไฟล์ที่เกี่ยวข้อง | ขึ้นกับ | เกณฑ์เสร็จ |
|---------|--------------|-------------------|---------|-----------|
| S1-01 | สร้าง Supabase project + ตั้งค่า Auth (email+password) | Supabase Console | - | Login ด้วย email ได้, มี anon key |
| S1-02 | สร้าง `profiles` table + trigger auto-create on signup | `sql/001_schema.sql` | S1-01 | User signup แล้วมี row ใน profiles อัตโนมัติ |
| S1-03 | สร้าง RLS policies สำหรับ profiles | `sql/002_rls_policies.sql` | S1-02 | User อ่านได้เฉพาะ profile ตัวเอง, admin อ่านได้ทั้งหมด |
| S1-04 | สร้าง `config.js` + `supabase-client.js` | `js/config.js`, `js/supabase-client.js` | S1-01 | `supabase.auth.getSession()` ทำงานได้ใน browser |
| S1-05 | สร้าง `login.html` + `login.css` + `auth.js` | `login.html`, `css/login.css`, `js/auth.js` | S1-04 | Login/Logout ทำงาน, redirect ไป dashboard เมื่อ login สำเร็จ |
| S1-06 | สร้าง session guard บน dashboard.html | `js/auth.js`, `dashboard.html` | S1-05 | เข้า dashboard โดยไม่ login → redirect ไป login.html |
| S1-07 | แยก `ui.js` จาก app.js (tab switch, filter bar, scroll buttons) | `js/ui.js` | - | Tab switching + filter bar ทำงานเหมือนเดิมบน dashboard.html |
| S1-08 | สร้าง `index.html` (redirect) + `_headers` + `_redirects` | `index.html`, `_headers`, `_redirects` | - | Cloudflare Pages config พร้อม |
| S1-09 | Setup Cloudflare Pages + GitHub auto-deploy | Cloudflare Dashboard, `.gitignore` | S1-08 | Push to main → auto deploy, เข้า URL ได้ |
| S1-10 | สร้าง test user 4 roles (admin/manager/sales/viewer) | Supabase Console | S1-03 | Login ได้ทุก role, แสดง role บน UI |

**Sprint 1 Definition of Done:**
- [ ] Login/Logout ทำงานได้จริงบน Cloudflare Pages URL
- [ ] Session guard ป้องกัน dashboard access โดยไม่ login
- [ ] Tab switching + filter bar ทำงานเหมือนเดิม (legacy data ยังใช้ app.js)
- [ ] Auto-deploy จาก GitHub main branch สำเร็จ
- [ ] ระบบเดิม (sales_dashboard.html เปิด file://) ยังใช้ได้ 100%
- [ ] ไม่มี JS console errors ใน browser

---

### Sprint 2: Executive Dashboard + Sales Performance (สัปดาห์ที่ 3-4)
**เป้าหมาย:** Tab ภาพรวมยอดขาย + พนักงานขาย ดึงข้อมูลจาก Supabase

| Task ID | สิ่งที่ต้องทำ | ไฟล์ที่เกี่ยวข้อง | ขึ้นกับ | เกณฑ์เสร็จ |
|---------|--------------|-------------------|---------|-----------|
| S2-01 | สร้างตาราง monthly_targets, monthly_actuals, staff_sales, customer_sales | `sql/001_schema.sql` | S1-02 | ตารางสร้างสำเร็จใน Supabase |
| S2-02 | RLS policies สำหรับ sales tables | `sql/002_rls_policies.sql` | S2-01 | viewer=SELECT, sales=SELECT+own zone, manager=+INSERT, admin=CRUD |
| S2-03 | Seed script: ย้าย hardcoded data จาก app.js → SQL INSERT | `sql/003_seed_data.sql` | S2-01 | ข้อมูลครบทุก object ที่ระบุด้านล่าง |
| S2-04 | สร้าง `data-service.js` — functions: `fetchOverviewData()`, `fetchStaffSales()` | `js/data-service.js` | S2-03, S1-04 | Functions return data ในรูปแบบเดิมที่ render functions ใช้ |
| S2-05 | สร้าง `charts.js` — แยก shared chart configs จาก app.js | `js/charts.js` | - | Chart colors, fonts, tooltip format เป็น reusable functions |
| S2-06 | สร้าง `overview.js` — ย้าย render functions ของ tab overview | `js/overview.js` | S2-04, S2-05 | Tab ภาพรวมแสดง KPI, charts, tables จาก Supabase data |
| S2-07 | สร้าง `sales.js` — ย้าย render functions ของ sub-tab พนักงานขาย | `js/sales.js` | S2-04, S2-05 | Person cards, detail panel, mini charts ทำงานจาก Supabase |
| S2-08 | Feature flag: toggle ระหว่าง legacy (app.js) กับ new (data-service) | `js/config.js` | S2-06 | `DATA_SOURCE.overview = 'supabase'` หรือ `'legacy'` เปลี่ยนได้ |
| S2-09 | Parallel run: เปรียบเทียบตัวเลข legacy vs Supabase | manual testing | S2-06, S2-07 | ตัวเลขทุกตัวตรงกัน (tolerance: ไม่เกิน 1 บาท จาก rounding) |
| S2-10 | แยก sub-tab อื่นของ overview (channel, trend, daily, customer) | `js/overview.js` | S2-06 | Sub-tabs ทั้งหมดใน overview ทำงานจาก Supabase |

**Data Migration ใน Sprint นี้ (hardcoded objects ที่ย้าย):**
| Hardcoded Object ใน app.js | Target Table |
|---------------------------|--------------|
| `CHANNEL_MONTHLY` | `monthly_actuals` + `monthly_targets` |
| `MONTHLY_BUDGET` (ถ้ามี) | `monthly_targets` |
| `SALES_MONTHLY` | `staff_sales` (actual_amount) |
| `SALES_YTD_TARGET` | `staff_sales` (target — yearly) |
| `SALES_MTH_TARGET` | `staff_sales` (target — monthly) |
| `CUST_MONTHLY_STATIC` | `customer_sales` |

**Sprint 2 Definition of Done:**
- [ ] Tab ภาพรวมยอดขาย ทำงานครบทุก sub-tab จาก Supabase data
- [ ] Sub-tab พนักงานขาย แสดง person cards + detail panel จาก Supabase
- [ ] ตัวเลข Budget/Actual/Achievement ตรงกับ legacy 100%
- [ ] Feature flag สลับ legacy/supabase ได้โดยไม่พัง
- [ ] Charts ทั้งหมดใน overview tab render ถูกต้อง

---

### Sprint 3: Booth + Online + Data Import (สัปดาห์ที่ 5-7)
**เป้าหมาย:** Tab Booth + Online ดึงจาก Supabase, Excel Import ทำงานได้จริง

| Task ID | สิ่งที่ต้องทำ | ไฟล์ที่เกี่ยวข้อง | ขึ้นกับ | เกณฑ์เสร็จ |
|---------|--------------|-------------------|---------|-----------|
| S3-01 | สร้างตาราง booth_daily, booth_products, online_sales | `sql/001_schema.sql` | S1-02 | ตารางสร้างสำเร็จ |
| S3-02 | RLS policies สำหรับ booth + online tables | `sql/002_rls_policies.sql` | S3-01 | ทดสอบ RLS ผ่านทุก role |
| S3-03 | Seed data: ย้าย Booth hardcoded data → SQL | `sql/003_seed_data.sql` | S3-01 | Booth daily data ย้ายครบ |
| S3-04 | Seed data: ย้าย Online hardcoded data → SQL | `sql/003_seed_data.sql` | S3-01 | `OL_CUST_STATIC`, `OL_UNITS_*`, `OL_EXPENSE` ย้ายครบ |
| S3-05 | เพิ่ม data-service functions: `fetchBoothData()`, `fetchOnlineSales()` | `js/data-service.js` | S3-03, S3-04 | Functions return data ในรูปแบบเดิม |
| S3-06 | สร้าง `booth.js` — ย้าย render functions จาก app.js | `js/booth.js` | S3-05 | Tab Booth แสดง charts + tables จาก Supabase |
| S3-07 | สร้าง `online.js` — ย้าย render functions จาก app.js | `js/online.js` | S3-05 | Tab Online แสดง platform comparison, units, expense |
| S3-08 | สร้าง `import.js` — Excel upload core: parse + validate + insert | `js/import.js` | S3-01 | Upload Excel → data ปรากฏใน Supabase |
| S3-09 | Import: template validation สำหรับ monthly sales Excel | `js/import.js` | S3-08 | ตรวจ column names, data types ก่อน insert |
| S3-10 | Import: template validation สำหรับ booth daily Excel | `js/import.js` | S3-08 | Upload booth Excel → booth_daily + booth_products |
| S3-11 | Import: error messages ภาษาไทย + duplicate detection | `js/import.js` | S3-08 | ข้อมูลผิด format → error ชัดเจน, ข้อมูลซ้ำ → ถาม overwrite |
| S3-12 | Parallel run: เปรียบเทียบ Booth + Online ตัวเลข | manual testing | S3-06, S3-07 | ตัวเลขตรงกับ legacy |

**Data Migration ใน Sprint นี้:**
| Hardcoded Object ใน app.js | Target Table |
|---------------------------|--------------|
| Booth daily data objects | `booth_daily` + `booth_products` |
| `OL_CUST_STATIC` | `online_sales` (target + actual per platform) |
| `OL_UNITS_2026` / `OL_UNITS_2025` | `online_sales` (units_sold) |
| `OL_EXPENSE` | `online_sales` (gross_amount + expense_amount) |

**Sprint 3 Definition of Done:**
- [ ] Tab Booth + Online ทำงานครบจาก Supabase
- [ ] Excel Import ใช้งานได้จริง (upload → parse → insert → แสดงผล)
- [ ] Error handling: ไฟล์ผิด format, ข้อมูลซ้ำ, ค่าว่าง → แจ้ง user ภาษาไทย
- [ ] ตัวเลข Booth + Online ตรงกับ legacy 100%

---

### Sprint 4: Export + Permission + RBAC UI (สัปดาห์ที่ 8-9)
**เป้าหมาย:** Export ทำงานตาม role, RBAC ครบ 4 roles, ลบ legacy PIN

| Task ID | สิ่งที่ต้องทำ | ไฟล์ที่เกี่ยวข้อง | ขึ้นกับ | เกณฑ์เสร็จ |
|---------|--------------|-------------------|---------|-----------|
| S4-01 | สร้าง `export.js` — แยก export logic จาก app.js | `js/export.js` | S1-05 | Export PDF/screenshot ทำงานเหมือนเดิม |
| S4-02 | Export permission: ตรวจ role ก่อน export | `js/export.js`, `js/auth.js` | S4-01 | viewer ไม่มีปุ่ม export, sales+manager+admin export ได้ |
| S4-03 | ลบ PIN system เดิม — ใช้ Supabase Auth แทน | `js/auth.js`, `dashboard.html` | S4-02 | ไม่มี PIN dialog, ไม่มี hardcoded hash ใน code |
| S4-04 | RBAC UI: ซ่อน/แสดง elements ตาม role | `js/auth.js`, `js/ui.js` | S1-05 | viewer: ไม่เห็นปุ่ม edit/import/export, sales: เห็น zone ตัวเอง, admin: เห็นทั้งหมด |
| S4-05 | Admin panel: จัดการ user roles | `dashboard.html`, `js/auth.js` | S4-04 | Admin เปลี่ยน role ของ user ได้, non-admin ไม่เห็น panel |
| S4-06 | Tab อัพเดทข้อมูล — เชื่อม import.js กับ Supabase | `dashboard.html`, `js/import.js` | S3-08 | Tab อัพเดทข้อมูล upload ไป DB ได้จริง |
| S4-07 | Export: รองรับ export เฉพาะ tab/ช่วงเวลาที่เลือก | `js/export.js` | S4-01 | Export ได้ตาม filter ที่ตั้งไว้ |
| S4-08 | Loading states + error toast สำหรับทุก async operation | `js/ui.js` | - | ทุก fetch/insert แสดง loading spinner, error แสดง toast ภาษาไทย |

**Sprint 4 Definition of Done:**
- [ ] Export PDF/Screenshot ทำงานตาม role permission
- [ ] PIN system ถูกลบออก 100% — ไม่มี `_checkPin`, ไม่มี hash ใน source
- [ ] 4 roles แสดง UI ต่างกันตามที่กำหนด
- [ ] Admin จัดการ user roles ได้
- [ ] Loading/error states ครบทุกจุดที่ fetch data

---

### Sprint 5: Polish + Cutover + QA (สัปดาห์ที่ 10-12)
**เป้าหมาย:** ขัดเกลา, ทดสอบ, ลบ legacy code, cutover ไปใช้ระบบใหม่

| Task ID | สิ่งที่ต้องทำ | ไฟล์ที่เกี่ยวข้อง | ขึ้นกับ | เกณฑ์เสร็จ |
|---------|--------------|-------------------|---------|-----------|
| S5-01 | ลบ feature flags — ใช้ Supabase data เท่านั้น | `js/config.js`, ทุกไฟล์ JS | S2-09, S3-12 | ไม่มี legacy data path เหลือ |
| S5-02 | ลบ hardcoded data ออกจาก app.js (หรือลบ app.js ทั้งไฟล์) | `js/app.js` | S5-01 | ไม่มี hardcoded sales data ใน JS files |
| S5-03 | Responsive testing: desktop (1920px) + tablet (768px) + mobile (360px) | ทุกหน้า | - | ทุกหน้าใช้งานได้ ไม่ล้นหน้าจอ |
| S5-04 | Performance: ทุก tab load ภายใน 5 วินาที | ทุกหน้า | - | วัดด้วย DevTools Network (4G simulation) < 5s |
| S5-05 | Security review: ไม่มี credentials ใน source, CSP headers ถูกต้อง | `_headers`, ทุกไฟล์ JS | - | ไม่มี secret ใน code, anon key ใช้ผ่าน CDN ได้ปลอดภัย (RLS ป้องกัน) |
| S5-06 | Error handling review: ทุก Supabase call มี try/catch | ทุกไฟล์ JS | - | ไม่มี uncaught promise rejection ใน console |
| S5-07 | Cross-browser test: Chrome, Edge, Firefox | ทุกหน้า | - | ทำงานครบทุก browser |
| S5-08 | สร้าง user manual (วิธี login, import, ดู dashboard, export) | `_team/user-manual.md` | - | ผู้ใช้อ่านแล้วใช้งานได้เอง |
| S5-09 | Cutover: announce URL ใหม่, migrate production data ล่าสุด | - | S5-01 | ทีมใช้ URL ใหม่ได้ทันที |
| S5-10 | Archive legacy: ย้าย sales_dashboard.html ไป branch `legacy/static-v1` | git | S5-09 | Main branch มีแต่ระบบใหม่ |

**Sprint 5 Definition of Done:**
- [ ] ทุก feature ผ่าน QA
- [ ] Legacy code ถูกลบออกจาก main branch
- [ ] Production URL ทำงานได้สมบูรณ์
- [ ] User manual พร้อม
- [ ] ทุกคนในทีมเข้าใช้งานระบบใหม่ได้

---

## 4. Migration Strategy — ย้ายจาก Hardcoded ไป Supabase

### หลักการ: ย้ายทีละ tab, parallel run ตลอด, ไม่ตัด legacy จนกว่าจะมั่นใจ

```
Phase 1 (Sprint 2): Overview + Sales
  app.js hardcoded objects:
  ├── CHANNEL_MONTHLY        → monthly_targets + monthly_actuals
  ├── MONTHLY_BUDGET         → monthly_targets
  ├── SALES_MONTHLY          → staff_sales
  ├── SALES_YTD_TARGET       → staff_sales
  ├── SALES_MTH_TARGET       → staff_sales
  └── CUST_MONTHLY_STATIC    → customer_sales

Phase 2 (Sprint 3): Booth + Online
  app.js hardcoded objects:
  ├── Booth daily data       → booth_daily + booth_products
  ├── OL_CUST_STATIC         → online_sales
  ├── OL_UNITS_2026/2025     → online_sales
  └── OL_EXPENSE             → online_sales

Phase 3 (Sprint 5): Cleanup
  ├── ลบ hardcoded objects ออกจาก JS
  ├── ลบ feature flags
  └── ลบหรือ archive app.js
```

### วิธีทำ Parallel Run

**ขั้นที่ 1 — Feature flag ใน `config.js`:**
```js
const DATA_SOURCE = {
  overview: 'supabase',  // 'legacy' | 'supabase'
  sales:    'supabase',
  booth:    'legacy',
  online:   'legacy',
};
```

**ขั้นที่ 2 — `data-service.js` เช็ค flag:**
```js
async function fetchOverviewData() {
  if (DATA_SOURCE.overview === 'legacy') {
    return getLegacyOverviewData(); // อ่านจาก global vars เดิม
  }
  const { data, error } = await supabase
    .from('monthly_actuals')
    .select('*')
    .eq('year', currentYear);
  if (error) throw error;
  return transformToLegacyFormat(data);
}
```

**ขั้นที่ 3 — เปรียบเทียบ:**
- เปิด 2 browser tabs: legacy file:// vs new Cloudflare URL
- เทียบตัวเลขทุกจุดใน tab ที่ย้ายแล้ว
- ถ้าไม่ตรง → debug → แก้ seed data → ลองใหม่

**ขั้นที่ 4 — Cutover:**
- ตัวเลขตรง → เปลี่ยน flag เป็น `'supabase'` → deploy → ตรวจอีกรอบ → ลบ flag

---

## 5. Definition of Done (MVP ทั้งหมด)

MVP ถือว่าเสร็จสมบูรณ์เมื่อครบ **ทุกข้อ** ต่อไปนี้:

### Features
- [ ] **F1 Executive Dashboard** — Tab ภาพรวมยอดขาย: KPI cards, Budget vs Actual chart, trend line, pie chart, monthly table, channel breakdown — ครบทุก sub-tab, ข้อมูลจาก Supabase
- [ ] **F2 Sales Performance** — Person cards + detail panel + mini charts สำหรับพนักงานขายทุกคน, monthly target vs actual per person
- [ ] **F3 Data Import** — Upload Excel (.xlsx) สำหรับ monthly sales + booth daily → parse → validate → insert → dashboard refresh ทันที
- [ ] **F4 Login + RBAC** — Login email+password ผ่าน Supabase Auth, 4 roles (admin/manager/sales/viewer), UI ต่างกันตาม role
- [ ] **F5 Export + Permission** — Export PDF/Screenshot ทำงาน, ต้อง login + role sales ขึ้นไปจึงจะ export ได้
- [ ] **F6 Booth Management** — Tab Booth: daily sales per booth, product breakdown, returns/damaged tracking — ข้อมูลจาก Supabase
- [ ] **F7 Online Management** — Tab Online: platform comparison (Tiktok/Shopee/Lazada/Direct), units, gross vs net, expense tracking

### Technical
- [ ] **Hosting** — Deploy บน Cloudflare Pages, auto-deploy จาก GitHub main branch
- [ ] **Security** — ไม่มี credentials/PIN ใน source code, Supabase Auth + RLS ป้องกัน data access
- [ ] **Performance** — ทุก tab load ภายใน 5 วินาที (desktop, 4G network)
- [ ] **Responsive** — ใช้งานได้บน desktop (1920px), tablet (768px), mobile (360px)
- [ ] **Error Handling** — ทุก async operation มี loading state + error message ภาษาไทย, ไม่มี uncaught errors
- [ ] **Data Integrity** — ตัวเลขตรงกับระบบเดิม 100% (parallel run verified ทุก tab)
- [ ] **No Console Errors** — ไม่มี JS error/warning ใน browser console ระหว่างใช้งานปกติ

---

## 6. แนวทางการทดสอบ

### 6.1 Unit-level Testing (ทำระหว่าง dev — ทุก task)

| ทดสอบอะไร | วิธี | เกณฑ์ผ่าน |
|-----------|------|----------|
| Supabase connection | เปิด DevTools Console → `supabase.from('profiles').select('*')` | ได้ data กลับมา, ไม่มี error |
| Auth flow | Login → `supabase.auth.getSession()` → Logout → `getSession()` | Session มี/หายไป ตามที่คาด |
| RLS policies | Login แต่ละ role → query data → ตรวจ rows ที่ได้ | viewer=SELECT only, admin=CRUD, sales=own zone |
| Data service functions | เรียก `fetchOverviewData()` → log return value | Data structure ตรงกับที่ render function คาดหวัง |
| Excel parse | Upload .xlsx, .xls, .csv, ไฟล์เสีย, ไฟล์ว่าง | Parse สำเร็จ/error message ตามที่คาด |
| Chart rendering | เปลี่ยน filter (เดือน/ไตรมาส/ปี) → ดู chart | Chart update ตาม filter |

### 6.2 Integration Testing (ทำจบแต่ละ Sprint)

| ทดสอบอะไร | วิธี | เกณฑ์ผ่าน |
|-----------|------|----------|
| Login → Dashboard → Filter → Chart | User flow จริง: login → เลือก tab → เปลี่ยน filter → ดูกราฟ | ทุกขั้นตอนต่อเนื่อง ไม่ค้าง |
| Import → Refresh → ดูข้อมูลใหม่ | Upload Excel ที่มีข้อมูลใหม่ → กลับไปดู tab ที่เกี่ยวข้อง | ข้อมูลใหม่แสดงทันทีใน chart + table |
| Role-based access | Login แต่ละ role → ตรวจ UI elements ทั้งหน้า | ปุ่ม/เมนูแสดง/ซ่อนถูกต้องตาม role |
| Export flow | เลือก tab → เลือก filter → กด export | PDF/Screenshot content ตรง filter |
| Parallel run comparison | เปิด legacy + new side-by-side, เทียบตัวเลขทุกจุด | ทุกตัวเลขตรง (tolerance 1 บาท) |

### 6.3 User Acceptance Testing (ก่อน Cutover — Sprint 5)

| ทดสอบอะไร | ผู้ทดสอบ | เกณฑ์ผ่าน |
|-----------|---------|----------|
| ดู Executive Dashboard ประจำวัน | Manager | ตัวเลขตรง, อ่านง่าย, load ไม่เกิน 5 วินาที |
| Import ข้อมูลขาย monthly | Admin | Upload → ข้อมูลเข้า → แสดงใน chart ถูกต้อง |
| ดู Booth performance | Sales staff | เห็นข้อมูล booth ที่รับผิดชอบ |
| Export รายงานส่งผู้บริหาร | Manager | PDF สวย ข้อมูลถูก filter ตรง |
| เข้าระบบจาก mobile | ทุกคน | หน้าจอไม่ล้น ใช้งานได้ |
| พยายามเข้าถึงข้อมูลที่ไม่มีสิทธิ์ | Viewer | ไม่เห็นปุ่ม export/import, ไม่สามารถ query data ผ่าน console ได้ (RLS block) |

### 6.4 Edge Cases ที่ต้องทดสอบ

- Upload Excel ที่มีแถวว่าง / column ไม่ตรง / ภาษาไทยเพี้ยน / encoding ผิด
- Login ด้วย password ผิดซ้ำหลายครั้ง
- Session หมดอายุขณะดู dashboard → redirect ไป login อัตโนมัติ (ไม่ใช่หน้าว่าง)
- Internet ขาดขณะ fetch data → แสดง error message ภาษาไทย
- เปิด dashboard 2 tabs พร้อมกัน → session ไม่ conflict
- Filter เลือกเดือนที่ไม่มีข้อมูล → แสดง "ไม่มีข้อมูล" ไม่ใช่ chart ว่างเปล่า
- Upload ไฟล์ขนาดใหญ่ (>5MB) → แจ้ง warning หรือ handle ได้
- Upload ข้อมูลซ้ำ (เดือนเดียวกัน) → ถาม overwrite หรือ skip

---

## 7. ความเสี่ยงของแผน & แผนสำรอง

| # | ความเสี่ยง | ระดับ | สัญญาณเตือน | แผนสำรอง |
|---|-----------|-------|------------|---------|
| R1 | **Data migration ตัวเลขไม่ตรง** — ย้าย hardcoded → DB แล้วตัวเลข round ผิด หรือ missing rows | สูง | Parallel run เห็นตัวเลขต่าง | เปรียบเทียบทีละ tab, ตรวจ seed SQL ทีละ row, ไม่ cutover จนกว่าตรง 100%, ใช้ feature flag กลับไป legacy ได้ทันที |
| R2 | **Supabase free tier ไม่พอ** — 500MB DB / 1GB storage / 50K MAU | ต่ำ | DB size > 400MB | MVP data ไม่เกิน 50MB, ถ้าเกินให้ upgrade Pro ($25/เดือน ~900 บาท) |
| R3 | **app.js 13K+ lines แยกยาก** — function dependencies ซับซ้อน, global vars ข้าม tab | ปานกลาง | แยก function แล้ว tab เดิมพัง | แยกทีละกลุ่ม function (overview, booth, online), ทดสอบทุกครั้ง, ถ้าติดขัดให้เก็บ function ที่มี dependency เยอะไว้ใน shared file |
| R4 | **ทีมไม่คุ้น Supabase** — RLS syntax, Auth API, JS client | ปานกลาง | Sprint 1 ล่าช้า > 3 วัน | Sprint 1 มี buffer 2 สัปดาห์เต็ม, ดู Supabase official tutorials ก่อนเริ่ม, เริ่มจาก simple query ก่อน |
| R5 | **SheetJS parse Excel ภาษาไทย encoding ผิด** | ปานกลาง | ข้อมูลไทยเป็น ???? | ใช้ SheetJS CDN ตัวเดิม (ใช้งานได้อยู่แล้ว), ทดสอบกับไฟล์จริงใน Data/ folder, fallback: ให้ user save as CSV UTF-8 |
| R6 | **Scope creep** — อยากเพิ่ม feature ระหว่าง sprint | สูง | มี task นอก sprint plan | ยึด MVP 7 features เท่านั้น, feature ใหม่ใส่ backlog สำหรับ Phase 2, ไม่เพิ่มระหว่าง sprint |
| R7 | **Cloudflare Pages deploy ล้มเหลว** | ต่ำ | Build fail / deploy timeout | Static site ไม่มี build step (ไม่มี Vite/webpack), deploy = copy files, fallback: deploy manual ผ่าน Cloudflare Dashboard |
| R8 | **Internet ไม่เสถียรสำหรับ Supabase** — ผู้ใช้ในออฟฟิศ internet ช้า | ต่ำ | Dashboard load ช้า > 5s | Supabase Singapore region (ใกล้ไทย), cache data ใน memory หลัง fetch ครั้งแรก, แสดง loading state ระหว่างรอ |

### ถ้า Sprint ล่าช้า — แผนสำรอง

- **Sprint 1 ล่าช้า:** ยืดได้ 1 สัปดาห์ เพราะเป็น foundation สำคัญ, ตัดจาก Sprint 5 แทน
- **Sprint 3 ล่าช้า:** ลด scope import — ทำแค่ monthly sales import ก่อน, booth import ย้ายไป Sprint 4
- **Sprint 4 ล่าช้า:** ลด admin panel — ให้ admin จัดการ roles ผ่าน Supabase Console แทน custom UI
- **Sprint 5 ล่าช้า:** ลด responsive polish — ทำ desktop ให้เสร็จก่อน, mobile polish ย้ายไป Phase 2

---

## 8. Dependencies Diagram

```
S1-01 Supabase Setup ─────────────────────────────────────────────
  │                                                                │
  ├── S1-02 profiles table                                         │
  │     ├── S1-03 RLS policies                                     │
  │     │     └── S1-10 test users (4 roles)                       │
  │     │                                                          │
  │     ├── S2-01 sales tables ─────────────────────────────       │
  │     │     ├── S2-02 RLS                                 │      │
  │     │     ├── S2-03 seed data                           │      │
  │     │     │     └── S2-04 data-service ──────────       │      │
  │     │     │           ├── S2-06 overview.js      │      │      │
  │     │     │           ├── S2-07 sales.js         │      │      │
  │     │     │           └── S2-10 overview subs    │      │      │
  │     │     │                                      │      │      │
  │     │     └── S3-01 booth+online tables ─────────│──────       │
  │     │           ├── S3-03 seed booth             │             │
  │     │           ├── S3-04 seed online            │             │
  │     │           ├── S3-05 data-service (ext) ────│             │
  │     │           │     ├── S3-06 booth.js         │             │
  │     │           │     └── S3-07 online.js        │             │
  │     │           └── S3-08 import.js              │             │
  │     │                 ├── S3-09 validate monthly  │             │
  │     │                 ├── S3-10 validate booth    │             │
  │     │                 └── S3-11 error messages    │             │
  │     │                                             │             │
  └── S1-04 config.js + supabase-client.js ───────────             │
        └── S1-05 auth.js + login.html                             │
              ├── S1-06 session guard                              │
              ├── S4-01 export.js                                  │
              │     └── S4-02 export permission                    │
              │           └── S4-03 ลบ PIN system                  │
              └── S4-04 RBAC UI                                    │
                    └── S4-05 admin panel                          │
                                                                   │
S1-07 ui.js ─── (parallel — ไม่ขึ้นกับ Supabase) ─────────────────
S2-05 charts.js ─── (parallel — ไม่ขึ้นกับ Supabase) ─────────────
S1-08 index.html + headers ─── S1-09 Cloudflare deploy ───────────
```

**งานที่ทำ parallel ได้ (ไม่ต้องรอ Supabase):**
- S1-07 ui.js — แยกจาก app.js ทำได้เลย
- S1-08 Cloudflare config — ทำได้เลย
- S2-05 charts.js — แยก shared chart configs ทำได้เลย
- S4-08 loading/error UI — ทำได้เลย

---

## 9. สรุป Timeline

```
สัปดาห์  1-2   Sprint 1: Foundation
                ├── Supabase project + Auth setup
                ├── Login page + session guard
                ├── UI extraction (ui.js)
                └── Cloudflare Pages deploy
                → ผลลัพธ์: Login ได้, deploy ได้, tab switch ทำงาน

สัปดาห์  3-4   Sprint 2: Executive Dashboard + Sales
                ├── Sales data tables + seed
                ├── data-service.js + overview.js + sales.js
                └── Parallel run verification
                → ผลลัพธ์: Tab ภาพรวม + พนักงานขาย จาก DB

สัปดาห์  5-7   Sprint 3: Booth + Online + Import
                ├── Booth/Online tables + seed
                ├── booth.js + online.js
                └── import.js (Excel → Supabase)
                → ผลลัพธ์: Tab Booth/Online จาก DB, import Excel ได้

สัปดาห์  8-9   Sprint 4: Export + Permission + RBAC
                ├── export.js + role-based permission
                ├── ลบ PIN, RBAC UI
                └── Admin panel
                → ผลลัพธ์: Export ตาม role, ลบ PIN, admin panel

สัปดาห์ 10-12  Sprint 5: Polish + QA + Cutover
                ├── ลบ feature flags + legacy code
                ├── Responsive + performance + security review
                └── User manual + cutover
                → ผลลัพธ์: Production ready, ทุกคนใช้ได้
```

### Parallel Run Timeline
```
Sprint 1-4:  ระบบเดิม (file://) = PRIMARY     ระบบใหม่ (Cloudflare) = TESTING
Sprint 5:    ระบบใหม่ = PRIMARY                ระบบเดิม = BACKUP (เก็บ 1 เดือน)
+1 เดือน:    Archive ระบบเดิมไป branch legacy/static-v1
```
