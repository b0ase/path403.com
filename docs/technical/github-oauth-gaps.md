# GitHub OAuth Integration Gaps for Repo Tokenization

**Date:** 2026-01-16
**Status:** INCOMPLETE - Requires Implementation
**Priority:** HIGH - Blocking full repo tokenization functionality

---

## Executive Summary

The repo tokenization system (`/portfolio/repos` and `/exchange?tab=repos`) has been designed on the laptop but is **not properly connected** for individual users to connect their own GitHub accounts and tokenize their repositories. The current implementation uses demo data and simulated OAuth flows.

---

## Current State

### ✅ What's Working

1. **UI/UX Complete**:
   - `/portfolio/repos/page.tsx` - Full 3-tab interface (My Repos, Trending, Tokenized)
   - `/portfolio/repos/[slug]/page.tsx` - Complete tokenization flow UI with multi-chain support
   - `/exchange` - REPOS tab exists in market selector
   - Beautiful UI with wallet connection simulation

2. **GitHub OAuth Exists**:
   - `/app/api/auth/github/route.ts` - Supabase OAuth integration
   - `/app/auth/callback/route.ts` - Unified auth callback handler
   - Auth system properly links GitHub to unified_users table

3. **Database Schema**:
   - `user_identities` table tracks GitHub OAuth connections
   - `unified_users` table for cross-provider identity management

### ⚠️ What's Missing

#### 1. **Insufficient OAuth Scopes**

**Current Scopes** (`app/api/auth/github/route.ts:15`):
```typescript
scopes: 'read:user user:email',
```

**Required Scopes for Repo Tokenization**:
```typescript
scopes: 'read:user user:email public_repo'
// OR for private repos:
scopes: 'read:user user:email repo'
```

**Impact**: Cannot fetch user's repositories via GitHub API after OAuth

---

#### 2. **No GitHub Token Storage**

After successful GitHub OAuth, we get:
- User profile (username, email, avatar)
- GitHub user ID

But we **DO NOT** store:
- GitHub OAuth access token (needed for API calls)
- Token expiration time
- Refresh token

**Current Supabase Auth**: Stores session in `auth.users` but doesn't expose GitHub access token to API routes.

**Solution Needed**:
```typescript
// Store in user_identities table:
{
  provider: 'github',
  provider_user_id: github_user_id,
  provider_handle: '@username',
  access_token: encrypted_token, // NEW
  refresh_token: encrypted_token, // NEW
  token_expires_at: timestamp, // NEW
  unified_user_id: uuid
}
```

---

#### 3. **API Routes Using Wrong Authentication**

**Current Implementation**:
```typescript
// app/api/developers/[developerId]/repos/route.ts:10
const token = process.env.GITHUB_TOKEN; // ❌ Using single PAT for all users
```

**Correct Implementation Needed**:
```typescript
// Fetch user's own GitHub token from database
const { data: githubIdentity } = await supabase
  .from('user_identities')
  .select('access_token')
  .eq('unified_user_id', currentUser.id)
  .eq('provider', 'github')
  .single();

const token = githubIdentity.access_token; // ✅ User's own OAuth token
```

---

#### 4. **Missing Database Tables for Tokenized Repos**

No storage for:
- Which repos have been tokenized
- Token metadata (symbol, chain, contract address)
- Repo ownership verification
- Tokenization status tracking

**Proposed Schema**:
```sql
CREATE TABLE tokenized_repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unified_user_id UUID REFERENCES unified_users(id) NOT NULL,

  -- GitHub Data
  github_repo_id BIGINT NOT NULL,
  github_repo_name TEXT NOT NULL,
  github_owner TEXT NOT NULL,
  github_full_name TEXT NOT NULL, -- "owner/repo"

  -- Tokenization Data
  is_tokenized BOOLEAN DEFAULT false,
  token_symbol TEXT,
  token_chain TEXT CHECK (token_chain IN ('BSV', 'Solana', 'Ethereum')),
  token_contract_address TEXT,
  token_supply BIGINT,

  -- Metadata
  claimed_at TIMESTAMP DEFAULT NOW(),
  tokenized_at TIMESTAMP,
  repo_stars INTEGER,
  repo_forks INTEGER,

  UNIQUE(github_repo_id),
  UNIQUE(token_symbol)
);
```

---

#### 5. **No Real-Time Repo Sync**

Users see demo data, not their actual GitHub repos:
- `/portfolio/repos` shows `DEMO_USER_REPOS` (hardcoded)
- No API endpoint to fetch user's real repos from GitHub
- No sync mechanism when repos are updated

