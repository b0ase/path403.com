# Auth Simplification Strategy - Handoff Document

**Date:** January 17, 2026
**Status:** Current auth is broken, needs complete simplification
**Goal:** Replace complex multi-auth system with dead-simple account model

---

## Current Problem

**What's broken:**
- 10+ commits of auth bug fixes, still broken
- Complex `user_identities` table with collision logic
- PKCE cookie issues across subdomains
- Identity merging attempts causing conflicts
- "WIP: GitHub repos debugging - broken auth state"
- Users can't reliably login or connect accounts

**Root cause:**
- Trying to be too smart about identity merging
- Checking if providers are "the same person"
- Complex collision detection
- Multiple auth flows competing

---

## New Strategy: Radical Simplification

### Core Principle

**Every signup creates a new account. We don't care if it's the same human.**

### Rules

1. **Signup/Login:**
   - User signs up with Google → creates account A
   - User signs up with MetaMask → creates account B
   - Even if same person → 2 accounts (their problem, not ours)
   - No merging, no collision checks, no complexity

2. **Connected Accounts (inside user account):**
   - "Connect GitHub" → links GitHub to current account for API access
   - "Connect Discord" → links Discord to current account for community
   - These are NOT login methods, just data access
   - No collision checks (if GitHub is already someone's login, we don't care)

3. **If user is confused:**
   - They have multiple accounts → their fault
   - Response: "Pick one, delete the other"
   - We don't merge accounts

### Why This Works

**Benefits:**
- Zero collision logic needed
- Zero merge complexity
- Zero edge cases
- Simple mental model: 1 signup = 1 account
- Each auth method validates independently
- Clear ownership (no orphaned identities)

**Trade-offs:**
- Users might create duplicate accounts → acceptable
- No "smart" merging → good (it never worked anyway)
- User confusion → minimal (clearer than current state)

---

## Database Schema

### New Tables

```sql
-- Simple users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR, -- optional, for notifications
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- All auth methods (login + connected)
CREATE TABLE auth_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  provider VARCHAR NOT NULL, -- 'google', 'github', 'metamask', 'handcash', etc.
  provider_user_id VARCHAR NOT NULL, -- their ID at that provider

  purpose VARCHAR NOT NULL, -- 'login' or 'connected'

  -- OAuth tokens (for connected accounts with API access)
  oauth_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  -- Metadata
  provider_email VARCHAR, -- optional, from OAuth
  provider_username VARCHAR, -- optional, from OAuth

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(provider, provider_user_id, purpose),
  CHECK (purpose IN ('login', 'connected'))
);

CREATE INDEX idx_auth_methods_user ON auth_methods(user_id);
CREATE INDEX idx_auth_methods_login ON auth_methods(provider, provider_user_id, purpose);
```

### What This Means

**One user:**
```
users:
  id: user-123
  email: richard@b0ase.com

auth_methods:
  - provider: 'google', provider_user_id: 'google-abc', purpose: 'login'
  - provider: 'github', provider_user_id: 'github-xyz', purpose: 'connected', oauth_token: 'gho_...'
  - provider: 'metamask', provider_user_id: '0x123...', purpose: 'connected'
```

