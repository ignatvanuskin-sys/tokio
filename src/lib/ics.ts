/**
 * Minimal RFC 5545 calendar file so the customer can add the visit to their
 * phone calendar straight from the success screen.
 *
 * The event is emitted as a floating local time (DTSTART without Z) because the
 * workshop's wall-clock time is what the customer agreed to — the phone then
 * shows it in the device's own zone, which is what people expect for an
 * appointment in their own city.
 */

import { business } from '@/data/business';
import { scheduleConfig } from '@/data/schedule';
import { toMinutes } from '@/data/schedule';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** "20260926T140000" (floating local time). */
function stamp(dateKey: string, time: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return `${y}${pad(m ?? 1)}${pad(d ?? 1)}T${pad(hh ?? 0)}${pad(mm ?? 0)}00`;
}

function escapeText(v: string): string {
  return v.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/** Folds long lines at 74 octets, as required by RFC 5545. */
function fold(line: string): string {
  if (line.length <= 74) return line;
  const chunks: string[] = [];
  let rest = line;
  chunks.push(rest.slice(0, 74));
  rest = rest.slice(74);
  while (rest.length > 0) {
    chunks.push(' ' + rest.slice(0, 73));
    rest = rest.slice(73);
  }
  return chunks.join('\r\n');
}

export function buildBookingIcs(params: {
  uid: string;
  slotDate: string;
  slotTime: string;
  serviceTitle: string;
  customerName?: string;
}): string {
  const start = stamp(params.slotDate, params.slotTime);
  const endMinutes = toMinutes(params.slotTime) + scheduleConfig.slotMinutes;
  const endTime = `${pad(Math.floor(endMinutes / 60))}:${pad(endMinutes % 60)}`;
  const end = stamp(params.slotDate, endTime);

  const title = `${business.name} — ${params.serviceTitle}`;
  const description =
    `Заявка на ${params.serviceTitle} в автосервисе «${business.name}».\n` +
    `Время ожидает подтверждения — мы позвоним по указанному номеру.\n` +
    `Телефон сервиса: ${business.phone.display}`;

  const location = `${business.address.full}, ${business.city}`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TOKYO Auto Service//Booking//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${params.uid}@tokyo-autoservice`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15)}Z`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeText(title)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(location)}`,
    `GEO:${business.geo.lat};${business.geo.lon}`,
    `URL:${business.instagram.url}`,
    'STATUS:TENTATIVE',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText('Напоминание: ' + title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ];

  return lines.map(fold).join('\r\n');
}
