/**
 * market-survey.js — ผลสำรวจราคาตลาดจริง + แบบฟอร์มสำรวจหน้าชั้นให้ทีมเซลล์
 */

import { createChart, destroyAll } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import {
  buildFilterBar, onFilterChange, getFilterValues,
  CHAIN_FILTER
} from '../../shared/filter-builder.js';
import {
  kpiGrid, chartCard, chartGrid, panel, dataTable, noteBox, assumptionBar,
  fmtNum, fmtPct, pill, baseScales, legendOpts, loadingHTML, errorHTML
} from '../../shared/ui-kit.js';
import { aiPanel } from '../../shared/ai-analyst.js';

let mountId = 0;
let filterCleanup = null;

const CHAIN_NAME = {
  gourmet: 'Gourmet Market', villa: 'Villa Market', topsfoodhall: 'Tops Food Hall',
  tops: 'Tops', foodland: 'Foodland', bigc: 'Big C', lotuss: "Lotus's",
  makro: 'Makro', sevenmore: '7-Eleven', cjmore: 'CJ More'
};

function mid(b) {
  return (b.priceMin + b.priceMax) / 2;
}

function renderContent(root, data, f) {
  destroyAll();

  const brands = [...data.priceSurvey.brands].sort((a, b) => mid(a) - mid(b));
  const mids = brands.map(mid).sort((a, b) => a - b);
  const median = mids.length % 2
    ? mids[(mids.length - 1) / 2]
    : (mids[mids.length / 2 - 1] + mids[mids.length / 2]) / 2;
  const average = mids.reduce((s, v) => s + v, 0) / mids.length;
  const planPrice = data.planVsMarket.planAvgPrice;
  const gapPct = ((planPrice - median) / median) * 100;
  const pkg = data.priceSurvey.packageBenchmark;
  const real = data.marketSizeReal;

  // ผลสำรวจหน้าชั้นที่ทีมกรอกเข้ามา (ถ้ามี)
  const storeResults = (data.storeSurveyResults || []).filter(r =>
    !f.chain || f.chain === 'all' || r.chainId === f.chain);

  const kpis = [
    { icon: '🔎', label: 'แบรนด์ที่สำรวจราคาได้', value: fmtNum(brands.length) + ' แบรนด์', sub: 'จาก 2 แหล่งเผยแพร่สาธารณะ', tone: 'neutral' },
    { icon: '💵', label: 'ราคากลางตลาดจริง', value: fmtNum(Math.round(median)) + ' บาท', sub: 'ค่ามัชฌิม (median) ต่อกล่อง', tone: 'positive' },
    { icon: '📊', label: 'ราคาเฉลี่ยตลาด', value: fmtNum(Math.round(average)) + ' บาท', sub: 'ช่วง ' + Math.min(...brands.map(b => b.priceMin)) + '-' + Math.max(...brands.map(b => b.priceMax)) + ' บาท', tone: 'neutral' },
    { icon: '⚠️', label: 'ราคาแผนเราสูงกว่าตลาด', value: fmtPct(gapPct, 0), sub: 'แผน ' + fmtNum(planPrice) + ' บาท เทียบกลางตลาด ' + fmtNum(Math.round(median)), tone: gapPct > 40 ? 'negative' : 'neutral' },
    { icon: '🧾', label: 'แพ็กเกจถูกสุดที่พบ', value: fmtNum(pkg.pricePerBox) + ' บาท/กล่อง', sub: pkg.example, tone: 'negative' },
    { icon: '🏭', label: 'มูลค่าตลาดอาหารพร้อมทาน', value: fmtNum(real.rteValueMB2568) + ' ลบ.', sub: 'ปี 2568 · โต ' + fmtPct(real.rteGrowthPctPerYear, 0) + '/ปี', tone: 'positive' },
    { icon: '📈', label: 'ปริมาณจำหน่ายโต', value: real.volumeGrowthPct2567to2569 + '%/ปี', sub: 'ปี 2567-2569 (Krungsri Research)', tone: 'positive' },
    { icon: '🏢', label: 'ผู้ผลิต SME ในตลาด', value: fmtNum(real.smeFactories) + ' โรงงาน', sub: 'คู่แข่งไม่ได้มีแต่รายใหญ่', tone: 'negative' }
  ];

  const brandRows = brands.map(b => ({
    brand: b.brand,
    price: b.priceMin === b.priceMax ? fmtNum(b.priceMin) + '+' : fmtNum(b.priceMin) + '-' + fmtNum(b.priceMax),
    midPrice: Math.round(mid(b)),
    style: b.style,
    claim: b.claim,
    vsPlan: Math.round(planPrice - mid(b)),
    tier: mid(b) <= 80 ? pill('ชั้นราคาประหยัด', 'warning')
      : mid(b) <= 130 ? pill('ชั้นกลาง', 'info')
      : pill('ชั้นพรีเมียม', 'positive'),
    source: b.source
  }));

  const storeCols = [
    { key: 'chain', label: 'ห้าง' },
    { key: 'branch', label: 'สาขา' },
    { key: 'surveyDate', label: 'วันที่สำรวจ' },
    { key: 'priceRange', label: 'ช่วงราคาบนชั้น' },
    { key: 'facingsTotal', label: 'ช่องหน้าชั้น', align: 'right' },
    { key: 'estBoxesPerDay', label: 'ยอดขาย/วัน (ประเมิน)', align: 'right' },
    { key: 'shelfBrands', label: 'แบรนด์ที่เจอ' },
    { key: 'note', label: 'หมายเหตุ' }
  ];

  const storeRows = storeResults.map(r => ({
    chain: CHAIN_NAME[r.chainId] || r.chainId,
    branch: r.branch,
    surveyDate: r.surveyDate,
    priceRange: fmtNum(r.priceMin) + '-' + fmtNum(r.priceMax) + ' บาท',
    facingsTotal: r.facingsTotal,
    estBoxesPerDay: (r.boxesOnShelfMorning != null && r.boxesOnShelfEvening != null)
      ? fmtNum(Math.max(0, r.boxesOnShelfMorning - r.boxesOnShelfEvening))
      : '-',
    shelfBrands: r.shelfBrands,
    note: r.note || '-'
  }));

  const templateRows = data.storeSurveyTemplate.fields.map((x, i) => ({
    no: i + 1,
    key: x.key,
    label: x.label
  }));

  root.innerHTML =
    assumptionBar('หน้านี้คือ <strong>ข้อมูลจริงที่สำรวจมา</strong> — ราคาที่แบรนด์ประกาศขายจริง ' + brands.length +
      ' แบรนด์ และตัวเลขตลาดจากงานวิจัยที่เผยแพร่ (ดูแหล่งอ้างอิงท้ายหน้า) ไม่ใช่ตัวเลขสมมติของทีม') +
    `<div class="hb-survey-highlight">🔻 <strong>สิ่งที่พบสำคัญที่สุด:</strong> ราคาข้าวกล่องคลีนในตลาดจริงอยู่ที่ ` +
      Math.min(...brands.map(b => b.priceMin)) + '-' + Math.max(...brands.map(b => b.priceMax)) +
      ' บาท (กลางตลาด ' + fmtNum(Math.round(median)) + ' บาท) ขณะที่แผนของเราตั้งราคาเฉลี่ย ' + fmtNum(planPrice) +
      ' บาท — สูงกว่า ' + fmtPct(gapPct, 0) + ' และมีแพ็กเกจในตลาดที่ถูกถึง ' + fmtNum(pkg.pricePerBox) +
      ' บาท/กล่อง ซึ่งต่ำกว่าต้นทุนผลิตของเรา (84 บาท) ด้วย</div>' +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('ราคาต่อกล่องของแต่ละแบรนด์ที่สำรวจ (บาท)', 'chart-sv-price', { tall: true, note: 'เส้นประเขียวคือราคาเฉลี่ยตามแผนของเรา · เส้นประส้มคือราคากลางตลาดจริง' }),
      chartCard('จำนวนแบรนด์ในแต่ละชั้นราคา', 'chart-sv-tier', { tall: true })
    ) +
    panel('ราคาที่แบรนด์ประกาศขายจริง (' + data.priceSurvey.surveyedAt + ')', dataTable([
      { key: 'brand', label: 'แบรนด์' },
      { key: 'price', label: 'ราคา/กล่อง (บาท)', align: 'right' },
      { key: 'midPrice', label: 'กลางช่วง', align: 'right', fmt: v => fmtNum(v) },
      { key: 'vsPlan', label: 'แผนเราสูงกว่า', align: 'right', fmt: v => (v > 0 ? '+' : '') + fmtNum(v) + ' บาท' },
      { key: 'tier', label: 'ชั้นราคา', align: 'center' },
      { key: 'style', label: 'สไตล์เมนู' },
      { key: 'claim', label: 'จุดขายที่ประกาศ' },
      { key: 'source', label: 'ที่มา', align: 'center' }
    ], brandRows), { note: data.priceSurvey.method }) +
    panel('ผลสำรวจหน้าชั้นที่ทีมกรอกเข้ามา' + (storeResults.length ? ' (' + storeResults.length + ' สาขา)' : ''),
      storeResults.length
        ? dataTable(storeCols, storeRows)
        : '<p class="hb-chart-note">ยังไม่มีข้อมูล — ให้ทีมเซลล์เดินสำรวจแล้วกรอกลงในคีย์ <code>storeSurveyResults</code> ของไฟล์ <code>public/data/survey.json</code> แล้วกดปุ่มรีเฟรชบนหัวเว็บ ตารางนี้จะขึ้นทันที</p>',
      { note: data.storeSurveyTemplate.howToEstimateSales }) +
    panel('แบบฟอร์มสำรวจหน้าชั้น (ให้ทีมเซลล์กรอก)', dataTable([
      { key: 'no', label: '#', align: 'right' },
      { key: 'key', label: 'ชื่อฟิลด์ในไฟล์' },
      { key: 'label', label: 'สิ่งที่ต้องกรอก' }
    ], templateRows), { note: data.storeSurveyTemplate.instruction }) +
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
    noteBox('🧭 สิ่งที่ต้องตัดสินใจหลังเห็นราคาตลาดจริง', [
      { badge: 'ทางเลือก 1 — ปรับราคาลง', tone: 'warning', text: 'ตั้งเมนูหลัก 119-149 บาท ให้ชนกับ POLPA (119) และ Fit2Go (99-149) ที่เป็นกลุ่มระบุโภชนาการเหมือนกัน — ต้องลดต้นทุนวัตถุดิบจาก 58 เหลือราว 45 บาท/กล่อง จึงจะเหลือกำไรส่วนเกิน 40+ บาท' },
      { badge: 'ทางเลือก 2 — คงราคาแต่เปลี่ยนกลุ่ม', tone: 'opportunity', text: 'คงราคา 165-189 บาท แต่เลิกแข่งกับตลาดเดลิเวอรีทั่วไป ไปเน้นองค์กร/คลินิก/ฟิตเนสที่ซื้อด้วยเหตุผลอื่นและไม่เทียบราคาต่อกล่อง' },
      { badge: 'ทางเลือก 3 — สองแบรนด์', tone: 'info', text: 'ทำ 2 ระดับสินค้า: กล่องมาตรฐาน 129 บาทสำหรับสู้ตลาด และกล่องพรีเมียม 189-249 บาทสำหรับเมนูแซลมอน/เนื้อวัวและลูกค้าองค์กร' },
      { badge: 'ห้ามทำ', tone: 'alert', text: 'ห้ามลงไปแข่งราคาระดับ 60-80 บาท/กล่อง เพราะต่ำกว่าต้นทุนผลิตของเราเอง — ยิ่งขายยิ่งขาดทุน' }
    ]);

  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('market-survey', { data, filters: f }));

  // --- ราคาแต่ละแบรนด์ ---
  createChart('chart-sv-price', {
    type: 'bar',
    data: {
      labels: brands.map(b => b.brand),
      datasets: [
        {
          label: 'ช่วงราคา (บาท)',
          data: brands.map(b => [b.priceMin, b.priceMax === b.priceMin ? b.priceMin + 2 : b.priceMax]),
          backgroundColor: brands.map(b => mid(b) <= 80 ? 'rgba(245,158,11,0.8)' : mid(b) <= 130 ? 'rgba(14,165,233,0.8)' : 'rgba(22,163,74,0.8)'),
          borderRadius: 4
        },
        {
          type: 'line',
          label: 'ราคาเฉลี่ยตามแผนเรา (' + planPrice + ')',
          data: brands.map(() => planPrice),
          borderColor: '#16a34a', borderDash: [6, 4], borderWidth: 2, pointRadius: 0
        },
        {
          type: 'line',
          label: 'ราคากลางตลาดจริง (' + Math.round(median) + ')',
          data: brands.map(() => Math.round(median)),
          borderColor: '#f59e0b', borderDash: [4, 3], borderWidth: 2, pointRadius: 0
        }
      ]
    },
    options: {
      plugins: {
        legend: legendOpts(),
        tooltip: {
          callbacks: {
            label: ctx => ctx.datasetIndex === 0
              ? brands[ctx.dataIndex].price || (brands[ctx.dataIndex].priceMin + '-' + brands[ctx.dataIndex].priceMax + ' บาท')
              : ctx.dataset.label
          }
        }
      },
      scales: baseScales({ yCallback: v => v + ' ฿' })
    }
  });

  // --- จำนวนแบรนด์ตามชั้นราคา ---
  const tiers = [
    { label: 'ประหยัด (≤80)', test: b => mid(b) <= 80, color: 'rgba(245,158,11,0.85)' },
    { label: 'กลาง (81-130)', test: b => mid(b) > 80 && mid(b) <= 130, color: 'rgba(14,165,233,0.85)' },
    { label: 'พรีเมียม (>130)', test: b => mid(b) > 130, color: 'rgba(22,163,74,0.85)' }
  ];
  createChart('chart-sv-tier', {
    type: 'doughnut',
    data: {
      labels: tiers.map(t => t.label),
      datasets: [{
        data: tiers.map(t => brands.filter(t.test).length),
        backgroundColor: tiers.map(t => t.color),
        borderColor: 'rgba(255,255,255,0.75)', borderWidth: 2
      }]
    },
    options: {
      cutout: '52%',
      plugins: {
        legend: legendOpts(),
        tooltip: {
          callbacks: {
            label: ctx => ctx.label + ': ' + ctx.parsed + ' แบรนด์',
            afterLabel: ctx => brands.filter(tiers[ctx.dataIndex].test).map(b => b.brand).join(', ')
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
    const data = await fetchJSON('/data/survey.json');
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">
      ${buildFilterBar([CHAIN_FILTER])}
      <div class="sv-body"></div>
    </div>`;

    const body = container.querySelector('.sv-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('market-survey mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
