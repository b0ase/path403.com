# Routing Architecture Guide

**Status:** PROPOSED (0% implemented) - Route group reorganization not started
**Created:** 2026-01-05

## Current Structure

The app has ~50+ top-level routes organized somewhat flat:
```
app/
├── (minimal)/         - Minimal layout pages
├── (public)/          - Public pages
├── admin/             - Admin dashboard
├── auth/              - Authentication
├── api/               - API routes (now with v1)
├── profile/           - User profile
└── [many other features]
```

## Proposed Feature-Based Organization

Instead of feature folders scattered at top-level, group related features:

### Example: User Management
```
app/
├── (user-area)/
│   ├── profile/
│   │   ├── page.tsx           (user profile)
│   │   ├── layout.tsx         (profile layout)
│   │   └── edit/page.tsx      (edit profile)
│   ├── settings/
│   │   ├── page.tsx           (user settings)
│   │   └── privacy/page.tsx
│   └── dashboard/
│       └── page.tsx           (user dashboard)
```

### Example: Admin Features
```
app/
├── (admin)/
│   ├── dashboard/
│   │   └── page.tsx           (admin dashboard)
│   ├── users/
│   │   ├── page.tsx           (user list)
│   │   └── [id]/page.tsx      (user detail)
│   ├── projects/
│   │   ├── page.tsx           (project list)
│   │   └── [id]/page.tsx      (project detail)
│   └── analytics/
│       └── page.tsx           (analytics)
```

### Example: Public Marketing
```
app/
├── (marketing)/
│   ├── page.tsx               (home)
│   ├── about/page.tsx
│   ├── features/page.tsx
│   ├── pricing/page.tsx
│   └── blog/
│       ├── page.tsx           (blog list)
│       └── [slug]/page.tsx    (blog post)
```

## Migration Strategy

**Phase 4 (Current):** Document the approach
**Phase 5:** Begin gradual migration
**Phase 6+:** Complete reorganization

### Step 1: Create New Structure (Non-Disruptive)
```bash
# Create new feature-based folders
mkdir -p app/(user-area)/{profile,settings,dashboard}
mkdir -p app/(admin)/{dashboard,users,projects}
mkdir -p app/(marketing)/{blog}

# Copy/recreate pages
cp app/profile/page.tsx app/(user-area)/profile/page.tsx
```

### Step 2: Update Imports
Update components to import from new locations:
```typescript
// OLD:
import ProfilePage from '@/app/profile/page'

// NEW:
import ProfilePage from '@/app/(user-area)/profile/page'
```

### Step 3: Test Thoroughly
- Verify all routes still work
- Check navigation links
- Ensure API routes still resolve

### Step 4: Redirect Old Routes
Add redirects for SEO:
```typescript
// app/profile/page.tsx
import { redirect } from 'next/navigation'

export default function OldProfile() {
  redirect('/(user-area)/profile')
}
```

### Step 5: Remove Old Routes
After sufficient time (6+ months):
```bash
rm -rf app/profile
rm -rf app/admin  # if moved to (admin)
```

## Layout Groups

Use layout groups `()` to organize without affecting URLs:

### Minimal Layout Group
```
app/(minimal)/
├── layout.tsx           (minimal navbar, footer)
├── skills/page.tsx      (URL: /skills)
└── work/page.tsx        (URL: /work)
```

### Public Layout Group
```
app/(public)/
├── layout.tsx           (public navbar, footer)
├── page.tsx             (URL: /)
└── about/page.tsx       (URL: /about)
```

### Admin Layout Group
```
app/(admin)/
├── layout.tsx           (admin sidebar, header)
├── dashboard/page.tsx   (URL: /dashboard)
└── users/page.tsx       (URL: /users)
```

## API Route Organization

Already using `/api/v1` structure:
```
app/api/
├── v1/                  (versioned API)
│   ├── auth/route.ts
│   ├── projects/route.ts
│   ├── users/route.ts
│   └── video/route.ts
└── [legacy routes]      (to be deprecated)
```

## Benefits of Organization

✅ **Clarity** - Easy to find related code
✅ **Scalability** - Easy to add new features
✅ **Maintainability** - Features grouped logically
✅ **SEO** - Proper URL structure with layout groups
✅ **Performance** - Can organize middleware per group

## Naming Conventions

### Route Groups (in parentheses)
- `(auth)` - Authentication pages
- `(admin)` - Admin area
- `(user-area)` - User dashboard area
- `(marketing)` - Public marketing pages
- `(dashboard)` - User dashboard

### Filenames
- `page.tsx` - The actual page
- `layout.tsx` - Layout for this segment
- `error.tsx` - Error boundary
- `loading.tsx` - Loading UI
- `not-found.tsx` - 404 page

### Dynamic Routes
- `[id]` - Single value parameter
- `[...slug]` - Catch-all segment
- `[[...optional]]` - Optional catch-all

## Current Route Audit

**Public Routes (No Auth):**
- `/` (home)
- `/about`, `/careers`, `/contact`
- `/features`, `/pricing`
- `/downloads`, `/resume`
- `/blog` (if exists)

**Authenticated Routes:**
- `/profile` → move to `/(user-area)/profile`
- `/dashboard` → move to `/(user-area)/dashboard`
- `/projects` → move to `/(user-area)/projects`
- `/teams` → move to `/(user-area)/teams`

**Admin Routes:**
- `/admin/*` → move to `/(admin)/*`

**Developer Routes:**
- `/api/*` → use `/api/v1/*` (done)

## Tools & Commands

```bash
# Find all routes
find app -name "page.tsx" -o -name "layout.tsx" | sort

# Count routes
find app -name "page.tsx" | wc -l

# Find routes without layouts
find app -name "page.tsx" -exec dirname {} \; | while read dir; do
  [ ! -f "$dir/layout.tsx" ] && echo "$dir"
done
```

## Next Steps

1. **Review** - Confirm proposed organization
2. **Create** - Build new structure with layout groups
3. **Redirect** - Add old→new redirects
4. **Migrate** - Gradually move imports
5. **Test** - Verify all routes work
6. **Clean** - Remove old route files

## Links

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
