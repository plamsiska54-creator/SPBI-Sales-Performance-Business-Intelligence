/**
 * filter-data.js — ยูทิลิตีปรับค่าตัวเลขตามฟิลเตอร์ที่เลือก
 * ตัวเลขในโปรเจกต์นี้เป็น "ประมาณการตามแผนธุรกิจ" ไม่ใช่ยอดขายจริง
 * ฟังก์ชันเหล่านี้ทำให้กราฟ/KPI ตอบสนองต่อฟิลเตอร์อย่างสมเหตุสมผล
 */

// ปีตามแผน = การเติบโตสะสม (ปีที่ 1 เป็นฐาน)
const YEAR_FACTORS = { '2569': 1.0, '2570': 1.85, '2571': 3.05 };
const PERIOD_FACTORS = { all: 1.0, '6m': 0.55, '3m': 0.28, '1m': 0.09 };
const CHANNEL_FACTORS = {
  all: 1.0, line: 0.32, delivery: 0.26, corporate: 0.22, fitness: 0.12, store: 0.08
};
const REGION_FACTORS = {
  all: 1.0, bkk_in: 0.44, bkk_out: 0.23, nonthaburi: 0.16, samutprakan: 0.11, upcountry: 0.06
};
const MENU_FACTORS = {
  all: 1.0, thaiclean: 0.30, bowl: 0.22, keto: 0.16, protein: 0.18, vegan: 0.08, medical: 0.06
};
const CUSTOMER_FACTORS = {
  all: 1.0, office: 0.38, fitness: 0.24, diet: 0.20, medical: 0.09, corporate: 0.09
};
const SCENARIO_FACTORS = { base: 1.0, best: 1.28, worst: 0.72 };

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getTimeFactor(filters) {
  const pf = PERIOD_FACTORS[filters.period] || 1;
  const yf = YEAR_FACTORS[filters.year] || 1;
  return pf * yf;
}

export function getYearFactor(filters) {
  return YEAR_FACTORS[filters.year] || 1;
}

export function getScenarioFactor(filters) {
  return SCENARIO_FACTORS[filters.scenario] || 1;
}

export function getChannelFactor(filters) {
  return CHANNEL_FACTORS[filters.channel] || 1;
}

export function getRegionFactor(filters) {
  return REGION_FACTORS[filters.region] || 1;
}

export function getMenuFactor(filters) {
  return MENU_FACTORS[filters.menu] || 1;
}

export function getCustomerFactor(filters) {
  return CUSTOMER_FACTORS[filters.customer] || 1;
}

/** คูณทุกมิติที่มีอยู่ใน filters เข้าด้วยกัน */
export function getAllFactors(filters) {
  return getTimeFactor(filters)
    * getChannelFactor(filters)
    * getRegionFactor(filters)
    * getMenuFactor(filters)
    * getCustomerFactor(filters)
    * getScenarioFactor(filters);
}

/**
 * ปรับค่าฐานตามฟิลเตอร์ + jitter เล็กน้อยให้ตัวเลขดูไม่กลมเกินไป
 * @param {number} base ค่าฐาน (กรณีปีที่ 1 / ทุกช่องทาง / กรณีฐาน)
 */
export function varyValue(base, filters, { seed = 0, asInt = false, min = 0, decimals = 1 } = {}) {
  const factor = getAllFactors(filters);
  const h = hashStr(String(seed) + JSON.stringify(filters));
  const jitter = 0.96 + (h % 9) * 0.01;
  let result = base * factor * jitter;
  if (asInt) result = Math.round(result);
  return Math.max(min, asInt ? result : +result.toFixed(decimals));
}

/** ค่าที่เป็น % หรืออัตราส่วน — ไม่ควรถูกคูณด้วยขนาดของช่องทาง/พื้นที่ */
export function varyPercent(base, filters, { seed = 0 } = {}) {
  const yf = getYearFactor(filters);
  const sf = getScenarioFactor(filters);
  const growthEffect = 1 + (yf - 1) * 0.12;   // ปีหลัง ๆ ดีขึ้นเล็กน้อย ไม่ใช่โตเป็นเท่าตัว
  const h = hashStr(String(seed) + JSON.stringify(filters));
  const jitter = 0.94 + (h % 13) * 0.01;
  return +(base * growthEffect * sf * jitter).toFixed(1);
}

export function varyArray(arr, filters, { startSeed = 0, asInt = false } = {}) {
  return arr.map((v, i) => varyValue(v, filters, { seed: startSeed + i, asInt }));
}

/** ตัด label/data ตามเดือนหรือช่วงเวลาที่เลือก */
export function getMonthSlice(labels, data, filters) {
  if (filters.month && filters.month !== 'all') {
    const idx = parseInt(filters.month, 10) - 1;
    if (idx >= 0 && idx < labels.length) {
      return { labels: [labels[idx]], data: [data[idx]] };
    }
  }
  const period = filters.period || 'all';
  if (period === '1m') return { labels: labels.slice(-1), data: data.slice(-1) };
  if (period === '3m') return { labels: labels.slice(-3), data: data.slice(-3) };
  if (period === '6m') return { labels: labels.slice(-6), data: data.slice(-6) };
  return { labels: [...labels], data: [...data] };
}

export function filterByField(items, filters, filterKey, itemField = filterKey) {
  const v = filters[filterKey];
  if (!v || v === 'all') return items;
  return items.filter(item => item[itemField] === v);
}
