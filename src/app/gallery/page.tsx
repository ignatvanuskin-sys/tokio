import type { Metadata } from 'next';

import { business } from '@/data/business';
import { gallery } from '@/data/gallery';
import { PageHeader } from '@/components/PageHeader';
import { Gallery } from '@/components/Gallery';
import { CtaBand } from '@/components/CtaBand';

export const metadata: Metadata = {
  title: `Фотографии сервиса — ${business.galleryCount} реальных фото`,
  description:
    `Фотографии автосервиса «${business.name}» в ${business.city}: цех, подъёмники, ` +
    `развал-схождение, расходники, въезд в бокс. Реальные снимки с карточки в 2ГИС, ` +
    `${business.address.streetShort}.`,
  alternates: { canonical: '/gallery' },
};

/**
 * Full gallery. Server-rendered list of tiles (so the images are in the HTML for
 * crawlers and no-JS users); the lightbox is the only client-side part.
 */
export default function GalleryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Фотографии"
        title="Сервис без ретуши"
        lead={`${gallery.length} фотографий с карточки сервиса в 2ГИС: цех, подъёмники, развал-схождение, расходники и въезд в бокс. Нажмите на снимок, чтобы открыть во весь экран — листать можно свайпом.`}
        breadcrumbs={[
          { href: '/', label: 'Главная' },
          { href: '/gallery', label: 'Фотографии' },
        ]}
      />

      <div className="shell pb-12 pt-8 md:pb-20 md:pt-12">
        <Gallery layout="grid" showFilter />
      </div>

      <CtaBand
        placement="gallery_final"
        photo="p13"
        alt="Автомобиль на двухстоечном подъёмнике"
        eyebrow="Запись"
        title="Понравилось? Запишитесь"
        body={`${business.hours.display}. ${business.address.streetShort}, ${business.city}. Свободные слоты видны сразу, заполнение — меньше минуты.`}
      />
    </>
  );
}
