# QA Findings — localhost:3100 (Токио auto service)

Status: PARTIAL — A, B, C complete; D mostly complete (home-390.png blocked: server went down mid-run).
Tab: `tab-vtab-1341866258` (user Chrome). Only port 3100 touched; port 3000 untouched.

## A. Leftover old-project text — PASS (CLEAN)
Searched visible text AND full HTML on `/`, `/booking`, `/privacy` for:
«Керей», «автокомплекс», «Уалиханова», «Daewoo», «Mercedes», «запчасти для иномарок», «14 фото».
Result: **0 occurrences on all three pages** (both visible text and raw HTML). «Керей» appears nowhere.

## B. Токио content on home page — PRESENT (all yes)
- «ТОКИО»/«Токио» — yes (header, "Автосервис «Токио»", footer).
- «улица Толеу Сулейменова, 25а» — yes (contacts, footer, about).
- «+7 778 998 88 77» — yes.
- «Ежедневно 09:00–20:00» — yes.
- rating «4,8» — yes ("4,8 в 2ГИС · 332 оценки · 166 отзывов").
- «2GIS Awards 2026» — yes ("Номинант 2GIS Awards 2026").
- Gallery photographs: 17 real photos in DOM (`/images/photos/p01.webp` … `p17.webp`) + 1 hero (`hero-mobile.webp`).
- Minor content inconsistency (not a leftover keyword): step "02 ВЫБИРАЕТЕ ВРЕМЯ" says "работаем ежедневно 08:30–21:00" while all other places say "09:00–20:00".

## C. Booking wizard — **FAILED (blocked at step 3 «Дата»)**
- Wizard is inline on `/booking` (no modal; header button "Записаться" exists but form is already on page).
- Step 1 service «Компьютерная диагностика» — selected OK.
- Step 2 car Марка `Toyota`, Модель `Camry`, Год `2019` — accepted OK.
- **Step 3 «Дата» renders: "Свободных дней не нашлось. Позвоните нам — подберём время вручную." No day buttons → cannot pick a date → cannot reach Время/Контакты → cannot submit.**
- Root cause (verified): the app fetches the day list with **no `service` param**:
  `fetch("/api/availability",{cache:"no-store"})` (bundle `4303ahj6_9k0k.js`). API requires it →
  `GET /api/availability` → **HTTP 422** `{"ok":false,"message":"Неизвестная услуга"}` (also with `?date=` or `?month=`).
  App `if(!e.ok) throw` → `catch { setDays([]) }`.
  `GET /api/availability?service=diagnostics` → **200** with `days[]` (proves required param = `service`, value `diagnostics` for computer diagnostics).
  (The later slot fetch in code DOES pass it: `/api/availability?date=..&service=..`.)
- Confirmation/success screen: **NO**.
- Visible error text: «Свободных дней не нашлось. Позвоните нам — подберём время вручную.»
- Console errors: **none**; no «React error #NNN» (failure swallowed by try/catch).
- POST to `/api/bookings`: **never fired (0 requests)** — submit step unreachable.
- Phone auto-format `+7 (778) 998-88-77`: **NOT reached / unverifiable**.
- Evidence: `booking-failed.png`.

## D. Mobile layout
Programmatic analysis at **360×844** (home, reloaded):
- Horizontal scroll: **NO** (`document.scrollWidth` 345 ≤ 360; no scrollbar overflow).
- Elements wider than viewport: **0** (no element rect width/right exceeds 360).
- Text overlapping text: **0** pairs.
- Low-contrast text: **none confirmed**. One candidate "Легковой автосервис в Кокшетау" was a false positive (oklab parse); true resolved color rgb(207,208,209) on dark bg = high contrast.
- Page height at 360 width: **19,872 px** (extremely long).

Files:
- `home-360.png` — SAVED (360×844 viewport capture, 50 KB).
- `home-360.pdf` — SAVED (full page, ~41 MB).
- `home-390.png` — **NOT SAVED**: 390 capture timed out, then localhost:3100 went DOWN.
- `booking-failed.png` — SAVED.

## Blocker (final)
`localhost:3100` **stopped / connection refused** (`Test-NetConnection ... TcpTestSucceeded = False`) partway through part D. Could not capture `home-390.png`. Server must be restarted to finish the 390 capture (and any re-verification).
