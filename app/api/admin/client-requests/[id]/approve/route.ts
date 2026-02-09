import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import nodemailer from "nodemailer";

// Note: Admin auth is enforced by middleware for /api/admin/* routes

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { id } = await params;
  const { review_notes } = await req.json();
  // Fetch the client request
  const { data: client, error: fetchError } = await supabase.from("client_requests").select("*").eq("id", id).single();
  if (fetchError || !client) {
    return NextResponse.json({ error: "Client request not found" }, { status: 404 });
  }
  // Update status and review info
  const { error: updateError } = await supabase.from("client_requests").update({
    status: "approved",
    review_notes,
    reviewed_by: process.env.ADMIN_EMAIL || "admin@b0ase.com",
    reviewed_at: new Date().toISOString(),
  }).eq("id", id);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }
  // Insert into clients table if not already present (by email)
  const { data: existingClient } = await supabase.from("clients").select("id").eq("email", client.email).single();
  if (!existingClient) {
    await supabase.from("clients").insert([{
      name: client.name,
      email: client.email,
      website: client.website,
      phone: client.phone,
      logo_url: client.logo_url,
      // Add more fields as needed
    }]);
  }
  // Send approval email
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL || "richardwboase@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD, // Use an app password for Gmail
      },
    });
    await transporter.sendMail({
      from: `B0ASE <${process.env.ADMIN_EMAIL || 'richardwboase@gmail.com'}>`,
      to: client.email,
      subject: "Your project request has been approved!",
      text: `Hi ${client.name},\n\nCongratulations! Your project request has been approved. You can now access your client dashboard at B0ASE.COM.\n\nWe'll be in touch soon with next steps.\n\nBest,\nThe B0ASE Team`,
    });
  } catch (e) {
    // Log but don't fail the approval if email fails
    console.error("Email error:", e);
  }
  return NextResponse.json({ success: true });
} 