# B0ASE Authentication System Documentation

## Overview

B0ASE uses a **Unified Identity** system built on Supabase Auth.
**Fundamental Principle: Identity First.**
Users *must* authenticate via a stable identity provider (Email, Google, Twitter, Discord, GitHub, LinkedIn) *before* they can attach cryptographic wallets (Phantom, MetaMask, HandCash).

Wallets are treated as **Tools** and **Payment Methods**, not primary authentication identities. This ensures account recovery, data integrity, and compliance.

---

## Architecture

### Core Design Principles

1.  **Identity First** - Access to the platform requires a Supabase-authenticated session (Email or Social).
2.  **Wallets as Tools** - Wallets are "attached" to an authenticated user connection for signing and payments.
3.  **Unified User Model** - A central `unified_users` table links all providers.
4.  **Single Session Source** - Supabase Auth (`sb-*-auth-token`) is the *only* source of truth for "Is User Logged In?". Legacy cookies (`b0ase_wallet_*`) are strictly for tool access (e.g. knowing which wallet to prompt for signatures).

### Authentication Flow

```
1. User Visits /login
   -> Options: Email/Password, Google, Twitter, Discord, GitHub, LinkedIn.
   -> (Wallets are NOT available on the login screen).

2. User Authenticates
   -> Supabase Session Created.
   -> user_identity record linked.

3. User Visits /user/account
   -> Authenticated User can now "Connect Wallet".
   -> System verifies User is Logged In.
   -> Wallet is connected and linked to the existing Identity.
```

---

## Database Schema

### unified_users

The central user table.

```sql
CREATE TABLE unified_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_name TEXT,
  primary_email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  merged_into_id UUID REFERENCES unified_users(id)
);
```

### user_identities

Maps authentication providers and wallets to the unified user.

```sql
CREATE TABLE user_identities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unified_user_id UUID NOT NULL REFERENCES unified_users(id),
  provider TEXT NOT NULL,           -- 'supabase' (for email), 'google', 'twitter', 'phantom', etc.
  provider_user_id TEXT NOT NULL,   -- Address, handle, or user ID
  provider_email TEXT,
  provider_handle TEXT,
  provider_data JSONB,
  oauth_provider TEXT,              -- Sub-type for OAuth (e.g. 'google')
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_user_id)
);
```

### Row-Level Security (RLS)

All tables have RLS enabled. Users can only view/modify their own records. Policies check both `auth.uid()` (Supabase auth) and `unified_user_id` linkage.

---

## Social & Email Providers (Primary)

### Supported methods
*   **Email/Password** (Native Supabase)
*   **Google, Discord, GitHub, LinkedIn** (Supabase OAuth)
*   **Twitter/X** (Custom OAuth w/ PKCE)

All primary methods result in a **Supabase Session**.

### Google

**Implementation**: Direct OAuth2 client using `googleapis` library

| Property | Value |
|----------|-------|
| Route | `/api/auth/google` |
| Callback | `/api/auth/google/callback` |
| Scopes | `userinfo.profile`, `userinfo.email`, optional Drive scopes |
| Redirect URI | `https://www.b0ase.com/api/auth/google/callback` |

**Files**:
- `app/api/auth/google/route.ts`
- `app/api/auth/google/callback/route.ts`

---

### Twitter / X

**Implementation**: Custom OAuth 2.0 with PKCE (Supabase's Twitter support doesn't work properly)

| Property | Value |
|----------|-------|
| Route | `/api/auth/twitter` |
| Callback | `/api/auth/twitter/callback` |
| Scopes | `tweet.read users.read offline.access` |
| Security | PKCE (Proof Key for Code Exchange) |

**PKCE Flow**:
1. Generate code verifier (32 random bytes, base64url encoded)
2. Create challenge (SHA256 hash of verifier)
3. Store verifier in httpOnly cookie
4. Exchange code + verifier for tokens at callback

**Important**: Domain is normalized to `www.b0ase.com` to prevent redirect mismatches.

**Files**:
- `app/api/auth/twitter/route.ts`
- `app/api/auth/twitter/callback/route.ts`

---

### Discord

**Implementation**: Via Supabase Auth

| Property | Value |
|----------|-------|
| Route | `/api/auth/discord` |
| Callback | `/auth/callback` (universal handler) |
| Scopes | `identify email` |

**Files**:
- `app/api/auth/discord/route.ts`
- `app/auth/callback/route.ts`

---

### GitHub

**Implementation**: Via Supabase Auth

