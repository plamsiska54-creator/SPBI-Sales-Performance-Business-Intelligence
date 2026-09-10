/**
 * plan-risk.js — ความเสี่ยงและแผนรับมือ
 */

import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import { fetchJSON } from '../../shared/data-loader.js';
import {
  buildFilterBar, onFilterChange, getFilterValues,
  PRIORITY_FILTER
} from '../../shared/filter-builder.js';
import { filterByField } from '../../shared/filter-data.js';
import {
  kpiGrid, chartCard, chartGrid, panel, dataTable, noteBox, assumptionBar,
  fmtNum, fmtPct, pill, baseScales, legendOpts, loadingHTML, errorHTML, emptyHTML
} from '../../shared/ui-kit.js';
import { aiPanel } from '../../shared/ai-analyst.js';

let mountId = 0;
let filterCleanup = null;

const LEVEL_LABEL = { high: 'สูง', medium: 'กลาง', low: 'ต่ำ' };
const LEVEL_TONE = { high: 'negative', medium: 'warning', low: 'positive' };
const LEVEL_SCORE = { high: 3, medium: 2, low: 1 };

function riskCards(risks) {
  if (!risks.length) return emptyHTML('ไม่มีความเสี่ยงในระดับที่เลือก');
  return '<div class="hb-cards">' + risks.map(r => `
    <div class="hb-card">
      <div class="hb-card-head">
        <div>
          <div class="hb-card-title">${r.title}</div>
          <div class="hb-card-sub">หมวด: ${r.category}</div>
        </div>
      </div>
      <div class="hb-tl-meta" style="margin-bottom:10px">
        ${pill('โอกาสเกิด: ' + (LEVEL_LABEL[r.likelihood] || r.likelihood), LEVEL_TONE[r.likelihood] || 'neutral')}
        ${pill('ผลกระทบ: ' + (LEVEL_LABEL[r.impact] || r.impact), LEVEL_TONE[r.impact] || 'neutral')}
      </div>
      <p><strong>ถ้าเกิดขึ้นจะกระทบอะไร</strong><br>${r.effect}</p>
      <p style="margin-top:8px"><strong>แผนรับมือ</strong><br>${r.mitigation}</p>
    </div>`).join('') + '</div>';
}

