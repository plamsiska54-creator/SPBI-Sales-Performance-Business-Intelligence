const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3500;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const PUBLIC_DIR = path.join(__dirname, 'public');
const USERS_PATH = path.join(__dirname, 'data', 'users.json');

// --- Auth: in-memory sessions ---
const sessions = new Map();

function hashPassword(pw) {
  return crypto.createHash('sha256').update('bakery-salt-2026:' + pw).digest('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function loadUsers() {
  const raw = fs.readFileSync(USERS_PATH, 'utf-8');
  return JSON.parse(raw).users;
}

function findUserByEmail(email) {
  const users = loadUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.status === 'active');
}

function getSessionUser(req) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  return sessions.get(token) || null;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 1e5) reject(new Error('Too large')); });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function jsonRes(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

// --- Server ---
const server = http.createServer(async (req, res) => {
  const reqPath = req.url.split('?')[0];
  const method = req.method;

  // --- Auth API ---

  // POST /api/login
  if (reqPath === '/api/login' && method === 'POST') {
    try {
      const { email, password } = await readBody(req);
      if (!email || !password) return jsonRes(res, 400, { error: 'กรุณากรอก email และ password' });

      const user = findUserByEmail(email);
      if (!user) return jsonRes(res, 401, { error: 'ไม่พบผู้ใช้ หรือบัญชีถูกปิดใช้งาน' });

      const hash = hashPassword(password);
      if (hash !== user.passwordHash) return jsonRes(res, 401, { error: 'รหัสผ่านไม่ถูกต้อง' });

      const token = generateToken();
      const userInfo = { id: user.id, email: user.email, title: user.title, role: user.role, access: user.access };
      sessions.set(token, userInfo);

      return jsonRes(res, 200, { token, user: userInfo });
    } catch (e) {
      return jsonRes(res, 400, { error: e.message });
    }
  }

  // GET /api/me
  if (reqPath === '/api/me' && method === 'GET') {
    const user = getSessionUser(req);
    if (!user) return jsonRes(res, 401, { error: 'ไม่ได้เข้าสู่ระบบ' });
    return jsonRes(res, 200, { user });
  }

  // POST /api/logout
  if (reqPath === '/api/logout' && method === 'POST') {
    const auth = req.headers['authorization'];
    if (auth && auth.startsWith('Bearer ')) {
      sessions.delete(auth.slice(7));
    }
    return jsonRes(res, 200, { ok: true });
  }

  // --- Data API ---

  if (reqPath === '/api/status') {
    try {
      const competitorsPath = path.join(PUBLIC_DIR, 'data', 'competitors.json');
      const data = JSON.parse(fs.readFileSync(competitorsPath, 'utf-8'));
      const status = {
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        dataSource: data.dataSource || 'Demo Data',
      };
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(status));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (reqPath === '/api/refresh') {
    try {
      const competitorsPath = path.join(PUBLIC_DIR, 'data', 'competitors.json');
      const data = JSON.parse(fs.readFileSync(competitorsPath, 'utf-8'));
      const status = {
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        dataSource: data.dataSource || 'Demo Data',
        refreshed: true,
      };
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(status));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // --- Static file serving ---
  let filePath = reqPath === '/' ? '/index.html' : reqPath;
  filePath = path.join(PUBLIC_DIR, filePath);

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Trend Dashboard server running on http://localhost:${PORT}`);
});
