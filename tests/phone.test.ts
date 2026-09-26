import { describe, expect, it } from 'vitest';
import { checkPhone, formatAsYouType, nationalDigits, toE164 } from '@/lib/phone';

describe('phone normalisation', () => {
  const ACCEPTED = [
    '+7 778 998 88 77',
    '+7 (778) 998-88-77',
    '8 778 998 88 77',
    '87789988877',
    '77789988877',
    '+77789988877',
    '8(778)9988877',
    '  +7 778  998 88 77  ',
    '778 99 88 877',
  ];

  it.each(ACCEPTED)('accepts %s', (input) => {
    expect(toE164(input)).toBe('+77789988877');
  });

  it('rejects empty, short and malformed input', () => {
    for (const bad of ['', '  ', '+7', '778', '7789988', 'abcd', '+1 415 555 2671', '0000000000']) {
      expect(checkPhone(bad).ok).toBe(false);
    }
  });

  it('gives a clear Russian message on bad input', () => {
    const res = checkPhone('12345');
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.message).toContain('+7 (___) ___-__-__');
  });

  it('normalises the national part independently of the prefix', () => {
    expect(nationalDigits('+7 (778) 998-88-77')).toBe('7789988877');
    expect(nationalDigits('87789988877')).toBe('7789988877');
  });
});

describe('phone mask', () => {
  it('formats a complete number', () => {
    expect(formatAsYouType('+77789988877')).toBe('+7 (778) 998-88-77');
  });

  it('formats progressively while typing', () => {
    expect(formatAsYouType('7')).toBe('+7 (7');
    expect(formatAsYouType('778')).toBe('+7 (778)');
    expect(formatAsYouType('7789')).toBe('+7 (778) 9');
    // Digits are revealed as they are typed, so the 7th digit already opens the
    // final pair rather than waiting for it to be completed.
    expect(formatAsYouType('7789988')).toBe('+7 (778) 998-8');
    expect(formatAsYouType('77899888')).toBe('+7 (778) 998-88');
  });

  it('is paste-safe: a pasted 8-prefixed number reformats on blur', () => {
    expect(formatAsYouType('8 778 998 88 77')).toBe('+7 (778) 998-88-77');
  });

  it('never renders more than the full national length', () => {
    // 17 digits of junk must still produce a bounded, well-formed mask.
    const out = formatAsYouType('87789988877999999');
    expect(out).toBe('+7 (778) 998-88-77');
    expect(formatAsYouType('77789988877999999')).toMatch(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/);
  });
});
