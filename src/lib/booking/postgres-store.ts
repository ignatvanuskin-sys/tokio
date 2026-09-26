/**
 * PostgreSQL booking store — the PRODUCTION backend.
 *
 * Concurrency contract (why double booking is impossible):
 *   `schedule_slots` has PRIMARY KEY (slot_date, slot_time) and a `taken`
 *   counter. Reserving a seat is a single atomic statement:
 *
 *     INSERT … ON CONFLICT (slot_date, slot_time)
 *       DO UPDATE SET taken = schedule_slots.taken + 1
 *       WHERE schedule_slots.taken < schedule_slots.capacity
 *     RETURNING taken
 *
 *   Postgres takes a row lock for the conflicting row, so concurrent
 *   transactions serialise on it. When the slot is full the `WHERE` fails,
 *   the statement returns 0 rows, and we return "slot taken" — no second
 *   booking, no race window, no lost update.
 *
 *   The whole reservation runs inside a transaction together with the booking
 *   INSERT; if anything fails we roll back and the counter is never leaked.
 *
 * Idempotency:
 *   `bookings.idempotency_key` has a UNIQUE index. A retried submission (double
 *   click, flaky network, browser retry) hits the unique violation, and we
 *   return the original booking instead of creating a second one.
 */

import { Pool, type PoolClient } from 'pg';
import { daySlotStarts, scheduleConfig } from '@/data/schedule';
import { isSlotBookable, venueDate } from '@/lib/time';
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

let pool: Pool | null = null;

function getPool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');
  pool = new Pool({
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    // Managed Postgres (Neon/Supabase/RDS) almost always terminates TLS here.
    ssl: /sslmode=require|neon\.tech|supabase\.co|render\.com|amazonaws\.com/.test(connectionString)
      ? { rejectUnauthorized: false }
      : undefined,
  });
  pool.on('error', (err) => console.error('[pg] idle client error', err));
  return pool;
}

type BookingRow = {
  id: string;
  created_at: Date;
  slot_date: Date | string;
  slot_time: string;
  status: BookingStatus;
  service_slug: string;
  service_title: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  vehicle_id: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  comment: string | null;
  idempotency_key: string;
  source: string;
};

const SELECT = `
  SELECT b.id, b.created_at, b.slot_date, b.slot_time, b.status,
         b.service_slug, b.service_title,
         b.customer_id, c.name AS customer_name, c.phone AS customer_phone,
         b.vehicle_id, v.make AS vehicle_make, v.model AS vehicle_model, v.year AS vehicle_year,
         b.comment, b.idempotency_key, b.source
    FROM bookings b
    JOIN customers c ON c.id = b.customer_id
    LEFT JOIN vehicles v ON v.id = b.vehicle_id
`;