| Property | Value |
|----------|-------|
| Route | `/api/auth/github` |
| Callback | `/auth/callback` (universal handler) |
| Scopes | `read:user user:email` |

**Files**:
- `app/api/auth/github/route.ts`
- `app/auth/callback/route.ts`

---

### LinkedIn

**Implementation**: Via Supabase Auth using OpenID Connect

| Property | Value |
|----------|-------|
| Route | `/api/auth/linkedin` |
| Callback | `/auth/callback` (universal handler) |
| Provider | `linkedin_oidc` |

**Files**:
- `app/api/auth/linkedin/route.ts`
- `app/auth/callback/route.ts`

---

### Universal OAuth Callback Handler

**Route**: `/auth/callback`

Handles all Supabase OAuth callbacks:
1. Exchanges auth code for session
2. Creates or finds unified user
3. Checks for existing identities from HandCash/wallets first
4. Links identity to unified user
5. Implements account merging logic

**File**: `app/auth/callback/route.ts`

---

## Wallet Connections (Secondary)

Wallets are attached *after* authentication. The `/api/auth/wallet` endpoint enforces a check for an active Supabase session before allowing a wallet link.

### Phantom (Solana) & MetaMask (EVM)
*   **Role**: Signing certificates, proving ownership of assets.
*   **Connection**: Triggered from User Dashboard.
*   **Requirement**: Must be logged in.

### HandCash (BSV)
*   **Role**: Payments, Inventory.
*   **Connection**: OAuth flow triggered from Dashboard.
*   **Requirement**: Must be logged in.

### Yours Wallet (Bitcoin SV)

| Property | Value |
|----------|-------|
| SDK | `yours-wallet-provider` |
| Auth Type | React Context-based |
| Addresses | BSV address, ORD address, identity address |

**Capabilities**:
- Connect/disconnect
- Get BSV20 tokens
- Manage wallets

**File**: `lib/context/YoursWalletContext.tsx`

---

### OKX Wallet (Ethereum/Multi-chain)

| Property | Value |
|----------|-------|
| Protocol | EIP-1193 compatible |
| Detection | `window.okxwallet` or in `ethereum.providers` |
| Address Format | Lowercase for Ethereum |

---

### Wallet Authentication Endpoint

**Route**: `/api/auth/wallet`

| Method | Action |
|--------|--------|
| POST | Creates/links wallet identity, returns `unified_user_id` |
| DELETE | Clears wallet session cookies |

**Cookies Set** (30 days):
- `b0ase_wallet_provider`
- `b0ase_wallet_address`

**File**: `app/api/auth/wallet/route.ts`

---

## Session Management

### The "Truth"
**Supabase Session** is the only indicator of a logged-in user.

### Cookie Reference

| Cookie | Type | Purpose |
|--------|------|---------|
| `sb-*-auth-token` | **Auth** | identifies the User. |
| `b0ase_wallet_provider` | **Utility** | Remembers *which* wallet tool was last used. |
| `b0ase_wallet_address` | **Utility** | Remembers the address for UI display. |
| `b0ase_user_handle` | **Utility** | Remembers HandCash handle for payment prompts. |

**Important**: Presence of `b0ase_wallet_*` cookies does *not* grant access to protected routes. Only the Supabase token does.

### Temporary OAuth Cookies

| Cookie | Duration | Purpose |
|--------|----------|---------|
| `twitter_code_verifier` | 10 minutes | PKCE verifier storage |
| `twitter_oauth_state` | 10 minutes | CSRF protection |

### Cookie Configuration

All cookies use:
- `httpOnly: true` (for sensitive tokens)
- `secure: true` (in production)
- `sameSite: 'lax'`

---

## API Routes Reference

### OAuth Initiation

| Route | Method | Provider |
|-------|--------|----------|
| `/api/auth/google` | GET | Google |
| `/api/auth/twitter` | GET | Twitter |
| `/api/auth/discord` | GET | Discord |
| `/api/auth/github` | GET | GitHub |
| `/api/auth/linkedin` | GET | LinkedIn |
| `/api/auth/handcash` | GET | HandCash |

### OAuth Callbacks

| Route | Method | Provider |
|-------|--------|----------|
| `/api/auth/google/callback` | GET | Google |
| `/api/auth/twitter/callback` | GET | Twitter |
| `/api/auth/handcash/callback` | GET | HandCash |
| `/auth/callback` | GET | Discord, GitHub, LinkedIn (universal) |

