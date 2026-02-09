import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, rateLimitPresets } from '@/lib/rate-limit';

// WARNING: Never expose your service role key on the client-side!
// Ensure these are set as environment variables.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function inviteClientHandler(request: NextRequest) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Supabase URL or Service Role Key is missing in environment variables.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // Create the Supabase Admin client
  // Note: This uses the service_role key and should ONLY be used in server-side environments
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log(`Generating invite link for: ${email}`);

    // Generate the invitation link using the Admin API
    // Supabase handles sending the email automatically based on your template settings
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite', // Specifies this is an invitation link
      email: email,
      // Optional: Add redirect URL if you want them to land somewhere specific *after* confirming
      // By default, it might use your site URL or configured redirect URLs
      // options: { redirectTo: '/set-password' } // Example: if you have a dedicated page
    });

    if (error) {
      console.error('Supabase Admin Error generating invite:', error.message);
      // Provide a more specific error if possible, but avoid leaking too much info
      let statusCode = 500;
      if (error.message.includes('User already registered')) {
         statusCode = 409; // Conflict
      }
      return NextResponse.json({ error: `Failed to generate invite link: ${error.message}` }, { status: statusCode });
    }

    // IMPORTANT: The link is generated and *sent by Supabase*, not returned here directly usually.
    // data contains user info, properties (like the link itself if not emailed), etc.
    // We log success but don't need to return the link itself.
    console.log(`Successfully generated invite link for ${email}. Supabase should send the email.`);

    return NextResponse.json({ message: 'Invitation email process initiated successfully.' }, { status: 200 });

  } catch (err: any) {
    console.error('Error processing invite request:', err);
    // Handle potential JSON parsing errors or other unexpected issues
     if (err instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Rate limit: 5 requests per 15 minutes (strict to prevent email spam)
export const POST = withRateLimit(inviteClientHandler, rateLimitPresets.auth); 