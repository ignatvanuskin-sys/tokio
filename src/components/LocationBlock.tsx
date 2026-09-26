import { business, links } from '@/data/business';
import { mapImage } from '@/data/map.generated';
import { OpenStatus } from './OpenStatus';
import { ActionLink } from './actions';
import { Reveal } from './Reveal';
import { scheduleConfig } from '@/data/schedule';

/**
 * Location block.
 *
 * The map is a static WebP built from 2GIS tiles at the branch's own
 * coordinates (see scripts/build-map.mjs) — no iframe, no third-party script,
 * no cookie banner. It is darkened with a CSS filter to sit inside the dark
 * theme, and the accent pin is drawn in the DOM so the map filter cannot
 * discolour it.
 *
 * The button deep-links into the 2GIS navigator, which is what a mobile user
 * actually wants: turn-by-turn, not a picture.
 */
export function LocationBlock() {
  return (
    <section aria-labelledby="location-heading" className="shell py-12 md:py-20">
      <div className="grid gap-7 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-12">
        {/* Details ------------------------------------------------------ */}
        <Reveal>
          <span className="eyebrow">Мы находимся</span>
          <h2 id="location-heading" className="mt-2 text-display-3 font-semibold text-white">
            {business.city}, {business.address.streetShort}
          </h2>

          <dl className="mt-6 flex flex-col gap-4">
            <div className="flex gap-3.5">
              <span className="mt-0.5 text-accent" aria-hidden="true">
                <PinIcon />
              </span>
              <div>
                <dt className="text-[0.75rem] uppercase tracking-wider text-steel-600">Адрес</dt>
                <dd className="mt-0.5 text-[0.9375rem] text-steel-50">
                  {business.address.full}
                  <span className="mt-0.5 block text-[0.8125rem] text-steel-400">
                    {business.address.floor}, отдельный вход · индекс {business.address.postalCode}
                  </span>
                </dd>
              </div>
            </div>

            <div className="flex gap-3.5">
              <span className="mt-0.5 text-accent" aria-hidden="true">
                <ClockIcon />
              </span>
              <div>
                <dt className="text-[0.75rem] uppercase tracking-wider text-steel-600">
                  Режим работы
                </dt>
                <dd className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.9375rem] text-steel-50">
                  {business.hours.display}
                  <OpenStatus
                    timeZone={scheduleConfig.timeZone}
                    open={scheduleConfig.opensAt}
                    close={scheduleConfig.closesAt}
                    initialOpen={isOpenNowServer()}
                    className="rounded-pill border border-hairline bg-surface px-2.5 py-1"
                  />
                </dd>
              </div>
            </div>

            <div className="flex gap-3.5">
              <span className="mt-0.5 text-accent" aria-hidden="true">
                <PhoneIcon />
              </span>
              <div>
                <dt className="text-[0.75rem] uppercase tracking-wider text-steel-600">Телефон</dt>
                <dd className="mt-0.5">
                  <ActionLink
                    href={business.phone.e164}
                    event="phone_clicked"
                    payload={{ placement: 'location' }}
                    className="tnum text-[0.9375rem] text-steel-50 hover:text-white"
                  >
                    {business.phone.display}
                  </ActionLink>
                </dd>
              </div>
            </div>
          </dl>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <ActionLink
              href={links.route}
              event="route_clicked"
              payload={{ placement: 'location' }}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-block sm:w-auto sm:px-6"
            >
              Построить маршрут
            </ActionLink>
            <ActionLink
              href={business.phone.e164}
              event="phone_clicked"
              payload={{ placement: 'location_secondary' }}
              className="btn btn-secondary btn-block sm:w-auto"
            >
              Позвонить
            </ActionLink>
          </div>

          <p className="mt-4 text-[0.75rem] leading-relaxed text-steel-600">
            Остановка «Звоночек» — около 150 м (1 минута). Две парковки на территории.
          </p>
        </Reveal>

        {/* Map ---------------------------------------------------------- */}
        <Reveal delay={80}>
          <ActionLink
            href={links.route}
            event="route_clicked"
            payload={{ placement: 'location_map' }}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block overflow-hidden rounded-card border border-hairline bg-surface-sunken shadow-card"
            aria-label={`Открыть маршрут до ${business.address.full} в 2ГИС`}
          >
            <img
              src={mapImage.src}
              width={mapImage.width}
              height={mapImage.height}
              alt={`Карта: ${business.address.full}`}
              loading="lazy"
              decoding="async"
              draggable={false}
              style={{ filter: 'brightness(0.62) contrast(1.08) saturate(0.72)' }}
              className="block h-auto w-full"
            />
            {/* Pin tip sits on the crop centre = the branch coordinates. */}
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)]"
            >
              <svg width="38" height="50" viewBox="0 0 46 60" fill="none">
                <path
                  d="M23 58C23 58 42 32.5 42 21.5A19 19 0 1 0 4 21.5C4 32.5 23 58 23 58Z"
                  fill="#FF5A1F"
                  stroke="#fff"
                  strokeWidth="3"
                />
                <circle cx="23" cy="21" r="6" fill="#fff" />
              </svg>
            </span>

            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-3.5">
              <span className="text-[0.8125rem] font-semibold text-white">
                {business.address.streetShort}
              </span>
              <span className="rounded-pill border border-white/15 bg-ink/70 px-3 py-1.5 text-[0.75rem] font-semibold text-white backdrop-blur-sm transition group-hover:border-accent/60 group-hover:bg-accent">
                Открыть в 2ГИС →
              </span>
            </span>
          </ActionLink>
        </Reveal>
      </div>
    </section>
  );
}

/** Server-side open/closed so the first paint is already correct. */
function isOpenNowServer(): boolean {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: scheduleConfig.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const hh = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const mm = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  const now = hh * 60 + mm;
  return now >= 9 * 60 && now < 20 * 60;
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v5.2l3.4 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
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
