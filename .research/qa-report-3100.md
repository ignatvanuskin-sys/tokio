# QA verification report — localhost:3100 (viewport 390x844)

## TASK A — /gallery image opacity

Bug status: **NOT FIXED**. All 17 gallery tiles still render as empty dark tiles with only caption text; every tile `<img>` has computed `opacity: 0`.

First 5 tiles (`<img>` computed style):

| # | opacity | complete | naturalWidth | src |
|---|---------|----------|--------------|-----|
| 1 | 0 | true | 187 | http://localhost:3100/photos/p03-400.webp |
| 2 | 0 | true | 187 | http://localhost:3100/photos/p08-400.webp |
| 3 | 0 | true | 187 | http://localhost:3100/photos/p01-400.webp |
| 4 | 0 | true | 187 | http://localhost:3100/photos/p14-400.webp |
| 5 | 0 | true | 187 | http://localhost:3100/photos/p06-400.webp |

- Tiles whose `<img>` has computed `opacity > 0.5`: **0 of 17**.
- Images are fully loaded (`complete: true`, non-zero `naturalWidth`), so the fade-in reveal never applied.
- The tile `<li>` elements DO get the `reveal-shown` class (14/17 at time of check), but the inner `<img>` keeps its pre-reveal classes `... scale-105 opacity-0 blur-md`.
- Note: one extra `<img>` (opacity 1) exists on the page — a hero/header image, NOT a gallery tile. Total page `<img>` = 18.

Screenshot: `gallery-after-fix.png` (viewport capture of the grid; the tool cannot capture true full-page).

## TASK B — /booking happy path

Result: **FAILED — success screen did NOT appear.** The client crashed with a Next.js "Application error" screen after submit.

Steps completed successfully: service «Компьютерная диагностика» selected → Далее → Марка=Toyota, Модель=Camry, Год=2019 → Далее → date «СЕГОДНЯ 26 сб» selected → Далее → time slot 15:00 selected → Далее → Имя=Тест QA, Телефон=7789988877 → consent checkbox ticked → «Подтвердить запись» clicked.

- Success screen: **No**.
- Error screen: Yes. Exact text: `Application error: a client-side exception has occurred while loading localhost (see the browser console for more information).`
- Screenshot: `booking-error.png`.
- Console error: `Minified React error #300` (see https://react.dev/errors/300) — thrown from Next.js chunk `4bd1b696-c023c6e3521b1417.js` during render after submit.
- Network: no failed requests. `POST http://localhost:3100/api/booking` → **201 (ok)**. Server accepted the booking; the crash is client-side (rendering the success step).
- Phone formatting: **yes** — field value became `+7 (778) 998-88-77`.

## Persistence checks

`GET http://localhost:3100/api/health` → 200, body:
```json
{"ok":true,"service":"tokyo-autoservice","venueDate":"2026-09-26","timeZone":"Asia/Almaty","storage":{"ok":true,"backend":"demo","detail":"file store: C:\\ЗА БАБКИ\\токио\\.data\\demo-db.json (1 bookings) — DEMO ONLY"},"notifications":{"telegram":false},"admin":{"passwordConfigured":false,"secretConfigured":false},"warnings":["DATABASE_URL отсутствует — используется демо-хранилище (файл).","Telegram не настроен — владелец не получает уведомления.","ADMIN_PASSWORD не задан — вход в панель отключён.","ADMIN_SESSION_SECRET не задан — вход в панель отключён.","NEXT_PUBLIC_SITE_URL не задан — canonical/OG неверны."]}
```
→ Booking **was persisted** (1 booking in the demo file store).

`GET http://localhost:3100/admin` → redirected to `http://localhost:3100/admin/login` (login screen reached, title «Вход в панель | Токио — автосервис, Кокшетау»). The page states the panel is **not configured**: `ADMIN_PASSWORD` is not set, so owner login is disabled. No password was attempted.

## Artifacts
- `gallery-after-fix.png` — https://sc02.alicdn.com/kf/A08402519c8bf4733a5059f0c339b029c2.png
- `booking-error.png` — https://sc02.alicdn.com/kf/A0eaa35fa4e024cc993e37cfa49c495b5r.png
