# สเปกโครงสร้างพื้นฐาน — Sales Dashboard 2026 (SPBI)

> เอกสารนี้จัดทำเพื่อส่งฝ่ายจัดซื้อ/IT สำหรับจัดหาเซิร์ฟเวอร์และฐานข้อมูล
> สร้างจากการสำรวจโค้ดจริง ณ วันที่ 15 สิงหาคม 2569
> เวอร์ชันเอกสาร: 2.0

---

## ขั้นที่ 1: สำรวจสิ่งที่มีอยู่ในตอนนี้

### 1.1 เซิร์ฟเวอร์ที่ใช้อยู่

| รายการ | รายละเอียด | อ้างอิง |
|--------|-----------|---------|
| Runtime | Node.js v24.15.0 (x64, Windows 11) | `node -v` บนเครื่องปัจจุบัน |
| HTTP Server | Node.js `http.createServer()` — ไม่มี framework (ไม่ใช้ Express) | `server.js:46` |
| Port หลัก | 8080 (ตั้งค่าผ่าน `process.env.PORT`) | `server.js:6` |
| Port prototype | 3500 (Trend Dashboard แยก server) | `prototype/trend-competitor-social/server.js:6` |
| LAN Access | `http://192.168.1.241:8080` (hardcode) | `server.js:190` |
| HTTPS/TLS | **ไม่มี** — ใช้ HTTP เปล่า | `server.js:1` (import `http` ไม่ใช่ `https`) |

### 1.2 ฐานข้อมูล / Data Storage

| รายการ | รายละเอียด | อ้างอิง |
|--------|-----------|---------|
| Supabase (PostgreSQL) | ใช้ REST API ดึงข้อมูลยอดขาย — 3 ตาราง: `sales_daily`, `product_monthly`, `location_monthly` | `js/supa-data.js:22-25` |
| Supabase URL | `https://gdjwsxeptloppefuiwum.supabase.co/rest/v1` | `js/supabase-test.js:5` |
| Authentication key | Anon key (JWT) — hardcode ในไฟล์ JS ฝั่ง client | `js/supabase-test.js:6` |
| Google Sheets | ใช้เป็น data source ผ่าน server proxy `/api/sheet/{id}` | `server.js:120-143`, `js/checklist-live.js:27-29` |
| ไฟล์ JS (generated data) | ข้อมูลถูก pre-generate เป็นไฟล์ JS ขนาดใหญ่โหลดฝั่ง client | ดูตาราง 1.3 |
| Local JSON files | `data/area_monitoring.json` (440 KB), `data/branch_names.json` (160 KB), `data/orders-agg.json` (43 KB) | `data/` directory |
| Excel ต้นทาง | ไฟล์ .xlsx ใน `data/` สำหรับ generate ข้อมูล JS | `data/` directory |

### 1.3 ขนาดไฟล์ข้อมูลที่ฝั่ง Client ต้องโหลด

| ไฟล์ | ขนาด | หน้าที่ |
|------|------|--------|
| `js/bill-items-gen.js` | **73 MB** | ข้อมูลใบเสร็จ 177,009 ใบ / 670,217 รายการ — server lazy-load |
| `js/app.js` | **25 MB** | โค้ดหลัก + ข้อมูล hardcode (ยอดขาย, เป้า, สาขา) |
| `js/amz-order-data.js` | 764 KB | ข้อมูลคำสั่งซื้อ Amazon |
| `js/sales-data-gen.js` | 76 KB | ข้อมูลยอดขายรายวัน |
| `sales_dashboard.html` | 612 KB | หน้า dashboard หลัก (HTML + inline CSS/JS) |
| รวมโหลดต่อ session | **~27 MB+** | ไม่รวม bill-items (ดึงผ่าน API ตาม PO) |

### 1.4 API Endpoints ปัจจุบัน

| Endpoint | Method | หน้าที่ | อ้างอิง |
|----------|--------|--------|---------|
| `/api/line-notify` | POST | Proxy ส่งแจ้งเตือนผ่าน LINE Notify | `server.js:59-116` |
| `/api/sheet/{sheetId}` | GET | Proxy ดึงข้อมูลจาก Google Sheets | `server.js:120-143` |
| `/api/bill-items?inv=XXX` | GET | ดึงรายการสินค้าตามเลขใบเสร็จ | `server.js:147-168` |
| Static files (`/`) | GET | เสิร์ฟไฟล์ HTML/JS/CSS/รูปภาพ | `server.js:170-187` |

