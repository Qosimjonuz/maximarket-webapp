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
  assert.strictEqual(await p.evaluate(() => BANNER_DELAY), 12000, 'banner 12 soniyada almashsin');
  assert.strictEqual(await p.$$eval('.banner-nav', (x) => x.length), 0, '< > tugmalari olib tashlangan bo\'lishi kerak');
  const active = () => p.$$eval('#banner-dots span', (d) => d.findIndex((x) => x.classList.contains('active')));
  const n = await p.$$eval('#banner-dots span', (d) => d.length);
  const a0 = await active();
  const b = await (await p.$('#banner-carousel')).boundingBox();
  const swipe = async (from, to) => {
    await p.mouse.move(b.x + b.width * from, b.y + b.height / 2); await p.mouse.down();
    await p.mouse.move(b.x + b.width * to, b.y + b.height / 2, { steps: 5 }); await p.mouse.up();
    await p.waitForTimeout(200);
  };
  await swipe(0.8, 0.2);
  assert.strictEqual(await active(), (a0 + 1) % n, 'chapga surish: keyingi banner');
  await swipe(0.2, 0.8);
  assert.strictEqual(await active(), a0, 'o\'ngga surish: oldingi banner');
  assert.deepStrictEqual(errors, [], 'bosh sahifada JS xato');
  await p.close();
  console.log('✓ bosh sahifa: mahsulotlar chiqadi, banner 12 s va surish bilan');
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
  const slide = (id, v) => p.evaluate(([id, v]) => { const s = document.getElementById(id); s.value = v; s.dispatchEvent(new Event('input')); }, [id, v]);
  await slide('fscale', 80);
  await p.click('#banners button[data-banner=b2]');
  await slide('bscale', 60); await slide('by', 75); await slide('bx', 40);
  const pb = await p.$eval('#pbn', (e) => ({ w: e.style.width, top: e.style.top, vis: getComputedStyle(e).display !== 'none' }));
  assert.deepStrictEqual(pb, { w: '60%', top: '75%', vis: true }, 'plashka ko\'rinishi');
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
  assert.deepStrictEqual([pr.frame_scale, pr.banner, pr.banner_scale, pr.banner_x, pr.banner_y], [0.8, 'b2', 0.6, 0.4, 0.75]);
  assert.deepStrictEqual(errors, [], 'studio\'da JS xato');
  await p.close();
  console.log('✓ MaxiStudio: kesish, ovoz bo\'laklari, hoshiya o\'lchami, plashka, sahifa tugmasi');
}

async function testStudioMenu(browser, base) {
  const { p, errors } = await page(browser, base, () => ({ success: true }));
  await p.goto(base + '/studio/menu/index.html');
  await p.waitForSelector('#tools .tool');
  assert.strictEqual(await p.$$eval('#tools .tool', (x) => x.length), 6, 'menyuda 6 vosita bo\'lishi kerak');
  await p.click('#tools .tool:nth-child(2)');
  assert.strictEqual(await p.evaluate(() => window.__opened), 'https://vocalremover.org/');
  await p.click('#tools .tool:nth-child(3)');
  assert.strictEqual(await p.evaluate(() => window.__opened), 'https://voicelab.uz/speech-to-text');
  await p.click('#tools .tool:nth-child(4)');
  assert.strictEqual(await p.evaluate(() => window.__opened), 'https://aroratools.com/tools/split-audio/');
  await p.click('#tools .tool:nth-child(5)');
  assert.strictEqual(await p.evaluate(() => window.__opened), 'https://adverthunt.com/tools/meta-ads-downloader');
  await p.click('#tools .tool:nth-child(6)');
  assert.strictEqual(await p.evaluate(() => window.__opened), 'https://pinetools.com/split-image');
  await p.click('#tools .tool:nth-child(1)');
  await p.waitForURL('**/studio/');
  assert.deepStrictEqual(errors, [], 'menyuda JS xato');
  await p.close();
  console.log('✓ MaxiStudio menyu: 6 vosita, tashqi havolalar, muharrirga o\'tish');
}

(async () => {
  const srv = await serve();
  const base = 'http://127.0.0.1:' + srv.address().port;
  const browser = await launch();
  try {
    await testHome(browser, base);
    await testStudio(browser, base);
    await testStudioMenu(browser, base);
  } finally {
    await browser.close(); srv.close();
  }
})().catch((e) => { console.error('✗', e.message); process.exit(1); });
