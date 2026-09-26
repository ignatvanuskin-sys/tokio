import type { Metadata } from 'next';
import Link from 'next/link';

import { business, links } from '@/data/business';
import { serviceGroups, services } from '@/data/services';
import { ServiceCard } from '@/components/ServiceCard';
import { PageHeader } from '@/components/PageHeader';
import { CtaBand } from '@/components/CtaBand';
import { FaqSection } from '@/components/FaqSection';
import { Reveal } from '@/components/Reveal';
import { ActionLink } from '@/components/actions';

export const metadata: Metadata = {
  title: 'Услуги автосервиса — ремонт, диагностика, развал-схождение',
  description:
    `Услуги автосервиса «${business.name}» в ${business.city}: компьютерная диагностика, ` +
    `развал-схождение, ремонт ходовой и пневмоподвески, двигатели, тормозные диски, шиномонтаж, ` +
    `аренда тёплого бокса. Стоимость — после диагностики. ${business.address.streetShort}.`,
  alternates: { canonical: '/services' },
};

/**
 * Full service catalogue, grouped by direction.
 * Every item is one of the services published on the 2GIS card; prices are
 * never invented (see src/data/services.ts).
 */
export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Услуги"
        title="Чем занимается сервис"
        lead={`Список совпадает с тем, что заявлено на карточке «${business.name}» в 2ГИС. ${business.priceNoteLong}`}
        breadcrumbs={[
          { href: '/', label: 'Главная' },
          { href: '/services', label: 'Услуги' },
        ]}
      >
        <nav aria-label="Направления" className="rail -mx-gutter mt-6 px-gutter md:mx-0 md:flex-wrap md:px-0">
          {serviceGroups.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="chip shrink-0">
              {g.label}
            </a>
          ))}
        </nav>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link href="/booking" className="btn btn-primary btn-sm">
            Записаться
          </Link>
          <ActionLink
            href={business.phone.e164}
            event="phone_clicked"
            payload={{ placement: 'services_header' }}
            className="btn btn-secondary btn-sm"
          >
            Уточнить по телефону
          </ActionLink>
          <ActionLink
            href={links.card}
            event="service_view"
            payload={{ placement: 'services_header' }}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
          >
            Карточка в 2ГИС →
          </ActionLink>
        </div>
      </PageHeader>

      {/* Price policy — stated plainly, once, up top ------------------- */}
      <section className="shell pt-10 md:pt-14">
        <Reveal>
          <div className="rounded-card border border-hairline bg-surface p-5 md:p-6">
            <h2 className="text-[1.0625rem] font-bold text-white">Почему нет цен на сайте</h2>
            <p className="mt-2 max-w-2xl text-[0.875rem] leading-relaxed text-steel-400">
              {business.priceNoteLong}{' '}
              <span className="text-steel-200">
                Мы не публикуем выдуманные «цены от», чтобы не обещать то, чего не сможем
                подтвердить на приёмке.
              </span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link href="/booking" className="btn btn-primary btn-sm">
                Записаться на диагностику
              </Link>
              <ActionLink
                href={business.whatsapp.deepLink}
                event="whatsapp_clicked"
                payload={{ placement: 'services_price_block' }}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                Узнать стоимость в WhatsApp
              </ActionLink>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Grouped catalogue -------------------------------------------- */}
      {serviceGroups.map((group) => {
        const items = services.filter((s) => s.group === group.id);
        if (items.length === 0) return null;

        return (
          <section
            key={group.id}
            id={group.id}
            aria-labelledby={`${group.id}-heading`}
            className="shell scroll-mt-24 py-9 md:py-14"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
              <h2 id={`${group.id}-heading`} className="text-display-3 font-semibold text-white">
                {group.label}
              </h2>
              <span className="text-[0.875rem] text-steel-400">{group.blurb}</span>
            </div>

            <ul className="mt-6 grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
              {items.map((s, i) => (
                <Reveal as="li" key={s.slug} delay={Math.min(i, 4) * 50} className="h-full">
                  <ServiceCard service={s} index={i} />
                </Reveal>
              ))}
            </ul>
          </section>
        );
      })}

      <CtaBand
        placement="services_final"
        photo="p06"
        alt="Автомобиль на подъёмнике внутри цеха"
        eyebrow="Запись"
        title="Свободные слоты на ближайшие дни"
        body="Выберите услугу и время — заявка сразу уйдёт в сервис. Если сомневаетесь, что именно нужно, выбирайте диагностику."
      />

      <FaqSection />
    </>
  );
}
