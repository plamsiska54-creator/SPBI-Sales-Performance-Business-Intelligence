/* ================================================================
   booth-form.js — ฟอร์มเพิ่ม/แก้ไข/ลบข้อมูลบูธ + Admin panel table
   ใช้ ES5 ตามมาตรฐานโปรเจกต์
   ================================================================ */

var _boothEditIdx = -1; // -1 = เพิ่มใหม่, >= 0 = แก้ไข index

// ---- Toggle แสดง/ซ่อนฟอร์มเพิ่มข้อมูลบูธ (หน้าบูธ) ----
window.toggleBoothForm = function () {
  var wrap = document.getElementById('boothFormCard');
  if (!wrap) return;
  var isHidden = wrap.style.display === 'none' || wrap.style.display === '';
  wrap.style.display = isHidden ? 'block' : 'none';
};

// ---- ส่งฟอร์มเพิ่มบูธใหม่ (หน้าบูธ) ----
window.submitBoothForm = function () {
  var f = document.getElementById('boothEntryForm');
  if (!f) return;

  var code      = f.bf_code.value.trim();
  var name      = f.bf_name.value.trim();
  var type      = f.bf_type.value;
  var recCode   = f.bf_recCode.value.trim();
  var zone      = f.bf_zone.value.trim();
  var category  = f.bf_category.value;
  var staffCode = f.bf_staffCode.value.trim();
  var staffName = f.bf_staffName.value.trim();
  var phone     = f.bf_phone.value.trim();
  var rent      = parseFloat(f.bf_rent.value) || 0;
  var change    = f.bf_change.value.trim();
  var boothPhone = f.bf_boothPhone.value.trim();
  var account   = f.bf_account.value.trim();
  var address   = f.bf_address.value.trim();
  var status    = f.bf_status.value;
  var notes     = f.bf_notes.value.trim();

  if (!code || !name) {
    alert('กรุณากรอก รหัสบูธ และ ชื่อบูธ');
    return;
  }

  var photoFile = f.bf_photo.files[0];

  var saveEntry = function (photoData) {
    var entry = {
      code: code, name: name, type: type, recCode: recCode, zone: zone,
      staff: staffName || '-', staffCode: staffCode || '-', staffName: staffName || '-',
      phone: phone || '-', rent: rent, change: change || '-',
      boothPhone: boothPhone || '-', account: account || '-',
      status: status, photo: photoData || '', address: address || '',
      notes: notes || '', _custom: true
    };
    if (typeof BOOTH_INFO !== 'undefined') BOOTH_INFO.push(entry);
    _addCustomBoothToStorage(entry);
    if (typeof renderBoothInfo === 'function') renderBoothInfo();
    f.reset();
    document.getElementById('boothFormCard').style.display = 'none';
    _boothToast('เพิ่มข้อมูลบูธ "' + name + '" สำเร็จ');
  };

  if (photoFile) {
    var reader = new FileReader();
    reader.onload = function (e) { saveEntry(e.target.result); };
    reader.readAsDataURL(photoFile);
  } else {
    saveEntry('');
  }
};

// ---- โหลดบูธที่เคยเพิ่มจาก localStorage ----
window.loadCustomBooths = function () {
  try {
    var stored = JSON.parse(localStorage.getItem('spbi_booth_custom') || '[]');
    if (stored.length && typeof BOOTH_INFO !== 'undefined') {
      var existCodes = {};
      BOOTH_INFO.forEach(function (b) { existCodes[b.code] = true; });
      stored.forEach(function (entry) {
        if (!existCodes[entry.code]) {
          entry._custom = true;
          BOOTH_INFO.push(entry);
          existCodes[entry.code] = true;
        }
      });
    }
  } catch (e) {
    console.warn('loadCustomBooths error:', e);
  }
};

