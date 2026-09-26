'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';

/**
 * Same-page anchor link that actually scrolls.
 *
 * THE BUG (found in the UX audit): the header nav used `next/link` with
 * `href="/#contacts"`. Because the target is a route (`/`) plus a hash, Next's
 * router takes over the click, updates `location.hash` and resets scroll to the
 * top — the browser's native anchor jump never happens, so the visitor stayed at
 * `scrollY = 0` while the URL said `#contacts`.
 *
 * THE FIX: when we are already on the target route, handle the click ourselves —
 * `preventDefault`, scroll the section into view *below the sticky header*, then
 * put the hash back in the URL so the address bar and the scroll position agree.
 * When we are on a different route, the click is left to `next/link`, which
 * navigates normally and hands off to <HashScroller /> on arrival.
 */

/** Sticky-header height plus a little breathing room. */
function headerOffset(): number {
  const header = document.querySelector('header');
  return (header?.getBoundingClientRect().height ?? 64) + 12;
}

/** Scrolls the element into view, accounting for the sticky header. */
export function scrollToSection(id: string, behavior?: ScrollBehavior): boolean {
  const element = document.getElementById(id);
  if (!element) return false;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const top = Math.max(element.getBoundingClientRect().top + window.scrollY - headerOffset(), 0);

  window.scrollTo({ top, behavior: behavior ?? (reduceMotion ? 'auto' : 'smooth') });
  return true;
}

/**
 * Smooth scrolling over a long distance can be interrupted, and lazy images
 * loading further down the page shift the target while the animation runs — QA
 * measured the page holding ~300 px short for about a second before snapping.
 * So after the animation we re-measure once and, only if we are meaningfully
 * off, finish the move instantly.
 */
function settle(id: string, delays: number[]): void {
  for (const delay of delays) {
    window.setTimeout(() => {
      const element = document.getElementById(id);
      if (!element) return;
      const target = Math.max(
        element.getBoundingClientRect().top + window.scrollY - headerOffset(),
        0,
      );
      // 24px tolerance: below that the difference is imperceptible and snapping
      // would fight a still-running smooth scroll.
      if (Math.abs(window.scrollY - target) > 24) {
        window.scrollTo({ top: target, behavior: 'auto' });
      }
    }, delay);
  }
}

type Props = {
  /** Either "/#section" or "#section". */
  href: string;
  className?: string;
  children: ReactNode;
  /** Called before scrolling — used to close the mobile menu. */
  onNavigate?: () => void;
  'aria-label'?: string;
};

export default function SectionLink({ href, className, children, onNavigate, ...rest }: Props) {
  const pathname = usePathname();

  const hashIndex = href.indexOf('#');
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';
  const id = hash.slice(1);
  const route = hashIndex > 0 ? href.slice(0, hashIndex) : pathname;
  const samePage = Boolean(id) && pathname === route;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onNavigate?.();
    if (!samePage) return; // другой маршрут — пусть переходом занимается next/link

    event.preventDefault();
    // Ждём, пока закроется мобильное меню: его скрытие меняет высоту шапки,
    // а от неё зависит смещение прокрутки.
    window.setTimeout(() => {
      if (!scrollToSection(id)) return;
      settle(id, [520, 1100, 1900]);
      // replaceState, а не pushState: Next не должен считать это навигацией,
      // но адрес и позиция прокрутки обязаны совпадать.
      window.history.replaceState(null, '', hash);
    }, 70);
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
