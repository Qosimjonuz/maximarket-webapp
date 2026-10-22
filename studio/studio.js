// MaxiStudio: Telegram Mini App ichidagi video muharrir.
// Fayllar darhol serverga yuklanadi, ko'rish brauzerda (mahalliy nusxa), yakuniy video serverda yig'iladi.
(function () {
  'use strict';
  var API = 'https://maximarketbot-production.up.railway.app';
  var tg = window.Telegram && window.Telegram.WebApp;
  var INIT = tg ? tg.initData : '';
  var FONTS = [['montserrat', 'Montserrat'], ['rubik', 'Rubik'], ['oswald', 'Oswald'], ['bebas', 'Bebas Neue'],
    ['playfair', 'Playfair Display'], ['comfortaa', 'Comfortaa'], ['lobster', 'Lobster'], ['pacifico', 'Pacifico']];
  var COLORS = ['#ffffff', '#000000', '#ffeb3b', '#ff3d6e', '#e53935', '#ff9800', '#4caf50', '#00e5ff', '#1e88e5', '#8e24aa', '#f8bbd0', '#795548'];
  var FILTERS = [['none', 'Asl', ''], ['bright', 'Yorqin', 'brightness(1.06) saturate(1.25) contrast(1.05)'],
    ['warm', 'Iliq', 'sepia(.22) saturate(1.2)'], ['cool', 'Sovuq', 'hue-rotate(-12deg) saturate(1.05) brightness(1.03)'],
    ['bw', 'Oq-qora', 'grayscale(1) contrast(1.1)'], ['vintage', 'Retro', 'sepia(.45) contrast(.95) saturate(.9)'],
    ['cinema', 'Kino', 'contrast(1.15) saturate(.85)'], ['vivid', "To'q", 'saturate(1.5) contrast(1.1)']];
  var TRANSITIONS = [['none', "Yo'q"], ['fade', 'Silliq'], ['fadeblack', "Qora orqali"], ['dissolve', 'Erish'],
    ['slideleft', 'Chapga'], ['slideup', 'Yuqoriga'], ['wiperight', 'Surish'], ['zoomin', 'Kattalashish'], ['circleopen', 'Doira']];
  var STICKERS = ['🔥', '😍', '🤩', '😱', '😂', '🥰', '👍', '👏', '🙌', '💪', '❤️', '💯', '✅', '❌', '⭐', '✨', '💥', '⚡', '🎁', '🎉',
    '🛒', '🛍', '🚚', '📦', '💰', '💸', '🏷', '🆕', '🆓', '🔝', '👇', '👉', '👆', '⬇️', '➡️', '📍', '📞', '⏰', '🎯', '💎'];
  var TEMPLATES = [
    ['🔥 Aksiya', { text: 'AKSIYA 🔥', font: 'bebas', size: 0.11, bg: 'box', bg_color: '#e53935', shadow: false, y: 0.14 }],
    ['🆕 Yangi', { text: 'YANGI MAHSULOT 🆕', font: 'oswald', size: 0.07, bg: 'box', bg_color: '#1e88e5', shadow: false, y: 0.14 }],
    ['🛒 Buyurtma', { text: 'Buyurtma: maxi-market.uz 🛒', font: 'rubik', size: 0.05, bg: 'box', bg_color: '#000000', shadow: false, y: 0.9 }],
    ['👇 Tavsif', { text: "Batafsil tavsifda 👇", font: 'montserrat', size: 0.05, color: '#ffeb3b', y: 0.88 }],
    ['😱 Hook', { text: 'Qaranglar, nima oldim! 😱', font: 'rubik', size: 0.065, outline: true, y: 0.3 }]];
  var EMOJIS = ['🔥', '😍', '✅', '💥', '⭐', '🎁', '❤️', '👍', '😱', '🤩', '💯', '🛒', '🚚', '💰', '⚡', '👇', '👉', '🎉', '😊', '🆕'];

  var S = { clips: [], texts: [], music: null, videoVolume: 1, fit: 'cover', transition: 'none', tdur: 0.5, frame: 'none' };
  var FRAMES = ['f1', 'f2', 'f3'];
  var USER = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id) || 'x';
  var DRAFT_KEY = 'maxistudio:' + USER;
  var $ = function (id) { return document.getElementById(id); };
  var t = 0, playing = false, lastTick = 0, editing = null, uidSeq = 1;

  // ---------- yordamchilar ----------
  function fmt(s) { s = Math.max(0, s || 0); var m = Math.floor(s / 60), r = Math.floor(s % 60); return m + ':' + (r < 10 ? '0' : '') + r; }
  function toast(msg) { var el = $('toast'); el.textContent = msg; el.classList.remove('hidden'); clearTimeout(toast._t); toast._t = setTimeout(function () { el.classList.add('hidden'); }, 3200); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function clipDur(c) { return c.kind === 'image' ? c.imgDur : Math.max(0.3, c.end - c.start); }
  function tdur() {
    if (S.transition === 'none' || S.clips.length < 2) return 0;
    var m = Math.min.apply(null, S.clips.map(clipDur));
    return Math.min(S.tdur, m * 0.45);
  }
  function total() { return Math.max(0, S.clips.reduce(function (a, c) { return a + clipDur(c); }, 0) - tdur() * Math.max(0, S.clips.length - 1)); }
  function haptic() { try { tg.HapticFeedback.impactOccurred('light'); } catch (e) {} }

  function api(path, opts) {
    opts = opts || {};
    opts.headers = Object.assign({ 'X-Tg-Init-Data': INIT }, opts.headers || {});
    return fetch(API + path, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok || d.success === false) throw new Error(d.error || ('Xatolik ' + r.status));
        return d;
      });
    });
  }

  function upload(file, onProgress) {
    return new Promise(function (resolve, reject) {
      var x = new XMLHttpRequest();
      x.open('POST', API + '/api/studio/upload');
      x.setRequestHeader('X-Tg-Init-Data', INIT);
      x.upload.onprogress = function (e) { if (e.lengthComputable) onProgress(e.loaded / e.total); };
      x.onload = function () {
        var d = {}; try { d = JSON.parse(x.responseText); } catch (e) {}
        if (x.status === 200 && d.file) resolve(d.file); else reject(new Error(d.error || ('Yuklanmadi (' + x.status + ')')));
      };
      x.onerror = function () { reject(new Error('Internet aloqasini tekshiring')); };
      var fd = new FormData();
      fd.append('file', file, file.name || 'fayl');
      x.send(fd);
    });
  }

  // ---------- kliplar ----------
  function addFiles(files) {
    Array.prototype.forEach.call(files, function (f) {
      var isImg = /^image\//.test(f.type), isVid = /^video\//.test(f.type);
      if (!isImg && !isVid) { toast('Bu fayl turi qo\'llanmaydi: ' + (f.type || f.name)); return; }
      if (f.size > 200 * 1024 * 1024) { toast('Fayl 200 MB dan katta'); return; }
      var c = { uid: uidSeq++, kind: isImg ? 'image' : 'video', url: URL.createObjectURL(f), name: f.name, id: null, filter: 'none', serverUrl: null,
        duration: isImg ? 3 : 0, start: 0, end: 0, imgDur: 3, progress: 0, error: null };
      S.clips.push(c);
      if (isVid) {
        var v = document.createElement('video'); v.preload = 'metadata'; v.src = c.url;
        v.onloadedmetadata = function () { c.duration = v.duration || 0; c.end = Math.min(c.duration, 60); renderClips(); refresh(); };
      }
      upload(f, function (p) { c.progress = p; updateBar(c); }).then(function (meta) {
        c.id = meta.id; c.progress = 1; c.serverUrl = meta.url ? API + meta.url : null;
        if (c.kind === 'video') { c.duration = meta.duration; if (!c.end || c.end > meta.duration) c.end = Math.min(meta.duration, 60); }
        renderClips(); refresh();
      }).catch(function (e) { c.error = e.message; renderClips(); toast(e.message); });
    });
    renderClips(); refresh();
  }

  function updateBar(c) { var b = document.querySelector('[data-bar="' + c.uid + '"]'); if (b) b.style.width = Math.round(c.progress * 100) + '%'; }

  function rangeRow(label, min, max, step, val, onInput) {
    var wrap = el('div');
    var l = el('label', 'lbl'); var span = el('span', null, fmt(val));
    l.textContent = label + ': '; l.appendChild(span);
    var r = el('input'); r.type = 'range'; r.min = min; r.max = max; r.step = step; r.value = val;
    r.addEventListener('input', function () { onInput(parseFloat(r.value), span); });
    wrap.appendChild(l); wrap.appendChild(r);
    return wrap;
  }

  function renderClips() {
    var box = $('clips'); box.textContent = '';
    S.clips.forEach(function (c, i) {
      var card = el('div', 'card');
      var row = el('div', 'clip');
      var th;
      if (c.kind === 'image') { th = el('img', 'thumb'); th.src = c.url; th.alt = ''; }
      else { th = el('video', 'thumb'); th.src = c.url + '#t=0.1'; th.muted = true; th.playsInline = true; th.preload = 'metadata'; }
      row.appendChild(th);
      var body = el('div', 'clip-body');
      var title = el('div', 'clip-title');
      title.appendChild(el('span', null, (i + 1) + '. ' + (c.kind === 'image' ? '🖼 Rasm' : '🎞 Video') + ' · ' + fmt(clipDur(c))));
      var acts = el('div', 'clip-actions');
      [['↑', -1], ['↓', 1]].forEach(function (a) {
        var b = el('button', 'icon', a[0]); b.disabled = (a[1] < 0 && i === 0) || (a[1] > 0 && i === S.clips.length - 1);
        b.addEventListener('click', function () { var j = i + a[1]; S.clips.splice(j, 0, S.clips.splice(i, 1)[0]); renderClips(); refresh(); });
        acts.appendChild(b);
      });
      var cutB = el('button', 'icon', '✂️'); cutB.setAttribute('aria-label', 'Kesish');
      cutB.addEventListener('click', function () {
        var loc = locate(t);   // ko'rish oynasidagi joy shu klipda bo'lsa o'sha joydan, aks holda o'rtasidan
        splitClip(i, loc && loc.i === i ? loc.local : clipDur(c) / 2);
      });
      acts.appendChild(cutB);
      var del = el('button', 'icon', '🗑');
      del.addEventListener('click', function () { S.clips.splice(i, 1); renderClips(); refresh(); saveDraft(); });
      acts.appendChild(del);
      title.appendChild(acts);
      body.appendChild(title);
      if (c.error) body.appendChild(el('div', 'hint', '❌ ' + c.error));
      else if (!c.id) { var bar = el('div', 'bar'); var fill = el('i'); fill.setAttribute('data-bar', c.uid); fill.style.width = Math.round(c.progress * 100) + '%'; bar.appendChild(fill); body.appendChild(bar); }
      if (c.kind === 'video' && c.duration) {
        body.appendChild(rangeRow('Boshi', 0, c.duration, 0.1, c.start, function (v, sp) { c.start = Math.min(v, c.end - 0.3); sp.textContent = fmt(c.start); title.firstChild.textContent = (i + 1) + '. 🎞 Video · ' + fmt(clipDur(c)); seekTo(clipStartAt(i)); refresh(true); }));
        body.appendChild(rangeRow('Oxiri', 0, c.duration, 0.1, c.end, function (v, sp) { c.end = Math.max(v, c.start + 0.3); sp.textContent = fmt(c.end); title.firstChild.textContent = (i + 1) + '. 🎞 Video · ' + fmt(clipDur(c)); refresh(true); }));
      } else if (c.kind === 'image') {
        body.appendChild(rangeRow('Davomiyligi', 1, 15, 0.5, c.imgDur, function (v, sp) { c.imgDur = v; sp.textContent = fmt(v); title.firstChild.textContent = (i + 1) + '. 🖼 Rasm · ' + fmt(v); refresh(true); }));
      }
      var chips = el('div', 'chips');
      FILTERS.forEach(function (f) {
        var b = el('button', (c.filter || 'none') === f[0] ? 'active' : '', f[1]);
        b.addEventListener('click', function () { c.filter = f[0]; Array.prototype.forEach.call(chips.children, function (x) { x.classList.toggle('active', x === b); }); seekTo(clipStartAt(i) + 0.05); saveDraft(); });
        chips.appendChild(b);
      });
      body.appendChild(chips);
      row.appendChild(body);
      card.appendChild(row);
      box.appendChild(card);
    });
  }

  // Klipni ko'rish oynasidagi joydan ikkiga bo'lish (keraksiz bo'lakni keyin o'chirish mumkin)
  function splitClip(i, local) {
    var c = S.clips[i], d = clipDur(c);
    if (local < 0.3 || d - local < 0.3) { toast('Kesish joyi klip chetiga juda yaqin. Surgich bilan klip o\'rtasini tanlang'); return; }
    var b = Object.assign({}, c, { uid: uidSeq++ });
    if (c.kind === 'image') { c.imgDur = Math.round(local * 10) / 10; b.imgDur = Math.round((d - local) * 10) / 10; }
    else { var cut = c.start + local; c.end = cut; b.start = cut; }
    S.clips.splice(i + 1, 0, b);
    pause(); renderClips(); refresh(true); saveDraft(); haptic();
    toast('✂️ Ikkiga bo\'lindi: ' + (i + 1) + ' va ' + (i + 2) + '-bo\'lak. Keraksizini 🗑 bilan o\'chiring');
  }
  function splitHere() {
    var loc = locate(t);
    if (!loc) { toast('Avval video yoki rasm qo\'shing'); return; }
    splitClip(loc.i, loc.local);
  }

  function clipStartAt(i) { var s = 0; for (var k = 0; k < i; k++) s += clipDur(S.clips[k]); return s - tdur() * i; }

  // ---------- ko'rish (player) ----------
  var pv, pi, pa, layer, stage;
  function locate(gt) {
    if (!S.clips.length) return null;
    var idx = 0;
    for (var i = 0; i < S.clips.length; i++) if (clipStartAt(i) <= gt + 1e-6) idx = i;
    var d = clipDur(S.clips[idx]);
    return { i: idx, local: Math.min(d, Math.max(0, gt - clipStartAt(idx))) };
  }

  var shownUid = null;
  function showFrame(seek) {
    var loc = locate(t);
    $('empty').classList.toggle('hidden', !!loc);
    if (!loc) { pv.style.display = 'none'; pi.style.display = 'none'; drawTexts(); return; }
    var c = S.clips[loc.i];
    var css = (FILTERS.filter(function (f) { return f[0] === c.filter; })[0] || FILTERS[0])[2];
    pv.style.filter = css; pi.style.filter = css;
    if (c.kind === 'image') {
      pv.pause(); pv.style.display = 'none';
      if (pi.getAttribute('src') !== c.url) pi.src = c.url;
      pi.style.display = 'block';
    } else {
      pi.style.display = 'none'; pv.style.display = 'block';
      var target = c.start + loc.local;
      if (pv.getAttribute('src') !== c.url) { pv.src = c.url; shownUid = c.uid; pv.currentTime = target; }   // bo'lingan kliplar bitta faylni ishlatadi
      else if (shownUid !== c.uid) { shownUid = c.uid; try { pv.currentTime = target; } catch (e) {} }
      else if (seek || Math.abs(pv.currentTime - target) > 0.35) { try { pv.currentTime = target; } catch (e) {} }
      pv.volume = Math.min(1, S.videoVolume);
      pv.muted = S.videoVolume === 0;
      if (playing && pv.paused) pv.play().catch(function () {});
      if (!playing && !pv.paused) pv.pause();
    }
    if (c.kind === 'image') shownUid = null;
    syncMusic(seek);
    drawTexts();
    $('scrub').value = t; $('clock').textContent = fmt(t);
  }

  // Ovoz bo'laklari ketma-ket: videodagi t vaqtga ovoz faylining qaysi soniyasi to'g'ri keladi
  function voiceLen() { return S.music ? S.music.segs.reduce(function (a, g) { return a + (g.e - g.s); }, 0) : 0; }
  function voiceSrcAt(gt) {
    var acc = 0;
    for (var k = 0; k < S.music.segs.length; k++) {
      var g = S.music.segs[k], len = g.e - g.s;
      if (gt < acc + len) return g.s + (gt - acc);
      acc += len;
    }
    return null;
  }

  function syncMusic(seek) {
    if (!S.music || !S.music.url) { pa.pause(); return; }
    var target = voiceSrcAt(t);
    if (target === null) { if (!pa.paused) pa.pause(); return; }
    if (pa.getAttribute('src') !== S.music.url) pa.src = S.music.url;
    pa.volume = Math.min(1, S.music.volume);
    if (seek || Math.abs(pa.currentTime - target) > 0.4) { try { pa.currentTime = target; } catch (e) {} }
    if (playing && pa.paused) pa.play().catch(function () {});
    if (!playing && !pa.paused) pa.pause();
  }

  function tick(now) {
    if (!playing) return;
    var dt = lastTick ? (now - lastTick) / 1000 : 0; lastTick = now;
    var loc = locate(t), c = loc && S.clips[loc.i];
    if (c && c.kind === 'video' && !pv.paused && shownUid === c.uid) {
      t = clipStartAt(loc.i) + Math.max(0, pv.currentTime - c.start);       // video soatiga ergashamiz
      if (pv.currentTime >= c.end - 0.04) t = clipStartAt(loc.i) + clipDur(c) + 0.001;
    } else t += dt;
    if (t >= total()) { t = 0; playing = false; $('play').textContent = '▶'; showFrame(true); return; }
    showFrame(false);
    requestAnimationFrame(tick);
  }

  function seekTo(v) { t = Math.max(0, Math.min(v, total())); showFrame(true); }

  function refresh(keepTime) {
    var T = total();
    $('scrub').max = T.toFixed(2);
    $('total-time').textContent = fmt(T) + (T > 90 ? ' ⚠️ 90 s dan uzun' : '');
    if (!keepTime && t > T) t = 0;
    S.texts.forEach(function (x) { if (x.end > T) x.end = T; if (x.start > T) x.start = 0; });
    musicLen();
    showFrame(true);
  }

  // ---------- yozuvlar ----------
  function fontFamily(key) { var f = FONTS.filter(function (x) { return x[0] === key; })[0]; return '"' + (f ? f[1] : 'Montserrat') + '", sans-serif'; }
  function hexA(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }

  function styleText(d, x, w) {
    var fs = x.size * w;
    d.style.left = (x.x * 100) + '%'; d.style.top = (x.y * 100) + '%';
    d.style.fontFamily = fontFamily(x.font); d.style.fontSize = fs + 'px';
    d.style.fontWeight = x.bold ? '700' : '400'; d.style.color = x.color;
    d.style.textShadow = x.shadow ? (fs * 0.05) + 'px ' + (fs * 0.05) + 'px 0 rgba(0,0,0,.66)' : 'none';
    d.style.webkitTextStroke = x.outline ? Math.max(1, fs / 22) + 'px #000' : '0';
    d.style.paintOrder = 'stroke fill';
    if (x.bg === 'box') { d.style.background = hexA(x.bg_color, 0.85); d.style.padding = (fs * 0.21) + 'px ' + (fs * 0.35) + 'px'; d.style.borderRadius = (fs * 0.35) + 'px'; }
    else { d.style.background = 'transparent'; d.style.padding = '0'; }
  }

  function drawTexts() {
    layer.textContent = '';
    var w = stage.clientWidth;
    S.texts.forEach(function (x) {
      var visible = (t >= x.start && t <= x.end) || editing === x;
      if (!visible) return;
      var d = el('div', 'tx' + (editing === x ? ' sel' : ''), x.text);
      styleText(d, x, w);
      d.addEventListener('pointerdown', function (e) { startDrag(e, x, d); });
      layer.appendChild(d);
    });
  }

  function startDrag(e, x, d) {
    e.preventDefault();
    var rect = stage.getBoundingClientRect(), moved = false, sx = e.clientX, sy = e.clientY;
    d.setPointerCapture(e.pointerId);
    function move(ev) {
      if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 4) moved = true;
      x.x = Math.min(1, Math.max(0, (ev.clientX - rect.left) / rect.width));
      x.y = Math.min(1, Math.max(0, (ev.clientY - rect.top) / rect.height));
      d.style.left = (x.x * 100) + '%'; d.style.top = (x.y * 100) + '%';
    }
    function up() { d.removeEventListener('pointermove', move); d.removeEventListener('pointerup', up); if (!moved) openSheet(x); else renderTextList(); }
    d.addEventListener('pointermove', move); d.addEventListener('pointerup', up);
  }

  function newText(over) {
    var T = total();
    return Object.assign({ uid: uidSeq++, text: '', font: 'montserrat', size: 0.06, color: '#ffffff', bg: 'none', bg_color: '#000000',
      bold: true, shadow: true, outline: false, anim: true, x: 0.5, y: 0.45, start: Math.min(t, Math.max(0, T - 0.5)), end: T }, over || {});
  }

  function renderTextList() {
    var box = $('texts'); box.textContent = '';
    if (!S.texts.length) { box.appendChild(el('p', 'hint', 'Hali yozuv yo\'q.')); return; }
    S.texts.forEach(function (x) {
      var card = el('div', 'card text-item');
      var s = el('span', 't', x.text || '(bo\'sh)'); s.style.fontFamily = fontFamily(x.font); s.style.color = x.color;
      card.appendChild(s);
      card.appendChild(el('span', 'muted', fmt(x.start) + '–' + fmt(x.end)));
      var b = el('button', 'icon', '✏️'); b.addEventListener('click', function () { openSheet(x); });
      card.appendChild(b);
      box.appendChild(card);
    });
  }

  function buildSheet() {
    EMOJIS.forEach(function (em) {
      var b = el('button', null, em);
      b.addEventListener('click', function () { var ta = $('t-text'); var p = ta.selectionStart || ta.value.length; ta.value = ta.value.slice(0, p) + em + ta.value.slice(p); ta.dispatchEvent(new Event('input')); ta.focus(); });
      $('t-emojis').appendChild(b);
    });
    FONTS.forEach(function (f) {
      var b = el('button', null, f[1].split(' ')[0]); b.style.fontFamily = '"' + f[1] + '"'; b.setAttribute('data-font', f[0]);
      b.addEventListener('click', function () { if (!editing) return; editing.font = f[0]; markActive('t-fonts', 'data-font', f[0]); drawTexts(); });
      $('t-fonts').appendChild(b);
    });
    function swatches(boxId, key) {
      COLORS.forEach(function (c) {
        var b = el('button'); b.style.background = c; b.setAttribute('data-color', c); b.setAttribute('aria-label', c);
        b.addEventListener('click', function () { if (!editing) return; editing[key] = c; if (key === 'bg_color') { editing.bg = 'box'; $('t-bg').checked = true; } markActive(boxId, 'data-color', c); drawTexts(); });
        $(boxId).appendChild(b);
      });
      var pick = el('input'); pick.type = 'color'; pick.value = '#ffffff';
      pick.addEventListener('input', function () { if (!editing) return; editing[key] = pick.value; if (key === 'bg_color') { editing.bg = 'box'; $('t-bg').checked = true; } drawTexts(); });
      $(boxId).appendChild(pick);
    }
    swatches('t-colors', 'color');
    swatches('t-bg-colors', 'bg_color');
    $('t-text').addEventListener('input', function () { if (editing) { editing.text = $('t-text').value; drawTexts(); } });
    $('t-size').addEventListener('input', function () { if (editing) { editing.size = parseFloat($('t-size').value) / 100; drawTexts(); } });
    ['bold', 'shadow', 'outline'].forEach(function (k) { $('t-' + k).addEventListener('change', function () { if (editing) { editing[k] = $('t-' + k).checked; drawTexts(); } }); });
    $('t-bg').addEventListener('change', function () { if (editing) { editing.bg = $('t-bg').checked ? 'box' : 'none'; drawTexts(); } });
    $('t-anim').addEventListener('change', function () { if (editing) editing.anim = $('t-anim').checked; });
    function timeInput() {
      if (!editing) return;
      var a = parseFloat($('t-start').value), b = parseFloat($('t-end').value);
      if (b < a) { var tmp = a; a = b; b = tmp; }
      editing.start = a; editing.end = Math.max(b, a + 0.2);
      $('t-time-v').textContent = fmt(editing.start) + ' – ' + fmt(editing.end);
      seekTo(editing.start);
    }
    $('t-start').addEventListener('input', timeInput);
    $('t-end').addEventListener('input', timeInput);
    $('t-save').addEventListener('click', closeSheet);
    $('sheet-close').addEventListener('click', closeSheet);
    $('t-delete').addEventListener('click', function () { S.texts = S.texts.filter(function (x) { return x !== editing; }); editing = null; closeSheet(); });
  }

  function markActive(boxId, attr, val) { Array.prototype.forEach.call($(boxId).children, function (b) { b.classList.toggle('active', b.getAttribute(attr) === val); }); }

  function openSheet(x) {
    editing = x; pause();
    $('t-text').value = x.text; $('t-size').value = x.size * 100;
    $('t-bold').checked = x.bold; $('t-shadow').checked = x.shadow; $('t-outline').checked = x.outline; $('t-bg').checked = x.bg === 'box';
    $('t-anim').checked = x.anim !== false;
    markActive('t-fonts', 'data-font', x.font); markActive('t-colors', 'data-color', x.color); markActive('t-bg-colors', 'data-color', x.bg_color);
    var T = total() || 1;
    ['t-start', 't-end'].forEach(function (id) { $(id).max = T.toFixed(1); });
    $('t-start').value = x.start; $('t-end').value = x.end;
    $('t-time-v').textContent = fmt(x.start) + ' – ' + fmt(x.end);
    $('sheet').classList.remove('hidden');
    drawTexts();
  }
  function closeSheet() {
    if (editing && !editing.text.trim()) S.texts = S.texts.filter(function (x) { return x !== editing; });
    editing = null; $('sheet').classList.add('hidden'); drawTexts(); renderTextList();
  }

  // ---------- musiqa ----------
  function setMusic(meta, url, name) {
    S.music = { id: meta.id, url: url, name: name, duration: meta.duration, segs: [{ s: 0, e: meta.duration }], volume: 1 };
    $('music-box').classList.remove('hidden'); $('music-name').textContent = '🎙 ' + name;
    renderSegs();
    $('music-vol').value = 100; $('music-vol-v').textContent = '100%';
    // Qo'yilgan ovoz asosiy bo'ladi: videoning o'z ovozi o'chiriladi (surgich bilan qaytarish mumkin)
    S.videoVolume = 0; $('video-vol').value = 0; $('video-vol-v').textContent = '0%';
    showFrame(true);
  }

  function musicLen() {
    if (!S.music) return;
    $('music-len').textContent = 'Ovoz uzunligi: ' + fmt(voiceLen()) + ' · video: ' + fmt(total()) + (voiceLen() < total() - 0.5 ? ' (oxirida ovozsiz qoladi)' : '');
  }
  function renderSegs() {
    var box = $('music-segs'); box.textContent = '';
    if (!S.music) return;
    var D = S.music.duration || 0, segs = S.music.segs;
    musicLen();
    segs.forEach(function (g, k) {
      var card = el('div', 'card seg-card');
      var head = el('div', 'card-head');
      var title = el('b', null, (k + 1) + '-bo\'lak · ' + fmt(g.s) + '–' + fmt(g.e));
      head.appendChild(title);
      if (segs.length > 1) {
        var del = el('button', 'icon', '🗑'); del.setAttribute('aria-label', 'Bo\'lakni o\'chirish');
        del.addEventListener('click', function () { segs.splice(k, 1); renderSegs(); syncMusic(true); saveDraft(); });
        head.appendChild(del);
      }
      card.appendChild(head);
      var upd = function () { title.textContent = (k + 1) + '-bo\'lak · ' + fmt(g.s) + '–' + fmt(g.e); musicLen(); };
      card.appendChild(rangeRow('Boshi', 0, D, 0.1, g.s, function (v, sp) { g.s = Math.min(v, g.e - 0.2); sp.textContent = fmt(g.s); upd(); syncMusic(true); }));
      card.appendChild(rangeRow('Oxiri', 0, D, 0.1, g.e, function (v, sp) { g.e = Math.max(v, g.s + 0.2); sp.textContent = fmt(g.e); upd(); syncMusic(true); }));
      box.appendChild(card);
    });
  }

  function splitVoice() {
    if (!S.music) return;
    var acc = 0, segs = S.music.segs;
    for (var k = 0; k < segs.length; k++) {
      var g = segs[k], len = g.e - g.s;
      if (t < acc + len) {
        var cut = g.s + (t - acc);
        if (cut - g.s < 0.2 || g.e - cut < 0.2) { toast('Kesish joyi bo\'lak chetiga juda yaqin'); return; }
        if (segs.length >= 20) { toast('Ko\'pi bilan 20 ta bo\'lak'); return; }
        segs.splice(k + 1, 0, { s: cut, e: g.e }); g.e = cut;
        pause(); renderSegs(); saveDraft(); haptic();
        toast('✂️ Ovoz ' + (k + 1) + ' va ' + (k + 2) + '-bo\'lakka bo\'lindi. Keraksizini 🗑 bilan o\'chiring');
        return;
      }
      acc += len;
    }
    toast('Bu joyda ovoz yo\'q. Ko\'rish oynasida ovoz eshitiladigan joyni tanlang');
  }

  function bindMusic() {
    $('add-music').addEventListener('change', function () {
      var f = this.files[0]; this.value = ''; if (!f) return;
      toast('🎙 Ovoz yuklanmoqda...');
      upload(f, function () {}).then(function (meta) { setMusic(meta, URL.createObjectURL(f), f.name); toast('✅ Ovoz qo\'shildi, videoning o\'z ovozi o\'chirildi'); }).catch(function (e) { toast(e.message); });
    });
    $('add-music-video').addEventListener('change', function () {
      var f = this.files[0]; this.value = ''; if (!f) return;
      toast('🎞 Video yuklanmoqda, ovozi ajratiladi...');
      upload(f, function () {}).then(function (meta) {
        return api('/api/studio/extract-audio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: meta.id }) });
      }).then(function (d) { setMusic(d.file, URL.createObjectURL(f), 'Videodan: ' + f.name); toast('✅ Boshqa videoning ovozi qo\'shildi'); }).catch(function (e) { toast(e.message); });
    });
    $('music-split').addEventListener('click', splitVoice);
    $('music-reset').addEventListener('click', function () { if (!S.music) return; S.music.segs = [{ s: 0, e: S.music.duration }]; renderSegs(); syncMusic(true); saveDraft(); });
    $('music-vol').addEventListener('input', function () { if (!S.music) return; S.music.volume = this.value / 100; $('music-vol-v').textContent = this.value + '%'; syncMusic(false); });
    $('video-vol').addEventListener('input', function () { S.videoVolume = this.value / 100; $('video-vol-v').textContent = this.value + '%'; showFrame(false); });
    $('music-del').addEventListener('click', function () {
      S.music = null; pa.pause(); $('music-box').classList.add('hidden');
      S.videoVolume = 1; $('video-vol').value = 100; $('video-vol-v').textContent = '100%'; showFrame(false);
    });
  }

  // ---------- tayyorlash ----------
  function project() {
    return {
      clips: S.clips.map(function (c) { return c.kind === 'image' ? { id: c.id, duration: c.imgDur, filter: c.filter } : { id: c.id, start: c.start, end: c.end, filter: c.filter }; }),
      transition: { type: S.transition, duration: S.tdur },
      texts: S.texts.filter(function (x) { return x.text.trim(); }).map(function (x) {
        return { text: x.text, font: x.font, size: x.size, color: x.color, bg: x.bg, bg_color: x.bg_color, bg_opacity: 0.85,
          bold: x.bold, shadow: x.shadow, outline: x.outline, anim: x.anim === false ? 'none' : 'fade', x: x.x, y: x.y, start: x.start, end: x.end };
      }),
      music: S.music ? { id: S.music.id, volume: S.music.volume, segments: S.music.segs.map(function (g) { return { start: g.s, end: g.e }; }) } : null,
      video_volume: S.videoVolume, fit: S.fit, frame: S.frame
    };
  }

  function status(msg, cls) { var s = $('render-status'); s.textContent = msg; s.className = 'status ' + (cls || ''); }

  function doRender() {
    if (!S.clips.length) { toast('Avval video yoki rasm qo\'shing'); return; }
    if (S.clips.some(function (c) { return !c.id; })) { toast('Fayllar hali yuklanmoqda, biroz kuting'); return; }
    if (total() > 90) { toast('Video 90 soniyadan oshmasin'); return; }
    pause();
    var btn = $('render'); btn.disabled = true;
    status('⏳ Video tayyorlanmoqda... (odatda 30 soniya – 2 daqiqa)');
    api('/api/studio/render', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project: project(), caption: $('caption').value }) })
      .then(function (d) { return poll(d.job, 0); })
      .then(function () {
        status('✅ Tayyor! Video @MaxiMarket_albot chatiga yuborildi. U yerda 🚀 Joylash tugmasini bosing.', 'ok');
        try { tg.HapticFeedback.notificationOccurred('success'); } catch (e) {}
        btn.disabled = false;
        if (tg && tg.showConfirm) tg.showConfirm('Video botga yuborildi. Botga qaytasizmi?', function (ok) { if (ok) tg.close(); });
      })
      .catch(function (e) { status('❌ ' + e.message, 'err'); btn.disabled = false; });
  }

  function poll(job, n) {
    return new Promise(function (r) { setTimeout(r, n < 5 ? 2000 : 3000); }).then(function () {
      return api('/api/studio/job/' + encodeURIComponent(job));
    }).then(function (d) {
      if (d.status === 'done') return true;
      if (d.status === 'error') throw new Error(d.error || 'Video yig\'ilmadi');
      if (n > 200) throw new Error('Juda uzoq davom etdi, keyinroq urinib ko\'ring');
      return poll(job, n + 1);
    });
  }

  function pause() { playing = false; $('play').textContent = '▶'; pv.pause(); pa.pause(); }

  // ---------- qoralama (24 soat, fayllar serverda) ----------
  var lastSaved = '';
  function saveDraft() {
    try {
      var d = { v: 1, t: Date.now(), clips: S.clips.filter(function (c) { return c.id; }).map(function (c) {
        return { id: c.id, kind: c.kind, start: c.start, end: c.end, imgDur: c.imgDur, filter: c.filter, duration: c.duration }; }),
        texts: S.texts, music: S.music ? { id: S.music.id, name: S.music.name, duration: S.music.duration, segs: S.music.segs, volume: S.music.volume } : null,
        videoVolume: S.videoVolume, fit: S.fit, transition: S.transition, tdur: S.tdur, frame: S.frame, caption: $('caption').value };
      var js = JSON.stringify(d);
      if (js !== lastSaved) { localStorage.setItem(DRAFT_KEY, js); lastSaved = js; }
    } catch (e) {}
  }
  function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} lastSaved = ''; }
  function restoreDraft() {
    var d; try { d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch (e) { d = null; }
    if (!d || !d.clips || !d.clips.length || Date.now() - d.t > 23 * 3600 * 1000) return;
    var ask = function (cb) { if (tg && tg.showConfirm) tg.showConfirm('Oldingi loyihani davom ettirasizmi?', cb); else cb(confirm('Oldingi loyihani davom ettirasizmi?')); };
    ask(function (ok) {
      if (!ok) { clearDraft(); return; }
      api('/api/studio/files').then(function (r) {
        var urls = {}; r.files.forEach(function (f) { urls[f.id] = API + f.url; });
        var lost = 0;
        S.clips = d.clips.filter(function (c) { if (urls[c.id]) return true; lost++; return false; }).map(function (c) {
          return Object.assign({ uid: uidSeq++, url: urls[c.id], serverUrl: urls[c.id], progress: 1, error: null }, c); });
        S.texts = (d.texts || []).map(function (x) { return Object.assign({}, x, { uid: uidSeq++ }); });
        if (d.music && urls[d.music.id]) { setMusic({ id: d.music.id, duration: d.music.duration }, urls[d.music.id], d.music.name); S.music.segs = d.music.segs && d.music.segs.length ? d.music.segs : [{ s: d.music.offset || 0, e: d.music.duration }]; S.music.volume = d.music.volume; renderSegs(); $('music-vol').value = Math.round(d.music.volume * 100); }
        S.videoVolume = d.videoVolume || 1; S.fit = d.fit || 'cover'; S.transition = d.transition || 'none'; S.tdur = d.tdur || 0.5;
        $('caption').value = d.caption || '';
        setFrame(FRAMES.indexOf(d.frame) >= 0 ? d.frame : 'none');
        stage.classList.toggle('contain', S.fit === 'contain');
        document.querySelectorAll('.seg button').forEach(function (x) { x.classList.toggle('active', x.getAttribute('data-fit') === S.fit); });
        renderTransitions(); renderClips(); renderTextList(); refresh();
        toast(lost ? ('Loyiha tiklandi, ' + lost + ' ta fayl muddati o\'tgan') : '✅ Loyiha tiklandi');
      }).catch(function (e) { toast(e.message); });
    });
  }

  // ---------- hoshiya ----------
  function setFrame(id) {
    S.frame = id;
    var img = $('pfr');
    if (id === 'none') { img.classList.add('hidden'); img.removeAttribute('src'); }
    else { img.src = 'frames/' + id + '.png'; img.classList.remove('hidden'); }
    document.querySelectorAll('#frames button').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-frame') === id); });
  }
  function renderFrames() {
    var box = $('frames'); box.textContent = '';
    ['none'].concat(FRAMES).forEach(function (id) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('data-frame', id);
      b.setAttribute('aria-label', id === 'none' ? 'Hoshiyasiz' : 'Hoshiya ' + id.slice(1));
      if (id === 'none') b.textContent = 'Yo\'q';
      else { var im = document.createElement('img'); im.src = 'frames/' + id + '.png'; im.alt = ''; im.loading = 'lazy'; b.appendChild(im); }
      b.addEventListener('click', function () { setFrame(id); haptic(); saveDraft(); });
      box.appendChild(b);
    });
    setFrame(S.frame);
  }

  // ---------- sahifalar (Telegram ichidagi brauzerda) ----------
  function loadLinks() {
    var names = { instagram: '📸 Instagram', tiktok: '🎵 TikTok', youtube: '▶️ YouTube' };
    api('/api/studio/config').then(function (d) {
      var box = $('social-links'); box.textContent = '';
      Object.keys(names).forEach(function (k) {
        var url = d.links && d.links[k]; if (!url || url.indexOf('https://') !== 0) return;
        var b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = names[k];
        b.addEventListener('click', function () { if (tg && tg.openLink) tg.openLink(url); else window.open(url, '_blank', 'noopener'); });
        box.appendChild(b);
      });
      if (box.children.length) $('social').classList.remove('hidden');
    }).catch(function () {});
  }

  function renderTransitions() {
    var box = $('transitions'); box.textContent = '';
    TRANSITIONS.forEach(function (tr) {
      var b = el('button', S.transition === tr[0] ? 'active' : '', tr[1]);
      b.addEventListener('click', function () { S.transition = tr[0]; renderTransitions(); refresh(); saveDraft(); });
      box.appendChild(b);
    });
    $('tdur').value = S.tdur; $('tdur-v').textContent = S.tdur.toFixed(1) + ' s';
  }

  function addPreset(over) {
    if (!S.clips.length) { toast('Avval klip qo\'shing'); return null; }
    var x = newText(Object.assign({ start: 0 }, over));
    S.texts.push(x); renderTextList(); drawTexts(); saveDraft();
    return x;
  }

  function buildExtras() {
    STICKERS.forEach(function (em) {
      var b = el('button', null, em);
      b.addEventListener('click', function () {
        if (addPreset({ text: em, size: 0.14, shadow: false, bold: false, x: 0.75, y: 0.35 })) { $('stickers').classList.add('hidden'); toast('Stikerni barmoq bilan joyiga suring'); }
      });
      $('stickers').appendChild(b);
    });
    $('open-stickers').addEventListener('click', function () { $('stickers').classList.toggle('hidden'); });
    TEMPLATES.forEach(function (tp) {
      var b = el('button', null, tp[0]);
      b.addEventListener('click', function () { if (addPreset(tp[1])) toast(tp[0] + ' qo\'shildi'); });
      $('templates').appendChild(b);
    });
    $('auto-subs').addEventListener('click', function () {
      if (!S.clips.length || S.clips.some(function (c) { return !c.id; })) { toast('Avval kliplar yuklanib bo\'lsin'); return; }
      var btn = this; btn.disabled = true; toast('📝 Gap matnga aylantirilmoqda (bir necha soniya – 1 daqiqa)...');
      api('/api/studio/subtitles', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clips: project().clips, tdur: tdur() }) })
        .then(function (d) {
          btn.disabled = false;
          if (!d.subtitles.length) { toast('Videoda gap topilmadi'); return; }
          d.subtitles.forEach(function (sb) {
            S.texts.push(newText({ text: sb.text, start: sb.start, end: sb.end, font: 'montserrat', size: 0.045, bold: true,
              outline: true, shadow: false, bg: 'box', bg_color: '#000000', anim: false, x: 0.5, y: 0.74 }));
          });
          renderTextList(); drawTexts(); saveDraft(); toast('✅ ' + d.subtitles.length + ' ta subtitr qo\'shildi, tahrirlash mumkin');
        }).catch(function (e) { btn.disabled = false; toast(e.message); });
    });
    $('tdur').addEventListener('input', function () { S.tdur = parseFloat(this.value); $('tdur-v').textContent = S.tdur.toFixed(1) + ' s'; refresh(); saveDraft(); });
    $('new-project').addEventListener('click', function () {
      var go = function (ok) { if (!ok) return; clearDraft(); S.clips = []; S.texts = []; S.music = null; pa.pause(); $('music-box').classList.add('hidden'); $('caption').value = ''; renderClips(); renderTextList(); refresh(); };
      if (tg && tg.showConfirm) tg.showConfirm('Yangi loyiha boshlansinmi? Hozirgisi o\'chadi.', go); else go(confirm('Yangi loyiha?'));
    });
    setInterval(saveDraft, 3000);
  }

  // ---------- ishga tushirish ----------
  function init() {
    if (tg) { try { tg.ready(); tg.expand(); tg.setHeaderColor('#0f1115'); tg.setBackgroundColor('#0f1115'); } catch (e) {} }
    if (!INIT) { $('gate').classList.remove('hidden'); return; }
    $('app').classList.remove('hidden');
    pv = $('pv'); pi = $('pi'); pa = $('pa'); layer = $('layer'); stage = $('stage');
    buildSheet(); bindMusic(); buildExtras(); renderTransitions(); renderTextList(); renderFrames(); loadLinks();
    $('add-media').addEventListener('change', function () { addFiles(this.files); this.value = ''; });
    $('split').addEventListener('click', splitHere);
    $('play').addEventListener('click', function () {
      if (!S.clips.length) return;
      playing = !playing; this.textContent = playing ? '⏸' : '▶';
      if (playing) { if (t >= total() - 0.05) t = 0; lastTick = 0; showFrame(true); requestAnimationFrame(tick); } else pause();
    });
    $('scrub').addEventListener('input', function () { pause(); seekTo(parseFloat(this.value)); });
    document.querySelectorAll('.tabs button').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.tabs button').forEach(function (x) { x.classList.toggle('active', x === b); });
        document.querySelectorAll('.tab').forEach(function (s) { s.classList.toggle('hidden', s.id !== 'tab-' + b.getAttribute('data-tab')); });
        haptic();
      });
    });
    document.querySelectorAll('.seg button').forEach(function (b) {
      b.addEventListener('click', function () {
        S.fit = b.getAttribute('data-fit');
        document.querySelectorAll('.seg button').forEach(function (x) { x.classList.toggle('active', x === b); });
        stage.classList.toggle('contain', S.fit === 'contain');
      });
    });
    $('add-text').addEventListener('click', function () { if (!S.clips.length) { toast('Avval klip qo\'shing'); return; } var x = newText({ text: 'Yozuv' }); S.texts.push(x); openSheet(x); });
    $('add-brand').addEventListener('click', function () {
      if (!S.clips.length) { toast('Avval klip qo\'shing'); return; }
      S.texts.push(newText({ text: 'MaxiMarket', font: 'rubik', size: 0.05, bg: 'box', bg_color: '#1e88e5', shadow: false, x: 0.28, y: 0.06, start: 0 }));
      renderTextList(); drawTexts(); toast('🏷 Belgi qo\'shildi');
    });
    $('add-price').addEventListener('click', function () {
      if (!S.clips.length) { toast('Avval klip qo\'shing'); return; }
      var v = $('price-input').value.trim(); if (!v) { toast('Narxni yozing'); return; }
      if (!/so'?m/i.test(v)) v += ' so\'m';
      S.texts.push(newText({ text: v, font: 'bebas', size: 0.09, bg: 'box', bg_color: '#e53935', shadow: false, x: 0.5, y: 0.82, start: 0 }));
      renderTextList(); drawTexts(); toast('💰 Narx qo\'shildi');
    });
    $('render').addEventListener('click', doRender);
    window.addEventListener('resize', drawTexts);
    refresh();
    restoreDraft();
  }
  init();
})();
