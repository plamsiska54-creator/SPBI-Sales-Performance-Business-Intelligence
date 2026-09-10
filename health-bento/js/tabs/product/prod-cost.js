/**
 * prod-cost.js — ต้นทุนและกำไรต่อกล่อง (unit economics)
 */

import { createChart, destroyAll } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import {
  buildFilterBar, onFilterChange, getFilterValues,
  MENU_FILTER, CHANNEL_FILTER, SCENARIO_FILTER
} from '../../shared/filter-builder.js';
import { getScenarioFactor } from '../../shared/filter-data.js';
import {
  kpiGrid, chartCard, chartGrid, panel, dataTable, noteBox, assumptionBar,
  fmtNum, fmtPct, pill, baseScales, legendOpts, loadingHTML, errorHTML
} from '../../shared/ui-kit.js';
import { aiPanel } from '../../shared/ai-analyst.js';

let mountId = 0;
let filterCleanup = null;

// 'all' = ค่าธรรมเนียมเฉลี่ยถ่วงน้ำหนักทุกช่องทาง (ตรงกับ 10 บาท/กล่องใน product.json)
const CHANNEL_FEE_PCT = { all: 6, line: 3, delivery: 28, corporate: 0, fitness: 10, store: 15 };
const MENU_INDEX = { thaiclean: 0, bowl: 1, keto: 2, protein: 3, vegan: 4, medical: 5 };

