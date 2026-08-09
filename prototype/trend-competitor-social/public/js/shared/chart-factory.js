/**
 * chart-factory.js - Chart.js instance management
 * Registry pattern: track all charts by canvasId, destroy on unmount to prevent memory leaks
 * Chart.js loaded as UMD via <script> tag -> use window.Chart
 */

// canvasId -> Chart instance
const registry = new Map();

// Brand colors for competitor charts
export const BRAND_COLORS = {
  wanwanach: '#7b2ff7',
  taokaenoi: '#2ecc71',
  manora: '#e74c3c',
  hanami: '#f39c12',
  lays: '#3498db',
  koikeya: '#e91e63'
};

// General palette for charts
export const CHART_COLORS = [
  '#00d2ff', '#7b2ff7', '#2ecc71', '#e74c3c', '#f39c12', '#3498db',
  '#e91e63', '#9b59b6', '#1abc9c', '#f1c40f'
];

/**
 * Deep merge helper - merge source into target recursively
 * Arrays are replaced (not concatenated)
 */
function deepMerge(target, source) {
  const output = { ...target };
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = target[key];
    if (
      srcVal !== null &&
      typeof srcVal === 'object' &&
      !Array.isArray(srcVal) &&
      tgtVal !== null &&
      typeof tgtVal === 'object' &&
      !Array.isArray(tgtVal)
    ) {
      output[key] = deepMerge(tgtVal, srcVal);
    } else {
      output[key] = srcVal;
    }
  }
  return output;
}

/**
 * Create a Chart.js chart on a canvas, register it in the registry
 * If a chart already exists on the same canvasId, destroy it first
 * @param {string} canvasId - Canvas element ID
 * @param {object} config - Chart.js configuration { type, data, options }
 * @returns {object|null} Chart instance or null if canvas not found
 */
export function createChart(canvasId, config) {
  // Destroy existing chart on this canvas
  if (registry.has(canvasId)) {
    registry.get(canvasId).destroy();
    registry.delete(canvasId);
  }

  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.warn(`Canvas "${canvasId}" not found`);
    return null;
  }

  // Default options matching dark theme
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", size: 12 },
          color: '#ccc'
        }
      },
      tooltip: {
        titleFont: { family: "'Segoe UI'", size: 13 },
        bodyFont: { family: "'Segoe UI'", size: 12 },
        backgroundColor: 'rgba(30, 30, 60, 0.95)',
        borderColor: 'rgba(123, 47, 247, 0.3)',
        borderWidth: 1
      }
    },
    scales: {}
  };

  const mergedConfig = {
    ...config,
    options: deepMerge(defaultOptions, config.options || {})
  };

  const chart = new window.Chart(canvas, mergedConfig);
  registry.set(canvasId, chart);
  return chart;
}

/**
 * Destroy a single chart by canvasId
 * @param {string} canvasId
 */
export function destroyChart(canvasId) {
  if (registry.has(canvasId)) {
    registry.get(canvasId).destroy();
    registry.delete(canvasId);
  }
}

/**
 * Destroy all registered charts and clear the registry
 */
export function destroyAll() {
  for (const [id, chart] of registry) {
    chart.destroy();
  }
  registry.clear();
}

/**
 * Get a chart instance by canvasId
 * @param {string} canvasId
 * @returns {object|null}
 */
export function getChart(canvasId) {
  return registry.get(canvasId) || null;
}
