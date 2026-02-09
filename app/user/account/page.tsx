'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useColorTheme, ColorTheme } from '@/components/ThemePicker';
import { useUserHandle } from '@/hooks/useUserHandle';

// Color theme background classes mapping
const themeBackgrounds: Record<string, string> = {
  black: 'bg-black text-white',
  white: 'bg-white text-black',
  yellow: 'bg-amber-400 text-black',
  red: 'bg-red-500 text-black',
  green: 'bg-green-500 text-black',
  blue: 'bg-blue-500 text-black',
};
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { useYoursWalletContext } from '@/lib/contexts/YoursWalletContext';
import { useAuth } from '@/components/Providers';
import { FaGithub, FaExternalLinkAlt, FaWallet, FaSignOutAlt, FaGoogle, FaTwitter, FaDiscord, FaLinkedin, FaBuilding, FaCoins, FaUsers, FaPlus, FaRobot, FaKey, FaEye, FaEyeSlash, FaStar, FaCodeBranch, FaCheck, FaCode } from 'react-icons/fa';
import { FiZap, FiArrowUpRight, FiArrowRight, FiShield, FiCheck, FiAlertCircle, FiPieChart, FiGrid, FiUser, FiCpu, FiServer, FiMessageSquare, FiDatabase, FiDollarSign, FiSettings, FiLock, FiGlobe, FiHardDrive, FiFileText, FiTrash, FiActivity, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import HoldingsDisplay from '@/components/portfolio/HoldingsDisplay';
import TwitterTokenCard from '@/components/twitter/TwitterTokenCard';

// AI Provider Icons
const ClaudeIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm2.07-7.75l-.9.92C11.45 10.9 11 11.5 11 13h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H6c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
  </svg>
);

const OpenAIIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.6 8.3829l2.02-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.1408 1.6465 4.4708 4.4708 0 0 1 .5765 3.0316zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997z" />
  </svg>
);

const GeminiIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

interface TokenBalance {
  id: string;
  projectSlug: string;
  tokenSymbol: string;
  balance: string;
}

interface WalletConnection {
  type: 'phantom' | 'metamask' | 'okx';
  address: string;
}

interface Company {
  id: string;
  name: string;
  companies_house_number: string;
  status: string;
  tokens: CompanyToken[];
}

interface CompanyToken {
  id: string;
  symbol: string;
  name: string;
  share_class: string;
  total_supply: number;
  nominal_value: number;
  is_deployed: boolean;
  blockchain: string | null;
  cap_table: CapTableEntry[];
}

interface CapTableEntry {
  id: string;
  holder_name: string;
  holder_email: string;
  shares_held: number;
  percentage: number;
  share_certificate_number: string;
}

interface IdentityToken {
  id: string;
  source: 'handcash' | 'twitter' | 'google' | 'discord' | 'github' | 'linkedin' | 'phantom' | 'metamask' | 'yours';
  identity: string;
  symbol: string;
  display_name: string;
  is_deployed: boolean;
  blockchain: string | null;
  total_supply: number;
}

// Wallet icons for identity tokens
const SiPhantom = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
    <circle cx="64" cy="64" r="64" fill="currentColor" fillOpacity="0.2" />
    <path d="M110.584 64.9142H99.142C99.142 41.7651 80.173 23 56.7724 23C33.6612 23 14.8716 41.3057 14.4118 64.0583C13.936 87.5223 35.8355 107.495 59.6488 105.491C70.9979 104.532 81.5254 99.1533 89.1729 90.5765L110.584 64.9142Z" fill="currentColor" />
  </svg>
);

const SiMetamask = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 318.6 318.6" className={className}>
    <polygon fill="currentColor" points="274.1,35.5 174.6,109.4 193,65.8" />
    <polygon fill="currentColor" points="44.4,35.5 143.1,110.1 125.6,65.8" />
    <polygon fill="currentColor" points="238.3,206.8 211.8,247.4 267.4,262.7 283.8,207.7" />
    <polygon fill="currentColor" points="34.9,207.7 51.2,262.7 106.8,247.4 80.3,206.8" />
    <polygon fill="currentColor" points="103.6,138.2 87.8,162.1 142.9,164.6 141.1,106" />
    <polygon fill="currentColor" points="214.9,138.2 175.9,104.4 175.6,164.6 230.8,162.1" />
  </svg>
);

interface LinkedIdentity {
  id: string;
  unified_user_id: string;
  provider: string;
  provider_user_id: string;
  provider_email: string | null;
  provider_handle: string | null;
  oauth_provider: string | null;
  linked_at: string;
}

interface UnifiedUser {
  id: string;
  display_name: string | null;
  primary_email: string | null;
  avatar_url: string | null;
  ai_executive_enabled?: boolean;
}

interface TokenPortfolioItem {
  tokenId: string;
  ticker: string;
  name: string;
  description: string | null;
  blockchain: string | null;
  isDeployed: boolean;
  priceUsd: number;
  inAccount: number;
  staked: number;
  asBearer: number;
  totalOwned: number;
  totalInvestedUsd: number;
  averageBuyPrice: number;
  breakdown: {
    inAccount: number;
    staked: number;
    asBearer: number;
  };
}

interface TokenPortfolioResponse {
  portfolio: TokenPortfolioItem[];
  summary: {
    totalTokenTypes: number;
    totalInAccount: number;
    totalStaked: number;
    totalAsBearer: number;
    totalUsdValue: number;
  };
}

interface BWriterDashboard {
  balance: {
    available: number;
    totalEarned: number;
    totalPurchased: number;
    totalStakedEver: number;
    totalWithdrawn: number;
    firstTokenCredited: boolean;
    tier001PurchasedAt: string | null;
    tier010PurchasedAt: string | null;
  };
  stakes: {
    confirmed: Array<{ id: string; amount: number; stakedAt: string; dividendsAccumulated: number; status: string }>;
    pending: Array<{ id: string; amount: number; status: string; depositDeadline: string; createdAt: string }>;
    unstaked: Array<{ id: string; amount: number; unstakedAt: string; dividendsAccumulated: number }>;
  };
  dividends: {
    pending: number;
    claimed: number;
    totalEarned: number;
  };
  ownership: {
    totalStaked: number;
    totalAccumulated: number;
    percentageOfPlatform: string;
    capTableRank: string;
  };
  withdrawalAddress: {
    isConfigured: boolean;
    addressMasked: string | null;
    lastDividendPaid: string | null;
  };
  pendingDeposits: Array<{ id: string; stakeId: string; amount: number; status: string; createdAt: string; depositDeadline: string }>;
  nextSteps: string[];
  summary: {
    dividendEligible: boolean;
    readyForDividends: boolean;
    totalValue: { tokens: number; satoshis: number };
  };
}

interface MergePreview {
  source: {
    unified_user: UnifiedUser;
    identity_count: number;
    company_count: number;
  };
  target: {
    unified_user: UnifiedUser;
    identity_count: number;
    company_count: number;
  };
  message: string;
}

type TabType = 'overview' | 'account' | 'repos' | 'projects' | 'investments' | 'boardroom' | 'companies' | 'tokens' | 'kyc' | 'connections' | 'settings' | 'agents' | 'messages' | 'servers' | 'database' | 'automations' | 'domains' | 'brand' | 'infrastructure' | 'contracts' | 'content';

interface ContentAsset {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  asset_type: 'video' | 'audio' | 'image' | 'document';
  title: string;
  description: string | null;
  tags: string[];
  publicUrl: string;
  created_at: string;
}

interface UploadingFile {
  name: string;
  progress: number;
  error?: string;
}

