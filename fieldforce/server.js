// เสิร์ฟไฟล์ static ของระบบบริหารทีมงานนอกสถานที่ (FieldForce)
// ไม่มี dependency — ใช้ node เปล่า ๆ เหมือน server ตัวอื่นในโปรเจกต์
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3700;
// อ้างอิงจากที่อยู่ของไฟล์นี้ ไม่ใช่ cwd — เพราะ launch.json สั่งรันจาก root ของโปรเจกต์
const ROOT = __dirname;

const MIME = {
  '.html':'text/html; charset=utf-8',
  '.js'  :'text/javascript; charset=utf-8',
  '.css' :'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.svg' :'image/svg+xml',
  '.png' :'image/png',
  '.jpg' :'image/jpeg',
  '.jpeg':'image/jpeg',
  '.gif' :'image/gif',
  '.webp':'image/webp',
  '.ico' :'image/x-icon',
  '.woff2':'font/woff2',
  '.csv' :'text/csv; charset=utf-8',
};

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/' || rel === '') rel = '/index.html';

  // กันเส้นทางที่พาออกนอกโฟลเดอร์ (../../)
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT)) {
    res.writeHead(403, {'Content-Type':'text/plain; charset=utf-8'});
    return res.end('403 Forbidden');
  }

  fs.readFile(file, (err, buf) => {
    if (err) {
      res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'});
      return res.end('404 ไม่พบไฟล์: ' + rel);
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',   // ต้นแบบยังแก้บ่อย ไม่ให้เบราว์เซอร์แคชค้าง
    });
    res.end(buf);
  });
}).listen(PORT, () => {
  console.log('FieldForce — ระบบบริหารทีมงานนอกสถานที่');
  console.log('เปิดที่ http://localhost:' + PORT);
});
