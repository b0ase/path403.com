'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa';
import MilestoneTracker from '@/components/marketplace/MilestoneTracker';

/**
 * Contract Detail Page
 *
 * Shows full contract details with milestone tracker.
 */

interface ContractDetail {
  id: string;
  contractSlug: string;
  serviceTitle: string;
  serviceDescription: string;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  contractStatus: string;
  escrowStatus: string;
  createdAt: string;
  startDate?: string;
  completedAt?: string;
  inscriptionTxid?: string;
  inscriptionUrl?: string;
  contractHash?: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  developer: {
    id: string;
    name: string;
    username: string;
  } | null;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    amount: number;
    currency: string;
    status: string;
    deliverableDescription?: string;
    deliverableUrls?: string[];
    developerNotes?: string;
    clientFeedback?: string;
    requestedChanges?: string;
    rejectionReason?: string;
    submittedAt?: string;
    approvedAt?: string;
    rejectedAt?: string;
  }>;
  userRole: 'client' | 'developer';
}

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContract();
  }, [contractId]);

  const fetchContract = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/marketplace/contracts/user`);

      if (!response.ok) {
        throw new Error('Failed to fetch contract');
      }

      const data = await response.json();
      const foundContract = data.contracts.find((c: any) => c.id === contractId);

      if (!foundContract) {
        throw new Error('Contract not found');
      }

      setContract(foundContract);
    } catch (err) {
      console.error('[contract-detail] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load contract');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xs text-zinc-600">Loading contract...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="px-4 md:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="border border-zinc-900 bg-zinc-950 p-6">
              <p className="text-xs text-zinc-500">{error || 'Contract not found'}</p>
              <Link
                href="/dashboard/contracts"
                className="text-xs text-white hover:text-zinc-400 font-mono uppercase mt-4 inline-block"
              >
                ← Back to Contracts
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4 md:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link
            href="/dashboard/contracts"
            className="text-xs text-zinc-600 hover:text-white mb-8 inline-flex items-center gap-2 font-mono uppercase transition-colors"
          >
            <FaArrowLeft className="text-xs" />
            All Contracts
          </Link>

          {/* Header */}
          <div className="mb-8 border-b border-zinc-900 pb-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-2">
              {contract.serviceTitle}
            </h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">
              Contract ID: {contract.id.slice(0, 8)}
            </p>
          </div>

          {/* Contract Details */}
          <div className="border border-zinc-900 p-6 mb-8">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
              Contract Details
            </h2>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-zinc-600 uppercase font-mono mb-1">Status</p>
                <p className="text-sm text-white uppercase">{contract.contractStatus}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 uppercase font-mono mb-1">Total Amount</p>
                <p className="text-sm text-white">
                  {contract.currency}{contract.totalAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 uppercase font-mono mb-1">Payment Method</p>
                <p className="text-sm text-white uppercase">{contract.paymentMethod}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 uppercase font-mono mb-1">Your Role</p>
                <p className="text-sm text-white uppercase">{contract.userRole}</p>
              </div>
            </div>

            <div className="border-t border-zinc-900 pt-4">
              <p className="text-xs text-zinc-600 uppercase font-mono mb-2">Description</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {contract.serviceDescription}
              </p>
            </div>
          </div>

          {/* Parties */}
          <div className="border border-zinc-900 p-6 mb-8">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
              Parties
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-zinc-600 uppercase font-mono mb-2">Client</p>
                <p className="text-sm text-white">{contract.client.name || 'Unknown'}</p>
                <p className="text-xs text-zinc-500 font-mono mt-1">{contract.client.email}</p>
              </div>
              {contract.developer && (
                <div>
                  <p className="text-xs text-zinc-600 uppercase font-mono mb-2">Developer</p>
                  <p className="text-sm text-white">
                    {contract.developer.name || contract.developer.username}
                  </p>
                  <p className="text-xs text-zinc-500 font-mono mt-1">
                    @{contract.developer.username}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Blockchain Proof */}
          {contract.inscriptionTxid && (
            <div className="border border-zinc-900 bg-zinc-950 p-6 mb-8">
              <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
                Blockchain Proof
              </h2>
              <p className="text-xs text-zinc-400 mb-4">
                This contract has been permanently inscribed on the BSV blockchain for immutable proof of existence.
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-zinc-600 uppercase font-mono mb-1">Transaction ID</p>
                  <p className="text-xs text-white font-mono break-all">{contract.inscriptionTxid}</p>
                </div>
                {contract.contractHash && (
                  <div>
                    <p className="text-xs text-zinc-600 uppercase font-mono mb-1">Contract Hash</p>
                    <p className="text-xs text-white font-mono break-all">{contract.contractHash}</p>
                  </div>
                )}
                <a
                  href={contract.inscriptionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white hover:text-zinc-400 font-mono uppercase inline-flex items-center gap-2 mt-2"
                >
                  View on Blockchain Explorer <FaExternalLinkAlt className="text-[10px]" />
                </a>
              </div>
            </div>
          )}

          {/* Milestones */}
          {contract.milestones.length > 0 && (
            <MilestoneTracker
              contractId={contract.id}
              milestones={contract.milestones}
              userRole={contract.userRole}
              onMilestoneUpdate={fetchContract}
            />
          )}
        </div>
      </div>
    </div>
  );
}
