# Smoke Scripts

These scripts provide a **curlable smoke test** for staging and production.

## Usage

```bash
./scripts/smoke-staging.sh
./scripts/smoke-prod.sh
./scripts/smoke-x402-real.sh
```

## Make Targets

```bash
make smoke-staging
make smoke-prod
make smoke-x402-real
```

## Environment Variables

You can override defaults by setting environment variables:

```bash
BASE_URL=https://staging.path402.com \
DOMAIN=staging.path402.com \
HANDLE=@staging \
ISSUER_ADDRESS=1ABC... \
./scripts/smoke-staging.sh
```

```bash
BASE_URL=https://path402.com \
DOMAIN=path402.com \
HANDLE=@path402 \
ISSUER_ADDRESS=1ABC... \
./scripts/smoke-prod.sh
```

### Real x402 Transaction

```bash
BASE_URL=https://path402.com \
X402_TX_ID=<bsv_txid> \
X402_TO_ADDRESS=<recipient_address> \
X402_AMOUNT_SATS=1000 \
INSCRIBE=false \
./scripts/smoke-x402-real.sh
```

## What’s Checked

1. `/` (homepage)
2. `/.well-known/$402.json`
3. `/api/domain/verify-template`
4. `/api/domain/verify`
5. `/api/x402/verify` (sample payload, `inscribe=false`)
6. `/docs`
