# Simple Auth Testing Guide

## Phase 1: Testing New Auth System

**Status:** New auth system built, running in parallel with old system

**Test URL:** http://localhost:3000/login-simple

## What Was Built

### 1. Database Tables ✅
```sql
simple_users      -- New users table (every signup = new account)
auth_methods      -- Login methods + connected accounts
```

### 2. Auth Utilities ✅
```typescript
lib/auth/simple-auth.ts     -- findOrCreateUser, connectAccount, etc.
lib/auth/oauth-exchange.ts  -- Google, GitHub, Discord OAuth exchange
```

### 3. New Callback Handler ✅
```typescript
app/auth/simple-callback/route.ts  -- Handles OAuth callbacks
```

### 4. Test Login Page ✅
```typescript
app/login-simple/page.tsx  -- Test the new auth flow
```

## Testing Steps

### Test 1: Google Login (New User)

1. Go to http://localhost:3000/login-simple
2. Select **Google**
3. Click **"Login with Google"**
4. Choose Google account
5. **Expected:**
   - Redirects to `/user/account`
   - New entry in `simple_users` table
   - New entry in `auth_methods` with `purpose='login'`
   - Supabase session created

**Verify:**
```sql
SELECT * FROM simple_users ORDER BY created_at DESC LIMIT 1;
SELECT * FROM auth_methods WHERE purpose = 'login' ORDER BY created_at DESC LIMIT 1;
```

### Test 2: Google Login (Existing User)

1. Logout
2. Go to http://localhost:3000/login-simple
3. Login with **same Google account**
4. **Expected:**
   - Finds existing user
   - Logs in (no new user created)
   - Same user ID as before

### Test 3: GitHub Login (Same Human, Different Account)

1. Logout
2. Go to http://localhost:3000/login-simple
3. Select **GitHub**
4. Login with GitHub
5. **Expected:**
   - Creates **NEW** user (even if same email as Google)
   - Separate `simple_users` entry
   - Separate `auth_methods` entry
   - **This is correct behavior!** No merging.

**Verify:**
```sql
SELECT id, email, created_at FROM simple_users ORDER BY created_at DESC LIMIT 2;
-- Should see 2 users, possibly same email
```

### Test 4: Connect Account Flow

**Setup:** Login with Google first

1. Login with Google at `/login-simple`
2. Once logged in, go to account page
3. Click "Connect GitHub" (use old UI for now)
4. **Expected:**
   - GitHub links to current user
   - New `auth_methods` entry with `purpose='connected'`
   - Same `user_id` as Google login method

**Verify:**
```sql
SELECT user_id, provider, purpose FROM auth_methods WHERE user_id = (
  SELECT user_id FROM auth_methods WHERE provider = 'google' LIMIT 1
);
-- Should see:
-- google   | login
-- github   | connected
```

## Current Limitations

### Login Flow
- ✅ Google OAuth works
- ⚠️ Supabase session creation needs refinement
- ⚠️ Need to test token storage for GitHub

### Connect Flow
- ⚠️ Not yet implemented in UI
- ⚠️ Need to create `/api/user/connect/[provider]` endpoint
- ⚠️ Need to update account page to use new tables

### Still Using Old System
- ❌ Main `/login` page uses old auth
- ❌ Account page reads from `unified_users` / `user_identities`
- ❌ OAuth callbacks go to old `/auth/callback`

## Known Issues

### Issue 1: Supabase Session Creation
**Problem:** Using `signInWithPassword` with synthetic email

**Current approach:**
```typescript
email: `${simpleUser.id}@simple-auth.b0ase.internal`
password: supabaseUserId
```

**Better approach:** Use Supabase admin API to create session directly

### Issue 2: Provider param not in callback URL
**Problem:** OAuth redirect loses `provider` param

**Fix:** Use `state` parameter to pass provider through OAuth flow

## Next Steps

### Phase 1 Completion
- [x] Create tables
- [x] Create utilities
- [x] Create callback handler
- [x] Create test login page
- [ ] Fix Supabase session creation
- [ ] Fix provider parameter passing
- [ ] Test all providers (Google, GitHub, Discord)

### Phase 2: Connect Flow
- [ ] Create `/api/user/connect/[provider]/route.ts`
- [ ] Update account page to show connected accounts from `auth_methods`
- [ ] Add "Connect GitHub" / "Connect Discord" buttons
- [ ] Test connect flow

### Phase 3: Migration
- [ ] Migrate existing users from old tables
- [ ] Test migration script
- [ ] Backup database

### Phase 4: Switch Over
- [ ] Rename old callback to `/auth/callback-old`
- [ ] Rename simple-callback to `/auth/callback`
- [ ] Update OAuth app redirect URLs
- [ ] Update main login page to use simple auth
- [ ] Remove old code

## Debugging

### Check tables
```sql
-- Simple users
SELECT id, email, display_name, created_at FROM simple_users ORDER BY created_at DESC;

-- Auth methods
SELECT user_id, provider, purpose, provider_email, created_at
FROM auth_methods
ORDER BY created_at DESC;

-- Connected accounts
SELECT u.email, am.provider, am.purpose, am.oauth_token IS NOT NULL as has_token
FROM simple_users u
JOIN auth_methods am ON am.user_id = u.id
WHERE am.purpose = 'connected';
```

### Check logs
```bash
# Watch callback logs
pnpm dev | grep "Simple auth callback"

# Watch auth logs
pnpm dev | grep "findOrCreateUser\|connectAccount"
```

### Common Errors

**Error:** "Missing code or provider"
- **Cause:** OAuth redirect doesn't include `provider` param
- **Fix:** Use `state` parameter in OAuth URL

**Error:** "Sign in failed"
- **Cause:** Supabase user doesn't exist yet
- **Fix:** Use admin API to create user first

**Error:** "User not found" (connect flow)
- **Cause:** `getUserBySupabaseUid` returns null
- **Fix:** Ensure Supabase → simple_users mapping exists

## Success Criteria

✅ Can login with Google (creates new user)
✅ Can login again (finds existing user)
✅ Can login with GitHub (creates separate user, no merge)
⚠️ Can connect GitHub to Google account
⚠️ GitHub repos page uses connected account token
⚠️ No collision errors
⚠️ Clear ownership of accounts

---

**Status:** Phase 1 in progress
**Next:** Fix session creation and test all providers
