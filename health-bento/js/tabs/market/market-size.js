/**
 * market-size.js — ขนาดตลาดและการเติบโต (TAM / SAM / SOM)
 */

import { createChart, destroyAll } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import {
  buildFilterBar, onFilterChange, getFilterValues,
  YEAR_FILTER, REGION_FILTER
} from '../../shared/filter-builder.js';
import { varyPercent, getRegionFactor } from '../../shared/filter-data.js';
import {
  kpiGrid, chartCard, chartGrid, panel, dataTable, noteBox, assumptionBar,
  fmtNum, fmtPct, pill, baseScales, legendOpts, loadingHTML, errorHTML
} from '../../shared/ui-kit.js';
import { aiPanel } from '../../shared/ai-analyst.js';

let mountId = 0;
let filterCleanup = null;

function renderContent(root, data, f) {
  destroyAll();

  const rf = getRegionFactor(f);
  const ms = data.marketSize;

  const kpis = [
    { icon: '🌏', label: 'TAM — ตลาดอาหารสุขภาพพร้อมทาน', value: fmtNum(Math.round(ms.tam.valueMB)) + ' ลบ.', sub: 'โต ' + fmtPct(ms.tam.growthPct) + ' ต่อปี', tone: 'positive' },
    { icon: '🎯', label: 'SAM — ข้าวกล่องคลีนในเขตที่เราส่ง', value: fmtNum(Math.round(ms.sam.valueMB * rf)) + ' ลบ.', sub: 'โต ' + fmtPct(ms.sam.growthPct) + ' ต่อปี', tone: 'positive' },
    { icon: '🍱', label: 'SOM — เป้าของ Health Bento ใน 3 ปี', value: fmtNum(Math.round(ms.som.valueMB)) + ' ลบ.', sub: 'คิดเป็น ' + fmtPct((ms.som.valueMB / ms.sam.valueMB) * 100) + ' ของ SAM', tone: 'neutral' },
    { icon: '📊', label: 'ส่วนแบ่งที่ต้องชนะในปีที่ 1', value: fmtPct((20.9 / (ms.sam.valueMB * rf)) * 100, 2), sub: 'ยอดขายปีที่ 1 ราว 20.9 ลบ.', tone: 'neutral' }
  ];

  const driverRows = data.drivers.map(d => ({
    name: d.name,
    impact: d.impact,
    tone: d.tone === 'positive' ? pill('ปัจจัยหนุน', 'positive') : pill('ปัจจัยกดดัน', 'negative')
  }));

  root.innerHTML =
    assumptionBar('ขนาดตลาดเป็น <strong>การประมาณการเพื่อวางแผน</strong> — ' + data.note) +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('มูลค่าตลาดข้าวกล่องคลีน (ล้านบาท)', 'chart-mk-growth', { tall: true }),
      chartCard('ดัชนีความต้องการตามฤดูกาล (%)', 'chart-mk-season', { tall: true, note: data.seasonality.note })
    ) +
    chartGrid(
      chartCard('TAM / SAM / SOM (ล้านบาท, สเกลลอการิทึม)', 'chart-mk-funnel'),
      panel('ปัจจัยที่มีผลต่อตลาด', dataTable([
        { key: 'name', label: 'ปัจจัย' },
        { key: 'impact', label: 'ระดับผล', align: 'center' },
        { key: 'tone', label: 'ทิศทาง', align: 'center' }
      ], driverRows))
    ) +
    noteBox('📌 สิ่งที่ตัวเลขนี้บอก', [
      { badge: 'ขนาดตลาดพอ', tone: 'opportunity', text: 'SAM ' + fmtNum(ms.sam.valueMB) + ' ล้านบาท เทียบกับเป้าปีที่ 1 ที่ 20.9 ล้านบาท คิดเป็นเพียง ' + fmtPct((20.9 / ms.sam.valueMB) * 100, 2) + ' ของตลาด — เป้าหมายไม่ได้ฝืนขนาดตลาด' },
      { badge: 'จังหวะเปิดตัว', tone: 'info', text: 'ควรเปิดขายก่อนเดือนมกราคม เพราะดัชนีความต้องการเดือน ม.ค. สูงสุดที่ ' + fmtPct(data.seasonality.indexPct[0], 0) + ' จากกระแสตั้งเป้าลดน้ำหนักต้นปี' },
      { badge: 'ต้องระวัง', tone: 'warning', text: 'เมษายนและธันวาคมยอดตกจากวันหยุดยาว — วางแผนกระแสเงินสดและลดการสั่งวัตถุดิบล่วงหน้าในสองเดือนนี้' },
      { badge: 'ข้อจำกัดของข้อมูล', tone: 'alert', text: 'ตัวเลขตลาดยังไม่ได้ยืนยันกับรายงานวิจัยฉบับจริง ควรซื้อรายงานตลาดหรือสำรวจลูกค้าจริง 200-300 คน ก่อนตัดสินใจลงทุนก้อนใหญ่' }
    ]);


  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('market-size', { data, filters: f }));
  // --- มูลค่าตลาดรายปี + อัตราเติบโต ---
  const g = data.growthByYear;
  createChart('chart-mk-growth', {
    type: 'bar',
    data: {
      labels: g.labels,
      datasets: [
        {
          label: 'มูลค่าตลาด (ลบ.)',
          data: g.marketMB.map(v => Math.round(v * rf)),
          backgroundColor: 'rgba(22,163,74,0.75)',
          borderRadius: 6,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'อัตราเติบโต (%)',
          data: g.growthPct,
          borderColor: '#f59e0b', backgroundColor: '#f59e0b',
          borderWidth: 2.5, tension: 0.3, pointRadius: 4,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      plugins: { legend: legendOpts() },
      scales: {
        x: baseScales().x,
        y: baseScales({ yCallback: v => fmtNum(v) }).y,
        y1: {
          ...baseScales({ yCallback: v => v + '%' }).y,
          position: 'right',
          grid: { drawOnChartArea: false }
        }
      }
    }
  });

  // --- ฤดูกาล ---
  const seasonData = data.seasonality.indexPct.map((v, i) => varyPercent(v, f, { seed: 60 + i }));
  createChart('chart-mk-season', {
    type: 'line',
    data: {
      labels: data.seasonality.labels,
      datasets: [{
        label: 'ดัชนีความต้องการ (100 = เฉลี่ย)',
        data: seasonData,
        borderColor: '#00bfa5', backgroundColor: 'rgba(0,191,165,0.14)',
        fill: true, tension: 0.35, borderWidth: 2.5,
        pointRadius: 4, pointBackgroundColor: seasonData.map(v => v >= 105 ? '#16a34a' : v <= 95 ? '#e11d48' : '#00bfa5')
      }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => 'ดัชนี ' + ctx.parsed.y } } },
      scales: baseScales({ yCallback: v => v + '%', beginAtZero: false })
    }
  });

  // --- TAM/SAM/SOM ---
  createChart('chart-mk-funnel', {
    type: 'bar',
    data: {
      labels: ['TAM', 'SAM', 'SOM'],
      datasets: [{
        label: 'มูลค่า (ลบ.)',
        data: [ms.tam.valueMB, Math.round(ms.sam.valueMB * rf), ms.som.valueMB],
        backgroundColor: ['rgba(14,165,233,0.75)', 'rgba(0,191,165,0.8)', 'rgba(22,163,74,0.85)'],
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => fmtNum(ctx.parsed.x) + ' ล้านบาท',
            afterLabel: ctx => [ms.tam.label, ms.sam.label, ms.som.label][ctx.dataIndex]
          }
        }
      },
      scales: {
        x: {
          type: 'logarithmic',
          ticks: { color: baseScales().x.ticks.color, callback: v => fmtNum(v) },
          grid: baseScales().x.grid
        },
        y: baseScales().y
      }
    }
  });
}

export async function mount(container) {
  const thisMount = ++mountId;
  container.innerHTML = loadingHTML();

  try {
    const data = await fetchJSON('/data/market.json');
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">
      ${buildFilterBar([YEAR_FILTER, REGION_FILTER])}
      <div class="mk-body"></div>
    </div>`;

    const body = container.querySelector('.mk-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('market-size mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
