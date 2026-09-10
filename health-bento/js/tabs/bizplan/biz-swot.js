/**
 * biz-swot.js — SWOT Analysis แบบ 4 quadrants
 * โหลดข้อมูลจาก /data/bizplan.json (key: data.swot)
 */

import { fetchJSON } from '../../shared/data-loader.js';
import { loadingHTML, errorHTML } from '../../shared/ui-kit.js';

let mountId = 0;

// ── สีประจำ quadrant ────────────────────────────────────────
const QUADS = [
  { key: 'strengths',     label: 'S — จุดแข็ง',   color: '#16a34a' },
  { key: 'weaknesses',    label: 'W — จุดอ่อน',   color: '#e53e3e' },
  { key: 'opportunities', label: 'O — โอกาส',     color: '#2979ff' },
  { key: 'threats',       label: 'T — อุปสรรค',   color: '#ed8936' },
];

/** สร้าง HTML สำหรับ quadrant 1 ช่อง */
function quadHTML(q, items) {
  const lis = (items || [])
    .map(t => `<li style="color:inherit">${t}</li>`)
    .join('');

  return `<div class="swot-quad"
    style="background:rgba(${hexToRgb(q.color)},0.08);border-left:4px solid ${q.color}">
    <h3><span style="color:${q.color}">${q.label}</span></h3>
    <ul class="swot-list-${q.key}">${lis}</ul>
  </div>`;
}

/** แปลง hex (#rrggbb) -> "r,g,b" สำหรับ rgba() */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ].join(',');
}

/** CSS สำหรับ SWOT grid — inject เป็น <style> block ใน innerHTML */
function swotCSS() {
  // สร้าง li::before rules แยกตามสีของแต่ละ quadrant
  const bulletRules = QUADS.map(q =>
    `.swot-list-${q.key} li::before { color: ${q.color}; }`
  ).join('\n  ');

  // dark mode — เพิ่ม opacity พื้นหลัง + ปรับสี text ให้อ่านง่ายขึ้น
  const darkBgRules = QUADS.map(q =>
    `[data-theme="dark"] .swot-list-${q.key} { color: #e2e8f0; }
  [data-theme="dark"] .swot-quad:has(.swot-list-${q.key}) {
    background: rgba(${hexToRgb(q.color)},0.12) !important;
  }`
  ).join('\n  ');

  return `
  .swot-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 16px;
  }
  .swot-quad {
    border-radius: 12px;
    padding: 20px 24px;
    min-height: 180px;
  }
  .swot-quad h3 {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .swot-quad ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .swot-quad li {
    padding: 6px 0;
    padding-left: 20px;
    position: relative;
    font-size: 0.9rem;
    line-height: 1.5;
  }
  .swot-quad li::before {
    content: '\\2022';
    position: absolute;
    left: 4px;
    font-weight: bold;
  }
  ${bulletRules}
  @media (max-width: 767px) {
    .swot-grid { grid-template-columns: 1fr; }
  }
  /* Dark mode */
  [data-theme="dark"] .swot-quad h3 span { filter: brightness(1.25); }
  ${darkBgRules}`;
}

// ── Public API ───────────────────────────────────────────────

export async function mount(container) {
  const id = ++mountId;
  container.innerHTML = loadingHTML();

  try {
    const data = await fetchJSON('/data/bizplan.json');
    if (id !== mountId) return; // tab ถูกสลับออกไปแล้ว

    const swot = data.swot || {};
    const quadsHTML = QUADS.map(q => quadHTML(q, swot[q.key])).join('');

    container.innerHTML = `<div class="tab-content">
      <style>${swotCSS()}</style>
      <h2 style="margin:0 0 4px">SWOT Analysis</h2>
      <p style="margin:0 0 8px;color:var(--text-muted,#718096);font-size:0.85rem">
        วิเคราะห์จุดแข็ง จุดอ่อน โอกาส และอุปสรรคของธุรกิจ
      </p>
      <div class="swot-grid">${quadsHTML}</div>
    </div>`;
  } catch (err) {
    if (id !== mountId) return;
    console.error('[biz-swot]', err);
    container.innerHTML = errorHTML('ไม่สามารถโหลดข้อมูล SWOT ได้');
  }
}

export function unmount() {
  mountId++;
}
