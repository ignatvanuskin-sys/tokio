'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { scrollToSection } from './SectionLink';

/**
 * Handles arriving at a page that already carries a hash.
 *
 * Two cases this covers:
 *  · a visitor comes from another route (e.g. /booking → "/#contacts"), so the
 *    browser has no element to jump to at parse time and would leave them at the
 *    top;
 *  · someone pastes or edits a URL with a hash directly.
 *
 * The scroll runs twice: once on the next frame and once after short delays,
 * because fonts and lazy images change section offsets after first paint.
 */
export default function HashScroller() {
  const pathname = usePathname();

  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace(/^#/, '');
      if (id) scrollToSection(id);
    };

    if (!window.location.hash) return;

    // Repeated passes, and the last ones snap instead of animating: fonts and
    // lazy images shift section offsets after first paint, and a long smooth
    // scroll can settle short.
    const timers = [
      window.setTimeout(scrollToHash, 0),
      window.setTimeout(scrollToHash, 260),
      window.setTimeout(scrollToHash, 800),
      window.setTimeout(() => {
        const id = window.location.hash.replace(/^#/, '');
        if (id) scrollToSection(id, 'auto');
      }, 1500),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [pathname]);

  return null;
}
