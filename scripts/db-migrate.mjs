/**
 * Apply SQL migrations in db/migrations, in filename order, exactly once each.
 *
 * Migrations are recorded in `schema_migrations`, and each migration runs inside
 * its own transaction — a failure leaves the database untouched rather than
 * half-migrated.
 *
 * Usage: npm run db:migrate
 * Requires: DATABASE_URL
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const ROOT = process.cwd();
const MIGRATIONS_DIR = path.join(ROOT, 'db', 'migrations');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    'DATABASE_URL is not set.\n' +
      'Example: postgresql://user:password@host:5432/tokyo?sslmode=require\n' +
      'Put it in .env (see .env.example) or export it before running.',
  );
  process.exit(1);
}

const ssl = /sslmode=require|neon\.tech|supabase\.co|render\.com|amazonaws\.com/.test(connectionString)
  ? { rejectUnauthorized: false }
  : undefined;

const client = new pg.Client({ connectionString, ssl });

async function main() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const applied = new Set(
    (await client.query('SELECT name FROM schema_migrations')).rows.map((r) => r.name),
  );

  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();

  if (files.length === 0) {
    console.warn('No .sql files found in db/migrations — nothing to do.');
  }

  let ran = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  · ${file} (already applied)`);
      continue;
    }

    const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
    process.stdout.write(`  → ${file} … `);

    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log('ok');
      ran++;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      console.error(`\nFAILED: ${file}\n${err.message}`);
      process.exitCode = 1;
      break;
    }
  }

  console.log(`\nMigrations applied: ${ran}. Total known: ${files.length}.`);
  await client.end();
}

main().catch(async (err) => {
  console.error('db-migrate failed:', err.message);
  await client.end().catch(() => {});
  process.exit(1);
});
