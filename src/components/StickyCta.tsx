'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { business } from '@/data/business';
import { ActionLink } from './actions';
import { track } from '@/lib/analytics';

/**
 * Compact floating CTA — mobile only.
 *
 * Rules it follows (per the brief):
 *  · never a full-width bar that eats the viewport — it is a small pill that
 *    sits above the safe area and stays out of the way;
 *  · appears only after the hero has scrolled away and hides again near the
 *    footer's own CTA, so it never doubles up with an on-page action;
 *  · the user can dismiss it permanently for the session;
 *  · never shown on /booking (where the form IS the action) or /admin.
 */
export function StickyCta() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const suppressed =
    pathname.startsWith('/booking') || pathname.startsWith('/admin');

  useEffect(() => {
    if (dismissed) {
      try {
        sessionStorage.setItem('stickyCtaDismissed', '1');
      } catch {
        /* private mode — ignore */
      }
    }
  }, [dismissed]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('stickyCtaDismissed') === '1') setDismissed(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (suppressed || dismissed) return;

    const onScroll = () => {
      const y = window.scrollY;
      const doc = document.documentElement;
      const nearBottom = y + window.innerHeight > doc.scrollHeight - 900;
      setVisible(y > 620 && !nearBottom);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [suppressed, dismissed]);

  if (suppressed || dismissed || !visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4 pb-[max(1rem,var(--safe-bottom))] md:hidden">
      <div className="pointer-events-auto flex animate-sheet-in items-center gap-1.5 rounded-pill border border-hairlineStrong bg-ink/92 p-1.5 shadow-sheet backdrop-blur-xl">
        <Link
          href="/booking"
          onClick={() => track('booking_started', { placement: 'sticky_cta' })}
          className="btn btn-primary btn-sm px-5"
        >
          Записаться
        </Link>

        <ActionLink
          href={business.whatsapp.deepLink}
          event="whatsapp_clicked"
          payload={{ placement: 'sticky_cta' }}
          target="_blank"
          rel="noopener noreferrer"
          className="grid h-11 w-11 place-items-center rounded-full text-steel-200 transition hover:bg-white/5 hover:text-white"
          aria-label="Написать в WhatsApp"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24Zm-3.1 3.9c-.15-.34-.3-.35-.45-.36h-.38c-.13 0-.34.05-.52.25-.18.2-.68.66-.68 1.6 0 .95.7 1.87.8 2 .1.13 1.35 2.15 3.33 2.93 1.64.65 1.98.52 2.34.49.36-.03 1.16-.47 1.32-.93.16-.46.16-.85.11-.93-.05-.08-.18-.13-.38-.23-.2-.1-1.16-.57-1.34-.64-.18-.06-.31-.1-.44.1-.13.2-.5.63-.62.76-.11.13-.23.15-.42.05a5.36 5.36 0 0 1-1.57-.97 5.9 5.9 0 0 1-1.09-1.36c-.11-.2-.01-.31.09-.41.09-.09.2-.23.3-.35.1-.12.13-.2.2-.34.06-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.45Z" />
          </svg>
        </ActionLink>

        <ActionLink
          href={business.phone.e164}
          event="phone_clicked"
          payload={{ placement: 'sticky_cta' }}
          className="grid h-11 w-11 place-items-center rounded-full text-steel-200 transition hover:bg-white/5 hover:text-white"
          aria-label={`Позвонить ${business.phone.display}`}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L17 13l4 1.5v3c0 1.1-.9 2-2 2A16 16 0 0 1 4.5 5c0-1.1.9-2 2-2Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
        </ActionLink>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="grid h-9 w-9 place-items-center rounded-full text-steel-600 transition hover:text-steel-200"
          aria-label="Скрыть кнопку записи"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
