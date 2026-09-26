/**
 * ============================================================================
 * PHOTO GALLERY  —  REAL PHOTOGRAPHS FROM THE COMPANY'S 2GIS CARD
 * ============================================================================
 *
 * SOURCE: 2GIS gallery for «Токио» (firm 70000001056265130), 17 photos,
 *         retrieved 2026-09-26 via the site's public photo API.
 *         Originals: .research/photos_raw/pNN.jpg
 *         Optimised: /public/photos/pNN-<width>.webp (see scripts/optimize-images.mjs)
 *
 * Every `alt` below describes what is actually visible in the frame — the
 * photos were reviewed by eye, not auto-captioned.
 *
 * ⚠ OWNER ACTION (see README §Owner checklist): the files served by 2GIS carry
 * a small "2GIS" watermark in the corner. They are good enough to ship, but for
 * the final launch the owner should supply the same 17 originals without the
 * watermark. Dropping them into .research/photos_raw and re-running
 * `npm run images` replaces everything without touching this file.
 * ============================================================================
 */

export type GalleryCategory = 'inside' | 'outside' | 'work';

export type GalleryItem = {
  /** id of the optimised asset (see src/data/photo-assets.generated.ts) */
  id: string;
  category: GalleryCategory;
  /** Factual description of the frame. */
  alt: string;
  /** Short label shown in the fullscreen viewer. */
  caption: string;
  /** 2GIS contributor credit, as published. */
  credit: string;
};

export const galleryCategories: { id: GalleryCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Все 17' },
  { id: 'inside', label: 'Внутри' },
  { id: 'outside', label: 'Снаружи' },
  { id: 'work', label: 'Работа' },
];

export const gallery: GalleryItem[] = [
  {
    id: 'p03',
    category: 'work',
    alt: 'Стенд развал-схождения: измерительный датчик закреплён на колесе автомобиля, поднятого на подъёмнике',
    caption: 'Развал-схождение на стенде',
    credit: 'MYB 363 · 2GIS',
  },
  {
    id: 'p08',
    category: 'inside',
    alt: 'Общий вид цеха: три автомобиля в работе на подъёмниках, металлические фермы под потолком',
    caption: 'Цех целиком',
    credit: 'Бауржан Капаров · 2GIS',
  },
  {
    id: 'p01',
    category: 'work',
    alt: 'Автомобиль на подъёмнике G-Energy, оранжевая стойка подъёмника, работа снизу',
    caption: 'Работа на подъёмнике',
    credit: 'Бауржан Капаров · 2GIS',
  },
  {
    id: 'p14',
    category: 'work',
    alt: 'Мастер держит в руке новый масляный фильтр TAKAYAMA',
    caption: 'Расходники для замены масла',
    credit: 'Kulzhabek · 2GIS',
  },
  {
    id: 'p06',
    category: 'inside',
    alt: 'Автомобиль на подъёмнике G-Energy внутри цеха, вид со стороны бокса',
    caption: 'Внутри цеха',
    credit: 'MYB 363 · 2GIS',
  },
  {
    id: 'p11',
    category: 'work',
    alt: 'Открытый моторный отсек автомобиля — работы по двигателю',
    caption: 'Ремонт двигателя',
    credit: 'DUKESHI SAN · 2GIS',
  },
  {
    id: 'p13',
    category: 'inside',
    alt: 'Toyota Camry поднята на двухстоечном подъёмнике в цехе сервиса',
    caption: 'На подъёмнике',
    credit: 'Konstantin Saldin · 2GIS',
  },
  {
    id: 'p12',
    category: 'inside',
    alt: 'Рабочая зона цеха: подъёмник, инструмент, стеллажи',
    caption: 'Рабочая зона',
    credit: 'just like · 2GIS',
  },
  {
    id: 'p04',
    category: 'outside',
    alt: 'Toyota Camry на платформе эвакуатора перед въездом в сервис',
    caption: 'Приёмка автомобиля',
    credit: 'Damir Bekbauov · 2GIS',
  },
  {
    id: 'p09',
    category: 'outside',
    alt: 'Ночная съёмка: внедорожник на платформе эвакуатора у освещённого сервиса',
    caption: 'Работа вечером',
    credit: 'Елена Тасыбекова · 2GIS',
  },
  {
    id: 'p07',
    category: 'outside',
    alt: 'Белая Toyota Camry на площадке перед зданием сервиса',
    caption: 'После работ',
    credit: 'Azamat Alibekov · 2GIS',
  },
  {
    id: 'p10',
    category: 'outside',
    alt: 'Здание сервиса с двумя боксами и воротами в оранжевых рамах',
    caption: 'Боксы сервиса',
    credit: 'Saul Goodman · 2GIS',
  },
  {
    id: 'p15',
    category: 'outside',
    alt: 'Вход в бокс с оранжевой рамой ворот, внутри виден автомобиль на подъёмнике',
    caption: 'Въезд в бокс',
    credit: 'MYB 363 · 2GIS',
  },
  {
    id: 'p05',
    category: 'outside',
    alt: 'Фасад здания автосервиса и гравийная площадка перед ним',
    caption: 'Как нас найти',
    credit: 'Saul Goodman · 2GIS',
  },
  {
    id: 'p16',
    category: 'work',
    alt: 'Кузовной элемент автомобиля, подготовленный к окрасочным работам',
    caption: 'Кузовные работы',
    credit: 'Kokshtau 03 · 2GIS',
  },
  {
    id: 'p02',
    category: 'work',
    alt: 'Мастер осматривает синий Jaguar у входа в сервис',
    caption: 'Осмотр автомобиля',
    credit: 'Konstantin Saldin · 2GIS',
  },
  {
    id: 'p17',
    category: 'work',
    alt: 'Вид из салона автомобиля в освещённый цех сервиса',
    caption: 'Заезд в цех',
    credit: 'just like · 2GIS',
  },
];

/** Number of photos in the real 2GIS gallery for this branch. */
export const galleryCount = gallery.length;

/**
 * Purposeful placement — the same 17 photos used as narrative, not a raw grid.
 * Every id referenced here exists in `gallery` above.
 */
export const photoRoles = {
  /**
   * Hero. Two crops so the first screen is composed for the actual device:
   * a portrait frame for phones, a wide frame for desktop.
   * Only ONE of them is ever downloaded (<picture> + media).
   */
  heroMobile: 'p03',
  heroDesktop: 'p08',

  /** Trust band — one detail shot that proves real consumables are used. */
  trustDetail: 'p14',

  /** "Как проходит визит" — 4 steps, each with the photo that shows it. */
  visitSteps: {
    request: 'p04',
    diagnostics: 'p03',
    repair: 'p01',
    handover: 'p07',
  },

  /** Service cards. */
  servicePhotoOverrides: {
    'remont-dvigatelya': 'p11',
    shinomontazh: 'p16',
  },
} as const;
