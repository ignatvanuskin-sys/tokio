-- ============================================================================
-- 001_init.sql — TOKYO auto service booking schema (PostgreSQL 13+)
-- ============================================================================
-- Design notes
--
--  · Slot dates and times are stored as the VENUE's wall clock (Asia/Almaty),
--    never as UTC instants. `slot_date` is a DATE and `slot_time` is a TIME, so
--    SQL comparisons and "today" queries are unambiguous.
--
--  · `schedule_slots` is the concurrency guard. It holds one row per
--    (date, time) with a `taken` counter and a `capacity`. Reserving a seat is
--    a single atomic INSERT … ON CONFLICT DO UPDATE … WHERE taken < capacity
--    (see src/lib/booking/postgres-store.ts). Postgres serialises concurrent
--    transactions on the conflicting row, so two simultaneous requests for the
--    last seat can never both succeed.
--
--  · Idempotency is enforced by a UNIQUE index on bookings.idempotency_key, so
--    a retried submission (double click, flaky network, browser replay) returns
--    the original booking instead of creating a duplicate.
--
--  · Money: no prices are stored because none are published. The schema allows
--    adding them later (see the commented columns on `bookings`).
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- gen_random_uuid()

-- --- customers ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  -- Stored in E.164, e.g. +77789988877. Unique: one record per phone number.
  phone       TEXT        NOT NULL CHECK (phone ~ '^\+[1-9][0-9]{7,14}$'),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS customers_phone_key ON customers (phone);

-- --- vehicles ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  make        TEXT CHECK (char_length(make) <= 60),
  model       TEXT CHECK (char_length(model) <= 80),
  year        SMALLINT CHECK (year IS NULL OR (year BETWEEN 1950 AND 2100)),
  plate       TEXT CHECK (char_length(plate) <= 20),
  vin         TEXT CHECK (char_length(vin) <= 24),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vehicles_customer_idx ON vehicles (customer_id);

-- --- services ----------------------------------------------------------------
-- Mirrors src/data/services.ts so the DB can be joined for reporting later.
CREATE TABLE IF NOT EXISTS services (
  slug          TEXT PRIMARY KEY,
  title         TEXT         NOT NULL,
  service_group TEXT         NOT NULL,
  is_active     BOOLEAN      NOT NULL DEFAULT true,
  -- NULL on purpose: the workshop publishes no prices.
  price_from    NUMERIC(12,2),
  currency      TEXT         NOT NULL DEFAULT 'KZT',
  source_ref    TEXT,
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- --- schedule: recurring opening hours ---------------------------------------
-- SOURCE: 2GIS — open daily 09:00–20:00.
CREATE TABLE IF NOT EXISTS working_hours (
  id          SMALLSERIAL PRIMARY KEY,
  -- 0 = Sunday … 6 = Saturday (matches JavaScript's Date.getDay())
  weekday     SMALLINT  NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  opens_at    TIME      NOT NULL,
  closes_at   TIME      NOT NULL,
  is_closed   BOOLEAN   NOT NULL DEFAULT false,
  slot_minutes SMALLINT NOT NULL DEFAULT 60 CHECK (slot_minutes BETWEEN 15 AND 480),
  capacity    SMALLINT  NOT NULL DEFAULT 1  CHECK (capacity >= 1),
  valid_from  DATE      NOT NULL DEFAULT DATE '2000-01-01',
  valid_to    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT working_hours_order CHECK (closes_at > opens_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS working_hours_unique
  ON working_hours (weekday, valid_from);

-- --- schedule: days off / shortened days -------------------------------------
CREATE TABLE IF NOT EXISTS time_off (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  off_date   DATE NOT NULL,
  -- NULL = the whole day is closed.
  opens_at   TIME,
  closes_at  TIME,
  reason     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT time_off_order CHECK (
    (opens_at IS NULL AND closes_at IS NULL) OR (closes_at > opens_at)
  )
);

CREATE INDEX IF NOT EXISTS time_off_date_idx ON time_off (off_date);

-- --- schedule_slots: per-slot capacity reservations --------------------------
CREATE TABLE IF NOT EXISTS schedule_slots (
  slot_date  DATE      NOT NULL,
  slot_time  TIME      NOT NULL,
  taken      SMALLINT  NOT NULL DEFAULT 0 CHECK (taken >= 0),
  capacity   SMALLINT  NOT NULL DEFAULT 1 CHECK (capacity >= 1),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (slot_date, slot_time),
  CONSTRAINT schedule_slots_not_overbooked CHECK (taken <= capacity)
);

-- --- bookings ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date      DATE NOT NULL,
  slot_time      TIME NOT NULL,

  status         TEXT NOT NULL DEFAULT 'new'
                 CHECK (status IN ('new','confirmed','done','cancelled')),

  service_slug   TEXT NOT NULL REFERENCES services(slug) ON UPDATE CASCADE,
  -- Denormalised snapshot: if a service is renamed later, the historical
  -- booking still shows what was actually agreed.
  service_title  TEXT NOT NULL,

  customer_id    UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  vehicle_id     UUID REFERENCES vehicles(id) ON DELETE SET NULL,

  comment        TEXT CHECK (comment IS NULL OR char_length(comment) <= 1000),

  -- Idempotency: the client sends a UUID with each submission attempt.
  idempotency_key TEXT NOT NULL CHECK (char_length(idempotency_key) BETWEEN 8 AND 100),

  source         TEXT NOT NULL DEFAULT 'site',

  -- Reserved for when the owner supplies a real price list:
  -- price_estimate NUMERIC(12,2),
  -- price_final    NUMERIC(12,2),

  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The idempotency guard. A retry hits this index and resolves to the original row.
CREATE UNIQUE INDEX IF NOT EXISTS bookings_idempotency_key_key
  ON bookings (idempotency_key);

CREATE INDEX IF NOT EXISTS bookings_slot_idx  ON bookings (slot_date, slot_time);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings (status, slot_date);
CREATE INDEX IF NOT EXISTS bookings_customer_idx ON bookings (customer_id);

-- --- booking_events: audit trail --------------------------------------------
-- Who changed what, when — plus notification delivery attempts. Never contains
-- anything the customer did not type themselves.
CREATE TABLE IF NOT EXISTS booking_events (
  id         BIGSERIAL PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  event      TEXT NOT NULL,
  payload    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS booking_events_booking_idx ON booking_events (booking_id, created_at DESC);

-- --- updated_at maintenance --------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS customers_updated_at ON customers;
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS vehicles_updated_at ON vehicles;
CREATE TRIGGER vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS bookings_updated_at ON bookings;
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- --- status change audit -----------------------------------------------------
CREATE OR REPLACE FUNCTION log_booking_status_change() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO booking_events (booking_id, event, payload)
    VALUES (NEW.id, 'status_changed',
            jsonb_build_object('from', OLD.status, 'to', NEW.status));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bookings_status_audit ON bookings;
CREATE TRIGGER bookings_status_audit AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION log_booking_status_change();

-- --- reporting view: today's board ------------------------------------------
CREATE OR REPLACE VIEW v_bookings_full AS
SELECT
  b.id,
  b.slot_date,
  b.slot_time,
  b.status,
  b.service_slug,
  b.service_title,
  c.name  AS customer_name,
  c.phone AS customer_phone,
  v.make  AS vehicle_make,
  v.model AS vehicle_model,
  v.year  AS vehicle_year,
  b.comment,
  b.created_at
FROM bookings b
JOIN customers c ON c.id = b.customer_id
LEFT JOIN vehicles v ON v.id = b.vehicle_id;

COMMIT;
