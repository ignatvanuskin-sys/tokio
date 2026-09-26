/**
 * ============================================================================
 * SERVICE CATALOGUE
 * ============================================================================
 *
 * SOURCE: every service below maps 1:1 to an item published on the 2GIS card
 *         of «Токио» (firm 70000001056265130) — either the "Услуги" block or
 *         the "В справочнике" heading list. `sourceRef` records which one.
 *
 * PRICES: the 2GIS "Цены" tab contains 4 entries and every one reads
 *         "Цена не указана". There is NO published price for any repair.
 *         Therefore no service below carries a number — the UI shows
 *         `business.priceNote` instead. Do not add prices without the owner's
 *         written price list.
 *
 * DURATION: 2GIS publishes no work durations. `duration` is intentionally
 *         absent; the UI omits the field rather than inventing a range.
 * ============================================================================
 */

import { business } from './business';

export type ServiceGroup = 'diagnostics' | 'engine' | 'chassis' | 'brakes' | 'wheels' | 'electric' | 'body' | 'space';

export const serviceGroups: { id: ServiceGroup; label: string; blurb: string }[] = [
  { id: 'diagnostics', label: 'Диагностика', blurb: 'Находим причину до того, как что-то менять' },
  { id: 'engine', label: 'Двигатель', blurb: 'От замены масла до шлифовки и гильзовки' },
  { id: 'chassis', label: 'Ходовая и подвеска', blurb: 'включая пневмоподвеску' },
  { id: 'brakes', label: 'Тормозная система', blurb: 'Диски, колодки, контуры' },
  { id: 'wheels', label: 'Колёса и шины', blurb: 'Шиномонтаж, правка и покраска дисков' },
  { id: 'electric', label: 'Электрика и климат', blurb: 'Электронные системы, инжекторы, кондиционер' },
  { id: 'body', label: 'Кузов и окраска', blurb: 'Полимерная порошковая окраска' },
  { id: 'space', label: 'Тёплый бокс в аренду', blurb: 'Своими руками, но в тепле и с подъёмником' },
];

export type Service = {
  slug: string;
  title: string;
  group: ServiceGroup;
  /** One-sentence explanation written for a non-technical car owner. */
  summary: string;
  /** What the customer actually gets. Only items confirmed by 2GIS. */
  includes: string[];
  /** Photo from the real 2GIS gallery that shows this work. */
  photo: string;
  /** Which 2GIS block this service comes from. */
  sourceRef: 'Услуги 2GIS' | 'Справочник 2GIS';
  /** Featured on the home page. */
  featured?: boolean;
};

