/**
 * mon-newproduct.js - Sub-tab: สินค้าใหม่ในตลาด (Redesigned)
 * Product Cards แบบ rich (เพิ่ม rating, channel, description, รูปภาพ placeholder)
 * + chart จำนวนสินค้าใหม่ตามแบรนด์ + ตารางรายละเอียด
 * ข้อมูล demo ในตัว (hardcoded)
 * รองรับ filter reactive (เปลี่ยน filter -> ข้อมูลเปลี่ยนตาม)
 */
import { createChart, destroyAll, CHART_COLORS, BRAND_COLORS } from '../../shared/chart-factory.js';
import { buildFilterBar, onFilterChange, getFilterValues, PERIOD_FILTER, COMPETITOR_FILTER, CATEGORY_FILTER } from '../../shared/filter-builder.js';
import { varyValue, filterByCompetitor, filterByCategory } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

const STYLE_ID = 'mon-newproduct-style';

/* ---------- ข้อมูล Demo ---------- */

const NEW_PRODUCTS = [
  {
    brand: 'S&P', brandId: 'snp',
    name: 'ขนมปังโฮลวีทธัญพืช',
    category: 'bread', categoryLabel: 'ขนมปัง', price: 65, date: '2026-08-05',
    rating: 4.3, channel: 'ทุกสาขา/Online',
    description: 'ขนมปังโฮลวีทผสมธัญพืช 7 ชนิด ไม่ใส่น้ำตาล เพื่อสุขภาพ',
    highlight: true
  },
  {
    brand: 'After You', brandId: 'afteryou',
    name: 'ชีสเค้กมะม่วงน้ำดอกไม้',
    category: 'cake', categoryLabel: 'เค้ก', price: 295, date: '2026-08-01',
    rating: 4.7, channel: 'ร้าน After You',
    description: 'Limited Edition เค้กมะม่วงน้ำดอกไม้ ชีสครีมเนื้อนุ่ม เฉพาะฤดูกาล',
    highlight: true
  },
  {
    brand: 'Yamazaki', brandId: 'yamazaki',
    name: 'โดนัทมัทฉะพรีเมียม',
    category: 'donut', categoryLabel: 'โดนัท', price: 45, date: '2026-07-28',
    rating: 4.1, channel: 'ห้างสรรพสินค้า',
    description: 'โดนัทมัทฉะเกรด A จากอุจิ เคลือบไวท์ช็อกโกแลต',
    highlight: false
  },
  {
    brand: 'Farmhouse', brandId: 'farmhouse',
    name: 'ครัวซองต์เนยสดฝรั่งเศส',
    category: 'pastry', categoryLabel: 'เพสทรี', price: 55, date: '2026-07-25',
    rating: 3.9, channel: 'MT/CVS',
    description: 'ครัวซองต์เนยสดนำเข้าจากฝรั่งเศส แป้ง 72 ชั้น กรอบนุ่ม',
    highlight: false
  },
  {
    brand: 'Le Pain', brandId: 'lepain',
    name: 'ทาร์ตไข่พาสเจอไรซ์',
    category: 'pie', categoryLabel: 'พาย', price: 75, date: '2026-07-20',
    rating: 4.5, channel: 'ร้าน Le Pain',
    description: 'ทาร์ตไข่สูตรพรีเมียม ไข่พาสเจอไรซ์ แป้งกรอบบาง',
    highlight: false
  },
  {
    brand: 'S&P', brandId: 'snp',
    name: 'เค้กช็อกโกแลตลาวา',
    category: 'cake', categoryLabel: 'เค้ก', price: 185, date: '2026-07-15',
    rating: 4.4, channel: 'ทุกสาขา/Delivery',
    description: 'เค้กช็อกโกแลตลาวา เนื้อนุ่มชุ่มฉ่ำ ช็อกโกแลตไหลเยิ้ม',
    highlight: false
  },
  {
    brand: 'After You', brandId: 'afteryou',
    name: 'กากิโกริมะพร้าวอ่อน',
    category: 'cake', categoryLabel: 'ของหวาน', price: 259, date: '2026-07-10',
    rating: 4.6, channel: 'ร้าน After You',
    description: 'กากิโกริน้ำแข็งไส รสมะพร้าวอ่อน ท็อปปิ้งลอดช่อง',
    highlight: false
  },
  {
    brand: 'Farmhouse', brandId: 'farmhouse',
    name: 'ขนมปังไส้ทูน่าเกาหลี',
    category: 'bread', categoryLabel: 'ขนมปัง', price: 35, date: '2026-07-05',
    rating: 3.7, channel: '7-11/Lotus',
    description: 'ขนมปังไส้ทูน่าสไตล์เกาหลี ซอสคาร์โบนารา',
    highlight: false
  }
];