### 1.5 External Services ที่เชื่อมต่อ

| Service | การใช้งาน | อ้างอิง |
|---------|----------|---------|
| Supabase (Free tier) | ฐานข้อมูลยอดขาย — REST API + anon key | `js/supa-data.js:22` |
| LINE Notify API | แจ้งเตือนทีมขาย (ผ่าน server proxy) | `server.js:59` |
| Google Sheets (public) | ดึงข้อมูล checklist / ตารางงาน | `server.js:120` |
| cdnjs.cloudflare.com | Chart.js 4.4.1, html2canvas 1.4.1, jsPDF 2.5.1, SheetJS 0.18.5 | `sales_dashboard.html:7-10` |
| Google Fonts | Noto Sans Thai | `sales_dashboard.html:13` |
| unpkg.com | Leaflet 1.9.4 (แผนที่) | `sales_dashboard.html:14-15` |

### 1.6 Authentication / Users

| รายการ | รายละเอียด | อ้างอิง |
|--------|-----------|---------|
| ระบบ Auth | Local demo — user list hardcode ในไฟล์ JS | `js/auth.js:14-35` |
| จำนวน user | 19 accounts | `js/auth.js:14-34` |
| Roles | 5 ระดับ: `admin`, `manager`, `leader`, `sales`, `officer` | `js/auth.js:14-34` |
| Password | SHA-256 hash เปรียบเทียบกับค่า hardcode | `js/auth.js:10` |
| Session | เก็บใน `sessionStorage` + `localStorage` (ฝั่ง client) | `js/auth.js:84-85` |
| RBAC | ควบคุมเมนูที่เข้าถึงได้ผ่าน `allowedMenus` array | `js/auth.js:13` |

---

## ขั้นที่ 2: วิเคราะห์ภาระงาน (Workload Analysis)

### 2.1 ผู้ใช้งาน

| รายการ | ตัวเลขจากโค้ด | หมายเหตุ |
|--------|-------------|---------|
| จำนวน account ในระบบ | 19 | `js/auth.js:14-34` — hardcode |
| กลุ่มผู้ใช้ | ผู้บริหาร (3), ผู้จัดการ (6), หัวหน้างาน (1), เซลล์ (4), ธุรการ/ซัพพอต (3), แอดมิน (2) | นับจาก `DEMO_USERS` object |
| Concurrent users สูงสุด | **ไม่มีข้อมูล** — ไม่มี logging/monitoring | ⚠️ ประมาณการ: 5-10 คนพร้อมกัน (จาก 19 accounts ทั้งหมด) |

### 2.2 ปริมาณข้อมูล

| รายการ | ขนาด | ที่มา |
|--------|------|------|
| ไฟล์ JS/HTML/CSS ทั้งหมด (ไม่รวม node_modules) | ~106 MB | `js/` directory |
| ไฟล์ข้อมูลต้นทาง (data/) | ~1.5 GB | `data/` directory — Excel, JSON, PDF |
| Bill items (generated JS) | 73 MB (177,009 invoices) | `js/bill-items-gen.js` — server lazy-load |
| Supabase data | **ไม่มีข้อมูลจำนวน row** | ดึง 3 ตาราง: `sales_daily`, `product_monthly`, `location_monthly` |
| ขนาด client download ต่อ session | ~27 MB | app.js 25 MB + HTML 612 KB + JS อื่น ~1.5 MB |

### 2.3 รูปแบบการใช้งาน

- **อ่านอย่างเดียว (Read-heavy)**: Dashboard เป็น read-only visualization
- ข้อมูลอัปเดตเป็น batch (generate JS จาก Excel → deploy ไฟล์ใหม่)
- Supabase ดึงข้อมูลแบบ real-time แต่ไม่เขียนจากฝั่ง client
- ไม่มีฟอร์มบันทึกข้อมูลลง database (ยกเว้น checklist จาก Google Sheets)
- ใช้งานในเวลาทำการ (Mon-Sat, ~8:00-18:00)

---

## ขั้นที่ 3: จุดคอขวด & ความเสี่ยง

### 🔴 Critical

