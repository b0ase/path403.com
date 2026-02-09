'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDollarSign } from 'react-icons/fa';
import {
  FiUpload,
  FiDollarSign,
  FiHash,
  FiImage,
  FiCopy,
  FiCheck,
  FiX,
  FiCode,
  FiExternalLink,
  FiInfo,
  FiCircle,
  FiDisc,
} from 'react-icons/fi';

export default function CreateMoneyButtonPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);

  // Form state
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [price, setPrice] = useState('1.00');
  const [supplyType, setSupplyType] = useState<'unlimited' | 'limited'>('unlimited');
  const [maxSupply, setMaxSupply] = useState('1000');
  const [creatorHandle, setCreatorHandle] = useState('');
  const [buttonLabel, setButtonLabel] = useState('Buy Token');

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Generate button ID (would be from database in production)
  const buttonId = tokenSymbol ? tokenSymbol.toLowerCase().replace(/[^a-z0-9]/g, '') : 'mytoken';

  // Generate embed URL
  const embedUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/moneybutton/button/${buttonId}?price=${price}&handle=${creatorHandle}&supply=${supplyType === 'limited' ? maxSupply : 'unlimited'}`
    : '';

  const embedCode = `<!-- MoneyButton: ${tokenName || 'My Token'} -->
<div id="moneybutton-${buttonId}"></div>
<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/moneybutton/embed.js"></script>
<script>
  MoneyButton.render('moneybutton-${buttonId}', {
    token: '${tokenSymbol || 'TOKEN'}',
    price: ${price || '1.00'},
    handle: '${creatorHandle}',
    supply: ${supplyType === 'limited' ? maxSupply : "'unlimited'"},
    label: '${buttonLabel}',
    image: '${imagePreview ? '[your-uploaded-image-url]' : 'default'}'
  });
</script>`;

  const iframeCode = `<iframe
  src="${embedUrl}"
  width="280"
  height="120"
  frameborder="0"
  style="border-radius: 12px; overflow: hidden;"
