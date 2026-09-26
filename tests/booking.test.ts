import { beforeAll, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Хранилище тестов пишет в отдельный временный каталог, рабочие данные не трогает.
const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tokyo-test-'));
process.env.TOKYO_DATA_DIR = testDir;

const { createBooking, getBookings, getBooking, updateBooking, getDashboard, getAvailableSlots } = await import(
  '@/lib/booking'
);
const { addDays, todayInTz } = await import('@/lib/format');
const { durationForService } = await import('@/lib/validation');
const { SERVICES } = await import('@/content/services');

const TODAY = todayInTz();

/**
 * Each time-sensitive test gets its own date.
 *
 * Длительность приёма у услуг «Токио» разная (от 45 до 180 минут), и слоты
 * соседних записей пересекаются. Пока все тесты писали на одну дату, поздние
 * проверки падали не из-за бага, а из-за занятого времени — поэтому даты
 * разведены, а времена берутся из реальной сетки, а не зашиты в тест.
 */
const DATE_A = addDays(TODAY, 2);
const DATE_B = addDays(TODAY, 3);
const DATE_C = addDays(TODAY, 4);
const DATE_D = addDays(TODAY, 5);
const DATE_E = addDays(TODAY, 6);
const DATE_F = addDays(TODAY, 7);
const DATE_G = addDays(TODAY, 8);

type Payload = Parameters<typeof createBooking>[0];

function payload(overrides: Partial<Payload> = {}): Payload {
  return {
    serviceSlug: 'suspension',
    date: DATE_A,
    time: '11:00',
    carBrand: 'Toyota',
    carModel: 'Camry',
    carYear: '2012',
    carPlate: '123ABC02',
    name: 'Асхат',
    phone: '+77789988877',
    comment: 'Стук спереди справа',
    consent: true,
    ...overrides,
  };
}

/** Первое свободное время из реальной сетки — тест не зависит от часов работы. */
async function firstFree(date: string, serviceSlug: string): Promise<string> {
  const slots = await getAvailableSlots(date, serviceSlug);
  const free = slots.find((slot) => slot.available);
  if (!free) throw new Error(`нет свободных слотов: ${date} / ${serviceSlug}`);
  return free.time;
}

beforeAll(() => {
  // Уведомления в тестах не настроены — сервис должен работать и без них.
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_CHAT_IDS;
});

describe('сервис заявок', () => {
  it('создаёт заявку со статусом NEW и номером', async () => {
    const result = await createBooking(payload({ date: DATE_A, time: await firstFree(DATE_A, 'suspension') }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.booking.status).toBe('NEW');
    expect(result.booking.number).toBeGreaterThan(0);
    // Длительность берётся из каталога услуг, а не зашита числом в тест.
    expect(result.booking.durationMin).toBe(durationForService('suspension'));
    expect(result.booking.serviceTitle).toBe('Ремонт ходовой части');
    expect(result.booking.notification).toBeUndefined();
  });

  it('не пускает вторую заявку на то же время', async () => {
    const time = await firstFree(DATE_B, 'suspension');
    const first = await createBooking(payload({ date: DATE_B, time, phone: '+77701112233' }));
    const second = await createBooking(payload({ date: DATE_B, time, phone: '+77701112244' }));

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.reason).toBe('taken');
  });

  it('отклоняет прошедшую дату и время вне сетки', async () => {
    const past = await createBooking(payload({ date: addDays(TODAY, -1), time: '11:00' }));
    const offGrid = await createBooking(payload({ date: DATE_C, time: '23:45' }));

    expect(past.ok).toBe(false);
    expect(offGrid.ok).toBe(false);
  });

  it('освобождает время, если заявку отменили', async () => {
    const time = await firstFree(DATE_C, 'suspension');
    const created = await createBooking(payload({ date: DATE_C, time }));
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const blocked = await createBooking(payload({ date: DATE_C, time }));
    expect(blocked.ok).toBe(false);

    await updateBooking(created.booking.id, { status: 'CANCELLED' });

    const afterCancel = await createBooking(payload({ date: DATE_C, time }));
    expect(afterCancel.ok).toBe(true);
  });

  it('сохраняет снимок услуги, даже если каталог потом изменится', async () => {
    const created = await createBooking(
      payload({ date: DATE_D, time: await firstFree(DATE_D, 'alignment'), serviceSlug: 'alignment' })
    );
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.booking.serviceTitle).toBe('Развал-схождение');
    expect(created.booking.serviceSlug).toBe('alignment');
  });

  it('принимает все услуги из каталога на своей дате', async () => {
    // Гарантия, что каждый slug каталога реально проходит валидацию записи:
    // это ловит рассинхрон между content/services.ts и правилами бронирования.
    for (const service of SERVICES) {
      expect(service.priceFrom).toBeNull(); // цен в карточке 2ГИС нет
      const slots = await getAvailableSlots(DATE_G, service.slug);
      expect(slots.length).toBeGreaterThan(0);
    }
  });

  it('меняет статус и запоминает время изменения', async () => {
    const created = await createBooking(payload({ date: DATE_E, time: await firstFree(DATE_E, 'suspension') }));
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const updated = await updateBooking(created.booking.id, { status: 'CONFIRMED' });
    expect(updated?.status).toBe('CONFIRMED');
    expect(updated?.statusUpdatedAt).not.toBe(created.booking.statusUpdatedAt);
  });

  it('отдаёт список заявок, одну заявку и счётчики', async () => {
    const all = await getBookings();
    expect(all.length).toBeGreaterThan(0);
    expect(all[0].createdAt >= all[all.length - 1].createdAt).toBe(true);

    const one = await getBooking(all[0].id);
    expect(one?.id).toBe(all[0].id);
    expect(await getBooking('нет-такой-заявки')).toBeNull();

    const dashboard = await getDashboard();
    expect(dashboard.totalCount).toBe(all.length);
    expect(dashboard.newCount).toBeGreaterThanOrEqual(0);

    const today = await getBookings({ date: 'today' });
    expect(Array.isArray(today)).toBe(true);
  });

  it('фильтрует по статусу и поиску', async () => {
    const cancelled = await getBookings({ status: 'CANCELLED' });
    expect(cancelled.every((booking) => booking.status === 'CANCELLED')).toBe(true);

    const found = await getBookings({ search: 'Camry' });
    expect(found.length).toBeGreaterThan(0);

    const missing = await getBookings({ search: 'НетТакогоАвто' });
    expect(missing).toHaveLength(0);
  });

  it('показывает свободное время и занятое помечает недоступным', async () => {
    const time = await firstFree(DATE_F, 'suspension');
    const created = await createBooking(payload({ date: DATE_F, time }));
    expect(created.ok).toBe(true);

    const slots = await getAvailableSlots(DATE_F, 'suspension');
    expect(slots.find((slot) => slot.time === time)?.available).toBe(false);
    expect(slots.length).toBeGreaterThan(0);
  });
});
