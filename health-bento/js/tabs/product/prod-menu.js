/**
 * prod-menu.js — เมนูตั้งต้นและข้อมูลโภชนาการต่อกล่อง
 */

import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import {
  buildFilterBar, onFilterChange, getFilterValues,
  MENU_FILTER, CUSTOMER_FILTER
} from '../../shared/filter-builder.js';
import { filterByField } from '../../shared/filter-data.js';
import {
  kpiGrid, chartCard, chartGrid, panel, dataTable, noteBox, assumptionBar,
  fmtNum, pill, baseScales, legendOpts, loadingHTML, errorHTML, emptyHTML
} from '../../shared/ui-kit.js';
import { aiPanel } from '../../shared/ai-analyst.js';

let mountId = 0;
let filterCleanup = null;

const MENU_LABELS = {
  thaiclean: 'คลีนไทย',
  bowl: 'สลัด/ไรซ์โบว์ล',
  keto: 'คีโต/โลว์คาร์บ',
  protein: 'โปรตีนสูง',
  vegan: 'มังสวิรัติ/เจ',
  medical: 'ผู้สูงอายุ/ผู้ป่วย'
};

/** แนะนำเมนูให้ตรงกับกลุ่มลูกค้าที่เลือก */
const CUSTOMER_MENU_HINT = {
  office: ['thaiclean', 'bowl'],
  fitness: ['protein', 'keto'],
  diet: ['bowl', 'keto'],
  medical: ['medical'],
  corporate: ['thaiclean', 'vegan']
};

function avg(items, key) {
  if (!items.length) return 0;
  return Math.round(items.reduce((s, i) => s + i[key], 0) / items.length);
}

