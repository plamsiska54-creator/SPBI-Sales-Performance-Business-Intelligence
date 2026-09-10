/**
 * chart-factory.js - Chart.js instance management
 * Registry pattern: track all charts by canvasId, destroy on unmount to prevent memory leaks
 * Chart.js loaded as UMD via <script> tag -> use window.Chart
 */

// --- Global plugin: show % labels on doughnut/pie ---
const doughnutPercentPlugin = {
  id: 'doughnutPercent',
  afterDraw(chart) {
    if (chart.config.type !== 'doughnut' && chart.config.type !== 'pie') return;
    const meta = chart.getDatasetMeta(0);
    if (!meta || !meta.data || meta.data.length === 0) return;
    const dataset = chart.data.datasets[0];
    if (!dataset || !dataset.data) return;
    const total = dataset.data.reduce((a, b) => a + (b || 0), 0);
    if (total === 0) return;

    const { ctx, chartArea } = chart;
    const chartSize = Math.min(chartArea.width, chartArea.height);
    const fontSize = Math.max(13, Math.round(chartSize / 22));

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${fontSize}px "Segoe UI", Tahoma, sans-serif`;

    meta.data.forEach((arc, i) => {
      const value = dataset.data[i];
      if (!value) return;
      const pct = (value / total) * 100;
      if (pct < 4) return;

      const { startAngle, endAngle, innerRadius, outerRadius } = arc.getProps(
        ['startAngle', 'endAngle', 'innerRadius', 'outerRadius']
      );
      const midAngle = (startAngle + endAngle) / 2;
      const midRadius = (innerRadius + outerRadius) / 2;
      const x = arc.x + Math.cos(midAngle) * midRadius;
      const y = arc.y + Math.sin(midAngle) * midRadius;
      const label = pct >= 10 ? Math.round(pct) + '%' : pct.toFixed(1) + '%';

      ctx.strokeStyle = 'rgba(0,0,0,0.45)';
      ctx.lineWidth = 3;
      ctx.strokeText(label, x, y);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, x, y);
    });

    ctx.restore();
  }
};

window.Chart.register(doughnutPercentPlugin);

// canvasId -> Chart instance
const registry = new Map();

// สีประจำแบรนด์ — Health Bento + คู่แข่งข้าวกล่องเพื่อสุขภาพ
export const BRAND_COLORS = {
  healthbento: '#16a34a',
  polpa: '#0ea5e9',
  fit2go: '#f59e0b',
  healthmeplease: '#e11d48',
  staylean: '#00bfa5',
  under360: '#84cc16',
  jonessalad: '#7c4dff'
};

// พาเลตทั่วไปของกราฟ — โทนเขียว/เทอร์ควอยซ์นำ (ธีมสุขภาพ)
export const CHART_COLORS = [
  '#16a34a', '#00bfa5', '#84cc16', '#2979ff', '#f59e0b', '#e11d48',
  '#7c4dff', '#0ea5e9', '#facc15', '#14b8a6'
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

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          font: { family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", size: 12 },
          color: '#4a5568'
        }
      },
      tooltip: {
        titleFont: { family: "'Segoe UI'", size: 13 },
        bodyFont: { family: "'Segoe UI'", size: 12 },
        backgroundColor: 'rgba(26, 32, 44, 0.92)',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(124, 77, 255, 0.4)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10
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
