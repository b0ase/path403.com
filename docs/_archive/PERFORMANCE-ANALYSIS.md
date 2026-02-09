# Performance Analysis: b0ase.com Development Load Times

## Executive Summary

The site is experiencing slow development load times due to a combination of factors: heavy middleware on every request, deeply nested providers in the root layout that all initialize on every page, large dependencies, and a massive codebase (263 pages, 90 components).

---

## Key Findings

### 1. Middleware Runs Auth Check on EVERY Request

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

---

### 2. Root Layout Provider Hell (7+ Nested Providers)

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

---

### 3. Supabase Client Created at Import Time

**File:** `lib/supabase/client.ts`

```typescript
export const supabase = createClient();  // Created at import time!
```

This means importing this file anywhere triggers Supabase initialization.

---

### 4. Massive Dependencies

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

---

### 5. Large Public Assets

**public folder: 859MB**

This doesn't directly affect development compilation, but file watching in some setups can be impacted.

---

### 6. Huge Codebase

- **263 pages** in `app/` directory
- **90 components** in `components/` directory
- **863 lines** in `globals.css`

Next.js dev server needs to track all of these for HMR.

---

### 7. Turbopack Configuration Issues

**File:** `next.config.js`

```javascript
turbopack: {},  // Empty config - not optimized
webpack: (config) => {
  // Custom webpack config won't apply when using --turbo
}
```

The webpack optimizations (splitChunks for Three.js, Supabase, etc.) are ignored when running `npm run dev` which uses `--turbo`.

---

## Recommendations

### Immediate Wins (High Impact, Low Effort)

#### 1. Narrow Middleware Matcher
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

#### 2. Lazy-Load Wallet Provider
Most pages don't need BSV wallet. Dynamic import it:

```typescript
const YoursWalletProvider = dynamic(
  () => import('@/lib/context/YoursWalletContext').then(m => m.YoursWalletProvider),
  { ssr: false }
);
```

Or move it to only the pages that need it (mint, wallet pages).

#### 3. Remove Static Supabase Export
In `lib/supabase/client.ts`, remove:
```typescript
export const supabase = createClient();  // DELETE THIS
```

Only export the function, create client when needed.

#### 4. Split Root Layout
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

---

### Medium-Term Improvements

#### 5. Dynamic Import Heavy Components
```typescript
const NavbarWithMusic = dynamic(() => import('./NavbarWithMusic'), {
  ssr: false,
  loading: () => <div className="h-[160px]" />
});
```

#### 6. Defer Auth Check
Instead of checking auth in middleware for every request, check in components that need it:

```typescript
// In protected page components
const { user, loading } = useAuth();
if (!loading && !user) redirect('/');
```

#### 7. Code Split Heavy Libraries
For Three.js, only import on pages that use it:
```typescript
const ThreeCanvas = dynamic(() => import('@/components/three/Canvas'), {
  ssr: false
});
```

#### 8. Consider Removing Unused Dependencies
Run `npx knip` to identify unused dependencies. The `node_modules/.ignored/` folder suggests some were already flagged.

---

### Architectural Changes (Longer Term)

#### 9. Remove Turbopack or Fix Config
Either:
- Remove `--turbo` from `npm run dev` to use webpack with your optimizations
- Or properly configure turbopack in `next.config.js`

#### 10. Consider Module Federation
For very large apps, consider splitting into separate deployable units.

#### 11. Move to Server Components
Many providers could be server components or moved to specific route groups. The music player, wallet, and theme providers don't need to wrap every page.

---

## Quick Test

To verify middleware is the issue, temporarily comment out the Supabase auth check:

```typescript
// const { data: { user } } = await supabase.auth.getUser();
const user = null;
```

If pages load significantly faster, middleware is the primary bottleneck.

---

## Priority Order

1. **Narrow middleware matcher** (5 min fix, biggest impact)
2. **Remove static Supabase export** (5 min fix)
3. **Split layouts by route group** (30 min)
4. **Dynamic import YoursWalletProvider** (10 min)
5. **Dynamic import NavbarWithMusic** (10 min)
6. **Review and remove unused dependencies** (1 hour)

---

## Metrics to Track

After each change, measure:
- Time from `npm run dev` to "Ready" message
- Time to load `/studio` page cold
- Time to navigate between pages (HMR)

Use browser DevTools Network tab to see which resources are slow.
