/**
 * cons-sentiment.js - Tab: วิเคราะห์ความรู้สึก (Sentiment Analysis)
 * REWRITE: เพิ่ม Top pain points + Top positive keywords จากรีวิว
 * แสดง donut sentiment, stacked bar by brand, pain points, positive keywords, ตารางรีวิว
 * ใช้ข้อมูลจาก /data/social.json (sentiment data)
 * รองรับ loading / empty / error states + race condition guard
 * Filter-reactive: เปลี่ยน filter แล้ว render ใหม่ทันที
 */

import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import { buildFilterBar, onFilterChange, getFilterValues, PERIOD_FILTER, PLATFORM_FILTER } from '../../shared/filter-builder.js';
import { varyValue, varyPercent, filterByPlatform } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

const STYLE_ID = 'style-cons-sentiment';

/* ---------- CSS ---------- */

const MODULE_CSS = `
.sentiment-keywords-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: var(--spacing-lg, 24px);
}
.sentiment-keyword-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.sentiment-keyword-card.pain-points { border-left: 4px solid #dc2626; }
.sentiment-keyword-card.positive-kw { border-left: 4px solid #16a34a; }
.sentiment-keyword-card h4 { font-size: 1rem; margin-bottom: 12px; }
.sentiment-keyword-card ul { list-style: none; padding: 0; margin: 0; }
.sentiment-keyword-card li {
  padding: 8px 0;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  font-size: 0.85rem;
  color: #4a5568;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sentiment-keyword-card li:last-child { border-bottom: none; }
.sentiment-keyword-card .kw-text { font-weight: 600; }
.sentiment-keyword-card .kw-count { font-size: 0.8rem; color: #718096; }
@media (max-width: 767px) {
  .sentiment-keywords-grid { grid-template-columns: 1fr; }
}
`;

/* ---------- Constants ---------- */

const SENTIMENT_COLORS = {
  positive: '#16a34a',
  neutral: '#718096',
  negative: '#dc2626'
};

const BRAND_LABELS = {
  cake: 'เค้ก',
  bread: 'ขนมปัง',
  croissant: 'ครัวซองต์',
  cookie: 'คุกกี้',
  donut: 'โดนัท',
  eggtart: 'ทาร์ตไข่'
};

// Pain points จากรีวิวลูกค้า (demo data)
const PAIN_POINTS = [
  { keyword: 'ไม่สด / ไม่ fresh', count: 342, trend: 'up' },
  { keyword: 'ราคาแพงเกินไป', count: 285, trend: 'stable' },
  { keyword: 'ส่งช้า / ส่งผิด', count: 198, trend: 'up' },
  { keyword: 'หวานเกินไป', count: 176, trend: 'stable' },
  { keyword: 'ขนาดเล็กลง', count: 145, trend: 'up' },
  { keyword: 'แพ็คเกจพัง', count: 112, trend: 'down' }
];

// Positive keywords จากรีวิวลูกค้า (demo data)
const POSITIVE_KEYWORDS = [
  { keyword: 'อร่อยมาก', count: 1245, trend: 'up' },
  { keyword: 'คุ้มค่า / คุ้มราคา', count: 892, trend: 'stable' },
  { keyword: 'สด / เพิ่งทำ', count: 756, trend: 'up' },
  { keyword: 'หน้าตาสวย', count: 634, trend: 'up' },
  { keyword: 'ซื้อซ้ำแน่นอน', count: 523, trend: 'stable' },
  { keyword: 'แนะนำเลย', count: 489, trend: 'up' }
];

// ข้อมูลรีวิวตัวอย่าง
const SAMPLE_REVIEWS = [
  { date: '2026-07-28', brand: 'วรรณวนัช', platform: 'Facebook', rating: 5, snippet: 'เค้กช็อกโกแลตลาวาอร่อยมาก หน้าตาสวย' },
  { date: '2026-07-27', brand: 'S&P', platform: 'Instagram', rating: 4, snippet: 'ชีสเค้กเนื้อนุ่มดี แต่หวานไปนิด' },
  { date: '2026-07-26', brand: 'After You', platform: 'TikTok', rating: 5, snippet: 'บราวนี่เข้มข้น คุ้มค่าราคา แนะนำเลย!' },
  { date: '2026-07-25', brand: 'ฟาร์มเฮ้าส์', platform: 'Pantip', rating: 4, snippet: 'ขนมปังโฮลวีทรสชาติดี เหมาะสำหรับคนรักสุขภาพ' },
  { date: '2026-07-24', brand: 'ยามาซากิ', platform: 'Facebook', rating: 3, snippet: 'โรลเค้กนมกลาง ๆ ไม่ได้โดดเด่นอะไรมาก' },
  { date: '2026-07-23', brand: 'เลอแปง', platform: 'Instagram', rating: 5, snippet: 'มาการองสวยงาม รสชาติหลากหลาย ประทับใจ' },
  { date: '2026-07-22', brand: 'วรรณวนัช', platform: 'TikTok', rating: 4, snippet: 'คุกกี้เนยสดกรอบนอกนุ่มใน ซื้อซ้ำแน่นอน' },
  { date: '2026-07-21', brand: 'S&P', platform: 'Facebook', rating: 2, snippet: 'ครัวซองต์แห้งไป ไม่เหมือนสูตรเดิม' },
  { date: '2026-07-20', brand: 'After You', platform: 'Instagram', rating: 5, snippet: 'โดนัทโมจินุ่มหนึบ อร่อยสุด ๆ' },
  { date: '2026-07-19', brand: 'ฟาร์มเฮ้าส์', platform: 'Pantip', rating: 3, snippet: 'โดนัทช็อกโกแลตรสชาติธรรมดา ราคาเหมาะสม' }
];