// Content Tab Section Component
function ContentTabSection({ isDark }: { isDark: boolean }) {
  const [contentAssets, setContentAssets] = useState<ContentAsset[]>([]);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useState<HTMLInputElement | null>(null)[0];

  // Fetch existing content assets
  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/content-assets?status=active');
      if (response.ok) {
        const data = await response.json();
        setContentAssets(data.assets || []);
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      const uploadingFile: UploadingFile = { name: file.name, progress: 0 };
      setUploading(prev => [...prev, uploadingFile]);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            setUploading(prev => prev.map(f =>
              f.name === file.name ? { ...f, progress } : f
            ));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            setContentAssets(prev => [response.asset, ...prev]);
            setUploading(prev => prev.filter(f => f.name !== file.name));
          } else {
            setUploading(prev => prev.map(f =>
              f.name === file.name ? { ...f, error: 'Upload failed' } : f
            ));
          }
        });

        xhr.addEventListener('error', () => {
          setUploading(prev => prev.map(f =>
            f.name === file.name ? { ...f, error: 'Upload failed' } : f
          ));
        });

        xhr.open('POST', '/api/content-assets/upload');
        xhr.send(formData);
      } catch (error) {
        console.error('Upload error:', error);
        setUploading(prev => prev.map(f =>
          f.name === file.name ? { ...f, error: 'Upload failed' } : f
        ));
      }
    }
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const response = await fetch(`/api/content-assets?id=${assetId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setContentAssets(prev => prev.filter(a => a.id !== assetId));
      } else {
        alert('Failed to delete asset');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete asset');
    }
  };

  if (loading) {
    return (
      <motion.div
        key="content"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="space-y-12"
      >
        <div className="text-center py-48 border border-zinc-900 bg-zinc-950/20">
          <div className="animate-spin h-12 w-12 border-2 border-white border-t-transparent mx-auto mb-8"></div>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em]">SYNCHRONIZING_CONTENT_MANIFEST...</p>
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div
      key="content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-8">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tighter text-white mb-2">STUDIO_CONTENT_MANIFEST</h2>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em] font-bold">ASSET_STORAGE_PROTOCOL</p>
        </div>
        <button
          onClick={() => (document.getElementById('file-upload-input') as HTMLInputElement)?.click()}
          className="px-8 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono"
        >
          INITIALIZE_UPLOAD
        </button>
        <input
          id="file-upload-input"
          type="file"
          multiple
          accept="video/*,audio/*,image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => (document.getElementById('file-upload-input') as HTMLInputElement)?.click()}
        className={`border border-dashed p-24 text-center group cursor-pointer transition-all ${dragActive
          ? 'border-white bg-zinc-900'
          : 'border-zinc-900 bg-zinc-950/20 hover:border-zinc-700'
          }`}
      >
        <div className="flex flex-col items-center">
          <FiCpu size={48} className="text-zinc-800 mb-8 group-hover:scale-110 group-hover:text-white transition-all" />
          <h3 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] font-mono mb-4">
            REPLICATE_ASSETS_TO_PRIMARY_NODE
          </h3>
          <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest max-w-md mx-auto leading-relaxed">
            VIDEO_AUDIO_IMAGE_SPECIFICATIONS_ALLOWED. MAX_PAYLOAD_LIMIT_5GB.
          </p>
        </div>
      </div>

      {/* Uploading Files */}
      {uploading.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">UPLOADING_BUFFER</h3>
          <div className="grid grid-cols-1 gap-px bg-zinc-900 border border-zinc-900">
            {uploading.map((file, i) => (
              <div key={i} className="bg-black p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest truncate max-w-md">{file.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{Math.round(file.progress)}%</span>
                </div>
                <div className="w-full h-px bg-zinc-900">
                  <div
                    className={`h-full transition-all ${file.error ? 'bg-red-500' : 'bg-white'}`}
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
                {file.error && <p className="text-[9px] text-red-500 mt-2 font-mono uppercase tracking-widest">{file.error}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Assets Grid */}
      {contentAssets.length === 0 ? (
        <div className="border border-dashed border-zinc-900 bg-zinc-950/20 p-24 text-center">
          <FiHardDrive size={48} className="mx-auto text-zinc-800 mb-8" />
          <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] font-mono mb-4">STORAGE_EMPTY</h3>
          <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest leading-relaxed">
            INITIALIZE_UPLOAD_TO_POPULATE_CONTENT_MANIFEST
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">
            {contentAssets.length} ACTIVE_ASSETS_DETECTED
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-900 border border-zinc-900">
            {contentAssets.map((asset) => (
              <div
                key={asset.id}
                className="bg-black p-4 flex flex-col group relative hover:bg-zinc-950 transition-all"
              >
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(asset.id);
                  }}
                  className="absolute top-4 right-4 p-2 bg-red-950/20 text-red-500 border border-red-900 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-500 hover:text-white"
                  title="Delete"
                >
                  <FiTrash size={12} />
                </button>

                {/* Asset Preview */}
                <div className="aspect-video flex items-center justify-center mb-6 bg-zinc-950 overflow-hidden">
                  {asset.asset_type === 'video' ? (
                    <video
                      src={asset.publicUrl}
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                      controls={false}
                      preload="metadata"
                    />
                  ) : asset.asset_type === 'image' ? (
                    <img
                      src={asset.publicUrl}
                      alt={asset.title}
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                    />
                  ) : asset.asset_type === 'audio' ? (
                    <FiCpu size={32} className="text-zinc-800 group-hover:text-white transition-colors" />
                  ) : (
                    <FiFileText size={32} className="text-zinc-800 group-hover:text-white transition-colors" />
                  )}
                </div>

                {/* Asset Info */}
                <div className="space-y-3">
                  <div className="text-[10px] font-mono font-bold text-white uppercase tracking-tighter truncate" title={asset.file_name}>
                    {asset.file_name}
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                    <span>{asset.asset_type}</span>
                    <span>{formatFileSize(asset.file_size)}</span>
                  </div>
                </div>

                {/* View Link */}
                <a
                  href={asset.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 text-[9px] text-zinc-400 hover:text-white font-mono font-bold uppercase tracking-[0.2em] flex items-center gap-2 border border-zinc-900 p-2 justify-center transition-all bg-zinc-950"
                >
                  ACCESS_NODE <FiArrowUpRight size={10} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function UserAccountPage() {
  const { handle, isClient } = useUserHandle();
  const { isConnected: isYoursConnected, addresses, connect: connectYours, disconnect: disconnectYours } = useYoursWalletContext();
  const { user, signOut, loading, linkGoogle, linkTwitter, linkDiscord, linkGithub, linkLinkedin, supabase } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { colorTheme } = useColorTheme();
  // Greeting moved to Layout
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const searchParams = useSearchParams();
  const activeTab: TabType = (searchParams.get('tab') as TabType) || 'account';
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedToken, setSelectedToken] = useState<CompanyToken | null>(null);

  // Companies state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [creatingCompany, setCreatingCompany] = useState(false);

  // Create company modal
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyNumber, setNewCompanyNumber] = useState('');

  // Create token modal
  const [showCreateToken, setShowCreateToken] = useState(false);
  const [creatingToken, setCreatingToken] = useState(false);
  const [newTokenSymbol, setNewTokenSymbol] = useState('');
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenShareClass, setNewTokenShareClass] = useState('Ordinary');
  const [newTokenCustomShareClass, setNewTokenCustomShareClass] = useState('');
  const [newTokenSupply, setNewTokenSupply] = useState('1000');
  const [newTokenNominalValue, setNewTokenNominalValue] = useState('0.01');

  // Mount check for theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Identity tokens based on connected accounts
  const [identityTokens, setIdentityTokens] = useState<IdentityToken[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);

  // Token portfolio state
  const [tokenPortfolio, setTokenPortfolio] = useState<TokenPortfolioResponse | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);

  // bWriter token state
  const [bwriterDashboard, setBwriterDashboard] = useState<BWriterDashboard | null>(null);
  const [bwriterLoading, setBwriterLoading] = useState(true);
  const [bwriterError, setBwriterError] = useState<string | null>(null);

  // Wallet connections from localStorage
  const [walletConnections, setWalletConnections] = useState<WalletConnection | null>(null);

  // KYC State
  // KYC State handled in Layout, but keeping local if needed for specific tabs or modals?
  // Actually the header logic used it. We'll simulate or fetch if needed by tabs functionality.
  // For now removing the main state used by header to clear potential conflict or unused vars.
  // But wait, the return logic might rely on it for non-header things?
  // Checking usage... "kycStatus" was used in the Header mainly.
  // Let's keep it if logic below needs it, but we removed loadKycStatus function previously (or tried to).
  // I will re-add it initialized to 'none' just to be safe for any lingering logic, but remove the effect that sets it for header.
  const [kycStatus, setKycStatus] = useState<'none' | 'pending' | 'verified' | 'rejected'>('none');

  // Unified user system
  const [unifiedUser, setUnifiedUser] = useState<UnifiedUser | null>(null);

  // MFA State
  const [mfaEnrollment, setMfaEnrollment] = useState<{ id: string, type: 'totp', totp: { qr_code: string, secret: string, uri: string } } | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);

  useEffect(() => {
    const checkMfa = async () => {
      if (!user || !supabase) return;
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors && factors.totp.length > 0) setIsMfaEnabled(true);
    };
    checkMfa();
  }, [user, supabase]);
  const [linkedIdentities, setLinkedIdentities] = useState<LinkedIdentity[]>([]);
  const [loadingUnifiedUser, setLoadingUnifiedUser] = useState(true);

  // Merge modal
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergePreview, setMergePreview] = useState<MergePreview | null>(null);
  const [mergingAccounts, setMergingAccounts] = useState(false);

  const [pendingLinkIdentity, setPendingLinkIdentity] = useState<{ provider: string; provider_user_id: string; existing_unified_user_id: string } | null>(null);
  const [activeMergeToken, setActiveMergeToken] = useState<string | null>(null);

  // Track if auth has been checked via unified user API
  const [authChecked, setAuthChecked] = useState(false);
  const [authSyncRequired, setAuthSyncRequired] = useState(false);

  // API Key modal state
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyProvider, setApiKeyProvider] = useState<'claude' | 'openai' | 'gemini' | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Twitter token state
  const [twitterTokenStatus, setTwitterTokenStatus] = useState<{
    tokenized: boolean;
    token_id?: string;
    total_supply?: number;
    current_price_sats?: number;
  } | null>(null);

  // Profile state for startup founders
  const [profileUsername, setProfileUsername] = useState('');
  const [profileCompanyName, setProfileCompanyName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileWebsite, setProfileWebsite] = useState('');
  const [profileTwitter, setProfileTwitter] = useState('');
  const [profileLinkedin, setProfileLinkedin] = useState('');
  const [profileRole, setProfileRole] = useState('');
  const [profileLocation, setProfileLocation] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Refresh identities function (can be called after OAuth)
  const refreshIdentities = async () => {
    try {
      console.log('🔍 Connections Tab - Refreshing identities...');
      const res = await fetch('/api/user/unified');
      console.log('🔍 Connections Tab - Response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('🔍 Connections Tab - Unified user data:', data);
        setUnifiedUser(data.unified_user);
        setLinkedIdentities(data.identities || []);
        console.log('✅ Identities refreshed:', data.identities?.length || 0);
        console.log('🔍 Identity details:', data.identities);
      } else {
        const errorData = await res.json();
        console.error('🔍 Connections Tab - Error fetching unified user:', errorData);
      }
    } catch (error) {
      console.error('🔍 Connections Tab - Failed to refresh identities:', error);
    }
  };

  // Check auth via unified user API (supports Supabase, HandCash, and wallet sessions)
  useEffect(() => {
    const checkAuth = async () => {
      if (!isClient) return;

      try {
        const res = await fetch('/api/user/unified');
        if (res.ok) {
          const data = await res.json();
          setUnifiedUser(data.unified_user);
          setLinkedIdentities(data.identities || []);
          setLoadingUnifiedUser(false);
          setAuthChecked(true);
          // Also fetch other data
          fetchCompanies();
          fetchIdentityTokens();
        } else if (res.status === 401) {
          // Not authenticated via API

          // CRITICAL FIX: To prevent infinite loops (Account -> Login -> Account),
          // we only redirect if the client-side also thinks we are logged out.
          // If client says "Logged In" (e.g. via Cookie) but server says "401", 
          // we show a "Sync Required" modal instead of auto-redirecting.
          if (!loading) {
            if (!user && !handle) {
              router.push('/login');
            } else {
              console.warn('⚠️ Auth Mismatch: Client thinks logged in, Server returned 401. Preventing redirect loop.');
              setAuthSyncRequired(true);
            }
          }
          setAuthChecked(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthChecked(true);
      }
    };

    // Only check auth after Supabase loading is done
    if (!loading) {
      checkAuth();
    }
  }, [isClient, loading, user, handle, router]);

  // Refresh identities when navigating to connections tab after OAuth
  useEffect(() => {
    if (activeTab === 'connections' && authChecked && !loadingUnifiedUser) {
      refreshIdentities();
    }
  }, [activeTab]);

  // Fetch Twitter token status when identities load
  useEffect(() => {
    const twitterIdentity = linkedIdentities.find(
      i => i.provider === 'twitter' || (i.provider === 'supabase' && i.oauth_provider === 'twitter')
    );
    if (!twitterIdentity) {
      setTwitterTokenStatus(null);
      return;
    }
    const username = twitterIdentity.provider_handle?.replace('@', '') || '';
    if (!username) return;

    fetch(`/api/twitter/${username}/token`)
      .then(res => res.ok ? res.json() : { tokenized: false })
      .then(data => setTwitterTokenStatus(data))
      .catch(() => setTwitterTokenStatus({ tokenized: false }));
  }, [linkedIdentities]);

  // Fetch token data when tokens tab is active
  useEffect(() => {
    if (activeTab === 'tokens' && authChecked) {
      fetchTokenPortfolio();
      fetchBWriterDashboard();
    }
  }, [activeTab, authChecked]);

  const handleSignOut = async () => {
    try {
      console.log('🔍 Logging out...');

      // Sign out from Supabase
      const { error } = await signOut();
      if (error) {
        console.error('❌ Supabase signOut error:', error);
      } else {
        console.log('✅ Supabase signOut successful');
      }

      // Clear wallet cookies
      await fetch('/api/auth/wallet', { method: 'DELETE' }).catch((e) => {
        console.error('❌ Wallet cookie clear error:', e);
      });

      // Clear HandCash cookies
      document.cookie = 'b0ase_auth_token=; Path=/; Max-Age=0';
      document.cookie = 'b0ase_user_handle=; Path=/; Max-Age=0';

      // Clear Twitter cookie
      document.cookie = 'b0ase_twitter_user=; Path=/; Max-Age=0';

      console.log('✅ All cookies cleared, redirecting to home...');

      // Force redirect
      window.location.href = '/';
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force redirect even if there's an error
      window.location.href = '/';
    }
  };

  // Fetch companies from API
  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const res = await fetch('/api/companies');
      if (res.ok) {
        const data = await res.json();
        // Transform API response to match our Company interface
        const transformedCompanies: Company[] = (data.companies || []).map((c: Record<string, unknown>) => ({
          id: c.id as string,
          name: c.name as string,
          companies_house_number: (c.companies_house_number as string) || 'Pending',
          status: (c.status as string) || 'active',
          tokens: ((c.company_tokens as Record<string, unknown>[]) || []).map((t: Record<string, unknown>) => ({
            id: t.id as string,
            symbol: t.symbol as string,
            name: t.name as string,
            share_class: (t.share_class as string) || 'Ordinary',
            total_supply: Number(t.total_supply) || 0,
            nominal_value: Number(t.nominal_value) || 0.01,
            is_deployed: Boolean(t.is_deployed),
            blockchain: t.blockchain as string | null,
            cap_table: ((t.cap_table_entries as Record<string, unknown>[]) || []).map((e: Record<string, unknown>) => ({
              id: e.id as string,
              holder_name: e.holder_name as string,
              holder_email: (e.holder_email as string) || '',
              shares_held: Number(e.shares_held) || 0,
              percentage: Number(e.percentage) || 0,
              share_certificate_number: (e.share_certificate_number as string) || '',
            })),
          })),
        }));
        setCompanies(transformedCompanies);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Fetch identity tokens from API
  const fetchIdentityTokens = async () => {
    try {
      setLoadingTokens(true);
      const res = await fetch('/api/identity-tokens');
      if (res.ok) {
        const data = await res.json();
        if (data.tokens && data.tokens.length > 0) {
          setIdentityTokens(data.tokens.map((t: Record<string, unknown>) => ({
            id: t.id as string,
            source: t.source as IdentityToken['source'],
            identity: t.identity as string,
            symbol: t.symbol as string,
            display_name: t.display_name as string,
            is_deployed: Boolean(t.is_deployed),
            blockchain: t.blockchain as string | null,
            total_supply: Number(t.total_supply) || 0,
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching identity tokens:', error);
    } finally {
      setLoadingTokens(false);
    }
  };

  // Fetch user's actual token portfolio
  const fetchTokenPortfolio = async () => {
    try {
      setPortfolioLoading(true);
      setPortfolioError(null);
      const res = await fetch('/api/user/token-portfolio');
      if (res.ok) {
        const data = await res.json();
        setTokenPortfolio(data);
      } else if (res.status === 401) {
        setPortfolioError('Not authenticated');
      } else {
        setPortfolioError('Failed to fetch token portfolio');
      }
    } catch (error) {
      console.error('Error fetching token portfolio:', error);
      setPortfolioError('Error loading token data');
    } finally {
      setPortfolioLoading(false);
    }
  };

  // Fetch bWriter staking dashboard
  const fetchBWriterDashboard = async () => {
    try {
      setBwriterLoading(true);
      setBwriterError(null);
      const res = await fetch('/api/bwriter/dashboard');
      if (res.ok) {
        const data = await res.json();
        setBwriterDashboard(data);
      } else if (res.status === 401) {
        setBwriterError('Not authenticated');
      } else {
        setBwriterError('Failed to fetch $bWriter dashboard');
      }
    } catch (error) {
      console.error('Error fetching bWriter dashboard:', error);
      setBwriterError('Error loading $bWriter data');
    } finally {
      setBwriterLoading(false);
    }
  };

  // Fetch unified user and linked identities
  const fetchUnifiedUser = async () => {
    try {
      setLoadingUnifiedUser(true);
      const res = await fetch('/api/user/unified');
      if (res.ok) {
        const data = await res.json();
        setUnifiedUser(data.unified_user);
        setLinkedIdentities(data.identities || []);
      }
    } catch (error) {
      console.error('Error fetching unified user:', error);
    } finally {
      setLoadingUnifiedUser(false);
    }
  };

  // Link a wallet identity
  const linkWalletIdentity = async (provider: string, providerUserId: string, providerHandle?: string) => {
    try {
      // First check if this identity already exists
      const checkRes = await fetch(`/api/user/identities/check?provider=${provider}&provider_user_id=${encodeURIComponent(providerUserId)}`);
      const checkData = await checkRes.json();

      if (checkData.exists && checkData.unified_user?.id !== unifiedUser?.id) {
        // Identity belongs to another account - prompt merge
        setPendingLinkIdentity({
          provider,
          provider_user_id: providerUserId,
          existing_unified_user_id: checkData.unified_user.id,
        });
        // Get merge preview
        const mergeRes = await fetch('/api/user/merge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source_unified_user_id: checkData.unified_user.id }),
        });
        const mergeData = await mergeRes.json();
        if (mergeData.preview) {
          setMergePreview(mergeData);
          setShowMergeModal(true);
        }
        return;
      }

      // Link the identity
      const res = await fetch('/api/user/identities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          provider_user_id: providerUserId,
          provider_handle: providerHandle,
        }),
      });

      if (res.ok) {
        // Refresh linked identities
        await fetchUnifiedUser();
      } else {
        const error = await res.json();
        if (error.code === 'IDENTITY_EXISTS') {
          // Handle merge prompt
          setPendingLinkIdentity({
            provider,
            provider_user_id: providerUserId,
            existing_unified_user_id: error.existing_unified_user_id,
          });
          const mergeRes = await fetch('/api/user/merge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source_unified_user_id: error.existing_unified_user_id }),
          });
          const mergeData = await mergeRes.json();
          if (mergeData.preview) {
            setMergePreview(mergeData);
            setShowMergeModal(true);
          }
        } else {
          alert(error.error || 'Failed to link identity');
        }
      }
    } catch (error) {
      console.error('Error linking identity:', error);
      alert('Failed to link identity');
    }
  };

  // Confirm merge
  const confirmMerge = async () => {
    // Only proceed if we have a pending link OR an active merge token
    if (!pendingLinkIdentity && !activeMergeToken) return;

    setMergingAccounts(true);
    try {
      const payload: any = { confirmation: true };

      if (activeMergeToken) {
        payload.merge_token = activeMergeToken;
      } else if (pendingLinkIdentity) {
        // Legacy flow (might be disabled in API, but keeping for type safety/fallback)
        payload.source_unified_user_id = pendingLinkIdentity.existing_unified_user_id;
      }

      const res = await fetch('/api/user/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Refresh everything
        await fetchUnifiedUser();
        await fetchCompanies();
        setShowMergeModal(false);
        setMergePreview(null);
        setPendingLinkIdentity(null);
        setActiveMergeToken(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to merge accounts');
      }
    } catch (error) {
      console.error('Error merging accounts:', error);
      alert('Failed to merge accounts');
    } finally {
      setMergingAccounts(false);
    }
  };

  // Handle merge token from URL
  useEffect(() => {
    const mergeToken = searchParams.get('merge_token');
    if (mergeToken && isClient && !mergingAccounts && !activeMergeToken) {
      const handleMergeToken = async (token: string) => {
        try {
          setMergingAccounts(true);
          const res = await fetch('/api/user/merge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ merge_token: token }),
          });

          const data = await res.json();

          if (data.preview) {
            setMergePreview(data);
            setActiveMergeToken(token);
            setShowMergeModal(true);

            // Clean URL
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('merge_token');
            window.history.replaceState({}, '', newUrl.toString());
          } else {
            console.error('Merge preview failed:', data.error);
            alert('Merge failed: ' + data.error);
          }
        } catch (error) {
          console.error('Merge token error:', error);
        } finally {
          setMergingAccounts(false);
        }
      };

      handleMergeToken(mergeToken);
    }
  }, [searchParams, isClient, mergingAccounts, activeMergeToken]);

  // Unlink an identity
  const unlinkIdentity = async (identityId: string) => {
    if (!confirm('Are you sure you want to unlink this identity?')) return;

    try {
      const res = await fetch(`/api/user/identities?id=${identityId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchUnifiedUser();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to unlink identity');
      }
    } catch (error) {
      console.error('Error unlinking identity:', error);
      alert('Failed to unlink identity');
    }
  };

  // Open API key modal for AI providers
  const openApiKeyModal = (provider: 'claude' | 'openai' | 'gemini') => {
    setApiKeyProvider(provider);
    setApiKeyInput('');
    setApiKeyError(null);
    setShowApiKey(false);
    setShowApiKeyModal(true);
  };

  // Save API key for AI provider
  const saveApiKey = async () => {
    if (!apiKeyProvider || !apiKeyInput.trim()) return;

    setApiKeyLoading(true);
    setApiKeyError(null);

    try {
      const res = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: apiKeyProvider,
          api_key: apiKeyInput.trim(),
        }),
      });

      if (res.ok) {
        // Refresh identities to show connected state
        await fetchUnifiedUser();
        setShowApiKeyModal(false);
        setApiKeyInput('');
        setApiKeyProvider(null);
      } else {
        const data = await res.json();
        setApiKeyError(data.error || 'Failed to save API key');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      setApiKeyError('Failed to save API key');
    } finally {
      setApiKeyLoading(false);
    }
  };

  // Remove API key for AI provider
  const removeApiKey = async (provider: string) => {
    if (!confirm('Are you sure you want to remove this API key?')) return;

    try {
      const res = await fetch(`/api/user/api-keys?provider=${provider}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchUnifiedUser();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to remove API key');
      }
    } catch (error) {
      console.error('Error removing API key:', error);
      alert('Failed to remove API key');
    }
  };

  // Connect wallet and link identity
  const connectAndLinkPhantom = async () => {
    // 1. Enforce Authentication First
    if (!user) {
      alert("Please sign in with Email or Socials first to attach a wallet.");
      return;
    }

    try {
      const phantom = (window as any).phantom?.solana;
      if (!phantom) {
        window.open('https://phantom.app/', '_blank');
        return;
      }

      // 2. Connect
      if (!phantom.isConnected) {
        await phantom.connect();
      }

      const address = phantom.publicKey.toString();
      await linkWalletIdentity('phantom', address);
    } catch (error: any) {
      console.error('Phantom connection error:', error);
      // Suppress "User rejected the request" alerts as they are normal behavior
      if (error.code !== 4001) {
        alert(`Wallet connection failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const connectAndLinkMetaMask = async () => {
    // 1. Enforce Authentication First
    if (!user) {
      alert("Please sign in with Email or Socials first to attach a wallet.");
      return;
    }

    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        window.open('https://metamask.io/', '_blank');
        return;
      }
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts[0]) {
        await linkWalletIdentity('metamask', accounts[0]);
      }
    } catch (error: any) {
      console.error('MetaMask connection error:', error);
      if (error.code !== 4001) { // 4001 is user rejection
        alert(`Wallet connection failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const connectAndLinkYours = async () => {
    try {
      await connectYours();
      // The address will be available after connection via the context
    } catch (error) {
      console.error('Yours wallet connection error:', error);
    }
  };

  // Link Yours wallet when it connects
  useEffect(() => {
    if (isYoursConnected && addresses?.bsvAddress && unifiedUser) {
      // Check if already linked
      const alreadyLinked = linkedIdentities.some(
        i => i.provider === 'yours' && i.provider_user_id === addresses.bsvAddress
      );
      if (!alreadyLinked) {
        linkWalletIdentity('yours', addresses.bsvAddress);
      }
    }
  }, [isYoursConnected, addresses?.bsvAddress, unifiedUser]);



  // Note: Data fetching is now handled in the auth check useEffect above
  // Identity tokens are fetched from /api/identity-tokens (only minted tokens)

  const handleCreateCompany = async () => {
    if (!newCompanyName.trim() || creatingCompany) return;

    setCreatingCompany(true);
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCompanyName.trim(),
          companies_house_number: newCompanyNumber.trim() || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newCompany: Company = {
          id: data.company.id,
          name: data.company.name,
          companies_house_number: data.company.companies_house_number || 'Pending',
          status: data.company.status || 'active',
          tokens: [],
        };
        setCompanies([newCompany, ...companies]);
        setNewCompanyName('');
        setNewCompanyNumber('');
        setShowCreateCompany(false);
      } else {
        const error = await res.json();
        console.error('Failed to create company:', error);
        alert(error.error || 'Failed to create company');
      }
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Failed to create company');
    } finally {
      setCreatingCompany(false);
    }
  };

  const handleCreateToken = async () => {
    if (!selectedCompany || !newTokenSymbol.trim() || !newTokenName.trim() || creatingToken) return;

    // Determine the share class to use
    const shareClass = newTokenShareClass === 'Other'
      ? newTokenCustomShareClass.trim() || 'Other'
      : newTokenShareClass;

    setCreatingToken(true);
    try {
      const res = await fetch(`/api/companies/${selectedCompany.id}/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: newTokenSymbol.trim().toUpperCase(),
          name: newTokenName.trim(),
          share_class: shareClass,
          total_supply: parseInt(newTokenSupply) || 1000,
          nominal_value: parseFloat(newTokenNominalValue) || 0.01,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newToken: CompanyToken = {
          id: data.token.id,
          symbol: data.token.symbol,
          name: data.token.name,
          share_class: data.token.share_class || 'Ordinary',
          total_supply: Number(data.token.total_supply) || 0,
          nominal_value: Number(data.token.nominal_value) || 0.01,
          is_deployed: Boolean(data.token.is_deployed),
          blockchain: data.token.blockchain || null,
          cap_table: [],
        };

        // Update selectedCompany with new token
        const updatedCompany = {
          ...selectedCompany,
          tokens: [...selectedCompany.tokens, newToken],
        };
        setSelectedCompany(updatedCompany);

        // Update companies list
        setCompanies(companies.map(c => c.id === selectedCompany.id ? updatedCompany : c));

        // Reset form
        setNewTokenSymbol('');
        setNewTokenName('');
        setNewTokenShareClass('Ordinary');
        setNewTokenCustomShareClass('');
        setNewTokenSupply('1000');
        setNewTokenNominalValue('0.01');
        setShowCreateToken(false);
      } else {
        const error = await res.json();
        console.error('Failed to create token:', error);
        alert(error.error || 'Failed to create token');
      }
    } catch (error) {
      console.error('Error creating token:', error);
      alert('Failed to create token');
    } finally {
      setCreatingToken(false);
    }
  };

  const handleDeleteCompany = async (companyId: string, companyName: string) => {
    if (!confirm(`Are you sure you want to delete "${companyName}"? This will permanently delete the company and all associated tokens and cap table data.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/companies/${companyId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Remove company from local state
        setCompanies(companies.filter(c => c.id !== companyId));
      } else {
        const error = await res.json();
        console.error('Failed to delete company:', error);
        alert(error.error || 'Failed to delete company');
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Failed to delete company');
    }
  };

  const handleEnableMfa = async () => {
    setMfaLoading(true);
    setMfaError(null);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;
      setMfaEnrollment(data);
      setShowMfaModal(true);
    } catch (e: any) {
      console.error(e);
      setMfaError(e.message);
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (!mfaEnrollment) return;
    setMfaLoading(true);
    setMfaError(null);
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaEnrollment.id,
        code: mfaCode
      });
      if (error) throw error;
      setIsMfaEnabled(true);
      setShowMfaModal(false);
      setMfaEnrollment(null);
      setMfaCode('');
      alert('Two-Factor Authentication Enabled!');
    } catch (e: any) {
      console.error(e);
      setMfaError(e.message || 'Invalid code');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!confirm('Are you sure you want to disable 2FA? Your account will be less secure.')) return;
    setMfaLoading(true);
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors && factors.totp.length > 0) {
        const factorId = factors.totp[0].id;
        const { error } = await supabase.auth.mfa.unenroll({ factorId });
        if (error) throw error;
        setIsMfaEnabled(false);
        alert('Two-Factor Authentication Disabled');
      }
    } catch (e: any) {
      setMfaError(e.message);
    } finally {
      setMfaLoading(false);
    }
  };

  // Load Wallet Logic
  const loadWalletConnections = () => {
    if (typeof window === 'undefined') return;
    const walletType = localStorage.getItem('walletType');
    const walletAddress = localStorage.getItem('walletAddress');
    if (walletType && walletAddress) {
      setWalletConnections({ type: walletType as 'phantom' | 'metamask', address: walletAddress });
    }
  };
  useEffect(() => {
    loadWalletConnections();
  }, []);

  if (!mounted || !isClient || loading) return null;
  // Allow Supabase users, HandCash users, and unified users (Twitter, wallets, etc.)
  if (!user && !handle && !unifiedUser) return null;

  const isDark = colorTheme === 'black';

  return (
    <>
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-8">
              <div>
                <h2 className="text-3xl font-bold uppercase tracking-tighter text-white mb-2">SYSTEM_OVERVIEW_CORE</h2>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em] font-bold">IDENTITY_SYNCHRONIZATION_ACTIVE</p>
              </div>
            </div>

            {/* Identity Tokens */}
            {identityTokens.length > 0 && (
              <div className="mb-12">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 font-mono">IDENTITY_MANIFEST_TOKENS</h3>
                <div className="grid grid-cols-1 gap-[1px] bg-zinc-900 border border-zinc-900">
                  {identityTokens.map((token) => (
                    <div key={token.id} className="p-6 flex items-center justify-between bg-black group hover:bg-zinc-950 transition-all">
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 flex items-center justify-center text-xs font-bold border ${token.source === 'handcash' ? 'bg-green-950/20 border-green-900 text-green-500' :
                          token.source === 'twitter' ? 'bg-blue-950/20 border-blue-900 text-blue-400' :
                            token.source === 'google' ? 'bg-red-950/20 border-red-900 text-red-500' :
                              token.source === 'discord' ? 'bg-indigo-950/20 border-indigo-900 text-indigo-500' :
                                token.source === 'github' ? 'bg-zinc-900 border-zinc-800 text-white' :
                                  token.source === 'linkedin' ? 'bg-blue-950/20 border-blue-900 text-blue-600' :
                                    token.source === 'phantom' ? 'bg-purple-950/20 border-purple-900 text-purple-500' :
                                      token.source === 'metamask' ? 'bg-orange-950/20 border-orange-900 text-orange-500' :
                                        token.source === 'yours' ? 'bg-blue-950/20 border-blue-900 text-blue-500' :
                                          'bg-zinc-900/50 border-zinc-800 text-zinc-500'
                          }`}>
                          {token.source === 'handcash' && <FiZap size={20} />}
                          {token.source === 'twitter' && <FaTwitter size={20} />}
                          {token.source === 'google' && <FaGoogle size={20} />}
                          {token.source === 'discord' && <FaDiscord size={20} />}
                          {token.source === 'github' && <FaGithub size={20} />}
                          {token.source === 'linkedin' && <FaLinkedin size={20} />}
                          {token.source === 'phantom' && <FaWallet size={20} />}
                          {token.source === 'metamask' && <FaWallet size={20} />}
                          {token.source === 'yours' && <FaWallet size={20} />}
                        </div>
                        <div>
                          <div className="text-xl font-bold uppercase tracking-tighter text-white mb-1 font-mono">{token.symbol}</div>
                          <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{token.display_name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {token.blockchain && (
                          <span className="text-[9px] px-2 py-1 uppercase font-bold font-mono bg-zinc-900 text-zinc-500 border border-zinc-800">
                            {token.blockchain}
                          </span>
                        )}
                        {token.is_deployed ? (
                          <span className="text-[9px] px-3 py-1.5 uppercase font-bold font-mono border border-green-900 bg-green-950/20 text-green-500 tracking-widest">
                            STATUS_DEPLOYED
                          </span>
                        ) : (
                          <button className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest bg-white text-black hover:bg-zinc-200 transition-all font-mono">
                            INITIALIZE_PROTOCOL_MINT
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                  }
                </div >
              </div >
            )}

            {/* Connections */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">CONNECTION_PROTOCOL_STATUS</h3>
                <button
                  onClick={() => router.push('/user/account?tab=settings')}
                  className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 hover:text-white transition-colors font-mono"
                >
                  MANAGE_NODES →
                </button>
              </div>
              <div className="border border-zinc-900 bg-zinc-950/30 p-2">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-px bg-zinc-900">
                  {/* Google */}
                  {(() => {
                    const linked = linkedIdentities.find(i => i.provider === 'supabase' && i.oauth_provider === 'google');
                    return (
                      <div className={`p-6 flex flex-col items-center gap-4 bg-black transition-all ${linked ? 'text-white' : 'opacity-20 grayscale'}`} title="Google">
                        <FaGoogle size={20} />
                        <span className="text-[8px] uppercase tracking-[0.2em] font-mono hidden sm:block">GOOGLE</span>
                        {linked && <div className="w-full h-px bg-white/20"></div>}
                      </div>
                    );
                  })()}
                  {/* Twitter */}
                  {(() => {
                    const linked = linkedIdentities.find(i => i.provider === 'twitter' || (i.provider === 'supabase' && i.oauth_provider === 'twitter'));
                    return (
                      <div className={`p-6 flex flex-col items-center gap-4 bg-black transition-all ${linked ? 'text-white' : 'opacity-20 grayscale'}`} title="X / Twitter">
                        <FaTwitter size={20} />
                        <span className="text-[8px] uppercase tracking-[0.2em] font-mono hidden sm:block">X_CORP</span>
                        {linked && <div className="w-full h-px bg-white/20"></div>}
                      </div>
                    );
                  })()}
                  {/* Discord */}
                  {(() => {
                    const linked = linkedIdentities.find(i => i.provider === 'supabase' && i.oauth_provider === 'discord');
                    return (
                      <div className={`p-6 flex flex-col items-center gap-4 bg-black transition-all ${linked ? 'text-white' : 'opacity-20 grayscale'}`} title="Discord">
                        <FaDiscord size={20} />
                        <span className="text-[8px] uppercase tracking-[0.2em] font-mono hidden sm:block">DISCORD</span>
                        {linked && <div className="w-full h-px bg-white/20"></div>}
                      </div>
                    );
                  })()}
                  {/* GitHub */}
                  {(() => {
                    const linked = linkedIdentities.find(i => i.provider === 'supabase' && i.oauth_provider === 'github');
                    return (
                      <div className={`p-6 flex flex-col items-center gap-4 bg-black transition-all ${linked ? 'text-white' : 'opacity-20 grayscale'}`} title="GitHub">
                        <FaGithub size={20} />
                        <span className="text-[8px] uppercase tracking-[0.2em] font-mono hidden sm:block">GITHUB</span>
                        {linked && <div className="w-full h-px bg-white/20"></div>}
                      </div>
                    );
                  })()}
                  {/* LinkedIn */}
                  {(() => {
                    const linked = linkedIdentities.find(i => i.provider === 'supabase' && i.oauth_provider === 'linkedin_oidc');
                    return (
                      <div className={`p-6 flex flex-col items-center gap-4 bg-black transition-all ${linked ? 'text-white' : 'opacity-20 grayscale'}`} title="LinkedIn">
                        <FaLinkedin size={20} />
                        <span className="text-[8px] uppercase tracking-[0.2em] font-mono hidden sm:block">LINKEDIN</span>
                        {linked && <div className="w-full h-px bg-white/20"></div>}
                      </div>
                    );
                  })()}
                  {/* HandCash */}
                  {(() => {
                    const linked = linkedIdentities.find(i => i.provider === 'handcash') || handle;
                    return (
                      <div className={`p-6 flex flex-col items-center gap-4 bg-black transition-all ${linked ? 'text-white' : 'opacity-20 grayscale'}`} title="HandCash">
                        <FiZap size={20} />
                        <span className="text-[8px] uppercase tracking-[0.2em] font-mono hidden sm:block">HANDCASH</span>
                        {linked && <div className="w-full h-px bg-white/20"></div>}
                      </div>
                    );
                  })()}
                  {/* Phantom */}
                  {(() => {
                    const linked = linkedIdentities.find(i => i.provider === 'phantom');
                    return (
                      <div className={`p-6 flex flex-col items-center gap-4 bg-black transition-all ${linked ? 'text-white' : 'opacity-20 grayscale'}`} title="Phantom">
                        <FaWallet size={20} />
                        <span className="text-[8px] uppercase tracking-[0.2em] font-mono hidden sm:block">PHANTOM</span>
                        {linked && <div className="w-full h-px bg-white/20"></div>}
                      </div>
                    );
                  })()}
                  {/* MetaMask */}
                  {(() => {
                    const linked = linkedIdentities.find(i => i.provider === 'metamask');
                    return (
                      <div className={`p-6 flex flex-col items-center gap-4 bg-black transition-all ${linked ? 'text-white' : 'opacity-20 grayscale'}`} title="MetaMask">
                        <FaWallet size={20} />
                        <span className="text-[8px] uppercase tracking-[0.2em] font-mono hidden sm:block">METAMASK</span>
                        {linked && <div className="w-full h-px bg-white/20"></div>}
                      </div>
                    );
                  })()}
                  {/* Yours */}
                  {(() => {
                    const linked = linkedIdentities.find(i => i.provider === 'yours') || isYoursConnected;
                    return (
                      <div className={`p-6 flex flex-col items-center gap-4 bg-black transition-all ${linked ? 'text-white' : 'opacity-20 grayscale'}`} title="Yours Wallet">
                        <FaWallet size={20} />
                        <span className="text-[8px] uppercase tracking-[0.2em] font-mono hidden sm:block">YOURS</span>
                        {linked && <div className="w-full h-px bg-white/20"></div>}
                      </div>
                    );
                  })()}
                  {/* Claude */}
                  {(() => {
                    const linked = linkedIdentities.find(i => i.provider === 'claude');
                    const enabled = unifiedUser?.ai_executive_enabled;
                    return (
                      <div className={`p-4 flex flex-col items-center gap-2 bg-black ${linked ? '' : 'opacity-20 grayscale'}`} title="Claude AI">
                        <ClaudeIcon size={18} className={linked ? 'text-white' : 'text-zinc-500'} />
                        <span className="text-[8px] uppercase tracking-[0.2em] font-mono hidden sm:block">CLAUDE</span>
                        {linked && enabled && <div className="w-1 h-1 bg-green-500"></div>}
                        {!enabled && <div className="w-1 h-1 bg-purple-500"></div>}
                      </div>
                    );
                  })()}
                  {/* OpenAI */}
                  {(() => {
                    const linked = linkedIdentities.find(i => i.provider === 'openai');
                    const enabled = unifiedUser?.ai_executive_enabled;
                    return (
                      <div className={`p-4 flex flex-col items-center gap-2 bg-black ${linked ? '' : 'opacity-20 grayscale'}`} title="OpenAI">
                        <OpenAIIcon size={18} className={linked ? 'text-white' : 'text-zinc-500'} />
                        <span className="text-[8px] uppercase tracking-[0.2em] font-mono hidden sm:block">OPENAI</span>
                        {linked && enabled && <div className="w-1 h-1 bg-green-500"></div>}
                        {!enabled && <div className="w-1 h-1 bg-purple-500"></div>}
                      </div>
                    );
                  })()}
                  {/* Gemini */}
                  {(() => {
                    const linked = linkedIdentities.find(i => i.provider === 'gemini');
                    const enabled = unifiedUser?.ai_executive_enabled;
                    return (
                      <div className={`p-4 flex flex-col items-center gap-2 bg-black ${linked ? '' : 'opacity-20 grayscale'}`} title="Gemini">
                        <GeminiIcon size={18} className={linked ? 'text-white' : 'text-zinc-500'} />
                        <span className="text-[8px] uppercase tracking-[0.2em] font-mono hidden sm:block">GEMINI</span>
                        {linked && enabled && <div className="w-1 h-1 bg-green-500"></div>}
                        {!enabled && <div className="w-1 h-1 bg-purple-500"></div>}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-900 border border-zinc-900 mb-12">
              <div className="bg-black p-8">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4 font-mono">NODE_COUNT_COMPANIES</div>
                <div className="text-4xl font-bold text-white tracking-tighter font-mono">{companies.length}</div>
              </div>
              <div className="bg-black p-8">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4 font-mono">PROTOCOL_CLASSES</div>
                <div className="text-4xl font-bold text-white tracking-tighter font-mono">{companies.reduce((acc, c) => acc + c.tokens.length, 0) + identityTokens.length}</div>
              </div>
              <div className="bg-black p-8">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4 font-mono">GLOBAL_SHAREHOLDERS</div>
                <div className="text-4xl font-bold text-white tracking-tighter font-mono">
                  {companies.reduce((acc, c) => acc + c.tokens.reduce((t, token) => t + token.cap_table.length, 0), 0)}
                </div>
              </div>
              <div className="bg-black p-8">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4 font-mono">ON_CHAIN_ASSETS</div>
                <div className="text-4xl font-bold text-white tracking-tighter font-mono">
                  {companies.reduce((acc, c) => acc + c.tokens.filter(t => t.is_deployed).length, 0) + identityTokens.filter(t => t.is_deployed).length}
                </div>
              </div>
            </div>

            {/* Companies Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">ENTITY_GOVERNANCE_SYSTEM</h3>
                <button
                  onClick={() => setShowCreateCompany(true)}
                  className="px-6 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono"
                >
                  INITIALIZE_NEW_ENTITY
                </button>
              </div>
              {companies.length > 0 ? (
                <div className="grid grid-cols-1 gap-px bg-zinc-900 border border-zinc-900">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className="p-6 bg-black flex items-center justify-between group cursor-pointer hover:bg-zinc-950 transition-all"
                      onClick={() => { setSelectedCompany(company); router.push('/user/account?tab=companies'); }}
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-500">
                          <FaBuilding size={20} />
                        </div>
                        <div>
                          <div className="text-xl font-bold uppercase tracking-tighter text-white mb-1">{company.name}</div>
                          <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">REG_ID: {company.companies_house_number}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-bold font-mono text-white mb-1 uppercase tracking-widest">
                            {company.tokens.length} PROTOCOL_CLASS{company.tokens.length !== 1 ? 'ES' : ''}
                          </div>
                          <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                            {company.tokens.reduce((acc, t) => acc + t.cap_table.length, 0)} NODE_HOLDERS
                          </div>
                        </div>
                        <FiArrowRight size={20} className="text-zinc-800 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-zinc-800 bg-zinc-950/20 p-16 text-center">
                  <FaBuilding size={32} className="mx-auto text-zinc-700 mb-6" />
                  <p className="text-zinc-500 text-sm uppercase tracking-widest font-mono mb-8">NO_ENTITIES_DETECTED_IN_CLUSTER</p>
                  <button
                    onClick={() => setShowCreateCompany(true)}
                    className="px-8 py-4 border border-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-900 transition-all font-mono"
                  >
                    ESTABLISH_PRIMARY_ENTITY
                  </button>
                </div>
              )}
            </div>
          </motion.div >
        )}

        {
          activeTab === 'account' && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <div>
                <h2 className="text-3xl font-bold uppercase tracking-tighter text-white mb-2">USER_IDENTITY_CORE</h2>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em] font-bold">PARAMETER_SPECIFICATION_MANIFEST</p>
              </div>

              <div className="border border-zinc-900 bg-black p-8 space-y-12">
                {/* Basic Info */}
                <div className="space-y-8">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">SPEC_CORE_ATTRIBUTES</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 font-mono">
                        ID_USERNAME
                      </label>
                      <input
                        type="text"
                        value={profileUsername}
                        onChange={(e) => setProfileUsername(e.target.value)}
                        placeholder="OPERATOR_X"
                        className="w-full px-4 py-4 text-xs font-mono bg-zinc-950 border border-zinc-900 text-white focus:outline-none focus:border-white placeholder-zinc-800 transition-all"
                      />
                      <p className="text-[9px] mt-2 text-zinc-600 font-mono uppercase tracking-widest">PRIMARY_NETWORK_HANDLE</p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 font-mono">
                        SPEC_OPERATIONAL_ROLE
                      </label>
                      <input
                        type="text"
                        value={profileRole}
                        onChange={(e) => setProfileRole(e.target.value)}
                        placeholder="CEO_FOUNDER"
                        className="w-full px-4 py-4 text-xs font-mono bg-zinc-950 border border-zinc-900 text-white focus:outline-none focus:border-white placeholder-zinc-800 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 font-mono">
                        ENTITY_AFFILIATION
                      </label>
                      <input
                        type="text"
                        value={profileCompanyName}
                        onChange={(e) => setProfileCompanyName(e.target.value)}
                        placeholder="PRIMARY_LABS_INC"
                        className="w-full px-4 py-4 text-xs font-mono bg-zinc-950 border border-zinc-900 text-white focus:outline-none focus:border-white placeholder-zinc-800 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 font-mono">
                        GEOGRAPHIC_NODE
                      </label>
                      <input
                        type="text"
                        value={profileLocation}
                        onChange={(e) => setProfileLocation(e.target.value)}
                        placeholder="LDN_UK_CLUSTER"
                        className="w-full px-4 py-4 text-xs font-mono bg-zinc-950 border border-zinc-900 text-white focus:outline-none focus:border-white placeholder-zinc-800 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 font-mono">
                      IDENTITY_BIO_DATA
                    </label>
                    <textarea
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value)}
                      placeholder="INITIALIZE_BIO_STREAM..."
                      rows={4}
                      className="w-full px-4 py-4 text-xs font-mono bg-zinc-950 border border-zinc-900 text-white focus:outline-none focus:border-white placeholder-zinc-800 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-8 pt-12 border-t border-zinc-900">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">NETWORK_EXTERNAL_LINKS</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 font-mono">
                        DNS_ENDPOINT
                      </label>
                      <input
                        type="url"
                        value={profileWebsite}
                        onChange={(e) => setProfileWebsite(e.target.value)}
                        placeholder="https://protocol-x.com"
                        className="w-full px-4 py-4 text-xs font-mono bg-zinc-950 border border-zinc-900 text-white focus:outline-none focus:border-white placeholder-zinc-800 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 font-mono">
                        X_PROTO_HANDLE
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-600">@</span>
                        <input
                          type="text"
                          value={profileTwitter}
                          onChange={(e) => setProfileTwitter(e.target.value)}
                          placeholder="OPERATOR_X"
                          className="w-full pl-10 pr-4 py-4 text-xs font-mono bg-zinc-950 border border-zinc-900 text-white focus:outline-none focus:border-white placeholder-zinc-800 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 font-mono">
                      LINKEDIN_PROFESSIONAL_NODE
                    </label>
                    <input
                      type="url"
                      value={profileLinkedin}
                      onChange={(e) => setProfileLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/operator-x"
                      className="w-full px-4 py-4 text-xs font-mono bg-zinc-950 border border-zinc-900 text-white focus:outline-none focus:border-white placeholder-zinc-800 transition-all"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-8 border-t border-zinc-900 flex items-center justify-between">
                  {profileSaved && (
                    <span className="text-[10px] font-bold font-mono text-green-500 uppercase tracking-widest flex items-center gap-2">
                      <FiCheck size={12} /> PROTOCOL_REPLICATED_SUCCESS
                    </span>
                  )}
                  <div />
                  <button
                    onClick={() => {
                      setSavingProfile(true);
                      setTimeout(() => {
                        setSavingProfile(false);
                        setProfileSaved(true);
                        setTimeout(() => setProfileSaved(false), 3000);
                      }, 1000);
                    }}
                    disabled={savingProfile}
                    className="px-8 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono disabled:opacity-50"
                  >
                    {savingProfile ? 'EXECUTING_SAVE...' : 'COMMIT_PROFILE_CHANGES'}
                  </button>
                </div>
              </div>

              {/* Founder Network Info */}
              <div className="border border-zinc-900 bg-zinc-950/20 p-8">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white mb-4 font-mono">NETWORK_VISIBILITY_PROTOCOL</h4>
                <p className="text-xs text-zinc-500 font-mono uppercase leading-relaxed">
                  YOUR_PROFILE_IS_VISIBLE_TO_AUTH_FOUNDERS_AND_NODES. COMPLETE_SPEC_TO_INCREASE_CLUSTER_DISCOVERY.
                </p>
              </div>
            </motion.div>
          )
        }

        {/* Repos Tab */}
        {
          activeTab === 'repos' && (
            <motion.div
              key="repos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <ReposTab isDark={isDark} />
            </motion.div>
          )
        }

        {
          activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-8">
                <div>
                  <h2 className="text-3xl font-bold uppercase tracking-tighter text-white mb-2">ACTIVE_PROJECT_NODES</h2>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em] font-bold">DAO_GOVERNANCE_ENTITIES</p>
                </div>
                <Link
                  href="/projects/new"
                  className="px-6 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono"
                >
                  INITIALIZE_NEW_PROJECT
                </Link>
              </div>

              {/* Projects List - Coming Soon */}
              <div className="border border-dashed border-zinc-900 bg-zinc-950/20 p-24 text-center">
                <FaRobot size={48} className="mx-auto text-zinc-800 mb-8" />
                <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] font-mono mb-4">SYSTEM_NODES_EMPTY</h3>
                <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest max-w-md mx-auto mb-12 leading-relaxed">
                  CREATE_PROJECT_TO_TOKENIZE_SOCIAL_PRESENCE_ATTACH_AI_AGENTS_ISSUE_GOVERNANCE_MANIFESTS
                </p>
                <Link
                  href="/projects/new"
                  className="px-8 py-4 border border-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-900 transition-all font-mono"
                >
                  ESTABLISH_PRIMARY_PROJECT
                </Link>
              </div>
            </motion.div>
          )
        }

        {
          activeTab === 'investments' && (
            <motion.div
              key="investments"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-8">
                <div>
                  <h2 className="text-3xl font-bold uppercase tracking-tighter text-white mb-2">CAP_TABLE_POSITIONS</h2>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em] font-bold">EQUITY_HOLDING_MANIFEST</p>
                </div>
                <Link
                  href="/mint"
                  className="px-8 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono flex items-center gap-2"
                >
                  BROWSE_PROJECTS <FiArrowRight size={12} />
                </Link>
              </div>

              <div className="p-8 border border-zinc-900 bg-zinc-950/20 text-zinc-500 text-[10px] uppercase font-mono font-bold tracking-widest leading-relaxed">
                VIEW_AND_MANAGE_ALL_PRIMARY_EQUITY_POSITIONS_VOTING_RIGHTS_AND_INVESTMENT_LIFECYCLE_METRICS.
              </div>

              {/* Multi-Chain Holdings */}
              <HoldingsDisplay
                walletAddress={isYoursConnected ? addresses?.bsvAddress : undefined}
                walletProvider={isYoursConnected ? 'yours' : undefined}
                isDark={isDark}
              />
            </motion.div>
          )
        }

        {
          activeTab === 'boardroom' && (
            <motion.div
              key="boardroom"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-8">
                <div>
                  <h2 className="text-3xl font-bold uppercase tracking-tighter text-white mb-2">GOVERNANCE_CHAMBERS</h2>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em] font-bold">TOKEN_GATED_SHAREHOLDER_PROTOCOLS</p>
                </div>
                <Link
                  href="/boardroom"
                  className="px-8 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono flex items-center gap-2"
                >
                  <FaUsers size={12} /> ACCESS_BOARDROOM_NODE
                </Link>
              </div>

              <div className="p-8 border border-zinc-900 bg-zinc-950/20 text-zinc-500 text-[10px] uppercase font-mono font-bold tracking-widest leading-relaxed">
                SYNCHRONIZED_COMMUNICATION_CHANNELS_FOR_SHAREHOLDER_GOVERNANCE. INTEGRATED_TELEMETRY_ACROSS_WHATSAPP_TELEGRAM_AND_DISCORD_PLATFORMS.
              </div>

              {/* Connected Wallets for Boardroom Access */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">WALLET_CONNECTION_MANIFEST</h3>
                <div className="grid grid-cols-1 gap-px bg-zinc-900 border border-zinc-900">
                  {linkedIdentities.filter(i => ['phantom', 'metamask', 'yours', 'okx'].includes(i.provider)).length > 0 ? (
                    linkedIdentities.filter(i => ['phantom', 'metamask', 'yours', 'okx'].includes(i.provider)).map(identity => (
                      <div key={identity.id} className="flex items-center justify-between px-8 py-6 bg-black group hover:bg-zinc-950 transition-all">
                        <div className="flex items-center gap-4">
                          <FaWallet size={16} className="text-zinc-600 group-hover:text-white transition-colors" />
                          <div>
                            <span className="text-xs font-bold text-white uppercase font-mono tracking-widest">{identity.provider}</span>
                            <span className="text-[10px] text-zinc-600 font-mono ml-4 uppercase">
                              ID: {identity.provider_user_id?.slice(0, 8)}...{identity.provider_user_id?.slice(-8)}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] px-3 py-1.5 uppercase font-bold font-mono border border-green-900 bg-green-950/20 text-green-500 tracking-widest">
                          STATUS_CONNECTED
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center bg-black">
                      <FaWallet size={32} className="mx-auto mb-6 text-zinc-800" />
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-2xl mx-auto">
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">NO_WALLET_NODES_DETECTED_IN_CLUSTER</p>
                        <button
                          onClick={() => router.push('/user/account?tab=settings')}
                          className="px-6 py-3 border border-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-900 transition-all font-mono"
                        >
                          INITIALIZE_CONNECTION →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Your Boardrooms */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">ACTIVE_GOVERNANCE_NODES</h3>
                <div className="border border-dashed border-zinc-900 bg-zinc-950/20 p-24 text-center">
                  <FaUsers size={48} className="mx-auto mb-8 text-zinc-800" />
                  <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] font-mono mb-4">MEMBERSHIP_EMPTY</h3>
                  <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest leading-relaxed">
                    ACQUIRE_PROJECT_EQUITY_TO_INITIALIZE_BOARDROOM_ACCESS_PROTOCOL.
                  </p>
                </div>
              </div>
            </motion.div>
          )
        }

        {
          activeTab === 'companies' && (
            <motion.div
              key="companies"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {selectedCompany ? (
                <>
                  {/* Back button */}
                  <button
                    onClick={() => { setSelectedCompany(null); setSelectedToken(null); }}
                    className={`text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1 ${isDark ? 'hover:text-white' : 'hover:text-black'}`}
                  >
                    ← Back to Companies
                  </button>

                  {/* Company Header */}
                  <div className={`border p-6 ${isDark ? 'border-gray-800 bg-black text-white' : 'border-gray-200 bg-white text-black'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{selectedCompany.name}</h3>
                        <div className="text-sm text-gray-500 font-mono mt-1">
                          Companies House #{selectedCompany.companies_house_number}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-[10px] uppercase tracking-wide ${selectedCompany.status === 'active'
                        ? (isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700')
                        : (isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600')
                        }`}>
                        {selectedCompany.status}
                      </span>
                    </div>
                  </div>

                  {/* Token Classes */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Share Classes / Tokens</h4>
                      <button
                        onClick={() => setShowCreateToken(true)}
                        className={`text-xs px-3 py-1 transition-colors uppercase tracking-wide flex items-center gap-1 ${isDark ? 'text-white bg-gray-800 hover:bg-gray-700' : 'text-black bg-gray-100 hover:bg-gray-200'}`}
                      >
                        <FaPlus size={10} /> Add Token
                      </button>
                    </div>
                    <div className="grid gap-4">
                      {selectedCompany.tokens.map((token) => (
                        <div
                          key={token.id}
                          className={`border p-4 cursor-pointer transition-colors ${isDark ? 'bg-black text-white' : 'bg-white text-black'
                            } ${selectedToken?.id === token.id
                              ? (isDark ? 'border-white' : 'border-black')
                              : (isDark ? 'border-gray-800 hover:border-gray-600' : 'border-gray-200 hover:border-gray-400')
                            }`}
                          onClick={() => setSelectedToken(selectedToken?.id === token.id ? null : token)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`text-lg font-mono font-bold ${isDark ? 'text-white' : 'text-black'}`}>{token.symbol}</span>
                              <span className="text-sm text-gray-500">{token.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs px-2 py-1 ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{token.share_class}</span>
                              {token.is_deployed && (
                                <span className={`text-xs px-2 py-1 uppercase ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>
                                  {token.blockchain}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 flex gap-6 text-sm">
                            <div>
                              <span className="text-gray-500">Supply:</span>{' '}
                              <span className={`font-mono ${isDark ? 'text-white' : 'text-black'}`}>{token.total_supply.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Nominal:</span>{' '}
                              <span className={`font-mono ${isDark ? 'text-white' : 'text-black'}`}>£{token.nominal_value}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Holders:</span>{' '}
                              <span className={`font-mono ${isDark ? 'text-white' : 'text-black'}`}>{token.cap_table.length}</span>
                            </div>
                          </div>

                          {/* Cap Table (expanded) */}
                          <AnimatePresence>
                            {selectedToken?.id === token.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                    <FiPieChart size={12} /> Cap Table
                                  </h5>
                                  <button className={`text-xs text-gray-500 uppercase tracking-wide ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>
                                    Export CSV
                                  </button>
                                </div>
                                <div className={`overflow-x-auto ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
                                  <table className={`w-full text-sm ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
                                    <thead>
                                      <tr className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                                        <th className="text-left py-2 text-xs text-gray-500 uppercase tracking-wide font-normal">Holder</th>
                                        <th className="text-right py-2 text-xs text-gray-500 uppercase tracking-wide font-normal">Shares</th>
                                        <th className="text-right py-2 text-xs text-gray-500 uppercase tracking-wide font-normal">%</th>
                                        <th className="text-right py-2 text-xs text-gray-500 uppercase tracking-wide font-normal">Cert #</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {token.cap_table.map((entry) => (
                                        <tr key={entry.id} className={`border-b ${isDark ? 'border-gray-800/50' : 'border-gray-100'}`}>
                                          <td className="py-2">
                                            <div className="font-medium">{entry.holder_name}</div>
                                            <div className="text-xs text-gray-500">{entry.holder_email}</div>
                                          </td>
                                          <td className="text-right py-2 font-mono">{entry.shares_held.toLocaleString()}</td>
                                          <td className="text-right py-2 font-mono">{entry.percentage.toFixed(2)}%</td>
                                          <td className="text-right py-2 font-mono text-xs text-gray-500">{entry.share_certificate_number}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot>
                                      <tr className="font-bold">
                                        <td className="py-2">Total</td>
                                        <td className="text-right py-2 font-mono">{token.total_supply.toLocaleString()}</td>
                                        <td className="text-right py-2 font-mono">100.00%</td>
                                        <td></td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Companies List */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your Companies</h3>
                    <button
                      onClick={() => setShowCreateCompany(true)}
                      className="text-xs px-4 py-2 transition-colors uppercase tracking-wide flex items-center gap-2 font-bold hover:opacity-80"
                      style={{ backgroundColor: '#fff', color: '#000' }}
                    >
                      <FaPlus size={10} /> Register Company
                    </button>
                  </div>
                  <div className={`border divide-y ${isDark ? 'border-gray-800 divide-gray-800 bg-black text-white' : 'border-gray-200 divide-gray-200 bg-white text-black'}`}>
                    {companies.map((company) => (
                      <div
                        key={company.id}
                        className={`p-4 cursor-pointer transition-colors ${isDark ? 'hover:bg-gray-900/50' : 'hover:bg-gray-50'}`}
                        onClick={() => setSelectedCompany(company)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                              <FaBuilding size={14} className="text-gray-400" />
                              {company.name}
                            </div>
                            <div className="text-xs text-gray-500 font-mono mt-1">#{company.companies_house_number}</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                                {company.tokens.map(t => t.symbol).join(', ') || '-'}
                              </div>
                              <div className="text-xs text-gray-500">{company.tokens.length} share class{company.tokens.length !== 1 ? 'es' : ''}</div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCompany(company.id, company.name);
                              }}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete Company"
                            >
                              <FiTrash size={16} />
                            </button>
                            <FiArrowRight size={16} className="text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Company Tokens */}
                  {
                    companies.flatMap(company =>
                      company.tokens.map(token => (
                        <div key={token.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className={`font-bold font-mono text-lg ${isDark ? 'text-white' : 'text-black'}`}>{token.symbol}</div>
                              <div className="text-xs text-gray-500">{company.name} · {token.share_class}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className={`font-mono ${isDark ? 'text-white' : 'text-black'}`}>{token.total_supply.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">total supply</div>
                              </div>
                              {token.is_deployed ? (
                                <span className={`text-xs px-2 py-1 uppercase font-bold ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>
                                  {token.blockchain}
                                </span>
                              ) : (
                                <span className={`text-xs px-2 py-1 uppercase ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                  Not Deployed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )))
                  }
                  {/* Empty state */}
                  {
                    identityTokens.length === 0 && companies.flatMap(c => c.tokens).length === 0 && (
                      <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FaCoins size={24} className="mx-auto mb-3 opacity-50" />
                        <p className="text-sm mb-2">No tokens created yet</p>
                        <p className="text-xs">Add a company to create share class tokens, or create a project to tokenize</p>
                      </div>
                    )
                  }
                </>
              )}
            </motion.div>
          )
        }

        {
          activeTab === 'kyc' && (
            <motion.div
              key="kyc"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* KYC Status Banner */}
              <div className={`border p-6 ${kycStatus === 'verified' ? (isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200') :
                kycStatus === 'pending' ? (isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200') :
                  kycStatus === 'rejected' ? (isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200') :
                    (isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200')
                }`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-full ${kycStatus === 'verified' ? 'bg-green-500/20' :
                    kycStatus === 'pending' ? 'bg-yellow-500/20' :
                      kycStatus === 'rejected' ? 'bg-red-500/20' :
                        'bg-gray-500/20'
                    }`}>
                    <FiShield size={24} className={
                      kycStatus === 'verified' ? 'text-green-500' :
                        kycStatus === 'pending' ? 'text-yellow-500' :
                          kycStatus === 'rejected' ? 'text-red-500' :
                            'text-gray-500'
                    } />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-black'}`}>
                      {kycStatus === 'verified' ? 'Identity Verified' :
                        kycStatus === 'pending' ? 'Verification Pending' :
                          kycStatus === 'rejected' ? 'Verification Failed' :
                            'Identity Not Verified'}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {kycStatus === 'verified' ? 'Your identity has been verified. You have full access to all platform features.' :
                        kycStatus === 'pending' ? 'Your verification is being processed. This usually takes 1-2 business days.' :
                          kycStatus === 'rejected' ? 'Your verification was unsuccessful. Please try again or contact support.' :
                            'Complete identity verification to unlock all platform features.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* What KYC Unlocks */}
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>What Verification Unlocks</h3>
                <div className={`border divide-y ${isDark ? 'border-gray-800 divide-gray-800' : 'border-gray-200 divide-gray-200'}`}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FaBuilding size={14} className={kycStatus === 'verified' ? 'text-green-500' : 'text-gray-400'} />
                      <span>Company Registration</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 uppercase ${kycStatus === 'verified' ? (isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700') : (isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')}`}>
                      {kycStatus === 'verified' ? 'Unlocked' : 'Requires KYC'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FaCoins size={14} className={kycStatus === 'verified' ? 'text-green-500' : 'text-gray-400'} />
                      <span>Token Issuance</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 uppercase ${kycStatus === 'verified' ? (isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700') : (isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')}`}>
                      {kycStatus === 'verified' ? 'Unlocked' : 'Requires KYC'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FaWallet size={14} className={kycStatus === 'verified' ? 'text-green-500' : 'text-gray-400'} />
                      <span>Fiat Withdrawals</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 uppercase ${kycStatus === 'verified' ? (isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700') : (isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')}`}>
                      {kycStatus === 'verified' ? 'Unlocked' : 'Requires KYC'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FaUsers size={14} className={kycStatus === 'verified' ? 'text-green-500' : 'text-gray-400'} />
                      <span>Boardroom Voting</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 uppercase ${kycStatus === 'verified' ? (isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700') : (isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')}`}>
                      {kycStatus === 'verified' ? 'Unlocked' : 'Requires KYC'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FiPieChart size={14} className={kycStatus === 'verified' ? 'text-green-500' : 'text-gray-400'} />
                      <span>Investment Opportunities</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 uppercase ${kycStatus === 'verified' ? (isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700') : (isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')}`}>
                      {kycStatus === 'verified' ? 'Unlocked' : 'Requires KYC'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Start Verification */}
              {kycStatus === 'none' && (
                <div className={`border p-6 text-center ${isDark ? 'border-gray-800 bg-gradient-to-br from-blue-900/20 to-purple-900/20' : 'border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50'}`}>
                  <FiShield size={48} className={`mx-auto mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h4 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Start Identity Verification</h4>
                  <p className={`text-sm mb-6 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Complete a quick identity check to unlock full platform access. You&apos;ll need a valid government-issued ID and a few minutes.
                  </p>
                  <button
                    onClick={() => {
                      // TODO: Integrate with external KYC provider (e.g., Sumsub, Onfido, Veriff)
                      // For now, show a placeholder
                      alert('KYC integration coming soon. This will connect to an external verification provider.');
                    }}
                    className={`inline-flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-wide text-sm transition-colors ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                  >
                    <FiShield size={16} />
                    Begin Verification
                  </button>
                  <p className={`text-[10px] mt-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                    Powered by secure third-party verification. Your data is encrypted and never shared.
                  </p>
                </div>
              )}

              {/* Pending State */}
              {kycStatus === 'pending' && (
                <div className={`border p-6 text-center ${isDark ? 'border-yellow-800 bg-yellow-900/20' : 'border-yellow-200 bg-yellow-50'}`}>
                  <div className="animate-pulse">
                    <FiAlertCircle size={48} className="mx-auto mb-4 text-yellow-500" />
                  </div>
                  <h4 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Verification In Progress</h4>
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your documents are being reviewed. You&apos;ll receive an email notification once the verification is complete.
                  </p>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Estimated time: 1-2 business days
                  </div>
                </div>
              )}

              {/* Rejected State */}
              {kycStatus === 'rejected' && (
                <div className={`border p-6 text-center ${isDark ? 'border-red-800 bg-red-900/20' : 'border-red-200 bg-red-50'}`}>
                  <FiAlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                  <h4 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Verification Unsuccessful</h4>
                  <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    We couldn&apos;t verify your identity. This may be due to unclear documents or mismatched information.
                  </p>
                  <button
                    onClick={() => {
                      setKycStatus('none');
                    }}
                    className={`inline-flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-wide text-sm transition-colors ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Verified State */}
              {kycStatus === 'verified' && (
                <div className={`border p-6 ${isDark ? 'border-green-800 bg-green-900/20' : 'border-green-200 bg-green-50'}`}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-500/20">
                      <FiCheck size={24} className="text-green-500" />
                    </div>
                    <div>
                      <h4 className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>Verification Complete</h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Your identity was verified on {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Linked Assets */}
              {kycStatus === 'verified' && (
                <div>
                  <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Linked to Your Identity</h3>
                  <div className={`border divide-y ${isDark ? 'border-gray-800 divide-gray-800' : 'border-gray-200 divide-gray-200'}`}>
                    {companies.length > 0 && companies.map((company) => (
                      <div key={company.id} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <FaBuilding size={14} className="text-blue-500" />
                          <span>{company.name}</span>
                          <span className="text-xs text-gray-500 font-mono">{company.companies_house_number}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 uppercase ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>Verified Owner</span>
                      </div>
                    ))}
                    {linkedIdentities.filter(i => i.provider === 'phantom' || i.provider === 'metamask').map((wallet) => (
                      <div key={wallet.id} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <FaWallet size={14} className="text-purple-500" />
                          <span>{wallet.provider.charAt(0).toUpperCase() + wallet.provider.slice(1)} Wallet</span>
                          <span className="text-xs text-gray-500 font-mono">{wallet.provider_handle?.slice(0, 8)}...{wallet.provider_handle?.slice(-6)}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 uppercase ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>Linked</span>
                      </div>
                    ))}
                    {companies.length === 0 && linkedIdentities.filter(i => i.provider === 'phantom' || i.provider === 'metamask').length === 0 && (
                      <div className="px-4 py-6 text-center text-gray-500 text-sm">
                        No companies or wallets linked yet. Add them in the Companies and Connections tabs.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className={`border p-4 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <FiShield className="inline mr-1" size={14} />
                  KYC (Know Your Customer) verification helps us comply with regulations and protect all users on the platform. Your personal information is securely encrypted and handled by our trusted verification partner.
                </p>
              </div>
            </motion.div>
          )
        }

        {
          activeTab === 'connections' && (
            <motion.div
              key="connections"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Social Accounts */}
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Social Accounts</h3>
                <div className={`border divide-y ${isDark ? 'border-gray-800 divide-gray-800 bg-black text-white' : 'border-gray-200 divide-gray-200 bg-white text-black'}`}>
                  {/* Google */}
                  {(() => {
                    const linked = linkedIdentities.find(i => i.provider === 'supabase' && i.oauth_provider === 'google');
                    return (
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <FaGoogle size={16} className={`flex-shrink-0 ${linked ? 'text-red-500' : 'text-gray-400'}`} />
                          <span>Google</span>
                          {linked?.provider_email && (
                            <span className="text-xs text-gray-500 font-mono truncate">{linked.provider_email}</span>
                          )}
                        </div>
                        {linked ? (
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] px-2 py-0.5 uppercase ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>Connected</span>
                            {linkedIdentities.length > 1 && (
                              <button onClick={() => unlinkIdentity(linked.id)} className={`text-[10px] px-2 py-0.5 uppercase border ${isDark ? 'border-red-500 text-red-400 hover:bg-red-500/20' : 'border-red-600 text-red-600 hover:bg-red-50'}`}>Disconnect</button>
                            )}
                          </div>
                        ) : (
                          <button onClick={() => linkGoogle()} className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>Connect</button>
                        )}
                      </div>
                    );
                  })()}
                  {/* Twitter */}
                  {(() => {
                    const linked = linkedIdentities.find(i => i.provider === 'twitter' || (i.provider === 'supabase' && i.oauth_provider === 'twitter'));
                    return (
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <FaTwitter size={16} className={`flex-shrink-0 ${linked ? 'text-blue-400' : 'text-gray-400'}`} />
                          <span>X / Twitter</span>
                          {linked?.provider_handle && (
                            <span className="text-xs text-gray-500 font-mono truncate">{linked.provider_handle}</span>
                          )}
                        </div>
                        {linked ? (
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] px-2 py-0.5 uppercase ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>Connected</span>
                            {linkedIdentities.length > 1 && (
                              <button onClick={() => unlinkIdentity(linked.id)} className={`text-[10px] px-2 py-0.5 uppercase border ${isDark ? 'border-red-500 text-red-400 hover:bg-red-500/20' : 'border-red-600 text-red-600 hover:bg-red-50'}`}>Disconnect</button>
                            )}
                          </div>
                        ) : (
                          <button onClick={() => window.location.href = '/api/auth/twitter'} className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>Connect</button>
                        )}
                      </div>
                    );
                  })()}
                  {/* Discord */}
                  {(() => {
                    const linked = linkedIdentities.find(i => i.provider === 'supabase' && i.oauth_provider === 'discord');
                    return (
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <FaDiscord size={16} className={`flex-shrink-0 ${linked ? 'text-indigo-500' : 'text-gray-400'}`} />
                          <span>Discord</span>
                          {linked?.provider_handle && (
                            <span className="text-xs text-gray-500 font-mono truncate">{linked.provider_handle}</span>
                          )}
                        </div>
                        {linked ? (
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] px-2 py-0.5 uppercase ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>Connected</span>
                            {linkedIdentities.length > 1 && (
                              <button onClick={() => unlinkIdentity(linked.id)} className={`text-[10px] px-2 py-0.5 uppercase border ${isDark ? 'border-red-500 text-red-400 hover:bg-red-500/20' : 'border-red-600 text-red-600 hover:bg-red-50'}`}>Disconnect</button>
                            )}
                          </div>
                        ) : (
                          <button onClick={() => linkDiscord()} className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>Connect</button>
                        )}
                      </div>
                    );
                  })()}
                  {/* GitHub */}
                  {(() => {
                    const linked = linkedIdentities.find(i =>
                      i.provider === 'github_link' ||
                      (i.provider === 'supabase' && i.oauth_provider === 'github')
                    );
                    return (
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <FaGithub size={16} className={`flex-shrink-0 ${linked ? (isDark ? 'text-white' : 'text-black') : 'text-gray-400'}`} />
                          <span>GitHub</span>
                          {linked?.provider_handle && (
                            <span className="text-xs text-gray-500 font-mono truncate">@{linked.provider_handle}</span>
                          )}
                        </div>
                        {linked ? (
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] px-2 py-0.5 uppercase ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>Connected</span>
                            {linkedIdentities.length > 1 && (
                              <button onClick={() => unlinkIdentity(linked.id)} className={`text-[10px] px-2 py-0.5 uppercase border ${isDark ? 'border-red-500 text-red-400 hover:bg-red-500/20' : 'border-red-600 text-red-600 hover:bg-red-50'}`}>Disconnect</button>
                            )}
                          </div>
                        ) : (
                          <button onClick={() => window.location.href = '/api/link/github'} className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>Connect</button>
                        )}
                      </div>
                    );
                  })()}
                  {/* LinkedIn */}
                  {(() => {
                    const linked = linkedIdentities.find(i => i.provider === 'supabase' && i.oauth_provider === 'linkedin_oidc');
                    return (
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <FaLinkedin size={16} className={`flex-shrink-0 ${linked ? 'text-blue-600' : 'text-gray-400'}`} />
                          <span>LinkedIn</span>
                          {linked?.provider_email && (
                            <span className="text-xs text-gray-500 font-mono truncate">{linked.provider_email}</span>
                          )}
                        </div>
                        {linked ? (
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] px-2 py-0.5 uppercase ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>Connected</span>
                            {linkedIdentities.length > 1 && (
                              <button onClick={() => unlinkIdentity(linked.id)} className={`text-[10px] px-2 py-0.5 uppercase border ${isDark ? 'border-red-500 text-red-400 hover:bg-red-500/20' : 'border-red-600 text-red-600 hover:bg-red-50'}`}>Disconnect</button>
                            )}
                          </div>
                        ) : (
                          <button onClick={() => linkLinkedin()} className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>Connect</button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Wallets */}
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Wallets</h3>
                <div className={`border divide-y ${isDark ? 'border-gray-800 divide-gray-800 bg-black text-white' : 'border-gray-200 divide-gray-200 bg-white text-black'}`}>
                  {/* Phantom */}
                  {(() => {
                    const linked = linkedIdentities.find(i => i.provider === 'phantom');
                    return (
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`font-bold ${linked ? 'text-purple-500' : 'text-gray-400'}`}>P</span>
                          <span>Phantom</span>
                          <span className="text-xs text-gray-500">SOL</span>
                          {linked?.provider_handle && (
                            <span className="text-xs text-gray-500 font-mono">{linked.provider_handle}</span>
                          )}
                        </div>
                        {linked ? (
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] px-2 py-0.5 uppercase ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>Connected</span>
                            {linkedIdentities.length > 1 && (
                              <button onClick={() => unlinkIdentity(linked.id)} className={`text-[10px] px-2 py-0.5 uppercase border ${isDark ? 'border-red-500 text-red-400 hover:bg-red-500/20' : 'border-red-600 text-red-600 hover:bg-red-50'}`}>Disconnect</button>
                            )}
                          </div>
                        ) : (
                          <button onClick={connectAndLinkPhantom} className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>Connect</button>
                        )}
                      </div>
                    );
                  })()}
                  {/* MetaMask */}
                  {(() => {
                    const linked = linkedIdentities.find(i => i.provider === 'metamask');
                    return (
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`font-bold ${linked ? 'text-orange-500' : 'text-gray-400'}`}>M</span>
                          <span>MetaMask</span>
                          <span className="text-xs text-gray-500">ETH</span>
                          {linked?.provider_handle && (
                            <span className="text-xs text-gray-500 font-mono">{linked.provider_handle}</span>
                          )}
                        </div>
                        {linked ? (
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] px-2 py-0.5 uppercase ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>Connected</span>
                            {linkedIdentities.length > 1 && (
                              <button onClick={() => unlinkIdentity(linked.id)} className={`text-[10px] px-2 py-0.5 uppercase border ${isDark ? 'border-red-500 text-red-400 hover:bg-red-500/20' : 'border-red-600 text-red-600 hover:bg-red-50'}`}>Disconnect</button>
                            )}
                          </div>
                        ) : (
                          <button onClick={connectAndLinkMetaMask} className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>Connect</button>
                        )}
                      </div>
                    );
                  })()}
                  {/* HandCash */}
                  {(() => {
                    const linked = linkedIdentities.find(i => i.provider === 'handcash');
                    const isHandCashConnected = linked || handle;

                    const disconnectHandCash = async () => {
                      // Clear HandCash session/cookies to logout
                      document.cookie = 'b0ase_handcash_token=; Path=/; Max-Age=0';
                      document.cookie = 'b0ase_user_handle=; Path=/; Max-Age=0';
                      // Redirect to home (will require login again)
                      window.location.href = '/';
                    };

                    return (
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <FiZap size={16} className={isHandCashConnected ? 'text-green-500' : 'text-gray-400'} />
                          <span>HandCash</span>
                          <span className="text-xs text-gray-500">BSV</span>
                          {(linked?.provider_handle || handle) && (
                            <span className="text-xs text-gray-500 font-mono">{linked?.provider_handle || `$${handle}`}</span>
                          )}
                        </div>
                        {isHandCashConnected ? (
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] px-2 py-0.5 uppercase ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>Connected</span>
                            <button onClick={disconnectHandCash} className={`text-[10px] px-2 py-0.5 uppercase border ${isDark ? 'border-red-500 text-red-400 hover:bg-red-500/20' : 'border-red-600 text-red-600 hover:bg-red-50'}`}>Disconnect</button>
                          </div>
                        ) : (
                          <a href="/api/auth/handcash" className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>Connect</a>
                        )}
                      </div>
                    );
                  })()}
                  {/* Yours Wallet */}
                  {(() => {
                    const linked = linkedIdentities.find(i => i.provider === 'yours');
                    return (
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <FaWallet size={16} className={linked || isYoursConnected ? 'text-blue-500' : 'text-gray-400'} />
                          <span>Yours Wallet</span>
                          <span className="text-xs text-gray-500">BSV</span>
                          {(linked?.provider_handle || (isYoursConnected && addresses?.bsvAddress)) && (
                            <span className="text-xs text-gray-500 font-mono">
                              {linked?.provider_handle || `${addresses?.bsvAddress?.slice(0, 6)}...${addresses?.bsvAddress?.slice(-4)}`}
                            </span>
                          )}
                        </div>
                        {linked || isYoursConnected ? (
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] px-2 py-0.5 uppercase ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>Connected</span>
                            {isYoursConnected && !linked && (
                              <button onClick={() => linkWalletIdentity('yours', addresses?.bsvAddress || '', `${addresses?.bsvAddress?.slice(0, 6)}...${addresses?.bsvAddress?.slice(-4)}`)} className={`text-xs uppercase tracking-wide ml-2 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>Link</button>
                            )}
                            {linkedIdentities.length > 1 && linked && (
                              <button onClick={() => unlinkIdentity(linked.id)} className={`text-[10px] px-2 py-0.5 uppercase border ${isDark ? 'border-red-500 text-red-400 hover:bg-red-500/20' : 'border-red-600 text-red-600 hover:bg-red-50'}`}>Disconnect</button>
                            )}
                          </div>
                        ) : (
                          <button onClick={connectAndLinkYours} className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>Connect</button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Identity Monetization — shows when Twitter is connected */}
              {(() => {
                const twitterIdentity = linkedIdentities.find(
                  i => i.provider === 'twitter' || (i.provider === 'supabase' && i.oauth_provider === 'twitter')
                );
                if (!twitterIdentity) return null;
                const username = twitterIdentity.provider_handle?.replace('@', '') || '';
                if (!username) return null;

                return (
                  <div>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Identity Monetization</h3>
                    <TwitterTokenCard
                      username={username}
                      displayName={username}
                      isTokenized={twitterTokenStatus?.tokenized || false}
                      tokenId={twitterTokenStatus?.token_id}
                      totalSupply={twitterTokenStatus?.total_supply}
                      currentPriceSats={twitterTokenStatus?.current_price_sats}
                      onTokenized={() => {
                        // Re-fetch token status after tokenization
                        fetch(`/api/twitter/${username}/token`)
                          .then(res => res.ok ? res.json() : { tokenized: false })
                          .then(data => setTwitterTokenStatus(data))
                          .catch(() => {});
                      }}
                    />
                  </div>
                );
              })()}

              {/* AI Providers */}
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>AI Providers</h3>
                {unifiedUser?.ai_executive_enabled ? (
                  <>
                    <div className={`border divide-y ${isDark ? 'border-gray-800 divide-gray-800 bg-black text-white' : 'border-gray-200 divide-gray-200 bg-white text-black'}`}>
                      {/* Claude */}
                      {(() => {
                        const linked = linkedIdentities.find(i => i.provider === 'claude');
                        return (
                          <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3">
                              <ClaudeIcon size={16} className={linked ? 'text-orange-500' : 'text-gray-400'} />
                              <span>Claude</span>
                              <span className="text-xs text-gray-500">Anthropic</span>
                            </div>
                            {linked ? (
                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] px-2 py-0.5 uppercase ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>Connected</span>
                                <button onClick={() => removeApiKey('claude')} className={`text-[10px] px-2 py-0.5 uppercase border ${isDark ? 'border-red-500 text-red-400 hover:bg-red-500/20' : 'border-red-600 text-red-600 hover:bg-red-50'}`}>Remove</button>
                              </div>
                            ) : (
                              <button onClick={() => openApiKeyModal('claude')} className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>Add API Key</button>
                            )}
                          </div>
                        );
                      })()}
                      {/* OpenAI */}
                      {(() => {
                        const linked = linkedIdentities.find(i => i.provider === 'openai');
                        return (
                          <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3">
                              <OpenAIIcon size={16} className={linked ? 'text-green-500' : 'text-gray-400'} />
                              <span>OpenAI</span>
                              <span className="text-xs text-gray-500">GPT</span>
                            </div>
                            {linked ? (
                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] px-2 py-0.5 uppercase ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>Connected</span>
                                <button onClick={() => removeApiKey('openai')} className={`text-[10px] px-2 py-0.5 uppercase border ${isDark ? 'border-red-500 text-red-400 hover:bg-red-500/20' : 'border-red-600 text-red-600 hover:bg-red-50'}`}>Remove</button>
                              </div>
                            ) : (
                              <button onClick={() => openApiKeyModal('openai')} className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>Add API Key</button>
                            )}
                          </div>
                        );
                      })()}
                      {/* Gemini */}
                      {(() => {
                        const linked = linkedIdentities.find(i => i.provider === 'gemini');
                        return (
                          <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3">
                              <GeminiIcon size={16} className={linked ? 'text-blue-500' : 'text-gray-400'} />
                              <span>Gemini</span>
                              <span className="text-xs text-gray-500">Google</span>
                            </div>
                            {linked ? (
                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] px-2 py-0.5 uppercase ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>Connected</span>
                                <button onClick={() => removeApiKey('gemini')} className={`text-[10px] px-2 py-0.5 uppercase border ${isDark ? 'border-red-500 text-red-400 hover:bg-red-500/20' : 'border-red-600 text-red-600 hover:bg-red-50'}`}>Remove</button>
                              </div>
                            ) : (
                              <button onClick={() => openApiKeyModal('gemini')} className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>Add API Key</button>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <FiCpu className="inline mr-1" size={12} />
                      API keys enable AI agents to act on your behalf in boardrooms and automation workflows.
                    </p>
                  </>
                ) : (
                  <div className={`border p-6 text-center ${isDark ? 'border-gray-800 bg-gradient-to-br from-purple-900/20 to-blue-900/20' : 'border-gray-200 bg-gradient-to-br from-purple-50 to-blue-50'}`}>
                    <div className="flex justify-center gap-3 mb-4">
                      <ClaudeIcon size={24} className="text-orange-500" />
                      <OpenAIIcon size={24} className="text-green-500" />
                      <GeminiIcon size={24} className="text-blue-500" />
                    </div>
                    <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>AI Executive Suite</h4>
                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Connect Claude, OpenAI, and Gemini to power AI agents that can run your company - from boardroom decisions to automated trading.
                    </p>
                    <div className={`text-xs mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <div className="flex items-center justify-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1"><FiCheck size={12} className="text-green-500" /> AI CEO, CTO, CFO agents</span>
                        <span className="flex items-center gap-1"><FiCheck size={12} className="text-green-500" /> Autonomous trading</span>
                        <span className="flex items-center gap-1"><FiCheck size={12} className="text-green-500" /> Boardroom automation</span>
                      </div>
                    </div>
                    <Link
                      href="/packages"
                      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                    >
                      <FaRobot size={14} />
                      Upgrade to AI Executive
                    </Link>
                    <p className={`text-[10px] mt-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                      Starting at +£150/month on any automation tier
                    </p>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className={`border p-4 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Connect multiple accounts to access your profile from any of them. If you connect an account that belongs to another profile, you&apos;ll be prompted to merge the accounts.
                </p>
              </div>
            </motion.div>
          )
        }

        {/* Settings Tab */}
        {
          activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-8">
                <div>
                  <h2 className="text-3xl font-bold uppercase tracking-tighter text-white mb-2">SYSTEM_CONFIGURATION_PROTOCOLS</h2>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em] font-bold">OPERATIONAL_PARAMETER_ADJUSTMENT</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-px bg-zinc-900 border border-zinc-900">
                <div className="bg-black p-10">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-10 font-mono">SECURITY_AUTHENTICATION_LAYER</h3>

                  <div className="space-y-10">
                    {/* Security Section */}
                    <div className="pb-10 border-b border-zinc-900">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-widest font-mono mb-2">MULTI_FACTOR_AUTHENTICATION (2FA)</p>
                          <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest">
                            {isMfaEnabled ? 'ENRYPTION_PROTOCOL_ACTIVE: ACCOUNT_SECURED_VIA_TOTP.' : 'ADD_EXTRA_SECURITY_LAYER_TO_ACCOUNT_NODE.'}
                          </p>
                        </div>
                        {isMfaEnabled ? (
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold font-mono tracking-widest text-emerald-500 bg-emerald-950/20 border border-emerald-900 px-3 py-1 uppercase flex items-center gap-2">
                              <FiCheck /> PROTOCOL_ACTIVE
                            </span>
                            <button
                              onClick={handleDisableMfa}
                              disabled={mfaLoading}
                              className="px-6 py-3 text-[10px] border border-red-900 text-red-500 hover:bg-red-500 hover:text-white transition-all font-mono uppercase font-bold tracking-widest"
                            >
                              DISABLE_2FA
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleEnableMfa}
                            disabled={mfaLoading}
                            className="px-8 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono"
                          >
                            INITIALIZE_2FA_SETUP
                          </button>
                        )}
                      </div>
                    </div>

                    {/* API Keys Section */}
                    <div className="pb-10 border-b border-zinc-900">
                      <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono mb-4">API_ACCESS_KEY_MANIFEST</h4>
                      <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest mb-8">GENERATE_PROGRAMMATIC_TOKENS_FOR_EXTERNAL_API_AUTHENTICATION</p>

                      <ApiKeysSection isDark={isDark} />
                    </div>

                    {/* Theme */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-zinc-900">
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-widest font-mono mb-2">INTERFACE_AESTHETIC_MODE</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest">CUSTOMIZE_PRIMARY_UI_SKIN_AND_CONTRAST</p>
                      </div>
                      <div className="flex gap-4">
                        {(['black', 'white', 'blue'] as const).map(t => (
                          <button
                            key={t}
                            onClick={() => { }}
                            className={`w-10 h-10 border ${colorTheme === t ? 'border-white bg-zinc-800' : 'border-zinc-800 bg-black'} flex items-center justify-center group transition-all`}
                            title={t.toUpperCase()}
                          >
                            <div className={`w-4 h-4 ${t === 'black' ? 'bg-black border border-white/20' : t === 'white' ? 'bg-white' : 'bg-blue-600'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notifications */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-zinc-900">
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-widest font-mono mb-2">TELEMETRY_ALERT_PREFERENCES</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest">MANAGE_EVENT_ALERTS_AND_SYSTEM_UPDATES</p>
                      </div>
                      <button className="px-8 py-4 border border-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-900 transition-all font-mono">
                        CONFIGURE_STREAM
                      </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-4">
                      <h4 className="text-red-500 text-xs font-bold uppercase tracking-widest font-mono mb-6">TERMINATION_ZONE_UNSAFE</h4>
                      <div className="border border-red-900/40 bg-red-950/20 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                          <p className="text-xs font-bold text-red-500 uppercase tracking-widest font-mono mb-2">DELETE_ACCOUNT_IDENTITY</p>
                          <p className="text-[10px] text-red-900/80 uppercase font-mono tracking-widest leading-relaxed">
                            WARNING: PERMANENT_WIPE_OF_ALL_ASSOCIATED_REPOS_CONTENT_AND_PROJECTS.
                          </p>
                        </div>
                        <button className="px-8 py-4 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 transition-all font-mono">
                          EXECUTE_PURGE_PROTOCOL
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        }

        {
          activeTab === 'domains' && (
            <motion.div
              key="domains"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-bold uppercase tracking-wide ${isDark ? 'text-white' : 'text-black'}`}>Domain Management</h2>
                <button className={`text-xs px-4 py-2 uppercase font-bold transition-colors ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
                  Add Domain
                </button>
              </div>

              <div className={`border overflow-hidden ${isDark ? 'border-gray-800 bg-zinc-950' : 'border-gray-200 bg-white'}`}>
                <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'} flex items-center justify-between bg-black/5`}>
                  <div className="flex items-center gap-3">
                    <FiGlobe className="text-emerald-500" />
                    <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-black'}`}>b0ase.com</span>
                    <span className={`text-[10px] px-2 py-0.5 uppercase ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>Active</span>
                  </div>
                  <div className="text-[10px] uppercase font-bold text-gray-500">Registrar: Namecheap</div>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`text-[10px] uppercase tracking-wider font-bold ${isDark ? 'bg-black text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
                        <th className="px-4 py-3 border-b border-gray-800">Type</th>
                        <th className="px-4 py-3 border-b border-gray-800">Name</th>
                        <th className="px-4 py-3 border-b border-gray-800">Content</th>
                        <th className="px-4 py-3 border-b border-gray-800">TTL</th>
                        <th className="px-4 py-3 border-b border-gray-800 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className={`text-xs font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <tr className={isDark ? 'border-b border-gray-900' : 'border-b border-gray-50'}>
                        <td className="px-4 py-3 font-bold text-emerald-500">A</td>
                        <td className="px-4 py-3">@</td>
                        <td className="px-4 py-3">76.76.21.21</td>
                        <td className="px-4 py-3 text-gray-500">Auto</td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-gray-500 hover:text-white transition-colors">Edit</button>
                        </td>
                      </tr>
                      <tr className={isDark ? 'border-b border-gray-900' : 'border-b border-gray-50'}>
                        <td className="px-4 py-3 font-bold text-blue-500">CNAME</td>
                        <td className="px-4 py-3">www</td>
                        <td className="px-4 py-3">cname.vercel-dns.com</td>
                        <td className="px-4 py-3 text-gray-500">Auto</td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-gray-500 hover:text-white transition-colors">Edit</button>
                        </td>
                      </tr>
                      <tr className={isDark ? 'border-b border-gray-900' : 'border-b border-gray-50'}>
                        <td className="px-4 py-3 font-bold text-orange-500">MX</td>
                        <td className="px-4 py-3">@</td>
                        <td className="px-4 py-3 italic text-gray-500 text-[10px]">aspmx.l.google.com (Priority 1)</td>
                        <td className="px-4 py-3 text-gray-500">3600</td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-gray-500 hover:text-white transition-colors">Edit</button>
                        </td>
                      </tr>
                      <tr className={isDark ? 'border-b border-gray-900' : 'border-b border-gray-50'}>
                        <td className="px-4 py-3 font-bold text-gray-400">TXT</td>
                        <td className="px-4 py-3">@</td>
                        <td className="px-4 py-3 truncate max-w-[150px]">v=spf1 include:_spf.google.com ~all</td>
                        <td className="px-4 py-3 text-gray-500">Auto</td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-gray-500 hover:text-white transition-colors">Edit</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className={`p-4 ${isDark ? 'bg-zinc-900/50' : 'bg-gray-50/50'} border-t ${isDark ? 'border-gray-800' : 'border-gray-100'} grid grid-cols-2 gap-4`}>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2">SSL Status</h4>
                    <div className="flex items-center gap-2">
                      <FiShield className="text-emerald-500" size={12} />
                      <span className="text-xs font-mono">Let's Encrypt (Auto-renew) • 82d left</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2">Transfer Lock</h4>
                    <div className="flex items-center gap-2">
                      <FiLock className="text-emerald-500" size={12} />
                      <span className="text-xs font-mono">LOCKED (Security Active)</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        }

        {
          activeTab === 'brand' && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-bold uppercase tracking-wide ${isDark ? 'text-white' : 'text-black'}`}>Brand Assets</h2>
                <button className={`text-xs px-4 py-2 uppercase font-bold transition-colors ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
                  Upload Asset
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`border p-6 ${isDark ? 'border-gray-800 bg-zinc-950' : 'border-gray-200 bg-white'}`}>
                  <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Logos & Marks</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`aspect-square border border-dashed flex flex-col items-center justify-center gap-2 ${isDark ? 'border-gray-800 hover:border-gray-600' : 'border-gray-200 hover:border-gray-400'} transition-colors cursor-pointer group`}>
                      <div className="w-16 h-16 bg-white flex items-center justify-center p-2 mb-2">
                        <span className="text-black font-black text-xl italic">LOGO</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-white transition-colors">Primary Logo (SVG)</span>
                    </div>
                    <div className={`aspect-square border border-dashed flex flex-col items-center justify-center gap-2 ${isDark ? 'border-gray-800 hover:border-gray-600' : 'border-gray-200 hover:border-gray-400'} transition-colors cursor-pointer group`}>
                      <div className="w-16 h-16 bg-black flex items-center justify-center p-2 mb-2 border border-white/20">
                        <span className="text-white font-black text-xl italic">LOGO</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-white transition-colors">Inverted Logo (SVG)</span>
                    </div>
                  </div>
                </div>

                <div className={`border p-6 ${isDark ? 'border-gray-800 bg-zinc-950' : 'border-gray-200 bg-white'}`}>
                  <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Color Palette</h3>
                  <div className="space-y-4">
                    <div className={`flex items-center justify-between font-mono text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black border border-white/10" />
                        <span>Pure Black</span>
                      </div>
                      <span>#000000</span>
                    </div>
                    <div className={`flex items-center justify-between font-mono text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white border border-black/10" />
                        <span>Pure White</span>
                      </div>
                      <span>#FFFFFF</span>
                    </div>
                    <div className={`flex items-center justify-between font-mono text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-400" />
                        <span>Warning Amber</span>
                      </div>
                      <span>#FBBF24</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        }

        {
          activeTab === 'infrastructure' && (
            <motion.div
              key="infrastructure"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-8">
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl font-bold uppercase tracking-tighter text-white">SYSTEM_INFRASTRUCTURE</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold font-mono tracking-widest text-emerald-500 bg-emerald-950/20 border border-emerald-900 px-3 py-1">
                      SYSTEM_STATUS_OPERATIONAL
                    </span>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em] font-bold">NODE_ARCHITECTURE_MANIFEST</p>
                  </div>
                </div>
                <div className="flex bg-zinc-900 border border-zinc-800 p-1">
                  <button className="px-6 py-2 text-[10px] uppercase font-bold transition-all bg-white text-black font-mono">PRODUCTION_CORE</button>
                  <button className="px-6 py-2 text-[10px] uppercase font-bold transition-all text-zinc-500 hover:text-white font-mono">STAGING_MIRROR</button>
                </div>
              </div>

              {/* Service Mesh Table */}
              <div className="border border-zinc-900 bg-black overflow-hidden mb-12">
                <div className="grid grid-cols-12 px-6 py-4 border-b border-zinc-900 text-[10px] uppercase font-bold tracking-widest bg-zinc-950 text-zinc-500 font-mono">
                  <div className="col-span-3">SPEC_NODE_NAME</div>
                  <div className="col-span-2">NODE_TYPE</div>
                  <div className="col-span-2">CLUSTER_REGION</div>
                  <div className="col-span-2">UPTIME_INDEX</div>
                  <div className="col-span-2">RESOURCE_LOAD</div>
                  <div className="col-span-1 text-right">STATUS</div>
                </div>
                <div className="divide-y divide-zinc-900">
                  {[
                    { name: 'b0ase-web-primary', type: 'Web Server', region: 'us-east-1', uptime: '99.99%', cpu: '45%', mem: '62%', status: 'active' },
                    { name: 'b0ase-api-gateway', type: 'API Gateway', region: 'global-edge', uptime: '100%', cpu: '12%', mem: '34%', status: 'active' },
                    { name: 'postgres-primary-v16', type: 'Database', region: 'us-east-1', uptime: '99.95%', cpu: '28%', mem: '74%', status: 'active' },
                    { name: 'redis-cache-cluster', type: 'Cache Layer', region: 'us-east-1', uptime: '100%', cpu: '8%', mem: '41%', status: 'active' },
                    { name: 'worker-queue-01', type: 'Worker Node', region: 'us-east-1', uptime: '99.90%', cpu: '82%', mem: '65%', status: 'active' },
                    { name: 'search-index-node', type: 'Search Engine', region: 'us-west-2', uptime: '99.99%', cpu: '15%', mem: '45%', status: 'active' }
                  ].map((service, idx) => (
                    <div key={idx} className="grid grid-cols-12 px-6 py-5 items-center hover:bg-zinc-950 transition-all font-mono">
                      <div className="col-span-3 flex items-center gap-4">
                        <div className="p-2 bg-zinc-900 text-zinc-500 border border-zinc-800">
                          {service.type === 'Database' ? <FiDatabase size={14} /> :
                            service.type === 'Web Server' ? <FiServer size={14} /> :
                              service.type === 'Cache Layer' ? <FiZap size={14} /> :
                                <FiActivity size={14} />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white uppercase tracking-tighter">{service.name}</div>
                          <div className="text-[9px] text-zinc-600 uppercase tracking-widest">{`NODE_${Math.random().toString(36).substr(2, 6).toUpperCase()}`}</div>
                        </div>
                      </div>
                      <div className="col-span-2 text-[10px] text-zinc-500 uppercase">{service.type.replace(' ', '_')}</div>
                      <div className="col-span-2 flex items-center gap-2">
                        <FiGlobe className="text-zinc-700" size={12} />
                        <span className="text-[10px] text-zinc-500">{service.region.toUpperCase()}</span>
                      </div>
                      <div className="col-span-2 text-[10px] text-zinc-500">{service.uptime}</div>
                      <div className="col-span-2 flex flex-col gap-2">
                        <div className="flex items-center gap-3 text-[9px] text-zinc-600">
                          <span className="w-8 uppercase">CPU</span>
                          <div className="flex-1 h-1 bg-zinc-900 overflow-hidden">
                            <div className={`h-full ${parseInt(service.cpu) > 80 ? 'bg-red-500' : 'bg-white'}`} style={{ width: service.cpu }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-[9px] text-zinc-600">
                          <span className="w-8 uppercase">MEM</span>
                          <div className="flex-1 h-1 bg-zinc-900 overflow-hidden">
                            <div className={`h-full ${parseInt(service.mem) > 80 ? 'bg-amber-500' : 'bg-zinc-500'}`} style={{ width: service.mem }} />
                          </div>
                        </div>
                      </div>
                      <div className="col-span-1 text-right">
                        <span className="inline-flex items-center px-2 py-1 text-[9px] font-bold uppercase tracking-widest bg-green-950/20 text-green-500 border border-green-900">
                          {service.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deployment Log & Metrics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900">
                {/* Terminal Log */}
                <div className="lg:col-span-2">
                  <div className="h-full flex flex-col bg-black">
                    <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-900 bg-zinc-950">
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                          <div className="w-2.5 h-2.5 bg-zinc-800 border border-zinc-700" />
                          <div className="w-2.5 h-2.5 bg-zinc-800 border border-zinc-700" />
                          <div className="w-2.5 h-2.5 bg-zinc-800 border border-zinc-700" />
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">DEPLOYMENT_LOG_STREAM — SH</span>
                      </div>
                      <span className="flex items-center gap-3 text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-widest">
                        <span className="w-2 h-2 bg-emerald-500 animate-pulse" />
                        LIVE_TAIL_ACTIVE
                      </span>
                    </div>
                    <div className="p-6 font-mono text-xs overflow-y-auto max-h-[300px] text-zinc-500 space-y-2">
                      <div className="flex gap-4"><span className="text-zinc-800">[10:42:15]</span> <span className="text-white">INFO</span>  INITIALIZING_DEPLOY_V2.4.1...</div>
                      <div className="flex gap-4"><span className="text-zinc-800">[10:42:16]</span> <span className="text-white">INFO</span>  CACHE_RESTORED_245MB</div>
                      <div className="flex gap-4"><span className="text-zinc-800">[10:42:18]</span> <span className="text-white">INFO</span>  OPTIMIZING_STATIC_MANIFESTS...</div>
                      <div className="flex gap-4"><span className="text-zinc-800">[10:42:22]</span> <span className="text-emerald-500">SUCCESS</span> PARSER_OPTIMIZED_4.2S</div>
                      <div className="flex gap-4"><span className="text-zinc-800">[10:42:23]</span> <span className="text-white">INFO</span>  SYNCHRONIZING_EDGE_ARTIFACTS...</div>
                      <div className="flex gap-4"><span className="text-zinc-800">[10:42:25]</span> <span className="text-emerald-500">SUCCESS</span> DEPLOYMENT_MANIFEST_COMMITTED</div>
                      <div className="flex gap-4"><span className="text-zinc-800">[10:42:26]</span> <span className="text-purple-500">SYSTEM</span> HEALTH_CHECK_PASS_200</div>
                      <div className="flex gap-4"><span className="text-zinc-800">[10:45:01]</span> <span className="text-white">INFO</span>  SCALING_WORKER_INDEX_01</div>
                      <div className="flex gap-4"><span className="text-zinc-800">[10:45:05]</span> <span className="text-emerald-500">SUCCESS</span> ATTACHED_NODE_0X8F2...</div>
                      <div className="group flex gap-4 animate-pulse"><span className="text-zinc-800">[{new Date().toLocaleTimeString('en-GB')}]</span> <span className="text-zinc-500">_</span></div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-col gap-px bg-zinc-900">
                  <div className="bg-black p-8">
                    <div className="text-[10px] uppercase font-bold text-zinc-600 mb-4 font-mono tracking-widest">REQUEST_THROUGHPUT_24H</div>
                    <div className="text-4xl font-mono font-bold text-white tracking-tighter">2.4M</div>
                    <div className="text-[10px] text-emerald-500 mt-4 flex items-center gap-2 font-mono uppercase tracking-widest font-bold">
                      <FiTrendingUp /> +12.5%_VARIANCE
                    </div>
                  </div>
                  <div className="bg-black p-8">
                    <div className="text-[10px] uppercase font-bold text-zinc-600 mb-4 font-mono tracking-widest">LATENCY_P99_METRIC</div>
                    <div className="text-4xl font-mono font-bold text-white tracking-tighter">42MS</div>
                    <div className="text-[10px] text-emerald-500 mt-4 flex items-center gap-2 font-mono uppercase tracking-widest font-bold">
                      <FiTrendingDown /> -3MS_GAIN
                    </div>
                  </div>
                  <div className="bg-black p-8">
                    <div className="text-[10px] uppercase font-bold text-zinc-600 mb-4 font-mono tracking-widest">ERROR_INDEX_RATE</div>
                    <div className="text-4xl font-mono font-bold text-white tracking-tighter">0.02%</div>
                    <div className="text-[10px] text-zinc-500 mt-4 font-mono uppercase tracking-widest font-bold">SLA_PROTOCOL_STABLE</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        }

        {
          activeTab === 'contracts' && (
            <motion.div
              key="contracts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-8">
                <div>
                  <h2 className="text-3xl font-bold uppercase tracking-tighter text-white mb-2">CONTRACT_PROTOCOL_SYSTEM</h2>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em] font-bold">LEGAL_SPECIFICATION_TEMPLATES</p>
                </div>
                <button className="px-8 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono">
                  SIGN_NEW_PROTOCOL_MANIFEST
                </button>
              </div>

              <div className="border border-zinc-900 bg-black overflow-hidden">
                <div className="grid grid-cols-4 px-6 py-4 border-b border-zinc-900 text-[10px] uppercase font-bold tracking-widest bg-zinc-950 text-zinc-500 font-mono">
                  <span>SPEC_TEMPLATE_NAME</span>
                  <span>NODE_CATEGORY</span>
                  <span>METRIC_LAST_UPDATED</span>
                  <span className="text-right">OPERATION</span>
                </div>
                <div className="divide-y divide-zinc-900">
                  {[
                    { name: 'Standard Service Agreement', cat: 'Services', date: 'Jan 2026', link: '/user/account/contracts/service-agreement' },
                    { name: 'Mutual NDA', cat: 'Legal', date: 'Dec 2025', link: '/user/account/contracts/nda' },
                    { name: 'AI Development Rider', cat: 'AI/ML', date: 'Jan 2026', link: '/user/account/contracts/ai-rider' },
                    { name: 'IP Transfer Agreement', cat: 'Legal', date: 'Nov 2025', link: '/user/account/contracts/ip-transfer' }
                  ].map((item, idx) => (
                    <div key={idx} className="grid grid-cols-4 px-6 py-6 items-center hover:bg-zinc-950 transition-all font-mono">
                      <div className="flex items-center gap-4">
                        <FiFileText className="text-zinc-600" />
                        <span className="text-xs font-bold text-white uppercase tracking-tighter">{item.name}</span>
                      </div>
                      <span className="text-[10px] uppercase text-zinc-500">{item.cat.toUpperCase()}</span>
                      <span className="text-[10px] uppercase text-zinc-500">{item.date.toUpperCase()}</span>
                      <div className="text-right">
                        <Link href={item.link} className="text-[10px] uppercase font-bold text-white hover:text-zinc-400 transition-colors underline underline-offset-4">
                          OPEN_EDITOR
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )
        }
        {
          activeTab === 'tokens' && (
            <motion.div
              key="tokens"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-8">
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl font-bold uppercase tracking-tighter text-white">TOKEN_PORTFOLIO_MANAGEMENT</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold font-mono tracking-widest text-emerald-500 bg-emerald-950/20 border border-emerald-900 px-3 py-1 uppercase">
                      PROTOCOL_ACCOUNT_ACTIVE
                    </span>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em] font-bold">ASSETS_DIVIDENDS_GOVERNANCE</p>
                  </div>
                </div>
              </div>

              {/* Venture Token Portfolio */}
              {!portfolioLoading && tokenPortfolio && (
                <div className="space-y-8">
                  {tokenPortfolio.portfolio.length > 0 ? (
                    <>
                      <div className="flex flex-col gap-2 border-b border-zinc-900 pb-4">
                        <h3 className="text-2xl font-bold uppercase tracking-tighter text-white">YOUR_TOKEN_PORTFOLIO</h3>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em] font-bold">
                          {tokenPortfolio.summary.totalTokenTypes} TOKEN{tokenPortfolio.summary.totalTokenTypes !== 1 ? 'S' : ''} OWNED
                        </p>
                      </div>

                      {/* Portfolio Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-zinc-900 border border-zinc-900">
                        <div className="bg-black p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <FaCoins className="text-blue-500" size={14} />
                            <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">IN_ACCOUNT</h4>
                          </div>
                          <div className="space-y-1">
                            <p className="text-3xl font-bold text-white tracking-tighter font-mono">{tokenPortfolio.summary.totalInAccount.toLocaleString()}</p>
                            <p className="text-[8px] uppercase font-bold text-zinc-600 tracking-widest font-mono">AVAILABLE_TO_WITHDRAW</p>
                          </div>
                        </div>

                        <div className="bg-black p-6 border-l border-zinc-900">
                          <div className="flex items-center gap-2 mb-4">
                            <FiLock className="text-amber-500" size={14} />
                            <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">STAKED_KYC</h4>
                          </div>
                          <div className="space-y-1">
                            <p className="text-3xl font-bold text-white tracking-tighter font-mono">{tokenPortfolio.summary.totalStaked.toLocaleString()}</p>
                            <p className="text-[8px] uppercase font-bold text-zinc-600 tracking-widest font-mono">REGISTERED_FOR_DIVIDENDS</p>
                          </div>
                        </div>

                        <div className="bg-black p-6 border-l border-zinc-900">
                          <div className="flex items-center gap-2 mb-4">
                            <FaCode className="text-green-500" size={14} />
                            <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">AS_BEARER</h4>
                          </div>
                          <div className="space-y-1">
                            <p className="text-3xl font-bold text-white tracking-tighter font-mono">{tokenPortfolio.summary.totalAsBearer.toLocaleString()}</p>
                            <p className="text-[8px] uppercase font-bold text-zinc-600 tracking-widest font-mono">IN_CIRCULATION_NO_KYC</p>
                          </div>
                        </div>

                        <div className="bg-black p-6 border-l border-zinc-900">
                          <div className="flex items-center gap-2 mb-4">
                            <FiDollarSign className="text-purple-500" size={14} />
                            <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">PORTFOLIO_VALUE</h4>
                          </div>
                          <div className="space-y-1">
                            <p className="text-3xl font-bold text-white tracking-tighter font-mono">${tokenPortfolio.summary.totalUsdValue.toFixed(2)}</p>
                            <p className="text-[8px] uppercase font-bold text-zinc-600 tracking-widest font-mono">CURRENT_USD_VALUE</p>
                          </div>
                        </div>
                      </div>

                      {/* Individual Token Breakdown */}
                      <div className="border border-zinc-900 bg-black">
                        <div className="px-6 py-4 border-b border-zinc-900 text-[10px] uppercase font-bold tracking-widest bg-zinc-950 text-zinc-500 font-mono">
                          TOKEN_HOLDINGS_BREAKDOWN
                        </div>
                        <div className="divide-y divide-zinc-900">
                          {tokenPortfolio.portfolio.map((token) => (
                            <div key={token.tokenId} className="px-6 py-6 hover:bg-zinc-950 transition-all">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm font-bold text-white uppercase tracking-wide">{token.ticker}</span>
                                    {token.isDeployed && (
                                      <span className="text-[8px] font-bold px-2 py-1 bg-green-950 text-green-500 uppercase">DEPLOYED</span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-zinc-500 mb-3">{token.name}</p>

                                  {/* Holdings Grid */}
                                  <div className="grid grid-cols-3 gap-4 mt-4">
                                    <div className="bg-zinc-950/50 p-3 border border-zinc-900">
                                      <p className="text-[10px] uppercase font-bold text-blue-400 font-mono tracking-widest mb-2">IN_ACCOUNT</p>
                                      <p className="text-lg font-bold text-white">{token.breakdown.inAccount.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-zinc-950/50 p-3 border border-zinc-900">
                                      <p className="text-[10px] uppercase font-bold text-amber-400 font-mono tracking-widest mb-2">STAKED_KYC</p>
                                      <p className="text-lg font-bold text-white">{token.breakdown.staked.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-zinc-950/50 p-3 border border-zinc-900">
                                      <p className="text-[10px] uppercase font-bold text-green-400 font-mono tracking-widest mb-2">AS_BEARER</p>
                                      <p className="text-lg font-bold text-white">{token.breakdown.asBearer.toLocaleString()}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right sm:w-48">
                                  <p className="text-[10px] uppercase font-bold text-zinc-500 font-mono tracking-widest mb-2">VALUATION</p>
                                  <p className="text-2xl font-bold text-white mb-1">${(token.inAccount * token.priceUsd).toFixed(2)}</p>
                                  <p className="text-[10px] text-zinc-500 font-mono">@ ${token.priceUsd.toFixed(8)}/token</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="border border-zinc-900 bg-zinc-950/20 p-12 text-center">
                      <FaCoins className="text-zinc-700 mx-auto mb-6" size={48} />
                      <p className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest font-bold">NO_TOKENS_OWNED</p>
                      <p className="text-[9px] text-zinc-600 mt-3">Purchase tokens or stake existing holdings to see them here</p>
                    </div>
                  )}
                </div>
              )}

              {portfolioLoading && (
                <div className="text-center py-12">
                  <p className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest">LOADING_TOKEN_PORTFOLIO...</p>
                </div>
              )}

              {portfolioError && (
                <div className="border border-red-900 bg-red-950/10 p-6">
                  <p className="text-[10px] uppercase font-mono text-red-500 tracking-widest font-bold">{portfolioError}</p>
                </div>
              )}

              {/* Governance Vault Section */}
              <div className="border-t border-zinc-900 pt-12">
                <div className="flex flex-col gap-2 border-b border-zinc-900 pb-4 mb-8">
                  <h3 className="text-2xl font-bold uppercase tracking-tighter text-white">EQUITY_GOVERNANCE_VAULT</h3>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em] font-bold">MULTISIG_SECURED_ASSETS</p>
                </div>

                <div className="p-8 border border-zinc-900 bg-zinc-950/20 text-zinc-500 text-[10px] uppercase font-mono font-bold tracking-widest leading-relaxed">
                  <strong className="text-white">SECURITY_PROTOCOL_WARNING:</strong> THIS_IS_YOUR_SECURE_PROJECT_ACCOUNT. ALL_EQUITY_GOVERNANCE_TOKENS_AND_DIVIDEND_STREAM_ARE_HELD_IN_A_SECURE_MULTISIG_VAULT. WITHDRAWALS_REQUIRE_DUAL_SIGNATURE_VERIFICATION_PROTOCOL.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900">
                  <div className="bg-black p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <FiLock className="text-zinc-600" />
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">VAULT_BALANCE_CORE</h3>
                    </div>
                    <div className="space-y-2">
                      <p className="text-4xl font-bold text-white tracking-tighter font-mono">50,000</p>
                      <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest font-mono">LOCKED_GOVERNANCE_UNITS</p>
                    </div>
                  </div>

                  <div className="bg-black p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <FiDollarSign className="text-zinc-600" />
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">ACCRUED_DIVIDEND_STREAM</h3>
                    </div>
                    <div className="space-y-2">
                      <p className="text-4xl font-bold text-white tracking-tighter font-mono">2,450.00 <span className="text-xs text-zinc-600">SATs</span></p>
                      <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest font-mono">AVAILABLE_FOR_PROTOCOL_WITHDRAWAL</p>
                    </div>
                  </div>

                  <div className="bg-black p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <FiPieChart className="text-zinc-600" />
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">EQUITY_SHARE_INDEX</h3>
                    </div>
                    <div className="space-y-2">
                      <p className="text-4xl font-bold text-white tracking-tighter font-mono">0.5%</p>
                      <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest font-mono">TOTAL_DILUTED_OWNERSHIP_NODE</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-900 border border-zinc-900">
                  <div className="bg-black p-10">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-8 font-mono">VAULT_OPERATIONAL_COMMANDS</h3>
                    <div className="space-y-6">
                      <div className="p-8 border border-zinc-900 bg-zinc-950/20">
                        <p className="text-[10px] font-bold mb-4 uppercase text-white font-mono tracking-widest">REQUEST_WITHDRAWAL_PROTOCOL</p>
                        <p className="text-[10px] text-zinc-600 mb-8 font-mono uppercase tracking-widest leading-loose">
                          INITIATE_REQUEST_AND_DUAL_SIGNATURE_MANIFEST: AUTHORIZE_INTENT_AND_CONFIRM_BROADCAST_REPLICATION.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <button className="flex-1 px-6 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono">
                            WITHDRAW_DIVIDENDS
                          </button>
                          <button className="flex-1 px-6 py-4 border border-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-900 transition-all font-mono">
                            WITHDRAW_TOKENS
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {handle === 'boase' && (
                    <div className="bg-black p-10 border-l border-zinc-900">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-10 font-mono">ROOT_OPERATOR_METRICS: $BOASE</h3>
                      <div className="space-y-10">
                        <div>
                          <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500 mb-3 font-mono tracking-widest">
                            <span>TOTAL_SUPPLY_CAP</span>
                            <span className="text-white">100,000,000,000</span>
                          </div>
                          <div className="w-full h-px bg-zinc-900">
                            <div className="w-full h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500 mb-3 font-mono tracking-widest">
                            <span>CIRCULATING_INDEX</span>
                            <span className="text-white">0</span>
                          </div>
                          <div className="w-full h-px bg-zinc-900">
                            <div className="w-[0%] h-full bg-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {handle !== 'boase' && (
                    <div className="bg-black p-10 flex flex-col items-center justify-center text-center">
                      <FiShield size={48} className="text-zinc-800 mb-8" />
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4 font-mono">MULTISIG_PROTECTION_ENABLED</h3>
                      <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest max-w-xs leading-relaxed">YOUR_ASSETS_ARE_SECURED_BY_SMART_CONTRACT_MULTISIG_PROTOCOLS. DUAL_REPLICATION_REQUIRED.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        }

        {
          activeTab === 'content' && (
            <ContentTabSection isDark={isDark} />
          )
        }
      </AnimatePresence >


      {/* Create Company Modal */}
      <AnimatePresence>
        {
          showCreateCompany && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowCreateCompany(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`p-6 w-full max-w-md border ${isDark ? 'bg-black text-white border-gray-800' : 'bg-white text-black border-gray-200'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold mb-6">Register New Company</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      placeholder="e.g. My Startup Ltd"
                      className={`w-full border bg-transparent px-4 py-3 text-sm focus:outline-none ${isDark ? 'border-gray-800 focus:border-white' : 'border-gray-200 focus:border-black'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">
                      Companies House Number
                    </label>
                    <input
                      type="text"
                      value={newCompanyNumber}
                      onChange={(e) => setNewCompanyNumber(e.target.value)}
                      placeholder="e.g. 12345678 (optional)"
                      className={`w-full border bg-transparent px-4 py-3 text-sm focus:outline-none ${isDark ? 'border-gray-800 focus:border-white' : 'border-gray-200 focus:border-black'}`}
                    />
                    <p className="text-xs text-gray-400 mt-1">Leave blank if not yet incorporated</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateCompany(false)}
                    className={`flex-1 border px-4 py-3 text-sm uppercase tracking-wide transition-colors ${isDark ? 'border-gray-800 hover:bg-gray-900' : 'border-gray-200 hover:bg-gray-100'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCompany}
                    disabled={!newCompanyName.trim() || creatingCompany}
                    className={`flex-1 px-4 py-3 text-sm uppercase tracking-wide font-bold transition-colors disabled:opacity-50 ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                  >
                    {creatingCompany ? 'Creating...' : 'Create Company'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )
        }
      </AnimatePresence >

      {/* Create Token Modal */}
      <AnimatePresence>
        {
          showCreateToken && selectedCompany && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowCreateToken(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`p-6 w-full max-w-md border ${isDark ? 'bg-black text-white border-gray-800' : 'bg-white text-black border-gray-200'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Add Token / Share Class</h3>
                <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  For <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{selectedCompany.name}</span>
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">
                        Symbol *
                      </label>
                      <input
                        type="text"
                        value={newTokenSymbol}
                        onChange={(e) => setNewTokenSymbol(e.target.value.toUpperCase())}
                        placeholder="e.g. ORD"
                        maxLength={10}
                        className={`w-full border bg-transparent px-4 py-3 text-sm focus:outline-none font-mono ${isDark ? 'border-gray-800 focus:border-white text-white' : 'border-gray-200 focus:border-black text-black'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">
                        Share Class
                      </label>
                      <select
                        value={newTokenShareClass}
                        onChange={(e) => setNewTokenShareClass(e.target.value)}
                        className={`w-full border px-4 py-3 text-sm focus:outline-none ${isDark ? 'border-gray-800 focus:border-white text-white bg-black' : 'border-gray-200 focus:border-black text-black bg-white'}`}
                      >
                        <option value="Ordinary">Ordinary</option>
                        <option value="Preference">Preference</option>
                        <option value="A Ordinary">A Ordinary</option>
                        <option value="B Ordinary">B Ordinary</option>
                        <option value="Seed">Seed</option>
                        <option value="Convertible">Convertible</option>
                        <option value="Other">Other...</option>
                      </select>
                    </div>
                  </div>

                  {newTokenShareClass === 'Other' && (
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">
                        Custom Share Class *
                      </label>
                      <input
                        type="text"
                        value={newTokenCustomShareClass}
                        onChange={(e) => setNewTokenCustomShareClass(e.target.value)}
                        placeholder="e.g. Series A, Founder Shares, etc."
                        className={`w-full border bg-transparent px-4 py-3 text-sm focus:outline-none ${isDark ? 'border-gray-800 focus:border-white text-white' : 'border-gray-200 focus:border-black text-black'}`}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={newTokenName}
                      onChange={(e) => setNewTokenName(e.target.value)}
                      placeholder="e.g. Ordinary Shares"
                      className={`w-full border bg-transparent px-4 py-3 text-sm focus:outline-none ${isDark ? 'border-gray-800 focus:border-white text-white' : 'border-gray-200 focus:border-black text-black'}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">
                        Total Supply
                      </label>
                      <input
                        type="number"
                        value={newTokenSupply}
                        onChange={(e) => setNewTokenSupply(e.target.value)}
                        placeholder="1000"
                        min="1"
                        className={`w-full border bg-transparent px-4 py-3 text-sm focus:outline-none font-mono ${isDark ? 'border-gray-800 focus:border-white text-white' : 'border-gray-200 focus:border-black text-black'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">
                        Nominal Value (£)
                      </label>
                      <input
                        type="number"
                        value={newTokenNominalValue}
                        onChange={(e) => setNewTokenNominalValue(e.target.value)}
                        placeholder="0.01"
                        step="0.001"
                        min="0.001"
                        className={`w-full border bg-transparent px-4 py-3 text-sm focus:outline-none font-mono ${isDark ? 'border-gray-800 focus:border-white text-white' : 'border-gray-200 focus:border-black text-black'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateToken(false)}
                    className={`flex-1 border px-4 py-3 text-sm uppercase tracking-wide transition-colors ${isDark ? 'border-gray-800 hover:bg-gray-900 text-white' : 'border-gray-200 hover:bg-gray-100 text-black'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateToken}
                    disabled={!newTokenSymbol.trim() || !newTokenName.trim() || creatingToken || (newTokenShareClass === 'Other' && !newTokenCustomShareClass.trim())}
                    className={`flex-1 px-4 py-3 text-sm uppercase tracking-wide font-bold transition-colors disabled:opacity-50 ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                  >
                    {creatingToken ? 'Creating...' : 'Create Token'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )
        }
      </AnimatePresence >

      {/* Merge Accounts Modal */}
      <AnimatePresence>
        {
          showMergeModal && mergePreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => { setShowMergeModal(false); setMergePreview(null); setPendingLinkIdentity(null); }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`p-6 w-full max-w-lg border ${isDark ? 'bg-black text-white border-gray-800' : 'bg-white text-black border-gray-200'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Merge Accounts?</h3>
                <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  This identity is already linked to another account. Would you like to merge the accounts?
                </p>

                <div className="space-y-4 mb-6">
                  <div className={`border p-4 ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Account to merge in</div>
                    <div className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                      {mergePreview.source.unified_user.display_name || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">{mergePreview.source.unified_user.primary_email}</div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>{mergePreview.source.identity_count} identities</span>
                      <span>{mergePreview.source.company_count} companies</span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <span className="text-gray-400">↓ merge into ↓</span>
                  </div>

                  <div className={`border p-4 ${isDark ? 'border-green-800 bg-green-900/20' : 'border-green-200 bg-green-50'}`}>
                    <div className="text-xs text-green-500 uppercase tracking-wide mb-2">Your current account</div>
                    <div className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                      {mergePreview.target.unified_user.display_name || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">{mergePreview.target.unified_user.primary_email}</div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>{mergePreview.target.identity_count} identities</span>
                      <span>{mergePreview.target.company_count} companies</span>
                    </div>
                  </div>
                </div>

                <p className={`text-sm mb-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  ⚠️ This will combine all identities, companies, and data from both accounts. This action cannot be undone.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowMergeModal(false); setMergePreview(null); setPendingLinkIdentity(null); }}
                    className={`flex-1 border px-4 py-3 text-sm uppercase tracking-wide transition-colors ${isDark ? 'border-gray-800 hover:bg-gray-900 text-white' : 'border-gray-200 hover:bg-gray-100 text-black'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmMerge}
                    disabled={mergingAccounts}
                    className={`flex-1 px-4 py-3 text-sm uppercase tracking-wide font-bold transition-colors disabled:opacity-50 ${isDark ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-green-600 text-white hover:bg-green-500'}`}
                  >
                    {mergingAccounts ? 'Merging...' : 'Merge Accounts'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )
        }
      </AnimatePresence >

      {/* API Key Modal */}
      <AnimatePresence>
        {
          showApiKeyModal && apiKeyProvider && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowApiKeyModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`p-6 w-full max-w-md border ${isDark ? 'bg-black text-white border-gray-800' : 'bg-white text-black border-gray-200'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-6">
                  {apiKeyProvider === 'claude' && <ClaudeIcon size={24} className="text-orange-500" />}
                  {apiKeyProvider === 'openai' && <OpenAIIcon size={24} className="text-green-500" />}
                  {apiKeyProvider === 'gemini' && <GeminiIcon size={24} className="text-blue-500" />}
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                    Add {apiKeyProvider === 'claude' ? 'Claude' : apiKeyProvider === 'openai' ? 'OpenAI' : 'Gemini'} API Key
                  </h3>
                </div>

                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {apiKeyProvider === 'claude' && 'Enter your Anthropic API key to enable Claude AI agents.'}
                  {apiKeyProvider === 'openai' && 'Enter your OpenAI API key to enable GPT-powered agents.'}
                  {apiKeyProvider === 'gemini' && 'Enter your Google AI API key to enable Gemini agents.'}
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">
                      API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder={apiKeyProvider === 'claude' ? 'sk-ant-...' : apiKeyProvider === 'openai' ? 'sk-...' : 'AI...'}
                        className={`w-full border bg-transparent px-4 py-3 pr-10 text-sm font-mono focus:outline-none ${isDark ? 'border-gray-800 focus:border-white' : 'border-gray-200 focus:border-black'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'}`}
                      >
                        {showApiKey ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                      </button>
                    </div>
                  </div>

                  {apiKeyError && (
                    <p className="text-sm text-red-500 flex items-center gap-2">
                      <FiAlertCircle size={14} />
                      {apiKeyError}
                    </p>
                  )}

                  <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                    <FiShield className="inline mr-1" size={12} />
                    Your API key is encrypted and stored securely. It will be used by AI agents for automation tasks.
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowApiKeyModal(false)}
                    className={`flex-1 border px-4 py-3 text-sm uppercase tracking-wide transition-colors ${isDark ? 'border-gray-800 hover:bg-gray-900' : 'border-gray-200 hover:bg-gray-100'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveApiKey}
                    disabled={!apiKeyInput.trim() || apiKeyLoading}
                    className={`flex-1 px-4 py-3 text-sm uppercase tracking-wide font-bold transition-colors disabled:opacity-50 ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                  >
                    {apiKeyLoading ? 'Saving...' : 'Save API Key'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )
        }
      </AnimatePresence >
      {/* MFA Setup Modal */}
      <AnimatePresence>
        {
          showMfaModal && mfaEnrollment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
              onClick={() => setShowMfaModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`p-6 w-full max-w-sm border ${isDark ? 'bg-black text-white border-gray-800' : 'bg-white text-black border-gray-200'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-6">
                  <FiLock size={24} className="text-green-500" />
                  <h3 className="text-lg font-bold">Setup 2FA</h3>
                </div>

                <div className="text-center mb-6">
                  <div className="bg-white p-4 inline-block rounded-lg mb-4">
                    <QRCodeSVG value={mfaEnrollment.totp.uri} size={160} />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">Scan this QR code with your authenticator app (e.g. Google Authenticator, Authy).</p>
                  <p className="text-xs font-mono bg-gray-900 p-2 rounded text-gray-400 break-all select-all">
                    {mfaEnrollment.totp.secret}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className={`w-full border bg-transparent px-4 py-3 text-center text-xl tracking-widest font-mono focus:outline-none ${isDark ? 'border-gray-800 focus:border-white' : 'border-gray-200 focus:border-black'}`}
                    />
                  </div>

                  {mfaError && <p className="text-red-500 text-xs text-center">{mfaError}</p>}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowMfaModal(false)}
                      className={`flex-1 border px-4 py-3 text-sm uppercase tracking-wide transition-colors ${isDark ? 'border-gray-800 hover:bg-gray-900' : 'border-gray-200 hover:bg-gray-100'}`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleVerifyMfa}
                      disabled={mfaCode.length !== 6 || mfaLoading}
                      className={`flex-1 px-4 py-3 text-sm uppercase tracking-wide font-bold transition-colors disabled:opacity-50 ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                    >
                      {mfaLoading ? 'Verifying...' : 'Verify & Enable'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )
        }
      </AnimatePresence >
    </>
  );
}

// API Keys Section Component
function ApiKeysSection({ isDark }: { isDark: boolean }) {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyData, setNewKeyData] = useState<{ key: string; name: string } | null>(null);
  const [keyName, setKeyName] = useState('');

  useEffect(() => {
    fetchApiKeys();
  }, []);

  async function fetchApiKeys() {
    try {
      const response = await fetch('/api/user/access-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.apiKeys || []);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createApiKey() {
    if (!keyName.trim()) {
      alert('Please enter a name for your API key');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/user/access-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: keyName.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        setNewKeyData({
          key: data.apiKey.key,
          name: data.apiKey.name
        });
        setShowNewKey(true);
        setKeyName('');
        fetchApiKeys();
      } else {
        const error = await response.json();
        alert(`Failed to create API key: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Failed to create API key');
    } finally {
      setCreating(false);
    }
  }

  async function revokeApiKey(id: string) {
    if (!confirm('Are you sure you want to revoke this API key? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/access-keys/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchApiKeys();
      } else {
        alert('Failed to revoke API key');
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
      alert('Failed to revoke API key');
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert('API key copied to clipboard!');
  }

  if (loading) {
    return <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">SYNCHRONIZING_API_KEYS...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create New Key Form */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={keyName}
          onChange={(e) => setKeyName(e.target.value)}
          placeholder="API_KEY_IDENTIFIER (E.G. PRODUCTION_NODE)"
          className="flex-1 px-4 py-4 text-xs font-mono bg-zinc-950 border border-zinc-900 text-white focus:outline-none focus:border-white placeholder-zinc-800 transition-all uppercase"
          disabled={creating}
        />
        <button
          onClick={createApiKey}
          disabled={creating || !keyName.trim()}
          className="px-8 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono disabled:opacity-50"
        >
          {creating ? 'SYNCHRONIZING...' : 'INITIALIZE_KEY'}
        </button>
      </div>

      {/* New Key Display (shown once after creation) */}
      {showNewKey && newKeyData && (
        <div className="p-8 border border-white bg-white text-black space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold font-mono tracking-widest uppercase">✓ PROTOCOL_KEY_GENERATED: {newKeyData.name.toUpperCase()}</p>
            <button
              onClick={() => setShowNewKey(false)}
              className="text-[10px] font-bold uppercase tracking-widest underline underline-offset-4"
            >
              DISMISS
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newKeyData.key}
              readOnly
              className="flex-1 px-4 py-4 text-xs font-mono bg-zinc-100 border border-zinc-200 text-black select-all"
            />
            <button
              onClick={() => copyToClipboard(newKeyData.key)}
              className="px-8 py-4 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-900 transition-all font-mono"
            >
              COPY_TOKEN
            </button>
          </div>
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest font-mono">
            ⚠ WARNING: STORE_THIS_TOKEN_SECURELY. IT_WILL_NOT_BE_RECOVERABLE_AFTER_DISMISSAL.
          </p>
        </div>
      )}

      {/* Existing Keys List */}
      {apiKeys.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-zinc-900 bg-zinc-950/20">
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em]">NO_ACCESS_KEYS_DETECTED_IN_CLUSTER</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-px bg-zinc-900 border border-zinc-900">
          {apiKeys.map((key) => (
            <div key={key.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-black group hover:bg-zinc-950 transition-all">
              <div className="flex-1 space-y-2">
                <p className="text-xs font-bold text-white uppercase font-mono tracking-tighter">{key.name}</p>
                <code className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">{key.key_prefix}••••••••••••••••</code>
                <div className="flex gap-4 text-[9px] text-zinc-600 font-mono uppercase tracking-widest">
                  <span>CREATED: {new Date(key.created_at).toLocaleDateString().replace(/\//g, '.')}</span>
                  {key.last_used_at && <span>LAST_ACCESS: {new Date(key.last_used_at).toLocaleDateString().replace(/\//g, '.')}</span>}
                </div>
              </div>
              <button
                onClick={() => revokeApiKey(key.id)}
                className="mt-4 md:mt-0 px-6 py-2 text-[10px] font-bold font-mono text-red-500 border border-red-950 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest"
              >
                REVOKE_TOKEN
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-6 border border-zinc-900 bg-zinc-950/20">
        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-loose">
          USE_ACCESS_TOKENS_TO_AUTHENTICATE_REQUESTS_TO_B0ASE_PROTOCOL_APIS. INCLUDE_KEY_IN_AUTHORIZATION_HEADER:
          <br />
          <code className="bg-black text-white px-2 py-1 mt-2 inline-block border border-zinc-800">Authorization: Bearer b0_...</code>
        </p>
      </div>
      {/* Auth Sync Modal - Prevents Redirect Loop */}
      <AnimatePresence>
        {authSyncRequired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-zinc-900 border border-red-500/30 rounded-lg p-6 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-4 text-red-400">
                <FiAlertCircle size={32} />
                <h2 className="text-xl font-bold uppercase tracking-wide">Session Out of Sync</h2>
              </div>

              <p className="text-zinc-400 mb-6 leading-relaxed">
                Your authentication session has expired or is invalid, but your browser still thinks you are logged in.
              </p>

              <div className="bg-zinc-950 p-4 rounded mb-6 border border-zinc-800">
                <p className="text-xs text-zinc-500 font-mono mb-2 uppercase">Debug Info:</p>
                <div className="text-xs font-mono text-zinc-400">
                  Client User: {user ? 'Yes' : 'No'}<br />
                  HandCash Handle: {handle || 'None'}<br />
                  API Status: 401 Unauthorized
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                >
                  Refresh Page
                </button>
                <button
                  onClick={async () => {
                    await handleSignOut();
                    window.location.href = '/login';
                  }}
                  className="w-full px-4 py-3 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors uppercase tracking-wider font-bold"
                >
                  Log Out & Sign In Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Verification Badge Component
function VerificationBadge({ level }: { level: 'verified_owner' | 'repo_attested' | 'unverified' | null }) {
  if (!level) return null;

  const badges = {
    verified_owner: {
      icon: '✅',
      label: 'VERIFIED_OWNER',
      color: 'border-green-900 bg-green-950/20 text-green-500',
      tooltip: 'GitHub confirms this user has owner/admin access to the repository',
    },
    repo_attested: {
      icon: '📄',
      label: 'REPO_ATTESTED',
      color: 'border-blue-900 bg-blue-950/20 text-blue-500',
      tooltip: 'Repository contains .well-known/token.json attestation file',
    },
    unverified: {
      icon: '⚠️',
      label: 'UNVERIFIED',
      color: 'border-yellow-900 bg-yellow-950/20 text-yellow-500',
      tooltip: 'No verification proof available. Use caution.',
    },
  };

  const badge = badges[level];

  return (
    <span
      className={`text-[9px] px-2 py-1 border ${badge.color} font-mono font-bold uppercase tracking-widest flex items-center gap-1`}
      title={badge.tooltip}
    >
      <span>{badge.icon}</span>
      <span>{badge.label}</span>
    </span>
  );
}

// Repos Tab Component
function ReposTab({ isDark }: { isDark: boolean }) {
  const { linkGithub } = useAuth();
  const [userRepos, setUserRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);

  useEffect(() => {
    fetchUserRepos();
  }, []);

  async function fetchUserRepos() {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Repos Tab - Fetching user repos...');
      const res = await fetch('/api/user/github/repos');

      console.log('🔍 Repos Tab - Response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        setUserRepos(data.repos || []);
        setIsGitHubConnected(true);
        console.log(`✅ Loaded ${data.repos?.length || 0} repos from GitHub`);
      } else if (res.status === 400 || res.status === 401) {
        const errorData = await res.json();
        console.log('🔍 Repos Tab - Not connected:', errorData);
        setIsGitHubConnected(false);
        setUserRepos([]);
      } else {
        const errorData = await res.json();
        console.error('🔍 Repos Tab - Error response:', errorData);

        // Show debug info if available
        let errorMessage = errorData.error || 'Failed to load repositories';
        if (errorData.debug) {
          errorMessage += ` (Debug: ${JSON.stringify(errorData.debug)})`;
        }

        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('🔍 Repos Tab - Fetch error:', err);
      setError(err.message || 'Failed to load repositories');
    } finally {
      setLoading(false);
    }
  }

  const connectGitHub = async () => {
    if (linkGithub) {
      await linkGithub();
      // After linking, refresh the repos
      setTimeout(() => fetchUserRepos(), 2000);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-8 mb-12">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tighter text-white mb-2">REPO_OWNERSHIP_MANIFEST</h2>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em] font-bold">GITHUB_CLUSTER_INTEGRATION</p>
        </div>
        {!isGitHubConnected && (
          <button
            onClick={connectGitHub}
            className="px-8 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono flex items-center gap-3"
          >
            <FaGithub size={16} /> INITIALIZE_GITHUB_LINK
          </button>
        )}
      </div>

      {error && (
        <div className="p-6 border border-red-900 bg-red-950/20 text-red-500 font-mono text-xs mb-12 uppercase tracking-widest">
          <strong className="font-bold">SYSTEM_ERROR_NODE:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-48 border border-zinc-900 bg-zinc-950/20">
          <div className="animate-spin h-12 w-12 border-2 border-white border-t-transparent mx-auto mb-8"></div>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em]">SYNCHRONIZING_GITHUB_MANIFEST...</p>
        </div>
      ) : !isGitHubConnected ? (
        <div className="text-center py-48 border border-zinc-900 bg-zinc-950/10">
          <FaGithub size={64} className="mx-auto mb-8 text-zinc-800" />
          <h2 className="text-xl font-bold mb-4 text-white uppercase tracking-tighter">CONNECTION_REQUIRED</h2>
          <p className="mb-12 max-w-md mx-auto text-[10px] text-zinc-600 font-mono uppercase tracking-widest leading-relaxed">
            AUTHORIZE_GITHUB_PROTOCOL_TO_REPLICATE_REPOSITORIES_AND_INITIALIZE_ON_CHAIN_TOKENIZATION
          </p>
          <button
            onClick={connectGitHub}
            className="px-12 py-5 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all font-mono"
          >
            START_OAUTH_PROTOCOL
          </button>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-900 border border-zinc-900 mb-12">
            <div className="bg-black p-8">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4 font-mono">NODE_COUNT</div>
              <div className="text-4xl font-bold text-white tracking-tighter font-mono">{userRepos.length}</div>
            </div>
            <div className="bg-black p-8">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4 font-mono">STAR_METRIC</div>
              <div className="text-4xl font-bold text-yellow-500 tracking-tighter font-mono">
                {formatNumber(userRepos.reduce((sum, r) => sum + r.stars, 0))}
              </div>
            </div>
            <div className="bg-black p-8">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4 font-mono">TOKENIZED_REPOS</div>
              <div className="text-4xl font-bold text-green-500 tracking-tighter font-mono">
                {userRepos.filter(r => r.isTokenized).length}
              </div>
            </div>
            <div className="bg-black p-8">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4 font-mono">READY_FOR_MINT</div>
              <div className="text-4xl font-bold text-purple-500 tracking-tighter font-mono">
                {userRepos.filter(r => !r.isTokenized).length}
              </div>
            </div>
          </div>

          {/* Repos List */}
          <div className="grid grid-cols-1 gap-px bg-zinc-900 border border-zinc-900">
            {userRepos.length === 0 ? (
              <div className="text-center py-24 bg-black">
                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">NO_PUBLIC_REPOSITORIES_DETECTED</p>
              </div>
            ) : (
              userRepos.map((repo) => (
                <motion.div
                  key={repo.id}
                  className="p-8 bg-black group hover:bg-zinc-950 transition-all"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-2xl font-bold text-white tracking-tighter uppercase">{repo.name}</h3>
                        {repo.language && (
                          <span className="text-[9px] px-2 py-1 border border-zinc-800 bg-zinc-900 text-zinc-500 font-mono font-bold uppercase tracking-widest">
                            {repo.language}
                          </span>
                        )}
                        {repo.isClaimed && <VerificationBadge level={repo.verificationLevel} />}
                      </div>
                      <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-4">{repo.fullName}</p>
                      <p className="text-sm text-zinc-400 font-mono mb-8 max-w-2xl line-clamp-2">
                        {repo.description || 'NO_DESCRIPTION_MANIFEST_FOUND'}
                      </p>
                      <div className="flex items-center gap-8 text-[10px] font-mono font-bold tracking-widest">
                        <span className="flex items-center gap-2 text-yellow-500">
                          <FaStar size={12} /> {formatNumber(repo.stars)}
                        </span>
                        <span className="flex items-center gap-2 text-zinc-500">
                          <FaCodeBranch size={12} /> {formatNumber(repo.forks)}
                        </span>
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors"
                        >
                          <FaExternalLinkAlt size={10} /> VIEW_ON_GITHUB
                        </a>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {repo.isTokenized ? (
                        <div className="px-8 py-4 border border-green-900 bg-green-950/20 text-green-500 text-[10px] font-bold uppercase tracking-widest font-mono flex items-center gap-3">
                          <FaCheck size={12} />
                          STATUS_TOKENIZED
                        </div>
                      ) : (
                        <Link
                          href={`/portfolio/repos/${repo.name}`}
                          className="px-10 py-5 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all font-mono inline-block"
                        >
                          INITIALIZE_MINT
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}
    </>
  );
}

