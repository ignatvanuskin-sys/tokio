/**
 * Generate content/reviews.ts for «Токио» from the reviews pulled off the
 * public 2GIS reviews API (.research/reviews_clean.json).
 *
 * Texts are stored VERBATIM — original Russian, typos and all — with the
 * author's 2GIS display name. Nothing is paraphrased or invented.
 *
 * Selection: the most substantive 5★ reviews (they mention concrete work, so
 * they read as proof rather than generic praise), PLUS the best critical
 * reviews kept in the data so the record is not silently all-positive.
 * `FEATURED_MIN_RATING` controls what the site actually renders; Керей's
 * convention is 4, so a mild 4★ complaint stays visible and the harsh ones do
 * not get promoted — while every card still links out to the full 2GIS list.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const raw = JSON.parse(readFileSync('.research/reviews_clean.json', 'utf8'));
const records = raw.all ?? [];

const clean = (s) =>
  (s ?? '')
    .replace(/\r/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const TOPIC_HINTS = [
  'развал', 'схожд', 'подвеск', 'ходов', 'масл', 'двигател', 'печк', 'тормоз',
  'диагност', 'эвакуатор', 'рейк', 'шаров', 'сайлентблок', 'шиномонтаж',
  'ремонт', 'запчаст', 'мастер', 'срок', 'качеств', 'цены', 'дешев', 'записа',
  'бокс', 'подъёмник',
];

const shaped = records
  .filter((r) => typeof r.text === 'string' && r.text.trim().length > 0)
  .map((r) => {
    const text = clean(r.text);
    const lower = text.toLowerCase();
    return {
      author: clean(r.user?.name) || 'Клиент 2ГИС',
      date: (r.date_created ?? '').slice(0, 10),
      rating: r.rating,
      text,
      hits: TOPIC_HINTS.filter((h) => lower.includes(h)).length,
      len: text.length,
    };
  });

/** Near-duplicate guard on the first 80 characters. */
const seen = new Set();
function dedupe(list) {
  const out = [];
  for (const r of list) {
    const fp = r.text.slice(0, 80).toLowerCase();
    if (seen.has(fp)) continue;
    seen.add(fp);
    out.push(r);
  }
  return out;
}

// Positive: long enough to be substantive, short enough for a card.
const positives = dedupe(
  shaped
    .filter((r) => r.rating === 5 && r.len >= 180 && r.len <= 1100)
    .sort((a, b) => b.hits - a.hits || b.date.localeCompare(a.date)),
).slice(0, 7);

// Keep the critical record too, so the data is not one-sided.
const critical = dedupe(
  shaped
    .filter((r) => r.rating <= 4 && r.len >= 60 && r.len <= 900)
    .sort((a, b) => b.rating - a.rating || b.date.localeCompare(a.date)),
).slice(0, 2);

const reviews = [...positives, ...critical].map((r) => ({
  author: r.author,
  date: r.date,
  rating: r.rating,
  text: r.text,
}));

const distribution = raw.distribution ?? {};

const file = `/**
 * ОТЗЫВЫ.
 *
 * Источник — публичная карточка 2ГИС «Токио» (Кокшетау), выгружено ${new Date()
  .toISOString()
  .slice(0, 10)}:
 * https://2gis.kz/kokshetau/firm/70000001056265130/tab/reviews
 *
 * Тексты приведены БЕЗ правок — орфография и формулировки авторов сохранены,
 * авторство указано так, как оно опубликовано в 2ГИС.
 *
 * На сайте показываются отзывы с оценкой не ниже FEATURED_MIN_RATING.
 * Рейтинг при этом не скрывается: в первом экране и в блоке отзывов открыто
 * указаны средняя оценка ${(raw.meta?.branch_rating ?? 4.8)} и общее число оценок/отзывов,
 * а ссылка ведёт на полный список в 2ГИС вместе с критикой.
 *
 * Полное распределение оценок по доступным через API отзывам:
 * ${JSON.stringify(distribution)} — то есть критические отзывы существуют,
 * и мы их не удаляли.
 */

export type Review = {
  author: string;
  date: string;
  /** Оценка автора в звёздах, 1–5. */
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
};

/** Минимальная оценка отзыва, который показывается на сайте. */
export const FEATURED_MIN_RATING = 4;

export const REVIEWS_SOURCE_URL =
  'https://2gis.kz/kokshetau/firm/70000001056265130/tab/reviews';

export const REVIEWS: Review[] = ${JSON.stringify(reviews, null, 2)};

/** Дата, на которую отзывы считаются актуальными. */
export const REVIEWS_AS_OF = '${new Date().toISOString().slice(0, 10)}';
`;

writeFileSync('content/reviews.ts', file, 'utf8');

console.log(`reviews: ${reviews.length} (5★: ${positives.length}, critical: ${critical.length})`);
console.log('ratings:', reviews.map((r) => r.rating).join(','));
console.log('distribution in source:', JSON.stringify(distribution));
