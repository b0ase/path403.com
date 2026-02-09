/**
 * GET /api/pipeline
 *
 * Pipeline API documentation and health check.
 * Lists all available endpoints for the Kintsugi triage system.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'Kintsugi Pipeline API',
    version: '1.0.0',
    description: 'API for the Kintsugi triage system. Connects investors → work items → developers → payouts.',
    endpoints: {
      'POST /api/pipeline/create-project': {
        description: 'Create a new project in the pipeline',
        auth: 'required',
        body: {
          name: 'string (required)',
          slug: 'string (required, lowercase alphanumeric with hyphens)',
          description: 'string (optional)',
          category: 'string (optional)',
          budget: 'number (optional)',
          targetCompletionDate: 'ISO date string (optional)',
          githubRepoUrl: 'URL string (optional)',
        },
      },
      'POST /api/pipeline/create-issue': {
        description: 'Create a work item linked to a funding tranche',
        auth: 'required',
        body: {
          projectSlug: 'string (required)',
          trancheId: 'UUID (required)',
          title: 'string (required)',
          description: 'string (optional)',
          estimatedHours: 'number (optional)',
          bountyAmountGbp: 'number (required)',
          priority: 'number 0-100 (optional)',
          labels: 'string[] (optional)',
        },
      },
      'GET /api/pipeline/create-issue': {
        description: 'List open work items available for claiming',
        auth: 'none',
        query: {
          projectSlug: 'string (optional filter)',
          trancheId: 'UUID (optional filter)',
          minBounty: 'number (optional filter)',
          maxBounty: 'number (optional filter)',
        },
      },
      'POST /api/pipeline/claim-issue': {
        description: 'Claim, start, submit, or release a work item',
        auth: 'required',
        body: {
          action: '"claim" | "start" | "submit" | "release"',
          workItemId: 'UUID (required)',
          estimatedCompletionDate: 'ISO date string (optional, for claim)',
          prUrl: 'URL string (optional, for submit)',
          reason: 'string (optional, for release)',
        },
      },
      'GET /api/pipeline/claim-issue': {
        description: 'Get work items claimed by current developer',
        auth: 'required',
      },
      'POST /api/pipeline/complete-issue': {
        description: 'Mark work item complete and trigger payout',
        auth: 'required (project owner only)',
        body: {
          workItemId: 'UUID (required)',
          prUrl: 'URL string (optional)',
          notes: 'string (optional)',
          triggerPayout: 'boolean (default: true)',
          paymentMethod: '"stripe" | "paypal" | "crypto" (default: stripe)',
        },
      },
      'GET /api/pipeline/complete-issue': {
        description: 'Get pipeline stats for a project',
        auth: 'none',
        query: {
          projectSlug: 'string (required)',
        },
      },
      'GET /api/pipeline/work-items': {
        description: 'List all open work items or get one by ID',
        auth: 'none',
        query: {
          id: 'UUID (optional, get specific item)',
          projectSlug: 'string (optional filter)',
          trancheId: 'UUID (optional filter)',
          minBounty: 'number (optional filter)',
          maxBounty: 'number (optional filter)',
        },
      },
    },
    flow: [
      '1. Founder creates project via POST /api/pipeline/create-project',
      '2. Founder links funding tranche (via existing /api/funding-tranches)',
      '3. Founder/AI creates work items via POST /api/pipeline/create-issue',
      '4. Developer claims work via POST /api/pipeline/claim-issue { action: "claim" }',
      '5. Developer starts work via POST /api/pipeline/claim-issue { action: "start" }',
      '6. Developer submits for review via POST /api/pipeline/claim-issue { action: "submit" }',
      '7. Founder approves and triggers payout via POST /api/pipeline/complete-issue',
    ],
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}
