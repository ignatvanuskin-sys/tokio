'use client';

import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { track, type AnalyticsEvent, type AnalyticsPayload } from '@/lib/analytics';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: AnalyticsEvent;
  payload?: AnalyticsPayload;
  children: ReactNode;
};

/**
 * Every outbound conversion action (call, WhatsApp, Instagram, route) funnels
 * through here so it is tracked once, consistently, and without personal data.
 */
export function ActionLink({ event, payload, children, onClick, ...rest }: Props) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        track(event, payload);
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
