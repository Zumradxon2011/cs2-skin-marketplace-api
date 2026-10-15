# 📖 CS2 Marketplace API — To'liq Loyiha Hujjati

> **Loyiha nomi:** `9-lesson`  
> **Turi:** Backend REST API (Node.js / Express / MongoDB)  
> **Maqsad:** CS2 skin marketplace'i — skinlar, qutalar (kesa), hamyon, inventar, pul tarixi va JWT autentifikatsiya.  
> **Til:** Kod ichidagi izohlar va xabarlar o'zbek tilida (Lotin alifbosi).  
> **Holat:** ✅ **To'liq ishlaydi** — 5 ta model ham faol, 24 ta endpoint, E2E test **31/31 passed**.

---

## 1. Umumiy tavsif

| # | Bosqich | Nima qilingan |
|---|---------|---------------|
| 1 | `bc9042d "done"` | Asosiy arxitektura: User/Skin modellari, auth, CRUD, wallet, validatsiya, seed-admin |
| 2 | `a318bc4 "done"` | `package.json` kichik tahriri |
| 3 | **(hozirgi, commit qilinmagan)** | ⭐ **To'liq versiya:** `Case` + `Inventory` + `Transaction` modellari ishga tushirildi, `/api/cases` va `/api/transactions` qo'shildi, xavfsizlik teshiklari yopildi |

**Server startida:** MongoDB Atlas ulanadi → DNS sozlanadi (8.8.8.8 / 1.1.1.1) → avto-admin yaratiladi → `PORT 5432` da tinglaydi.

---

## 2. Texnologik stek

| Paket | Versiya | Vazifasi |
|-------|---------|----------|
| `express` | ^5.2.1 | HTTP server va router (Express **5**) |
| `mongoose` | ^9.11.0 | MongoDB ODM |
| `jsonwebtoken` | ^9.0.3 | JWT Access/Refresh token |
| `bcryptjs` | ^3.0.3 | Parol xeshlash |
| `joi` | ^18.2.9 | Request body validatsiyasi |
| `multer` | ^2.4.0 | Rasm yuklash (multipart/form-data) |
| `cors` | ^2.8.6 | CORS ruxsatlari |
| `dotenv` | ^18.0.5 | `.env` o'qish |
| `nodemon` | ^3.1.14 | Dev rejimda avto-restart |

```bash
npm run dev    # nodemon src/server.js
npm start      # node src/server.js
```

---

## 3. Papka tuzilishi (yangilangan)

```
9-lesson/
├── .env                      # Maxfiy konfiguratsiya (gitignore qilingan ✅)
├── .gitignore
├── package.json
├── BACKEND_DOCUMENTATION.md  # (bu hujjat)
├── uploads/                  # Yuklangan rasmlar (/uploads statik)
└── src/
    ├── server.js             # ⭐ Kirish nuqta — 5 ta router ulangan
    ├── config/
    │   └── db.js             # MongoDB ulanish (o'lik kod tozalandi ✅)
    ├── models/               # 5 ta sxema — HAMMASI ISHLAYDI ✅
    │   ├── user.model.js     # (eskirgan 'skins' massivi olib tashlandi)
    │   ├── skins.model.js
    │   ├── case.model.js     # ✅ endi faol — qutalar
    │   ├── inventory.model.js# ✅ endi faol — skin tarixi (owned/sold)
    │   └── transaction.model.js # ✅ endi faol — pul tarixi
    ├── routes/
    │   ├── auth.routes.js
    │   ├── skins.routes.js
    │   ├── user.routes.js
    │   ├── case.routes.js        # 🆕
    │   └── transaction.routes.js # 🆕
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── skins.controller.js
    │   ├── user.controller.js    # ✅ Inventory + Transaction bilan yangilandi
    │   ├── case.controller.js    # 🆕 (ochish mantiqi shu yerda)
    │   └── transaction.controller.js # 🆕
    ├── middlewares/
    │   ├── auth.js           # JWT auth + admin
    │   ├── upload.js         # Multer (5 MB, faqat rasm)
    │   └── validate.js       # Joi (+ xatolikda rasmni o'chirish)
    ├── validations/
    │   ├── skin.validation.js
    │   ├── user.validation.js
    │   └── case.validation.js   # 🆕 (+ parseCaseBody middleware)
    └── utils/
        ├── seedAdmin.js      # Avto-admin
        └── rollChance.js     # 🆕 weighted random algoritm
```

