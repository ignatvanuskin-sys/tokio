/**
 * Render the 2GIS Awards nomination.
 *
 * `OWNER_INPUT.awards` exists in the content contract but the Керей UI never
 * rendered it (for Керей the value was null, so it never showed). For «Токио»
 * the badge is real and is the strongest third-party trust signal the company
 * has, so it belongs in the "почему выбирают" grid next to the rating.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const file = 'components/site/Sections.tsx';
let s = readFileSync(file, 'utf8');

// 1) import the Award icon
const importFrom = "import { CircleCheck, Clock, CreditCard, MapPin, Phone, Star, Wrench } from 'lucide-react';";
const importTo = "import { Award, CircleCheck, Clock, CreditCard, MapPin, Phone, Star, Wrench } from 'lucide-react';";
if (!s.includes(importFrom)) {
  console.log('SKIP: lucide import line not found');
} else {
  s = s.replace(importFrom, importTo);
  console.log('ok: Award icon imported');
}

// 2) add the award card right after the rating card
const anchor = `    {
      icon: Clock,
      title: 'Работаем без выходных',`;

const award = `    ...(OWNER_INPUT.awards
      ? [
          {
            icon: Award,
            title: '2GIS Awards 2026',
            // В карточке стоит бейдж номинации; это НЕ победа, поэтому и
            // формулировка — «номинант», без превосходной степени.
            text: OWNER_INPUT.awards,
          } satisfies Advantage,
        ]
      : []),
`;

if (!s.includes(anchor)) {
  console.log('SKIP: advantages anchor not found');
} else {
  s = s.replace(anchor, award + anchor);
  console.log('ok: award card inserted');
}

writeFileSync(file, s, 'utf8');
console.log('done');
