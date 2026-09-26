import Link from 'next/link';
import type { Metadata } from 'next';

import { business, isOpenNow, links } from '@/data/business';
import { scheduleConfig } from '@/data/schedule';
import { serviceGroups } from '@/data/services';
import { siteMeta } from '@/lib/site';

import { Hero } from '@/components/Hero';
import { TrustBar } from '@/components/TrustBar';
import { ServiceGrid } from '@/components/ServiceGrid';
import { WhyUs } from '@/components/WhyUs';
import { VisitSteps } from '@/components/VisitSteps';
import { Gallery } from '@/components/Gallery';
import { Reviews } from '@/components/Reviews';
import { FaqSection } from '@/components/FaqSection';
import { LocationBlock } from '@/components/LocationBlock';
import { CtaBand } from '@/components/CtaBand';
import { StickyCta } from '@/components/StickyCta';
import { Reveal } from '@/components/Reveal';
import { ActionLink } from '@/components/actions';

export const metadata: Metadata = {
  title: siteMeta.title,
  description: siteMeta.description,
  alternates: { canonical: '/' },
};

/**
 * Home page — the conversion path:
 *   кто мы → доверие → услуги → почему → как записаться → фото → отзывы
 *   → запись → вопросы → где мы → запись
 *
 * Two "Записаться" bands plus the hero CTA, and never a permanent overlay
 * covering content (StickyCta is a dismissible pill, mobile only).
 */
export default function HomePage() {
  const initialOpen = isOpenNow(new Date(), scheduleConfig.timeZone);

  return (
    <>
      <Hero initialOpen={initialOpen} />
      <TrustBar />

      <ServiceGrid featuredOnly />

      <CtaBand
        placement="home_after_services"
        photo="p01"
        alt="Автомобиль на подъёмнике в цехе автосервиса"
        eyebrow="Не знаете, что сломалось?"
        title="Начните с диагностики"
        body="Опишите проблему своими словами — мастер разберётся на месте. Стоимость работ называем после диагностики, до начала ремонта."
        ctaLabel="Записаться на диагностику"
      />

      <WhyUs />
      <VisitSteps />

      {/* Gallery ------------------------------------------------------- */}
      <section aria-labelledby="gallery-heading" className="shell py-12 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <span className="eyebrow">Фотографии</span>
            <h2 id="gallery-heading" className="mt-2 text-display-3 font-extrabold text-white">
              Как выглядит сервис изнутри
            </h2>
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-steel-400">
              {business.galleryCount} реальных фотографий с карточки в 2ГИС: цех, подъёмники,
              развал-схождение, расходники. Нажмите, чтобы открыть во весь экран.
            </p>
          </div>
          <Link href="/gallery" className="btn btn-secondary btn-sm">
            Все {business.galleryCount} фото →
          </Link>
        </div>

        <Gallery layout="rail" showFilter={false} limit={10} />
      </section>

      <Reviews compact />

      <CtaBand
        placement="home_after_reviews"
        photo="p15"
        alt="Въезд в бокс автосервиса"
        eyebrow="Запись"
        title="Выберите время — остальное сделаем мы"
        body="Свободные слоты видны сразу. Заполнение занимает меньше минуты, регистрация не нужна."
        showRoute
      />

      <FaqSection limit={6} />

      <LocationBlock />

      {/* Service groups overview (internal linking + SEO) -------------- */}
      <section aria-labelledby="groups-heading" className="shell pb-12 md:pb-20">
        <h2 id="groups-heading" className="eyebrow">
          Направления работ
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {serviceGroups.map((g) => (
            <li key={g.id}>
              <Link href={`/services#${g.id}`} className="chip">
                {g.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/services" className="chip border-accent/50 text-accent-bright">
              Все услуги →
            </Link>
          </li>
        </ul>
      </section>

      <CtaBand
        placement="home_final"
        photo="p09"
        alt="Вечерняя работа автосервиса"
        eyebrow="Последний шаг"
        title="Записаться в «Токио»"
        body={`${business.hours.display}. ${business.address.streetShort}, ${business.city}. Или позвоните — ответим в рабочие часы.`}
      />

      {/* Contact fallback for people who will not fill a form ---------- */}
      <section className="shell pb-14">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-hairline bg-graphite p-5">
            <p className="max-w-md text-[0.875rem] leading-relaxed text-steel-400">
              Предпочитаете написать? Все контакты — на странице{' '}
              <Link href="/contacts" className="text-steel-200 underline decoration-steel-800 underline-offset-2 hover:text-white">
                «Контакты»
              </Link>
              , отзывы клиентов —{' '}
              <ActionLink
                href={links.reviews}
                event="service_view"
                payload={{ placement: 'home_footer_links' }}
                target="_blank"
                rel="noopener noreferrer"
                className="text-steel-200 underline decoration-steel-800 underline-offset-2 hover:text-white"
              >
                в 2ГИС
              </ActionLink>
              .
            </p>
            <ActionLink
              href={business.whatsapp.deepLink}
              event="whatsapp_clicked"
              payload={{ placement: 'home_footer' }}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              Написать в WhatsApp
            </ActionLink>
          </div>
        </Reveal>
      </section>

      <StickyCta />
    </>
  );
}
