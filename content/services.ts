/**
 * КАТАЛОГ УСЛУГ.
 *
 * ВАЖНО: вкладка «Цены» карточки 2ГИС «Токио» содержит только позиции
 * «Цена не указана» — опубликованного прайса нет. Поэтому в каталоге:
 *   • нет ни одной выдуманной цены (везде `priceFrom: null`);
 *   • перечень собран из РУБРИК и блока «Услуги» карточки — это заявленные
 *     самой компанией направления работ, а не придуманные услуги.
 *
 * `durationMin` в карточке не указана. Это ВНУТРЕННИЙ параметр, который влияет
 * только на сетку слотов записи, а не факт, публикуемый на сайте.
 */

export type Service = {
  slug: string;
  title: string;
  /** Короткое описание для карточки каталога. */
  summary: string;
  /** Откуда взято направление — чтобы владелец видел источник и мог поправить. */
  source: string;
  icon:
    | 'diagnostics'
    | 'alignment'
    | 'suspension'
    | 'oil'
    | 'engine'
    | 'injector'
    | 'gearbox'
    | 'brakes'
    | 'wheel'
    | 'electric'
    | 'climate'
    | 'paint'
    | 'warehouse';
  /** Цена в тенге. null — цены в карточке нет. */
  priceFrom: number | null;
  /** Длительность приёма в минутах: в карточке не указана, влияет только на сетку слотов. */
  durationMin: number;
  featured: boolean;
};

export const DEFAULT_DURATION_MIN = 60;

