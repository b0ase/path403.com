'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDollarSign } from 'react-icons/fa';
import {
  FiFile,
  FiDownload,
  FiDollarSign,
  FiUser,
  FiCheck,
  FiAlertCircle,
  FiClock,
  FiShield,
  FiArrowRight,
  FiExternalLink,
} from 'react-icons/fi';
import { formatFileSize, formatPrice, FEE_SPLIT } from '@/lib/moneybutton/constants';

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price_usd: number;
  file_name: string;
  file_size: number;
  mime_type: string;
  download_count: number;
  seller_handcash: string;
  created_at: string;
}

interface PurchaseResult {
  downloadToken: string;
  expiresAt: string;
  maxDownloads: number;
  transactionId: string;
  listing: {
    id: string;
    title: string;
    fileName: string;
  };
}

export default function DownloadPage() {
  const params = useParams();
  const id = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [purchasing, setPurchasing] = useState(false);
  const [purchase, setPurchase] = useState<PurchaseResult | null>(null);

  const [downloading, setDownloading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadsRemaining, setDownloadsRemaining] = useState<number | null>(null);

  // Existing token from URL (for returning buyers)
  const [existingToken, setExistingToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for token in URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) {
        setExistingToken(token);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`/api/moneybutton/download/${id}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setListing(data.listing);
        } else {
          setError(data.error || 'Listing not found');
        }
      } catch (err) {
        setError('Failed to load listing');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchListing();
    }
  }, [id]);

  const handlePurchase = async () => {
    if (!listing) return;

    setPurchasing(true);
    setError(null);

    try {
      // For now, we'll prompt user to connect HandCash
      // In production, this would use HandCash Connect flow
      const authToken = prompt('Enter your HandCash auth token to complete purchase:');

      if (!authToken) {
        setPurchasing(false);
        return;
      }

      const buyerHandcash = prompt('Enter your HandCash handle (without $):');

      if (!buyerHandcash) {
        setPurchasing(false);
        return;
      }

      const res = await fetch(`/api/moneybutton/download/${id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authToken,
          buyerHandcash,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPurchase(data.purchase);
        // Update URL with token for future visits
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('token', data.purchase.downloadToken);
        window.history.replaceState({}, '', newUrl.toString());
      } else {
        setError(data.error || 'Purchase failed');
      }
    } catch (err) {
      setError('Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleDownload = async (token: string) => {
    if (!listing) return;

    setDownloading(true);
    setError(null);

    try {
      const res = await fetch(`/api/moneybutton/download/${id}/file?token=${token}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setDownloadUrl(data.download.url);
        setDownloadsRemaining(data.download.downloadsRemaining);
        // Auto-trigger download
        const link = document.createElement('a');
        link.href = data.download.url;
        link.download = data.download.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setError(data.error || 'Download failed');
      }
    } catch (err) {
      setError('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Get file type icon/badge
  const getFileTypeBadge = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType.startsWith('video/')) return 'VIDEO';
    if (mimeType.startsWith('audio/')) return 'AUDIO';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('zip')) return 'ZIP';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'XLSX';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'DOCX';
    return 'FILE';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="text-4xl text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Listing Not Found</h1>
          <p className="text-zinc-500 mb-4">{error || 'This file is no longer available.'}</p>
          <Link
            href="/moneybutton"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            ← Back to MoneyButton
          </Link>
        </div>
      </div>
    );
  }

  const hasPurchased = purchase || existingToken;
  const activeToken = purchase?.downloadToken || existingToken;

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

      <div className="max-w-2xl mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            href="/moneybutton"
            className="text-zinc-500 text-sm hover:text-white transition-colors mb-4 inline-block"
          >
            ← Back to MoneyButton
          </Link>
        </motion.div>

        {/* Listing Card */}
        <motion.div
          className="border border-zinc-800 bg-black/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* File Preview Header */}
          <div className="border-b border-zinc-800 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                <FiFile className="text-2xl text-zinc-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 uppercase">
                    {getFileTypeBadge(listing.mime_type)}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {formatFileSize(listing.file_size)}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-white mb-1 truncate">
                  {listing.title}
                </h1>
                <p className="text-xs text-zinc-500">
                  {listing.file_name}
                </p>
              </div>
            </div>

            {listing.description && (
              <p className="mt-4 text-zinc-400 text-sm">
                {listing.description}
              </p>
            )}
          </div>

          {/* Seller Info */}
          <div className="border-b border-zinc-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiUser className="text-zinc-500" />
              <span className="text-sm text-zinc-400">Seller:</span>
              <span className="text-sm text-white">${listing.seller_handcash}</span>
            </div>
            <div className="text-xs text-zinc-600">
              {listing.download_count} sales
            </div>
          </div>

          {/* Price & Action */}
          <div className="p-6">
            {!hasPurchased ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Price</p>
                    <p className="text-3xl font-bold text-white">
                      {formatPrice(listing.price_usd)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500 mb-1">Seller receives 95%</p>
                    <p className="text-sm text-green-400">
                      {formatPrice(listing.price_usd * FEE_SPLIT.SELLER_PERCENTAGE)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full bg-blue-500 text-black py-4 text-sm font-bold uppercase tracking-wider hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {purchasing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaDollarSign />
                      Buy with HandCash
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <FiShield className="text-green-500" />
                    Secure payment
                  </span>
                  <span className="flex items-center gap-1">
                    <FiDownload />
                    5 downloads
                  </span>
                  <span className="flex items-center gap-1">
                    <FiClock />
                    7 day access
                  </span>
                </div>
              </>
            ) : (
              /* Post-Purchase View */
              <div>
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <FiCheck className="text-green-400" />
                    <span className="text-green-400 font-bold text-sm">Purchase Complete</span>
                  </div>
                  {purchase && (
                    <p className="text-xs text-zinc-500">
                      Transaction: {purchase.transactionId}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => activeToken && handleDownload(activeToken)}
                  disabled={downloading}
                  className="w-full bg-green-500 text-black py-4 text-sm font-bold uppercase tracking-wider hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {downloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Preparing Download...
                    </>
                  ) : (
                    <>
                      <FiDownload />
                      Download File
                    </>
                  )}
                </button>

                {downloadsRemaining !== null && (
                  <p className="mt-3 text-center text-xs text-zinc-500">
                    {downloadsRemaining} downloads remaining
                  </p>
                )}

                {downloadUrl && (
                  <div className="mt-4 p-3 bg-zinc-900 border border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-2">Direct download link (15 min expiry):</p>
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 text-xs hover:text-blue-300 break-all flex items-center gap-1"
                    >
                      Open in new tab <FiExternalLink />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mt-4 border border-red-500/30 bg-red-900/10 p-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center gap-3 text-red-400">
                <FiAlertCircle />
                <span className="text-sm">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sell Your Own */}
        <motion.div
          className="mt-8 border border-blue-500/30 bg-blue-900/10 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">
                Want to sell your own files?
              </h3>
              <p className="text-xs text-zinc-500">
                Upload any file and earn 95% of each sale
              </p>
            </div>
            <Link
              href="/moneybutton/upload"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-blue-400 transition-colors whitespace-nowrap"
            >
              Start Selling <FiArrowRight />
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
