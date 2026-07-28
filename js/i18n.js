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

    // -- AI sub-tabs --
    'ov.ai':               { th: '🤖 วิเคราะห์ AI',        en: '🤖 AI Analytics' },
    'bth.ai':              { th: '🤖 วิเคราะห์ AI',        en: '🤖 AI Analytics' },
    'ol.ai':               { th: '🤖 วิเคราะห์ AI',        en: '🤖 AI Analytics' },
    'ord.ai':              { th: '🤖 วิเคราะห์ AI',        en: '🤖 AI Analytics' },
    'sm.ai':               { th: '🤖 วิเคราะห์ AI',        en: '🤖 AI Analytics' },
    'sm.delist':           { th: '⚠️ สินค้าเสี่ยงถอด',     en: '⚠️ Delist Risk' },

    // -- Role labels (extended) --
    'role.leader':         { th: 'หัวหน้างาน',              en: 'Leader' },
    'role.officer':        { th: 'เจ้าหน้าที่',             en: 'Officer' },

    // -- Filter bar --
    'filter.period':       { th: '📅 ช่วงเวลา:',           en: '📅 Period:' },
    'filter.all':          { th: 'ทั้งหมด',                 en: 'All' },
    'filter.thisMonth':    { th: 'เดือนนี้',                en: 'This Month' },
    'filter.lastMonth':    { th: 'เดือนที่แล้ว',            en: 'Last Month' },
    'filter.3months':      { th: '3 เดือน',                 en: '3 Months' },
    'filter.quarterly':    { th: '📆 รายไตรมาส',            en: '📆 Quarterly' },
    'filter.monthly':      { th: '📅 รายเดือน',             en: '📅 Monthly' },
    'filter.yearly':       { th: '📅 รายปี',                en: '📅 Yearly' },
    'filter.clear':        { th: '✕ ล้าง',                  en: '✕ Clear' },
    'filter.year':         { th: '📅 ปี',                    en: '📅 Year' },

    // -- KPI card labels (Overview) --
    'kpi.targetYTD':       { th: 'เป้าหมาย (YTD)',          en: 'Target (YTD)' },
    'kpi.actualYTD':       { th: 'ยอดจริง (YTD)',           en: 'Actual (YTD)' },
    'kpi.targetYear':      { th: 'เป้าหมายทั้งปี',          en: 'Annual Target' },
    'kpi.diff':            { th: 'ส่วนต่าง',                en: 'Difference' },
    'kpi.achieved':        { th: 'สำเร็จ',                  en: 'Achieved' },
    'kpi.shortfall':       { th: 'ขาด',                     en: 'Shortfall' },
    'kpi.ytdFull':         { th: 'ปี 2569 ทั้งปี',          en: 'Year 2026 Full' },

    // -- Chart / card titles (Overview) --
    'chart.budgetVsActual':    { th: 'งบประมาณ vs จริง รายเดือน (ล้านบาท)', en: 'Budget vs Actual Monthly (M THB)' },
    'chart.trendMonthly':      { th: '📈 TREND รายเดือน (ล้านบาท)',         en: '📈 Monthly TREND (M THB)' },
    'chart.actualShare':       { th: '🍩 สัดส่วน ACTUAL รายเดือน',          en: '🍩 Monthly ACTUAL Share' },
    'chart.tableMonthly':      { th: 'ตารางรายเดือน',                       en: 'Monthly Table' },
    'chart.channelTrend':      { th: 'แนวโน้มยอดจริงรายช่องทาง รายเดือน (ล้านบาท)', en: 'Channel Actual Trend Monthly (M THB)' },
    'chart.channelSplit':      { th: '📈 แนวโน้มรายเดือน — แยกตามช่องทาง',  en: '📈 Monthly Trend — by Channel' },
    'chart.channelCompare':    { th: '📋 ตารางเปรียบเทียบรายเดือน',          en: '📋 Monthly Comparison Table' },
    'chart.gapMonthly':        { th: 'ส่วนต่าง (เป้าหมาย – ยอดจริง) รายเดือน', en: 'Gap (Target – Actual) Monthly' },
    'chart.dailyAvg':          { th: '📋 ตารางยอดขายเฉลี่ยต่อวัน รายเดือน', en: '📋 Daily Average Sales by Month' },
    'chart.customerSummary':   { th: 'สรุปรายเดือนตามลูกค้า (ม.ค.–มิ.ย.) — งบประมาณ vs จริง (ล้านบาท)', en: 'Monthly by Customer (Jan–Jun) — Budget vs Actual (M THB)' },

    // -- Channel warning section --
    'warn.belowTarget':        { th: '⚠️ ช่องทางที่ยอดขายต่ำกว่าเป้าหมาย', en: '⚠️ Channels Below Target' },
    'warn.shortfall':          { th: 'ขาดเป้า',             en: 'Shortfall' },
    'warn.shortPct':           { th: 'ขาด',                 en: 'Short' },
    'warn.targetLabel':        { th: 'เป้า:',               en: 'Target:' },
    'warn.actualLabel':        { th: 'Actual:',             en: 'Actual:' },

    // -- Status / Badges --
    'status.active':           { th: 'เปิดใช้',             en: 'Active' },
    'status.inactive':         { th: 'ปิดใช้',              en: 'Inactive' },
    'status.good':             { th: '✅ ดี',                en: '✅ Good' },
    'status.belowTarget':      { th: '🔴 ต่ำกว่าเป้า',      en: '🔴 Below Target' },
    'status.warning':          { th: '⚠️ ใกล้เป้า',         en: '⚠️ Near Target' },

    // -- Table headers (common) --
    'th.no':                   { th: '#',                    en: '#' },
    'th.channel':              { th: 'ช่องทาง',              en: 'Channel' },
    'th.salesYTD':             { th: 'ยอดขาย YTD',          en: 'Sales YTD' },
    'th.targetYTD':            { th: 'เป้า YTD',             en: 'Target YTD' },
    'th.achieve':              { th: 'ถึงเป้า',              en: 'Achievement' },
    'th.status':               { th: 'สถานะ',               en: 'Status' },
    'th.product':              { th: 'สินค้า',               en: 'Product' },
    'th.amount':               { th: 'จำนวน',               en: 'Qty' },
    'th.value':                { th: 'มูลค่า',               en: 'Value' },
    'th.trend':                { th: 'แนวโน้ม',              en: 'Trend' },
    'th.action':               { th: 'จัดการ',               en: 'Action' },
    'th.user':                 { th: 'ผู้ใช้',               en: 'User' },
    'th.role':                 { th: 'Role',                 en: 'Role' },
    'th.menuAccess':           { th: 'สิทธิ์เข้าถึงเมนู',    en: 'Menu Access' },
    'th.manage':               { th: 'จัดการ',               en: 'Manage' },

    // -- Buttons --
    'btn.edit':                { th: '✏️ แก้ไข',             en: '✏️ Edit' },
    'btn.delete':              { th: '🗑️ ลบ',               en: '🗑️ Delete' },
    'btn.add':                 { th: '➕ เพิ่ม',             en: '➕ Add' },
    'btn.save':                { th: '💾 บันทึก',            en: '💾 Save' },
    'btn.cancel':              { th: 'ยกเลิก',              en: 'Cancel' },
    'btn.reset':               { th: '↺ รีเซ็ตกลับค่าเดิม',  en: '↺ Reset to Default' },
    'btn.addUser':             { th: '➕ เพิ่มผู้ใช้',        en: '➕ Add User' },
    'btn.download':            { th: '⬇️ ดาวน์โหลด',        en: '⬇️ Download' },
    'btn.refresh':             { th: '🔄 รีเฟรช',           en: '🔄 Refresh' },
    'btn.login':               { th: 'เข้าสู่ระบบ',          en: 'Login' },
    'btn.logout':              { th: 'ออกจากระบบ',          en: 'Logout' },

    // -- Data upload cards --
    'upload.actualSales':      { th: '📊 อัปโหลดข้อมูลยอดขายจริง',  en: '📊 Upload Actual Sales' },
    'upload.actualDesc':       { th: 'ยอดขายจริงรายเดือน แยกตามช่องทาง/ลูกค้า/รายวัน', en: 'Monthly actual sales by channel/customer/day' },
    'upload.targetSales':      { th: '🎯 อัปโหลดเป้ายอดขาย',        en: '🎯 Upload Sales Target' },
    'upload.targetDesc':       { th: 'เป้ายอดขายรายเดือน แยกตามช่องทาง/ลูกค้า',  en: 'Monthly target by channel/customer' },
    'upload.staffSales':       { th: '👤 อัปโหลดยอดขายพนักงาน',     en: '👤 Upload Staff Sales' },
    'upload.staffDesc':        { th: 'ยอดขายจริง/เป้าหมาย แยกพนักงานรายเดือน',   en: 'Actual/target by staff monthly' },

    // -- AI Analysis --
    'ai.title':                { th: '🤖 วิเคราะห์ AI',     en: '🤖 AI Analytics' },
    'ai.autoAnalysis':         { th: 'วิเคราะห์อัตโนมัติจากข้อมูลจริง', en: 'Automatic analysis from real data' },
    'ai.schedule':             { th: '⏰ ความถี่วิเคราะห์:',  en: '⏰ Analysis frequency:' },
    'ai.lastUpdate':           { th: 'อัปเดตล่าสุด:',        en: 'Last update:' },
    'ai.insights':             { th: 'ข้อมูลเชิงลึก',        en: 'Insights' },
    'ai.alerts':               { th: 'แจ้งเตือนยอดตก',       en: 'Decline Alerts' },
    'ai.growth':               { th: 'โอกาสเติบโต',          en: 'Growth Opportunities' },
    'ai.achieveYTD':           { th: 'ถึงเป้า YTD',          en: 'YTD Achievement' },
    'ai.channelRank':          { th: 'อันดับช่องทาง — ยอดขาย YTD', en: 'Channel Ranking — YTD Sales' },
    'ai.recommend':            { th: '💡 คำแนะนำ',           en: '💡 Recommendations' },
    'ai.belowTarget':          { th: 'ต่ำกว่าเป้า',          en: 'Below target' },
    'ai.aboveTarget':          { th: 'เกินเป้า',             en: 'Above target' },
    'ai.declining':            { th: 'ยอดลดลง',              en: 'Declining' },
    'ai.noData':               { th: 'ยังไม่มีข้อมูลเพียงพอสำหรับวิเคราะห์', en: 'Insufficient data for analysis' },
    'ai.items':                { th: 'รายการ',                en: 'items' },
    'ai.products':             { th: 'สินค้า',               en: 'products' },
    'ai.overview':             { th: '🤖 วิเคราะห์ AI — ภาพรวมยอดขาย', en: '🤖 AI Analytics — Sales Overview' },
    'ai.ordering':             { th: '🤖 วิเคราะห์ AI — ธุรการขาย',    en: '🤖 AI Analytics — Sales Admin' },
    'ai.sm':                   { th: '🤖 วิเคราะห์ AI — ฝ่ายขาย & การตลาด', en: '🤖 AI Analytics — Sales & Marketing' },

    // -- Notification bell --
    'notif.title':             { th: '🔔 การแจ้งเตือน',      en: '🔔 Notifications' },
    'notif.none':              { th: '✅ ไม่มีการแจ้งเตือน',   en: '✅ No notifications' },
    'notif.sales':             { th: '📊 ยอดขาย',            en: '📊 Sales' },
    'notif.booth':             { th: '🏕️ บูธ',              en: '🏕️ Booth' },
    'notif.delist':            { th: '⚠️ สินค้าเสี่ยง',      en: '⚠️ Delist Risk' },
    'notif.quality':           { th: '🔬 คุณภาพ',            en: '🔬 Quality' },
    'notif.ordering':          { th: '📞 ธุรการขาย',         en: '📞 Sales Admin' },
    'notif.ai':                { th: '🤖 วิเคราะห์ AI',      en: '🤖 AI Analytics' },

    // -- Admin panel --
    'admin.masterData':        { th: '⚙️ แผงจัดการข้อมูลหลัก (Master Data)', en: '⚙️ Master Data Management Panel' },
    'admin.masterNote':        { th: 'การแก้ไขจะถูกเก็บเป็น override ใน localStorage แล้ว merge ทับข้อมูลตั้งต้นตอนโหลด ทุกชุดข้อมูลมีปุ่ม "รีเซ็ตกลับค่าเดิม"', en: 'Edits are stored as overrides in localStorage and merged over defaults on load. Every data set has a "Reset to default" button.' },
    'admin.rolesTitle':        { th: '🔐 จัดการผู้ใช้ / สิทธิ์การเข้าถึง', en: '🔐 User / Access Management' },
    'admin.rolesWarn':         { th: '⚠️ นี่คือระบบล็อกอินเดโมฝั่ง client — การเปลี่ยนสิทธิ์จะมีผลเมื่อผู้ใช้นั้น login ครั้งถัดไป', en: '⚠️ This is a client-side demo login — permission changes take effect on the user\'s next login' },

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
    'month.12': { th: 'ธ.ค.',  en: 'Dec' },

    // -- Months (full) --
    'monthFull.1':  { th: 'มกราคม',    en: 'January' },
    'monthFull.2':  { th: 'กุมภาพันธ์',  en: 'February' },
    'monthFull.3':  { th: 'มีนาคม',    en: 'March' },
    'monthFull.4':  { th: 'เมษายน',    en: 'April' },
    'monthFull.5':  { th: 'พฤษภาคม',   en: 'May' },
    'monthFull.6':  { th: 'มิถุนายน',    en: 'June' },
    'monthFull.7':  { th: 'กรกฎาคม',   en: 'July' },
    'monthFull.8':  { th: 'สิงหาคม',    en: 'August' },
    'monthFull.9':  { th: 'กันยายน',    en: 'September' },
    'monthFull.10': { th: 'ตุลาคม',    en: 'October' },
    'monthFull.11': { th: 'พฤศจิกายน',  en: 'November' },
    'monthFull.12': { th: 'ธันวาคม',    en: 'December' },

    // -- Sub-tab labels (sidebar / breadcrumb) --
    'sub.ov-main':     { th: 'งบประมาณ vs จริง',   en: 'Budget vs Actual' },
    'sub.ov-channel':  { th: 'ช่องทางการขาย',       en: 'Sales Channels' },
    'sub.ov-trend':    { th: 'แนวโน้มรายเดือน',     en: 'Monthly Trend' },
    'sub.ov-daily':    { th: 'รายวัน',              en: 'Daily' },
    'sub.ov-customer': { th: 'ลูกค้า',              en: 'Customers' },
    'sub.ov-sales':    { th: 'พนักงานขาย',          en: 'Sales Staff' },
    'sub.ov-ai':       { th: 'วิเคราะห์ AI',        en: 'AI Analytics' },
    'sub.ov-update':   { th: 'อัพเดทข้อมูล',        en: 'Data Update' },
    'sub.bth-info':    { th: 'ข้อมูลบูธ',           en: 'Booth Info' },
    'sub.bth-sales':   { th: 'ยอดขายรวม',          en: 'Total Sales' },
    'sub.bth-stock':   { th: 'สต็อกบูธ',            en: 'Booth Stock' },
    'sub.bth-cost':    { th: 'ต้นทุนค่าใช้จ่าย',     en: 'Cost & Expenses' },
    'sub.bth-product': { th: 'สินค้า',              en: 'Products' },
    'sub.bth-return':  { th: 'ของคืน - ของเสีย',    en: 'Returns & Defects' },
    'sub.bth-promo':   { th: 'โปรโมชั่น',           en: 'Promotions' },
    'sub.bth-perf':    { th: 'ผลงานรายสาขา',       en: 'Branch Performance' },
    'sub.bth-ai':      { th: 'วิเคราะห์ AI',        en: 'AI Analytics' },
    'sub.bth-update':  { th: 'อัพเดทข้อมูล',        en: 'Data Update' },
    'sub.ol-sales':      { th: 'ยอดขาย',            en: 'Sales' },
    'sub.ol-ads':        { th: 'ADS & Campaign',    en: 'ADS & Campaign' },
    'sub.ol-influencer': { th: 'อินฟลูเอนเซอร์',    en: 'Influencers' },
    'sub.ol-shipping':   { th: 'ค่าขนส่ง',          en: 'Shipping Cost' },
    'sub.ol-cod':        { th: 'COD',               en: 'COD' },
    'sub.ol-return':     { th: 'สินค้าตีกลับ',       en: 'Returns' },
    'sub.ol-claim':      { th: 'ออเดอร์เคลม',       en: 'Order Claims' },
    'sub.ol-cancel':     { th: 'ยกเลิก',            en: 'Cancelled' },
    'sub.ol-supply':     { th: 'วัสดุสิ้นเปลือง',     en: 'Supplies' },
    'sub.ol-cost':       { th: 'ต้นทุนขายสินค้า',    en: 'COGS' },
    'sub.ol-prodrank':   { th: 'รายการขายสินค้า',    en: 'Product Sales List' },
    'sub.ol-ai':         { th: 'วิเคราะห์ AI',       en: 'AI Analytics' },
    'sub.ol-dataupdate': { th: 'อัพเดทข้อมูล',      en: 'Data Update' },
    'sub.ord-staff':     { th: 'พนักงาน & เขต',     en: 'Staff & Territory' },
    'sub.ord-bills':     { th: 'จำนวนบิล',          en: 'Bill Count' },
    'sub.ord-checklist': { th: 'เช็คลิสลูกค้า',      en: 'Customer Checklist' },
    'sub.ord-errors':    { th: 'ผิดพลาด & เคลม',   en: 'Errors & Claims' },
    'sub.ord-calls':     { th: 'การโทรลูกค้า',       en: 'Customer Calls' },
    'sub.ord-manual':    { th: 'คู่มือการทำงาน',     en: 'Work Manual' },
    'sub.ord-perf':      { th: 'ผลงานรายคน',       en: 'Individual Performance' },
    'sub.sm-products':    { th: 'รายการสินค้า',      en: 'Products' },
    'sub.sm-quality':     { th: 'คุณภาพสินค้า',      en: 'Product Quality' },
    'sub.sm-workflow':    { th: 'ขั้นตอนการทำงาน',   en: 'Workflow' },
    'sub.sm-performance': { th: 'ผลงานเซลล์',      en: 'Sales Performance' },
    'sub.sm-kpi':        { th: 'ตัวชี้วัด',           en: 'KPI' },
    'sub.sm-expense':    { th: 'ค่าใช้จ่าย',         en: 'Expenses' },
    'sub.sm-leave':      { th: 'ลงวันหยุด',         en: 'Leave' },
    'sub.sm-hr':         { th: 'ข้อมูลบุคลากร',      en: 'Staff Info' },
    'sub.sm-delist':     { th: 'สินค้าเสี่ยงถอด',     en: 'Delist Risk' },
    'sub.sm-jd':         { th: 'รายละเอียดงาน',     en: 'Job Description' },
    'sub.sm-docs':       { th: 'ศูนย์เอกสาร',        en: 'Document Center' },
    'sm.docs':           { th: '📂 ศูนย์เอกสาร',      en: '📂 Document Center' },
    'sub.sm-ai':         { th: 'วิเคราะห์ AI',       en: 'AI Analytics' },
    'sub.adm-staff':      { th: 'พนักงาน',          en: 'Staff' },
    'sub.adm-prod':       { th: 'สินค้า',            en: 'Products' },
    'sub.adm-sales':      { th: 'ยอดขาย',           en: 'Sales' },
    'sub.adm-roles':      { th: 'ผู้ใช้/สิทธิ์',       en: 'Users/Roles' },
    'sub.adm-leave':      { th: 'วันหยุด',           en: 'Leave' },
    'sub.adm-guide':      { th: 'คู่มือ',             en: 'Guide' },
    'sub.adm-complaints': { th: 'ปัญหาจากลูกค้า',   en: 'Customer Complaints' },
    'sub.adm-sm-sales':   { th: 'ค่าใช้จ่ายเซลล์',    en: 'Sales Expenses' },
    'sub.adm-sm-fda':     { th: 'จดทะเบียน อ.ย.',   en: 'FDA Registration' },
    'sub.adm-sm-sample':  { th: 'สินค้าตัวอย่าง',    en: 'Sample Products' },
    'sub.adm-sm-supply':  { th: 'ของใช้ในแผนก',     en: 'Dept. Supplies' },
    'sub.All':            { th: 'ทุกช่องทาง',         en: 'All Channels' }
  };

  // ---- Translation function ----
  function _t(key, fallback) {
    var entry = DICT[key];
    if (!entry) return fallback !== undefined ? fallback : key;
    return entry[_lang] || entry['th'] || (fallback !== undefined ? fallback : key);
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

    // 7. Update html lang attribute
    document.documentElement.lang = _lang === 'th' ? 'th' : 'en';

    // 8. Re-render dynamic content for the active tab
    _rerenderActiveContent();
  }

  function _rerenderActiveContent() {
    var activeSection = document.querySelector('.section[style*="display: block"], .section[style*="display:block"], .section.active');
    if (!activeSection) return;
    var id = activeSection.id || '';
    var tabName = id.replace('tab-', '');

    try {
      if (tabName === 'overview') {
        if (typeof renderOverview === 'function') renderOverview();
      } else if (tabName === 'mt') {
        if (typeof mtBiRenderSidebar === 'function') mtBiRenderSidebar();
      } else if (tabName === 'booth') {
        var activeBthSub = activeSection.querySelector('.sub-section[style*="display: block"], .sub-section[style*="display:block"]');
        if (activeBthSub && activeBthSub.id === 'bth-ai' && typeof renderBoothAI === 'function') renderBoothAI();
      } else if (tabName === 'online') {
        var activeOlSub = activeSection.querySelector('.sub-section[style*="display: block"], .sub-section[style*="display:block"]');
        if (activeOlSub && activeOlSub.id === 'ol-ai' && typeof renderOnlineAI === 'function') renderOnlineAI();
      } else if (tabName === 'admin') {
        var activeAdmSub = activeSection.querySelector('.sub-section[style*="display: block"], .sub-section[style*="display:block"]');
        if (activeAdmSub && activeAdmSub.id === 'adm-roles' && typeof renderAdminRoles === 'function') renderAdminRoles();
      }
      if (typeof refreshNotifications === 'function') refreshNotifications();
    } catch (e) {}
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
          + '<span class="nav-txt" data-i18n="menu.' + item.id + '">' + label + '</span>'
          + '<span class="nav-caret">▶</span>'
          + '</button>';
        html += '<div class="nav-group-children">';
        item.children.forEach(function (child) {
          var chActive = '';
          var childMin = child.minRole ? ' data-min="' + child.minRole + '"' : '';
          var rbacClass = child.rbac ? ' ' + child.rbac : '';
          var oldChLink = nav.querySelector('[data-sub="' + child.sub + '"]');
          if (oldChLink && oldChLink.classList.contains('active')) chActive = ' active';
          var subLabel = _t('sub.' + child.sub, child.label);
          html += '<a class="nav-link' + chActive + rbacClass + '" data-tab="' + item.id
            + '" data-sub="' + child.sub + '" href="javascript:void(0)"'
            + childMin
            + ' onclick="shellNavClickSub(this,\'' + item.id + '\',\'' + child.sub.replace(/'/g, "\\'") + '\')">'
            + '<span class="nav-ico">' + child.icon + '</span>'
            + '<span class="nav-txt" data-i18n="sub.' + child.sub + '">' + subLabel + '</span>'
            + '</a>';
        });
        html += '</div></div>';
      } else {
        html += '<a class="nav-link' + active + '" data-tab="' + item.id + '" href="javascript:void(0)" '
          + minAttr
          + ' onclick="shellNavClick(this,\'' + item.id + '\')">'
          + '<span class="nav-ico">' + item.icon + '</span>'
          + '<span class="nav-txt" data-i18n="menu.' + item.id + '">' + label + '</span>'
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

      // Inject dark/light theme toggle button
      var themeBtn = document.createElement('button');
      themeBtn.type = 'button';
      themeBtn.id = 'themeToggleBtn';
      themeBtn.className = 'theme-toggle';
      themeBtn.title = 'สลับโทนสี กลางวัน/กลางคืน';
      var savedTheme = localStorage.getItem('spbi-theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
      themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
      themeBtn.onclick = function () {
        var cur = document.documentElement.getAttribute('data-theme') || 'light';
        var next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('spbi-theme', next);
        themeBtn.textContent = next === 'dark' ? '☀️' : '🌙';
      };
      var bellEl = document.getElementById('topbarBell');
      if (bellEl) {
        tbRight.insertBefore(themeBtn, bellEl);
      } else {
        tbRight.insertBefore(themeBtn, tbRight.firstChild);
      }
    }

    // Apply initial language after a tick (so shell.js has built the sidebar)
    setTimeout(function () {
      if (_lang !== 'th') _applyLang();
    }, 100);
  });

})();
