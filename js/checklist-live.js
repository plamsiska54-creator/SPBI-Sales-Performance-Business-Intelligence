// ============================================================
// CHECKLIST-LIVE.JS — ดึงข้อมูล Google Sheets + แจ้งเตือน + ฐานข้อมูลลูกค้า
// ============================================================
(function(){
'use strict';

var _cache = {};
var _allCustomers = [];
var _fetchedAt = null;
var THAI_DAYS = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];

function todayThaiDay(){
  return THAI_DAYS[new Date().getDay()];
}

function extractSheetId(url){
  var m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

function parseGvizJson(raw){
  var match = raw.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);?\s*$/);
  if(!match) return null;
  try { return JSON.parse(match[1]); } catch(e){ return null; }
}

function fetchSheet(sheetId){
  if(_cache[sheetId]) return Promise.resolve(_cache[sheetId]);
  return fetch('/api/sheet/'+sheetId)
    .then(function(r){ return r.text(); })
    .then(function(text){
      var parsed = parseGvizJson(text);
      if(!parsed || !parsed.table) return null;
      var cols = parsed.table.cols.map(function(c){ return (c.label||'').trim(); });
      var rows = (parsed.table.rows||[]).map(function(row){
        var obj = {};
        (row.c||[]).forEach(function(cell,i){
          if(i < cols.length){
            var val = cell ? (cell.v !== null && cell.v !== undefined ? cell.v : '') : '';
            obj[cols[i]] = val;
          }
        });
        return obj;
      });
      _cache[sheetId] = {cols:cols, rows:rows};
      return _cache[sheetId];
    })
    .catch(function(){ return null; });
}

function normalizeRow(row){
  var ordered = !!(row['สั่ง'] === true || row['สั่ง'] === 'TRUE' || row['สั่ง'] === 1);
  var notOrdered = !!(row['ไม่สั่ง'] === true || row['ไม่สั่ง'] === 'TRUE' || row['ไม่สั่ง'] === 1);
  var followed = !!(row['ตาม'] === true || row['ตาม'] === 'TRUE' || row['ตาม'] === 1);
  var code = row['รหัส']||row['รหัส ']||'';
  var name = row['ชื่อ']||row['ชื่อ ']||'';
  var branch = row['สาขา']||'';
  var zone = row['เขตการขาย']||'';
  var province = row['จังหวัด']||'';
  var billType = row['ประเภทบิล']||'';
  var reminder = row['Reminder']||'';
  var phone = row['การเคลม']||'';
  if(!code && !name) return null;
  return {
    ordered:ordered, notOrdered:notOrdered, followed:followed,
    code:code, name:name, branch:branch, zone:zone,
    province:province, billType:billType, reminder:reminder, phone:phone
  };
}

function fetchAllChecklists(progressCb){
  if(typeof ORD_CHECKLIST_ROUTES === 'undefined') return Promise.resolve([]);
  var routes = ORD_CHECKLIST_ROUTES;
  var total = routes.length;
  var done = 0;
  _allCustomers = [];

  var promises = routes.map(function(route){
    var sid = extractSheetId(route.url);
    if(!sid) return Promise.resolve(null);
    return fetchSheet(sid).then(function(data){
      done++;
      if(progressCb) progressCb(done, total);
      if(!data) return {route:route, customers:[], error:true};
      var customers = data.rows.map(normalizeRow).filter(Boolean);
      customers.forEach(function(c){
        c.routeName = route.route;
        c.routeCode = route.code;
        c.person = route.person;
        c.routeNo = route.no;
      });
      return {route:route, customers:customers, error:false};
    });
  });

  return Promise.all(promises).then(function(results){
    results = results.filter(Boolean);
    _allCustomers = [];
    results.forEach(function(r){
      if(!r.error) _allCustomers = _allCustomers.concat(r.customers);
    });
    _fetchedAt = new Date();
    return results;
  });
}

