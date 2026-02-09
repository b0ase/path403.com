/**
 * POST /api/apply
 *
 * Submit a gig application and generate a contract
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateContractFromGig } from '@/lib/contracts/generator';
import { GigApplication } from '@/lib/contracts/types';

// Mock gig data (in production, fetch from database)
const MOCK_GIGS: Record<string, any> = {
  'twitter-manager': {
    id: 'twitter-manager',
    title: 'Twitter/X Content Manager',
    description: 'Manage our Twitter presence. Create engaging threads, respond to mentions, grow followers.',
    category: 'Social Media',
    payRange: '£300-500/mo',
    frequency: 'Monthly',
    commitment: '10-15 hrs/week',
    requirements: ['Crypto/tech audience', 'Strong writing'],
  },
  'automation-builder': {
    id: 'automation-builder',
    title: 'Automation Specialist',
    description: 'Build automations using n8n, Zapier, or Make. Connect tools and improve efficiency.',
    category: 'Technical',
    payRange: '£40-80/hr',
    frequency: 'Ongoing',
    commitment: '5-15 hrs/week',
    requirements: ['n8n/Zapier/Make', 'API integration'],
  },
  'seo-specialist': {
    id: 'seo-specialist',
    title: 'SEO Content Writer',
    description: 'Write SEO-optimized blog posts about AI, crypto, startups, and tech.',
    category: 'Marketing',
    payRange: '£50-150/article',
    frequency: 'Per Deliverable',
    commitment: '2-4 articles/week',
    requirements: ['SEO knowledge', 'Crypto/AI understanding'],
  },
  // Default fallback
  'default': {
    id: 'default',
    title: 'Pipeline Gig',
    description: 'Standard pipeline gig contract.',
    category: 'Technical',
    payRange: '£50-100/hr',
    frequency: 'Ongoing',
    commitment: 'Flexible',
    requirements: ['Relevant experience'],
  },
};

// Mock client info (in production, fetch from authenticated user)
const MOCK_CLIENT = {
  id: 'client-b0ase',
  name: 'b0ase Ventures',
  email: 'contracts@b0ase.com',
  companyName: 'b0ase Ltd',
  companyNumber: '12345678',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { gigId, applicant, coverLetter } = body;

    if (!gigId || !applicant || !coverLetter) {
      return NextResponse.json(
        { error: 'Missing required fields: gigId, applicant, coverLetter' },
        { status: 400 }
      );
    }

    if (!applicant.name || !applicant.email || !applicant.experience || !applicant.availability) {
      return NextResponse.json(
        { error: 'Missing required applicant fields: name, email, experience, availability' },
        { status: 400 }
      );
    }

    // Get gig details (use mock data or fetch from DB)
    const gig = MOCK_GIGS[gigId] || MOCK_GIGS['default'];

    // Create application record
    const application: GigApplication = {
      id: `APP-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase(),
      gigId,
      gigTitle: gig.title,
      applicant: {
        id: applicant.id,
        name: applicant.name,
        email: applicant.email,
        wallet: applicant.wallet,
        linkedIn: applicant.linkedIn,
        portfolio: applicant.portfolio,
        experience: applicant.experience,
        availability: applicant.availability,
        rateExpectation: applicant.rateExpectation,
      },
      coverLetter,
      proposedTerms: body.proposedTerms,
      status: 'submitted',
      submittedAt: new Date(),
    };

    // Generate contract from application
    const contract = generateContractFromGig(gig, application, MOCK_CLIENT);

    // In production:
    // 1. Save application to database
    // 2. Save contract to database
    // 3. Send notification emails
    // 4. Link application to contract

    // For now, return success with contract ID
    return NextResponse.json({
      success: true,
      applicationId: application.id,
      contractId: contract.id,
      message: 'Application submitted successfully. Contract generated.',
      contract: {
        id: contract.id,
        title: contract.title,
        status: contract.status,
        client: contract.client.name,
        paymentAmount: contract.paymentTerms.totalAmount,
        paymentCurrency: contract.paymentTerms.currency,
      },
    });
  } catch (error) {
    console.error('Apply API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to submit applications.' },
    { status: 405 }
  );
}
