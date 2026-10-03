// ==================== ILOVA QULFI (PIN-kod) ====================
// Faqat o'rnatilgan ilova rejimida ishlaydi (brauzer va Telegramda emas).
(function () {
    if (!document.documentElement.classList.contains('is-app')) return;

    const PIN_KEY = 'mm_pin';
    const HIDDEN_AT_KEY = 'mm_hidden_at';
    const FAIL_KEY = 'mm_pin_fail';
    const LOCKOUT_KEY = 'mm_pin_lockout_until';
    const PIN_LENGTH = 4;
    const INACTIVE_MS = 5 * 60 * 1000;
    const MAX_FAILS = 5;
    const LOCKOUT_MS = 30 * 1000;
    const SPLASH_MS = 900;

    const el = document.getElementById('app-lock');
    const msgEl = document.getElementById('lock-msg');
    const dotsEl = document.getElementById('lock-dots');
    const padEl = document.getElementById('lock-pad');
    const forgotBtn = document.getElementById('lock-forgot');

    let mode = 'enter';      // enter | setup | confirm
    let entered = '';
    let firstPin = '';
    let locked = true;
    let busy = false;
    let lastActivity = Date.now();

    function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
    function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

    function toHex(buf) {
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    async function hashPin(pin, salt) {
        const data = new TextEncoder().encode(salt + ':' + pin);
        return toHex(await crypto.subtle.digest('SHA-256', data));
    }
    function storedPin() {
        try { return JSON.parse(lsGet(PIN_KEY) || 'null'); } catch (e) { return null; }
    }
    async function savePin(pin) {
        const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
        lsSet(PIN_KEY, JSON.stringify({ salt: salt, hash: await hashPin(pin, salt) }));
    }

    function renderDots() {
        let html = '';
        for (let i = 0; i < PIN_LENGTH; i++) {
            html += '<span class="lock-dot' + (i < entered.length ? ' filled' : '') + '"></span>';
        }
        dotsEl.innerHTML = html;
    }
    function setMsg(text, isError) {
        msgEl.textContent = text;
        msgEl.classList.toggle('error', !!isError);
    }
    function defaultMsg() {
        if (mode === 'setup') return 'Yangi PIN-kod o\'rnating';
        if (mode === 'confirm') return 'PIN-kodni qayta kiriting';
        return 'PIN-kodni kiriting';
    }
    function shake() {
        dotsEl.classList.remove('shake');
        void dotsEl.offsetWidth;
        dotsEl.classList.add('shake');
        if (navigator.vibrate) navigator.vibrate(120);
    }

    function lockoutLeft() {
        return Math.max(0, parseInt(lsGet(LOCKOUT_KEY) || '0', 10) - Date.now());
    }
    let lockoutTimer = null;
    function showLockout() {
        clearInterval(lockoutTimer);
        const tick = function () {
            const left = lockoutLeft();
            if (left <= 0) {
                clearInterval(lockoutTimer);
                setMsg(defaultMsg(), false);
                return;
            }
            setMsg('Ko\'p xato. ' + Math.ceil(left / 1000) + ' soniyadan keyin urinib ko\'ring', true);
        };
        tick();
        lockoutTimer = setInterval(tick, 1000);
    }

    function startMode(m) {
        mode = m;
        entered = '';
        forgotBtn.style.visibility = (m === 'enter') ? 'visible' : 'hidden';
        renderDots();
        if (m === 'enter' && lockoutLeft() > 0) showLockout();
        else setMsg(defaultMsg(), false);
    }

    async function onComplete() {
        busy = true;
        const pin = entered;
        if (mode === 'setup') {
            firstPin = pin;
            startMode('confirm');
        } else if (mode === 'confirm') {
            if (pin === firstPin) {
                await savePin(pin);
                firstPin = '';
                unlock();
            } else {
                firstPin = '';
                shake();
                startMode('setup');
                setMsg('PIN-kodlar mos kelmadi. Qaytadan o\'rnating', true);
            }
        } else {
            const s = storedPin();
            if (s && await hashPin(pin, s.salt) === s.hash) {
                lsDel(FAIL_KEY);
                unlock();
            } else {
                const fails = parseInt(lsGet(FAIL_KEY) || '0', 10) + 1;
                entered = '';
                renderDots();
                shake();
                if (fails >= MAX_FAILS) {
                    lsSet(FAIL_KEY, '0');
                    lsSet(LOCKOUT_KEY, String(Date.now() + LOCKOUT_MS));
                    showLockout();
                } else {
                    lsSet(FAIL_KEY, String(fails));
                    setMsg('Noto\'g\'ri PIN-kod. Qolgan urinish: ' + (MAX_FAILS - fails), true);
                }
            }
        }
        busy = false;
    }

    function press(key) {
        if (!locked || busy) return;
        if (mode === 'enter' && lockoutLeft() > 0) return;
        if (key === 'del') {
            entered = entered.slice(0, -1);
        } else if (entered.length < PIN_LENGTH) {
            entered += key;
        }
        renderDots();
        if (entered.length === PIN_LENGTH) setTimeout(onComplete, 120);
    }

    function resetSession() {
        try { if (typeof closeModal === 'function') closeModal(true); } catch (e) {}
        try {
            const search = document.getElementById('search-input');
            if (search) search.value = '';
            if (typeof setCategory === 'function') setCategory('all');
        } catch (e) {}
        try { history.replaceState(null, '', location.pathname); } catch (e) {}
        try { sessionStorage.clear(); } catch (e) {}
        window.scrollTo(0, 0);
    }

    function lock() {
        locked = true;
        document.documentElement.classList.add('mm-locked');
        el.classList.remove('hidden');
        el.classList.add('ready');
        startMode(storedPin() ? 'enter' : 'setup');
    }
    function unlock() {
        locked = false;
        entered = '';
        lastActivity = Date.now();
        el.classList.add('hidden');
        document.documentElement.classList.remove('mm-locked');
    }
    function expire() {
        resetSession();
        lock();
    }

    padEl.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-key]');
        if (btn) press(btn.getAttribute('data-key'));
    });
    forgotBtn.addEventListener('click', function () {
        if (!confirm('Yangi PIN-kod o\'rnatmoqchimisiz?')) return;
        ['mm_profile', 'mm_orders', PIN_KEY, FAIL_KEY, LOCKOUT_KEY].forEach(lsDel);
        resetSession();
        startMode('setup');
    });

    // Ilova orqa fonga o'tganda vaqtni eslab qolamiz, qaytganda 5 daqiqadan oshgan bo'lsa qulflaymiz
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') {
            lsSet(HIDDEN_AT_KEY, String(Date.now()));
        } else if (!locked) {
            const hiddenAt = parseInt(lsGet(HIDDEN_AT_KEY) || '0', 10);
            if (hiddenAt && Date.now() - hiddenAt >= INACTIVE_MS) expire();
            else lastActivity = Date.now();
        }
    });

    // Ilova ochiq, lekin 5 daqiqa hech narsa bosilmasa ham qulflanadi
    ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(function (evt) {
        window.addEventListener(evt, function () { if (!locked) lastActivity = Date.now(); }, { passive: true });
    });
    setInterval(function () {
        if (!locked && document.visibilityState === 'visible' && Date.now() - lastActivity >= INACTIVE_MS) expire();
    }, 15 * 1000);

    // Ochilish ekrani (logo), keyin PIN klaviatura
    setTimeout(lock, SPLASH_MS);
})();
