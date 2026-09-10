/**
 * cons-social.js - Tab: Social Listening (refactored จาก social.js)
 * ENHANCE: ปรับปรุงตาราง + เพิ่ม engagement rate + top content summary
 * แสดง Mentions, Sentiment, Hashtags, Platform breakdown
 * ใช้ข้อมูลจาก /data/social.json
 * รองรับ loading / empty / error states + race condition guard
 * Filter-reactive: ใช้ filter-builder + filter-data แทน filters.js เดิม
 */

import { createChart, destroyAll } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import { buildFilterBar, onFilterChange, getFilterValues, PERIOD_FILTER, PLATFORM_FILTER } from '../../shared/filter-builder.js';
import { varyValue, varyArray } from '../../shared/filter-data.js';

const PLATFORM_COLORS = {
  facebook:  '#1877F2',
  instagram: '#E4405F',
  x:         '#1DA1F2',
  tiktok:    '#ff0050',
  pantip:    '#7B6FB5'
};

const PLATFORM_LABELS = {
  facebook:  'Facebook',
  instagram: 'Instagram',
  x:         'X (Twitter)',
  tiktok:    'TikTok',
  pantip:    'Pantip'
};

const SENTIMENT_COLORS = {
  positive: '#2ecc71',
  neutral:  '#95a5a6',
  negative: '#e74c3c'
};

const ALL_PLATFORMS = ['facebook', 'instagram', 'x', 'tiktok', 'pantip'];

let filterCleanup = null;
let mountId = 0;

/* ========== Chart Area HTML Template ========== */

function chartAreaHTML() {
  return `
    <div class="chart-grid">
      <div class="chart-card full-width">
        <h3 class="chart-card-title">Mentions รายสัปดาห์</h3>
        <div class="chart-container"><canvas id="chart-social-mentions"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">Sentiment Analysis</h3>
        <div class="chart-container"><canvas id="chart-social-sentiment"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">แพลตฟอร์ม</h3>
        <div class="chart-container"><canvas id="chart-social-platforms"></canvas></div>
      </div>
      <div class="chart-card full-width">
        <h3 class="chart-card-title">Hashtags ยอดนิยม</h3>
        <div class="chart-container"><canvas id="chart-social-hashtags"></canvas></div>
      </div>
    </div>
    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">ข้อมูล Social โดยรวม</h3>
      <p class="chart-card-subtitle">สรุปสถิติทุกแพลตฟอร์ม</p>
      <div class="data-table-wrapper" id="social-data-table"></div>
    </div>
    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">Hashtag Trend Table</h3>
      <p class="chart-card-subtitle">รายละเอียด hashtag ทั้งหมด</p>
      <div class="data-table-wrapper" id="social-hashtag-table"></div>
    </div>
  `;
}

/* ========== Helpers ========== */

function trendIcon(trend) {
  if (trend === 'up')   return '&#8593;';
  if (trend === 'down') return '&#8595;';
  return '&#8594;';
}

/**
 * แปลง period filter (จาก filter-builder) เป็นจำนวนสัปดาห์ที่ต้องการ
 * ถ้า 'all' ส่งคืน null (ใช้ทั้งหมด)
 */
function periodToWeeks(period) {
  if (period === '3m') return 12;
  if (period === '1m') return 4;
  if (period === '1w') return 1;
  return null; // 'all'
}

/* ========== renderContent ========== */

