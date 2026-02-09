/**
 * Image Optimization Utilities
 *
 * Best practices and utilities for optimizing images in the application
 */

/**
 * Image optimization presets for common use cases
 *
 * Usage:
 * ```typescript
 * import Image from 'next/image';
 *
 * export function Hero() {
 *   return (
 *     <Image
 *       {...PRESETS.hero}
 *       src="/hero.jpg"
 *       alt="Hero image"
 *     />
 *   );
 * }
 * ```
 */
export const PRESETS = {
  // Hero/Large images - above the fold
  hero: {
    priority: true,
    quality: 75,
    loading: 'eager' as const,
  },

  // Thumbnail images - fast to load
  thumbnail: {
    priority: false,
    quality: 60,
    loading: 'lazy' as const,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  },

  // Profile/Avatar images - small and frequently used
  avatar: {
    priority: false,
    quality: 70,
    loading: 'lazy' as const,
    width: 64,
    height: 64,
  },

  // Background images - can be lower quality
  background: {
    priority: false,
    quality: 50,
    loading: 'lazy' as const,
    fill: true,
  },

  // Product images - high quality
  product: {
    priority: false,
    quality: 85,
    loading: 'lazy' as const,
    sizes: '(max-width: 768px) 100vw, 50vw',
  },

  // Social media preview - balanced quality
  socialPreview: {
    priority: false,
    quality: 70,
    loading: 'lazy' as const,
    width: 1200,
    height: 630,
  },
} as const;

/**
 * Responsive image sizes configuration
 * Use with the `sizes` prop in Image component
 */
export const RESPONSIVE_SIZES = {
  // Full width container
  full: '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px',

  // Half width (2 columns)
  half: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px',

  // Third width (3 columns)
  third: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px',

  // Small (sidebar/card)
  small: '(max-width: 640px) 100vw, 300px',

  // Avatar/Icon
  icon: '48px',
  avatar: '64px',

  // Banner/Hero
  banner: '(max-width: 640px) 100vw, 1200px',
} as const;

/**
 * Get appropriate quality level for image type
 *
 * Usage:
 * ```typescript
 * <Image
 *   quality={getQualityLevel('thumbnail')}
 *   src={image}
 *   alt="Image"
 * />
 * ```
 */
export function getQualityLevel(
  type: 'hero' | 'product' | 'avatar' | 'thumbnail' | 'background'
): number {
  const qualities = {
    hero: 75,
    product: 85,
    avatar: 70,
    thumbnail: 60,
    background: 50,
  };
  return qualities[type];
}

/**
 * Determine if image should be prioritized
 * Only prioritize above-the-fold images
 */
export function shouldPrioritizeImage(position: 'above-fold' | 'below-fold'): boolean {
  return position === 'above-fold';
}

/**
 * Generate image optimization metadata
 *
 * Usage:
 * ```typescript
 * const imgMeta = getImageMetadata('/hero.jpg', 1200, 600);
 * console.log(imgMeta); // { width: 1200, height: 600, aspectRatio: 2 }
 * ```
 */
export function getImageMetadata(src: string, width: number, height: number) {
  return {
    src,
    width,
    height,
    aspectRatio: width / height,
    isSquare: width === height,
    isWide: width > height,
    isTall: height > width,
  };
}

/**
 * React component: Responsive image wrapper
 * Usage:
 * ```typescript
 * import OptimizedImage from '@/lib/utils/image-optimization';
 *
 * export function ProfileCard() {
 *   return (
 *     <OptimizedImage
 *       src="/profile.jpg"
 *       alt="Profile"
 *       type="avatar"
 *     />
 *   );
 * }
 * ```
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  type?: keyof typeof PRESETS;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
}

/**
 * Image optimization checklist
 */
export const IMAGE_OPTIMIZATION_CHECKLIST = `
# Image Optimization Checklist

## ✓ Use next/image
- [ ] Replace <img> tags with <Image>
- [ ] Add alt text to all images
- [ ] Specify width and height

## ✓ Set Quality
- [ ] Hero/important images: quality={75-85}
- [ ] Product images: quality={80}
- [ ] Thumbnails: quality={60}
- [ ] Backgrounds: quality={50}

## ✓ Lazy Loading
- [ ] Above-fold images: priority={true}
- [ ] Below-fold images: priority={false} (default)

## ✓ Responsive Images
- [ ] Add 'sizes' prop for responsive images
- [ ] Test on mobile, tablet, desktop

## ✓ File Format
- [ ] Use WebP when supported (next/image does this)
- [ ] Use PNG for transparency
- [ ] Use JPG for photos
- [ ] Use SVG for icons

## ✓ File Size
- [ ] Compress images before uploading
- [ ] Aim for < 200KB per image
- [ ] Use tools: TinyPNG, ImageOptim, Squoosh

## ✓ Dimensions
- [ ] Don't load images larger than needed
- [ ] Match max display size
- [ ] Use srcset for different sizes

## ✓ Performance
- [ ] Monitor LCP (Largest Contentful Paint)
- [ ] Test with Lighthouse
- [ ] Check Network tab in DevTools
`;

/**
 * Image loading states - use with Suspense and dynamic imports
 */
export const ImageLoadingStates = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

/**
 * Next.js Image optimization configuration recommendations
 * Add to next.config.js:
 *
 * ```javascript
 * const nextConfig = {
 *   images: {
 *     remotePatterns: [
 *       {
 *         protocol: 'https',
 *         hostname: 'cdn.example.com',
 *       },
 *     ],
 *     deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
 *     imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
 *     formats: ['image/webp', 'image/avif'],
 *   },
 * };
 * ```
 */

/**
 * Common image sources optimization
 */
export const IMAGE_SOURCES = {
  internal: {
    path: '/images',
    formats: ['webp', 'jpg', 'png'],
    cached: true,
  },
  cdn: {
    path: 'https://cdn.example.com/images',
    formats: ['webp', 'jpg'],
    cached: true,
  },
  external: {
    cached: false,
    requireManualOptimization: true,
  },
} as const;

/**
 * Example: Optimized Image Component
 *
 * ```typescript
 * import Image from 'next/image';
 * import { PRESETS, RESPONSIVE_SIZES } from '@/lib/utils/image-optimization';
 *
 * export function OptimizedImage({
 *   src,
 *   alt,
 *   type = 'product',
 *   ...props
 * }: OptimizedImageProps) {
 *   const preset = PRESETS[type];
 *
 *   return (
 *     <Image
 *       src={src}
 *       alt={alt}
 *       {...preset}
 *       {...props}
 *     />
 *   );
 * }
 * ```
 */

/**
 * Performance impact of images
 *
 * - Unoptimized image (2MB): Initial load time +2-3s
 * - Optimized (50KB with webp): Initial load time ~+100ms
 * - Impact: ~2-3 seconds saved per page with 5+ images
 */
