/**
 * DEMO booking store — used ONLY when DATABASE_URL is not configured.
 *
 * What it is: a complete, honest implementation of the same domain rules as the
 * PostgreSQL store, persisted to `.data/demo-db.json`, so the whole site
 * (booking → admin → status changes) works end-to-end without a database.
 *
 * What it is NOT: a production backend. It cannot survive multiple app
 * instances (each process has its own copy of the file) and it has none of
 * Postgres' durability. In production `getStore()` refuses to use it — see
 * src/lib/booking/index.ts.
 *
 * Availability is computed from the real schedule model, never randomised.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { daySlotStarts, scheduleConfig } from '@/data/schedule';
import { isSlotBookable } from '@/lib/time';
import type {
  BookingFilter,
  BookingRecord,
  BookingStatus,
  BookingStore,
  CreateBookingInput,
  CreateBookingResult,
  DayAvailability,
  SlotAvailability,
} from './types';
import { BOOKING_STATUSES } from './types';

type DemoDb = {
  bookings: BookingRecord[];
  /** reservations keyed by `${date}|${time}` */
  reservations: Record<string, number>;
};

/**
 * Storage location. Overridable so the test suite can point at a scratch file
 * instead of the real demo database.
 */
const DB_PATH =
  process.env.DEMO_DB_PATH || path.join(process.cwd(), '.data', 'demo-db.json');

/** Simple promise chain — serialises every mutation, mirroring row locks. */
let mutex: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = mutex.then(fn, fn);
  mutex = run.catch(() => undefined);
  return run;
}

export class DemoBookingStore implements BookingStore {
  readonly backend = 'demo' as const;
  private db: DemoDb = { bookings: [], reservations: {} };
  private loaded = false;
  /**
   * Single-flight guard. Without it, N concurrent mutations each start their
   * own readFile, and the last one to resolve replaces `this.db` with stale
   * file content — silently losing reservations. This is precisely the bug the
   * concurrent-booking test is here to catch.
   */
  private loading: Promise<void> | null = null;

  async init(): Promise<void> {
    await this.load();
  }

  async health() {
    await this.load();
    return {
      ok: true,
      backend: this.backend,
      detail: `file store: ${DB_PATH} (${this.db.bookings.length} bookings) — DEMO ONLY`,
    };
  }

  private async load(): Promise<void> {
    if (this.loaded) return;
    if (!this.loading) this.loading = this.readFromDisk();
    await this.loading;
  }

  private async readFromDisk(): Promise<void> {
    try {
      const raw = await readFile(DB_PATH, 'utf8');
      const parsed = JSON.parse(raw) as DemoDb;
      this.db = {
        bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
        reservations: parsed.reservations ?? {},
      };
    } catch {
      this.db = { bookings: [], reservations: {} };
    }
    this.loaded = true;
  }

  /**
   * Within the write lock, re-read the file so the critical section operates on
   * the freshest state. Costs one tiny read per mutation and makes the demo
   * backend correct even if two store instances exist in one process.
   */
  private async reloadLocked(): Promise<void> {
    this.loading = null;
    this.loaded = false;
    await this.load();
  }

  private async persist(): Promise<void> {
    await mkdir(path.dirname(DB_PATH), { recursive: true });
    await writeFile(DB_PATH, JSON.stringify(this.db, null, 2), 'utf8');
  }

  private key(date: string, time: string): string {
    return `${date}|${time}`;
  }

  private takenOf(date: string, time: string): number {
    return this.db.reservations[this.key(date, time)] ?? 0;
  }

  /** Pure, synchronous availability computation — used inside the write lock. */
  private availabilitySync(dateKey: string, now: Date = new Date()): DayAvailability {
    const capacity = scheduleConfig.capacityPerSlot;
    const slots: SlotAvailability[] = daySlotStarts().map((time) => {
      const t = this.takenOf(dateKey, time);
      return {
        time,
        taken: t,
        capacity,
        available: t < capacity,
        bookable: isSlotBookable(dateKey, time, now),
      };
    });
    return {
      date: dateKey,
      timeZone: scheduleConfig.timeZone,
      slotMinutes: scheduleConfig.slotMinutes,
      slots,
    };
  }

  async availability(dateKey: string, now: Date = new Date()): Promise<DayAvailability> {
    await this.load();
    const capacity = scheduleConfig.capacityPerSlot;
    const slots: SlotAvailability[] = daySlotStarts().map((time) => {
      const t = this.takenOf(dateKey, time);
      return {
        time,
        taken: t,
        capacity,
        available: t < capacity,
        bookable: isSlotBookable(dateKey, time, now),
      };
    });
    return {
      date: dateKey,
      timeZone: scheduleConfig.timeZone,
      slotMinutes: scheduleConfig.slotMinutes,
      slots,
    };
  }

