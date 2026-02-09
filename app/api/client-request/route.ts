import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { withRateLimit, rateLimitPresets } from '@/lib/rate-limit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  return NextResponse.json({ message: 'Client request endpoint' });
}

async function clientRequestHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, project_brief } = body;
    
    // Validate required fields
    const missingFields: string[] = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!project_brief) missingFields.push('project brief');
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from("client_requests")
      .insert([{ ...body }])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
    
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json(
      { error: `Server error: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Rate limit: 5 requests per 15 minutes (strict for form submissions)
export const POST = withRateLimit(clientRequestHandler, rateLimitPresets.auth); 