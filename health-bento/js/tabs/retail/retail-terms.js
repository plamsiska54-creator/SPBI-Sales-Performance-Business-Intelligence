/**
 * retail-terms.js — เงื่อนไขวางขายของแต่ละห้าง (GP, ค่าแรกเข้า, DC, เครดิตเทอม, เอกสาร)
 */

import { createChart, destroyAll } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import {
  buildFilterBar, onFilterChange, getFilterValues,
  CHAIN_FILTER, FORMAT_FILTER
} from '../../shared/filter-builder.js';
import {
  kpiGrid, chartCard, chartGrid, panel, dataTable, noteBox, assumptionBar,
  fmtNum, fmtBaht, fmtPct, pill, baseScales, legendOpts, loadingHTML, errorHTML, emptyHTML
} from '../../shared/ui-kit.js';
import { aiPanel } from '../../shared/ai-analyst.js';
import { chainEconomics, SKU_COUNT } from '../../shared/retail-math.js';

let mountId = 0;
let filterCleanup = null;


function selectChains(data, f) {
  let chains = data.chains;
  if (f.format && f.format !== 'all') chains = chains.filter(c => c.format === f.format);
  if (f.chain && f.chain !== 'all') chains = chains.filter(c => c.id === f.chain);
  return chains;
}

