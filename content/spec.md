# $403 Access Control Standard

## Abstract

The $403 standard defines a protocol for on-chain, programmable access control rules. It completes the HTTP status code stack alongside $401 (identity) and $402 (payment). Where $401 answers "who are you?" and $402 answers "will you pay?", $403 answers "are you allowed?"

$403 rules are inscribed on-chain, composable with $401 and $402 tokens, and machine-readable. Every 403 response includes a structured explanation of the violated rule and the conditions required to satisfy it.

## Terminology

| Term | Definition |
|------|-----------|
| **Ruleset** | An ordered list of $403 rules attached to a tokenised domain or content address |
| **Gate** | A single access control rule within a ruleset |
| **Evaluator** | The node or client that evaluates $403 rules against an incoming request |
| **Denial** | A structured 403 response explaining which gate failed and what would satisfy it |
| **Remedy** | The action a requester can take to satisfy a failed gate |

## Rule Structure

Each $403 rule is a JSON object inscribed on-chain:

```json
{
  "type": "geo_gate",
  "version": 1,
  "condition": {
    "allow": ["GB", "US", "DE"],
    "deny": []
  },
  "remedy": {
    "type": "vpn_warning",
    "message": "This content is restricted to UK, US, and German jurisdictions."
  },
  "created_at": "2026-02-08T00:00:00Z",
  "created_by": "$BOASE"
}
```

## Gate Types

### Geo-Gate

Restricts access by geographic jurisdiction. Uses IP geolocation or $401 identity jurisdiction claims.

| Field | Type | Description |
|-------|------|-------------|
| `allow` | `string[]` | ISO 3166-1 alpha-2 country codes to allow |
| `deny` | `string[]` | ISO 3166-1 alpha-2 country codes to deny |
| `priority` | `"allow" \| "deny"` | Which list takes precedence on conflict |

If both `allow` and `deny` are empty, the gate passes (no restriction).

### Time-Lock

Embargoes content until a specific timestamp or block height.

| Field | Type | Description |
|-------|------|-------------|
| `unlock_at` | `string` | ISO 8601 timestamp for time-based unlock |
| `block_height` | `number` | BSV block height for chain-based unlock |
| `mode` | `"before" \| "after" \| "between"` | When content is accessible |
| `end_at` | `string?` | Optional end timestamp for `between` mode |

### Blacklist

Denies access to specific identities or addresses.

| Field | Type | Description |
|-------|------|-------------|
| `addresses` | `string[]` | BSV addresses to deny |
| `identities` | `string[]` | $401 token symbols to deny |
| `reason` | `string` | Human-readable reason for denial |
| `authority` | `string?` | Optional reference to legal or compliance basis |

### Identity-Gate

Requires a minimum $401 identity confidence level.

| Field | Type | Description |
|-------|------|-------------|
| `min_level` | `0 \| 1 \| 2 \| 3` | Minimum $401 confidence level required |
| `require_stakers` | `number?` | Minimum number of unique stakers |
| `min_stake` | `number?` | Minimum total stake in satoshis |

### Token-Gate

Requires ownership of specific tokens.

| Field | Type | Description |
|-------|------|-------------|
| `tokens` | `string[]` | Token symbols required (e.g., `["$KWEG", "$BOASE"]`) |
| `mode` | `"any" \| "all"` | Whether any one or all tokens are required |
| `min_balance` | `number?` | Minimum token balance required |

### Custom Logic

Arbitrary programmable conditions expressed as a script or smart contract reference.

| Field | Type | Description |
|-------|------|-------------|
| `script` | `string` | Script hash or transaction ID containing the logic |
| `params` | `object` | Parameters to pass to the script |
| `timeout` | `number` | Maximum evaluation time in milliseconds |

## Ruleset Evaluation

Rulesets are evaluated in order. The first failing gate produces the 403 response. This is important — it means rule ordering affects behaviour.

```
REQUEST → Gate 1 (geo) → Gate 2 (time) → Gate 3 (identity) → PASS → $401 → $402 → CONTENT
                ↓              ↓               ↓
              DENY           DENY            DENY
           (403 + remedy)  (403 + remedy)  (403 + remedy)
```

## Denial Response Format

Every 403 response includes a structured JSON body:

```json
{
  "status": 403,
  "protocol": "$403",
  "gate_type": "geo_gate",
  "gate_index": 0,
  "message": "This content is restricted to UK, US, and German jurisdictions.",
  "remedy": {
    "type": "geo_requirement",
    "required": ["GB", "US", "DE"],
    "detected": "CN"
  },
  "ruleset_txid": "abc123...",
  "evaluated_at": "2026-02-08T12:00:00Z"
}
```

Clients and agents can parse this response to understand what went wrong and what action to take.

## Composability with $401 and $402

$403 rules can reference $401 and $402 state:

- **Identity-gate** reads the requester's $401 token level and staking status
- **Token-gate** checks $402 token ownership in the requester's wallet
- **Custom logic** can combine arbitrary $401 and $402 conditions

The evaluation order is always: $403 → $401 → $402. Permissions first, identity second, payment last.

## On-Chain Storage

Rulesets are inscribed as BSV transactions. Each rule is a separate output in a ruleset transaction. The ruleset transaction ID is linked to the domain via DNS TXT record or content address.

```
domain.com TXT "bsv:1A3x7Bf..." "rules:abc123..."
```

Rules can be updated by the domain's majority token holders (51% governance via DNS-DEX).

## Versioning

The $403 standard uses semantic versioning. All rules include a `version` field. Evaluators must support all versions up to the current major version.

Current version: **1.0.0**

## Security Considerations

- **Rule immutability**: Once inscribed, rules cannot be modified — only superseded by a new ruleset transaction
- **Evaluator trust**: The evaluator (node) must be trusted to honestly evaluate rules. Dishonest evaluation is detectable by comparing responses across multiple nodes
- **Privacy**: Geo-gate evaluation requires IP geolocation, which may leak location data. $401 identity-based jurisdiction claims are a privacy-preserving alternative
- **Denial of service**: Custom logic gates with long execution times are bounded by the `timeout` field. Evaluators should reject scripts that exceed timeout

## Reference Implementation

The reference implementation is part of the path402d client. $403 rule evaluation is built into the content serving pipeline.

```
GET /content/article-123
→ path402d evaluates $403 ruleset
→ if PASS: proceed to $401/$402
→ if DENY: return structured 403 response
```

---

*$403 Access Control Standard v1.0.0*
*Part of the $401/$402/$403 Protocol Stack*
*path403.com — path402.com — path401.com*
