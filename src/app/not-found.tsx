import Link from 'next/link';
import { business, links } from '@/data/business';
import { ActionLink } from '@/components/actions';

export default function NotFound() {
  return (
    <div className="shell flex min-h-[70svh] items-center py-14">
      <div className="max-w-lg">
        <span className="eyebrow">Ошибка 404</span>
        <h1 className="mt-2 text-display-2 font-extrabold text-white">Страница не найдена</h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-steel-400">
          Такой страницы нет. Возможно, ссылка устарела. Записаться можно прямо сейчас — или
          посмотрите список услуг.
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link href="/booking" className="btn btn-primary">
            Записаться на сервис
          </Link>
          <Link href="/services" className="btn btn-secondary">
            Все услуги
          </Link>
          <Link href="/" className="btn btn-ghost">
            На главную
          </Link>
        </div>

        <p className="mt-6 text-[0.8125rem] text-steel-600">
          Или позвоните:{' '}
          <ActionLink
            href={business.phone.e164}
            event="phone_clicked"
            payload={{ placement: '404' }}
            className="tnum text-steel-200 hover:text-white"
          >
            {business.phone.display}
          </ActionLink>{' '}
          ·{' '}
          <ActionLink
            href={links.route}
            event="route_clicked"
            payload={{ placement: '404' }}
            target="_blank"
            rel="noopener noreferrer"
            className="text-steel-200 hover:text-white"
          >
            {business.address.streetShort}, {business.city}
          </ActionLink>
        </p>
      </div>
    </div>
  );
}
