import Link from 'next/link';
import { business, links } from '@/data/business';
import { srcSet, fallbackSrc } from '@/lib/images';
import { ActionLink } from './actions';
import { Reveal } from './Reveal';

type Props = {
  /** Which real photo backs this band. */
  photo: string;
  alt: string;
  eyebrow?: string;
  title: string;
  body: string;
  /** Distinguishes placements in analytics. */
  placement: string;
  /** Primary label. */
  ctaLabel?: string;
  /** Extra secondary actions besides call + WhatsApp. */
  showRoute?: boolean;
};

/**
 * A CTA band that carries the page between sections.
 *
 * Not a fixed overlay — it appears after key blocks (services, trust, reviews)
 * and at the end, so the "Записаться" action is always one tap away without a
 * permanent bar covering content.
 */
export function CtaBand({
  photo,
  alt,
  eyebrow = 'Запись',
  title,
  body,
  placement,
  ctaLabel = 'Записаться на сервис',
  showRoute = false,
}: Props) {
  return (
    <section className="relative isolate overflow-hidden border-y border-hairline bg-graphite">
      <div className="absolute inset-0 -z-10">
        <img
          src={fallbackSrc(photo)}
          srcSet={srcSet(photo)}
          sizes="100vw"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-full w-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, rgba(7,8,10,0.96) 0%, rgba(7,8,10,0.88) 42%, rgba(7,8,10,0.62) 100%)',
          }}
        />
      </div>

      <div className="shell py-11 md:py-16">
        <Reveal className="max-w-xl">
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="mt-2 text-display-2 font-extrabold text-white">{title}</h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-steel-200 md:text-base">
            {body}
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href="/booking" className="btn btn-primary btn-block sm:w-auto sm:px-7">
              {ctaLabel}
            </Link>
            <ActionLink
              href={business.whatsapp.deepLink}
              event="whatsapp_clicked"
              payload={{ placement }}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-block sm:w-auto"
            >
              WhatsApp
            </ActionLink>
            <ActionLink
              href={business.phone.e164}
              event="phone_clicked"
              payload={{ placement }}
              className="btn btn-secondary btn-block sm:w-auto"
            >
              Позвонить
            </ActionLink>
            {showRoute && (
              <ActionLink
                href={links.route}
                event="route_clicked"
                payload={{ placement }}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-block sm:w-auto"
              >
                Маршрут
              </ActionLink>
            )}
          </div>

          <p className="mt-4 text-[0.8125rem] text-steel-400">
            {business.hours.display} · {business.address.streetShort} ·{' '}
            <span className="tnum">{business.phone.display}</span>
          </p>
        </Reveal>
      </div>

      {/* Honest alt text is provided via the section heading; the band image is
          decorative, so it is hidden from assistive tech above. */}
      <span className="sr-only">{alt}</span>
    </section>
  );
}
