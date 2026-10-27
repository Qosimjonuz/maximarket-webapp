// "Ilovani yuklab oling" taklifi: Android Chrome'da har safar sahifa ochilganda chiqadi.
// Ilova ichida (o'rnatilgan PWA yoki Play'dagi TWA) chiqmaydi. iOS'da Chrome bu so'rovni bermaydi, shuning uchun u yerda yo'q.
(function () {
    var bar = document.getElementById('install-bar');
    if (!bar) return;
    var inApp = window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true
        || (document.referrer || '').indexOf('android-app://') === 0;
    if (inApp) return;

    var deferred = null;
    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();          // Chrome'ning o'z oynasini kechiktirib, bizniki ko'rsatamiz
        deferred = e;
        bar.classList.remove('hidden');
    });
    function hide() { bar.classList.add('hidden'); }
    document.getElementById('install-btn').addEventListener('click', function () {
        if (!deferred) return hide();
        deferred.prompt();
        deferred.userChoice.finally(function () { deferred = null; hide(); });
    });
    document.getElementById('install-close').addEventListener('click', hide);
    window.addEventListener('appinstalled', hide);
})();
