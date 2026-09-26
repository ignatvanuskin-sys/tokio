# Screenshot capture progress (sub-agent)

Tab: tab-vtab-1341866119 (user Chrome — built-in browser DISABLED in Settings)

| # | File | Status |
|---|------|--------|
| 1 | home-mobile-390.png (390x844, full page 390x12272) | DONE — vertical slice verified |
| 2 | home-desktop-1440.png (1440x900, full page 1440x9801) | DONE — hero slice verified |
| 3 | booking-step1-mobile.png (390x844, full page 390x4789) | DONE |
| 4 | booking-step3-mobile.png (390x844, full page 390x3525) | DONE |
| 5 | booking-step4-mobile.png (390x844, full page 390x3882) | DONE |
| 6 | gallery-mobile-390.png | PENDING |

Remaining: gallery screenshot; final visual review of booking crops; console-error report.

## Facts observed
- Accent orange = rgb(255,90,31) (#FF5A1F). Primary buttons filled orange, dark text rgb(11,12,14).
- Headings: font-family Oswald ("Arial Narrow"), text-transform uppercase → CONDENSED UPPERCASE.
- Section labels on marketing pages = orange mono/uppercase; booking form step labels (Утро/День/Вечер) = gray mono rgb(152,160,170), 12px, uppercase.
- Booking form: progress bar "ШАГ n ИЗ 5 · <STAGE>" + 5 segmented "Этапы записи" list (Услуга/Автомобиль/Дата/Время/Контакты).
- Page-level horizontal overflow: none (documentElement.scrollWidth <= innerWidth on all pages checked; body has overflow-x:hidden).
- Full-page capture method: pin min-h-[70svh] and min-h-[calc(100svh-3.5rem)] to their 390x844 px values (590.8 / 788) before enlarging viewport to full document height, so svh-based sections do not reflow.
- Clicks: Playwright ref click on "Далее" did NOT advance step (duplicate hidden React streaming node div#S:1). DOM .click() on the visible button DID work.
- No JS console errors captured so far (browser_utility errors = [] ; console level=error = []).
