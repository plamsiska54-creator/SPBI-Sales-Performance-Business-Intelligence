/**
 * retail-chains.js — ภาพรวมทุกห้างและกลุ่มลูกค้าคนรักสุขภาพของแต่ละห้าง
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

/** กรองห้างตามฟิลเตอร์ที่เลือก */
export function selectChains(data, f) {
  let chains = data.chains;
  if (f.format && f.format !== 'all') chains = chains.filter(c => c.format === f.format);
  if (f.chain && f.chain !== 'all') chains = chains.filter(c => c.id === f.chain);
  return chains.length ? chains : data.chains;
}

function formatName(data, id) {
  const found = data.formats.find(x => x.id === id);
  return found ? found.name : id;
}

function healthTone(index) {
  return index >= 70 ? 'positive' : index >= 50 ? 'warning' : 'negative';
}

function renderContent(root, data, f) {
  destroyAll();

  const chains = selectChains(data, f);
  if (!chains.length) {
    root.innerHTML = emptyHTML('ไม่มีห้างในเงื่อนไขที่เลือก');
    return;
  }

  const totalBranches = chains.reduce((s, c) => s + c.branches, 0);
  const startBranches = chains.reduce((s, c) => s + c.startBranches, 0);
  const bestHealth = chains.reduce((a, b) => (b.customer.healthIndex > a.customer.healthIndex ? b : a), chains[0]);
  const avgHealth = chains.reduce((s, c) => s + c.customer.healthIndex, 0) / chains.length;
  const avgBasket = chains.reduce((s, c) => s + c.customer.basketSize, 0) / chains.length;
  const withRte = chains.filter(c => c.shelf.hasChilledRte).length;
  const withRevenue = chains.filter(c => c.storeRevenuePerDay);

  const kpis = [
    { icon: '🏬', label: 'ห้างในเงื่อนไขนี้', value: fmtNum(chains.length) + ' เครือ', sub: 'จากทั้งหมด ' + data.chains.length + ' เครือ', tone: 'neutral' },
    { icon: '📍', label: 'สาขารวมทั้งประเทศ', value: fmtNum(totalBranches) + ' สาขา', sub: 'ตัวเลขอ้างอิงข้อมูลสาธารณะ', tone: 'neutral' },
    { icon: '🎯', label: 'สาขาที่ควรเริ่มวางขาย', value: fmtNum(startBranches) + ' สาขา', sub: 'คิดเป็น ' + fmtPct((startBranches / totalBranches) * 100, 1) + ' ของสาขาทั้งหมด', tone: 'positive' },
    { icon: '🥗', label: 'ดัชนีลูกค้าใส่ใจสุขภาพเฉลี่ย', value: fmtNum(Math.round(avgHealth)) + ' / 100', sub: 'ค่าประมาณของทีม (proxy) · สูงสุด: ' + bestHealth.name, tone: healthTone(avgHealth) },
    { icon: '🏪', label: 'ยอดขายต่อสาขาต่อวัน (จากงบการเงิน)',
      value: withRevenue.length ? fmtNum(Math.round(withRevenue.reduce((s, c) => s + c.storeRevenuePerDay, 0) / withRevenue.length)) + ' บาท' : 'ไม่มีข้อมูล',
      sub: withRevenue.length ? 'เฉลี่ยจาก ' + withRevenue.length + ' เครือที่เปิดเผยงบ (' + withRevenue.map(c => c.name.split(' ')[0]).join(', ') + ')' : 'ยังไม่มีเครือใดเปิดเผย',
      tone: 'positive' },
    { icon: '🧊', label: 'มีชั้นอาหารพร้อมทานแช่เย็น', value: fmtNum(withRte) + ' / ' + chains.length + ' เครือ', sub: 'ต้องมีชั้นแช่เย็นจึงวางขายได้', tone: withRte === chains.length ? 'positive' : 'warning' },
    { icon: '👑', label: 'ห้างที่ตรงกลุ่มที่สุด', value: bestHealth.name, sub: 'ดัชนีสุขภาพ ' + bestHealth.customer.healthIndex + ' · ' + bestHealth.branches + ' สาขา', tone: 'positive' },
    { icon: '🏷️', label: 'ราคาบนชั้นที่ตั้งได้ (เฉลี่ย)', value: fmtNum(Math.round(chains.reduce((s, c) => s + c.shelf.rsp, 0) / chains.length)) + ' บาท', sub: 'ราคาขายปลีกที่แนะนำ', tone: 'neutral' }
  ];

  const rows = data.chains.map(c => ({
    name: c.name,
    group: c.group,
    format: pill(formatName(data, c.format), c.format === 'premium' ? 'positive' : c.format === 'cvs' ? 'warning' : 'info'),
    branches: c.branches,
    verified: c.branchesVerified
      ? pill('ยืนยันแล้ว ' + (c.branchesSources || []).join('/'), 'positive')
      : pill('ประมาณการ', 'warning'),
    startBranches: c.startBranches,
    healthIndex: c.customer.healthIndex,
    basketSize: c.customer.basketSize,
    rsp: c.shelf.rsp,
    storeRevenuePerDay: c.storeRevenuePerDay,
    revSource: c.storeRevenuePerDay ? pill('งบการเงิน ' + c.storeRevenueSource, 'positive') : pill('ยังไม่มีงบเปิดเผย', 'warning'),
    branchesNote: c.branchesNote
  }));

  /** แผงแหล่งอ้างอิง — ให้กดลิงก์ต้นทางได้จากในหน้าเว็บ */
  const sourcesPanel = panel('แหล่งอ้างอิงของตัวเลขจำนวนสาขา',
    '<div class="hb-cards">' + data.sources.map(s => `
      <div class="hb-card">
        <div class="hb-card-head">
          <div>
            <div class="hb-card-title">${s.id} · ${s.label}</div>
            <div class="hb-card-sub"><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.url}</a></div>
          </div>
        </div>
        <p>${s.confirms}</p>
      </div>`).join('') + '</div>',
    { note: 'คอลัมน์ "ที่มา" ในตารางด้านบนอ้างถึงรหัส S1-S5 เหล่านี้ · ตัวเลขที่ไม่มีรหัสกำกับคือค่าประมาณการของทีม' }
  );

  const customerCards = chains.map(c => `
    <div class="hb-card">
      <div class="hb-card-head">
        <div>
          <div class="hb-card-title">${c.name}</div>
          <div class="hb-card-sub">${c.group} · ${formatName(data, c.format)} · ${fmtNum(c.branches)} สาขา</div>
        </div>
      </div>
      <div class="hb-tl-meta" style="margin-bottom:10px">
        ${pill('ดัชนีสุขภาพ ' + c.customer.healthIndex, healthTone(c.customer.healthIndex))}
        ${pill('ตะกร้า ' + fmtNum(c.customer.basketSize) + ' บาท', 'info')}
        ${pill('อายุ ' + c.customer.ageRange, 'neutral')}
      </div>
      <p><strong>ใครเดินในห้างนี้:</strong> ${c.customer.profile}</p>
      <p style="margin-top:6px"><strong>รายได้:</strong> ${c.customer.income}</p>
      <p style="margin-top:6px">${c.customer.note}</p>
    </div>`).join('');

  root.innerHTML =
    assumptionBar('<strong>ข้อมูลจริงที่ตรวจสอบย้อนกลับได้:</strong> จำนวนสาขา · แผนขยายสาขา · <strong>ยอดขายต่อสาขาต่อวัน (จากงบการเงินปี 2567 ของ CP Axtra และ Central Retail)</strong> · <strong>ยังเป็นค่าประมาณ:</strong> ดัชนีลูกค้าใส่ใจสุขภาพ (มีเช็กลิสต์ให้เก็บจริงท้ายหน้า) · ยอดตะกร้ารายห้าง (ห้างไม่เปิดเผย) · ราคาบนชั้น (ต้องเดินสำรวจ)') +
    kpiGrid(kpis, { cols: 4 }) +
    chartGrid(
      chartCard('ดัชนีลูกค้าใส่ใจสุขภาพของแต่ละห้าง (0-100)', 'chart-rc-health', { tall: true, note: 'ยิ่งสูงยิ่งมีคนซื้ออาหารคลีนเดินในห้างนั้นมาก' }),
      chartCard('จำนวนสาขา (สเกลลอการิทึม)', 'chart-rc-branches', { tall: true, note: 'ร้านสะดวกซื้อมีสาขาหลักพัน จึงต้องใช้สเกลลอการิทึมเทียบกับซูเปอร์พรีเมียม' })
    ) +
    chartGrid(
      chartCard('ขนาดร้าน (ยอดขาย/วัน) เทียบ ดัชนีสุขภาพ', 'chart-rc-basket', { tall: true, note: 'แกนตั้งใช้ยอดขายต่อสาขาต่อวันจากงบการเงินถ้ามี (Tops, Lotus และ Makro) เครืออื่นใช้ยอดตะกร้าประมาณการ × 300 ครั้ง/วัน เป็นค่าแทน' }),
      chartCard('สาขาทั้งหมด เทียบ สาขาที่ควรเริ่ม', 'chart-rc-start', { tall: true })
    ) +
    panel('ตารางเปรียบเทียบทุกห้าง', dataTable([
      { key: 'name', label: 'ห้าง' },
      { key: 'group', label: 'เครือ' },
      { key: 'format', label: 'รูปแบบ', align: 'center' },
      { key: 'branches', label: 'สาขาทั้งหมด', align: 'right', fmt: v => fmtNum(v) },
      { key: 'verified', label: 'ที่มา', align: 'center' },
      { key: 'startBranches', label: 'ควรเริ่มกี่สาขา', align: 'right', fmt: v => fmtNum(v) },
      { key: 'healthIndex', label: 'ดัชนีสุขภาพ', align: 'right' },
      { key: 'storeRevenuePerDay', label: 'ยอดขายร้าน/วัน (บาท)', align: 'right', fmt: v => v ? fmtNum(v) : '-' },
      { key: 'revSource', label: 'ที่มายอดขาย', align: 'center' },
      { key: 'rsp', label: 'ราคาบนชั้นที่แนะนำ', align: 'right', fmt: v => fmtNum(v) },
      { key: 'branchesNote', label: 'หมายเหตุจำนวนสาขา' }
    ], rows)) +
    `<h3 class="chart-card-title" style="margin:24px 0 12px">กลุ่มลูกค้าคนรักสุขภาพของแต่ละห้าง</h3>` +
    `<div class="hb-cards">${customerCards}</div>` +
    (data.chainFinancials ? panel('ยอดขายต่อสาขาต่อวัน — คำนวณจากงบการเงินจริง', dataTable([
      { key: 'chain', label: 'เครือ' },
      { key: 'revenueMB2567', label: 'รายได้ปี 2567 (ลบ.)', align: 'right', fmt: v => fmtNum(v) },
      { key: 'stores', label: 'สาขา', align: 'right', fmt: v => fmtNum(v) },
      { key: 'revenuePerStorePerDay', label: 'ยอดขาย/สาขา/วัน (บาท)', align: 'right', fmt: v => fmtNum(v) },
      { key: 'scope', label: 'ขอบเขตตัวเลข' },
      { key: 'source', label: 'ที่มา', align: 'center' }
    ], data.chainFinancials.rows.map(r => ({
      ...r,
      chain: (data.chains.find(c => c.id === r.chainId) || {}).name || r.chainId,
      source: pill(r.source, 'positive')
    }))), { note: data.chainFinancials.note }) : '') +
    (data.healthIndexChecklist ? panel('ทำให้ "ดัชนีลูกค้าใส่ใจสุขภาพ" เป็นข้อมูลจริง (เช็กลิสต์ให้ทีมเดินสำรวจ)', dataTable([
      { key: 'label', label: 'สิ่งที่ต้องนับ/วัด' },
      { key: 'weightPct', label: 'น้ำหนักคะแนน', align: 'right', fmt: v => fmtPct(v, 0) },
      { key: 'howTo', label: 'วิธีเก็บ' }
    ], data.healthIndexChecklist.items), { note: '⚠️ ' + data.healthIndexChecklist.note + ' — สถานะ: ' + data.healthIndexChecklist.status }) : '') +
    sourcesPanel +
    noteBox('🏬 อ่านข้อมูลนี้อย่างไร', [
      { badge: 'เข้าก่อน', tone: 'opportunity', text: 'Villa Market (ดัชนี 85) และ Gourmet Market (82) มีลูกค้ารักสุขภาพหนาแน่นที่สุดและตะกร้าใหญ่ — วางราคา 185-189 บาทได้โดยไม่ต้องแข่งราคา' },
      { badge: 'ปริมาณมาแต่ราคาต่ำ', tone: 'warning', text: 'Lotus\'s 2,000+ สาขา (ทุกรูปแบบ) และ Big C 140+ สาขา (ไฮเปอร์) เป็นเครือข่ายที่กว้างที่สุด แต่ดัชนีสุขภาพต่ำกว่า 50 และเพดานราคาบนชั้นราว 155-159 บาท — เข้าเมื่อกำลังผลิตพร้อมแล้วเท่านั้น' },
      { badge: 'อย่าเพิ่งเข้า', tone: 'alert', text: '7-Eleven มี 14,545 สาขา แต่แหล่งอ้างอิงระบุเกณฑ์รับสินค้าใหม่ว่าต้องราคาต่ำกว่า 45 บาท และหมุนเวียนอย่างน้อย 2 ชิ้น/สาขา/สัปดาห์ — ข้าวกล่องคลีนของเราอยู่นอกเกณฑ์นี้ตั้งแต่ต้น' },
      { badge: 'ทางอ้อมที่คุ้ม', tone: 'info', text: 'Makro เป็นทางเข้าตลาดองค์กรแบบขายยกแพ็ก GP เพียง 12% และของเสียต่ำสุด (6%) — คุ้มกว่าเข้าห้างปลีกบางแห่ง' }
    ]);

  const sorted = [...chains].sort((a, b) => b.customer.healthIndex - a.customer.healthIndex);


  // --- AI วิเคราะห์ของหน้านี้ ---
  root.insertAdjacentHTML('beforeend', aiPanel('retail-chains', { data, filters: f }));
  // --- ดัชนีสุขภาพ ---
  createChart('chart-rc-health', {
    type: 'bar',
    data: {
      labels: sorted.map(c => c.name),
      datasets: [{
        label: 'ดัชนีลูกค้าใส่ใจสุขภาพ',
        data: sorted.map(c => c.customer.healthIndex),
        backgroundColor: sorted.map(c => c.customer.healthIndex >= 70 ? 'rgba(22,163,74,0.85)' : c.customer.healthIndex >= 50 ? 'rgba(245,158,11,0.85)' : 'rgba(225,29,72,0.85)'),
        borderRadius: 5
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => 'ดัชนี ' + ctx.parsed.x + ' / 100' } } },
      scales: baseScales({ xCallback: v => v })
    }
  });

  // --- จำนวนสาขา ---
  createChart('chart-rc-branches', {
    type: 'bar',
    data: {
      labels: chains.map(c => c.name),
      datasets: [{
        label: 'จำนวนสาขา',
        data: chains.map(c => c.branches),
        backgroundColor: chains.map((c, i) => CHART_COLORS[i % CHART_COLORS.length] + 'CC'),
        borderRadius: 5
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => fmtNum(ctx.parsed.x) + ' สาขา', afterLabel: ctx => chains[ctx.dataIndex].branchesNote } }
      },
      scales: {
        x: {
          type: 'logarithmic',
          ticks: { color: baseScales().x.ticks.color, callback: v => fmtNum(v) },
          grid: baseScales().x.grid
        },
        y: baseScales().y
      }
    }
  });

  // --- ตะกร้า vs ดัชนีสุขภาพ ---
  createChart('chart-rc-basket', {
    type: 'bubble',
    data: {
      datasets: chains.map((c, i) => ({
        label: c.name,
        data: [{ x: c.customer.healthIndex, y: c.customer.basketSize, r: 8 + Math.log10(Math.max(10, c.branches)) * 3 }],
        backgroundColor: CHART_COLORS[i % CHART_COLORS.length] + 'CC',
        borderColor: CHART_COLORS[i % CHART_COLORS.length]
      }))
    },
    options: {
      plugins: {
        legend: { ...legendOpts(), labels: { ...legendOpts().labels, boxWidth: 10 } },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ดัชนี ' + ctx.parsed.x + ' · ยอดขายร้าน ' + fmtNum(ctx.parsed.y) + ' บาท/วัน' } }
      },
      scales: {
        x: { ...baseScales({ xCallback: v => v }).x, title: { display: true, text: 'ดัชนีลูกค้าใส่ใจสุขภาพ', color: baseScales().x.ticks.color } },
        y: { ...baseScales({ yCallback: v => fmtNum(v) }).y, title: { display: true, text: 'ยอดขายต่อสาขาต่อวัน (บาท)', color: baseScales().y.ticks.color } }
      }
    }
  });

  // --- สาขาทั้งหมด vs สาขาที่ควรเริ่ม ---
  createChart('chart-rc-start', {
    type: 'bar',
    data: {
      labels: chains.map(c => c.name),
      datasets: [
        { label: 'สาขาที่ควรเริ่ม', data: chains.map(c => c.startBranches), backgroundColor: 'rgba(22,163,74,0.85)', borderRadius: 5 },
        { label: 'สาขาที่ยังไม่เข้า', data: chains.map(c => Math.max(0, c.branches - c.startBranches)), backgroundColor: 'rgba(148,163,184,0.6)', borderRadius: 5 }
      ]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: legendOpts(), tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtNum(ctx.parsed.x) + ' สาขา' } } },
      scales: {
        x: { ...baseScales({ xCallback: v => fmtNum(v), stacked: true }).x, type: 'logarithmic' },
        y: baseScales({ stacked: true }).y
      }
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
      <div class="rc-body"></div>
    </div>`;

    const body = container.querySelector('.rc-body');
    const draw = (filters) => renderContent(body, data, filters);

    draw(getFilterValues(container));
    filterCleanup = onFilterChange(container, draw);

  } catch (err) {
    if (thisMount !== mountId) return;
    console.error('retail-chains mount error:', err);
    container.innerHTML = errorHTML();
  }
}

export function unmount() {
  mountId++;
  if (filterCleanup) { filterCleanup(); filterCleanup = null; }
  destroyAll();
}