/* ---------- Chart Area HTML Template ---------- */

function chartAreaHTML() {
  return `
    <div class="chart-grid">
      <div class="chart-card">
        <h3 class="chart-card-title">สัดส่วน Sentiment</h3>
        <p class="chart-card-subtitle">ภาพรวมความรู้สึกทั้งหมด</p>
        <div class="chart-container chart-tall">
          <canvas id="chart-sent-donut"></canvas>
        </div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">Sentiment ตามหมวดสินค้า</h3>
        <p class="chart-card-subtitle">เปรียบเทียบ Positive / Neutral / Negative</p>
        <div class="chart-container chart-tall">
          <canvas id="chart-sent-brand"></canvas>
        </div>
      </div>
    </div>

    <div class="sentiment-keywords-grid">
      <div class="sentiment-keyword-card pain-points">
        <h4>&#128308; Top Pain Points จากรีวิว</h4>
        <ul id="pain-points-list"></ul>
      </div>
      <div class="sentiment-keyword-card positive-kw">
        <h4>&#128994; Top Positive Keywords จากรีวิว</h4>
        <ul id="positive-kw-list"></ul>
      </div>
    </div>

    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">รีวิวล่าสุด</h3>
      <p class="chart-card-subtitle">ตัวอย่างรีวิวจากแพลตฟอร์มต่าง ๆ</p>
      <div class="data-table-wrapper" id="sent-reviews-table"></div>
    </div>
  `;
}

/* ---------- Render Functions ---------- */

function renderSentimentDonut(sentimentData, filters) {
  const pos = varyPercent(sentimentData.positive || 62, filters, { seed: 100 });
  const neu = varyPercent(sentimentData.neutral || 25, filters, { seed: 101 });
  const neg = varyPercent(sentimentData.negative || 13, filters, { seed: 102 });

  const centerTextPlugin = {
    id: 'sentimentCenterText',
    afterDraw(chart) {
      const { ctx, chartArea } = chart;
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.font = "bold 28px 'Segoe UI', sans-serif";
      ctx.fillStyle = SENTIMENT_COLORS.positive;
      ctx.fillText(`${pos}%`, centerX, centerY - 10);

      ctx.font = "12px 'Segoe UI', sans-serif";
      ctx.fillStyle = '#999';
      ctx.fillText('Positive', centerX, centerY + 14);

      ctx.restore();
    }
  };

  createChart('chart-sent-donut', {
    type: 'doughnut',
    data: {
      labels: [`Positive ${pos}%`, `Neutral ${neu}%`, `Negative ${neg}%`],
      datasets: [{
        data: [pos, neu, neg],
        backgroundColor: [
          SENTIMENT_COLORS.positive,
          SENTIMENT_COLORS.neutral,
          SENTIMENT_COLORS.negative
        ],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#4a5568', padding: 12, usePointStyle: true }
        },
        tooltip: {
          callbacks: { label: ctx => ctx.label }
        }
      }
    },
    plugins: [centerTextPlugin]
  });
}

