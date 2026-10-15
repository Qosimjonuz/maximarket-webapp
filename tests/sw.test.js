// Ishga tushirish: node tests/sw.test.js  (kutubxonasiz)
const vm = require('vm');
const fs = require('fs');
const assert = require('assert');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');

function setup(fetchImpl) {
    const handlers = {};
    const puts = [];
    const matches = [];
    const sb = {
        self: { addEventListener: (t, h) => { handlers[t] = h; }, location: { origin: 'https://maxi-market.uz' }, skipWaiting() {}, clients: { claim() {} } },
        caches: {
            open: () => Promise.resolve({ put: (k, v) => { puts.push(typeof k === 'string' ? k : k.url); return Promise.resolve(); }, addAll: () => Promise.resolve() }),
            match: (k) => { matches.push(typeof k === 'string' ? k : k.url); return Promise.resolve(undefined); },
            keys: () => Promise.resolve([]),
            delete: () => Promise.resolve(),
        },
        fetch: fetchImpl,
        URL,
        Promise,
    };
    vm.createContext(sb);
    vm.runInContext(SRC, sb);
    return { handlers, puts, matches };
}

async function hit(env, url) {
    let p;
    env.handlers.fetch({ request: { method: 'GET', url }, respondWith: (x) => { p = x; } });
    if (p) await p;
    await new Promise((r) => setTimeout(r, 5));
}

(async () => {
    const ok = () => Promise.resolve({ status: 200, type: 'basic', clone: () => ({}) });
    let env = setup(ok);
    // Bosh sahifa har xil reklama havolalari bilan: hammasi bitta kalit
    await hit(env, 'https://maxi-market.uz/?p=6ab89823f3e05e6e07df8444&fbclid=AAA');
    await hit(env, 'https://maxi-market.uz/?utm_source=instagram&fbclid=BBB');
    await hit(env, 'https://maxi-market.uz/');
    await hit(env, 'https://maxi-market.uz/index.html?x=1');
    assert.deepStrictEqual(env.puts, ['/index.html', '/index.html', '/index.html', '/index.html']);
    // Boshqa fayllar o'z manzili bilan keshlanadi
    await hit(env, 'https://maxi-market.uz/privacy.html');
    await hit(env, 'https://maxi-market.uz/app.js');
    assert.deepStrictEqual(env.puts.slice(4), ['https://maxi-market.uz/privacy.html', 'https://maxi-market.uz/app.js']);
    // /api va boshqa domenlar keshlanmaydi
    const before = env.puts.length;
    await hit(env, 'https://maxi-market.uz/api/products');
    await hit(env, 'https://i.ibb.co/x.png');
    assert.strictEqual(env.puts.length, before);
    // Offline: bosh sahifa kalit bo'yicha qidiriladi
    env = setup(() => Promise.reject(new Error('offline')));
    await hit(env, 'https://maxi-market.uz/?p=6ab89823f3e05e6e07df8444&fbclid=CCC');
    assert.ok(env.matches.includes('/index.html'));
    console.log('sw testlari o\'tdi');
})().catch((e) => { console.error(e); process.exit(1); });
