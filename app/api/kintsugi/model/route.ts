/**
 * GET/POST /api/kintsugi/model
 *
 * Get or set the preferred AI provider for Kintsugi chat.
 * This sets a cookie that the chat endpoint reads to determine provider order.
 *
 * Supported providers:
 * - anthropic (Claude 3.5 Sonnet) - Best quality, higher cost
 * - kimi (Moonshot K2.5) - 25x cheaper, good quality
 * - gemini (Google) - Free tier available
 * - deepseek - Very cheap, good for Chinese content
 * - openai (GPT-4o-mini) - Reliable fallback
 */

import { NextRequest, NextResponse } from 'next/server';

const VALID_PROVIDERS = ['anthropic', 'kimi', 'gemini', 'deepseek', 'openai'] as const;
type Provider = typeof VALID_PROVIDERS[number];

const PROVIDER_INFO: Record<Provider, { name: string; description: string; pricing: string }> = {
  anthropic: {
    name: 'Claude 3.5 Sonnet',
    description: 'Anthropic\'s most capable model. Best quality for complex reasoning.',
    pricing: '$3/M input, $15/M output'
  },
  kimi: {
    name: 'Moonshot K2.5 (Kimi)',
    description: '1T parameter model from Moonshot AI. Excellent value.',
    pricing: '$0.50/M input, $2.80/M output (25x cheaper than Claude)'
  },
  gemini: {
    name: 'Gemini Pro/Flash',
    description: 'Google\'s AI. Free tier available.',
    pricing: 'Free tier, then $0.35/M input'
  },
  deepseek: {
    name: 'Deepseek Chat',
    description: 'Very cost-effective. Excellent for Chinese content.',
    pricing: '$0.14/M input, $0.28/M output'
  },
  openai: {
    name: 'GPT-4o-mini',
    description: 'OpenAI\'s fast, affordable model.',
    pricing: '$0.15/M input, $0.60/M output'
  }
};

export async function GET(request: NextRequest) {
  const currentProvider = request.cookies.get('kintsugi-provider')?.value || 'anthropic';

  return NextResponse.json({
    current: currentProvider,
    providers: VALID_PROVIDERS.map(p => ({
      id: p,
      ...PROVIDER_INFO[p],
      selected: p === currentProvider
    }))
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider } = body as { provider: string };

    if (!provider || !VALID_PROVIDERS.includes(provider as Provider)) {
      return NextResponse.json(
        {
          error: `Invalid provider. Must be one of: ${VALID_PROVIDERS.join(', ')}`,
          valid_providers: VALID_PROVIDERS
        },
        { status: 400 }
      );
    }

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      provider,
      info: PROVIDER_INFO[provider as Provider],
      message: `Kintsugi will now use ${PROVIDER_INFO[provider as Provider].name} as the primary AI provider.`
    });

    // Set cookie (30 days expiry)
    response.cookies.set('kintsugi-provider', provider, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
