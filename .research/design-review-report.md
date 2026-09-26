# Design review — localhost:3100 (Токио / автосервис)

**Tool deviation:** the built-in browser is DISABLED in Accio Work Settings > Browser
(`Built-in browser is unavailable: it has been disabled...`), so all captures were taken in the
user's Chrome (one new tab: `tab-vtab-1341866119`). Only the site on port 3100 was opened.

**Capture method (full page):** the app sizes sections with `100svh`-based utilities
(`min-h-[70svh]`, `min-h-[calc(100svh-3.5rem)]`), so enlarging the viewport reflows the layout.
Those two rules were pinned to their 390x844 px values (590.8px / 788px) before the viewport was
expanded to the full document height. The pinned height equals the document height at 390x844, so
the capture is pixel-faithful to the mobile layout (verified: doc height unchanged after enlarge).
`transition`/`animation` were disabled so captures are deterministic.

## Files

| File | Viewport | Full-page size |
|---|---|---|
| home-mobile-390.png | 390x844 | 390x12272 |
| home-desktop-1440.png | 1440x900 | 1440x9801 |
| booking-step1-mobile.png | 390x844 | 390x4789 |
| booking-step3-mobile.png | 390x844 | 390x3525 |
| booking-step4-mobile.png | 390x844 | 390x3882 |
| gallery-mobile-390.png | 390x844 | 390x3218 |

## Global design facts

- **Accent = orange `rgb(255, 90, 31)` / #FF5A1F** (brighter variant #FF7A45 for accent text).
  Primary filled buttons: orange background, dark ink text `rgb(11,12,14)`.
- **Headings = condensed uppercase**: `font-family: Oswald, "Arial Narrow", ...`, `text-transform: uppercase`
  (h1 "ТОКИО" 37px/600; section headings 28px/600; card headings 15-17px/700).
- Secondary small labels: monospace `ui-monospace,...` 12px uppercase, grey `rgb(152,160,170)`.
  On the marketing pages the *eyebrow* labels ("— УСЛУГИ", "— РЕЙТИНГ 2ГИС") are orange;
  inside the booking form the step labels ("УТРО/ДЕНЬ/ВЕЧЕР", "ШАГ 1 ИЗ 5") are grey monospace.
- **Page-level horizontal overflow: none.** `documentElement.scrollWidth` was 380-390 (mobile) and
  1430 (1440 desktop), i.e. ≤ viewport; `body` also carries `overflow-x: hidden`.
  The horizontally overflowing nodes found by the audit are all children of intentional
  horizontal scroll rows (step cards on home, date cards in booking).

## Per-screenshot observations

### 1. home-mobile-390.png
- Orange accent: **YES** — filled orange CTA "Записаться на сервис" (344x52), orange eyebrows
  "— АВТОСЕРВИС · КОКШЕТАУ", "— РЕЙТИНГ 2ГИС", "— УСЛУГИ", orange service-category labels
  (ДИАГНОСТИКА, ХОДОВАЯ И ПОДВЕСКА, ДВИГАТЕЛИ, ТОРМОЗНАЯ СИСТЕМА, КОЛЁСА И ШИНЫ), orange
  "Записаться на диагностику".
- Condensed uppercase headings: **YES** (ТОКИО, ЧТО ЧАСТО ВСЕГО ДЕЛАЕМ, НАЧНИТЕ С ДИАГНОСТИКИ,
  ФАКТЫ ВМЕСТО ОБЕЩАНИЙ, ВЫБЕРИТЕ ВРЕМЯ — ОСТАЛЬНОЕ СДЕЛАЕМ МЫ, ЧАСТЫЕ ВОПРОСЫ, ЗАПИСАТЬСЯ В «ТОКИО»).
- Hero and service cards both present (8 service cards).
- Defects: only minor — the hero rating pill's trailing caption "ПО ДАННЫМ 2ГИС" is grey
  `rgb(152,160,170)`-low contrast on the translucent dark card. Hero paragraph sits on a dark
  translucent panel over a photo and stays readable. No cut-off or overlapping text.
  (`h2#trust-heading` is a visually-hidden sr-only element, width 1px — not a bug.)

### 2. home-desktop-1440.png
- Orange accent: **YES** (nav CTA "Записаться", hero CTA "Записаться на сервис", orange eyebrows and
  service-card labels, orange photo-strip labels).
- Condensed uppercase headings: **YES**.
- No overflow, no cut-off/overlap observed in the hero or the services grid.

### 3. booking-step1-mobile.png
- Step 1 heading **"ЧТО НУЖНО СДЕЛАТЬ?"** with the 15-service list
  (Компьютерная диагностика … Аренда тёплого бокса). Heading rendered condensed uppercase.
