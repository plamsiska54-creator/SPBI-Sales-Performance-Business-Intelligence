const https = require('https');
const fs = require('fs');
const path = require('path');

const URL = 'https://www.cjmore.co.th/branch/all';
const OUTPUT = path.join(__dirname, '..', 'js', 'cj-branches.js');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Accept': 'application/json' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function extractProvince(address) {
  if (!address) return '';
  // Bangkok check
  if (/กรุงเทพ/.test(address)) return 'กรุงเทพมหานคร';
  // จังหวัดXXX pattern
  const m = address.match(/จังหวัด\s*([^\s\d,]+)/);
  if (m) return m[1];
  return '';
}

function cleanAddress(addr) {
  if (!addr) return '';
  return addr.replace(/\s{2,}/g, ' ').trim();
}

(async () => {
  console.log('Fetching branches from', URL, '...');
  const raw = await fetch(URL);
  const branches = JSON.parse(raw);
  console.log('Fetched', branches.length, 'branches');

  const rows = branches.map((b) => {
    const addr = cleanAddress(b.address || '');
    const province = extractProvince(addr);
    return {
      code: b.code,
      branch: b.branch || '',
      lat: b.lat || 0,
      lng: b.lng || 0,
      tel: b.tel || '',
      address: addr,
      province: province
    };
  });

  // Sort by branch name
  rows.sort((a, b) => a.branch.localeCompare(b.branch, 'th'));

  // Build output
  const lines = rows.map((r) => {
    const code = typeof r.code === 'number' ? r.code : parseInt(r.code, 10) || 0;
    const lat = r.lat;
    const lng = r.lng;
    const esc = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ').replace(/\r/g, '').replace(/\t/g, ' ');
    const branch = esc(r.branch);
    const tel = esc(r.tel);
    const address = esc(r.address);
    const province = esc(r.province);
    return `[${code},"${branch}",${lat},${lng},"${tel}","${address}","${province}"]`;
  });

  const content = 'var CJ_BRANCHES=[\n' + lines.join(',\n') + '\n];\n';
  fs.writeFileSync(OUTPUT, content, 'utf8');
  console.log('Written', rows.length, 'branches to', OUTPUT);
})().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