// ======== Admin Panel: Toggle ฟอร์มเพิ่ม/แก้ไข ========
window.toggleAdminBoothForm = function () {
  var wrap = document.getElementById('adminBoothFormWrap');
  if (!wrap) return;
  var isHidden = wrap.style.display === 'none' || wrap.style.display === '';
  if (isHidden) {
    _boothEditIdx = -1;
    var title = document.getElementById('adminBoothFormTitle');
    if (title) title.textContent = '➕ เพิ่มข้อมูลบูธใหม่';
    var f = document.getElementById('adminBoothForm');
    if (f) f.reset();
    wrap.style.display = 'block';
    wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    wrap.style.display = 'none';
    _boothEditIdx = -1;
  }
};

// ======== Admin Panel: Submit ฟอร์ม (เพิ่ม/แก้ไข) ========
window.submitAdminBoothForm = function () {
  var f = document.getElementById('adminBoothForm');
  if (!f) return;

  var code      = f.code.value.trim();
  var name      = f.name.value.trim();
  var type      = f.type.value;
  var recCode   = f.recCode.value.trim();
  var zone      = f.zone.value.trim();
  var category  = f.category.value;
  var staffCode = f.staffCode.value.trim();
  var staffName = f.staffName.value.trim();
  var phone     = f.phone.value.trim();
  var rent      = parseFloat(f.rent.value) || 0;
  var change    = f.change.value.trim();
  var boothPhone = f.boothPhone.value.trim();
  var account   = f.account.value.trim();
  var address   = f.address.value.trim();
  var status    = f.status.value;
  var notes     = f.notes.value.trim();

  if (!code || !name) {
    alert('กรุณากรอก รหัสบูธ และ ชื่อบูธ');
    return;
  }

  var photoFile = f.photo.files[0];

  var finishSave = function (photoData) {
    if (_boothEditIdx >= 0 && typeof BOOTH_INFO !== 'undefined' && BOOTH_INFO[_boothEditIdx]) {
      // แก้ไข
      var b = BOOTH_INFO[_boothEditIdx];
      b.code = code; b.name = name; b.type = type; b.recCode = recCode;
      b.zone = zone; b.staffCode = staffCode || '-'; b.staffName = staffName || '-';
      b.staff = staffName || '-'; b.phone = phone || '-'; b.rent = rent;
      b.change = change || '-'; b.boothPhone = boothPhone || '-';
      b.account = account || '-'; b.address = address || '';
      b.status = status; b.notes = notes || '';
      if (photoData) b.photo = photoData;
      b._custom = true;
      _syncCustomBoothsToStorage();
      _boothToast('แก้ไขบูธ "' + name + '" สำเร็จ');
    } else {
      // เพิ่มใหม่
      var entry = {
        code: code, name: name, type: type, recCode: recCode, zone: zone,
        staff: staffName || '-', staffCode: staffCode || '-', staffName: staffName || '-',
        phone: phone || '-', rent: rent, change: change || '-',
        boothPhone: boothPhone || '-', account: account || '-',
        status: status, photo: photoData || '', address: address || '',
        notes: notes || '', _custom: true
      };
      if (typeof BOOTH_INFO !== 'undefined') BOOTH_INFO.push(entry);
      _addCustomBoothToStorage(entry);
      _boothToast('เพิ่มบูธ "' + name + '" สำเร็จ');
    }

    f.reset();
    document.getElementById('adminBoothFormWrap').style.display = 'none';
    _boothEditIdx = -1;
    renderAdminBooth();
    if (typeof renderBoothInfo === 'function') renderBoothInfo();
  };

  if (photoFile) {
    var reader = new FileReader();
    reader.onload = function (e) { finishSave(e.target.result); };
    reader.readAsDataURL(photoFile);
  } else {
    finishSave('');
  }
};

