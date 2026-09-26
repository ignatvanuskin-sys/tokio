import type { Metadata } from 'next';

import { business, links } from '@/data/business';
import { featuredReviews, ratingAggregate } from '@/data/reviews.generated';
import { Reviews } from '@/components/Reviews';
import { PageHeader } from '@/components/PageHeader';
import { CtaBand } from '@/components/CtaBand';
import { ActionLink } from '@/components/actions';
import { Stars } from '@/components/Rating';
import { Reveal } from '@/components/Reveal';
import { formatDateRuFull } from '@/lib/time';

export const metadata: Metadata = {
  title: 'Отзывы клиентов',
  description:
    `Отзывы о автосервисе «${business.name}» в ${business.city}: рейтинг ${business.rating.value} ` +
    `по ${business.rating.ratingsCount} оценкам в 2ГИС. Реальные отзывы клиентов с указанием авторов.`,
  alternates: { canonical: '/reviews' },
};

export default function ReviewsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Отзывы"
        title={`${business.rating.value.toFixed(1)} из 5 в 2ГИС`}
        lead={`Рейтинг по ${business.rating.ratingsCount} оценкам и ${business.rating.reviewsCount} отзывам. Ниже — отзывы, опубликованные клиентами на карточке сервиса в 2ГИС, приведённые дословно.`}
        breadcrumbs={[
          { href: '/', label: 'Главная' },
          { href: '/reviews', label: 'Отзывы' },
        ]}
      >
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-hairline bg-surface px-4 py-3">
            <span className="text-[1.75rem] font-semibold leading-none text-white tnum">
              {business.rating.value.toFixed(1)}
            </span>
            <span>
              <Stars value={business.rating.value} size={15} />
              <span className="mt-1 block text-[0.75rem] text-steel-400">
                {ratingAggregate.ratingsCount} оценок · {ratingAggregate.reviewsCount} отзывов
              </span>
            </span>
          </div>

          <ActionLink
            href={links.reviews}
            event="service_view"
            payload={{ placement: 'reviews_page_header' }}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            Открыть все отзывы в 2ГИС →
          </ActionLink>
        </div>
      </PageHeader>

      {/* Every featured review, no clamping — the home page clamps, here we
          show the full text the client wrote. */}
      <section aria-labelledby="all-reviews" className="shell py-10 md:py-14">
        <h2 id="all-reviews" className="sr-only">
          Отзывы клиентов
        </h2>

        <ul className="grid gap-4 md:grid-cols-2">
          {featuredReviews.map((review, i) => (
            <Reveal as="li" key={review.id} delay={Math.min(i, 5) * 45} className="h-full">
              <figure className="card metal-top flex h-full flex-col p-5">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                  <Stars value={review.rating} size={14} />
                  <time
                    dateTime={review.date}
                    className="font-mono text-[0.6875rem] text-steel-600 tnum"
                  >
                    {formatDateRuFull(review.date)}
                  </time>
                </div>

                <blockquote className="mt-3.5 flex-1">
                  <p className="whitespace-pre-line text-[0.875rem] leading-relaxed text-steel-200">
                    {review.text}
                  </p>
                </blockquote>

                {review.reply && (
                  <div className="mt-4 rounded-lg border border-hairline bg-surface-sunken p-3.5">
                    <p className="text-[0.6875rem] uppercase tracking-wider text-steel-600">
                      Ответ сервиса
                    </p>
                    <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-steel-400">
                      {review.reply}
                    </p>
                  </div>
                )}

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
                    <span className="block text-[0.6875rem] text-steel-600">
                      отзыв опубликован на 2ГИС
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>

        <p className="mt-6 max-w-prose text-[0.8125rem] leading-relaxed text-steel-400">
          Здесь приведена часть отзывов — те, что содержат описание конкретных работ. На карточке
          сервиса в 2ГИС есть отзывы с разными оценками, включая критические: мы не удаляли их и не
          скрываем.{' '}
          <ActionLink
            href={links.reviews}
            event="service_view"
            payload={{ placement: 'reviews_page_footer' }}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-bright underline decoration-accent/40 underline-offset-4 hover:text-white"
          >
            Читать все отзывы в 2ГИС
          </ActionLink>
          .
        </p>
      </section>

      <Reviews compact={false} />

      <CtaBand
        placement="reviews_final"
        photo="p07"
        alt="Автомобиль после работ на площадке перед сервисом"
        eyebrow="Запись"
        title="Станьте следующим отзывом"
        body={`${business.hours.display}. ${business.address.streetShort}, ${business.city}. Запись занимает меньше минуты.`}
      />
    </>
  );
}
