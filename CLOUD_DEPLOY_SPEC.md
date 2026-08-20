# CLOUD_DEPLOY_SPEC.md
# แผนการนำระบบ Sales Dashboard ขึ้น Cloud
**โปรเจกต์:** SPBI (Sales Performance & Business Intelligence Platform)
**เวอร์ชัน:** 1.0
**วันที่:** 2026-08-17
**ผู้จัดทำ:** ทีมพัฒนา SPBI

---

## สารบัญ

1. [สรุปผู้บริหาร](#1-สรุปผู้บริหาร)
2. [สถาปัตยกรรมปัจจุบัน (AS-IS)](#2-สถาปัตยกรรมปัจจุบัน-as-is)
3. [สถาปัตยกรรมเป้าหมาย (TO-BE)](#3-สถาปัตยกรรมเป้าหมาย-to-be)
4. [รายการงานที่ต้องทำก่อน Deploy](#4-รายการงานที่ต้องทำก่อน-deploy-pre-deployment-checklist)
5. [Security Hardening](#5-security-hardening)
6. [Performance Optimization](#6-performance-optimization)
7. [Environment Configuration](#7-environment-configuration)
8. [Infrastructure Requirements](#8-infrastructure-requirements)
9. [Deployment Steps](#9-deployment-steps)
10. [Monitoring & Maintenance](#10-monitoring--maintenance)
11. [Cost Estimation](#11-cost-estimation)
12. [Risk Matrix](#12-risk-matrix)
13. [คำถามที่ต้องตัดสินใจ](#13-คำถามที่ต้องตัดสินใจ)

---

## 1. สรุปผู้บริหาร

### ระบบคืออะไร
SPBI เป็นแดชบอร์ดวิเคราะห์การขายแบบ Single Page Application (SPA) ใช้ภายในองค์กร รองรับ 10 กลุ่มเมนู (~93 sub-tabs) ครอบคลุมข้อมูลยอดขาย, KPI, CRM, ค่าใช้จ่าย, สินค้า E-Catalog, แผนเยี่ยมลูกค้า และอื่น ๆ ผู้ใช้งาน 19 คน แบ่ง 6 ระดับสิทธิ์

### สถานะปัจจุบัน
- ทำงานบน Windows local (Node.js raw HTTP server, port 8080)
- ไม่มี HTTPS, ไม่มี server-side auth, ไม่มี rate limiting
- ข้อมูลส่วนหนึ่ง hardcoded ใน JS (app.js >3 MB)
- Supabase anon key และ user credentials อยู่ใน client-side JS
- มี prototype แยก (Trend & Competitor Dashboard) ที่ port 3500

### เป้าหมายของการขึ้น Cloud
- เข้าถึงได้จากทุกที่โดยไม่ต้องเปิด VPN/เครื่อง local
- มี HTTPS และ authentication ที่ปลอดภัย
- ระบบพร้อมใช้งาน 24/7 (uptime target >= 99%)
- ค่าใช้จ่ายเหมาะสมกับ SME (งบประมาณ 500-2,000 บาท/เดือน)

---

## 2. สถาปัตยกรรมปัจจุบัน (AS-IS)

### 2.1 System Overview Diagram

```
                          AS-IS Architecture
  =====================================================================

  +--[ ผู้ใช้งาน (Browser) ]--------------------------------------------+
  |                                                                      |
  |  sales_dashboard.html (SPA)          login.html                      |
  |  +---------------------------+       +-----------+                   |
  |  | app.js (>3 MB, hardcoded) |       | auth.js   |                   |
  |  | shell.js                  |       | (19 users |                   |
  |  | 47 JS modules             |       |  hashed)  |                   |
  |  | dashboard.css             |       +-----------+                   |
  |  +---------------------------+                                       |
  |       |            |            |                                     |
  |  [sessionStorage] [localStorage] [IndexedDB]                         |
  |  (session)        (settings,     (product                            |
  |                    call log,      images)                             |
  |                    booth data)                                        |
  +----------------------------------------------------------------------+
           |                    |                      |
           | HTTP :8080         | HTTPS (direct)       | HTTPS (direct)
           v                    v                      v
  +--[ Node.js Server ]--+  +--[ Supabase ]--+  +--[ CDN ]----------+
  | raw http.createServer |  | REST API       |  | Chart.js 4.4.1    |
  | 0.0.0.0:8080          |  | - sales_daily  |  | html2canvas       |
  | No auth / No HTTPS    |  | - product_mth  |  | jsPDF             |
  |                       |  | anon key in    |  | SheetJS (xlsx)    |
  | APIs:                 |  | client JS      |  | Leaflet           |
  | - LINE Notify proxy   |  +----------------+  | Google Fonts      |
  | - Google Sheets proxy  |                      +-------------------+
  | - /api/bill-items      |
  | - /api/catalog/*       |  +--[ Google Sheets ]--+
  | Static file server     |  | Checklist data      |
  |                        |  +---------------------+
  | State:                 |
  | - catalog-overrides    |  +--[ LINE Notify ]----+
  |   .json (filesystem)   |  | Notification API    |
  | - bill-items (memory)  |  +---------------------+
  +-----------------------+

  +--[ Prototype: Trend Dashboard ]--+
  | port 3500                        |
  | แยก server.js + package.json     |
  | มี server-side session auth      |
  +----------------------------------+
```

### 2.2 Component List

| Component | ไฟล์/ที่ตั้ง | ขนาด | หน้าที่ |
|-----------|-------------|------|---------|
| SPA หลัก | `sales_dashboard.html` | ~50 KB | HTML shell สำหรับ dashboard |
| หน้า Login | `login.html` + `css/login.css` | ~15 KB | หน้าเข้าสู่ระบบ |
| Core App | `js/app.js` | >3 MB | Logic หลัก + ข้อมูล hardcoded 2024-2025 |
| Shell | `js/shell.js` | ~30 KB | Navigation, menu, tab switching |
| Auth | `js/auth.js` | ~10 KB | Client-side auth, 19 users hardcoded |
| Data Files | `js/target-data.js`, `ordering-data.js` ฯลฯ | ~2 MB รวม | ข้อมูลเป้าหมาย, คำสั่งซื้อ, สาขา |
| Branch Data | `js/cj-branches.js`, `bigc-branches.js` ฯลฯ 8 ไฟล์ | ~500 KB รวม | ข้อมูลสาขาแต่ละช่องทาง |
| Feature Modules | `js/mt-bi.js`, `amz-portal.js` ฯลฯ 15+ ไฟล์ | ~1 MB รวม | โมดูลแต่ละ feature |
| Supabase Client | `js/supabase-test.js`, `supa-data.js` | ~20 KB | เชื่อมต่อ Supabase REST API |
| CSS | `css/dashboard.css`, `menu-matrix.css` | ~100 KB รวม | Styles ทั้งหมด |
| Server | `server.js` | ~15 KB | HTTP server + 7 API endpoints |
| Catalog Overrides | `catalog-overrides.json` | Dynamic | ข้อมูลแก้ไข catalog ผ่าน browser |
| Product Images | `img/products/` | Dynamic | รูปสินค้าแยกตามช่องทาง |
| Excel Data | `Data/` | 2,500+ ไฟล์ | ข้อมูลต้นฉบับ (gitignored) |
| Dependencies | `pptxgenjs`, `xlsx`, `sharp` | ~50 MB (node_modules) | สร้าง PowerPoint, อ่าน Excel, จัดการรูป |
| Prototype | `prototype/trend-competitor-social/` | ~500 KB | Dashboard วิเคราะห์ Trend แยกต่างหาก |

### 2.3 Data Flow

```
  ข้อมูลเข้าสู่ระบบ:

  [Excel 2,500+ ไฟล์] ---(manual convert)--> [JS data files]
                                                    |
                                                    v
  [Supabase DB] <-----(REST API)------ [Browser SPA] -------> [localStorage/IndexedDB]
       |                                     |
       |                                     |--- HTTP :8080 --> [Node.js Server]
       |                                                              |
       |                                                         [LINE Notify]
       |                                                         [Google Sheets]
       v
  sales_daily, product_monthly tables

  ข้อมูลออกจากระบบ:

  [Browser SPA] ---> PDF export (jsPDF + html2canvas)
                ---> Excel export (SheetJS)
                ---> PowerPoint export (pptxgenjs)
                ---> LINE notification (ผ่าน server proxy)
```

---

## 3. สถาปัตยกรรมเป้าหมาย (TO-BE)

### ทางเลือก A: Minimal (VPS/VM) -- แก้น้อยสุด

**แนวคิด:** ย้ายระบบขึ้น VPS เหมือนเปิดเครื่อง Windows/Linux ไว้ตลอด เพิ่ม reverse proxy สำหรับ HTTPS

**เหมาะกับ:** ต้องการขึ้นเร็ว (1-2 สัปดาห์) งบจำกัด ทีมคุ้นเคย traditional server

```
  TO-BE: Option A (Minimal VPS)
  =====================================================================

  +--[ ผู้ใช้งาน (Browser) ]--+
  |  sales_dashboard.html     |
  |  (ไม่เปลี่ยนโค้ด SPA)     |
  +---------------------------+
              |
              | HTTPS :443
              v
  +--[ VPS (Ubuntu 22.04) ]------------------------------------------+
  |                                                                    |
  |  +--[ Nginx (Reverse Proxy) ]--+                                  |
  |  | SSL/TLS (Let's Encrypt)     |                                  |
  |  | Rate limiting               |                                  |
  |  | Gzip compression            |                                  |
  |  | Static file caching         |                                  |
  |  +-----------------------------+                                  |
  |              |                                                     |
  |              | HTTP :8080 (localhost only)                         |
  |              v                                                     |
  |  +--[ Node.js Server ]--+     +--[ PM2 ]--+                      |
  |  | server.js (เดิม)      |<----|  Process   |                      |
  |  | + .env config         |     |  Manager   |                      |
  |  | + basic auth middle.  |     |  Auto-     |                      |
  |  +----------------------+     |  restart   |                      |
  |                                +------------+                      |
  |  +--[ Firewall (ufw) ]--+                                        |
  |  | Allow: 22, 80, 443    |                                        |
  |  | Deny: all others      |                                        |
  |  +-----------------------+                                        |
  +--------------------------------------------------------------------+
              |                          |
              v                          v
  +--[ Supabase Cloud ]--+    +--[ LINE / Google APIs ]--+
  | (เดิม, ไม่เปลี่ยน)     |    | (เดิม, ไม่เปลี่ยน)       |
  +----------------------+    +-------------------------+
```

**สิ่งที่ต้องแก้ไขใน Option A:**
- เพิ่ม .env file สำหรับ secrets
- ย้าย Supabase key ไปฝั่ง server (proxy)
- เพิ่ม Nginx reverse proxy + SSL
- เพิ่ม basic auth middleware ใน server.js
- ติดตั้ง PM2 สำหรับ process management
- แก้ path traversal vulnerability

---

### ทางเลือก B: Modern (Container/PaaS) -- ปรับปรุงให้เหมาะกับ Cloud

**แนวคิด:** Containerize ด้วย Docker, deploy บน PaaS (Railway/Render/Fly.io) หรือ VPS+Docker ปรับโครงสร้างโค้ดให้ stateless

**เหมาะกับ:** ต้องการระบบที่ scale ได้, CI/CD อัตโนมัติ, ลดภาระดูแล server

```
  TO-BE: Option B (Modern Container/PaaS)
  =====================================================================

  +--[ ผู้ใช้งาน (Browser) ]--+
  |  SPA (ปรับปรุงแล้ว)        |
  |  - code-split app.js      |
  |  - env vars จาก config    |
  |  - CDN assets bundled     |
  +---------------------------+
              |
              | HTTPS :443
              v
  +--[ PaaS / Docker Host ]------------------------------------------+
  |                                                                    |
  |  +--[ Edge/CDN Layer ]-----+                                      |
  |  | Cloudflare (free tier)  |                                      |
  |  | - SSL termination       |                                      |
  |  | - DDoS protection       |                                      |
  |  | - Static asset cache    |                                      |
  |  | - Gzip/Brotli           |                                      |
  |  +-------------------------+                                      |
  |              |                                                     |
  |              v                                                     |
  |  +--[ Docker Container ]---+                                      |
  |  | Node.js 20 Alpine       |                                      |
  |  | Express.js              |                                      |
  |  | - Auth middleware (JWT) |                                      |
  |  | - Rate limiting         |                                      |
  |  | - Helmet (sec headers)  |                                      |
  |  | - CORS whitelist        |                                      |
  |  | - Health check /healthz |                                      |
  |  | - .env via secrets mgr  |                                      |
  |  +--------------------------+                                      |
  |              |                                                     |
  |              v                                                     |
  |  +--[ Persistent Volume ]--+                                      |
  |  | catalog-overrides.json  |                                      |
  |  | img/products/           |                                      |
  |  +-------------------------+                                      |
  +--------------------------------------------------------------------+
              |               |                |
              v               v                v
  +--[ Supabase ]--+  +--[ LINE ]--+  +--[ Google ]--+
  | (server-side    |  | Notify     |  | Sheets       |
  |  proxy only)    |  +------------+  +--------------+
  +----------------+
```

**สิ่งที่ต้องแก้ไขใน Option B (เพิ่มเติมจาก A):**
- เปลี่ยนจาก raw `http` เป็น Express.js
- สร้าง Dockerfile + docker-compose.yml
- แยก data ออกจาก app.js เป็นไฟล์ JSON/API
- ใช้ JWT แทน sessionStorage auth
- ย้าย catalog state ไป Supabase Storage หรือ S3-compatible
- ตั้ง CI/CD pipeline (GitHub Actions)

---

### เปรียบเทียบทั้ง 2 ทางเลือก

| หัวข้อ | Option A: Minimal VPS | Option B: Modern Container |
|--------|----------------------|---------------------------|
| เวลาดำเนินการ | 1-2 สัปดาห์ | 3-5 สัปดาห์ |
| ค่าใช้จ่าย/เดือน | 200-500 บาท | 0-800 บาท (free tier เป็นไปได้) |
| ปริมาณโค้ดที่ต้องแก้ | น้อย (~5 ไฟล์) | ปานกลาง (~15 ไฟล์) |
| ความปลอดภัย | ปานกลาง | สูง |
| Scalability | ต่ำ (1 server) | สูง (horizontal scale) |
| ความซับซ้อนในการดูแล | ต้อง SSH เข้าไปจัดการ | อัตโนมัติผ่าน CI/CD |
| Downtime ตอน deploy | มี (ต้อง restart) | ไม่มี (rolling deploy) |
| เหมาะกับ | ทีมเล็ก, ใช้งานภายใน | ทีมที่ต้องการ DevOps ที่ดี |

**คำแนะนำ:** สำหรับ SME ที่มีผู้ใช้ 19 คน แนะนำเริ่มจาก **Option A** แล้วค่อยย้ายไป Option B เมื่อพร้อม ช่วยลดความเสี่ยงและไม่ต้องปรับโค้ดมาก

---

## 4. รายการงานที่ต้องทำก่อน Deploy (Pre-deployment Checklist)

### P0 -- ต้องทำก่อน Deploy (Critical)

| # | งาน | รายละเอียด | เวลาประมาณ |
|---|------|-----------|-----------|
| P0-1 | แก้ path traversal | ตรวจสอบ URL ใน static file server ว่าไม่สามารถเข้าถึงไฟล์นอก root ด้วย `../` | 2 ชม. |
| P0-2 | สร้าง .env file | ย้าย Supabase URL/key, LINE token, Google Sheets ID ไปเก็บใน .env | 3 ชม. |
| P0-3 | ย้าย Supabase key ไปฝั่ง server | สร้าง proxy endpoint บน server.js ให้ client เรียกผ่าน server แทนเรียก Supabase ตรง | 1 วัน |
| P0-4 | ลบ hardcoded credentials | ลบ user hash, Supabase key ออกจาก client JS | 4 ชม. |
| P0-5 | เพิ่ม server-side auth | เพิ่ม middleware ตรวจ session/token ก่อนเข้าถึง API และ static files | 1 วัน |
| P0-6 | จำกัด CORS | เปลี่ยนจาก `*` เป็น whitelist domain ที่อนุญาต | 1 ชม. |
| P0-7 | ตั้ง HTTPS | ผ่าน reverse proxy (Nginx + Let's Encrypt) หรือ PaaS built-in | 3 ชม. |
| P0-8 | เพิ่ม .gitignore entries | เพิ่ม `.env`, `catalog-overrides.json`, `node_modules/` | 30 นาที |

### P1 -- ควรทำก่อน Deploy (Important)

| # | งาน | รายละเอียด | เวลาประมาณ |
|---|------|-----------|-----------|
| P1-1 | เพิ่ม health check endpoint | `GET /healthz` return 200 + system status | 1 ชม. |
| P1-2 | เพิ่ม rate limiting | จำกัดจำนวน request ต่อ IP ต่อนาที (เช่น 100 req/min) | 2 ชม. |
| P1-3 | ตั้ง PM2/systemd | ให้ Node.js restart อัตโนมัติเมื่อ crash | 1 ชม. |
| P1-4 | Gzip compression | เปิด gzip ที่ Nginx หรือเพิ่ม compression middleware | 1 ชม. |
| P1-5 | ตั้ง firewall | เปิดเฉพาะ port 22 (SSH), 80, 443 | 30 นาที |
| P1-6 | เพิ่ม error logging | เขียน log ลงไฟล์ พร้อม rotation (PM2 log หรือ Winston) | 3 ชม. |
| P1-7 | ตั้ง backup | สำรอง catalog-overrides.json + img/products/ อัตโนมัติ | 2 ชม. |
| P1-8 | ทดสอบบน Linux | ทดสอบระบบทั้งหมดบน Linux (path case-sensitivity, encoding) | 4 ชม. |

### P2 -- ทำได้ภายหลัง (Nice to have)

| # | งาน | รายละเอียด | เวลาประมาณ |
|---|------|-----------|-----------|
| P2-1 | แยก data จาก app.js | ย้ายข้อมูล 2024-2025 ออกเป็นไฟล์ JSON แยก | 2-3 วัน |
| P2-2 | CDN สำหรับ static assets | ใช้ Cloudflare หรือ Bunny CDN cache JS/CSS/images | 3 ชม. |
| P2-3 | Code splitting | แยก JS เป็น lazy-loaded modules | 3-5 วัน |
| P2-4 | Containerize (Docker) | สร้าง Dockerfile + docker-compose | 1 วัน |
| P2-5 | CI/CD pipeline | GitHub Actions: test -> build -> deploy | 1 วัน |
| P2-6 | ย้าย prototype | รวม Trend Dashboard เข้า main app หรือ deploy แยก | 2-3 วัน |
| P2-7 | ย้าย catalog state ไป DB | เปลี่ยนจาก filesystem JSON ไป Supabase table | 2 วัน |
| P2-8 | Bundle CDN dependencies | Download Chart.js ฯลฯ เก็บ local แทนพึ่ง CDN ภายนอก | 2 ชม. |

---

## 5. Security Hardening

### 5.1 สิ่งที่ต้องแก้ก่อน Deploy

#### 5.1.1 Path Traversal (P0-1)
**ปัญหา:** Static file server อ่านไฟล์ตาม URL โดยตรง อาจเข้าถึง `../../etc/passwd` ได้
**วิธีแก้:**
```javascript
// ก่อน (อันตราย)
var filePath = path.join(process.cwd(), reqUrl);

// หลัง (ปลอดภัย)
var rootDir = path.resolve(process.cwd());
var filePath = path.resolve(path.join(rootDir, reqUrl));
if (!filePath.startsWith(rootDir)) {
  res.writeHead(403);
  res.end('Forbidden');
  return;
}
```

#### 5.1.2 Authentication (P0-5)
**ปัญหา:** ไม่มี server-side auth ใดๆ ทุก API endpoint เข้าถึงได้โดยไม่ต้อง login
**วิธีแก้ (Option A -- Minimal):**
```javascript
// เพิ่ม session-based auth ด้วย signed cookie
// ใช้ crypto.randomBytes สร้าง session ID
// เก็บ session ใน memory Map (สำหรับ 19 users เพียงพอ)

var sessions = new Map();

function authMiddleware(req, res) {
  var cookie = parseCookie(req.headers.cookie || '');
  var session = sessions.get(cookie.sid);
  if (!session || session.expires < Date.now()) {
    sendJson(res, 401, { error: 'กรุณาเข้าสู่ระบบ' });
    return null;
  }
  session.expires = Date.now() + 8 * 3600 * 1000; // ต่ออายุ 8 ชม.
  return session;
}
```

**วิธีแก้ (Option B -- Modern):**
- ใช้ JWT (jsonwebtoken) พร้อม refresh token
- เก็บ user credentials ใน Supabase Auth หรือ bcrypt hash ใน .env
- Token expiry: access 15 นาที, refresh 7 วัน

#### 5.1.3 Supabase Key (P0-3, P0-4)
**ปัญหา:** anon key hardcoded ใน `supabase-test.js` ฝั่ง client ใครก็ดึงข้อมูลได้
**วิธีแก้:**
1. สร้าง server proxy endpoints: `GET /api/sales-daily`, `GET /api/product-monthly`
2. Server ใช้ Supabase service_role key (เก็บใน .env) เรียก Supabase API
3. ลบ Supabase URL/key ออกจาก client JS ทั้งหมด
4. ตั้ง Supabase RLS (Row Level Security) เป็น deny-all สำหรับ anon key

#### 5.1.4 CORS (P0-6)
**ปัญหา:** `Access-Control-Allow-Origin: *` ทุก API
**วิธีแก้:**
```javascript
// .env
ALLOWED_ORIGINS=https://sales.yourcompany.com,https://localhost:8080

// server.js
var allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
function setCORS(req, res) {
  var origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
}
```

#### 5.1.5 Security Headers
**เพิ่ม HTTP headers ผ่าน Nginx หรือ middleware:**
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob:;
  connect-src 'self' https://*.supabase.co
Referrer-Policy: strict-origin-when-cross-origin
```

### 5.2 RBAC Server-side

**ปัจจุบัน:** RBAC ทำฝั่ง client เท่านั้น (6 ระดับ) ผู้ใช้สามารถ bypass ได้ง่าย

**เป้าหมาย:** เพิ่ม RBAC ฝั่ง server สำหรับ API endpoints ที่มีข้อมูลสำคัญ

| Role | API ที่เข้าถึงได้ |
|------|-----------------|
| admin | ทุก endpoint รวม catalog CRUD |
| manager | ทุก endpoint ยกเว้น catalog delete |
| leader | อ่านข้อมูลทั้งหมด, แก้ไขข้อมูลทีมตัวเอง |
| sales | อ่านข้อมูลตัวเอง, บันทึก call log/visit plan |
| officer | อ่านข้อมูลทั้งหมด (read-only) |
| viewer | อ่านข้อมูล dashboard (read-only, จำกัด tabs) |

**หมายเหตุ:** ในเฟสแรก (Option A) อาจยังคง RBAC ฝั่ง client ไว้เหมือนเดิมสำหรับ UI ส่วน server เพิ่มแค่ตรวจว่า login แล้วหรือยัง (auth gate) เพราะผู้ใช้ 19 คนและเป็นระบบภายใน

---

## 6. Performance Optimization

### 6.1 แยก Data ออกจาก app.js (P2-1)

**ปัญหา:** app.js มีขนาด >3 MB เพราะมีข้อมูล 2024-2025 hardcoded ทำให้โหลดนานบน cloud (โดยเฉพาะ mobile)

**วิธีแก้ (แบบค่อยเป็นค่อยไป):**

1. **ระยะสั้น:** เปิด gzip compression ลดขนาดจาก ~3 MB เหลือ ~300-500 KB
2. **ระยะกลาง:** แยกข้อมูลเป็นไฟล์ JSON แยก โหลดเมื่อต้องการ
   ```
   data/
     sales-2024.json    (~500 KB)
     sales-2025.json    (~500 KB)
     targets-2026.json  (~200 KB)
     branches.json      (~100 KB)
     staff.json         (~50 KB)
   ```
3. **ระยะยาว:** ย้ายข้อมูลทั้งหมดไป Supabase tables

### 6.2 CDN / Caching Strategy

**Static Assets:**
```nginx
# Nginx caching config
location ~* \.(js|css|png|jpg|webp|woff2)$ {
    expires 7d;
    add_header Cache-Control "public, immutable";
}

# HTML -- ไม่ cache
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache, must-revalidate";
}

# API -- ไม่ cache
location /api/ {
    expires -1;
    add_header Cache-Control "no-store";
}
```

**CDN Dependencies (P2-8):**
แทนที่จะพึ่ง CDN ภายนอก ให้ download เก็บใน project:
```
vendor/
  chart.umd.js        (Chart.js 4.4.1)
  html2canvas.min.js
  jspdf.umd.min.js
  xlsx.full.min.js
  leaflet.js + leaflet.css
```
ป้องกันปัญหา CDN ล่มหรือถูก block ในบางเครือข่าย

### 6.3 Code Splitting (P2-3)

สำหรับ Option B ในอนาคต:
- แบ่ง JS เป็นกลุ่มตาม tab/feature
- โหลดเฉพาะ module ที่ user เปิด (lazy import)
- ใช้ `<script type="module">` + dynamic `import()`

---

## 7. Environment Configuration

### 7.1 ตัวแปร .env ที่ต้องมี

```env
# ===== Server =====
NODE_ENV=production
PORT=8080
HOST=0.0.0.0

# ===== Security =====
SESSION_SECRET=<random-64-char-string>
ALLOWED_ORIGINS=https://sales.yourcompany.com

# ===== Supabase =====
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# ===== LINE Notify =====
LINE_NOTIFY_TOKEN=<token>

# ===== Google Sheets =====
GOOGLE_SHEETS_API_KEY=<api-key>
GOOGLE_SHEETS_ID=<sheet-id>

# ===== Upload =====
MAX_UPLOAD_SIZE=12582912
PRODUCT_IMG_DIR=./img/products
CATALOG_OVERRIDES_PATH=./catalog-overrides.json
```

### 7.2 Secret Management

| ระดับ | วิธีจัดการ | เหมาะกับ |
|-------|----------|---------|
| พื้นฐาน | `.env` file บน server (chmod 600) + `.gitignore` | Option A |
| กลาง | PaaS environment variables (Railway/Render dashboard) | Option B (PaaS) |
| สูง | HashiCorp Vault / AWS Secrets Manager | อนาคต (ถ้า scale) |

**กฎเหล็ก:**
- ห้าม commit `.env` ลง git เด็ดขาด
- เตรียม `.env.example` (ไม่มีค่าจริง) เป็น template
- ใช้ `process.env` อ่านค่าเสมอ ไม่ hardcode ใน source code
- Rotate secrets ทุก 90 วัน (โดยเฉพาะ SESSION_SECRET, LINE_NOTIFY_TOKEN)

---

## 8. Infrastructure Requirements

### 8.1 Compute

| รายการ | Option A (VPS) | Option B (PaaS/Container) |
|--------|---------------|--------------------------|
| CPU | 1 vCPU (ขั้นต่ำ) | Shared CPU (PaaS จัดให้) |
| RAM | 1 GB (ขั้นต่ำ), 2 GB (แนะนำ) | 512 MB (container) |
| OS | Ubuntu 22.04 LTS | Alpine Linux (Docker) |
| Node.js | 20 LTS | 20 LTS |
| Process Manager | PM2 | PaaS built-in |

**เหตุผลที่ต้องการ RAM 1-2 GB:**
- Node.js runtime: ~100 MB
- app.js parse + data ใน memory: ~200 MB
- bill-items cache: ~50 MB
- OS + Nginx: ~200 MB
- Headroom: ~450 MB

### 8.2 Storage

| ประเภท | ขนาด | หมายเหตุ |
|--------|------|---------|
| OS + Application | 10 GB | โค้ด + node_modules + OS |
| Product Images | 1-5 GB | ขยายได้ตามจำนวนสินค้า |
| Logs | 1 GB | ตั้ง log rotation (7 วัน) |
| Backup | 2 GB | Snapshot + data backup |
| **รวมขั้นต่ำ** | **20 GB SSD** | |

**หมายเหตุ:** ไม่ต้องเก็บ Data/ (Excel 2,500+ ไฟล์) บน cloud เพราะข้อมูลถูก convert เป็น JS แล้ว

### 8.3 Network

| รายการ | รายละเอียด |
|--------|-----------|
| Domain | ต้องจดหรือใช้ subdomain (เช่น `sales.yourcompany.com`) |
| SSL Certificate | Let's Encrypt (ฟรี, auto-renew) หรือ Cloudflare SSL |
| Bandwidth | ~50 GB/เดือน (19 users, SPA โหลดครั้งเดียว) |
| Static IP | ต้องการ (สำหรับ DNS A record) |
| CDN | Cloudflare free tier (optional แต่แนะนำ) |

### 8.4 Database (Supabase)

| รายการ | ความต้องการ |
|--------|-----------|
| Plan ปัจจุบัน | Free tier (500 MB DB, 1 GB file storage) |
| Tables | sales_daily, product_monthly |
| ขนาดข้อมูล | ประมาณ 50-100 MB (เพียงพอสำหรับ free tier) |
| Connections | สูงสุด 19 concurrent (free tier รองรับ) |
| Plan ที่แนะนำ | Free tier เพียงพอ ถ้าต้องการ backup/point-in-time recovery ใช้ Pro ($25/เดือน) |

---

## 9. Deployment Steps

### Option A: Deploy บน VPS (ขั้นตอนละเอียด)

#### ขั้นตอนที่ 1: เตรียม VPS

```bash
# 1.1 สร้าง VPS (DigitalOcean/Vultr/Linode)
#     เลือก: Ubuntu 22.04 LTS, 1 vCPU, 1-2 GB RAM, 25 GB SSD
#     Region: Singapore (ใกล้ไทยที่สุด)

# 1.2 SSH เข้า VPS
ssh root@<VPS_IP>

# 1.3 สร้าง user แยก (ห้ามรัน app ด้วย root)
adduser spbi
usermod -aG sudo spbi
su - spbi

# 1.4 ตั้ง firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 1.5 ติดตั้ง Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 1.6 ติดตั้ง Nginx
sudo apt-get install -y nginx

# 1.7 ติดตั้ง PM2
sudo npm install -g pm2
```

#### ขั้นตอนที่ 2: แก้ไขโค้ด (ทำบนเครื่อง dev ก่อน push)

```bash
# 2.1 สร้าง .env file
cp .env.example .env
# แก้ไขค่าตามจริง

# 2.2 แก้ server.js
#     - เพิ่ม require('dotenv').config()
#     - แก้ path traversal
#     - เพิ่ม auth middleware
#     - เปลี่ยน CORS จาก * เป็น whitelist

# 2.3 แก้ client JS
#     - ลบ Supabase key ออกจาก supabase-test.js
#     - เพิ่ม API calls ผ่าน server proxy แทน

# 2.4 ทดสอบ local
npm install dotenv
node server.js
# ทดสอบทุก feature ให้ผ่าน

# 2.5 Commit + Push
git add -A
git commit -m "feat: เตรียม deploy cloud"
git push origin main
```

#### ขั้นตอนที่ 3: Deploy โค้ดขึ้น VPS

```bash
# 3.1 Clone repository
cd /home/spbi
git clone https://github.com/wwnerpapp/Sales_dashboard.git app
cd app

# 3.2 ติดตั้ง dependencies
npm install --production

# 3.3 สร้าง .env
nano .env
# วาง environment variables ตามหัวข้อ 7.1

# 3.4 สร้างโฟลเดอร์สำหรับ uploads
mkdir -p img/products

# 3.5 ทดสอบ
node server.js
# ตรวจว่า http://localhost:8080 ทำงาน
# Ctrl+C เพื่อหยุด
```

#### ขั้นตอนที่ 4: ตั้ง PM2

```bash
# 4.1 เริ่มด้วย PM2
pm2 start server.js --name spbi --env production

# 4.2 ตั้งให้เริ่มอัตโนมัติเมื่อ reboot
pm2 startup
pm2 save

# 4.3 ตรวจสอบ
pm2 status
pm2 logs spbi
```

#### ขั้นตอนที่ 5: ตั้ง Nginx + SSL

```bash
# 5.1 สร้าง Nginx config
sudo nano /etc/nginx/sites-available/spbi
```

```nginx
# /etc/nginx/sites-available/spbi
server {
    listen 80;
    server_name sales.yourcompany.com;

    # Redirect HTTP -> HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sales.yourcompany.com;

    # SSL (จะถูกตั้งโดย certbot)
    # ssl_certificate /etc/letsencrypt/live/.../fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/.../privkey.pem;

    # Security Headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy strict-origin-when-cross-origin;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/javascript application/json;
    gzip_min_length 1000;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;

    # Static files with caching
    location ~* \.(js|css|png|jpg|jpeg|webp|gif|ico|woff2|woff|ttf)$ {
        proxy_pass http://127.0.0.1:8080;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # API with rate limiting
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Default proxy
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# 5.2 Enable site
sudo ln -s /etc/nginx/sites-available/spbi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 5.3 ติดตั้ง SSL ด้วย Certbot
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d sales.yourcompany.com
# certbot จะแก้ไข config ให้อัตโนมัติ

# 5.4 ตั้ง auto-renew
sudo certbot renew --dry-run
# cron job จะถูกสร้างอัตโนมัติ
```

#### ขั้นตอนที่ 6: ตรวจสอบการ Deploy

```bash
# 6.1 ตรวจ HTTPS
curl -I https://sales.yourcompany.com

# 6.2 ตรวจ health (ถ้าเพิ่ม endpoint แล้ว)
curl https://sales.yourcompany.com/healthz

# 6.3 ตรวจว่า HTTP redirect ไป HTTPS
curl -I http://sales.yourcompany.com

# 6.4 ตรวจ security headers
curl -I https://sales.yourcompany.com | grep -i "x-frame\|x-content\|strict"

# 6.5 ทดสอบ login + ใช้งาน dashboard จริง
# เปิด browser ไปที่ https://sales.yourcompany.com
```

---

## 10. Monitoring & Maintenance

### 10.1 Health Check

เพิ่ม endpoint `/healthz` ใน server.js:

```javascript
// Health check endpoint
if (reqUrl === '/healthz') {
  var health = {
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  };
  sendJson(res, 200, health);
  return;
}
```

ตั้ง monitoring ตรวจทุก 5 นาที:
- **ฟรี:** UptimeRobot (50 monitors ฟรี) -- ตรวจ HTTPS response
- **VPS:** cron job: `curl -sf https://sales.yourcompany.com/healthz || echo "DOWN" | mail admin`

### 10.2 Logging

**PM2 Logs:**
```bash
# ดู logs แบบ real-time
pm2 logs spbi

# ตั้ง log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

**เพิ่ม request logging ใน server.js:**
```javascript
// Request logging
var logLine = new Date().toISOString() + ' ' +
  req.method + ' ' + reqUrl + ' ' +
  (req.headers['x-real-ip'] || req.socket.remoteAddress);
console.log(logLine);
```

**Nginx Access Log:**
```
/var/log/nginx/access.log   -- ทุก request
/var/log/nginx/error.log    -- errors
```

### 10.3 Backup Strategy

| รายการ | ความถี่ | วิธี | เก็บไว้ |
|--------|---------|------|--------|
| catalog-overrides.json | ทุกวัน | cron + cp | /backup/daily/ |
| img/products/ | ทุกสัปดาห์ | rsync | /backup/weekly/ |
| VPS Snapshot | ทุกสัปดาห์ | ผ่าน provider API | Cloud provider |
| Supabase | อัตโนมัติ | Supabase built-in (Pro plan) | Supabase |
| Source code | ทุก commit | Git | GitHub |

```bash
# Cron job ตัวอย่าง (/etc/cron.d/spbi-backup)
# สำรอง catalog data ทุกวัน 02:00
0 2 * * * spbi cp /home/spbi/app/catalog-overrides.json \
  /home/spbi/backup/catalog-$(date +\%Y\%m\%d).json

# สำรอง images ทุกวันอาทิตย์ 03:00
0 3 * * 0 spbi rsync -a /home/spbi/app/img/products/ \
  /home/spbi/backup/products/

# ลบ backup เก่ากว่า 30 วัน
0 4 * * * spbi find /home/spbi/backup/ -name "catalog-*.json" \
  -mtime +30 -delete
```

### 10.4 Update Process

```bash
# ขั้นตอนอัปเดตระบบ

# 1. SSH เข้า VPS
ssh spbi@<VPS_IP>

# 2. Pull โค้ดใหม่
cd /home/spbi/app
git pull origin main

# 3. ติดตั้ง dependencies (ถ้ามีการเปลี่ยน)
npm install --production

# 4. Restart app
pm2 restart spbi

# 5. ตรวจ logs ว่าไม่มี error
pm2 logs spbi --lines 20

# 6. ตรวจ health
curl -sf https://sales.yourcompany.com/healthz
```

**หมายเหตุ:** ขั้นตอนนี้มี downtime ชั่วคราว (~5 วินาที) ถ้าต้องการ zero-downtime ให้ใช้ PM2 cluster mode หรือย้ายไป Option B (Container)

---

## 11. Cost Estimation

### Option A: VPS (DigitalOcean / Vultr / Linode)

| รายการ | ค่าใช้จ่าย/เดือน | หมายเหตุ |
|--------|-----------------|---------|
| VPS 1 vCPU, 1 GB RAM, 25 GB SSD | $6 (~210 บาท) | DigitalOcean Basic Droplet |
| VPS 1 vCPU, 2 GB RAM, 50 GB SSD | $12 (~420 บาท) | แนะนำ (headroom มากกว่า) |
| Domain (.com) | ~$12/ปี (~35 บาท/เดือน) | ถ้ายังไม่มี domain |
| SSL (Let's Encrypt) | ฟรี | Auto-renew |
| Cloudflare (DNS + CDN) | ฟรี | Free tier |
| Supabase | ฟรี | Free tier เพียงพอ |
| UptimeRobot (monitoring) | ฟรี | Free tier (50 monitors) |
| **รวม (ประหยัด)** | **~250 บาท/เดือน** | VPS $6 + domain |
| **รวม (แนะนำ)** | **~460 บาท/เดือน** | VPS $12 + domain |

### Option B: PaaS (Railway / Render / Fly.io)

| รายการ | ค่าใช้จ่าย/เดือน | หมายเหตุ |
|--------|-----------------|---------|
| Railway (Hobby plan) | $5 (~175 บาท) | รวม 500 ชม. compute + 1 GB RAM |
| Render (Free tier) | ฟรี | จำกัด: spin down หลัง 15 นาที inactive |
| Render (Starter) | $7 (~245 บาท) | 512 MB RAM, always on |
| Fly.io (Free tier) | ฟรี | 3 shared VMs, 256 MB RAM |
| Persistent Storage (ถ้าต้องการ) | $0.15/GB (~5 บาท/GB) | สำหรับ images + overrides |
| Domain + SSL | ฟรี (built-in) | PaaS จัดให้ |
| Supabase | ฟรี | Free tier |
| **รวม (ประหยัดสุด)** | **ฟรี - 175 บาท/เดือน** | ใช้ free tier |
| **รวม (แนะนำ)** | **~250-420 บาท/เดือน** | Paid tier + storage |

### สรุปค่าใช้จ่าย

| | ต่ำสุด | แนะนำ | สูงสุด |
|---|--------|--------|--------|
| Option A (VPS) | 250 บาท/เดือน | 460 บาท/เดือน | 700 บาท/เดือน |
| Option B (PaaS) | 0 บาท/เดือน | 350 บาท/เดือน | 800 บาท/เดือน |

---

## 12. Risk Matrix

| # | ความเสี่ยง | โอกาส | ผลกระทบ | ระดับ | วิธีลดความเสี่ยง |
|---|-----------|-------|---------|-------|----------------|
| R1 | Supabase anon key ถูกขโมย ดึงข้อมูลได้ทั้งหมด | สูง | สูง | **วิกฤต** | ย้าย key ไป server-side, ตั้ง RLS (P0-3) |
| R2 | Path traversal อ่านไฟล์ .env หรือ system files | สูง | สูง | **วิกฤต** | ตรวจ path ก่อนให้บริการไฟล์ (P0-1) |
| R3 | API ถูกเรียกโดยไม่ต้อง login | สูง | ปานกลาง | **สูง** | เพิ่ม auth middleware (P0-5) |
| R4 | Password hash ถูกดึงจาก auth.js | ปานกลาง | สูง | **สูง** | ย้าย auth ไป server-side (P0-4) |
| R5 | app.js >3 MB ทำให้โหลดช้า/timeout | ปานกลาง | ปานกลาง | **ปานกลาง** | เปิด gzip (P1-4), แยก data (P2-1) |
| R6 | CDN ภายนอกล่ม (Chart.js ฯลฯ) | ต่ำ | สูง | **ปานกลาง** | Bundle dependencies เก็บ local (P2-8) |
| R7 | VPS ล่ม ข้อมูล catalog หาย | ต่ำ | สูง | **ปานกลาง** | ตั้ง backup อัตโนมัติ (P1-7) |
| R8 | localStorage เต็ม 5 MB | ปานกลาง | ต่ำ | **ต่ำ** | ย้ายข้อมูลบางส่วนไป IndexedDB/server |
| R9 | Linux path case-sensitivity ทำให้ไฟล์หาไม่เจอ | ปานกลาง | ปานกลาง | **ปานกลาง** | ทดสอบบน Linux ก่อน deploy (P1-8) |
| R10 | Node.js crash ไม่ restart | ต่ำ | สูง | **ปานกลาง** | ใช้ PM2 + monitoring (P1-1, P1-3) |
| R11 | DDoS attack ทำให้ระบบล่ม | ต่ำ | สูง | **ปานกลาง** | Cloudflare + rate limiting (P1-2) |
| R12 | Prototype (port 3500) เปิดโดยไม่ตั้งใจ | ต่ำ | ต่ำ | **ต่ำ** | ไม่ deploy prototype ในเฟสแรก |

### แผนภาพความเสี่ยง

```
  ผลกระทบ
  สูง    | R2,R1  |  R4    |  R6,R7,R10,R11
  ปานกลาง|  R3    |  R5,R9 |
  ต่ำ    |        |  R8    |  R12
         +--------+--------+--------
           สูง     ปานกลาง    ต่ำ     โอกาสเกิด
```

---

## 13. คำถามที่ต้องตัดสินใจ

ก่อนเริ่มดำเนินการ ต้องได้คำตอบจากเจ้าของระบบ/ผู้มีอำนาจตัดสินใจ:

### ด้าน Infrastructure

| # | คำถาม | ทางเลือก | ผลกระทบ |
|---|-------|---------|---------|
| Q1 | เลือก Option A (VPS) หรือ Option B (PaaS)? | A: เร็วกว่า, B: สะดวกกว่า | กำหนดแนวทาง deploy ทั้งหมด |
| Q2 | เลือก Cloud provider ไหน? | DigitalOcean / Vultr / Linode / Railway / Render | ค่าใช้จ่าย, region |
| Q3 | มี domain name แล้วหรือยัง? ใช้ subdomain อะไร? | เช่น `sales.wanwanach.com` | ต้องจด/ตั้ง DNS |
| Q4 | งบประมาณต่อเดือนเท่าไร? | 0-2,000 บาท | กำหนดขนาด VPS/plan |

### ด้าน Security

| # | คำถาม | ทางเลือก | ผลกระทบ |
|---|-------|---------|---------|
| Q5 | จะเปิดให้เข้าถึงจาก internet ทั้งหมด หรือจำกัด IP? | เปิดทั้งหมด / VPN / IP whitelist | ระดับ security ที่ต้องทำ |
| Q6 | ต้องการ 2FA (Two-Factor Auth) หรือไม่? | ใช่ / ไม่ | เพิ่มเวลาพัฒนา 2-3 วัน |
| Q7 | ข้อมูลใน Supabase เป็นความลับระดับไหน? | ข้อมูลทั่วไป / ข้อมูลลับทางธุรกิจ | กำหนดระดับ RLS/encryption |

### ด้าน Data & Features

| # | คำถาม | ทางเลือก | ผลกระทบ |
|---|-------|---------|---------|
| Q8 | ต้อง deploy Prototype (Trend Dashboard) ด้วยหรือไม่? | ใช่ / ไม่ / ภายหลัง | เพิ่มงาน 2-3 วัน |
| Q9 | ข้อมูล Excel 2,500+ ไฟล์ (Data/) ต้องขึ้น cloud ด้วยหรือไม่? | ใช่ / ไม่ | เพิ่ม storage 5-10 GB |
| Q10 | Product images ปัจจุบันมีขนาดเท่าไร? | ต้องตรวจ | กำหนดขนาด disk |
| Q11 | มีแผนเพิ่มจำนวนผู้ใช้ในอนาคตหรือไม่? | 19 คน / 50+ คน / 100+ คน | กำหนดขนาด server/auth system |

### ด้าน Operation

| # | คำถาม | ทางเลือก | ผลกระทบ |
|---|-------|---------|---------|
| Q12 | ใครจะเป็นผู้ดูแล server หลัง deploy? | ทีม dev / IT / outsource | ต้องเตรียม runbook |
| Q13 | ต้องการ uptime เท่าไร? | 95% / 99% / 99.9% | กำหนด architecture (single/HA) |
| Q14 | ช่วงเวลาที่สามารถ downtime ได้ (maintenance window)? | เช่น วันเสาร์ 22:00-06:00 | กำหนดช่วง deploy/update |
| Q15 | ต้องการ staging environment แยกจาก production หรือไม่? | ใช่ / ไม่ | เพิ่มค่าใช้จ่าย 2x |

---

## ภาคผนวก

### A. Checklist สรุปรวม (สำหรับ Print)

```
PRE-DEPLOYMENT CHECKLIST
=========================

P0 (ต้องทำ):
[ ] P0-1  แก้ path traversal ใน static file server
[ ] P0-2  สร้าง .env file + .env.example
[ ] P0-3  ย้าย Supabase key ไป server-side proxy
[ ] P0-4  ลบ hardcoded credentials ออกจาก client JS
[ ] P0-5  เพิ่ม server-side auth middleware
[ ] P0-6  จำกัด CORS เป็น whitelist
[ ] P0-7  ตั้ง HTTPS (Nginx + Let's Encrypt)
[ ] P0-8  เพิ่ม .gitignore entries (.env ฯลฯ)

P1 (ควรทำ):
[ ] P1-1  เพิ่ม /healthz endpoint
[ ] P1-2  เพิ่ม rate limiting
[ ] P1-3  ตั้ง PM2 process manager
[ ] P1-4  เปิด Gzip compression
[ ] P1-5  ตั้ง firewall (ufw)
[ ] P1-6  เพิ่ม error logging + rotation
[ ] P1-7  ตั้ง backup อัตโนมัติ
[ ] P1-8  ทดสอบบน Linux

P2 (ทำภายหลัง):
[ ] P2-1  แยก data ออกจาก app.js
[ ] P2-2  CDN สำหรับ static assets
[ ] P2-3  Code splitting
[ ] P2-4  Containerize (Docker)
[ ] P2-5  CI/CD pipeline
[ ] P2-6  ย้าย/deploy prototype
[ ] P2-7  ย้าย catalog state ไป DB
[ ] P2-8  Bundle CDN dependencies local
```

### B. ไฟล์ที่ต้องสร้าง/แก้ไข

| ไฟล์ | สถานะ | รายละเอียด |
|------|-------|-----------|
| `.env` | สร้างใหม่ | Environment variables (ห้าม commit) |
| `.env.example` | สร้างใหม่ | Template สำหรับ .env (ไม่มีค่าจริง) |
| `.gitignore` | แก้ไข | เพิ่ม `.env`, `catalog-overrides.json` |
| `server.js` | แก้ไข | เพิ่ม auth, path traversal fix, env vars, health check |
| `js/supabase-test.js` | แก้ไข | ลบ hardcoded key, เปลี่ยนเป็นเรียกผ่าน server |
| `js/supa-data.js` | แก้ไข | เปลี่ยน endpoint ไปใช้ server proxy |
| `js/auth.js` | แก้ไข | ย้าย user data ไป server-side |
| `package.json` | แก้ไข | เพิ่ม `dotenv`, start script |
| `Dockerfile` | สร้างใหม่ (Option B) | Container image definition |
| `docker-compose.yml` | สร้างใหม่ (Option B) | Multi-service orchestration |
| `nginx/spbi.conf` | สร้างใหม่ | Nginx reverse proxy config |
| `.github/workflows/deploy.yml` | สร้างใหม่ (Option B) | CI/CD pipeline |

---

*เอกสารฉบับนี้จัดทำเพื่อใช้เป็นแนวทางในการนำระบบ SPBI ขึ้น cloud*
*ควรทบทวนและปรับปรุงเมื่อมีการเปลี่ยนแปลงสถาปัตยกรรมหรือความต้องการ*
