// PWA service worker: ilovani o'rnatiladigan va offline ishlaydigan qiladi
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
}
