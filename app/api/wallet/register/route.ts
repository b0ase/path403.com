import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateHolder, getHolder } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, address, ordinalsAddress, handle } = body;

    if (!provider || (provider !== 'yours' && provider !== 'handcash')) {
      return NextResponse.json({ error: 'Invalid provider. Use "yours" or "handcash"' }, { status: 400 });
    }

    if (provider === 'yours' && !address) {
      return NextResponse.json({ error: 'Address required for Yours Wallet' }, { status: 400 });
    }

    if (provider === 'handcash' && !handle) {
      return NextResponse.json({ error: 'Handle required for HandCash' }, { status: 400 });
    }

    // Get or create the holder
    const holder = await getOrCreateHolder(
      address || '',
      provider,
      ordinalsAddress || address,
      handle
    );

    return NextResponse.json({
      success: true,
      holderId: holder.id,
      provider: holder.provider,
      balance: holder.balance,
      stakedBalance: holder.stakedBalance,
      availableBalance: holder.balance - holder.stakedBalance,
      createdAt: holder.createdAt,
    });
  } catch (error) {
    console.error('Error registering wallet:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const address = request.headers.get('x-wallet-address');
    const handle = request.headers.get('x-wallet-handle');

    if (!address && !handle) {
      return NextResponse.json({ error: 'No wallet identifier provided' }, { status: 400 });
    }

    const holder = await getHolder(address || undefined, handle || undefined);

    if (!holder) {
      return NextResponse.json({ registered: false });
    }

    return NextResponse.json({
      registered: true,
      holderId: holder.id,
      provider: holder.provider,
      balance: holder.balance,
      stakedBalance: holder.stakedBalance,
      availableBalance: holder.balance - holder.stakedBalance,
    });
  } catch (error) {
    console.error('Error checking wallet:', error);
    return NextResponse.json({ error: 'Check failed' }, { status: 500 });
  }
}