function renderSentimentByBrand(byBrand, filters) {
  const brandKeys = Object.keys(byBrand);
  const labels = brandKeys.map(k => BRAND_LABELS[k] || k);

  createChart('chart-sent-brand', {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Positive',
          data: brandKeys.map((k, i) => varyPercent(byBrand[k].positive, filters, { seed: 200 + i })),
          backgroundColor: SENTIMENT_COLORS.positive + 'CC',
          borderColor: SENTIMENT_COLORS.positive,
          borderWidth: 1
        },
        {
          label: 'Neutral',
          data: brandKeys.map((k, i) => varyPercent(byBrand[k].neutral, filters, { seed: 210 + i })),
          backgroundColor: SENTIMENT_COLORS.neutral + 'CC',
          borderColor: SENTIMENT_COLORS.neutral,
          borderWidth: 1
        },
        {
          label: 'Negative',
          data: brandKeys.map((k, i) => varyPercent(byBrand[k].negative, filters, { seed: 220 + i })),
          backgroundColor: SENTIMENT_COLORS.negative + 'CC',
          borderColor: SENTIMENT_COLORS.negative,
          borderWidth: 1
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#4a5568', usePointStyle: true, padding: 12 }
        },
        tooltip: {
          callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}%` }
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
          max: 100,
          ticks: { color: '#4a5568', callback: v => `${v}%` },
          grid: { color: 'rgba(0,0,0,0.06)' }
        }
      }
    }
  });
}

/** Pain Points + Positive Keywords lists */
function renderKeywordLists(filters) {
  const ppEl = document.getElementById('pain-points-list');
  const pkEl = document.getElementById('positive-kw-list');

  const trendArrow = (trend) => {
    if (trend === 'up') return '<span style="color:#dc2626">&#9650;</span>';
    if (trend === 'down') return '<span style="color:#16a34a">&#9660;</span>';
    return '<span style="color:#718096">&#9654;</span>';
  };

  const trendArrowPositive = (trend) => {
    if (trend === 'up') return '<span style="color:#16a34a">&#9650;</span>';
    if (trend === 'down') return '<span style="color:#dc2626">&#9660;</span>';
    return '<span style="color:#718096">&#9654;</span>';
  };

  if (ppEl) {
    ppEl.innerHTML = PAIN_POINTS.map((p, i) => {
      const variedCount = varyValue(p.count, filters, { seed: 300 + i, asInt: true, min: 0 });
      return `
      <li>
        <span class="kw-text">${trendArrow(p.trend)} ${p.keyword}</span>
        <span class="kw-count">${variedCount} mentions</span>
      </li>
    `;}).join('');
  }

  if (pkEl) {
    pkEl.innerHTML = POSITIVE_KEYWORDS.map((p, i) => {
      const variedCount = varyValue(p.count, filters, { seed: 400 + i, asInt: true, min: 0 });
      return `
      <li>
        <span class="kw-text">${trendArrowPositive(p.trend)} ${p.keyword}</span>
        <span class="kw-count">${variedCount} mentions</span>
      </li>
    `;}).join('');
  }
}

function renderReviewsTable(filters) {
  const tableEl = document.getElementById('sent-reviews-table');
  if (!tableEl) return;

  const stars = (rating) => {
    const full = '&#9733;'.repeat(rating);
    const empty = '&#9734;'.repeat(5 - rating);
    const color = rating >= 4 ? '#f39c12' : (rating >= 3 ? '#718096' : '#e74c3c');
    return `<span style="color:${color}">${full}${empty}</span>`;
  };

  // กรองรีวิวตาม platform filter ถ้าเลือก
  const platformFilter = filters.platform;
  const reviews = (!platformFilter || platformFilter === 'all')
    ? SAMPLE_REVIEWS
    : SAMPLE_REVIEWS.filter(r => r.platform.toLowerCase() === platformFilter);

  if (reviews.length === 0) {
    tableEl.innerHTML = '<p style="color:#718096;text-align:center;padding:16px">ไม่พบรีวิวในแพลตฟอร์มที่เลือก</p>';
    return;
  }

  const rows = reviews.map(r => `
    <tr>
      <td style="white-space:nowrap">${r.date}</td>
      <td>${r.brand}</td>
      <td>${r.platform}</td>
      <td>${stars(r.rating)}</td>
      <td>${r.snippet}</td>
    </tr>
  `).join('');

  tableEl.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>วันที่</th>
          <th>แบรนด์</th>
          <th>แพลตฟอร์ม</th>
          <th>Rating</th>
          <th>เนื้อหา</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

/* ---------- CSS Injection ---------- */

function injectCSS() {
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = MODULE_CSS;
    document.head.appendChild(style);
  }
}

function removeCSS() {
  const el = document.getElementById(STYLE_ID);
  if (el) el.remove();
}

/* ---------- renderContent: เรนเดอร์เนื้อหาตาม filter ---------- */

function renderContent(container, sentiment, filters) {
  destroyAll();

  const contentEl = container.querySelector('.cons-sentiment-content');
  if (!contentEl) return;

  if (!sentiment) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-text">ไม่พบข้อมูล Sentiment</p>
      </div>
    `;
    return;
  }

  contentEl.innerHTML = chartAreaHTML();

  const overallSentiment = {
    positive: 62,
    neutral: 25,
    negative: 13
  };

  renderSentimentDonut(overallSentiment, filters);
  renderSentimentByBrand(sentiment.byBrand, filters);
  renderKeywordLists(filters);
  renderReviewsTable(filters);
}

/* ---------- Tab lifecycle ---------- */

export async function mount(container) {
  const thisMount = ++mountId;
  injectCSS();

  container.innerHTML = `
    <div class="tab-content">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  `;

  try {
    const data = await fetchJSON('/data/social.json');
    if (thisMount !== mountId) return;

    const { sentiment } = data;

    container.innerHTML = `
      <div class="tab-content">
        ${buildFilterBar([PERIOD_FILTER, PLATFORM_FILTER])}
        <div class="cons-sentiment-content"></div>
      </div>
    `;

    function render(filters) { renderContent(container, sentiment, filters); }

    render(getFilterValues(container));

    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('ConsSentiment mount error:', err);
    container.innerHTML = `
      <div class="tab-content">
        <div class="error-state">
          <p class="error-state-text">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        </div>
      </div>
    `;
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
  removeCSS();
}
