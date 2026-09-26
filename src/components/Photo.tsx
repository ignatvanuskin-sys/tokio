import { fallbackSrc, getPhoto, intrinsicSize, lqip, srcSet } from '@/lib/images';

type Props = {
  id: string;
  alt: string;
  /** `sizes` for the browser's srcset choice. Be accurate — it drives bytes. */
  sizes?: string;
  className?: string;
  /** LCP images get eager loading + high fetch priority. */
  priority?: boolean;
  /** Cover-crop positioning when the frame aspect differs from the photo. */
  objectPosition?: string;
  /** Render as a plain block image (default) or fill its positioned parent. */
  fill?: boolean;
  decorative?: boolean;
  /** Skip the LQIP background (used inside already-dark overlays). */
  noPlaceholder?: boolean;
};

/**
 * Plain <img> with a real srcset, explicit intrinsic dimensions and `sizes`.
 *
 * Deliberately not next/image: every photo here has an unusual aspect ratio
 * (portrait screenshots, 4:3, ultrawide) and several are painted as backgrounds
 * behind gradients. Hand-written srcset gives byte-exact control, keeps CLS at
 * zero and avoids the runtime optimiser entirely (all variants are pre-built
 * WebP by scripts/optimize-images.mjs).
 */
export function Photo({
  id,
  alt,
  sizes = '100vw',
  className = '',
  priority = false,
  objectPosition = 'center',
  fill = false,
  decorative = false,
  noPlaceholder = false,
}: Props) {
  const asset = getPhoto(id);
  if (!asset) return null;

  const { width, height } = intrinsicSize(id);
  const src = fallbackSrc(id);
  const placeholder = noPlaceholder ? undefined : lqip(id);

  return (
    <img
      src={src}
      srcSet={srcSet(id)}
      sizes={sizes}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      alt={decorative ? '' : alt}
      aria-hidden={decorative ? true : undefined}
      loading={priority ? 'eager' : 'lazy'}
      // @ts-expect-error fetchPriority is valid HTML but not yet in React's types for all versions
      fetchpriority={priority ? 'high' : undefined}
      decoding={priority ? 'sync' : 'async'}
      draggable={false}
      style={{
        objectPosition,
        ...(placeholder ? { backgroundImage: `url(${placeholder})`, backgroundSize: 'cover', backgroundPosition: objectPosition } : {}),
      }}
      className={
        (fill ? 'absolute inset-0 h-full w-full object-cover ' : 'block h-auto w-full object-cover ') +
        className
      }
    />
  );
}
