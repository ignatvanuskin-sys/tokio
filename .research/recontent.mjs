/**
 * Swap every Керей-specific string in the copied codebase for «Токио» content.
 *
 * Written as a script rather than a series of manual edits because:
 *  · PowerShell 5.1 mangles Cyrillic on the command line and decodes .ts files
 *    as ANSI, so all edits must go through Node;
 *  · the change list is long and is worth keeping auditable.
 *
 * Ordered, most-specific-first, so that general renames cannot clobber the
 * hand-written sentences.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const edits = [];
const push = (file, from, to) => edits.push({ file, from, to });

/* ------------------------------------------------------------------ 1. бизнес */

// The hero "паспорт" card and the "профильные направления" card both inline
// join(subRubrics). Twelve headings made a wall of text, so the field carries the
// six flagship directions; the full catalogue lives in services.ts.
{
  const file = 'content/business.ts';
  const from = `  subRubrics: [
    'Компьютерная диагностика автомобилей',
    'Развал-схождение',
    'Ремонт ходовой части автомобиля',
    'Ремонт пневмоподвески',
    'Ремонт бензиновых двигателей',
    'Ремонт инжекторов',
    'Ремонт АКПП и МКПП',
    'Ремонт электронных систем авто',
    'Обслуживание автомобильных климатических систем',
    'Полимерная порошковая окраска',
    'Шиномонтаж',
  ],`;
  const to = `  subRubrics: [
    'Компьютерная диагностика автомобилей',
    'Развал-схождение',
    'Ремонт ходовой части автомобиля',
    'Ремонт бензиновых двигателей',
    'Ремонт АКПП и МКПП',
    'Шиномонтаж',
  ],`;
  push(file, from, to);
}

/* ------------------------------------------------------- 2. заголовок и лид hero */

push(
  'components/site/Hero.tsx',
  'Ремонт <span className="text-[var(--color-accent)]">ходовой</span> и двигателя — с записью онлайн',
  'Диагностика и ремонт <span className="text-[var(--color-accent)]">под ключ</span> — с записью онлайн',
);

push(
  'components/site/Hero.tsx',
  `            {BUSINESS.rubric} полного цикла: ходовая часть, бензиновые двигатели, развал-схождение и запчасти для
            иномарок. Выбираете удобное время на сайте — мы подтверждаем запись и ждём вас.`,
  `            {BUSINESS.rubric} в {BUSINESS.city}: компьютерная диагностика, развал-схождение, ходовая часть и
            пневмоподвеска, двигатели, АКПП и МКПП, шиномонтаж и аренда тёплого бокса. Выбираете удобное время на
            сайте — мы подтверждаем запись и ждём вас.`,
);

// Фотографии первого экрана: реальные кадры 2ГИС в WebP.
push(
  'components/site/Hero.tsx',
  `          href="/images/hero-mobile.jpg"
          imageSrcSet="/images/hero-mobile.jpg 960w, /images/hero.jpg 1920w"`,
  `          href="/images/hero-mobile.webp"
          imageSrcSet="/images/hero-mobile.webp 960w, /images/hero.webp 1920w"`,
);
push(
  'components/site/Hero.tsx',
  'srcSet="/images/hero-mobile.jpg 960w, /images/hero.jpg 1920w"',
  'srcSet="/images/hero-mobile.webp 960w, /images/hero.webp 1920w"',
);

/* ------------------------------------------------------------- 3. блок «о компании» */

push(
  'components/site/Sections.tsx',
  `              «{BUSINESS.name}» — автокомплекс в {BUSINESS.city}е по адресу {BUSINESS.address}. Основное направление —
              ремонт и обслуживание легковых автомобилей: ходовая часть, бензиновые двигатели, развал-схождение и
              запчасти для иномарок.`,
  `              «{BUSINESS.name}» — автосервис в {BUSINESS.city} по адресу {BUSINESS.address}. Основные направления —
              компьютерная диагностика, развал-схождение, ремонт ходовой части и пневмоподвески, бензиновых двигателей,
              АКПП и МКПП, тормозной системы, шиномонтаж и аренда тёплого бокса.`,
);

push(
  'components/site/Sections.tsx',
  `              {BUSINESS.brands.length} марок в списке обслуживания — от бюджетных Lada, Daewoo и Ravon до
              Mercedes-Benz и Lexus.`,
  `              {BUSINESS.brands.length} марок в списке обслуживания — от Lada и Changan до BMW и Lexus.`,
);

push(
  'components/site/Sections.tsx',
  "text: `${BUSINESS.payment.join(', ')}. Здесь же можно подобрать запчасти для иномарок.`,",
  "text: `${BUSINESS.payment.join(', ')}. На месте есть магазин технических жидкостей и расходников.`,",
);

