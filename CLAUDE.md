# MaxiMarket: loyiha qo'llanmasi (Claude uchun)

Egasi bilan **o'zbek tilida** gaplash. Bu repo: sayt maxi-market.uz (GitHub Pages, `main`).
Backend/bot alohida repoda: `Qosimjonuz/MaxiMarketBot` (Railway, MongoDB Atlas).

## Kontekstni tez olish (token tejash)
Loyiha haqida batafsil bilim Keragli xotirasida ("Internet magazin" ish maydoni). Fayllarni o'qishdan oldin shuni chaqir:

`recall(query="<mavzu>", repository_id="Qosimjonuz/maximarket-webapp", profile="audit", k=2, render="compact", include_turns=true, token_budget=1500)`
(`repository_id` shart: Keragli ish maydonida 2 ta repo bor. `remember` ga ham shuni ber.)

Mavzu kalit so'zlari: BOSHLASH, ARXITEKTURA, API ENDPOINTLAR, MONGODB SXEMASI, SAYT TUZILMASI, ISH TARTIBI, FOYDALANUVCHI QOIDALARI, VOQEALAR JURNALI, SIRLAR QAYERDA, GOOGLE PLAY HOLATI, TEZKOR ID.
Yangi muhim bilim paydo bo'lsa, `remember` bilan bitta aniq gap qilib saqla (parolsiz).

## Qoidalar
- Parol, kalit, token, tiklash kodlarini chatga, kodga, fayllarga yozma. Faqat ular qayerda turganini ayt.
- `products` va `users` (bot obunachilari) hech qachon o'chirilmasin. Qaytarib bo'lmaydigan amallardan oldin egasidan tasdiq ol.
- Mijoz ma'lumoti faqat buyurtmadagi ism va telefon, bazada shifrlangan (`DATA_ENC_KEY`). Kalitni almashtirma.
- **PR (egasi ruxsati, 2026-10-15):** kerak bo'lsa so'ramasdan PR och va ishni tez bitir. Merge: hujjat, `CLAUDE.md` va ikkinchi miya o'zgarishlarini so'ramasdan merge qil. Ishlab chiqarish kodi (sayt, backend) o'zgarishini faqat testlar va xavfsizlik tekshiruvidan o'tsa, kichik bo'lsa va sir, ma'lumot o'chirish, to'lov, ruxsat sozlamasiga tegmasa merge qil, natijani darrov ayt. Boshqa hollarda (ma'lumot o'chirish, pul sarflash, kalit/parol o'zgarishi, reponi ochiq qilish) avval so'ra. PR merge bo'lgach filialni `main`dan qayta boshla.
- Sandbox'dan maxi-market.uz va railway.app ochilmaydi. Holatni Railway loglari va GitHub orqali tekshir.

## Tuzilma
`index.html`, `app.js`, `style.css`: sayt. `lock.js`: ilova PIN qulfi. `sw.js`: service worker. `Maxikomadmin.html` + `admin-app.js`: admin panel. `privacy.html`: maxfiylik siyosati. `.well-known/assetlinks.json`: Android ilova domen tasdig'i.

## Har qanday o'zgarishda (doim)
**Zamonaviy xavfsizlik:** sir va shaxsiy ma'lumot yo'q; eng kam huquq; kirishni tekshirish (validatsiya, parametrli so'rovlar, XSS/CORS); qaramliklar yangi va xavfsiz versiyada; HTTPS, HSTS, qat'iy CSP; shaxsiy ma'lumotni minimallashtirish va shifrlash; logda shaxsiy ma'lumot yo'q; tashqi skript (piksel va boshqalar) faqat zarur bo'lsa; so'rovlar chegarasi.
**Zamonaviy tezkor ishlash:** bloklamaydigan (async) kod va bazada indekslar; kichik javoblar, sahifalash, siqish; keshlash (shaxsiy ma'lumotsiz); rasm va skriptni kechiktirib yuklash; Core Web Vitals (LCP, INP, CLS); kam tashqi so'rov; o'zgarishdan oldin va keyin o'lchash.

## Ikkinchi miya
Har o'zgarishdan keyin ikkinchi miya repo'sida (private, `Qosimjonuz/Ikkinchi-miyya-`) `BOSH.md` jurnaliga qator yoz, commit va push qil, Keragli'ga qisqa eslatma saqla. Ishlatilmagan bo'limlar `03-Arxiv/` ga o'tadi, hech narsa o'chirilmaydi.
