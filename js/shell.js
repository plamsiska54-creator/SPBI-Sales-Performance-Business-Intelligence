// ============================================================
// SHELL.JS — Sidebar navigation + TopBar helpers
// Depends on: app.js (showTab, updateTabBells)
// ============================================================

(function () {
  'use strict';

  // ---- Menu configuration (config-driven, with sub-tab children) ----
  var MENU = [
    { id: 'overview', icon: '📊', label: 'ภาพรวมยอดขาย', children: [
      { sub: 'ov-main',     icon: '📊', label: 'งบประมาณ vs จริง' },
      { sub: 'ov-channel',  icon: '📦', label: 'ช่องทางการขาย' },
      { sub: 'ov-trend',    icon: '📈', label: 'แนวโน้มรายเดือน' },
      { sub: 'ov-daily',    icon: '📅', label: 'รายวัน' },
      { sub: 'ov-customer', icon: '🏪', label: 'ลูกค้า' },
      { sub: 'ov-sales',    icon: '👤', label: 'พนักงานขาย' },
      { sub: 'ov-target',   icon: '🎯', label: 'เป้าหมาย' },
      { sub: 'ov-ai',       icon: '🤖', label: 'วิเคราะห์ AI' },
      { sub: 'ov-manual',   icon: '📖', label: 'คู่มือการใช้งาน' },
      { sub: 'ov-update',   icon: '🔄', label: 'อัพเดทข้อมูล', rbac: 'rbac-import' }
    ]},
    { id: 'mt', icon: '🏪', label: 'ห้างค้าปลีก', children: [
      { sub: 'All',     icon: '📊', label: 'ทุกช่องทาง' },
      { sub: 'CJ',      icon: '🏪', label: 'CJ' },
      { sub: 'BigC',    icon: '🛒', label: 'Big C' },
      { sub: 'Top',     icon: '🏷', label: 'Top' },
      { sub: 'Makro',   icon: '📦', label: 'Makro' },
      { sub: 'MM',      icon: '🏬', label: 'MM' },
      { sub: 'Aeon',    icon: '🛍', label: 'Aeon' },
      { sub: 'TheMall', icon: '🏢', label: 'The Mall' },
      { sub: 'StickerCancel', icon: '🏷️', label: 'สต็อกสติ๊กเกอร์ยกเลิกขาย' }
    ]},
    { id: 'booth', icon: '🏕️', label: 'บูธ', children: [
      { sub: 'bth-info',    icon: '📋', label: 'ข้อมูลบูธ' },
      { sub: 'bth-sales',   icon: '📊', label: 'ยอดขายรวม' },
      { sub: 'bth-stock',   icon: '📦', label: 'สต็อกบูธ' },
      { sub: 'bth-cost',    icon: '💰', label: 'ต้นทุนค่าใช้จ่าย' },
      { sub: 'bth-product', icon: '🛍️', label: 'สินค้า' },
      { sub: 'bth-return',  icon: '↩️', label: 'ของคืน - ของเสีย' },
      { sub: 'bth-promo',   icon: '🎁', label: 'โปรโมชั่น' },
      { sub: 'bth-perf',    icon: '📈', label: 'ผลงานรายสาขา' },
      { sub: 'bth-ai',      icon: '🤖', label: 'วิเคราะห์ AI' },
      { sub: 'bth-update',  icon: '🔄', label: 'อัพเดทข้อมูล', rbac: 'rbac-import' },
      { sub: 'bth-manual', icon: '📖', label: 'คู่มือการใช้งาน' }
    ]},
    { id: 'online', icon: '🛒', label: 'ออนไลน์', children: [
      { sub: 'ol-sales',      icon: '📊', label: 'ยอดขาย' },
      { sub: 'ol-ads',        icon: '📢', label: 'ADS & Campaign' },
      { sub: 'ol-influencer', icon: '👥', label: 'อินฟลูเอนเซอร์' },
      { sub: 'ol-shipping',   icon: '📦', label: 'ค่าขนส่ง' },
      { sub: 'ol-cod',        icon: '💰', label: 'COD' },
      { sub: 'ol-return',     icon: '📦', label: 'สินค้าตีกลับ' },
      { sub: 'ol-claim',      icon: '📋', label: 'ออเดอร์เคลม' },
      { sub: 'ol-cancel',     icon: '❌', label: 'ยกเลิก' },
      { sub: 'ol-supply',     icon: '🧾', label: 'วัสดุสิ้นเปลือง' },
      { sub: 'ol-cost',       icon: '💰', label: 'ต้นทุนขายสินค้า' },
      { sub: 'ol-prodrank',   icon: '📋', label: 'รายการขายสินค้า' },
      { sub: 'ol-shops',      icon: '🏪', label: 'ข้อมูลร้านค้า' },
      { sub: 'ol-ai',         icon: '🤖', label: 'วิเคราะห์ AI' },
      { sub: 'ol-dataupdate', icon: '🔄', label: 'อัพเดทข้อมูล', rbac: 'rbac-import' },
      { sub: 'ol-manual', icon: '📖', label: 'คู่มือการใช้งาน' }
    ]},
    { id: 'amazon', icon: '📦', label: 'อเมซอน & ของฝาก', children: [
      { sub: 'All',         icon: '📊', label: 'ทุกช่องทาง' },
      { sub: 'Amazon',      icon: '📦', label: 'Amazon' },
      { sub: 'Souvenir',    icon: '🎁', label: 'ร้านของฝาก' },
      { sub: 'BlackCanyon', icon: '☕', label: 'Black Canyon' },
      { sub: 'TeamSales',   icon: '👨‍💼', label: 'ทีมขาย' },
      { sub: 'SalesVisit',  icon: '📍', label: 'Sales Visit Tracker' },
      { sub: 'Complaint',   icon: '📢', label: 'Complaint' },
      { sub: 'amz-area-monitor', icon: '📍', label: 'Sales Monitoring by Area' },
      { sub: 'ApiDash', icon: '📡', label: 'แดชบอร์ด API' }
    ]},
    { id: 'ordering', icon: '📝', label: 'ธุรการขาย', children: [
      { sub: 'ord-staff',     icon: '👥', label: 'พนักงาน & เขต' },
      { sub: 'ord-bills',     icon: '🧾', label: 'จำนวนบิล' },
      { sub: 'ord-checklist', icon: '✅', label: 'เช็คลิสลูกค้า' },
      { sub: 'ord-errors',    icon: '⚠️', label: 'ผิดพลาด & เคลม' },
      { sub: 'ord-calls',     icon: '📞', label: 'การโทรลูกค้า' },
      { sub: 'ord-manual',    icon: '📖', label: 'คู่มือการทำงาน' },
      { sub: 'ord-perf',      icon: '📊', label: 'ผลงานรายคน', minRole: 'manager' },
      { sub: 'ord-ai',        icon: '🤖', label: 'วิเคราะห์ AI' }
    ]},
    { id: 'sm-expense', icon: '💼', label: 'ฝ่ายขาย - การตลาด', children: [
      { sub: 'sm-products',    icon: '📋', label: 'รายการสินค้า' },
      { sub: 'sm-prod-perf',   icon: '🏆', label: 'ผลงานสินค้า' },
      { sub: 'sm-quality',     icon: '🔍', label: 'คุณภาพสินค้า' },
      { sub: 'sm-workflow',    icon: '🔄', label: 'ขั้นตอนการทำงาน' },
      { sub: 'sm-performance', icon: '📈', label: 'ผลงานเซลล์' },
      { sub: 'sm-kpi',        icon: '🎯', label: 'ตัวชี้วัด' },
      { sub: 'sm-expense',    icon: '💼', label: 'ค่าใช้จ่าย' },
      { sub: 'sm-leave',      icon: '📅', label: 'ลงวันหยุด' },
      { sub: 'sm-hr',         icon: '👥', label: 'ข้อมูลบุคลากร' },
      { sub: 'sm-delist',     icon: '⚠️', label: 'สินค้าเสี่ยงถอด' },
      { sub: 'sm-jd',         icon: '📋', label: 'รายละเอียดงาน' },
      { sub: 'sm-docs',       icon: '📂', label: 'ศูนย์เอกสาร' },
      { sub: 'sm-customer',   icon: '📇', label: 'ฐานข้อมูลลูกค้า' },
      { sub: 'sm-ai',         icon: '🤖', label: 'วิเคราะห์ AI' }
    ]},
    { id: 'visit-plan', icon: '📍', label: 'แผนเข้าพบลูกค้า', children: [
      { sub: 'vp-dashboard', icon: '📊', label: 'ภาพรวมผู้บริหาร' },
      { sub: 'vp-summary',   icon: '📌', label: 'สรุปการเข้าพบ' },
      { sub: 'vp-calendar',  icon: '📅', label: 'ปฏิทินวางแผน' },
      { sub: 'vp-form',      icon: '📝', label: 'เพิ่มแผนเข้าพบ' },
      { sub: 'vp-today',     icon: '📋', label: 'ตารางวันนี้' },
      { sub: 'vp-ai',        icon: '🤖', label: 'AI สรุปแผน' }
    ]},
    { id: 'supatest', icon: '🔌', label: 'ทดสอบ Supabase', children: [
      { sub: 'supa-dash', icon: '📊', label: 'แดชบอร์ด API' }
    ]},
    { id: 'marketing', icon: '📣', label: 'Marketing', children: [
      { sub: 'mkt-plan',      icon: '📋', label: 'แผนการตลาด' },
      { sub: 'mkt-promo',     icon: '🎁', label: 'โปรโมชัน/แคมเปญ' },
      { sub: 'mkt-social',    icon: '📱', label: 'Social Media' },
      { sub: 'mkt-content',   icon: '📝', label: 'Content Calendar' },
      { sub: 'mkt-influencer', icon: '🌟', label: 'Influencer' },
      { sub: 'mkt-budget',    icon: '💰', label: 'งบการตลาด' },
      { sub: 'mkt-roi',       icon: '📈', label: 'วิเคราะห์ ROI' },
      { sub: 'mkt-events',    icon: '🎪', label: 'กิจกรรม/Event' },
      { sub: 'mkt-evt-dash',  icon: '📊', label: 'Event Dashboard' }
    ]},
    { id: 'admin', icon: '⚙️', label: 'แผงแอดมิน', minRole: 'admin', children: [
      { sub: 'adm-staff',      icon: '👥', label: 'พนักงาน' },
      { sub: 'adm-prod',       icon: '📦', label: 'สินค้า' },
      { sub: 'adm-sales',      icon: '💰', label: 'ยอดขาย' },
      { sub: 'adm-roles',      icon: '🔐', label: 'ผู้ใช้/สิทธิ์' },
      { sub: 'adm-leave',      icon: '📅', label: 'วันหยุด' },
      { sub: 'adm-guide',      icon: '📖', label: 'คู่มือ' },
      { sub: 'adm-complaints', icon: '📋', label: 'ปัญหาจากลูกค้า' },
      { sub: 'adm-booth',       icon: '🏕️', label: 'ข้อมูลบูธ' },
      { sub: 'adm-sm-sales',   icon: '💼', label: 'ค่าใช้จ่ายเซลล์' },
      { sub: 'adm-sm-fda',     icon: '🏷️', label: 'จดทะเบียน อ.ย.' },
      { sub: 'adm-sm-sample',  icon: '🧪', label: 'สินค้าตัวอย่าง' },
      { sub: 'adm-sm-supply',  icon: '📦', label: 'ของใช้ในแผนก' },
      { sub: 'adm-target',     icon: '🎯', label: 'เป้าหมาย 2026' },
      { sub: 'adm-calllog',    icon: '📞', label: 'ข้อมูลการโทร' }
    ]}
  ];
  window._i18nMENU = MENU;

  var ROLE_LABEL_TH_MAP = {
    admin: 'ผู้ดูแลระบบ',
    manager: 'ผู้จัดการ',
    leader: 'หัวหน้างาน',
    sales: 'ฝ่ายขาย',
    officer: 'เจ้าหน้าที่',
    viewer: 'ผู้ดูรายงาน'
  };
  window.ROLE_LABEL_TH = ROLE_LABEL_TH_MAP;

  // ---- Build sidebar nav ----
  var nav = document.getElementById('sidebarNav');
  if (nav) {
    var html = '';
    MENU.forEach(function (item) {
      var minAttr = item.minRole ? ' data-min="' + item.minRole + '"' : '';

      if (item.children && item.children.length) {
        var openClass = '';
        html += '<div class="nav-group' + openClass + '" data-group="' + item.id + '"' + minAttr + '>';
        html += '<button class="nav-group-head" onclick="toggleNavGroup(this)">'
          + '<span class="nav-ico">' + item.icon + '</span>'
          + '<span class="nav-txt" data-i18n="menu.' + item.id + '">' + ((typeof _t === 'function') ? _t('menu.' + item.id) : item.label) + '</span>'
          + '<span class="nav-caret">▶</span>'
          + '</button>';
        html += '<div class="nav-group-children">';
        item.children.forEach(function (child, ci) {
          var activeClass = '';
          var childMin = child.minRole ? ' data-min="' + child.minRole + '"' : '';
          var rbacClass = child.rbac ? ' ' + child.rbac : '';
          html += '<a class="nav-link' + activeClass + rbacClass + '" data-tab="' + item.id
            + '" data-sub="' + child.sub + '" href="javascript:void(0)"'
            + childMin
            + ' onclick="shellNavClickSub(this,\'' + item.id + '\',\'' + child.sub.replace(/'/g, "\\'") + '\')">'
            + '<span class="nav-ico">' + child.icon + '</span>'
            + '<span class="nav-txt" data-i18n="sub.' + child.sub + '">' + ((typeof _t === 'function') ? _t('sub.' + child.sub, child.label) : child.label) + '</span>'
            + '</a>';
        });
        html += '</div></div>';
      } else {
        var active = item.id === 'overview' ? ' active' : '';
        html += '<a class="nav-link' + active + '" data-tab="' + item.id + '" href="javascript:void(0)" '
          + minAttr
          + ' onclick="shellNavClick(this,\'' + item.id + '\')">'
          + '<span class="nav-ico">' + item.icon + '</span>'
          + '<span class="nav-txt" data-i18n="menu.' + item.id + '">' + ((typeof _t === 'function') ? _t('menu.' + item.id) : item.label) + '</span>'
          + '<span class="nav-bell" id="bell-' + item.id + '"></span>'
          + '</a>';
      }
    });
    nav.innerHTML = html;
  }

  // ---- Toggle nav group (expand/collapse accordion) ----
  window.toggleNavGroup = function (headEl) {
    var group = headEl.closest('.nav-group');
    if (!group) return;

    var wasOpen = group.classList.contains('open');

    // Close all other groups (accordion behavior)
    document.querySelectorAll('#sidebarNav .nav-group').forEach(function (g) {
      if (g !== group) g.classList.remove('open');
    });

    group.classList.toggle('open');

    // If opening, switch to this tab + select first child
    if (!wasOpen) {
      var firstChild = group.querySelector('.nav-group-children .nav-link');
      if (firstChild) {
        firstChild.click();
      }
    }
  };

  // ---- Nav click handler (for items without children) ----
  window.shellNavClick = function (el, tabId) {
    document.querySelectorAll('#sidebarNav .nav-link').forEach(function (a) {
      a.classList.remove('active');
    });
    el.classList.add('active');

    var item = MENU.find(function (m) { return m.id === tabId; });
    var title = document.getElementById('tbPageTitle');
    var breadcrumb = document.getElementById('tbBreadcrumb');
    if (title && item) title.textContent = (typeof _t === 'function') ? _t('menu.' + item.id) : item.label;
    if (breadcrumb && item) breadcrumb.textContent = 'Dashboard';

    closeSidebarDrawer();

    if (typeof showTab === 'function') {
      showTab(el, tabId);
    }
  };

  // ---- Nav click for sub-tab children ----
  window.shellNavClickSub = function (el, tabId, sub) {
    // Mark active in sidebar
    document.querySelectorAll('#sidebarNav .nav-link').forEach(function (a) {
      a.classList.remove('active');
    });
    el.classList.add('active');

    // Update topbar breadcrumb
    var parent = MENU.find(function (m) { return m.id === tabId; });
    var child = parent && parent.children
      ? parent.children.find(function (c) { return c.sub === sub; })
      : null;
    var title = document.getElementById('tbPageTitle');
    var breadcrumb = document.getElementById('tbBreadcrumb');
    if (title && child) title.textContent = (typeof _t === 'function') ? _t('sub.' + child.sub, child.label) : child.label;
    if (breadcrumb && parent) breadcrumb.textContent = (typeof _t === 'function') ? _t('menu.' + parent.id) : parent.label;

    closeSidebarDrawer();

    // Switch to parent tab
    if (typeof showTab === 'function') {
      showTab(el, tabId);
    }

    // Find the matching sub-tab in the content area and click it
    setTimeout(function () { _triggerSubTab(tabId, sub); }, 50);
  };

  // ---- Trigger the real sub-tab element by matching onclick string ----
  function _triggerSubTab(tabId, sub) {
    var section = document.getElementById('tab-' + tabId);
    if (!section) return;

    var subTabs = section.querySelectorAll('.sub-tab');
    for (var i = 0; i < subTabs.length; i++) {
      var oc = subTabs[i].getAttribute('onclick') || '';
      if (oc.indexOf("'" + sub + "'") !== -1) {
        subTabs[i].click();
        return;
      }
    }
  }

  // Keep legacy shellNavClickCh for backward compatibility
  window.shellNavClickCh = window.shellNavClickSub;

  // ---- Sidebar toggle (collapse on desktop, drawer on mobile) ----
  window.toggleSidebar = function () {
    var shell = document.getElementById('appShell');
    if (!shell) return;
    var isMobile = window.innerWidth <= 900;
    if (isMobile) {
      shell.classList.toggle('sidebar-open');
    } else {
      shell.classList.toggle('sidebar-collapsed');
    }
  };

  window.closeSidebarDrawer = function () {
    var shell = document.getElementById('appShell');
    if (shell) shell.classList.remove('sidebar-open');
  };

  // ---- Bell menu toggle ----
  window.toggleBellMenu = function (e) {
    if (e) e.stopPropagation();
    var menu = document.getElementById('tbBellMenu');
    if (menu) menu.classList.toggle('open');
  };

  // Close bell menu on outside click
  document.addEventListener('click', function () {
    var menu = document.getElementById('tbBellMenu');
    if (menu) menu.classList.remove('open');
  });

  // ---- Download menu toggle ----
  window.toggleDownloadMenu = function (e) {
    if (e) e.stopPropagation();
    var menu = document.getElementById('downloadMenu');
    if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  };

  document.addEventListener('click', function () {
    var menu = document.getElementById('downloadMenu');
    if (menu) menu.style.display = 'none';
  });

  // ---- Initial load: show welcome landing (overview hidden until user navigates) ----
  window.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.section').forEach(function (s) {
      s.classList.remove('active');
      s.style.display = 'none';
    });
    var wl = document.getElementById('welcomeLanding');
    if (wl) wl.style.display = 'block';
  });

  // ---- RBAC ----
  var ROLE_LEVELS = { viewer: 0, officer: 1, sales: 1, leader: 2, manager: 3, admin: 4 };

  window.applyRBAC = function (role) {
    var session = (typeof getSession === 'function') ? getSession() : null;
    var allowed = session ? session.allowedMenus : null;

    // data-min: role hierarchy check
    document.querySelectorAll('[data-min]').forEach(function (el) {
      var minRole = el.getAttribute('data-min');
      var userLevel = ROLE_LEVELS[role] || 0;
      var minLevel = ROLE_LEVELS[minRole] || 0;
      if (userLevel < minLevel) {
        el.style.display = 'none';
      } else {
        el.style.removeProperty('display');
      }
    });

    // Per-user menu access: hide sidebar groups not in allowedMenus
    if (allowed && Array.isArray(allowed)) {
      document.querySelectorAll('#sidebarNav .nav-group').forEach(function (group) {
        var groupId = group.getAttribute('data-group');
        if (groupId && allowed.indexOf(groupId) === -1) {
          group.style.display = 'none';
        }
      });
      document.querySelectorAll('#sidebarNav > .nav-link').forEach(function (link) {
        var tab = link.getAttribute('data-tab');
        if (tab && allowed.indexOf(tab) === -1) {
          link.style.display = 'none';
        }
      });
    }

    // Hide rbac-import items for non-admin/manager
    if (role !== 'admin' && role !== 'manager') {
      document.querySelectorAll('.rbac-import').forEach(function (el) {
        el.style.display = 'none';
      });
    }
    // Hide export for viewer
    if (role === 'viewer') {
      var exp = document.querySelector('.rbac-export');
      if (exp) exp.style.display = 'none';
    }
  };

})();
