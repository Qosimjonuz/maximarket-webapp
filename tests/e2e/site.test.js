// Brauzer testlari (API soxta javoblar bilan, tashqi tarmoqsiz): node tests/e2e/site.test.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { launch } = require('./pw');

const ROOT = path.join(__dirname, '..', '..');
const API = 'https://maximarketbot-production.up.railway.app';
const TYPES = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png',
  '.json': 'application/json', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.svg': 'image/svg+xml' };

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, path.normalize(p));
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

const TG_STUB = "window.Telegram={WebApp:{initData:'x=1',initDataUnsafe:{user:{id:1}},ready(){},expand(){},setHeaderColor(){}," +
  "setBackgroundColor(){},openLink(u){window.__opened=u},showConfirm(m,cb){cb(false)},HapticFeedback:{impactOccurred(){},notificationOccurred(){}}}}";
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' };
const PRODUCTS = [1, 2, 3].map((i) => ({ id: 'a'.repeat(23) + i, name: 'Mahsulot ' + i, price: 100000 * i, discount_price: 0,
  images: [], category: 'Uy', description: 'Test', colors: [] }));

async function page(browser, base, onApi) {
  const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.route('https://telegram.org/**', (r) => r.fulfill({ contentType: 'application/javascript', body: TG_STUB }));
  await p.route(API + '/**', async (r) => {
    const d = (await onApi(r.request())) || { success: true };
    await r.fulfill({ contentType: 'application/json', headers: CORS, body: JSON.stringify(d) });
  });
  return { p, errors };
}

async function testHome(browser, base) {
  const { p, errors } = await page(browser, base, (req) => (req.url().includes('/api/products') ? { products: PRODUCTS } : null));
  await p.goto(base + '/index.html');
  await p.waitForSelector('.product-card-h, .big-product-card', { timeout: 10000 });
  assert.deepStrictEqual(errors, [], 'bosh sahifada JS xato');
  await p.close();
  console.log('✓ bosh sahifa: mahsulotlar chiqadi');
}

async function testStudio(browser, base) {
  let n = 0, body = null;
  const { p, errors } = await page(browser, base, (req) => {
    const u = req.url();
    if (u.includes('/upload')) { n++; return n === 1 ? { file: { id: 'v1', kind: 'video', duration: 6, url: '/m/v1' } } : { file: { id: 'a1', kind: 'audio', duration: 20, url: '/m/a1' } }; }
    if (u.includes('/config')) return { success: true, links: { instagram: 'https://www.instagram.com/maximarket.uz' } };
    if (u.includes('/render')) { body = JSON.parse(req.postData()); return { success: false, error: 'test' }; }
    return { success: true, files: [] };
  });
  await p.goto(base + '/studio/index.html');
  await p.setInputFiles('#add-media', { name: 'a.mp4', mimeType: 'video/mp4', buffer: Buffer.from('test') });
  await p.waitForFunction(() => document.querySelectorAll('#clips .card').length === 1);
  await p.waitForTimeout(300);
  const seek = (v) => p.evaluate((v) => { const s = document.getElementById('scrub'); s.value = v; s.dispatchEvent(new Event('input')); }, v);
  await seek(2); await p.click('#split');
  await seek(4); await p.click('#split');
  assert.strictEqual(await p.$$eval('#clips .card', (x) => x.length), 3, 'klip 3 bo\'lakka bo\'linishi kerak');
  await p.click('#clips .card:nth-child(2) .clip-actions button:has-text("🗑")');
  await p.click('#frames button[data-frame=f2]');
  await p.click('.tabs button[data-tab=music]');
  await p.setInputFiles('#add-music', { name: 'v.m4a', mimeType: 'audio/mp4', buffer: Buffer.from('test') });
  await p.waitForSelector('#music-segs .seg-card');
  await seek(1); await p.click('#music-split');
  await seek(2); await p.click('#music-split');
  await p.click('#music-segs .seg-card:nth-child(2) button:has-text("🗑")');
  await p.click('.tabs button[data-tab=post]');
  await p.click('#social-links .btn');
  assert.strictEqual(await p.evaluate(() => window.__opened), 'https://www.instagram.com/maximarket.uz');
  await p.click('#render');
  await p.waitForFunction(() => !document.getElementById('render').disabled);
  const pr = body.project;
  assert.deepStrictEqual(pr.clips.map((c) => [c.start, c.end]), [[0, 2], [4, 6]]);
  assert.deepStrictEqual(pr.music.segments, [{ start: 0, end: 1 }, { start: 2, end: 20 }]);
  assert.strictEqual(pr.frame, 'f2');
  assert.deepStrictEqual(errors, [], 'studio\'da JS xato');
  await p.close();
  console.log('✓ MaxiStudio: kesish, ovoz bo\'laklari, hoshiya, sahifa tugmasi');
}

(async () => {
  const srv = await serve();
  const base = 'http://127.0.0.1:' + srv.address().port;
  const browser = await launch();
  try {
    await testHome(browser, base);
    await testStudio(browser, base);
  } finally {
    await browser.close(); srv.close();
  }
})().catch((e) => { console.error('✗', e.message); process.exit(1); });