// ============================================================
// แจ้งเตือน
// ============================================================
function buildNotifications(results){
  var today = todayThaiDay();
  var alerts = [];

  // 1) วันนี้ต้องโทรกี่เส้น
  var todayRoutes = (typeof ORD_CHECKLIST_ROUTES !== 'undefined' ? ORD_CHECKLIST_ROUTES : [])
    .filter(function(r){ return r.orderDay.indexOf(today) !== -1; });
  if(todayRoutes.length > 0){
    var byPerson = {};
    todayRoutes.forEach(function(r){
      if(!byPerson[r.person]) byPerson[r.person] = [];
      byPerson[r.person].push(r.route);
    });
    var detail = Object.keys(byPerson).map(function(p){
      return '<b>'+p+'</b>: '+byPerson[p].join(', ');
    }).join('<br>');
    alerts.push({
      type:'info', icon:'📞',
      title:'วันนี้ ('+today+') มี '+todayRoutes.length+' เส้นทางต้องโทรรับออเดอร์',
      detail:detail
    });
  }

  if(!results) return alerts;

  // 2) เส้นไหนยังไม่ติ๊กเช็คลิส
  var uncheckedRoutes = [];
  results.forEach(function(r){
    if(r.error) return;
    var total = r.customers.length;
    var checked = r.customers.filter(function(c){ return c.ordered || c.notOrdered; }).length;
    if(total > 0 && checked < total){
      uncheckedRoutes.push({
        route:r.route.route, person:r.route.person,
        checked:checked, total:total, pct:Math.round(checked/total*100)
      });
    }
  });
  if(uncheckedRoutes.length > 0){
    var detail2 = uncheckedRoutes.slice(0,10).map(function(u){
      return '<b>'+u.route+'</b> ('+u.person+') — ติ๊กแล้ว '+u.checked+'/'+u.total+' ('+u.pct+'%)';
    }).join('<br>');
    if(uncheckedRoutes.length > 10) detail2 += '<br><i>...และอีก '+(uncheckedRoutes.length-10)+' เส้น</i>';
    alerts.push({
      type:'warning', icon:'⏳',
      title:uncheckedRoutes.length+' เส้นทางยังติ๊กเช็คลิสไม่ครบ',
      detail:detail2
    });
  }

  // 3) ร้านไม่สั่ง
  var notOrderedShops = _allCustomers.filter(function(c){ return c.notOrdered; });
  if(notOrderedShops.length > 0){
    var byRoute = {};
    notOrderedShops.forEach(function(c){
      if(!byRoute[c.routeName]) byRoute[c.routeName] = [];
      byRoute[c.routeName].push(c.name||c.code);
    });
    var routeKeys = Object.keys(byRoute);
    var detail3 = routeKeys.slice(0,8).map(function(r){
      return '<b>'+r+'</b>: '+byRoute[r].length+' ร้าน';
    }).join('<br>');
    if(routeKeys.length > 8) detail3 += '<br><i>...และอีก '+(routeKeys.length-8)+' เส้น</i>';
    alerts.push({
      type:'danger', icon:'🚫',
      title:'ร้านค้าไม่สั่ง '+notOrderedShops.length+' ร้าน (จาก '+routeKeys.length+' เส้นทาง)',
      detail:detail3
    });
  }

  // 4) สถานะรวม
  var totalShops = _allCustomers.length;
  var orderedCount = _allCustomers.filter(function(c){ return c.ordered; }).length;
  var notOrderedCount = notOrderedShops.length;
  var followedCount = _allCustomers.filter(function(c){ return c.followed; }).length;
  var pendingCount = totalShops - orderedCount - notOrderedCount;
  if(totalShops > 0){
    alerts.push({
      type:'status', icon:'📊',
      title:'สถานะเช็คลิสรวม: '+totalShops+' ร้านค้า',
      detail:'✅ สั่งซื้อ: <b style="color:#16a34a">'+orderedCount+'</b> | '
        +'🚫 ไม่สั่ง: <b style="color:#ef4444">'+notOrderedCount+'</b> | '
        +'📞 ตามแล้ว: <b style="color:#3b82f6">'+followedCount+'</b> | '
        +'⏳ รอดำเนินการ: <b style="color:#f59e0b">'+pendingCount+'</b>'
    });
  }

  return alerts;
}

