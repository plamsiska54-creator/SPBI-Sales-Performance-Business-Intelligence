const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.pdf':  'application/pdf',
  '.mp4':  'video/mp4'
};

http.createServer(function(req, res) {

  // --- LINE Notify Proxy ---
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/line-notify') {
    var body = '';
    req.on('data', function(chunk) { body += chunk; });
    req.on('end', function() {
      try {
        var json = JSON.parse(body);
        var token = json.token;
        var message = json.message;

        if (!token || !message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 400, message: 'Missing token or message' }));
          return;
        }

        var postData = 'message=' + encodeURIComponent(message);

        var options = {
          hostname: 'notify-api.line.me',
          port: 443,
          path: '/api/notify',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + token,
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        var proxyReq = https.request(options, function(proxyRes) {
          var data = '';
          proxyRes.on('data', function(chunk) { data += chunk; });
          proxyRes.on('end', function() {
            console.log('[LINE Notify] Status:', proxyRes.statusCode, data);
            res.writeHead(proxyRes.statusCode, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(data);
          });
        });

        proxyReq.on('error', function(err) {
          console.error('[LINE Notify] Error:', err.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 500, message: err.message }));
        });

        proxyReq.write(postData);
        proxyReq.end();

      } catch (e) {
        console.error('[LINE Notify] Parse error:', e.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 400, message: 'Invalid JSON: ' + e.message }));
      }
    });
    return;
  }

  // --- Google Sheets Proxy ---
  if (req.method === 'GET' && req.url.indexOf('/api/sheet/') === 0) {
    var sheetId = req.url.replace('/api/sheet/', '').split('?')[0];
    if (!sheetId || sheetId.length < 10) {
      res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: 'Invalid sheet ID' }));
      return;
    }
    var gUrl = 'https://docs.google.com/spreadsheets/d/' + sheetId + '/gviz/tq?tqx=out:json';
    https.get(gUrl, function(gRes) {
      var chunks = '';
      gRes.on('data', function(c) { chunks += c; });
      gRes.on('end', function() {
        res.writeHead(gRes.statusCode, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300'
        });
        res.end(chunks);
      });
    }).on('error', function(err) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  // --- Static File Server ---
  var urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/sales_dashboard.html';

  var filePath = path.join(process.cwd(), decodeURIComponent(urlPath));

  fs.readFile(filePath, function(err, data) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + urlPath);
      return;
    }
    var ext = path.extname(filePath).toLowerCase();
    var contentType = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });

}).listen(PORT, '0.0.0.0', function() {
  console.log('Server on http://0.0.0.0:' + PORT);
  console.log('LAN access: http://192.168.1.33:' + PORT);
});