const BRAND_NEW_COUNT = [
  { brand: 'S&P',       brandId: 'snp',       count: 5 },
  { brand: 'After You', brandId: 'afteryou',  count: 4 },
  { brand: 'Yamazaki',  brandId: 'yamazaki',  count: 4 },
  { brand: 'Farmhouse', brandId: 'farmhouse', count: 3 },
  { brand: 'Le Pain',   brandId: 'lepain',    count: 3 },
  { brand: 'วรรณวนัช',  brandId: 'wanwanach', count: 3 }
];

/* ---------- CSS Injection ---------- */

function injectCSS() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .mnp-card {
      background: #fff;
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 14px;
      border: 1px solid rgba(0,0,0,0.06);
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      transition: box-shadow 0.2s, transform 0.15s;
    }
    .mnp-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateY(-1px);
    }
    .mnp-card-highlight {
      border-left: 4px solid #7b2ff7;
    }
    .mnp-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }
    .mnp-card-name {
      font-weight: 700;
      font-size: 1.05rem;
      color: #1a202c;
    }
    .mnp-card-price {
      font-weight: 700;
      font-size: 1.15rem;
      color: #7b2ff7;
      white-space: nowrap;
    }
    .mnp-card-desc {
      color: #4a5568;
      font-size: 0.85rem;
      line-height: 1.5;
      margin-bottom: 10px;
    }
    .mnp-card-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      font-size: 0.82rem;
    }
    .mnp-brand-badge {
      color: #fff;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .mnp-cat-badge {
      background: #e2e8f0;
      color: #4a5568;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
    }
    .mnp-rating {
      color: #f59e0b;
      font-weight: 600;
    }
    .mnp-channel {
      color: #718096;
    }
    .mnp-date {
      color: #a0aec0;
    }
    .mnp-new-tag {
      background: #dcfce7;
      color: #166534;
      padding: 2px 8px;
      border-radius: 8px;
      font-size: 0.7rem;
      font-weight: 700;
    }
  `;
  document.head.appendChild(style);
}

function removeCSS() {
  const el = document.getElementById(STYLE_ID);
  if (el) el.remove();
}

/* ---------- Helpers ---------- */

function fmtDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isRecent(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now - d) / (1000 * 60 * 60 * 24);
  return diff <= 7;
}

/* ---------- Render Content (filter-reactive) ---------- */

function renderContent(container, filters) {
  destroyAll();

  const contentEl = container.querySelector('.mon-newproduct-content');

  // กรองตาม competitor และ category
  const filteredByCompetitor = filterByCompetitor(NEW_PRODUCTS, filters, 'brandId');
  const filteredProducts = filterByCategory(filteredByCompetitor, filters);

  // กรอง brand count ตาม competitor
  const filteredBrandCount = filterByCompetitor(BRAND_NEW_COUNT, filters, 'brandId');

  // Vary ค่า count ตาม filter
  const variedBrandCount = filteredBrandCount.map((b, i) => ({
    ...b,
    count: varyValue(b.count, filters, { seed: 950 + i, asInt: true, min: 1 })
  }));

  // Product Cards
  const productCards = filteredProducts.map(p => {
    const highlightCls = p.highlight ? ' mnp-card-highlight' : '';
    const newTag = isRecent(p.date) ? '<span class="mnp-new-tag">NEW</span>' : '';
    const variedPrice = varyValue(p.price, filters, { seed: 960 + NEW_PRODUCTS.indexOf(p), asInt: true, min: 1 });

    return `
      <div class="mnp-card${highlightCls}">
        <div class="mnp-card-header">
          <div class="mnp-card-name">${p.name} ${newTag}</div>
          <div class="mnp-card-price">${variedPrice} บาท</div>
        </div>
        <div class="mnp-card-desc">${p.description}</div>
        <div class="mnp-card-meta">
          <span class="mnp-brand-badge" style="background:${BRAND_COLORS[p.brandId] || '#555'}">${p.brand}</span>
          <span class="mnp-cat-badge">${p.categoryLabel}</span>
          <span class="mnp-rating">&#11088; ${p.rating}</span>
          <span class="mnp-channel">\u{1F4CD} ${p.channel}</span>
          <span class="mnp-date">\u{1F4C5} ${fmtDate(p.date)}</span>
        </div>
      </div>`;
  }).join('');

  const emptyProducts = filteredProducts.length === 0
    ? '<p style="color:#a0aec0;text-align:center;padding:40px 0">ไม่พบสินค้าใหม่ในเงื่อนไขที่เลือก</p>'
    : '';

  // Table
  const tableRows = filteredProducts.map(p => {
    const variedPrice = varyValue(p.price, filters, { seed: 960 + NEW_PRODUCTS.indexOf(p), asInt: true, min: 1 });
    return `
    <tr>
      <td><span style="color:${BRAND_COLORS[p.brandId] || '#555'};font-weight:600">${p.brand}</span></td>
      <td>${p.name}</td>
      <td>${p.categoryLabel}</td>
      <td class="num">${variedPrice} ฿</td>
      <td class="num"><span class="mnp-rating">&#11088; ${p.rating}</span></td>
      <td>${p.channel}</td>
      <td class="num">${fmtDate(p.date)}</td>
    </tr>`;
  }).join('');

  contentEl.innerHTML = `
    <div class="chart-grid">
      <div class="chart-card">
        <h3 class="chart-card-title">สินค้าเปิดตัวใหม่ล่าสุด</h3>
        <div style="max-height:560px;overflow-y:auto;padding:4px">
          ${productCards || emptyProducts}
        </div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">จำนวนสินค้าใหม่ตามแบรนด์ (ไตรมาสนี้)</h3>
        <div class="chart-container"><canvas id="chart-newprod-brand"></canvas></div>
      </div>
    </div>
    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">ตารางสินค้าใหม่ทั้งหมด</h3>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>แบรนด์</th>
              <th>ชื่อสินค้า</th>
              <th>หมวดหมู่</th>
              <th class="num">ราคา</th>
              <th class="num">Rating</th>
              <th>ช่องทาง</th>
              <th class="num">วันเปิดตัว</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    </div>
  `;

  // --- Chart ---

  if (variedBrandCount.length > 0) {
    createChart('chart-newprod-brand', {
      type: 'bar',
      data: {
        labels: variedBrandCount.map(b => b.brand),
        datasets: [{
          label: 'สินค้าใหม่ (ไตรมาสนี้)',
          data: variedBrandCount.map(b => b.count),
          backgroundColor: variedBrandCount.map(b => BRAND_COLORS[b.brandId] || CHART_COLORS[0]),
          borderRadius: 6
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => `${ctx.parsed.y} รายการ` } }
        },
        scales: {
          x: { ticks: { color: '#4a5568' }, grid: { color: 'rgba(0,0,0,0.06)' } },
          y: {
            beginAtZero: true,
            ticks: { color: '#4a5568', stepSize: 1 },
            grid: { color: 'rgba(0,0,0,0.06)' }
          }
        }
      }
    });
  }
}

/* ---------- Tab lifecycle ---------- */

export async function mount(container) {
  const thisMount = ++mountId;
  injectCSS();

  container.innerHTML = `
    <div class="tab-content">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">กำลังโหลดข้อมูลสินค้าใหม่...</p>
      </div>
    </div>`;

  try {
    await Promise.resolve();
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">${buildFilterBar([PERIOD_FILTER, COMPETITOR_FILTER, CATEGORY_FILTER])}<div class="mon-newproduct-content"></div></div>`;

    function render(filters) { renderContent(container, filters); }

    render(getFilterValues(container));

    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('MonNewProduct mount error:', err);
    container.innerHTML = `
      <div class="tab-content">
        <div class="error-state">
          <p class="error-state-text">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        </div>
      </div>`;
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
  removeCSS();
}
