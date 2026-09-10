/**
 * ai-analyst.js — ตัววิเคราะห์อัตโนมัติที่ใส่ไว้ทุกหน้าของแดชบอร์ด
 *
 * ทำงานแบบ rule engine: อ่านตัวเลขของหน้านั้น + ฟิลเตอร์ที่ผู้ใช้เลือก
 * แล้วเทียบกับเกณฑ์ของแผนธุรกิจและ "ราคาตลาดจริงที่สำรวจมา" (survey.json)
 * เพื่อสรุปว่าอะไรดี อะไรเสี่ยง และควรทำอะไรต่อ
 *
 * หมายเหตุสำคัญ: ไม่ได้เรียกโมเดลภาษา (LLM) — เป็นการคำนวณตามกฎที่เขียนไว้ในไฟล์นี้
 * ข้อดีคือได้ผลเหมือนกันทุกครั้งและตรวจสอบที่มาได้ทุกข้อ
 */

import { fetchJSON } from './data-loader.js';
import { fmtNum, fmtBaht, fmtPct } from './ui-kit.js';
import { chainEconomics, chainPotential } from './retail-math.js';

// ── เกณฑ์อ้างอิงของแผน ────────────────────────────────────────
export const PLAN = {
  avgPrice: 165,
  variableCostPerBox: 84,
  deliveryAndFeePerBox: 26,
  contributionPerBox: 55,
  fixedCostPerMonth: 520000,
  breakEvenBoxesPerDay: 364,
  capacityPerDay: 800,
  targetOnTimePct: 95,
  maxWastePct: 12,
  targetRepeatPct: 42,
  maxCac: 310,
  minLtvToCac: 3
};

// ── ราคาตลาดจริงจากการสำรวจ (เติมค่าเมื่อโหลด survey.json สำเร็จ) ──
let marketBenchmark = null;

/** โหลดผลสำรวจราคาตลาดครั้งเดียว แล้วเก็บไว้ให้ทุกหน้าใช้ */
export async function loadMarketBenchmark() {
  if (marketBenchmark) return marketBenchmark;
  try {
    const survey = await fetchJSON('/data/survey.json');
    const brands = survey.priceSurvey.brands;
    const mids = brands.map(b => (b.priceMin + b.priceMax) / 2).sort((a, b) => a - b);
    const median = mids.length % 2
      ? mids[(mids.length - 1) / 2]
      : (mids[mids.length / 2 - 1] + mids[mids.length / 2]) / 2;
    marketBenchmark = {
      brandCount: brands.length,
      priceMin: Math.min(...brands.map(b => b.priceMin)),
      priceMax: Math.max(...brands.map(b => b.priceMax)),
      median: Math.round(median),
      average: Math.round(mids.reduce((s, v) => s + v, 0) / mids.length),
      cheapestPackagePerBox: survey.priceSurvey.packageBenchmark.pricePerBox,
      rteValueMB: survey.marketSizeReal.rteValueMB2568,
      rteGrowthPct: survey.marketSizeReal.rteGrowthPctPerYear,
      volumeGrowth: survey.marketSizeReal.volumeGrowthPct2567to2569,
      smeFactories: survey.marketSizeReal.smeFactories,
      surveyedAt: survey.priceSurvey.surveyedAt
    };
  } catch {
    marketBenchmark = null;
  }
  return marketBenchmark;
}

export function getMarketBenchmark() {
  return marketBenchmark;
}

// ── ตัวช่วยสร้างข้อค้นพบ ──────────────────────────────────────
const good = (badge, text) => ({ tone: 'good', badge, text });
const info = (badge, text) => ({ tone: 'info', badge, text });
const warn = (badge, text) => ({ tone: 'warn', badge, text });
const risk = (badge, text) => ({ tone: 'risk', badge, text });
const act = (badge, text) => ({ tone: 'action', badge, text });

/** ข้อค้นพบที่ใส่ทุกหน้า: เทียบราคาแผนกับราคาตลาดจริง */
function priceRealityCheck(planPrice = PLAN.avgPrice) {
  const m = marketBenchmark;
  if (!m) return [];
  const gapPct = ((planPrice - m.median) / m.median) * 100;
  if (gapPct > 40) {
    return [risk('ราคาสูงกว่าตลาดจริง',
      'ราคาที่ใช้ในหน้านี้ ' + fmtNum(planPrice) + ' บาท สูงกว่าราคากลางที่สำรวจได้จริง ' + fmtNum(m.median) +
      ' บาท ถึง ' + fmtPct(gapPct, 0) + ' (สำรวจ ' + m.brandCount + ' แบรนด์ ช่วง ' + m.priceMin + '-' + m.priceMax +
      ' บาท) — ต้องพิสูจน์ให้ลูกค้าเห็นว่าต่างกันตรงไหน หรือปรับราคาลง มิฉะนั้นจำนวนกล่องจะไม่ถึงเป้า')];
  }
  if (gapPct > 15) {
    return [warn('ราคาอยู่ครึ่งบนของตลาด',
      'ราคา ' + fmtNum(planPrice) + ' บาท สูงกว่าราคากลางตลาด ' + fmtPct(gapPct, 0) +
      ' — ยังขายได้ถ้าชูจุดขายเรื่องระบุสารอาหารครบและวัตถุดิบพรีเมียม')];
  }
  return [good('ราคาสอดคล้องตลาด',
    'ราคา ' + fmtNum(planPrice) + ' บาท อยู่ในช่วงที่ตลาดจริงยอมจ่าย (กลางตลาด ' + fmtNum(m.median) + ' บาท)')];
}

// ── ตัววิเคราะห์แยกตามหน้า ────────────────────────────────────

