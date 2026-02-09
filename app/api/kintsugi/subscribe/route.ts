/**
 * POST /api/kintsugi/subscribe
 *
 * Creates a Stripe subscription checkout for a Kintsugi project.
 * The subscriber pays £999/month for development support.
 * This is a SERVICE purchase, not a securities purchase.
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSubscriptionCheckout } from '@/lib/stripe-marketplace';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const subscribeSchema = z.object({
  projectSlug: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = subscribeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { projectSlug } = validation.data;

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', projectSlug)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify user owns this project (Kintsugi model)
    if (project.owner_user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only subscribe to projects you own' },
        { status: 403 }
      );
    }

    // Check if user already has an active subscription for this project
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('project_id', project.id)
      .eq('status', 'active')
      .single();

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'You already have an active subscription for this project' },
        { status: 409 }
      );
    }

    // Get user email
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.b0ase.com';

    // Create Stripe subscription checkout
    const session = await createSubscriptionCheckout(
      {
        userId: user.id,
        projectSlug,
        projectName: project.name,
        customerEmail: userProfile?.email || user.email,
      },
      `${baseUrl}/problem/success?project=${projectSlug}&session_id={CHECKOUT_SESSION_ID}`,
      `${baseUrl}/problem?cancelled=true`
    );

    // Create pending subscription record
    await supabase
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        project_id: project.id,
        subscription_type: 'development_support',
        status: 'pending',
        price_gbp: 999,
        stripe_session_id: session.id,
        metadata: {
          type: 'kintsugi',
          created_via: 'kintsugi-engine',
        },
      });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('[kintsugi/subscribe] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription checkout' },
      { status: 500 }
    );
  }
}
