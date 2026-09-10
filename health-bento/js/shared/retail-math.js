/**
 * retail-math.js — สูตรคำนวณกำไรเมื่อขายผ่านห้าง (ai-analyst.js import ไฟล์นี้)
 */

export const SKU_COUNT = 4;   // จำนวน SKU ที่วางแผนยื่นเข้าห้างในรอบแรก

/**
 * คำนวณเงินที่เราได้รับจริงต่อกล่อง หลังหัก GP ของห้าง ค่าธรรมเนียมศูนย์กระจายสินค้า และของเสีย
 * @param {Object} chain รายการห้าง (ต้องมี shelf.rsp, terms.gpPct, terms.dcFeePct, potential.wastePct)
 * @param {{cogsPerBox:number, deliveryToDcPerBox:number}} ourCost
 */
export function chainEconomics(chain, ourCost) {
  const rsp = chain.shelf.rsp;
  const wholesale = rsp * (1 - chain.terms.gpPct / 100);
  const dcFee = wholesale * (chain.terms.dcFeePct / 100);
  const waste = chain.potential.wastePct / 100;
  // ผลิต 100 กล่อง ขายได้ (1 - waste) กล่อง แต่จ่ายต้นทุนผลิตทุกกล่อง
  const revenuePerProduced = (wholesale - dcFee) * (1 - waste);
  const costPerProduced = ourCost.cogsPerBox + ourCost.deliveryToDcPerBox;
  const contribution = revenuePerProduced - costPerProduced;
  return {
    rsp,
    wholesale: Math.round(wholesale),
    dcFee: +dcFee.toFixed(1),
    contribution: +contribution.toFixed(1),
    contributionPct: +((contribution / rsp) * 100).toFixed(1),
    listingTotal: chain.terms.listingFeePerSku * SKU_COUNT
  };
}

/** ยอดขาย/กำไรต่อเดือนของห้างหนึ่ง ตามจำนวนสาขาที่เริ่มและกล่องต่อสาขาต่อวัน */
export function chainPotential(chain, ourCost, { scenarioFactor = 1, salesDays = 30 } = {}) {
  const e = chainEconomics(chain, ourCost);
  const boxesPerStore = chain.potential.boxesPerStorePerDay * scenarioFactor;
  const boxesPerDay = boxesPerStore * chain.startBranches;
  const monthlyBoxes = boxesPerDay * salesDays;
  const monthlyContribution = monthlyBoxes * e.contribution;
  const paybackMonths = monthlyContribution > 0 ? e.listingTotal / monthlyContribution : null;
  return {
    ...e,
    boxesPerStore: +boxesPerStore.toFixed(1),
    boxesPerDay: Math.round(boxesPerDay),
    monthlyBoxes: Math.round(monthlyBoxes),
    monthlyRevenue: Math.round(monthlyBoxes * e.wholesale),
    monthlyContribution: Math.round(monthlyContribution),
    paybackMonths: paybackMonths === null ? null : +paybackMonths.toFixed(1)
  };
}