export const services: Service[] = [
  {
    slug: 'kompyuternaya-diagnostika',
    title: 'Компьютерная диагностика',
    group: 'diagnostics',
    summary:
      'Считываем ошибки и проверяем узлы по факту, чтобы назвать причину, а не менять детали наугад.',
    includes: ['Компьютерная диагностика автомобилей', 'Проверка кодов неисправностей'],
    photo: 'p13',
    sourceRef: 'Справочник 2GIS',
    featured: true,
  },
  {
    slug: 'razval-shozhdenie',
    title: 'Развал-схождение',
    group: 'diagnostics',
    summary:
      'Регулируем углы установки колёс на стенде. Помогает, когда машину тянет в сторону или съедает резину.',
    includes: ['Развал-схождение', 'Проверка углов установки колёс'],
    photo: 'p03',
    sourceRef: 'Справочник 2GIS',
    featured: true,
  },
  {
    slug: 'remont-hodovoy',
    title: 'Ремонт ходовой части',
    group: 'chassis',
    summary:
      'Стуки, скрипы, люфты. Разбираем подвеску, находим изношенный узел и меняем именно его.',
    includes: ['Ремонт ходовой части автомобиля', 'Замена рычагов, шаровых, сайлентблоков'],
    photo: 'p01',
    sourceRef: 'Услуги 2GIS',
    featured: true,
  },
  {
    slug: 'pnevmopodveska',
    title: 'Ремонт пневмоподвески',
    group: 'chassis',
    summary:
      'Отдельное направление для машин с пневматикой: ищем утечку и восстанавливаем работу стоек и компрессора.',
    includes: ['Ремонт пневмоподвески'],
    photo: 'p06',
    sourceRef: 'Услуги 2GIS',
  },
  {
    slug: 'zamena-masla',
    title: 'Замена масла и ТО',
    group: 'engine',
    summary:
      'Масло, фильтры и базовое обслуживание. Можно приехать со своими расходниками или взять у нас.',
    includes: ['Замена масла', 'Магазин технических жидкостей на месте'],
    photo: 'p14',
    sourceRef: 'Услуги 2GIS',
    featured: true,
  },
  {
    slug: 'remont-dvigatelya',
    title: 'Ремонт двигателей',
    group: 'engine',
    summary:
      'Ремонт бензиновых двигателей: от локальных работ до механической обработки узлов.',
    includes: ['Ремонт бензиновых двигателей', 'Шлифовка', 'Гильзовка', 'Аппаратная'],
    photo: 'p11',
    sourceRef: 'Услуги 2GIS',
    featured: true,
  },
  {
    slug: 'remont-inzhektorov',
    title: 'Ремонт инжекторов',
    group: 'electric',
    summary:
      'Проверяем и восстанавливаем форсунки, если двигатель работает неровно или вырос расход.',
    includes: ['Ремонт инжекторов'],
    photo: 'p08',
    sourceRef: 'Справочник 2GIS',
  },
  {
    slug: 'remont-akpp-mkpp',
    title: 'Ремонт АКПП и МКПП',
    group: 'engine',
    summary: 'Диагностика и ремонт коробок — автоматических и механических.',
    includes: ['Ремонт АКПП', 'Ремонт МКПП'],
    photo: 'p12',
    sourceRef: 'Справочник 2GIS',
  },
  {
    slug: 'tormoznaya-sistema',
    title: 'Тормозная система',
    group: 'brakes',
    summary:
      'Проточка тормозных дисков и замена колодок — когда появилась вибрация при торможении.',
    includes: ['Проточка тормозных дисков', 'Замена колодок'],
    photo: 'p01',
    sourceRef: 'Услуги 2GIS',
    featured: true,
  },
  {
    slug: 'shinomontazh',
    title: 'Шиномонтаж',
    group: 'wheels',
    summary: 'Сезонная смена шин, балансировка и ремонт порезов.',
    includes: ['Шиномонтаж', 'Ремонт порезов'],
    photo: 'p16',
    sourceRef: 'Справочник 2GIS',
  },
  {
    slug: 'diski-pravka-pokraska',
    title: 'Диски: правка и покраска',
    group: 'wheels',
    summary:
      'Правка (прокатка) дисков после ям и покраска — вернуть геометрию и внешний вид.',
    includes: ['Правка / Прокатка дисков', 'Покраска дисков'],
    photo: 'p16',
    sourceRef: 'Услуги 2GIS',
    featured: true,
  },
  {
    slug: 'elektronnye-sistemy',
    title: 'Электронные системы авто',
    group: 'electric',
    summary: 'Ремонт электроники: датчики, блоки, проводка, ошибки на панели.',
    includes: ['Ремонт электронных систем авто'],
    photo: 'p13',
    sourceRef: 'Справочник 2GIS',
  },
  {
    slug: 'konditsioner',
    title: 'Кондиционер и климат',
    group: 'electric',
    summary:
      'Обслуживание автомобильных климатических систем: заправка и поиск утечек.',
    includes: ['Обслуживание автомобильных климатических систем'],
    photo: 'p12',
    sourceRef: 'Справочник 2GIS',
  },
  {
    slug: 'poroshkovaya-okraska',
    title: 'Полимерная порошковая окраска',
    group: 'body',
    summary: 'Порошковая окраска деталей — стойкое покрытие для дисков и металлических элементов.',
    includes: ['Полимерная порошковая окраска'],
    photo: 'p05',
    sourceRef: 'Справочник 2GIS',
  },
  {
    slug: 'arenda-teplogo-boksa',
    title: 'Аренда тёплого бокса',
    group: 'space',
    summary:
      'Делаете сами — но в тепле, на подъёмнике и с доступом к инструменту. Уточните свободное время по телефону или в WhatsApp.',
    includes: ['Аренда тёплого бокса'],
    photo: 'p15',
    sourceRef: 'Услуги 2GIS',
    featured: true,
  },
];

export const featuredServices = services.filter((s) => s.featured);

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function servicesByGroup(group: ServiceGroup): Service[] {
  return services.filter((s) => s.group === group);
}

/** Uniform price presentation — never a fabricated number. */
export const priceLabel = business.priceNote;
export const priceNoteLong = business.priceNoteLong;
