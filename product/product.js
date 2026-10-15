// Mahsulot sahifasi: maxi-market.uz/product/?id=<mahsulot id>
(function () {
    'use strict';
    var API_URL = 'https://maximarketbot-production.up.railway.app';
    var COLORS = {
        'qora': ['Qora', '#000000'], 'oq': ['Oq', '#ffffff'], 'qizil': ['Qizil', '#e53935'], 'kok': ["Ko'k", '#1565c0'],
        'yashil': ['Yashil', '#2e7d32'], 'sariq': ['Sariq', '#fbc02d'], 'pushti': ['Pushti', '#ec407a'],
        'binafsha': ['Binafsha', '#8e24aa'], 'kulrang': ['Kulrang', '#757575'], 'jigarrang': ['Jigarrang', '#6d4c41'],
        'toq-sariq': ["To'q sariq", '#f57c00'], 'oltin': ['Oltin', '#ffd700'], 'kumush': ['Kumush', '#c0c0c0'],
        'moviy': ['Moviy', '#29b6f6'], 'yashil-och': ['Och yashil', '#66bb6a'], 'chegirma-1': ['Marjon', '#ff7043']
    };
    var $ = function (id) { return document.getElementById(id); };
    var allProducts = [], product = null, idx = 0, size = '', color = '';

    function showMsg(html) { var m = $('msg'); m.innerHTML = html; m.classList.remove('hide'); }
    function imgUrl(u) { return !u ? '' : (/^https?:/.test(u) ? u : API_URL + '/api/image/' + encodeURIComponent(u)); }
    function num(n) { return Number(n || 0).toLocaleString('ru-RU'); }
    function post(path, body) {
        return fetch(API_URL + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }

    function getId() {
        var id = new URLSearchParams(location.search).get('id');
        return id && /^[0-9a-fA-F]{24}$/.test(id) ? id : null;
    }

    function showImage() {
        var imgs = product.images || [];
        $('img').src = imgs.length ? imgUrl(imgs[idx]) : '';
        $('dots').innerHTML = '';
        imgs.forEach(function (_, i) {
            var s = document.createElement('span');
            if (i === idx) s.className = 'on';
            $('dots').appendChild(s);
        });
        var multi = imgs.length > 1;
        $('prev').style.display = $('next').style.display = multi ? '' : 'none';
        imgs.forEach(function (u, i) { if (i !== idx) { var p = new Image(); p.src = imgUrl(u); } });
    }
    function slide(d) {
        var n = (product.images || []).length;
        if (n < 2) return;
        idx = (idx + d + n) % n;
        showImage();
    }

    function optionButtons(box, list, make, onPick) {
        var wrap = $(box === 'size' ? 'sizes' : 'colors');
        wrap.innerHTML = '';
        list.forEach(function (v) {
            var b = document.createElement('button');
            b.type = 'button';
            make(b, v);
            b.addEventListener('click', function () {
                Array.prototype.forEach.call(wrap.children, function (c) { c.classList.remove('sel'); });
                b.classList.add('sel');
                onPick(v);
            });
            wrap.appendChild(b);
        });
        $(box + 'Box').classList.remove('hide');
    }

    function render() {
        var p = product;
        document.title = (p.title || 'Mahsulot') + ' — MaxiMarket';
        $('title').textContent = p.title || '';
        var price = p.discount_price || p.price || 0;
        $('price').textContent = num(price);
        if (p.price > price) {
            $('old').textContent = num(p.price) + " so'm";
            $('badge').textContent = '-' + Math.round((1 - price / p.price) * 100) + '%';
            $('badge').classList.remove('hide');
        }
        $('stock').textContent = p.stock || 0;
        $('sold').textContent = p.sold || 0;
        (p.description || '').split('\n').forEach(function (line) {
            line = line.trim();
            if (!line) return;
            var el = document.createElement('p');
            el.textContent = line;
            $('desc').appendChild(el);
        });
        if (!$('desc').children.length) $('desc').classList.add('hide');
        if (p.sizes && p.sizes.length) optionButtons('size', p.sizes, function (b, v) { b.textContent = v; }, function (v) { size = v; });
        var cols = (p.colors || []).filter(function (c) { return COLORS[c]; });
        if (cols.length) optionButtons('color', cols, function (b, c) {
            var d = document.createElement('span'); d.className = 'dot'; d.style.background = COLORS[c][1];
            b.appendChild(d); b.appendChild(document.createTextNode(COLORS[c][0]));
        }, function (c) { color = c; });
        showImage();
        $('msg').classList.add('hide');
        $('page').classList.remove('hide');
        $('bar').classList.remove('hide');
        startFeed(p);
        post('/api/increment_view', { product_id: String(p.id) }).catch(function () {});
    }

    // Pastda boshqa mahsulotlar lentasi: mahsulot oz bo'lsa ham takrorlanib, tugamaydi
    var feedList = [], feedShown = 0, FEED_MAX = 200;
    function addFeed(count) {
        var end = Math.min(feedShown + count, FEED_MAX), grid = $('feedGrid');
        for (var i = feedShown; i < end; i++) {
            var q = feedList[i % feedList.length];
            var a = document.createElement('a');
            a.className = 'pc';
            a.href = '/product/?id=' + encodeURIComponent(q.id);
            var im = document.createElement('img');
            im.loading = 'lazy'; im.decoding = 'async'; im.alt = '';
            im.src = imgUrl((q.images || [])[0]);
            var t = document.createElement('div'); t.className = 't'; t.textContent = (q.title || '').slice(0, 60);
            var price = q.discount_price || q.price || 0;
            var o = document.createElement('div'); o.className = 'o'; o.textContent = q.price > price ? num(q.price) : '';
            var n = document.createElement('div'); n.className = 'n'; n.textContent = num(price) + " so'm";
            var b = document.createElement('div'); b.className = 'b'; b.textContent = '🛒 Sotib olish';
            [im, t, o, n, b].forEach(function (x) { a.appendChild(x); });
            grid.appendChild(a);
        }
        feedShown = end;
    }
    function startFeed(p) {
        feedList = allProducts.filter(function (x) { return String(x.id) !== String(p.id); });
        if (!feedList.length) return;
        for (var i = feedList.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = feedList[i]; feedList[i] = feedList[j]; feedList[j] = t; }
        $('feed').style.display = '';
        addFeed(8);
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (en) { if (en.some(function (e) { return e.isIntersecting; })) addFeed(8); },
                { rootMargin: '400px 0px' }).observe($('feedEnd'));
        }
    }

    function formatPhone(v) {
        var d = v.replace(/\D/g, '');
        if (d.indexOf('998') === 0) d = d.slice(3);
        d = d.slice(0, 9);
        var r = '+998';
        if (d.length > 0) r += '(' + d.slice(0, 2);
        if (d.length >= 2) r += ')';
        if (d.length > 2) r += '-' + d.slice(2, 5);
        if (d.length > 5) r += '-' + d.slice(5, 7);
        if (d.length > 7) r += '-' + d.slice(7, 9);
        return r;
    }

    function setStatus(text, cls) { var s = $('status'); s.textContent = text; s.className = 'st ' + (cls || ''); }

    function submit(e) {
        e.preventDefault();
        var name = $('name').value.trim(), phone = $('phone').value.trim();
        if (name.length < 4) return setStatus('❌ Ism kamida 4 harf!', 'err');
        if (phone.replace(/\D/g, '').length < 12) return setStatus("❌ Telefon to'liq emas!", 'err');
        if (product.sizes && product.sizes.length && !size) return setStatus("❌ O'lchamni tanlang!", 'err');
        var colorName = '';
        if (product.colors && product.colors.length) {
            if (!color) return setStatus('❌ Rangni tanlang!', 'err');
            colorName = COLORS[color] ? COLORS[color][0] : '';
        }
        var btn = $('submit');
        btn.disabled = true; btn.textContent = 'Yuborilmoqda...';
        post('/api/public_order', {
            product_id: String(product.id),
            product_title: product.title,
            price: product.discount_price || product.price || 0,
            customer_name: name,
            customer_phone: phone,
            size: size,
            color: colorName
        }).then(function (r) { return r.json(); }).then(function (d) {
            if (d.success) {
                setStatus('✅ Buyurtmangiz qabul qilindi! Tez orada operatorimiz bog\'lanadi.', 'ok');
                $('form').reset();
            } else setStatus('❌ ' + (d.error || 'Xatolik'), 'err');
        }).catch(function () { setStatus('❌ Tarmoq xatosi', 'err'); })
          .then(function () { btn.disabled = false; btn.textContent = 'Tasdiqlash'; });
    }

    function init() {
        var id = getId();
        if (!id) return showMsg('Mahsulot havolasi noto\'g\'ri. <a href="/">Bosh sahifaga o\'tish</a>');
        $('prev').addEventListener('click', function () { slide(-1); });
        $('next').addEventListener('click', function () { slide(1); });
        var sx = 0;
        $('img').addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
        $('img').addEventListener('touchend', function (e) {
            var dx = e.changedTouches[0].clientX - sx;
            if (Math.abs(dx) > 40) slide(dx < 0 ? 1 : -1);
        }, { passive: true });
        $('phone').addEventListener('input', function () { this.value = formatPhone(this.value); });
        $('phone').addEventListener('focus', function () { if (!this.value) this.value = '+998'; });
        $('goOrder').addEventListener('click', function () { $('form').scrollIntoView({ behavior: 'smooth' }); });
        $('form').addEventListener('submit', submit);
        fetch(API_URL + '/api/products').then(function (r) { return r.json(); }).then(function (d) {
            allProducts = d.products || [];
            product = allProducts.filter(function (p) { return String(p.id) === id; })[0];
            if (!product) return showMsg('Mahsulot topilmadi. <a href="/">Bosh sahifaga o\'tish</a>');
            render();
        }).catch(function () { showMsg('Xatolik. Qayta urinib ko\'ring. <a href="/">Bosh sahifa</a>'); });
    }
    init();
})();
