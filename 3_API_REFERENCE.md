# 🌐 API Reference — Schema \& Connection

> เอกสารบอกวิธีต่อ Supabase API + schema ของ tables
> \*\*v3 (Aug 2026)\*\*: Pre-aggregated tables (แทน raw sales\_fact ที่โต 1+ GB)
> ทั้งหมด English column names

\---

## Connection

### Endpoint

```
Base URL:    https://gdjwsxeptloppefuiwum.supabase.co
REST API:    https://gdjwsxeptloppefuiwum.supabase.co/rest/v1
```

### Credentials

Get จาก Supabase Dashboard → **Project Settings → API**

|Key|Use case|
|-|-|
|**Anon (public) key**|Frontend / client-side (safe in browser)|
|**Service role key**|Backend / admin (server-side only)|
|**DB Password**|Direct SQL (server-side only)|

### Headers (ทุก request)

```http
apikey: <ANON\_OR\_SERVICE\_KEY>
Authorization: Bearer <ANON\_OR\_SERVICE\_KEY>
Content-Type: application/json
```

### Direct SQL (Session Pooler URI — IPv4)

```
postgresql://postgres.gdjwsxeptloppefuiwum:<PASSWORD>@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

\---

## 📊 Table: `sales\_daily`

**ยอดขายรายวัน — grain: date × source × channel × customer × branch**

**Filter**: เก็บเฉพาะยอดขายจริง (ตัด `doc\_type LIKE 'CT%'` + `doc\_type LIKE 'IS%'`)

### Schema

|Column|Type|Description|
|-|-|-|
|`id`|bigint|Auto PK|
|`date`|date|วันที่ขาย|
|`source`|text|`cash`, `credit`, `credit\_note`, `booth`, `online\_product`, `amazon`|
|`channel`|text|`Store`, `Booth`, `Online`, `Telesale`|
|`customer\_category`|text|ประเภทลูกค้า (OR, black canyon, ร้านของฝาก, ...)|
|`branch\_code`|text|รหัสสาขา|
|`qty`|numeric|จำนวนรวม (SUM)|
|`revenue`|numeric|รายได้รวม (SUM total\_price)|
|`n\_transactions`|int|จำนวน transactions (COUNT)|
|`updated\_at`|timestamptz|Last consolidate|

### Indexes

* `ix\_sales\_daily\_date` on `date`
* `ix\_sales\_daily\_source` on `source`
* `ix\_sales\_daily\_channel` on `channel`
* `ix\_sales\_daily\_branch` on `branch\_code`

### Query Examples

```http
# ยอดขายวันนี้ per channel
GET /rest/v1/sales\_daily?date=eq.2026-08-01\&select=channel,revenue.sum()

# ยอดขาย 30 วันย้อนหลัง trend
GET /rest/v1/sales\_daily?date=gte.2026-07-01\&order=date

# Top 10 สาขายอดสูง
GET /rest/v1/sales\_daily?date=gte.2026-07-01\&select=branch\_code,revenue.sum()\&order=revenue.sum.desc\&limit=10
```

\---

## 🛍 Table: `product\_monthly`

**ยอดขายรายสินค้าต่อเดือน — grain: month × product × channel × customer**

### Schema

|Column|Type|Description|
|-|-|-|
|`id`|bigint|Auto PK|
|`year\_month`|text|`2026-07` format|
|`product\_code`|text|รหัสสินค้า|
|`product\_name`|text|ชื่อสินค้า|
|`source`|text|`cash/credit/booth/online/amazon`|
|`channel`|text|ช่องทาง|
|`customer\_category`|text|ประเภทลูกค้า|
|`qty`|numeric|จำนวนรวม|
|`revenue`|numeric|รายได้รวม|
|`updated\_at`|timestamptz|Last consolidate|

### Indexes

* `ix\_product\_monthly\_ym` on `year\_month`
* `ix\_product\_monthly\_product` on `product\_code`
* `ix\_product\_monthly\_channel` on `channel`

### Query Examples

```http
# Top 10 สินค้าขายดีเดือนนี้
GET /rest/v1/product\_monthly?year\_month=eq.2026-07\&select=product\_code,product\_name,revenue.sum()\&order=revenue.sum.desc\&limit=10

