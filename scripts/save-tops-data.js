var http = require('http');
var fs = require('fs');
var path = require('path');
var OUTPUT = path.join(__dirname, '..', 'js', 'tops-branches.js');

var server = http.createServer(function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.method === 'POST' && req.url === '/save') {
    var body = [];
    req.on('data', function(chunk) { body.push(chunk); });
    req.on('end', function() {
      var data = Buffer.concat(body).toString('utf8');
      fs.writeFileSync(OUTPUT, data, 'utf8');
      console.log('Saved', data.length, 'chars to', OUTPUT);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ok: true, size: data.length}));
      setTimeout(function() { server.close(); process.exit(0); }, 500);
    });
  } else {
    res.writeHead(404); res.end('Not found');
  }
});
server.listen(9876, function() { console.log('Listening on http://localhost:9876/save'); });
