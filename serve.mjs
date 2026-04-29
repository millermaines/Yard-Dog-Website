import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const PORT = 3000;
const ROOT = process.cwd();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.txt':  'text/plain; charset=utf-8',
  '.map':  'application/json; charset=utf-8',
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  let pathname = decodeURIComponent(parsed.pathname || '/');
  if (pathname === '/') pathname = '/index.html';

  const filePath = path.normalize(path.join(ROOT, pathname));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  function send(p) {
    const ext = path.extname(p).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(p).pipe(res);
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) return send(filePath);

    // Clean-URL fallback: if no extension on the request, try .html
    if (!path.extname(filePath)) {
      const htmlPath = filePath.replace(/[\\/]+$/, '') + '.html';
      fs.stat(htmlPath, (err2, stat2) => {
        if (!err2 && stat2.isFile()) return send(htmlPath);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });
});

server.listen(PORT, () => {
  console.log(`Yard Dog dev server: http://localhost:${PORT}`);
  console.log(`Root: ${ROOT}`);
});
