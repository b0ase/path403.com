/**
 * GET /api/pipeline/work-items
 *
 * List all work items with optional filtering.
 * This is the main endpoint for browsing available work.
 *
 * For Kintsugi agent: Use this to find work to claim.
 */

import { NextRequest, NextResponse } from 'next/server';
import { listOpenWorkItems, getWorkItem } from '@/lib/pipeline-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get a specific work item by ID
    const id = searchParams.get('id');
    if (id) {
      const workItem = await getWorkItem(id);
      if (!workItem) {
        return NextResponse.json(
          { error: 'Work item not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        workItem,
      });
    }

    // List with filters
    const filters = {
      projectSlug: searchParams.get('projectSlug') || undefined,
      trancheId: searchParams.get('trancheId') || undefined,
      minBounty: searchParams.get('minBounty')
        ? Number(searchParams.get('minBounty'))
        : undefined,
      maxBounty: searchParams.get('maxBounty')
        ? Number(searchParams.get('maxBounty'))
        : undefined,
    };

    const workItems = await listOpenWorkItems(filters);

    return NextResponse.json({
      success: true,
      workItems,
      count: workItems.length,
      filters,
    });
  } catch (error) {
    console.error('[pipeline] List work items error:', error);

    return NextResponse.json(
      {
        error: 'Failed to list work items',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
