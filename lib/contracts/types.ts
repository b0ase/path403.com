/**
 * Contract Pipeline Types
 *
 * Defines the structure for pipeline contracts - from gig application
 * through signing and on-chain inscription.
 */

// Pipeline phases for startup/vibecoin creation
export type PipelinePhase =
  | 'discovery'    // Research, market analysis, idea validation
  | 'design'       // UI/UX, branding, architecture
  | 'development'  // Code, smart contracts, infrastructure
  | 'launch'       // Deployment, token launch, marketing push
  | 'marketing'    // Content, social media, growth
  | 'operations'   // Community, support, maintenance
  | 'scale';       // Expansion, partnerships, optimization

// Contract party types
export type PartyType = 'client' | 'contractor' | 'platform';

// Payment currencies supported
export type PaymentCurrency =
  | 'GBP' | 'USD' | 'EUR'           // Fiat
  | 'BTC' | 'ETH' | 'SOL' | 'BSV'   // Major crypto
  | 'USDC' | 'USDT' | 'MNEE'        // Stablecoins
  | 'CUSTOM';                        // Any token (specify in metadata)

// Contract status
export type ContractStatus =
  | 'draft'           // Being created
  | 'pending_review'  // Awaiting party review
  | 'pending_sign'    // Awaiting signatures
  | 'partially_signed'// One party signed
  | 'signed'          // All parties signed
  | 'inscribed'       // On-chain
  | 'active'          // Work in progress
  | 'completed'       // Deliverables accepted
  | 'disputed'        // Under dispute
  | 'cancelled';      // Cancelled

// Signature status
export interface SignatureRecord {
  partyId: string;
  partyType: PartyType;
  partyName: string;
  partyEmail?: string;
  partyWallet?: string;
  signedAt?: Date;
  signatureHash?: string;      // Hash of signature data
  signatureMethod: 'wallet' | 'email' | 'manual';
  walletType?: 'bsv' | 'eth' | 'sol';
  verified: boolean;
}

// Payment terms
export interface PaymentTerms {
  totalAmount: number;
  currency: PaymentCurrency;
  customToken?: string;        // If CUSTOM currency
  paymentSchedule: 'upfront' | 'milestone' | 'completion' | 'recurring';
  milestones?: {
    description: string;
    amount: number;
    dueDate?: Date;
    status: 'pending' | 'paid' | 'disputed';
  }[];
  escrowRequired: boolean;
  escrowPlatform?: 'stripe' | 'paypal' | 'crypto';
}

// Deliverable definition
export interface Deliverable {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  dueDate?: Date;
  status: 'pending' | 'in_progress' | 'submitted' | 'accepted' | 'rejected';
  submittedAt?: Date;
  acceptedAt?: Date;
  attachments?: string[];      // URLs to deliverable files
}

// Contract template
export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  phase: PipelinePhase;
  category: string;            // e.g., 'social-media', 'development', 'design'
  version: string;

  // Template content (markdown with {{variables}})
  content: string;

  // Required variables for this template
  requiredVariables: {
    name: string;
    type: 'string' | 'number' | 'date' | 'currency' | 'address';
    description: string;
    default?: string;
  }[];

  // Default payment structure
  defaultPayment: Partial<PaymentTerms>;

  // Default deliverables
  defaultDeliverables: Partial<Deliverable>[];

  // Legal jurisdiction
  jurisdiction: string;

  // Tags for search
  tags: string[];
}

// Full contract (instantiated from template)
export interface PipelineContract {
  id: string;
  templateId: string;
  templateVersion: string;

  // Parties
  client: {
    id: string;
    name: string;
    email: string;
    wallet?: string;
    companyName?: string;
    companyNumber?: string;    // Companies House number
  };

  contractor: {
    id: string;
    name: string;
    email: string;
    wallet?: string;
    linkedIn?: string;
    portfolio?: string;
  };

  // Contract details
  title: string;
  description: string;
  phase: PipelinePhase;
  status: ContractStatus;

  // Filled template content (rendered markdown)
  content: string;
  contentHash: string;         // SHA-256 of content

  // Terms
  paymentTerms: PaymentTerms;
  deliverables: Deliverable[];
  startDate: Date;
  endDate?: Date;

  // Signatures
  signatures: SignatureRecord[];

  // Blockchain inscription
  inscribed: boolean;
  inscriptionTxId?: string;
  inscriptionUrl?: string;
  inscribedAt?: Date;

  // Kintsugi integration
  kintsugiProjectId?: string;
  kintsugiRepoUrl?: string;

  // Source (where this contract originated)
  source: {
    type: 'gig' | 'creator' | 'developer' | 'founder' | 'direct';
    sourceId?: string;         // e.g., gig ID
    sourceName?: string;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;

  // Version tracking
  version: number;
  parentContractId?: string;   // If this is an amendment
}

// Contract generation request
export interface ContractGenerationRequest {
  templateId: string;

  // Party info
  clientId: string;
  contractorId: string;

  // Variable values
  variables: Record<string, string | number | Date>;

  // Payment customization
  paymentTerms?: Partial<PaymentTerms>;

  // Deliverable customization
  deliverables?: Partial<Deliverable>[];

  // Source tracking
  source: PipelineContract['source'];
}

// Gig application (becomes a contract)
export interface GigApplication {
  id: string;
  gigId: string;
  gigTitle: string;

  applicant: {
    id?: string;               // If existing user
    name: string;
    email: string;
    wallet?: string;
    linkedIn?: string;
    portfolio?: string;
    experience: string;
    availability: string;
    rateExpectation?: string;
  };

  coverLetter: string;
  proposedTerms?: string;

  status: 'submitted' | 'reviewing' | 'accepted' | 'rejected' | 'contract_sent';

  // If accepted, links to contract
  contractId?: string;

  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}
