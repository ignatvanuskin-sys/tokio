import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import { isAdminRequest } from '@/lib/auth';
import { getStoreSafe, isDemoMode } from '@/lib/booking';
import { BOOKING_STATUSES, type BookingFilter, type BookingStatus } from '@/lib/booking/types';
import { notificationConfigured } from '@/lib/notify';
import { services } from '@/data/services';
import { addDays, formatDateRu, formatDateRuFull, venueDate } from '@/lib/time';
import { AdminBoard } from '@/components/admin/AdminBoard';
import { AdminLogoutButton } from '@/components/admin/AdminLogoutButton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Заявки — панель сервиса',
  robots: { index: false, follow: false, nocache: true },
};

type Range = 'today' | 'tomorrow' | 'week' | 'all';

function resolveRange(range: Range, today: string): { from?: string; to?: string; label: string } {
  switch (range) {
    case 'today':
      return { from: today, to: today, label: 'Сегодня' };
    case 'tomorrow': {
      const t = addDays(today, 1);
      return { from: t, to: t, label: 'Завтра' };
    }
    case 'week':
      return { from: today, to: addDays(today, 6), label: 'Неделя' };
    default:
      return { label: 'Все заявки' };
  }
}

/**
 * Owner's board.
 *
 * Read-only rendering happens on the server; moving a booking between statuses
 * is the only client interaction. Filters live in the URL so a refresh, a
 * bookmark or a phone that locks mid-scroll all land back where the owner was.
 */
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; status?: string; service?: string }>;
}) {
  if (!(await isAdminRequest())) redirect('/admin/login');

  const sp = await searchParams;
  const today = venueDate();

  const range = (['today', 'tomorrow', 'week', 'all'] as const).includes(sp.range as Range)
    ? (sp.range as Range)
    : 'today';

  const status =
    sp.status && (BOOKING_STATUSES as readonly string[]).includes(sp.status)
      ? (sp.status as BookingStatus)
      : undefined;

  const serviceSlug = sp.service && services.some((s) => s.slug === sp.service) ? sp.service : undefined;

  const { from, to, label } = resolveRange(range, today);

  const { store, error } = getStoreSafe();

  const filter: BookingFilter = { from, to, status, serviceSlug };
  const bookings = store ? await store.listBookings(filter).catch(() => []) : [];

  const weekCounts = store
    ? await store.countsByStatus(today, addDays(today, 6)).catch(() => null)
    : null;

  const demo = isDemoMode();
  const telegram = notificationConfigured();

  return (
    <div className="shell py-8 md:py-12">
      {/* Header ------------------------------------------------------- */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="eyebrow">Панель сервиса</span>
          <h1 className="mt-2 text-display-3 font-extrabold text-white">Заявки с сайта</h1>
          <p className="mt-2 text-[0.875rem] text-steel-400">
            {formatDateRuFull(today)} · {label}
            {serviceSlug ? ` · ${services.find((s) => s.slug === serviceSlug)?.title}` : ''}
          </p>
        </div>
        <AdminLogoutButton />
      </div>

      {/* Configuration honesty banner ------------------------------- */}
      <div className="mt-5 flex flex-col gap-2">
        {demo && (
          <p className="rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-[0.8125rem] leading-relaxed text-warn">
            <strong>Демо-хранилище.</strong> Заявки сохраняются в файл{' '}
            <code className="font-mono">.data/demo-db.json</code>, а не в PostgreSQL. Для
            продакшена задайте <code className="font-mono">DATABASE_URL</code>.
          </p>
        )}
        {!telegram && (
          <p className="rounded-xl border border-hairline bg-surface px-4 py-3 text-[0.8125rem] leading-relaxed text-steel-400">
            <strong className="text-steel-200">Telegram не подключён.</strong> Новые заявки
            сохраняются и видны здесь, но уведомление владельцу не отправляется. Задайте{' '}
            <code className="font-mono">TELEGRAM_BOT_TOKEN</code> и{' '}
            <code className="font-mono">TELEGRAM_CHAT_ID</code> — см. README.
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-[0.8125rem] leading-relaxed text-steel-50"
          >
            {error}
          </p>
        )}
      </div>

      {/* KPI row ----------------------------------------------------- */}
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { k: 'today', label: 'Сегодня', value: bookings.filter((b) => b.slotDate === today).length },
          {
            k: 'tomorrow',
            label: 'Завтра',
            value: bookings.filter((b) => b.slotDate === addDays(today, 1)).length,
          },
          {
            k: 'week',
            label: 'Новых за 7 дней',
            value: weekCounts ? weekCounts.new : bookings.filter((b) => b.status === 'new').length,
          },
          {
            k: 'confirmed',
            label: 'Подтверждено за 7 дней',
            value: weekCounts
              ? weekCounts.confirmed
              : bookings.filter((b) => b.status === 'confirmed').length,
          },
        ].map((kpi) => (
          <div key={kpi.k} className="card p-4">
            <dt className="text-[0.6875rem] uppercase tracking-wider text-steel-600">{kpi.label}</dt>
            <dd className="mt-1 text-[1.5rem] font-extrabold leading-none text-white tnum">
              {kpi.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Filters ----------------------------------------------------- */}
      <div className="mt-6 flex flex-col gap-3">
        <div className="rail -mx-gutter px-gutter md:mx-0 md:flex-wrap md:px-0">
          {(
            [
              { id: 'today', label: 'Сегодня' },
              { id: 'tomorrow', label: 'Завтра' },
              { id: 'week', label: 'Неделя' },
              { id: 'all', label: 'Все' },
            ] as const
          ).map((r) => (
            <Link
              key={r.id}
              href={`/admin?range=${r.id}${serviceSlug ? `&service=${serviceSlug}` : ''}${status ? `&status=${status}` : ''}`}
              aria-current={range === r.id ? 'page' : undefined}
              data-active={range === r.id}
              className="chip shrink-0"
            >
              {r.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: '', label: 'Все статусы' },
                { id: 'new', label: 'Новые' },
                { id: 'confirmed', label: 'Подтверждённые' },
                { id: 'done', label: 'Выполненные' },
                { id: 'cancelled', label: 'Отменённые' },
              ] as const
            ).map((s) => (
              <Link
                key={s.id || 'all'}
                href={`/admin?range=${range}${s.id ? `&status=${s.id}` : ''}${serviceSlug ? `&service=${serviceSlug}` : ''}`}
                data-active={(s.id || undefined) === status}
                className="chip"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        <form method="get" action="/admin" className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="range" value={range} />
          {status && <input type="hidden" name="status" value={status} />}
          <div className="min-w-[200px] flex-1">
            <label htmlFor="service-filter" className="field-label">
              Услуга
            </label>
            <select id="service-filter" name="service" defaultValue={serviceSlug ?? ''} className="field">
              <option value="">Все услуги</option>
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">
            Применить
          </button>
        </form>
      </div>

      {/* Board ------------------------------------------------------- */}
      <div className="mt-6">
        <AdminBoard bookings={bookings} today={today} />
      </div>

      {/* Analytics hand-off note ------------------------------------- */}
      <section className="mt-10 rounded-card border border-hairline bg-surface p-5">
        <h2 className="text-[0.9375rem] font-bold text-white">События для аналитики</h2>
        <p className="mt-2 max-w-2xl text-[0.8125rem] leading-relaxed text-steel-400">
          Сайт пишет события в <code className="font-mono">window.dataLayer</code> — без имён,
          телефонов и текста комментариев. Подключите любой тег-менеджер или свой приёмник, чтобы
          видеть воронку: просмотр → выбор услуги → выбор даты → выбор времени → отправка →
          успешная запись → звонок/WhatsApp.
        </p>
        <p className="mt-2 text-[0.75rem] text-steel-600">
          Полный список событий: <code className="font-mono">src/lib/analytics.ts</code>. Проверка
          конфигурации сервера: <Link href="/api/health" className="underline underline-offset-2">/api/health</Link>.
        </p>
      </section>
    </div>
  );
}
