import Link from 'next/link';
import { business, links } from '@/data/business';
import { ActionLink } from './actions';
import { NAV } from '@/data/nav';

/**
 * Deliberately short footer: identity, the four things a customer actually
 * needs (address, hours, phone, directions), the social links from 2GIS and
 * the legal line. No sitemap dump, no newsletter box.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline bg-graphite">
      <div className="shell py-10 md:py-14">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10">
          {/* Identity + primary actions ---------------------------------- */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-md border border-hairlineStrong bg-surface">
                <span className="h-2 w-2 rounded-[2px] bg-accent" aria-hidden="true" />
              </span>
              <span className="text-[1.0625rem] font-extrabold uppercase tracking-[0.16em] text-white">
                ТОКИО
              </span>
            </div>
            <p className="mt-3 max-w-xs text-[0.875rem] leading-relaxed text-steel-400">
              {business.categoryLong} в {business.city}. Работаем ежедневно, без выходных.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <ActionLink
                href={business.phone.e164}
                event="phone_clicked"
                payload={{ placement: 'footer' }}
                className="btn btn-secondary btn-sm"
              >
                Позвонить
              </ActionLink>
              <ActionLink
                href={business.whatsapp.deepLink}
                event="whatsapp_clicked"
                payload={{ placement: 'footer' }}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                WhatsApp
              </ActionLink>
              <ActionLink
                href={business.instagram.url}
                event="instagram_clicked"
                payload={{ placement: 'footer' }}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                Instagram
              </ActionLink>
            </div>
          </div>

          {/* Contact details -------------------------------------------- */}
          <div>
            <h2 className="eyebrow">Контакты</h2>
            <address className="mt-4 flex flex-col gap-3 text-[0.875rem] not-italic text-steel-200">
              <span>
                {business.city}
                <br />
                {business.address.street}
              </span>
              <a href={business.phone.e164} className="tnum hover:text-white">
                {business.phone.display}
              </a>
              <span className="text-steel-400">{business.hours.display}</span>
              <ActionLink
                href={links.route}
                event="route_clicked"
                payload={{ placement: 'footer' }}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent-bright hover:text-white"
              >
                Построить маршрут →
              </ActionLink>
            </address>
          </div>

          {/* Navigation + source line ----------------------------------- */}
          <div>
            <h2 className="eyebrow">Разделы</h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-[0.875rem] text-steel-200">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/privacy" className="text-steel-400 hover:text-white">
                  Политика конфиденциальности
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-9 border-t border-hairline pt-5">
          <p className="text-[0.75rem] leading-relaxed text-steel-600">
            © {year} {business.category} «{business.name}», {business.city}. Данные о компании,
            рейтинг, отзывы и фотографии —{' '}
            <ActionLink
              href={links.card}
              event="instagram_clicked"
              payload={{ placement: 'footer_source' }}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-steel-800 underline-offset-2 hover:text-steel-200"
            >
              2ГИС
            </ActionLink>
            . Цены не публикуются: стоимость рассчитывается после диагностики.
          </p>
        </div>
      </div>
    </footer>
  );
}
