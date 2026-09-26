/**
 * Fix the booking date step + two stale hardcoded literals.
 *
 * 1) BUG (found by browser QA): the date step requested
 *      GET /api/availability            (no ?service=)
 *    and the route fell back to a HARDCODED slug `'car-service'`. That slug
 *    existed in the source project, so it worked there; «Токио» has different
 *    slugs, findService() returned undefined, the route answered 422 and the
 *    wizard showed «Свободных дней не нашлось» — the flow was dead at step 3.
 *
 *    Fixed on both sides:
 *      · the wizard now passes the selected service (the day list depends on the
 *        service duration, so it must be service-aware);
 *      · the route no longer hardcodes a slug — a missing param falls back to the
 *        first catalogue entry, and only an explicitly unknown slug is a 422, so
 *        renaming the catalogue can never silently kill the calendar again.
 *
 * 2) The "как это работает" step and a lib comment still quoted the source
 *    project's opening hours (08:30–21:00) instead of «Токио»'s 09:00–20:00.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const report = [];
function edit(file, from, to, label) {
  const s = readFileSync(file, 'utf8');
  if (!s.includes(from)) {
    report.push(`SKIP ${label} (${file})`);
    return;
  }
  writeFileSync(file, s.replace(from, to), 'utf8');
  report.push(`ok   ${label}`);
}

/* ---------------------------------------------- 1a. wizard sends the service */

edit(
  'components/booking/BookingWizard.tsx',
  `  const loadDays = useCallback(async () => {
    try {
      const response = await fetch('/api/availability', { cache: 'no-store' });`,
  `  const loadDays = useCallback(async (serviceSlug: string) => {
    try {
      // Список доступных дней зависит от длительности услуги, поэтому сервис
      // обязателен: без него сервер не знает, какие окна вообще помещаются в день.
      const query = new URLSearchParams({ service: serviceSlug });
      const response = await fetch(\`/api/availability?\${query.toString()}\`, { cache: 'no-store' });`,
  'wizard: service param on the day-list fetch',
);

edit(
  'components/booking/BookingWizard.tsx',
  '    if (days === null) await loadDays();',
  '    if (days === null) await loadDays(values.serviceSlug);',
  'wizard: pass selected service to loadDays',
);

/* ------------------------------------------- 1b. route drops the hardcoded slug */

edit(
  'app/api/availability/route.ts',
  "import { findService } from '@/content/services';",
  "import { findService, SERVICES } from '@/content/services';",
  'route: import SERVICES',
);

edit(
  'app/api/availability/route.ts',
  "  const serviceSlug = params.get('service') ?? 'car-service';",
  "  // Никаких «магических» слагов: без параметра берём первую услугу каталога.\n  // Иначе переименование каталога тихо ломает календарь (именно это и случилось).\n  const serviceSlug = params.get('service') ?? SERVICES[0]?.slug ?? '';",
  'route: catalogue-driven fallback',
);

/* ------------------------------------------------- 2. stale opening hours */

edit(
  'components/site/Sections.tsx',
  "text: 'Свободные слоты видны сразу — работаем ежедневно 08:30–21:00.'",
  'text: `Свободные слоты видны сразу — работаем ${BUSINESS.hours.text.toLowerCase()}.`',
  'sections: hours from BUSINESS',
);

edit(
  'lib/slots.ts',
  ' * Часы работы — из карточки 2ГИС: ежедневно 08:30–21:00.',
  ' * Часы работы — из карточки 2ГИС: ежедневно 09:00–20:00.',
  'slots: comment hours',
);

console.log(report.join('\n'));
