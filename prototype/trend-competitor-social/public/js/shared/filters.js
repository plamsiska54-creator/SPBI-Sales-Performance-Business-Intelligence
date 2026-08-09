/**
 * filters.js - Date range picker + platform filter + event emitter
 * Renders a filter bar, tracks state, emits change events
 */

// Current filter state
let currentFilters = { dateRange: 'all', platform: 'all' };

// Registered callbacks
const listeners = [];

// Platform options available in the data
const PLATFORMS = [
  { value: 'all',       label: 'ทั้งหมด' },
  { value: 'facebook',  label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'x',         label: 'X (Twitter)' },
  { value: 'tiktok',    label: 'TikTok' },
  { value: 'shopee',    label: 'Shopee' },
  { value: 'lazada',    label: 'Lazada' },
  { value: 'amazon',    label: 'Amazon' },
  { value: 'pantip',    label: 'Pantip' }
];

// Date range options
const DATE_RANGES = [
  { value: 'all', label: 'ทั้งหมด (6 เดือน)' },
  { value: '4w',  label: '4 สัปดาห์ล่าสุด' },
  { value: '8w',  label: '8 สัปดาห์ล่าสุด' },
  { value: '12w', label: '12 สัปดาห์ล่าสุด' }
];

/**
 * Notify all registered listeners of a filter change
 */
function notifyListeners() {
  const snapshot = { ...currentFilters };
  for (const cb of listeners) {
    try {
      cb(snapshot);
    } catch (err) {
      console.error('Filter listener error:', err);
    }
  }
  // Also dispatch a CustomEvent on document for decoupled listeners
  document.dispatchEvent(new CustomEvent('filter-change', { detail: snapshot }));
}

/**
 * Build <option> elements HTML from an array of { value, label }
 * @param {Array<{value: string, label: string}>} options
 * @param {string} selected - currently selected value
 * @returns {string} HTML string
 */
function buildOptions(options, selected) {
  return options
    .map(opt =>
      `<option value="${opt.value}"${opt.value === selected ? ' selected' : ''}>${opt.label}</option>`
    )
    .join('\n');
}

/**
 * Render filter bar into a container element
 * Creates the DOM, attaches event listeners
 * @param {HTMLElement} container - Element to render filter bar into
 */
export function renderFilters(container) {
  if (!container) return;

  container.innerHTML = `
    <div class="filter-bar">
      <div class="filter-group">
        <label for="filter-date-range">ช่วงเวลา</label>
        <select id="filter-date-range">
          ${buildOptions(DATE_RANGES, currentFilters.dateRange)}
        </select>
      </div>
      <div class="filter-group">
        <label for="filter-platform">แพลตฟอร์ม</label>
        <select id="filter-platform">
          ${buildOptions(PLATFORMS, currentFilters.platform)}
        </select>
      </div>
    </div>
  `;

  // Bind change events + sync DOM values จาก currentFilters (ป้องกัน state หายเมื่อสลับ tab)
  const dateSelect = container.querySelector('#filter-date-range');
  const platformSelect = container.querySelector('#filter-platform');

  if (dateSelect) {
    dateSelect.value = currentFilters.dateRange;
    dateSelect.addEventListener('change', (e) => {
      currentFilters.dateRange = e.target.value;
      notifyListeners();
    });
  }

  if (platformSelect) {
    platformSelect.value = currentFilters.platform;
    platformSelect.addEventListener('change', (e) => {
      currentFilters.platform = e.target.value;
      notifyListeners();
    });
  }
}

/**
 * Get current filter values (returns a copy)
 * @returns {{ dateRange: string, platform: string }}
 */
export function getFilters() {
  return { ...currentFilters };
}

/**
 * Register a callback for filter changes
 * @param {function} callback - Called with { dateRange, platform }
 */
export function onFilterChange(callback) {
  if (typeof callback === 'function') {
    listeners.push(callback);
  }
}

/**
 * Remove a previously registered filter change callback
 * @param {function} callback
 */
export function removeFilterListener(callback) {
  const idx = listeners.indexOf(callback);
  if (idx !== -1) {
    listeners.splice(idx, 1);
  }
}

/**
 * Reset filters to default values
 */
export function resetFilters() {
  currentFilters = { dateRange: 'all', platform: 'all' };

  // Update DOM selects if they exist
  const dateSelect = document.getElementById('filter-date-range');
  const platformSelect = document.getElementById('filter-platform');
  if (dateSelect) dateSelect.value = 'all';
  if (platformSelect) platformSelect.value = 'all';

  notifyListeners();
}
