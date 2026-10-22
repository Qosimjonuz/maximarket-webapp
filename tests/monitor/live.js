// Jonli sayt nazorati (GitHub Actions, har 3 soatda): node tests/monitor/live.js
// Statistikaga ta'sir qilmaydi: /api/visit va /api/increment_view so'rovlari brauzerda to'xtatiladi.
const assert = require('assert');
const { launch } = require('../e2e/pw');

const SITE = 'https://maxi-market.uz';
const API = 'https://maximarketbot-production.up.railway.app';

async function get(url) {
  const t = Date.now();
  const r = await fetch(url, { headers: { 'User-Agent': 'MaxiMarket-monitor' }, signal: AbortSignal.timeout(30000) });
  return { status: r.status, text: await r.text(), ms: Date.now() - t };
}

const checks = [
  ['Sayt bosh sahifasi', async () => { const r = await get(SITE + '/'); assert.strictEqual(r.status, 200); assert.ok(r.text.includes('MaxiMarket')); return r.ms; }],
  ['Mahsulotlar API', async () => {
    const r = await get(API + '/api/products'); assert.strictEqual(r.status, 200);
    const n = (JSON.parse(r.text).products || []).length; assert.ok(n > 0, 'mahsulotlar 0 ta'); return r.ms + ' ms, ' + n + ' ta';
  }],
  ['MaxiStudio sahifasi', async () => { const r = await get(SITE + '/studio/'); assert.strictEqual(r.status, 200); return r.ms; }],
  ['Admin panel sahifasi', async () => { const r = await get(SITE + '/Maxikomadmin.html'); assert.strictEqual(r.status, 200); return r.ms; }],
  ['Brauzerda mahsulotlar chiqishi', async () => {
    const browser = await launch();
    try {
      const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
      const errors = [];
      p.on('pageerror', (e) => errors.push(e.message));
      await p.route(/\/api\/(visit|increment_view)/, (r) => r.fulfill({ contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }, body: '{"success":true}' }));
      const t = Date.now();
      await p.goto(SITE + '/', { waitUntil: 'domcontentloaded' });
      await p.waitForSelector('.product-card-h, .big-product-card', { timeout: 30000 });
      assert.deepStrictEqual(errors, [], 'JS xato');
      return (Date.now() - t) + ' ms';
    } finally { await browser.close(); }
  }],
];

(async () => {
  let failed = 0;
  for (const [name, fn] of checks) {
    try { console.log('✅ ' + name + ': ' + (await fn())); }
    catch (e) { failed++; console.log('❌ ' + name + ': ' + (e.message || e).toString().slice(0, 300)); }
  }
  process.exit(failed ? 1 : 0);
})();
