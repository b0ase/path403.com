# Domain Tokenization Specification

## $402 Protocol — Domain-as-Token Model

**Version:** 0.1.0-draft
**Date:** 2026-02-09
**Author:** Richard Boase
**Status:** Draft

---

## 1. Abstract

This specification defines how internet domains participate in the $402 Protocol as economic entities. A domain owner publishes a DNS TXT record linking their domain to a BSV wallet address. This creates a verifiable claim that the domain operator is a participant in the $402 network, enabling automatic protocol fee routing, content discovery, and token association.

This is NOT a new domain naming system. It layers economics onto existing ICANN domains using standard DNS infrastructure.

---

## 2. Design Principles

1. **Use existing DNS.** No parallel namespace. No browser extensions. No special resolvers. Standard ICANN domains, standard DNS records.
2. **DNS TXT records are the link.** The lowest-friction, most universal mechanism for domain-to-blockchain binding. Every registrar supports them. Every DNS resolver can query them.
3. **DNSSEC for integrity.** Where available, DNSSEC provides cryptographic proof that the TXT record was set by the domain controller. Without DNSSEC, the record is an assertion, not a proof.
4. **No trusted intermediary.** Unlike 3DNS (which requires a registrar bridge), this model requires only DNS control. The domain owner publishes a record; the protocol reads it.
5. **Progressive disclosure.** A bare TXT record is sufficient for basic participation. Additional records unlock additional capabilities.

---

## 3. Prior Art

| System | Mechanism | Limitation |
|--------|-----------|------------|
| **x402 DNS Discovery** (IETF draft-jeftovic-x402-dns-discovery-00) | `_x402.<host>` TXT record → `.well-known/x402` manifest | Stablecoin-only, no BSV, no identity layer |
| **BIP 353** | `user._bitcoin-payment.<domain>` TXT → BIP 21 URI | Bitcoin payment instructions only, no protocol participation |
| **OpenAlias** | `oa1:<crypto> recipient_address=<addr>` TXT record | Wallet aliasing only, no economic model |
| **ENS DNSSEC Import** | `_ens.<domain>` TXT → on-chain ENS name claim | Ethereum only, high gas (~1M), limited TLD support |
| **DANE/TLSA** (RFC 6698) | TLSA record binds X.509 cert to domain via DNSSEC | Certificate binding pattern, adaptable to wallet binding |
| **DKIM** | `selector._domainkey.<domain>` TXT → public key | Proven at scale, identical architectural pattern |
| **Paymail** (BSV) | `_bsvalias._tcp.<domain>` SRV record → Paymail server | Server-based, not on-chain, no tokenization |
| **3DNS** | ERC-721 on Optimism + ICANN registrar bridge | Requires trusted intermediary (3DNS company) |
| **Handshake** | UTXO covenants for TLDs, parallel DNS root | Doesn't resolve in standard browsers |
| **Allegory** (BSV) | OP_RETURN names linked to UTXOs | No adoption, requires overlay network |

---

## 4. DNS Record Format

### 4.1 Discovery Record

```
_path402.<domain>. IN TXT "v=path402v1; addr=<bsv-address>; handle=<$HANDLE>"
```

**Fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `v` | Yes | Protocol version. Must be `path402v1`. |
| `addr` | Yes | BSV address (P2PKH or P2SH) that receives protocol fees and token distributions for this domain. |
| `handle` | No | $401 identity handle associated with this domain (e.g., `$BOASE`). Links the domain to a specific identity token. |
| `node` | No | Gossip node address in `host:port` format. Indicates this domain runs a path402d node. |
| `x402` | No | URL to x402-compatible payment manifest. Enables Coinbase x402 interop. |

**Examples:**

```
; Minimal — just link domain to wallet
_path402.example.com. 300 IN TXT "v=path402v1; addr=1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"

; Full — identity + node + x402 interop
_path402.path402.com. 300 IN TXT "v=path402v1; addr=1BoatSLR...; handle=$BOASE; node=path402.com:4020; x402=https://path402.com/.well-known/x402.json"

; Multiple subdomains can have different records
_path402.api.example.com. 300 IN TXT "v=path402v1; addr=1ApiAddr...; handle=$ALICE"
_path402.cdn.example.com. 300 IN TXT "v=path402v1; addr=1CdnAddr..."
```