function renderNotifications(container, alerts){
  var colors = {info:'#dbeafe',warning:'#fef3c7',danger:'#fee2e2',status:'#f0fdf4'};
  var borders = {info:'#3b82f6',warning:'#f59e0b',danger:'#ef4444',status:'#16a34a'};
  container.innerHTML = alerts.map(function(a){
    return '<div style="background:'+colors[a.type]+';border-left:4px solid '+borders[a.type]
      +';border-radius:8px;padding:12px 16px;margin-bottom:10px">'
      +'<div style="font-weight:700;font-size:0.95rem;margin-bottom:4px">'+a.icon+' '+a.title+'</div>'
      +'<div style="font-size:0.85rem;color:#374151;line-height:1.6">'+a.detail+'</div>'
      +'</div>';
  }).join('');
}

// ============================================================
// ฐานข้อมูลลูกค้า
// ============================================================
function renderCustomerDB(){
  var wrap = document.getElementById('ordCustomerDB');
  if(!wrap) return;

  if(_allCustomers.length === 0){
    wrap.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8">'
      +'<div style="font-size:2rem;margin-bottom:8px">📂</div>'
      +'<div>ยังไม่มีข้อมูล — กดปุ่ม "โหลดข้อมูลจาก Google Sheets" ที่แท็บเช็คลิสร้านค้าก่อน</div></div>';
    return;
  }

  var search = (document.getElementById('custDBSearch')||{}).value||'';
  search = search.trim().toLowerCase();
  var filterPerson = (document.getElementById('custDBPerson')||{}).value||'all';

  var filtered = _allCustomers;
  if(filterPerson !== 'all') filtered = filtered.filter(function(c){ return c.person === filterPerson; });
  if(search) filtered = filtered.filter(function(c){
    return (c.name+' '+c.code+' '+c.branch+' '+c.routeName+' '+c.province).toLowerCase().indexOf(search)!==-1;
  });

  var byRoute = {};
  filtered.forEach(function(c){
    var key = c.routeCode+' — '+c.routeName;
    if(!byRoute[key]) byRoute[key] = {code:c.routeCode, route:c.routeName, person:c.person, customers:[]};
    byRoute[key].customers.push(c);
  });
  var groups = Object.keys(byRoute).sort().map(function(k){ return byRoute[k]; });

  var staffColors = {'แตงกวา':'#3b82f6','บิวตี้':'#f59e0b','อ้อ':'#10b981','โบว์':'#8b5cf6','อัพ':'#ef4444'};
  var kpi = document.getElementById('custDBKPI');
  if(kpi){
    kpi.innerHTML = (typeof kpiCard === 'function' ?
      kpiCard('👥 ร้านค้าทั้งหมด',filtered.length+' ร้าน','')
      + kpiCard('🗺️ เส้นทาง',groups.length+' เส้น','')
      + kpiCard('✅ สั่งซื้อ',filtered.filter(function(c){return c.ordered;}).length+' ร้าน','','#16a34a')
      + kpiCard('🚫 ไม่สั่ง',filtered.filter(function(c){return c.notOrdered;}).length+' ร้าน','','#ef4444')
      : '');
  }

  var html = '';
  groups.forEach(function(g){
    var color = staffColors[g.person]||'#6b7280';
    var orderedN = g.customers.filter(function(c){return c.ordered;}).length;
    var notN = g.customers.filter(function(c){return c.notOrdered;}).length;
    var pendN = g.customers.length - orderedN - notN;

    html += '<div class="card" style="border-left:4px solid '+color+';margin-bottom:14px">'
      +'<div class="card-title" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">'
      +'<span style="background:'+color+';color:#fff;padding:2px 10px;border-radius:12px;font-size:0.85rem">'+g.code+'</span>'
      +'<span style="font-weight:700">'+g.route+'</span>'
      +'<span style="color:#64748b;font-size:0.85rem">'+g.person+'</span>'
      +'<span style="margin-left:auto;display:flex;gap:6px;font-size:0.8rem">'
      +'<span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:8px">✅ '+orderedN+'</span>'
      +'<span style="background:#fee2e2;color:#ef4444;padding:2px 8px;border-radius:8px">🚫 '+notN+'</span>'
      +'<span style="background:#fef3c7;color:#d97706;padding:2px 8px;border-radius:8px">⏳ '+pendN+'</span>'
      +'<span style="background:#e2e8f0;padding:2px 10px;border-radius:12px">รวม '+g.customers.length+' ร้าน</span>'
      +'</span></div>'
      +'<div class="table-wrap"><table><thead><tr>'
      +'<th style="width:40px">#</th><th>รหัส</th><th>ชื่อ</th><th>สาขา</th><th>จังหวัด</th><th>เขต</th><th style="text-align:center">สถานะ</th>'
      +'</tr></thead><tbody>';
    g.customers.forEach(function(c,i){
      var status = c.ordered ? '<span style="color:#16a34a;font-weight:600">✅ สั่ง</span>'
        : c.notOrdered ? '<span style="color:#ef4444;font-weight:600">🚫 ไม่สั่ง</span>'
        : '<span style="color:#d97706">⏳ รอ</span>';
      html += '<tr><td style="text-align:center;color:#94a3b8">'+(i+1)+'</td>'
        +'<td>'+c.code+'</td><td style="font-weight:600">'+c.name+'</td>'
        +'<td>'+c.branch+'</td><td>'+c.province+'</td><td>'+c.zone+'</td>'
        +'<td style="text-align:center">'+status+'</td></tr>';
    });
    html += '</tbody></table></div></div>';
  });

  wrap.innerHTML = html;
}

