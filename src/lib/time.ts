/**
 * Venue-timezone date helpers.
 *
 * The workshop lives in one timezone (Asia/Almaty, UTC+5). Every slot date and
 * time in the database is a plain local wall-clock value ("2026-09-26",
 * "14:00") in that zone — never a UTC instant. This removes an entire class of
 * "booked at the wrong hour" bugs and keeps SQL comparisons trivial.
 */

import { scheduleConfig } from '@/data/schedule';

const TZ = scheduleConfig.timeZone;

const dateFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const timeFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** "YYYY-MM-DD" for the venue, given an instant. */
export function venueDate(instant: Date = new Date()): string {
  return dateFmt.format(instant);
}

/** "HH:MM" for the venue, given an instant. */
export function venueTime(instant: Date = new Date()): string {
  return timeFmt.format(instant);
}

/** Minutes since venue midnight for an instant. */
export function venueMinutes(instant: Date = new Date()): number {
  const [h, m] = venueTime(instant).split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Parse "YYYY-MM-DD" into a UTC-noon Date (safe for date arithmetic). */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12, 0, 0));
}

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(key: string, days: number): string {
  const d = parseDateKey(key);
  d.setUTCDate(d.getUTCDate() + days);
  return toDateKey(d);
}

/** Weekday index in the venue zone (0 = Sunday … 6 = Saturday). */
export function venueWeekday(key: string): number {
  const d = parseDateKey(key);
  // parseDateKey anchors at UTC noon, so the UTC weekday equals the local one.
  return d.getUTCDay();
}

const MONTHS_RU = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];
const MONTHS_RU_NOM = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];
const WEEKDAYS_RU = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const WEEKDAYS_RU_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

/** "26 сентября" */
export function formatDateRu(key: string): string {
  const [, m, d] = key.split('-').map(Number);
  return `${d} ${MONTHS_RU[(m ?? 1) - 1]}`;
}

/** "26 сентября 2026" */
export function formatDateRuFull(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return `${d} ${MONTHS_RU[(m ?? 1) - 1]} ${y}`;
}

/** "Сб, 26 сентября" */
export function formatDateRuWithWeekday(key: string): string {
  return `${WEEKDAYS_RU_SHORT[venueWeekday(key)] ?? ''}, ${formatDateRu(key)}`;
}

export function monthNameRu(monthIndex: number): string {
  return MONTHS_RU_NOM[monthIndex] ?? '';
}

export function weekdayNameRu(key: string, short = false): string {
  const idx = venueWeekday(key);
  return (short ? WEEKDAYS_RU_SHORT[idx] : WEEKDAYS_RU[idx]) ?? '';
}

/** Relative day label used in the date step: Сегодня / Завтра / weekday. */
export function relativeDayLabel(key: string, todayKey: string): string {
  if (key === todayKey) return 'Сегодня';
  if (key === addDays(todayKey, 1)) return 'Завтра';
  return weekdayNameRu(key, true);
}

/**
 * The next `count` bookable dates, starting today.
 * Working days are filtered by scheduleConfig (all 7 for this venue).
 */
export function bookableDates(count: number, now: Date = new Date()): string[] {
  const today = venueDate(now);
  const out: string[] = [];
  let cursor = today;
  for (let i = 0; i < count + 7 && out.length < count; i++) {
    const dow = venueWeekday(cursor);
    if (scheduleConfig.openDays.includes(dow)) out.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return out;
}

/** True when the slot is still far enough in the future to be booked. */
export function isSlotBookable(dateKey: string, time: string, now: Date = new Date()): boolean {
  const today = venueDate(now);
  if (dateKey < today) return false;
  if (dateKey > addDays(today, scheduleConfig.horizonDays)) return false;
  if (dateKey > today) return true;

  const [h, m] = time.split(':').map(Number);
  const slotMinutes = (h ?? 0) * 60 + (m ?? 0);
  return slotMinutes - venueMinutes(now) >= scheduleConfig.minLeadMinutes;
}
