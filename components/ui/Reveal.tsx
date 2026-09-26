'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Props = {
  children: ReactNode;
  className?: string;
  /**
   * Задержка появления, мс — для «лесенки» карточек. Задержку задавайте
   * небольшую (0–200): на телефоне длинная лесенка ощущается как лаг.
   */
  delay?: number;
  /**
   * Характер появления. Разные варианты нужны, чтобы соседние блоки не
   * двигались одинаково — иначе страница выглядит шаблонной.
   */
  variant?: 'up' | 'scale' | 'left';
};

/** Мягкое появление блока при прокрутке. Один наблюдатель на элемент, без библиотек. */
export default function Reveal({ children, className, delay = 0, variant = 'up' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Совсем старые браузеры без IntersectionObserver просто показывают блок сразу.
    if (typeof IntersectionObserver === 'undefined') {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn('reveal', `reveal-${variant}`, visible && 'is-visible', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
