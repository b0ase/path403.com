import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  getTokenHoldings,
  getHeldTokenSymbols,
  ensureBoaseShareholderRoom,
  createShareholderMeetingRooms,
} from '@/lib/boardroom/token-holdings';

const supabase = createAdminClient();

// GET - Get available chat rooms for a user's tokens
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');
    // Legacy support: also accept tokens param, but we'll verify against actual holdings
    const clientTokens = searchParams.get('tokens')?.split(',') || [];

    console.log('[boardroom/rooms] GET for wallet:', walletAddress);

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    // Ensure the $BOASE shareholders room exists
    await ensureBoaseShareholderRoom();

    // Get user's ACTUAL token holdings from all systems (including on-chain BSV21)
    const holdings = await getTokenHoldings(walletAddress);

    // Auto-create shareholder meeting rooms for all tokens the user holds
    // This ensures users see meeting rooms for tokens in their wallet (including Yours wallet)
    if (holdings.length > 0) {
      const createdRooms = await createShareholderMeetingRooms(walletAddress);
      if (createdRooms.length > 0) {
        console.log('[boardroom/rooms] Auto-created shareholder rooms:', createdRooms);
      }
    }
    const heldSymbols = holdings.filter(h => h.balance > 0).map(h => h.symbol.toUpperCase());

    console.log('[boardroom/rooms] Verified holdings:', holdings.map(h => `${h.symbol}:${h.balance}`));

    // Get all active chat rooms
    const { data: allRooms, error: fetchError } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('[boardroom/rooms] Error fetching rooms:', fetchError);
      return NextResponse.json({ error: 'Failed to get chat rooms' }, { status: 500 });
    }

    // Filter rooms based on verified holdings
    const accessibleRooms = allRooms?.filter(room => {
      // General room is always available
      if (room.id === 'general') return true;

      // No token requirement = public room
      if (!room.required_tokens || room.required_tokens.length === 0) return true;

      // Check if user has ANY of the required tokens
      const hasRequiredToken = room.required_tokens.some((requiredToken: string) =>
        heldSymbols.includes(requiredToken.toUpperCase())
      );

      if (!hasRequiredToken) return false;

      // Check minimum balance if specified
      if (room.min_balance && room.min_balance > 0) {
        const relevantHolding = holdings.find(h =>
          room.required_tokens.some((rt: string) => rt.toUpperCase() === h.symbol.toUpperCase())
        );
        if (!relevantHolding || relevantHolding.balance < room.min_balance) {
          return false;
        }
      }

      return true;
    }) || [];

    // Enrich rooms with user's holding info
    const rooms = accessibleRooms.map(room => {
      const relevantHolding = holdings.find(h =>
        room.required_tokens?.some((rt: string) => rt.toUpperCase() === h.symbol.toUpperCase())
      );

      return {
        ...room,
        has_access: true,
        user_balance: relevantHolding?.balance || 0,
        user_ownership_pct: relevantHolding?.ownershipPercentage || 0,
      };
    });

    console.log('[boardroom/rooms] Accessible rooms:', rooms.length);

    return NextResponse.json({
      rooms,
      holdings: holdings.map(h => ({
        symbol: h.symbol,
        balance: h.balance,
        type: h.type,
        verified: h.verified,
      })),
    });
  } catch (error) {
    console.error('[boardroom/rooms] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create chat rooms for tokens
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokens, walletAddress, customRoom } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    console.log('[boardroom/rooms] POST for wallet:', walletAddress);

    // Verify the user actually holds these tokens before creating rooms
    const holdings = await getTokenHoldings(walletAddress);
    const heldSymbols = new Set(holdings.filter(h => h.balance > 0).map(h => h.symbol.toUpperCase()));

    const createdRooms: Array<{ token: string; roomId: string; type: string }> = [];

    // Option 1: Create a custom room with specific requirements
    if (customRoom) {
      const { name, description, requiredTokens, minBalance, tokenType } = customRoom;

      if (!name || !requiredTokens?.length) {
        return NextResponse.json({ error: 'Custom room requires name and requiredTokens' }, { status: 400 });
      }

      // Verify creator holds at least one of the required tokens
      const creatorHasToken = requiredTokens.some((t: string) => heldSymbols.has(t.toUpperCase()));
      if (!creatorHasToken) {
        return NextResponse.json({
          error: 'You must hold at least one of the required tokens to create this room',
        }, { status: 403 });
      }

      const roomId = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

      const { error } = await supabase
        .from('chat_rooms')
        .insert({
          id: roomId,
          name,
          description: description || `Token-gated chat for ${requiredTokens.join(', ')} holders`,
          required_tokens: requiredTokens,
          min_balance: minBalance || 0,
          token_type: tokenType || 'project',
          created_by_wallet: walletAddress,
          is_active: true,
        });

      if (!error) {
        createdRooms.push({ token: requiredTokens.join(','), roomId, type: 'custom' });
      } else {
        console.error('[boardroom/rooms] Error creating custom room:', error);
        return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
      }

      return NextResponse.json({ success: true, room: { id: roomId, name }, createdRooms });
    }

    // Option 2: Auto-create rooms for user's holdings
    if (!tokens || !Array.isArray(tokens)) {
      return NextResponse.json({ error: 'Tokens array or customRoom required' }, { status: 400 });
    }

    for (const token of tokens) {
      const symbol = token.symbol?.toUpperCase() || token.toUpperCase();

      // Verify user actually holds this token
      if (!heldSymbols.has(symbol)) {
        console.log(`[boardroom/rooms] Skipping ${symbol} - user does not hold`);
        continue;
      }

      const holding = holdings.find(h => h.symbol.toUpperCase() === symbol);
      const roomId = `${symbol.toLowerCase()}-holders`;
      const tokenType = holding?.type || 'project';

      const { error } = await supabase
        .from('chat_rooms')
        .upsert({
          id: roomId,
          name: `${symbol} Holders`,
          description: `Exclusive chat for verified ${symbol} token holders`,
          required_tokens: [symbol],
          token_type: tokenType,
          min_balance: 0,
          created_by_wallet: walletAddress,
          is_active: true,
        }, { onConflict: 'id' });

      if (!error) {
        createdRooms.push({ token: symbol, roomId, type: tokenType });
        console.log(`[boardroom/rooms] Created/updated room: ${roomId}`);
      }
    }

    // Create VIP room if user has 3+ different tokens
    if (holdings.length >= 3) {
      const vipTokens = holdings.slice(0, 5).map(h => h.symbol);
      const { error } = await supabase
        .from('chat_rooms')
        .upsert({
          id: 'multi-token-vip',
          name: 'Multi-Token VIP',
          description: 'Exclusive room for holders of 3+ b0ase ecosystem tokens',
          required_tokens: vipTokens,
          token_type: 'vip',
          min_balance: 0,
          created_by_wallet: walletAddress,
          is_active: true,
        }, { onConflict: 'id' });

      if (!error) {
        createdRooms.push({ token: 'VIP', roomId: 'multi-token-vip', type: 'vip' });
      }
    }

    console.log('[boardroom/rooms] Created rooms:', createdRooms.length);

    return NextResponse.json({
      success: true,
      createdRooms,
      holdings: holdings.map(h => ({ symbol: h.symbol, balance: h.balance, type: h.type })),
      message: `Created ${createdRooms.length} chat rooms for your verified holdings`,
    });
  } catch (error) {
    console.error('[boardroom/rooms] POST Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 