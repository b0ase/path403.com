'use client';
import { useState } from 'react';
import { 
  FaComments, 
  FaUsers, 
  FaWallet, 
  FaBars, 
  FaTimes,
  FaCircle,
  FaCrown,
  FaLock,
  FaCoins
} from 'react-icons/fa';

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

interface MobileBoardroomNavProps {
  activeRoom: string;
  setActiveRoom: (roomId: string) => void;
  chatRooms: ChatRoom[];
  hasRoomAccess: (room: ChatRoom) => boolean;
  boardroomMembers: Array<{
    id: string;
    username: string;
    role: string;
    wallet_address: string | null;
    source: string;
    joined_at: string;
  }>;
  isLoadingMembers: boolean;
  connectedWallet: string | null;
  connectWallet: (walletType: string) => void;
  disconnectWallet: () => void;
  availableWallets: {
    phantom: boolean;
    yours: boolean;
  };
  isConnecting: boolean;
  walletError: string;
  userTokens: Array<{
    symbol: string;
    name: string;
    balance: string | number;
    contract: string;
  }>;
  walletAddress: string;
  accountName?: string;
  isLoadingTokens?: boolean;
  retryTokenFetch?: () => void;
}

export default function MobileBoardroomNav({
  activeRoom,
  setActiveRoom,
  chatRooms,
  hasRoomAccess,
  boardroomMembers,
  isLoadingMembers,
  connectedWallet,
  connectWallet,
  disconnectWallet,
  availableWallets,
  isConnecting,
  walletError,
  userTokens,
  walletAddress,
  accountName,
  isLoadingTokens,
  retryTokenFetch
}: MobileBoardroomNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'rooms' | 'members' | 'wallet' | 'tokens'>('rooms');

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 right-4 z-50 bg-gray-800 p-2 rounded-lg border border-gray-600"
      >
        <FaBars className="text-white text-lg" />
      </button>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/80 z-50">
          <div className="h-full w-80 bg-gray-900 border-r border-gray-700 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Boardroom</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('rooms')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'rooms' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-400'
                }`}
              >
                Chat Rooms
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'members' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-400'
                }`}
              >
                Members
              </button>
              <button
                onClick={() => setActiveTab('wallet')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'wallet' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-400'
                }`}
              >
                Wallet
              </button>
              {connectedWallet && userTokens.length > 0 && (
                <button
                  onClick={() => setActiveTab('tokens')}
                  className={`flex-1 py-3 text-sm font-medium ${
                    activeTab === 'tokens' 
                      ? 'text-blue-400 border-b-2 border-blue-400' 
                      : 'text-gray-400'
                  }`}
                >
                  Tokens
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'rooms' && (
                <div className="p-4 space-y-2">
                  {chatRooms.map((room) => {
                    const hasAccess = hasRoomAccess(room);
                    const isActive = activeRoom === room.id;
                    
                    return (
                      <button
                        key={room.id}
                        onClick={() => {
                          if (hasAccess) {
                            setActiveRoom(room.id);
                            setIsOpen(false);
                          }
                        }}
                        disabled={!hasAccess}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-600/30 border border-blue-500/50' 
                            : hasAccess
                              ? 'bg-gray-800/30 hover:bg-gray-700/50'
                              : 'bg-gray-800/10 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {hasAccess ? (
                              room.icon
                            ) : (
                              <FaLock className="text-gray-500" />
                            )}
                            <span className={`text-sm font-medium ${
                              hasAccess ? 'text-white' : 'text-gray-500'
                            }`}>
                              {room.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaUsers className="text-xs text-gray-400" />
                            <span className="text-xs text-gray-400">{room.memberCount}</span>
                          </div>
                        </div>
                        <p className={`text-xs ${hasAccess ? 'text-gray-300' : 'text-gray-500'}`}>
                          {room.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {activeTab === 'members' && (
                <div className="p-4">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <FaUsers className="text-blue-400" />
                    Boardroom Members ({boardroomMembers.length})
                  </h3>
                  {isLoadingMembers ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto"></div>
                      <p className="text-xs text-gray-400 mt-2">Loading members...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {boardroomMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/30">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {member.username[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white truncate">
                                {member.username}
                              </span>
                              <span className={`text-xs px-1 py-0.5 rounded ${
                                member.source === 'bot' 
                                  ? 'bg-purple-600/20 text-purple-300' 
                                  : 'bg-green-600/20 text-green-300'
                              }`}>
                                {member.source}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 truncate">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'wallet' && (
                <div className="p-4">
                  <h3 className="text-sm font-bold text-white mb-3">Wallet Connection</h3>
                  {!connectedWallet ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => connectWallet('Phantom')}
                        disabled={isConnecting || !availableWallets.phantom}
                        className={`w-full flex items-center gap-2 p-2 text-sm rounded transition-colors ${
                          availableWallets.phantom 
                            ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300' 
                            : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <FaWallet />
                        Phantom {!availableWallets.phantom && '(Not installed)'}
                      </button>
                      <button
                        onClick={() => connectWallet('Yours.org')}
                        disabled={isConnecting || !availableWallets.yours}
                        className={`w-full flex items-center gap-2 p-2 text-sm rounded transition-colors ${
                          availableWallets.yours 
                            ? 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300' 
                            : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <FaWallet />
                        Yours.org {!availableWallets.yours && '(Not installed)'}
                      </button>
                      {walletError && (
                        <p className="text-xs text-red-400 mt-2">{walletError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaWallet className="text-green-400" />
                          <span className="text-sm font-medium text-white">{connectedWallet}</span>
                        </div>
                        <button
                          onClick={disconnectWallet}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Disconnect
                        </button>
                      </div>
                      {accountName && (
                        <div className="text-xs text-blue-300">
                          Account: {accountName}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 font-mono">
                        {walletAddress.length > 20 ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}` : walletAddress}
                      </div>
                      {userTokens.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-400">Verified Tokens:</p>
                          {userTokens.map((token, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-green-300">{token.symbol}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tokens' && (
                <div className="p-4">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <FaCoins className="text-yellow-400" />
                    Your Token Holdings
                  </h3>
                  <div className="space-y-2">
                    {userTokens.map((token, index) => {
                      const tokenColors: { [key: string]: string } = {
                        'SOL': 'bg-purple-600/20 text-purple-300 border-purple-500/30',
                        'BSV': 'bg-orange-600/20 text-orange-300 border-orange-500/30',
                        'BOASE': 'bg-blue-600/20 text-blue-300 border-blue-500/30',
                        'BITCOIN': 'bg-orange-600/20 text-orange-300 border-orange-500/30',
                        'PNUT': 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30',
                        'SIGMA': 'bg-green-600/20 text-green-300 border-green-500/30',
                        'USDC': 'bg-green-600/20 text-green-300 border-green-500/30',
                        'USDT': 'bg-green-600/20 text-green-300 border-green-500/30',
                        'JUP': 'bg-purple-600/20 text-purple-300 border-purple-500/30',
                        'RAY': 'bg-blue-600/20 text-blue-300 border-blue-500/30',
                        'SRM': 'bg-orange-600/20 text-orange-300 border-orange-500/30'
                      };
                      
                      const colorClass = tokenColors[token.symbol] || 'bg-gray-600/20 text-gray-300 border-gray-500/30';
                      
                      return (
                        <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${colorClass}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                              <span className="text-xs font-bold">{token.symbol}</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium">{token.name}</div>
                              <div className="text-xs text-gray-400">Contract: {token.contract.slice(0, 8)}...</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold">{token.balance}</div>
                            <div className="text-xs text-gray-400">{token.symbol}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 p-2 bg-blue-600/10 border border-blue-500/20 rounded-lg">
                    <p className="text-xs text-blue-300">
                      💡 Each token creates an exclusive chat room for holders
                    </p>
                  </div>
                  {walletError && (
                    <div className="mt-3 p-2 bg-yellow-600/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-xs text-yellow-300 mb-2">{walletError}</p>
                      {retryTokenFetch && (
                        <button
                          onClick={retryTokenFetch}
                          disabled={isLoadingTokens}
                          className="text-xs bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-2 py-1 rounded transition-colors"
                        >
                          {isLoadingTokens ? 'Retrying...' : 'Retry Token Fetch'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 