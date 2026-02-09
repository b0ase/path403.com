# Authentication Troubleshooting Guide

## Current Issues (Updated 2025-06-27)

### Issue: Live Site PKCE Error
**Error:** `invalid request: both auth code and code verifier should be non-empty`

**Symptoms:**
- Users redirected back to login after Google OAuth
- Error appears in URL parameters
- Authentication fails at callback

**Root Cause:** PKCE (Proof Key for Code Exchange) flow is not completing properly

**Solutions Applied:**
1. Enhanced Supabase client configuration with proper PKCE settings
2. Improved error handling in auth callback route
3. Added authentication state clearing before new sign-in attempts
4. Enhanced logging for better debugging

### Issue: Local Development Rate Limiting
**Error:** `Request rate limit reached`

**Symptoms:**
- Google OAuth fails locally
- Too many requests message
- Authentication blocked

**Root Cause:** Supabase/Google OAuth rate limiting in development

**Solutions Applied:**
1. Reduced realtime connection frequency
2. Added proper error handling for rate limit scenarios
3. Implemented auth state clearing to prevent repeated failed attempts
4. Added delay before retry attempts

## Quick Fixes Implemented

### 1. Enhanced Login Page Error Handling ✅
- Added URL parameter parsing for auth errors
- Specific error messages for different failure types
- "Clear Auth State" button for recovery

### 2. Improved Supabase Client Configuration ✅
- Enhanced PKCE flow configuration
- Added proper storage key management
- Reduced realtime connection overhead
- Better error retry logic

### 3. Enhanced Auth Callback Route ✅
- Improved PKCE error detection and handling
- Better logging for debugging
- Specific error messages for different failure scenarios
- Enhanced session validation

### 4. Enhanced Debug Endpoint ✅
- More detailed configuration reporting
- Issue detection and recommendations
- Better error diagnostics

## Testing Your Fixes

### For Live Site (PKCE Issues):
1. **Clear browser data** (cookies, localStorage, cache)
2. **Test the debug endpoint:** `https://www.b0ase.com/api/debug/auth`
3. **Try Google sign-in** from clean browser state
4. **Check console logs** during authentication flow
5. **If error persists:** Use "Clear Auth State" button on login page

### For Local Development (Rate Limiting):
1. **Restart development server** to clear connection pool
2. **Wait 5-10 minutes** before retrying if rate limited
3. **Use incognito mode** for testing to avoid cached state
4. **Check Supabase dashboard** for rate limit indicators
5. **Consider using email/password auth** for development

## Additional Recommendations

### Production Configuration
1. **Verify Supabase Settings:**
   - Site URL: `https://b0ase.com`
   - Redirect URLs: `https://b0ase.com/auth/callback`
   - OAuth provider settings match production domain

2. **Google OAuth Configuration:**
   - Authorized JavaScript origins: `https://b0ase.com`
   - Authorized redirect URIs: `https://b0ase.com/auth/callback`

### Development Environment
1. **Use consistent localhost URLs:**
   - Always use `http://localhost:3000` (not 127.0.0.1)
   - Configure all OAuth providers with this URL
   - Ensure Supabase redirect URLs include localhost

2. **Rate Limiting Prevention:**
   - Don't spam auth requests during development
   - Use email/password auth for testing when possible
   - Clear auth state between tests

## Monitoring and Debugging

### Check These When Issues Occur:
1. **Debug endpoint:** `/api/debug/auth` for configuration status
2. **Browser console** for detailed error messages
3. **Supabase logs** in dashboard for server-side errors
4. **Network tab** for failed requests during auth flow

### Common Error Patterns:
- `code verifier` errors → Clear auth state and retry
- `rate limit` errors → Wait and retry, check Supabase dashboard
- `invalid_grant` errors → Check OAuth provider configuration
- `session_expired` errors → Clear auth state and sign in again

## Emergency Recovery

If authentication is completely broken:
1. **Clear all browser data** for the domain
2. **Use the "Clear Auth State" button** on login page
3. **Try email/password authentication** as fallback
4. **Check environment variables** via debug endpoint
5. **Verify Supabase project status** in dashboard

## Issue: Auth works locally but fails in production

This guide helps you diagnose and fix common authentication issues when deploying to production.

## Quick Checklist

### 1. Environment Variables ✅

Ensure these environment variables are set in your production environment:

**Required Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**How to verify:**
- Visit `/api/debug/auth` on your production site
- Check that all environment variables show as "Set"
- Verify the Supabase URL preview matches your project

### 2. Supabase Configuration ✅

**Authentication Settings in Supabase Dashboard:**

1. Go to Authentication → Settings in your Supabase dashboard
2. Set **Site URL** to your production domain:
   ```
   https://your-domain.com
   ```

3. Add **Redirect URLs** for all authentication flows:
   ```
   https://your-domain.com/auth/callback
   https://your-domain.com/login
   https://your-domain.com/
   ```

