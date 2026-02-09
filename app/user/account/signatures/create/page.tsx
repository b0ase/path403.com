'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit3, FiType, FiCheck, FiLoader, FiShield, FiArrowLeft, FiUpload } from 'react-icons/fi';
import {
  SignatureCanvas,
  TypedSignature,
  WalletSigningModal,
  SignatureDisplay,
} from '@/components/bitsign';

type SignatureType = 'drawn' | 'typed' | 'upload';
type Step = 'create' | 'verify' | 'review' | 'saving';

export default function CreateSignaturePage() {
  const router = useRouter();


  // Step management
  const [step, setStep] = useState<Step>('create');
  const [signatureType, setSignatureType] = useState<SignatureType>('drawn');

  // Signature data
  const [svgData, setSvgData] = useState<string | null>(null);
  const [svgThumbnail, setSvgThumbnail] = useState<string | null>(null);
  const [typedText, setTypedText] = useState('');
  const [typedFont, setTypedFont] = useState('dancing-script');
  const [typedSvg, setTypedSvg] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Wallet verification
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletData, setWalletData] = useState<{
    walletType: string;
    walletAddress: string;
    signature: string;
    message: string;
  } | null>(null);

  // Form state
  const [signatureName, setSignatureName] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle drawn signature changes
  const handleDrawnSignatureChange = useCallback((svg: string | null, thumbnail: string | null) => {
    setSvgData(svg);
    setSvgThumbnail(thumbnail);
  }, []);

  // Handle typed signature changes
  const handleTypedSignatureChange = useCallback((text: string, font: string, svg: string | null) => {
    setTypedText(text);
    setTypedFont(font);
    setTypedSvg(svg);
  }, []);

  // --- Persistence Logic ---
  const STORAGE_KEY = 'bitsign_draft_state';

  // Restore state on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStep(parsed.step || 'create');
        setSignatureType(parsed.signatureType || 'drawn');
        setSvgData(parsed.svgData);
        setSvgThumbnail(parsed.svgThumbnail);
        setTypedText(parsed.typedText || '');
        setTypedFont(parsed.typedFont || 'dancing-script');
        setTypedSvg(parsed.typedSvg);
        setUploadedImage(parsed.uploadedImage);
        setSignatureName(parsed.signatureName || '');
        // If we were in verification step, reopen modal if needed, or better yet, stay on verify step
        if (parsed.step === 'verify') {
          // We don't auto-open modal to avoid annoying popups, but user is on the right step
        }
      } catch (e) {
        console.error('Failed to parse draft state', e);
      }
    }
  }, []);

  // Save state on changes
  useEffect(() => {
    const state = {
      step,
      signatureType,
      svgData,
      svgThumbnail,
      typedText,
      typedFont,
      typedSvg,
      uploadedImage,
      signatureName
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [step, signatureType, svgData, svgThumbnail, typedText, typedFont, typedSvg, uploadedImage, signatureName]);

  // Clear state on successful save
  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);


  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('Image too large. Please upload an image under 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Check if signature is ready
  const hasSignature = signatureType === 'drawn' ? !!svgData : signatureType === 'typed' ? !!typedText : !!uploadedImage;

  // Generate wallet verification message
  const generateVerificationMessage = () => {
    const timestamp = new Date().toISOString();
    const nonce = crypto.randomUUID();

    return `BitSign Signature Verification
================================
I am creating a digital signature on b0ase.com

Signature Type: ${signatureType}
Timestamp: ${timestamp}
Nonce: ${nonce}

By signing this message, I confirm:
1. This signature belongs to me
2. I authorize its use for document signing
3. I understand it may be inscribed on blockchain`;
  };

  // Handle wallet verification complete
  const handleWalletSignComplete = (result: {
    walletType: string;
    walletAddress: string;
    signature: string;
    message: string;
  }) => {
    setWalletData(result);
    setShowWalletModal(false);
    setStep('review');
  };

  // Save signature
  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/signatures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature_name: signatureName || 'Default',
          signature_type: signatureType,
          svg_data: signatureType === 'drawn' ? svgData : typedSvg,
          svg_thumbnail: signatureType === 'drawn' ? svgThumbnail : null,
          image_data: signatureType === 'upload' ? uploadedImage : null,
          typed_text: signatureType === 'typed' ? typedText : null,
          typed_font: signatureType === 'typed' ? typedFont : null,
          wallet_type: walletData?.walletType,
          wallet_address: walletData?.walletAddress,
          verification_message: walletData?.message,
          wallet_signature: walletData?.signature,
          is_default: isDefault,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save signature');
      }

      // Clear draft state
      clearDraft();

      // Redirect to signatures page
      router.push('/user/account/signatures');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save signature');
      setSaving(false);
    }
  };

  // Skip wallet verification
  const handleSkipVerification = () => {
    setStep('review');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/user/account/signatures"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-4"
          >
            <FiArrowLeft size={14} />
            Back to Signatures
          </Link>
          <h1 className="text-3xl font-bold uppercase tracking-tight">Create Signature</h1>
          <p className="text-zinc-400 mt-2">
            Create your digital signature for document signing.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-12">
          {['create', 'verify', 'review'].map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${step === s
                  ? 'bg-white text-black'
                  : ['create', 'verify', 'review'].indexOf(step) > i
                    ? 'bg-green-500 text-white'
                    : 'bg-zinc-800 text-zinc-500'
                  }`}
              >
                {['create', 'verify', 'review'].indexOf(step) > i ? (
                  <FiCheck size={14} />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div
                  className={`flex-1 h-0.5 ${['create', 'verify', 'review'].indexOf(step) > i
                    ? 'bg-green-500'
                    : 'bg-zinc-800'
                    }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Create Signature */}
          {step === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Signature Type Toggle */}
              <div className="flex gap-2 mb-8">
                <button
                  onClick={() => setSignatureType('drawn')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border ${signatureType === 'drawn'
                    ? 'bg-white text-black border-white'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                    } transition-colors`}
                >
                  <FiEdit3 size={18} />
                  Draw Signature
                </button>
                <button
                  onClick={() => setSignatureType('typed')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border ${signatureType === 'typed'
                    ? 'bg-white text-black border-white'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                    } transition-colors`}
                >
                  <FiType size={18} />
                  Type Signature
                </button>
                <button
                  onClick={() => setSignatureType('upload')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border ${signatureType === 'upload'
                    ? 'bg-white text-black border-white'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                    } transition-colors`}
                >
                  <FiUpload size={18} />
                  Upload Image
                </button>
              </div>

              {/* Signature Input */}
              {signatureType === 'drawn' ? (
                <SignatureCanvas
                  onSignatureChange={handleDrawnSignatureChange}
                  strokeColor="#000000"
                  backgroundColor="#ffffff"
                />
              ) : signatureType === 'upload' ? (
                <div className="w-full aspect-[3/1] bg-white rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-zinc-300 hover:border-zinc-400 transition-colors relative">
                  {uploadedImage ? (
                    <div className="relative w-full h-full group">
                      <img
                        src={uploadedImage}
                        alt="Uploaded Signature"
                        className="w-full h-full object-contain p-4"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white font-bold">Click to Change</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <FiUpload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                      <p className="text-zinc-500 text-sm font-medium">Click to upload signature image</p>
                      <p className="text-zinc-400 text-xs mt-1">PNG or JPG, under 2MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              ) : (
                <TypedSignature onSignatureChange={handleTypedSignatureChange} />
              )}

              {/* Continue Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setStep('verify')}
                  disabled={!hasSignature}
                  className="px-6 py-3 bg-white text-black font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-200 transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Verify with Wallet */}
          {step === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiShield className="w-10 h-10 text-zinc-400" />
              </div>

              <h2 className="text-2xl font-bold mb-4">Verify Your Identity</h2>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                Sign a message with your crypto wallet to verify this signature belongs to you.
                This adds an extra layer of authenticity.
              </p>

              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="px-6 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                >
                  Connect Wallet
                </button>
                <button
                  onClick={handleSkipVerification}
                  className="px-6 py-3 text-zinc-400 hover:text-white text-sm transition-colors"
                >
                  Skip verification for now
                </button>
              </div>

              <button
                onClick={() => setStep('create')}
                className="mt-8 text-sm text-zinc-500 hover:text-white"
              >
                &larr; Back to signature
              </button>
            </motion.div>
          )}

          {/* Step 3: Review & Save */}
          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold mb-6">Review & Save</h2>

              {/* Signature Preview */}
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">
                  Your Signature
                </label>
                <SignatureDisplay
                  signature={{
                    id: 'preview',
                    signature_type: signatureType,
                    svg_data: signatureType === 'drawn' ? svgData || undefined : typedSvg || undefined,
                    image_data: signatureType === 'upload' ? uploadedImage || undefined : undefined,
                    typed_text: signatureType === 'typed' ? typedText : undefined,
                    typed_font: signatureType === 'typed' ? typedFont : undefined,
                    wallet_address: walletData?.walletAddress,
                    wallet_type: walletData?.walletType,
                  }}
                  size="lg"
                />
              </div>

              {/* Signature Name */}
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">
                  Signature Name (Optional)
                </label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="e.g., Personal, Business, Contracts..."
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                />
              </div>

              {/* Default Checkbox */}
              <label className="flex items-center gap-3 mb-8 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-5 h-5 bg-zinc-900 border border-zinc-700 rounded checked:bg-white"
                />
                <span className="text-zinc-300">Set as my default signature</span>
              </label>

              {/* Verification Status */}
              {walletData && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg mb-6">
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <FiCheck size={16} />
                    Verified with {walletData.walletType}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 font-mono">
                    {walletData.walletAddress}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-6 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep('verify')}
                  className="px-6 py-3 text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-white text-black font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <FiLoader className="animate-spin" size={18} />
                      Saving...
                    </>
                  ) : (
                    'Save Signature'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wallet Modal */}
        <WalletSigningModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          onSignComplete={handleWalletSignComplete}
          message={generateVerificationMessage()}
          title="Verify Signature Ownership"
        />
      </div>
    </div>
  );
}
