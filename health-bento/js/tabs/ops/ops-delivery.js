/**
 * ops-delivery.js — การจัดส่งและโลจิสติกส์แบบควบคุมอุณหภูมิ
 */

import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import {
  buildFilterBar, onFilterChange, getFilterValues,
  REGION_FILTER, YEAR_FILTER
} from '../../shared/filter-builder.js';
import { getYearFactor } from '../../shared/filter-data.js';
import {
  kpiGrid, chartCard, chartGrid, panel, dataTable, noteBox, assumptionBar,
  fmtNum, fmtPct, pill, baseScales, legendOpts, loadingHTML, errorHTML
} from '../../shared/ui-kit.js';
import { aiPanel } from '../../shared/ai-analyst.js';

let mountId = 0;
let filterCleanup = null;

function renderContent(root, data, f) {
  destroyAll();

  const yf = getYearFactor(f);
  const zones = f.region && f.region !== 'all'
    ? data.deliveryZones.filter(z => z.id === f.region)
    : data.deliveryZones;
  const kpi = data.deliveryKpi;

  const totalShare = zones.reduce((s, z) => s + z.sharePct, 0) || 1;
  const weightedCost = zones.reduce((s, z) => s + z.avgCostPerBox * z.sharePct, 0) / totalShare;
  const weightedOnTime = zones.reduce((s, z) => s + z.onTimePct * z.sharePct, 0) / totalShare;
  const boxesPerDay = Math.round(406 * yf);
  const monthlyDeliveryCost = Math.round(weightedCost * boxesPerDay * 26);
  const worstZone = zones.reduce((a, b) => (b.onTimePct < a.onTimePct ? b : a), zones[0]);

  const kpis = [
    { icon: '🚚', label: 'ค่าส่งเฉลี่ยต่อกล่อง', value: fmtNum(Math.round(weightedCost)) + ' บาท', sub: 'เป้าหมาย ≤ ' + kpi.avgCostPerBox + ' บาท', tone: weightedCost <= kpi.avgCostPerBox ? 'positive' : 'negative' },
    { icon: '⏱️', label: 'ส่งตรงเวลา (คาดการณ์)', value: fmtPct(weightedOnTime), sub: 'เป้าหมาย ≥ ' + kpi.onTimeTargetPct + '%', tone: weightedOnTime >= kpi.onTimeTargetPct ? 'positive' : 'negative' },
    { icon: '💸', label: 'ค่าจัดส่งรวม', value: fmtNum(monthlyDeliveryCost) + ' บาท/เดือน', sub: 'ที่ ' + fmtNum(boxesPerDay) + ' กล่อง/วัน', tone: 'neutral' },
    { icon: '🧊', label: 'จุดตรวจอุณหภูมิ', value: fmtNum(kpi.coldChainCheckpoints) + ' จุด', sub: 'ตั้งแต่ครัวถึงมือลูกค้า', tone: 'positive' },
    { icon: '📍', label: 'พื้นที่ให้บริการ', value: fmtNum(zones.length) + ' โซน', sub: zones.map(z => z.zone).join(', '), tone: 'neutral' },
    { icon: '⚠️', label: 'โซนที่ต้องเฝ้าระวัง', value: worstZone.zone, sub: 'ส่งตรงเวลา ' + fmtPct(worstZone.onTimePct, 0), tone: 'negative' },
    { icon: '📦', label: 'อัตราสินค้าเสียหาย', value: fmtPct(kpi.damageTargetPct), sub: 'เพดานที่ยอมรับได้', tone: 'neutral' },
    { icon: '↩️', label: 'อัตราคืน/ส่งไม่สำเร็จ', value: fmtPct(kpi.returnRatePct), sub: 'ต้องโทรยืนยันก่อนออกรอบ', tone: 'neutral' }
  ];

  const rows = data.deliveryZones.map(z => ({
    zone: z.zone,
    sharePct: z.sharePct,
    avgCostPerBox: z.avgCostPerBox,
    sla: z.slaMinutes >= 1440 ? 'ข้ามคืน' : z.slaMinutes + ' นาที',
    onTimePct: z.onTimePct,
    method: z.method,
    status: z.onTimePct >= 95 ? pill('ตามเป้า', 'positive') : z.onTimePct >= 90 ? pill('ต้องปรับ', 'warning') : pill('ต่ำกว่าเป้า', 'negative')
  }));

  root.innerHTML =
    assumptionBar('ค่าส่งและอัตราส่งตรงเวลาเป็น <strong>เป้าหมายที่ตั้งไว้</strong> — ต้องวัดผลจริงรายวันตั้งแต่สัปดาห์แรกที่เปิดขาย') +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('ค่าส่งต่อกล่องแต่ละโซน (บาท)', 'chart-od-cost', { tall: true, note: 'เส้นประคือค่าส่งเฉลี่ยที่ใช้ในแผนการเงิน (16 บาท/กล่อง)' }),
      chartCard('สัดส่วนออเดอร์ตามพื้นที่', 'chart-od-share', { tall: true })
    ) +
    chartGrid(
      chartCard('อัตราส่งตรงเวลาแต่ละโซน (%)', 'chart-od-ontime', { tall: true }),
      chartCard('เวลาจัดส่งตามข้อตกลง (นาที)', 'chart-od-sla', { tall: true, note: 'ไม่รวมโซนต่างจังหวัดที่เป็นการส่งข้ามคืน' })
    ) +
    panel('รายละเอียดโซนจัดส่ง', dataTable([
      { key: 'zone', label: 'โซน' },
      { key: 'sharePct', label: 'สัดส่วนออเดอร์', align: 'right', fmt: v => fmtPct(v, 0) },
      { key: 'avgCostPerBox', label: 'ค่าส่ง/กล่อง', align: 'right', fmt: v => fmtNum(v) },
      { key: 'sla', label: 'เวลาส่ง' },
      { key: 'onTimePct', label: 'ตรงเวลา', align: 'right', fmt: v => fmtPct(v, 0) },
      { key: 'method', label: 'วิธีจัดส่ง' },
      { key: 'status', label: 'สถานะ', align: 'center' }
    ], rows)) +
    noteBox('🚚 ข้อเสนอด้านการจัดส่ง', [
      { badge: 'คุมต้นทุน', tone: 'opportunity', text: 'จัดรอบส่งแบบรวมจุด (ส่งอาคารเดียวกันรอบเดียว) ทำให้ค่าส่งต่อกล่องในกรุงเทพฯ ชั้นในเหลือเพียง 12 บาท — ถูกกว่าเรียกไรเดอร์รายกล่องเกือบ 3 เท่า' },
      { badge: 'ลูกค้าองค์กร', tone: 'opportunity', text: 'ออเดอร์องค์กร 50 กล่องขึ้นไปส่งจุดเดียว ทำให้ค่าส่งต่อกล่องต่ำกว่า 5 บาท — เป็นเหตุผลที่ให้ส่วนลดองค์กรได้ถึง 22%' },
      { badge: 'ต้องแก้', tone: 'warning', text: 'โซนสมุทรปราการและต่างจังหวัดส่งตรงเวลาต่ำกว่าเป้า — ควรจำกัดจำนวนออเดอร์/วันจนกว่าจะหาพาร์ตเนอร์ขนส่งที่นิ่งกว่าได้' },
      { badge: 'ความปลอดภัย', tone: 'alert', text: 'ต้องมีเทอร์โมมิเตอร์ในกระเป๋าส่งทุกใบและถ่ายรูปบันทึกอุณหภูมิเมื่อส่งถึง — เป็นหลักฐานสำคัญหากลูกค้าร้องเรียน' }
    ]);


  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('ops-delivery', { data, filters: f }));
  // --- ค่าส่งต่อกล่อง ---
  createChart('chart-od-cost', {
    type: 'bar',
    data: {
      labels: data.deliveryZones.map(z => z.zone),
      datasets: [
        {
          label: 'ค่าส่ง/กล่อง (บาท)',
          data: data.deliveryZones.map(z => z.avgCostPerBox),
          backgroundColor: data.deliveryZones.map(z => z.avgCostPerBox <= 16 ? 'rgba(22,163,74,0.8)' : z.avgCostPerBox <= 24 ? 'rgba(245,158,11,0.8)' : 'rgba(225,29,72,0.8)'),
          borderRadius: 5
        },
        {
          type: 'line',
          label: 'ค่าเฉลี่ยที่ใช้ในแผน (16 บาท)',
          data: data.deliveryZones.map(() => kpi.avgCostPerBox),
          borderColor: '#0ea5e9', borderDash: [6, 4], borderWidth: 2, pointRadius: 0
        }
      ]
    },
    options: {
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtNum(ctx.parsed.y) + ' บาท' } } },
      scales: baseScales({ yCallback: v => v + ' ฿' })
    }
  });

  // --- สัดส่วนพื้นที่ ---
  createChart('chart-od-share', {
    type: 'doughnut',
    data: {
      labels: data.deliveryZones.map(z => z.zone),
      datasets: [{
        data: data.deliveryZones.map(z => z.sharePct),
        backgroundColor: CHART_COLORS.slice(0, data.deliveryZones.length),
        borderColor: 'rgba(255,255,255,0.75)', borderWidth: 2
      }]
    },
    options: {
      cutout: '52%',
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.label + ': ' + ctx.parsed + '%' } } }
    }
  });

  // --- ส่งตรงเวลา ---
  createChart('chart-od-ontime', {
    type: 'bar',
    data: {
      labels: data.deliveryZones.map(z => z.zone),
      datasets: [
        {
          label: 'ส่งตรงเวลา (%)',
          data: data.deliveryZones.map(z => z.onTimePct),
          backgroundColor: data.deliveryZones.map(z => z.onTimePct >= 95 ? 'rgba(22,163,74,0.8)' : z.onTimePct >= 90 ? 'rgba(245,158,11,0.8)' : 'rgba(225,29,72,0.8)'),
          borderRadius: 5
        },
        {
          type: 'line',
          label: 'เป้าหมาย 95%',
          data: data.deliveryZones.map(() => kpi.onTimeTargetPct),
          borderColor: '#e11d48', borderDash: [6, 4], borderWidth: 2, pointRadius: 0
        }
      ]
    },
    options: {
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y + '%' } } },
      scales: baseScales({ yCallback: v => v + '%', beginAtZero: false })
    }
  });

  // --- SLA (ไม่รวมข้ามคืน) ---
  const slaZones = data.deliveryZones.filter(z => z.slaMinutes < 1440);
  createChart('chart-od-sla', {
    type: 'bar',
    data: {
      labels: slaZones.map(z => z.zone),
      datasets: [{
        label: 'เวลาจัดส่ง (นาที)',
        data: slaZones.map(z => z.slaMinutes),
        backgroundColor: 'rgba(0,191,165,0.8)',
        borderRadius: 5
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.x + ' นาที' } } },
      scales: baseScales({ xCallback: v => v + ' น.' })
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
      ${buildFilterBar([REGION_FILTER, YEAR_FILTER])}
      <div class="od-body"></div>
    </div>`;

    const body = container.querySelector('.od-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('ops-delivery mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
