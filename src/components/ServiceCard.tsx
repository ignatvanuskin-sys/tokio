'use client';

import Link from 'next/link';
import type { Service } from '@/data/services';
import { serviceGroups } from '@/data/services';
import { business } from '@/data/business';
import { srcSet, fallbackSrc, intrinsicSize } from '@/lib/images';
import { track } from '@/lib/analytics';

/**
 * Service card.
 *
 * Mobile   → horizontal: 104px thumb + text, so five+ services stay scannable
 *            without a screen-long scroll.
 * ≥768px   → vertical card with a 16:9 photo.
 *
 * Price: never a number. The 2GIS card publishes no prices, so the card shows
 * the honest `priceNote` ("Стоимость — после диагностики").
 */
export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  const group = serviceGroups.find((g) => g.id === service.group);
  const { width, height } = intrinsicSize(service.photo, 640);

  return (
    <article className="card group relative flex flex-col overflow-hidden transition duration-300 hover:border-hairlineStrong md:metal-top md:hover:shadow-lift">
      <div className="flex gap-3.5 p-3.5 md:flex-col md:gap-0 md:p-0">
        {/* Thumb ------------------------------------------------------- */}
        <Link
          href={`/services/${service.slug}`}
          className="relative block h-[104px] w-[104px] shrink-0 overflow-hidden rounded-xl bg-surface-sunken md:h-auto md:w-full md:rounded-none"
          tabIndex={-1}
          aria-hidden="true"
        >
          <img
            src={fallbackSrc(service.photo)}
            srcSet={srcSet(service.photo)}
            sizes="(min-width: 768px) 33vw, 104px"
            width={width}
            height={height}
            alt=""
            loading={index < 2 ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04] md:aspect-[16/10] md:h-auto"
          />
        </Link>

        {/* Body -------------------------------------------------------- */}
        <div className="flex min-w-0 flex-1 flex-col md:p-5">
          {group && (
            <span className="text-[0.6875rem] uppercase tracking-wider text-accent-bright">
              {group.label}
            </span>
          )}

          <h3 className="mt-1 text-[1.0625rem] font-bold leading-snug text-white md:text-[1.125rem]">
            <Link href={`/services/${service.slug}`} className="hover:text-accent-bright">
              {service.title}
            </Link>
          </h3>

          <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-steel-400 md:text-[0.875rem]">
            {service.summary}
          </p>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-3">
            <span className="text-[0.75rem] text-steel-600">{business.priceNote}</span>
            <Link
              href={`/booking?service=${service.slug}`}
              onClick={() =>
                track('service_selected', { serviceSlug: service.slug, serviceGroup: service.group, placement: 'service_card' })
              }
              className="inline-flex min-h-[40px] items-center gap-1 rounded-pill border border-hairline bg-surface-raised px-3.5 text-[0.8125rem] font-semibold text-white transition hover:border-accent/60 hover:bg-accent-wash"
            >
              Записаться
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Hover accent rail (desktop only, purely decorative) */}
      <span className="pointer-events-none absolute inset-x-0 top-0 hidden h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block" />
    </article>
  );
}
