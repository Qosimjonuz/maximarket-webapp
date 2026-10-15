# MaxiMarket: loyiha qo'llanmasi (Claude uchun)

Egasi bilan **o'zbek tilida** gaplash. Bu repo: sayt maxi-market.uz (GitHub Pages, `main`).
Backend/bot alohida repoda: `Qosimjonuz/MaxiMarketBot` (Railway, MongoDB Atlas).

## Kontekstni tez olish (token tejash)
Loyiha haqida batafsil bilim Keragli xotirasida ("Internet magazin" ish maydoni). Fayllarni o'qishdan oldin shuni chaqir:

`recall(query="<mavzu>", profile="audit", k=2, render="compact", include_turns=true, token_budget=1500)`

Mavzu kalit so'zlari: BOSHLASH, ARXITEKTURA, API ENDPOINTLAR, MONGODB SXEMASI, SAYT TUZILMASI, ISH TARTIBI, FOYDALANUVCHI QOIDALARI, VOQEALAR JURNALI, SIRLAR QAYERDA, GOOGLE PLAY HOLATI, TEZKOR ID.
Yangi muhim bilim paydo bo'lsa, `remember` bilan bitta aniq gap qilib saqla (parolsiz).

## Qoidalar
- Parol, kalit, token, tiklash kodlarini chatga, kodga, fayllarga yozma. Faqat ular qayerda turganini ayt.
- `products` va `users` (bot obunachilari) hech qachon o'chirilmasin. Qaytarib bo'lmaydigan amallardan oldin egasidan tasdiq ol.
- Mijoz ma'lumoti faqat buyurtmadagi ism va telefon, bazada shifrlangan (`DATA_ENC_KEY`). Kalitni almashtirma.
- PR ochish va merge qilish faqat egasi so'raganda. PR merge bo'lgach filialni `main`dan qayta boshla.
- Sandbox'dan maxi-market.uz va railway.app ochilmaydi. Holatni Railway loglari va GitHub orqali tekshir.

## Tuzilma
`index.html`, `app.js`, `style.css`: sayt. `lock.js`: ilova PIN qulfi. `sw.js`: service worker. `Maxikomadmin.html` + `admin-app.js`: admin panel. `privacy.html`: maxfiylik siyosati. `.well-known/assetlinks.json`: Android ilova domen tasdig'i.
