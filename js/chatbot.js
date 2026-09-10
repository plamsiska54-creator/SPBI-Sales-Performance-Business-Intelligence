/**
 * SPBI AI Chatbot — Data-Aware Assistant
 * สามารถสอบถามข้อมูลจริงจาก Dashboard ได้ทุกส่วน
 * อ่านจาก globals: MT_DATA, SALES_MONTHLY, getTargetByYear,
 * MT_CH_LABELS, CRM_DATA, BOOTH_CONTRACTS, BOOTH_PROMOTIONS ฯลฯ
 */
(function () {
  'use strict';

  // ลบ element เดิมก่อนสร้างใหม่ (ป้องกัน HMR/cache ซ้ำ)
  if (window.__spbiChatbotLoaded) {
    var oldFab = document.querySelector('.spbi-chat-fab');
    var oldPanel = document.querySelector('.spbi-chat-panel');
    var oldStyle = document.querySelector('style[data-chatbot="spbi"]');
    if (oldFab) oldFab.remove();
    if (oldPanel) oldPanel.remove();
    if (oldStyle) oldStyle.remove();
  }
  window.__spbiChatbotLoaded = true;

  var PREFIX = 'spbi-chat-';
  var STORAGE_KEY = 'spbi-chatbot-history';
  var TYPING_DELAY = 600;
  var Z_INDEX = 99999;

  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var MONTHS_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  var MONTH_MAP = {
    'มกราคม':'Jan','กุมภาพันธ์':'Feb','มีนาคม':'Mar','เมษายน':'Apr',
    'พฤษภาคม':'May','มิถุนายน':'Jun','กรกฎาคม':'Jul','สิงหาคม':'Aug',
    'กันยายน':'Sep','ตุลาคม':'Oct','พฤศจิกายน':'Nov','ธันวาคม':'Dec',
    'ม.ค.':'Jan','ก.พ.':'Feb','มี.ค.':'Mar','เม.ย.':'Apr',
    'พ.ค.':'May','มิ.ย.':'Jun','ก.ค.':'Jul','ส.ค.':'Aug',
    'ก.ย.':'Sep','ต.ค.':'Oct','พ.ย.':'Nov','ธ.ค.':'Dec',
    'jan':'Jan','feb':'Feb','mar':'Mar','apr':'Apr',
    'may':'May','jun':'Jun','jul':'Jul','aug':'Aug',
    'sep':'Sep','oct':'Oct','nov':'Nov','dec':'Dec',
    'มค':'Jan','กพ':'Feb','มีค':'Mar','เมย':'Apr',
    'พค':'May','มิย':'Jun','กค':'Jul','สค':'Aug',
    'กย':'Sep','ตค':'Oct','พย':'Nov','ธค':'Dec'
  };

  // ===== Helpers =====
  function fmtNum(n) {
    if (n == null) return '—';
    return Math.round(n).toLocaleString('th-TH');
  }
  function fmtMoney(n) {
    if (n == null) return '—';
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + ' ล้านบาท';
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + ' พันบาท';
    return fmtNum(n) + ' บาท';
  }

  function detectApp() {
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf('/health-bento') !== -1) return 'health-bento';
    if (path.indexOf('/bakery') !== -1) return 'bakery';
    return 'spbi';
  }

  function norm(s) { return (s || '').toLowerCase().trim().replace(/\s+/g, ' '); }

  function extractMonth(text) {
    var n = norm(text);
    for (var k in MONTH_MAP) {
      if (n.indexOf(k.toLowerCase()) !== -1) return MONTH_MAP[k];
    }
    return null;
  }

  function extractChannel(text) {
    var n = norm(text);
    var labels = typeof MT_CH_LABELS !== 'undefined' ? MT_CH_LABELS : {};
    var map = {
      'cj':'CJ','bigc':'BigC','big c':'BigC','บิ๊กซี':'BigC',
      'top':'Top','tops':'Top','ท็อป':'Top',
      'makro':'Makro','แม็คโคร':'Makro',
      'mm':'MM','mega':'MM','เอ็มเอ็ม':'MM',
      'aeon':'Aeon','อิออน':'Aeon',
      'the mall':'TheMall','themall':'TheMall','เดอะมอลล์':'TheMall'
    };
    for (var k in map) {
      if (n.indexOf(k) !== -1) return map[k];
    }
    for (var key in labels) {
      if (n.indexOf(labels[key].toLowerCase()) !== -1) return key;
    }
    return null;
  }

  // ===== Data Query Functions =====

  function queryMTSales(channel, month) {
    if (typeof MT_DATA === 'undefined') return null;
    var data = MT_DATA;

    if (channel && data.ch && data.ch[channel]) {
      var products = data.ch[channel];
      var totalU = 0, totalB = 0;

      if (month) {
        for (var i = 0; i < products.length; i++) {
          var p = products[i];
          if (p.m && p.m[month]) {
            totalU += (p.m[month].u || 0);
            totalB += (p.m[month].b || 0);
          }
        }
        var mi = MONTHS.indexOf(month);
        return 'ยอดขาย ' + getChLabel(channel) + ' เดือน' + MONTHS_TH[mi] + ':\n' +
               '• ยอดขาย: ' + fmtMoney(totalB) + '\n' +
               '• จำนวน: ' + fmtNum(totalU) + ' ชิ้น\n' +
               '• สินค้า ' + products.length + ' รายการ';
      }

      for (var j = 0; j < products.length; j++) {
        totalU += (products[j].tu || 0);
        totalB += (products[j].tb || 0);
      }
      return 'ยอดขาย ' + getChLabel(channel) + ' (YTD):\n' +
             '• ยอดขาย: ' + fmtMoney(totalB) + '\n' +
             '• จำนวน: ' + fmtNum(totalU) + ' ชิ้น\n' +
             '• สินค้า ' + products.length + ' รายการ';
    }

    if (month && data.monthly && data.monthly[month]) {
      var m = data.monthly[month];
      var mi2 = MONTHS.indexOf(month);
      return 'ยอดขาย MT รวมเดือน' + MONTHS_TH[mi2] + ':\n' +
             '• ยอดขาย: ' + fmtMoney(m.b) + '\n' +
             '• จำนวน: ' + fmtNum(m.u) + ' ชิ้น';
    }

    if (!channel && !month) {
      var totB = 0, totU = 0;
      for (var mk in data.monthly) {
        totB += (data.monthly[mk].b || 0);
        totU += (data.monthly[mk].u || 0);
      }
      return 'ยอดขาย MT รวม (YTD):\n' +
             '• ยอดขาย: ' + fmtMoney(totB) + '\n' +
             '• จำนวน: ' + fmtNum(totU) + ' ชิ้น';
    }

    return null;
  }

  function getChLabel(key) {
    if (typeof MT_CH_LABELS !== 'undefined' && MT_CH_LABELS[key]) return MT_CH_LABELS[key];
    return key;
  }

  function queryTopProducts(channel, n) {
    if (typeof MT_DATA === 'undefined') return null;
    n = n || 5;
    var products;
    if (channel && MT_DATA.ch && MT_DATA.ch[channel]) {
      products = MT_DATA.ch[channel];
    } else {
      products = [];
      for (var ch in MT_DATA.ch) {
        products = products.concat(MT_DATA.ch[ch]);
      }
    }

    products = products.slice().sort(function(a, b) { return (b.tb || 0) - (a.tb || 0); });
    var top = products.slice(0, n);
    var label = channel ? getChLabel(channel) : 'MT ทุกช่องทาง';
    var lines = ['🏆 สินค้าขายดี Top ' + n + ' (' + label + '):'];
    for (var i = 0; i < top.length; i++) {
      var p = top[i];
      var name = p.name.replace(/^วรรณวนัช|^วรรณววนัช|^วรรฯวนัช|^วรรณวัช/g, '').trim();
      lines.push((i + 1) + '. ' + name + '\n   ยอด ' + fmtMoney(p.tb) + ' | ' + fmtNum(p.tu) + ' ชิ้น');
    }
    return lines.join('\n');
  }

  function queryTarget(channel, month) {
    if (typeof getTargetByYear !== 'function') return null;
    var target;
    try { target = getTargetByYear(2026); } catch (e) { return null; }
    if (!target || !target.mt) return null;

    if (channel && target.mt[channel]) {
      var ct = target.mt[channel];
      if (month) {
        var mi = MONTHS.indexOf(month);
        if (mi >= 0 && ct.monthly && ct.monthly[mi] != null) {
          var mtTarget = ct.monthly[mi];
          var actual = 0;
          if (typeof MT_DATA !== 'undefined' && MT_DATA.ch && MT_DATA.ch[channel]) {
            var prods = MT_DATA.ch[channel];
            for (var i = 0; i < prods.length; i++) {
              if (prods[i].m && prods[i].m[month]) actual += (prods[i].m[month].b || 0);
            }
          }
          var ach = mtTarget > 0 ? (actual / mtTarget * 100) : 0;
          return 'เป้า vs ยอดจริง ' + getChLabel(channel) + ' เดือน' + MONTHS_TH[mi] + ':\n' +
                 '• เป้าหมาย: ' + fmtMoney(mtTarget) + '\n' +
                 '• ยอดจริง: ' + fmtMoney(actual) + '\n' +
                 '• Achievement: ' + ach.toFixed(1) + '%' +
                 (ach >= 100 ? ' ✅ ทำได้ตามเป้า!' : ach >= 80 ? ' 🟡 ใกล้เป้า' : ' 🔴 ต่ำกว่าเป้า');
        }
      }
      return 'เป้าหมาย ' + getChLabel(channel) + ' ปี 2026: ' + fmtMoney(ct.total);
    }

    if (!channel && target.mtTotal) {
      return 'เป้าหมาย MT รวมปี 2026: ' + fmtMoney(target.mtTotal.total) + '\n' +
             'เป้ารวมทุกช่องทาง (Grand Total): ' + fmtMoney(target.grandTotal.total);
    }

    return null;
  }

  function queryTargetAllChannels() {
    if (typeof getTargetByYear !== 'function') return null;
    var target;
    try { target = getTargetByYear(2026); } catch (e) { return null; }
    if (!target) return null;

    var lines = ['📊 เป้าหมายปี 2026:'];
    if (target.mt) {
      for (var ch in target.mt) {
        lines.push('• ' + getChLabel(ch) + ': ' + fmtMoney(target.mt[ch].total));
      }
    }
    if (target.mtTotal) lines.push('MT รวม: ' + fmtMoney(target.mtTotal.total));
    if (target.amazonTotal) lines.push('Amazon รวม: ' + fmtMoney(target.amazonTotal.total));
    if (target.onlineTotal) lines.push('Online รวม: ' + fmtMoney(target.onlineTotal.total));
    if (target.boothTotal) lines.push('Booth รวม: ' + fmtMoney(target.boothTotal.total));
    if (target.grandTotal) lines.push('\n🎯 Grand Total: ' + fmtMoney(target.grandTotal.total));
    return lines.join('\n');
  }

  function querySalesPerson(text) {
    if (typeof SALES_MONTHLY === 'undefined') return null;
    var n = norm(text);
    var result = [];
    for (var name in SALES_MONTHLY) {
      if (n.indexOf(norm(name).replace(/\s/g, '')) !== -1 || n.indexOf(norm(name)) !== -1) {
        var d = SALES_MONTHLY[name];
        var total = 0;
        for (var mk in d) {
          if (mk !== 'zone' && typeof d[mk] === 'number') total += d[mk];
        }
        var ytdTarget = typeof SALES_YTD_TARGET !== 'undefined' ? SALES_YTD_TARGET[name] : null;
        var ach = ytdTarget ? (total / ytdTarget * 100) : 0;
        var line = '👤 ' + name + ' (' + d.zone + '):\n' +
                   '• ยอดขาย YTD: ' + fmtMoney(total);
        if (ytdTarget) {
          line += '\n• เป้า YTD: ' + fmtMoney(ytdTarget) +
                  '\n• Achievement: ' + ach.toFixed(1) + '%';
        }
        result.push(line);
      }
    }
    return result.length > 0 ? result.join('\n\n') : null;
  }

  function querySalesOverview() {
    if (typeof SALES_MONTHLY === 'undefined') return null;
    var lines = ['📋 สรุปยอดขายรายพนักงาน (YTD):'];
    for (var name in SALES_MONTHLY) {
      var d = SALES_MONTHLY[name];
      var total = 0;
      for (var mk in d) {
        if (mk !== 'zone' && typeof d[mk] === 'number') total += d[mk];
      }
      lines.push('• ' + name + ': ' + fmtMoney(total));
    }
    return lines.join('\n');
  }

  function queryBooth() {
    var contracts = typeof BOOTH_CONTRACTS !== 'undefined' ? BOOTH_CONTRACTS :
                    typeof window.BOOTH_CONTRACTS !== 'undefined' ? window.BOOTH_CONTRACTS : null;
    if (!contracts) return null;

    var lines = ['📍 สัญญาเช่าบูธ (' + contracts.length + ' บูธ):'];
    var today = new Date().toISOString().slice(0, 10);
    var active = 0, expiringSoon = 0;
    for (var i = 0; i < contracts.length; i++) {
      var c = contracts[i];
      if (c.end >= today) active++;
      var daysLeft = Math.round((new Date(c.end) - new Date()) / 86400000);
      if (daysLeft <= 60 && daysLeft >= 0) expiringSoon++;
    }
    lines.push('• บูธที่ยังมีสัญญา: ' + active);
    lines.push('• ใกล้หมดสัญญา (≤60 วัน): ' + expiringSoon);

    if (expiringSoon > 0) {
      lines.push('\n⚠️ ใกล้หมดสัญญา:');
      for (var j = 0; j < contracts.length; j++) {
        var cc = contracts[j];
        var dl = Math.round((new Date(cc.end) - new Date()) / 86400000);
        if (dl <= 60 && dl >= 0) {
          lines.push('• ' + cc.booth + ' — หมด ' + cc.end + ' (อีก ' + dl + ' วัน)');
        }
      }
    }
    return lines.join('\n');
  }

  function queryPromotion() {
    var promos = typeof BOOTH_PROMOTIONS !== 'undefined' ? BOOTH_PROMOTIONS :
                 typeof window.BOOTH_PROMOTIONS !== 'undefined' ? window.BOOTH_PROMOTIONS : null;
    if (!promos) return null;

    var active = promos.filter(function(p) { return p.status === 'active'; });
    var upcoming = promos.filter(function(p) { return p.status === 'upcoming'; });

    var lines = ['🎉 โปรโมชั่นบูธ:'];
    if (active.length) {
      lines.push('\n✅ กำลังดำเนินอยู่ (' + active.length + '):');
      for (var i = 0; i < active.length; i++) {
        lines.push('• ' + active[i].booth + ': ' + active[i].promo);
      }
    }
    if (upcoming.length) {
      lines.push('\n📅 เร็วๆ นี้ (' + upcoming.length + '):');
      for (var j = 0; j < upcoming.length; j++) {
        lines.push('• ' + upcoming[j].booth + ': ' + upcoming[j].promo + ' (เริ่ม ' + upcoming[j].start + ')');
      }
    }
    return lines.join('\n');
  }

  function queryCRM(text) {
    var crm = typeof CRM_DATA !== 'undefined' ? CRM_DATA :
              typeof window.CRM_DATA !== 'undefined' ? window.CRM_DATA : null;
    if (!crm) return null;
    var n = norm(text);

    var allCustomers = [];
    for (var cat in crm) {
      var cust = crm[cat].customers;
      if (cust) {
        for (var i = 0; i < cust.length; i++) {
          allCustomers.push(cust[i]);
        }
      }
    }

    var found = allCustomers.filter(function(c) {
      return n.indexOf(norm(c.name)) !== -1;
    });

    if (found.length > 0) {
      return found.map(function(c) {
        return '🏢 ' + c.name + ':\n' +
               '• สถานะ: ' + c.status + '\n' +
               '• ออเดอร์ล่าสุด: ' + c.lastOrder + '\n' +
               '• ยอดสั่งซื้อรวม: ' + fmtMoney(c.totalSales) + '\n' +
               '• ผู้ติดต่อ: ' + c.contact + ' ' + c.phone + '\n' +
               '• เยี่ยมครั้งถัดไป: ' + c.nextVisit;
      }).join('\n\n');
    }

    return null;
  }

  function queryChannelComparison() {
    if (typeof MT_DATA === 'undefined') return null;
    var lines = ['📊 เปรียบเทียบยอดขาย MT ทุกช่องทาง (YTD):'];
    var chData = [];
    for (var ch in MT_DATA.ch) {
      var products = MT_DATA.ch[ch];
      var totalB = 0;
      for (var i = 0; i < products.length; i++) totalB += (products[i].tb || 0);
      chData.push({ key: ch, total: totalB, count: products.length });
    }
    chData.sort(function(a, b) { return b.total - a.total; });
    for (var j = 0; j < chData.length; j++) {
      var d = chData[j];
      lines.push((j + 1) + '. ' + getChLabel(d.key) + ': ' + fmtMoney(d.total) + ' (' + d.count + ' SKU)');
    }
    return lines.join('\n');
  }

  function queryProductSearch(text) {
    if (typeof MT_DATA === 'undefined') return null;
    var n = norm(text);
    var keywords = ['ไก่หยอง','แซนวิช','เครป','เค้ก','ชิฟฟอน','สังขยา','เอแคลร์',
                    'ครีมฮอร์น','ขนมปัง','พิซซ่า','ช็อกโกแลต','มะพร้าว','ฝอยทอง',
                    'บานอฟฟี่','ทิรามิสุ','มินิบัน','ลองบัน','คัพเค้ก','โอรีโอ',
                    'แยม','สตรอว์เบอร์รี่','ปูอัด','แฮม','ชีส','ไส้กรอก',
                    'เผือก','ลอดช่อง','ชาไทย','กาแฟ','กล้วยหอม','มัทฉะ',
                    'วุ้นกะทิ','ทาร์ต','คุกกี้'];

    var searchTerm = null;
    for (var i = 0; i < keywords.length; i++) {
      if (n.indexOf(keywords[i].toLowerCase()) !== -1) { searchTerm = keywords[i]; break; }
    }
    if (!searchTerm) return null;

    var results = [];
    for (var ch in MT_DATA.ch) {
      var prods = MT_DATA.ch[ch];
      for (var j = 0; j < prods.length; j++) {
        if (norm(prods[j].name).indexOf(searchTerm.toLowerCase()) !== -1) {
          results.push({ ch: ch, p: prods[j] });
        }
      }
    }
    if (results.length === 0) return 'ไม่พบสินค้าที่มีคำว่า "' + searchTerm + '" ในระบบ';

    results.sort(function(a, b) { return (b.p.tb || 0) - (a.p.tb || 0); });
    var show = results.slice(0, 8);
    var lines = ['🔍 สินค้าที่เกี่ยวกับ "' + searchTerm + '" (' + results.length + ' รายการ):'];
    for (var k = 0; k < show.length; k++) {
      var r = show[k];
      var name = r.p.name.replace(/^วรรณวนัช|^วรรณววนัช|^วรรฯวนัช|^วรรณวัช|\(BC\)\s*/g, '').trim();
      lines.push('• [' + getChLabel(r.ch) + '] ' + name + '\n  ยอด ' + fmtMoney(r.p.tb) + ' | Rank ' + r.p.rank);
    }
    if (results.length > 8) lines.push('... และอีก ' + (results.length - 8) + ' รายการ');
    return lines.join('\n');
  }

  // ===== Intent Recognition =====
  function processQuery(text) {
    var n = norm(text);
    var month = extractMonth(text);
    var channel = extractChannel(text);
    var app = detectApp();

    // Health Bento — redirect to general info
    if (app === 'health-bento') {
      return processHealthBentoQuery(n);
    }
    if (app === 'bakery') {
      return processBakeryQuery(n);
    }

    // สินค้าขายดี / Top product
    if (n.indexOf('ขายดี') !== -1 || n.indexOf('top') !== -1 || n.indexOf('อันดับ') !== -1 ||
        n.indexOf('best') !== -1 || n.indexOf('ที่สุด') !== -1) {
      var numMatch = n.match(/(\d+)/);
      var topN = numMatch ? parseInt(numMatch[1]) : 5;
      if (topN > 20) topN = 20;
      var result = queryTopProducts(channel, topN);
      if (result) return result;
    }

    // เปรียบเทียบช่องทาง
    if (n.indexOf('เปรียบเทียบ') !== -1 || n.indexOf('ทุกช่องทาง') !== -1 ||
        n.indexOf('ทุกห้าง') !== -1 || n.indexOf('compare') !== -1 || n.indexOf('ranking') !== -1) {
      var comp = queryChannelComparison();
      if (comp) return comp;
    }

    // เป้าหมาย / Target / Achievement
    if (n.indexOf('เป้า') !== -1 || n.indexOf('target') !== -1 || n.indexOf('achievement') !== -1 ||
        n.indexOf('ทำได้') !== -1 || n.indexOf('เทียบเป้า') !== -1 || n.indexOf('ถึงเป้า') !== -1) {
      if (n.indexOf('ทุก') !== -1 || n.indexOf('ทั้งหมด') !== -1 || n.indexOf('รวม') !== -1) {
        var allT = queryTargetAllChannels();
        if (allT) return allT;
      }
      var tResult = queryTarget(channel, month);
      if (tResult) return tResult;
      var allTargets = queryTargetAllChannels();
      if (allTargets) return allTargets;
    }

    // ยอดขาย / sales
    if (n.indexOf('ยอดขาย') !== -1 || n.indexOf('ยอด') !== -1 || n.indexOf('sales') !== -1 ||
        n.indexOf('revenue') !== -1 || n.indexOf('รายได้') !== -1 || n.indexOf('เท่าไหร่') !== -1 ||
        n.indexOf('เท่าไร') !== -1) {
      if (channel || month) {
        var sResult = queryMTSales(channel, month);
        if (sResult) return sResult;
      }
      if (n.indexOf('พนักงาน') !== -1 || n.indexOf('เซลล์') !== -1 || n.indexOf('ทีม') !== -1) {
        var sov = querySalesOverview();
        if (sov) return sov;
      }
      var personResult = querySalesPerson(text);
      if (personResult) return personResult;
      var allSales = queryMTSales(null, null);
      if (allSales) return allSales;
    }

    // ค้นหาสินค้า
    if (n.indexOf('สินค้า') !== -1 || n.indexOf('product') !== -1 || n.indexOf('ค้นหา') !== -1 ||
        n.indexOf('หา') !== -1 || n.indexOf('มี') !== -1) {
      var pSearch = queryProductSearch(text);
      if (pSearch) return pSearch;
    }

    // บูธ / สาขา
    if (n.indexOf('บูธ') !== -1 || n.indexOf('booth') !== -1 || n.indexOf('สัญญา') !== -1 ||
        n.indexOf('เช่า') !== -1 || n.indexOf('หมดสัญญา') !== -1) {
      var bResult = queryBooth();
      if (bResult) return bResult;
    }

    // โปรโมชั่น
    if (n.indexOf('โปรโมชั่น') !== -1 || n.indexOf('โปร') !== -1 || n.indexOf('promo') !== -1 ||
        n.indexOf('ส่งเสริม') !== -1 || n.indexOf('แคมเปญ') !== -1) {
      var prResult = queryPromotion();
      if (prResult) return prResult;
    }

    // CRM / ลูกค้า
    if (n.indexOf('crm') !== -1 || n.indexOf('ลูกค้า') !== -1 || n.indexOf('customer') !== -1 ||
        n.indexOf('ออเดอร์') !== -1 || n.indexOf('ติดต่อ') !== -1) {
      var crmResult = queryCRM(text);
      if (crmResult) return crmResult;
    }

    // Channel-specific query without explicit "ยอดขาย"
    if (channel) {
      var chSales = queryMTSales(channel, month);
      if (chSales) return chSales;
    }

    // Person query
    var personR = querySalesPerson(text);
    if (personR) return personR;

    // Product search fallback
    var prodR = queryProductSearch(text);
    if (prodR) return prodR;

    // FAQ fallback
    return findFAQ(text);
  }

  function processHealthBentoQuery(n) {
    if (n.indexOf('retail') !== -1 || n.indexOf('ห้าง') !== -1 || n.indexOf('วางขาย') !== -1)
      return 'ดูข้อมูลห้างได้ที่เมนู "ห้าง / Modern Trade" ทางซ้าย มีข้อมูลเปรียบเทียบทุกห้างพร้อมดัชนีสุขภาพ';
    if (n.indexOf('สินค้า') !== -1 || n.indexOf('product') !== -1)
      return 'ดูข้อมูลสินค้าได้ที่เมนู "สินค้า" มีรายละเอียดสินค้าทุกกลุ่มและการวิเคราะห์คู่แข่ง';
    if (n.indexOf('ตลาด') !== -1 || n.indexOf('market') !== -1)
      return 'ดูวิเคราะห์ตลาดได้ที่เมนู "ตลาด" มีข้อมูลขนาดตลาด เทรนด์ และกลุ่มเป้าหมาย';
    if (n.indexOf('แผน') !== -1 || n.indexOf('plan') !== -1)
      return 'ดูแผนธุรกิจได้ที่เมนู "แผนธุรกิจ" มี Timeline และ Action Items';
    return 'Health Bento Dashboard มี 8 ส่วน: ภาพรวม, ตลาด, สินค้า, การผลิต, การตลาด, ห้าง, การเงิน, แผนธุรกิจ\nเลือกเมนูทางซ้ายเพื่อดูข้อมูลแต่ละส่วนครับ';
  }

  function processBakeryQuery(n) {
    if (n.indexOf('ตลาด') !== -1 || n.indexOf('market') !== -1)
      return 'Bakery Analytics แสดงภาพรวมตลาดเบเกอรี่ไทย รวมถึงขนาดตลาด เทรนด์ และส่วนแบ่ง';
    if (n.indexOf('คู่แข่ง') !== -1 || n.indexOf('competitor') !== -1)
      return 'ดูข้อมูลคู่แข่งได้ในส่วน Competitor Analysis มีเปรียบเทียบแบรนด์หลักในตลาดเบเกอรี่';
    if (n.indexOf('ผู้บริโภค') !== -1 || n.indexOf('consumer') !== -1 || n.indexOf('พฤติกรรม') !== -1)
      return 'ดูข้อมูลพฤติกรรมผู้บริโภคเบเกอรี่ในส่วน Consumer Insights';
    return 'Bakery Analytics เป็นแดชบอร์ดวิเคราะห์ตลาดเบเกอรี่ไทย ครอบคลุม: ภาพรวมตลาด, คู่แข่ง, พฤติกรรมผู้บริโภค, พื้นที่/ภูมิภาค\nเลื่อนดูแต่ละส่วนได้เลยครับ';
  }

  // ===== FAQ Fallback =====
  var FAQ = [
    { kw: ['dashboard','คืออะไร','spbi','ระบบ','ภาพรวม','เกี่ยวกับ'],
      a: 'SPBI (Sales Performance & Business Intelligence) คือระบบติดตามผลงานขายและวิเคราะห์ธุรกิจแบบรวมศูนย์ ครอบคลุม MT, Amazon, Online, Booth และอื่นๆ' },
    { kw: ['กี่แท็บ','แท็บ','tab','เมนู','หน้า'],
      a: 'ระบบหลักมี 9 แท็บ: ภาพรวม, Amazon, ออนไลน์, Daily, ห้างค้าปลีก (MT), บูธ/อีเว้นท์, Ordering, KPI/CRM, ค่าใช้จ่ายฝ่ายขาย' },
    { kw: ['อัปเดต','update','เมื่อไหร่','ล่าสุด','ปรับปรุง'],
      a: 'ข้อมูลอัปเดตตามรอบเดือน โดยข้อมูลปี 2024-2025 เป็นข้อมูลที่ finalize แล้ว ส่วนปี 2026 อัปเดตจาก Excel' },
    { kw: ['ห้าง','mt','modern trade','ค้าปลีก','อะไรบ้าง'],
      a: 'ระบบรองรับ 7 ช่องทาง MT: CJ, Big C, Top, Makro, MM Mega, Aeon, The Mall' },
    { kw: ['ธีม','theme','dark','light','มืด','สว่าง','โหมด'],
      a: 'กดปุ่มดวงจันทร์/ดวงอาทิตย์ที่มุมบนขวาเพื่อสลับ Dark/Light Mode ได้ครับ' },
    { kw: ['filter','กรอง','ตัวกรอง','เลือก','ปี','เดือน'],
      a: 'เลือก filter ด้านบนของแต่ละหน้า (ปี, เดือน, ช่องทาง, ภูมิภาค) ข้อมูลในกราฟและตารางจะอัปเดตทันที' },
    { kw: ['amazon','อเมซอน','แมป','สาขา'],
      a: 'ดูข้อมูล Amazon ได้ที่แท็บ Amazon มียอดขายรายเดือนแยกตามภูมิภาค และแผนที่สาขา' },
    { kw: ['online','ออนไลน์','tiktok','facebook','shopee','lazada'],
      a: 'ดูข้อมูลออนไลน์ได้ที่แท็บ Online มี TikTok, Facebook, Shopee, Lazada' },
    { kw: ['kpi','ตัวชี้วัด','วัดผล'],
      a: 'ดูข้อมูล KPI ได้ที่แท็บ KPI/CRM มีตัวชี้วัดผลงานและข้อมูลลูกค้า' },
    { kw: ['ค่าใช้จ่าย','expense','ฝ่ายขาย','budget','งบ'],
      a: 'ดูค่าใช้จ่ายฝ่ายขายได้ที่แท็บ Sales Expense มีรายละเอียดค่าใช้จ่ายแต่ละหมวด' },
    { kw: ['สวัสดี','หวัดดี','hello','hi','ดี','hey'],
      a: 'สวัสดีครับ! ผมเป็นผู้ช่วย AI ของ SPBI ถามเรื่องยอดขาย, เป้าหมาย, สินค้า, ห้าง, โปรโมชั่น หรืออะไรก็ได้เลยครับ 😊' },
    { kw: ['ขอบคุณ','thanks','thank'],
      a: 'ยินดีครับ! มีอะไรให้ช่วยเพิ่มเติมถามได้เลยนะครับ 😊' },
    { kw: ['ช่วย','help','ทำอะไรได้','ถามอะไรได้'],
      a: 'ผมช่วยได้หลายเรื่องเลยครับ:\n• ถามยอดขาย: "ยอดขาย CJ เดือนนี้"\n• ดูเป้า: "เป้าหมาย BigC"\n• สินค้าขายดี: "Top 5 สินค้าขายดี"\n• เปรียบเทียบ: "เปรียบเทียบทุกช่องทาง"\n• บูธ: "สถานะบูธ"\n• โปรโมชั่น: "โปรโมชั่นตอนนี้"\n• ค้นหาสินค้า: "สินค้าไก่หยอง"' }
  ];

  function findFAQ(text) {
    var n = norm(text);
    var best = null, bestScore = 0;
    for (var i = 0; i < FAQ.length; i++) {
      var score = 0;
      for (var j = 0; j < FAQ[i].kw.length; j++) {
        if (n.indexOf(FAQ[i].kw[j]) !== -1) score++;
      }
      if (score > bestScore) { bestScore = score; best = FAQ[i]; }
    }
    if (best && bestScore > 0) return best.a;
    return 'ขอโทษครับ ผมไม่แน่ใจคำถามนี้ ลองถามเช่น:\n• "ยอดขาย CJ" หรือ "ยอดขาย BigC เดือน ก.ค."\n• "สินค้าขายดี Top 5"\n• "เป้าหมายปี 2026"\n• "เปรียบเทียบทุกช่องทาง"\n• "สถานะบูธ" หรือ "โปรโมชั่น"';
  }

  // ===== Session Storage =====
  function loadHistory() {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveHistory(msgs) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(msgs)); } catch (e) {}
  }

  // ===== Quick Suggestions =====
  function getQuickSuggestions() {
    var app = detectApp();
    if (app === 'health-bento') {
      return [
        { label: 'ภาพรวม', text: 'Health Bento คืออะไร' },
        { label: 'ห้างไหนเหมาะ', text: 'ห้างไหนเหมาะวางขาย' },
        { label: 'ข้อมูลสินค้า', text: 'ดูข้อมูลสินค้า' }
      ];
    }
    if (app === 'bakery') {
      return [
        { label: 'ภาพรวม', text: 'Bakery Analytics คืออะไร' },
        { label: 'คู่แข่ง', text: 'ข้อมูลคู่แข่ง' }
      ];
    }
    return [
      { label: '📊 ยอดขาย MT', text: 'ยอดขาย MT รวม' },
      { label: '🏆 สินค้าขายดี', text: 'สินค้าขายดี Top 5' },
      { label: '🎯 เป้าหมาย', text: 'เป้าหมายทุกช่องทาง' },
      { label: '📈 เปรียบเทียบ', text: 'เปรียบเทียบทุกช่องทาง' },
      { label: '📍 บูธ', text: 'สถานะบูธ' },
      { label: '❓ ช่วยอะไรได้', text: 'ช่วยอะไรได้บ้าง' }
    ];
  }

  // ===== Inject CSS =====
  function injectStyles() {
    var css = '' +
      '.' + PREFIX + 'fab{' +
        'position:fixed;bottom:24px;right:24px;width:56px;height:56px;' +
        'border-radius:50%;background:linear-gradient(135deg,#4f46e5,#7c3aed);border:none;cursor:pointer;' +
        'box-shadow:0 4px 14px rgba(79,70,229,.4);z-index:' + Z_INDEX + ';' +
        'display:flex;align-items:center;justify-content:center;' +
        'transition:transform .2s ease,box-shadow .2s ease;outline:none;padding:0;' +
      '}' +
      '.' + PREFIX + 'fab:hover{transform:scale(1.1);box-shadow:0 6px 20px rgba(79,70,229,.5);}' +
      '.' + PREFIX + 'fab svg{width:28px;height:28px;fill:#fff;pointer-events:none;}' +
      '.' + PREFIX + 'fab-close svg{width:22px;height:22px;}' +

      '.' + PREFIX + 'panel{' +
        'position:fixed;bottom:92px;right:24px;width:400px;max-height:560px;' +
        'border-radius:16px;background:#fff;' +
        'box-shadow:0 12px 40px rgba(0,0,0,.15);z-index:' + Z_INDEX + ';' +
        'display:flex;flex-direction:column;overflow:hidden;' +
        'opacity:0;transform:translateY(20px) scale(.95);pointer-events:none;' +
        'transition:opacity .25s ease,transform .25s ease;' +
        'font-family:"Noto Sans Thai",system-ui,sans-serif;font-size:14px;color:#1e293b;' +
      '}' +
      '.' + PREFIX + 'panel.' + PREFIX + 'open{' +
        'opacity:1;transform:translateY(0) scale(1);pointer-events:auto;' +
      '}' +

      '.' + PREFIX + 'header{' +
        'display:flex;align-items:center;gap:8px;padding:14px 16px;' +
        'background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;flex-shrink:0;' +
      '}' +
      '.' + PREFIX + 'header-icon{font-size:20px;line-height:1;}' +
      '.' + PREFIX + 'header-title{flex:1;font-weight:600;font-size:15px;}' +
      '.' + PREFIX + 'header-badge{font-size:10px;background:rgba(255,255,255,.2);padding:2px 8px;border-radius:10px;}' +
      '.' + PREFIX + 'header-close{' +
        'background:none;border:none;color:#fff;cursor:pointer;padding:4px;' +
        'border-radius:6px;display:flex;align-items:center;justify-content:center;opacity:.8;transition:opacity .15s;' +
      '}' +
      '.' + PREFIX + 'header-close:hover{opacity:1;}' +
      '.' + PREFIX + 'header-close svg{width:18px;height:18px;fill:#fff;}' +

      '.' + PREFIX + 'messages{' +
        'flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;' +
        'min-height:220px;max-height:380px;' +
      '}' +

      '.' + PREFIX + 'msg{max-width:88%;padding:10px 14px;border-radius:14px;line-height:1.6;word-wrap:break-word;font-size:13px;white-space:pre-line;}' +
      '.' + PREFIX + 'msg-bot{align-self:flex-start;background:#f1f5f9;color:#334155;border-bottom-left-radius:4px;}' +
      '.' + PREFIX + 'msg-user{align-self:flex-end;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border-bottom-right-radius:4px;}' +

      '.' + PREFIX + 'suggestions{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 12px;}' +
      '.' + PREFIX + 'chip{' +
        'background:#eef2ff;color:#4f46e5;border:1px solid #c7d2fe;' +
        'border-radius:20px;padding:6px 14px;font-size:12px;cursor:pointer;' +
        'transition:background .15s,color .15s;white-space:nowrap;font-family:inherit;' +
      '}' +
      '.' + PREFIX + 'chip:hover{background:#4f46e5;color:#fff;}' +

      '.' + PREFIX + 'typing{align-self:flex-start;display:flex;gap:4px;padding:10px 14px;background:#f1f5f9;border-radius:14px;border-bottom-left-radius:4px;}' +
      '.' + PREFIX + 'typing-dot{width:7px;height:7px;border-radius:50%;background:#94a3b8;animation:' + PREFIX + 'bounce .6s infinite alternate;}' +
      '.' + PREFIX + 'typing-dot:nth-child(2){animation-delay:.2s;}' +
      '.' + PREFIX + 'typing-dot:nth-child(3){animation-delay:.4s;}' +
      '@keyframes ' + PREFIX + 'bounce{0%{transform:translateY(0);opacity:.4}100%{transform:translateY(-6px);opacity:1}}' +

      '.' + PREFIX + 'input-area{display:flex;gap:8px;padding:12px 16px;border-top:1px solid #e2e8f0;flex-shrink:0;}' +
      '.' + PREFIX + 'input{' +
        'flex:1;border:1px solid #e2e8f0;border-radius:10px;padding:9px 14px;' +
        'font-size:13px;outline:none;font-family:inherit;color:#1e293b;background:#fff;transition:border-color .15s;' +
      '}' +
      '.' + PREFIX + 'input:focus{border-color:#4f46e5;}' +
      '.' + PREFIX + 'input::placeholder{color:#94a3b8;}' +
      '.' + PREFIX + 'send-btn{' +
        'background:linear-gradient(135deg,#4f46e5,#7c3aed);border:none;border-radius:10px;padding:0 14px;' +
        'cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity .15s;flex-shrink:0;' +
      '}' +
      '.' + PREFIX + 'send-btn:hover{opacity:.9;}' +
      '.' + PREFIX + 'send-btn svg{width:18px;height:18px;fill:#fff;}' +

      /* Dark Theme */
      '[data-theme="dark"] .' + PREFIX + 'panel{background:#1e293b;color:#e2e8f0;box-shadow:0 12px 40px rgba(0,0,0,.4);}' +
      '[data-theme="dark"] .' + PREFIX + 'msg-bot{background:#334155;color:#e2e8f0;}' +
      '[data-theme="dark"] .' + PREFIX + 'input{background:#0f172a;border-color:#334155;color:#e2e8f0;}' +
      '[data-theme="dark"] .' + PREFIX + 'input::placeholder{color:#64748b;}' +
      '[data-theme="dark"] .' + PREFIX + 'input-area{border-top-color:#334155;}' +
      '[data-theme="dark"] .' + PREFIX + 'chip{background:#312e81;color:#a5b4fc;border-color:#4338ca;}' +
      '[data-theme="dark"] .' + PREFIX + 'chip:hover{background:#4f46e5;color:#fff;}' +
      '[data-theme="dark"] .' + PREFIX + 'typing{background:#334155;}' +
      '[data-theme="dark"] .' + PREFIX + 'typing-dot{background:#64748b;}' +
      '[data-theme="dark"] .' + PREFIX + 'fab{box-shadow:0 4px 14px rgba(79,70,229,.6);}' +

      '@media(prefers-color-scheme:dark){' +
        'html:not([data-theme]) .' + PREFIX + 'panel{background:#1e293b;color:#e2e8f0;box-shadow:0 12px 40px rgba(0,0,0,.4);}' +
        'html:not([data-theme]) .' + PREFIX + 'msg-bot{background:#334155;color:#e2e8f0;}' +
        'html:not([data-theme]) .' + PREFIX + 'input{background:#0f172a;border-color:#334155;color:#e2e8f0;}' +
        'html:not([data-theme]) .' + PREFIX + 'input::placeholder{color:#64748b;}' +
        'html:not([data-theme]) .' + PREFIX + 'input-area{border-top-color:#334155;}' +
        'html:not([data-theme]) .' + PREFIX + 'chip{background:#312e81;color:#a5b4fc;border-color:#4338ca;}' +
        'html:not([data-theme]) .' + PREFIX + 'chip:hover{background:#4f46e5;color:#fff;}' +
        'html:not([data-theme]) .' + PREFIX + 'typing{background:#334155;}' +
        'html:not([data-theme]) .' + PREFIX + 'typing-dot{background:#64748b;}' +
      '}' +

      '@media(max-width:480px){' +
        '.' + PREFIX + 'panel{right:0;left:0;bottom:0;width:100%;max-height:75vh;border-radius:16px 16px 0 0;}' +
        '.' + PREFIX + 'fab{bottom:16px;right:16px;}' +
      '}';

    var style = document.createElement('style');
    style.setAttribute('data-chatbot', 'spbi');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ===== SVG Icons =====
  var ICON_CHAT = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';

  // ===== DOM =====
  var fab, panel, messagesEl, inputEl, suggestionsEl;
  var isOpen = false;
  var messages = loadHistory();

  function createDOM() {
    fab = document.createElement('button');
    fab.className = PREFIX + 'fab';
    fab.innerHTML = ICON_CHAT;
    fab.setAttribute('aria-label', 'เปิดผู้ช่วย AI');
    fab.setAttribute('title', 'ผู้ช่วย AI — ถามข้อมูลได้ทุกอย่าง');
    fab.addEventListener('click', togglePanel);

    panel = document.createElement('div');
    panel.className = PREFIX + 'panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'ผู้ช่วย AI');

    var header = document.createElement('div');
    header.className = PREFIX + 'header';
    header.innerHTML =
      '<span class="' + PREFIX + 'header-icon">🤖</span>' +
      '<span class="' + PREFIX + 'header-title">ผู้ช่วย AI</span>' +
      '<span class="' + PREFIX + 'header-badge">Data-Aware</span>';

    var closeBtn = document.createElement('button');
    closeBtn.className = PREFIX + 'header-close';
    closeBtn.innerHTML = ICON_CLOSE;
    closeBtn.setAttribute('aria-label', 'ปิด');
    closeBtn.addEventListener('click', togglePanel);
    header.appendChild(closeBtn);

    messagesEl = document.createElement('div');
    messagesEl.className = PREFIX + 'messages';

    suggestionsEl = document.createElement('div');
    suggestionsEl.className = PREFIX + 'suggestions';

    var inputArea = document.createElement('div');
    inputArea.className = PREFIX + 'input-area';

    inputEl = document.createElement('input');
    inputEl.className = PREFIX + 'input';
    inputEl.type = 'text';
    inputEl.placeholder = 'ถามข้อมูลได้เลย เช่น "ยอดขาย CJ"';
    inputEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') handleSend(); });

    var sendBtn = document.createElement('button');
    sendBtn.className = PREFIX + 'send-btn';
    sendBtn.innerHTML = ICON_SEND;
    sendBtn.setAttribute('aria-label', 'ส่ง');
    sendBtn.addEventListener('click', handleSend);

    inputArea.appendChild(inputEl);
    inputArea.appendChild(sendBtn);
    panel.appendChild(header);
    panel.appendChild(messagesEl);
    panel.appendChild(suggestionsEl);
    panel.appendChild(inputArea);
    document.body.appendChild(fab);
    document.body.appendChild(panel);

    if (messages.length > 0) {
      renderHistory();
    } else {
      addWelcomeMessage();
    }
    renderSuggestions();
  }

  function togglePanel() {
    isOpen = !isOpen;
    if (isOpen) {
      panel.classList.add(PREFIX + 'open');
      fab.innerHTML = ICON_CLOSE;
      fab.classList.add(PREFIX + 'fab-close');
      inputEl.focus();
      scrollToBottom();
    } else {
      panel.classList.remove(PREFIX + 'open');
      fab.innerHTML = ICON_CHAT;
      fab.classList.remove(PREFIX + 'fab-close');
    }
  }

  function addWelcomeMessage() {
    var app = detectApp();
    var name = 'SPBI';
    if (app === 'health-bento') name = 'Health Bento';
    else if (app === 'bakery') name = 'Bakery Analytics';
    var msg = 'สวัสดีครับ! ผมเป็นผู้ช่วย AI ของ ' + name + ' 🤖\n' +
              'สามารถถามข้อมูลจริงจาก Dashboard ได้เลยครับ เช่น:\n' +
              '• "ยอดขาย CJ เดือน ก.ค."\n' +
              '• "สินค้าขายดี Top 5"\n' +
              '• "เป้าหมายทุกช่องทาง"';
    appendMessage('bot', msg);
  }

  function renderHistory() {
    for (var i = 0; i < messages.length; i++) {
      messagesEl.appendChild(createBubble(messages[i].role, messages[i].text));
    }
    scrollToBottom();
  }

  function createBubble(role, text) {
    var div = document.createElement('div');
    div.className = PREFIX + 'msg ' + PREFIX + 'msg-' + role;
    div.textContent = text;
    return div;
  }

  function appendMessage(role, text) {
    messages.push({ role: role, text: text });
    saveHistory(messages);
    messagesEl.appendChild(createBubble(role, text));
    scrollToBottom();
  }

  function showTyping() {
    var el = document.createElement('div');
    el.className = PREFIX + 'typing';
    el.innerHTML = '<span class="' + PREFIX + 'typing-dot"></span><span class="' + PREFIX + 'typing-dot"></span><span class="' + PREFIX + 'typing-dot"></span>';
    messagesEl.appendChild(el);
    scrollToBottom();
    return el;
  }

  function scrollToBottom() {
    setTimeout(function () { messagesEl.scrollTop = messagesEl.scrollHeight; }, 10);
  }

  function renderSuggestions() {
    suggestionsEl.innerHTML = '';
    var suggestions = getQuickSuggestions();
    for (var i = 0; i < suggestions.length; i++) {
      (function (s) {
        var chip = document.createElement('button');
        chip.className = PREFIX + 'chip';
        chip.textContent = s.label;
        chip.addEventListener('click', function () { processUserInput(s.text); });
        suggestionsEl.appendChild(chip);
      })(suggestions[i]);
    }
  }

  function handleSend() {
    var text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    processUserInput(text);
  }

  function processUserInput(text) {
    appendMessage('user', text);
    suggestionsEl.style.display = 'none';
    var typingEl = showTyping();
    setTimeout(function () {
      if (typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
      var answer = processQuery(text);
      appendMessage('bot', answer);
    }, TYPING_DELAY);
  }

  function init() {
    injectStyles();
    createDOM();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
