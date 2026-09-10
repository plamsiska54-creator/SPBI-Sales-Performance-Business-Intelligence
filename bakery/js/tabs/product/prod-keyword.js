/**
 * prod-keyword.js - Tab: วิเคราะห์คีย์เวิร์ด (Keyword & Search Analysis)
 * ENHANCE: เพิ่ม trending keywords badges + ตาราง category breakdown
 * แสดง chart คีย์เวิร์ดยอดนิยม, keyword cloud, ตาราง search volume
 * ใช้ข้อมูลจาก /data/trends.json (trending_keywords / keywords)
 * รองรับ loading / empty / error states + race condition guard
 * Filter-reactive: เปลี่ยน filter แล้ว render ใหม่ทันที
 */

import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import { buildFilterBar, onFilterChange, getFilterValues, PERIOD_FILTER, PLATFORM_FILTER } from '../../shared/filter-builder.js';
import { varyValue, varyPercent, filterByPlatform } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

/* ---------- Helpers ---------- */

function fmt(n) { return Number(n).toLocaleString('th-TH'); }

function trendIcon(trend) {
  if (trend === 'up') return '&#9650;';
  if (trend === 'down') return '&#9660;';
  return '&#9654;';
}

function guessCategory(keyword) {
  const kw = keyword.toLowerCase();
  if (kw.includes('เค้ก') || kw.includes('cake') || kw.includes('เค้กโรล')) return 'เค้ก';
  if (kw.includes('ขนมปัง') || kw.includes('bread') || kw.includes('sourdough')) return 'ขนมปัง';
  if (kw.includes('คุกกี้') || kw.includes('cookie') || kw.includes('บราวนี่') || kw.includes('มาการอง')) return 'คุกกี้/บิสกิต';
  if (kw.includes('ครัวซองต์') || kw.includes('croissant') || kw.includes('เดนิช') || kw.includes('เอแคลร์') || kw.includes('สโกน')) return 'ครัวซองต์/เพสทรี';
  if (kw.includes('โดนัท') || kw.includes('donut')) return 'โดนัท';
  if (kw.includes('ทาร์ต') || kw.includes('พาย') || kw.includes('tart') || kw.includes('pie')) return 'พาย/ทาร์ต';
  if (kw.includes('วาฟเฟิล') || kw.includes('waffle') || kw.includes('แพนเค้ก') || kw.includes('ชูครีม')) return 'อื่น ๆ';
  if (kw.includes('เบเกอรี่') || kw.includes('bakery') || kw.includes('gluten')) return 'เบเกอรี่ทั่วไป';
  return 'ทั่วไป';
}

/* ---------- Chart Area HTML Template ---------- */

function chartAreaHTML() {
  return `
    <div id="kw-trending-badges" style="margin-bottom:var(--spacing-lg)"></div>
    <div class="chart-grid">
      <div class="chart-card full-width">
        <h3 class="chart-card-title">Top 10 คีย์เวิร์ดยอดนิยม</h3>
        <p class="chart-card-subtitle">เรียงตามปริมาณการค้นหา</p>
        <div class="chart-container chart-tall">
          <canvas id="chart-kw-top"></canvas>
        </div>
      </div>
    </div>
    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">Keyword Cloud</h3>
      <p class="chart-card-subtitle">ขนาดตัวอักษรแปรผันตามปริมาณการค้นหา</p>
      <div id="kw-cloud" style="padding:16px"></div>
    </div>
    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">ตาราง Search Volume</h3>
      <div class="data-table-wrapper" id="kw-table"></div>
    </div>
    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">สรุปคีย์เวิร์ดตามหมวดหมู่</h3>
      <p class="chart-card-subtitle">จำนวนคีย์เวิร์ดและ volume รวมในแต่ละหมวด</p>
      <div class="data-table-wrapper" id="kw-cat-table"></div>
    </div>
  `;
}

/* ---------- Render Functions ---------- */

