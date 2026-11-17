# MaxiMarket sayti (Claude uchun)

Egasi bilan **o'zbek tilida** gaplash. Bu repo OCHIQ (public): sayt maxi-market.uz (GitHub Pages, `main`).
Bu yerga ichki ma'lumot yozilmaydi: sir, ichki repo va vosita tafsilotlari, infratuzilma sozlamalari, shaxsiy ma'lumot.
To'liq ichki qo'llanma backend reposining `CLAUDE.md` faylida (private). Ishni boshlashdan oldin o'shani o'qi.

## Qoidalar
- Parol, kalit, token, tiklash kodlarini chatga, kodga, fayllarga yozma. Bu repo ochiq: hamma narsa internetda ko'rinadi.
- Qaytarib bo'lmaydigan amallardan oldin egasidan tasdiq ol.
- PR: kerak bo'lsa so'ramasdan och. Hujjat o'zgarishini merge qil. Sayt kodi o'zgarishini faqat testlar va xavfsizlik
  tekshiruvidan o'tsa, kichik bo'lsa va sir yoki ruxsat sozlamasiga tegmasa merge qil. PR merge bo'lgach filialni `main`dan qayta boshla.

## Tuzilma
`index.html`, `app.js`, `style.css`: sayt. `product/`: mahsulot sahifasi. `lock.js`: ilova PIN qulfi. `sw.js`: service worker.
`Maxikomadmin.html` + `admin-app.js`: admin panel. `privacy.html`: maxfiylik siyosati. `.well-known/assetlinks.json`: Android ilova domen tasdig'i.

## Har qanday o'zgarishda
**Xavfsizlik:** sir va shaxsiy ma'lumot yo'q; kirishni tekshirish (XSS: `innerHTML` ga faqat `escapeHtml` qilingan matn); qat'iy CSP
(inline skript yo'q); tashqi skript faqat zarur bo'lsa; admin panel boshqa sayt ramkasida ochilmaydi.
**Tezkor ishlash:** rasm va skriptni kechiktirib yuklash; Core Web Vitals (LCP, INP, CLS); kam tashqi so'rov.
