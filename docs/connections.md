# Connection Configuration Guide

This document covers all social OAuth and wallet connections for b0ase.com.

## Callback URLs

**Local Development (Supabase on Hetzner):**
```
http://192.168.0.24:54321/auth/v1/callback
```

**Production:**
```
https://b0ase.com/auth/callback
```

---

## Social OAuth Providers

### Google

1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `http://192.168.0.24:54321/auth/v1/callback`
4. Copy Client ID and Client Secret to `.env.local`:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

### Twitter / X

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create a project and app
3. Set up OAuth 2.0 with User authentication settings
4. Add callback URL: `http://192.168.0.24:54321/auth/v1/callback`
5. Copy Client ID and Client Secret to `.env.local`:
   ```
   TWITTER_CLIENT_ID=your_client_id
   TWITTER_CLIENT_SECRET=your_client_secret
   ```

### Discord

1. Go to https://discord.com/developers/applications
2. Create a new application
3. Go to OAuth2 → General
4. Add redirect: `http://192.168.0.24:54321/auth/v1/callback`
5. Copy Client ID and Client Secret to `.env.local`:
   ```
   DISCORD_CLIENT_ID=your_client_id
   DISCORD_CLIENT_SECRET=your_client_secret
   ```

### GitHub

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Set Authorization callback URL: `http://192.168.0.24:54321/auth/v1/callback`
4. Copy Client ID and generate Client Secret
5. Add to `.env.local`:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

### LinkedIn

1. Go to https://www.linkedin.com/developers/apps
2. Create a new app
3. Go to Auth tab → OAuth 2.0 settings
4. Add redirect URL: `http://192.168.0.24:54321/auth/v1/callback`
5. Go to Products tab → Request access to "Sign In with LinkedIn using OpenID Connect"
6. Copy Client ID and Client Secret to `.env.local`:
   ```
   LINKEDIN_CLIENT_ID=your_client_id
   LINKEDIN_CLIENT_SECRET=your_client_secret
   ```

---

## Wallet Connections

### Phantom (Solana)

- **Type:** Browser extension
- **No server config needed** - connects directly via `window.phantom.solana`
- Install: https://phantom.app/
- Connection stored in localStorage

### MetaMask (Ethereum)

- **Type:** Browser extension
- **No server config needed** - connects directly via `window.ethereum`
- Install: https://metamask.io/download/
- Connection stored in localStorage
- Note: Code specifically filters out OKX wallet to prevent conflicts

### OKX Wallet (Ethereum)

- **Type:** Browser extension
- **No server config needed** - connects via `window.okxwallet` or `window.ethereum`
- Install: https://www.okx.com/web3
- Connection stored in localStorage

### HandCash (Bitcoin SV)

1. Go to https://dashboard.handcash.io/
2. Create an app
3. Set redirect URL to your callback endpoint
4. Add to `.env.local`:
   ```
   HANDCASH_APP_ID=your_app_id
   HANDCASH_APP_SECRET=your_app_secret
   ```
5. Set redirect URL:
   ```
   NEXT_PUBLIC_HANDCASH_REDIRECT_URL=https://b0ase.com/api/auth/handcash/callback
   ```

### Yours Wallet (Bitcoin SV)

- **Type:** Browser extension
- **No server config needed** - uses `yours-wallet-provider` package
- Install: https://yours.org/
- Connection handled by YoursWalletProvider context

---

## Supabase Configuration

After adding environment variables, update your local Supabase:

```bash
supabase stop && supabase start
```

The providers are configured in `supabase/config.toml` under `[auth.external.*]` sections.

---

## Environment Variables Summary

```bash
# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Twitter/X OAuth
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=

# Discord OAuth
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# HandCash (BSV)
HANDCASH_APP_ID=
HANDCASH_APP_SECRET=
NEXT_PUBLIC_HANDCASH_REDIRECT_URL=
```

---

## Files Reference

- **OAuth Routes:** `app/api/auth/[provider]/route.ts`
- **Wallet Connect Modal:** `components/WalletConnectModal.tsx`
- **Account Page:** `app/user/account/page.tsx`
- **Supabase Config:** `supabase/config.toml`
- **Environment Template:** `.env.example`