const ANALYZERS = {

  overview(ctx) {
    const { data, filters } = ctx;
    const k = data.kpi;
    const out = [];
    const m = marketBenchmark;

    if (m) {
      out.push(info('ขนาดตลาดจริง',
        'ตลาดอาหารพร้อมทานไทยมูลค่า ' + fmtNum(m.rteValueMB) + ' ล้านบาท (ปี 2568) โต ' + fmtPct(m.rteGrowthPct, 0) +
        '/ปี และมีผู้ผลิต SME กว่า ' + fmtNum(m.smeFactories) + ' โรงงาน — เป้าปีที่ 1 ของเรา ' +
        fmtPct((k.revenueY1 / 1e6 / m.rteValueMB) * 100, 3) + ' ของตลาด ถือว่าเล็กมากและไม่ฝืนขนาดตลาด'));
    }
    out.push(...priceRealityCheck(k.avgPricePerBox));

    const utilization = (k.boxesPerDayAvgY1 / k.boxesPerDayCapacity) * 100;
    if (utilization < 55) {
      out.push(warn('กำลังผลิตเหลือมาก',
        'ใช้กำลังผลิตเฉลี่ยเพียง ' + fmtPct(utilization) + ' — ต้นทุนคงที่ ' + fmtBaht(PLAN.fixedCostPerMonth) +
        '/เดือน จ่ายเท่าเดิมไม่ว่าจะผลิตกี่กล่อง ควรหางานองค์กร/แคทเทอริงมาเติมช่วงกลางสัปดาห์'));
    } else {
      out.push(good('ใช้กำลังผลิตเหมาะสม', 'อัตราใช้กำลังผลิต ' + fmtPct(utilization) + ' อยู่ในระดับที่คุ้มค่าใช้จ่ายคงที่'));
    }

    const ebitdaPct = (k.ebitdaY1 / k.revenueY1) * 100;
    if (ebitdaPct < 5) {
      out.push(risk('กำไรปีแรกบางมาก',
        'EBITDA ปีที่ 1 เพียง ' + fmtPct(ebitdaPct) + ' ของยอดขาย — ยอดพลาดเป้า 10% หรือวัตถุดิบขึ้น 10% พลิกเป็นขาดทุนทันที ต้องดูรายงานรายสัปดาห์'));
    }

    const deliveryShare = (data.revenueByChannel.find(c => c.id === 'delivery') || {}).sharePct || 0;
    if (deliveryShare >= 25) {
      out.push(act('ลดการพึ่งพาแอป',
        'ยอดผ่านแอปเดลิเวอรี ' + fmtPct(deliveryShare, 0) + ' ซึ่งเสียค่าธรรมเนียม 25-30% — ทุก 5% ที่ย้ายไป LINE OA ได้ เท่ากับกำไรเพิ่มราว ' +
        fmtBaht(Math.round(k.revenueY1 * 0.05 * 0.25)) + '/ปี'));
    }

    if (filters.channel && filters.channel !== 'all') {
      out.push(info('กำลังดูเฉพาะช่องทาง',
        'ตัวเลขบนหน้านี้ถูกกรองเฉพาะช่องทางที่เลือก จึงต่ำกว่ายอดรวมทั้งธุรกิจ — เอาไว้ใช้เทียบระหว่างช่องทาง ไม่ใช่ดูภาพรวม'));
    }
    return out;
  },

  'market-size'(ctx) {
    const { data } = ctx;
    const out = [];
    const m = marketBenchmark;
    if (m) {
      out.push(info('ตัวเลขตลาดที่ยืนยันได้',
        'อาหารพร้อมทานไทย ' + fmtNum(m.rteValueMB) + ' ล้านบาท (2568) โต ' + fmtPct(m.rteGrowthPct, 0) +
        '/ปี · ปริมาณจำหน่ายโต ' + m.volumeGrowth + '%/ปี (2567-2569) — ต่างจากตัวเลข SAM ในหน้านี้ที่ยังเป็นประมาณการ ควรใช้ตัวเลขที่ยืนยันแล้วเป็นฐานเวลานำเสนอ'));
      out.push(warn('ผู้เล่นเยอะกว่าที่คิด',
        'มีผู้ผลิตอาหารพร้อมทานระดับ SME กว่า ' + fmtNum(m.smeFactories) + ' โรงงานในไทย — การแข่งขันไม่ได้มาจากแบรนด์ใหญ่เท่านั้น แต่มาจากรายเล็กจำนวนมากที่ตัดราคาได้'));
    }
    const peak = Math.max(...data.seasonality.indexPct);
    const peakMonth = data.seasonality.labels[data.seasonality.indexPct.indexOf(peak)];
    const low = Math.min(...data.seasonality.indexPct);
    const lowMonth = data.seasonality.labels[data.seasonality.indexPct.indexOf(low)];
    out.push(act('จังหวะเปิดตัว',
      'เดือน ' + peakMonth + ' ความต้องการสูงสุด (ดัชนี ' + peak + ') และ ' + lowMonth + ' ต่ำสุด (' + low +
      ') — ควรเปิดขายก่อน ' + peakMonth + ' 1-2 เดือน และลดการสั่งวัตถุดิบล่วงหน้าในเดือน ' + lowMonth));
    out.push(warn('ข้อจำกัดของข้อมูล',
      'TAM/SAM/SOM ในหน้านี้ยังเป็นประมาณการของทีม ไม่ได้ซื้อรายงานวิจัย — ก่อนตัดสินใจลงทุนก้อนใหญ่ควรสำรวจลูกค้าจริง 200-300 คนในพื้นที่ที่จะส่ง'));
    return out;
  },

  'market-persona'(ctx) {
    const { data, filters } = ctx;
    const out = [];
    const segs = data.segments;
    const b2c = segs.filter(s => s.id !== 'corporate');
    const bestFreq = b2c.reduce((a, b) => (b.ordersPerMonth > a.ordersPerMonth ? b : a), b2c[0]);
    const corp = segs.find(s => s.id === 'corporate');

    out.push(good('กลุ่มที่คุ้มค่าโฆษณาที่สุด',
      bestFreq.name + ' สั่ง ' + bestFreq.ordersPerMonth + ' ครั้ง/เดือน — ต้นทุนหาลูกค้า (CAC ' + fmtNum(PLAN.maxCac) +
      ' บาท) คืนภายในเดือนแรก ควรทุ่มงบไปกลุ่มนี้ก่อน'));

    if (corp) {
      out.push(act('องค์กรคุ้มกว่าที่ตัวเลขบอก',
        'ยอดต่อครั้งของกลุ่มองค์กร ' + fmtNum(corp.avgOrderValue) + ' บาท = ลูกค้ารายบุคคลราว ' +
        Math.round(corp.avgOrderValue / bestFreq.avgOrderValue) + ' คน และไม่เสียค่าธรรมเนียมช่องทาง — ปิดได้ 1 บริษัทมีค่ามากกว่าโฆษณา 1 เดือน'));
    }

    const m = marketBenchmark;
    if (m) {
      out.push(warn('ราคาที่กลุ่มลูกค้ายอมจ่าย',
        'ราคาตลาดจริงที่สำรวจได้อยู่ที่ ' + m.priceMin + '-' + m.priceMax + ' บาท (กลาง ' + m.median +
        ') — persona ที่ระบุว่ายอมจ่าย 150-250 บาท ต้องยืนยันด้วยการสัมภาษณ์จริง เพราะสูงกว่าที่ตลาดขายกันอยู่'));
    }
    if (filters.customer && filters.customer !== 'all') {
      out.push(info('กำลังดูกลุ่มเดียว', 'ค่าเฉลี่ยที่แสดงคิดจากกลุ่มที่เลือกเท่านั้น'));
    }
    return out;
  },

  'market-competitor'(ctx) {
    const { data } = ctx;
    const out = [];
    const us = data.competitors.find(c => c.id === 'healthbento');
    const rivals = data.competitors.filter(c => c.id !== 'healthbento');
    const avgRival = rivals.reduce((s, c) => s + c.pricePerBox, 0) / rivals.length;

    out.push(...priceRealityCheck(us ? us.pricePerBox : PLAN.avgPrice));
    out.push(info('ตำแหน่งเทียบคู่แข่งในตาราง',
      'ราคาเรา ' + fmtNum(us.pricePerBox) + ' บาท เทียบค่าเฉลี่ยคู่แข่งในตาราง ' + fmtNum(Math.round(avgRival)) +
      ' บาท — แต่ตารางนี้ยังเป็นรายชื่อสมมติ ให้ดูหน้า "สำรวจราคาตลาดจริง" ประกอบเสมอ'));
    out.push(act('จุดต่างที่ต้องสื่อสาร',
      'จากการสำรวจ มีแบรนด์ที่ระบุโภชนาการครบจริงเพียงไม่กี่ราย (เช่น POLPA, Fit2Go ที่บอกโปรตีน 25-40 กรัม) — การพิมพ์แคลอรีและโปรตีนตัวใหญ่บนฝากล่องยังเป็นช่องว่างที่แข่งได้'));
    return out;
  },

  'market-lowcarb'(ctx) {
    const { data, filters, computed } = ctx;
    const out = [];
    const c = computed || {};
    const e = data.economics;
    const items = data.menuLine.items;

    // 1) โปรตีนของเราเทียบเกณฑ์ตลาดที่ยืนยันได้
    if (c.avgProtein) {
      const vsKeto = c.avgProtein - 38;   // ค่าเฉลี่ยมื้อคีโตในตลาด (L3)
      out.push(vsKeto >= 0
        ? good('โปรตีนสูงกว่ามาตรฐานตลาด',
            'โปรตีนเฉลี่ย ' + fmtNum(Math.round(c.avgProtein)) + ' ก./กล่อง สูงกว่าค่าเฉลี่ยมื้อคีโตในตลาด (38 ก.) อยู่ ' +
            fmtNum(Math.round(vsKeto)) + ' ก. และสูงกว่าเพดานที่ Fit2Go ระบุ (40 ก.) — ใช้เป็นข้อความโฆษณาได้ตรง ๆ')
        : warn('โปรตีนยังไม่ถึงมาตรฐานตลาด',
            'โปรตีนเฉลี่ย ' + fmtNum(Math.round(c.avgProtein)) + ' ก. ต่ำกว่าค่าเฉลี่ยมื้อคีโตในตลาด 38 ก. — กลุ่มนี้เทียบตัวเลขบนฉลากก่อนตัดสินใจซื้อ'));
    }

    // 2) เกณฑ์คีโต
    if (c.ketoCount !== undefined) {
      if (c.ketoCount < 3) {
        out.push(warn('เมนูคีโตยังน้อยเกินไป',
          'ผ่านเกณฑ์คีโต (net carb ≤ 15 ก.) เพียง ' + c.ketoCount + ' จาก ' + c.itemCount +
          ' เมนู — สายคีโตสั่ง 26 มื้อ/เดือน ถ้าเมนูวนซ้ำไม่ถึง 5 แบบจะเลิกซื้อภายในเดือนที่ 2 ควรเพิ่มเป็น 5-6 เมนู'));
      } else {
        out.push(good('เมนูคีโตพอสำหรับหมุนเวียน', c.ketoCount + ' เมนูผ่านเกณฑ์ net carb ≤ 15 ก. — พอทำตารางไม่ซ้ำ 1 สัปดาห์'));
      }
    }

    // 3) เศรษฐศาสตร์ของสายโปรตีน
    if (c.avgContribution !== undefined) {
      const better = c.avgContribution - e.baseLineContribution;
      out.push(better >= 0
        ? good('สายโปรตีนกำไรดีกว่าเมนูปกติ',
            'กำไรส่วนเกิน ' + fmtNum(Math.round(c.avgContribution)) + ' บาท/กล่อง สูงกว่าเมนูปกติ (' +
            e.baseLineContribution + ' บาท) อยู่ ' + fmtNum(Math.round(better)) +
            ' บาท ทั้งที่ต้นทุนวัตถุดิบแพงกว่า — เพราะราคาขายสูงกว่าชดเชยได้ ควรดันสัดส่วนสายนี้ให้เกิน 35% ของยอด')
        : warn('สายโปรตีนกำไรต่ำกว่าเมนูปกติ',
            'กำไรส่วนเกิน ' + fmtNum(Math.round(c.avgContribution)) + ' บาท/กล่อง ต่ำกว่าเมนูปกติ — ต้องขึ้นราคาหรือลดต้นทุนโปรตีน'));
    }

    // 4) ความเสี่ยงเรื่องเพดานราคาตลาด
    if (c.atCeiling !== undefined) {
      const loss = c.avgContribution - c.atCeiling;
      out.push(risk('เพดานราคาตลาดคือความเสี่ยงหลัก',
        'ถ้าลูกค้าเทียบกับ Fit2Go (99-149 บาท ที่โปรตีน 25-40 ก.) แล้วเราต้องลงมาที่ ' + e.marketPriceCeiling +
        ' บาท กำไรส่วนเกินจะเหลือ ' + fmtNum(Math.round(c.atCeiling)) + ' บาท/กล่อง (หายไป ' +
        fmtNum(Math.round(loss)) + ' บาท) — ต้องลดต้นทุนวัตถุดิบลงราว ' + fmtNum(Math.round(loss)) +
        ' บาท/กล่องจึงจะรักษากำไรเท่าเดิม'));
    }

    // 5) ช่องว่างที่ยังไม่มีใครทำ
    out.push(act('จุดต่างที่ชนะได้ทันที',
      'จากที่สำรวจ ไม่มีแบรนด์เดลิเวอรีไทยรายใดระบุ net carb บนกล่อง (Fit2Go ระบุแค่โปรตีน) — พิมพ์ 3 ค่า โปรตีน/คาร์บ/ใยอาหาร ให้ครบ แล้วชูคำว่า net carb เป็นจุดขายหลักของสายนี้'));

    // 6) เทรนด์ปี 2026
    out.push(info('เทรนด์ปี 2026 ไม่ใช่โปรตีนเดี่ยว',
      'ข้อมูลเทรนด์อาหาร 2026 ระบุว่าผู้บริโภคมองหา โปรตีน + ไฟเบอร์ + รสชาติ + ความสะดวก พร้อมกัน — เมนูควรมีใยอาหารอย่างน้อย 4-5 กรัม ' +
      'ปัจจุบันมี ' + items.filter(i => (i.fiber || 0) >= 4).length + ' จาก ' + items.length + ' เมนูที่ถึงเกณฑ์นี้'));

    // 7) กลุ่มย่อยที่คุ้มที่สุด
    const seg = data.segments.reduce((a, b) => (b.mealsPerMonth > a.mealsPerMonth ? b : a), data.segments[0]);
    out.push(act('กลุ่มย่อยที่ควรจับก่อน',
      seg.name + ' สั่งถี่สุด ' + seg.mealsPerMonth + ' มื้อ/เดือน (สูงกว่าค่าเฉลี่ยธุรกิจ 12 มื้อ) และยอมจ่าย ' +
      seg.willingnessToPay + ' — เข้าถึงผ่าน ' + seg.channel + ' และต้องระบุกรัมโปรตีนให้ชัด เพราะกลุ่มนี้ไม่ซื้อถ้าไม่มีตัวเลข'));

    // 8) ข้อกำหนดฉลาก
    out.push(risk('ฉลากมีข้อกำหนดกำกับ',
      'คำว่า "โปรตีนสูง" และ "คาร์บต่ำ" เป็นการกล่าวอ้างทางโภชนาการตามประกาศ อย. — ต้องมีผลวิเคราะห์จากห้องแล็บและตรวจเกณฑ์ %Thai RDI ฉบับล่าสุดก่อนพิมพ์ฉลาก ห้ามใช้ค่าจากการคำนวณสูตรเพียงอย่างเดียว'));

    if (filters.diet && filters.diet !== 'all') {
      out.push(info('กำลังกรองตามเกณฑ์',
        'ตัวเลขเฉลี่ยด้านบนคิดจากเมนูที่ผ่านเกณฑ์ที่เลือกเท่านั้น — เอาไว้ตรวจว่าสายเมนูนั้นยังทำกำไรได้หรือไม่'));
    }
    if (filters.scenario === 'worst') {
      out.push(risk('กรณีแย่',
        'ถ้าราคาวัตถุดิบโปรตีน (อกไก่ แซลมอน เนื้อวัว) ขึ้น 10% ต้นทุนสายนี้จะเพิ่มราว 8 บาท/กล่อง ซึ่งกินกำไรเร็วกว่าเมนูปกติ เพราะสัดส่วนเนื้อสัตว์สูงกว่า'));
    }
    return out;
  },

  'market-survey'(ctx) {
    const { data } = ctx;
    const out = [];
    const brands = data.priceSurvey.brands;
    const cheap = brands.filter(b => b.priceMin <= 80).length;
    const pkg = data.priceSurvey.packageBenchmark;

    out.push(risk('เพดานราคาของตลาดจริง',
      fmtNum(cheap) + ' จาก ' + brands.length + ' แบรนด์ ตั้งราคาเริ่มต้นไม่เกิน 80 บาท — แผนของเราที่ ' +
      fmtNum(data.planVsMarket.planAvgPrice) + ' บาท จึงอยู่คนละชั้นราคา ต้องเลือกว่าจะแข่งที่คุณภาพหรือปรับราคา'));
    out.push(risk('แพ็กเกจถูกสุดต่ำกว่าต้นทุนเรา',
      'พบแพ็กเกจ ' + pkg.example + ' = ' + fmtNum(pkg.pricePerBox) + ' บาท/กล่อง ซึ่งต่ำกว่าต้นทุนผลิตของเรา (' +
      fmtNum(PLAN.variableCostPerBox) + ' บาท) — ห้ามลงไปแข่งราคาระดับนี้เด็ดขาด'));
    out.push(act('ราคาที่แนะนำหลังเห็นตลาดจริง',
      'ตั้งเมนูหลัก 119-149 บาท (ชนกับ POLPA/Fit2Go ที่เป็นกลุ่มระบุโภชนาการ) และเก็บ 179-249 บาทไว้เฉพาะเมนูแซลมอน/เนื้อวัว — จะได้ทั้งปริมาณและกำไร'));
    out.push(info('สิ่งที่ยังต้องสำรวจเอง',
      'ราคาที่เห็นนี้เป็นราคาเดลิเวอรี ยังไม่ใช่ราคาบนชั้นห้าง และยังไม่มีข้อมูลยอดขายต่อสาขา — ใช้แบบฟอร์มสำรวจหน้าชั้นในหน้านี้เก็บข้อมูลจริงเพิ่ม'));
    return out;
  },

  'prod-menu'(ctx) {
    const { data, filters } = ctx;
    const out = [];
    const items = data.menu;
    const highSodium = items.filter(i => i.sodium > 700);
    const expensive = items.filter(i => i.foodCost >= 90);
    const cheapCost = items.filter(i => i.foodCost <= 50);

    if (highSodium.length) {
      out.push(warn('โซเดียมเกินเกณฑ์ ' + highSodium.length + ' เมนู',
        highSodium.map(i => i.code).join(', ') + ' มีโซเดียมเกิน 700 มก. — ขัดกับจุดขาย "อาหารสุขภาพ" ต้องลดเครื่องปรุงหรือถอดออกจากชุดเปิดตัว'));
    }
    if (expensive.length) {
      out.push(risk('เมนูต้นทุนสูง ' + expensive.length + ' รายการ',
        expensive.map(i => i.name.slice(0, 18)).join(' · ') + ' ต้นทุนวัตถุดิบเกิน 90 บาท/กล่อง — ห้ามนำไปทำโปรลดราคา และควรจำกัดเป็นเมนูสั่งพิเศษ'));
    }
    if (cheapCost.length) {
      out.push(good('เมนูช่วยดึงต้นทุนเฉลี่ยลง',
        'มี ' + cheapCost.length + ' เมนูที่ต้นทุนวัตถุดิบไม่เกิน 50 บาท (กลุ่มมังสวิรัติ/คลีนไทย) — จัดเป็นเมนูประจำวันเพื่อถ่วงค่าเฉลี่ยต้นทุนทั้งสัปดาห์'));
    }
    const m = marketBenchmark;
    if (m) {
      const under = items.filter(i => i.price <= m.median).length;
      out.push(act('เทียบกับราคาตลาดจริง',
        'มีเพียง ' + under + ' จาก ' + items.length + ' เมนูที่ราคาไม่เกินราคากลางตลาด (' + m.median +
        ' บาท) — ควรออกแบบเมนู 3-4 รายการในช่วง 119-139 บาท เป็น "ประตูเข้า" ให้ลูกค้าใหม่ลองก่อน'));
    }
    if (filters.menu && filters.menu !== 'all') {
      out.push(info('กรองเฉพาะหมวด', 'ค่าเฉลี่ยโภชนาการที่แสดงคิดจากหมวดที่เลือกเท่านั้น'));
    }
    return out;
  },

  'prod-price'(ctx) {
    const { data, filters } = ctx;
    const out = [];
    const variableCost = data.unitEconomics.items.reduce((s, i) => s + i.value, 0);
    const risky = data.packages.filter(p => p.pricePerBox - variableCost < 35);

    out.push(...priceRealityCheck(data.unitEconomics.avgPrice));
    if (risky.length) {
      out.push(risk('แพ็กเกจที่กำไรบางเกิน',
        risky.map(p => p.name).join(' · ') + ' เหลือกำไรส่วนเกินต่ำกว่า 35 บาท/กล่อง — ถ้าของเสียเกิน 10% จะกลายเป็นขาดทุน'));
    } else {
      out.push(good('ส่วนลดยังอยู่ในกรอบ', 'ทุกแพ็กเกจยังเหลือกำไรส่วนเกินเกิน 35 บาท/กล่อง'));
    }
    if (filters.channel === 'delivery') {
      out.push(risk('ราคาในแอปต้องบวกเพิ่ม',
        'ค่าธรรมเนียมแอป 28% ทำให้ต้องตั้งราคาสูงกว่าราคาฐานราว 39% — ซึ่งจะทำให้ราคาบนแอปห่างจากราคากลางตลาดมากขึ้นอีก ควรใช้เมนูราคาต่ำเป็นตัวเปิดในแอปเท่านั้น'));
    }
    out.push(act('กลยุทธ์ราคาที่แนะนำ',
      'ใช้ 3 ชั้นราคา: ตัวเปิด 119-139 (สู้ตลาด) · ตัวหลัก 149-179 (กำไรดี) · พรีเมียม 199-249 (แซลมอน/เนื้อวัว) แล้ววัดสัดส่วนขายจริงทุกเดือน'));
    return out;
  },

  'prod-cost'(ctx) {
    const { data, filters } = ctx;
    const out = [];
    const ue = data.unitEconomics;
    const cm = data.costByMenuType;
    const worstIdx = cm.grossMarginPct.indexOf(Math.min(...cm.grossMarginPct));
    const bestIdx = cm.grossMarginPct.indexOf(Math.max(...cm.grossMarginPct));

    out.push(info('ตัวเลขที่ต้องจำ',
      'กำไรส่วนเกินฐาน ' + fmtNum(ue.contributionPerBox) + ' บาท/กล่อง ÷ ค่าใช้จ่ายคงที่ ' + fmtBaht(PLAN.fixedCostPerMonth) +
      '/เดือน = ต้องขาย ' + fmtNum(PLAN.breakEvenBoxesPerDay) + ' กล่อง/วันจึงคุ้มทุน'));
    out.push(good('หมวดกำไรดีสุด',
      cm.labels[bestIdx] + ' กำไรขั้นต้น ' + fmtPct(cm.grossMarginPct[bestIdx]) + ' — ดันเป็นเมนูประจำเพื่อถ่วงค่าเฉลี่ย'));
    out.push(warn('หมวดกำไรน้อยสุด',
      cm.labels[worstIdx] + ' กำไรขั้นต้นเพียง ' + fmtPct(cm.grossMarginPct[worstIdx]) + ' — ถ้าจะขายต้องขายพร้อมเมนูอื่นในแพ็กเกจ ไม่ขายเดี่ยว'));
    if (filters.channel === 'delivery') {
      out.push(risk('ช่องทางกินกำไรเกือบหมด',
        'ที่ค่าธรรมเนียม 28% กำไรส่วนเกินหายไปราว 35-40 บาท/กล่อง เทียบกับขายผ่าน LINE OA'));
    }
    if (filters.scenario === 'worst') {
      out.push(risk('สถานการณ์วัตถุดิบแพง',
        'ต้นทุนวัตถุดิบ +10% ดันจุดคุ้มทุนจาก ' + PLAN.breakEvenBoxesPerDay + ' เป็นราว 408 กล่อง/วัน — ต้องมีสัญญาล็อกราคาไก่/ผัก/ข้าวรายไตรมาส'));
    }
    return out;
  },

  'ops-capacity'(ctx) {
    const { data, filters } = ctx;
    const out = [];
    const bottleneck = data.stations.reduce((a, b) => (b.capacityBoxes < a.capacityBoxes ? b : a), data.stations[0]);
    const peak = Math.max(...data.capacityRamp.actual);

    out.push(warn('คอขวดของสายผลิต',
      bottleneck.name + ' รับได้ ' + fmtNum(bottleneck.capacityBoxes) + ' กล่อง/วัน เป็นตัวกำหนดกำลังผลิตรวม — ลงทุนเพิ่มที่จุดอื่นก่อนแก้จุดนี้จะไม่ช่วยอะไร'));
    out.push(info('จุดตัดสินใจขยาย',
      'ยอดผลิตปลายปีที่ 1 ราว ' + fmtNum(peak) + ' กล่อง/วัน = ' + fmtPct((peak / PLAN.capacityPerDay) * 100) +
      ' ของกำลังผลิต — เริ่มหาพื้นที่ครัวที่ 2 ล่วงหน้า 6 เดือนก่อนแตะ 90%'));
    out.push(act('ลดของเสียคือกำไรที่ได้ฟรี',
      'ทำสูตรมาตรฐานและชั่งพอร์ชันล่วงหน้า ลดของเสียจาก 5% เหลือ 3% ประหยัดราว ' +
      fmtBaht(Math.round(0.02 * 12000 * PLAN.variableCostPerBox)) + '/เดือน ที่ยอดผลิต 12,000 กล่อง/เดือน'));
    if (filters.year && filters.year !== '2569') {
      out.push(risk('ปีหลังต้องขยายกำลังผลิต',
        'ยอดตามแผนปีที่เลือกเกินกำลังผลิตของครัวเดียว — ต้องเปิดกะ 3 หรือครัวที่ 2 พร้อมค่าใช้จ่ายคงที่ที่เพิ่มขึ้น'));
    }
    return out;
  },

  'ops-supply'(ctx) {
    const { data, filters } = ctx;
    const out = [];
    const high = data.suppliers.filter(s => s.riskLevel === 'high');
    const cash = data.suppliers.filter(s => !s.paymentTerm.includes('เครดิต'));
    const topShare = data.suppliers.reduce((a, b) => (b.sharePct > a.sharePct ? b : a), data.suppliers[0]);

    if (high.length) {
      out.push(risk('ซัพพลายเออร์ความเสี่ยงสูง',
        high.map(s => s.items).join(' · ') + ' ใช้ราคาตลาดรายวัน — ควรจำกัดเมนูที่ใช้วัตถุดิบกลุ่มนี้ไม่เกิน 3 รายการ และปรับราคาขายได้ทุกเดือน'));
    }
    if (cash.length) {
      out.push(warn('จ่ายเงินสด ' + cash.length + ' ราย',
        'กลุ่มนี้ไม่ให้เครดิต ทำให้ต้องมีเงินสดหมุนเวียนมากขึ้น — ลองเจรจาเครดิต 7 วันแลกกับปริมาณสั่งที่แน่นอน'));
    }
    out.push(act('กระจายความเสี่ยง',
      topShare.items + ' คิดเป็น ' + fmtPct(topShare.sharePct, 0) + ' ของมูลค่าจัดซื้อ — ควรมีผู้ขายสำรองอย่างน้อย 2 รายในหมวดนี้ก่อนเปิดขาย'));
    if (filters.scenario === 'worst') {
      out.push(risk('ผลกระทบเมื่อราคาขึ้น 10%',
        'กำไรส่วนเกินลดจาก ' + PLAN.contributionPerBox + ' เหลือราว 49 บาท/กล่อง ทำให้ต้องขายเพิ่มราว 44 กล่อง/วันเพื่อคุ้มทุนเท่าเดิม'));
    }
    return out;
  },

  'ops-delivery'(ctx) {
    const { data, filters } = ctx;
    const out = [];
    const zones = data.deliveryZones;
    const late = zones.filter(z => z.onTimePct < PLAN.targetOnTimePct);
    const expensive = zones.filter(z => z.avgCostPerBox > 24);
    const cheapest = zones.reduce((a, b) => (b.avgCostPerBox < a.avgCostPerBox ? b : a), zones[0]);

    if (late.length) {
      out.push(warn('โซนที่ยังไม่ถึงเป้าส่งตรงเวลา',
        late.map(z => z.zone + ' (' + z.onTimePct + '%)').join(' · ') + ' — ต่ำกว่าเป้า ' + PLAN.targetOnTimePct +
        '% ควรจำกัดจำนวนออเดอร์/วันในโซนนี้จนกว่าจะหาพาร์ตเนอร์ที่นิ่งกว่าได้'));
    }
    if (expensive.length) {
      out.push(risk('โซนที่ค่าส่งกินกำไร',
        expensive.map(z => z.zone + ' ' + z.avgCostPerBox + ' บาท/กล่อง').join(' · ') +
        ' — คิดเป็นเกือบครึ่งของกำไรส่วนเกิน ควรตั้งยอดสั่งขั้นต่ำหรือคิดค่าส่งเพิ่มในโซนนี้'));
    }
    out.push(good('โซนที่ควรโฟกัส',
      cheapest.zone + ' ค่าส่งเพียง ' + cheapest.avgCostPerBox + ' บาท/กล่อง — ทุกกล่องที่ขายในโซนนี้กำไรดีกว่าโซนอื่นราว ' +
      fmtNum(Math.max(...zones.map(z => z.avgCostPerBox)) - cheapest.avgCostPerBox) + ' บาท'));
    out.push(act('รวมจุดส่ง',
      'ออเดอร์องค์กร 50 กล่องส่งจุดเดียวทำให้ค่าส่งต่อกล่องต่ำกว่า 5 บาท — เป็นเหตุผลที่ยอมให้ส่วนลดองค์กรได้ถึง 22%'));
    if (filters.region && filters.region !== 'all') {
      out.push(info('ดูเฉพาะโซน', 'ค่าเฉลี่ยที่แสดงคิดจากโซนที่เลือกเท่านั้น'));
    }
    return out;
  },

  'mkt-channel'(ctx) {
    const { data, filters } = ctx;
    const out = [];
    const line = data.channels.find(c => c.id === 'line');
    const delivery = data.channels.find(c => c.id === 'delivery');
    const corp = data.channels.find(c => c.id === 'corporate');
    const store = data.channels.find(c => c.id === 'store');

    out.push(good('ช่องทางที่กำไรดีที่สุด',
      line.name + ' ค่าธรรมเนียมเพียง ' + fmtPct(line.feePct, 0) + ' และสั่งซ้ำ ' + fmtPct(line.repeatRatePct, 0) +
      ' — ทุกกล่องที่ย้ายมาช่องทางนี้ได้กำไรเพิ่มราว ' + fmtNum(Math.round(165 * (delivery.feePct - line.feePct) / 100)) + ' บาท'));
    out.push(risk('ช่องทางที่ต้องคุมสัดส่วน',
      delivery.name + ' ค่าธรรมเนียม ' + fmtPct(delivery.feePct, 0) + ' และสั่งซ้ำเพียง ' + fmtPct(delivery.repeatRatePct, 0) +
      ' — ใช้เป็นช่องทางหาลูกค้าใหม่ได้ แต่ไม่ควรเกิน 30% ของยอดขาย'));
    out.push(act('ช่องทางที่ควรลงแรงเพิ่ม',
      corp.name + ' ไม่มีค่าธรรมเนียม สั่งซ้ำ ' + fmtPct(corp.repeatRatePct, 0) + ' และยอดต่อครั้ง ' + fmtNum(corp.aov) +
      ' บาท — จ้างเซลล์ 1 คนเพื่อปิดองค์กรคุ้มกว่าซื้อโฆษณาเพิ่ม'));
    if (store) {
      out.push(warn('ทดลองก่อนขยาย',
        store.name + ' มี CAC ต่ำสุด (' + fmtNum(store.cac) + ' บาท) แต่สั่งซ้ำเพียง ' + fmtPct(store.repeatRatePct, 0) +
        ' — ทดลอง 5 จุดและวัดยอดต่อตู้ต่อวันก่อนลงทุนเพิ่ม'));
    }
    if (filters.channel && filters.channel !== 'all') {
      out.push(info('ดูช่องทางเดียว', 'ยอดที่แสดงเป็นของช่องทางที่เลือกเท่านั้น ไม่ใช่ยอดรวม'));
    }
    return out;
  },

  'mkt-campaign'(ctx) {
    const { data, filters } = ctx;
    const out = [];
    const ce = data.customerEconomics;
    const best = data.campaigns.reduce((a, b) => (b.expectedRoas > a.expectedRoas ? b : a), data.campaigns[0]);
    const weak = data.campaigns.filter(c => c.expectedRoas < 2);
    const highChurn = data.subscriptions.filter(s => s.churnPctPerMonth >= 20);

    out.push(good('LTV/CAC อยู่ในเกณฑ์ดี',
      'LTV ' + fmtNum(ce.ltv) + ' บาท ต่อ CAC ' + fmtNum(ce.blendedCac) + ' บาท = ' + ce.ltvToCac +
      ' เท่า (เกณฑ์ที่ยอมรับได้คือเกิน ' + PLAN.minLtvToCac + ' เท่า) — ยังลงงบโฆษณาเพิ่มได้'));
    out.push(act('แคมเปญที่ควรทำก่อน',
      best.name + ' ROAS ' + best.expectedRoas + ' เท่า — เปิดใช้ทันทีที่มีลูกค้าชุดแรกเพราะใช้ลูกค้าเดิมหาลูกค้าใหม่'));
    if (weak.length) {
      out.push(warn('แคมเปญที่ต้องเฝ้าดู',
        weak.map(c => c.name.slice(0, 24) + ' (' + c.expectedRoas + 'x)').join(' · ') +
        ' — ROAS ต่ำกว่า 2 เท่า ให้ตัดงบทันทีถ้าวัดผล 4 สัปดาห์แล้วไม่ดีขึ้น'));
    }
    if (highChurn.length) {
      out.push(risk('แพ็กเกจที่ลูกค้าเลิกเร็ว',
        highChurn.map(s => s.name + ' ' + s.churnPctPerMonth + '%/เดือน').join(' · ') +
        ' — อยู่ได้เฉลี่ยไม่ถึง 5 เดือน ต้องมีการติดตามผลรายสัปดาห์ ไม่ใช่ส่งอาหารแล้วจบ'));
    }
    const m = marketBenchmark;
    if (m) {
      out.push(info('สิ่งที่ต้องพูดในโฆษณา',
        'ตลาดมีแบรนด์ราคา ' + m.priceMin + '-80 บาทจำนวนมาก — โฆษณาต้องอธิบายให้ได้ใน 3 วินาทีว่าทำไมกล่องเราแพงกว่า (ระบุสารอาหาร ครัว GMP นักโภชนาการ)'));
    }
    if (filters.scenario === 'worst') {
      out.push(risk('กรณีแย่', 'ลูกค้าใหม่ต่ำกว่าแผน 28% ทำให้ CAC จริงสูงขึ้นและคืนทุนช้าลง — เตรียมลดงบช่องทางที่ ROAS ต่ำสุดก่อน'));
    }
    return out;
  },

  'retail-chains'(ctx) {
    const { data, filters } = ctx;
    const out = [];
    const chains = data.chains;
    const best = chains.reduce((a, b) => (b.customer.healthIndex > a.customer.healthIndex ? b : a), chains[0]);
    const cvs = chains.filter(c => c.format === 'cvs');
    const unverified = chains.filter(c => !c.branchesVerified);

    out.push(good('ห้างที่ตรงกลุ่มที่สุด',
      best.name + ' (ดัชนีสุขภาพ ' + best.customer.healthIndex + ' · ' + fmtNum(best.branches) + ' สาขา · ตะกร้า ' +
      fmtNum(best.customer.basketSize) + ' บาท) — เริ่มที่นี่ก่อนเพราะลูกค้าพร้อมจ่ายและไม่ต้องแข่งราคา'));
    if (cvs.length) {
      out.push(risk('ร้านสะดวกซื้อยังเข้าไม่ได้',
        cvs.map(c => c.name).join(' · ') + ' รวมกันกว่า ' + fmtNum(cvs.reduce((s, c) => s + c.branches, 0)) +
        ' สาขา แต่เกณฑ์รับสินค้าใหม่ของ 7-Eleven คือราคาต่ำกว่า 45 บาท — ต่างจากกล่องเรากว่า 3 เท่า'));
    }
    out.push(act('ปูสาขาเท่าที่คุมได้',
      'รวมสาขาที่ควรเริ่มทั้งหมด ' + fmtNum(chains.reduce((s, c) => s + c.startBranches, 0)) +
      ' สาขา คิดเป็นเพียง ' + fmtPct((chains.reduce((s, c) => s + c.startBranches, 0) / chains.reduce((s, c) => s + c.branches, 0)) * 100, 1) +
      ' ของสาขาทั้งประเทศ — เริ่มน้อยแต่เติมของไม่ขาดชั้นสำคัญกว่าปูกว้างแล้วของหมด'));
    if (unverified.length) {
      out.push(info('ตัวเลขที่ยังไม่ยืนยัน',
        unverified.map(c => c.name).join(', ') + ' — จำนวนสาขายังเป็นประมาณการ ควรเช็กกับเว็บไซต์บริษัทก่อนใช้ในเอกสารนำเสนอ'));
    }
    if (data.chainFinancials) {
      const rows = data.chainFinancials.rows;
      const big = rows.reduce((x, y) => (y.revenuePerStorePerDay > x.revenuePerStorePerDay ? y : x), rows[0]);
      const small = rows.reduce((x, y) => (y.revenuePerStorePerDay < x.revenuePerStorePerDay ? y : x), rows[0]);
      out.push(info('ขนาดร้านจริงจากงบการเงิน',
        'ยอดขายต่อสาขาต่อวัน: ' + rows.map(r => (data.chains.find(c => c.id === r.chainId) || {}).name + ' ' + fmtNum(r.revenuePerStorePerDay) + ' บาท').join(' · ') +
        ' — คำนวณจากรายได้ปี 2567 ÷ จำนวนสาขา ÷ 365 (ตรวจย้อนกลับได้)'));
      out.push(act('เลือกฟอร์แมตให้ถูก',
        big.chainId + ' ขายได้ ' + Math.round(big.revenuePerStorePerDay / small.revenuePerStorePerDay) +
        ' เท่าของ ' + small.chainId + ' ต่อสาขาต่อวัน — สาขาใหญ่ขายได้มากกว่าจริง แต่ก็เข้ายากกว่าและกดราคาหนักกว่า ให้เทียบพร้อมกำไรต่อกล่องเสมอ'));
    }
    if (data.healthIndexChecklist) {
      out.push(warn('ดัชนีสุขภาพยังไม่ใช่ข้อมูลจริง',
        'ไม่มีหน่วยงานใดเผยแพร่ดัชนีนี้รายห้าง — ตอนนี้เป็นค่าประมาณของทีม มีเช็กลิสต์ ' + data.healthIndexChecklist.items.length +
        ' ข้อท้ายหน้าให้เดินเก็บจริง (นับชั้นออร์แกนิก · นับ SKU สุขภาพ · ป้ายโซนคลีน ฯลฯ) แล้วคะแนนจะมีหลักฐานรองรับ'));
    }
    if (filters.chain && filters.chain !== 'all') {
      out.push(info('ดูห้างเดียว', 'ค่าเฉลี่ยและยอดรวมคิดจากห้างที่เลือกเท่านั้น'));
    }
    return out;
  },

  'retail-terms'(ctx) {
    const { data } = ctx;
    const out = [];
    const eco = data.chains.map(c => ({ c, e: chainEconomics(c, data.ourCost) }));
    const loss = eco.filter(x => x.e.contribution <= 0);
    const thin = eco.filter(x => x.e.contribution > 0 && x.e.contribution < 15);
    const best = eco.reduce((a, b) => (b.e.contribution > a.e.contribution ? b : a), eco[0]);

    out.push(info('ห้างไม่ใช่ช่องทางกำไรสูง',
      'กำไรส่วนเกินผ่านห้างสูงสุดอยู่ที่ ' + fmtNum(best.e.contribution) + ' บาท/กล่อง (' + best.c.name +
      ') เทียบกับ ' + PLAN.contributionPerBox + ' บาท เมื่อขายตรงถึงผู้บริโภค — ห้างมีค่าเรื่องการมองเห็นแบรนด์มากกว่ากำไร'));
    if (loss.length) {
      out.push(risk('ห้างที่ขาดทุนตั้งแต่ตัวเลข',
        loss.map(x => x.c.name).join(' · ') + ' — GP บวกของเสียสูงกว่าส่วนต่างราคา ยิ่งขายยิ่งขาดทุน ไม่ควรเข้าแม้ห้างจะชวน'));
    }
    if (thin.length) {
      out.push(warn('ห้างที่กำไรบาง',
        thin.map(x => x.c.name + ' ' + x.e.contribution + ' บาท').join(' · ') +
        ' — ต้องต่อรองลด GP หรือขอทำโปรร่วมกับห้างเพื่อเพิ่มยอด ก่อนจะคุ้มค่าแรกเข้า'));
    }
    out.push(act('ลำดับการเจรจา',
      'ขอทดลองวางขาย (trial) 4-8 สัปดาห์ในไม่กี่สาขาโดยขอยกเว้นค่าแรกเข้าก่อน แล้วใช้ยอดขายจริงเป็นอำนาจต่อรองรอบถัดไป'));
    out.push(info('ข้อมูลอ้างอิงเรื่อง GP',
      'แหล่งอ้างอิงระบุว่า GP ของห้างสรรพสินค้า/ไฮเปอร์อยู่ราว 35-40% และมาร์จิ้นค้าปลีกทั้งตลาด 20-50% — ตัวเลข GP ในตารางนี้ (12-35%) จึงอยู่ในกรอบที่เป็นไปได้ แต่ยังต้องยืนยันรายห้าง'));
    return out;
  },

  'retail-shelf'(ctx) {
    const { data } = ctx;
    const out = [];
    const cheap = data.shelfCompetitors.filter(x => x.avgPrice < 100);
    const premium = data.shelfCompetitors.filter(x => x.avgPrice >= 180);
    const noRte = data.chains.filter(c => !c.shelf.hasChilledRte);

    out.push(risk('คู่แข่งราคาถูกบนชั้นเดียวกัน',
      cheap.map(x => x.brand + ' ' + x.avgPrice + ' บาท').join(' · ') +
      ' — ลูกค้าที่เดินผ่านชั้นจะเห็นราคานี้ก่อน กล่องเราจึงต้องสื่อสารเหตุผลของราคาให้เห็นจากระยะ 1 เมตร'));
    if (premium.length) {
      out.push(info('มีที่ว่างในกลุ่มพรีเมียม',
        premium.map(x => x.brand).join(' · ') + ' อยู่ที่ 180 บาทขึ้นไป — แสดงว่าชั้นวางรับราคาสูงได้ ถ้าสินค้าดูต่างจริง'));
    }
    if (noRte.length) {
      out.push(warn('ห้างที่วางขายไม่ได้',
        noRte.map(c => c.name).join(', ') + ' ยังไม่มีชั้นอาหารพร้อมทานแช่เย็น — ต้องลงทุนตู้แช่เองหรือข้ามไปก่อน'));
    }
    out.push(act('สิ่งที่ต้องเตรียมก่อนขึ้นชั้น',
      'พิมพ์แคลอรีและกรัมโปรตีนตัวใหญ่บนฝากล่อง + ขอตำแหน่งระดับสายตา ถ้าห้างให้แค่ 1 ช่อง ให้ต่อรองตำแหน่งแทนจำนวนช่อง'));
    return out;
  },

  'retail-potential'(ctx) {
    const { data, filters, scenarioFactor = 1 } = ctx;
    const out = [];
    const rows = data.chains.map(c => ({ c, p: chainPotential(c, data.ourCost, { scenarioFactor }) }));
    const totalBoxes = rows.reduce((s, r) => s + r.p.boxesPerDay, 0);
    const positive = rows.filter(r => r.p.contribution > 8 && r.p.paybackMonths !== null && r.p.paybackMonths <= 6);
    const negative = rows.filter(r => r.p.contribution <= 0);
    const capacityPct = (totalBoxes / PLAN.capacityPerDay) * 100;

    if (capacityPct > 100) {
      out.push(risk('เข้าทุกห้างพร้อมกันผลิตไม่ทัน',
        'รวมทุกห้างที่เลือกต้องผลิต ' + fmtNum(totalBoxes) + ' กล่อง/วัน = ' + fmtPct(capacityPct, 0) +
        ' ของกำลังผลิต — ถ้าของขาดชั้นห้างจะลดคะแนนผู้ขายและตัดพื้นที่ ต้องเลือกเข้าเป็นเฟส'));
    }
    if (positive.length) {
      out.push(good('เฟสแรกที่คุ้มที่สุด',
        positive.map(r => r.c.name + ' (' + r.c.startBranches + ' สาขา)').join(' · ') + ' รวม ' +
        fmtNum(positive.reduce((s, r) => s + r.p.boxesPerDay, 0)) + ' กล่อง/วัน คืนค่าแรกเข้าภายใน 6 เดือน'));
    }
    if (negative.length) {
      out.push(risk('ห้างที่ยิ่งขายยิ่งขาดทุน',
        negative.map(r => r.c.name + ' (' + r.p.contribution + ' บาท/กล่อง)').join(' · ') +
        ' — ตัดออกจากแผนก่อน แล้วกลับมาพิจารณาเมื่อต้นทุนผลิตต่ำกว่า 70 บาท/กล่อง'));
    }
    out.push(act('เกณฑ์ก่อนเริ่มเข้าห้าง',
      'ควรมียอดขายตรงถึงผู้บริโภคแตะ ' + fmtNum(PLAN.breakEvenBoxesPerDay) +
      ' กล่อง/วันก่อน เพื่อให้ครัวนิ่งและมีกำลังผลิตเหลือรองรับการเติมของทุกวัน'));
    if (filters.scenario === 'best') {
      out.push(info('กรณีดี', 'ถ้ายอดต่อสาขาสูงกว่าแผน 28% ห้างที่เคยกำไรบางจะกลับมาคุ้ม — แต่ต้องมีกำลังผลิตรองรับก่อน'));
    }
    return out;
  },

  'fin-invest'(ctx) {
    const { data } = ctx;
    const out = [];
    const inv = data.investment;
    const capex = inv.items.filter(i => i.type === 'capex').reduce((s, i) => s + i.amount, 0);
    const working = inv.items.filter(i => i.type === 'working').reduce((s, i) => s + i.amount, 0);
    const loan = inv.funding.find(x => x.source.includes('เงินกู้'));

    out.push(info('โครงสร้างเงินลงทุน',
      'สินทรัพย์ถาวร ' + fmtBaht(capex) + ' (' + fmtPct((capex / inv.total) * 100, 0) + ') และเงินทุนหมุนเวียน ' +
      fmtBaht(working) + ' — สัดส่วนเงินหมุนเวียนสำคัญมากเพราะปีแรกขาดทุนสะสมช่วงเดือนที่ 1-5'));
    out.push(act('ประหยัดได้ทันที',
      'อุปกรณ์ครัวมือสองสภาพดีถูกกว่าของใหม่ 35-45% และเช่ารถห้องเย็นแทนซื้อลดเงินลงทุนก้อนแรกได้ ' +
      fmtBaht(550000) + ' — แลกกับต้นทุนคงที่ที่เพิ่มขึ้นเดือนละราว 18,000 บาท'));
    if (loan) {
      out.push(warn('ภาระหนี้',
        'เงินกู้ ' + fmtBaht(loan.amount) + ' ที่ดอกเบี้ย 7% = ผ่อนเงินต้น 25,000 + ดอกเบี้ยราว 8,000 บาท/เดือน ซึ่งต้องจ่ายแม้เดือนที่ยังขาดทุน'));
    }
    out.push(risk('ต้องมีวงเงินสำรอง',
      'เงินสดต่ำสุดตามแผนเหลือราว ' + fmtBaht(137100) + ' ในเดือนที่ 5 — ควรขอวงเงิน OD ' +
      fmtBaht(inv.recommendedOverdraft) + ' ให้อนุมัติก่อนวันเปิดขาย'));
    return out;
  },

  'fin-pnl'(ctx) {
    const { data, filters } = ctx;
    const out = [];
    const y = data.pnl.years;
    const y1 = y[0], y2 = y[1], y3 = y[2];

    out.push(warn('ปีแรกคือปีสร้างฐาน',
      'กำไรสุทธิปีที่ 1 เพียง ' + fmtBaht(y1.netProfit) + ' (' + fmtPct(y1.netMarginPct) +
      ') แต่ EBITDA เป็นบวก ' + fmtBaht(y1.ebitda) + ' — แปลว่าธุรกิจเลี้ยงตัวเองได้แล้ว เพียงยังไม่คืนค่าเสื่อมและดอกเบี้ย'));
    out.push(good('จุดที่ธุรกิจน่าลงทุน',
      'ปีที่ 2 กำไรสุทธิขึ้นเป็น ' + fmtBaht(y2.netProfit) + ' (' + fmtPct(y2.netMarginPct) +
      ') เพราะยอดขายโตเร็วกว่าค่าใช้จ่ายคงที่ — ตัวเลขนี้คือเหตุผลหลักในการยื่นกู้'));
    out.push(info('ปีที่ 3 ต้องลงทุนเพิ่ม',
      'ค่าใช้จ่ายคงที่เพิ่มเป็น ' + fmtBaht(Math.round(y3.fixedCosts / 12)) + '/เดือน จากครัวที่ 2 แต่กำไรสุทธิยังโตถึง ' +
      fmtBaht(y3.netProfit)));
    const m = marketBenchmark;
    if (m) {
      out.push(risk('ความเปราะบางของสมมติฐานราคา',
        'งบทั้งชุดคิดที่ราคาเฉลี่ย ' + fmtNum(PLAN.avgPrice) + ' บาท/กล่อง ถ้าตลาดกดให้เหลือ ' + fmtNum(m.median) +
        ' บาท (ราคากลางจริง) กำไรส่วนเกินจะหายไปราว ' + fmtNum(PLAN.avgPrice - m.median) +
        ' บาท/กล่อง และแผนทั้งหมดต้องคิดใหม่ — ควรทำงบอีกชุดที่ราคานี้ไว้เทียบ'));
    }
    if (filters.scenario === 'worst') {
      out.push(risk('กรณีแย่', 'ยอดขายต่ำกว่าแผน 28% ทำให้ปีแรกขาดทุนระดับ EBITDA — แผนรับมือคือลดเหลือ 1 กะและตัดเมนูขายช้า'));
    }
    return out;
  },

  'fin-breakeven'(ctx) {
    const { data, filters } = ctx;
    const out = [];
    const be = data.breakEven;
    const cf = data.cashFlow;
    const worstCase = be.sensitivity.reduce((a, b) => (b.boxesPerDay > a.boxesPerDay ? b : a), be.sensitivity[0]);

    out.push(info('ตัวเลขที่ต้องเขียนบนกระดานในครัว',
      'ต้องขาย ' + fmtNum(be.boxesPerDay) + ' กล่อง/วัน (' + fmtNum(be.boxesPerMonth) +
      ' กล่อง/เดือน) จึงไม่ขาดทุน — ใช้กำลังผลิตเพียง ' + fmtPct(be.capacityUtilizationAtBePct)));
    out.push(risk('เงินสดสำคัญกว่ากำไร',
      'เงินสดต่ำสุด ' + fmtBaht(cf.lowestCash) + ' ในเดือนที่ ' + cf.lowestCashMonth +
      ' — ถ้ายอดพลาดเป้าเพียง 1 เดือนในช่วงนี้จะเงินขาดมือ ต้องมี OD พร้อมใช้'));
    out.push(warn('สมมติฐานที่อ่อนไหวที่สุด',
      worstCase.label + ' ทำให้จุดคุ้มทุนขยับเป็น ' + fmtNum(worstCase.boxesPerDay) + ' กล่อง/วัน (+' +
      fmtNum(worstCase.boxesPerDay - be.boxesPerDay) + ' กล่อง) — เป็นตัวแปรที่ต้องเฝ้าดูรายสัปดาห์'));
    out.push(act('วิธีลดจุดคุ้มทุนที่ได้ผลที่สุด',
      'ทุก 10 บาทที่เพิ่มกำไรส่วนเกินต่อกล่อง ลดจุดคุ้มทุนได้ราว 55 กล่อง/วัน — การย้ายลูกค้าจากแอปมา LINE OA ให้ผลมากกว่าการลดต้นทุนวัตถุดิบ'));
    if (filters.scenario === 'worst') {
      out.push(risk('กรณีแย่', 'ปีแรกไม่ถึงจุดคุ้มทุน — ต้องตัดค่าใช้จ่ายคงที่ลงราว 30% หรือเลื่อนการจ้างเพิ่มออกไป'));
    }
    return out;
  },

  'plan-roadmap'(ctx) {
    const { data } = ctx;
    const out = [];
    const all = data.milestones;
    const done = all.filter(m => m.status === 'done').length;
    const highTodo = all.filter(m => m.priority === 'high' && m.status === 'todo');
    const prep = all.filter(m => m.month <= 0);

    out.push(info('ความคืบหน้าตามแผน',
      'เสร็จแล้ว ' + done + ' จาก ' + all.length + ' งาน (' + fmtPct((done / all.length) * 100) +
      ') — งานช่วงเตรียมการมี ' + prep.length + ' รายการที่ต้องเสร็จก่อนวันเปิดขาย'));
    if (highTodo.length) {
      out.push(warn('งานสำคัญที่ยังไม่เริ่ม ' + highTodo.length + ' รายการ',
        highTodo.slice(0, 3).map(m => m.title.slice(0, 26)).join(' · ') + (highTodo.length > 3 ? ' และอื่น ๆ' : '') +
        ' — ทั้งหมดเป็นระดับความสำคัญสูง ควรกำหนดผู้รับผิดชอบและวันที่ให้ชัดในสัปดาห์นี้'));
    }
    out.push(risk('งานที่พลาดไม่ได้',
      'ใบอนุญาต อย. และระบบ GMP ต้องเสร็จก่อนเปิดขาย เพราะเป็นเงื่อนไขที่ทั้งลูกค้าองค์กรและทุกห้างขอดูเป็นอย่างแรก'));
    out.push(act('ตัวชี้วัดสำคัญที่สุดของปีแรก',
      'เดือนที่ 6 ต้องแตะ ' + fmtNum(PLAN.breakEvenBoxesPerDay) + ' กล่อง/วัน — ถ้าเดือนที่ 4 ยังไม่ถึงครึ่ง ให้ทบทวนราคาและช่องทางทันที ไม่ต้องรอครบ 6 เดือน'));
    return out;
  },

  'plan-risk'(ctx) {
    const { data } = ctx;
    const out = [];
    const score = { high: 3, medium: 2, low: 1 };
    const critical = data.risks.filter(r => r.likelihood === 'high' && r.impact === 'high');
    const highLikely = data.risks.filter(r => r.likelihood === 'high');
    const top = [...data.risks].sort((a, b) => (score[b.likelihood] * score[b.impact]) - (score[a.likelihood] * score[a.impact]))[0];

    out.push(risk('ความเสี่ยงอันดับหนึ่ง',
      top.title + ' (' + top.category + ') — ' + top.effect + ' · แผนรับมือ: ' + top.mitigation));
    if (critical.length) {
      out.push(warn('โอกาสเกิดสูงและกระทบสูง ' + critical.length + ' รายการ',
        critical.map(r => r.title).join(' · ') + ' — ต้องมีแผนรับมือที่ลงมือได้ทันทีและทบทวนทุกเดือน'));
    }
    out.push(info('ความเสี่ยงที่โอกาสเกิดสูง',
      fmtNum(highLikely.length) + ' รายการ ส่วนใหญ่เป็นเรื่องยอดขายและต้นทุนวัตถุดิบ — ทั้งสองเรื่องแก้ได้ด้วยการล็อกราคาซัพพลายเออร์และเร่งช่องทางองค์กร'));
    out.push(act('สามอย่างที่ต้องมีก่อนเปิดขาย',
      '1) วงเงิน OD 500,000 บาทอนุมัติแล้ว 2) ซัพพลายเออร์สำรอง 2 รายทุกหมวด 3) ระบบบันทึกอุณหภูมิและเก็บตัวอย่างอาหาร 48 ชั่วโมง'));
    return out;
  }
};

