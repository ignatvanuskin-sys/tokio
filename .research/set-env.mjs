import { writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

/**
 * Set Vercel env vars WITHOUT a BOM.
 *
 * Piping a value into `vercel env add` from PowerShell 5.1 prepends a UTF-8 BOM,
 * so NEXT_PUBLIC_SITE_URL became "\uFEFFhttps://…" — and since the app does
 * `new URL(siteUrl)` at build time, the production build failed with
 * "Failed to collect page data for /_not-found".
 *
 * Here the value is written to a plain ASCII file and fed in through cmd's
 * redirection, which emits no BOM.
 */

const VARS = [
  { name: 'NEXT_PUBLIC_SITE_URL', value: 'https://tokio-two.vercel.app', env: 'production' },
  { name: 'ALLOW_DEMO_STORE', value: '1', env: 'production' },
];

function run(args, { input } = {}) {
  return spawnSync('vercel', args, {
    shell: true,
    encoding: 'utf8',
    input,
    stdio: input === undefined ? ['ignore', 'pipe', 'pipe'] : ['pipe', 'pipe', 'pipe'],
  });
}

for (const v of VARS) {
  const rm = run(['env', 'rm', v.name, v.env, '--yes']);
  console.log(`rm ${v.name}: ${(rm.stdout || rm.stderr || '').trim().split('\n').slice(-1)[0]}`);

  // ASCII-only payload file, written by Node (never adds a BOM).
  const tmp = `.research/env-${v.name}.txt`;
  writeFileSync(tmp, v.value, { encoding: 'ascii' });

  const add = run(['env', 'add', v.name, v.env], { input: v.value + '\n' });
  const out = (add.stdout || '').trim().split('\n').slice(-1)[0] ?? '';
  console.log(`add ${v.name}: ${out}`);
}

const ls = run(['env', 'ls', 'production']);
console.log('\n=== env ls production ===');
console.log((ls.stdout || '').trim());
