/**
 * fin-breakeven.js — จุดคุ้มทุนและกระแสเงินสด 24 เดือน
 */

import { createChart, destroyAll } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import {
  buildFilterBar, onFilterChange, getFilterValues,
  SCENARIO_FILTER
} from '../../shared/filter-builder.js';
import { getScenarioFactor } from '../../shared/filter-data.js';
import {
  kpiGrid, chartCard, chartGrid, panel, dataTable, noteBox, assumptionBar,
  fmtNum, fmtBaht, fmtPct, pill, baseScales, legendOpts, loadingHTML, errorHTML
} from '../../shared/ui-kit.js';
import { aiPanel } from '../../shared/ai-analyst.js';

let mountId = 0;
let filterCleanup = null;

function renderContent(root, data, f) {
  destroyAll();

  const be = data.breakEven;
  const cf = data.cashFlow;
  const sf = getScenarioFactor(f);
  const scenario = data.scenarios.find(s => s.id === (f.scenario || 'base')) || data.scenarios[1];

  // กระแสเงินสดปรับตามสถานการณ์: EBITDA เปลี่ยน แต่ภาระหนี้คงที่
  const debtService = 33000;
  const netCash = cf.netCash.map(v => Math.round((v + debtService) * sf - debtService));
  const cumulative = [];
  netCash.reduce((acc, v) => {
    const next = acc + v;
    cumulative.push(next);
    return next;
  }, cf.openingCash);

  const lowest = Math.min(...cumulative);
  const lowestMonth = cumulative.indexOf(lowest) + 1;
  const paybackMonth = cumulative.findIndex((v, i) => v >= cf.openingCash + 4000000) + 1;
  const beMonth = netCash.findIndex(v => v > 0) + 1;

  const kpis = [
    { icon: '🎯', label: 'จุดคุ้มทุน (กล่อง/เดือน)', value: fmtNum(be.boxesPerMonth), sub: fmtNum(be.boxesPerDay) + ' กล่อง/วัน', tone: 'neutral' },
    { icon: '💰', label: 'ยอดขายที่จุดคุ้มทุน', value: fmtBaht(be.revenuePerMonth), sub: 'ต่อเดือน', tone: 'neutral' },
    { icon: '⚙️', label: 'ใช้กำลังผลิตที่จุดคุ้มทุน', value: fmtPct(be.capacityUtilizationAtBePct), sub: 'จากกำลังผลิต 800 กล่อง/วัน', tone: 'positive' },
    { icon: '📅', label: 'เดือนที่กระแสเงินสดเป็นบวก', value: beMonth > 0 ? 'เดือนที่ ' + beMonth : 'ไม่ถึงใน 24 เดือน', sub: scenario.name, tone: beMonth > 0 && beMonth <= 8 ? 'positive' : 'negative' },
    { icon: '🛟', label: 'เงินสดต่ำสุด', value: fmtBaht(lowest), sub: 'เดือนที่ ' + lowestMonth, tone: lowest > 200000 ? 'positive' : 'negative' },
    { icon: '🏦', label: 'คืนทุนเงินลงทุน 4 ลบ.', value: paybackMonth > 0 ? 'เดือนที่ ' + paybackMonth : 'เกิน 24 เดือน', sub: 'นับจากเปิดขาย', tone: paybackMonth > 0 && paybackMonth <= 24 ? 'positive' : 'negative' },
    { icon: '💵', label: 'เงินสดสิ้นเดือนที่ 24', value: fmtBaht(cumulative[cumulative.length - 1]), sub: 'ก่อนจ่ายเงินปันผล', tone: 'positive' },
    { icon: '📌', label: 'กำไรส่วนเกินต่อกล่อง', value: fmtNum(be.contributionPerBox) + ' บาท', sub: 'ตัวเลขที่ต้องรักษาให้ได้', tone: 'positive' }
  ];

  const sensRows = be.sensitivity.map(s => ({
    label: s.label,
    contributionPerBox: s.contributionPerBox,
    boxesPerMonth: s.boxesPerMonth,
    boxesPerDay: s.boxesPerDay,
    delta: s.boxesPerDay - be.boxesPerDay,
    status: s.boxesPerDay <= 400 ? pill('รับได้', 'positive') : s.boxesPerDay <= 450 ? pill('ตึง', 'warning') : pill('เสี่ยง', 'negative')
  }));

  const scenarioRows = data.scenarios.map(s => ({
    name: s.name,
    boxesY1: s.boxesY1,
    revenueY1: s.revenueY1,
    ebitdaY1: s.ebitdaY1,
    breakEvenMonth: s.breakEvenMonth ? 'เดือนที่ ' + s.breakEvenMonth : 'ไม่ถึงในปีแรก',
    action: s.action
  }));

  root.innerHTML =
    assumptionBar('จุดคุ้มทุนคำนวณจาก <strong>ค่าใช้จ่ายคงที่ ' + fmtNum(be.fixedCostPerMonth) + ' บาท/เดือน ÷ กำไรส่วนเกิน ' + be.contributionPerBox + ' บาท/กล่อง</strong> — ' + cf.note) +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('กระแสเงินสดสะสม 24 เดือน (บาท)', 'chart-fb-cash', { tall: true, note: 'เส้นสีแดงคือระดับ 0 บาท — ถ้าเส้นสะสมลงต่ำกว่านี้ต้องใช้วงเงินสำรอง' }),
      chartCard('กระแสเงินสดสุทธิรายเดือน (บาท)', 'chart-fb-net', { tall: true })
    ) +
    chartGrid(
      chartCard('รายได้ เทียบ ต้นทุนรวม ตามจำนวนกล่องที่ขาย', 'chart-fb-be', { tall: true, note: 'จุดที่สองเส้นตัดกันคือจุดคุ้มทุน ' + fmtNum(be.boxesPerMonth) + ' กล่อง/เดือน' }),
      chartCard('จุดคุ้มทุนเมื่อสมมติฐานเปลี่ยน (กล่อง/วัน)', 'chart-fb-sens', { tall: true })
    ) +
    panel('ความอ่อนไหวของจุดคุ้มทุน', dataTable([
      { key: 'label', label: 'สมมติฐานที่เปลี่ยน' },
      { key: 'contributionPerBox', label: 'กำไรส่วนเกิน/กล่อง', align: 'right', fmt: v => fmtNum(v) },
      { key: 'boxesPerMonth', label: 'ต้องขาย (กล่อง/เดือน)', align: 'right', fmt: v => fmtNum(v) },
      { key: 'boxesPerDay', label: 'ต้องขาย (กล่อง/วัน)', align: 'right', fmt: v => fmtNum(v) },
      { key: 'delta', label: 'เทียบกรณีฐาน', align: 'right', fmt: v => (v > 0 ? '+' : '') + fmtNum(v) + ' กล่อง/วัน' },
      { key: 'status', label: 'ประเมิน', align: 'center' }
    ], sensRows)) +
    panel('เปรียบเทียบ 3 สถานการณ์ (ปีที่ 1)', dataTable([
      { key: 'name', label: 'สถานการณ์' },
      { key: 'boxesY1', label: 'กล่องทั้งปี', align: 'right', fmt: v => fmtNum(v) },
      { key: 'revenueY1', label: 'ยอดขาย', align: 'right', fmt: v => fmtNum(v) },
      { key: 'ebitdaY1', label: 'EBITDA', align: 'right', fmt: v => fmtNum(v) },
      { key: 'breakEvenMonth', label: 'คุ้มทุนเมื่อ' },
      { key: 'action', label: 'สิ่งที่ต้องทำ' }
    ], scenarioRows)) +
    noteBox('🧮 สิ่งที่ผู้บริหารต้องเฝ้าดู', [
      { badge: 'ตัวเลขวันต่อวัน', tone: 'info', text: 'ต้องขายให้ได้ ' + fmtNum(be.boxesPerDay) + ' กล่อง/วัน จึงจะไม่ขาดทุน — เขียนเลขนี้ไว้บนกระดานในครัวและอัปเดตทุกเช้า' },
      { badge: 'เงินสดสำคัญกว่ากำไร', tone: 'alert', text: 'เงินสดต่ำสุด ' + fmtBaht(lowest) + ' ในเดือนที่ ' + lowestMonth + ' — ต้องมีวงเงินสำรอง 500,000 บาทพร้อมใช้ก่อนเปิดขาย' },
      { badge: 'จุดพลิก', tone: 'opportunity', text: 'ทุก 10 บาทที่เพิ่มกำไรส่วนเกินต่อกล่อง ลดจุดคุ้มทุนได้ราว 55 กล่อง/วัน — การดึงลูกค้าจากแอปมา LINE OA จึงมีผลมากกว่าการลดราคา' },
      { badge: 'กรณีแย่', tone: 'warning', text: 'ถ้ายอดขายต่ำกว่าแผน 28% ปีแรกจะขาดทุนระดับ EBITDA ราว 1.2 ล้านบาท — แผนรับมือคือลดเหลือ 1 กะและตัดเมนูที่ขายช้า' }
    ]);


  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('fin-breakeven', { data, filters: f }));
  // --- กระแสเงินสดสะสม ---
  createChart('chart-fb-cash', {
    type: 'line',
    data: {
      labels: cf.labels,
      datasets: [
        {
          label: 'เงินสดสะสม (บาท)',
          data: cumulative,
          borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.12)',
          fill: true, tension: 0.3, borderWidth: 2.5, pointRadius: 3
        },
        {
          label: 'ระดับ 0 บาท',
          data: cf.labels.map(() => 0),
          borderColor: '#e11d48', borderDash: [6, 4], borderWidth: 2, pointRadius: 0
        }
      ]
    },
    options: {
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtBaht(ctx.parsed.y) } } },
      scales: baseScales({ yCallback: v => (v / 1e6).toFixed(1) + ' ล.', beginAtZero: false })
    }
  });

  // --- กระแสเงินสดรายเดือน ---
  createChart('chart-fb-net', {
    type: 'bar',
    data: {
      labels: cf.labels,
      datasets: [{
        label: 'เงินสดสุทธิ (บาท)',
        data: netCash,
        backgroundColor: netCash.map(v => v >= 0 ? 'rgba(0,191,165,0.8)' : 'rgba(225,29,72,0.8)'),
        borderRadius: 4
      }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => fmtBaht(ctx.parsed.y) } } },
      scales: baseScales({ yCallback: v => (v / 1000).toFixed(0) + 'k', beginAtZero: false })
    }
  });

  // --- กราฟจุดคุ้มทุน ---
  const steps = [0, 3000, 6000, be.boxesPerMonth, 12000, 16000, 20000];
  const variableCostPerBox = 165 - be.contributionPerBox;
  createChart('chart-fb-be', {
    type: 'line',
    data: {
      labels: steps.map(s => fmtNum(s)),
      datasets: [
        {
          label: 'รายได้ (บาท)',
          data: steps.map(s => s * 165),
          borderColor: '#16a34a', borderWidth: 2.5, tension: 0, pointRadius: 3
        },
        {
          label: 'ต้นทุนรวม (คงที่ + ผันแปร)',
          data: steps.map(s => be.fixedCostPerMonth + s * variableCostPerBox),
          borderColor: '#e11d48', borderWidth: 2.5, tension: 0, pointRadius: 3
        }
      ]
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: legendOpts(),
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtBaht(ctx.parsed.y), title: ctx => 'ขาย ' + ctx[0].label + ' กล่อง/เดือน' } }
      },
      scales: {
        x: { ...baseScales().x, title: { display: true, text: 'จำนวนกล่องที่ขายต่อเดือน', color: baseScales().x.ticks.color } },
        y: baseScales({ yCallback: v => (v / 1e6).toFixed(1) + ' ล.' }).y
      }
    }
  });

  // --- ความอ่อนไหว ---
  createChart('chart-fb-sens', {
    type: 'bar',
    data: {
      labels: ['กรณีฐาน', ...be.sensitivity.map(s => s.label)],
      datasets: [
        {
          label: 'จุดคุ้มทุน (กล่อง/วัน)',
          data: [be.boxesPerDay, ...be.sensitivity.map(s => s.boxesPerDay)],
          backgroundColor: [be.boxesPerDay, ...be.sensitivity.map(s => s.boxesPerDay)].map(v => v <= 400 ? 'rgba(22,163,74,0.8)' : v <= 450 ? 'rgba(245,158,11,0.8)' : 'rgba(225,29,72,0.8)'),
          borderRadius: 5
        },
        {
          type: 'line',
          label: 'กำลังผลิต 800 กล่อง/วัน',
          data: [be.boxesPerDay, ...be.sensitivity.map(() => 800)].map(() => 800),
          borderColor: '#0ea5e9', borderDash: [6, 4], borderWidth: 2, pointRadius: 0
        }
      ]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => fmtNum(ctx.parsed.x) + ' กล่อง/วัน' } } },
      scales: baseScales({ xCallback: v => fmtNum(v) })
    }
  });
}

export async function mount(container) {
  const thisMount = ++mountId;
  container.innerHTML = loadingHTML();

  try {
    const data = await fetchJSON('/data/finance.json');
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">
      ${buildFilterBar([SCENARIO_FILTER])}
      <div class="fb-body"></div>
    </div>`;

    const body = container.querySelector('.fb-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('fin-breakeven mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
