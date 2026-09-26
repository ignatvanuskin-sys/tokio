import { business, links } from '@/data/business';
import { galleryCount } from '@/data/gallery';
import { Stars } from './Rating';
import { ActionLink } from './actions';
import { Reveal } from './Reveal';

/**
 * Trust, immediately after the hero.
 *
 * Every tile is a claim with a source. Nothing here is a superlative —
 * no "лучший в городе", only what 2GIS actually publishes.
 */
export function TrustBar() {
  const items = [
    {
      key: 'rating',
      label: 'Рейтинг 2ГИС',
      value: (
        <span className="flex items-baseline gap-2">
          <span className="tnum">{business.rating.value.toFixed(1)}</span>
          <Stars value={business.rating.value} size={15} className="translate-y-[-2px]" />
        </span>
      ),
      note: `${business.rating.ratingsCount} оценок · ${business.rating.reviewsCount} отзывов`,
      href: links.reviews,
      hrefLabel: 'Смотреть в 2ГИС',
    },
    {
      key: 'award',
      label: '2GIS Awards 2026',
      value: <span className="text-[1.375rem] leading-tight">Номинант</span>,
      note: business.awards[0]?.nomination ?? '',
      href: 'https://awards.2gis.ru/',
      hrefLabel: 'О премии 2ГИС',
    },
    {
      key: 'hours',
      label: 'Режим работы',
      value: <span className="text-[1.375rem] leading-tight">09:00–20:00</span>,
      note: 'Ежедневно, без выходных',
    },
    {
      key: 'photos',
      label: 'Фотографии',
      value: <span className="tnum text-[1.375rem] leading-tight">{galleryCount}</span>,
      note: 'реальных фото сервиса',
      href: links.photos,
      hrefLabel: 'Все фото в 2ГИС',
    },
    {
      key: 'address',
      label: 'Адрес',
      value: <span className="text-[1.0625rem] leading-snug">{business.address.streetShort}</span>,
      note: `${business.city} · 1 этаж, отдельный вход`,
      href: links.route,
      hrefLabel: 'Построить маршрут',
    },
  ];

  return (
    <section aria-labelledby="trust-heading" className="border-b border-hairline bg-graphite">
      <div className="shell py-7 md:py-9">
        <h2 id="trust-heading" className="sr-only">
          Доверие: рейтинг, награда, режим работы, адрес
        </h2>

        {/* Mobile: 2-column grid (5 tiles, last spans full width).
            Desktop: 5 equal columns. */}
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-5 md:gap-x-6">
          {items.map((item, i) => (
            <Reveal
              as="li"
              key={item.key}
              delay={i * 45}
              className={i === items.length - 1 ? 'col-span-2 md:col-span-1' : ''}
            >
              <div className="flex h-full flex-col">
                <span className="eyebrow">{item.label}</span>
                <span className="mt-2 block text-[1.5rem] font-extrabold text-white">
                  {item.value}
                </span>
                {item.note && (
                  <span className="mt-1 block text-[0.8125rem] leading-snug text-steel-400">
                    {item.note}
                  </span>
                )}
                {item.href && (
                  <ActionLink
                    href={item.href}
                    event={item.key === 'address' ? 'route_clicked' : 'service_view'}
                    payload={{ placement: `trust_${item.key}` }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-[0.75rem] font-medium text-accent-bright underline decoration-accent/40 underline-offset-4 hover:text-white"
                  >
                    {item.hrefLabel}
                  </ActionLink>
                )}
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
