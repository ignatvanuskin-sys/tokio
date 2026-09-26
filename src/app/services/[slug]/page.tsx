import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { business, links } from '@/data/business';
import { getService, serviceGroups, services } from '@/data/services';
import { gallery } from '@/data/gallery';
import { siteUrl } from '@/lib/site';
import { fallbackSrc, intrinsicSize, srcSet } from '@/lib/images';
import { ServiceCard } from '@/components/ServiceCard';
import { ActionLink } from '@/components/actions';
import { Reveal } from '@/components/Reveal';
import { CtaBand } from '@/components/CtaBand';
import { GALLERY_CATEGORY_LABEL } from '@/lib/labels';

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: 'Услуга не найдена' };

  const title = `${service.title} в ${business.city} — ${business.name}`;
  const description = `${service.summary} Автосервис «${business.name}», ${business.address.streetShort}, ${business.city}. ${business.hours.display}. Стоимость — после диагностики.`;

  return {
    title,
    description,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { title, description, url: `${siteUrl}/services/${service.slug}`, type: 'article' },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const group = serviceGroups.find((g) => g.id === service.group);
  const photo = gallery.find((g) => g.id === service.photo);
  const { width, height } = intrinsicSize(service.photo, 1440);

  const related = services
    .filter((s) => s.slug !== service.slug && s.group === service.group)
    .slice(0, 3);
  const fallbackRelated = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.summary,
    serviceType: service.title,
    areaServed: { '@type': 'City', name: business.city },
    provider: {
      '@type': 'AutoRepair',
      name: business.name,
      telephone: business.phone.e164,
      address: {
        '@type': 'PostalAddress',
        streetAddress: business.address.street,
        addressLocality: business.address.city,
        addressCountry: business.country,
      },
      url: siteUrl,
    },
    url: `${siteUrl}/services/${service.slug}`,
    // No `offers` block on purpose: the workshop publishes no prices, and a
    // fabricated price in structured data is exactly the kind of thing that
    // breaks trust (and Google's guidelines).
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <article>
        {/* Hero ---------------------------------------------------------- */}
        <header className="relative isolate overflow-hidden border-b border-hairline bg-graphite">
          <div className="absolute inset-0 -z-10">
            <img
              src={fallbackSrc(service.photo)}
              srcSet={srcSet(service.photo)}
              sizes="100vw"
              width={width}
              height={height}
              alt={photo?.alt ?? ''}
              // The detail hero is the LCP element of this page.
              // @ts-expect-error fetchpriority is valid HTML
              fetchpriority="high"
              decoding="sync"
              className="h-full w-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(7,8,10,0.9) 0%, rgba(7,8,10,0.72) 40%, #0D0F12 100%)',
              }}
            />
          </div>

          <div className="shell py-10 md:py-16">
            <nav aria-label="Хлебные крошки" className="mb-5">
              <ol className="flex flex-wrap items-center gap-1.5 text-[0.75rem] text-steel-400">
                <li>
                  <Link href="/" className="hover:text-white">
                    Главная
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/services" className="hover:text-white">
                    Услуги
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-steel-200" aria-current="page">
                  {service.title}
                </li>
              </ol>
            </nav>

            {group && <span className="eyebrow">{group.label}</span>}
            <h1 className="mt-2 max-w-3xl text-display-2 font-semibold text-white">
              {service.title}
            </h1>
            <p className="mt-3 max-w-2xl text-lead text-steel-200">{service.summary}</p>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Link href={`/booking?service=${service.slug}`} className="btn btn-primary">
                Записаться
              </Link>
              <ActionLink
                href={business.phone.e164}
                event="phone_clicked"
                payload={{ placement: 'service_detail' }}
                className="btn btn-secondary"
              >
                {business.phone.display}
              </ActionLink>
              <ActionLink
                href={business.whatsapp.deepLink}
                event="whatsapp_clicked"
                payload={{ placement: 'service_detail' }}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                WhatsApp
              </ActionLink>
            </div>
          </div>
        </header>

        {/* Body ---------------------------------------------------------- */}
        <div className="shell grid gap-8 py-10 md:py-16 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
          <div>
            <h2 className="text-display-3 font-semibold text-white">Что входит</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {service.includes.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[0.9375rem] text-steel-200">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>

            <h2 className="mt-9 text-display-3 font-semibold text-white">Стоимость</h2>
            <div className="mt-4 rounded-card border border-hairline bg-surface p-5">
              <p className="text-[1.0625rem] font-semibold text-white">{business.priceNote}</p>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-steel-400">
                {business.priceNoteLong}
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link href={`/booking?service=${service.slug}`} className="btn btn-primary btn-sm">
                  Записаться
                </Link>
                <ActionLink
                  href={business.whatsapp.deepLink}
                  event="whatsapp_clicked"
                  payload={{ placement: 'service_detail_price' }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  Узнать стоимость
                </ActionLink>
              </div>
            </div>

            <h2 className="mt-9 text-display-3 font-semibold text-white">Как мы работаем</h2>
            <ol className="mt-4 flex flex-col gap-3">
              {[
                'Вы оставляете заявку на сайте или звоните — согласуем удобное время.',
                'На приёмке мастер уточняет симптом и проводит диагностику.',
                'Называем стоимость работ и запчастей до начала ремонта.',
                'После согласования делаем работу и отдаём автомобиль с объяснением, что было сделано.',
              ].map((step, i) => (
                <li key={step} className="flex gap-3.5">
                  <span
                    className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border border-hairline bg-surface-raised font-mono text-[0.6875rem] font-bold text-accent tnum"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[0.9375rem] leading-relaxed text-steel-200">{step}</span>
                </li>
              ))}
            </ol>

            <p className="mt-6 text-[0.75rem] leading-relaxed text-steel-600">
              Источник перечня работ: карточка «{business.name}» в 2ГИС, блок «
              {service.sourceRef}».{' '}
              <ActionLink
                href={links.card}
                event="service_view"
                payload={{ placement: 'service_detail_source' }}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-steel-800 underline-offset-2 hover:text-steel-200"
              >
                Открыть карточку
              </ActionLink>
            </p>
          </div>

          {/* Aside ----------------------------------------------------- */}
          <aside className="flex flex-col gap-4">
            <div className="card overflow-hidden">
              {photo && (
                <img
                  src={fallbackSrc(service.photo)}
                  srcSet={srcSet(service.photo)}
                  sizes="(min-width: 1024px) 34vw, 100vw"
                  width={width}
                  height={height}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
              )}
              <div className="p-5">
                <h2 className="text-[0.9375rem] font-bold text-white">Фото с этой работы</h2>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-steel-400">
                  {photo ? `${GALLERY_CATEGORY_LABEL[photo.category]} · ${photo.caption}.` : ''} Фото:{' '}
                  {photo?.credit}.
                </p>
                <Link
                  href="/gallery"
                  className="mt-3 inline-block text-[0.8125rem] font-medium text-accent-bright hover:text-white"
                >
                  Смотреть все {business.galleryCount} фото →
                </Link>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="text-[0.9375rem] font-bold text-white">Сервис</h2>
              <dl className="mt-3 flex flex-col gap-2.5 text-[0.875rem]">
                <div className="flex justify-between gap-3">
                  <dt className="text-steel-600">Адрес</dt>
                  <dd className="text-right text-steel-200">{business.address.streetShort}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-steel-600">График</dt>
                  <dd className="text-right text-steel-200">{business.hours.display}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-steel-600">Телефон</dt>
                  <dd className="text-right tnum text-steel-200">{business.phone.display}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-steel-600">Рейтинг</dt>
                  <dd className="text-right tnum text-steel-200">
                    {business.rating.value.toFixed(1)} · {business.rating.ratingsCount} оценок
                  </dd>
                </div>
              </dl>
              <ActionLink
                href={links.route}
                event="route_clicked"
                payload={{ placement: 'service_detail_aside' }}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm btn-block mt-4"
              >
                Построить маршрут
              </ActionLink>
            </div>
          </aside>
        </div>

        {/* Related ------------------------------------------------------- */}
        {(related.length > 0 ? related : fallbackRelated).length > 0 && (
          <section aria-labelledby="related-heading" className="shell pb-12 md:pb-16">
            <h2 id="related-heading" className="text-display-3 font-semibold text-white">
              Другие услуги
            </h2>
            <ul className="mt-6 grid grid-cols-1 gap-3.5 md:grid-cols-3 md:gap-5">
              {(related.length > 0 ? related : fallbackRelated).map((s, i) => (
                <Reveal as="li" key={s.slug} delay={i * 50} className="h-full">
                  <ServiceCard service={s} index={i} />
                </Reveal>
              ))}
            </ul>
          </section>
        )}
      </article>

      <CtaBand
        placement="service_detail_final"
        photo="p03"
        alt="Стенд развал-схождения"
        eyebrow="Запись"
        title={`Записаться: ${service.title.toLowerCase()}`}
        body={`${business.hours.display}. ${business.address.streetShort}. Время подтвердит мастер по телефону.`}
      />
    </>
  );
}
