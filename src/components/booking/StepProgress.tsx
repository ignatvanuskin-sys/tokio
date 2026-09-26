export const BOOKING_STEPS = [
  { n: 1, label: 'Услуга' },
  { n: 2, label: 'Авто' },
  { n: 3, label: 'Дата' },
  { n: 4, label: 'Время' },
  { n: 5, label: 'Контакты' },
  { n: 6, label: 'Проверка' },
] as const;

/**
 * Progress indicator for the booking wizard.
 *
 * Mobile: a slim fill bar plus "Шаг 4 из 6 · Время". The six dots are shown from
 * 400px up, where there is room for them without shrinking the tap targets.
 */
export function StepProgress({ current }: { current: number }) {
  const pct = Math.round(((current - 1) / (BOOKING_STEPS.length - 1)) * 100);
  const step = BOOKING_STEPS.find((s) => s.n === current) ?? BOOKING_STEPS[0];

  return (
    <div className="select-none">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-steel-400">
          Шаг {step.n} из {BOOKING_STEPS.length} · <span className="text-steel-200">{step.label}</span>
        </span>
        <span className="font-mono text-[0.6875rem] text-steel-600 tnum">{pct}%</span>
      </div>

      <div
        className="mt-2 h-1 w-full overflow-hidden rounded-pill bg-surface-raised"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={BOOKING_STEPS.length}
        aria-valuenow={step.n}
        aria-valuetext={`Шаг ${step.n} из ${BOOKING_STEPS.length}: ${step.label}`}
      >
        <div
          className="h-full rounded-pill bg-accent transition-[width] duration-400 ease-out"
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>

      <ol className="mt-2.5 hidden items-center gap-1.5 min-[400px]:flex" aria-hidden="true">
        {BOOKING_STEPS.map((s) => {
          const state = s.n < current ? 'done' : s.n === current ? 'active' : 'todo';
          return (
            <li key={s.n} className="flex flex-1 items-center gap-1.5">
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[0.625rem] font-bold tnum ${
                  state === 'done'
                    ? 'border-accent bg-accent text-white'
                    : state === 'active'
                      ? 'border-accent text-accent-bright'
                      : 'border-hairline text-steel-600'
                }`}
              >
                {state === 'done' ? '✓' : s.n}
              </span>
              {s.n !== BOOKING_STEPS.length && (
                <span
                  className={`h-px flex-1 ${s.n < current ? 'bg-accent' : 'bg-hairline'}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
