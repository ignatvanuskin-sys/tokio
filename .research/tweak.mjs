import { readFileSync, writeFileSync } from 'node:fs';

/**
 * Small, explicit text tweaks that the codemod and the redesign require.
 * Written to a file rather than passed via `node -e` because PowerShell 5.1
 * mangles non-ASCII on the command line.
 */

const edits = [
  [
    'src/app/page.tsx',
    ' * Two "Записаться" bands plus the hero CTA, and never a permanent overlay\n * covering content (StickyCta is a dismissible pill, mobile only).\n */',
    ' * Two "Записаться" bands plus the hero CTA. There is deliberately NO fixed\n * bottom action bar: on a phone it covers content and hides the very proof the\n * visitor came for. Each band carries its own primary action instead.\n */',
  ],
  [
    'src/components/Hero.tsx',
    'bg-[radial-gradient(120%_80%_at_15%_10%,rgba(224,36,47,0.16),transparent_60%)]',
    'bg-[radial-gradient(120%_80%_at_15%_10%,rgba(255,90,31,0.18),transparent_60%)]',
  ],
];

for (const [file, from, to] of edits) {
  const source = readFileSync(file, 'utf8');
  if (!source.includes(from)) {
    console.log(`SKIP (not found): ${file}`);
    continue;
  }
  writeFileSync(file, source.replace(from, to), 'utf8');
  console.log(`ok: ${file}`);
}

// Insert the grid texture overlay into the hero backdrop, before the closing
// tag of the absolutely-positioned image wrapper.
const heroPath = 'src/components/Hero.tsx';
let hero = readFileSync(heroPath, 'utf8');

const anchor = '      </div>\n\n      <div className="shell ';
if (hero.includes(anchor) && !hero.includes('grid-texture')) {
  hero = hero.replace(
    anchor,
    '        <div className="grid-texture absolute inset-0 opacity-60" />\n      </div>\n\n      <div className="shell ',
  );
  writeFileSync(heroPath, hero, 'utf8');
  console.log('ok: hero grid texture');
} else {
  console.log(`hero texture skipped (present=${hero.includes('grid-texture')})`);
}

// The reference design has no mono webfont; the hero section id already exists.
console.log('done');
