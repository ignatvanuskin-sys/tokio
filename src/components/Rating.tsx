import { business } from '@/data/business';

export function Stars({ value, size = 14, className = '' }: { value: number; size?: number; className?: string }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span
      className={`inline-flex items-center gap-[2px] ${className}`}
      role="img"
      aria-label={`Рейтинг ${value} из 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
            <defs>
              <linearGradient id={`half-${i}-${size}`}>
                <stop offset="50%" stopColor="#E8A33D" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.16)" />
              </linearGradient>
            </defs>
            <path
              d="M10 1.6l2.47 5.3 5.53.66-4.1 3.83 1.1 5.51L10 14.2l-4.99 2.7 1.1-5.51L2 7.56l5.53-.66L10 1.6z"
              fill={
                fill === 1 ? '#E8A33D' : fill === 0.5 ? `url(#half-${i}-${size})` : 'rgba(255,255,255,0.16)'
              }
            />
          </svg>
        );
      })}
    </span>
  );
}

/**
 * Rating badge. Values come from the 2GIS card (business.rating) — the
 * "source" line is not decoration, it is the claim's provenance.
 */
export function RatingBadge({ compact = false }: { compact?: boolean }) {
  return (
    <div className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1">
      <span className="inline-flex items-center gap-1.5">
        <span className="text-[1.0625rem] font-extrabold leading-none text-white tnum">
          {business.rating.value.toFixed(1)}
        </span>
        <Stars value={business.rating.value} />
      </span>
      <span className="text-[0.8125rem] leading-none text-steel-400">
        <span className="tnum">{business.rating.ratingsCount}</span> оценок
        {compact ? '' : ` · ${business.rating.reviewsCount} отзывов`}
      </span>
      <span className="text-[0.6875rem] uppercase tracking-wider text-steel-600">
        по данным 2ГИС
      </span>
    </div>
  );
}
