# GitHub OAuth Setup & Troubleshooting

## Overview

The GitHub OAuth integration allows users to connect their GitHub accounts to tokenize their repositories on BSV.

## Architecture

```
User clicks "Connect GitHub"
  ↓
linkGithub() in Providers.tsx
  ↓
Supabase auth.linkIdentity() or signInWithOAuth()
  ↓
Redirect to GitHub OAuth
  ↓
GitHub redirects back to /auth/callback
  ↓
Callback extracts provider_token and saves to user_identities table
  ↓
User redirected to /user/account?tab=repos
  ↓
ReposTab fetches /api/user/github/repos
  ↓
API uses token from user_identities to fetch GitHub repos
```

## Prerequisites

### 1. Supabase Dashboard Configuration

**CRITICAL:** GitHub OAuth must be enabled in your Supabase project.

1. Go to your Supabase Dashboard: https://app.supabase.com/project/YOUR_PROJECT_ID
2. Navigate to **Authentication** → **Providers**
3. Find **GitHub** in the list
4. Click to configure GitHub OAuth

### 2. GitHub OAuth App Setup

You need a GitHub OAuth App (or GitHub App) configured:

1. Go to https://github.com/settings/developers
2. Click **OAuth Apps** → **New OAuth App** (or use existing)
3. Configure:
   - **Application name**: b0ase.com (or your app name)
   - **Homepage URL**: `https://b0ase.com` (or your domain)
   - **Authorization callback URL**:
     - Production: `https://YOUR_SUPABASE_URL/auth/v1/callback`
     - Local: `http://localhost:54321/auth/v1/callback` (for Supabase local)
   - **Note:** The callback URL is handled by Supabase, NOT your Next.js app directly
4. After creating, copy:
   - **Client ID**
   - **Client Secret**

### 3. Connect GitHub App to Supabase

Back in Supabase Dashboard → Authentication → Providers → GitHub:

1. Paste your GitHub **Client ID**
2. Paste your GitHub **Client Secret**
3. **IMPORTANT:** Add the following scopes:
   ```
   read:user user:email public_repo
   ```
4. Click **Save**

### 4. Database Migration

Ensure the token storage migration has been applied:

```bash
# Check if migration exists
ls supabase/migrations/*github_token_storage.sql

# If using Supabase local CLI
supabase db push

# If using remote Supabase (dashboard)
# Go to Database → Migrations and check if applied
```

The migration adds these columns to `user_identities`:
- `access_token` (TEXT)
- `refresh_token` (TEXT)
- `token_expires_at` (TIMESTAMP WITH TIME ZONE)

## Testing the Flow

### Step 1: Run Diagnostics

```bash
npx tsx scripts/debug-github-oauth.ts
```

This will check:
- Environment variables
- Current session
- Existing GitHub identities
- Common issues

### Step 2: Test in Browser

1. **Log in** to your app (use any auth method: Google, email, etc.)
2. Go to `/user/account?tab=repos`
3. Click **"Connect GitHub"**
4. **Open Browser DevTools** (F12):
   - **Console tab**: Look for errors
   - **Network tab**: Check the OAuth flow

### Step 3: Expected Flow

When you click "Connect GitHub", you should see:

1. Console log: `No Supabase session, using signInWithOAuth for linking` (if no session) OR redirects immediately
2. Browser navigates to `github.com/login/oauth/authorize?client_id=...`
3. GitHub shows authorization screen
4. After authorizing, redirects to your Supabase callback URL
5. Supabase processes OAuth, then redirects to `/auth/callback?code=...`
6. Your app's `/auth/callback` route:
   - Exchanges code for session
   - Extracts `provider_token` from session data
   - Stores token in `user_identities` table
   - Redirects to `/user/account?tab=repos`
7. Repos page loads and fetches repositories

## Common Issues & Fixes

### Issue 1: "Unauthorized" error when loading repos

**Symptom**: Page shows "Connect GitHub" button even after connecting

**Cause**: GitHub token not stored in database

