#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://path402.com}"
DOMAIN="${DOMAIN:-path402.com}"
HANDLE="${HANDLE:-@path402}"
ISSUER_ADDRESS="${ISSUER_ADDRESS:-1ABC...}"

echo "== PATH402 prod smoke =="
echo "Base URL: ${BASE_URL}"

echo
echo "-- GET /"
curl -sSf "${BASE_URL}/" > /dev/null
echo "OK"

echo
echo "-- GET /.well-known/\$402.json"
curl -sSf "${BASE_URL}/.well-known/\$402.json" | head -n 5

echo
echo "-- POST /api/domain/verify-template"
curl -sSf -X POST "${BASE_URL}/api/domain/verify-template" \
  -H "content-type: application/json" \
  -d "{\"domain\":\"${DOMAIN}\",\"issuer_address\":\"${ISSUER_ADDRESS}\",\"handle\":\"${HANDLE}\"}" | head -n 20

echo
echo "-- POST /api/domain/verify"
curl -sSf -X POST "${BASE_URL}/api/domain/verify" \
  -H "content-type: application/json" \
  -d "{\"domain\":\"${DOMAIN}\",\"handle\":\"${HANDLE}\",\"issuer_address\":\"${ISSUER_ADDRESS}\"}" | head -n 20

echo
echo "-- POST /api/x402/verify (inscribe=false sample)"
curl -sSf -X POST "${BASE_URL}/api/x402/verify" \
  -H "content-type: application/json" \
  -d '{
    "x402Version": 1,
    "scheme": "exact",
    "network": "bsv",
    "payload": {
      "signature": "demo-signature",
      "authorization": {
        "from": "sender",
        "to": "recipient",
        "value": "100",
        "nonce": "prod-nonce-1"
      }
    },
    "inscribe": false
  }' | head -n 20

echo
echo "-- GET /docs"
curl -sSf "${BASE_URL}/docs" > /dev/null
echo "OK"

echo
echo "-- DONE"
