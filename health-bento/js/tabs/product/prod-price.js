/**
 * prod-price.js — โครงสร้างราคาและแพ็กเกจ
 */

import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import {
  buildFilterBar, onFilterChange, getFilterValues,
  MENU_FILTER, CHANNEL_FILTER
} from '../../shared/filter-builder.js';
import { filterByField } from '../../shared/filter-data.js';
import {
  kpiGrid, chartCard, chartGrid, panel, dataTable, noteBox, assumptionBar,
  fmtNum, fmtPct, pill, baseScales, legendOpts, loadingHTML, errorHTML
} from '../../shared/ui-kit.js';
import { aiPanel } from '../../shared/ai-analyst.js';

let mountId = 0;
let filterCleanup = null;

// ค่าธรรมเนียมของแต่ละช่องทาง ใช้คำนวณราคาที่ควรตั้งในช่องทางนั้น
const CHANNEL_FEE_PCT = { all: 6, line: 3, delivery: 28, corporate: 0, fitness: 10, store: 15 };
const CHANNEL_NAME = {
  all: 'ทุกช่องทาง', line: 'LINE OA / เว็บไซต์', delivery: 'แอปเดลิเวอรี',
  corporate: 'องค์กร / แคทเทอริง', fitness: 'ฟิตเนส / คลินิก', store: 'หน้าร้าน / ตู้แช่'
};

