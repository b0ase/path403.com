/**
 * Contract Generator
 *
 * Generates contracts from templates with variable substitution,
 * prepares for signing, and handles hash generation.
 */

import { createHash } from 'crypto';
import {
  ContractTemplate,
  PipelineContract,
  ContractGenerationRequest,
  PaymentTerms,
  Deliverable,
  GigApplication,
} from './types';
import { getTemplateById, getTemplateForGigCategory } from './templates';

// Generate unique contract ID
function generateContractId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `CONTRACT-${timestamp}-${random}`.toUpperCase();
}

// Hash contract content for verification
export function hashContract(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

// Simple template renderer (handles {{variable}} and {{#conditional}})
function renderTemplate(template: string, variables: Record<string, any>): string {
  let result = template;

  // Handle simple variable substitution {{variable}}
  result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key in variables) {
      const value = variables[key];
      if (value instanceof Date) {
        return value.toLocaleDateString('en-GB');
      }
      return String(value ?? '');
    }
    return match; // Keep original if not found
  });

  // Handle conditional sections {{#condition}}...{{/condition}}
  result = result.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, content) => {
    if (variables[key]) {
      // Render the content if condition is truthy
      return renderTemplate(content, variables);
    }
    return ''; // Remove section if falsy
  });

  // Handle negative conditionals {{^condition}}...{{/condition}}
  result = result.replace(/\{\{\^(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, content) => {
    if (!variables[key]) {
      return renderTemplate(content, variables);
    }
    return '';
  });

  // Handle each loops {{#each array}}...{{/each}}
  result = result.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, key, itemTemplate) => {
    const array = variables[key];
    if (Array.isArray(array)) {
      return array.map((item, index) => {
        const itemVars = { ...variables, ...item, index: index + 1 };
        return renderTemplate(itemTemplate, itemVars);
      }).join('');
    }
    return '';
  });

  return result;
}

// Generate contract from template
export function generateContract(request: ContractGenerationRequest): PipelineContract {
  const template = getTemplateById(request.templateId);
  if (!template) {
    throw new Error(`Template not found: ${request.templateId}`);
  }

  const contractId = generateContractId();
  const now = new Date();

  // Build variable context
  const variables: Record<string, any> = {
    contractId,
    contractDate: now,
    jurisdiction: template.jurisdiction,
    ...request.variables,
  };

  // Render the contract content
  const content = renderTemplate(template.content, variables);
  const contentHash = hashContract(content);

  // Build payment terms
  const paymentTerms: PaymentTerms = {
    ...template.defaultPayment,
    ...request.paymentTerms,
  } as PaymentTerms;

  // Build deliverables
  const deliverables: Deliverable[] = (request.deliverables || template.defaultDeliverables).map((d, i) => ({
    id: `DEL-${contractId}-${i + 1}`,
    title: d.title || `Deliverable ${i + 1}`,
    description: d.description || '',
    acceptanceCriteria: d.acceptanceCriteria || [],
    status: 'pending',
    ...d,
  })) as Deliverable[];

  // Create the contract
  const contract: PipelineContract = {
    id: contractId,
    templateId: template.id,
    templateVersion: template.version,

    client: {
      id: request.clientId,
      name: variables.clientName || '',
      email: variables.clientEmail || '',
      wallet: variables.clientWallet,
      companyName: variables.clientCompany,
      companyNumber: variables.clientCompanyNumber,
    },

    contractor: {
      id: request.contractorId,
      name: variables.contractorName || '',
      email: variables.contractorEmail || '',
      wallet: variables.contractorWallet,
      linkedIn: variables.contractorLinkedIn,
      portfolio: variables.contractorPortfolio,
    },

    title: variables.contractTitle || template.name,
    description: template.description,
    phase: template.phase,
    status: 'draft',

    content,
    contentHash,

    paymentTerms,
    deliverables,
    startDate: variables.startDate || now,
    endDate: variables.endDate,

    signatures: [],

    inscribed: false,

    source: request.source,

    createdAt: now,
    updatedAt: now,
    createdBy: request.clientId,

    version: 1,
  };

  return contract;
}