# Trend สินค้าย้อนหลัง
GET /rest/v1/product\_monthly?product\_code=eq.1004046\&order=year\_month

# ยอดต่อสินค้าแยก channel
GET /rest/v1/product\_monthly?year\_month=eq.2026-07\&channel=eq.Online\&order=revenue.desc
```

\---

## 📍 Table: `location\_monthly`

**ยอดขายรายพื้นที่ต่อเดือน — grain: month × province × district × area × branch**

### Schema

|Column|Type|Description|
|-|-|-|
|`id`|bigint|Auto PK|
|`year\_month`|text|`2026-07`|
|`province`|text|จังหวัด|
|`district`|text|อำเภอ|
|`area`|text|ภูมิภาค (BKK1, อีสานล่าง, ใต้, ...)|
|`branch\_code`|text|รหัสสาขา|
|`branch\_name`|text|ชื่อสาขา|
|`qty`|numeric|จำนวนรวม|
|`revenue`|numeric|รายได้รวม|
|`updated\_at`|timestamptz|Last consolidate|

### Indexes

* `ix\_location\_monthly\_ym` on `year\_month`
* `ix\_location\_monthly\_area` on `area`
* `ix\_location\_monthly\_province` on `province`
* `ix\_location\_monthly\_branch` on `branch\_code`

### Query Examples

```http
# ยอดขายแยก area เดือนนี้
GET /rest/v1/location\_monthly?year\_month=eq.2026-07\&select=area,revenue.sum()

# ยอดขายแยกจังหวัด — top 10
GET /rest/v1/location\_monthly?year\_month=eq.2026-07\&select=province,revenue.sum()\&order=revenue.sum.desc\&limit=10

