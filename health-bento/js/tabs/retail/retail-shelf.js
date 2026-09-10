/**
 * retail-shelf.js — คู่แข่งบนชั้นวางและช่วงราคาของแต่ละห้าง
 */

import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import {
  buildFilterBar, onFilterChange, getFilterValues,
  CHAIN_FILTER, FORMAT_FILTER
} from '../../shared/filter-builder.js';
import {
  kpiGrid, chartCard, chartGrid, panel, dataTable, noteBox, assumptionBar,
  fmtNum, fmtPct, pill, baseScales, legendOpts, loadingHTML, errorHTML, emptyHTML
} from '../../shared/ui-kit.js';
import { aiPanel } from '../../shared/ai-analyst.js';

let mountId = 0;
let filterCleanup = null;

function selectChains(data, f) {
  let chains = data.chains;
  if (f.format && f.format !== 'all') chains = chains.filter(c => c.format === f.format);
  if (f.chain && f.chain !== 'all') chains = chains.filter(c => c.id === f.chain);
  return chains;
}

function renderContent(root, data, f) {
  destroyAll();

  const chains = selectChains(data, f);
  if (!chains.length) {
    root.innerHTML = emptyHTML('ไม่มีห้างในเงื่อนไขที่เลือก');
    return;
  }

  const chainIds = chains.map(c => c.id);
  const rivals = data.shelfCompetitors.filter(x => x.chains.some(id => chainIds.includes(id)));
  const avgRivalPrice = rivals.length ? rivals.reduce((s, x) => s + x.avgPrice, 0) / rivals.length : 0;
  const ourAvgRsp = chains.reduce((s, c) => s + c.shelf.rsp, 0) / chains.length;
  const premiumRivals = rivals.filter(x => x.avgPrice >= 150);
  const cheapRivals = rivals.filter(x => x.avgPrice < 100);
  const noRte = chains.filter(c => !c.shelf.hasChilledRte);
  const totalFacings = chains.reduce((s, c) => s + c.shelf.facings, 0);

  const kpis = [
    { icon: '🏷️', label: 'ราคาบนชั้นของเรา (เฉลี่ย)', value: fmtNum(Math.round(ourAvgRsp)) + ' บาท', sub: 'ตามห้างที่เลือก', tone: 'neutral' },
    { icon: '📊', label: 'ราคาเฉลี่ยคู่แข่งบนชั้นเดียวกัน', value: fmtNum(Math.round(avgRivalPrice)) + ' บาท', sub: 'จาก ' + rivals.length + ' แบรนด์', tone: 'neutral' },
    { icon: '⚔️', label: 'คู่แข่งกลุ่มพรีเมียม (150 บาท+)', value: fmtNum(premiumRivals.length) + ' แบรนด์', sub: premiumRivals.map(x => x.brand).join(', ') || '-', tone: 'warning' },
    { icon: '🪙', label: 'คู่แข่งราคาถูก (ต่ำกว่า 100)', value: fmtNum(cheapRivals.length) + ' แบรนด์', sub: 'กดราคาชั้นอาหารพร้อมทานทั้งหมด', tone: 'negative' },
    { icon: '📐', label: 'พื้นที่หน้าชั้นที่ขอได้ (รวม)', value: fmtNum(totalFacings) + ' ช่อง', sub: 'เฉลี่ย ' + (totalFacings / chains.length).toFixed(1) + ' ช่อง/ห้าง', tone: 'neutral' },
    { icon: '🧊', label: 'ห้างที่ยังไม่มีชั้นแช่เย็น', value: noRte.length ? noRte.map(c => c.name).join(', ') : 'ไม่มี', sub: noRte.length ? 'วางขายไม่ได้จนกว่าจะมีตู้แช่' : 'ทุกห้างที่เลือกพร้อมวางขาย', tone: noRte.length ? 'negative' : 'positive' },
    { icon: '🎯', label: 'ตำแหน่งราคาของเรา', value: ourAvgRsp > avgRivalPrice ? 'สูงกว่าค่าเฉลี่ย' : 'ต่ำกว่าค่าเฉลี่ย', sub: 'ต่างกัน ' + fmtNum(Math.abs(Math.round(ourAvgRsp - avgRivalPrice))) + ' บาท', tone: 'neutral' },
    { icon: '🏬', label: 'แบรนด์ห้างเอง (House brand)', value: 'อยู่บนชั้นทุกห้าง', sub: 'ได้พื้นที่ชั้นดีที่สุดเสมอ', tone: 'warning' }
  ];

  const rangeRows = chains.map(c => ({
    name: c.name,
    priceMin: c.shelf.priceMin,
    priceMax: c.shelf.priceMax,
    rsp: c.shelf.rsp,
    position: c.shelf.rsp > c.shelf.priceMax ? pill('สูงกว่าเพดานชั้น', 'negative')
      : c.shelf.rsp > (c.shelf.priceMin + c.shelf.priceMax) / 2 ? pill('ครึ่งบนของชั้น', 'warning')
      : pill('ครึ่งล่างของชั้น', 'positive'),
    facings: c.shelf.facings,
    competitors: c.shelf.competitors.join(', ')
  }));

  const rivalRows = rivals.map(x => ({
    brand: x.brand,
    type: x.type,
    priceRange: x.priceRange + ' บาท',
    avgPrice: x.avgPrice,
    gap: Math.round(ourAvgRsp - x.avgPrice),
    chains: x.chains.filter(id => chainIds.includes(id)).length + ' / ' + chains.length,
    strength: x.strength,
    weakness: x.weakness,
    evidence: x.evidence ? pill(x.evidence.startsWith('พบจริง') || x.evidence.startsWith('ราคายืนยัน') ? x.evidence : 'สมมติฐาน', x.evidence.startsWith('สมมติฐาน') ? 'warning' : 'positive') : '-'
  }));

  root.innerHTML =
    assumptionBar('⚠️ ช่วงราคาบนชั้นและรายชื่อคู่แข่งในหน้านี้ยังเป็น <strong>สมมติฐาน</strong> (คอลัมน์ "หลักฐาน" บอกสถานะรายแบรนด์) — ราคาที่ยืนยันแล้วดูได้ที่หน้า "สำรวจราคาตลาดจริง" · ให้ทีมเซลล์เดินสำรวจหน้าชั้นแล้วกรอกผลลงในไฟล์ survey.json') +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('ช่วงราคาบนชั้นของแต่ละห้าง เทียบราคาที่เราจะตั้ง', 'chart-rs-range', { tall: true, note: 'แท่งคือช่วงราคาต่ำสุด-สูงสุดบนชั้น จุดสีเขียวคือราคาที่เราวางแผนตั้ง' }),
      chartCard('ราคาเฉลี่ยของคู่แข่งแต่ละแบรนด์ (บาท)', 'chart-rs-rivals', { tall: true })
    ) +
    chartGrid(
      chartCard('จำนวนห้างที่คู่แข่งแต่ละแบรนด์วางขาย', 'chart-rs-coverage', { tall: true, note: 'แบรนด์ที่กระจายหลายห้างคือคู่แข่งที่ต้องเจอทุกที่' }),
      chartCard('พื้นที่หน้าชั้นที่คาดว่าจะได้ (ช่อง)', 'chart-rs-facings', { tall: true })
    ) +
    panel('ช่วงราคาและคู่แข่งในแต่ละห้าง', dataTable([
      { key: 'name', label: 'ห้าง' },
      { key: 'priceMin', label: 'ราคาต่ำสุดบนชั้น', align: 'right', fmt: v => fmtNum(v) },
      { key: 'priceMax', label: 'ราคาสูงสุดบนชั้น', align: 'right', fmt: v => fmtNum(v) },
      { key: 'rsp', label: 'ราคาที่เราจะตั้ง', align: 'right', fmt: v => fmtNum(v) },
      { key: 'position', label: 'ตำแหน่งราคา', align: 'center' },
      { key: 'facings', label: 'ช่องหน้าชั้น', align: 'right' },
      { key: 'competitors', label: 'คู่แข่งที่เจอบนชั้น' }
    ], rangeRows)) +
    panel('คู่แข่งบนชั้นวาง', dataTable([
      { key: 'brand', label: 'แบรนด์' },
      { key: 'type', label: 'ประเภท' },
      { key: 'priceRange', label: 'ช่วงราคา' },
      { key: 'avgPrice', label: 'ราคาเฉลี่ย', align: 'right', fmt: v => fmtNum(v) },
      { key: 'gap', label: 'เราสูง/ต่ำกว่า', align: 'right', fmt: v => (v > 0 ? '+' : '') + fmtNum(v) + ' บาท' },
      { key: 'chains', label: 'อยู่ในกี่ห้าง', align: 'center' },
      { key: 'strength', label: 'จุดแข็ง' },
      { key: 'weakness', label: 'จุดอ่อน' },
      { key: 'evidence', label: 'หลักฐาน' }
    ], rivalRows)) +
    noteBox('🛒 กลยุทธ์บนชั้นวาง', [
      { badge: 'อย่าแข่งกับ CP', tone: 'alert', text: 'CP อาหารพร้อมทานเฉลี่ย 72 บาท เราไม่มีทางลงไปสู้ราคานั้นด้วยวัตถุดิบระดับเดียวกัน — ต้องวางตัวเป็นชั้น "อาหารคลีนระบุสารอาหาร" ไม่ใช่ "ข้าวกล่องราคาประหยัด"' },
      { badge: 'คู่แข่งตัวจริง', tone: 'warning', text: 'คู่แข่งที่ยืนยันราคาได้จริงคือ POLPA (119 บาท) และ Fit2Go (99-149 บาท) ซึ่งเป็นกลุ่มระบุโภชนาการเหมือนเรา แต่ขายทางเดลิเวอรี — ราคาเราที่ 165-189 บาทสูงกว่าทั้งคู่ ต้องอธิบายส่วนต่างให้ได้' },
      { badge: 'จุดต่างที่ต้องเห็นจากหน้าชั้น', tone: 'opportunity', text: 'พิมพ์แคลอรีและกรัมโปรตีนตัวใหญ่บนฝากล่องให้อ่านออกจากระยะ 1 เมตร — เป็นสิ่งที่ House brand และ CP ไม่ทำ' },
      { badge: 'ขอพื้นที่ให้พอ', tone: 'info', text: 'ต่ำกว่า 2 ช่องหน้าชั้นสินค้าจะถูกกลืน — ถ้าห้างให้แค่ 1 ช่อง ควรต่อรองขอตำแหน่งระดับสายตาแทนจำนวนช่อง' }
    ]);


  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('retail-shelf', { data, filters: f }));
  // --- ช่วงราคาบนชั้น ---
  createChart('chart-rs-range', {
    type: 'bar',
    data: {
      labels: chains.map(c => c.name),
      datasets: [
        {
          label: 'ช่วงราคาบนชั้น (บาท)',
          data: chains.map(c => [c.shelf.priceMin, c.shelf.priceMax]),
          backgroundColor: 'rgba(148,163,184,0.55)',
          borderRadius: 4
        },
        {
          type: 'line',
          label: 'ราคาที่เราจะตั้ง',
          data: chains.map(c => c.shelf.rsp),
          borderColor: '#16a34a', backgroundColor: '#16a34a',
          borderWidth: 0, pointRadius: 6, pointStyle: 'circle', showLine: false
        }
      ]
    },
    options: {
      plugins: {
        legend: legendOpts(),
        tooltip: {
          callbacks: {
            label: ctx => ctx.datasetIndex === 0
              ? 'บนชั้น ' + fmtNum(chains[ctx.dataIndex].shelf.priceMin) + '-' + fmtNum(chains[ctx.dataIndex].shelf.priceMax) + ' บาท'
              : 'เราตั้ง ' + fmtNum(ctx.parsed.y) + ' บาท'
          }
        }
      },
      scales: baseScales({ yCallback: v => v + ' ฿', beginAtZero: false })
    }
  });

  // --- ราคาคู่แข่ง ---
  const sortedRivals = [...rivals].sort((a, b) => b.avgPrice - a.avgPrice);
  createChart('chart-rs-rivals', {
    type: 'bar',
    data: {
      labels: sortedRivals.map(x => x.brand),
      datasets: [
        {
          label: 'ราคาเฉลี่ย (บาท)',
          data: sortedRivals.map(x => x.avgPrice),
          backgroundColor: sortedRivals.map(x => x.avgPrice >= 150 ? 'rgba(225,29,72,0.8)' : x.avgPrice >= 100 ? 'rgba(245,158,11,0.8)' : 'rgba(148,163,184,0.8)'),
          borderRadius: 5
        },
        {
          type: 'line',
          label: 'ราคาเฉลี่ยของเรา',
          data: sortedRivals.map(() => Math.round(ourAvgRsp)),
          borderColor: '#16a34a', borderDash: [6, 4], borderWidth: 2, pointRadius: 0
        }
      ]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => fmtNum(ctx.parsed.x) + ' บาท' } } },
      scales: baseScales({ xCallback: v => v + ' ฿' })
    }
  });

  // --- ความครอบคลุมของคู่แข่ง ---
  createChart('chart-rs-coverage', {
    type: 'bar',
    data: {
      labels: rivals.map(x => x.brand),
      datasets: [{
        label: 'จำนวนห้างที่วางขาย',
        data: rivals.map(x => x.chains.length),
        backgroundColor: rivals.map((x, i) => CHART_COLORS[i % CHART_COLORS.length] + 'CC'),
        borderRadius: 5
      }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.y + ' ห้าง' } } },
      scales: baseScales({ yCallback: v => v })
    }
  });

  // --- พื้นที่หน้าชั้น ---
  createChart('chart-rs-facings', {
    type: 'bar',
    data: {
      labels: chains.map(c => c.name),
      datasets: [{
        label: 'ช่องหน้าชั้น',
        data: chains.map(c => c.shelf.facings),
        backgroundColor: chains.map(c => c.shelf.facings >= 3 ? 'rgba(22,163,74,0.85)' : c.shelf.facings === 2 ? 'rgba(245,158,11,0.85)' : 'rgba(225,29,72,0.85)'),
        borderRadius: 5
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.x + ' ช่อง' } } },
      scales: baseScales({ xCallback: v => v + ' ช่อง' })
    }
  });
}

export async function mount(container) {
  const thisMount = ++mountId;
  container.innerHTML = loadingHTML();

  try {
    const data = await fetchJSON('/data/retail.json');
    if (thisMount !== mountId) return;

    container.innerHTML = `<div class="tab-content">
      ${buildFilterBar([CHAIN_FILTER, FORMAT_FILTER])}
      <div class="rs-body"></div>
    </div>`;

    const body = container.querySelector('.rs-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('retail-shelf mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
