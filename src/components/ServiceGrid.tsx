import Link from 'next/link';
import { services } from '@/data/services';
import { ServiceCard } from './ServiceCard';
import { Reveal } from './Reveal';

type Props = {
  /** Show only the curated home-page set. */
  featuredOnly?: boolean;
  headingId?: string;
};

export function ServiceGrid({ featuredOnly = false, headingId = 'services-heading' }: Props) {
  const list = featuredOnly ? services.filter((s) => s.featured) : services;

  return (
    <section aria-labelledby={headingId} className="shell py-12 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <span className="eyebrow">Услуги</span>
          <h2 id={headingId} className="mt-2 text-display-3 font-extrabold text-white">
            {featuredOnly ? 'Что чаще всего делаем' : 'Все услуги сервиса'}
          </h2>
          <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-steel-400">
            Список совпадает с тем, что заявлено на карточке сервиса в 2ГИС.{' '}
            <span className="text-steel-200">Стоимость — после диагностики:</span> прайс-лист
            не публикуется, потому что цена зависит от модели и состояния узла.
          </p>
        </div>

        <Link
          href={featuredOnly ? '/services' : '/booking'}
          className="btn btn-secondary btn-sm"
        >
          {featuredOnly ? 'Все услуги и цены →' : 'Перейти к записи →'}
        </Link>
      </div>

      <ul className="mt-7 grid grid-cols-1 gap-3.5 md:mt-9 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {list.map((service, i) => (
          <Reveal as="li" key={service.slug} delay={Math.min(i, 5) * 55} className="h-full">
            <ServiceCard service={service} index={i} />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
