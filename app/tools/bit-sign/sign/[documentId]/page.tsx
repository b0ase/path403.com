'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiLoader,
  FiCheck,
  FiAlertCircle,
  FiFileText,
  FiShield,
  FiExternalLink,
} from 'react-icons/fi';
import { SignatureDisplay, WalletSigningModal } from '@/components/bitsign';
import { generateSigningMessage } from '@/lib/bitsign-inscription';

interface UserSignature {
  id: string;
  signature_name: string;
  signature_type: 'drawn' | 'typed';
  svg_data?: string;
  typed_text?: string;
  typed_font?: string;
  wallet_address?: string;
  wallet_type?: string;
  is_default?: boolean;
}

interface DocumentInfo {
  id: string;
  type: string;
  title: string;
  content?: string;
  hash?: string;
}

export default function SignDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.documentId as string;

  // State
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState<DocumentInfo | null>(null);
  const [documentHash, setDocumentHash] = useState<string | null>(null);
  const [signatures, setSignatures] = useState<UserSignature[]>([]);
  const [selectedSignature, setSelectedSignature] = useState<UserSignature | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signResult, setSignResult] = useState<{
    id: string;
    inscription_txid?: string;
    inscription_url?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inscribe, setInscribe] = useState(true);

  // Hash document content
  const hashContent = useCallback(async (content: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }, []);

  // Fetch document and signatures
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user's signatures
        const sigResponse = await fetch('/api/signatures');
        const sigData = await sigResponse.json();

        if (sigData.signatures) {
          setSignatures(sigData.signatures);
          const defaultSig = sigData.signatures.find((s: UserSignature) => s.is_default);
          setSelectedSignature(defaultSig || sigData.signatures[0] || null);
        }

        // For demo purposes, create a mock document if ID is 'demo'
        if (documentId === 'demo') {
          const mockDoc = {
            id: 'demo',
            type: 'agreement',
            title: 'Demo Agreement',
            content: `This is a demonstration document for testing the BitSign signing flow.\n\nDate: ${new Date().toISOString()}\n\nBy signing this document, you confirm that you have tested the BitSign feature.`,
          };
          setDocument(mockDoc);
          const hash = await hashContent(mockDoc.content);
          setDocumentHash(hash);
        } else {
          // Try to fetch actual document (from contracts, agreements, etc.)
          // This would need to be adapted based on your document types
          const docResponse = await fetch(`/api/contracts/${documentId}`);

          if (docResponse.ok) {
            const docData = await docResponse.json();
            if (docData.contract) {
              setDocument({
                id: docData.contract.id,
                type: 'contract',
                title: docData.contract.title || 'Untitled Contract',
                content: JSON.stringify(docData.contract),
              });
              const hash = await hashContent(JSON.stringify(docData.contract));
              setDocumentHash(hash);
            }
          } else {
            // Try investor agreements
            const agreementResponse = await fetch(`/api/investors/agreements/${documentId}`);
            if (agreementResponse.ok) {
              const agData = await agreementResponse.json();
              if (agData.agreement) {
                setDocument({
                  id: agData.agreement.id,
                  type: 'investor_agreement',
                  title: agData.agreement.title || 'Investment Agreement',
                  content: JSON.stringify(agData.agreement),
                });
                const hash = await hashContent(JSON.stringify(agData.agreement));
                setDocumentHash(hash);
              }
            } else {
              setError('Document not found');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [documentId, hashContent]);

  // Generate signing message
  const signingMessage = document && documentHash && selectedSignature
    ? generateSigningMessage({
      documentTitle: document.title,
      documentHash,
      walletAddress: selectedSignature.wallet_address || 'wallet-pending',
    })
    : '';

  // Handle wallet signature
  const handleWalletSign = async (result: {
    walletType: string;
    walletAddress: string;
    signature: string;
    message: string;
  }) => {
    setShowWalletModal(false);
    setSigning(true);
    setError(null);

    try {
      const response = await fetch('/api/bitsign/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature_id: selectedSignature?.id,
          document_type: document?.type,
          document_id: document?.id,
          document_hash: documentHash,
          document_title: document?.title,
          message_signed: result.message,
          wallet_signature: result.signature,
          wallet_address: result.walletAddress,
          wallet_type: result.walletType,
          inscribe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign document');
      }

      setSignResult(data.document_signature);
      setSigned(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign document');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error && !document) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <FiAlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Error</h1>
        <p className="text-zinc-400 mb-6">{error}</p>
        <Link
          href="/tools/bit-sign"
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors"
        >
          Back to BitSign
        </Link>
      </div>
    );
  }

  if (signed && signResult) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FiCheck className="w-10 h-10 text-green-500" />
          </motion.div>

          <h1 className="text-3xl font-bold mb-4">Document Signed!</h1>
          <p className="text-zinc-400 mb-8">
            Your signature has been recorded and verified.
          </p>

          {/* Signature Details */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 mb-8 text-left">
            <h3 className="text-sm uppercase tracking-wider text-zinc-500 mb-4">
              Signature Details
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Document</span>
                <span className="font-medium">{document?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Hash</span>
                <span className="font-mono text-xs">
                  {documentHash?.slice(0, 16)}...{documentHash?.slice(-16)}
                </span>
              </div>
              {signResult.inscription_txid && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Blockchain Proof</span>
                  <a
                    href={signResult.inscription_url || `https://whatsonchain.com/tx/${signResult.inscription_txid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-1"
                  >
                    View on BSV <FiExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/user/account/signatures"
              className="px-6 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
            >
              View Signing History
            </Link>
            <Link
              href="/tools/bit-sign"
              className="px-6 py-3 text-zinc-400 hover:text-white transition-colors"
            >
              Back to BitSign
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/tools/bit-sign"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-4"
          >
            <FiArrowLeft size={14} />
            Back to BitSign
          </Link>
          <h1 className="text-3xl font-bold uppercase tracking-tight">Sign Document</h1>
        </div>

        {/* Document Preview */}
        <div className="mb-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiFileText className="w-6 h-6 text-zinc-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">{document?.title}</h2>
              <p className="text-sm text-zinc-500 capitalize">{document?.type.replace('_', ' ')}</p>

              {documentHash && (
                <div className="mt-4 p-3 bg-zinc-950 rounded border border-zinc-800">
                  <div className="text-xs text-zinc-500 mb-1">Document Hash (SHA-256)</div>
                  <div className="font-mono text-xs text-zinc-300 break-all">{documentHash}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Select Signature */}
        <div className="mb-8">
          <h3 className="text-sm uppercase tracking-wider text-zinc-500 mb-4">
            Select Signature
          </h3>

          {signatures.length === 0 ? (
            <div className="p-6 bg-zinc-900/50 border border-dashed border-zinc-700 rounded-lg text-center">
              <p className="text-zinc-400 mb-4">You need to create a signature first</p>
              <Link
                href="/user/account/signatures/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-zinc-200 transition-colors"
              >
                Create Signature
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {signatures.map((sig) => (
                <div
                  key={sig.id}
                  onClick={() => setSelectedSignature(sig)}
                  className={`cursor-pointer transition-all ${selectedSignature?.id === sig.id
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-black'
                      : 'opacity-60 hover:opacity-100'
                    }`}
                >
                  <SignatureDisplay signature={sig} size="sm" />
                  <div className="mt-2 text-xs text-zinc-400">{sig.signature_name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="mb-8">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={inscribe}
              onChange={(e) => setInscribe(e.target.checked)}
              className="w-5 h-5 bg-zinc-900 border border-zinc-700 rounded checked:bg-blue-600"
            />
            <div>
              <span className="text-white">Inscribe on blockchain</span>
              <p className="text-xs text-zinc-500">
                Create permanent proof on BSV blockchain (recommended)
              </p>
            </div>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Sign Button */}
        <button
          onClick={() => setShowWalletModal(true)}
          disabled={!selectedSignature || !documentHash || signing}
          className="w-full px-6 py-4 bg-white text-black font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
        >
          {signing ? (
            <>
              <FiLoader className="animate-spin" size={18} />
              Signing...
            </>
          ) : (
            <>
              <FiShield size={18} />
              Sign with Wallet
            </>
          )}
        </button>

        <p className="mt-4 text-xs text-zinc-500 text-center">
          You will be asked to sign a message with your crypto wallet to verify your identity.
        </p>

        {/* Wallet Modal */}
        <WalletSigningModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          onSignComplete={handleWalletSign}
          message={signingMessage}
          title="Sign Document"
        />
      </div>
    </div>
  );
}