| # | ปัญหา | หลักฐาน | ผลกระทบ |
|---|-------|---------|---------|
| 1 | **app.js ขนาด 25 MB โหลดฝั่ง client** | `js/app.js` = 25,329,929 bytes / 16,201 บรรทัด — ข้อมูลยอดขาย + โค้ด hardcode รวมกัน | เปิดหน้าแรกช้า 5-15 วินาทีบน 4G; browser ใช้ RAM สูง |
| 2 | **bill-items-gen.js 73 MB โหลดใน RAM** | `server.js:14` — `fs.readFileSync()` แล้ว `JSON.parse()` ทั้งก้อน | Server ใช้ RAM ~200-400 MB แค่ข้อมูลนี้อย่างเดียว |
| 3 | **ไม่มี HTTPS** | `server.js:1` ใช้ `http` module — password ส่งเป็น plaintext | ข้อมูลรั่วบน network ที่ไม่ปลอดภัย |
| 4 | **Supabase anon key hardcode ใน client JS** | `js/supabase-test.js:6` — JWT key เปิดเผยในซอร์สโค้ดฝั่ง browser | ใครก็ดึงข้อมูลจาก Supabase ได้ตรง (RLS ต้องตั้งให้ดี) |

### 🟡 Warning

| # | ปัญหา | หลักฐาน | ผลกระทบ |
|---|-------|---------|---------|
| 5 | ไม่มี reverse proxy / load balancer | server.js เปิด port ตรง — ไม่มี nginx/caddy | ไม่รองรับ SSL termination, caching, หรือ rate limiting |
| 6 | User data hardcode ในไฟล์ JS | `js/auth.js:14-34` — เพิ่ม/ลบ user ต้องแก้โค้ดแล้ว redeploy | ไม่ scale, เสี่ยงผิดพลาด |
| 7 | ไม่มี monitoring/logging | ไม่มี health check endpoint, ไม่เก็บ access log | ไม่รู้ว่า server ล่มจนกว่าจะมีคนแจ้ง |
| 8 | CDN dependency | Library 6 ตัวโหลดจาก cdnjs/unpkg/Google | ถ้า CDN ล่ม → dashboard ใช้งานไม่ได้ |

---

## ขั้นที่ 4: สเปกเซิร์ฟเวอร์ที่แนะนำ

### 4.1 ตัวเลือกที่ 1: เซิร์ฟเวอร์ภายในบริษัท (On-Premise)

> เหมาะกับ: ข้อมูลไม่ออกนอกบริษัท, ควบคุมได้เต็มที่

#### สเปกขั้นต่ำ

| รายการ | สเปก | เหตุผล |
|--------|------|--------|
| CPU | 4 cores (Intel i5/Xeon E หรือเทียบเท่า) | Node.js single-thread แต่ต้อง headroom สำหรับ OS + proxy + parse 73 MB JSON |
| RAM | **8 GB** | bill-items-gen.js ใช้ ~400 MB เมื่อ parse; OS ~2 GB; Node.js process ~1 GB; เหลือ buffer |
| Storage | **256 GB SSD** | Project ปัจจุบัน ~3 GB (รวม data/); เผื่อ log + backup + growth |
| Network | LAN 1 Gbps | เสิร์ฟ 27 MB ต่อ client session; 10 users พร้อมกัน = ~270 MB burst |
| OS | Windows Server 2022 Standard **หรือ** Ubuntu 22.04 LTS | Windows ถ้าทีมคุ้นเคย; Linux ถ้าต้องการ performance/ค่าลิขสิทธิ์ต่ำกว่า |

#### สเปกแนะนำ (พร้อมขยายในอนาคต)

| รายการ | สเปก | เหตุผล |
|--------|------|--------|
| CPU | 8 cores | รองรับ Supabase self-host ในอนาคต (PostgreSQL) |
| RAM | **16 GB** | เผื่อ caching layer + database ในอนาคต |
| Storage | **512 GB NVMe SSD** | เผื่อ database storage + backup retention 90 วัน |
| UPS | มี | ป้องกันไฟดับขณะเขียนข้อมูล |

### 4.2 ตัวเลือกที่ 2: Cloud VPS

> เหมาะกับ: เข้าถึงจากนอกบริษัทได้, ไม่ต้องดูแล hardware

