/**
 * Kintsugi Integration for Pipeline Contracts
 *
 * Links signed contracts to Kintsugi project repos for deliverable tracking.
 * When a contract is signed, it can:
 * 1. Create a new repo in the ai-kintsugi org
 * 2. Link to an existing project repo
 * 3. Track deliverables and milestones
 */

import { PipelineContract } from './types';

// Kintsugi project status
export type KintsugiProjectStatus =
  | 'created'      // Repo created
  | 'contract_linked' // Contract linked to project
  | 'in_progress'  // Work started
  | 'delivered'    // Deliverables submitted
  | 'completed'    // Project complete
  | 'archived';    // Archived

// Kintsugi project record
export interface KintsugiProject {
  id: string;
  repoName: string;
  repoUrl: string;
  contractId: string;
  status: KintsugiProjectStatus;
  deliverables: {
    id: string;
    title: string;
    status: 'pending' | 'in_progress' | 'submitted' | 'accepted';
    submittedAt?: Date;
    acceptedAt?: Date;
    commitHash?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generate a repo name from contract details
 */
export function generateRepoName(contract: PipelineContract): string {
  // Create a slug from the contract title
  const slug = contract.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);

  // Add a unique suffix
  const suffix = contract.id.split('-').pop()?.substring(0, 6) || Date.now().toString(36);

  return `${slug}-${suffix}`;
}

/**
 * Create a Kintsugi project for a signed contract
 */
export async function createKintsugiProject(
  contract: PipelineContract
): Promise<KintsugiProject> {
  const repoName = generateRepoName(contract);

  // In production: Use GitHub App to create repo in ai-kintsugi org
  // For now, return a mock project
  const project: KintsugiProject = {
    id: `KP-${Date.now().toString(36)}`,
    repoName,
    repoUrl: `https://github.com/ai-kintsugi/${repoName}`,
    contractId: contract.id,
    status: 'contract_linked',
    deliverables: contract.deliverables.map(d => ({
      id: d.id,
      title: d.title,
      status: 'pending',
    })),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // TODO: Actually create the repo using the GitHub App
  // const octokit = await getKintsugiOctokit();
  // await octokit.repos.createInOrg({
  //   org: 'ai-kintsugi',
  //   name: repoName,
  //   private: true,
  //   description: `Pipeline project: ${contract.title}`,
  // });

  return project;
}

/**
 * Link a contract to an existing Kintsugi project
 */
export async function linkContractToProject(
  contract: PipelineContract,
  projectId: string
): Promise<{ success: boolean; project?: KintsugiProject; error?: string }> {
  try {
    // In production: Fetch project from database and update
    // For now, return mock success
    return {
      success: true,
      project: {
        id: projectId,
        repoName: 'existing-project',
        repoUrl: `https://github.com/ai-kintsugi/existing-project`,
        contractId: contract.id,
        status: 'contract_linked',
        deliverables: contract.deliverables.map(d => ({
          id: d.id,
          title: d.title,
          status: 'pending',
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to link project',
    };
  }
}

/**
 * Update deliverable status in Kintsugi project
 */
export async function updateDeliverableStatus(
  projectId: string,
  deliverableId: string,
  status: 'pending' | 'in_progress' | 'submitted' | 'accepted',
  commitHash?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // In production: Update in database
    console.log(`Updating deliverable ${deliverableId} in project ${projectId} to ${status}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update deliverable',
    };
  }
}

/**
 * Get project status summary
 */
export function getProjectStatusSummary(project: KintsugiProject): {
  total: number;
  pending: number;
  inProgress: number;
  submitted: number;
  accepted: number;
  progress: number;
} {
  const deliverables = project.deliverables;
  const total = deliverables.length;
  const pending = deliverables.filter(d => d.status === 'pending').length;
  const inProgress = deliverables.filter(d => d.status === 'in_progress').length;
  const submitted = deliverables.filter(d => d.status === 'submitted').length;
  const accepted = deliverables.filter(d => d.status === 'accepted').length;

  const progress = total > 0 ? Math.round((accepted / total) * 100) : 0;

  return { total, pending, inProgress, submitted, accepted, progress };
}

/**
 * Generate initial README for a Kintsugi project repo
 */
export function generateProjectReadme(
  contract: PipelineContract,
  project: KintsugiProject
): string {
  return `# ${contract.title}

**Contract ID:** ${contract.id}
**Project ID:** ${project.id}
**Status:** ${project.status}

## Overview

${contract.description}

## Parties

- **Client:** ${contract.client.name} (${contract.client.email})
- **Contractor:** ${contract.contractor.name} (${contract.contractor.email})

## Payment Terms

- **Amount:** ${contract.paymentTerms.totalAmount} ${contract.paymentTerms.currency}
- **Schedule:** ${contract.paymentTerms.paymentSchedule}

## Deliverables

${contract.deliverables.map((d, i) => `${i + 1}. **${d.title}**
   - ${d.description}
   - Status: ${d.status}
`).join('\n')}

## Contract Inscription

${contract.inscribed
  ? `This contract has been inscribed on the BSV blockchain.
- **Transaction:** [${contract.inscriptionTxId}](${contract.inscriptionUrl})
- **Inscribed At:** ${contract.inscribedAt?.toISOString()}`
  : 'Contract pending inscription.'}

---

*Generated by b0ase Pipeline System*
*Source: ${contract.source.type}${contract.source.sourceName ? ` - ${contract.source.sourceName}` : ''}*
`;
}
