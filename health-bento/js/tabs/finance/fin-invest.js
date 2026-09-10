/**
 * fin-invest.js — เงินลงทุนเริ่มต้นและแหล่งเงินทุน
 */

import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
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

const TYPE_LABEL = {
  capex: 'สินทรัพย์ถาวร',
  prepaid: 'ค่าใช้จ่ายจ่ายล่วงหน้า',
  deposit: 'เงินประกัน',
  working: 'เงินทุนหมุนเวียน'
};
const TYPE_TONE = { capex: 'info', prepaid: 'warning', deposit: 'neutral', working: 'positive' };

function renderContent(root, data, f) {
  destroyAll();

  const inv = data.investment;
  const sf = getScenarioFactor(f);
  // สถานการณ์แย่ต้องเตรียมเงินทุนหมุนเวียนมากขึ้น
  const workingExtra = sf < 1 ? 400000 : sf > 1 ? -100000 : 0;

  const items = inv.items.map(i => ({
    ...i,
    amount: i.type === 'working' ? i.amount + workingExtra : i.amount
  }));
  const total = items.reduce((s, i) => s + i.amount, 0);
  const capex = items.filter(i => i.type === 'capex').reduce((s, i) => s + i.amount, 0);
  const working = items.filter(i => i.type === 'working').reduce((s, i) => s + i.amount, 0);
  const equity = inv.funding.find(x => x.source.includes('ผู้ถือหุ้น')).amount;
  const loan = inv.funding.find(x => x.source.includes('เงินกู้')).amount;
  const gap = total - (equity + loan);

  const depreciationY1 = items
    .filter(i => i.life > 0)
    .reduce((s, i) => s + i.amount / i.life, 0);

  const kpis = [
    { icon: '🏦', label: 'เงินลงทุนเริ่มต้นรวม', value: fmtBaht(total), sub: items.length + ' รายการ', tone: 'neutral' },
    { icon: '🏭', label: 'สินทรัพย์ถาวร (Capex)', value: fmtBaht(capex), sub: fmtPct((capex / total) * 100, 0) + ' ของเงินลงทุน', tone: 'neutral' },
    { icon: '💧', label: 'เงินทุนหมุนเวียน', value: fmtBaht(working), sub: sf < 1 ? 'เพิ่มสำรองสำหรับกรณีแย่' : 'ครอบคลุมช่วงขาดทุนต้นทาง', tone: working >= 800000 ? 'positive' : 'negative' },
    { icon: '📉', label: 'ค่าเสื่อมราคา/ตัดจ่ายต่อปี', value: fmtBaht(Math.round(depreciationY1)), sub: 'หักจากกำไรก่อนภาษี', tone: 'neutral' },
    { icon: '👔', label: 'เงินจากผู้ถือหุ้น', value: fmtBaht(equity), sub: fmtPct((equity / (equity + loan)) * 100, 0) + ' ของแหล่งเงิน', tone: 'positive' },
    { icon: '🏛️', label: 'เงินกู้ธนาคาร', value: fmtBaht(loan), sub: 'ดอกเบี้ย 7% ผ่อน 5 ปี', tone: 'neutral' },
    { icon: gap > 0 ? '⚠️' : '✅', label: gap > 0 ? 'เงินที่ยังขาด' : 'สถานะเงินทุน', value: gap > 0 ? fmtBaht(gap) : 'ครบตามแผน', sub: gap > 0 ? 'ต้องเพิ่มทุนหรือขอวงเงินเพิ่ม' : 'เงินทุน = เงินลงทุน', tone: gap > 0 ? 'negative' : 'positive' },
    { icon: '🛟', label: 'วงเงินสำรองที่แนะนำ (OD)', value: fmtBaht(inv.recommendedOverdraft), sub: 'กันเงินสดขาดมือช่วงเดือนที่ 4-6', tone: 'positive' }
  ];

  const rows = items.map(i => ({
    name: i.name,
    amount: i.amount,
    pct: (i.amount / total) * 100,
    type: pill(TYPE_LABEL[i.type] || i.type, TYPE_TONE[i.type] || 'neutral'),
    life: i.life ? i.life + ' ปี' : '-',
    yearlyDep: i.life ? Math.round(i.amount / i.life) : 0
  }));

  root.innerHTML =
    assumptionBar('เงินลงทุนนี้เป็น <strong>ประมาณการ</strong> จากราคาอุปกรณ์และค่าเช่าในตลาด — ต้องขอใบเสนอราคาจริงจากผู้ขายอย่างน้อย 3 รายก่อนสรุปตัวเลข') +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('เงินลงทุนแยกตามรายการ (บาท)', 'chart-fi-items', { tall: true }),
      chartCard('สัดส่วนตามประเภทเงินลงทุน', 'chart-fi-type', { tall: true })
    ) +
    panel('รายละเอียดเงินลงทุน', dataTable([
      { key: 'name', label: 'รายการ' },
      { key: 'amount', label: 'จำนวน (บาท)', align: 'right', fmt: v => fmtNum(v) },
      { key: 'pct', label: 'สัดส่วน', align: 'right', fmt: v => fmtPct(v) },
      { key: 'type', label: 'ประเภท', align: 'center' },
      { key: 'life', label: 'อายุการใช้งาน', align: 'center' },
      { key: 'yearlyDep', label: 'ค่าเสื่อม/ปี', align: 'right', fmt: v => v ? fmtNum(v) : '-' }
    ], rows, { footer: { name: 'รวมทั้งสิ้น', amount: total, pct: 100, yearlyDep: Math.round(depreciationY1) } })) +
    chartGrid(
      chartCard('แหล่งเงินทุน', 'chart-fi-funding', { tall: true }),
      panel('เงื่อนไขแหล่งเงินทุน', dataTable([
        { key: 'source', label: 'แหล่งเงิน' },
        { key: 'amount', label: 'จำนวน (บาท)', align: 'right', fmt: v => fmtNum(v) },
        { key: 'sharePct', label: 'สัดส่วน', align: 'right', fmt: v => fmtPct(v, 1) },
        { key: 'note', label: 'เงื่อนไข' }
      ], inv.funding), { note: 'สัดส่วนหนี้ต่อทุน (D/E) = ' + (loan / equity).toFixed(2) + ' เท่า ถือว่าอยู่ในระดับที่ธนาคารรับได้' })
    ) +
    noteBox('🏦 ข้อควรพิจารณาก่อนลงเงิน', [
      { badge: 'ประหยัดได้', tone: 'opportunity', text: 'อุปกรณ์ครัวมือสองสภาพดีถูกกว่าของใหม่ 35-45% — เฉพาะตู้แช่และเตาสามารถลดเงินลงทุนได้ราว 350,000 บาท' },
      { badge: 'ทางเลือก', tone: 'info', text: 'ถ้าเงินตึง ให้เช่ารถห้องเย็นแทนซื้อ (ราว 18,000 บาท/เดือน) ลดเงินลงทุนก้อนแรก 550,000 บาท แต่ต้นทุนคงที่จะเพิ่มขึ้น' },
      { badge: 'ต้องกันไว้', tone: 'warning', text: 'เงินทุนหมุนเวียนสำคัญกว่าที่คิด — ปีแรกขาดทุนสะสมช่วงเดือนที่ 1-5 ทำให้เงินสดต่ำสุดเหลือราว 137,000 บาท' },
      { badge: 'ห้ามลืม', tone: 'alert', text: 'ค่าใบอนุญาต อย./GMP และการวางระบบต้องทำก่อนเปิดขาย ถ้าข้ามขั้นตอนนี้จะขายให้ลูกค้าองค์กรไม่ได้เลย' }
    ]);


  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('fin-invest', { data, filters: f }));
  // --- เงินลงทุนแยกรายการ ---
  createChart('chart-fi-items', {
    type: 'bar',
    data: {
      labels: items.map(i => i.name.length > 34 ? i.name.slice(0, 34) + '…' : i.name),
      datasets: [{
        label: 'จำนวน (บาท)',
        data: items.map(i => i.amount),
        backgroundColor: items.map((i, idx) => CHART_COLORS[idx % CHART_COLORS.length] + 'CC'),
        borderRadius: 5
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => fmtNum(ctx.parsed.x) + ' บาท', title: ctx => items[ctx[0].dataIndex].name } }
      },
      scales: baseScales({ xCallback: v => (v / 1000) + 'k' })
    }
  });

  // --- ตามประเภท ---
  const byType = Object.keys(TYPE_LABEL).map(t => ({
    label: TYPE_LABEL[t],
    value: items.filter(i => i.type === t).reduce((s, i) => s + i.amount, 0)
  })).filter(x => x.value > 0);

  createChart('chart-fi-type', {
    type: 'doughnut',
    data: {
      labels: byType.map(x => x.label),
      datasets: [{
        data: byType.map(x => x.value),
        backgroundColor: ['#0ea5e9', '#f59e0b', '#94a3b8', '#16a34a'],
        borderColor: 'rgba(255,255,255,0.75)', borderWidth: 2
      }]
    },
    options: {
      cutout: '52%',
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.label + ': ' + fmtNum(ctx.parsed) + ' บาท' } } }
    }
  });

  // --- แหล่งเงินทุน ---
  createChart('chart-fi-funding', {
    type: 'bar',
    data: {
      labels: ['แหล่งเงินทุน'],
      datasets: inv.funding.map((x, i) => ({
        label: x.source,
        data: [x.amount],
        backgroundColor: i === 0 ? 'rgba(22,163,74,0.85)' : 'rgba(14,165,233,0.85)',
        borderRadius: 5
      })).concat(gap > 0 ? [{
        label: 'ยังขาด',
        data: [gap],
        backgroundColor: 'rgba(225,29,72,0.85)',
        borderRadius: 5
      }] : [])
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: legendOpts(),
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtNum(ctx.parsed.x) + ' บาท' } }
      },
      scales: {
        x: { ...baseScales({ xCallback: v => (v / 1e6).toFixed(1) + ' ล.', stacked: true }).x },
        y: { ...baseScales({ stacked: true }).y }
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
      ${buildFilterBar([SCENARIO_FILTER])}
      <div class="fi-body"></div>
    </div>`;

    const body = container.querySelector('.fi-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('fin-invest mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
