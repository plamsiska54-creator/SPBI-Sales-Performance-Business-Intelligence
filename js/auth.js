// ============================================================
// AUTH.JS — Local authentication (demo/review mode)
// Production จะใช้ Supabase Auth แทน
// ============================================================
var Auth = (function () {
  'use strict';

  var SESSION_KEY = '__spbi_session';

  // Demo users (SHA-256 hash of "demo1234")
  var DEMO_HASH = '0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d';
  var DEMO_USERS = {
    'admin@wanwanach.com':   { name: 'Admin', role: 'admin',   email: 'admin@wanwanach.com' },
    'manager@wanwanach.com': { name: 'Manager', role: 'manager', email: 'manager@wanwanach.com' },
    'sales@wanwanach.com':   { name: 'Sales', role: 'sales',   email: 'sales@wanwanach.com' },
    'viewer@wanwanach.com':  { name: 'Viewer', role: 'viewer',  email: 'viewer@wanwanach.com' },
    'sale.analysis@wanwanach.com': { name: 'Sale Analysis', role: 'admin', email: 'sale.analysis@wanwanach.com' }
  };

  function sha256(str) {
    var enc = new TextEncoder();
    return crypto.subtle.digest('SHA-256', enc.encode(str)).then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
    });
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
      if (hash !== DEMO_HASH) return { ok: false, error: 'รหัสผ่านไม่ถูกต้อง' };
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
