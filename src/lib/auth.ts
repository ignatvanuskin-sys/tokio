/**
 * Admin session handling.
 *
 * Design: a signed, HttpOnly cookie. No database lookup per request, no JWT
 * library, no session table to leak. The value is
 *   base64url(payload).base64url(HMAC-SHA256(payload, ADMIN_SESSION_SECRET))
 * and verification is a constant-time comparison.
 *
 * Password comparison uses timingSafeEqual over SHA-256 digests, so the
 * comparison time does not depend on how many leading characters matched.
 */

import { createHmac, randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'tokyo_admin';
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 24) {
    throw new Error(
      'ADMIN_SESSION_SECRET is missing or too short (min 24 chars). ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"',
    );
  }
  return value;
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

type SessionPayload = { sub: 'admin'; exp: number; jti: string };

export function createSessionToken(): string {
  const payload: SessionPayload = {
    sub: 'admin',
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
    jti: randomBytes(9).toString('base64url'),
  };
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [body, mac] = token.split('.');
  if (!body || !mac) return false;

  try {
    const expected = sign(body);
    const a = Buffer.from(mac);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (payload.sub !== 'admin') return false;
    if (typeof payload.exp !== 'number' || payload.exp * 1000 < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

/** Constant-time password check against ADMIN_PASSWORD. */
export function checkAdminPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    console.error('[auth] ADMIN_PASSWORD is not set — admin login is disabled.');
    return false;
  }
  const a = createHash('sha256').update(candidate, 'utf8').digest();
  const b = createHash('sha256').update(expected, 'utf8').digest();
  return timingSafeEqual(a, b);
}

export function adminConfigured(): { password: boolean; secret: boolean } {
  return {
    password: Boolean(process.env.ADMIN_PASSWORD),
    secret: Boolean(process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 24),
  };
}

/** Reads and validates the admin cookie inside a Server Component / Route Handler. */
export async function isAdminRequest(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(ADMIN_COOKIE)?.value);
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: MAX_AGE_SECONDS,
};
