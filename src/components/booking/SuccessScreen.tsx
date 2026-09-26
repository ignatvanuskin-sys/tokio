'use client';

import Link from 'next/link';
import { business, links } from '@/data/business';
import { formatDateRuFull } from '@/lib/time';
import { buildBookingIcs } from '@/lib/ics';
import { track } from '@/lib/analytics';
import { CheckCircleIcon, PhoneIcon, PinIcon, WhatsAppIcon } from '@/components/icons';

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
 * confirms by phone. So the copy says the request was received and that we will
 * call, and never "ваша запись гарантированно подтверждена". If a real
 * auto-confirming scheduler is ever wired up, flip AUTOMATIC_CONFIRMATION to
 * true and the wording follows.
 */
const AUTOMATIC_CONFIRMATION = false;

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
    <div className="card overflow-hidden">
      <div className="step-in flex flex-col gap-6 p-6 md:p-8" role="status" aria-live="polite">
        {/* Заголовок ---------------------------------------------------- */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid size-16 place-items-center rounded-full border border-ok/40 bg-ok/10">
            <CheckCircleIcon className="size-8 text-ok" />
          </span>
          <p className="eyebrow justify-center">Заявка принята</p>
          <h2 className="text-[26px] font-semibold md:text-[32px]">Спасибо, {booking.name}!</h2>
          <p className="max-w-[46ch] text-[15px] leading-relaxed text-steel-400">
            {AUTOMATIC_CONFIRMATION
              ? 'Время подтверждено, ждём вас.'
              : 'Мы свяжемся с вами для подтверждения записи — позвоним или напишем в WhatsApp.'}
          </p>
        </div>

        {/* Детали заявки ------------------------------------------------ */}
        <dl className="card divide-y divide-hairline bg-surface-raised">
          {(
            [
              ['Номер заявки', `№${booking.id.slice(0, 4).toUpperCase()}`],
              ['Услуга', booking.serviceTitle],
              ['Дата', formatDateRuFull(booking.slotDate)],
              ['Время', booking.slotTime],
              ['Телефон', booking.phone],
              ['Адрес', `${business.address.streetShort}, ${business.city}`],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-5 px-5 py-3.5 text-[15px]">
              <dt className="text-steel-400">{label}</dt>
              <dd className="text-right font-semibold text-steel-50 tnum">{value}</dd>
            </div>
          ))}
        </dl>

        {/* Что дальше --------------------------------------------------- */}
        <div className="rounded-control border border-hairline bg-surface-sunken p-4">
          <p className="text-[14px] leading-relaxed text-steel-400">
            <span className="font-semibold text-steel-200">Что дальше.</span> Заявка уже у мастера.
            Он позвонит на указанный номер, подтвердит время и уточнит детали. Стоимость работ
            назовём после диагностики — до начала ремонта.
          </p>
        </div>

        {/* Действия ----------------------------------------------------- */}
        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href={business.phone.e164}
            onClick={() => track('phone_clicked', { placement: 'success' })}
            className="btn btn-primary"
          >
            <PhoneIcon className="size-5" />
            Позвонить
          </a>
          <a
            href={business.whatsapp.deepLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('whatsapp_clicked', { placement: 'success' })}
            className="btn btn-secondary"
          >
            <WhatsAppIcon className="size-5" />
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
            <PinIcon className="size-5" />
            Маршрут в 2ГИС
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4">
          <p className="hint">
            Опаздываете или хотите раньше? Позвоните — договоримся. Работаем{' '}
            {business.hours.display.toLowerCase()}.
          </p>
          <button
            type="button"
            onClick={onRestart}
            className="text-[13px] font-medium text-accent hover:text-accent-bright"
          >
            Записать ещё одну машину →
          </button>
        </div>

        <p className="text-center text-[13px] text-steel-600">
          <Link href="/" className="underline-offset-4 hover:text-steel-200 hover:underline">
            Вернуться на главную
          </Link>
        </p>
      </div>
    </div>
  );
}
