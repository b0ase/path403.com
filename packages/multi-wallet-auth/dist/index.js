"use client";

// src/types.ts
var PROVIDER_CHAINS = {
  handcash: "bsv",
  yours: "bsv",
  phantom: "solana",
  metamask: "ethereum"
};

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

// src/server.ts
function isValidEthereumAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
function isValidSolanaAddress(address) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}
function isValidBsvAddress(address) {
  return /^[1mn][a-km-zA-HJ-NP-Z0-9]{25,34}$/.test(address);
}
function isValidHandCashHandle(handle) {
  return /^[a-zA-Z0-9_]{1,20}$/.test(handle);
}
function validateAddress(provider, address) {
  switch (provider) {
    case "handcash":
      return isValidHandCashHandle(address);
    case "yours":
      return isValidBsvAddress(address);
    case "phantom":
      return isValidSolanaAddress(address);
    case "metamask":
      return isValidEthereumAddress(address);
    default:
      return false;
  }
}
function normalizeAddress(provider, address) {
  if (provider === "metamask") {
    return address.toLowerCase();
  }
  return address;
}
function parseWalletSession(cookies) {
  const provider = cookies["b0ase_wallet_provider"];
  const address = cookies["b0ase_wallet_address"];
  if (!provider || !address) {
    const authToken = cookies["b0ase_auth_token"];
    const handle = cookies["b0ase_user_handle"];
    if (authToken && handle) {
      return {
        provider: "handcash",
        address: handle,
        chain: "bsv"
      };
    }
    return null;
  }
  const chains = {
    handcash: "bsv",
    yours: "bsv",
    phantom: "solana",
    metamask: "ethereum"
  };
  return {
    provider,
    address,
    chain: chains[provider]
  };
}
function createSessionCookies(provider, address, maxAge = 2592e3) {
  const options = `Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  return [
    `b0ase_wallet_provider=${provider}; ${options}`,
    `b0ase_wallet_address=${normalizeAddress(provider, address)}; ${options}`
  ];
}
function clearSessionCookies() {
  const options = "Path=/; Max-Age=0; SameSite=Lax";
  return [
    `b0ase_wallet_provider=; ${options}`,
    `b0ase_wallet_address=; ${options}`
  ];
}
function validateAuthRequest(body) {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request body" };
  }
  const { provider, address } = body;
  if (!provider || typeof provider !== "string") {
    return { valid: false, error: "provider is required" };
  }
  if (!address || typeof address !== "string") {
    return { valid: false, error: "address is required" };
  }
  const validProviders = [
    "handcash",
    "yours",
    "phantom",
    "metamask"
  ];
  if (!validProviders.includes(provider)) {
    return {
      valid: false,
      error: `Invalid provider. Must be one of: ${validProviders.join(", ")}`
    };
  }
  if (!validateAddress(provider, address)) {
    return { valid: false, error: "Invalid address format for provider" };
  }
  return {
    valid: true,
    data: {
      provider,
      address: normalizeAddress(provider, address)
    }
  };
}
function generateDisplayName(provider, address) {
  if (provider === "handcash") {
    return `$${address}`;
  }
  if (provider === "metamask") {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  if (provider === "phantom") {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
function getChainForProvider(provider) {
  const chains = {
    handcash: "bsv",
    yours: "bsv",
    phantom: "solana",
    metamask: "ethereum"
  };
  return chains[provider];
}
function getExplorerUrl(chain, txid) {
  switch (chain) {
    case "bsv":
      return `https://whatsonchain.com/tx/${txid}`;
    case "ethereum":
      return `https://etherscan.io/tx/${txid}`;
    case "solana":
      return `https://solscan.io/tx/${txid}`;
  }
}
function getAddressExplorerUrl(chain, address) {
  switch (chain) {
    case "bsv":
      return `https://whatsonchain.com/address/${address}`;
    case "ethereum":
      return `https://etherscan.io/address/${address}`;
    case "solana":
      return `https://solscan.io/account/${address}`;
  }
}
export {
  MultiWalletProvider,
  PROVIDER_CHAINS,
  clearSessionCookies,
  createSessionCookies,
  generateDisplayName,
  getAddressExplorerUrl,
  getChainForProvider,
  getExplorerUrl,
  isValidBsvAddress,
  isValidEthereumAddress,
  isValidHandCashHandle,
  isValidSolanaAddress,
  normalizeAddress,
  parseWalletSession,
  useWallet,
  validateAddress,
  validateAuthRequest
};
//# sourceMappingURL=index.js.map