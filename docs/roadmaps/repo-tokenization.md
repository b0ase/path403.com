# Repo Tokenization Implementation Roadmap
**BSV-First Strategy**

**Decision Date:** 2026-01-16
**Priority:** HIGH - Complete BSV MVP before multi-chain expansion
**Estimated Timeline:** 3-4 work sessions (8-12 hours total)

---

## Why BSV First?

✅ **Low transaction costs** - Tokenization won't cost users $50 in gas fees
✅ **Fast finality** - Instant confirmation for token operations
✅ **Data-optimized** - Can inscribe repo metadata on-chain cheaply
✅ **Existing wallet integration** - HandCash + Yours already connected
✅ **1Sat Ordinals** - Proven tokenization infrastructure

**Multi-chain later:** After BSV works, add Solana → Ethereum as needed.

---

## Phase 1: Fix GitHub OAuth Foundation (2 hours)
**Blocking everything else - must do first**

### 1.1 Update OAuth Scopes
**File:** `app/api/auth/github/route.ts`

```typescript
// Current (line 15):
scopes: 'read:user user:email',

// Change to:
scopes: 'read:user user:email public_repo',
```

**Why:** `public_repo` scope allows reading user's public repositories.

---

### 1.2 Add Token Storage Columns
**Create migration:** `supabase/migrations/20260116000000_add_github_token_storage.sql`

```sql
-- Add encrypted token storage to user_identities
ALTER TABLE user_identities
ADD COLUMN IF NOT EXISTS access_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token TEXT,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_identities_unified_provider
ON user_identities(unified_user_id, provider);

COMMENT ON COLUMN user_identities.access_token IS 'Encrypted OAuth access token';
COMMENT ON COLUMN user_identities.refresh_token IS 'Encrypted OAuth refresh token';
COMMENT ON COLUMN user_identities.token_expires_at IS 'Token expiration timestamp';
```

**Run migration:**
```bash
supabase db push
```

---

### 1.3 Store GitHub Token in Callback
**File:** `app/auth/callback/route.ts`

After line 69 (`exchangeCodeForSession`), add token extraction:

```typescript
const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

if (exchangeError) { /* existing error handling */ }

const supabaseUser = sessionData?.user

// ✅ NEW: Extract GitHub provider token
let githubAccessToken: string | null = null
if (supabaseUser?.app_metadata?.provider === 'github') {
  // Supabase stores provider tokens in session
  const { data: { session } } = await supabase.auth.getSession()
  githubAccessToken = session?.provider_token || null
}

// Continue with existing identity linking logic...
// When creating/updating user_identities record for GitHub, add:
if (githubAccessToken) {
  await supabase.from('user_identities').upsert({
    provider: 'github',
    provider_user_id: supabaseUser.id,
    provider_handle: supabaseUser.user_metadata?.user_name ? `@${supabaseUser.user_metadata.user_name}` : null,
    unified_user_id: targetUnifiedUserId,
    access_token: githubAccessToken, // ✅ Store token
    token_expires_at: session?.expires_at ? new Date(session.expires_at * 1000) : null
  })
}
```

**Note:** Supabase provides `provider_token` in the session after OAuth. This is the GitHub access token.

---

### 1.4 Create Token Retrieval Utility
**New file:** `lib/github-token.ts`

```typescript
import { createClient } from '@/lib/supabase/server';

export async function getUserGitHubToken(userId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_identities')
    .select('access_token, token_expires_at')
    .eq('unified_user_id', userId)
    .eq('provider', 'github')
    .single();

  if (error || !data?.access_token) {
    console.error('No GitHub token found for user:', userId);
    return null;
  }

  // TODO: Check token expiration and refresh if needed
  // For MVP, assume token is valid

  return data.access_token;
}

export async function getGitHubUsername(userId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('user_identities')
    .select('provider_handle')
    .eq('unified_user_id', userId)
    .eq('provider', 'github')
    .single();

  return data?.provider_handle?.replace('@', '') || null;
}
```

---