| Provider | แผนแนะนำ | สเปก | ค่าใช้จ่าย/เดือน (ประมาณ) |
|----------|----------|------|--------------------------|
| DigitalOcean | Premium Droplet | 4 vCPU, 8 GB RAM, 160 GB NVMe | ~$48 USD (~1,700 บาท) |
| Linode/Akamai | Dedicated 8GB | 4 vCPU, 8 GB RAM, 160 GB SSD | ~$65 USD (~2,300 บาท) |
| AWS EC2 | t3.xlarge | 4 vCPU, 16 GB RAM + 100 GB EBS | ~$120 USD (~4,200 บาท) |
| Azure | B4ms | 4 vCPU, 16 GB RAM + 128 GB SSD | ~$140 USD (~4,900 บาท) |

> ⚠️ **ค่าใช้จ่ายซ่อน (Cloud)**:
> - **Bandwidth**: app.js 25 MB x users x visits — DigitalOcean ฟรี 4 TB/เดือน; AWS คิด $0.09/GB หลัง 1 GB แรก
> - **Snapshot/Backup**: DigitalOcean +20% ของค่า droplet; AWS EBS snapshot ~$0.05/GB/เดือน
> - **Static IP**: บาง provider คิดค่า IP เมื่อ instance หยุด
> - **SSL Certificate**: ใช้ Let's Encrypt ฟรี; ถ้าต้องการ wildcard cert อาจมีค่าใช้จ่ายเพิ่ม

### 4.3 ตัวเลือกที่ 3: ใช้ Supabase เป็นหลัก (ปัจจุบัน) + Static Hosting

> เหมาะกับ: งบจำกัด, ใช้งานภายในทีมเล็ก

| Service | แผน | ค่าใช้จ่าย | ข้อจำกัด |
|---------|-----|-----------|---------|
| Supabase | Free | ฟรี | 500 MB database, 1 GB bandwidth/เดือน, 50,000 monthly active users |
| Supabase | Pro | $25/เดือน (~875 บาท) | 8 GB database, 250 GB bandwidth, daily backups |
| Vercel/Netlify | Free | ฟรี | Static hosting; ต้องย้าย API ไป serverless functions |

> ⚠️ **ข้อจำกัด**: app.js 25 MB ใหญ่เกินกว่า serverless function ส่วนใหญ่ (Vercel limit 4.5 MB); ต้องแยก data ออกจากโค้ดก่อน

---

## ขั้นที่ 5: สเปกฐานข้อมูลที่แนะนำ

### 5.1 สถานะปัจจุบัน: Supabase Free Tier

| รายการ | ค่าปัจจุบัน | ข้อจำกัด Free |
|--------|------------|--------------|
| Database size | ไม่ทราบแน่ชัด | 500 MB |
| ตาราง | `sales_daily`, `product_monthly`, `location_monthly` | ไม่จำกัดจำนวนตาราง |
| API calls | ไม่ทราบแน่ชัด | ไม่จำกัด (fair use) |
| Bandwidth | ไม่ทราบแน่ชัด | 1 GB/เดือน |
| Backup | ไม่มี (Free tier) | — |

### 5.2 แนะนำ: Supabase Pro หรือ PostgreSQL Self-host

#### กรณี Supabase Pro ($25/เดือน)

| ได้เพิ่ม | รายละเอียด |
|---------|-----------|
| Database 8 GB | เพียงพอสำหรับ 3 ปีข้อมูลยอดขาย |
| Daily backups | สำรองข้อมูลอัตโนมัติ 7 วัน |
| 250 GB bandwidth | เพียงพอสำหรับ 19 users |
| Email support | ติดต่อทีม Supabase ได้ |

#### กรณี Self-host PostgreSQL (บนเซิร์ฟเวอร์เดียวกัน)

| รายการ | สเปก | เหตุผล |
|--------|------|--------|
| PostgreSQL version | 16.x | LTS ล่าสุด |
| RAM เพิ่ม | +4 GB (รวมเป็น 12-16 GB) | `shared_buffers` + `work_mem` |
| Storage เพิ่ม | +100 GB | ข้อมูลยอดขาย + index |
| Backup | pg_dump ทุกวัน → เก็บ 30 วัน | ⚠️ ต้องจัดการเอง |

### 5.3 ข้อมูลที่ควรย้ายเข้า Database

