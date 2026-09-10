// ============================================================
// AUTH.JS — Local authentication (demo/review mode)
// Production จะใช้ Supabase Auth แทน
// ============================================================
var Auth = (function () {
  'use strict';

  var SESSION_KEY = '__spbi_session';

  var PASS_HASH = 'bb4cd4debb5e4a18cefcd6cf4918d6270e03361eecb0673a15b24010f9344893';

  // allowedMenus: null = ทุกเมนู, array = เฉพาะเมนูที่ระบุ
  // Menu IDs: overview, mt, booth, online, amazon, ordering, sm-expense, admin
  var DEMO_USERS = {
    'jaturat.w@wanwanach.com':       { name: 'กรรมการบริหาร', role: 'manager', email: 'jaturat.w@wanwanach.com', allowedMenus: null },
    'sathidpong.w@wanwanach.com':    { name: 'กรรมการบริหาร', role: 'manager', email: 'sathidpong.w@wanwanach.com', allowedMenus: null },
    'panuwat.w@wanwanach.com':       { name: 'กรรมการบริหาร', role: 'manager', email: 'panuwat.w@wanwanach.com', allowedMenus: null },
    'palm.b@wanwanach.com':          { name: 'ผู้จัดการ', role: 'manager', email: 'palm.b@wanwanach.com', allowedMenus: null },
    'pear.jirattha@wanwanach.com':   { name: 'ผู้จัดการ', role: 'manager', email: 'pear.jirattha@wanwanach.com', allowedMenus: null },
    'gm.manager@wanwanach.com':      { name: 'ผู้จัดการ', role: 'manager', email: 'gm.manager@wanwanach.com', allowedMenus: null },
    'anataporn.t@wanwanach.com':     { name: 'ผู้จัดการ', role: 'manager', email: 'anataporn.t@wanwanach.com', allowedMenus: null },
    'fm.manager@wanwanach.com':      { name: 'ผู้จัดการ', role: 'manager', email: 'fm.manager@wanwanach.com', allowedMenus: null },
    'sales.manager@wanwanach.com':   { name: 'ผู้จัดการ', role: 'manager', email: 'sales.manager@wanwanach.com', allowedMenus: null },
    'secretary@wanwanach.com':       { name: 'เลขากรรมการบริหาร', role: 'manager', email: 'secretary@wanwanach.com', allowedMenus: null },
    'sale.analysis@wanwanach.com':   { name: 'แอดมิน', role: 'admin', email: 'sale.analysis@wanwanach.com', allowedMenus: null },
    'moderntrade.support@wanwanach.com': { name: 'ซัพพอตเซลล์', role: 'officer', email: 'moderntrade.support@wanwanach.com', allowedMenus: null },
    'online.sale@wanwanach.com':     { name: 'เซลล์', role: 'sales', email: 'online.sale@wanwanach.com', allowedMenus: ['overview','sm-expense','online'] },
    'sales.amz.souvenir@wanwanach.com': { name: 'เซลล์ พี่ซี', role: 'sales', email: 'sales.amz.souvenir@wanwanach.com', allowedMenus: ['overview','sm-expense','amazon'] },
    'booth.sales@wanwanach.com':     { name: 'เซลล์', role: 'sales', email: 'booth.sales@wanwanach.com', allowedMenus: ['overview','sm-expense','amazon'] },
    'moderntrde_sales@wanwanach.com': { name: 'เซลล์', role: 'sales', email: 'moderntrde_sales@wanwanach.com', allowedMenus: ['overview','sm-expense','mt'] },
    'order.supervisor@wanwanach.com': { name: 'หัวหน้างาน', role: 'leader', email: 'order.supervisor@wanwanach.com', allowedMenus: ['overview','sm-expense','ordering'] },
    'order@wanwanach.com':           { name: 'ธุรการขาย', role: 'officer', email: 'order@wanwanach.com', allowedMenus: ['overview','sm-expense','ordering'] },
    'support.sale@wanwanach.com':    { name: 'ซัพพอตเซลล์', role: 'officer', email: 'support.sale@wanwanach.com', allowedMenus: null },
    'support.sale2@wanwanach.com':   { name: 'ซัพพอตเซลล์', role: 'officer', email: 'support.sale2@wanwanach.com', allowedMenus: null },
    'mkt.manager@wanwanach.com':     { name: 'ผู้จัดการการตลาด', role: 'admin', email: 'MKT.manager@wanwanach.com', allowedMenus: null },
    'admin@wanwanach.com':           { name: 'แอดมิน', role: 'admin', email: 'admin@wanwanach.com', allowedMenus: null }
  };

  function sha256(str) {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      var enc = new TextEncoder();
      return crypto.subtle.digest('SHA-256', enc.encode(str)).then(function (buf) {
        return Array.from(new Uint8Array(buf)).map(function (b) {
          return b.toString(16).padStart(2, '0');
        }).join('');
      });
    }
    return Promise.resolve(_sha256Fallback(str));
  }

  function _sha256Fallback(msg) {
    function rr(n,x){return(x>>>n)|(x<<(32-n));}
    var K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
           0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
           0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
           0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
           0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
           0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
           0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
           0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    var H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    var bytes=[];
    for(var i=0;i<msg.length;i++){var c=msg.charCodeAt(i);if(c<128)bytes.push(c);else if(c<2048){bytes.push(192|(c>>6));bytes.push(128|(c&63));}else{bytes.push(224|(c>>12));bytes.push(128|((c>>6)&63));bytes.push(128|(c&63));}}
    var l=bytes.length*8;bytes.push(0x80);while(bytes.length%64!==56)bytes.push(0);
    bytes.push(0,0,0,0);bytes.push((l>>>24)&0xff,(l>>>16)&0xff,(l>>>8)&0xff,l&0xff);
    for(var off=0;off<bytes.length;off+=64){
      var w=[];for(var t=0;t<16;t++)w[t]=(bytes[off+t*4]<<24)|(bytes[off+t*4+1]<<16)|(bytes[off+t*4+2]<<8)|bytes[off+t*4+3];
      for(var t=16;t<64;t++){var s0=rr(7,w[t-15])^rr(18,w[t-15])^(w[t-15]>>>3);var s1=rr(17,w[t-2])^rr(19,w[t-2])^(w[t-2]>>>10);w[t]=(w[t-16]+s0+w[t-7]+s1)|0;}
      var a=H[0],b=H[1],c=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
      for(var t=0;t<64;t++){var S1=rr(6,e)^rr(11,e)^rr(25,e);var ch=(e&f)^((~e)&g);var temp1=(h+S1+ch+K[t]+w[t])|0;var S0=rr(2,a)^rr(13,a)^rr(22,a);var maj=(a&b)^(a&c)^(b&c);var temp2=(S0+maj)|0;h=g;g=f;f=e;e=(d+temp1)|0;d=c;c=b;b=a;a=(temp1+temp2)|0;}
      H[0]=(H[0]+a)|0;H[1]=(H[1]+b)|0;H[2]=(H[2]+c)|0;H[3]=(H[3]+d)|0;H[4]=(H[4]+e)|0;H[5]=(H[5]+f)|0;H[6]=(H[6]+g)|0;H[7]=(H[7]+h)|0;
    }
    var hex='';for(var i=0;i<8;i++)for(var s=28;s>=0;s-=4)hex+='0123456789abcdef'.charAt((H[i]>>>s)&0xf);
    return hex;
  }

  function getSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveSession(user) {
    var data = JSON.stringify(user);
    sessionStorage.setItem(SESSION_KEY, data);
    localStorage.setItem(SESSION_KEY, data);
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  }

  function authenticate(email, password) {
    return sha256(password).then(function (hash) {
      var user = DEMO_USERS[email.toLowerCase().trim()];
      if (!user) return { ok: false, error: 'ไม่พบบัญชีนี้ในระบบ' };
      if (hash !== PASS_HASH) return { ok: false, error: 'รหัสผ่านไม่ถูกต้อง' };
      return { ok: true, user: user };
    });
  }

  function requireAuth() {
    var s = getSession();
    if (!s) {
      window.location.replace('login.html');
      return null;
    }
    return s;
  }

  function logout() {
    clearSession();
    window.location.replace('login.html');
  }

  return {
    getSession: getSession,
    saveSession: saveSession,
    clearSession: clearSession,
    authenticate: authenticate,
    requireAuth: requireAuth,
    logout: logout
  };
})();

// Expose global shortcuts
function requireAuth() { return Auth.requireAuth(); }
function getSession() { return Auth.getSession(); }
function logout() { return Auth.logout(); }
