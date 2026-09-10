/**
 * ui-kit.js — ชิ้นส่วน UI ที่ทุกหน้าใช้ร่วมกัน (KPI card, ตาราง, กล่องข้อคิดเห็น)
 * ทุกฟังก์ชันคืนค่าเป็น HTML string เพื่อให้โมดูลแต่ละหน้าสั้นและอ่านง่าย
 * สไตล์ทั้งหมดอยู่ใน css/health.css (ไม่ inject <style> ต่อหน้า)
 */

// ── ฟอร์แมตตัวเลข ────────────────────────────────────────────

/** 1234567 -> "1.23 ล้านบาท" | 45000 -> "45,000 บาท" */
export function fmtBaht(n, { unit = true } = {}) {
  if (n === null || n === undefined || isNaN(n)) return '-';
  const suffix = unit ? ' บาท' : '';
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + ' ล้าน' + (unit ? 'บาท' : '');
  return n.toLocaleString('th-TH', { maximumFractionDigits: 0 }) + suffix;
}

/** ตัวเลขทั่วไปพร้อม , คั่นหลักพัน */
export function fmtNum(n, decimals = 0) {
  if (n === null || n === undefined || isNaN(n)) return '-';
  return n.toLocaleString('th-TH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function fmtPct(n, decimals = 1) {
  if (n === null || n === undefined || isNaN(n)) return '-';
  return n.toFixed(decimals) + '%';
}

// ── สีตามธีม (อ่านจาก CSS variable เพื่อให้โหมดกลางคืนอ่านออก) ──

function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function axisColor() {
  return cssVar('--text-muted', '#718096');
}

export function gridColor() {
  return document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(0,0,0,0.06)';
}

/** ตัวเลือก scales มาตรฐาน — ใส่ tickCallback เพื่อเติมหน่วย */
export function baseScales({ yCallback = null, xCallback = null, beginAtZero = true, stacked = false } = {}) {
  const ac = axisColor();
  const gc = gridColor();
  return {
    x: {
      stacked,
      ticks: { color: ac, ...(xCallback ? { callback: xCallback } : {}) },
      grid: { color: gc }
    },
    y: {
      stacked,
      beginAtZero,
      ticks: { color: ac, ...(yCallback ? { callback: yCallback } : {}) },
      grid: { color: gc }
    }
  };
}

/** legend ที่อ่านออกทั้งสองธีม */
export function legendOpts(position = 'bottom') {
  return { position, labels: { color: axisColor(), padding: 12, usePointStyle: true } };
}

// ── บล็อก UI ────────────────────────────────────────────────

/**
 * การ์ด KPI
 * @param {Array<{icon?:string,label:string,value:string,sub?:string,tone?:'positive'|'negative'|'neutral'}>} items
 */
export function kpiGrid(items, { cols = 4 } = {}) {
  const cards = items.map(k => `
    <div class="hb-kpi">
      ${k.icon ? `<div class="hb-kpi-icon">${k.icon}</div>` : ''}
      <div class="hb-kpi-label">${k.label}</div>
      <div class="hb-kpi-value">${k.value}</div>
      ${k.sub ? `<div class="hb-kpi-sub ${k.tone || 'neutral'}">${k.sub}</div>` : ''}
    </div>`).join('');
  return `<div class="hb-kpi-grid cols-${cols}">${cards}</div>`;
}

/** การ์ดกราฟ 1 ใบ */
export function chartCard(title, canvasId, { tall = false, note = '' } = {}) {
  return `<div class="chart-card">
    <h3 class="chart-card-title">${title}</h3>
    <div class="chart-container${tall ? ' chart-tall' : ''}"><canvas id="${canvasId}"></canvas></div>
    ${note ? `<p class="hb-chart-note">${note}</p>` : ''}
  </div>`;
}

/** วางการ์ดเรียงเป็นกริด 2 คอลัมน์ (ยุบเป็น 1 คอลัมน์บนจอเล็ก) */
export function chartGrid(...cards) {
  return `<div class="chart-grid">${cards.join('')}</div>`;
}

/** การ์ดเนื้อหาอิสระ (ตาราง/ข้อความ) */
export function panel(title, innerHtml, { note = '' } = {}) {
  return `<div class="chart-card hb-panel">
    <h3 class="chart-card-title">${title}</h3>
    ${innerHtml}
    ${note ? `<p class="hb-chart-note">${note}</p>` : ''}
  </div>`;
}

/**
 * ตารางข้อมูล
 * @param {Array<{key:string,label:string,align?:string,fmt?:Function}>} columns
 * @param {Array<Object>} rows
 */
export function dataTable(columns, rows, { footer = null } = {}) {
  const head = columns.map(c =>
    `<th style="text-align:${c.align || 'left'}">${c.label}</th>`).join('');

  const body = rows.map(r => {
    const tds = columns.map(c => {
      const raw = r[c.key];
      const val = c.fmt ? c.fmt(raw, r) : (raw === undefined || raw === null ? '-' : raw);
      return `<td style="text-align:${c.align || 'left'}">${val}</td>`;
    }).join('');
    return `<tr>${tds}</tr>`;
  }).join('');

  const foot = footer
    ? `<tfoot><tr>${columns.map(c => {
        const raw = footer[c.key];
        const val = c.fmt && raw !== undefined && raw !== null ? c.fmt(raw, footer) : (raw ?? '');
        return `<td style="text-align:${c.align || 'left'}"><strong>${val}</strong></td>`;
      }).join('')}</tr></tfoot>`
    : '';

  return `<div class="data-table-wrapper"><table class="data-table">
    <thead><tr>${head}</tr></thead>
    <tbody>${body}</tbody>
    ${foot}
  </table></div>`;
}

/** ป้ายสถานะ/หมวด */
export function pill(text, tone = 'neutral') {
  return `<span class="hb-pill ${tone}">${text}</span>`;
}

/**
 * กล่องข้อสังเกต/ข้อเสนอแนะ
 * @param {Array<{badge:string,tone:'alert'|'warning'|'opportunity'|'info',text:string}>} items
 */
export function noteBox(title, items) {
  const rows = items.map(i => `
    <div class="hb-note-item ${i.tone || 'info'}">
      <span class="hb-note-badge">${i.badge}</span>
      <p>${i.text}</p>
    </div>`).join('');
  return `<div class="hb-note-box"><h3>${title}</h3>${rows}</div>`;
}

/** แถบอธิบายว่าเป็นตัวเลขประมาณการ */
export function assumptionBar(text) {
  return `<div class="hb-assumption">${text}</div>`;
}

// ── สถานะการโหลด ───────────────────────────────────────────

export function loadingHTML(text = 'กำลังโหลดข้อมูล...') {
  return `<div class="tab-content"><div class="loading-container">
    <div class="loading-spinner"></div><p class="loading-text">${text}</p>
  </div></div>`;
}

export function errorHTML(text = 'เกิดข้อผิดพลาดในการโหลดข้อมูล') {
  return `<div class="tab-content"><div class="error-state">
    <p class="error-state-text">${text}</p>
  </div></div>`;
}

export function emptyHTML(text = 'ไม่พบข้อมูล') {
  return `<div class="tab-content"><div class="empty-state">
    <p class="empty-state-text">${text}</p>
  </div></div>`;
}