**Arxitektura naqsh:** `route → middleware(lar) → controller → model`

---

## 4. Konfiguratsiya (`.env`)

| O'zgaruvchi | Qiymat | Izoh |
|-------------|--------|------|
| `MONGODB_URI` | `mongodb+srv://...cluster0.qqmz9gj.mongodb.net` | **MongoDB Atlas** |
| `JWT_SECRET` | `juda_maxfiy_kalit_soz_12345` | Access token kaliti |
| `REFRESH_SECRET` | `yana_juda_maxfiy_refresh_kalit_67890` | 🆕 Refresh token kaliti **(qo'shildi — xavfsizlik teshigi yopildi)** |
| `ADMIN_EMAIL` | `admin@gmail.com` | Avto-admin email |
| `ADMIN_PASSWORD` | `admin12345` | Avto-admin parol |
| `PORT` | `5432` | Server porti |

> ✅ `.env` **git'ga kirmaydi** (`.gitignore:5` rad etadi — tekshirildi).

---

## 5. Ma'lumotlar modellari (hammasi faol)

### 5.1 `User` — `users`
`username` (unique, min 3) · `email` (unique, lowercase) · `password` (bcrypt xesh, min 6) · `role` (`user`/`admin`) · `wallet` (default 0, min 0) · `refreshToken` · `timestamps`

> ❌ **O'zgartirildi:** `skins: [ObjectId]` massivi **olib tashlandi** — endi egalik haqiqiy ma'lumot `Inventory` kolleksiyasida.  
> ⚠️ Eski bazadagi `user.skins` yozuvlari **qo'lda ko'chirilmagan** (yangi tizimga o'tishda eski inventar yo'qoladi).

### 5.2 `Skin` — `skins`
`skinName` · `skinRarity` (Common/Rare/Epic/Legendary/Mythic) · `skinPrice` · `imageUrl`

### 5.3 `Case` — `cases` ✅ **endi faol**
| Maydon | Turi | Izoh |
|--------|------|------|
| `caseName` | String | required |
| `casePrice` | Number | min 0.01 — ochish narxi |
| `imageUrl` | String | quta rasmi |
| `skins[]` | `{skin: ObjectId→Skin, chance: 0..100}` | ichidagi skinlar + tushish og'irligi |
| `isAvailable` | Boolean | default `true` |
| `timestamps` | — | avtomatik |

### 5.4 `Inventory` — `inventory` ✅ **endi faol**
`user` · `skin` · `sourceCase` (qaysi qutadan tushgan; marketplace'dan olinganda **`null`**) · `status` (`owned`/`sold`) · `obtainedAt`

> **Inventar manbasi endi shu.** Sotilgan yozuv **o'chirilmaydi**, `sold` holatga o'tkaziladi → tarix saqlanadi.

### 5.5 `Transaction` — `transactions` ✅ **endi faol**
`user` · `type` (`deposit`/`case_open`/`skin_sale`/**`skin_buy`** 🆕) · `amount` · `balanceBefore` · `balanceAfter` · `timestamps`

> **`amount` belgisi qoidasi (yangi konventsiya):**
> - `+` — pul keladi: `deposit`, `skin_sale`
> - `−` — pul ketadi: `skin_buy`, `case_open`
> - Doimiy: **`balanceBefore + amount === balanceAfter`** (testda tekshirildi ✅)

---

## 6. API Endpointlar (24 ta)

**Izoh:** 🔓 ochiq · 🔐 `authMiddleware` · 🛡 admin · ✅ Joi validatsiya · 📷 multer rasm

### 6.0 Umumiy
| Metod | URL | Himoya | Vazifa |
|-------|-----|--------|--------|
| GET | `/` | 🔓 | Health check |
| GET | `/uploads/<fayl>` | 🔓 | Statik rasmlar |

### 6.1 Auth — `/api/auth`
| Metod | URL | Himoya | Vazifa |
|-------|-----|--------|--------|
| POST | `/api/auth/register` | 🔓 | Ro'yxatdan o'tish |
| POST | `/api/auth/login` | 🔓 | Kirish → `accessToken` (15m) + `refreshToken` (7d) |
| GET | `/api/auth/me` | 🔐 | Joriy foydalanuvchi |
| POST | `/api/auth/refresh` | 🔓 | Yangi access token olish |

### 6.2 Skins — `/api/skins`
| Metod | URL | Himoya | Vazifa |
|-------|-----|--------|--------|
| GET | `/api/skins` | 🔓 | Barcha skinlar |
| GET | `/api/skins/:id` | 🔓 | Bitta skin |
| POST | `/api/skins` | 🛡 📷 ✅ | Yangi skin yaratish |
| PATCH | `/api/skins/:id` | 🛡 📷 ✅ | Yangilash (eski rasm o'chadi) |
| DELETE | `/api/skins/:id` | 🛡 | O'chirish (+ rasm diskdan) |

### 6.3 Users — `/api/users`
| Metod | URL | Himoya | Vazifa |
|-------|-----|--------|--------|
| GET | `/api/users` | 🛡 | Barcha userlar (parolsiz) |
| GET | `/api/users/inventory` | 🔐 | 🔄 Hamyon + **owned** inventar |
| POST | `/api/users/buy/:skinId` | 🔐 | 🔄 Skin sotib olish → `Inventory` + `Transaction` |
| POST | `/api/users/sell/:skinId` | 🔐 | 🔄 Skinni sotish → `status: sold` + `Transaction` |
| GET | `/api/users/:id` | 🔐 | Bitta user |
| PATCH | `/api/users/:id` | 🔐 ✅ | Faqat `username`/`email` |
| DELETE | `/api/users/:id` | 🛡 | O'chirish |
| POST | `/api/users/deposit` | 🔐 | 🔄 Hamyon to'ldirish → `Transaction` |

### 6.4 🆕 Cases — `/api/cases`
| Metod | URL | Himoya | Vazifa |
|-------|-----|--------|--------|
| GET | `/api/cases` | 🔓 | Barcha qutalar (`skins.skin` populate) |
| GET | `/api/cases/:id` | 🔓 | Bitta quta |
| POST | `/api/cases/:id/open` | 🔐 | ⭐ **QUTANI OCHISH** — asosiy o'yin |
| POST | `/api/cases` | 🛡 📷 ✅ | Yangi quta yaratish |
| PATCH | `/api/cases/:id` | 🛡 📷 ✅ | Qutani yangilash |
| DELETE | `/api/cases/:id` | 🛡 | O'chirish (+ rasm diskdan) |

### 6.5 🆕 Transactions — `/api/transactions`
| Metod | URL | Himoya | Vazifa |
|-------|-----|--------|--------|
| GET | `/api/transactions` | 🔐 | O'z pul tarixi (oxirgilari birinchi, max 100) |
| GET | `/api/transactions/all` | 🛡 | Barcha userlar tarixi (max 200, user ma'lumoti bilan) |

> Routelar tartibini tekshirish: `/inventory`, `/buy/:skinId`, `/sell/:skinId` **`/:id` dan oldin** turadi ✅

---

## 7. ⭐ Quta ochish mantiqi (`POST /api/cases/:id/open`)

```
1. Qutani top (populate)  → topilmasa 404
2. isAvailable?           → bo'lmasa 400
3. Ichida skin bormi?     → yo'q bo'lsa 400
4. User'ni top            → yo'q 404
5. wallet >= casePrice?   → yetmasa 400 ("Balansingizda yetarli mablag' yo'q!")
6. rollChance(skins)      → weighted random g'olib  (src/utils/rollChance.js)
7. wallet dan yech        → balanceBefore / balanceAfter
8. Inventory.create       → status: owned, sourceCase: quta ID
9. Transaction.create     → type: case_open, amount: -casePrice
10. Javob: { message, skin, inventoryItem, wallet }
```

**`rollChance` algoritmi:** barcha `chance` qiymatlari yig'indisiga bo'lib, `Math.random()` oraliqda tanlov qiladi. Jami chance **100 ga teng bo'lmasa ham** to'g'ri ishlaydi (nixtalarga bo'linadi).

**Quta yaratish namunasi** (multipart — `skins` maydoni **JSON string** sifatida yuboriladi, server avtomatik parse qiladi `parseCaseBody`):

```js
const fd = new FormData();
fd.append('caseName', 'Fever Case');
fd.append('casePrice', '2500');
fd.append('skins', JSON.stringify([
  { skin: '<skinObjectId>', chance: 70 },
  { skin: '<skinObjectId>', chance: 30 }
]));
fd.append('image', new File([blob], 'case.jpg', { type: 'image/jpeg' }));

fetch('/api/cases', { method: 'POST', headers: { Authorization: 'Bearer <adminToken>' }, body: fd });
```

---

## 8. Middleware'lar

| Middleware | Vazifa |
|-----------|--------|
| `auth.js → authMiddleware` | `Authorization: Bearer` JWT tekshiruvi → `req.user = {id, role}`, xato → 401 |
| `auth.js → adminMiddleware` | `role !== 'admin'` → 403 |
| `upload.js` | Multer diskStorage → `uploads/`, unikal nom, faqat `image/*`, **5 MB** limit, papka avto-yaratiladi |
| `validate.js` | Joi (`abortEarly:false, stripUnknown:true, convert:true`); xatoda **yuklangan rasmni o'chiradi** va 400 qaytaradi |

---

## 9. Autentifikatsiya

```
register ─► bcrypt xesh ─► users
login    ─► compare ─► accessToken (15m, JWT_SECRET, {id, role})
                    └─► refreshToken (7d, REFRESH_SECRET) ─► users.refreshToken'ga yoziladi
har bir 🔐 so'rov ─► authMiddleware ─► req.user
/refresh ─► bazadan topish + verify ─► yangi accessToken
```

**Avto-admin:** server startida `seedAdmin()` → bazada admin bo'lmasa `SuperAdmin` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` (`admin12345`), wallet `10000`.

---

## 10. 🔌 Foydalanilgan tashqi API / xizmatlar

Uchinchi tomon HTTP API'ga murojaat **yo'q** (`fetch`/`axios`/`http` — 0 ta):

| # | Tashqi xizmat | Qayerda | Vazifa |
|---|---------------|---------|--------|
| 1 | **MongoDB Atlas** | `config/db.js` → `mongoose.connect(MONGODB_URI)` | Butun ma'lumot saqlash |
| 2 | **Google DNS** `8.8.8.8` | `server.js` → `dns.setServers` | Atlas SRV yechish |
| 3 | **Cloudflare DNS** `1.1.1.1` | `server.js` → `dns.setServers` | Zaxira DNS |
| 4 | **JWT** | auth middleware + controller | Ichki token API |

> ⚠️ **Tekshiruv:** test skriptida `dns.setServers` **yozilmaganda** Atlas SRV DNS so'rovi tushib ketdi (`querySrv ECONNREFUSED`) — demak `server.js` dagi DNS sozlamasi **muhim va asosli**.

---

## 11. ✅ Test natijalari (E2E, server real ishga tushirildi)

**31/31 muvaffaqiyatli, 0 xato** (vaqtincha skript bilan, yakunda avtomatik tozalandi):

- Auth: admin login, register (parol javobda yo'q), user login ✅
- Deposit → wallet 5000 ✅
- Skin yaratish (multipart), qimmat skin ✅
- **Quta yaratish (multipart + JSON string parse)** ✅
- Sotib olish → wallet 4000, inventar `sourceCase: null` ✅
- **Kesa ochish → wallet 3300, g'olib skin, `sourceCase` bilan inventar** ✅
- Mablag yetarlmasa → 400 ✅
- Sotish → 4300; **duplikat nusxa ham sotildi → 5300**; hammasi tugagach → 400 ✅
- **5 ta tranzaksiya + balans zanjiri to'g'ri** (`before + amount = after`) ✅
- Admin `/all` → 200; user → 403 ✅
- Ochiq cases, populate, `user` javobida `skins` yo'qligi ✅
- Validatsiya: rasmsiz/`skinsiz` quta → 400, tokensiz ochish → 401 ✅
- O'chirish: quta va skinlar (rasmlar diskdan ham tozalandi) ✅
- **Tozalash:** test userlar + inventar + tranzaksiyalar o'chirildi, `uploads/` da faqat asl 2 ta rasm qoldi ✅

---

## 12. ⚠️ Topilgan muammolar

### 13.1 ✅ Ushbu bosqichda Tuzatilganlar
| # | Muammo | Yechim |
|---|--------|--------|
| 1 | `Case`, `Inventory`, `Transaction` ishlatilmagan edi | ✅ 3 ta model to'liq ulandi (routelar + kontrollerlar) |
| 2 | Pul tarixi yozilmaydi | ✅ `deposit`/`buy`/`sell`/`open` da `Transaction` yoziladi |
| 3 | `REFRESH_SECRET` .env'da yo'q edi | ✅ `.env` ga qo'shildi |
| 4 | `db.js` da o'lik `createInitialAdmin` (boshqa parol bilan) | ✅ O'chirildi |
| 5 | Dublikat sotib olish nazoratsiz edi | ✅ Har bir nusxa alohida `Inventory` hujjati — sotishda aniq nusxa tanlanadi |
| 6 | Inventarda tarix yo'q edi | ✅ `sourceCase`, `obtainedAt`, `status: sold` tarixi saqlanadi |

### 13.2 🔴 Hali ochiq qolganlar
| # | Muammo | Daraja |
|---|--------|--------|
| 1 | **IDOR:** `PATCH /api/users/:id` — har qanday auth user boshqasini tahrirlay oladi | 🔴 |
| 2 | `GET /api/users/:id` — admin bo'lmasa ham boshqasini ko'rish mumkin | 🟡 |
| 3 | `register`/`login` da Joi validatsiyasi yo'q (faqat Mongoose tekshiradi) | 🟡 |
| 4 | Balans o'zgarishlari **atomar emas** (parallel so'rovda race condition) | 🟡 |
| 5 | `/logout` endpoint yo'q — refresh token bekor qilinmaydi | 🟡 |
| 6 | Sotishda komissiya yo'q (to'liq narx qaytadi) | 🟢 |
| 7 | Paginatsiya/filtr yo'q (`GET /skins`, `/users`, `/transactions`) | 🟢 |
| 8 | Test fayli, rate-limit, helmet yo'q (E2E skript vaqtincha edi) | 🟢 |
| 9 | `nodemon` `dependencies` ichida (aslida `devDependencies`) | 🟢 |
| 10 | `Skin` modelda `timestamps` yo'q (qolganlarida bor) | 🟢 |
| 11 | Port `5432` (Postgres an'anasi) — ishlaydi, lekin `3000` an'anaviyroq | 🟢 |

---

## 14. Ishga tushirish

```bash
npm install
npm run dev        # yoki: npm start
# → Server ishga tushdi: http://localhost:5432
```

**Kerakli .env:** `MONGODB_URI`, `JWT_SECRET`, `REFRESH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `PORT`.

**Tezkor tekshiruv:**
```bash
curl http://localhost:5432/            # health check
curl http://localhost:5432/api/cases   # []
```

---

## 15. Keyingi qadamlar (tavsiya)

1. **IDOR tuzatish:** `PATCH /api/users/:id` ga `req.user.id === req.params.id || admin` tekshiruvi.
2. **Rate limiting + helmet** qo'shish.
3. **DB-transaction** (MongoDB session) bilan balans amallarini atomar qilish.
4. `/logout` endpointi (refresh token'ni bazadan o'chirish).
5. `register`/`login` uchun Joi sxemasi.
6. `GET /api/skins?rarity=Legendary&minPrice=1000` filtr + pagination.
7. Avto-seed: namuna qutalar/skinlar (demo uchun).
