import type { Metadata } from 'next';

import { business, links } from '@/data/business';
import { PageHeader } from '@/components/PageHeader';
import { LocationBlock } from '@/components/LocationBlock';
import { CtaBand } from '@/components/CtaBand';
import { ActionLink } from '@/components/actions';
import { Reveal } from '@/components/Reveal';

export const metadata: Metadata = {
  title: 'Контакты и адрес',
  description:
    `${business.name}, ${business.city}, ${business.address.street}. Телефон ${business.phone.display}, ` +
    `WhatsApp, Instagram. ${business.hours.display}. Как добраться и построить маршрут.`,
  alternates: { canonical: '/contacts' },
};

export default function ContactsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Контакты"
        title="Как с нами связаться"
        lead={`${business.address.full}. ${business.hours.display}. Позвоните, напишите в WhatsApp или Instagram — или постройте маршрут и приезжайте.`}
        breadcrumbs={[
          { href: '/', label: 'Главная' },
          { href: '/contacts', label: 'Контакты' },
        ]}
      >
        <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <ActionLink
            href={business.phone.e164}
            event="phone_clicked"
            payload={{ placement: 'contacts_page' }}
            className="btn btn-primary"
          >
            Позвонить
          </ActionLink>
          <ActionLink
            href={business.whatsapp.deepLink}
            event="whatsapp_clicked"
            payload={{ placement: 'contacts_page' }}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            WhatsApp
          </ActionLink>
          <ActionLink
            href={business.instagram.url}
            event="instagram_clicked"
            payload={{ placement: 'contacts_page' }}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Instagram
          </ActionLink>
          <ActionLink
            href={links.route}
            event="route_clicked"
            payload={{ placement: 'contacts_page' }}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Маршрут
          </ActionLink>
        </div>
      </PageHeader>

      <LocationBlock />

      {/* Full contact card -------------------------------------------- */}
      <section aria-labelledby="contact-details" className="shell pb-12 md:pb-16">
        <h2 id="contact-details" className="eyebrow">
          Все данные
        </h2>

        <Reveal className="mt-4">
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-[0.75rem] uppercase tracking-wider text-steel-600">Название</dt>
              <dd className="mt-1 text-[0.9375rem] text-steel-50">
                {business.category} «{business.name}»
                <span className="mt-0.5 block text-[0.8125rem] text-steel-400">
                  {business.categoryLong}
                </span>
              </dd>
            </div>

            <div>
              <dt className="text-[0.75rem] uppercase tracking-wider text-steel-600">Адрес</dt>
              <dd className="mt-1 text-[0.9375rem] text-steel-50">
                {business.address.full}
                <span className="mt-0.5 block text-[0.8125rem] text-steel-400">
                  {business.address.floor}, отдельный вход · {business.address.postalCode}
                </span>
              </dd>
            </div>

            <div>
              <dt className="text-[0.75rem] uppercase tracking-wider text-steel-600">Телефон</dt>
              <dd className="mt-1">
                <ActionLink
                  href={business.phone.e164}
                  event="phone_clicked"
                  payload={{ placement: 'contacts_details' }}
                  className="tnum text-[0.9375rem] text-steel-50 hover:text-white"
                >
                  {business.phone.display}
                </ActionLink>
              </dd>
            </div>

            <div>
              <dt className="text-[0.75rem] uppercase tracking-wider text-steel-600">WhatsApp</dt>
              <dd className="mt-1">
                <ActionLink
                  href={business.whatsapp.deepLink}
                  event="whatsapp_clicked"
                  payload={{ placement: 'contacts_details' }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tnum text-[0.9375rem] text-steel-50 hover:text-white"
                >
                  {business.phone.display}
                </ActionLink>
              </dd>
            </div>

            <div>
              <dt className="text-[0.75rem] uppercase tracking-wider text-steel-600">Instagram</dt>
              <dd className="mt-1">
                <ActionLink
                  href={business.instagram.url}
                  event="instagram_clicked"
                  payload={{ placement: 'contacts_details' }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.9375rem] text-steel-50 hover:text-white"
                >
                  {business.instagram.handle}
                </ActionLink>
              </dd>
            </div>

            <div>
              <dt className="text-[0.75rem] uppercase tracking-wider text-steel-600">
                Режим работы
              </dt>
              <dd className="mt-1 text-[0.9375rem] text-steel-50">
                {business.hours.display}
                <span className="mt-0.5 block text-[0.8125rem] text-steel-400">
                  Без выходных, все семь дней
                </span>
              </dd>
            </div>

            <div>
              <dt className="text-[0.75rem] uppercase tracking-wider text-steel-600">
                Способы оплаты
              </dt>
              <dd className="mt-1 text-[0.9375rem] leading-relaxed text-steel-50">
                {business.payments.join(' · ')}
              </dd>
            </div>

            <div>
              <dt className="text-[0.75rem] uppercase tracking-wider text-steel-600">
                Удобства
              </dt>
              <dd className="mt-1 text-[0.9375rem] leading-relaxed text-steel-50">
                {business.features.map((f) => f.label).join(' · ')}
              </dd>
            </div>

            <div>
              <dt className="text-[0.75rem] uppercase tracking-wider text-steel-600">
                Марки
              </dt>
              <dd className="mt-1 text-[0.9375rem] leading-relaxed text-steel-50">
                {business.brands.join(', ')}
              </dd>
            </div>
          </dl>
        </Reveal>

        <p className="mt-6 text-[0.75rem] leading-relaxed text-steel-600">
          Источник данных: карточка «{business.name}» в 2ГИС (снято {business.rating.value ? '2026-09-26' : ''}).
          Если что-то изменилось — напишите, поправим.{' '}
          <ActionLink
            href={links.card}
            event="service_view"
            payload={{ placement: 'contacts_source' }}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-steel-800 underline-offset-2 hover:text-steel-200"
          >
            Открыть карточку в 2ГИС
          </ActionLink>
        </p>
      </section>

      <CtaBand
        placement="contacts_final"
        photo="p10"
        alt="Боксы автосервиса с оранжевыми воротами"
        eyebrow="Запись"
        title="Приезжайте — или запишитесь заранее"
        body={`${business.hours.display}. ${business.address.streetShort}, ${business.city}. Запись через сайт занимает меньше минуты.`}
      />
    </>
  );
}
