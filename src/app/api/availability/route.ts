import { NextResponse } from 'next/server';
import { getStoreSafe } from '@/lib/booking';
import { clientKey, hit } from '@/lib/rate-limit';
import { addDays, venueDate } from '@/lib/time';
import { scheduleConfig } from '@/data/schedule';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * GET /api/availability?date=YYYY-MM-DD
 *
 * Returns the REAL slot grid for that date: every slot the workshop can
 * possibly offer, each flagged as taken/free and as bookable/too-soon.
 *
 * There is no randomness anywhere in this path — a slot is "taken" only
 * because a booking row in the database says so.
 */
export async function GET(req: Request) {
  const limited = hit(clientKey(req, 'availability'), 120, 60_000);
  if (!limited.allowed) {
    return NextResponse.json(
      { ok: false, code: 'rate_limited', message: 'Слишком много запросов. Попробуйте через минуту.' },
      { status: 429, headers: { 'retry-after': String(limited.retryAfter) } },
    );
  }

  const url = new URL(req.url);
  const date = url.searchParams.get('date') ?? '';

  if (!DATE_RE.test(date)) {
    return NextResponse.json(
      { ok: false, code: 'validation', message: 'Некорректная дата' },
      { status: 400 },
    );
  }

  const today = venueDate();
  if (date < today || date > addDays(today, scheduleConfig.horizonDays)) {
    return NextResponse.json(
      {
        ok: false,
        code: 'validation',
        message: `Запись открыта с ${today} по ${addDays(today, scheduleConfig.horizonDays)}`,
      },
      { status: 400 },
    );
  }

  const { store, error } = getStoreSafe();
  if (!store) {
    return NextResponse.json(
      {
        ok: false,
        code: 'server_error',
        message: 'Расписание временно недоступно. Позвоните нам или напишите в WhatsApp.',
      },
      { status: 503 },
    );
  }
  if (error) {
    return NextResponse.json({ ok: false, code: 'server_error', message: error }, { status: 503 });
  }

  try {
    const availability = await store.availability(date);
    return NextResponse.json(
      { ok: true, availability },
      { headers: { 'cache-control': 'no-store, max-age=0' } },
    );
  } catch (err) {
    console.error('[api/availability] failed', err);
    return NextResponse.json(
      {
        ok: false,
        code: 'server_error',
        message: 'Не удалось загрузить расписание. Проверьте соединение и попробуйте ещё раз.',
      },
      { status: 500 },
    );
  }
}