### 4.2 Content Manifest (Optional)

If the domain serves paywalled content, it SHOULD publish a manifest at:

```
https://<domain>/.well-known/path402.json
```

**Manifest schema:**

```json
{
  "v": "path402v1",
  "domain": "example.com",
  "addr": "1A1zP1eP5...",
  "handle": "$ALICE",
  "content": [
    {
      "path": "/$blog",
      "price": 100,
      "currency": "satoshis",
      "token": "txid_of_bsv21_token",
      "description": "Alice's blog — penny per page"
    },
    {
      "path": "/$api/v1/*",
      "price": 10,
      "currency": "satoshis",
      "description": "API access — 10 sats per call"
    }
  ],
  "node": {
    "gossip": "example.com:4020",
    "api": "example.com:4021"
  }
}
```

---

## 5. Resolution Flow

### 5.1 Client Discovery

When a path402d client encounters a URL with a `$` path segment (e.g., `example.com/$video`):

```
1. Extract hostname: example.com
2. Query DNS: _path402.example.com TXT
3. Parse TXT record fields (v, addr, handle, node, x402)
4. If manifest URL exists: fetch /.well-known/path402.json
5. If x402 field exists: also fetch x402 manifest for cross-protocol support
6. Present payment options to user
```

### 5.2 DNSSEC Validation

If the domain has DNSSEC enabled, the client SHOULD validate the full DNSSEC chain from root to the TXT record. A DNSSEC-validated record provides cryptographic proof that the domain controller published the wallet address.

Without DNSSEC, the TXT record is a best-effort assertion. Clients SHOULD warn users when DNSSEC is not available and the transaction amount exceeds a configurable threshold (default: 1000 satoshis).

### 5.3 Caching

Clients SHOULD cache resolved TXT records for the duration of the DNS TTL. The manifest at `.well-known/path402.json` SHOULD be cached for 5 minutes by default, or as specified by HTTP cache headers.

---

## 6. Domain-Token Association

### 6.1 Linking a Domain to a $401 Identity

When a `_path402` TXT record includes a `handle` field, the domain is associated with a $401 identity token. This creates a verifiable chain:

```
Domain (DNS) → _path402 TXT record → $401 handle → BSV inscription
```

The $401 token's inscription MAY include a `domains` claim listing domains the identity controls:

```json
{
  "p": "401",
  "op": "update",
  "handle": "$BOASE",
  "claims": [
    {
      "type": "urn:path402:domain",
      "value": "path402.com",
      "verified": "dns",
      "timestamp": "2026-02-09T12:00:00Z"
    }
  ]
}
```

Verification is bidirectional:
1. **DNS → Chain:** The TXT record claims the domain is operated by `$BOASE`
2. **Chain → DNS:** The $401 inscription claims `$BOASE` controls `path402.com`

Both must agree for the link to be considered verified.

### 6.2 Domain as Economic Entity

Once linked, the domain participates in the $402 economy:

- **Content served from the domain** generates $402 token activity
- **Protocol fees** from content transactions route to the domain's `addr`
- **Indexing rewards** for content discovered at the domain flow to the `addr`
- **Reputation** from the $401 handle accrues to the domain's trust profile

### 6.3 Multi-Domain Portfolios

A single $401 identity can control multiple domains:

```
_path402.path402.com.    TXT "v=path402v1; addr=1Main...; handle=$BOASE"
_path402.fnews.online.   TXT "v=path402v1; addr=1Main...; handle=$BOASE"
_path402.kwegwong.com.   TXT "v=path402v1; addr=1KW...; handle=$BOASE"
```

All three domains share the same identity but MAY have different payment addresses.

---

## 7. The `$` in URLs

Per RFC 3986, the dollar sign `$` is a **sub-delimiter** and is valid in URL paths without encoding. The `$` prefix in path402 URLs (e.g., `example.com/$video`) is:

- Standards-compliant per RFC 3986
- Handled correctly by all major web servers (Nginx, Apache, Node.js, Cloudflare Workers)
- Not part of the hostname (DNS is unaffected)
- A semantic signal that the path segment is a tokenised resource

**Caution:** Nginx config files use `$` for variable interpolation. Server configurations must escape `$` in location blocks (e.g., `location /\$video`). This is a configuration concern, not a protocol concern.

