"use client";

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
  validateAddress,
  validateAuthRequest
};
//# sourceMappingURL=server.js.map