// Generate contract from gig application
export function generateContractFromGig(
  gig: {
    id: string;
    title: string;
    category: string;
    description: string;
    payRange: string;
    commitment: string;
  },
  application: GigApplication,
  clientInfo: {
    id: string;
    name: string;
    email: string;
    wallet?: string;
    companyName?: string;
    companyNumber?: string;
  }
): PipelineContract {
  // Get appropriate template for gig category
  const template = getTemplateForGigCategory(gig.category);

  // Parse pay range to get amount
  const payMatch = gig.payRange.match(/[\d,]+/);
  const payAmount = payMatch ? parseInt(payMatch[0].replace(',', '')) : 0;

  // Build generation request
  const request: ContractGenerationRequest = {
    templateId: template.id,
    clientId: clientInfo.id,
    contractorId: application.applicant.id || application.id,

    variables: {
      // Contract basics
      contractTitle: `${gig.title} - Service Agreement`,
      projectName: gig.title,

      // Client info
      clientName: clientInfo.name,
      clientEmail: clientInfo.email,
      clientWallet: clientInfo.wallet,
      clientCompany: clientInfo.companyName,
      clientCompanyNumber: clientInfo.companyNumber,

      // Contractor info
      contractorName: application.applicant.name,
      contractorEmail: application.applicant.email,
      contractorWallet: application.applicant.wallet,
      contractorLinkedIn: application.applicant.linkedIn,
      contractorPortfolio: application.applicant.portfolio,

      // Scope
      scopeDescription: gig.description,
      estimatedHours: gig.commitment,

      // Dates
      startDate: new Date(),
    },

    paymentTerms: {
      totalAmount: payAmount,
      currency: 'GBP',
      paymentSchedule: 'milestone',
      escrowRequired: true,
      escrowPlatform: 'stripe',
    },

    source: {
      type: 'gig',
      sourceId: gig.id,
      sourceName: gig.title,
    },
  };

  return generateContract(request);
}

// Prepare contract for signing (finalize draft)
export function finalizeContract(contract: PipelineContract): PipelineContract {
  if (contract.status !== 'draft') {
    throw new Error('Only draft contracts can be finalized');
  }

  return {
    ...contract,
    status: 'pending_sign',
    updatedAt: new Date(),
  };
}

// Add signature to contract
export function addSignature(
  contract: PipelineContract,
  signature: {
    partyId: string;
    partyType: 'client' | 'contractor';
    partyName: string;
    partyEmail?: string;
    partyWallet?: string;
    signatureMethod: 'wallet' | 'email' | 'manual';
    walletType?: 'bsv' | 'eth' | 'sol';
    signatureData?: string;
  }
): PipelineContract {
  const now = new Date();
  const signatureHash = hashContract(`${signature.partyId}:${now.toISOString()}:${contract.contentHash}`);

  const newSignature = {
    ...signature,
    signedAt: now,
    signatureHash,
    verified: true, // In production, verify wallet signature
  };

  const signatures = [...contract.signatures, newSignature];

  // Determine new status
  const clientSigned = signatures.some(s => s.partyType === 'client');
  const contractorSigned = signatures.some(s => s.partyType === 'contractor');

  let status = contract.status;
  if (clientSigned && contractorSigned) {
    status = 'signed';
  } else if (clientSigned || contractorSigned) {
    status = 'partially_signed';
  }

  return {
    ...contract,
    signatures,
    status,
    updatedAt: now,
  };
}

// Generate contract markdown for inscription
export function generateInscriptionMarkdown(contract: PipelineContract): string {
  const lines = [
    '# b0ase Pipeline Contract',
    '',
    `**Contract ID:** ${contract.id}`,
    `**Template:** ${contract.templateId} v${contract.templateVersion}`,
    `**Phase:** ${contract.phase}`,
    `**Created:** ${contract.createdAt.toISOString()}`,
    '',
    '---',
    '',
    '## Parties',
    '',
    `**Client:** ${contract.client.name} (${contract.client.email})`,
    contract.client.wallet ? `- Wallet: ${contract.client.wallet}` : '',
    contract.client.companyName ? `- Company: ${contract.client.companyName} (${contract.client.companyNumber})` : '',
    '',
    `**Contractor:** ${contract.contractor.name} (${contract.contractor.email})`,
    contract.contractor.wallet ? `- Wallet: ${contract.contractor.wallet}` : '',
    contract.contractor.linkedIn ? `- LinkedIn: ${contract.contractor.linkedIn}` : '',
    '',
    '---',
    '',
    '## Payment Terms',
    '',
    `**Amount:** ${contract.paymentTerms.totalAmount} ${contract.paymentTerms.currency}`,
    `**Schedule:** ${contract.paymentTerms.paymentSchedule}`,
    `**Escrow:** ${contract.paymentTerms.escrowRequired ? 'Yes' : 'No'}`,
    '',
    '---',
    '',
    '## Signatures',
    '',
  ];

  for (const sig of contract.signatures) {
    lines.push(`**${sig.partyType === 'client' ? 'Client' : 'Contractor'}:** ${sig.partyName}`);
    lines.push(`- Signed: ${sig.signedAt?.toISOString()}`);
    lines.push(`- Method: ${sig.signatureMethod}${sig.walletType ? ` (${sig.walletType})` : ''}`);
    lines.push(`- Hash: ${sig.signatureHash}`);
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push(`**Content Hash:** ${contract.contentHash}`);
  lines.push('');
  lines.push('*Inscribed via b0ase Pipeline System*');

  return lines.filter(l => l !== undefined).join('\n');
}
