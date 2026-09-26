import Link from 'next/link';

/**
 * Логотип «Токио».
 *
 * Знак — тормозной диск с вырезанной в центре буквой «Т»: кольцо читается как
 * деталь автомобиля, монограмма — как название сервиса, а бирюзовая дуга
 * говорит «точность измерения». Единственное движение здесь осмысленное:
 * при наведении дуга доворачивается на 180° — диск поворачивается, потому что
 * это диск, а не потому что «так красиво». Подпись под ним — точечная строка,
 * отсылающая к измерительной шкале.
 *
 * Всё движение отключается при prefers-reduced-motion (см. app/globals.css).
 */
export default function Logo({
  size = 40,
  withWordmark = true,
  linked = true,
  className = '',
}: {
  size?: number;
  withWordmark?: boolean;
  linked?: boolean;
  className?: string;
}) {
  const mark = (
    <span className={`logo-mark inline-flex shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        role="img"
        aria-label="Токио — автосервис"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="logo-arc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" />
            <stop offset="100%" stopColor="var(--color-accent-2)" />
          </linearGradient>
        </defs>

        {/* Кольцо диска */}
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="var(--color-line-strong)"
          strokeWidth="1.4"
        />

        {/* Внутренняя фаска — намёк на вентиляцию диска */}
        <circle cx="20" cy="20" r="12.2" fill="none" stroke="var(--color-line)" strokeWidth="1" />

        {/* Дуга-указатель: доворачивается при наведении */}
        <g className="logo-arc">
          <path
            d="M20 4 A16 16 0 0 1 36 20"
            fill="none"
            stroke="url(#logo-arc)"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </g>

        {/* Монограмма «Т» */}
        <path
          d="M11.6 13.4h16.8M20 13.4v13.6"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="2.7"
          strokeLinecap="round"
        />

        {/* Отметка центра — как точка отсчёта на шкале */}
        <circle className="logo-dot" cx="20" cy="31.4" r="2.1" fill="var(--color-accent)" />
      </svg>
    </span>
  );

  if (!withWordmark) return mark;

  const content = (
    <>
      {mark}
      <span className="flex flex-col leading-none">
        <span className="font-[family-name:var(--font-display)] text-[19px] uppercase leading-none tracking-[0.1em] text-[var(--color-ink)] sm:tracking-[0.2em]">
          Токио
        </span>
        {/* Шкала и подпись скрыты на телефоне: вместе с логотипом они не
            помещаются в строку шапки 390px и выталкивали кнопку меню за экран. */}
        <span className="mt-1 hidden items-center gap-[3px] sm:flex" aria-hidden="true">
          {/* Точечная шкала вместо обычной подписи. */}
          {Array.from({ length: 9 }).map((_, index) => (
            <span
              key={index}
              className="block h-[3px] rounded-full"
              style={{
                width: index % 3 === 0 ? 2.4 : 1.4,
                backgroundColor: index < 5 ? 'var(--color-accent)' : 'var(--color-line-strong)',
              }}
            />
          ))}
          <span className="ml-1.5 text-[9px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
            автосервис
          </span>
        </span>
      </span>
    </>
  );

  if (!linked) {
    return <span className="inline-flex items-center gap-2.5">{content}</span>;
  }

  return (
    <Link
      href="/"
      className="inline-flex min-w-0 min-h-[44px] shrink items-center gap-2 sm:gap-2.5 rounded-[var(--radius-control)] transition-opacity hover:opacity-90"
      aria-label="Токио, автосервис в Кокшетау — на главную"
    >
      {content}
    </Link>
  );
}