function renderContent(root, data, f) {
  destroyAll();

  const all = data.risks;
  const risks = filterByField(all, f, 'priority');

  const highRisk = all.filter(r => r.priority === 'high');
  const criticalCount = all.filter(r => r.likelihood === 'high' && r.impact === 'high').length;
  const categories = [...new Set(all.map(r => r.category))];
  const avgScore = +(all.reduce((s, r) => s + LEVEL_SCORE[r.likelihood] * LEVEL_SCORE[r.impact], 0) / all.length).toFixed(1);

  const kpis = [
    { icon: '📋', label: 'ความเสี่ยงที่ระบุไว้', value: fmtNum(all.length) + ' รายการ', sub: categories.length + ' หมวด', tone: 'neutral' },
    { icon: '🚨', label: 'ระดับความสำคัญสูง', value: fmtNum(highRisk.length) + ' รายการ', sub: 'ต้องมีแผนรับมือพร้อมใช้', tone: 'negative' },
    { icon: '⚠️', label: 'โอกาสเกิดสูง + ผลกระทบสูง', value: fmtNum(criticalCount) + ' รายการ', sub: criticalCount ? 'ต้องทบทวนทุกเดือน' : 'ไม่มี', tone: criticalCount ? 'negative' : 'positive' },
    { icon: '📊', label: 'คะแนนความเสี่ยงเฉลี่ย', value: avgScore + ' / 9', sub: avgScore >= 5 ? 'ระดับที่ต้องเฝ้าระวัง' : 'อยู่ในระดับจัดการได้', tone: avgScore >= 5 ? 'negative' : 'positive' }
  ];

  const rows = all.map(r => ({
    title: r.title,
    category: r.category,
    likelihood: pill(LEVEL_LABEL[r.likelihood], LEVEL_TONE[r.likelihood]),
    impact: pill(LEVEL_LABEL[r.impact], LEVEL_TONE[r.impact]),
    score: LEVEL_SCORE[r.likelihood] * LEVEL_SCORE[r.impact],
    priority: pill(LEVEL_LABEL[r.priority], LEVEL_TONE[r.priority]),
    mitigation: r.mitigation
  })).sort((a, b) => b.score - a.score);

  root.innerHTML =
    assumptionBar('คะแนนความเสี่ยง = โอกาสเกิด × ผลกระทบ (สูงสุด 9) — <strong>ทบทวนตารางนี้ทุกเดือนในที่ประชุมผู้บริหาร</strong>') +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('แผนที่ความเสี่ยง (โอกาสเกิด × ผลกระทบ)', 'chart-rk-matrix', { tall: true, note: 'ความเสี่ยงที่อยู่มุมขวาบนต้องมีแผนรับมือที่ลงมือได้ทันที' }),
      chartCard('คะแนนความเสี่ยงเรียงจากมากไปน้อย', 'chart-rk-score', { tall: true })
    ) +
    chartGrid(
      chartCard('จำนวนความเสี่ยงตามหมวด', 'chart-rk-category', { tall: true }),
      panel('สรุปความเสี่ยงและแผนรับมือ', dataTable([
        { key: 'title', label: 'ความเสี่ยง' },
        { key: 'likelihood', label: 'โอกาส', align: 'center' },
        { key: 'impact', label: 'ผลกระทบ', align: 'center' },
        { key: 'score', label: 'คะแนน', align: 'right' },
        { key: 'priority', label: 'ระดับ', align: 'center' }
      ], rows))
    ) +
    `<h3 class="chart-card-title" style="margin:24px 0 12px">รายละเอียดและแผนรับมือ${risks.length !== all.length ? ' (กรองแล้ว ' + risks.length + ' จาก ' + all.length + ' รายการ)' : ''}</h3>` +
    riskCards(risks) +
    noteBox('🛡️ สามเรื่องที่ต้องเตรียมก่อนเปิดขาย', [
      { badge: '1. เงินสำรอง', tone: 'alert', text: 'ขอวงเงิน OD 500,000 บาทให้อนุมัติก่อนวันเปิดขาย — ความเสี่ยงเรื่องยอดขายโตช้าเป็นเรื่องที่มีโอกาสเกิดสูงที่สุด' },
      { badge: '2. ซัพพลายเออร์สำรอง', tone: 'warning', text: 'ทุกหมวดวัตถุดิบต้องมีผู้ขายสำรอง 2 ราย และล็อกราคาไก่/ผัก/ข้าวเป็นรายไตรมาส' },
      { badge: '3. ระบบความปลอดภัยอาหาร', tone: 'opportunity', text: 'GMP + บันทึกอุณหภูมิ + เก็บตัวอย่างอาหาร 48 ชั่วโมง ทั้งลดความเสี่ยงและเป็นจุดขายกับลูกค้าองค์กร' }
    ]);


  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('plan-risk', { data, filters: f }));
  // --- Risk matrix ---
  createChart('chart-rk-matrix', {
    type: 'bubble',
    data: {
      datasets: all.map((r, i) => ({
        label: r.title,
        data: [{
          x: LEVEL_SCORE[r.likelihood],
          y: LEVEL_SCORE[r.impact],
          r: 10 + LEVEL_SCORE[r.priority] * 3
        }],
        backgroundColor: (LEVEL_SCORE[r.likelihood] * LEVEL_SCORE[r.impact] >= 6 ? '#e11d48' : LEVEL_SCORE[r.likelihood] * LEVEL_SCORE[r.impact] >= 4 ? '#f59e0b' : '#16a34a') + 'BB',
        borderColor: CHART_COLORS[i % CHART_COLORS.length]
      }))
    },
    options: {
      plugins: {
        legend: { ...legendOpts(), labels: { ...legendOpts().labels, boxWidth: 10 } },
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label,
            afterLabel: ctx => 'โอกาส ' + (['', 'ต่ำ', 'กลาง', 'สูง'][ctx.parsed.x]) + ' · ผลกระทบ ' + (['', 'ต่ำ', 'กลาง', 'สูง'][ctx.parsed.y])
          }
        }
      },
      scales: {
        x: {
          ...baseScales().x, min: 0, max: 4,
          ticks: { ...baseScales().x.ticks, stepSize: 1, callback: v => ['', 'ต่ำ', 'กลาง', 'สูง', ''][v] || '' },
          title: { display: true, text: 'โอกาสเกิด', color: baseScales().x.ticks.color }
        },
        y: {
          ...baseScales().y, min: 0, max: 4,
          ticks: { ...baseScales().y.ticks, stepSize: 1, callback: v => ['', 'ต่ำ', 'กลาง', 'สูง', ''][v] || '' },
          title: { display: true, text: 'ผลกระทบ', color: baseScales().y.ticks.color }
        }
      }
    }
  });

  // --- คะแนนความเสี่ยง ---
  createChart('chart-rk-score', {
    type: 'bar',
    data: {
      labels: rows.map(r => r.title),
      datasets: [{
        label: 'คะแนนความเสี่ยง (สูงสุด 9)',
        data: rows.map(r => r.score),
        backgroundColor: rows.map(r => r.score >= 6 ? 'rgba(225,29,72,0.85)' : r.score >= 4 ? 'rgba(245,158,11,0.85)' : 'rgba(22,163,74,0.85)'),
        borderRadius: 5
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => 'คะแนน ' + ctx.parsed.x + ' / 9' } } },
      scales: baseScales({ xCallback: v => v })
    }
  });

  // --- ตามหมวด ---
  createChart('chart-rk-category', {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [{
        data: categories.map(c => all.filter(r => r.category === c).length),
        backgroundColor: CHART_COLORS.slice(0, categories.length),
        borderColor: 'rgba(255,255,255,0.75)', borderWidth: 2
      }]
    },
    options: {
      cutout: '52%',
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.label + ': ' + ctx.parsed + ' รายการ' } } }
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
      ${buildFilterBar([PRIORITY_FILTER])}
      <div class="rk-body"></div>
    </div>`;

    const body = container.querySelector('.rk-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('plan-risk mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
