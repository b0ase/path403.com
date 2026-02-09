# Discord OAuth Setup

## Quick Check

Your Discord OAuth is configured with:
- **Client ID:** `1459741448864927924`
- **Redirect URI:** `https://api.b0ase.com/auth/v1/callback`

## Verify Discord App Settings

1. Go to https://discord.com/developers/applications
2. Select your application (ID: 1459741448864927924)
3. Go to **OAuth2** in the sidebar
4. Check **Redirects**:

### ✅ Should have:
```
https://api.b0ase.com/auth/v1/callback
```

### ❌ Should NOT have:
```
http://localhost:3000/auth/callback
http://localhost:54321/auth/v1/callback
```

## Common Errors

### Error: `redirect_uri_mismatch`
**Cause:** Redirect URI in Discord app doesn't match what Supabase is sending

**Fix:**
1. Go to Discord Developer Portal
2. OAuth2 → Redirects
3. Add: `https://api.b0ase.com/auth/v1/callback`
4. Save changes

### Error: `unauthorized_client`
**Cause:** Client ID doesn't match or app is not set up correctly

**Fix:**
1. Verify client ID in Discord app matches: `1459741448864927924`
2. Check that OAuth2 is enabled in the app settings

### Error: `access_denied`
**Cause:** User clicked "Cancel" on Discord authorization screen

**Fix:** This is normal - user chose not to connect

### Error: `invalid_request`
**Cause:** Missing required scopes or parameters

**Fix:** Supabase should handle this automatically, but check Discord app has these scopes enabled:
- `identify` (required)
- `email` (optional but recommended)

## Testing Locally vs Production

### Local Development
- Uses Supabase CLI on port 54321
- Redirect: `http://localhost:54321/auth/v1/callback`
- Need separate Discord OAuth app for local dev

### Production (Hetzner)
- Uses Supabase at `https://api.b0ase.com`
- Redirect: `https://api.b0ase.com/auth/v1/callback`
- This is what you're currently configured for

## Debug Steps

1. **Open browser DevTools** (F12)
2. Go to **Console** tab
3. Click "Connect Discord"
4. Look for errors in console

OR

1. **Check Network tab** (F12 → Network)
2. Filter by "auth" or "callback"
3. Look at the redirected URLs
4. Check if there's an `error` parameter

## Manual Test

Open this URL in your browser (while logged in):
```
https://discord.com/oauth2/authorize?client_id=1459741448864927924&redirect_uri=https%3A%2F%2Fapi.b0ase.com%2Fauth%2Fv1%2Fcallback&response_type=code&scope=identify%20email
```

If you see an error about redirect_uri, that confirms the Discord app settings need updating.

## Fix Script

If you need to update the redirect URI on the server:

```bash
# Update Discord redirect URI in server config
ssh hetzner "docker exec supabase-auth env | grep DISCORD"
```

Should show:
```
GOTRUE_EXTERNAL_DISCORD_REDIRECT_URI=https://api.b0ase.com/auth/v1/callback
```
