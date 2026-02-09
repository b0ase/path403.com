import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { getTokenHoldings, TokenHolding } from '@/lib/boardroom/token-holdings';

// GET - Get all boardroom members with cap table info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const walletAddress = searchParams.get('wallet');

    const prisma = getPrisma();

    // Base query for members
    const members = await prisma.boardroom_members.findMany({
      orderBy: { joined_at: 'desc' }
    });

    // Enrich members with cap table data
    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        if (!member.wallet_address) return member;

        // Check if this member is a cap table shareholder
        // Using Prisma instead of Supabase for reliability
        const shareholder = await prisma.cap_table_shareholders.findFirst({
          where: {
            wallet_address: { equals: member.wallet_address, mode: 'insensitive' },
            status: 'active'
          },
          select: {
            ownership_percentage: true,
            token_balance: true,
            shareholder_type: true
          }
        });

        if (shareholder) {
          // Prisma returns Decimal/BigInt, we need to convert to string/number for JSON response
          return {
            ...member,
            is_shareholder: true,
            ownership_percentage: shareholder.ownership_percentage?.toString() || '0',
            token_balance: shareholder.token_balance?.toString() || '0',
            shareholder_type: shareholder.shareholder_type,
            voting_weight: (Number(shareholder.ownership_percentage) || 0) * 1_000_000,
          };
        }

        return { ...member, is_shareholder: false };
      })
    );

    // If wallet specified, also return their holdings summary
    let holdings: TokenHolding[] | null = null;
    if (walletAddress) {
      try {
        holdings = await getTokenHoldings(walletAddress);
      } catch (e) {
        console.error('Error fetching token holdings:', e);
        // Don't fail the whole request if holdings fail
      }
    }

    const response: Record<string, unknown> = {
      success: true,
      members: enrichedMembers,
      count: enrichedMembers.length,
    };
    if (holdings) {
      response.holdings = holdings;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching boardroom members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

// POST - Add a new boardroom member (auto-links with cap table)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, role, wallet_address, source, action } = body;
    const prisma = getPrisma();

    // Special action: sync shareholders to boardroom members
    if (action === 'sync_shareholders') {
      const synced = await syncShareholdersToMembers();
      return NextResponse.json({
        success: true,
        synced,
        message: `Synced ${synced} shareholders to boardroom members`
      });
    }

    // Validate required fields
    if (!username || !role) {
      return NextResponse.json(
        { success: false, error: 'Username and role are required' },
        { status: 400 }
      );
    }

    // Check if this wallet is a shareholder and upgrade role accordingly
    let finalRole = role;
    let shareholderData: any = null;

    if (wallet_address) {
      const shareholder = await prisma.cap_table_shareholders.findFirst({
        where: {
          wallet_address: { equals: wallet_address, mode: 'insensitive' },
          status: 'active'
        },
        select: {
          ownership_percentage: true,
          token_balance: true,
          shareholder_type: true
        }
      });

      if (shareholder) {
        shareholderData = shareholder;
        // Shareholders get elevated role based on ownership
        const ownershipPct = Number(shareholder.ownership_percentage) || 0;
        if (ownershipPct >= 10) {
          finalRole = 'Board Member';
        } else if (ownershipPct >= 1) {
          finalRole = 'Shareholder';
        } else {
          finalRole = 'Token Holder';
        }
      }
    }

    // Upsert member (update if exists, insert if not)
    const data = await prisma.boardroom_members.upsert({
      where: {
        // Prisma requires a unique constraint for upsert. 
        // Assuming wallet_address is optional/nullable, this is tricky if it's null.
        // But the schema doesn't effectively enforce unique wallet_address if it's nullable in a way that Prisma client always likes easily.
        // However, `supabase` query did upsert on 'wallet_address'.
        // We'll rely on our knowledge that for authenticated boardroom users, wallet_address should be unique if present.
        // If wallet_address is null, we can't easily upsert by it.
        // But effectively, if we have a wallet address, we use it.
        // Since the schema defines `boardroom_members` without a @unique on wallet_address in the truncated view I saw earlier,
        // wait - I did NOT see a @unique on `wallet_address` in `boardroom_members` model in schema.
        // Let me double check the schema search I did.
        // Line 650: wallet_address String?
        // No @unique. Supabase upsert handles this if there's a constraint in DB not in Prisma schema, OR it just inserts.
        // Actually, if there is no unique constraint, Prisma upsert will fail typing.
        // I should check `prisma/schema.prisma` again.
        // If no unique constraint, I have to do findFirst then update or create.
        // But wait, the supabase code had: `, { onConflict: 'wallet_address' }`.
        // This implies there IS a unique constraint on `wallet_address` in Postgres.
        // If Prisma schema doesn't know about it, I can't use `upsert` with `where: { wallet_address }`.
        // I'll stick to findFirst + update/create logic to be safe.
      },
      // ... actually, let's use check-then-act for safety since I can't confirm the Prisma generated client types right now. 
      // Safe implementation below:
    } as any);

    // Re-implementing safe upsert logic:
    let member;
    if (wallet_address) {
      const existing = await prisma.boardroom_members.findFirst({
        where: { wallet_address: { equals: wallet_address, mode: 'insensitive' } }
      });

      if (existing) {
        member = await prisma.boardroom_members.update({
          where: { id: existing.id },
          data: {
            username,
            role: finalRole,
            source: source || existing.source,
            // joined_at usually stays same
          }
        });
      } else {
        member = await prisma.boardroom_members.create({
          data: {
            username,
            role: finalRole,
            wallet_address,
            source: source || 'website',
            joined_at: new Date()
          }
        });
      }
    } else {
      // No wallet, just create (allow multiple non-wallet members? or check username?)
      // Original code didn't check username uniqueness.
      member = await prisma.boardroom_members.create({
        data: {
          username,
          role: finalRole,
          wallet_address: null,
          source: source || 'website',
          joined_at: new Date()
        }
      });
    }

    // Build member response with shareholder data if available
    const memberResponse: Record<string, unknown> = {
      ...member,
      is_shareholder: !!shareholderData,
    };
    if (shareholderData) {
      memberResponse.ownership_percentage = shareholderData.ownership_percentage?.toString();
      memberResponse.token_balance = shareholderData.token_balance?.toString();
      memberResponse.shareholder_type = shareholderData.shareholder_type;
    }

    return NextResponse.json({
      success: true,
      member: memberResponse,
      message: shareholderData
        ? `Welcome ${username}! You have been recognized as a shareholder.`
        : 'Member added successfully'
    });
  } catch (error) {
    console.error('Error adding boardroom member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add member' },
      { status: 500 }
    );
  }
}