### Wallet & Session

| Route | Method | Action |
|-------|--------|--------|
| `/api/auth/wallet` | POST | Authenticate wallet |
| `/api/auth/wallet` | DELETE | Sign out wallet |
| `/api/auth/profile` | GET | Get HandCash profile |

---

## Frontend Components

### AuthContext (`components/Providers.tsx`)

Provides authentication state and methods throughout the app.

**State**:
- `user` - Current Supabase user object
- `session` - Current session
- `loading` - Auth state loading
- `isAuthenticated` - Boolean auth status

**Methods**:
```typescript
// Email auth
signInWithEmail(email, password)
signUpWithEmail(email, password)
sendMagicLink(email)

// OAuth sign in (new accounts)
signInWithGoogle()
signInWithTwitter()
signInWithDiscord()
signInWithGithub()
signInWithLinkedin()

// OAuth linking (existing accounts)
linkGoogle()
linkTwitter()
linkDiscord()
linkGithub()
linkLinkedin()

// Sign out
signOut()
```

### WalletConnectModal (`components/WalletConnectModal.tsx`)

Modal for all authentication methods.

**Sections**:
- Email/Password with Sign Up toggle
- Magic Link option
- Social OAuth buttons (Google, Twitter, Discord, GitHub, LinkedIn)
- Wallet connections (Phantom, MetaMask, OKX, HandCash)

### Account Page (`app/user/account/page.tsx`)

Displays and manages user's connected identities.

**Features**:
- Shows all linked identities with status
- Provider-specific icons and display
- Connect/disconnect controls
- Company information
- Identity token management
- KYC status display

### Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useAuth()` | `components/Providers.tsx` | Access AuthContext |
| `useUserHandle()` | `hooks/useUserHandle.ts` | Read HandCash handle cookie |

---

## Security Features

### PKCE (Proof Key for Code Exchange)

Used for Twitter OAuth to prevent authorization code interception.

```
Code Verifier: 32 random bytes, base64url encoded
Challenge: SHA256(verifier), base64url encoded
Method: S256
```

### CSRF Protection

State parameter in all OAuth flows, verified before token exchange.

### Address Normalization

| Chain | Normalization |
|-------|--------------|
| Ethereum | Lowercase |
| Solana | As-is |
| BSV | As-is |

Prevents duplicate accounts from case variations.

### Domain Normalization

All production redirect URIs use `www.b0ase.com` to prevent OAuth mismatches.

### Token Storage

| Token Type | Storage Location |
|------------|-----------------|
| OAuth access/refresh tokens | Database (`user_identities.provider_data`) |
| Session tokens | Secure httpOnly cookies |
| Wallet type indicators | localStorage (non-sensitive) |

---

## Role-Based Access Control (RBAC)

The system includes a sophisticated application-level RBAC system in `lib/rbac.ts`.

### Roles

| Role | Level | Description |
|------|-------|-------------|
| `super_admin` | 10 | Full system control (`*:*` permissions) |
| `admin` | 5 | Administrative access to most features |
| `builder` | 3 | Create and manage projects |
| `investor` | 2 | Access investment opportunities |
| `client` | 2 | Manage client projects |
| `user` | 1 | Basic platform access |

### Permissions

Permissions are defined as `resource:action` pairs with optional conditions:

```typescript
{ resource: 'projects', action: 'read' }
{ resource: 'projects', action: 'update', conditions: { owner: true } }
{ resource: '*', action: '*' }  // Wildcard for super_admin
```

**Resources**: `users`, `projects`, `teams`, `finances`, `analytics`, `investments`, `portfolio`, `communications`, `payments`, `profile`, `dashboard`, `ai_agents`

**Actions**: `create`, `read`, `update`, `delete`, `suspend`, `activate`, `*` (all)

**Conditions**: `owner`, `member`, `client`, `public`

### Usage

**Frontend (React hook)**:
```typescript
import { useRBAC } from '@/lib/rbac';

const { can, hasRole, hasRoleLevel } = useRBAC(userRole);

if (can('projects', 'delete', { ownerId: project.ownerId, userId: currentUser.id })) {
  // Show delete button
}
```

**Backend (API middleware)**:
```typescript
import { withRBAC } from '@/lib/rbac';

export default withRBAC(handler, [
  { resource: 'projects', action: 'create' }
]);
```

**File**: `lib/rbac.ts`

---

## Middleware Protection

The `middleware.ts` file strictly enforces Supabase authentication for protected routes (`/user/*`, `/admin/*`, `/dashboard/*`).

