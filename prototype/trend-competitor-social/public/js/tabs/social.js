/**
 * social.js - Tab: Social Listening
 * แสดง Mentions, Sentiment, Hashtags, Platform breakdown
 * ใช้ข้อมูลจาก /data/social.json
 * รองรับ loading / empty / error states + race condition guard
 */

import { createChart, destroyAll } from '../shared/chart-factory.js';
import { fetchJSON, filterByWeekRange, getRecentWeekRange } from '../shared/data-loader.js';
import { renderFilters, getFilters, onFilterChange, removeFilterListener } from '../shared/filters.js';

// สีของแต่ละแพลตฟอร์ม (TikTok ใช้ #ff0050 แทนสีดำเพราะ dark theme)
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

// แพลตฟอร์มที่มีข้อมูลใน social.json
const ALL_PLATFORMS = ['facebook', 'instagram', 'x', 'tiktok', 'pantip'];

let filterHandler = null;
let mountId = 0; // ป้องกัน race condition เมื่อสลับ tab เร็ว

/* ========== Chart Area HTML Template ========== */

function chartAreaHTML() {
  return `
    <div class="chart-grid">
      <div class="chart-card full-width">
        <h3 class="chart-card-title">Mentions รายสัปดาห์</h3>
        <div class="chart-container"><canvas id="chart-mentions"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">Sentiment Analysis</h3>
        <div class="chart-container"><canvas id="chart-sentiment"></canvas></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-card-title">แพลตฟอร์ม</h3>
        <div class="chart-container"><canvas id="chart-platforms"></canvas></div>
      </div>
      <div class="chart-card full-width">
        <h3 class="chart-card-title">Hashtags ยอดนิยม</h3>
        <div class="chart-container"><canvas id="chart-hashtags"></canvas></div>
      </div>
    </div>
  `;
}

/* ========== Mount / Unmount ========== */

