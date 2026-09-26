import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStoreSafe } from '@/lib/booking';
import { BOOKING_STATUSES } from '@/lib/booking/types';
import { isAdminRequest } from '@/lib/auth';
import { sameOrigin } from '@/lib/http';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const patchSchema = z.object({
  status: z.enum(BOOKING_STATUSES as [string, ...string[]]),
});

/** PATCH /api/admin/bookings/:id — move a booking through its lifecycle. */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ ok: false, message: 'Запрос отклонён.' }, { status: 403 });
  }
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, message: 'Требуется вход.' }, { status: 401 });
  }

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Некорректный запрос.' }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: 'Некорректный статус.' }, { status: 400 });
  }

  const { store } = getStoreSafe();
  if (!store) {
    return NextResponse.json({ ok: false, message: 'Хранилище недоступно.' }, { status: 503 });
  }

  const updated = await store.setStatus(id, parsed.data.status as (typeof BOOKING_STATUSES)[number]);
  if (!updated) {
    return NextResponse.json({ ok: false, message: 'Заявка не найдена.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, booking: updated }, { headers: { 'cache-control': 'no-store' } });
}