| ข้อมูล | ปัจจุบัน | ขนาดประมาณ | ลำดับความสำคัญ |
|--------|---------|-----------|--------------|
| Bill items | `js/bill-items-gen.js` (73 MB, 670K rows) | ~500 MB ใน DB | สูง — ลด RAM server |
| Sales data | hardcode ใน `js/app.js` | ~200 MB ใน DB | สูง — ลดขนาดไฟล์ client |
| Branch data | `js/*-branches.js` (หลายไฟล์) | ~10 MB ใน DB | กลาง |
| User accounts | `js/auth.js` hardcode | < 1 MB | สูง — ด้านความปลอดภัย |
| Amazon orders | `js/amz-order-data.js` (764 KB) | ~5 MB ใน DB | กลาง |

---

## ขั้นที่ 6: Software Stack ที่ใช้จริง

> กฎ: ไม่แนะนำซอฟต์แวร์ที่โปรเจกต์ไม่ได้ใช้

### 6.1 ใช้อยู่แล้ว — ต้องติดตั้งบนเซิร์ฟเวอร์

| Software | Version | หน้าที่ | อ้างอิง |
|----------|---------|--------|---------|
| Node.js | v24.x (LTS แนะนำ v22.x) | Runtime สำหรับ server.js | `server.js:1` |
| npm packages: `xlsx` | 0.18.5 | อ่าน/เขียน Excel (server-side scripts) | `package.json:4` |
| npm packages: `pptxgenjs` | 4.0.1 | สร้าง PowerPoint (export) | `package.json:3` |
| npm packages: `sharp` | 0.35.3 (devDependency) | ประมวลผลรูปภาพ | `package.json:6` |

### 6.2 ใช้ฝั่ง Client (CDN) — ไม่ต้องติดตั้งบนเซิร์ฟเวอร์

| Library | Version | หน้าที่ | อ้างอิง |
|---------|---------|--------|---------|
| Chart.js | 4.4.1 | กราฟทุกประเภทใน dashboard | `sales_dashboard.html:7` |
| html2canvas | 1.4.1 | จับภาพหน้าจอเพื่อ export | `sales_dashboard.html:8` |
| jsPDF | 2.5.1 | Export เป็น PDF | `sales_dashboard.html:9` |
| SheetJS (xlsx) | 0.18.5 | Export เป็น Excel ฝั่ง client | `sales_dashboard.html:10` |
| Leaflet | 1.9.4 | แผนที่สาขา/พื้นที่ | `sales_dashboard.html:14-15` |
| Noto Sans Thai | (Google Fonts) | ฟอนต์ภาษาไทย | `sales_dashboard.html:13` |

### 6.3 แนะนำเพิ่ม (สำหรับ production)

| Software | หน้าที่ | เหตุผล |
|----------|--------|--------|
| **nginx** หรือ **Caddy** | Reverse proxy + SSL termination + gzip | ปัจจุบันไม่มี HTTPS; nginx/Caddy จัดการ Let's Encrypt อัตโนมัติ |
| **PM2** | Process manager สำหรับ Node.js | ปัจจุบัน Node.js crash แล้วไม่ restart; PM2 ทำให้ auto-restart + log rotation |
| **certbot** (ถ้าใช้ nginx) | จัดการ SSL certificate | ฟรี — ต่ออายุ cert อัตโนมัติทุก 90 วัน |

> ⚠️ ซอฟต์แวร์ข้างต้นเป็น **ฟรี open-source** ทั้งหมด ไม่มีค่าลิขสิทธิ์

---

## ขั้นที่ 7: สรุปสำหรับฝ่ายจัดซื้อ

### ตารางเปรียบเทียบ 3 ทางเลือก

| เกณฑ์ | On-Premise (แนะนำ) | Cloud VPS | Supabase + Static |
|-------|-------------------|-----------|--------------------|
| **ค่าใช้จ่ายเริ่มต้น** | 15,000-40,000 บาท (เครื่อง Mini PC/Server) | 0 บาท | 0 บาท |
| **ค่ารายเดือน** | ~500 บาท (ค่าไฟ + อินเทอร์เน็ต) | 1,700-4,900 บาท | 0-875 บาท |
| **ค่ารายปี** | ~6,000 บาท | 20,400-58,800 บาท | 0-10,500 บาท |
| **ความยาก** | ปานกลาง (ต้องดูแลเอง) | ต่ำ (provider ดูแล hardware) | ต่ำ (managed ทั้งหมด) |
| **ข้อจำกัด** | ไฟดับ/เน็ตล่ม = ใช้ไม่ได้ | ค่าใช้จ่ายต่อเนื่อง | app.js 25 MB เกิน limit serverless |
| **เข้าถึงนอกบริษัท** | ต้องตั้ง VPN/port forward | ได้ทันที | ได้ทันที |
| **ความปลอดภัย** | ข้อมูลอยู่ในบริษัท | ข้อมูลอยู่บน cloud | ข้อมูลอยู่บน Supabase (US/SG) |

