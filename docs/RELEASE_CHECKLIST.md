# Release Checklist

This checklist covers **production deploys** for `path402.com` and **npm publishing** for related packages.

---

## Web Production Deploy (path402.com)

**Preflight**
1. Ensure you are on the intended branch (usually `main`) and the working tree is clean.
2. Confirm `.env.local` / production env vars are up to date.
3. Run the full local pipeline:
   - `pnpm lint`
   - `pnpm exec tsc -p tsconfig.json --noEmit --incremental false`
   - `pnpm test`
   - `pnpm build`

**Database**
1. Review new migrations in `database/migrations`.
2. Apply migrations to production (Supabase / Postgres).
3. Confirm new tables/columns exist and are indexed as expected.

**Smoke Tests**
1. `/` loads and `/docs` renders.
2. `/.well-known/$402.json` returns valid discovery JSON.
3. Token flow:
   - Preview → Buy → Holdings appear
4. Domain verification:
   - `/api/domain/verify-template` returns expected payload
   - `/api/domain/verify` succeeds for a known domain
5. Usage payments:
   - `/api/tokens/{address}/stream` GET returns access window
   - POST with a valid `payment_tx_id` extends access window

**Deploy**
1. Deploy via your hosting provider (Vercel, Fly, or self-hosted).
2. Verify production build, then run the same smoke tests against prod.

---

## NPM Publish (path402-mcp-server or related packages)

> If the package lives in a different repo, run these steps there.

1. Confirm package name, version, and `main`/`exports` in `package.json`.
2. Bump version:
   - `npm version patch|minor|major`
3. Run tests and lint in the package repo:
   - `pnpm lint`
   - `pnpm test`
4. Publish:
   - `npm publish --access public`
5. Verify on npm and test install from a clean environment.

---

**Tip:** Keep a short changelog in the release PR so operators know what changed.
