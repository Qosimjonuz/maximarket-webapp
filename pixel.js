// Meta Pixel (reklama natijasini o'lchash). Tashqi skript faqat shu faylda va faqat PIXEL_ID qo'yilganda yuklanadi.
// Shaxsiy ma'lumot (ism, telefon) Meta'ga YUBORILMAYDI: faqat sahifa ko'rilishi va buyurtma hodisasi (mahsulot id, narx).
(function () {
    'use strict';
    // Meta Events Manager > Data sources > Pixel ID (faqat raqam, sir emas). Bo'sh bo'lsa hech narsa yuklanmaydi.
    var PIXEL_ID = '994609253124059';   // MaxiMarket (biznes shodmakuz, ads akkaunt "maxi marked"), 2026-11-11

    window.mmTrack = function () {};
    window.mmTrackOnce = function () {};
    if (!/^\d{10,20}$/.test(PIXEL_ID)) return;
    // Foydalanuvchi kuzatuvni o'chirgan bo'lsa (Do Not Track / Global Privacy Control), hurmat qilamiz
    if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true) return;

    /* eslint-disable */
    !function (f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */

    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');

    // mmTrack('Lead', {content_ids: ['id'], content_name: '...', value: 99000, currency: 'UZS'})
    window.mmTrack = function (name, data) {
        try { window.fbq('track', String(name), data || {}); } catch (e) { /* o'lchash xatosi saytga halaqit bermasin */ }
    };

    // Bir sahifa/oyna uchun bir marta (AddToCart, InitiateCheckout): key bir xil bo'lsa qayta yuborilmaydi
    var seen = {};
    window.mmTrackOnce = function (key, name, data) {
        if (seen[key]) return;
        seen[key] = 1;
        window.mmTrack(name, data);
    };
})();
