/**
 * overview.js — ภาพรวมธุรกิจ Health Bento
 * KPI หลัก, การเติบโตรายเดือนปีที่ 1, สัดส่วนช่องทางขายและหมวดเมนู
 */

import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import {
  buildFilterBar, onFilterChange, getFilterValues,
  YEAR_FILTER, PERIOD_FILTER, CHANNEL_FILTER, REGION_FILTER
} from '../../shared/filter-builder.js';
import { varyValue, varyPercent, varyArray, getMonthSlice, getYearFactor } from '../../shared/filter-data.js';
import {
  kpiGrid, chartCard, chartGrid, noteBox, assumptionBar,
  fmtBaht, fmtNum, fmtPct, baseScales, legendOpts, loadingHTML, errorHTML
} from '../../shared/ui-kit.js';
import { aiPanel } from '../../shared/ai-analyst.js';

let mountId = 0;
let filterCleanup = null;

function renderContent(root, data, f) {
  destroyAll();

  const k = data.kpi;
  const yf = getYearFactor(f);

  const boxesPerDay = varyValue(k.boxesPerDayAvgY1, f, { seed: 1, asInt: true });
  const revenue = varyValue(k.revenueY1, f, { seed: 2, asInt: true });
  const ebitda = varyValue(k.ebitdaY1, f, { seed: 3, asInt: true });
  const customers = varyValue(k.targetCustomersY1, f, { seed: 4, asInt: true });
  const utilization = Math.min(100, +((boxesPerDay / k.boxesPerDayCapacity) * 100).toFixed(1));

  const kpis = [
    { icon: '🍱', label: 'กล่องต่อวัน (เฉลี่ย)', value: fmtNum(boxesPerDay) + ' กล่อง', sub: 'กำลังผลิต ' + fmtNum(k.boxesPerDayCapacity) + ' กล่อง/วัน', tone: 'neutral' },
    { icon: '💰', label: 'ยอดขายประมาณการ', value: fmtBaht(revenue), sub: yf > 1 ? 'โตจากปีที่ 1 ' + fmtPct((yf - 1) * 100, 0) : 'ปีที่ 1', tone: 'positive' },
    { icon: '📈', label: 'EBITDA', value: fmtBaht(ebitda), sub: fmtPct(revenue ? (ebitda / revenue) * 100 : 0) + ' ของยอดขาย', tone: ebitda >= 0 ? 'positive' : 'negative' },
    { icon: '🧾', label: 'ราคาเฉลี่ยต่อกล่อง', value: fmtNum(k.avgPricePerBox) + ' บาท', sub: 'ช่วงราคา ' + data.business.priceRange.min + '-' + data.business.priceRange.max + ' บาท', tone: 'neutral' },
    { icon: '🎯', label: 'จุดคุ้มทุน', value: fmtNum(k.breakEvenBoxesPerMonth) + ' กล่อง/เดือน', sub: 'คาดถึงในเดือนที่ ' + k.breakEvenMonth, tone: 'positive' },
    { icon: '⚙️', label: 'อัตราใช้กำลังผลิต', value: fmtPct(utilization), sub: utilization > 90 ? 'ใกล้เต็มกำลัง' : 'ยังรับงานเพิ่มได้', tone: utilization > 90 ? 'negative' : 'positive' },
    { icon: '👥', label: 'ลูกค้าที่คาดว่าจะได้', value: fmtNum(customers) + ' คน', sub: 'สั่งซ้ำ ' + fmtPct(varyPercent(k.repeatRatePct, f, { seed: 5 })), tone: 'positive' },
    { icon: '🏦', label: 'เงินลงทุนเริ่มต้น', value: fmtBaht(k.initialInvestment), sub: 'คืนทุนราวเดือนที่ ' + k.paybackMonths, tone: 'neutral' }
  ];

  const highlights = data.highlights.map(h => ({ badge: h.badge, tone: h.tone, text: h.text }));

  root.innerHTML =
    assumptionBar('ตัวเลขทั้งหมดเป็น <strong>ประมาณการตามแผนธุรกิจ</strong> (ยังไม่ใช่ยอดขายจริง) — ' + data.business.concept) +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('ยอดขายและ EBITDA รายเดือน ปีที่ 1', 'chart-ov-ramp', { tall: true, note: 'EBITDA เริ่มเป็นบวกในเดือนที่ ' + data.kpi.breakEvenMonth }),
      chartCard('กล่องต่อวัน เทียบกำลังผลิต', 'chart-ov-capacity')
    ) +
    chartGrid(
      chartCard('สัดส่วนยอดขายตามช่องทาง', 'chart-ov-channel', { tall: true }),
      chartCard('สัดส่วนยอดขายตามหมวดเมนู', 'chart-ov-menu', { tall: true })
    ) +
    noteBox('🥗 สรุปประเด็นสำคัญ', highlights);


  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('overview', { data, filters: f }));
  // --- กราฟ: ยอดขาย + EBITDA รายเดือน ---
  const ramp = data.monthlyRamp;
  const revSeries = varyArray(ramp.revenue, f, { startSeed: 10, asInt: true });
  const ebitdaSeries = ramp.ebitda.map((v, i) => varyValue(Math.abs(v), f, { seed: 30 + i, asInt: true }) * (v < 0 ? -1 : 1));
  const slicedRev = getMonthSlice(ramp.labels, revSeries, f);
  const slicedEbitda = getMonthSlice(ramp.labels, ebitdaSeries, f);

  createChart('chart-ov-ramp', {
    type: 'bar',
    data: {
      labels: slicedRev.labels,
      datasets: [
        {
          type: 'line',
          label: 'ยอดขาย (บาท)',
          data: slicedRev.data,
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22,163,74,0.12)',
          fill: true, tension: 0.3, borderWidth: 2.5,
          pointRadius: 3, pointBackgroundColor: '#16a34a',
          yAxisID: 'y'
        },
        {
          label: 'EBITDA (บาท)',
          data: slicedEbitda.data,
          backgroundColor: slicedEbitda.data.map(v => v >= 0 ? 'rgba(0,191,165,0.75)' : 'rgba(225,29,72,0.75)'),
          borderRadius: 5,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: legendOpts(),
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtBaht(ctx.parsed.y) } }
      },
      scales: {
        x: baseScales().x,
        y: {
          ...baseScales({ yCallback: v => (v / 1e6).toFixed(1) + ' ล.' }).y,
          position: 'left'
        },
        y1: {
          ...baseScales({ yCallback: v => (v / 1e3).toFixed(0) + 'k' }).y,
          position: 'right',
          beginAtZero: false,
          grid: { drawOnChartArea: false }
        }
      }
    }
  });

  // --- กราฟ: กล่อง/วัน เทียบกำลังผลิต ---
  const boxSeries = varyArray(ramp.boxesPerDay, f, { startSeed: 50, asInt: true });
  const slicedBoxes = getMonthSlice(ramp.labels, boxSeries, f);
  const capacityLine = slicedBoxes.labels.map(() => data.kpi.boxesPerDayCapacity);

  createChart('chart-ov-capacity', {
    type: 'line',
    data: {
      labels: slicedBoxes.labels,
      datasets: [
        {
          label: 'กล่อง/วัน (แผน)',
          data: slicedBoxes.data,
          borderColor: '#00bfa5', backgroundColor: 'rgba(0,191,165,0.12)',
          fill: true, tension: 0.3, borderWidth: 2.5, pointRadius: 3
        },
        {
          label: 'กำลังผลิตสูงสุด',
          data: capacityLine,
          borderColor: '#e11d48', borderDash: [6, 4], borderWidth: 2,
          pointRadius: 0, fill: false
        }
      ]
    },
    options: {
      plugins: {
        legend: legendOpts(),
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtNum(ctx.parsed.y) + ' กล่อง' } }
      },
      scales: baseScales({ yCallback: v => fmtNum(v) })
    }
  });

  // --- กราฟ: สัดส่วนช่องทาง ---
  createChart('chart-ov-channel', {
    type: 'doughnut',
    data: {
      labels: data.revenueByChannel.map(c => c.name),
      datasets: [{
        data: data.revenueByChannel.map(c => c.sharePct),
        backgroundColor: CHART_COLORS.slice(0, data.revenueByChannel.length),
        borderColor: 'rgba(255,255,255,0.75)', borderWidth: 2
      }]
    },
    options: {
      cutout: '52%',
      plugins: {
        legend: legendOpts(),
        tooltip: {
          callbacks: {
            label: ctx => ctx.label + ': ' + ctx.parsed + '%',
            afterLabel: ctx => data.revenueByChannel[ctx.dataIndex].note
          }
        }
      }
    }
  });

  // --- กราฟ: สัดส่วนหมวดเมนู ---
  createChart('chart-ov-menu', {
    type: 'doughnut',
    data: {
      labels: data.menuMix.map(m => m.name),
      datasets: [{
        data: data.menuMix.map(m => m.sharePct),
        backgroundColor: ['#16a34a', '#00bfa5', '#84cc16', '#0ea5e9', '#f59e0b', '#e11d48'],
        borderColor: 'rgba(255,255,255,0.75)', borderWidth: 2
      }]
    },
    options: {
      cutout: '52%',
      plugins: {
        legend: legendOpts(),
        tooltip: { callbacks: { label: ctx => ctx.label + ': ' + ctx.parsed + '%' } }
      }
    }
  });
}

export async function mount(container) {
  const thisMount = ++mountId;
  container.innerHTML = loadingHTML();

  try {
    const data = await fetchJSON('/data/overview.json');
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">
      ${buildFilterBar([YEAR_FILTER, PERIOD_FILTER, CHANNEL_FILTER, REGION_FILTER])}
      <div class="ov-body"></div>
    </div>`;

    const body = container.querySelector('.ov-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('overview mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
