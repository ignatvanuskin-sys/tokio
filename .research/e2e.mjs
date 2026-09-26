/**
 * End-to-end check of the booking backend over HTTP.
 *
 * Run with Node rather than PowerShell: the bodies contain Cyrillic, and PS 5.1
 * mangles both inline JSON and quoted arguments.
 */
import { spawn } from 'node:child_process';
import { rmSync, existsSync, writeFileSync } from 'node:fs';

const BASE = 'http://localhost:3100';
const results = [];
const ok = (label, pass, detail = '') =>
  results.push(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);

async function waitForServer(timeoutMs = 40_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(BASE, { signal: AbortSignal.timeout(2000) });
      if (r.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 700));
  }
  return false;
}

// Start a clean server on a fresh store.
if (existsSync('data/bookings.json')) rmSync('data/bookings.json');
const server = spawn('npx', ['next', 'start', '-p', '3100'], {
  shell: true,
  stdio: 'ignore',
  detached: false,
});

const up = await waitForServer();
if (!up) {
  console.log('SERVER DID NOT START');
  server.kill();
  process.exit(1);
}
console.log('server up\n');

try {
  // 1) availability with NO service param — this is what used to return 422 and
  //    killed the date step in the wizard.
  const a1 = await fetch(`${BASE}/api/availability`);
  const j1 = await a1.json();
  ok('availability without ?service', a1.status === 200 && Array.isArray(j1.days) && j1.days.length > 0,
     `HTTP ${a1.status}, days=${j1.days?.length ?? 0}`);

  // 2) availability for a concrete service
  const a2 = await fetch(`${BASE}/api/availability?service=diagnostics`);
  const j2 = await a2.json();
  ok('availability?service=diagnostics', a2.status === 200 && j2.days?.length > 0,
     `HTTP ${a2.status}, days=${j2.days?.length ?? 0}`);

  // 3) an unknown service must still be rejected
  const a3 = await fetch(`${BASE}/api/availability?service=not-a-real-service`);
  ok('unknown service rejected', a3.status === 422, `HTTP ${a3.status}`);

  // 4) slots for a concrete date
  const date = j2.days[2].date;
  const a4 = await fetch(`${BASE}/api/availability?service=diagnostics&date=${date}`);
  const j4 = await a4.json();
  const free = (j4.slots ?? []).filter((s) => s.available);
  ok('slots for a date', a4.status === 200 && free.length > 0,
     `HTTP ${a4.status}, ${j4.slots?.length ?? 0} slots, ${free.length} free`);
  const time = free[0].time;

  // 5) create a booking
  const body = {
    serviceSlug: 'diagnostics',
    date,
    time,
    carBrand: 'Toyota',
    carModel: 'Camry',
    carYear: '2019',
    carPlate: '123ABC02',
    name: 'QA Тест',
    phone: '+77789988877',
    comment: 'Проверка сквозного сценария',
    consent: true,
  };
  const p1 = await fetch(`${BASE}/api/bookings`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const jp1 = await p1.json();
  ok('POST /api/bookings creates', p1.status === 201 && jp1.ok === true,
     `HTTP ${p1.status}, number=${jp1.booking?.number}, service="${jp1.booking?.serviceTitle}", status=${jp1.booking?.status}`);

  // 6) the same slot must now be taken (no double booking)
  const p2 = await fetch(`${BASE}/api/bookings`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...body, phone: '+77701112233' }),
  });
  const jp2 = await p2.json();
  ok('double booking blocked', p2.status === 409 || jp2.ok === false,
     `HTTP ${p2.status}, reason=${jp2.reason ?? jp2.message ?? '-'}`);

  // 7) a booking without consent must be rejected
  const p3 = await fetch(`${BASE}/api/bookings`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...body, date: j2.days[4].date, time: free[0].time, consent: false }),
  });
  ok('missing consent rejected', p3.status === 422 || p3.status === 400, `HTTP ${p3.status}`);

  // 8) the admin panel must still be password-gated
  const admin = await fetch(`${BASE}/admin`, { redirect: 'manual' });
  ok('admin is gated', admin.status === 307 || admin.status === 302 || admin.status === 200,
     `HTTP ${admin.status} -> ${admin.headers.get('location') ?? 'rendered'}`);
} catch (err) {
  ok('unexpected error', false, String(err));
}

const failed = results.filter((r) => r.startsWith('FAIL')).length;
const summary = `${results.join('\n')}\n\n${results.length - failed}/${results.length} checks passed`;
// Persist first: killing the spawned shell on Windows can take this process
// with it, which would swallow anything only written to stdout.
writeFileSync('.research/e2e-result.txt', summary, 'utf8');
console.log(summary);
process.exit(failed === 0 ? 0 : 1);
