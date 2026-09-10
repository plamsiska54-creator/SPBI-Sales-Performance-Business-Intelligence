/**
 * data-loader.js - Fetch JSON with in-memory cache
 * Provides cached fetch and week-range filtering for weekly data
 */

// In-memory cache: url -> parsed JSON
const cache = new Map();

/**
 * Fetch JSON from a URL with caching
 * Returns cached data on subsequent calls to the same URL
 * @param {string} url - URL to fetch
 * @returns {Promise<any>} Parsed JSON data
 * @throws {Error} If fetch fails or response is not OK
 */
// Detect base path from current page location for subdirectory deployment
const _basePath = (() => {
  const p = location.pathname;
  const idx = p.lastIndexOf('/');
  return idx > 0 ? p.substring(0, idx) : '';
})();

function _resolveURL(url) {
  if (url.startsWith('/') && _basePath) return _basePath + url;
  return url;
}

export async function fetchJSON(url) {
  const resolved = _resolveURL(url);
  if (cache.has(resolved)) {
    return cache.get(resolved);
  }

  const response = await fetch(resolved);
  if (!response.ok) {
    throw new Error(`โหลดข้อมูลไม่สำเร็จ: ${url} (${response.status})`);
  }

  const data = await response.json();
  cache.set(resolved, data);
  return data;
}

/**
 * Clear all cached data (useful when data may have changed)
 */
export function clearCache() {
  cache.clear();
}

/**
 * Filter an array of objects by week range
 * Each object must have a `week` property in "YYYY-WXX" format (e.g. "2026-W01")
 * String comparison works correctly because the format is zero-padded
 * @param {Array<{week: string}>} dataArray - Array with week field
 * @param {string} startWeek - Start week inclusive, e.g. "2026-W01"
 * @param {string} endWeek - End week inclusive, e.g. "2026-W12"
 * @returns {Array} Filtered array
 */
export function filterByWeekRange(dataArray, startWeek, endWeek) {
  if (!Array.isArray(dataArray)) return [];
  return dataArray.filter(d => d.week >= startWeek && d.week <= endWeek);
}

/**
 * Calculate the start week string for a given number of recent weeks
 * based on the last week present in a data array
 * @param {Array<{week: string}>} dataArray - Array with week field (must be sorted ascending)
 * @param {number} numWeeks - How many recent weeks to include
 * @returns {{ startWeek: string, endWeek: string } | null}
 */
export function getRecentWeekRange(dataArray, numWeeks) {
  if (!Array.isArray(dataArray) || dataArray.length === 0) return null;

  const sorted = [...dataArray].sort((a, b) => a.week.localeCompare(b.week));
  const endWeek = sorted[sorted.length - 1].week;

  if (numWeeks >= sorted.length) {
    return { startWeek: sorted[0].week, endWeek };
  }

  const startIdx = sorted.length - numWeeks;
  return { startWeek: sorted[startIdx].week, endWeek };
}
