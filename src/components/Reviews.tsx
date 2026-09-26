import { business, links } from '@/data/business';
import { featuredReviews, ratingAggregate } from '@/data/reviews.generated';
import { Stars } from './Rating';
import { ActionLink } from './actions';
import { Reveal } from './Reveal';
import { formatDateRuFull } from '@/lib/time';

/**
 * Real reviews from the 2GIS card, quoted verbatim (original Russian, typos
 * included) and attributed to their 2GIS display name.
 *
 * NOTE for the owner (see README): the aggregate and the distribution live in
 * src/data/reviews.generated.ts. Only 5★ reviews with substantive text are
 * featured, which is normal practice — but nobody should read this section as
 * the complete review record, so every card links out to 2GIS.
 */
export function Reviews({ compact = false }: { compact?: boolean }) {
  const list = compact ? featuredReviews.slice(0, 4) : featuredReviews;

  return (
    <section aria-labelledby="reviews-heading" className="border-y border-hairline bg-graphite">
      <div className="shell py-12 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="eyebrow">Отзывы клиентов</span>
            <h2 id="reviews-heading" className="mt-2 text-display-3 font-semibold text-white">
              {business.rating.value.toFixed(1)}{' '}
              <span className="text-steel-400">из 5</span>
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <Stars value={business.rating.value} size={16} />
              <span className="text-[0.875rem] text-steel-400">
                <span className="tnum">{ratingAggregate.ratingsCount}</span> оценок ·{' '}
                <span className="tnum">{ratingAggregate.reviewsCount}</span> отзывов
              </span>
            </div>
          </div>

          <ActionLink
            href={links.reviews}
            event="service_view"
            payload={{ placement: 'reviews_all' }}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            Смотреть все отзывы в 2ГИС →
          </ActionLink>
        </div>

        <ul className="rail mt-7 -mx-gutter px-gutter md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3">
          {list.map((review, i) => (
            <Reveal
              as="li"
              key={review.id}
              delay={Math.min(i, 5) * 50}
              className="w-[84vw] max-w-[380px] shrink-0 md:w-auto md:max-w-none"
            >
              <figure className="card metal-top flex h-full flex-col p-5">
                <div className="flex items-center justify-between gap-3">
                  <Stars value={review.rating} size={13} />
                  <time
                    dateTime={review.date}
                    className="font-mono text-[0.6875rem] text-steel-600 tnum"
                  >
                    {formatDateRuFull(review.date)}
                  </time>
                </div>

                <blockquote className="mt-3.5 flex-1">
                  <p className="line-clamp-[9] text-[0.875rem] leading-relaxed text-steel-200 md:line-clamp-[8]">
                    {review.text}
                  </p>
                </blockquote>

                <figcaption className="mt-4 flex items-center gap-2.5 border-t border-hairline pt-3.5">
                  <span
                    aria-hidden="true"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-hairline bg-surface-raised text-[0.6875rem] font-bold text-steel-200"
                  >
                    {review.author.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[0.8125rem] font-semibold text-white">
                      {review.author}
                    </span>
                    <span className="block text-[0.6875rem] text-steel-600">отзыв на 2ГИС</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>

        <p className="mt-5 text-[0.75rem] leading-relaxed text-steel-600">
          Отзывы приведены дословно, авторство указано так, как оно опубликовано в 2ГИС.
          На карточке сервиса есть отзывы с разными оценками — все они доступны по ссылке выше.
        </p>
      </div>
    </section>
  );
}
