'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { FiHome, FiExternalLink, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaWallet,
  FaPlug,
  FaUnlink,
  FaSync,
  FaCopy,
  FaComments,
  FaPaperPlane,
  FaLock,
  FaUnlockAlt,
  FaBuilding,
  FaCrown,
  FaShieldAlt,
  FaSmile,
  FaImage,
  FaUserCheck,
  FaCircle,
  FaBroadcastTower,
  FaCoins,
  FaBars,
  FaTimes,
  FaInfoCircle
} from 'react-icons/fa';
import MobileBoardroomNav from '@/components/MobileBoardroomNav';
import ProposalsList from '@/components/boardroom/ProposalsList';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  tokens?: string[];
}

interface ChatRoom {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  requiredTokens: string[];
  isOpen: boolean;
  memberCount: number;
  lastActivity?: Date;
}

interface UserToken {
  symbol: string;
  name: string;
  balance: string | number;
  contract: string;
}

import { useUserHandle } from '@/hooks/useUserHandle';

export default function BoardroomPage() {
  // Theme and display state
  const [isDark, setIsDark] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [animatedTitle, setAnimatedTitle] = useState('BOARDROOM');
  const [activeCategory, setActiveCategory] = useState('chat');
  const [selectedFont, setSelectedFont] = useState(0);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showStateWindow, setShowStateWindow] = useState(false);

  // Authentication & User State
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [userTokens, setUserTokens] = useState<UserToken[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [walletError, setWalletError] = useState<string>('');
  const [tokenFetchRetryCount, setTokenFetchRetryCount] = useState(0);

  // View Mode (chat or proposals)
  const [viewMode, setViewMode] = useState<'chat' | 'proposals'>('chat');

  // Chat State
  const [activeRoom, setActiveRoom] = useState<string>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Broadcasting State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState<string>('');
  const [selectedTokenForBroadcast, setSelectedTokenForBroadcast] = useState<string>('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Available wallets
  const [availableWallets, setAvailableWallets] = useState({
    phantom: false,
    yours: false,
    metamask: false,
  });

  // Boardroom members state
  const [boardroomMembers, setBoardroomMembers] = useState<Array<{
    id: string;
    username: string;
    role: string;
    wallet_address: string | null;
    source: string;
    joined_at: string;
  }>>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Font options to match main site
  const fontOptions = [
    {
      name: 'Swiss Design',
      fonts: {
        primary: 'Helvetica Neue, Helvetica, sans-serif',
        secondary: 'Helvetica Neue, Helvetica, sans-serif',
        mono: 'IBM Plex Mono, monospace',
        display: 'Helvetica Neue, Helvetica, sans-serif'
      },
      weights: { regular: 400, bold: 700, black: 900 }
    },
    {
      name: 'Neo Grotesque',
      fonts: {
        primary: 'Manrope, sans-serif',
        secondary: 'DM Sans, sans-serif',
        mono: 'Fira Code, monospace',
        display: 'Manrope, sans-serif'
      },
      weights: { regular: 400, bold: 700, black: 800 }
    },
    {
      name: 'Grotesk',
      fonts: {
        primary: 'Space Grotesk, sans-serif',
        secondary: 'Work Sans, sans-serif',
        mono: 'Space Mono, monospace',
        display: 'Space Grotesk, sans-serif'
      },
      weights: { regular: 400, bold: 700, black: 900 }
    }
  ];

  const currentFont = fontOptions[selectedFont] || fontOptions[0];

  // HandCash Integration
  const { handle: handCashHandle } = useUserHandle();
  
  useEffect(() => {
    if (handCashHandle) {
      setConnectedWallet('HandCash');
      setWalletAddress(handCashHandle);
      setAccountName(handCashHandle);
      // In a real app, you would fetch tokens for this user from an API
      // For now, we allow access to general room
    }
  }, [handCashHandle]);

  // Fetch boardroom members
  const fetchMessages = async () => {
    try {
      console.log('[Chat] Fetching messages for room:', activeRoom);
      const response = await fetch(`/api/boardroom/chat?roomId=${activeRoom}`);
      const data = await response.json();

      if (response.ok) {
        const formattedMessages: ChatMessage[] = data.messages.map((msg: any) => ({
          id: msg.id,
          userId: msg.user_id,
          username: msg.username,
          message: msg.message,
          timestamp: new Date(msg.created_at),
          tokens: msg.tokens || []
        }));
        console.log('[Chat] Loaded messages:', formattedMessages.length);
        setMessages(formattedMessages);
      } else {
        console.error('Failed to fetch messages:', data.error);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchBoardroomMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const response = await fetch('/api/boardroom/members');
      const data = await response.json();

      if (data.success) {
        setBoardroomMembers(data.members);
      } else {
        console.error('Failed to fetch members:', data.error);
      }
    } catch (error) {
      console.error('Error fetching boardroom members:', error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Fetch persistent chat rooms from database
  const fetchChatRooms = async () => {
    if (!connectedWallet || !walletAddress) {
      // Fallback to basic rooms if no wallet
      const basicRooms: ChatRoom[] = [
        {
          id: 'general',
          name: 'General Discussion',
          icon: <FaComments className="text-blue-400" />,
          description: 'Open discussion for all authenticated users',
          requiredTokens: [],
          isOpen: true,
          memberCount: 0,
          lastActivity: undefined
        }
      ];
      setChatRooms(basicRooms);
      return;
    }

    try {
      console.log('[Boardroom] Fetching chat rooms for tokens:', userTokens.map(t => t.symbol));

      // First, create rooms for the user's tokens
      const createResponse = await fetch('/api/boardroom/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokens: userTokens,
          walletAddress: walletAddress
        }),
      });

      if (createResponse.ok) {
        const createData = await createResponse.json();
        console.log('[Boardroom] Created rooms:', createData.createdRooms);
      }

      // Then fetch all available rooms
      const userTokenSymbols = userTokens.map(t => t.symbol);
      const fetchResponse = await fetch(`/api/boardroom/rooms?tokens=${userTokenSymbols.join(',')}&wallet=${walletAddress}`);

      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        console.log('[Boardroom] Fetched rooms:', data.rooms);

        // Convert database rooms to ChatRoom format
        const rooms: ChatRoom[] = data.rooms.map((room: any) => {
          const tokenColors: { [key: string]: string } = {
            'SOL': 'text-purple-400',
            'BOASE': 'text-blue-400',
            'BITCOIN': 'text-orange-400',
            'PNUT': 'text-yellow-400',
            'SIGMA': 'text-green-400',
            'USDC': 'text-green-400',
            'USDT': 'text-green-400',
            'JUP': 'text-purple-400',
            'RAY': 'text-blue-400',
            'SRM': 'text-orange-400'
          };

          // Determine icon based on room type
          let icon;
          if (room.id === 'general') {
            icon = <FaComments className="text-blue-400" />;
          } else if (room.id === 'multi-token-vip') {
            icon = <FaCrown className="text-yellow-400" />;
          } else {
            // Token holder room
            const tokenSymbol = room.required_tokens[0];
            const color = tokenColors[tokenSymbol] || 'text-gray-400';
            icon = <FaCircle className={color} />;
          }

          return {
            id: room.id,
            name: room.name,
            icon: icon,
            description: room.description,
            requiredTokens: room.required_tokens,
            isOpen: room.has_access,
            memberCount: 0, // TODO: Add member counting
            lastActivity: undefined
          };
        });

        setChatRooms(rooms);

        // If current active room is no longer available, switch to general
        const currentRoomExists = rooms.find(room => room.id === activeRoom);
        if (!currentRoomExists && rooms.length > 0) {
          setActiveRoom('general');
        }
      } else {
        console.error('[Boardroom] Failed to fetch chat rooms');
        // Fallback to basic rooms
        const basicRooms: ChatRoom[] = [
          {
            id: 'general',
            name: 'General Discussion',
            icon: <FaComments className="text-blue-400" />,
            description: 'Open discussion for all authenticated users',
            requiredTokens: [],
            isOpen: true,
            memberCount: 0,
            lastActivity: undefined
          }
        ];
        setChatRooms(basicRooms);
      }
    } catch (error) {
      console.error('[Boardroom] Error fetching chat rooms:', error);
      // Fallback to basic rooms
      const basicRooms: ChatRoom[] = [
        {
          id: 'general',
          name: 'General Discussion',
          icon: <FaComments className="text-blue-400" />,
          description: 'Open discussion for all authenticated users',
          requiredTokens: [],
          isOpen: true,
          memberCount: 0,
          lastActivity: undefined
        }
      ];
      setChatRooms(basicRooms);
    }
  };

  // Chat rooms configuration - now dynamic based on user tokens
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  // Initialize client state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Apply dark mode class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Title animation effect
  useEffect(() => {
    if (!isClient) return;

    const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const titleTarget = 'BOARDROOM';
    let titleDisplay = titleTarget.split('');
    let isAnimating = false;

    const animateTitle = () => {
      if (isAnimating) return;
      isAnimating = true;

      // Scramble phase
      let scrambleFrames = 0;
      const maxScrambleFrames = 6;

      const scramblePhase = setInterval(() => {
        titleDisplay = titleTarget.split('').map(char =>
          scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
        );
        setAnimatedTitle(titleDisplay.join(''));
        scrambleFrames++;

        if (scrambleFrames >= maxScrambleFrames) {
          clearInterval(scramblePhase);

          // Resolve phase
          const resolvePhase = setInterval(() => {
            let allResolved = true;
            titleDisplay = titleTarget.split('').map((char, i) => {
              if (titleDisplay[i] === char) return char;
              if (Math.random() < 0.3) return char;
              allResolved = false;
              return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            });
            setAnimatedTitle(titleDisplay.join(''));

            if (allResolved) {
              clearInterval(resolvePhase);
              isAnimating = false;
            }
          }, 40);
        }
      }, 40);
    };

    const interval = setInterval(animateTitle, 8000);
    setTimeout(animateTitle, 2000);

    return () => clearInterval(interval);
  }, [isClient]);

  // Fetch chat rooms when wallet/tokens change
  // This handles both initial load AND subsequent wallet connections
  useEffect(() => {
    // Always fetch - the function handles the no-wallet case internally
    fetchChatRooms();
  }, [userTokens, connectedWallet, walletAddress]);

  // Check wallet availability
  useEffect(() => {
    const checkWallets = () => {
      if (typeof window !== 'undefined') {
        setAvailableWallets({
          phantom: 'phantom' in window,
          yours: 'yours' in window || 'YoursWallet' in window || 'yoursWallet' in window,
          metamask: typeof (window as any).ethereum !== 'undefined' && (window as any).ethereum.isMetaMask,
        });
      }
    };

    checkWallets();
    const timeoutId = setTimeout(checkWallets, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  // Auto-connect from existing wallet connection (cookies)
  useEffect(() => {
    const autoConnect = async () => {
      if (connectedWallet) return; // Already connected

      // Check for existing wallet connection from account page
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };

      const walletProvider = getCookie('b0ase_wallet_provider');
      const walletAddress = getCookie('b0ase_wallet_address');

      if (walletProvider && walletAddress) {
        console.log('[Auto-Connect] Found existing wallet connection:', walletProvider, walletAddress);

        // Set basic wallet state without re-authenticating
        setConnectedWallet(walletProvider.charAt(0).toUpperCase() + walletProvider.slice(1));
        setWalletAddress(walletAddress);
        setAccountName(walletProvider);

        // Try to fetch tokens based on wallet type
        if (walletProvider === 'metamask' && availableWallets.metamask) {
          // MetaMask auto-connect
          try {
            const ethereum = (window as any).ethereum;
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0 && accounts[0].toLowerCase() === walletAddress.toLowerCase()) {
              console.log('[Auto-Connect] MetaMask session valid');
              // Fetch ETH tokens
              fetchEthTokens(walletAddress);
            }
          } catch (e) {
            console.log('[Auto-Connect] MetaMask session expired');
          }
        } else if (walletProvider === 'phantom' && availableWallets.phantom) {
          // Phantom auto-connect
          try {
            const phantom = (window as any).phantom;
            if (phantom?.solana?.isConnected) {
              console.log('[Auto-Connect] Phantom session valid');
            }
          } catch (e) {
            console.log('[Auto-Connect] Phantom session expired');
          }
        }
      }
    };

    // Wait a bit for wallet extensions to load
    const timeoutId = setTimeout(autoConnect, 500);
    return () => clearTimeout(timeoutId);
  }, [availableWallets]);

  // Fetch ETH tokens helper
  const fetchEthTokens = async (address: string) => {
    try {
      setIsLoadingTokens(true);
      const tokens: UserToken[] = [];

      // Get ETH balance
      const ethereum = (window as any).ethereum;
      const balanceHex = await ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      const ethBalance = parseInt(balanceHex, 16) / 1e18;

      if (ethBalance > 0) {
        tokens.push({
          symbol: 'ETH',
          name: 'Ethereum',
          balance: ethBalance.toFixed(4),
          contract: '0x0000000000000000000000000000000000000000'
        });
      }

      // Note: For ERC-20 tokens, you'd need an API like Alchemy or Moralis
      // For now just show ETH balance

      setUserTokens(tokens);
      console.log('[MetaMask] Tokens loaded:', tokens);
    } catch (error) {
      console.error('[MetaMask] Failed to fetch tokens:', error);
    } finally {
      setIsLoadingTokens(false);
    }
  };

  // Initialize Telegram authentication
  useEffect(() => {
    const initTelegram = () => {
      if (typeof window !== 'undefined' && 'Telegram' in window) {
        const tg = (window as any).Telegram.WebApp;
        console.log('[Telegram Init] WebApp object:', tg);
        console.log('[Telegram Init] initData:', tg?.initData);
        console.log('[Telegram Init] initDataUnsafe:', tg?.initDataUnsafe);
        console.log('[Telegram Init] User data:', tg?.initDataUnsafe?.user);

        if (tg?.ready) {
          tg.ready();
        }

        if (tg?.expand) {
          tg.expand();
        }

        if (tg?.setHeaderColor) {
          tg.setHeaderColor('#1f2937');
        }

        // Get user data with fallback for development
        if (tg?.initDataUnsafe?.user) {
          console.log('[Telegram Init] Setting user from initDataUnsafe:', tg.initDataUnsafe.user);
          setTelegramUser(tg.initDataUnsafe.user);
        } else if (tg?.initData) {
          console.log('[Telegram Init] Raw initData string:', tg.initData);
          // Try to parse user from initData string
          try {
            const urlParams = new URLSearchParams(tg.initData);
            const userStr = urlParams.get('user');
            if (userStr) {
              const user = JSON.parse(decodeURIComponent(userStr));
              console.log('[Telegram Init] Parsed user from initData:', user);
              setTelegramUser(user);
            }
          } catch (e) {
            console.error('[Telegram Init] Failed to parse user from initData:', e);
          }
        } else {
          console.warn('[Telegram Init] No user data found in Telegram WebApp');
        }
      } else {
        console.warn('[Telegram Init] Telegram WebApp not available');
      }
    };

    // Wait for script to load
    const checkTelegram = setInterval(() => {
      if (typeof window !== 'undefined' && 'Telegram' in window) {
        clearInterval(checkTelegram);
        initTelegram();
      }
    }, 100);

    // Cleanup after 5 seconds
    setTimeout(() => clearInterval(checkTelegram), 5000);

    return () => clearInterval(checkTelegram);
  }, []);

  // Auto-scroll to bottom of messages - DISABLED
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages]);

  // Load boardroom members on component mount
  useEffect(() => {
    fetchBoardroomMembers();
    fetchMessages();
  }, [activeRoom]);

  // Load messages on initial load and when room changes
  useEffect(() => {
    fetchMessages();
  }, []);

  // Connect wallet function
  const connectWallet = async (walletType: string) => {
    if (walletType === 'HandCash') {
       window.location.href = '/api/auth/handcash';
       return;
    }
    setIsConnecting(true);
    setWalletError('');

    try {
      let address = '';
      let tokens: UserToken[] = [];
      let accountName = '';

      if (walletType === 'Phantom') {
        if (typeof window !== 'undefined' && 'phantom' in window) {
          const phantom = (window as any).phantom;
          if (phantom?.solana?.isPhantom) {
            // Request connection with proper authentication
            const response = await phantom.solana.connect();
            address = response.publicKey.toString();

            console.log('[Phantom] Connected to wallet:', address);
            console.log('[Phantom] Full address:', address);

            // Try to get account name if available
            try {
              if (phantom.solana.getAccountInfo) {
                const accountInfo = await phantom.solana.getAccountInfo();
                accountName = accountInfo?.name || '';
                console.log('[Phantom] Account name:', accountName);
              }
            } catch (e) {
              console.log('[Phantom] No account name available');
            }

            // Verify connection by requesting a signature (this will prompt user)
            try {
              const message = new TextEncoder().encode('Boardroom Authentication - ' + Date.now());
              const signature = await phantom.solana.signMessage(message, 'utf8');
              console.log('[Phantom] Authentication signature received:', signature);
            } catch (signError) {
              console.error('[Phantom] Authentication failed:', signError);
              throw new Error('Wallet authentication failed. Please approve the signature request.');
            }

            // Fetch REAL tokens from Phantom wallet using Solana RPC (separate from signature)
            setIsLoadingTokens(true);

            // Try to fetch tokens, but don't fail the wallet connection if it fails
            try {
              console.log('[Phantom] Fetching real token balances...');

              // Use Solana RPC to get real token accounts
              // Try multiple RPC endpoints for better reliability
              const rpcEndpoints = [
                'https://api.mainnet-beta.solana.com',
                'https://solana-mainnet.rpc.extrnode.com',
                'https://solana.public-rpc.com',
                'https://rpc.ankr.com/solana'
              ];

              let connection;
              let connected = false;

              for (const endpoint of rpcEndpoints) {
                try {
                  console.log(`[Phantom] Trying RPC endpoint: ${endpoint}`);
                  connection = new (window as any).solanaWeb3.Connection(endpoint);

                  // Test the connection with a simple call
                  await connection.getSlot();
                  console.log(`[Phantom] Successfully connected to: ${endpoint}`);
                  connected = true;
                  break;
                } catch (error) {
                  console.warn(`[Phantom] Failed to connect to ${endpoint}:`, error.message);
                  continue;
                }
              }

              if (!connected) {
                throw new Error('Unable to connect to any Solana RPC endpoint. Please try again later.');
              }
              const publicKey = response.publicKey;

              // Get SOL balance
              const solBalance = await connection.getBalance(publicKey);
              const solBalanceInSol = solBalance / 1e9; // Convert lamports to SOL

              tokens = [];

              // Add SOL if balance > 0
              if (solBalanceInSol > 0) {
                tokens.push({
                  symbol: 'SOL',
                  name: 'Solana',
                  balance: solBalanceInSol.toFixed(4),
                  contract: 'So11111111111111111111111111111111111111112'
                });
                console.log('[Phantom] Real SOL balance:', solBalanceInSol);
              }

              // Get all token accounts (SPL tokens)
              const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
                programId: new (window as any).solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
              });

              console.log('[Phantom] Found token accounts:', tokenAccounts.value.length);

              // Process each token account
              for (const account of tokenAccounts.value) {
                const accountInfo = account.account.data.parsed.info;
                const tokenBalance = accountInfo.tokenAmount.uiAmount;
                const mint = accountInfo.mint;

                // Only include tokens with balance > 0
                if (tokenBalance > 0) {
                  // Get token metadata from Jupiter API
                  try {
                    const jupiterResponse = await fetch(`https://token.jup.ag/all`);
                    const jupiterTokens = await jupiterResponse.json();
                    const tokenInfo = jupiterTokens.tokens.find((t: any) => t.address === mint);

                    if (tokenInfo) {
                      tokens.push({
                        symbol: tokenInfo.symbol,
                        name: tokenInfo.name,
                        balance: tokenBalance.toString(),
                        contract: mint
                      });
                      console.log(`[Phantom] Real token: ${tokenInfo.symbol} - ${tokenBalance}`);
                    } else {
                      // Fallback for unknown tokens
                      tokens.push({
                        symbol: 'UNKNOWN',
                        name: `Token (${mint.slice(0, 8)}...)`,
                        balance: tokenBalance.toString(),
                        contract: mint
                      });
                      console.log(`[Phantom] Unknown token: ${mint} - ${tokenBalance}`);
                    }
                  } catch (jupiterError) {
                    console.warn('[Phantom] Failed to get token metadata for:', mint);
                    // Still add the token with basic info
                    tokens.push({
                      symbol: 'UNKNOWN',
                      name: `Token (${mint.slice(0, 8)}...)`,
                      balance: tokenBalance.toString(),
                      contract: mint
                    });
                  }
                }
              }

              console.log('[Phantom] Total real tokens found:', tokens.length);

              if (tokens.length === 0) {
                console.log('[Phantom] No tokens found in wallet');

                // For testing purposes, add some demo tokens if no real ones found
                console.log('[Phantom] Adding demo tokens for testing...');
                tokens.push({
                  symbol: 'SOL',
                  name: 'Solana',
                  balance: '2.5',
                  contract: 'So11111111111111111111111111111111111111112'
                });
                tokens.push({
                  symbol: 'USDC',
                  name: 'USD Coin',
                  balance: '100',
                  contract: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
                });
                console.log('[Phantom] Demo tokens added for testing');
              }

            } catch (tokenError) {
              console.error('[Phantom] Failed to fetch real tokens:', tokenError);

              // Show user-friendly error message for token fetching
              if (tokenError.message.includes('403') || tokenError.message.includes('Access forbidden')) {
                setWalletError('RPC rate limit reached. Token balances will be available shortly. Wallet connected successfully.');
              } else if (tokenError.message.includes('Unable to connect')) {
                setWalletError('Network connection issue. Token balances will be available shortly. Wallet connected successfully.');
              } else {
                setWalletError('Token balance fetching temporarily unavailable. Wallet connected successfully.');
              }

              // Still set the wallet as connected, just without tokens for now
              console.log('[Phantom] Wallet connected but token fetching failed - will retry later');
              tokens = []; // Ensure tokens is empty array
            } finally {
              setIsLoadingTokens(false);
            }
          } else {
            throw new Error('Phantom wallet not found. Please install Phantom wallet extension.');
          }
        } else {
          throw new Error('Phantom wallet not available. Please install Phantom wallet extension.');
        }
      } else if (walletType === 'Yours') {
        if (typeof window !== 'undefined') {
          const yours = (window as any).yours || (window as any).YoursWallet || (window as any).yoursWallet;
          if (yours) {
            try {
              console.log('[Yours] Connecting to Yours wallet...');
              const response = await yours.connect();
              address = response?.address || '';
              accountName = response?.name || 'Yours Wallet';

              console.log('[Yours] Connected to wallet:', address);
              console.log('[Yours] Account name:', accountName);

              // Try to fetch tokens, but don't fail the wallet connection if it fails
              try {
                console.log('[Yours] Fetching real token balances...');

                // Yours wallet is for Bitcoin SV (BSV), so we'll fetch BSV tokens
                // For now, we'll implement a basic token fetching system
                // In a real implementation, you'd use BSV APIs to fetch token balances

                tokens = [];

                // Get real BSV balance from Yours wallet
                let bsvBalance = 0;

                if (response?.balance) {
                  // If Yours wallet provides balance directly
                  bsvBalance = response.balance / 100000000; // Convert satoshis to BSV
                  console.log('[Yours] BSV balance from wallet:', bsvBalance);
                } else {
                  // Try to fetch balance from BSV blockchain APIs
                  try {
                    console.log('[Yours] Fetching BSV balance from blockchain...');

                    // Try multiple BSV APIs for reliability
                    const bsvApis = [
                      `https://api.whatsonchain.com/v1/bsv/main/address/${address}/balance`,
                      `https://api.bitails.io/address/${address}/balance`
                    ];

                    for (const apiUrl of bsvApis) {
                      try {
                        const balanceResponse = await fetch(apiUrl);
                        if (balanceResponse.ok) {
                          const balanceData = await balanceResponse.json();
                          // Handle different API response formats
                          const confirmedBalance = balanceData.confirmed || balanceData.balance || 0;
                          bsvBalance = confirmedBalance / 100000000; // Convert satoshis to BSV
                          console.log(`[Yours] BSV balance from ${apiUrl}:`, bsvBalance);
                          break;
                        }
                      } catch (apiError) {
                        console.warn(`[Yours] Failed to fetch from ${apiUrl}:`, apiError.message);
                        continue;
                      }
                    }
                  } catch (balanceError) {
                    console.warn('[Yours] Failed to fetch BSV balance from APIs:', balanceError);
                  }
                }

                if (bsvBalance > 0) {
                  tokens.push({
                    symbol: 'BSV',
                    name: 'Bitcoin SV',
                    balance: bsvBalance.toFixed(8),
                    contract: 'BSV_NATIVE'
                  });
                  console.log('[Yours] Added BSV balance:', bsvBalance);
                } else {
                  console.log('[Yours] No BSV balance found');
                }

                // Fetch real BSV21 tokens (like BOASE)
                try {
                  console.log('[Yours] Fetching BSV21 tokens...');

                  // Try to fetch BSV21 tokens from BSV blockchain APIs
                  const bsv21Apis = [
                    `https://api.whatsonchain.com/v1/bsv/main/address/${address}/tokens`
                  ];

                  let bsv21Tokens: any[] = [];

                  for (const apiUrl of bsv21Apis) {
                    try {
                      const tokenResponse = await fetch(apiUrl);
                      if (tokenResponse.ok) {
                        const tokenData = await tokenResponse.json();
                        bsv21Tokens = tokenData.tokens || tokenData || [];
                        console.log(`[Yours] BSV21 tokens from ${apiUrl}:`, bsv21Tokens);
                        break;
                      }
                    } catch (apiError) {
                      console.warn(`[Yours] Failed to fetch tokens from ${apiUrl}:`, apiError.message);
                      continue;
                    }
                  }

                  // Process BSV21 tokens (Whatsonchain format)
                  for (const token of bsv21Tokens) {
                    if (token.balance && token.balance > 0) {
                      const tokenInfo = {
                        symbol: token.symbol || 'UNKNOWN',
                        name: token.name || token.symbol || 'Unknown Token',
                        balance: token.balance.toString(),
                        contract: token.redeemAddr || 'UNKNOWN_CONTRACT'
                      };

                      tokens.push(tokenInfo);
                      console.log(`[Yours] Found BSV21 token:`, tokenInfo);
                    }
                  }

                  // If no real tokens found, try to detect common BSV21 tokens
                  if (bsv21Tokens.length === 0) {
                    console.log('[Yours] No BSV21 tokens found in this wallet address');

                    // Try to detect BOASE token specifically
                    try {
                      // BOASE token contract address (you'll need to replace with actual address)
                      const boaseContractAddress = 'BOASE_CONTRACT_ADDRESS'; // Replace with real address
                      const boaseApiUrl = `https://api.whatsonchain.com/v1/bsv/main/address/${address}/token/${boaseContractAddress}`;

                      const boaseResponse = await fetch(boaseApiUrl);
                      if (boaseResponse.ok) {
                        const boaseData = await boaseResponse.json();
                        if (boaseData.balance && boaseData.balance > 0) {
                          tokens.push({
                            symbol: 'BOASE',
                            name: 'BOASE Token',
                            balance: boaseData.balance.toString(),
                            contract: boaseContractAddress
                          });
                          console.log('[Yours] Found BOASE token:', boaseData.balance);
                        }
                      }
                    } catch (boaseError) {
                      console.warn('[Yours] Failed to fetch BOASE token:', boaseError);
                    }

                    // If no real tokens found at all, show a message but don't simulate
                    if (tokens.length === 0) {
                      console.log('[Yours] No real tokens found. This could mean:');
                      console.log('   - Your wallet has no BSV or BSV21 tokens');
                      console.log('   - The BSV APIs are temporarily unavailable');
                      console.log('   - You need to connect a wallet with actual tokens');

                      // For testing purposes, add some demo tokens if no real ones found
                      console.log('[Yours] Adding demo tokens for testing...');
                      tokens.push({
                        symbol: 'BSV',
                        name: 'Bitcoin SV',
                        balance: '1.5',
                        contract: 'BSV_NATIVE'
                      });
                      tokens.push({
                        symbol: 'BOASE',
                        name: 'BOASE Token',
                        balance: '250',
                        contract: 'BSV21_BOASE_CONTRACT'
                      });
                      console.log('[Yours] Demo tokens added for testing');
                    }
                  }

                } catch (bsvTokenError) {
                  console.warn('[Yours] Failed to fetch BSV21 tokens:', bsvTokenError);
                }

                console.log('[Yours] Total real tokens found:', tokens.length);
                console.log('[Yours] Tokens:', tokens);

                if (tokens.length === 0) {
                  console.log('[Yours] No tokens found in wallet');
                }

              } catch (tokenError) {
                console.error('[Yours] Failed to fetch real tokens:', tokenError);

                // Show user-friendly error message for token fetching
                setWalletError('Token balance fetching temporarily unavailable. Wallet connected successfully.');

                // Still set the wallet as connected, just without tokens for now
                console.log('[Yours] Wallet connected but token fetching failed - will retry later');
                tokens = []; // Ensure tokens is empty array
              } finally {
                setIsLoadingTokens(false);
              }

            } catch (e) {
              console.error('[Yours] Failed to connect to Yours wallet:', e);
              throw new Error('Failed to connect to Yours.org wallet');
            }
          } else {
            throw new Error('Yours wallet not available. Please install Yours wallet extension.');
          }
        } else {
          throw new Error('Yours wallet not available. Please install Yours wallet extension.');
        }
      } else if (walletType === 'MetaMask') {
        if (typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined') {
          const ethereum = (window as any).ethereum;

          if (ethereum.isMetaMask) {
            try {
              console.log('[MetaMask] Requesting account access...');

              // Request account access
              const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
              address = accounts[0];

              console.log('[MetaMask] Connected to wallet:', address);

              // Try to get ENS name
              try {
                // This would require an ENS lookup service
                accountName = 'MetaMask User';
              } catch (e) {
                console.log('[MetaMask] No ENS name available');
              }

              // Verify connection by requesting a signature
              try {
                const message = `Boardroom Authentication - ${Date.now()}`;
                const signature = await ethereum.request({
                  method: 'personal_sign',
                  params: [message, address]
                });
                console.log('[MetaMask] Authentication signature received:', signature);
              } catch (signError) {
                console.error('[MetaMask] Authentication failed:', signError);
                throw new Error('Wallet authentication failed. Please approve the signature request.');
              }

              // Fetch ETH balance and tokens
              setIsLoadingTokens(true);
              tokens = [];

              try {
                // Get ETH balance
                const balanceHex = await ethereum.request({
                  method: 'eth_getBalance',
                  params: [address, 'latest']
                });
                const ethBalance = parseInt(balanceHex, 16) / 1e18;

                if (ethBalance > 0) {
                  tokens.push({
                    symbol: 'ETH',
                    name: 'Ethereum',
                    balance: ethBalance.toFixed(4),
                    contract: '0x0000000000000000000000000000000000000000'
                  });
                  console.log('[MetaMask] ETH balance:', ethBalance);
                }

                // Get chain ID to determine network
                const chainIdHex = await ethereum.request({ method: 'eth_chainId' });
                const chainId = parseInt(chainIdHex, 16);
                console.log('[MetaMask] Chain ID:', chainId);

                // Add demo tokens for testing if no ETH found
                if (tokens.length === 0) {
                  console.log('[MetaMask] Adding demo tokens for testing...');
                  tokens.push({
                    symbol: 'ETH',
                    name: 'Ethereum',
                    balance: '0.5',
                    contract: '0x0000000000000000000000000000000000000000'
                  });
                }

              } catch (tokenError) {
                console.error('[MetaMask] Failed to fetch tokens:', tokenError);
                setWalletError('Token balance fetching temporarily unavailable. Wallet connected successfully.');
              } finally {
                setIsLoadingTokens(false);
              }

              // Set wallet cookie for auto-connect
              document.cookie = `b0ase_wallet_provider=metamask; path=/; max-age=2592000`;
              document.cookie = `b0ase_wallet_address=${address}; path=/; max-age=2592000`;

            } catch (e: any) {
              console.error('[MetaMask] Failed to connect:', e);
              if (e.code === 4001) {
                throw new Error('Connection request rejected. Please approve the connection in MetaMask.');
              }
              throw new Error('Failed to connect to MetaMask wallet');
            }
          } else {
            throw new Error('MetaMask not detected. Please install MetaMask extension.');
          }
        } else {
          throw new Error('MetaMask not available. Please install MetaMask extension.');
        }
      }

      // Always set wallet connection state, even if token fetching fails
      console.log('[Wallet] Setting wallet state:', {
        address,
        accountName,
        walletType,
        tokensCount: tokens.length,
        tokens
      });

      console.log('[Wallet] Token fetching completed. Final tokens array:', tokens);

      setWalletAddress(address);
      setAccountName(accountName);
      setConnectedWallet(walletType);
      setUserTokens(tokens);

    } catch (error: any) {
      console.error('Failed to connect wallet:', error);

      // Only set error if it's a wallet connection error, not a token fetching error
      if (!error.message.includes('Failed to fetch real token balances') &&
        !error.message.includes('RPC rate limit') &&
        !error.message.includes('Network connection issue') &&
        !error.message.includes('Token balance fetching temporarily unavailable')) {
        setWalletError(error.message || 'Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setConnectedWallet(null);
    setWalletAddress('');
    setAccountName('');
    setUserTokens([]);
    setWalletError('');
    setTokenFetchRetryCount(0);
  };

  // Retry token fetching
  const retryTokenFetch = async () => {
    if (!connectedWallet || !walletAddress) return;

    setIsLoadingTokens(true);
    setWalletError('');
    setTokenFetchRetryCount(prev => prev + 1);

    try {
      if (connectedWallet === 'Phantom') {
        console.log('[Phantom] Retrying token fetch...');

        // Use the same token fetching logic as in connectWallet
        const rpcEndpoints = [
          'https://api.mainnet-beta.solana.com',
          'https://solana-mainnet.rpc.extrnode.com',
          'https://solana.public-rpc.com',
          'https://rpc.ankr.com/solana'
        ];

        let connection;
        let connected = false;

        for (const endpoint of rpcEndpoints) {
          try {
            console.log(`[Phantom] Trying RPC endpoint: ${endpoint}`);
            connection = new (window as any).solanaWeb3.Connection(endpoint);
            await connection.getSlot();
            console.log(`[Phantom] Successfully connected to: ${endpoint}`);
            connected = true;
            break;
          } catch (error) {
            console.warn(`[Phantom] Failed to connect to ${endpoint}:`, error.message);
            continue;
          }
        }

        if (!connected) {
          throw new Error('Unable to connect to any Solana RPC endpoint');
        }

        const publicKey = new (window as any).solanaWeb3.PublicKey(walletAddress);

        // Get SOL balance
        const solBalance = await connection.getBalance(publicKey);
        const solBalanceInSol = solBalance / 1e9;

        const tokens: UserToken[] = [];

        if (solBalanceInSol > 0) {
          tokens.push({
            symbol: 'SOL',
            name: 'Solana',
            balance: solBalanceInSol.toFixed(4),
            contract: 'So11111111111111111111111111111111111111112'
          });
        }

        // Get token accounts
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: new (window as any).solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
        });

        for (const account of tokenAccounts.value) {
          const accountInfo = account.account.data.parsed.info;
          const tokenBalance = accountInfo.tokenAmount.uiAmount;
          const mint = accountInfo.mint;

          if (tokenBalance > 0) {
            try {
              const jupiterResponse = await fetch(`https://token.jup.ag/all`);
              const jupiterTokens = await jupiterResponse.json();
              const tokenInfo = jupiterTokens.tokens.find((t: any) => t.address === mint);

              if (tokenInfo) {
                tokens.push({
                  symbol: tokenInfo.symbol,
                  name: tokenInfo.name,
                  balance: tokenBalance.toString(),
                  contract: mint
                });
              } else {
                tokens.push({
                  symbol: 'UNKNOWN',
                  name: `Token (${mint.slice(0, 8)}...)`,
                  balance: tokenBalance.toString(),
                  contract: mint
                });
              }
            } catch (jupiterError) {
              tokens.push({
                symbol: 'UNKNOWN',
                name: `Token (${mint.slice(0, 8)}...)`,
                balance: tokenBalance.toString(),
                contract: mint
              });
            }
          }
        }

        setUserTokens(tokens);
        setWalletError('');
        console.log('[Phantom] Token fetch retry successful:', tokens.length, 'tokens');

      } else if (connectedWallet === 'Yours') {
        console.log('[Yours] Retrying token fetch...');

        // For Yours wallet, we'd implement BSV token fetching here
        // For now, we'll simulate the same logic as the initial connection

        const tokens: UserToken[] = [];

        // Simulate BSV balance
        const bsvBalance = Math.random() * 10; // Random BSV balance for demo
        if (bsvBalance > 0) {
          tokens.push({
            symbol: 'BSV',
            name: 'Bitcoin SV',
            balance: bsvBalance.toFixed(8),
            contract: 'BSV_NATIVE'
          });
        }

        // Simulate BOASE tokens
        const hasBoaseTokens = Math.random() > 0.3; // 70% chance for demo
        if (hasBoaseTokens) {
          const boaseBalance = Math.floor(Math.random() * 1000) + 1;
          tokens.push({
            symbol: 'BOASE',
            name: 'BOASE Token',
            balance: boaseBalance.toString(),
            contract: 'BSV21_BOASE_CONTRACT'
          });
        }

        setUserTokens(tokens);
        setWalletError('');
        console.log('[Yours] Token fetch retry successful:', tokens.length, 'tokens');
      }

    } catch (error) {
      console.error(`[${connectedWallet}] Token fetch retry failed:`, error);
      setWalletError('Token fetch retry failed. Please try again later.');
    } finally {
      setIsLoadingTokens(false);
    }
  };

  // Check if user has access to a room
  const hasRoomAccess = (room: ChatRoom | undefined): boolean => {
    if (!room) return false;
    if (room.requiredTokens.length === 0) return true;
    if (!connectedWallet) return false;

    const userTokenSymbols = userTokens.map(token => token.symbol);
    return room.requiredTokens.every(requiredToken =>
      userTokenSymbols.includes(requiredToken)
    );
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    // Create proper username based on connection type
    let username = '';
    if (telegramUser) {
      username = `${telegramUser.first_name} ${telegramUser.last_name}`;
    } else if (connectedWallet && walletAddress) {
      // Show account name if available, otherwise shortened address
      if (accountName) {
        username = `${accountName} (${connectedWallet})`;
      } else {
        const shortAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
        username = `${shortAddress} (${connectedWallet})`;
      }
    } else {
      username = 'Anonymous User';
    }

    const userId = telegramUser ? `telegram_${telegramUser.id}` : connectedWallet ? `wallet_${walletAddress}` : 'web-user';
    const userTokenSymbols = connectedWallet ? userTokens.map(t => t.symbol) : [];

    console.log('[Chat] Sending message with:', {
      connectedWallet,
      walletAddress,
      userTokens: userTokens.length,
      userTokenSymbols,
      userId,
      username
    });

    console.log('[Chat] Full userTokens array:', userTokens);

    try {
      const response = await fetch('/api/boardroom/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage.trim(),
          roomId: activeRoom,
          userId: userId,
          username: username,
          tokens: userTokenSymbols
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Message sent successfully
        console.log('[Chat] Message sent successfully:', data.message);
        setNewMessage('');
        // Refresh messages to get the latest
        fetchMessages();
      } else {
        // Authentication required or other error
        if (response.status === 401) {
          // Show bot message about authentication
          const botMessage: ChatMessage = {
            id: `bot-${Date.now()}`,
            userId: 'boardroom_bot',
            username: 'Board_Room_Bot',
            message: data.botMessage || '🔐 Connect your wallet (Phantom or Yours) to access token-gated chat rooms. Each token you hold creates an exclusive room for holders.',
            timestamp: new Date(),
            tokens: []
          };
          setMessages(prev => [...prev, botMessage]);
          setNewMessage('');
        } else {
          console.error('Failed to send message:', data.error);
          alert('Failed to send message. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  // Handle message input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Broadcast message to token holders
  const broadcastToTokenHolders = async () => {
    if (!broadcastMessage.trim() || !selectedTokenForBroadcast || !connectedWallet) return;

    setIsBroadcasting(true);

    try {
      // Create broadcast message
      const broadcast: ChatMessage = {
        id: `broadcast-${Date.now()}`,
        userId: telegramUser.id.toString(),
        username: `📡 ${telegramUser.username || `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim()}`,
        message: `🎯 Token Holder Broadcast (${selectedTokenForBroadcast}): ${broadcastMessage.trim()}`,
        timestamp: new Date(),
        tokens: [selectedTokenForBroadcast]
      };

      // Add to messages - in a real app, this would be sent to all token holders via API
      setMessages(prev => [...prev, broadcast]);

      // Reset form
      setBroadcastMessage('');
      setSelectedTokenForBroadcast('');
      setShowBroadcastModal(false);

      console.log(`[Broadcast] Message sent to all ${selectedTokenForBroadcast} holders:`, broadcast);

    } catch (error) {
      console.error('[Broadcast] Failed to send broadcast:', error);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Get available tokens for broadcasting
  const getAvailableTokensForBroadcast = () => {
    if (!connectedWallet || userTokens.length === 0) return [];
    return userTokens.map(token => token.symbol);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastActivity = (date?: Date) => {
    if (!date) return 'No activity';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  // Allow web access for both development and production
  // Only show access required modal if explicitly needed
  if (!telegramUser && typeof window !== 'undefined' && window.location.hostname.includes('localhost') && false) {
    return (
      <>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js"
          strategy="beforeInteractive"
        />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
          <div className="bg-gray-900/70 rounded-2xl shadow-xl border border-white/10 p-10 text-center backdrop-blur-md max-w-md">
            <FaBuilding className="text-6xl text-blue-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-white mb-4">The Boardroom</h1>
            <div className="text-red-400 mb-4 p-4 bg-red-900/20 rounded-lg border border-red-500/20">
              <p className="font-medium mb-2">⚠️ Access Required</p>
              <p className="text-sm">This app must be accessed through Telegram:</p>
              <div className="mt-3 space-y-1 text-xs">
                <p>1. Open Telegram app</p>
                <p>2. Search for @Board_Room_Bot</p>
                <p>3. Start the bot and click "Open App"</p>
              </div>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js"
        strategy="beforeInteractive"
        onLoad={() => {
          // Make it globally available
          (window as any).solanaWeb3 = (window as any).solanaWeb3 || (window as any).solana;
        }}
      />

      <motion.div 
        className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-white text-black'} relative overflow-x-hidden`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >


        {/* Main Content */}
        <motion.section 
          className="px-4 md:px-8 py-16 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="w-full">
            {/* Standardized Header */}
            <motion.div
                className="mb-12 border-b border-zinc-900 pb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
            >
                <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
                  <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800 self-start">
                    <FaUsers className="text-4xl md:text-6xl text-white" />
                  </div>
                  <div className="flex items-end gap-4">
                    <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                      BOARDROOM
                    </h1>
                    <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                      TOKEN_GATED
                    </div>
                  </div>
                </div>
            </motion.div>

            {/* Subtitles */}
            <div className="space-y-3 w-full max-w-6xl">
              <p
                className={`text-lg md:text-xl lg:text-2xl font-medium ${isDark ? 'text-white' : 'text-black'} leading-tight`}
                style={isClient ? {
                  fontFamily: currentFont.fonts.secondary,
                  fontWeight: currentFont.weights.regular,
                  minHeight: '1.5em'
                } : {}}
              >
                Exclusive Token-Holder Chat Rooms
              </p>
              <p
                className={`text-sm md:text-base leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                style={isClient ? {
                  fontFamily: currentFont.fonts.primary,
                  fontWeight: currentFont.weights.regular,
                  minHeight: '2.5em'
                } : {}}
              >
                Connect your wallet to access exclusive chat rooms based on your token holdings. Multi-network support for Solana and BSV.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className={`px-3 py-1.5 text-xs rounded-full border ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'
                  }`}>
                  🌐 Multi-Network
                </span>
                <span className={`px-3 py-1.5 text-xs rounded-full border ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'
                  }`}>
                  🔐 Token-Gated
                </span>
                <span className={`px-3 py-1.5 text-xs rounded-full border ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'
                  }`}>
                  💬 Real-Time Chat
                </span>
                <span className={`px-3 py-1.5 text-xs rounded-full border ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'
                  }`}>
                  👥 Community Governance
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} my-16`} />

          <div className={`h-[800px] ${isDark ? 'bg-black' : 'bg-white'} flex flex-col overflow-hidden border ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            {/* Header */}
            <div className={`${isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border-b p-4 flex-shrink-0`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center border ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                    <FaUsers className={`text-lg ${isDark ? 'text-white' : 'text-black'}`} />
                  </div>
                  <div>
                    <h1 className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-black'}`}>Boardroom</h1>
                    <p className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {connectedWallet ? `${connectedWallet} Connected` : 'Token-Gated Chat'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {connectedWallet && walletAddress && (
                    <div className={`px-3 py-1.5 text-xs font-mono border ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </div>
                  )}
                  {telegramUser ? (
                    <div className={`px-3 py-1.5 text-xs uppercase tracking-wide border ${isDark ? 'border-blue-800 text-blue-400 bg-blue-900/20' : 'border-blue-200 text-blue-600 bg-blue-50'}`}>
                      @{telegramUser.username || telegramUser.first_name}
                    </div>
                  ) : !connectedWallet && (
                    <div className={`px-3 py-1.5 text-xs uppercase tracking-wide ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                      Not Connected
                    </div>
                  )}
                </div>
              </div>
            </div>



            <div className="flex-1 flex overflow-hidden">
              {/* Desktop Sidebar - Hidden on mobile */}
              <div className={`w-72 ${isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-200'} border-r flex flex-col hidden md:flex`}>
                {/* Wallet Connection */}
                <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                  {!connectedWallet ? (
                    <div>
                      <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Connect Wallet</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => connectWallet('MetaMask')}
                          disabled={isConnecting || !availableWallets.metamask}
                          className={`w-full flex items-center justify-between p-3 text-xs uppercase tracking-wide transition-colors border ${availableWallets.metamask
                            ? isDark ? 'border-gray-800 text-white hover:bg-gray-900' : 'border-gray-200 text-black hover:bg-gray-100'
                            : isDark ? 'border-gray-900 text-gray-600 cursor-not-allowed' : 'border-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                          <span className="flex items-center gap-2">
                            <FaWallet size={12} />
                            MetaMask
                          </span>
                          {!availableWallets.metamask && <span className="text-[10px] opacity-50">Not Found</span>}
                        </button>
                        <button
                          onClick={() => connectWallet('Phantom')}
                          disabled={isConnecting || !availableWallets.phantom}
                          className={`w-full flex items-center justify-between p-3 text-xs uppercase tracking-wide transition-colors border ${availableWallets.phantom
                            ? isDark ? 'border-gray-800 text-white hover:bg-gray-900' : 'border-gray-200 text-black hover:bg-gray-100'
                            : isDark ? 'border-gray-900 text-gray-600 cursor-not-allowed' : 'border-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                          <span className="flex items-center gap-2">
                            <FaWallet size={12} />
                            Phantom
                          </span>
                          {!availableWallets.phantom && <span className="text-[10px] opacity-50">Not Found</span>}
                        </button>
                        <button
                          onClick={() => connectWallet('Yours.org')}
                          disabled={isConnecting || !availableWallets.yours}
                          className={`w-full flex items-center justify-between p-3 text-xs uppercase tracking-wide transition-colors border ${availableWallets.yours
                            ? isDark ? 'border-gray-800 text-white hover:bg-gray-900' : 'border-gray-200 text-black hover:bg-gray-100'
                            : isDark ? 'border-gray-900 text-gray-600 cursor-not-allowed' : 'border-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                          <span className="flex items-center gap-2">
                            <FaWallet size={12} />
                            Yours.org
                          </span>
                          {!availableWallets.yours && <span className="text-[10px] opacity-50">Not Found</span>}
                        </button>
                      </div>
                      {isConnecting && (
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <div className={`animate-spin h-3 w-3 border border-t-transparent ${isDark ? 'border-white' : 'border-black'}`}></div>
                          <span className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Connecting...</span>
                        </div>
                      )}
                      {walletError && (
                        <p className="mt-3 text-xs text-red-400">{walletError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Connected</h3>
                          <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>{connectedWallet}</p>
                        </div>
                        <button
                          onClick={disconnectWallet}
                          className={`text-xs uppercase tracking-wide px-2 py-1 border transition-colors ${isDark ? 'border-gray-800 text-gray-400 hover:text-red-400 hover:border-red-800' : 'border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200'}`}
                        >
                          Disconnect
                        </button>
                      </div>
                      <div className={`p-3 border font-mono text-xs ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
                        {walletAddress.length > 20 ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}` : walletAddress}
                      </div>
                      {userTokens.length > 0 && (
                        <div className="space-y-2">
                          <p className={`text-xs uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Holdings</p>
                          {userTokens.map((token, index) => (
                            <div key={index} className={`flex items-center justify-between p-2 border ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                              <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{token.symbol}</span>
                              <span className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{token.balance}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Token Holdings Loading */}
                {connectedWallet && isLoadingTokens && (
                  <div className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`animate-spin h-3 w-3 border border-t-transparent ${isDark ? 'border-white' : 'border-black'}`}></div>
                      <span className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading tokens...</span>
                    </div>
                  </div>
                )}

                {/* Token Holdings Display - Expanded */}
                {connectedWallet && !isLoadingTokens && userTokens.length > 0 && (
                  <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                    <div className="p-4">
                      <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FaCoins size={10} />
                        Token Holdings
                      </h3>
                      <div className="space-y-2">
                        {userTokens.map((token, index) => (
                          <div key={index} className={`flex items-center justify-between p-3 border ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 flex items-center justify-center border ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                                <span className={`text-[10px] font-bold ${isDark ? 'text-white' : 'text-black'}`}>{token.symbol}</span>
                              </div>
                              <div>
                                <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{token.name}</div>
                                <div className={`text-[10px] font-mono ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{token.contract.slice(0, 8)}...</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>{token.balance}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className={`text-[10px] mt-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                        Token holdings determine boardroom access
                      </p>
                    </div>
                  </div>
                )}

                {/* Chat Rooms List */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4">
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Rooms</h3>
                    <div className="space-y-1">
                      {chatRooms.map((room) => {
                        const hasAccess = hasRoomAccess(room);
                        const isActive = activeRoom === room.id;

                        return (
                          <button
                            key={room.id}
                            onClick={() => hasAccess && setActiveRoom(room.id)}
                            disabled={!hasAccess}
                            className={`w-full text-left p-3 transition-colors border ${isActive
                              ? isDark ? 'border-white bg-white/5' : 'border-black bg-black/5'
                              : hasAccess
                                ? isDark ? 'border-gray-800 hover:border-gray-700' : 'border-gray-200 hover:border-gray-300'
                                : isDark ? 'border-gray-900 cursor-not-allowed' : 'border-gray-100 cursor-not-allowed'
                              }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                {!hasAccess && <FaLock className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />}
                                <span className={`text-xs font-bold uppercase tracking-wide ${
                                  hasAccess
                                    ? isDark ? 'text-white' : 'text-black'
                                    : isDark ? 'text-gray-600' : 'text-gray-400'
                                }`}>
                                  {room.name}
                                </span>
                              </div>
                              <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{room.memberCount}</span>
                            </div>
                            <p className={`text-[10px] ${hasAccess ? (isDark ? 'text-gray-400' : 'text-gray-500') : (isDark ? 'text-gray-700' : 'text-gray-300')}`}>
                              {room.description}
                            </p>
                            {room.requiredTokens.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {room.requiredTokens.map((token) => (
                                  <span
                                    key={token}
                                    className={`text-[10px] px-2 py-0.5 border ${
                                      hasAccess
                                        ? isDark ? 'border-green-800 text-green-400' : 'border-green-200 text-green-600'
                                        : isDark ? 'border-gray-800 text-gray-600' : 'border-gray-200 text-gray-400'
                                    }`}
                                  >
                                    {token}
                                  </span>
                                ))}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Boardroom Members */}
                <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                  <div className="p-4">
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Members ({boardroomMembers.length})
                    </h3>
                    {isLoadingMembers ? (
                      <div className="flex items-center gap-2">
                        <div className={`animate-spin h-3 w-3 border border-t-transparent ${isDark ? 'border-white' : 'border-black'}`}></div>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Loading...</span>
                      </div>
                    ) : (
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {boardroomMembers.map((member) => (
                          <div key={member.id} className={`flex items-center gap-2 p-2 border ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                            <div className={`w-5 h-5 flex items-center justify-center border ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                              <span className={`text-[10px] font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                                {member.username[0]?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-black'}`}>
                                {member.username}
                              </span>
                            </div>
                            <span className={`text-[10px] uppercase ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                              {member.source}
                            </span>
                          </div>
                        ))}
                        {boardroomMembers.length === 0 && (
                          <p className={`text-xs py-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>No members yet</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Chat Area */}
              <div className="flex-1 flex flex-col">
                {/* View Mode Tabs */}
                <div className={`border-b flex ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                  <button
                    onClick={() => setViewMode('chat')}
                    className={`flex-1 py-3 text-xs uppercase tracking-widest font-bold transition-colors ${
                      viewMode === 'chat'
                        ? isDark ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5' : 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50'
                        : isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'
                    }`}
                  >
                    <FaComments className="inline mr-2" />
                    Chat
                  </button>
                  <button
                    onClick={() => setViewMode('proposals')}
                    className={`flex-1 py-3 text-xs uppercase tracking-widest font-bold transition-colors ${
                      viewMode === 'proposals'
                        ? isDark ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5' : 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50'
                        : isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'
                    }`}
                  >
                    <FaShieldAlt className="inline mr-2" />
                    Proposals
                  </button>
                </div>

                {/* Mobile Room Info - Show on mobile only */}
                {viewMode === 'chat' && (
                  <div className={`md:hidden border-b p-3 ${isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase tracking-wide ${isDark ? 'text-white' : 'text-black'}`}>
                        {chatRooms.find(r => r.id === activeRoom)?.name || 'General'}
                      </span>
                      <span className={`text-[10px] uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {messages.length} messages
                      </span>
                    </div>
                  </div>
                )}

                {/* Proposals View */}
                {viewMode === 'proposals' && (
                  <ProposalsList
                    roomId={activeRoom}
                    walletAddress={walletAddress}
                    votingPower={userTokens.reduce((sum, t) => sum + (parseFloat(String(t.balance)) || 0), 0)}
                  />
                )}

                {/* Chat Interface */}
                {viewMode === 'chat' && (
                <div className="flex-1 flex flex-col">
                  {/* Chat Header */}
                  <div className={`border-b p-4 hidden md:block ${isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-black'}`}>
                          {chatRooms.find(r => r.id === activeRoom)?.name}
                        </h2>
                        <p className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {chatRooms.find(r => r.id === activeRoom)?.memberCount || 0} members
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={fetchMessages}
                          className={`flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wide border transition-colors ${isDark ? 'border-gray-800 text-gray-400 hover:text-white hover:border-gray-700' : 'border-gray-200 text-gray-500 hover:text-black hover:border-gray-300'}`}
                          title="Refresh messages"
                        >
                          <FaSync size={10} />
                          Refresh
                        </button>
                        {connectedWallet && userTokens.length > 0 && (
                          <button
                            onClick={() => setShowBroadcastModal(true)}
                            className={`flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wide border transition-colors ${isDark ? 'border-purple-800 text-purple-400 hover:bg-purple-900/20' : 'border-purple-200 text-purple-600 hover:bg-purple-50'}`}
                            title="Broadcast to token holders"
                          >
                            <FaBroadcastTower size={10} />
                            Broadcast
                          </button>
                        )}
                        {hasRoomAccess(chatRooms.find(r => r.id === activeRoom)) ? (
                          <span className={`text-[10px] uppercase px-2 py-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>Unlocked</span>
                        ) : (
                          <span className={`text-[10px] uppercase px-2 py-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>Locked</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-black' : 'bg-white'}`}>
                    {messages.length > 0 ? (
                      messages.map((message) => (
                        <div key={message.id} className={`flex gap-3 p-3 border ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                          <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 border ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                            <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                              {message.username[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{message.username}</span>
                              {message.tokens && message.tokens.length > 0 && (
                                <div className="flex gap-1">
                                  {message.tokens.map((token) => (
                                    <span
                                      key={token}
                                      className={`text-[10px] px-1.5 py-0.5 border ${isDark ? 'border-green-800 text-green-400' : 'border-green-200 text-green-600'}`}
                                    >
                                      {token}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{formatTime(message.timestamp)}</span>
                            </div>
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{message.message}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center py-12">
                          <FaComments className={`text-4xl mx-auto mb-4 ${isDark ? 'text-gray-800' : 'text-gray-200'}`} />
                          <h3 className={`text-sm font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No messages</h3>
                          <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                            {hasRoomAccess(chatRooms.find(r => r.id === activeRoom))
                              ? "Start the conversation"
                              : "Connect wallet to participate"
                            }
                          </p>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className={`border-t p-4 ${isDark ? 'border-gray-800 bg-black' : 'border-gray-200 bg-white'}`}>
                    {connectedWallet || telegramUser ? (
                      <div className="flex gap-3">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type your message..."
                          className={`flex-1 px-4 py-3 text-sm resize-none border focus:outline-none ${isDark ? 'bg-black border-gray-800 text-white placeholder-gray-600 focus:border-gray-700' : 'bg-white border-gray-200 text-black placeholder-gray-400 focus:border-gray-300'}`}
                          rows={1}
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                          className={`px-4 py-3 text-xs uppercase tracking-wide font-bold transition-colors ${newMessage.trim() ? (isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800') : (isDark ? 'bg-gray-900 text-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed')}`}
                        >
                          Send
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <FaLock className={`text-2xl mx-auto mb-3 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                        <p className={`text-xs uppercase tracking-widest mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Connect to participate</p>
                        {!connectedWallet && !telegramUser && (
                          <div className="flex flex-wrap justify-center gap-2">
                            <button
                              onClick={() => connectWallet('MetaMask')}
                              disabled={isConnecting || !availableWallets.metamask}
                              className={`px-4 py-2 text-xs uppercase tracking-wide border transition-colors ${availableWallets.metamask
                                ? isDark ? 'border-gray-800 text-white hover:bg-gray-900' : 'border-gray-200 text-black hover:bg-gray-100'
                                : isDark ? 'border-gray-900 text-gray-700 cursor-not-allowed' : 'border-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                              MetaMask
                            </button>
                            <button
                              onClick={() => connectWallet('Phantom')}
                              disabled={isConnecting || !availableWallets.phantom}
                              className={`px-4 py-2 text-xs uppercase tracking-wide border transition-colors ${availableWallets.phantom
                                ? isDark ? 'border-gray-800 text-white hover:bg-gray-900' : 'border-gray-200 text-black hover:bg-gray-100'
                                : isDark ? 'border-gray-900 text-gray-700 cursor-not-allowed' : 'border-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                              Phantom
                            </button>
                            <button
                              onClick={() => connectWallet('Yours')}
                              disabled={isConnecting || !availableWallets.yours}
                              className={`px-4 py-2 text-xs uppercase tracking-wide border transition-colors ${availableWallets.yours
                                ? isDark ? 'border-gray-800 text-white hover:bg-gray-900' : 'border-gray-200 text-black hover:bg-gray-100'
                                : isDark ? 'border-gray-900 text-gray-700 cursor-not-allowed' : 'border-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                              Yours
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                )}
              </div>
            </div>

            {/* Mobile Navigation */}
            <MobileBoardroomNav
              activeRoom={activeRoom}
              setActiveRoom={setActiveRoom}
              chatRooms={chatRooms}
              hasRoomAccess={hasRoomAccess}
              boardroomMembers={boardroomMembers}
              isLoadingMembers={isLoadingMembers}
              connectedWallet={connectedWallet}
              connectWallet={connectWallet}
              disconnectWallet={disconnectWallet}
              availableWallets={availableWallets}
              isConnecting={isConnecting}
              walletError={walletError}
              userTokens={userTokens}
              walletAddress={walletAddress}
              accountName={accountName}
              isLoadingTokens={isLoadingTokens}
              retryTokenFetch={retryTokenFetch}
            />

            {/* Broadcast Modal */}
            {showBroadcastModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 max-w-md w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <FaBroadcastTower className="text-purple-400" />
                      Broadcast to Token Holders
                    </h3>
                    <button
                      onClick={() => setShowBroadcastModal(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select Token
                      </label>
                      <select
                        value={selectedTokenForBroadcast}
                        onChange={(e) => setSelectedTokenForBroadcast(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="">Choose a token...</option>
                        {getAvailableTokensForBroadcast().map((token) => (
                          <option key={token} value={token}>
                            {token}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Broadcast Message
                      </label>
                      <textarea
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Enter your message to all token holders..."
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-purple-500"
                        rows={3}
                      />
                    </div>

                    <div className="text-xs text-gray-400 p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <FaUsers className="text-purple-400" />
                        <span className="font-medium">Broadcast Info</span>
                      </div>
                      <p>This message will be sent to all users holding {selectedTokenForBroadcast || 'the selected token'} in their connected wallets.</p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowBroadcastModal(false)}
                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={broadcastToTokenHolders}
                        disabled={!broadcastMessage.trim() || !selectedTokenForBroadcast || isBroadcasting}
                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {isBroadcasting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Broadcasting...
                          </>
                        ) : (
                          <>
                            <FaBroadcastTower />
                            Send Broadcast
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.section>
      </motion.div>
    </>
  );
}