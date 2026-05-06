const http = require('http');
const fs = require('fs');
const path = require('path');
const P = '/home/z/my-project';

// Split the large HTML into smaller chunks for memory-efficient serving
const HTML_CHUNK_SIZE = 16384; // 16KB chunks

const PAGES = {
  '/': '.next/server/app/index.html',
  '/login': '.next/server/app/login.html',
  '/register': '.next/server/app/register.html',
  '/forgot-password': '.next/server/app/forgot-password.html',
};

const MIME_EXT = {
  html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8', json: 'application/json', png: 'image/png',
  jpg: 'image/jpeg', svg: 'image/svg+xml', ico: 'image/x-icon',
  woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf',
  webmanifest: 'application/manifest+json', map: 'application/json',
};

http.createServer((req, res) => {
  let u = req.url.split('?')[0];

  // HTML pages - stream from disk in chunks
  if (PAGES[u] || (!u.startsWith('/_next/') && !u.startsWith('/icons/') && !u.startsWith('/api/'))) {
    const fp = path.join(P, PAGES[u] || PAGES['/']);
    streamFile(fp, 'text/html; charset=utf-8', false, res);
    return;
  }

  if (u.startsWith('/api/')) {
    res.writeHead(503, {'Content-Type':'application/json'});
    res.end('{"error":"unavailable"}');
    return;
  }

  // Static files
  let fp, lc = false;
  if (u.startsWith('/_next/')) { fp = path.join(P, u.replace('/_next/','.next/')); lc = true; }
  else if (u.startsWith('/icons/') || u === '/manifest.webmanifest' || u === '/favicon.ico' || u === '/service-worker.js') { fp = path.join(P, 'public', u); }
  else { res.writeHead(404); res.end(); return; }

  const ext = fp.split('.').pop();
  const ct = MIME_EXT[ext] || 'application/octet-stream';
  streamFile(fp, ct, lc, res);
}).listen(3000, '0.0.0.0', () => console.log('QAIROSS :3000'));

function streamFile(fp, ct, lc, res) {
  fs.stat(fp, (e, s) => {
    if (e || !s.isFile()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, {
      'Content-Type': ct,
      'Content-Length': s.size,
      'Cache-Control': lc ? 'public,max-age=31536000,immutable' : 'no-cache'
    });
    fs.createReadStream(fp, {highWaterMark: HTML_CHUNK_SIZE}).pipe(res);
  });
}