  async createBooking(input: CreateBookingInput, now: Date = new Date()): Promise<CreateBookingResult> {
    return withLock(async () => {
      // Inside the lock: work from disk truth, not from a possibly-stale copy.
      await this.reloadLocked();

      if (!isSlotBookable(input.slotDate, input.slotTime, now)) {
        return {
          ok: false as const,
          code: 'slot_not_bookable' as const,
          message: 'Это время уже недоступно для записи. Выберите другой слот.',
          availability: this.availabilitySync(input.slotDate, now),
        };
      }

      // Idempotency first: a retried submission returns the original booking.
      const dup = this.db.bookings.find((b) => b.idempotencyKey === input.idempotencyKey);
      if (dup) return { ok: true as const, booking: dup, duplicate: true };

      const key = this.key(input.slotDate, input.slotTime);
      const taken = this.takenOf(input.slotDate, input.slotTime);
      if (taken >= scheduleConfig.capacityPerSlot) {
        return {
          ok: false as const,
          code: 'slot_taken' as const,
          message: 'Это время только что заняли. Выберите другой слот.',
          availability: this.availabilitySync(input.slotDate, now),
        };
      }

      const booking: BookingRecord = {
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        slotDate: input.slotDate,
        slotTime: input.slotTime,
        status: 'new',
        serviceSlug: input.serviceSlug,
        serviceTitle: input.serviceTitle,
        customerId: randomUUID(),
        customerName: input.name,
        customerPhone: input.phone,
        vehicleId:
          input.vehicleMake || input.vehicleModel || input.vehicleYear ? randomUUID() : null,
        vehicleMake: input.vehicleMake?.trim() || null,
        vehicleModel: input.vehicleModel?.trim() || null,
        vehicleYear: input.vehicleYear ?? null,
        comment: input.comment?.trim() || null,
        idempotencyKey: input.idempotencyKey,
        source: input.source ?? 'site',
      };

      this.db.reservations[key] = taken + 1;
      this.db.bookings.push(booking);
      await this.persist();
      return { ok: true as const, booking, duplicate: false };
    });
  }

  async listBookings(filter: BookingFilter): Promise<BookingRecord[]> {
    await this.load();
    return this.db.bookings
      .filter((b) => (filter.from ? b.slotDate >= filter.from : true))
      .filter((b) => (filter.to ? b.slotDate <= filter.to : true))
      .filter((b) => (filter.status ? b.status === filter.status : true))
      .filter((b) => (filter.serviceSlug ? b.serviceSlug === filter.serviceSlug : true))
      .sort(
        (a, b) =>
          a.slotDate.localeCompare(b.slotDate) ||
          a.slotTime.localeCompare(b.slotTime) ||
          a.createdAt.localeCompare(b.createdAt),
      );
  }

  async getBooking(id: string): Promise<BookingRecord | null> {
    await this.load();
    return this.db.bookings.find((b) => b.id === id) ?? null;
  }

  async setStatus(id: string, status: BookingStatus): Promise<BookingRecord | null> {
    return withLock(async () => {
      await this.reloadLocked();
      const booking = this.db.bookings.find((b) => b.id === id);
      if (!booking) return null;

      // Cancelling frees the slot; re-activating re-takes it.
      const key = this.key(booking.slotDate, booking.slotTime);
      const wasHolding = booking.status !== 'cancelled';
      const willHold = status !== 'cancelled';
      if (wasHolding && !willHold) {
        this.db.reservations[key] = Math.max((this.db.reservations[key] ?? 1) - 1, 0);
      } else if (!wasHolding && willHold) {
        // Deliberately NOT clamped to capacity: un-cancelling is the owner
        // overriding the schedule, so the counter must reflect reality (2 held
        // in a 1-seat slot ⇒ the slot stays unavailable). Clamping here would
        // hide the overbooking and let a third booking slip in.
        this.db.reservations[key] = (this.db.reservations[key] ?? 0) + 1;
      }

      booking.status = status;
      await this.persist();
      return booking;
    });
  }

  async countsByStatus(from: string, to: string): Promise<Record<BookingStatus, number>> {
    await this.load();
    const out = Object.fromEntries(BOOKING_STATUSES.map((s) => [s, 0])) as Record<BookingStatus, number>;
    for (const b of this.db.bookings) {
      if (b.slotDate >= from && b.slotDate <= to) out[b.status] += 1;
    }
    return out;
  }
}

export const demoStore = new DemoBookingStore();
