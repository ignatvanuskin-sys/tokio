import { NextResponse } from 'next/server';
import { getStoreSafe, isDemoMode } from '@/lib/booking';
import { notificationConfigured } from '@/lib/notify';
import { adminConfigured } from '@/lib/auth';
import { venueDate } from '@/lib/time';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/health
 *
 * Liveness + an honest configuration report. Deliberately says WHICH pieces are
 * missing rather than reporting a green light that isn't true. No secret values
 * are ever returned — only whether they are present.
 */
export async function GET() {
  const { store, error } = getStoreSafe();

  let storage: { ok: boolean; backend: string; detail?: string } = {
    ok: false,
    backend: store?.backend ?? 'none',
    detail: error ?? undefined,
  };

  if (store) {
    try {
      storage = await store.health();
    } catch (err) {
      storage = { ok: false, backend: store.backend, detail: (err as Error).message };
    }
  }

  const demo = isDemoMode();
  const notifications = notificationConfigured();
  const admin = adminConfigured();

  const warnings: string[] = [];
  if (demo) warnings.push('DATABASE_URL отсутствует — используется демо-хранилище (файл).');
  if (!notifications) warnings.push('Telegram не настроен — владелец не получает уведомления.');
  if (!admin.password) warnings.push('ADMIN_PASSWORD не задан — вход в панель отключён.');
  if (!admin.secret) warnings.push('ADMIN_SESSION_SECRET не задан — вход в панель отключён.');
  if (!process.env.NEXT_PUBLIC_SITE_URL) warnings.push('NEXT_PUBLIC_SITE_URL не задан — canonical/OG неверны.');

  return NextResponse.json(
    {
      ok: storage.ok,
      service: 'tokyo-autoservice',
      venueDate: venueDate(),
      timeZone: process.env.VENUE_TIMEZONE || 'Asia/Almaty',
      storage,
      notifications: { telegram: notifications },
      admin: { passwordConfigured: admin.password, secretConfigured: admin.secret },
      warnings,
    },
    { status: storage.ok ? 200 : 503, headers: { 'cache-control': 'no-store' } },
  );
}