## Phase 2: Create Tokenized Repos Database (1 hour)

### 2.1 Database Schema
**Create migration:** `supabase/migrations/20260116000001_create_tokenized_repositories.sql`

```sql
-- Tokenized Repositories Table
CREATE TABLE IF NOT EXISTS public.tokenized_repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unified_user_id UUID REFERENCES public.unified_users(id) ON DELETE CASCADE NOT NULL,

  -- GitHub Data
  github_repo_id BIGINT NOT NULL,
  github_repo_name TEXT NOT NULL,
  github_owner TEXT NOT NULL,
  github_full_name TEXT NOT NULL, -- "owner/repo"
  github_description TEXT,
  github_stars INTEGER DEFAULT 0,
  github_forks INTEGER DEFAULT 0,
  github_language TEXT,
  github_url TEXT,

  -- Tokenization Status
  is_claimed BOOLEAN DEFAULT true,
  is_tokenized BOOLEAN DEFAULT false,

  -- BSV Token Data (MVP - single chain)
  token_symbol TEXT UNIQUE,
  token_chain TEXT DEFAULT 'BSV' CHECK (token_chain IN ('BSV', 'Solana', 'Ethereum')),
  token_contract_address TEXT, -- BSV: ordinal inscription ID
  token_supply BIGINT DEFAULT 1000000, -- 1M tokens by default

  -- Token Economics (configurable by user)
  price_per_star NUMERIC(20, 8), -- sats per GitHub star
  price_per_fork NUMERIC(20, 8), -- sats per fork
  price_per_commit NUMERIC(20, 8), -- sats per commit

  -- Wallet Addresses (for receiving funds)
  handcash_handle TEXT,
  yours_wallet_address TEXT,

  -- Timestamps
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tokenized_at TIMESTAMP WITH TIME ZONE,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(github_repo_id),
  CONSTRAINT valid_chain CHECK (token_chain IN ('BSV', 'Solana', 'Ethereum'))
);

-- Indexes for performance
CREATE INDEX idx_tokenized_repos_user ON tokenized_repositories(unified_user_id);
CREATE INDEX idx_tokenized_repos_github_id ON tokenized_repositories(github_repo_id);
CREATE INDEX idx_tokenized_repos_tokenized ON tokenized_repositories(is_tokenized);
CREATE INDEX idx_tokenized_repos_symbol ON tokenized_repositories(token_symbol);

-- RLS Policies
ALTER TABLE tokenized_repositories ENABLE ROW LEVEL SECURITY;

-- Users can view all tokenized repos (public marketplace)
CREATE POLICY "Anyone can view tokenized repos"
  ON tokenized_repositories FOR SELECT
  USING (is_tokenized = true);

-- Users can view their own repos (claimed or tokenized)
CREATE POLICY "Users can view their own repos"
  ON tokenized_repositories FOR SELECT
  USING (unified_user_id = auth.uid());

-- Users can insert their own repos
CREATE POLICY "Users can claim repos"
  ON tokenized_repositories FOR INSERT
  WITH CHECK (unified_user_id = auth.uid());

-- Users can update their own repos
CREATE POLICY "Users can update their own repos"
  ON tokenized_repositories FOR UPDATE
  USING (unified_user_id = auth.uid());

-- Users can delete their own repos
CREATE POLICY "Users can delete their own repos"
  ON tokenized_repositories FOR DELETE
  USING (unified_user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tokenized_repos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tokenized_repos_timestamp
  BEFORE UPDATE ON tokenized_repositories
  FOR EACH ROW
  EXECUTE FUNCTION update_tokenized_repos_updated_at();

COMMENT ON TABLE tokenized_repositories IS 'Stores GitHub repositories that have been claimed or tokenized on b0ase';
COMMENT ON COLUMN tokenized_repositories.token_contract_address IS 'BSV: Inscription ID, Solana: Token Mint Address, Ethereum: Contract Address';
COMMENT ON COLUMN tokenized_repositories.token_supply IS 'Total token supply (default 1M tokens)';
```

**Run migration:**
```bash
supabase db push
```

