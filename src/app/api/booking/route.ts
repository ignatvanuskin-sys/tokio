import { NextResponse } from 'next/server';
import { getStoreSafe } from '@/lib/booking';
import { createBookingSchema, fieldErrors } from '@/lib/booking/validation';
import { toE164 } from '@/lib/phone';
import { getService } from '@/data/services';
import { clientKey, hit } from '@/lib/rate-limit';
import { notifyOwnerAboutBooking } from '@/lib/notify';
import { sameOrigin } from '@/lib/http';
import { venueDate } from '@/lib/time';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/booking
 *
 * Server-authoritative booking creation.
 *
 * Guarantees:
 *  · origin-checked and rate-limited per IP;
 *  · every field validated with zod BEFORE the store is touched;
 *  · the service title is resolved server-side from the slug — a client can
 *    never inject a price or a fake service name;
 *  · concurrency-safe reservation + idempotent retries (see postgres-store.ts);
 *  · a 409 with fresh availability when the slot was taken in the meantime, so
 *    the UI can recover instead of failing blindly.
 *
 * Notification failure never fails the booking — the owner sees it in /admin
 * regardless, and the response reports `notify` honestly.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) {
    return NextResponse.json(
      { ok: false, code: 'bad_origin', message: 'Запрос отклонён.' },
      { status: 403 },
    );
  }

  // 6 submissions per 10 minutes per IP is far above what a real customer does,
  // and low enough to make scripted abuse pointless.
  const limited = hit(clientKey(req, 'booking'), 6, 10 * 60_000);
  if (!limited.allowed) {
    return NextResponse.json(
      { ok: false, code: 'rate_limited', message: 'Слишком много попыток. Попробуйте через минуту.' },
      { status: 429, headers: { 'retry-after': String(limited.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: 'validation', message: 'Некорректный запрос.' },
      { status: 400 },
    );
  }

  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        code: 'validation',
        message: 'Проверьте заполненные поля.',
        fields: fieldErrors(parsed.error),
      },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const service = getService(input.serviceSlug);
  if (!service) {
    return NextResponse.json(
      { ok: false, code: 'validation', message: 'Неизвестная услуга.', fields: { serviceSlug: 'Выберите услугу' } },
      { status: 400 },
    );
  }

  const phone = toE164(input.phone);
  if (!phone) {
    return NextResponse.json(
      {
        ok: false,
        code: 'validation',
        message: 'Введите корректный номер телефона.',
        fields: { phone: 'Введите корректный номер телефона: +7 (___) ___-__-__' },
      },
      { status: 400 },
    );
  }

  const { store } = getStoreSafe();
  if (!store) {
    return NextResponse.json(
      {
        ok: false,
        code: 'server_error',
        message: 'Сервис записи временно недоступен. Позвоните нам или напишите в WhatsApp.',
      },
      { status: 503 },
    );
  }

  const result = await store.createBooking({
    slotDate: input.slotDate,
    slotTime: input.slotTime,
    serviceSlug: service.slug,
    // Resolved server-side — never trusted from the client.
    serviceTitle: service.title,
    name: input.name,
    phone,
    vehicleMake: input.vehicleMake,
    vehicleModel: input.vehicleModel,
    vehicleYear: input.vehicleYear,
    comment: input.comment,
    idempotencyKey: input.idempotencyKey,
    source: 'site',
  });

  if (!result.ok) {
    const status = result.code === 'slot_taken' || result.code === 'slot_not_bookable' ? 409 : 500;
    return NextResponse.json(
      {
        ok: false,
        code: result.code,
        message: result.message,
        availability: result.availability,
      },
      { status },
    );
  }

  // Notify the owner (best effort, never blocking the customer).
  let notify: { delivered: boolean; channel: string; reason?: string } = {
    delivered: false,
    channel: 'none',
  };
  if (!result.duplicate) {
    const n = await notifyOwnerAboutBooking(result.booking);
    notify = { delivered: n.delivered, channel: n.channel, reason: n.reason };
  }

  return NextResponse.json(
    {
      ok: true,
      duplicate: result.duplicate,
      booking: {
        id: result.booking.id,
        serviceSlug: result.booking.serviceSlug,
        serviceTitle: result.booking.serviceTitle,
        slotDate: result.booking.slotDate,
        slotTime: result.booking.slotTime,
        customerName: result.booking.customerName,
        status: result.booking.status,
      },
      notify,
      // Included so the UI can honestly tell the customer what happened.
      autoConfirmed: false,
      bookedOn: venueDate(),
    },
    { status: 201, headers: { 'cache-control': 'no-store' } },
  );
}
