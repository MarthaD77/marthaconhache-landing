const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname);
const MIME = {
  html: 'text/html; charset=utf-8',
  css:  'text/css',
  js:   'application/javascript',
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  png:  'image/png',
  svg:  'image/svg+xml',
  woff2:'font/woff2',
  ico:  'image/x-icon'
};

http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  if (url === '/') url = '/index.html';
  const filePath = path.join(ROOT, url);

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    return res.end('Not found');
  }

  const ext = path.extname(filePath).slice(1);
  res.setHeader('Content-Type', MIME[ext] || 'text/plain');
  fs.createReadStream(filePath).pipe(res);

}).listen(3000, () => console.log('Server running on http://localhost:3000'));
