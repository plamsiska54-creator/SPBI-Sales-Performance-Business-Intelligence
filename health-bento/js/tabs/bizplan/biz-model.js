/**
 * biz-model.js -- Business Model Canvas (BMC) แบบ 9 ช่อง
 * แสดงข้อมูลจาก bizplan.json key "bmc"
 */

import { fetchJSON } from '../../shared/data-loader.js';
import { loadingHTML, errorHTML } from '../../shared/ui-kit.js';

// ── BMC cell config ─────────────────────────────────────────

const BMC_CELLS = [
  { key: 'keyPartners',            label: 'Key Partners',            color: '#7c4dff', col: '1 / 3',  row: '1 / 3' },
  { key: 'keyActivities',          label: 'Key Activities',          color: '#2979ff', col: '3 / 5',  row: '1 / 2' },
  { key: 'keyResources',           label: 'Key Resources',           color: '#0ea5e9', col: '3 / 5',  row: '2 / 3' },
  { key: 'valueProposition',       label: 'Value Proposition',       color: '#16a34a', col: '5 / 7',  row: '1 / 3' },
  { key: 'customerRelationships',  label: 'Customer Relationships',  color: '#e11d48', col: '7 / 9',  row: '1 / 2' },
  { key: 'channels',               label: 'Channels',                color: '#f59e0b', col: '7 / 9',  row: '2 / 3' },
  { key: 'customerSegments',       label: 'Customer Segments',       color: '#ed8936', col: '9 / 11', row: '1 / 3' },
  { key: 'costStructure',          label: 'Cost Structure',          color: '#e53e3e', col: '1 / 6',  row: '3 / 4' },
  { key: 'revenueStreams',          label: 'Revenue Streams',         color: '#16a34a', col: '6 / 11', row: '3 / 4' },
];

// ── Style block (inject ครั้งเดียว) ─────────────────────────

const STYLE_ID = 'bmc-style';

function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
.bmc-section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary, #2d3748);
  margin: 0 0 4px 0;
}
.bmc-section-sub {
  font-size: 0.85rem;
  color: var(--text-muted, #718096);
  margin: 0;
}
.bmc-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: auto auto auto;
  gap: 1px;
  background: var(--border-color, #e2e8f0);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  overflow: hidden;
  margin-top: 16px;
}
.bmc-cell {
  background: var(--card-bg, #ffffff);
  padding: 16px;
}
.bmc-cell h4 {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
  color: var(--text-muted, #718096);
}
.bmc-cell ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.bmc-cell li {
  font-size: 0.85rem;
  padding: 4px 0;
  color: var(--text-primary, #2d3748);
}
.bmc-cell li::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
  background: var(--bmc-dot-color, #a0aec0);
}

/* Responsive: stack 1 คอลัมน์บนจอเล็ก */
@media (max-width: 767px) {
  .bmc-grid {
    grid-template-columns: 1fr;
  }
  .bmc-cell {
    grid-column: 1 / -1 !important;
    grid-row: auto !important;
  }
}
`;
  document.head.appendChild(style);
}

// ── Render helpers ──────────────────────────────────────────

function renderCell(cfg, items) {
  const listItems = (items || [])
    .map(item => `<li>${item}</li>`)
    .join('');

  return `<div class="bmc-cell"
    style="grid-column: ${cfg.col}; grid-row: ${cfg.row}; --bmc-dot-color: ${cfg.color};">
    <h4 style="color: ${cfg.color};">${cfg.label}</h4>
    <ul>${listItems}</ul>
  </div>`;
}

function renderBMC(bmc) {
  const cells = BMC_CELLS.map(cfg => renderCell(cfg, bmc[cfg.key])).join('');

  return `<div class="tab-content">
    <h2 class="bmc-section-title">Business Model Canvas</h2>
    <p class="bmc-section-sub">โครงสร้างโมเดลธุรกิจ 9 ช่อง</p>
    <div class="bmc-grid">${cells}</div>
  </div>`;
}

// ── mount / unmount ─────────────────────────────────────────

let mountId = 0;

export async function mount(container) {
  const id = ++mountId;
  container.innerHTML = loadingHTML();
  injectStyle();

  try {
    const raw = await fetchJSON('/data/bizplan.json');
    if (id !== mountId) return; // ผู้ใช้เปลี่ยนหน้าระหว่างรอโหลด

    const bmc = raw && raw.bmc;
    if (!bmc) {
      container.innerHTML = errorHTML('ไม่พบข้อมูล Business Model Canvas');
      return;
    }

    container.innerHTML = renderBMC(bmc);
  } catch (err) {
    if (id !== mountId) return;
    console.error('biz-model mount error:', err);
    container.innerHTML = errorHTML('เกิดข้อผิดพลาดในการโหลดข้อมูล Business Model Canvas');
  }
}

export function unmount() {
  mountId++;
}
