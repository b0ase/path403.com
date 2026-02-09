"use client";
"use client";

// src/provider.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from "react";
import { jsx } from "react/jsx-runtime";
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
var WalletCtx = createContext(defaultState);
function useWallet() {
  const ctx = useContext(WalletCtx);
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
  const [state, setState] = useState({
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
  useEffect(() => {
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
  useEffect(() => {
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
  const connect = useCallback(
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
  const disconnect = useCallback(async () => {
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
  const signMessage = useCallback(
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
  return /* @__PURE__ */ jsx(WalletCtx.Provider, { value, children });
}
var provider_default = MultiWalletProvider;
export {
  MultiWalletProvider,
  provider_default as default,
  useWallet
};
//# sourceMappingURL=provider.js.map