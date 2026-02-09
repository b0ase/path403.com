# Performance Optimization Guide

## Bundle Analysis

### Current Bundle Sizes
```
Largest chunks:
- 80224fe7: 572KB  (unknown - needs investigation)
- 919c0c12: 223KB  (likely three.js + animations)
- 892e14e8: 189KB  (API clients + utilities)
- 6c6de182: 130KB  (animations/gsap)
- e15b6f3a: 117KB  (unknown)
```

### Heavy Dependencies
```
framer-motion    - Animation library (used globally)
three            - 3D graphics
gsap             - Timeline animations
googleapis       - Google API client
openai           - OpenAI client
supabase         - Database client
leva             - UI debug panel
```

## Optimization Strategies

### 1. **Lazy Load Heavy Components**

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

### 2. **Code Splitting by Route**

Next.js automatically does this, but ensure it's working:

```typescript
// Each route page gets its own bundle
app/ai/page.tsx           // Only loads three.js when you visit /ai
app/profile/page.tsx      // Lighter bundle, no three.js
app/video/page.tsx        // Video-specific code
```

### 3. **Dynamic Imports for Heavy Libraries**

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

### 4. **Memoization to Prevent Re-renders**

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

### 5. **Image Optimization**

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

### 6. **Remove Unused Dependencies**

Check for unused packages:
```bash
npm ls --depth=0  # See all dependencies
npx depcheck      # Find unused packages
```

Current candidates for removal/optimization:
- `leva` - UI debug panel (only in dev?)
- `cheerio` - Only used for scraping
- `googleapis` - Only in certain routes
- `bcryptjs` - Only on server

### 7. **Tree-Shake Unused Code**

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

## Component-Level Optimizations

### NavbarWithMusic.tsx (788 lines)
- Imports 20+ icons from react-icons ❌
- Solution: Import only what's used
```typescript
// ❌ BEFORE - Imports whole library
import * as FiIcons from 'react-icons/fi';

// ✅ AFTER - Import only what's needed
import { FiPlay, FiPause } from 'react-icons/fi';
```

### WaveformVisualizer (Complex)
- Heavy animation library
- Solution: Lazy load with dynamic import ✅

### ThreeScene Components
- 3D rendering (three.js)
- Solution: Lazy load, only on specific routes ✅

## Performance Budget

Recommended sizes per route:
```
Public routes (/)        < 200KB  (current: varies)
Profile (/profile)       < 150KB
Projects (/projects)     < 150KB
Admin (/admin)           < 200KB  (user logged in)
3D scenes (/scene)       < 300KB  (expected to be large)
Video editor (/video)    < 250KB
```

## Monitoring Performance

### Lighthouse Audit
```bash
# Build and analyze
npm run build

# Manual check:
# 1. Open DevTools → Lighthouse
# 2. Run audit
# 3. Check Performance, Accessibility scores
```

### Core Web Vitals
- **LCP** (Largest Contentful Paint) - < 2.5s
- **FID** (First Input Delay) - < 100ms
- **CLS** (Cumulative Layout Shift) - < 0.1
- **TTFB** (Time to First Byte) - < 600ms

### Check Bundle Size
```bash
# Analyze which dependencies take space
npm run build -- --profile

# Visual analysis
npm install -D webpack-bundle-analyzer
```

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

## Quick Wins (Easy to Implement)

1. **Icon imports** (5 min)
   - Change `import * as FiIcons` to individual imports
   - Saves ~30KB from bundles using many icons

2. **Image optimization** (10 min)
   - Use `next/image` for all images
   - Add `quality={75}` to large images
   - Save 20-40% on image sizes

3. **Lazy load animations** (15 min)
   - Wrap framer-motion components in `dynamic()`
   - Only load when that section is visible
   - Saves ~50KB from initial bundle

4. **Remove dev dependencies** (5 min)
   - Move `leva` to devDependencies only
   - Saves ~20KB from production

## Advanced Optimizations (More Complex)

1. **Route-specific bundles** - Organize code by route
2. **Server components** - Move logic to server (if applicable)
3. **Streaming** - Stream content as it loads
4. **Service worker** - Cache assets for offline use
5. **WebP images** - Use modern image formats

## Related Resources

- [Next.js Performance](https://nextjs.org/learn/seo/web-performance)
- [React Performance](https://react.dev/reference/react/memo)
- [Web Vitals](https://web.dev/vitals/)
- [Bundle Analysis](https://github.com/vercel/next.js/tree/canary/packages/next-bundle-analyzer)

## Next Steps

1. Implement lazy loading for three.js components
2. Optimize icon imports
3. Add memoization to expensive components
4. Audit unused dependencies
5. Run Lighthouse audit
6. Document performance metrics
