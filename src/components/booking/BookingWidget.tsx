'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { business } from '@/data/business';
import { serviceGroups, services } from '@/data/services';
import type { DayAvailability } from '@/lib/booking/types';
import { checkPhone } from '@/lib/phone';
import {
  addDays,
  formatDateRu,
  formatDateRuFull,
  formatDateRuWithWeekday,
  relativeDayLabel,
  weekdayNameRu,
} from '@/lib/time';
import { track } from '@/lib/analytics';
import { StepProgress, BOOKING_STEPS } from './StepProgress';
import { PhoneField } from './PhoneField';
import { SuccessScreen } from './SuccessScreen';

type Draft = {
  serviceSlug: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  slotDate: string;
  slotTime: string;
  name: string;
  phone: string;
  comment: string;
  idempotencyKey: string;
};

type Props = {
  todayKey: string;
  bookableDates: string[];
  initialAvailability: DayAvailability;
  initialServiceSlug: string;
  isDemo: boolean;
};

const DRAFT_KEY = 'tokyo_booking_draft_v1';

function newKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  // Extremely old browsers: still a valid v4-shaped UUID.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function BookingWidget({
  todayKey,
  bookableDates,
  initialAvailability,
  initialServiceSlug,
  isDemo,
}: Props) {
  const params = useSearchParams();
  const fromQuery = params.get('service');

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(() => ({
    serviceSlug: fromQuery && services.some((s) => s.slug === fromQuery) ? fromQuery : initialServiceSlug,
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    slotDate: bookableDates[0] ?? todayKey,
    slotTime: '',
    name: '',
    phone: '',
    comment: '',
    idempotencyKey: newKey(),
  }));

  const [availability, setAvailability] = useState<DayAvailability>(initialAvailability);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<{
    message: string;
    action: 'retry' | 'contact';
  } | null>(null);
  const [confirmed, setConfirmed] = useState<null | {
    id: string;
    serviceTitle: string;
    slotDate: string;
    slotTime: string;
    name: string;
    phone: string;
  }>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);

  /* ---------------------------------------------------------------- draft */

  // Restore an in-progress draft so a refresh or an accidental Back does not
  // wipe what the customer already typed.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<Draft>;
      setDraft((d) => ({
        ...d,
        ...saved,
        // Never restore a stale date/slot — availability may have changed.
        slotTime: '',
        idempotencyKey: saved.idempotencyKey || d.idempotencyKey,
      }));
      if (saved.serviceSlug) setStep(queryStep(saved));
    } catch {
      /* corrupted storage — start clean */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* private mode — ignore */
    }
  }, [draft]);

  // Guard: browsers restore form state on Back; make sure our state is the truth.
  useEffect(() => {
    const onPop = () => {
      try {
        const raw = sessionStorage.getItem(DRAFT_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<Draft>;
          setDraft((d) => ({ ...d, ...saved, slotTime: '' }));
        }
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const patch = useCallback((p: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...p }));
    setFormError(null);
  }, []);

  /* ------------------------------------------------------------ selecting */

  const selectedService = useMemo(
    () => services.find((s) => s.slug === draft.serviceSlug),
    [draft.serviceSlug],
  );

  const groupedServices = useMemo(
    () =>
      serviceGroups
        .map((g) => ({ group: g, items: services.filter((s) => s.group === g.id) }))
        .filter((g) => g.items.length > 0),
    [],
  );

  /* --------------------------------------------------------- availability */

  const loadAvailability = useCallback(async (dateKey: string) => {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/availability?date=${encodeURIComponent(dateKey)}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { ok: boolean; availability: DayAvailability };
      if (json.ok) setAvailability(json.availability);
    } catch {
      // Keep the previous availability rather than showing an empty grid; the
      // submit path re-checks server-side anyway.
      setFormError({
        message: 'Не удалось загрузить свободное время. Проверьте соединение и попробуйте ещё раз.',
        action: 'retry',
      });
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (step === 4 && availability.date !== draft.slotDate) {
      void loadAvailability(draft.slotDate);
    }
  }, [step, draft.slotDate, availability.date, loadAvailability]);

  /* ----------------------------------------------------------- validation */

  const validateStep = (n: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (n === 1) {
      if (!draft.serviceSlug) e.serviceSlug = 'Выберите услугу';
    }
    if (n === 2) {
      const year = draft.vehicleYear.trim();
      if (year) {
        const y = Number(year);
        const max = new Date().getFullYear() + 1;
        if (!Number.isFinite(y) || y < 1950 || y > max) e.vehicleYear = 'Проверьте год выпуска';
      }
      // Make and model are optional on purpose — never block a booking on them.
    }
    if (n === 3) {
      if (!draft.slotDate) e.slotDate = 'Выберите дату';
      else if (!bookableDates.includes(draft.slotDate)) {
        // Allow dates typed into the native picker beyond the chip list.
        if (draft.slotDate < todayKey || draft.slotDate > addDays(todayKey, 30)) {
          e.slotDate = 'Дата вне доступного периода записи';
        }
      }
    }
    if (n === 4) {
      if (!draft.slotTime) e.slotTime = 'Выберите время';
      else {
        const slot = availability.slots.find((s) => s.time === draft.slotTime);
        if (!slot || !slot.available) e.slotTime = 'Это время недоступно, выберите другое';
      }
    }
    if (n === 5) {
      if (draft.name.trim().length < 2) e.name = 'Укажите имя';
      const phone = checkPhone(draft.phone);
      if (!phone.ok) e.phone = phone.message;
    }
    return e;
  };

  const goNext = () => {
    const e = validateStep(step);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      focusFirstInvalid(e);
      return;
    }
    if (step === 1) track('service_selected', { serviceSlug: draft.serviceSlug, step: 'wizard' });
    if (step === 2) track('booking_started', { step: 'vehicle', stepIndex: 2 });
    if (step === 3) track('date_selected', { slotDate: draft.slotDate, step: 'wizard' });
    if (step === 4) track('time_selected', { slotTime: draft.slotTime, step: 'wizard' });

    const next = Math.min(step + 1, BOOKING_STEPS.length);
    setStep(next);
    announce();
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
    announce();
  };

  const jumpTo = (n: number) => {
    setErrors({});
    setStep(n);
  };

  function focusFirstInvalid(e: Record<string, string>) {
    const first = Object.keys(e)[0];
    if (!first) return;
    window.setTimeout(() => {
      document.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
    }, 30);
  }

  function announce() {
    window.setTimeout(() => headingRef.current?.focus(), 30);
  }

  /* --------------------------------------------------------------- submit */

  const submit = async () => {
    if (submitting) return; // belt and braces against a double tap

    const e = validateStep(5);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      setStep(5);
      focusFirstInvalid(e);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    track('booking_submitted', { serviceSlug: draft.serviceSlug, slotDate: draft.slotDate, slotTime: draft.slotTime });

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          serviceSlug: draft.serviceSlug,
          slotDate: draft.slotDate,
          slotTime: draft.slotTime,
          name: draft.name.trim(),
          phone: draft.phone,
          vehicleMake: draft.vehicleMake.trim(),
          vehicleModel: draft.vehicleModel.trim(),
          vehicleYear: draft.vehicleYear.trim(),
          comment: draft.comment.trim(),
          idempotencyKey: draft.idempotencyKey,
        }),
      });

      const json = (await res.json().catch(() => null)) as
        | {
            ok: boolean;
            code?: string;
            message?: string;
            fields?: Record<string, string>;
            booking?: { id: string; serviceTitle: string; slotDate: string; slotTime: string; customerName: string };
            availability?: DayAvailability;
          }
        | null;

      // ---- Slot conflict: the race the backend is built to catch ----------
      if (res.status === 409 || json?.code === 'slot_taken' || json?.code === 'slot_not_bookable') {
        if (json?.availability) setAvailability(json.availability);
        else void loadAvailability(draft.slotDate);
        patch({ slotTime: '' });
        setErrors({ slotTime: json?.message ?? 'Это время только что заняли. Выберите другой слот.' });
        setStep(4);
        track('booking_error', { errorCode: 'slot_taken' });
        announce();
        return;
      }

      if (res.status === 429 || json?.code === 'rate_limited') {
        setFormError({
          message: 'Слишком много попыток отправки. Подождите минуту и попробуйте снова.',
          action: 'retry',
        });
        track('booking_error', { errorCode: 'rate_limited' });
        return;
      }

      if (res.status === 400 && json?.fields) {
        setErrors(json.fields);
        // Send the user to the step that owns the first problem.
        const order = ['serviceSlug', 'vehicleYear', 'slotDate', 'slotTime', 'name', 'phone', 'comment'];
        const firstKey = order.find((k) => json.fields?.[k]);
        setStep(firstKey === 'serviceSlug' ? 1 : firstKey === 'vehicleYear' ? 2 : firstKey === 'slotDate' ? 3 : firstKey === 'slotTime' ? 4 : 5);
        focusFirstInvalid(json.fields);
        track('booking_error', { errorCode: 'validation' });
        return;
      }

      if (!res.ok || !json?.ok || !json.booking) {
        setFormError({
          message:
            json?.message ??
            'Не удалось отправить заявку. Позвоните нам или напишите в WhatsApp — примем заявку вручную.',
          action: 'contact',
        });
        track('booking_error', { errorCode: json?.code ?? `http_${res.status}` });
        return;
      }

      // ---- Success --------------------------------------------------------
      setConfirmed({
        id: json.booking.id,
        serviceTitle: json.booking.serviceTitle,
        slotDate: json.booking.slotDate,
        slotTime: json.booking.slotTime,
        name: json.booking.customerName,
        phone: draft.phone,
      });
      track('booking_success', { serviceSlug: draft.serviceSlug, slotDate: draft.slotDate, slotTime: draft.slotTime });
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
    } catch {
      // Network-level failure — the request never reached the server.
      setFormError({
        message: 'Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз.',
        action: 'retry',
      });
      track('booking_error', { errorCode: 'network' });
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setConfirmed(null);
    setStep(1);
    setDraft((d) => ({
      serviceSlug: initialServiceSlug,
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      slotDate: bookableDates[0] ?? todayKey,
      slotTime: '',
      name: '',
      phone: '',
      comment: '',
      idempotencyKey: newKey(),
    }));
    void loadAvailability(bookableDates[0] ?? todayKey);
  };

  /* ---------------------------------------------------------------- render */

  if (confirmed) {
    return <SuccessScreen booking={confirmed} onRestart={restart} />;
  }

  return (
    <div className="card metal-top p-4 md:p-6">
      <StepProgress current={step} />

      {isDemo && (
        <p className="mt-4 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-[0.75rem] leading-relaxed text-warn">
          Демонстрационный режим: заявки сохраняются в файл на сервере, а не в PostgreSQL.
          Для запуска в продакшене задайте <code className="font-mono">DATABASE_URL</code>.
        </p>
      )}

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-5 text-display-3 font-extrabold text-white outline-none"
      >
        {step === 1 && 'Что нужно автомобилю?'}
        {step === 2 && 'Автомобиль'}
        {step === 3 && 'Когда удобно приехать?'}
        {step === 4 && 'Выберите время'}
        {step === 5 && 'Как с вами связаться?'}
        {step === 6 && 'Проверьте заявку'}
      </h2>
      <p className="mt-1.5 text-[0.875rem] leading-relaxed text-steel-400">
        {step === 1 && 'Если не знаете, что сломалось — выберите диагностику.'}
        {step === 2 && 'Всё необязательно: можно пропустить и уточнить на месте.'}
        {step === 3 && `Запись открыта на ${bookableDates.length} дней вперёд, ежедневно.`}
        {step === 4 && `${formatDateRuFull(draft.slotDate)} · ${business.hours.display.toLowerCase()}`}
        {step === 5 && 'Нужны только имя и телефон. Комментарий — по желанию.'}
        {step === 6 && 'Проверьте данные и подтвердите. Время подтвердит мастер.'}
      </p>

      {/* --------------------------------------------------- STEP 1: service */}
      {step === 1 && (
        <div className="mt-5" data-field="serviceSlug">
          <fieldset>
            <legend className="sr-only">Выберите услугу</legend>
            <div className="flex flex-col gap-4">
              {groupedServices.map(({ group, items }) => (
                <div key={group.id}>
                  <p className="eyebrow">{group.label}</p>
                  <div className="mt-2 flex flex-col gap-2">
                    {items.map((s) => {
                      const active = draft.serviceSlug === s.slug;
                      return (
                        <label
                          key={s.slug}
                          className={`flex min-h-[56px] cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                            active
                              ? 'border-accent/70 bg-accent-wash'
                              : 'border-hairline bg-surface-sunken hover:border-hairlineStrong'
                          }`}
                        >
                          <input
                            type="radio"
                            name="service"
                            value={s.slug}
                            checked={active}
                            onChange={() => patch({ serviceSlug: s.slug, slotTime: '' })}
                            className="mt-1 h-4 w-4 shrink-0 accent-[#E0242F]"
                          />
                          <span className="min-w-0">
                            <span className="block text-[0.9375rem] font-semibold text-white">
                              {s.title}
                            </span>
                            <span className="mt-0.5 block text-[0.8125rem] leading-snug text-steel-400">
                              {s.summary}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
          {errors.serviceSlug && (
            <p className="field-error" role="alert">
              {errors.serviceSlug}
            </p>
          )}
        </div>
      )}

      {/* ----------------------------------------------------- STEP 2: vehicle */}
      {step === 2 && (
        <div className="mt-5 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="vmake" className="field-label">
                Марка
              </label>
              <input
                id="vmake"
                data-field="vehicleMake"
                list="brands"
                autoComplete="off"
                enterKeyHint="next"
                value={draft.vehicleMake}
                onChange={(e) => patch({ vehicleMake: e.target.value })}
                placeholder="Toyota"
                className="field"
                maxLength={40}
              />
              <datalist id="brands">
                {business.brands.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="vmodel" className="field-label">
                Модель
              </label>
              <input
                id="vmodel"
                data-field="vehicleModel"
                autoComplete="off"
                enterKeyHint="next"
                value={draft.vehicleModel}
                onChange={(e) => patch({ vehicleModel: e.target.value })}
                placeholder="Camry"
                className="field"
                maxLength={60}
              />
            </div>
          </div>

          <div className="sm:max-w-[10rem]">
            <label htmlFor="vyear" className="field-label">
              Год
            </label>
            <input
              id="vyear"
              data-field="vehicleYear"
              inputMode="numeric"
              autoComplete="off"
              enterKeyHint="done"
              value={draft.vehicleYear}
              onChange={(e) => patch({ vehicleYear: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              placeholder="2019"
              aria-invalid={Boolean(errors.vehicleYear) || undefined}
              className="field tnum"
            />
            {errors.vehicleYear && (
              <p className="field-error" role="alert">
                {errors.vehicleYear}
              </p>
            )}
          </div>

          <p className="field-hint">
            Марка и модель помогают подготовить запчасти заранее. Можно не заполнять.
          </p>
        </div>
      )}

      {/* -------------------------------------------------------- STEP 3: date */}
      {step === 3 && (
        <div className="mt-5" data-field="slotDate">
          <div className="rail -mx-4 flex-wrap gap-2 px-4 sm:mx-0 sm:px-0">
            {bookableDates.map((d) => {
              const active = draft.slotDate === d;
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={active}
                  onClick={() => patch({ slotDate: d, slotTime: '' })}
                  className="chip min-w-[74px] shrink-0 flex-col items-start py-2"
                >
                  <span className="text-[0.8125rem] font-semibold">
                    {relativeDayLabel(d, todayKey) === 'Сегодня' ||
                    relativeDayLabel(d, todayKey) === 'Завтра'
                      ? relativeDayLabel(d, todayKey)
                      : weekdayNameRu(d, true)}
                  </span>
                  <span className="text-[0.6875rem] text-steel-400 tnum">{formatDateRu(d)}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <label htmlFor="exact-date" className="field-label">
              Или выберите дату в календаре
            </label>
            <input
              id="exact-date"
              type="date"
              value={draft.slotDate}
              min={todayKey}
              max={addDays(todayKey, 30)}
              onChange={(e) => patch({ slotDate: e.target.value, slotTime: '' })}
              className="field tnum sm:max-w-[16rem]"
            />
          </div>

          {errors.slotDate && (
            <p className="field-error" role="alert">
              {errors.slotDate}
            </p>
          )}
        </div>
      )}

      {/* -------------------------------------------------------- STEP 4: time */}
      {step === 4 && (
        <div className="mt-5" data-field="slotTime">
          {loadingSlots ? (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <li key={i} className="h-[52px] animate-pulse rounded-xl bg-surface-raised" />
              ))}
            </ul>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {availability.slots.map((slot) => {
                const disabled = !slot.available || !slot.bookable;
                const active = draft.slotTime === slot.time;
                return (
                  <li key={slot.time}>
                    <button
                      type="button"
                      disabled={disabled}
                      aria-pressed={active}
                      onClick={() => patch({ slotTime: slot.time })}
                      className={`flex min-h-[52px] w-full items-center justify-center rounded-xl border text-[0.9375rem] font-semibold transition tnum ${
                        active
                          ? 'border-accent bg-accent text-white'
                          : disabled
                            ? 'cursor-not-allowed border-hairline bg-surface-sunken text-steel-600 line-through'
                            : 'border-hairline bg-surface-sunken text-steel-50 hover:border-accent/60 hover:bg-accent-wash'
                      }`}
                      title={disabled ? 'Время занято' : 'Свободно'}
                    >
                      {slot.time}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[0.75rem] text-steel-600">
              Серым зачёркнуто занятое время. Изменения видны сразу.{' '}
              {availability.slots.every((s) => !s.available) && 'На этот день всё занято — выберите другую дату.'}
            </p>
            <button
              type="button"
              onClick={() => void loadAvailability(draft.slotDate)}
              className="inline-flex min-h-[36px] items-center gap-1.5 text-[0.75rem] font-medium text-accent-bright hover:text-white"
            >
              Обновить расписание
            </button>
          </div>

          {errors.slotTime && (
            <p className="field-error" role="alert">
              <span aria-hidden="true">⚠</span>
              {errors.slotTime}
            </p>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- STEP 5: contacts */}
      {step === 5 && (
        <div className="mt-5 flex flex-col gap-4">
          <div>
            <label htmlFor="bname" className="field-label">
              Имя<span className="text-accent-bright"> *</span>
            </label>
            <input
              id="bname"
              data-field="name"
              autoComplete="name"
              enterKeyHint="next"
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Как к вам обращаться"
              maxLength={80}
              aria-invalid={Boolean(errors.name) || undefined}
              aria-describedby={errors.name ? 'bname-error' : undefined}
              className="field"
            />
            {errors.name && (
              <p id="bname-error" className="field-error" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <PhoneField
            value={draft.phone}
            onChange={(v) => patch({ phone: v })}
            error={errors.phone}
          />

          <div>
            <label htmlFor="bcomment" className="field-label">
              Комментарий <span className="text-steel-600">(необязательно)</span>
            </label>
            <textarea
              id="bcomment"
              data-field="comment"
              rows={3}
              value={draft.comment}
              onChange={(e) => patch({ comment: e.target.value })}
              placeholder="Например: стучит справа спереди на кочках"
              maxLength={600}
              className="field resize-y py-3"
            />
            <p className="field-hint">{draft.comment.length} / 600</p>
          </div>
        </div>
      )}

      {/* --------------------------------------------------- STEP 6: confirm */}
      {step === 6 && (
        <div className="mt-5">
          <dl className="divide-y divide-hairline overflow-hidden rounded-xl border border-hairline">
            <SummaryRow label="Услуга" value={selectedService?.title ?? '—'} onEdit={() => jumpTo(1)} />
            <SummaryRow
              label="Авто"
              value={
                [draft.vehicleMake, draft.vehicleModel, draft.vehicleYear]
                  .map((v) => v.trim())
                  .filter(Boolean)
                  .join(' ') || 'не указано'
              }
              onEdit={() => jumpTo(2)}
            />
            <SummaryRow label="Дата" value={formatDateRuWithWeekday(draft.slotDate)} onEdit={() => jumpTo(3)} />
            <SummaryRow label="Время" value={draft.slotTime || '—'} onEdit={() => jumpTo(4)} />
            <SummaryRow label="Имя" value={draft.name} onEdit={() => jumpTo(5)} />
            <SummaryRow label="Телефон" value={draft.phone} onEdit={() => jumpTo(5)} />
            {draft.comment.trim() && (
              <SummaryRow label="Комментарий" value={draft.comment.trim()} onEdit={() => jumpTo(5)} />
            )}
          </dl>

          <p className="mt-4 rounded-xl border border-hairline bg-surface-sunken p-3.5 text-[0.8125rem] leading-relaxed text-steel-400">
            Отправляя заявку, вы соглашаетесь на обработку указанных данных для подтверждения
            записи. Мы не рассылаем рекламу. Стоимость работ — после диагностики.
          </p>

          {formError && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-accent/40 bg-accent/10 p-3.5 text-[0.8125rem] leading-relaxed text-steel-50"
            >
              <p>{formError.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {formError.action === 'retry' && (
                  <button type="button" onClick={() => void submit()} className="btn btn-secondary btn-sm">
                    Попробовать снова
                  </button>
                )}
                <a href={business.phone.e164} className="btn btn-secondary btn-sm">
                  Позвонить
                </a>
                <a
                  href={business.whatsapp.deepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------ nav */}
      <div className="mt-6 flex gap-2.5">
        {step > 1 && (
          <button type="button" onClick={goBack} className="btn btn-secondary" disabled={submitting}>
            Назад
          </button>
        )}
        {step < BOOKING_STEPS.length ? (
          <button type="button" onClick={goNext} className="btn btn-primary flex-1">
            Далее
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void submit()}
            disabled={submitting}
            aria-busy={submitting}
            className="btn btn-primary flex-1"
          >
            {submitting ? (
              <>
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                />
                Отправляем…
              </>
            ) : (
              'Подтвердить запись'
            )}
          </button>
        )}
      </div>

      <p className="mt-4 text-center text-[0.75rem] leading-relaxed text-steel-600">
        Или{' '}
        <Link href="/services" className="text-steel-400 underline decoration-steel-800 underline-offset-2 hover:text-white">
          посмотреть все услуги
        </Link>{' '}
        ·{' '}
        <a href={business.phone.e164} className="text-steel-400 underline decoration-steel-800 underline-offset-2 hover:text-white">
          позвонить
        </a>
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 bg-surface p-3.5">
      <div className="min-w-0">
        <dt className="text-[0.6875rem] uppercase tracking-wider text-steel-600">{label}</dt>
        <dd className="mt-0.5 text-[0.9375rem] leading-snug text-white">{value}</dd>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 rounded-pill border border-hairline px-3 py-1.5 text-[0.75rem] font-medium text-steel-400 transition hover:border-accent/60 hover:text-white"
      >
        Изменить
      </button>
    </div>
  );
}

/** Maps a restored draft to the furthest step that is still valid. */
function queryStep(saved: Partial<Draft>): number {
  if (!saved.serviceSlug) return 1;
  if (!saved.name && !saved.phone) return 3;
  return 5;
}
