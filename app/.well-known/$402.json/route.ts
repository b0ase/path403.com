import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculatePrice } from '@/lib/tokens/pricing';
import type { PricingModel } from '@/lib/tokens/types';
import { PAYMENT_ADDRESS } from '@/lib/store';

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured');
  }
  return createClient(supabaseUrl, supabaseKey);
}

function getDomain(request: NextRequest): string {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  return host.replace(/^www\./, '').split(':')[0];
}

export async function GET(request: NextRequest) {
  try {
    const domain = getDomain(request);
    const rootPath = `$${domain}`;
    const supabase = getSupabase();

    const { data: rootToken } = await supabase
      .from('tokens')
      .select('*')
      .eq('address', rootPath)
      .single();

    const { data: children } = await supabase
      .from('tokens')
      .select('address, inscription_id, parent_address, parent_share_bps, pricing_model, base_price_sats, treasury_balance, access_mode, usage_pricing')
      .ilike('address', `${rootPath}/%`)
      .limit(200);

    const rootPricing = rootToken ? {
      model: rootToken.pricing_model,
      base: rootToken.base_price_sats,
      current_price: calculatePrice(
        rootToken.pricing_model as PricingModel,
        rootToken.base_price_sats,
        rootToken.treasury_balance || 0
      ),
    } : null;

    return NextResponse.json({
      '$402_version': '2.0.0',
      extensions: ['$402-curves', '$402-hierarchy', '$402-usage', '$402-compliance'],
      root: rootToken ? {
        path: rootPath,
        inscription_id: rootToken.inscription_id || null,
        pricing: rootPricing,
        access_mode: rootToken.access_mode || 'token',
        usage_pricing: rootToken.usage_pricing || null,
      } : null,
      children: (children || []).map((child: {
        address: string;
        inscription_id?: string;
        parent_address?: string;
        parent_share_bps?: number;
        pricing_model?: string;
        base_price_sats?: number;
        treasury_balance?: number;
        access_mode?: string;
        usage_pricing?: unknown;
      }) => ({
        path: child.address,
        inscription_id: child.inscription_id || null,
        parent: child.parent_address || rootPath,
        parent_share_bps: child.parent_share_bps ?? 5000,
        pricing: {
          model: child.pricing_model,
          base: child.base_price_sats,
          current_price: calculatePrice(
            (child.pricing_model || 'sqrt_decay') as PricingModel,
            child.base_price_sats || 0,
            child.treasury_balance || 0
          ),
        },
        access_mode: child.access_mode || 'token',
        usage_pricing: child.usage_pricing || null,
      })),
      payment: {
        address: PAYMENT_ADDRESS,
        accepted_currencies: ['BSV'],
      },
    });
  } catch (error) {
    console.error('[/.well-known/$402.json] Error:', error);
    return NextResponse.json({
      error: 'Failed to generate discovery document',
    }, { status: 500 });
  }
}
