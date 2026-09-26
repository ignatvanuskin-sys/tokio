/**
 * Responsive-image helpers built on the generated asset manifest.
 * Keeps every <img> honest: explicit width/height (no layout shift), real
 * srcset, and lazy loading by default with a priority opt-out for the hero.
 */

import { photoAssets, type PhotoAsset } from '@/data/photo-assets.generated';

export function getPhoto(id: string): PhotoAsset | undefined {
  return photoAssets[id];
}

/** "/photos/p03-400.webp 400w, /photos/p03-640.webp 640w, …" */
export function srcSet(id: string): string {
  const asset = photoAssets[id];
  if (!asset) return '';
  return asset.variants.map((v) => `/photos/${id}-${v.width}.webp ${v.width}w`).join(', ');
}

/** Largest available file — used as the plain `src` fallback. */
export function fallbackSrc(id: string): string {
  const asset = photoAssets[id];
  if (!asset) return '';
  const largest = asset.variants[asset.variants.length - 1];
  return largest ? `/photos/${id}-${largest.width}.webp` : '';
}

/** Intrinsic dimensions of the largest rendered variant (CLS-safe). */
export function intrinsicSize(id: string, maxWidth?: number): { width: number; height: number } {
  const asset = photoAssets[id];
  if (!asset) return { width: 1600, height: 900 };
  const variants = asset.variants;
  const chosen =
    maxWidth === undefined
      ? variants[variants.length - 1]
      : [...variants].reverse().find((v) => v.width <= maxWidth) ?? variants[0];
  return { width: chosen?.width ?? asset.width, height: chosen?.height ?? asset.height };
}

export function lqip(id: string): string | undefined {
  return photoAssets[id]?.lqip;
}

export function aspectRatio(id: string): number {
  return photoAssets[id]?.aspect ?? 16 / 9;
}
