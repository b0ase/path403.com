import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { encrypt, decrypt } from '@/lib/encryption';

// Helper to get current user's unified_user_id
async function getCurrentUnifiedUserId(supabase: any): Promise<string | null> {
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  const handcashHandle = cookieStore.get('b0ase_user_handle')?.value;
  const walletProvider = cookieStore.get('b0ase_wallet_provider')?.value;
  const walletAddress = cookieStore.get('b0ase_wallet_address')?.value;

  if (supabaseUser) {
    const { data: identities } = await supabase
      .from('user_identities')
      .select('unified_user_id')
      .eq('provider', 'supabase')
      .eq('provider_user_id', supabaseUser.id)
      .limit(1);
    return identities?.[0]?.unified_user_id || null;
  }

  if (handcashHandle) {
    const { data: identities } = await supabase
      .from('user_identities')
      .select('unified_user_id')
      .eq('provider', 'handcash')
      .eq('provider_user_id', handcashHandle)
      .limit(1);
    return identities?.[0]?.unified_user_id || null;
  }

  if (walletProvider && walletAddress) {
    const { data: identities } = await supabase
      .from('user_identities')
      .select('unified_user_id')
      .eq('provider', walletProvider)
      .eq('provider_user_id', walletAddress)
      .limit(1);
    return identities?.[0]?.unified_user_id || null;
  }

  return null;
}

// Validate API key format (basic validation)
function validateApiKeyFormat(provider: string, apiKey: string): { valid: boolean; error?: string } {
  switch (provider) {
    case 'claude':
      if (!apiKey.startsWith('sk-ant-')) {
        return { valid: false, error: 'Claude API keys should start with sk-ant-' };
      }
      break;
    case 'openai':
      if (!apiKey.startsWith('sk-')) {
        return { valid: false, error: 'OpenAI API keys should start with sk-' };
      }
      break;
    case 'gemini':
      if (apiKey.length < 20) {
        return { valid: false, error: 'Invalid Gemini API key format' };
      }
      break;
    default:
      return { valid: false, error: 'Unknown provider' };
  }
  return { valid: true };
}

// POST /api/user/api-keys - Store an API key
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const unifiedUserId = await getCurrentUnifiedUserId(supabase);

    if (!unifiedUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { provider, api_key } = body;

    if (!provider || !api_key) {
      return NextResponse.json({ error: 'provider and api_key are required' }, { status: 400 });
    }

    // Validate provider
    if (!['claude', 'openai', 'gemini'].includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider. Must be claude, openai, or gemini' }, { status: 400 });
    }

    // Validate API key format
    const validation = validateApiKeyFormat(provider, api_key);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Check if an API key already exists for this provider
    const { data: existingIdentity } = await supabase
      .from('user_identities')
      .select('id')
      .eq('unified_user_id', unifiedUserId)
      .eq('provider', provider)
      .single();

    const encryptedKey = encrypt(api_key);
    const keyPrefix = api_key.slice(0, 8) + '...' + api_key.slice(-4);

    if (existingIdentity) {
      // Update existing API key
      const { error } = await supabase
        .from('user_identities')
        .update({
          provider_data: {
            encrypted_key: encryptedKey,
            key_prefix: keyPrefix,
            updated_at: new Date().toISOString()
          },
        })
        .eq('id', existingIdentity.id);

      if (error) {
        console.error('Error updating API key:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'API key updated' });
    }

    // Create new identity for the API key
    const { error } = await supabase
      .from('user_identities')
      .insert({
        unified_user_id: unifiedUserId,
        provider,
        provider_user_id: `api_key_${provider}_${Date.now()}`,
        provider_handle: keyPrefix,
        provider_data: {
          encrypted_key: encryptedKey,
          key_prefix: keyPrefix,
          created_at: new Date().toISOString()
        },
      });

    if (error) {
      console.error('Error storing API key:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'API key stored' }, { status: 201 });
  } catch (error) {
    console.error('API keys POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/user/api-keys?provider=claude - Remove an API key
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const unifiedUserId = await getCurrentUnifiedUserId(supabase);

    if (!unifiedUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
    }

    if (!['claude', 'openai', 'gemini'].includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    // Delete the API key identity
    const { error } = await supabase
      .from('user_identities')
      .delete()
      .eq('unified_user_id', unifiedUserId)
      .eq('provider', provider);

    if (error) {
      console.error('Error removing API key:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API keys DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/user/api-keys - Get API keys (only returns masked versions)
export async function GET() {
  try {
    const supabase = await createClient();
    const unifiedUserId = await getCurrentUnifiedUserId(supabase);

    if (!unifiedUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: identities, error } = await supabase
      .from('user_identities')
      .select('provider, provider_handle, provider_data, linked_at')
      .eq('unified_user_id', unifiedUserId)
      .in('provider', ['claude', 'openai', 'gemini']);

    if (error) {
      console.error('Error fetching API keys:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return only safe information (no actual keys)
    const apiKeys = (identities || []).map(i => ({
      provider: i.provider,
      key_prefix: i.provider_data?.key_prefix || i.provider_handle,
      linked_at: i.linked_at,
    }));

    return NextResponse.json({ api_keys: apiKeys });
  } catch (error) {
    console.error('API keys GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
