'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Число, которое досчитывается до значения, когда попадает в поле зрения.
 *
 * Зачем: 4.8 и 332 — это доказательство доверия, а не декорация. Досчёт
 * переносит на них внимание в момент появления и показывает, что число —
 * настоящее значение, а не картинка. Анимация однократная, короткая и
 * полностью отключается при prefers-reduced-motion: тогда число просто
 * показывается сразу, без промежуточных состояний.
 */
export default function CountUp({
  value,
  decimals = 0,
  durationMs = 1100,
  suffix = '',
  prefix = '',
  className,
}: {
  value: number;
  decimals?: number;
  durationMs?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      setShown(value);
      return;
    }

    let frame = 0;
    let started = 0;

    const step = (now: number) => {
      if (!started) started = now;
      const progress = Math.min((now - started) / durationMs, 1);
      // easeOutExpo: быстро в начале, мягкая остановка в конце.
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setShown(value * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
      else setShown(value);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect();
            frame = requestAnimationFrame(step);
          }
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {shown.toLocaleString('ru-RU', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
