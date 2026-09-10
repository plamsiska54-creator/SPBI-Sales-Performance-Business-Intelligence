/**
 * ops-supply.js — วัตถุดิบและซัพพลายเออร์
 */

import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import {
  buildFilterBar, onFilterChange, getFilterValues,
  MONTH_FILTER, SCENARIO_FILTER
} from '../../shared/filter-builder.js';
import { getScenarioFactor } from '../../shared/filter-data.js';
import {
  kpiGrid, chartCard, chartGrid, panel, dataTable, noteBox, assumptionBar,
  fmtNum, fmtPct, pill, baseScales, legendOpts, loadingHTML, errorHTML
} from '../../shared/ui-kit.js';
import { aiPanel } from '../../shared/ai-analyst.js';

let mountId = 0;
let filterCleanup = null;

const RISK_LABEL = { high: 'สูง', medium: 'กลาง', low: 'ต่ำ' };
const RISK_TONE = { high: 'negative', medium: 'warning', low: 'positive' };

function renderContent(root, data, f) {
  destroyAll();

  const sf = getScenarioFactor(f);
  // สถานการณ์แย่ = ราคาวัตถุดิบแพงขึ้น
  const priceFactor = sf === 1 ? 1 : (sf > 1 ? 0.94 : 1.10);
  const trend = data.ingredientCostTrend;

  const monthIdx = f.month && f.month !== 'all' ? parseInt(f.month, 10) - 1 : null;
  const pickAvg = (arr) => monthIdx !== null
    ? Math.round(arr[monthIdx] * priceFactor)
    : Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * priceFactor);

  const chickenPrice = pickAvg(trend.chicken);
  const salmonPrice = pickAvg(trend.salmon);
  const vegPrice = pickAvg(trend.vegetable);

  const highRisk = data.suppliers.filter(s => s.riskLevel === 'high');
  const creditSuppliers = data.suppliers.filter(s => s.paymentTerm.includes('เครดิต'));
  const creditShare = creditSuppliers.reduce((s, x) => s + x.sharePct, 0);

  const kpis = [
    { icon: '🍗', label: 'ราคาอกไก่', value: fmtNum(chickenPrice) + ' บาท/กก.', sub: monthIdx !== null ? trend.labels[monthIdx] : 'เฉลี่ยทั้งปี', tone: chickenPrice > 76 ? 'negative' : 'positive' },
    { icon: '🐟', label: 'ราคาแซลมอน', value: fmtNum(salmonPrice) + ' บาท/กก.', sub: 'ต้นทุนสูงสุดในเมนู Premium', tone: salmonPrice > 445 ? 'negative' : 'neutral' },
    { icon: '🥬', label: 'ราคาผักสด', value: fmtNum(vegPrice) + ' บาท/กก.', sub: 'ผันผวนตามฤดูฝน', tone: vegPrice > 46 ? 'negative' : 'positive' },
    { icon: '⚠️', label: 'ซัพพลายเออร์ความเสี่ยงสูง', value: fmtNum(highRisk.length) + ' ราย', sub: highRisk.map(s => s.items).join(', '), tone: 'negative' },
    { icon: '🤝', label: 'ซัพพลายเออร์ทั้งหมด', value: fmtNum(data.suppliers.length) + ' ราย', sub: 'ครอบคลุม 6 หมวดวัตถุดิบ', tone: 'neutral' },
    { icon: '💳', label: 'สัดส่วนที่ได้เครดิต', value: fmtPct(creditShare, 0), sub: 'ช่วยยืดกระแสเงินสด 7-30 วัน', tone: 'positive' },
    { icon: '📅', label: 'Lead time ยาวสุด', value: '7 วัน', sub: 'บรรจุภัณฑ์ — ต้องสั่งล่วงหน้า', tone: 'warning' },
    { icon: '🔒', label: 'การล็อกราคา', value: 'รายไตรมาส', sub: 'ยกเว้นอาหารทะเลที่เป็นราคาตลาดรายวัน', tone: 'neutral' }
  ];

  const rows = data.suppliers.map(s => ({
    name: s.name,
    items: s.items,
    sharePct: s.sharePct,
    leadTimeDays: s.leadTimeDays,
    paymentTerm: s.paymentTerm,
    priceLock: s.priceLock,
    risk: pill(RISK_LABEL[s.riskLevel] || s.riskLevel, RISK_TONE[s.riskLevel] || 'neutral')
  }));

  root.innerHTML =
    assumptionBar('ราคาวัตถุดิบเป็น <strong>ช่วงราคาอ้างอิงตามฤดูกาล</strong> — เลือกสถานการณ์ "แย่" เพื่อดูผลกระทบเมื่อราคาขึ้น 10%') +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('แนวโน้มราคาวัตถุดิบหลักรายเดือน (บาท/กก.)', 'chart-os-trend', { tall: true, note: 'แซลมอนใช้แกนขวา เพราะราคาต่างจากรายการอื่นมาก' }),
      chartCard('สัดส่วนมูลค่าจัดซื้อตามซัพพลายเออร์', 'chart-os-share', { tall: true })
    ) +
    chartGrid(
      chartCard('ความเสี่ยงของซัพพลายเออร์ เทียบสัดส่วนการซื้อ', 'chart-os-risk', { tall: true, note: 'ช่องขวาบน = ซื้อเยอะและเสี่ยงสูง ต้องหาผู้ขายสำรองก่อน' }),
      chartCard('ระยะเวลาสั่งของล่วงหน้า (วัน)', 'chart-os-lead')
    ) +
    panel('รายชื่อซัพพลายเออร์และเงื่อนไข', dataTable([
      { key: 'name', label: 'ซัพพลายเออร์' },
      { key: 'items', label: 'วัตถุดิบ' },
      { key: 'sharePct', label: 'สัดส่วนซื้อ', align: 'right', fmt: v => fmtPct(v, 0) },
      { key: 'leadTimeDays', label: 'Lead time (วัน)', align: 'right' },
      { key: 'paymentTerm', label: 'เงื่อนไขชำระ' },
      { key: 'priceLock', label: 'การล็อกราคา' },
      { key: 'risk', label: 'ความเสี่ยง', align: 'center' }
    ], rows)) +
    noteBox('🥬 สิ่งที่ต้องจัดการเรื่องวัตถุดิบ', [
      { badge: 'เสี่ยงสูงสุด', tone: 'alert', text: 'อาหารทะเลซื้อด้วยราคาตลาดรายวันและจ่ายเงินสด — ควรจำกัดเมนูแซลมอน/กุ้งไม่เกิน 3 รายการ และปรับราคาขายได้ทุกเดือน' },
      { badge: 'ต้องมีสำรอง', tone: 'warning', text: 'ทุกหมวดวัตถุดิบควรมีผู้ขายสำรองอย่างน้อย 2 ราย โดยเฉพาะไก่และผักที่รวมกันเป็น 44% ของมูลค่าจัดซื้อ' },
      { badge: 'กระแสเงินสด', tone: 'opportunity', text: 'ได้เครดิตจากซัพพลายเออร์ ' + fmtPct(creditShare, 0) + ' ของมูลค่าจัดซื้อ — ช่วยลดเงินทุนหมุนเวียนที่ต้องเตรียมได้ราว 300,000 บาท' },
      { badge: 'ฤดูกาล', tone: 'info', text: 'ราคาผักและไก่พีคช่วงเมษายน — วางแผนใช้เมนูที่ใช้วัตถุดิบแช่แข็ง/เก็บได้นานเพิ่มขึ้นในเดือนนั้น' }
    ]);


  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('ops-supply', { data, filters: f }));
  // --- แนวโน้มราคา ---
  createChart('chart-os-trend', {
    type: 'line',
    data: {
      labels: trend.labels,
      datasets: [
        { label: 'อกไก่', data: trend.chicken.map(v => Math.round(v * priceFactor)), borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.10)', borderWidth: 2.5, tension: 0.3, pointRadius: 3, yAxisID: 'y' },
        { label: 'ผักสด', data: trend.vegetable.map(v => Math.round(v * priceFactor)), borderColor: '#84cc16', backgroundColor: 'rgba(132,204,22,0.10)', borderWidth: 2.5, tension: 0.3, pointRadius: 3, yAxisID: 'y' },
        { label: 'แซลมอน (แกนขวา)', data: trend.salmon.map(v => Math.round(v * priceFactor)), borderColor: '#0ea5e9', borderWidth: 2.5, tension: 0.3, pointRadius: 3, yAxisID: 'y1' }
      ]
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtNum(ctx.parsed.y) + ' บาท/กก.' } } },
      scales: {
        x: baseScales().x,
        y: baseScales({ yCallback: v => fmtNum(v), beginAtZero: false }).y,
        y1: { ...baseScales({ yCallback: v => fmtNum(v), beginAtZero: false }).y, position: 'right', grid: { drawOnChartArea: false } }
      }
    }
  });

  // --- สัดส่วนจัดซื้อ ---
  createChart('chart-os-share', {
    type: 'doughnut',
    data: {
      labels: data.suppliers.map(s => s.items),
      datasets: [{
        data: data.suppliers.map(s => s.sharePct),
        backgroundColor: CHART_COLORS.slice(0, data.suppliers.length),
        borderColor: 'rgba(255,255,255,0.75)', borderWidth: 2
      }]
    },
    options: {
      cutout: '52%',
      plugins: {
        legend: legendOpts(),
        tooltip: {
          callbacks: {
            label: ctx => ctx.label + ': ' + ctx.parsed + '%',
            afterLabel: ctx => data.suppliers[ctx.dataIndex].name
          }
        }
      }
    }
  });

  // --- ความเสี่ยง vs สัดส่วน ---
  const riskScore = { high: 3, medium: 2, low: 1 };
  createChart('chart-os-risk', {
    type: 'bubble',
    data: {
      datasets: data.suppliers.map((s, i) => ({
        label: s.items,
        data: [{ x: s.sharePct, y: riskScore[s.riskLevel] || 1, r: 8 + s.sharePct * 0.5 }],
        backgroundColor: CHART_COLORS[i % CHART_COLORS.length] + 'CC',
        borderColor: CHART_COLORS[i % CHART_COLORS.length]
      }))
    },
    options: {
      plugins: {
        legend: legendOpts(),
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ซื้อ ' + ctx.parsed.x + '%, ความเสี่ยง ' + (['', 'ต่ำ', 'กลาง', 'สูง'][ctx.parsed.y] || '-') } }
      },
      scales: {
        x: { ...baseScales({ xCallback: v => v + '%' }).x, title: { display: true, text: 'สัดส่วนมูลค่าจัดซื้อ', color: baseScales().x.ticks.color } },
        y: {
          ...baseScales().y,
          min: 0, max: 4,
          ticks: { ...baseScales().y.ticks, stepSize: 1, callback: v => ['', 'ต่ำ', 'กลาง', 'สูง', ''][v] || '' },
          title: { display: true, text: 'ระดับความเสี่ยง', color: baseScales().y.ticks.color }
        }
      }
    }
  });

  // --- Lead time ---
  createChart('chart-os-lead', {
    type: 'bar',
    data: {
      labels: data.suppliers.map(s => s.items),
      datasets: [{
        label: 'Lead time (วัน)',
        data: data.suppliers.map(s => s.leadTimeDays),
        backgroundColor: data.suppliers.map(s => s.leadTimeDays >= 7 ? 'rgba(245,158,11,0.8)' : 'rgba(0,191,165,0.8)'),
        borderRadius: 5
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.x + ' วัน' } } },
      scales: baseScales({ xCallback: v => v + ' วัน' })
    }
  });
}

export async function mount(container) {
  const thisMount = ++mountId;
  container.innerHTML = loadingHTML();

  try {
    const data = await fetchJSON('/data/ops.json');
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">
      ${buildFilterBar([MONTH_FILTER, SCENARIO_FILTER])}
      <div class="os-body"></div>
    </div>`;

    const body = container.querySelector('.os-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('ops-supply mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