---

## Phase 3: Build Real Repo Fetching (2 hours)

### 3.1 User Repos API
**New file:** `app/api/user/github/repos/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserGitHubToken, getGitHubUsername } from '@/lib/github-token';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's GitHub token
    const token = await getUserGitHubToken(user.id);
    const username = await getGitHubUsername(user.id);

    if (!token || !username) {
      return NextResponse.json({
        error: 'GitHub not connected',
        message: 'Please connect your GitHub account first'
      }, { status: 400 });
    }

    // Fetch repos from GitHub
    const response = await fetch(
      `https://api.github.com/user/repos?sort=updated&direction=desc&per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GitHub API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch repositories from GitHub', details: errorData.message },
        { status: response.status }
      );
    }

    const repos = await response.json();

    // Filter to only public repos owned by the user (not forks)
    const ownedRepos = repos.filter((repo: any) =>
      !repo.fork &&
      !repo.private &&
      repo.owner.login === username
    );

    // Check which repos are already claimed/tokenized
    const repoIds = ownedRepos.map((r: any) => r.id);
    const { data: claimedRepos } = await supabase
      .from('tokenized_repositories')
      .select('github_repo_id, is_tokenized, token_symbol')
      .in('github_repo_id', repoIds);

    const claimedMap = new Map(
      claimedRepos?.map(r => [r.github_repo_id, r]) || []
    );

    // Enrich repos with tokenization status
    const enrichedRepos = ownedRepos.map((repo: any) => {
      const claimed = claimedMap.get(repo.id);
      return {
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updatedAt: repo.updated_at,
        url: repo.html_url,
        topics: repo.topics || [],
        isClaimed: !!claimed,
        isTokenized: claimed?.is_tokenized || false,
        tokenSymbol: claimed?.token_symbol || null,
      };
    });

    return NextResponse.json({
      repos: enrichedRepos,
      total: enrichedRepos.length,
    });

  } catch (error) {
    console.error('Error fetching user repos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}
```

---

### 3.2 Claim Repo API
**New file:** `app/api/repos/[repoId]/claim/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserGitHubToken } from '@/lib/github-token';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ repoId: string }> }
) {
  try {
    const { repoId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's GitHub token
    const token = await getUserGitHubToken(user.id);
    if (!token) {
      return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 });
    }

    // Fetch repo details from GitHub to verify ownership
    const response = await fetch(
      `https://api.github.com/repositories/${repoId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Repository not found or access denied' }, { status: 404 });
    }

    const repo = await response.json();

    // Verify user owns this repo
    const { data: githubIdentity } = await supabase
      .from('user_identities')
      .select('provider_handle')
      .eq('unified_user_id', user.id)
      .eq('provider', 'github')
      .single();

    const username = githubIdentity?.provider_handle?.replace('@', '');
    if (repo.owner.login !== username) {
      return NextResponse.json({
        error: 'You do not own this repository'
      }, { status: 403 });
    }

    // Check if already claimed
    const { data: existing } = await supabase
      .from('tokenized_repositories')
      .select('id')
      .eq('github_repo_id', repo.id)
      .single();

    if (existing) {
      return NextResponse.json({
        error: 'Repository already claimed',
        repoId: existing.id
      }, { status: 409 });
    }

    // Claim the repo
    const { data: claimed, error: claimError } = await supabase
      .from('tokenized_repositories')
      .insert({
        unified_user_id: user.id,
        github_repo_id: repo.id,
        github_repo_name: repo.name,
        github_owner: repo.owner.login,
        github_full_name: repo.full_name,
        github_description: repo.description,
        github_stars: repo.stargazers_count,
        github_forks: repo.forks_count,
        github_language: repo.language,
        github_url: repo.html_url,
        is_claimed: true,
        is_tokenized: false,
      })
      .select()
      .single();

    if (claimError) {
      console.error('Error claiming repo:', claimError);
      return NextResponse.json({ error: claimError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      repo: claimed,
    });

  } catch (error) {
    console.error('Error in claim repo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

### 3.3 Update Frontend to Use Real Data
**File:** `app/portfolio/repos/page.tsx`

Replace lines 169-184 (the demo connection logic) with:

```typescript
const [viewMode, setViewMode] = useState<ViewMode>('my-repos');
const [isGitHubConnected, setIsGitHubConnected] = useState(false);
const [userRepos, setUserRepos] = useState<any[]>([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  checkGitHubConnection();
}, []);

async function checkGitHubConnection() {
  try {
    const res = await fetch('/api/user/github/repos');
    if (res.ok) {
      const data = await res.json();
      setIsGitHubConnected(true);
      setUserRepos(data.repos);
    } else {
      setIsGitHubConnected(false);
    }
  } catch (error) {
    console.error('Error checking GitHub connection:', error);
    setIsGitHubConnected(false);
  }
}

const connectGitHub = () => {
  // Redirect to GitHub OAuth
  window.location.href = '/api/auth/github';
};
```

Replace `DEMO_USER_REPOS` usage with `userRepos` throughout the component.

---

## Phase 4: BSV Tokenization Backend (3 hours)

### 4.1 BSV Token Creation Utility
**New file:** `lib/bsv/create-token.ts`

```typescript
/**
 * BSV Token Creation for Repo Tokenization
 * Uses 1Sat Ordinals protocol
 */

import { PrivateKey, Transaction } from '@bsv/sdk';

interface RepoTokenMetadata {
  repoId: string;
  repoName: string;
  repoOwner: string;
  symbol: string;
  supply: number;
  stars: number;
  forks: number;
  description: string;
}

export async function createBSVRepoToken(
  metadata: RepoTokenMetadata,
  ownerPrivateKey: string
): Promise<{ inscriptionId: string; txid: string }> {

  // For MVP, we'll use 1Sat Ordinals API
  // TODO: Integrate with HandCash or direct BSV SDK

  const tokenData = {
    p: 'bsv-20', // BSV-20 token protocol
    op: 'deploy',
    tick: metadata.symbol,
    max: metadata.supply.toString(),
    lim: '1000', // Max mint per transaction
    dec: '0', // No decimals for simplicity

    // Custom metadata for repo tokens
    meta: {
      type: 'github-repo',
      repo: metadata.repoName,
      owner: metadata.repoOwner,
      stars: metadata.stars,
      forks: metadata.forks,
      description: metadata.description,
      platform: 'b0ase.com',
    }
  };

  // Create inscription transaction
  // This is a simplified example - real implementation needs proper UTXO management
  const privKey = PrivateKey.fromWif(ownerPrivateKey);

  // TODO: Build and broadcast inscription transaction
  // For now, return mock data
  console.log('Creating BSV token:', tokenData);

  return {
    inscriptionId: 'mock_inscription_id_' + Date.now(),
    txid: 'mock_txid_' + Date.now(),
  };
}

export async function mintRepoTokens(
  inscriptionId: string,
  amount: number,
  recipientAddress: string
): Promise<string> {
  // Mint tokens to recipient
  // TODO: Implement BSV-20 mint operation
  return 'mock_mint_txid';
}
```

---

### 4.2 Tokenize Repo API
**New file:** `app/api/repos/[repoId]/tokenize/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createBSVRepoToken } from '@/lib/bsv/create-token';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ repoId: string }> }
) {
  try {
    const { repoId } = await params;
    const body = await request.json();
    const {
      tokenSymbol,
      tokenSupply = 1000000,
      handcashHandle,
      yoursAddress,
    } = body;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get repo from database
    const { data: repo, error: repoError } = await supabase
      .from('tokenized_repositories')
      .select('*')
      .eq('id', repoId)
      .eq('unified_user_id', user.id)
      .single();

    if (repoError || !repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    if (repo.is_tokenized) {
      return NextResponse.json({
        error: 'Repository already tokenized',
        tokenSymbol: repo.token_symbol
      }, { status: 409 });
    }

    // Validate token symbol (3-6 uppercase letters)
    if (!/^[A-Z]{3,6}$/.test(tokenSymbol)) {
      return NextResponse.json({
        error: 'Invalid token symbol. Must be 3-6 uppercase letters.'
      }, { status: 400 });
    }

    // Check if symbol is already taken
    const { data: existing } = await supabase
      .from('tokenized_repositories')
      .select('id')
      .eq('token_symbol', tokenSymbol)
      .single();

    if (existing) {
      return NextResponse.json({
        error: `Token symbol ${tokenSymbol} is already taken`
      }, { status: 409 });
    }

    // TODO: Get user's BSV private key from wallet
    // For MVP, we'll use a system key and mint to user's address
    const systemKey = process.env.BSV_ORDINALS_PRIVATE_KEY!;

    // Create BSV token
    const { inscriptionId, txid } = await createBSVRepoToken(
      {
        repoId: repo.id,
        repoName: repo.github_repo_name,
        repoOwner: repo.github_owner,
        symbol: tokenSymbol,
        supply: tokenSupply,
        stars: repo.github_stars,
        forks: repo.github_forks,
        description: repo.github_description || '',
      },
      systemKey
    );

    // Update database
    const { data: updated, error: updateError } = await supabase
      .from('tokenized_repositories')
      .update({
        is_tokenized: true,
        token_symbol: tokenSymbol,
        token_chain: 'BSV',
        token_contract_address: inscriptionId,
        token_supply: tokenSupply,
        handcash_handle: handcashHandle,
        yours_wallet_address: yoursAddress,
        tokenized_at: new Date().toISOString(),
      })
      .eq('id', repoId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating repo:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      repo: updated,
      inscription: {
        id: inscriptionId,
        txid: txid,
        explorer: `https://whatsonchain.com/tx/${txid}`,
      },
    });

  } catch (error) {
    console.error('Error tokenizing repo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

### 4.3 Update Tokenization Flow UI
**File:** `app/portfolio/repos/[slug]/page.tsx`

Replace `handleTokenize` function (line 326) with:

```typescript
const handleTokenize = async () => {
  if (!canTokenize()) return;
  setIsTokenizing(true);

  try {
    // First, claim the repo if not already claimed
    if (!repo.isClaimed) {
      const claimRes = await fetch(`/api/repos/${repo.id}/claim`, {
        method: 'POST',
      });

      if (!claimRes.ok) {
        const error = await claimRes.json();
        throw new Error(error.error || 'Failed to claim repository');
      }
    }

    // Generate token symbol from repo name
    const symbolBase = repo.name
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .substring(0, 6);

    const tokenSymbol = symbolBase || 'REPO';

    // Tokenize on BSV
    const tokenizeRes = await fetch(`/api/repos/${repo.id}/tokenize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokenSymbol,
        tokenSupply: 1000000,
        handcashHandle: wallets.handcash ? 'user_handcash_handle' : null, // TODO: Get from auth
        yoursAddress: wallets.yours ? 'user_yours_address' : null, // TODO: Get from wallet
      }),
    });

    if (!tokenizeRes.ok) {
      const error = await tokenizeRes.json();
      throw new Error(error.error || 'Failed to tokenize repository');
    }

    const data = await tokenizeRes.json();
    console.log('Tokenized successfully:', data);

    setClaimStep(3);

    // Show success with inscription link
    alert(`Success! Token ${tokenSymbol} created on BSV.\nInscription: ${data.inscription.id}\nView: ${data.inscription.explorer}`);

  } catch (error: any) {
    console.error('Tokenization error:', error);
    alert(`Error: ${error.message}`);
  } finally {
    setIsTokenizing(false);
  }
};
```

---

## Phase 5: Exchange Integration (1 hour)

### 5.1 Add REPOS Market to Exchange
**File:** `app/exchange/page.tsx`

Update state initialization (line 59):

```typescript
const [activeMarket, setActiveMarket] = useState<MarketType>('REPOS'); // Changed from 'PROJECTS'
```

Add repos data fetching:

```typescript
const [repoTokens, setRepoTokens] = useState<any[]>([]);

