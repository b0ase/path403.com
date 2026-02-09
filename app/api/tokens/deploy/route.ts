import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deployToken, DeployResult } from '@/lib/bsv-deploy-token';
import { TOKEN_REGISTRY } from '@/lib/token-registry';

/**
 * POST /api/tokens/deploy
 *
 * Deploy a new BSV-21 token on the blockchain.
 * Admin only - requires authenticated user with admin role.
 *
 * Body:
 * - symbol: string (e.g., 'BSHEETS')
 * - totalSupply?: number (default: 1,000,000,000)
 * - iconBase64?: string (base64 encoded image)
 * - iconContentType?: string (e.g., 'image/png')
 * - destinationAddress?: string (default: treasury)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'superadmin'].includes(profile.role || '')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { symbol, totalSupply, iconBase64, iconContentType, destinationAddress } = body;

    if (!symbol || typeof symbol !== 'string') {
      return NextResponse.json({ error: 'Token symbol required' }, { status: 400 });
    }

    // Normalize symbol (remove $ prefix if present)
    const normalizedSymbol = symbol.replace(/^\$/, '').toUpperCase();
    const fullSymbol = `$${normalizedSymbol}`;

    // Check if token exists in registry
    const registryEntry = TOKEN_REGISTRY[fullSymbol];
    if (!registryEntry) {
      return NextResponse.json({
        error: `Token ${fullSymbol} not found in registry. Add it first.`,
      }, { status: 400 });
    }

    // Check if already deployed
    const { data: existingToken } = await supabase
      .from('issued_tokens')
      .select('*')
      .eq('symbol', normalizedSymbol)
      .eq('is_deployed', true)
      .single();

    if (existingToken) {
      return NextResponse.json({
        error: 'Token already deployed',
        existingToken: {
          symbol: existingToken.symbol,
          tokenId: existingToken.token_contract_address,
          blockchain: existingToken.blockchain,
        },
      }, { status: 409 });
    }

    console.log(`[deploy] Deploying ${normalizedSymbol} token...`);

    // Deploy the token
    let result: DeployResult;
    try {
      result = await deployToken({
        symbol: normalizedSymbol,
        totalSupply: totalSupply || registryEntry.pricing?.supply || 1_000_000_000,
        iconBase64,
        iconContentType,
        destinationAddress,
      });
    } catch (deployError: unknown) {
      console.error('[deploy] Deployment failed:', deployError);
      return NextResponse.json({
        error: 'Token deployment failed',
        details: deployError instanceof Error ? deployError.message : 'Unknown error',
      }, { status: 500 });
    }

    console.log(`[deploy] Token deployed: ${result.tokenId}`);

    // Record in issued_tokens
    const { error: insertError } = await supabase
      .from('issued_tokens')
      .upsert({
        symbol: normalizedSymbol,
        name: registryEntry.name,
        blockchain: 'bsv',
        token_contract_address: result.tokenId,
        is_deployed: true,
        total_supply: result.totalSupply,
        metadata: {
          txid: result.txid,
          deployedAt: new Date().toISOString(),
          deployedBy: user.id,
          registryCategory: registryEntry.category,
        },
      }, {
        onConflict: 'symbol',
      });

    if (insertError) {
      console.error('[deploy] Failed to record token:', insertError);
      // Don't fail - token is already deployed
    }

    return NextResponse.json({
      success: true,
      deployment: {
        symbol: normalizedSymbol,
        fullSymbol,
        tokenId: result.tokenId,
        txid: result.txid,
        totalSupply: result.totalSupply,
        explorerUrl: `https://whatsonchain.com/tx/${result.txid}`,
        marketUrl: `https://1sat.market/bsv21/${normalizedSymbol.toLowerCase()}`,
        ordinalsUrl: `https://1satordinals.com/token/${result.tokenId}`,
      },
    });
  } catch (error) {
    console.error('[deploy] API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * GET /api/tokens/deploy?symbol=BSHEETS
 *
 * Check deployment status of a token
 */
export async function GET(request: NextRequest) {
  try {
    const symbol = request.nextUrl.searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
    }

    const normalizedSymbol = symbol.replace(/^\$/, '').toUpperCase();

    const supabase = await createClient();

    const { data: token, error } = await supabase
      .from('issued_tokens')
      .select('*')
      .eq('symbol', normalizedSymbol)
      .single();

    if (error || !token) {
      return NextResponse.json({
        deployed: false,
        symbol: normalizedSymbol,
      });
    }

    return NextResponse.json({
      deployed: token.is_deployed || false,
      symbol: token.symbol,
      name: token.name,
      tokenId: token.token_contract_address,
      blockchain: token.blockchain,
      totalSupply: token.total_supply,
      metadata: token.metadata,
      explorerUrl: token.token_contract_address
        ? `https://whatsonchain.com/tx/${token.token_contract_address.split('_')[0]}`
        : null,
      marketUrl: `https://1sat.market/bsv21/${normalizedSymbol.toLowerCase()}`,
    });
  } catch (error) {
    console.error('[deploy] GET error:', error);
    return NextResponse.json({
      error: 'Failed to check deployment status',
    }, { status: 500 });
  }
}
