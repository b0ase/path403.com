# Discord Connection Fix

## Issue
Discord OAuth worked (authentication successful), but the connection didn't show up in the Connections tab until you logged out and back in.

## Root Causes

### 1. Database Constraint Issue
**Problem:** The `user_identities` table had a `UNIQUE(provider, provider_user_id)` constraint that prevented users from linking multiple OAuth providers.

**Example:**
- User logs in with Google → Creates identity: `(provider='supabase', provider_user_id='123')`
- User connects Discord → Tries to create: `(provider='supabase', provider_user_id='123')`
- **CONFLICT!** Same `provider` and `provider_user_id`, violates UNIQUE constraint

**Fix:** Changed constraint to `UNIQUE(provider, provider_user_id, oauth_provider)` to allow multiple OAuth providers per user.

### 2. Auth Callback Not Creating New Identities
**Problem:** The `/auth/callback` route only updated existing identities for GitHub (to store tokens), but completely ignored Discord and other OAuth providers.

**Code before:**
```typescript
if (existingSupabaseIdentity) {
  // Only update if GitHub with token
  if (supabaseUser.app_metadata?.provider === 'github' && githubAccessToken) {
    // Update...
  }
  // Discord connection completely ignored! ❌
}
```

**Fix:** Check if the specific OAuth provider is already linked, and create a new identity record if not.

**Code after:**
```typescript
// Check for THIS specific OAuth provider
const { data: existingOAuthIdentity } = await supabase
  .from('user_identities')
  .eq('provider', 'supabase')
  .eq('provider_user_id', supabaseUser.id)
  .eq('oauth_provider', currentOAuthProvider)
  .maybeSingle()

// Check for ANY existing identity to get unified_user_id
const { data: anyExistingIdentity } = await supabase
  .from('user_identities')
  .eq('provider', 'supabase')
  .eq('provider_user_id', supabaseUser.id)
  .maybeSingle()

if (existingOAuthIdentity) {
  // Update this provider
} else if (anyExistingIdentity) {
  // Create NEW identity for this OAuth provider ✅
  await supabase.from('user_identities').insert({
    unified_user_id: anyExistingIdentity.unified_user_id,
    provider: 'supabase',
    provider_user_id: supabaseUser.id,
    oauth_provider: currentOAuthProvider,
    // ...
  })
}
```

### 3. Frontend State Not Refreshing
**Problem:** After OAuth callback, the page redirected to `/user/account?tab=connections`, but the `linkedIdentities` state was stale (still showed old data from initial page load).

**Why:** The identities were fetched once on mount, and never refetched after navigation.

**Fix:** Added auto-refresh when switching to the connections tab.

```typescript
// Refresh identities function
const refreshIdentities = async () => {
  const res = await fetch('/api/user/unified');
  if (res.ok) {
    const data = await res.json();
    setLinkedIdentities(data.identities || []);
  }
};

// Auto-refresh when viewing connections tab
useEffect(() => {
  if (activeTab === 'connections' && authChecked) {
    refreshIdentities();
  }
}, [activeTab]);
```

### 4. Redirect Didn't Go to Connections Tab
**Problem:** Discord OAuth redirected to `/auth/callback` which then redirected to `/user/account?tab=account` (not the connections tab).

**Fix:** Updated `linkDiscord()` to include `?next=/user/account?tab=connections` in the redirect URL.

```typescript
redirectTo: `${window.location.origin}/auth/callback?next=/user/account?tab=connections`
```

## Files Changed

1. **supabase/migrations/20260117000000_fix_multiple_oauth_providers.sql**
   - Dropped old `UNIQUE(provider, provider_user_id)` constraint
   - Added new `UNIQUE(provider, provider_user_id, oauth_provider)` constraint

2. **app/auth/callback/route.ts** (lines 128-208)
   - Check for specific OAuth provider before creating/updating
   - Create new identity records for each OAuth provider
   - Prevent duplicates while allowing multiple providers

3. **components/Providers.tsx** (lines 299-337)
   - Updated `linkDiscord()` redirect to connections tab

4. **app/user/account/page.tsx** (lines 587-642)
   - Added `refreshIdentities()` function
   - Auto-refresh when switching to connections tab

5. **scripts/apply-migration-to-server.sh**
   - Script to apply migration to Hetzner server

## How It Works Now

### User Flow
1. User logs in with **Google** (first time)
   - Creates identity: `(provider='supabase', provider_user_id='abc123', oauth_provider='google')`

2. User clicks "Connect Discord"
   - Redirects to Discord OAuth
   - Discord redirects to `/auth/callback?code=...&next=/user/account?tab=connections`
   - Callback creates **new** identity: `(provider='supabase', provider_user_id='abc123', oauth_provider='discord')`
   - Redirects to `/user/account?tab=connections`
   - Connections tab auto-refreshes identities
   - Discord shows as connected ✅

3. User can connect **GitHub**, **LinkedIn**, **Twitter**
   - Each creates a separate identity record
   - All linked to the same `unified_user_id`

### Database Structure
```
unified_users
  id: 'user-uuid-123'
  display_name: 'John Doe'

user_identities
  id: 'identity-1', unified_user_id: 'user-uuid-123', provider: 'supabase', provider_user_id: 'abc123', oauth_provider: 'google'
  id: 'identity-2', unified_user_id: 'user-uuid-123', provider: 'supabase', provider_user_id: 'abc123', oauth_provider: 'discord'
  id: 'identity-3', unified_user_id: 'user-uuid-123', provider: 'supabase', provider_user_id: 'abc123', oauth_provider: 'github'
```

## Testing

1. Go to http://localhost:3000
2. Log in with Google (if not already)
3. Go to `/user/account?tab=connections`
4. Click "Connect Discord"
5. Authorize on Discord
6. **Expected:** Immediately redirected back with Discord showing green badge
7. **Previously:** Needed to log out and log back in

## Related Issues

This fix also enables:
- ✅ Multiple OAuth providers per user
- ✅ Proper GitHub OAuth with token storage
- ✅ LinkedIn connections
- ✅ Any future OAuth providers

## Migration Notes

**Production:** Migration applied to Hetzner server via `./scripts/apply-migration-to-server.sh`

**Local:** Run `pnpm supabase db push` (may timeout, use server script instead)

**Vercel/Cloud:** Will need to apply migration via Supabase dashboard or CLI

---

**Fixed:** 2026-01-17
**Author:** Claude Code
**Issue:** Discord connections not appearing until logout/login