/** Badge cards สำหรับ trending keywords ที่กำลังเติบโต */
function renderTrendingBadges(keywords, filters) {
  const el = document.getElementById('kw-trending-badges');
  if (!el) return;

  const trending = [...keywords]
    .filter(k => k.change > 0)
    .sort((a, b) => b.change - a.change)
    .slice(0, 4);

  if (trending.length === 0) return;

  const cards = trending.map((k, i) => {
    const variedVolume = varyValue(k.volume, filters, { seed: 100 + i, asInt: true, min: 0 });
    return `
    <div style="background:rgba(46,204,113,0.08);border:1px solid rgba(46,204,113,0.2);border-radius:8px;padding:12px 16px;text-align:center">
      <div style="font-size:1.4rem;font-weight:700;color:#2ecc71">+${k.change}%</div>
      <div style="font-weight:600;margin:4px 0;color:#2d3748">${k.keyword}</div>
      <div style="font-size:0.85rem;color:#718096">Volume: ${fmt(variedVolume)}</div>
    </div>
  `;}).join('');

  el.innerHTML = `
    <div class="chart-card">
      <h3 class="chart-card-title">&#128293; คีย์เวิร์ดที่กำลังมาแรง</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;padding:8px 0">${cards}</div>
    </div>
  `;
}

function renderKeywordChart(keywords, filters) {
  const top10 = [...keywords]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10)
    .reverse();

  const bgColors = top10.map(k => {
    if (k.trend === 'up') return 'rgba(46, 204, 113, 0.7)';
    if (k.trend === 'down') return 'rgba(231, 76, 60, 0.7)';
    return 'rgba(241, 196, 15, 0.7)';
  });

  const borderColors = top10.map(k => {
    if (k.trend === 'up') return '#2ecc71';
    if (k.trend === 'down') return '#e74c3c';
    return '#f1c40f';
  });

  const variedVolumes = top10.map((k, i) => varyValue(k.volume, filters, { seed: 200 + i, asInt: true, min: 0 }));

  createChart('chart-kw-top', {
    type: 'bar',
    data: {
      labels: top10.map(k => k.keyword),
      datasets: [{
        label: 'Search Volume',
        data: variedVolumes,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 3
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const kw = top10[ctx.dataIndex];
              const changeStr = kw.change >= 0 ? `+${kw.change}%` : `${kw.change}%`;
              return `Volume: ${fmt(ctx.parsed.x)} (${changeStr})`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#4a5568',
            callback: v => v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v
          },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: {
          ticks: { color: '#4a5568', font: { size: 11 } },
          grid: { display: false }
        }
      }
    }
  });
}

function renderKeywordCloud(keywords, filters) {
  const el = document.getElementById('kw-cloud');
  if (!el) return;

  if (!keywords || keywords.length === 0) {
    el.innerHTML = '<p style="color:#718096;text-align:center">ไม่พบข้อมูลคีย์เวิร์ด</p>';
    return;
  }

  const variedKeywords = keywords.map((k, i) => ({
    ...k,
    volume: varyValue(k.volume, filters, { seed: 300 + i, asInt: true, min: 1 })
  }));

  const volumes = variedKeywords.map(k => k.volume);
  const maxVol = Math.max(...volumes);
  const minVol = Math.min(...volumes);
  const range = maxVol - minVol || 1;

  const minFont = 14;
  const maxFont = 48;

  const getColor = (trend) => {
    if (trend === 'up') return '#2ecc71';
    if (trend === 'down') return '#e74c3c';
    return '#718096';
  };

  const shuffled = [...variedKeywords].sort(() => Math.random() - 0.5);

  const tags = shuffled.map(k => {
    const fontSize = minFont + ((k.volume - minVol) / range) * (maxFont - minFont);
    const color = getColor(k.trend);
    const opacity = 0.7 + ((k.volume - minVol) / range) * 0.3;
    return `<span style="
      display:inline-block;
      font-size:${Math.round(fontSize)}px;
      font-weight:${fontSize > 30 ? '700' : '500'};
      color:${color};
      opacity:${opacity.toFixed(2)};
      padding:4px 8px;
      cursor:default;
      transition:transform 0.2s;
    " title="${k.keyword}: ${fmt(k.volume)} (${k.change >= 0 ? '+' : ''}${k.change}%)">${k.keyword}</span>`;
  }).join(' ');

  el.innerHTML = `<div style="text-align:center;line-height:2.2">${tags}</div>`;
}

