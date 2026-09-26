'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { GALLERY } from '@/content/gallery';

/**
 * Витрина фотографий в блоке «О компании».
 *
 * Раньше здесь выводились ВСЕ 17 кадров ровной сеткой 2×N: получалась свалка
 * фотографий, а не рассказ о сервисе, и на телефоне она превращалась в длинную
 * однообразную простыню.
 *
 * Теперь показываются шесть отобранных кадров в скомпонованной раскладке:
 * широкий ведущий кадр → асимметричная пара → ровный ряд из трёх. Раскладка
 * задана mobile-first и перестраивается на десктопе в шесть колонок.
 *
 * Остальные одиннадцать фотографий не выбрасываются: лайтбокс листает весь
 * набор из 17 кадров, и кнопка «Все 17 фото» открывает его. Так витрина
 * выглядит собранной, а полный набор остаётся доступен.
 */

/**
 * Отобранные кадры: цех → стенд → работа → деталь → зона → подъёмник.
 *
 * Телефон — основное устройство, поэтому на нём показываются ЧЕТЫРЕ кадра:
 * широкий ведущий, два квадрата в паре и широкий закрывающий. Шесть кадров
 * подряд на телефоне — это три экрана подряд без текста, что и делало блок
 * похожим на свалку фотографий. Пятый и шестой включаются с десктопа, где
 * раскладка становится шестиколоночной.
 */
const TILES: { src: string; span: string }[] = [
  // Ведущий кадр — цех целиком: сразу видно масштаб и что это живой сервис.
  { src: '/images/photos/p08.webp', span: 'col-span-2 aspect-[16/10] lg:col-span-6 lg:aspect-[21/9]' },
  // Стенд развал-схождения — самое сильное техническое доказательство.
  { src: '/images/photos/p03.webp', span: 'col-span-1 aspect-square lg:col-span-4 lg:aspect-[3/2]' },
  // Работа снизу на подъёмнике — вертикальный кадр в асимметричной паре.
  { src: '/images/photos/p01.webp', span: 'col-span-1 aspect-square lg:col-span-2 lg:aspect-[3/4]' },
  // Приёмка: машина приехала на эвакуаторе. Кадр горизонтальный (16:9),
  // поэтому широкий кроп на телефоне почти ничего не срезает.
  //
  // Раньше на этом месте стоял вертикальный кадр с масляным фильтром: в широком
  // кроп-боксе он оставлял половину кадра пустым размытым фоном. Такой кадр
  // хорошо работает квадратом, поэтому он переехал в десктопный ряд.
  {
    src: '/images/photos/p04.webp',
    span: 'col-span-2 aspect-[16/10] lg:col-span-2 lg:aspect-square',
  },
  // Только десктоп: деталь — расходники в руках мастера.
  { src: '/images/photos/p14.webp', span: 'hidden lg:block lg:col-span-2 lg:aspect-square' },
  // Только десктоп: рабочая зона с инструментом.
  { src: '/images/photos/p12.webp', span: 'hidden lg:block lg:col-span-2 lg:aspect-square' },
];

export default function GalleryGrid() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Лайтбокс работает по полному набору, а не по витрине.
  const all = GALLERY;
  const photoOf = (src: string) => all.find((image) => image.src === src);

  const step = useCallback(
    (direction: 1 | -1) => {
      setOpenIndex((current) => {
        if (current === null) return current;
        return (current + direction + all.length) % all.length;
      });
    },
    [all.length],
  );

  const close = useCallback(() => setOpenIndex(null), []);

  useEffect(() => {
    if (openIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };

    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [openIndex, close, step]);

  if (all.length === 0) return null;

  const current = openIndex === null ? null : all[openIndex];

  return (
    <div>
      {/* Раскладка: 2 колонки на телефоне, 6 на десктопе. */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {TILES.map((tile, position) => {
          const photo = photoOf(tile.src);
          if (!photo) return null;
          const index = all.indexOf(photo);

          return (
            <button
              key={tile.src}
              type="button"
              onClick={() => setOpenIndex(index)}
              // Пружинный отклик при нажатии — тот же язык движения, что у кнопок.
              className={`group relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] transition-transform duration-300 ease-[var(--ease-spring)] active:scale-[0.98] ${tile.span}`}
              aria-label={`Открыть фотографию: ${photo.alt}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt}
                width={800}
                height={600}
                // Первый кадр виден сразу при входе в блок, остальные — по мере прокрутки.
                loading={position === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className="size-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
              />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <Expand
                className="pointer-events-none absolute bottom-3 right-3 size-5 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      {/* Честно говорим, что это подборка, и даём доступ ко всему набору. */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] leading-relaxed text-[var(--color-muted)]">
          Кадры из галереи сервиса — всего в карточке 2ГИС {all.length} фотографий.
        </p>
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-soft)]"
        >
          Все {all.length} фото
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      {current ? (
        <div
          className="fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full border border-white/20 text-white transition-colors hover:border-white/60"
            aria-label="Закрыть"
          >
            <X className="size-5" aria-hidden="true" />
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.src}
            alt={current.alt}
            className="max-h-[80vh] w-auto max-w-full rounded-[var(--radius-card)] object-contain"
          />

          <button
            type="button"
            onClick={() => step(-1)}
            className="absolute left-3 grid size-11 place-items-center rounded-full border border-white/20 text-white transition-colors hover:border-white/60 md:left-6"
            aria-label="Предыдущее изображение"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            className="absolute right-3 grid size-11 place-items-center rounded-full border border-white/20 text-white transition-colors hover:border-white/60 md:right-6"
            aria-label="Следующее изображение"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>

          <p className="absolute bottom-5 left-1/2 max-w-[80vw] -translate-x-1/2 text-center text-[13px] text-white/70">
            {current.alt}
            <span className="mt-1 block text-white/40 tnum">
              {(openIndex ?? 0) + 1} / {all.length}
            </span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
