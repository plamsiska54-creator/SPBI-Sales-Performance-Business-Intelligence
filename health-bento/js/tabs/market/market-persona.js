/**
 * market-persona.js — กลุ่มลูกค้าเป้าหมายและตัวอย่างลูกค้า (persona)
 */

import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import {
  buildFilterBar, onFilterChange, getFilterValues,
  CUSTOMER_FILTER, REGION_FILTER
} from '../../shared/filter-builder.js';
import { varyValue, varyPercent } from '../../shared/filter-data.js';
import {
  kpiGrid, chartCard, chartGrid, panel, dataTable, noteBox, assumptionBar,
  fmtNum, fmtPct, baseScales, legendOpts, loadingHTML, errorHTML
} from '../../shared/ui-kit.js';
import { aiPanel } from '../../shared/ai-analyst.js';

let mountId = 0;
let filterCleanup = null;

function personaCards(personas) {
  const cards = personas.map(p => `
    <div class="hb-card">
      <div class="hb-card-head">
        <span class="hb-card-emoji">${p.emoji}</span>
        <div>
          <div class="hb-card-title">${p.name}</div>
          <div class="hb-card-sub">${p.profile}</div>
        </div>
      </div>
      <p><strong>สิ่งที่ต้องการ</strong></p>
      <ul>${p.needs.map(n => `<li>${n}</li>`).join('')}</ul>
      <p style="margin-top:10px"><strong>ปัญหาที่เจออยู่</strong></p>
      <ul>${p.pains.map(n => `<li>${n}</li>`).join('')}</ul>
      <p style="margin-top:10px"><strong>ช่องทางที่เหมาะ:</strong> ${p.channel}</p>
      <p><strong>ยอมจ่าย:</strong> ${p.willingnessToPay}</p>
    </div>`).join('');
  return `<div class="hb-cards">${cards}</div>`;
}

