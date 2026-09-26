import { describe, expect, it } from 'vitest';
import { buildBookingIcs } from '@/lib/ics';

describe('calendar export', () => {
  const ics = buildBookingIcs({
    uid: '11111111-2222-4333-8444-555555555555',
    slotDate: '2026-09-26',
    slotTime: '14:00',
    serviceTitle: 'Развал-схождение',
    customerName: 'Иван',
  });

  it('produces a valid VCALENDAR envelope', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true);
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
  });

  it('uses CRLF line endings as RFC 5545 requires', () => {
    expect(ics).toContain('\r\n');
    expect(ics.split('\r\n').length).toBeGreaterThan(10);
  });

  it('emits floating local start/end times for the agreed hour', () => {
    expect(ics).toContain('DTSTART:20260926T140000');
    expect(ics).toContain('DTEND:20260926T150000');
    // No trailing Z: the appointment is a wall-clock time in the venue's city.
    expect(ics).not.toMatch(/DTSTART:20260926T140000Z/);
  });

  it('carries the service, location and a reminder', () => {
    expect(ics).toContain('Развал-схождение');
    expect(ics).toContain('Толеу Сулейменова');
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).toContain('TRIGGER:-PT2H');
  });

  it('marks the event tentative, because the master confirms by phone', () => {
    expect(ics).toContain('STATUS:TENTATIVE');
  });

  it('does not promise a confirmed appointment in the description', () => {
    // Un-fold RFC 5545 line breaks before asserting on the logical content.
    const unfolded = ics.replace(/\r\n /g, '');
    expect(unfolded).not.toMatch(/гарантированно подтверждена/i);
    expect(unfolded).toContain('Время ожидает подтверждения');
  });

  it('folds lines at 74 octets', () => {
    for (const line of ics.split('\r\n')) {
      expect(line.length).toBeLessThanOrEqual(75);
    }
  });
});
