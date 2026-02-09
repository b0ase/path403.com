# $401 Identity Token Specification

**Version:** 0.2.0
**Date:** 2026-02-09
**Author:** Richard Boase (b0ase.com)
**Status:** Draft — Identity Chain implementation live

---

## Abstract

The $401 Identity Token is a self-sovereign identity primitive for the $402 Protocol ecosystem. Named after HTTP 401 "Unauthorized", a $401 token is a BSV inscription that binds a cryptographic identity to a human or autonomous agent, enabling peer-underwritten reputation, selective attribute disclosure, and tiered access to economic participation.

This specification builds on and is compatible with:
- **BRC-100** (Wallet-to-Application Interface)
- **BRC-52** (Identity Certificates with selective field revelation)
- **BRC-105** (HTTP Service Monetization / 402 Payment)
- **BAP** (Bitcoin Attestation Protocol)
- **ERC-8004** (Trustless Agent Identity — cross-chain compatibility)

---

## 1. Terminology

| Term | Definition |
|------|-----------|
| **Identity Key** | secp256k1 compressed public key (33-byte, 66-char hex). The root identity of the token holder. |
| **$401 Token** | A BSV inscription containing identity claims, confidence metadata, and economic parameters. |
| **Staker** | A network participant who locks capital against a $401 token as a signal of trust. |
| **Trust Score** | Composite reputation metric derived from staking, attestations, burn history, and activity. |
| **Confidence Level** | Integer 0-3 indicating the verification depth of the identity. |
| **Agent** | An autonomous software entity (AI agent, daemon, bot) that acts on behalf of a human identity. |

---

## 2. Token Structure

A $401 token is a BSV inscription (1Sat Ordinal) containing a JSON document:

```json
{
  "p": "401",
  "op": "mint",
  "v": "0.1.0",
  "handle": "$BOASE",
  "subject": "<66-char compressed secp256k1 pubkey>",
  "confidence": 0,
  "created": "2026-02-09T12:00:00Z",
  "params": {
    "stakerRevenueShare": 0.10,
    "minStakeDuration": 604800,
    "cooldownPeriod": 86400,
    "burnAddress": "<provably unspendable address>"
  },
  "claims": {},
  "attestations": [],
  "agents": [],
  "links": {
    "402": [],
    "domains": []
  },
  "revocationOutpoint": "<txid>.<vout>",
  "signature": "<DER-encoded ECDSA signature>"
}
```

### 2.1 Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `p` | string | Protocol identifier. Always `"401"`. |
| `op` | string | Operation: `"mint"`, `"update"`, `"rotate"`, `"revoke"`. |
| `v` | string | Spec version (semver). |
| `handle` | string | Token symbol. Must start with `$`, 1-20 chars after `$`, `[A-Z0-9_]` only. |
| `subject` | PubKeyHex | The identity holder's compressed secp256k1 public key (66-char hex). |
| `confidence` | integer | Confidence level 0-3 (see Section 4). |
| `created` | ISO 8601 | Timestamp of token creation. |
| `revocationOutpoint` | OutpointString | `"txid.vout"` — spending this UTXO revokes the token (per BRC-52). |
| `signature` | HexString | ECDSA signature over canonical JSON of all fields except `signature`. |

### 2.2 Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `params` | object | Economic parameters (see Section 6). |
| `claims` | object | Encrypted identity attributes (see Section 5). |
| `attestations` | array | Third-party attestation references (see Section 4.2). |
| `agents` | array | Linked agent identities (see Section 8). |
| `links` | object | Linked $402 tokens, domains, and resources. |

---

## 3. Operations

### 3.1 Mint

Creates a new $401 identity token. One `mint` per handle — duplicates are resolved by earliest inscription timestamp.

### 3.2 Update

Modifies token parameters, claims, attestations, or agent registrations. Must be signed by the current `subject` key. References the original mint inscription.

```json
{
  "p": "401",
  "op": "update",
  "ref": "<txid of mint inscription>",
  "confidence": 2,
  "attestations": [{ ... }],
  "signature": "<signed by subject>"
}
```

### 3.3 Rotate

Rotates the signing key. The new key is signed by the current key, establishing a chain of custody (compatible with BAP key rotation model).

