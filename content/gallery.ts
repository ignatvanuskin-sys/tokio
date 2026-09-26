/**
 * ГАЛЕРЕЯ.
 *
 * Здесь РЕАЛЬНЫЕ фотографии автосервиса «Токио», скачанные из фотогалереи
 * карточки 2ГИС (17 кадров, выгружено 2026-09-26):
 *   https://2gis.kz/kokshetau/gallery/firm/70000001056265130
 *
 * Файлы лежат в `public/images/photos/` в формате WebP (сжаты из оригиналов
 * 2ГИС, ширина 1440 px). Подписи описывают то, что реально видно в кадре —
 * кадры просмотрены вручную, а не подписаны автоматически.
 *
 * ВНИМАНИЕ ВЛАДЕЛЬЦУ: на скачанных из 2ГИС файлах есть небольшой штамп «2GIS».
 * Для финального запуска положите в `public/images/photos/` те же кадры без
 * штампа — код менять не нужно, имена файлов те же.
 */

export type GalleryImage = {
  src: string;
  alt: string;
  /** true — изображение демонстрационное, а не реальное фото компании. */
  isDemo: boolean;
};

export const GALLERY: GalleryImage[] = [
  {
    src: '/images/photos/p03.webp',
    alt: 'Стенд развал-схождения: измерительный датчик закреплён на колесе автомобиля на подъёмнике',
    isDemo: false,
  },
  {
    src: '/images/photos/p08.webp',
    alt: 'Общий вид цеха: несколько автомобилей в работе на подъёмниках',
    isDemo: false,
  },
  {
    src: '/images/photos/p01.webp',
    alt: 'Автомобиль на подъёмнике G-Energy, оранжевая стойка подъёмника, работа снизу',
    isDemo: false,
  },
  {
    src: '/images/photos/p14.webp',
    alt: 'Мастер держит в руке новый масляный фильтр TAKAYAMA',
    isDemo: false,
  },
  {
    src: '/images/photos/p06.webp',
    alt: 'Автомобиль на подъёмнике G-Energy внутри цеха',
    isDemo: false,
  },
  {
    src: '/images/photos/p11.webp',
    alt: 'Открытый моторный отсек автомобиля — работы по двигателю',
    isDemo: false,
  },
  {
    src: '/images/photos/p13.webp',
    alt: 'Toyota Camry поднята на двухстоечном подъёмнике в цехе сервиса',
    isDemo: false,
  },
  {
    src: '/images/photos/p12.webp',
    alt: 'Рабочая зона цеха: подъёмник, инструмент, стеллажи',
    isDemo: false,
  },
  {
    src: '/images/photos/p04.webp',
    alt: 'Toyota Camry на платформе эвакуатора перед въездом в сервис',
    isDemo: false,
  },
  {
    src: '/images/photos/p09.webp',
    alt: 'Ночная съёмка: внедорожник на платформе эвакуатора у освещённого сервиса',
    isDemo: false,
  },
  {
    src: '/images/photos/p07.webp',
    alt: 'Белая Toyota Camry на площадке перед зданием сервиса',
    isDemo: false,
  },
  {
    src: '/images/photos/p10.webp',
    alt: 'Здание сервиса с двумя боксами и воротами в оранжевых рамах',
    isDemo: false,
  },
  {
    src: '/images/photos/p15.webp',
    alt: 'Вход в бокс с оранжевой рамой ворот, внутри виден автомобиль на подъёмнике',
    isDemo: false,
  },
  {
    src: '/images/photos/p05.webp',
    alt: 'Фасад здания автосервиса и площадка перед ним',
    isDemo: false,
  },
  {
    src: '/images/photos/p16.webp',
    alt: 'Кузовной элемент автомобиля, подготовленный к окрасочным работам',
    isDemo: false,
  },
  {
    src: '/images/photos/p02.webp',
    alt: 'Мастер осматривает синий Jaguar у входа в сервис',
    isDemo: false,
  },
  {
    src: '/images/photos/p17.webp',
    alt: 'Вид из салона автомобиля в освещённый цех сервиса',
    isDemo: false,
  },
];

/** Обложка первого экрана. Реальная фотография цеха сервиса. */
export const HERO_IMAGE = {
  src: '/images/hero.webp',
  alt: 'Цех автосервиса «Токио»: автомобили на подъёмниках',
  isDemo: false,
} as const;

/** Облегчённый кадр для телефонов (первый экран рисуется быстрее). */
export const HERO_IMAGE_MOBILE = {
  src: '/images/hero-mobile.webp',
  alt: 'Работа на подъёмнике в автосервисе «Токио»',
} as const;

/** Есть ли в галерее демонстрационные изображения — чтобы показать подпись. */
export const HAS_DEMO_IMAGES = GALLERY.some((image) => image.isDemo);
