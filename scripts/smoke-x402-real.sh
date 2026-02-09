#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://path402.com}"
X402_TX_ID="${X402_TX_ID:-}"
X402_TO_ADDRESS="${X402_TO_ADDRESS:-}"
X402_AMOUNT_SATS="${X402_AMOUNT_SATS:-}"
X402_ASSET="${X402_ASSET:-BSV}"
X402_FROM="${X402_FROM:-sender}"
INSCRIBE="${INSCRIBE:-false}"
NONCE="${NONCE:-real-$(date +%s)}"

if [[ -z "${X402_TX_ID}" || -z "${X402_TO_ADDRESS}" || -z "${X402_AMOUNT_SATS}" ]]; then
  echo "Missing required env vars."
  echo "Set: X402_TX_ID, X402_TO_ADDRESS, X402_AMOUNT_SATS"
  exit 1
fi

echo "== PATH402 x402 real-tx smoke =="
echo "Base URL: ${BASE_URL}"
echo "TxId: ${X402_TX_ID}"
echo "To: ${X402_TO_ADDRESS}"
echo "Amount (sats): ${X402_AMOUNT_SATS}"
echo "Inscribe: ${INSCRIBE}"

echo
echo "-- POST /api/x402/verify (real tx)"
curl -sSf -X POST "${BASE_URL}/api/x402/verify" \
  -H "content-type: application/json" \
  -d "{
    \"x402Version\": 1,
    \"scheme\": \"exact\",
    \"network\": \"bsv\",
    \"txId\": \"${X402_TX_ID}\",
    \"asset\": \"${X402_ASSET}\",
    \"payload\": {
      \"signature\": \"demo-signature\",
      \"authorization\": {
        \"from\": \"${X402_FROM}\",
        \"to\": \"${X402_TO_ADDRESS}\",
        \"value\": \"${X402_AMOUNT_SATS}\",
        \"nonce\": \"${NONCE}\"
      }
    },
    \"inscribe\": ${INSCRIBE}
  }" | head -n 40

echo
echo "-- DONE"
