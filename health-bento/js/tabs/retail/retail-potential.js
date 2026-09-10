/**
 * retail-potential.js — ศักยภาพยอดขายของแต่ละห้าง และลำดับที่ควรเข้า
 */

import { createChart, destroyAll } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import {
  buildFilterBar, onFilterChange, getFilterValues,
  CHAIN_FILTER, FORMAT_FILTER, SCENARIO_FILTER
} from '../../shared/filter-builder.js';
import { getScenarioFactor } from '../../shared/filter-data.js';
import { chainEconomics, SKU_COUNT } from '../../shared/retail-math.js';
import {
  kpiGrid, chartCard, chartGrid, panel, dataTable, noteBox, assumptionBar,
  fmtNum, fmtBaht, fmtPct, pill, baseScales, legendOpts, loadingHTML, errorHTML, emptyHTML
} from '../../shared/ui-kit.js';
import { aiPanel } from '../../shared/ai-analyst.js';

let mountId = 0;
let filterCleanup = null;

const SALES_DAYS = 30;      // ห้างเปิดทุกวัน
const KITCHEN_CAPACITY = 800;

function selectChains(data, f) {
  let chains = data.chains;
  if (f.format && f.format !== 'all') chains = chains.filter(c => c.format === f.format);
  if (f.chain && f.chain !== 'all') chains = chains.filter(c => c.id === f.chain);
  return chains;
}

/** คำนวณศักยภาพต่อห้าง: กล่อง/วัน กำไร/เดือน และเวลาคืนค่าแรกเข้า */
function potentialOf(chain, data, sf) {
  const e = chainEconomics(chain, data.ourCost);
  // ใช้ค่าที่คำนวณจากงบการเงินก่อน ถ้าไม่มีจึงใช้ค่าประมาณของทีม
  const baseBoxes = chain.potential.boxesPerStorePerDayDerived != null
    ? chain.potential.boxesPerStorePerDayDerived
    : chain.potential.boxesPerStorePerDay;
  const boxesPerStore = baseBoxes * sf;
  const boxesPerDay = boxesPerStore * chain.startBranches;
  const monthlyBoxes = boxesPerDay * SALES_DAYS;
  const monthlyContribution = monthlyBoxes * e.contribution;
  const listingTotal = chain.terms.listingFeePerSku * SKU_COUNT;
  const paybackMonths = monthlyContribution > 0 ? listingTotal / monthlyContribution : null;
  return {
    ...e,
    boxesSource: chain.potential.boxesPerStorePerDayDerived != null ? 'derived' : 'assumed',
    boxesPerStore: +boxesPerStore.toFixed(1),
    boxesPerDay: Math.round(boxesPerDay),
    monthlyBoxes: Math.round(monthlyBoxes),
    monthlyRevenue: Math.round(monthlyBoxes * e.wholesale),
    monthlyContribution: Math.round(monthlyContribution),
    listingTotal,
    paybackMonths: paybackMonths === null ? null : +paybackMonths.toFixed(1),
    capacityPct: +((boxesPerDay / KITCHEN_CAPACITY) * 100).toFixed(1)
  };
}

/** จัดลำดับว่าควรเข้าห้างไหนก่อน จากกำไรต่อเดือนหักด้วยอุปสรรคการเข้า */
function phaseOf(p, chain) {
  if (p.contribution < 8) return { key: 'skip', label: 'ยังไม่ควรเข้า', tone: 'negative' };
  if (p.paybackMonths !== null && p.paybackMonths <= 6 && chain.terms.leadWeeks <= 10) {
    return { key: 'now', label: 'เข้าเฟสแรก', tone: 'positive' };
  }
  if (p.paybackMonths !== null && p.paybackMonths <= 18) {
    return { key: 'next', label: 'เข้าเฟสสอง', tone: 'warning' };
  }
  return { key: 'later', label: 'รอความพร้อม', tone: 'neutral' };
}

