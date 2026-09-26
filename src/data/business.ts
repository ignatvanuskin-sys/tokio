/**
 * ============================================================================
 * SINGLE SOURCE OF TRUTH FOR BUSINESS FACTS
 * ============================================================================
 *
 * SOURCE: 2GIS — company card for «Токио», Кокшетау
 *         https://2gis.kz/kokshetau/firm/70000001056265130
 *         Captured: 2026-09-26 (see SOURCE.capturedAt)
 *
 * RULES FOR THIS FILE
 *  1. Every value below is either (a) taken from the 2GIS company card, or
 *     (b) explicitly marked with `source: 'OWNER'` / `'ASSUMPTION'`.
 *  2. Never invent phone numbers, awards, hours, services or prices here.
 *     If 2GIS does not state it, it does not belong in this file.
 *  3. When 2GIS changes, update `SOURCE.capturedAt` and the affected values.
 * ============================================================================
 */

export const SOURCE = {
  card: 'https://2gis.kz/kokshetau/firm/70000001056265130',
  firmId: '70000001056265130',
  orgId: '70000001056265129',
  capturedAt: '2026-09-26',
} as const;

export type Award = {
  /** Award programme name as published on 2GIS. */
  title: string;
  /** Nomination as published on 2GIS. */
  nomination: string;
  /** 2GIS rubric the nomination belongs to. */
  rubric: string;
  /**
   * 2GIS shows the "Лучший автосервис 2026" nomination badge on several
   * companies, i.e. this is a NOMINATION, not a confirmed win.
   * Do not upgrade this to "победитель" without written confirmation.
   */
  status: 'nominee';
};

