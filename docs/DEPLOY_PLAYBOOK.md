# Deploy Playbook (Staging + Production)

This playbook documents **environment‑specific checks** for staging and production deploys.
Use it alongside **RELEASE_CHECKLIST.md** for the full release process.

---

## Common Preflight (Both Environments)

1. Confirm working tree is clean and branch is correct.
2. Verify secrets are present in your deployment provider:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `HANDCASH_APP_ID`
   - `HANDCASH_APP_SECRET`
   - `ADMIN_API_KEY`
   - `TREASURY_ADDRESS` / `TREASURY_PRIVATE_KEY`
   - `X402_TREASURY_ADDRESS` / `X402_TREASURY_PRIVATE_KEY`
3. Run the pipeline locally:
   - `pnpm lint`
   - `pnpm exec tsc -p tsconfig.json --noEmit --incremental false`
   - `pnpm test`
   - `pnpm build`

---

## Staging Deploy (path402‑staging)

**Environment flags**
- `PATH402_DOMAIN_VERIFY_REQUIRED=false` (optional) to allow partial domain verification while testing.
- `X402_VERIFY_REQUIRE_TX=true` (recommended) if testing real tx validation.

**Domain checks**
1. Ensure `_path402.<staging-domain>` TXT record is in place.
2. Ensure `https://<staging-domain>/.well-known/path402.json` is reachable.
3. Run:
   - `POST /api/domain/verify-template`
   - `POST /api/domain/verify`

**x402 checks**
1. Verify `/api/x402/verify` with a known test payload (use `inscribe=false` on staging if you don’t want on-chain proof).
2. Confirm fees returned match `FEES` constants.
3. Optional real-tx check:
   - `BASE_URL=https://staging.path402.com X402_TX_ID=<bsv_txid> X402_TO_ADDRESS=<address> X402_AMOUNT_SATS=1000 ./scripts/smoke-x402-real.sh`

**Usage payments**
1. `GET /api/tokens/{address}/stream` with a staging user handle.
2. `POST /api/tokens/{address}/stream` with a staging BSV tx id.

**Curlable smoke scripts**
1. `BASE_URL=https://staging.path402.com DOMAIN=staging.path402.com HANDLE=@staging ISSUER_ADDRESS=1ABC... ./scripts/smoke-staging.sh`
2. `./scripts/README.md` documents env overrides and endpoints.

---

## Production Deploy (path402.com)

**Environment flags**
- `PATH402_DOMAIN_VERIFY_REQUIRED=true`
- `X402_VERIFY_REQUIRE_TX=true`

**Domain checks**
1. `_path402.path402.com` TXT present.
2. `https://path402.com/.well-known/path402.json` reachable.
3. `POST /api/domain/verify` succeeds for a known issuer.

**x402 checks**
1. `POST /api/x402/verify` with real chain data.
2. Confirm inscriptions land and are indexed.
3. Optional real-tx check:
   - `BASE_URL=https://path402.com X402_TX_ID=<bsv_txid> X402_TO_ADDRESS=<address> X402_AMOUNT_SATS=1000 ./scripts/smoke-x402-real.sh`

**Usage payments**
1. Validate usage payments reach the configured `payment_address` for a token.
2. Confirm `/api/tokens/{address}/stream` returns an active access window after payment.

**Curlable smoke scripts**
1. `BASE_URL=https://path402.com DOMAIN=path402.com HANDLE=@path402 ISSUER_ADDRESS=1ABC... ./scripts/smoke-prod.sh`
2. `./scripts/README.md` documents env overrides and endpoints.

---

## Rollback

1. Roll back to the previous deployment in your hosting provider.
2. Revert any database migrations if needed (only if the migration is reversible).
3. Disable new endpoints temporarily by feature flag if partial rollback is required.

---

**Tip:** Keep a short staging checklist in the PR description so QA can copy/paste it.
