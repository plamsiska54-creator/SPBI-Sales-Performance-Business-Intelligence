/**
 * filter-data.js — Data variation utilities for filter-reactive modules
 * Adjusts demo data based on selected filter values to simulate filtering
 */

const PERIOD_FACTORS = { all: 1.0, '3m': 0.52, '1m': 0.18, '1w': 0.05 };
const YEAR_FACTORS = { '2569': 1.0, '2568': 0.92, '2567': 0.85 };
const REGION_FACTORS = {
  all: 1.0, bkk: 0.42, central: 0.18, north: 0.12,
  northeast: 0.10, south: 0.10, east: 0.08
};
const CHANNEL_FACTORS = {
  all: 1.0, store: 0.34, online: 0.25, mt: 0.22, cvs: 0.13, market: 0.06
};

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

export function getRegionFactor(filters) {
  return REGION_FACTORS[filters.region] || 1;
}

export function getChannelFactor(filters) {
  return CHANNEL_FACTORS[filters.channel] || 1;
}

export function getAllFactors(filters) {
  return getTimeFactor(filters) * getRegionFactor(filters) * getChannelFactor(filters);
}

export function varyValue(base, filters, { seed = 0, asInt = false, min = 0 } = {}) {
  const factor = getAllFactors(filters);
  const h = hashStr(String(seed) + JSON.stringify(filters));
  const jitter = 0.96 + (h % 9) * 0.01;
  let result = base * factor * jitter;
  if (asInt) result = Math.round(result);
  return Math.max(min, asInt ? result : +result.toFixed(1));
}

export function varyPercent(base, filters, { seed = 0 } = {}) {
  const yf = YEAR_FACTORS[filters.year] || 1;
  const h = hashStr(String(seed) + JSON.stringify(filters));
  const jitter = 0.9 + (h % 20) * 0.01;
  return +(base * yf * jitter).toFixed(1);
}

export function varyArray(arr, filters, { startSeed = 0 } = {}) {
  return arr.map((v, i) => varyValue(v, filters, { seed: startSeed + i }));
}

export function getMonthSlice(labels, data, filters) {
  if (filters.month && filters.month !== 'all') {
    const idx = parseInt(filters.month) - 1;
    if (idx >= 0 && idx < labels.length) {
      return { labels: [labels[idx]], data: [data[idx]] };
    }
  }
  const period = filters.period || 'all';
  if (period === '1w' || period === '1m') {
    return { labels: labels.slice(-1), data: data.slice(-1) };
  }
  if (period === '3m') {
    return { labels: labels.slice(-3), data: data.slice(-3) };
  }
  return { labels: [...labels], data: [...data] };
}

export function filterByCategory(items, filters, catField = 'category') {
  const cat = filters.category;
  if (!cat || cat === 'all') return items;
  return items.filter(item => item[catField] === cat);
}

export function filterByCompetitor(items, filters, idField = 'id') {
  const comp = filters.competitor;
  if (!comp || comp === 'all') return items;
  return items.filter(item => item[idField] === comp);
}

export function filterByPlatform(items, filters, field = 'platform') {
  const p = filters.platform;
  if (!p || p === 'all') return items;
  return items.filter(item => item[field] === p);
}

export function filterByPriority(items, filters, field = 'priority') {
  const p = filters.priority;
  if (!p || p === 'all') return items;
  return items.filter(item => item[field] === p);
}

export function filterByStatus(items, filters, field = 'status') {
  const s = filters.status;
  if (!s || s === 'all') return items;
  return items.filter(item => item[field] === s);
}

export function isDefaultFilters(filters) {
  return Object.values(filters).every(v => v === 'all' || v === '2569');
}
