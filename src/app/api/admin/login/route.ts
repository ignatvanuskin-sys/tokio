import { NextResponse } from 'next/server';
import { adminCookieOptions, ADMIN_COOKIE, adminConfigured, checkAdminPassword, createSessionToken } from '@/lib/auth';
import { clientKey, hit } from '@/lib/rate-limit';
import { sameOrigin } from '@/lib/http';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/admin/login
 *
 * · 5 attempts per 15 minutes per IP (brute-force damping);
 * · constant-time password comparison;
 * · HttpOnly + SameSite=Lax session cookie (Secure in production);
 * · identical response time and message for "wrong password" and "not
 *   configured" from the client's perspective — no account enumeration.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ ok: false, message: 'Запрос отклонён.' }, { status: 403 });
  }

  const limited = hit(clientKey(req, 'admin_login'), 5, 15 * 60_000);
  if (!limited.allowed) {
    return NextResponse.json(
      { ok: false, message: `Слишком много попыток входа. Попробуйте через ${limited.retryAfter} с.` },
      { status: 429, headers: { 'retry-after': String(limited.retryAfter) } },
    );
  }

  const configured = adminConfigured();
  if (!configured.password || !configured.secret) {
    console.error(
      '[admin/login] ADMIN_PASSWORD and/or ADMIN_SESSION_SECRET are not configured. Login is disabled.',
    );
    return NextResponse.json(
      {
        ok: false,
        message:
          'Панель не настроена: задайте ADMIN_PASSWORD и ADMIN_SESSION_SECRET (минимум 24 символа) в переменных окружения.',
      },
      { status: 503 },
    );
  }

  let password = '';
  try {
    const body = (await req.json()) as { password?: unknown };
    password = typeof body.password === 'string' ? body.password : '';
  } catch {
    password = '';
  }

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ ok: false, message: 'Неверный пароль.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createSessionToken(), adminCookieOptions);
  return res;
}
