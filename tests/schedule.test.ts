import { describe, expect, it } from 'vitest';
import { daySlotStarts, scheduleConfig, toHHMM, toMinutes } from '@/data/schedule';
import {
  addDays,
  bookableDates,
  formatDateRuFull,
  isSlotBookable,
  relativeDayLabel,
  venueDate,
  venueWeekday,
} from '@/lib/time';

describe('schedule model', () => {
  it('is open every day, 09:00–20:00 (SOURCE: 2GIS)', () => {
    expect(scheduleConfig.openDays).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(scheduleConfig.opensAt).toBe('09:00');
    expect(scheduleConfig.closesAt).toBe('20:00');
    expect(scheduleConfig.timeZone).toBe('Asia/Almaty');
  });

  it('generates slots from opening to closing without overrunning', () => {
    const slots = daySlotStarts();
    expect(slots[0]).toBe('09:00');
    expect(slots[slots.length - 1]).toBe('19:00');
    // A 60-minute slot may not start at 19:30 or later.
    expect(slots).not.toContain('20:00');
    expect(slots).toHaveLength(11);

    for (const s of slots) {
      expect(toMinutes(s) + scheduleConfig.slotMinutes).toBeLessThanOrEqual(toMinutes('20:00'));
    }
  });

  it('round-trips minute conversions', () => {
    expect(toMinutes('09:00')).toBe(540);
    expect(toHHMM(540)).toBe('09:00');
    expect(toHHMM(toMinutes('19:00'))).toBe('19:00');
  });
});

describe('venue timezone handling', () => {
  it('derives the venue date, not the visitor date', () => {
    // 2026-09-26T20:30Z is already 2026-09-27 01:30 in Almaty (UTC+5).
    const instant = new Date('2026-09-26T20:30:00Z');
    expect(venueDate(instant)).toBe('2026-09-27');
  });

  it('stays on the same day just before venue midnight', () => {
    // 2026-09-26T18:59Z = 23:59 Almaty
    expect(venueDate(new Date('2026-09-26T18:59:00Z'))).toBe('2026-09-26');
    // 2026-09-26T19:01Z = 00:01 next day Almaty
    expect(venueDate(new Date('2026-09-26T19:01:00Z'))).toBe('2026-09-27');
  });

  it('formats dates in Russian', () => {
    expect(formatDateRuFull('2026-09-26')).toBe('26 сентября 2026');
  });
});

describe('bookable dates', () => {
  it('returns the requested number of consecutive open days', () => {
    const dates = bookableDates(5, new Date('2026-09-26T06:00:00Z'));
    expect(dates).toHaveLength(5);
    expect(dates[0]).toBe('2026-09-26');
    expect(dates[1]).toBe('2026-09-27');
    expect(addDays('2026-09-26', 5)).toBe('2026-10-01');
  });

  it('labels today and tomorrow', () => {
    expect(relativeDayLabel('2026-09-26', '2026-09-26')).toBe('Сегодня');
    expect(relativeDayLabel('2026-09-27', '2026-09-26')).toBe('Завтра');
    expect(relativeDayLabel('2026-09-30', '2026-09-26')).toBe('ср');
  });

  it('knows weekdays', () => {
    expect(venueWeekday('2026-09-26')).toBe(6); // Saturday
  });
});

describe('slot bookability', () => {
  const now = new Date('2026-09-26T04:00:00Z'); // 09:00 Almaty

  it('rejects past dates', () => {
    expect(isSlotBookable('2026-09-25', '10:00', now)).toBe(false);
  });

  it('respects the minimum lead time for today', () => {
    // At 09:00 Almaty a 09:00 slot is in the past; 10:00 is still bookable.
    expect(isSlotBookable('2026-09-26', '09:00', now)).toBe(false);
    expect(isSlotBookable('2026-09-26', '10:00', now)).toBe(true);
  });

  it('allows any slot on a future date within the horizon', () => {
    expect(isSlotBookable('2026-09-27', '09:00', now)).toBe(true);
  });

  it('refuses dates beyond the booking horizon', () => {
    const beyond = addDays(venueDate(now), scheduleConfig.horizonDays + 1);
    expect(isSlotBookable(beyond, '10:00', now)).toBe(false);
  });
});