---

## 8. x402 Interoperability

The `x402` field in the TXT record enables cross-protocol compatibility with the Coinbase x402 standard:

### 8.1 How It Works

If a domain publishes both `_path402` and `_x402` TXT records, the path402d client can:

1. Use the BSV-native path402 payment flow by default
2. Fall back to x402 stablecoin payment if the user prefers
3. Bridge x402 payments to BSV settlement (encapsulation)

### 8.2 Manifest Bridging

The `.well-known/path402.json` manifest MAY include an `x402` section that maps path402 content paths to x402 payment requirements:

```json
{
  "x402_bridge": {
    "/$blog": {
      "x402_price": "0.01",
      "x402_currency": "USDC",
      "x402_network": "base"
    }
  }
}
```

This allows a single domain to accept both BSV micropayments (via path402) and stablecoin payments (via x402).

---

## 9. Gossip Layer Integration

When a path402d node discovers a new domain's `_path402` TXT record, it broadcasts a `DOMAIN_ANNOUNCE` message on the `$402/domains/v1` gossip topic:

```json
{
  "type": "DOMAIN_ANNOUNCE",
  "domain": "example.com",
  "addr": "1A1zP1...",
  "handle": "$ALICE",
  "node": "example.com:4020",
  "dnssec": true,
  "timestamp": "2026-02-09T12:00:00Z",
  "signature": "<signed by addr>"
}
```

Other nodes can verify the announcement by:
1. Querying `_path402.example.com` TXT independently
2. Verifying the signature matches the announced `addr`
3. Optionally validating DNSSEC

---

## 10. Security Considerations

### 10.1 DNS Hijacking

Without DNSSEC, DNS records can be spoofed. An attacker who compromises a domain's DNS could redirect payments to their own address. Mitigations:

- **DNSSEC validation** (primary defense)
- **Bidirectional verification** (TXT record + $401 inscription must agree)
- **Payment amount thresholds** (warn on high-value transactions to unverified domains)
- **Historical consistency** (flag domains whose `addr` recently changed)

### 10.2 Registrar Risk

The domain registrar has ultimate control over DNS records. A compromised registrar account could modify the `_path402` TXT record. This is the same trust model as DKIM, SPF, and all DNS-based authentication.

### 10.3 ICANN Authority

ICANN can override domain ownership through UDRP dispute resolution. A domain transferred via UDRP may have its `_path402` record changed by the new owner. The protocol SHOULD track domain ownership changes and alert stakers/participants.

---

## 11. Implementation Checklist

For a domain to fully participate in the $402 Protocol:

- [ ] Publish `_path402.<domain>` TXT record with at least `v` and `addr`
- [ ] Enable DNSSEC (strongly recommended)
- [ ] Publish `.well-known/path402.json` manifest (if serving content)
- [ ] Link domain in $401 inscription claims (if identity-linked)
- [ ] Run path402d node and advertise via `node` field (if serving content)
- [ ] Optionally publish `_x402` TXT record for Coinbase x402 interop

---

## 12. Compatibility

| Standard | Compatibility |
|----------|--------------|
| ICANN DNS | Full — uses standard TXT records |
| DNSSEC | Full — recommended for verification |
| RFC 3986 | Full — `$` is valid in URL paths |
| x402 (Coinbase) | Bridge — optional cross-protocol support |
| BRC-105 | Compatible — payment flow uses BRC-105 headers |
| BIP 353 | Complementary — different record format, same DNS pattern |
| Paymail | Complementary — Paymail uses SRV, path402 uses TXT |

---

## 13. Open Questions

- **Should the TXT record include a signature?** A BSV signature over the domain name would prove the `addr` holder authorized the DNS record, providing verification even without DNSSEC.
- **Subdomain inheritance:** Should `_path402.example.com` apply to all subdomains, or must each subdomain have its own record?
- **Record rotation:** How should wallet address changes be handled? Cooldown period? Notification to stakers?
- **DNS-DEX:** Could the `_path402` record system serve as a discovery layer for a decentralized token exchange?
- **Registrar integration:** Should path402 pursue ICANN registrar accreditation (like 3DNS) for deeper integration?

---

*This specification is a living document. Feedback: hello@b0ase.com*
