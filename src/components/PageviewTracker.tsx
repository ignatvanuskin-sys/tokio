'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { track } from '@/lib/analytics';

/**
 * Fires `page_view` on every client-side route change.
 * No cookies, no identifiers, no third-party request — see src/lib/analytics.ts.
 */
export function PageviewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    track('page_view', { placement: pathname });
  }, [pathname]);

  return null;
}
