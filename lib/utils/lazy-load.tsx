/**
 * Lazy Loading Utilities
 *
 * Helper functions to lazy load components and modules for better performance
 */

import dynamic from 'next/dynamic';
import React from 'react';

/**
 * Create a lazy-loaded component with a loading fallback
 *
 * Usage:
 * ```typescript
 * const HeavyComponent = lazyLoad(() => import('@/components/Heavy'));
 * ```
 */
export function lazyLoad<P = {}>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  options?: {
    loadingComponent?: React.ComponentType;
    ssr?: boolean;
  }
) {
  return dynamic(importFunc, {
    loading: options?.loadingComponent || (() => <div>Loading...</div>),
    ssr: options?.ssr ?? false,
  }) as React.ComponentType<P>;
}

/**
 * Lazy load a component that should NOT be server-side rendered
 * (for components using browser APIs, animations, etc.)
 *
 * Usage:
 * ```typescript
 * const Animation = lazyLoadClient(() => import('@/components/Animation'));
 * ```
 */
export function lazyLoadClient<P = {}>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  loadingComponent?: React.ComponentType
) {
  return lazyLoad(importFunc, {
    loadingComponent,
    ssr: false,
  });
}

/**
 * Lazy load a component that CAN be server-side rendered
 *
 * Usage:
 * ```typescript
 * const Content = lazyLoadServer(() => import('@/components/Content'));
 * ```
 */
export function lazyLoadServer<P = {}>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  loadingComponent?: React.ComponentType
) {
  return lazyLoad(importFunc, {
    loadingComponent,
    ssr: true,
  });
}

/**
 * Lazy load a specific export from a module
 *
 * Usage:
 * ```typescript
 * const { animate } = await lazyImport('gsap', 'animate');
 * ```
 */
export async function lazyImport(moduleName: string, exportName?: string) {
  const module = await import(moduleName);
  return exportName ? module[exportName] : module.default;
}

/**
 * Create a loading skeleton component
 *
 * Usage:
 * ```typescript
 * const Skeleton = createSkeleton('w-full h-64 bg-gray-200 rounded');
 * const Component = lazyLoad(() => import('./Heavy'), { loadingComponent: Skeleton });
 * ```
 */
export function createSkeleton(className?: string) {
  return function SkeletonComponent() {
    return <div className={className || 'w-full h-32 bg-gray-200 rounded animate-pulse'} />;
  };
}

/**
 * Preload a component when it's about to be needed
 * Useful for preloading when user hovers over a link
 *
 * Usage:
 * ```typescript
 * const ProfileComponent = dynamic(() => import('@/components/Profile'));
 *
 * export function Link() {
 *   return (
 *     <a
 *       href="/profile"
 *       onMouseEnter={() => preloadComponent(ProfileComponent)}
 *     >
 *       Profile
 *     </a>
 *   );
 * }
 * ```
 */
export async function preloadComponent(component: React.ComponentType) {
  // Components are preloaded automatically by Next.js
  // This is a placeholder for future preloading strategies
  return component;
}

/**
 * Conditionally import heavy libraries only when needed
 *
 * Usage:
 * ```typescript
 * // In event handler:
 * const gsap = await conditionalImport('gsap');
 * gsap.to('.element', { duration: 1, x: 100 });
 * ```
 */
export async function conditionalImport(moduleName: string) {
  try {
    return await import(moduleName);
  } catch (error) {
    console.error(`Failed to import ${moduleName}:`, error);
    return null;
  }
}

/**
 * List of components that should be lazy loaded
 * (reference for consistency across the app)
 */
export const LAZY_LOAD_COMPONENTS = {
  // 3D/Heavy Animation
  'WaveformVisualizer': '@/components/WaveformVisualizer',
  'ThreeScene': '@/components/ThreeScene',
  'Globe3D': '@/components/Globe3D',

  // Complex UI
  'AIGirlfriendsTabs': '@/components/AIGirlfriendsTabs',
  'NavbarWithMusic': '@/components/NavbarWithMusic',
  'ProjectTabs': '@/components/ProjectTabs',

  // Video/Media
  'VideoPlayer': '@/components/VideoPlayer',
  'AudioPlayer': '@/components/AudioPlayer',

  // Charts/Analytics
  'Analytics': '@/components/Analytics',
  'Charts': '@/components/Charts',
} as const;

/**
 * Heavy libraries that should be dynamically imported
 */
export const HEAVY_LIBRARIES = {
  'gsap': 'gsap',              // ~180KB (animations)
  'three': 'three',            // ~300KB (3D graphics)
  'framer-motion': 'framer-motion',  // ~40KB
  'chart.js': 'chart.js',      // ~60KB
  'd3': 'd3',                  // ~200KB (data visualization)
} as const;

/**
 * Example: How to use lazy loading in a component
 *
 * ```typescript
 * import { lazyLoadClient } from '@/lib/utils/lazy-load';
 *
 * // Option 1: Direct import
 * const WaveformViz = lazyLoadClient(() => import('@/components/WaveformVisualizer'));
 *
 * // Option 2: With custom loading component
 * const loadingSkeleton = createSkeleton('w-full h-64');
 * const ThreeScene = lazyLoadClient(
 *   () => import('@/components/ThreeScene'),
 *   loadingSkeleton
 * );
 *
 * export function Page() {
 *   return (
 *     <div>
 *       <Suspense fallback={<div>Loading...</div>}>
 *         <WaveformViz />
 *         <ThreeScene />
 *       </Suspense>
 *     </div>
 *   );
 * }
 * ```
 */
