/**
 * Pipeline Manager
 *
 * Manages the Kintsugi pipeline flow:
 * 1. Investors fund projects (via funding_tranches)
 * 2. Founders define work items (linked to github_issues)
 * 3. Kintsugi/developers claim and complete work
 * 4. Escrow releases on completion
 *
 * This is the API that the Kintsugi agent will call.
 */

import { getPrisma } from './prisma';
import { releaseEscrow, PaymentMethod } from './escrow-manager';

// Types
export interface CreateProjectInput {
  name: string;
  slug: string;
  description?: string;
  category?: string;
  ownerUserId: string;
  budget?: number;
  targetCompletionDate?: Date;
  githubRepoUrl?: string;
}

export interface CreateWorkItemInput {
  projectSlug: string;
  trancheId: string;
  title: string;
  description?: string;
  estimatedHours?: number;
  bountyAmountGbp: number;
  priority?: number;
  labels?: string[];
  githubIssueId?: string; // Link to existing GitHub issue if any
}

export interface ClaimWorkItemInput {
  workItemId: string;
  developerUserId: string;
  estimatedCompletionDate?: Date;
}

export interface CompleteWorkItemInput {
  workItemId: string;
  developerUserId: string;
  prUrl?: string;
  notes?: string;
}

export interface WorkItem {
  id: string;
  projectSlug: string;
  trancheId: string;
  title: string;
  description: string | null;
  estimatedHours: number | null;
  bountyAmountGbp: number;
  priority: number;
  labels: string[];
  status: 'open' | 'claimed' | 'in_progress' | 'review' | 'completed' | 'paid';
  claimedBy: string | null;
  claimedAt: Date | null;
  completedAt: Date | null;
  paidAt: Date | null;
  payoutTxid: string | null;
  githubIssueId: string | null;
  prUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a project in the pipeline
 */
export async function createPipelineProject(input: CreateProjectInput) {
  const prisma = getPrisma();

  // Check if project slug already exists
  const existing = await prisma.projects.findUnique({
    where: { slug: input.slug },
  });

  if (existing) {
    throw new Error(`Project with slug "${input.slug}" already exists`);
  }

  // Create the project
  const project = await prisma.projects.create({
    data: {
      id: crypto.randomUUID(),
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      category: input.category || 'development',
      owner_user_id: input.ownerUserId,
      budget: input.budget || null,
      target_completion_date: input.targetCompletionDate || null,
      status: 'pending_setup',
      social_links: input.githubRepoUrl ? { github: input.githubRepoUrl } : null,
    },
  });

  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    status: project.status,
  };
}

/**
 * Create a work item linked to a funding tranche
 * This is what Kintsugi will call when breaking down work
 */
export async function createWorkItem(input: CreateWorkItemInput): Promise<WorkItem> {
  const prisma = getPrisma();

  // Verify tranche exists and is active
  const tranche = await prisma.funding_tranches.findUnique({
    where: { id: input.trancheId },
  });

  if (!tranche) {
    throw new Error(`Tranche ${input.trancheId} not found`);
  }

  if (tranche.status !== 'open' && tranche.status !== 'upcoming') {
    throw new Error(`Tranche ${input.trancheId} is not accepting new work items`);
  }

  // Create work item in pipeline_work_items table
  // For now, we'll use github_issues as the storage since the model exists
  // and create a virtual work item on top of it
  const workItem = await prisma.pipeline_work_items.create({
    data: {
      project_slug: input.projectSlug,
      tranche_id: input.trancheId,
      title: input.title,
      description: input.description || null,
      estimated_hours: input.estimatedHours || null,
      bounty_amount_gbp: input.bountyAmountGbp,
      priority: input.priority || 0,
      labels: input.labels || [],
      status: 'open',
      github_issue_id: input.githubIssueId || null,
    },
  });

  return mapWorkItem(workItem);
}

/**
 * List all open work items (for developers/agents to claim)
 */
export async function listOpenWorkItems(filters?: {
  projectSlug?: string;
  trancheId?: string;
  minBounty?: number;
  maxBounty?: number;
  labels?: string[];
}) {
  const prisma = getPrisma();

  const where: any = {
    status: 'open',
  };

  if (filters?.projectSlug) {
    where.project_slug = filters.projectSlug;
  }

  if (filters?.trancheId) {
    where.tranche_id = filters.trancheId;
  }

  if (filters?.minBounty !== undefined) {
    where.bounty_amount_gbp = { gte: filters.minBounty };
  }

  if (filters?.maxBounty !== undefined) {
    where.bounty_amount_gbp = {
      ...where.bounty_amount_gbp,
      lte: filters.maxBounty,
    };
  }

  const workItems = await prisma.pipeline_work_items.findMany({
    where,
    orderBy: [
      { priority: 'asc' },
      { bounty_amount_gbp: 'desc' },
      { created_at: 'asc' },
    ],
  });

  return workItems.map(mapWorkItem);
}

