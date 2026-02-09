# Known Issues - b0ase.com

## 1. HandCash Logout Not Working Properly

**Status**: FIXED
**Severity**: HIGH (affects UX)
**Date Reported**: 2026-01-28
**Date Fixed**: 2026-01-30

### Symptoms
- User logs in with HandCash successfully
- Logs out (button clicked → `/api/auth/logout`)
- Server clears all cookies and redirects to home
- User appears to still be logged in

### Solution Implemented
1. Updated `/api/auth/logout` to redirect to `/?logged_out=true`.
2. Updated `components/Providers.tsx` to listen for `logged_out` parameter and force-clear client-side state (localStorage and React state) to ensure UI reflects logout status immediately.
3. This ensures synchronization between server-side cookie clearing and client-side session state.

---

## 2. Missing Portfolio/Client Project Images (404s)

**Status**: FIXED
**Severity**: MEDIUM (visual issue)
**Date Reported**: 2026-01-28
**Date Fixed**: 2026-01-30

### Symptoms
Multiple 404 errors for portfolio images (AIVJ, AIGF, etc.) and outdated paths in code.

### Solution Implemented
1. Identified standard image location: `/public/images/slugs/`.
2. Updated `lib/data.ts` (Project definitions) to point to standard slug images instead of archived `/clientprojects/` paths.
3. Updated `app/projects/[slug]/page.tsx` and `app/portfolio/[slug]/page.tsx` to use correct video poster images from `/images/slugs/`.
4. Verified existence of video assets and kept valid video paths.
5. Synced image references for `minecraftparty-website`, `oneshotcomics`, `aivj-website`, and `aigirlfriends-website`.
6. Additional fixes applied for: `marina3d`, `lilithtattoo`, `hyperflix`, `tribify`, `senseii`, `bitcoin-file-utility`, `npgx`, `coursekings`, `beauty-queen`, `osinka`, `dns-dex`, `moneybutton-store`, `cashboard`, `zerodice`, `cashhandletoken`. Moved assets to standardized `/images/slugs/` directory.

---

## Next Steps

### Verification
1. Verify HandCash logout flow works as expected (UI clears immediately).
2. Verify all project images load correctly on Portfolio page and Project Detail pages.

