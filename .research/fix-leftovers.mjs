import { readFileSync, writeFileSync } from 'node:fs';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const GLOBAL = [
  ['Керей', 'Токио'],
  ['Автокомплекс', 'Автосервис'],
  ['автокомплекс', 'автосервис'],
  ['kerey', 'tokyo'],
  ['KEREY', 'TOKYO'],
];

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', '.research', '.vercel', 'public', 'data']);

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (/\.(ts|tsx|mjs|mts|js|json|md|example|css)$/.test(entry) || entry === '.env.example') yield full;
  }
}

let touched = 0;
for (const file of walk('.')) {
  let source;
  try {
    source = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  const before = source;
  let next = source;
  for (const [from, to] of GLOBAL) next = next.split(from).join(to);
  if (next !== before) {
    // package-lock.json is huge and must not be rewritten by this sweep.
    if (file.includes('package-lock')) continue;
    writeFileSync(file, next, 'utf8');
    console.log(`fixed: ${file}`);
    touched++;
  }
}
console.log(`\n${touched} file(s) updated.`);
