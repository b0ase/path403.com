# Subdomain & Middleware Notes

## Current Status (Jan 2026)

### proxy.ts vs middleware.ts

**DO NOT rename `proxy.ts` to `middleware.ts`**

The file was originally `middleware.ts` but was renamed to `proxy.ts` due to deprecation warnings. The current setup works and should not be changed without careful testing.

The `proxy.ts` file contains:
- Subdomain detection logic (e.g., `kintsugi.b0ase.com`)
- Route rewriting for subdomains
- Auth checks for protected routes

### Subdomain Routing Issue

**Problem**: Users hitting subdomains like `kintsugi.b0ase.com` may experience 404 errors for most routes because:
1. The subdomain routing in `proxy.ts` may not be properly connected as Next.js middleware
2. Vercel may not be configured to accept wildcard subdomains
3. DNS may not have the required subdomain records

**Current Solution**: All links should point to main domain paths:
- Use `/kintsugi` instead of `https://kintsugi.b0ase.com`
- Use `https://www.b0ase.com/kintsugi` for absolute URLs

### To Enable Subdomain Routing (Future)

If you want to enable subdomains properly:

1. **Vercel Configuration**
   - Add wildcard domain `*.b0ase.com` in Vercel project settings
   - Or add specific subdomain `kintsugi.b0ase.com`

2. **DNS Configuration**
   - Add wildcard A record: `*.b0ase.com` → Vercel IP
   - Or add specific CNAME: `kintsugi.b0ase.com` → `cname.vercel-dns.com`

3. **Middleware Connection**
   - Ensure middleware is properly exported and connected
   - Test subdomain routing works before updating links

### Links Updated (Jan 2026)

Removed subdomain links from:
- `app/page.tsx` - Kintsugi button now uses `/kintsugi`
- `lib/data.ts` - Kintsugi liveUrl now uses `www.b0ase.com/kintsugi`

---

## Database Migration Notes

### Shadow Database Issue

Prisma migrations may fail with errors like:
```
The underlying table for model `public.tokenized_repositories` does not exist.
```

This happens because Prisma's shadow database doesn't have manually-created tables.

**Solution**: Use `prisma db push` instead of `migrate dev`:
```bash
npx prisma db push
```

This applies schema changes directly without shadow database verification.

### Manual Migration Alternative

If you need migration history, you can mark migrations as applied:
```bash
npx prisma migrate resolve --applied "20260121_github_issues_tranches"
```

Then run your new migration:
```bash
npx prisma migrate dev --name add_developer_token_market_data
```