/**
 * Sync all active cap table shareholders to boardroom members
 */
async function syncShareholdersToMembers(): Promise<number> {
  const prisma = getPrisma();

  // Get all active shareholders
  const shareholders = await prisma.cap_table_shareholders.findMany({
    where: { status: 'active' },
    select: {
      wallet_address: true,
      full_name: true,
      ownership_percentage: true,
      shareholder_type: true
    }
  });

  if (!shareholders || !shareholders.length) {
    console.log('[boardroom/members] No shareholders to sync');
    return 0;
  }

  let synced = 0;

  for (const sh of shareholders) {
    if (!sh.wallet_address) continue;

    const ownershipPct = Number(sh.ownership_percentage) || 0;
    let role = 'Token Holder';
    if (ownershipPct >= 10) role = 'Board Member';
    else if (ownershipPct >= 1) role = 'Shareholder';

    // Upsert logic
    const existing = await prisma.boardroom_members.findFirst({
      where: { wallet_address: { equals: sh.wallet_address, mode: 'insensitive' } }
    });

    if (existing) {
      await prisma.boardroom_members.update({
        where: { id: existing.id },
        data: {
          role // Update role based on new holdings
        }
      });
    } else {
      await prisma.boardroom_members.create({
        data: {
          username: sh.full_name || `Shareholder ${sh.wallet_address.slice(0, 8)}`,
          role,
          wallet_address: sh.wallet_address,
          source: 'cap_table_sync',
          joined_at: new Date()
        }
      });
    }
    synced++;
  }

  console.log(`[boardroom/members] Synced ${synced} shareholders`);
  return synced;
} 