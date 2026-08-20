# Trend & Competitor Analysis Dashboard v2 -- แผนงานขยายจาก 3 tabs เป็น 10 sections
> วันที่: 2026-08-09
> สถานะ: รอ approve จาก lead

---

## 1. โครงสร้าง Navigation ทั้งหมด (Left Sidebar + Sub-tabs)

### Sidebar (10 sections หลัก) พร้อม Sub-tabs

| # | Section Key | ชื่อไทย (Sidebar) | Icon | Sub-tabs (แสดงเป็น secondary tabs ใน content area) |
|---|-------------|-------------------|------|-----------------------------------------------------|
| 1 | `executive` | ภาพรวมผู้บริหาร | BarChart3 | -- ไม่มี sub-tab (หน้าเดียว) |
| 2 | `market` | เทรนด์ตลาด | TrendingUp | `market-overview` ภาพรวมตลาดเบเกอรี่ / `market-growth` การเติบโตตามหมวด / `market-seasonal` เทรนด์ตามฤดูกาล |
| 3 | `competitor` | วิเคราะห์คู่แข่ง | Users | `comp-overview` ภาพรวมคู่แข่ง / `comp-price` เปรียบเทียบราคา / `comp-product` เปรียบเทียบสินค้า / `comp-promo` เปรียบเทียบโปรโมชัน |
| 4 | `product` | เทรนด์สินค้า | Package | `prod-trending` สินค้ายอดนิยม / `prod-category` ตามหมวดหมู่ / `prod-keyword` คีย์เวิร์ดและการค้นหา |
| 5 | `consumer` | พฤติกรรมผู้บริโภค | Heart | `cons-behavior` พฤติกรรมการซื้อ / `cons-sentiment` ความรู้สึกและรีวิว / `cons-social` Social Listening |
| 6 | `area` | พื้นที่/ภูมิภาค | MapPin | `area-overview` ภาพรวมภูมิภาค / `area-channel` ช่องทางจำหน่าย / `area-heatmap` แผนที่ความร้อน |
| 7 | `monitor` | ติดตามคู่แข่ง | Eye | `mon-realtime` กิจกรรมล่าสุด / `mon-newproduct` สินค้าใหม่ / `mon-pricing` การเปลี่ยนแปลงราคา |
| 8 | `ai-insight` | AI วิเคราะห์ | Brain | `ai-summary` สรุปอัตโนมัติ / `ai-forecast` พยากรณ์แนวโน้ม / `ai-recommend` คำแนะนำ |
| 9 | `alert` | ศูนย์แจ้งเตือน | Bell | `alert-active` แจ้งเตือนปัจจุบัน / `alert-history` ประวัติ / `alert-settings` ตั้งค่า |
| 10 | `action` | แผนปฏิบัติการ | ClipboardCheck | `action-plan` แผนงาน / `action-calendar` ปฏิทิน / `action-kpi` KPI ติดตาม |

### หมายเหตุ Icons
ใช้ Unicode/emoji หรือ inline SVG เพื่อไม่ต้องเพิ่ม dependency (ไม่ใช้ icon library)
แต่ละ icon จะถูกเก็บใน sidebar config ของ app.js เป็น SVG path string

---

## 2. โครงสร้างไฟล์/โฟลเดอร์ของโปรเจกต์

```
prototype/trend-competitor-social/
├── server.js                          (คงเดิม -- static file server)
├── package.json                       (คงเดิม)
│
└── public/
    ├── index.html                     [แก้ไข] เปลี่ยน layout เป็น sidebar + content area
    │
    ├── css/
    │   ├── main.css                   [แก้ไข] เพิ่ม sidebar layout, sub-tab bar
    │   ├── sidebar.css                [ใหม่] sidebar styles, collapse, mobile overlay
    │   └── charts.css                 (คงเดิม -- chart card + table styles)
    │
    ├── data/
    │   ├── trends.json                (คงเดิม -- ใช้ใน product-trending + market)
    │   ├── competitors.json           (คงเดิม -- ใช้ใน competitor tabs)
    │   ├── social.json                (คงเดิม -- ใช้ใน consumer-social)
    │   ├── executive.json             [ใหม่] KPI cards, summary charts
    │   ├── market.json                [ใหม่] ภาพรวมตลาดเบเกอรี่, growth, seasonal
    │   ├── consumer.json              [ใหม่] พฤติกรรมผู้บริโภค, demographics
    │   ├── area.json                  [ใหม่] ข้อมูลภูมิภาค, ช่องทาง, coordinates
    │   ├── monitor.json               [ใหม่] กิจกรรมคู่แข่งล่าสุด, สินค้าใหม่, ราคา
    │   ├── ai-insight.json            [ใหม่] AI summary, forecast, recommendations
    │   ├── alerts.json                [ใหม่] การแจ้งเตือน active + history
    │   └── action.json                [ใหม่] แผนปฏิบัติการ, calendar events, KPI targets
    │
    └── js/
        ├── app.js                     [แก้ไขใหญ่] เปลี่ยนเป็น 2-level router (section + sub-tab)
        │
        ├── lib/
        │   └── chart.umd.js           (คงเดิม -- Chart.js 4.4.7 local)
        │
        ├── shared/
        │   ├── chart-factory.js       (คงเดิม -- registry pattern)
        │   ├── data-loader.js         (คงเดิม -- fetchJSON + cache)
        │   ├── filters.js             [แก้ไข] เพิ่ม filter options ใหม่ (region, brand)
        │   ├── sidebar.js             [ใหม่] sidebar render, toggle, active state, mobile
        │   ├── sub-tabs.js            [ใหม่] sub-tab bar render, switching logic
        │   └── icons.js               [ใหม่] SVG icon registry สำหรับ sidebar
        │
        └── tabs/
            ├── executive/
            │   └── executive.js       [ใหม่] KPI dashboard (ไม่มี sub-tab)
            │
            ├── market/
            │   ├── market-overview.js  [ใหม่] ภาพรวมตลาดเบเกอรี่
            │   ├── market-growth.js    [ใหม่] การเติบโตตามหมวด
            │   └── market-seasonal.js  [ใหม่] เทรนด์ตามฤดูกาล
            │
            ├── competitor/
            │   ├── comp-overview.js    [ใหม่] refactor จาก competitors.js เดิม
            │   ├── comp-price.js       [ใหม่] เปรียบเทียบราคาละเอียด
            │   ├── comp-product.js     [ใหม่] เปรียบเทียบสินค้า
            │   └── comp-promo.js       [ใหม่] เปรียบเทียบโปรโมชัน
            │
            ├── product/
            │   ├── prod-trending.js    [ใหม่] refactor จาก trends.js เดิม
            │   ├── prod-category.js    [ใหม่] วิเคราะห์ตามหมวดหมู่
            │   └── prod-keyword.js     [ใหม่] คีย์เวิร์ดและการค้นหา
            │
            ├── consumer/
            │   ├── cons-behavior.js    [ใหม่] พฤติกรรมการซื้อ
            │   ├── cons-sentiment.js   [ใหม่] ความรู้สึกและรีวิว
            │   └── cons-social.js      [ใหม่] refactor จาก social.js เดิม
            │
            ├── area/
            │   ├── area-overview.js    [ใหม่] ภาพรวมภูมิภาค
            │   ├── area-channel.js     [ใหม่] ช่องทางจำหน่าย
            │   └── area-heatmap.js     [ใหม่] แผนที่ความร้อน (HTML table-based)
            │
            ├── monitor/
            │   ├── mon-realtime.js     [ใหม่] กิจกรรมล่าสุดของคู่แข่ง
            │   ├── mon-newproduct.js   [ใหม่] สินค้าใหม่ของคู่แข่ง
            │   └── mon-pricing.js      [ใหม่] การเปลี่ยนแปลงราคา
            │
            ├── ai-insight/
            │   ├── ai-summary.js       [ใหม่] สรุปอัตโนมัติ
            │   ├── ai-forecast.js      [ใหม่] พยากรณ์แนวโน้ม
            │   └── ai-recommend.js     [ใหม่] คำแนะนำเชิงกลยุทธ์
            │
            ├── alert/
            │   ├── alert-active.js     [ใหม่] แจ้งเตือนปัจจุบัน
            │   ├── alert-history.js    [ใหม่] ประวัติแจ้งเตือน
            │   └── alert-settings.js   [ใหม่] ตั้งค่าแจ้งเตือน
            │
            └── action/
                ├── action-plan.js      [ใหม่] แผนงาน/โครงการ
                ├── action-calendar.js  [ใหม่] ปฏิทินกิจกรรม
                └── action-kpi.js       [ใหม่] KPI ติดตาม
```

