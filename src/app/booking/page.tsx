import { Suspense } from 'react';
import type { Metadata } from 'next';

import { business } from '@/data/business';
import { daySlotStarts, scheduleConfig } from '@/data/schedule';
import { services } from '@/data/services';
import { bookableDates, isSlotBookable, venueDate } from '@/lib/time';
import { getStoreSafe, isDemoMode } from '@/lib/booking';
import { BookingWidget } from '@/components/booking/BookingWidget';
import { ActionLink } from '@/components/actions';
import { PageHeader } from '@/components/PageHeader';
import { FaqSection } from '@/components/FaqSection';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Запись на сервис',
  description:
    `Онлайн-запись в автосервис «${business.name}» в ${business.city}: выберите услугу, дату ` +
    `и удобное время. ${business.hours.display}. ${business.address.streetShort}.`,
  alternates: { canonical: '/booking' },
  robots: { index: true, follow: true },
};

/**
 * Booking page.
 *
 * Rendered on the server so the FIRST paint already contains the real dates and
 * the real slot grid for the default day — the customer sees the calendar
 * immediately, with no spinner and no client-side clock/timezone drift.
 */
export default async function BookingPage() {
  const now = new Date();
  const todayKey = venueDate(now);
  const dates = bookableDates(14, now);
  const initialDate = dates[0] ?? todayKey;

  // Never throws: if the store is unavailable the widget still renders and the
  // server re-validates on submit.
  const { store } = getStoreSafe();
  const availability = store
    ? await store.availability(initialDate, now).catch(() => null)
    : null;

  const fallbackAvailability = {
    date: initialDate,
    timeZone: scheduleConfig.timeZone,
    slotMinutes: scheduleConfig.slotMinutes,
    slots: daySlotStarts().map((time) => ({
      time,
      taken: 0,
      capacity: scheduleConfig.capacityPerSlot,
      available: true,
      bookable: isSlotBookable(initialDate, time, now),
    })),
  };

  return (
    <>
      <PageHeader
        eyebrow="Онлайн-запись"
        title="Записаться на сервис"
        lead={`${business.hours.display}. Заполнение — меньше минуты, регистрация не нужна. Время подтвердит мастер: мы позвоним по указанному номеру.`}
        breadcrumbs={[{ href: '/', label: 'Главная' }, { href: '/booking', label: 'Запись' }]}
      />

      <div className="shell grid gap-7 pb-12 lg:grid-cols-[1.35fr_1fr] lg:items-start lg:gap-10 lg:pb-20">
        <Suspense
          fallback={
            <div className="card metal-top p-5">
              <div className="h-4 w-40 animate-pulse rounded bg-surface-raised" />
              <div className="mt-5 h-8 w-64 animate-pulse rounded bg-surface-raised" />
              <div className="mt-6 grid grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-[52px] animate-pulse rounded-xl bg-surface-raised" />
                ))}
              </div>
            </div>
          }
        >
          <BookingWidget
            todayKey={todayKey}
            bookableDates={dates}
            initialAvailability={availability ?? fallbackAvailability}
            initialServiceSlug={services[0]?.slug ?? ''}
            isDemo={isDemoMode()}
          />
        </Suspense>

        {/* Side rail ------------------------------------------------- */}
        <aside className="flex flex-col gap-4">
          <div className="card p-5">
            <h2 className="text-[0.9375rem] font-bold text-white">Предпочитаете голосом?</h2>
            <p className="mt-1.5 text-[0.875rem] leading-relaxed text-steel-400">
              Позвоните или напишите в WhatsApp — примем заявку так же, вручную.
            </p>
            <div className="mt-4 flex flex-col gap-2.5">
              <ActionLink
                href={business.phone.e164}
                event="phone_clicked"
                payload={{ placement: 'booking_aside' }}
                className="btn btn-secondary btn-block"
              >
                {business.phone.display}
              </ActionLink>
              <ActionLink
                href={business.whatsapp.deepLink}
                event="whatsapp_clicked"
                payload={{ placement: 'booking_aside' }}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-block"
              >
                WhatsApp
              </ActionLink>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-[0.9375rem] font-bold text-white">Что взять с собой</h2>
            <ul className="mt-3 flex flex-col gap-2.5 text-[0.875rem] text-steel-400">
              <li className="flex gap-2.5">
                <span aria-hidden="true" className="text-accent">•</span>
                Автомобиль и ключи — остальное найдётся на месте.
              </li>
              <li className="flex gap-2.5">
                <span aria-hidden="true" className="text-accent">•</span>
                Если есть — свои расходники: масло, фильтры. Работаем и с ними.
              </li>
              <li className="flex gap-2.5">
                <span aria-hidden="true" className="text-accent">•</span>
                Коротко опишите симптом: это экономит время на диагностике.
              </li>
            </ul>
          </div>

          <div className="card p-5">
            <h2 className="text-[0.9375rem] font-bold text-white">Стоимость работ</h2>
            <p className="mt-1.5 text-[0.875rem] leading-relaxed text-steel-400">
              {business.priceNoteLong}
            </p>
          </div>
        </aside>
      </div>

      <FaqSection />
    </>
  );
}
