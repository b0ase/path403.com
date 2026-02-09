/**
 * Contract Inscription API
 *
 * POST /api/marketplace/contracts/[id]/inscribe
 * Inscribes a marketplace contract on BSV blockchain
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { inscribeContract, generateContractMarkdown, hashContract } from '@/lib/bsv-inscription';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: contractId } = await params;
    const prisma = getPrisma();

    // Fetch contract with related data
    const contract = await prisma.marketplace_contracts.findUnique({
      where: { id: contractId },
      include: {
        profiles_marketplace_contracts_client_user_idToprofiles: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        profiles_marketplace_contracts_developer_user_idToprofiles: {
          select: {
            id: true,
            full_name: true,
            username: true,
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Check if already inscribed
    if (contract.inscription_txid) {
      return NextResponse.json({
        success: true,
        alreadyInscribed: true,
        inscriptionTxid: contract.inscription_txid,
        inscriptionUrl: `https://whatsonchain.com/tx/${contract.inscription_txid}`,
      });
    }

    // Verify contract has escrow
    if (contract.escrow_status !== 'escrowed') {
      return NextResponse.json(
        { error: 'Contract must be in escrowed status before inscription' },
        { status: 400 }
      );
    }

    // Prepare inscription data
    const inscriptionData = {
      contractId: contract.id,
      clientUserId: contract.client_user_id,
      developerUserId: contract.developer_user_id || '',
      clientName: contract.profiles_marketplace_contracts_client_user_idToprofiles?.full_name,
      developerName:
        contract.profiles_marketplace_contracts_developer_user_idToprofiles?.full_name || 'TBD',
      contractSlug: contract.contract_slug,
      serviceTitle: contract.service_title || 'Service Contract',
      serviceDescription: contract.service_description || 'Custom development service',
      totalAmount: parseFloat(contract.total_amount.toString()),
      currency: contract.currency,
      paymentTerms: `50% upfront (${contract.currency}${(parseFloat(contract.total_amount.toString()) * 0.5).toFixed(2)}) + 50% on delivery (${contract.currency}${(parseFloat(contract.total_amount.toString()) * 0.5).toFixed(2)})`,
      acceptanceCriteria: contract.acceptance_criteria || 'Work delivered as described and approved by client.',
      createdAt: contract.created_at.toISOString(),
      platformUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://b0ase.com',
    };

    // Inscribe on BSV blockchain
    const inscription = await inscribeContract(inscriptionData);

    // Update contract with inscription data
    await prisma.marketplace_contracts.update({
      where: { id: contractId },
      data: {
        inscription_txid: inscription.txid,
        inscription_url: inscription.blockchainExplorerUrl,
        contract_hash: inscription.contractHash,
        inscription_created_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      inscription: {
        txid: inscription.txid,
        explorerUrl: inscription.blockchainExplorerUrl,
        contractHash: inscription.contractHash,
      },
    });
  } catch (error) {
    console.error('[contract-inscribe] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to inscribe contract',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