// ======== Admin Panel: Render ตาราง ========
window.renderAdminBooth = function () {
  var container = document.getElementById('adminBoothTable');
  if (!container) return;
  if (typeof BOOTH_INFO === 'undefined' || !BOOTH_INFO.length) {
    container.innerHTML = '<p style="padding:16px;color:#94a3b8">ไม่มีข้อมูลบูธ</p>';
    return;
  }

  var cols = [
    { key: 'code',      label: 'รหัส' },
    { key: 'name',      label: 'ชื่อบูธ' },
    { key: 'type',      label: 'ประเภท' },
    { key: 'recCode',   label: 'รหัสจังหวัด' },
    { key: 'zone',      label: 'สถานกรรมสม' },
    { key: 'staffCode', label: 'รหัสพนักงาน' },
    { key: 'staffName', label: 'ชื่อ-นามสกุล' },
    { key: 'photo',     label: 'รูป' },
    { key: 'phone',     label: 'เบอร์โทรศัพท์' },
    { key: 'rent',      label: 'ค่าเช่า' },
    { key: 'change',    label: 'กินทลาน' },
    { key: 'boothPhone',label: 'เบอร์โทรบูธ' },
    { key: 'account',   label: 'เลขบัญชีธนาคิน' },
    { key: 'address',   label: 'ที่อยู่บูธ' },
    { key: 'status',    label: 'สถานะบูธ' },
    { key: 'notes',     label: 'หมายเหตุ' },
    { key: '_actions',  label: 'จัดการ' }
  ];

  var html = '<table style="width:100%;border-collapse:collapse;font-size:12px">';
  html += '<thead><tr>';
  cols.forEach(function (c) {
    html += '<th style="padding:8px 6px;background:linear-gradient(135deg,#ea580c,#f97316);color:#fff;' +
      'font-weight:700;text-align:left;white-space:nowrap;border-bottom:2px solid #c2410c">' + c.label + '</th>';
  });
  html += '</tr></thead><tbody>';

  BOOTH_INFO.forEach(function (b, idx) {
    var rowBg = idx % 2 === 0 ? '#fff' : '#fff7ed';
    html += '<tr style="background:' + rowBg + '">';
    cols.forEach(function (c) {
      var val = '';
      var style = 'padding:6px;border-bottom:1px solid #fed7aa;vertical-align:middle;';
      if (c.key === 'photo') {
        if (b.photo && b.photo.indexOf('data:') === 0) {
          val = '<img src="' + b.photo + '" style="width:60px;height:80px;object-fit:cover;border-radius:4px">';
        } else {
          val = '<span style="color:#94a3b8;font-size:11px">ไม่มีรูป</span>';
        }
      } else if (c.key === 'status') {
        var isOpen = (b.status || '').indexOf('เปิดกิจการ') >= 0;
        val = '<span style="padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700;' +
          (isOpen ? 'background:#dcfce7;color:#16a34a' : 'background:#fee2e2;color:#dc2626') + '">' +
          (b.status || '-') + '</span>';
      } else if (c.key === 'rent') {
        val = (b.rent || 0).toLocaleString();
      } else if (c.key === '_actions') {
        val = '<button onclick="editBoothEntry(' + idx + ')" style="border:none;background:#2563eb;color:#fff;' +
          'padding:3px 8px;border-radius:4px;cursor:pointer;font-size:11px;margin-right:4px">✏️ แก้ไข</button>' +
          '<button onclick="deleteBoothEntry(' + idx + ')" style="border:none;background:#dc2626;color:#fff;' +
          'padding:3px 8px;border-radius:4px;cursor:pointer;font-size:11px">🗑️ ลบ</button>';
      } else {
        val = b[c.key] || '-';
      }
      html += '<td style="' + style + '">' + val + '</td>';
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
};

// ---- ดาวน์โหลด CSV ----
window.adminDownloadBooth = function () {
  if (typeof BOOTH_INFO === 'undefined' || !BOOTH_INFO.length) {
    alert('ไม่มีข้อมูลบูธ');
    return;
  }
  var headers = ['รหัส', 'ชื่อบูธ', 'ประเภท', 'รหัสจังหวัด', 'สถานกรรมสม', 'รหัสพนักงาน',
    'ชื่อ-นามสกุล', 'เบอร์โทรศัพท์', 'ค่าเช่า', 'กินทลาน', 'เบอร์โทรบูธ', 'เลขบัญชีธนาคิน',
    'ที่อยู่บูธ', 'สถานะบูธ', 'หมายเหตุ'];
  var keys = ['code', 'name', 'type', 'recCode', 'zone', 'staffCode', 'staffName',
    'phone', 'rent', 'change', 'boothPhone', 'account', 'address', 'status', 'notes'];

  var bom = '﻿';
  var csv = bom + headers.join(',') + '\n';
  BOOTH_INFO.forEach(function (b) {
    var row = keys.map(function (k) {
      var v = (b[k] != null ? String(b[k]) : '').replace(/"/g, '""');
      return '"' + v + '"';
    });
    csv += row.join(',') + '\n';
  });

  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'BOOTH_INFO_' + new Date().toISOString().slice(0, 10) + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ---- แก้ไขบูธ (ใช้ฟอร์ม inline) ----
window.editBoothEntry = function (idx) {
  if (typeof BOOTH_INFO === 'undefined' || !BOOTH_INFO[idx]) return;
  var b = BOOTH_INFO[idx];

  _boothEditIdx = idx;
  var wrap = document.getElementById('adminBoothFormWrap');
  var title = document.getElementById('adminBoothFormTitle');
  var f = document.getElementById('adminBoothForm');
  if (!wrap || !f) return;

  if (title) title.textContent = '✏️ แก้ไขบูธ: ' + (b.name || b.code);

  f.code.value = b.code || '';
  f.name.value = b.name || '';
  f.type.value = b.type || 'บูธหลัก';
  f.recCode.value = b.recCode || '';
  f.zone.value = b.zone || '';
  f.category.value = b.category || 'บูธ รายวัน';
  f.staffCode.value = b.staffCode || '';
  f.staffName.value = b.staffName || '';
  f.phone.value = (b.phone && b.phone !== '-') ? b.phone : '';
  f.rent.value = b.rent || '';
  f.change.value = (b.change && b.change !== '-') ? b.change : '';
  f.boothPhone.value = (b.boothPhone && b.boothPhone !== '-') ? b.boothPhone : '';
  f.account.value = (b.account && b.account !== '-') ? b.account : '';
  f.address.value = b.address || '';
  f.status.value = b.status || 'เปิดกิจการ';
  f.notes.value = b.notes || '';

  wrap.style.display = 'block';
  wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// ---- ลบบูธ ----
window.deleteBoothEntry = function (idx) {
  if (typeof BOOTH_INFO === 'undefined' || !BOOTH_INFO[idx]) return;
  var b = BOOTH_INFO[idx];
  if (!confirm('ลบบูธ "' + b.name + '" ?')) return;

  BOOTH_INFO.splice(idx, 1);
  _syncCustomBoothsToStorage();
  renderAdminBooth();
  if (typeof renderBoothInfo === 'function') renderBoothInfo();
  _boothToast('ลบบูธ "' + b.name + '" สำเร็จ');
};

// ---- Storage helpers ----
function _addCustomBoothToStorage(entry) {
  var stored = [];
  try { stored = JSON.parse(localStorage.getItem('spbi_booth_custom') || '[]'); } catch (e) { stored = []; }
  stored.push(entry);
  localStorage.setItem('spbi_booth_custom', JSON.stringify(stored));
}

function _syncCustomBoothsToStorage() {
  var customs = [];
  if (typeof BOOTH_INFO !== 'undefined') {
    BOOTH_INFO.forEach(function (b) {
      if (b._custom) customs.push(b);
    });
  }
  localStorage.setItem('spbi_booth_custom', JSON.stringify(customs));
}

// ---- Toast notification ----
function _boothToast(msg) {
  var el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
    'background:linear-gradient(135deg,#ea580c,#f97316);color:#fff;padding:12px 28px;' +
    'border-radius:8px;font-size:14px;font-weight:600;z-index:99999;box-shadow:0 4px 16px rgba(0,0,0,.2);' +
    'transition:opacity .3s';
  document.body.appendChild(el);
  setTimeout(function () {
    el.style.opacity = '0';
    setTimeout(function () { document.body.removeChild(el); }, 300);
  }, 2000);
}

// ---- โหลด custom booths ตอน script load ----
loadCustomBooths();
