// MaxiStudio menyusi: vositalar ro'yxati. Yangi vosita qo'shish uchun TOOLS ga bitta qator yozing.
// href: o'zimizning sahifa (shu oynada ochiladi). url: tashqi sayt (Telegram orqali ochiladi).
(function () {
  'use strict';
  var TOOLS = [
    { icon: '🎬', title: 'Video', accent: 'muharrir', desc: "Klip qirqish, yozuv, hoshiya, ovoz va tayyor videoni joylash", href: '../', tag: 'MaxiStudio', main: true },
    { icon: '🎵', title: 'Videodan ovoz va', accent: 'musiqani ajratish', desc: "Ovoz (gap) va musiqani alohida fayllarga ajratadi", url: 'https://vocalremover.org/', tag: 'vocalremover.org' },
    { icon: '📝', title: 'Audio', accent: 'matnga aylantirish', desc: "Ovozli xabar yoki audioni o'zbekcha matnga o'giradi", url: 'https://voicelab.uz/speech-to-text', tag: 'voicelab.uz' },
    { icon: '✂️', title: 'Audioni', accent: "bo'lish", desc: "Audioni kerakli joyidan qirqadi va bo'laklarga ajratadi", url: 'https://tapecut.app/', tag: 'tapecut.app' }
  ];
  var tg = window.Telegram && window.Telegram.WebApp;
  try { if (tg) { tg.ready(); tg.expand(); } } catch (e) {}

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function open(tool) {
    if (tool.href) { location.href = tool.href; return; }
    var u = tool.url;
    if (tg && tg.openLink) { try { tg.openLink(u); return; } catch (e) {} }
    window.open(u, '_blank', 'noopener');
  }

  var root = document.getElementById('tools');
  TOOLS.forEach(function (tool) {
    var b = el('button', 'tool' + (tool.main ? ' main' : ''));
    b.type = 'button';
    b.dataset.tool = tool.href ? 'editor' : 'ext';
    b.appendChild(el('div', 'ico', tool.icon));
    var txt = el('div', 'txt');
    var ttl = el('div', 'ttl', tool.title + ' ');
    ttl.appendChild(el('b', null, tool.accent));
    txt.appendChild(ttl);
    txt.appendChild(el('div', 'dsc', tool.desc));
    txt.appendChild(el('span', 'tag', tool.url ? '↗ ' + tool.tag : tool.tag));
    b.appendChild(txt);
    b.appendChild(el('div', 'go', '›'));
    b.addEventListener('click', function () { open(tool); });
    root.appendChild(b);
  });
})();
