/**
 * Kazakhstan phone handling (+7 XXX XXX XX XX).
 *
 * Requirements this satisfies:
 *  · live mask while typing, without fighting the user
 *  · paste-safe: "+7 778 998 88 77", "8 778 998 88 77", "87789988877",
 *    "77789988877", "+7 (778) 998-88-77", "778 99 88 877" all normalise
 *  · clear, human error messages in Russian
 *
 * The KZ national number is 10 digits after the +7 country code and starts
 * with 7 (mobile) or 6/7 (landline within the 7xx range).
 */

export const KZ_DIAL_CODE = '+7';

/** Digits only, from any user input. */
export function digitsOf(input: string): string {
  return (input || '').replace(/\D+/g, '');
}

/**
 * Reduce arbitrary input to the 10 national digits (KZ/KZ-style), or null if
 * it cannot be a Kazakh number.
 */
export function nationalDigits(input: string): string | null {
  let d = digitsOf(input);

  if (!d) return null;

  // 8XXXXXXXXXX (national long-distance form) → drop the leading 8
  if (d.length === 11 && (d.startsWith('8') || d.startsWith('7'))) {
    d = d.slice(1);
  }

  // 10 digits is the national number
  if (d.length === 10) return d;

  // 11 digits beginning with 7 but no 8 (e.g. "77789988877")
  if (d.length === 11 && d.startsWith('7')) return d.slice(1);

  return null;
}

/** +77789988877 from any accepted input, or null. */
export function toE164(input: string): string | null {
  const n = nationalDigits(input);
  return n ? `${KZ_DIAL_CODE}${n}` : null;
}

/**
 * Progressive mask used while the user types.
 * Returns "+7 (778) 998-88-77" style output, truncated to what's typed so far.
 */
export function formatAsYouType(input: string): string {
  const n = nationalDigits(input);

  if (n) {
    // Full normalisation available — return the canonical grouped form.
    return `+7 (${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6, 8)}-${n.slice(8, 10)}`;
  }

  // Partial input: format whatever digits we have, preserving the prefix.
  //
  // Only a leading "8" (the unambiguous national long-distance prefix) is
  // stripped here. A leading "7" is deliberately NOT stripped: Kazakh mobile
  // numbers begin with 7, so stripping it would turn the user's "778…" into
  // "78…" while they type. The full-number case is already handled above.
  let d = digitsOf(input);
  if (d.startsWith('8') && d.length > 1) d = d.slice(1);
  d = d.slice(0, 10);

  if (d.length === 0) return input.startsWith('+') ? '+7 ' : '';

  let out = '+7';
  if (d.length > 0) out += ` (${d.slice(0, 3)}`;
  if (d.length >= 3) out += ')';
  if (d.length > 3) out += ` ${d.slice(3, 6)}`;
  if (d.length > 6) out += `-${d.slice(6, 8)}`;
  if (d.length > 8) out += `-${d.slice(8, 10)}`;
  return out;
}

export type PhoneCheck =
  | { ok: true; e164: string; pretty: string }
  | { ok: false; reason: 'empty' | 'incomplete' | 'invalid'; message: string };

export function checkPhone(input: string): PhoneCheck {
  const raw = (input || '').trim();
  if (!raw) return { ok: false, reason: 'empty', message: 'Укажите номер телефона' };

  const n = nationalDigits(raw);
  if (!n) {
    const d = digitsOf(raw);
    if (d.length < 10) {
      return {
        ok: false,
        reason: 'incomplete',
        message: 'Введите корректный номер телефона: +7 (___) ___-__-__',
      };
    }
    return {
      ok: false,
      reason: 'invalid',
      message: 'Введите корректный номер телефона: +7 (___) ___-__-__',
    };
  }

  // Kazakh mobile numbers start with 7; landline codes start with 6 or 7.
  if (!/^[67]/.test(n)) {
    return {
      ok: false,
      reason: 'invalid',
      message: 'Введите корректный номер телефона: +7 (___) ___-__-__',
    };
  }

  return { ok: true, e164: `${KZ_DIAL_CODE}${n}`, pretty: formatAsYouType(input) };
}

/** Pretty display for a stored E.164 number. */
export function prettyPhone(e164: string): string {
  return formatAsYouType(e164);
}