```json
{
  "p": "401",
  "op": "rotate",
  "ref": "<txid of mint inscription>",
  "previousSubject": "<current 66-char pubkey>",
  "subject": "<new 66-char pubkey>",
  "sequence": 2,
  "signature": "<signed by previousSubject>"
}
```

### 3.4 Revoke

Spending the `revocationOutpoint` UTXO permanently revokes the token (per BRC-52). Alternatively, an explicit revoke inscription:

```json
{
  "p": "401",
  "op": "revoke",
  "ref": "<txid of mint inscription>",
  "reason": "Key compromised",
  "signature": "<signed by subject or rootKey>"
}
```

---

## 4. Confidence Levels

| Level | Name | Requirements | Verification |
|-------|------|-------------|--------------|
| 0 | Self-Attested | Handle claimed, token minted, key generated | None — purely self-declared |
| 1 | Signed Bundle | Encrypted identity bundle created at bit-sign.online (or compatible service). Bundle hash linked to token. | Anyone can verify bundle exists; contents encrypted. |
| 2 | Third-Party Verified | Level 1 + verification service (Veriff, Onfido, Jumio, etc.) signs a BRC-52 certificate attesting document validity. | Certificate signature verifiable. Selective field revelation available. |
| 3 | Publicly Attested | Level 2 + public record linking real-world identity to token. Press, filings, verified social, video attestation. | Public evidence chain. |

### 4.1 Signed Bundle (Level 1)

The bundle is a BRC-52-compatible certificate:

```json
{
  "type": "<CertificateTypeID for $401 identity bundles>",
  "subject": "<identity pubkey>",
  "certifier": "<signing service pubkey>",
  "serialNumber": "<unique>",
  "fields": {
    "passport_hash": "<AES-256-GCM encrypted>",
    "document_type": "<AES-256-GCM encrypted>",
    "country": "<AES-256-GCM encrypted>",
    "created": "<AES-256-GCM encrypted>"
  },
  "revocationOutpoint": "<txid.vout>",
  "signature": "<certifier ECDSA signature>"
}
```

Fields are encrypted per BRC-52. Selective revelation via keyring allows proving specific claims (e.g., "I am over 18" or "I am a UK resident") without exposing the full document.

### 4.2 Third-Party Attestation (Level 2)

Referenced in the token's `attestations` array:

```json
{
  "certifier": "<verification service pubkey>",
  "certificateTxid": "<txid of BRC-52 certificate>",
  "service": "veriff",
  "level": "document_verification",
  "timestamp": "2026-02-09T12:00:00Z"
}
```

### 4.3 Public Attestation (Level 3)

```json
{
  "type": "public",
  "evidence": [
    { "platform": "twitter", "url": "https://x.com/...", "archived": "<archive.org URL>" },
    { "platform": "company_filing", "ref": "Companies House UK #12345678" },
    { "platform": "video", "hash": "<content hash>", "txid": "<inscription txid>" }
  ]
}
```

---

## 5. Claims (Identity Attributes)

Claims follow the BAP URN convention with BRC-52 encryption:

### 5.1 Attribute Naming

Attributes use schema.org Person vocabulary:

```
urn:401:id:<attributeName>:<attributeValue>:<nonce>
```

Standard attributes:

| Attribute | Schema.org | Description |
|-----------|-----------|-------------|
| `name` | `schema:name` | Display name |
| `handle` | `schema:alternateName` | Token handle (e.g., `$BOASE`) |
| `email` | `schema:email` | Contact email |
| `url` | `schema:url` | Personal/project URL |
| `description` | `schema:description` | Bio / about |
| `image` | `schema:image` | Avatar URL or content hash |
| `country` | `schema:nationality` | Country code (ISO 3166-1) |

### 5.2 Storage

Claims are stored as SHA-256 hashes on-chain (per BAP privacy model). Full attribute values are encrypted in the BRC-52 certificate fields, revealed selectively to authorized verifiers.

```json
"claims": {
  "name": "<sha256(urn:401:id:name:Richard Boase:<nonce>)>",
  "country": "<sha256(urn:401:id:country:GB:<nonce>)>",
  "url": "<sha256(urn:401:id:url:https://b0ase.com:<nonce>)>"
}
```

---

## 6. Economic Parameters

### 6.1 Staking

Any network participant can stake $402 tokens against a $401 identity:

```json
{
  "p": "401",
  "op": "stake",
  "target": "<$401 mint txid>",
  "amount": 10000,
  "lockDuration": 2592000,
  "staker": "<staker pubkey>",
  "signature": "<staker signature>"
}
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `stakerRevenueShare` | 0.10 (10%) | Percentage of identity's economic activity routed to stakers |
| `minStakeDuration` | 604800 (7 days) | Minimum lock period in seconds |
| `cooldownPeriod` | 86400 (24 hours) | Unstaking cooldown in seconds |

### 6.2 Trust Score Calculation

```
trustScore = (
  totalStaked * 0.30 +
  uniqueStakers * 0.20 +
  avgStakeDuration * 0.15 +
  stakerDiversity * 0.10 +
  burnTotal * 0.15 +
  confidenceLevel * 0.10
)
```

All components are normalized to 0-1 range before weighting. The trust score is a **derived metric** computed by clients, not stored on-chain.

### 6.3 Burn Mechanics

Burning BSV to a provably unspendable address creates permanent commitment:

```json
{
  "p": "401",
  "op": "burn",
  "target": "<$401 mint txid>",
  "burnAddress": "1CounterpartyXXXXXXXXXXXXXXUWLpVr",
  "amount": 10000,
  "txid": "<burn transaction txid>"
}
```

**Provably unspendable address generation:**
- Hash of a known string with no corresponding private key
- Example: `SHA256("$401:BURN:$BOASE")` → address
- Each token can have its own deterministic burn address
- Burn total is publicly auditable on-chain

---

## 7. Authentication Integration

### 7.1 HTTP 401/402 Flow

The $401 token integrates with BRC-105 HTTP monetization:

```
Client                              Server
  │                                    │
  ├─── GET /resource ─────────────────►│
  │                                    │
  │◄── 401 Unauthorized ──────────────┤  (no identity)
  │    x-401-token-required: true      │
  │                                    │
  ├─── GET /resource ─────────────────►│
  │    x-401-token: <$401 proof>       │
  │                                    │
  │◄── 402 Payment Required ──────────┤  (identity OK, payment needed)
  │    x-bsv-payment-satoshis: 200     │
  │                                    │
  ├─── GET /resource ─────────────────►│
  │    x-401-token: <$401 proof>       │
  │    x-bsv-payment: { tx }          │
  │                                    │
  │◄── 200 OK ────────────────────────┤
