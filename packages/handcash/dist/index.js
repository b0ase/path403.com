"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  HandCashAuthError: () => HandCashAuthError,
  HandCashClient: () => HandCashClient,
  HandCashConnectButton: () => HandCashConnectButton,
  HandCashDemoModeError: () => HandCashDemoModeError,
  HandCashError: () => HandCashError,
  HandCashProfileDisplay: () => HandCashProfileDisplay,
  HandCashProvider: () => HandCashProvider,
  HandCashServer: () => HandCashServer,
  createHandCashClient: () => createHandCashClient,
  handcashServer: () => handcashServer,
  useHandCash: () => useHandCash
});
module.exports = __toCommonJS(index_exports);

// src/types.ts
var HandCashError = class extends Error {
  constructor(message, code = "HANDCASH_ERROR") {
    super(message);
    this.name = "HandCashError";
    this.code = code;
  }
};
var HandCashDemoModeError = class extends HandCashError {
  constructor() {
    super("HandCash is in DEMO MODE - real operations unavailable", "DEMO_MODE");
  }
};
var HandCashAuthError = class extends HandCashError {
  constructor(message = "Authentication required") {
    super(message, "AUTH_REQUIRED");
  }
};

// src/server.ts
var import_handcash_connect = require("@handcash/handcash-connect");
var HandCashServer = class {
  constructor(config) {
    this.appId = config?.appId || process.env.HANDCASH_APP_ID || "";
    this.appSecret = config?.appSecret || process.env.HANDCASH_APP_SECRET || "";
    this.isDemoMode = !this.appId || !this.appSecret;
    if (this.isDemoMode) {
      console.log("[HandCashServer] Running in DEMO MODE - no credentials provided");
      this.handCashConnect = null;
    } else {
      this.handCashConnect = new import_handcash_connect.HandCashConnect({
        appId: this.appId,
        appSecret: this.appSecret
      });
    }
  }
  checkDemoMode() {
    if (this.isDemoMode || !this.handCashConnect) {
      throw new HandCashDemoModeError();
    }
  }
  /**
   * Get an authorized account instance from an auth token.
   */
  getAccount(authToken) {
    this.checkDemoMode();
    return this.handCashConnect.getAccountFromAuthToken(authToken);
  }
  // ============================================================================
  // Profile Operations
  // ============================================================================
  /**
   * Get user's public profile
   */
  async getUserProfile(authToken) {
    try {
      const account = this.getAccount(authToken);
      const { publicProfile } = await account.profile.getCurrentProfile();
      return publicProfile;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get user profile";
      throw new HandCashError(message, "PROFILE_ERROR");
    }
  }
  /**
   * Get user's friends list
   */
  async getFriends(authToken) {
    try {
      const account = this.getAccount(authToken);
      return await account.profile.getFriends();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get friends";
      throw new HandCashError(message, "FRIENDS_ERROR");
    }
  }
  // ============================================================================
  // Wallet Operations
  // ============================================================================
  /**
   * Get spendable balance
   */
  async getSpendableBalance(authToken, currencyCode = "USD") {
    try {
      const account = this.getAccount(authToken);
      return await account.wallet.getSpendableBalance(currencyCode);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get balance";
      throw new HandCashError(message, "BALANCE_ERROR");
    }
  }
  /**
   * Send a single payment
   */
  async sendPayment(authToken, params) {
    try {
      const account = this.getAccount(authToken);
      const paymentParameters = {
        description: params.description,
        appAction: "PAYMENT",
        payments: [
          {
            destination: params.destination,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            currencyCode: params.currency || "USD",
            sendAmount: params.amount
          }
        ]
      };
      const result = await account.wallet.pay(paymentParameters);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment failed";
      throw new HandCashError(message, "PAYMENT_ERROR");
    }
  }
  /**
   * Send payment with multiple outputs (for distributions, splits, etc.)
   */
  async sendMultiPayment(authToken, params) {
    try {
      const account = this.getAccount(authToken);
      const paymentParameters = {
        description: params.description || "Payment Distribution",
        appAction: params.appAction || "PAYMENT",
        payments: params.payments.map((p) => ({
          destination: p.destination,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currencyCode: p.currencyCode || "USD",
          sendAmount: p.amount
        }))
      };
      const result = await account.wallet.pay(paymentParameters);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Multi-payment failed";
      throw new HandCashError(message, "MULTI_PAYMENT_ERROR");
    }
  }
  /**
   * Verify a payment by transaction ID
   */
  async getPayment(authToken, transactionId) {
    try {
      const account = this.getAccount(authToken);
      const result = await account.wallet.getPayment(transactionId);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to verify payment";
      throw new HandCashError(message, "PAYMENT_VERIFY_ERROR");
    }
  }
  // ============================================================================
  // Items/Ordinals Operations
  // ============================================================================
  /**
   * Get user's inventory (NFTs, ordinals, etc.)
   * Note: Items API may not be available in all SDK versions.
   */
  async getInventory(authToken) {
    try {
      const account = this.getAccount(authToken);
      const accountAny = account;
      if (!accountAny.items) {
        throw new HandCashError("Items API not available in this SDK version", "API_UNAVAILABLE");
      }
      return await accountAny.items.getInventory();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get inventory";
      throw new HandCashError(message, "INVENTORY_ERROR");
    }
  }
  /**
   * Transfer items (ordinals) to another user
   * Note: Items API may not be available in all SDK versions.
   */
  async transferItems(authToken, params) {
    try {
      const account = this.getAccount(authToken);
      const accountAny = account;
      if (!accountAny.items) {
        throw new HandCashError("Items API not available in this SDK version", "API_UNAVAILABLE");
      }
      return await accountAny.items.transfer({
        destinationsWithOrigins: [
          {
            origins: params.origins,
            destination: params.destination
          }
        ]
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to transfer items";
      throw new HandCashError(message, "TRANSFER_ERROR");
    }
  }
  // ============================================================================
  // House Account (Global/Admin Wallet)
  // ============================================================================
  /**
   * Get the house account for platform operations.
   * Requires HOUSE_AUTH_TOKEN environment variable.
   */
  getHouseAccount() {
    const houseAuthToken = process.env.HOUSE_AUTH_TOKEN;
    if (!houseAuthToken) {
      throw new HandCashError("HOUSE_AUTH_TOKEN not configured", "CONFIG_ERROR");
    }
    return this.getAccount(houseAuthToken);
  }
  /**
   * Send payment from the house account
   */
  async sendHousePayment(params) {
    const houseAuthToken = process.env.HOUSE_AUTH_TOKEN;
    if (!houseAuthToken) {
      throw new HandCashError("HOUSE_AUTH_TOKEN not configured", "CONFIG_ERROR");
    }
    return this.sendPayment(houseAuthToken, params);
  }
};
var handcashServer = new HandCashServer();

// src/client.ts
var AUTH_BASE_URL = "https://app.handcash.io";
var DEFAULT_PERMISSIONS = ["USER_PUBLIC_PROFILE", "USER_PRIVATE_PROFILE", "PAY", "BALANCE"];
var STORAGE_KEYS = {
  AUTH_TOKEN: "handcash_auth_token",
  PROFILE: "handcash_profile"
};
var HandCashClient = class {
  constructor(config) {
    this.authToken = null;
    this.profile = null;
    this.appId = config.appId;
    this.redirectUri = config.redirectUri || (typeof window !== "undefined" ? `${window.location.origin}/handcash-callback` : "");
    this.permissions = config.permissions || DEFAULT_PERMISSIONS;
    if (typeof window !== "undefined") {
      this.loadAuthData();
    }
  }
  // ============================================================================
  // Storage Operations
  // ============================================================================
  loadAuthData() {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (storedToken) {
        this.authToken = storedToken;
      }
      if (storedProfile) {
        this.profile = JSON.parse(storedProfile);
      }
    } catch (e) {
      console.error("[HandCashClient] Failed to load auth data:", e);
    }
  }
  saveAuthData(token, profile) {
    this.authToken = token;
    this.profile = profile;
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error("[HandCashClient] Failed to save auth data:", e);
    }
  }
  /**
   * Clear all stored authentication data
   */
  clearAuth() {
    this.authToken = null;
    this.profile = null;
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
    } catch (e) {
      console.error("[HandCashClient] Failed to clear auth data:", e);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("handcash-logout"));
    }
  }
  // ============================================================================
  // OAuth Flow
  // ============================================================================
  /**
   * Get the OAuth authorization URL.
   * Redirect the user to this URL to begin authentication.
   */
  getOAuthUrl() {
    const redirectUri = encodeURIComponent(this.redirectUri);
    const permissions = encodeURIComponent(this.permissions.join(","));
    return `${AUTH_BASE_URL}/oauth/authorize?app_id=${this.appId}&redirect_uri=${redirectUri}&permissions=${permissions}`;
  }
  /**
   * Handle the OAuth callback after user authorization.
   * Call this with the 'code' parameter from the callback URL.
   */
  async handleOAuthCallback(code) {
    try {
      const tokenResponse = await fetch(`${AUTH_BASE_URL}/api/connect/v1/oauth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          app_id: this.appId,
          code,
          grant_type: "authorization_code"
        })
      });
      if (!tokenResponse.ok) {
        throw new HandCashAuthError("Failed to exchange code for token");
      }
      const { authToken } = await tokenResponse.json();
      const profileResponse = await fetch(`${AUTH_BASE_URL}/api/connect/v1/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      if (!profileResponse.ok) {
        throw new HandCashAuthError("Failed to fetch profile");
      }
      const profile = await profileResponse.json();
      this.saveAuthData(authToken, profile);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("handcash-authenticated", { detail: profile }));
      }
      return { authToken, profile };
    } catch (error) {
      console.error("[HandCashClient] OAuth error:", error);
      return null;
    }
  }
  // ============================================================================
  // Auth State
  // ============================================================================
  /**
   * Check if user is currently authenticated
   */
  isAuthenticated() {
    return this.authToken !== null && this.profile !== null;
  }
  /**
   * Get the stored user profile
   */
  getProfile() {
    return this.profile;
  }
  /**
   * Get the stored auth token
   */
  getAuthToken() {
    return this.authToken;
  }
  // ============================================================================
  // API Operations (Client-Side)
  // ============================================================================
  /**
   * Fetch current wallet balance
   */
  async getBalance() {
    if (!this.authToken) {
      return null;
    }
    try {
      const response = await fetch(`${AUTH_BASE_URL}/api/connect/v1/wallet/balance`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`
        }
      });
      if (!response.ok) {
        throw new HandCashError("Failed to fetch balance", "BALANCE_ERROR");
      }
      const data = await response.json();
      return {
        bsv: data.spendable?.amount || 0,
        usd: data.spendable?.usdAmount || 0,
        satoshis: data.spendable?.satoshis || 0
      };
    } catch (error) {
      console.error("[HandCashClient] Balance error:", error);
      return { bsv: 0, usd: 0, satoshis: 0 };
    }
  }
  /**
   * Send a payment (client-side, uses stored auth token)
   */
  async sendPayment(to, amount, currency = "USD", description) {
    if (!this.authToken) {
      return null;
    }
    try {
      const response = await fetch(`${AUTH_BASE_URL}/api/connect/v1/wallet/pay`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          payments: [{ to, amount, currency }],
          description
        })
      });
      if (!response.ok) {
        throw new HandCashError("Failed to send payment", "PAYMENT_ERROR");
      }
      const data = await response.json();
      return { transactionId: data.transactionId };
    } catch (error) {
      console.error("[HandCashClient] Payment error:", error);
      return null;
    }
  }
  // ============================================================================
  // Mock Authentication (for Development)
  // ============================================================================
  /**
   * Create a mock authentication for development/testing.
   * This simulates a HandCash login without actual OAuth.
   */
  async mockAuthenticate(mockData) {
    const mockProfile = {
      publicProfile: {
        id: mockData?.publicProfile?.id || "mock-user-" + Date.now(),
        handle: mockData?.publicProfile?.handle || "mockuser",
        paymail: mockData?.publicProfile?.paymail || "mockuser@handcash.io",
        displayName: mockData?.publicProfile?.displayName || "Mock User",
        avatarUrl: mockData?.publicProfile?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=mock",
        localCurrencyCode: mockData?.publicProfile?.localCurrencyCode || "USD"
      },
      privateProfile: mockData?.privateProfile || {
        email: "mock@example.com",
        phoneNumber: "+1234567890"
      }
    };
    const mockToken = "mock-auth-token-" + Date.now();
    this.saveAuthData(mockToken, mockProfile);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("handcash-authenticated", { detail: mockProfile }));
    }
    return { authToken: mockToken, profile: mockProfile };
  }
};
function createHandCashClient(config) {
  return new HandCashClient(config);
}

// src/provider.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var HandCashContext = (0, import_react.createContext)(void 0);
function useHandCash() {
  const context = (0, import_react.useContext)(HandCashContext);
  if (!context) {
    throw new Error("useHandCash must be used within a HandCashProvider");
  }
  return context;
}
function HandCashProvider({
  children,
  appId,
  redirectUri,
  permissions,
  mockMode = false,
  mockProfile,
  onAuthChange
}) {
  const [isAuthenticated, setIsAuthenticated] = (0, import_react.useState)(false);
  const [profile, setProfile] = (0, import_react.useState)(null);
  const [balance, setBalance] = (0, import_react.useState)(null);
  const [assets, setAssets] = (0, import_react.useState)([]);
  const [isLoading, setIsLoading] = (0, import_react.useState)(true);
  const [error, setError] = (0, import_react.useState)(null);
  const client = (0, import_react.useMemo)(() => {
    const config = { appId };
    if (redirectUri) config.redirectUri = redirectUri;
    if (permissions) config.permissions = permissions;
    return new HandCashClient(config);
  }, [appId, redirectUri, permissions]);
  const refreshBalance = (0, import_react.useCallback)(async () => {
    try {
      const newBalance = await client.getBalance();
      if (newBalance) {
        setBalance(newBalance);
      }
    } catch (err) {
      console.error("[HandCashProvider] Error fetching balance:", err);
      setError("Failed to fetch balance");
    }
  }, [client]);
  const refreshAssets = (0, import_react.useCallback)(async () => {
    setAssets([]);
  }, []);
  const signIn = (0, import_react.useCallback)(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (mockMode) {
        const result = await client.mockAuthenticate(mockProfile);
        setProfile(result.profile);
        setIsAuthenticated(true);
        await refreshBalance();
        onAuthChange?.(true, result.profile);
      } else {
        window.location.href = client.getOAuthUrl();
      }
    } catch (err) {
      console.error("[HandCashProvider] Sign in error:", err);
      setError("Failed to sign in with HandCash");
    } finally {
      setIsLoading(false);
    }
  }, [client, mockMode, mockProfile, refreshBalance, onAuthChange]);
  const signOut = (0, import_react.useCallback)(() => {
    client.clearAuth();
    setIsAuthenticated(false);
    setProfile(null);
    setBalance(null);
    setAssets([]);
    setError(null);
    onAuthChange?.(false, null);
  }, [client, onAuthChange]);
  const getOAuthUrl = (0, import_react.useCallback)(() => {
    return client.getOAuthUrl();
  }, [client]);
  const handleCallback = (0, import_react.useCallback)(
    async (code) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await client.handleOAuthCallback(code);
        if (result) {
          setProfile(result.profile);
          setIsAuthenticated(true);
          await refreshBalance();
          await refreshAssets();
          onAuthChange?.(true, result.profile);
          return true;
        }
        return false;
      } catch (err) {
        console.error("[HandCashProvider] Callback error:", err);
        setError("Failed to complete authentication");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [client, refreshBalance, refreshAssets, onAuthChange]
  );
  const sendPayment = (0, import_react.useCallback)(
    async (to, amount, currency = "USD") => {
      try {
        const result = await client.sendPayment(to, amount, currency);
        if (result) {
          await refreshBalance();
          return result.transactionId;
        }
        return null;
      } catch (err) {
        console.error("[HandCashProvider] Payment error:", err);
        setError("Failed to send payment");
        return null;
      }
    },
    [client, refreshBalance]
  );
  (0, import_react.useEffect)(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        if (client.isAuthenticated()) {
          const storedProfile = client.getProfile();
          if (storedProfile) {
            setProfile(storedProfile);
            setIsAuthenticated(true);
            await refreshBalance();
            await refreshAssets();
            onAuthChange?.(true, storedProfile);
          }
        }
      } catch (err) {
        console.error("[HandCashProvider] Error initializing auth:", err);
        setError("Failed to restore session");
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
    const handleAuthEvent = (event) => {
      setProfile(event.detail);
      setIsAuthenticated(true);
      refreshBalance();
      refreshAssets();
      onAuthChange?.(true, event.detail);
    };
    const handleLogoutEvent = () => {
      setIsAuthenticated(false);
      setProfile(null);
      setBalance(null);
      setAssets([]);
      onAuthChange?.(false, null);
    };
    window.addEventListener("handcash-authenticated", handleAuthEvent);
    window.addEventListener("handcash-logout", handleLogoutEvent);
    return () => {
      window.removeEventListener("handcash-authenticated", handleAuthEvent);
      window.removeEventListener("handcash-logout", handleLogoutEvent);
    };
  }, [client, refreshBalance, refreshAssets, onAuthChange]);
  const contextValue = (0, import_react.useMemo)(
    () => ({
      // State
      isAuthenticated,
      profile,
      balance,
      assets,
      isLoading,
      error,
      // Auth Actions
      signIn,
      signOut,
      getOAuthUrl,
      handleCallback,
      // Wallet Actions
      refreshBalance,
      refreshAssets,
      sendPayment
    }),
    [
      isAuthenticated,
      profile,
      balance,
      assets,
      isLoading,
      error,
      signIn,
      signOut,
      getOAuthUrl,
      handleCallback,
      refreshBalance,
      refreshAssets,
      sendPayment
    ]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HandCashContext.Provider, { value: contextValue, children });
}
function HandCashConnectButton({ className, children }) {
  const { isAuthenticated, isLoading, signIn, signOut, profile } = useHandCash();
  if (isLoading) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className, disabled: true, children: "Loading..." });
  }
  if (isAuthenticated && profile) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className, onClick: signOut, children: children || `${profile.publicProfile.handle} (Sign Out)` });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className, onClick: signIn, children: children || "Connect HandCash" });
}
function HandCashProfileDisplay({ className, showBalance = true }) {
  const { isAuthenticated, profile, balance } = useHandCash();
  if (!isAuthenticated || !profile) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "img",
      {
        src: profile.publicProfile.avatarUrl,
        alt: profile.publicProfile.displayName,
        style: { width: 32, height: 32, borderRadius: "50%" }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: profile.publicProfile.handle }),
    showBalance && balance && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
      "$",
      balance.usd.toFixed(2)
    ] })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HandCashAuthError,
  HandCashClient,
  HandCashConnectButton,
  HandCashDemoModeError,
  HandCashError,
  HandCashProfileDisplay,
  HandCashProvider,
  HandCashServer,
  createHandCashClient,
  handcashServer,
  useHandCash
});
