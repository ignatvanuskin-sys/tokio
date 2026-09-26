import { readFileSync, writeFileSync } from 'node:fs';

/**
 * The accent moved from red (#E0242F) to the reference orange (#FF5A1F).
 * These files bake the old colour literally, so they need the swap too.
 */
const FILES = [
  'scripts/build-og.mjs',
  'scripts/build-map.mjs',
  'src/app/layout.tsx',
  'src/app/glacier-none.ts', // placeholder, skipped if absent
];

// red family -> orange family (longest first so #FF3B47 is not partially matched)
const MAP = [
  ['#E0242F', '#FF5A1F'],
  ['#e0242f', '#ff5a1f'],
  ['#A8161F', '#CC4413'],
  ['#a8161f', '#cc4413'],
  ['#FF3B47', '#FF7A45'],
  ['#ff3b47', '#ff7a45'],
  ['#FF4A55', '#FF7A45'],
  ['#ff4a55', '#ff7a45'],
  ['rgba(224,36,47,', 'rgba(255,90,31,'],
  ['rgba(255,59,71,', 'rgba(255,122,69,'],
  ['#07080A', '#0B0C0E'],
  ['#07080a', '#0b0c0e'],
];

let touched = 0;

for (const file of FILES) {
  let source;
  try {
    source = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  let next = source;
  for (const [from, to] of MAP) next = next.split(from).join(to);
  if (next !== source) {
    writeFileSync(file, next, 'utf8');
    console.log(`recoloured: ${file}`);
    touched++;
  }
}

console.log(`\n${touched} file(s) updated.`);