### หน้าที่ของแต่ละไฟล์สำคัญ

| ไฟล์ | หน้าที่ |
|------|---------|
| `app.js` | 2-level router: อ่าน hash `#section/subtab` -> mount section -> mount sub-tab, จัดการ sidebar active state |
| `sidebar.js` | render sidebar HTML, toggle collapse/expand, mobile overlay/hamburger, highlight active section |
| `sub-tabs.js` | render sub-tab bar ใน content area, จัดการ active sub-tab, ส่ง event เมื่อเปลี่ยน sub-tab |
| `icons.js` | export object ที่มี SVG path string สำหรับแต่ละ section icon |
| `filters.js` (แก้ไข) | เพิ่ม brand filter, region filter สำหรับ section ที่ต้องการ |
| แต่ละ tab module | export `mount(container)` + `unmount()` ตาม pattern เดิม |

---

## 3. Charts / การแสดงผลในแต่ละ Section + Sub-tab

### 3.1 Executive Overview (ภาพรวมผู้บริหาร) -- ไม่มี sub-tab

| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| KPI Cards (6 ใบ) | HTML cards | ยอดขายรวม, จำนวนออเดอร์, Market Share, Growth %, คู่แข่งที่ track, Sentiment Score |
| ยอดขายรวมรายเดือน vs เป้า | Line + Bar (combo) | เส้น = เป้า, แท่ง = จริง, 6 เดือน |
| Market Share Trend | Stacked Area | ส่วนแบ่งตลาด 6 แบรนด์ รายเดือน |
| Top 5 สินค้าขายดี | Horizontal Bar | เรียงตามยอดขาย |
| Sentiment Overview | Doughnut | Positive/Neutral/Negative รวมทุกแพลตฟอร์ม |
| สรุปการแจ้งเตือนล่าสุด | HTML list | 5 alerts ล่าสุด (link ไป Alert Center) |

### 3.2 Market Trend (เทรนด์ตลาด)