- Orange accent: **YES** — the primary "Далее" button is filled orange #FF5A1F; the "ОНЛАЙН-ЗАПИСЬ"
  eyebrow is orange. The in-form step label "ШАГ 1 ИЗ 5 · УСЛУГА" and legend are grey monospace, not orange.
- A yellow/amber "Демонстрационный режим: заявки сохраняются в файл, а не в PostgreSQL…" notice is
  shown inside the form (orange text on dark amber panel) — demo data mode, worth knowing for review.
- No overflow, no clipped text.

### 4. booking-step3-mobile.png
- Step 3 **(reached by clicking "Далее" twice)**: label "ШАГ 3 ИЗ 5 · ДАТА", heading
  **"КОГДА ВАМ УДОБНО?"**.
- 14 horizontal date cards (92x89 px each) in one horizontal scroll row: СЕГОДНЯ 26 сб, ЗАВТРА 27 вс,
  ПН 28, ВТ 29, СР 30, ЧТ 01 … ПТ 09. Selected card gets an orange outline (26 сентября 2026 was
  pre-selected). Helper text "Вы выбрали: 26 сентября 2026. Дальше — время приёма."
- Orange accent: **YES** ("Далее" orange, selected date card outline orange).
- Condensed uppercase: **YES** for the heading; the weekday/date numerals use the condensed face,
  the "ШАГ 3 ИЗ 5 · ДАТА" meta line is monospace.
- No overflow. The 4th card is partially clipped by the scroller edge — expected for the carousel.

### 5. booking-step4-mobile.png
- Step 4 (click a date card → "Далее"): label "ШАГ 4 ИЗ 5 · ВРЕМЯ", heading **"ВЫБЕРИТЕ ВРЕМЯ"**.
- Time slots grouped under **Утро** (09:00, 10:00, 11:00), **День** (12:00, 13:00, 14:00, 15:00, 16:00),
  **Вечер** (17:00, 18:00, 19:00). Note under the grid: "Занятое время отмечено серым…"
- Orange accent: **YES** ("Далее" orange, progress bar orange).
- Condensed uppercase headings: **YES** for "ВЫБЕРИТЕ ВРЕМЯ"; the Утро/День/Вечер group labels are
  grey monospace uppercase (12px), clearly a secondary style, not the condensed display face.
- No overflow, no overlapping/unreadable text.

### 6. gallery-mobile-390.png — **DEFECT**
- Heading "СЕРВИС БЕЗ РЕТУШИ" (condensed uppercase), filter chips "Все 17" (selected, orange),
  "Внутри", "Снаружи", "Работа". Orange accent: **YES** (selected chip + "Записаться на сервис" CTA).
- **All 17 grid photos are invisible.** They load successfully (`complete: true`,
  `naturalWidth 187`, e.g. `/photos/p03-400.webp`) but their computed `opacity` is **0**: the `<img>`
  class is `h-full w-full object-cover transition duration-700 scale-105 opacity-0 blur-md`, inside
  `a.relative.block.aspect-[4/3].w-full.overflow-hidden`. Result: empty dark tiles showing only the
  caption text ("Развал-схождение на стенде", "Цех целиком", …). The one large photo in the
  "Запись в цех" section (different class set) renders normally.
  Reproduced on a clean reload at 390x844 with **no injected styles** — this is the real rendered
  state, not a capture artefact. See evidence crop `gallery-photos-missing-evidence.png`.
- No horizontal overflow.

## Progress / segmented bar

**Visible — YES** on the booking form, directly under the heading:
a "ШАГ n ИЗ 5 · <STAGE>" meta line plus a 5-segment bar; filled orange segments equal the current
step (1 filled at step 1, 4 filled at step 4). An accessible step list "Этапы записи"
(Услуга / Автомобиль / Дата / Время / Контакты) is present in the a11y tree.

## Clicks — all succeeded, no JS error

- Step 1 → 2 → 3 → 4 advanced correctly (verified by reading the step label after each click:
  "ШАГ 2 ИЗ 5 · АВТОМОБИЛЬ", "ШАГ 3 ИЗ 5 · ДАТА", "ШАГ 4 ИЗ 5 · ВРЕМЯ").
- Date card click worked: selecting "ПН 28" produced "Вы выбрали: 28 сентября 2026."
- Caveat for automation: a Playwright ref-click on "Далее" did **not** advance the step. The form is
  duplicated in the DOM inside a React streaming placeholder rendered `<div hidden id="S:1">`
  (`display:none`), and the ref resolved to that hidden copy. Dispatching the click on the *visible*
  button (rect > 0) worked every time. No failure screenshot was needed.

## Console errors

**None observed.** `browser_utility errors` → `[]` (JS exceptions) and the captured console log was
empty at every level (`level=error` → `[]`, unfiltered → `[]`) across home, booking and gallery.
