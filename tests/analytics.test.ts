import { describe, expect, it } from 'vitest';
import { ANALYTICS_EVENTS, sanitize } from '@/lib/analytics';

describe('analytics privacy guard', () => {
  it('keeps whitelisted, non-personal keys', () => {
    const out = sanitize({ serviceSlug: 'razval-shozhdenie', slotTime: '14:00', count: 3 });
    expect(out).toEqual({ serviceSlug: 'razval-shozhdenie', slotTime: '14:00', count: 3 });
  });

  it('drops anything not on the whitelist', () => {
    const out = sanitize({ serviceSlug: 'x', favouriteColour: 'blue' } as never);
    expect(out.favouriteColour).toBeUndefined();
  });

  it('drops personal-data keys even if they were whitelisted', () => {
    const out = sanitize({
      name: 'Иван',
      phone: '+77789988877',
      comment: 'стучит справа',
      email: 'a@b.c',
    } as never);
    expect(out).toEqual({});
  });

  it('refuses to smuggle a phone number through an allowed key', () => {
    const out = sanitize({ serviceSlug: '+7 778 998 88 77' });
    expect(out.serviceSlug).toBeUndefined();
  });

  it('truncates overly long values', () => {
    const out = sanitize({ serviceSlug: 'a'.repeat(500) });
    expect(String(out.serviceSlug).length).toBeLessThanOrEqual(64);
  });

  it('drops null and undefined rather than sending them', () => {
    const out = sanitize({ slotDate: null, slotTime: undefined, count: 0 });
    expect(out).toEqual({ count: 0 });
  });

  it('exposes exactly the documented funnel events', () => {
    expect(ANALYTICS_EVENTS).toContain('page_view');
    expect(ANALYTICS_EVENTS).toContain('booking_started');
    expect(ANALYTICS_EVENTS).toContain('booking_success');
    expect(ANALYTICS_EVENTS).toContain('whatsapp_clicked');
    expect(ANALYTICS_EVENTS).toContain('route_clicked');
    expect(ANALYTICS_EVENTS).toHaveLength(14);
  });
});
