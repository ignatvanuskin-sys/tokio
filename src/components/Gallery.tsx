'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gallery, galleryCategories, type GalleryCategory } from '@/data/gallery';
import { links } from '@/data/business';
import { fallbackSrc, intrinsicSize, srcSet } from '@/lib/images';
import { track } from '@/lib/analytics';
import { Reveal } from './Reveal';
import { ActionLink } from './actions';

type Props = {
  /** "rail" = horizontal snap scroller (home). "grid" = full grid (gallery page). */
  layout?: 'rail' | 'grid';
  /** Hide the category filter (used in compact home placement). */
  showFilter?: boolean;
  limit?: number;
};

export function Gallery({ layout = 'grid', showFilter = true, limit }: Props) {
  const [category, setCategory] = useState<GalleryCategory | 'all'>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = useMemo(() => {
    const filtered = category === 'all' ? gallery : gallery.filter((g) => g.category === category);
    return limit ? filtered.slice(0, limit) : filtered;
  }, [category, limit]);

  const close = useCallback(() => setOpenIndex(null), []);
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + 1) % items.length)),
    [items.length],
  );
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i - 1 + items.length) % items.length)),
    [items.length],
  );

  const open = (index: number, item: (typeof items)[number]) => {
    setOpenIndex(index);
    track('gallery_opened', { photoId: item.id, count: items.length });
  };

  return (
    <div>
      {showFilter && (
        <div
          role="group"
          aria-label="Фильтр фотографий"
          className="rail -mx-gutter mt-6 px-gutter md:mx-0 md:flex-wrap md:px-0"
        >
          {galleryCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              aria-pressed={category === c.id}
              className="chip shrink-0"
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {layout === 'rail' ? (
        <ul className="rail -mx-gutter mt-5 px-gutter md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-4">
          {items.map((item, i) => (
            <GalleryTile
              key={item.id}
              item={item}
              index={i}
              onOpen={() => open(i, item)}
              className="w-[78vw] max-w-[340px] shrink-0 md:w-auto md:max-w-none"
              sizes="(min-width: 1024px) 24vw, (min-width: 768px) 32vw, 78vw"
            />
          ))}
        </ul>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {items.map((item, i) => (
            <GalleryTile
              key={item.id}
              item={item}
              index={i}
              onOpen={() => open(i, item)}
              sizes="(min-width: 1024px) 24vw, (min-width: 768px) 32vw, 48vw"
            />
          ))}
        </ul>
      )}

      <p className="mt-5 text-[0.75rem] text-steel-600">
        Источник фотографий — карточка сервиса в{' '}
        <ActionLink
          href={links.photos}
          event="service_view"
          payload={{ placement: 'gallery_source' }}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-steel-800 underline-offset-2 hover:text-steel-200"
        >
          2ГИС
        </ActionLink>
        . Фотографии добавлены посетителями, копирайт принадлежит авторам.
      </p>

      {openIndex !== null && items[openIndex] && (
        <Lightbox
          items={items}
          index={openIndex}
          onClose={close}
          onNext={next}
          onPrev={prev}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function GalleryTile({
  item,
  index,
  onOpen,
  className = '',
  sizes,
}: {
  item: (typeof gallery)[number];
  index: number;
  onOpen: () => void;
  className?: string;
  sizes: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const { width, height } = intrinsicSize(item.id, 960);

  return (
    <Reveal as="li" delay={Math.min(index, 6) * 40} className={className}>
      <button
        type="button"
        onClick={onOpen}
        className="group relative block w-full overflow-hidden rounded-xl border border-hairline bg-surface-sunken text-left transition hover:border-hairlineStrong focus-visible:border-accent"
        aria-label={`Открыть фото: ${item.caption}`}
      >
        <span className="relative block aspect-[4/3] w-full overflow-hidden">
          <img
            src={fallbackSrc(item.id)}
            srcSet={srcSet(item.id)}
            sizes={sizes}
            width={width}
            height={height}
            alt={item.alt}
            loading="lazy"
            decoding="async"
            draggable={false}
            onLoad={() => setLoaded(true)}
            className={`h-full w-full object-cover transition duration-700 ${
              loaded ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-md'
            }`}
          />
        </span>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-3 pt-8">
          <span className="block text-[0.8125rem] font-semibold leading-tight text-white">
            {item.caption}
          </span>
        </span>
      </button>
    </Reveal>
  );
}

/* -------------------------------------------------------------------------- */

function Lightbox({
  items,
  index,
  onClose,
  onNext,
  onPrev,
}: {
  items: typeof gallery;
  index: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const item = items[index]!;
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Keyboard: Esc closes, arrows navigate.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, onNext, onPrev]);

  // Lock background scroll and move focus into the dialog.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Swipe: horizontal beats vertical so page-scroll gestures don't fire.
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartX.current;
    const startY = touchStartY.current;
    const endX = e.changedTouches[0]?.clientX ?? null;
    const endY = e.changedTouches[0]?.clientY ?? null;
    touchStartX.current = null;
    touchStartY.current = null;
    if (startX === null || endX === null) return;
    const dx = endX - startX;
    const dy = startY !== null && endY !== null ? Math.abs(endY - startY) : 0;
    if (Math.abs(dx) < 48 || Math.abs(dx) < dy) return;
    if (dx < 0) onNext();
    else onPrev();
  };

  const { width, height } = intrinsicSize(item.id, 1440);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Фотография ${index + 1} из ${items.length}: ${item.caption}`}
      tabIndex={-1}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="fixed inset-0 z-[70] flex animate-fade-in flex-col bg-ink/97 backdrop-blur-md"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,var(--safe-top))]">
        <span className="font-mono text-[0.75rem] text-steel-400 tnum">
          {index + 1} / {items.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="grid h-11 w-11 place-items-center rounded-pill border border-hairline bg-surface text-steel-200 transition hover:text-white"
          aria-label="Закрыть просмотр"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Image */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-3">
        <img
          key={item.id}
          src={fallbackSrc(item.id)}
          srcSet={srcSet(item.id)}
          sizes="100vw"
          width={width}
          height={height}
          alt={item.alt}
          decoding="async"
          className="max-h-full w-auto max-w-full rounded-lg object-contain animate-fade-in"
        />
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col gap-3 px-4 pb-[max(1rem,var(--safe-bottom))] pt-3">
        <div>
          <p className="text-[0.9375rem] font-semibold text-white">{item.caption}</p>
          <p className="mt-0.5 text-[0.75rem] text-steel-600">
            Фото: {item.credit} · источник 2ГИС
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onPrev} className="btn btn-secondary flex-1" aria-label="Предыдущее фото">
            ← Назад
          </button>
          <button type="button" onClick={onNext} className="btn btn-secondary flex-1" aria-label="Следующее фото">
            Вперёд →
          </button>
        </div>
      </div>
    </div>
  );
}
