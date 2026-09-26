import type { BookingStore } from './types';
import { demoStore } from './demo-store';
import { postgresStore } from './postgres-store';

let cached: BookingStore | null = null;

/**
 * Chooses the booking backend.
 *
 *  · DATABASE_URL set            → PostgreSQL  (production)
 *  · DATABASE_URL missing        → demo file store, and in a production build
 *                                  that is a hard error rather than a silent
 *                                  downgrade, so nobody ships fake storage.
 *
 * Set `ALLOW_DEMO_STORE=1` to deliberately run the demo backend on a
 * production build (useful for a staging preview — never for the real site).
 */
export function getStore(): BookingStore {
  if (cached) return cached;

  const hasDb = Boolean(process.env.DATABASE_URL);
  const isProd = process.env.NODE_ENV === 'production';
  const demoAllowed = process.env.ALLOW_DEMO_STORE === '1';

  if (hasDb) {
    cached = postgresStore;
    return cached;
  }

  if (isProd && !demoAllowed) {
    throw new Error(
      'DATABASE_URL is not configured. Refusing to serve the demo booking store in production. ' +
        'Set DATABASE_URL (see .env.example) or set ALLOW_DEMO_STORE=1 for a staging preview.',
    );
  }

  cached = demoStore;
  return cached;
}

/** Non-throwing variant for health checks and status banners. */
export function getStoreSafe(): { store: BookingStore | null; error: string | null } {
  try {
    return { store: getStore(), error: null };
  } catch (err) {
    return { store: null, error: (err as Error).message };
  }
}

export function isDemoMode(): boolean {
  return !process.env.DATABASE_URL;
}

export * from './types';
