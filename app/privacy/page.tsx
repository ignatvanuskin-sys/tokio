import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESS, OWNER_INPUT } from '@/content/business';
import Header from '@/components/site/Header';
import { Footer } from '@/components/site/Sections';

export const metadata: Metadata = {
  title: 'Обработка персональных данных',
  description:
    'Как автосервис «Токио» в Кокшетау обрабатывает данные, которые вы оставляете при онлайн-записи на ремонт: состав данных, основание, кому передаются, сроки хранения и как отозвать согласие.',
  alternates: { canonical: '/privacy' },
};

/**
 * Политика обработки данных.
 *
 * Аудит отметил, что для формы с телефоном и передачей заявки в Telegram этого
 * блока недостаточно: не хватало основания обработки, сроков и реквизитов
 * оператора. Основание и сроки добавлены, реквизиты вынесены отдельным блоком
 * с явными пометками — в карточке 2ГИС их нет, а выдумывать юридические данные
 * нельзя.
 *
 * TODO владельцу: заполнить OWNER_INPUT.legalEntity, OWNER_INPUT.bin и
 * OWNER_INPUT.dataProtectionContact и дать текст на проверку юристу в Казахстане.
 */
export default function PrivacyPage() {
  return (
    <>
      <Header />

      <main className="container-x max-w-[820px] py-10 md:py-16">
        <Link href="/" className="hint inline-flex min-h-[44px] items-center hover:text-[var(--color-ink)]">
          ← На главную
        </Link>

        <h1 className="h2 mt-5">Обработка персональных данных</h1>
        <p className="mt-3 text-[15px] text-[var(--color-muted)]">
          Оператор: {OWNER_INPUT.legalEntity ?? `автосервис «${BUSINESS.name}»`},{' '}
          {BUSINESS.address}, {BUSINESS.city}. Телефон: {BUSINESS.phone.display}.
        </p>

        <div className="mt-8 grid gap-6 text-[16px] leading-relaxed text-[var(--color-chrome)]">
          <section>
            <h2 className="h3 text-[19px]">1. Какие данные мы собираем</h2>
            <p className="mt-2 text-[var(--color-muted)]">
              При онлайн-записи: имя, номер телефона, сведения об автомобиле (марка, модель, год, госномер), описание
              проблемы и выбранные дата и время. Дополнительно сохраняется техническая информация: источник перехода
              (UTM-метки) и обезличенный идентификатор устройства для защиты формы от спама.
            </p>
          </section>

          <section>
            <h2 className="h3 text-[19px]">2. Зачем они нужны</h2>
            <p className="mt-2 text-[var(--color-muted)]">
              Только для обработки заявки: чтобы подтвердить запись, согласовать время визита и связаться с вами по
              вашему автомобилю. Мы не используем данные для рассылок третьих лиц и не продаём их.
            </p>
          </section>

          <section>
            <h2 className="h3 text-[19px]">3. Основание обработки</h2>
            <p className="mt-2 text-[var(--color-muted)]">
              Основание — ваше согласие. Вы даёте его галочкой перед отправкой формы, и без этой галочки заявка не
              отправляется. Согласие добровольное: вы можете не заполнять форму и вместо этого позвонить по телефону{' '}
              {BUSINESS.phone.display}. Отозвать согласие можно в любой момент — см. раздел 6.
            </p>
          </section>

          <section>
            <h2 className="h3 text-[19px]">4. Кому передаются данные</h2>
            <p className="mt-2 text-[var(--color-muted)]">
              Заявка видна сотрудникам сервиса. Если владелец подключил уведомления, копия карточки заявки
              отправляется в защищённый чат сервиса Telegram (Telegram Messenger Inc.) — это единственный внешний
              получатель данных. Другим лицам данные не передаются, кроме случаев, предусмотренных законодательством
              Республики Казахстан.
            </p>
          </section>

          <section>
            <h2 className="h3 text-[19px]">5. Сколько храним</h2>
            <p className="mt-2 text-[var(--color-muted)]">
              Столько, сколько нужно для обслуживания и учёта. Данные о визитах старше двух лет могут быть обезличены.
              Если вы отозвали согласие или попросили удалить данные, мы удаляем их, а не обезличиваем, — в течение
              30 дней после обращения.
            </p>
          </section>

          <section>
            <h2 className="h3 text-[19px]">6. Ваши права</h2>
            <p className="mt-2 text-[var(--color-muted)]">
              Вы можете отозвать согласие, запросить сведения об обработке, исправление или удаление своих данных.
              Для этого позвоните по номеру {BUSINESS.phone.display} или напишите в WhatsApp — этого достаточно, форма
              и регистрация не нужны. Мы не требуем объяснять причину отказа.
            </p>
          </section>

          <section>
            <h2 className="h3 text-[19px]">7. Файлы cookie</h2>
            <p className="mt-2 text-[var(--color-muted)]">
              Сайт не использует рекламные или аналитические cookie. Технические cookie нужны только панели
              сотрудников, чтобы держать сессию входа, и недоступны посетителям сайта.
            </p>
          </section>

          <section>
            <h2 className="h3 text-[19px]">8. Реквизиты и ответственный</h2>
            <dl className="mt-3 grid gap-2 text-[15px]">
              <div className="flex flex-wrap justify-between gap-2 border-b border-[var(--color-line)] pb-2">
                <dt className="text-[var(--color-muted)]">Оператор</dt>
                <dd className="text-right">{OWNER_INPUT.legalEntity ?? <OwnerTodo label="юрлицо или ИП" />}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2 border-b border-[var(--color-line)] pb-2">
                <dt className="text-[var(--color-muted)]">БИН / ИИН</dt>
                <dd className="text-right">{OWNER_INPUT.bin ?? <OwnerTodo label="БИН" />}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2 border-b border-[var(--color-line)] pb-2">
                <dt className="text-[var(--color-muted)]">Адрес</dt>
                <dd className="text-right">
                  {BUSINESS.address}, {BUSINESS.city}
                </dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-[var(--color-muted)]">Ответственный за обработку</dt>
                <dd className="text-right">
                  {OWNER_INPUT.dataProtectionContact ?? <OwnerTodo label="ФИО и контакт" />}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="card mt-8 p-5 text-[14px] leading-relaxed text-[var(--color-muted)]">
          <p className="font-semibold text-[var(--color-chrome)]">
            Что осталось сделать владельцу перед запуском
          </p>
          <ul className="mt-2 grid gap-1.5">
            <li>
              · Заполнить в <code className="font-mono">content/business.ts</code> поля{' '}
              <code className="font-mono">OWNER_INPUT.legalEntity</code>, <code className="font-mono">.bin</code> и{' '}
              <code className="font-mono">.dataProtectionContact</code> — тогда пометки ниже исчезнут сами.
            </li>
            <li>· Показать этот текст юристу в Казахстане и подтвердить формулировки.</li>
            <li>
              · Если уведомления в Telegram отключены, раздел 4 можно сократить: внешний получатель данных тогда
              не используется.
            </li>
          </ul>
        </div>

        <p className="mt-6 text-[13px] text-[var(--color-muted)]">
          Политика описывает только запись через этот сайт. Обработку данных в карточке 2ГИС регулируют правила самой
          платформы.
        </p>
      </main>

      <Footer />
    </>
  );
}

/** Пометка о незаполненном юридическом реквизите — видна только владельцу сайта. */
function OwnerTodo({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-[var(--color-warning)]/50 bg-[var(--color-warning)]/10 px-2 py-0.5 text-[13px] text-[var(--color-warning)]">
      не указано: {label}
    </span>
  );
}
