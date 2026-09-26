/**
 * Inline icon set.
 *
 * Deliberately hand-drawn rather than pulling in an icon package: the whole site
 * needs nine glyphs, and shipping only those keeps the JS bundle free of a
 * library (no install, no tree-shaking guesswork). Shapes and stroke weights
 * match the Lucide visual language used by the reference design.
 */
import type { SVGProps } from 'react';
import type { ServiceGroup } from '@/data/services';

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Base>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m15 5-7 7 7 7" />
  </Base>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m9 5 7 7-7 7" />
  </Base>
);

export const CloseIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Base>
);

export const AlertIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5M12 16.2v.3" />
  </Base>
);

export const CheckCircleIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.5 2.6 2.6L16 9.5" />
  </Base>
);

export const SpinnerIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M21 12a9 9 0 1 1-9-9" />
  </Base>
);

export const PinIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.4" />
  </Base>
);

export const ClockIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.2l3.4 2" />
  </Base>
);

export const PhoneIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L17 13l4 1.5v3c0 1.1-.9 2-2 2A16 16 0 0 1 4.5 5c0-1.1.9-2 2-2Z" />
  </Base>
);

export const WhatsAppIcon = (p: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24Zm-3.1 3.9c-.15-.34-.3-.35-.45-.36h-.38c-.13 0-.34.05-.52.25-.18.2-.68.66-.68 1.6 0 .95.7 1.87.8 2 .1.13 1.35 2.15 3.33 2.93 1.64.65 1.98.52 2.34.49.36-.03 1.16-.47 1.32-.93.16-.46.16-.85.11-.93-.05-.08-.18-.13-.38-.23-.2-.1-1.16-.57-1.34-.64-.18-.06-.31-.1-.44.1-.13.2-.5.63-.62.76-.11.13-.23.15-.42.05a5.36 5.36 0 0 1-1.57-.97 5.9 5.9 0 0 1-1.09-1.36c-.11-.2-.01-.31.09-.41.09-.09.2-.23.3-.35.1-.12.13-.2.2-.34.06-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.45Z" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/* Service icons — one per work direction, chosen by service group.            */
/* -------------------------------------------------------------------------- */

const GROUP_PATHS: Record<ServiceGroup, React.ReactNode> = {
  // Диагностика — осциллограф/пульс
  diagnostics: (
    <>
      <path d="M3 12h3l2-6 3 12 2.5-8 2 4h5.5" />
    </>
  ),
  // Двигатель — блок цилиндров
  engine: (
    <>
      <path d="M4 9h4V6h5v3h2l3 3v5H4V9Z" />
      <path d="M8 17v3M15 6h4" />
    </>
  ),
  // Ходовая/подвеска — амортизатор
  chassis: (
    <>
      <path d="M12 3v5M12 16v5" />
      <path d="M9 8h6l-1.5 3h-3L9 8ZM9 16h6l-1.5-3h-3L9 16Z" />
      <path d="M10.5 11h3" />
    </>
  ),
  // Тормоза — тормозной диск с суппортом
  brakes: (
    <>
      <circle cx="11" cy="12" r="7" />
      <circle cx="11" cy="12" r="2.2" />
      <path d="M18 7h3v10h-3" />
    </>
  ),
  // Колёса/шины — колесо
  wheels: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v5M12 15.5v5M3.5 12h5M15.5 12h5" />
    </>
  ),
  // Электрика/климат — снежинка (кондиционер)
  electric: (
    <>
      <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
    </>
  ),
  // Кузов и окраска — распылитель
  body: (
    <>
      <path d="M9 4h4v4H9zM11 8v3" />
      <path d="M8 13h7v7H8z" />
      <path d="M17 6h2M17 10h2M17 14h2" />
    </>
  ),
  // Тёплый бокс — ворота
  space: (
    <>
      <path d="M4 20V6l8-3 8 3v14" />
      <path d="M4 11h16M4 15.5h16" />
    </>
  ),
};

export function ServiceIcon({ group, className }: { group: ServiceGroup; className?: string }) {
  return (
    <Base className={className} strokeWidth="1.6">
      {GROUP_PATHS[group]}
    </Base>
  );
}