```

### 7.2 Token Proof Format

Compatible with Luke Rohenaz's bitcoin-auth header format:

```
x-401-token: <pubkey>|<scheme>|<timestamp>|<requestPath>|<$401-txid>|<signature>
```

| Field | Description |
|-------|-------------|
| `pubkey` | 66-char compressed secp256k1 key matching $401 subject |
| `scheme` | `BRC-77` (recommended) or `BSM` (legacy) |
| `timestamp` | Unix timestamp (verified within 5-minute tolerance) |
| `requestPath` | The HTTP path being accessed |
| `$401-txid` | Transaction ID of the $401 mint inscription |
| `signature` | ECDSA signature over `pubkey\|scheme\|timestamp\|requestPath\|$401-txid` |

### 7.3 Trust-Based Routing

Nodes use trust scores for routing decisions:

| Trust Score | Routing Priority | Rate Limits |
|-------------|-----------------|-------------|
| 0-20 | Low | Standard |
| 21-50 | Medium | Relaxed |
| 51-80 | High | Minimal |
| 81-100 | Preferred | None |

---

## 8. Agent Identity

A $401 token can register linked autonomous agents. This enables AI agents to act with delegated authority while maintaining accountability to their human operator.

### 8.1 Agent Registration

```json
{
  "agents": [
    {
      "agentId": "<agent pubkey>",
      "name": "claude-analyst",
      "description": "AI research analyst for Micro Capital",
      "capabilities": ["research", "trading", "content-generation"],
      "services": [
        { "type": "MCP", "endpoint": "https://mcp.b0ase.com/claude" },
        { "type": "A2A", "endpoint": "https://a2a.b0ase.com/claude" }
      ],
      "x402Support": true,
      "capitalLimit": 100000,
      "delegatedAt": "2026-02-09T12:00:00Z",
      "signature": "<signed by parent $401 subject>"
    }
  ]
}
```

### 8.2 Agent Identity Fields

| Field | Type | Description |
|-------|------|-------------|
| `agentId` | PubKeyHex | The agent's own secp256k1 key pair |
| `name` | string | Human-readable agent name |
| `capabilities` | string[] | Declared capabilities |
| `services` | object[] | Service endpoints (MCP, A2A, web, etc.) |
| `x402Support` | boolean | Whether agent accepts $402 payments |
| `capitalLimit` | integer | Maximum satoshis the agent can spend per day |
| `delegatedAt` | ISO 8601 | When delegation was granted |
| `signature` | HexString | Parent identity's signature authorizing this agent |

### 8.3 Agent Actions

Agents sign requests with their own key. Verifiers can trace the agent key back to the parent $401 token to determine accountability:

```
Agent key → registered in $401 token → parent identity → trust score
```

Agent trust inherits from the parent identity but can be independently staked/rated. Reputation feedback on agent actions flows back to the parent $401 token.

### 8.4 Cross-Chain Agent Identity

For interoperability with ERC-8004 (Ethereum agent identity standard), agents can include cross-chain registrations:

```json
{
  "registrations": [
    { "chain": "bsv", "txid": "<$401 mint txid>" },
    { "chain": "eip155:1", "agentId": 42, "registry": "0x742..." },
    { "chain": "eip155:8453", "agentId": 15, "registry": "0xABC..." }
  ]
}
```

---

## 9. Domain Linking

A $401 token can claim ownership of domains by publishing a DNS TXT record:

### 9.1 DNS TXT Record

```
_401._domainkey.example.com TXT "v=401; p=<66-char compressed pubkey>; t=<$401 mint txid>"
```

### 9.2 Verification

1. Client resolves `_401._domainkey.example.com` TXT record
2. Extracts public key and $401 txid
3. Verifies the $401 token's `subject` matches the TXT record pubkey
4. Domain is now cryptographically linked to the identity

### 9.3 Token Links

```json
"links": {
  "402": ["<txid of linked $402 content tokens>"],
  "domains": [
    { "domain": "b0ase.com", "verified": true },
    { "domain": "path402.com", "verified": true }
  ]
}
```

---

## 10. Gossip Layer

$401 operations are propagated via the path402d gossip network on the `$401/identity/v1` topic.

### 10.1 Message Types

| Type | Description |
|------|-------------|
| `IDENTITY_ANNOUNCE` | Broadcast new or updated $401 token |
| `IDENTITY_REQUEST` | Request a specific identity by handle or pubkey |
| `STAKE_ANNOUNCE` | Broadcast new stake against an identity |
| `ATTESTATION_ANNOUNCE` | Broadcast new third-party attestation |
| `AGENT_ANNOUNCE` | Broadcast agent registration or update |

### 10.2 Discovery

Nodes maintain a local index of known identities. The gossip layer enables:
- Handle resolution (`$BOASE` → pubkey → full token data)
- Trust score lookup (aggregated locally from staking data)
- Agent discovery (find agents by capability or service type)

---

## 11. Compatibility Matrix

| Standard | Relationship | Notes |
|----------|-------------|-------|
| BRC-100 | Compatible | $401 tokens work with BRC-100 wallet API (certificate operations) |
| BRC-52 | Built on | Certificate structure, selective revelation, UTXO revocation |
| BRC-105 | Integrates | $401 identity used in HTTP 401/402 authentication flow |
| BAP | Compatible | URN attribute naming, key rotation model, attestation pattern |
| ERC-8004 | Interoperable | Cross-chain agent identity registration |
| Coinbase x402 | Bridgeable | Agent `x402Support` flag enables cross-protocol payment |

---

## 12. Identity Chains (Implemented)

The Identity Chain is the first practical implementation of $401 — a multi-strand identity tree built from OAuth proofs.

### 12.1 Concept

Every user gets one **identity root** (their anchor on-chain). Each OAuth provider they link becomes a **strand** — a branch of their digital DNA woven onto the root. More strands = stronger identity = higher confidence.

```
Identity Root (one per user)
├── GitHub strand    (OAuth proof hash)
├── Twitter strand   (OAuth proof hash)
├── LinkedIn strand  (OAuth proof hash)
├── Google strand    (OAuth proof hash)
├── Discord strand   (OAuth proof hash)
└── HandCash strand  (wallet proof hash)
```

The root inscription contains a `payTo` BSV address — this is the user's **on-chain bank account**. All $402 content revenue for this identity flows to that address.

### 12.2 On-Chain Inscription Format

Protocol prefix: `401`. Three operations:

**Root Inscription** — identity anchor (one per user):

```json
{
  "p": "401",
  "op": "root",
  "v": "1.0",
  "payTo": "1BrbnQon4uZPSxNwt19ozwtgHPDbgvaeD1",
  "ts": "2026-02-09T12:00:00Z"
}
```

**Strand Inscription** — OAuth identity link (one per provider):

```json
{
  "p": "401",
  "op": "strand",
  "v": "1.0",
  "root": "<root inscription txid>",
  "provider": "github",
  "handle": "b0ase",
  "proofHash": "<SHA-256 of OAuth token>",
  "metadata": {
    "bio": "...",
    "followers": 1234,
    "public_repos": 56
  },
  "ts": "2026-02-09T12:00:00Z"
}
```

**Update Inscription** — change payout address:

```json
{
  "p": "401",
  "op": "update",
  "v": "1.0",
  "root": "<root inscription txid>",
  "payTo": "<new BSV address>",
  "ts": "2026-02-09T12:00:00Z"
}
```

All inscriptions use OP_RETURN: `<"401"> <"application/json"> <json_payload>`.

### 12.3 Identity Strength Scoring

| Strands | Level | Meaning |
|---------|-------|---------|
| 1 | Weak | Single OAuth proof |
| 2 | Moderate | Two independent proofs |
| 3 | Strong | Three cross-platform proofs |
| 4+ | Verified | Rich multi-platform identity |

### 12.4 Supported Providers

| Provider | Data Captured | OAuth Flow |
|----------|--------------|------------|
| GitHub | username, bio, repos, followers, avatar | GitHub OAuth + API |
| Twitter | username, name, profile_image | Twitter OAuth 2.0 + PKCE |
| LinkedIn | name, handle, avatar | Supabase OIDC |
| Google | email, name, avatar | Supabase OAuth |
| Discord | username, avatar | Supabase OAuth |
| HandCash | handle, displayName, avatar | HandCash Connect SDK |

### 12.5 Security Model

- **OAuth token never stored** — only SHA-256 hash inscribed as proof
- **One provider per root** — `UNIQUE(root_id, provider)` constraint
- **On-chain = source of truth** — database is a cache/index for fast lookup
- **Any BSV wallet can create inscriptions** — not tied to any platform
- **Payout address updates audited** — change log in `identity_payout_updates` table

---

## 13. REST API Reference

Base URL: `https://b0ase.com/api/identity` (reference implementation)

