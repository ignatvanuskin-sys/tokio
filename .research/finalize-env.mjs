import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';

/**
 * ADMIN_SESSION_SECRET is a purely technical secret (it only signs the admin
 * cookie), so it is safe to generate here. ADMIN_PASSWORD, DATABASE_URL and the
 * Telegram credentials are NOT invented — they belong to the owner and are left
 * alone; the report lists exactly what still has to be supplied.
 *
 * Values are fed through stdin from Node (never piped through PowerShell, which
 * prepends a UTF-8 BOM and silently breaks the value).
 */

function run(args, input) {
  return spawnSync('vercel', args, {
    shell: true,
    encoding: 'utf8',
    input,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

const secret = randomBytes(48).toString('base64url');

const rm = run(['env', 'rm', 'ADMIN_SESSION_SECRET', 'production', '--yes']);
console.log('rm:', (rm.stdout || rm.stderr || '').trim().split('\n').slice(-1)[0]);

const add = run(['env', 'add', 'ADMIN_SESSION_SECRET', 'production'], secret + '\n');
console.log('add:', (add.stdout || '').trim().split('\n').slice(-1)[0] || 'ok');

console.log(`\ngenerated ADMIN_SESSION_SECRET length: ${secret.length}`);
console.log('(value intentionally not printed — read it from the Vercel dashboard if needed)');