function toDateKey(value: Date | string): string {
  if (typeof value === 'string') return value.slice(0, 10);
  // pg returns DATE as a JS Date at local midnight; read the UTC parts to
  // avoid shifting the calendar day.
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(
    value.getDate(),
  ).padStart(2, '0')}`;
}

function mapRow(r: BookingRow): BookingRecord {
  return {
    id: r.id,
    createdAt: new Date(r.created_at).toISOString(),
    slotDate: toDateKey(r.slot_date),
    slotTime: r.slot_time.slice(0, 5),
    status: r.status,
    serviceSlug: r.service_slug,
    serviceTitle: r.service_title,
    customerId: r.customer_id,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    vehicleId: r.vehicle_id,
    vehicleMake: r.vehicle_make,
    vehicleModel: r.vehicle_model,
    vehicleYear: r.vehicle_year,
    comment: r.comment,
    idempotencyKey: r.idempotency_key,
    source: r.source,
  };
}

async function takenByTime(client: PoolClient | Pool, dateKey: string): Promise<Map<string, number>> {
  const { rows } = await client.query<{ slot_time: string; taken: number }>(
    `SELECT slot_time, taken FROM schedule_slots WHERE slot_date = $1`,
    [dateKey],
  );
  return new Map(rows.map((r) => [r.slot_time.slice(0, 5), r.taken]));
}

export class PostgresBookingStore implements BookingStore {
  readonly backend = 'postgres' as const;

  async init(): Promise<void> {
    // Connectivity check only — schema is owned by db/migrations.
    await getPool().query('SELECT 1');
  }

  async health() {
    try {
      const { rows } = await getPool().query<{ now: Date }>('SELECT now() AS now');
      return { ok: true, backend: this.backend, detail: `db time ${rows[0]?.now?.toISOString()}` };
    } catch (err) {
      return { ok: false, backend: this.backend, detail: (err as Error).message };
    }
  }

  async availability(dateKey: string, now: Date = new Date()): Promise<DayAvailability> {
    const pool = getPool();
    const taken = await takenByTime(pool, dateKey);

    const slots: SlotAvailability[] = daySlotStarts().map((time) => {
      const t = taken.get(time) ?? 0;
      const capacity = scheduleConfig.capacityPerSlot;
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
    const pool = getPool();

    if (!isSlotBookable(input.slotDate, input.slotTime, now)) {
      return {
        ok: false,
        code: 'slot_not_bookable',
        message: 'Это время уже недоступно для записи. Выберите другой слот.',
        availability: await this.availability(input.slotDate, now),
      };
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 0) Idempotency — has this exact submission already landed?
      const existing = await client.query<{ id: string }>(
        `SELECT id FROM bookings WHERE idempotency_key = $1`,
        [input.idempotencyKey],
      );
      if (existing.rows[0]) {
        const found = await client.query<BookingRow>(
          `${SELECT} WHERE b.idempotency_key = $1`,
          [input.idempotencyKey],
        );
        await client.query('COMMIT');
        const row = found.rows[0];
        if (row) return { ok: true, booking: mapRow(row), duplicate: true };
      }

      // 1) Atomically reserve capacity for the slot.
      const reserve = await client.query<{ taken: number }>(
        `INSERT INTO schedule_slots (slot_date, slot_time, taken, capacity)
         VALUES ($1, $2, 1, $3)
         ON CONFLICT (slot_date, slot_time)
         DO UPDATE SET taken = schedule_slots.taken + 1, updated_at = now()
         WHERE schedule_slots.taken < schedule_slots.capacity
         RETURNING taken`,
        [input.slotDate, input.slotTime, scheduleConfig.capacityPerSlot],
      );

      if (reserve.rowCount === 0) {
        await client.query('ROLLBACK');
        return {
          ok: false,
          code: 'slot_taken',
          message: 'Это время только что заняли. Выберите другой слот.',
          availability: await this.availability(input.slotDate, now),
        };
      }

      // 2) Upsert the customer by phone (one customer per phone number).
      const customer = await client.query<{ id: string }>(
        `INSERT INTO customers (name, phone)
         VALUES ($1, $2)
         ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name, updated_at = now()
         RETURNING id`,
        [input.name, input.phone],
      );
      const customerId = customer.rows[0]?.id;
      if (!customerId) throw new Error('customer upsert returned no id');

      // 3) Vehicle (optional — the form allows skipping it).
      let vehicleId: string | null = null;
      const make = input.vehicleMake?.trim() || null;
      const model = input.vehicleModel?.trim() || null;
      const year = input.vehicleYear ?? null;
      if (make || model || year) {
        const vehicle = await client.query<{ id: string }>(
          `INSERT INTO vehicles (customer_id, make, model, year)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [customerId, make, model, year],
        );
        vehicleId = vehicle.rows[0]?.id ?? null;
      }

      // 4) The booking itself — ON CONFLICT idempotency_key makes a concurrent
      //    duplicate retry resolve to the same row instead of erroring out.
      const inserted = await client.query<{ id: string }>(
        `INSERT INTO bookings
           (slot_date, slot_time, status, service_slug, service_title,
            customer_id, vehicle_id, comment, idempotency_key, source)
         VALUES ($1, $2, 'new', $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (idempotency_key) DO NOTHING
         RETURNING id`,
        [
          input.slotDate,
          input.slotTime,
          input.serviceSlug,
          input.serviceTitle,
          customerId,
          vehicleId,
          input.comment ?? null,
          input.idempotencyKey,
          input.source ?? 'site',
        ],
      );

      let bookingId = inserted.rows[0]?.id;
      let duplicate = false;

      if (!bookingId) {
        // Someone with the same idempotency key won the race — release our
        // reservation and return their booking.
        duplicate = true;
        await client.query(
          `UPDATE schedule_slots SET taken = GREATEST(taken - 1, 0), updated_at = now()
            WHERE slot_date = $1 AND slot_time = $2`,
          [input.slotDate, input.slotTime],
        );
        const again = await client.query<BookingRow>(`${SELECT} WHERE b.idempotency_key = $1`, [
          input.idempotencyKey,
        ]);
        const row = again.rows[0];
        if (!row) throw new Error('idempotent retry lost the original booking');
        await client.query('COMMIT');
        return { ok: true, booking: mapRow(row), duplicate: true };
      }

      await client.query('COMMIT');

      const saved = await pool.query<BookingRow>(`${SELECT} WHERE b.id = $1`, [bookingId]);
      const row = saved.rows[0];
      if (!row) throw new Error('booking disappeared after commit');
      return { ok: true, booking: mapRow(row), duplicate };
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch {
        /* connection already gone */
      }
      console.error('[postgres-store] createBooking failed', err);
      return {
        ok: false,
        code: 'server_error',
        message: 'Не удалось сохранить заявку. Позвоните нам или напишите в WhatsApp.',
      };
    } finally {
      client.release();
    }
  }

  async listBookings(filter: BookingFilter): Promise<BookingRecord[]> {
    const where: string[] = [];
    const params: unknown[] = [];

    if (filter.from) {
      params.push(filter.from);
      where.push(`b.slot_date >= $${params.length}`);
    }
    if (filter.to) {
      params.push(filter.to);
      where.push(`b.slot_date <= $${params.length}`);
    }
    if (filter.status) {
      params.push(filter.status);
      where.push(`b.status = $${params.length}`);
    }
    if (filter.serviceSlug) {
      params.push(filter.serviceSlug);
      where.push(`b.service_slug = $${params.length}`);
    }

    const sql =
      `${SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''}` +
      ` ORDER BY b.slot_date ASC, b.slot_time ASC, b.created_at ASC LIMIT 1000`;

    const { rows } = await getPool().query<BookingRow>(sql, params);
    return rows.map(mapRow);
  }

  async getBooking(id: string): Promise<BookingRecord | null> {
    const { rows } = await getPool().query<BookingRow>(`${SELECT} WHERE b.id = $1`, [id]);
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async setStatus(id: string, status: BookingStatus): Promise<BookingRecord | null> {
    const updated = await getPool().query<{ id: string }>(
      `UPDATE bookings SET status = $2, updated_at = now() WHERE id = $1 RETURNING id`,
      [id, status],
    );
    if (!updated.rows[0]) return null;
    return this.getBooking(id);
  }

  async countsByStatus(from: string, to: string): Promise<Record<BookingStatus, number>> {
    const { rows } = await getPool().query<{ status: BookingStatus; n: string }>(
      `SELECT status, COUNT(*)::text AS n FROM bookings
        WHERE slot_date BETWEEN $1 AND $2 GROUP BY status`,
      [from, to],
    );
    const out = Object.fromEntries(BOOKING_STATUSES.map((s) => [s, 0])) as Record<BookingStatus, number>;
    for (const r of rows) out[r.status] = Number(r.n);
    return out;
  }
}

export const postgresStore = new PostgresBookingStore();