push(
  'components/site/Hero.tsx',
  '{BUSINESS.brands.length} марок — от Lada и Daewoo до Mercedes-Benz и Lexus',
  '{BUSINESS.brands.length} марок — от Lada и Changan до BMW и Lexus',
);

/* ------------------------------------------------------------ 4. каталог услуг в бэкоффисе */

push(
  'lib/booking.ts',
  `  const titles: Record<string, string> = {
    suspension: 'Ремонт ходовой части',
    engine: 'Ремонт бензиновых двигателей',
    'wheel-alignment': 'Развал-схождение',
    'spare-parts': 'Запчасти для иномарок',
    'car-service': 'Ремонт и обслуживание легковых авто',
    unknown: 'Не знаю, что сломалось',
  };
  return titles[slug] ?? 'Ремонт и обслуживание';`,
  `  const titles: Record<string, string> = {
    diagnostics: 'Компьютерная диагностика',
    alignment: 'Развал-схождение',
    suspension: 'Ремонт ходовой части',
    'air-suspension': 'Ремонт пневмоподвески',
    'oil-service': 'Замена масла и ТО',
    engine: 'Ремонт двигателей',
    injectors: 'Ремонт инжекторов',
    transmission: 'Ремонт АКПП и МКПП',
    brakes: 'Тормозная система',
    tyres: 'Шиномонтаж',
    rims: 'Диски: правка и покраска',
    electronics: 'Ремонт электронных систем',
    climate: 'Кондиционер и климат',
    'powder-coating': 'Полимерная порошковая окраска',
    'warm-box': 'Аренда тёплого бокса',
    unknown: 'Не знаю, что сломалось',
  };
  return titles[slug] ?? 'Ремонт и обслуживание';`,
);

/* ------------------------------------------------------------------ 5. SEO / манифест */

push(
  'app/manifest.ts',
  "'Ремонт ходовой части, ремонт бензиновых двигателей, развал-схождение и запчасти для иномарок в Кокшетау. Онлайн-запись.',",
  "'Компьютерная диагностика, развал-схождение, ходовая и пневмоподвеска, двигатели, АКПП и МКПП, шиномонтаж и аренда тёплого бокса в Кокшетау. Онлайн-запись.',",
);

/* --------------------------------------------------------- 6. общие переименования */

// Generic brand/kind renames, applied last so the specific sentences above
// already look right and cannot be double-rewritten.
const GLOBAL = [
  ['Керей', 'Токио'],
  ['Автокомплекс', 'Автосервис'],
  ['автокомплекс', 'автосервис'],
  ['kerey', 'tokyo'],
  ['KEREY', 'TOKYO'],
];

const TARGET_FILES = [
  'app/layout.tsx',
  'app/manifest.ts',
  'app/page.tsx',
  'app/admin/page.tsx',
  'app/privacy/page.tsx',
  'components/site/Header.tsx',
  'components/site/Hero.tsx',
  'components/site/Sections.tsx',
  'components/site/MapEmbed.tsx',
  'components/site/Accordion.tsx',
  'components/booking/BookingRoot.tsx',
  'components/booking/BookingWizard.tsx',
  'components/booking/booking-ui.ts',
  'components/booking/BookButton.tsx',
  'components/admin/AdminLogin.tsx',
  'components/admin/AdminPanel.tsx',
  'components/ui/Reveal.tsx',
  'lib/auth.ts',
  'lib/rate-limit.ts',
  'lib/storage.ts',
  'lib/site-url.ts',
  'lib/format.ts',
  'lib/telegram.ts',
  'lib/validation.ts',
  'lib/slots.ts',
  'lib/phone.ts',
  'lib/booking-types.ts',
  'lib/booking.ts',
  'tests/booking.test.ts',
  'tests/phone.test.ts',
  'tests/slots.test.ts',
  'scripts/init-env.mjs',
  '.env.example',
  'README.md',
];

const report = [];

function apply(file, from, to) {
  if (!existsSync(file)) return false;
  const source = readFileSync(file, 'utf8');
  if (!source.includes(from)) return false;
  writeFileSync(file, source.split(from).join(to), 'utf8');
  return true;
}

// Explicit edits first.
for (const e of edits) {
  const ok = apply(e.file, e.from, e.to);
  report.push(`${ok ? 'ok  ' : 'SKIP'} ${e.file} :: ${e.from.split('\n')[0].slice(0, 70)}`);
}

// Then the global renames.
for (const file of TARGET_FILES) {
  if (!existsSync(file)) continue;
  let source = readFileSync(file, 'utf8');
  const before = source;
  for (const [from, to] of GLOBAL) source = source.split(from).join(to);
  if (source !== before) {
    writeFileSync(file, source, 'utf8');
    report.push(`ok   ${file} :: global rename`);
  }
}

console.log(report.join('\n'));
console.log(`\n${report.filter((r) => r.startsWith('ok')).length} applied, ${report.filter((r) => r.startsWith('SKIP')).length} skipped`);
