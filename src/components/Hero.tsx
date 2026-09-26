import Link from 'next/link';
import { business, links } from '@/data/business';
import { photoRoles } from '@/data/gallery';
import { scheduleConfig } from '@/data/schedule';
import { fallbackSrc, srcSet } from '@/lib/images';
import { RatingBadge } from './Rating';
import { OpenStatus } from './OpenStatus';
import { ActionLink } from './actions';

/**
 * First screen. Answers, in order: who · where · what · why trust · what to do.
 *
 * Imagery: two REAL photographs of this workshop, composed per device — a
 * portrait frame (wheel-alignment work) for phones, a wide frame (the full
 * workshop floor) from 768px up. <picture> means only ONE of them is ever
 * downloaded, and the mobile one is the LCP element with fetchpriority=high.
 */
export function Hero({ initialOpen }: { initialOpen: boolean }) {
  const mobile = photoRoles.heroMobile;
  const desktop = photoRoles.heroDesktop;

  return (
    <section className="relative isolate overflow-hidden bg-ink">
      {/* Art direction ------------------------------------------------- */}
      <div className="absolute inset-0 -z-10">
        <picture>
          <source media="(min-width: 768px)" srcSet={srcSet(desktop)} sizes="100vw" />
          <img
            src={fallbackSrc(mobile)}
            srcSet={srcSet(mobile)}
            sizes="100vw"
            alt={`Автосервис «${business.name}» в ${business.city}: работа на подъёмнике в цехе`}
            // @ts-expect-error fetchpriority is valid HTML
            fetchpriority="high"
            loading="eager"
            decoding="sync"
            className="h-full w-full object-cover object-center"
            style={{ animation: 'slow-zoom 20s ease-out both' }}
          />
        </picture>
        {/* Cinematic scrim: keeps AA contrast for the copy over any frame. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(7,8,10,0.92) 0%, rgba(7,8,10,0.62) 26%, rgba(7,8,10,0.78) 62%, #07080A 100%)',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_15%_10%,rgba(255,90,31,0.18),transparent_60%)]" />
        <div className="grid-texture absolute inset-0 opacity-60" />
      </div>

      <div className="shell grain relative flex min-h-[calc(100svh-3.5rem)] flex-col justify-end pb-9 pt-14 md:min-h-[min(760px,88svh)] md:justify-center md:pb-20 md:pt-24">
        <div className="max-w-2xl">
          {/* Where + status ------------------------------------------- */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="eyebrow">
              {business.category} · {business.city}
            </span>
            <OpenStatus
              timeZone={scheduleConfig.timeZone}
              open={scheduleConfig.opensAt}
              close={scheduleConfig.closesAt}
              initialOpen={initialOpen}
              className="rounded-pill border border-hairline bg-white/5 px-2.5 py-1 backdrop-blur-sm"
            />
          </div>

          {/* Who ------------------------------------------------------ */}
          <h1 className="mt-3 text-display-1 font-semibold uppercase text-white">
            Токио
          </h1>
          <p className="mt-2 max-w-xl text-lead font-medium text-steel-200">
            Автосервис в {business.city}. Диагностика, ходовая, двигатель, тормоза,
            развал-схождение и шиномонтаж —{' '}
            <span className="text-white">{business.address.streetShort}</span>.
          </p>

          {/* Why trust ------------------------------------------------ */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="rounded-xl border border-hairline bg-white/[0.04] px-3.5 py-2.5 backdrop-blur-sm">
              <RatingBadge compact />
            </div>
            {business.awards.map((a) => (
              <div key={a.title} className="rounded-xl border border-hairline bg-white/[0.04] px-3.5 py-2.5 backdrop-blur-sm">
                <span className="block text-[0.6875rem] uppercase tracking-wider text-steel-400">
                  {a.title}
                </span>
                <span className="mt-0.5 block text-[0.8125rem] font-semibold text-white">
                  Номинант · {a.nomination}
                </span>
              </div>
            ))}
          </div>

          {/* What to do ----------------------------------------------- */}
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Link href="/booking" className="btn btn-primary btn-block sm:w-auto sm:px-7">
              Записаться на сервис
            </Link>
            <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center">
              <ActionLink
                href={business.whatsapp.deepLink}
                event="whatsapp_clicked"
                payload={{ placement: 'hero' }}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                WhatsApp
              </ActionLink>
              <ActionLink
                href={business.phone.e164}
                event="phone_clicked"
                payload={{ placement: 'hero' }}
                className="btn btn-secondary"
              >
                Позвонить
              </ActionLink>
            </div>
          </div>

          {/* Practical reassurance ----------------------------------- */}
          <ul className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.8125rem] text-steel-400">
            <li>{business.hours.display}</li>
            <li aria-hidden="true" className="hidden h-3 w-px bg-hairlineStrong sm:block" />
            <li>
              <ActionLink
                href={links.route}
                event="route_clicked"
                payload={{ placement: 'hero' }}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-steel-800 underline-offset-4 transition hover:text-white hover:decoration-accent"
              >
                {business.address.streetShort}
              </ActionLink>
            </li>
            <li aria-hidden="true" className="hidden h-3 w-px bg-hairlineStrong sm:block" />
            <li>Без выходных</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
