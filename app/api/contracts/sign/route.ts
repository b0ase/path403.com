/**
 * POST /api/contracts/sign
 *
 * Sign a contract (adds signature, triggers inscription if fully signed)
 */

import { NextRequest, NextResponse } from 'next/server';
import { addSignature, generateInscriptionMarkdown, hashContract } from '@/lib/contracts/generator';
import { PipelineContract } from '@/lib/contracts/types';
import { inscribePipelineContract, pipelineContractToInscriptionData } from '@/lib/bsv-inscription';

// In-memory contract store for demo (use database in production)
const CONTRACT_STORE: Record<string, PipelineContract> = {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractId, method, walletType, verificationCode, walletSignature } = body;

    if (!contractId || !method) {
      return NextResponse.json(
        { error: 'Missing required fields: contractId, method' },
        { status: 400 }
      );
    }

    // Validate method
    if (!['wallet', 'email', 'manual'].includes(method)) {
      return NextResponse.json(
        { error: 'Invalid signature method. Use: wallet, email, or manual' },
        { status: 400 }
      );
    }

    // In production: fetch contract from database
    // For demo: create mock contract if not exists
    let contract = CONTRACT_STORE[contractId];

    if (!contract) {
      // Create demo contract
      contract = {
        id: contractId,
        templateId: 'flexible-gig',
        templateVersion: '1.0.0',
        client: {
          id: 'client-b0ase',
          name: 'b0ase Ventures',
          email: 'contracts@b0ase.com',
          companyName: 'b0ase Ltd',
          companyNumber: '12345678',
        },
        contractor: {
          id: 'contractor-demo',
          name: 'Demo Contractor',
          email: 'contractor@example.com',
        },
        title: 'Demo Contract',
        description: 'Demo contract for testing',
        phase: 'operations',
        status: 'pending_sign',
        content: '# Demo Contract\n\nThis is a demo contract.',
        contentHash: hashContract('# Demo Contract\n\nThis is a demo contract.'),
        paymentTerms: {
          totalAmount: 500,
          currency: 'GBP',
          paymentSchedule: 'milestone',
          escrowRequired: true,
        },
        deliverables: [],
        startDate: new Date(),
        signatures: [],
        inscribed: false,
        source: { type: 'gig', sourceId: 'demo' },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        version: 1,
      };
      CONTRACT_STORE[contractId] = contract;
    }

    // Verify email code if using email method
    if (method === 'email') {
      // In production: verify code against stored/sent code
      // For demo: accept any 6-digit code or skip verification
      if (verificationCode && verificationCode.length < 4) {
        return NextResponse.json(
          { error: 'Invalid verification code' },
          { status: 400 }
        );
      }
    }

    // Verify wallet signature if using wallet method
    if (method === 'wallet') {
      // In production: verify cryptographic signature
      // For demo: accept any wallet type
      if (!walletType) {
        return NextResponse.json(
          { error: 'Wallet type required for wallet signing' },
          { status: 400 }
        );
      }
    }

    // Determine which party is signing (for demo, assume contractor)
    // In production: determine from authenticated session
    const partyType: 'client' | 'contractor' = 'contractor';
    const partyInfo = partyType === 'client' ? contract.client : contract.contractor;

    // Check if already signed by this party
    const alreadySigned = contract.signatures.some(s => s.partyType === partyType);
    if (alreadySigned) {
      return NextResponse.json(
        { error: `Contract already signed by ${partyType}` },
        { status: 400 }
      );
    }

    // Add signature
    const updatedContract = addSignature(contract, {
      partyId: partyInfo.id,
      partyType,
      partyName: partyInfo.name,
      partyEmail: partyInfo.email,
      partyWallet: partyInfo.wallet,
      signatureMethod: method,
      walletType: method === 'wallet' ? walletType : undefined,
    });

    // Update store
    CONTRACT_STORE[contractId] = updatedContract;

    // Check if fully signed
    const clientSigned = updatedContract.signatures.some(s => s.partyType === 'client');
    const contractorSigned = updatedContract.signatures.some(s => s.partyType === 'contractor');
    const fullySigned = clientSigned && contractorSigned;

    let inscriptionResult = null;

    // If fully signed, inscribe on blockchain
    if (fullySigned) {
      try {
        // Check if BSV inscription is configured
        if (process.env.BSV_PRIVATE_KEY) {
          // Convert contract to inscription data
          const inscriptionData = pipelineContractToInscriptionData(updatedContract);

          // Inscribe on BSV blockchain as 1Sat Ordinal
          const result = await inscribePipelineContract(inscriptionData);

          inscriptionResult = {
            txId: result.txid,
            url: result.blockchainExplorerUrl,
          };

          // Update contract with inscription info
          updatedContract.inscribed = true;
          updatedContract.inscriptionTxId = result.txid;
          updatedContract.inscriptionUrl = result.blockchainExplorerUrl;
          updatedContract.inscribedAt = new Date();
          updatedContract.status = 'active';

          console.log(`Contract ${contractId} inscribed: ${result.txid}`);
        } else {
          // Demo mode: simulate inscription
          const mockTxId = `tx_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

          inscriptionResult = {
            txId: mockTxId,
            url: `https://whatsonchain.com/tx/${mockTxId}`,
          };

          updatedContract.inscribed = true;
          updatedContract.inscriptionTxId = mockTxId;
          updatedContract.inscriptionUrl = inscriptionResult.url;
          updatedContract.inscribedAt = new Date();
          updatedContract.status = 'active';

          console.log(`Contract ${contractId} inscribed (demo mode): ${mockTxId}`);
        }

        CONTRACT_STORE[contractId] = updatedContract;
      } catch (inscriptionError) {
        console.error('Inscription failed:', inscriptionError);
        // Contract is still signed, just not inscribed yet
        // Mark as signed but flag inscription failure
        updatedContract.status = 'signed';
        CONTRACT_STORE[contractId] = updatedContract;
      }
    }

    return NextResponse.json({
      success: true,
      contractId,
      status: updatedContract.status,
      partyType,
      signedAt: new Date().toISOString(),
      fullySigned,
      inscribed: updatedContract.inscribed,
      inscriptionTxId: updatedContract.inscriptionTxId,
      inscriptionUrl: updatedContract.inscriptionUrl,
      message: fullySigned
        ? 'Contract fully signed and inscribed on blockchain'
        : `Contract signed by ${partyType}. Waiting for other party.`,
    });
  } catch (error) {
    console.error('Contract sign error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