// ============================================================
// Main render — เรียกจาก checklist page
// ============================================================
window.loadLiveChecklist = function(){
  var notifBox = document.getElementById('ordChkNotif');
  var progressBox = document.getElementById('ordChkProgress');
  if(notifBox) notifBox.innerHTML = '<div style="text-align:center;padding:20px;color:#64748b">⏳ กำลังโหลดข้อมูลจาก Google Sheets...</div>';
  if(progressBox) progressBox.style.display = 'block';

  // แจ้งเตือนวันโทร (ไม่ต้องรอ fetch)
  var quickAlerts = buildNotifications(null);
  if(notifBox && quickAlerts.length > 0) renderNotifications(notifBox, quickAlerts);

  fetchAllChecklists(function(done, total){
    if(progressBox){
      var pct = Math.round(done/total*100);
      progressBox.innerHTML = '<div style="background:#e2e8f0;border-radius:8px;height:8px;overflow:hidden;margin:8px 0">'
        +'<div style="background:#3b82f6;height:100%;width:'+pct+'%;transition:width 0.3s"></div></div>'
        +'<div style="font-size:0.8rem;color:#64748b;text-align:center">โหลดแล้ว '+done+'/'+total+' เส้นทาง ('+pct+'%)</div>';
    }
  }).then(function(results){
    if(progressBox) progressBox.style.display = 'none';
    var alerts = buildNotifications(results);
    if(notifBox) renderNotifications(notifBox, alerts);
    if(_fetchedAt){
      var ts = _fetchedAt.toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'});
      var badge = document.getElementById('ordChkTimestamp');
      if(badge) badge.textContent = 'อัพเดทล่าสุด: '+ts;
    }
    renderCustomerDB();
  });
};

window.renderCustomerDB = renderCustomerDB;

window.refreshChecklist = function(){
  _cache = {};
  _allCustomers = [];
  window.loadLiveChecklist();
};

})();
