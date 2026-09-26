/**
 * Booking-domain tests against the demo store.
 *
 * The demo store implements the SAME contract as the PostgreSQL store
 * (per-slot capacity reservation, idempotent retries, cancelled slots freed),
 * so these tests pin down the behaviour that matters. Postgres enforces it with
 * a unique idempotency index plus an atomic conditional UPDATE — see
 * src/lib/booking/postgres-store.ts and README §Concurrency.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { DemoBookingStore } from '@/lib/booking/demo-store';
import type { CreateBookingInput } from '@/lib/booking/types';
import { daySlotStarts } from '@/data/schedule';
import { addDays, venueDate } from '@/lib/time';

const now = new Date('2026-09-26T04:00:00Z'); // 09:00 in Almaty
const today = venueDate(now); // 2026-09-26
const tomorrow = addDays(today, 1);

// A fresh store per test also re-reads the scratch file written by setup.ts.
const makeStore = () => new DemoBookingStore();

function input(overrides: Partial<CreateBookingInput> = {}): CreateBookingInput {
  return {
    slotDate: tomorrow,
    slotTime: '10:00',
    serviceSlug: 'razval-shozhdenie',
    serviceTitle: 'Развал-схождение',
    name: 'Иван',
    phone: '+77789988877',
    idempotencyKey: crypto.randomUUID(),
    ...overrides,
  };
}

beforeAll(async () => {
  await makeStore().init();
});

describe('availability', () => {
  it('exposes every slot of the working day and marks them free initially', async () => {
    const day = await makeStore().availability(addDays(today, 20), now);

    expect(day.slots.map((s) => s.time)).toEqual(daySlotStarts());
    expect(day.slots.every((s) => s.available)).toBe(true);
    expect(day.timeZone).toBe('Asia/Almaty');
  });

  it('marks a slot as taken after a booking — deterministically, never randomly', async () => {
    const store = makeStore();
    const res = await store.createBooking(input(), now);
    expect(res.ok).toBe(true);

    const day = await store.availability(tomorrow, now);
    const slot = day.slots.find((s) => s.time === '10:00');
    expect(slot?.taken).toBe(1);
    expect(slot?.available).toBe(false);
  });

  it('marks past slots of today as not bookable', async () => {
    const day = await makeStore().availability(today, now);
    expect(day.slots.find((s) => s.time === '09:00')?.bookable).toBe(false);
    expect(day.slots.find((s) => s.time === '10:00')?.bookable).toBe(true);
  });
});

describe('double booking (the critical race)', () => {
  it('lets exactly ONE of many simultaneous requests win a slot', async () => {
    const store = makeStore();
    const date = addDays(today, 3);

    const results = await Promise.all(
      Array.from({ length: 8 }, (_, i) =>
        store.createBooking(
          input({
            slotDate: date,
            slotTime: '12:00',
            name: `Клиент ${i}`,
            phone: `+7778000000${i}`,
          }),
          now,
        ),
      ),
    );

    const wins = results.filter((r) => r.ok);
    const losses = results.filter((r) => !r.ok);

    expect(wins).toHaveLength(1);
    expect(losses).toHaveLength(7);

    for (const l of losses) {
      if (!l.ok) {
        expect(l.code).toBe('slot_taken');
        expect(l.message).toContain('заняли');
        // The loser gets fresh availability so the UI can recover.
        expect(l.availability?.date).toBe(date);
      }
    }

    const day = await store.availability(date, now);
    expect(day.slots.find((s) => s.time === '12:00')?.taken).toBe(1);
  });

  it('keeps different slots independent of each other', async () => {
    const store = makeStore();
    const date = addDays(today, 4);

    const a = await store.createBooking(input({ slotDate: date, slotTime: '09:00' }), now);
    const b = await store.createBooking(input({ slotDate: date, slotTime: '11:00' }), now);

    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
  });
});

describe('idempotency', () => {
  it('returns the original booking for a retried key instead of duplicating', async () => {
    const store = makeStore();
    const date = addDays(today, 5);
    const key = crypto.randomUUID();

    const first = await store.createBooking(
      input({ slotDate: date, slotTime: '14:00', idempotencyKey: key }),
      now,
    );
    const second = await store.createBooking(
      input({ slotDate: date, slotTime: '14:00', idempotencyKey: key }),
      now,
    );

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(second.duplicate).toBe(true);
      expect(second.booking.id).toBe(first.booking.id);
    }

    const day = await store.availability(date, now);
    expect(day.slots.find((s) => s.time === '14:00')?.taken).toBe(1);
  });

  it('collapses a concurrent double-submit of the same key into one booking', async () => {
    const store = makeStore();
    const date = addDays(today, 6);
    const key = crypto.randomUUID();

    const [r1, r2] = await Promise.all([
      store.createBooking(input({ slotDate: date, slotTime: '15:00', idempotencyKey: key }), now),
      store.createBooking(input({ slotDate: date, slotTime: '15:00', idempotencyKey: key }), now),
    ]);

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    if (r1.ok && r2.ok) expect(r1.booking.id).toBe(r2.booking.id);

    const day = await store.availability(date, now);
    expect(day.slots.find((s) => s.time === '15:00')?.taken).toBe(1);
  });
});

describe('status lifecycle', () => {
  it('frees the slot on cancellation and re-takes it on restore', async () => {
    const store = makeStore();
    const date = addDays(today, 7);

    const created = await store.createBooking(
      input({ slotDate: date, slotTime: '16:00' }),
      now,
    );
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    await store.setStatus(created.booking.id, 'cancelled');
    let day = await store.availability(date, now);
    expect(day.slots.find((s) => s.time === '16:00')?.available).toBe(true);

    // Someone else can take the freed slot.
    const other = await store.createBooking(
      input({ slotDate: date, slotTime: '16:00', name: 'Пётр', phone: '+77781112233' }),
      now,
    );
    expect(other.ok).toBe(true);

    await store.setStatus(created.booking.id, 'confirmed');
    day = await store.availability(date, now);
    expect(day.slots.find((s) => s.time === '16:00')?.taken).toBe(2);
  });

  it('returns null for an unknown booking id', async () => {
    expect(await makeStore().setStatus('00000000-0000-4000-8000-000000000000', 'done')).toBeNull();
  });
});

describe('persistence and filtering', () => {
  it('survives a new store instance (the demo file is real storage)', async () => {
    const store = makeStore();
    const date = addDays(today, 8);
    const created = await store.createBooking(input({ slotDate: date, slotTime: '17:00' }), now);
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const reloaded = makeStore();
    await reloaded.init();
    const found = await reloaded.getBooking(created.booking.id);
    expect(found?.slotDate).toBe(date);
  });

  it('filters by date range, status and service', async () => {
    const store = makeStore();
    const date = addDays(today, 9);
    await store.createBooking(input({ slotDate: date, slotTime: '09:00' }), now);

    const inRange = await store.listBookings({ from: date, to: date });
    expect(inRange.length).toBeGreaterThan(0);
    expect(inRange.every((b) => b.slotDate === date)).toBe(true);

    expect(await store.listBookings({ from: date, to: date, status: 'done' })).toHaveLength(0);

    const byService = await store.listBookings({
      from: date,
      to: date,
      serviceSlug: 'razval-shozhdenie',
    });
    expect(byService.length).toBeGreaterThan(0);
  });

  it('refuses a slot outside the booking horizon', async () => {
    const res = await makeStore().createBooking(
      input({ slotDate: addDays(today, 400), slotTime: '10:00' }),
      now,
    );
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe('slot_not_bookable');
  });
});
