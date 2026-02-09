# Performance Optimization - b0ase.com

**Last Updated**: 2026-01-16

> **Consolidated Guide** - This document combines development performance, asset optimization, and code optimization strategies.

## Table of Contents

1. [Development Performance](#development-performance) - Speed up local development
2. [Asset Optimization](#asset-optimization) - Optimize images, videos, fonts
3. [Code & Bundle Optimization](#code--bundle-optimization) - Reduce JavaScript bundle sizes
4. [Quick Wins](#quick-wins) - High-impact, low-effort improvements
5. [Monitoring & Metrics](#monitoring--metrics) - Track performance over time

---

## Development Performance

### Current Issues

The site experiences slow development load times due to:

1. **Heavy middleware on every request** - Supabase auth check on ALL routes
2. **Deeply nested providers** - 7+ providers in root layout initialize on every page
3. **Large dependencies** - 2GB node_modules with heavy packages
4. **Massive codebase** - 263 pages, 90 components, requires extensive HMR tracking

### Issue 1: Middleware Runs Auth Check on EVERY Request

**File:** `middleware.ts`

The middleware creates a Supabase server client and calls `supabase.auth.getUser()` on every single request:

```typescript
const supabase = createServerClient(...)
const { data: { user } } = await supabase.auth.getUser();
```

**Impact:** This adds ~100-300ms latency to EVERY page navigation in development.

**Matcher is too broad:**
```typescript
matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
```

This matches almost everything including pages that don't need auth.

**FIX: Narrow Middleware Matcher**

Only run auth middleware on protected routes:

```typescript
export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/api/admin/:path*',
    '/auth/:path*'
  ],
};
```

### Issue 2: Root Layout Provider Hell (7+ Nested Providers)

**File:** `app/layout.tsx`

Every page load initializes this entire chain:

```
YoursWalletProvider (BSV wallet library)
  └── Providers (Supabase client + Auth + Theme + Cart)
        └── Suspense
              └── ThemeProvider
                    └── ColorThemeProvider
                          └── PersistentMusicProvider (audio analyzer)
                                └── NavbarProvider (757 lines, hooks, state)
                                      └── NavbarWithMusic
                                            └── Footer
                                                  └── {children}
```

**Problems:**
- `YoursWalletProvider` imports `yours-wallet-provider` (BSV wallet library) on EVERY page
- `Providers` creates Supabase client immediately via `createClient()` at component mount
- `PersistentMusicProvider` includes `useAudioAnalyzer` hook
- `NavbarProvider` is 237 lines with multiple hooks: `usePathname`, `useSearchParams`, `useColorTheme`, `useAuth`, `useUserHandle`
- NavbarWithMusic is 757 lines loaded on every page

**FIX: Lazy-Load Wallet Provider**

Most pages don't need BSV wallet. Dynamic import it:

```typescript
const YoursWalletProvider = dynamic(
  () => import('@/lib/context/YoursWalletContext').then(m => m.YoursWalletProvider),
  { ssr: false }
);
```

Or move it to only the pages that need it (mint, wallet pages).

**FIX: Split Root Layout**

Create route groups with different layouts:

```
app/
├── (main)/          # Full providers (navbar, music, wallet)
│   ├── layout.tsx
│   └── page.tsx
├── (minimal)/       # Minimal providers (no wallet, no music)
│   ├── layout.tsx
│   └── studio/
├── (admin)/         # Admin-specific providers
│   ├── layout.tsx
│   └── admin/
```

### Issue 3: Supabase Client Created at Import Time

**File:** `lib/supabase/client.ts`

```typescript
export const supabase = createClient();  // Created at import time!
```

This means importing this file anywhere triggers Supabase initialization.

**FIX:** Remove the static export:

```typescript
// DELETE THIS
export const supabase = createClient();

// Only export the function
export function createClient() { ... }
```

### Issue 4: Massive Dependencies

**node_modules: 2.0GB**

Heavy packages that slow down bundling:
- `@react-three/fiber` + `@react-three/drei` + `three` (3D graphics)
- `@supabase/ssr` + `@supabase/supabase-js` + `@supabase/auth-helpers-nextjs`
- `ethers` (Ethereum)
- `@solana/web3.js` + `@solana/spl-token` (Solana)
- `@bsv/sdk` + `yours-wallet-provider` (Bitcoin SV)
- `framer-motion` (animations)
- `gsap` (animations)
- `googleapis`
- `openai` + `@anthropic-ai/sdk` + `@google/generative-ai` (AI SDKs)
- `cheerio` (HTML parsing)
- `prisma` + `@prisma/client`

**FIX:** Run dependency audit:

```bash
npx depcheck      # Find unused packages
pnpm audit        # Check for vulnerabilities
```

Candidates for removal/optimization:
- `leva` - UI debug panel (only in dev?)
- `cheerio` - Only used for scraping
- `googleapis` - Only in certain routes
- `bcryptjs` - Only on server

### Quick Test

To verify middleware is the issue, temporarily comment out the Supabase auth check:

```typescript
// const { data: { user } } = await supabase.auth.getUser();
const user = null;
```

If pages load significantly faster, middleware is the primary bottleneck.

### Priority Order for Development Performance

1. **Narrow middleware matcher** (5 min fix, biggest impact)
2. **Remove static Supabase export** (5 min fix)
3. **Split layouts by route group** (30 min)
4. **Dynamic import YoursWalletProvider** (10 min)
5. **Dynamic import NavbarWithMusic** (10 min)
6. **Review and remove unused dependencies** (1 hour)

---

## Asset Optimization

### Current Issues

1. **Large video files** - Some videos 5MB+ causing slow loading
2. **Large image files** - Several images 1MB+ (some over 5MB)
3. **No lazy loading** for videos and images
4. **No preloading** of critical assets
5. **Videos autoplay immediately** which can slow down page load

### Optimizations Implemented

#### 1. Video Performance Improvements

- **Lazy Loading**: Videos use `preload="metadata"` instead of full preload
- **Conditional Autoplay**: Videos only play on hover, not immediately on page load
- **Loading States**: Added loading spinners while videos are buffering
- **Preload Critical Videos**: First 3 videos are preloaded for better perceived performance

#### 2. Image Performance Improvements

- **Next.js Image Optimization**: Added WebP and AVIF format support
- **Responsive Sizes**: Added proper `sizes` attribute for responsive images
- **Lazy Loading**: Images use `loading="lazy"` for better performance

#### 3. Next.js Configuration

In `next.config.js`:

```javascript
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],  // Modern formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    minimumCacheTTL: 60,
  },
};
```

### Asset Optimization Scripts

#### Image Optimization

```bash
pnpm run optimize:images
```

- Uses ImageMagick to compress PNG and JPEG files
- Only processes files larger than 500KB
- Creates backups before optimization

**Installation:**
```bash
# macOS
brew install imagemagick

# Ubuntu
sudo apt-get install imagemagick
```

#### Video Optimization

```bash
pnpm run optimize:videos
```

- Uses FFmpeg to compress MP4 files
- Only processes files larger than 2MB
- Optimizes with H.264 codec and lower bitrate

**Installation:**
```bash
# macOS
brew install ffmpeg

# Ubuntu
sudo apt-get install ffmpeg
```

#### Optimize All Assets

```bash
pnpm run optimize:all
```

Runs both image and video optimization.

### Performance Metrics

After optimization, expect:
- **Images**: 20-40% size reduction
- **Videos**: 30-60% size reduction
- **Page Load Time**: 2-5 second improvement
- **First Contentful Paint**: 1-2 second improvement

### Best Practices

1. **Keep videos under 2MB** for optimal web performance
2. **Use WebP format** for images when possible
3. **Compress assets** before adding to the project
4. **Run optimization scripts** after adding new large assets
5. **Monitor Core Web Vitals** in production

---

## Code & Bundle Optimization

### Bundle Analysis

**Current Bundle Sizes:**
```
Largest chunks:
- 80224fe7: 572KB  (unknown - needs investigation)
- 919c0c12: 223KB  (likely three.js + animations)
- 892e14e8: 189KB  (API clients + utilities)
- 6c6de182: 130KB  (animations/gsap)
- e15b6f3a: 117KB  (unknown)
```

**Heavy Dependencies:**
```
framer-motion    - Animation library (used globally)
three            - 3D graphics
gsap             - Timeline animations
googleapis       - Google API client
openai           - OpenAI client
supabase         - Database client
leva             - UI debug panel
```

### Optimization Strategies

#### 1. Lazy Load Heavy Components

```typescript
// ✅ GOOD - Load only when needed
import dynamic from 'next/dynamic';

const WaveformVisualizer = dynamic(
  () => import('@/components/WaveformVisualizer'),
  { ssr: false, loading: () => <div>Loading...</div> }
);

const ThreeScene = dynamic(
  () => import('@/components/ThreeScene'),
  { ssr: false }
);
```

#### 2. Code Splitting by Route

Next.js automatically does this, but ensure it's working:

```typescript
// Each route page gets its own bundle
app/ai/page.tsx           // Only loads three.js when you visit /ai
app/profile/page.tsx      // Lighter bundle, no three.js
app/video/page.tsx        // Video-specific code
```

#### 3. Dynamic Imports for Heavy Libraries

```typescript
// Instead of:
import GSAP from 'gsap'  // Loaded on every page

// Do this:
const GSAP = await import('gsap')  // Loaded only when used

async function playAnimation() {
  const gsap = await import('gsap');
  gsap.to('.element', { duration: 1, x: 100 });
}
```

#### 4. Memoization to Prevent Re-renders

```typescript
// ✅ GOOD - Only re-renders if props change
import { memo } from 'react';

export const UserCard = memo(function UserCard({ user }) {
  return <div>{user.name}</div>;
});

// With custom comparison
export const ExpensiveList = memo(
  function ExpensiveList({ items }) {
    return items.map(i => <Item key={i.id} item={i} />);
  },
  (prev, next) => prev.items.length === next.items.length
);
```

#### 5. Image Optimization

```typescript
// ✅ GOOD - Optimized images
import Image from 'next/image';

export function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero image"
      width={1200}
      height={600}
      priority        // Load early for above-fold
      quality={75}    // Compress to 75% quality
    />
  );
}
```

#### 6. Tree-Shake Unused Code

In `next.config.js`:

```javascript
const nextConfig = {
  swcMinify: true,  // Better tree-shaking
  webpack: (config, { isServer }) => {
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;
    return config;
  },
};
```

### Component-Level Optimizations

#### NavbarWithMusic.tsx (788 lines)

- Imports 20+ icons from react-icons ❌
- Solution: Import only what's used

```typescript
// ❌ BEFORE - Imports whole library
import * as FiIcons from 'react-icons/fi';

// ✅ AFTER - Import only what's needed
import { FiPlay, FiPause } from 'react-icons/fi';
```

**Impact:** Saves ~30KB from bundles using many icons

#### WaveformVisualizer (Complex)

- Heavy animation library
- Solution: Lazy load with dynamic import ✅

#### ThreeScene Components

- 3D rendering (three.js)
- Solution: Lazy load, only on specific routes ✅

### Performance Budget

Recommended sizes per route:

```
Public routes (/)        < 200KB  (current: varies)
Profile (/profile)       < 150KB
Projects (/projects)     < 150KB
Admin (/admin)           < 200KB  (user logged in)
3D scenes (/scene)       < 300KB  (expected to be large)
Video editor (/video)    < 250KB
```

---

## Quick Wins

High-impact, low-effort improvements you can make right now:

### 1. Icon Imports (5 min)

Change `import * as FiIcons` to individual imports. Saves ~30KB from bundles using many icons.

**Before:**
```typescript
import * as FiIcons from 'react-icons/fi';
<FiIcons.FiPlay />
```

**After:**
```typescript
import { FiPlay, FiPause } from 'react-icons/fi';
<FiPlay />
```

### 2. Image Optimization (10 min)

Use `next/image` for all images, add `quality={75}` to large images. Saves 20-40% on image sizes.

```typescript
<Image src="/hero.jpg" width={1200} height={600} quality={75} />
```

### 3. Lazy Load Animations (15 min)

Wrap framer-motion components in `dynamic()`. Only load when that section is visible. Saves ~50KB from initial bundle.

```typescript
const AnimatedSection = dynamic(() => import('./AnimatedSection'), {
  ssr: false,
  loading: () => <div className="h-screen" />
});
```

### 4. Remove Dev Dependencies (5 min)

Move `leva` to devDependencies only. Saves ~20KB from production.

```bash
pnpm remove leva
pnpm add -D leva
```

### 5. Narrow Middleware Matcher (5 min)

**Biggest Impact** - Only run auth middleware on protected routes.

```typescript
// middleware.ts
export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
```

### 6. Remove Static Supabase Export (5 min)

Delete the `export const supabase = createClient()` line from `lib/supabase/client.ts`.

---

## Monitoring & Metrics

### Lighthouse Audit

```bash
# Build and analyze
pnpm build

# Manual check:
# 1. Open DevTools → Lighthouse
# 2. Run audit
# 3. Check Performance, Accessibility scores
```

### Core Web Vitals

Target metrics:
- **LCP** (Largest Contentful Paint) - < 2.5s
- **FID** (First Input Delay) - < 100ms
- **CLS** (Cumulative Layout Shift) - < 0.1
- **TTFB** (Time to First Byte) - < 600ms

### Check Bundle Size

```bash
# Analyze which dependencies take space
pnpm build -- --profile

# Visual analysis
pnpm install -D webpack-bundle-analyzer
```

### Metrics to Track

After each change, measure:
- Time from `pnpm dev` to "Ready" message
- Time to load `/studio` page cold
- Time to navigate between pages (HMR)

Use browser DevTools Network tab to see which resources are slow.

### Monitoring Tools

Use browser DevTools to monitor:
- **Network tab** for asset loading times
- **Performance tab** for Core Web Vitals
- **Lighthouse** for overall performance scores
- **Vercel Analytics** for production metrics

---

## Implementation Checklist

- [ ] Lazy load heavy components with `dynamic()`
- [ ] Remove `ssr: false` from components that can be SSR'd
- [ ] Import only specific icons instead of whole libraries
- [ ] Memoize expensive components with `React.memo()`
- [ ] Optimize images with `next/image`
- [ ] Move animations to route-specific chunks
- [ ] Audit and remove unused dependencies
- [ ] Add dynamic imports for rarely-used features
- [ ] Test with Lighthouse
- [ ] Monitor Core Web Vitals
- [ ] Add performance budget checks to CI/CD
- [ ] Narrow middleware matcher
- [ ] Remove static Supabase export
- [ ] Split root layout by route groups
- [ ] Lazy load wallet provider
- [ ] Run asset optimization scripts

---

## Advanced Optimizations (More Complex)

1. **Route-specific bundles** - Organize code by route
2. **Server components** - Move logic to server (if applicable)
3. **Streaming** - Stream content as it loads
4. **Service worker** - Cache assets for offline use
5. **WebP images** - Use modern image formats
6. **Module Federation** - For very large apps, split into separate deployable units
7. **Remove Turbopack or Fix Config** - Either remove `--turbo` from dev script or configure it properly

---

## Resources

- [Next.js Performance](https://nextjs.org/learn/seo/web-performance)
- [React Performance](https://react.dev/reference/react/memo)
- [Web Vitals](https://web.dev/vitals/)
- [Bundle Analysis](https://github.com/vercel/next.js/tree/canary/packages/next-bundle-analyzer)
- [GEO Guide](https://www.geoguide.dev/)

---

## Summary: Priority Actions

**Immediate (Today):**
1. Narrow middleware matcher
2. Remove static Supabase export
3. Icon import optimization

**This Week:**
4. Split root layout by route groups
5. Lazy load wallet provider
6. Lazy load animations
7. Run asset optimization scripts

**This Month:**
8. Remove unused dependencies
9. Implement performance budgets
10. Add CI/CD performance checks

---

**Questions?** Check `docs/DOC_INDEX.md` for related documentation or see `CLAUDE.md` for project standards.