function renderContent(container, data, filters) {
  destroyAll();

  const contentEl = container.querySelector('.cons-social-content');
  if (!contentEl) return;

  let weeklyMentions = data.mentions.weekly;
  let weeklySentiment = data.sentiment.weekly;

  // จำกัด period ตามจำนวนสัปดาห์
  const numWeeks = periodToWeeks(filters.period);
  if (numWeeks !== null) {
    weeklyMentions = weeklyMentions.slice(-numWeeks);
    weeklySentiment = weeklySentiment.slice(-numWeeks);
  }

  // กรอง platform
  const activePlatforms = (!filters.platform || filters.platform === 'all')
    ? ALL_PLATFORMS
    : ALL_PLATFORMS.filter(p => p === filters.platform);

  if (activePlatforms.length === 0) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-text">ไม่พบข้อมูลในเงื่อนไขที่เลือก</p>
      </div>
    `;
    return;
  }

  contentEl.innerHTML = chartAreaHTML();

  renderMentionsChart(weeklyMentions, activePlatforms, filters);
  renderSentimentChart(weeklySentiment, filters);
  renderHashtagsChart(data.hashtags, filters);
  renderPlatformsChart(data.platforms, activePlatforms, filters);
  renderDataTable(data, activePlatforms, filters);
  renderHashtagTable(data.hashtags, filters);
}

/* ========== Mount / Unmount ========== */

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
    const data = await fetchJSON('/data/social.json');
    if (thisMount !== mountId) return;

    container.innerHTML = `
      <div class="tab-content">
        ${buildFilterBar([PERIOD_FILTER, PLATFORM_FILTER])}
        <div class="cons-social-content"></div>
      </div>
    `;

    function render(filters) { renderContent(container, data, filters); }

    render(getFilterValues(container));

    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('ConsSocial mount error:', err);
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

/* ========== Chart: Mentions รายสัปดาห์ (Multi-line) ========== */

function renderMentionsChart(weeklyMentions, activePlatforms, filters) {
  const labels = weeklyMentions.map(w => w.week.replace('2026-', ''));

  const datasets = activePlatforms.map(platform => ({
    label: PLATFORM_LABELS[platform] || platform,
    data: varyArray(weeklyMentions.map(w => w[platform] || 0), filters, { startSeed: 100 }),
    borderColor: PLATFORM_COLORS[platform],
    backgroundColor: PLATFORM_COLORS[platform] + '20',
    borderWidth: 2,
    tension: 0.3,
    fill: false,
    pointRadius: 3,
    pointHoverRadius: 6
  }));

  createChart('chart-social-mentions', {
    type: 'line',
    data: { labels, datasets },
    options: {
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,0.06)' },
          ticks: { color: '#4a5568' }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.06)' },
          ticks: { color: '#4a5568' }
        }
      },
      plugins: {
        tooltip: { mode: 'index', intersect: false },
        legend: {
          position: 'bottom',
          labels: { color: '#4a5568', usePointStyle: true, padding: 12 }
        }
      },
      interaction: { mode: 'index', intersect: false }
    }
  });
}

/* ========== Chart: Sentiment Over Time (Line) ========== */

function renderSentimentChart(weeklySentiment, filters) {
  const labels = weeklySentiment.map(w => w.week.replace('2026-', ''));

  createChart('chart-social-sentiment', {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Positive',
          data: varyArray(weeklySentiment.map(w => w.positive), filters, { startSeed: 200 }),
          borderColor: SENTIMENT_COLORS.positive,
          backgroundColor: SENTIMENT_COLORS.positive + '20',
          borderWidth: 2,
          tension: 0.3,
          fill: false,
          pointRadius: 2,
          pointHoverRadius: 5
        },
        {
          label: 'Neutral',
          data: varyArray(weeklySentiment.map(w => w.neutral), filters, { startSeed: 220 }),
          borderColor: SENTIMENT_COLORS.neutral,
          backgroundColor: SENTIMENT_COLORS.neutral + '20',
          borderWidth: 2,
          tension: 0.3,
          fill: false,
          pointRadius: 2,
          pointHoverRadius: 5
        },
        {
          label: 'Negative',
          data: varyArray(weeklySentiment.map(w => w.negative), filters, { startSeed: 240 }),
          borderColor: SENTIMENT_COLORS.negative,
          backgroundColor: SENTIMENT_COLORS.negative + '20',
          borderWidth: 2,
          tension: 0.3,
          fill: false,
          pointRadius: 2,
          pointHoverRadius: 5
        }
      ]
    },
    options: {
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,0.06)' },
          ticks: { color: '#4a5568' }
        },
        y: {
          beginAtZero: true,
          max: 100,
          grid: { color: 'rgba(0,0,0,0.06)' },
          ticks: { color: '#4a5568', callback: v => `${v}%` }
        }
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}%` }
        },
        legend: {
          position: 'bottom',
          labels: { color: '#4a5568', usePointStyle: true, padding: 12 }
        }
      },
      interaction: { mode: 'index', intersect: false }
    }
  });
}

/* ========== Chart: Hashtags ยอดนิยม (Horizontal Bar) ========== */

function renderHashtagsChart(hashtags, filters) {
  const sorted = [...hashtags].sort((a, b) => b.count - a.count).slice(0, 15);
  const reversed = [...sorted].reverse();

  const variedCounts = reversed.map((h, i) => varyValue(h.count, filters, { seed: 300 + i, asInt: true, min: 0 }));

  const bgColors = reversed.map(h => {
    if (h.trend === 'up')   return 'rgba(46, 204, 113, 0.7)';
    if (h.trend === 'down') return 'rgba(231, 76, 60, 0.7)';
    return 'rgba(149, 165, 166, 0.7)';
  });

  const borderColors = reversed.map(h => {
    if (h.trend === 'up')   return '#2ecc71';
    if (h.trend === 'down') return '#e74c3c';
    return '#95a5a6';
  });

  createChart('chart-social-hashtags', {
    type: 'bar',
    data: {
      labels: reversed.map(h => `${h.tag} ${trendIcon(h.trend)}`),
      datasets: [{
        label: 'Mentions',
        data: variedCounts,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.06)' },
          ticks: { color: '#4a5568' }
        },
        y: {
          grid: { display: false },
          ticks: { color: '#4a5568', font: { size: 11 } }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              const item = reversed[ctx.dataIndex];
              const sign = item.change > 0 ? '+' : '';
              return `${ctx.parsed.x.toLocaleString()} mentions (${sign}${item.change}%)`;
            }
          }
        }
      }
    }
  });
}

