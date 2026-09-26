import type { Metadata } from 'next';
import Link from 'next/link';

import { business } from '@/data/business';
import { PageHeader } from '@/components/PageHeader';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности',
  description:
    `Какие данные собирает сайт автосервиса «${business.name}» при онлайн-записи, зачем они нужны и как их удалить.`,
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

const SECTIONS = [
  {
    h: 'Какие данные мы собираем',
    p: [
      'При отправке формы записи вы указываете имя, номер телефона и — по желанию — марку, модель и год автомобиля, а также комментарий к заявке. Это единственные персональные данные, которые попадают на сервер.',
      'Мы не запрашиваем адрес, e-mail, ИИН, платёжные данные и документы. Регистрация на сайте не требуется.',
    ],
  },
  {
    h: 'Зачем они нужны',
    p: [
      'Только для записи на обслуживание: чтобы мастер знал, к какому времени ждать автомобиль, и мог позвонить для подтверждения времени и уточнения деталей.',
      'Мы не используем эти данные для рассылок и не передаём их третьим лицам, кроме случаев, прямо предусмотренных законом.',
    ],
  },
  {
    h: 'Где они хранятся',
    p: [
      'Заявки хранятся в базе данных сервиса. Доступ к ним есть только у сотрудников, принимающих записи. Передача данных с сайта идёт по защищённому соединению HTTPS.',
    ],
  },
  {
    h: 'Аналитика и cookies',
    p: [
      'Сайт не подключает сторонние системы аналитики, рекламные пиксели и трекеры. События (например, «открыл услугу», «дошёл до выбора времени») считаются внутри самого сайта и не содержат персональных данных: ни имени, ни телефона, ни текста комментария.',
      'Технические cookies используются только для того, чтобы вы оставались в своей сессии, и для защиты формы от повторной отправки. Маркетинговых cookies нет.',
    ],
  },
  {
    h: 'Как удалить свои данные',
    p: [
      `Позвоните по номеру ${business.phone.display} или напишите в WhatsApp — попросите удалить заявку и ваши данные. Мы удалим их и подтвердим удаление.`,
    ],
  },
] as const;

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Документы"
        title="Политика конфиденциальности"
        lead="Коротко и без юридической воды: какие данные собирает этот сайт, зачем и как их удалить."
        breadcrumbs={[
          { href: '/', label: 'Главная' },
          { href: '/privacy', label: 'Конфиденциальность' },
        ]}
      />

      <div className="shell py-10 md:py-14">
        <div className="max-w-prose">
          {SECTIONS.map((s) => (
            <section key={s.h} className="mt-8 first:mt-0">
              <h2 className="text-[1.0625rem] font-bold text-white md:text-[1.25rem]">{s.h}</h2>
              {s.p.map((para) => (
                <p key={para.slice(0, 40)} className="mt-3 text-[0.9375rem] leading-relaxed text-steel-400">
                  {para}
                </p>
              ))}
            </section>
          ))}

          <section className="mt-10 rounded-card border border-hairline bg-surface p-5">
            <h2 className="text-[1.0625rem] font-bold text-white">Оператор данных</h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-steel-400">
              {business.category} «{business.name}», {business.address.full}, {business.city}.
              Телефон:{' '}
              <a href={business.phone.e164} className="tnum text-steel-200 hover:text-white">
                {business.phone.display}
              </a>
              .
            </p>
            <p className="mt-3 text-[0.8125rem] leading-relaxed text-steel-600">
              Реквизиты юридического лица для полной редакции документа нужно добавить владельцу —
              см. README, раздел «Что требует решения владельца».
            </p>
            <Link href="/booking" className="btn btn-secondary btn-sm mt-4">
              Вернуться к записи
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
