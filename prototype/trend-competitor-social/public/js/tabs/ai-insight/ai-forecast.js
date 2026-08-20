/**
 * ai-forecast.js - Sub-tab: พยากรณ์แนวโน้ม
 * ENHANCE: เพิ่ม confidence bands + สรุป forecast insight
 * แสดง forecast line chart (actual + forecast + confidence) + ตารางพยากรณ์ตามหมวด
 * ข้อมูล demo ในตัว (hardcoded)
 * รองรับ reactive filters
 */
import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { buildFilterBar, PERIOD_FILTER, CATEGORY_FILTER } from '../../shared/filter-builder.js';
import { onFilterChange, getFilterValues } from '../../shared/filter-builder.js';
import { varyValue, varyPercent, varyArray, filterByCategory } from '../../shared/filter-data.js';

let mountId = 0;
let filterCleanup = null;

/* ---------- ข้อมูล Demo ---------- */

// มูลค่าตลาดรวม (พันล้านบาท) — 6 เดือนจริง + 6 เดือนพยากรณ์
const ACTUAL_DATA =   [10.2, 10.5, 10.8, 11.1, 11.6, 12.0];
const FORECAST_DATA = [null, null, null, null, null, 12.0, 12.4, 12.9, 13.3, 13.8, 14.1, 14.5];
// Confidence bands (upper/lower) สำหรับ forecast
const FORECAST_UPPER = [null, null, null, null, null, 12.0, 12.8, 13.5, 14.1, 14.8, 15.3, 15.8];
const FORECAST_LOWER = [null, null, null, null, null, 12.0, 12.0, 12.3, 12.5, 12.8, 12.9, 13.2];
const LABELS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

const CATEGORY_FORECAST = [
  { category: 'cake',   categoryLabel: 'เค้ก',     current: 3.2, forecast: 3.6, confidence: 85, risk: 'ต่ำ' },
  { category: 'bread',  categoryLabel: 'ขนมปัง',   current: 4.1, forecast: 4.5, confidence: 90, risk: 'ต่ำ' },
  { category: 'cookie', categoryLabel: 'คุกกี้',    current: 1.8, forecast: 1.9, confidence: 80, risk: 'ปานกลาง' },
  { category: 'pastry', categoryLabel: 'เพสทรี',   current: 1.5, forecast: 1.7, confidence: 75, risk: 'ปานกลาง' },
  { category: 'donut',  categoryLabel: 'โดนัท',    current: 1.2, forecast: 1.6, confidence: 70, risk: 'สูง' },
  { category: 'pie',    categoryLabel: 'พาย',      current: 0.7, forecast: 0.8, confidence: 82, risk: 'ปานกลาง' }
];

/* ---------- Render Content ---------- */