function renderContent(root, data, f) {
  destroyAll();

  const chains = selectChains(data, f);
  if (!chains.length) {
    root.innerHTML = emptyHTML('ไม่มีห้างในเงื่อนไขที่เลือก');
    return;
  }

  const sf = getScenarioFactor(f);
  const rows = chains.map(c => {
    const p = potentialOf(c, data, sf);
    return { chain: c, p, phase: phaseOf(p, c) };
  });

  const totalBoxesPerDay = rows.reduce((s, r) => s + r.p.boxesPerDay, 0);
  const totalMonthlyContribution = rows.reduce((s, r) => s + r.p.monthlyContribution, 0);
  const totalMonthlyRevenue = rows.reduce((s, r) => s + r.p.monthlyRevenue, 0);
  const totalListing = rows.reduce((s, r) => s + r.p.listingTotal, 0);
  const phase1 = rows.filter(r => r.phase.key === 'now');
  const best = rows.reduce((a, b) => (b.p.monthlyContribution > a.p.monthlyContribution ? b : a), rows[0]);
  const capacityUse = +((totalBoxesPerDay / KITCHEN_CAPACITY) * 100).toFixed(1);

  const phase1Boxes = phase1.reduce((s, r) => s + r.p.boxesPerDay, 0);
  const phase1Contribution = phase1.reduce((s, r) => s + r.p.monthlyContribution, 0);
  const phase1Listing = phase1.reduce((s, r) => s + r.p.listingTotal, 0);

  const kpis = [
    { icon: '🍱', label: 'ยอดขายรวมถ้าเข้าทุกห้างที่เลือก', value: fmtNum(totalBoxesPerDay) + ' กล่อง/วัน', sub: fmtPct(capacityUse) + ' ของกำลังผลิต 800 กล่อง/วัน', tone: capacityUse > 100 ? 'negative' : 'positive' },
    { icon: '💰', label: 'ยอดขาย (ราคาที่เราได้รับ)', value: fmtBaht(totalMonthlyRevenue), sub: 'ต่อเดือน', tone: 'positive' },
    { icon: '📗', label: 'กำไรส่วนเกินรวม', value: fmtBaht(totalMonthlyContribution),
      sub: rows.some(r => r.p.contribution < 0)
        ? 'ต่อเดือน — รวมห้างที่ขาดทุน ' + rows.filter(r => r.p.contribution < 0).length + ' เครือที่ดึงยอดลง'
        : 'ต่อเดือน หลังหัก GP/DC/ของเสีย',
      tone: totalMonthlyContribution > 0 ? 'positive' : 'negative' },
    { icon: '🚪', label: 'ค่าแรกเข้าที่ต้องจ่ายก่อน', value: fmtBaht(totalListing), sub: SKU_COUNT + ' SKU × ' + chains.length + ' ห้าง', tone: 'negative' },
    { icon: '🥇', label: 'ห้างที่ทำกำไรมากสุด', value: best.chain.name, sub: fmtBaht(best.p.monthlyContribution) + '/เดือน', tone: 'positive' },
    { icon: '🎯', label: 'ห้างที่ควรเข้าเฟสแรก', value: fmtNum(phase1.length) + ' เครือ', sub: phase1.map(r => r.chain.name).join(', ') || 'ไม่มีในเงื่อนไขนี้', tone: phase1.length ? 'positive' : 'warning' },
    { icon: '⚙️', label: 'เฟสแรกใช้กำลังผลิต', value: fmtNum(phase1Boxes) + ' กล่อง/วัน', sub: fmtPct((phase1Boxes / KITCHEN_CAPACITY) * 100) + ' ของกำลังผลิต', tone: 'neutral' },
    { icon: '⏱️', label: 'เฟสแรกคืนค่าแรกเข้าใน', value: phase1Contribution > 0 ? (phase1Listing / phase1Contribution).toFixed(1) + ' เดือน' : '-', sub: 'ค่าแรกเข้า ' + fmtBaht(phase1Listing), tone: 'positive' }
  ];

  const tableRows = rows.map(({ chain: c, p, phase }) => ({
    name: c.name,
    startBranches: c.startBranches,
    boxesPerStore: p.boxesPerStore,
    boxesSource: p.boxesSource === 'derived' ? pill('คำนวณจากงบการเงิน', 'positive') : pill('ประมาณการของทีม', 'warning'),
    boxesPerDay: p.boxesPerDay,
    contribution: p.contribution,
    monthlyRevenue: p.monthlyRevenue,
    monthlyContribution: p.monthlyContribution,
    listingTotal: p.listingTotal,
    paybackMonths: p.paybackMonths,
    phase: pill(phase.label, phase.tone)
  }));

  const footer = {
    name: 'รวม',
    startBranches: chains.reduce((s, c) => s + c.startBranches, 0),
    boxesPerDay: totalBoxesPerDay,
    monthlyRevenue: totalMonthlyRevenue,
    monthlyContribution: totalMonthlyContribution,
    listingTotal: totalListing
  };

  root.innerHTML =
    assumptionBar('ยอดกล่อง/สาขา/วัน ของ Tops · Lotus · Makro <strong>คำนวณจากยอดขายจริงต่อสาขาในงบการเงินปี 2567</strong> (ยอดขายร้าน/วัน × สัดส่วนหมวดอาหารพร้อมทาน × ส่วนแบ่งที่เราคาดว่าได้ ÷ ราคาบนชั้น) — เครือที่ไม่เปิดเผยงบยังเป็นประมาณการของทีม · ตัวเลขจริงต้องยืนยันด้วยการทดลองวางขาย 4-8 สัปดาห์') +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('กำไรส่วนเกินต่อเดือนของแต่ละห้าง (บาท)', 'chart-rp-profit', { tall: true, note: 'คิดจากจำนวนสาขาที่ควรเริ่ม ไม่ใช่ทุกสาขา' }),
      chartCard('กล่องต่อวันที่ต้องผลิตเพิ่ม', 'chart-rp-boxes', { tall: true, note: 'เส้นประคือกำลังผลิตสูงสุด 800 กล่อง/วัน' })
    ) +
    chartGrid(
      chartCard('กำไรต่อเดือน เทียบ เวลาคืนค่าแรกเข้า', 'chart-rp-payback', { tall: true, note: 'ห้างที่อยู่ซ้ายบน = กำไรดีและคืนค่าแรกเข้าเร็ว คือห้างที่ควรเข้าก่อน' }),
      chartCard('ลำดับที่ควรเข้า (จำนวนห้าง)', 'chart-rp-phase', { tall: true })
    ) +
    panel('ศักยภาพยอดขายรายห้าง', dataTable([
      { key: 'name', label: 'ห้าง' },
      { key: 'startBranches', label: 'สาขาที่เริ่ม', align: 'right', fmt: v => fmtNum(v) },
      { key: 'boxesPerStore', label: 'กล่อง/สาขา/วัน', align: 'right' },
      { key: 'boxesSource', label: 'ที่มายอดกล่อง', align: 'center' },
      { key: 'boxesPerDay', label: 'กล่อง/วัน (รวม)', align: 'right', fmt: v => fmtNum(v) },
      { key: 'contribution', label: 'กำไร/กล่อง', align: 'right', fmt: v => fmtNum(v) },
      { key: 'monthlyRevenue', label: 'ยอดขาย/เดือน', align: 'right', fmt: v => fmtNum(v) },
      { key: 'monthlyContribution', label: 'กำไร/เดือน', align: 'right', fmt: v => fmtNum(v) },
      { key: 'listingTotal', label: 'ค่าแรกเข้า', align: 'right', fmt: v => fmtNum(v) },
      { key: 'paybackMonths', label: 'คืนค่าแรกเข้า (เดือน)', align: 'right', fmt: v => v === null ? 'ไม่คืน' : v },
      { key: 'phase', label: 'ควรเข้าเมื่อไร', align: 'center' }
    ], tableRows, { footer })) +
    noteBox('📈 สรุปเชิงตัดสินใจ', [
      { badge: 'เข้าเท่านี้ก่อน', tone: 'opportunity', text: phase1.length
        ? 'เฟสแรกควรเข้า ' + phase1.map(r => r.chain.name + ' (' + r.chain.startBranches + ' สาขา)').join(', ') + ' รวม ' + fmtNum(phase1Boxes) + ' กล่อง/วัน ซึ่งกินกำลังผลิตเพียง ' + fmtPct((phase1Boxes / KITCHEN_CAPACITY) * 100) + ' — ยังเหลือกำลังผลิตให้ช่องทางเดิม'
        : 'ในเงื่อนไขที่เลือกยังไม่มีห้างที่คุ้มพอจะเข้าเฟสแรก ลองเลือกกลุ่มซูเปอร์พรีเมียมดู' },
      { badge: 'ห้างไม่ใช่ช่องทางกำไรสูง', tone: 'warning', text: 'กำไรส่วนเกินผ่านห้างอยู่ที่ราว 10-30 บาท/กล่อง เทียบกับ 55 บาทเมื่อขายตรงผ่าน LINE OA — ห้างมีค่าในเรื่อง "คนเห็นแบรนด์" มากกว่ากำไรต่อกล่อง' },
      { badge: 'กติกาที่ต้องยึด', tone: 'alert', text: 'อย่าเข้าห้างก่อนยอดขายตรงถึงผู้บริโภคแตะ 400 กล่อง/วัน เพราะห้างต้องเติมของทุกวันและปรับคะแนนผู้ขายถ้าสินค้าขาดชั้น' },
      { badge: 'วิธีลดความเสี่ยง', tone: 'info', text: 'เจรจาขอทดลองวางขาย (trial) 4-8 สัปดาห์ในไม่กี่สาขาโดยขอลดหรือยกเว้นค่าแรกเข้าก่อน แล้วค่อยเซ็นสัญญาเต็มเมื่อรู้ยอดขายจริง' }
    ]);

  const labels = rows.map(r => r.chain.name);


  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('retail-potential', { data, filters: f, scenarioFactor: sf }));
  // --- กำไรต่อเดือน ---
  createChart('chart-rp-profit', {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'กำไรส่วนเกิน/เดือน (บาท)',
        data: rows.map(r => r.p.monthlyContribution),
        backgroundColor: rows.map(r => r.p.monthlyContribution >= 200000 ? 'rgba(22,163,74,0.85)' : r.p.monthlyContribution >= 50000 ? 'rgba(245,158,11,0.85)' : 'rgba(225,29,72,0.85)'),
        borderRadius: 5
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => fmtBaht(ctx.parsed.x) + '/เดือน' } } },
      scales: baseScales({ xCallback: v => (v / 1000) + 'k' })
    }
  });

  // --- กล่องต่อวัน ---
  createChart('chart-rp-boxes', {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'กล่อง/วัน',
          data: rows.map(r => r.p.boxesPerDay),
          backgroundColor: 'rgba(0,191,165,0.85)',
          borderRadius: 5
        },
        {
          type: 'line',
          label: 'กำลังผลิตสูงสุด 800 กล่อง/วัน',
          data: rows.map(() => KITCHEN_CAPACITY),
          borderColor: '#e11d48', borderDash: [6, 4], borderWidth: 2, pointRadius: 0
        }
      ]
    },
    options: {
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => fmtNum(ctx.parsed.y) + ' กล่อง/วัน' } } },
      scales: baseScales({ yCallback: v => fmtNum(v) })
    }
  });

  // --- กำไร vs payback ---
  createChart('chart-rp-payback', {
    type: 'bubble',
    data: {
      datasets: rows.map((r, i) => ({
        label: r.chain.name,
        data: [{
          x: r.p.paybackMonths === null ? 36 : Math.min(36, r.p.paybackMonths),
          y: r.p.monthlyContribution,
          r: 8 + Math.min(14, r.chain.startBranches * 0.6)
        }],
        backgroundColor: (r.phase.key === 'now' ? '#16a34a' : r.phase.key === 'next' ? '#f59e0b' : r.phase.key === 'skip' ? '#e11d48' : '#94a3b8') + 'CC',
        borderColor: r.phase.key === 'now' ? '#15803d' : '#64748b'
      }))
    },
    options: {
      plugins: {
        legend: { ...legendOpts(), labels: { ...legendOpts().labels, boxWidth: 10 } },
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label,
            afterLabel: ctx => 'กำไร ' + fmtBaht(ctx.parsed.y) + '/เดือน · คืนค่าแรกเข้า ' + (ctx.parsed.x >= 36 ? 'เกิน 36' : ctx.parsed.x) + ' เดือน'
          }
        }
      },
      scales: {
        x: { ...baseScales({ xCallback: v => v + ' ด.' }).x, title: { display: true, text: 'เวลาคืนค่าแรกเข้า (เดือน — ยิ่งซ้ายยิ่งดี)', color: baseScales().x.ticks.color } },
        y: { ...baseScales({ yCallback: v => (v / 1000) + 'k' }).y, title: { display: true, text: 'กำไรส่วนเกินต่อเดือน (บาท)', color: baseScales().y.ticks.color } }
      }
    }
  });

  // --- ลำดับที่ควรเข้า ---
  const phases = [
    { key: 'now', label: 'เข้าเฟสแรก', color: 'rgba(22,163,74,0.85)' },
    { key: 'next', label: 'เข้าเฟสสอง', color: 'rgba(245,158,11,0.85)' },
    { key: 'later', label: 'รอความพร้อม', color: 'rgba(148,163,184,0.85)' },
    { key: 'skip', label: 'ยังไม่ควรเข้า', color: 'rgba(225,29,72,0.85)' }
  ];
  createChart('chart-rp-phase', {
    type: 'doughnut',
    data: {
      labels: phases.map(p => p.label),
      datasets: [{
        data: phases.map(p => rows.filter(r => r.phase.key === p.key).length),
        backgroundColor: phases.map(p => p.color),
        borderColor: 'rgba(255,255,255,0.75)', borderWidth: 2
      }]
    },
    options: {
      cutout: '52%',
      plugins: {
        legend: legendOpts(),
        tooltip: {
          callbacks: {
            label: ctx => ctx.label + ': ' + ctx.parsed + ' ห้าง',
            afterLabel: ctx => rows.filter(r => r.phase.key === phases[ctx.dataIndex].key).map(r => r.chain.name).join(', ')
          }
        }
      }
    }
  });
}

export async function mount(container) {
  const thisMount = ++mountId;
  container.innerHTML = loadingHTML();

  try {
    const data = await fetchJSON('/data/retail.json');
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">
      ${buildFilterBar([CHAIN_FILTER, FORMAT_FILTER, SCENARIO_FILTER])}
      <div class="rp-body"></div>
    </div>`;

    const body = container.querySelector('.rp-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('retail-potential mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
