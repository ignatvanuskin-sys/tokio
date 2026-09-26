/**
 * Primary navigation.
 *
 * Lives in the data layer (NOT inside Header.tsx) on purpose: Header is a
 * client component, and importing a value out of a `'use client'` module into a
 * server component yields a client-reference proxy, not the array — which blows
 * up at prerender time with "NAV.map is not a function".
 */
export const NAV = [
  { href: '/services', label: 'Услуги' },
  { href: '/booking', label: 'Запись' },
  { href: '/gallery', label: 'Фотографии' },
  { href: '/reviews', label: 'Отзывы' },
  { href: '/faq', label: 'Вопросы' },
  { href: '/contacts', label: 'Контакты' },
] as const;