# สาขาในภาคใต้เดือน ก.ค.
GET /rest/v1/location\_monthly?year\_month=eq.2026-07\&area=eq.ใต้\&order=revenue.desc
```

\---

## 📋 Dimension Tables

### `branch\_master`

|Column|Type|Description|
|-|-|-|
|`branch\_code`|text|Primary Key|
|`branch\_name`|text|ชื่อสาขา|
|`customer\_category`|text|ประเภทลูกค้า|
|`channel`|text|ช่องทาง|
|`province`|text|จังหวัด|
|`district`|text|อำเภอ|
|`area`|text|ภูมิภาค|
|`updated\_at`|timestamptz|Last sync|

### `product\_master`

|Column|Type|Description|
|-|-|-|
|`product\_code`|text|Primary Key|
|`product\_name`|text|ชื่อสินค้า|
|`main\_product`|text|หมวดหลัก|
|`price`|numeric|ราคาต่อหน่วย|
|`status`|text|สถานะสินค้า|
|`updated\_at`|timestamptz|Last sync|

### `customer\_map`

Amazon Ship-To → Customer code mapping

|Column|Type|Description|
|-|-|-|
|`ship\_to`|text|Primary Key|
|`code`|text|Internal customer code|
|`updated\_at`|timestamptz|Last sync|

### `sync\_log`

Audit trail — บันทึกทุกครั้งที่รัน pipeline

|Column|Type|Description|
|-|-|-|
|`id`|bigint|Auto PK|
|`run\_at`|timestamptz|Timestamp|
|`action`|text|`sync\_masters`, `push\_aggregates`|
|`rows\_affected`|int|จำนวน rows|
|`duration\_sec`|numeric|เวลาที่ใช้|
|`detail`|jsonb|Optional metadata|

\---

## 📐 Estimated Sizes

|Table|Rows|Size|
|-|-:|-:|
|sales\_daily|\~500,000|\~100 MB|
|product\_monthly|\~360,000|\~70 MB|
|location\_monthly|\~36,000|\~7 MB|
|branch\_master|\~1,000|\~1 MB|
|product\_master|\~500|\~1 MB|
|customer\_map|\~200|\~0.1 MB|
|sync\_log|\~100|\~0.1 MB|
|**Total**||**\~180 MB**|

**Fit Supabase Free tier** (500 MB limit) — เหลือ \~320 MB buffer

\---

## Enum-like Values

**`source`**:

* `cash`, `credit`, `credit\_note`, `booth`, `online\_product`, `amazon`

**`channel`**:

* `Store` — สาขา
* `Booth` — Booth 13 สาขา
* `Online` — Shopee/Lazada/TikTok/Line OA
* `Telesale` — Amazon / phone

\---

## Filter Operators (PostgREST)

|Operator|SQL|URL example|
|-|-|-|
|`eq`|`=`|`?col=eq.value`|
|`neq`|`!=`|`?col=neq.value`|
|`gt` / `gte`|`>` / `>=`|`?col=gt.100`|
|`lt` / `lte`|`<` / `<=`|`?col=lt.100`|
|`like` / `ilike`|LIKE|`?col=like.\*keyword\*`|
|`in`|IN|`?col=in.(a,b,c)`|
|`is`|IS NULL|`?col=is.null`|
|`not.eq`|negation|`?col=not.eq.value`|

\---

## Rate Limits (Supabase Free)

* **Egress**: 5 GB/month
* **Database size**: 500 MB (hard limit)
* **File storage**: 1 GB
* **Monthly active users**: 50,000
* **Concurrent connections**: 60 (via pooler)

**Best practices**:

* ใช้ `select=` ระบุคอลัมน์ที่ใช้จริง
* ใช้ `limit=` เสมอ
* Cache client-side 5-10 นาที
* Aggregate query แทน raw row query

\---

## Row Level Security (RLS)

Default: table access ปิดสำหรับ anonymous users

**เปิด read สำหรับ frontend**:

```sql
ALTER TABLE sales\_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON sales\_daily FOR SELECT USING (true);
```

Repeat สำหรับ `product\_monthly`, `location\_monthly`, `branch\_master`, `product\_master`, `customer\_map`, `sync\_log`

**ห้ามเขียนจาก anon**: default deny — INSERT/UPDATE/DELETE ถูกปฏิเสธ

\---

## Data Refresh Cycle

|Table|Frequency|Strategy|Update via|
|-|-|-|-|
|`sales\_daily`|Daily|TRUNCATE + INSERT|`push\_aggregates\_to\_db.ipynb`|
|`product\_monthly`|Daily|TRUNCATE + INSERT|`push\_aggregates\_to\_db.ipynb`|
|`location\_monthly`|Daily|TRUNCATE + INSERT|`push\_aggregates\_to\_db.ipynb`|
|`branch\_master`|เมื่อ user แก้ xlsx|UPSERT|`sync\_masters.ipynb`|
|`product\_master`|เมื่อ user แก้ xlsx|UPSERT|`sync\_masters.ipynb`|
|`customer\_map`|เมื่อ CSV ใหม่|UPSERT|`sync\_masters.ipynb`|
|`sync\_log`|ทุก push run|INSERT append|Auto|

**เช็ค data freshness**:

```sql
SELECT MAX(updated\_at) FROM sales\_daily;
```

\---

## Data Coverage

**In DB (aggregated)**: 2024-01-01 → present
**In local parquet (raw)**: All history (2022+) — `data\_pipeline\\outputs\\sales\_fact.parquet`

**For row-level analysis** (ไม่มีใน DB):

* Query local parquet ผ่าน pandas
* ตัวอย่าง: `pd.read\_parquet(r"...\\sales\_fact.parquet")`

\---

## Migration History

### v3 (Aug 2026) — Aggregated tables (current)

* Drop `sales\_fact` from DB
* Add 3 aggregated tables (sales\_daily, product\_monthly, location\_monthly)
* Filter valid sales only (exclude CT\*, IS\*)
* **Reason**: Free tier 500MB limit — raw sales\_fact โต 1+ GB

### v2 (Aug 2026) — English column names

* Rename Thai columns → English

### v1 (Initial) — Thai column names + raw sales\_fact

* Deprecated

