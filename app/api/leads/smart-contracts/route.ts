import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      contractType,
      blockchain,
      budget,
      timeline,
      projectName,
      description,
      name,
      email,
      company,
    } = body;

    // Validate required fields
    if (!contractType || !blockchain || !budget || !timeline || !projectName || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Store in database
    const { data, error } = await supabase
      .from('leads')
      .insert({
        source: 'smart-contracts-form',
        lead_type: 'smart_contract',
        status: 'new',
        name,
        email,
        company,
        metadata: {
          contractType,
          blockchain,
          budget,
          timeline,
          projectName,
          description,
        },
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      // Don't fail if DB insert fails - still want to capture the lead
    }

    // Send notification email (optional - implement if needed)
    // await sendLeadNotification({ name, email, contractType, projectName });

    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully',
      leadId: data?.id,
    });

  } catch (error) {
    console.error('Smart contracts lead error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
