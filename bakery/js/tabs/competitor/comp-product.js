/**
 * comp-product.js - Sub-tab: เปรียบเทียบสินค้าคู่แข่ง (Redesigned)
 * Detailed SKU Comparison Table (main) + SKU Count Bar + Category Mix Stacked Bar
 * + Product Rating Radar + AI Analysis Box
 * ข้อมูลจาก competitors.json + enriched mock data
 * รองรับ reactive filters (category, competitor)
 */
import { createChart, destroyAll, BRAND_COLORS, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import { buildFilterBar, getFilterValues, onFilterChange, CATEGORY_FILTER, COMPETITOR_FILTER } from '../../shared/filter-builder.js';
import { varyValue, varyPercent, filterByCompetitor } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

const STYLE_ID = 'comp-product-style';

/* ---------- Mock Data ---------- */

// ข้อมูลเปรียบเทียบ SKU แบบละเอียด (transposed table)
const SKU_COMPARISON = {
  attributes: ['ราคา', 'น้ำหนัก', 'รสชาติ', 'Promotion', 'ช่องทาง', 'Rating'],
  brands: [
    { id: 'wanwanach', name: 'เรา',        logo: '&#129473;' },
    { id: 'snp',       name: 'S&P',        logo: '&#127874;' },
    { id: 'afteryou',  name: 'After You',  logo: '&#127851;' },
    { id: 'farmhouse', name: 'ฟาร์มเฮ้าส์', logo: '&#127838;' }
  ],
  data: {
    'ราคา':      ['฿55',    '฿75',    '฿205',           '฿32'],
    'น้ำหนัก':   ['80g',    '75g',    '120g',           '70g'],
    'รสชาติ':    ['&#11088;&#11088;&#11088;&#11088;', '&#11088;&#11088;&#11088;&#11088;', '&#11088;&#11088;&#11088;&#11088;&#11088;', '&#11088;&#11088;&#11088;'],
    'Promotion': ['&#10003;', '&#10003;', '&#10007;', '&#10003;'],
    'ช่องทาง':   ['CJ/Online', 'ร้าน/MT', 'ร้าน',    'MT/CVS'],
    'Rating':    ['4.2',    '4.0',    '4.8',            '3.5']
  }
};

// หมวดหมู่สินค้า
const CATEGORY_DATA = {
  categories: ['เค้ก', 'ขนมปัง', 'คุกกี้', 'ครัวซองต์', 'โดนัท', 'อื่น ๆ'],
  breakdown: {
    wanwanach: [8, 10, 5, 6, 4, 7],
    snp:       [25, 15, 20, 8, 5, 12],
    afteryou:  [18, 2, 3, 4, 0, 8],
    farmhouse: [3, 55, 5, 8, 2, 27],
    yamazaki:  [10, 20, 5, 15, 8, 12],
    breadtalk: [12, 18, 4, 10, 6, 10]
  }
};

// Rating ตามหมวดหมู่ (สำหรับ radar chart)
const CATEGORY_RATINGS = {
  categories: ['เค้ก', 'ขนมปัง', 'คุกกี้', 'ครัวซองต์', 'โดนัท'],
  ratings: {
    wanwanach: [4.2, 4.0, 4.1, 4.0, 3.8],
    snp:       [4.3, 3.8, 4.2, 3.7, 3.5],
    afteryou:  [4.8, 3.2, 4.5, 4.3, 0],
    farmhouse: [3.0, 4.5, 3.2, 3.0, 3.5],
    yamazaki:  [3.8, 4.2, 3.5, 4.0, 3.6],
    breadtalk: [4.0, 4.0, 3.8, 4.4, 3.9]
  }
};

/* ---------- CSS Injection ---------- */

function injectCSS() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .cprod-sku-table-wrap {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .cprod-sku-table {
      width: 100%;
      border-collapse: collapse;
    }
    .cprod-sku-table th,
    .cprod-sku-table td {
      padding: 10px 14px;
      text-align: center;
      border-bottom: 1px solid rgba(0,0,0,0.06);
      font-size: 0.9rem;
    }
    .cprod-sku-table th {
      background: #f7fafc;
      font-weight: 600;
      color: #4a5568;
      position: sticky;
      top: 0;
    }
    .cprod-sku-table td:first-child {
      text-align: left;
      font-weight: 600;
      color: #2d3748;
      white-space: nowrap;
    }
    .cprod-sku-table tr:hover td {
      background: #f0f4ff;
    }
    .cprod-promo-yes { color: #16a34a; font-weight: 700; font-size: 1.1rem; }
    .cprod-promo-no  { color: #dc2626; font-weight: 700; font-size: 1.1rem; }
    .cprod-ai-box {
      background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
      border: 1px solid #c4b5fd;
      border-radius: 12px;
      padding: 20px;
      margin-top: 20px;
    }
    .cprod-ai-box h3 {
      color: #5b21b6;
      font-size: 1rem;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cprod-ai-box p {
      color: #4c1d95;
      font-size: 0.9rem;
      line-height: 1.6;
      margin: 0;
    }
  `;
  document.head.appendChild(style);
}

function removeCSS() {
  const el = document.getElementById(STYLE_ID);
  if (el) el.remove();
}

/* ---------- Helpers ---------- */

function fmt(n) { return Number(n).toLocaleString('th-TH'); }

/* ---------- renderContent (reactive) ---------- */

function renderContent(container, data, filters) {
  destroyAll();

  const contentEl = container.querySelector('.comp-product-content');
  if (!contentEl) return;

  const allBrands = data.brands;
  if (!allBrands || allBrands.length === 0) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-text">ไม่พบข้อมูลสินค้าคู่แข่ง</p>
      </div>`;
    return;
  }

  const brands = filterByCompetitor(allBrands, filters, 'id');
  if (brands.length === 0) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-text">ไม่พบข้อมูลสินค้าในเงื่อนไขที่เลือก</p>
      </div>`;
    return;
  }

  const f = filters;

  // --- Chart area HTML ---
  contentEl.innerHTML = `
    <div class="chart-card" style="margin-bottom:var(--spacing-lg)">
      <h3 class="chart-card-title">เปรียบเทียบสินค้าแบบละเอียด (SKU Comparison)</h3>
      <div id="comp-sku-comparison"></div>
    </div>
    <div class="chart-grid">
      <div class="chart-card">
        <h3 class="chart-card-title">จำนวน SKU แต่ละแบรนด์</h3>
        <div class="chart-container"><canvas id="chart-sku-count"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">สัดส่วนหมวดหมู่สินค้า (Category Mix)</h3>
        <div class="chart-container chart-tall"><canvas id="chart-category-mix"></canvas></div>
      </div>
      <div class="chart-card full-width">
        <h3 class="chart-card-title">คะแนนรีวิวตามหมวดหมู่สินค้า (Product Rating)</h3>
        <div class="chart-container chart-tall"><canvas id="chart-product-radar"></canvas></div>
      </div>
    </div>
    <div id="comp-ai-analysis"></div>
  `;

  // --- SKU Comparison Table (transposed: attributes as rows) ---
  const skuEl = document.getElementById('comp-sku-comparison');
  if (skuEl) {
    // กรอง brands ใน SKU_COMPARISON ตาม competitor filter
    let skuBrands = SKU_COMPARISON.brands;
    if (f.competitor && f.competitor !== 'all') {
      skuBrands = SKU_COMPARISON.brands.filter(b => b.id === f.competitor);
    }

    const brandHeaders = skuBrands.map(b =>
      `<th>${b.logo} ${b.name}</th>`
    ).join('');

    const rows = SKU_COMPARISON.attributes.map(attr => {
      const allValues = SKU_COMPARISON.data[attr];
      const cells = skuBrands.map(sb => {
        const origIdx = SKU_COMPARISON.brands.findIndex(b => b.id === sb.id);
        const val = allValues[origIdx];
        let cls = '';
        if (attr === 'Promotion') {
          cls = val === '&#10003;' ? 'cprod-promo-yes' : 'cprod-promo-no';
        }
        return `<td class="${cls}">${val}</td>`;
      }).join('');
      return `<tr><td>${attr}</td>${cells}</tr>`;
    }).join('');

    skuEl.innerHTML = `
      <div class="cprod-sku-table-wrap">
        <table class="cprod-sku-table">
          <thead><tr><th>รายการ</th>${brandHeaders}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  // --- SKU Count Bar ---
  const skuCountData = brands.map((b, i) => varyValue(b.products, f, { seed: 100 + i, asInt: true, min: 1 }));

  createChart('chart-sku-count', {
    type: 'bar',
    data: {
      labels: brands.map(b => b.name),
      datasets: [{
        label: 'จำนวน SKU',
        data: skuCountData,
        backgroundColor: brands.map(b => BRAND_COLORS[b.id]),
        borderColor: brands.map(b => BRAND_COLORS[b.id]),
        borderWidth: 1,
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
          ticks: { color: '#4a5568', stepSize: 10 },
          grid: { color: 'rgba(0,0,0,0.06)' }
        }
      }
    }
  });

  // --- Category Mix (stacked bar) ---
  const categoryColors = ['#e74c3c', '#3498db', '#f39c12', '#2ecc71', '#9b59b6', '#1abc9c'];

  const mixDatasets = CATEGORY_DATA.categories.map((cat, idx) => ({
    label: cat,
    data: brands.map((b, bIdx) => {
      const breakdown = CATEGORY_DATA.breakdown[b.id];
      const base = breakdown ? breakdown[idx] : 0;
      return varyValue(base, f, { seed: 200 + idx * 10 + bIdx, asInt: true, min: 0 });
    }),
    backgroundColor: categoryColors[idx],
    borderColor: categoryColors[idx],
    borderWidth: 1,
    borderRadius: 2
  }));

  createChart('chart-category-mix', {
    type: 'bar',
    data: {
      labels: brands.map(b => b.name),
      datasets: mixDatasets
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#4a5568', usePointStyle: true, padding: 10, font: { size: 11 } }
        },
        tooltip: {
          callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y} รายการ` }
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: '#4a5568' },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: { color: '#4a5568' },
          grid: { color: 'rgba(0,0,0,0.06)' }
        }
      }
    }
  });

  // --- Product Rating Radar (per category) ---
  const allBrandIds = ['wanwanach', 'snp', 'afteryou', 'farmhouse', 'yamazaki', 'breadtalk'];
  const brandNames = { wanwanach: 'วรรณวนัช', snp: 'S&P', afteryou: 'After You', farmhouse: 'ฟาร์มเฮ้าส์', yamazaki: 'ยามาซากิ', breadtalk: 'BreadTalk' };

  // กรองแบรนด์ตาม competitor filter
  let radarBrandIds = allBrandIds;
  if (f.competitor && f.competitor !== 'all') {
    radarBrandIds = allBrandIds.filter(id => id === f.competitor);
  }

  const radarDatasets = radarBrandIds.map((id, bIdx) => ({
    label: brandNames[id],
    data: CATEGORY_RATINGS.ratings[id].map((r, rIdx) => varyPercent(r, f, { seed: 300 + bIdx * 10 + rIdx })),
    borderColor: BRAND_COLORS[id],
    backgroundColor: BRAND_COLORS[id] + '20',
    pointBackgroundColor: BRAND_COLORS[id],
    pointRadius: 3,
    borderWidth: 2
  }));

  createChart('chart-product-radar', {
    type: 'radar',
    data: {
      labels: CATEGORY_RATINGS.categories,
      datasets: radarDatasets
    },
    options: {
      scales: {
        r: {
          min: 2,
          max: 5,
          ticks: { stepSize: 0.5, color: '#718096', backdropColor: 'transparent' },
          grid: { color: 'rgba(0,0,0,0.08)' },
          pointLabels: { color: '#4a5568', font: { size: 13 } },
          angleLines: { color: 'rgba(0,0,0,0.08)' }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#4a5568', usePointStyle: true, padding: 12 }
        }
      }
    }
  });

  // --- AI Analysis Box ---
  const aiEl = document.getElementById('comp-ai-analysis');
  if (aiEl) {
    aiEl.innerHTML = `
      <div class="cprod-ai-box">
        <h3>&#129302; AI วิเคราะห์</h3>
        <p>
          สินค้าของวรรณวนัชมีราคาแข่งขันได้ดีในกลุ่ม Bread/Sandwich โดยเฉพาะเมื่อเทียบกับ S&P และเลอแปง
          แต่ยังขาด SKU ในกลุ่ม Premium Cake ที่ After You ครองตลาดด้วย Rating 4.8
          แนะนำให้เพิ่มสินค้ากลุ่ม Specialty Cake ราคา 120-180 บาท เพื่อเจาะตลาดกลาง
          นอกจากนี้ ควรขยายช่องทาง MT/CVS เพิ่มเติม เนื่องจากฟาร์มเฮ้าส์ครองตลาดนี้ด้วย 120 SKU
        </p>
      </div>`;
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
        <p class="loading-text">กำลังโหลดข้อมูลสินค้า...</p>
      </div>
    </div>`;

  try {
    const data = await fetchJSON('/data/competitors.json');
    if (thisMount !== mountId) return;

    container.innerHTML = `
      <div class="tab-content">
        ${buildFilterBar([CATEGORY_FILTER, COMPETITOR_FILTER])}
        <div class="comp-product-content"></div>
      </div>`;

    function render(filters) { renderContent(container, data, filters); }
    render(getFilterValues(container));
    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('Competitors Product mount error:', err);
    container.innerHTML = `
      <div class="tab-content">
        <div class="error-state">
          <p class="error-state-text">เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า</p>
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
