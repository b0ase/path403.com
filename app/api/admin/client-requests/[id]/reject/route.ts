import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Note: Admin auth is enforced by middleware for /api/admin/* routes

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { id } = await params;
  const { review_notes, rejection_reason } = await req.json();
  // Fetch the client request
  const { data: client, error: fetchError } = await supabase.from("client_requests").select("*").eq("id", id).single();
  if (fetchError || !client) {
    return NextResponse.json({ error: "Client request not found" }, { status: 404 });
  }
  // Update status and review info
  const { error: updateError } = await supabase.from("client_requests").update({
    status: "rejected",
    review_notes,
    rejection_reason,
    reviewed_by: process.env.ADMIN_EMAIL || "admin@b0ase.com",
    reviewed_at: new Date().toISOString(),
  }).eq("id", id);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }
  // Prepare mailto link
  const subject = encodeURIComponent("Regarding your project request at B0ASE.COM");
  const body = encodeURIComponent(
    `Hi ${client.name},\n\nThank you for your interest in working with B0ASE. After careful review, we are unable to move forward with your project at this time.\n\nReason: ${rejection_reason || "(please edit this message before sending)"}\n\nWe appreciate your effort and wish you the best of luck with your project.\n\nBest,\nThe B0ASE Team`
  );
  const mailto = `mailto:${client.email}?subject=${subject}&body=${body}`;
  return NextResponse.json({ success: true, mailto });
} 