import type { Metadata, Viewport } from 'next';
import './fonts.css';
import './globals.css';

import { business, isOpenNow, links, SOURCE } from '@/data/business';
import { scheduleConfig } from '@/data/schedule';
import { siteMeta, siteUrl } from '@/lib/site';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageviewTracker } from '@/components/PageviewTracker';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteMeta.title,
    template: `%s | ${business.name} — автосервис, ${business.city}`,
  },
  description: siteMeta.description,
  applicationName: business.fullName,
  generator: 'Next.js',
  keywords: [
    'автосервис Кокшетау',
    'СТО Кокшетау',
    'ремонт авто Кокшетау',
    'развал-схождение Кокшетау',
    'замена масла Кокшетау',
    'ремонт двигателя Кокшетау',
    'шиномонтаж Кокшетау',
    'Токио автосервис',
    business.address.streetShort,
  ],
  authors: [{ name: `${business.category} «${business.name}»` }],
  creator: `${business.category} «${business.name}»`,
  publisher: `${business.category} «${business.name}»`,
  alternates: { canonical: '/' },
  formatDetection: { telephone: true, address: true, email: false },
  openGraph: {
    type: 'website',
    siteName: business.fullName,
    locale: siteMeta.locale,
    url: siteUrl,
    title: siteMeta.title,
    description: siteMeta.description,
    images: [
      {
        url: siteMeta.ogImage,
        width: 1200,
        height: 630,
        alt: `${business.category} «${business.name}» — ${business.address.streetShort}, ${business.city}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteMeta.title,
    description: siteMeta.description,
    images: [siteMeta.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  category: 'automotive',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Zoom stays available — never lock accessibility away.
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#07080A' },
    { media: '(prefers-color-scheme: light)', color: '#07080A' },
  ],
  colorScheme: 'dark',
};

/**
 * schema.org — AutoRepair (a LocalBusiness subtype).
 *
 * Only facts that are actually published on the 2GIS card are emitted:
 * name, address, geo, phone, opening hours, the 2GIS rating aggregate and the
 * sameAs links. No invented services, prices or reviews — the review quotes
 * live in the UI, but Review markup is intentionally omitted because the
 * ratings were not collected on this site.
 */
function StructuredData() {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    '@id': `${siteUrl}/#business`,
    name: business.name,
    alternateName: business.fullName,
    description: siteMeta.description,
    url: siteUrl,
    image: [`${siteUrl}${siteMeta.ogImage}`],
    telephone: business.phone.e164,
    priceRange: '₸₸',
    currenciesAccepted: 'KZT',
    paymentAccepted: business.payments.join(', '),
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      postalCode: business.address.postalCode,
      addressRegion: business.region,
      addressCountry: business.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: business.geo.lat,
      longitude: business.geo.lon,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: business.hours.open,
        closes: business.hours.close,
      },
    ],
    areaServed: { '@type': 'City', name: business.city },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: business.rating.value,
      bestRating: business.rating.bestRating,
      ratingCount: business.rating.ratingsCount,
      reviewCount: business.rating.reviewsCount,
    },
    makesOffer: business.catalogCategories.map((c) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: c },
    })),
    sameAs: [links.card, business.instagram.url],
    hasMap: links.route,
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is escaped for the </script> case below.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json).replace(/</g, '\\u003c') }}
    />
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Computed on the server in the VENUE timezone, so the first paint is right.
  const initialOpen = isOpenNow(new Date(), scheduleConfig.timeZone);

  return (
    <html lang="ru" dir="ltr">
      <head>
        <StructuredData />
        {/* Provenance of the business data used on this site. */}
        <meta name="data-source" content={`2GIS ${SOURCE.card} (captured ${SOURCE.capturedAt})`} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Перейти к содержимому
        </a>
        <Header initialOpen={initialOpen} />
        <main id="main">{children}</main>
        <Footer />
        <PageviewTracker />
      </body>
    </html>
  );
}
