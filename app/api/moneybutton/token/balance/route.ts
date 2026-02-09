import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const handcashHandle = searchParams.get('handle');

    if (!handcashHandle) {
      return NextResponse.json({ error: 'HandCash handle required' }, { status: 400 });
    }

    // Get all token balances for this handle
    const { data: balances, error } = await supabase
      .from('moneybutton_balances')
      .select('token_symbol, balance, total_purchased, total_spent, updated_at')
      .eq('handcash_handle', handcashHandle)
      .order('balance', { ascending: false });

    if (error) {
      console.error('Error fetching balances:', error);
      return NextResponse.json({ error: 'Failed to fetch balances' }, { status: 500 });
    }

    // Calculate totals
    const totalBalance = balances?.reduce((sum, b) => sum + Number(b.balance), 0) || 0;
    const totalPurchased = balances?.reduce((sum, b) => sum + Number(b.total_purchased), 0) || 0;

    return NextResponse.json({
      success: true,
      handle: handcashHandle,
      balances: balances || [],
      totals: {
        balance: totalBalance,
        purchased: totalPurchased,
      },
    });
  } catch (error: any) {
    console.error('Balance API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