**Sub-tab: ภาพรวมตลาดเบเกอรี่ (`market-overview`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| KPI Cards (3 ใบ) | HTML cards | มูลค่าตลาดรวม, อัตราเติบโต YoY, จำนวนผู้เล่น |
| มูลค่าตลาดเบเกอรี่รายเดือน | Line | มูลค่ารวม 6 เดือน พร้อมเส้น trendline |
| สัดส่วนตามหมวดสินค้า | Doughnut | เค้ก, ขนมปัง, คุกกี้, ครัวซองต์, โดนัท, พาย |
| แบรนด์ Top 6 เทียบยอดขาย | Grouped Bar | ยอดขายแยกตามแบรนด์ |

**Sub-tab: การเติบโตตามหมวด (`market-growth`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| Growth % ตามหมวด | Horizontal Bar | เรียงจาก growth สูง -> ต่ำ |
| เทรนด์การเติบโตรายสัปดาห์ | Multi-line | แต่ละหมวดเป็น 1 เส้น |
| ตารางสรุปหมวดสินค้า | HTML Table | หมวด, มูลค่า, growth%, trend arrow |

**Sub-tab: เทรนด์ตามฤดูกาล (`market-seasonal`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| Seasonal Heatmap | HTML table/grid | แกน X = เดือน, แกน Y = หมวดสินค้า, สี = volume |
| เทศกาลที่กระทบยอดขาย | Timeline (HTML) | วาเลนไทน์, สงกรานต์, แม่, พ่อ ฯลฯ |
| เปรียบเทียบ peak season | Grouped Bar | ยอดขายช่วงเทศกาล vs ปกติ |

### 3.3 Competitor Analysis (วิเคราะห์คู่แข่ง)

**Sub-tab: ภาพรวมคู่แข่ง (`comp-overview`)** -- refactor จาก competitors.js เดิม
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| KPI Cards (3 ใบ) | HTML cards | จำนวนคู่แข่ง, Market Leader, ราคาเฉลี่ยตลาด |
| ส่วนแบ่งตลาด | Doughnut | 6 แบรนด์ + อื่นๆ (reuse จากเดิม) |
| คะแนนรีวิว Radar | Radar | 6 มิติ (reuse จากเดิม) |
| ยอดขายรายสัปดาห์ | Multi-line | 6 แบรนด์ (reuse จากเดิม) |
| ตารางสรุปคู่แข่ง | HTML Table | (reuse จากเดิม) |

**Sub-tab: เปรียบเทียบราคา (`comp-price`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| ราคาเฉลี่ยแต่ละแบรนด์ | Bar | (reuse + ขยาย) |
| Price Range (min-max) | Range Bar / Floating Bar | แสดง min-max ของแต่ละแบรนด์ |
| ราคาตามหมวดสินค้า | Grouped Bar | เค้ก/ขนมปัง/คุกกี้ แยกตามแบรนด์ |
| ตารางราคาละเอียด | HTML Table | แบรนด์, สินค้า, ราคา, price tier |

**Sub-tab: เปรียบเทียบสินค้า (`comp-product`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| จำนวนสินค้าต่อแบรนด์ | Bar | จำนวน SKU |
| สัดส่วนหมวดสินค้าแต่ละแบรนด์ | Stacked Bar (100%) | เค้ก/ขนมปัง/คุกกี้ สัดส่วน |
| สินค้า Best Seller แต่ละแบรนด์ | HTML Cards | ชื่อสินค้า, ราคา, rating |
| Feature Comparison Matrix | HTML Table | ตาราง feature เทียบ (delivery, วัตถุดิบ, packaging) |

**Sub-tab: เปรียบเทียบโปรโมชัน (`comp-promo`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| ปฏิทินโปรโมชัน | HTML Timeline | promo ของแต่ละแบรนด์ตามเวลา |
| ประเภทโปรโมชันที่ใช้ | Stacked Bar | ลด%, ซื้อ1แถม1, ส่งฟรี, คูปอง |
| ความถี่โปรโมชัน | Bar | จำนวนครั้ง/เดือน แต่ละแบรนด์ |
| ตาราง Active Promos | HTML Table | แบรนด์, ชื่อ promo, ช่วงเวลา, ส่วนลด |

### 3.4 Product Trend (เทรนด์สินค้า)

**Sub-tab: สินค้ายอดนิยม (`prod-trending`)** -- refactor จาก trends.js เดิม
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| Top 5 สินค้า Search Volume | Line | (reuse จากเดิม) |
| ตาราง Top 10 สินค้า | HTML Table | (reuse จากเดิม) |

**Sub-tab: ตามหมวดหมู่ (`prod-category`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| Volume ตามหมวด | Horizontal Bar | (reuse จากเดิม) |
| Trend ตามหมวด รายสัปดาห์ | Multi-line | แต่ละหมวดเป็น 1 เส้น |
| ตาราง category breakdown | HTML Table | หมวด, จำนวนสินค้า, volume, growth |

**Sub-tab: คีย์เวิร์ดและการค้นหา (`prod-keyword`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| Top 20 Keywords | Horizontal Bar | (reuse จากเดิม) |
| Keyword cloud alternative | Grouped Bar | กลุ่มคำ (หวาน, healthy, premium ฯลฯ) |
| Emerging keywords | HTML List | คีย์เวิร์ดใหม่ที่เพิ่งเริ่ม trend |

### 3.5 Consumer Trend (พฤติกรรมผู้บริโภค)

**Sub-tab: พฤติกรรมการซื้อ (`cons-behavior`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| ช่วงเวลาที่ซื้อมากสุด | Bar | แยกตามวันในสัปดาห์ + ช่วงเวลา |
| ค่าเฉลี่ยต่อออเดอร์ | Line | AOV trend รายสัปดาห์ |
| Top ช่องทางที่ซื้อ | Doughnut | Online/หน้าร้าน/Delivery |
| Demographics | Horizontal Bar | กลุ่มอายุ x เพศ |

**Sub-tab: ความรู้สึกและรีวิว (`cons-sentiment`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| Sentiment Trend | Stacked Area | Positive/Neutral/Negative รายสัปดาห์ |
| Sentiment ตามแบรนด์ | Grouped Bar | แต่ละแบรนด์ pos/neu/neg |
| Top หัวข้อรีวิว (Topic) | Horizontal Bar | รสชาติ, คุณภาพ, ราคา, บริการ |
| ตัวอย่างรีวิว | HTML Cards | รีวิวจริง + sentiment badge |

**Sub-tab: Social Listening (`cons-social`)** -- refactor จาก social.js เดิม
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| Mentions รายสัปดาห์ | Multi-line | (reuse จากเดิม) |
| Sentiment Doughnut | Doughnut | (reuse จากเดิม) |
| Hashtags ยอดนิยม | Horizontal Bar | (reuse จากเดิม) |
| Platform Breakdown | Bar | (reuse จากเดิม) |

### 3.6 Area / Regional Trend (พื้นที่/ภูมิภาค)

**Sub-tab: ภาพรวมภูมิภาค (`area-overview`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| ยอดขายตามภาค | Bar | เหนือ/กลาง/อีสาน/ใต้/กทม. |
| สัดส่วนภูมิภาค | Doughnut | % แต่ละภาค |
| ตาราง Top 10 จังหวัด | HTML Table | จังหวัด, ยอดขาย, growth |

**Sub-tab: ช่องทางจำหน่าย (`area-channel`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| ยอดขายตามช่องทาง | Stacked Bar | Online/Modern Trade/Traditional/Direct |
| Trend ช่องทาง | Multi-line | แต่ละช่องทางรายสัปดาห์ |
| ตาราง channel performance | HTML Table | ช่องทาง, ยอด, สัดส่วน, growth |

**Sub-tab: แผนที่ความร้อน (`area-heatmap`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| Heatmap ตารางจังหวัด x หมวด | HTML table (color-coded) | ไม่ใช้ map library -- ใช้ตารางสีแทน |
| Regional Comparison | Radar | 5 ภาค เทียบ 5 มิติ (ยอดขาย, growth, orders, AOV, customer) |

### 3.7 Competitor Monitoring (ติดตามคู่แข่ง)

**Sub-tab: กิจกรรมล่าสุด (`mon-realtime`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| Activity Feed | HTML Timeline/List | กิจกรรมล่าสุดของคู่แข่ง เรียงตามเวลา (card-based) |
| กิจกรรมตามแบรนด์ | Stacked Bar | จำนวนกิจกรรมต่อแบรนด์ แยกตามประเภท |
| Activity Count Trend | Line | จำนวนกิจกรรมรายสัปดาห์ |

**Sub-tab: สินค้าใหม่ (`mon-newproduct`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| Product Launch Timeline | HTML Timeline | สินค้าใหม่เรียงตามวันที่ launch |
| จำนวนสินค้าใหม่ต่อแบรนด์ | Bar | เปรียบเทียบ 6 แบรนด์ |
| หมวดสินค้าใหม่ | Doughnut | สัดส่วนหมวดของสินค้าที่เพิ่ง launch |

**Sub-tab: การเปลี่ยนแปลงราคา (`mon-pricing`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| Price Change Feed | HTML List | รายการปรับราคาล่าสุด (badge: ขึ้น/ลง) |
| Price Change Summary | Grouped Bar | จำนวนครั้งที่ปรับราคา ขึ้น vs ลง ต่อแบรนด์ |
| Avg Price Trend | Multi-line | ราคาเฉลี่ยแต่ละแบรนด์ตามเวลา |

### 3.8 AI Market Insight (AI วิเคราะห์)

**Sub-tab: สรุปอัตโนมัติ (`ai-summary`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| AI Summary Cards | HTML Cards (styled) | Insight cards + confidence score badge |
| Key Findings | HTML Numbered List | สรุป 5-7 ข้อค้นพบสำคัญ |
| SWOT Analysis | HTML 2x2 Grid | จุดแข็ง/จุดอ่อน/โอกาส/ภัยคุกคาม |

**Sub-tab: พยากรณ์แนวโน้ม (`ai-forecast`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| พยากรณ์ยอดขาย 3 เดือน | Line (dashed สำหรับ forecast) | Historical + Forecast + Confidence Band (fill) |
| พยากรณ์ Market Share | Stacked Area | แนวโน้มส่วนแบ่ง 3 เดือนข้างหน้า |
| Scenario Comparison | Grouped Bar | Best / Base / Worst case |

**Sub-tab: คำแนะนำ (`ai-recommend`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| Recommendation Cards | HTML Cards | คำแนะนำ + priority badge (สูง/กลาง/ต่ำ) |
| Impact vs Effort Matrix | Scatter / HTML Grid | 2x2 matrix แนะนำสิ่งที่ควรทำ |
| Quick Wins List | HTML Table | action, expected impact, effort, timeline |

### 3.9 Alert Center (ศูนย์แจ้งเตือน)

**Sub-tab: แจ้งเตือนปัจจุบัน (`alert-active`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| Active Alert Cards | HTML Cards | แจ้งเตือน + severity badge (critical/warning/info) |
| Alert Count by Type | Doughnut | สัดส่วนตามประเภท |
| Alert Trend | Bar | จำนวนแจ้งเตือนรายสัปดาห์ |

**Sub-tab: ประวัติ (`alert-history`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| ตารางประวัติแจ้งเตือน | HTML Table + pagination | วันที่, ประเภท, ข้อความ, สถานะ |
| Alert Volume Trend | Line | จำนวนแจ้งเตือนรายสัปดาห์ย้อนหลัง |

**Sub-tab: ตั้งค่า (`alert-settings`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| Alert Rules | HTML Form/Cards | toggle เปิด/ปิดแต่ละ rule (demo) |
| Threshold Config | HTML Form | ตั้งค่า threshold (demo, ไม่ persist) |

### 3.10 Action Plan (แผนปฏิบัติการ)

**Sub-tab: แผนงาน (`action-plan`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| Action Items | HTML Cards | แผนงาน + status badge (pending/in-progress/done) |
| Progress Overview | Doughnut | สัดส่วนสถานะ |
| Priority Breakdown | Horizontal Bar | จำนวนงานแยกตาม priority |

**Sub-tab: ปฏิทิน (`action-calendar`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| Monthly Calendar View | HTML Grid (7 col) | simple calendar with event dots |
| Upcoming Events List | HTML List | รายการ events ที่กำลังจะมาถึง |

**Sub-tab: KPI ติดตาม (`action-kpi`)**
| องค์ประกอบ | ประเภท | รายละเอียด |
|-----------|--------|-----------|
| KPI Gauge Cards | HTML Cards + CSS gauge | target vs actual + progress bar |
| KPI Trend | Multi-line | KPI แต่ละตัวรายสัปดาห์ |
| KPI Table | HTML Table | KPI, เป้า, จริง, %, สถานะ |

---

## 4. Layout Changes -- Sidebar Navigation Design

### 4.1 Layout Structure ใหม่

```
+--[prototype banner]-------------------------------------+
|                                                          |
+--[header]----[hamburger btn (mobile)]---[title]----------+
|              |                                           |
|  [sidebar]   |  [sub-tab bar (secondary tabs)]           |
|  - section1  |  +-[tab1]-[tab2]-[tab3]--------+         |
|  - section2  |  |                              |         |
|  - section3  |  |  [overview cards]            |         |
|  > section4* |  |                              |         |
|  - section5  |  |  [filter bar]                |         |
|  - ...       |  |                              |         |
|  - section10 |  |  [#app -- chart content]     |         |
|              |  |                              |         |
|  [collapse]  |  +------------------------------+         |
+--------------+-------------------------------------------+
```

### 4.2 Sidebar Specs

| Property | Value |
|----------|-------|
| Width (expanded) | 240px |
| Width (collapsed) | 64px (icon only) |
| Position | fixed left, below header |
| Collapse trigger | toggle button ที่ด้านล่าง sidebar |
| Active indicator | left border 3px accent-gradient + bg highlight |
| Hover effect | subtle bg change |
| Mobile (<768px) | overlay mode -- hamburger button ใน header, sidebar slide-in from left, backdrop overlay |
| Scroll | sidebar scrollable เมื่อ items เกินจอ |
| Z-index | sidebar: 700, overlay: 650 |

### 4.3 Sub-tab Bar Specs

| Property | Value |
|----------|-------|
| Position | ด้านบนของ content area (sticky ใต้ header) |
| Style | pill-style buttons หรือ underline tabs (คล้าย tab bar เดิม แต่เล็กกว่า) |
| Active state | accent underline + bold text (เหมือน tab เดิม) |
| ซ่อนเมื่อ | section ไม่มี sub-tab (Executive Overview) |

### 4.4 URL Hash Format

เปลี่ยนจาก `#tabKey` เป็น `#section/subtab`

ตัวอย่าง:
- `#executive` (ไม่มี sub-tab)
- `#competitor/comp-overview`
- `#competitor/comp-price`
- `#product/prod-trending`
- `#consumer/cons-social`

Default: `#executive`

### 4.5 Content Area

| Property | Value |
|----------|-------|
| margin-left | sidebar width (240px หรือ 64px) -- transition 0.25s |
| padding-top | banner + header height (คงเดิม ไม่มี top tab-bar แล้ว) |
| max-width | 1400px (คงเดิม) |
| Overview cards | ย้ายเข้ามาใน tab module (ไม่อยู่ใน HTML shell) -- แต่ละ section จัดการ KPI cards เอง |

---

## 5. งานย่อย (Tasks) เรียงตามลำดับ

### Milestone 1: โครงหลักรันได้ (Sidebar + Router + 2 sections ทำงาน)

| Task | สิ่งที่ต้องทำ | ไฟล์ที่เกี่ยวข้อง | ขึ้นอยู่กับ | เกณฑ์เสร็จ |
|------|-------------|------------------|-----------|-----------|
| T01 | สร้าง sidebar.css -- styles สำหรับ sidebar ทั้ง expanded/collapsed/mobile overlay | `css/sidebar.css` | - | sidebar render ถูกต้องทั้ง 3 modes, มี transition animation |
| T02 | สร้าง icons.js -- SVG icon strings สำหรับ 10 sections | `js/shared/icons.js` | - | export object ที่มี key ตรงกับ section key ทั้ง 10 ตัว |
| T03 | สร้าง sidebar.js -- render sidebar, toggle collapse, mobile hamburger, active state | `js/shared/sidebar.js` | T01, T02 | sidebar แสดง 10 sections, click เปลี่ยน active, collapse/expand ทำงาน, mobile overlay ทำงาน |
| T04 | สร้าง sub-tabs.js -- render sub-tab bar, เปลี่ยน sub-tab, ส่ง callback | `js/shared/sub-tabs.js` | - | sub-tab bar แสดงตาม config, click เปลี่ยน active, ซ่อนเมื่อไม่มี sub-tab |
| T05 | แก้ index.html -- เปลี่ยน layout เป็น sidebar + content area, ลบ top tab-bar, ลบ overview-cards ออกจาก shell | `index.html` | T01 | HTML มี sidebar container, main content area, hamburger btn, ไม่มี top tab-bar |
| T06 | แก้ main.css -- ปรับ layout ให้ main-content อยู่ขวา sidebar, ลบ tab-bar styles เดิม, responsive breakpoints | `css/main.css` | T05 | content area ตำแหน่งถูกต้อง, responsive ทำงาน, ไม่มี CSS errors |
| T07 | เขียน app.js ใหม่ -- 2-level router (#section/subtab), import sidebar.js + sub-tabs.js, section config map | `js/app.js` | T03, T04, T05 | hash navigation ทำงาน, back/forward ทำงาน, default ไป executive |
| T08 | Refactor trends.js -> prod-trending.js -- ย้ายโค้ดจาก trends.js, ปรับ path, ลบ top-card updates (ย้ายเข้า module) | `js/tabs/product/prod-trending.js` | T07 | mount/unmount ทำงาน, charts แสดงเหมือนเดิม, ไม่มี console errors |
| T09 | Refactor competitors.js -> comp-overview.js -- ย้ายโค้ดจาก competitors.js, ปรับให้ KPI cards อยู่ใน module | `js/tabs/competitor/comp-overview.js` | T07 | mount/unmount ทำงาน, 4 charts + table แสดงเหมือนเดิม |
| T10 | ทดสอบ M1 -- sidebar nav ทำงาน, สลับระหว่าง product/competitor sections, sub-tab ทำงาน, mobile responsive | ทุกไฟล์ M1 | T08, T09 | ไม่มี console errors, charts ไม่ memory leak (สลับ tab 10 ครั้ง), mobile sidebar overlay ทำงาน |

### Milestone 2: ฟีเจอร์ครบ -- ทุก Section มี content

| Task | สิ่งที่ต้องทำ | ไฟล์ที่เกี่ยวข้อง | ขึ้นอยู่กับ | เกณฑ์เสร็จ |
|------|-------------|------------------|-----------|-----------|
| T11 | สร้าง executive.json + executive.js | `data/executive.json`, `js/tabs/executive/executive.js` | T07 | 6 KPI cards + 4 charts render, mount/unmount ไม่ error |
| T12 | สร้าง market.json + market-overview.js | `data/market.json`, `js/tabs/market/market-overview.js` | T07 | 3 KPI cards + 3 charts render |
| T13 | สร้าง market-growth.js | `js/tabs/market/market-growth.js` | T12 | 2 charts + 1 table render |
| T14 | สร้าง market-seasonal.js | `js/tabs/market/market-seasonal.js` | T12 | heatmap grid + timeline + 1 chart render |
| T15 | สร้าง comp-price.js | `js/tabs/competitor/comp-price.js` | T09 | 3 charts + 1 table render จาก competitors.json |
| T16 | สร้าง comp-product.js | `js/tabs/competitor/comp-product.js` | T09 | 2 charts + cards + matrix table render |
| T17 | สร้าง comp-promo.js + เพิ่ม promo data ใน competitors.json | `js/tabs/competitor/comp-promo.js`, `data/competitors.json` | T09 | timeline + 2 charts + table render |
| T18 | สร้าง prod-category.js | `js/tabs/product/prod-category.js` | T08 | 2 charts + table, ใช้ data จาก trends.json |
| T19 | สร้าง prod-keyword.js | `js/tabs/product/prod-keyword.js` | T08 | reuse keyword chart + emerging list |
| T20 | สร้าง consumer.json + cons-behavior.js | `data/consumer.json`, `js/tabs/consumer/cons-behavior.js` | T07 | 4 charts render |
| T21 | สร้าง cons-sentiment.js | `js/tabs/consumer/cons-sentiment.js` | T20 | sentiment trend + brand comparison + topic chart + review cards |
| T22 | Refactor social.js -> cons-social.js | `js/tabs/consumer/cons-social.js` | T07 | reuse social.js code, mount/unmount ทำงาน |
| T23 | สร้าง area.json + area-overview.js | `data/area.json`, `js/tabs/area/area-overview.js` | T07 | 2 charts + table render |
| T24 | สร้าง area-channel.js | `js/tabs/area/area-channel.js` | T23 | 2 charts + table render |
| T25 | สร้าง area-heatmap.js | `js/tabs/area/area-heatmap.js` | T23 | heatmap table + radar render |
| T26 | สร้าง monitor.json + mon-realtime.js | `data/monitor.json`, `js/tabs/monitor/mon-realtime.js` | T07 | activity feed + 2 charts render |
| T27 | สร้าง mon-newproduct.js | `js/tabs/monitor/mon-newproduct.js` | T26 | timeline + 2 charts render |
| T28 | สร้าง mon-pricing.js | `js/tabs/monitor/mon-pricing.js` | T26 | price feed + 2 charts render |
| T29 | สร้าง ai-insight.json + ai-summary.js | `data/ai-insight.json`, `js/tabs/ai-insight/ai-summary.js` | T07 | insight cards + SWOT grid render |
| T30 | สร้าง ai-forecast.js | `js/tabs/ai-insight/ai-forecast.js` | T29 | 3 charts render (forecast line with dashed + fill) |
| T31 | สร้าง ai-recommend.js | `js/tabs/ai-insight/ai-recommend.js` | T29 | recommendation cards + matrix + table render |
| T32 | สร้าง alerts.json + alert-active.js | `data/alerts.json`, `js/tabs/alert/alert-active.js` | T07 | alert cards + doughnut + bar render |
| T33 | สร้าง alert-history.js | `js/tabs/alert/alert-history.js` | T32 | table with simple pagination render |
| T34 | สร้าง alert-settings.js | `js/tabs/alert/alert-settings.js` | T32 | settings form/cards render (demo toggles) |
| T35 | สร้าง action.json + action-plan.js | `data/action.json`, `js/tabs/action/action-plan.js` | T07 | action cards + 2 charts render |
| T36 | สร้าง action-calendar.js | `js/tabs/action/action-calendar.js` | T35 | calendar grid + events list render |
| T37 | สร้าง action-kpi.js | `js/tabs/action/action-kpi.js` | T35 | KPI gauge cards + line chart + table render |
| T38 | แก้ filters.js -- เพิ่ม brand filter dropdown, region filter dropdown | `js/shared/filters.js` | T23, T20 | filter bar มี brand + region options, เปลี่ยนค่าแล้ว notify |
| T39 | ลงทะเบียนทุก section/subtab ใน app.js route config | `js/app.js` | T11-T37 | ทุก section สลับได้ไม่ error, hash URL ถูกต้อง |
| T40 | ทดสอบ M2 -- ทุก section mount/unmount ได้, ไม่มี console errors, charts ทำลายถูกต้อง | ทุกไฟล์ | T39 | 0 console errors, สลับทุก tab ได้ครบ 30+ sub-tabs |

### Milestone 3: ขัดเกลาและ Polish

| Task | สิ่งที่ต้องทำ | ไฟล์ที่เกี่ยวข้อง | ขึ้นอยู่กับ | เกณฑ์เสร็จ |
|------|-------------|------------------|-----------|-----------|
| T41 | Responsive testing + fix -- ทดสอบ sidebar/sub-tabs/charts ทุก breakpoint | `css/sidebar.css`, `css/main.css` | T40 | Desktop (1400+), Tablet (768-1199), Mobile (<768) ทำงานถูกต้อง |
| T42 | Performance -- lazy import tab modules (dynamic import) เพื่อไม่โหลดทุก module ตอน page load | `js/app.js` | T40 | Initial load < 5 วินาที, tab switch < 1 วินาที |
| T43 | Animation polish -- sidebar transition, sub-tab transition, chart fade-in | `css/sidebar.css`, `css/main.css` | T41 | transitions smooth, ไม่มี layout shift |
| T44 | Accessibility -- keyboard navigation sidebar, focus management, aria labels | `js/shared/sidebar.js`, `index.html` | T41 | Tab key navigate sidebar, Enter/Space select, aria-current on active |
| T45 | Cross-browser test -- Chrome, Edge, Firefox | ทุกไฟล์ | T43 | ทำงานถูกต้องทั้ง 3 browsers |
| T46 | ลบไฟล์เก่า -- ลบ trends.js, competitors.js, social.js ที่ถูก refactor แล้ว | `js/tabs/trends.js`, `js/tabs/competitors.js`, `js/tabs/social.js` | T40 | ไม่มี dead code, ไม่มี broken imports |

---

## 6. Definition of Done (DoD)

โปรแกรมถือว่าเสร็จเมื่อ:

- [ ] **Navigation ครบ**: Sidebar แสดง 10 sections ถูกต้อง, click เปลี่ยน section ได้ทุกตัว
- [ ] **Sub-tabs ครบ**: ทุก section ที่มี sub-tab สลับ sub-tab ได้ถูกต้อง (30 sub-tabs รวม)
- [ ] **Charts render ครบ**: ทุก chart ใน Section 3 render ได้, ข้อมูล demo แสดงถูกต้อง
- [ ] **Mount/Unmount ไม่ leak**: สลับ tab ไป-กลับ 20 ครั้ง ไม่มี Chart.js memory leak (registry clear)
- [ ] **Race condition guard**: สลับ tab เร็วๆ 10 ครั้ง ไม่มี stale render
- [ ] **Responsive 3 breakpoints**: Desktop (1200+), Tablet (768-1199), Mobile (<768) ทำงานครบ
- [ ] **Sidebar collapse/expand**: toggle ทำงาน, content area ปรับ margin ตาม
- [ ] **Mobile sidebar overlay**: hamburger button เปิด/ปิด sidebar, backdrop click ปิด
- [ ] **URL hash routing**: `#section/subtab` ทำงาน, browser back/forward ทำงาน, reload กลับ tab เดิม
- [ ] **Filter bar ทำงาน**: dateRange + platform + brand (ใหม่) เปลี่ยนแล้ว charts update
- [ ] **ไม่มี console errors**: 0 errors เมื่อใช้งานปกติทุก section
- [ ] **โหลดเร็ว**: ทุก tab mount ภายใน 2 วินาที (local server)
- [ ] **Thai UI text ครบ**: ทุก label, title, tooltip เป็นภาษาไทย
- [ ] **Demo data สมจริง**: ข้อมูลเบเกอรี่ไทย 6 แบรนด์, seasonal patterns, ตัวเลขสมเหตุสมผล

---

## 7. แนวทางการทดสอบ

### 7.1 Manual Smoke Test (ทุก task)

ทุก task ที่สร้าง tab module ใหม่ต้องทดสอบ:
1. เปิด browser -> navigate ไป section/subtab -> charts แสดงถูกต้อง
2. สลับไป tab อื่นแล้วกลับมา -> charts render ใหม่ไม่ error
3. เปลี่ยน filter -> charts update ตาม
4. Resize browser window -> responsive ทำงาน
5. เปิด DevTools Console -> 0 errors/warnings

### 7.2 Navigation Integration Test

| Test Case | ขั้นตอน | Expected |
|-----------|---------|----------|
| NAV-01 | Click ทุก 10 sections ใน sidebar | content เปลี่ยนถูกต้อง, sidebar highlight active |
| NAV-02 | Click ทุก sub-tab ใน competitor section (4 tabs) | sub-tab content เปลี่ยน, charts render, old charts destroyed |
| NAV-03 | พิมพ์ URL hash ตรง: `#ai-insight/ai-forecast` | เปิดถูก section + sub-tab |
| NAV-04 | พิมพ์ URL hash ผิด: `#invalid/xxx` | fallback ไป executive |
| NAV-05 | กด browser back/forward หลังสลับ 5 tabs | กลับไป tab ก่อนหน้าถูกต้อง |
| NAV-06 | Reload page ขณะอยู่ที่ `#consumer/cons-social` | กลับมาที่ tab เดิม |
| NAV-07 | สลับ tab เร็วๆ 10 ครั้ง (click รัวๆ) | ไม่ crash, ไม่มี stale render, แสดง tab สุดท้ายที่ click |

### 7.3 Sidebar-specific Tests

| Test Case | ขั้นตอน | Expected |
|-----------|---------|----------|
| SB-01 | Click collapse button | sidebar ย่อเหลือ icon, content ขยายเต็ม |
| SB-02 | Click expand button (ขณะ collapsed) | sidebar ขยายกลับ 240px, content ย่อ |
| SB-03 | Resize to mobile (<768px) | sidebar ซ่อน, hamburger button ปรากฏ |
| SB-04 | Click hamburger (mobile) | sidebar slide-in, backdrop ปรากฏ |
| SB-05 | Click backdrop (mobile) | sidebar ปิด |
| SB-06 | Click section ใน sidebar (mobile) | navigate + sidebar ปิดอัตโนมัติ |

### 7.4 Chart Memory Leak Test

| Test Case | ขั้นตอน | Expected |
|-----------|---------|----------|
| MEM-01 | เปิด DevTools > Performance Monitor > สลับ tab ไป-กลับ 20 ครั้ง | JS Heap ไม่เพิ่มขึ้นเรื่อยๆ (< 5MB increase) |
| MEM-02 | สลับ section ที่มี chart เยอะ (competitor -> product -> consumer) 10 รอบ | ไม่มี "Canvas is already in use" warning |

### 7.5 Filter Test

| Test Case | ขั้นตอน | Expected |
|-----------|---------|----------|
| FIL-01 | เปลี่ยน dateRange เป็น "4 สัปดาห์ล่าสุด" | charts แสดงข้อมูลเฉพาะ 4 สัปดาห์ |
| FIL-02 | เปลี่ยน platform เป็น "Facebook" | charts filter เฉพาะ Facebook |
| FIL-03 | สลับ tab ไปแล้วกลับ | filter ค่าเดิมคงอยู่ (persist) |
| FIL-04 | เลือก filter ที่ไม่มีข้อมูล | แสดง empty state ไม่ crash |

### 7.6 Responsive Test Matrix

| Breakpoint | Sidebar | Sub-tabs | Charts | Cards |
|-----------|---------|----------|--------|-------|
| Desktop 1400+ | expanded 240px | horizontal | 2-col grid | 3-col |
| Desktop 1200-1399 | expanded 240px | horizontal | 2-col grid | 3-col |
| Tablet 768-1199 | collapsed 64px | horizontal scroll | 1-col grid | 2-col |
| Mobile <768 | overlay (hidden default) | horizontal scroll | 1-col grid | 1-col |

---

## 8. ความเสี่ยงของแผน & แผนสำรอง

| # | ความเสี่ยง | ระดับ | ผลกระทบ | แผนสำรอง |
|---|-----------|-------|---------|---------|
| R1 | **ไฟล์ JSON demo data มากเกินไป (8 ไฟล์ใหม่)** -- ใช้เวลาสร้างข้อมูลนาน | สูง | M2 ล่าช้า 2-3 วัน | สร้าง data-generator.js script ที่ generate demo data อัตโนมัติ ไม่ต้องเขียนมือ |
| R2 | **2-level router ซับซ้อนกว่าเดิม** -- hash parsing `#section/subtab` อาจมี edge cases | ปานกลาง | T07 ใช้เวลาเพิ่ม 1 วัน | เขียน unit test สำหรับ hash parser function แยก, ทดสอบ edge cases ก่อน integrate |
| R3 | **Dynamic import (lazy loading) อาจมีปัญหากับ file:// protocol** | ต่ำ | T42 ต้องเปลี่ยนแนว | ใช้ static import ทั้งหมดแทน -- prototype ขนาดไม่ใหญ่มาก ยอมรับ initial load ช้าขึ้นเล็กน้อย |
| R4 | **Sidebar overlap กับ content บน tablet** -- CSS positioning ซับซ้อน | ปานกลาง | Layout เพี้ยนบาง breakpoint | เตรียม auto-collapse mode สำหรับ tablet (<1200px) ให้ sidebar เป็น icon-only โดย default |
| R5 | **Chart.js canvas ใน hidden sub-tab ไม่ render ถูกต้อง** -- Chart.js ต้องการ visible canvas | ปานกลาง | Chart บิดเบี้ยว | ใช้ mount pattern เดิม (สร้าง chart ตอน sub-tab mount เท่านั้น ไม่ pre-render) -- ปัญหานี้ไม่เกิดถ้าใช้ mount/unmount ถูกต้อง |
| R6 | **30+ tab modules ทำให้ app.js import list ยาวมาก** | ต่ำ | Code ไม่สวย | สร้าง section-registry.js ที่ auto-register modules ตาม folder structure, หรือใช้ dynamic import |
| R7 | **ข้อมูล demo ไม่สมจริงพอ ทำให้ chart ดูแปลก** | ปานกลาง | Stakeholder ไม่เชื่อ prototype | ใช้ข้อมูลจริงของ 6 แบรนด์เป็น base แล้ว randomize -- seasonal patterns ต้องสมเหตุสมผล (เค้กขายดีช่วงวาเลนไทน์/ปีใหม่) |
| R8 | **Mobile sidebar overlay ทำให้ scroll ไม่ smooth** | ต่ำ | UX ไม่ดีบน mobile | ใช้ `overflow: hidden` บน body เมื่อ sidebar overlay open, `touch-action: pan-y` บน sidebar |

### แผนรับมือถ้า Task ติดขัด

- **T07 (Router) ติด**: ถ้าเกิน 4 ชม. ให้ลดจาก 2-level hash เป็น flat hash `#comp-overview` (ทุก sub-tab เป็น top-level) แล้วค่อย refactor เป็น 2-level ทีหลัง
- **T03 (Sidebar) ติด**: ถ้า sidebar CSS ซับซ้อนเกิน ให้ทำ sidebar fixed width ก่อน ไม่ต้อง collapse ยังไม่ต้อง mobile overlay -- เพิ่มทีหลังใน M3
- **Data files ช้า**: ถ้า T11-T37 ช้าเพราะ data ให้สร้าง minimal JSON (3-5 records) ก่อน แล้วเติมข้อมูลเต็มทีหลัง
- **Tab module ใดก็ตามที่ chart แปลก**: ถ้าแก้ chart config เกิน 30 นาที ให้เปลี่ยนเป็น chart type ที่ง่ายกว่า (bar แทน radar, table แทน heatmap)

---

## 9. คำแนะนำสำหรับ Developer

### Pattern ที่ต้องทำตามทุก tab module

```javascript
// ทุก tab module ต้องมี structure นี้:
import { createChart, destroyAll } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';

let mountId = 0;

export async function mount(container) {
  const thisMount = ++mountId;
  
  // 1. แสดง loading
  container.innerHTML = `<div class="tab-content"><div class="loading-container">...</div></div>`;
  
  // 2. fetch data
  const data = await fetchJSON('/data/xxx.json');
  
  // 3. guard race condition
  if (thisMount !== mountId) return;
  
  // 4. render HTML + charts
  // ...
}

export function unmount() {
  mountId++;
  destroyAll();
  // cleanup listeners
}
```

### KPI Cards ย้ายเข้า module

เนื่องจาก layout ใหม่ไม่มี overview cards ถาวรใน HTML shell อีกต่อไป (แต่ละ section แสดง KPI cards ต่างกัน) ให้แต่ละ tab module render KPI cards เอง ภายใน `container.innerHTML`:

```html
<div class="tab-content">
  <section class="overview-cards">
    <div class="overview-card">...</div>
    <div class="overview-card">...</div>
    <div class="overview-card">...</div>
  </section>
  <div id="xxx-filters"></div>
  <div id="xxx-chart-area"></div>
</div>
```

### การตั้งชื่อ Canvas ID

ใช้ prefix ของ module เพื่อไม่ชนกัน:
- `chart-exec-sales`, `chart-exec-share`
- `chart-mkt-value`, `chart-mkt-category`
- `chart-comp-price`, `chart-comp-radar`
- ฯลฯ

### ลำดับความสำคัญของ Sections

ถ้าต้องตัด scope ให้ทำตามลำดับนี้:
1. **Must-have**: Executive, Competitor, Product, Consumer (core business value)
2. **Should-have**: Market, Area, Monitor (ขยาย insight)
3. **Nice-to-have**: AI Insight, Alert, Action (advanced features)
