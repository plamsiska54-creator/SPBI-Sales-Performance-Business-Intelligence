/**
 * compare-utils.js — WoW / MoM / YoY / MTD / YTD comparison utilities
 * Depends on global vars from app.js: _CY, _YEAR_MAP, MONTHS_12, MONTHLY_ACTUAL,
 * MONTHLY_TARGET, CHANNEL_MONTHLY, DAILY_ACTUAL, CH_NAMES
 */
(function(){
'use strict';

var MONTHS_12_REF = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function _curMonthIdx(){
  if(typeof MONTHS==='undefined') return 0;
  return MONTHS.length - 1;
}

function _prevYearData(){
  var py = (typeof _CY!=='undefined'?_CY:2569) - 1;
  return (typeof _YEAR_MAP!=='undefined' && _YEAR_MAP[py]) || null;
}

function _safeDiv(a, b){ return b ? (a / b) : null; }

function _pctChange(curr, prev){
  if(!prev || prev===0) return null;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

// ──────────────────────────────────────────
// MoM — เดือนเทียบเดือน
// ──────────────────────────────────────────
function calcMoM(monthIdx){
  if(typeof monthIdx==='undefined') monthIdx = _curMonthIdx();
  if(monthIdx < 1) return null;
  var curr = (typeof MONTHLY_ACTUAL!=='undefined') ? MONTHLY_ACTUAL[monthIdx] : 0;
  var prev = (typeof MONTHLY_ACTUAL!=='undefined') ? MONTHLY_ACTUAL[monthIdx - 1] : 0;
  if(!curr && !prev) return null;
  return { curr:curr, prev:prev, change: curr-prev, pct: _pctChange(curr, prev) };
}

function calcMoMChannel(channel, monthIdx){
  if(typeof monthIdx==='undefined') monthIdx = _curMonthIdx();
  if(monthIdx < 1 || typeof CHANNEL_MONTHLY==='undefined') return null;
  var currMo = MONTHS_12_REF[monthIdx], prevMo = MONTHS_12_REF[monthIdx-1];
  var currCh = CHANNEL_MONTHLY[currMo], prevCh = CHANNEL_MONTHLY[prevMo];
  var curr = (currCh && currCh[channel]) ? currCh[channel].a||0 : 0;
  var prev = (prevCh && prevCh[channel]) ? prevCh[channel].a||0 : 0;
  if(!curr && !prev) return null;
  return { curr:curr, prev:prev, change:curr-prev, pct:_pctChange(curr, prev) };
}

// ──────────────────────────────────────────
// YoY — ปีเทียบปี
// ──────────────────────────────────────────
function calcYoY(monthIdx){
  if(typeof monthIdx==='undefined') monthIdx = _curMonthIdx();
  var curr = (typeof MONTHLY_ACTUAL!=='undefined') ? MONTHLY_ACTUAL[monthIdx] : 0;
  var pyData = _prevYearData();
  if(!pyData) return null;
  var prevActual = _buildPrevActual(pyData);
  var prev = prevActual[monthIdx] || 0;
  if(!curr && !prev) return null;
  return { curr:curr, prev:prev, change:curr-prev, pct:_pctChange(curr, prev) };
}

function calcYoYChannel(channel, monthIdx){
  if(typeof monthIdx==='undefined') monthIdx = _curMonthIdx();
  var currMo = MONTHS_12_REF[monthIdx];
  var currCh = (typeof CHANNEL_MONTHLY!=='undefined') ? CHANNEL_MONTHLY[currMo] : null;
  var curr = (currCh && currCh[channel]) ? currCh[channel].a||0 : 0;
  var pyData = _prevYearData();
  if(!pyData) return null;
  var pyCh = (pyData.CHANNEL_MONTHLY||{})[currMo];
  var prev = (pyCh && pyCh[channel]) ? pyCh[channel].a||0 : 0;
  if(!curr && !prev) return null;
  return { curr:curr, prev:prev, change:curr-prev, pct:_pctChange(curr, prev) };
}

function _buildPrevActual(d){
  var ch = d.CHANNEL_MONTHLY||{}, fb = d._ACTUAL_FALLBACK||[];
  return MONTHS_12_REF.map(function(mo, i){
    var c = ch[mo];
    if(c){ var s=0; for(var k in c){ if(c.hasOwnProperty(k)) s+=(c[k].a||0); } if(s>0) return Math.round(s); }
    return fb[i]||0;
  });
}

// ──────────────────────────────────────────
// YTD — ยอดสะสมตั้งแต่ต้นปี
// ──────────────────────────────────────────
function calcYTD(monthIdx){
  if(typeof monthIdx==='undefined') monthIdx = _curMonthIdx();
  if(typeof MONTHLY_ACTUAL==='undefined') return null;
  var curr = 0, prev = 0;
  for(var i=0; i<=monthIdx; i++) curr += (MONTHLY_ACTUAL[i]||0);
  var pyData = _prevYearData();
  if(pyData){
    var prevActual = _buildPrevActual(pyData);
    for(var j=0; j<=monthIdx; j++) prev += (prevActual[j]||0);
  }
  return { curr:curr, prev:prev, change:curr-prev, pct:_pctChange(curr, prev) };
}

function calcYTDChannel(channel, monthIdx){
  if(typeof monthIdx==='undefined') monthIdx = _curMonthIdx();
  if(typeof CHANNEL_MONTHLY==='undefined') return null;
  var curr=0, prev=0;
  for(var i=0; i<=monthIdx; i++){
    var mo = MONTHS_12_REF[i];
    var ch = CHANNEL_MONTHLY[mo];
    curr += (ch && ch[channel]) ? (ch[channel].a||0) : 0;
  }
  var pyData = _prevYearData();
  if(pyData){
    var pyCh = pyData.CHANNEL_MONTHLY||{};
    for(var j=0; j<=monthIdx; j++){
      var mo2 = MONTHS_12_REF[j];
      var c2 = pyCh[mo2];
      prev += (c2 && c2[channel]) ? (c2[channel].a||0) : 0;
    }
  }
  return { curr:curr, prev:prev, change:curr-prev, pct:_pctChange(curr, prev) };
}

// ──────────────────────────────────────────
// MTD — ยอดสะสมตั้งแต่ต้นเดือน
// ──────────────────────────────────────────
function calcMTD(monthIdx){
  if(typeof monthIdx==='undefined') monthIdx = _curMonthIdx();
  if(typeof DAILY_ACTUAL==='undefined') return null;
  var mo = MONTHS_12_REF[monthIdx];
  var da = DAILY_ACTUAL[mo];
  if(!da) return null;
  var allArr = da.all || da.All;
  if(!allArr) {
    var total = 0, count = 0;
    for(var ch in da){
      if(!da.hasOwnProperty(ch)) continue;
      var arr = da[ch];
      if(Array.isArray(arr)){
        for(var d=0; d<arr.length; d++) total += (arr[d]||0);
        count++;
      }
    }
    return count ? { mtd: total, days: _countDays(da) } : null;
  }
  var mtd = 0, days = 0;
  for(var i=0; i<allArr.length; i++){
    if(allArr[i]>0){ mtd += allArr[i]; days++; }
  }
  return { mtd:mtd, days:days, target: (typeof MONTHLY_TARGET!=='undefined') ? MONTHLY_TARGET[monthIdx]||0 : 0 };
}

function _countDays(daObj){
  var maxDays = 0;
  for(var ch in daObj){
    if(Array.isArray(daObj[ch])){
      var c=0;
      for(var i=0; i<daObj[ch].length; i++) if(daObj[ch][i]>0) c++;
      if(c>maxDays) maxDays=c;
    }
  }
  return maxDays;
}

// ──────────────────────────────────────────
// WoW — สัปดาห์เทียบสัปดาห์ (last 7 days vs previous 7 days)
// ──────────────────────────────────────────
function calcWoW(monthIdx){
  if(typeof monthIdx==='undefined') monthIdx = _curMonthIdx();
  if(typeof DAILY_ACTUAL==='undefined') return null;
  var allDays = _getAllDailyFlat(monthIdx);
  if(!allDays || allDays.length < 7) return null;
  var lastDay = allDays.length - 1;
  while(lastDay >= 0 && allDays[lastDay]===0) lastDay--;
  if(lastDay < 6) return null;
  var currWeek=0, prevWeek=0;
  for(var i=0; i<7; i++){
    currWeek += (allDays[lastDay - i]||0);
    if(lastDay - 7 - i >= 0) prevWeek += (allDays[lastDay - 7 - i]||0);
  }
  if(!currWeek && !prevWeek) return null;
  return { curr:currWeek, prev:prevWeek, change:currWeek-prevWeek, pct:_pctChange(currWeek, prevWeek) };
}

function _getAllDailyFlat(monthIdx){
  var mo = MONTHS_12_REF[monthIdx];
  var da = (typeof DAILY_ACTUAL!=='undefined') ? DAILY_ACTUAL[mo] : null;
  if(!da) return null;
  var allArr = da.all || da.All;
  if(allArr) return allArr;
  var channels = ['MT','AMS','Booth','Online'];
  var maxLen = 0;
  channels.forEach(function(ch){ if(da[ch] && da[ch].length > maxLen) maxLen = da[ch].length; });
  if(!maxLen) return null;
  var result = [];
  for(var i=0; i<maxLen; i++){
    var s=0;
    channels.forEach(function(ch){ s += (da[ch] && da[ch][i]) ? da[ch][i] : 0; });
    result.push(s);
  }
  return result;
}

// ──────────────────────────────────────────
// Daily average (current month)
// ──────────────────────────────────────────
function calcDailyAvg(monthIdx){
  if(typeof monthIdx==='undefined') monthIdx = _curMonthIdx();
  var allDays = _getAllDailyFlat(monthIdx);
  if(!allDays) return null;
  var sum=0, count=0;
  for(var i=0; i<allDays.length; i++){
    if(allDays[i]>0){ sum+=allDays[i]; count++; }
  }
  return count ? { avg: sum/count, total: sum, days: count } : null;
}

// ──────────────────────────────────────────
// Badge HTML renderer
// ──────────────────────────────────────────
function compareBadge(pct, label, opts){
  if(pct===null || pct===undefined || isNaN(pct)) return '';
  opts = opts || {};
  var size = opts.size || 'sm';
  var isUp = pct > 0, isDown = pct < 0, isFlat = Math.abs(pct) < 0.5;
  var arrow, cls;
  if(isFlat){ arrow='—'; cls='flat'; }
  else if(isUp){ arrow='▲'; cls='up'; }
  else { arrow='▼'; cls='down'; }
  var pctStr = Math.abs(pct).toFixed(1) + '%';
  return '<span class="cmp-badge cmp-'+cls+' cmp-'+size+'" title="'+label+': '+(isUp?'+':'')+pct.toFixed(1)+'%">'
    + '<span class="cmp-arrow">'+arrow+'</span>'
    + '<span class="cmp-pct">'+pctStr+'</span>'
    + '<span class="cmp-label">'+label+'</span>'
    + '</span>';
}

function compareRow(data, label){
  if(!data || data.pct===null || data.pct===undefined) return '';
  return compareBadge(data.pct, label);
}

function compareBadgeGroup(monthIdx, opts){
  opts = opts || {};
  var channel = opts.channel;
  var badges = [];
  var mom, yoy, wow, ytd;
  if(channel){
    mom = calcMoMChannel(channel, monthIdx);
    yoy = calcYoYChannel(channel, monthIdx);
    ytd = calcYTDChannel(channel, monthIdx);
  } else {
    mom = calcMoM(monthIdx);
    yoy = calcYoY(monthIdx);
    ytd = calcYTD(monthIdx);
  }
  wow = channel ? null : calcWoW(monthIdx);
  if(wow && wow.pct!==null) badges.push(compareBadge(wow.pct, 'WoW'));
  if(mom && mom.pct!==null) badges.push(compareBadge(mom.pct, 'MoM'));
  if(yoy && yoy.pct!==null) badges.push(compareBadge(yoy.pct, 'YoY'));
  if(!badges.length) return '';
  return '<div class="cmp-group">' + badges.join('') + '</div>';
}

function mtdBadge(monthIdx){
  var mtd = calcMTD(monthIdx);
  if(!mtd) return '';
  var tgt = mtd.target || 0;
  var pct = tgt ? (mtd.mtd / tgt * 100) : 0;
  var cls = pct >= 80 ? 'up' : pct >= 50 ? 'flat' : 'down';
  return '<span class="cmp-badge cmp-mtd cmp-'+cls+'" title="MTD: '+(mtd.mtd/1e6).toFixed(2)+'M / '+(tgt/1e6).toFixed(2)+'M">'
    + '<span class="cmp-pct">'+ pct.toFixed(1)+'%</span>'
    + '<span class="cmp-label">MTD</span>'
    + '</span>';
}

function ytdSummaryHTML(monthIdx){
  if(typeof monthIdx==='undefined') monthIdx = _curMonthIdx();
  var ytd = calcYTD(monthIdx);
  var mom = calcMoM(monthIdx);
  var yoy = calcYoY(monthIdx);
  var wow = calcWoW(monthIdx);
  var mtd = calcMTD(monthIdx);
  var daily = calcDailyAvg(monthIdx);
  var _isEN = typeof _lang!=='undefined' && _lang==='en';

  var sections = [];

  // MTD section
  if(mtd){
    var mtdPct = mtd.target ? (mtd.mtd/mtd.target*100) : 0;
    sections.push({
      icon:'📅', label: _isEN?'MTD':'MTD ยอดสะสมเดือนนี้',
      value: (mtd.mtd/1e6).toFixed(2)+' M',
      sub: (_isEN?'Target: ':'เป้า: ')+(mtd.target/1e6).toFixed(2)+' M · '+mtd.days+(_isEN?' days':' วัน'),
      pct: mtdPct, cls: mtdPct>=80?'up':mtdPct>=50?'flat':'down'
    });
  }

  // YTD section
  if(ytd){
    var annualTarget = 0;
    if(typeof MONTHLY_TARGET!=='undefined') for(var i=0;i<12;i++) annualTarget+=(MONTHLY_TARGET[i]||0);
    var ytdPct = annualTarget ? (ytd.curr/annualTarget*100) : 0;
    sections.push({
      icon:'📊', label: _isEN?'YTD':'YTD ยอดสะสมทั้งปี',
      value: (ytd.curr/1e6).toFixed(2)+' M',
      sub: (_isEN?'vs Last Year: ':'vs ปีก่อน: ')+(ytd.prev/1e6).toFixed(2)+' M',
      pct: ytd.pct, cls: ytd.pct>=0?'up':'down',
      badge: ytd.pct!==null ? compareBadge(ytd.pct, 'YoY') : ''
    });
  }

  // MoM
  if(mom && mom.pct!==null){
    sections.push({
      icon:'📈', label: _isEN?'MoM':'MoM เดือนเทียบเดือน',
      value: (mom.curr/1e6).toFixed(2)+' M',
      sub: (_isEN?'Previous: ':'เดือนก่อน: ')+(mom.prev/1e6).toFixed(2)+' M',
      pct: mom.pct, cls: mom.pct>=0?'up':'down',
      badge: compareBadge(mom.pct, 'MoM')
    });
  }

  // YoY
  if(yoy && yoy.pct!==null){
    sections.push({
      icon:'🔄', label: _isEN?'YoY':'YoY ปีเทียบปี',
      value: (yoy.curr/1e6).toFixed(2)+' M',
      sub: (_isEN?'Same month last year: ':'เดือนเดียวกันปีก่อน: ')+(yoy.prev/1e6).toFixed(2)+' M',
      pct: yoy.pct, cls: yoy.pct>=0?'up':'down',
      badge: compareBadge(yoy.pct, 'YoY')
    });
  }

  // WoW
  if(wow && wow.pct!==null){
    sections.push({
      icon:'📆', label: _isEN?'WoW':'WoW สัปดาห์เทียบสัปดาห์',
      value: (wow.curr/1e6).toFixed(2)+' M',
      sub: (_isEN?'Previous week: ':'สัปดาห์ก่อน: ')+(wow.prev/1e6).toFixed(2)+' M',
      pct: wow.pct, cls: wow.pct>=0?'up':'down',
      badge: compareBadge(wow.pct, 'WoW')
    });
  }

  // Daily avg
  if(daily){
    sections.push({
      icon:'⏱️', label: _isEN?'Daily Average':'เฉลี่ยรายวัน',
      value: (daily.avg/1e6).toFixed(2)+' M',
      sub: daily.days+(_isEN?' active days':' วันที่มียอด'),
      pct: null, cls: 'flat'
    });
  }

  if(!sections.length) return '';

  var html = '<div class="cmp-summary-grid">';
  sections.forEach(function(s){
    var badgeHtml = s.badge || (s.pct!==null ? '<span class="cmp-inline cmp-'+s.cls+'">'+(s.pct>=0?'+':'')+s.pct.toFixed(1)+'%</span>' : '');
    html += '<div class="cmp-summary-card cmp-border-'+s.cls+'">'
      + '<div class="cmp-summary-header">'
      + '<span class="cmp-summary-icon">'+s.icon+'</span>'
      + '<span class="cmp-summary-label">'+s.label+'</span>'
      + badgeHtml
      + '</div>'
      + '<div class="cmp-summary-value">'+s.value+'</div>'
      + '<div class="cmp-summary-sub">'+s.sub+'</div>'
      + '</div>';
  });
  html += '</div>';
  return html;
}

// Channel comparison summary
function channelCompareHTML(monthIdx){
  if(typeof monthIdx==='undefined') monthIdx = _curMonthIdx();
  if(typeof CH_NAMES==='undefined') return '';
  var _isEN = typeof _lang!=='undefined' && _lang==='en';
  var html = '<div class="cmp-ch-table"><table><thead><tr>'
    + '<th>'+(_isEN?'Channel':'ช่องทาง')+'</th>'
    + '<th>'+(_isEN?'Actual':'ยอดจริง')+'</th>'
    + '<th>MoM</th><th>YoY</th>'
    + '<th>YTD</th>'
    + '</tr></thead><tbody>';
  CH_NAMES.forEach(function(ch){
    var mom = calcMoMChannel(ch, monthIdx);
    var yoy = calcYoYChannel(ch, monthIdx);
    var ytdCh = calcYTDChannel(ch, monthIdx);
    var mo = MONTHS_12_REF[monthIdx];
    var chData = (typeof CHANNEL_MONTHLY!=='undefined' && CHANNEL_MONTHLY[mo]) ? CHANNEL_MONTHLY[mo][ch] : null;
    var actual = chData ? (chData.a||0) : 0;
    html += '<tr>'
      + '<td><strong>'+ch+'</strong></td>'
      + '<td style="text-align:right">'+(actual/1e6).toFixed(2)+' M</td>'
      + '<td style="text-align:center">'+(mom && mom.pct!==null ? compareBadge(mom.pct,'') : '<span class="cmp-na">—</span>')+'</td>'
      + '<td style="text-align:center">'+(yoy && yoy.pct!==null ? compareBadge(yoy.pct,'') : '<span class="cmp-na">—</span>')+'</td>'
      + '<td style="text-align:center">'+(ytdCh && ytdCh.pct!==null ? compareBadge(ytdCh.pct,'') : '<span class="cmp-na">—</span>')+'</td>'
      + '</tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

// Expose globally
window.CMP = {
  calcMoM: calcMoM,
  calcMoMChannel: calcMoMChannel,
  calcYoY: calcYoY,
  calcYoYChannel: calcYoYChannel,
  calcYTD: calcYTD,
  calcYTDChannel: calcYTDChannel,
  calcMTD: calcMTD,
  calcWoW: calcWoW,
  calcDailyAvg: calcDailyAvg,
  badge: compareBadge,
  badgeGroup: compareBadgeGroup,
  mtdBadge: mtdBadge,
  row: compareRow,
  ytdSummaryHTML: ytdSummaryHTML,
  channelCompareHTML: channelCompareHTML
};

})();
