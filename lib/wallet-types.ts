// Wallet TypeScript declarations for browser window objects

declare global {
  interface Window {
    // Phantom Wallet (Solana)
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: (args: any) => void) => void;
      off: (event: string, callback: (args: any) => void) => void;
    };

    // MetaMask (Ethereum)
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (args: any) => void) => void;
      removeListener: (event: string, callback: (args: any) => void) => void;
      selectedAddress?: string;
      chainId?: string;
    };

    // HandCash (Bitcoin SV)
    handcash?: {
      connect: () => Promise<{ cashaddr: string; pubkey: string }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: (args: any) => void) => void;
      off: (event: string, callback: (args: any) => void) => void;
    };
  }
}

export {}; 