/**
 * Build the social preview image (/public/og.jpg, 1200×630).
 *
 * Uses one of the REAL workshop photographs (the wide interior shot) so a
 * WhatsApp / Telegram / Instagram / VK link preview shows the actual business,
 * not stock art.
 *
 * The headline text is rendered as SVG over the photo. Font note: the SVG uses
 * a generic family stack (DejaVu Sans → Arial → sans-serif) so Cyrillic renders
 * on both Linux build agents and Windows. The output is committed as a static
 * file, so a missing font on a deploy host cannot break the live preview.
 *
 * Usage: node scripts/build-og.mjs
 */
import { writeFile, stat, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const W = 1200;
const H = 630;

// Facts repeated here on purpose: this script is standalone and must not import
// app code (it also runs on a bare build agent).
const NAME = 'ТОКИО';
const SUBTITLE = 'Автосервис в Кокшетау';
const RATING = '4.8';
const RATING_NOTE = '332 оценки в 2ГИС · 166 отзывов';
const AWARD = 'Номинант 2GIS Awards 2026';
const FOOT = 'Ежедневно 09:00–20:00 · Толеу Сулейменова, 25а';

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, '.research', 'photos_raw', 'p08.jpg');
const OUT = path.join(ROOT, 'public', 'og.jpg');

const FONT = 'DejaVu Sans, Verdana, Arial, Helvetica, sans-serif';

const overlay = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="1" y2="0.4">
      <stop offset="0%" stop-color="#07080A" stop-opacity="0.97"/>
      <stop offset="46%" stop-color="#07080A" stop-opacity="0.86"/>
      <stop offset="100%" stop-color="#07080A" stop-opacity="0.55"/>
    </linearGradient>
    <linearGradient id="bottom" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#07080A" stop-opacity="0"/>
      <stop offset="100%" stop-color="#07080A" stop-opacity="0.92"/>
    </linearGradient>
    <linearGradient id="seam" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FF4A55" stop-opacity="0"/>
      <stop offset="50%" stop-color="#FF4A55" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#E0242F" stop-opacity="0.1"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#scrim)"/>
  <rect y="${H - 240}" width="${W}" height="240" fill="url(#bottom)"/>

  <!-- accent seam -->
  <rect x="72" y="0" width="240" height="4" fill="url(#seam)"/>

  <!-- brand mark -->
  <rect x="72" y="82" width="34" height="34" rx="8" fill="#13161A" stroke="rgba(255,255,255,0.22)"/>
  <rect x="83" y="93" width="12" height="12" rx="3" fill="#E0242F"/>

  <text x="122" y="110" font-family="${FONT}" font-size="19" font-weight="bold"
        letter-spacing="4" fill="#8C949D">${escapeXml(SUBTITLE.toUpperCase())}</text>

  <!-- headline -->
  <text x="72" y="300" font-family="${FONT}" font-size="148" font-weight="bold"
        letter-spacing="12" fill="#FFFFFF">${escapeXml(NAME)}</text>

  <text x="76" y="360" font-family="${FONT}" font-size="34" fill="#C9CED4">${escapeXml(SUBTITLE)}</text>

  <!-- rating lockup -->
  <rect x="72" y="400" width="300" height="86" rx="16" fill="rgba(255,255,255,0.06)"
        stroke="rgba(255,255,255,0.14)"/>
  <text x="96" y="447" font-family="${FONT}" font-size="38" font-weight="bold" fill="#FFFFFF">${escapeXml(RATING)}</text>
  <text x="178" y="445" font-family="${FONT}" font-size="24" fill="#E8A33D">★★★★★</text>
  <text x="98" y="472" font-family="${FONT}" font-size="15" fill="#8C949D">${escapeXml(RATING_NOTE)}</text>

  <rect x="392" y="400" width="446" height="86" rx="16" fill="rgba(224,36,47,0.14)"
        stroke="rgba(224,36,47,0.42)"/>
  <text x="416" y="435" font-family="${FONT}" font-size="14" letter-spacing="2.4" fill="#FF7A82">${escapeXml(AWARD.toUpperCase())}</text>
  <text x="416" y="465" font-family="${FONT}" font-size="20" font-weight="bold" fill="#FFFFFF">Номинант · Лучший автосервис 2026</text>

  <!-- footer line -->
  <rect x="72" y="536" width="1056" height="1" fill="rgba(255,255,255,0.14)"/>
  <text x="72" y="576" font-family="${FONT}" font-size="23" fill="#C9CED4">${escapeXml(FOOT)}</text>
  <text x="1128" y="576" text-anchor="end" font-family="${FONT}" font-size="23" font-weight="bold"
        fill="#FFFFFF">+7 778 998 88 77</text>
</svg>`;

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function main() {
  await mkdir(path.dirname(OUT), { recursive: true });

  const photo = await sharp(SOURCE)
    .rotate()
    .resize({ width: W, height: H, fit: 'cover', position: 'centre' })
    .jpeg({ quality: 92 })
    .toBuffer();

  await sharp(photo)
    .composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
    .jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(OUT);

  const { size } = await stat(OUT);
  console.log(`✓ public/og.jpg  1200×630  ${(size / 1024).toFixed(0)} KB`);
}

main().catch((err) => {
  console.error('build-og failed:', err);
  process.exit(1);
});