export const SERVICES: Service[] = [
  {
    slug: 'diagnostics',
    title: 'Компьютерная диагностика',
    summary:
      'Считываем ошибки и проверяем узлы по факту, чтобы назвать причину, а не менять детали наугад.',
    source: 'Рубрика 2ГИС: «Компьютерная диагностика автомобилей»',
    icon: 'diagnostics',
    priceFrom: null,
    durationMin: 60,
    featured: true,
  },
  {
    slug: 'alignment',
    title: 'Развал-схождение',
    summary:
      'Регулировка углов установки колёс на стенде. Нужна, когда машину тянет в сторону или съедает резину.',
    source: 'Рубрика 2ГИС: «Развал-схождение»',
    icon: 'alignment',
    priceFrom: null,
    durationMin: 60,
    featured: true,
  },
  {
    slug: 'suspension',
    title: 'Ремонт ходовой части',
    summary:
      'Стуки, скрипы, люфты. Разбираем подвеску, находим изношенный узел и меняем именно его.',
    source: 'Рубрика 2ГИС: «Ремонт ходовой части автомобиля»',
    icon: 'suspension',
    priceFrom: null,
    durationMin: 120,
    featured: true,
  },
  {
    slug: 'air-suspension',
    title: 'Ремонт пневмоподвески',
    summary:
      'Отдельное направление для машин с пневматикой: ищем утечку, восстанавливаем работу стоек и компрессора.',
    source: 'Услуги 2ГИС: «Ремонт пневмоподвески»',
    icon: 'suspension',
    priceFrom: null,
    durationMin: 120,
    featured: false,
  },
  {
    slug: 'oil-service',
    title: 'Замена масла и ТО',
    summary:
      'Масло, фильтры и базовое обслуживание. Приезжайте со своими расходниками или возьмите на месте.',
    source: 'Рубрика 2ГИС: «Замена масла»',
    icon: 'oil',
    priceFrom: null,
    durationMin: 45,
    featured: true,
  },
  {
    slug: 'engine',
    title: 'Ремонт двигателей',
    summary:
      'Ремонт бензиновых двигателей: от локальных работ до механической обработки узлов — шлифовки и гильзовки.',
    source: 'Рубрика 2ГИС: «Ремонт бензиновых двигателей»; услуги «Шлифовка», «Гильзовка», «Аппаратная»',
    icon: 'engine',
    priceFrom: null,
    durationMin: 180,
    featured: true,
  },
  {
    slug: 'injectors',
    title: 'Ремонт инжекторов',
    summary: 'Проверяем и восстанавливаем форсунки, если двигатель работает неровно или вырос расход.',
    source: 'Рубрика 2ГИС: «Ремонт инжекторов»',
    icon: 'injector',
    priceFrom: null,
    durationMin: 120,
    featured: false,
  },
  {
    slug: 'transmission',
    title: 'Ремонт АКПП и МКПП',
    summary: 'Диагностика и ремонт коробок передач — автоматических и механических.',
    source: 'Рубрики 2ГИС: «Ремонт АКПП», «Ремонт МКПП»',
    icon: 'gearbox',
    priceFrom: null,
    durationMin: 180,
    featured: false,
  },
  {
    slug: 'brakes',
    title: 'Тормозная система',
    summary: 'Проточка тормозных дисков и замена колодок — когда появилась вибрация при торможении.',
    source: 'Услуги 2ГИС: «Проточка тормозных дисков», «Замена колодок»',
    icon: 'brakes',
    priceFrom: null,
    durationMin: 90,
    featured: true,
  },
  {
    slug: 'tyres',
    title: 'Шиномонтаж',
    summary: 'Сезонная смена шин, балансировка и ремонт порезов.',
    source: 'Рубрика 2ГИС: «Шиномонтаж»; услуга «Ремонт порезов»',
    icon: 'wheel',
    priceFrom: null,
    durationMin: 60,
    featured: false,
  },
  {
    slug: 'rims',
    title: 'Диски: правка и покраска',
    summary: 'Правка (прокатка) дисков после ям и покраска — вернуть геометрию и внешний вид.',
    source: 'Услуги 2ГИС: «Правка / Прокатка дисков», «Покраска дисков»',
    icon: 'wheel',
    priceFrom: null,
    durationMin: 120,
    featured: false,
  },
  {
    slug: 'electronics',
    title: 'Ремонт электронных систем',
    summary: 'Датчики, блоки, проводка и ошибки на панели приборов.',
    source: 'Рубрика 2ГИС: «Ремонт электронных систем авто»',
    icon: 'electric',
    priceFrom: null,
    durationMin: 90,
    featured: false,
  },
  {
    slug: 'climate',
    title: 'Кондиционер и климат',
    summary: 'Обслуживание автомобильных климатических систем: заправка и поиск утечек.',
    source: 'Рубрика 2ГИС: «Обслуживание автомобильных климатических систем»',
    icon: 'climate',
    priceFrom: null,
    durationMin: 90,
    featured: false,
  },
  {
    slug: 'powder-coating',
    title: 'Полимерная порошковая окраска',
    summary: 'Порошковая окраска деталей — стойкое покрытие для дисков и металлических элементов.',
    source: 'Рубрика 2ГИС: «Полимерная порошковая окраска»',
    icon: 'paint',
    priceFrom: null,
    durationMin: 120,
    featured: false,
  },
  {
    slug: 'warm-box',
    title: 'Аренда тёплого бокса',
    summary:
      'Делаете сами — но в тепле, на подъёмнике и с доступом к инструменту. Свободное время уточните по телефону.',
    source: 'Услуги 2ГИС: «Аренда тёплого бокса»',
    icon: 'warehouse',
    priceFrom: null,
    durationMin: 120,
    featured: true,
  },
  {
    slug: 'unknown',
    title: 'Не знаю, что сломалось',
    summary:
      'Опишите симптомы — мастер осмотрит автомобиль, определит причину и скажет, что делать дальше.',
    source: 'Пункт для онлайн-записи: помогает выбрать время тем, кто не знает причину неисправности',
    icon: 'diagnostics',
    priceFrom: null,
    durationMin: 60,
    featured: false,
  },
];

export function findService(slug: string): Service | undefined {
  return SERVICES.find((service) => service.slug === slug);
}

export function findServiceByTitle(title: string): Service | undefined {
  return SERVICES.find((service) => service.title === title);
}

/** Цена либо нейтральная формулировка — выдуманных цен на сайте быть не должно. */
export function priceLabel(service: Service): string {
  return service.priceFrom === null
    ? 'Стоимость уточняется'
    : `от ${service.priceFrom.toLocaleString('ru-RU')} ₸`;
}
