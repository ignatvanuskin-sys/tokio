import { business, links } from '@/data/business';
import { Reveal } from './Reveal';
import { ActionLink } from './actions';

/**
 * "Почему нас" — built ONLY from published facts.
 * No "лучший автосервис города": every card carries the source of its claim.
 */
export function WhyUs() {
  const reasons = [
    {
      icon: '★',
      title: `Рейтинг ${business.rating.value} в 2ГИС`,
      body: `По ${business.rating.ratingsCount} оценкам и ${business.rating.reviewsCount} отзывам клиентов. Значение взято с карточки сервиса в 2ГИС и не является нашей самооценкой.`,
      source: '2GIS',
      href: links.reviews,
      hrefLabel: 'Отзывы в 2ГИС',
    },
    {
      icon: '◆',
      title: 'Номинант 2GIS Awards 2026',
      body: `Номинация «${business.awards[0]?.nomination}» в рубрике «${business.awards[0]?.rubric}». Мы указываем статус «номинант» — не победу.`,
      source: '2GIS',
    },
    {
      icon: '⏱',
      title: 'Работаем каждый день',
      body: `${business.hours.display}. Ни выходных, ни «приходите в понедельник» — можно приехать в свой единственный свободный день.`,
      source: '2GIS',
    },
    {
      icon: '⚙',
      title: `${business.brands.length} заявленных марок`,
      body: `От Lada и Toyota до BMW, Audi и Lexus. Полный список — на карточке в 2ГИС; если вашей марки нет, позвоните и уточните.`,
      source: '2GIS',
      href: links.card,
      hrefLabel: 'Список марок',
    },
    {
      icon: '☕',
      title: 'Wi-Fi, парковка, отдельный вход',
      body: 'Можно подождать машину на месте: есть Wi-Fi для клиентов и две парковки. Вход отдельный, первый этаж.',
      source: '2GIS · Особенности',
    },
    {
      icon: '₸',
      title: 'Оплата как удобно',
      body: business.payments.join(' · ') + '.',
      source: '2GIS · Оплата',
    },
  ];

  return (
    <section aria-labelledby="why-heading" className="border-y border-hairline bg-graphite">
      <div className="shell py-12 md:py-20">
        <div className="max-w-xl">
          <span className="eyebrow">Почему сюда</span>
          <h2 id="why-heading" className="mt-2 text-display-3 font-semibold text-white">
            Факты вместо обещаний
          </h2>
          <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-steel-400">
            Ниже — только то, что можно проверить: рейтинг, награда, график, особенности и
            способы оплаты взяты с карточки сервиса в 2ГИС.
          </p>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <Reveal as="li" key={r.title} delay={Math.min(i, 5) * 50} className="h-full">
              <div className="card metal-top flex h-full flex-col p-5">
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-hairline bg-surface-raised text-[0.9375rem] text-accent"
                >
                  {r.icon}
                </span>
                <h3 className="mt-3.5 text-[1.0625rem] font-bold leading-snug text-white">
                  {r.title}
                </h3>
                <p className="mt-2 text-[0.875rem] leading-relaxed text-steel-400">{r.body}</p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <span className="text-[0.6875rem] uppercase tracking-wider text-steel-600">
                    {r.source}
                  </span>
                  {r.href && (
                    <ActionLink
                      href={r.href}
                      event="service_view"
                      payload={{ placement: 'why_us' }}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.75rem] font-medium text-accent-bright hover:text-white"
                    >
                      {r.hrefLabel} →
                    </ActionLink>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
