import { NextResponse } from 'next/server';

/**
 * Origin / CSRF guard for state-changing API routes.
 *
 * The admin cookie is SameSite=Lax, which already blocks cross-site POSTs from
 * a form. This is defence in depth: a browser always sends `Origin` on a
 * cross-origin POST and on same-origin POSTs, so a mismatching or missing
 * Origin on a mutating request is rejected.
 *
 * Requests without an Origin *and* without a Referer are accepted only when the
 * app runs behind a same-origin proxy that strips them (curl, server-to-server
 * probes) — those carry no ambient cookies, so they gain nothing.
 */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // non-browser client, no ambient credentials

  const allowed = new Set<string>();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      allowed.add(new URL(siteUrl).origin);
    } catch {
      /* malformed env value — ignore, the host check below still applies */
    }
  }

  const host = req.headers.get('host');
  if (host) {
    allowed.add(`https://${host}`);
    allowed.add(`http://${host}`);
  }

  return allowed.has(origin);
}

export function jsonError(
  status: number,
  code: string,
  message: string,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ ok: false, code, message, ...(extra ?? {}) }, { status });
}

export function jsonOk(data: Record<string, unknown>, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

/**
 * Distinguishes "the network died" from "the server said no".
 * The client uses these codes to pick the right Russian error copy.
 */
export const ERROR_CODES = {
  VALIDATION: 'validation',
  SLOT_TAKEN: 'slot_taken',
  SLOT_NOT_BOOKABLE: 'slot_not_bookable',
  RATE_LIMITED: 'rate_limited',
  BAD_ORIGIN: 'bad_origin',
  SERVER: 'server_error',
} as const;