function renderContent(container, filters) {
  destroyAll();

  const contentEl = container.querySelector('.aiforecast-content');
  if (!contentEl) return;

  // กรองหมวดหมู่
  const filteredCats = filterByCategory(CATEGORY_FORECAST, filters);

  // vary ข้อมูลตาม filter
  const variedActual = varyArray(ACTUAL_DATA, filters, { startSeed: 300 });
  const forecastNonNull = FORECAST_DATA.filter(v => v !== null);
  const variedForecastNonNull = varyArray(forecastNonNull, filters, { startSeed: 310 });
  const variedForecast = FORECAST_DATA.map((v, i) => v === null ? null : variedForecastNonNull[i - (FORECAST_DATA.length - forecastNonNull.length)]);

  const upperNonNull = FORECAST_UPPER.filter(v => v !== null);
  const variedUpperNonNull = varyArray(upperNonNull, filters, { startSeed: 320 });
  const variedUpper = FORECAST_UPPER.map((v, i) => v === null ? null : variedUpperNonNull[i - (FORECAST_UPPER.length - upperNonNull.length)]);

  const lowerNonNull = FORECAST_LOWER.filter(v => v !== null);
  const variedLowerNonNull = varyArray(lowerNonNull, filters, { startSeed: 330 });
  const variedLower = FORECAST_LOWER.map((v, i) => v === null ? null : variedLowerNonNull[i - (FORECAST_LOWER.length - lowerNonNull.length)]);

  // สร้างตาราง
  const tableRows = filteredCats.map((c, idx) => {
    const current = varyValue(c.current, filters, { seed: 400 + idx });
    const forecast = varyValue(c.forecast, filters, { seed: 410 + idx });
    const confidence = Math.round(varyPercent(c.confidence, filters, { seed: 420 + idx }));
    const clampedConf = Math.min(100, Math.max(0, confidence));
    const growth = ((forecast - current) / current * 100).toFixed(1);
    const confColor = clampedConf >= 85 ? '#16a34a' : clampedConf >= 75 ? '#f59e0b' : '#dc2626';
    const riskColor = c.risk === 'ต่ำ' ? '#16a34a' : c.risk === 'ปานกลาง' ? '#f59e0b' : '#dc2626';
    return `
      <tr>
        <td style="font-weight:600">${c.categoryLabel}</td>
        <td class="num">${current.toFixed(1)}B</td>
        <td class="num">${forecast.toFixed(1)}B</td>
        <td class="num" style="color:#16a34a;font-weight:600">+${growth}%</td>
        <td class="num">
          <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end">
            <div style="width:60px;height:6px;background:rgba(0,0,0,0.06);border-radius:3px;overflow:hidden">
              <div style="width:${clampedConf}%;height:100%;background:${confColor};border-radius:3px"></div>
            </div>
            <span style="color:${confColor};font-weight:600">${clampedConf}%</span>
          </div>
        </td>
        <td class="num"><span style="color:${riskColor};font-weight:600">${c.risk}</span></td>
      </tr>`;
  }).join('');

  // สรุป forecast
  const totalCurrent = filteredCats.reduce((s, c, i) => s + varyValue(c.current, filters, { seed: 400 + i }), 0);
  const totalForecast = filteredCats.reduce((s, c, i) => s + varyValue(c.forecast, filters, { seed: 410 + i }), 0);
  const totalGrowth = totalCurrent > 0 ? ((totalForecast - totalCurrent) / totalCurrent * 100).toFixed(1) : '0.0';

  const fastestCat = filteredCats.length > 0
    ? [...filteredCats].sort((a, b) => {
        const gA = (a.forecast - a.current) / a.current;
        const gB = (b.forecast - b.current) / b.current;
        return gB - gA;
      })[0]
    : { categoryLabel: '-', confidence: 0, forecast: 0, current: 1 };
  const fastestGrowth = ((fastestCat.forecast - fastestCat.current) / fastestCat.current * 100).toFixed(1);

  contentEl.innerHTML = `
    <div class="chart-card">
      <h3 class="chart-card-title">พยากรณ์มูลค่าตลาดเบเกอรี่ 2569</h3>
      <p class="chart-card-subtitle">เส้นทึบ = ข้อมูลจริง | เส้นประ = พยากรณ์ | พื้นที่สีจาง = Confidence Band (หน่วย: พันล้านบาท)</p>
      <div class="chart-container"><canvas id="chart-ai-forecast"></canvas></div>
    </div>

    <div class="chart-card" style="margin-top:var(--spacing-lg)">
      <h3 class="chart-card-title">พยากรณ์ตามหมวดสินค้า (6 เดือนข้างหน้า)</h3>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>หมวดหมู่</th>
              <th class="num">มูลค่าปัจจุบัน</th>
              <th class="num">พยากรณ์ 6 เดือน</th>
              <th class="num">การเติบโต</th>
              <th class="num">ระดับความเชื่อมั่น</th>
              <th class="num">ความเสี่ยง</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    </div>

    <div style="background:linear-gradient(135deg,rgba(123,47,247,0.06),rgba(0,210,255,0.06));border:1px solid rgba(123,47,247,0.15);border-radius:12px;padding:20px 24px;margin-top:24px;display:flex;gap:14px;align-items:flex-start">
      <div style="font-size:1.5rem;flex-shrink:0">&#128202;</div>
      <div>
        <div style="font-weight:700;color:#7b2ff7;margin-bottom:6px">Forecast Summary</div>
        <div style="color:#4a5568;font-size:0.9rem;line-height:1.6">
          &#8226; ตลาดเบเกอรี่คาดว่าจะเติบโต <strong>+${totalGrowth}%</strong> ใน 6 เดือนข้างหน้า
          (${totalCurrent.toFixed(1)}B &#8594; ${totalForecast.toFixed(1)}B)<br>
          &#8226; หมวด <strong>${fastestCat.categoryLabel}</strong> เติบโตเร็วที่สุด (+${fastestGrowth}%)
          แต่ระดับความเชื่อมั่น ${fastestCat.confidence}% &#8212; ต้องติดตามใกล้ชิด<br>
          &#8226; หมวด <strong>ขนมปัง</strong> เป็นหมวดที่มั่นคงที่สุด (Confidence 90%, ความเสี่ยงต่ำ)
        </div>
      </div>
    </div>
  `;

  // Render chart
  createChart('chart-ai-forecast', {
    type: 'line',
    data: {
      labels: LABELS,
      datasets: [
        {
          label: 'ข้อมูลจริง',
          data: variedActual,
          borderColor: CHART_COLORS[1],
          backgroundColor: CHART_COLORS[1] + '33',
          borderWidth: 3,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: CHART_COLORS[1],
          fill: false
        },
        {
          label: 'พยากรณ์',
          data: variedForecast,
          borderColor: CHART_COLORS[3],
          backgroundColor: 'transparent',
          borderWidth: 3,
          borderDash: [5, 5],
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: CHART_COLORS[3],
          pointStyle: 'triangle',
          fill: false
        },
        {
          label: 'Confidence Upper',
          data: variedUpper,
          borderColor: 'transparent',
          backgroundColor: CHART_COLORS[3] + '15',
          borderWidth: 0,
          tension: 0.3,
          pointRadius: 0,
          fill: '+1'
        },
        {
          label: 'Confidence Lower',
          data: variedLower,
          borderColor: 'transparent',
          backgroundColor: CHART_COLORS[3] + '15',
          borderWidth: 0,
          tension: 0.3,
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#4a5568',
            usePointStyle: true,
            padding: 12,
            filter: item => !item.text.includes('Confidence')
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              if (ctx.dataset.label.includes('Confidence')) return null;
              return `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} พันล้านบาท`;
            }
          }
        }
      },
      scales: {
        x: { ticks: { color: '#4a5568' }, grid: { color: 'rgba(0,0,0,0.06)' } },
        y: {
          ticks: {
            color: '#4a5568',
            callback: v => `${v}B`
          },
          grid: { color: 'rgba(0,0,0,0.06)' },
          title: { display: true, text: 'พันล้านบาท', color: '#4a5568' }
        }
      }
    }
  });
}

/* ---------- Tab lifecycle ---------- */

export async function mount(container) {
  const thisMount = ++mountId;

  container.innerHTML = `
    <div class="tab-content">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">กำลังคำนวณพยากรณ์...</p>
      </div>
    </div>
  `;

  try {
    await Promise.resolve();
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">${buildFilterBar([PERIOD_FILTER, CATEGORY_FILTER])}<div class="aiforecast-content"></div></div>`;

    function render(filters) { renderContent(container, filters); }
    render(getFilterValues(container));
    filterCleanup = onFilterChange(container, render);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('AIForecast mount error:', err);
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
