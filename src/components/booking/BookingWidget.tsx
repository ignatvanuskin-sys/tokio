'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { business } from '@/data/business';
import { services } from '@/data/services';
import type { DayAvailability } from '@/lib/booking/types';
import { formatDateRuFull, relativeDayLabel, weekdayNameRu } from '@/lib/time';
import { track } from '@/lib/analytics';
import {
  AlertIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ServiceIcon,
  SpinnerIcon,
} from '@/components/icons';
import { PhoneField } from './PhoneField';
import { SuccessScreen } from './SuccessScreen';

const STEP_TITLES = ['Услуга', 'Автомобиль', 'Дата', 'Время', 'Контакты'] as const;
const TOTAL_STEPS = STEP_TITLES.length;
const MAX_COMMENT = 600;

type Draft = {
  serviceSlug: string;
  carBrand: string;
  carModel: string;
  carYear: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  comment: string;
};

type FieldErrors = Partial<Record<keyof Draft | 'consent', string>>;

type Props = {
  todayKey: string;
  bookableDates: string[];
  initialAvailability: DayAvailability;
  initialServiceSlug: string;
  isDemo: boolean;
};

const DRAFT_KEY = 'tokyo_booking_draft_v2';

function newKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/**
 * Booking wizard — five steps: услуга → автомобиль → дата → время → контакты.
 *
 * Layout mirrors the reference design: a sticky step header with a segmented
 * progress bar, the step body in the middle, a sticky two-button footer. On a
 * phone the primary action therefore always sits under the thumb.
 *
 * Behaviour that matters more than the look:
 *  · the slot grid comes from the server; a slot is never "busy" at random;
 *  · a 409 means someone just took the slot — the user returns to the time step
 *    with a freshly loaded grid and an explicit notice;
 *  · the idempotency key is minted once per draft, so a retry after a flaky
 *    connection cannot create a second booking;
 *  · nothing implies auto-confirmation — the master confirms by phone.
 */
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
  const [values, setValues] = useState<Draft>(() => ({
    serviceSlug:
      fromQuery && services.some((s) => s.slug === fromQuery) ? fromQuery : initialServiceSlug,
    carBrand: '',
    carModel: '',
    carYear: '',
    date: bookableDates[0] ?? todayKey,
    time: '',
    name: '',
    phone: '',
    comment: '',
  }));
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [availability, setAvailability] = useState<DayAvailability>(initialAvailability);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [slotNotice, setSlotNotice] = useState<string | null>(null);
  const [result, setResult] = useState<null | {
    id: string;
    serviceTitle: string;
    slotDate: string;
    slotTime: string;
    name: string;
    phone: string;
  }>(null);

  const idempotencyKey = useRef<string>(newKey());
  const startedAt = useRef<number>(0);
  const trap = useRef<string>('');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);

  const selectedService = useMemo(
    () => services.find((s) => s.slug === values.serviceSlug) ?? null,
    [values.serviceSlug],
  );

  /* ------------------------------------------------------------ черновик */

  useEffect(() => {
    startedAt.current = Date.now();
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<Draft>;
      setValues((current) => ({
        ...current,
        ...saved,
        // Занятость могла измениться, пока вкладка была закрыта.
        time: '',
      }));
      if (saved.serviceSlug) setStep(2);
    } catch {
      /* повреждённое хранилище — начинаем заново */
    }
  }, []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    } catch {
      /* приватный режим */
    }
  }, [values]);

  const patch = useCallback((patchValues: Partial<Draft>) => {
    setValues((current) => ({ ...current, ...patchValues }));
    setServerError(null);
  }, []);

  const setField = useCallback(
    <K extends keyof Draft>(field: K, value: Draft[K]) => {
      patch({ [field]: value } as Partial<Draft>);
      setErrors((current) => ({ ...current, [field]: undefined }));
    },
    [patch],
  );

  /* --------------------------------------------------------------- слоты */

  const loadAvailability = useCallback(async (dateKey: string) => {
    setSlotsLoading(true);
    try {
      const res = await fetch(`/api/availability?date=${encodeURIComponent(dateKey)}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { ok: boolean; availability: DayAvailability };
      if (json.ok) setAvailability(json.availability);
    } catch {
      setServerError('Не удалось загрузить свободное время. Проверьте связь и попробуйте снова.');
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  const chooseDate = async (date: string) => {
    setSlotNotice(null);
    setErrors((current) => ({ ...current, date: undefined }));
    patch({ date, time: '' });
    await loadAvailability(date);
  };

  /* ----------------------------------------------------------- валидация */

  const fieldsOfStep = (current: number): Array<keyof Draft> => {
    if (current === 1) return ['serviceSlug'];
    if (current === 2) return ['carBrand', 'carModel', 'carYear', 'comment'];
    if (current === 3) return ['date'];
    if (current === 4) return ['time'];
    return ['name', 'phone', 'comment'];
  };

  const validateStep = (current: number): FieldErrors => {
    const found: FieldErrors = {};

    if (current === 1 && !values.serviceSlug) found.serviceSlug = 'Выберите услугу';

    if (current === 2) {
      const year = values.carYear.trim();
      if (year) {
        const n = Number(year);
        if (!Number.isFinite(n) || n < 1950 || n > new Date().getFullYear() + 1) {
          found.carYear = 'Проверьте год выпуска';
        }
      }
      // Марка и модель необязательны — не блокируем запись из-за них.
    }

    if (current === 3 && !values.date) found.date = 'Выберите дату';

    if (current === 4) {
      if (!values.time) found.time = 'Выберите время';
      else {
        const slot = availability.slots.find((s) => s.time === values.time);
        if (!slot || !slot.available) found.time = 'Это время недоступно, выберите другое';
      }
    }

    if (current === 5) {
      if (values.name.trim().length < 2) found.name = 'Укажите имя';
      const digits = values.phone.replace(/\D/g, '');
      if (digits.length < 11) found.phone = 'Введите номер полностью: +7 (___) ___-__-__';
      if (values.comment.length > MAX_COMMENT) found.comment = 'Комментарий слишком длинный';
      if (!consent) found.consent = 'Нужно согласие на обработку данных';
    }

    return found;
  };

  const focusFirstInvalid = (found: FieldErrors) => {
    const first = Object.keys(found)[0];
    if (!first || first === 'consent') return;
    window.setTimeout(() => {
      document.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
    }, 40);
  };

  const goNext = () => {
    setServerError(null);
    const found = validateStep(step);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstInvalid(found);
      return;
    }

    if (step === 1) track('service_selected', { serviceSlug: values.serviceSlug });
    if (step === 3) track('date_selected', { slotDate: values.date });
    if (step === 4) track('time_selected', { slotTime: values.time });

    const next = Math.min(TOTAL_STEPS, step + 1);
    if (next === 4 && values.date) void loadAvailability(values.date);
    setStep(next);
    window.setTimeout(() => headingRef.current?.focus(), 40);
  };

  const goBack = () => {
    setServerError(null);
    setSlotNotice(null);
    setStep((current) => Math.max(1, current - 1));
    window.setTimeout(() => headingRef.current?.focus(), 40);
  };

  /* -------------------------------------------------------------- отправка */

  const submit = async () => {
    if (submitting) return; // защита от двойного тапа

    const found = validateStep(5);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstInvalid(found);
      return;
    }

    setSubmitting(true);
    setServerError(null);
    track('booking_submitted', {
      serviceSlug: values.serviceSlug,
      slotDate: values.date,
      slotTime: values.time,
    });

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          serviceSlug: values.serviceSlug,
          slotDate: values.date,
          slotTime: values.time,
          name: values.name.trim(),
          phone: values.phone,
          vehicleMake: values.carBrand.trim(),
          vehicleModel: values.carModel.trim(),
          vehicleYear: values.carYear.trim(),
          comment: values.comment.trim(),
          consent: true,
          idempotencyKey: idempotencyKey.current,
          trap: trap.current,
          elapsedMs: Date.now() - startedAt.current,
        }),
      });

      const json = (await res.json().catch(() => null)) as
        | {
            ok: boolean;
            code?: string;
            message?: string;
            fields?: Record<string, string>;
            booking?: {
              id: string;
              serviceTitle: string;
              slotDate: string;
              slotTime: string;
              customerName: string;
            };
            availability?: DayAvailability;
          }
        | null;

      // Слот только что заняли — возвращаем на шаг времени со свежей сеткой.
      if (res.status === 409 || json?.code === 'slot_taken' || json?.code === 'slot_not_bookable') {
        if (json?.availability) setAvailability(json.availability);
        else void loadAvailability(values.date);
        setValues((current) => ({ ...current, time: '' }));
        setSlotNotice(json?.message ?? 'Это время только что заняли — выберите другое.');
        setStep(4);
        track('booking_error', { errorCode: 'slot_taken' });
        window.setTimeout(() => headingRef.current?.focus(), 40);
        return;
      }

      if (res.status === 429 || json?.code === 'rate_limited') {
        setServerError('Слишком много попыток отправки. Подождите минуту и попробуйте снова.');
        track('booking_error', { errorCode: 'rate_limited' });
        return;
      }

      if (res.status === 400 && json?.fields) {
        setErrors(json.fields as FieldErrors);
        focusFirstInvalid(json.fields as FieldErrors);
        track('booking_error', { errorCode: 'validation' });
        return;
      }

      if (!res.ok || !json?.ok || !json.booking) {
        setServerError(
          json?.message ??
            'Не удалось отправить заявку. Позвоните нам или напишите в WhatsApp — примем вручную.',
        );
        track('booking_error', { errorCode: json?.code ?? `http_${res.status}` });
        return;
      }

      setResult({
        id: json.booking.id,
        serviceTitle: json.booking.serviceTitle,
        slotDate: json.booking.slotDate,
        slotTime: json.booking.slotTime,
        name: json.booking.customerName,
        phone: values.phone,
      });
      track('booking_success', {
        serviceSlug: values.serviceSlug,
        slotDate: values.date,
        slotTime: values.time,
      });
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
    } catch {
      setServerError('Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.');
      track('booking_error', { errorCode: 'network' });
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setResult(null);
    setStep(1);
    setConsent(false);
    idempotencyKey.current = newKey();
    startedAt.current = Date.now();
    setValues({
      serviceSlug: initialServiceSlug,
      carBrand: '',
      carModel: '',
      carYear: '',
      date: bookableDates[0] ?? todayKey,
      time: '',
      name: '',
      phone: '',
      comment: '',
    });
    void loadAvailability(bookableDates[0] ?? todayKey);
  };


  /* ---------------------------------------------------------------- группы */

  const slotGroups = useMemo(
    () =>
      [
        { title: 'Утро', items: availability.slots.filter((s) => s.time < '12:00') },
        {
          title: 'День',
          items: availability.slots.filter((s) => s.time >= '12:00' && s.time < '17:00'),
        },
        { title: 'Вечер', items: availability.slots.filter((s) => s.time >= '17:00') },
      ].filter((group) => group.items.length > 0),
    [availability],
  );
  if (result) {
    return <SuccessScreen booking={result} onRestart={restart} />;
  }

  const stepError = errors[fieldsOfStep(step)[0] as keyof Draft];

  return (
    <div className="card overflow-hidden">
      {/* ---------------------------------------------------- Шапка шага */}
      <div className="sticky top-14 z-20 border-b border-hairline bg-surface p-5 md:top-16 md:p-6">
        <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-steel-400">
          Шаг {step} из {TOTAL_STEPS} · {STEP_TITLES[step - 1]}
        </p>

        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-2 text-[22px] font-semibold outline-none md:text-[26px]"
        >
          {step === 1 && 'Что нужно сделать?'}
          {step === 2 && 'Данные автомобиля'}
          {step === 3 && 'Когда вам удобно?'}
          {step === 4 && 'Выберите время'}
          {step === 5 && 'Куда сообщить о подтверждении'}
        </h2>

        <ol className="mt-4 flex gap-1.5" aria-label="Этапы записи">
          {STEP_TITLES.map((title, index) => (
            <li
              key={title}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                index + 1 <= step ? 'bg-accent' : 'bg-surface-raised'
              }`}
            >
              <span className="sr-only">{title}</span>
            </li>
          ))}
        </ol>

        {isDemo && (
          <p className="mt-4 rounded-control border border-warn/40 bg-warn/10 px-3 py-2 text-[12px] leading-relaxed text-warn">
            Демонстрационный режим: заявки сохраняются в файл, а не в PostgreSQL. Задайте{' '}
            <code className="font-mono">DATABASE_URL</code> для рабочего запуска.
          </p>
        )}
      </div>

      {/* ------------------------------------------------- Содержимое шага */}
      <div className="p-5 md:p-6">
        {serverError && (
          <div
            role="alert"
            className="mb-5 flex flex-col gap-3 rounded-control border border-danger bg-danger/10 p-3.5 text-[15px]"
          >
            <p className="flex items-start gap-2">
              <AlertIcon className="mt-0.5 size-5 shrink-0 text-danger" />
              {serverError}
            </p>
            <div className="flex flex-wrap gap-2">
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

        {slotNotice && step === 4 && (
          <p
            role="status"
            className="mb-5 rounded-control border border-warn bg-warn/10 p-3.5 text-[15px]"
          >
            {slotNotice}
          </p>
        )}

        {/* --- Шаг 1: услуга ------------------------------------------------ */}
        {step === 1 && (
          <fieldset className="step-in grid gap-2.5">
            <legend className="sr-only">Выберите услугу</legend>
            {services.map((service) => {
              const selected = values.serviceSlug === service.slug;
              return (
                <button
                  key={service.slug}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setField('serviceSlug', service.slug)}
                  className={`flex items-center gap-3.5 rounded-control border p-4 text-left transition-colors ${
                    selected
                      ? 'border-accent bg-accent/10'
                      : 'border-hairline bg-surface-raised hover:border-hairlineStrong'
                  }`}
                >
                  <ServiceIcon group={service.group} className="size-6 shrink-0 text-accent" />
                  <span className="grow">
                    <span className="block text-[15px] font-semibold text-steel-50">
                      {service.title}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-steel-400">
                      {business.priceNote}
                    </span>
                  </span>
                  {selected && <CheckIcon className="size-5 shrink-0 text-accent" />}
                </button>
              );
            })}
            {errors.serviceSlug && <p className="error-text">{errors.serviceSlug}</p>}
          </fieldset>
        )}

        {/* --- Шаг 2: автомобиль ------------------------------------------- */}
        {step === 2 && (
          <div className="step-in grid gap-5">
            <div>
              <label className="label" htmlFor="carBrand">
                Марка{' '}
                <span className="font-normal normal-case text-steel-400">(не обязательно)</span>
              </label>
              <input
                id="carBrand"
                data-field="carBrand"
                className="field"
                list="brand-list"
                autoComplete="off"
                enterKeyHint="next"
                placeholder="Toyota"
                maxLength={40}
                value={values.carBrand}
                aria-invalid={Boolean(errors.carBrand)}
                onChange={(e) => setField('carBrand', e.target.value)}
              />
              <datalist id="brand-list">
                {business.brands.map((brand) => (
                  <option key={brand} value={brand} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="label" htmlFor="carModel">
                Модель{' '}
                <span className="font-normal normal-case text-steel-400">(не обязательно)</span>
              </label>
              <input
                id="carModel"
                data-field="carModel"
                className="field"
                autoComplete="off"
                enterKeyHint="next"
                placeholder="Camry"
                maxLength={60}
                value={values.carModel}
                aria-invalid={Boolean(errors.carModel)}
                onChange={(e) => setField('carModel', e.target.value)}
              />
            </div>

            <div className="sm:max-w-[12rem]">
              <label className="label" htmlFor="carYear">
                Год{' '}
                <span className="font-normal normal-case text-steel-400">(не обязательно)</span>
              </label>
              <input
                id="carYear"
                data-field="carYear"
                className="field tnum"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                placeholder="2019"
                value={values.carYear}
                aria-invalid={Boolean(errors.carYear)}
                onChange={(e) => setField('carYear', e.target.value.replace(/\D/g, ''))}
              />
              {errors.carYear && <p className="error-text">{errors.carYear}</p>}
            </div>

            <div>
              <label className="label" htmlFor="problem">
                Что беспокоит?{' '}
                <span className="font-normal normal-case text-steel-400">(не обязательно)</span>
              </label>
              <textarea
                id="problem"
                data-field="comment"
                className="field min-h-[104px] resize-y"
                maxLength={MAX_COMMENT}
                placeholder="Например: стук спереди справа на неровностях"
                value={values.comment}
                onChange={(e) => setField('comment', e.target.value)}
              />
              <p className="hint mt-1">
                {values.comment.length}/{MAX_COMMENT}
              </p>
            </div>
          </div>
        )}

        {/* --- Шаг 3: дата --------------------------------------------------- */}
        {step === 3 && (
          <div className="step-in grid gap-5">
            <div
              className="no-scrollbar -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-2"
              role="group"
              aria-label="Доступные даты"
            >
              {bookableDates.map((day) => {
                const selected = values.date === day;
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => void chooseDate(day)}
                    className={`flex w-[92px] shrink-0 flex-col items-center gap-0.5 rounded-control border px-2 py-3 transition-colors ${
                      selected
                        ? 'border-accent bg-accent/10'
                        : 'border-hairline bg-surface-raised hover:border-hairlineStrong'
                    }`}
                  >
                    <span className="text-[11px] uppercase tracking-[0.06em] text-steel-400">
                      {relativeDayLabel(day, todayKey)}
                    </span>
                    <span className="font-display text-[24px] leading-none text-steel-50">
                      {day.slice(8, 10)}
                    </span>
                    <span className="text-[11px] text-steel-400">{weekdayNameRu(day, true)}</span>
                  </button>
                );
              })}
            </div>

            {errors.date && <p className="error-text">{errors.date}</p>}

            <p className="hint">
              {values.date
                ? `Вы выбрали: ${formatDateRuFull(values.date)}. Дальше — время приёма.`
                : 'Выберите день. Работаем ежедневно, без выходных.'}
            </p>
          </div>
        )}

        {/* --- Шаг 4: время ------------------------------------------------- */}
        {step === 4 && (
          <div className="step-in grid gap-5">
            <p className="text-[15px] text-steel-400">
              {formatDateRuFull(values.date)}
              {selectedService ? ` · ${selectedService.title}` : ''}
            </p>

            {slotsLoading ? (
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4" aria-hidden="true">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton h-[52px]" />
                ))}
              </div>
            ) : slotGroups.length > 0 ? (
              <div className="grid gap-5">
                {slotGroups.map((group) => (
                  <div key={group.title}>
                    <p className="mb-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-steel-400">
                      {group.title}
                    </p>
                    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                      {group.items.map((slot) => {
                        const disabled = !slot.available || !slot.bookable;
                        const selected = values.time === slot.time;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={disabled}
                            aria-pressed={selected}
                            onClick={() => {
                              setField('time', slot.time);
                              setSlotNotice(null);
                            }}
                            className={`min-h-[52px] rounded-control border font-semibold transition-colors tnum ${
                              selected
                                ? 'border-accent bg-accent text-accent-ink'
                                : 'border-hairline bg-surface-raised text-steel-50 hover:border-hairlineStrong'
                            } ${disabled ? 'cursor-not-allowed border-dashed opacity-35 line-through' : ''}`}
                          >
                            {slot.time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <p className="hint">
                  Занятое время отмечено серым. Если удобного часа нет — позвоните, посмотрим
                  загрузку.
                </p>
              </div>
            ) : (
              <p className="card p-5 text-[15px] text-steel-400">
                На эту дату свободного времени нет. Вернитесь и выберите другой день.
              </p>
            )}

            <button
              type="button"
              onClick={() => void loadAvailability(values.date)}
              className="justify-self-start text-[13px] font-medium text-accent hover:text-accent-bright"
            >
              Обновить расписание
            </button>

            {errors.time && <p className="error-text">{errors.time}</p>}
          </div>
        )}

        {/* --- Шаг 5: контакты --------------------------------------------- */}
        {step === 5 && (
          <div className="step-in grid gap-5">
            <div className="card grid gap-2 bg-surface-raised p-4 text-[14px]">
              {(
                [
                  ['Услуга', selectedService?.title ?? '—'],
                  [
                    'Автомобиль',
                    [values.carBrand, values.carModel, values.carYear]
                      .map((v) => v.trim())
                      .filter(Boolean)
                      .join(' ') || 'не указан',
                  ],
                  ['Когда', `${formatDateRuFull(values.date)}, ${values.time}`],
                ] as const
              ).map(([label, value]) => (
                <p key={label} className="flex justify-between gap-4">
                  <span className="text-steel-400">{label}</span>
                  <span className="text-right font-semibold text-steel-50">{value}</span>
                </p>
              ))}
            </div>

            <div>
              <label className="label" htmlFor="name">
                Имя
              </label>
              <input
                id="name"
                data-field="name"
                className="field"
                autoComplete="name"
                enterKeyHint="next"
                placeholder="Как к вам обращаться"
                maxLength={80}
                value={values.name}
                aria-invalid={Boolean(errors.name)}
                onChange={(e) => setField('name', e.target.value)}
              />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>

            <PhoneField
              value={values.phone}
              onChange={(v) => setField('phone', v)}
              error={errors.phone}
            />

            <label className="flex cursor-pointer items-start gap-3 text-[14px] leading-relaxed">
              <input
                type="checkbox"
                className="mt-0.5 size-6 shrink-0 accent-accent"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  if (errors.consent) setErrors((c) => ({ ...c, consent: undefined }));
                }}
                aria-invalid={Boolean(errors.consent)}
              />
              <span className="text-steel-400">
                Согласен на обработку персональных данных —{' '}
                <Link href="/privacy" className="text-accent underline-offset-4 hover:underline">
                  политика конфиденциальности
                </Link>
                .
              </span>
            </label>
            {errors.consent && <p className="error-text">{errors.consent}</p>}

            {/* Приманка для ботов: люди этого поля не видят. */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="company">Компания</label>
              <input
                id="company"
                tabIndex={-1}
                autoComplete="off"
                onChange={(e) => {
                  trap.current = e.target.value;
                }}
              />
            </div>
          </div>
        )}

        {stepError && step !== 5 && (
          <p className="sr-only" role="alert">
            {stepError}
          </p>
        )}
      </div>

      {/* ------------------------------------------------------ Кнопки шага */}
      <div
        className="sticky bottom-0 z-20 grid grid-cols-2 gap-3 border-t border-hairline bg-surface p-5 md:p-6"
        style={{ paddingBottom: 'calc(20px + var(--safe-bottom))' }}
      >
        <button
          type="button"
          className="btn btn-secondary"
          onClick={goBack}
          disabled={step === 1 || submitting}
          aria-disabled={step === 1 || submitting}
        >
          <ChevronLeftIcon className="size-5" />
          Назад
        </button>

        {step < TOTAL_STEPS ? (
          <button type="button" className="btn btn-primary" onClick={goNext}>
            Далее
            <ChevronRightIcon className="size-5" />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void submit()}
            disabled={submitting}
            aria-disabled={submitting}
          >
            {submitting && <SpinnerIcon className="size-5 animate-spin" />}
            {submitting ? 'Отправляем…' : 'Подтвердить запись'}
          </button>
        )}
      </div>
    </div>
  );
}