### 13.1 Authenticated Endpoints

**Create Identity Root**

```
POST /api/identity/root
Body: { "payToAddress": "1..." }  (optional)
→ 201 { success, root: { id, rootTxid, payToAddress, strandCount } }
```

**Get My Identity**

```
GET /api/identity/root
→ 200 { exists, root: { ... }, strands: [...] }
```

**Mint Identity Strand**

```
POST /api/identity/strand/{provider}
Providers: github, twitter, linkedin, google, discord
→ 201 { success, strand: { id, provider, handle, strandTxid }, root: { ... } }
```

**Update Payout Address**

```
PUT /api/identity/payout
Body: { "payToAddress": "1..." }
→ 200 { success, previousAddress, newAddress, updateTxid }
```

### 13.2 Public Endpoints (No Auth)

**Lookup by Root TXID**

```
GET /api/identity/{rootTxid}
→ 200 { root, strands, strength: { score, level, strands } }
```

**Resolve Provider Handle**

```
GET /api/identity/resolve/{provider}/{handle}
→ 200 { found, root: { rootTxid, payToAddress }, matchedStrand, allStrands, strength }
```

This is the key lookup: *"Who is @b0ase on GitHub, and where do they get paid?"*

---

## 14. Database Schema (Cache/Index)

On-chain inscriptions are the source of truth. These tables are a fast cache shared across b0ase.com, path401.com, and bit-sign.online (same Supabase instance).

