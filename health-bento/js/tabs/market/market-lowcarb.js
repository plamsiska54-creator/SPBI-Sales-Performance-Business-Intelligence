/**
 * market-lowcarb.js — กลุ่มลูกค้าโปรตีนสูง / โลว์คาร์บ (อาหารลดคาร์โบไฮเดรต)
 * รวมเกณฑ์โภชนาการ กลุ่มลูกค้าย่อย เมนูสายโปรตีน ต้นทุน-กำไร และคู่แข่งที่ยืนยันราคาได้
 */

import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import {
  buildFilterBar, onFilterChange, getFilterValues,
  LOWCARB_SEGMENT_FILTER, DIET_TYPE_FILTER, SCENARIO_FILTER
} from '../../shared/filter-builder.js';
import { getScenarioFactor } from '../../shared/filter-data.js';
import {
  kpiGrid, chartCard, chartGrid, panel, dataTable, noteBox, assumptionBar,
  fmtNum, fmtPct, pill, baseScales, legendOpts, loadingHTML, errorHTML, emptyHTML
} from '../../shared/ui-kit.js';
import { aiPanel } from '../../shared/ai-analyst.js';

let mountId = 0;
let filterCleanup = null;

/** จัดประเภทเมนูตามเกณฑ์ใน lowcarb.json */
export function classifyMenu(item, standards) {
  const netCarb = item.carb - (item.fiber || 0);
  const keto = standards.rules.find(r => r.key === 'keto');
  const lowcarb = standards.rules.find(r => r.key === 'lowcarb');
  const hp = standards.rules.find(r => r.key === 'highprotein');
  return {
    netCarb,
    isKeto: netCarb <= keto.netCarbMax && item.protein >= keto.proteinMin,
    isLowCarb: netCarb <= lowcarb.netCarbMax && item.protein >= lowcarb.proteinMin,
    isHighProtein: item.protein >= hp.proteinMin,
    proteinKcalPct: +(((item.protein * 4) / item.kcal) * 100).toFixed(1)
  };
}

/** กำไรส่วนเกินต่อกล่องของเมนูสายโปรตีน (ขายผ่าน LINE OA) */
function contributionOf(item, e, priceOverride) {
  const price = priceOverride || item.price;
  const fee = price * (e.lineFeePct / 100);
  return +(price - item.foodCost - e.packagingPerBox - e.kitchenLaborPerBox - e.deliveryNetPerBox - fee).toFixed(1);
}

