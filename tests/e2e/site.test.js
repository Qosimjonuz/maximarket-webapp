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



async function testPixelFunnel(browser, base) {
  const { p, errors } = await page(browser, base, (req) => (req.url().includes('/api/products') ? { products: PRODUCTS.map((x) => ({ ...x, title: x.name, discount_price: 150000 })) } : null));
  await p.route('https://connect.facebook.net/**', (r) => r.fulfill({ contentType: 'application/javascript', body: '' }));
  await p.goto(base + '/product/index.html?id=' + PRODUCTS[0].id);
  await p.waitForSelector('#form');
  await p.click('#goOrder');
  await p.focus('#name'); await p.focus('#phone');
  await p.fill('#name', 'Test Mijoz'); await p.fill('#phone', '+998901234567');
  await p.click('#submit');
  await p.waitForFunction(() => /qabul/.test(document.getElementById('status').textContent));
  const ev = await p.evaluate(() => (window.fbq.queue || []).filter((a) => a[0] === 'track').map((a) => [a[1], a[2]]));
  const names = ev.map((e) => e[0]);
  assert.deepStrictEqual(names, ['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Lead', 'Purchase'], 'hodisalar tartibi (AddToCart bir marta): ' + names);
  const pur = ev[5][1];
  assert.strictEqual(pur.currency, 'UZS'); assert.strictEqual(pur.value, 150000); assert.deepStrictEqual(pur.content_ids, [PRODUCTS[0].id]);
  assert.ok(!/Test Mijoz|998901234567/.test(JSON.stringify(ev)), 'ism/telefon pixelga ketmasligi kerak');
  assert.deepStrictEqual(errors, [], 'mahsulot sahifasida JS xato');
  await p.close();
  console.log('✓ pixel: ViewContent, AddToCart, InitiateCheckout, Lead, Purchase (UZS, shaxsiy ma\'lumotsiz)');
}

(async () => {
  const srv = await serve();
  const base = 'http://127.0.0.1:' + srv.address().port;
  const browser = await launch();
  try {
    await testHome(browser, base);
    await testPixelFunnel(browser, base);
  } finally {
    await browser.close(); srv.close();
  }
})().catch((e) => { console.error('✗', e.message); process.exit(1); });
