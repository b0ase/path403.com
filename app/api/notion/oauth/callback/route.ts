import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  if (error) {
    console.error('Notion OAuth error:', error);
    return NextResponse.redirect(new URL('/admin/notion?error=oauth_denied', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/admin/notion?error=no_code', request.url));
  }

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/notion/oauth/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    
    // Store the token securely in your database
    const supabase = createAdminClient();
    
    // You might want to associate this with a user session
    const { data, error: dbError } = await supabase
      .from('notion_tokens')
      .upsert({
        access_token: tokenData.access_token,
        token_type: tokenData.token_type,
        bot_id: tokenData.bot_id,
        workspace_name: tokenData.workspace_name,
        workspace_icon: tokenData.workspace_icon,
        workspace_id: tokenData.workspace_id,
        owner: tokenData.owner,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (dbError) {
      console.error('Database error storing token:', dbError);
      return NextResponse.redirect(new URL('/admin/notion?error=storage_failed', request.url));
    }

    // Redirect to success page
    return NextResponse.redirect(new URL('/admin/notion?success=true', request.url));

  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/admin/notion?error=callback_failed', request.url));
  }
} 