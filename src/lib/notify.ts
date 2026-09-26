/**
 * Owner notifications.
 *
 * Channel: Telegram Bot API (the channel requested for this project).
 *
 * HONESTY CONTRACT — no fake "sent" states:
 *  · If TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID are missing, the function does
 *    NOT pretend to deliver. It returns `{ delivered: false, reason: 'not_configured' }`
 *    and logs one clear line. The booking is still saved — notifications are a
 *    side channel, never a precondition.
 *  · If Telegram rejects the request, the real error from the API is returned
 *    and logged. We never swallow it into a success.
 *
 * To go live the owner only has to fill the two env vars — see README
 * §"Подключение Telegram".
 */

import { business } from '@/data/business';
import type { BookingRecord } from './booking/types';

export type NotifyResult = {
  delivered: boolean;
  channel: 'telegram' | 'none';
  reason?: 'not_configured' | 'api_error' | 'network_error';
  detail?: string;
};

/** Escapes the subset of characters Telegram's HTML parse mode cares about. */
function esc(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const MONTHS_RU = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

function humanDate(key: string): string {
  const [, m, d] = key.split('-').map(Number);
  return `${d} ${MONTHS_RU[(m ?? 1) - 1]}`;
}

export function buildOwnerMessage(b: BookingRecord): string {
  const vehicle =
    [b.vehicleMake, b.vehicleModel, b.vehicleYear ? String(b.vehicleYear) : null]
      .filter(Boolean)
      .join(' ') || 'не указано';

  const lines = [
    '🚗 <b>Новая запись с сайта</b>',
    '',
    `<b>Клиент:</b> ${esc(b.customerName)}`,
    `<b>Телефон:</b> ${esc(b.customerPhone)}`,
    `<b>Авто:</b> ${esc(vehicle)}`,
    '',
    `<b>Услуга:</b> ${esc(b.serviceTitle)}`,
    `<b>Дата:</b> ${esc(humanDate(b.slotDate))}`,
    `<b>Время:</b> ${esc(b.slotTime)}`,
  ];

  if (b.comment) lines.push('', `<b>Комментарий:</b>`, esc(b.comment));

  lines.push('', `<i>${esc(business.name)} · заявка #${esc(b.id.slice(0, 8))}</i>`);
  return lines.join('\n');
}

export async function notifyOwnerAboutBooking(booking: BookingRecord): Promise<NotifyResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn(
      '[notify] Telegram is not configured (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID). ' +
        'Booking %s was saved but the owner was NOT notified.',
      booking.id,
    );
    return { delivered: false, channel: 'none', reason: 'not_configured' };
  }

  const text = buildOwnerMessage(booking);

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      // Never let a slow bot API stall the customer's request.
      signal: AbortSignal.timeout(8000),
    });

    const json = (await res.json().catch(() => null)) as
      | { ok?: boolean; description?: string }
      | null;

    if (!res.ok || !json?.ok) {
      const detail = json?.description ?? `HTTP ${res.status}`;
      console.error('[notify] Telegram rejected the message:', detail);
      return { delivered: false, channel: 'telegram', reason: 'api_error', detail };
    }

    return { delivered: true, channel: 'telegram' };
  } catch (err) {
    const detail = (err as Error).message;
    console.error('[notify] Telegram request failed:', detail);
    return { delivered: false, channel: 'telegram', reason: 'network_error', detail };
  }
}

/**
 * Optional WhatsApp deep-link fallback for the OWNER's own device — returns a
 * wa.me link with the same summary. Used in the admin UI ("отправить себе"),
 * never to claim an automatic delivery.
 */
export function ownerWhatsAppFallbackUrl(booking: BookingRecord): string {
  const plain = buildOwnerMessage(booking)
    .replace(/<\/?b>/g, '*')
    .replace(/<\/?i>/g, '_')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  return `https://wa.me/${business.whatsapp.number}?text=${encodeURIComponent(plain)}`;
}

export function notificationConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}
