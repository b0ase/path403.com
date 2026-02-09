# B0ASE Repository Token Standard (BRTS-1)

## Abstract
The B0ASE Repository Token Standard (BRTS-1) defines a protocol for binding a specific Git repository to a cryptographic token on the Bitcoin SV (BSV) blockchain. This standard creates a "Repo Asset" that enables:
1.  **Verified Ownership**: Cryptographic proof that the token issuer controls the repository.
2.  **Revenue Routing**: A standardized method for directing funds (stablecoins/BSV) to the repository's treasury.
3.  **Upstream Equity**: A mechanism for "forks" and "dependencies" to automatically allocate equity or revenue back to parent repositories.

## 1. The Binding Mechanism: `token.json`

To tokenize a repository, the maintainer must commit a `token.json` file to the root directory of the repository. This file acts as the repository's "Digital Charter" and "Genesis Block".

### 1.1 Integrity Verification
The B0ASE platform monitors the repository. A valid state requires:
1.  The `token.json` file exists in the `main` or `master` branch.
2.  The `owner_identity` in the file matches the BSV identity key signing the token minting transaction.
3.  (Optional) A cryptographic signature of the file content key is present in the commit description or a separate `.sig` file.

## 2. The Schema

The `token.json` file must adhere to the following structure:

```json
{
  "version": "1.0",
  "project": {
    "name": "Project Name",
    "description": "Short description of the repository's value proposition.",
    "repo_url": "https://github.com/username/repo-name",
    "license": "MIT",
    "website": "https://project-website.com"
  },
  "asset": {
    "ticker": "PROJ",
    "supply": 100000,
    "chain": "BSV",
    "protocol": "BSV-20",
    "contract_address": "txid_of_inscription" 
  },
  "economics": {
    "treasury_wallet": "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
    "model": "DIVIDEND", // Options: "DIVIDEND" | "BUYBACK_BURN"
    "payout_frequency": "QUARTERLY"
  },
  "upstream_covenant": {
    "enabled": true,
    "description": "Allocations to dependencies and parent forks.",
    "beneficiaries": [
      {
        "repo": "https://github.com/b0ase/core",
        "allocation_percent": 5.0,
        "type": "EQUITY" // This repo grants 5% of its token supply to b0ase/core treasury
      },
      {
        "repo": "https://github.com/bitcoin-sv/bitcoin-sv",
        "allocation_percent": 1.0,
        "type": "REVENUE" // This repo grants 1% of gross revenue to this upstream project
      }
    ]
  },
  "governance": {
    "method": "OWNER_DICTATORSHIP", // Options: "DAO_VOTE" | "OWNER_DICTATORSHIP"
    "statement": "Token holders are entitled to economic rights but hold no governance power over code merges."
  }
}
```

## 3. Economic Primitives

### 3.1 The Treasury
The `treasury_wallet` is the single point of truth for economic inflows. All revenue (SaaS fees, licensing, donations) must flow to this address to be considered "Project Revenue".

### 3.2 Distribution Models
*   **DIVIDEND**: The treasury accumulates funds. At `payout_frequency`, the `owner` executes a script that snapshots the token ledger and distributes funds pro-rata to all holders.
*   **BUYBACK_BURN**: The treasury accumulates funds. Periodically, the `owner` uses funds to market-buy the asset class token on open markets and sends them to a burn address (e.g., `OP_RETURN`). This increases the scarcity and value of remaining tokens.

## 4. The Upstream Covenant (Equity Graph)

This primitive solves the "Open Source Funding Problem".

### 4.1 Definition
When a repository is tokenized, it acknowledges its debt to the giants it stands upon. The `upstream_covenant` defines this relationship.

### 4.2 The "Parent Share" Action
If Repo B (The Child) declares Repo A (The Parent) as a beneficiary with `type: EQUITY`:
1.  Upon minting Repo B tokens, the specified % is reserved.
2.  These tokens are sent to Repo A's `treasury_wallet`.
3.  **Result**: Repo A automatically becomes a shareholder in Repo B. If Repo B succeeds, Repo A succeeds.

## 5. Legal Wrapper

This standards document asserts that the Token defined in `asset` and the Code defined in `project` are essentially linked.

*   **Offer**: The presence of this file constitutes a standing offer to token holders regarding the economic flows defined in `economics`.
*   **Acceptance**: Purchase or holding of the token constitutes acceptance of the `governance` model (e.g., accepting that holders do not control code).
*   **Jurisdiction**: As defined in the token's initial minting inscription (defaulting to UK/Common Law applicability via contract theory).

## 6. Lifecycle

1.  **Initialization**: `token.json` committed. Token Inscribed.
2.  **Verification**: B0ASE platform indexes file, verifies identity, marks token as "Verified Repo Asset".
3.  **Operation**: Revenue flows to Treasury.
4.  **Termination**: If repo is archived or abandoned, `model` should switch to "LIQUIDATION" where remaining treasury is paid out and token is effectively deprecated.
