/**
 * mkt-channel.js — ช่องทางขายและความคุ้มค่าของแต่ละช่องทาง
 */

import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import {
  buildFilterBar, onFilterChange, getFilterValues,
  CHANNEL_FILTER, YEAR_FILTER
} from '../../shared/filter-builder.js';
import { getYearFactor } from '../../shared/filter-data.js';
import {
  kpiGrid, chartCard, chartGrid, panel, dataTable, noteBox, assumptionBar,
  fmtNum, fmtBaht, fmtPct, pill, baseScales, legendOpts, loadingHTML, errorHTML
} from '../../shared/ui-kit.js';
import { aiPanel } from '../../shared/ai-analyst.js';

let mountId = 0;
let filterCleanup = null;

const BASE_REVENUE_Y1 = 20892300;
const CONTRIBUTION_BASE = 55;   // บาท/กล่อง ก่อนหักค่าธรรมเนียมช่องทาง
const AVG_PRICE = 165;

function renderContent(root, data, f) {
  destroyAll();

  const yf = getYearFactor(f);
  const channels = f.channel && f.channel !== 'all'
    ? data.channels.filter(c => c.id === f.channel)
    : data.channels;

  // กำไรส่วนเกินสุทธิของแต่ละช่องทาง = ฐาน 55 บาท + ค่าธรรมเนียมเฉลี่ย 10 บาท − ค่าธรรมเนียมจริงของช่องทาง
  const withMath = data.channels.map(c => {
    const fee = Math.round(AVG_PRICE * c.feePct / 100);
    const contribution = CONTRIBUTION_BASE + 10 - fee;
    const revenue = Math.round(BASE_REVENUE_Y1 * yf * c.sharePct / 100);
    const boxes = Math.round(revenue / AVG_PRICE);
    return {
      ...c, fee, contribution, revenue, boxes,
      grossContribution: contribution * boxes,
      ltvCacRatio: c.cac ? +((contribution * c.repeatRatePct / 100 * 12) / c.cac).toFixed(1) : 0
    };
  });
  const shown = f.channel && f.channel !== 'all' ? withMath.filter(c => c.id === f.channel) : withMath;

  const totalRevenue = shown.reduce((s, c) => s + c.revenue, 0);
  const totalContribution = shown.reduce((s, c) => s + c.grossContribution, 0);
  const bestChannel = withMath.reduce((a, b) => (b.contribution > a.contribution ? b : a), withMath[0]);
  const worstChannel = withMath.reduce((a, b) => (b.contribution < a.contribution ? b : a), withMath[0]);

  const kpis = [
    { icon: '💰', label: 'ยอดขายจากช่องทางที่เลือก', value: fmtBaht(totalRevenue), sub: shown.length + ' ช่องทาง', tone: 'positive' },
    { icon: '📗', label: 'กำไรส่วนเกินรวม', value: fmtBaht(totalContribution), sub: fmtPct(totalRevenue ? (totalContribution / totalRevenue) * 100 : 0) + ' ของยอดขาย', tone: 'positive' },
    { icon: '🏆', label: 'ช่องทางกำไรดีที่สุด', value: bestChannel.name.split(' /')[0], sub: fmtNum(bestChannel.contribution) + ' บาท/กล่อง', tone: 'positive' },
    { icon: '⚠️', label: 'ช่องทางกำไรน้อยที่สุด', value: worstChannel.name.split(' (')[0], sub: fmtNum(worstChannel.contribution) + ' บาท/กล่อง', tone: 'negative' }
  ];

  const rows = withMath.map(c => ({
    name: c.name,
    sharePct: c.sharePct,
    feePct: c.feePct,
    contribution: c.contribution,
    cac: c.cac,
    repeatRatePct: c.repeatRatePct,
    aov: c.aov,
    verdict: c.contribution >= 55 ? pill('ดันเต็มที่', 'positive')
      : c.contribution >= 40 ? pill('ทำต่อ', 'info')
      : pill('ใช้หาลูกค้าใหม่เท่านั้น', 'warning')
  }));

  root.innerHTML =
    assumptionBar('กำไรส่วนเกินต่อกล่องคำนวณจากราคาเฉลี่ย 165 บาท หัก <strong>ค่าธรรมเนียมจริงของแต่ละช่องทาง</strong> — ช่องทางที่ค่าธรรมเนียมสูงจึงเหลือกำไรน้อยกว่ามาก') +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('กำไรส่วนเกินต่อกล่องแต่ละช่องทาง (บาท)', 'chart-mc-contrib', { tall: true, note: 'เส้นประคือค่าเฉลี่ยที่ใช้ในแผนการเงิน (55 บาท/กล่อง)' }),
      chartCard('สัดส่วนยอดขายตามช่องทาง', 'chart-mc-share', { tall: true })
    ) +
    chartGrid(
      chartCard('ต้นทุนหาลูกค้า (CAC) เทียบ อัตราสั่งซ้ำ', 'chart-mc-cac', { tall: true, note: 'ช่องทางที่อยู่ซ้ายบน (CAC ต่ำ สั่งซ้ำสูง) คือช่องทางที่ควรลงงบมากที่สุด' }),
      chartCard('งบการตลาดต่อเดือนตามช่องทาง (บาท)', 'chart-mc-budget', { tall: true })
    ) +
    panel('เปรียบเทียบช่องทางขาย', dataTable([
      { key: 'name', label: 'ช่องทาง' },
      { key: 'sharePct', label: 'สัดส่วนยอด', align: 'right', fmt: v => fmtPct(v, 0) },
      { key: 'feePct', label: 'ค่าธรรมเนียม', align: 'right', fmt: v => fmtPct(v, 0) },
      { key: 'contribution', label: 'กำไรส่วนเกิน/กล่อง', align: 'right', fmt: v => fmtNum(v) },
      { key: 'cac', label: 'CAC (บาท)', align: 'right', fmt: v => fmtNum(v) },
      { key: 'repeatRatePct', label: 'สั่งซ้ำ', align: 'right', fmt: v => fmtPct(v, 0) },
      { key: 'aov', label: 'ยอด/ครั้ง (บาท)', align: 'right', fmt: v => fmtNum(v) },
      { key: 'verdict', label: 'ข้อเสนอ', align: 'center' }
    ], rows)) +
    panel('บทบาทของแต่ละช่องทาง',
      '<div class="hb-cards">' + data.channels.map(c => `
        <div class="hb-card">
          <div class="hb-card-head">
            <div>
              <div class="hb-card-title">${c.name}</div>
              <div class="hb-card-sub">สัดส่วน ${c.sharePct}% · ค่าธรรมเนียม ${c.feePct}% · CAC ${fmtNum(c.cac)} บาท</div>
            </div>
          </div>
          <p>${c.role}</p>
        </div>`).join('') + '</div>'
    ) +
    noteBox('📣 กลยุทธ์ช่องทางที่แนะนำ', [
      { badge: 'ช่องทางหลัก', tone: 'opportunity', text: 'LINE OA เหลือกำไรส่วนเกิน ' + fmtNum(withMath.find(c => c.id === 'line').contribution) + ' บาท/กล่อง สูงสุดในกลุ่มลูกค้ารายบุคคล — ทุกกล่องควรมีคูปองชวนสั่งครั้งต่อไปผ่าน LINE' },
      { badge: 'องค์กรคุ้มสุด', tone: 'opportunity', text: 'ช่องทางองค์กรไม่มีค่าธรรมเนียม สั่งซ้ำ 76% และยอดต่อครั้ง 6,400 บาท — ปิดได้ 1 บริษัทเท่ากับลูกค้ารายบุคคล 30 คน' },
      { badge: 'อย่าพึ่งพา', tone: 'warning', text: 'แอปเดลิเวอรีเหลือกำไรส่วนเกินเพียง ' + fmtNum(withMath.find(c => c.id === 'delivery').contribution) + ' บาท/กล่อง — ใช้เพื่อให้คนรู้จักแบรนด์ ไม่ควรเกิน 30% ของยอดขาย' },
      { badge: 'ทดลองก่อนขยาย', tone: 'info', text: 'ตู้แช่มี CAC ต่ำสุด (40 บาท) แต่สั่งซ้ำแค่ 31% — ทดลอง 5 จุดและวัดยอดต่อตู้ต่อวันก่อนตัดสินใจลงทุนเพิ่ม' }
    ]);


  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('mkt-channel', { data, filters: f }));
  // --- กำไรส่วนเกินต่อช่องทาง ---
  createChart('chart-mc-contrib', {
    type: 'bar',
    data: {
      labels: withMath.map(c => c.name),
      datasets: [
        {
          label: 'กำไรส่วนเกิน (บาท/กล่อง)',
          data: withMath.map(c => c.contribution),
          backgroundColor: withMath.map(c => c.contribution >= 55 ? 'rgba(22,163,74,0.85)' : c.contribution >= 40 ? 'rgba(245,158,11,0.85)' : 'rgba(225,29,72,0.85)'),
          borderRadius: 5
        },
        {
          type: 'line',
          label: 'ค่าเฉลี่ยในแผน 55 บาท',
          data: withMath.map(() => CONTRIBUTION_BASE),
          borderColor: '#0ea5e9', borderDash: [6, 4], borderWidth: 2, pointRadius: 0
        }
      ]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtNum(ctx.parsed.x) + ' บาท' } } },
      scales: baseScales({ xCallback: v => v + ' ฿' })
    }
  });

  // --- สัดส่วนยอดขาย ---
  createChart('chart-mc-share', {
    type: 'doughnut',
    data: {
      labels: data.channels.map(c => c.name),
      datasets: [{
        data: data.channels.map(c => c.sharePct),
        backgroundColor: CHART_COLORS.slice(0, data.channels.length),
        borderColor: 'rgba(255,255,255,0.75)', borderWidth: 2
      }]
    },
    options: {
      cutout: '52%',
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.label + ': ' + ctx.parsed + '%' } } }
    }
  });

  // --- CAC vs สั่งซ้ำ ---
  createChart('chart-mc-cac', {
    type: 'bubble',
    data: {
      datasets: data.channels.map((c, i) => ({
        label: c.name,
        data: [{ x: c.cac, y: c.repeatRatePct, r: 8 + c.sharePct * 0.5 }],
        backgroundColor: CHART_COLORS[i % CHART_COLORS.length] + 'CC',
        borderColor: CHART_COLORS[i % CHART_COLORS.length]
      }))
    },
    options: {
      plugins: {
        legend: legendOpts(),
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': CAC ' + fmtNum(ctx.parsed.x) + ' บาท, สั่งซ้ำ ' + ctx.parsed.y + '%' } }
      },
      scales: {
        x: {
          type: 'logarithmic',
          ticks: { color: baseScales().x.ticks.color, callback: v => fmtNum(v) },
          grid: baseScales().x.grid,
          title: { display: true, text: 'ต้นทุนหาลูกค้าใหม่ (บาท, สเกลลอการิทึม)', color: baseScales().x.ticks.color }
        },
        y: { ...baseScales({ yCallback: v => v + '%' }).y, title: { display: true, text: 'อัตราสั่งซ้ำ', color: baseScales().y.ticks.color } }
      }
    }
  });

  // --- งบการตลาด ---
  createChart('chart-mc-budget', {
    type: 'bar',
    data: {
      labels: data.channels.map(c => c.name),
      datasets: [{
        label: 'งบต่อเดือน (บาท)',
        data: data.channels.map(c => c.monthlyBudget),
        backgroundColor: 'rgba(0,191,165,0.8)',
        borderRadius: 5
      }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => fmtNum(ctx.parsed.y) + ' บาท/เดือน' } } },
      scales: baseScales({ yCallback: v => (v / 1000) + 'k' })
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
      ${buildFilterBar([CHANNEL_FILTER, YEAR_FILTER])}
      <div class="mc-body"></div>
    </div>`;

    const body = container.querySelector('.mc-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('mkt-channel mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