function renderContent(root, data, f) {
  destroyAll();

  const std = data.standards;
  const e = data.economics;
  const sf = getScenarioFactor(f);

  const items = data.menuLine.items.map(i => ({ ...i, ...classifyMenu(i, std) }));
  const filtered = items.filter(i => {
    if (f.diet === 'keto') return i.isKeto;
    if (f.diet === 'lowcarb') return i.isLowCarb;
    if (f.diet === 'highprotein') return i.isHighProtein;
    return true;
  });
  if (!filtered.length) {
    root.innerHTML = emptyHTML('ไม่มีเมนูที่ผ่านเกณฑ์ที่เลือก');
    return;
  }

  const segments = f.segment && f.segment !== 'all'
    ? data.segments.filter(s => s.id === f.segment)
    : data.segments;

  const avgProtein = filtered.reduce((s, i) => s + i.protein, 0) / filtered.length;
  const avgNetCarb = filtered.reduce((s, i) => s + i.netCarb, 0) / filtered.length;
  const avgFoodCost = filtered.reduce((s, i) => s + i.foodCost, 0) / filtered.length;
  const avgPrice = filtered.reduce((s, i) => s + i.price, 0) / filtered.length;
  const avgContribution = filtered.reduce((s, i) => s + contributionOf(i, e), 0) / filtered.length;
  const atCeiling = filtered.reduce((s, i) => s + contributionOf(i, e, e.marketPriceCeiling), 0) / filtered.length;
  const ketoCount = items.filter(i => i.isKeto).length;
  const hpCount = items.filter(i => i.isHighProtein).length;

  const mealsPerMonth = segments.reduce((s, x) => s + x.mealsPerMonth * x.sharePct, 0) /
    (segments.reduce((s, x) => s + x.sharePct, 0) || 1);
  const nicheShare = data.nicheSizing.shareOfB2cBase;
  const monthlyBoxes = Math.round(3200 * (nicheShare / 100) * (mealsPerMonth / 12) * sf);

  const kpis = [
    { icon: '🍗', label: 'โปรตีนเฉลี่ยต่อกล่อง', value: fmtNum(Math.round(avgProtein)) + ' กรัม', sub: 'ค่าเฉลี่ยมื้อคีโตในตลาด 38 ก. · Fit2Go 25-40 ก.', tone: avgProtein >= 38 ? 'positive' : 'negative' },
    { icon: '🌾', label: 'net carb เฉลี่ย', value: fmtNum(Math.round(avgNetCarb)) + ' กรัม', sub: 'เกณฑ์คีโต ≤ 15 ก. · โลว์คาร์บ ≤ 25 ก.', tone: avgNetCarb <= 25 ? 'positive' : 'warning' },
    { icon: '✅', label: 'เมนูที่ผ่านเกณฑ์คีโต', value: fmtNum(ketoCount) + ' / ' + items.length + ' เมนู', sub: 'net carb ≤ 15 ก. และโปรตีน ≥ 30 ก.', tone: ketoCount >= 2 ? 'positive' : 'negative' },
    { icon: '💪', label: 'เมนูโปรตีนสูง (≥40 ก.)', value: fmtNum(hpCount) + ' / ' + items.length + ' เมนู', sub: 'สูงกว่าเพดานที่ Fit2Go ระบุ (40 ก.)', tone: 'positive' },
    { icon: '💵', label: 'ราคาเฉลี่ยสายโปรตีน', value: fmtNum(Math.round(avgPrice)) + ' บาท', sub: 'เพดานราคาตลาดกลุ่มนี้ ' + e.marketPriceCeiling + ' บาท', tone: avgPrice > e.marketPriceCeiling ? 'negative' : 'positive' },
    { icon: '🥩', label: 'ต้นทุนวัตถุดิบเฉลี่ย', value: fmtNum(Math.round(avgFoodCost)) + ' บาท', sub: 'เมนูปกติ ' + e.baseLineFoodCost + ' บาท (+' + fmtNum(Math.round(avgFoodCost - e.baseLineFoodCost)) + ')', tone: 'negative' },
    { icon: '📗', label: 'กำไรส่วนเกิน (ราคาแผน)', value: fmtNum(Math.round(avgContribution)) + ' บาท/กล่อง', sub: 'เมนูปกติ ' + e.baseLineContribution + ' บาท', tone: avgContribution >= e.baseLineContribution ? 'positive' : 'negative' },
    { icon: '⚠️', label: 'ถ้าถูกกดลงเพดานตลาด', value: fmtNum(Math.round(atCeiling)) + ' บาท/กล่อง', sub: 'ที่ราคา ' + e.marketPriceCeiling + ' บาท — หายไป ' + fmtNum(Math.round(avgContribution - atCeiling)) + ' บาท', tone: atCeiling < 40 ? 'negative' : 'warning' }
  ];

  const menuRows = filtered.map(i => ({
    code: i.code,
    name: i.name,
    kcal: i.kcal,
    protein: i.protein,
    netCarb: i.netCarb,
    fiber: i.fiber,
    fat: i.fat,
    proteinKcalPct: i.proteinKcalPct,
    tags: [
      i.isKeto ? pill('คีโต', 'positive') : '',
      !i.isKeto && i.isLowCarb ? pill('โลว์คาร์บ', 'info') : '',
      i.isHighProtein ? pill('โปรตีนสูง', 'warning') : ''
    ].filter(Boolean).join(' '),
    foodCost: i.foodCost,
    price: i.price,
    contribution: contributionOf(i, e),
    atCeiling: contributionOf(i, e, e.marketPriceCeiling)
  }));

  const segRows = data.segments.map(s => ({
    name: s.name,
    sharePct: s.sharePct,
    proteinTargetPerMeal: s.proteinTargetPerMeal,
    netCarbTolerance: s.netCarbTolerance,
    mealsPerMonth: s.mealsPerMonth,
    willingnessToPay: s.willingnessToPay,
    channel: s.channel,
    dealBreaker: s.dealBreaker
  }));

  const benchRows = data.competitorBenchmark.map(b => ({
    brand: b.brand,
    proteinPerBox: b.proteinPerBox,
    price: b.priceMin === null ? 'ไม่ระบุ' : (b.priceMin === b.priceMax ? fmtNum(b.priceMin) : fmtNum(b.priceMin) + '-' + fmtNum(b.priceMax)) + ' บาท',
    carbInfo: b.carbInfo,
    status: b.verified ? pill('ยืนยันแล้ว ' + b.source, 'positive') : pill('แผนของเรา', 'info')
  }));

  const segmentCards = segments.map(s => `
    <div class="hb-card">
      <div class="hb-card-head">
        <div>
          <div class="hb-card-title">${s.name}</div>
          <div class="hb-card-sub">${fmtPct(s.sharePct, 0)} ของกลุ่มโปรตีน/โลว์คาร์บ · ${s.mealsPerMonth} มื้อ/เดือน</div>
        </div>
      </div>
      <div class="hb-tl-meta" style="margin-bottom:10px">
        ${pill('โปรตีน ' + s.proteinTargetPerMeal, 'warning')}
        ${pill('ยอมจ่าย ' + s.willingnessToPay, 'info')}
      </div>
      <p><strong>ใคร:</strong> ${s.profile}</p>
      <p style="margin-top:6px"><strong>คาร์บที่รับได้:</strong> ${s.netCarbTolerance}</p>
      <p style="margin-top:6px"><strong>ซื้อเพราะ:</strong> ${s.buyingReason}</p>
      <p style="margin-top:6px"><strong>เลิกซื้อถ้า:</strong> ${s.dealBreaker}</p>
      <p style="margin-top:6px"><strong>ช่องทางที่เหมาะ:</strong> ${s.channel}</p>
    </div>`).join('');

  root.innerHTML =
    assumptionBar('<strong>เกณฑ์โภชนาการและราคาคู่แข่งมีแหล่งอ้างอิง</strong> (คีโต net carb ≤ 15 ก. · มื้อคีโตเฉลี่ยโปรตีน 38 ก. · Fit2Go 25-40 ก. ที่ 99-149 บาท) — ' +
      '<strong>ขนาดกลุ่ม ยอดสั่ง/เดือน และราคาที่ยอมจ่าย ยังเป็นสมมติฐาน</strong> ต้องยืนยันด้วยการสัมภาษณ์ลูกค้าจริง') +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('โปรตีน เทียบ net carb ของแต่ละเมนู', 'chart-lc-macro', { tall: true, note: 'มุมซ้ายบน = โปรตีนสูงคาร์บต่ำ คือโซนที่กลุ่มนี้ต้องการ · เส้นแนวตั้งคือเกณฑ์คีโต 15 ก. และโลว์คาร์บ 25 ก.' }),
      chartCard('สัดส่วนพลังงานที่มาจากโปรตีน (%)', 'chart-lc-ratio', { tall: true, note: 'เมนูสายโปรตีนควรมีสัดส่วนพลังงานจากโปรตีนเกิน 30%' })
    ) +
    chartGrid(
      chartCard('ราคา เทียบ กำไรส่วนเกิน 2 กรณี (บาท/กล่อง)', 'chart-lc-margin', { tall: true, note: 'แท่งเขียว = ราคาตามแผน · แท่งส้ม = ถ้าถูกกดลงเพดานราคาตลาด 149 บาท' }),
      chartCard('สัดส่วนกลุ่มลูกค้าย่อย', 'chart-lc-segment', { tall: true })
    ) +
    panel('เมนูสาย ' + data.menuLine.name + ' (' + filtered.length + ' จาก ' + items.length + ' เมนู)', dataTable([
      { key: 'code', label: 'รหัส' },
      { key: 'name', label: 'ชื่อเมนู' },
      { key: 'tags', label: 'ผ่านเกณฑ์', align: 'center' },
      { key: 'kcal', label: 'kcal', align: 'right', fmt: v => fmtNum(v) },
      { key: 'protein', label: 'โปรตีน (ก.)', align: 'right' },
      { key: 'netCarb', label: 'net carb (ก.)', align: 'right' },
      { key: 'fiber', label: 'ใยอาหาร (ก.)', align: 'right' },
      { key: 'fat', label: 'ไขมัน (ก.)', align: 'right' },
      { key: 'proteinKcalPct', label: '% พลังงานจากโปรตีน', align: 'right', fmt: v => fmtPct(v, 0) },
      { key: 'foodCost', label: 'ต้นทุนวัตถุดิบ', align: 'right', fmt: v => fmtNum(v) },
      { key: 'price', label: 'ราคา', align: 'right', fmt: v => fmtNum(v) },
      { key: 'contribution', label: 'กำไร/กล่อง', align: 'right', fmt: v => fmtNum(v) },
      { key: 'atCeiling', label: 'กำไรที่ราคา 149', align: 'right', fmt: v => fmtNum(v) }
    ], menuRows), { note: data.economics.note }) +
    panel('เกณฑ์ที่ใช้จัดประเภทเมนู', dataTable([
      { key: 'label', label: 'ประเภท' },
      { key: 'threshold', label: 'เกณฑ์', align: 'center' },
      { key: 'detail', label: 'รายละเอียด' },
      { key: 'source', label: 'ที่มา', align: 'center' }
    ], std.rules.map(r => ({
      label: r.label,
      threshold: [r.netCarbMax ? 'net carb ≤ ' + r.netCarbMax + ' ก.' : '', r.proteinMin ? 'โปรตีน ≥ ' + r.proteinMin + ' ก.' : ''].filter(Boolean).join(' · ') || '-',
      detail: r.detail,
      source: r.source
    }))), { note: '⚠️ ' + std.labelWarning }) +
    `<h3 class="chart-card-title" style="margin:24px 0 12px">กลุ่มลูกค้าย่อย 4 กลุ่มในสายโปรตีน/โลว์คาร์บ</h3>` +
    `<div class="hb-cards">${segmentCards}</div>` +
    panel('เปรียบเทียบกลุ่มลูกค้าย่อย', dataTable([
      { key: 'name', label: 'กลุ่ม' },
      { key: 'sharePct', label: 'สัดส่วน', align: 'right', fmt: v => fmtPct(v, 0) },
      { key: 'proteinTargetPerMeal', label: 'โปรตีนที่ต้องการ/มื้อ' },
      { key: 'netCarbTolerance', label: 'คาร์บที่รับได้' },
      { key: 'mealsPerMonth', label: 'มื้อ/เดือน', align: 'right' },
      { key: 'willingnessToPay', label: 'ยอมจ่าย' },
      { key: 'channel', label: 'ช่องทาง' },
      { key: 'dealBreaker', label: 'เลิกซื้อถ้า' }
    ], segRows)) +
    panel('เทียบคู่แข่งกลุ่มโปรตีนสูง (ราคาและโปรตีนที่ประกาศจริง)', dataTable([
      { key: 'brand', label: 'แบรนด์' },
      { key: 'proteinPerBox', label: 'โปรตีนที่ประกาศ' },
      { key: 'price', label: 'ราคา/กล่อง', align: 'right' },
      { key: 'carbInfo', label: 'ข้อมูลคาร์บ' },
      { key: 'status', label: 'สถานะข้อมูล', align: 'center' }
    ], benchRows)) +
    panel('แหล่งอ้างอิงของหน้านี้',
      '<div class="hb-cards">' + data.sources.map(s => `
        <div class="hb-card">
          <div class="hb-card-head">
            <div>
              <div class="hb-card-title">${s.id} · ${s.label}</div>
              <div class="hb-card-sub"><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.url}</a></div>
            </div>
          </div>
          <p>${s.confirms}</p>
        </div>`).join('') + '</div>'
    ) +
    noteBox('🥩 โอกาสของกลุ่มนี้', data.opportunities.map(o => ({
      badge: o.title, tone: 'opportunity', text: o.detail
    }))) +
    noteBox('⚠️ ความเสี่ยงที่ต้องจัดการ', data.risks.map(r => ({
      badge: r.title, tone: 'alert', text: r.detail
    })));

  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('market-lowcarb', {
    data, filters: f, computed: { avgProtein, avgNetCarb, avgPrice, avgFoodCost, avgContribution, atCeiling, ketoCount, hpCount, monthlyBoxes, itemCount: items.length }
  }));

  // --- โปรตีน vs net carb ---
  createChart('chart-lc-macro', {
    type: 'bubble',
    data: {
      datasets: items.map((i, idx) => ({
        label: i.code + ' ' + i.name.slice(0, 16),
        data: [{ x: i.netCarb, y: i.protein, r: 8 + i.price / 30 }],
        backgroundColor: (i.isKeto ? '#16a34a' : i.isLowCarb ? '#0ea5e9' : '#f59e0b') + 'CC',
        borderColor: CHART_COLORS[idx % CHART_COLORS.length]
      }))
    },
    options: {
      plugins: {
        legend: { ...legendOpts(), labels: { ...legendOpts().labels, boxWidth: 10 } },
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label,
            afterLabel: ctx => 'โปรตีน ' + ctx.parsed.y + ' ก. · net carb ' + ctx.parsed.x + ' ก.'
          }
        }
      },
      scales: {
        x: {
          ...baseScales({ xCallback: v => v + ' ก.' }).x,
          title: { display: true, text: 'net carb (กรัม) — ยิ่งซ้ายยิ่งดีสำหรับกลุ่มนี้', color: baseScales().x.ticks.color }
        },
        y: {
          ...baseScales({ yCallback: v => v + ' ก.', beginAtZero: false }).y,
          title: { display: true, text: 'โปรตีน (กรัม)', color: baseScales().y.ticks.color }
        }
      }
    }
  });

  // --- สัดส่วนพลังงานจากโปรตีน ---
  const sortedByRatio = [...items].sort((a, b) => b.proteinKcalPct - a.proteinKcalPct);
  createChart('chart-lc-ratio', {
    type: 'bar',
    data: {
      labels: sortedByRatio.map(i => i.code),
      datasets: [
        {
          label: '% พลังงานจากโปรตีน',
          data: sortedByRatio.map(i => i.proteinKcalPct),
          backgroundColor: sortedByRatio.map(i => i.proteinKcalPct >= 40 ? 'rgba(22,163,74,0.85)' : i.proteinKcalPct >= 30 ? 'rgba(14,165,233,0.85)' : 'rgba(245,158,11,0.85)'),
          borderRadius: 5
        },
        {
          type: 'line',
          label: 'เกณฑ์ 30%',
          data: sortedByRatio.map(() => 30),
          borderColor: '#e11d48', borderDash: [6, 4], borderWidth: 2, pointRadius: 0
        }
      ]
    },
    options: {
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y + '%' } } },
      scales: baseScales({ yCallback: v => v + '%' })
    }
  });

  // --- ราคา vs กำไร 2 กรณี ---
  createChart('chart-lc-margin', {
    type: 'bar',
    data: {
      labels: items.map(i => i.code),
      datasets: [
        { label: 'กำไรที่ราคาตามแผน', data: items.map(i => contributionOf(i, e)), backgroundColor: 'rgba(22,163,74,0.85)', borderRadius: 5 },
        { label: 'กำไรที่เพดานตลาด 149 บาท', data: items.map(i => contributionOf(i, e, e.marketPriceCeiling)), backgroundColor: 'rgba(245,158,11,0.85)', borderRadius: 5 },
        {
          type: 'line',
          label: 'กำไรเมนูปกติ ' + e.baseLineContribution + ' บาท',
          data: items.map(() => e.baseLineContribution),
          borderColor: '#0ea5e9', borderDash: [6, 4], borderWidth: 2, pointRadius: 0
        }
      ]
    },
    options: {
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtNum(ctx.parsed.y) + ' บาท' } } },
      scales: baseScales({ yCallback: v => v + ' ฿', beginAtZero: false })
    }
  });

  // --- สัดส่วนกลุ่มย่อย ---
  createChart('chart-lc-segment', {
    type: 'doughnut',
    data: {
      labels: data.segments.map(s => s.name),
      datasets: [{
        data: data.segments.map(s => s.sharePct),
        backgroundColor: ['#16a34a', '#0ea5e9', '#f59e0b', '#7c4dff'],
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
            afterLabel: ctx => 'สั่ง ' + data.segments[ctx.dataIndex].mealsPerMonth + ' มื้อ/เดือน · ยอมจ่าย ' + data.segments[ctx.dataIndex].willingnessToPay
          }
        }
      }
    }
  });
}

export async function mount(container) {
  const thisMount = ++mountId;
  container.innerHTML = loadingHTML();

  try {
    const data = await fetchJSON('/data/lowcarb.json');
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">
      ${buildFilterBar([LOWCARB_SEGMENT_FILTER, DIET_TYPE_FILTER, SCENARIO_FILTER])}
      <div class="lc-body"></div>
    </div>`;

    const body = container.querySelector('.lc-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('market-lowcarb mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
