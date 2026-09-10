/**
 * market-competitor.js — เปรียบเทียบคู่แข่งข้าวกล่องเพื่อสุขภาพ
 */

import { createChart, destroyAll, BRAND_COLORS, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import {
  buildFilterBar, onFilterChange, getFilterValues,
  COMPETITOR_FILTER, REGION_FILTER
} from '../../shared/filter-builder.js';
import { varyPercent } from '../../shared/filter-data.js';
import {
  kpiGrid, chartCard, chartGrid, panel, dataTable, noteBox, assumptionBar,
  fmtNum, fmtPct, pill, baseScales, legendOpts, loadingHTML, errorHTML
} from '../../shared/ui-kit.js';
import { aiPanel } from '../../shared/ai-analyst.js';

let mountId = 0;
let filterCleanup = null;

const US = 'healthbento';

function renderContent(root, data, f) {
  destroyAll();

  const all = data.competitors;
  const us = all.find(c => c.id === US);
  const rivals = all.filter(c => c.id !== US);
  const focus = f.competitor && f.competitor !== 'all'
    ? rivals.filter(c => c.id === f.competitor)
    : rivals;
  const shown = focus.length ? [us, ...focus] : [us, ...rivals];

  const avgRivalPrice = Math.round(rivals.reduce((s, c) => s + c.pricePerBox, 0) / rivals.length);
  const cheapest = rivals.reduce((a, b) => (b.pricePerBox < a.pricePerBox ? b : a), rivals[0]);
  const leader = rivals.reduce((a, b) => (b.sharePct > a.sharePct ? b : a), rivals[0]);

  const kpis = [
    { icon: '🏷️', label: 'ราคาของเรา / กล่อง', value: fmtNum(us.pricePerBox) + ' บาท', sub: us.pricePerBox < avgRivalPrice ? 'ต่ำกว่าค่าเฉลี่ยตลาด' : 'สูงกว่าค่าเฉลี่ยตลาด', tone: us.pricePerBox < avgRivalPrice ? 'positive' : 'negative' },
    { icon: '📊', label: 'ราคาเฉลี่ยคู่แข่ง', value: fmtNum(avgRivalPrice) + ' บาท', sub: 'จาก ' + rivals.length + ' แบรนด์', tone: 'neutral' },
    { icon: '👑', label: 'ผู้นำตลาด', value: leader.name, sub: 'ส่วนแบ่ง ' + fmtPct(leader.sharePct, 0), tone: 'neutral' },
    { icon: '⚔️', label: 'คู่แข่งด้านราคา', value: cheapest.name, sub: fmtNum(cheapest.pricePerBox) + ' บาท/กล่อง', tone: 'negative' }
  ];

  const tableRows = all.map(c => ({
    name: c.id === US ? '<strong>' + c.name + '</strong>' : c.name,
    positioning: c.positioning,
    pricePerBox: c.pricePerBox,
    menuCount: c.menuCount,
    sharePct: c.sharePct,
    channels: c.channels.length,
    strength: c.strength,
    weakness: c.weakness
  }));

  // ตารางเทียบฟีเจอร์
  const fm = data.competitorFeatures;
  const featureRows = fm.features.map((feat, idx) => {
    const row = { feature: feat };
    all.forEach(c => {
      const arr = fm.matrix[c.id] || [];
      row[c.id] = arr[idx] ? pill('มี', 'positive') : pill('ไม่มี', 'neutral');
    });
    return row;
  });
  const featureCols = [{ key: 'feature', label: 'ความสามารถ' }].concat(
    all.map(c => ({ key: c.id, label: c.id === US ? c.name : c.name, align: 'center' }))
  );

  root.innerHTML =
    assumptionBar('ข้อมูลคู่แข่งเป็น <strong>ข้อมูลจำลองเพื่อวางแผน</strong> — ควรสำรวจราคาและเมนูจริงจากหน้าเพจ/แอปเดลิเวอรีทุกไตรมาส') +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('ราคาต่อกล่อง เทียบกับจำนวนเมนู', 'chart-cp-price', { tall: true }),
      chartCard('ส่วนแบ่งตลาดโดยประมาณ', 'chart-cp-share', { tall: true })
    ) +
    panel('ตารางเปรียบเทียบคู่แข่ง', dataTable([
      { key: 'name', label: 'แบรนด์' },
      { key: 'positioning', label: 'จุดยืน' },
      { key: 'pricePerBox', label: 'ราคา/กล่อง', align: 'right', fmt: v => fmtNum(v) },
      { key: 'menuCount', label: 'จำนวนเมนู', align: 'right', fmt: v => fmtNum(v) },
      { key: 'sharePct', label: 'ส่วนแบ่ง', align: 'right', fmt: v => fmtPct(v, 0) },
      { key: 'strength', label: 'จุดแข็ง' },
      { key: 'weakness', label: 'จุดอ่อน' }
    ], tableRows)) +
    panel('เทียบความสามารถที่ลูกค้าถามหา', dataTable(featureCols, featureRows), {
      note: 'ช่องทางที่เรามีครบทั้ง 5 (LINE, แอปเดลิเวอรี, องค์กร, ฟิตเนส, ตู้แช่) เป็นข้อต่างที่ชัดที่สุดในตาราง'
    }) +
    noteBox('⚔️ กลยุทธ์การแข่งขันที่แนะนำ', [
      { badge: 'ตำแหน่งราคา', tone: 'opportunity', text: 'วางราคาเฉลี่ย 165 บาท — ต่ำกว่าค่าเฉลี่ยคู่แข่ง (' + fmtNum(avgRivalPrice) + ' บาท) แต่ไม่ลงไปแข่งกับกลุ่ม 129-139 บาท ที่ไม่ระบุสารอาหาร' },
      { badge: 'จุดต่างหลัก', tone: 'opportunity', text: 'ระบุแคลอรี/โปรตีน/โซเดียมครบทุกกล่อง + รับงานองค์กร — คู่แข่งที่ทำได้ทั้งสองอย่างมีเพียง 1 ราย' },
      { badge: 'อย่าแข่งตรง', tone: 'warning', text: 'Fitwhey Food แข็งมากในกลุ่มฟิตเนสเพราะขายอาหารเสริมร่วมด้วย — เราควรเข้าฟิตเนสในฐานะ "อาหารประจำวัน" ไม่ใช่ "อาหารนักกล้าม"' },
      { badge: 'ช่องว่างตลาด', tone: 'info', text: 'ยังไม่มีคู่แข่งรายใดจับกลุ่มสวัสดิการอาหารกลางวันองค์กรอย่างจริงจัง — เป็นช่องทางที่ราคาต่อกล่องต่ำแต่กำไรต่อออเดอร์สูงที่สุด' }
    ]);


  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('market-competitor', { data, filters: f }));
  // --- Scatter ราคา vs จำนวนเมนู ---
  createChart('chart-cp-price', {
    type: 'bubble',
    data: {
      datasets: shown.map((c, i) => ({
        label: c.name,
        data: [{ x: c.menuCount, y: c.pricePerBox, r: Math.max(7, c.sharePct * 0.8) }],
        backgroundColor: (BRAND_COLORS[c.id] || CHART_COLORS[i % CHART_COLORS.length]) + (c.id === US ? 'FF' : 'AA'),
        borderColor: BRAND_COLORS[c.id] || CHART_COLORS[i % CHART_COLORS.length],
        borderWidth: c.id === US ? 3 : 1
      }))
    },
    options: {
      plugins: {
        legend: legendOpts(),
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label + ': ' + fmtNum(ctx.parsed.y) + ' บาท, ' + ctx.parsed.x + ' เมนู'
          }
        }
      },
      scales: {
        x: { ...baseScales({ xCallback: v => v + ' เมนู' }).x, title: { display: true, text: 'จำนวนเมนู', color: baseScales().x.ticks.color } },
        y: { ...baseScales({ yCallback: v => fmtNum(v) + ' ฿', beginAtZero: false }).y, title: { display: true, text: 'ราคาต่อกล่อง (บาท)', color: baseScales().y.ticks.color } }
      }
    }
  });

  // --- ส่วนแบ่งตลาด ---
  const shareValues = all.map(c => varyPercent(c.sharePct, f, { seed: c.id.length }));
  const others = Math.max(0, +(100 - shareValues.reduce((s, v) => s + v, 0)).toFixed(1));

  createChart('chart-cp-share', {
    type: 'doughnut',
    data: {
      labels: [...all.map(c => c.name), 'รายย่อยอื่น ๆ'],
      datasets: [{
        data: [...shareValues, others],
        backgroundColor: [...all.map((c, i) => BRAND_COLORS[c.id] || CHART_COLORS[i % CHART_COLORS.length]), '#94a3b8'],
        borderColor: 'rgba(255,255,255,0.75)', borderWidth: 2
      }]
    },
    options: {
      cutout: '52%',
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.label + ': ' + ctx.parsed + '%' } } }
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
      ${buildFilterBar([COMPETITOR_FILTER, REGION_FILTER])}
      <div class="cp-body"></div>
    </div>`;

    const body = container.querySelector('.cp-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('market-competitor mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
