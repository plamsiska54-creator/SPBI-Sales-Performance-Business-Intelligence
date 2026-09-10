/**
 * fin-pnl.js — ประมาณการกำไรขาดทุน 3 ปี
 */

import { createChart, destroyAll } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import {
  buildFilterBar, onFilterChange, getFilterValues,
  SCENARIO_FILTER, YEAR_FILTER
} from '../../shared/filter-builder.js';
import { getScenarioFactor } from '../../shared/filter-data.js';
import {
  kpiGrid, chartCard, chartGrid, panel, dataTable, noteBox, assumptionBar,
  fmtNum, fmtBaht, fmtPct, baseScales, legendOpts, loadingHTML, errorHTML
} from '../../shared/ui-kit.js';
import { aiPanel } from '../../shared/ai-analyst.js';

let mountId = 0;
let filterCleanup = null;

const YEAR_INDEX = { '2569': 0, '2570': 1, '2571': 2 };

/** ปรับงบกำไรขาดทุนตามสถานการณ์: ยอดขายและต้นทุนผันแปรเปลี่ยน ค่าใช้จ่ายคงที่ไม่เปลี่ยน */
function scaleYear(y, sf) {
  const boxes = Math.round(y.boxes * sf);
  const revenue = Math.round(y.revenue * sf);
  const cogs = Math.round(y.cogs * sf);
  const deliveryAndFees = Math.round(y.deliveryAndFees * sf);
  const grossProfit = revenue - cogs;
  const contribution = grossProfit - deliveryAndFees;
  const ebitda = contribution - y.fixedCosts;
  const ebit = ebitda - y.depreciation;
  const pbt = ebit - y.interest;
  const tax = pbt > 0 ? Math.round(pbt * 0.2) : 0;
  const netProfit = pbt - tax;
  return {
    ...y, boxes, revenue, cogs, grossProfit, deliveryAndFees, contribution,
    ebitda, ebit, pbt, tax, netProfit,
    grossMarginPct: +((grossProfit / revenue) * 100).toFixed(1),
    ebitdaMarginPct: +((ebitda / revenue) * 100).toFixed(1),
    netMarginPct: +((netProfit / revenue) * 100).toFixed(1)
  };
}

