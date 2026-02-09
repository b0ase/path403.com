'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDollarSign } from 'react-icons/fa';
import {
  FiUpload,
  FiFile,
  FiDollarSign,
  FiMail,
  FiCheck,
  FiAlertCircle,
  FiX,
  FiArrowRight,
  FiInfo,
} from 'react-icons/fi';
import {
  UPLOAD_LIMITS,
  PRICE_LIMITS,
  formatFileSize,
  FEE_SPLIT,
} from '@/lib/moneybutton/constants';

interface UploadForm {
  title: string;
  description: string;
  price: string;
  email: string;
  handcash: string;
}

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listingId, setListingId] = useState<string | null>(null);

  const [form, setForm] = useState<UploadForm>({
    title: '',
    description: '',
    price: '',
    email: '',
    handcash: '',
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (selectedFile.size > UPLOAD_LIMITS.MAX_FILE_SIZE) {
      setError(`File too large. Maximum size is ${UPLOAD_LIMITS.MAX_FILE_SIZE_DISPLAY}`);
      return;
    }
    setFile(selectedFile);
    setError(null);
    // Auto-fill title from filename
    if (!form.title) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
      setForm(prev => ({ ...prev, title: nameWithoutExt }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('email', form.email);
      formData.append('handcash', form.handcash);

      const res = await fetch('/api/moneybutton/download/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUploaded(true);
        setListingId(data.listing.id);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const priceNum = parseFloat(form.price) || 0;
  const sellerEarnings = priceNum * FEE_SPLIT.SELLER_PERCENTAGE;
  const platformFee = priceNum * FEE_SPLIT.PLATFORM_PERCENTAGE;

  if (uploaded && listingId) {
    return (
      <motion.div
        className="min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="px-4 md:px-8 py-16">
          <motion.div
            className="border border-green-500/30 bg-green-900/10 p-8 text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <FiCheck className="text-3xl text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">File Uploaded Successfully</h1>
            <p className="text-zinc-400 mb-6">
              Your file is now listed for sale. Share the link to start earning.
            </p>
            <div className="bg-black/50 border border-zinc-800 p-4 mb-6">
              <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Your listing URL</p>
              <code className="text-blue-400 text-sm break-all">
                {typeof window !== 'undefined' ? `${window.location.origin}/moneybutton/download/${listingId}` : ''}
              </code>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/moneybutton/download/${listingId}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-black text-sm font-bold uppercase tracking-wider hover:bg-blue-400 transition-colors"
              >
                View Listing <FiArrowRight />
              </Link>
              <button
                onClick={() => {
                  setUploaded(false);
                  setFile(null);
                  setForm({ title: '', description: '', price: '', email: '', handcash: '' });
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-zinc-700 text-zinc-400 text-sm font-bold uppercase tracking-wider hover:border-zinc-500 hover:text-white transition-colors"
              >
                Upload Another
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

      <div className="px-4 md:px-8 py-16 relative z-10">
        {/* Header */}
        <motion.div
          className="mb-12 border-b border-zinc-900 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800 self-start">
              <FaDollarSign className="text-4xl md:text-6xl text-white" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                SELL FILES
              </h1>
              <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                PAY-TO-DOWNLOAD
              </div>
            </div>
          </div>
          <p className="text-zinc-400 max-w-2xl">
            Upload any file and set your price. Buyers pay with HandCash, you earn 95%.
            Share your link and start earning instantly.
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
              File *
            </label>
            <div
              className={`border-2 border-dashed transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-500/10'
                  : file
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-zinc-800 hover:border-zinc-700'
              } p-8`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />

              {file ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FiFile className="text-xl text-green-400" />
                    <div>
                      <p className="text-white text-sm font-medium">{file.name}</p>
                      <p className="text-zinc-500 text-xs">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-2 text-zinc-500 hover:text-white transition-colors"
                  >
                    <FiX />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <FiUpload className="text-3xl text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400 text-sm mb-2">
                    Drag and drop your file here, or{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-zinc-600 text-xs">
                    Max {UPLOAD_LIMITS.MAX_FILE_SIZE_DISPLAY}. PDF, images, audio, video, zip, docs
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={255}
              placeholder="My Awesome File"
              className="w-full bg-black border border-zinc-800 px-4 py-3 text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="What's included in this file?"
              className="w-full bg-black border border-zinc-800 px-4 py-3 text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition-colors resize-none"
            />
          </motion.div>

          {/* Price */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
              Price (USD) *
            </label>
            <div className="relative">
              <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min={PRICE_LIMITS.MIN_PRICE_USD}
                max={PRICE_LIMITS.MAX_PRICE_USD}
                step="0.01"
                placeholder="9.99"
                className="w-full bg-black border border-zinc-800 pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            {priceNum > 0 && (
              <div className="mt-2 flex items-center gap-4 text-xs">
                <span className="text-zinc-500">
                  You earn: <span className="text-green-400">${sellerEarnings.toFixed(2)}</span>
                </span>
                <span className="text-zinc-600">|</span>
                <span className="text-zinc-500">
                  Platform fee: <span className="text-zinc-400">${platformFee.toFixed(2)}</span> (5%)
                </span>
              </div>
            )}
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
              Your Email *
            </label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full bg-black border border-zinc-800 pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <p className="text-zinc-600 text-xs mt-1">For purchase notifications</p>
          </motion.div>

          {/* HandCash Handle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
              HandCash Handle *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
              <input
                type="text"
                name="handcash"
                value={form.handcash}
                onChange={handleChange}
                required
                pattern="^[a-zA-Z0-9]{3,20}$"
                placeholder="yourhandle"
                className="w-full bg-black border border-zinc-800 pl-8 pr-4 py-3 text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <p className="text-zinc-600 text-xs mt-1">
              You'll receive 95% of each sale to this handle
            </p>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="border border-red-500/30 bg-red-900/10 p-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-center gap-3 text-red-400">
                  <FiAlertCircle />
                  <span className="text-sm">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full bg-blue-500 text-black py-4 text-sm font-bold uppercase tracking-wider hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FiUpload />
                  Create Listing
                </>
              )}
            </button>
          </motion.div>

          {/* Back Link */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              href="/moneybutton"
              className="text-zinc-500 text-sm hover:text-white transition-colors"
            >
              ← Back to MoneyButton
            </Link>
          </motion.div>
          </form>

          {/* Right Column - Info & Features */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* How It Works */}
            <div className="border border-zinc-800 bg-black p-6">
              <h3 className="text-sm font-bold uppercase mb-4 text-white">How It Works</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-black text-xs font-bold flex items-center justify-center flex-shrink-0">1</div>
                  <div>
                    <p className="text-white text-sm font-medium">Upload your file</p>
                    <p className="text-zinc-500 text-xs">PDF, images, audio, video, zip - up to 500MB</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-black text-xs font-bold flex items-center justify-center flex-shrink-0">2</div>
                  <div>
                    <p className="text-white text-sm font-medium">Set your price</p>
                    <p className="text-zinc-500 text-xs">Any amount from $0.01 to $10,000 USD</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-black text-xs font-bold flex items-center justify-center flex-shrink-0">3</div>
                  <div>
                    <p className="text-white text-sm font-medium">Share your link</p>
                    <p className="text-zinc-500 text-xs">Get a unique URL for your listing</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-green-500 text-black text-xs font-bold flex items-center justify-center flex-shrink-0">$</div>
                  <div>
                    <p className="text-white text-sm font-medium">Get paid instantly</p>
                    <p className="text-zinc-500 text-xs">95% goes directly to your HandCash wallet</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-zinc-800 bg-black p-4">
                <FiDollarSign className="text-xl text-green-400 mb-2" />
                <p className="text-white text-sm font-bold">95% Earnings</p>
                <p className="text-zinc-600 text-xs">Industry-leading payout</p>
              </div>
              <div className="border border-zinc-800 bg-black p-4">
                <FiUpload className="text-xl text-blue-400 mb-2" />
                <p className="text-white text-sm font-bold">500MB Max</p>
                <p className="text-zinc-600 text-xs">Large file support</p>
              </div>
              <div className="border border-zinc-800 bg-black p-4">
                <FiCheck className="text-xl text-purple-400 mb-2" />
                <p className="text-white text-sm font-bold">5 Downloads</p>
                <p className="text-zinc-600 text-xs">Per purchase</p>
              </div>
              <div className="border border-zinc-800 bg-black p-4">
                <FiInfo className="text-xl text-yellow-400 mb-2" />
                <p className="text-white text-sm font-bold">7 Day Access</p>
                <p className="text-zinc-600 text-xs">Token validity</p>
              </div>
            </div>

            {/* Supported Files */}
            <div className="border border-zinc-800 bg-black p-6">
              <h3 className="text-sm font-bold uppercase mb-3 text-white">Supported Files</h3>
              <div className="flex flex-wrap gap-2">
                {['PDF', 'ZIP', 'MP3', 'MP4', 'PNG', 'JPG', 'DOCX', 'XLSX'].map(ext => (
                  <span key={ext} className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
                    {ext}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