useEffect(() => {
  if (activeMarket === 'REPOS') {
    fetchTokenizedRepos();
  }
}, [activeMarket]);

async function fetchTokenizedRepos() {
  try {
    const res = await fetch('/api/repos/tokenized');
    if (res.ok) {
      const data = await res.json();
      setRepoTokens(data.repos);
    }
  } catch (error) {
    console.error('Error fetching tokenized repos:', error);
  }
}
```

Update AssetList component to show repos when `activeMarket === 'REPOS'`.

---

### 5.2 Tokenized Repos Public API
**New file:** `app/api/repos/tokenized/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const { data: repos, error } = await supabase
      .from('tokenized_repositories')
      .select(`
        *,
        unified_users!inner (
          id,
          display_name
        )
      `)
      .eq('is_tokenized', true)
      .order('tokenized_at', { ascending: false });

    if (error) {
      console.error('Error fetching tokenized repos:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format for exchange UI
    const formattedRepos = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.github_repo_name,
      fullName: repo.github_full_name,
      owner: repo.github_owner,
      ownerName: repo.unified_users.display_name,
      description: repo.github_description,
      language: repo.github_language,
      stars: repo.github_stars,
      forks: repo.github_forks,
      tokenSymbol: repo.token_symbol,
      tokenChain: repo.token_chain,
      tokenSupply: repo.token_supply,
      inscriptionId: repo.token_contract_address,
      tokenizedAt: repo.tokenized_at,
      // TODO: Add real-time price/volume data from BSV blockchain
      price: 0.001, // Mock
      marketCap: repo.github_stars * 100, // Mock: stars * 100 sats
      volume24h: 0, // TODO: Calculate from transactions
      holders: 0, // TODO: Get from blockchain
    }));

    return NextResponse.json({
      repos: formattedRepos,
      total: formattedRepos.length,
    });

  } catch (error) {
    console.error('Error in tokenized repos API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## Testing Checklist

Before considering MVP complete:

- [ ] GitHub OAuth connects successfully
- [ ] User can see their actual GitHub repos in `/portfolio/repos`
- [ ] User can claim a repository (verified ownership)
- [ ] User can connect HandCash wallet
- [ ] User can tokenize a repo on BSV (creates inscription)
- [ ] Tokenized repo appears in `/exchange?tab=repos`
- [ ] Token symbol is unique and validated
- [ ] Database stores all tokenization metadata
- [ ] BSV transaction appears on blockchain explorer

---

## Environment Variables Required

Add to `.env.local`:

```bash
# BSV Blockchain
BSV_ORDINALS_PRIVATE_KEY=your-bsv-private-key-for-inscriptions

# GitHub OAuth (existing)
GITHUB_CLIENT_ID=your-oauth-app-client-id
GITHUB_CLIENT_SECRET=your-oauth-app-client-secret

# Optional: GitHub PAT for admin operations
GITHUB_TOKEN=your-personal-access-token
```

---

## Post-MVP Enhancements

**After BSV works end-to-end:**

1. **Token Economics**
   - Set price based on stars/forks/commits
   - Revenue sharing model for repo owners
   - Trading fees and liquidity

2. **Multi-Chain Support**
   - Solana integration (Phantom wallet)
   - Ethereum integration (MetaMask)
   - Cross-chain bridge

3. **Advanced Features**
   - Fractionalize repo ownership
   - Governance voting for tokenholders
   - Contributor token airdrops
   - Repository stats dashboard

4. **Security**
   - Token encryption in database
   - Rate limiting for GitHub API
   - Smart contract audits
   - Two-factor auth for tokenization

---

## Success Metrics

**MVP is successful when:**
1. A real user can connect GitHub
2. See their actual repositories
3. Tokenize one repo on BSV
4. Token appears on BSV blockchain
5. Token is tradeable on `/exchange`

**Estimated timeline:** 8-12 hours over 3-4 sessions

**Next:** Start with Phase 1 - Fix OAuth Foundation (2 hours)
