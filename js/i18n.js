// ============================================================
// I18N.JS — Thai / English language toggle
// ============================================================
(function () {
  'use strict';

  var _lang = localStorage.getItem('spbi_lang') || 'th';

  // ---- Translation dictionary ----
  var DICT = {
    // -- Sidebar menu --
    'menu.overview':       { th: 'ภาพรวมยอดขาย',       en: 'Sales Overview' },
    'menu.mt':             { th: 'ห้างค้าปลีก',         en: 'Modern Trade' },
    'menu.booth':          { th: 'บูธ',                 en: 'Booth' },
    'menu.online':         { th: 'ออนไลน์',             en: 'Online' },
    'menu.amazon':         { th: 'อเมซอน & ของฝาก',     en: 'Amazon & Souvenir' },
    'menu.ordering':       { th: 'ธุรการขาย',           en: 'Sales Admin' },
    'menu.crm':            { th: 'ลูกค้าสัมพันธ์',       en: 'CRM' },
    'menu.sm-expense':     { th: 'ฝ่ายขาย - การตลาด',   en: 'Sales & Marketing' },
    'menu.admin':          { th: 'แผงแอดมิน',           en: 'Admin Panel' },

    // -- Topbar --
    'topbar.breadcrumb':   { th: 'Dashboard',           en: 'Dashboard' },
    'topbar.download':     { th: '⬇️ ดาวน์โหลด ▾',      en: '⬇️ Download ▾' },
    'topbar.logout':       { th: 'ออกจากระบบ',          en: 'Logout' },
    'topbar.bell.title':   { th: 'การแจ้งเตือน',        en: 'Notifications' },
    'topbar.collapse':     { th: 'ย่อ/ขยายเมนู',        en: 'Collapse/Expand Menu' },
    'topbar.menu':         { th: 'เมนู',                en: 'Menu' },

    // -- Download menu --
    'dl.excel':            { th: '📊 Excel (.xlsx)',     en: '📊 Excel (.xlsx)' },
    'dl.pdf':              { th: '📄 PDF (.pdf)',        en: '📄 PDF (.pdf)' },
    'dl.image':            { th: '🖼️ รูปภาพ (.png)',     en: '🖼️ Image (.png)' },

    // -- Sidebar footer --
    'sidebar.status':      { th: '✅ YTD Jan–Jun ข้อมูลครบ',  en: '✅ YTD Jan–Jun data complete' },
    'sidebar.info':        { th: '📊 Sales Dashboard 2026 · ข้อมูล ม.ค.–ก.ค.', en: '📊 Sales Dashboard 2026 · Data Jan–Jul' },
    'sidebar.update':      { th: 'อัปเดต: 8 ก.ค. 2026',    en: 'Updated: 8 Jul 2026' },

    // -- Overview sub-tabs --
    'ov.main':             { th: '📊 งบประมาณ vs จริง',   en: '📊 Budget vs Actual' },
    'ov.channel':          { th: '📦 ช่องทางการขาย',     en: '📦 Sales Channels' },
    'ov.trend':            { th: '📈 แนวโน้มรายเดือน',   en: '📈 Monthly Trends' },
    'ov.daily':            { th: '📅 รายวัน',            en: '📅 Daily' },
    'ov.customer':         { th: '🏪 ลูกค้า',            en: '🏪 Customers' },
    'ov.sales':            { th: '👤 พนักงานขาย',        en: '👤 Sales Staff' },
    'ov.update':           { th: '🔄 อัพเดทข้อมูล',      en: '🔄 Data Update' },

    // -- MT channel tabs --
    'mt.all':              { th: '📊 ทุกช่องทาง',        en: '📊 All Channels' },

    // -- Booth sub-tabs --
    'bth.info':            { th: '📋 ข้อมูลบูธ',         en: '📋 Booth Info' },
    'bth.sales':           { th: '📊 ยอดขายรวม',         en: '📊 Total Sales' },
    'bth.stock':           { th: '📦 สต็อกบูธ',          en: '📦 Booth Stock' },
    'bth.cost':            { th: '💰 ต้นทุนค่าใช้จ่าย',   en: '💰 Cost & Expenses' },
    'bth.product':         { th: '🛍️ สินค้า',            en: '🛍️ Products' },
    'bth.return':          { th: '↩️ ของคืน - ของเสีย',   en: '↩️ Returns & Defects' },
    'bth.waste':           { th: '📋 สรุปของคืน/ของเสีย', en: '📋 Returns/Defects Summary' },
    'bth.promo':           { th: '🎁 โปรโมชั่น',         en: '🎁 Promotions' },
    'bth.perf':            { th: '📈 ผลงานรายสาขา',      en: '📈 Branch Performance' },
    'bth.update':          { th: '🔄 อัพเดทข้อมูล',      en: '🔄 Data Update' },

    // -- Online sub-tabs --
    'ol.sales':            { th: '📊 ยอดขาย',            en: '📊 Sales' },
    'ol.ads':              { th: '📢 ข้อมูล ADS & Campaign', en: '📢 ADS & Campaign' },
    'ol.influencer':       { th: '👥 ข้อมูลอินฟลูเอนเซอร์', en: '👥 Influencer Data' },
    'ol.shipping':         { th: '📦 ข้อมูลค่าขนส่ง',     en: '📦 Shipping Costs' },
    'ol.cod':              { th: '💰 ข้อมูล COD',          en: '💰 COD Data' },
    'ol.return':           { th: '📦 สินค้าตีกลับ',       en: '📦 Returned Products' },
    'ol.claim':            { th: '📋 ข้อมูลออเดอร์ส่งเคลม', en: '📋 Claim Orders' },
    'ol.cancel':           { th: '❌ ข้อมูลออเดอร์ยกเลิก',  en: '❌ Cancelled Orders' },
    'ol.supply':           { th: '🧾 ข้อมูลเบิกวัสดุสิ้นเปลือง', en: '🧾 Supply Requisitions' },
    'ol.cost':             { th: '💰 ต้นทุนขายสินค้า',     en: '💰 Cost of Goods Sold' },
    'ol.prodrank':         { th: '📋 รายการขายสินค้า',     en: '📋 Product Sales Ranking' },
    'ol.dataupdate':       { th: '🔄 อัพเดทข้อมูล',       en: '🔄 Data Update' },

    // -- Amazon sub-tabs --
    'amz.sales':           { th: '📊 ยอดขาย',             en: '📊 Sales' },
    'amz.map':             { th: '🗺️ Map Wanwanach',       en: '🗺️ Map Wanwanach' },
    'amz.customers':       { th: '👥 ลูกค้าใหม่/หาย',      en: '👥 New/Lost Customers' },
    'amz.visit':           { th: '📋 Sales Visit Tracker',  en: '📋 Sales Visit Tracker' },

    // -- Team sub-tabs --
    'team.list':           { th: '👤 รายชื่อบุคลากร',      en: '👤 Staff List' },
    'team.org':            { th: '🏢 ผังองค์กร',           en: '🏢 Org Chart' },

    // -- Ordering sub-tabs --
    'ord.staff':           { th: '👥 พนักงาน & เขต',       en: '👥 Staff & Zones' },
    'ord.bills':           { th: '🧾 จำนวนบิล',            en: '🧾 Bill Count' },
    'ord.checklist':       { th: '✅ เช็คลิสลูกค้า',       en: '✅ Customer Checklist' },
    'ord.errors':          { th: '⚠️ ความผิดพลาด & เคลม',  en: '⚠️ Errors & Claims' },
    'ord.calls':           { th: '📞 การโทรลูกค้า',        en: '📞 Customer Calls' },
    'ord.manual':          { th: '📖 คู่มือการทำงาน',       en: '📖 Work Manual' },
    'ord.perf':            { th: '📊 ผลงานรายคน',          en: '📊 Individual Performance' },

    // -- CRM sub-tabs --
    'crm.overview':        { th: '📋 ภาพรวม',              en: '📋 Overview' },
    'crm.mt':              { th: '🏪 ห้างค้าปลีก',         en: '🏪 Modern Trade' },
    'crm.amazon':          { th: '📦 อเมซอน',              en: '📦 Amazon' },
    'crm.booth':           { th: '🏕️ บูธ',                 en: '🏕️ Booth' },
    'crm.online':          { th: '🛒 ออนไลน์',             en: '🛒 Online' },
    'crm.telesales':       { th: '📞 โทรขาย',              en: '📞 Telesales' },

    // -- KPI sub-tabs --
    'kpi.overview':        { th: '🎯 KPI รวม',             en: '🎯 KPI Summary' },
    'kpi.dept':            { th: '📊 KPI แต่ละแผนก',        en: '📊 KPI by Dept' },
    'kpi.forecast':        { th: '📈 พยากรณ์ / ปรับแผน',    en: '📈 Forecast / Revised' },

    // -- SM (Sales & Marketing) sub-tabs --
    'sm.products':         { th: '📋 รายการสินค้า',         en: '📋 Product List' },
    'sm.quality':          { th: '🔍 คุณภาพสินค้า',         en: '🔍 Product Quality' },
    'sm.workflow':         { th: '🔄 ขั้นตอนการทำงาน',      en: '🔄 Workflow' },
    'sm.performance':      { th: '📈 ผลงานเซลล์',          en: '📈 Sales Performance' },
    'sm.forecast':         { th: '📊 พยากรณ์ / ปรับแผน',    en: '📊 Forecast / Revised' },
    'sm.kpi':              { th: '🎯 ตัวชี้วัด',            en: '🎯 KPI' },
    'sm.expense':          { th: '💼 ค่าใช้จ่าย',           en: '💼 Expenses' },
    'sm.leave':            { th: '📅 ลงวันหยุด',            en: '📅 Leave' },
    'sm.hr':               { th: '👥 ข้อมูลบุคลากร',        en: '👥 HR Data' },
    'sm.customer':         { th: '👥 ข้อมูลลูกค้า',         en: '👥 Customer Data' },
    'sm.jd':               { th: '📋 รายละเอียดงาน',        en: '📋 Job Description' },

    // -- Admin sub-tabs --
    'adm.kpi':             { th: '🎯 ตัวชี้วัด',            en: '🎯 KPI Settings' },
    'adm.sm.sales':        { th: '💼 ค่าใช้จ่ายเซลล์',      en: '💼 Sales Expenses' },
    'adm.sm.fda':          { th: '🏷️ ค่าจดทะเบียน อ.ย.',    en: '🏷️ FDA Registration' },
    'adm.sm.sample':       { th: '🧪 ค่าสินค้าตัวอย่าง',    en: '🧪 Sample Products' },
    'adm.sm.supply':       { th: '📦 ของใช้ในแผนก',          en: '📦 Dept Supplies' },

    // -- MT BI sidebar --
    'mtbi.nav':            { th: 'Navigation',           en: 'Navigation' },
    'mtbi.dashboard':      { th: 'แดชบอร์ด',             en: 'Dashboard' },
    'mtbi.dashboard.overview': { th: 'ภาพรวม',           en: 'Overview' },
    'mtbi.sales':          { th: 'ยอดขาย',               en: 'Sales' },
    'mtbi.sales-perf':     { th: 'ผลงานยอดขาย',          en: 'Sales Performance' },
    'mtbi.sales-target':   { th: 'เป้าหมายยอดขาย',       en: 'Sales Target' },
    'mtbi.customer':       { th: 'ลูกค้า',                en: 'Customers' },
    'mtbi.customer-mgmt':  { th: 'จัดการลูกค้า',          en: 'Customer Management' },
    'mtbi.product':        { th: 'สินค้า',                en: 'Products' },
    'mtbi.product-perf':   { th: 'ผลงานสินค้า',           en: 'Product Performance' },
    'mtbi.competitor':     { th: 'คู่แข่ง',               en: 'Competitors' },
    'mtbi.promo':          { th: 'โปรโมชั่น',             en: 'Promotions' },
    'mtbi.promotion':      { th: 'โปรโมชั่น',             en: 'Promotions' },
    'mtbi.supply':         { th: 'ซัพพลายเชน',           en: 'Supply Chain' },
    'mtbi.order':          { th: 'คำสั่งซื้อ',            en: 'Orders' },
    'mtbi.delivery':       { th: 'การจัดส่ง',             en: 'Delivery' },
    'mtbi.claim':          { th: 'เคลม / ข้อร้องเรียน',   en: 'Claims / Complaints' },
    'mtbi.report':         { th: 'ตัวชี้วัด & รายงาน',    en: 'KPI & Reports' },
    'mtbi.kpi':            { th: 'ตัวชี้วัด',             en: 'KPI' },
    'mtbi.forecast':       { th: 'พยากรณ์',              en: 'Forecast' },
    'mtbi.ai':             { th: 'วิเคราะห์ AI',          en: 'AI Analytics' },
    'mtbi.ai-analytics':   { th: 'วิเคราะห์ AI ⭐',       en: 'AI Analytics ⭐' },
    'mtbi.dataupdate':     { th: 'อัพเดทข้อมูล',          en: 'Data Update' },
    'mtbi.data-update':    { th: 'อัพเดทข้อมูล',          en: 'Data Update' },

    // -- Role labels --
    'role.admin':          { th: 'ผู้ดูแลระบบ',            en: 'Admin' },
    'role.manager':        { th: 'ผู้จัดการ',              en: 'Manager' },
    'role.sales':          { th: 'ฝ่ายขาย',               en: 'Sales' },
    'role.viewer':         { th: 'ผู้ดูรายงาน',            en: 'Viewer' },

    // -- Common terms used in dynamic rendering --
    'common.total':        { th: 'รวม',                   en: 'Total' },
    'common.month':        { th: 'เดือน',                  en: 'Month' },
    'common.year':         { th: 'ปี',                     en: 'Year' },
    'common.target':       { th: 'เป้าหมาย',              en: 'Target' },
    'common.actual':       { th: 'จริง',                   en: 'Actual' },
    'common.budget':       { th: 'งบประมาณ',              en: 'Budget' },
    'common.achievement':  { th: 'ผลสำเร็จ',              en: 'Achievement' },
    'common.diff':         { th: 'ส่วนต่าง',              en: 'Difference' },
    'common.growth':       { th: 'เติบโต',                en: 'Growth' },
    'common.pcs':          { th: 'ชิ้น',                   en: 'pcs' },
    'common.baht':         { th: 'บาท',                   en: 'THB' },
    'common.million':      { th: 'ล้านบาท',               en: 'M THB' },
    'common.percent':      { th: '%',                      en: '%' },
    'common.rank':         { th: 'อันดับ',                 en: 'Rank' },
    'common.name':         { th: 'ชื่อ',                   en: 'Name' },
    'common.product':      { th: 'สินค้า',                 en: 'Product' },
    'common.channel':      { th: 'ช่องทาง',               en: 'Channel' },
    'common.customer':     { th: 'ลูกค้า',                 en: 'Customer' },
    'common.staff':        { th: 'พนักงาน',                en: 'Staff' },
    'common.zone':         { th: 'เขต/โซน',               en: 'Zone' },
    'common.bills':        { th: 'จำนวนบิล',              en: 'Bills' },
    'common.pieces':       { th: 'จำนวนชิ้น',             en: 'Pieces' },
    'common.calls':        { th: 'จำนวนโทร',              en: 'Calls' },
    'common.closedSale':   { th: 'ปิดการขาย',             en: 'Closed Sales' },
    'common.conversion':   { th: 'Conversion',            en: 'Conversion' },
    'common.errors':       { th: 'ข้อผิดพลาด',            en: 'Errors' },
    'common.sortBy':       { th: 'เรียงตาม:',             en: 'Sort by:' },
    'common.forecast':     { th: 'พยากรณ์',               en: 'Forecast' },
    'common.revised':      { th: 'ปรับแผน',               en: 'Revised' },
    'common.weekly':       { th: 'รายสัปดาห์',             en: 'Weekly' },
    'common.monthly':      { th: 'รายเดือน',               en: 'Monthly' },
    'common.compare3yr':   { th: '📊 เปรียบเทียบยอดขาย 3 ปี', en: '📊 3-Year Sales Comparison' },
    'common.salesPerf':    { th: 'ผลงานยอดขาย',           en: 'Sales Performance' },
    'common.overview':     { th: 'ภาพรวม',                en: 'Overview' },
    'common.ytdSummary':   { th: '📊 สรุปภาพรวม YTD',      en: '📊 YTD Summary' },
    'common.updateData':   { th: 'อัพเดทข้อมูล',           en: 'Update Data' },

    // -- Months (short) --
    'month.1':  { th: 'ม.ค.',  en: 'Jan' },
    'month.2':  { th: 'ก.พ.',  en: 'Feb' },
    'month.3':  { th: 'มี.ค.', en: 'Mar' },
    'month.4':  { th: 'เม.ย.', en: 'Apr' },
    'month.5':  { th: 'พ.ค.',  en: 'May' },
    'month.6':  { th: 'มิ.ย.', en: 'Jun' },
    'month.7':  { th: 'ก.ค.',  en: 'Jul' },
    'month.8':  { th: 'ส.ค.',  en: 'Aug' },
    'month.9':  { th: 'ก.ย.',  en: 'Sep' },
    'month.10': { th: 'ต.ค.',  en: 'Oct' },
    'month.11': { th: 'พ.ย.',  en: 'Nov' },
    'month.12': { th: 'ธ.ค.',  en: 'Dec' }
  };

  // ---- Translation function ----
  function _t(key) {
    var entry = DICT[key];
    if (!entry) return key;
    return entry[_lang] || entry['th'] || key;
  }

  // ---- Get/Set language ----
  function getLang() { return _lang; }

  function setLang(lang) {
    if (lang !== 'th' && lang !== 'en') return;
    _lang = lang;
    window._lang = lang;
    localStorage.setItem('spbi_lang', lang);
    _applyLang();
  }

  function toggleLang() {
    setLang(_lang === 'th' ? 'en' : 'th');
  }

  // ---- Apply language to all tagged elements ----
  function _applyLang() {
    // 1. Static elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      el.textContent = _t(key);
    });

    // 2. Placeholder / title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.title = _t(el.getAttribute('data-i18n-title'));
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.placeholder = _t(el.getAttribute('data-i18n-placeholder'));
    });

    // 3. Rebuild sidebar menu
    _rebuildSidebar();

    // 4. Update topbar title for active tab
    _updateTopbarTitle();

    // 5. Re-render MT BI sidebar if visible
    if (typeof mtBiRenderSidebar === 'function') {
      try { mtBiRenderSidebar(); } catch (e) {}
    }

    // 6. Update lang toggle button state
    var btn = document.getElementById('langToggleBtn');
    if (btn) btn.textContent = _lang === 'th' ? 'EN' : 'TH';

    // 6. Update html lang attribute
    document.documentElement.lang = _lang === 'th' ? 'th' : 'en';
  }

  // ---- Rebuild sidebar from MENU ----
  function _rebuildSidebar() {
    var nav = document.getElementById('sidebarNav');
    if (!nav) return;
    var MENU = window._i18nMENU;
    if (!MENU) return;

    var activeTab = null;
    var activeLink = nav.querySelector('.nav-link.active');
    if (activeLink) activeTab = activeLink.getAttribute('data-tab');

    var html = '';
    MENU.forEach(function (item) {
      var label = _t('menu.' + item.id);
      var active = item.id === (activeTab || 'overview') ? ' active' : '';
      var minAttr = item.minRole ? ' data-min="' + item.minRole + '"' : '';
      if (item.children) {
        var isOpen = false;
        var groupEl = nav.querySelector('[data-group="' + item.id + '"]');
        if (groupEl) isOpen = groupEl.classList.contains('open');
        html += '<div class="nav-group' + (isOpen ? ' open' : '') + '" data-group="' + item.id + '">';
        html += '<button class="nav-group-head" onclick="toggleNavGroup(this)">'
          + '<span class="nav-ico">' + item.icon + '</span>'
          + '<span class="nav-txt">' + label + '</span>'
          + '<span class="nav-caret">▶</span>'
          + '</button>';
        html += '<div class="nav-group-children">';
        item.children.forEach(function (child) {
          var chActive = '';
          var oldChLink = nav.querySelector('[data-ch="' + child.ch + '"]');
          if (oldChLink && oldChLink.classList.contains('active')) chActive = ' active';
          html += '<a class="nav-link' + chActive + '" data-tab="' + child.id + '" data-ch="' + child.ch + '" href="javascript:void(0)"'
            + ' onclick="shellNavClickCh(this,\'' + child.id + '\',\'' + child.ch + '\')">'
            + '<span class="nav-ico">' + child.icon + '</span>'
            + '<span class="nav-txt">' + child.label + '</span>'
            + '</a>';
        });
        html += '</div></div>';
      } else {
        html += '<a class="nav-link' + active + '" data-tab="' + item.id + '" href="javascript:void(0)" '
          + minAttr
          + ' onclick="shellNavClick(this,\'' + item.id + '\')">'
          + '<span class="nav-icon">' + item.icon + '</span>'
          + '<span class="nav-txt">' + label + '</span>'
          + '<span class="nav-bell" id="bell-' + item.id + '"></span>'
          + '</a>';
      }
    });
    nav.innerHTML = html;

    // Re-apply RBAC if available
    if (typeof applyRBAC === 'function' && window.__spbiSession) {
      applyRBAC(window.__spbiSession.role || 'viewer');
    }
  }

  // ---- Update topbar title for current active menu ----
  function _updateTopbarTitle() {
    var title = document.getElementById('tbPageTitle');
    if (!title) return;
    var activeLink = document.querySelector('#sidebarNav .nav-link.active');
    if (!activeLink) return;
    var tabId = activeLink.getAttribute('data-tab');
    if (!tabId) return;
    var MENU = window._i18nMENU;
    if (!MENU) return;
    var item = MENU.find(function (m) { return m.id === tabId; });
    if (item) title.textContent = _t('menu.' + item.id);
  }

  // ---- Expose globally ----
  window._t = _t;
  window._lang = _lang;
  window.getLang = getLang;
  window.setLang = setLang;
  window.toggleLang = toggleLang;
  window._applyLang = _applyLang;
  window.I18N_DICT = DICT;

  // ---- Initialize on DOM ready ----
  document.addEventListener('DOMContentLoaded', function () {
    // Inject lang toggle button into topbar
    var tbRight = document.querySelector('.tb-right');
    if (tbRight) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'langToggleBtn';
      btn.className = 'hbadge lang-toggle';
      btn.textContent = _lang === 'th' ? 'EN' : 'TH';
      btn.title = 'Switch language / สลับภาษา';
      btn.onclick = function () { toggleLang(); };
      btn.style.cssText = 'cursor:pointer;font-weight:700;font-size:12px;min-width:38px;text-align:center;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;border:none;border-radius:20px;padding:4px 12px;letter-spacing:.5px';
      tbRight.insertBefore(btn, tbRight.firstChild);
    }

    // Apply initial language after a tick (so shell.js has built the sidebar)
    setTimeout(function () {
      if (_lang !== 'th') _applyLang();
    }, 100);
  });

})();
