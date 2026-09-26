/**
 * First-party analytics event layer.
 *
 * Why not just drop in an external tag: the site loads ZERO third-party
 * scripts (see the CSP in next.config.mjs). Events are pushed onto a
 * `window.dataLayer` array, which any tag manager or the site owner's own
 * endpoint can consume later — and until then they are visible in the console
 * in development and in the admin "funnel" panel.
 *
 * PRIVACY: `track()` strips anything that looks like personal data and only
 * accepts a closed whitelist of keys. Names, phones, comments and free text can
 * never reach analytics — there is a unit test for this (tests/analytics.test.ts).
 */

export const ANALYTICS_EVENTS = [
  'page_view',
  'service_view',
  'booking_started',
  'service_selected',
  'date_selected',
  'time_selected',
  'booking_submitted',
  'booking_success',
  'booking_error',
  'phone_clicked',
  'whatsapp_clicked',
  'instagram_clicked',
  'route_clicked',
  'gallery_opened',
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

/** Only these payload keys are accepted; everything else is dropped. */
const ALLOWED_KEYS = new Set([
  'serviceSlug',
  'serviceGroup',
  'step',
  'stepIndex',
  'slotDate',
  'slotTime',
  'source',
  'placement',
  'errorCode',
  'photoId',
  'count',
  'isDemo',
]);

/** Keys that must never be forwarded, even if they slip through elsewhere. */
const FORBIDDEN = /name|phone|tel|email|comment|message|text|password|address/i;

export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

export function sanitize(payload: AnalyticsPayload = {}): AnalyticsPayload {
  const out: AnalyticsPayload = {};
  for (const [key, value] of Object.entries(payload)) {
    if (!ALLOWED_KEYS.has(key)) continue;
    if (FORBIDDEN.test(key)) continue;
    if (value === undefined || value === null) continue;
    if (typeof value === 'string') {
      // Guard against someone stuffing a phone number into an allowed key.
      if (/\d{7,}/.test(value.replace(/[\s()+-]/g, ''))) continue;
      out[key] = value.slice(0, 64);
    } else {
      out[key] = value;
    }
  }
  return out;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function track(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  if (typeof window === 'undefined') return;

  const clean = sanitize(payload);
  const entry = { event, ...clean, ts: Date.now() };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(entry);

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event, clean);
  }
}
