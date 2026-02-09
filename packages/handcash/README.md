# @b0ase/handcash

Unified HandCash integration for all b0ase apps.

## Installation

```bash
pnpm add @b0ase/handcash
```

## Usage

### Server-Side (API Routes, Server Actions)

```typescript
import { HandCashServer, handcashServer } from '@b0ase/handcash/server';

// Use the default singleton (uses env variables)
const profile = await handcashServer.getUserProfile(authToken);
const balance = await handcashServer.getSpendableBalance(authToken);

// Send a payment
const result = await handcashServer.sendPayment(authToken, {
  destination: 'bob',
  amount: 1.00,
  currency: 'USD',
  description: 'Coffee payment',
});

// Multi-party payment (for splits, distributions)
const multiResult = await handcashServer.sendMultiPayment(authToken, {
  payments: [
    { destination: 'alice', amount: 0.50 },
    { destination: 'bob', amount: 0.30 },
    { destination: 'platform', amount: 0.20 },
  ],
  description: 'Revenue split',
});
```

### Client-Side (Browser)

```typescript
import { HandCashClient } from '@b0ase/handcash/client';

const client = new HandCashClient({
  appId: 'your-app-id',
  redirectUri: 'https://yourapp.com/callback',
});

// Start OAuth flow
window.location.href = client.getOAuthUrl();

// Handle callback (in your callback page)
const result = await client.handleOAuthCallback(code);
if (result) {
  console.log('Authenticated as:', result.profile.publicProfile.handle);
}

// Check auth state
if (client.isAuthenticated()) {
  const profile = client.getProfile();
  const balance = await client.getBalance();
}
```

### React Provider

```tsx
import { HandCashProvider, useHandCash, HandCashConnectButton } from '@b0ase/handcash/provider';

// Wrap your app
function App() {
  return (
    <HandCashProvider
      appId="your-app-id"
      mockMode={process.env.NODE_ENV === 'development'}
    >
      <YourApp />
    </HandCashProvider>
  );
}

// Use the hook in components
function WalletWidget() {
  const {
    isAuthenticated,
    profile,
    balance,
    signIn,
    signOut,
    sendPayment
  } = useHandCash();

  if (!isAuthenticated) {
    return <button onClick={signIn}>Connect Wallet</button>;
  }

  return (
    <div>
      <img src={profile.publicProfile.avatarUrl} />
      <span>@{profile.publicProfile.handle}</span>
      <span>${balance?.usd.toFixed(2)}</span>
      <button onClick={() => sendPayment('bob', 1.00)}>
        Pay $1 to Bob
      </button>
      <button onClick={signOut}>Disconnect</button>
    </div>
  );
}

// Or use the built-in components
function SimpleApp() {
  return (
    <div>
      <HandCashConnectButton className="btn btn-primary" />
    </div>
  );
}
```

## Environment Variables

```env
# Required for server-side operations
HANDCASH_APP_ID=your-app-id
HANDCASH_APP_SECRET=your-app-secret

# Optional: For house/platform wallet operations
HOUSE_AUTH_TOKEN=your-house-wallet-token
```

## API Reference

### HandCashServer

Server-side service for wallet operations.

| Method | Description |
|--------|-------------|
| `getUserProfile(authToken)` | Get user's public profile |
| `getFriends(authToken)` | Get user's friends list |
| `getSpendableBalance(authToken, currency?)` | Get wallet balance |
| `sendPayment(authToken, params)` | Send single payment |
| `sendMultiPayment(authToken, params)` | Send multi-output payment |
| `getPayment(authToken, txId)` | Verify a payment |
| `getInventory(authToken)` | Get NFTs/ordinals |
| `transferItems(authToken, params)` | Transfer ordinals |
| `getHouseAccount()` | Get platform wallet account |
| `sendHousePayment(params)` | Send from platform wallet |

### HandCashClient

Client-side authentication service.

| Method | Description |
|--------|-------------|
| `getOAuthUrl()` | Get OAuth authorization URL |
| `handleOAuthCallback(code)` | Process OAuth callback |
| `isAuthenticated()` | Check auth state |
| `getProfile()` | Get stored profile |
| `getAuthToken()` | Get stored auth token |
| `getBalance()` | Fetch current balance |
| `sendPayment(to, amount, currency?)` | Send payment |
| `clearAuth()` | Clear stored auth data |
| `mockAuthenticate(mockProfile?)` | Dev mode: mock login |

### useHandCash Hook

React hook for accessing HandCash state and actions.

| Property | Type | Description |
|----------|------|-------------|
| `isAuthenticated` | `boolean` | Auth state |
| `profile` | `HandCashProfile \| null` | User profile |
| `balance` | `HandCashBalance \| null` | Wallet balance |
| `assets` | `HandCashAsset[]` | NFTs/tokens |
| `isLoading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message |
| `signIn` | `() => Promise<void>` | Start auth flow |
| `signOut` | `() => void` | Clear auth |
| `getOAuthUrl` | `() => string` | Get OAuth URL |
| `handleCallback` | `(code) => Promise<boolean>` | Process callback |
| `refreshBalance` | `() => Promise<void>` | Refresh balance |
| `refreshAssets` | `() => Promise<void>` | Refresh assets |
| `sendPayment` | `(to, amount, currency?) => Promise<string \| null>` | Send payment |

## Types

```typescript
interface HandCashProfile {
  publicProfile: {
    id: string;
    handle: string;
    paymail: string;
    displayName: string;
    avatarUrl: string;
    localCurrencyCode: string;
  };
  privateProfile?: {
    email: string;
    phoneNumber: string;
  };
}

interface HandCashBalance {
  bsv: number;
  usd: number;
  satoshis?: number;
}

interface SinglePaymentParams {
  destination: string;
  amount: number;
  currency?: string;
  description?: string;
}

interface MultiPaymentParams {
  payments: Array<{
    destination: string;
    amount: number;
    currencyCode?: string;
  }>;
  description?: string;
  appAction?: 'PAY' | 'TIPPING' | 'PAYMENT';
}
```

## License

MIT
