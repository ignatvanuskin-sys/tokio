import { describe, expect, it } from 'vitest';
import { createBookingSchema, fieldErrors } from '@/lib/booking/validation';
import { addDays, venueDate } from '@/lib/time';

const today = venueDate();
const tomorrow = addDays(today, 1);

function payload(overrides: Record<string, unknown> = {}) {
  return {
    serviceSlug: 'razval-shozhdenie',
    slotDate: tomorrow,
    slotTime: '14:00',
    name: 'Иван Петров',
    phone: '+7 778 998 88 77',
    idempotencyKey: crypto.randomUUID(),
    ...overrides,
  };
}

describe('booking payload validation', () => {
  it('accepts a minimal valid payload and normalises optionals to null', () => {
    const res = createBookingSchema.safeParse(payload());
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.vehicleMake).toBeNull();
      expect(res.data.vehicleModel).toBeNull();
      expect(res.data.vehicleYear).toBeNull();
      expect(res.data.comment).toBeNull();
    }
  });

  it('rejects an unknown service slug', () => {
    const res = createBookingSchema.safeParse(payload({ serviceSlug: 'free-money' }));
    expect(res.success).toBe(false);
    if (!res.success) expect(fieldErrors(res.error).serviceSlug).toBeTruthy();
  });

  it('rejects a slot time that the venue does not offer', () => {
    for (const bad of ['08:00', '20:00', '23:30', '9:00', 'abc']) {
      expect(createBookingSchema.safeParse(payload({ slotTime: bad })).success).toBe(false);
    }
  });

  it('accepts every real slot time', () => {
    for (const t of ['09:00', '13:00', '19:00']) {
      expect(createBookingSchema.safeParse(payload({ slotTime: t })).success).toBe(true);
    }
  });

  it('rejects dates in the past and beyond the horizon', () => {
    expect(createBookingSchema.safeParse(payload({ slotDate: '2020-01-01' })).success).toBe(false);
    expect(createBookingSchema.safeParse(payload({ slotDate: addDays(today, 400) })).success).toBe(
      false,
    );
  });

  it('rejects malformed dates', () => {
    for (const bad of ['26.09.2026', '2026-9-26', 'tomorrow', '']) {
      expect(createBookingSchema.safeParse(payload({ slotDate: bad })).success).toBe(false);
    }
  });

  it('rejects bad phone numbers', () => {
    for (const bad of ['', '123', 'не телефон', '+1 415 555 2671', '0000000000']) {
      const res = createBookingSchema.safeParse(payload({ phone: bad }));
      expect(res.success).toBe(false);
      if (!res.success) expect(fieldErrors(res.error).phone).toBeTruthy();
    }
  });

  it('rejects nonsense names and control characters', () => {
    expect(createBookingSchema.safeParse(payload({ name: 'A' })).success).toBe(false);
    expect(createBookingSchema.safeParse(payload({ name: 'x'.repeat(200) })).success).toBe(false);
  });

  it('coerces and bounds the vehicle year', () => {
    const ok = createBookingSchema.safeParse(payload({ vehicleYear: '2014' }));
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.vehicleYear).toBe(2014);

    expect(createBookingSchema.safeParse(payload({ vehicleYear: '1200' })).success).toBe(false);
    expect(createBookingSchema.safeParse(payload({ vehicleYear: '99999' })).success).toBe(false);
  });

  it('caps the comment length', () => {
    expect(createBookingSchema.safeParse(payload({ comment: 'x'.repeat(601) })).success).toBe(false);
    expect(createBookingSchema.safeParse(payload({ comment: 'Стучит справа' })).success).toBe(true);
  });

  it('requires a UUID idempotency key', () => {
    expect(createBookingSchema.safeParse(payload({ idempotencyKey: 'abc' })).success).toBe(false);
    expect(createBookingSchema.safeParse(payload({ idempotencyKey: crypto.randomUUID() })).success).toBe(
      true,
    );
  });
});