function renderContent(root, data, f) {
  destroyAll();

  const ue = data.unitEconomics;
  const cm = data.costByMenuType;
  const menuKey = f.menu && f.menu !== 'all' ? f.menu : null;
  const idx = menuKey !== null ? MENU_INDEX[menuKey] : null;

  // ราคาและต้นทุนวัตถุดิบเปลี่ยนตามหมวดเมนูที่เลือก
  const price = idx !== null ? cm.avgPrice[idx] : ue.avgPrice;
  const foodCost = idx !== null ? cm.avgFoodCost[idx] : ue.items[0].value;

  // กรณีแย่ = ต้นทุนวัตถุดิบสูงขึ้น, กรณีดี = ต้นทุนถูกลง (ผกผันกับ scenario factor)
  const sf = getScenarioFactor(f);
  const costFactor = sf === 1 ? 1 : (sf > 1 ? 0.94 : 1.10);
  const adjFoodCost = Math.round(foodCost * costFactor);

  const packaging = ue.items[1].value;
  const kitchenLabor = ue.items[2].value;
  const deliveryNet = ue.items[3].value;
  const feePct = CHANNEL_FEE_PCT[f.channel] !== undefined ? CHANNEL_FEE_PCT[f.channel] : 8;
  const platformFee = Math.round(price * feePct / 100);

  const cogs = adjFoodCost + packaging + kitchenLabor;
  const grossProfit = price - cogs;
  const grossMarginPct = (grossProfit / price) * 100;
  const contribution = price - cogs - deliveryNet - platformFee;
  const contributionPct = (contribution / price) * 100;

  const fixedPerMonth = 520000;
  const beBoxesMonth = contribution > 0 ? Math.ceil(fixedPerMonth / contribution) : null;
  const beBoxesDay = beBoxesMonth ? Math.ceil(beBoxesMonth / 26) : null;

  const kpis = [
    { icon: '🏷️', label: 'ราคาขาย', value: fmtNum(price) + ' บาท', sub: menuKey ? cm.labels[idx] : 'เฉลี่ยทุกหมวด', tone: 'neutral' },
    { icon: '🥬', label: 'ต้นทุนขาย (COGS)', value: fmtNum(cogs) + ' บาท', sub: fmtPct((cogs / price) * 100) + ' ของราคา', tone: 'negative' },
    { icon: '📗', label: 'กำไรขั้นต้น', value: fmtNum(grossProfit) + ' บาท', sub: fmtPct(grossMarginPct), tone: grossMarginPct >= 45 ? 'positive' : 'negative' },
    { icon: '💵', label: 'กำไรส่วนเกิน (หลังส่ง+ค่าธรรมเนียม)', value: fmtNum(contribution) + ' บาท', sub: fmtPct(contributionPct), tone: contribution >= 45 ? 'positive' : 'negative' },
    { icon: '🎯', label: 'จุดคุ้มทุนที่เงื่อนไขนี้', value: beBoxesDay ? fmtNum(beBoxesDay) + ' กล่อง/วัน' : 'ไม่คุ้มทุน', sub: beBoxesMonth ? fmtNum(beBoxesMonth) + ' กล่อง/เดือน' : 'กำไรส่วนเกินติดลบ', tone: beBoxesDay && beBoxesDay <= 500 ? 'positive' : 'negative' },
    { icon: '🚚', label: 'ค่าส่งสุทธิต่อกล่อง', value: fmtNum(deliveryNet) + ' บาท', sub: 'หลังหักส่วนที่ลูกค้าจ่าย', tone: 'neutral' },
    { icon: '🧮', label: 'ค่าธรรมเนียมช่องทาง', value: fmtNum(platformFee) + ' บาท', sub: fmtPct(feePct, 0) + ' ของราคาขาย', tone: feePct >= 25 ? 'negative' : 'neutral' },
    { icon: '🏭', label: 'ค่าใช้จ่ายคงที่', value: fmtNum(fixedPerMonth) + ' บาท/เดือน', sub: 'ปีที่ 1 (ครัวกลาง 1 แห่ง)', tone: 'neutral' }
  ];

  const breakdown = [
    { label: 'วัตถุดิบอาหาร', value: adjFoodCost, tone: 'negative' },
    { label: 'บรรจุภัณฑ์', value: packaging, tone: 'negative' },
    { label: 'ค่าแรงครัว (ผันแปร)', value: kitchenLabor, tone: 'negative' },
    { label: 'ค่าจัดส่งสุทธิ', value: deliveryNet, tone: 'negative' },
    { label: 'ค่าธรรมเนียมช่องทาง', value: platformFee, tone: 'negative' },
    { label: 'กำไรส่วนเกิน', value: contribution, tone: contribution >= 0 ? 'positive' : 'negative' }
  ];

  const rows = breakdown.map(b => ({
    label: b.label,
    value: b.value,
    pct: (b.value / price) * 100,
    tag: b.label === 'กำไรส่วนเกิน' ? pill('เหลือเป็นกำไร', 'positive') : pill('ต้นทุน', 'negative')
  }));

  const menuRows = cm.labels.map((label, i) => {
    const p = cm.avgPrice[i];
    const fc = Math.round(cm.avgFoodCost[i] * costFactor);
    const c = p - (fc + packaging + kitchenLabor) - deliveryNet - Math.round(p * feePct / 100);
    return {
      label,
      price: p,
      foodCost: fc,
      cogs: fc + packaging + kitchenLabor,
      grossMarginPct: ((p - (fc + packaging + kitchenLabor)) / p) * 100,
      contribution: c,
      beBoxesDay: c > 0 ? Math.ceil(fixedPerMonth / c / 26) : null
    };
  });

  root.innerHTML =
    assumptionBar('เลือก <strong>หมวดเมนู</strong> และ <strong>ช่องทางขาย</strong> เพื่อดูว่ากล่องหนึ่งเหลือกำไรเท่าไร — สถานการณ์แย่คิดต้นทุนวัตถุดิบ +10%, สถานการณ์ดีคิด -6%') +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('เงิน 1 กล่องไปไหนหมด (บาท)', 'chart-pc-waterfall', { tall: true }),
      chartCard('สัดส่วนต้นทุนต่อราคาขาย', 'chart-pc-share', { tall: true })
    ) +
    panel('โครงสร้างต้นทุนต่อกล่อง', dataTable([
      { key: 'label', label: 'รายการ' },
      { key: 'value', label: 'บาท/กล่อง', align: 'right', fmt: v => fmtNum(v) },
      { key: 'pct', label: '% ของราคาขาย', align: 'right', fmt: v => fmtPct(v) },
      { key: 'tag', label: 'ประเภท', align: 'center' }
    ], rows, { footer: { label: 'ราคาขาย', value: price, pct: 100, tag: '' } })) +
    chartGrid(
      chartCard('กำไรส่วนเกินตามหมวดเมนู (บาท/กล่อง)', 'chart-pc-bymenu', { tall: true }),
      chartCard('จุดคุ้มทุนตามหมวดเมนู (กล่อง/วัน)', 'chart-pc-be', { tall: true, note: 'ยิ่งกำไรส่วนเกินสูง ยิ่งต้องขายน้อยกล่องต่อวันก็คุ้มทุน' })
    ) +
    panel('เปรียบเทียบทุกหมวดเมนูในช่องทางที่เลือก', dataTable([
      { key: 'label', label: 'หมวดเมนู' },
      { key: 'price', label: 'ราคาเฉลี่ย', align: 'right', fmt: v => fmtNum(v) },
      { key: 'foodCost', label: 'วัตถุดิบ', align: 'right', fmt: v => fmtNum(v) },
      { key: 'cogs', label: 'COGS', align: 'right', fmt: v => fmtNum(v) },
      { key: 'grossMarginPct', label: 'กำไรขั้นต้น', align: 'right', fmt: v => fmtPct(v) },
      { key: 'contribution', label: 'กำไรส่วนเกิน', align: 'right', fmt: v => fmtNum(v) },
      { key: 'beBoxesDay', label: 'คุ้มทุนที่ (กล่อง/วัน)', align: 'right', fmt: v => v ? fmtNum(v) : 'ไม่คุ้มทุน' }
    ], menuRows)) +
    noteBox('🧾 ข้อสรุปเชิงต้นทุน', [
      { badge: 'ตัวเลขที่ต้องจำ', tone: 'info', text: 'กำไรส่วนเกินฐาน 55 บาท/กล่อง และค่าใช้จ่ายคงที่ 520,000 บาท/เดือน → ต้องขายอย่างน้อย 364 กล่อง/วัน จึงคุ้มทุน' },
      { badge: 'ช่องทางสำคัญมาก', tone: 'warning', text: 'ขายผ่านแอปเดลิเวอรีที่ราคาเดียวกัน กำไรส่วนเกินหายไปราว 40 บาท/กล่อง — ต้องบวกราคาในแอปหรือดันลูกค้าไป LINE OA' },
      { badge: 'ควบคุมวัตถุดิบ', tone: 'alert', text: 'ถ้าต้นทุนวัตถุดิบขึ้น 10% จุดคุ้มทุนขยับจาก 364 เป็น 408 กล่อง/วัน — ต้องล็อกราคาซัพพลายเออร์รายไตรมาส' },
      { badge: 'โอกาส', tone: 'opportunity', text: 'เมนูมังสวิรัติมีกำไรขั้นต้นสูงสุด (ต้นทุนวัตถุดิบต่ำ) — ควรดันเป็นเมนูประจำวันพุธ/วันพระ เพื่อดึงค่าเฉลี่ยต้นทุนลง' }
    ]);


  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('prod-cost', { data, filters: f }));
  // --- Waterfall (ใช้ bar ซ้อนแบบโปร่งใส) ---
  const steps = [
    { label: 'ราคาขาย', from: 0, to: price, color: 'rgba(22,163,74,0.85)' },
    { label: 'วัตถุดิบ', from: price - adjFoodCost, to: price, color: 'rgba(225,29,72,0.75)' },
    { label: 'บรรจุภัณฑ์', from: price - adjFoodCost - packaging, to: price - adjFoodCost, color: 'rgba(225,29,72,0.6)' },
    { label: 'ค่าแรงครัว', from: price - adjFoodCost - packaging - kitchenLabor, to: price - adjFoodCost - packaging, color: 'rgba(245,158,11,0.75)' },
    { label: 'ค่าจัดส่ง', from: price - cogs - deliveryNet, to: price - cogs, color: 'rgba(245,158,11,0.6)' },
    { label: 'ค่าธรรมเนียม', from: contribution, to: price - cogs - deliveryNet, color: 'rgba(148,163,184,0.8)' },
    { label: 'เหลือเป็นกำไร', from: 0, to: contribution, color: 'rgba(0,191,165,0.9)' }
  ];

  createChart('chart-pc-waterfall', {
    type: 'bar',
    data: {
      labels: steps.map(s => s.label),
      datasets: [{
        label: 'บาท/กล่อง',
        data: steps.map(s => [s.from, s.to]),
        backgroundColor: steps.map(s => s.color),
        borderRadius: 4
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const s = steps[ctx.dataIndex];
              return s.label + ': ' + fmtNum(Math.abs(s.to - s.from)) + ' บาท';
            }
          }
        }
      },
      scales: baseScales({ yCallback: v => fmtNum(v) + ' ฿' })
    }
  });

  // --- โดนัทสัดส่วนต้นทุน ---
  createChart('chart-pc-share', {
    type: 'doughnut',
    data: {
      labels: breakdown.map(b => b.label),
      datasets: [{
        data: breakdown.map(b => Math.max(0, b.value)),
        backgroundColor: ['#e11d48', '#f472b6', '#f59e0b', '#fbbf24', '#94a3b8', '#16a34a'],
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

  // --- กำไรส่วนเกินตามหมวด ---
  createChart('chart-pc-bymenu', {
    type: 'bar',
    data: {
      labels: menuRows.map(r => r.label),
      datasets: [{
        label: 'กำไรส่วนเกิน (บาท/กล่อง)',
        data: menuRows.map(r => r.contribution),
        backgroundColor: menuRows.map(r => r.contribution >= 45 ? 'rgba(22,163,74,0.8)' : r.contribution > 0 ? 'rgba(245,158,11,0.8)' : 'rgba(225,29,72,0.8)'),
        borderRadius: 5
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => fmtNum(ctx.parsed.x) + ' บาท/กล่อง' } } },
      scales: baseScales({ xCallback: v => v + ' ฿' })
    }
  });

  // --- จุดคุ้มทุนตามหมวด ---
  createChart('chart-pc-be', {
    type: 'bar',
    data: {
      labels: menuRows.map(r => r.label),
      datasets: [
        {
          label: 'ต้องขาย (กล่อง/วัน) จึงคุ้มทุน',
          data: menuRows.map(r => r.beBoxesDay || 0),
          backgroundColor: menuRows.map(r => (r.beBoxesDay || 9999) <= 400 ? 'rgba(0,191,165,0.8)' : 'rgba(225,29,72,0.8)'),
          borderRadius: 5
        },
        {
          type: 'line',
          label: 'กำลังผลิตสูงสุด 800 กล่อง/วัน',
          data: menuRows.map(() => 800),
          borderColor: '#e11d48', borderDash: [6, 4], borderWidth: 2, pointRadius: 0
        }
      ]
    },
    options: {
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => fmtNum(ctx.parsed.y) + ' กล่อง/วัน' } } },
      scales: baseScales({ yCallback: v => fmtNum(v) })
    }
  });
}

export async function mount(container) {
  const thisMount = ++mountId;
  container.innerHTML = loadingHTML();

  try {
    const data = await fetchJSON('/data/product.json');
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">
      ${buildFilterBar([MENU_FILTER, CHANNEL_FILTER, SCENARIO_FILTER])}
      <div class="pc-body"></div>
    </div>`;

    const body = container.querySelector('.pc-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('prod-cost mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
