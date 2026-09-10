/**
 * ops-capacity.js — ครัวกลางและกำลังผลิต
 */

import { createChart, destroyAll } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import {
  buildFilterBar, onFilterChange, getFilterValues,
  YEAR_FILTER, PERIOD_FILTER, SCENARIO_FILTER
} from '../../shared/filter-builder.js';
import { varyValue, getMonthSlice, getScenarioFactor, getYearFactor } from '../../shared/filter-data.js';
import {
  kpiGrid, chartCard, chartGrid, panel, dataTable, noteBox, assumptionBar,
  fmtNum, fmtPct, pill, baseScales, legendOpts, loadingHTML, errorHTML
} from '../../shared/ui-kit.js';
import { aiPanel } from '../../shared/ai-analyst.js';

let mountId = 0;
let filterCleanup = null;

function renderContent(root, data, f) {
  destroyAll();

  const kt = data.kitchen;
  const yf = getYearFactor(f);
  const sf = getScenarioFactor(f);
  const ramp = data.capacityRamp;

  // ปีที่ 2-3 ต้องขยายกำลังผลิต (ปีที่ 3 เปิดครัวที่ 2)
  const plannedCapacity = yf >= 3 ? kt.capacityPerDay * 2 : kt.capacityPerDay;
  const actualSeries = ramp.actual.map((v, i) => Math.round(v * yf * sf));
  const capacitySeries = ramp.capacity.map(v => yf >= 3 ? v * 2 : v);

  const peakActual = Math.max(...actualSeries);
  const avgActual = Math.round(actualSeries.reduce((s, v) => s + v, 0) / actualSeries.length);
  const utilization = +((peakActual / plannedCapacity) * 100).toFixed(1);
  const bottleneck = data.stations.reduce((a, b) => (b.capacityBoxes < a.capacityBoxes ? b : a), data.stations[0]);

  const kpis = [
    { icon: '🏭', label: 'กำลังผลิตสูงสุด', value: fmtNum(plannedCapacity) + ' กล่อง/วัน', sub: yf >= 3 ? 'รวมครัวที่ 2' : kt.shiftsPerDay + ' กะ × ' + fmtNum(kt.capacityPerShift) + ' กล่อง', tone: 'neutral' },
    { icon: '📦', label: 'ผลิตเฉลี่ยตามแผน', value: fmtNum(avgActual) + ' กล่อง/วัน', sub: 'สูงสุด ' + fmtNum(peakActual) + ' กล่อง/วัน', tone: 'positive' },
    { icon: '⚙️', label: 'อัตราใช้กำลังผลิตที่จุดพีค', value: fmtPct(utilization), sub: utilization > 92 ? 'ต้องขยายกำลังผลิต' : 'ยังรับงานเพิ่มได้', tone: utilization > 92 ? 'negative' : 'positive' },
    { icon: '👩‍🍳', label: 'พนักงานครัว', value: fmtNum(Math.round(kt.staffCount * Math.max(1, yf * 0.75))) + ' คน', sub: 'ปีที่ 1 เริ่มที่ ' + kt.staffCount + ' คน', tone: 'neutral' },
    { icon: '🔧', label: 'คอขวดของสายผลิต', value: bottleneck.name, sub: 'รับได้ ' + fmtNum(bottleneck.capacityBoxes) + ' กล่อง/วัน', tone: 'negative' },
    { icon: '📐', label: 'พื้นที่ครัว', value: '180 ตร.ม.', sub: kt.location, tone: 'neutral' },
    { icon: '✅', label: 'มาตรฐาน', value: 'GMP + อย.', sub: kt.standard, tone: 'positive' },
    { icon: '🕒', label: 'ช่วงเวลาผลิต', value: '02:00 - 08:00', sub: 'รอบเช้าส่งก่อน 11:00', tone: 'neutral' }
  ];

  const stationRows = data.stations.map(s => ({
    name: s.name,
    staff: s.staff,
    capacityBoxes: s.capacityBoxes,
    headroom: s.capacityBoxes - peakActual,
    status: s.capacityBoxes <= peakActual
      ? pill('ไม่พอ', 'negative')
      : s.capacityBoxes - peakActual < 100 ? pill('ตึง', 'warning') : pill('พอ', 'positive'),
    note: s.note
  }));

  const sliced = getMonthSlice(ramp.labels, actualSeries, f);
  const slicedCap = getMonthSlice(ramp.labels, capacitySeries, f);

  root.innerHTML =
    assumptionBar('กำลังผลิตอ้างอิงจากผังครัว 180 ตร.ม. ' + kt.shiftsPerDay + ' กะ — <strong>' + kt.standard + '</strong>') +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('กำลังผลิต เทียบ ยอดผลิตตามแผน', 'chart-oc-ramp', { tall: true, note: 'เมื่อเส้นยอดผลิตชนกำลังผลิต ต้องเปิดกะเพิ่มหรือขยายครัว' }),
      chartCard('อัตราใช้กำลังผลิตรายเดือน (%)', 'chart-oc-util', { tall: true })
    ) +
    chartGrid(
      chartCard('กำลังรับงานของแต่ละสถานี (กล่อง/วัน)', 'chart-oc-station', { tall: true, note: 'สถานีที่เตี้ยที่สุดคือคอขวดที่กำหนดกำลังผลิตรวม' }),
      panel('รายละเอียดสถานีผลิต', dataTable([
        { key: 'name', label: 'สถานี' },
        { key: 'staff', label: 'คน', align: 'right' },
        { key: 'capacityBoxes', label: 'รับได้ (กล่อง/วัน)', align: 'right', fmt: v => fmtNum(v) },
        { key: 'status', label: 'สถานะที่จุดพีค', align: 'center' },
        { key: 'note', label: 'หมายเหตุ' }
      ], stationRows))
    ) +
    panel('การควบคุมคุณภาพ (QC)', dataTable([
      { key: 'point', label: 'จุดตรวจ' },
      { key: 'check', label: 'สิ่งที่ตรวจ' },
      { key: 'frequency', label: 'ความถี่' }
    ], data.qualityControl)) +
    noteBox('🏭 ข้อควรตัดสินใจด้านการผลิต', [
      { badge: 'คอขวด', tone: 'warning', text: 'สถานีปรุง (Hot line) รับได้ ' + fmtNum(bottleneck.capacityBoxes) + ' กล่อง/วัน เป็นตัวกำหนดกำลังผลิตรวม — ถ้าจะเกินนี้ต้องเพิ่มเตาและคนอีก 2 ตำแหน่ง' },
      { badge: 'จุดตัดสินใจ', tone: 'info', text: 'เมื่อยอดผลิตถึง 620 กล่อง/วัน (ราวเดือนที่ 12) ควรเริ่มมองหาพื้นที่ครัวที่ 2 ล่วงหน้า 6 เดือน' },
      { badge: 'ความปลอดภัย', tone: 'alert', text: 'ต้องบันทึกอุณหภูมิทุก 2 ชั่วโมงและเก็บตัวอย่างอาหารทุกล็อต 48 ชั่วโมง — เป็นเงื่อนไขที่ลูกค้าองค์กรตรวจก่อนเซ็นสัญญา' },
      { badge: 'ประสิทธิภาพ', tone: 'opportunity', text: 'ทำสูตรมาตรฐานเป็นเอกสารและชั่งพอร์ชันล่วงหน้า ช่วยลดของเสียจาก 5% เหลือ 3% เท่ากับประหยัดราว 25,000 บาท/เดือน' }
    ]);


  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('ops-capacity', { data, filters: f }));
  // --- กำลังผลิต vs ยอดผลิต ---
  createChart('chart-oc-ramp', {
    type: 'line',
    data: {
      labels: sliced.labels,
      datasets: [
        {
          label: 'ยอดผลิตตามแผน (กล่อง/วัน)',
          data: sliced.data,
          borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.14)',
          fill: true, tension: 0.3, borderWidth: 2.5, pointRadius: 3
        },
        {
          label: 'กำลังผลิตที่มี',
          data: slicedCap.data,
          borderColor: '#0ea5e9', borderDash: [6, 4], borderWidth: 2, pointRadius: 0, fill: false
        }
      ]
    },
    options: {
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtNum(ctx.parsed.y) } } },
      scales: baseScales({ yCallback: v => fmtNum(v) })
    }
  });

  // --- อัตราใช้กำลังผลิต ---
  const utilSeries = actualSeries.map((v, i) => +((v / capacitySeries[i]) * 100).toFixed(1));
  const slicedUtil = getMonthSlice(ramp.labels, utilSeries, f);
  createChart('chart-oc-util', {
    type: 'bar',
    data: {
      labels: slicedUtil.labels,
      datasets: [
        {
          label: 'อัตราใช้กำลังผลิต (%)',
          data: slicedUtil.data,
          backgroundColor: slicedUtil.data.map(v => v > 92 ? 'rgba(225,29,72,0.8)' : v >= 60 ? 'rgba(22,163,74,0.8)' : 'rgba(245,158,11,0.8)'),
          borderRadius: 5
        },
        {
          type: 'line',
          label: 'เป้าหมาย ' + kt.utilizationTargetPct + '%',
          data: slicedUtil.labels.map(() => kt.utilizationTargetPct),
          borderColor: '#00bfa5', borderDash: [6, 4], borderWidth: 2, pointRadius: 0
        }
      ]
    },
    options: {
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y + '%' } } },
      scales: baseScales({ yCallback: v => v + '%' })
    }
  });

  // --- สถานี ---
  createChart('chart-oc-station', {
    type: 'bar',
    data: {
      labels: data.stations.map(s => s.name),
      datasets: [
        {
          label: 'กำลังรับงาน (กล่อง/วัน)',
          data: data.stations.map(s => s.capacityBoxes),
          backgroundColor: data.stations.map(s => s.capacityBoxes === bottleneck.capacityBoxes ? 'rgba(225,29,72,0.8)' : 'rgba(0,191,165,0.8)'),
          borderRadius: 5
        },
        {
          type: 'line',
          label: 'ยอดผลิตที่จุดพีค',
          data: data.stations.map(() => peakActual),
          borderColor: '#f59e0b', borderDash: [6, 4], borderWidth: 2, pointRadius: 0
        }
      ]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => fmtNum(ctx.parsed.x !== undefined ? ctx.parsed.x : ctx.parsed.y) + ' กล่อง/วัน' } } },
      scales: baseScales({ xCallback: v => fmtNum(v) })
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
      ${buildFilterBar([YEAR_FILTER, PERIOD_FILTER, SCENARIO_FILTER])}
      <div class="oc-body"></div>
    </div>`;

    const body = container.querySelector('.oc-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('ops-capacity mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