4. **Additional Redirect URLs** (if using OAuth):
   ```
   https://your-domain.com/auth/callback
   https://your-domain.vercel.app/auth/callback (if on Vercel)
   ```

### 3. OAuth Provider Configuration ✅

If using Google, GitHub, or other OAuth providers:

**Google OAuth:**
- Add your production domain to "Authorized JavaScript origins"
- Add callback URL to "Authorized redirect URIs"

**GitHub OAuth:**
- Update "Authorization callback URL" in GitHub app settings
- Ensure "Homepage URL" matches your production domain

### 4. Deployment Platform Settings ✅

**Vercel:**
- Environment variables are set in Project Settings → Environment Variables
- Redeploy after changing environment variables
- Check Function Logs for auth errors

**Netlify:**
- Set environment variables in Site settings → Environment variables
- Trigger a new deployment after changes

**Other platforms:**
- Ensure environment variables are properly set
- Check that build process includes all dependencies

## Common Issues and Solutions

### Issue 1: "Missing environment variables"

**Symptoms:**
- Console errors about missing SUPABASE_URL or ANON_KEY
- AuthErrorBoundary component appears

**Solution:**
1. Verify environment variables are set in deployment platform
2. Redeploy the application after setting variables
3. Check variable names match exactly (case-sensitive)

### Issue 2: "Authentication error: exchangeCodeForSession failed"

**Symptoms:**
- Users redirected back to login after OAuth
- Console shows exchange errors

**Solution:**
1. Check Supabase redirect URLs include your production domain
2. Verify OAuth provider callback URLs are correct
3. Ensure Site URL is set to production domain

### Issue 3: "Session check timeout"

**Symptoms:**
- Long loading times on protected routes
- Middleware timeout errors
- Users can't access authenticated pages

**Solution:**
1. Check network connectivity to Supabase
2. Verify Supabase project is not paused/suspended
3. Check if you're hitting rate limits
4. Try increasing timeout in middleware (already done in fix)

### Issue 4: "Infinite redirect loops"

**Symptoms:**
- Browser keeps redirecting between pages
- URL keeps changing but page doesn't load

**Solution:**
1. Check middleware matcher configuration
2. Ensure login page is excluded from protected routes
3. Verify callback route is properly excluded

### Issue 5: "PKCE flow errors"

**Symptoms:**
- "Invalid PKCE code verifier" errors
- Authentication fails after OAuth callback

**Solution:**
1. Ensure cookies are enabled in production
2. Check if your domain supports secure cookies (HTTPS)
3. Verify localStorage is available and not blocked

## Advanced Debugging

### 1. Enable Debug Logging

Add this to your production build (temporarily):

```typescript
// In your auth component
console.log('Auth State:', {
  hasSession: !!session,
  environment: process.env.NODE_ENV,
  url: window.location.href,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...'
});
```

### 2. Check Browser Network Tab

1. Open DevTools → Network
2. Try to log in
3. Look for failed requests to Supabase
4. Check response codes and error messages

### 3. Monitor Supabase Logs

1. Go to your Supabase dashboard
2. Navigate to Logs → Auth logs
3. Watch for authentication attempts and errors

### 4. Test Auth Flow Step by Step

1. **Test environment variables:**
   ```bash
   curl https://your-domain.com/api/debug/auth
   ```

2. **Test Supabase connection:**
   - Visit a page with authentication
   - Check browser console for connection errors

3. **Test OAuth flow:**
   - Clear browser cache/cookies
   - Try authentication from incognito mode
   - Monitor network requests during OAuth

## Production-Specific Fixes Applied

The following fixes have been applied to your codebase:

### 1. Enhanced Supabase Client Configuration
- Added production-specific timeout settings
- Improved error handling and fallbacks
- Added proper storage and redirect configurations

### 2. Robust Middleware
- Increased timeout for production environment
- Better error handling for auth failures
- Improved logging for debugging

### 3. Enhanced Auth Callback
- Better error handling and logging
- Proper URL construction for redirects
- Cache-busting for fresh page loads

### 4. Debug Endpoints
- `/api/debug/auth` for environment verification
- Enhanced logging throughout auth flow

## Testing Your Fixes

1. **Deploy your changes** to production
2. **Clear all browser data** (cookies, localStorage, cache)
3. **Test authentication flow** from start to finish
4. **Check console logs** for any remaining errors
5. **Verify redirect URLs** work correctly

## Still Having Issues?

If authentication still doesn't work after these fixes:

1. **Check Supabase project status** - ensure it's not paused
2. **Verify your domain** is properly configured in DNS
3. **Test with different browsers** to rule out browser-specific issues
4. **Check firewall/CDN settings** that might block Supabase requests
5. **Contact Supabase support** if you suspect a platform issue

## Emergency Rollback

If you need to rollback these changes:

1. Revert the commits for the auth fixes
2. Deploy the previous version
3. Check if the issue was introduced by the changes

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Authentication Guide](https://nextjs.org/docs/authentication)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables) 