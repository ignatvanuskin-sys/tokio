'use client';

import { useEffect, useState } from 'react';

type Props = {
  /** IANA zone of the venue, e.g. "Asia/Almaty". */
  timeZone: string;
  open: string; // "09:00"
  close: string; // "20:00"
  /** Rendered on the server so there is no flash before hydration. */
  initialOpen: boolean;
  className?: string;
  /** Compact = coloured dot only, no word. */
  compact?: boolean;
};

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/**
 * Live "Открыто / Закрыто" pill.
 *
 * The state is always computed in the VENUE timezone — never from the
 * visitor's own clock — so a customer browsing from another country still sees
 * the workshop's real status. The value is refreshed every minute, and the
 * server-rendered value is used for the first paint (no hydration mismatch).
 */
export function OpenStatus({ timeZone, open, close, initialOpen, className = '', compact = false }: Props) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  useEffect(() => {
    const compute = () => {
      try {
        const parts = new Intl.DateTimeFormat('en-GB', {
          timeZone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).formatToParts(new Date());
        const hh = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
        const mm = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
        const now = hh * 60 + mm;
        setIsOpen(now >= toMinutes(open) && now < toMinutes(close));
      } catch {
        /* keep the server value if Intl cannot resolve the zone */
      }
    };

    compute();
    const id = window.setInterval(compute, 60_000);
    return () => window.clearInterval(id);
  }, [timeZone, open, close]);

  const label = isOpen ? 'Открыто' : 'Закрыто';
  const tone = isOpen ? 'text-ok' : 'text-steel-400';
  const dot = isOpen ? 'bg-ok' : 'bg-steel-600';

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[0.75rem] font-semibold ${tone} ${className}`}
      title={`${label}. Ежедневно ${open}–${close}`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot} ${isOpen ? 'animate-pulse-ring' : ''}`}
        aria-hidden="true"
      />
      {compact ? <span className="sr-only">{label}</span> : label}
    </span>
  );
}
