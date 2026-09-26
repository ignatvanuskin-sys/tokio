'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import type { BookingRecord, BookingStatus } from '@/lib/booking/types';
import { STATUS_LABELS } from '@/lib/booking/types';
import { business } from '@/data/business';
import { formatDateRuWithWeekday } from '@/lib/time';
import { prettyPhone } from '@/lib/phone';

const STATUS_STYLE: Record<BookingStatus, string> = {
  new: 'border-accent/50 bg-accent/10 text-accent-bright',
  confirmed: 'border-ok/40 bg-ok/10 text-ok',
  done: 'border-hairline bg-surface-raised text-steel-400',
  cancelled: 'border-hairline bg-surface-sunken text-steel-600 line-through',
};

/**
 * The board the owner actually works from on a phone.
 *
 * Layout: bookings grouped by day, each card showing time → client → vehicle →
 * service → one-tap call / WhatsApp / status change. Status changes PATCH the
 * API and refresh the server component, so the list is always the database's
 * truth — no optimistic lie if the request fails.
 */
export function AdminBoard({ bookings, today }: { bookings: BookingRecord[]; today: string }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, BookingRecord[]>();
    for (const b of bookings) {
      const list = map.get(b.slotDate) ?? [];
      list.push(b);
      map.set(b.slotDate, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [bookings]);

  const setStatus = async (id: string, status: BookingStatus) => {
    if (pendingId) return;
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { message?: string } | null;
        setError(json?.message ?? 'Не удалось обновить статус.');
        return;
      }
      router.refresh();
    } catch {
      setError('Не удалось обновить статус: нет соединения.');
    } finally {
      setPendingId(null);
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-[0.9375rem] font-semibold text-white">Заявок нет</p>
        <p className="mx-auto mt-2 max-w-sm text-[0.875rem] leading-relaxed text-steel-400">
          По выбранным фильтрам записей нет. Измените период или снимите фильтр по статусу и услуге.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      {error && (
        <p role="alert" className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-[0.8125rem] text-steel-50">
          {error}
        </p>
      )}

      {grouped.map(([date, list]) => (
        <section key={date} aria-labelledby={`day-${date}`}>
          <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline pb-2">
            <h2 id={`day-${date}`} className="text-[0.9375rem] font-bold text-white">
              {date === today ? 'Сегодня · ' : ''}
              {formatDateRuWithWeekday(date)}
            </h2>
            <span className="font-mono text-[0.75rem] text-steel-600 tnum">
              {list.length} {list.length === 1 ? 'заявка' : 'заявки'}
            </span>
          </header>

          <ul className="mt-3 flex flex-col gap-3">
            {list.map((b) => {
              const vehicle =
                [b.vehicleMake, b.vehicleModel, b.vehicleYear ? String(b.vehicleYear) : null]
                  .filter(Boolean)
                  .join(' ') || 'Авто не указано';

              return (
                <li key={b.id} className="card p-4">
                  <div className="flex items-start gap-3.5">
                    {/* Time + status rail */}
                    <div className="w-[62px] shrink-0">
                      <span className="block text-[1.125rem] font-extrabold leading-none text-white tnum">
                        {b.slotTime}
                      </span>
                      <span
                        className={`mt-2 inline-block rounded-pill border px-2 py-0.5 text-[0.625rem] font-semibold ${STATUS_STYLE[b.status]}`}
                      >
                        {STATUS_LABELS[b.status]}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[0.9375rem] font-semibold text-white">{b.customerName}</p>

                      <a
                        href={`tel:${b.customerPhone}`}
                        className="mt-0.5 block font-mono text-[0.8125rem] text-steel-200 hover:text-white tnum"
                      >
                        {prettyPhone(b.customerPhone)}
                      </a>

                      <p className="mt-2 text-[0.8125rem] leading-snug text-steel-400">
                        <span className="text-steel-200">{b.serviceTitle}</span>
                        <span className="mx-1.5 text-steel-600">·</span>
                        {vehicle}
                      </p>

                      {b.comment && (
                        <p className="mt-2 rounded-lg border border-hairline bg-surface-sunken p-2.5 text-[0.8125rem] leading-relaxed text-steel-400">
                          {b.comment}
                        </p>
                      )}

                      <p className="mt-2 font-mono text-[0.6875rem] text-steel-600">
                        #{b.id.slice(0, 8)} · создана{' '}
                        {new Date(b.createdAt).toLocaleString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>

                      {/* Actions */}
                      <div className="mt-3.5 flex flex-wrap gap-2">
                        <a href={`tel:${b.customerPhone}`} className="btn btn-secondary btn-sm">
                          Позвонить
                        </a>
                        <a
                          href={`https://wa.me/${b.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `${b.customerName}, здравствуйте! Это ${business.category} «${business.name}» — по вашей заявке на ${b.serviceTitle} (${b.slotTime}). Подтверждаем время?`,
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                        >
                          WhatsApp
                        </a>

                        <label className="sr-only" htmlFor={`status-${b.id}`}>
                          Статус заявки {b.customerName}
                        </label>
                        <select
                          id={`status-${b.id}`}
                          value={b.status}
                          disabled={pendingId === b.id}
                          onChange={(e) => void setStatus(b.id, e.target.value as BookingStatus)}
                          className="field h-[42px] min-h-0 w-auto py-0 text-[0.8125rem]"
                        >
                          {(Object.keys(STATUS_LABELS) as BookingStatus[]).map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