### รายการจัดซื้อ — กรณี On-Premise (แนะนำ)

| # | รายการ | จำนวน | งบประมาณ (ประมาณ) |
|---|--------|-------|-------------------|
| 1 | Mini PC/Server (i5, 16 GB RAM, 512 GB NVMe) | 1 | 15,000-25,000 บาท |
| 2 | UPS 800-1000VA | 1 | 2,000-3,500 บาท |
| 3 | สาย LAN Cat6 + อุปกรณ์ | 1 lot | 500-1,000 บาท |
| 4 | Windows Server 2022 Standard (ถ้าจำเป็น) | 1 | ~25,000 บาท |
| | **หรือ** Ubuntu 22.04 LTS (ฟรี) | | 0 บาท |
| | **รวมประมาณ (Linux)** | | **17,500-29,500 บาท** |
| | **รวมประมาณ (Windows)** | | **42,500-54,500 บาท** |

### รายการจัดซื้อ — กรณี Cloud VPS

| # | รายการ | ค่าใช้จ่าย |
|---|--------|-----------|
| 1 | DigitalOcean Premium Droplet (4 vCPU, 8 GB) | $48/เดือน (~1,700 บาท) |
| 2 | Automated backups (+20%) | $9.6/เดือน (~336 บาท) |
| 3 | Domain name (.com) ถ้ายังไม่มี | ~400 บาท/ปี |
| | **รวมต่อเดือน** | **~2,036 บาท** |
| | **รวมต่อปี** | **~24,432 บาท** |

---

## ภาคผนวก

### ก. โครงสร้างไฟล์สำคัญ

```
Project Sales/
├── server.js              ← เซิร์ฟเวอร์หลัก (192 บรรทัด, port 8080)
├── sales_dashboard.html   ← หน้า dashboard (7,262 บรรทัด, 612 KB)
├── package.json           ← dependencies: xlsx, pptxgenjs, sharp
├── js/
│   ├── app.js             ← โค้ดหลัก (16,201 บรรทัด, 25 MB — รวมข้อมูล hardcode)
│   ├── bill-items-gen.js  ← ข้อมูลใบเสร็จ (73 MB — server lazy-load)
│   ├── auth.js            ← ระบบ login (129 บรรทัด, 19 users hardcode)
│   ├── supa-data.js       ← Supabase data layer
│   ├── mt-bi.js           ← MT BI module (4,185 บรรทัด)
│   ├── sales-expense.js   ← ผลงานสินค้า (3,741 บรรทัด)
│   ├── amz-portal.js      ← Amazon portal (2,806 บรรทัด)
│   └── ... (อีก ~30 ไฟล์)
├── css/dashboard.css      ← สไตล์ (1,045 บรรทัด)
├── data/                  ← ไฟล์ Excel/JSON ต้นทาง (~1.5 GB)
├── scripts/               ← สคริปต์ generate ข้อมูล
└── prototype/             ← Trend Dashboard แยก (port 3500)
```

### ข. ตัวเลขที่ไม่สามารถยืนยันได้จากโค้ด (ต้องถามเพิ่ม)

| รายการ | ค่าที่ประมาณ | ต้องถาม/วัดจริง |
|--------|------------|----------------|
| Concurrent users จริง | 5-10 คน | ต้องวัดด้วย access log |
| Supabase database size | ไม่ทราบ | ดูใน Supabase dashboard |
| Supabase bandwidth ต่อเดือน | ไม่ทราบ | ดูใน Supabase dashboard |
| ความถี่ในการอัปเดตข้อมูล | ไม่ทราบ | ถามทีม — รายวัน? รายสัปดาห์? |
| ความต้องการเข้าถึงจากนอกบริษัท | ไม่ทราบ | ถามฝ่ายบริหาร |
| งบประมาณ IT ต่อปี | ไม่ทราบ | ถามฝ่ายจัดซื้อ |

---

*จัดทำโดย: AI Development Team*
*วันที่: 15 สิงหาคม 2569*
*อ้างอิง: สำรวจจากโค้ดจริงใน repository `Project Sales` branch `refactor/phase-ab`*
