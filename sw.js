/* MaxiMarket Service Worker — PWA offline + kesh
   Muhim: HTML/JS/CSS uchun "network-first" — sayt yangilansa, ilova ham
   darhol yangi versiyani oladi (eski kesh muammosi bo'lmaydi).
   API (Railway) hech qachon keshlanmaydi — doim jonli ma'lumot. */
const VERSION = 'v2';
const STATIC_CACHE = 'maximarket-static-' + VERSION;
const APP_SHELL = ['/', '/index.html', '/style.css', '/app.js', '/lock.js', '/manifest.json', '/icons/icon-maskable-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((c) => c.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // API va boshqa domenlar (Railway, Telegram, rasmlar) — keshlamaymiz, jonli
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  // O'z saytimizning HTML/JS/CSS/rasm — avval tarmoq, offline bo'lsa kesh
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then((c) => c || caches.match('/index.html')))
  );
});