function renderContent(root, data, f) {
  destroyAll();

  const items = filterByField(data.menu, f, 'menu');
  const feePct = CHANNEL_FEE_PCT[f.channel] || 0;
  const channelName = CHANNEL_NAME[f.channel] || CHANNEL_NAME.all;

  const prices = items.map(i => i.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Math.round(prices.reduce((s, v) => s + v, 0) / prices.length);
  // ราคาที่ต้องตั้งในช่องทางนั้นเพื่อให้ได้เงินสุทธิเท่ากับราคาฐาน
  const listPrice = Math.round(avgPrice / (1 - feePct / 100));

  const kpis = [
    { icon: '🏷️', label: 'ราคาเฉลี่ย (ราคาฐาน)', value: fmtNum(avgPrice) + ' บาท', sub: 'ช่วง ' + fmtNum(minPrice) + '-' + fmtNum(maxPrice) + ' บาท', tone: 'neutral' },
    { icon: '🧮', label: 'ค่าธรรมเนียมช่องทาง', value: fmtPct(feePct, 0), sub: channelName, tone: feePct >= 25 ? 'negative' : 'positive' },
    { icon: '💵', label: 'ราคาที่ควรตั้งในช่องทางนี้', value: fmtNum(listPrice) + ' บาท', sub: feePct ? 'บวกค่าธรรมเนียมแล้วได้สุทธิเท่าราคาฐาน' : 'ไม่มีค่าธรรมเนียม', tone: 'neutral' },
    { icon: '🎁', label: 'ส่วนลดสูงสุดที่ให้ได้', value: fmtPct(22, 0), sub: 'แพ็กเกจองค์กร 50 กล่องขึ้นไป', tone: 'positive' }
  ];

  const tierRows = data.priceTiers.map(t => ({
    tier: t.tier,
    range: t.range,
    avg: t.avg,
    menuTypes: t.menuTypes,
    targetSharePct: t.targetSharePct,
    grossMarginPct: t.grossMarginPct,
    listPrice: Math.round(t.avg / (1 - feePct / 100))
  }));

  const pkgRows = data.packages.map(p => ({
    name: p.name,
    boxes: p.boxes,
    pricePerBox: p.pricePerBox,
    total: p.total,
    discountPct: p.discountPct,
    tag: p.discountPct >= 18 ? pill('ส่วนลดสูง', 'warning') : p.discountPct >= 10 ? pill('ปกติ', 'info') : pill('ราคาเต็ม', 'positive'),
    note: p.note
  }));

  root.innerHTML =
    assumptionBar('ราคาฐานคือราคาที่ขายผ่าน <strong>LINE OA / เว็บไซต์</strong> — ช่องทางที่มีค่าธรรมเนียมต้องตั้งราคาสูงขึ้นเพื่อให้ได้เงินสุทธิเท่ากัน') +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('การกระจายราคาของเมนู', 'chart-pp-dist', { tall: true }),
      chartCard('ราคาเฉลี่ยตามหมวดเมนู เทียบต้นทุนวัตถุดิบ', 'chart-pp-bymenu', { tall: true })
    ) +
    panel('ระดับราคา (Price Tier)', dataTable([
      { key: 'tier', label: 'ระดับ' },
      { key: 'range', label: 'ช่วงราคา' },
      { key: 'avg', label: 'ราคาเฉลี่ย', align: 'right', fmt: v => fmtNum(v) },
      { key: 'listPrice', label: 'ราคาตั้งในช่องทางนี้', align: 'right', fmt: v => fmtNum(v) },
      { key: 'menuTypes', label: 'เมนูในกลุ่ม' },
      { key: 'targetSharePct', label: 'สัดส่วนเป้าหมาย', align: 'right', fmt: v => fmtPct(v, 0) },
      { key: 'grossMarginPct', label: 'กำไรขั้นต้น', align: 'right', fmt: v => fmtPct(v, 0) }
    ], tierRows)) +
    chartGrid(
      chartCard('ราคาต่อกล่องลดลงตามขนาดแพ็กเกจ', 'chart-pp-package', { tall: true, note: 'ยิ่งซื้อเยอะยิ่งถูกลง แต่ส่วนลดต้องไม่เกิน 22% เพราะกำไรส่วนเกินจะเหลือน้อยกว่า 35 บาท/กล่อง' }),
      chartCard('ส่วนลด เทียบ กำไรส่วนเกินที่เหลือ', 'chart-pp-margin', { tall: true })
    ) +
    panel('แพ็กเกจที่เสนอขาย', dataTable([
      { key: 'name', label: 'แพ็กเกจ' },
      { key: 'boxes', label: 'จำนวนกล่อง', align: 'right', fmt: v => fmtNum(v) },
      { key: 'pricePerBox', label: 'ราคา/กล่อง', align: 'right', fmt: v => fmtNum(v) },
      { key: 'total', label: 'ยอดรวม', align: 'right', fmt: v => fmtNum(v) },
      { key: 'discountPct', label: 'ส่วนลด', align: 'right', fmt: v => fmtPct(v, 0) },
      { key: 'tag', label: 'ระดับส่วนลด', align: 'center' },
      { key: 'note', label: 'หมายเหตุ' }
    ], pkgRows)) +
    noteBox('💰 หลักการตั้งราคาที่แนะนำ', [
      { badge: 'ราคาหลัก', tone: 'opportunity', text: 'ตั้งราคาเมนูหลัก 145-175 บาท ให้ตรงกับที่พนักงานออฟฟิศยอมจ่าย (150-180 บาท) และยังต่ำกว่าค่าเฉลี่ยคู่แข่ง' },
      { badge: 'แอปเดลิเวอรี', tone: 'warning', text: 'ในแอปต้องตั้งราคาสูงขึ้นราว 39% เพื่อชดเชยค่าธรรมเนียม 28% — สื่อสารกับลูกค้าว่า "สั่งผ่าน LINE ถูกกว่า" เพื่อดึงเข้าช่องทางของเราเอง' },
      { badge: 'ส่วนลดขั้นบันได', tone: 'info', text: 'ส่วนลดเพิ่มตามจำนวนกล่อง (0% → 22%) ทำให้ลูกค้าซื้อเยอะขึ้นโดยที่กำไรต่อออเดอร์ยังเพิ่ม' },
      { badge: 'ห้ามทำ', tone: 'alert', text: 'อย่าลดราคาเมนู Premium (แซลมอน/เนื้อวัว) เพราะต้นทุนวัตถุดิบเกิน 90 บาท — ถ้าลด 20% จะเหลือกำไรส่วนเกินไม่ถึง 20 บาท/กล่อง' }
    ]);


  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('prod-price', { data, filters: f }));
  // --- การกระจายราคา ---
  const buckets = [
    { label: '120-149', min: 120, max: 149 },
    { label: '150-179', min: 150, max: 179 },
    { label: '180-209', min: 180, max: 209 },
    { label: '210-250', min: 210, max: 250 }
  ];
  createChart('chart-pp-dist', {
    type: 'bar',
    data: {
      labels: buckets.map(b => b.label + ' บาท'),
      datasets: [{
        label: 'จำนวนเมนู',
        data: buckets.map(b => items.filter(i => i.price >= b.min && i.price <= b.max).length),
        backgroundColor: ['rgba(132,204,22,0.8)', 'rgba(22,163,74,0.8)', 'rgba(0,191,165,0.8)', 'rgba(14,165,233,0.8)'],
        borderRadius: 6
      }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.y + ' เมนู' } } },
      scales: baseScales({ yCallback: v => v })
    }
  });

  // --- ราคา vs ต้นทุนตามหมวด ---
  const cm = data.costByMenuType;
  createChart('chart-pp-bymenu', {
    type: 'bar',
    data: {
      labels: cm.labels,
      datasets: [
        { label: 'ราคาเฉลี่ย (บาท)', data: cm.avgPrice, backgroundColor: 'rgba(22,163,74,0.8)', borderRadius: 5 },
        { label: 'ต้นทุนวัตถุดิบ (บาท)', data: cm.avgFoodCost, backgroundColor: 'rgba(245,158,11,0.8)', borderRadius: 5 }
      ]
    },
    options: {
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtNum(ctx.parsed.y) + ' บาท' } } },
      scales: baseScales({ yCallback: v => fmtNum(v) })
    }
  });

  // --- ราคาต่อกล่องตามแพ็กเกจ ---
  createChart('chart-pp-package', {
    type: 'line',
    data: {
      labels: data.packages.map(p => p.name),
      datasets: [{
        label: 'ราคาต่อกล่อง (บาท)',
        data: data.packages.map(p => p.pricePerBox),
        borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.14)',
        fill: true, tension: 0.25, borderWidth: 2.5, pointRadius: 5
      }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => fmtNum(ctx.parsed.y) + ' บาท/กล่อง' } } },
      scales: baseScales({ yCallback: v => fmtNum(v), beginAtZero: false })
    }
  });

  // --- ส่วนลด vs กำไรส่วนเกิน ---
  const variableCost = data.unitEconomics.items.reduce((s, i) => s + i.value, 0);
  createChart('chart-pp-margin', {
    type: 'bar',
    data: {
      labels: data.packages.map(p => p.name),
      datasets: [
        {
          label: 'กำไรส่วนเกินที่เหลือ (บาท/กล่อง)',
          data: data.packages.map(p => +(p.pricePerBox - variableCost).toFixed(0)),
          backgroundColor: data.packages.map(p => (p.pricePerBox - variableCost) >= 35 ? 'rgba(22,163,74,0.8)' : 'rgba(225,29,72,0.8)'),
          borderRadius: 5,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'ส่วนลด (%)',
          data: data.packages.map(p => p.discountPct),
          borderColor: '#f59e0b', borderWidth: 2.5, tension: 0.3, pointRadius: 4,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      plugins: {
        legend: legendOpts(),
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y } }
      },
      scales: {
        x: baseScales().x,
        y: baseScales({ yCallback: v => v + ' ฿' }).y,
        y1: { ...baseScales({ yCallback: v => v + '%' }).y, position: 'right', grid: { drawOnChartArea: false } }
      }
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
      ${buildFilterBar([MENU_FILTER, CHANNEL_FILTER])}
      <div class="pp-body"></div>
    </div>`;

    const body = container.querySelector('.pp-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('prod-price mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
