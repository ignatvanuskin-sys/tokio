import type { MetadataRoute } from 'next';
import { BUSINESS } from '@/content/business';

/** Веб-манифест: сайт можно добавить на домашний экран телефона. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `Токио — ${BUSINESS.kind}, ${BUSINESS.city}`,
    short_name: 'Токио',
    description:
      'Компьютерная диагностика, развал-схождение, ходовая и пневмоподвеска, двигатели, АКПП и МКПП, шиномонтаж и аренда тёплого бокса в Кокшетау. Онлайн-запись.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0C0E',
    theme_color: '#0B0C0E',
    lang: 'ru',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
