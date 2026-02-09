# GitHub OAuth Setup for Hetzner-Hosted Supabase

## Issue
Your local Supabase instance is exposed at `https://api.b0ase.com`, but the Supabase config was pointing to localhost. This causes GitHub OAuth to fail.

## What I Fixed

### 1. Updated `supabase/config.toml`

Changed:
```toml
site_url = "http://127.0.0.1:3000"
additional_redirect_urls = ["https://127.0.0.1:3000"]
```

To:
```toml
site_url = "https://b0ase.com"
additional_redirect_urls = ["http://localhost:3000", "https://b0ase.com", "https://www.b0ase.com"]
```

And:
```toml
[auth.external.github]
redirect_uri = ""
```

To:
```toml
[auth.external.github]
redirect_uri = "https://api.b0ase.com/auth/v1/callback"
```

## What You Need to Do

### Step 1: Restart Supabase

The config changes require a Supabase restart:

```bash
# Stop Supabase
pnpm supabase stop

# Start Supabase with new config
pnpm supabase start
```

### Step 2: Update GitHub OAuth App Settings

1. Go to https://github.com/settings/developers
2. Find your OAuth App (or create one if you haven't)
3. Update the **Authorization callback URL** to:
   ```
   https://api.b0ase.com/auth/v1/callback
   ```

4. Make sure **Homepage URL** is set to:
   ```
   https://b0ase.com
   ```

5. Click **Update application**

### Step 3: Verify Environment Variables

Make sure your `.env.local` has the GitHub credentials:

```bash
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

You can find these in your GitHub OAuth App settings.

### Step 4: Test the Connection

1. Navigate to https://b0ase.com/user/account?tab=repos
2. Click "Connect GitHub"
3. You should be redirected to GitHub
4. After authorizing, you'll be redirected back with your repos visible

## Expected OAuth Flow

```
User clicks "Connect GitHub" on b0ase.com
  ↓
Redirects to GitHub OAuth:
  https://github.com/login/oauth/authorize?client_id=...
  ↓
User authorizes on GitHub
  ↓
GitHub redirects to callback:
  https://api.b0ase.com/auth/v1/callback?code=...
  ↓
Supabase exchanges code for token
  ↓
Redirects to your Next.js callback:
  https://b0ase.com/auth/callback?code=...
  ↓
Next.js stores token in database
  ↓
Redirects to repos page:
  https://b0ase.com/user/account?tab=repos
```

## Troubleshooting

### Issue: "Redirect URI mismatch" error from GitHub

**Fix:** The callback URL in your GitHub OAuth App doesn't match. It must be EXACTLY:
```
https://api.b0ase.com/auth/v1/callback
```

### Issue: "Invalid redirect_uri" from Supabase

**Fix:** Make sure you restarted Supabase after changing config.toml:
```bash
pnpm supabase stop && pnpm supabase start
```

### Issue: Still seeing "Unauthorized" error

**Fix:**
1. Check browser console for errors
2. Check Supabase logs:
   ```bash
   pnpm supabase logs auth
   ```
3. Run diagnostic script:
   ```bash
   npx tsx scripts/debug-github-oauth.ts
   ```

## Important Notes

- The callback URL points to **Supabase** (`api.b0ase.com`), NOT your Next.js app
- Supabase handles the OAuth flow and then redirects to your app's `/auth/callback` route
- Your app's callback route extracts the token and stores it in the database
- The token is used by `/api/user/github/repos` to fetch repositories

## Verification Checklist

- [ ] Updated `supabase/config.toml` (already done)
- [ ] Restarted Supabase locally
- [ ] Updated GitHub OAuth App callback URL to `https://api.b0ase.com/auth/v1/callback`
- [ ] Verified `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `.env.local`
- [ ] Tested connection flow from https://b0ase.com/user/account?tab=repos
- [ ] Confirmed repos are loading after connection

## Need Help?

If you're still having issues:

1. Check browser console (F12 → Console)
2. Check Supabase auth logs: `pnpm supabase logs auth`
3. Run diagnostic: `npx tsx scripts/debug-github-oauth.ts`
4. Share the error messages

---

**Created:** 2026-01-17
**Issue:** GitHub OAuth callback URL mismatch for Hetzner-hosted Supabase