export const business = {
  name: 'Токио',
  /** Used in <title> and schema.org. */
  fullName: 'Токио — автосервис в Кокшетау',
  category: 'Автосервис',
  categoryLong: 'Легковой автосервис',
  city: 'Кокшетау',
  region: 'Акмолинская область',
  country: 'KZ',
  countryName: 'Казахстан',

  /**
   * SOURCE: 2GIS address block: "Улица Толеу Сулейменова, 25а", Кокшетау,
   * Кокшетау городская администрация, 020000, 1 этаж.
   */
  address: {
    street: 'улица Толеу Сулейменова, 25а',
    streetShort: 'Толеу Сулейменова, 25а',
    city: 'Кокшетау',
    postalCode: '020000',
    floor: '1 этаж',
    full: 'Кокшетау, улица Толеу Сулейменова, 25а',
  },

  /**
   * SOURCE: 2GIS geoPosition { lon: 69.396345, lat: 53.309227 } — the exact
   * point 2GIS uses to build a route to this branch. Safe for schema.org geo.
   */
  geo: { lat: 53.309227, lon: 69.396345 },

  /**
   * SOURCE: 2GIS contact block. Single published number.
   * WhatsApp confirmed: 2GIS exposes a wa.me link for 77789988877.
   */
  phone: {
    e164: '+77789988877',
    display: '+7 (778) 998-88-77',
    /** Pretty format used in dense mobile UI. */
    short: '+7 778 998 88 77',
  },

  whatsapp: {
    /** SOURCE: 2GIS WhatsApp contact for this branch. */
    number: '77789988877',
    url: 'https://wa.me/77789988877',
    /** Deep link that keeps the 2GIS greeting the business already uses. */
    deepLink:
      'https://wa.me/77789988877?text=' +
      encodeURIComponent('Здравствуйте! Пишу с сайта — хочу записаться на сервис.'),
  },

  /**
   * SOURCE: 2GIS contact block — instagram.com/tokyo_kokshetau
   */
  instagram: {
    handle: '@tokyo_kokshetau',
    url: 'https://www.instagram.com/tokyo_kokshetau/',
  },

  /**
   * SOURCE: 2GIS schedule — "Открыто · Ежедневно с 09:00 до 20:00".
   * Seven days a week, no day off published.
   */
  hours: {
    label: 'Ежедневно',
    open: '09:00',
    close: '20:00',
    display: 'Ежедневно с 09:00 до 20:00',
    /** 0 = Sunday … 6 = Saturday — open every day. */
    openDays: [0, 1, 2, 3, 4, 5, 6] as const,
  },

  /**
   * SOURCE: 2GIS rating + reviews panel.
   *   · rating 4.8 (branch_rating, confirmed)
   *   · 166 text reviews ("Отзывы" tab counter)
   *   · 332 ratings total ("Всего 332 оценки")
   * NOTE: the count of ratings moves over time — a prompt drafted earlier
   * quoted 329. Values here are what the card showed on SOURCE.capturedAt.
   */
  rating: {
    value: 4.8,
    ratingsCount: 332,
    reviewsCount: 166,
    bestRating: 5,
  },

  awards: [
    {
      title: '2GIS Awards 2026',
      nomination: 'Лучший автосервис 2026',
      rubric: 'Авторемонт',
      status: 'nominee',
    },
  ] as Award[],

  /**
   * SOURCE: 2GIS "Особенности" + building info. Nothing added.
   */
  features: [
    { label: 'Wi-Fi для клиентов', confirmedBy: '2GIS' },
    { label: '2 парковки', confirmedBy: '2GIS' },
    { label: 'Отдельный вход, 1 этаж', confirmedBy: '2GIS' },
    { label: 'Остановка «Звоночек» — 150 м, 1 мин', confirmedBy: '2GIS' },
  ],

  /**
   * SOURCE: 2GIS "Способы оплаты".
   */
  payments: [
    'Оплата картой',
    'Наличный расчёт',
    'Оплата через банк',
    'Перевод с карты',
    'Оплата по QR-коду',
  ],

  /**
   * SOURCE: 2GIS "Марки" — the makes this branch explicitly services.
   * 15 makes published on the card.
   */
  brands: [
    'Audi',
    'BMW',
    'Cadillac',
    'Changan',
    'Chery',
    'Chevrolet',
    'Honda',
    'Hyundai',
    'Infiniti',
    'Kia',
    'Lada (ВАЗ)',
    'Lexus',
    'Mazda',
    'Nissan',
    'Toyota',
  ],

  /**
   * SOURCE: 2GIS registered headings (справочник) for this branch.
   * These are the categories 2GIS itself lists under "В справочнике".
   */
  catalogCategories: [
    'Легковой автосервис',
    'Обслуживание автомобильных климатических систем',
    'Ремонт бензиновых двигателей',
    'Компьютерная диагностика автомобилей',
    'Ремонт ходовой части автомобиля',
    'Развал-схождение',
    'Замена масла',
    'Ремонт инжекторов',
    'Ремонт электронных систем авто',
    'Полимерная порошковая окраска',
    'Ремонт АКПП',
    'Ремонт МКПП',
    'Шиномонтаж',
  ],

  /**
   * OWNER — intentionally left empty. There is no published company
   * description on the 2GIS card, and we do not write one on the owner's
   * behalf. The site renders a neutral placeholder when this is empty.
   */
  description: '',

  /**
   * OWNER — no prices are published anywhere on the 2GIS card.
   * The "Цены" tab exists but all 4 entries read "Цена не указана"
   * (радиаторы печей, антифризы Nord). Therefore the site must never show
   * a number for a service; it shows `priceNote` instead.
   */
  hasPublishedPrices: false,
  priceNote: 'Стоимость — после диагностики',
  priceNoteLong:
    'Прайс-лист не публикуется: итоговая цена зависит от модели, состояния узла и стоимости запчастей. Точную сумму назовём после диагностики — до начала работ.',

  /** Total number of photos on the 2GIS gallery. */
  galleryCount: 17,
} as const;

/** Route deep-links — all point at the real 2GIS card. */
export const links = {
  card: SOURCE.card,
  reviews: `${SOURCE.card}/tab/reviews`,
  photos: 'https://2gis.kz/kokshetau/gallery/firm/70000001056265130',
  /** 2GIS route builder pre-filled with the branch's exact coordinates. */
  route: `https://2gis.kz/kokshetau/directions/points/%7C${business.geo.lon}%2C${business.geo.lat}%3B${SOURCE.firmId}`,
  /** Fallback for devices without the 2GIS app. */
  mapSearch: 'https://2gis.kz/kokshetau/search/' + encodeURIComponent('Токио автосервис Толеу Сулейменова 25а'),
} as const;

/**
 * Opening-state helper. Computed on the server (venue timezone) and refreshed
 * on the client — never guessed from the visitor's own clock.
 */
export function isOpenNow(now: Date, timeZone: string): boolean {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const hh = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const mm = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  const minutes = hh * 60 + mm;
  const open = 9 * 60;
  const close = 20 * 60;
  return minutes >= open && minutes < close;
}
