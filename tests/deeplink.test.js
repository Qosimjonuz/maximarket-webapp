// Ishga tushirish: node tests/deeplink.test.js  (kutubxonasiz)
const vm = require('vm');
const fs = require('fs');
const assert = require('assert');
const path = require('path');

const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const m = app.match(/\/\/ =+ MAHSULOT HAVOLASI[\s\S]*?\/\/ =+ \/ MAHSULOT HAVOLASI =+/);
assert.ok(m, 'havola bloki app.js da topilmadi');
const ID = '6ab89823f3e05e6e07df8444';

function run(search, productIds) {
    const calls = [];
    const sb = {
        location: { search },
        products: (productIds || [ID]).map((id) => ({ id })),
        openModal: (id) => calls.push(id),
        URLSearchParams,
    };
    vm.createContext(sb);
    vm.runInContext(m[0], sb);
    sb.openProductFromUrl();
    sb.openProductFromUrl(); // ikkinchi chaqiruv hech narsa qilmasligi kerak
    return calls;
}

// 1. To'g'ri id va mahsulot bor: bir marta ochiladi
assert.deepStrictEqual(run('?p=' + ID), [ID]);
// 2. Reklama parametrlari bilan birga ham ishlaydi
assert.deepStrictEqual(run('?utm_source=instagram&p=' + ID + '&fbclid=IwAR123'), [ID]);
// 3. Katta-kichik harf farqi (hex)
assert.deepStrictEqual(run('?p=' + ID.toUpperCase(), [ID.toUpperCase()]), [ID.toUpperCase()]);
// 4. Noto'g'ri yoki xavfli qiymatlar: ochilmaydi
for (const bad of ['', '?p=', '?p=abc', '?p=' + ID.slice(1), '?p=' + ID + '0', '?p=zzzzzzzzzzzzzzzzzzzzzzzz',
                   '?p=<script>alert(1)</script>', "?p=' OR 1=1", '?p[]=' + ID, '?q=' + ID]) {
    assert.deepStrictEqual(run(bad), [], 'ochilmasligi kerak: ' + bad);
}
// 5. Mahsulot ro'yxatda yo'q: oddiy bosh sahifa
assert.deepStrictEqual(run('?p=' + ID, ['ffffffffffffffffffffffff']), []);
// 6. Bir nechta p: birinchisi olinadi, faqat to'g'risi
assert.deepStrictEqual(run('?p=' + ID + '&p=abc'), [ID]);

console.log('deeplink testlari o\'tdi');