// ── ตัวเรนเดอร์ ───────────────────────────────────────────────

const TONE_LABEL = {
  good: { icon: '✅', cls: 'good' },
  info: { icon: 'ℹ️', cls: 'info' },
  warn: { icon: '⚠️', cls: 'warn' },
  risk: { icon: '🚨', cls: 'risk' },
  action: { icon: '🎯', cls: 'action' }
};

/**
 * สร้างกล่อง "AI วิเคราะห์" ของหน้านั้น
 * @param {string} pageKey คีย์ของหน้า (ตรงกับ ANALYZERS)
 * @param {Object} ctx { data, filters, ... } ข้อมูลของหน้านั้น
 * @returns {string} HTML
 */
export function aiPanel(pageKey, ctx) {
  const analyzer = ANALYZERS[pageKey];
  let findings = [];
  if (analyzer) {
    try {
      findings = analyzer(ctx) || [];
    } catch (err) {
      console.error('AI analyst error on ' + pageKey + ':', err);
      findings = [warn('วิเคราะห์ไม่สำเร็จ', 'ข้อมูลของหน้านี้ไม่ครบสำหรับการวิเคราะห์อัตโนมัติ')];
    }
  }
  if (!findings.length) return '';

  const items = findings.map(f => {
    const tone = TONE_LABEL[f.tone] || TONE_LABEL.info;
    return `<div class="hb-ai-item ${tone.cls}">
      <div class="hb-ai-badge">${tone.icon} ${f.badge}</div>
      <p>${f.text}</p>
    </div>`;
  }).join('');

  const m = marketBenchmark;
  const foot = m
    ? 'เทียบกับผลสำรวจราคาตลาดจริง ' + m.brandCount + ' แบรนด์ (' + m.priceMin + '-' + m.priceMax +
      ' บาท/กล่อง · กลางตลาด ' + m.median + ' บาท) และเกณฑ์ของแผนธุรกิจ'
    : 'เทียบกับเกณฑ์ของแผนธุรกิจ';

  return `<div class="hb-ai-box">
    <div class="hb-ai-head">
      <span class="hb-ai-title">🤖 AI วิเคราะห์</span>
      <span class="hb-ai-sub">คำนวณตามกฎในระบบจากตัวเลขและฟิลเตอร์ที่เลือกอยู่ (ไม่ได้เรียกโมเดลภาษา)</span>
    </div>
    <div class="hb-ai-body">${items}</div>
    <p class="hb-ai-foot">${foot}</p>
  </div>`;
}
