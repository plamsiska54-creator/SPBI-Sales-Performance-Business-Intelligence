/**
 * auth.js — Client-side authentication module
 * Login overlay, token management, user info display
 */

const LS_TOKEN = 'bakery-auth-token';
const LS_USER = 'bakery-auth-user';

let currentUser = null;
let authToken = null;

function loadStored() {
  try {
    authToken = localStorage.getItem(LS_TOKEN);
    const raw = localStorage.getItem(LS_USER);
    if (raw) currentUser = JSON.parse(raw);
  } catch { /* ignore */ }
}

function saveAuth(token, user) {
  authToken = token;
  currentUser = user;
  try {
    localStorage.setItem(LS_TOKEN, token);
    localStorage.setItem(LS_USER, JSON.stringify(user));
  } catch { /* ignore */ }
}

function clearAuth() {
  authToken = null;
  currentUser = null;
  try {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
  } catch { /* ignore */ }
}

const ROLE_LABELS = {
  admin: { th: 'แอดมิน', en: 'Admin' },
  manager: { th: 'ผู้จัดการ', en: 'Manager' },
  sales: { th: 'เซลล์', en: 'Sales' },
  leader: { th: 'หัวหน้างาน', en: 'Leader' },
  officer: { th: 'เจ้าหน้าที่', en: 'Officer' },
};

function getRoleLabel(role, lang) {
  const entry = ROLE_LABELS[role];
  return entry ? (entry[lang || 'th'] || entry.th) : role;
}

function createLoginOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'login-overlay';
  overlay.innerHTML = `
    <div class="login-card">
      <div class="login-logo">Bakery Analytics</div>
      <p class="login-subtitle">Trend & Competitor Analysis</p>
      <form id="login-form" autocomplete="on">
        <div class="login-field">
          <label for="login-email">Email</label>
          <input type="email" id="login-email" name="email" placeholder="email@wanwanach.com" autocomplete="email" required>
        </div>
        <div class="login-field">
          <label for="login-password">Password</label>
          <input type="password" id="login-password" name="password" placeholder="รหัสผ่าน" autocomplete="current-password" required>
        </div>
        <div class="login-error" id="login-error"></div>
        <button type="submit" class="login-btn" id="login-btn">เข้าสู่ระบบ</button>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  const form = document.getElementById('login-form');
  form.addEventListener('submit', handleLogin);
  document.getElementById('login-btn').addEventListener('click', function (e) {
    if (!form.checkValidity()) return;
    e.preventDefault();
    handleLogin(e);
  });
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');

  if (!email || !password) {
    errorEl.textContent = 'กรุณากรอก email และ password';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'กำลังเข้าสู่ระบบ...';
  errorEl.textContent = '';

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'เข้าสู่ระบบไม่สำเร็จ';
      btn.disabled = false;
      btn.textContent = 'เข้าสู่ระบบ';
      return;
    }

    saveAuth(data.token, data.user);
    hideLoginOverlay();
    updateUserDisplay();
  } catch (err) {
    errorEl.textContent = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
    btn.disabled = false;
    btn.textContent = 'เข้าสู่ระบบ';
  }
}

function hideLoginOverlay() {
  const overlay = document.getElementById('login-overlay');
  if (overlay) {
    overlay.classList.add('fade-out');
    setTimeout(() => overlay.remove(), 300);
  }
}

function showLoginOverlay() {
  const existing = document.getElementById('login-overlay');
  if (existing) existing.remove();
  createLoginOverlay();
}

function updateUserDisplay() {
  const container = document.getElementById('user-info');
  if (!container) return;

  if (currentUser) {
    const name = currentUser.email.split('@')[0].replace(/[._]/g, ' ');
    const role = getRoleLabel(currentUser.role, 'th');
    container.innerHTML = `
      <span class="user-name" title="${currentUser.email}">${currentUser.title}</span>
      <span class="user-role">${role}</span>
      <button class="logout-btn" id="logout-btn" title="ออกจากระบบ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </button>
    `;
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  } else {
    container.innerHTML = '';
  }
}

async function handleLogout() {
  try {
    await fetch('/api/logout', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + authToken },
    });
  } catch { /* ignore */ }
  clearAuth();
  updateUserDisplay();
  showLoginOverlay();
}

async function verifySession() {
  if (!authToken) return false;
  try {
    const res = await fetch('/api/me', {
      headers: { 'Authorization': 'Bearer ' + authToken },
    });
    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
      return true;
    }
  } catch { /* ignore */ }
  clearAuth();
  return false;
}

export async function initAuth() {
  loadStored();

  if (authToken) {
    const valid = await verifySession();
    if (valid) {
      updateUserDisplay();
      return;
    }
  }

  showLoginOverlay();
}

export function getUser() {
  return currentUser;
}

export function getToken() {
  return authToken;
}

export function isLoggedIn() {
  return !!currentUser && !!authToken;
}
