import {
  HandCashAuthError,
  HandCashError
} from "./chunk-YNLUK5BH.mjs";

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

export {
  HandCashClient,
  createHandCashClient
};
