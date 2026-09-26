'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { business, links } from '@/data/business';
import { NAV } from '@/data/nav';
import { scheduleConfig } from '@/data/schedule';
import { OpenStatus } from './OpenStatus';
import { ActionLink } from './actions';
import { track } from '@/lib/analytics';

export function Header({ initialOpen }: { initialOpen: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Compact-on-scroll: the header is 56px tall at rest so it never eats the
  // first screen; it only gains a surface once the user has scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the sheet on navigation, and lock body scroll while it is open.
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 safe-top transition-colors duration-300 ${
        scrolled || menuOpen
          ? 'border-b border-hairline bg-ink/85 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="shell flex h-14 items-center justify-between gap-3 md:h-16">
        {/* Wordmark ------------------------------------------------------- */}
        <Link
          href="/"
          className="group flex min-h-[44px] items-center gap-2.5"
          aria-label={`${business.name} — на главную`}
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-hairlineStrong bg-graphite">
            <span className="h-2 w-2 rounded-[2px] bg-accent" aria-hidden="true" />
          </span>
          <span className="leading-none">
            <span className="block text-[1.0625rem] font-semibold uppercase tracking-[0.16em] text-white">
              ТОКИО
            </span>
            <span className="mt-0.5 hidden text-[0.625rem] uppercase tracking-[0.18em] text-steel-400 sm:block">
              автосервис · Кокшетау
            </span>
          </span>
        </Link>

        {/* Desktop nav ---------------------------------------------------- */}
        <nav aria-label="Основная навигация" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-pill px-3 py-2 text-[0.875rem] font-medium transition ${
                  active ? 'text-white' : 'text-steel-400 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right cluster -------------------------------------------------- */}
        <div className="flex items-center gap-2">
          <OpenStatus
            className="mr-0.5 hidden sm:inline-flex"
            timeZone={scheduleConfig.timeZone}
            open={scheduleConfig.opensAt}
            close={scheduleConfig.closesAt}
            initialOpen={initialOpen}
          />

          <ActionLink
            href={business.phone.e164}
            event="phone_clicked"
            payload={{ placement: 'header' }}
            className="grid h-11 w-11 place-items-center rounded-pill border border-hairline bg-surface text-steel-200 transition hover:text-white sm:hidden"
            aria-label={`Позвонить ${business.phone.display}`}
          >
            <PhoneIcon />
          </ActionLink>

          <Link
            href="/booking"
            className="btn btn-primary btn-sm hidden md:inline-flex"
            onClick={() => track('booking_started', { placement: 'header' })}
          >
            Записаться
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            className="grid h-11 w-11 place-items-center rounded-pill border border-hairline bg-surface text-steel-200 transition hover:text-white lg:hidden"
          >
            <span className="relative block h-3.5 w-4.5" aria-hidden="true">
              <span
                className={`absolute left-0 block h-[1.5px] w-full bg-current transition-transform duration-300 ${
                  menuOpen ? 'top-1.5 rotate-45' : 'top-0'
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 block h-[1.5px] w-full bg-current transition-opacity duration-200 ${
                  menuOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute left-0 block h-[1.5px] w-full bg-current transition-transform duration-300 ${
                  menuOpen ? 'top-1.5 -rotate-45' : 'top-3'
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile sheet ----------------------------------------------------- */}
      {menuOpen && (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 bottom-0 top-14 z-40 flex animate-fade-in flex-col overflow-y-auto border-t border-hairline bg-ink/98 backdrop-blur-xl lg:hidden"
        >
          <nav aria-label="Мобильная навигация" className="shell flex flex-col py-2">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-[56px] items-center justify-between border-b border-hairline text-[1.0625rem] font-semibold text-steel-50"
                style={{ animationDelay: `${i * 26}ms` }}
              >
                {item.label}
                <ChevronIcon />
              </Link>
            ))}
          </nav>

          <div className="shell mt-5 flex flex-col gap-3 pb-[max(2rem,var(--safe-bottom))]">
            <Link
              href="/booking"
              className="btn btn-primary btn-block"
              onClick={() => track('booking_started', { placement: 'mobile_menu' })}
            >
              Записаться на сервис
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <ActionLink
                href={business.phone.e164}
                event="phone_clicked"
                payload={{ placement: 'mobile_menu' }}
                className="btn btn-secondary"
              >
                Позвонить
              </ActionLink>
              <ActionLink
                href={business.whatsapp.deepLink}
                event="whatsapp_clicked"
                payload={{ placement: 'mobile_menu' }}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                WhatsApp
              </ActionLink>
            </div>
            <ActionLink
              href={links.route}
              event="route_clicked"
              payload={{ placement: 'mobile_menu' }}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-block"
            >
              Построить маршрут
            </ActionLink>

            <div className="mt-2 flex flex-col gap-1 text-[0.8125rem] text-steel-400">
              <span>{business.address.full}</span>
              <span>{business.hours.display}</span>
              <span className="tnum">{business.phone.display}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L17 13l4 1.5v3c0 1.1-.9 2-2 2A16 16 0 0 1 4.5 5c0-1.1.9-2 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