/**
 * Get a single work item by ID
 */
export async function getWorkItem(id: string): Promise<WorkItem | null> {
  const prisma = getPrisma();

  const workItem = await prisma.pipeline_work_items.findUnique({
    where: { id },
  });

  return workItem ? mapWorkItem(workItem) : null;
}

/**
 * Claim a work item as a developer
 */
export async function claimWorkItem(input: ClaimWorkItemInput): Promise<WorkItem> {
  const prisma = getPrisma();

  // Get current work item
  const workItem = await prisma.pipeline_work_items.findUnique({
    where: { id: input.workItemId },
  });

  if (!workItem) {
    throw new Error(`Work item ${input.workItemId} not found`);
  }

  if (workItem.status !== 'open') {
    throw new Error(`Work item is not available for claiming (status: ${workItem.status})`);
  }

  // Update to claimed status
  const updated = await prisma.pipeline_work_items.update({
    where: { id: input.workItemId },
    data: {
      status: 'claimed',
      claimed_by: input.developerUserId,
      claimed_at: new Date(),
      estimated_completion: input.estimatedCompletionDate || null,
    },
  });

  return mapWorkItem(updated);
}

/**
 * Start work on a claimed item (move to in_progress)
 */
export async function startWorkItem(workItemId: string, developerUserId: string): Promise<WorkItem> {
  const prisma = getPrisma();

  const workItem = await prisma.pipeline_work_items.findUnique({
    where: { id: workItemId },
  });

  if (!workItem) {
    throw new Error(`Work item ${workItemId} not found`);
  }

  if (workItem.claimed_by !== developerUserId) {
    throw new Error('Only the developer who claimed this work item can start it');
  }

  if (workItem.status !== 'claimed') {
    throw new Error(`Cannot start work item with status: ${workItem.status}`);
  }

  const updated = await prisma.pipeline_work_items.update({
    where: { id: workItemId },
    data: {
      status: 'in_progress',
      started_at: new Date(),
    },
  });

  return mapWorkItem(updated);
}

/**
 * Submit work for review
 */
export async function submitForReview(
  workItemId: string,
  developerUserId: string,
  prUrl?: string
): Promise<WorkItem> {
  const prisma = getPrisma();

  const workItem = await prisma.pipeline_work_items.findUnique({
    where: { id: workItemId },
  });

  if (!workItem) {
    throw new Error(`Work item ${workItemId} not found`);
  }

  if (workItem.claimed_by !== developerUserId) {
    throw new Error('Only the developer who claimed this work item can submit it');
  }

  if (workItem.status !== 'in_progress' && workItem.status !== 'claimed') {
    throw new Error(`Cannot submit work item with status: ${workItem.status}`);
  }

  const updated = await prisma.pipeline_work_items.update({
    where: { id: workItemId },
    data: {
      status: 'review',
      pr_url: prUrl || null,
      submitted_at: new Date(),
    },
  });

  return mapWorkItem(updated);
}

/**
 * Complete a work item and trigger payout
 * Called by project owner/founder after review
 */
export async function completeWorkItem(input: CompleteWorkItemInput): Promise<WorkItem> {
  const prisma = getPrisma();

  const workItem = await prisma.pipeline_work_items.findUnique({
    where: { id: input.workItemId },
    include: {
      funding_tranche: true,
    },
  });

  if (!workItem) {
    throw new Error(`Work item ${input.workItemId} not found`);
  }

  // For now, allow completing from various states
  // In production, we'd want stricter state machine
  if (workItem.status === 'completed' || workItem.status === 'paid') {
    throw new Error(`Work item is already ${workItem.status}`);
  }

  // Mark as completed
  const updated = await prisma.pipeline_work_items.update({
    where: { id: input.workItemId },
    data: {
      status: 'completed',
      completed_at: new Date(),
      pr_url: input.prUrl || workItem.pr_url,
      notes: input.notes || null,
    },
  });

  return mapWorkItem(updated);
}

/**
 * Process payout for a completed work item
 * This is called after completion is verified
 */