```typescript
// Middleware Logic
const { data: { user } } = await supabase.auth.getUser();

if (isProtectedRoute && !user) {
  return NextResponse.redirect('/login');
}
```

Legacy wallet cookies are ignored for access control.

### Protected Routes

| Route Pattern | Protection |
|---------------|------------|
| `/admin/*` | Requires authenticated user AND `ADMIN_EMAIL` match |
| `/dashboard/*` | Requires authenticated user AND `ADMIN_EMAIL` match |
| `/auth/callback` | Skipped (handles OAuth exchange) |
| `/api/auth/twitter/callback` | Skipped (handles OAuth exchange) |

### Admin Email Check

The middleware includes a hardcoded security check:

```typescript
if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!user || user.email !== adminEmail) {
    return NextResponse.redirect(new URL('/', request.url));
  }
}
```

This adds an extra layer beyond database auth - even authenticated users cannot access admin routes unless their email matches `ADMIN_EMAIL`.

**File**: `middleware.ts`

---

## Environment Variables

### Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_API_KEY=

# Twitter
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=

# HandCash
HANDCASH_APP_ID=
HANDCASH_APP_SECRET=
HOUSE_AUTH_TOKEN=  # For platform operations

# Admin Access
ADMIN_EMAIL=  # Email address allowed to access /admin and /dashboard routes
```

### Optional

```env
NODE_ENV=development|production
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_HANDCASH_REDIRECT_URL=
```

### Supabase Console Configuration

Discord, GitHub, and LinkedIn OAuth credentials are configured directly in the Supabase dashboard, not in environment variables.

---

## KYC System

**Current Status**: UI placeholder, not fully implemented

The account page shows "KYC: Unverified" status, but the verification workflow is not yet built.

**Planned Implementation**:
- Status field on `unified_users` table
- Document upload to Supabase storage
- Verification workflow for financial compliance

---

## Account Lookup Chain

When a user authenticates, the system looks for an existing unified user in this order:

1. Check Supabase identity (if OAuth via Supabase)
2. Check HandCash identity (by handle)
3. Check Wallet identity (by address)
4. Create new unified user if none found

This allows users who first connected via wallet to later add OAuth providers to the same account.

---

## Account Merging

The database includes a `merge_unified_users()` function for combining accounts. When accounts are merged:

1. Target account's `merged_into_id` is set to the primary account
2. All identities are transferred to the primary account
3. Target account becomes a tombstone (kept for audit trail)

---

## File Reference

### API Routes
```
app/api/auth/
├── google/
│   ├── route.ts
│   └── callback/route.ts
├── twitter/
│   ├── route.ts
│   └── callback/route.ts
├── discord/route.ts
├── github/route.ts
├── linkedin/route.ts
├── handcash/
│   ├── route.ts
│   └── callback/route.ts
├── wallet/route.ts
└── profile/route.ts

app/auth/
└── callback/route.ts
```

### Core Libraries
```
lib/
├── supabase/
│   ├── server.ts
│   └── client.ts
├── rbac.ts              # Role-Based Access Control
├── handcash.ts
├── handcash-service.ts
├── wallet-types.ts
└── context/
    └── YoursWalletContext.tsx
```

### Middleware
```
middleware.ts            # Route protection & session refresh
```

### Frontend
```
components/
├── Providers.tsx
└── WalletConnectModal.tsx

app/auth/login/page.tsx      # Unified auth UI
app/user/account/page.tsx

hooks/
└── useUserHandle.ts
```

### Database
```
supabase/migrations/
└── 20260111030000_create_unified_users.sql

prisma/
└── schema.prisma
```

---

## Troubleshooting

### Common Issues

**OAuth redirect mismatch**
- Ensure redirect URI matches exactly (including www subdomain)
- Check that environment variables are set correctly

**Wallet not detected**
- Ensure browser extension is installed and enabled
- Check that the correct provider is being detected (OKX can mask as MetaMask)

**Session not persisting**
- Check cookie settings (secure flag in production)
- Verify Supabase client is initialized correctly

**Account not linking**
- Ensure user is signed in before attempting to link
- Check for existing identity with same provider_user_id

**Cannot access /admin or /dashboard**
- Requires both authentication AND matching `ADMIN_EMAIL` environment variable
- Even authenticated users are blocked if email doesn't match
- Check that `ADMIN_EMAIL` is set in your environment

---

*Last updated: January 2026*
