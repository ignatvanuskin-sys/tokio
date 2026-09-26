# Токио — сайт автосервиса (Кокшетау)

Production-ready сайт и «digital front desk» для автосервиса **Токио**
(Кокшетау, ул. Толеу Сулейменова, 25а): онлайн-запись, панель владельца,
уведомления, local SEO.

Все факты о бизнесе (рейтинг, часы, телефон, услуги, марки, фотографии, отзывы)
взяты с карточки компании в 2ГИС и лежат в `src/data/*` с пометкой источника.
**Цены не публикуются** — их нет в 2ГИС, поэтому на сайте нигде нет выдуманных цифр.

---

## Быстрый старт

```bash
git clone <repo>
cd <repo>
npm install

cp .env.example .env        # заполните значения (см. ниже)
npm run db:migrate          # схема PostgreSQL
npm run db:seed             # справочник услуг + график работы

npm run dev                 # http://localhost:3000
```

Проверки:

```bash
npm run typecheck
npm run test                # 66 тестов
npm run build
```

### Запуск без базы (демо)

Если `DATABASE_URL` не задан, сайт работает на файловом демо-хранилище
(`.data/demo-db.json`). Это полноценная реализация того же контракта, но
**не продакшен**: она не переживёт несколько инстансов. В production-сборке
`getStore()` бросает ошибку вместо тихого фолбэка (`ALLOW_DEMO_STORE=1`
отключает это для staging-превью).

---

## Переменные окружения

См. `.env.example`. Обязательны в продакшене:

| Переменная | Зачем |
|---|---|
| `DATABASE_URL` | PostgreSQL |
| `ADMIN_PASSWORD` | вход в `/admin` |
| `ADMIN_SESSION_SECRET` | подпись сессии (≥24 символов) |
| `NEXT_PUBLIC_SITE_URL` | canonical, OG, sitemap, schema.org |
| `VENUE_TIMEZONE` | `Asia/Almaty` |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | уведомления владельцу |

Сгенерировать секрет:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

---

## Архитектура

```
src/
  app/                 страницы (App Router) + API routes
  components/          UI; components/booking — мастер записи; components/admin
  data/                ИСТОЧНИК ПРАВДЫ: business, services, gallery, faq,
                       schedule, nav + сгенерированные reviews/photo-assets/map
  lib/
    booking/           домен + stores (postgres / demo) + zod-валидация
    phone.ts           маска и валидация +7 (___) ___-__-__
    time.ts            даты в таймзоне сервиса
    notify.ts          Telegram (честно сообщает, если не настроен)
    auth.ts            подписанная HttpOnly-сессия админки
    rate-limit.ts      окно на IP
    analytics.ts       events без персональных данных
db/migrations/         001_init.sql
scripts/               миграции, сиды, генерация фото/карты/OG/отзывов
tests/                 vitest
```

### Данные, сгенерированные из 2ГИС

| Файл | Скрипт | Что делает |
|---|---|---|
| `src/data/reviews.generated.ts` | `node scripts/fetch-reviews.mjs` | реальные отзывы дословно |
| `src/data/photo-assets.generated.ts`, `public/photos/*` | `npm run images` | WebP-варианты 17 фото |
| `src/data/map.generated.ts`, `public/map.webp` | `node scripts/build-map.mjs` | статичная карта из тайлов 2ГИС |
| `public/og.jpg` | `node scripts/build-og.mjs` | превью для мессенджеров |
| `src/app/fonts.css`, `public/fonts/*` | `npm run fonts` | самохостинг шрифтов |

---

## Запись: как устроена надёжность

### Двойная запись невозможна

`schedule_slots` хранит по строке на `(slot_date, slot_time)` со счётчиком
`taken` и `capacity`. Резерв места — один атомарный запрос:

```sql
INSERT INTO schedule_slots (slot_date, slot_time, taken, capacity)
VALUES ($1, $2, 1, $3)
ON CONFLICT (slot_date, slot_time)
DO UPDATE SET taken = schedule_slots.taken + 1
WHERE schedule_slots.taken < schedule_slots.capacity
RETURNING taken;
```

