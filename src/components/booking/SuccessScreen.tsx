'use client';

import { business, links } from '@/data/business';
import { formatDateRuWithWeekday } from '@/lib/time';
import { buildBookingIcs } from '@/lib/ics';
import { track } from '@/lib/analytics';

type Props = {
  booking: {
    id: string;
    serviceTitle: string;
    slotDate: string;
    slotTime: string;
    name: string;
    phone: string;
  };
  onRestart: () => void;
};

/**
 * Success screen.
 *
 * WORDING CONTRACT: this site does NOT auto-confirm appointments — the master
 * confirms by phone. So the copy says "заявка принята, мы свяжемся для
 * подтверждения" and never "запись гарантированно подтверждена".
 *
 * If the owner later adds a real scheduling backend with automatic
 * confirmation, change `STATUS_IS_AUTOMATIC` to true and the copy switches to
 * a firm confirmation.
 */
const STATUS_IS_AUTOMATIC = false;

export function SuccessScreen({ booking, onRestart }: Props) {
  const downloadIcs = () => {
    const ics = buildBookingIcs({
      uid: booking.id,
      slotDate: booking.slotDate,
      slotTime: booking.slotTime,
      serviceTitle: booking.serviceTitle,
      customerName: booking.name,
    });
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tokyo-${booking.slotDate}-${booking.slotTime.replace(':', '')}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card metal-top overflow-hidden p-5 md:p-7" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ok/40 bg-ok/15 text-ok">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m5 12.5 4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div>
          <h2 className="text-display-3 font-extrabold text-white">Заявка принята</h2>
          <p className="mt-0.5 text-[0.875rem] text-steel-400">
            {STATUS_IS_AUTOMATIC
              ? 'Время подтверждено, ждём вас.'
              : 'Мы свяжемся с вами для подтверждения времени.'}
          </p>
        </div>
      </div>

      <dl className="mt-5 divide-y divide-hairline overflow-hidden rounded-xl border border-hairline">
        <div className="bg-surface p-3.5">
          <dt className="text-[0.6875rem] uppercase tracking-wider text-steel-600">Услуга</dt>
          <dd className="mt-0.5 text-[0.9375rem] font-semibold text-white">{booking.serviceTitle}</dd>
        </div>
        <div className="bg-surface p-3.5">
          <dt className="text-[0.6875rem] uppercase tracking-wider text-steel-600">Дата и время</dt>
          <dd className="mt-0.5 text-[0.9375rem] font-semibold text-white tnum">
            {formatDateRuWithWeekday(booking.slotDate)}, {booking.slotTime}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 bg-surface p-3.5">
          <div>
            <dt className="text-[0.6875rem] uppercase tracking-wider text-steel-600">Имя</dt>
            <dd className="mt-0.5 text-[0.9375rem] text-white">{booking.name}</dd>
          </div>
          <div className="text-right">
            <dt className="text-[0.6875rem] uppercase tracking-wider text-steel-600">Телефон</dt>
            <dd className="mt-0.5 text-[0.9375rem] text-white tnum">{booking.phone}</dd>
          </div>
        </div>
      </dl>

      <div className="mt-4 rounded-xl border border-hairline bg-surface-sunken p-3.5">
        <p className="text-[0.8125rem] leading-relaxed text-steel-400">
          <span className="font-semibold text-steel-200">Что дальше.</span> Заявка уже у мастера.
          Мы позвоним на указанный номер, чтобы подтвердить время и уточнить детали. Если удобнее
          письменно — напишите в WhatsApp.
        </p>
        <p className="mt-2 text-[0.75rem] text-steel-600">
          Номер заявки: <span className="font-mono">{booking.id.slice(0, 8)}</span>
        </p>
      </div>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        <a
          href={business.phone.e164}
          onClick={() => track('phone_clicked', { placement: 'success' })}
          className="btn btn-primary"
        >
          Позвонить
        </a>
        <a
          href={business.whatsapp.deepLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('whatsapp_clicked', { placement: 'success' })}
          className="btn btn-secondary"
        >
          WhatsApp
        </a>
        <button type="button" onClick={downloadIcs} className="btn btn-secondary">
          Добавить в календарь
        </button>
        <a
          href={links.route}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('route_clicked', { placement: 'success' })}
          className="btn btn-secondary"
        >
          Маршрут в 2ГИС
        </a>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4">
        <span className="text-[0.8125rem] text-steel-400">
          {business.address.full} · {business.hours.display}
        </span>
        <button
          type="button"
          onClick={onRestart}
          className="text-[0.8125rem] font-medium text-accent-bright hover:text-white"
        >
          Записать ещё одну машину →
        </button>
      </div>
    </div>
  );
}