**Another user (might be same human, we don't care):**
```
users:
  id: user-456
  email: richard@b0ase.com

auth_methods:
  - provider: 'metamask', provider_user_id: '0x123...', purpose: 'login'
  - provider: 'discord', provider_user_id: 'discord-789', purpose: 'connected'
```

**Notice:**
- Same wallet (`0x123...`) used in both accounts
- One as login, one as connected
- No conflict, no problem

---

## Implementation Plan

### Phase 1: New Auth System (DO NOT TOUCH OLD CODE YET)

**Step 1: Create new tables**
```sql
-- Run migration
CREATE TABLE users (...);
CREATE TABLE auth_methods (...);
```

**Step 2: New auth utilities**

Create `lib/auth/simple-auth.ts`:

```typescript
import { db } from '@/lib/db';

export async function findOrCreateUser(
  provider: string,
  providerUserId: string,
  providerEmail?: string
) {
  // Find existing login method
  let authMethod = await db.auth_methods.findFirst({
    where: {
      provider,
      provider_user_id: providerUserId,
      purpose: 'login'
    },
    include: { user: true }
  });

  if (!authMethod) {
    // New user - create account + login method
    const user = await db.users.create({
      data: { email: providerEmail }
    });

    authMethod = await db.auth_methods.create({
      data: {
        user_id: user.id,
        provider,
        provider_user_id: providerUserId,
        purpose: 'login',
        provider_email: providerEmail
      },
      include: { user: true }
    });
  }

  return authMethod.user;
}

export async function connectAccount(
  userId: string,
  provider: string,
  providerUserId: string,
  oauthToken?: string,
  refreshToken?: string,
  expiresAt?: Date
) {
  // Just add it - no collision checks
  return await db.auth_methods.create({
    data: {
      user_id: userId,
      provider,
      provider_user_id: providerUserId,
      purpose: 'connected',
      oauth_token: oauthToken,
      refresh_token: refreshToken,
      token_expires_at: expiresAt
    }
  });
}

export async function getConnectedAccount(
  userId: string,
  provider: string
) {
  return await db.auth_methods.findFirst({
    where: {
      user_id: userId,
      provider,
      purpose: 'connected'
    }
  });
}

export async function disconnectAccount(
  userId: string,
  provider: string
) {
  await db.auth_methods.deleteMany({
    where: {
      user_id: userId,
      provider,
      purpose: 'connected'
    }
  });
}
```

**Step 3: New auth callback handler**

Create `app/auth/simple-callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { findOrCreateUser } from '@/lib/auth/simple-auth';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const provider = searchParams.get('provider'); // 'google', 'github', etc.

  if (!code || !provider) {
    return NextResponse.redirect(new URL('/login?error=missing_params', request.url));
  }

  try {
    // Exchange code for user info (provider-specific)
    const { providerUserId, email } = await exchangeCodeForUserInfo(provider, code);

    // Find or create user
    const user = await findOrCreateUser(provider, providerUserId, email);

    // Create Supabase session
    const supabase = await createClient();
    await supabase.auth.signInWithPassword({
      email: user.id, // Use user ID as "email" for Supabase
      password: 'not-used' // We control auth, Supabase just holds session
    });

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
}

async function exchangeCodeForUserInfo(provider: string, code: string) {
  // Provider-specific OAuth exchange
  // Return { providerUserId, email }
  switch (provider) {
    case 'google':
      // Google OAuth exchange
      break;
    case 'github':
      // GitHub OAuth exchange
      break;
    case 'metamask':
      // Wallet signature verification
      break;
    default:
      throw new Error('Unknown provider');
  }
}
```

**Step 4: Connect flow**

Create `app/api/user/connect/[provider]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectAccount } from '@/lib/auth/simple-auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { providerUserId, oauthToken, refreshToken, expiresAt } = await request.json();

  try {
    await connectAccount(
      user.id,
      params.provider,
      providerUserId,
      oauthToken,
      refreshToken,
      expiresAt
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Connect error:', error);
    return NextResponse.json({ error: 'Failed to connect account' }, { status: 500 });
  }
}
```

### Phase 2: Migrate Existing Users

**Step 1: Audit current users**

```sql
-- See what we have
SELECT
  u.id,
  u.email,
  COUNT(ui.id) as identity_count,
  STRING_AGG(ui.provider, ', ') as providers
FROM users u
LEFT JOIN user_identities ui ON ui.user_id = u.id
GROUP BY u.id, u.email
ORDER BY identity_count DESC;
```

**Step 2: Migration script**

Create `scripts/migrate-to-simple-auth.ts`:

```typescript
import { db } from '@/lib/db';

async function migrate() {
  console.log('Starting auth migration...');

  // Get all existing users
  const oldUsers = await db.users.findMany({
    include: { user_identities: true }
  });

  for (const oldUser of oldUsers) {
    // Create new user
    const newUser = await db.users.create({
      data: {
        email: oldUser.email,
        created_at: oldUser.created_at
      }
    });

    // Migrate identities to auth_methods
    for (const identity of oldUser.user_identities) {
      await db.auth_methods.create({
        data: {
          user_id: newUser.id,
          provider: identity.provider,
          provider_user_id: identity.provider_user_id,
          purpose: 'login', // First identity is login
          oauth_token: identity.oauth_token,
          refresh_token: identity.refresh_token,
          token_expires_at: identity.token_expires_at,
          provider_email: identity.provider_email,
          created_at: identity.created_at
        }
      });
    }

    console.log(`Migrated user ${oldUser.id} -> ${newUser.id}`);
  }

  console.log('Migration complete!');
}

migrate();
```

**Step 3: Run migration**

```bash
# Backup database first!
pg_dump b0ase_com > backup-$(date +%Y%m%d).sql

# Run migration
npx tsx scripts/migrate-to-simple-auth.ts

# Verify
psql -c "SELECT COUNT(*) FROM users;"
psql -c "SELECT COUNT(*) FROM auth_methods;"
```

### Phase 3: Switch Over

**Step 1: Update auth callback route**

Rename:
- `app/auth/callback/route.ts` → `app/auth/callback-old/route.ts` (backup)
- `app/auth/simple-callback/route.ts` → `app/auth/callback/route.ts`

**Step 2: Update all OAuth redirect URLs**

In Google, GitHub, etc. consoles:
- Callback URL: `https://b0ase.com/auth/callback?provider=google`
- Make sure `provider` param is passed

**Step 3: Update user account page**

`app/user/account/page.tsx`:
- Remove complex identity resolution
- Show connected accounts from `auth_methods` where `purpose='connected'`
- Add "Connect GitHub" / "Connect Discord" buttons

**Step 4: Test**

1. Sign up with Google → should create user
2. Login with Google → should work
3. Inside account, "Connect GitHub" → should link GitHub
4. Sign up with GitHub (different account) → should create NEW user (not merge)
5. Verify repos page works with GitHub token from connected account

### Phase 4: Cleanup

**Step 1: Remove old code**

Delete:
- `app/auth/callback-old/route.ts`
- Complex PKCE cookie logic
- Identity merge functions
- Collision detection code

**Step 2: Drop old tables** (after verifying everything works)

```sql
-- CAREFUL: Only after migration is confirmed working
DROP TABLE user_identities;
-- Keep old users table or migrate data
```

**Step 3: Update documentation**

Update CLAUDE.md:
- Remove multi-auth complexity notes
- Add simple auth strategy
- Document new `auth_methods` table

---

## User Flows

### Login Flow

1. User clicks "Login with Google"
2. OAuth redirect to Google
3. Google redirects to `/auth/callback?provider=google&code=xyz`
4. We exchange code for Google user ID
5. Look up `auth_methods` where `provider='google'` and `provider_user_id=xyz` and `purpose='login'`
6. If found: login as that user
7. If not found: create new user + auth_method, then login

**No collision checks. No merging. Simple.**

### Connect Account Flow

1. User logged in, on account page
2. Clicks "Connect GitHub"
3. OAuth redirect to GitHub
4. GitHub redirects to `/auth/callback?provider=github&code=xyz&connect=true`
5. We exchange code for GitHub user ID + OAuth token
6. Insert into `auth_methods` with `purpose='connected'`
7. Done

**No checking if GitHub is someone else's login. We don't care.**

### Fetch GitHub Repos Flow

1. User visits `/user/account/repos`
2. Look up `auth_methods` where `user_id=current` and `provider='github'` and `purpose='connected'`
3. Use `oauth_token` to call GitHub API
4. Display repos

**Clear, simple ownership.**

---

## Key Differences from Old System

| Old System | New System |
|------------|------------|
| Complex collision detection | No collision checks |
| Automatic account merging | No merging ever |
| `user_identities` (confusing name) | `auth_methods` (clear purpose) |
| Multiple auth callback handlers | One simple handler |
| PKCE cookie complexity | Standard OAuth flow |
| "Is this the same person?" logic | Don't care if same person |
| Orphaned identities | Clear cascade deletes |
| 10+ auth bug fixes | Zero auth bugs (by design) |

---

## FAQ

**Q: What if user signs up twice with different providers?**
A: They get 2 accounts. Their problem. Tell them to delete one.

**Q: What if they connect GitHub that's already someone else's login?**
A: Allowed. It's just a connected account for data access, not identity merging.

**Q: How do we know which GitHub token to use for repos?**
A: Look up `auth_methods` where `user_id=current` and `provider='github'` and `purpose='connected'`. One query, clear answer.

**Q: What if user has 2 Google accounts?**
A: They can create 2 b0ase accounts. Each Google ID = separate account.

**Q: How do we handle token refresh?**
A: Each `auth_method` has its own token. Refresh independently. No cross-contamination.

**Q: What about wallet auth (MetaMask)?**
A: Same flow. `provider='metamask'`, `provider_user_id='0x123...'`. Wallet signature verifies ownership.

**Q: Can user login with connected account?**
A: No. Only `purpose='login'` can login. Connected accounts are data access only.

**Q: What if they want to "promote" connected account to login?**
A: Update `purpose` from 'connected' to 'login'. Or let them sign up fresh with that provider (creates new account).

---

## Success Criteria

✅ User can sign up with any provider
✅ User can login with their signup provider
✅ User can connect additional accounts (GitHub, Discord, etc.)
✅ Connected accounts provide API tokens
✅ No identity collision errors
✅ No PKCE cookie issues
✅ No "broken auth state"
✅ Clear, understandable code
✅ Zero auth bug fixes needed

---

## Timeline

- **Phase 1:** 1-2 days (new system, don't touch old code)
- **Phase 2:** 1 day (migration script + testing)
- **Phase 3:** 1 day (switch over, update OAuth configs)
- **Phase 4:** 1 day (cleanup, documentation)

**Total: 4-5 days to completely fix auth forever**

---

## Next Steps

1. Read this document thoroughly
2. Create `users` and `auth_methods` tables
3. Implement `lib/auth/simple-auth.ts`
4. Build new callback handler
5. Test with one provider (Google)
6. Once working, migrate all users
7. Switch over
8. Delete old code
9. Never think about auth bugs again

---

**Questions?** Read this doc again. It's intentionally simple. If something seems complex, you're overthinking it.

**Remember:** Every signup creates a new account. We don't merge. We don't care. Simple.