Postgres берёт блокировку строки, поэтому одновременные транзакции
сериализуются. Если мест нет, `WHERE` не выполняется, запрос возвращает 0 строк
и клиент получает **409** с понятным сообщением:

> Это время только что заняли. Выберите другой слот.

Второй клиент не получает запись, окна гонки нет. Покрыто тестом
`tests/booking-store.test.ts` → «lets exactly ONE of many simultaneous requests win a slot».

### Идемпотентность

`bookings.idempotency_key` — UNIQUE. Повторная отправка (двойной клик,
ретрай браузера, плохая сеть) возвращает исходную заявку, а не создаёт вторую.
Клиент генерирует ключ один раз и переиспользует его при повторных попытках.

### Границы (честно)

* `slotMinutes`, `capacityPerSlot`, `minLeadMinutes`, `horizonDays` — **наши
  предположения**, а не данные 2ГИС. Настраиваются через env. Владелец должен
  подтвердить реальную длину слота и сколько машин сервис берёт одновременно.
* Автоподтверждения записи нет: время подтверждает мастер по телефону. Текст
  успеха это отражает (`src/components/booking/SuccessScreen.tsx`,
  константа `STATUS_IS_AUTOMATIC`).

---

## Админка и уведомления

* `/admin` — заявки по дням, фильтры (сегодня/завтра/неделя/все, статус,
  услуга), звонок/WhatsApp в один тап, смена статуса.
* 5 неудачных входов с одного IP → блокировка на 15 минут.
* Сессия — подписанная HttpOnly-cookie на 12 часов.

**Telegram.** Если `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` не заданы, заявка
всё равно сохраняется, но уведомление **не отправляется** — функция честно
возвращает `not_configured`, и админка показывает предупреждение. Никакой
имитации отправки.

Как подключить: создать бота у `@BotFather`, добавить его в чат, взять chat id
из `https://api.telegram.org/bot<TOKEN>/getUpdates`, вписать обе переменные.

---

## Проверка конфигурации

```
GET /api/health
```

Отдаёт состояние хранилища и список того, что **не настроено**, вместо
зелёного света, который неправдой. Секреты не раскрываются.

---

## Деплой

Требуется Node ≥ 20.11 и PostgreSQL.

```bash
npm ci
npm run db:migrate && npm run db:seed
npm run build
npm start
```

* Vercel / Node-хостинг — приложение обычное, без фоновых воркеров.
* `push` в репозиторий не содержит секретов: `.env` и `.data/` в `.gitignore`.
* `/admin` и `/api/*` закрыты в `robots.txt` и отдают `X-Robots-Tag: noindex`.
* CSP и security-заголовки — в `next.config.mjs`; сторонних скриптов нет.

---

## Что требует владельца

1. **Фотографии без водяного знака.** Сейчас используются 17 фото, скачанных с
   карточки 2ГИС, — на них есть небольшой штамп «2GIS». Замените оригиналы
   (положите в `.research/photos_raw/` как `p01.jpg`…`p17.jpg` и выполните
   `npm run images`), код менять не нужно.
2. **Прайс-лист.** Если владелец даст цены, добавьте их в `src/data/services.ts`
   и переключите `business.hasPublishedPrices`.
3. **Реквизиты юрлица** для полной редакции политики конфиденциальности.
4. **Подтвердить операционные параметры** (см. «Границы» выше).
5. **Подключить Telegram** и задать `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET`.

### Известные отзывы с низкой оценкой

В `src/data/reviews.generated.ts` лежит полное распределение оценок
(включая 19 отзывов с 1★). В интерфейсе показываются только содержательные
5★-отзывы, но раздел «Отзывы» честно говорит, что отзывы с другими оценками
доступны по ссылке в 2ГИС, и не утверждает, что список полный.

---

## Лицензия и источники

Данные о компании, отзывы и фотографии — 2ГИС
(карточка `70000001056265130`). Отзывы цитируются дословно с указанием
авторства, фотографии — с указанием автора. Перед коммерческим запуском
владельцу стоит подтвердить права на использование фотографий.