export async function mount(container) {
  const thisMount = ++mountId;

  // แสดง loading state ก่อน fetch
  container.innerHTML = `
    <div class="tab-content">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  `;

  try {
    // โหลดข้อมูลล่วงหน้า
    await fetchJSON('/data/social.json');

    // ตรวจ race condition
    if (thisMount !== mountId) return;

    // สร้าง HTML จริงของ tab
    container.innerHTML = `
      <div class="tab-content">
        <div id="social-filters"></div>
        <div id="social-chart-area"></div>
      </div>
    `;

    renderFilters(document.getElementById('social-filters'));
    await renderAll();

    if (thisMount !== mountId) return;

    filterHandler = () => renderAll();
    onFilterChange(filterHandler);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('Social mount error:', err);
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
  mountId++; // ยกเลิก render ที่อาจค้างอยู่
  destroyAll();
  if (filterHandler) {
    removeFilterListener(filterHandler);
    filterHandler = null;
  }
}

/* ========== Render All ========== */

async function renderAll() {
  const chartArea = document.getElementById('social-chart-area');
  if (!chartArea) return;

  try {
    const data = await fetchJSON('/data/social.json');
    const filters = getFilters();

    // กรองข้อมูล weekly ตาม dateRange
    let weeklyMentions = data.mentions.weekly;
    let weeklySentiment = data.sentiment.weekly;

    if (filters.dateRange !== 'all') {
      const numWeeks = parseInt(filters.dateRange, 10);
      const range = getRecentWeekRange(weeklyMentions, numWeeks);
      if (range) {
        weeklyMentions = filterByWeekRange(weeklyMentions, range.startWeek, range.endWeek);
        weeklySentiment = filterByWeekRange(weeklySentiment, range.startWeek, range.endWeek);
      }
    }

    // กำหนดแพลตฟอร์มที่จะแสดง (กรองเฉพาะที่มีในข้อมูล)
    const activePlatforms = filters.platform === 'all'
      ? ALL_PLATFORMS
      : ALL_PLATFORMS.filter(p => p === filters.platform);

    // ตรวจ empty state: ไม่มีแพลตฟอร์ม social ตรงเงื่อนไข
    if (activePlatforms.length === 0) {
      destroyAll();
      chartArea.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-text">ไม่พบข้อมูลในเงื่อนไขที่เลือก</p>
        </div>
      `;
      // อัพเดต top cards ให้เห็นว่าไม่มีข้อมูล
      updateTopLevelCardsEmpty();
      return;
    }

    // ทำลาย chart เดิมก่อนสร้าง canvas ใหม่
    destroyAll();
    chartArea.innerHTML = chartAreaHTML();

    updateTopLevelCards(data, weeklyMentions, weeklySentiment, activePlatforms, filters);
    renderMentionsChart(weeklyMentions, activePlatforms);
    renderSentimentChart(weeklySentiment);
    renderHashtagsChart(data.hashtags);
    renderPlatformsChart(data.platforms, activePlatforms);

  } catch (err) {
    console.error('Social renderAll error:', err);
    chartArea.innerHTML = `
      <div class="error-state">
        <p class="error-state-text">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
      </div>
    `;
  }
}

/* ========== Top-level Overview Cards ========== */

/** อัพเดต overview cards 3 ใบด้านบน (ใน HTML หลัก) */
function updateTopLevelCards(data, weeklyMentions, weeklySentiment, activePlatforms, filters) {
  // Card 0: Total Mentions
  const card0 = document.getElementById('top-card-0');
  if (card0) {
    let totalMentions = 0;
    if (filters.dateRange === 'all') {
      for (const p of activePlatforms) {
        totalMentions += data.mentions.totalByPlatform[p] || 0;
      }
    } else {
      for (const week of weeklyMentions) {
        for (const p of activePlatforms) {
          totalMentions += week[p] || 0;
        }
      }
    }
    setCardContent(card0, 'Total Mentions',
      totalMentions.toLocaleString(),
      `${activePlatforms.length} แพลตฟอร์ม`
    );
  }

  // Card 1: Overall Sentiment
  const card1 = document.getElementById('top-card-1');
  if (card1) {
    const avgSentiment = computeAvgSentiment(weeklySentiment, data.sentiment.overall);
    setCardContent(card1, 'Overall Sentiment',
      `${Math.round(avgSentiment.positive)}%`,
      'Positive'
    );
  }

  // Card 2: Top Hashtag
  const card2 = document.getElementById('top-card-2');
  if (card2 && data.hashtags.length > 0) {
    const top = data.hashtags[0];
    const icon = trendIcon(top.trend);
    const sign = top.change > 0 ? '+' : '';
    setCardContent(card2, 'Top Hashtag',
      top.tag,
      `${icon} ${sign}${top.change}% | ${top.count.toLocaleString()} mentions`
    );
  }
}

/** อัพเดต top cards เมื่อไม่มีข้อมูลตรงเงื่อนไข */
function updateTopLevelCardsEmpty() {
  const card0 = document.getElementById('top-card-0');
  if (card0) setCardContent(card0, 'Total Mentions', '0', 'ไม่พบข้อมูล');
  const card1 = document.getElementById('top-card-1');
  if (card1) setCardContent(card1, 'Overall Sentiment', '-', 'ไม่พบข้อมูล');
  const card2 = document.getElementById('top-card-2');
  if (card2) setCardContent(card2, 'Top Hashtag', '-', 'ไม่พบข้อมูล');
}

/** ตั้งค่า label/value/note ของ overview card */
function setCardContent(card, label, value, note) {
  const labelEl = card.querySelector('.overview-card-label');
  const valueEl = card.querySelector('.overview-card-value');
  const noteEl = card.querySelector('.overview-card-note');
  if (labelEl) labelEl.textContent = label;
  if (valueEl) valueEl.textContent = value;
  if (noteEl) noteEl.textContent = note;
}

/* ========== Chart: Mentions รายสัปดาห์ (Multi-line) ========== */

function renderMentionsChart(weeklyMentions, activePlatforms) {
  const labels = weeklyMentions.map(w => w.week.replace('2026-', ''));

  const datasets = activePlatforms.map(platform => ({
    label: PLATFORM_LABELS[platform] || platform,
    data: weeklyMentions.map(w => w[platform] || 0),
    borderColor: PLATFORM_COLORS[platform],
    backgroundColor: PLATFORM_COLORS[platform] + '20',
    borderWidth: 2,
    tension: 0.3,
    fill: false,
    pointRadius: 3,
    pointHoverRadius: 6
  }));

  createChart('chart-mentions', {
    type: 'line',
    data: { labels, datasets },
    options: {
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#999' }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#999' }
        }
      },
      plugins: {
        tooltip: { mode: 'index', intersect: false },
        legend: { position: 'top' }
      },
      interaction: { mode: 'index', intersect: false }
    }
  });
}

/* ========== Chart: Sentiment Doughnut ========== */

function renderSentimentChart(weeklySentiment) {
  const avg = computeAvgSentiment(weeklySentiment, null);
  const pos = Math.round(avg.positive);
  const neu = Math.round(avg.neutral);
  const neg = Math.round(avg.negative);

  // Plugin สำหรับแสดงข้อความตรงกลาง doughnut
  const centerTextPlugin = {
    id: 'centerText',
    afterDraw(chart) {
      const { ctx, chartArea } = chart;
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // บรรทัดบน: เปอร์เซ็นต์
      ctx.font = "bold 28px 'Segoe UI', sans-serif";
      ctx.fillStyle = SENTIMENT_COLORS.positive;
      ctx.fillText(`${pos}%`, centerX, centerY - 10);

      // บรรทัดล่าง: label
      ctx.font = "12px 'Segoe UI', sans-serif";
      ctx.fillStyle = '#999';
      ctx.fillText('Positive', centerX, centerY + 14);

      ctx.restore();
    }
  };

  createChart('chart-sentiment', {
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
        borderColor: 'rgba(0,0,0,0.3)',
        borderWidth: 2
      }]
    },
    options: {
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#ccc', padding: 16 }
        },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              return `${ctx.label}`;
            }
          }
        }
      }
    },
    plugins: [centerTextPlugin]
  });
}

/* ========== Chart: Hashtags ยอดนิยม (Horizontal Bar) ========== */

function renderHashtagsChart(hashtags) {
  const sorted = [...hashtags].sort((a, b) => b.count - a.count).slice(0, 15);
  const reversed = [...sorted].reverse();

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

  createChart('chart-hashtags', {
    type: 'bar',
    data: {
      labels: reversed.map(h => `${h.tag} ${trendIcon(h.trend)}`),
      datasets: [{
        label: 'Mentions',
        data: reversed.map(h => h.count),
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
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#999' }
        },
        y: {
          grid: { display: false },
          ticks: { color: '#ccc', font: { size: 11 } }
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

function renderPlatformsChart(platforms, activePlatforms) {
  const keys = activePlatforms.filter(p => platforms[p]);

  createChart('chart-platforms', {
    type: 'bar',
    data: {
      labels: keys.map(p => PLATFORM_LABELS[p] || p),
      datasets: [{
        label: 'Mentions',
        data: keys.map(p => platforms[p].totalMentions),
        backgroundColor: keys.map(p => PLATFORM_COLORS[p] + 'CC'),
        borderColor: keys.map(p => PLATFORM_COLORS[p]),
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#ccc' }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#999' }
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

/* ========== Helpers ========== */

/** คำนวณค่าเฉลี่ย sentiment จาก weekly data (fallback ใช้ overall) */
function computeAvgSentiment(weeklySentiment, fallback) {
  if (weeklySentiment && weeklySentiment.length > 0) {
    const len = weeklySentiment.length;
    return {
      positive: weeklySentiment.reduce((s, w) => s + w.positive, 0) / len,
      neutral:  weeklySentiment.reduce((s, w) => s + w.neutral, 0) / len,
      negative: weeklySentiment.reduce((s, w) => s + w.negative, 0) / len
    };
  }
  return fallback || { positive: 0, neutral: 0, negative: 0 };
}

/** แปลง trend เป็น icon */
function trendIcon(trend) {
  if (trend === 'up')   return '↑';
  if (trend === 'down') return '↓';
  return '→';
}
