# BRC Alignment & Architecture

**Version**: 1.1.0
**Context**: Alignment with the BRC Standard Stack (based on feedback from Bob Babbage)

This document maps the $402 / Path402 architecture to the official **Bitcoin SV Technical Standards (BRCs)**.

---

## The BRC Stack Mapping

| Layer | BRC Standard | Role in Path402 |
|-------|-------------|-----------------|
| **Application Interface** | [**BRC-100**](https://github.com/bitcoin-sv/BRCs/blob/master/wallet/0100.md) | The wallet-to-application interface. Path402 clients (like `path402d`) implement this to be vendor-neutral. |
| **Peer Identity** | [**BRC-103**](https://github.com/bitcoin-sv/BRCs/blob/master/peer-to-peer/0103.md) | Mutual authentication and certificate exchange. Essential for "Proof of Serve" validation and secure sessions. |
| **HTTP Transport** | [**BRC-104**](https://github.com/bitcoin-sv/BRCs/blob/master/peer-to-peer/0104.md) | Maps BRC-103 identity onto HTTP headers (`X-BSV-Auth`). Used for all authenticated API calls. |
| **Payments (402)** | [**BRC-105**](https://github.com/bitcoin-sv/BRCs/blob/master/payments/0105.md) | **Normative**. The standard HTTP 402 handshake. Path402 uses BRC-105 headers/challenges instead of custom JSON. |
| **Discovery / Index** | [**BRC-22**](https://github.com/bitcoin-sv/BRCs/blob/master/overlays/0022.md) | **Overlay Submission**. How indexers accept new $path state / topic updates. |
| **State Lookup** | [**BRC-24**](https://github.com/bitcoin-sv/BRCs/blob/master/overlays/0024.md) | **Overlay Lookup**. How clients query the state of a $path (pricing, ownership). |

---

## Additive Layers (Extensions)

The following components of Path402 are **additive** to the BRC stack. They do not replace BRCs but sit on top or alongside them.

| Component | Status | Description |
|-----------|--------|-------------|
| **EARN / Proof-of-Serve** | **New Proposal** | An incentive layer for operators. Defines *why* an operator should run BRC-22/24 nodes. Uses BRC-103 identity to track reputation. |
| **$path Namespace** | **UX Convention** | The `$path` URL scheme is a human-readable convention, not a technical replacement for BRC protocols. |
| **$402 Token** | **Asset** | PoW20 Hash-to-Mint (BSV-21) protocol token. Earned by running nodes. Stake with $401 KYC to earn serving revenue. Not a protocol primitive. |

---

## Implementation Strategy

### 1. Payments: BRC-105 (Normative)
We adopt BRC-105 as the *only* official way to perform the 402 handshake on BSV.
*   **Request**: `GET /resource`
*   **Response**: `402 Payment Required` with `x-bsv-payment-dest`, `x-bsv-payment-amount`.
*   **Payment**: Client broadcasts tx, sends `x-bsv-payment-txid` in retry.
*   **Validation**: Server verifies tx against 0-conf policy.

### 2. Authentication: BRC-103/104 (Required for Sessions)
All "session-based" interactions (streaming, subscriptions, high-value API) MUST be authenticated.
*   Prevent replay attacks.
*   Bind payments to a specific peer identity.
*   Allow "reputation" tracking for operators.

### 3. Discovery: BRC-22/24 (Overlay Network)
We stop treating `path402d` as a unique p2p network and instead define it as a **BRC-22/24 Overlay**.
*   **Topic**: `path402`
*   **Key**: `$path` (e.g. `$example.com`)
*   **Value**: Current state (pricing, ownership, children).

### 4. Client: BRC-100 (Universal Wallet)
The reference client will be refactored to consume any BRC-100 compliant wallet, rather than bundling its own key management. This maximizes adoption across existing wallet users (HandCash, Yours, etc., once they implement BRC-100).