export async function payoutWorkItem(
  workItemId: string,
  paymentMethod: PaymentMethod = 'stripe'
): Promise<{ success: boolean; payoutId?: string; error?: string }> {
  const prisma = getPrisma();

  const workItem = await prisma.pipeline_work_items.findUnique({
    where: { id: workItemId },
  });

  if (!workItem) {
    throw new Error(`Work item ${workItemId} not found`);
  }

  if (workItem.status !== 'completed') {
    throw new Error(`Work item must be completed before payout (status: ${workItem.status})`);
  }

  if (!workItem.claimed_by) {
    throw new Error('No developer assigned to this work item');
  }

  // Get developer's payout preferences
  const payoutPrefs = await prisma.payout_preferences.findUnique({
    where: { user_id: workItem.claimed_by },
  });

  if (!payoutPrefs) {
    throw new Error('Developer has not set up payout preferences');
  }

  if (!payoutPrefs.verified) {
    throw new Error('Developer payout method is not verified');
  }

  // Calculate payout amount (bounty minus platform fee)
  const platformFeePercent = 5;
  const bountyAmount = Number(workItem.bounty_amount_gbp);
  const platformFee = bountyAmount * (platformFeePercent / 100);
  const developerPayout = bountyAmount - platformFee;

  // Attempt payout
  try {
    const result = await releaseEscrow({
      paymentMethod,
      providerId: workItem.id, // Use work item ID as reference
      developerPayoutInfo: {
        stripeAccountId: payoutPrefs.stripe_account_id || undefined,
        paypalEmail: payoutPrefs.paypal_email || undefined,
        cryptoAddress: payoutPrefs.crypto_address || undefined,
        cryptoCurrency: payoutPrefs.crypto_currency as any || undefined,
      },
      amount: developerPayout,
      currency: 'GBP',
      contractId: workItem.id,
    });

    if (result.success) {
      // Update work item to paid
      await prisma.pipeline_work_items.update({
        where: { id: workItemId },
        data: {
          status: 'paid',
          paid_at: new Date(),
          payout_txid: result.payoutId || null,
        },
      });
    }

    return result;
  } catch (error) {
    console.error('[pipeline-manager] Payout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payout failed',
    };
  }
}

/**
 * Get work items for a developer
 */
export async function getDeveloperWorkItems(developerUserId: string) {
  const prisma = getPrisma();

  const workItems = await prisma.pipeline_work_items.findMany({
    where: {
      claimed_by: developerUserId,
    },
    orderBy: [
      { status: 'asc' },
      { updated_at: 'desc' },
    ],
  });

  return workItems.map(mapWorkItem);
}

/**
 * Get pipeline stats for a project
 */
export async function getProjectPipelineStats(projectSlug: string) {
  const prisma = getPrisma();

  const workItems = await prisma.pipeline_work_items.findMany({
    where: { project_slug: projectSlug },
  });

  const stats = {
    total: workItems.length,
    open: workItems.filter(w => w.status === 'open').length,
    claimed: workItems.filter(w => w.status === 'claimed').length,
    inProgress: workItems.filter(w => w.status === 'in_progress').length,
    review: workItems.filter(w => w.status === 'review').length,
    completed: workItems.filter(w => w.status === 'completed').length,
    paid: workItems.filter(w => w.status === 'paid').length,
    totalBountyGbp: workItems.reduce((sum, w) => sum + Number(w.bounty_amount_gbp), 0),
    paidOutGbp: workItems
      .filter(w => w.status === 'paid')
      .reduce((sum, w) => sum + Number(w.bounty_amount_gbp), 0),
  };

  return stats;
}

/**
 * Release a claimed work item (put it back to open)
 */
export async function releaseWorkItem(workItemId: string, reason?: string): Promise<WorkItem> {
  const prisma = getPrisma();

  const workItem = await prisma.pipeline_work_items.findUnique({
    where: { id: workItemId },
  });

  if (!workItem) {
    throw new Error(`Work item ${workItemId} not found`);
  }

  if (workItem.status === 'completed' || workItem.status === 'paid') {
    throw new Error(`Cannot release a ${workItem.status} work item`);
  }

  const updated = await prisma.pipeline_work_items.update({
    where: { id: workItemId },
    data: {
      status: 'open',
      claimed_by: null,
      claimed_at: null,
      started_at: null,
      submitted_at: null,
      estimated_completion: null,
      notes: reason ? `Released: ${reason}` : null,
    },
  });

  return mapWorkItem(updated);
}

// Helper to map database row to WorkItem type
function mapWorkItem(row: any): WorkItem {
  return {
    id: row.id,
    projectSlug: row.project_slug,
    trancheId: row.tranche_id,
    title: row.title,
    description: row.description,
    estimatedHours: row.estimated_hours ? Number(row.estimated_hours) : null,
    bountyAmountGbp: Number(row.bounty_amount_gbp),
    priority: row.priority,
    labels: (row.labels as string[]) || [],
    status: row.status as WorkItem['status'],
    claimedBy: row.claimed_by,
    claimedAt: row.claimed_at,
    completedAt: row.completed_at,
    paidAt: row.paid_at,
    payoutTxid: row.payout_txid,
    githubIssueId: row.github_issue_id,
    prUrl: row.pr_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
