/**
 * plan-roadmap.js — ไทม์ไลน์ 12 เดือนและ KPI ที่ต้องติดตาม
 */

import { createChart, destroyAll } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import {
  buildFilterBar, onFilterChange, getFilterValues,
  STATUS_FILTER, PRIORITY_FILTER
} from '../../shared/filter-builder.js';
import { filterByField } from '../../shared/filter-data.js';
import {
  kpiGrid, chartCard, chartGrid, panel, dataTable, noteBox, assumptionBar,
  fmtNum, fmtPct, pill, baseScales, legendOpts, loadingHTML, errorHTML, emptyHTML
} from '../../shared/ui-kit.js';
import { aiPanel } from '../../shared/ai-analyst.js';

let mountId = 0;
let filterCleanup = null;

const STATUS_LABEL = { done: 'เสร็จแล้ว', doing: 'กำลังทำ', todo: 'รอเริ่ม' };
const STATUS_TONE = { done: 'positive', doing: 'warning', todo: 'neutral' };
const PRIORITY_LABEL = { high: 'สูง', medium: 'กลาง', low: 'ต่ำ' };
const PRIORITY_TONE = { high: 'negative', medium: 'warning', low: 'neutral' };

function timeline(items, phases) {
  const byPhase = phases.map(p => ({
    phase: p,
    items: items.filter(m => m.phase === p.id)
  })).filter(g => g.items.length);

  if (!byPhase.length) return '<p class="hb-chart-note">ไม่มีงานในเงื่อนไขที่เลือก</p>';

  return byPhase.map(g => `
    <h4 style="margin:18px 0 10px;color:var(--text-heading)">${g.phase.name} <span class="hb-card-sub">(${g.phase.months}) — ${g.phase.goal}</span></h4>
    <div class="hb-timeline">
      ${g.items.map(m => `
        <div class="hb-tl-item ${m.status}">
          <div class="hb-tl-phase">เดือนที่ ${m.month} · ผู้รับผิดชอบ: ${m.owner}</div>
          <div class="hb-tl-title">${m.title}</div>
          <div class="hb-tl-desc">${m.desc}</div>
          <div class="hb-tl-meta">
            ${pill(STATUS_LABEL[m.status] || m.status, STATUS_TONE[m.status] || 'neutral')}
            ${pill('ความสำคัญ: ' + (PRIORITY_LABEL[m.priority] || m.priority), PRIORITY_TONE[m.priority] || 'neutral')}
          </div>
        </div>`).join('')}
    </div>`).join('');
}

