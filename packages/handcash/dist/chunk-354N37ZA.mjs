import {
  HandCashClient
} from "./chunk-EUJVF2AN.mjs";

// src/provider.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo
} from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var HandCashContext = createContext(void 0);
function useHandCash() {
  const context = useContext(HandCashContext);
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(null);
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const client = useMemo(() => {
    const config = { appId };
    if (redirectUri) config.redirectUri = redirectUri;
    if (permissions) config.permissions = permissions;
    return new HandCashClient(config);
  }, [appId, redirectUri, permissions]);
  const refreshBalance = useCallback(async () => {
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
  const refreshAssets = useCallback(async () => {
    setAssets([]);
  }, []);
  const signIn = useCallback(async () => {
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
  const signOut = useCallback(() => {
    client.clearAuth();
    setIsAuthenticated(false);
    setProfile(null);
    setBalance(null);
    setAssets([]);
    setError(null);
    onAuthChange?.(false, null);
  }, [client, onAuthChange]);
  const getOAuthUrl = useCallback(() => {
    return client.getOAuthUrl();
  }, [client]);
  const handleCallback = useCallback(
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
  const sendPayment = useCallback(
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
  useEffect(() => {
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
  const contextValue = useMemo(
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
  return /* @__PURE__ */ jsx(HandCashContext.Provider, { value: contextValue, children });
}
function HandCashConnectButton({ className, children }) {
  const { isAuthenticated, isLoading, signIn, signOut, profile } = useHandCash();
  if (isLoading) {
    return /* @__PURE__ */ jsx("button", { className, disabled: true, children: "Loading..." });
  }
  if (isAuthenticated && profile) {
    return /* @__PURE__ */ jsx("button", { className, onClick: signOut, children: children || `${profile.publicProfile.handle} (Sign Out)` });
  }
  return /* @__PURE__ */ jsx("button", { className, onClick: signIn, children: children || "Connect HandCash" });
}
function HandCashProfileDisplay({ className, showBalance = true }) {
  const { isAuthenticated, profile, balance } = useHandCash();
  if (!isAuthenticated || !profile) {
    return null;
  }
  return /* @__PURE__ */ jsxs("div", { className, children: [
    /* @__PURE__ */ jsx(
      "img",
      {
        src: profile.publicProfile.avatarUrl,
        alt: profile.publicProfile.displayName,
        style: { width: 32, height: 32, borderRadius: "50%" }
      }
    ),
    /* @__PURE__ */ jsx("span", { children: profile.publicProfile.handle }),
    showBalance && balance && /* @__PURE__ */ jsxs("span", { children: [
      "$",
      balance.usd.toFixed(2)
    ] })
  ] });
}

export {
  useHandCash,
  HandCashProvider,
  HandCashConnectButton,
  HandCashProfileDisplay
};
