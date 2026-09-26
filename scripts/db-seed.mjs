/**
 * Seed REFERENCE data only: the service catalogue and the opening hours.
 *
 * Run AFTER `npm run db:migrate`.
 *
 * Deliberately does NOT create sample bookings, fake customers or demo reviews.
 * The board must only ever show real customer requests — a seeded fake booking
 * is exactly the kind of thing that ends up confusing a real workshop.
 *
 * Usage: npm run db:seed
 * Requires: DATABASE_URL
 */
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import pg from 'pg';

const ROOT = process.cwd();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set. See .env.example.');
  process.exit(1);
}

const ssl = /sslmode=require|neon\.tech|supabase\.co|render\.com|amazonaws\.com/.test(connectionString)
  ? { rejectUnauthorized: false }
  : undefined;

/**
 * The service catalogue lives in TypeScript so the site and the schema can never
 * disagree. We compile just that file with esbuild-free tsc-to-temp, then import
 * it — simpler than duplicating the list here.
 */
async function loadServices() {
  const tsPath = path.join(ROOT, 'src', 'data', 'services.ts');
  const source = await readFile(tsPath, 'utf8');

  // Extract the literal service objects without pulling in the whole toolchain:
  // take the array literal and evaluate it with a tiny transform.
  const start = source.indexOf('export const services: Service[] = [');
  if (start === -1) throw new Error('Could not locate the services array in src/data/services.ts');
  const arrayStart = source.indexOf('[', start);
  const arrayEnd = source.indexOf('\n];', arrayStart);
  if (arrayEnd === -1) throw new Error('Could not locate the end of the services array');
  const literal = source.slice(arrayStart, arrayEnd + 2);

  // The literal is plain data (no imports, no function calls) so a constrained
  // Function() evaluation is safe here and keeps the script dependency-free.
  // eslint-disable-next-line no-new-func
  const services = new Function(`return ${literal}`)();

  return services.map((s) => ({
    slug: s.slug,
    title: s.title,
    group: s.group,
    sourceRef: s.sourceRef ?? null,
  }));
}

const WEEKDAY_HOURS = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
  weekday,
  opensAt: '09:00',
  closesAt: '20:00',
  slotMinutes: Number(process.env.BOOKING_SLOT_MINUTES ?? 60),
  capacity: Number(process.env.BOOKING_CAPACITY_PER_SLOT ?? 1),
}));

async function main() {
  const client = new pg.Client({ connectionString, ssl });
  await client.connect();

  // 1) services ---------------------------------------------------------------
  const services = await loadServices();
  await client.query('BEGIN');
  for (const s of services) {
    await client.query(
      `INSERT INTO services (slug, title, service_group, is_active, source_ref, updated_at)
       VALUES ($1, $2, $3, true, $4, now())
       ON CONFLICT (slug) DO UPDATE
         SET title = EXCLUDED.title,
             service_group = EXCLUDED.service_group,
             is_active = EXCLUDED.is_active,
             source_ref = EXCLUDED.source_ref,
             updated_at = now()`,
      [s.slug, s.title, s.group, s.sourceRef],
    );
  }
  await client.query('COMMIT');
  console.log(`  ✓ services upserted: ${services.length}`);

  // 2) working hours ----------------------------------------------------------
  await client.query('BEGIN');
  for (const h of WEEKDAY_HOURS) {
    await client.query(
      `INSERT INTO working_hours (weekday, opens_at, closes_at, is_closed, slot_minutes, capacity, valid_from)
       VALUES ($1, $2, $3, false, $4, $5, DATE '2000-01-01')
       ON CONFLICT (weekday, valid_from) DO UPDATE
         SET opens_at = EXCLUDED.opens_at,
             closes_at = EXCLUDED.closes_at,
             is_closed = EXCLUDED.is_closed,
             slot_minutes = EXCLUDED.slot_minutes,
             capacity = EXCLUDED.capacity`,
      [h.weekday, h.opensAt, h.closesAt, h.slotMinutes, h.capacity],
    );
  }
  await client.query('COMMIT');
  console.log(`  ✓ working_hours upserted: ${WEEKDAY_HOURS.length} days (09:00–20:00)`);

  console.log('\nReference data seeded. No sample bookings were created — on purpose.');
  await client.end();
}

main().catch(async (err) => {
  console.error('db-seed failed:', err.message);
  process.exit(1);
});