function renderContent(root, data, f) {
  destroyAll();

  const chains = selectChains(data, f);
  if (!chains.length) {
    root.innerHTML = emptyHTML('ไม่มีห้างในเงื่อนไขที่เลือก');
    return;
  }

  const eco = chains.map(c => ({ chain: c, e: chainEconomics(c, data.ourCost) }));
  const avgGp = chains.reduce((s, c) => s + c.terms.gpPct, 0) / chains.length;
  const avgCredit = chains.reduce((s, c) => s + c.terms.creditDays, 0) / chains.length;
  const totalListing = eco.reduce((s, x) => s + x.e.listingTotal, 0);
  const best = eco.reduce((a, b) => (b.e.contribution > a.e.contribution ? b : a), eco[0]);
  const worst = eco.reduce((a, b) => (b.e.contribution < a.e.contribution ? b : a), eco[0]);
  const longestLead = chains.reduce((a, b) => (b.terms.leadWeeks > a.terms.leadWeeks ? b : a), chains[0]);
  const docsNeeded = [...new Set(chains.flatMap(c => c.terms.docs))];

  const kpis = [
    { icon: '✂️', label: 'GP ที่ห้างหักเฉลี่ย', value: fmtPct(avgGp, 1), sub: 'หักจากราคาขายปลีกบนชั้น', tone: avgGp >= 30 ? 'negative' : 'neutral' },
    { icon: '💳', label: 'เครดิตเทอมเฉลี่ย', value: fmtNum(Math.round(avgCredit)) + ' วัน', sub: 'ยิ่งนานยิ่งต้องมีเงินหมุนเวียนมาก', tone: avgCredit > 45 ? 'negative' : 'positive' },
    { icon: '🚪', label: 'ค่าแรกเข้ารวม (' + SKU_COUNT + ' SKU)', value: fmtBaht(totalListing), sub: 'เงินจม ไม่ได้คืนถ้าถูกถอดจากชั้น', tone: 'negative' },
    { icon: '⏳', label: 'ใช้เวลานานสุดก่อนวางขาย', value: fmtNum(longestLead.terms.leadWeeks) + ' สัปดาห์', sub: longestLead.name, tone: 'warning' },
    { icon: '🏆', label: 'ห้างที่เหลือกำไรมากสุด', value: best.chain.name, sub: fmtNum(best.e.contribution) + ' บาท/กล่อง', tone: 'positive' },
    { icon: '⚠️', label: 'ห้างที่เหลือกำไรน้อยสุด', value: worst.chain.name, sub: fmtNum(worst.e.contribution) + ' บาท/กล่อง', tone: worst.e.contribution > 0 ? 'warning' : 'negative' },
    { icon: '📄', label: 'เอกสารที่ต้องเตรียม', value: fmtNum(docsNeeded.length) + ' รายการ', sub: 'อย. และ GMP เป็นพื้นฐานของทุกห้าง', tone: 'neutral' },
    { icon: '🚚', label: 'ส่งผ่านศูนย์กระจายสินค้า', value: fmtNum(chains.filter(c => c.terms.deliverTo === 'DC').length) + ' / ' + chains.length + ' เครือ', sub: 'ที่เหลือส่งตรงเข้าสาขา', tone: 'neutral' }
  ];

  const rows = eco.map(({ chain: c, e }) => ({
    name: c.name,
    gpPct: c.terms.gpPct,
    rsp: e.rsp,
    wholesale: e.wholesale,
    dcFeePct: c.terms.dcFeePct,
    wastePct: c.potential.wastePct,
    contribution: e.contribution,
    creditDays: c.terms.creditDays,
    listing: c.terms.listingFeePerSku,
    verdict: e.contribution >= 25 ? pill('คุ้ม', 'positive')
      : e.contribution >= 10 ? pill('พอไหว', 'warning')
      : pill('ไม่คุ้ม', 'negative'),
    listingNote: c.listingNote || '-'
  }));

  const docRows = docsNeeded.map(doc => {
    const need = chains.filter(c => c.terms.docs.includes(doc));
    return {
      doc,
      count: need.length + ' / ' + chains.length,
      chains: need.map(c => c.name).join(', '),
      level: need.length === chains.length ? pill('ทุกห้างต้องมี', 'negative') : pill('บางห้าง', 'warning')
    };
  });

  root.innerHTML =
    assumptionBar('⚠️ ตัวเลข GP · ค่าแรกเข้า · ค่า DC · เครดิตเทอม · ของเสีย ในหน้านี้เป็น <strong>สมมติฐานของทีม (ยังไม่มีแหล่งอ้างอิง)</strong> อ้างอิงเพียงกรอบกว้างว่ามาร์จิ้นค้าปลีกไทยอยู่ในช่วง 20-50% — ต้องขอ Trading Terms ฉบับจริงจากฝ่ายจัดซื้อของแต่ละห้างก่อนใช้ตัดสินใจ · คอลัมน์ขวาสุดคือเงื่อนไขที่มีแหล่งอ้างอิงจริง') +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('เงิน 1 กล่องแบ่งกันอย่างไรในแต่ละห้าง (บาท)', 'chart-rt-split', { tall: true, note: 'ราคาบนชั้น = ส่วนแบ่งห้าง (GP) + ต้นทุนของเรา + กำไรที่เหลือ' }),
      chartCard('กำไรส่วนเกินที่เหลือต่อกล่อง (บาท)', 'chart-rt-contrib', { tall: true, note: 'เส้นประคือ 55 บาท/กล่อง ซึ่งเป็นค่าที่ใช้ในแผนการเงินหลัก (ขายตรงถึงผู้บริโภค)' })
    ) +
    chartGrid(
      chartCard('GP และค่าธรรมเนียมศูนย์กระจายสินค้า (%)', 'chart-rt-fees', { tall: true }),
      chartCard('เครดิตเทอม เทียบ เวลาที่ใช้ก่อนวางขาย', 'chart-rt-lead', { tall: true })
    ) +
    panel('ตารางเงื่อนไขวางขายทุกห้าง', dataTable([
      { key: 'name', label: 'ห้าง' },
      { key: 'gpPct', label: 'GP ห้าง', align: 'right', fmt: v => fmtPct(v, 0) },
      { key: 'rsp', label: 'ราคาบนชั้น', align: 'right', fmt: v => fmtNum(v) },
      { key: 'wholesale', label: 'เราได้รับ', align: 'right', fmt: v => fmtNum(v) },
      { key: 'dcFeePct', label: 'ค่า DC', align: 'right', fmt: v => fmtPct(v, 1) },
      { key: 'wastePct', label: 'ของเสีย', align: 'right', fmt: v => fmtPct(v, 0) },
      { key: 'contribution', label: 'เหลือกำไร/กล่อง', align: 'right', fmt: v => fmtNum(v) },
      { key: 'creditDays', label: 'เครดิต (วัน)', align: 'right' },
      { key: 'listing', label: 'ค่าแรกเข้า/SKU', align: 'right', fmt: v => fmtNum(v) },
      { key: 'verdict', label: 'ประเมิน', align: 'center' },
      { key: 'listingNote', label: 'เงื่อนไขที่มีแหล่งอ้างอิง' }
    ], rows)) +
    panel('เอกสารและระบบที่ต้องมีก่อนยื่นเข้าห้าง', dataTable([
      { key: 'doc', label: 'เอกสาร / ระบบ' },
      { key: 'count', label: 'กี่ห้างที่ต้องใช้', align: 'center' },
      { key: 'level', label: 'ระดับความจำเป็น', align: 'center' },
      { key: 'chains', label: 'ห้างที่ขอ' }
    ], docRows)) +
    noteBox('📋 กฎการเข้าห้างที่ต้องยึด', data.entryRules.map((r, i) => ({
      badge: (i + 1) + '. ' + r.rule,
      tone: i === 0 ? 'alert' : i === 1 ? 'opportunity' : i === 4 ? 'alert' : 'warning',
      text: r.detail
    })));

  const labels = chains.map(c => c.name);
  const cost = data.ourCost.cogsPerBox + data.ourCost.deliveryToDcPerBox;


  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('retail-terms', { data, filters: f }));
  // --- เงิน 1 กล่องแบ่งกันอย่างไร ---
  createChart('chart-rt-split', {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'ส่วนแบ่งห้าง (GP)', data: eco.map(x => Math.round(x.e.rsp - x.e.wholesale)), backgroundColor: 'rgba(225,29,72,0.8)', borderRadius: 4 },
        { label: 'ต้นทุนผลิต + ส่งเข้า DC', data: eco.map(() => cost), backgroundColor: 'rgba(245,158,11,0.8)', borderRadius: 4 },
        { label: 'ค่า DC + ของเสีย', data: eco.map(x => Math.max(0, Math.round(x.e.wholesale - cost - x.e.contribution))), backgroundColor: 'rgba(148,163,184,0.8)', borderRadius: 4 },
        { label: 'กำไรที่เหลือ', data: eco.map(x => Math.round(x.e.contribution)), backgroundColor: 'rgba(22,163,74,0.85)', borderRadius: 4 }
      ]
    },
    options: {
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtNum(ctx.parsed.y) + ' บาท' } } },
      scales: {
        x: baseScales({ stacked: true }).x,
        y: baseScales({ stacked: true, yCallback: v => v + ' ฿' }).y
      }
    }
  });

  // --- กำไรส่วนเกิน ---
  createChart('chart-rt-contrib', {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'กำไรส่วนเกิน (บาท/กล่อง)',
          data: eco.map(x => x.e.contribution),
          backgroundColor: eco.map(x => x.e.contribution >= 25 ? 'rgba(22,163,74,0.85)' : x.e.contribution >= 10 ? 'rgba(245,158,11,0.85)' : 'rgba(225,29,72,0.85)'),
          borderRadius: 5
        },
        {
          type: 'line',
          label: 'ขายตรงถึงผู้บริโภค 55 บาท',
          data: eco.map(() => 55),
          borderColor: '#0ea5e9', borderDash: [6, 4], borderWidth: 2, pointRadius: 0
        }
      ]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => fmtNum(ctx.parsed.x) + ' บาท/กล่อง' } } },
      scales: baseScales({ xCallback: v => v + ' ฿' })
    }
  });

  // --- GP + DC fee ---
  createChart('chart-rt-fees', {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'GP ห้าง (%)', data: chains.map(c => c.terms.gpPct), backgroundColor: 'rgba(225,29,72,0.8)', borderRadius: 5 },
        { label: 'ค่าธรรมเนียม DC (%)', data: chains.map(c => c.terms.dcFeePct), backgroundColor: 'rgba(148,163,184,0.85)', borderRadius: 5 }
      ]
    },
    options: {
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y + '%' } } },
      scales: {
        x: baseScales({ stacked: true }).x,
        y: baseScales({ stacked: true, yCallback: v => v + '%' }).y
      }
    }
  });

  // --- เครดิต vs lead time ---
  createChart('chart-rt-lead', {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'เครดิตเทอม (วัน)', data: chains.map(c => c.terms.creditDays), backgroundColor: 'rgba(14,165,233,0.8)', borderRadius: 5, yAxisID: 'y' },
        {
          type: 'line', label: 'เวลาก่อนวางขาย (สัปดาห์)',
          data: chains.map(c => c.terms.leadWeeks),
          borderColor: '#f59e0b', borderWidth: 2.5, tension: 0.3, pointRadius: 4, yAxisID: 'y1'
        }
      ]
    },
    options: {
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y } } },
      scales: {
        x: baseScales().x,
        y: baseScales({ yCallback: v => v + ' วัน' }).y,
        y1: { ...baseScales({ yCallback: v => v + ' สัปดาห์' }).y, position: 'right', grid: { drawOnChartArea: false } }
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
      ${buildFilterBar([CHAIN_FILTER, FORMAT_FILTER])}
      <div class="rt-body"></div>
    </div>`;

    const body = container.querySelector('.rt-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('retail-terms mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
