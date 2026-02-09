"use client";
"use strict";
"use client";
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

// src/provider.tsx
var provider_exports = {};
__export(provider_exports, {
  MultiWalletProvider: () => MultiWalletProvider,
  default: () => provider_default,
  useWallet: () => useWallet
});
module.exports = __toCommonJS(provider_exports);
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var defaultState = {
  isConnected: false,
  provider: null,
  address: null,
  publicKey: null,
  chain: null,
  isConnecting: false,
  error: null,
  connect: async () => {
  },
  disconnect: async () => {
  }
};
var WalletCtx = (0, import_react.createContext)(defaultState);
function useWallet() {
  const ctx = (0, import_react.useContext)(WalletCtx);
  if (!ctx) {
    throw new Error("useWallet must be used within MultiWalletProvider");
  }
  return ctx;
}
function MultiWalletProvider({
  children,
  handcashAuthUrl = "/api/auth/handcash",
  persistSelection = true,
  storageKey = "b0ase_wallet",
  onConnect,
  onDisconnect,
  onError
}) {
  const [state, setState] = (0, import_react.useState)({
    isConnected: false,
    provider: null,
    address: null,
    publicKey: null,
    chain: null,
    isConnecting: false,
    error: null
  });
  const getChain = (provider) => {
    const chains = {
      handcash: "bsv",
      yours: "bsv",
      phantom: "solana",
      metamask: "ethereum"
    };
    return chains[provider];
  };
  (0, import_react.useEffect)(() => {
    const getCookie = (name) => {
      if (typeof document === "undefined") return null;
      const value2 = `; ${document.cookie}`;
      const parts = value2.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
      return null;
    };
    const authToken = getCookie("b0ase_auth_token");
    const handle = getCookie("b0ase_user_handle");
    if (authToken && handle) {
      setState((prev) => ({
        ...prev,
        isConnected: true,
        provider: "handcash",
        address: handle,
        chain: "bsv"
      }));
    }
  }, []);
  (0, import_react.useEffect)(() => {
    if (!persistSelection || typeof window === "undefined") return;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const { provider, address } = JSON.parse(stored);
        if (provider && address) {
          setState((prev) => ({
            ...prev,
            isConnected: true,
            provider,
            address,
            chain: getChain(provider)
          }));
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
  }, [persistSelection, storageKey]);
  const connect = (0, import_react.useCallback)(
    async (provider) => {
      setState((prev) => ({ ...prev, isConnecting: true, error: null }));
      try {
        let address = null;
        let publicKey = null;
        switch (provider) {
          case "handcash": {
            const returnTo = typeof window !== "undefined" ? window.location.pathname : "/";
            window.location.href = `${handcashAuthUrl}?returnTo=${encodeURIComponent(returnTo)}`;
            return;
          }
          case "yours": {
            if (typeof window === "undefined") {
              throw new Error("Yours wallet only works in browser");
            }
            throw new Error(
              "Yours wallet requires YoursWalletProvider wrapper"
            );
          }
          case "phantom": {
            const solana = window.solana;
            if (!solana?.isPhantom) {
              window.open("https://phantom.app/", "_blank");
              throw new Error("Phantom wallet not installed");
            }
            const resp = await solana.connect();
            address = resp.publicKey.toString();
            publicKey = address;
            break;
          }
          case "metamask": {
            const ethereum = window.ethereum;
            if (!ethereum?.isMetaMask) {
              window.open("https://metamask.io/", "_blank");
              throw new Error("MetaMask not installed");
            }
            const accounts = await ethereum.request({
              method: "eth_requestAccounts"
            });
            address = accounts?.[0] || null;
            break;
          }
        }
        if (!address) {
          throw new Error("Failed to get wallet address");
        }
        const chain = getChain(provider);
        setState({
          isConnected: true,
          provider,
          address,
          publicKey,
          chain,
          isConnecting: false,
          error: null
        });
        if (persistSelection && typeof window !== "undefined") {
          localStorage.setItem(storageKey, JSON.stringify({ provider, address }));
        }
        onConnect?.(provider, address);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: error.message
        }));
        onError?.(error);
      }
    },
    [handcashAuthUrl, persistSelection, storageKey, onConnect, onError]
  );
  const disconnect = (0, import_react.useCallback)(async () => {
    try {
      const { provider } = state;
      if (provider === "phantom" && window.solana) {
        await window.solana.disconnect();
      }
      setState({
        isConnected: false,
        provider: null,
        address: null,
        publicKey: null,
        chain: null,
        isConnecting: false,
        error: null
      });
      if (persistSelection && typeof window !== "undefined") {
        localStorage.removeItem(storageKey);
      }
      onDisconnect?.();
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  }, [state, persistSelection, storageKey, onDisconnect]);
  const signMessage = (0, import_react.useCallback)(
    async (message) => {
      const { provider } = state;
      if (!provider) {
        throw new Error("No wallet connected");
      }
      switch (provider) {
        case "phantom": {
          if (!window.solana) throw new Error("Phantom not available");
          const encodedMessage = new TextEncoder().encode(message);
          const { signature } = await window.solana.signMessage(
            encodedMessage,
            "utf8"
          );
          return Buffer.from(signature).toString("hex");
        }
        case "metamask": {
          if (!window.ethereum) throw new Error("MetaMask not available");
          const address = state.address;
          if (!address) throw new Error("No address");
          const signature = await window.ethereum.request({
            method: "personal_sign",
            params: [message, address]
          });
          return signature || "";
        }
        default:
          throw new Error(`Signing not supported for ${provider}`);
      }
    },
    [state]
  );
  const value = {
    ...state,
    connect,
    disconnect,
    signMessage
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletCtx.Provider, { value, children });
}
var provider_default = MultiWalletProvider;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MultiWalletProvider,
  useWallet
});
//# sourceMappingURL=provider.cjs.map