**Required API Endpoints**:
```
GET  /api/user/github/repos           # Fetch my repos from GitHub
POST /api/repos/[repoId]/claim        # Claim ownership
POST /api/repos/[repoId]/tokenize     # Tokenize a claimed repo
GET  /api/repos/tokenized             # List all tokenized repos on platform
```

---

#### 6. **Wallet Connection Flow Incomplete**

Current flow (`/portfolio/repos/[slug]/page.tsx`):
```typescript
const connectWallet = async (type: WalletType) => {
    // Demo: simulate wallet connection
    await new Promise(resolve => setTimeout(resolve, 1000)); // ❌ Simulation
    setWallets(prev => ({ ...prev, [type]: true }));
};
```

**Required Integration**:
- HandCash wallet connection (already exists at `/api/auth/handcash`)
- Yours Wallet connection (BSV)
- Phantom connection (Solana)
- MetaMask connection (Ethereum)
- Actual token deployment to blockchain

---

## Architecture Diagram

```
┌─────────────────────┐
│  User clicks        │
│ "Connect GitHub"    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│ /api/auth/github                │
│ - Redirects to GitHub OAuth     │
│ - Scopes: read:user, public_repo│ ← FIX NEEDED
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ GitHub Authorization Screen     │
│ User approves access            │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ /auth/callback                  │
│ - Exchange code for session     │
│ - Store GitHub token ← MISSING  │
│ - Link to unified_user          │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ GET /api/user/github/repos      │ ← NEW ENDPOINT NEEDED
│ - Fetch repos using user's token│
│ - Cache in tokenized_repositories│
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ /portfolio/repos                │
│ - Display user's actual repos   │
│ - Show tokenization status      │
└─────────────────────────────────┘
```

---

## Implementation Checklist

### Phase 1: Fix OAuth Scopes & Token Storage
- [ ] Update GitHub OAuth scopes to include `public_repo`
- [ ] Add `access_token`, `refresh_token`, `token_expires_at` columns to `user_identities`
- [ ] Store GitHub token in `/auth/callback` after successful OAuth
- [ ] Encrypt tokens at rest (use Supabase vault or encryption)

### Phase 2: Database Schema
- [ ] Create `tokenized_repositories` table
- [ ] Add RLS policies for user access control
- [ ] Create indexes for performance

### Phase 3: API Endpoints
- [ ] `GET /api/user/github/repos` - Fetch user's repos using their token
- [ ] `POST /api/repos/[repoId]/claim` - Verify ownership and claim repo
- [ ] `POST /api/repos/[repoId]/tokenize` - Deploy token to blockchain
- [ ] `GET /api/repos/tokenized` - Public list of all tokenized repos

### Phase 4: Frontend Integration
- [ ] Replace demo data in `/portfolio/repos` with real API calls
- [ ] Implement real wallet connections (HandCash, Phantom, MetaMask)
- [ ] Add loading states and error handling
- [ ] Implement token deployment UI

### Phase 5: Exchange Integration
- [ ] Add REPOS market to `/exchange` with real data
- [ ] Show tokenized repos in asset list
- [ ] Enable trading of repo tokens
- [ ] Add market metrics (price, volume, holders)

---

## Security Considerations

1. **Token Encryption**: GitHub access tokens must be encrypted
2. **Rate Limiting**: GitHub API has rate limits (5000 req/hour authenticated)
3. **Ownership Verification**: Must verify user actually owns the repo before tokenization
4. **Smart Contract Security**: Token contracts must be audited before deployment
5. **Private Repos**: If supporting private repos, need `repo` scope (full access) - security risk

---

## Environment Variables Needed

```bash
# .env.local
GITHUB_CLIENT_ID=your-oauth-app-client-id
GITHUB_CLIENT_SECRET=your-oauth-app-client-secret

# For admin/system operations (optional, separate from user OAuth):
GITHUB_TOKEN=your-personal-access-token
```

**Note**: `GITHUB_TOKEN` (PAT) is different from user OAuth tokens. PAT is for admin operations, OAuth tokens are per-user for accessing their repos.

---

## Next Steps

1. **Immediate**: Fix OAuth scopes and token storage
2. **Short-term**: Build `/api/user/github/repos` endpoint
3. **Medium-term**: Implement repo claiming and tokenization backend
4. **Long-term**: Full blockchain integration for actual token deployment

---

## Questions for User

1. Which chains should we prioritize for MVP? (BSV, Solana, Ethereum)
2. Should we support private repo tokenization? (Requires broader OAuth scope)
3. What's the token economics model? (1 token = 1 repo star? Fixed supply?)
4. How do we handle repo ownership transfers on GitHub?
5. Do we need approval/review before a repo can be tokenized?

---

**Status**: Ready for implementation planning with user approval.
