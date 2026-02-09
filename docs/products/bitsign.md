# BitSign - Product Requirements Document

> **Status**: Review
> **Owner**: Engineering Team
> **Last Updated**: 2026-01-29

---

## 1. Executive Summary

**One-liner**: Legally binding digital signatures verified on the Bitcoin blockchain.

**Problem**: Traditional digital signatures (DocuSign) rely on centralized databases for verification, lacking permanent, immutable proof of existence and ownership.

**Solution**: BitSign allows users to create digital signatures (drawn, typed, or uploaded) and verifies them using crypto wallets. Signatures and signed documents can be inscribed on the Bitcoin SV (BSV) blockchain for immutable proof.

**Target User**: Professionals, businesses, and individuals needing verifiable document signing.

---

## 2. Business Model

### Revenue Streams
| Stream | Description | Pricing |
|--------|-------------|---------|
| Inscriptions | Fee for on-chain proof | Transaction Fee + Service Fee |
| Premium | Advanced features (multi-sig, templates) | Subscription |

---

## 3. Core Features

### MVP (Current State)
1.  **Signature Creation**:
    -   Draw, Type, or Upload signatures.
    -   Persist draft state across sessions (localStorage).
2.  **Wallet Verification**:
    -   Verify identity via HandCash, Phantom, etc.
    -   "Identity First" architecture: User must be signed in to Supabase first.
3.  **Document Signing**:
    -   Apply signatures to documents.
    -   Generate SHA-256 hash of document content.
4.  **Blockchain Inscription**:
    -   Optional step to write proof to BSV.
5.  **Management**:
    -   View, delete, and set default signatures in `/user/account/signatures`.

---

## 4. Technical Architecture

### Key Components
-   **Frontend**: Next.js (`app/user/account/signatures`, `app/tools/bit-sign`)
-   **Auth**: Supabase (Primary), HandCash/Wallets (Secondary/Signing Tools)
-   **State Management**: `localStorage` (`bitsign_draft_state`) for cross-redirect persistence.

### Data Flow (Signature Creation)
```
[User] -> /user/account/signatures/create
   |
   v
[Draw/Type/Upload] -> [Save Draft to localStorage]
   |
   v
[Verify with Wallet] -> (If HandCash: Redirect to Auth -> Return to Page -> Restore State)
   |
   v
[Review & Save] -> POST /api/signatures -> [Supabase DB]
   |
   v
[Redirect] -> /user/account/signatures
```

### Key Integrations
-   **HandCash**: OAuth for verification, "Identity First" requires Supabase session + HandCash token.
-   **Supabase**: Stores user profile, signatures, and document metadata.

---

## 5. User Flows

### Signature Creation & Verification
1.  User navigates to "Create Signature".
2.  User draws or uploads a signature.
3.  User clicks "Verify".
4.  **Persistence Check**: App ensures draft is saved.
5.  **Wallet Connection**:
    -   If HandCash is not connected, user is redirected to HandCash OAuth.
    -   After auth, user is redirected back to `/user/account/signatures/create`.
    -   App restores draft state from `localStorage`.
6.  User signs a message with their wallet.
7.  User saves the signature.

---

## 6. Security Framework

### "Identity First" Policy
-   Wallets are treated as **Tools**, not primary identities.
-   Users must authenticate via Email/Socials (Supabase) before attaching a wallet.
-   This prevents account loss if a wallet is disconnected or compromised.

### State Persistence
-   **Risk**: Losing drawn signature updates during OAuth redirects.
-   **Mitigation**: `localStorage` saves the full state (`svg_data`, `step`, etc.) before any redirect. The page automatically restores this state on load.

---

## 7. Changelog

| Date       | Change                                                                 | Author      |
|------------|------------------------------------------------------------------------|-------------|
| 2026-01-29 | Refactored Creation Flow to `/user/account/signatures`, Added Persistence | Engineering |