```sql
-- Identity root — one per user
CREATE TABLE identity_roots (
  id UUID PRIMARY KEY,
  unified_user_id UUID NOT NULL UNIQUE,
  root_txid TEXT,
  root_inscription_id TEXT,
  pay_to_address TEXT,
  strand_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Identity strands — one per OAuth provider per root
CREATE TABLE identity_strands (
  id UUID PRIMARY KEY,
  root_id UUID REFERENCES identity_roots(id),
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  provider_handle TEXT,
  provider_display_name TEXT,
  provider_avatar_url TEXT,
  provider_metadata JSONB DEFAULT '{}',
  strand_txid TEXT,
  parent_txid TEXT,
  oauth_verified_at TIMESTAMPTZ,
  proof_hash TEXT,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(root_id, provider)
);

-- Payout address change audit trail
CREATE TABLE identity_payout_updates (
  id UUID PRIMARY KEY,
  root_id UUID REFERENCES identity_roots(id),
  old_address TEXT,
  new_address TEXT NOT NULL,
  update_txid TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 15. Reference Implementation

### 15.1 Live Implementation (b0ase.com)

The first implementation lives at b0ase.com, shared with path401.com and bit-sign.online:

| File | Purpose |
|------|---------|
| `lib/identity/inscription.ts` | On-chain inscription format + OP_RETURN broadcast |
| `lib/identity/chain.ts` | CRUD for roots, strands, resolution, strength scoring |
| `app/api/identity/root/route.ts` | Create/get identity root |
| `app/api/identity/strand/[provider]/route.ts` | Mint OAuth strand |
| `app/api/identity/[rootTxid]/route.ts` | Public identity lookup |
| `app/api/identity/resolve/[provider]/[handle]/route.ts` | Resolve handle → identity |
| `app/api/identity/payout/route.ts` | Update payout address |

### 15.2 Future Implementations

- **path402d client**: `packages/core/src/identity/` — P2P gossip-based identity resolution
- **bit-sign.online**: Encrypted identity bundles (Confidence Level 1)
- **Standalone wallets**: Any BSV wallet can create $401 inscriptions directly using the OP_RETURN format above

---

## 16. Security Considerations

- **Key compromise**: Use `rotate` operation immediately. Previous key signs the rotation to maintain chain of custody.
- **Handle squatting**: First-to-inscribe wins. Disputed handles resolved by trust score and confidence level.
- **Sybil resistance**: Burn mechanics create a cost floor for identity creation. Staking creates ongoing accountability.
- **Privacy**: OAuth tokens hashed (SHA-256), never stored. Provider metadata is public by design (username, avatar). Sensitive claims use BRC-52 encrypted fields.
- **Agent containment**: `capitalLimit` prevents runaway agent spending. Parent can revoke agent delegation at any time.
- **Multi-platform correlation**: Each strand independently verifiable. Compromise of one provider doesn't invalidate others.

---

## 17. Relationship to $402 and $403

The three protocols form a regulatory taxonomy:

| Protocol | HTTP Status | Purpose | Analogy | Regulated? |
|----------|------------|---------|---------|------------|
| **$401** | 401 Unauthorized | Identity | Passport | No — identity is not a security |
| **$402** | 402 Payment Required | Content/Commodity | Vending machine | No — commodity token, algorithmic pricing |
| **$403** | 403 Forbidden | Securities/Access | Stock certificate | Yes — requires KYC, company-dependent payouts |

**$401 enables $402**: You need identity to receive revenue from content tokens.

**$401 gates $403**: Securities tokens require KYC-verified identity (Confidence Level 2+).

**$402 is independent**: Content tokens work without $401 identity (anonymous purchases allowed), but sellers need $401 to set their payout address.

---

## References

- [BRC-100: Wallet Interface](https://bsv.brc.dev/wallet/0100)
- [BRC-52: Identity Certificates](https://github.com/bitcoin-sv/BRCs/blob/master/wallet/0052.md)
- [BRC-105: HTTP Monetization](https://github.com/bitcoin-sv/BRCs/blob/master/payments/0105.md)
- [BAP: Bitcoin Attestation Protocol](https://github.com/icellan/bap)
- [ERC-8004: Trustless Agents](https://eips.ethereum.org/EIPS/eip-8004)
- [Coinbase x402](https://x402.org)
- [bitcoin-auth (b-open-io)](https://github.com/b-open-io/bitcoin-auth)

---

*$401 is part of the path402 Protocol ecosystem. Specification maintained at [path401.com](https://path401.com). This is the single source of truth for the $401 protocol.*
