'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Stagger in ms — keep small (0–180) so mobile scrolling never feels laggy. */
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'article';
};

/**
 * Reveal-on-scroll.
 *
 * · Uses IntersectionObserver, unobserves after firing (no scroll listeners).
 * · Honours prefers-reduced-motion by showing content immediately and never
 *   applying a transform.
 * · Falls back to "visible" if IntersectionObserver is unavailable, so content
 *   can never be stuck invisible.
 */
export function Reveal({ children, delay = 0, className = '', as = 'div' }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  const Tag = as as 'div';

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.unobserve(entry.target);
          }
        }
      },
      // Fire slightly before the element is fully on screen, and never wait
      // for the whole element on tall mobile sections.
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={`${shown ? 'reveal-shown' : 'reveal-hidden'} ${className}`}
      style={shown && delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