function renderContent(root, data, f) {
  destroyAll();

  const selected = f.customer && f.customer !== 'all'
    ? data.segments.filter(s => s.id === f.customer)
    : data.segments;
  const segs = selected.length ? selected : data.segments;

  const totalShare = segs.reduce((s, x) => s + x.sizePct, 0);
  // ยอดต่อครั้งของกลุ่มองค์กรสูงกว่ารายบุคคลหลายสิบเท่า จึงคิดค่าเฉลี่ยแยกกัน
  const b2c = segs.filter(x => x.id !== 'corporate');
  const b2cShare = b2c.reduce((s, x) => s + x.sizePct, 0);
  const weightedAov = b2c.length
    ? b2c.reduce((s, x) => s + x.avgOrderValue * x.sizePct, 0) / (b2cShare || 1)
    : segs[0].avgOrderValue;
  const weightedFreq = segs.reduce((s, x) => s + x.ordersPerMonth * x.sizePct, 0) / (totalShare || 1);
  const bestGrowth = segs.reduce((a, b) => (b.growthPct > a.growthPct ? b : a), segs[0]);

  const kpis = [
    { icon: '👥', label: 'สัดส่วนกลุ่มที่เลือก', value: fmtPct(totalShare, 0), sub: segs.length + ' กลุ่ม', tone: 'neutral' },
    { icon: '🧾', label: 'ยอดต่อครั้งเฉลี่ย (รายบุคคล)', value: fmtNum(Math.round(weightedAov)) + ' บาท', sub: b2c.length ? 'ถ่วงน้ำหนักตามขนาดกลุ่ม' : 'กลุ่มองค์กร', tone: 'positive' },
    { icon: '🔁', label: 'ความถี่การสั่งเฉลี่ย', value: weightedFreq.toFixed(1) + ' ครั้ง/เดือน', sub: 'ยิ่งถี่ยิ่งคุ้มค่าโฆษณา', tone: 'positive' },
    { icon: '🚀', label: 'กลุ่มโตเร็วที่สุด', value: bestGrowth.name, sub: 'โต ' + fmtPct(bestGrowth.growthPct) + ' ต่อปี', tone: 'positive' }
  ];

  const rows = data.segments.map(s => ({
    name: s.name,
    sizePct: s.sizePct,
    avgOrderValue: s.avgOrderValue,
    ordersPerMonth: s.ordersPerMonth,
    monthlyValue: s.avgOrderValue * s.ordersPerMonth,
    growthPct: s.growthPct
  }));

  root.innerHTML =
    assumptionBar('สัดส่วนกลุ่มลูกค้าเป็น <strong>สมมติฐานเริ่มต้น</strong> ควรปรับด้วยข้อมูลออเดอร์จริงหลังขาย 3 เดือน') +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('สัดส่วนกลุ่มลูกค้าเป้าหมาย', 'chart-ps-share', { tall: true }),
      chartCard('ยอดต่อครั้ง เทียบ ความถี่การสั่ง', 'chart-ps-value', { tall: true, note: 'แสดงเฉพาะลูกค้ารายบุคคล (กลุ่มองค์กรมียอดต่อครั้ง 6,400 บาท ดูได้ในตารางด้านล่าง) — กลุ่มที่อยู่ขวาบนคือกลุ่มที่ควรทุ่มงบการตลาดมากที่สุด' })
    ) +
    panel('เปรียบเทียบกลุ่มลูกค้า', dataTable([
      { key: 'name', label: 'กลุ่มลูกค้า' },
      { key: 'sizePct', label: 'สัดส่วน', align: 'right', fmt: v => fmtPct(v, 0) },
      { key: 'avgOrderValue', label: 'ยอด/ครั้ง (บาท)', align: 'right', fmt: v => fmtNum(v) },
      { key: 'ordersPerMonth', label: 'ครั้ง/เดือน', align: 'right', fmt: v => fmtNum(v) },
      { key: 'monthlyValue', label: 'มูลค่า/เดือน/ลูกค้า (บาท)', align: 'right', fmt: v => fmtNum(v) },
      { key: 'growthPct', label: 'การเติบโต', align: 'right', fmt: v => fmtPct(v) }
    ], rows)) +
    `<h3 class="chart-card-title" style="margin:24px 0 12px">ตัวอย่างลูกค้า (Persona)</h3>` +
    personaCards(data.personas) +
    noteBox('🎯 สิ่งที่ควรทำต่อ', [
      { badge: 'กลุ่มหลัก', tone: 'opportunity', text: 'พนักงานออฟฟิศเป็นกลุ่มใหญ่สุด (38%) — ควรเน้นเมนู 145-175 บาท และแพ็กเกจ 5 มื้อ/สัปดาห์ที่สั่งครั้งเดียวจบ' },
      { badge: 'กำไรดีสุด', tone: 'opportunity', text: 'คนออกกำลังกายและกลุ่มควบคุมน้ำหนักสั่งถี่ 18-20 ครั้ง/เดือน — ต้นทุนหาลูกค้าคืนเร็วที่สุด ควรจับผ่านฟิตเนสและคลินิก' },
      { badge: 'ยอดต่อครั้งสูง', tone: 'info', text: 'องค์กรมียอดต่อครั้งเฉลี่ย 6,400 บาท แม้จำนวนลูกค้าน้อย — ปิดได้ 14 บริษัทในปีแรกเท่ากับ 22% ของยอดขายทั้งปี' },
      { badge: 'ยังไม่ควรลงลึก', tone: 'warning', text: 'กลุ่มผู้ป่วยเฉพาะโรคต้องมีนักโภชนาการรับรองรายบุคคล — ควรเริ่มแค่เมนูโซเดียมต่ำ/เบาหวาน 2 รายการก่อน' }
    ]);


  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('market-persona', { data, filters: f }));
  // --- โดนัทสัดส่วน ---
  createChart('chart-ps-share', {
    type: 'doughnut',
    data: {
      labels: data.segments.map(s => s.name),
      datasets: [{
        data: data.segments.map(s => varyPercent(s.sizePct, f, { seed: s.id.length })),
        backgroundColor: CHART_COLORS.slice(0, data.segments.length),
        borderColor: 'rgba(255,255,255,0.75)', borderWidth: 2
      }]
    },
    options: {
      cutout: '52%',
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.label + ': ' + ctx.parsed + '%' } } }
    }
  });

  // --- Bubble: ยอด/ครั้ง vs ความถี่ ---
  createChart('chart-ps-value', {
    type: 'bubble',
    data: {
      datasets: data.segments.filter(s => s.id !== 'corporate').map((s, i) => ({
        label: s.name,
        data: [{
          x: s.ordersPerMonth,
          y: varyValue(s.avgOrderValue, { year: f.year || '2569', region: f.region }, { seed: i, asInt: true, min: 50 }),
          r: Math.max(6, s.sizePct * 0.7)
        }],
        backgroundColor: CHART_COLORS[i % CHART_COLORS.length] + 'CC',
        borderColor: CHART_COLORS[i % CHART_COLORS.length]
      }))
    },
    options: {
      plugins: {
        legend: legendOpts(),
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label + ': ' + fmtNum(ctx.parsed.y) + ' บาท/ครั้ง, ' + ctx.parsed.x + ' ครั้ง/เดือน'
          }
        }
      },
      scales: {
        x: { ...baseScales({ xCallback: v => v + ' ครั้ง' }).x, title: { display: true, text: 'ความถี่การสั่ง (ครั้ง/เดือน)', color: baseScales().x.ticks.color } },
        y: { ...baseScales({ yCallback: v => fmtNum(v) }).y, title: { display: true, text: 'ยอดต่อครั้ง (บาท)', color: baseScales().y.ticks.color } }
      }
    }
  });
}

export async function mount(container) {
  const thisMount = ++mountId;
  container.innerHTML = loadingHTML();

  try {
    const data = await fetchJSON('/data/market.json');
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">
      ${buildFilterBar([CUSTOMER_FILTER, REGION_FILTER])}
      <div class="ps-body"></div>
    </div>`;

    const body = container.querySelector('.ps-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('market-persona mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
