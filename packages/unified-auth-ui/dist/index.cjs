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
  AuthStateManager: () => AuthStateManager,
  OAUTH_PROVIDERS: () => OAUTH_PROVIDERS,
  WALLET_PROVIDERS: () => WALLET_PROVIDERS,
  createAuthError: () => createAuthError,
  createAuthManager: () => createAuthManager,
  createDefaultConfig: () => createDefaultConfig,
  createSignMessage: () => createSignMessage,
  formatWalletAddress: () => formatWalletAddress,
  generateNonce: () => generateNonce,
  getBlockchainType: () => getBlockchainType,
  getProviderCategory: () => getProviderCategory,
  getProviderColor: () => getProviderColor,
  getProviderIcon: () => getProviderIcon,
  getProviderName: () => getProviderName,
  isOAuthProvider: () => isOAuthProvider,
  isWalletProvider: () => isWalletProvider
});
module.exports = __toCommonJS(index_exports);
var OAUTH_PROVIDERS = {
  google: {
    id: "google",
    name: "Google",
    category: "oauth",
    icon: "google",
    color: "#4285F4",
    enabled: true,
    featured: true
  },
  github: {
    id: "github",
    name: "GitHub",
    category: "oauth",
    icon: "github",
    color: "#24292e",
    darkColor: "#ffffff",
    enabled: true,
    featured: true
  },
  twitter: {
    id: "twitter",
    name: "X (Twitter)",
    category: "oauth",
    icon: "twitter",
    color: "#000000",
    darkColor: "#ffffff",
    enabled: true
  },
  discord: {
    id: "discord",
    name: "Discord",
    category: "oauth",
    icon: "discord",
    color: "#5865F2",
    enabled: true
  },
  apple: {
    id: "apple",
    name: "Apple",
    category: "oauth",
    icon: "apple",
    color: "#000000",
    darkColor: "#ffffff",
    enabled: true
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    category: "oauth",
    icon: "facebook",
    color: "#1877F2",
    enabled: false
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    category: "oauth",
    icon: "linkedin",
    color: "#0A66C2",
    enabled: false
  },
  twitch: {
    id: "twitch",
    name: "Twitch",
    category: "oauth",
    icon: "twitch",
    color: "#9146FF",
    enabled: false
  }
};
var WALLET_PROVIDERS = {
  metamask: {
    id: "metamask",
    name: "MetaMask",
    category: "wallet",
    icon: "metamask",
    color: "#E2761B",
    blockchain: "evm",
    enabled: true,
    featured: true
  },
  phantom: {
    id: "phantom",
    name: "Phantom",
    category: "wallet",
    icon: "phantom",
    color: "#AB9FF2",
    blockchain: "solana",
    enabled: true,
    featured: true
  },
  handcash: {
    id: "handcash",
    name: "HandCash",
    category: "wallet",
    icon: "handcash",
    color: "#38CB7C",
    blockchain: "bsv",
    enabled: true,
    featured: true
  },
  yours: {
    id: "yours",
    name: "Yours Wallet",
    category: "wallet",
    icon: "yours",
    color: "#FF6B00",
    blockchain: "bsv",
    enabled: true
  },
  walletconnect: {
    id: "walletconnect",
    name: "WalletConnect",
    category: "wallet",
    icon: "walletconnect",
    color: "#3B99FC",
    blockchain: "multi",
    enabled: true
  },
  coinbase: {
    id: "coinbase",
    name: "Coinbase Wallet",
    category: "wallet",
    icon: "coinbase",
    color: "#0052FF",
    blockchain: "evm",
    enabled: true
  },
  ledger: {
    id: "ledger",
    name: "Ledger",
    category: "wallet",
    icon: "ledger",
    color: "#000000",
    darkColor: "#ffffff",
    blockchain: "multi",
    enabled: true
  },
  trezor: {
    id: "trezor",
    name: "Trezor",
    category: "wallet",
    icon: "trezor",
    color: "#00A846",
    blockchain: "multi",
    enabled: false,
    comingSoon: true
  }
};
var AuthStateManager = class {
  constructor(config) {
    this.listeners = /* @__PURE__ */ new Set();
    this.config = config;
    this.state = {
      isOpen: false,
      view: "providers",
      state: "idle"
    };
  }
  getState() {
    return { ...this.state };
  }
  getConfig() {
    return { ...this.config };
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  notify() {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }
  open() {
    this.state = {
      ...this.state,
      isOpen: true,
      view: "providers",
      state: "idle",
      error: void 0
    };
    this.notify();
  }
  close() {
    this.state = {
      ...this.state,
      isOpen: false
    };
    this.notify();
    this.config.callbacks?.onAuthCancel?.();
  }
  setView(view) {
    this.state = { ...this.state, view };
    this.notify();
  }
  selectProvider(provider) {
    const providerConfig = this.getProviderConfig(provider);
    if (!providerConfig || !providerConfig.enabled) {
      return;
    }
    this.state = {
      ...this.state,
      provider,
      state: "connecting",
      view: providerConfig.category === "wallet" ? "wallet-connect" : "loading"
    };
    this.notify();
    this.config.callbacks?.onAuthStart?.(provider);
  }
  setAuthenticating() {
    this.state = { ...this.state, state: "authenticating" };
    this.notify();
  }
  setSigning() {
    this.state = { ...this.state, state: "signing", view: "wallet-sign" };
    this.notify();
  }
  setSuccess(session) {
    this.state = {
      ...this.state,
      state: "success",
      view: "success",
      session,
      error: void 0
    };
    this.notify();
    this.config.callbacks?.onAuthSuccess?.(session);
  }
  setError(error) {
    this.state = {
      ...this.state,
      state: "error",
      view: "error",
      error
    };
    this.notify();
    this.config.callbacks?.onAuthError?.(error);
  }
  reset() {
    this.state = {
      isOpen: this.state.isOpen,
      view: "providers",
      state: "idle",
      provider: void 0,
      error: void 0,
      session: void 0
    };
    this.notify();
  }
  getProviderConfig(provider) {
    return this.config.providers.find((p) => p.id === provider);
  }
  getProvidersByCategory(category) {
    return this.config.providers.filter(
      (p) => p.category === category && p.enabled
    );
  }
  getFeaturedProviders() {
    if (this.config.featured && this.config.featured.length > 0) {
      return this.config.featured.map((id) => this.getProviderConfig(id)).filter((p) => !!p && p.enabled);
    }
    return this.config.providers.filter((p) => p.featured && p.enabled);
  }
};
function createAuthManager(config) {
  return new AuthStateManager(config);
}
function createDefaultConfig(overrides) {
  return {
    title: "Sign in",
    subtitle: "Choose your preferred sign in method",
    providers: [
      ...Object.values(OAUTH_PROVIDERS),
      ...Object.values(WALLET_PROVIDERS),
      {
        id: "email",
        name: "Email",
        category: "email",
        icon: "mail",
        color: "#6B7280",
        enabled: true
      }
    ],
    featured: ["google", "github", "metamask", "phantom"],
    theme: "system",
    showTerms: true,
    ...overrides
  };
}
function getProviderIcon(provider) {
  const config = OAUTH_PROVIDERS[provider] || WALLET_PROVIDERS[provider];
  return config?.icon || provider;
}
function getProviderColor(provider, dark) {
  const config = OAUTH_PROVIDERS[provider] || WALLET_PROVIDERS[provider];
  if (!config) return "#6B7280";
  return dark && config.darkColor ? config.darkColor : config.color;
}
function getProviderName(provider) {
  const config = OAUTH_PROVIDERS[provider] || WALLET_PROVIDERS[provider];
  return config?.name || provider;
}
function getProviderCategory(provider) {
  if (provider in OAUTH_PROVIDERS) return "oauth";
  if (provider in WALLET_PROVIDERS) return "wallet";
  if (provider === "email") return "email";
  if (provider === "phone") return "phone";
  if (provider === "passkey") return "passkey";
  return "oauth";
}
function isWalletProvider(provider) {
  return provider in WALLET_PROVIDERS;
}
function isOAuthProvider(provider) {
  return provider in OAUTH_PROVIDERS;
}
function getBlockchainType(provider) {
  return WALLET_PROVIDERS[provider]?.blockchain;
}
function createAuthError(code, message, provider) {
  const defaultMessages = {
    user_cancelled: "Authentication was cancelled",
    wallet_not_installed: "Wallet extension not detected",
    connection_failed: "Failed to connect",
    signature_rejected: "Signature request was rejected",
    invalid_credentials: "Invalid credentials",
    account_not_found: "Account not found",
    account_disabled: "Account has been disabled",
    rate_limited: "Too many attempts. Please try again later",
    network_error: "Network error. Please check your connection",
    unknown: "An unknown error occurred"
  };
  return {
    code,
    message: message || defaultMessages[code],
    provider
  };
}
function generateNonce() {
  const array = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
function createSignMessage(domain, nonce, statement) {
  const parts = [
    `${domain} wants you to sign in with your wallet.`
  ];
  if (statement) {
    parts.push("", statement);
  }
  parts.push(
    "",
    `Nonce: ${nonce}`,
    `Issued At: ${(/* @__PURE__ */ new Date()).toISOString()}`
  );
  return parts.join("\n");
}
function formatWalletAddress(address, chars = 4) {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthStateManager,
  OAUTH_PROVIDERS,
  WALLET_PROVIDERS,
  createAuthError,
  createAuthManager,
  createDefaultConfig,
  createSignMessage,
  formatWalletAddress,
  generateNonce,
  getBlockchainType,
  getProviderCategory,
  getProviderColor,
  getProviderIcon,
  getProviderName,
  isOAuthProvider,
  isWalletProvider
});
//# sourceMappingURL=index.cjs.map