**Fix**:
1. Check callback logs in terminal (running `pnpm dev`)
2. Look for: `⚠️ WARNING: GitHub OAuth succeeded but no provider_token found`
3. If you see this, the issue is that Supabase isn't returning the `provider_token`

**Solution**:
- Verify scopes in Supabase Dashboard include `read:user user:email public_repo`
- Check that "Request refresh token" is enabled in Supabase GitHub config
- Re-save the GitHub provider configuration in Supabase Dashboard

### Issue 2: Redirect loop or "no_code" error

**Symptom**: Keeps redirecting back to login or shows error

**Cause**: OAuth callback URL mismatch

**Fix**:
1. Check GitHub App settings → Authorization callback URL
2. Should be: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
3. NOT: `http://localhost:3000/auth/callback` (this is wrong!)

### Issue 3: "GitHub not connected" error from API

**Symptom**: API returns 400 with "GitHub not connected" message

**Cause**: No token found in `user_identities` table for this user

**Debug**:
```sql
-- Check user_identities table
SELECT
  unified_user_id,
  provider,
  oauth_provider,
  provider_handle,
  access_token IS NOT NULL as has_token,
  token_expires_at
FROM user_identities
WHERE oauth_provider = 'github';
```

**Fix**:
- If no records found: User hasn't connected GitHub yet
- If record found but `access_token` is NULL: Token wasn't stored properly (see Issue 1)
- If token is expired: Need to implement token refresh (TODO in code)

### Issue 4: "Failed to fetch repositories from GitHub" with 401

**Symptom**: API call to GitHub fails with 401 Unauthorized

**Cause**: Token is invalid or expired

**Fix**:
1. Disconnect and reconnect GitHub
2. Check token in database:
   ```sql
   SELECT token_expires_at FROM user_identities WHERE oauth_provider = 'github';
   ```
3. If expired, implement token refresh or prompt user to reconnect

### Issue 5: Button does nothing when clicked

**Symptom**: Click "Connect GitHub", nothing happens

**Cause**: JavaScript error or linkGithub function not defined

**Fix**:
1. Open browser console (F12)
2. Look for errors like: `linkGithub is not a function`
3. Check if `useAuth()` hook is working
4. Verify `<AuthProvider>` wraps the component tree in `app/layout.tsx`

## Manual Testing Checklist

- [ ] GitHub OAuth provider configured in Supabase Dashboard
- [ ] GitHub OAuth App created with correct callback URL
- [ ] Client ID and Secret added to Supabase
- [ ] Scopes include: `read:user user:email public_repo`
- [ ] Database migration applied (token columns exist)
- [ ] User logged in to app
- [ ] Navigate to `/user/account?tab=repos`
- [ ] Click "Connect GitHub" button
- [ ] Browser redirects to GitHub
- [ ] Authorize app on GitHub
- [ ] Redirected back to app
- [ ] Repos page loads without "Connect GitHub" button
- [ ] Repositories list appears
- [ ] No console errors

## Debugging Commands

```bash
# Run diagnostic script
npx tsx scripts/debug-github-oauth.ts

# Check database for tokens
# (Use Supabase Studio or psql)

# Watch callback logs
pnpm dev | grep -i github

# Test API endpoint
curl http://localhost:3000/api/user/github/repos \
  -H "Cookie: sb-...-auth-token=..." \
  | jq
```

## Related Files

- `/components/Providers.tsx` - linkGithub() function (lines 339-379)
- `/app/auth/callback/route.ts` - OAuth callback handler
- `/app/api/user/github/repos/route.ts` - Repos API endpoint
- `/lib/github-token.ts` - Token retrieval utilities
- `/app/user/account/page.tsx` - ReposTab component (lines 3806+)
- `/supabase/migrations/20260116000000_add_github_token_storage.sql` - Token columns

## Support

If you're still having issues:

1. Run the diagnostic script and paste output
2. Check browser console for errors
3. Check server logs (`pnpm dev` output)
4. Verify Supabase Dashboard → Authentication → Providers → GitHub is enabled
5. Check GitHub App settings → Callback URL matches Supabase URL

---

**Last Updated**: 2026-01-17
**Author**: b0ase team