function renderContent(root, data, f) {
  destroyAll();

  let items = filterByField(data.menu, f, 'menu');

  // ถ้าเลือกกลุ่มลูกค้า ให้จำกัดเฉพาะหมวดที่เหมาะกับกลุ่มนั้น
  if (f.customer && f.customer !== 'all' && (!f.menu || f.menu === 'all')) {
    const allow = CUSTOMER_MENU_HINT[f.customer] || [];
    if (allow.length) items = items.filter(i => allow.includes(i.menu));
  }

  if (!items.length) {
    root.innerHTML = emptyHTML('ไม่มีเมนูในเงื่อนไขที่เลือก');
    return;
  }

  const sodiumHigh = items.filter(i => i.sodium > 700).length;
  const topSeller = items.reduce((a, b) => (b.popularity > a.popularity ? b : a), items[0]);

  const kpis = [
    { icon: '📋', label: 'จำนวนเมนูในเงื่อนไขนี้', value: fmtNum(items.length) + ' รายการ', sub: 'จากทั้งหมด ' + data.menu.length + ' รายการ', tone: 'neutral' },
    { icon: '🔥', label: 'พลังงานเฉลี่ย', value: fmtNum(avg(items, 'kcal')) + ' kcal', sub: 'เป้าหมาย 350-600 kcal/กล่อง', tone: 'positive' },
    { icon: '🍗', label: 'โปรตีนเฉลี่ย', value: fmtNum(avg(items, 'protein')) + ' กรัม', sub: 'สูงกว่าข้าวกล่องทั่วไปประมาณ 2 เท่า', tone: 'positive' },
    { icon: '🧂', label: 'โซเดียมเฉลี่ย', value: fmtNum(avg(items, 'sodium')) + ' มก.', sub: sodiumHigh ? 'มี ' + sodiumHigh + ' เมนูเกิน 700 มก. ต้องปรับสูตร' : 'ทุกเมนูอยู่ในเกณฑ์', tone: sodiumHigh ? 'negative' : 'positive' }
  ];

  const rows = items.map(i => ({
    code: i.code,
    name: i.name,
    menu: pill(MENU_LABELS[i.menu] || i.menu, 'info'),
    kcal: i.kcal,
    protein: i.protein,
    carb: i.carb,
    fat: i.fat,
    sodium: i.sodium,
    price: i.price,
    popularity: i.popularity
  }));

  root.innerHTML =
    assumptionBar('เมนู ' + data.menu.length + ' รายการนี้เป็น <strong>ชุดตั้งต้น</strong> หมุนเวียน 3 สัปดาห์ — ค่าโภชนาการต้องให้นักโภชนาการตรวจรับรองก่อนพิมพ์ฉลาก') +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('พลังงานและโปรตีนต่อกล่อง', 'chart-pm-nutrition', { tall: true, note: 'แท่งสีเขียว = พลังงาน (kcal), เส้นสีส้ม = โปรตีน (กรัม)' }),
      chartCard('สัดส่วนสารอาหารเฉลี่ย (กรัม)', 'chart-pm-macro')
    ) +
    chartGrid(
      chartCard('ความนิยมที่คาดการณ์ (คะแนน 0-100)', 'chart-pm-popular', { tall: true }),
      chartCard('โซเดียมต่อกล่อง เทียบเกณฑ์ 700 มก.', 'chart-pm-sodium', { tall: true })
    ) +
    panel('ตารางเมนูและโภชนาการ', dataTable([
      { key: 'code', label: 'รหัส' },
      { key: 'name', label: 'ชื่อเมนู' },
      { key: 'menu', label: 'หมวด', align: 'center' },
      { key: 'kcal', label: 'kcal', align: 'right', fmt: v => fmtNum(v) },
      { key: 'protein', label: 'โปรตีน (ก.)', align: 'right' },
      { key: 'carb', label: 'คาร์บ (ก.)', align: 'right' },
      { key: 'fat', label: 'ไขมัน (ก.)', align: 'right' },
      { key: 'sodium', label: 'โซเดียม (มก.)', align: 'right', fmt: v => fmtNum(v) },
      { key: 'price', label: 'ราคา (บาท)', align: 'right', fmt: v => fmtNum(v) },
      { key: 'popularity', label: 'ความนิยม', align: 'right' }
    ], rows)) +
    noteBox('🥗 ข้อสังเกตด้านเมนู', [
      { badge: 'เมนูเรือธง', tone: 'opportunity', text: 'คาดว่า "' + topSeller.name + '" (' + topSeller.code + ') จะขายดีที่สุด — ควรมีวัตถุดิบสำรองและกำหนดเป็นเมนูประจำทุกสัปดาห์' },
      { badge: 'คุมโซเดียม', tone: 'warning', text: 'เมนูไทยที่ใช้เครื่องแกงมีโซเดียมสูง — ใช้เครื่องปรุงโซเดียมต่ำและลดน้ำปลาลง 20% พร้อมชิมเทียบก่อนออกขาย' },
      { badge: 'ต้นทุนต้องระวัง', tone: 'alert', text: 'เมนูแซลมอนและเนื้อวัวมีต้นทุนวัตถุดิบเกิน 90 บาท/กล่อง — จำกัดไว้ในกลุ่ม Premium และไม่นำไปทำโปรลดราคา' },
      { badge: 'ทำต่อ', tone: 'info', text: 'ทดสอบรสชาติกับกลุ่มตัวอย่าง 30 คนก่อนเปิดขาย และตัดเมนูที่คะแนนต่ำกว่า 3.5/5 ออกทันที' }
    ]);

  const labels = items.map(i => i.code);


  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('prod-menu', { data, filters: f }));
  // --- kcal + protein ---
  createChart('chart-pm-nutrition', {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'พลังงาน (kcal)', data: items.map(i => i.kcal), backgroundColor: 'rgba(22,163,74,0.7)', borderRadius: 5, yAxisID: 'y' },
        { type: 'line', label: 'โปรตีน (กรัม)', data: items.map(i => i.protein), borderColor: '#f59e0b', backgroundColor: '#f59e0b', borderWidth: 2.5, tension: 0.3, pointRadius: 3, yAxisID: 'y1' }
      ]
    },
    options: {
      plugins: { legend: legendOpts() },
      scales: {
        x: baseScales().x,
        y: baseScales({ yCallback: v => fmtNum(v) }).y,
        y1: { ...baseScales({ yCallback: v => v + ' ก.' }).y, position: 'right', grid: { drawOnChartArea: false } }
      }
    }
  });

  // --- สัดส่วนสารอาหารเฉลี่ย ---
  createChart('chart-pm-macro', {
    type: 'doughnut',
    data: {
      labels: ['โปรตีน', 'คาร์โบไฮเดรต', 'ไขมัน'],
      datasets: [{
        data: [avg(items, 'protein'), avg(items, 'carb'), avg(items, 'fat')],
        backgroundColor: ['#16a34a', '#0ea5e9', '#f59e0b'],
        borderColor: 'rgba(255,255,255,0.75)', borderWidth: 2
      }]
    },
    options: {
      cutout: '52%',
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.label + ': ' + ctx.parsed + ' กรัม' } } }
    }
  });

  // --- ความนิยม ---
  const sortedByPop = [...items].sort((a, b) => b.popularity - a.popularity);
  createChart('chart-pm-popular', {
    type: 'bar',
    data: {
      labels: sortedByPop.map(i => i.name),
      datasets: [{
        label: 'คะแนนความนิยม',
        data: sortedByPop.map(i => i.popularity),
        backgroundColor: sortedByPop.map((i, idx) => CHART_COLORS[idx % CHART_COLORS.length] + 'CC'),
        borderRadius: 5
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: baseScales({ xCallback: v => v })
    }
  });

  // --- โซเดียม ---
  createChart('chart-pm-sodium', {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'โซเดียม (มก.)',
          data: items.map(i => i.sodium),
          backgroundColor: items.map(i => i.sodium > 700 ? 'rgba(225,29,72,0.75)' : 'rgba(0,191,165,0.75)'),
          borderRadius: 5
        },
        {
          type: 'line',
          label: 'เกณฑ์ 700 มก.',
          data: items.map(() => 700),
          borderColor: '#e11d48', borderDash: [6, 4], borderWidth: 2, pointRadius: 0
        }
      ]
    },
    options: {
      plugins: { legend: legendOpts() },
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
      ${buildFilterBar([MENU_FILTER, CUSTOMER_FILTER])}
      <div class="pm-body"></div>
    </div>`;

    const body = container.querySelector('.pm-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('prod-menu mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