/* ========== Chart: Platform Breakdown (Vertical Bar) ========== */

function renderPlatformsChart(platforms, activePlatforms, filters) {
  const keys = activePlatforms.filter(p => platforms[p]);

  const variedMentions = keys.map((p, i) => varyValue(platforms[p].totalMentions, filters, { seed: 400 + i, asInt: true, min: 0 }));

  createChart('chart-social-platforms', {
    type: 'bar',
    data: {
      labels: keys.map(p => PLATFORM_LABELS[p] || p),
      datasets: [{
        label: 'Mentions',
        data: variedMentions,
        backgroundColor: keys.map(p => PLATFORM_COLORS[p] + 'CC'),
        borderColor: keys.map(p => PLATFORM_COLORS[p]),
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#4a5568' }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.06)' },
          ticks: { color: '#4a5568' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            afterLabel: function(ctx) {
              const p = keys[ctx.dataIndex];
              const info = platforms[p];
              return [
                `Avg Engagement: ${info.avgEngagement.toLocaleString()}`,
                `Top Content: ${info.topContent}`
              ];
            }
          }
        }
      }
    }
  });
}

/* ========== Table: Social Data ========== */

function renderDataTable(data, activePlatforms, filters) {
  const tableEl = document.getElementById('social-data-table');
  if (!tableEl) return;

  const keys = activePlatforms.filter(p => data.platforms[p]);

  const variedMentions = {};
  const variedEngagement = {};
  keys.forEach((p, i) => {
    variedMentions[p] = varyValue(data.platforms[p].totalMentions, filters, { seed: 500 + i, asInt: true, min: 0 });
    variedEngagement[p] = varyValue(data.platforms[p].avgEngagement, filters, { seed: 510 + i, asInt: true, min: 0 });
  });

  const totalMentions = keys.reduce((s, p) => s + variedMentions[p], 0);

  const rows = keys.map(p => {
    const mentions = variedMentions[p];
    const engagement = variedEngagement[p];
    const share = totalMentions > 0 ? ((mentions / totalMentions) * 100).toFixed(1) : 0;
    return `
      <tr>
        <td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${PLATFORM_COLORS[p]};margin-right:6px"></span>${PLATFORM_LABELS[p]}</td>
        <td class="num">${mentions.toLocaleString()}</td>
        <td class="num">${share}%</td>
        <td class="num">${engagement.toLocaleString()}</td>
        <td>${data.platforms[p].topContent}</td>
      </tr>
    `;
  }).join('');

  const totalEngagement = keys.reduce((s, p) => s + variedEngagement[p], 0);
  const avgEngagement = keys.length > 0 ? Math.round(totalEngagement / keys.length) : 0;

  tableEl.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>แพลตฟอร์ม</th>
          <th class="num">Total Mentions</th>
          <th class="num">สัดส่วน</th>
          <th class="num">Avg Engagement</th>
          <th>Top Content</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr style="font-weight:700;background:rgba(0,0,0,0.02)">
          <td>รวม</td>
          <td class="num">${totalMentions.toLocaleString()}</td>
          <td class="num">100%</td>
          <td class="num">${avgEngagement.toLocaleString()}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  `;
}

/* ========== Table: Hashtag Detail ========== */

function renderHashtagTable(hashtags, filters) {
  const tableEl = document.getElementById('social-hashtag-table');
  if (!tableEl) return;

  const sorted = [...hashtags].sort((a, b) => b.count - a.count);

  const rows = sorted.map((h, i) => {
    const variedCount = varyValue(h.count, filters, { seed: 600 + i, asInt: true, min: 0 });
    const changeColor = h.change > 0 ? '#16a34a' : (h.change < 0 ? '#dc2626' : '#718096');
    const changeStr = h.change >= 0 ? `+${h.change}%` : `${h.change}%`;
    return `
      <tr>
        <td class="num">${i + 1}</td>
        <td>${h.tag}</td>
        <td class="num">${variedCount.toLocaleString()}</td>
        <td class="num" style="color:${changeColor};font-weight:600">${changeStr}</td>
        <td>${trendIcon(h.trend)} ${h.trend === 'up' ? 'ขาขึ้น' : h.trend === 'down' ? 'ขาลง' : 'ทรงตัว'}</td>
      </tr>`;
  }).join('');

  tableEl.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th class="num">#</th>
          <th>Hashtag</th>
          <th class="num">Mentions</th>
          <th class="num">เปลี่ยนแปลง</th>
          <th>แนวโน้ม</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}
