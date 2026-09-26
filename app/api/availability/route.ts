import { NextResponse, type NextRequest } from 'next/server';
import { getAvailableSlots, getDatesAvailability } from '@/lib/booking';
import { findService, SERVICES } from '@/content/services';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * GET /api/availability?date=YYYY-MM-DD&service=suspension — свободное время.
 * Без параметра date возвращает, в какие дни есть свободные слоты (для календаря).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const params = new URL(request.url).searchParams;
  // Никаких «магических» слагов: без параметра берём первую услугу каталога.
  // Иначе переименование каталога тихо ломает календарь (именно это и случилось).
  const serviceSlug = params.get('service') ?? SERVICES[0]?.slug ?? '';

  if (!findService(serviceSlug)) {
    return NextResponse.json({ ok: false, message: 'Неизвестная услуга' }, { status: 422 });
  }

  const date = params.get('date');

  if (!date) {
    const days = await getDatesAvailability(serviceSlug);
    return NextResponse.json({ ok: true, days }, { headers: { 'Cache-Control': 'no-store' } });
  }

  if (!DATE_RE.test(date)) {
    return NextResponse.json({ ok: false, message: 'Некорректная дата' }, { status: 422 });
  }

  const slots = await getAvailableSlots(date, serviceSlug);
  return NextResponse.json({ ok: true, date, slots }, { headers: { 'Cache-Control': 'no-store' } });
}
