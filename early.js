// Ilova rejimini erta aniqlash: qulf/ochilish ekrani sahifa ko'rinishidan oldin chiqishi uchun
(function () {
    try {
        var app = window.matchMedia('(display-mode: standalone)').matches
            || window.navigator.standalone === true
            || (document.referrer || '').indexOf('android-app://') === 0;
        if (app) document.documentElement.classList.add('is-app', 'mm-locked');
    } catch (e) {}
})();