function renderContent(root, data, f) {
  destroyAll();

  const sf = getScenarioFactor(f);
  const years = data.pnl.years.map(y => scaleYear(y, sf));
  const idx = YEAR_INDEX[f.year] !== undefined ? YEAR_INDEX[f.year] : 0;
  const y = years[idx];

  const kpis = [
    { icon: '🍱', label: 'จำนวนกล่องที่ขาย', value: fmtNum(y.boxes) + ' กล่อง', sub: y.year, tone: 'neutral' },
    { icon: '💰', label: 'ยอดขาย', value: fmtBaht(y.revenue), sub: idx > 0 ? 'โตจากปีก่อน ' + fmtPct(((y.revenue / years[idx - 1].revenue) - 1) * 100, 0) : 'ปีแรก', tone: 'positive' },
    { icon: '📗', label: 'กำไรขั้นต้น', value: fmtBaht(y.grossProfit), sub: fmtPct(y.grossMarginPct), tone: 'positive' },
    { icon: '📈', label: 'EBITDA', value: fmtBaht(y.ebitda), sub: fmtPct(y.ebitdaMarginPct), tone: y.ebitda >= 0 ? 'positive' : 'negative' },
    { icon: '🏭', label: 'ค่าใช้จ่ายคงที่', value: fmtBaht(y.fixedCosts), sub: fmtNum(Math.round(y.fixedCosts / 12)) + ' บาท/เดือน', tone: 'negative' },
    { icon: '🚚', label: 'ค่าส่ง + ค่าธรรมเนียม', value: fmtBaht(y.deliveryAndFees), sub: fmtPct((y.deliveryAndFees / y.revenue) * 100) + ' ของยอดขาย', tone: 'negative' },
    { icon: '🧾', label: 'ภาษีเงินได้', value: fmtBaht(y.tax), sub: y.tax ? 'อัตรา 20%' : 'ยังไม่มีกำไรที่ต้องเสียภาษี', tone: 'neutral' },
    { icon: '💵', label: 'กำไรสุทธิ', value: fmtBaht(y.netProfit), sub: fmtPct(y.netMarginPct), tone: y.netProfit >= 0 ? 'positive' : 'negative' }
  ];

  const lineItems = [
    { key: 'revenue', label: 'ยอดขาย' },
    { key: 'cogs', label: 'หัก: ต้นทุนขาย (วัตถุดิบ+บรรจุภัณฑ์+ค่าแรงครัว)' },
    { key: 'grossProfit', label: 'กำไรขั้นต้น' },
    { key: 'deliveryAndFees', label: 'หัก: ค่าจัดส่ง + ค่าธรรมเนียมช่องทาง' },
    { key: 'contribution', label: 'กำไรส่วนเกิน (Contribution)' },
    { key: 'fixedCosts', label: 'หัก: ค่าใช้จ่ายคงที่' },
    { key: 'ebitda', label: 'EBITDA' },
    { key: 'depreciation', label: 'หัก: ค่าเสื่อมราคา/ตัดจ่าย' },
    { key: 'ebit', label: 'กำไรจากการดำเนินงาน (EBIT)' },
    { key: 'interest', label: 'หัก: ดอกเบี้ยจ่าย' },
    { key: 'pbt', label: 'กำไรก่อนภาษี' },
    { key: 'tax', label: 'หัก: ภาษีเงินได้' },
    { key: 'netProfit', label: 'กำไรสุทธิ' }
  ];

  const pnlRows = lineItems.map(li => ({
    label: li.label,
    y1: years[0][li.key],
    y2: years[1][li.key],
    y3: years[2][li.key],
    pctY1: years[0].revenue ? (years[0][li.key] / years[0].revenue) * 100 : 0
  }));

  root.innerHTML =
    assumptionBar('ประมาณการนี้ <strong>ไม่ใช่การรับประกันผลลัพธ์</strong> — สมมติฐานหลัก: ' + data.pnl.assumptions[0]) +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('ยอดขาย EBITDA และกำไรสุทธิ 3 ปี', 'chart-fp-trend', { tall: true }),
      chartCard('อัตรากำไรแต่ละระดับ (%)', 'chart-fp-margin', { tall: true })
    ) +
    panel('งบกำไรขาดทุนประมาณการ 3 ปี (บาท)', dataTable([
      { key: 'label', label: 'รายการ' },
      { key: 'y1', label: years[0].year, align: 'right', fmt: v => fmtNum(v) },
      { key: 'y2', label: years[1].year, align: 'right', fmt: v => fmtNum(v) },
      { key: 'y3', label: years[2].year, align: 'right', fmt: v => fmtNum(v) },
      { key: 'pctY1', label: '% ยอดขาย (ปีที่ 1)', align: 'right', fmt: v => fmtPct(v) }
    ], pnlRows)) +
    chartGrid(
      chartCard('โครงสร้างต้นทุนต่อยอดขาย ' + y.year, 'chart-fp-structure', { tall: true }),
      panel('สมมติฐานสำคัญ',
        '<ul style="margin-left:18px;line-height:1.9;font-size:var(--font-size-sm);color:var(--text-primary)">'
        + data.pnl.assumptions.map(a => '<li>' + a + '</li>').join('')
        + '</ul>',
        { note: data.note }
      )
    ) +
    noteBox('💵 อ่านงบนี้อย่างไร', [
      { badge: 'ปีที่ 1', tone: 'warning', text: 'กำไรสุทธิเกือบเท่าทุน (' + fmtBaht(years[0].netProfit) + ') — ปีแรกคือการสร้างฐานลูกค้า ไม่ใช่ปีที่ทำกำไร แต่ EBITDA เป็นบวกแล้วถือว่าธุรกิจเลี้ยงตัวเองได้' },
      { badge: 'ปีที่ 2', tone: 'opportunity', text: 'กำไรสุทธิขึ้นเป็น ' + fmtBaht(years[1].netProfit) + ' (' + fmtPct(years[1].netMarginPct) + ') เพราะยอดขายโตเร็วกว่าค่าใช้จ่ายคงที่ — นี่คือจุดที่ธุรกิจเริ่มคุ้มค่าที่จะลงทุน' },
      { badge: 'ปีที่ 3', tone: 'opportunity', text: 'ต้องเปิดครัวที่ 2 ทำให้ค่าใช้จ่ายคงที่เพิ่มเป็น 1.05 ลบ./เดือน แต่กำไรสุทธิยังโตถึง ' + fmtBaht(years[2].netProfit) },
      { badge: 'ตัวเลขที่เปราะบาง', tone: 'alert', text: 'กำไรปีแรกไหวตัวง่ายมาก — ยอดขายพลาดเป้า 10% หรือต้นทุนวัตถุดิบขึ้น 10% ก็พลิกเป็นขาดทุนได้ ต้องดูรายงานรายสัปดาห์' }
    ]);


  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('fin-pnl', { data, filters: f }));
  // --- แนวโน้ม 3 ปี ---
  createChart('chart-fp-trend', {
    type: 'bar',
    data: {
      labels: years.map(x => x.year),
      datasets: [
        { label: 'ยอดขาย', data: years.map(x => x.revenue), backgroundColor: 'rgba(22,163,74,0.8)', borderRadius: 5 },
        { label: 'EBITDA', data: years.map(x => x.ebitda), backgroundColor: 'rgba(0,191,165,0.85)', borderRadius: 5 },
        { label: 'กำไรสุทธิ', data: years.map(x => x.netProfit), backgroundColor: years.map(x => x.netProfit >= 0 ? 'rgba(14,165,233,0.85)' : 'rgba(225,29,72,0.85)'), borderRadius: 5 }
      ]
    },
    options: {
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtBaht(ctx.parsed.y) } } },
      scales: baseScales({ yCallback: v => (v / 1e6).toFixed(0) + ' ล.', beginAtZero: true })
    }
  });

  // --- อัตรากำไร ---
  createChart('chart-fp-margin', {
    type: 'line',
    data: {
      labels: years.map(x => x.year),
      datasets: [
        { label: 'กำไรขั้นต้น (%)', data: years.map(x => x.grossMarginPct), borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.10)', borderWidth: 2.5, tension: 0.3, pointRadius: 4, fill: true },
        { label: 'EBITDA (%)', data: years.map(x => x.ebitdaMarginPct), borderColor: '#00bfa5', borderWidth: 2.5, tension: 0.3, pointRadius: 4 },
        { label: 'กำไรสุทธิ (%)', data: years.map(x => x.netMarginPct), borderColor: '#0ea5e9', borderWidth: 2.5, tension: 0.3, pointRadius: 4 }
      ]
    },
    options: {
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtPct(ctx.parsed.y) } } },
      scales: baseScales({ yCallback: v => v + '%', beginAtZero: false })
    }
  });

  // --- โครงสร้างต้นทุนของปีที่เลือก ---
  createChart('chart-fp-structure', {
    type: 'doughnut',
    data: {
      labels: ['ต้นทุนขาย', 'ค่าส่ง + ค่าธรรมเนียม', 'ค่าใช้จ่ายคงที่', 'ค่าเสื่อม + ดอกเบี้ย + ภาษี', 'กำไรสุทธิ'],
      datasets: [{
        data: [
          y.cogs,
          y.deliveryAndFees,
          y.fixedCosts,
          y.depreciation + y.interest + y.tax,
          Math.max(0, y.netProfit)
        ],
        backgroundColor: ['#e11d48', '#f59e0b', '#94a3b8', '#a855f7', '#16a34a'],
        borderColor: 'rgba(255,255,255,0.75)', borderWidth: 2
      }]
    },
    options: {
      cutout: '52%',
      plugins: {
        legend: legendOpts(),
        tooltip: { callbacks: { label: ctx => ctx.label + ': ' + fmtBaht(ctx.parsed) } }
      }
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
      ${buildFilterBar([YEAR_FILTER, SCENARIO_FILTER])}
      <div class="fp-body"></div>
    </div>`;

    const body = container.querySelector('.fp-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('fin-pnl mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
