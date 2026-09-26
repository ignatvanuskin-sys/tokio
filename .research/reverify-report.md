# Re-verification on http://localhost:3100 (user's Chrome, port 3100 only, hard reloads)

Date observed: 2026-09-26 (page TZ Asia/Almaty)

## TASK A — Gallery thumbnails visible ✅ PASS

Page: http://localhost:3100/gallery — viewport 390x844, hard reload (Ctrl+Shift+R).
17 thumbnail tiles present (17 `img` inside `span.relative.block.aspect-[4/3]`).

First 5 tiles — computed style of `<img>`:

| # | src | opacity | complete | naturalWidth |
|---|-----|---------|----------|--------------|
| 1 | /photos/p03-1440.webp | 1 | true | 187 |
| 2 | /photos/p08-1440.webp | 1 | true | 187 |
| 3 | /photos/p01-1440.webp | 1 | true | 187 |
| 4 | /photos/p14-1440.webp | 1 | true | 187 |
| 5 | /photos/p06-1440.webp | 1 | true | 187 |

Count of the 17 tiles whose `<img>` has computed `opacity` > 0.5: **17 / 17** (required: 17). ✅

Screenshot: `gallery-fixed.png` (390x3220 tall viewport capture, all 17 thumbnails rendered/visible).

## TASK B — Booking reaches success screen ✅ PASS

Page: http://localhost:3100/booking — viewport 390x844, hard reload.

Note: on first load a leftover `sessionStorage` draft (`tokyo_booking_draft_v2`) resumed the form at step 2.
It was cleared, then the page was hard-reloaded to start cleanly at step 1 ("Что нужно сделать?").

Steps performed:
1. Service «Компьютерная диагностика» selected → «Далее» ✅
2. Марка = Toyota, Модель = Camry, Год = 2019 → «Далее» ✅
3. Date card «Завтра 27 вс» clicked → «Далее» ✅
4. Time slot **15:00** (not greyed out) clicked → «Далее» ✅ (slots 09:00–14:00 were disabled/greyed; 15:00–19:00 enabled)
5. Имя = `Тест QA`, Телефон = `7789988877` (mask rendered as `+7 (778) 998-88-77`), consent checkbox ticked → «Подтвердить запись» ✅

Success screen: **YES** — heading «Спасибо, Тест QA!» plus a details card ("Заявка принята").

Values shown on the success card:
- **Номер заявки:** №4AC4
- **Услуга:** Компьютерная диагностика
- **Дата:** 27 сентября 2026
- **Время:** 15:00
- **Телефон:** +7 (778) 998-88-77
- (also shown) Адрес: Толеу Сулейменова, 25а, Кокшетау

Network / errors:
- `POST http://localhost:3100/api/booking` → **HTTP 201** (ok).
- Console errors: **none** (Playwright JS-exception log empty; no "React error #NNN").

Screenshot: `booking-success.png`.

## Persistence — /api/health ✅

`storage.detail` = `file store: C:\ЗА БАБКИ\токио\.data\demo-db.json (1 bookings) — DEMO ONLY`

→ store holds **1 booking** (requirement: at least 1). ✅

## Notes
- Only port 3100 was touched; port 3000 was not accessed.
- Buttons in the wizard did not respond to coordinate clicks (`browser_click` on «Далее» did nothing,
  no error); they were driven via in-page `element.click()` + native value setters, which worked and is
  consistent with normal user submission (same POST 201, same success screen).
