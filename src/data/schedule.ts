/**
 * ============================================================================
 * BOOKING SCHEDULE MODEL
 * ============================================================================
 *
 * CONFIRMED (SOURCE: 2GIS): the workshop is open EVERY DAY, 09:00–20:00.
 *   → `opensAt` / `closesAt` / `openDays` below come straight from the card.
 *
 * NOT PUBLISHED ANYWHERE (ASSUMPTION — the owner MUST confirm before launch):
 *   · `slotMinutes`      — length of one booking slot
 *   · `capacityPerSlot`  — how many cars the workshop accepts per slot
 *   · `minLeadMinutes`   — how soon before a slot online booking closes
 *   · `horizonDays`      — how far ahead customers can book
 * These four are operational choices, not business facts, so they are
 * configurable through environment variables and never presented to the
 * customer as a promise published by the workshop.
 * ============================================================================
 */

function int(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : fallback;
}

export const scheduleConfig = {
  /** IANA zone of the venue. Kokshetau is on Asia/Almaty (UTC+5). */
  timeZone: process.env.VENUE_TIMEZONE || 'Asia/Almaty',

  /** SOURCE: 2GIS — open daily. */
  openDays: [0, 1, 2, 3, 4, 5, 6] as readonly number[],

  /** SOURCE: 2GIS — "Ежедневно с 09:00 до 20:00". */
  opensAt: '09:00',
  closesAt: '20:00',

  /** ASSUMPTION — one hour per booking slot. */
  slotMinutes: int(process.env.BOOKING_SLOT_MINUTES, 60),

  /** ASSUMPTION — one car per slot (prevents promising capacity we don't know). */
  capacityPerSlot: int(process.env.BOOKING_CAPACITY_PER_SLOT, 1),

  /** ASSUMPTION — a slot can be booked until 30 minutes before it starts. */
  minLeadMinutes: int(process.env.BOOKING_MIN_LEAD_MINUTES, 30),

  /** ASSUMPTION — bookings open 30 days ahead. */
  horizonDays: int(process.env.BOOKING_HORIZON_DAYS, 30),
} as const;

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * All slot start times for a working day, e.g. ["09:00","10:00",…,"19:00"].
 * The last slot starts late enough to finish before closing.
 */
export function daySlotStarts(): string[] {
  const start = toMinutes(scheduleConfig.opensAt);
  const close = toMinutes(scheduleConfig.closesAt);
  const step = scheduleConfig.slotMinutes;
  const out: string[] = [];
  for (let t = start; t + step <= close; t += step) out.push(toHHMM(t));
  return out;
}

export function isWorkingDay(date: Date): boolean {
  return scheduleConfig.openDays.includes(date.getDay());
}

/** Max simultaneous bookings a slot can hold. */
export const capacityPerSlot = scheduleConfig.capacityPerSlot;