function renderContent(root, data, f) {
  destroyAll();

  let items = filterByField(data.milestones, f, 'status');
  items = filterByField(items, f, 'priority');

  const all = data.milestones;
  const done = all.filter(m => m.status === 'done').length;
  const doing = all.filter(m => m.status === 'doing').length;
  const todo = all.filter(m => m.status === 'todo').length;
  const highPriority = all.filter(m => m.priority === 'high').length;
  const progressPct = +((done / all.length) * 100).toFixed(1);

  const kpis = [
    { icon: '🗂️', label: 'งานทั้งหมดในแผน', value: fmtNum(all.length) + ' งาน', sub: 'ตั้งแต่เตรียมงานถึงเดือนที่ 12', tone: 'neutral' },
    { icon: '✅', label: 'ความคืบหน้า', value: fmtPct(progressPct), sub: 'เสร็จ ' + done + ' จาก ' + all.length + ' งาน', tone: 'positive' },
    { icon: '🔨', label: 'กำลังทำ', value: fmtNum(doing) + ' งาน', sub: 'ต้องติดตามรายสัปดาห์', tone: 'warning' },
    { icon: '⏳', label: 'รอเริ่ม', value: fmtNum(todo) + ' งาน', sub: 'มีงานสำคัญสูง ' + highPriority + ' งาน', tone: 'neutral' }
  ];

  const kpiRows = data.kpis.map(k => ({
    name: k.name,
    target: k.target,
    current: k.current,
    frequency: k.frequency,
    owner: k.owner
  }));

  const phaseCounts = data.phases.map(p => ({
    name: p.name,
    total: all.filter(m => m.phase === p.id).length,
    done: all.filter(m => m.phase === p.id && m.status === 'done').length,
    doing: all.filter(m => m.phase === p.id && m.status === 'doing').length,
    todo: all.filter(m => m.phase === p.id && m.status === 'todo').length
  }));

  root.innerHTML =
    assumptionBar('เดือนที่ 0 = เดือนเปิดขายจริง เดือนติดลบคือช่วงเตรียมงาน — <strong>' + data.note + '</strong>') +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('สถานะงานในแต่ละช่วง', 'chart-pr-phase', { tall: true }),
      chartCard('จำนวนงานตามเดือน', 'chart-pr-month', { tall: true, note: 'เดือน -3 ถึง 0 เป็นช่วงเตรียมงานก่อนเปิดขาย' })
    ) +
    panel('KPI ที่ต้องติดตามหลังเปิดขาย', dataTable([
      { key: 'name', label: 'ตัวชี้วัด' },
      { key: 'target', label: 'เป้าหมาย' },
      { key: 'current', label: 'ค่าปัจจุบัน', align: 'center' },
      { key: 'frequency', label: 'ความถี่ในการวัด', align: 'center' },
      { key: 'owner', label: 'ผู้รับผิดชอบ' }
    ], kpiRows), { note: 'ค่าปัจจุบันจะกรอกได้เมื่อเริ่มขายจริง — ตอนนี้เป็นเป้าหมายที่ตั้งไว้ทั้งหมด' }) +
    `<h3 class="chart-card-title" style="margin:24px 0 4px">ไทม์ไลน์งาน${items.length !== all.length ? ' (กรองแล้ว ' + items.length + ' จาก ' + all.length + ' งาน)' : ''}</h3>` +
    timeline(items, data.phases) +
    noteBox('📅 จุดที่พลาดไม่ได้', [
      { badge: 'ก่อนเปิดขาย', tone: 'alert', text: 'ใบอนุญาต อย. และระบบ GMP ต้องเสร็จก่อนวันเปิดขาย — ถ้าไม่มีจะขายให้องค์กรและขึ้นแอปเดลิเวอรีไม่ได้' },
      { badge: 'เดือนที่ 3', tone: 'info', text: 'ทบทวนเมนูจากข้อมูลจริง 8 สัปดาห์ — ตัดเมนูที่ขายช้าออกเร็วช่วยลดของเสียและต้นทุนวัตถุดิบทันที' },
      { badge: 'เดือนที่ 6', tone: 'opportunity', text: 'เป้าหมายสำคัญที่สุดของปีแรกคือถึงจุดคุ้มทุน 364 กล่อง/วัน — ถ้าเดือนที่ 6 ยังไม่ถึง ต้องทบทวนราคาและช่องทางทันที' },
      { badge: 'เดือนที่ 9', tone: 'warning', text: 'การเปิดกะที่ 2 ต้องจ้างและอบรมล่วงหน้า 1 เดือน — ถ้าจ้างช้าจะรับออเดอร์ช่วงพีคปลายปีไม่ทัน' }
    ]);


  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('plan-roadmap', { data, filters: f }));
  // --- สถานะงานตามช่วง ---
  createChart('chart-pr-phase', {
    type: 'bar',
    data: {
      labels: phaseCounts.map(p => p.name),
      datasets: [
        { label: 'เสร็จแล้ว', data: phaseCounts.map(p => p.done), backgroundColor: 'rgba(22,163,74,0.85)', borderRadius: 4 },
        { label: 'กำลังทำ', data: phaseCounts.map(p => p.doing), backgroundColor: 'rgba(245,158,11,0.85)', borderRadius: 4 },
        { label: 'รอเริ่ม', data: phaseCounts.map(p => p.todo), backgroundColor: 'rgba(148,163,184,0.85)', borderRadius: 4 }
      ]
    },
    options: {
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y + ' งาน' } } },
      scales: {
        x: baseScales({ stacked: true }).x,
        y: baseScales({ stacked: true, yCallback: v => v }).y
      }
    }
  });

  // --- งานตามเดือน ---
  const months = [...new Set(all.map(m => m.month))].sort((a, b) => a - b);
  createChart('chart-pr-month', {
    type: 'bar',
    data: {
      labels: months.map(m => m <= 0 ? 'เตรียม ' + m : 'เดือน ' + m),
      datasets: [{
        label: 'จำนวนงาน',
        data: months.map(m => all.filter(x => x.month === m).length),
        backgroundColor: months.map(m => m <= 0 ? 'rgba(148,163,184,0.85)' : 'rgba(0,191,165,0.85)'),
        borderRadius: 4
      }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.y + ' งาน' } } },
      scales: baseScales({ yCallback: v => v })
    }
  });
}

export async function mount(container) {
  const thisMount = ++mountId;
  container.innerHTML = loadingHTML();

  try {
    const data = await fetchJSON('/data/plan.json');
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">
      ${buildFilterBar([STATUS_FILTER, PRIORITY_FILTER])}
      <div class="pr-body"></div>
    </div>`;

    const body = container.querySelector('.pr-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('plan-roadmap mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
