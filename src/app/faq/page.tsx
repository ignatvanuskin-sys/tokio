import type { Metadata } from 'next';

import { business, links } from '@/data/business';
import { faq } from '@/data/faq';
import { siteUrl } from '@/lib/site';
import { FaqSection } from '@/components/FaqSection';
import { PageHeader } from '@/components/PageHeader';
import { CtaBand } from '@/components/CtaBand';
import { ActionLink } from '@/components/actions';

export const metadata: Metadata = {
  title: 'Вопросы и ответы',
  description:
    `Как записаться в автосервис «${business.name}» в ${business.city}, какой график работы, ` +
    `где находится сервис, можно ли записаться через WhatsApp и сколько стоит диагностика.`,
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  // FAQPage structured data built from the same source the UI renders, so the
  // markup and the content can never drift apart.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
    url: `${siteUrl}/faq`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <PageHeader
        eyebrow="Вопросы"
        title="Вопросы и ответы"
        lead={`Что чаще всего спрашивают перед первой записью. Ответы основаны только на подтверждённой информации о сервисе — то, что неизвестно, мы не додумываем.`}
        breadcrumbs={[
          { href: '/', label: 'Главная' },
          { href: '/faq', label: 'Вопросы' },
        ]}
      />

      <FaqSection />

      <section className="shell pb-12">
        <div className="card p-5">
          <h2 className="text-[1.0625rem] font-bold text-white">Не нашли ответ?</h2>
          <p className="mt-2 max-w-2xl text-[0.875rem] leading-relaxed text-steel-400">
            Позвоните — так быстрее всего. Можно написать в WhatsApp или посмотреть полную карточку
            сервиса в 2ГИС: рейтинг, отзывы, фотографии и режим работы.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <ActionLink
              href={business.phone.e164}
              event="phone_clicked"
              payload={{ placement: 'faq_page' }}
              className="btn btn-primary btn-sm"
            >
              {business.phone.display}
            </ActionLink>
            <ActionLink
              href={business.whatsapp.deepLink}
              event="whatsapp_clicked"
              payload={{ placement: 'faq_page' }}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              WhatsApp
            </ActionLink>
            <ActionLink
              href={links.card}
              event="service_view"
              payload={{ placement: 'faq_page' }}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              2ГИС →
            </ActionLink>
            <ActionLink
              href={business.instagram.url}
              event="instagram_clicked"
              payload={{ placement: 'faq_page' }}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              Instagram
            </ActionLink>
          </div>
        </div>
      </section>

      <CtaBand
        placement="faq_final"
        photo="p12"
        alt="Рабочая зона цеха автосервиса"
        eyebrow="Запись"
        title="Готовы записаться?"
        body={`${business.hours.display}. ${business.address.streetShort}, ${business.city}. Выберите услугу и время — остальное подтвердит мастер.`}
      />
    </>
  );
}
