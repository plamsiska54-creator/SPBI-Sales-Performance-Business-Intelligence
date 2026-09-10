import { createChart, destroyAll, BRAND_COLORS, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import { buildFilterBar, onFilterChange, getFilterValues, YEAR_FILTER, MONTH_FILTER, CHANNEL_FILTER, REGION_FILTER } from '../../shared/filter-builder.js';
import { varyValue, varyPercent, varyArray, getMonthSlice, getAllFactors } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

const STYLE_ID = 'style-executive';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .exec-kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .exec-kpi-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      border-left: 4px solid #7c4dff;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .exec-kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.10);
    }
    .exec-kpi-card:nth-child(1) { border-left-color: #16a34a; }
    .exec-kpi-card:nth-child(2) { border-left-color: #7c4dff; }
    .exec-kpi-card:nth-child(3) { border-left-color: #2979ff; }
    .exec-kpi-card:nth-child(4) { border-left-color: #00bfa5; }
    .exec-kpi-card:nth-child(5) { border-left-color: #ff4081; }
    .exec-kpi-card:nth-child(6) { border-left-color: #f59e0b; }
    .exec-kpi-card:nth-child(7) { border-left-color: #e91e63; }
    .exec-kpi-card:nth-child(8) { border-left-color: #9b59b6; }
    .exec-kpi-icon { font-size: 1.5rem; margin-bottom: 4px; }
    .exec-kpi-label { font-size: 0.85rem; color: #718096; margin-bottom: 4px; }
    .exec-kpi-value { font-size: 1.8rem; font-weight: 700; color: #1a202c; }
    .exec-kpi-change { font-size: 0.8rem; font-weight: 600; margin-top: 4px; display: inline-block; padding: 2px 8px; border-radius: 12px; }
    .exec-kpi-change.positive { color: #16a34a; background: rgba(22,163,74,0.08); }
    .exec-kpi-change.negative { color: #dc2626; background: rgba(220,38,38,0.08); }
    .exec-kpi-change.neutral { color: #718096; background: rgba(113,128,150,0.08); }
    .ai-insight-box {
      background: #fff;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      border: 2px solid transparent;
      background-image: linear-gradient(#fff, #fff), linear-gradient(135deg, #ff4081, #7c4dff);
      background-origin: border-box;
      background-clip: padding-box, border-box;
      margin-top: 24px;
    }
    .ai-insight-box h3 { font-size: 1.1rem; margin-bottom: 16px; color: #1a202c; }
    .insight-item { padding: 12px 16px; border-radius: 10px; margin-bottom: 8px; }
    .insight-item:last-child { margin-bottom: 0; }
    .insight-item.alert { background: rgba(255,64,129,0.06); }
    .insight-item.warning { background: rgba(245,158,11,0.06); }
    .insight-item.opportunity { background: rgba(124,77,255,0.06); }
    .insight-badge { font-weight: 600; font-size: 0.85rem; }
    .insight-item p { margin-top: 4px; font-size: 0.9rem; color: #4a5568; line-height: 1.5; }
    @media (max-width: 1199px) { .exec-kpi-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .exec-kpi-grid { grid-template-columns: 1fr; } }
  `;
  document.head.appendChild(style);
}

function removeStyles() {
  const el = document.getElementById(STYLE_ID);
  if (el) el.remove();
}

function renderContent(container, brands, products, filters) {
  destroyAll();

  const f = filters;
  const risingCount = products.filter(p => p.trend === 'up').length;
  const decliningCount = products.filter(p => p.trend === 'down').length;

  const marketGrowth = varyPercent(8.2, f, { seed: 1 });
  const marketVal = varyValue(12.5, f, { seed: 2 });
  const ourShare = varyPercent(10.0, f, { seed: 3 });
  const shareChange = varyPercent(1.2, f, { seed: 4 });
  const donutGrowth = varyPercent(22, f, { seed: 5 });

  const kpis = [
    { icon: '\u{1F4C8}', label: 'การเติบโตของตลาด', value: `+${marketGrowth}%`, change: 'YoY', cls: 'positive' },
    { icon: '\u{1F4B0}', label: 'มูลค่าตลาดเบเกอรี่', value: `฿${marketVal}B`, change: 'พันล้านบาท', cls: 'neutral' },
    { icon: '\u{1F3C6}', label: 'Market Leader', value: 'S&P', change: '28% share', cls: 'positive' },
    { icon: '\u{1F4CA}', label: 'Market Share วรรณวนัช', value: `${ourShare}%`, change: `+${shareChange}pp`, cls: 'positive' },
    { icon: '\u{1F525}', label: 'เทรนด์กำลังเติบโต', value: `${risingCount}`, change: 'Rising Trends', cls: 'positive' },
    { icon: '⚠️', label: 'เทรนด์กำลังลดลง', value: `${decliningCount}`, change: 'Declining Trends', cls: 'negative' },
    { icon: '\u{1F195}', label: 'Hot Category', value: 'โดนัท', change: `+${donutGrowth}%`, cls: 'positive' },
    { icon: '\u{1F4A1}', label: 'AI Opportunity', value: '3', change: 'โอกาสใหม่', cls: 'neutral' },
  ];

  const kpiHTML = kpis.map(k => `
    <div class="exec-kpi-card">
      <div class="exec-kpi-icon">${k.icon}</div>
      <div class="exec-kpi-label">${k.label}</div>
      <div class="exec-kpi-value">${k.value}</div>
      <div class="exec-kpi-change ${k.cls}">${k.change}</div>
    </div>
  `).join('');

  const contentEl = container.querySelector('.exec-content');
  contentEl.innerHTML = `
    <div class="exec-kpi-grid">${kpiHTML}</div>
    <div class="chart-grid">
      <div class="chart-card">
        <h3 class="chart-card-title">ส่วนแบ่งตลาดเบเกอรี่</h3>
        <div class="chart-container chart-tall"><canvas id="chart-exec-share"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">มูลค่าตลาดรายเดือน (พันล้านบาท)</h3>
        <div class="chart-container"><canvas id="chart-exec-trend"></canvas></div>
      </div>
    </div>
    <div class="chart-grid">
      <div class="chart-card">
        <h3 class="chart-card-title">อัตราการเติบโตรายหมวดสินค้า (%)</h3>
        <div class="chart-container chart-tall"><canvas id="chart-exec-category"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">ยอดขายตาม Channel</h3>
        <div class="chart-container chart-tall"><canvas id="chart-exec-channel"></canvas></div>
      </div>
    </div>
    <div class="ai-insight-box">
      <h3>\u{1F916} AI Market Analyst</h3>
      <div class="insight-item alert">
        <span class="insight-badge">\u{1F525} Trend Alert</span>
        <p>ตลาด Sandwich เติบโต +${varyPercent(15.5, f, {seed:10})}% แต่ยอดขายบริษัทเติบโตเพียง +4% — ควรเพิ่มสัดส่วนสินค้าในหมวดนี้</p>
      </div>
      <div class="insight-item warning">
        <span class="insight-badge">⚠️ Competitor Alert</span>
        <p>S&P ลดราคาเฉลี่ย ${varyPercent(8, f, {seed:11})}% ใน Channel Modern Trade อาจกระทบ market share</p>
      </div>
      <div class="insight-item opportunity">
        <span class="insight-badge">\u{1F4A1} Opportunity</span>
        <p>แนะนำทดลอง Promotion โดนัท + เครื่องดื่ม ในพื้นที่กรุงเทพ — โดนัทเติบโต +${donutGrowth}% และมี margin สูง</p>
      </div>
      <div class="insight-item opportunity">
        <span class="insight-badge">\u{1F4A1} Opportunity</span>
        <p>คำค้น "เบเกอรี่โฮมเมด" เพิ่มขึ้น +${varyPercent(42.8, f, {seed:12})}% — ควรเน้นสื่อสารจุดแข็งวัตถุดิบพรีเมียมและความสดใหม่</p>
      </div>
      <div class="insight-item alert">
        <span class="insight-badge">\u{1F525} Trend Alert</span>
        <p>คำค้น "bakery delivery" พุ่ง +${varyPercent(35.4, f, {seed:13})}% — ช่องทางออนไลน์ยังมี room to grow</p>
      </div>
    </div>
  `;

  // Charts
  const shareData = brands.map(b => varyValue(b.marketShare, f, { seed: b.id ? b.id.length : 0 }));
  const totalShare = shareData.reduce((s, v) => s + v, 0);
  const othersShare = Math.max(0, +(100 - totalShare).toFixed(1));

  createChart('chart-exec-share', {
    type: 'doughnut',
    data: {
      labels: [...brands.map(b => b.name), 'อื่น ๆ'],
      datasets: [{
        data: [...shareData, othersShare],
        backgroundColor: [...brands.map(b => BRAND_COLORS[b.id] || CHART_COLORS[0]), '#999999'],
        borderColor: '#ffffff', borderWidth: 2
      }]
    },
    options: {
      cutout: '55%',
      plugins: {
        legend: { position: 'bottom', labels: { color: '#4a5568', padding: 10, usePointStyle: true } },
        tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed}%` } }
      }
    }
  });

  const allLabels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const allData = varyArray([9.8, 10.2, 10.5, 10.8, 11.2, 11.5, 11.8, 12.0, 12.2, 12.3, 12.4, 12.5], f, { startSeed: 20 });
  const sliced = getMonthSlice(allLabels, allData, f);

  createChart('chart-exec-trend', {
    type: 'line',
    data: {
      labels: sliced.labels,
      datasets: [{
        label: 'มูลค่าตลาด (พันล้านบาท)', data: sliced.data,
        borderColor: '#7c4dff', backgroundColor: 'rgba(124,77,255,0.1)',
        fill: true, tension: 0.3, pointRadius: 4, pointHoverRadius: 7,
        pointBackgroundColor: '#7c4dff', borderWidth: 2.5
      }]
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.parsed.y.toFixed(1)} พันล้านบาท` } } },
      scales: {
        x: { ticks: { color: '#4a5568' }, grid: { color: 'rgba(0,0,0,0.06)' } },
        y: { beginAtZero: false, ticks: { color: '#4a5568', callback: v => v.toFixed(1) + 'B' }, grid: { color: 'rgba(0,0,0,0.06)' } }
      }
    }
  });

  const catGrowth = varyArray([22, 15, 12, 8, 6, 4], f, { startSeed: 30 });
  const barColors = catGrowth.map(g => g >= 20 ? '#16a34a' : g >= 10 ? '#7c4dff' : g >= 7 ? '#2979ff' : '#94a3b8');

  createChart('chart-exec-category', {
    type: 'bar',
    data: {
      labels: ['โดนัท', 'คุกกี้', 'เค้ก', 'ขนมปัง', 'เพสทรี', 'พาย'],
      datasets: [{ label: 'Growth %', data: catGrowth, backgroundColor: barColors, borderColor: barColors, borderWidth: 1, borderRadius: 6 }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `เติบโต +${ctx.parsed.x}%` } } },
      scales: {
        x: { beginAtZero: true, ticks: { color: '#4a5568', callback: v => '+' + v + '%' }, grid: { color: 'rgba(0,0,0,0.06)' } },
        y: { ticks: { color: '#4a5568' }, grid: { display: false } }
      }
    }
  });

  const channelRev = varyArray([4.2, 3.1, 2.8, 1.6, 0.8], f, { startSeed: 40 });
  const chColors = ['#7c4dff', '#ff4081', '#2979ff', '#00bfa5', '#f59e0b'];

  createChart('chart-exec-channel', {
    type: 'bar',
    data: {
      labels: ['ร้านสาขา', 'ออนไลน์', 'ซูเปอร์มาร์เก็ต', 'สะดวกซื้อ', 'ตลาดนัด'],
      datasets: [{ label: 'รายได้ (พันล้านบาท)', data: channelRev, backgroundColor: chColors.map(c => c + 'CC'), borderColor: chColors, borderWidth: 1, borderRadius: 6 }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.parsed.y.toFixed(1)} พันล้านบาท` } } },
      scales: {
        x: { ticks: { color: '#4a5568' }, grid: { color: 'rgba(0,0,0,0.06)' } },
        y: { beginAtZero: true, ticks: { color: '#4a5568', callback: v => v.toFixed(1) + 'B' }, grid: { color: 'rgba(0,0,0,0.06)' } }
      }
    }
  });
}

export async function mount(container) {
  const thisMount = ++mountId;
  injectStyles();

  container.innerHTML = `<div class="tab-content"><div class="loading-container"><div class="loading-spinner"></div><p class="loading-text">กำลังโหลดข้อมูล...</p></div></div>`;

  try {
    const [compData, trendsData] = await Promise.all([
      fetchJSON('/data/competitors.json'),
      fetchJSON('/data/trends.json'),
    ]);
    if (thisMount !== mountId) return;

    const { brands } = compData;
    const products = trendsData.topProducts || [];
    if (!brands || brands.length === 0) {
      container.innerHTML = `<div class="tab-content"><div class="empty-state"><p class="empty-state-text">ไม่พบข้อมูลคู่แข่ง</p></div></div>`;
      return;
    }

    container.innerHTML = `<div class="tab-content">${buildFilterBar([YEAR_FILTER, MONTH_FILTER, CHANNEL_FILTER, REGION_FILTER])}<div class="exec-content"></div></div>`;

    function render(filters) { renderContent(container, brands, products, filters); }

    render(getFilterValues(container));

    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('Executive mount error:', err);
    container.innerHTML = `<div class="tab-content"><div class="error-state"><p class="error-state-text">เกิดข้อผิดพลาดในการโหลดข้อมูล</p></div></div>`;
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
  removeStyles();
}
