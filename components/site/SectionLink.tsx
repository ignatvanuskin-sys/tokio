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
export function scrollToSection(id: string): boolean {
  const element = document.getElementById(id);
  if (!element) return false;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const top = element.getBoundingClientRect().top + window.scrollY - headerOffset();

  window.scrollTo({ top: Math.max(top, 0), behavior: reduceMotion ? 'auto' : 'smooth' });
  return true;
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
