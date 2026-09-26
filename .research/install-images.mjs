/**
 * Install the real «Токио» photography into public/images and remove the
 * Керей demo stock images so nothing fake ships.
 *
 * Source: the 17 photos downloaded from the company's public 2GIS gallery and
 * pre-optimised to WebP at several widths (.research/keep/photos/pNN-<w>.webp).
 */
import { mkdirSync, copyFileSync, rmSync, readdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';

const KEEP = '.research/keep';
const SRC = path.join(KEEP, 'photos');
const OUT = 'public/images';
const PHOTOS_OUT = path.join(OUT, 'photos');

mkdirSync(PHOTOS_OUT, { recursive: true });

/** Largest available variant at or below `prefer`, else the largest there is. */
function variant(id, prefer) {
  const files = readdirSync(SRC)
    .filter((f) => f.startsWith(`${id}-`) && f.endsWith('.webp'))
    .map((f) => ({ f, w: Number(f.replace(`${id}-`, '').replace('.webp', '')) }))
    .filter((x) => Number.isFinite(x.w))
    .sort((a, b) => a.w - b.w);

  if (files.length === 0) return null;
  const atOrBelow = [...files].reverse().find((x) => x.w <= prefer);
  return path.join(SRC, (atOrBelow ?? files[files.length - 1]).f);
}

// --- hero ------------------------------------------------------------------
const heroDesktop = variant('p08', 1920);
const heroMobile = variant('p03', 960);
if (heroDesktop) {
  copyFileSync(heroDesktop, path.join(OUT, 'hero.webp'));
  console.log(`hero.webp        <- ${path.basename(heroDesktop)}`);
}
if (heroMobile) {
  copyFileSync(heroMobile, path.join(OUT, 'hero-mobile.webp'));
  console.log(`hero-mobile.webp <- ${path.basename(heroMobile)}`);
}

// --- og --------------------------------------------------------------------
if (existsSync(path.join(KEEP, 'og.jpg'))) {
  copyFileSync(path.join(KEEP, 'og.jpg'), path.join(OUT, 'og.jpg'));
  console.log('og.jpg           <- regenerated Токио preview (1200x630)');
}

// --- gallery: all 17 -------------------------------------------------------
let installed = 0;
for (let i = 1; i <= 17; i++) {
  const id = `p${String(i).padStart(2, '0')}`;
  const src = variant(id, 1440);
  if (!src) {
    console.log(`  ! ${id}: no variant found`);
    continue;
  }
  copyFileSync(src, path.join(PHOTOS_OUT, `${id}.webp`));
  installed++;
}
console.log(`gallery photos   <- ${installed} files into public/images/photos/`);

// --- remove the Керей demo stock images ------------------------------------
const DEMO = [
  'hero.jpg',
  'hero-mobile.jpg',
  'gallery-service-bay.jpg',
  'gallery-diagnostics.jpg',
  'gallery-suspension.jpg',
  'gallery-tools.jpg',
  'gallery-wheel.jpg',
  'gallery-night.jpg',
];
let removed = 0;
for (const f of DEMO) {
  const target = path.join(OUT, f);
  if (existsSync(target)) {
    rmSync(target);
    removed++;
  }
}
console.log(`\nremoved ${removed} demo stock image(s)`);

// --- report ----------------------------------------------------------------
let bytes = 0;
for (const f of readdirSync(OUT, { recursive: true })) {
  const full = path.join(OUT, String(f));
  if (existsSync(full) && statSync(full).isFile()) bytes += statSync(full).size;
}
console.log(`public/images total: ${(bytes / 1024 / 1024).toFixed(2)} MB`);
console.log('contents:', readdirSync(OUT, { recursive: true }).filter((f) => String(f).endsWith('.webp') || String(f).endsWith('.jpg')).length, 'image files');
