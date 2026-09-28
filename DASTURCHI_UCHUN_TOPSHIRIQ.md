# MaxiMarket — Dasturchi uchun tuzatish topshirig'i

**Sana:** 2026-09-28
**Loyiha:** maxi-market.uz (sayt: `maximarket-webapp`, backend/bot: `MaxiMarketBot`)
**Audit turi:** Kod xavfsizligi va tezlik tekshiruvi (jonli `main` branch bo'yicha)

> Eslatma: quyidagi qator raqamlari audit paytidagi `main` branch holatiga tegishli.
> Tuzatishdan oldin `git pull` qilib, qatorni qайта tekshiring.

---

## 1. KRITIK — birinchi navbatda (mijoz ma'lumotlari xavf ostida)

### 1.1. IDOR — mijozlar bazasi tashqaridan ochiq
**Fayl:** `MaxiMarketBot/api.py`
**Joy:** `api_register_user` (1307-qator), `api_update_user` (1367-qator) — ikkalasi ham `user_id = sanitize_user_id(data.get("user_id"))` (1313 va 1373-qatorlar)

**Muammo:** Bu ikkala endpoint so'rov tanasidagi `user_id`ga ishonadi va hech qanday
autentifikatsiya talab qilmaydi. Natijada istalgan odam boshqa mijozning Telegram
ID'sini yuborib:
- o'sha mijozning ism va telefon raqamini **o'qiy oladi** (`register_user` mavjud
  foydalanuvchi ma'lumotini qaytaradi),
- o'sha mijozning profilini **o'zgartira oladi** (`update_user`).

CORS ochiq bo'lgani uchun (1.2-band) buni istalgan veb-saytdan avtomat ravishda
qilish mumkin — ya'ni butun mijozlar bazasidagi telefon raqamlar sizib chiqishi mumkin.

**Tuzatish:** `user_id`ni so'rovdan olmaslik kerak. Telegram WebApp `initData`
imzosini serverda HMAC-SHA256 bilan tekshirib, ID'ni faqat imzodan olish kerak:

```python
import hmac, hashlib, json
from urllib.parse import parse_qsl
from config import BOT_TOKEN

def verify_init_data(init_data, max_age_seconds=86400):
    if not init_data or not BOT_TOKEN:
        return None
    pairs = dict(parse_qsl(init_data, strict_parsing=False))
    received_hash = pairs.pop("hash", "")
    if not received_hash:
        return None
    check_string = "\n".join(f"{k}={pairs[k]}" for k in sorted(pairs))
    secret = hmac.new(b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256).digest()
    calc = hmac.new(secret, check_string.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(calc, received_hash):
        return None
    if (time.time() - int(pairs.get("auth_date", 0))) > max_age_seconds:
        return None
    return json.loads(pairs.get("user", "{}"))

def get_verified_user_id(request):
    user = verify_init_data(request.headers.get("X-Telegram-Init-Data", ""))
    return sanitize_user_id(user.get("id")) if user else None
```

`register_user` va `update_user` ichida:
```python
user_id = get_verified_user_id(request)
if not user_id:
    return web.json_response({"error": "Avtorizatsiya kerak"}, status=401)
```

**Sayt tomonida** (`maximarket-webapp/app.js`): `register_user` va `update_user`
`fetch` so'rovlariga sarlavha qo'shish kerak:
```js
headers: {
  'Content-Type': 'application/json',
  'X-Telegram-Init-Data': tg.initData || ''
}
```

> Bu tuzatishning tayyor varianti `claude/ecc-plugin-marketplace-z4hj4l` branchida
> ikkala repoda ham mavjud — uni `main`ga birlashtirish kifoya.

### 1.2. CORS hamma uchun ochiq
**Fayl:** `MaxiMarketBot/api.py`, `cors_middleware`
**Joy:** 311-313-qatorlar

**Muammo:** `Access-Control-Allow-Origin: *` — API'ga dunyodagi har qanday sayt
so'rov yubora oladi. Bu 1.1-band bilan birga eng katta xavfni tug'diradi.

**Tuzatish:** faqat o'z domeniga ruxsat berish:
```python
ALLOWED_ORIGIN = "https://maxi-market.uz"
origin = request.headers.get("Origin", "")
if origin == ALLOWED_ORIGIN:
    response.headers['Access-Control-Allow-Origin'] = ALLOWED_ORIGIN
```
`Access-Control-Allow-Methods` va `Allow-Headers` shundayligicha qoladi.

---

## 2. JIDDIY — tezlik va xarajat

### 2.1. Rasmlar backend orqali uzatiladi (eng katta sekinlik)
**Fayl:** `MaxiMarketBot/api.py`, `api_get_image` (731-qator)

**Muammo:** Har bir rasm so'ralganda bot uni Telegram serveridan yuklab olib,
keyin mijozga uzatadi (Railway → Telegram → Railway → mijoz). Bu sekin, trafik
xarajatini oshiradi va Telegram limitlariga uriladi. `Cache-Control: max-age=86400`
bor, lekin Railway CDN emas.

**Tuzatish (tavsiya):**
- Rasmlarni doimiy obyekt-xotiraga ko'chirish: **Cloudflare R2** yoki **imgbb + CDN**.
  Rasm yuklanganда darhol CDN URL saqlansin, sayt to'g'ridan-to'g'ri CDN'dan olsin.
- Yoki hech bo'lmasa domen oldiga Cloudflare qo'yib (2.2), bu endpoint javobini
  keshlash.

### 2.2. Domen oldida CDN / himoya qatlami yo'q
**Joy:** infratuzilma (kod emas)

**Muammo:** Sayt to'g'ridan-to'g'ri GitHub Pages'dan, API to'g'ridan-to'g'ri
Railway'dan xizmat qiladi. Global kesh, DDoS himoya, WAF yo'q.

**Tuzatish:** domenni **Cloudflare** (bepul reja) orqali o'tkazish:
- global CDN kesh (tezlik oshadi),
- DDoS va bot himoyasi,
- WAF (zararli so'rovlarni bloklash),
- tarmoq darajasida rate-limit,
- to'g'ri mijoz IP'si `CF-Connecting-IP` sarlavhasida keladi (2.4 bilan bog'liq).

### 2.3. Mahsulotlar bir martada to'liq yuklanadi
**Fayl:** `MaxiMarketBot/api.py`, `api_get_products` (500-qator)

**Muammo:** Barcha mahsulotlar bittada qaytariladi. Katalog 300-500+ ga yetganda
sayt sekinlashadi.

**Tuzatish:** serverdan sahifalab berish — `limit` va `skip` (offset) parametrlari,
saytda "pastga tushgan sari yuklash" (infinite scroll). MongoDB'da `created_at`
yoki `_id` bo'yicha indeks qo'shish.

### 2.4. `X-Forwarded-For` ishonchi
**Fayl:** `MaxiMarketBot/api.py`, `get_client_ip` (150-151-qatorlar)

**Muammo:** Login bloklash va buyurtma limiti IP'ga tayanadi, IP esa
`X-Forwarded-For` dan olinadi. Bu sarlavhani mijoz o'zi qo'yishi mumkin — blokdan
qochish yoki boshqani bloklash uchun.

**Tuzatish:** Cloudflare orqasida `CF-Connecting-IP` sarlavhasini birinchi o'qish
(uni faqat Cloudflare qo'yadi, ishonchli). Cloudflare'siz esa Railway qo'ygan eng
oxirgi proxy IP'sini olish.

---

## 3. O'RTA — mustahkamlash

### 3.1. Admin parol solishtiruvi vaqt-hujumiga zaif
**Fayl:** `MaxiMarketBot/api.py`, `api_login` (380-qator: `if password != ADMIN_PASSWORD`)

**Tuzatish:** doimiy vaqtli solishtiruv:
```python
if not hmac.compare_digest(str(password), str(ADMIN_PASSWORD)):
```

### 3.2. Xavfsizlik HTTP sarlavhalari yo'q
**Joy:** API javoblari (`cors_middleware` yoki alohida middleware)

**Tuzatish:** quyidagilarni qo'shish (yoki Cloudflare'da sozlash):
`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
`Referrer-Policy: strict-origin-when-cross-origin`,
`Content-Security-Policy` (saytga mos ravishda).
GitHub'da **Enforce HTTPS** yoqilganini tekshirish.

### 3.3. `increment_view` va `visit` himoyasiz
**Fayl:** `MaxiMarketBot/api.py`, `api_increment_view` (699), `api_visit` (1220)

**Muammo:** Ko'rishlar / tashriflar sonini sun'iy oshirish mumkin (statistika buziladi).

**Tuzatish:** IP + mahsulot bo'yicha sutkada bir marta hisoblash yoki oddiy
rate-limit qo'shish. Xavfsizlikка emas, statistika aniqligiga ta'sir qiladi.

### 3.4. Admin token `localStorage`da saqlanadi
**Fayl:** `maximarket-webapp/admin-app.js` (149-151-qatorlar)

**Muammo:** Admin panelда XSS bo'lsa, token o'g'irlanadi. Admin panel `innerHTML`
ishlatadi, shuning uchun bu qatlam muhim.

**Tuzatish:** admin panelda foydalanuvchi/mahsulot ma'lumotini `innerHTML` orqali
chiqarishdan oldin `escape` qilish (yordamchi `esc()` funksiyasi), yoki
`textContent` ishlatish. Server tomonda `sanitize_text` bor, lekin tuzatishdan
oldin bazaga kirib qolgan yozuvlar himoyalanmagan.

---

## 4. YAXSHI HOLATDA (o'zgartirish shart emas)

- Admin API endpoint'lari token bilan himoyalangan (`check_auth` hamma joyda).
- Buyurtma narxi bazadan olinadi — soxtalashtirib bo'lmaydi.
- NoSQL injection yopilgan (`sanitize_user_id`).
- JWT token muddati 12 soat + "chiqish" tokenni bekor qiladi (`token_version`).
- `SECRET_KEY` va `ADMIN_PASSWORD` majburiy — xavfli standart qiymat yo'q.
- SEO, Open Graph teglari professional darajada.
- Rasmlar `IntersectionObserver` bilan lazy-load qilinadi.

---

## 5. Bajarish tartibi (tavsiya)

| Bosqich | Ish | Muddat (taxmin) |
|---|---|---|
| 1 | 1.1 IDOR + 1.2 CORS tuzatish, `main`ga birlashtirish | 1-2 soat |
| 2 | 2.2 Cloudflare'ni domenga ulash | 1 soat |
| 3 | 2.1 Rasmlarni CDN/R2ga ko'chirish | 0.5-1 kun |
| 4 | 3.1-3.4 mustahkamlash | 2-3 soat |
| 5 | 2.3 Mahsulotlarni sahifalash | 0.5 kun |

**Muhim:** "100% xavfsiz" degan kafolat yo'q — hech bir sayt bunga erisha olmaydi.
Lekin yuqoridagilar bajarilsa, loyiha sanoat standartidagi professional darajaga
chiqadi.
