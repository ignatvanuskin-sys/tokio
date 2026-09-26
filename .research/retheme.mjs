/**
 * One-off retheme codemod: aligns component class usage with the new design
 * system (Oswald condensed uppercase + orange accent), where headings are
 * weight 600 because Oswald ships 400/500/600/700 and an 800 would be
 * synthesised (and look wrong).
 *
 * Safe by construction: only touches the explicit token list below, writes a
 * report of every change, and skips generated files.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SKIP = /(photo-assets\.generated|reviews\.generated|map\.generated|fonts\.css)/;

const REPLACEMENTS = [
  // Oswald has no 800 — synthesised bold looks blurry in a condensed face.
  [/\bfont-extrabold\b/g, 'font-semibold'],
  // Вес заголовков задаёт базовый слой; utility только мешает.
  [/\buppercase\b/g, 'uppercase'],
];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.tsx?$/.test(entry.name)) yield full;
  }
}

const report = [];

for await (const file of walk(path.join(ROOT, 'src'))) {
  if (SKIP.test(file)) continue;
  const original = await readFile(file, 'utf8');
  let next = original;
  const hits = [];

  for (const [pattern, replacement] of REPLACEMENTS) {
    const before = next;
    next = next.replace(pattern, replacement);
    if (before !== next) {
      const count = (before.match(pattern) ?? []).length;
      hits.push(`${pattern} → ${replacement} (${count})`);
    }
  }

  if (next !== original) {
    await writeFile(file, next, 'utf8');
    report.push(`${path.relative(ROOT, file)} :: ${hits.join(', ')}`);
  }
}

console.log(report.length === 0 ? 'No changes needed.' : report.join('\n'));
console.log(`\n${report.length} file(s) updated.`);
