import { business } from '@/data/business';

/**
 * Canonical site URL.
 * NEXT_PUBLIC_SITE_URL must be the real production origin (no trailing slash)
 * — it feeds canonical tags, Open Graph URLs, the sitemap and the JSON-LD.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

export const siteMeta = {
  name: business.name,
  title: 'Токио — автосервис в Кокшетау | Запись на ремонт автомобиля',
  shortTitle: 'Токио — автосервис в Кокшетау',
  description:
    `Автосервис «Токио» в Кокшетау: диагностика, развал-схождение, ходовая, двигатель, ` +
    `тормозная система, шиномонтаж. Рейтинг ${business.rating.value} в 2ГИС ` +
    `(${business.rating.ratingsCount} оценок). ${business.address.streetShort}. ` +
    `Ежедневно 09:00–20:00. Онлайн-запись за минуту.`,
  locale: 'ru_KZ',
  ogImage: '/og.jpg',
} as const;

export function absoluteUrl(pathname = '/'): string {
  return `${siteUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}
