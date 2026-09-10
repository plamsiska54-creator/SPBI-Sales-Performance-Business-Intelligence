/**
 * biz-overview.js — ภาพรวมธุรกิจ Health Bento
 * KPI หลัก, Vision/Mission, จุดเด่น (USP), สัดส่วนรายได้ตามช่องทาง
 */

import { fetchJSON } from '../../shared/data-loader.js';
import { createChart, destroyAll, CHART_COLORS } from '../../shared/chart-factory.js';
import {
  kpiGrid, chartCard, panel,
  fmtBaht, fmtNum, fmtPct,
  loadingHTML, errorHTML,
  legendOpts
} from '../../shared/ui-kit.js';

// ── Mount guard ─────────────────────────────────────────────
let mountId = 0;

// ── สัดส่วนรายได้ตามช่องทาง (mock — ใช้เมื่อ JSON ไม่มีข้อมูล) ──
const DEFAULT_CHANNEL_MIX = [
  { channel: 'Line OA', pct: 25 },
  { channel: 'Grab Food', pct: 20 },
  { channel: 'Facebook', pct: 15 },
  { channel: 'หน้าร้าน', pct: 15 },
  { channel: 'ตลาดนัด', pct: 10 },
  { channel: 'ซูเปอร์มาร์เก็ต', pct: 10 },
  { channel: 'เว็บไซต์', pct: 5 }
];

// ── Mount ───────────────────────────────────────────────────
export async function mount(container) {
  const id = ++mountId;
  container.innerHTML = loadingHTML();

  try {
    const raw = await fetchJSON('/data/bizplan.json');
    if (id !== mountId) return;

    const ov = raw.overview;
    if (!ov) {
      container.innerHTML = errorHTML('ไม่พบข้อมูลภาพรวมธุรกิจ');
      return;
    }

    const k = ov.kpis || {};
    const channelMix = ov.channelMix || DEFAULT_CHANNEL_MIX;

    // ── KPI Cards ─────────────────────────────────────────
    const kpis = kpiGrid([
      { icon: '💰', label: 'เป้ารายได้/ปี', value: fmtBaht(k.targetRevenue) },
      { icon: '📦', label: 'เป้าออเดอร์/วัน', value: fmtNum(k.targetOrdersPerDay) + ' ออเดอร์' },
      { icon: '📊', label: 'เป้า Gross Margin', value: fmtPct(k.targetGrossMargin, 0) },
      { icon: '🔄', label: 'ลูกค้ากลับซื้อซ้ำ', value: fmtPct(k.targetCustomerReturn, 0) }
    ]);

    // ── Vision & Mission Panel ────────────────────────────
    const vmContent = `
      <div class="hb-vm-block">
        <p class="hb-vm-tagline">${ov.tagline || ''}</p>
        <div class="hb-vm-row">
          <div class="hb-vm-item">
            <strong>วิสัยทัศน์ (Vision)</strong>
            <p>${ov.vision || '-'}</p>
          </div>
          <div class="hb-vm-item">
            <strong>พันธกิจ (Mission)</strong>
            <p>${ov.mission || '-'}</p>
          </div>
        </div>
      </div>`;
    const vmPanel = panel('วิสัยทัศน์ & พันธกิจ', vmContent);

    // ── USP Panel ─────────────────────────────────────────
    const uspItems = Array.isArray(ov.usp) ? ov.usp : [];
    const uspListHtml = uspItems.map(item =>
      `<li>${item}</li>`
    ).join('');
    const uspPanel = panel('จุดเด่น (USP)', `
      <ul class="hb-usp-list" style="list-style:none;padding:0;margin:0;">
        ${uspListHtml}
      </ul>
      <style>
        .hb-usp-list li {
          position: relative;
          padding: 8px 0 8px 28px;
          line-height: 1.6;
          border-bottom: 1px solid var(--border, rgba(0,0,0,0.06));
        }
        .hb-usp-list li:last-child { border-bottom: none; }
        .hb-usp-list li::before {
          content: '\\2714';
          position: absolute;
          left: 0;
          color: var(--primary, #16a34a);
          font-weight: bold;
          font-size: 1.1em;
        }
      </style>
    `);

    // ── Channel Mix Chart ─────────────────────────────────
    const channelChart = chartCard('สัดส่วนรายได้ตามช่องทาง (ประมาณการ)', 'chart-channel-mix');

    // ── ประกอบ HTML ───────────────────────────────────────
    container.innerHTML = `
      <div class="tab-content">
        ${kpis}
        <div class="chart-grid">
          ${vmPanel}
          ${channelChart}
        </div>
        ${uspPanel}
      </div>`;

    // ── สร้าง Doughnut Chart ──────────────────────────────
    createChart('chart-channel-mix', {
      type: 'doughnut',
      data: {
        labels: channelMix.map(c => c.channel),
        datasets: [{
          data: channelMix.map(c => c.pct),
          backgroundColor: CHART_COLORS.slice(0, channelMix.length),
          borderWidth: 2,
          borderColor: 'var(--card-bg, #ffffff)'
        }]
      },
      options: {
        plugins: {
          legend: legendOpts('right'),
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return ctx.label + ': ' + ctx.parsed + '%';
              }
            }
          }
        },
        cutout: '55%'
      }
    });

  } catch (err) {
    if (id !== mountId) return;
    console.error('biz-overview mount error:', err);
    container.innerHTML = errorHTML();
  }
}

// ── Unmount ─────────────────────────────────────────────────
export function unmount() {
  mountId++;
  destroyAll();
}
