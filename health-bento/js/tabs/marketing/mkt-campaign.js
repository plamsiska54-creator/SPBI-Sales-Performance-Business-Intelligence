/**
 * mkt-campaign.js — แคมเปญการตลาดและแพ็กเกจสมาชิก
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

function renderContent(root, data, f) {
  destroyAll();

  const sf = getScenarioFactor(f);
  const ce = data.customerEconomics;

  const campaigns = data.campaigns.map(c => ({
    ...c,
    expectedNew: Math.round(c.targetNewCustomers * sf),
    expectedRevenue: Math.round(c.budget * c.expectedRoas * sf),
    costPerCustomer: Math.round(c.budget / Math.max(1, c.targetNewCustomers * sf))
  }));

  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalNew = campaigns.reduce((s, c) => s + c.expectedNew, 0);
  const totalRevenue = campaigns.reduce((s, c) => s + c.expectedRevenue, 0);
  const blendedRoas = totalBudget ? +(totalRevenue / totalBudget).toFixed(2) : 0;

  const subs = data.subscriptions;
  const subRevenue = subs.reduce((s, x) => s + x.pricePerMonth * x.targetMembersY1, 0);
  const avgChurn = +(subs.reduce((s, x) => s + x.churnPctPerMonth, 0) / subs.length).toFixed(1);

  const kpis = [
    { icon: '📣', label: 'งบแคมเปญรวมปีที่ 1', value: fmtBaht(totalBudget), sub: campaigns.length + ' แคมเปญ', tone: 'neutral' },
    { icon: '👥', label: 'ลูกค้าใหม่ที่คาดว่าจะได้', value: fmtNum(totalNew) + ' ราย', sub: 'รวมลูกค้าองค์กร ' + fmtNum(campaigns.find(c => c.channel.includes('องค์กร')).expectedNew) + ' บริษัท', tone: 'positive' },
    { icon: '💹', label: 'ROAS เฉลี่ย', value: blendedRoas + ' เท่า', sub: 'รายได้ต่องบโฆษณา 1 บาท', tone: blendedRoas >= 2.5 ? 'positive' : 'negative' },
    { icon: '🧲', label: 'CAC เฉลี่ย', value: fmtNum(ce.blendedCac) + ' บาท', sub: 'LTV/CAC = ' + ce.ltvToCac + ' เท่า', tone: 'positive' },
    { icon: '🔁', label: 'รายได้จากสมาชิก (ปีที่ 1)', value: fmtBaht(subRevenue), sub: 'ต่อเดือนเมื่อสมาชิกเต็มเป้า', tone: 'positive' },
    { icon: '📉', label: 'อัตราเลิกสมาชิกเฉลี่ย', value: fmtPct(avgChurn), sub: 'ต่อเดือน — ต้องคุมไม่ให้เกิน 15%', tone: avgChurn <= 15 ? 'positive' : 'negative' },
    { icon: '⏳', label: 'อายุลูกค้าเฉลี่ย', value: ce.avgLifetimeMonths + ' เดือน', sub: 'สั่งเฉลี่ย ' + ce.avgBoxesPerMonth + ' กล่อง/เดือน', tone: 'neutral' },
    { icon: '💵', label: 'LTV ต่อลูกค้า', value: fmtNum(ce.ltv) + ' บาท', sub: 'คืนต้นทุนโฆษณาใน ' + ce.paybackOrders + ' ออเดอร์', tone: 'positive' }
  ];

  const campaignRows = campaigns.map(c => ({
    name: c.name,
    period: c.period,
    channel: c.channel,
    budget: c.budget,
    expectedNew: c.expectedNew,
    costPerCustomer: c.costPerCustomer,
    expectedRoas: c.expectedRoas,
    verdict: c.expectedRoas >= 3 ? pill('คุ้มมาก', 'positive') : c.expectedRoas >= 2 ? pill('คุ้ม', 'info') : pill('ต้องวัดผลใกล้ชิด', 'warning')
  }));

  const subRows = subs.map(s => ({
    name: s.name,
    boxesPerMonth: s.boxesPerMonth,
    pricePerMonth: s.pricePerMonth,
    marginPct: s.marginPct,
    churnPctPerMonth: s.churnPctPerMonth,
    targetMembersY1: s.targetMembersY1,
    monthlyRevenue: s.pricePerMonth * s.targetMembersY1,
    lifetimeMonths: +(100 / s.churnPctPerMonth).toFixed(1)
  }));

  root.innerHTML =
    assumptionBar('งบและ ROAS เป็น <strong>เป้าหมายที่ตั้งไว้</strong> — ต้องวัดผลจริงทุกสัปดาห์และย้ายงบจากแคมเปญที่ ROAS ต่ำกว่า 1.5 ออกทันที') +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('งบและผลตอบแทนที่คาดหวังของแต่ละแคมเปญ', 'chart-mk-roas', { tall: true }),
      chartCard('สัดส่วนงบการตลาดปีที่ 1', 'chart-mk-budget', { tall: true })
    ) +
    panel('แผนแคมเปญปีที่ 1', dataTable([
      { key: 'name', label: 'แคมเปญ' },
      { key: 'period', label: 'ช่วงเวลา' },
      { key: 'channel', label: 'ช่องทาง' },
      { key: 'budget', label: 'งบ (บาท)', align: 'right', fmt: v => fmtNum(v) },
      { key: 'expectedNew', label: 'ลูกค้าใหม่', align: 'right', fmt: v => fmtNum(v) },
      { key: 'costPerCustomer', label: 'ต้นทุน/ลูกค้า', align: 'right', fmt: v => fmtNum(v) },
      { key: 'expectedRoas', label: 'ROAS', align: 'right', fmt: v => v + 'x' },
      { key: 'verdict', label: 'ประเมิน', align: 'center' }
    ], campaignRows, { footer: { name: 'รวม', budget: totalBudget, expectedNew: totalNew, expectedRoas: blendedRoas + 'x' } })) +
    chartGrid(
      chartCard('เส้นทางลูกค้า (Funnel) ปีที่ 1', 'chart-mk-funnel', { tall: true, note: 'จากคนเห็นโฆษณา 420,000 คน เหลือลูกค้าที่สั่งจริง 3,200 คน (0.76%)' }),
      chartCard('รายได้ต่อเดือนจากแพ็กเกจสมาชิก (บาท)', 'chart-mk-sub', { tall: true })
    ) +
    panel('แพ็กเกจสมาชิก', dataTable([
      { key: 'name', label: 'แพ็กเกจ' },
      { key: 'boxesPerMonth', label: 'กล่อง/เดือน', align: 'right', fmt: v => fmtNum(v) },
      { key: 'pricePerMonth', label: 'ราคา/เดือน', align: 'right', fmt: v => fmtNum(v) },
      { key: 'marginPct', label: 'อัตรากำไร', align: 'right', fmt: v => fmtPct(v, 0) },
      { key: 'churnPctPerMonth', label: 'เลิกใช้/เดือน', align: 'right', fmt: v => fmtPct(v, 0) },
      { key: 'lifetimeMonths', label: 'อายุเฉลี่ย (เดือน)', align: 'right' },
      { key: 'targetMembersY1', label: 'เป้าสมาชิกปีที่ 1', align: 'right', fmt: v => fmtNum(v) },
      { key: 'monthlyRevenue', label: 'รายได้/เดือน', align: 'right', fmt: v => fmtNum(v) }
    ], subRows, { footer: { name: 'รวม', targetMembersY1: subs.reduce((s, x) => s + x.targetMembersY1, 0), monthlyRevenue: subRevenue } })) +
    noteBox('🎯 สิ่งที่ควรทำและไม่ควรทำ', [
      { badge: 'ทำก่อน', tone: 'opportunity', text: 'แคมเปญ "แนะนำเพื่อน" มี ROAS สูงสุด 3.4 เท่า และต้นทุนต่อลูกค้าต่ำสุด — เปิดใช้ตั้งแต่เดือนที่ 2 ที่มีลูกค้าชุดแรกแล้ว' },
      { badge: 'จังหวะทอง', tone: 'info', text: 'แคมเปญเดือนมกราคม (New Year New Body) ตรงกับดัชนีความต้องการสูงสุดของปี — ควรกันงบไว้ 260,000 บาทและเตรียมกำลังผลิตเผื่อ 20%' },
      { badge: 'ล็อกรายได้', tone: 'opportunity', text: 'แพ็กเกจสมาชิกช่วยล็อกรายได้ล่วงหน้าและลด CAC — เป้า 620 สมาชิก Weekly 5 เท่ากับยอดขายประจำ 1.76 ล้านบาท/เดือน' },
      { badge: 'ระวัง', tone: 'alert', text: 'โปรแกรมลดน้ำหนัก 30 วันมีอัตราเลิกใช้สูงสุด 22%/เดือน — ต้องมีการติดตามผลรายสัปดาห์ ไม่ใช่ส่งอาหารแล้วจบ' }
    ]);


  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('mkt-campaign', { data, filters: f }));
  // --- งบ vs ROAS ---
  createChart('chart-mk-roas', {
    type: 'bar',
    data: {
      labels: campaigns.map(c => c.name),
      datasets: [
        { label: 'งบ (บาท)', data: campaigns.map(c => c.budget), backgroundColor: 'rgba(14,165,233,0.75)', borderRadius: 5, yAxisID: 'y' },
        { label: 'รายได้ที่คาด (บาท)', data: campaigns.map(c => c.expectedRevenue), backgroundColor: 'rgba(22,163,74,0.8)', borderRadius: 5, yAxisID: 'y' },
        {
          type: 'line', label: 'ROAS (เท่า)',
          data: campaigns.map(c => c.expectedRoas),
          borderColor: '#f59e0b', borderWidth: 2.5, tension: 0.3, pointRadius: 4, yAxisID: 'y1'
        }
      ]
    },
    options: {
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtNum(ctx.parsed.y) } } },
      scales: {
        x: baseScales().x,
        y: baseScales({ yCallback: v => (v / 1000) + 'k' }).y,
        y1: { ...baseScales({ yCallback: v => v + 'x' }).y, position: 'right', grid: { drawOnChartArea: false } }
      }
    }
  });

  // --- สัดส่วนงบ ---
  const b = data.budgetY1;
  createChart('chart-mk-budget', {
    type: 'doughnut',
    data: {
      labels: b.labels,
      datasets: [{
        data: b.amount,
        backgroundColor: CHART_COLORS.slice(0, b.labels.length),
        borderColor: 'rgba(255,255,255,0.75)', borderWidth: 2
      }]
    },
    options: {
      cutout: '52%',
      plugins: {
        legend: legendOpts(),
        tooltip: { callbacks: { label: ctx => ctx.label + ': ' + fmtNum(ctx.parsed) + ' บาท' } }
      }
    }
  });

  // --- Funnel ---
  const fn = data.funnel;
  createChart('chart-mk-funnel', {
    type: 'bar',
    data: {
      labels: fn.labels,
      datasets: [{
        label: 'จำนวนคน',
        data: fn.values.map(v => Math.round(v * (sf > 1 ? 1.15 : sf < 1 ? 0.85 : 1))),
        backgroundColor: ['rgba(14,165,233,0.7)', 'rgba(0,191,165,0.75)', 'rgba(132,204,22,0.8)', 'rgba(22,163,74,0.85)', 'rgba(21,128,61,0.85)', 'rgba(20,83,45,0.9)'],
        borderRadius: 5
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => fmtNum(ctx.parsed.x) + ' คน',
            afterLabel: ctx => ctx.dataIndex > 0
              ? 'ผ่านมาจากขั้นก่อนหน้า ' + fmtPct((fn.values[ctx.dataIndex] / fn.values[ctx.dataIndex - 1]) * 100)
              : ''
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

  // --- รายได้จากสมาชิก ---
  createChart('chart-mk-sub', {
    type: 'bar',
    data: {
      labels: subs.map(s => s.name),
      datasets: [
        { label: 'รายได้/เดือน (บาท)', data: subRows.map(r => r.monthlyRevenue), backgroundColor: 'rgba(22,163,74,0.8)', borderRadius: 5, yAxisID: 'y' },
        {
          type: 'line', label: 'อัตราเลิกใช้ (%)',
          data: subs.map(s => s.churnPctPerMonth),
          borderColor: '#e11d48', borderWidth: 2.5, tension: 0.3, pointRadius: 4, yAxisID: 'y1'
        }
      ]
    },
    options: {
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtNum(ctx.parsed.y) } } },
      scales: {
        x: baseScales().x,
        y: baseScales({ yCallback: v => (v / 1000) + 'k' }).y,
        y1: { ...baseScales({ yCallback: v => v + '%' }).y, position: 'right', grid: { drawOnChartArea: false } }
      }
    }
  });
}

export async function mount(container) {
  const thisMount = ++mountId;
  container.innerHTML = loadingHTML();

  try {
    const data = await fetchJSON('/data/marketing.json');
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">
      ${buildFilterBar([SCENARIO_FILTER])}
      <div class="mkc-body"></div>
    </div>`;

    const body = container.querySelector('.mkc-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('mkt-campaign mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
