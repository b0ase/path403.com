/**
 * Contract Pipeline Module
 *
 * Handles contract generation, signing, and blockchain inscription
 * for the b0ase gig/pipeline system.
 */

// Types
export * from './types';

// Templates
export {
  CONTRACT_TEMPLATES,
  getTemplateById,
  getTemplatesByPhase,
  getAllTemplates,
  getTemplateForGigCategory,
} from './templates';

// Generator
export {
  generateContract,
  generateContractFromGig,
  finalizeContract,
  addSignature,
  hashContract,
  generateInscriptionMarkdown,
} from './generator';

// Kintsugi Integration
export {
  createKintsugiProject,
  linkContractToProject,
  updateDeliverableStatus,
  getProjectStatusSummary,
  generateProjectReadme,
  generateRepoName,
} from './kintsugi-integration';
export type { KintsugiProject, KintsugiProjectStatus } from './kintsugi-integration';