></iframe>`;

  const copyEmbed = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isValid = tokenName && tokenSymbol && price && creatorHandle;

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="px-4 md:px-8 py-16">
        {/* Header */}
        <motion.div
          className="mb-12 border-b border-zinc-900 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 md:p-6 self-start">
              <FaDollarSign className="text-4xl md:text-6xl text-white" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 leading-none tracking-tighter">
                CREATE BUTTON
              </h1>
              <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                YOUR TOKEN, YOUR RULES
              </div>
            </div>
          </div>
          <p className="text-zinc-400 max-w-2xl">
            Create your own MoneyButton with custom branding. Set your price, limit supply,
            and embed it anywhere. When people click, you get paid and they get tokens.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left: Form */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Image Upload */}
            <div className="border border-zinc-800 bg-black p-6">
              <h3 className="text-sm font-bold uppercase mb-4 text-white flex items-center gap-2">
                <FiImage className="text-purple-400" />
                Button Image
              </h3>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-purple-500/50">
                    <img
                      src={imagePreview}
                      alt="Button preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={removeImage}
                    className="absolute top-0 right-1/2 translate-x-16 -translate-y-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-400"
                  >
                    <FiX size={14} />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 w-full border border-zinc-800 py-2 text-xs text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-zinc-800 hover:border-purple-500/50 p-8 transition-colors"
                >
                  <FiUpload className="text-3xl text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400 text-sm">Click to upload button image</p>
                  <p className="text-zinc-600 text-xs mt-1">PNG, JPG, GIF (max 2MB)</p>
                </button>
              )}
            </div>

            {/* Token Details */}
            <div className="border border-zinc-800 bg-black p-6">
              <h3 className="text-sm font-bold uppercase mb-4 text-white flex items-center gap-2">
                <FiHash className="text-blue-400" />
                Token Details
              </h3>

              <div className="space-y-4">
                {/* Token Name */}
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Token Name *
                  </label>
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="My Awesome Token"
                    className="w-full bg-black border border-zinc-800 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Token Symbol */}
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Token Symbol *
                  </label>
                  <input
                    type="text"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value.toUpperCase().slice(0, 10))}
                    placeholder="TOKEN"
                    maxLength={10}
                    className="w-full bg-black border border-zinc-800 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none uppercase"
                  />
                  <p className="text-zinc-600 text-xs mt-1">3-10 characters, uppercase</p>
                </div>

                {/* Button Label */}
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={buttonLabel}
                    onChange={(e) => setButtonLabel(e.target.value)}
                    placeholder="Buy Token"
                    className="w-full bg-black border border-zinc-800 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Supply */}
            <div className="border border-zinc-800 bg-black p-6">
              <h3 className="text-sm font-bold uppercase mb-4 text-white flex items-center gap-2">
                <FiDollarSign className="text-green-400" />
                Pricing & Supply
              </h3>

              <div className="space-y-4">
                {/* Price */}
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Price per Token (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min="0.01"
                      step="0.01"
                      placeholder="1.00"
                      className="w-full bg-black border border-zinc-800 pl-8 pr-4 py-3 text-white placeholder-zinc-600 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Supply Type */}
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Token Supply
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSupplyType('unlimited')}
                      className={`p-4 border ${
                        supplyType === 'unlimited'
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-zinc-800 hover:border-zinc-700'
                      } transition-colors`}
                    >
                      <FiCircle className={`text-xl mx-auto mb-2 ${supplyType === 'unlimited' ? 'text-purple-400' : 'text-zinc-600'}`} />
                      <p className="text-sm font-bold">Unlimited</p>
                      <p className="text-xs text-zinc-500">Infinite supply</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSupplyType('limited')}
                      className={`p-4 border ${
                        supplyType === 'limited'
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-zinc-800 hover:border-zinc-700'
                      } transition-colors`}
                    >
                      <FiDisc className={`text-xl mx-auto mb-2 ${supplyType === 'limited' ? 'text-purple-400' : 'text-zinc-600'}`} />
                      <p className="text-sm font-bold">Limited</p>
                      <p className="text-xs text-zinc-500">Fixed supply</p>
                    </button>
                  </div>
                </div>

                {/* Max Supply (if limited) */}
                <AnimatePresence>
                  {supplyType === 'limited' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                        Maximum Supply
                      </label>
                      <input
                        type="number"
                        value={maxSupply}
                        onChange={(e) => setMaxSupply(e.target.value)}
                        min="1"
                        placeholder="1000"
                        className="w-full bg-black border border-zinc-800 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                      />
                      <p className="text-zinc-600 text-xs mt-1">
                        Total tokens that can ever be minted
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* HandCash Handle */}
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Your HandCash Handle *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                    <input
                      type="text"
                      value={creatorHandle}
                      onChange={(e) => setCreatorHandle(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      placeholder="yourhandle"
                      className="w-full bg-black border border-zinc-800 pl-8 pr-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-zinc-600 text-xs mt-1">You'll receive payments here</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Preview & Embed */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Preview */}
            <div className="border border-zinc-800 bg-black p-6">
              <h3 className="text-sm font-bold uppercase mb-6 text-white">Live Preview</h3>

              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-xl p-6 w-72">
                  {/* Button */}
                  <motion.button
                    className="w-full relative"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-purple-500/50 shadow-lg shadow-purple-500/20 mb-4"
                      style={{
                        background: imagePreview ? `url(${imagePreview}) center/cover` : 'linear-gradient(135deg, #a855f7, #ec4899)',
                      }}
                    >
                      {!imagePreview && (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaDollarSign className="text-3xl text-white/80" />
                        </div>
                      )}
                    </div>

                    <div className="text-center mb-3">
                      <p className="text-white font-bold">{tokenName || 'Token Name'}</p>
                      <p className="text-zinc-500 text-xs">${tokenSymbol || 'SYMBOL'}</p>
                    </div>

                    <div className="bg-purple-500 hover:bg-purple-400 text-white py-3 px-6 rounded-lg font-bold text-sm transition-colors">
                      {buttonLabel || 'Buy Token'} - ${parseFloat(price || '0').toFixed(2)}
                    </div>
                  </motion.button>

                  {/* Token Info */}
                  <div className="mt-4 pt-4 border-t border-zinc-800 text-center">
                    <p className="text-xs text-zinc-500">
                      {supplyType === 'limited'
                        ? `Limited: ${parseInt(maxSupply || '0').toLocaleString()} tokens`
                        : 'Unlimited supply'}
                    </p>
                    {creatorHandle && (
                      <p className="text-xs text-zinc-600 mt-1">Pays ${creatorHandle}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Embed Code */}
            <div className="border border-zinc-800 bg-black p-6">
              <h3 className="text-sm font-bold uppercase mb-4 text-white flex items-center gap-2">
                <FiCode className="text-blue-400" />
                Embed Code
              </h3>

              {isValid ? (
                <div className="space-y-4">
                  {/* Simple iframe embed */}
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Simple Embed (iframe)</p>
                    <div className="bg-zinc-900 p-3 font-mono text-xs text-zinc-400 overflow-x-auto rounded">
                      <pre className="whitespace-pre-wrap">{iframeCode}</pre>
                    </div>
                    <button
                      onClick={() => copyEmbed(iframeCode)}
                      className="mt-2 w-full border border-zinc-800 py-2 text-xs hover:border-zinc-600 transition-colors flex items-center justify-center gap-2"
                    >
                      {copied ? <><FiCheck /> Copied!</> : <><FiCopy /> Copy iframe Code</>}
                    </button>
                  </div>

                  {/* Advanced embed */}
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Advanced Embed (JavaScript)</p>
                    <div className="bg-zinc-900 p-3 font-mono text-[10px] text-zinc-400 overflow-x-auto rounded max-h-40">
                      <pre className="whitespace-pre-wrap">{embedCode}</pre>
                    </div>
                    <button
                      onClick={() => copyEmbed(embedCode)}
                      className="mt-2 w-full border border-zinc-800 py-2 text-xs hover:border-zinc-600 transition-colors flex items-center justify-center gap-2"
                    >
                      {copied ? <><FiCheck /> Copied!</> : <><FiCopy /> Copy JS Code</>}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiInfo className="text-3xl text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm">Fill in all required fields to generate embed code</p>
                </div>
              )}
            </div>

            {/* How It Works */}
            <div className="border border-zinc-800 bg-black p-6">
              <h3 className="text-sm font-bold uppercase mb-4 text-white">How It Works</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-purple-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 rounded-full">1</div>
                  <p className="text-zinc-400">Design your button with custom image & details</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-purple-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 rounded-full">2</div>
                  <p className="text-zinc-400">Set your price and supply (limited or unlimited)</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-purple-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 rounded-full">3</div>
                  <p className="text-zinc-400">Copy the embed code and paste it on your site</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-green-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 rounded-full">
                    <FiCheck size={12} />
                  </div>
                  <p className="text-zinc-400">You get paid, buyers get tokens!</p>
                </div>
              </div>
            </div>

            {/* Stats Preview */}
            <div className="border border-purple-500/30 bg-purple-900/10 p-6">
              <h3 className="text-sm font-bold uppercase mb-4 text-white">Revenue Potential</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500">Price per token</p>
                  <p className="text-xl font-bold text-white">${parseFloat(price || '0').toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">
                    {supplyType === 'limited' ? 'Max Revenue' : 'Per 1000 sales'}
                  </p>
                  <p className="text-xl font-bold text-green-400">
                    ${(parseFloat(price || '0') * (supplyType === 'limited' ? parseInt(maxSupply || '0') : 1000)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Back Link */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            href="/moneybutton"
            className="text-zinc-500 text-sm hover:text-white transition-colors"
          >
            ← Back to MoneyButton
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
