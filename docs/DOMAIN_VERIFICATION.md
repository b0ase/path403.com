# Domain Verification

This document describes how issuers prove domain control and bind it to a BSV address for `$address` tokenization.

## Overview

Registration requires **three proofs**:
1. **DNS TXT** record at `_path402.<domain>`
2. **HTTP well-known** file at `https://<domain>/.well-known/path402.json`
3. **On-chain signature** inscription referenced by the well-known file

All three must match the **same issuer handle** and **issuer address**.

## 1) DNS TXT Record

Add a TXT record at `_path402.<domain>` containing:

```
path402=<handle>
issuer_address=<bsv_address>
```

Optional fields (recommended):
```
domain_message=path402-domain:<domain>
domain_signature_tx_id=<bsv_txid>
domain_signature=<base64_signature>
```

## 2) Well-Known File

Host `https://<domain>/.well-known/path402.json`:

```json
{
  "issuer": "@handle",
  "issuer_address": "1ABC...",
  "domain_message": "path402-domain:example.com",
  "domain_signature_tx_id": "<bsv_txid>",
  "domain_signature": "<base64_signature>"
}
```

## 3) On-Chain Signature

The `domain_signature_tx_id` MUST reference a transaction containing an inscription with:

```json
{
  "p": "$402",
  "op": "domain-verify",
  "domain": "example.com",
  "issuer_address": "1ABC...",
  "message": "path402-domain:example.com",
  "signature": "<base64_signature>"
}
```

The signature is verified with the **Bitcoin Signed Message** standard against `issuer_address`.

## Helper Endpoints

**Generate payload**
```
POST /api/domain/verify-payload
{
  "domain": "example.com",
  "issuer_address": "1ABC..."
}
```

**Generate self-broadcast template**
```
POST /api/domain/verify-template
{
  "domain": "example.com",
  "issuer_address": "1ABC...",
  "handle": "@handle"
}
```

**Response (template snippets)**
```json
{
  "message": "path402-domain:example.com",
  "payload": {
    "p": "$402",
    "op": "domain-verify",
    "domain": "example.com",
    "issuer_address": "1ABC...",
    "message": "path402-domain:example.com",
    "signature": "<base64_signature>"
  },
  "inscription": {
    "content_type": "application/json",
    "data": { "...": "payload" },
    "output": {
      "satoshis": 1,
      "address": "1ABC..."
    }
  },
  "well_known": {
    "issuer": "@handle",
    "issuer_address": "1ABC...",
    "domain_message": "path402-domain:example.com",
    "domain_signature_tx_id": "<bsv_txid>",
    "domain_signature": "<base64_signature>"
  },
  "dns_txt": [
    "path402=@handle",
    "issuer_address=1ABC...",
    "domain_message=path402-domain:example.com",
    "domain_signature_tx_id=<bsv_txid>",
    "domain_signature=<base64_signature>"
  ]
}
```

**Broadcast inscription (admin)**
```
POST /api/domain/verify-inscribe
Headers: x-admin-key: <ADMIN_API_KEY>
Body:
{
  "domain": "example.com",
  "issuer_address": "1ABC...",
  "signature": "<base64>",
  "message": "path402-domain:example.com"
}
```

**Verify end-to-end**
```
POST /api/domain/verify
{
  "domain": "example.com",
  "handle": "@handle",
  "issuer_address": "1ABC..."
}
```