function renderKeywordTable(keywords, filters) {
  const tableEl = document.getElementById('kw-table');
  if (!tableEl) return;

  const sorted = [...keywords].sort((a, b) => b.volume - a.volume);

  const rows = sorted.map((k, i) => {
    const changeClass = k.change > 0 ? 'positive' : (k.change < 0 ? 'negative' : '');
    const changeStr = k.change >= 0 ? `+${k.change}%` : `${k.change}%`;
    const variedVolume = varyValue(k.volume, filters, { seed: 400 + i, asInt: true, min: 0 });
    return `
      <tr>
        <td>${k.keyword}</td>
        <td class="num">${fmt(variedVolume)}</td>
        <td class="num"><span class="${changeClass}">${trendIcon(k.trend)} ${changeStr}</span></td>
        <td>${guessCategory(k.keyword)}</td>
      </tr>
    `;
  }).join('');

  tableEl.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>คีย์เวิร์ด</th>
          <th class="num">Volume</th>
          <th class="num">เปลี่ยนแปลง</th>
          <th>หมวดหมู่ที่เกี่ยวข้อง</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

/** ตารางสรุปคีย์เวิร์ดตามหมวดหมู่ */
function renderCategorySummaryTable(keywords, filters) {
  const tableEl = document.getElementById('kw-cat-table');
  if (!tableEl) return;

  const catMap = {};
  for (let i = 0; i < keywords.length; i++) {
    const k = keywords[i];
    const cat = guessCategory(k.keyword);
    if (!catMap[cat]) catMap[cat] = { name: cat, count: 0, totalVolume: 0, avgChange: 0 };
    catMap[cat].count++;
    catMap[cat].totalVolume += varyValue(k.volume, filters, { seed: 500 + i, asInt: true, min: 0 });
    catMap[cat].avgChange += k.change;
  }

  const cats = Object.values(catMap).map(c => ({
    ...c,
    avgChange: +(c.avgChange / c.count).toFixed(1)
  }));
  cats.sort((a, b) => b.totalVolume - a.totalVolume);

  const rows = cats.map(c => {
    const changeColor = c.avgChange >= 0 ? '#16a34a' : '#dc2626';
    const changeStr = c.avgChange >= 0 ? `+${c.avgChange}%` : `${c.avgChange}%`;
    return `
      <tr>
        <td>${c.name}</td>
        <td class="num">${c.count}</td>
        <td class="num">${fmt(c.totalVolume)}</td>
        <td class="num" style="color:${changeColor};font-weight:600">${changeStr}</td>
      </tr>`;
  }).join('');

  tableEl.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>หมวดหมู่</th>
          <th class="num">จำนวนคีย์เวิร์ด</th>
          <th class="num">Volume รวม</th>
          <th class="num">Avg เปลี่ยนแปลง</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

/* ---------- renderContent: เรนเดอร์เนื้อหาตาม filter ---------- */

function renderContent(container, keywords, filters) {
  destroyAll();

  // กรองตาม platform ถ้าเลือก (keywords อาจมี field platform)
  const filtered = filterByPlatform(keywords, filters);

  const contentEl = container.querySelector('.prod-keyword-content');
  if (!contentEl) return;

  // ถ้ากรองแล้วไม่มีข้อมูล ให้ใช้ keywords ทั้งหมด (keyword data มักไม่มี platform field)
  const kws = filtered.length > 0 ? filtered : keywords;

  if (!kws || kws.length === 0) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-text">ไม่พบข้อมูลคีย์เวิร์ดในเงื่อนไขที่เลือก</p>
      </div>
    `;
    return;
  }

  contentEl.innerHTML = chartAreaHTML();

  renderTrendingBadges(kws, filters);
  renderKeywordChart(kws, filters);
  renderKeywordCloud(kws, filters);
  renderKeywordTable(kws, filters);
  renderCategorySummaryTable(kws, filters);
}

/* ---------- Tab lifecycle ---------- */

export async function mount(container) {
  const thisMount = ++mountId;

  container.innerHTML = `
    <div class="tab-content">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  `;

  try {
    const data = await fetchJSON('/data/trends.json');
    if (thisMount !== mountId) return;

    const { keywords } = data;

    if (!keywords || keywords.length === 0) {
      container.innerHTML = `
        <div class="tab-content">
          <div class="empty-state">
            <p class="empty-state-text">ไม่พบข้อมูลคีย์เวิร์ด</p>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="tab-content">
        ${buildFilterBar([PERIOD_FILTER, PLATFORM_FILTER])}
        <div class="prod-keyword-content"></div>
      </div>
    `;

    function render(filters) { renderContent(container, keywords, filters); }

    render(getFilterValues(container));

    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('ProdKeyword mount error:', err);
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
}
