'use strict';
/**
 * open-report.js — serve allure-report/ over HTTP and open it in the
 * system browser, bypassing VS Code's localhost port interception.
 *
 * Uses only Node.js built-ins — no extra dependencies.
 */

const http = require('node:http');
const fs   = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const REPORT_DIR = path.resolve('allure-report');
const PORT = 0; // 0 = let the OS assign a free port — never conflicts

if (!fs.existsSync(REPORT_DIR)) {
  console.error('allure-report/ not found. Run npm run report:generate first.');
  process.exit(1);
}

/** Minimal MIME type map — enough for the Allure static bundle. */
const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.csv':  'text/csv',
  '.txt':  'text/plain',
};

const server = http.createServer((req, res) => {
  // Strip query strings and decode URI components
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(REPORT_DIR, urlPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Allure is a SPA — fall back to index.html for unknown paths
      fs.readFile(path.join(REPORT_DIR, 'index.html'), (e2, html) => {
        if (e2) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      });
      return;
    }
    const ext  = path.extname(filePath);
    const mime = MIME[ext] ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  const { port } = server.address();
  const url = `http://127.0.0.1:${port}`;
  console.log(`Allure report: ${url}`);
  console.log('Press Ctrl+C to stop.\n');

  // Open the system browser directly — avoids VS Code's Simple Browser popup.
  try {
    if (process.platform === 'darwin') execSync(`open "${url}"`);
    else if (process.platform === 'win32') execSync(`start "" "${url}"`);
    else execSync(`xdg-open "${url}"`);
  } catch {
    console.log(`Could not open browser automatically. Navigate to ${url} manually.`);
  }
});
