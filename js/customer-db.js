// ============================================================
// CUSTOMER-DB.JS — ฐานข้อมูลลูกค้า (Customer Database)
// localStorage key: custDB
// ============================================================

(function() {
  'use strict';

  // เดิมเก็บลูกค้าทั้ง 4,095 ราย (~2.8 MB) ลง localStorage ทุกครั้งที่บันทึก
  // ซึ่งกินโควตาเกินครึ่งของทั้งโดเมนทั้งที่ข้อมูลชุดนี้โหลดจาก customers-default.js อยู่แล้ว
  // จึงเปลี่ยนมาเก็บเฉพาะ "ส่วนที่ถูกแก้" แล้วประกอบร่างตอนโหลดแทน
  var STORAGE_KEY = 'custDB';        // คีย์เดิม — ไม่ใช้แล้ว ลบทิ้งตอนโหลดเพื่อคืนพื้นที่
  var EDITS_KEY = 'custDB_edits';
  var _custData = [];
  var _custFiltered = [];
  var _custPage = 1;
  var PAGE_SIZE = 20;
  var _custEditIdx = -1;

  var CHANNELS = [
    'CJ', 'Amazon', 'Modern Trade', 'Black Canyon', 'Booth', 'Online',
    'โรงเรียน', 'ร้านของฝาก', 'ร้านค้าทั่วไป', 'OEM', 'อื่นๆ'
  ];

  var STATUS_LIST = ['เปิดใช้งาน', 'ปิดการขาย', 'รอตรวจสอบ'];

  var DATA_VERSION = 3;

  function _expandRecord(r) {
    return {
      code: r.code || '', name: r.name || '', channel: r.channel || '',
      contactName: r.contactName || '', position: r.position || '',
      phone: r.phone || '', email: r.email || '', lineId: r.lineId || '',
      credit: r.credit || 0, orderCycle: r.orderCycle || '', deliveryCycle: r.deliveryCycle || '',
      startDate: r.startDate || '', status: r.status || 'เปิดใช้งาน',
      province: r.province || '', district: r.district || '',
      subdistrict: r.subdistrict || '', address: r.address || '',
      lat: r.lat || '', lng: r.lng || '', notes: r.notes || ''
    };
  }

  /** ข้อมูลตั้งต้นจาก js/customers-default.js — โหลดใหม่ทุกครั้งที่เปิดหน้า ไม่ต้องเก็บซ้ำ */
  function _baseData() {
    return (typeof CUST_DEFAULT_DATA !== 'undefined' && CUST_DEFAULT_DATA.length)
      ? CUST_DEFAULT_DATA.map(_expandRecord)
      : [];
  }

  function _load() {
    // คีย์เดิมเก็บข้อมูลทั้งก้อน ลบทิ้งเพื่อคืนโควตาให้ฟีเจอร์อื่น
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY + '_ver');
    } catch(e) {}

    var edits = {};
    try { edits = JSON.parse(localStorage.getItem(EDITS_KEY) || '{}') || {}; } catch(e) { edits = {}; }
    var upserts = edits.upserts || {};
    var deleted = edits.deleted || {};

    var base = _baseData();
    var baseCodes = {};
    var out = [];

    base.forEach(function(r) {
      baseCodes[r.code] = true;
      if (deleted[r.code]) return;                                  // ลูกค้าที่ผู้ใช้ลบไป
      out.push(upserts[r.code] ? _expandRecord(upserts[r.code]) : r); // แก้ไขแล้วใช้ของที่แก้
    });

    // ลูกค้าที่ผู้ใช้เพิ่มเอง (ไม่มีในข้อมูลตั้งต้น)
    Object.keys(upserts).forEach(function(code) {
      if (!baseCodes[code]) out.push(_expandRecord(upserts[code]));
    });

    _custData = out;
  }

  /**
   * เก็บเฉพาะส่วนต่างจากข้อมูลตั้งต้น
   * ปกติจะเหลือไม่กี่ KB แทนที่จะเป็น 2.8 MB
   */
  function _save() {
    var baseByCode = {};
    _baseData().forEach(function(r) { baseByCode[r.code] = JSON.stringify(r); });

    var upserts = {}, deleted = {}, seen = {};

    _custData.forEach(function(r) {
      seen[r.code] = true;
      var current = JSON.stringify(_expandRecord(r));
      // เก็บเฉพาะรายที่เพิ่มใหม่ หรือแก้ไปจากข้อมูลตั้งต้น
      if (baseByCode[r.code] === undefined || baseByCode[r.code] !== current) {
        upserts[r.code] = r;
      }
    });

    Object.keys(baseByCode).forEach(function(code) {
      if (!seen[code]) deleted[code] = 1;
    });

    try {
      localStorage.setItem(EDITS_KEY, JSON.stringify({ v: DATA_VERSION, upserts: upserts, deleted: deleted }));
    } catch(e) {
      // พื้นที่เต็มจริง ๆ — บอกผู้ใช้ตรง ๆ ดีกว่าปล่อยให้หน้าเว็บพัง
      console.error('[CustomerDB] บันทึกไม่สำเร็จ:', e);
      alert('บันทึกข้อมูลลูกค้าไม่สำเร็จ เพราะพื้นที่เก็บข้อมูลของเบราว์เซอร์เต็ม\n\n' +
            'ข้อมูลที่แก้ล่าสุดยังไม่ถูกบันทึก — ลองล้างข้อมูลเก่าของเว็บนี้แล้วลองใหม่');
    }
  }

  function _nextCode() {
    var max = 0;
    _custData.forEach(function(c) {
      var m = (c.code || '').match(/CUS-(\d+)/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    var n = max + 1;
    return 'CUS-' + ('000' + n).slice(-3);
  }

  function _filterData() {
    var ch = document.getElementById('cdb-channel');
    var q = document.getElementById('cdb-search');
    var st = document.getElementById('cdb-status');
    var channel = ch ? ch.value : '';
    var query = q ? q.value.trim().toLowerCase() : '';
    var status = st ? st.value : '';

    _custFiltered = _custData.filter(function(c) {
      if (channel && c.channel !== channel) return false;
      if (status && c.status !== status) return false;
      if (query) {
        var hay = [c.code, c.name, c.contactName, c.phone, c.province, c.district].join(' ').toLowerCase();
        if (hay.indexOf(query) < 0) return false;
      }
      return true;
    });
    _custPage = 1;
  }

  function _renderTable() {
    var wrap = document.getElementById('cdb-table-wrap');
    if (!wrap) return;

    var total = _custFiltered.length;
    var pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (_custPage > pages) _custPage = pages;
    var start = (_custPage - 1) * PAGE_SIZE;
    var slice = _custFiltered.slice(start, start + PAGE_SIZE);

    var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px">';
    h += '<span style="color:#666">พบ <b>' + total + '</b> รายการ</span>';
    h += '<div style="display:flex;gap:6px;align-items:center">';
    h += '<button class="btn-sm" onclick="window._cdbPage(-1)" ' + (_custPage <= 1 ? 'disabled' : '') + ' title="หน้าก่อน">&#9664;</button>';
    h += '<span style="font-size:13px">หน้า </span>';
    h += '<input type="number" min="1" max="' + pages + '" value="' + _custPage + '" style="width:50px;text-align:center;padding:2px 4px;border:1px solid #ccc;border-radius:4px;font-size:13px" onchange="window._cdbGoPage(parseInt(this.value)||1)" onkeydown="if(event.key===\'Enter\'){window._cdbGoPage(parseInt(this.value)||1)}">';
    h += '<span style="font-size:13px">/ ' + pages + '</span>';
    h += '<button class="btn-sm" onclick="window._cdbPage(1)" ' + (_custPage >= pages ? 'disabled' : '') + ' title="หน้าถัดไป">&#9654;</button>';
    h += '</div></div>';

    h += '<div style="overflow-x:auto"><table class="data-table cdb-table">';
    h += '<thead><tr>';
    h += '<th style="width:40px">#</th>';
    h += '<th>รหัส</th>';
    h += '<th>ชื่อลูกค้า</th>';
    h += '<th>ช่องทาง</th>';
    h += '<th>ผู้ติดต่อ</th>';
    h += '<th>เบอร์โทร</th>';
    h += '<th>จังหวัด</th>';
    h += '<th>สถานะ</th>';
    h += '<th style="width:90px">จัดการ</th>';
    h += '</tr></thead><tbody>';

    if (slice.length === 0) {
      h += '<tr><td colspan="9" style="text-align:center;color:#999;padding:32px">ไม่พบข้อมูล</td></tr>';
    }

    slice.forEach(function(c, i) {
      var displayNum = start + i + 1;
      var realIdx = _custData.indexOf(c);
      var statusClass = c.status === 'เปิดใช้งาน' ? 'cdb-status-active' :
                        c.status === 'ปิดการขาย' ? 'cdb-status-closed' : 'cdb-status-pending';
      h += '<tr>';
      h += '<td style="text-align:center">' + displayNum + '</td>';
      h += '<td><span class="cdb-code">' + _esc(c.code) + '</span></td>';
      h += '<td><b>' + _esc(c.name) + '</b></td>';
      h += '<td><span class="cdb-channel-badge">' + _esc(c.channel) + '</span></td>';
      h += '<td>' + _esc(c.contactName || '-') + '</td>';
      h += '<td>' + _esc(c.phone || '-') + '</td>';
      h += '<td>' + _esc(c.province || '-') + '</td>';
      h += '<td><span class="' + statusClass + '">' + _esc(c.status || '-') + '</span></td>';
      h += '<td style="text-align:center">';
      h += '<button class="btn-icon" onclick="window._cdbView(' + realIdx + ')" title="ดูรายละเอียด">&#128065;</button> ';
      h += '<button class="btn-icon" onclick="window._cdbEdit(' + realIdx + ')" title="แก้ไข">&#9998;</button> ';
      h += '<button class="btn-icon btn-icon-danger" onclick="window._cdbDel(' + realIdx + ')" title="ลบ">&#128465;</button>';
      h += '</td></tr>';
    });

    h += '</tbody></table></div>';

    // Pagination bottom
    if (pages > 1) {
      h += '<div style="display:flex;justify-content:center;gap:6px;align-items:center;margin-top:8px">';
      h += '<button class="btn-sm" onclick="window._cdbPage(-1)" ' + (_custPage <= 1 ? 'disabled' : '') + ' title="หน้าก่อน">&#9664;</button>';
      h += '<span style="font-size:13px">หน้า </span>';
      h += '<input type="number" min="1" max="' + pages + '" value="' + _custPage + '" style="width:50px;text-align:center;padding:2px 4px;border:1px solid #ccc;border-radius:4px;font-size:13px" onchange="window._cdbGoPage(parseInt(this.value)||1)" onkeydown="if(event.key===\'Enter\'){window._cdbGoPage(parseInt(this.value)||1)}">';
      h += '<span style="font-size:13px">/ ' + pages + '</span>';
      h += '<button class="btn-sm" onclick="window._cdbPage(1)" ' + (_custPage >= pages ? 'disabled' : '') + ' title="หน้าถัดไป">&#9654;</button>';
      h += '</div>';
    }

    wrap.innerHTML = h;
  }

  function _renderForm(c, isNew) {
    var modal = document.getElementById('cdb-modal');
    if (!modal) return;

    c = c || {};
    var title = isNew ? 'เพิ่มลูกค้าใหม่' : 'แก้ไขข้อมูลลูกค้า';

    var h = '<div class="cdb-modal-overlay" onclick="window._cdbCloseModal()">';
    h += '<div class="cdb-modal-content" onclick="event.stopPropagation()">';
    h += '<div class="cdb-modal-header">';
    h += '<h3>' + title + '</h3>';
    h += '<button class="cdb-modal-close" onclick="window._cdbCloseModal()">&times;</button>';
    h += '</div>';
    h += '<div class="cdb-modal-body">';

    // Section 1: Customer Information
    h += '<div class="cdb-form-section"><div class="cdb-form-section-title">ข้อมูลทั่วไปของลูกค้า</div>';
    h += '<div class="cdb-form-grid">';
    h += _formField('รหัสลูกค้า', 'cf_code', 'text', c.code || _nextCode(), isNew ? false : true);
    h += _formField('ชื่อลูกค้า *', 'cf_name', 'text', c.name || '');
    h += _formSelect('ประเภทลูกค้า (ช่องทาง) *', 'cf_channel', CHANNELS, c.channel || '');
    h += _formField('ชื่อผู้ติดต่อ', 'cf_contact', 'text', c.contactName || '');
    h += _formField('ตำแหน่ง', 'cf_position', 'text', c.position || '');
    h += _formField('เบอร์โทรศัพท์', 'cf_phone', 'tel', c.phone || '');
    h += _formField('อีเมล', 'cf_email', 'email', c.email || '');
    h += _formField('Line ID', 'cf_line', 'text', c.lineId || '');
    h += _formField('เครดิต (วัน)', 'cf_credit', 'number', c.credit || '');
    h += _formField('รอบสั่ง', 'cf_orderCycle', 'text', c.orderCycle || '');
    h += _formField('รอบส่ง', 'cf_deliveryCycle', 'text', c.deliveryCycle || '');
    h += _formField('วันเริ่มเป็นลูกค้า', 'cf_startDate', 'date', c.startDate || '');
    h += _formSelect('สถานะ', 'cf_status', STATUS_LIST, c.status || 'เปิดใช้งาน');
    h += '</div></div>';

    // Section 2: Address
    h += '<div class="cdb-form-section"><div class="cdb-form-section-title">ข้อมูลที่อยู่</div>';
    h += '<div class="cdb-form-grid">';
    h += _formField('จังหวัด', 'cf_province', 'text', c.province || '');
    h += _formField('อำเภอ', 'cf_district', 'text', c.district || '');
    h += _formField('ตำบล', 'cf_subdistrict', 'text', c.subdistrict || '');
    h += _formField('ที่อยู่', 'cf_address', 'text', c.address || '');
    h += _formField('Latitude', 'cf_lat', 'text', c.lat || '');
    h += _formField('Longitude', 'cf_lng', 'text', c.lng || '');
    h += '</div></div>';

    // Section 3: Notes
    h += '<div class="cdb-form-section"><div class="cdb-form-section-title">หมายเหตุ</div>';
    h += '<div style="padding:0 4px"><textarea id="cf_notes" class="cdb-input" rows="3" style="width:100%">' + _esc(c.notes || '') + '</textarea></div>';
    h += '</div>';

    h += '<div class="cdb-form-actions">';
    h += '<button class="cdb-btn cdb-btn-secondary" onclick="window._cdbCloseModal()">ยกเลิก</button>';
    h += '<button class="cdb-btn cdb-btn-primary" onclick="window._cdbSaveForm()">บันทึก</button>';
    h += '</div>';

    h += '</div></div></div>';

    modal.innerHTML = h;
    modal.style.display = 'block';
  }

  function _renderViewModal(c) {
    var modal = document.getElementById('cdb-modal');
    if (!modal) return;

    var h = '<div class="cdb-modal-overlay" onclick="window._cdbCloseModal()">';
    h += '<div class="cdb-modal-content" onclick="event.stopPropagation()">';
    h += '<div class="cdb-modal-header">';
    h += '<h3>รายละเอียดลูกค้า</h3>';
    h += '<button class="cdb-modal-close" onclick="window._cdbCloseModal()">&times;</button>';
    h += '</div>';
    h += '<div class="cdb-modal-body">';

    h += '<div class="cdb-view-header">';
    h += '<div class="cdb-view-code">' + _esc(c.code) + '</div>';
    h += '<div class="cdb-view-name">' + _esc(c.name) + '</div>';
    var statusClass = c.status === 'เปิดใช้งาน' ? 'cdb-status-active' :
                      c.status === 'ปิดการขาย' ? 'cdb-status-closed' : 'cdb-status-pending';
    h += '<span class="' + statusClass + '">' + _esc(c.status || '-') + '</span>';
    h += '</div>';

    h += '<div class="cdb-view-section"><div class="cdb-form-section-title">ข้อมูลทั่วไป</div>';
    h += '<div class="cdb-view-grid">';
    h += _viewRow('ช่องทาง', c.channel);
    h += _viewRow('ชื่อผู้ติดต่อ', c.contactName);
    h += _viewRow('ตำแหน่ง', c.position);
    h += _viewRow('เบอร์โทรศัพท์', c.phone);
    h += _viewRow('อีเมล', c.email);
    h += _viewRow('Line ID', c.lineId);
    h += _viewRow('เครดิต (วัน)', c.credit);
    h += _viewRow('รอบสั่ง', c.orderCycle);
    h += _viewRow('รอบส่ง', c.deliveryCycle);
    h += _viewRow('วันเริ่มเป็นลูกค้า', c.startDate);
    h += '</div></div>';

    h += '<div class="cdb-view-section"><div class="cdb-form-section-title">ที่อยู่</div>';
    h += '<div class="cdb-view-grid">';
    h += _viewRow('จังหวัด', c.province);
    h += _viewRow('อำเภอ', c.district);
    h += _viewRow('ตำบล', c.subdistrict);
    h += _viewRow('ที่อยู่', c.address);
    if (c.lat && c.lng) {
      h += _viewRow('พิกัด', c.lat + ', ' + c.lng);
      h += '<div class="cdb-view-row"><span class="cdb-view-label">Google Maps</span>';
      h += '<a href="https://www.google.com/maps?q=' + c.lat + ',' + c.lng + '" target="_blank" rel="noopener" class="cdb-map-link">เปิดแผนที่</a></div>';
    }
    h += '</div></div>';

    if (c.notes) {
      h += '<div class="cdb-view-section"><div class="cdb-form-section-title">หมายเหตุ</div>';
      h += '<p style="padding:4px 8px;color:#555">' + _esc(c.notes) + '</p></div>';
    }

    h += '<div class="cdb-form-actions">';
    h += '<button class="cdb-btn cdb-btn-secondary" onclick="window._cdbCloseModal()">ปิด</button>';
    h += '<button class="cdb-btn cdb-btn-primary" onclick="window._cdbEdit(' + _custData.indexOf(c) + ')">แก้ไข</button>';
    h += '</div>';

    h += '</div></div></div>';

    modal.innerHTML = h;
    modal.style.display = 'block';
  }

  function _formField(label, id, type, val, disabled) {
    return '<div class="cdb-form-group">' +
      '<label class="cdb-label" for="' + id + '">' + label + '</label>' +
      '<input class="cdb-input" type="' + type + '" id="' + id + '" value="' + _esc(val) + '"' +
      (disabled ? ' disabled style="background:#f0f0f0"' : '') + '>' +
      '</div>';
  }

  function _formSelect(label, id, options, selected) {
    var h = '<div class="cdb-form-group">';
    h += '<label class="cdb-label" for="' + id + '">' + label + '</label>';
    h += '<select class="cdb-input" id="' + id + '">';
    h += '<option value="">-- เลือก --</option>';
    options.forEach(function(o) {
      h += '<option value="' + _esc(o) + '"' + (o === selected ? ' selected' : '') + '>' + _esc(o) + '</option>';
    });
    h += '</select></div>';
    return h;
  }

  function _viewRow(label, val) {
    return '<div class="cdb-view-row"><span class="cdb-view-label">' + label + '</span><span class="cdb-view-value">' + _esc(val || '-') + '</span></div>';
  }

  function _esc(s) {
    if (!s && s !== 0) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // --- Summary cards ---
  function _renderSummary() {
    var totalActive = 0, totalClosed = 0;
    var byChannel = {};
    CHANNELS.forEach(function(ch) { byChannel[ch] = 0; });

    _custData.forEach(function(c) {
      if (c.status === 'เปิดใช้งาน') totalActive++;
      else if (c.status === 'ปิดการขาย') totalClosed++;
      if (byChannel[c.channel] !== undefined) byChannel[c.channel]++;
    });

    var h = '<div class="cdb-summary-cards">';
    h += '<div class="cdb-card-stat"><div class="cdb-card-num">' + _custData.length + '</div><div class="cdb-card-label">ลูกค้าทั้งหมด</div></div>';
    h += '<div class="cdb-card-stat cdb-card-active"><div class="cdb-card-num">' + totalActive + '</div><div class="cdb-card-label">เปิดใช้งาน</div></div>';
    h += '<div class="cdb-card-stat cdb-card-closed"><div class="cdb-card-num">' + totalClosed + '</div><div class="cdb-card-label">ปิดการขาย</div></div>';

    var activeChannels = Object.keys(byChannel).filter(function(k) { return byChannel[k] > 0; })
      .sort(function(a,b) { return byChannel[b] - byChannel[a]; });
    h += '<div class="cdb-card-stat cdb-card-channel"><div class="cdb-card-num">' + activeChannels.length + '</div><div class="cdb-card-label">ช่องทาง</div></div>';
    h += '</div>';

    if (activeChannels.length) {
      var colors = {
        'CJ': '#e74c3c', 'Amazon': '#f39c12', 'Modern Trade': '#3498db',
        'Black Canyon': '#2c3e50', 'Booth': '#9b59b6', 'Online': '#1abc9c',
        'โรงเรียน': '#27ae60', 'ร้านของฝาก': '#e67e22',
        'ร้านค้าทั่วไป': '#7f8c8d', 'OEM': '#8e44ad', 'อื่นๆ': '#95a5a6'
      };
      h += '<div class="cdb-channel-cards">';
      activeChannels.forEach(function(ch) {
        var color = colors[ch] || '#7f8c8d';
        h += '<div class="cdb-channel-card" style="border-left:4px solid ' + color + '" onclick="document.getElementById(\'cdb-channel\').value=\'' + ch + '\';window._cdbFilter()">';
        h += '<div class="cdb-channel-card-num" style="color:' + color + '">' + byChannel[ch] + '</div>';
        h += '<div class="cdb-channel-card-label">' + ch + '</div>';
        h += '</div>';
      });
      h += '</div>';
    }

    return h;
  }

  // --- Export CSV ---
  function _exportCSV() {
    var headers = ['รหัสลูกค้า','ชื่อลูกค้า','ช่องทาง','ชื่อผู้ติดต่อ','ตำแหน่ง','เบอร์โทร','อีเมล','Line ID','เครดิต','รอบสั่ง','รอบส่ง','วันเริ่ม','สถานะ','จังหวัด','อำเภอ','ตำบล','ที่อยู่','Lat','Lng','หมายเหตุ'];
    var rows = [headers.join(',')];
    var data = _custFiltered.length ? _custFiltered : _custData;
    data.forEach(function(c) {
      rows.push([c.code, c.name, c.channel, c.contactName, c.position, c.phone, c.email, c.lineId, c.credit, c.orderCycle, c.deliveryCycle, c.startDate, c.status, c.province, c.district, c.subdistrict, c.address, c.lat, c.lng, c.notes]
        .map(function(v) { return '"' + String(v || '').replace(/"/g, '""') + '"'; }).join(','));
    });
    var bom = '﻿';
    var blob = new Blob([bom + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'customer_database_' + new Date().toISOString().slice(0,10) + '.csv';
    a.click();
  }

  // === Main render ===
  window.renderCustomerDB = function() {
    var el = document.getElementById('sm-customer');
    if (!el) return;

    _load();
    _custFiltered = _custData.slice();

    var h = '<div class="card" style="margin-top:8px">';
    h += '<div class="card-title" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
    h += '<span>&#128202; ฐานข้อมูลลูกค้า</span>';
    h += '<div style="display:flex;gap:6px">';
    h += '<button class="cdb-btn cdb-btn-export" onclick="window._cdbExport()">&#128230; Export CSV</button>';
    if (_custData.length === 0) {
      h += '<button class="cdb-btn" style="background:#6366f1;color:#fff" onclick="if(confirm(\'นำเข้าข้อมูลลูกค้าจากแหล่งข้อมูลทั้งหมด?\')){window._cdbImportAll()}">&#128229; นำเข้าข้อมูล</button>';
    }
    h += '<button class="cdb-btn cdb-btn-primary" onclick="window._cdbAdd()">&#10010; เพิ่มลูกค้า</button>';
    h += '</div>';
    h += '</div>';

    // Summary
    h += '<div id="cdb-summary">' + _renderSummary() + '</div>';

    // Filters
    h += '<div class="cdb-filters">';
    h += '<div class="cdb-filter-group">';
    h += '<label class="cdb-filter-label">ช่องทาง</label>';
    h += '<select id="cdb-channel" class="cdb-filter-input" onchange="window._cdbFilter()">';
    h += '<option value="">ทุกช่องทาง</option>';
    CHANNELS.forEach(function(ch) {
      h += '<option value="' + _esc(ch) + '">' + _esc(ch) + '</option>';
    });
    h += '</select></div>';

    h += '<div class="cdb-filter-group">';
    h += '<label class="cdb-filter-label">สถานะ</label>';
    h += '<select id="cdb-status" class="cdb-filter-input" onchange="window._cdbFilter()">';
    h += '<option value="">ทั้งหมด</option>';
    STATUS_LIST.forEach(function(s) {
      h += '<option value="' + _esc(s) + '">' + _esc(s) + '</option>';
    });
    h += '</select></div>';

    h += '<div class="cdb-filter-group cdb-filter-search">';
    h += '<label class="cdb-filter-label">ค้นหา</label>';
    h += '<input type="text" id="cdb-search" class="cdb-filter-input" placeholder="รหัส, ชื่อ, เบอร์โทร, จังหวัด..." oninput="window._cdbFilter()">';
    h += '</div>';
    h += '</div>';

    // Table
    h += '<div id="cdb-table-wrap"></div>';

    h += '</div>';

    // Modal container
    h += '<div id="cdb-modal" style="display:none"></div>';

    el.innerHTML = h;
    _renderTable();
  };

  // --- Public API ---
  window._cdbFilter = function() {
    _filterData();
    _renderTable();
    document.getElementById('cdb-summary').innerHTML = _renderSummary();
  };

  window._cdbPage = function(dir) {
    _custPage += dir;
    _renderTable();
  };

  window._cdbGoPage = function(p) {
    var pages = Math.max(1, Math.ceil(_custFiltered.length / PAGE_SIZE));
    _custPage = Math.max(1, Math.min(p, pages));
    _renderTable();
  };

  window._cdbAdd = function() {
    _custEditIdx = -1;
    _renderForm(null, true);
  };

  window._cdbEdit = function(idx) {
    _custEditIdx = idx;
    _renderForm(_custData[idx], false);
  };

  window._cdbView = function(idx) {
    _renderViewModal(_custData[idx]);
  };

  window._cdbDel = function(idx) {
    var c = _custData[idx];
    if (!confirm('ลบลูกค้า ' + c.code + ' - ' + c.name + ' ?')) return;
    _custData.splice(idx, 1);
    _save();
    _filterData();
    _renderTable();
    document.getElementById('cdb-summary').innerHTML = _renderSummary();
  };

  window._cdbSaveForm = function() {
    var code = (document.getElementById('cf_code').value || '').trim();
    var name = (document.getElementById('cf_name').value || '').trim();
    var channel = (document.getElementById('cf_channel').value || '').trim();

    if (!name) { alert('กรุณากรอกชื่อลูกค้า'); return; }
    if (!channel) { alert('กรุณาเลือกประเภทลูกค้า (ช่องทาง)'); return; }

    var obj = {
      code: code || _nextCode(),
      name: name,
      channel: channel,
      contactName: (document.getElementById('cf_contact').value || '').trim(),
      position: (document.getElementById('cf_position').value || '').trim(),
      phone: (document.getElementById('cf_phone').value || '').trim(),
      email: (document.getElementById('cf_email').value || '').trim(),
      lineId: (document.getElementById('cf_line').value || '').trim(),
      credit: (document.getElementById('cf_credit').value || '').trim(),
      orderCycle: (document.getElementById('cf_orderCycle').value || '').trim(),
      deliveryCycle: (document.getElementById('cf_deliveryCycle').value || '').trim(),
      startDate: (document.getElementById('cf_startDate').value || '').trim(),
      status: document.getElementById('cf_status').value || 'เปิดใช้งาน',
      province: (document.getElementById('cf_province').value || '').trim(),
      district: (document.getElementById('cf_district').value || '').trim(),
      subdistrict: (document.getElementById('cf_subdistrict').value || '').trim(),
      address: (document.getElementById('cf_address').value || '').trim(),
      lat: (document.getElementById('cf_lat').value || '').trim(),
      lng: (document.getElementById('cf_lng').value || '').trim(),
      notes: (document.getElementById('cf_notes').value || '').trim()
    };

    if (_custEditIdx >= 0) {
      _custData[_custEditIdx] = obj;
    } else {
      _custData.push(obj);
    }

    _save();
    _cdbCloseModal();
    _filterData();
    _renderTable();
    document.getElementById('cdb-summary').innerHTML = _renderSummary();
  };

  window._cdbCloseModal = function() {
    var modal = document.getElementById('cdb-modal');
    if (modal) { modal.innerHTML = ''; modal.style.display = 'none'; }
  };

  window._cdbExport = _exportCSV;

  /** ให้โมดูลอื่น (เช่น call-log) ดึงรายชื่อลูกค้าที่รวมส่วนแก้ไขแล้วไปใช้ */
  window.getCustomerDB = function() {
    if (!_custData.length) _load();
    return _custData;
  };

  // === Auto-import from existing data sources ===
  window._cdbImportAll = function() {
    _load();
    var existing = {};
    _custData.forEach(function(c) { existing[c.code] = true; });
    var added = 0;
    var num = _custData.length;

    function _nextNum() { num++; return 'CUS-' + ('0000' + num).slice(-4); }

    function _addIfNew(obj) {
      var key = obj.channel + '|' + obj.name;
      if (existing[key]) return;
      existing[key] = true;
      obj.code = _nextNum();
      obj.status = obj.status || 'เปิดใช้งาน';
      _custData.push(obj);
      added++;
    }

    // --- 1. BOOTH_INFO (บูธ) — try global or extract from localStorage ---
    var boothSrc = window.BOOTH_INFO;
    if (!boothSrc) {
      try { boothSrc = JSON.parse(localStorage.getItem('spbi_booth_custom') || '[]'); } catch(e) { boothSrc = []; }
    }
    if (boothSrc && boothSrc.length) {
      boothSrc.forEach(function(b) {
        if (!b.name) return;
        _addIfNew({
          name: b.name,
          channel: 'Booth',
          contactName: b.account || '',
          phone: b.boothPhone || b.phone || '',
          address: b.address || '',
          province: '',
          district: '',
          subdistrict: '',
          lat: '', lng: '',
          position: b.type || '',
          email: '', lineId: '',
          credit: '', orderCycle: '', deliveryCycle: '',
          startDate: '',
          status: (b.status && b.status.indexOf('ปิด') >= 0) ? 'ปิดการขาย' : 'เปิดใช้งาน',
          notes: b.status || ''
        });
      });
    }

    // --- 2. AMZ_CUST_DATA (Amazon / ร้านของฝาก) ---
    if (window.AMZ_CUST_DATA) {
      var amzData = window.AMZ_CUST_DATA;
      function _importAmzArray(arr, ch) {
        if (!arr || !Array.isArray(arr)) return;
        arr.forEach(function(r) {
          var custName = (r.n || '').replace(/^\d+\s*/, '').trim();
          if (!custName) return;
          _addIfNew({
            name: custName,
            channel: ch,
            contactName: '',
            phone: '',
            address: '',
            province: r.p || '',
            district: r.d || '',
            subdistrict: '',
            lat: '', lng: '',
            position: '',
            email: '', lineId: '',
            credit: '', orderCycle: '', deliveryCycle: '',
            startDate: '',
            status: r.lf ? 'ปิดการขาย' : 'เปิดใช้งาน',
            notes: r.lf ? 'Lost: ' + r.lf : (r.nf ? 'New customer' : '')
          });
        });
      }
      _importAmzArray(amzData.AMZ, 'Amazon');
      _importAmzArray(amzData.SOV, 'ร้านของฝาก');
    }

    // --- 3. Supabase location_monthly (MT branches) ---
    // Fetch unique branch data from Supabase
    var supaUrl = '';
    var supaKey = '';
    if (window.SUPA) {
      supaUrl = window.SUPA.URL;
      supaKey = window.SUPA.KEY;
    } else if (window._supaFetch) {
      // Try to find from supabase-test.js globals
      var scripts = document.querySelectorAll('script[src*="supabase"]');
      // fallback: hardcoded from supabase-test.js
    }

    if (supaUrl && supaKey) {
      var url = supaUrl + '/location_monthly?select=branch_code,branch_name,province&order=branch_name&limit=5000';
      fetch(url, {
        headers: {
          'apikey': supaKey,
          'Authorization': 'Bearer ' + supaKey
        }
      }).then(function(res) { return res.json(); })
      .then(function(rows) {
        var seen = {};
        rows.forEach(function(r) {
          if (!r.branch_name || seen[r.branch_code]) return;
          seen[r.branch_code] = true;
          _addIfNew({
            name: r.branch_name,
            channel: 'Modern Trade',
            contactName: '',
            phone: '',
            address: '',
            province: r.province || '',
            district: '',
            subdistrict: '',
            lat: '', lng: '',
            position: '',
            email: '', lineId: '',
            credit: '', orderCycle: '', deliveryCycle: '',
            startDate: '',
            status: 'เปิดใช้งาน',
            notes: 'branch_code: ' + (r.branch_code || '')
          });
        });
        _save();
        alert('นำเข้าข้อมูลสำเร็จ! เพิ่ม ' + added + ' รายการ (รวม Supabase)');
        if (typeof renderCustomerDB === 'function') renderCustomerDB();
      })
      .catch(function() {
        _save();
        alert('นำเข้าข้อมูลสำเร็จ! เพิ่ม ' + added + ' รายการ (ไม่สามารถดึง Supabase ได้)');
        if (typeof renderCustomerDB === 'function') renderCustomerDB();
      });
    } else {
      _save();
      alert('นำเข้าข้อมูลสำเร็จ! เพิ่ม ' + added + ' รายการ');
      if (typeof renderCustomerDB === 'function') renderCustomerDB();
    }
  };

})();
