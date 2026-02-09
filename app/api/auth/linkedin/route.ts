import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const origin = new URL(request.url).origin;

        console.log('💼 Initiating LinkedIn OAuth flow...');

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'linkedin_oidc',
            options: {
                redirectTo: `${origin}/auth/callback`,
            },
        });

        if (error) {
            console.error('❌ LinkedIn OAuth Error:', error);
            return NextResponse.json({
                error: 'Failed to initiate LinkedIn login',
                details: error.message
            }, { status: 500 });
        }

        if (data?.url) {
            console.log('✅ LinkedIn OAuth redirect URL generated');
            return NextResponse.redirect(data.url);
        }

        return NextResponse.json({
            error: 'No redirect URL returned'
        }, { status: 500 });
    } catch (error) {
        console.error('❌ LinkedIn OAuth Error:', error);
        return NextResponse.json({
            error: 'Failed to initiate LinkedIn login',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
