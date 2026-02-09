import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/investors/agreements - List all agreements for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const agreementId = searchParams.get('id');

    // If specific agreement ID requested
    if (agreementId) {
      const { data: agreement, error } = await supabase
        .from('investor_agreements')
        .select(`
          *,
          domain_exit_tokens (*),
          agreement_performance_logs (*)
        `)
        .eq('id', agreementId)
        .or(`user_id.eq.${user.id},founder_user_id.eq.${user.id}`)
        .single();

      if (error) {
        console.error('Error fetching agreement:', error);
        return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
      }

      return NextResponse.json({ agreement });
    }

    // List all agreements for user (as investor or founder)
    const { data: agreements, error } = await supabase
      .from('investor_agreements')
      .select(`
        *,
        domain_exit_tokens (id, domain_name, token_status, investor_tokens)
      `)
      .or(`user_id.eq.${user.id},founder_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching agreements:', error);
      return NextResponse.json({ error: 'Failed to fetch agreements' }, { status: 500 });
    }

    return NextResponse.json({
      agreements,
      count: agreements?.length || 0,
      user_role: agreements?.some(a => a.founder_user_id === user.id) ? 'founder' : 'investor'
    });

  } catch (error) {
    console.error('Agreements GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/investors/agreements - Create new agreement
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const {
      investor_name,
      investor_email,
      investor_wallet_address,
      investor_user_id, // The investor's user ID (might be different from founder creating it)
      agreement_type = 'domain_exit_rights',
      properties, // Array: ["BSVEX.com", "DNS-DEX.com"]
      investment_amount_bsv,
      investment_amount_usd,
      initial_equity_percentage,
      performance_deadline,
      performance_obligations,
      contract_json,
      monthly_sync_schedule = '1st Wednesday 10:00 AM PT',
    } = body;

    // Validation
    if (!investor_name || !investor_email || !properties || !investment_amount_bsv || !performance_deadline || !contract_json) {
      return NextResponse.json({
        error: 'Missing required fields',
        required: ['investor_name', 'investor_email', 'properties', 'investment_amount_bsv', 'performance_deadline', 'contract_json']
      }, { status: 400 });
    }

    // Calculate milestone dates
    const deadlineDate = new Date(performance_deadline);
    const sixMonthDate = new Date(deadlineDate);
    sixMonthDate.setMonth(sixMonthDate.getMonth() - 6);

    // Calculate next sync date (1st Wednesday of next month)
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    while (nextMonth.getDay() !== 3) { // 3 = Wednesday
      nextMonth.setDate(nextMonth.getDate() + 1);
    }

    // Create agreement
    const { data: agreement, error: agreementError } = await supabase
      .from('investor_agreements')
      .insert({
        user_id: investor_user_id || user.id, // Investor's user ID
        founder_user_id: user.id, // Creator is the founder
        investor_name,
        investor_email,
        investor_wallet_address,
        agreement_type,
        properties,
        investment_amount_bsv,
        investment_amount_usd,
        initial_equity_percentage,
        current_equity_percentage: initial_equity_percentage,
        performance_deadline: deadlineDate.toISOString(),
        performance_obligations: performance_obligations || {
          option_a: { type: 'capital_raising', target_usd: 10000, met: false },
          option_b: { type: 'development_work', description: 'Build MVP or complete development milestones', met: false },
          option_c: { type: 'pro_rata_capital', description: 'Participate in pro-rata capital raises', met: false },
          option_d: { type: 'equity_funded_dev', description: 'Fund development via equity compensation', met: false }
        },
        contract_json,
        monthly_sync_schedule,
        next_sync_date: nextMonth.toISOString(),
        six_month_review_date: sixMonthDate.toISOString(),
        twelve_month_decision_date: deadlineDate.toISOString(),
      })
      .select()
      .single();

    if (agreementError) {
      console.error('Error creating agreement:', agreementError);
      return NextResponse.json({ error: 'Failed to create agreement', details: agreementError.message }, { status: 500 });
    }

    // Create domain tokens for each property
    const tokenInserts = properties.map((domain: string) => ({
      agreement_id: agreement.id,
      domain_name: domain,
      token_name: `${domain.replace('.com', '').toUpperCase()} Domain Sale Rights`,
      token_symbol: `${domain.replace('.com', '').toUpperCase()}-EXIT`,
      total_supply: 1000000000, // 1 billion
      founder_tokens: 500000000, // 500 million (50%)
      investor_tokens: 500000000, // 500 million (50%)
      investor_wallet_address,
      token_status: 'pending_mint',
    }));

    const { data: tokens, error: tokensError } = await supabase
      .from('domain_exit_tokens')
      .insert(tokenInserts)
      .select();

    if (tokensError) {
      console.error('Error creating tokens:', tokensError);
      // Don't fail the whole operation, tokens can be created later
    }

    // Log the creation
    await supabase
      .from('agreement_performance_logs')
      .insert({
        agreement_id: agreement.id,
        log_type: 'other',
        description: `Agreement created for ${properties.join(', ')}. Investment: ${investment_amount_bsv} BSV for ${initial_equity_percentage}% equity per domain.`,
        logged_by_user_id: user.id,
        logged_by_name: 'System',
        metadata: { action: 'agreement_created', properties }
      });

    return NextResponse.json({
      success: true,
      agreement,
      tokens,
      message: `Agreement created for ${properties.length} domain(s)`
    }, { status: 201 });

  } catch (error) {
    console.error('Agreements POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
